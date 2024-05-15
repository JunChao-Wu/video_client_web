export const prefix = 'service'
export const version = 'v1'
// 发请求前补全以上参数

export const api = {
  upload: {
    upload_p: ['upload', 'post'],
    merge_p: ['upload/merge', 'post'],
    vertify_p: ['upload/vertify', 'post'],
    transform_p: ['upload/transform', 'post']
  },
  user: {
    login_p: ['user/login', 'post']
  },
  auth: {
    login_p: ['auth/login', 'post'],
    getToken: ['auth/token', 'get'],
    rt_g: ['auth/token/rt', 'get'],
    checkRole_g: ['auth/checkRole', 'get']
  },
  examine: {
    list_g: ['examine', 'get']
  },
  series: {
    list_g: ['series', 'get'],
    mime_g: ['series/mime', 'get'],
    add_p: ['series', 'post'],
    update_p: ['series', 'put'],
    getNames_g: ['series/names', 'get'],
    info_g: ['series/info', 'get']
  }
}
let testUrl = 'http://192.168.137.133'
testUrl = ''

export const WEB_API = import.meta.env.VITE_WEB_API || testUrl || 'http://127.0.0.1'
export const API_PORT = import.meta.env.VITE_API_PORT || '3000'
