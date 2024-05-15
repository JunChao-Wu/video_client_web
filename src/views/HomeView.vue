<script setup lang="ts">
import router from '@/router';
import { onMounted } from 'vue';

onMounted(() => {
  router.push({ name: "series" })
})
</script>

<template>
  <main>
    <router-view></router-view>
  </main>
</template>
