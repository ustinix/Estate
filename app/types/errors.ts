export interface AppError {
  message: string;
  type?: 'network' | 'auth' | 'validation' | 'business' | 'unknown';
  code?: string;
  status?: number;
}

export interface ErrorHandlerOptions {
  showNotification?: boolean;
  fallbackMessage?: string;
}
