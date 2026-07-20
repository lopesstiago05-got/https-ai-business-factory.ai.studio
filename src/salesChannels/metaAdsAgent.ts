import { GoogleGenAI } from '@google/genai';
import { AdsCampaign } from './salesChannelTypes.ts';
import { ModelManager } from '../kernel/ModelManager.ts';

export class MetaAdsAgent {
  public static async generateCampaignStrategy(
    productName: string,
    promise: string,
    objective: 'CONVERSION' | 'LEADS' | 'TRAFFIC' | 'ENGAGEMENT'
  ): Promise<{ campaign: Partial<AdsCampaign>; targetAudience: string; suggestedAds: string[] }> {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      try {
        const ai = new GoogleGenAI({
          apiKey: key,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });

        const prompt = `Aja como o MetaAdsAgent especializado em tráfego pago para infoprodutos.
Desenvolva uma campanha de alto ROI para o produto "${productName}" que promete "${promise}".
Objetivo da campanha: ${objective}.

Retorne um JSON estrito correspondente ao formato:
{
  "campaignName": "Nome estratégico da campanha no Meta Ads",
  "budget": número representando o orçamento diário em R$,
  "targetAudience": "Definição detalhada do público-alvo, interesses de segmentação e idade recomendada",
  "suggestedAds": [
    "Anúncio 1: Headline instigante + Copy criativa",
    "Anúncio 2: Foco em dor extrema + Solução com prova social",
    "Anúncio 3: Escassez total + Oferta irresistível"
  ]
}`;

        const response = await ModelManager.generateContent('meta_ads_agent', ai, {
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });

        const data = JSON.parse(response.text || '{}');
        return {
          campaign: {
            id: `meta_camp_${Math.random().toString(36).substr(2, 9)}`,
            channelId: 'meta_ads',
            name: data.campaignName || `Lançamento ${productName} - Conversão`,
            status: 'ACTIVE',
            objective,
            budget: data.budget || 150,
            spent: 0,
            leads: 0,
            sales: 0,
            clicks: 0,
            ctr: 0,
            cpc: 0,
            cpa: 0,
            roas: 0
          },
          targetAudience: data.targetAudience || 'Profissionais de tecnologia, empreendedores, idade 25-45, interesses em marketing e produtividade.',
          suggestedAds: data.suggestedAds || [
            'Ad 1: Pare de fazer processos manuais repetitivos agora mesmo.',
            'Ad 2: O segredo para automatizar sua rotina em menos de 2 horas.'
          ]
        };
      } catch (err: any) {
        console.warn('[MetaAdsAgent] Falha ao chamar Gemini para Meta Ads:', err.message);
      }
    }

    return {
      campaign: {
        id: `meta_camp_${Math.random().toString(36).substr(2, 9)}`,
        channelId: 'meta_ads',
        name: `Campanha Lançamento - ${productName}`,
        status: 'ACTIVE',
        objective,
        budget: 100,
        spent: 0,
        leads: 0,
        sales: 0,
        clicks: 0,
        ctr: 0,
        cpc: 0,
        cpa: 0,
        roas: 0
      },
      targetAudience: 'Micro-empresários, lojistas e autônomos que desejam automatizar o WhatsApp e direct.',
      suggestedAds: [
        'Ad 1: Configure um robô de WhatsApp em menos de 2 horas!',
        'Ad 2: Reduza seus custos de atendimento com assistentes inteligentes de IA.'
      ]
    };
  }

  /**
   * Otimização Automática baseada em regras inteligentes (Etapa 25.6)
   */
  public static optimizeCampaigns(campaigns: AdsCampaign[]): AdsCampaign[] {
    return campaigns.map(camp => {
      const updated = { ...camp };
      const reasons: string[] = [];
      let suggestedAction: 'SCALE_UP' | 'SCALE_DOWN' | 'PAUSE' | 'NONE' = 'NONE';

      if (camp.status !== 'ACTIVE') {
        updated.suggestedAction = 'NONE';
        return updated;
      }

      // ROAS vencedor
      if (camp.roas >= 2.5) {
        suggestedAction = 'SCALE_UP';
        updated.budget = Math.round(camp.budget * 1.25); // Aumenta em 25% o orçamento
        reasons.push(`Excelente ROAS de ${camp.roas.toFixed(2)}. Escalando orçamento para maximizar lucros.`);
      } 
      // CPC muito alto ou CPA alto com ROAS insatisfatório
      else if (camp.roas > 0 && camp.roas < 1.0 && camp.spent > 50) {
        suggestedAction = 'SCALE_DOWN';
        updated.budget = Math.round(camp.budget * 0.70); // Reduz orçamento em 30%
        reasons.push(`Campanha com ROAS abaixo de 1.0 (${camp.roas.toFixed(2)}) e alta taxa de gasto. Reduzindo orçamento para diminuir perdas.`);
      }
      // Sem nenhuma venda após gasto significativo
      else if (camp.spent > camp.budget * 2 && camp.sales === 0) {
        suggestedAction = 'PAUSE';
        updated.status = 'PAUSED';
        reasons.push(`Nenhuma venda realizada após consumir mais de 2x o orçamento diário. Campanha pausada automaticamente para proteção do caixa.`);
      } else {
        suggestedAction = 'NONE';
        reasons.push('Desempenho dentro da margem de segurança. Mantendo distribuição de orçamento normal.');
      }

      updated.suggestedAction = suggestedAction;
      updated.reasons = reasons;
      return updated;
    });
  }
}
