export const useErrorHandler = () => {
  const $q = useQuasar();

  const handleGenericError = (error: unknown, fallbackMessage?: string) => {
    let message = fallbackMessage || 'Произошла ошибка';

    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }

    showNotification(message, 'error');
  };

  const showNotification = (
    message: string,
    type: 'error' | 'warning' | 'info' | 'success' = 'error',
  ) => {
    if ($q?.notify) {
      const colors = {
        error: 'negative',
        warning: 'warning',
        info: 'info',
        success: 'positive',
      };

      $q.notify({
        color: colors[type],
        message,
        timeout: 5000,
        position: 'top',
        actions: [{ icon: 'close', color: 'white' }],
      });
    } else {
      console[type === 'error' ? 'error' : 'log'](message);
    }
  };

  return {
    handleGenericError,
    showNotification,
  };
};
