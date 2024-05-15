<script setup lang="ts">
import { generateStaticUrl } from '@/utils/generateStaticUrl';
import { computed } from 'vue';

const props = defineProps(["seriesInfo"])
const series = computed(() => {
  return props.seriesInfo || {};
})

const imgUrl = computed(() => {
  return generateStaticUrl(series.value.coverPath)
})

function switchInfo() {
  console.log("🚀 ~ switchInfo ~ switchInfo:")

}

</script>
<template>
  <div class="player-info-container">
    <div class="player-info-main">
      <div>
        <img class="info-cover" :src="imgUrl" alt="">
      </div>
      <div class="info-wrap">
        <div class="info-title">{{ series.seriesName }}</div>
        <div class="info-exact">
          <div class="info-exact-item">原著: {{ series.originalWorker }}</div>
          <div class="info-exact-item">状态: {{ series.status }}</div>
        </div>
        <div class="info-introduction">
          简介：{{ series.introduction }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.player-info-container {
  padding: 10px 0 0 0px;

  .player-info-main {
    display: flex;
    flex-direction: row;

    .info-cover {
      height: 240px;
      aspect-ratio: 3/4;
      border-radius: 8px;
    }

    .info-wrap {
      position: relative;
      padding: 0 0 0 1rem;
      font-weight: 300;
      height: 240px;

      .btn-info-show {
        cursor: pointer;
        position: absolute;
        bottom: -5px;
        right: 0;
      }

      .info-title {
        font-size: 1.5rem;
        padding-bottom: 0.5rem;
      }

      .info-exact {
        padding-bottom: 0.5rem;
        display: flex;
        flex-direction: row;

        .info-exact-item {
          padding-right: 0.75rem;
        }
      }

      .info-introduction {
        letter-spacing: 0.1rem;
      }

    }
  }
}
</style>