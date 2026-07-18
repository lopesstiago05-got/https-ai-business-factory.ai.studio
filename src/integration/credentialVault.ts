import { SecretVault } from '../security/SecretVault.ts';

export interface VaultCredential {
  connectorId: string;
  tenantId: string;
  key: string; // e.g. 'API_KEY', 'OAUTH_TOKEN', 'REFRESH_TOKEN', 'CLIENT_SECRET'
  encryptedValue: string;
  updatedAt: string;
  expiresAt: string | null;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  tenantId: string;
  connectorId: string;
  action: string; // 'READ', 'WRITE', 'ROTATE', 'DELETE', 'READ_FAILED'
  details: string;
}

export class CredentialVault {
  private static credentials: VaultCredential[] = [];
  private static auditLogs: AuditLog[] = [];

  /**
   * Salva uma credencial de forma segura e criptografada, isolada por tenant
   */
  public static async saveCredential(
    tenantId: string,
    connectorId: string,
    key: string,
    rawValue: string,
    expiresInSeconds?: number
  ): Promise<void> {
    const encrypted = SecretVault.encrypt(rawValue);
    const now = new Date();
    const expiresAt = expiresInSeconds ? new Date(now.getTime() + expiresInSeconds * 1000).toISOString() : null;

    // Remover credencial duplicada para evitar acúmulos
    this.credentials = this.credentials.filter(
      c => !(c.tenantId === tenantId && c.connectorId === connectorId && c.key === key)
    );

    this.credentials.push({
      connectorId,
      tenantId,
      key,
      encryptedValue: encrypted,
      updatedAt: now.toISOString(),
      expiresAt,
    });

    this.logAudit(tenantId, connectorId, 'WRITE', `Saved credential key: ${key}`);
  }

  /**
   * Recupera e descriptografa uma credencial ativa, isolada por tenant
   */
  public static async getCredential(
    tenantId: string,
    connectorId: string,
    key: string
  ): Promise<string | null> {
    const cred = this.credentials.find(
      c => c.tenantId === tenantId && c.connectorId === connectorId && c.key === key
    );

    if (!cred) {
      this.logAudit(tenantId, connectorId, 'READ_FAILED', `Failed reading key: ${key} (not found)`);
      return null;
    }

    // Verificar se expirou
    if (cred.expiresAt && new Date(cred.expiresAt) < new Date()) {
      this.logAudit(tenantId, connectorId, 'READ_EXPIRED', `Credential key: ${key} has expired`);
      return null;
    }

    this.logAudit(tenantId, connectorId, 'READ', `Successfully read credential key: ${key}`);
    return SecretVault.decrypt(cred.encryptedValue);
  }

  /**
   * Remove uma credencial do Vault
   */
  public static async deleteCredential(
    tenantId: string,
    connectorId: string,
    key: string
  ): Promise<boolean> {
    const initialLen = this.credentials.length;
    this.credentials = this.credentials.filter(
      c => !(c.tenantId === tenantId && c.connectorId === connectorId && c.key === key)
    );

    const deleted = this.credentials.length < initialLen;
    if (deleted) {
      this.logAudit(tenantId, connectorId, 'DELETE', `Deleted credential key: ${key}`);
    }
    return deleted;
  }

  /**
   * Realiza a rotação de uma credencial existente substituindo-a com nova expiração
   */
  public static async rotateCredential(
    tenantId: string,
    connectorId: string,
    key: string,
    newRawValue: string,
    expiresInSeconds?: number
  ): Promise<void> {
    await this.saveCredential(tenantId, connectorId, key, newRawValue, expiresInSeconds);
    this.logAudit(tenantId, connectorId, 'ROTATE', `Rotated credential key: ${key}`);
  }

  /**
   * Obtém os logs de auditoria de credenciais
   */
  public static getAuditLogs(tenantId?: string): AuditLog[] {
    if (tenantId) {
      return this.auditLogs.filter(l => l.tenantId === tenantId);
    }
    return this.auditLogs;
  }

  private static logAudit(tenantId: string, connectorId: string, action: string, details: string): void {
    const log: AuditLog = {
      id: 'aud_' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      tenantId,
      connectorId,
      action,
      details,
    };
    this.auditLogs.push(log);
  }
}
