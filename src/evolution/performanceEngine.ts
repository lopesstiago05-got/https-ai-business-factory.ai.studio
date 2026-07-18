import { EvolutionStore, AgentMetrics, PerformanceSnapshot } from './evolutionStore.ts';

export class PerformanceEngine {
  /**
   * Obtém as métricas de desempenho de um agente específico
   */
  public static getMetrics(agentId: string): AgentMetrics {
    const state = EvolutionStore.get();
    if (!state.agentMetrics[agentId]) {
      // Se não existir, gera padrão e grava
      const defaultMetrics: AgentMetrics = {
        performanceScore: 95,
        precision: 93,
        efficiency: 95,
        speed: 15,
        avgResponseTime: 4.5,
        successRate: 100,
        errorRate: 0,
        taskCount: 0,
        failedTaskCount: 0,
        financialImpact: 1000,
        operationalImpact: 80
      };
      state.agentMetrics[agentId] = defaultMetrics;
      EvolutionStore.save(state);
    }
    return state.agentMetrics[agentId];
  }

  /**
   * Registra o resultado de uma tarefa executada por um agente
   */
  public static recordExecution(
    agentId: string,
    success: boolean,
    durationSeconds: number,
    qualityScore?: number, // 0 to 100
    financialImpactAdded: number = 0
  ): AgentMetrics {
    const state = EvolutionStore.get();
    const metrics = this.getMetrics(agentId);

    // Incrementa contagem de tarefas
    metrics.taskCount += 1;
    if (!success) {
      metrics.failedTaskCount += 1;
    }

    // Atualiza Taxa de Sucesso e de Erro
    metrics.successRate = Number(((metrics.taskCount - metrics.failedTaskCount) / metrics.taskCount * 100).toFixed(1));
    metrics.errorRate = Number((metrics.failedTaskCount / metrics.taskCount * 100).toFixed(1));

    // Atualiza Velocidade e tempo de resposta
    // Média móvel ponderada simples para tempo de resposta
    metrics.avgResponseTime = Number(((metrics.avgResponseTime * 4 + durationSeconds) / 5).toFixed(2));
    
    // Mapeia tempo de resposta para pontuação de velocidade (0 a 100, menor tempo = maior velocidade)
    // Se responde em < 2s é 100, se responde em 15s é 50
    metrics.speed = Math.max(10, Math.min(100, Math.round(100 - (metrics.avgResponseTime * 3.3))));

    // Atualiza precisão (baseada em qualidade recebida ou feedback)
    if (qualityScore !== undefined) {
      metrics.precision = Math.round((metrics.precision * 4 + qualityScore) / 5);
    } else {
      // Pequeno incremento ou decremento baseado em sucesso
      if (success) {
        metrics.precision = Math.min(100, metrics.precision + 0.5);
      } else {
        metrics.precision = Math.max(50, metrics.precision - 5);
      }
    }

    // Impacto financeiro
    metrics.financialImpact += financialImpactAdded;

    // Eficiência: ponderado entre taxa de sucesso e velocidade
    metrics.efficiency = Math.round((metrics.successRate * 0.7) + (metrics.precision * 0.3));

    // Impacto operacional: ponderação simples das métricas
    metrics.operationalImpact = Math.round((metrics.efficiency * 0.4) + (metrics.speed * 0.4) + (metrics.precision * 0.2));

    // Score de performance geral do agente
    metrics.performanceScore = Math.round(
      (metrics.efficiency * 0.3) + 
      (metrics.precision * 0.3) + 
      (metrics.speed * 0.2) + 
      (metrics.successRate * 0.2)
    );

    // Grava de volta no estado
    state.agentMetrics[agentId] = metrics;

    // Registra Snapshot histórico para gráficos
    const snapshot: PerformanceSnapshot = {
      timestamp: new Date().toISOString(),
      metrics: { ...metrics }
    };

    if (!state.performanceHistory[agentId]) {
      state.performanceHistory[agentId] = [];
    }
    state.performanceHistory[agentId].push(snapshot);

    // Limita histórico a 50 itens para poupar espaço
    if (state.performanceHistory[agentId].length > 50) {
      state.performanceHistory[agentId].shift();
    }

    EvolutionStore.save(state);
    EvolutionStore.addLog(`Métricas atualizadas para o agente [${agentId}]. Score Geral: ${metrics.performanceScore}%`);

    return metrics;
  }

  /**
   * Recupera o histórico de snapshots de um agente
   */
  public static getHistory(agentId: string): PerformanceSnapshot[] {
    const state = EvolutionStore.get();
    return state.performanceHistory[agentId] || [];
  }
}
