import { ConnectorConfig } from './connectorFactory.ts';
import { ConnectorRegistry } from './connectorRegistry.ts';
import { CredentialVault } from './credentialVault.ts';
import { ConnectorMonitor } from './connectorMonitor.ts';
import { IntegrationEventBus } from './integrationEvents.ts';

export class ConnectorManager {
  /**
   * Instala, configura e ativa um conector oficial no sistema
   */
  public static async installConnector(params: {
    tenantId: string;
    connectorId: string;
    credentials?: { key: string; value: string }[];
    webhooks?: { name: string; url: string }[];
  }): Promise<ConnectorConfig> {
    const available = ConnectorRegistry.getAvailableConnectors().find(c => c.id === params.connectorId);
    if (!available) {
      throw new Error(`O conector '${params.connectorId}' não foi localizado no catálogo de disponíveis.`);
    }

    // 1. Criptografar e salvar as credenciais no Vault isoladas por Tenant
    if (params.credentials) {
      for (const cred of params.credentials) {
        await CredentialVault.saveCredential(params.tenantId, params.connectorId, cred.key, cred.value);
      }
    }

    // 2. Definir configuração estrutural
    const config: ConnectorConfig = {
      id: params.connectorId,
      name: available.name,
      category: available.category as any,
      version: available.version,
      status: 'active',
      dependencies: [],
      permissions: ['READ', 'WRITE'],
      supportedEvents: available.supportedEvents,
      webhooks: params.webhooks ? params.webhooks.map(w => ({ name: w.name, url: w.url, status: 'active' })) : [],
      rateLimits: {
        limit: 150,
        windowSeconds: 60
      }
    };

    // 3. Registrar no catálogo central de instalados
    ConnectorRegistry.registerInstalledConnector(config);

    // 4. Emitir evento de instalação bem-sucedida
    IntegrationEventBus.emit('CONNECTOR_INSTALLED', params.connectorId, { tenantId: params.tenantId });

    return config;
  }

  /**
   * Executa uma chamada/ação de API simulada gravando tempos de resposta e falhas
   */
  public static async executeAction(
    tenantId: string,
    connectorId: string,
    action: string,
    params: any
  ): Promise<any> {
    const config = ConnectorRegistry.getConnectorById(connectorId);
    if (!config) {
      throw new Error(`O conector '${connectorId}' precisa ser instalado antes de realizar ações.`);
    }

    if (config.status !== 'active') {
      throw new Error(`Conector '${connectorId}' está inoperante no momento. Status: ${config.status}.`);
    }

    const startTime = Date.now();
    let success = true;
    let result: any = null;

    try {
      // Carregar chave descriptografada para verificar se existe (auditoria de leitura gravada automaticamente)
      await CredentialVault.getCredential(tenantId, connectorId, 'API_KEY');

      // Simulação do tempo de resposta (entre 150ms e 1000ms)
      const delay = Math.floor(Math.random() * 850) + 150;
      await new Promise(resolve => setTimeout(resolve, delay));

      if (params?.forceFailure) {
        throw new Error(`Timeout de comunicação com o servidor remoto da API ${connectorId}`);
      }

      result = {
        success: true,
        connectorId,
        action,
        timestamp: new Date().toISOString(),
        data: {
          processed: true,
          details: `Ação '${action}' executada com êxito pelo conector ${connectorId}.`,
          payload: params
        }
      };
    } catch (err: any) {
      success = false;
      result = {
        success: false,
        error: err.message
      };

      // Atualizar status do conector para sinalizar o erro
      ConnectorRegistry.updateConnectorConfig(connectorId, { status: 'error' });
      
      // Emitir eventos necessários para monitoramento e re-tentativas ou correções
      IntegrationEventBus.emit('CONECTOR_CORRIGIR', connectorId, { action, error: err.message });
      throw err;
    } finally {
      const durationMs = Date.now() - startTime;
      ConnectorMonitor.recordMetric(connectorId, durationMs, success);
    }

    return result;
  }

  /**
   * Desativa temporariamente as operações de um conector específico
   */
  public static disableConnector(connectorId: string): void {
    const config = ConnectorRegistry.getConnectorById(connectorId);
    if (!config) return;

    ConnectorRegistry.updateConnectorConfig(connectorId, { status: 'inactive' });
    IntegrationEventBus.emit('CONNECTOR_DISABLED', connectorId, { disabledAt: new Date().toISOString() });
  }

  /**
   * Reativa/Corrige e devolve o conector para a fila operacional ativa
   */
  public static enableConnector(connectorId: string): void {
    const config = ConnectorRegistry.getConnectorById(connectorId);
    if (!config) return;

    ConnectorRegistry.updateConnectorConfig(connectorId, { status: 'active' });
    IntegrationEventBus.emit('CONNECTOR_UPDATED', connectorId, { status: 'active', updatedAt: new Date().toISOString() });
  }
}
