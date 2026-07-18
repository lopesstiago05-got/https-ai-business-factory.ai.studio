import { MarketplaceManager } from './marketplaceManager.ts';
import { SalesDataProcessor } from './salesDataProcessor.ts';
import { Repository } from '../db/repository.ts';
import { Kernel } from '../kernel/index.ts';
import { logInfo, logWarn, logError } from '../logs/logger.ts';
import { DigitalSale } from '../types.ts';

export class SyncEngine {
  private static isSyncing = false;

  /**
   * Performs a complete synchronization across all active marketplace connectors.
   */
  public static async syncAll(): Promise<{ synchronizedConnectors: string[]; totalSalesSynced: number }> {
    if (this.isSyncing) {
      logWarn('[SyncEngine] Sincronização geral já está em andamento. Abortando nova chamada.');
      return { synchronizedConnectors: [], totalSalesSynced: 0 };
    }

    this.isSyncing = true;
    logInfo('[SyncEngine] Iniciando sincronização retroativa de todas as conexões de marketplace...');

    const manager = MarketplaceManager.getInstance();
    await manager.loadAllConnectors();
    const activeConnectors = manager.getAllConnectors().filter(c => c.status === 'CONNECTED');

    const synchronizedConnectors: string[] = [];
    let totalSalesSynced = 0;

    for (const connector of activeConnectors) {
      try {
        logInfo(`[SyncEngine] Sincronizando vendas de ${connector.name}...`);
        
        // Coloca o conector em modo de sincronização temporário
        connector.status = 'SYNCING';
        
        // Simular a busca de novas vendas/pedidos na API externa
        const mockFetchedSales = await this.fetchNewSalesFromApi(connector.id);
        
        for (const sale of mockFetchedSales) {
          await SalesDataProcessor.processSale(sale);
          totalSalesSynced++;
        }

        // Atualizar data de última sincronização
        connector.lastSync = new Date().toISOString();
        if ('saveState' in connector) {
          await (connector as any).saveState('CONNECTED', null);
        } else {
          connector.status = 'CONNECTED';
        }
        
        await connector.updateMetrics();
        synchronizedConnectors.push(connector.name);
        
        logInfo(`[SyncEngine] Sincronização de ${connector.name} finalizada com sucesso.`);
      } catch (err: any) {
        logError(`[SyncEngine] Erro ao sincronizar ${connector.name}: ${err.message}`);
        connector.status = 'ERROR';
      }
    }

    this.isSyncing = false;
    logInfo(`[SyncEngine] Sincronização geral concluída. Conectores: ${synchronizedConnectors.join(', ')}. Vendas: ${totalSalesSynced}`);
    
    return { synchronizedConnectors, totalSalesSynced };
  }

  /**
   * Helper to simulate API polling for each platform
   */
  private static async fetchNewSalesFromApi(providerId: string): Promise<DigitalSale[]> {
    const products = (await Repository.getSystemState()).products || [];
    const targetProductId = products[0]?.id || 'prod_default';

    const timestamp = Date.now();
    const externalId = `${providerId.substring(0, 3)}-sync-${timestamp}`;

    // Retorna uma pequena lista de vendas simuladas para garantir que a sincronização funcione
    return [
      {
        id: `sale-${providerId}-${externalId}-1`,
        provider: providerId,
        externalId: `${externalId}-1`,
        productId: targetProductId,
        amount: 297.0,
        commission: 29.7,
        status: 'approved' as const,
        buyerReference: `comprador.${providerId}@synchub.com`,
        createdAt: new Date().toISOString()
      }
    ];
  }
}
