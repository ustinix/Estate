import axios from 'axios';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();
  const baseURL = '/api'; // Всегда используем прокси в development

  const axiosInstance = axios.create({
    baseURL: baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: false,
  });

  axiosInstance.interceptors.request.use(
    requestConfig => {
      if (config.public.apiSecret) {
        requestConfig.headers['X-API-Key'] = config.public.apiSecret;
      }

      if (authStore.accessToken) {
        requestConfig.headers.Authorization = `Bearer ${authStore.accessToken}`;
      }

      return requestConfig;
    },
    error => {
      console.error('Ошибка запроса:', error);
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
        console.warn('В SSR режиме пропускаем обработку 401 ошибок');
        return Promise.reject(error);
      }

      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshTokenCookie = useCookie('refresh-token');
          if (!refreshTokenCookie.value) {
            throw new Error('No refresh token');
          }
          const refreshSuccess = await authStore.refreshTokens();
          if (refreshSuccess && authStore.accessToken) {
            originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`;
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          console.error('Не удалось обновить токен:', refreshError);
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
