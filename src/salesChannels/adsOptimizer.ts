import { AdsCampaign } from './salesChannelTypes.ts';
import { CampaignManager } from './campaignManager.ts';
import { MetaAdsAgent } from './metaAdsAgent.ts';
import { Kernel } from '../kernel/index.ts';

export class AdsOptimizer {
  public static optimizeAllCampaigns(): { updatedCampaigns: AdsCampaign[]; log: string[] } {
    const campaigns = CampaignManager.getCampaigns();
    const optimized = MetaAdsAgent.optimizeCampaigns(campaigns);
    const log: string[] = [];

    // Save back to CampaignManager
    optimized.forEach(optCamp => {
      // Apply budget changes and status changes
      CampaignManager.updateCampaignBudget(optCamp.id, optCamp.budget);
      CampaignManager.updateCampaignStatus(optCamp.id, optCamp.status);

      if (optCamp.reasons && optCamp.reasons.length > 0) {
        log.push(`[${optCamp.name}] Otimização: ${optCamp.reasons.join(' | ')}`);
      }
    });

    // Notify other agents / Kernel
    try {
      const kernel = Kernel.getInstance();
      kernel.publishEvent('CAMPAIGNS_OPTIMIZED' as any, 'sales_channel_hub', {
        optimizedCount: optimized.length,
        log
      });
      kernel.logAudit(
        'CAMPAIGNS_OPTIMIZED',
        'sales_channel_hub',
        `Mecanismo de tráfego pago otimizou ${optimized.length} campanhas de anúncios comerciais automaticamente.`
      );
    } catch (err: any) {
      console.warn('[AdsOptimizer] Falha ao publicar evento no Kernel:', err.message);
    }

    return {
      updatedCampaigns: CampaignManager.getCampaigns(),
      log
    };
  }
}
