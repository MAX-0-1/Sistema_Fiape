import { api } from './client';
import type {
  CreateLoanRequest,
  CreateLoanResponse,
  EvaluationResponse,
  MarkOverdueRequest,
  MarkOverdueResponse,
  PayLoanRequest,
  PayLoanResponse,
} from './types';

export const creditApi = {
  evaluate: (payload: { usuarioId: string }) => api.post<EvaluationResponse>('/credit/evaluate', payload),
  createLoan: (payload: CreateLoanRequest) => api.post<CreateLoanResponse>('/loans', payload),
  payLoan: (payload: PayLoanRequest) => api.post<PayLoanResponse>('/loans/pay', payload),
  markOverdue: (payload: MarkOverdueRequest) => api.post<MarkOverdueResponse>('/loans/overdue', payload),
  getUserLoans: (usuarioId: string) => api.get<CreateLoanResponse>(`/loans/user/${usuarioId}`),
};
