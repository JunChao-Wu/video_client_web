<template>
  <div class="series-add-main">
    <div class="cover-container">
      <input type="file" name="选择文件" id="imageInput" ref="ImageInput" @change="getFileinfo" hidden>
      <div class="chooseFileIcon" v-show="(!imageURL)" @click="chooseFile">
        +
      </div>
      <img :class="imgClass" :src="imageURL" v-show="(!!imageURL)">
      <el-button class="reChoose" type="danger" v-show="(!!imageURL)" @click="clearImage">重新选择</el-button>
    </div>
    <div class="series-add-container">
      <el-form ref="formRef" :model="seriesConfig" label-width="auto" style="max-width: 600px;min-width: 300px;"
        size="large">
        <el-form-item label="名称">
          <el-input v-model="seriesConfig.seriesName" />
        </el-form-item>
        <el-form-item label="地区">
          <el-input v-model="seriesConfig.region" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="seriesConfig.seriesType" placeholder="选择类型">
            <el-option v-for="(item, index) in seriesTypeList" :label="item.label" :value="item.value" :key="index" />
          </el-select>
        </el-form-item>
        <el-form-item label="别名">
          <el-input v-model="seriesConfig.seriesAlias" />
        </el-form-item>
        <el-form-item label="原著">
          <el-input v-model="seriesConfig.originalWorker" />
        </el-form-item>
        <el-form-item label="公司">
          <el-input v-model="seriesConfig.company" />
        </el-form-item>
        <el-form-item label="时间">
          <el-input v-model="seriesConfig.premiereDate" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="seriesConfig.status" placeholder="选择类型">
            <el-option v-for="(item, index) in seriesStatusList" :label="item.label" :value="item.value" :key="index" />
          </el-select>
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="seriesConfig.introduction" autosize maxlength="1000" style="width: 100%" type="textarea"
            placeholder="--简介--" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">创建</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { _axios } from '@/utils/_axios';
import { computed, onBeforeUpdate, reactive, ref } from 'vue';
import { uploadUtil } from '@/utils/uploadUtil/UploadUtil';
import { fileType } from '@/common/common';
import { api } from '@/common/api';
import router from '@/router';

const seriesTypeList = [
  { label: "unkown", value: 0 },
  { label: "TV", value: 1 },
  { label: "OVA", value: 2 },
  { label: "Film", value: 3 },
]
const seriesStatusList = [
  { label: "未开播", value: 0 },
  { label: "连载", value: 1 },
  { label: "已完结", value: 2 },
]

const seriesConfig = reactive({
  seriesName: '',
  region: '',
  seriesType: 0,
  seriesAlias: '',
  originalWorker: '',
  company: '',
  premiereDate: '',
  status: 0,
  introduction: '',
})
const ImageInput = ref(null)
const imageURL = ref("")
const formRef = ref(null)
const imgClass = computed(() => ({
  'cover-height': imgSizes.width < imgSizes.height,
  'cover-width': imgSizes.width >= imgSizes.height
}))
const imgSizes = reactive({
  width: 0,
  height: 0
})

function redirect() {
  router.push({ name: "mySeries" })
}

function getImgSize(): Promise<{ width: number, height: number }> {
  return new Promise((resolve) => {
    let imgOBj = new Image()
    imgOBj.src = imageURL.value
    imgOBj.onload = () => {
      resolve(
        {
          width: imgOBj.width,
          height: imgOBj.height
        }
      )
    }
  })
}

function isImage(type: string) {
  return /image\/\w+/.test(type);
}
function chooseFile(): void {
  if (ImageInput.value) {
    (ImageInput.value as HTMLElement).click();
  }
}
async function getFileinfo(event: Event): Promise<void> {
  const files = (event.target as HTMLInputElement).files || [];
  if (files.length <= 0) {
    // 显示选择文件的错误信息
    return;
  }
  const _fileInfo = files[0];
  const imgSrc = URL.createObjectURL(_fileInfo);
  const { name, size, type } = _fileInfo;

  if (!isImage(type)) {
    console.log("请选择图片")
    return;
  }
  imageURL.value = imgSrc;
  const _imgSize = await getImgSize()
  imgSizes.width = _imgSize.width || 0
  imgSizes.height = _imgSize.height || 0
}
function clearImage() {
  imageURL.value = ''
}
function restForm() {
  seriesConfig.seriesName = '';
  seriesConfig.seriesAlias = '';
  seriesConfig.region = ''
  seriesConfig.originalWorker = ''
  seriesConfig.company = ''
  seriesConfig.premiereDate = ''
  seriesConfig.seriesType = 0
  seriesConfig.status = 0
  seriesConfig.introduction = ''
}
async function onSubmit() {
  const filePath = await uploadUtil(ImageInput.value, fileType.image);
  const formData: {
    seriesName: string
    region: string
    seriesType: number
    seriesAlias: string
    originalWorker: string
    company: string
    premiereDate: number
    targetPath?: string
    status: number
    introduction: string
  } = {
    seriesName: '',
    region: '',
    seriesType: 0,
    seriesAlias: '',
    originalWorker: '',
    company: '',
    premiereDate: 0,
    status: 0,
    introduction: '',
  };
  formData.seriesName = seriesConfig.seriesName;
  formData.region = seriesConfig.region;
  formData.seriesType = seriesConfig.seriesType;
  formData.seriesAlias = seriesConfig.seriesAlias;
  formData.originalWorker = seriesConfig.originalWorker;
  formData.company = seriesConfig.company;
  formData.introduction = seriesConfig.introduction;
  formData.premiereDate = +seriesConfig.premiereDate || 99999999;
  if (filePath) {
    formData.targetPath = filePath
  }
  formData.status = seriesConfig.status;
  try {
    await _axios.post(api.series.add_p[0], formData);
    setTimeout(() => {
      restForm();
      clearImage();
    }, 500)
    ElMessage.success("创建成功");
  } catch (error) {
    console.log("🚀 ~ onSubmit ~ error:", error)
  }

  // redirect();
}

onBeforeUpdate(() => {
  // if (updatedKey.value !== oldKey.value) {
  //   oldKey.value = updatedKey.value
  // }
})

</script>
<style lang="scss" scoped>
$chooseFontSize: 5rem;

@keyframes chooseFileAnimation {
  0% {
    width: $chooseFontSize;
    height: $chooseFontSize;
  }

  50% {
    $hoverFontSize: 1.2 * $chooseFontSize;
    width: $hoverFontSize;
    height: $hoverFontSize;
    line-height: 0.78 * $hoverFontSize;
  }

  100% {
    width: $chooseFontSize;
    height: $chooseFontSize;
  }
}

.series-add-main {
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: calc(100vh - 60px);

  .cover-container {
    display: flex;
    position: relative;
    width: 50%;
    height: 32%;
    justify-content: center;
    align-items: center;
    padding-right: 10px;

    .reChoose {
      position: absolute;
      bottom: -3rem;
    }

    .cover-width {
      width: 100%;
      height: auto;
    }

    .cover-height {
      width: auto;
      height: 100%;
    }


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
  }

  .series-add-container {
    padding-left: 10px;
  }



}
</style>