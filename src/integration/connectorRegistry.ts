import { ConnectorConfig } from './connectorFactory.ts';

export interface AvailableConnectorInfo {
  id: string;
  name: string;
  category: string;
  version: string;
  description: string;
  documentationUrl: string;
  supportedEvents: string[];
}

export interface ConnectorHistoryEntry {
  timestamp: string;
  action: 'INSTALLED' | 'UPDATED' | 'DISABLED' | 'ENABLED' | 'ERROR_RESOLVED';
  version: string;
  details: string;
}

export class ConnectorRegistry {
  private static availableConnectors: AvailableConnectorInfo[] = [
    // Comunicação
    {
      id: 'whatsapp_business',
      name: 'WhatsApp Business',
      category: 'Comunicação',
      version: '1.0.0',
      description: 'Envio de notificações, mensagens ativas e suporte automatizado via WhatsApp Business API.',
      documentationUrl: 'https://developers.facebook.com/docs/whatsapp',
      supportedEvents: ['MESSAGE_RECEIVED', 'MESSAGE_SENT', 'MESSAGE_DELIVERED']
    },
    {
      id: 'telegram',
      name: 'Telegram Bot',
      category: 'Comunicação',
      version: '1.0.0',
      description: 'Integração de canais, grupos de clientes e suporte com comandos e respostas via Telegram Bot.',
      documentationUrl: 'https://core.telegram.org/bots/api',
      supportedEvents: ['MESSAGE_RECEIVED', 'COMMAND_TRIGGERED']
    },
    {
      id: 'discord',
      name: 'Discord Webhook/Bot',
      category: 'Comunicação',
      version: '1.1.0',
      description: 'Publicação em canais e coordenação de comunidade de alunos ou membros via Discord.',
      documentationUrl: 'https://discord.com/developers/docs/intro',
      supportedEvents: ['MESSAGE_RECEIVED', 'GUILD_MEMBER_ADD']
    },
    {
      id: 'slack',
      name: 'Slack App',
      category: 'Comunicação',
      version: '1.0.2',
      description: 'Envio de alertas de vendas e acompanhamento de funis no Slack interno da equipe.',
      documentationUrl: 'https://api.slack.com',
      supportedEvents: ['MESSAGE_RECEIVED', 'APP_MENTION']
    },
    // Marketing
    {
      id: 'meta_ads',
      name: 'Meta Ads (Facebook/Instagram)',
      category: 'Marketing',
      version: '2.0.0',
      description: 'Criação, monitoramento e ajuste automático de campanhas no Facebook Ads e Instagram Ads.',
      documentationUrl: 'https://developers.facebook.com/docs/marketing-apis',
      supportedEvents: ['CAMPAIGN_STATUS_CHANGED', 'CONVERSION_RECEIVED']
    },
    {
      id: 'google_ads',
      name: 'Google Ads',
      category: 'Marketing',
      version: '1.5.0',
      description: 'Rastreamento de conversões, campanhas de pesquisa, rede de display e YouTube Ads.',
      documentationUrl: 'https://developers.google.com/google-ads/api/docs/start',
      supportedEvents: ['CONVERSION_SYNCED', 'BUDGET_EXHAUSTED']
    },
    // Conteúdo
    {
      id: 'instagram_graph',
      name: 'Instagram Graph API',
      category: 'Conteúdo',
      version: '1.2.0',
      description: 'Agendamento e publicação automática de posts, carrosséis, Reels e Stories promocionais.',
      documentationUrl: 'https://developers.facebook.com/docs/instagram-api',
      supportedEvents: ['MEDIA_PUBLISHED', 'COMMENT_RECEIVED']
    },
    // Produtividade
    {
      id: 'google_workspace',
      name: 'Google Workspace',
      category: 'Produtividade',
      version: '1.0.0',
      description: 'Sincronização com Google Drive, Google Sheets, Docs e Calendar para automação de entregas.',
      documentationUrl: 'https://developers.google.com/workspace',
      supportedEvents: ['FILE_CREATED', 'SHEET_UPDATED', 'EVENT_REMINDER']
    },
    {
      id: 'google_drive',
      name: 'Google Drive',
      category: 'Produtividade',
      version: '1.0.0',
      description: 'Armazenamento e sincronização de arquivos em nuvem.',
      documentationUrl: 'https://developers.google.com/drive',
      supportedEvents: ['FILE_CREATED', 'FILE_UPDATED']
    },
    {
      id: 'google_sheets',
      name: 'Google Sheets',
      category: 'Produtividade',
      version: '1.0.0',
      description: 'Geração e manipulação de planilhas e relatórios de dados.',
      documentationUrl: 'https://developers.google.com/sheets',
      supportedEvents: ['SPREADSHEET_CREATED', 'ROW_ADDED']
    },
    {
      id: 'google_docs',
      name: 'Google Docs',
      category: 'Produtividade',
      version: '1.0.0',
      description: 'Redação de documentos de texto estruturados, e-books e briefings.',
      documentationUrl: 'https://developers.google.com/docs',
      supportedEvents: ['DOCUMENT_CREATED', 'DOCUMENT_UPDATED']
    },
    {
      id: 'google_slides',
      name: 'Google Slides',
      category: 'Produtividade',
      version: '1.0.0',
      description: 'Criação e exportação de apresentações e pitches de vendas.',
      documentationUrl: 'https://developers.google.com/slides',
      supportedEvents: ['PRESENTATION_CREATED']
    },
    {
      id: 'google_forms',
      name: 'Google Forms',
      category: 'Produtividade',
      version: '1.0.0',
      description: 'Coleta de feedbacks e pesquisas de mercado integradas.',
      documentationUrl: 'https://developers.google.com/forms',
      supportedEvents: ['FORM_CREATED', 'RESPONSE_SUBMITTED']
    },
    {
      id: 'google_keep',
      name: 'Google Keep',
      category: 'Produtividade',
      version: '1.0.0',
      description: 'Bloco de notas rápidas para ideias, rascunhos de copy e insights.',
      documentationUrl: 'https://developers.google.com/keep',
      supportedEvents: ['NOTE_CREATED', 'NOTE_UPDATED']
    },
    {
      id: 'google_tasks',
      name: 'Google Tasks',
      category: 'Produtividade',
      version: '1.0.0',
      description: 'Gerenciamento de listas de tarefas operacionais integradas ao Google Workspace.',
      documentationUrl: 'https://developers.google.com/tasks',
      supportedEvents: ['TASK_CREATED', 'TASK_COMPLETED']
    },
    {
      id: 'google_contacts',
      name: 'Google Contacts',
      category: 'Produtividade',
      version: '1.0.0',
      description: 'Gerenciamento de contatos, clientes e leads do ecossistema Google.',
      documentationUrl: 'https://developers.google.com/contacts',
      supportedEvents: ['CONTACT_CREATED', 'CONTACT_UPDATED']
    },
    {
      id: 'notion_api',
      name: 'Notion API',
      category: 'Produtividade',
      version: '1.0.0',
      description: 'Sincronização de bancos de dados, criação de páginas de briefing e tarefas no Notion.',
      documentationUrl: 'https://developers.notion.com',
      supportedEvents: ['PAGE_CREATED', 'BLOCK_UPDATED']
    },
    // CRM
    {
      id: 'hubspot',
      name: 'HubSpot',
      category: 'CRM',
      version: '1.1.0',
      description: 'Gestão de contatos, leads, funis de vendas e automação de e-mails no HubSpot CRM.',
      documentationUrl: 'https://developers.hubspot.com',
      supportedEvents: ['CONTACT_CREATED', 'DEAL_UPDATED']
    },
    // Pagamentos
    {
      id: 'stripe',
      name: 'Stripe API',
      category: 'Pagamentos',
      version: '2.1.0',
      description: 'Cobranças recorrentes, checkout de infoprodutos e faturas internacionais via Stripe.',
      documentationUrl: 'https://stripe.com/docs/api',
      supportedEvents: ['PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'CHARGE_REFUNDED']
    },
    {
      id: 'mercado_pago_api',
      name: 'Mercado Pago API',
      category: 'Pagamentos',
      version: '1.8.0',
      description: 'Checkout Transparente, PIX, Cartão de Crédito e Boleto do Mercado Pago com conciliação.',
      documentationUrl: 'https://www.mercadopago.com.br/developers',
      supportedEvents: ['PAYMENT_APPROVED', 'PAYMENT_PENDING']
    },
    // ERP
    {
      id: 'bling_erp',
      name: 'Bling ERP',
      category: 'ERP',
      version: '1.0.0',
      description: 'Emissão de Notas Fiscais eletrônicas, controle financeiro e de estoque no Bling ERP.',
      documentationUrl: 'https://developer.bling.com.br',
      supportedEvents: ['INVOICE_ISSUED', 'STOCK_UPDATED']
    }
  ];

  private static installedConnectors: Map<string, ConnectorConfig> = new Map();
  private static history: Map<string, ConnectorHistoryEntry[]> = new Map();

  public static getAvailableConnectors(): AvailableConnectorInfo[] {
    return this.availableConnectors;
  }

  public static getInstalledConnectors(): ConnectorConfig[] {
    return Array.from(this.installedConnectors.values());
  }

  public static getActiveConnectors(): ConnectorConfig[] {
    return this.getInstalledConnectors().filter(c => c.status === 'active');
  }

  public static getConnectorById(id: string): ConnectorConfig | null {
    return this.installedConnectors.get(id) || null;
  }

  public static registerInstalledConnector(config: ConnectorConfig): void {
    this.installedConnectors.set(config.id, config);
    this.addHistory(config.id, 'INSTALLED', config.version, `Conector ${config.name} instalado e configurado com sucesso.`);
  }

  public static updateConnectorConfig(id: string, updates: Partial<ConnectorConfig>): void {
    const existing = this.installedConnectors.get(id);
    if (!existing) return;
    
    const updated = { ...existing, ...updates };
    this.installedConnectors.set(id, updated);
    
    let action: ConnectorHistoryEntry['action'] = 'UPDATED';
    if (updates.status === 'inactive') action = 'DISABLED';
    if (updates.status === 'active' && existing.status !== 'active') action = 'ENABLED';

    this.addHistory(id, action, updated.version, `Conector configurado e modificado.`);
  }

  public static addHistory(
    connectorId: string,
    action: ConnectorHistoryEntry['action'],
    version: string,
    details: string
  ): void {
    if (!this.history.has(connectorId)) {
      this.history.set(connectorId, []);
    }
    this.history.get(connectorId)!.push({
      timestamp: new Date().toISOString(),
      action,
      version,
      details
    });
  }

  public static getHistory(connectorId: string): ConnectorHistoryEntry[] {
    return this.history.get(connectorId) || [];
  }
}
