<script setup lang="ts">
import { navLinks } from '~/constants/commonConstants';
</script>
<template>
  <div class="nav-container">
    <NuxtLink
      v-for="navLink in navLinks"
      :key="navLink.text"
      :to="navLink.to"
      :title="navLink.text"
      class="nav-link"
    >
      <q-icon :name="navLink.icon" class="nav-icon" />
      <span class="nav-text">{{ navLink.text }}</span>
    </NuxtLink>
  </div>
</template>

<style lang="scss" scoped>
.nav-container {
  display: flex;
  gap: 16px;
  padding: 16px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  text-decoration: none;
  color: var(--text-color-light);
  border: 1px solid transparent;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  color: var(--link-hover);
  border-color: var(--link-hover);
}

.nav-link.router-link-active {
  color: var(--link-active);
  border-color: var(--link-active);
  font-weight: 500;
}

.nav-icon {
  font-size: 20px;
}

.nav-text {
  font-size: clamp(1rem, 0.9vw, 1.5rem);
  font-weight: 500;
}
</style>
