import { GrowthAnalyticsEngine } from '../growth/growthMetrics.ts';
import { OpportunityEngine } from '../growth/opportunityEngine.ts';
import { StrategyCoordinator } from '../growth/strategyCoordinator.ts';
import { ForecastingEngine } from '../growth/forecastingEngine.ts';
import { RecommendationCenter } from '../growth/recommendationCenter.ts';
import { OptimizationPlanner } from '../growth/optimizationPlanner.ts';
import { GrowthEngine } from '../growth/growthEngine.ts';
import { GrowthManagerAgent } from '../agents/GrowthManagerAgent.ts';
import { logInfo, logWarn, logError } from '../logs/logger.ts';

export async function runGrowthV2Tests(): Promise<{
  success: boolean;
  total: number;
  passed: number;
  failed: number;
  errors: string[];
}> {
  logInfo('--------------------------------------------------');
  logInfo('INICIANDO BATERIA DE TESTES: GROWTH ENGINE V2');
  logInfo('--------------------------------------------------');

  const errors: string[] = [];
  let total = 0;
  let passed = 0;

  const runTest = async (name: string, testFn: () => Promise<void>) => {
    total++;
    try {
      await testFn();
      passed++;
      logInfo(`[PASS] ${name}`);
    } catch (err: any) {
      logError(`[FAIL] ${name}: ${err.message}`);
      errors.push(`${name}: ${err.message}`);
    }
  };

  // TEST 1: Growth Analytics
  await runTest('1. Growth Analytics - Validar consistência de métricas financeiras', async () => {
    const metrics = GrowthAnalyticsEngine.getConsolidatedMetrics();
    if (metrics.revenue <= 0 || metrics.profit <= 0) {
      throw new Error('Métricas de faturamento/lucro inconsistentes.');
    }
    if (metrics.cac >= metrics.ltv) {
      throw new Error('CAC maior ou igual ao LTV detectado indevidamente.');
    }
    
    const historical = GrowthAnalyticsEngine.getHistoricalMetrics();
    if (historical.length !== 6) {
      throw new Error(`Esperado histórico de 6 meses, obtido: ${historical.length}`);
    }
  });

  // TEST 2: Opportunity Engine
  await runTest('2. Opportunity Engine - Gerador de Opportunity Score e prioridades', async () => {
    const opportunities = OpportunityEngine.scanOpportunities();
    if (opportunities.length === 0) {
      throw new Error('Nenhuma oportunidade foi detectada.');
    }

    const highOpps = opportunities.filter(o => o.opportunityScore >= 80);
    if (highOpps.length === 0) {
      throw new Error('Nenhuma oportunidade com score relevante (>=80) identificada.');
    }

    const scaleOpp = opportunities.find(o => o.type === 'product_scale');
    if (!scaleOpp || scaleOpp.opportunityScore !== 92) {
      throw new Error('Oportunidade crítica de escala de produto não identificada ou com score inválido.');
    }
  });

  // TEST 3: Strategy Coordinator
  await runTest('3. Strategy Coordinator - Distribuição estruturada de remédios', async () => {
    const suggestions = StrategyCoordinator.getSuggestions();
    const ceoMatch = suggestions.find(s => s.agentId === 'ceo');
    if (!ceoMatch) {
      throw new Error('CEO Agent não recebeu recomendações de estratégia de growth.');
    }

    const marketingMatch = suggestions.find(s => s.agentId === 'marketing');
    if (!marketingMatch) {
      throw new Error('Marketing Agent não recebeu recomendações de escala.');
    }

    // Testar atualização de status
    StrategyCoordinator.updateSuggestionStatus('ceo', 'applied');
    const updatedCeo = StrategyCoordinator.getSuggestions().find(s => s.agentId === 'ceo');
    if (updatedCeo?.status !== 'applied') {
      throw new Error('Falha ao atualizar status da estratégia sugerida para o CEO.');
    }
  });

  // TEST 4: Forecasting
  await runTest('4. Forecasting Engine - Projeções de cenários e tendências', async () => {
    const currentMetrics = GrowthAnalyticsEngine.getConsolidatedMetrics();
    const forecasts = ForecastingEngine.generateForecasts(currentMetrics);

    if (forecasts.length !== 6) {
      throw new Error(`Esperadas 6 projeções de meses futuros, obtido: ${forecasts.length}`);
    }

    const firstMonth = forecasts[0];
    if (firstMonth.optimisticRevenue <= firstMonth.realisticRevenue || firstMonth.realisticRevenue <= firstMonth.pessimisticRevenue) {
      throw new Error('Projeções matemáticas incorretas entre cenários otimista, realista e pessimista.');
    }
  });

  // TEST 5: Optimization Planner
  await runTest('5. Optimization Planner - Aprovação de Planos de Ação', async () => {
    const plans = OptimizationPlanner.getActionPlans();
    const draftPlan = plans.find(p => p.status === 'draft');
    
    if (!draftPlan) {
      throw new Error('Nenhum plano de rascunho (draft) encontrado no Planner.');
    }

    // Aprovar plano
    OptimizationPlanner.approvePlan(draftPlan.id);
    if (draftPlan.status !== 'active') {
      throw new Error('Falha ao aprovar plano estratégico de crescimento.');
    }

    // Atualizar etapa
    const activePlan = plans.find(p => p.id === 'plan_launch_scale_01');
    if (!activePlan) {
      throw new Error('Plano de escala ativo padrão não foi localizado.');
    }

    OptimizationPlanner.updateStepStatus(activePlan.id, 'step_scale_03', 'completed');
    const step3 = activePlan.steps.find(s => s.id === 'step_scale_03');
    if (step3?.status !== 'completed') {
      throw new Error('Falha ao atualizar status da etapa do plano de ação.');
    }
  });

  // TEST 6: Growth Engine & Agent
  await runTest('6. Growth Manager Agent - Auto-registro e auditoria executiva', async () => {
    // Auto-registro
    await GrowthManagerAgent.registerIfNeeded();
    
    const state = GrowthEngine.getGlobalState();
    if (state.overallGrowthScore < 0 || state.overallGrowthScore > 100) {
      throw new Error(`Overall Growth Score inválido: ${state.overallGrowthScore}`);
    }

    // Auditoria
    const audit = await GrowthManagerAgent.performGrowthAudit();
    if (!audit.auditSummary || audit.strategicPlanProposals.length === 0) {
      throw new Error('Auditoria falhou em gerar propostas ou sumários executivos válidos.');
    }
  });

  const success = errors.length === 0;
  logInfo('--------------------------------------------------');
  logInfo(`RESULTADO: ${passed}/${total} TESTES DE GROWTH PASSARAM COM SUCESSO.`);
  logInfo('--------------------------------------------------');

  return {
    success,
    total,
    passed,
    failed: total - passed,
    errors
  };
}
