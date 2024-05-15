import { userStore } from '@/stores/userStore'
import FileChunk, { type FileType } from '../filesplit/FileChunks'
import { CONFIG } from '@/common/common'
import { _axios } from '../_axios'
import { api } from '@/common/api'
import { encode } from 'base64-arraybuffer-es6'

const _userStore = userStore()

export async function uploadUtil(fileInput: any, fileType: FileType): Promise<string | void> {
  // 切分文件
  const files = (fileInput as unknown as HTMLInputElement).files || []
  if (files.length <= 0 || !_userStore.state.user.id) {
    return
  }
  const _fileName = files[0].name
  const fileInfo = {
    name: _fileName.slice(0, _fileName.lastIndexOf('.')),
    size: files[0].size,
    type: files[0].type,
    extName: _fileName.slice(_fileName.lastIndexOf('.'), _fileName.length)
  }

  const chunksInfo = await FileChunk.createChunks({
    fileType: fileType,
    file: files[0] as File,
    chunkSize: CONFIG.upload.chunkSize
  })
  const vertifyData: {
    data: {
      uploaded: boolean
      existed: boolean
      chunksList: Array<string>
    }
  } = await _axios.post(api.upload.vertify_p[0], {
    type: chunksInfo.fileType,
    fileHash: chunksInfo.fileHash
  })
  if (!vertifyData.data.uploaded) {
    const formDatas = chunksInfo.chunks
      .map(({ file }, index) => ({
        fileHash: chunksInfo.fileHash,
        index,
        chunkHash: `${chunksInfo.fileHash}-${index}`,
        chunk: file,
        size: file.size
      }))
      .filter(({ chunkHash }) => {
        return !vertifyData.data.chunksList.includes(chunkHash)
      })
      .map(async ({ chunk, chunkHash }) => {
        const chunkBuffer = await chunk.arrayBuffer()
        const str = encode(chunkBuffer)
        const formData = {
          chunk: str,
          chunkHash: chunkHash,
          fileName: fileInfo.name,
          fileHash: chunksInfo.fileHash,
          type: chunksInfo.fileType
        }
        return formData
      })

    const max = 6
    const taskPool: any = []
    let index = 0
    while (index < formDatas.length) {
      const formData = await formDatas[index]
      const task = _axios.post(api.upload.upload_p[0], formData)
      task.then(() => {
        taskPool.splice(taskPool.findIndex((item: any) => item === task))
      })
      taskPool.push(task)
      if (taskPool.length === max) {
        await Promise.race(taskPool)
      }
      index++
    }
    await Promise.all(taskPool)
    console.log('完成分片上传')
  }

  let filePath = ''
  if (!vertifyData.data.uploaded || !vertifyData.data.existed) {
    // 执行合并
    const _res = await _axios.post(api.upload.merge_p[0], {
      fileName: fileInfo.name,
      extName: fileInfo.extName,
      fileHash: chunksInfo.fileHash,
      chunkSize: CONFIG.upload.chunkSize,
      type: chunksInfo.fileType
    })
    filePath = (_res.data && _res.data.filePath) || ''
  }
  return filePath && filePath.replace(/\\/g, '/')
}
