import { MarketplaceManager } from './marketplaceManager.ts';
import { ConnectorWebhookPayload } from './connectorTypes.ts';
import { Repository } from '../db/repository.ts';
import { SupervisorAgent } from '../agents/supervisor.ts';
import { logInfo, logWarn, logError } from '../logs/logger.ts';

export class WebhookManager {
  /**
   * Receives a generic or platform-specific webhook payload and routes it appropriately.
   */
  public static async receiveWebhook(payload: ConnectorWebhookPayload): Promise<{ success: boolean; eventId: string }> {
    const provider = (payload.provider || 'hotmart').toLowerCase();
    logInfo(`[WebhookManager] Webhook recebido do provedor: ${provider}. Evento: ${payload.event}`);

    const manager = MarketplaceManager.getInstance();
    const connector = manager.getConnector(provider);

    if (!connector) {
      logError(`[WebhookManager] Provedor de webhook desconhecido ou não suportado: ${provider}`);
      throw new Error(`Marketplace conector não encontrado para o provedor: ${provider}`);
    }

    if (connector.status !== 'CONNECTED') {
      logWarn(`[WebhookManager] Webhook recebido para conector desconectado: ${provider}`);
    }

    // Processa o webhook via conector de destino
    const result = await connector.handleWebhook({
      id: payload.id || `wh-${Date.now()}`,
      amount: payload.amount,
      commission: payload.commission,
      event: payload.event,
      buyer_email: payload.buyer_email,
      product_id: payload.product_id
    });

    // Registrar histórico do webhook no repositório de logs
    try {
      const state = await Repository.getSystemState();
      const operationLogs = state.operationLogsList || [];
      const newLog = {
        id: `oplog-wh-${Date.now()}`,
        agentId: 'integration',
        action: `WEBHOOK_RECEIVED_${payload.event}`,
        details: `Webhook processado com sucesso para ${connector.name}. Comprador: ${payload.buyer_email}. Faturamento: R$ ${payload.amount}`,
        user: 'system',
        timestamp: new Date().toISOString()
      };
      await Repository.saveState({ operationLogsList: [newLog, ...operationLogs] });
    } catch (logErr: any) {
      logWarn(`[WebhookManager] Erro ao gravar log de operação do webhook: ${logErr.message}`);
    }

    // Integrar alertas com o SupervisorAgent dependendo do evento
    try {
      if (payload.event === 'REFUND_CREATED') {
        await SupervisorAgent.triggerAlert(
          'medium',
          `Reembolso solicitado pelo comprador ${payload.buyer_email} no marketplace ${connector.name} (Valor: R$ ${payload.amount}).`,
          'CustomerSuccessAgent',
          'customer_success',
          'Disparar fluxo de pesquisa de satisfação pós-reembolso.'
        );
      } else if (payload.event === 'PAYMENT_FAILED') {
        await SupervisorAgent.triggerAlert(
          'low',
          `Falha de pagamento identificada para ${payload.buyer_email} no ${connector.name}.`,
          'LaunchAgent',
          'launch_manager',
          'Enviar e-mail automático de recuperação de carrinho.'
        );
      } else if (payload.event === 'SALE_COMPLETED') {
        await SupervisorAgent.triggerAlert(
          'low',
          `Nova venda concluída no ${connector.name}! Receita Bruta: R$ ${payload.amount}. Comprador: ${payload.buyer_email}`,
          'FinanceAgent',
          'finance',
          'Contabilizar venda e atualizar projeções de fluxo de caixa.'
        );
      }
    } catch (supErr: any) {
      logWarn(`[WebhookManager] Erro ao acionar alertas no Supervisor: ${supErr.message}`);
    }

    return result;
  }
}
