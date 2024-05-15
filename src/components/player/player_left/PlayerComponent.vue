<template>
  <div class="player-medium scroll-sticky" @keydown="handleKeydown">
    <div class="player-main">
      <div class="player-wrap" v-show="isready">
        <video id="videoPlayer" class="video-js vjs-default-skin vjs-16-9"></video>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import videojs from 'video.js';
import '@/../node_modules/video.js/dist/video-js.css'
import 'dashjs';
import 'videojs-contrib-dash'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { videoAct } from '../../../common/common';
import type Player from 'video.js/dist/types/player';
import { generateStaticUrl } from '@/utils/generateStaticUrl';

const props = defineProps(["videoInfo"])

let _player = ref();
let isready = ref(false);
const video = computed(() => {
  return props.videoInfo;
})

watch(video, (newVal, oldVal) => {
  setVideo()
})

onMounted(() => {
})

function setVideo() {
  const videoPath = generateStaticUrl(video.value.remotePath);
  const resource = {
    src: videoPath,
    type: "application/dash+xml"
  };
  if (_player.value) {
    delete videojs.getPlayers()['videoPlayer']
  }
  let player: Player = videojs('videoPlayer', {
    controls: true, // 是否显示控制条
    // poster: 'xxx', // 视频封面图地址
    preload: 'auto',
    autoplay: false,
    fluid: true, // 自适应宽高
    language: 'zh-CN', // 设置语言
    muted: false, // 是否静音
    inactivityTimeout: false,
    controlBar: { // 设置控制条组件
      /* 使用children的形式可以控制每一个控件的位置，以及显示与否 */
      children: [
        { name: 'playToggle' }, // 播放/暂停按钮
        { name: 'currentTimeDisplay' }, // 视频当前已播放时间
        { name: 'progressControl' }, // 播放进度条
        { name: 'durationDisplay' }, // 视频播放总时间
        "remainingTimeDisplay",
        { // 倍数播放，可以自己设置
          name: 'playbackRateMenuButton',
          'playbackRates': [0.5, 1, 1.5, 2, 2.5]
        },
        { // 倍数播放，可以自己设置
          name: 'playbackRateMenuItem',
          'playbackRates': [0.5, 1, 1.5, 2, 2.5]
        },
        {
          name: 'volumePanel', // 音量控制
          inline: false, // 不使用水平方式
        },
        { name: 'FullscreenToggle' } // 全屏
      ]
    },
    // sources: [ // 视频来源路径
    //   {
    //     src: videoPath,
    //     type: 'application/dash+xml',
    //   }
    // ],
  });
  player.ready(function () {
    if (!_player.value) {
      _player.value = player;
    }
  })
  player.src(resource);
  player.on('canplay', () => {
    isready.value = true
  });


}

function removeVideo() {
  if (_player.value) {
    actVideo(videoAct.dispose);
  }
}
onUnmounted(() => {
  if (_player.value) {
    removeVideo();
  }
})

function handleKeydown(event: KeyboardEvent) {
  const player: Player = _player.value;
  const curVolume = (player.volume() || 0) * 100;
  if (event.key === "ArrowUp") {
    player.volume((curVolume + 10) / 100)
  }
  if (event.key === "ArrowDown") {
    player.volume((curVolume - 10) / 100)
  }
}

function actVideo(act: string) {
  const player: Player = _player.value;
  switch (act) {
    case videoAct.play:
      player.play();
      break;
    case videoAct.pause:
      player.pause();
      break;
    case videoAct.dispose:
      player.dispose();
      break;
    case videoAct.volume:
      break;
    case videoAct.muted:
      player.muted(!player.muted());
      break;
    case videoAct.forward:
      player.currentTime((player.currentTime() as number) + 10);
      player.play();
      break;
    case videoAct.backward:
      player.currentTime((player.currentTime() as number) - 10);
      player.play();
      break;
    case videoAct.quality:
      break;
    default:
      break;
  }
}

</script>

<style lang="scss">
.player-medium {
  background-color: var(--base-c-dark-heavy);
  width: 100%;
  height: 100%;

  .player-main {
    width: 100%;
    aspect-ratio: 16/9;

    .player-wrap {


      .vjs-paused .vjs-big-play-button,
      .vjs-paused.vjs-has-started .vjs-big-play-button {
        display: block;
      }
    }
  }

}

.scroll-sticky {
  position: sticky;
  height: fit-content;
  z-index: 1;
}

.video-js {
  .vjs-current-time {
    display: flex;
  }

  .vjs-current-time-display {
    display: flex;
  }

  .video-duration {
    display: flex;
  }
}
</style>