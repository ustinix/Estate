<script setup lang="ts">
const config = useRuntimeConfig();

console.log('Runtime config:', config);
if (import.meta.server) {
  console.log('API secret:', config.apiSecret);
}
</script>
<template>
  <NuxtLoadingIndicator />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
