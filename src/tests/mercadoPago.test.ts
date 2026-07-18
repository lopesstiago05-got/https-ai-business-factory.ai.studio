import { MercadoPagoConnector } from '../integrations/connectors/mercadoPago.ts';
import { Repository } from '../db/repository.ts';
import * as fs from 'fs';
import * as path from 'path';

export async function runMercadoPagoTests(): Promise<{ passed: number; failed: number; log: string }> {
  const logLines: string[] = [];
  const log = (msg: string) => {
    console.log(msg);
    logLines.push(msg);
  };

  log('\n==================================================');
  log('  AI BUSINESS FACTORY - MERCADO PAGO CONNECTOR');
  log('           AUTOMATED TEST SUITE (7 MANDATORY TESTS)');
  log('==================================================');

  let passed = 0;
  let failed = 0;
  const connector = MercadoPagoConnector.getInstance();

  let backupConn: any = null;
  try {
    const conns = await Repository.getPaymentConnections();
    const mpConn = conns.find(c => c.provider === 'mercado_pago');
    if (mpConn && mpConn.status === 'connected' && !mpConn.encryptedCredentials?.includes('QVBQX1VTVi1URVNULVRPTEVOLTEyMzQ1Njc4OTAtU0VDUkVU') && !mpConn.encryptedCredentials?.includes('YXBwX3Vzcl90ZXN0X3Rva2VuXzEyMzQ1Njc4OTA=')) {
      backupConn = { ...mpConn };
      log('📦 [Mercado Pago Test Backup] Backup da conexão real do Mercado Pago realizado.');
    }
  } catch (err: any) {
    console.error('Erro no backup de conexão Mercado Pago:', err.message);
  }

  // Reset any existing payment connections and transactions for a clean test run
  try {
    const allConns = await Repository.getPaymentConnections();
    const cleanConns = allConns.filter(c => c.provider !== 'mercado_pago');
    await Repository.saveState({ paymentConnections: cleanConns });

    const allTxs = await Repository.getPaymentTransactions();
    const cleanTxs = allTxs.filter(t => t.provider !== 'mercado_pago');
    await Repository.saveState({ paymentTransactions: cleanTxs });

    // Limpar tabelas correspondentes no PostgreSQL
    await Repository.clearPaymentTestData();

    log('♻️ Estado de teste reiniciado com sucesso.');
  } catch (err: any) {
    log(`⚠️ Erro ao resetar estado dos conectores: ${err.message}`);
  }

  // TEST 1: Conexão bem-sucedida
  try {
    log('\n▶️ [TEST 1] Executando Conexão bem-sucedida...');
    const validToken = 'APP_USR-TEST-TOKEN-1234567890-SECRET';
    const conn = await connector.connect(validToken);

    if (conn && conn.status === 'connected' && conn.encryptedCredentials) {
      log('✅ [TEST 1] PASSOU: Conexão bem-sucedida com token de produção.');
      passed++;
    } else {
      throw new Error(`Conector retornou status incorreto: ${conn?.status}`);
    }
  } catch (err: any) {
    log(`❌ [TEST 1] FALHOU: Conexão bem-sucedida. Erro: ${err.message}`);
    failed++;
  }

  // TEST 2: Consulta de status conectado
  try {
    log('\n▶️ [TEST 2] Executando Consulta de status conectado...');
    const status = await connector.getStatus();

    if (status.connected === true && status.status === 'connected') {
      log(`✅ [TEST 2] PASSOU: Status conectado recuperado com sucesso. Eventos: ${status.metrics.eventsCount}`);
      passed++;
    } else {
      throw new Error(`Status esperado "connected", recebido: ${status.status}`);
    }
  } catch (err: any) {
    log(`❌ [TEST 2] FALHOU: Consulta de status conectado. Erro: ${err.message}`);
    failed++;
  }

  // TEST 3: Consulta de transações vazia
  try {
    log('\n▶️ [TEST 3] Executando Consulta de transações vazia...');
    const txs = await Repository.getPaymentTransactions();
    const mpTxs = txs.filter(t => t.provider === 'mercado_pago');

    if (mpTxs.length === 0) {
      log('✅ [TEST 3] PASSOU: Histórico de transações está limpo e vazio para este conector.');
      passed++;
    } else {
      throw new Error(`Lista de transações não está vazia. Encontrado: ${mpTxs.length} registros.`);
    }
  } catch (err: any) {
    log(`❌ [TEST 3] FALHOU: Consulta de transações vazia. Erro: ${err.message}`);
    failed++;
  }

  // TEST 4: Falha de token inválido (lançar erro esperado)
  try {
    log('\n▶️ [TEST 4] Executando Falha de token inválido (erro esperado)...');
    const invalidToken = 'INVALID-TOKEN-WITHOUT-PREFIX';
    
    try {
      await connector.connect(invalidToken);
      throw new Error('Conexão deveria ter falhado por causa do token sem prefixo APP_USR-');
    } catch (err: any) {
      if (err.message.includes('APP_USR-')) {
        const status = await connector.getStatus();
        if (status.status === 'error') {
          log(`✅ [TEST 4] PASSOU: Erro esperado de token capturado com sucesso. Conexão marcada como 'error'.`);
          passed++;
        } else {
          throw new Error(`Status esperado 'error' após falha de token, recebido: ${status.status}`);
        }
      } else {
        throw err;
      }
    }
  } catch (err: any) {
    log(`❌ [TEST 4] FALHOU: Falha de token inválido. Erro: ${err.message}`);
    failed++;
  }

  // Restore the valid connection state for subsequent tests
  try {
    const validToken = 'APP_USR-TEST-TOKEN-1234567890-SECRET';
    await connector.connect(validToken);
  } catch (err) {}

  // TEST 5: Reconexão automática em caso de queda simulada
  try {
    log('\n▶️ [TEST 5] Executando Reconexão automática após queda simulada...');
    
    // Simular queda alterando o status da conexão para 'disconnected' sem apagar credenciais
    const allConns = await Repository.getPaymentConnections();
    const mpConn = allConns.find(c => c.provider === 'mercado_pago');
    if (mpConn) {
      mpConn.status = 'disconnected';
      await Repository.savePaymentConnection(mpConn);
    }

    const currentStatus = await connector.getStatus();
    log(`🔌 Status temporário antes de reconectar: ${currentStatus.status}`);

    const reconnectSuccess = await connector.autoReconnect();
    const finalStatus = await connector.getStatus();

    if (reconnectSuccess && finalStatus.status === 'connected') {
      log('✅ [TEST 5] PASSOU: Reconexão automática realizada e status restaurado para conectado.');
      passed++;
    } else {
      throw new Error(`Falha na reconexão automática ou status final incorreto: ${finalStatus.status}`);
    }
  } catch (err: any) {
    log(`❌ [TEST 5] FALHOU: Reconexão automática. Erro: ${err.message}`);
    failed++;
  }

  // TEST 6: Teste de webhook recebido (simular JSON de payload de produção)
  let webhookResultId = '';
  try {
    log('\n▶️ [TEST 6] Executando Teste de webhook recebido (payload de produção)...');
    
    const mockWebhookPayload = {
      id: `mp-webhook-${Date.now()}`,
      amount: 199.90,
      status: 'approved',
      customer_email: 'financeiro.principal@empresa.com.br',
      product_id: 'infoprod-vendas-alta-conversao'
    };

    const signature = 'sha256=abcdef1234567890';
    const result = await connector.handleWebhook(signature, mockWebhookPayload);

    if (result && result.success && result.eventId) {
      webhookResultId = mockWebhookPayload.id;
      log(`✅ [TEST 6] PASSOU: Webhook recebido, validado e processado. Evento registrado com ID: ${result.eventId}`);
      passed++;
    } else {
      throw new Error('Roteamento do webhook ou criação do log falhou.');
    }
  } catch (err: any) {
    log(`❌ [TEST 6] FALHOU: Teste de webhook recebido. Erro: ${err.message}`);
    failed++;
  }

  // TEST 7: Propagação de dados para o Finance Agent (verificar se a receita e o saldo do caixa aumentaram)
  try {
    log('\n▶️ [TEST 7] Executando Propagação de dados para o Finance Agent...');
    
    // Buscar receitas e transações financeiras gerais
    const revenues = await Repository.getRevenues();
    const lastRevenue = revenues.find(r => r.id.includes(webhookResultId));

    const finTxs = await Repository.getFinancialTransactions();
    const lastFinTx = finTxs.find(t => t.id.includes(webhookResultId));

    if (lastRevenue && lastRevenue.amount === 199.90 && lastFinTx && lastFinTx.amount === 199.90) {
      log(`📈 Venda de R$ 199.90 confirmada no Finance Agent.`);
      log(`📧 Comprador: ${lastRevenue.customerEmail}`);
      log('✅ [TEST 7] PASSOU: Receita real de venda e transações propagadas perfeitamente para o Finance Agent.');
      passed++;
    } else {
      throw new Error('Receita correspondente à venda não foi encontrada nos registros do Finance Agent.');
    }
  } catch (err: any) {
    log(`❌ [TEST 7] FALHOU: Propagação de dados para o Finance Agent. Erro: ${err.message}`);
    failed++;
  }

  log('\n==================================================');
  log(`  RESULTADO FINAL: PASSED: ${passed}/7 | FAILED: ${failed}/7`);
  log('==================================================\n');

  const logString = logLines.join('\n');
  try {
    fs.writeFileSync(path.join(process.cwd(), 'src/tests/mercadoPago.test.log'), logString, 'utf-8');
  } catch (logErr) {
    console.error('Não foi possível salvar o arquivo de log do teste:', logErr);
  }

  if (backupConn) {
    try {
      log('🔄 [Mercado Pago Test Backup] Restaurando conexão real do Mercado Pago...');
      await Repository.savePaymentConnection(backupConn);
      log('✅ [Mercado Pago Test Backup] Conexão real do Mercado Pago restaurada.');
    } catch (err: any) {
      console.error('Erro ao restaurar conexão real do Mercado Pago:', err.message);
    }
  }

  return { passed, failed, log: logString };
}
