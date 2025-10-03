export type UserRole = 'OWNER' | 'ADMIN' | 'EMPLOYEE';
export type SubscriptionPlan = 'FREE' | 'PRO' | 'ENTERPRISE' | 'TRIAL';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LEAVE';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
  createdAt: string;
  emailVerified: boolean;
  avatarUrl?: string;
}

export interface OnboardingResult {
  userId: string;
  tenant: string;
  role: string;
  // serverul poate trimite și setCookies pentru dev; nu e necesar aici
};

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  plan: SubscriptionPlan;
  createdAt: string;
  subscriptionExpiresAt?: string;
}

export interface Attendance {
  id: string;
  userId: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
  user?: User;
}

export interface Leave {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  approverId?: string;
  approverNotes?: string;
  createdAt: string;
  user?: User;
  approver?: User;
}

export interface MonthlyReport {
  month: string;
  totalEmployees: number;
  averageAttendance: number;
  totalLeaves: number;
  departmentStats: Array<{
    department: string;
    attendanceRate: number;
  }>;
  dailyAttendance: Array<{
    date: string;
    present: number;
    absent: number;
    onLeave: number;
  }>;
}

export interface Invitation {
  token: string;
  email: string;
  role: UserRole;
  tenantId: string;
  acceptedAt: string | null;
  tenantName: string | null;
  createdBy: string | null;    // doar id-ul (sau null), nu obiect
  createdAt: string;
  expiresAt: string;
  invitedBy: User;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}
