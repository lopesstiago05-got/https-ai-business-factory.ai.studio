export type ConnectorStatus = 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'SYNCING';

export interface ConnectorMetrics {
  totalSales: number;
  totalRevenue: number;
  commissionPaid: number;
  productsPublished: number;
}

export interface MarketplaceConnector {
  id: string;
  name: string;
  status: ConnectorStatus;
  lastSync?: string;
  metrics: ConnectorMetrics;
  connect(token: string): Promise<void>;
  disconnect(): Promise<void>;
  publishProduct(product: any): Promise<{ success: boolean; externalId: string; url: string }>;
  getSales(): Promise<any[]>;
  handleWebhook(payload: any): Promise<{ success: boolean; eventId: string }>;
  updateMetrics(): Promise<void>;
}

export interface ConnectorProject {
  id: string;
  name: string;
  provider: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'SYNCING';
  lastSync?: string;
  metrics: ConnectorMetrics;
}

export interface PublishingPayload {
  productId: string;
  marketplaceId: string;
}

export interface ConnectorWebhookPayload {
  event: 'SALE_COMPLETED' | 'PAYMENT_PENDING' | 'PAYMENT_FAILED' | 'REFUND_CREATED' | 'CUSTOMER_CREATED';
  provider: string;
  id: string;
  amount: number;
  commission: number;
  buyer_email: string;
  product_id: string;
}
