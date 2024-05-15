<script setup lang="ts">
import { RouterView } from 'vue-router'
import HeaderNav from '@/components/header/HeaderNav.vue'

</script>

<template>
  <div class="app">
    <header-nav></header-nav>
    <RouterView />
  </div>
</template>

<style scoped lang="scss">
.app {
  min-height: 100vh;
}
</style>
