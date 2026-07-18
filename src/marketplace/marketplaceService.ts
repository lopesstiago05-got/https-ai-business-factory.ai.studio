import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { 
  MarketplaceAgent, 
  BusinessTemplate, 
  UserMarketplaceState, 
  MarketplaceAnalytics, 
  MarketplaceRecommendation,
  PlanType
} from './types.ts';
import { INITIAL_CATALOG, INITIAL_TEMPLATES } from './catalog.ts';
import { Repository } from '../db/repository.ts';
import { AgentManager } from '../agents/orchestrator.ts';
import { SupervisorAgent } from '../agents/supervisor.ts';
import { logInfo, logWarn, logError } from '../logs/logger.ts';
import { ModelManager } from '../kernel/ModelManager.ts';

const MARKETPLACE_DB_FILE = path.join(process.cwd(), 'marketplace_db.json');

// Definição dos limites por plano comercial
export const PLAN_LIMITS: Record<PlanType, { maxAgents: number; maxExecutions: number; aiCredits: number }> = {
  FREE: { maxAgents: 2, maxExecutions: 100, aiCredits: 50 },
  PRO: { maxAgents: 5, maxExecutions: 1000, aiCredits: 500 },
  BUSINESS: { maxAgents: 10, maxExecutions: 5000, aiCredits: 2000 },
  ENTERPRISE: { maxAgents: 999, maxExecutions: 999999, aiCredits: 999999 }
};

export class MarketplaceService {
  private static getAI(): GoogleGenAI | null {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      logWarn('[MarketplaceService] GEMINI_API_KEY não configurada. IA de Recomendação usará modo estático de fallback.');
      return null;
    }
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }

  /**
   * Carrega o estado atualizado do Marketplace do usuário.
   * Se não existir, gera o estado inicial padrão (FREE).
   */
  public static async getState(): Promise<UserMarketplaceState> {
    let state: UserMarketplaceState;
    try {
      if (fs.existsSync(MARKETPLACE_DB_FILE)) {
        const content = fs.readFileSync(MARKETPLACE_DB_FILE, 'utf-8');
        state = JSON.parse(content) as UserMarketplaceState;
      } else {
        state = {
          installedAgentIds: [],
          activeAgentIds: [],
          pausedAgentIds: [],
          installedTemplateIds: [],
          plan: {
            currentPlan: 'FREE',
            maxAgents: 2,
            maxExecutions: 10,
            availableCredits: 50,
            usedExecutions: 3,
            usedCredits: 12
          },
          agentRatings: {},
          agentUsageHistory: [
            { agentId: 'mp_social_media', timestamp: new Date().toISOString(), action: 'INITIAL_DISCOVERY' }
          ]
        };
      }
    } catch (err: any) {
      logError(`[MarketplaceService] Erro ao ler banco do Marketplace: ${err.message}`);
      state = {
        installedAgentIds: [],
        activeAgentIds: [],
        pausedAgentIds: [],
        installedTemplateIds: [],
        plan: {
          currentPlan: 'FREE',
          maxAgents: 2,
          maxExecutions: 10,
          availableCredits: 50,
          usedExecutions: 3,
          usedCredits: 12
        },
        agentRatings: {},
        agentUsageHistory: []
      };
    }

    // Alinha os limites e planos do marketplace dinamicamente com o tenant atual
    try {
      const { TenantService } = await import('../tenant/tenantService.ts');
      const tenantService = TenantService.getInstance();
      const currentTenantId = tenantService.getCurrentTenantId();
      const tenant = tenantService.getTenantById(currentTenantId);
      if (tenant) {
        state.plan = {
          currentPlan: tenant.currentPlan as any,
          maxAgents: tenant.maxAgents,
          maxExecutions: tenant.maxExecutions,
          availableCredits: tenant.availableCredits,
          usedExecutions: tenant.usedExecutions,
          usedCredits: tenant.usedCredits
        };
      }
    } catch (err) {
      // Ignora erro se import der problema durante boot inicial
    }

    return state;
  }

  /**
   * Salva o estado do Marketplace
   */
  public static async saveState(state: UserMarketplaceState): Promise<void> {
    try {
      fs.writeFileSync(MARKETPLACE_DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err: any) {
      logError(`[MarketplaceService] Erro ao salvar banco do Marketplace: ${err.message}`);
    }
  }

  /**
   * Retorna o catálogo dinâmico de agentes com o status atualizado do usuário
   */
  public static async getCatalog(): Promise<MarketplaceAgent[]> {
    const state = await this.getState();
    return INITIAL_CATALOG.map(agent => {
      let status: MarketplaceAgent['status'] = 'AVAILABLE';
      if (state.activeAgentIds.includes(agent.id)) {
        status = 'ACTIVE';
      } else if (state.pausedAgentIds.includes(agent.id)) {
        status = 'PAUSED';
      } else if (state.installedAgentIds.includes(agent.id)) {
        status = 'INSTALLED';
      }
      return { ...agent, status };
    });
  }

  /**
   * Retorna a lista de templates comerciais
   */
  public static async getTemplates(): Promise<BusinessTemplate[]> {
    return INITIAL_TEMPLATES;
  }

  /**
   * Instala um novo agente de IA se respeitar os limites do plano
   */
  public static async installAgent(agentId: string): Promise<{ success: boolean; message: string; state?: UserMarketplaceState }> {
    const state = await this.getState();
    const catalog = await this.getCatalog();
    const agent = catalog.find(a => a.id === agentId);

    if (!agent) {
      return { success: false, message: 'Agente não encontrado no catálogo.' };
    }

    if (state.installedAgentIds.includes(agentId)) {
      return { success: false, message: 'Agente já está instalado no workspace.' };
    }

    // Validar limite de agentes instalados/ativos para o plano
    const currentActiveCount = state.activeAgentIds.length + state.pausedAgentIds.length;
    if (currentActiveCount >= state.plan.maxAgents) {
      // Disparar evento de oportunidade de upgrade ao Customer Success
      await this.trackCSEvent('UPGRADE_RECOMMENDED', {
        agentId,
        reason: 'Limite de agentes ativos/instalados excedido para o plano atual.'
      });

      return { 
        success: false, 
        message: `Limite de agentes excedido para o seu plano ${state.plan.currentPlan} (${state.plan.maxAgents} agentes). Faça upgrade para continuar.` 
      };
    }

    // Instalar agente
    state.installedAgentIds.push(agentId);
    state.agentUsageHistory.push({
      agentId,
      timestamp: new Date().toISOString(),
      action: 'INSTALL'
    });

    await this.saveState(state);

    // Integrar e registrar agente diretamente no Orchestrator AgentManager
    try {
      await AgentManager.createAgent({
        id: agent.id,
        name: agent.name,
        role: `Especialista em ${agent.category.toUpperCase()}`,
        status: 'idle',
        description: agent.description
      }).catch((e) => {
        // Se já existir no orchestrator, apenas atualizamos
        logWarn(`[MarketplaceService] Agente já registrado no Orchestrator: ${e.message}`);
      });
    } catch (e: any) {
      logError(`[MarketplaceService] Falha ao registrar agente no Orchestrator: ${e.message}`);
    }

    // Disparar evento para Customer Success & Alertas do Supervisor
    await this.trackCSEvent('AGENT_INSTALLED', { agentId, agentName: agent.name });
    await SupervisorAgent.triggerAlert(
      'info',
      `Novo agente de IA instalado com sucesso: ${agent.name} (${agent.category.toUpperCase()})`,
      'Marketplace Engine',
      agentId,
      'Acompanhar as primeiras ativações do agente no workspace.'
    );

    return { success: true, message: `Agente ${agent.name} instalado com sucesso!`, state };
  }

  /**
   * Altera o status operacional de um agente instalado (Ativar/Pausar/Desativar)
   */
  public static async updateAgentStatus(agentId: string, action: 'ACTIVATE' | 'PAUSE' | 'UNINSTALL'): Promise<{ success: boolean; message: string; state?: UserMarketplaceState }> {
    const state = await this.getState();
    const catalog = await this.getCatalog();
    const agent = catalog.find(a => a.id === agentId);

    if (!agent) {
      return { success: false, message: 'Agente não encontrado.' };
    }

    if (action === 'ACTIVATE') {
      if (!state.installedAgentIds.includes(agentId)) {
        return { success: false, message: 'Instale o agente antes de ativá-lo.' };
      }

      // Validar limites se estiver ativando
      const activeCount = state.activeAgentIds.length;
      if (activeCount >= state.plan.maxAgents) {
        await this.trackCSEvent('UPGRADE_REQUIRED', { agentId, reason: 'Tentativa de ativação excedendo limite.' });
        return { success: false, message: `Limite de agentes ativos excedido para o seu plano ${state.plan.currentPlan} (Máximo: ${state.plan.maxAgents} agentes). Faça upgrade no Meu Workspace para continuar.` };
      }

      if (!state.activeAgentIds.includes(agentId)) {
        state.activeAgentIds.push(agentId);
        state.pausedAgentIds = state.pausedAgentIds.filter(id => id !== agentId);
        
        // Atualizar status no Core Orchestrator
        await AgentManager.changeAgentStatus(agentId, 'idle').catch(() => {});

        // Registrar uso e evento de Sucesso
        state.agentUsageHistory.push({ agentId, timestamp: new Date().toISOString(), action: 'ACTIVATE' });
        await this.trackCSEvent('AGENT_ACTIVATED', { agentId, agentName: agent.name });
      }
    } else if (action === 'PAUSE') {
      if (state.activeAgentIds.includes(agentId)) {
        state.activeAgentIds = state.activeAgentIds.filter(id => id !== agentId);
        if (!state.pausedAgentIds.includes(agentId)) {
          state.pausedAgentIds.push(agentId);
        }

        // Atualizar status no Core Orchestrator
        await AgentManager.changeAgentStatus(agentId, 'paused').catch(() => {});

        state.agentUsageHistory.push({ agentId, timestamp: new Date().toISOString(), action: 'PAUSE' });
      }
    } else if (action === 'UNINSTALL') {
      state.installedAgentIds = state.installedAgentIds.filter(id => id !== agentId);
      state.activeAgentIds = state.activeAgentIds.filter(id => id !== agentId);
      state.pausedAgentIds = state.pausedAgentIds.filter(id => id !== agentId);

      // Parar no Core Orchestrator
      await AgentManager.changeAgentStatus(agentId, 'idle').catch(() => {});

      state.agentUsageHistory.push({ agentId, timestamp: new Date().toISOString(), action: 'UNINSTALL' });
    }

    await this.saveState(state);
    return { success: true, message: `Status de ${agent.name} atualizado com sucesso.`, state };
  }

  /**
   * Ativa um template de negócios completo, instalando e ativando todos os agentes inclusos
   */
  public static async activateTemplate(templateId: string): Promise<{ success: boolean; message: string; state?: UserMarketplaceState }> {
    const templates = await this.getTemplates();
    const template = templates.find(t => t.id === templateId);

    if (!template) {
      return { success: false, message: 'Template de negócios não encontrado.' };
    }

    const state = await this.getState();
    
    // Verifica limites gerais
    const neededAgents = template.agentsIncluded.length;
    const currentActive = state.activeAgentIds.length;
    if (currentActive + neededAgents > state.plan.maxAgents) {
      await this.trackCSEvent('UPGRADE_RECOMMENDED', { templateId, reason: 'Ativação de template excede limites.' });
      return { 
        success: false, 
        message: `Ativar este template requer ${neededAgents} agentes de IA ativos. Seu plano atual ${state.plan.currentPlan} possui limite de apenas ${state.plan.maxAgents}. Faça upgrade para o PRO ou Business.` 
      };
    }

    // Instala e ativa todos os agentes do template
    for (const agentId of template.agentsIncluded) {
      if (!state.installedAgentIds.includes(agentId)) {
        state.installedAgentIds.push(agentId);
        
        // Registra no Orchestrator se necessário
        const catalogAgent = INITIAL_CATALOG.find(a => a.id === agentId);
        if (catalogAgent) {
          await AgentManager.createAgent({
            id: catalogAgent.id,
            name: catalogAgent.name,
            role: `Especialista em ${catalogAgent.category.toUpperCase()}`,
            status: 'idle',
            description: catalogAgent.description
          }).catch(() => {});
        }
      }

      if (!state.activeAgentIds.includes(agentId)) {
        state.activeAgentIds.push(agentId);
        state.pausedAgentIds = state.pausedAgentIds.filter(id => id !== agentId);
        await AgentManager.changeAgentStatus(agentId, 'idle').catch(() => {});
      }
    }

    if (!state.installedTemplateIds.includes(templateId)) {
      state.installedTemplateIds.push(templateId);
    }

    state.agentUsageHistory.push({
      agentId: `template_${templateId}`,
      timestamp: new Date().toISOString(),
      action: 'ACTIVATE_TEMPLATE'
    });

    await this.saveState(state);

    // Alerta de sucesso no Supervisor
    await SupervisorAgent.triggerAlert(
      'high',
      `Template de Negócios '${template.name}' ativado com sucesso! ${neededAgents} agentes foram configurados e integrados.`,
      'Marketplace Template Engine',
      undefined,
      'Acompanhar a orquestração integrada da esteira do template de negócios.'
    );

    return { success: true, message: `Template ${template.name} ativado com sucesso!`, state };
  }

  /**
   * Altera o plano de serviços (simulação de cobrança / upgrade)
   */
  public static async updatePlan(plan: PlanType): Promise<{ success: boolean; state: UserMarketplaceState }> {
    const state = await this.getState();
    const limits = PLAN_LIMITS[plan];

    state.plan = {
      currentPlan: plan,
      maxAgents: limits.maxAgents,
      maxExecutions: limits.maxExecutions,
      availableCredits: limits.aiCredits,
      usedExecutions: state.plan.usedExecutions,
      usedCredits: state.plan.usedCredits
    };

    state.agentUsageHistory.push({
      agentId: 'system',
      timestamp: new Date().toISOString(),
      action: `PLAN_UPGRADE_${plan}`
    });

    await this.saveState(state);

    // Alerta do Supervisor
    await SupervisorAgent.triggerAlert(
      'info',
      `Upgrade de plano efetuado para: ${plan}. Limites expandidos para ${limits.maxAgents} agentes e ${limits.maxExecutions} execuções.`,
      'Marketplace Billing',
      undefined,
      'Monitorar uso da nova cota do usuário.'
    );

    return { success: true, state };
  }

  /**
   * Registra avaliação de um agente instalado
   */
  public static async rateAgent(agentId: string, rating: number, review?: string): Promise<UserMarketplaceState> {
    const state = await this.getState();
    state.agentRatings[agentId] = { rating, review };
    await this.saveState(state);
    return state;
  }

  /**
   * Retorna relatórios consolidados do Marketplace para o painel administrativo
   */
  public static async getAnalytics(): Promise<MarketplaceAnalytics> {
    const state = await this.getState();
    const catalog = await this.getCatalog();

    const installedCount = state.installedAgentIds.length;
    const activeCount = state.activeAgentIds.length;

    // Calcula os mais usados (maior contagem de execuções históricas + logs de uso do usuário)
    const usageCounts: Record<string, number> = {};
    for (const hist of state.agentUsageHistory) {
      if (hist.agentId && hist.agentId.startsWith('mp_')) {
        usageCounts[hist.agentId] = (usageCounts[hist.agentId] || 0) + 1;
      }
    }

    const mostUsedAgents = catalog
      .map(agent => ({
        agentId: agent.id,
        name: agent.name,
        count: agent.executionCount + (usageCounts[agent.id] || 0) * 10
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const popularTemplates = INITIAL_TEMPLATES
      .map(t => ({
        templateId: t.id,
        name: t.name,
        count: t.popularity + (state.installedTemplateIds.includes(t.id) ? 25 : 0)
      }))
      .sort((a, b) => b.count - a.count);

    const activationRate = installedCount > 0 
      ? Math.round((activeCount / installedCount) * 100) 
      : 0;

    return {
      totalInstalled: installedCount,
      mostUsedAgents,
      popularTemplates,
      activationRate,
      conversionRate: state.plan.currentPlan !== 'FREE' ? 40 : 15
    };
  }

  /**
   * MarketplaceRecommendationAI: Motor Inteligente Gemini para recomendar agentes e templates
   */
  public static async recommend(
    sector: string,
    objectives: string,
    businessSize: string,
    problems: string
  ): Promise<MarketplaceRecommendation> {
    const ai = this.getAI();
    const catalog = await this.getCatalog();
    const templates = await this.getTemplates();

    const formattedCatalog = catalog.map(a => `- ${a.id}: ${a.name} (${a.category}) - ${a.description}`).join('\n');
    const formattedTemplates = templates.map(t => `- ${t.id}: ${t.name} (Incliui: ${t.agentsIncluded.join(', ')}) - ${t.description}`).join('\n');

    const systemPrompt = `Você é a IA MarketplaceRecommendationAI do AI Business Factory.
Sua missão é analisar o perfil do negócio do cliente e recomendar os melhores Agentes de IA e Templates prontos disponíveis no nosso catálogo para impulsionar os resultados dele.

Nosso Catálogo de Agentes:
${formattedCatalog}

Nossos Templates Disponíveis:
${formattedTemplates}

Você DEVE estruturar sua resposta exclusivamente no formato JSON com as seguintes chaves:
{
  "recommendedAgentIds": ["lista", "de", "ids", "de", "agentes"],
  "recommendedTemplateIds": ["lista", "de", "ids", "de", "templates"],
  "nextActions": ["ação prática 1", "ação prática 2", "ação prática 3"],
  "reasoning": "Texto explicativo profissional e persuasivo, com até 4 parágrafos pequenos detalhando os motivos das recomendações, como elas ajudam nas dores informadas e quais benefícios de negócio o cliente obterá de imediato."
}
Apenas retorne o JSON válido, sem tags markdown adicionais (como \`\`\`json) se possível, ou retorne em formato de string JSON limpa.`;

    const userPrompt = `Perfil do Negócio:
- Segmento/Setor: ${sector}
- Objetivos de Negócio: ${objectives}
- Tamanho/Fase da Empresa: ${businessSize}
- Maiores Desafios e Problemas Atuais: ${problems}`;

    if (ai) {
      try {
        const modelName = ModelManager.getModelName();
        const response = await ModelManager.generateContent('marketplace_recommendation', ai, {
          model: modelName,
          contents: `${systemPrompt}\n\n${userPrompt}`,
          generationConfig: {
            responseMimeType: 'application/json'
          }
        });

        const text = response.text || '';
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const result = JSON.parse(cleanJson);

        return {
          recommendedAgentIds: Array.isArray(result.recommendedAgentIds) ? result.recommendedAgentIds : [],
          recommendedTemplateIds: Array.isArray(result.recommendedTemplateIds) ? result.recommendedTemplateIds : [],
          nextActions: Array.isArray(result.nextActions) ? result.nextActions : [],
          reasoning: result.reasoning || 'Recomendação gerada com sucesso.'
        };
      } catch (err: any) {
        logError(`[MarketplaceService] Erro ao chamar Gemini para recomendação: ${err.message}`);
      }
    }

    // Fallback Heurístico Estático de Alta Qualidade caso Gemini falhe ou não esteja configurado
    logWarn('[MarketplaceService] Executando recomendação heurística estática.');
    const recommendedAgentIds: string[] = [];
    const recommendedTemplateIds: string[] = [];
    const nextActions: string[] = [];
    let reasoning = '';

    const problemsLower = problems.toLowerCase();
    const objectivesLower = objectives.toLowerCase();

    if (problemsLower.includes('venda') || problemsLower.includes('cliente') || objectivesLower.includes('vender') || objectivesLower.includes('lead')) {
      recommendedAgentIds.push('mp_sales_closer', 'mp_lead_qualifier');
      recommendedTemplateIds.push('tpl_ecommerce');
      nextActions.push('Ativar o template E-commerce Starter para estruturar seu marketing e vendas.', 'Integrar o Sales Closer Agent com o seu WhatsApp para contorno automático de objeções.');
      reasoning = 'Analisamos que seu negócio necessita de uma aceleração agressiva de conversões. Recomendamos a estruturação de um funil automatizado focado em qualificação e fechamento com o Sales Closer Agent, liberando seu time para negociações complexas.';
    } else if (problemsLower.includes('marketing') || problemsLower.includes('anúncio') || problemsLower.includes('divulgar') || problemsLower.includes('tráfego')) {
      recommendedAgentIds.push('mp_ads_optimizer', 'mp_copywriter', 'mp_social_media');
      recommendedTemplateIds.push('tpl_local_business');
      nextActions.push('Ativar o template Local Business Growth.', 'Configurar o Ads Optimizer Agent para auditar suas campanhas ativas e otimizar ROAS.');
      reasoning = 'Para impulsionar sua visibilidade digital e atração de clientes qualificados, a recomendação ideal foca em marketing integrado de alta performance. Os agentes especializados criarão copies de conversão irresistíveis e gerenciarão seus lances de anúncios de forma otimizada.';
    } else {
      // Padrão geral de negócios
      recommendedAgentIds.push('mp_business_plan', 'mp_competitor_analysis');
      recommendedTemplateIds.push('tpl_infoproduct');
      nextActions.push('Ativar o Business Plan Agent para reestruturar seu plano estratégico.', 'Rodar uma varredura competitiva com o Competitor Analysis Agent.');
      reasoning = 'Recomendamos uma análise competitiva de alta precisão aliada a uma revisão do seu plano de negócios. Compreender onde seus concorrentes erram lhe dará a vantagem necessária para capturar fatias valiosas de mercado.';
    }

    if (nextActions.length === 0) {
      nextActions.push('Ativar o template E-commerce Starter.', 'Explorar o catálogo de agentes de marketing.');
    }

    return {
      recommendedAgentIds,
      recommendedTemplateIds,
      nextActions,
      reasoning
    };
  }

  /**
   * Integração com Customer Success - Dispara eventos que atualizam o CustomerSuccessAgent
   */
  private static async trackCSEvent(eventType: 'AGENT_INSTALLED' | 'AGENT_ACTIVATED' | 'AGENT_UNUSED' | 'UPGRADE_RECOMMENDED' | 'UPGRADE_REQUIRED', metadata: any): Promise<void> {
    try {
      const eventId = `mpevt_${Math.random().toString(36).substr(2, 9)}`;
      
      // Salva evento na tabela de eventos de marketing/plataforma
      await Repository.saveMarketingEvent({
        id: eventId,
        launchId: 'customer_success_central',
        eventType: 'ad_created', // reusamos os tipos aceitos no esquema
        title: `Marketplace - ${eventType}`,
        description: `Evento de Marketplace disparado: ${eventType}. Detalhes: ${JSON.stringify(metadata)}`,
        channel: 'whatsapp_email',
        status: 'success',
        createdAt: new Date().toISOString()
      });

      logInfo(`[MarketplaceService] Evento de Sucesso do Cliente registrado: ${eventType}`);
    } catch (err: any) {
      logWarn(`[MarketplaceService] Erro ao registrar evento no Customer Success: ${err.message}`);
    }
  }
}
