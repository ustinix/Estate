import type { User, LoginRequest, RegisterRequest } from '~/types/auth';

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

  const getNameFromEmail = (email: string): string => {
    if (email && email.includes('@')) {
      return email.split('@')[0] || 'User';
    }
    return 'User';
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

  return {
    user: readonly(user),
    isAuthenticated,
    login,
    register,
    logout,
    checkUserExists,
    getRegisteredUsers,
  };
};
