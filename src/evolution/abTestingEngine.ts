import { EvolutionStore, ABTest } from './evolutionStore.ts';

export class ABTestingEngine {
  /**
   * Obtém a lista de todos os testes A/B cadastrados
   */
  public static getTests(): ABTest[] {
    return EvolutionStore.get().abTests;
  }

  /**
   * Cria um novo teste A/B para um agente específico
   */
  public static createTest(params: {
    agentId: string;
    title: string;
    variantA: { promptSuffix: string; params: any };
    variantB: { promptSuffix: string; params: any };
  }): ABTest {
    const state = EvolutionStore.get();
    
    const newTest: ABTest = {
      id: 'ab_' + Math.random().toString(36).substr(2, 9),
      agentId: params.agentId,
      title: params.title,
      variantA: params.variantA,
      variantB: params.variantB,
      variantAMetrics: { count: 0, successRate: 100, avgTime: 0, score: 90 },
      variantBMetrics: { count: 0, successRate: 100, avgTime: 0, score: 90 },
      status: 'running',
      createdAt: new Date().toISOString()
    };

    // Pausa testes anteriores ativos para o mesmo agente para não gerar ruídos
    state.abTests.forEach(t => {
      if (t.agentId === params.agentId && t.status === 'running') {
        t.status = 'completed';
        t.winner = t.variantAMetrics.score >= t.variantBMetrics.score ? 'A' : 'B';
      }
    });

    state.abTests.push(newTest);
    EvolutionStore.save(state);
    EvolutionStore.addLog(`Novo teste A/B criado para [${params.agentId}]: "${params.title}"`);

    return newTest;
  }

  /**
   * Registra métricas de uma execução de variante de teste A/B
   */
  public static recordVariantExecution(
    testId: string,
    variant: 'A' | 'B',
    success: boolean,
    durationSeconds: number,
    qualityScore: number
  ): void {
    const state = EvolutionStore.get();
    const test = state.abTests.find(t => t.id === testId);
    if (!test) return;

    const targetMetrics = variant === 'A' ? test.variantAMetrics : test.variantBMetrics;
    
    const oldCount = targetMetrics.count;
    targetMetrics.count += 1;
    
    // Atualiza taxa de sucesso
    const oldSuccessCount = (targetMetrics.successRate / 100) * oldCount;
    const newSuccessCount = oldSuccessCount + (success ? 1 : 0);
    targetMetrics.successRate = Number(((newSuccessCount / targetMetrics.count) * 100).toFixed(1));

    // Atualiza tempo médio
    targetMetrics.avgTime = Number(((targetMetrics.avgTime * oldCount + durationSeconds) / targetMetrics.count).toFixed(2));

    // Atualiza pontuação (score) baseada em qualidade e taxa de sucesso
    targetMetrics.score = Math.round((qualityScore * 0.6) + (targetMetrics.successRate * 0.4));

    EvolutionStore.save(state);
    EvolutionStore.addLog(`Métricas do Teste A/B [${testId}] atualizadas para Variante ${variant}. Novo Score: ${targetMetrics.score}%`);
  }

  /**
   * Conclui um teste A/B, aplicando permanentemente a variante vencedora ao agente
   */
  public static finalizeTest(testId: string, manualWinner?: 'A' | 'B'): ABTest {
    const state = EvolutionStore.get();
    const test = state.abTests.find(t => t.id === testId);
    if (!test) throw new Error(`Teste A/B com ID '${testId}' não encontrado.`);

    test.status = 'completed';
    
    let winner: 'A' | 'B' = 'A';
    if (manualWinner) {
      winner = manualWinner;
    } else {
      winner = test.variantAMetrics.score >= test.variantBMetrics.score ? 'A' : 'B';
    }

    test.winner = winner;
    
    // Aplica a variante vencedora na store de prompts e parâmetros ativos
    const winningVariant = winner === 'A' ? test.variantA : test.variantB;
    state.activeEvolvedPrompts[test.agentId] = winningVariant.promptSuffix;
    
    if (!state.activeEvolvedParams[test.agentId]) {
      state.activeEvolvedParams[test.agentId] = {};
    }
    state.activeEvolvedParams[test.agentId] = {
      ...state.activeEvolvedParams[test.agentId],
      ...winningVariant.params
    };

    EvolutionStore.save(state);
    EvolutionStore.addLog(`Teste A/B [${testId}] finalizado. Variante ${winner} declarada vencedora e aplicada a [${test.agentId}].`);

    return test;
  }
}
