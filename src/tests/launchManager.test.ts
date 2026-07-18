import { Repository } from '../db/repository.ts';
import { LaunchManagerAgent } from '../agents/launchManager.ts';
import { SupervisorAgent } from '../agents/supervisor.ts';

export async function runLaunchManagerTests() {
  console.log('\n=======================================');
  console.log('  INICIANDO SUÍTE DE TESTES: LAUNCH & SALES AUTOMATION AGENT');
  console.log('  (DIRETOR DE LANÇAMENTOS - ETAPA 19)');
  console.log('=======================================');

  let passedTests = 0;
  let failedTests = 0;
  let testLaunchId = `launch_test_${Math.random().toString(36).substr(2, 9)}`;

  // Garante que o produto de teste 'prod_test_001' esteja cadastrado no banco de dados para evitar erros de integridade referencial nos testes integrados
  try {
    const state = await Repository.getSystemState();
    const existingProd = state.products?.find(p => p.id === 'prod_test_001');
    if (!existingProd) {
      const testProduct = {
        id: 'prod_test_001',
        name: 'Treinamento Fórmula de Tráfego Avançado',
        category: 'Curso Online',
        niche: 'Marketing Digital',
        price: 197.0,
        revenue: 0,
        status: 'published' as const,
        description: 'Aprenda tráfego pago passo a passo de forma automatizada.',
        content: 'Conteúdo didático do treinamento de tráfego',
        salesPage: 'https://salespage.com/trafego',
        designerAssets: [],
        publicationLogs: [],
        checkoutUrl: 'https://checkout.com/trafego',
        paymentProvider: 'mercado_pago',
        subtitle: 'Como atrair milhares de clientes usando IA',
        mainPromise: 'Aprenda as estratégias que faturam milhões no digital',
        problemSolved: 'Falta de leads e ROI baixo em anúncios',
        targetAudience: 'Empreendedores, afiliados e gestores de tráfego',
        persona: 'Lucas, 27 anos, quer escalar sua agência de marketing',
        format: 'Curso Online',
        indexTableOfContents: 'Módulo 1: Introdução, Módulo 2: Facebook Ads, Módulo 3: Google Ads',
        modules: [],
        chapters: [],
        differentiation: 'Suporte exclusivo guiado por agentes de IA 24/7',
        positioningStrategy: 'Posicionamento premium focado em escala rápida',
        productionPlan: 'Passo 1: Definir grade, Passo 2: Gravar aulas, Passo 3: Criar checkout',
        briefing: 'Diretrizes didáticas para o treinamento',
        version: '1.0.0',
        productionStatus: 'completed' as const,
        timestamp: new Date().toLocaleString('pt-BR')
      };
      await Repository.saveState({ products: [...(state.products || []), testProduct] as any });
      console.log('✅ Produto de teste prod_test_001 preparado com sucesso.');
    }
  } catch (err: any) {
    console.warn('Aviso ao preparar produto de teste prod_test_001:', err.message);
  }

  // Teste 1: Criação de Lançamento Comercial (Draft)
  try {
    const launch = await LaunchManagerAgent.createLaunch(
      'prod_test_001',
      'Treinamento Fórmula de Tráfego Avançado',
      8000,
      'Clássico'
    );

    if (launch && launch.name === 'Treinamento Fórmula de Tráfego Avançado' && launch.budget === 8000 && launch.status === 'draft') {
      console.log('✅ Teste 1 Passou: Lançamento criado com sucesso no estado de rascunho (Draft).');
      testLaunchId = launch.id; // usa o ID real gerado para os testes subsequentes
      passedTests++;
    } else {
      throw new Error('Falha nos atributos básicos do lançamento criado.');
    }
  } catch (err: any) {
    console.error('❌ Teste 1 Falhou: Criação de Lançamento.', err.message);
    failedTests++;
  }

  // Teste 2: Formulação do Plano Estratégico com IA (Gemini)
  try {
    const plannedLaunch = await LaunchManagerAgent.generateStrategicPlan(testLaunchId);

    if (
      plannedLaunch &&
      plannedLaunch.status === 'planning' &&
      plannedLaunch.goal &&
      plannedLaunch.audience &&
      plannedLaunch.timelinePreLaunch
    ) {
      console.log('✅ Teste 2 Passou: Plano estratégico formulado por IA, populando objetivos, público e cronograma.');
      passedTests++;
    } else {
      throw new Error('O plano estratégico formulado com Gemini está incompleto ou vazio.');
    }
  } catch (err: any) {
    console.error('❌ Teste 2 Falhou: Formulação do Plano Estratégico.', err.message);
    failedTests++;
  }

  // Teste 3: Automação e Ativação de Campanhas Multicanal
  try {
    await LaunchManagerAgent.startMarketingAutomation(testLaunchId);
    
    const campaigns = await Repository.getCampaigns();
    const launchCampaigns = campaigns.filter(c => c.launchId === testLaunchId);

    if (launchCampaigns.length >= 3) { // Instagram, Facebook, Google
      const allActive = launchCampaigns.every(c => c.status === 'active' && c.adCopy);
      if (allActive) {
        console.log(`✅ Teste 3 Passou: Campanhas ativas de tráfego geradas automaticamente para ${launchCampaigns.length} redes de anúncios.`);
        passedTests++;
      } else {
        throw new Error('Uma ou mais campanhas de tráfego não possuem copy ou não estão ativas.');
      }
    } else {
      throw new Error(`Número de campanhas insuficiente (${launchCampaigns.length}). Esperava-se no mínimo 3.`);
    }
  } catch (err: any) {
    console.error('❌ Teste 3 Falhou: Automação e Ativação de Campanhas.', err.message);
    failedTests++;
  }

  // Teste 4: Disparo e Simulação de Sequências de E-mail
  try {
    const sequencesBefore = await Repository.getEmailSequences();
    const testSeq = sequencesBefore.find(s => s.launchId === testLaunchId && s.triggerEvent === 'welcome');

    if (!testSeq) {
      throw new Error('Nenhuma sequência de boas-vindas encontrada para o lançamento.');
    }

    await LaunchManagerAgent.triggerEmailCampaign(testLaunchId, 'welcome');
    
    const sequencesAfter = await Repository.getEmailSequences();
    const updatedSeq = sequencesAfter.find(s => s.id === testSeq.id);

    if (updatedSeq && updatedSeq.sentCount > testSeq.sentCount) {
      console.log(`✅ Teste 4 Passou: Sequência de e-mail com gatilho "WELCOME" disparada e auditada com sentCount de ${updatedSeq.sentCount}.`);
      passedTests++;
    } else {
      throw new Error(`Contagem de envio de e-mails não incrementou. Anterior: ${testSeq.sentCount}, Atual: ${updatedSeq?.sentCount}`);
    }
  } catch (err: any) {
    console.error('❌ Teste 4 Falhou: Sequência de E-mail.', err.message);
    failedTests++;
  }

  // Teste 5: Notificações e Fila do WhatsApp Business API
  try {
    await LaunchManagerAgent.triggerWhatsAppMessage(
      testLaunchId,
      'sendSupport',
      '5511988887777',
      'Olá! Notamos seu carrinho abandonado. Oferecemos suporte para concluir sua inscrição!'
    );

    const events = await Repository.getMarketingEvents();
    const waEvent = events.find(e => e.launchId === testLaunchId && e.eventType === 'whatsapp_sent');

    if (waEvent && waEvent.description.includes('5511988887777')) {
      console.log('✅ Teste 5 Passou: Mensagem de recuperação no WhatsApp despachada e logada com sucesso.');
      passedTests++;
    } else {
      throw new Error('Mensagem do WhatsApp não foi encontrada no log de eventos do Integration Center.');
    }
  } catch (err: any) {
    console.error('❌ Teste 5 Falhou: Envio de WhatsApp.', err.message);
    failedTests++;
  }

  // Teste 6: Consolidação Financeira e Auditoria de Métricas (ROI, CAC)
  try {
    const metrics = await LaunchManagerAgent.analyzePerformance(testLaunchId);

    if (
      metrics &&
      typeof metrics.roi === 'number' &&
      typeof metrics.cac === 'number' &&
      typeof metrics.conversionRate === 'number' &&
      metrics.recommendations
    ) {
      console.log(`✅ Teste 6 Passou: Desempenho consolidado analisado com sucesso (ROI: ${metrics.roi}x, CAC: R$ ${metrics.cac}).`);
      passedTests++;
    } else {
      throw new Error('Valores de métricas corrompidos ou parecer da IA indisponível.');
    }
  } catch (err: any) {
    console.error('❌ Teste 6 Falhou: Consolidação e Auditoria Financeira.', err.message);
    failedTests++;
  }

  // Teste 7: Redistribuição de Verbas, Otimização e Alertas de Supervisor
  try {
    // Reduz verba de campanhas para simular performance abaixo da meta e acionar alertas
    const campaigns = await Repository.getCampaigns();
    const lCampaigns = campaigns.filter(c => c.launchId === testLaunchId);

    // Ajusta campanhas para zerar conversões e verbas gerando ROI degradado (< 1.0)
    for (const c of lCampaigns) {
      c.spent = 2000;
      c.revenue = 200; // ROI = (200-2000)/2000 = -0.9
      c.conversions = 1;
      await Repository.saveCampaign(c);
    }

    // Aciona a performance novamente para acionar alertas de degradação
    await LaunchManagerAgent.analyzePerformance(testLaunchId);

    // Verifica se o Supervisor gerou alertas
    const alerts = await Repository.getSystemAlerts();
    const launchAlert = alerts.find(
      a => a.reason.includes(testLaunchId) || 
           a.agentId === 'launch_manager' || 
           a.origin === 'LaunchManagerAgent' ||
           a.reason.toLowerCase().includes('roi')
    );

    // Executa realocação orçamentária
    const optResult = await LaunchManagerAgent.optimizeLaunch(testLaunchId);

    if (launchAlert && optResult.includes('otimizado')) {
      console.log('✅ Teste 7 Passou: Alerta operacional emitido para o Supervisor por baixo ROI e verbas redistribuídas de forma ótima.');
      passedTests++;
    } else {
      throw new Error(`Supervisor não disparou alerta ou redistribuição de verba de anúncios não efetuada. launchAlert: ${!!launchAlert}, optResult: ${optResult}`);
    }
  } catch (err: any) {
    console.error('❌ Teste 7 Falhou: Otimizações e Alertas do Supervisor.', err.message);
    failedTests++;
  }

  console.log('\n=======================================');
  console.log(`  SUÍTE FINALIZADA: ${passedTests} / 7 TESTES PASSOU.`);
  console.log('=======================================');

  return {
    total: 7,
    passed: passedTests,
    failed: failedTests,
    success: failedTests === 0
  };
}
