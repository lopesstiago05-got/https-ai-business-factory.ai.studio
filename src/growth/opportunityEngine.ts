export interface GrowthOpportunity {
  id: string;
  title: string;
  type: 'product_scale' | 'product_warning' | 'market_niche' | 'campaign_rebalance' | 'lucrative_channel' | 'vip_retention';
  description: string;
  opportunityScore: number; // 0 to 100
  potentialImpact: 'low' | 'medium' | 'high';
  estimatedGain: number; // currency values
  recommendedAction: string;
  targetAgent: string; // CEO, Marketing, Writer, designer, etc.
}

export class OpportunityEngine {
  /**
   * Automatically scans the system operations to find areas for optimization, ranking them by Opportunity Score.
   */
  public static scanOpportunities(): GrowthOpportunity[] {
    return [
      {
        id: 'opp_prod_scale_01',
        title: 'Escalar Infoproduto de Alta Conversão',
        type: 'product_scale',
        description: 'O produto "Gestão de Tempo para Solopreneurs" atingiu 5.4% de conversão orgânica com margem de lucro de 88%. Está pronto para tração paga.',
        opportunityScore: 92,
        potentialImpact: 'high',
        estimatedGain: 34500,
        recommendedAction: 'Alocar R$ 5.000 em tráfego pago focado no criativo de depoimentos e expandir ofertas de upsell.',
        targetAgent: 'Marketing Agent'
      },
      {
        id: 'opp_campaign_reb_01',
        title: 'Corrigir Campanha de Tráfego Ineficiente',
        type: 'campaign_rebalance',
        description: 'Campanha de anúncios "Verão Produtivo" no Meta Ads está com CAC de R$ 98, superando a margem de contribuição aceitável de R$ 60.',
        opportunityScore: 85,
        potentialImpact: 'high',
        estimatedGain: 12000,
        recommendedAction: 'Pausar anúncios com CTR menor que 1.2% e reescrever copy focada no público B2B mais maduro.',
        targetAgent: 'Writer Agent'
      },
      {
        id: 'opp_market_niche_01',
        title: 'Explorar Nicho Promissor de IA Corporativa',
        type: 'market_niche',
        description: 'Análise de mercado revela pico de buscas de 240% por "Automação de Atendimento usando IA" sem concorrentes consolidados no país.',
        opportunityScore: 89,
        potentialImpact: 'high',
        estimatedGain: 45000,
        recommendedAction: 'Criar um e-book rápido e estruturar um MVP de produto focando em integrações no WhatsApp.',
        targetAgent: 'Research Agent'
      },
      {
        id: 'opp_prod_warn_01',
        title: 'Queda de Conversão em Produto Principal',
        type: 'product_warning',
        description: 'A página de checkout do produto "Mentoria de Escala" apresentou queda de 2.1% para 0.8% de conversão após última atualização visual.',
        opportunityScore: 78,
        potentialImpact: 'high',
        estimatedGain: 15000,
        recommendedAction: 'Realizar auditoria de layout da página de checkout e testar carregamento lento de imagens.',
        targetAgent: 'Designer Agent'
      },
      {
        id: 'opp_channel_lucrative_01',
        title: 'Saturar Canal de Vendas Telegram VIP',
        type: 'lucrative_channel',
        description: 'O canal do Telegram demonstrou Ticket Médio 28% superior ao Instagram e tempo médio de fechamento de lead 3 vezes menor.',
        opportunityScore: 81,
        potentialImpact: 'medium',
        estimatedGain: 18000,
        recommendedAction: 'Transferir leads capturados em campanhas frias para um funil de aquecimento direto no Telegram.',
        targetAgent: 'Sales Closer Agent'
      },
      {
        id: 'opp_vip_retention_01',
        title: 'Campanha de Win-back para Clientes de Maior LTV',
        type: 'vip_retention',
        description: 'Detectado que 15% dos clientes de maior valor (LTV > R$ 1.000) não realizam compras há mais de 120 dias.',
        opportunityScore: 74,
        potentialImpact: 'medium',
        estimatedGain: 9500,
        recommendedAction: 'Disparar oferta de renovação exclusiva ou desconto progressivo com acompanhamento ativo.',
        targetAgent: 'Customer Success Agent'
      }
    ];
  }
}
