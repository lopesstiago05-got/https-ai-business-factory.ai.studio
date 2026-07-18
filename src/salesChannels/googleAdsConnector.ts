import { AdsCampaign } from './salesChannelTypes.ts';

export class GoogleAdsConnector {
  public static async createCampaign(
    name: string,
    budget: number,
    keywords: string[]
  ): Promise<AdsCampaign> {
    console.log(`[GoogleAdsConnector] Criando campanha de busca Google Ads: "${name}" com orçamento de R$ ${budget}/dia`);
    console.log(`[GoogleAdsConnector] Palavras-chave configuradas: ${keywords.join(', ')}`);

    return {
      id: `google_camp_${Math.random().toString(36).substr(2, 9)}`,
      channelId: 'google_ads',
      name,
      status: 'ACTIVE',
      objective: 'CONVERSION',
      budget,
      spent: 0,
      leads: 0,
      sales: 0,
      clicks: 0,
      ctr: 0,
      cpc: 0,
      cpa: 0,
      roas: 0
    };
  }

  public static async fetchKeywordsInsight(niche: string): Promise<{ keyword: string; volume: number; competition: 'ALTA' | 'MEDIA' | 'BAIXA'; cpcRange: string }[]> {
    return [
      { keyword: `curso de ${niche}`, volume: 8400, competition: 'MEDIA', cpcRange: 'R$ 1,20 - R$ 3,50' },
      { keyword: `como aprender ${niche}`, volume: 3200, competition: 'BAIXA', cpcRange: 'R$ 0,80 - R$ 1,90' },
      { keyword: `template pronto de ${niche}`, volume: 1500, competition: 'ALTA', cpcRange: 'R$ 2,10 - R$ 5,80' }
    ];
  }
}
