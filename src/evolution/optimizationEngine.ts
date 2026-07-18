import { EvolutionStore } from './evolutionStore.ts';
import { MemoryEngine } from './memoryEngine.ts';

export class OptimizationEngine {
  /**
   * Retorna os parâmetros de execução (ex: temperature, maxOutputTokens) otimizados para o agente
   */
  public static getOptimizedParams(agentId: string, defaultParams: any = {}): any {
    const state = EvolutionStore.get();
    
    // Une parâmetros padrões, parâmetros evoluídos pelo Learning Engine e parâmetros ativos em testes A/B
    const evolvedParams = state.activeEvolvedParams[agentId] || {};
    
    // Verifica se há teste A/B rodando para este agente
    const activeTest = state.abTests.find(t => t.agentId === agentId && t.status === 'running');
    let testParams = {};
    if (activeTest) {
      // Distribui 50/50 entre variante A e variante B
      const useVariantB = Math.random() > 0.5;
      testParams = useVariantB ? activeTest.variantB.params : activeTest.variantA.params;
    }

    return {
      ...defaultParams,
      ...evolvedParams,
      ...testParams
    };
  }

  /**
   * Constrói o prompt evoluído de forma dinâmica para injeção em runtime
   * Junta o prompt base original com lições aprendidas, melhores práticas e variações de A/B tests
   */
  public static getEvolvedPrompt(agentId: string, basePrompt: string): string {
    const state = EvolutionStore.get();
    let evolvedPrompt = basePrompt;

    // 1. Aplica o sufixo customizado ativo proveniente de recomendações aplicadas ou evolução controlada
    const overrideSuffix = state.activeEvolvedPrompts[agentId];
    if (overrideSuffix) {
      evolvedPrompt += `\n\n[DIRETRIZES DE EVOLUÇÃO CONTROLADA]:\n${overrideSuffix}`;
    }

    // 2. Extrai e anexa melhores práticas aprendidas pelo Learning Engine a partir da memória persistente
    const bestPractices = MemoryEngine.getBestPractices(agentId);
    if (bestPractices.length > 0) {
      evolvedPrompt += `\n\n[LIÇÕES E MELHORES PRÁTICAS APRENDIDAS (AUTO-OTIMIZADAS)]:\n` + 
        bestPractices.map((bp, i) => `${i + 1}. ${bp}`).join('\n');
    }

    // 3. Verifica se há algum teste A/B de prompt em andamento
    const activeTest = state.abTests.find(t => t.agentId === agentId && t.status === 'running');
    if (activeTest) {
      // 50% de chance para cada variante
      const useVariantB = Math.random() > 0.5;
      const abSuffix = useVariantB ? activeTest.variantB.promptSuffix : activeTest.variantA.promptSuffix;
      evolvedPrompt += `\n\n[DIRETRIZ DE TESTE A/B ATIVO (VARIANTE ${useVariantB ? 'B' : 'A'})]:\n${abSuffix}`;
      
      // Registra no log da store qual variante foi selecionada para a execução
      EvolutionStore.addLog(`Agente [${agentId}] invocado usando variante de teste A/B: ${useVariantB ? 'VARIANTE B' : 'VARIANTE A'}`);
    }

    // 4. Regras adicionais de segurança e priorização de tarefas
    evolvedPrompt += `\n\n[REGRAS DE PRIORIZAÇÃO E TOMADA DE DECISÃO]:
- Priorize tarefas urgentes (prioridade alta) mapeadas pelo Supervisor ou CEO.
- Evite alucinações e formate as saídas estritamente nos padrões esperados.`;

    return evolvedPrompt;
  }

  /**
   * Força uma otimização manual de um agente
   */
  public static optimizeAgentPrompt(agentId: string, optimizedSuffix: string): void {
    const state = EvolutionStore.get();
    state.activeEvolvedPrompts[agentId] = optimizedSuffix;
    EvolutionStore.save(state);
    EvolutionStore.addLog(`Prompt do agente [${agentId}] otimizado manualmente/via evolução controlada.`);
  }

  /**
   * Reseta todas as otimizações customizadas de um agente para o baseline
   */
  public static resetOptimizations(agentId: string): void {
    const state = EvolutionStore.get();
    delete state.activeEvolvedPrompts[agentId];
    delete state.activeEvolvedParams[agentId];
    EvolutionStore.save(state);
    EvolutionStore.addLog(`Otimizações e prompts evoluídos do agente [${agentId}] resetados para os baselines de fábrica.`);
  }
}
