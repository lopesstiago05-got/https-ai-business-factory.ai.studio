export interface DiscoveredApiMetadata {
  id: string;
  name: string;
  baseUrl: string;
  currentVersion: string;
  availableVersions: string[];
  authenticationType: 'API_KEY' | 'OAUTH2' | 'BEARER' | 'NONE';
  status: 'online' | 'offline' | 'unstable';
  rateLimitLimit: number;
  rateLimitWindowSeconds: number;
  lastCheckedAt: string;
  changesDetected?: {
    field: string;
    type: 'ADD' | 'REMOVE' | 'DEPRECATED';
    description: string;
    detectedAt: string;
  }[];
}

export class ApiDiscoveryEngine {
  private static discoveredApis: Map<string, DiscoveredApiMetadata> = new Map([
    ['whatsapp_business', {
      id: 'whatsapp_business',
      name: 'Meta Graph API (WhatsApp)',
      baseUrl: 'https://graph.facebook.com/v19.0',
      currentVersion: 'v19.0',
      availableVersions: ['v18.0', 'v19.0', 'v20.0'],
      authenticationType: 'BEARER',
      status: 'online',
      rateLimitLimit: 200,
      rateLimitWindowSeconds: 1,
      lastCheckedAt: new Date().toISOString()
    }],
    ['meta_ads', {
      id: 'meta_ads',
      name: 'Meta Marketing API',
      baseUrl: 'https://graph.facebook.com/v19.0',
      currentVersion: 'v19.0',
      availableVersions: ['v17.0', 'v18.0', 'v19.0'],
      authenticationType: 'BEARER',
      status: 'online',
      rateLimitLimit: 100,
      rateLimitWindowSeconds: 1,
      lastCheckedAt: new Date().toISOString()
    }],
    ['stripe', {
      id: 'stripe',
      name: 'Stripe API',
      baseUrl: 'https://api.stripe.com/v1',
      currentVersion: '2023-10-16',
      availableVersions: ['2023-08-16', '2023-10-16', '2024-02-15'],
      authenticationType: 'BEARER',
      status: 'online',
      rateLimitLimit: 100,
      rateLimitWindowSeconds: 1,
      lastCheckedAt: new Date().toISOString()
    }],
    ['google_workspace', {
      id: 'google_workspace',
      name: 'Google Workspace APIs',
      baseUrl: 'https://www.googleapis.com',
      currentVersion: 'v1',
      availableVersions: ['v1'],
      authenticationType: 'OAUTH2',
      status: 'online',
      rateLimitLimit: 1500,
      rateLimitWindowSeconds: 60,
      lastCheckedAt: new Date().toISOString()
    }]
  ]);

  /**
   * Identifica uma API externa e recupera os metadados de descoberta associados
   */
  public static async discoverApi(id: string): Promise<DiscoveredApiMetadata> {
    const existing = this.discoveredApis.get(id);
    if (existing) {
      existing.lastCheckedAt = new Date().toISOString();
      existing.status = Math.random() > 0.05 ? 'online' : 'unstable';
      return existing;
    }

    // Criar um novo metadado descoberto dinamicamente caso não exista na base inicial
    const newApi: DiscoveredApiMetadata = {
      id,
      name: `${id.toUpperCase()} Discovery Interface`,
      baseUrl: `https://api.${id}.com/v1`,
      currentVersion: 'v1.0.0',
      availableVersions: ['v1.0.0'],
      authenticationType: 'API_KEY',
      status: 'online',
      rateLimitLimit: 60,
      rateLimitWindowSeconds: 60,
      lastCheckedAt: new Date().toISOString()
    };
    this.discoveredApis.set(id, newApi);
    return newApi;
  }

  /**
   * Valida se a autenticação é funcional realizando um ping ou dry-run remoto simulado
   */
  public static async validateAuthentication(id: string, token: string): Promise<{
    valid: boolean;
    error?: string;
  }> {
    if (!token) {
      return { valid: false, error: 'Token/Chave de API não foi fornecida.' };
    }
    // Simular validações em tokens falsificados
    if (token.toLowerCase().includes('invalid') || token.length < 5) {
      return { valid: false, error: 'Credencial inválida ou rejeitada pelo servidor remoto.' };
    }
    return { valid: true };
  }

  /**
   * Monitora e detecta mudanças repentinas na API (depreciações de endpoints ou novos campos)
   */
  public static detectChanges(id: string): DiscoveredApiMetadata['changesDetected'] {
    const existing = this.discoveredApis.get(id);
    if (!existing) return [];
    
    // Simula ocasionalmente uma detecção de depreciação de endpoint
    if (Math.random() > 0.85) {
      existing.changesDetected = [
        {
          field: 'deprecated_endpoint',
          type: 'DEPRECATED',
          description: 'O endpoint /v1/legacy-payload foi depreciado pelo provedor e será desligado em breve.',
          detectedAt: new Date().toISOString()
        }
      ];
    }
    return existing.changesDetected || [];
  }
}
