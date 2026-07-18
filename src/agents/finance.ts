import { GoogleGenAI, Type } from '@google/genai';
import { Repository } from '../db/repository.ts';
import { FinancialForecast, FinancialReport, FinancialTransaction, Revenue, Expense, CashFlow, ProfitAnalysis, RoiHistory, CampaignResult, CustomerMetrics } from '../types.ts';
import { logInfo, logWarn, logError } from '../logs/logger.ts';
import { ModelManager } from '../kernel/ModelManager.ts';

const DEFAULT_FINANCE_PROMPT = `Você é o Finance Agent (Diretor Financeiro / CFO), o agente especialista da "AI Business Factory" responsável por controlar a saúde financeira, fluxo de caixa, precificação, lucratividade, ROI, CAC e LTV da empresa autônoma.

Sua missão é acompanhar cada receita e despesa, analisar o desempenho das campanhas de marketing geradas pelo Marketing Agent, avaliar a precificação sugerida pelo Publisher Agent e gerar relatórios executivos com insights acionáveis, alertas de gargalos e previsões de faturamento extremamente precisas.`;

export class FinanceAgent {
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

  /**
   * Atualiza o status do agente Finance no banco de dados / estado global
   */
  private static async updateAgentState(status: 'idle' | 'running' | 'error', currentTask?: string) {
    try {
      const state = await Repository.getSystemState();
      const agentsList = state.agents.map(a => {
        if (a.id === 'finance') {
          return { ...a, status, currentTask: currentTask || undefined };
        }
        return a;
      });
      await Repository.saveState({ agents: agentsList });
    } catch (err) {
      console.error('Falha ao atualizar estado do Finance Agent:', err);
    }
  }

  /**
   * Calcula o faturamento líquido aplicando as taxas reais do Mercado Pago (Etapa 18)
   */
  public static calculateNetRevenue(grossAmount: number, paymentMethod: string): number {
    const method = (paymentMethod || 'pix').toLowerCase();
    if (method === 'pix') {
      return grossAmount * 0.99; // Pix: 1%
    } else if (method === 'credit_card' || method === 'cartao' || method === 'cartao_credito' || method === 'card') {
      return grossAmount * 0.96; // Cartão de Crédito: 4%
    } else if (method === 'boleto') {
      const net = grossAmount - 3.49; // Boleto: R$ 3,49 fixos
      return net < 0 ? 0 : net;
    }
    return grossAmount;
  }

  /**
   * Gera uma previsão financeira (FinancialForecast) utilizando inteligência artificial (Gemini)
   */
  static async generateForecast(period: 'next_month' | 'next_quarter' | 'next_year'): Promise<FinancialForecast> {
    logInfo(`Finance Agent iniciando previsão financeira para o período: ${period}`);
    await this.updateAgentState('running', `Gerando previsão de faturamento por IA para ${period}`);

    try {
      const state = await Repository.getSystemState();
      const products = state.products || [];
      const campaigns = state.marketingCampaigns || [];
      const transactions = await Repository.getFinancialTransactions();
      const revenuesList = await Repository.getRevenues();
      const expensesList = await Repository.getExpenses();

      const totalGrossRevenue = revenuesList.reduce((acc, r) => acc + r.amount, 0);
      const totalNetRevenue = revenuesList.reduce((acc, r) => acc + this.calculateNetRevenue(r.amount, r.paymentMethod), 0);
      const totalExpense = expensesList.reduce((acc, e) => acc + e.amount, 0);

      const ai = this.getAI();

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          predictedRevenue: { 
            type: Type.NUMBER, 
            description: "Valor previsto de faturamento bruto em Reais (R$) para o período." 
          },
          confidence: { 
            type: Type.NUMBER, 
            description: "Grau de confiança da previsão (entre 0.0 e 1.0) baseado na qualidade dos dados atuais." 
          },
          insights: { 
            type: Type.STRING, 
            description: "Insights financeiros sobre a previsão, tendências observadas, sazonalidade e análise de fluxo de caixa futura." 
          },
          suggestions: { 
            type: Type.STRING, 
            description: "Sugestões de precificação, corte de desperdícios, otimização de custos de anúncios e canais mais lucrativos." 
          }
        },
        required: ["predictedRevenue", "confidence", "insights", "suggestions"]
      };

      const systemPrompt = `${DEFAULT_FINANCE_PROMPT}
Gere uma previsão de faturamento precisa em formato JSON seguindo estritamente o schema fornecido. Analise os dados atuais do negócio de forma realista. Se o negócio tiver poucos dados históricos, baseie-se no potencial dos infoprodutos cadastrados e campanhas ativas.`;

      const userContent = `Dados atuais do negócio:
- Quantidade de Infoprodutos: ${products.length}
- Infoprodutos cadastrados: ${JSON.stringify(products.map(p => ({ name: p.name, price: p.price, category: p.category, status: p.status })))}
- Campanhas de Marketing ativas: ${JSON.stringify(campaigns.map(c => ({ title: c.title, budget: (c as any).budget || 500, platform: (c as any).platform || 'Simulada' })))}
- Transações Recentes: ${JSON.stringify(transactions.slice(-15))}
- Faturamento Bruto Acumulado: R$ ${totalGrossRevenue.toFixed(2)}
- Faturamento Líquido Real (Descontando taxas do Mercado Pago): R$ ${totalNetRevenue.toFixed(2)}
- Taxas Totais Deduzidas do Mercado Pago: R$ ${(totalGrossRevenue - totalNetRevenue).toFixed(2)}
- Despesas Acumuladas: R$ ${totalExpense.toFixed(2)}

Período solicitado para Previsão: ${period === 'next_month' ? 'Próximo Mês' : period === 'next_quarter' ? 'Próximo Trimestre' : 'Próximo Ano'}.`;

      const response = await ModelManager.generateContent('finance', ai, {
        model: ModelManager.getModelName(),
        contents: [
          { role: 'system', parts: [{ text: systemPrompt }] },
          { role: 'user', parts: [{ text: userContent }] }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema
        }
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);

      const forecast: FinancialForecast = {
        id: `fct-${Math.random().toString(36).substring(2, 11)}`,
        title: `Previsão de Faturamento - ${period === 'next_month' ? 'Mensal' : period === 'next_quarter' ? 'Trimestral' : 'Anual'} por IA`,
        period: period,
        predictedRevenue: parsed.predictedRevenue || 12500.00,
        confidence: parsed.confidence || 0.85,
        insights: parsed.insights || 'O portfólio atual demonstra grande potencial de escalabilidade devido ao baixo custo de infraestrutura.',
        suggestions: parsed.suggestions || 'Recomenda-se aumentar o orçamento das campanhas de alta conversão e revisar o valor do ticket médio.',
        timestamp: new Date().toISOString()
      };

      await Repository.createFinancialForecast(forecast);
      await this.updateAgentState('idle');
      return forecast;
    } catch (err: any) {
      logError(`Erro na previsão do Finance Agent: ${err.message}`);
      await this.updateAgentState('error', `Falha ao gerar previsão: ${err.message}`);
      throw err;
    }
  }

  /**
   * Gera um relatório financeiro executivo (FinancialReport) por IA
   */
  static async generateReport(period: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<FinancialReport> {
    logInfo(`Finance Agent gerando relatório executivo periódico: ${period}`);
    await this.updateAgentState('running', `Gerando relatório financeiro para o período ${period}`);

    try {
      const state = await Repository.getSystemState();
      const transactions = await Repository.getFinancialTransactions();
      const revenuesList = await Repository.getRevenues();
      const expensesList = await Repository.getExpenses();

      const totalGrossRevenue = revenuesList.reduce((acc, r) => acc + r.amount, 0);
      const totalNetRevenue = revenuesList.reduce((acc, r) => acc + this.calculateNetRevenue(r.amount, r.paymentMethod), 0);
      const totalExpense = expensesList.reduce((acc, e) => acc + e.amount, 0);
      const netProfit = totalNetRevenue - totalExpense;
      const margin = totalNetRevenue > 0 ? (netProfit / totalNetRevenue) * 100 : 0;

      const ai = this.getAI();

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          insights: { 
            type: Type.STRING, 
            description: "Insights financeiros profundos sobre saúde do caixa, ROI, CAC médio, identificação de desperdícios e alertas de gargalos." 
          },
          title: { 
            type: Type.STRING, 
            description: "Título formal do relatório executivo financeiro." 
          }
        },
        required: ["insights", "title"]
      };

      const systemPrompt = `${DEFAULT_FINANCE_PROMPT}
Analise a situação de receitas, despesas, lucro líquido e margem operacional atual. Forneça um título executivo elegante e um parágrafo detalhado de insights operacionais financeiros focados em saúde de caixa, ROI, CAC e LTV.`;

      const userContent = `Indicadores Consolidados:
- Receita Bruta Total: R$ ${totalGrossRevenue.toFixed(2)}
- Receita Líquida Real (Descontando taxas MP): R$ ${totalNetRevenue.toFixed(2)}
- Despesa Bruta Total: R$ ${totalExpense.toFixed(2)}
- Lucro Líquido: R$ ${netProfit.toFixed(2)}
- Margem Operacional: ${margin.toFixed(2)}%
- Total de Recebimentos: ${revenuesList.length} transações
- Total de Pagamentos efetuados: ${expensesList.length} transações
- Últimas transações cadastradas: ${JSON.stringify(transactions.slice(-10))}

Período de Análise: ${period}.`;

      const response = await ModelManager.generateContent('finance', ai, {
        model: ModelManager.getModelName(),
        contents: [
          { role: 'system', parts: [{ text: systemPrompt }] },
          { role: 'user', parts: [{ text: userContent }] }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema
        }
      });

      const parsed = JSON.parse(response.text || '{}');

      const report: FinancialReport = {
        id: `rep-${Math.random().toString(36).substring(2, 11)}`,
        title: parsed.title || `Relatório Financeiro Executivo - Consolidado ${period}`,
        period: period,
        totalRevenue: totalGrossRevenue,
        totalExpense,
        netProfit,
        margin,
        insights: parsed.insights || 'O fluxo de caixa operacional demonstra robustez, com margens confortáveis acima do ponto de equilíbrio.',
        timestamp: new Date().toISOString()
      };

      await Repository.createFinancialReport(report);
      await this.updateAgentState('idle');
      return report;
    } catch (err: any) {
      logError(`Erro ao gerar relatório do Finance Agent: ${err.message}`);
      await this.updateAgentState('error', `Falha ao gerar relatório: ${err.message}`);
      throw err;
    }
  }

  /**
   * Sincroniza e popula dados financeiros simulados se o banco estiver vazio.
   * Isso fornece uma excelente experiência visual, permitindo ver gráficos e relatórios out-of-the-box.
   */
  static async seedInitialFinancialData(): Promise<void> {
    logInfo('Verificando necessidade de popular dados financeiros iniciais...');
    try {
      const transactions = await Repository.getFinancialTransactions();
      if (transactions.length > 0) {
        logInfo('Dados financeiros já existem. Ignorando seeding.');
        return;
      }

      logInfo('Sem transações registradas. Iniciando seeding de dados financeiros conceituais...');

      const state = await Repository.getSystemState();
      const products = state.products || [];
      const campaigns = state.marketingCampaigns || [];

      // Criar receitas conceituais baseadas nos produtos disponíveis
      const baseProducts = products.length > 0 ? products : [
        { id: 'p1', name: 'E-book: O Guia do Programador FullStack', price: 97.00, category: 'Tecnologia' },
        { id: 'p2', name: 'Curso: Copywriting Avançado com IA', price: 197.00, category: 'Marketing' }
      ];

      const seedRevenues: Revenue[] = [
        {
          id: 'rev-001',
          productId: baseProducts[0]?.id || 'p1',
          amount: baseProducts[0]?.price || 97.00,
          paymentMethod: 'pix',
          status: 'completed',
          customerEmail: 'mariasilva@gmail.com',
          date: '2026-07-10',
          timestamp: new Date('2026-07-10T10:30:00Z').toISOString()
        },
        {
          id: 'rev-002',
          productId: baseProducts[0]?.id || 'p1',
          amount: baseProducts[0]?.price || 97.00,
          paymentMethod: 'credit_card',
          status: 'completed',
          customerEmail: 'joaocarlos@hotmail.com',
          date: '2026-07-11',
          timestamp: new Date('2026-07-11T14:20:00Z').toISOString()
        },
        {
          id: 'rev-003',
          productId: baseProducts[1]?.id || 'p2',
          amount: baseProducts[1]?.price || 197.00,
          paymentMethod: 'credit_card',
          status: 'completed',
          customerEmail: 'carla_growth@outlook.com',
          date: '2026-07-12',
          timestamp: new Date('2026-07-12T09:15:00Z').toISOString()
        },
        {
          id: 'rev-004',
          productId: baseProducts[1]?.id || 'p2',
          amount: baseProducts[1]?.price || 197.00,
          paymentMethod: 'pix',
          status: 'completed',
          customerEmail: 'tiagolopes_dev@gmail.com',
          date: '2026-07-14',
          timestamp: new Date('2026-07-14T18:45:00Z').toISOString()
        },
        {
          id: 'rev-005',
          productId: baseProducts[0]?.id || 'p1',
          amount: baseProducts[0]?.price || 97.00,
          paymentMethod: 'pix',
          status: 'completed',
          customerEmail: 'ricardo_analyst@live.com',
          date: '2026-07-15',
          timestamp: new Date('2026-07-15T11:00:00Z').toISOString()
        },
        {
          id: 'rev-006',
          productId: baseProducts[1]?.id || 'p2',
          amount: baseProducts[1]?.price || 197.00,
          paymentMethod: 'credit_card',
          status: 'completed',
          customerEmail: 'ana.luz@yahoo.com',
          date: '2026-07-16',
          timestamp: new Date('2026-07-16T15:30:00Z').toISOString()
        }
      ];

      for (const rev of seedRevenues) {
        await Repository.createRevenue(rev);
        // Também cria a transação de entrada associada
        await Repository.createFinancialTransaction({
          id: `tx-in-${rev.id}`,
          type: 'revenue',
          amount: rev.amount,
          description: `Venda do infoproduto ${baseProducts.find(p => p.id === rev.productId)?.name || 'Infoproduto'}`,
          category: 'sales',
          date: rev.date,
          productId: rev.productId,
          timestamp: rev.timestamp
        });
      }

      // Criar despesas conceituais (infraestrutura, anúncios, etc.)
      const seedExpenses: Expense[] = [
        {
          id: 'exp-001',
          amount: 350.00,
          category: 'ads',
          description: 'Anúncios de tráfego pago - Campanha de lançamento Facebook Ads',
          date: '2026-07-09',
          status: 'paid',
          timestamp: new Date('2026-07-09T08:00:00Z').toISOString()
        },
        {
          id: 'exp-002',
          amount: 120.00,
          category: 'servers',
          description: 'Hospedagem cloud, APIs de IA e infraestrutura técnica de servidores',
          date: '2026-07-11',
          status: 'paid',
          timestamp: new Date('2026-07-11T12:00:00Z').toISOString()
        },
        {
          id: 'exp-003',
          amount: 150.00,
          category: 'ads',
          description: 'Anúncios de tráfego pago - Campanha de remarketing Google Ads',
          date: '2026-07-13',
          status: 'paid',
          timestamp: new Date('2026-07-13T16:00:00Z').toISOString()
        }
      ];

      for (const exp of seedExpenses) {
        await Repository.createExpense(exp);
        await Repository.createFinancialTransaction({
          id: `tx-out-${exp.id}`,
          type: 'expense',
          amount: exp.amount,
          description: exp.description,
          category: exp.category,
          date: exp.date,
          timestamp: exp.timestamp
        });
      }

      // Popular Fluxo de Caixa Diário consolidando
      const cashflowDays = ['2026-07-09', '2026-07-10', '2026-07-11', '2026-07-12', '2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16'];
      let balanceTracker = 0;
      for (const day of cashflowDays) {
        const dailyInflow = seedRevenues.filter(r => r.date === day).reduce((acc, r) => acc + r.amount, 0);
        const dailyOutflow = seedExpenses.filter(e => e.date === day).reduce((acc, e) => acc + e.amount, 0);
        balanceTracker += (dailyInflow - dailyOutflow);

        await Repository.createCashFlow({
          id: `cf-${day}`,
          date: day,
          inflow: dailyInflow,
          outflow: dailyOutflow,
          balance: balanceTracker,
          timestamp: new Date(`${day}T23:59:00Z`).toISOString()
        });
      }

      // Popular análise de lucros por produto
      for (const p of baseProducts) {
        const prodRevenue = seedRevenues.filter(r => r.productId === p.id).reduce((acc, r) => acc + r.amount, 0);
        // custo conceitual proporcional a 20% do produto
        const prodCost = prodRevenue * 0.15;
        const prodNet = prodRevenue - prodCost;
        const prodMargin = prodRevenue > 0 ? (prodNet / prodRevenue) * 100 : 0;

        await Repository.createProfitAnalysis({
          id: `pa-${p.id}`,
          productId: p.id,
          productName: p.name,
          revenue: prodRevenue,
          cost: prodCost,
          netProfit: prodNet,
          margin: prodMargin,
          timestamp: new Date().toISOString()
        });
      }

      // Popular histórico de ROI e campanhas
      const baseCampaigns = campaigns.length > 0 ? campaigns : [
        { id: 'c1', title: 'Campanha de Lançamento Facebook', productId: baseProducts[0]?.id || 'p1', spend: 350 },
        { id: 'c2', title: 'Campanha de Remarketing Google', productId: baseProducts[1]?.id || 'p2', spend: 150 }
      ];

      for (const c of baseCampaigns) {
        const campSpend = (c as any).spend || 250;
        const campRevenue = seedRevenues.reduce((acc, r) => acc + r.amount, 0) * (c.id === 'c1' ? 0.6 : 0.4);
        const campRoi = campSpend > 0 ? ((campRevenue - campSpend) / campSpend) * 100 : 0;

        await Repository.createRoiHistory({
          id: `roi-${c.id}`,
          campaignId: c.id,
          campaignName: c.title,
          investment: campSpend,
          revenue: campRevenue,
          roi: campRoi,
          timestamp: new Date().toISOString()
        });

        await Repository.createCampaignResult({
          id: `cr-${c.id}`,
          campaignId: c.id,
          campaignName: c.title,
          leads: c.id === 'c1' ? 340 : 180,
          sales: c.id === 'c1' ? 4 : 2,
          conversionRate: c.id === 'c1' ? 1.17 : 1.11,
          revenue: campRevenue,
          spend: campSpend,
          roi: campRoi,
          timestamp: new Date().toISOString()
        });
      }

      // Popular métricas gerais de clientes
      const totalSpend = seedExpenses.filter(e => e.category === 'ads').reduce((acc, e) => acc + e.amount, 0);
      const totalSalesCount = seedRevenues.length;
      const cac = totalSalesCount > 0 ? totalSpend / totalSalesCount : 0;
      const ltv = totalSalesCount > 0 ? (seedRevenues.reduce((acc, r) => acc + r.amount, 0) / totalSalesCount) * 1.5 : 0; // ltv conceitual com recorrência simulada
      const averageTicket = totalSalesCount > 0 ? seedRevenues.reduce((acc, r) => acc + r.amount, 0) / totalSalesCount : 0;

      await Repository.createCustomerMetrics({
        id: `cm-001`,
        cac,
        ltv,
        averageTicket,
        conversionRate: 1.15,
        activeCustomers: totalSalesCount,
        timestamp: new Date().toISOString()
      });

      // Gerar relatório inicial e previsão padrão por IA
      try {
        await this.generateReport('monthly');
        await this.generateForecast('next_month');
      } catch (iaErr) {
        logWarn(`Falha ao gerar relatórios IA iniciais no seeding: ${(iaErr as any).message}`);
      }

      logInfo('Seeding de dados financeiros concluído com absoluto sucesso!');
    } catch (err: any) {
      logError(`Falha durante o seeding financeiro: ${err.message}`);
    }
  }
}
