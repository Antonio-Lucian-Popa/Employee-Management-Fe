import { apiClient } from './axios';
import type {
  AuthResponse,
  User,
  Attendance,
  Leave,
  MonthlyReport,
  Invitation,
  OnboardingResult 
} from '@/types';

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>('/api/v1/auth/login', { email, password }),

  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    apiClient.post<AuthResponse>('/api/v1/auth/register', data),

  refresh: () =>
    apiClient.post<{ accessToken: string }>('/api/v1/auth/refresh'),

  me: () =>
    apiClient.get<User>('/api/v1/auth/me'),

  verifyEmail: (token: string) =>
    apiClient.get(`/api/v1/auth/verify-email?token=${token}`),

  resendVerification: (email: string) =>
    apiClient.post(`/api/v1/auth/verify-email/resend?email=${email}`),

  logout: () =>
    apiClient.post('/api/v1/auth/logout'),
};

export const onboardingApi = {
  completeOwner: (t: string, companyName: string, slug: string) =>
    apiClient.post<OnboardingResult>('/api/v1/auth/google/complete-owner', {
      token: t, companyName, slug,
    }),

  completeInvite: (t: string, invitationToken: string) =>
    apiClient.post<OnboardingResult>('/api/v1/auth/google/complete-invite', {
      token: t, invitationToken,
    }),
};

export const usersApi = {
  getAll: () =>
    apiClient.get<User[]>('/api/v1/users'),

  getById: (id: string) =>
    apiClient.get<User>(`/api/v1/users/${id}`),

  create: (data: Partial<User>) =>
    apiClient.post<User>('/api/v1/users', data),

  update: (id: string, data: Partial<User>) =>
    apiClient.patch<User>(`/api/v1/users/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/api/v1/users/${id}`),
};

export const attendanceApi = {
  getDaily: (date: string) =>
    apiClient.get<Attendance[]>(`/api/v1/attendance/daily?date=${date}`),

  markAttendance: (data: { userId: string; date: string; status: string; notes?: string }) =>
    apiClient.put<Attendance>('/api/v1/attendance', data),
};

export const leavesApi = {
  getAll: () =>
    apiClient.get<Leave[]>('/api/v1/leaves'),

  create: (data: { startDate: string; endDate: string; reason: string }) =>
    apiClient.post<Leave>('/api/v1/leaves', data),

  updateDecision: (id: string, approverId: string, status: string, notes?: string) =>
    apiClient.patch(`/api/v1/leaves/${id}/decision?approverId=${approverId}`, {
      status,
      approverNotes: notes,
    }),
};

export const reportsApi = {
  getMonthly: (month: string) =>
    apiClient.get<MonthlyReport>(`/api/v1/reports/monthly?month=${month}`),
};

export const invitationsApi = {
  send: (email: string, role: string) =>
    apiClient.post('/api/v1/invitations', null, { params: { email, role } }),

  get: (token: string) =>
    apiClient.get<Invitation>(`/api/v1/invitations/${token}`),

  accept: (token: string, password: string, firstName: string, lastName: string) =>
    apiClient.post(`/api/v1/invitations/${token}/accept`,
      null, // fără body
      { params: { firstName, lastName, password } }),
};

export const billingApi = {
  createCheckoutSession: (plan: string) =>
    apiClient.post<{ url: string }>('/api/v1/billing/checkout-session', { plan }),
};
