import { api } from '@/common/api'
import { redirectGuid } from './util/routeRedirect'
import { _axios } from '@/utils/_axios'

export async function checkRole(): Promise<boolean> {
  let pass = false
  const res: any = await _axios.get(api.auth.checkRole_g[0])
  if (res && res.succ && res.data.pass) {
    pass = true
  }
  if (!pass) {
    // 重定向到首页
    redirectGuid()
  }
  return pass
}
