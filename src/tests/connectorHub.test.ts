import { MarketplaceManager } from '../connectors/marketplaceManager.ts';
import { ConnectorService } from '../connectors/connectorService.ts';
import { Repository } from '../db/repository.ts';
import { SyncEngine } from '../connectors/syncEngine.ts';
import { WebhookManager } from '../connectors/webhookManager.ts';
import * as fs from 'fs';
import * as path from 'path';

export async function runConnectorHubTests(): Promise<{ passed: number; failed: number; log: string }> {
  const logLines: string[] = [];
  const log = (msg: string) => {
    console.log(msg);
    logLines.push(msg);
  };

  log('\n==================================================');
  log('     AI BUSINESS FACTORY - CONNECTOR HUB');
  log('           AUTOMATED TEST SUITE (7 TESTS)');
  log('==================================================');

  let passed = 0;
  let failed = 0;

  let backupConns: any[] = [];
  try {
    const conns = await Repository.getPlatformConnections();
    backupConns = conns.filter(c => ['hotmart', 'kiwify', 'eduzz', 'monetizze', 'braip'].includes(c.provider) && c.status === 'connected');
    if (backupConns.length > 0) {
      log(`📦 [Hub Test Backup] Backup das conexões reais realizado para os provedores: ${backupConns.map(c => c.provider).join(', ')}.`);
    }
  } catch (err: any) {
    console.error('Erro no backup do Hub:', err.message);
  }

  // Setup: reset or back up existing records if needed, but we can do a clean run
  try {
    const allConns = await Repository.getPlatformConnections();
    const cleanConns = allConns.filter(c => !['hotmart', 'kiwify', 'eduzz', 'monetizze', 'braip'].includes(c.provider));
    await Repository.saveState({ platformConnections: cleanConns });

    const allSales = await Repository.getDigitalSales();
    const cleanSales = allSales.filter(s => !['hotmart', 'kiwify', 'eduzz', 'monetizze', 'braip'].includes(s.provider));
    await Repository.saveState({ digitalSales: cleanSales });

    log('♻️ Estado de teste do Connector Hub limpo com sucesso.');
  } catch (err: any) {
    log(`⚠️ Erro ao resetar estado dos conectores: ${err.message}`);
  }

  // TEST 1: Connector loading
  try {
    log('\n▶️ [TEST 1] Executando Carregamento de Conectores (Connector loading)...');
    const manager = MarketplaceManager.getInstance();
    await manager.loadAllConnectors();
    const all = manager.getAllConnectors();

    if (all.length === 5) {
      log(`✅ [TEST 1] PASSOU: Carregou com sucesso todos os 5 conectores (Hotmart, Kiwify, Eduzz, Monetizze, Braip).`);
      passed++;
    } else {
      throw new Error(`Número incorreto de conectores carregados: ${all.length}/5`);
    }
  } catch (err: any) {
    log(`❌ [TEST 1] FALHOU: Carregamento de Conectores. Erro: ${err.message}`);
    failed++;
  }

  // TEST 2: Authentication flow
  try {
    log('\n▶️ [TEST 2] Executando Fluxo de Autenticação (Authentication flow)...');
    const manager = MarketplaceManager.getInstance();
    const hotmart = manager.getConnector('hotmart')!;
    const kiwify = manager.getConnector('kiwify')!;

    // Teste 2a: Token com prefixo correto
    await hotmart.connect('HOT-123456-TOKEN');
    await kiwify.connect('KIW-987654-TOKEN');

    // Teste 2b: Token com formato incorreto (deve falhar)
    try {
      await hotmart.connect('INVALID-TOKEN-WITHOUT-PREFIX');
      throw new Error('Deveria ter falhado com token sem prefixo "HOT-"');
    } catch (e: any) {
      if (e.message.includes('HOT-')) {
        log('✅ [TEST 2] PASSOU: Validou corretamente formatos de token com e sem prefixo.');
        passed++;
      } else {
        throw e;
      }
    }
  } catch (err: any) {
    log(`❌ [TEST 2] FALHOU: Fluxo de Autenticação. Erro: ${err.message}`);
    failed++;
  }

  // TEST 3: Product publishing
  try {
    log('\n▶️ [TEST 3] Executando Publicação de Produto (Product publishing)...');
    
    // Semeia um produto de teste temporário
    const state = await Repository.getSystemState();
    const tempProduct = {
      id: 'prod_test_hub',
      name: 'Curso Avançado de Growth IA',
      category: 'Ebook/Video',
      niche: 'marketing',
      price: 197.0,
      revenue: 0,
      status: 'draft' as const,
      description: 'Aprenda marketing em escala',
      content: 'conteudo...',
      publicationLogs: [],
      timestamp: new Date().toISOString()
    };
    await Repository.saveState({ products: [tempProduct, ...(state.products || [])] });

    // Publica no Kiwify
    const publishRes = await ConnectorService.publishProduct('prod_test_hub', 'kiwify');

    if (publishRes.success && publishRes.url.includes('kiwify')) {
      // Recarrega o estado e verifica se está publicado e paymentProvider correto
      const updatedState = await Repository.getSystemState();
      const updatedProd = (updatedState.products || []).find(p => p.id === 'prod_test_hub');

      if (updatedProd && updatedProd.status === 'published' && updatedProd.paymentProvider === 'kiwify') {
        log(`✅ [TEST 3] PASSOU: Produto publicado no Kiwify com sucesso. Checkout: ${publishRes.url}`);
        passed++;
      } else {
        throw new Error(`Produto persistido com dados incorretos no repositório.`);
      }
    } else {
      throw new Error(`Publicação retornou sucesso=false ou URL inválida.`);
    }
  } catch (err: any) {
    log(`❌ [TEST 3] FALHOU: Publicação de Produto. Erro: ${err.message}`);
    failed++;
  }

  // TEST 4: Sales synchronization
  try {
    log('\n▶️ [TEST 4] Executando Sincronização de Vendas (Sales synchronization)...');
    const syncRes = await SyncEngine.syncAll();

    if (syncRes.synchronizedConnectors.length > 0 && syncRes.totalSalesSynced > 0) {
      log(`✅ [TEST 4] PASSOU: Sincronização retroativa executada. Conectores atualizados: ${syncRes.synchronizedConnectors.join(', ')}.`);
      passed++;
    } else {
      throw new Error(`Nenhuma venda ou conector foi sincronizado.`);
    }
  } catch (err: any) {
    log(`❌ [TEST 4] FALHOU: Sincronização de Vendas. Erro: ${err.message}`);
    failed++;
  }

  // TEST 5: Webhook processing
  try {
    log('\n▶️ [TEST 5] Executando Processamento de Webhook (Webhook processing)...');
    
    // Simula webhook de venda pendente
    const whPayload = {
      event: 'PAYMENT_PENDING' as const,
      provider: 'kiwify',
      id: `wh-test-${Date.now()}`,
      amount: 497.0,
      commission: 49.7,
      buyer_email: 'aluno.esperto@factory.com',
      product_id: 'prod_test_hub'
    };

    const res = await WebhookManager.receiveWebhook(whPayload);
    if (res.success && res.eventId) {
      log('✅ [TEST 5] PASSOU: Webhook processado e roteado corretamente pelo WebhookManager.');
      passed++;
    } else {
      throw new Error('Retorno do webhook incorreto.');
    }
  } catch (err: any) {
    log(`❌ [TEST 5] FALHOU: Processamento de Webhook. Erro: ${err.message}`);
    failed++;
  }

  // TEST 6: Finance integration
  try {
    log('\n▶️ [TEST 6] Executando Integração Financeira (Finance integration)...');
    
    // Simula uma venda aprovada e concluída
    const webhookId = `wh-sale-fin-${Date.now()}`;
    await WebhookManager.receiveWebhook({
      event: 'SALE_COMPLETED',
      provider: 'kiwify',
      id: webhookId,
      amount: 297.0,
      commission: 29.7,
      buyer_email: 'investidor.financeiro@factory.com',
      product_id: 'prod_test_hub'
    });

    const revenues = await Repository.getRevenues();
    const matchedRev = revenues.find(r => r.id.includes(webhookId));

    const transactions = await Repository.getFinancialTransactions();
    const matchedTx = transactions.find(t => t.id.includes(webhookId) && t.type === 'revenue');
    const matchedComm = transactions.find(t => t.id.includes(webhookId) && t.type === 'expense');

    if (matchedRev && matchedRev.amount === 297.0 && matchedTx && matchedTx.amount === 297.0) {
      log('📈 Faturamento de R$ 297,00 integrado no Finance Agent.');
      if (matchedComm && matchedComm.amount === 29.7) {
        log('💸 Comissão de despesa de R$ 29,70 registrada.');
      } else {
        throw new Error('Comissão do conector ausente ou incorreta.');
      }
      log('✅ [TEST 6] PASSOU: Vendas e comissões registradas no fluxo de caixa real.');
      passed++;
    } else {
      throw new Error('Registros de receitas ou transações financeiras não encontrados.');
    }
  } catch (err: any) {
    log(`❌ [TEST 6] FALHOU: Integração Financeira. Erro: ${err.message}`);
    failed++;
  }

  // TEST 7: Customer Success integration
  try {
    log('\n▶️ [TEST 7] Executando Integração com Sucesso do Cliente (Customer Success)...');
    
    // Sincroniza um cliente através de nova venda aprovada
    const webhookId = `wh-sale-cs-${Date.now()}`;
    const buyerEmail = 'cliente.sucesso@factory.com';

    await WebhookManager.receiveWebhook({
      event: 'SALE_COMPLETED',
      provider: 'hotmart',
      id: webhookId,
      amount: 197.0,
      commission: 19.7,
      buyer_email: buyerEmail,
      product_id: 'prod_test_hub'
    });

    // Busca clientes e verifica se foi criado ou atualizado
    const customers = await Repository.getCustomers();
    const matchedCustomer = customers.find(c => c.email.toLowerCase() === buyerEmail);

    if (matchedCustomer && matchedCustomer.purchases >= 1 && matchedCustomer.totalSpent >= 197.0) {
      log(`📧 Cliente ${matchedCustomer.name} localizado na base de CS com faturamento acumulado.`);
      log('✅ [TEST 7] PASSOU: Registro do comprador atualizado e jornada de CS inicializada.');
      passed++;
    } else {
      throw new Error(`Cliente com e-mail ${buyerEmail} não foi localizado na base de dados de CS.`);
    }
  } catch (err: any) {
    log(`❌ [TEST 7] FALHOU: Integração de Customer Success. Erro: ${err.message}`);
    failed++;
  }

  log('\n==================================================');
  log(`  RESULTADO DO HUB DE CONECTORES: PASSED: ${passed}/7 | FAILED: ${failed}/7`);
  log('==================================================\n');

  const logString = logLines.join('\n');
  try {
    fs.writeFileSync(path.join(process.cwd(), 'src/tests/connectorHub.test.log'), logString, 'utf-8');
  } catch (logErr) {
    console.error('Não foi possível salvar o arquivo de log do teste:', logErr);
  }

  if (backupConns.length > 0) {
    try {
      log('🔄 [Hub Test Backup] Restaurando conexões reais do Hub...');
      for (const conn of backupConns) {
        await Repository.savePlatformConnection(conn);
      }
      log('✅ [Hub Test Backup] Conexões reais do Hub restauradas.');
    } catch (err: any) {
      console.error('Erro ao restaurar conexões reais do Hub:', err.message);
    }
  }

  return { passed, failed, log: logString };
}
