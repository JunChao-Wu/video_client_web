<script setup lang="ts">
import SeriesItem from '@/components/series/SeriesItem.vue';
import { api } from '@/common/api';
import { _axios } from '@/utils/_axios';
import { onBeforeUpdate, onMounted, ref } from 'vue';
const updatedKey = ref(0)
let oldKey = 0;

const total = ref(0);
const seriesList = ref([])
const statusMap = ref({})

function changePage() {
  console.log("🚀 ~ changePage:", changePage)
}
async function getSeriesLsit() {
  const res = await _axios.get(api.series.list_g[0], {
    params: {
      page: 1,
      pageSize: 12,
    }
  });
  const count = res && res.data && res.data.total;
  const list = res && res.data && res.data.data;
  const statusObj = res && res.data && res.data.statusMap;
  return { count, list, statusObj };
}

onMounted(() => {
  updatedKey.value += 1;
})
onBeforeUpdate(async () => {
  if (updatedKey.value !== oldKey) {
    const { count, list, statusObj } = await getSeriesLsit();
    total.value = count;
    seriesList.value = list;
    statusMap.value = statusObj;
    oldKey = updatedKey.value;
  }
})
</script>

<template>
  <div class="series-main" :key="updatedKey">
    <div class="series-main-container">
      <div class="series-container">
        <series-item v-for="(item) in seriesList" :series-data="item" :status-map="statusMap"
          :key="item['series_id']" />
      </div>
    </div>
    <div class="paginator-container">
      <el-pagination background layout="prev, pager, next" :total="total" @update:current-page="changePage" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.series-main {
  box-sizing: border-box;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10px 30px;
  transition: all 0.5s ease-in-out;

  @media (max-width: 1344.99px) {
    padding: 10px 30px;
  }

  @media (min-width: 1345px) {
    padding: 10px 120px;
  }

  @media (min-width: 2050px) {
    padding: 10px 180px;
  }


  .series-main-container {
    box-sizing: border-box;
    width: 100%;
    height: auto;
    min-height: calc(100vh - 10rem);

    .series-container {
      box-sizing: border-box;
      display: grid;
      position: relative;
      // background-color: pink;
      width: 100%;
      height: 100%;
      grid-gap: 20px;
      line-height: 1.6;
      grid-template-columns: repeat(3, 1fr);


      @media (max-width: 1344.99px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (min-width: 1345px) {
        grid-template-columns: repeat(3, 1fr);
      }

      @media (min-width: 2050px) {
        grid-template-columns: repeat(4, 1fr);
      }

    }

  }

  .paginator-container {
    height: 5rem;
    width: 100%;
    // background-color: green;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
