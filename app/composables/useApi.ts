import type { AxiosInstance, AxiosRequestConfig } from 'axios';

declare module '#app' {
  interface NuxtApp {
    $axios: AxiosInstance;
  }
}

export function useApi() {
  const nuxtApp = useNuxtApp();

  console.log('🔍 useApi called:', {
    isServer: import.meta.server,
    isClient: import.meta.client,
    hasAxios: !!nuxtApp.$axios,
    when: new Date().toISOString(),
  });

  if (import.meta.server) {
    console.log('SSR: useApi returning stub');
    return createApiStub();
  }

  if (!nuxtApp.$axios) {
    console.error('❌ CLIENT: $axios is MISSING!', {
      nuxtAppKeys: Object.keys(nuxtApp),
      availableKeys: Object.keys(nuxtApp).filter(k => k.startsWith('$')),
      isPluginLoaded: !!nuxtApp.$axios,
    });
    return createApiStub();
  }

  const { $axios } = nuxtApp;
  console.log('useApi ready, baseURL:', $axios.defaults?.baseURL);
  const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
    const response = await $axios(config);
    return response as T;
  };

  return {
    get: <T>(url: string, config?: AxiosRequestConfig) =>
      request<T>({ ...config, method: 'GET', url }),

    post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
      request<T>({ ...config, method: 'POST', url, data }),

    put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
      request<T>({ ...config, method: 'PUT', url, data }),

    patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
      request<T>({ ...config, method: 'PATCH', url, data }),

    delete: <T>(url: string, config?: AxiosRequestConfig) =>
      request<T>({ ...config, method: 'DELETE', url }),

    request,
  };
}

function createApiStub() {
  return {
    get: <T>(url: string): Promise<T> => Promise.reject(new Error('API not ready')),
    post: <T>(url: string, data?: any): Promise<T> => Promise.reject(new Error('API not ready')),
    put: <T>(url: string, data?: any): Promise<T> => Promise.reject(new Error('API not ready')),
    patch: <T>(url: string, data?: any): Promise<T> => Promise.reject(new Error('API not ready')),
    delete: <T>(url: string): Promise<T> => Promise.reject(new Error('API not ready')),
    request: <T>(config: AxiosRequestConfig): Promise<T> =>
      Promise.reject(new Error('API not ready')),
  };
}
