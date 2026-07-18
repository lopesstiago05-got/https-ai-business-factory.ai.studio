import { GoogleGenAI } from '@google/genai';
import { LanguageManager } from './languageManager.ts';
import { logWarn } from '../logs/logger.ts';

const DICTIONARY: Record<string, Record<string, string>> = {
  'pt-BR': {
    'dashboard': 'Painel Executivo',
    'agents': 'Agentes IA',
    'products': 'Infoprodutos',
    'tasks': 'Fila de Tarefas',
    'metrics': 'Métricas Globais',
    'growth': 'Crescimento Autônomo',
    'global_expansion': 'Expansão Global',
    'settings': 'Configurações',
    'compliance': 'Aviso de Conformidade Fiscal',
    'connected': 'Conectado',
    'disconnected': 'Desconectado',
    'language': 'Idioma',
    'currency': 'Moeda',
    'country': 'País/Região',
    'save': 'Salvar',
    'execute': 'Executar Expansão',
    'audit': 'Auditoria de Localização',
  },
  'en-US': {
    'dashboard': 'Executive Dashboard',
    'agents': 'AI Agents',
    'products': 'Digital Products',
    'tasks': 'Task Queue',
    'metrics': 'Global Metrics',
    'growth': 'Autonomous Growth',
    'global_expansion': 'Global Expansion',
    'settings': 'Settings',
    'compliance': 'Tax Compliance Notice',
    'connected': 'Connected',
    'disconnected': 'Disconnected',
    'language': 'Language',
    'currency': 'Currency',
    'country': 'Country/Region',
    'save': 'Save',
    'execute': 'Execute Expansion',
    'audit': 'Localization Audit',
  },
  'es-ES': {
    'dashboard': 'Panel Ejecutivo',
    'agents': 'Agentes IA',
    'products': 'Infoproductos',
    'tasks': 'Cola de Tareas',
    'metrics': 'Métricas Globales',
    'growth': 'Crecimiento Autónomo',
    'global_expansion': 'Expansión Global',
    'settings': 'Configuraciones',
    'compliance': 'Aviso de Cumplimiento Fiscal',
    'connected': 'Conectado',
    'disconnected': 'Desconectado',
    'language': 'Idioma',
    'currency': 'Moneda',
    'country': 'País/Región',
    'save': 'Guardar',
    'execute': 'Ejecutar Expansión',
    'audit': 'Auditoría de Localización',
  },
  'fr-FR': {
    'dashboard': 'Tableau de Bord',
    'agents': 'Agents IA',
    'products': 'Produits Numériques',
    'tasks': 'File d\'attente',
    'metrics': 'Métriques Globales',
    'growth': 'Croissance Autonome',
    'global_expansion': 'Expansion Globale',
    'settings': 'Paramètres',
    'compliance': 'Avis de Conformité Fiscale',
    'connected': 'Connecté',
    'disconnected': 'Déconnecté',
    'language': 'Langue',
    'currency': 'Devise',
    'country': 'Pays/Région',
    'save': 'Enregistrer',
    'execute': 'Exécuter l\'Expansion',
    'audit': 'Audit de Localisation',
  },
  'de-DE': {
    'dashboard': 'Vorstand-Dashboard',
    'agents': 'KI-Agenten',
    'products': 'Digitale Produkte',
    'tasks': 'Aufgabenwarteschlange',
    'metrics': 'Globale Metriken',
    'growth': 'Autonomes Wachstum',
    'global_expansion': 'Globale Expansion',
    'settings': 'Einstellungen',
    'compliance': 'Steuerkonformitätshinweis',
    'connected': 'Verbunden',
    'disconnected': 'Trennen',
    'language': 'Sprache',
    'currency': 'Währung',
    'country': 'Land/Region',
    'save': 'Speichern',
    'execute': 'Expansion Ausführen',
    'audit': 'Lokalisierungsprüfung',
  },
  'it-IT': {
    'dashboard': 'Cruscotto Direzionale',
    'agents': 'Agenti IA',
    'products': 'Infoprodotti',
    'tasks': 'Coda di Lavoro',
    'metrics': 'Metriche Globali',
    'growth': 'Crescita Autonoma',
    'global_expansion': 'Espansione Globale',
    'settings': 'Impostazioni',
    'compliance': 'Avviso di Conformità Fiscale',
    'connected': 'Connesso',
    'disconnected': 'Scollegato',
    'language': 'Lingua',
    'currency': 'Valuta',
    'country': 'Paese/Regione',
    'save': 'Salva',
    'execute': 'Esegui Espansione',
    'audit': 'Audit di Localizzazione',
  },
  'ja-JP': {
    'dashboard': '経営ダッシュボード',
    'agents': 'AIエージェント',
    'products': 'デジタル商品',
    'tasks': 'タスクキュー',
    'metrics': 'グローバルメトリクス',
    'growth': '自律成長',
    'global_expansion': 'グローバル展開',
    'settings': '設定',
    'compliance': '税務コンプライアンスの通知',
    'connected': '接続済み',
    'disconnected': '切断済み',
    'language': '言語',
    'currency': '通貨',
    'country': '国/地域',
    'save': '保存',
    'execute': '展開を実行',
    'audit': 'ローカライズ監査',
  },
  'zh-CN': {
    'dashboard': '高管仪表盘',
    'agents': 'AI代理商',
    'products': '数字产品',
    'tasks': '任务队列',
    'metrics': '全局指标',
    'growth': '自主增长',
    'global_expansion': '全球扩张',
    'settings': '设置',
    'compliance': '税务合规通知',
    'connected': '已连接',
    'disconnected': '已断开',
    'language': '语言',
    'currency': '货币',
    'country': '国家/地区',
    'save': '保存',
    'execute': '执行全球化扩张',
    'audit': '本地化审计',
  }
};

export class TranslationEngine {
  /**
   * Traduz uma chave do dicionário estático local
   */
  public static translateKey(key: string, targetLanguage?: string): string {
    const lang = targetLanguage || LanguageManager.getActiveLanguage().code;
    const dict = DICTIONARY[lang] || DICTIONARY['pt-BR'];
    return dict[key] || DICTIONARY['pt-BR'][key] || key;
  }

  /**
   * Traduz um bloco de texto arbitrário em tempo real usando a inteligência do Gemini (Servidor)
   */
  public static async translateText(text: string, targetLanguageName: string): Promise<string> {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      logWarn('GEMINI_API_KEY não configurada. Retornando texto original.');
      return text;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Você é um tradutor nativo de alta performance para produtos digitais e copys de marketing.
        Traduza o seguinte texto para o idioma "${targetLanguageName}". Preserve a formatação Markdown, marcas de pontuação e o tom persuasivo original.
        Não acrescente observações, notas de rodapé ou explicações. Retorne EXCLUSIVAMENTE a tradução direta:
        
        ${text}`
      });

      return response.text?.trim() || text;
    } catch (err: any) {
      logWarn(`[TranslationEngine] Erro na tradução automática via IA: ${err.message}`);
      return text;
    }
  }
}
