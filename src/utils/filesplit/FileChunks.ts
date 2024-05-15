import SparkMD5 from 'spark-md5'

const IMG_FORMATS = ['bmp', 'dng', 'jpeg', 'jpg', 'mpo', 'tif', 'tiff', 'webp', 'pfm', 'png']
const VID_FORMATS = ['asf', 'avi', 'gif', 'm4v', 'mkv', 'mov', 'mp4', 'mpeg', 'mpg', 'ts', 'wmv']

const staticChunkSize = 1024 * 1024

export type FileType = 'image' | 'video' | 'outRange'

interface Config {
  chunkSize?: number
  fileType: FileType
  file: File
}

interface ChunkInfo {
  fileType: FileType
  fileHash: string
  chunks: Array<{ file: Blob }>
}

class FileChunk {
  private config: Config
  constructor(config: Config) {
    this.config = config
    this.config.chunkSize = config.chunkSize || 1024 * 1024
  }

  static async createChunks(config: Config): Promise<ChunkInfo> {
    const fileChunk = new FileChunk(config)
    const _fileType = fileChunk.pointFileType()
    if (_fileType != config.fileType) {
      return {
        fileType: _fileType,
        fileHash: '',
        chunks: []
      }
    }
    const fileChunks = fileChunk.createFileChunks()
    const fileHash = await fileChunk.calculateHash(fileChunks)
    return {
      fileType: config.fileType,
      fileHash: fileHash,
      chunks: fileChunks
    }
  }

  // 判断文件类型
  private pointFileType(): FileType {
    const fileName = this.config.file.name
    if (IMG_FORMATS.includes(fileName.split('.').slice(-1)[0])) {
      return 'image'
    }
    if (VID_FORMATS.includes(fileName.split('.').slice(-1)[0])) {
      return 'video'
    }
    return 'outRange'
  }

  // 创建文件分片
  private createFileChunks(): Array<{ file: Blob }> {
    const file = this.config.file
    console.log('🚀 ~ 正在创建分片:')
    const fileChunkList: Array<{ file: Blob }> = []
    let cur = 0
    while (cur < file.size) {
      fileChunkList.push({
        file: file.slice(cur, cur + (this.config.chunkSize || staticChunkSize))
      })
      cur += this.config.chunkSize || staticChunkSize
    }
    console.log(`🚀 ~ 创建分片完成: 共 ${fileChunkList.length}`)
    return fileChunkList
  }

  // 计算文件hash
  private calculateHash(fileChunks: Array<{ file: Blob }>): Promise<string> {
    console.log('🚀 ~ file: App.vue:127 ~ calculateHash ~ 正在计算hash:')
    return new Promise((resolve) => {
      const spark = new SparkMD5.ArrayBuffer()
      const chunks: Blob[] = []

      fileChunks.forEach((chunk, index) => {
        if (index === 0 || index === fileChunks.length - 1) {
          chunks.push(chunk.file)
        } else {
          chunks.push(chunk.file.slice(0, 2))
          chunks.push(
            chunk.file.slice(
              (this.config.chunkSize || staticChunkSize) / 2,
              (this.config.chunkSize || staticChunkSize) / 2 + 2
            )
          )
          chunks.push(
            chunk.file.slice((this.config.chunkSize || staticChunkSize) - 2, this.config.chunkSize)
          )
        }
      })
      const reader = new FileReader()
      reader.readAsArrayBuffer(new Blob(chunks))
      reader.onload = (e: Event) => {
        spark.append((e?.target as any)?.result as ArrayBuffer)
        resolve(spark.end())
      }
    })
  }
}

// declare const fileChunk: FileChunk;

export default FileChunk
