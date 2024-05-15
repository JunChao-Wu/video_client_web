<template>
  <div class="my-series-container" :key="updatedKey">
    <div class="my-series-menue">
      <ul class="my-series-menue-ul">
        <li class="my-series-menue-li">
          <button class="menue-btn-add" @click="redirectToAdd">
          </button>
        </li>
      </ul>
    </div>
    <div class="my-series-main">
      <el-table :data="mySeriesData" style="width: 100%">
        <el-table-column prop="createdTime" label="创建时间" width="120">
          <template #default="scope">
            <span>{{ convertTime(scope.row.createdTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="coverPath" header-align="center" label="封面">
          <template #default="scope">
            <div v-if="scope.row.isCanEdit">
              <input type="file" name="选择文件" id="imageInput" ref="ImageInput" @change="getFileinfo" hidden>
              <div class="cover-add-container">
                <div class="cover-add-main">
                  <div class="cover-add-icon" @click="chooseFile">
                    +
                  </div>
                </div>
                <img style="width: auto; height: 85px;"
                  :src="(imageURL ? imageURL : generateStaticUrl(scope.row['coverPath']))">
              </div>
            </div>
            <div v-if="!scope.row.isCanEdit">
              <div class="cover-add-container">
                <img style="width: auto; height: 85px;" :src="generateStaticUrl(scope.row['coverPath'])" alt="preView">
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="seriesName" label="名称">
          <template #default="scope">
            <div v-if="!scope.row.isCanEdit">
              {{ scope.row["seriesName"] }}
            </div>
            <div v-if="scope.row.isCanEdit">
              <el-input class="edit-inpput" v-model="seriesConfig.seriesName" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="alias" label="别名">
          <template #default="scope">
            <div v-if="!scope.row.isCanEdit">
              {{ scope.row["alias"] }}
            </div>
            <div v-if="scope.row.isCanEdit">
              <el-input class="edit-inpput" v-model="seriesConfig.alias" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="region" label="地区">
          <template #default="scope">
            <div v-if="!scope.row.isCanEdit">
              {{ scope.row["region"] }}
            </div>
            <div v-if="scope.row.isCanEdit">
              <el-input class="edit-inpput" v-model="seriesConfig.region" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型">
          <template #default="scope">
            <div v-if="!scope.row.isCanEdit">
              {{ seriesTypeMap[scope.row["type"]] }}
            </div>
            <div v-if="scope.row.isCanEdit">
              <el-select v-model="seriesConfig.type" placeholder="选择类型">
                <el-option v-for="(item, index) in seriesTypeList" :label="item.label" :value="item.value"
                  :key="index" />
              </el-select>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="originalWorker" label="原著">
          <template #default="scope">
            <div v-if="!scope.row.isCanEdit">
              {{ scope.row["originalWorker"] }}
            </div>
            <div v-if="scope.row.isCanEdit">
              <el-input class="edit-inpput" v-model="seriesConfig.originalWorker" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="company" label="公司">
          <template #default="scope">
            <div v-if="!scope.row.isCanEdit">
              {{ scope.row["company"] }}
            </div>
            <div v-if="scope.row.isCanEdit">
              <el-input class="edit-inpput" v-model="seriesConfig.company" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <div v-if="!scope.row.isCanEdit">
              {{ seriesStatusMap[scope.row["status"]] }}
            </div>
            <div v-if="scope.row.isCanEdit">
              <el-select v-model="seriesConfig.status" placeholder="选择类型">
                <el-option v-for="(item, index) in seriesStatusList" :label="item.label" :value="item.value"
                  :key="index" />
              </el-select>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="premiereDate" label="开播时间" />
        <el-table-column prop="createdUserId" label="上传人员" />
        <el-table-column class-name="my-series-options" fixed="right" label="操作" header-align="center" width="120">
          <template #default="scope">
            <div v-if="!scope.row.isCanEdit" class="column-options-container">
              <el-button link type="primary" size="large" @click.stop="handleEdit(scope.row, true)">edit</el-button>
              <el-button link type="primary" size="large" @click.stop="toUploadPath(scope.row)">upload</el-button>
            </div>
            <div v-if="scope.row.isCanEdit" class="column-options-container">
              <el-button link type="primary" size="large" @click.stop="commitOption(scope.row)">save</el-button>
              <el-button link type="danger" size="large" @click.stop="handleEdit(scope.row, false)">cancel</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="my-series-paginator">
      <el-pagination background layout="prev, pager, next" :total="total" @update:current-page="changePage" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { _axios } from '@/utils/_axios';
import { onBeforeUpdate, onMounted, reactive, ref } from 'vue';
import { uploadUtil } from '@/utils/uploadUtil/UploadUtil';
import { fileType } from '@/common/common';
import { api } from '@/common/api';
import { generateStaticUrl } from '@/utils/generateStaticUrl';
import router from '@/router';
import { convertTime } from '@/utils/timeUtil/timeUtil';

const seriesTypeList = [
  { label: "unkown", value: 0 },
  { label: "TV", value: 1 },
  { label: "OVA", value: 2 },
  { label: "Film", value: 3 },
]
const seriesTypeMap: {
  [key: string]: string
} = {
  "0": "unknown",
  "1": "TV",
  "2": "OVA",
  "3": "Film",
}

const seriesStatusList = [
  { label: "未开播", value: 0 },
  { label: "连载", value: 1 },
  { label: "已完结", value: 2 },
]
const seriesStatusMap: {
  [key: string]: string
} = {
  "0": "未开播",
  "1": "连载",
  "2": "已完结",
}
const imageURL = ref('')
const ImageInput = ref(null)
const updatedKey = ref(0);
let oldKey = 0;
const mySeriesData = ref([])
const total = ref(0)
const seriesConfig = reactive({
  seriesId: 0,
  seriesName: '',
  region: '',
  type: 0,
  alias: '',
  originalWorker: '',
  company: '',
  premiereDate: '',
  status: 0,
  coverPath: '',
})

function toUploadPath(rowData: any) {
  router.push({ name: "upload", state: { seriesId: rowData.seriesId } })
}

function redirectToAdd() {
  router.push({ name: "seriesAdd" })
}
function clearImg() {
  imageURL.value = ''
}
function handleEdit(rowData: any, isCanEdit: boolean) {
  console.log("🚀 ~ edit ~ edit:")
  // 切换可编辑模式
  rowData.isCanEdit = isCanEdit;
  if (!isCanEdit) {
    clearImg()
    return;
  }
  // 将当行记录的数据写入seriesConfig
  console.log("🚀 ~ handleEdit ~ rowData:", rowData)
  seriesConfig.seriesId = rowData.seriesId;
  seriesConfig.seriesName = rowData.seriesName;
  seriesConfig.region = rowData.region;
  seriesConfig.alias = rowData.alias;
  seriesConfig.originalWorker = rowData.originalWorker;
  seriesConfig.company = rowData.company;
  seriesConfig.type = rowData.type;
  seriesConfig.status = rowData.status;
  seriesConfig.coverPath = rowData.coverPath;
  seriesConfig.premiereDate = rowData.premiereDate;
}

async function getSeriesList() {
  const res = await _axios.get(api.series.list_g[0], {
    params: {
      page: 1,
      pageSize: 20,
    }
  })
  console.log("🚀 ~ getSeriesList ~ res:", res)
  const count = res && res.data && res.data.total;
  const list = res && res.data && res.data.data;
  return { count, list };
}

function chooseFile(): void {
  if (ImageInput.value) {
    (ImageInput.value as HTMLElement).click();
  }
}
function isImage(type: string) {
  return /image\/\w+/.test(type);
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
}

function changePage() { }

async function commitOption(rowData: any) {
  const filePath = await uploadUtil(ImageInput.value, fileType.image);
  // console.log("🚀 ~ commitOption ~ rowData:", rowData)
  // console.log("🚀 ~ commitOption ~ seriesConfig:", seriesConfig)
  const formData: {
    seriesId: number
    seriesName: string
    region: string
    type: number
    alias: string
    originalWorker: string
    company: string
    premiereDate: number
    coverPath?: string
    status: number
  } = {
    seriesId: 0,
    seriesName: '',
    region: '',
    type: 0,
    alias: '',
    originalWorker: '',
    company: '',
    premiereDate: 0,
    status: 0
  };
  formData.seriesId = seriesConfig.seriesId
  formData.seriesName = seriesConfig.seriesName
  formData.region = seriesConfig.region
  formData.type = seriesConfig.type
  formData.alias = seriesConfig.alias
  formData.originalWorker = seriesConfig.originalWorker
  formData.company = seriesConfig.company
  formData.premiereDate = +seriesConfig.premiereDate
  formData.status = seriesConfig.status
  formData.coverPath = seriesConfig.coverPath
  if (filePath) {
    formData.coverPath = filePath
  }
  await _axios.put(api.series.update_p[0], formData)
  ElMessage.success("修改成功");
  handleEdit(rowData, false)
  updatedKey.value += 1;
}


onMounted(async () => {
  console.log("🚀 ~ onMounted ~ onMounted:")
  // 挂载时 可以直接获取
  // await getSeriesList()
  // 挂载时 也可以直接触发组件更新来获取数据(多一次hook，少写点代码)
  updatedKey.value += 1;
})
onBeforeUpdate(async () => {
  console.log("🚀 ~ onBeforeUpdate ~ onBeforeUpdate:")
  if (updatedKey.value !== oldKey) {
    const { count, list } = await getSeriesList();
    total.value = count
    mySeriesData.value = list
    oldKey = updatedKey.value;
  }
})

</script>
<style lang="scss" scoped>
.my-series-container {
  padding: 0 20px;

  .my-series-menue {
    padding-top: 10px;
    width: 100%;

    .my-series-menue-ul {
      display: flex;
      flex-direction: row-reverse;

      .my-series-menue-li {
        padding: 0 10px;

        .menue-btn-add {
          width: 2rem;
          height: 2rem;
          border: none;
          border-radius: 1rem;
          background-color: var(--normal-c-bg-lightblue);
          transition: all 0.3s ease-in-out;
          color: #fff;
          font-size: 1rem;
          font-weight: 600;

          &::after {
            content: "+";
          }

          &:hover {
            width: 5rem;
          }

        }
      }
    }
  }

  .my-series-main {
    padding: 10px 0 0 0;
    height: auto;
    min-height: calc(100vh - 12.7rem);

    .cover-add-container {
      display: flex;
      justify-content: center;
      align-items: center;

      .cover-add-main {
        cursor: pointer;
        width: 100%;
        height: 100%;
        opacity: 0.5;
        border: 1px dotted var(--base-c-dark);
        position: absolute;
        background-color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;

        .cover-add-icon {
          font-size: 2rem;
          font-weight: 400;
        }
      }
    }

    .edit-inpput {}

    .column-options-container {
      display: flex;
      justify-content: center;
      align-items: center;
    }

  }



  .my-series-paginator {
    padding-bottom: 30px;
    width: 100%;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>