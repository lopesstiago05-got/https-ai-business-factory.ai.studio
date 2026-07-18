import { GoogleGenAI } from '@google/genai';
import { GeneratedIdea, ProductBlueprint, ContentAsset } from './productTypes.ts';

export class ContentGenerator {
  public static async generate(idea: GeneratedIdea, blueprint: ProductBlueprint): Promise<ContentAsset> {
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

        const prompt = `Aja em nome do Writer Agent e do Designer Agent.
Gere conteúdos textuais enriquecidos e propostas visuais prontas para venda para este produto digital:
Nome do Produto: ${idea.name}
Formato Recomendado: ${idea.format}
Promessa Principal: ${idea.promise}
Blueprint de Grade: ${JSON.stringify(blueprint.items)}

Crie o seguinte:
1. Uma amostra de texto didático ou capítulo introdutório bem estruturado (Writer Agent).
2. Dois scripts de vídeo ou áudio: um focado em vendas (VSL) e outro em boas-vindas do produto.
3. Um prompt avançado e detalhado para geração de capa atraente com IA (Designer Agent).
4. Duas copies altamente persuasivas para canais de tráfego pago (Instagram Ads e Google Search).

Retorne um JSON estrito correspondente ao formato:
{
  "texts": [
    {
      "title": "Título do capítulo ou seção de conteúdo didático",
      "body": "Texto completo, profundo e persuasivo que compõe o conteúdo de amostra"
    }
  ],
  "scripts": [
    "Script de Vendas VSL persuasivo e impactante",
    "Script de Boas-vindas para o aluno ou leitor"
  ],
  "imagePrompt": "Prompt de geração de imagem 3D ultra premium detalhado em inglês para capas",
  "imageUrl": "URL de imagem ilustrativa da Unsplash que combine com o tema",
  "marketingAds": [
    { "channel": "Instagram / Meta Ads", "copy": "Copy persuasiva de tráfego pago" },
    { "channel": "Google / Search Ads", "copy": "Copy com forte chamada de intenção" }
  ]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });

        const data = JSON.parse(response.text || '{}');
        return {
          texts: data.texts || [
            {
              title: `Introdução do Produto: ${idea.name}`,
              body: `Bem-vindo ao início de uma transformação real. Através deste guia prático, desmistificamos os processos para alcançar ${idea.promise}. Prepare-se para absorver técnicas testadas no campo de batalha.`
            }
          ],
          scripts: data.scripts || [
            `[VSL - VÍDEO DE VENDAS] Pare de perder tempo. Conheça a solução definitiva para o seu negócio...`,
            `[BOAS-VINDAS] Olá! Parabéns por garantir seu acesso. Vamos começar estruturando seus primeiros passos...`
          ],
          imagePrompt: data.imagePrompt || 'Minimalist 3D render, futuristic neon blue and indigo shades with elegant gears, premium abstract composition for digital book cover, octane render, high resolution',
          imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
          marketingAds: data.marketingAds || [
            { channel: 'Instagram Ads', copy: `🔥 Crie resultados reais agora! Descubra o método definitivo: ${idea.name}. Clique em Saiba Mais.` },
            { channel: 'Google Search', copy: `Quer dominar as melhores técnicas do mercado? Conheça o ${idea.name} e transforme seus resultados hoje.` }
          ]
        };
      } catch (err: any) {
        console.warn('[ContentGenerator] Falha ao chamar Gemini, aplicando fallback criativo:', err.message);
      }
    }

    // Default Fallback
    return {
      texts: [
        {
          title: `Introdução Didática: Como Dominar ${idea.name}`,
          body: `Seja muito bem-vindo. Este material de treinamento foi estruturado especificamente para sanar as principais dores do mercado que identificamos na nossa pesquisa preliminar. Com foco 100% em aplicação e resultados diretos, você aprenderá exatamente como configurar cada engrenagem para materializar a transformação prometida: ${idea.promise}. Vamos iniciar a sua jornada agora.`
        }
      ],
      scripts: [
        `[VÍDEO DE VENDAS VSL] "Você já se sentiu travado nos seus processos diários? Se você respondeu sim, preste atenção. Hoje vou revelar como o ${idea.name} pode livrar você desse gargalo de uma vez por todas..."`,
        `[VÍDEO DE INTEGRAÇÃO / BOAS-VINDAS] "Parabéns por dar este passo importante! Meu nome é seu Mentor de IA e estou muito feliz por ter você aqui. No primeiro módulo, nós vamos alinhar as ferramentas essenciais..."`
      ],
      imagePrompt: `Clean modern layout showcasing an interactive laptop displaying glowing neon chart graphics, workspace background, elegant dark teal and gold color scheme, isometric vector design, professional finish`,
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      marketingAds: [
        {
          channel: 'Instagram / Meta Ads',
          copy: `🚀 ATENÇÃO PROFISSIONAIS! Chega de atrito ou métodos complicados. Descubra como o ${idea.name} ensina você a atingir seus objetivos de forma descomplicada. Clique em saiba mais!`
        },
        {
          channel: 'Google Search Ads',
          copy: `Fórmula de Sucesso ${idea.name} | Economize Tempo e Multiplique Resultados | Garantia de 7 Dias | Saiba Mais.`
        }
      ]
    };
  }
}
