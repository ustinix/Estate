import { useAuthStore } from '~/stores/authStore';

export default defineNuxtRouteMiddleware(async to => {
  const authStore = useAuthStore();
  if (import.meta.server) {
    console.log('SSR: Skipping auth check on server');
    return;
  }
  if (!authStore.isInitialized) {
    await authStore.initAuth();
  }

  const protectedRoutes = ['/profile'];
  const authRoutes = ['/login', '/register'];

  if (protectedRoutes.includes(to.path) && !authStore.isAuthenticated) {
    return navigateTo('/login');
  }

  if (authRoutes.includes(to.path) && authStore.isAuthenticated) {
    return navigateTo('/profile');
  }
});
