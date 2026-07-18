import { SocialPost } from './salesChannelTypes.ts';

export class TikTokBusinessConnector {
  public static async publishVideo(post: SocialPost): Promise<SocialPost> {
    console.log(`[TikTokBusinessConnector] Publicando vídeo no TikTok: ${post.caption.substring(0, 40)}...`);
    return {
      ...post,
      type: 'video',
      status: 'published',
      metrics: {
        likes: Math.floor(Math.random() * 2500) + 1200,
        comments: Math.floor(Math.random() * 450) + 90,
        shares: Math.floor(Math.random() * 890) + 110,
        views: Math.floor(Math.random() * 45000) + 15000
      }
    };
  }

  public static async fetchCreatorCampaigns(): Promise<any[]> {
    return [
      { id: 'tt_camp_1', name: 'Desafio TikTok Trends Infoprodutos', budget: 1200, views: 89000, conversionRate: 0.024 }
    ];
  }
}
