// hh:mm:ss
export function convertDuration(seconds: number) {
  const ss = seconds % 60
  const mm = Math.floor(seconds / 60)
  const hh = Math.floor(seconds / (60 * 24))
  const _ss = ss % 10 > 0 ? ss + '' : `0${ss}`
  const _mm = mm % 10 > 0 ? mm + '' : `0${mm}`
  const _hh = hh % 10 > 0 ? hh + '' : `0${hh}`
  const resList = [_hh, _mm, _ss]
  return resList.join(':')
}

// YYYY-MM-DD / YYYY-MM-DD HH:mm:ss
export function convertTime(time: number) {
  const timeStr = time + ''
  const YYYY = timeStr.slice(0, 4)
  const MM = timeStr.slice(4, 6)
  const DD = timeStr.slice(6, 8)
  return `${YYYY}-${MM}-${DD}`
}
