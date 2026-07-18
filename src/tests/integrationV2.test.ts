import { ConnectorRegistry } from '../integration/connectorRegistry.ts';
import { CredentialVault } from '../integration/credentialVault.ts';
import { ConnectorManager } from '../integration/connectorManager.ts';
import { ConnectorMonitor } from '../integration/connectorMonitor.ts';
import { ApiDiscoveryEngine } from '../integration/apiDiscovery.ts';
import { IntegrationBrain } from '../integration/integrationBrain.ts';
import { IntegrationBrainAgent } from '../agents/IntegrationBrainAgent.ts';
import { logInfo, logWarn, logError } from '../logs/logger.ts';

export async function runIntegrationV2Tests(): Promise<{
  success: boolean;
  total: number;
  passed: number;
  failed: number;
  errors: string[];
}> {
  logInfo('--------------------------------------------------');
  logInfo('INICIANDO BATERIA DE TESTES: INTEGRATION ENGINE V2');
  logInfo('--------------------------------------------------');

  const errors: string[] = [];
  let total = 0;
  let passed = 0;

  const runTest = async (name: string, testFn: () => Promise<void>) => {
    total++;
    try {
      await testFn();
      passed++;
      logInfo(`[PASS] ${name}`);
    } catch (err: any) {
      logError(`[FAIL] ${name}: ${err.message}`);
      errors.push(`${name}: ${err.message}`);
    }
  };

  // TEST 1: Catalog Registry
  await runTest('1. Catálogo Registry - Verificar conectores padrão do ecossistema', async () => {
    const available = ConnectorRegistry.getAvailableConnectors();
    if (available.length === 0) {
      throw new Error('Nenhum conector encontrado no catálogo de disponíveis.');
    }
    
    const whatsapp = available.find(c => c.id === 'whatsapp_business');
    if (!whatsapp) {
      throw new Error('WhatsApp Business não encontrado no catálogo.');
    }
    
    if (whatsapp.category !== 'Comunicação') {
      throw new Error(`Categoria incorreta para WhatsApp. Esperado: Comunicação, Obtido: ${whatsapp.category}`);
    }
  });

  // TEST 2: Credential Vault
  await runTest('2. Credential Vault - Criptografia, Isolamento de Tenant e Rotação', async () => {
    const tenantA = 'tenant-alpha';
    const tenantB = 'tenant-beta';
    const rawKey = 'SG.123456_super_secret_api_key_from_provider';

    // Salvar no Tenant A
    await CredentialVault.saveCredential(tenantA, 'stripe', 'API_KEY', rawKey);

    // Recuperar e descriptografar no Tenant A
    const decryptedA = await CredentialVault.getCredential(tenantA, 'stripe', 'API_KEY');
    if (decryptedA !== rawKey) {
      throw new Error(`Falha na descriptografia para Tenant A. Esperado: ${rawKey}, Obtido: ${decryptedA}`);
    }

    // Tentar acessar no Tenant B (deve isolar e retornar nulo)
    const decryptedB = await CredentialVault.getCredential(tenantB, 'stripe', 'API_KEY');
    if (decryptedB !== null) {
      throw new Error('Falha no isolamento de Tenant: Tenant B conseguiu ler credencial do Tenant A!');
    }

    // Rotacionar credencial do Tenant A
    const newKey = 'SG.987654_rotated_key';
    await CredentialVault.rotateCredential(tenantA, 'stripe', 'API_KEY', newKey);
    const decryptedRotated = await CredentialVault.getCredential(tenantA, 'stripe', 'API_KEY');
    if (decryptedRotated !== newKey) {
      throw new Error(`Falha na rotação. Esperado: ${newKey}, Obtido: ${decryptedRotated}`);
    }

    // Verificar logs de auditoria
    const logs = CredentialVault.getAuditLogs(tenantA);
    const writeLog = logs.some(l => l.action === 'WRITE');
    const rotateLog = logs.some(l => l.action === 'ROTATE');
    if (!writeLog || !rotateLog) {
      throw new Error('Logs de auditoria de credenciais não foram gravados corretamente.');
    }
  });

  // TEST 3: Installation & Lifecycle Execution
  await runTest('3. Connector Lifecycle - Instalação, Execução, Métricas e Alertas', async () => {
    const tenantId = 'tenant-alpha';
    const connectorId = 'stripe';

    // Instalar conector Stripe
    const config = await ConnectorManager.installConnector({
      tenantId,
      connectorId,
      credentials: [{ key: 'API_KEY', value: 'sk_test_51N' }]
    });

    if (config.status !== 'active') {
      throw new Error(`Status de conector instalado inválido. Esperado: active, Obtido: ${config.status}`);
    }

    // Executar ação de API com sucesso simulado
    const actionResult = await ConnectorManager.executeAction(tenantId, connectorId, 'CREATE_CUSTOMER', {
      email: 'customer@test.com',
      name: 'John Doe'
    });

    if (!actionResult.success) {
      throw new Error(`Ação do conector falhou: ${actionResult.error}`);
    }

    // Verificar gravação de métricas
    const metrics = ConnectorMonitor.getMetrics(connectorId);
    if (metrics.length === 0) {
      throw new Error('Métricas de execução não foram gravadas.');
    }

    // Simular falha e disparar alertas
    try {
      await ConnectorManager.executeAction(tenantId, connectorId, 'CREATE_CHARGE', {
        forceFailure: true
      });
    } catch (err) {
      // Falha forçada com sucesso, deve disparar alerta
    }

    const alerts = ConnectorMonitor.getActiveAlerts(connectorId);
    if (alerts.length === 0) {
      throw new Error('Alerta automático não foi disparado ao falhar a conexão.');
    }

    const stripeAlert = alerts.find(a => a.connectorId === connectorId);
    if (!stripeAlert || stripeAlert.severity !== 'high') {
      throw new Error('Falta de criticidade alta para alerta de falha de conexão.');
    }
  });

  // TEST 4: API Discovery Engine
  await runTest('4. API Discovery - Detecção de versões e mudanças em APIs externas', async () => {
    const stripeApi = await ApiDiscoveryEngine.discoverApi('stripe');
    if (stripeApi.baseUrl !== 'https://api.stripe.com/v1') {
      throw new Error(`Base URL incorreta para Stripe: ${stripeApi.baseUrl}`);
    }

    const validation = await ApiDiscoveryEngine.validateAuthentication('stripe', 'valid_token_123');
    if (!validation.valid) {
      throw new Error('Falha na validação de token válido.');
    }

    const invalidValidation = await ApiDiscoveryEngine.validateAuthentication('stripe', 'invalid_key');
    if (invalidValidation.valid) {
      throw new Error('Validação indevida aceitou chave de API inválida.');
    }
  });

  // TEST 5: Integration Brain & Agent coordination
  await runTest('5. Integration Brain & Agent - Detecção preditiva e Auto-registro', async () => {
    // Verificar detecção de necessidade
    const analysis = await IntegrationBrain.evaluateTaskIntegration(
      'Disparar alertas de vendas',
      'Preciso enviar uma notificação para o canal do Slack sempre que um checkout for aprovado'
    );

    if (!analysis.needDetected || analysis.connectorId !== 'slack') {
      throw new Error(`Erro na detecção preditiva da IA / heurística. Obtido: ${JSON.stringify(analysis)}`);
    }

    // Verificar auto-registro do Integration Brain Agent
    await IntegrationBrainAgent.registerIfNeeded();
    
    // Testar coordenação do agente
    const coordResult = await IntegrationBrainAgent.analyzeAndCoordinate(
      'Disparar alertas de vendas',
      'Preciso enviar uma notificação para o canal do Slack sempre que um checkout for aprovado'
    );

    if (!coordResult.integrationRequired || coordResult.connectorId !== 'slack') {
      throw new Error(`Agente falhou em coordenar a integração de forma proativa. Obtido: ${JSON.stringify(coordResult)}`);
    }
  });

  const success = errors.length === 0;
  logInfo('--------------------------------------------------');
  logInfo(`RESULTADO: ${passed}/${total} TESTES PASSARAM COM SUCESSO.`);
  logInfo('--------------------------------------------------');

  return {
    success,
    total,
    passed,
    failed: total - passed,
    errors
  };
}
