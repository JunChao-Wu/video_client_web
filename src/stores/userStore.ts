import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { _axios } from '@/utils/_axios'
import { api } from '@/common/api'
import { localCache } from '@/utils/cache/cache'

export const userStore = defineStore('userStore', () => {
  const user = localCache.getCache('user')
  const token = localCache.getCache('token')
  const refreshToken = localCache.getCache('refreshToken')
  const state = reactive({
    user: {
      id: (user && user.id) || '',
      userName: (user && user.userName) || '',
      email: (user && user.email) || ''
    },
    token: token || '',
    refreshToken: refreshToken || ''
  })
  localCache.setCache('user', user || {}, { watch: true })

  async function login(formData: { userName: string; password: string }) {
    const data = await _axios.post(api.auth.login_p[0], {
      userName: formData.userName,
      password: formData.password
    })
    if (data.data.id) {
      const _data = data.data
      state.user.id = _data.id
      state.user.userName = _data.userName
      state.user.email = _data.email
      state.token = _data.token
      state.refreshToken = _data.refreshToken
      localCache.setCache(
        'user',
        {
          id: _data.id,
          userName: _data.userName,
          email: _data.email
        },
        { watch: true }
      )
      localCache.setCache('token', _data.token)
      localCache.setCache('refreshToken', _data.refreshToken)
    }
  }

  return { state, login }
})
