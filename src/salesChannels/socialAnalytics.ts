import { ChannelAnalyticsSummary, SalesChannel } from './salesChannelTypes.ts';

export class SocialAnalytics {
  private static channels: SalesChannel[] = [];

  public static initializeDefaultChannels(): SalesChannel[] {
    if (this.channels.length === 0) {
      this.channels = [
        {
          id: 'ch_ig',
          name: 'Instagram Business',
          type: 'instagram',
          status: 'CONNECTED',
          username: '@coprodutor_oficial',
          connectedAt: new Date(Date.now() - 3600000 * 240).toISOString(),
          lastSync: new Date().toISOString(),
          metrics: {
            followers: 12400,
            reach: 45000,
            clicks: 2100,
            leads: 340,
            sales: 45,
            spent: 0,
            revenue: 4365,
            roi: 0
          }
        },
        {
          id: 'ch_fb',
          name: 'Facebook Comercial',
          type: 'facebook',
          status: 'CONNECTED',
          username: 'CoProdutor Comercial',
          connectedAt: new Date(Date.now() - 3600000 * 240).toISOString(),
          lastSync: new Date().toISOString(),
          metrics: {
            followers: 8400,
            reach: 18000,
            clicks: 980,
            leads: 110,
            sales: 12,
            spent: 0,
            revenue: 1164,
            roi: 0
          }
        },
        {
          id: 'ch_tt',
          name: 'TikTok Business',
          type: 'tiktok',
          status: 'CONNECTED',
          username: '@coprodutor_tiktok',
          connectedAt: new Date(Date.now() - 3600000 * 180).toISOString(),
          lastSync: new Date().toISOString(),
          metrics: {
            followers: 24500,
            reach: 120000,
            clicks: 4800,
            leads: 780,
            sales: 89,
            spent: 0,
            revenue: 8633,
            roi: 0
          }
        },
        {
          id: 'ch_meta',
          name: 'Meta Ads Manager',
          type: 'meta_ads',
          status: 'CONNECTED',
          username: 'Meta_Ads_Prod_1',
          connectedAt: new Date(Date.now() - 3600000 * 220).toISOString(),
          lastSync: new Date().toISOString(),
          metrics: {
            followers: 0,
            reach: 340000,
            clicks: 12000,
            leads: 1800,
            sales: 340,
            spent: 4690,
            revenue: 32980,
            roi: 6.03
          }
        },
        {
          id: 'ch_google',
          name: 'Google Ads Manager',
          type: 'google_ads',
          status: 'CONNECTED',
          username: 'Google_Ads_Prod_1',
          connectedAt: new Date(Date.now() - 3600000 * 200).toISOString(),
          lastSync: new Date().toISOString(),
          metrics: {
            followers: 0,
            reach: 150000,
            clicks: 8900,
            leads: 1120,
            sales: 210,
            spent: 5400,
            revenue: 20370,
            roi: 2.77
          }
        },
        {
          id: 'ch_wa',
          name: 'WhatsApp Business API',
          type: 'whatsapp',
          status: 'CONNECTED',
          username: '+55 11 99999-8888',
          connectedAt: new Date(Date.now() - 3600000 * 300).toISOString(),
          lastSync: new Date().toISOString(),
          metrics: {
            followers: 0,
            reach: 4500,
            clicks: 4100,
            leads: 4500,
            sales: 380,
            spent: 0,
            revenue: 36860,
            roi: 0
          }
        }
      ];
    }
    return this.channels;
  }

  public static getChannels(): SalesChannel[] {
    this.initializeDefaultChannels();
    return this.channels;
  }

  public static getSummary(): ChannelAnalyticsSummary {
    const channels = this.getChannels();
    let totalFollowers = 0;
    let totalReach = 0;
    let totalClicks = 0;
    let totalLeads = 0;
    let totalSales = 0;
    let totalSpent = 0;
    let totalRevenue = 0;

    channels.forEach(ch => {
      totalFollowers += ch.metrics.followers;
      totalReach += ch.metrics.reach;
      totalClicks += ch.metrics.clicks;
      totalLeads += ch.metrics.leads;
      totalSales += ch.metrics.sales;
      totalSpent += ch.metrics.spent;
      totalRevenue += ch.metrics.revenue;
    });

    const overallRoi = totalSpent > 0 ? Number(((totalRevenue - totalSpent) / totalSpent).toFixed(2)) : 0;

    return {
      totalFollowers,
      totalReach,
      totalClicks,
      totalLeads,
      totalSales,
      totalSpent,
      totalRevenue,
      overallRoi,
      channels
    };
  }

  public static connectChannel(type: 'instagram' | 'facebook' | 'tiktok' | 'meta_ads' | 'google_ads' | 'whatsapp', username?: string): SalesChannel {
    this.initializeDefaultChannels();
    const existing = this.channels.find(ch => ch.type === type);
    if (existing) {
      existing.status = 'CONNECTED';
      if (username) existing.username = username;
      existing.lastSync = new Date().toISOString();
      return existing;
    }

    const newChannel: SalesChannel = {
      id: `ch_${Math.random().toString(36).substr(2, 9)}`,
      name: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
      type,
      status: 'CONNECTED',
      username: username || `@user_${type}`,
      connectedAt: new Date().toISOString(),
      lastSync: new Date().toISOString(),
      metrics: { followers: 0, reach: 0, clicks: 0, leads: 0, sales: 0, spent: 0, revenue: 0, roi: 0 }
    };
    this.channels.push(newChannel);
    return newChannel;
  }

  public static disconnectChannel(id: string): boolean {
    this.initializeDefaultChannels();
    const ch = this.channels.find(c => c.id === id);
    if (ch) {
      ch.status = 'DISCONNECTED';
      return true;
    }
    return false;
  }
}
