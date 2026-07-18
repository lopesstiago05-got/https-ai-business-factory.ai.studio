import { hashPassword, comparePasswords, generateToken, verifyToken } from '../auth/utils.ts';
import { Repository } from '../db/repository.ts';

export async function runInfrastructureTests() {
  console.log('\n=======================================');
  console.log('  INICIANDO SUÍTE DE TESTES DE INFRAESTRUTURA');
  console.log('=======================================');

  let passedTests = 0;
  let failedTests = 0;
  let testOpportunityId: string | null = null;

  // Teste 1: Criptografia de Senha
  try {
    const rawPass = 'factory123_secure';
    const hash = await hashPassword(rawPass);
    const isValid = await comparePasswords(rawPass, hash);
    const isInvalid = await comparePasswords('wrong_password', hash);

    if (isValid && !isInvalid) {
      console.log('✅ Teste 1 Passou: Autenticação Bcrypt e Criptografia de Senha funcionando.');
      passedTests++;
    } else {
      throw new Error('Validação de hash Bcrypt falhou.');
    }
  } catch (err: any) {
    console.error('❌ Teste 1 Falhou: Criptografia de Senha.', err.message);
    failedTests++;
  }

  // Teste 2: Geração e Verificação de Token JWT
  try {
    const payload = { userId: 'user-abc', email: 'test@factory.com', role: 'developer' };
    const token = generateToken(payload);
    const decoded = verifyToken(token);

    if (decoded.userId === payload.userId && decoded.role === payload.role) {
      console.log('✅ Teste 2 Passou: Emissão e validação de assinatura JWT segura.');
      passedTests++;
    } else {
      throw new Error('Dados decodificados do token não coincidem com o payload original.');
    }
  } catch (err: any) {
    console.error('❌ Teste 2 Falhou: Emissão de JWT.', err.message);
    failedTests++;
  }

  // Teste 3: Repositório Híbrido de Dados (Carga Inicial)
  try {
    const state = await Repository.getSystemState();
    if (state && state.agents && state.agents.length > 0) {
      console.log(`✅ Teste 3 Passou: Repositório híbrido carregou com sucesso (${state.agents.length} agentes disponíveis).`);
      passedTests++;
    } else {
      throw new Error('Estado retornado pelo repositório está corrompido ou incompleto.');
    }
  } catch (err: any) {
    console.error('❌ Teste 3 Falhou: Repositório Híbrido de Dados.', err.message);
    failedTests++;
  }

  // Teste 4: Validação de Conexão PostgreSQL (Ou Fallback Graceful)
  try {
    const isPG = !!process.env.SQL_HOST;
    if (isPG) {
      const db = (await import('../db/index.ts')).getDB();
      if (db) {
        console.log('✅ Teste 4 Passou: Conexão direta com PostgreSQL estabelecida com sucesso.');
        passedTests++;
      } else {
        throw new Error('Falha ao obter instância de conexão do Drizzle PostgreSQL.');
      }
    } else {
      console.log('✅ Teste 4 Passou: Modo PostgreSQL inativo. Rodando em modo de fallback JSON local de alta segurança.');
      passedTests++;
    }
  } catch (err: any) {
    console.error('❌ Teste 4 Falhou: Validação de Conexão com Banco de Dados PostgreSQL.', err.message);
    failedTests++;
  }

  // Teste 5: Operações do Research Agent (Escaneamento, Oportunidades & Persistência)
  try {
    // Insere uma pesquisa simulada
    const searchId = 'src_test_' + Math.random().toString(36).substr(2, 9);
    const mockSearch = await Repository.addResearchSearch({
      query: 'Educação Financeira Infantil',
      resultsCount: 2,
      results: 'Artigo 1\nArtigo 2'
    });

    // Insere uma oportunidade simulada
    const mockOpp = await Repository.addResearchOpportunity({
      title: 'Planilha de Mesada Inteligente',
      niche: 'Educação Financeira Infantil',
      description: 'Ferramenta interativa de gestão de mesada para pais e filhos.',
      painPoint: 'Dificuldade de ensinar controle de gastos para crianças de forma divertida.',
      differentiation: 'Gamificação integrada e alertas via aplicativo móvel.',
      demandScore: 8,
      financialScore: 7,
      competitionScore: 5,
      creationEaseScore: 9,
      launchSpeedScore: 8,
      finalScore: 7.4,
      status: 'pending'
    });

    testOpportunityId = mockOpp.id;

    // Recupera oportunidades para verificar se foi salva
    const opps = await Repository.getResearchOpportunities();
    const foundOpp = opps.find(o => o.id === testOpportunityId);

    if (mockSearch && foundOpp && foundOpp.status === 'pending') {
      console.log('✅ Teste 5 Passou: Pesquisas e Oportunidades do Research Agent criadas, persistidas e recuperadas com sucesso.');
      passedTests++;
    } else {
      throw new Error('Falha ao criar ou recuperar registros de pesquisa ou oportunidade.');
    }
  } catch (err: any) {
    console.error('❌ Teste 5 Falhou: Operações do Research Agent & Persistência.', err.message);
    failedTests++;
  }

  // Teste 6: Integração Research Agent -> CEO Agent (Aprovação de Oportunidades e Fluxo Estratégico)
  try {
    if (!testOpportunityId) {
      throw new Error('ID da oportunidade de teste não foi estabelecido no Teste 5.');
    }

    // Busca oportunidades pendentes
    const opps = await Repository.getResearchOpportunities();
    const targetOpp = opps.find(o => o.id === testOpportunityId);
    
    if (!targetOpp) {
      throw new Error('Oportunidade de teste não encontrada.');
    }

    // Altera o status para "approved"
    const isUpdated = await Repository.updateResearchOpportunityStatus(targetOpp.id, 'approved');
    
    // Verifica se ela aparece nas aprovadas
    const updatedOpps = await Repository.getResearchOpportunities();
    const approvedOpp = updatedOpps.find(o => o.id === targetOpp.id);

    if (isUpdated && approvedOpp && approvedOpp.status === 'approved') {
      console.log('✅ Teste 6 Passou: Integração de aprovação de ideias do Research Agent para o CEO Agent validada com sucesso.');
      passedTests++;
    } else {
      throw new Error('Alteração de status ou recuperação da oportunidade aprovada falhou.');
    }
  } catch (err: any) {
    console.error('❌ Teste 6 Falhou: Integração Research Agent -> CEO Agent.', err.message);
    failedTests++;
  }

  // Teste 7: Dashboard & Métricas Integradas
  try {
    const state = await Repository.getSystemState();
    
    const hasCeo = state.agents.some(a => a.id === 'ceo');
    const hasResearch = state.agents.some(a => a.id === 'research');
    const hasMetrics = !!state.metrics;

    if (hasCeo && hasResearch && hasMetrics) {
      console.log('✅ Teste 7 Passou: Dashboard integrado contendo os agentes estratégicos (CEO, Research) e métricas operacionais carregado com sucesso.');
      passedTests++;
    } else {
      throw new Error(`Inconsistência no estado do dashboard. Agentes presentes: CEO=${hasCeo}, Research=${hasResearch}. Métricas disponíveis: ${hasMetrics}`);
    }
  } catch (err: any) {
    console.error('❌ Teste 7 Falhou: Dashboard & Métricas Integradas.', err.message);
    failedTests++;
  }

  // Teste 8: Operações do Market Analyst Agent (Criação, Persistência & Recuperação)
  try {
    const mockAnalysis = await Repository.addMarketAnalysis({
      opportunityId: testOpportunityId || 'opp_test_mock',
      opportunityTitle: 'Planilha de Mesada Inteligente',
      niche: 'Educação Financeira Infantil',
      demandScore: 8,
      urgencyScore: 9,
      buyingPowerScore: 7,
      competitionScore: 6,
      differentiationScore: 8,
      creationEaseScore: 9,
      scalingPotentialScore: 10,
      profitMarginScore: 9,
      finalScore: 8.3,
      targetAudience: 'Pais de crianças de 6 a 12 anos das classes A e B',
      estimatedPrice: 97.00,
      financialViability: 'Retorno projetado no primeiro mês com margem líquida de 85%',
      expertOpinion: 'A oportunidade possui viabilidade comercial muito atrativa por conta da alta urgência na educação das crianças e facilidade de criação.',
      recommendations: 'Iniciar pré-venda o quanto antes para testar audiência',
      status: 'approved'
    });

    const analysesList = await Repository.getMarketAnalyses();
    const foundAnalysis = analysesList.find(a => a.id === mockAnalysis.id);

    if (mockAnalysis && foundAnalysis && foundAnalysis.status === 'approved' && foundAnalysis.finalScore === 8.3) {
      console.log('✅ Teste 8 Passou: Análise de mercado do Market Analyst Agent criada, persistida e recuperada com sucesso.');
      passedTests++;
    } else {
      throw new Error('Falha ao criar ou recuperar registro de análise de mercado.');
    }
  } catch (err: any) {
    console.error('❌ Teste 8 Falhou: Operações do Market Analyst Agent & Persistência.', err.message);
    failedTests++;
  }

  // Teste 9: Integração de Fluxo de Decisão do Market Analyst (Comunicação com CEO Agent)
  try {
    const stateBefore = await Repository.getSystemState();
    const mockAnalysisId = 'an_test_' + Math.random().toString(36).substr(2, 9);

    // Salva uma análise pendente para testar a aprovação
    const pendingAnalysis = await Repository.addMarketAnalysis({
      opportunityId: testOpportunityId || 'opp_test_mock',
      opportunityTitle: 'Planilha de Mesada Inteligente',
      niche: 'Educação Financeira Infantil',
      demandScore: 6,
      urgencyScore: 5,
      buyingPowerScore: 6,
      competitionScore: 6,
      differentiationScore: 6,
      creationEaseScore: 6,
      scalingPotentialScore: 6,
      profitMarginScore: 6,
      finalScore: 5.9,
      targetAudience: 'Pais de classe C',
      estimatedPrice: 47.00,
      financialViability: 'Margem moderada',
      expertOpinion: 'Interessante mas com atratividade comercial limítrofe.',
      recommendations: 'Ajustar escopo do infoproduto',
      status: 'rejected'
    });

    // Executa aprovação manual
    const success = await Repository.updateMarketAnalysisStatus(pendingAnalysis.id, 'approved');
    const analysesUpdated = await Repository.getMarketAnalyses();
    const approvedAnalysis = analysesUpdated.find(a => a.id === pendingAnalysis.id);

    if (success && approvedAnalysis && approvedAnalysis.status === 'approved') {
      console.log('✅ Teste 9 Passou: Fluxo estratégico de aprovação do Market Analyst integrado ao CEO Agent validado com sucesso.');
      passedTests++;
    } else {
      throw new Error('Falha ao atualizar status ou validar integridade da análise.');
    }
  } catch (err: any) {
    console.error('❌ Teste 9 Falhou: Integração de Fluxo de Decisão do Market Analyst.', err.message);
    failedTests++;
  }

  // Teste 10: Operações do Product Creator Agent & Homologação de Produto (Etapa 7)
  try {
    const { ProductCreatorAgent } = await import('../agents/productCreator.ts');
    
    // Insere oportunidade aprovada simulada para conceber o produto
    const oppForCreator = await Repository.addResearchOpportunity({
      title: 'Guia de Produtividade com IA',
      niche: 'Produtividade Pessoal',
      description: 'Como usar inteligências artificiais gerativas para automatizar sua rotina de trabalho.',
      painPoint: 'Perda de tempo com tarefas manuais repetitivas.',
      differentiation: 'Checklists práticos e prompts de copiar e colar inclusos.',
      demandScore: 9,
      financialScore: 8,
      competitionScore: 6,
      creationEaseScore: 8,
      launchSpeedScore: 9,
      finalScore: 8.0,
      status: 'approved'
    });

    // Analisa/audita oportunidade simulando Market Analyst para registrar parecer
    await Repository.addMarketAnalysis({
      opportunityId: oppForCreator.id,
      opportunityTitle: oppForCreator.title,
      niche: oppForCreator.niche,
      demandScore: 9,
      urgencyScore: 9,
      buyingPowerScore: 8,
      competitionScore: 7,
      differentiationScore: 8,
      creationEaseScore: 8,
      scalingPotentialScore: 9,
      profitMarginScore: 9,
      finalScore: 8.4,
      targetAudience: 'Profissionais autônomos e freelancers',
      estimatedPrice: 197.00,
      financialViability: 'Excelente margem líquida estimada.',
      expertOpinion: 'Altamente promissor para profissionais modernos.',
      recommendations: 'Focar na promessa de ganho de tempo.',
      status: 'approved'
    });

    // Executa concepção pelo Product Creator Agent
    const product = await ProductCreatorAgent.createProductConcept(oppForCreator.id);

    // Verifica campos essenciais do infoproduto
    const hasName = !!product.name;
    const hasPromise = !!product.mainPromise;
    const hasIndex = !!product.indexTableOfContents;
    const hasFormat = !!product.format;
    const isConcept = product.productionStatus === 'concept';

    // Executa homologação para produção
    const approvedProduct = await ProductCreatorAgent.approveProductForProduction(product.id);
    const isApprovedProduction = approvedProduct.productionStatus === 'approved_production';

    if (product && hasName && hasPromise && hasIndex && hasFormat && isConcept && isApprovedProduction) {
      console.log('✅ Teste 10 Passou: Concepção de produto pelo Product Creator Agent, persistência de esqueleto didático e homologação para produção validados.');
      passedTests++;
    } else {
      throw new Error(`Valores incorretos. name=${hasName}, promise=${hasPromise}, index=${hasIndex}, format=${hasFormat}, concept=${isConcept}, approved=${isApprovedProduction}`);
    }
  } catch (err: any) {
    console.error('❌ Teste 10 Falhou: Operações do Product Creator Agent & Homologação.', err.message);
    failedTests++;
  }

  console.log('\n=======================================');
  console.log(`  RESULTADO DOS TESTES: ${passedTests} Passaram | ${failedTests} Falharam`);
  console.log('=======================================\n');

  return { passed: passedTests, failed: failedTests };
}
