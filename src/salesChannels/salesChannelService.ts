import { SalesChannel, SocialPost, AdsCampaign, WhatsAppMessage, ChannelAnalyticsSummary } from './salesChannelTypes.ts';
import { SocialAnalytics } from './socialAnalytics.ts';
import { CampaignManager } from './campaignManager.ts';
import { AdsOptimizer } from './adsOptimizer.ts';
import { InstagramBusinessConnector } from './instagramConnector.ts';
import { FacebookBusinessConnector } from './facebookConnector.ts';
import { TikTokBusinessConnector } from './tiktokConnector.ts';
import { WhatsAppBusinessConnector } from './whatsappConnector.ts';
import { GoogleAdsConnector } from './googleAdsConnector.ts';
import { MetaAdsAgent } from './metaAdsAgent.ts';
import { ContentDistributionAgent } from './contentDistributor.ts';
import { AuditService } from '../enterprise/auditService.ts';
import { MonitoringService } from '../enterprise/monitoringService.ts';
import { Kernel } from '../kernel/index.ts';

export class SalesChannelService {
  public static getChannels(): SalesChannel[] {
    return SocialAnalytics.getChannels();
  }

  public static getAnalyticsSummary(): ChannelAnalyticsSummary {
    return SocialAnalytics.getSummary();
  }

  public static connectChannel(type: any, username?: string): SalesChannel {
    const channel = SocialAnalytics.connectChannel(type, username);
    AuditService.register('tenant_default', 'usr_default', 'creator@enterprise.com', 'INTEGRATION_CONNECTED' as any, 'SUCCESS', {
      channelId: channel.id,
      channelType: type,
      username
    }, 'sales-channels');
    return channel;
  }

  public static disconnectChannel(id: string): boolean {
    const success = SocialAnalytics.disconnectChannel(id);
    if (success) {
      AuditService.register('tenant_default', 'usr_default', 'creator@enterprise.com', 'INTEGRATION_DISCONNECTED' as any, 'SUCCESS', {
        channelId: id
      }, 'sales-channels');
    }
    return success;
  }

  public static getCampaigns(): AdsCampaign[] {
    return CampaignManager.getCampaigns();
  }

  public static async createCampaign(
    name: string,
    channelType: 'meta_ads' | 'google_ads',
    budget: number,
    objective: 'CONVERSION' | 'LEADS' | 'TRAFFIC' | 'ENGAGEMENT'
  ): Promise<AdsCampaign> {
    const startTime = Date.now();
    let newCamp: AdsCampaign;

    if (channelType === 'meta_ads') {
      const strategy = await MetaAdsAgent.generateCampaignStrategy(name, 'Promessa comercial otimizada de conversão direta', objective);
      newCamp = strategy.campaign as AdsCampaign;
      newCamp.name = name;
      newCamp.budget = budget;
    } else {
      newCamp = await GoogleAdsConnector.createCampaign(name, budget, ['comprar infoproduto', 'curso online', 'treinamento']);
    }

    CampaignManager.createCampaign(newCamp);

    AuditService.register('tenant_default', 'usr_default', 'creator@enterprise.com', 'AGENT_EXECUTION', 'SUCCESS', {
      campaignId: newCamp.id,
      name,
      channelType,
      budget
    }, 'marketing-center');

    MonitoringService.updateAgentMetrics('marketing-center', Date.now() - startTime, true, 10);
    return newCamp;
  }

  public static optimizeCampaigns(): { updatedCampaigns: AdsCampaign[]; log: string[] } {
    return AdsOptimizer.optimizeAllCampaigns();
  }

  public static async publishContent(
    channelType: 'instagram' | 'facebook' | 'tiktok',
    baseText: string
  ): Promise<SocialPost> {
    const startTime = Date.now();
    const target = channelType === 'youtube_shorts' as any ? 'youtube_shorts' : channelType;
    const adapted = await ContentDistributionAgent.adaptContent(baseText, target as any);

    let finalPost: SocialPost = {
      id: `post_${Math.random().toString(36).substr(2, 9)}`,
      channelId: `ch_${channelType}`,
      type: channelType === 'tiktok' ? 'video' : 'post',
      caption: adapted.caption,
      hashtags: adapted.hashtags,
      status: 'draft',
      imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=600&q=80'
    };

    if (channelType === 'instagram') {
      finalPost = await InstagramBusinessConnector.publishPost(finalPost);
    } else if (channelType === 'facebook') {
      finalPost = await FacebookBusinessConnector.publishToPage(finalPost);
    } else {
      finalPost = await TikTokBusinessConnector.publishVideo(finalPost);
    }

    AuditService.register('tenant_default', 'usr_default', 'creator@enterprise.com', 'AGENT_EXECUTION', 'SUCCESS', {
      postId: finalPost.id,
      channelType,
      caption: finalPost.caption.substring(0, 50)
    }, 'writer-studio');

    MonitoringService.updateAgentMetrics('writer-studio', Date.now() - startTime, true, 8);
    return finalPost;
  }

  public static async sendWhatsApp(to: string, body: string, type?: any): Promise<WhatsAppMessage> {
    return WhatsAppBusinessConnector.sendMessage(to, body, type);
  }

  public static async handleLaunchPreparation(productId: string, productName: string, price: number, checkoutUrl: string): Promise<void> {
    const kernel = Kernel.getInstance();
    
    // 1. Criar posts automáticos de lançamento
    const baseText = `🚨 LANÇAMENTO OFICIAL! O incrível "${productName}" acabou de ir ao ar por apenas R$ ${price}! Domine novos mercados agora mesmo. 🚀`;
    await this.publishContent('instagram', baseText);
    await this.publishContent('tiktok', baseText);

    // 2. Criar campanha de tráfego pago automática
    await this.createCampaign(`Lançamento ${productName} - Conversão Tráfego Frio`, 'meta_ads', 150.00, 'CONVERSION');

    // 3. Notificar via WhatsApp do sucesso da automação
    await WhatsAppBusinessConnector.sendMessage(
      '+55 11 99999-8888',
      `Fábrica de Canais ativada para o lançamento do produto ${productName}! Conteúdo distribuído e campanhas de anúncios Meta Ads criadas de forma 100% autônoma! 📈`,
      'notification'
    );

    await kernel.logAudit(
      'PRODUCT_MARKETING_READY',
      'sales_channel_hub',
      `Canais de tráfego ativados para o produto ${productName}. Instagram, TikTok, e Meta Ads rodando com sucesso.`
    );
  }
}
