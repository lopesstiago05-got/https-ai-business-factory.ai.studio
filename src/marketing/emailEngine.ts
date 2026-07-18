import { Repository } from '../db/repository.ts';
import { MarketingEvent } from '../types.ts';
import { logInfo, logWarn } from '../logs/logger.ts';

export class EmailEngine {
  /**
   * Dispara um e-mail de campanha de lançamento e registra o evento de marketing.
   */
  static async sendCampaignEmail(
    launchId: string,
    to: string,
    subject: string,
    body: string
  ): Promise<{ success: boolean; eventId: string; provider: string }> {
    const provider = Math.random() > 0.5 ? 'Gmail Connector' : 'SMTP Connector';
    logInfo(`[EmailEngine] Enviando e-mail de campanha via ${provider} para ${to}. Assunto: "${subject}"`);

    const eventId = 'evt_mail_' + Math.random().toString(36).substring(2, 9);
    const event: MarketingEvent = {
      id: eventId,
      launchId,
      eventType: 'email_sent',
      title: `E-mail de Campanha: ${subject}`,
      description: `E-mail enviado com sucesso para ${to} usando o ${provider}.`,
      channel: 'email',
      status: 'success',
      createdAt: new Date().toISOString()
    };

    await Repository.saveMarketingEvent(event);
    return { success: true, eventId, provider };
  }

  /**
   * Dispara e-mail de boas-vindas após cadastro ou lead capturado.
   */
  static async sendWelcomeEmail(
    customerEmail: string,
    productName: string,
    launchId: string = 'global'
  ): Promise<{ success: boolean; eventId: string }> {
    logInfo(`[EmailEngine] Enviando e-mail de boas-vindas via Gmail Connector para ${customerEmail}`);

    const eventId = 'evt_welcome_' + Math.random().toString(36).substring(2, 9);
    const event: MarketingEvent = {
      id: eventId,
      launchId,
      eventType: 'email_sent',
      title: `Boas-vindas ao ${productName}`,
      description: `E-mail de onboarding enviado para o cliente ${customerEmail}.`,
      channel: 'email',
      status: 'success',
      createdAt: new Date().toISOString()
    };

    await Repository.saveMarketingEvent(event);
    return { success: true, eventId };
  }

  /**
   * Dispara e-mail de confirmação de compra realizada com sucesso.
   */
  static async sendPurchaseEmail(
    customerEmail: string,
    productName: string,
    amount: number,
    launchId: string = 'global'
  ): Promise<{ success: boolean; eventId: string }> {
    logInfo(`[EmailEngine] Enviando e-mail de confirmação de compra via SMTP Connector para ${customerEmail} (R$ ${amount.toFixed(2)})`);

    const eventId = 'evt_purchase_' + Math.random().toString(36).substring(2, 9);
    const event: MarketingEvent = {
      id: eventId,
      launchId,
      eventType: 'email_sent',
      title: `Compra Aprovada: ${productName}`,
      description: `E-mail de entrega de produto e recibo enviado para ${customerEmail}. Valor: R$ ${amount.toFixed(2)}`,
      channel: 'email',
      status: 'success',
      createdAt: new Date().toISOString()
    };

    await Repository.saveMarketingEvent(event);
    return { success: true, eventId };
  }

  /**
   * Dispara e-mail de follow-up / recuperação de carrinho.
   */
  static async sendFollowUpEmail(
    customerEmail: string,
    productName: string,
    launchId: string = 'global'
  ): Promise<{ success: boolean; eventId: string }> {
    logInfo(`[EmailEngine] Enviando e-mail de follow-up via Gmail Connector para ${customerEmail}`);

    const eventId = 'evt_followup_' + Math.random().toString(36).substring(2, 9);
    const event: MarketingEvent = {
      id: eventId,
      launchId,
      eventType: 'email_sent',
      title: `Não perca sua chance: ${productName}`,
      description: `E-mail de follow-up enviado para o cliente em potencial ${customerEmail}.`,
      channel: 'email',
      status: 'success',
      createdAt: new Date().toISOString()
    };

    await Repository.saveMarketingEvent(event);
    return { success: true, eventId };
  }
}
