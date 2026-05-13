import { apiClient } from "./client";
import type {
  UserResponse,
  LoginUserResponse,
} from "@/schemas/user.schemas";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  city: string;
  role?: string;
}

export interface UpdateUserRequest {
  email: string;
  role?: string;
}

export interface UpdateUserRoleRequest {
  newRole: string;
}

export const usersApi = {
  login: (body: LoginRequest) =>
    apiClient.post<LoginUserResponse>("/api/users/login", body),

  register: (body: RegisterRequest) =>
    apiClient.post<UserResponse>("/api/users/register", body),

  refresh: (body: { token: string; refreshToken: string }) =>
    apiClient.post<LoginUserResponse>("/api/users/refresh", body),

  getAll: () => apiClient.get<UserResponse[]>("/api/users"),

  getById: (userId: string) =>
    apiClient.get<UserResponse>(`/api/users/${userId}`),

  update: (userId: string, body: UpdateUserRequest) =>
    apiClient.put<UserResponse>(`/api/users/${userId}`, body),

  updateRole: (userId: string, body: UpdateUserRoleRequest) =>
    apiClient.post<void>(`/api/users/${userId}/role`, body),

  delete: (userId: string) => apiClient.delete<void>(`/api/users/${userId}`),

  forgotPassword: (body: { email: string }) =>
    apiClient.post<void>("/api/users/forgot-password", body),

  resetPassword: (body: { email: string; token: string; newPassword: string }) =>
    apiClient.post<void>("/api/users/reset-password", body),
};
