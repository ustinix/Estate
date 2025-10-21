export type UserID = string;

export interface User {
  id: UserID;
  name?: string;
  email: string;
  mobile?: string;
  telegram?: string;
}

export interface TokenResponse {
  token: string;
  refresh_token: string;
  expires_at: number;
  user: User;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  isLoading: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  mobile?: string;
  telegram?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface NotificationSettingsRequest {
  emailNotifications: boolean;
  smsNotifications: boolean;
  telegramNotifications: boolean;
}
