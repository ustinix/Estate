export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore();
  await authStore.initAuth();
  authStore.isInitialized = true;
});
