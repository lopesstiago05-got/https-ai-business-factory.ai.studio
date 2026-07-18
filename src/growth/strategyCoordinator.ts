import { GrowthOpportunity } from './opportunityEngine.ts';

export interface AgentStrategySuggestion {
  agentId: string;
  agentName: string;
  role: string;
  status: 'pending' | 'applied' | 'rejected';
  remedy: string;
  expectedMetricImpact: string;
  opportunityId?: string;
}

export class StrategyCoordinator {
  private static suggestions: AgentStrategySuggestion[] = [
    {
      agentId: 'ceo',
      agentName: 'CEO Agent',
      role: 'Diretor Executivo Global',
      status: 'pending',
      remedy: 'Aprovar o rebalanceamento de capital retirando 10% do orçamento do produto estagnado para aplicar na esteira B2B.',
      expectedMetricImpact: 'Aumento de 15% na margem operacional líquida.'
    },
    {
      agentId: 'marketing',
      agentName: 'Marketing Agent',
      role: 'Estrategista de Tráfego e Funis',
      status: 'pending',
      remedy: 'Duplicar o orçamento de anúncios no conjunto segmentado "Profissionais Autônomos" que apresentou ROI de 420%.',
      expectedMetricImpact: 'Redução de 12% no CAC geral.'
    },
    {
      agentId: 'research',
      agentName: 'Research Agent',
      role: 'Pesquisador de Mercado',
      status: 'pending',
      remedy: 'Focar a próxima coleta de dados qualitativos em feedbacks de churn do produto Mentoria.',
      expectedMetricImpact: 'Diminuição de 1.5% na taxa de Churn.'
    },
    {
      agentId: 'market_analyst',
      agentName: 'Market Analyst',
      role: 'Analista de Concorrência',
      status: 'pending',
      remedy: 'Monitorar e auditar os preços praticados por novos players que lançaram soluções SaaS B2B concorrentes.',
      expectedMetricImpact: 'Proteção do Ticket Médio e posicionamento.'
    },
    {
      agentId: 'product_creator',
      agentName: 'Product Creator Agent',
      role: 'Arquiteto de Produtos',
      status: 'pending',
      remedy: 'Desenvolver um minicurso focado em Automação com WhatsApp para empacotar como bônus.',
      expectedMetricImpact: 'Aumento do LTV inicial em até 20%.'
    },
    {
      agentId: 'designer',
      agentName: 'Designer Agent',
      role: 'Diretor de Arte e UI/UX',
      status: 'pending',
      remedy: 'Redesenhar a seção de FAQ da página de checkout para melhorar os indicadores de confiança visual.',
      expectedMetricImpact: 'Elevação de 0.8% na taxa de conversão final.'
    },
    {
      agentId: 'writer',
      agentName: 'Writer Agent',
      role: 'Copywriter de Conversão',
      status: 'pending',
      remedy: 'Substituir as chamadas de headlines agressivas por depoimentos reais nas campanhas frias.',
      expectedMetricImpact: 'Melhoria de 22% na taxa de cliques (CTR).'
    },
    {
      agentId: 'finance',
      agentName: 'Finance Agent',
      role: 'Gerente Financeiro',
      status: 'pending',
      remedy: 'Provedor de faturamento automático para boletos vencidos a fim de recuperar inadimplências.',
      expectedMetricImpact: 'Aumento de R$ 8.500 no faturamento mensal líquido.'
    },
    {
      agentId: 'customer_success',
      agentName: 'Customer Success Agent',
      role: 'Gerente de Felicidade do Cliente',
      status: 'pending',
      remedy: 'Enviar um e-mail de agradecimento personalizado aos clientes que completaram 30 dias de uso da plataforma.',
      expectedMetricImpact: 'Aumento de 5% no NPS (Net Promoter Score).'
    },
    {
      agentId: 'evolution_manager',
      agentName: 'Evolution Manager Agent',
      role: 'Diretor de Aprendizado Contínuo',
      status: 'pending',
      remedy: 'Acelerar o teste A/B número #104 focando nas headlines otimizadas da página principal.',
      expectedMetricImpact: 'Mais segurança estatística nas decisões de layout.'
    },
    {
      agentId: 'supervisor',
      agentName: 'Supervisor Agent',
      role: 'Garantia de Qualidade e Compliance',
      status: 'pending',
      remedy: 'Auditar se os novos termos de uso do produto de IA estão alinhados com a LGPD.',
      expectedMetricImpact: 'Redução de risco jurídico a zero.'
    }
  ];

  /**
   * Generates or retrieves the customized suggestion mapped to each agent.
   */
  public static getSuggestions(): AgentStrategySuggestion[] {
    return this.suggestions;
  }

  /**
   * Distributes specific opportunities as actionable strategies to matching agent queues.
   */
  public static distributeOpportunities(opportunities: GrowthOpportunity[]): void {
    opportunities.forEach(opp => {
      // Find matching suggest mapping or dynamically append
      const matched = this.suggestions.find(s => 
        s.agentName.toLowerCase().includes(opp.targetAgent.toLowerCase()) ||
        opp.targetAgent.toLowerCase().includes(s.agentId)
      );

      if (matched) {
        matched.opportunityId = opp.id;
        matched.remedy = opp.recommendedAction;
        matched.status = 'pending';
      } else {
        // Create new dynamic suggestion
        this.suggestions.push({
          agentId: opp.targetAgent.replace(' Agent', '').toLowerCase(),
          agentName: opp.targetAgent,
          role: 'Especialista Recomendado',
          status: 'pending',
          remedy: opp.recommendedAction,
          expectedMetricImpact: `Aumento imediato de métricas. Impacto estimado de ganho de R$ ${opp.estimatedGain}`,
          opportunityId: opp.id
        });
      }
    });
  }

  /**
   * Updates status of a strategic remedy suggested to an agent.
   */
  public static updateSuggestionStatus(agentId: string, status: 'pending' | 'applied' | 'rejected'): boolean {
    const sug = this.suggestions.find(s => s.agentId === agentId);
    if (sug) {
      sug.status = status;
      return true;
    }
    return false;
  }
}
