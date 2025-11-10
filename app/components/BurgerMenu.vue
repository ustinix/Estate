<script setup lang="ts">
import { useRoute } from '#imports';
import type { NavLink } from '~/types/navlink';

const $q = useQuasar();
const authStore = useAuthStore();
const { user, isAuthenticated } = storeToRefs(authStore);

const userName = computed(() => {
  if (user?.value?.name && user.value?.name.trim() !== '') {
    return user.value?.name;
  }
  if (user?.value?.email) {
    return getUserNameFromEmail(user.value?.email);
  }
  return 'Пользователь';
});

const route = useRoute();

const { navLinks } = defineProps<{
  navLinks: NavLink[];
}>();

const drawer = ref(false);
const burgerBtn = ref<HTMLElement>();
const burgerMenu = ref<HTMLElement>();

watch(
  () => route.path,
  () => {
    drawer.value = false;
  },
);

const toggleDrawer = () => {
  drawer.value = !drawer.value;
};

const closeDrawer = () => {
  drawer.value = false;
};

const closeOnClickOutside = (event: Event) => {
  if (
    burgerBtn.value &&
    !burgerBtn.value.contains(event.target as Node) &&
    burgerMenu.value &&
    !burgerMenu.value.contains(event.target as Node)
  ) {
    closeDrawer();
  }
};

const closeOnEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeDrawer();
  }
};

watch(drawer, newVal => {
  if (newVal) {
    document.body.style.overflow = 'hidden';
    document.addEventListener('click', closeOnClickOutside);
    document.addEventListener('keydown', closeOnEscape);
  } else {
    document.body.style.overflow = '';
    document.removeEventListener('click', closeOnClickOutside);
    document.removeEventListener('keydown', closeOnEscape);
  }
});

onUnmounted(() => {
  document.body.style.overflow = '';
  document.removeEventListener('click', closeOnClickOutside);
  document.removeEventListener('keydown', closeOnEscape);
});

const { executeAsync, isLoading: isLoggingOut } = useErrorHandler();

const handleLogout = async () => {
  closeDrawer();
  await executeAsync(async () => {
    await authStore.logout();
    await authStore.initAuth();

    $q.notify({
      color: 'green-4',
      textColor: 'white',
      icon: 'cloud_done',
      message: 'Выход выполнен успешно',
    });
    return true;
  });
};
const handleProfileClick = () => {
  closeDrawer();
};
</script>

<template>
  <div class="burger-menu-wrapper">
    <q-btn
      flat
      dense
      round
      icon="menu"
      aria-label="Меню"
      class="burger-btn"
      @click="toggleDrawer"
    />

    <div class="burger-overlay" :class="drawer ? 'open' : ''" @click="closeDrawer" />

    <div class="burger-menu" :class="drawer ? 'open' : ''">
      <div class="burger-header">
        <NuxtLink to="/">
          <h2 class="burger-title">EstateMetrics</h2>
        </NuxtLink>
        <q-btn flat round dense icon="close" class="close-btn" @click="closeDrawer" />
      </div>

      <nav class="burger-nav">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.text"
          :to="link.to"
          class="burger-nav-link"
          :class="{ active: route.path === link.to }"
          @click="closeDrawer"
        >
          <q-icon :name="link.icon" class="nav-icon" />
          <span class="nav-text">{{ link.text }}</span>
        </NuxtLink>
      </nav>

      <template v-if="!isAuthenticated">
        <div class="burger-actions">
          <NuxtLink to="/login">
            <q-btn color="primary" label="Войти" class="auth-btn" @click="closeDrawer" />
          </NuxtLink>
          <NuxtLink to="/register">
            <q-btn
              color="secondary"
              label="Зарегистрироваться"
              class="auth-btn"
              @click="closeDrawer"
            />
          </NuxtLink>
        </div>
      </template>
      <template v-else>
        <div class="user-menu">
          <NuxtLink
            to="/profile"
            class="nav-link profile-link"
            title="Профиль"
            @click="handleProfileClick"
          >
            <q-icon name="person" class="nav-icon" />
            <span class="nav-text">{{ userName }}</span>
          </NuxtLink>
          <q-btn
            class="header-btn button"
            color="negative"
            label="Выйти"
            @click="handleLogout"
            :loading="isLoggingOut"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.burger-menu-wrapper {
  display: none;

  @media (max-width: 1300px) {
    display: block;
  }
}

.burger-btn {
  color: var(--text-color-light);
  font-size: 1.5rem;
}

.burger-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 999;

  &.open {
    opacity: 1;
    visibility: visible;
  }
}

.burger-menu {
  position: fixed;
  top: 0;
  left: -100%;
  width: 80%;
  max-width: 300px;
  height: 100vh;
  background: var(--bg-color-light);
  box-shadow: 2px 0 10px var(--box-shadow);
  transition: left 0.3s ease;
  z-index: 1000;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  &.open {
    left: 0;
  }
}

.burger-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-color);

  .burger-title {
    margin: 0;
    color: var(--primary);
    font-size: 1.25rem;
    font-weight: 700;
  }

  .close-btn {
    color: var(--text-color);
  }
}

.burger-nav {
  flex: 1;
  padding: 1rem 0;
}

.burger-nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 1.5rem;
  text-decoration: none;
  color: var(--text-color);
  transition: all 0.3s ease;
  border-radius: 0;

  .nav-icon {
    font-size: 1.25rem;
    color: var(--text-color);
    width: 24px;
  }

  .nav-text {
    font-size: 1rem;
    font-weight: 500;
  }

  &:hover {
    background: var(--button-hover);
  }

  &.active {
    background: var(--primary);
    color: white;

    .nav-icon {
      color: white;
    }
  }
}

.burger-actions {
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  .auth-btn {
    width: 100%;
    justify-content: center;
  }
}
.user-menu {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}
</style>
