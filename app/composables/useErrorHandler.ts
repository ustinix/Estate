import type {
  AppError,
  ErrorHandlerOptions,
  ErrorWithCode,
  ErrorWithStatus,
  HttpError,
} from '~/types/errors';

const isErrorWithCode = (error: unknown): error is ErrorWithCode => {
  return error instanceof Error && 'code' in error;
};

const isErrorWithStatus = (error: unknown): error is ErrorWithStatus => {
  return error instanceof Error && 'status' in error;
};

const isHttpError = (error: unknown): error is HttpError => {
  return typeof error === 'object' && error !== null && 'response' in error;
};

const isAppError = (error: unknown): error is AppError => {
  return typeof error === 'object' && error !== null && 'message' in error;
};

export const useErrorHandler = () => {
  const error: Ref<AppError | null> = ref(null);
  const isLoading = ref(false);
  const $q = useQuasar();

  const normalizeError = (err: unknown): AppError => {
    if (isAppError(err)) {
      return err;
    }

    if (isHttpError(err)) {
      return {
        message: err.response?.data?.message || err.message || 'HTTP ошибка',
        status: err.response?.status,
      };
    }
    if (isErrorWithCode(err)) {
      return {
        message: err.message,
        code: err.code,
      };
    }

    if (isErrorWithStatus(err)) {
      return {
        message: err.message,
        status: err.status,
      };
    }

    if (err instanceof Error) {
      return {
        message: err.message,
      };
    }

    if (typeof err === 'string') {
      return { message: err };
    }

    return { message: 'Неизвестная ошибка' };
  };

  const handleError = (err: unknown, options: ErrorHandlerOptions = {}): void => {
    const { showNotification = true, fallbackMessage = 'Произошла непредвиденная ошибка' } =
      options;

    const normalizedError = normalizeError(err);
    error.value = normalizedError;

    if (showNotification && $q?.notify) {
      const message = getErrorMessage(normalizedError) || fallbackMessage;

      $q.notify({
        color: 'negative',
        textColor: 'white',
        icon: 'error',
        message,
        timeout: 5000,
        position: 'top',
        actions: [{ icon: 'close', color: 'white' }],
      });
    }
  };

  const executeAsync = async <T>(
    asyncFn: () => Promise<T>,
    options?: ErrorHandlerOptions,
  ): Promise<T | null> => {
    try {
      isLoading.value = true;
      error.value = null;
      const result = await asyncFn();
      return result;
    } catch (err) {
      handleError(err, options);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const clearError = (): void => {
    error.value = null;
  };

  return {
    error,
    isLoading,
    handleError,
    executeAsync,
    clearError,
  };
};

function getErrorMessage(error: AppError): string {
  if (error.status) {
    const statusMessages: Record<number, string> = {
      400: 'Неверный запрос',
      401: 'Необходима авторизация',
      403: 'Доступ запрещен',
      404: 'Ресурс не найден',
      500: 'Ошибка сервера',
    };
    return statusMessages[error.status] || error.message;
  }

  return error.message;
}
