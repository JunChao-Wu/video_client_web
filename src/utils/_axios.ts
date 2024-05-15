import { WEB_API, API_PORT, prefix, version, api } from '../common/api'
import type { Axios } from 'axios'
import axios from 'axios'
import { localCache } from './cache/cache'
import { userStore } from '@/stores/userStore'

export function axiosAll<T>(values: Array<T | Promise<T>>): Promise<T[]> {
  return axios.all(values)
}

export const _axios: Axios = axios.create({
  baseURL: WEB_API + ':' + API_PORT + '/' + prefix + '/' + version,
  timeout: 30000
})

_axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'

// 请求拦截器
_axios.interceptors.request.use(
  (config) => {
    const user = localCache.getCache('user')
    if (user && user.id) {
      config.headers.set('user', user.id)
    }
    const token = localCache.getCache('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (err) => {
    console.log(err)
    return Promise.reject(err)
  }
)

// 响应拦截器
_axios.interceptors.response.use(
  (res) => {
    return res.data
  },
  async (err) => {
    if (err.response && err.response.data) {
      const _store = userStore()
      const errData = err.response.data
      if (errData.statusCode === 401 || errData.code === 401) {
        const rt = localCache.getCache('refreshToken')
        if (!rt) {
          ElMessage.error('登录过期, 请重新登录')
        }
        const tokenRes = await _axios.get(api.auth.rt_g[0], {
          params: {
            rt: rt
          }
        })
        if (tokenRes && (tokenRes as any).succ) {
          const originRequest = err.config
          const { token, refreshToken } = tokenRes.data
          localCache.setCache('token', token)
          localCache.setCache('refreshToken', refreshToken)
          return _axios.request(originRequest)
        } else {
          ElMessage.error('登录过期, 请重新登录')
          localCache.clearCache()
          _store.state.user = {
            id: '',
            userName: '',
            email: ''
          }
        }
      } else {
        console.log('🚀 ~ 暂无处理:')
        // ElMessage.error('请重新登录')
        // ElMessage.error(err.response.statusText)
      }
    }
    return Promise.reject(err)
  }
)
