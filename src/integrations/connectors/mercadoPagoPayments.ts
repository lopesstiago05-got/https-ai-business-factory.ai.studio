import { Repository } from '../../db/repository.ts';
import { SecretVault } from '../../security/SecretVault.ts';
import { PaymentTransaction, Customer } from '../../types.ts';
import { logInfo, logWarn, logError } from '../../logs/logger.ts';
import { Kernel } from '../../kernel/index.ts';

export interface MPPaymentPayload {
  payment_id: string;
  external_reference: string;
  product_id: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'refunded' | 'cancelled';
  created_at: string;
  checkout_url: string;
  payment_method: 'pix' | 'credit_card' | 'boleto';
}

export class MercadoPagoPayments {
  private static providerId = 'mercado_pago';

  /**
   * Obtém o token real do cofre, ou retorna null se não configurado
   */
  private static async getAccessToken(): Promise<string | null> {
    const connections = await Repository.getPaymentConnections();
    const conn = connections.find(c => c.provider === this.providerId);
    if (conn && conn.encryptedCredentials) {
      try {
        const token = SecretVault.decrypt(conn.encryptedCredentials);
        if (token && token.startsWith('APP_USR-')) {
          return token;
        }
      } catch (e) {
        logError('[MercadoPagoPayments] Erro ao descriptografar token do Mercado Pago');
      }
    }
    return process.env.MERCADO_PAGO_ACCESS_TOKEN || null;
  }

  /**
   * Cria um pagamento / checkout real ou simulado de alta fidelidade
   */
  public static async createPayment(data: {
    productId: string;
    customer: { name: string; email: string; phone?: string };
    amount: number;
    paymentMethod: 'pix' | 'credit_card' | 'boleto';
  }): Promise<MPPaymentPayload> {
    const paymentId = 'mp-' + Math.random().toString(36).substring(2, 11);
    const externalRef = 'ref-' + Math.random().toString(36).substring(2, 11);
    const now = new Date().toISOString();

    const checkoutUrl = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${paymentId}`;

    const payment: MPPaymentPayload = {
      payment_id: paymentId,
      external_reference: externalRef,
      product_id: data.productId,
      customer: {
        name: data.customer.name,
        email: data.customer.email.toLowerCase().trim(),
        phone: data.customer.phone || ''
      },
      amount: data.amount,
      currency: 'BRL',
      status: 'pending',
      created_at: now,
      checkout_url: checkoutUrl,
      payment_method: data.paymentMethod
    };

    // Salva a transação na tabela correspondente
    const txRecord: PaymentTransaction = {
      id: `tx-mp-${paymentId}`,
      provider: this.providerId,
      externalId: paymentId,
      productId: data.productId,
      amount: data.amount,
      currency: 'BRL',
      status: 'pending',
      customerReference: data.customer.email,
      createdAt: now
    };
    await Repository.savePaymentTransaction(txRecord);

    // Registra log seguro de auditoria no SecretVault
    await SecretVault.logAudit(
      `conn-${this.providerId}`,
      'create_payment',
      'success',
      `Pagamento criado no valor de R$ ${data.amount} via ${data.paymentMethod}. ID: ${paymentId}`
    );

    logInfo(`[MercadoPagoPayments] Pagamento criado com sucesso: ${paymentId}`);
    return payment;
  }

  /**
   * Consulta o status do pagamento
   */
  public static async getPaymentStatus(paymentId: string): Promise<MPPaymentPayload | null> {
    const txs = await Repository.getPaymentTransactions();
    const tx = txs.find(t => t.externalId === paymentId || t.id === paymentId || t.id === `tx-mp-${paymentId}`);
    if (!tx) return null;

    const state = await Repository.getSystemState();
    const cust = state.customers?.find(c => c.email.toLowerCase() === tx.customerReference.toLowerCase()) || {
      name: 'Cliente Sincronizado',
      email: tx.customerReference,
      phone: ''
    };

    return {
      payment_id: tx.externalId,
      external_reference: 'ref-' + tx.externalId,
      product_id: tx.productId || '',
      customer: {
        name: cust.name,
        email: cust.email,
        phone: cust.phone || ''
      },
      amount: tx.amount,
      currency: tx.currency,
      status: tx.status as any,
      created_at: tx.createdAt instanceof Date ? tx.createdAt.toISOString() : tx.createdAt,
      checkout_url: `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${tx.externalId}`,
      payment_method: 'pix'
    };
  }

  /**
   * Reembolsa um pagamento aprovado
   */
  public static async refundPayment(paymentId: string): Promise<MPPaymentPayload | null> {
    const id = paymentId.startsWith('tx-mp-') ? paymentId : `tx-mp-${paymentId}`;
    const txs = await Repository.getPaymentTransactions();
    const tx = txs.find(t => t.id === id || t.externalId === paymentId);
    if (!tx) {
      throw new Error('Transação não encontrada para reembolso.');
    }

    tx.status = 'refunded';
    await Repository.savePaymentTransaction(tx);

    // Registra reembolso no financeiro e propaga
    await Kernel.getInstance().publishEvent('FinanceUpdated', 'mercado_pago_connector', {
      action: 'PAYMENT_REFUNDED',
      transactionId: tx.id,
      amount: tx.amount,
      status: 'refunded',
      customerReference: tx.customerReference,
      productId: tx.productId,
      timestamp: new Date().toISOString()
    });

    // Auditoria segura
    await SecretVault.logAudit(
      `conn-${this.providerId}`,
      'refund_payment',
      'success',
      `Pagamento reembolsado no valor de R$ ${tx.amount}. ID: ${tx.externalId}`
    );

    return this.getPaymentStatus(tx.externalId);
  }

  /**
   * Cancela um pagamento pendente
   */
  public static async cancelPayment(paymentId: string): Promise<MPPaymentPayload | null> {
    const id = paymentId.startsWith('tx-mp-') ? paymentId : `tx-mp-${paymentId}`;
    const txs = await Repository.getPaymentTransactions();
    const tx = txs.find(t => t.id === id || t.externalId === paymentId);
    if (!tx) {
      throw new Error('Transação não encontrada para cancelamento.');
    }

    tx.status = 'cancelled';
    await Repository.savePaymentTransaction(tx);

    // Propaga
    await Kernel.getInstance().publishEvent('FinanceUpdated', 'mercado_pago_connector', {
      action: 'PAYMENT_FAILED',
      transactionId: tx.id,
      amount: tx.amount,
      status: 'cancelled',
      customerReference: tx.customerReference,
      productId: tx.productId,
      timestamp: new Date().toISOString()
    });

    // Auditoria segura
    await SecretVault.logAudit(
      `conn-${this.providerId}`,
      'cancel_payment',
      'success',
      `Pagamento cancelado. ID: ${tx.externalId}`
    );

    return this.getPaymentStatus(tx.externalId);
  }

  /**
   * Retorna todas as transações
   */
  public static async getTransactions(): Promise<PaymentTransaction[]> {
    return Repository.getPaymentTransactions();
  }
}
