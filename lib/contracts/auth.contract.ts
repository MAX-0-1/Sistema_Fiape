// Contratos de autenticación: frontend -> backend

import type { LoanResponse } from './credit.contract';

export interface RegisterRequest {
  nombres: string;
  apellidos: string;
  dni: string;
  email: string;
  telefono: string;
}

export interface LoginRequest {
  dni: string;
  email: string;
}

export interface AuthResponse {
  user: UserResponse;
  token?: string;
}

export interface UserResponse {
  id: string;
  nombres: string;
  apellidos: string;
  dni: string;
  email: string;
  telefono: string;
  fechaRegistro: string;
  evaluado: boolean;
  tipoHistorial: 'CON_HISTORIAL' | 'SIN_HISTORIAL' | null;
  nivelActual: number;
  saldoDisponible: number;
  puntosTotal: number;
  prestamosActivos: LoanResponse[];
  historicoCredito: LoanResponse[];
  reportadoEnInfocorp: boolean;
}

export interface UserWithLoansResponse extends UserResponse {
  prestamosActivos: LoanResponse[];
  historicoCredito: LoanResponse[];
}
