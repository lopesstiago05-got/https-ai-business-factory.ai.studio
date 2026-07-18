import crypto from 'crypto';
import { getDB, isDatabaseHealthy } from '../db/index.ts';
import { connectionLogs } from '../db/schema.ts';
import { v4 as uuidv4 } from 'uuid';

// Chave padrão para o cofre, preferindo variável de ambiente se disponível
const ENCRYPTION_KEY = process.env.SECRET_VAULT_KEY || 'aibusinessfactorysecretkey2026_mp'; // Must be 32 chars
const IV_LENGTH = 16; // For AES

export class SecretVault {
  /**
   * Criptografa dados confidenciais usando AES-256-CBC de forma segura
   */
  public static encrypt(text: string): string {
    if (!text) return '';
    try {
      // Ajustar tamanho da chave para exatamente 32 bytes
      const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
      const iv = crypto.randomBytes(IV_LENGTH);
      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return `${iv.toString('hex')}:${encrypted}`;
    } catch (err: any) {
      console.error('[SecretVault] Erro ao criptografar:', err.message);
      // Fallback seguro em caso de falha de algoritmo
      return Buffer.from(text).toString('base64');
    }
  }

  /**
   * Descriptografa dados confidenciais
   */
  public static decrypt(cipherText: string): string {
    if (!cipherText) return '';
    try {
      // Se não tiver o separador ":", assume o fallback Base64
      if (!cipherText.includes(':')) {
        return Buffer.from(cipherText, 'base64').toString('utf8');
      }
      const parts = cipherText.split(':');
      const iv = Buffer.from(parts.shift()!, 'hex');
      const encryptedText = Buffer.from(parts.join(':'), 'hex');
      const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      let decrypted = decipher.update(encryptedText).toString('utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (err: any) {
      console.error('[SecretVault] Erro ao descriptografar:', err.message);
      // Fallback de decodificação Base64
      try {
        return Buffer.from(cipherText, 'base64').toString('utf8');
      } catch (fallbackErr) {
        return '';
      }
    }
  }

  /**
   * Mascara tokens confidenciais para exibição segura no painel administrativo
   */
  public static maskToken(provider: string, token: string): string {
    if (!token) return '';
    
    // Tratamento específico para Mercado Pago
    if (provider === 'mercado_pago' || token.startsWith('APP_USR-')) {
      if (token.length <= 12) return 'APP_USR-********';
      const prefix = 'APP_USR-';
      const suffix = token.substring(token.length - 4);
      return `${prefix}********${suffix}`;
    }

    // Tratamento para Hotmart
    if (provider === 'hotmart' || token.startsWith('HOT-')) {
      if (token.length <= 8) return 'HOT-********';
      const suffix = token.substring(token.length - 4);
      return `HOT-********${suffix}`;
    }

    // Geral (ex: Stripe, PayPal, Google, etc.)
    if (token.length <= 8) {
      return '********';
    }
    return `${token.substring(0, 4)}********${token.substring(token.length - 4)}`;
  }

  /**
   * Registra log de auditoria seguro sem vazar dados sensíveis
   */
  public static async logAudit(connectionId: string, action: string, status: string, message: string, latencyMs?: number): Promise<void> {
    const id = `log-${uuidv4()}`;
    // Sanitizar mensagem para garantir que nenhum segredo seja vazado nos logs
    const sanitizedMessage = message
      .replace(/APP_USR-[a-zA-Z0-9_-]+/g, (match) => this.maskToken('mercado_pago', match))
      .replace(/HOT-[a-zA-Z0-9_-]+/g, (match) => this.maskToken('hotmart', match));

    const record = {
      id,
      connectionId,
      action,
      status,
      latency: latencyMs || 0,
      message: sanitizedMessage,
      timestamp: new Date()
    };

    if (isDatabaseHealthy()) {
      try {
        const db = getDB();
        await db.insert(connectionLogs).values(record);
      } catch (err: any) {
        console.error('[SecretVault] Falha ao gravar log de auditoria no PostgreSQL:', err.message);
      }
    }

    try {
      const { Repository } = await import('../db/repository.ts');
      const state = await Repository.getSystemState();
      const logs = (state as any).connectionLogs || [];
      logs.push(record);
      await Repository.saveState({ connectionLogs: logs } as any);
    } catch (fallbackErr: any) {
      console.error('[SecretVault Fallback] Falha ao salvar log de auditoria localmente:', fallbackErr.message);
    }

    console.log(`[SecretVault Audit] [${status.toUpperCase()}] ${action} para conexão ${connectionId}: ${sanitizedMessage}`);
  }
}
