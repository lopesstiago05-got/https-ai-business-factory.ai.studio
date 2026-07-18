import { LanguageManager, Language } from './languageManager.ts';
import { CurrencyManager, Currency } from './currencyManager.ts';
import { RegionalSettingsManager, RegionalSetting } from './regionalSettings.ts';
import { LocalizationEngine } from './localizationEngine.ts';
import { TranslationEngine } from './translationEngine.ts';

export class GlobalizationEngine {
  /**
   * Configura o país/região ativo do sistema e adapta automaticamente o idioma e a moeda correspondente
   */
  public static setRegion(countryCode: string): void {
    RegionalSettingsManager.setActiveCountry(countryCode);
    
    const activeRegion = RegionalSettingsManager.getActiveSettings();
    LanguageManager.setActiveLanguage(activeRegion.defaultLanguage);
    CurrencyManager.setActiveCurrency(activeRegion.defaultCurrency);
  }

  /**
   * Obtém as configurações unificadas da região ativa no momento
   */
  public static getActiveProfile(): {
    region: RegionalSetting;
    language: Language;
    currency: Currency;
    complianceNotice: string;
  } {
    return {
      region: RegionalSettingsManager.getActiveSettings(),
      language: LanguageManager.getActiveLanguage(),
      currency: CurrencyManager.getActiveCurrency(),
      complianceNotice: LocalizationEngine.getLegalComplianceNotice()
    };
  }

  /**
   * Executa a tradução e localização completa de uma ficha técnica ou copy de infoproduto
   */
  public static async expandContentToRegion(
    productName: string,
    originalPitch: string,
    targetCountryCode: string
  ): Promise<{
    translatedTitle: string;
    localizedHeadline: string;
    localizedPitch: string;
    suggestedLocalPrice: string;
    complianceNotice: string;
  }> {
    const regionalInfo = RegionalSettingsManager.getSettingsByCountry(targetCountryCode) || RegionalSettingsManager.getActiveSettings();
    const lang = LanguageManager.getLanguageByCode(regionalInfo.defaultLanguage) || LanguageManager.getActiveLanguage();
    
    // Tradução e localização via inteligência integrada
    const translatedTitle = await TranslationEngine.translateText(productName, lang.name);
    
    const localizedMarketing = await TranslationEngine.translateText(originalPitch, lang.name);
    const localizedHeadline = `[${lang.flag}] ` + await TranslationEngine.translateText(`Headline de Alta Conversão para o mercado de ${regionalInfo.countryName}`, lang.name);

    // Sugere preço adaptado de faturamento local aproximado baseado em paridade de poder de compra
    const rawLocalPrice = targetCountryCode === 'BR' ? 197 : targetCountryCode === 'US' ? 47 : 49;
    const suggestedPriceFormatted = CurrencyManager.formatValue(rawLocalPrice, regionalInfo.defaultCurrency);

    return {
      translatedTitle,
      localizedHeadline,
      localizedPitch: localizedMarketing,
      suggestedLocalPrice: suggestedPriceFormatted,
      complianceNotice: regionalInfo.complianceWarning
    };
  }
}
