<script setup lang="ts">
import { useQuasar } from 'quasar';
import NavMenu from './NavMenu.vue';
import BurgerMenu from './BurgerMenu.vue';
import { navLinks } from '~/constants/navLinks';
import { getUserNameFromEmail } from '~/utils/getUserName';
import { useAuthStore } from '~/stores/authStore';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

const $q = useQuasar();

const authStore = useAuthStore();
const { user, isAuthenticated, isLoading } = storeToRefs(authStore);

const handleLogout = async () => {
  try {
    await authStore.logout();
    await authStore.initAuth();

    $q.notify({
      color: 'green-4',
      textColor: 'white',
      icon: 'cloud_done',
      message: 'Выход выполнен успешно',
    });
  } catch (error) {
    console.error('Ошибка при выходе:', error);
  }
};

const userName = computed(() => {
  if (user?.value?.name && user.value?.name.trim() !== '') {
    return user.value?.name;
  }
  if (user?.value?.email) {
    return getUserNameFromEmail(user.value?.email);
  }
  return 'Пользователь';
});
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
        <template v-if="isLoading">
          <q-spinner size="sm" />
        </template>
        <template v-if="!isAuthenticated">
          <NuxtLink to="/login">
            <q-btn class="header-btn button" color="secondary" label="Войти" />
          </NuxtLink>
          <NuxtLink to="/register">
            <q-btn class="header-btn button" color="secondary" label="Зарегистрироваться" />
          </NuxtLink>
        </template>
        <template v-else>
          <div class="user-menu">
            <NuxtLink to="/profile" class="nav-link profile-link" title="Профиль">
              <q-icon name="person" class="nav-icon" />
              <span class="nav-text">{{ userName }}</span>
            </NuxtLink>
            <q-btn class="header-btn button" color="negative" label="Выйти" @click="handleLogout" />
          </div>
        </template>
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
  font-size: 0.8rem;
  padding: 0.5rem 1rem;
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

.toolbar-title .header-title:hover {
  color: var(--text-color);
}

.user-menu {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.profile-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: var(--text-color);
  border-radius: 6px;
  transition: all 0.3s ease;
  border: 1px solid transparent;

  &:hover {
    background-color: var(--bg-color-hover);
    color: var(--primary);
    border-color: var(--primary);
  }

  &.router-link-active {
    border-color: var(--primary);
    color: var(--primary);
  }
}

.nav-icon {
  font-size: 1.2rem;
  color: var(--text-color-light);
  transition: color 0.3s ease;
}

.nav-text {
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
}

.logout-btn {
  font-size: 0.8rem;
  padding: 0.5rem 1rem;
  min-height: 2rem;
}

:deep(.nav-menu) {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

@media (max-width: 1300px) {
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
  .header-btn {
    font-size: 0.8rem;
    padding: 0.5rem 0.6rem;
    min-height: 1.8rem;
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
