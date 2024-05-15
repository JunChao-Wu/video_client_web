<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import RightContainer from '../components/player/player_right/RightContainer.vue'
import PlayerComponent from '../components/player/player_left/PlayerComponent.vue'
import PlayerInfo from '../components/player/player_left/PlayerInfo.vue'
import { _axios } from '@/utils/_axios';
import { api } from '@/common/api';
const updatedKey = ref(0);
let oldKey = 0;
const seriesId = ref(0)
const seriesInfo = ref({})
const videos = ref([])
const choosedVideo = ref({})

function changeVideo(video: any) {
  choosedVideo.value = video;
}

onMounted(async () => {
  seriesId.value = history.state.seriesId
})

watch(seriesId, async (newVal, oldVal) => {
  const res = await _axios.get(api.series.info_g[0], {
    params: {
      seriesId: newVal
    }
  })
  const info = res && res.data && res.data.info;
  const _videos = res && res.data && res.data.videos;
  seriesInfo.value = info;
  videos.value = _videos;
  choosedVideo.value = videos.value[0];
})

</script>
<template>
  <div class="player-container" :key="updatedKey">
    <div class="left-container">
      <player-component :videoInfo="choosedVideo" />
      <player-info :seriesInfo="seriesInfo" />
    </div>
    <RightContainer :videos="videos" :currentVideo="choosedVideo" @changeVideo="changeVideo" />
  </div>
</template>

<style lang="scss" scoped>
.player-container {
  max-width: 2140px;
  min-width: 1080px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  box-sizing: content-box;
  position: relative;
  padding: 10px 20px 0 20px;

  @media (min-width: 1300px) {
    padding: 30px 30px 0 30px;
  }

  .left-container {
    width: 100%;
  }
}
</style>