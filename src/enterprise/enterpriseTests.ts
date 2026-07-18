import { OperationsService } from './operationsService.ts';
import { AuditService } from './auditService.ts';
import { SecurityService } from './securityService.ts';
import { MonitoringService } from './monitoringService.ts';
import { AlertEngine } from './alertEngine.ts';
import { ComplianceService } from './complianceService.ts';
import { SupervisorAgent } from '../agents/supervisor.ts';

export async function runEnterpriseTests(): Promise<{ success: boolean; results: string[]; errors: string[] }> {
  const results: string[] = [];
  const errors: string[] = [];

  const runTest = async (name: string, fn: () => Promise<void> | void) => {
    try {
      await fn();
      results.push(`PASS: ${name}`);
    } catch (err: any) {
      const msg = `FAIL: ${name} -> ${err.message}`;
      errors.push(msg);
      results.push(msg);
    }
  };

  // Test 1: Operations metrics validation
  await runTest('operationsService - Realtime Platform Metrics calculation', async () => {
    const metrics = OperationsService.getPlatformMetrics();
    if (!metrics) throw new Error('Platform metrics should be returned');
    if (typeof metrics.activeAgentsCount !== 'number') throw new Error('Active agents count should be a number');
    if (typeof metrics.successRateOverall !== 'number') throw new Error('Overall success rate should be a number');
    if (!metrics.overallHealth) throw new Error('Overall health status should be present');
  });

  // Test 2: Monitoring engine health record check
  await runTest('monitoringService - Agent Health statuses recovery', async () => {
    const health = MonitoringService.getAgentsHealth();
    if (!Array.isArray(health) || health.length === 0) throw new Error('Should load at least one agent health record');
    const ceo = health.find(a => a.id === 'ceo');
    if (!ceo) throw new Error('CEO Agent should be in health list');
    if (ceo.status !== 'ONLINE') throw new Error('CEO status should be ONLINE initially');
  });

  // Test 3: Audit service log insertion
  await runTest('auditService - New audit log entry insertion', async () => {
    const action = 'AGENT_EXECUTION';
    const log = AuditService.register('tenant_test', 'usr_test', 'test@test.com', action, 'SUCCESS', { unitTest: true }, 'ceo');
    if (!log || log.action !== action) throw new Error('Failed to register audit log');
  });

  // Test 4: Audit log query & filter system
  await runTest('auditService - Filter audit logs by criteria', async () => {
    const logs = AuditService.getLogs({ tenantId: 'tenant_test' });
    if (logs.length === 0) throw new Error('Filtered logs by tenant should not be empty');
    if (!logs.every(l => l.tenantId === 'tenant_test')) throw new Error('All returned logs should match tenant_test');
  });

  // Test 5: Security service threat generation
  await runTest('securityService - Auto threat alert generation', async () => {
    const alert = SecurityService.generateAlert('HIGH', 'SUSPICIOUS_BEHAVIOR', 'Teste de ameaça unitária', 'tenant_test');
    if (!alert || alert.severity !== 'HIGH') throw new Error('Failed to generate security alert');
  });

  // Test 6: Security service threat dismissal
  await runTest('securityService - Dismiss active threat alert', async () => {
    const alerts = SecurityService.getAlerts();
    const activeAlert = alerts.find(a => a.status === 'ACTIVE' && a.tenantId === 'tenant_test');
    if (!activeAlert) throw new Error('Active alert not found');
    const ok = SecurityService.dismissAlert(activeAlert.id);
    if (!ok) throw new Error('Dismiss should return true');
    const updated = SecurityService.getAlerts().find(a => a.id === activeAlert.id);
    if (!updated || updated.status !== 'DISMISSED') throw new Error('Alert status was not updated to DISMISSED');
  });

  // Test 7: AI Incident detection and cause analysis
  await runTest('alertEngine - Raise and analyze AI incidents', async () => {
    const incident = await AlertEngine.raiseIncident('AGENT_FAILURE', 'Designer Agent failing to upload svg asset', 'design-studio', 'tenant_test');
    if (!incident) throw new Error('Incident should be generated');
    if (incident.status !== 'OPEN') throw new Error('New incident status should be OPEN');
    if (!incident.probableCause || !incident.recommendedAction) throw new Error('Incident should contain cause and recommendation');
  });

  // Test 8: Compliance score calculation & Auto-healing supervisor suggestions
  await runTest('complianceService & supervisor - Compliance report & healing suggestions', async () => {
    const report = ComplianceService.generateReport();
    if (!report || !report.metrics) throw new Error('Compliance report should contain metrics');
    if (typeof report.metrics.overallScore !== 'number') throw new Error('Compliance overall score should be a number');

    const suggestions = await SupervisorAgent.getAutoHealingSuggestions();
    if (!Array.isArray(suggestions) || suggestions.length === 0) throw new Error('Supervisor should suggest auto healing actions');
  });

  const success = errors.length === 0;
  return {
    success,
    results,
    errors
  };
}
