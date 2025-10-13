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
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockUser: User = {
      id: Math.random().toString(36).substring(2, 9),
      name: getNameFromEmail(credentials.email),
      email: credentials.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    user.value = mockUser;
    setUserToStorage(mockUser);

    return mockUser;
  };

  const register = async (userData: RegisterRequest): Promise<User> => {
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
  };
};
