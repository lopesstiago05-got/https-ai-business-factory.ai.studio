export type ChannelStatus = 'CONNECTED' | 'DISCONNECTED' | 'NEEDS_AUTH' | 'ERROR';

export type ChannelType = 'instagram' | 'facebook' | 'tiktok' | 'meta_ads' | 'google_ads' | 'whatsapp';

export interface ChannelMetrics {
  followers: number;
  reach: number;
  clicks: number;
  leads: number;
  sales: number;
  spent: number;
  revenue: number;
  roi: number;
}

export interface SalesChannel {
  id: string;
  name: string;
  type: ChannelType;
  status: ChannelStatus;
  metrics: ChannelMetrics;
  username?: string;
  connectedAt?: string;
  lastSync?: string;
}

export interface SocialPost {
  id: string;
  channelId: string;
  type: 'post' | 'reels' | 'stories' | 'video' | 'shorts';
  title?: string;
  caption: string;
  hashtags: string[];
  imageUrl?: string;
  scheduledFor?: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  metrics?: {
    likes: number;
    comments: number;
    shares: number;
    views?: number;
  };
}

export interface AdsCampaign {
  id: string;
  channelId: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'DRAFT';
  objective: 'CONVERSION' | 'LEADS' | 'TRAFFIC' | 'ENGAGEMENT';
  budget: number;
  spent: number;
  leads: number;
  sales: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
  suggestedAction?: 'SCALE_UP' | 'SCALE_DOWN' | 'PAUSE' | 'NONE';
  reasons?: string[];
}

export interface WhatsAppMessage {
  id: string;
  to: string;
  body: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  type: 'manual' | 'notification' | 'recovery' | 'onboarding';
}

export interface ChannelAnalyticsSummary {
  totalFollowers: number;
  totalReach: number;
  totalClicks: number;
  totalLeads: number;
  totalSales: number;
  totalSpent: number;
  totalRevenue: number;
  overallRoi: number;
  channels: SalesChannel[];
}
