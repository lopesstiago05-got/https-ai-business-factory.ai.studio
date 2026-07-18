import { MercadoPagoPayments } from '../integrations/connectors/mercadoPagoPayments.ts';
import { MercadoPagoConnector } from '../integrations/connectors/mercadoPago.ts';
import { Repository } from '../db/repository.ts';
import { FinanceAgent } from '../agents/finance.ts';
import { SupervisorAgent } from '../agents/supervisor.ts';
import { PaymentTransaction } from '../types.ts';
import { logInfo } from '../logs/logger.ts';

export async function runMercadoPagoProductionTests(): Promise<{ passed: number; failed: number; log: string }> {
  const logLines: string[] = [];
  const log = (msg: string) => {
    console.log(msg);
    logLines.push(msg);
  };

  log('\n==================================================================');
  log('      AI BUSINESS FACTORY - MERCADO PAGO PRODUCTION ENGINE');
  log('            AUTOMATED TEST SUITE (7 PRODUCTION TESTS)');
  log('==================================================================');

  let passed = 0;
  let failed = 0;

  // Criamos ID do produto de teste
  const productId = 'prod-mp-test-' + Math.random().toString(36).substring(2, 7);

  // 1. Caso 1: Geração de link real de Checkout associado ao produto do Publisher.
  try {
    log('\n▶️ [TEST 1] Geração de link real de Checkout do Mercado Pago...');
    const payment = await MercadoPagoPayments.createPayment({
      productId: productId,
      customer: {
        name: 'Cliente Teste Produção',
        email: 'cliente.prod@exemplo.com'
      },
      amount: 150.00,
      paymentMethod: 'pix'
    });

    if (payment && payment.checkout_url && payment.checkout_url.includes('checkout')) {
      log(`✅ [TEST 1] PASSOU: CheckoutUrl gerado: ${payment.checkout_url}, ID: ${payment.payment_id}`);
      passed++;
    } else {
      throw new Error(`Checkout url inválido ou ausente: ${JSON.stringify(payment)}`);
    }
  } catch (err: any) {
    log(`❌ [TEST 1] FALHOU: Geração de link de checkout. Erro: ${err.message}`);
    failed++;
  }

  // 2. Caso 2: Processamento do evento payment.created do webhook (status: pending).
  try {
    log('\n▶️ [TEST 2] Processamento do evento payment.created do webhook (pending)...');
    const webhookRes = await MercadoPagoConnector.getInstance().handleWebhook('test-signature', {
      id: 'tx-created-123',
      amount: 150.00,
      customer_email: 'cliente.prod@exemplo.com',
      product_id: productId,
      event: 'payment.created'
    });

    // Busca a transação de pagamento no banco
    const txs = await Repository.getPaymentTransactions();
    const targetTx = txs.find(t => t.externalId === 'tx-created-123');

    if (targetTx && targetTx.status === 'pending') {
      log(`✅ [TEST 2] PASSOU: Transação salva com sucesso como 'pending'. ID: ${targetTx.id}`);
      passed++;
    } else {
      throw new Error(`Transação não encontrada ou com status incorreto. Status: ${targetTx?.status}`);
    }
  } catch (err: any) {
    log(`❌ [TEST 2] FALHOU: Webhook payment.created. Erro: ${err.message}`);
    failed++;
  }

  // 3. Caso 3: Processamento do evento payment.approved do webhook (status: approved).
  try {
    log('\n▶️ [TEST 3] Processamento do evento payment.approved do webhook (approved)...');
    const webhookRes = await MercadoPagoConnector.getInstance().handleWebhook('test-signature', {
      id: 'tx-approved-123',
      amount: 150.00,
      customer_name: 'Cliente Teste Produção',
      customer_email: 'cliente.prod@exemplo.com',
      customer_phone: '(11) 99999-9999',
      product_id: productId,
      event: 'payment.approved'
    });

    const txs = await Repository.getPaymentTransactions();
    const targetTx = txs.find(t => t.externalId === 'tx-approved-123');

    if (targetTx && targetTx.status === 'approved') {
      log(`✅ [TEST 3] PASSOU: Transação processada e aprovada no banco. ID: ${targetTx.id}`);
      passed++;
    } else {
      throw new Error(`Transação não encontrada ou não está como 'approved'. Status: ${targetTx?.status}`);
    }
  } catch (err: any) {
    log(`❌ [TEST 3] FALHOU: Webhook payment.approved. Erro: ${err.message}`);
    failed++;
  }

  // 4. Caso 4: Sincronização e cadastro/atualização automática do cliente no CRM.
  try {
    log('\n▶️ [TEST 4] Sincronização e cadastro do cliente no CRM...');
    const customers = await Repository.getCustomers();
    const targetCust = customers.find(c => c.email === 'cliente.prod@exemplo.com');

    if (targetCust && targetCust.name === 'Cliente Teste Produção' && targetCust.purchases >= 1) {
      log(`✅ [TEST 4] PASSOU: Cliente registrado perfeitamente no CRM. Compras: ${targetCust.purchases}, Gasto: R$ ${targetCust.totalSpent}`);
      passed++;
    } else {
      throw new Error(`Cliente não encontrado no CRM ou com dados desatualizados.`);
    }
  } catch (err: any) {
    log(`❌ [TEST 4] FALHOU: Sincronização de CRM. Erro: ${err.message}`);
    failed++;
  }

  // 5. Caso 5: Reconciliação do faturamento líquido no Finance Agent aplicando a taxa real do Mercado Pago.
  try {
    log('\n▶️ [TEST 5] Reconciliação de taxas reais (Finance Agent)...');
    
    // Taxas esperadas: Pix: 1%, Boleto: R$ 3,49 fixos, Cartão: 4%
    const pixNet = FinanceAgent.calculateNetRevenue(100.0, 'pix');
    const cardNet = FinanceAgent.calculateNetRevenue(100.0, 'credit_card');
    const boletoNet = FinanceAgent.calculateNetRevenue(100.0, 'boleto');

    if (pixNet === 99.0 && cardNet === 96.0 && boletoNet === 96.51) {
      log(`✅ [TEST 5] PASSOU: Reconciliação de taxas reais validada. Pix: R$ ${pixNet}, Cartão: R$ ${cardNet}, Boleto: R$ ${boletoNet}`);
      passed++;
    } else {
      throw new Error(`Taxas calculadas incorretamente. Pix: ${pixNet}, Cartão: ${cardNet}, Boleto: ${boletoNet}`);
    }
  } catch (err: any) {
    log(`❌ [TEST 5] FALHOU: Reconciliação de taxas. Erro: ${err.message}`);
    failed++;
  }

  // 6. Caso 6: Execução de Reembolso e cancelamento de pagamento com reversão no Finance Agent.
  try {
    log('\n▶️ [TEST 6] Execução de Reembolso e cancelamento de pagamento com reversão...');
    
    // Realiza o reembolso da transação criada no Teste 3
    const refundRes = await MercadoPagoPayments.refundPayment('tx-approved-123');
    
    const txs = await Repository.getPaymentTransactions();
    const targetTx = txs.find(t => t.externalId === 'tx-approved-123');

    if (targetTx && targetTx.status === 'refunded') {
      log(`✅ [TEST 6] PASSOU: Transação reembolsada com sucesso. Status atual: ${targetTx.status}`);
      passed++;
    } else {
      throw new Error(`Transação não foi marcada como 'refunded'. Status atual: ${targetTx?.status}`);
    }
  } catch (err: any) {
    log(`❌ [TEST 6] FALHOU: Reembolso de pagamento. Erro: ${err.message}`);
    failed++;
  }

  // 7. Caso 7: Alerta do Supervisor Agent por falha de pagamento recorrente ou queda de conversão.
  try {
    log('\n▶️ [TEST 7] Alerta do Supervisor Agent por falha de pagamento...');

    // Limpar alertas anteriores para evitar falsos positivos
    await Repository.saveState({ systemAlertsList: [] });

    // Salvar transações consecutivas rejeitadas
    await Repository.savePaymentTransaction({
      id: 'tx-fail-1',
      provider: 'mercado_pago',
      externalId: 'tx-fail-1',
      productId: productId,
      amount: 100,
      currency: 'BRL',
      status: 'rejected',
      customerReference: 'comprador.falhou@exemplo.com',
      createdAt: new Date().toISOString()
    });
    await Repository.savePaymentTransaction({
      id: 'tx-fail-2',
      provider: 'mercado_pago',
      externalId: 'tx-fail-2',
      productId: productId,
      amount: 100,
      currency: 'BRL',
      status: 'rejected',
      customerReference: 'comprador.falhou2@exemplo.com',
      createdAt: new Date().toISOString()
    });
    await Repository.savePaymentTransaction({
      id: 'tx-fail-3',
      provider: 'mercado_pago',
      externalId: 'tx-fail-3',
      productId: productId,
      amount: 100,
      currency: 'BRL',
      status: 'rejected',
      customerReference: 'comprador.falhou3@exemplo.com',
      createdAt: new Date().toISOString()
    });

    // Rodar Health Check para disparar a heurística
    await SupervisorAgent.runGlobalHealthCheck();

    // Validar se o alerta de monitoramento comercial foi criado
    const state = await Repository.getSystemState();
    const alerts = state.systemAlertsList || [];
    const targetAlert = alerts.find(a => 
      a.reason.includes('Monitoramento Comercial') || 
      a.origin.includes('Mercado Pago')
    );

    if (targetAlert && targetAlert.severity === 'high') {
      log(`✅ [TEST 7] PASSOU: Supervisor detectou falhas recorrentes e disparou alerta de severidade '${targetAlert.severity}'`);
      passed++;
    } else {
      throw new Error(`Alerta de monitoramento do Mercado Pago não foi criado pelo Supervisor. Alertas existentes: ${alerts.length}`);
    }
  } catch (err: any) {
    log(`❌ [TEST 7] FALHOU: Alerta do Supervisor Agent. Erro: ${err.message}`);
    failed++;
  }

  log('\n==================================================================');
  log(`TEST RESULTS: Passed ${passed}/7, Failed ${failed}/7`);
  log('==================================================================\n');

  return {
    passed,
    failed,
    log: logLines.join('\n')
  };
}
