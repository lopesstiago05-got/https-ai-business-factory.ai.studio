import fs from 'fs';
import path from 'path';
import { AgentHealth, AgentStatusType } from './enterpriseTypes.ts';

const AGENT_HEALTH_FILE = path.join(process.cwd(), 'agent_health_db.json');

export class MonitoringService {
  private static loadHealth(): AgentHealth[] {
    try {
      if (fs.existsSync(AGENT_HEALTH_FILE)) {
        const content = fs.readFileSync(AGENT_HEALTH_FILE, 'utf-8');
        return JSON.parse(content) as AgentHealth[];
      }
    } catch (err: any) {
      console.error('[MonitoringService] Erro ao carregar saúde dos agentes:', err.message);
    }
    return this.getInitialHealth();
  }

  private static saveHealth(health: AgentHealth[]): void {
    try {
      fs.writeFileSync(AGENT_HEALTH_FILE, JSON.stringify(health, null, 2), 'utf-8');
    } catch (err: any) {
      console.error('[MonitoringService] Erro ao salvar saúde dos agentes:', err.message);
    }
  }

  private static getInitialHealth(): AgentHealth[] {
    const defaultHealth: AgentHealth[] = [
      { id: 'ceo', name: 'CEO Agent', status: 'ONLINE', totalExecutions: 145, successRate: 98.6, avgResponseTimeMs: 1450, geminiCreditsUsed: 435, errorCount: 2, lastExecutionAt: new Date().toISOString() },
      { id: 'research', name: 'Research Agent', status: 'ONLINE', totalExecutions: 210, successRate: 97.1, avgResponseTimeMs: 3100, geminiCreditsUsed: 840, errorCount: 6, lastExecutionAt: new Date().toISOString() },
      { id: 'market-analyst', name: 'Market Analyst', status: 'ONLINE', totalExecutions: 180, successRate: 95.5, avgResponseTimeMs: 2500, geminiCreditsUsed: 540, errorCount: 8, lastExecutionAt: new Date().toISOString() },
      { id: 'product-lab', name: 'Product Creator', status: 'ONLINE', totalExecutions: 112, successRate: 99.1, avgResponseTimeMs: 1800, geminiCreditsUsed: 336, errorCount: 1, lastExecutionAt: new Date().toISOString() },
      { id: 'writer-studio', name: 'Writer Agent', status: 'ONLINE', totalExecutions: 340, successRate: 96.4, avgResponseTimeMs: 1200, geminiCreditsUsed: 680, errorCount: 12, lastExecutionAt: new Date().toISOString() },
      { id: 'design-studio', name: 'Designer Agent', status: 'ONLINE', totalExecutions: 198, successRate: 94.9, avgResponseTimeMs: 4200, geminiCreditsUsed: 990, errorCount: 10, lastExecutionAt: new Date().toISOString() },
      { id: 'marketing-center', name: 'Marketing Agent', status: 'DEGRADED', totalExecutions: 275, successRate: 89.4, avgResponseTimeMs: 2200, geminiCreditsUsed: 825, errorCount: 29, lastExecutionAt: new Date().toISOString() },
      { id: 'publisher-center', name: 'Publisher Agent', status: 'ONLINE', totalExecutions: 155, successRate: 98.0, avgResponseTimeMs: 1100, geminiCreditsUsed: 155, errorCount: 3, lastExecutionAt: new Date().toISOString() },
      { id: 'finance-center', name: 'Finance Agent', status: 'ONLINE', totalExecutions: 92, successRate: 100.0, avgResponseTimeMs: 1600, geminiCreditsUsed: 184, errorCount: 0, lastExecutionAt: new Date().toISOString() },
      { id: 'supervisor', name: 'Supervisor Agent', status: 'ONLINE', totalExecutions: 450, successRate: 99.5, avgResponseTimeMs: 850, geminiCreditsUsed: 450, errorCount: 2, lastExecutionAt: new Date().toISOString() },
      { id: 'customer-success', name: 'Customer Success', status: 'ONLINE', totalExecutions: 312, successRate: 98.1, avgResponseTimeMs: 1500, geminiCreditsUsed: 624, errorCount: 6, lastExecutionAt: new Date().toISOString() },
      { id: 'marketplace', name: 'Marketplace Agent', status: 'ONLINE', totalExecutions: 128, successRate: 97.6, avgResponseTimeMs: 1350, geminiCreditsUsed: 256, errorCount: 3, lastExecutionAt: new Date().toISOString() }
    ];
    try {
      fs.writeFileSync(AGENT_HEALTH_FILE, JSON.stringify(defaultHealth, null, 2), 'utf-8');
    } catch {}
    return defaultHealth;
  }

  public static getAgentsHealth(): AgentHealth[] {
    return this.loadHealth();
  }

  public static updateAgentMetrics(
    id: string,
    executionTimeMs: number,
    isSuccess: boolean,
    geminiCredits: number
  ): void {
    const health = this.loadHealth();
    const idx = health.findIndex(a => a.id === id);
    if (idx !== -1) {
      const agent = health[idx];
      agent.totalExecutions += 1;
      agent.geminiCreditsUsed += geminiCredits;
      agent.lastExecutionAt = new Date().toISOString();
      
      if (!isSuccess) {
        agent.errorCount += 1;
      }

      // Re-calcular taxa de sucesso
      agent.successRate = Number(((agent.totalExecutions - agent.errorCount) / agent.totalExecutions * 100).toFixed(1));
      
      // Média móvel simples do tempo de resposta
      agent.avgResponseTimeMs = Math.round((agent.avgResponseTimeMs * 4 + executionTimeMs) / 5);

      // Atualizar status baseado em erros recentes
      if (agent.successRate < 80) {
        agent.status = 'ERROR';
      } else if (agent.successRate < 92) {
        agent.status = 'DEGRADED';
      } else {
        agent.status = 'ONLINE';
      }

      this.saveHealth(health);
    }
  }

  public static setAgentStatus(id: string, status: AgentStatusType): void {
    const health = this.loadHealth();
    const idx = health.findIndex(a => a.id === id);
    if (idx !== -1) {
      health[idx].status = status;
      this.saveHealth(health);
    }
  }
}
