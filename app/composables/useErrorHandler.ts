import type { AppError, ErrorHandlerOptions } from '~/types/errors';

export const useErrorHandler = () => {
  const error: Ref<AppError | null> = ref(null);
  const isLoading = ref(false);
  const $q = useQuasar();

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

function normalizeError(err: unknown): AppError {
  if (err instanceof Error) {
    return {
      message: err.message,
      code: (err as any).code,
      status: (err as any).status,
    };
  }

  if (typeof err === 'string') {
    return { message: err };
  }

  if (typeof err === 'object' && err !== null) {
    const errorObj = err as any;
    return {
      message: errorObj.message || 'Неизвестная ошибка',
      code: errorObj.code,
      status: errorObj.status,
    };
  }

  return { message: 'Неизвестная ошибка' };
}

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
