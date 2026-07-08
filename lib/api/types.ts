import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  CreateLoanRequest,
  CreateLoanResponse,
  CreditReportResponse,
  EvaluateRequest,
  EvaluationResponse,
  LoanResponse,
  MarkOverdueRequest,
  MarkOverdueResponse,
  PayLoanRequest,
  PayLoanResponse,
  UserResponse,
} from '../contracts';

export interface ApiErrorPayload {
  message?: string;
  error?: string;
  details?: unknown;
}

export type { AuthResponse, LoginRequest, RegisterRequest };
export type { EvaluateRequest, EvaluationResponse, CreditReportResponse };
export type { CreateLoanRequest, CreateLoanResponse, PayLoanRequest, PayLoanResponse, MarkOverdueRequest, MarkOverdueResponse, LoanResponse, UserResponse };
