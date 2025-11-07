export type UserID = number;

export interface User {
  id: UserID;
  name?: string;
  email: string;
  phone?: string;
  telegram?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: User;
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
  phone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface NotificationSettingsRequest {
  emailNotifications: boolean;
  smsNotifications: boolean;
}
