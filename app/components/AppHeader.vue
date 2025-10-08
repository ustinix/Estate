<script setup lang="ts">
import NavMenu from './NavMenu.vue';
import BurgerMenu from './BurgerMenu.vue';
import { navLinks } from '~/constants/commonConstants';
</script>

<template>
  <header class="header">
    <div class="toolbar">
      <div class="burger-section">
        <BurgerMenu :nav-links="navLinks" />
      </div>
      <div class="toolbar-left">
        <div class="toolbar-title">
          <NuxtLink to="/" class="header-link">
            <h2 class="header-title">EstateMetrics</h2>
          </NuxtLink>
        </div>
        <div class="toolbar-center">
          <NavMenu />
        </div>
      </div>

      <div class="toolbar-right">
        <NuxtLink to="/login">
          <q-btn class="header-btn button" color="secondary" label="Войти" />
        </NuxtLink>
        <NuxtLink to="/register">
          <q-btn class="header-btn button" color="secondary" label="Зарегистрироваться" />
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.header {
  background: var(--bg-color);
  color: var(--text-color);
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 auto;
  padding: 0 3rem;
  gap: 1rem;
}

.burger-section {
  display: none;
}

.toolbar-left,
.toolbar-center,
.toolbar-right {
  display: flex;
  align-items: center;
}

.toolbar-right {
  gap: 1rem;
}

.header-btn {
  font-size: 1.1rem;
  padding: 0.8rem 1.4rem;
  min-height: 2rem;
}

.toolbar-left {
  flex: 1;
  gap: 2rem;
}

.toolbar-center {
  justify-content: start;
}

.toolbar-title h2 {
  margin: 0;
  color: var(--text-color-light);
  font-size: 1.5rem;
  white-space: nowrap;
}

.header-link {
  text-decoration: none;
}

.toolbar-title .header-title {
  color: var(--primary);
  font-size: clamp(1.5rem, 2vw, 2rem);
  font-weight: 500;
}

:deep(.nav-menu) {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

@media (max-width: 1300px) {
  .header-btn {
    font-size: 1rem;
    padding: 0.6rem 1.1rem;
    min-height: 2rem;
  }
  .toolbar {
    padding: 0 1rem;
    gap: 0.5rem;
  }

  .burger-section {
    display: block;
  }

  .toolbar-left {
    display: none;
  }

  .toolbar-title h2 {
    font-size: 1.3rem;
  }
  .toolbar-right {
    margin-left: auto;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 0.75rem;
  }

  .toolbar {
    padding: 0 0.5rem;
  }

  .toolbar-right {
    gap: 0.5rem;
  }

  .toolbar-title h2 {
    font-size: 1.2rem;
  }

  :deep(.nav-menu) {
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 0.5rem;
  }

  .toolbar {
    padding: 0;
  }

  .toolbar-title h2 {
    font-size: 1.1rem;
  }
  .toolbar-right {
    padding: 0.5rem;
  }
}
</style>
