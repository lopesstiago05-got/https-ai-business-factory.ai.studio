export interface GrowthRecommendation {
  id: string;
  category: 'traffic' | 'pricing' | 'funnel' | 'retention';
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  priority: 'low' | 'medium' | 'high';
  impactScore: number; // 1 to 10
  status: 'pending' | 'accepted' | 'ignored' | 'executed';
  createdAt: string;
}

export class RecommendationCenter {
  private static recommendations: GrowthRecommendation[] = [
    {
      id: 'rec_traf_01',
      category: 'traffic',
      title: 'Desligar Públicos Frios Abaixo de CTR 1%',
      description: 'Filtrar conjuntos de anúncios ativos no Facebook Ads. Aqueles voltados para público de interesse amplo que operarem com taxa de cliques menor de 1.0% por mais de 7 dias devem ser pausados.',
      difficulty: 'easy',
      priority: 'high',
      impactScore: 8,
      status: 'pending',
      createdAt: new Date().toISOString()
    },
    {
      category: 'pricing',
      id: 'rec_prc_01',
      title: 'Implementar Reajuste Progressivo de Anuidade',
      description: 'Aumentar o valor da assinatura anual do plano Premium de R$ 297 para R$ 347, oferecendo aos assinantes antigos uma janela de 15 dias de renovação com o preço antigo.',
      difficulty: 'medium',
      priority: 'high',
      impactScore: 9,
      status: 'pending',
      createdAt: new Date().toISOString()
    },
    {
      category: 'funnel',
      id: 'rec_fnl_01',
      title: 'Adicionar Depoimentos Dinâmicos na Página de Vendas',
      description: 'Integrar feedbacks reais de alunos em formato carrossel imediatamente abaixo da seção de preço para quebrar objeções críticas de última hora.',
      difficulty: 'easy',
      priority: 'medium',
      impactScore: 7,
      status: 'pending',
      createdAt: new Date().toISOString()
    },
    {
      category: 'retention',
      id: 'rec_ret_01',
      title: 'Disparo Automático de Boletos Não Pagos via WhatsApp',
      description: 'Configurar rotina de notificação ativa no WhatsApp Business para lembrar o cliente do boleto gerado e oferecer suporte para troca para modalidade de PIX ou cartão de crédito.',
      difficulty: 'medium',
      priority: 'high',
      impactScore: 9,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
  ];

  public static getRecommendations(): GrowthRecommendation[] {
    return this.recommendations;
  }

  public static acceptRecommendation(id: string): boolean {
    const rec = this.recommendations.find(r => r.id === id);
    if (rec) {
      rec.status = 'accepted';
      return true;
    }
    return false;
  }

  public static executeRecommendation(id: string): boolean {
    const rec = this.recommendations.find(r => r.id === id);
    if (rec) {
      rec.status = 'executed';
      return true;
    }
    return false;
  }

  public static ignoreRecommendation(id: string): boolean {
    const rec = this.recommendations.find(r => r.id === id);
    if (rec) {
      rec.status = 'ignored';
      return true;
    }
    return false;
  }
}
