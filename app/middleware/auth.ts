import { useAuthStore } from '~/stores/authStore';

export default defineNuxtRouteMiddleware(async to => {
  const authStore = useAuthStore();
  await authStore.initAuth();
  const { isAuthenticated } = authStore;

  const protectedRoutes = ['/profile'];
  const authRoutes = ['/login', '/register'];

  if (protectedRoutes.includes(to.path) && !isAuthenticated) {
    return navigateTo('/login');
  }

  if (authRoutes.includes(to.path) && isAuthenticated) {
    return navigateTo('/profile');
  }
});
