const getErrorMessage = (status: number): string => {
  const messages: { [key: number]: string } = {
    400: 'Неверный запрос',
    401: 'Неверные учетные данные',
    403: 'Доступ запрещен',
    404: 'Ресурс не найден',
    409: 'Пользователь уже существует',
    500: 'Внутренняя ошибка сервера',
  };
  return messages[status] || 'Произошла ошибка';
};

export const handleApiError = (error: any): never => {
  if (error?.status) {
    const message = error.data?.message || getErrorMessage(error.status);
    throw new Error(message);
  }

  if (error instanceof Error) {
    throw error;
  }

  throw new Error('Произошла неизвестная ошибка');
};
