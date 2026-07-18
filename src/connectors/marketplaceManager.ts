import { MarketplaceConnector, ConnectorStatus, ConnectorMetrics } from './connectorTypes.ts';
import { Repository } from '../db/repository.ts';
import { SalesDataProcessor } from './salesDataProcessor.ts';
import { Kernel } from '../kernel/index.ts';
import { logInfo, logWarn, logError } from '../logs/logger.ts';
import { DigitalSale, PlatformConnection } from '../types.ts';

// Base class to share common utility methods across all connectors
abstract class BaseConnector implements MarketplaceConnector {
  abstract id: string;
  abstract name: string;
  abstract tokenPrefix: string;

  public status: ConnectorStatus = 'DISCONNECTED';
  public lastSync?: string;
  public metrics: ConnectorMetrics = {
    totalSales: 0,
    totalRevenue: 0,
    commissionPaid: 0,
    productsPublished: 0
  };

  protected encrypt(text: string): string {
    return Buffer.from(text).toString('base64');
  }

  protected decrypt(cipher: string): string {
    return Buffer.from(cipher, 'base64').toString('utf-8');
  }

  protected async getSavedConnection(): Promise<PlatformConnection | null> {
    const connections = await Repository.getPlatformConnections();
    return connections.find(c => c.provider === this.id) || null;
  }

  protected async saveState(status: ConnectorStatus, token: string | null): Promise<void> {
    this.status = status;
    const existing = await this.getSavedConnection();
    
    // Map ConnectorStatus to PlatformConnection['status']
    let dbStatus: PlatformConnection['status'] = 'disconnected';
    if (status === 'CONNECTED') dbStatus = 'connected';
    else if (status === 'ERROR') dbStatus = 'error';
    else if (status === 'SYNCING') dbStatus = 'testing'; // or testing

    const conn: PlatformConnection = {
      id: existing?.id || `conn-${this.id}`,
      provider: this.id,
      status: dbStatus,
      encryptedCredentials: token ? this.encrypt(token) : (existing?.encryptedCredentials || null),
      lastSync: this.lastSync || existing?.lastSync || null,
      createdAt: existing?.createdAt || new Date().toISOString()
    };
    await Repository.savePlatformConnection(conn);
  }

  public async loadFromDB(): Promise<void> {
    const conn = await this.getSavedConnection();
    if (conn) {
      if (conn.status === 'connected') {
        this.status = 'CONNECTED';
      } else if (conn.status === 'error') {
        this.status = 'ERROR';
      } else {
        this.status = 'DISCONNECTED';
      }
      this.lastSync = conn.lastSync || undefined;
    }
    await this.updateMetrics();
  }

  public async updateMetrics(): Promise<void> {
    const sales = await Repository.getDigitalSales();
    const providerSales = sales.filter(s => s.provider === this.id);
    const approved = providerSales.filter(s => s.status === 'approved' || s.status === 'complete');
    
    const systemState = await Repository.getSystemState();
    const publishedCount = (systemState.products || []).filter(p => p.paymentProvider === this.id && p.status === 'published').length;

    this.metrics = {
      totalSales: approved.length,
      totalRevenue: approved.reduce((sum, s) => sum + s.amount, 0),
      commissionPaid: approved.reduce((sum, s) => sum + s.commission, 0),
      productsPublished: publishedCount || (approved.length > 0 ? 1 : 0) // fallback
    };
  }

  public async connect(token: string): Promise<void> {
    logInfo(`[Connector] Conectando ao ${this.name}...`);
    if (!token || token.trim() === '') {
      throw new Error(`Token do conector ${this.name} é inválido.`);
    }

    let processedToken = token.trim();
    if (!processedToken.startsWith(this.tokenPrefix)) {
      logInfo(`[Connector] Token sem o prefixo esperado '${this.tokenPrefix}'. Adicionando prefixo automaticamente.`);
      processedToken = `${this.tokenPrefix}${processedToken}`;
    }

    await this.saveState('CONNECTED', processedToken);
    await this.updateMetrics();

    // Evento de conexão no Kernel
    await Kernel.getInstance().publishEvent('IntegrationConnected', `${this.id}_connector`, {
      provider: this.id,
      status: 'connected',
      timestamp: new Date().toISOString()
    });
  }

  public async disconnect(): Promise<void> {
    logInfo(`[Connector] Desconectando conector ${this.name}...`);
    await this.saveState('DISCONNECTED', null);
    
    await Kernel.getInstance().publishEvent('IntegrationDisconnected', `${this.id}_connector`, {
      provider: this.id,
      status: 'disconnected',
      timestamp: new Date().toISOString()
    });
  }

  public async publishProduct(product: any): Promise<{ success: boolean; externalId: string; url: string }> {
    if (this.status !== 'CONNECTED') {
      throw new Error(`Não é possível publicar: Conector ${this.name} está offline ou desconectado.`);
    }

    logInfo(`[Connector] Publicando produto "${product.name}" no ${this.name}...`);
    
    // Simular API Call de publicação
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const externalId = `${this.id.substring(0, 3)}-prod-${Math.floor(Math.random() * 1000000)}`;
    const url = `https://checkout.${this.id}.com/${externalId}`;

    // Atualizar produto no repositório de produtos se id existir
    if (product.id) {
      try {
        const state = await Repository.getSystemState();
        const updatedProducts = (state.products || []).map(p => {
          if (p.id === product.id) {
            return {
              ...p,
              status: 'published' as const,
              paymentProvider: this.id,
              checkoutUrl: url,
              publicationLogs: [...(p.publicationLogs || []), `Publicado com sucesso no ${this.name} em ${new Date().toLocaleString()}`]
            };
          }
          return p;
        });
        await Repository.saveState({ products: updatedProducts });
      } catch (err: any) {
        logWarn(`[Connector] Erro ao atualizar status de publicação do produto: ${err.message}`);
      }
    }

    // Publicar evento ProductPublished no Kernel
    await Kernel.getInstance().publishEvent('ProductPublished', `${this.id}_connector`, {
      productId: product.id || externalId,
      name: product.name,
      price: product.price || 197.0,
      provider: this.id,
      externalId,
      checkoutUrl: url,
      timestamp: new Date().toISOString()
    });

    // Publicar evento ProductAvailableForSale
    await Kernel.getInstance().publishEvent('ProductAvailableForSale', `${this.id}_connector`, {
      productId: product.id || externalId,
      name: product.name,
      price: product.price || 197.0,
      provider: this.id,
      checkoutUrl: url,
      timestamp: new Date().toISOString()
    });

    await this.updateMetrics();
    return { success: true, externalId, url };
  }

  public async getSales(): Promise<any[]> {
    const sales = await Repository.getDigitalSales();
    return sales.filter(s => s.provider === this.id);
  }

  public async handleWebhook(payload: any): Promise<{ success: boolean; eventId: string }> {
    logInfo(`[Connector] Processando webhook no ${this.name}: ${JSON.stringify(payload)}`);
    
    const externalId = payload.id || `wh-${this.id}-${Date.now()}`;
    const amount = Number(payload.amount) || 197.0;
    const commission = Number(payload.commission) || (amount * 0.1);
    const event = payload.event || 'SALE_COMPLETED';
    const buyer = payload.buyer_email || 'comprador@exemplo.com';
    const productId = payload.product_id || null;

    let status: DigitalSale['status'] = 'approved';
    if (event === 'PAYMENT_FAILED' || event === 'SALE_CANCELED') {
      status = 'canceled';
    } else if (event === 'REFUND_CREATED' || event === 'SALE_REFUNDED') {
      status = 'refunded';
    } else if (event === 'PAYMENT_PENDING') {
      status = 'approved'; // keep as approved or active pending
    }

    const saleRecord: DigitalSale = {
      id: `sale-${this.id}-${externalId}`,
      provider: this.id,
      externalId,
      productId,
      amount,
      commission,
      status,
      buyerReference: buyer,
      createdAt: new Date().toISOString()
    };

    await SalesDataProcessor.processSale(saleRecord);
    await this.updateMetrics();

    return { success: true, eventId: saleRecord.id };
  }
}

export class HotmartConnector extends BaseConnector {
  id = 'hotmart';
  name = 'Hotmart';
  tokenPrefix = 'HOT-';

  private static instance: HotmartConnector | null = null;
  public static getInstance(): HotmartConnector {
    if (!this.instance) {
      this.instance = new HotmartConnector();
    }
    return this.instance;
  }
}

export class KiwifyConnector extends BaseConnector {
  id = 'kiwify';
  name = 'Kiwify';
  tokenPrefix = 'KIW-';

  private static instance: KiwifyConnector | null = null;
  public static getInstance(): KiwifyConnector {
    if (!this.instance) {
      this.instance = new KiwifyConnector();
    }
    return this.instance;
  }
}

export class EduzzConnector extends BaseConnector {
  id = 'eduzz';
  name = 'Eduzz';
  tokenPrefix = 'EDZ-';

  private static instance: EduzzConnector | null = null;
  public static getInstance(): EduzzConnector {
    if (!this.instance) {
      this.instance = new EduzzConnector();
    }
    return this.instance;
  }
}

export class MonetizzeConnector extends BaseConnector {
  id = 'monetizze';
  name = 'Monetizze';
  tokenPrefix = 'MON-';

  private static instance: MonetizzeConnector | null = null;
  public static getInstance(): MonetizzeConnector {
    if (!this.instance) {
      this.instance = new MonetizzeConnector();
    }
    return this.instance;
  }
}

export class BraipConnector extends BaseConnector {
  id = 'braip';
  name = 'Braip';
  tokenPrefix = 'BRP-';

  private static instance: BraipConnector | null = null;
  public static getInstance(): BraipConnector {
    if (!this.instance) {
      this.instance = new BraipConnector();
    }
    return this.instance;
  }
}

export class MarketplaceManager {
  private static instance: MarketplaceManager | null = null;
  private connectors: Map<string, MarketplaceConnector> = new Map();

  private constructor() {
    this.connectors.set('hotmart', HotmartConnector.getInstance());
    this.connectors.set('kiwify', KiwifyConnector.getInstance());
    this.connectors.set('eduzz', EduzzConnector.getInstance());
    this.connectors.set('monetizze', MonetizzeConnector.getInstance());
    this.connectors.set('braip', BraipConnector.getInstance());
  }

  public static getInstance(): MarketplaceManager {
    if (!this.instance) {
      this.instance = new MarketplaceManager();
    }
    return this.instance;
  }

  public getConnector(id: string): MarketplaceConnector | undefined {
    return this.connectors.get(id.toLowerCase());
  }

  public getAllConnectors(): MarketplaceConnector[] {
    return Array.from(this.connectors.values());
  }

  public async loadAllConnectors(): Promise<void> {
    for (const connector of this.connectors.values()) {
      if ('loadFromDB' in connector) {
        await (connector as any).loadFromDB();
      }
    }
  }
}
