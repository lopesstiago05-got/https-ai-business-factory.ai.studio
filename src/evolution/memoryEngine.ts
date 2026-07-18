import { EvolutionStore, AgentMemoryItem } from './evolutionStore.ts';

export class MemoryEngine {
  /**
   * Adiciona uma nova recordação à memória persistente do agente
   */
  public static recordMemory(params: {
    agentId: string;
    taskId: string;
    taskTitle: string;
    decisionTaken: string;
    result: 'success' | 'failure';
    strategyUsed: string;
    feedbackReceived?: string;
    failureReason?: string;
    bestPracticeLearned?: string;
  }): AgentMemoryItem {
    const state = EvolutionStore.get();
    
    const newItem: AgentMemoryItem = {
      id: 'mem_' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      ...params
    };

    if (!state.memories[params.agentId]) {
      state.memories[params.agentId] = [];
    }

    state.memories[params.agentId].push(newItem);

    // Limita memórias por agente a 100 itens para gerenciar armazenamento
    if (state.memories[params.agentId].length > 100) {
      state.memories[params.agentId].shift();
    }

    EvolutionStore.save(state);
    EvolutionStore.addLog(`Nova memória registrada para [${params.agentId}]: "${params.taskTitle}" (${params.result.toUpperCase()})`);

    return newItem;
  }

  /**
   * Obtém todas as memórias salvas de um agente específico
   */
  public static getMemories(agentId: string): AgentMemoryItem[] {
    const state = EvolutionStore.get();
    return state.memories[agentId] || [];
  }

  /**
   * Recupera lições aprendidas e melhores práticas na memória do agente
   */
  public static getBestPractices(agentId: string): string[] {
    const memories = this.getMemories(agentId);
    return memories
      .filter(m => m.result === 'success' && m.bestPracticeLearned)
      .map(m => m.bestPracticeLearned!)
      .reverse() // mais recentes primeiro
      .slice(0, 5); // top 5
  }

  /**
   * Recupera os últimos erros relatados para que o agente evite repeti-los
   */
  public static getRecentFailures(agentId: string): string[] {
    const memories = this.getMemories(agentId);
    return memories
      .filter(m => m.result === 'failure' && m.failureReason)
      .map(m => m.failureReason!)
      .reverse()
      .slice(0, 5);
  }

  /**
   * Limpa as memórias de um agente
   */
  public static clearMemories(agentId: string): void {
    const state = EvolutionStore.get();
    state.memories[agentId] = [];
    EvolutionStore.save(state);
    EvolutionStore.addLog(`Memória do agente [${agentId}] foi limpa por completo.`);
  }
}
