import { MarketplaceManager } from './marketplaceManager.ts';
import { SyncEngine } from './syncEngine.ts';
import { WebhookManager } from './webhookManager.ts';
import { Repository } from '../db/repository.ts';
import { ConnectorProject, ConnectorWebhookPayload } from './connectorTypes.ts';
import { logInfo, logError } from '../logs/logger.ts';
import { DigitalSale } from '../types.ts';

export class ConnectorService {
  /**
   * Returns a clean list of all connectors with their connection statuses and metrics.
   */
  public static async getConnectors(): Promise<ConnectorProject[]> {
    const manager = MarketplaceManager.getInstance();
    await manager.loadAllConnectors();

    return manager.getAllConnectors().map(connector => ({
      id: connector.id,
      name: connector.name,
      provider: connector.id,
      status: connector.status,
      lastSync: connector.lastSync,
      metrics: connector.metrics
    }));
  }

  /**
   * Connects an external marketplace by its provider ID and credentials.
   */
  public static async connect(provider: string, token: string): Promise<{ success: boolean; message: string }> {
    const manager = MarketplaceManager.getInstance();
    const connector = manager.getConnector(provider);

    if (!connector) {
      throw new Error(`Conector de marketplace inválido ou não suportado: "${provider}"`);
    }

    await connector.connect(token);
    return {
      success: true,
      message: `Conector ${connector.name} conectado com sucesso.`
    };
  }

  /**
   * Disconnects an external marketplace connector.
   */
  public static async disconnect(provider: string): Promise<{ success: boolean; message: string }> {
    const manager = MarketplaceManager.getInstance();
    const connector = manager.getConnector(provider);

    if (!connector) {
      throw new Error(`Conector de marketplace inválido: "${provider}"`);
    }

    await connector.disconnect();
    return {
      success: true,
      message: `Conector ${connector.name} desconectado com sucesso.`
    };
  }

  /**
   * Publishes a product created within the AI Business Factory to an external marketplace.
   */
  public static async publishProduct(productId: string, provider: string): Promise<{ success: boolean; url: string; externalId: string }> {
    const manager = MarketplaceManager.getInstance();
    await manager.loadAllConnectors();
    const connector = manager.getConnector(provider);

    if (!connector) {
      throw new Error(`Conector de marketplace inválido: "${provider}"`);
    }

    // Buscar o produto real no repositório
    const state = await Repository.getSystemState();
    const product = (state.products || []).find(p => p.id === productId);

    if (!product) {
      throw new Error(`Produto com ID "${productId}" não encontrado no sistema.`);
    }

    const result = await connector.publishProduct(product);
    return {
      success: true,
      url: result.url,
      externalId: result.externalId
    };
  }

  /**
   * Returns a complete list of recorded digital sales transactions.
   */
  public static async getSales(): Promise<DigitalSale[]> {
    return await Repository.getDigitalSales();
  }

  /**
   * Executes manual sync for all connected platforms.
   */
  public static async triggerSync(): Promise<{ synchronizedConnectors: string[]; totalSalesSynced: number }> {
    return await SyncEngine.syncAll();
  }

  /**
   * Processes an incoming webhook event.
   */
  public static async receiveWebhook(payload: ConnectorWebhookPayload): Promise<{ success: boolean; eventId: string }> {
    return await WebhookManager.receiveWebhook(payload);
  }
}
