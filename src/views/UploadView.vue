<template>
  <div class="upload-container">
    <div class="series-info-container">
      <div class="series-info-main">
        <h1 class="series-info-title">{{ seriesInfo.seriesName }}</h1>
        <div class="serier-info-introduction">
          简介: {{ seriesInfo.introduction }}
        </div>
        <div class="videos-sequence">
          <div>已上传: {{ videosList.length }}</div>
          <ul class="videos-sequence-list">
            <li v-for="(item, index) in videosList" :key="index" @click="toPlayer(item)">
              {{ item["sequence"] }}
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="upload-main">
      <input type="file" name="选择文件" id="fileinput" ref="fileInput" @change="getFileinfo" hidden>
      <div class="chooseFileIcon" @click="chooseFile">
        +
      </div>
      <div class="show-file-info">
        <span>
          <i>文件名：</i>
          <div class="info-item">
            <input class="name-input" type="text" name="fileName" v-model="fileName">
          </div>
        </span>
        <span><i>文件序列：</i>
          <div class="info-item">
            <input class="name-input" type="text" name="sequence" v-model="sequence">
          </div>
        </span>
        <span><i>文件大小：</i>
          <div class="info-item">{{ transiformFileSize }}</div>
        </span>
        <span><i>文件类型：</i>
          <div class="info-item">{{ fileInfo.type }}</div>
        </span>
        <span>
          <button class="btn-file" type="button" @click="uploadVideo">上传</button>
        </span>
      </div>
    </div>
  </div>

</template>
<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { api } from '../common/api';
import { _axios } from '../utils/_axios';
import FileChunk from '../utils/filesplit/FileChunks';
import { videoFileType, CONFIG } from '../common/common';
import { encode } from 'base64-arraybuffer-es6';
import { userStore } from '@/stores/userStore'

const seriesId = ref(0)
const seriesInfo = reactive({
  seriesName: "",
  seriesId: 0,
  introduction: "",
})
const videosList = ref([])

const _userStore = userStore();

const fileInput = ref(null)
const fileName = ref('')
const sequence = ref('')
const fileInfo = ref({ name: "", size: 0, type: "", extName: "" })

const transiformFileSize = computed((): String => {
  return (fileInfo.value.size / 1024 / 1024).toFixed(2) + " M";
});

function toPlayer(item: any) {
  console.log("🚀 ~ toPlayer ~ item:", item)
}

function chooseFile(): void {
  if (fileInput.value) {
    (fileInput.value as HTMLElement).click();
  }
}
function getFileinfo(event: Event): void {
  const files = (event.target as HTMLInputElement).files || [];
  if (files.length <= 0) {
    // 显示选择文件的错误信息
    return;
  }
  const _fileInfo = files[0];
  const { name, size, type } = _fileInfo;
  if (!videoFileType.includes(type)) {
    console.log("请选择视频文件")
    return;
  }

  fileInfo.value.name = name.slice(0, name.lastIndexOf("."));
  fileInfo.value.size = size;
  fileInfo.value.type = type;
  fileInfo.value.extName = name.slice(name.lastIndexOf("."), name.length);
  fileName.value = fileInfo.value.name;
}

async function uploadVideo(): Promise<void> {
  console.log("🚀 ~ uploadVideo ~ uploadVideo:")
  // 切分文件
  const files = (fileInput.value as unknown as HTMLInputElement).files || [];
  if (files.length <= 0 || !_userStore.state.user.id) {
    return;
  }
  const chunksInfo = await FileChunk.createChunks({
    fileType: "video",
    file: files[0] as File,
    chunkSize: CONFIG.upload.chunkSize,
  });
  const vertifyData: {
    data: {
      uploaded: boolean
      existed: boolean
      chunksList: Array<string>
    }
  } = await _axios.post(api.upload.vertify_p[0], { type: chunksInfo.fileType, fileHash: chunksInfo.fileHash });
  let formDatas: any[] = [];
  if (!vertifyData.data.uploaded) {
    formDatas = chunksInfo.chunks.map(({ file }, index) => ({
      fileHash: chunksInfo.fileHash,
      index,
      chunkHash: `${chunksInfo.fileHash}-${index}`,
      chunk: file,
      size: file.size,
    }))
      .filter(({ chunkHash }) => {
        return !vertifyData.data.chunksList.includes(chunkHash);
      })
      .map(async ({ chunk, chunkHash }) => {
        const chunkBuffer = await chunk.arrayBuffer();
        const str = encode(chunkBuffer);
        let formData = {
          chunk: str,
          chunkHash: chunkHash,
          fileName: fileName.value,
          fileHash: chunksInfo.fileHash,
          type: chunksInfo.fileType,
        };
        return formData;
      })

    const max = 5;
    const taskPool: any = [];
    let index = 0;
    // let count = 0;
    while (index < formDatas.length) {
      const formData = await formDatas[index];
      const task = _axios.post(api.upload.upload_p[0], formData);
      task.then(() => {
        taskPool.splice(taskPool.findIndex((item: any) => item === task));
      });
      taskPool.push(task);
      if (taskPool.length === max) {
        await Promise.race(taskPool);
      }
      index++;
      // count = +(index / formDatas.length * 100).toFixed(1);
      // if (!(count % 5)) {
      //   console.log(`🚀 ~ percentage: ${count}%`);
      // }
    }
    await Promise.all(taskPool);
    console.log("完成分片上传")
  }

  if (!vertifyData.data.uploaded || !vertifyData.data.existed) {
    // 执行合并
    await _axios.post(api.upload.merge_p[0], {
      fileName: fileName.value,
      extName: fileInfo.value.extName,
      fileHash: chunksInfo.fileHash,
      chunkSize: CONFIG.upload.chunkSize,
      type: chunksInfo.fileType,
      seriesId: seriesInfo.seriesId,
      sequence: +sequence.value,
    });
  }
}

watch(seriesId, async (newVal, oldValue) => {
  if (!newVal) {
    seriesInfo.introduction = ""
    seriesInfo.seriesName = ""
    seriesInfo.seriesId = 0

    videosList.value = []
    return;
  }
  const res = await _axios.get(api.series.info_g[0], {
    params: {
      seriesId: newVal
    }
  })
  if (res && res.data) {
    const info = res.data.info
    const videos = res && res.data && res.data.videos
    seriesInfo.seriesName = info.seriesName;
    seriesInfo.seriesId = info.seriesId;
    seriesInfo.introduction = info.introduction;
    videosList.value = videos
  }
})

onMounted(async () => {
  seriesId.value = history.state.seriesId
})


</script>

<style scoped lang="scss">
$chooseFontSize: 5rem;

@keyframes chooseFileAnimation {
  0% {
    width: $chooseFontSize;
    height: $chooseFontSize;
    // transform: scale(1);
  }

  50% {
    $hoverFontSize: 1.2 * $chooseFontSize;
    width: $hoverFontSize;
    height: $hoverFontSize;
    line-height: 0.78 * $hoverFontSize;
    // transform: scale(1.25);
  }

  100% {
    width: $chooseFontSize;
    height: $chooseFontSize;
    // transform: scale(1);
  }
}

.upload-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 5rem);
  width: 100%;

  .series-info-container {
    box-sizing: border-box;
    position: absolute;
    top: 60px;
    height: 30vh;
    width: 100%;
    background-color: rgba($color: #000000, $alpha: 0.05);
    padding: 30px 30px 0 30px;

    .series-info-main {
      .series-info-title {}

      .serier-info-introduction {
        padding-bottom: 20px;
      }

      .videos-sequence-list {
        display: flex;
        padding: 10px 0;

        .videos-sequence-item {
          width: 1rem;
          text-align: center;
          padding: 0 10px;
          margin: 0 5px;
          border: 1px solid #000;
          border-radius: 5px;
          cursor: pointer;
        }
      }
    }
  }

  .upload-main {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    flex-direction: column;

    .chooseFileIcon {
      box-sizing: border-box;
      width: $chooseFontSize;
      height: $chooseFontSize;
      line-height: 0.78 * $chooseFontSize;
      text-align: center;
      font-size: $chooseFontSize;
      color: var(--base-c-dark);
      opacity: 0.5;
      border: 0.2rem dotted var(--base-c-dark);
      cursor: pointer;

      &:hover {
        animation: chooseFileAnimation 0.3s linear 0s 1 alternate;

      }
    }

    .show-file-info {
      font-size: 1.2rem;
      position: absolute;
      // background-color: var(--base-c-dark);
      width: 50%;
      top: calc(50% + $chooseFontSize * 1.5);
      display: flex;
      flex-direction: column;

      span {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0.75rem;

        i {
          width: 10rem;
          text-align: right;
          font-style: normal;
          font-size: 1.25rem;
        }

        .info-item {
          position: relative;
          width: 100%;
          padding-left: 30px;
          font-size: 1.15rem;
          line-height: 3rem;
          height: 3rem;

          .name-input {
            box-sizing: border-box;
            display: block;
            background-color: var(--base-c-white-soft);
            height: 100%;
            width: 100%;
            border: none;
            border-bottom: 1.5px solid var(--normal-c-line-indigo);
          }

          .info-series-select {
            position: relative;
            width: 100%;
            height: 100%;

            .info-series-input {
              display: block;
              height: 100%;
              box-sizing: border-box;
              border: none;
              border-bottom: 1.5px solid var(--normal-c-line-indigo);
              width: 100%;
              background-color: var(--base-c-white-soft);
            }

            .info-series-ul {
              width: 100%;
              position: absolute;
              top: calc(3rem + 6px);
              background-color: #fff;
              border-radius: 8px;
              z-index: 11;

              .info-series-li {
                cursor: pointer;
                padding-left: 20px;
                border-radius: 8px;
                opacity: 0.5;

                &:hover {
                  background-color: var(--el-menu-active-color);
                }
              }
            }
          }
        }
      }

      .btn-file {
        width: 4rem;
        height: 3rem;
      }
    }
  }
}
</style>
