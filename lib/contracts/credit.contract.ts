// Contratos de crédito: frontend -> backend

import type { UserResponse } from './auth.contract';

export interface EvaluateRequest {
  usuarioId: string;
}

export interface EvaluationResponse {
  reporte: CreditReportResponse;
  user: UserResponse;
}

export interface CreditReportResponse {
  scoreCrediticio: number;
  clasificacion: 'CON_HISTORIAL' | 'SIN_HISTORIAL';
  nivelInicial: number;
  montoMaximo: number;
  tasaInteres: number;
  recomendaciones: string[];
}

export interface CreateLoanRequest {
  usuarioId: string;
  monto: number;
}

export interface CreateLoanResponse {
  prestamo: LoanResponse;
  user: UserResponse;
}

export interface PayLoanRequest {
  usuarioId: string;
  prestamoId: string;
  monto: number;
}

export interface PayLoanResponse {
  prestamo: LoanResponse;
  user: UserResponse;
}

export interface MarkOverdueRequest {
  usuarioId: string;
  prestamoId: string;
}

export interface MarkOverdueResponse {
  prestamo: LoanResponse;
  user: UserResponse;
}

export interface LoanResponse {
  id: string;
  usuarioId: string;
  monto: number;
  tasaInteres: number;
  nivelPrestamo: number;
  fechaDesembolso: string;
  fechaVencimiento: string;
  estado: 'ACTIVO' | 'PAGADO' | 'VENCIDO';
  montoPagado: number;
  puntosGanados: number;
  puntosDescuentados: number;
}
