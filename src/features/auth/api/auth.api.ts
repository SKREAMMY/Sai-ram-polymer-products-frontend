import api from "../../../api/axios";
import { type ApiResponse, type User } from "../../../types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<ApiResponse<AuthResponse>>("/auth/login", payload),

  register: (payload: { full_name: string; email: string; password: string }) =>
    api.post<ApiResponse<User>>("/auth/register", payload),

  logout: (refresh_token: string) =>
    api.post("/auth/logout", { refresh_token }),

  me: () => api.get<ApiResponse<User>>("/auth/me"),
};
