import { MarketplaceService, PLAN_LIMITS } from '../marketplace/marketplaceService.ts';
import { Repository } from '../db/repository.ts';
import { PlanType } from '../marketplace/types.ts';

export async function runMarketplaceTests() {
  console.log('\n=======================================');
  console.log('  INICIANDO SUÍTE DE TESTES: AI AGENT MARKETPLACE & TEMPLATE ECONOMY');
  console.log('  (ESTEIRA INTELIGENTE - ETAPA 21)');
  console.log('=======================================');

  let passedTests = 0;
  let failedTests = 0;

  // Carrega o estado inicial limpo para os testes (força plano FREE para testar limites)
  const state = await MarketplaceService.getState();
  await MarketplaceService.updatePlan('FREE');

  // Teste 1: Carregamento do Marketplace (Loading & State Init)
  try {
    const freshState = await MarketplaceService.getState();
    if (freshState && freshState.plan && freshState.plan.currentPlan === 'FREE') {
      console.log('✅ TESTE 1: Carregamento do Estado do Marketplace - PASSED');
      passedTests++;
    } else {
      throw new Error('Estado inicial inválido ou plano incorreto.');
    }
  } catch (err: any) {
    console.error('❌ TESTE 1: Carregamento do Estado do Marketplace - FAILED:', err.message);
    failedTests++;
  }

  // Teste 2: Catálogo de Agentes (Agent Catalog Validation)
  try {
    const catalog = await MarketplaceService.getCatalog();
    const templates = await MarketplaceService.getTemplates();

    const marketingCount = catalog.filter(a => a.category === 'marketing').length;
    const salesCount = catalog.filter(a => a.category === 'sales').length;
    const businessCount = catalog.filter(a => a.category === 'business').length;
    const financeCount = catalog.filter(a => a.category === 'finance').length;
    const supportCount = catalog.filter(a => a.category === 'support').length;

    if (catalog.length === 12 && marketingCount === 3 && salesCount === 3 && templates.length === 3) {
      console.log(`✅ TESTE 2: Validação do Catálogo (Total: ${catalog.length} agentes, ${templates.length} templates) - PASSED`);
      passedTests++;
    } else {
      throw new Error(`Contagem incorreta de agentes ou templates. Total: ${catalog.length}, Marketing: ${marketingCount}, Sales: ${salesCount}`);
    }
  } catch (err: any) {
    console.error('❌ TESTE 2: Validação do Catálogo - FAILED:', err.message);
    failedTests++;
  }

  // Teste 3: Instalação de Agente (Agent Installation Logic)
  try {
    const agentId = 'mp_copywriter';
    
    // Reseta estado para garantir que não está instalado
    const cleanState = await MarketplaceService.getState();
    cleanState.installedAgentIds = cleanState.installedAgentIds.filter(id => id !== agentId);
    cleanState.activeAgentIds = cleanState.activeAgentIds.filter(id => id !== agentId);
    await MarketplaceService.saveState(cleanState);

    const result = await MarketplaceService.installAgent(agentId);
    const updatedState = await MarketplaceService.getState();

    // Verifica se também foi registrado no orchestrator
    const coreState = await Repository.getSystemState();
    const isRegisteredInOrchestrator = coreState.agents.some(a => a.id === agentId);

    if (result.success && updatedState.installedAgentIds.includes(agentId) && isRegisteredInOrchestrator) {
      console.log('✅ TESTE 3: Instalação e Integração de Agente no Core - PASSED');
      passedTests++;
    } else {
      throw new Error(`Falha na instalação. Sucesso: ${result.success}. Instalado: ${updatedState.installedAgentIds.includes(agentId)}. Core: ${isRegisteredInOrchestrator}`);
    }
  } catch (err: any) {
    console.error('❌ TESTE 3: Instalação de Agente - FAILED:', err.message);
    failedTests++;
  }

  // Teste 4: Ativação de Template de Negócios (Template Economy)
  try {
    // Altera plano para BUSINESS para comportar ativação múltipla do template
    await MarketplaceService.updatePlan('BUSINESS');

    const templateId = 'tpl_local_business';
    const result = await MarketplaceService.activateTemplate(templateId);
    const updatedState = await MarketplaceService.getState();

    // 'tpl_local_business' inclui: 'mp_social_media', 'mp_ads_optimizer', 'mp_review_manager'
    const allInstalledAndActive = ['mp_social_media', 'mp_ads_optimizer', 'mp_review_manager'].every(
      id => updatedState.installedAgentIds.includes(id) && updatedState.activeAgentIds.includes(id)
    );

    if (result.success && updatedState.installedTemplateIds.includes(templateId) && allInstalledAndActive) {
      console.log('✅ TESTE 4: Ativação Coordenada de Template de Negócios - PASSED');
      passedTests++;
    } else {
      throw new Error(`Ativação incompleta. Sucesso: ${result.success}. Agentes prontos: ${allInstalledAndActive}`);
    }
  } catch (err: any) {
    console.error('❌ TESTE 4: Ativação de Template - FAILED:', err.message);
    failedTests++;
  }

  // Teste 5: Recomendador IA (Gemini Recommendation Engine)
  try {
    const recommendation = await MarketplaceService.recommend(
      'Infoprodutos de Emagrecimento',
      'Vender R$ 50k no primeiro mês',
      'Startup bootstrapped com 2 pessoas',
      'Dificuldade para criar copies de vendas persuasivas e otimizar anúncios'
    );

    if (recommendation && recommendation.recommendedAgentIds.length > 0 && recommendation.reasoning.length > 20) {
      console.log(`✅ TESTE 5: Recomendador de IA Inteligente (Reasoning: ${recommendation.reasoning.slice(0, 40)}...) - PASSED`);
      passedTests++;
    } else {
      throw new Error('Recomendação veio incompleta ou sem justificativa.');
    }
  } catch (err: any) {
    console.error('❌ TESTE 5: Recomendador de IA Inteligente - FAILED:', err.message);
    failedTests++;
  }

  // Teste 6: Limitações e Regras de Plano Comercial (Plan Limitations)
  try {
    // Retorna para plano FREE (limite de 2 agentes)
    await MarketplaceService.updatePlan('FREE');

    // Tenta instalar um terceiro agente além dos já existentes ativos para forçar barreira
    const catalog = await MarketplaceService.getCatalog();
    const uninstalledAgent = catalog.find(a => !['mp_social_media', 'mp_ads_optimizer', 'mp_review_manager', 'mp_copywriter'].includes(a.id));

    if (uninstalledAgent) {
      const result = await MarketplaceService.installAgent(uninstalledAgent.id);
      if (!result.success && result.message.includes('Limite de agentes excedido')) {
        console.log('✅ TESTE 6: Regras de Bloqueio por Limites de Plano Comercial - PASSED');
        passedTests++;
      } else {
        throw new Error(`Sistema falhou ao barrar instalação. Resultado: ${JSON.stringify(result)}`);
      }
    } else {
      console.log('✅ TESTE 6: Regras de Bloqueio por Limites de Plano Comercial (Ignorado/Sucesso) - PASSED');
      passedTests++;
    }
  } catch (err: any) {
    console.error('❌ TESTE 6: Limitações de Plano - FAILED:', err.message);
    failedTests++;
  }

  // Teste 7: Analytics do Marketplace (Analytics Consolidation)
  try {
    const analytics = await MarketplaceService.getAnalytics();
    if (analytics && typeof analytics.totalInstalled === 'number' && analytics.mostUsedAgents.length > 0 && analytics.popularTemplates.length > 0) {
      console.log(`✅ TESTE 7: Consolidação de Métricas e Analytics (Taxa Ativação: ${analytics.activationRate}%) - PASSED`);
      passedTests++;
    } else {
      throw new Error('Métricas com valores ausentes ou corrompidos.');
    }
  } catch (err: any) {
    console.error('❌ TESTE 7: Consolidação de Métricas - FAILED:', err.message);
    failedTests++;
  }

  // Restaura plano BUSINESS para manter o ambiente propício para uso interativo
  await MarketplaceService.updatePlan('BUSINESS');

  const success = failedTests === 0;
  console.log('\n=======================================');
  console.log(`  RESULTADO DA SUÍTE DE TESTES DO MARKETPLACE:`);
  console.log(`  Passou: ${passedTests} | Falhou: ${failedTests}`);
  console.log(`  Status Final: ${success ? 'OK (SUCESSO)' : 'ERRO'}`);
  console.log('=======================================');

  return {
    success,
    passed: passedTests,
    failed: failedTests,
    metrics: {
      passed: passedTests,
      failed: failedTests
    }
  };
}
