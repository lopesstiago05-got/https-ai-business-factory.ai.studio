import fs from 'fs';
import path from 'path';
import { AuditLog } from './enterpriseTypes.ts';

const AUDIT_LOGS_FILE = path.join(process.cwd(), 'audit_logs_db.json');

export class AuditService {
  private static loadLogs(): AuditLog[] {
    try {
      if (fs.existsSync(AUDIT_LOGS_FILE)) {
        const content = fs.readFileSync(AUDIT_LOGS_FILE, 'utf-8');
        return JSON.parse(content) as AuditLog[];
      }
    } catch (err: any) {
      console.error('[AuditService] Erro ao carregar logs:', err.message);
    }
    return this.getInitialLogs();
  }

  private static saveLogs(logs: AuditLog[]): void {
    try {
      fs.writeFileSync(AUDIT_LOGS_FILE, JSON.stringify(logs, null, 2), 'utf-8');
    } catch (err: any) {
      console.error('[AuditService] Erro ao salvar logs:', err.message);
    }
  }

  private static getInitialLogs(): AuditLog[] {
    const defaultLogs: AuditLog[] = [
      {
        id: 'aud_1',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        tenantId: 'tenant_default',
        userId: 'usr_default',
        userEmail: 'ceo@enterprise.com',
        action: 'LOGIN',
        result: 'SUCCESS',
        ipAddress: '192.168.1.1',
        metadata: { browser: 'Chrome', os: 'Linux' }
      },
      {
        id: 'aud_2',
        timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
        tenantId: 'tenant_default',
        userId: 'usr_default',
        userEmail: 'ceo@enterprise.com',
        agentId: 'mp_social_media',
        action: 'AGENT_INSTALL',
        result: 'SUCCESS',
        ipAddress: '192.168.1.1',
        metadata: { agentName: 'Social Media Agent', catalogId: 'mp_social_media' }
      },
      {
        id: 'aud_3',
        timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
        tenantId: 'tenant_default',
        userId: 'usr_default',
        userEmail: 'ceo@enterprise.com',
        agentId: 'ceo',
        action: 'AGENT_EXECUTION',
        result: 'SUCCESS',
        ipAddress: '192.168.1.1',
        metadata: { runtimeMs: 1450, responseStatus: 'success' }
      },
      {
        id: 'aud_4',
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        tenantId: 'tenant_default',
        userId: 'usr_default',
        userEmail: 'ceo@enterprise.com',
        action: 'PLAN_CHANGE',
        result: 'SUCCESS',
        ipAddress: '192.168.1.1',
        metadata: { oldPlan: 'FREE', newPlan: 'PRO', mrrChange: 97 }
      },
      {
        id: 'aud_5',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        tenantId: 'tenant_default',
        userId: 'usr_admin',
        userEmail: 'admin@enterprise.com',
        action: 'USER_PERMISSION_CHANGE',
        result: 'SUCCESS',
        ipAddress: '192.168.1.10',
        metadata: { targetUserId: 'usr_member', targetUserEmail: 'member@enterprise.com', newRole: 'ADMIN' }
      }
    ];
    try {
      fs.writeFileSync(AUDIT_LOGS_FILE, JSON.stringify(defaultLogs, null, 2), 'utf-8');
    } catch {}
    return defaultLogs;
  }

  public static getLogs(filters?: {
    tenantId?: string;
    userEmail?: string;
    action?: string;
    dateFrom?: string;
  }): AuditLog[] {
    let logs = this.loadLogs();

    if (filters) {
      if (filters.tenantId) {
        logs = logs.filter(log => log.tenantId === filters.tenantId);
      }
      if (filters.userEmail) {
        logs = logs.filter(log => log.userEmail.toLowerCase().includes(filters.userEmail!.toLowerCase()));
      }
      if (filters.action) {
        logs = logs.filter(log => log.action === filters.action);
      }
      if (filters.dateFrom) {
        const fromTime = new Date(filters.dateFrom).getTime();
        logs = logs.filter(log => new Date(log.timestamp).getTime() >= fromTime);
      }
    }

    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public static register(
    tenantId: string,
    userId: string,
    userEmail: string,
    action: AuditLog['action'],
    result: AuditLog['result'],
    metadata: Record<string, any> = {},
    agentId?: string,
    ipAddress: string = '127.0.0.1'
  ): AuditLog {
    const logs = this.loadLogs();
    const newLog: AuditLog = {
      id: `aud_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      tenantId,
      userId,
      userEmail,
      agentId,
      action,
      result,
      ipAddress,
      metadata
    };
    logs.push(newLog);
    this.saveLogs(logs);
    return newLog;
  }
}
