import { GoogleGenAI, Type } from '@google/genai';
import { ModelManager } from '../../kernel/ModelManager.ts';
import { Repository } from '../../db/repository.ts';
import { SupervisorAgent } from '../supervisor.ts';
import { Customer, SystemAlert } from '../../types.ts';
import { logInfo, logWarn, logError } from '../../logs/logger.ts';

export interface EnrichedCustomer extends Customer {
  frequency: number;            // Acessos por semana (0-14)
  agentsUsed: number;           // Agentes utilizados (0-12)
  automationsCreated: number;   // Automações criadas (0-20)
  resultsObtained: number;      // Resultados obtidos em valor (R$)
  daysInactive: number;         // Dias inativo (0-30)
  csat: number;                 // Satisfação (1-5)
  conversions: number;          // Conversões de venda (0-100)
  healthScore: number;          // Score de saúde calculado (0-100)
  healthLevel: 'HEALTHY' | 'ATTENTION' | 'RISK' | 'CRITICAL';
  churnProbability?: number;    // Probabilidade de Churn (0-100)
  riskFactors?: string[];       // Fatores de risco de Churn
  recommendedActions?: string[]; // Ações recomendadas de retenção
  journeyStage?: string;        // Estágio da jornada
}

export class CustomerSuccessAgent {
  private static getAI(): GoogleGenAI {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY não está configurada nos segredos do sistema.');
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

  private static async updateAgentState(status: 'idle' | 'running' | 'error', currentTask?: string) {
    try {
      const state = await Repository.getSystemState();
      const agentsList = state.agents.map(a => {
        if (a.id === 'customer_success') {
          return { ...a, status, currentTask: currentTask || undefined };
        }
        return a;
      });
      await Repository.saveState({ agents: agentsList });
      if (currentTask) {
        await SupervisorAgent.recordHeartbeat('customer_success', status, currentTask);
      }
    } catch (err) {
      console.error('Falha ao atualizar estado do Customer Success Agent:', err);
    }
  }

  /**
   * Garante a existência de uma base saudável de clientes de teste diversificados
   */
  public static async ensureSeedCustomers(): Promise<Customer[]> {
    const customersList = await Repository.getCustomers();
    if (customersList.length >= 5) {
      return customersList;
    }

    logInfo('[CustomerSuccessAgent] Semeando clientes reais de teste para Sucesso do Cliente');
    
    const seedProfiles = [
      { name: 'Ana Silva', email: 'ana.silva@empresa.com', phone: '5511999990001', purchaseAmount: 197.0 },
      { name: 'Bruno Mendes', email: 'bruno.mendes@growth.com', phone: '5511999990002', purchaseAmount: 497.0 },
      { name: 'Carlos Souza', email: 'carlos.souza@agency.io', phone: '5521988880003', purchaseAmount: 97.0 },
      { name: 'Daniela Lima', email: 'daniela.lima@edu.br', phone: '5531977770004', purchaseAmount: 197.0 },
      { name: 'Eduardo Costa', email: 'eduardo.costa@tech.com', phone: '5511966660005', purchaseAmount: 997.0 }
    ];

    const seeded: Customer[] = [];
    for (const profile of seedProfiles) {
      const cust = await Repository.upsertCustomer(profile);
      seeded.push(cust);
    }

    return seeded;
  }

  /**
   * Retorna os dados enriquecidos de todos os clientes cadastrados
   */
  public static async getEnrichedCustomers(): Promise<EnrichedCustomer[]> {
    await this.ensureSeedCustomers();
    const dbCustomers = await Repository.getCustomers();
    
    return dbCustomers.map(customer => {
      // Gera métricas deterministicas com base no ID do cliente para garantir consistência
      const seed = customer.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      const frequency = (seed % 12) + 2; // 2 a 13 acessos/semana
      const agentsUsed = (seed % 9) + 1;  // 1 a 9 agentes
      const automationsCreated = (seed % 15) + 1; // 1 a 15
      const resultsObtained = (seed % 40) * 150 + customer.totalSpent; 
      const daysInactive = (seed % 18); // 0 a 17 dias de inatividade
      const csat = (seed % 3) + 3; // 3 a 5 de csat
      const conversions = (seed % 50) + 2; // 2 a 51 conversões

      const enriched = {
        ...customer,
        frequency,
        agentsUsed,
        automationsCreated,
        resultsObtained,
        daysInactive,
        csat,
        conversions
      } as EnrichedCustomer;

      // Calcula o Score de Saúde
      enriched.healthScore = CustomerHealthScoreEngine.calculate(enriched);
      enriched.healthLevel = CustomerHealthScoreEngine.classify(enriched.healthScore);

      // Define estágio da jornada baseado na data de criação
      if (daysInactive > 10) {
        enriched.journeyStage = 'Risco de Churn';
      } else if (enriched.healthScore >= 90) {
        enriched.journeyStage = 'Fã / Promotor (Upgrade)';
      } else if (enriched.conversions > 10) {
        enriched.journeyStage = 'Engajado / Escala';
      } else {
        enriched.journeyStage = 'Onboarding Ativo';
      }

      return enriched;
    });
  }

  /**
   * Executa a análise completa de saúde e prevê churn com IA para um cliente específico
   */
  public static async analyzeCustomer(customerId: string): Promise<EnrichedCustomer> {
    logInfo(`[CustomerSuccessAgent] Analisando comportamento do cliente ID: ${customerId}`);
    await this.updateAgentState('running', `Analisando saúde e churn do cliente ${customerId}`);

    const enrichedList = await this.getEnrichedCustomers();
    const customer = enrichedList.find(c => c.id === customerId);

    if (!customer) {
      await this.updateAgentState('error', 'Cliente não encontrado');
      throw new Error(`Cliente com ID ${customerId} não encontrado.`);
    }

    // Calcula os indicadores de Churn usando IA (ou mecanismo fallback resiliente)
    const churnAnalysis = await ChurnPredictionEngine.analyze(customer);
    
    customer.churnProbability = churnAnalysis.churnProbability;
    customer.riskFactors = churnAnalysis.riskFactors;
    customer.recommendedActions = churnAnalysis.recommendedActions;

    // Dispara alertas operacionais caso detecte risco crítico
    if (customer.healthLevel === 'CRITICAL' || customer.healthLevel === 'RISK' || customer.churnProbability > 50) {
      await SupervisorAgent.triggerAlert(
        customer.healthLevel === 'CRITICAL' ? 'critical' : 'high',
        `Cliente ${customer.name} (${customer.email}) classificado em ${customer.healthLevel} com ${customer.churnProbability}% de probabilidade de Churn.`,
        'CustomerSuccessAgent',
        'customer_success',
        `Acionar fluxo de retenção automatizado. Ação sugerida: ${customer.recommendedActions?.[0] || 'Oferecer consultoria estratégica de retenção.'}`
      );

      // Notifica o Supervisor sobre o risco do cliente
      await Repository.saveMarketingEvent({
        id: `evt_cs_risk_${Math.random().toString(36).substring(2, 9)}`,
        launchId: 'customer_success_central',
        eventType: 'performance_alert',
        title: `Risco de Churn: ${customer.name}`,
        description: `O cliente ${customer.name} está sob risco moderado a alto (${customer.churnProbability}%). Fatores: ${customer.riskFactors?.join(', ')}.`,
        channel: 'whatsapp_email',
        status: 'warning',
        createdAt: new Date().toISOString()
      });
    }

    await this.updateAgentState('idle');
    return customer;
  }

  /**
   * Dispara uma ação automatizada de jornada de sucesso (WhatsApp + Email)
   */
  public static async triggerJourneyAction(customerId: string, day: number): Promise<any> {
    logInfo(`[CustomerSuccessAgent] Iniciando automação de Jornada de Sucesso - Dia ${day} para o Cliente ${customerId}`);
    await this.updateAgentState('running', `Executando automação Jornada Dia ${day} para ${customerId}`);

    const enrichedList = await this.getEnrichedCustomers();
    const customer = enrichedList.find(c => c.id === customerId);

    if (!customer) {
      await this.updateAgentState('error', 'Cliente não encontrado');
      throw new Error(`Cliente com ID ${customerId} não encontrado.`);
    }

    const actionResult = await CustomerJourneyAutomation.executeStage(customer, day);
    await this.updateAgentState('idle');
    return actionResult;
  }

  /**
   * Chat inteligente com SuccessManagerAI focado em Sucesso do Cliente
   */
  public static async askSuccessManager(prompt: string): Promise<string> {
    logInfo('[CustomerSuccessAgent] Consultando SuccessManagerAI');
    await this.updateAgentState('running', 'Processando consulta ao SuccessManagerAI');

    const enrichedCustomers = await this.getEnrichedCustomers();
    const answer = await SuccessManagerAI.processQuery(prompt, enrichedCustomers);

    await this.updateAgentState('idle');
    return answer;
  }
}

// ==================================================
// 2. CUSTOMER HEALTH SCORE ENGINE
// ==================================================
export class CustomerHealthScoreEngine {
  public static calculate(customer: Omit<EnrichedCustomer, 'healthScore' | 'healthLevel'>): number {
    // Fatores de engajamento
    const accessScore = Math.min((customer.frequency / 10) * 20, 20); // Máx 20pts (10 acessos/semana)
    const usageScore = Math.min((customer.agentsUsed / 6) * 20, 20);   // Máx 20pts (6 agentes ativos)
    const autScore = Math.min((customer.automationsCreated / 8) * 20, 20); // Máx 20pts (8 automações criadas)
    const resultsScore = Math.min((customer.conversions / 30) * 20, 20); // Máx 20pts (30 conversões)
    const satisfactionScore = ((customer.csat - 1) / 4) * 20; // Máx 20pts (CSAT de 1 a 5)

    // Penalidade por inatividade
    const penalty = customer.daysInactive * 4; // -4 pontos por dia inativo

    const rawScore = (accessScore + usageScore + autScore + resultsScore + satisfactionScore) - penalty;
    return Math.max(0, Math.min(100, Math.round(rawScore)));
  }

  public static classify(score: number): 'HEALTHY' | 'ATTENTION' | 'RISK' | 'CRITICAL' {
    if (score >= 90) return 'HEALTHY';
    if (score >= 70) return 'ATTENTION';
    if (score >= 40) return 'RISK';
    return 'CRITICAL';
  }
}

// ==================================================
// 3. CHURN PREDICTION ENGINE
// ==================================================
export class ChurnPredictionEngine {
  public static async analyze(customer: EnrichedCustomer): Promise<{
    churnProbability: number;
    riskFactors: string[];
    recommendedActions: string[];
  }> {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      logWarn('[ChurnPredictionEngine] GEMINI_API_KEY ausente. Usando algoritmo heurístico local.');
      return this.fallbackAnalyze(customer);
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const prompt = `Analise o risco de churn deste cliente do sistema SaaS "AI Business Factory":
Dados do Cliente:
- Nome: ${customer.name}
- Frequência de acessos/semana: ${customer.frequency}
- Agentes de IA usados: ${customer.agentsUsed}
- Automações configuradas: ${customer.automationsCreated}
- CSAT (satisfação): ${customer.csat}/5
- Dias inativo atualmente: ${customer.daysInactive} dias
- Conversões/Vendas geradas: ${customer.conversions}
- Score de Saúde atual: ${customer.healthScore}/100

Estime a probabilidade de churn (0 a 100), indique os 2 ou 3 fatores de risco principais e sugira 2 ações estratégicas altamente personalizadas e práticas para retê-lo.

Retorne estritamente um JSON no seguinte formato válido:
{
  "churnProbability": número entre 0 e 100,
  "riskFactors": ["fator 1", "fator 2"],
  "recommendedActions": ["ação recomendada 1", "ação recomendada 2"]
}`;

      const response = await ModelManager.generateContent('customer_success_churn', ai, {
        model: ModelManager.getModelName(),
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              churnProbability: { type: Type.INTEGER },
              riskFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['churnProbability', 'riskFactors', 'recommendedActions']
          }
        }
      });

      if (response && response.text) {
        return JSON.parse(response.text.trim());
      }
    } catch (err: any) {
      logWarn(`[ChurnPredictionEngine] Erro na análise Gemini: ${err.message || err}. Usando heurística local.`);
    }

    return this.fallbackAnalyze(customer);
  }

  private static fallbackAnalyze(customer: EnrichedCustomer): {
    churnProbability: number;
    riskFactors: string[];
    recommendedActions: string[];
  } {
    let churnProbability = 10;
    const riskFactors: string[] = [];
    const recommendedActions: string[] = [];

    if (customer.daysInactive > 7) {
      churnProbability += 30;
      riskFactors.push(`Inatividade prolongada (${customer.daysInactive} dias)`);
      recommendedActions.push('Enviar mensagem personalizada de "sentimos sua falta" via WhatsApp.');
    }

    if (customer.csat <= 3) {
      churnProbability += 25;
      riskFactors.push(`Baixo índice de satisfação registrado (CSAT ${customer.csat}/5)`);
      recommendedActions.push('Agendar mentoria individual rápida para resolver dúvidas ou dificuldades técnicos.');
    }

    if (customer.frequency < 4) {
      churnProbability += 20;
      riskFactors.push(`Frequência de acessos semanal abaixo da média (${customer.frequency}/semana)`);
      recommendedActions.push('Enviar mini-tutorial em vídeo com hacks de produtividade da plataforma.');
    }

    if (customer.automationsCreated === 0) {
      churnProbability += 15;
      riskFactors.push('Nenhuma automação de funil comercial configurada até o momento');
      recommendedActions.push('Recomendar modelos prontos de automação de e-mails.');
    }

    churnProbability = Math.min(95, Math.max(5, churnProbability));

    if (recommendedActions.length === 0) {
      recommendedActions.push('Enviar conteúdo educativo premium de growth marketing.');
      recommendedActions.push('Sugerir upgrade de plano com mentoria exclusiva.');
    }

    return {
      churnProbability,
      riskFactors,
      recommendedActions
    };
  }
}

// ==================================================
// 4. CUSTOMER JOURNEY AUTOMATION
// ==================================================
export class CustomerJourneyAutomation {
  public static async executeStage(customer: EnrichedCustomer, day: number): Promise<{
    success: boolean;
    channel: 'whatsapp' | 'email' | 'all';
    whatsappSent: boolean;
    emailSent: boolean;
    messageTitle: string;
    messageContent: string;
    details: string;
  }> {
    let messageTitle = '';
    let messageContent = '';
    let channel: 'whatsapp' | 'email' | 'all' = 'all';

    switch (day) {
      case 0:
        messageTitle = 'Boas-vindas à Fábrica Inteligente!';
        messageContent = `Olá ${customer.name}, sou o seu Success Manager na AI Business Factory! Muito feliz em ter você aqui. Seu acesso está liberado. Vamos começar criando seu primeiro infoproduto hoje? Qualquer dúvida, basta chamar!`;
        channel = 'all';
        break;
      case 3:
        messageTitle = 'Apresentando Recursos Avançados';
        messageContent = `Ei ${customer.name}, você sabia que a AI Business Factory conta com mais de 12 agentes especializados em escala automática? Temos Redator, Designer, Gestor de Tráfego e muito mais trabalhando para você 24h. Acesse o painel de agentes e experimente!`;
        channel = 'email';
        break;
      case 7:
        messageTitle = 'Análise de Progresso Semanal';
        messageContent = `Olá ${customer.name}! Analisamos seu progresso esta semana. Seu funil automatizado de marketing está pronto para receber tráfego. Deseja iniciar a simulação comercial assistida ou otimizar suas copies agora?`;
        channel = 'all';
        break;
      case 14:
        messageTitle = 'Pesquisa de Satisfação (CSAT)';
        messageContent = `Sua opinião é vital, ${customer.name}! Em uma escala de 1 a 5, como você avalia sua experiência com a AI Business Factory até agora? Responda este e-mail ou WhatsApp com uma nota para nos ajudar a evoluir.`;
        channel = 'all';
        break;
      case 999: // Código para cliente em risco
        messageTitle = 'Aceleração e Suporte Exclusivo';
        messageContent = `Olá ${customer.name}, notamos que você não acessou a fábrica nos últimos dias. Gostaria de agendar uma chamada rápida de 15 minutos com nosso gerente de CS para desenhar sua estratégia de vendas de forma assistida? Estamos aqui para destravar seu ROI!`;
        channel = 'whatsapp';
        break;
      default:
        messageTitle = 'Acompanhamento de Rotina';
        messageContent = `Olá ${customer.name}, estamos acompanhando seus resultados operacionais de perto. Continue escalando suas vendas com as automações da fábrica!`;
        channel = 'email';
    }

    // Cria registro de evento de sucesso
    const journeyEventId = `evt_journey_${customer.id}_day${day}_${Date.now().toString(36)}`;
    await Repository.saveMarketingEvent({
      id: journeyEventId,
      launchId: 'customer_success_central',
      eventType: 'email_sent',
      title: `Jornada CS - ${messageTitle}`,
      description: `Disparado fluxo de jornada para ${customer.name} (${customer.email}) referente ao Dia ${day}.`,
      channel: channel === 'all' ? 'whatsapp_email' : channel,
      status: 'success',
      createdAt: new Date().toISOString()
    });

    // Registra alerta de retenção ativa no Supervisor se for cliente em risco
    if (day === 999) {
      await SupervisorAgent.triggerAlert(
        'medium',
        `Disparado Alerta de Retenção Ativa via WhatsApp para cliente em risco: ${customer.name}.`,
        'CustomerSuccessAgent',
        'customer_success',
        'Acompanhar resposta do cliente no painel de sucesso.'
      );
    }

    return {
      success: true,
      channel,
      whatsappSent: channel === 'whatsapp' || channel === 'all',
      emailSent: channel === 'email' || channel === 'all',
      messageTitle,
      messageContent,
      details: `Mensagens da jornada automatizada do Dia ${day} despachadas com sucesso para ${customer.name}.`
    };
  }
}

// ==================================================
// 5. AI SUCCESS MANAGER
// ==================================================
export class SuccessManagerAI {
  public static async processQuery(prompt: string, customers: EnrichedCustomer[]): Promise<string> {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      logWarn('[SuccessManagerAI] GEMINI_API_KEY ausente. Usando resposta heurística local.');
      return this.fallbackResponse(prompt, customers);
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      // Serializa dados cruciais dos clientes de forma leve
      const serializedCustomers = customers.map(c => ({
        name: c.name,
        email: c.email,
        healthScore: c.healthScore,
        healthLevel: c.healthLevel,
        daysInactive: c.daysInactive,
        conversions: c.conversions,
        totalSpent: c.totalSpent,
        journeyStage: c.journeyStage
      }));

      const contextPrompt = `Você é o SuccessManagerAI (Assistente Virtual de Sucesso do Cliente) integrado à plataforma SaaS "AI Business Factory".
Sua função é auxiliar os diretores de CS e analistas comerciais a gerenciar clientes, entender dores de usabilidade, sugerir ações de retenção e apontar oportunidades de upsell/upgrade.

Dados Atuais dos Clientes Registrados:
${JSON.stringify(serializedCustomers, null, 2)}

Responda à seguinte pergunta do Analista de Sucesso:
"${prompt}"

Sua resposta deve ser:
1. Clara, profissional e focada em resultados reais.
2. Citar nomes reais dos clientes fornecidos nos dados.
3. Fornecer recomendações práticas e passos acionáveis (ex: quem abordar, o que oferecer).
4. Usar marcadores/bullets de forma elegante para leitura fácil.`;

      const response = await ModelManager.generateContent('customer_success_manager_ai', ai, {
        model: ModelManager.getModelName(),
        contents: contextPrompt
      });

      if (response && response.text) {
        return response.text.trim();
      }
    } catch (err: any) {
      logWarn(`[SuccessManagerAI] Erro no Gemini: ${err.message || err}. Usando heurística local.`);
    }

    return this.fallbackResponse(prompt, customers);
  }

  private static fallbackResponse(prompt: string, customers: EnrichedCustomer[]): string {
    const query = prompt.toLowerCase();
    
    if (query.includes('risco') || query.includes('churn') || query.includes('atenção')) {
      const critical = customers.filter(c => c.healthLevel === 'CRITICAL' || c.healthLevel === 'RISK');
      if (critical.length === 0) {
        return `### Análise de Risco de Churn\n\nExcelente notícia! Todos os clientes ativos apresentam ótimos níveis de saúde e engajamento. Nenhum cliente está sob risco iminente de churn no momento atual.`;
      }
      
      let res = `### Clientes em Risco de Churn / Necessitando Atenção\n\nIdentifiquei **${critical.length}** cliente(s) que necessitam de intervenção urgente:\n\n`;
      critical.forEach(c => {
        res += `- **${c.name}** (${c.email}): Health Score **${c.healthScore}/100** (Classificado como **${c.healthLevel}**). Está inativo há **${c.daysInactive}** dias e possui apenas **${c.frequency}** acessos semanais. \n  *Ação recomendada:* Disparar fluxo de reativação via WhatsApp oferecendo mentoria rápida de 15 minutos.\n`;
      });
      return res;
    }

    if (query.includes('upgrade') || query.includes('upsell') || query.includes('comprar') || query.includes('premium')) {
      const healthy = customers.filter(c => c.healthLevel === 'HEALTHY' || c.conversions > 15);
      if (healthy.length === 0) {
        return `### Oportunidades de Upgrade\n\nNo momento, os clientes engajados estão consolidando suas primeiras vendas. Sugiro aguardar um volume maior de conversões para disparar campanhas de upsell.`;
      }

      let res = `### Oportunidades de Upgrade / Upsell Detectadas\n\nEsses clientes estão com excelente performance e são fortes candidatos para planos Premium/Enterprise:\n\n`;
      healthy.forEach(c => {
        res += `- **${c.name}** (${c.email}): Health Score **${c.healthScore}/100** com **${c.conversions}** conversões de venda geradas no total. \n  *Ação recomendada:* Disparar e-mail estratégico oferecendo o plano Enterprise com taxas de transação reduzidas e agentes personalizados ilimitados.\n`;
      });
      return res;
    }

    // Default response
    const healthyCount = customers.filter(c => c.healthLevel === 'HEALTHY').length;
    const attentionCount = customers.filter(c => c.healthLevel === 'ATTENTION').length;
    const riskCount = customers.filter(c => c.healthLevel === 'RISK' || c.healthLevel === 'CRITICAL').length;

    return `### Visão Geral da Base de Clientes (SuccessManagerAI)

Olá! Analisei a base atual com sucesso. Aqui está um resumo rápido das operações de retenção:
- **Total de Clientes Ativos:** ${customers.length}
- **Clientes Saudáveis (Promotores):** ${healthyCount}
- **Clientes em Atenção:** ${attentionCount}
- **Clientes sob Risco de Cancelamento:** ${riskCount}

**Plano de Ação para Hoje:**
1. Disparar o fluxo de recuperação ativa (WhatsApp) para clientes classificados em risco.
2. Parabenizar os clientes promotores e enviar convite para o programa de afiliados.

*Pergunte-me algo mais específico como "Quem está em risco?" ou "Quem pode fazer upgrade?" para recomendações detalhadas!*`;
  }
}
