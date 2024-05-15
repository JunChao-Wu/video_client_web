<template>
  <div class="examine-container" :key="updatedKey">
    <div class="examine-main">
      <el-table :data="examineData" style="width: 100%">
        <el-table-column prop="createdTime" label="创建时间" width="180" />
        <el-table-column prop="seriesInfo.series_name" label="系列名称" />
        <el-table-column prop="title" label="视频名称" />
        <el-table-column prop="status" label="视频状态">
          <template #default="scope">
            <div>{{ statusMap[scope.row['status']] }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="视频时长" />
        <el-table-column prop="bitrate" label="视频码率" />
        <el-table-column prop="size" label="视频大小" />
        <el-table-column prop="createdUser.user_name" label="上传人员" />
        <el-table-column fixed="right" label="操作" header-align="center" width="100">
          <template #default="scope">
            <el-button link type="primary" size="large" @click.stop="commitOption(scope.row, true)">pass</el-button>
            <el-button v-show="(scope.row['status'] !== 2)" link type="danger" size="large"
              @click.stop="commitOption(scope.row, false)">reject</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="examine-paginator">
      <el-pagination background layout="prev, pager, next" :total="examineTotal" @update:current-page="changePage" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { api } from '@/common/api';
import { _axios } from '@/utils/_axios';
import { onBeforeUpdate, onMounted, ref } from 'vue';

const updatedKey = 0
let oldKey = 0;

const examineData = ref([]);
const examineTotal = ref(0);
let statusMap: {
  [key: string]: string
} = {}
async function getPendingData() {
  const list = await _axios.get(api.examine.list_g[0], {});
  examineData.value = list.data.data;
  examineTotal.value = list.data.total;
  statusMap = list.data.statusMap;
}

async function commitOption(rowData: any, pass: boolean) {
  await _axios.post(api.upload.transform_p[0], {
    videoId: rowData.videoId,
    pass
  });
  getPendingData();
}
function changePage() {
}


onMounted(() => {
  getPendingData()
})
</script>
<style lang="scss" scoped>
.examine-container {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 30px 20px 0 20px;
  width: 100%;
  height: calc(100vh - 60px);

  .examine-main {
    width: 100%;
    height: 100%;
  }

  .examine-paginator {
    padding-bottom: 30px;
    width: 100%;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>