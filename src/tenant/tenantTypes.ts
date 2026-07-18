export type PlanType = 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';
export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED';
export type UserRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface Tenant {
  id: string;
  name: string;
  currentPlan: PlanType;
  subscriptionStatus: SubscriptionStatus;
  maxAgents: number;
  maxUsers: number;
  maxExecutions: number;
  usedExecutions: number;
  usedCredits: number;
  availableCredits: number;
  storageMbUsed: number;
  createdAt: string;
}

export interface TenantUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string;
  status: 'active' | 'invited';
}

export interface UsageReport {
  usedExecutions: number;
  maxExecutions: number;
  usedCredits: number;
  availableCredits: number;
  storageMbUsed: number;
  percentageExecutions: number;
  percentageCredits: number;
}

export interface SaaSAdminMetrics {
  totalTenants: number;
  activeUsersCount: number;
  estimatedMonthlyRevenue: number;
  planDistribution: Record<PlanType, number>;
  totalAiCreditsConsumed: number;
  systemAlertsCount: number;
}
