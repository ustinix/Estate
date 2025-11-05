import { useAuthStore } from '~/stores/authStore';

export function useApi() {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  const baseURL = '/api';

  async function request<T>(url: string, options: any = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (config.public.apiSecret) {
      headers['X-API-Key'] = config.public.apiSecret;
    }

    if (authStore.isAuthenticated && authStore.accessToken) {
      headers['Authorization'] = `Bearer ${authStore.accessToken}`;
    }

    try {
      const response = (await $fetch(`${baseURL}${url}`, {
        ...options,
        headers,
      })) as T;

      return response;
    } catch (error: any) {
      console.error(`API Error [${options.method || 'GET'} ${url}]:`, error);

      if (error.status === 401) {
        authStore.logout();
        await navigateTo('/login');
        throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
      }
      const message = error.data?.message || error.message || 'Произошла ошибка';
      throw new Error(message);
    }
  }

  return {
    get: <T>(url: string, options?: any) => request<T>(url, { ...options, method: 'GET' }),
    post: <T>(url: string, data?: any, options?: any) =>
      request<T>(url, { ...options, method: 'POST', body: data }),
    put: <T>(url: string, data?: any, options?: any) =>
      request<T>(url, { ...options, method: 'PUT', body: data }),
    delete: <T>(url: string, options?: any) => request<T>(url, { ...options, method: 'DELETE' }),
    request,
  };
}
