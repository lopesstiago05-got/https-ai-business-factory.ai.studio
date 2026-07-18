import { PlatformMetrics, AgentHealth } from './enterpriseTypes.ts';
import { MonitoringService } from './monitoringService.ts';
import { AuditService } from './auditService.ts';
import { SecurityService } from './securityService.ts';
import { AlertEngine } from './alertEngine.ts';
import { ComplianceService } from './complianceService.ts';

export class OperationsService {
  /**
   * Coleta métricas gerais em tempo real da plataforma para o dashboard do Enterprise Operations Center
   */
  public static getPlatformMetrics(): PlatformMetrics {
    const agents = MonitoringService.getAgentsHealth();
    const activeAlerts = SecurityService.getAlerts().filter(a => a.status === 'ACTIVE');
    const logs = AuditService.getLogs();

    // Contagem de execuções hoje (baseado em logs de auditoria das últimas 24h ou total dos agentes)
    const activeAgentsCount = agents.filter(a => a.status === 'ONLINE' || a.status === 'DEGRADED').length;
    const totalExecutionsToday = agents.reduce((sum, a) => sum + a.totalExecutions, 0);
    const averageResponseTime = agents.length > 0
      ? Math.round(agents.reduce((sum, a) => sum + a.avgResponseTimeMs, 0) / agents.length)
      : 0;
    
    const overallSuccessSum = agents.reduce((sum, a) => sum + a.successRate, 0);
    const successRateOverall = agents.length > 0
      ? Number((overallSuccessSum / agents.length).toFixed(1))
      : 100;

    let overallHealth = 'HEALTHY';
    if (activeAlerts.some(a => a.severity === 'CRITICAL')) {
      overallHealth = 'CRITICAL';
    } else if (agents.some(a => a.status === 'ERROR') || activeAlerts.some(a => a.severity === 'HIGH')) {
      overallHealth = 'DEGRADED';
    }

    return {
      overallHealth,
      activeAgentsCount,
      totalExecutionsToday,
      averageResponseTime,
      successRateOverall,
      incidentsActiveCount: activeAlerts.length
    };
  }

  /**
   * Simula um evento de carga ou estresse para fins de auditoria e teste das engrenagens do painel
   */
  public static async simulatePlatformStress(): Promise<{ success: boolean; incidentRaised?: any }> {
    // 1. Registrar um login suspeito
    SecurityService.analyzeSuspiciousBehavior(
      'tenant_default',
      'usr_anon',
      'unknown@anonymous.com',
      'LOGIN',
      { executionsToday: 215, creditsUsedToday: 1200, failedAttempts: 6 }
    );

    // 2. Elevar incidente para um agente aleatório (por exemplo Marketing Agent)
    const incident = await AlertEngine.raiseIncident(
      'AGENT_FAILURE',
      'O agente de Marketing disparou erro 429 Rate Limit ao tentar publicar campanhas no Instagram Graph API.',
      'marketing-center'
    );

    // 3. Registrar auditoria do estresse
    AuditService.register(
      'tenant_default',
      'system',
      'governance@enterprise.com',
      'SECURITY_EVENT',
      'SUCCESS',
      { simulated: true, action: 'PLATFORM_STRESS_SIMULATION' }
    );

    return {
      success: true,
      incidentRaised: incident
    };
  }
}
