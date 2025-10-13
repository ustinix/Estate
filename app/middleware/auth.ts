export default defineNuxtRouteMiddleware(to => {
  const { isAuthenticated } = useAuth();

  const protectedRoutes = ['/profile'];

  if (protectedRoutes.includes(to.path) && !isAuthenticated.value) {
    return navigateTo('/login');
  }

  const authRoutes = ['/login', '/register'];
  if (authRoutes.includes(to.path) && isAuthenticated.value) {
    return navigateTo('/profile');
  }
});
