import type { AxiosInstance, AxiosRequestConfig } from 'axios';

declare module '#app' {
  interface NuxtApp {
    $axios: AxiosInstance;
  }
}

export function useApi() {
  const { $axios } = useNuxtApp();

  const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
    const response = await $axios(config);
    return response as T; // response уже данные, но TypeScript не знает
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
