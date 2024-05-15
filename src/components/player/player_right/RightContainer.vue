<template>
  <div class="right-container">
    <div class="episode-container">
      <div class="episode-main">
        <div class="episode-head">
          视频选集
        </div>
        <ul class="episode-list">
          <li v-for="(item, index) in videoList" :key="index"
            :class="(item.videoId === _currentVideo.videoId ? 'episode-li episode-li-active' : 'episode-li')"
            @click="changeVideo(item)">
            <span class="episode-sequence">第 {{ item.sequence }} 话</span>
            <span class="episode-title">{{ item.title }}</span>
            <span class="episode-duration">{{ convertDuration(item.duration) }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { convertDuration } from '@/utils/timeUtil/timeUtil';
import { computed } from 'vue';

const emit = defineEmits(['changeVideo'])
const props = defineProps(["videos", "currentVideo"])
const videoList = computed(() => {
  return props.videos || [];
})
const _currentVideo = computed(() => {
  return props.currentVideo || {};
})

function changeVideo(item: any) {
  emit('changeVideo', item)
}

</script>

<style lang="scss" scoped>
.right-container {
  width: 411px;
  margin-left: 30px;
  // background-color: pink;

  .episode-container {
    width: 100%;
    max-height: 600px;

    .episode-main {
      box-sizing: border-box;
      width: 100%;
      min-height: 100px;
      background-color: var(--base-c-deep-gray);
      border-radius: 5px;
      color: var(--normal-c-font-dark);
      padding: 0 10px;

      .episode-head {
        font-size: 1.25rem;
        padding: 20px 0;
      }

      .episode-list {
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;

        width: 100%;
        padding: 0 0 20px 0;

        .episode-li {
          display: flex;
          box-sizing: border-box;
          border-radius: 5px;
          width: 100%;
          background-color: #fff;
          margin-bottom: 10px;
          height: 2.5rem;
          cursor: pointer;
          align-items: center;
          padding: 0 10px;

          &:hover {
            background-color: var(--base-c-lightblue2);
          }

          .episode-sequence {
            text-align: center;
            padding-right: 10px;
            min-width: 3.5rem;
            text-align: center;
          }

          .episode-title {
            width: 100%;
          }

          .episode-duration {
            text-align: center;
            min-width: 3.5rem;
          }
        }

        .episode-li-active {
          background-color: var(--base-c-lightblue2);
        }
      }
    }
  }
}
</style>