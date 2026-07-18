import { RegionalSettingsManager } from './regionalSettings.ts';
import { LanguageManager } from './languageManager.ts';
import { CurrencyManager } from './currencyManager.ts';

export class LocalizationEngine {
  /**
   * Formata uma data no formato regional ativo
   */
  public static formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return String(date);

    const settings = RegionalSettingsManager.getActiveSettings();
    const lang = LanguageManager.getActiveLanguage().code;

    // Usando Intl.DateTimeFormat para alta precisão
    try {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      };
      return new Intl.DateTimeFormat(lang, options).format(d);
    } catch {
      // Fallback simples baseado no padrão configurado
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();

      switch (settings.dateFormat) {
        case 'MM/DD/YYYY':
          return `${month}/${day}/${year}`;
        case 'YYYY/MM/DD':
          return `${year}/${month}/${day}`;
        case 'YYYY-MM-DD':
          return `${year}-${month}-${day}`;
        case 'DD.MM.YYYY':
          return `${day}.${month}.${year}`;
        case 'DD/MM/YYYY':
        default:
          return `${day}/${month}/${year}`;
      }
    }
  }

  /**
   * Formata um valor numérico decimal genérico
   */
  public static formatNumber(num: number): string {
    const lang = LanguageManager.getActiveLanguage().code;
    return new Intl.NumberFormat(lang).format(num);
  }

  /**
   * Formata um valor monetário utilizando a moeda ativa e regras locais
   */
  public static formatCurrency(amount: number): string {
    return CurrencyManager.formatValue(amount);
  }

  /**
   * Retorna os termos de aviso legal e fiscal da região ativa
   */
  public static getLegalComplianceNotice(): string {
    const settings = RegionalSettingsManager.getActiveSettings();
    return settings.complianceWarning;
  }
}
