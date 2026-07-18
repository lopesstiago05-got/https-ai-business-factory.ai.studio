export interface RegionalSetting {
  countryCode: string;
  countryName: string;
  defaultLanguage: string;
  defaultCurrency: string;
  timezone: string;
  complianceWarning: string;
  dateFormat: string;
}

export const REGIONAL_SETTINGS: RegionalSetting[] = [
  {
    countryCode: 'BR',
    countryName: 'Brasil',
    defaultLanguage: 'pt-BR',
    defaultCurrency: 'BRL',
    timezone: 'America/Sao_Paulo',
    complianceWarning: 'A emissão de Nota Fiscal Eletrônica (NF-e/NFS-e) e recolhimento de impostos (Simples Nacional/Lucro Presumido) devem ser integrados à plataforma de faturamento local. Verifique as regras de retenção na fonte brasileiras.',
    dateFormat: 'DD/MM/YYYY'
  },
  {
    countryCode: 'US',
    countryName: 'United States',
    defaultLanguage: 'en-US',
    defaultCurrency: 'USD',
    timezone: 'America/New_York',
    complianceWarning: 'Sales tax compliance (e.g. Nexus regulations) varies strictly by state. You must configure state-by-state tax calculation and file required returns manually or via automated provider.',
    dateFormat: 'MM/DD/YYYY'
  },
  {
    countryCode: 'ES',
    countryName: 'España',
    defaultLanguage: 'es-ES',
    defaultCurrency: 'EUR',
    timezone: 'Europe/Madrid',
    complianceWarning: 'Cumplimiento obligatorio del IVA (VAT) de la Unión Europea bajo el régimen de ventanilla única (MOSS/OSS) para productos digitales entregados a consumidores finales.',
    dateFormat: 'DD/MM/YYYY'
  },
  {
    countryCode: 'FR',
    countryName: 'France',
    defaultLanguage: 'fr-FR',
    defaultCurrency: 'EUR',
    timezone: 'Europe/Paris',
    complianceWarning: 'Soumis aux règles de TVA intracommunautaire (OSS) pour les produits numériques. La facturation électronique doit respecter les formats officiels français.',
    dateFormat: 'DD/MM/YYYY'
  },
  {
    countryCode: 'DE',
    countryName: 'Deutschland',
    defaultLanguage: 'de-DE',
    defaultCurrency: 'EUR',
    timezone: 'Europe/Berlin',
    complianceWarning: 'Einhaltung der Umsatzsteuer-Identifikationsnummer (USt-IdNr.) und Vorschriften für digitale Güter in Europa. Impressum und Datenschutzerklärung sind gesetzlich vorgeschrieben.',
    dateFormat: 'DD.MM.YYYY'
  },
  {
    countryCode: 'IT',
    countryName: 'Italia',
    defaultLanguage: 'it-IT',
    defaultCurrency: 'EUR',
    timezone: 'Europe/Rome',
    complianceWarning: 'Fatturazione Elettronica obbligatoria tramite Sistema di Interscambio (SdI). Verificare requisiti IVA applicabili ai servizi digitali B2C.',
    dateFormat: 'DD/MM/YYYY'
  },
  {
    countryCode: 'JP',
    countryName: '日本 (Japan)',
    defaultLanguage: 'ja-JP',
    defaultCurrency: 'JPY',
    timezone: 'Asia/Tokyo',
    complianceWarning: '日本の消費税 (JCT) の規則に準拠する必要があります。デジタルサービスの国境を越えた取引に関する規制、および特定商取引法に基づく表記の掲載義務を確認してください。',
    dateFormat: 'YYYY/MM/DD'
  },
  {
    countryCode: 'CN',
    countryName: '中国 (China)',
    defaultLanguage: 'zh-CN',
    defaultCurrency: 'CNY',
    timezone: 'Asia/Shanghai',
    complianceWarning: '在中国大陆提供数字服务需要遵守ICP备案、增值电信业务许可、以及中国网络安全法与数据安全法的监管规定。所有税务扣缴须符合本地税务机关申报流程。',
    dateFormat: 'YYYY-MM-DD'
  }
];

let activeCountryCode = 'BR';

export class RegionalSettingsManager {
  public static getRegionalSettings(): RegionalSetting[] {
    return REGIONAL_SETTINGS;
  }

  public static getActiveSettings(): RegionalSetting {
    return REGIONAL_SETTINGS.find(s => s.countryCode === activeCountryCode) || REGIONAL_SETTINGS[0];
  }

  public static setActiveCountry(countryCode: string): void {
    const exists = REGIONAL_SETTINGS.some(s => s.countryCode === countryCode);
    if (exists) {
      activeCountryCode = countryCode;
    }
  }

  public static getSettingsByCountry(countryCode: string): RegionalSetting | undefined {
    return REGIONAL_SETTINGS.find(s => s.countryCode === countryCode);
  }
}
