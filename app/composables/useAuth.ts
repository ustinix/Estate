import type {
  User,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  NotificationSettings,
} from '~/types/auth';

const mockUser: User = {
  id: '1',
  name: 'Тестовый Пользователь',
  email: 'test@example.com',
  mobile: '+7 (999) 123-45-67',
  telegram: 'testuser',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date(),
};

const mockNotifications: NotificationSettings = {
  emailNotifications: true,
  smsNotifications: false,
  telegramNotifications: true,
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

  const checkUserExists = (email: string): boolean => {
    if (import.meta.client) {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const existingUser: User = JSON.parse(savedUser);
          return existingUser.email === email;
        }
      } catch (error) {
        console.error('Error checking user existence:', error);
      }
    }
    return false;
  };

  const getRegisteredUsers = (): User[] => {
    if (import.meta.client) {
      try {
        // заменить на запрос к API
        const savedUser = localStorage.getItem('user');
        return savedUser ? [JSON.parse(savedUser)] : [];
      } catch (error) {
        console.error('Error getting registered users:', error);
        return [];
      }
    }
    return [];
  };

  const setUserToStorage = (userData: User | null) => {
    if (import.meta.client) {
      try {
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Ошибка сохранения данных в LocalStorage', error);
      }
    }
  };

  const login = async (credentials: LoginRequest): Promise<User> => {
    if (!checkUserExists(credentials.email)) {
      throw new Error('Пользователь с таким email не зарегистрирован');
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      throw new Error('Пользователь не найден');
    }

    const existingUser: User = JSON.parse(savedUser);

    // Проверяем пароль (в реальном приложении было бы хеширование)
    if (credentials.password.length < 3) {
      throw new Error('Неверный пароль');
    }

    user.value = existingUser;
    setUserToStorage(existingUser);
    return existingUser;
  };

  const register = async (userData: RegisterRequest): Promise<User> => {
    if (checkUserExists(userData.email)) {
      throw new Error('Пользователь с таким email уже зарегистрирован');
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    const newUser: User = {
      id: Math.random().toString(36).substring(2, 9),
      name: userData.name,
      email: userData.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    user.value = newUser;
    setUserToStorage(newUser);

    return newUser;
  };

  const logout = (): void => {
    user.value = null;
    setUserToStorage(null);
  };

  const getNotificationSettings = async (): Promise<NotificationSettings> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (import.meta.client) {
      try {
        const saved = localStorage.getItem('notificationSettings');
        return saved ? JSON.parse(saved) : { ...mockNotifications };
      } catch (error) {
        console.error('Ошибка загрузки настроек уведомлений', error);
        return { ...mockNotifications };
      }
    }
    return { ...mockNotifications };
  };

  const updateNotificationSettings = async (
    settings: NotificationSettings,
  ): Promise<NotificationSettings> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

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

  const updateProfile = async (profileData: UpdateProfileRequest): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!user.value) {
      throw new Error('Пользователь не авторизован');
    }

    const updatedUser: User = {
      ...user.value,
      ...profileData,
      updatedAt: new Date(),
    };

    user.value = updatedUser;
    setUserToStorage(updatedUser);

    return updatedUser;
  };

  const changePassword = async (passwordData: ChangePasswordRequest): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!passwordData.currentPassword || passwordData.currentPassword.length < 3) {
      throw new Error('Неверный текущий пароль');
    }

    if (passwordData.newPassword.length < 3) {
      throw new Error('Новый пароль должен содержать минимум 3 символа');
    }

    // тут будет ответ от апи
    console.log('Пароль изменен на:', passwordData.newPassword);

    if (user.value) {
      user.value.updatedAt = new Date();
      setUserToStorage(user.value);
    }
  };

  return {
    user: readonly(user),
    isAuthenticated,
    login,
    register,
    logout,
    checkUserExists,
    getRegisteredUsers,
    updateProfile,
    changePassword,
    getNotificationSettings,
    updateNotificationSettings,
  };
};
