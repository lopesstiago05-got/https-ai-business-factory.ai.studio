import fs from 'fs';
import path from 'path';
import { ComplianceScore } from './enterpriseTypes.ts';
import { AuditService } from './auditService.ts';

const COMPLIANCE_FILE = path.join(process.cwd(), 'compliance_db.json');

export class ComplianceService {
  private static loadCompliance(): ComplianceScore {
    try {
      if (fs.existsSync(COMPLIANCE_FILE)) {
        const content = fs.readFileSync(COMPLIANCE_FILE, 'utf-8');
        return JSON.parse(content) as ComplianceScore;
      }
    } catch (err: any) {
      console.error('[ComplianceService] Erro ao carregar conformidade:', err.message);
    }
    return this.getInitialCompliance();
  }

  private static saveCompliance(compliance: ComplianceScore): void {
    try {
      fs.writeFileSync(COMPLIANCE_FILE, JSON.stringify(compliance, null, 2), 'utf-8');
    } catch (err: any) {
      console.error('[ComplianceService] Erro ao salvar conformidade:', err.message);
    }
  }

  private static getInitialCompliance(): ComplianceScore {
    const defaultCompliance: ComplianceScore = {
      mfaUsageRate: 85,
      dataRetentionDays: 90,
      gdprConsentSigned: true,
      activeDataExports: 2,
      unauthorizedAttemptsRate: 1.2,
      overallScore: 94
    };
    try {
      fs.writeFileSync(COMPLIANCE_FILE, JSON.stringify(defaultCompliance, null, 2), 'utf-8');
    } catch {}
    return defaultCompliance;
  }

  public static getComplianceData(): ComplianceScore {
    // Calcular dinamicamente score baseado em tentativas de segurança e auditorias
    const logs = AuditService.getLogs();
    const securityAlertsCount = logs.filter(l => l.action === 'SECURITY_EVENT').length;
    
    const compliance = this.loadCompliance();
    
    // Ajustar pontuação geral baseada em alertas de segurança
    let computedScore = 100 - (securityAlertsCount * 1.5) - (compliance.activeDataExports * 2);
    if (computedScore < 50) computedScore = 50;
    
    compliance.overallScore = Math.round(computedScore);
    this.saveCompliance(compliance);
    
    return compliance;
  }

  public static updateRetentionDays(days: number): void {
    const compliance = this.loadCompliance();
    compliance.dataRetentionDays = days;
    this.saveCompliance(compliance);

    AuditService.register(
      'tenant_default',
      'system',
      'compliance_officer@enterprise.com',
      'USER_PERMISSION_CHANGE',
      'SUCCESS',
      { action: 'UPDATE_RETENTION_POLICY', oldDays: compliance.dataRetentionDays, newDays: days }
    );
  }

  public static generateReport(): {
    title: string;
    timestamp: string;
    metrics: ComplianceScore;
    recommendations: string[];
    criticalEvents: { timestamp: string; action: string; email: string; details: any }[];
  } {
    const metrics = this.getComplianceData();
    const logs = AuditService.getLogs();
    
    // Obter os últimos eventos críticos
    const criticalLogs = logs
      .filter(l => l.action === 'SECURITY_EVENT' || l.action === 'PLAN_CHANGE' || l.action === 'USER_PERMISSION_CHANGE')
      .slice(0, 10);

    const recommendations: string[] = [];
    if (metrics.mfaUsageRate < 100) {
      recommendations.push('Forçar autenticação multifator (MFA) obrigatória para todos os administradores.');
    }
    if (metrics.dataRetentionDays > 60) {
      recommendations.push('Reduzir prazo de retenção de logs para 60 dias para maior conformidade com a LGPD/GDPR.');
    }
    if (metrics.activeDataExports > 0) {
      recommendations.push('Auditar e revogar acessos de exportação automática de relatórios inativos.');
    }
    if (recommendations.length === 0) {
      recommendations.push('Todos os quesitos de governança encontram-se em níveis excepcionais.');
    }

    return {
      title: 'Enterprise AI Governance & Compliance Report',
      timestamp: new Date().toISOString(),
      metrics,
      recommendations,
      criticalEvents: criticalLogs.map(l => ({
        timestamp: l.timestamp,
        action: l.action,
        email: l.userEmail,
        details: l.metadata
      }))
    };
  }
}
