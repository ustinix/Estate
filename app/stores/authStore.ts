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
  const isInitialized = ref(false);

  const $api = useApi();

  const accessTokenCookie = useCookie('access-token', {
    maxAge: AUTH_CONSTANTS.ACCESS_TOKEN_MAX_AGE,
    secure: false,
    sameSite: 'lax',
    domain: import.meta.dev ? 'localhost' : undefined,
  });

  const refreshTokenCookie = useCookie<string | null>('refresh-token', {
    maxAge: AUTH_CONSTANTS.REFRESH_TOKEN_MAX_AGE,
    secure: false,
    sameSite: 'lax',
    domain: import.meta.dev ? 'localhost' : undefined,
  });

  const expiresAtCookie = useCookie<number | null>('expires-at', {
    maxAge: AUTH_CONSTANTS.REFRESH_TOKEN_MAX_AGE,
    secure: false,
    sameSite: 'lax',
    domain: import.meta.dev ? 'localhost' : undefined,
  });

  const isAuthenticated = computed(() => {
    const hasToken = !!accessToken.value;
    const hasUser = !!user.value;
    return hasToken && hasUser;
  });

  const isTokenExpired = computed(() => {
    if (!expiresAt.value) return true;
    return Date.now() >= expiresAt.value * 1000;
  });

  const needsRefresh = computed(() => {
    if (!expiresAt.value) return false;
    return Date.now() >= expiresAt.value * 1000 - AUTH_CONSTANTS.REFRESH_THRESHOLD * 1000;
  });

  const setAuthData = (tokenResponse: TokenResponse) => {
    accessToken.value = tokenResponse.access_token;
    refreshToken.value = tokenResponse.refresh_token;
    expiresAt.value = tokenResponse.expires_at;
    user.value = tokenResponse.user;

    if (import.meta.client) {
      localStorage.setItem('currentUser', JSON.stringify(tokenResponse.user));
    }

    accessTokenCookie.value = tokenResponse.access_token;
    if (tokenResponse.refresh_token) {
      refreshTokenCookie.value = tokenResponse.refresh_token;
    }
    expiresAtCookie.value = tokenResponse.expires_at;
  };

  const clearAuth = () => {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    expiresAt.value = null;

    accessTokenCookie.value = null;
    refreshTokenCookie.value = null;
    expiresAtCookie.value = null;

    if (import.meta.client) {
      localStorage.removeItem('currentUser');
    }
  };

  const initAuth = async () => {
    if (isInitialized.value) return;
    if (!import.meta.client) {
      isInitialized.value = true;
      return;
    }
    const accessTokenFromCookie = accessTokenCookie.value;
    const refreshTokenFromCookie = refreshTokenCookie.value;
    const expiresAtFromCookie = expiresAtCookie.value;

    // Есть access token - просто восстанавливаем состояние
    if (accessTokenFromCookie) {
      accessToken.value = accessTokenFromCookie;
      refreshToken.value = refreshTokenFromCookie;
      expiresAt.value = expiresAtFromCookie;

      if (import.meta.client) {
        try {
          const savedUser = localStorage.getItem('currentUser');
          if (savedUser) {
            user.value = JSON.parse(savedUser);
            await getCurrentUser();
            const isValid = await isValidToken();
            if (!isValid) {
              clearAuth();
            }
          } else {
            clearAuth();
          }
        } catch (error) {
          console.error('❌ Failed to parse user from localStorage:', error);
          clearAuth();
          return;
        }
      }

      const isValid = await isValidToken();
      if (!isValid) {
        clearAuth();
      }
      // Нет access token, но есть refresh token - пытаемся обновить
    } else if (refreshTokenFromCookie && refreshTokenFromCookie !== 'no-refresh-token') {
      refreshToken.value = refreshTokenFromCookie;

      try {
        const refreshSuccess = await refreshTokens();
        if (!refreshSuccess) {
          clearAuth();
        }
      } catch (error) {
        console.error('❌ Refresh token failed:', error);
        clearAuth();
      }

      // Нет никаких токенов - очищаем
    } else {
      clearAuth();
    }
    isInitialized.value = true;
  };

  const login = async (credentials: { email: string; password: string }) => {
    const isValid = await isValidToken();
    if (!isValid) {
      refreshTokens();
    }
    isLoading.value = true;
    try {
      const response = await $api.post<TokenResponse>('/users/login', credentials);
      await getCurrentUser();
      setAuthData(response);
      return response;
    } catch (error) {
      clearAuth();
      throw handleApiError(error);
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (userData: { email: string; password: string; name?: string }) => {
    isLoading.value = true;
    try {
      await $api.post('/users/registration', userData);

      const loginResponse = await $api.post<TokenResponse>('/users/login', {
        email: userData.email,
        password: userData.password,
      });

      setAuthData(loginResponse);
      return loginResponse;
    } catch (error) {
      clearAuth();
      throw handleApiError(error);
    } finally {
      isLoading.value = false;
    }
  };

  const refreshTokens = async (): Promise<boolean> => {
    if (!refreshToken.value) {
      return false;
    }

    try {
      const response = await $api.post<TokenResponse>('/users/refresh-token', {
        refresh_token: refreshToken.value,
      });
      setAuthData(response);
      return true;
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      if (error.status === 401 || error.status === 403) {
        clearAuth();
      }
      return false;
    }
  };

  const logout = async () => {
    clearAuth();
    navigateTo('/');
  };

  const isValidToken = async (): Promise<boolean> => {
    if (!import.meta.client) {
      console.log('SSR: Skipping token validation on server');
      return false;
    }

    if (!accessToken.value || !user.value) {
      return false;
    }

    if (isTokenExpired.value) {
      return await refreshTokens();
    }

    if (needsRefresh.value) {
      const refreshSuccess = await refreshTokens();
      return refreshSuccess || !isTokenExpired.value;
    }

    return true;
  };

  const getCurrentUser = async (): Promise<void> => {
    if (!user.value?.id) return;

    try {
      const updatedUser = await $api.get<User>(`/users/${user.value.id}`);
      user.value = {
        ...user.value,
        ...updatedUser,
        name: updatedUser.name,
        phone: updatedUser.phone,
      };
      if (import.meta.client) {
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const updateProfile = async (
    userId: number,
    profileData: UpdateProfileRequest,
  ): Promise<void> => {
    const isValid = await isValidToken();
    if (!isValid || !user.value) throw new Error('Not authenticated');

    try {
      await $api.put<User>(`/users/${userId}/profile`, profileData);
      // await getCurrentUser();
      user.value = {
        ...user.value,
        ...profileData,
      };
      if (import.meta.client) {
        localStorage.setItem('currentUser', JSON.stringify(user.value));
      }
    } catch (error: any) {
      throw new Error('Не удалось обновить профиль. Сервер недоступен.');
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
    isInitialized,
    needsRefresh,
    initAuth,
    getCurrentUser,
    login,
    register,
    logout,
    refreshTokens,
    updateProfile,
    changePassword,
    getNotificationSettings,
    updateNotificationSettings,
    isValidToken,
  };
});
