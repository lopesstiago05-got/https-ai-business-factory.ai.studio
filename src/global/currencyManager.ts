export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rateToBRL: number; // Taxa de conversão para BRL (moeda base do sistema)
  decimalDigits: number;
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'BRL', symbol: 'R$', name: 'Real Brasileiro', rateToBRL: 1.0, decimalDigits: 2 },
  { code: 'USD', symbol: '$', name: 'US Dollar', rateToBRL: 5.60, decimalDigits: 2 },
  { code: 'EUR', symbol: '€', name: 'Euro', rateToBRL: 6.10, decimalDigits: 2 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rateToBRL: 7.20, decimalDigits: 2 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateToBRL: 0.035, decimalDigits: 0 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rateToBRL: 0.77, decimalDigits: 2 },
];

let activeCurrencyCode = 'BRL';

export class CurrencyManager {
  public static getSupportedCurrencies(): Currency[] {
    return SUPPORTED_CURRENCIES;
  }

  public static getActiveCurrency(): Currency {
    return SUPPORTED_CURRENCIES.find(c => c.code === activeCurrencyCode) || SUPPORTED_CURRENCIES[0];
  }

  public static setActiveCurrency(code: string): void {
    const exists = SUPPORTED_CURRENCIES.some(c => c.code === code);
    if (exists) {
      activeCurrencyCode = code;
    }
  }

  public static convert(amount: number, fromCode: string, toCode: string): number {
    const from = SUPPORTED_CURRENCIES.find(c => c.code === fromCode);
    const to = SUPPORTED_CURRENCIES.find(c => c.code === toCode);
    
    if (!from || !to) return amount;
    
    // Converte para BRL primeiro, depois para a moeda destino
    const amountInBRL = amount * from.rateToBRL;
    return amountInBRL / to.rateToBRL;
  }

  public static formatValue(amount: number, currencyCode?: string): string {
    const code = currencyCode || activeCurrencyCode;
    const curr = SUPPORTED_CURRENCIES.find(c => c.code === code) || SUPPORTED_CURRENCIES[0];
    
    const formatter = new Intl.NumberFormat(code === 'BRL' ? 'pt-BR' : 'en-US', {
      style: 'currency',
      currency: curr.code,
      minimumFractionDigits: curr.decimalDigits,
      maximumFractionDigits: curr.decimalDigits,
    });
    
    return formatter.format(amount);
  }
}
