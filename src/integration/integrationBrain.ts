import { GoogleGenAI } from '@google/genai';
import { ConnectorRegistry } from './connectorRegistry.ts';
import { IntegrationEventBus } from './integrationEvents.ts';
import { logInfo, logWarn, logError } from '../logs/logger.ts';
import { ModelManager } from '../kernel/ModelManager.ts';

export interface ProposedConnector {
  id: string;
  connectorId: string;
  details: string;
  status: 'pending' | 'approved' | 'rejected';
  proposedAt: string;
}

export class IntegrationBrain {
  private static proposals: ProposedConnector[] = [];

  private static getAI(): GoogleGenAI {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY não está configurada nos segredos.');
    }
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }

  /**
   * Avalia uma tarefa de agente de IA para identificar necessidades latentes de integração de forma preditiva
   */
  public static async evaluateTaskIntegration(title: string, description: string): Promise<{
    needDetected: boolean;
    connectorId?: string;
    action?: string;
    reason?: string;
  }> {
    logInfo(`[IntegrationBrain] Analisando tarefa: "${title}" para detectar necessidades de integração.`);
    
    // Fallback rápido local baseado em palavras-chave para assegurar robustez
    const titleLower = title.toLowerCase();
    const descLower = description.toLowerCase();

    let localMatch: string | null = null;
    let localAction = 'SYNC_DATA';
    let localReason = '';

    if (titleLower.includes('whatsapp') || descLower.includes('whatsapp')) {
      localMatch = 'whatsapp_business';
      localAction = 'SEND_NOTIFY';
      localReason = 'Identificado padrão para envio automatizado de notificações de checkout via WhatsApp.';
    } else if (titleLower.includes('telegram') || descLower.includes('telegram')) {
      localMatch = 'telegram';
      localAction = 'SEND_MESSAGE';
      localReason = 'Identificado padrão para disparo de canais públicos ou robô de suporte do Telegram.';
    } else if (titleLower.includes('stripe') || descLower.includes('stripe')) {
      localMatch = 'stripe';
      localAction = 'CREATE_CHARGE';
      localReason = 'Identificado padrão para processar pagamentos ou faturas via Stripe internacional.';
    } else if (titleLower.includes('mercado pago') || descLower.includes('mercado pago')) {
      localMatch = 'mercado_pago_api';
      localAction = 'PROCESS_PIX';
      localReason = 'Identificado padrão para faturamento nacional ou cobrança via PIX Mercado Pago.';
    } else if (titleLower.includes('notion') || descLower.includes('notion')) {
      localMatch = 'notion_api';
      localAction = 'CREATE_PAGE';
      localReason = 'Identificado padrão para criação automática de briefings ou páginas de projeto no Notion.';
    } else if (titleLower.includes('slack') || descLower.includes('slack')) {
      localMatch = 'slack';
      localAction = 'POST_ALERT';
      localReason = 'Identificado padrão para envio de mensagens de auditoria interna para canais do Slack.';
    } else if (titleLower.includes('google ads') || descLower.includes('google ads')) {
      localMatch = 'google_ads';
      localAction = 'SYNC_CONVERSIONS';
      localReason = 'Identificado padrão para sincronização de métricas e orçamentos do Google Ads.';
    } else if (titleLower.includes('docs') || descLower.includes('docs') || titleLower.includes('documento') || descLower.includes('documento')) {
      localMatch = 'google_docs';
      localAction = 'CREATE_DOCUMENT';
      localReason = 'Identificado padrão de criação, atualização ou exportação de e-book ou briefing para o Google Docs.';
    } else if (titleLower.includes('slides') || descLower.includes('slides') || titleLower.includes('apresentacao') || titleLower.includes('apresentação') || descLower.includes('apresentação')) {
      localMatch = 'google_slides';
      localAction = 'CREATE_PRESENTATION';
      localReason = 'Identificado padrão de exportação de pitch deck ou roteiro visual para o Google Slides.';
    } else if (titleLower.includes('forms') || descLower.includes('forms') || titleLower.includes('formulario') || titleLower.includes('formulário') || descLower.includes('formulário')) {
      localMatch = 'google_forms';
      localAction = 'CREATE_FORM';
      localReason = 'Identificado padrão de criação de formulário ou pesquisa de feedback de audiência no Google Forms.';
    } else if (titleLower.includes('keep') || descLower.includes('keep') || titleLower.includes('nota') || descLower.includes('nota') || titleLower.includes('rascunho') || descLower.includes('rascunho')) {
      localMatch = 'google_keep';
      localAction = 'CREATE_NOTE';
      localReason = 'Identificado padrão de sincronização de ideias, rascunhos ou notas rápidos no Google Keep.';
    } else if (titleLower.includes('drive') || descLower.includes('drive') || titleLower.includes('arquivo') || descLower.includes('arquivo')) {
      localMatch = 'google_drive';
      localAction = 'UPLOAD_FILE';
      localReason = 'Identificado padrão de upload ou organização de arquivos em nuvem no Google Drive.';
    } else if (titleLower.includes('sheet') || descLower.includes('sheet') || titleLower.includes('planilha') || descLower.includes('planilha')) {
      localMatch = 'google_sheets';
      localAction = 'UPDATE_SHEET';
      localReason = 'Identificado padrão de preenchimento de métricas, leads ou dados financeiros no Google Sheets.';
    }

    try {
      const ai = this.getAI();
      const response = await ModelManager.generateContent('integration', ai, {
        model: 'gemini-3.5-flash',
        contents: `Analise o título e a descrição da tarefa de um agente de IA e determine se ela necessita de integração com plataformas ou APIs externas.
        Disponibilize a resposta no seguinte formato JSON estrito:
        {
          "needDetected": boolean,
          "connectorId": "id_do_conector_sugerido_ou_null",
          "action": "acao_a_ser_executada_ou_null",
          "reason": "motivo_da_necessidade_ou_recomenda_conector"
        }

        Opções de conectores suportados pelo sistema:
        - whatsapp_business (WhatsApp Business)
        - telegram (Telegram)
        - discord (Discord)
        - slack (Slack)
        - meta_ads (Meta Ads)
        - google_ads (Google Ads)
        - instagram_graph (Instagram Graph)
        - google_workspace (Google Workspace)
        - google_drive (Google Drive)
        - google_docs (Google Docs)
        - google_sheets (Google Sheets)
        - google_slides (Google Slides)
        - google_forms (Google Forms)
        - google_keep (Google Keep)
        - google_tasks (Google Tasks)
        - google_contacts (Google Contacts)
        - notion_api (Notion API)
        - hubspot (HubSpot)
        - stripe (Stripe)
        - mercado_pago_api (Mercado Pago)
        - bling_erp (Bling ERP)

        Caso necessite de uma API que NÃO esteja nessa lista, retorne "needDetected": true, "connectorId": "novo_id_desejado_aqui" e no "reason" explique que é uma proposta nova.

        Título da Tarefa: "${title}"
        Descrição: "${description}"`,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text?.trim() || '';
      const parsed = JSON.parse(text);
      
      logInfo(`[IntegrationBrain] Resultado IA: ${JSON.stringify(parsed)}`);
      return {
        needDetected: !!parsed.needDetected,
        connectorId: parsed.connectorId || undefined,
        action: parsed.action || undefined,
        reason: parsed.reason || undefined
      };
    } catch (err: any) {
      logWarn(`[IntegrationBrain] Erro ao chamar IA para avaliação de integração: ${err.message}. Utilizando fallback local.`);
      if (localMatch) {
        return {
          needDetected: true,
          connectorId: localMatch,
          action: localAction,
          reason: localReason || `Identificado localmente através de análise heurística para: ${localMatch}`
        };
      }
      return { needDetected: false };
    }
  }

  /**
   * Processa o fluxo de pedido de integração de um agente (INTEGRATION REQUEST FLOW)
   */
  public static async processIntegrationRequest(
    tenantId: string,
    connectorId: string,
    action: string,
    details: string
  ): Promise<{
    status: 'configured' | 'proposed' | 'failed';
    message: string;
    proposalId?: string;
  }> {
    const installed = ConnectorRegistry.getConnectorById(connectorId);

    if (installed) {
      if (installed.status === 'active') {
        return {
          status: 'configured',
          message: `Conector '${connectorId}' já está instalado e ativo. Autorização e canais de comunicação validados.`
        };
      } else {
        return {
          status: 'failed',
          message: `Conector '${connectorId}' está instalado mas encontra-se com status '${installed.status}'. Favor reativá-lo.`
        };
      }
    }

    // Se o conector não existir, registra a necessidade gerando uma proposta para aprovação administrativa
    const proposalId = 'prop_' + Math.random().toString(36).substr(2, 9);
    const newProposal: ProposedConnector = {
      id: proposalId,
      connectorId,
      details: `Necessidade de execução da ação: ${action}. ${details}`,
      status: 'pending',
      proposedAt: new Date().toISOString()
    };

    this.proposals.push(newProposal);
    logWarn(`[IntegrationBrain] Conector '${connectorId}' solicitado mas não instalado. Proposta criada [ID: ${proposalId}] para aprovação administrativa.`);

    return {
      status: 'proposed',
      message: `O conector '${connectorId}' não está instalado. Uma proposta de conector foi criada para aprovação da administração.`,
      proposalId
    };
  }

  public static getProposals(): ProposedConnector[] {
    return this.proposals;
  }

  public static approveProposal(proposalId: string): boolean {
    const prop = this.proposals.find(p => p.id === proposalId);
    if (prop) {
      prop.status = 'approved';
      logInfo(`[IntegrationBrain] Proposta de conector '${prop.connectorId}' aprovada.`);
      return true;
    }
    return false;
  }
}
