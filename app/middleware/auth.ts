import { useAuthStore } from '~/stores/authStore';

export default defineNuxtRouteMiddleware(async to => {
  const authStore = useAuthStore();
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
