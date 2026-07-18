export interface Language {
  code: string;
  name: string;
  localName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'pt-BR', name: 'Português (Brasil)', localName: 'Português', flag: '🇧🇷', direction: 'ltr' },
  { code: 'en-US', name: 'English (US)', localName: 'English', flag: '🇺🇸', direction: 'ltr' },
  { code: 'es-ES', name: 'Español (España)', localName: 'Español', flag: '🇪🇸', direction: 'ltr' },
  { code: 'fr-FR', name: 'Français (France)', localName: 'Français', flag: '🇫🇷', direction: 'ltr' },
  { code: 'de-DE', name: 'Deutsch (Deutschland)', localName: 'Deutsch', flag: '🇩🇪', direction: 'ltr' },
  { code: 'it-IT', name: 'Italiano (Italia)', localName: 'Italiano', flag: '🇮🇹', direction: 'ltr' },
  { code: 'ja-JP', name: '日本語 (日本)', localName: '日本語', flag: '🇯🇵', direction: 'ltr' },
  { code: 'zh-CN', name: '简体中文 (中国)', localName: '简体中文', flag: '🇨🇳', direction: 'ltr' },
];

let activeLanguageCode = 'pt-BR';

export class LanguageManager {
  public static getSupportedLanguages(): Language[] {
    return SUPPORTED_LANGUAGES;
  }

  public static getActiveLanguage(): Language {
    return SUPPORTED_LANGUAGES.find(l => l.code === activeLanguageCode) || SUPPORTED_LANGUAGES[0];
  }

  public static setActiveLanguage(code: string): void {
    const exists = SUPPORTED_LANGUAGES.some(l => l.code === code);
    if (exists) {
      activeLanguageCode = code;
    }
  }

  public static getLanguageByCode(code: string): Language | undefined {
    return SUPPORTED_LANGUAGES.find(l => l.code === code);
  }
}
