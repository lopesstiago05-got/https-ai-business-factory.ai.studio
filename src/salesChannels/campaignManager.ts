import { AdsCampaign } from './salesChannelTypes.ts';

export class CampaignManager {
  private static campaigns: AdsCampaign[] = [];

  public static initializeDefaultCampaigns(): AdsCampaign[] {
    if (this.campaigns.length === 0) {
      this.campaigns = [
        {
          id: 'meta_camp_1',
          channelId: 'meta_ads',
          name: 'Meta Conversão Fria - Público Lojistas',
          status: 'ACTIVE',
          objective: 'CONVERSION',
          budget: 150.00,
          spent: 3450.00,
          leads: 480,
          sales: 112,
          clicks: 3400,
          ctr: 0.032, // 3.2%
          cpc: 1.01,
          cpa: 30.80,
          roas: 3.15,
          suggestedAction: 'SCALE_UP',
          reasons: ['ROAS excepcional acima de 3.0. Recomenda-se escalar orçamento em 25%.']
        },
        {
          id: 'meta_camp_2',
          channelId: 'meta_ads',
          name: 'Meta Remarketing de Checkout Abandonado',
          status: 'ACTIVE',
          objective: 'CONVERSION',
          budget: 60.00,
          spent: 1240.00,
          leads: 150,
          sales: 58,
          clicks: 980,
          ctr: 0.054, // 5.4%
          cpc: 1.26,
          cpa: 21.37,
          roas: 4.52,
          suggestedAction: 'SCALE_UP',
          reasons: ['Excelente ROAS de remarketing. Continuar injetando capital.']
        },
        {
          id: 'google_camp_1',
          channelId: 'google_ads',
          name: 'Google Pesquisa - Palavras-chave Intenção de Compra',
          status: 'ACTIVE',
          objective: 'CONVERSION',
          budget: 200.00,
          spent: 5400.00,
          leads: 320,
          sales: 98,
          clicks: 1800,
          ctr: 0.089, // 8.9%
          cpc: 3.00,
          cpa: 55.10,
          roas: 1.76,
          suggestedAction: 'NONE',
          reasons: ['Margem de segurança satisfatória. ROAS positivo.']
        },
        {
          id: 'meta_camp_3',
          channelId: 'meta_ads',
          name: 'Meta Envolvimento / Stories Promocionais',
          status: 'ACTIVE',
          objective: 'ENGAGEMENT',
          budget: 45.00,
          spent: 350.00,
          leads: 12,
          sales: 1,
          clicks: 800,
          ctr: 0.011,
          cpc: 0.43,
          cpa: 350.00,
          roas: 0.22,
          suggestedAction: 'SCALE_DOWN',
          reasons: ['ROAS baixíssimo (0.22) e custo por aquisição insustentável. Reduzir verba.']
        }
      ];
    }
    return this.campaigns;
  }

  public static getCampaigns(): AdsCampaign[] {
    this.initializeDefaultCampaigns();
    return this.campaigns;
  }

  public static createCampaign(campaign: AdsCampaign): AdsCampaign {
    this.initializeDefaultCampaigns();
    this.campaigns.push(campaign);
    return campaign;
  }

  public static updateCampaignStatus(id: string, status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'DRAFT'): AdsCampaign | undefined {
    this.initializeDefaultCampaigns();
    const camp = this.campaigns.find(c => c.id === id);
    if (camp) {
      camp.status = status;
    }
    return camp;
  }

  public static updateCampaignBudget(id: string, budget: number): AdsCampaign | undefined {
    this.initializeDefaultCampaigns();
    const camp = this.campaigns.find(c => c.id === id);
    if (camp) {
      camp.budget = budget;
    }
    return camp;
  }
}
