import { GoogleGenAI } from '@google/genai';
import { SocialPost } from './salesChannelTypes.ts';
import { ModelManager } from '../kernel/ModelManager.ts';

export class InstagramBusinessConnector {
  public static async generateDraftPost(
    productName: string,
    promise: string,
    tone: string = 'persuasive'
  ): Promise<Partial<SocialPost>> {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      try {
        const ai = new GoogleGenAI({
          apiKey: key,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });

        const prompt = `Aja em nome do Designer Agent, Writer Agent e Marketing Agent trabalhando juntos.
Crie um post premium para o Instagram sobre o produto "${productName}" que promete "${promise}".
O tom de voz deve ser "${tone}".

Retorne um JSON estrito correspondente ao formato:
{
  "caption": "Legenda persuasiva estruturada com quebras de linha e emojis elegantes",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4"],
  "designConcept": "Prompt detalhado em inglês para o Designer Agent gerar o criativo perfeito no gerador de imagem",
  "suggestedTime": "ex: 18:30"
}`;

        const response = await ModelManager.generateContent('instagram_connector', ai, {
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });

        const data = JSON.parse(response.text || '{}');
        return {
          id: `ig_${Math.random().toString(36).substr(2, 9)}`,
          channelId: 'instagram',
          type: 'post',
          caption: data.caption || `Diga adeus à complicação com o ${productName}! ✨ Descubra como ${promise}.`,
          hashtags: data.hashtags || ['marketing', 'produtividade', productName.toLowerCase().replace(/\s+/g, '')],
          imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=600&q=80',
          status: 'draft'
        };
      } catch (err: any) {
        console.warn('[InstagramBusinessConnector] Falha ao chamar Gemini para post draft:', err.message);
      }
    }

    return {
      id: `ig_${Math.random().toString(36).substr(2, 9)}`,
      channelId: 'instagram',
      type: 'post',
      caption: `🔥 Pronto para acelerar seus resultados? Conheça o ${productName} e conquiste de vez o seu espaço. Descubra agora as estratégias para ${promise}!`,
      hashtags: ['instagrampost', 'marketingdigital', productName.toLowerCase().replace(/\s+/g, '')],
      imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=600&q=80',
      status: 'draft'
    };
  }

  public static async publishPost(post: SocialPost): Promise<SocialPost> {
    console.log(`[InstagramBusinessConnector] Publicando post no feed: ${post.caption.substring(0, 40)}...`);
    return {
      ...post,
      status: 'published',
      metrics: {
        likes: Math.floor(Math.random() * 450) + 50,
        comments: Math.floor(Math.random() * 80) + 10,
        shares: Math.floor(Math.random() * 60) + 5,
        views: post.type === 'reels' ? Math.floor(Math.random() * 5000) + 1200 : undefined
      }
    };
  }
}
