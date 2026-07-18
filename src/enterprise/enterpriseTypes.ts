export type AgentStatusType = 'ONLINE' | 'DEGRADED' | 'ERROR' | 'OFFLINE';
export type IncidentSeverityType = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatusType = 'OPEN' | 'INVESTIGATING' | 'RESOLVED';

export interface AgentHealth {
  id: string;
  name: string;
  status: AgentStatusType;
  totalExecutions: number;
  successRate: number; // 0 - 100
  avgResponseTimeMs: number;
  geminiCreditsUsed: number;
  errorCount: number;
  lastExecutionAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  tenantId: string;
  userId: string;
  userEmail: string;
  agentId?: string;
  action: 'LOGIN' | 'AGENT_EXECUTION' | 'AGENT_INSTALL' | 'PLAN_CHANGE' | 'USER_PERMISSION_CHANGE' | 'DATA_ACCESS' | 'SECURITY_EVENT';
  result: 'SUCCESS' | 'FAILED' | 'BLOCKED';
  ipAddress: string;
  metadata: Record<string, any>;
}

export interface SecurityThreatAlert {
  id: string;
  timestamp: string;
  severity: IncidentSeverityType;
  type: string; // e.g. 'RATE_LIMIT_EXCEEDED', 'UNAUTHORIZED_ACCESS', 'EXCESSIVE_CONSUMPTION'
  description: string;
  tenantId?: string;
  userId?: string;
  status: 'ACTIVE' | 'DISMISSED';
}

export interface AIIncident {
  id: string;
  timestamp: string;
  agentId?: string;
  type: 'AGENT_FAILURE' | 'SYSTEM_DEGRADATION' | 'SECURITY_ALERT' | 'RECOVERY_COMPLETED';
  description: string;
  probableCause: string;
  impactAnalysis: string;
  recommendedAction: string;
  status: IncidentStatusType;
  resolvedAt?: string;
}

export interface ComplianceScore {
  mfaUsageRate: number; // 0-100
  dataRetentionDays: number;
  gdprConsentSigned: boolean;
  activeDataExports: number;
  unauthorizedAttemptsRate: number;
  overallScore: number; // 0-100
}

export interface PlatformMetrics {
  overallHealth: string;
  activeAgentsCount: number;
  totalExecutionsToday: number;
  averageResponseTime: number;
  successRateOverall: number;
  incidentsActiveCount: number;
}
