import { GoogleGenAI } from '@google/genai';
import { GeneratedIdea, ProductOffer } from './productTypes.ts';
import { ModelManager } from '../kernel/ModelManager.ts';

export class OfferBuilder {
  public static async build(idea: GeneratedIdea): Promise<ProductOffer> {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      try {
        const ai = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        const prompt = `Aja como o OfferBuilderAgent integrated aos conhecimentos do Finance Agent (para cálculo de margem e precificação dinâmica) e do Marketing Agent (para bônus e headline magnética).
Crie a estrutura de oferta comercial definitiva para este produto digital:
Nome do Produto: ${idea.name}
Formato: ${idea.format}
Promessa de Entrada: ${idea.promise}

Construa uma oferta irresistível contendo:
1. Nome da oferta principal (ex: Oferta Especial de Lançamento).
2. Headline poderosa e chamativa.
3. Lista de 3 benefícios chave fundamentais.
4. Lista de 2 bônus adicionais altamente complementares.
5. Garantia incondicional recomendada em dias (ex: 7).
6. Preço sugerido dinâmico baseado no formato (CURSO: 197 a 497, EBOOK: 27 a 97, TEMPLATE: 47 a 147, MENTORIA: 997 a 2997).
7. Posicionamento de vendas estratégico (salesStrategy).

Retorne um JSON estrito correspondente ao formato:
{
  "name": "Nome da Oferta Comercial",
  "headline": "Headline persuasiva e irresistível",
  "benefits": ["Benefício 1", "Benefício 2", "Benefício 3"],
  "bonus": ["Bônus 1 com valor real estimado", "Bônus 2 altamente desejável"],
  "guaranteeDays": número representando quantidade de dias (normalmente 7, 15 ou 30),
  "suggestedPrice": preço numérico sugerido (ex: 97.00),
  "salesStrategy": "Descrição de posicionamento estratégico de funil e venda"
}`;

        const response = await ModelManager.generateContent('offer_builder', ai, {
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });

        return JSON.parse(response.text || '{}');
      } catch (err: any) {
        console.warn('[OfferBuilder] Falha ao chamar Gemini, aplicando fallback financeiro:', err.message);
      }
    }

    // Dynamic Default Fallback
    let price = 97.00;
    if (idea.format === 'CURSO') price = 197.00;
    else if (idea.format === 'MENTORIA') price = 997.00;
    else if (idea.format === 'TEMPLATE') price = 47.00;

    return {
      name: 'Pacote VIP de Lançamento',
      headline: `Destrave Seus Resultados Agora: Adquira o ${idea.name} com 40% Off e Garanta Bônus Exclusivos de Alta Performance`,
      benefits: [
        'Acesso imediato e vitalício para assistir ou ler de qualquer dispositivo.',
        'Metodologia passo a passo ultra prática, livre de teorias cansativas.',
        'Canal de suporte e feedbacks diretos para acelerar sua jornada.'
      ],
      bonus: [
        'Super Kit de Ferramentas e Prompts de Alta Conversão (Valor: R$ 147 - Grátis)',
        'Acesso à comunidade fechada com outros especialistas da área (Valor Inestimável)'
      ],
      guaranteeDays: 7,
      suggestedPrice: price,
      salesStrategy: 'Tráfego pago direto para página de vendas de alta performance com vídeo de vendas curto e depoimentos integrados ao checkout de um clique.'
    };
  }
}
