export type UserID = string;

export interface User {
  id: UserID;
  name?: string;
  email: string;
  mobile?: string;
  telegram?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  telegram?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: string;
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
