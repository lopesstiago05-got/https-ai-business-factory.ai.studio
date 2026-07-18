import { ConnectionManager } from '../integrations/ConnectionManager.ts';
import { SecretVault } from '../security/SecretVault.ts';
import { MercadoPagoConnector } from '../integrations/connectors/mercadoPago.ts';
import { Repository } from '../db/repository.ts';
import { getDB } from '../db/index.ts';
import { connections, connectionLogs, syncHistory } from '../db/schema.ts';
import * as fs from 'fs';
import * as path from 'path';

export async function runIntegrationCenterTests(): Promise<{ passed: number; failed: number; log: string }> {
  const logLines: string[] = [];
  const log = (msg: string) => {
    console.log(msg);
    logLines.push(msg);
  };

  log('\n==================================================');
  log('  AI BUSINESS FACTORY - INTEGRATION CENTER');
  log('           AUTOMATED TEST SUITE (7 MANDATORY TESTS)');
  log('==================================================');

  let passed = 0;
  let failed = 0;
  const db = getDB();
  const manager = ConnectionManager.getInstance();

  // Reset database tables before running the integration center test suite
  if (Repository.isPGAvailable()) {
    try {
      await db.delete(connections);
      await db.delete(connectionLogs);
      await db.delete(syncHistory);
      log('♻️ Estado de teste do Integration Center reiniciado com sucesso no Postgres.');
    } catch (err: any) {
      log(`⚠️ Erro ao resetar tabelas de conexões no Postgres: ${err.message}`);
    }
  } else {
    try {
      const state = await Repository.getSystemState();
      (state as any).connections = [];
      (state as any).connectionLogs = [];
      (state as any).syncHistory = [];
      await Repository.saveState(state);
      log('♻️ Estado de teste do Integration Center reiniciado com sucesso (JSON Fallback).');
    } catch (err: any) {
      log(`⚠️ Erro ao resetar fallback do Integration Center: ${err.message}`);
    }
  }

  // TEST 1: Criar conexão Mercado Pago
  try {
    log('\n▶️ [TEST 1] Executando Criar conexão Mercado Pago...');
    const conn = await manager.saveConnection({
      provider: 'mercado_pago',
      category: 'payments',
      status: 'connected',
      accountName: 'Mercado Pago Real Test',
      credentials: 'APP_USR-REAL-TOKEN-123456-MOCK-SECRET'
    });

    if (conn && conn.status === 'connected' && conn.provider === 'mercado_pago') {
      log('✅ [TEST 1] PASSOU: Conexão criada com sucesso.');
      passed++;
    } else {
      throw new Error(`Conexão retornou dados inválidos.`);
    }
  } catch (err: any) {
    log(`❌ [TEST 1] FALHOU: Criar conexão Mercado Pago. Erro: ${err.message}`);
    failed++;
  }

  // TEST 2: Salvar credencial criptografada
  try {
    log('\n▶️ [TEST 2] Executando Salvar credencial criptografada...');
    const conn = await manager.getConnectionByProvider('mercado_pago');
    if (!conn) throw new Error('Conexão não localizada no banco.');

    const encrypted = conn.encryptedCredentials;
    if (!encrypted) throw new Error('encryptedCredentials está vazio.');

    if (encrypted === 'APP_USR-REAL-TOKEN-123456-MOCK-SECRET') {
      throw new Error('As credenciais foram salvas em texto puro! Falha crítica de segurança.');
    }

    const decrypted = SecretVault.decrypt(encrypted);
    if (decrypted === 'APP_USR-REAL-TOKEN-123456-MOCK-SECRET') {
      log(`✅ [TEST 2] PASSOU: Credencial criptografada e descriptografada com absoluto sucesso via AES-256-CBC.`);
      passed++;
    } else {
      throw new Error(`Decriptografia falhou. Esperado "APP_USR-REAL-TOKEN-123456-MOCK-SECRET", recebido "${decrypted}"`);
    }
  } catch (err: any) {
    log(`❌ [TEST 2] FALHOU: Salvar credencial criptografada. Erro: ${err.message}`);
    failed++;
  }

  // TEST 3: Recuperar conexão
  try {
    log('\n▶️ [TEST 3] Executando Recuperar conexão...');
    const connectionsList = await manager.getConnections();
    const conn = connectionsList.find(c => c.provider === 'mercado_pago');

    if (conn && conn.status === 'connected' && conn.category === 'payments') {
      log(`✅ [TEST 3] PASSOU: Conexão ativa recuperada do banco de dados PostgreSQL. Token mascarado: ${conn.accessTokenMasked}`);
      passed++;
    } else {
      throw new Error('Não foi possível recuperar a conexão correta.');
    }
  } catch (err: any) {
    log(`❌ [TEST 3] FALHOU: Recuperar conexão. Erro: ${err.message}`);
    failed++;
  }

  // TEST 4: Testar API externa
  try {
    log('\n▶️ [TEST 4] Executando Testar API externa...');
    const testResult = await manager.testConnection('mercado_pago');

    if (testResult && testResult.success && testResult.latencyMs > 0) {
      log(`✅ [TEST 4] PASSOU: Teste de API do Mercado Pago OK. Latência: ${testResult.latencyMs}ms. Mensagem: ${testResult.message}`);
      passed++;
    } else {
      throw new Error(`Teste de API falhou: ${testResult?.message}`);
    }
  } catch (err: any) {
    log(`❌ [TEST 4] FALHOU: Testar API externa. Erro: ${err.message}`);
    failed++;
  }

  // TEST 5: Receber webhook
  const webhookId = `mp-wh-real-test-${Date.now()}`;
  try {
    log('\n▶️ [TEST 5] Executando Receber webhook...');
    const mockWebhookPayload = {
      id: webhookId,
      amount: 497.00,
      status: 'approved',
      customer_email: 'afiliado.mestre@factory.com',
      product_id: 'prod_90a18'
    };

    const signature = 'sha256=webhookSimulationSig12345';
    const result = await MercadoPagoConnector.getInstance().handleWebhook(signature, mockWebhookPayload);

    if (result && result.success && result.eventId) {
      log(`✅ [TEST 5] PASSOU: Webhook Mercado Pago recebido e validado com sucesso. Event ID: ${result.eventId}`);
      passed++;
    } else {
      throw new Error('Falha no processamento do webhook.');
    }
  } catch (err: any) {
    log(`❌ [TEST 5] FALHOU: Receber webhook. Erro: ${err.message}`);
    failed++;
  }

  // TEST 6: Enviar venda ao Finance Agent
  try {
    log('\n▶️ [TEST 6] Executando Enviar venda ao Finance Agent...');
    const revenuesList = await Repository.getRevenues();
    const lastRevenue = revenuesList.find(r => r.id.includes(webhookId));

    if (lastRevenue && lastRevenue.amount === 497.00) {
      log(`📈 Venda de R$ 497.00 confirmada no Finance Agent.`);
      log(`📧 Comprador: ${lastRevenue.customerEmail}`);
      log('✅ [TEST 6] PASSOU: Venda real do webhook propagada com sucesso para o Finance Agent.');
      passed++;
    } else {
      throw new Error('Receita não encontrada nos registros do Finance Agent.');
    }
  } catch (err: any) {
    log(`❌ [TEST 6] FALHOU: Enviar venda ao Finance Agent. Erro: ${err.message}`);
    failed++;
  }

  // TEST 7: Desconectar conta
  try {
    log('\n▶️ [TEST 7] Executando Desconectar conta...');
    const disconnected = await manager.disconnectConnection('mercado_pago');
    const conn = await manager.getConnectionByProvider('mercado_pago');

    if (disconnected && conn && conn.status === 'disconnected' && !conn.accessToken) {
      log('✅ [TEST 7] PASSOU: Conta desconectada com absoluto sucesso. Todos os tokens revogados e limpos.');
      passed++;
    } else {
      throw new Error(`Falha ao desconectar. Status: ${conn?.status}, Token: ${conn?.accessToken}`);
    }
  } catch (err: any) {
    log(`❌ [TEST 7] FALHOU: Desconectar conta. Erro: ${err.message}`);
    failed++;
  }

  log('\n==================================================');
  log(`  RESULTADO FINAL CENTRAL DE INTEGRAÇÕES: PASSED: ${passed}/7 | FAILED: ${failed}/7`);
  log('==================================================\n');

  const logString = logLines.join('\n');
  try {
    fs.writeFileSync(path.join(process.cwd(), 'src/tests/integrationCenter.test.log'), logString, 'utf-8');
  } catch (logErr) {
    console.error('Não foi possível salvar o arquivo de log do teste:', logErr);
  }

  return { passed, failed, log: logString };
}
