import { API_PORT, WEB_API } from '@/common/api'

export function generateStaticUrl(path: string) {
  if (!path) {
    return
  }
  return `${WEB_API}:${API_PORT}/${path}`
}
