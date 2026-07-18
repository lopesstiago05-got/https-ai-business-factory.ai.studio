import { getDB, isDatabaseHealthy } from './index.ts';
import { users, agents, products, tasks, systemLogs, ceoConfigs, ceoDecisions, ceoPlans, ceoReports, researchSearches, researchTrends, researchNiches, researchOpportunities, researchReports, marketAnalyses, generatedContents, designProjects, marketingCampaigns, publications, financialTransactions, revenues, expenses, cashflow, financialReports, financialForecasts, profitAnalysis, roiHistory, campaignResults, customerMetrics, agentHealth, agentMetrics, agentHeartbeats, workflowHistory, systemAlerts, operationLogs, systemMetrics, performanceHistory, repairIssues, repairHistory, repairReports, repairTests, repairActions, repairSnapshots, repairRollbacks, repairKnowledge, repairStatistics, repairDiagnostics, kernelRegistry, kernelEvents, kernelPlugins, kernelServices, kernelVersions, kernelConfigs, kernelSharedMemory, kernelAudit, kernelMetrics, kernelHealth, integrationConnectors, integrationJobs, integrationLogs, integrationTokens, integrationWebhooks, integrationFiles, integrationSync, integrationMetrics, integrationErrors, integrationHistory, paymentConnections, paymentTransactions, digitalSales, platformConnections, customers, launches, campaigns, emailSequences, marketingEvents } from './schema.ts';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { SystemState, AgentInfo, Task, DigitalProduct, CEOConfig, CEODecision, CEOPlan, CEOReport, ResearchSearch, ResearchTrend, ResearchNiche, ResearchOpportunity, ResearchReport, MarketAnalysis, GeneratedContent, DesignProject, MarketingCampaign, Publication, FinancialTransaction, Revenue, Expense, CashFlow, FinancialReport, FinancialForecast, ProfitAnalysis, RoiHistory, CampaignResult, CustomerMetrics, AgentHealth, AgentMetrics, AgentHeartbeatRecord, WorkflowHistoryRecord, SystemAlert, OperationLog, SystemHealthMetrics, PerformanceHistoryRecord, RepairIssue, RepairHistory, RepairReport, RepairTest, RepairAction, RepairSnapshot, RepairRollback, RepairKnowledge, RepairStatistics, RepairDiagnostic, KernelAgentRegistry, KernelEvent, KernelSharedMemory, KernelPlugin, KernelService, KernelConfig, KernelSecretMetadata, KernelVersionRecord, KernelTask, KernelCommunicationLog, KernelAuditLog, KernelMetrics, KernelHealth, IntegrationConnector, IntegrationJob, IntegrationLog, IntegrationToken, IntegrationWebhook, IntegrationFile, IntegrationSync, IntegrationMetrics, IntegrationError, IntegrationHistory, PaymentConnection, PaymentTransaction, DigitalSale, PlatformConnection, Customer, Launch, LaunchCampaign, EmailSequence, MarketingEvent } from '../types.ts';

const DB_FILE = path.join(process.cwd(), 'factory_db.json');

// Baseline dos agentes iniciais
const DEFAULT_AGENTS: AgentInfo[] = [
  {
    id: 'ceo',
    name: 'CEO Agent',
    role: 'Diretor Executivo',
    status: 'idle',
    executionTime: 0,
    efficiency: 98,
    description: 'Define a visão estratégica, escolhe nichos lucrativos e valida ideias de negócios.'
  },
  {
    id: 'research',
    name: 'Research Agent',
    role: 'Pesquisador de Mercado',
    status: 'idle',
    executionTime: 0,
    efficiency: 95,
    description: 'Analisa tendências de mercado, dores da persona e mapeia concorrentes.'
  },
  {
    id: 'market_analyst',
    name: 'Market Analyst Agent',
    role: 'Analista de Negócios e Viabilidade',
    status: 'idle',
    executionTime: 0,
    efficiency: 94,
    description: 'Avalia o potencial financeiro, concorrência, precificação e viabilidade de ideias de infoprodutos.'
  },
  {
    id: 'market',
    name: 'Market Agent',
    role: 'Especialista em SEO',
    status: 'idle',
    executionTime: 0,
    efficiency: 92,
    description: 'Pesquisa palavras-chave de alto volume, define canais de aquisição e canais de distribuição.'
  },
  {
    id: 'product',
    name: 'Product Agent',
    role: 'Gerente de Produto',
    status: 'idle',
    executionTime: 0,
    efficiency: 96,
    description: 'Estrutura o esqueleto do produto digital, módulos, capítulos e especificações técnicas.'
  },
  {
    id: 'writer',
    name: 'Writer Agent',
    role: 'Redator & Copywriter',
    status: 'idle',
    executionTime: 0,
    efficiency: 94,
    description: 'Redige o conteúdo principal do produto, e-books, scripts ou apostilas com alta didática.'
  },
  {
    id: 'designer',
    name: 'Designer Agent',
    role: 'Diretor de Arte',
    status: 'idle',
    executionTime: 0,
    efficiency: 91,
    description: 'Define identidade visual, paleta de cores, tipografia e cria prompts detalhados para criativos.'
  },
  {
    id: 'marketing',
    name: 'Marketing Agent',
    role: 'Growth Hacker',
    status: 'idle',
    executionTime: 0,
    efficiency: 95,
    description: 'Cria copys de páginas de vendas, headlines irresistíveis e sequências de e-mails de lançamento.'
  },
  {
    id: 'publisher',
    name: 'Publisher Agent',
    role: 'Especialista de Lançamento',
    status: 'idle',
    executionTime: 0,
    efficiency: 90,
    description: 'Configura o empacotamento do produto, integrações e simula o fluxo de vendas do funil.'
  },
  {
    id: 'finance',
    name: 'Finance Agent',
    role: 'Diretor Financeiro',
    status: 'idle',
    executionTime: 0,
    efficiency: 97,
    description: 'Define a precificação ótima, calcula margens, projeções de vendas e calcula o ROI esperado.'
  },
  {
    id: 'supervisor',
    name: 'Supervisor Agent',
    role: 'Garantia de Qualidade',
    status: 'idle',
    executionTime: 0,
    efficiency: 99,
    description: 'Revisa todos os materiais criados, otimiza pontos falhos e assina a aprovação final do lote.'
  },
  {
    id: 'launch_manager',
    name: 'Launch Manager Agent',
    role: 'Diretor de Lançamentos',
    status: 'idle',
    executionTime: 0,
    efficiency: 96,
    description: 'Planeja estratégias de lançamentos de produtos digitais, coordena campanhas multicanal, dispara automações comerciais e otimiza a conversão de vendas.'
  },
  {
    id: 'customer_success',
    name: 'Customer Success Agent',
    role: 'Gerente de Sucesso e Retenção',
    status: 'idle',
    executionTime: 0,
    efficiency: 97,
    description: 'Acompanha a utilização dos clientes, calcula scores de saúde, prevê probabilidade de churn, gerencia automações de engajamento e dispara campanhas de retenção ativa.'
  },
  {
    id: 'evolution_manager',
    name: 'Evolution Manager Agent',
    role: 'Gerente de Evolução e Otimização',
    status: 'idle',
    executionTime: 0,
    efficiency: 98,
    description: 'Monitora o desempenho dos agentes de IA, mapeia gargalos de latência ou taxa de erro, conduz testes A/B de prompts e propõe recomendações de evolução controlada.'
  },
  {
    id: 'global_expansion_agent',
    name: 'Global Expansion Agent',
    role: 'Diretor de Expansão Internacional',
    status: 'idle',
    executionTime: 0,
    efficiency: 97,
    description: 'Responsável por coordenar o processo de internacionalização de infoprodutos, adaptar precificações por paridade, analisar nuances culturais, fornecer avisos fiscais/legais por país e localizar materiais de marketing.'
  }
];

let fallbackState: SystemState = {
  metrics: {
    activeAgentsCount: DEFAULT_AGENTS.length,
    runningAgentsCount: 0,
    productsCreatedCount: 0,
    productsPublishedCount: 0,
    totalRevenue: 0,
    totalProfit: 0
  },
  agents: DEFAULT_AGENTS,
  tasks: [],
  products: [],
  isFactoryRunning: false,
  ceoConfig: {
    id: 'default',
    focus: 'premium',
    autoStart: false,
    temperature: 0.7,
    systemPrompt: 'Você é o CEO Agent, o cérebro estratégico e Diretor Executivo da fábrica de infoprodutos. Seu objetivo é analisar metas e objetivos informados pelo administrador, planejar a esteira de execução de tarefas delegando para os agentes especialistas corretos, e auditar os resultados finais entregues.',
    updatedAt: new Date().toISOString()
  },
  ceoDecisions: [],
  ceoPlans: [],
  ceoReports: [],
  researchSearches: [],
  researchTrends: [],
  researchNiches: [],
  researchOpportunities: [],
  researchReports: [],
  marketAnalyses: [],
  generatedContents: [],
  designProjects: [],
  marketingCampaigns: [],
  publications: [],
  repairIssues: [],
  repairHistory: [],
  repairReports: [],
  repairTests: [],
  repairActions: [],
  repairSnapshots: [],
  repairRollbacks: [],
  repairKnowledge: [],
  repairStatistics: [],
  repairDiagnostics: [],
  kernelRegistry: [],
  kernelEvents: [],
  kernelPlugins: [],
  kernelServices: [],
  kernelVersions: [],
  kernelConfigs: [],
  kernelSharedMemory: [],
  kernelAudit: [],
  kernelMetrics: [],
  kernelHealth: [],
  paymentConnections: [],
  paymentTransactions: [],
  customers: [],
  launches: [],
  campaigns: [],
  emailSequences: [],
  marketingEvents: [],
  connections: [],
  connectionLogs: [],
  syncHistory: []
};

// Carrega o arquivo JSON como fallback inicial
if (fs.existsSync(DB_FILE)) {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    fallbackState = { ...fallbackState, ...JSON.parse(data), isFactoryRunning: false };
    
    // Injeta novos agentes que não existiam no arquivo anteriormente
    DEFAULT_AGENTS.forEach(a => {
      if (!fallbackState.agents.some(existing => existing.id === a.id)) {
        fallbackState.agents.push(a);
      }
    });

    fallbackState.metrics.activeAgentsCount = fallbackState.agents.length;

    // Reset statuses de agentes para idle ao reiniciar o servidor
    fallbackState.agents.forEach(a => {
      a.status = 'idle';
      a.currentTask = undefined;
    });
    fallbackState.metrics.runningAgentsCount = 0;
  } catch (err) {
    console.error('Erro carregando base de fallback JSON:', err);
  }
}

export class Repository {
  // Verifica se o banco de dados PostgreSQL está disponível e funcional
  public static isPGAvailable(): boolean {
    return isDatabaseHealthy();
  }

  // Recupera o estado completo do sistema (Agentes, Produtos, Tarefas, Métricas)
  static async getSystemState(): Promise<SystemState> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        
        // Carrega dados das tabelas PostgreSQL
        const dbAgents = await db.select().from(agents);
        const dbProducts = await db.select().from(products);
        const dbTasks = await db.select().from(tasks);
        const dbSearches = await db.select().from(researchSearches).catch(() => []);
        const dbTrends = await db.select().from(researchTrends).catch(() => []);
        const dbNiches = await db.select().from(researchNiches).catch(() => []);
        const dbOpportunities = await db.select().from(researchOpportunities).catch(() => []);
        const dbReports = await db.select().from(researchReports).catch(() => []);
        const dbMarketAnalyses = await db.select().from(marketAnalyses).catch(() => []);
        const dbGeneratedContents = await db.select().from(generatedContents).catch(() => []);
        const dbDesignProjects = await db.select().from(designProjects).catch(() => []);
        const dbMarketingCampaigns = await db.select().from(marketingCampaigns).catch(() => []);
        const dbPublications = await db.select().from(publications).catch(() => []);
        const dbCustomers = await db.select().from(customers).catch(() => []);

        // Se novos agentes de etapas recentes não estão presentes na tabela Postgres, insere-os
        for (const a of DEFAULT_AGENTS) {
          const exists = dbAgents.some(da => da.id === a.id);
          if (!exists) {
            await db.insert(agents).values({
              id: a.id,
              name: a.name,
              role: a.role,
              status: 'idle',
              executionTime: 0,
              efficiency: a.efficiency,
              description: a.description,
            });
          }
        }

        const activeAgents = await db.select().from(agents);
        const productsCreatedCount = dbProducts.length;
        const productsPublishedCount = dbProducts.filter(p => p.status === 'published').length;
        
        let totalRevenue = 0;
        let totalProfit = 0;
        dbProducts.forEach(p => {
          totalRevenue += p.revenue;
          totalProfit += p.revenue * 0.92;
        });

        const mappedAgents: AgentInfo[] = activeAgents.map(a => ({
          id: a.id as any,
          name: a.name,
          role: a.role,
          status: a.status as any,
          executionTime: a.executionTime,
          efficiency: a.efficiency,
          description: a.description,
          currentTask: a.currentTask || undefined
        }));

        const mappedProducts: DigitalProduct[] = dbProducts.map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          niche: p.niche,
          price: p.price,
          revenue: p.revenue,
          status: p.status as any,
          description: p.description,
          content: p.content,
          salesPage: p.salesPage || undefined,
          designerAssets: p.designerAssets as string[],
          financialProjection: p.financialProjection || undefined,
          publicationLogs: p.publicationLogs as string[],
          checkoutUrl: p.checkoutUrl || undefined,
          paymentProvider: p.paymentProvider || undefined,
          timestamp: p.createdAt.toLocaleString('pt-BR'),
          subtitle: p.subtitle || undefined,
          mainPromise: p.mainPromise || undefined,
          problemSolved: p.problemSolved || undefined,
          targetAudience: p.targetAudience || undefined,
          persona: p.persona || undefined,
          format: p.format || undefined,
          indexTableOfContents: p.indexTableOfContents || undefined,
          modules: p.modules as any[] || [],
          chapters: p.chapters as any[] || [],
          differentiation: p.differentiation || undefined,
          positioningStrategy: p.positioningStrategy || undefined,
          productionPlan: p.productionPlan || undefined,
          briefing: p.briefing || undefined,
          version: p.version || '1.0.0',
          productionStatus: (p.productionStatus || 'concept') as any
        }));

        const mappedTasks: Task[] = dbTasks.map(t => ({
          id: t.id,
          agentId: t.agentId as any,
          productId: t.productId || undefined,
          title: t.title,
          description: t.description,
          status: t.status as any,
          priority: (t.priority || 'medium') as any,
          executionTime: t.executionTime || 0,
          result: t.result || undefined,
          logs: t.logs as string[],
          timestamp: t.timestamp
        }));

        const mappedSearches: ResearchSearch[] = dbSearches.map(s => ({
          id: s.id,
          query: s.query,
          resultsCount: s.resultsCount,
          results: s.results,
          timestamp: s.timestamp
        }));

        const mappedTrends: ResearchTrend[] = dbTrends.map(tr => ({
          id: tr.id,
          topic: tr.topic,
          growthRate: tr.growthRate,
          source: tr.source,
          volume: tr.volume,
          niche: tr.niche,
          timestamp: tr.timestamp
        }));

        const mappedNiches: ResearchNiche[] = dbNiches.map(n => ({
          id: n.id,
          name: n.name,
          description: n.description,
          audienceSize: n.audienceSize,
          monetizationScore: n.monetizationScore,
          competitiveness: n.competitiveness as any,
          timestamp: n.timestamp
        }));

        const mappedOpportunities: ResearchOpportunity[] = dbOpportunities.map(o => ({
          id: o.id,
          title: o.title,
          niche: o.niche,
          description: o.description,
          painPoint: o.painPoint,
          differentiation: o.differentiation,
          demandScore: o.demandScore,
          financialScore: o.financialScore,
          competitionScore: o.competitionScore,
          creationEaseScore: o.creationEaseScore,
          launchSpeedScore: o.launchSpeedScore,
          finalScore: o.finalScore,
          status: o.status as any,
          timestamp: o.timestamp
        }));

        const mappedReports: ResearchReport[] = dbReports.map(r => ({
          id: r.id,
          title: r.title,
          content: r.content,
          recommendations: r.recommendations,
          timestamp: r.timestamp
        }));

        const mappedMarketAnalyses: MarketAnalysis[] = dbMarketAnalyses.map(ma => ({
          id: ma.id,
          opportunityId: ma.opportunityId || '',
          opportunityTitle: ma.opportunityTitle,
          niche: ma.niche,
          demandScore: ma.demandScore,
          urgencyScore: ma.urgencyScore,
          buyingPowerScore: ma.buyingPowerScore,
          competitionScore: ma.competitionScore,
          differentiationScore: ma.differentiationScore,
          creationEaseScore: ma.creationEaseScore,
          scalingPotentialScore: ma.scalingPotentialScore,
          profitMarginScore: ma.profitMarginScore,
          finalScore: ma.finalScore,
          targetAudience: ma.targetAudience,
          estimatedPrice: ma.estimatedPrice,
          financialViability: ma.financialViability,
          expertOpinion: ma.expertOpinion,
          recommendations: ma.recommendations,
          status: ma.status as any,
          timestamp: ma.timestamp
        }));

        const mappedGeneratedContents: GeneratedContent[] = dbGeneratedContents.map(gc => ({
          id: gc.id,
          productId: gc.productId || '',
          productName: gc.productName,
          contentType: gc.contentType,
          title: gc.title,
          body: gc.body,
          outline: gc.outline || undefined,
          version: gc.version,
          status: gc.status as any,
          qualityScore: gc.qualityScore || undefined,
          clarityScore: gc.clarityScore || undefined,
          depthScore: gc.depthScore || undefined,
          organizationScore: gc.organizationScore || undefined,
          valueDeliveredScore: gc.valueDeliveredScore || undefined,
          audienceFitScore: gc.audienceFitScore || undefined,
          originalityScore: gc.originalityScore || undefined,
          feedback: gc.feedback || undefined,
          revisions: gc.revisions as any[],
          chaptersCount: gc.chaptersCount,
          timestamp: gc.timestamp
        }));

        const mappedDesignProjects: DesignProject[] = dbDesignProjects.map(dp => ({
          id: dp.id,
          productId: dp.productId,
          productName: dp.productName,
          contentId: dp.contentId || undefined,
          title: dp.title,
          visualIdentity: dp.visualIdentity,
          styleChoice: dp.styleChoice,
          imageBriefing: dp.imageBriefing,
          coverLayout: dp.coverLayout,
          marketingAssets: dp.marketingAssets as any[],
          version: dp.version,
          status: dp.status as any,
          qualityScore: dp.qualityScore || undefined,
          aestheticScore: dp.aestheticScore || undefined,
          clarityScore: dp.clarityScore || undefined,
          audienceFitScore: dp.audienceFitScore || undefined,
          commercialAppealScore: dp.commercialAppealScore || undefined,
          differentiationScore: dp.differentiationScore || undefined,
          feedback: dp.feedback || undefined,
          generatedAssets: dp.generatedAssets as any[] || [],
          timestamp: dp.timestamp
        }));

        const mappedMarketingCampaigns: MarketingCampaign[] = dbMarketingCampaigns.map(mc => ({
          id: mc.id,
          productId: mc.productId,
          productName: mc.productName,
          title: mc.title,
          persona: mc.persona as any,
          positioning: mc.positioning,
          copywriting: mc.copywriting as any,
          salesPage: mc.salesPage as any,
          socialMedia: mc.socialMedia as any,
          campaignAds: mc.campaignAds as any,
          version: mc.version,
          status: mc.status as any,
          qualityScore: mc.qualityScore || undefined,
          offerClarityScore: mc.offerClarityScore || undefined,
          conversionPowerScore: mc.conversionPowerScore || undefined,
          audienceFitScore: mc.audienceFitScore || undefined,
          differentiationScore: mc.differentiationScore || undefined,
          scalePotentialScore: mc.scalePotentialScore || undefined,
          feedback: mc.feedback || undefined,
          timestamp: mc.timestamp
        }));

        const mappedPublications: Publication[] = dbPublications.map(pub => ({
          id: pub.id,
          productId: pub.productId,
          productName: pub.productName,
          description: pub.description,
          category: pub.category,
          price: pub.price,
          images: pub.images as string[],
          files: pub.files as string[],
          salesPageUrl: pub.salesPageUrl,
          termsAndConditions: pub.termsAndConditions,
          status: pub.status as any,
          version: pub.version,
          platforms: pub.platforms as any,
          checklist: pub.checklist as any,
          history: pub.history as any[],
          timestamp: pub.timestamp
        }));

        const mappedCustomers: Customer[] = dbCustomers.map(c => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone || '',
          purchases: c.purchases || 0,
          totalSpent: c.totalSpent || 0,
          lastPurchase: c.lastPurchase || '',
          createdAt: c.createdAt ? c.createdAt.toISOString() : ''
        }));

        return {
          metrics: {
            activeAgentsCount: mappedAgents.length,
            runningAgentsCount: mappedAgents.filter(a => a.status === 'running').length,
            productsCreatedCount,
            productsPublishedCount,
            totalRevenue,
            totalProfit,
          },
          agents: mappedAgents,
          tasks: mappedTasks,
          products: mappedProducts,
          isFactoryRunning: fallbackState.isFactoryRunning,
          researchSearches: mappedSearches,
          researchTrends: mappedTrends,
          researchNiches: mappedNiches,
          researchOpportunities: mappedOpportunities,
          researchReports: mappedReports,
          marketAnalyses: mappedMarketAnalyses,
          generatedContents: mappedGeneratedContents,
          designProjects: mappedDesignProjects,
          marketingCampaigns: mappedMarketingCampaigns,
          publications: mappedPublications,
          customers: mappedCustomers
        };
      } catch (err) {
        console.error('Falha de consulta no PostgreSQL. Recorrendo ao fallback local JSON:', err);
      }
    }

    // Retorna fallback do JSON em memória
    return fallbackState;
  }

  // Atualiza ou salva o estado global (Produtos, Tarefas, Agentes) no banco de dados ativo
  static async saveState(state: Partial<SystemState>) {
    if (state.isFactoryRunning !== undefined) {
      fallbackState.isFactoryRunning = state.isFactoryRunning;
    }

    if (this.isPGAvailable()) {
      try {
        const db = getDB();

        // Sincroniza agentes se inclusos
        if (state.agents) {
          for (const a of state.agents) {
            await db.insert(agents).values({
              id: a.id,
              name: a.name,
              role: a.role,
              status: a.status,
              executionTime: a.executionTime,
              efficiency: a.efficiency,
              currentTask: a.currentTask || null,
              description: a.description
            }).onConflictDoUpdate({
              target: agents.id,
              set: {
                status: a.status,
                executionTime: a.executionTime,
                currentTask: a.currentTask || null,
                efficiency: a.efficiency
              }
            });
          }
        }

        // Sincroniza produtos se inclusos
        if (state.products) {
          for (const p of state.products) {
            await db.insert(products).values({
              id: p.id,
              name: p.name,
              category: p.category,
              niche: p.niche,
              price: p.price,
              revenue: p.revenue,
              status: p.status,
              description: p.description,
              content: p.content,
              salesPage: p.salesPage || null,
              designerAssets: p.designerAssets || [],
              financialProjection: p.financialProjection || null,
              publicationLogs: p.publicationLogs || [],
              checkoutUrl: p.checkoutUrl || null,
              paymentProvider: p.paymentProvider || null,
              subtitle: p.subtitle || null,
              mainPromise: p.mainPromise || null,
              problemSolved: p.problemSolved || null,
              targetAudience: p.targetAudience || null,
              persona: p.persona || null,
              format: p.format || null,
              indexTableOfContents: p.indexTableOfContents || null,
              modules: p.modules || [],
              chapters: p.chapters || [],
              differentiation: p.differentiation || null,
              positioningStrategy: p.positioningStrategy || null,
              productionPlan: p.productionPlan || null,
              briefing: p.briefing || null,
              version: p.version || '1.0.0',
              productionStatus: p.productionStatus || 'concept',
            }).onConflictDoUpdate({
              target: products.id,
              set: {
                name: p.name,
                niche: p.niche,
                price: p.price,
                revenue: p.revenue,
                status: p.status,
                description: p.description,
                content: p.content,
                salesPage: p.salesPage || null,
                designerAssets: p.designerAssets || [],
                financialProjection: p.financialProjection || null,
                publicationLogs: p.publicationLogs || [],
                checkoutUrl: p.checkoutUrl || null,
                paymentProvider: p.paymentProvider || null,
                subtitle: p.subtitle || null,
                mainPromise: p.mainPromise || null,
                problemSolved: p.problemSolved || null,
                targetAudience: p.targetAudience || null,
                persona: p.persona || null,
                format: p.format || null,
                indexTableOfContents: p.indexTableOfContents || null,
                modules: p.modules || [],
                chapters: p.chapters || [],
                differentiation: p.differentiation || null,
                positioningStrategy: p.positioningStrategy || null,
                productionPlan: p.productionPlan || null,
                briefing: p.briefing || null,
                version: p.version || '1.0.0',
                productionStatus: p.productionStatus || 'concept',
              }
            });
          }
        }

        // Sincroniza tarefas do pipeline se inclusos
        if (state.tasks) {
          for (const t of state.tasks) {
            await db.insert(tasks).values({
              id: t.id,
              agentId: t.agentId,
              productId: t.productId || null,
              title: t.title,
              description: t.description,
              status: t.status,
              priority: t.priority || 'medium',
              executionTime: t.executionTime || 0,
              result: t.result || null,
              logs: t.logs || [],
              timestamp: t.timestamp
            }).onConflictDoUpdate({
              target: tasks.id,
              set: {
                status: t.status,
                priority: t.priority || 'medium',
                executionTime: t.executionTime || 0,
                result: t.result || null,
                logs: t.logs || []
              }
            });
          }
        }

        // Sincroniza pesquisas do research agent se inclusos
        if (state.researchSearches) {
          for (const s of state.researchSearches) {
            await db.insert(researchSearches).values({
              id: s.id,
              query: s.query,
              resultsCount: s.resultsCount,
              results: s.results,
              timestamp: s.timestamp,
              createdAt: new Date()
            }).onConflictDoUpdate({
              target: researchSearches.id,
              set: {
                query: s.query,
                resultsCount: s.resultsCount,
                results: s.results,
                timestamp: s.timestamp
              }
            });
          }
        }

        // Sincroniza tendências do research agent se inclusos
        if (state.researchTrends) {
          for (const tr of state.researchTrends) {
            await db.insert(researchTrends).values({
              id: tr.id,
              topic: tr.topic,
              growthRate: tr.growthRate,
              source: tr.source,
              volume: tr.volume,
              niche: tr.niche,
              timestamp: tr.timestamp,
              createdAt: new Date()
            }).onConflictDoUpdate({
              target: researchTrends.id,
              set: {
                topic: tr.topic,
                growthRate: tr.growthRate,
                source: tr.source,
                volume: tr.volume,
                niche: tr.niche,
                timestamp: tr.timestamp
              }
            });
          }
        }

        // Sincroniza nichos do research agent se inclusos
        if (state.researchNiches) {
          for (const n of state.researchNiches) {
            await db.insert(researchNiches).values({
              id: n.id,
              name: n.name,
              description: n.description,
              audienceSize: n.audienceSize,
              monetizationScore: n.monetizationScore,
              competitiveness: n.competitiveness,
              timestamp: n.timestamp,
              createdAt: new Date()
            }).onConflictDoUpdate({
              target: researchNiches.id,
              set: {
                name: n.name,
                description: n.description,
                audienceSize: n.audienceSize,
                monetizationScore: n.monetizationScore,
                competitiveness: n.competitiveness,
                timestamp: n.timestamp
              }
            });
          }
        }

        // Sincroniza oportunidades do research agent se inclusos
        if (state.researchOpportunities) {
          for (const o of state.researchOpportunities) {
            await db.insert(researchOpportunities).values({
              id: o.id,
              title: o.title,
              niche: o.niche,
              description: o.description,
              painPoint: o.painPoint,
              differentiation: o.differentiation,
              demandScore: o.demandScore,
              financialScore: o.financialScore,
              competitionScore: o.competitionScore,
              creationEaseScore: o.creationEaseScore,
              launchSpeedScore: o.launchSpeedScore,
              finalScore: o.finalScore,
              status: o.status,
              timestamp: o.timestamp,
              createdAt: new Date()
            }).onConflictDoUpdate({
              target: researchOpportunities.id,
              set: {
                title: o.title,
                niche: o.niche,
                description: o.description,
                painPoint: o.painPoint,
                differentiation: o.differentiation,
                demandScore: o.demandScore,
                financialScore: o.financialScore,
                competitionScore: o.competitionScore,
                creationEaseScore: o.creationEaseScore,
                launchSpeedScore: o.launchSpeedScore,
                finalScore: o.finalScore,
                status: o.status,
                timestamp: o.timestamp
              }
            });
          }
        }

        // Sincroniza relatórios do research agent se inclusos
        if (state.researchReports) {
          for (const r of state.researchReports) {
            await db.insert(researchReports).values({
              id: r.id,
              title: r.title,
              content: r.content,
              recommendations: r.recommendations,
              timestamp: r.timestamp,
              createdAt: new Date()
            }).onConflictDoUpdate({
              target: researchReports.id,
              set: {
                title: r.title,
                content: r.content,
                recommendations: r.recommendations,
                timestamp: r.timestamp
              }
            });
          }
        }

        // Sincroniza análises de mercado do market analyst agent se inclusos
        if (state.marketAnalyses) {
          for (const ma of state.marketAnalyses) {
            await db.insert(marketAnalyses).values({
              id: ma.id,
              opportunityId: ma.opportunityId || null,
              opportunityTitle: ma.opportunityTitle,
              niche: ma.niche,
              demandScore: ma.demandScore,
              urgencyScore: ma.urgencyScore,
              buyingPowerScore: ma.buyingPowerScore,
              competitionScore: ma.competitionScore,
              differentiationScore: ma.differentiationScore,
              creationEaseScore: ma.creationEaseScore,
              scalingPotentialScore: ma.scalingPotentialScore,
              profitMarginScore: ma.profitMarginScore,
              finalScore: ma.finalScore,
              targetAudience: ma.targetAudience,
              estimatedPrice: ma.estimatedPrice,
              financialViability: ma.financialViability,
              expertOpinion: ma.expertOpinion,
              recommendations: ma.recommendations,
              status: ma.status,
              timestamp: ma.timestamp,
              createdAt: new Date()
            }).onConflictDoUpdate({
              target: marketAnalyses.id,
              set: {
                opportunityId: ma.opportunityId || null,
                opportunityTitle: ma.opportunityTitle,
                niche: ma.niche,
                demandScore: ma.demandScore,
                urgencyScore: ma.urgencyScore,
                buyingPowerScore: ma.buyingPowerScore,
                competitionScore: ma.competitionScore,
                differentiationScore: ma.differentiationScore,
                creationEaseScore: ma.creationEaseScore,
                scalingPotentialScore: ma.scalingPotentialScore,
                profitMarginScore: ma.profitMarginScore,
                finalScore: ma.finalScore,
                targetAudience: ma.targetAudience,
                estimatedPrice: ma.estimatedPrice,
                financialViability: ma.financialViability,
                expertOpinion: ma.expertOpinion,
                recommendations: ma.recommendations,
                status: ma.status,
                timestamp: ma.timestamp
              }
            });
          }
        }
      } catch (err) {
        console.error('Erro salvando estado no PostgreSQL:', err);
      }
    }

    // Sempre atualiza o fallback local JSON
    if (state.metrics) fallbackState.metrics = { ...fallbackState.metrics, ...state.metrics };
    if (state.agents) fallbackState.agents = state.agents;
    if (state.tasks) fallbackState.tasks = state.tasks;
    if (state.products) fallbackState.products = state.products;
    if (state.researchSearches) fallbackState.researchSearches = state.researchSearches;
    if (state.researchTrends) fallbackState.researchTrends = state.researchTrends;
    if (state.researchNiches) fallbackState.researchNiches = state.researchNiches;
    if (state.researchOpportunities) fallbackState.researchOpportunities = state.researchOpportunities;
    if (state.researchReports) fallbackState.researchReports = state.researchReports;
    if (state.marketAnalyses) fallbackState.marketAnalyses = state.marketAnalyses;
    if (state.generatedContents) fallbackState.generatedContents = state.generatedContents;
    if (state.designProjects) fallbackState.designProjects = state.designProjects;
    if (state.marketingCampaigns) fallbackState.marketingCampaigns = state.marketingCampaigns;
    if (state.publications) fallbackState.publications = state.publications;
    if (state.financialTransactions) fallbackState.financialTransactions = state.financialTransactions;
    if (state.revenues) fallbackState.revenues = state.revenues;
    if (state.expenses) fallbackState.expenses = state.expenses;
    if (state.cashflow) fallbackState.cashflow = state.cashflow;
    if (state.financialReports) fallbackState.financialReports = state.financialReports;
    if (state.financialForecasts) fallbackState.financialForecasts = state.financialForecasts;
    if (state.profitAnalysis) fallbackState.profitAnalysis = state.profitAnalysis;
    if (state.roiHistory) fallbackState.roiHistory = state.roiHistory;
    if (state.campaignResults) fallbackState.campaignResults = state.campaignResults;
    if (state.customerMetrics) fallbackState.customerMetrics = state.customerMetrics;
    if (state.customers) fallbackState.customers = state.customers;
    if (state.launches) fallbackState.launches = state.launches;
    if (state.campaigns) fallbackState.campaigns = state.campaigns;
    if (state.emailSequences) fallbackState.emailSequences = state.emailSequences;
    if (state.marketingEvents) fallbackState.marketingEvents = state.marketingEvents;
    if ((state as any).connections) (fallbackState as any).connections = (state as any).connections;
    if ((state as any).connectionLogs) (fallbackState as any).connectionLogs = (state as any).connectionLogs;
    if ((state as any).syncHistory) (fallbackState as any).syncHistory = (state as any).syncHistory;

    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(fallbackState, null, 2), 'utf-8');
    } catch (err) {
      console.error('Erro escrevendo no arquivo JSON:', err);
    }
  }

  // Autenticação de Usuários: Cadastra novo usuário
  static async createUser(name: string, email: string, passwordHash: string, role: string) {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const [newUser] = await db.insert(users).values({
          id: Math.random().toString(36).substring(2, 11),
          name,
          email,
          passwordHash,
          role
        }).returning();
        return newUser;
      } catch (err) {
        console.error('Erro cadastrando usuário no Postgres. Executando salvamento local temporário:', err);
      }
    }
    
    // Fallback de cadastro de usuário local (para fins de simulação e preview)
    const mockId = Math.random().toString(36).substr(2, 9);
    const mockUser = { id: mockId, name, email, passwordHash, role, createdAt: new Date() };
    return mockUser;
  }

  // Autenticação de Usuários: Busca usuário por email
  static async findUserByEmail(email: string) {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (results.length > 0) return results[0];
      } catch (err) {
        console.error('Erro buscando usuário no Postgres:', err);
      }
    }

    // Se o banco não estiver disponível ou não possuir usuários, aceitamos credencial padrão de testes admin@factory.com / admin123
    if (email === 'admin@factory.com') {
      return {
        id: 'admin-id-mock',
        name: 'Administrador Principal',
        email: 'admin@factory.com',
        // Hash de 'admin123' gerado com salt de 10 rodadas
        passwordHash: '$2a$10$9v3YV0yY36W1D1.r7b3fSOnl/P0PqS22b10iTfQ.5A9bQyR87.ASe',
        role: 'admin',
        createdAt: new Date()
      };
    }
    return null;
  }

  // -------------------------------------------------------------
  // CEO AGENT REPOSITORY METHODS
  // -------------------------------------------------------------

  static async getCEOConfig(): Promise<CEOConfig> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(ceoConfigs).where(eq(ceoConfigs.id, 'default')).limit(1);
        if (results.length > 0) {
          const c = results[0];
          return {
            id: c.id,
            focus: c.focus as any,
            autoStart: c.autoStart === 1,
            temperature: c.temperature,
            systemPrompt: c.systemPrompt,
            updatedAt: c.updatedAt.toISOString()
          };
        }

        // Se não existir, cria o padrão
        const defaultConfig: CEOConfig = {
          id: 'default',
          focus: 'premium',
          autoStart: false,
          temperature: 0.7,
          systemPrompt: 'Você é o CEO Agent, o cérebro estratégico e Diretor Executivo da fábrica de infoprodutos. Seu objetivo é analisar metas e objetivos informados pelo administrador, planejar a esteira de execução de tarefas delegando para os agentes especialistas corretos, e auditar os resultados finais entregues.',
          updatedAt: new Date().toISOString()
        };

        await db.insert(ceoConfigs).values({
          id: defaultConfig.id,
          focus: defaultConfig.focus,
          autoStart: defaultConfig.autoStart ? 1 : 0,
          temperature: defaultConfig.temperature,
          systemPrompt: defaultConfig.systemPrompt,
          updatedAt: new Date()
        });

        return defaultConfig;
      } catch (err) {
        console.error('Erro ao buscar CEO Config do Postgres:', err);
      }
    }

    if (!fallbackState.ceoConfig) {
      fallbackState.ceoConfig = {
        id: 'default',
        focus: 'premium',
        autoStart: false,
        temperature: 0.7,
        systemPrompt: 'Você é o CEO Agent, o cérebro estratégico e Diretor Executivo da fábrica de infoprodutos. Seu objetivo é analisar metas e objetivos informados pelo administrador, planejar a esteira de execução de tarefas delegando para os agentes especialistas corretos, e auditar os resultados finais entregues.',
        updatedAt: new Date().toISOString()
      };
      await this.saveState({});
    }

    return fallbackState.ceoConfig;
  }

  static async saveCEOConfig(config: Partial<CEOConfig>): Promise<CEOConfig> {
    const current = await this.getCEOConfig();
    const updated = {
      ...current,
      ...config,
      updatedAt: new Date().toISOString()
    };

    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(ceoConfigs).values({
          id: 'default',
          focus: updated.focus,
          autoStart: updated.autoStart ? 1 : 0,
          temperature: updated.temperature,
          systemPrompt: updated.systemPrompt,
          updatedAt: new Date()
        }).onConflictDoUpdate({
          target: ceoConfigs.id,
          set: {
            focus: updated.focus,
            autoStart: updated.autoStart ? 1 : 0,
            temperature: updated.temperature,
            systemPrompt: updated.systemPrompt,
            updatedAt: new Date()
          }
        });
        return updated;
      } catch (err) {
        console.error('Erro ao salvar CEO Config no Postgres:', err);
      }
    }

    fallbackState.ceoConfig = updated;
    await this.saveState({});
    return updated;
  }

  static async addCEODecision(decision: Omit<CEODecision, 'id' | 'timestamp'>): Promise<CEODecision> {
    const newDecision: CEODecision = {
      id: 'dec_' + Math.random().toString(36).substr(2, 9),
      objective: decision.objective,
      decisionType: decision.decisionType,
      actionTaken: decision.actionTaken,
      reasoning: decision.reasoning,
      timestamp: new Date().toLocaleTimeString('pt-BR')
    };

    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(ceoDecisions).values({
          id: newDecision.id,
          objective: newDecision.objective,
          decisionType: newDecision.decisionType,
          actionTaken: newDecision.actionTaken,
          reasoning: newDecision.reasoning,
          timestamp: newDecision.timestamp,
          createdAt: new Date()
        });
        return newDecision;
      } catch (err) {
        console.error('Erro ao registrar decisão do CEO no Postgres:', err);
      }
    }

    if (!fallbackState.ceoDecisions) fallbackState.ceoDecisions = [];
    fallbackState.ceoDecisions.push(newDecision);
    await this.saveState({});
    return newDecision;
  }

  static async getCEODecisions(): Promise<CEODecision[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(ceoDecisions);
        return results.map(d => ({
          id: d.id,
          objective: d.objective,
          decisionType: d.decisionType as any,
          actionTaken: d.actionTaken,
          reasoning: d.reasoning,
          timestamp: d.timestamp
        })).sort((a, b) => b.id.localeCompare(a.id));
      } catch (err) {
        console.error('Erro ao listar decisões do CEO no Postgres:', err);
      }
    }

    if (!fallbackState.ceoDecisions) fallbackState.ceoDecisions = [];
    return [...fallbackState.ceoDecisions].sort((a, b) => b.id.localeCompare(a.id));
  }

  static async createCEOPlan(plan: Omit<CEOPlan, 'id' | 'createdAt'>): Promise<CEOPlan> {
    const newPlan: CEOPlan = {
      id: 'plan_' + Math.random().toString(36).substr(2, 9),
      productId: plan.productId,
      objective: plan.objective,
      targetAudience: plan.targetAudience,
      steps: plan.steps,
      status: plan.status || 'active',
      createdAt: new Date().toLocaleString('pt-BR')
    };

    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(ceoPlans).values({
          id: newPlan.id,
          productId: newPlan.productId || null,
          objective: newPlan.objective,
          targetAudience: newPlan.targetAudience,
          steps: newPlan.steps,
          status: newPlan.status,
          createdAt: new Date()
        });
        return newPlan;
      } catch (err) {
        console.error('Erro ao criar plano do CEO no Postgres:', err);
      }
    }

    if (!fallbackState.ceoPlans) fallbackState.ceoPlans = [];
    fallbackState.ceoPlans.push(newPlan);
    await this.saveState({});
    return newPlan;
  }

  static async getCEOPlans(): Promise<CEOPlan[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(ceoPlans);
        return results.map(p => ({
          id: p.id,
          productId: p.productId || undefined,
          objective: p.objective,
          targetAudience: p.targetAudience,
          steps: p.steps as any,
          status: p.status as any,
          createdAt: p.createdAt.toLocaleString('pt-BR')
        })).sort((a, b) => b.id.localeCompare(a.id));
      } catch (err) {
        console.error('Erro ao buscar planos do CEO no Postgres:', err);
      }
    }

    if (!fallbackState.ceoPlans) fallbackState.ceoPlans = [];
    return [...fallbackState.ceoPlans].sort((a, b) => b.id.localeCompare(a.id));
  }

  static async createCEOReport(report: Omit<CEOReport, 'id' | 'createdAt'>): Promise<CEOReport> {
    const newReport: CEOReport = {
      id: 'rep_' + Math.random().toString(36).substr(2, 9),
      productId: report.productId,
      title: report.title,
      content: report.content,
      recommendations: report.recommendations,
      createdAt: new Date().toLocaleString('pt-BR')
    };

    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(ceoReports).values({
          id: newReport.id,
          productId: newReport.productId || null,
          title: newReport.title,
          content: newReport.content,
          recommendations: newReport.recommendations || null,
          createdAt: new Date()
        });
        return newReport;
      } catch (err) {
        console.error('Erro ao criar relatório do CEO no Postgres:', err);
      }
    }

    if (!fallbackState.ceoReports) fallbackState.ceoReports = [];
    fallbackState.ceoReports.push(newReport);
    await this.saveState({});
    return newReport;
  }

  static async getCEOReports(): Promise<CEOReport[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(ceoReports);
        return results.map(r => ({
          id: r.id,
          productId: r.productId || undefined,
          title: r.title,
          content: r.content,
          recommendations: r.recommendations || undefined,
          createdAt: r.createdAt.toLocaleString('pt-BR')
        })).sort((a, b) => b.id.localeCompare(a.id));
      } catch (err) {
        console.error('Erro ao buscar relatórios do CEO no Postgres:', err);
      }
    }

    if (!fallbackState.ceoReports) fallbackState.ceoReports = [];
    return [...fallbackState.ceoReports].sort((a, b) => b.id.localeCompare(a.id));
  }

  // -------------------------------------------------------------
  // RESEARCH AGENT REPOSITORY METHODS
  // -------------------------------------------------------------

  static async getResearchSearches(): Promise<ResearchSearch[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(researchSearches);
        return results.map(s => ({
          id: s.id,
          query: s.query,
          resultsCount: s.resultsCount,
          results: s.results,
          timestamp: s.timestamp
        })).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      } catch (err) {
        console.error('Erro ao buscar pesquisas no Postgres:', err);
      }
    }
    if (!fallbackState.researchSearches) fallbackState.researchSearches = [];
    return [...fallbackState.researchSearches].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  static async addResearchSearch(search: Omit<ResearchSearch, 'id' | 'timestamp'>): Promise<ResearchSearch> {
    const newSearch: ResearchSearch = {
      id: 'src_' + Math.random().toString(36).substr(2, 9),
      query: search.query,
      resultsCount: search.resultsCount,
      results: search.results,
      timestamp: new Date().toISOString()
    };

    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(researchSearches).values({
          id: newSearch.id,
          query: newSearch.query,
          resultsCount: newSearch.resultsCount,
          results: newSearch.results,
          timestamp: newSearch.timestamp,
          createdAt: new Date()
        });
        return newSearch;
      } catch (err) {
        console.error('Erro ao salvar pesquisa no Postgres:', err);
      }
    }

    if (!fallbackState.researchSearches) fallbackState.researchSearches = [];
    fallbackState.researchSearches.push(newSearch);
    await this.saveState({});
    return newSearch;
  }

  static async getResearchTrends(): Promise<ResearchTrend[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(researchTrends);
        return results.map(tr => ({
          id: tr.id,
          topic: tr.topic,
          growthRate: tr.growthRate,
          source: tr.source,
          volume: tr.volume,
          niche: tr.niche,
          timestamp: tr.timestamp
        })).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      } catch (err) {
        console.error('Erro ao buscar tendencias no Postgres:', err);
      }
    }
    if (!fallbackState.researchTrends) fallbackState.researchTrends = [];
    return [...fallbackState.researchTrends].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  static async addResearchTrend(trend: Omit<ResearchTrend, 'id' | 'timestamp'>): Promise<ResearchTrend> {
    const newTrend: ResearchTrend = {
      id: 'trd_' + Math.random().toString(36).substr(2, 9),
      topic: trend.topic,
      growthRate: trend.growthRate,
      source: trend.source,
      volume: trend.volume,
      niche: trend.niche,
      timestamp: new Date().toISOString()
    };

    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(researchTrends).values({
          id: newTrend.id,
          topic: newTrend.topic,
          growthRate: newTrend.growthRate,
          source: newTrend.source,
          volume: newTrend.volume,
          niche: newTrend.niche,
          timestamp: newTrend.timestamp,
          createdAt: new Date()
        });
        return newTrend;
      } catch (err) {
        console.error('Erro ao salvar tendencia no Postgres:', err);
      }
    }

    if (!fallbackState.researchTrends) fallbackState.researchTrends = [];
    fallbackState.researchTrends.push(newTrend);
    await this.saveState({});
    return newTrend;
  }

  static async getResearchNiches(): Promise<ResearchNiche[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(researchNiches);
        return results.map(n => ({
          id: n.id,
          name: n.name,
          description: n.description,
          audienceSize: n.audienceSize,
          monetizationScore: n.monetizationScore,
          competitiveness: n.competitiveness as any,
          timestamp: n.timestamp
        })).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      } catch (err) {
        console.error('Erro ao buscar nichos no Postgres:', err);
      }
    }
    if (!fallbackState.researchNiches) fallbackState.researchNiches = [];
    return [...fallbackState.researchNiches].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  static async addResearchNiche(niche: Omit<ResearchNiche, 'id' | 'timestamp'>): Promise<ResearchNiche> {
    const newNiche: ResearchNiche = {
      id: 'nch_' + Math.random().toString(36).substr(2, 9),
      name: niche.name,
      description: niche.description,
      audienceSize: niche.audienceSize,
      monetizationScore: niche.monetizationScore,
      competitiveness: niche.competitiveness,
      timestamp: new Date().toISOString()
    };

    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(researchNiches).values({
          id: newNiche.id,
          name: newNiche.name,
          description: newNiche.description,
          audienceSize: newNiche.audienceSize,
          monetizationScore: newNiche.monetizationScore,
          competitiveness: newNiche.competitiveness,
          timestamp: newNiche.timestamp,
          createdAt: new Date()
        });
        return newNiche;
      } catch (err) {
        console.error('Erro ao salvar nicho no Postgres:', err);
      }
    }

    if (!fallbackState.researchNiches) fallbackState.researchNiches = [];
    fallbackState.researchNiches.push(newNiche);
    await this.saveState({});
    return newNiche;
  }

  static async getResearchOpportunities(): Promise<ResearchOpportunity[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(researchOpportunities);
        return results.map(o => ({
          id: o.id,
          title: o.title,
          niche: o.niche,
          description: o.description,
          painPoint: o.painPoint,
          differentiation: o.differentiation,
          demandScore: o.demandScore,
          financialScore: o.financialScore,
          competitionScore: o.competitionScore,
          creationEaseScore: o.creationEaseScore,
          launchSpeedScore: o.launchSpeedScore,
          finalScore: o.finalScore,
          status: o.status as any,
          timestamp: o.timestamp
        })).sort((a, b) => b.finalScore - a.finalScore);
      } catch (err) {
        console.error('Erro ao buscar oportunidades no Postgres:', err);
      }
    }
    if (!fallbackState.researchOpportunities) fallbackState.researchOpportunities = [];
    return [...fallbackState.researchOpportunities].sort((a, b) => b.finalScore - a.finalScore);
  }

  static async addResearchOpportunity(opp: Omit<ResearchOpportunity, 'id' | 'timestamp'>): Promise<ResearchOpportunity> {
    const newOpp: ResearchOpportunity = {
      id: 'opp_' + Math.random().toString(36).substr(2, 9),
      title: opp.title,
      niche: opp.niche,
      description: opp.description,
      painPoint: opp.painPoint,
      differentiation: opp.differentiation,
      demandScore: opp.demandScore,
      financialScore: opp.financialScore,
      competitionScore: opp.competitionScore,
      creationEaseScore: opp.creationEaseScore,
      launchSpeedScore: opp.launchSpeedScore,
      finalScore: opp.finalScore,
      status: opp.status || 'pending',
      timestamp: new Date().toISOString()
    };

    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(researchOpportunities).values({
          id: newOpp.id,
          title: newOpp.title,
          niche: newOpp.niche,
          description: newOpp.description,
          painPoint: newOpp.painPoint,
          differentiation: newOpp.differentiation,
          demandScore: newOpp.demandScore,
          financialScore: newOpp.financialScore,
          competitionScore: newOpp.competitionScore,
          creationEaseScore: newOpp.creationEaseScore,
          launchSpeedScore: newOpp.launchSpeedScore,
          finalScore: newOpp.finalScore,
          status: newOpp.status,
          timestamp: newOpp.timestamp,
          createdAt: new Date()
        });
        return newOpp;
      } catch (err) {
        console.error('Erro ao salvar oportunidade no Postgres:', err);
      }
    }

    if (!fallbackState.researchOpportunities) fallbackState.researchOpportunities = [];
    fallbackState.researchOpportunities.push(newOpp);
    await this.saveState({});
    return newOpp;
  }

  static async updateResearchOpportunityStatus(id: string, status: ResearchOpportunity['status']): Promise<boolean> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.update(researchOpportunities)
          .set({ status })
          .where(eq(researchOpportunities.id, id));
        return true;
      } catch (err) {
        console.error('Erro ao atualizar status de oportunidade no Postgres:', err);
      }
    }

    if (!fallbackState.researchOpportunities) fallbackState.researchOpportunities = [];
    const opp = fallbackState.researchOpportunities.find(o => o.id === id);
    if (opp) {
      opp.status = status;
      await this.saveState({});
      return true;
    }
    return false;
  }

  static async getResearchReports(): Promise<ResearchReport[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(researchReports);
        return results.map(r => ({
          id: r.id,
          title: r.title,
          content: r.content,
          recommendations: r.recommendations,
          timestamp: r.timestamp
        })).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      } catch (err) {
        console.error('Erro ao buscar relatorios no Postgres:', err);
      }
    }
    if (!fallbackState.researchReports) fallbackState.researchReports = [];
    return [...fallbackState.researchReports].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  static async addResearchReport(rep: Omit<ResearchReport, 'id' | 'timestamp'>): Promise<ResearchReport> {
    const newReport: ResearchReport = {
      id: 'rep_' + Math.random().toString(36).substr(2, 9),
      title: rep.title,
      content: rep.content,
      recommendations: rep.recommendations,
      timestamp: new Date().toISOString()
    };

    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(researchReports).values({
          id: newReport.id,
          title: newReport.title,
          content: newReport.content,
          recommendations: newReport.recommendations,
          timestamp: newReport.timestamp,
          createdAt: new Date()
        });
        return newReport;
      } catch (err) {
        console.error('Erro ao salvar relatorio no Postgres:', err);
      }
    }

    if (!fallbackState.researchReports) fallbackState.researchReports = [];
    fallbackState.researchReports.push(newReport);
    await this.saveState({});
    return newReport;
  }

  static async getMarketAnalyses(): Promise<MarketAnalysis[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(marketAnalyses);
        return results.map(ma => ({
          id: ma.id,
          opportunityId: ma.opportunityId || '',
          opportunityTitle: ma.opportunityTitle,
          niche: ma.niche,
          demandScore: ma.demandScore,
          urgencyScore: ma.urgencyScore,
          buyingPowerScore: ma.buyingPowerScore,
          competitionScore: ma.competitionScore,
          differentiationScore: ma.differentiationScore,
          creationEaseScore: ma.creationEaseScore,
          scalingPotentialScore: ma.scalingPotentialScore,
          profitMarginScore: ma.profitMarginScore,
          finalScore: ma.finalScore,
          targetAudience: ma.targetAudience,
          estimatedPrice: ma.estimatedPrice,
          financialViability: ma.financialViability,
          expertOpinion: ma.expertOpinion,
          recommendations: ma.recommendations,
          status: ma.status as any,
          timestamp: ma.timestamp
        })).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      } catch (err) {
        console.error('Erro ao buscar análises no Postgres:', err);
      }
    }
    if (!fallbackState.marketAnalyses) fallbackState.marketAnalyses = [];
    return [...fallbackState.marketAnalyses].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  static async addMarketAnalysis(analysis: Omit<MarketAnalysis, 'id' | 'timestamp'>): Promise<MarketAnalysis> {
    const newAnalysis: MarketAnalysis = {
      id: 'ma_' + Math.random().toString(36).substr(2, 9),
      opportunityId: analysis.opportunityId,
      opportunityTitle: analysis.opportunityTitle,
      niche: analysis.niche,
      demandScore: analysis.demandScore,
      urgencyScore: analysis.urgencyScore,
      buyingPowerScore: analysis.buyingPowerScore,
      competitionScore: analysis.competitionScore,
      differentiationScore: analysis.differentiationScore,
      creationEaseScore: analysis.creationEaseScore,
      scalingPotentialScore: analysis.scalingPotentialScore,
      profitMarginScore: analysis.profitMarginScore,
      finalScore: analysis.finalScore,
      targetAudience: analysis.targetAudience,
      estimatedPrice: analysis.estimatedPrice,
      financialViability: analysis.financialViability,
      expertOpinion: analysis.expertOpinion,
      recommendations: analysis.recommendations,
      status: analysis.status || 'pending',
      timestamp: new Date().toISOString()
    };

    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(marketAnalyses).values({
          id: newAnalysis.id,
          opportunityId: newAnalysis.opportunityId,
          opportunityTitle: newAnalysis.opportunityTitle,
          niche: newAnalysis.niche,
          demandScore: newAnalysis.demandScore,
          urgencyScore: newAnalysis.urgencyScore,
          buyingPowerScore: newAnalysis.buyingPowerScore,
          competitionScore: newAnalysis.competitionScore,
          differentiationScore: newAnalysis.differentiationScore,
          creationEaseScore: newAnalysis.creationEaseScore,
          scalingPotentialScore: newAnalysis.scalingPotentialScore,
          profitMarginScore: newAnalysis.profitMarginScore,
          finalScore: newAnalysis.finalScore,
          targetAudience: newAnalysis.targetAudience,
          estimatedPrice: newAnalysis.estimatedPrice,
          financialViability: newAnalysis.financialViability,
          expertOpinion: newAnalysis.expertOpinion,
          recommendations: newAnalysis.recommendations,
          status: newAnalysis.status,
          timestamp: newAnalysis.timestamp,
          createdAt: new Date()
        });
        return newAnalysis;
      } catch (err) {
        console.error('Erro ao salvar análise de mercado no Postgres:', err);
      }
    }

    if (!fallbackState.marketAnalyses) fallbackState.marketAnalyses = [];
    fallbackState.marketAnalyses.push(newAnalysis);
    await this.saveState({});
    return newAnalysis;
  }

  static async updateMarketAnalysisStatus(id: string, status: MarketAnalysis['status']): Promise<boolean> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.update(marketAnalyses)
          .set({ status })
          .where(eq(marketAnalyses.id, id));
        return true;
      } catch (err) {
        console.error('Erro ao atualizar status de análise de mercado no Postgres:', err);
      }
    }

    if (!fallbackState.marketAnalyses) fallbackState.marketAnalyses = [];
    const analysis = fallbackState.marketAnalyses.find(a => a.id === id);
    if (analysis) {
      analysis.status = status;
      await this.saveState({});
      return true;
    }
    return false;
  }

  static async addGeneratedContent(content: Omit<GeneratedContent, 'id' | 'timestamp'>): Promise<GeneratedContent> {
    const newContent: GeneratedContent = {
      id: 'gc_' + Math.random().toString(36).substr(2, 9),
      productId: content.productId,
      productName: content.productName,
      contentType: content.contentType,
      title: content.title,
      body: content.body,
      outline: content.outline,
      version: content.version || '1.0.0',
      status: content.status || 'draft',
      qualityScore: content.qualityScore,
      clarityScore: content.clarityScore,
      depthScore: content.depthScore,
      organizationScore: content.organizationScore,
      valueDeliveredScore: content.valueDeliveredScore,
      audienceFitScore: content.audienceFitScore,
      originalityScore: content.originalityScore,
      feedback: content.feedback,
      revisions: content.revisions || [],
      chaptersCount: content.chaptersCount || 0,
      timestamp: new Date().toISOString()
    };

    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(generatedContents).values({
          id: newContent.id,
          productId: newContent.productId,
          productName: newContent.productName,
          contentType: newContent.contentType,
          title: newContent.title,
          body: newContent.body,
          outline: newContent.outline || null,
          version: newContent.version,
          status: newContent.status,
          qualityScore: newContent.qualityScore || null,
          clarityScore: newContent.clarityScore || null,
          depthScore: newContent.depthScore || null,
          organizationScore: newContent.organizationScore || null,
          valueDeliveredScore: newContent.valueDeliveredScore || null,
          audienceFitScore: newContent.audienceFitScore || null,
          originalityScore: newContent.originalityScore || null,
          feedback: newContent.feedback || null,
          revisions: newContent.revisions,
          chaptersCount: newContent.chaptersCount,
          timestamp: newContent.timestamp,
          createdAt: new Date()
        });
        return newContent;
      } catch (err) {
        console.error('Erro ao salvar conteúdo gerado no Postgres:', err);
      }
    }

    if (!fallbackState.generatedContents) fallbackState.generatedContents = [];
    fallbackState.generatedContents.push(newContent);
    await this.saveState({});
    return newContent;
  }

  static async getGeneratedContents(): Promise<GeneratedContent[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const dbGCs = await db.select().from(generatedContents);
        return dbGCs.map(gc => ({
          id: gc.id,
          productId: gc.productId || '',
          productName: gc.productName,
          contentType: gc.contentType,
          title: gc.title,
          body: gc.body,
          outline: gc.outline || undefined,
          version: gc.version,
          status: gc.status as any,
          qualityScore: gc.qualityScore || undefined,
          clarityScore: gc.clarityScore || undefined,
          depthScore: gc.depthScore || undefined,
          organizationScore: gc.organizationScore || undefined,
          valueDeliveredScore: gc.valueDeliveredScore || undefined,
          audienceFitScore: gc.audienceFitScore || undefined,
          originalityScore: gc.originalityScore || undefined,
          feedback: gc.feedback || undefined,
          revisions: gc.revisions as any[],
          chaptersCount: gc.chaptersCount,
          timestamp: gc.timestamp
        }));
      } catch (err) {
        console.error('Erro ao listar conteúdos gerados do Postgres:', err);
      }
    }
    return fallbackState.generatedContents || [];
  }

  static async getGeneratedContentById(id: string): Promise<GeneratedContent | null> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(generatedContents).where(eq(generatedContents.id, id));
        if (results.length > 0) {
          const gc = results[0];
          return {
            id: gc.id,
            productId: gc.productId || '',
            productName: gc.productName,
            contentType: gc.contentType,
            title: gc.title,
            body: gc.body,
            outline: gc.outline || undefined,
            version: gc.version,
            status: gc.status as any,
            qualityScore: gc.qualityScore || undefined,
            clarityScore: gc.clarityScore || undefined,
            depthScore: gc.depthScore || undefined,
            organizationScore: gc.organizationScore || undefined,
            valueDeliveredScore: gc.valueDeliveredScore || undefined,
            audienceFitScore: gc.audienceFitScore || undefined,
            originalityScore: gc.originalityScore || undefined,
            feedback: gc.feedback || undefined,
            revisions: gc.revisions as any[],
            chaptersCount: gc.chaptersCount,
            timestamp: gc.timestamp
          };
        }
        return null;
      } catch (err) {
        console.error('Erro ao buscar conteúdo gerado por ID no Postgres:', err);
      }
    }
    return (fallbackState.generatedContents || []).find(gc => gc.id === id) || null;
  }

  static async updateGeneratedContent(id: string, updates: Partial<GeneratedContent>): Promise<GeneratedContent> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const updateObj: any = {};
        if (updates.productId !== undefined) updateObj.productId = updates.productId;
        if (updates.productName !== undefined) updateObj.productName = updates.productName;
        if (updates.contentType !== undefined) updateObj.contentType = updates.contentType;
        if (updates.title !== undefined) updateObj.title = updates.title;
        if (updates.body !== undefined) updateObj.body = updates.body;
        if (updates.outline !== undefined) updateObj.outline = updates.outline;
        if (updates.version !== undefined) updateObj.version = updates.version;
        if (updates.status !== undefined) updateObj.status = updates.status;
        if (updates.qualityScore !== undefined) updateObj.qualityScore = updates.qualityScore;
        if (updates.clarityScore !== undefined) updateObj.clarityScore = updates.clarityScore;
        if (updates.depthScore !== undefined) updateObj.depthScore = updates.depthScore;
        if (updates.organizationScore !== undefined) updateObj.organizationScore = updates.organizationScore;
        if (updates.valueDeliveredScore !== undefined) updateObj.valueDeliveredScore = updates.valueDeliveredScore;
        if (updates.audienceFitScore !== undefined) updateObj.audienceFitScore = updates.audienceFitScore;
        if (updates.originalityScore !== undefined) updateObj.originalityScore = updates.originalityScore;
        if (updates.feedback !== undefined) updateObj.feedback = updates.feedback;
        if (updates.revisions !== undefined) updateObj.revisions = updates.revisions;
        if (updates.chaptersCount !== undefined) updateObj.chaptersCount = updates.chaptersCount;
        
        await db.update(generatedContents).set(updateObj).where(eq(generatedContents.id, id));
        const updated = await this.getGeneratedContentById(id);
        if (updated) return updated;
      } catch (err) {
        console.error('Erro ao atualizar conteúdo gerado no Postgres:', err);
      }
    }

    if (!fallbackState.generatedContents) fallbackState.generatedContents = [];
    const index = fallbackState.generatedContents.findIndex(gc => gc.id === id);
    if (index !== -1) {
      fallbackState.generatedContents[index] = {
        ...fallbackState.generatedContents[index],
        ...updates,
        timestamp: new Date().toISOString()
      };
      await this.saveState({});
      return fallbackState.generatedContents[index];
    }
    throw new Error(`Conteúdo gerado com ID ${id} não encontrado.`);
  }

  // --- MÉTODOS PARA DESIGN PROJECTS (ETAPA 9) ---

  static async createDesignProject(project: Omit<DesignProject, 'id' | 'timestamp' | 'version' | 'status'>): Promise<DesignProject> {
    const newProject: DesignProject = {
      ...project,
      id: 'design_proj_' + Math.random().toString(36).substring(2, 11),
      version: '1.0.0',
      status: 'draft',
      timestamp: new Date().toISOString()
    };

    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(designProjects).values({
          id: newProject.id,
          productId: newProject.productId,
          productName: newProject.productName,
          contentId: newProject.contentId || null,
          title: newProject.title,
          visualIdentity: newProject.visualIdentity,
          styleChoice: newProject.styleChoice,
          imageBriefing: newProject.imageBriefing,
          coverLayout: newProject.coverLayout,
          marketingAssets: newProject.marketingAssets,
          version: newProject.version,
          status: newProject.status,
          qualityScore: newProject.qualityScore || null,
          aestheticScore: newProject.aestheticScore || null,
          clarityScore: newProject.clarityScore || null,
          audienceFitScore: newProject.audienceFitScore || null,
          commercialAppealScore: newProject.commercialAppealScore || null,
          differentiationScore: newProject.differentiationScore || null,
          feedback: newProject.feedback || null,
          generatedAssets: newProject.generatedAssets || [],
          timestamp: newProject.timestamp,
          createdAt: new Date()
        });
        return newProject;
      } catch (err) {
        console.error('Erro ao salvar projeto de design no Postgres:', err);
      }
    }

    if (!fallbackState.designProjects) fallbackState.designProjects = [];
    fallbackState.designProjects.push(newProject);
    await this.saveState({});
    return newProject;
  }

  static async getDesignProjects(): Promise<DesignProject[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const dbDPs = await db.select().from(designProjects);
        return dbDPs.map(dp => ({
          id: dp.id,
          productId: dp.productId,
          productName: dp.productName,
          contentId: dp.contentId || undefined,
          title: dp.title,
          visualIdentity: dp.visualIdentity,
          styleChoice: dp.styleChoice,
          imageBriefing: dp.imageBriefing,
          coverLayout: dp.coverLayout,
          marketingAssets: dp.marketingAssets as any[],
          version: dp.version,
          status: dp.status as any,
          qualityScore: dp.qualityScore || undefined,
          aestheticScore: dp.aestheticScore || undefined,
          clarityScore: dp.clarityScore || undefined,
          audienceFitScore: dp.audienceFitScore || undefined,
          commercialAppealScore: dp.commercialAppealScore || undefined,
          differentiationScore: dp.differentiationScore || undefined,
          feedback: dp.feedback || undefined,
          generatedAssets: dp.generatedAssets as any[] || [],
          timestamp: dp.timestamp
        }));
      } catch (err) {
        console.error('Erro ao listar projetos de design do Postgres:', err);
      }
    }
    return fallbackState.designProjects || [];
  }

  static async getDesignProjectById(id: string): Promise<DesignProject | null> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(designProjects).where(eq(designProjects.id, id));
        if (results.length > 0) {
          const dp = results[0];
          return {
            id: dp.id,
            productId: dp.productId,
            productName: dp.productName,
            contentId: dp.contentId || undefined,
            title: dp.title,
            visualIdentity: dp.visualIdentity,
            styleChoice: dp.styleChoice,
            imageBriefing: dp.imageBriefing,
            coverLayout: dp.coverLayout,
            marketingAssets: dp.marketingAssets as any[],
            version: dp.version,
            status: dp.status as any,
            qualityScore: dp.qualityScore || undefined,
            aestheticScore: dp.aestheticScore || undefined,
            clarityScore: dp.clarityScore || undefined,
            audienceFitScore: dp.audienceFitScore || undefined,
            commercialAppealScore: dp.commercialAppealScore || undefined,
            differentiationScore: dp.differentiationScore || undefined,
            feedback: dp.feedback || undefined,
            generatedAssets: dp.generatedAssets as any[] || [],
            timestamp: dp.timestamp
          };
        }
        return null;
      } catch (err) {
        console.error('Erro ao buscar projeto de design por ID no Postgres:', err);
      }
    }
    return (fallbackState.designProjects || []).find(dp => dp.id === id) || null;
  }

  static async updateDesignProject(id: string, updates: Partial<DesignProject>): Promise<DesignProject> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const updateObj: any = {};
        if (updates.productId !== undefined) updateObj.productId = updates.productId;
        if (updates.productName !== undefined) updateObj.productName = updates.productName;
        if (updates.contentId !== undefined) updateObj.contentId = updates.contentId;
        if (updates.title !== undefined) updateObj.title = updates.title;
        if (updates.visualIdentity !== undefined) updateObj.visualIdentity = updates.visualIdentity;
        if (updates.styleChoice !== undefined) updateObj.styleChoice = updates.styleChoice;
        if (updates.imageBriefing !== undefined) updateObj.imageBriefing = updates.imageBriefing;
        if (updates.coverLayout !== undefined) updateObj.coverLayout = updates.coverLayout;
        if (updates.marketingAssets !== undefined) updateObj.marketingAssets = updates.marketingAssets;
        if (updates.version !== undefined) updateObj.version = updates.version;
        if (updates.status !== undefined) updateObj.status = updates.status;
        if (updates.qualityScore !== undefined) updateObj.qualityScore = updates.qualityScore;
        if (updates.aestheticScore !== undefined) updateObj.aestheticScore = updates.aestheticScore;
        if (updates.clarityScore !== undefined) updateObj.clarityScore = updates.clarityScore;
        if (updates.audienceFitScore !== undefined) updateObj.audienceFitScore = updates.audienceFitScore;
        if (updates.commercialAppealScore !== undefined) updateObj.commercialAppealScore = updates.commercialAppealScore;
        if (updates.differentiationScore !== undefined) updateObj.differentiationScore = updates.differentiationScore;
        if (updates.feedback !== undefined) updateObj.feedback = updates.feedback;
        if (updates.generatedAssets !== undefined) updateObj.generatedAssets = updates.generatedAssets;

        await db.update(designProjects).set(updateObj).where(eq(designProjects.id, id));
        const updated = await this.getDesignProjectById(id);
        if (updated) return updated;
      } catch (err) {
        console.error('Erro ao atualizar projeto de design no Postgres:', err);
      }
    }

    if (!fallbackState.designProjects) fallbackState.designProjects = [];
    const index = fallbackState.designProjects.findIndex(dp => dp.id === id);
    if (index !== -1) {
      fallbackState.designProjects[index] = {
        ...fallbackState.designProjects[index],
        ...updates,
        timestamp: new Date().toISOString()
      };
      await this.saveState({});
      return fallbackState.designProjects[index];
    }
    throw new Error(`Projeto de design com ID ${id} não encontrado.`);
  }

  // --- MÉTODOS PARA MARKETING CAMPAIGNS (ETAPA 10) ---

  static async createMarketingCampaign(campaign: Omit<MarketingCampaign, 'id' | 'timestamp' | 'version' | 'status'>): Promise<MarketingCampaign> {
    const newCampaign: MarketingCampaign = {
      ...campaign,
      id: 'mkt_camp_' + Math.random().toString(36).substring(2, 11),
      version: '1.0.0',
      status: 'draft',
      timestamp: new Date().toISOString()
    };

    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(marketingCampaigns).values({
          id: newCampaign.id,
          productId: newCampaign.productId,
          productName: newCampaign.productName,
          title: newCampaign.title,
          persona: newCampaign.persona,
          positioning: newCampaign.positioning,
          copywriting: newCampaign.copywriting,
          salesPage: newCampaign.salesPage,
          socialMedia: newCampaign.socialMedia,
          campaignAds: newCampaign.campaignAds,
          version: newCampaign.version,
          status: newCampaign.status,
          qualityScore: newCampaign.qualityScore || null,
          offerClarityScore: newCampaign.offerClarityScore || null,
          conversionPowerScore: newCampaign.conversionPowerScore || null,
          audienceFitScore: newCampaign.audienceFitScore || null,
          differentiationScore: newCampaign.differentiationScore || null,
          scalePotentialScore: newCampaign.scalePotentialScore || null,
          feedback: newCampaign.feedback || null,
          timestamp: newCampaign.timestamp,
          createdAt: new Date()
        });
        return newCampaign;
      } catch (err) {
        console.error('Erro ao salvar campanha de marketing no Postgres:', err);
      }
    }

    if (!fallbackState.marketingCampaigns) fallbackState.marketingCampaigns = [];
    fallbackState.marketingCampaigns.push(newCampaign);
    await this.saveState({ marketingCampaigns: fallbackState.marketingCampaigns });
    return newCampaign;
  }

  static async getMarketingCampaigns(): Promise<MarketingCampaign[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const dbCamps = await db.select().from(marketingCampaigns);
        return dbCamps.map(mc => ({
          id: mc.id,
          productId: mc.productId,
          productName: mc.productName,
          title: mc.title,
          persona: mc.persona as any,
          positioning: mc.positioning,
          copywriting: mc.copywriting as any,
          salesPage: mc.salesPage as any,
          socialMedia: mc.socialMedia as any,
          campaignAds: mc.campaignAds as any,
          version: mc.version,
          status: mc.status as any,
          qualityScore: mc.qualityScore || undefined,
          offerClarityScore: mc.offerClarityScore || undefined,
          conversionPowerScore: mc.conversionPowerScore || undefined,
          audienceFitScore: mc.audienceFitScore || undefined,
          differentiationScore: mc.differentiationScore || undefined,
          scalePotentialScore: mc.scalePotentialScore || undefined,
          feedback: mc.feedback || undefined,
          timestamp: mc.timestamp
        }));
      } catch (err) {
        console.error('Erro ao listar campanhas de marketing do Postgres:', err);
      }
    }
    return fallbackState.marketingCampaigns || [];
  }

  static async getMarketingCampaignById(id: string): Promise<MarketingCampaign | null> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(marketingCampaigns).where(eq(marketingCampaigns.id, id));
        if (results.length > 0) {
          const mc = results[0];
          return {
            id: mc.id,
            productId: mc.productId,
            productName: mc.productName,
            title: mc.title,
            persona: mc.persona as any,
            positioning: mc.positioning,
            copywriting: mc.copywriting as any,
            salesPage: mc.salesPage as any,
            socialMedia: mc.socialMedia as any,
            campaignAds: mc.campaignAds as any,
            version: mc.version,
            status: mc.status as any,
            qualityScore: mc.qualityScore || undefined,
            offerClarityScore: mc.offerClarityScore || undefined,
            conversionPowerScore: mc.conversionPowerScore || undefined,
            audienceFitScore: mc.audienceFitScore || undefined,
            differentiationScore: mc.differentiationScore || undefined,
            scalePotentialScore: mc.scalePotentialScore || undefined,
            feedback: mc.feedback || undefined,
            timestamp: mc.timestamp
          };
        }
        return null;
      } catch (err) {
        console.error('Erro ao buscar campanha de marketing por ID no Postgres:', err);
      }
    }
    return (fallbackState.marketingCampaigns || []).find(mc => mc.id === id) || null;
  }

  static async updateMarketingCampaign(id: string, updates: Partial<MarketingCampaign>): Promise<MarketingCampaign> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const updateObj: any = {};
        if (updates.productId !== undefined) updateObj.productId = updates.productId;
        if (updates.productName !== undefined) updateObj.productName = updates.productName;
        if (updates.title !== undefined) updateObj.title = updates.title;
        if (updates.persona !== undefined) updateObj.persona = updates.persona;
        if (updates.positioning !== undefined) updateObj.positioning = updates.positioning;
        if (updates.copywriting !== undefined) updateObj.copywriting = updates.copywriting;
        if (updates.salesPage !== undefined) updateObj.salesPage = updates.salesPage;
        if (updates.socialMedia !== undefined) updateObj.socialMedia = updates.socialMedia;
        if (updates.campaignAds !== undefined) updateObj.campaignAds = updates.campaignAds;
        if (updates.version !== undefined) updateObj.version = updates.version;
        if (updates.status !== undefined) updateObj.status = updates.status;
        if (updates.qualityScore !== undefined) updateObj.qualityScore = updates.qualityScore;
        if (updates.offerClarityScore !== undefined) updateObj.offerClarityScore = updates.offerClarityScore;
        if (updates.conversionPowerScore !== undefined) updateObj.conversionPowerScore = updates.conversionPowerScore;
        if (updates.audienceFitScore !== undefined) updateObj.audienceFitScore = updates.audienceFitScore;
        if (updates.differentiationScore !== undefined) updateObj.differentiationScore = updates.differentiationScore;
        if (updates.scalePotentialScore !== undefined) updateObj.scalePotentialScore = updates.scalePotentialScore;
        if (updates.feedback !== undefined) updateObj.feedback = updates.feedback;

        await db.update(marketingCampaigns).set(updateObj).where(eq(marketingCampaigns.id, id));
        const updated = await this.getMarketingCampaignById(id);
        if (updated) return updated;
      } catch (err) {
        console.error('Erro ao atualizar campanha de marketing no Postgres:', err);
      }
    }

    if (!fallbackState.marketingCampaigns) fallbackState.marketingCampaigns = [];
    const index = fallbackState.marketingCampaigns.findIndex(mc => mc.id === id);
    if (index !== -1) {
      fallbackState.marketingCampaigns[index] = {
        ...fallbackState.marketingCampaigns[index],
        ...updates,
        timestamp: new Date().toISOString()
      };
      await this.saveState({ marketingCampaigns: fallbackState.marketingCampaigns });
      return fallbackState.marketingCampaigns[index];
    }
    throw new Error(`Campanha de marketing com ID ${id} não encontrado.`);
  }

  // Métodos de Publicação (Publisher Agent - Etapa 11)
  static async createPublication(publication: Publication): Promise<Publication> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(publications).values({
          id: publication.id,
          productId: publication.productId,
          productName: publication.productName,
          description: publication.description,
          category: publication.category,
          price: publication.price,
          images: publication.images,
          files: publication.files,
          salesPageUrl: publication.salesPageUrl,
          termsAndConditions: publication.termsAndConditions,
          status: publication.status,
          version: publication.version,
          platforms: publication.platforms,
          checklist: publication.checklist,
          history: publication.history,
          timestamp: publication.timestamp,
          createdAt: new Date()
        });
        return publication;
      } catch (err) {
        console.error('Erro ao salvar publicação no Postgres:', err);
      }
    }

    if (!fallbackState.publications) fallbackState.publications = [];
    fallbackState.publications.push(publication);
    await this.saveState({ publications: fallbackState.publications });
    return publication;
  }

  static async getPublications(): Promise<Publication[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const dbPubs = await db.select().from(publications);
        return dbPubs.map(pub => ({
          id: pub.id,
          productId: pub.productId,
          productName: pub.productName,
          description: pub.description,
          category: pub.category,
          price: pub.price,
          images: pub.images as string[],
          files: pub.files as string[],
          salesPageUrl: pub.salesPageUrl,
          termsAndConditions: pub.termsAndConditions,
          status: pub.status as any,
          version: pub.version,
          platforms: pub.platforms as any,
          checklist: pub.checklist as any,
          history: pub.history as any[],
          timestamp: pub.timestamp
        }));
      } catch (err) {
        console.error('Erro ao listar publicações do Postgres:', err);
      }
    }
    return fallbackState.publications || [];
  }

  static async getPublicationById(id: string): Promise<Publication | null> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(publications).where(eq(publications.id, id));
        if (results.length > 0) {
          const pub = results[0];
          return {
            id: pub.id,
            productId: pub.productId,
            productName: pub.productName,
            description: pub.description,
            category: pub.category,
            price: pub.price,
            images: pub.images as string[],
            files: pub.files as string[],
            salesPageUrl: pub.salesPageUrl,
            termsAndConditions: pub.termsAndConditions,
            status: pub.status as any,
            version: pub.version,
            platforms: pub.platforms as any,
            checklist: pub.checklist as any,
            history: pub.history as any[],
            timestamp: pub.timestamp
          };
        }
        return null;
      } catch (err) {
        console.error('Erro ao buscar publicação por ID no Postgres:', err);
      }
    }
    return (fallbackState.publications || []).find(pub => pub.id === id) || null;
  }

  static async updatePublication(id: string, updates: Partial<Publication>): Promise<Publication> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const updateObj: any = {};
        if (updates.productId !== undefined) updateObj.productId = updates.productId;
        if (updates.productName !== undefined) updateObj.productName = updates.productName;
        if (updates.description !== undefined) updateObj.description = updates.description;
        if (updates.category !== undefined) updateObj.category = updates.category;
        if (updates.price !== undefined) updateObj.price = updates.price;
        if (updates.images !== undefined) updateObj.images = updates.images;
        if (updates.files !== undefined) updateObj.files = updates.files;
        if (updates.salesPageUrl !== undefined) updateObj.salesPageUrl = updates.salesPageUrl;
        if (updates.termsAndConditions !== undefined) updateObj.termsAndConditions = updates.termsAndConditions;
        if (updates.status !== undefined) updateObj.status = updates.status;
        if (updates.version !== undefined) updateObj.version = updates.version;
        if (updates.platforms !== undefined) updateObj.platforms = updates.platforms;
        if (updates.checklist !== undefined) updateObj.checklist = updates.checklist;
        if (updates.history !== undefined) updateObj.history = updates.history;

        await db.update(publications).set(updateObj).where(eq(publications.id, id));
        const updated = await this.getPublicationById(id);
        if (updated) return updated;
      } catch (err) {
        console.error('Erro ao atualizar publicação no Postgres:', err);
      }
    }

    if (!fallbackState.publications) fallbackState.publications = [];
    const index = fallbackState.publications.findIndex(pub => pub.id === id);
    if (index !== -1) {
      fallbackState.publications[index] = {
        ...fallbackState.publications[index],
        ...updates,
        timestamp: new Date().toISOString()
      };
      await this.saveState({ publications: fallbackState.publications });
      return fallbackState.publications[index];
    }
    throw new Error(`Publicação com ID ${id} não encontrada.`);
  }

  // === METODOS FINANCEIROS (ETAPA 12) ===

  // 1. Transactions
  static async createFinancialTransaction(tx: FinancialTransaction): Promise<FinancialTransaction> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(financialTransactions).values({
          id: tx.id,
          type: tx.type,
          amount: tx.amount,
          description: tx.description,
          category: tx.category,
          date: tx.date,
          productId: tx.productId || null,
          campaignId: tx.campaignId || null,
          timestamp: tx.timestamp,
          createdAt: new Date()
        });
        return tx;
      } catch (err) {
        console.error('Erro ao salvar transação no Postgres:', err);
      }
    }
    if (!fallbackState.financialTransactions) fallbackState.financialTransactions = [];
    fallbackState.financialTransactions.push(tx);
    await this.saveState({ financialTransactions: fallbackState.financialTransactions });
    return tx;
  }

  static async getFinancialTransactions(): Promise<FinancialTransaction[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(financialTransactions);
        return results.map(r => ({
          id: r.id,
          type: r.type as 'revenue' | 'expense',
          amount: r.amount,
          description: r.description,
          category: r.category,
          date: r.date,
          productId: r.productId || undefined,
          campaignId: r.campaignId || undefined,
          timestamp: r.timestamp
        }));
      } catch (err) {
        console.error('Erro ao buscar transações no Postgres:', err);
      }
    }
    return fallbackState.financialTransactions || [];
  }

  // 2. Revenues
  static async createRevenue(rev: Revenue): Promise<Revenue> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(revenues).values({
          id: rev.id,
          productId: rev.productId || null,
          amount: rev.amount,
          paymentMethod: rev.paymentMethod,
          status: rev.status,
          customerEmail: rev.customerEmail,
          date: rev.date,
          timestamp: rev.timestamp,
          createdAt: new Date()
        });
        return rev;
      } catch (err) {
        console.error('Erro ao salvar receita no Postgres:', err);
      }
    }
    if (!fallbackState.revenues) fallbackState.revenues = [];
    fallbackState.revenues.push(rev);
    await this.saveState({ revenues: fallbackState.revenues });
    return rev;
  }

  static async getRevenues(): Promise<Revenue[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(revenues);
        return results.map(r => ({
          id: r.id,
          productId: r.productId || undefined,
          amount: r.amount,
          paymentMethod: r.paymentMethod as any,
          status: r.status as any,
          customerEmail: r.customerEmail,
          date: r.date,
          timestamp: r.timestamp
        }));
      } catch (err) {
        console.error('Erro ao buscar receitas no Postgres:', err);
      }
    }
    return fallbackState.revenues || [];
  }

  // 3. Expenses
  static async createExpense(exp: Expense): Promise<Expense> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(expenses).values({
          id: exp.id,
          amount: exp.amount,
          category: exp.category,
          description: exp.description,
          date: exp.date,
          status: exp.status,
          timestamp: exp.timestamp,
          createdAt: new Date()
        });
        return exp;
      } catch (err) {
        console.error('Erro ao salvar despesa no Postgres:', err);
      }
    }
    if (!fallbackState.expenses) fallbackState.expenses = [];
    fallbackState.expenses.push(exp);
    await this.saveState({ expenses: fallbackState.expenses });
    return exp;
  }

  static async getExpenses(): Promise<Expense[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(expenses);
        return results.map(r => ({
          id: r.id,
          amount: r.amount,
          category: r.category as any,
          description: r.description,
          date: r.date,
          status: r.status as any,
          timestamp: r.timestamp
        }));
      } catch (err) {
        console.error('Erro ao buscar despesas no Postgres:', err);
      }
    }
    return fallbackState.expenses || [];
  }

  // 4. CashFlow
  static async createCashFlow(cf: CashFlow): Promise<CashFlow> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(cashflow).values({
          id: cf.id,
          date: cf.date,
          inflow: cf.inflow,
          outflow: cf.outflow,
          balance: cf.balance,
          timestamp: cf.timestamp,
          createdAt: new Date()
        });
        return cf;
      } catch (err) {
        console.error('Erro ao salvar fluxo de caixa no Postgres:', err);
      }
    }
    if (!fallbackState.cashflow) fallbackState.cashflow = [];
    fallbackState.cashflow.push(cf);
    await this.saveState({ cashflow: fallbackState.cashflow });
    return cf;
  }

  static async getCashFlow(): Promise<CashFlow[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(cashflow);
        return results.map(r => ({
          id: r.id,
          date: r.date,
          inflow: r.inflow,
          outflow: r.outflow,
          balance: r.balance,
          timestamp: r.timestamp
        }));
      } catch (err) {
        console.error('Erro ao buscar fluxo de caixa no Postgres:', err);
      }
    }
    return fallbackState.cashflow || [];
  }

  // 5. FinancialReports
  static async createFinancialReport(rep: FinancialReport): Promise<FinancialReport> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(financialReports).values({
          id: rep.id,
          title: rep.title,
          period: rep.period,
          totalRevenue: rep.totalRevenue,
          totalExpense: rep.totalExpense,
          netProfit: rep.netProfit,
          margin: rep.margin,
          insights: rep.insights,
          timestamp: rep.timestamp,
          createdAt: new Date()
        });
        return rep;
      } catch (err) {
        console.error('Erro ao salvar relatório financeiro no Postgres:', err);
      }
    }
    if (!fallbackState.financialReports) fallbackState.financialReports = [];
    fallbackState.financialReports.push(rep);
    await this.saveState({ financialReports: fallbackState.financialReports });
    return rep;
  }

  static async getFinancialReports(): Promise<FinancialReport[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(financialReports);
        return results.map(r => ({
          id: r.id,
          title: r.title,
          period: r.period as any,
          totalRevenue: r.totalRevenue,
          totalExpense: r.totalExpense,
          netProfit: r.netProfit,
          margin: r.margin,
          insights: r.insights,
          timestamp: r.timestamp
        }));
      } catch (err) {
        console.error('Erro ao buscar relatórios financeiros no Postgres:', err);
      }
    }
    return fallbackState.financialReports || [];
  }

  // 6. FinancialForecasts
  static async createFinancialForecast(fc: FinancialForecast): Promise<FinancialForecast> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(financialForecasts).values({
          id: fc.id,
          title: fc.title,
          period: fc.period,
          predictedRevenue: fc.predictedRevenue,
          confidence: fc.confidence,
          insights: fc.insights,
          suggestions: fc.suggestions,
          timestamp: fc.timestamp,
          createdAt: new Date()
        });
        return fc;
      } catch (err) {
        console.error('Erro ao salvar previsão financeira no Postgres:', err);
      }
    }
    if (!fallbackState.financialForecasts) fallbackState.financialForecasts = [];
    fallbackState.financialForecasts.push(fc);
    await this.saveState({ financialForecasts: fallbackState.financialForecasts });
    return fc;
  }

  static async getFinancialForecasts(): Promise<FinancialForecast[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(financialForecasts);
        return results.map(r => ({
          id: r.id,
          title: r.title,
          period: r.period as any,
          predictedRevenue: r.predictedRevenue,
          confidence: r.confidence,
          insights: r.insights,
          suggestions: r.suggestions,
          timestamp: r.timestamp
        }));
      } catch (err) {
        console.error('Erro ao buscar previsões financeiras no Postgres:', err);
      }
    }
    return fallbackState.financialForecasts || [];
  }

  // 7. ProfitAnalysis
  static async createProfitAnalysis(pa: ProfitAnalysis): Promise<ProfitAnalysis> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(profitAnalysis).values({
          id: pa.id,
          productId: pa.productId,
          productName: pa.productName,
          revenue: pa.revenue,
          cost: pa.cost,
          netProfit: pa.netProfit,
          margin: pa.margin,
          timestamp: pa.timestamp,
          createdAt: new Date()
        });
        return pa;
      } catch (err) {
        console.error('Erro ao salvar análise de lucro no Postgres:', err);
      }
    }
    if (!fallbackState.profitAnalysis) fallbackState.profitAnalysis = [];
    fallbackState.profitAnalysis.push(pa);
    await this.saveState({ profitAnalysis: fallbackState.profitAnalysis });
    return pa;
  }

  static async getProfitAnalysis(): Promise<ProfitAnalysis[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(profitAnalysis);
        return results.map(r => ({
          id: r.id,
          productId: r.productId,
          productName: r.productName,
          revenue: r.revenue,
          cost: r.cost,
          netProfit: r.netProfit,
          margin: r.margin,
          timestamp: r.timestamp
        }));
      } catch (err) {
        console.error('Erro ao buscar análises de lucro no Postgres:', err);
      }
    }
    return fallbackState.profitAnalysis || [];
  }

  // 8. RoiHistory
  static async createRoiHistory(roi: RoiHistory): Promise<RoiHistory> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(roiHistory).values({
          id: roi.id,
          campaignId: roi.campaignId,
          campaignName: roi.campaignName,
          investment: roi.investment,
          revenue: roi.revenue,
          roi: roi.roi,
          timestamp: roi.timestamp,
          createdAt: new Date()
        });
        return roi;
      } catch (err) {
        console.error('Erro ao salvar histórico de ROI no Postgres:', err);
      }
    }
    if (!fallbackState.roiHistory) fallbackState.roiHistory = [];
    fallbackState.roiHistory.push(roi);
    await this.saveState({ roiHistory: fallbackState.roiHistory });
    return roi;
  }

  static async getRoiHistory(): Promise<RoiHistory[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(roiHistory);
        return results.map(r => ({
          id: r.id,
          campaignId: r.campaignId,
          campaignName: r.campaignName,
          investment: r.investment,
          revenue: r.revenue,
          roi: r.roi,
          timestamp: r.timestamp
        }));
      } catch (err) {
        console.error('Erro ao buscar histórico de ROI no Postgres:', err);
      }
    }
    return fallbackState.roiHistory || [];
  }

  // 9. CampaignResults
  static async createCampaignResult(cr: CampaignResult): Promise<CampaignResult> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(campaignResults).values({
          id: cr.id,
          campaignId: cr.campaignId,
          campaignName: cr.campaignName,
          leads: cr.leads,
          sales: cr.sales,
          conversionRate: cr.conversionRate,
          revenue: cr.revenue,
          spend: cr.spend,
          roi: cr.roi,
          timestamp: cr.timestamp,
          createdAt: new Date()
        });
        return cr;
      } catch (err) {
        console.error('Erro ao salvar resultados de campanha no Postgres:', err);
      }
    }
    if (!fallbackState.campaignResults) fallbackState.campaignResults = [];
    fallbackState.campaignResults.push(cr);
    await this.saveState({ campaignResults: fallbackState.campaignResults });
    return cr;
  }

  static async getCampaignResults(): Promise<CampaignResult[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(campaignResults);
        return results.map(r => ({
          id: r.id,
          campaignId: r.campaignId,
          campaignName: r.campaignName,
          leads: r.leads,
          sales: r.sales,
          conversionRate: r.conversionRate,
          revenue: r.revenue,
          spend: r.spend,
          roi: r.roi,
          timestamp: r.timestamp
        }));
      } catch (err) {
        console.error('Erro ao buscar resultados de campanha no Postgres:', err);
      }
    }
    return fallbackState.campaignResults || [];
  }

  // 10. CustomerMetrics
  static async createCustomerMetrics(cm: CustomerMetrics): Promise<CustomerMetrics> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(customerMetrics).values({
          id: cm.id,
          cac: cm.cac,
          ltv: cm.ltv,
          averageTicket: cm.averageTicket,
          conversionRate: cm.conversionRate,
          activeCustomers: cm.activeCustomers,
          timestamp: cm.timestamp,
          createdAt: new Date()
        });
        return cm;
      } catch (err) {
        console.error('Erro ao salvar métricas de cliente no Postgres:', err);
      }
    }
    if (!fallbackState.customerMetrics) fallbackState.customerMetrics = [];
    fallbackState.customerMetrics.push(cm);
    await this.saveState({ customerMetrics: fallbackState.customerMetrics });
    return cm;
  }

  static async getCustomerMetrics(): Promise<CustomerMetrics[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(customerMetrics);
        return results.map(r => ({
          id: r.id,
          cac: r.cac,
          ltv: r.ltv,
          averageTicket: r.averageTicket,
          conversionRate: r.conversionRate,
          activeCustomers: r.activeCustomers,
          timestamp: r.timestamp
        }));
      } catch (err) {
        console.error('Erro ao buscar métricas de cliente no Postgres:', err);
      }
    }
    return fallbackState.customerMetrics || [];
  }

  // ==========================================
  // === MÉTODOS DO SUPERVISOR AGENT (COO) ===
  // ==========================================

  static async saveAgentHealth(ah: AgentHealth): Promise<AgentHealth> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const existing = await db.select().from(agentHealth).where(eq(agentHealth.id, ah.id));
        if (existing.length > 0) {
          await db.update(agentHealth).set({
            status: ah.status,
            lastHeartbeat: ah.lastHeartbeat,
            uptime: ah.uptime,
            downtime: ah.downtime,
            currentWorkflowId: ah.currentWorkflowId,
            timestamp: ah.timestamp
          }).where(eq(agentHealth.id, ah.id));
        } else {
          await db.insert(agentHealth).values({
            id: ah.id,
            status: ah.status,
            lastHeartbeat: ah.lastHeartbeat,
            uptime: ah.uptime,
            downtime: ah.downtime,
            currentWorkflowId: ah.currentWorkflowId,
            timestamp: ah.timestamp,
            createdAt: new Date()
          });
        }
        return ah;
      } catch (err) {
        console.error('Erro ao salvar saúde de agente no Postgres:', err);
      }
    }
    if (!fallbackState.agentHealths) fallbackState.agentHealths = [];
    fallbackState.agentHealths = fallbackState.agentHealths.filter((h: any) => h.id !== ah.id);
    fallbackState.agentHealths.push(ah);
    await this.saveState({ agentHealths: fallbackState.agentHealths });
    return ah;
  }

  static async getAgentHealthList(): Promise<AgentHealth[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(agentHealth);
        return results.map(r => ({
          id: r.id,
          status: r.status as any,
          lastHeartbeat: r.lastHeartbeat,
          uptime: r.uptime,
          downtime: r.downtime,
          currentWorkflowId: r.currentWorkflowId || undefined,
          timestamp: r.timestamp
        }));
      } catch (err) {
        console.error('Erro ao buscar saúde dos agentes no Postgres:', err);
      }
    }
    return fallbackState.agentHealths || [];
  }

  static async saveAgentMetrics(am: AgentMetrics): Promise<AgentMetrics> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const existing = await db.select().from(agentMetrics).where(eq(agentMetrics.id, am.id));
        if (existing.length > 0) {
          await db.update(agentMetrics).set({
            logicalCpu: am.logicalCpu,
            logicalMemory: am.logicalMemory,
            tasksExecuted: am.tasksExecuted,
            tasksFailed: am.tasksFailed,
            averageExecutionTime: am.averageExecutionTime,
            taskQueueCount: am.taskQueueCount,
            timestamp: am.timestamp
          }).where(eq(agentMetrics.id, am.id));
        } else {
          await db.insert(agentMetrics).values({
            id: am.id,
            agentId: am.agentId,
            logicalCpu: am.logicalCpu,
            logicalMemory: am.logicalMemory,
            tasksExecuted: am.tasksExecuted,
            tasksFailed: am.tasksFailed,
            averageExecutionTime: am.averageExecutionTime,
            taskQueueCount: am.taskQueueCount,
            timestamp: am.timestamp,
            createdAt: new Date()
          });
        }
        return am;
      } catch (err) {
        console.error('Erro ao salvar métricas de agente no Postgres:', err);
      }
    }
    if (!fallbackState.agentMetricsList) fallbackState.agentMetricsList = [];
    fallbackState.agentMetricsList = fallbackState.agentMetricsList.filter((m: any) => m.id !== am.id);
    fallbackState.agentMetricsList.push(am);
    await this.saveState({ agentMetricsList: fallbackState.agentMetricsList });
    return am;
  }

  static async getAgentMetricsList(): Promise<AgentMetrics[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(agentMetrics);
        return results.map(r => ({
          id: r.id,
          agentId: r.agentId,
          logicalCpu: r.logicalCpu,
          logicalMemory: r.logicalMemory,
          tasksExecuted: r.tasksExecuted,
          tasksFailed: r.tasksFailed,
          averageExecutionTime: r.averageExecutionTime,
          taskQueueCount: r.taskQueueCount,
          timestamp: r.timestamp
        }));
      } catch (err) {
        console.error('Erro ao buscar métricas de agentes no Postgres:', err);
      }
    }
    return fallbackState.agentMetricsList || [];
  }

  static async saveAgentHeartbeat(hb: AgentHeartbeatRecord): Promise<AgentHeartbeatRecord> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(agentHeartbeats).values({
          id: hb.id,
          agentId: hb.agentId,
          status: hb.status,
          currentTask: hb.currentTask,
          cpuUsage: hb.cpuUsage,
          memoryUsage: hb.memoryUsage,
          timestamp: hb.timestamp,
          createdAt: new Date()
        });
        return hb;
      } catch (err) {
        console.error('Erro ao salvar heartbeat de agente no Postgres:', err);
      }
    }
    if (!fallbackState.agentHeartbeatsList) fallbackState.agentHeartbeatsList = [];
    fallbackState.agentHeartbeatsList.push(hb);
    if (fallbackState.agentHeartbeatsList.length > 200) {
      fallbackState.agentHeartbeatsList.shift();
    }
    await this.saveState({ agentHeartbeatsList: fallbackState.agentHeartbeatsList });
    return hb;
  }

  static async getAgentHeartbeats(): Promise<AgentHeartbeatRecord[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(agentHeartbeats);
        return results.map(r => ({
          id: r.id,
          agentId: r.agentId,
          status: r.status,
          currentTask: r.currentTask || undefined,
          cpuUsage: r.cpuUsage,
          memoryUsage: r.memoryUsage,
          timestamp: r.timestamp
        }));
      } catch (err) {
        console.error('Erro ao buscar heartbeats de agentes no Postgres:', err);
      }
    }
    return fallbackState.agentHeartbeatsList || [];
  }

  static async saveWorkflowHistory(wf: WorkflowHistoryRecord): Promise<WorkflowHistoryRecord> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const existing = await db.select().from(workflowHistory).where(eq(workflowHistory.id, wf.id));
        if (existing.length > 0) {
          await db.update(workflowHistory).set({
            status: wf.status,
            currentStep: wf.currentStep,
            stepsJson: wf.stepsJson,
            timestamp: wf.timestamp
          }).where(eq(workflowHistory.id, wf.id));
        } else {
          await db.insert(workflowHistory).values({
            id: wf.id,
            name: wf.name,
            status: wf.status,
            currentStep: wf.currentStep,
            stepsJson: wf.stepsJson,
            timestamp: wf.timestamp,
            createdAt: new Date()
          });
        }
        return wf;
      } catch (err) {
        console.error('Erro ao salvar histórico de workflow no Postgres:', err);
      }
    }
    if (!fallbackState.workflowHistoryList) fallbackState.workflowHistoryList = [];
    fallbackState.workflowHistoryList = fallbackState.workflowHistoryList.filter((w: any) => w.id !== wf.id);
    fallbackState.workflowHistoryList.push(wf);
    await this.saveState({ workflowHistoryList: fallbackState.workflowHistoryList });
    return wf;
  }

  static async getWorkflowHistory(): Promise<WorkflowHistoryRecord[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(workflowHistory);
        return results.map(r => ({
          id: r.id,
          name: r.name,
          status: r.status,
          currentStep: r.currentStep,
          stepsJson: r.stepsJson as any[],
          timestamp: r.timestamp
        }));
      } catch (err) {
        console.error('Erro ao buscar histórico de workflows no Postgres:', err);
      }
    }
    return fallbackState.workflowHistoryList || [];
  }

  static async saveSystemAlert(alert: SystemAlert): Promise<SystemAlert> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const existing = await db.select().from(systemAlerts).where(eq(systemAlerts.id, alert.id));
        if (existing.length > 0) {
          await db.update(systemAlerts).set({
            repaired: alert.repaired,
            timestamp: alert.timestamp
          }).where(eq(systemAlerts.id, alert.id));
        } else {
          await db.insert(systemAlerts).values({
            id: alert.id,
            severity: alert.severity,
            reason: alert.reason,
            origin: alert.origin,
            agentId: alert.agentId,
            timestamp: alert.timestamp,
            actionSuggested: alert.actionSuggested,
            repaired: alert.repaired,
            createdAt: new Date()
          });
        }
        return alert;
      } catch (err) {
        console.error('Erro ao salvar alerta de sistema no Postgres:', err);
      }
    }
    if (!fallbackState.systemAlertsList) fallbackState.systemAlertsList = [];
    fallbackState.systemAlertsList = fallbackState.systemAlertsList.filter((a: any) => a.id !== alert.id);
    fallbackState.systemAlertsList.push(alert);
    await this.saveState({ systemAlertsList: fallbackState.systemAlertsList });
    return alert;
  }

  static async getSystemAlerts(): Promise<SystemAlert[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(systemAlerts);
        return results.map(r => ({
          id: r.id,
          severity: r.severity as any,
          reason: r.reason,
          origin: r.origin,
          agentId: r.agentId || undefined,
          timestamp: r.timestamp,
          actionSuggested: r.actionSuggested,
          repaired: r.repaired
        }));
      } catch (err) {
        console.error('Erro ao buscar alertas de sistema no Postgres:', err);
      }
    }
    return fallbackState.systemAlertsList || [];
  }

  static async saveOperationLog(log: OperationLog): Promise<OperationLog> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(operationLogs).values({
          id: log.id,
          action: log.action,
          agentId: log.agentId,
          details: log.details,
          user: log.user,
          timestamp: log.timestamp,
          createdAt: new Date()
        });
        return log;
      } catch (err) {
        console.error('Erro ao salvar log de operação no Postgres:', err);
      }
    }
    if (!fallbackState.operationLogsList) fallbackState.operationLogsList = [];
    fallbackState.operationLogsList.push(log);
    if (fallbackState.operationLogsList.length > 200) {
      fallbackState.operationLogsList.shift();
    }
    await this.saveState({ operationLogsList: fallbackState.operationLogsList });
    return log;
  }

  static async getOperationLogs(): Promise<OperationLog[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(operationLogs);
        return results.map(r => ({
          id: r.id,
          action: r.action,
          agentId: r.agentId || undefined,
          details: r.details,
          user: r.user,
          timestamp: r.timestamp
        }));
      } catch (err) {
        console.error('Erro ao buscar logs de operações no Postgres:', err);
      }
    }
    return fallbackState.operationLogsList || [];
  }

  static async saveSystemMetrics(sm: SystemHealthMetrics): Promise<SystemHealthMetrics> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(systemMetrics).values({
          id: sm.id,
          cpuUsage: sm.cpuUsage,
          memoryUsage: sm.memoryUsage,
          postgresStatus: sm.postgresStatus,
          geminiApiStatus: sm.geminiApiStatus,
          serverStatus: sm.serverStatus,
          restApiStatus: sm.restApiStatus,
          dashboardStatus: sm.dashboardStatus,
          timestamp: sm.timestamp,
          createdAt: new Date()
        });
        return sm;
      } catch (err) {
        console.error('Erro ao salvar métricas de sistema no Postgres:', err);
      }
    }
    if (!fallbackState.systemMetricsList) fallbackState.systemMetricsList = [];
    fallbackState.systemMetricsList.push(sm);
    if (fallbackState.systemMetricsList.length > 100) {
      fallbackState.systemMetricsList.shift();
    }
    await this.saveState({ systemMetricsList: fallbackState.systemMetricsList });
    return sm;
  }

  static async getSystemMetrics(): Promise<SystemHealthMetrics[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(systemMetrics);
        return results.map(r => ({
          id: r.id,
          cpuUsage: r.cpuUsage,
          memoryUsage: r.memoryUsage,
          postgresStatus: r.postgresStatus,
          geminiApiStatus: r.geminiApiStatus,
          serverStatus: r.serverStatus,
          restApiStatus: r.restApiStatus,
          dashboardStatus: r.dashboardStatus,
          timestamp: r.timestamp
        }));
      } catch (err) {
        console.error('Erro ao buscar métricas de sistema no Postgres:', err);
      }
    }
    return fallbackState.systemMetricsList || [];
  }

  static async savePerformanceHistory(ph: PerformanceHistoryRecord): Promise<PerformanceHistoryRecord> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(performanceHistory).values({
          id: ph.id,
          label: ph.label,
          overallEfficiency: ph.overallEfficiency,
          totalActiveAgents: ph.totalActiveAgents,
          totalTasksPending: ph.totalTasksPending,
          totalTasksCompleted: ph.totalTasksCompleted,
          totalTasksFailed: ph.totalTasksFailed,
          timestamp: ph.timestamp,
          createdAt: new Date()
        });
        return ph;
      } catch (err) {
        console.error('Erro ao salvar histórico de performance no Postgres:', err);
      }
    }
    if (!fallbackState.performanceHistoryList) fallbackState.performanceHistoryList = [];
    fallbackState.performanceHistoryList.push(ph);
    if (fallbackState.performanceHistoryList.length > 100) {
      fallbackState.performanceHistoryList.shift();
    }
    await this.saveState({ performanceHistoryList: fallbackState.performanceHistoryList });
    return ph;
  }

  static async getPerformanceHistory(): Promise<PerformanceHistoryRecord[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(performanceHistory);
        return results.map(r => ({
          id: r.id,
          label: r.label,
          overallEfficiency: r.overallEfficiency,
          totalActiveAgents: r.totalActiveAgents,
          totalTasksPending: r.totalTasksPending,
          totalTasksCompleted: r.totalTasksCompleted,
          totalTasksFailed: r.totalTasksFailed,
          timestamp: r.timestamp
        }));
      } catch (err) {
        console.error('Erro ao buscar histórico de performance no Postgres:', err);
      }
    }
    return fallbackState.performanceHistoryList || [];
  }

  // --- REPAIR AGENT METHODS ---

  // 1. repair_issues
  static async saveRepairIssue(issue: RepairIssue): Promise<RepairIssue> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(repairIssues).values(issue).onConflictDoUpdate({
          target: repairIssues.id,
          set: issue
        });
        return issue;
      } catch (err) {
        console.error('Erro ao salvar issue no Postgres:', err);
      }
    }
    if (!fallbackState.repairIssues) fallbackState.repairIssues = [];
    fallbackState.repairIssues = fallbackState.repairIssues.filter(x => x.id !== issue.id);
    fallbackState.repairIssues.push(issue);
    await this.saveState({ repairIssues: fallbackState.repairIssues });
    return issue;
  }

  static async getRepairIssues(): Promise<RepairIssue[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(repairIssues);
        return results as RepairIssue[];
      } catch (err) {
        console.error('Erro ao buscar issues no Postgres:', err);
      }
    }
    return fallbackState.repairIssues || [];
  }

  // 2. repair_history
  static async saveRepairHistory(hist: RepairHistory): Promise<RepairHistory> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(repairHistory).values(hist);
        return hist;
      } catch (err) {
        console.error('Erro ao salvar historico de reparo no Postgres:', err);
      }
    }
    if (!fallbackState.repairHistory) fallbackState.repairHistory = [];
    fallbackState.repairHistory.push(hist);
    await this.saveState({ repairHistory: fallbackState.repairHistory });
    return hist;
  }

  static async getRepairHistory(): Promise<RepairHistory[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(repairHistory);
        return results as RepairHistory[];
      } catch (err) {
        console.error('Erro ao buscar historico de reparo no Postgres:', err);
      }
    }
    return fallbackState.repairHistory || [];
  }

  // 3. repair_reports
  static async saveRepairReport(rep: RepairReport): Promise<RepairReport> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(repairReports).values(rep);
        return rep;
      } catch (err) {
        console.error('Erro ao salvar relatorio de reparo no Postgres:', err);
      }
    }
    if (!fallbackState.repairReports) fallbackState.repairReports = [];
    fallbackState.repairReports.push(rep);
    await this.saveState({ repairReports: fallbackState.repairReports });
    return rep;
  }

  static async getRepairReports(): Promise<RepairReport[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(repairReports);
        return results as RepairReport[];
      } catch (err) {
        console.error('Erro ao buscar relatorios de reparo no Postgres:', err);
      }
    }
    return fallbackState.repairReports || [];
  }

  // 4. repair_tests
  static async saveRepairTest(test: RepairTest): Promise<RepairTest> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(repairTests).values(test);
        return test;
      } catch (err) {
        console.error('Erro ao salvar teste de reparo no Postgres:', err);
      }
    }
    if (!fallbackState.repairTests) fallbackState.repairTests = [];
    fallbackState.repairTests.push(test);
    await this.saveState({ repairTests: fallbackState.repairTests });
    return test;
  }

  static async getRepairTests(): Promise<RepairTest[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(repairTests);
        return results as RepairTest[];
      } catch (err) {
        console.error('Erro ao buscar testes de reparo no Postgres:', err);
      }
    }
    return fallbackState.repairTests || [];
  }

  // 5. repair_actions
  static async saveRepairAction(action: RepairAction): Promise<RepairAction> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(repairActions).values(action).onConflictDoUpdate({
          target: repairActions.id,
          set: action
        });
        return action;
      } catch (err) {
        console.error('Erro ao salvar acao de reparo no Postgres:', err);
      }
    }
    if (!fallbackState.repairActions) fallbackState.repairActions = [];
    fallbackState.repairActions = fallbackState.repairActions.filter(x => x.id !== action.id);
    fallbackState.repairActions.push(action);
    await this.saveState({ repairActions: fallbackState.repairActions });
    return action;
  }

  static async getRepairActions(): Promise<RepairAction[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(repairActions);
        return results as RepairAction[];
      } catch (err) {
        console.error('Erro ao buscar acoes de reparo no Postgres:', err);
      }
    }
    return fallbackState.repairActions || [];
  }

  // 6. repair_snapshots
  static async saveRepairSnapshot(snap: RepairSnapshot): Promise<RepairSnapshot> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(repairSnapshots).values(snap);
        return snap;
      } catch (err) {
        console.error('Erro ao salvar snapshot no Postgres:', err);
      }
    }
    if (!fallbackState.repairSnapshots) fallbackState.repairSnapshots = [];
    fallbackState.repairSnapshots.push(snap);
    await this.saveState({ repairSnapshots: fallbackState.repairSnapshots });
    return snap;
  }

  static async getRepairSnapshots(): Promise<RepairSnapshot[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(repairSnapshots);
        return results as RepairSnapshot[];
      } catch (err) {
        console.error('Erro ao buscar snapshots no Postgres:', err);
      }
    }
    return fallbackState.repairSnapshots || [];
  }

  static async getRepairSnapshotById(id: string): Promise<RepairSnapshot | null> {
    const list = await this.getRepairSnapshots();
    return list.find(x => x.id === id) || null;
  }

  // 7. repair_rollbacks
  static async saveRepairRollback(rb: RepairRollback): Promise<RepairRollback> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(repairRollbacks).values(rb);
        return rb;
      } catch (err) {
        console.error('Erro ao salvar rollback no Postgres:', err);
      }
    }
    if (!fallbackState.repairRollbacks) fallbackState.repairRollbacks = [];
    fallbackState.repairRollbacks.push(rb);
    await this.saveState({ repairRollbacks: fallbackState.repairRollbacks });
    return rb;
  }

  static async getRepairRollbacks(): Promise<RepairRollback[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(repairRollbacks);
        return results as RepairRollback[];
      } catch (err) {
        console.error('Erro ao buscar rollbacks no Postgres:', err);
      }
    }
    return fallbackState.repairRollbacks || [];
  }

  // 8. repair_knowledge
  static async saveRepairKnowledge(kn: RepairKnowledge): Promise<RepairKnowledge> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(repairKnowledge).values(kn).onConflictDoUpdate({
          target: repairKnowledge.id,
          set: kn
        });
        return kn;
      } catch (err) {
        console.error('Erro ao salvar base de conhecimento no Postgres:', err);
      }
    }
    if (!fallbackState.repairKnowledge) fallbackState.repairKnowledge = [];
    fallbackState.repairKnowledge = fallbackState.repairKnowledge.filter(x => x.id !== kn.id);
    fallbackState.repairKnowledge.push(kn);
    await this.saveState({ repairKnowledge: fallbackState.repairKnowledge });
    return kn;
  }

  static async getRepairKnowledge(): Promise<RepairKnowledge[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(repairKnowledge);
        return results as RepairKnowledge[];
      } catch (err) {
        console.error('Erro ao buscar base de conhecimento no Postgres:', err);
      }
    }
    return fallbackState.repairKnowledge || [];
  }

  // 9. repair_statistics
  static async saveRepairStatistics(stats: RepairStatistics): Promise<RepairStatistics> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(repairStatistics).values(stats).onConflictDoUpdate({
          target: repairStatistics.id,
          set: stats
        });
        return stats;
      } catch (err) {
        console.error('Erro ao salvar estatisticas de reparo no Postgres:', err);
      }
    }
    if (!fallbackState.repairStatistics) fallbackState.repairStatistics = [];
    fallbackState.repairStatistics = fallbackState.repairStatistics.filter(x => x.id !== stats.id);
    fallbackState.repairStatistics.push(stats);
    await this.saveState({ repairStatistics: fallbackState.repairStatistics });
    return stats;
  }

  static async getRepairStatistics(): Promise<RepairStatistics[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(repairStatistics);
        return results as RepairStatistics[];
      } catch (err) {
        console.error('Erro ao buscar estatisticas de reparo no Postgres:', err);
      }
    }
    return fallbackState.repairStatistics || [];
  }

  // 10. repair_diagnostics
  static async saveRepairDiagnostic(diag: RepairDiagnostic): Promise<RepairDiagnostic> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(repairDiagnostics).values(diag);
        return diag;
      } catch (err) {
        console.error('Erro ao salvar diagnostico no Postgres:', err);
      }
    }
    if (!fallbackState.repairDiagnostics) fallbackState.repairDiagnostics = [];
    fallbackState.repairDiagnostics.push(diag);
    await this.saveState({ repairDiagnostics: fallbackState.repairDiagnostics });
    return diag;
  }

  static async getRepairDiagnostics(): Promise<RepairDiagnostic[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(repairDiagnostics);
        return results as RepairDiagnostic[];
      } catch (err) {
        console.error('Erro ao buscar diagnosticos no Postgres:', err);
      }
    }
    return fallbackState.repairDiagnostics || [];
  }

  // ==========================================
  // === MÉTODOS DO KERNEL DO SISTEMA ===
  // ==========================================

  static async saveKernelAgentRegistry(reg: KernelAgentRegistry): Promise<KernelAgentRegistry> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const existing = await db.select().from(kernelRegistry).where(eq(kernelRegistry.id, reg.id));
        if (existing.length > 0) {
          await db.update(kernelRegistry).set({
            name: reg.name,
            version: reg.version,
            status: reg.status,
            permissions: reg.permissions,
            capabilities: reg.capabilities,
            dependencies: reg.dependencies,
            heartbeat: reg.heartbeat,
            lastExecution: reg.lastExecution,
            lastUpdate: reg.lastUpdate,
            logicalConsumption: reg.logicalConsumption,
            averageTime: reg.averageTime,
            priority: reg.priority,
            timestamp: reg.timestamp
          }).where(eq(kernelRegistry.id, reg.id));
        } else {
          await db.insert(kernelRegistry).values({ ...reg, createdAt: new Date() });
        }
        return reg;
      } catch (err) {
        console.error('Erro ao salvar kernel agent registry no Postgres:', err);
      }
    }
    if (!fallbackState.kernelRegistry) fallbackState.kernelRegistry = [];
    const idx = fallbackState.kernelRegistry.findIndex((x: any) => x.id === reg.id);
    if (idx >= 0) {
      fallbackState.kernelRegistry[idx] = reg;
    } else {
      fallbackState.kernelRegistry.push(reg);
    }
    await this.saveState({ kernelRegistry: fallbackState.kernelRegistry });
    return reg;
  }

  static async getKernelAgentRegistries(): Promise<KernelAgentRegistry[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(kernelRegistry);
        return results as KernelAgentRegistry[];
      } catch (err) {
        console.error('Erro ao buscar kernel agent registries no Postgres:', err);
      }
    }
    return fallbackState.kernelRegistry || [];
  }

  static async saveKernelEvent(event: KernelEvent): Promise<KernelEvent> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(kernelEvents).values({ ...event, createdAt: new Date() });
        return event;
      } catch (err) {
        console.error('Erro ao salvar kernel event no Postgres:', err);
      }
    }
    if (!fallbackState.kernelEvents) fallbackState.kernelEvents = [];
    fallbackState.kernelEvents.push(event);
    await this.saveState({ kernelEvents: fallbackState.kernelEvents });
    return event;
  }

  static async getKernelEvents(): Promise<KernelEvent[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(kernelEvents);
        return results as KernelEvent[];
      } catch (err) {
        console.error('Erro ao buscar kernel events no Postgres:', err);
      }
    }
    return fallbackState.kernelEvents || [];
  }

  static async saveKernelPlugin(plugin: KernelPlugin): Promise<KernelPlugin> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const existing = await db.select().from(kernelPlugins).where(eq(kernelPlugins.id, plugin.id));
        if (existing.length > 0) {
          await db.update(kernelPlugins).set({
            name: plugin.name,
            version: plugin.version,
            manifest: plugin.manifest,
            dependencies: plugin.dependencies,
            permissions: plugin.permissions,
            events: plugin.events,
            routes: plugin.routes,
            panels: plugin.panels,
            capabilities: plugin.capabilities,
            status: plugin.status,
            timestamp: plugin.timestamp
          }).where(eq(kernelPlugins.id, plugin.id));
        } else {
          await db.insert(kernelPlugins).values({ ...plugin, createdAt: new Date() });
        }
        return plugin;
      } catch (err) {
        console.error('Erro ao salvar kernel plugin no Postgres:', err);
      }
    }
    if (!fallbackState.kernelPlugins) fallbackState.kernelPlugins = [];
    const idx = fallbackState.kernelPlugins.findIndex((x: any) => x.id === plugin.id);
    if (idx >= 0) {
      fallbackState.kernelPlugins[idx] = plugin;
    } else {
      fallbackState.kernelPlugins.push(plugin);
    }
    await this.saveState({ kernelPlugins: fallbackState.kernelPlugins });
    return plugin;
  }

  static async getKernelPlugins(): Promise<KernelPlugin[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(kernelPlugins);
        return results as KernelPlugin[];
      } catch (err) {
        console.error('Erro ao buscar kernel plugins no Postgres:', err);
      }
    }
    return fallbackState.kernelPlugins || [];
  }

  static async saveKernelService(srv: KernelService): Promise<KernelService> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const existing = await db.select().from(kernelServices).where(eq(kernelServices.id, srv.id));
        if (existing.length > 0) {
          await db.update(kernelServices).set({
            name: srv.name,
            status: srv.status,
            uptime: srv.uptime,
            lastCheck: srv.lastCheck,
            message: srv.message || ''
          }).where(eq(kernelServices.id, srv.id));
        } else {
          await db.insert(kernelServices).values({ ...srv, createdAt: new Date() });
        }
        return srv;
      } catch (err) {
        console.error('Erro ao salvar kernel service no Postgres:', err);
      }
    }
    if (!fallbackState.kernelServices) fallbackState.kernelServices = [];
    const idx = fallbackState.kernelServices.findIndex((x: any) => x.id === srv.id);
    if (idx >= 0) {
      fallbackState.kernelServices[idx] = srv;
    } else {
      fallbackState.kernelServices.push(srv);
    }
    await this.saveState({ kernelServices: fallbackState.kernelServices });
    return srv;
  }

  static async getKernelServices(): Promise<KernelService[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(kernelServices);
        return results as KernelService[];
      } catch (err) {
        console.error('Erro ao buscar kernel services no Postgres:', err);
      }
    }
    return fallbackState.kernelServices || [];
  }

  static async saveKernelVersion(ver: KernelVersionRecord): Promise<KernelVersionRecord> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const existing = await db.select().from(kernelVersions).where(eq(kernelVersions.id, ver.id));
        if (existing.length > 0) {
          await db.update(kernelVersions).set({
            componentType: ver.componentType,
            componentId: ver.componentId,
            version: ver.version,
            history: ver.history,
            timestamp: ver.timestamp
          }).where(eq(kernelVersions.id, ver.id));
        } else {
          await db.insert(kernelVersions).values({ ...ver, createdAt: new Date() });
        }
        return ver;
      } catch (err) {
        console.error('Erro ao salvar kernel version no Postgres:', err);
      }
    }
    if (!fallbackState.kernelVersions) fallbackState.kernelVersions = [];
    const idx = fallbackState.kernelVersions.findIndex((x: any) => x.id === ver.id);
    if (idx >= 0) {
      fallbackState.kernelVersions[idx] = ver;
    } else {
      fallbackState.kernelVersions.push(ver);
    }
    await this.saveState({ kernelVersions: fallbackState.kernelVersions });
    return ver;
  }

  static async getKernelVersions(): Promise<KernelVersionRecord[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(kernelVersions);
        return results as KernelVersionRecord[];
      } catch (err) {
        console.error('Erro ao buscar kernel versions no Postgres:', err);
      }
    }
    return fallbackState.kernelVersions || [];
  }

  static async saveKernelConfig(cfg: KernelConfig): Promise<KernelConfig> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const existing = await db.select().from(kernelConfigs).where(eq(kernelConfigs.id, cfg.id));
        if (existing.length > 0) {
          await db.update(kernelConfigs).set({
            dataJson: cfg.dataJson,
            version: cfg.version,
            updatedAt: cfg.updatedAt,
            history: cfg.history
          }).where(eq(kernelConfigs.id, cfg.id));
        } else {
          await db.insert(kernelConfigs).values({ ...cfg, createdAt: new Date() });
        }
        return cfg;
      } catch (err) {
        console.error('Erro ao salvar kernel config no Postgres:', err);
      }
    }
    if (!fallbackState.kernelConfigs) fallbackState.kernelConfigs = [];
    const idx = fallbackState.kernelConfigs.findIndex((x: any) => x.id === cfg.id);
    if (idx >= 0) {
      fallbackState.kernelConfigs[idx] = cfg;
    } else {
      fallbackState.kernelConfigs.push(cfg);
    }
    await this.saveState({ kernelConfigs: fallbackState.kernelConfigs });
    return cfg;
  }

  static async getKernelConfigs(): Promise<KernelConfig[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(kernelConfigs);
        return results as KernelConfig[];
      } catch (err) {
        console.error('Erro ao buscar kernel configs no Postgres:', err);
      }
    }
    return fallbackState.kernelConfigs || [];
  }

  static async saveKernelSharedMemory(sm: KernelSharedMemory): Promise<KernelSharedMemory> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const existing = await db.select().from(kernelSharedMemory).where(eq(kernelSharedMemory.key, sm.key));
        if (existing.length > 0) {
          await db.update(kernelSharedMemory).set({
            value: sm.value,
            version: sm.version,
            expiration: sm.expiration || null,
            accessControl: sm.accessControl,
            isLocked: sm.isLocked,
            lockedBy: sm.lockedBy || null,
            lastUpdatedBy: sm.lastUpdatedBy,
            timestamp: sm.timestamp
          }).where(eq(kernelSharedMemory.key, sm.key));
        } else {
          await db.insert(kernelSharedMemory).values({ ...sm, createdAt: new Date() });
        }
        return sm;
      } catch (err) {
        console.error('Erro ao salvar shared memory no Postgres:', err);
      }
    }
    if (!fallbackState.kernelSharedMemory) fallbackState.kernelSharedMemory = [];
    const idx = fallbackState.kernelSharedMemory.findIndex((x: any) => x.key === sm.key);
    if (idx >= 0) {
      fallbackState.kernelSharedMemory[idx] = sm;
    } else {
      fallbackState.kernelSharedMemory.push(sm);
    }
    await this.saveState({ kernelSharedMemory: fallbackState.kernelSharedMemory });
    return sm;
  }

  static async getKernelSharedMemories(): Promise<KernelSharedMemory[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(kernelSharedMemory);
        return results.map(row => ({
          key: row.key,
          value: row.value,
          version: row.version,
          expiration: row.expiration || undefined,
          accessControl: row.accessControl as string[],
          isLocked: row.isLocked,
          lockedBy: row.lockedBy || undefined,
          lastUpdatedBy: row.lastUpdatedBy,
          timestamp: row.timestamp
        })) as KernelSharedMemory[];
      } catch (err) {
        console.error('Erro ao buscar shared memories no Postgres:', err);
      }
    }
    return fallbackState.kernelSharedMemory || [];
  }

  static async deleteKernelSharedMemory(key: string): Promise<boolean> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.delete(kernelSharedMemory).where(eq(kernelSharedMemory.key, key));
        return true;
      } catch (err) {
        console.error('Erro ao deletar da shared memory no Postgres:', err);
      }
    }
    if (!fallbackState.kernelSharedMemory) fallbackState.kernelSharedMemory = [];
    const idx = fallbackState.kernelSharedMemory.findIndex((x: any) => x.key === key);
    if (idx >= 0) {
      fallbackState.kernelSharedMemory.splice(idx, 1);
      await this.saveState({ kernelSharedMemory: fallbackState.kernelSharedMemory });
      return true;
    }
    return false;
  }

  static async saveKernelAudit(audit: KernelAuditLog): Promise<KernelAuditLog> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        await db.insert(kernelAudit).values({ ...audit, createdAt: new Date() });
        return audit;
      } catch (err) {
        console.error('Erro ao salvar kernel audit no Postgres:', err);
      }
    }
    if (!fallbackState.kernelAudit) fallbackState.kernelAudit = [];
    fallbackState.kernelAudit.push(audit);
    await this.saveState({ kernelAudit: fallbackState.kernelAudit });
    return audit;
  }

  static async getKernelAudits(): Promise<KernelAuditLog[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(kernelAudit);
        return results as KernelAuditLog[];
      } catch (err) {
        console.error('Erro ao buscar kernel audits no Postgres:', err);
      }
    }
    return fallbackState.kernelAudit || [];
  }

  static async saveKernelMetrics(met: KernelMetrics): Promise<KernelMetrics> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const existing = await db.select().from(kernelMetrics).where(eq(kernelMetrics.id, met.id));
        if (existing.length > 0) {
          await db.update(kernelMetrics).set({
            totalEventsProcessed: met.totalEventsProcessed,
            activeAgentsCount: met.activeAgentsCount,
            activePluginsCount: met.activePluginsCount,
            sharedMemoryKeysCount: met.sharedMemoryKeysCount,
            systemUptimeSeconds: met.systemUptimeSeconds,
            averageCommunicationTimeMs: met.averageCommunicationTimeMs,
            timestamp: met.timestamp
          }).where(eq(kernelMetrics.id, met.id));
        } else {
          await db.insert(kernelMetrics).values({ ...met, createdAt: new Date() });
        }
        return met;
      } catch (err) {
        console.error('Erro ao salvar kernel metrics no Postgres:', err);
      }
    }
    if (!fallbackState.kernelMetrics) fallbackState.kernelMetrics = [];
    const idx = fallbackState.kernelMetrics.findIndex((x: any) => x.id === met.id);
    if (idx >= 0) {
      fallbackState.kernelMetrics[idx] = met;
    } else {
      fallbackState.kernelMetrics.push(met);
    }
    await this.saveState({ kernelMetrics: fallbackState.kernelMetrics });
    return met;
  }

  static async getKernelMetrics(): Promise<KernelMetrics[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(kernelMetrics);
        return results as KernelMetrics[];
      } catch (err) {
        console.error('Erro ao buscar kernel metrics no Postgres:', err);
      }
    }
    return fallbackState.kernelMetrics || [];
  }

  static async saveKernelHealth(h: KernelHealth): Promise<KernelHealth> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const existing = await db.select().from(kernelHealth).where(eq(kernelHealth.id, h.id));
        if (existing.length > 0) {
          await db.update(kernelHealth).set({
            status: h.status,
            databaseStatus: h.databaseStatus,
            eventBusStatus: h.eventBusStatus,
            schedulerStatus: h.schedulerStatus,
            timestamp: h.timestamp
          }).where(eq(kernelHealth.id, h.id));
        } else {
          await db.insert(kernelHealth).values({ ...h, createdAt: new Date() });
        }
        return h;
      } catch (err) {
        console.error('Erro ao salvar kernel health no Postgres:', err);
      }
    }
    if (!fallbackState.kernelHealth) fallbackState.kernelHealth = [];
    const idx = fallbackState.kernelHealth.findIndex((x: any) => x.id === h.id);
    if (idx >= 0) {
      fallbackState.kernelHealth[idx] = h;
    } else {
      fallbackState.kernelHealth.push(h);
    }
    await this.saveState({ kernelHealth: fallbackState.kernelHealth });
    return h;
  }

  static async getKernelHealth(): Promise<KernelHealth[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(kernelHealth);
        return results as KernelHealth[];
      } catch (err) {
        console.error('Erro ao buscar kernel health no Postgres:', err);
      }
    }
    return fallbackState.kernelHealth || [];
  }

  // ==========================================
  // === METODOS DO AGENTE DE INTEGRAÇÃO ===
  // ==========================================

  static async saveIntegrationConnector(conn: IntegrationConnector): Promise<IntegrationConnector> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const existing = await db.select().from(integrationConnectors).where(eq(integrationConnectors.id, conn.id));
        if (existing.length > 0) {
          await db.update(integrationConnectors).set({
            name: conn.name,
            category: conn.category,
            status: conn.status,
            configJson: conn.configJson,
            lastSyncedAt: conn.lastSyncedAt,
            latencyMs: conn.latencyMs
          }).where(eq(integrationConnectors.id, conn.id));
        } else {
          await db.insert(integrationConnectors).values({ ...conn, createdAt: new Date() });
        }
        return conn;
      } catch (err) {
        console.error('Erro ao salvar integration connector no Postgres:', err);
      }
    }
    if (!fallbackState.integrationConnectors) fallbackState.integrationConnectors = [];
    const idx = fallbackState.integrationConnectors.findIndex((x: any) => x.id === conn.id);
    if (idx >= 0) {
      fallbackState.integrationConnectors[idx] = conn;
    } else {
      fallbackState.integrationConnectors.push(conn);
    }
    await this.saveState({ integrationConnectors: fallbackState.integrationConnectors });
    return conn;
  }

  static async getIntegrationConnectors(): Promise<IntegrationConnector[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(integrationConnectors);
        return results as IntegrationConnector[];
      } catch (err) {
        console.error('Erro ao buscar integration connectors no Postgres:', err);
      }
    }
    return fallbackState.integrationConnectors || [];
  }

  static async saveIntegrationJob(job: IntegrationJob): Promise<IntegrationJob> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const existing = await db.select().from(integrationJobs).where(eq(integrationJobs.id, job.id));
        if (existing.length > 0) {
          await db.update(integrationJobs).set({
            status: job.status,
            payloadJson: job.payloadJson,
            resultJson: job.resultJson,
            error: job.error,
            attempts: job.attempts,
            maxAttempts: job.maxAttempts,
            timeoutMs: job.timeoutMs
          }).where(eq(integrationJobs.id, job.id));
        } else {
          await db.insert(integrationJobs).values({ ...job, createdAt: new Date() });
        }
        return job;
      } catch (err) {
        console.error('Erro ao salvar integration job no Postgres:', err);
      }
    }
    if (!fallbackState.integrationJobs) fallbackState.integrationJobs = [];
    const idx = fallbackState.integrationJobs.findIndex((x: any) => x.id === job.id);
    if (idx >= 0) {
      fallbackState.integrationJobs[idx] = job;
    } else {
      fallbackState.integrationJobs.push(job);
    }
    await this.saveState({ integrationJobs: fallbackState.integrationJobs });
    return job;
  }

  static async getIntegrationJobs(): Promise<IntegrationJob[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(integrationJobs);
        return results as IntegrationJob[];
      } catch (err) {
        console.error('Erro ao buscar integration jobs no Postgres:', err);
      }
    }
    return fallbackState.integrationJobs || [];
  }

  static async saveIntegrationLog(log: IntegrationLog): Promise<IntegrationLog> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const existing = await db.select().from(integrationLogs).where(eq(integrationLogs.id, log.id));
        if (existing.length > 0) {
          await db.update(integrationLogs).set({
            type: log.type,
            direction: log.direction,
            url: log.url,
            method: log.method,
            statusCode: log.statusCode,
            requestHeaders: log.requestHeaders,
            requestBody: log.requestBody,
            responseHeaders: log.responseHeaders,
            responseBody: log.responseBody,
            latencyMs: log.latencyMs,
            timestamp: log.timestamp
          }).where(eq(integrationLogs.id, log.id));
        } else {
          await db.insert(integrationLogs).values({ ...log, createdAt: new Date() });
        }
        return log;
      } catch (err) {
        console.error('Erro ao salvar integration log no Postgres:', err);
      }
    }
    if (!fallbackState.integrationLogs) fallbackState.integrationLogs = [];
    const idx = fallbackState.integrationLogs.findIndex((x: any) => x.id === log.id);
    if (idx >= 0) {
      fallbackState.integrationLogs[idx] = log;
    } else {
      fallbackState.integrationLogs.push(log);
    }
    await this.saveState({ integrationLogs: fallbackState.integrationLogs });
    return log;
  }

  static async getIntegrationLogs(): Promise<IntegrationLog[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(integrationLogs);
        return results as IntegrationLog[];
      } catch (err) {
        console.error('Erro ao buscar integration logs no Postgres:', err);
      }
    }
    return fallbackState.integrationLogs || [];
  }

  static async saveIntegrationToken(token: IntegrationToken): Promise<IntegrationToken> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const existing = await db.select().from(integrationTokens).where(eq(integrationTokens.id, token.id));
        if (existing.length > 0) {
          await db.update(integrationTokens).set({
            tokenType: token.tokenType,
            accessTokenEncrypted: token.accessTokenEncrypted,
            refreshTokenEncrypted: token.refreshTokenEncrypted,
            clientSecretEncrypted: token.clientSecretEncrypted,
            expiresAt: token.expiresAt,
            endpoint: token.endpoint,
            metadataJson: token.metadataJson
          }).where(eq(integrationTokens.id, token.id));
        } else {
          await db.insert(integrationTokens).values({ ...token, createdAt: new Date() });
        }
        return token;
      } catch (err) {
        console.error('Erro ao salvar integration token no Postgres:', err);
      }
    }
    if (!fallbackState.integrationTokens) fallbackState.integrationTokens = [];
    const idx = fallbackState.integrationTokens.findIndex((x: any) => x.id === token.id);
    if (idx >= 0) {
      fallbackState.integrationTokens[idx] = token;
    } else {
      fallbackState.integrationTokens.push(token);
    }
    await this.saveState({ integrationTokens: fallbackState.integrationTokens });
    return token;
  }

  static async getIntegrationTokens(): Promise<IntegrationToken[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(integrationTokens);
        return results as IntegrationToken[];
      } catch (err) {
        console.error('Erro ao buscar integration tokens no Postgres:', err);
      }
    }
    return fallbackState.integrationTokens || [];
  }

  static async saveIntegrationWebhook(wh: IntegrationWebhook): Promise<IntegrationWebhook> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const existing = await db.select().from(integrationWebhooks).where(eq(integrationWebhooks.id, wh.id));
        if (existing.length > 0) {
          await db.update(integrationWebhooks).set({
            status: wh.status,
            processedEventsCount: wh.processedEventsCount,
            lastEventReceivedAt: wh.lastEventReceivedAt
          }).where(eq(integrationWebhooks.id, wh.id));
        } else {
          await db.insert(integrationWebhooks).values({ ...wh, createdAt: new Date() });
        }
        return wh;
      } catch (err) {
        console.error('Erro ao salvar integration webhook no Postgres:', err);
      }
    }
    if (!fallbackState.integrationWebhooks) fallbackState.integrationWebhooks = [];
    const idx = fallbackState.integrationWebhooks.findIndex((x: any) => x.id === wh.id);
    if (idx >= 0) {
      fallbackState.integrationWebhooks[idx] = wh;
    } else {
      fallbackState.integrationWebhooks.push(wh);
    }
    await this.saveState({ integrationWebhooks: fallbackState.integrationWebhooks });
    return wh;
  }

  static async getIntegrationWebhooks(): Promise<IntegrationWebhook[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(integrationWebhooks);
        return results as IntegrationWebhook[];
      } catch (err) {
        console.error('Erro ao buscar integration webhooks no Postgres:', err);
      }
    }
    return fallbackState.integrationWebhooks || [];
  }

  static async saveIntegrationFile(file: IntegrationFile): Promise<IntegrationFile> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const existing = await db.select().from(integrationFiles).where(eq(integrationFiles.id, file.id));
        if (existing.length > 0) {
          await db.update(integrationFiles).set({
            status: file.status,
            version: file.version,
            hash: file.hash
          }).where(eq(integrationFiles.id, file.id));
        } else {
          await db.insert(integrationFiles).values({ ...file, createdAt: new Date() });
        }
        return file;
      } catch (err) {
        console.error('Erro ao salvar integration file no Postgres:', err);
      }
    }
    if (!fallbackState.integrationFiles) fallbackState.integrationFiles = [];
    const idx = fallbackState.integrationFiles.findIndex((x: any) => x.id === file.id);
    if (idx >= 0) {
      fallbackState.integrationFiles[idx] = file;
    } else {
      fallbackState.integrationFiles.push(file);
    }
    await this.saveState({ integrationFiles: fallbackState.integrationFiles });
    return file;
  }

  static async getIntegrationFiles(): Promise<IntegrationFile[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(integrationFiles);
        return results as IntegrationFile[];
      } catch (err) {
        console.error('Erro ao buscar integration files no Postgres:', err);
      }
    }
    return fallbackState.integrationFiles || [];
  }

  static async saveIntegrationSync(sync: IntegrationSync): Promise<IntegrationSync> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const existing = await db.select().from(integrationSync).where(eq(integrationSync.id, sync.id));
        if (existing.length > 0) {
          await db.update(integrationSync).set({
            itemsSynced: sync.itemsSynced,
            lastAnchor: sync.lastAnchor,
            status: sync.status,
            durationMs: sync.durationMs
          }).where(eq(integrationSync.id, sync.id));
        } else {
          await db.insert(integrationSync).values({ ...sync, createdAt: new Date() });
        }
        return sync;
      } catch (err) {
        console.error('Erro ao salvar integration sync no Postgres:', err);
      }
    }
    if (!fallbackState.integrationSync) fallbackState.integrationSync = [];
    const idx = fallbackState.integrationSync.findIndex((x: any) => x.id === sync.id);
    if (idx >= 0) {
      fallbackState.integrationSync[idx] = sync;
    } else {
      fallbackState.integrationSync.push(sync);
    }
    await this.saveState({ integrationSync: fallbackState.integrationSync });
    return sync;
  }

  static async getIntegrationSyncs(): Promise<IntegrationSync[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(integrationSync);
        return results as IntegrationSync[];
      } catch (err) {
        console.error('Erro ao buscar integration syncs no Postgres:', err);
      }
    }
    return fallbackState.integrationSync || [];
  }

  static async saveIntegrationMetrics(met: IntegrationMetrics): Promise<IntegrationMetrics> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const existing = await db.select().from(integrationMetrics).where(eq(integrationMetrics.id, met.id));
        if (existing.length > 0) {
          await db.update(integrationMetrics).set({
            totalRequests: met.totalRequests,
            successfulRequests: met.successfulRequests,
            failedRequests: met.failedRequests,
            averageLatencyMs: met.averageLatencyMs,
            totalBytesTransferred: met.totalBytesTransferred,
            timestamp: met.timestamp
          }).where(eq(integrationMetrics.id, met.id));
        } else {
          await db.insert(integrationMetrics).values({ ...met, createdAt: new Date() });
        }
        return met;
      } catch (err) {
        console.error('Erro ao salvar integration metrics no Postgres:', err);
      }
    }
    if (!fallbackState.integrationMetrics) fallbackState.integrationMetrics = [];
    const idx = fallbackState.integrationMetrics.findIndex((x: any) => x.id === met.id);
    if (idx >= 0) {
      fallbackState.integrationMetrics[idx] = met;
    } else {
      fallbackState.integrationMetrics.push(met);
    }
    await this.saveState({ integrationMetrics: fallbackState.integrationMetrics });
    return met;
  }

  static async getIntegrationMetrics(): Promise<IntegrationMetrics[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(integrationMetrics);
        return results as IntegrationMetrics[];
      } catch (err) {
        console.error('Erro ao buscar integration metrics no Postgres:', err);
      }
    }
    return fallbackState.integrationMetrics || [];
  }

  static async saveIntegrationError(errRecord: IntegrationError): Promise<IntegrationError> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const existing = await db.select().from(integrationErrors).where(eq(integrationErrors.id, errRecord.id));
        if (existing.length > 0) {
          await db.update(integrationErrors).set({
            resolved: errRecord.resolved,
            resolvedAt: errRecord.resolvedAt
          }).where(eq(integrationErrors.id, errRecord.id));
        } else {
          await db.insert(integrationErrors).values({ ...errRecord, createdAt: new Date() });
        }
        return errRecord;
      } catch (err) {
        console.error('Erro ao salvar integration error no Postgres:', err);
      }
    }
    if (!fallbackState.integrationErrors) fallbackState.integrationErrors = [];
    const idx = fallbackState.integrationErrors.findIndex((x: any) => x.id === errRecord.id);
    if (idx >= 0) {
      fallbackState.integrationErrors[idx] = errRecord;
    } else {
      fallbackState.integrationErrors.push(errRecord);
    }
    await this.saveState({ integrationErrors: fallbackState.integrationErrors });
    return errRecord;
  }

  static async getIntegrationErrors(): Promise<IntegrationError[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(integrationErrors);
        return results as IntegrationError[];
      } catch (err) {
        console.error('Erro ao buscar integration errors no Postgres:', err);
      }
    }
    return fallbackState.integrationErrors || [];
  }

  static async saveIntegrationHistory(hist: IntegrationHistory): Promise<IntegrationHistory> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const existing = await db.select().from(integrationHistory).where(eq(integrationHistory.id, hist.id));
        if (existing.length > 0) {
          await db.update(integrationHistory).set({
            description: hist.description,
            timestamp: hist.timestamp
          }).where(eq(integrationHistory.id, hist.id));
        } else {
          await db.insert(integrationHistory).values({ ...hist, createdAt: new Date() });
        }
        return hist;
      } catch (err) {
        console.error('Erro ao salvar integration history no Postgres:', err);
      }
    }
    if (!fallbackState.integrationHistory) fallbackState.integrationHistory = [];
    const idx = fallbackState.integrationHistory.findIndex((x: any) => x.id === hist.id);
    if (idx >= 0) {
      fallbackState.integrationHistory[idx] = hist;
    } else {
      fallbackState.integrationHistory.push(hist);
    }
    await this.saveState({ integrationHistory: fallbackState.integrationHistory });
    return hist;
  }

  static async getIntegrationHistories(): Promise<IntegrationHistory[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(integrationHistory);
        return results as IntegrationHistory[];
      } catch (err) {
        console.error('Erro ao buscar integration history no Postgres:', err);
      }
    }
    return fallbackState.integrationHistory || [];
  }

  static async savePaymentConnection(conn: PaymentConnection): Promise<PaymentConnection> {
    if (!fallbackState.paymentConnections) fallbackState.paymentConnections = [];
    const idx = fallbackState.paymentConnections.findIndex((x: any) => x.id === conn.id);
    if (idx >= 0) {
      fallbackState.paymentConnections[idx] = conn;
    } else {
      fallbackState.paymentConnections.push(conn);
    }
    await this.saveState({ paymentConnections: fallbackState.paymentConnections });

    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const existing = await db.select().from(paymentConnections).where(eq(paymentConnections.id, conn.id));
        if (existing.length > 0) {
          await db.update(paymentConnections).set({
            status: conn.status,
            encryptedCredentials: conn.encryptedCredentials,
            lastSync: conn.lastSync
          }).where(eq(paymentConnections.id, conn.id));
        } else {
          await db.insert(paymentConnections).values({
            id: conn.id,
            provider: conn.provider,
            status: conn.status,
            encryptedCredentials: conn.encryptedCredentials,
            lastSync: conn.lastSync,
            createdAt: conn.createdAt instanceof Date ? conn.createdAt : new Date(conn.createdAt)
          });
        }
      } catch (err) {
        console.error('Erro ao salvar payment connection no Postgres:', err);
      }
    }
    return conn;
  }

  static async getPaymentConnections(): Promise<PaymentConnection[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(paymentConnections);
        return results.map(r => ({
          ...r,
          status: r.status as any,
          createdAt: r.createdAt.toISOString()
        })) as PaymentConnection[];
      } catch (err) {
        console.error('Erro ao buscar payment connections no Postgres:', err);
      }
    }
    return fallbackState.paymentConnections || [];
  }

  static async savePaymentTransaction(tx: PaymentTransaction): Promise<PaymentTransaction> {
    if (!fallbackState.paymentTransactions) fallbackState.paymentTransactions = [];
    const idx = fallbackState.paymentTransactions.findIndex((x: any) => x.id === tx.id);
    if (idx >= 0) {
      fallbackState.paymentTransactions[idx] = tx;
    } else {
      fallbackState.paymentTransactions.push(tx);
    }
    await this.saveState({ paymentTransactions: fallbackState.paymentTransactions });

    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const existing = await db.select().from(paymentTransactions).where(eq(paymentTransactions.id, tx.id));
        if (existing.length > 0) {
          await db.update(paymentTransactions).set({
            status: tx.status,
            productId: tx.productId,
            amount: tx.amount,
            customerReference: tx.customerReference
          }).where(eq(paymentTransactions.id, tx.id));
        } else {
          await db.insert(paymentTransactions).values({
            id: tx.id,
            provider: tx.provider,
            externalId: tx.externalId,
            productId: tx.productId,
            amount: tx.amount,
            currency: tx.currency,
            status: tx.status,
            customerReference: tx.customerReference,
            createdAt: tx.createdAt instanceof Date ? tx.createdAt : new Date(tx.createdAt)
          });
        }
      } catch (err) {
        console.error('Erro ao salvar payment transaction no Postgres:', err);
      }
    }
    return tx;
  }

  static async getPaymentTransactions(): Promise<PaymentTransaction[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(paymentTransactions);
        return results.map(r => ({
          ...r,
          status: r.status as any,
          createdAt: r.createdAt.toISOString()
        })) as PaymentTransaction[];
      } catch (err) {
        console.error('Erro ao buscar payment transactions no Postgres:', err);
      }
    }
    return fallbackState.paymentTransactions || [];
  }

  static async clearPaymentTestData(): Promise<void> {
    if (fallbackState.paymentConnections) {
      fallbackState.paymentConnections = fallbackState.paymentConnections.filter((c: any) => c.provider !== 'mercado_pago');
    }
    if (fallbackState.paymentTransactions) {
      fallbackState.paymentTransactions = fallbackState.paymentTransactions.filter((t: any) => t.provider !== 'mercado_pago');
    }
    await this.saveState({
      paymentConnections: fallbackState.paymentConnections || [],
      paymentTransactions: fallbackState.paymentTransactions || []
    });

    if (process.env.SQL_HOST) {
      try {
        const db = getDB();
        await db.delete(paymentConnections).where(eq(paymentConnections.provider, 'mercado_pago'));
        await db.delete(paymentTransactions).where(eq(paymentTransactions.provider, 'mercado_pago'));
      } catch (err) {
        console.error('Erro ao limpar dados de teste de pagamento no Postgres:', err);
      }
    }
  }

  // Métodos do Hotmart Connector (Etapa 17B)
  static async savePlatformConnection(conn: PlatformConnection): Promise<PlatformConnection> {
    if (!fallbackState.platformConnections) fallbackState.platformConnections = [];
    const idx = fallbackState.platformConnections.findIndex((x: any) => x.id === conn.id);
    if (idx >= 0) {
      fallbackState.platformConnections[idx] = conn;
    } else {
      fallbackState.platformConnections.push(conn);
    }
    await this.saveState({ platformConnections: fallbackState.platformConnections });

    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const existing = await db.select().from(platformConnections).where(eq(platformConnections.id, conn.id));
        if (existing.length > 0) {
          await db.update(platformConnections).set({
            status: conn.status,
            encryptedCredentials: conn.encryptedCredentials,
            lastSync: conn.lastSync
          }).where(eq(platformConnections.id, conn.id));
        } else {
          await db.insert(platformConnections).values({
            id: conn.id,
            provider: conn.provider,
            status: conn.status,
            encryptedCredentials: conn.encryptedCredentials,
            lastSync: conn.lastSync,
            createdAt: conn.createdAt instanceof Date ? conn.createdAt : new Date(conn.createdAt)
          });
        }
      } catch (err) {
        console.error('Erro ao salvar platform connection no Postgres:', err);
      }
    }
    return conn;
  }

  static async getPlatformConnections(): Promise<PlatformConnection[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(platformConnections);
        return results.map(r => ({
          ...r,
          status: r.status as any,
          createdAt: r.createdAt.toISOString()
        })) as PlatformConnection[];
      } catch (err) {
        console.error('Erro ao buscar platform connections no Postgres:', err);
      }
    }
    return fallbackState.platformConnections || [];
  }

  static async saveDigitalSale(sale: DigitalSale): Promise<DigitalSale> {
    if (!fallbackState.digitalSales) fallbackState.digitalSales = [];
    const idx = fallbackState.digitalSales.findIndex((x: any) => x.id === sale.id);
    if (idx >= 0) {
      fallbackState.digitalSales[idx] = sale;
    } else {
      fallbackState.digitalSales.push(sale);
    }
    await this.saveState({ digitalSales: fallbackState.digitalSales });

    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const existing = await db.select().from(digitalSales).where(eq(digitalSales.id, sale.id));
        if (existing.length > 0) {
          await db.update(digitalSales).set({
            status: sale.status,
            productId: sale.productId,
            amount: sale.amount,
            commission: sale.commission,
            buyerReference: sale.buyerReference
          }).where(eq(digitalSales.id, sale.id));
        } else {
          await db.insert(digitalSales).values({
            id: sale.id,
            provider: sale.provider,
            externalId: sale.externalId,
            productId: sale.productId,
            amount: sale.amount,
            commission: sale.commission,
            status: sale.status,
            buyerReference: sale.buyerReference,
            createdAt: sale.createdAt instanceof Date ? sale.createdAt : new Date(sale.createdAt)
          });
        }
      } catch (err) {
        console.error('Erro ao salvar digital sale no Postgres:', err);
      }
    }
    return sale;
  }

  static async getDigitalSales(): Promise<DigitalSale[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(digitalSales);
        return results.map(r => ({
          ...r,
          status: r.status as any,
          createdAt: r.createdAt.toISOString()
        })) as DigitalSale[];
      } catch (err) {
        console.error('Erro ao buscar digital sales no Postgres:', err);
      }
    }
    return fallbackState.digitalSales || [];
  }

  static async clearHotmartTestData(): Promise<void> {
    if (fallbackState.platformConnections) {
      fallbackState.platformConnections = fallbackState.platformConnections.filter((c: any) => c.provider !== 'hotmart');
    }
    if (fallbackState.digitalSales) {
      fallbackState.digitalSales = fallbackState.digitalSales.filter((s: any) => s.provider !== 'hotmart');
    }
    await this.saveState({
      platformConnections: fallbackState.platformConnections || [],
      digitalSales: fallbackState.digitalSales || []
    });

    if (process.env.SQL_HOST) {
      try {
        const db = getDB();
        await db.delete(platformConnections).where(eq(platformConnections.provider, 'hotmart'));
        await db.delete(digitalSales).where(eq(digitalSales.provider, 'hotmart'));
      } catch (err) {
        console.error('Erro ao limpar dados de teste de Hotmart no Postgres:', err);
      }
    }
  }

  static async getCustomers(): Promise<Customer[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const dbCustomers = await db.select().from(customers);
        return dbCustomers.map(c => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone || '',
          purchases: c.purchases || 0,
          totalSpent: c.totalSpent || 0,
          lastPurchase: c.lastPurchase || '',
          createdAt: c.createdAt ? c.createdAt.toISOString() : ''
        }));
      } catch (err) {
        console.error('Erro ao buscar clientes no Postgres:', err);
      }
    }
    return fallbackState.customers || [];
  }

  static async upsertCustomer(data: { name: string; email: string; phone?: string; purchaseAmount: number }) {
    const email = data.email.toLowerCase().trim();
    const name = data.name;
    const phone = data.phone || '';
    const now = new Date().toISOString();

    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const existing = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
        if (existing.length > 0) {
          const cust = existing[0];
          const updatedPurchases = cust.purchases + 1;
          const updatedTotalSpent = cust.totalSpent + data.purchaseAmount;
          await db.update(customers).set({
            name,
            phone: phone || cust.phone || '',
            purchases: updatedPurchases,
            totalSpent: updatedTotalSpent,
            lastPurchase: now
          }).where(eq(customers.id, cust.id));
          return {
            id: cust.id,
            name,
            email,
            phone: phone || cust.phone || '',
            purchases: updatedPurchases,
            totalSpent: updatedTotalSpent,
            lastPurchase: now,
            createdAt: cust.createdAt ? cust.createdAt.toISOString() : now
          } as Customer;
        } else {
          const id = 'cust_' + Math.random().toString(36).substr(2, 9);
          await db.insert(customers).values({
            id,
            name,
            email,
            phone,
            purchases: 1,
            totalSpent: data.purchaseAmount,
            lastPurchase: now,
            createdAt: new Date()
          });
          return {
            id,
            name,
            email,
            phone,
            purchases: 1,
            totalSpent: data.purchaseAmount,
            lastPurchase: now,
            createdAt: now
          } as Customer;
        }
      } catch (err) {
        console.error('Erro ao upsert de cliente no Postgres:', err);
      }
    }

    // Fallback local JSON
    if (!fallbackState.customers) {
      fallbackState.customers = [];
    }
    const existingIdx = fallbackState.customers.findIndex(c => c.email.toLowerCase() === email);
    if (existingIdx >= 0) {
      const cust = fallbackState.customers[existingIdx];
      cust.name = name;
      if (phone) cust.phone = phone;
      cust.purchases += 1;
      cust.totalSpent += data.purchaseAmount;
      cust.lastPurchase = now;
      await this.saveState({ customers: fallbackState.customers });
      return cust;
    } else {
      const id = 'cust_' + Math.random().toString(36).substr(2, 9);
      const newCust: Customer = {
        id,
        name,
        email,
        phone,
        purchases: 1,
        totalSpent: data.purchaseAmount,
        lastPurchase: now,
        createdAt: now
      };
      fallbackState.customers.push(newCust);
      await this.saveState({ customers: fallbackState.customers });
      return newCust;
    }
  }

  // LAUNCH & SALES AUTOMATION ENGINE METHODS (ETAPA 19)
  static async getLaunches(): Promise<Launch[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(launches);
        return results.map(r => ({
          ...r,
          status: r.status as any,
          createdAt: r.createdAt.toISOString()
        }));
      } catch (err) {
        console.error('Erro ao buscar launches no Postgres:', err);
      }
    }
    return fallbackState.launches || [];
  }

  static async getLaunchById(id: string): Promise<Launch | null> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(launches).where(eq(launches.id, id));
        if (results.length > 0) {
          const r = results[0];
          return {
            ...r,
            status: r.status as any,
            createdAt: r.createdAt.toISOString()
          };
        }
      } catch (err) {
        console.error('Erro ao buscar launch por ID no Postgres:', err);
      }
    }
    return (fallbackState.launches || []).find(l => l.id === id) || null;
  }

  static async saveLaunch(launch: Launch): Promise<Launch> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const existing = await db.select().from(launches).where(eq(launches.id, launch.id));
        const values = {
          id: launch.id,
          productId: launch.productId,
          name: launch.name,
          strategy: launch.strategy,
          audience: launch.audience,
          startDate: launch.startDate,
          endDate: launch.endDate,
          budget: launch.budget,
          status: launch.status,
          createdAt: new Date(launch.createdAt),
          campaignName: launch.campaignName || null,
          goal: launch.goal || null,
          mainOffer: launch.mainOffer || null,
          suggestedPrice: launch.suggestedPrice || null,
          bonus: launch.bonus || null,
          mainMessage: launch.mainMessage || null,
          instagramChannel: launch.instagramChannel || null,
          facebookChannel: launch.facebookChannel || null,
          googleChannel: launch.googleChannel || null,
          emailChannel: launch.emailChannel || null,
          whatsAppChannel: launch.whatsAppChannel || null,
          timelinePreLaunch: launch.timelinePreLaunch || null,
          timelineWarmup: launch.timelineWarmup || null,
          timelineOpen: launch.timelineOpen || null,
          timelineSales: launch.timelineSales || null,
          timelinePostSales: launch.timelinePostSales || null,
          recommendations: launch.recommendations || null,
        };
        if (existing.length > 0) {
          await db.update(launches).set(values).where(eq(launches.id, launch.id));
        } else {
          await db.insert(launches).values(values);
        }
        return launch;
      } catch (err) {
        console.error('Erro ao salvar launch no Postgres:', err);
      }
    }
    if (!fallbackState.launches) fallbackState.launches = [];
    const idx = fallbackState.launches.findIndex(l => l.id === launch.id);
    if (idx >= 0) {
      fallbackState.launches[idx] = launch;
    } else {
      fallbackState.launches.push(launch);
    }
    await this.saveState({ launches: fallbackState.launches });
    return launch;
  }

  static async getCampaigns(): Promise<LaunchCampaign[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(campaigns);
        return results.map(r => ({
          ...r,
          platform: r.platform as any,
          createdAt: r.createdAt.toISOString()
        }));
      } catch (err) {
        console.error('Erro ao buscar campaigns no Postgres:', err);
      }
    }
    return fallbackState.campaigns || [];
  }

  static async saveCampaign(campaign: LaunchCampaign): Promise<LaunchCampaign> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const existing = await db.select().from(campaigns).where(eq(campaigns.id, campaign.id));
        const values = {
          id: campaign.id,
          launchId: campaign.launchId,
          name: campaign.name,
          platform: campaign.platform,
          status: campaign.status,
          budget: campaign.budget,
          spent: campaign.spent,
          clicks: campaign.clicks,
          conversions: campaign.conversions,
          revenue: campaign.revenue,
          adCopy: campaign.adCopy || null,
          creativeUrl: campaign.creativeUrl || null,
          createdAt: new Date(campaign.createdAt)
        };
        if (existing.length > 0) {
          await db.update(campaigns).set(values).where(eq(campaigns.id, campaign.id));
        } else {
          await db.insert(campaigns).values(values);
        }
        return campaign;
      } catch (err) {
        console.error('Erro ao salvar campaign no Postgres:', err);
      }
    }
    if (!fallbackState.campaigns) fallbackState.campaigns = [];
    const idx = fallbackState.campaigns.findIndex(c => c.id === campaign.id);
    if (idx >= 0) {
      fallbackState.campaigns[idx] = campaign;
    } else {
      fallbackState.campaigns.push(campaign);
    }
    await this.saveState({ campaigns: fallbackState.campaigns });
    return campaign;
  }

  static async getEmailSequences(): Promise<EmailSequence[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(emailSequences);
        return results.map(r => ({
          ...r,
          status: r.status as 'active' | 'inactive',
          createdAt: r.createdAt.toISOString()
        }));
      } catch (err) {
        console.error('Erro ao buscar email sequences no Postgres:', err);
      }
    }
    return fallbackState.emailSequences || [];
  }

  static async saveEmailSequence(seq: EmailSequence): Promise<EmailSequence> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const existing = await db.select().from(emailSequences).where(eq(emailSequences.id, seq.id));
        const values = {
          id: seq.id,
          launchId: seq.launchId,
          name: seq.name,
          triggerEvent: seq.triggerEvent,
          subject: seq.subject,
          body: seq.body,
          sentCount: seq.sentCount,
          openRate: seq.openRate,
          clickRate: seq.clickRate,
          status: seq.status,
          createdAt: new Date(seq.createdAt)
        };
        if (existing.length > 0) {
          await db.update(emailSequences).set(values).where(eq(emailSequences.id, seq.id));
        } else {
          await db.insert(emailSequences).values(values);
        }
        return seq;
      } catch (err) {
        console.error('Erro ao salvar email sequence no Postgres:', err);
      }
    }
    if (!fallbackState.emailSequences) fallbackState.emailSequences = [];
    const idx = fallbackState.emailSequences.findIndex(e => e.id === seq.id);
    if (idx >= 0) {
      fallbackState.emailSequences[idx] = seq;
    } else {
      fallbackState.emailSequences.push(seq);
    }
    await this.saveState({ emailSequences: fallbackState.emailSequences });
    return seq;
  }

  static async getMarketingEvents(): Promise<MarketingEvent[]> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const results = await db.select().from(marketingEvents);
        return results.map(r => ({
          ...r,
          eventType: r.eventType as any,
          status: r.status as any,
          createdAt: r.createdAt.toISOString()
        }));
      } catch (err) {
        console.error('Erro ao buscar marketing events no Postgres:', err);
      }
    }
    return fallbackState.marketingEvents || [];
  }

  static async saveMarketingEvent(event: MarketingEvent): Promise<MarketingEvent> {
    if (this.isPGAvailable()) {
      try {
        const db = getDB();
        const existing = await db.select().from(marketingEvents).where(eq(marketingEvents.id, event.id));
        const values = {
          id: event.id,
          launchId: event.launchId,
          eventType: event.eventType,
          title: event.title,
          description: event.description,
          channel: event.channel || null,
          status: event.status,
          createdAt: new Date(event.createdAt)
        };
        if (existing.length > 0) {
          await db.update(marketingEvents).set(values).where(eq(marketingEvents.id, event.id));
        } else {
          await db.insert(marketingEvents).values(values);
        }
        return event;
      } catch (err) {
        console.error('Erro ao salvar marketing event no Postgres:', err);
      }
    }
    if (!fallbackState.marketingEvents) fallbackState.marketingEvents = [];
    const idx = fallbackState.marketingEvents.findIndex(m => m.id === event.id);
    if (idx >= 0) {
      fallbackState.marketingEvents[idx] = event;
    } else {
      fallbackState.marketingEvents.push(event);
    }
    await this.saveState({ marketingEvents: fallbackState.marketingEvents });
    return event;
  }
}

