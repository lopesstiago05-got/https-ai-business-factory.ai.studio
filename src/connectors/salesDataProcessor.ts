import { Repository } from '../db/repository.ts';
import { Kernel } from '../kernel/index.ts';
import { DigitalSale, Revenue, FinancialTransaction, CustomerMetrics } from '../types.ts';
import { logInfo, logWarn, logError } from '../logs/logger.ts';

export class SalesDataProcessor {
  /**
   * Processes an incoming or synchronized digital sale.
   * Updates state, propagates to Finance Agent, Customer Success, and sends Kernel events.
   */
  public static async processSale(sale: DigitalSale): Promise<void> {
    logInfo(`[SalesDataProcessor] Processando venda digital do provedor ${sale.provider}: ID ${sale.id} (Status: ${sale.status})`);

    // 1. Persistir a venda no repositório
    await Repository.saveDigitalSale(sale);

    const dateToday = new Date().toISOString().substring(0, 10);

    // 2. Integrar com o Customer Success se houver comprador e a venda for aprovada/completa
    if (sale.status === 'approved' || sale.status === 'complete') {
      try {
        const email = sale.buyerReference || 'cliente.anonimo@marketplace.com';
        const name = email.split('@')[0].replace('.', ' ');
        const formattedName = name.charAt(0).toUpperCase() + name.slice(1);

        // Upsert cliente
        const customer = await Repository.upsertCustomer({
          name: formattedName,
          email,
          phone: '',
          purchaseAmount: sale.amount
        });

        logInfo(`[SalesDataProcessor] Customer Success integrado: Cliente ${customer.name} (${customer.email}) atualizado.`);

        // Publica evento CustomerPurchased no Kernel
        await Kernel.getInstance().publishEvent('CustomerPurchased', 'sales_processor', {
          customerId: customer.id,
          name: customer.name,
          email: customer.email,
          productId: sale.productId,
          amount: sale.amount,
          timestamp: new Date().toISOString()
        });
      } catch (csErr: any) {
        logError(`[SalesDataProcessor] Erro ao processar integraçao com Customer Success: ${csErr.message}`);
      }
    }

    // 3. Integrar com o Finance Agent (Faturamento, Comissões e Transações)
    try {
      if (sale.status === 'approved' || sale.status === 'complete') {
        // Criar registro de receita real
        const rev: Revenue = {
          id: `rev-${sale.id}`,
          productId: sale.productId || undefined,
          amount: sale.amount,
          paymentMethod: 'credit_card',
          status: 'completed',
          customerEmail: sale.buyerReference || 'comprador@marketplace.com',
          date: dateToday,
          timestamp: new Date().toISOString()
        };
        await Repository.createRevenue(rev);

        // Criar transação financeira de receita
        const finTx: FinancialTransaction = {
          id: `tx-fin-${sale.id}`,
          type: 'revenue',
          amount: sale.amount,
          description: `Venda ${sale.provider.toUpperCase()} - Transação ${sale.externalId}`,
          category: 'sales',
          date: dateToday,
          productId: sale.productId || undefined,
          timestamp: new Date().toISOString()
        };
        await Repository.createFinancialTransaction(finTx);

        // Se houver comissão, criar transação de despesa correspondente
        if (sale.commission > 0) {
          const commTx: FinancialTransaction = {
            id: `tx-comm-${sale.id}`,
            type: 'expense',
            amount: sale.commission,
            description: `Comissão ${sale.provider.toUpperCase()} - Transação ${sale.externalId}`,
            category: 'commissions',
            date: dateToday,
            productId: sale.productId || undefined,
            timestamp: new Date().toISOString()
          };
          await Repository.createFinancialTransaction(commTx);
        }

        // Emitir evento RevenueReceived
        await Kernel.getInstance().publishEvent('RevenueReceived', 'sales_processor', {
          provider: sale.provider,
          amount: sale.amount,
          commission: sale.commission,
          productId: sale.productId,
          timestamp: new Date().toISOString()
        });

        // Recalcular métricas de clientes
        await this.updateMetrics();

        logInfo(`[SalesDataProcessor] Finance Agent integrado com sucesso para a venda de R$ ${sale.amount}.`);
      } else if (sale.status === 'refunded') {
        // Propagar reembolso como transação de despesa / ajuste
        const refundTx: FinancialTransaction = {
          id: `tx-ref-${sale.id}`,
          type: 'expense',
          amount: sale.amount,
          description: `Reembolso de Venda ${sale.provider.toUpperCase()} - Transação ${sale.externalId}`,
          category: 'other',
          date: dateToday,
          productId: sale.productId || undefined,
          timestamp: new Date().toISOString()
        };
        await Repository.createFinancialTransaction(refundTx);
        logWarn(`[SalesDataProcessor] Reembolso de R$ ${sale.amount} propagado para finanças.`);
      }
    } catch (finErr: any) {
      logError(`[SalesDataProcessor] Erro ao integrar dados com o Finance Agent: ${finErr.message}`);
    }
  }

  /**
   * Recalcula e atualiza as métricas gerais do Customer Success e Finanças
   */
  private static async updateMetrics(): Promise<void> {
    try {
      const revenuesList = await Repository.getRevenues();
      const expensesList = await Repository.getExpenses();

      const totalSalesCount = revenuesList.length;
      const totalRevenue = revenuesList.reduce((acc, r) => acc + r.amount, 0);
      const totalSpend = expensesList
        .filter(e => e.category === 'ads' || e.category === 'commissions')
        .reduce((acc, e) => acc + e.amount, 0);

      const cac = totalSalesCount > 0 ? totalSpend / totalSalesCount : 0;
      const ltv = totalSalesCount > 0 ? (totalRevenue / totalSalesCount) * 1.5 : 0;
      const averageTicket = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;

      const metricsRecord: CustomerMetrics = {
        id: `cm-${Date.now()}`,
        cac,
        ltv,
        averageTicket,
        conversionRate: 1.5,
        activeCustomers: totalSalesCount,
        timestamp: new Date().toISOString()
      };
      await Repository.createCustomerMetrics(metricsRecord);
    } catch (err: any) {
      logWarn(`[SalesDataProcessor] Erro ao recalcular métricas de clientes: ${err.message}`);
    }
  }
}
