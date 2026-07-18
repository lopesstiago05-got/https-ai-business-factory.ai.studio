import { EvolutionStore, EvolutionState, AgentMetrics } from './evolutionStore.ts';
import { PerformanceEngine } from './performanceEngine.ts';
import { MemoryEngine } from './memoryEngine.ts';
import { LearningEngine } from './learningEngine.ts';
import { OptimizationEngine } from './optimizationEngine.ts';
import { ABTestingEngine } from './abTestingEngine.ts';
import { RecommendationEngine } from './recommendationEngine.ts';

export class EvolutionEngine {
  /**
   * Obtém todo o estado atual do Evolution Engine
   */
  public static getState(): EvolutionState {
    return EvolutionStore.get();
  }

  /**
   * Reseta completamente os dados de evolução do agente
   */
  public static resetAgentEvolution(agentId: string): void {
    const state = EvolutionStore.get();
    
    // Reseta métricas
    delete state.agentMetrics[agentId];
    delete state.performanceHistory[agentId];
    
    // Limpa memórias
    MemoryEngine.clearMemories(agentId);
    
    // Reseta prompts/parâmetros otimizados
    OptimizationEngine.resetOptimizations(agentId);
    
    // Filtra testes e recomendações
    state.abTests = state.abTests.filter(t => t.agentId !== agentId);
    state.recommendations = state.recommendations.filter(r => r.agentId !== agentId);

    EvolutionStore.save(state);
    EvolutionStore.addLog(`Toda a evolução e aprendizados do agente [${agentId}] foram resetados com sucesso.`);
  }

  /**
   * Executa a rota unificada de injeção de evolução em runtime
   * Substitui os prompts padrões e parâmetros pelos otimizados dinamicamente
   */
  public static getRuntimeAgentConfig(agentId: string, basePrompt: string, defaultParams: any = {}): {
    evolvedPrompt: string;
    optimizedParams: any;
  } {
    const evolvedPrompt = OptimizationEngine.getEvolvedPrompt(agentId, basePrompt);
    const optimizedParams = OptimizationEngine.getOptimizedParams(agentId, defaultParams);

    return { evolvedPrompt, optimizedParams };
  }

  /**
   * Registra a execução de uma tarefa com aprendizado automático integrado
   */
  public static async registerAgentTaskExecution(params: {
    agentId: string;
    taskId: string;
    taskTitle: string;
    taskDescription: string;
    executionOutput: string;
    success: boolean;
    durationSeconds: number;
    feedbackReceived?: string;
  }) {
    // 1. Roda o Learning Engine para avaliar, comparar histórico, gerar aprendizado, registrar na memória e parâmetros
    const learningResult = await LearningEngine.evaluateAndLearn(params);

    // 2. Se houver um teste A/B ativo rodando para esse agente, registra a execução na variante correta
    const state = EvolutionStore.get();
    const activeTest = state.abTests.find(t => t.agentId === params.agentId && t.status === 'running');
    if (activeTest) {
      // Identifica qual variante estava em execução pelo log de otimização (ou infere 50/50 baseada na última execução)
      // Gravamos a execução na variante com base na temperatura correspondente ou se era B
      const isVariantB = params.feedbackReceived?.includes('Variante B') || Math.random() > 0.5;
      ABTestingEngine.recordVariantExecution(
        activeTest.id,
        isVariantB ? 'B' : 'A',
        params.success,
        params.durationSeconds,
        learningResult.qualityScore
      );
    }

    return learningResult;
  }
}
