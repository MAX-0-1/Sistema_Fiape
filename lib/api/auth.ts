import { api } from './client';
import type { AuthResponse, LoginRequest, RegisterRequest } from './types';

export const authApi = {
  login: (payload: LoginRequest) => api.post<AuthResponse>('/auth/login', payload),
  register: (payload: RegisterRequest) => api.post<AuthResponse>('/auth/register', payload),
  me: () => api.get<AuthResponse>('/auth/me'),
};
