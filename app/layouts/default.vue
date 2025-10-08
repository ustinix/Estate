<script setup lang="ts">
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '~/components/AppFooter.vue';
</script>
<template>
  <div class="layout">
    <AppHeader />
    <main class="main">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
}
</style>
