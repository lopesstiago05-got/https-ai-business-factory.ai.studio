import { LanguageManager } from '../global/languageManager.ts';
import { CurrencyManager } from '../global/currencyManager.ts';
import { RegionalSettingsManager } from '../global/regionalSettings.ts';
import { LocalizationEngine } from '../global/localizationEngine.ts';
import { TranslationEngine } from '../global/translationEngine.ts';
import { InternationalResearch } from '../global/internationalResearch.ts';
import { InternationalMarketing } from '../global/internationalMarketing.ts';
import { InternationalAnalytics } from '../global/internationalAnalytics.ts';
import { GlobalizationEngine } from '../global/globalizationEngine.ts';
import { logInfo, logWarn, logError } from '../logs/logger.ts';

export async function runGlobalizationTests(): Promise<{
  success: boolean;
  total: number;
  passed: number;
  failed: number;
  errors: string[];
}> {
  logInfo('--------------------------------------------------');
  logInfo('INICIANDO BATERIA DE TESTES: EXPANSÃO GLOBAL & L10N');
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

  // TEST 1: Language Manager
  await runTest('1. Language Manager - Suporte a múltiplos idiomas e direções', async () => {
    const list = LanguageManager.getSupportedLanguages();
    if (list.length < 8) {
      throw new Error(`Esperado pelo menos 8 idiomas oficiais de expansão, encontrado: ${list.length}`);
    }
    const pt = LanguageManager.getLanguageByCode('pt-BR');
    if (!pt || pt.direction !== 'ltr' || pt.flag !== '🇧🇷') {
      throw new Error('Configurações de pt-BR incorretas.');
    }
    const ja = LanguageManager.getLanguageByCode('ja-JP');
    if (!ja || ja.localName !== '日本語') {
      throw new Error('Configurações de ja-JP incorretas.');
    }
  });

  // TEST 2: Currency Manager
  await runTest('2. Currency Manager - Taxas de câmbio e conversões', async () => {
    const list = CurrencyManager.getSupportedCurrencies();
    if (list.length < 6) {
      throw new Error(`Esperado pelo menos 6 moedas suportadas, encontrado: ${list.length}`);
    }
    
    // Teste de câmbio
    const usdToBrl = CurrencyManager.convert(100, 'USD', 'BRL');
    if (Math.abs(usdToBrl - 560) > 0.1) {
      throw new Error(`Conversão de USD para BRL incorreta: ${usdToBrl}`);
    }

    const brlToEur = CurrencyManager.convert(610, 'BRL', 'EUR');
    if (Math.abs(brlToEur - 100) > 0.1) {
      throw new Error(`Conversão de BRL para EUR incorreta: ${brlToEur}`);
    }
  });

  // TEST 3: Regional Settings
  await runTest('3. Regional Settings - Conformidades e mapeamento de timezone', async () => {
    const list = RegionalSettingsManager.getRegionalSettings();
    if (list.length < 8) {
      throw new Error(`Esperado pelo menos 8 regiões mapeadas, encontrado: ${list.length}`);
    }

    const jp = RegionalSettingsManager.getSettingsByCountry('JP');
    if (!jp || jp.timezone !== 'Asia/Tokyo' || jp.defaultCurrency !== 'JPY') {
      throw new Error('Configuração de JP inválida.');
    }

    if (!jp.complianceWarning.includes('消費税') && !jp.complianceWarning.includes('JCT')) {
      throw new Error('Aviso tributário do Japão (JCT) deve ser comunicado.');
    }
  });

  // TEST 4: Localization Engine
  await runTest('4. Localization Engine - Formatação de datas, números e moedas', async () => {
    // Configura ativo para US
    RegionalSettingsManager.setActiveCountry('US');
    LanguageManager.setActiveLanguage('en-US');
    CurrencyManager.setActiveCurrency('USD');

    const formattedDate = LocalizationEngine.formatDate('2026-12-25');
    if (!formattedDate.includes('12') && !formattedDate.includes('2026')) {
      throw new Error(`Formatação de data inadequada para en-US: ${formattedDate}`);
    }

    const currencyValue = LocalizationEngine.formatCurrency(49.99);
    if (!currencyValue.includes('$') && !currencyValue.includes('49')) {
      throw new Error(`Formatação monetária inadequada para USD: ${currencyValue}`);
    }
  });

  // TEST 5: Translation Engine
  await runTest('5. Translation Engine - Dicionário de termos e fallback', async () => {
    const testKeyEn = TranslationEngine.translateKey('global_expansion', 'en-US');
    if (testKeyEn !== 'Global Expansion') {
      throw new Error(`Tradução estática para en-US falhou: ${testKeyEn}`);
    }

    const testKeyEs = TranslationEngine.translateKey('dashboard', 'es-ES');
    if (testKeyEs !== 'Panel Ejecutivo') {
      throw new Error(`Tradução estática para es-ES falhou: ${testKeyEs}`);
    }
  });

  // TEST 6: International Analytics
  await runTest('6. International Analytics - Simulação de vendas globais e imposto', async () => {
    const startData = InternationalAnalytics.getRegionalPerformanceData();
    const brMetrics = startData.find(p => p.countryCode === 'BR');
    const startSales = brMetrics ? brMetrics.salesCount : 0;

    const updated = InternationalAnalytics.simulateInternationalSale('BR', 197);
    if (!updated || updated.salesCount !== startSales + 1) {
      throw new Error('Simulação de faturamento por país falhou.');
    }

    if (updated.estimatedTaxPaidBRL <= 0) {
      throw new Error('Retenção de imposto local deve ser calculada e descontada.');
    }
  });

  // TEST 7: Globalization Engine
  await runTest('7. Globalization Engine - Fluxo de região e sincronização automática', async () => {
    GlobalizationEngine.setRegion('FR');
    const profile = GlobalizationEngine.getActiveProfile();
    
    if (profile.region.countryCode !== 'FR' || profile.language.code !== 'fr-FR' || profile.currency.code !== 'EUR') {
      throw new Error('Sincronização de perfil global após mudança de região falhou.');
    }
  });

  logInfo(`BATERIA CONCLUÍDA. Total: ${total} | Passou: ${passed} | Falhou: ${total - passed}`);
  return {
    success: total === passed,
    total,
    passed,
    failed: total - passed,
    errors
  };
}
