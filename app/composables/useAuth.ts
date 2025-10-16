import type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  NotificationSettingsRequest,
} from '~/types/auth';

const handleApiError = (error: any): never => {
  if (error?.status) {
    const message = error.data?.message || getErrorMessage(error.status);
    throw new Error(message);
  }

  if (error instanceof Error) {
    throw error;
  }

  throw new Error('Произошла неизвестная ошибка');
};

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

export const useAuth = () => {
  const user = useState<User | null>('user', () => {
    if (import.meta.client) {
      try {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
      } catch (error) {
        console.error('Ошибка получения данных авторизации из LocalStorage', error);
        return null;
      }
    }
    return null;
  });

  const isAuthenticated = computed(() => !!user.value);

  const setUserToStorage = (userData: User | null) => {
    if (import.meta.client) {
      try {
        if (userData) {
          const userString = JSON.stringify(userData);
          console.log('Saving to LS:', userString);
          localStorage.setItem('user', userString);
        } else {
          console.log('Removing from LS');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Ошибка сохранения данных в LocalStorage', error);
      }
    }
  };

  const login = async (credentials: LoginRequest): Promise<User> => {
    try {
      const response: LoginResponse = await $fetch('/api/auth/login', {
        method: 'POST',
        body: credentials,
      });

      console.log('Backend response:', response);

      const loggedInUser: User = {
        id: response.id,
        name: response.name || getUserNameFromEmail(credentials.email),
        email: response.email || credentials.email,
        mobile: response.mobile,
        telegram: response.telegram,
      };

      console.log('Final user object:', loggedInUser);

      user.value = loggedInUser;
      setUserToStorage(loggedInUser);
      return loggedInUser;
    } catch (error: any) {
      return handleApiError(error);
    }
  };

  const register = async (userData: RegisterRequest): Promise<User> => {
    try {
      const response: RegisterResponse = await $fetch('/api/auth/register', {
        method: 'POST',
        body: userData,
      });

      console.log('Register response:', response);

      const newUser: User = {
        id: response.id,
        name: getUserNameFromEmail(userData.email),
        email: userData.email,
      };

      console.log('New user:', newUser);

      user.value = newUser;
      setUserToStorage(newUser);
      return newUser;
    } catch (error: any) {
      return handleApiError(error);
    }
  };

  const getRegisteredUsers = async (): Promise<User[]> => {
    try {
      const response: User[] = await $fetch('/api/auth/users');
      return response;
    } catch (error: any) {
      console.error('Не удалось получить список зарегестрированных пользователей:', error);
      throw new Error(error.data?.message || 'Ошибка получения пользователей');
    }
  };

  const logout = (): void => {
    user.value = null;
    setUserToStorage(null);
  };

  const updateProfile = async (profileData: UpdateProfileRequest): Promise<User> => {
    if (!user.value) {
      throw new Error('Пользователь не авторизован');
    }

    try {
      const response: User = await $fetch(`/api/users/${user.value.id}`, {
        method: 'PATCH',
        body: profileData,
      });

      const updatedUser: User = {
        ...user.value,
        ...response,
      };

      user.value = updatedUser;
      setUserToStorage(updatedUser);
      return updatedUser;
    } catch (error: any) {
      throw new Error(error.data?.message || 'Ошибка обновления профиля');
    }
  };

  const changePassword = async (passwordData: ChangePasswordRequest): Promise<void> => {
    if (!user.value) {
      throw new Error('Пользователь не авторизован');
    }

    try {
      await $fetch(`/api/users/${user.value.id}/password`, {
        method: 'POST',
        body: passwordData,
      });
    } catch (error: any) {
      throw new Error(error.data?.message || 'Ошибка смены пароля');
    }
  };

  const getNotificationSettings = async (): Promise<NotificationSettingsRequest> => {
    if (import.meta.client) {
      try {
        const saved = localStorage.getItem('notificationSettings');
        return saved
          ? JSON.parse(saved)
          : {
              emailNotifications: true,
              smsNotifications: false,
              telegramNotifications: true,
            };
      } catch (error) {
        console.error('Ошибка загрузки настроек уведомлений', error);
        return {
          emailNotifications: true,
          smsNotifications: false,
          telegramNotifications: true,
        };
      }
    }
    return {
      emailNotifications: true,
      smsNotifications: false,
      telegramNotifications: true,
    };
  };

  const updateNotificationSettings = async (
    settings: NotificationSettingsRequest,
  ): Promise<NotificationSettingsRequest> => {
    if (import.meta.client) {
      try {
        localStorage.setItem('notificationSettings', JSON.stringify(settings));
        return settings;
      } catch (error) {
        console.error('Ошибка сохранения настроек уведомлений', error);
        throw new Error('Ошибка сохранения настроек уведомлений');
      }
    }
    return settings;
  };

  return {
    user: readonly(user),
    isAuthenticated,
    login,
    register,
    logout,
    getRegisteredUsers,
    updateProfile,
    changePassword,
    getNotificationSettings,
    updateNotificationSettings,
  };
};
