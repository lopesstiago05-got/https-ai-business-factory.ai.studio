import { GoogleGenAI } from '@google/genai';
import { logWarn } from '../logs/logger.ts';

export interface InternationalMarketProfile {
  nicheDemandScore: number; // 0-100
  topCompetitors: string[];
  culturalNuances: string[];
  suggestedLocalChannels: string[];
  buyerPersonaName: string;
  buyerPersonaDescription: string;
}

export class InternationalResearch {
  /**
   * Conduz pesquisa de mercado internacional e ajusta a persona para um nicho e país de destino
   */
  public static async analyzeMarket(niche: string, countryName: string): Promise<InternationalMarketProfile> {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      logWarn('GEMINI_API_KEY não configurada. Usando perfil heurístico padrão.');
      return this.getLocalFallback(niche, countryName);
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Você é um Pesquisador de Mercado Internacional de alta performance.
        Analise o potencial do nicho "${niche}" para expansão no país "${countryName}".
        Identifique concorrentes, nuances culturais locais sobre hábitos de consumo digital, melhores canais de vendas locais e construa a persona ideal adaptada à cultura local.
        
        Retorne EXCLUSIVAMENTE um objeto JSON estrito com o seguinte formato de propriedades:
        {
          "nicheDemandScore": 85,
          "topCompetitors": ["Concorrente Local 1", "Concorrente Local 2"],
          "culturalNuances": [
            "Nuance cultural 1 relevante para infoproduto",
            "Nuance cultural 2 relevante"
          ],
          "suggestedLocalChannels": ["Canal de marketing local 1", "Canal de marketing local 2"],
          "buyerPersonaName": "Nome Típico Local",
          "buyerPersonaDescription": "Descrição detalhada da persona local, dores, preferências de consumo digital e aspirações profissionais ou pessoais."
        }`,
        config: {
          responseMimeType: 'application/json'
        }
      });

      return JSON.parse(response.text?.trim() || '{}') as InternationalMarketProfile;
    } catch (err: any) {
      logWarn(`[InternationalResearch] Erro na análise internacional: ${err.message}`);
      return this.getLocalFallback(niche, countryName);
    }
  }

  private static getLocalFallback(niche: string, countryName: string): InternationalMarketProfile {
    return {
      nicheDemandScore: 78,
      topCompetitors: [`${niche} Pro ${countryName}`, `Global ${niche} Leaders`],
      culturalNuances: [
        `Consumidores em ${countryName} preferem conteúdos rápidos, práticos e direto ao ponto.`,
        `Alta exigência por suporte local ativo e canais de checkout extremamente seguros.`
      ],
      suggestedLocalChannels: ['Meta Ads (Facebook/Instagram)', 'Google Search Ads', 'LinkedIn (B2B)'],
      buyerPersonaName: `Alex (${countryName})`,
      buyerPersonaDescription: `Profissional focado em desenvolvimento rápido que busca se destacar no nicho ${niche}, disposto a investir em infoprodutos modulares desde que forneçam certificados ou resultados imediatos.`
    };
  }
}
