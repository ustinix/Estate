export default defineNuxtPlugin(async () => {
  if (import.meta.server) {
    console.log('SSR: Skipping auto-auth on server');
    return;
  }
  const authStore = useAuthStore();
  await authStore.initAuth();
  authStore.isInitialized = true;
});
