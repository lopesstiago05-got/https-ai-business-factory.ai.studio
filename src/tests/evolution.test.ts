import { EvolutionEngine } from '../evolution/evolutionEngine.ts';
import { EvolutionStore } from '../evolution/evolutionStore.ts';
import { PerformanceEngine } from '../evolution/performanceEngine.ts';
import { MemoryEngine } from '../evolution/memoryEngine.ts';
import { LearningEngine } from '../evolution/learningEngine.ts';
import { OptimizationEngine } from '../evolution/optimizationEngine.ts';
import { ABTestingEngine } from '../evolution/abTestingEngine.ts';
import { RecommendationEngine } from '../evolution/recommendationEngine.ts';
import { EvolutionManagerAgent } from '../evolution/evolutionManager.ts';

export interface TestResult {
  name: string;
  success: boolean;
  message: string;
}

export async function runEvolutionTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  const runTest = async (name: string, testFn: () => Promise<void> | void) => {
    try {
      await testFn();
      results.push({ name, success: true, message: 'Passou com sucesso' });
    } catch (err: any) {
      results.push({ name, success: false, message: err.message });
    }
  };

  // 1. Teste da Store de Evolução
  await runTest('Store de Evolução: Inicialização e Carregamento', () => {
    const state = EvolutionStore.get();
    if (!state) throw new Error('Estado de evolução não pôde ser carregado.');
    if (!state.agentMetrics || !state.memories || !state.abTests || !state.recommendations) {
      throw new Error('Estado de evolução inicial está incompleto.');
    }
  });

  // 2. Teste do Performance Engine
  await runTest('Performance Engine: Registro de Execução e Snapshots', () => {
    const agentId = 'ceo';
    const originalMetrics = { ...PerformanceEngine.getMetrics(agentId) };
    
    // Registra uma tarefa de sucesso durando 3 segundos com qualidade 95
    const updatedMetrics = PerformanceEngine.recordExecution(agentId, true, 3, 95, 500);
    
    if (updatedMetrics.taskCount !== originalMetrics.taskCount + 1) {
      throw new Error('Contagem de tarefas não incrementou no Performance Engine.');
    }
    if (updatedMetrics.financialImpact !== originalMetrics.financialImpact + 500) {
      throw new Error('Impacto financeiro não foi computado devidamente.');
    }
    
    const history = PerformanceEngine.getHistory(agentId);
    if (history.length === 0) {
      throw new Error('Histórico de snapshots não foi registrado.');
    }
  });

  // 3. Teste do Memory Engine
  await runTest('Memory Engine: Registro e Extração de Conhecimento', () => {
    const agentId = 'research';
    const taskId = 'task_test_mem_001';
    
    MemoryEngine.recordMemory({
      agentId,
      taskId,
      taskTitle: 'Pesquisar Nichos de SaaS B2B',
      decisionTaken: 'Pesquisado no Reddit e ProductHunt por dores reais',
      result: 'success',
      strategyUsed: 'Pesquisa Orgânica Profunda',
      bestPracticeLearned: 'SaaS para automatizar relatórios de agências possui alta disposição de pagamento.'
    });

    const memories = MemoryEngine.getMemories(agentId);
    const testMem = memories.find(m => m.taskId === taskId);
    if (!testMem) {
      throw new Error('Memória de teste não foi persistida devidamente.');
    }

    const bestPractices = MemoryEngine.getBestPractices(agentId);
    if (!bestPractices.includes('SaaS para automatizar relatórios de agências possui alta disposição de pagamento.')) {
      throw new Error('Melhor prática não pôde ser recuperada da memória.');
    }
  });

  // 4. Teste do Learning Engine
  await runTest('Learning Engine: Ciclo de Aprendizado Integrado', async () => {
    const agentId = 'writer';
    const taskId = 'task_learn_002';

    // Roda a avaliação de aprendizado (com fallback inteligente caso falte API key)
    const learningResult = await LearningEngine.evaluateAndLearn({
      agentId,
      taskId,
      taskTitle: 'Redigir Ebook de Finanças Pessoais',
      taskDescription: 'Redação de copy persuasiva focada no público jovem de classe média.',
      executionOutput: 'Aqui está sua apostila completa sobre como economizar os primeiros 10 mil reais sem sofrimento.',
      success: true,
      durationSeconds: 4,
      feedbackReceived: 'O tom ficou leve e muito apropriado para a persona.'
    });

    if (learningResult.qualityScore < 0 || learningResult.qualityScore > 100) {
      throw new Error('Quality score retornado está fora do intervalo esperado (0-100).');
    }

    const memories = MemoryEngine.getMemories(agentId);
    const hasMem = memories.some(m => m.taskId === taskId);
    if (!hasMem) {
      throw new Error('O ciclo de aprendizado falhou em registrar a memória de execução.');
    }
  });

  // 5. Teste do Optimization Engine
  await runTest('Optimization Engine: Injeção de Prompt e Parâmetros em Runtime', () => {
    const agentId = 'ceo';
    const basePrompt = 'Você é o CEO.';
    
    const evolvedPrompt = OptimizationEngine.getEvolvedPrompt(agentId, basePrompt);
    if (!evolvedPrompt.includes(basePrompt)) {
      throw new Error('O prompt evoluído descartou o prompt base original.');
    }
    if (!evolvedPrompt.includes('[REGRAS DE PRIORIZAÇÃO E TOMADA DE DECISÃO]')) {
      throw new Error('Diretrizes de priorização estruturais não foram anexadas ao prompt.');
    }

    const optimizedParams = OptimizationEngine.getOptimizedParams(agentId, { temperature: 0.7 });
    if (optimizedParams.temperature === undefined) {
      throw new Error('Os parâmetros otimizados dinâmicos foram descartados.');
    }
  });

  // 6. Teste de A/B Testing
  await runTest('A/B Testing Engine: Fluxo de Criação e Finalização', () => {
    const agentId = 'designer';
    
    const test = ABTestingEngine.createTest({
      agentId,
      title: 'Teste A/B de Estilo Visual do Designer',
      variantA: { promptSuffix: 'Use cores pasteis e minimalismo suiço.', params: { temperature: 0.4 } },
      variantB: { promptSuffix: 'Use cores vibrantes neon e brutalismo pós-moderno.', params: { temperature: 0.9 } }
    });

    if (test.agentId !== agentId || test.status !== 'running') {
      throw new Error('Falha ao criar o teste A/B no status ativo.');
    }

    // Registra uma execução de sucesso para a variante B
    ABTestingEngine.recordVariantExecution(test.id, 'B', true, 6, 98);
    
    // Finaliza o teste forçando o vencedor B
    const finalized = ABTestingEngine.finalizeTest(test.id, 'B');
    if (finalized.status !== 'completed' || finalized.winner !== 'B') {
      throw new Error('Falha ao finalizar teste A/B declarando o vencedor.');
    }

    // Garante que a otimização dinâmica aplicou o prompt vencedor
    const state = EvolutionStore.get();
    if (state.activeEvolvedPrompts[agentId] !== 'Use cores vibrantes neon e brutalismo pós-moderno.') {
      throw new Error('O prompt vencedor do teste A/B não foi injetado como prompt ativo do agente.');
    }
  });

  // 7. Teste de Recomendações
  await runTest('Recommendation Engine: Fluxo de Recomendações e Aplicação', () => {
    const agentId = 'marketing';
    
    // Cria uma recomendação mock na base
    const state = EvolutionStore.get();
    const testRecId = 'rec_test_007';
    state.recommendations.push({
      id: testRecId,
      agentId,
      type: 'prompt',
      title: 'Otimização de Headlines para Conversão',
      description: 'Análise de CTR indica que headlines baseadas em dores reais convertem 18% mais.',
      impactScore: 9,
      status: 'pending',
      actionableChange: { promptSuffix: 'Sempre elabore headlines focando em uma dor tangível imediata.' },
      createdAt: new Date().toISOString()
    });
    EvolutionStore.save(state);

    // Aplica a recomendação
    const success = RecommendationEngine.applyRecommendation(testRecId);
    if (!success) {
      throw new Error('Falha ao aplicar recomendação válida.');
    }

    const updatedState = EvolutionStore.get();
    const rec = updatedState.recommendations.find(r => r.id === testRecId);
    if (!rec || rec.status !== 'applied') {
      throw new Error('O status da recomendação não mudou para "applied".');
    }
    if (updatedState.activeEvolvedPrompts[agentId] !== 'Sempre elabore headlines focando em uma dor tangível imediata.') {
      throw new Error('O prompt otimizado da recomendação não foi injetado de forma ativa.');
    }
  });

  // 8. Teste do EvolutionManagerAgent
  await runTest('EvolutionManagerAgent: Auditoria Geral e Registro', async () => {
    // Registra o agente se necessário
    await EvolutionManagerAgent.registerIfNeeded();
    
    // Executa ciclo geral de auditoria e evolução dos agentes
    const cycle = await EvolutionManagerAgent.runEvolutionCycle();
    
    if (!cycle.success) {
      throw new Error('O ciclo do Evolution Manager Agent falhou de forma crítica.');
    }
    if (!cycle.report || cycle.report.length === 0) {
      throw new Error('O relatório de evolução gerado está vazio.');
    }
  });

  return results;
}
