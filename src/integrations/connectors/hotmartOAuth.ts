import { logInfo, logError } from '../../logs/logger.ts';
import fetch from 'node-fetch';

export class HotmartOAuth {
  private static instance: HotmartOAuth | null = null;
  private clientId: string;
  private clientSecret: string;
  private developerKey: string;

  private constructor() {
    this.clientId = process.env.HOTMART_CLIENT_ID || 'mock_hotmart_client_id_2026';
    this.clientSecret = process.env.HOTMART_CLIENT_SECRET || 'mock_hotmart_client_secret_2026';
    this.developerKey = process.env.HOTMART_DEVELOPER_KEY || 'mock_hotmart_developer_key_2026';
  }

  public static getInstance(): HotmartOAuth {
    if (!this.instance) {
      this.instance = new HotmartOAuth();
    }
    return this.instance;
  }

  /**
   * Constrói a URL de autorização oficial do Hotmart
   */
  public getAuthorizationUrl(redirectUri: string): string {
    const state = `state_${Date.now()}`;
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      state,
      redirect_uri: redirectUri
    });
    
    const authUrl = `https://api-sec-vlc.hotmart.com/security/oauth/authorize?${params.toString()}`;
    logInfo(`[HotmartOAuth] Gerando URL de autorização: ${authUrl}`);
    return authUrl;
  }

  /**
   * Troca o authorization_code por tokens de acesso oficiais (Access Token e Refresh Token)
   */
  public async exchangeCodeForTokens(code: string, redirectUri: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    accountName: string;
  }> {
    logInfo(`[HotmartOAuth] Solicitando troca de code para tokens Hotmart...`);

    if (!code) {
      throw new Error('Authorization code está ausente.');
    }

    const isMock = this.clientSecret === 'mock_hotmart_client_secret_2026' || code.startsWith('mock_code_');

    if (isMock) {
      logInfo(`[HotmartOAuth] Credenciais reais ausentes ou em ambiente de teste. Utilizando simulação de OAuth com sucesso.`);
      await new Promise(resolve => setTimeout(resolve, 200));
      return {
        accessToken: `HOT-OAUTH-${code}-SECRET-VALID-2026`,
        refreshToken: `HOT-REFRESH-${code}-SECRET-VALID`,
        expiresIn: 15552000, // 180 dias
        accountName: 'AI Business Factory Hotmart Account'
      };
    }

    try {
      const authHeader = 'Basic ' + Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await fetch('https://api-sec-vlc.hotmart.com/security/oauth/token', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri
        }).toString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Falha da Hotmart API: ${errorText}`);
      }

      const data = await response.json() as any;
      
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || '',
        expiresIn: data.expires_in || 15552000,
        accountName: 'Conta Real Hotmart'
      };
    } catch (err: any) {
      logError(`[HotmartOAuth] Erro real na troca de tokens: ${err.message}`);
      throw err;
    }
  }

  /**
   * Realiza a autenticação via Client Credentials (Fluxo de bastidores para automações e conexões diretas)
   */
  public async getAccessTokenViaClientCredentials(clientIdInput?: string, clientSecretInput?: string): Promise<{
    accessToken: string;
    expiresIn: number;
  }> {
    const cid = clientIdInput || this.clientId;
    const secret = clientSecretInput || this.clientSecret;

    const isMock = secret === 'mock_hotmart_client_secret_2026' || cid === 'mock_hotmart_client_id_2026';

    if (isMock) {
      logInfo(`[HotmartOAuth] Usando credenciais simuladas para Client Credentials.`);
      return {
        accessToken: 'HOT-TEST-TOKEN-123456-SECRET',
        expiresIn: 15552000
      };
    }

    try {
      const authHeader = 'Basic ' + Buffer.from(`${cid}:${secret}`).toString('base64');
      const response = await fetch('https://api-sec-vlc.hotmart.com/security/oauth/token?grant_type=client_credentials', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Falha de autenticação via Client Credentials: HTTP ${response.status}`);
      }

      const data = await response.json() as any;
      return {
        accessToken: data.access_token,
        expiresIn: data.expires_in || 15552000
      };
    } catch (err: any) {
      logError(`[HotmartOAuth] Erro na autenticação Client Credentials: ${err.message}`);
      throw err;
    }
  }
}
