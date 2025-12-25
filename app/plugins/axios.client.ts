import axios from 'axios';

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig();
  const baseURL = '/api';

  const axiosInstance = axios.create({
    baseURL: baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: false,
  });

  let authStore: ReturnType<typeof useAuthStore> | null = null;

  if (import.meta.client) {
    authStore = useAuthStore();

    if (!authStore.isInitialized) {
      await authStore.initAuth();
      authStore.isInitialized = true;
    }
  }

  axiosInstance.interceptors.request.use(
    async requestConfig => {
      if (config.public.apiSecret) {
        requestConfig.headers['X-API-Key'] = config.public.apiSecret;
      }

      if (import.meta.server) {
        return requestConfig;
      }

      if (authStore) {
        if (authStore.needsRefresh && !requestConfig.url?.includes('/users/refresh-token')) {
          console.log('Token needs refresh, refreshing...');
          try {
            const success = await authStore.refreshTokens();
            if (!success) {
              console.warn('Token refresh failed, clearing auth');
              await authStore.logout();
            }
          } catch (error) {
            console.error('Error during token refresh:', error);
          }
        }

        if (authStore.accessToken) {
          requestConfig.headers.Authorization = `Bearer ${authStore.accessToken}`;
        }
      }

      return requestConfig;
    },
    error => {
      console.error('Request error:', error);
      return Promise.reject(error);
    },
  );

  axiosInstance.interceptors.response.use(
    response => {
      return response.data;
    },
    async error => {
      const originalRequest = error.config;

      if (axios.isCancel(error)) {
        return Promise.reject(error);
      }

      const status = error.response?.status;
      const url = error.config?.url;
      const message = error.response?.data?.message || error.message;

      console.error(`[Axios Error] ${status || 'NETWORK'} ${url}: ${message}`);

      if (import.meta.server) {
        return Promise.reject(error);
      }

      if (status === 401 && !originalRequest._retry && authStore) {
        originalRequest._retry = true;

        console.log('Received 401, attempting token refresh...');

        try {
          const refreshSuccess = await authStore.refreshTokens();

          if (refreshSuccess && authStore.accessToken) {
            console.log('Token refreshed successfully, retrying request');
            originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`;
            return axiosInstance(originalRequest);
          } else {
            console.warn('Token refresh failed, logging out');
            await authStore.logout();
          }
        } catch (refreshError) {
          console.error('Token refresh error:', refreshError);
          await authStore.logout();
        }
      }

      if (import.meta.client) {
        const { $q } = useNuxtApp();

        if (status === 403 && $q?.notify) {
          $q.notify({
            color: 'negative',
            message: 'Недостаточно прав для этого действия',
            timeout: 5000,
            position: 'top',
          });
        } else if (status === 404 && $q?.notify) {
          $q.notify({
            color: 'warning',
            message: 'Ресурс не найден',
            timeout: 3000,
            position: 'top',
          });
        } else if (status >= 500 && $q?.notify) {
          $q.notify({
            color: 'negative',
            message: 'Ошибка сервера. Пожалуйста, попробуйте позже',
            timeout: 5000,
            position: 'top',
          });
        }
      }

      return Promise.reject(error);
    },
  );

  return {
    provide: {
      axios: axiosInstance,
    },
  };
});
