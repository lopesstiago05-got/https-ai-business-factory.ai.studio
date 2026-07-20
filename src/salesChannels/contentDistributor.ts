import { GoogleGenAI } from '@google/genai';
import { SocialPost } from './salesChannelTypes.ts';
import { ModelManager } from '../kernel/ModelManager.ts';

export class ContentDistributionAgent {
  /**
   * Adapta o conteúdo base de forma inteligente para os canais específicos
   */
  public static async adaptContent(
    baseText: string,
    targetChannel: 'instagram' | 'facebook' | 'tiktok' | 'youtube_shorts'
  ): Promise<{ caption: string; hashtags: string[]; videoTitle?: string; scheduledTime: string }> {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      try {
        const ai = new GoogleGenAI({
          apiKey: key,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });

        const prompt = `Aja como o ContentDistributionAgent.
Adapte este conteúdo para o formato ideal do canal "${targetChannel.toUpperCase()}".
Conteúdo Base: "${baseText}"

Diretrizes de Adaptação:
- Instagram: Formato carrossel ou Reels, legenda engajadora com perguntas, espaçamentos e emojis.
- Facebook: Texto mais completo, link claro para chamada de ação, tom amigável e profissional.
- TikTok: Gancho inicial fortíssimo de 3 segundos no roteiro de texto, hashtags ultra virais, ritmo rápido.
- YouTube Shorts: Roteiro super direto de até 60 segundos com título impactante de busca.

Retorne um JSON estrito correspondente ao formato:
{
  "caption": "Legenda adaptada para o canal selecionado",
  "hashtags": ["tag1", "tag2", "tag3"],
  "videoTitle": "Título do vídeo se aplicável (opcional)",
  "scheduledTime": "ex: 12:00"
}`;

        const response = await ModelManager.generateContent('content_distribution_agent', ai, {
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });

        const data = JSON.parse(response.text || '{}');
        return {
          caption: data.caption || baseText,
          hashtags: data.hashtags || ['viral', targetChannel],
          videoTitle: data.videoTitle,
          scheduledTime: data.scheduledTime || '14:00'
        };
      } catch (err: any) {
        console.warn('[ContentDistributionAgent] Falha ao chamar Gemini para adaptação:', err.message);
      }
    }

    // Fallback didático/estruturado
    if (targetChannel === 'tiktok') {
      return {
        caption: `🚨 GANCHO DE 3 SEGUNDOS: Pare de fazer tudo manual! Veja esse tutorial rápido até o final. 👀 ${baseText.substring(0, 80)}...`,
        hashtags: ['tiktokbrasil', 'foryou', 'produtividade', 'dicasdeia'],
        videoTitle: 'Como automatizar tudo em menos de 2 minutos',
        scheduledTime: '18:00'
      };
    } else if (targetChannel === 'youtube_shorts') {
      return {
        caption: `A melhor automação que você verá hoje! Passo a passo rápido e descomplicado. Link nos comentários!`,
        hashtags: ['shorts', 'tecnologia', 'tutorial', 'business'],
        videoTitle: 'Método Secreto de Produtividade Revelado 🤫',
        scheduledTime: '11:30'
      };
    } else if (targetChannel === 'facebook') {
      return {
        caption: `💡 Olá, parceiros comerciais e lojistas! Se você busca mais tempo livre e eficiência no seu dia a dia, confira nosso novo guia: "${baseText}"`,
        hashtags: ['FacebookMarketing', 'Empreendedorismo', 'ProdutividadeNoTrabalho'],
        scheduledTime: '09:00'
      };
    } else {
      return {
        caption: `📸 FEED: Você sabia que a maioria das empresas perde até 40% das vendas por falta de agilidade no WhatsApp? 😱 Quer mudar isso? Comente "QUERO" que te explico.`,
        hashtags: ['InstagramGrowth', 'MarketingDeConteudo', 'SolucaoDeDores'],
        scheduledTime: '19:45'
      };
    }
  }
}
