import type { FileType } from '@/utils/filesplit/FileChunks'

export const videoFileType = [
  'audio/mp4',
  'video/mp4',
  'MPEG-4 Audio/Video',
  'video/avi',
  'video/x-ms-wmv',
  'video/x-matroska'
]

export const videoAct = {
  play: 'play',
  pause: 'pause',
  forward: 'forward',
  backward: 'backward',
  dispose: 'dispose',
  muted: 'muted',
  volume: 'volume',
  quality: 'quality'
}

export const fileType: {
  [key: string]: FileType
} = {
  image: 'image',
  video: 'video'
} as const

export const CONFIG = {
  baseURL: import.meta.env.Vite_web_api || '',
  upload: {
    chunkSize: 1024 * 1024
  }
}
