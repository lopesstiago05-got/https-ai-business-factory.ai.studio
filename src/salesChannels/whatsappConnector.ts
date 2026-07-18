import { WhatsAppMessage } from './salesChannelTypes.ts';

export class WhatsAppBusinessConnector {
  private static messagesLog: WhatsAppMessage[] = [];

  public static async sendMessage(
    to: string,
    body: string,
    type: 'manual' | 'notification' | 'recovery' | 'onboarding' = 'manual'
  ): Promise<WhatsAppMessage> {
    console.log(`[WhatsAppBusinessConnector] Enviando mensagem de WhatsApp (${type}) para ${to}: "${body.substring(0, 50)}..."`);
    
    const newMessage: WhatsAppMessage = {
      id: `wa_msg_${Math.random().toString(36).substr(2, 9)}`,
      to,
      body,
      status: 'sent',
      timestamp: new Date().toISOString(),
      type
    };

    this.messagesLog.push(newMessage);
    return newMessage;
  }

  public static async triggerRecoveryFlow(phone: string, customerName: string, productName: string, checkoutUrl: string): Promise<WhatsAppMessage> {
    const recoveryMsg = `Olá, ${customerName}! Tudo bem? 

Notamos que você tentou adquirir o "${productName}", mas o pagamento não foi concluído. 🛒

Para te ajudar a garantir sua vaga e os bônus de lançamento exclusivíssimos, liberamos um link seguro de checkout facilitado:
👉 ${checkoutUrl}

Se tiver qualquer dúvida ou problema com o pagamento, responda essa mensagem que nosso Customer Success Agent está pronto para te apoiar! 🚀`;

    return this.sendMessage(phone, recoveryMsg, 'recovery');
  }

  public static async triggerOnboardingFlow(phone: string, customerName: string, productName: string): Promise<WhatsAppMessage> {
    const onboardingMsg = `Parabéns, ${customerName}! 🎉

Sua compra do "${productName}" foi confirmada com sucesso! Você acaba de dar um passo gigantesco. 🚀

Já enviamos os dados de acesso para o seu e-mail cadastrado. Se precisar de ajuda para dar os primeiros passos ou tiver alguma dúvida, basta falar com a gente por aqui!

Seja muito bem-vindo!`;

    return this.sendMessage(phone, onboardingMsg, 'onboarding');
  }

  public static getSentMessages(): WhatsAppMessage[] {
    return this.messagesLog;
  }
}
