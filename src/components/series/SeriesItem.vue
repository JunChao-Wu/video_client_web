<script setup lang="ts">
import router from '@/router';
import { _axios } from '@/utils/_axios';
import { generateStaticUrl } from '@/utils/generateStaticUrl';
import { computed, ref } from 'vue';

const props = defineProps<{
  seriesData?: {
    seriesName: string;
    alias: string;
    company: string;
    originalWorker: string;
    region: string;
    coverPath: string;
    premiereDate: number;
    seriesId: number;
    status: number;
    updatedTime: number;
    createdTime: number;
    videos: { video_sequence: number }[];
    _count: { videos: number };
  },
  statusMap?: {
    [key: string]: string
  }
}>()

const imgUrl = ref('')
imgUrl.value = props.seriesData?.coverPath || ""

function toPlayer() {
  router.push({ name: 'player', state: { seriesId: props.seriesData?.seriesId } });
}

const status = computed(() => {
  const _status = props.seriesData && props.seriesData.status + "" || "";
  return props.statusMap && props.statusMap[_status]
})

const preCount = computed(() => {
  const _status = props.seriesData && props.seriesData.status + "" || "";
  if (_status === "0") {
    return ""
  } else {
    return _status === "2" ? "总共: " : "更新至 "
  }
})
const vCount = computed(() => {
  const _status = props.seriesData && props.seriesData.status + "" || "";
  if (_status === "0") {
    return ""
  } else {
    return _status === "2" ? props.seriesData?._count.videos : props.seriesData?.videos[0].video_sequence;
  }
})

</script>
<template>
  <div class="series-item" @click="toPlayer">
    <div class="series-cover">
      <div v-if="!imgUrl" class="none-cover">暂无封面</div>
      <img v-if="imgUrl" class="series-cover-img" :src="generateStaticUrl(imgUrl)">
    </div>
    <div class="series-info">
      <div class="series-name">{{ props.seriesData?.seriesName }}</div>
      <div class="series-status">{{ status }}</div>
      <div class="series-status">{{ preCount }}{{ vCount }}</div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.series-item {
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  width: 100%;
  background-color: #fff;
  aspect-ratio: 12/16;
  border-radius: 1.75%;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1), 0 6px 20px 0 rgba(0, 0, 0, 0.1);
  cursor: pointer;

  .series-cover {
    border-radius: 1.75%;
    position: relative;
    width: 100%;
    color: #000;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1);
    background-color: var(--base-c-gray);
    background-image: linear-gradient(to top, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));


    .none-cover {
      border-radius: 1.75%;
      height: 100%;
      font-size: 2rem;
      font-weight: 500;
      text-align: center;
      writing-mode: vertical-rl;
      opacity: 0.4;
    }

    .series-cover-img {
      border-radius: 1.75%;
      width: 100%;
      height: 100%;
      opacity: 0.55;
    }

  }

  .series-info {
    position: absolute;
    bottom: 0;
    left: 0;
    min-height: 20%;
    max-height: 50%;
    padding: 10px 20px;
    border-radius: 1.75%;
    color: #fff;

    .series-name {
      font-size: 2rem;
      font-weight: 600;
    }

    .series-status {
      bottom: 10px;
      color: var(--base-c-gray);
    }
  }

}
</style>