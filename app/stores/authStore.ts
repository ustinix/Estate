import { defineStore } from 'pinia';
import type {
  User,
  TokenResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  NotificationSettingsRequest,
} from '~/types/auth';
import { AUTH_CONSTANTS } from '~/constants/auth';
import { handleApiError } from '~/utils/apiError';
import { useApi } from '~/composables/useApi';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const expiresAt = ref<number | null>(null);
  const isLoading = ref(false);

  const $api = useApi();

  const accessTokenCookie = useCookie('access-token', {
    maxAge: AUTH_CONSTANTS.ACCESS_TOKEN_MAX_AGE_24HOURES,
    secure: !import.meta.dev,
    sameSite: 'lax',
  });

  const refreshTokenCookie = useCookie<string | null>('refresh-token', {
    maxAge: AUTH_CONSTANTS.REFRESH_TOKEN_MAX_AGE_30DAYS,
    secure: !import.meta.dev,
    sameSite: 'lax',
  });

  const isAuthenticated = computed(() => !!accessToken.value);

  const isTokenExpired = computed(() => {
    if (!expiresAt.value) return true;
    return Date.now() >= expiresAt.value * 1000;
  });

  const needsRefresh = computed(() => {
    if (!expiresAt.value) return false;
    return Date.now() >= expiresAt.value * 1000 - AUTH_CONSTANTS.REFRESH_THRESHOLD_5MINUTS * 1000;
  });

  const setAuthData = (tokenResponse: TokenResponse) => {
    accessToken.value = tokenResponse.token;
    refreshToken.value = tokenResponse.refresh_token;
    expiresAt.value = tokenResponse.expires_at;
    user.value = tokenResponse.user;

    if (tokenResponse.user && import.meta.client) {
      localStorage.setItem('currentUser', JSON.stringify(tokenResponse.user));
    }

    console.log('✅ After setting - accessToken:', accessToken.value);
    console.log('✅ After setting - refreshToken:', refreshToken.value);
    console.log('✅ After setting - user:', user.value);
    console.log('✅ After setting - isAuthenticated:', isAuthenticated.value);

    accessTokenCookie.value = tokenResponse.token;
    if (tokenResponse.refresh_token) {
      refreshTokenCookie.value = tokenResponse.refresh_token;
    } else {
      refreshTokenCookie.value = 'no-refresh-token';
    }

    console.log('🍪 Cookies set - accessTokenCookie:', accessTokenCookie.value);
    console.log('🍪 Cookies set - refreshTokenCookie:', refreshTokenCookie.value);
  };

  const clearAuth = () => {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    expiresAt.value = null;

    accessTokenCookie.value = null;
    refreshTokenCookie.value = null;

    if (import.meta.client) {
      localStorage.removeItem('currentUser');
    }
  };

  const initAuth = () => {
    console.log('🔍 initAuth called');

    if (accessTokenCookie.value) {
      accessToken.value = accessTokenCookie.value;
      console.log('✅ initAuth - tokens restored');
      if (!user.value) {
        try {
          const savedUser = localStorage.getItem('currentUser');
          if (savedUser) {
            user.value = JSON.parse(savedUser);
          }
        } catch (error) {
          console.error('Не удалось загрузить данные из LS');
        }
      }
    } else {
      console.log('❌ initAuth - no tokens found');
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    isLoading.value = true;
    try {
      const response = await $api.post<TokenResponse>('/users/login', credentials);
      setAuthData(response);
      return response;
    } catch (error) {
      throw handleApiError(error);
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (userData: { email: string; password: string; name?: string }) => {
    isLoading.value = true;
    try {
      // 1. Сначала регистрация
      await $api.post('/users/registration', userData);

      // 2. Затем автоматический логин
      const loginResponse = await $api.post<TokenResponse>('/users/login', {
        email: userData.email,
        password: userData.password,
      });

      setAuthData(loginResponse);
      return loginResponse;
    } catch (error) {
      throw handleApiError(error);
    } finally {
      isLoading.value = false;
    }
  };

  const refreshTokens = async (): Promise<boolean> => {
    if (!refreshToken.value) {
      clearAuth();
      return false;
    }

    try {
      // ПРЕДПОЛОЖИТЕЛЬНЫЙ эндпоинт - нужно проверить
      const response = await $api.post<TokenResponse>('/auth/refresh', {
        refresh_token: refreshToken.value,
      });
      setAuthData(response);
      return true;
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      clearAuth();
      return false;
    }
  };

  const logout = () => {
    clearAuth();
    navigateTo('/');
  };

  const isValidToken = async (): Promise<boolean> => {
    if (!accessToken.value) return false;
    if (needsRefresh.value) {
      return await refreshTokens();
    }
    return true;
  };

  const getRegisteredUsers = async (): Promise<User[]> => {
    const isValid = await isValidToken();
    if (!isValid) throw new Error('Not authenticated');

    try {
      const users = await $api.get<User[]>('/users');
      return users;
    } catch (error: any) {
      throw handleApiError(error);
    }
  };

  const updateProfile = async (profileData: UpdateProfileRequest): Promise<User> => {
    const isValid = await isValidToken();
    if (!isValid || !user.value) throw new Error('Not authenticated');

    try {
      // ПРЕДПОЛОЖИТЕЛЬНЫЙ эндпоинт для обновления профиля
      const updatedUser = await $api.put<User>('/users/profile', profileData);
      user.value = { ...user.value, ...updatedUser };
      return updatedUser;
    } catch (error: any) {
      // Если эндпоинта нет - обновляем локально
      console.warn('Update profile endpoint not available, updating locally');
      user.value = { ...user.value, ...profileData };
      return user.value;
    }
  };

  const changePassword = async (passwordData: ChangePasswordRequest): Promise<void> => {
    const isValid = await isValidToken();
    if (!isValid || !user.value) throw new Error('Not authenticated');

    try {
      // ПРЕДПОЛОЖИТЕЛЬНЫЙ эндпоинт для смены пароля
      await $api.post('/users/change-password', passwordData);
    } catch (error: any) {
      throw handleApiError(error);
    }
  };

  // Настройки уведомлений ПОКА локальные (жду бек)
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
    user,
    accessToken,
    isLoading,
    isAuthenticated,
    isTokenExpired,
    needsRefresh,
    initAuth,
    login,
    register,
    logout,
    refreshTokens,
    getRegisteredUsers,
    updateProfile,
    changePassword,
    getNotificationSettings,
    updateNotificationSettings,
    isValidToken,
  };
});
