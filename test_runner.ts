import { runInfrastructureTests } from './src/tests/infrastructure.test.ts';
import { runMercadoPagoTests } from './src/tests/mercadoPago.test.ts';
import { runMercadoPagoProductionTests } from './src/tests/mercadoPagoProduction.test.ts';
import { runHotmartTests } from './src/tests/hotmart.test.ts';
import { runIntegrationCenterTests } from './src/tests/integrationCenter.test.ts';
import { runLaunchManagerTests } from './src/tests/launchManager.test.ts';
import { runTenantSaaSTests } from './src/tests/tenant.test.ts';
import { runProductFactoryTests } from './src/tests/productFactory.test.ts';
import { runConnectorHubTests } from './src/tests/connectorHub.test.ts';
import { runSalesChannelTests } from './src/tests/salesChannels.test.ts';
import { runIntegrationV2Tests } from './src/tests/integrationV2.test.ts';
import { runGrowthV2Tests } from './src/tests/growthV2.test.ts';
import { runGlobalizationTests } from './src/tests/globalization.test.ts';

async function main() {
  console.log('Running all tests to diagnose the system state...');
  try {
    const infra = await runInfrastructureTests();
    console.log('Infrastructure tests result:', infra);
  } catch (err: any) {
    console.error('Infra failed:', err);
  }

  try {
    const mp = await runMercadoPagoTests();
    console.log('MercadoPago tests result:', mp);
  } catch (err: any) {
    console.error('MercadoPago failed:', err);
  }

  try {
    const mpp = await runMercadoPagoProductionTests();
    console.log('MercadoPago Production tests result:', mpp);
  } catch (err: any) {
    console.error('MercadoPago Production failed:', err);
  }

  try {
    const hm = await runHotmartTests();
    console.log('Hotmart tests result:', hm);
  } catch (err: any) {
    console.error('Hotmart failed:', err);
  }

  try {
    const ic = await runIntegrationCenterTests();
    console.log('Integration Center tests result:', ic);
  } catch (err: any) {
    console.error('Integration Center failed:', err);
  }

  try {
    const lm = await runLaunchManagerTests();
    console.log('Launch Manager tests result:', lm);
  } catch (err: any) {
    console.error('Launch Manager failed:', err);
  }

  try {
    const tenant = await runTenantSaaSTests();
    console.log('Tenant tests result:', tenant);
  } catch (err: any) {
    console.error('Tenant failed:', err);
  }

  try {
    const pf = await runProductFactoryTests();
    console.log('Product Factory tests result:', pf);
  } catch (err: any) {
    console.error('Product Factory failed:', err);
  }

  try {
    const ch = await runConnectorHubTests();
    console.log('Connector Hub tests result:', ch);
  } catch (err: any) {
    console.error('Connector Hub failed:', err);
  }

  try {
    const sc = await runSalesChannelTests();
    console.log('Sales Channel tests result:', sc);
  } catch (err: any) {
    console.error('Sales Channel failed:', err);
  }

  try {
    const iv2 = await runIntegrationV2Tests();
    console.log('Integration V2 tests result:', iv2);
  } catch (err: any) {
    console.error('Integration V2 failed:', err);
  }

  try {
    const gv2 = await runGrowthV2Tests();
    console.log('Growth V2 tests result:', gv2);
  } catch (err: any) {
    console.error('Growth V2 failed:', err);
  }

  try {
    const glob = await runGlobalizationTests();
    console.log('Globalization tests result:', glob);
  } catch (err: any) {
    console.error('Globalization failed:', err);
  }

  // Finalize DB connection and exit
  try {
    const { closeDB } = await import('./src/db/index.ts');
    closeDB();
  } catch (dbErr) {
    console.error('Error closing DB:', dbErr);
  }
  console.log('--- ALL TEST SUITES CONCLUDED ---');
  process.exit(0);
}

main().catch(console.error);
