import { useAuthStore } from '~/stores/authStore';

export function useApi() {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  const baseURL = config.public.apiBaseUrl;

  async function request<T>(url: string, options: any = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-API-Key': config.public.apiSecret,
      ...options.headers,
    };

    if (authStore.isAuthenticated && authStore.accessToken) {
      headers['Authorization'] = `Bearer ${authStore.accessToken}`;
    }

    console.log('🔐 API Request:', {
      url: `${baseURL}${url}`,
      baseURL,
      hasApiKey: !!config.public.apiSecret,
    });

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
        throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
      }
      const message = error.data?.message || error.message || 'Произошла ошибка';
      throw new Error(message);
    }
  }

  const $api = {
    get<T>(url: string, options?: any): Promise<T> {
      return request<T>(url, { method: 'GET', ...options });
    },

    post<T>(url: string, data?: any, options?: any): Promise<T> {
      return request<T>(url, { method: 'POST', body: data, ...options });
    },

    put<T>(url: string, data?: any, options?: any): Promise<T> {
      return request<T>(url, { method: 'PUT', body: data, ...options });
    },

    patch<T>(url: string, data?: any, options?: any): Promise<T> {
      return request<T>(url, { method: 'PATCH', body: data, ...options });
    },

    delete<T>(url: string, options?: any): Promise<T> {
      return request<T>(url, { method: 'DELETE', ...options });
    },
  };

  return $api;
}
