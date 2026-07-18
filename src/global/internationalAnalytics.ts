import { RegionalSettingsManager } from './regionalSettings.ts';
import { CurrencyManager } from './currencyManager.ts';

export interface RegionalPerformance {
  countryCode: string;
  countryName: string;
  currencyCode: string;
  salesCount: number;
  rawRevenue: number; // Na moeda local
  convertedRevenueBRL: number; // Convertido para BRL
  estimatedTaxPaidBRL: number; // Impostos estimados na moeda BRL
  netRevenueBRL: number; // Receita líquida convertida para BRL
}

export class InternationalAnalytics {
  private static mockDatabase: RegionalPerformance[] = [
    { countryCode: 'BR', countryName: 'Brasil', currencyCode: 'BRL', salesCount: 120, rawRevenue: 24000, convertedRevenueBRL: 24000, estimatedTaxPaidBRL: 1440, netRevenueBRL: 22560 },
    { countryCode: 'US', countryName: 'United States', currencyCode: 'USD', salesCount: 45, rawRevenue: 4500, convertedRevenueBRL: 25200, estimatedTaxPaidBRL: 2016, netRevenueBRL: 23184 },
    { countryCode: 'ES', countryName: 'España', currencyCode: 'EUR', salesCount: 22, rawRevenue: 2200, convertedRevenueBRL: 13420, estimatedTaxPaidBRL: 2818, netRevenueBRL: 10602 },
    { countryCode: 'FR', countryName: 'France', currencyCode: 'EUR', salesCount: 15, rawRevenue: 1500, convertedRevenueBRL: 9150, estimatedTaxPaidBRL: 1830, netRevenueBRL: 7320 },
  ];

  /**
   * Obtém as métricas agregadas de faturamento e vendas por região geográfica
   */
  public static getRegionalPerformanceData(): RegionalPerformance[] {
    return this.mockDatabase;
  }

  /**
   * Adiciona uma nova venda internacional simulada ao painel de analytics
   */
  public static simulateInternationalSale(countryCode: string, localPrice: number): RegionalPerformance | null {
    const settings = RegionalSettingsManager.getSettingsByCountry(countryCode);
    if (!settings) return null;

    let perf = this.mockDatabase.find(p => p.countryCode === countryCode);
    if (!perf) {
      perf = {
        countryCode,
        countryName: settings.countryName,
        currencyCode: settings.defaultCurrency,
        salesCount: 0,
        rawRevenue: 0,
        convertedRevenueBRL: 0,
        estimatedTaxPaidBRL: 0,
        netRevenueBRL: 0,
      };
      this.mockDatabase.push(perf);
    }

    perf.salesCount += 1;
    perf.rawRevenue += localPrice;

    // Conversões e estimativas tributárias locais hipotéticas
    const convertedBRL = CurrencyManager.convert(localPrice, settings.defaultCurrency, 'BRL');
    perf.convertedRevenueBRL += convertedBRL;

    // Imposto médio de infoprodutos da região (ex: 6% BR, 8% US, 21% ES/FR)
    const taxRate = countryCode === 'BR' ? 0.06 : countryCode === 'US' ? 0.08 : 0.20;
    const taxBRL = convertedBRL * taxRate;
    perf.estimatedTaxPaidBRL += taxBRL;
    perf.netRevenueBRL = perf.convertedRevenueBRL - perf.estimatedTaxPaidBRL;

    return perf;
  }
}
