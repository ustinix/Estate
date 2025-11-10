export interface AppError {
  message: string;
  type?: 'network' | 'auth' | 'validation' | 'business' | 'unknown';
  code?: string | number;
  status?: number;
}

export interface ErrorHandlerOptions {
  showNotification?: boolean;
  fallbackMessage?: string;
}

export interface ErrorWithCode extends Error {
  code?: string | number;
}

export interface ErrorWithStatus extends Error {
  status?: number;
}

export interface HttpError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
}
