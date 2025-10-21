declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NUXT_API_SECRET: string;
      NUXT_PUBLIC_API_BASE_URL: string;
      API_BASE_URL: string;
    }
  }
}

export {};
