import fs from 'fs';
import path from 'path';
import { SecurityThreatAlert, IncidentSeverityType } from './enterpriseTypes.ts';
import { AuditService } from './auditService.ts';

const SECURITY_ALERTS_FILE = path.join(process.cwd(), 'security_alerts_db.json');

export class SecurityService {
  private static loadAlerts(): SecurityThreatAlert[] {
    try {
      if (fs.existsSync(SECURITY_ALERTS_FILE)) {
        const content = fs.readFileSync(SECURITY_ALERTS_FILE, 'utf-8');
        return JSON.parse(content) as SecurityThreatAlert[];
      }
    } catch (err: any) {
      console.error('[SecurityService] Erro ao carregar alertas:', err.message);
    }
    return this.getInitialAlerts();
  }

  private static saveAlerts(alerts: SecurityThreatAlert[]): void {
    try {
      fs.writeFileSync(SECURITY_ALERTS_FILE, JSON.stringify(alerts, null, 2), 'utf-8');
    } catch (err: any) {
      console.error('[SecurityService] Erro ao salvar alertas:', err.message);
    }
  }

  private static getInitialAlerts(): SecurityThreatAlert[] {
    const defaultAlerts: SecurityThreatAlert[] = [
      {
        id: 'sec_1',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        severity: 'MEDIUM',
        type: 'UNAUTHORIZED_ACCESS',
        description: 'Múltiplas tentativas falhas de login detectadas a partir do IP 198.51.100.42.',
        tenantId: 'tenant_default',
        status: 'ACTIVE'
      },
      {
        id: 'sec_2',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        severity: 'LOW',
        type: 'RATE_LIMIT_EXCEEDED',
        description: 'Workspace atingiu 90% do limite mensal de execuções de agentes IA.',
        tenantId: 'tenant_default',
        status: 'ACTIVE'
      }
    ];
    try {
      fs.writeFileSync(SECURITY_ALERTS_FILE, JSON.stringify(defaultAlerts, null, 2), 'utf-8');
    } catch {}
    return defaultAlerts;
  }

  public static getAlerts(): SecurityThreatAlert[] {
    return this.loadAlerts().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public static generateAlert(
    severity: IncidentSeverityType,
    type: string,
    description: string,
    tenantId?: string,
    userId?: string
  ): SecurityThreatAlert {
    const alerts = this.loadAlerts();
    const newAlert: SecurityThreatAlert = {
      id: `sec_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      severity,
      type,
      description,
      tenantId,
      userId,
      status: 'ACTIVE'
    };
    alerts.push(newAlert);
    this.saveAlerts(alerts);

    // Registrar no log de auditoria como evento de segurança
    AuditService.register(
      tenantId || 'system',
      userId || 'system',
      'security@enterprise.com',
      'SECURITY_EVENT',
      'SUCCESS',
      { severity, alertType: type, description }
    );

    return newAlert;
  }

  public static dismissAlert(id: string): boolean {
    const alerts = this.loadAlerts();
    const idx = alerts.findIndex(a => a.id === id);
    if (idx !== -1) {
      alerts[idx].status = 'DISMISSED';
      this.saveAlerts(alerts);
      return true;
    }
    return false;
  }

  public static analyzeSuspiciousBehavior(
    tenantId: string,
    userId: string,
    userEmail: string,
    activityType: string,
    metrics: { executionsToday: number; creditsUsedToday: number; failedAttempts: number }
  ): void {
    if (metrics.failedAttempts >= 5) {
      this.generateAlert(
        'HIGH',
        'BRUTE_FORCE_ATTEMPT',
        `Múltiplas tentativas de acesso inválidas detectadas para o usuário ${userEmail}.`,
        tenantId,
        userId
      );
    }

    if (metrics.creditsUsedToday > 1000) {
      this.generateAlert(
        'CRITICAL',
        'EXCESSIVE_CONSUMPTION',
        `Consumo extremamente alto de créditos de IA detectado nas últimas 24 horas (${metrics.creditsUsedToday} créditos).`,
        tenantId,
        userId
      );
    }

    if (metrics.executionsToday > 200) {
      this.generateAlert(
        'MEDIUM',
        'ABNORMAL_BEHAVIOR',
        `Pico incomum de automação de agentes de IA: ${metrics.executionsToday} execuções registradas hoje.`,
        tenantId,
        userId
      );
    }
  }
}
