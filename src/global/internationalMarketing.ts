import { GoogleGenAI } from '@google/genai';
import { logWarn } from '../logs/logger.ts';

export interface InternationalMarketingAssets {
  localizedHeadline: string;
  salesPitch: string;
  suggestedAdCopy: string;
  emailSequenceSubject: string;
  emailSequenceBody: string;
  localTrustFactors: string[];
}

export class InternationalMarketing {
  /**
   * Adapta e traduz criativos, copys e funis de marketing para a cultura e idioma do país de destino
   */
  public static async localizeAssets(
    productName: string,
    originalPitch: string,
    countryName: string,
    languageName: string
  ): Promise<InternationalMarketingAssets> {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      logWarn('GEMINI_API_KEY não configurada. Usando marketing local fallback.');
      return this.getLocalFallback(productName, originalPitch, countryName);
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Você é um Copywriter e Diretor de Lançamentos de Alta Conversão focado no mercado de "${countryName}".
        Sua missão é adaptar o infoproduto "${productName}" que possui a proposta original: "${originalPitch}".
        Crie as copys completas no idioma correspondente a "${languageName}". Use gírias locais aceitáveis, fatores de confiança específicos desse país e ajuste o tom.
        
        Retorne EXCLUSIVAMENTE um objeto JSON estrito com o seguinte formato:
        {
          "localizedHeadline": "Uma Headline impactante no idioma local",
          "salesPitch": "Argumento de vendas principal ultra persuasivo em um parágrafo longo",
          "suggestedAdCopy": "Copy sugerida para anúncios de Facebook/Instagram focados na dor",
          "emailSequenceSubject": "Assunto do e-mail de engajamento/vendas",
          "emailSequenceBody": "Corpo do e-mail com estrutura persuasiva de storytelling",
          "localTrustFactors": [
            "Fator de confiança 1 (ex: Política de devolução ou suporte local)",
            "Fator de confiança 2"
          ]
        }`,
        config: {
          responseMimeType: 'application/json'
        }
      });

      return JSON.parse(response.text?.trim() || '{}') as InternationalMarketingAssets;
    } catch (err: any) {
      logWarn(`[InternationalMarketing] Erro ao localizar criativos de marketing: ${err.message}`);
      return this.getLocalFallback(productName, originalPitch, countryName);
    }
  }

  private static getLocalFallback(productName: string, originalPitch: string, countryName: string): InternationalMarketingAssets {
    return {
      localizedHeadline: `Unlock Your Full Potential with ${productName} in ${countryName}!`,
      salesPitch: `The proven step-by-step blueprint "${originalPitch}" is now custom tailored for the unique market of ${countryName}. Get ready to accelerate your results with localized tactics and dedicated guides.`,
      suggestedAdCopy: `🚀 Attention digital creators in ${countryName}! Stop struggle with obsolete strategies. Discover how ${productName} can solve your biggest hurdles in record time. Click below!`,
      emailSequenceSubject: `The secret to scaling in ${countryName}`,
      emailSequenceBody: `Hey there,\n\nIf you want to achieve real results, you must adapt your strategies. That's why we localized ${productName} for ${countryName}. Check out the exclusive video we've prepared for you.\n\nBest regards,\nSupport Team`,
      localTrustFactors: [
        '7-day unconditional local money back guarantee.',
        '24/7 dedicated support team in your timezone.'
      ]
    };
  }
}
