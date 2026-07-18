export interface ConnectorConfig {
  id: string;
  name: string;
  category: 'Comunicação' | 'Marketing' | 'Conteúdo' | 'Produtividade' | 'CRM' | 'Pagamentos' | 'ERP';
  version: string;
  status: 'active' | 'inactive' | 'error' | 'testing';
  dependencies: string[];
  permissions: string[];
  supportedEvents: string[];
  webhooks: {
    name: string;
    url: string;
    status: 'active' | 'inactive';
  }[];
  rateLimits: {
    limit: number;
    windowSeconds: number;
  };
}

export interface ConnectorLog {
  timestamp: string;
  type: 'info' | 'warn' | 'error';
  message: string;
}

export interface ConnectorHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  latencyMs: number;
  message: string;
  lastCheckedAt: string;
}

export abstract class BaseConnector {
  public abstract readonly config: ConnectorConfig;
  protected logs: ConnectorLog[] = [];

  /**
   * Grava logs internos específicos do conector
   */
  public log(type: 'info' | 'warn' | 'error', message: string): void {
    const entry: ConnectorLog = {
      timestamp: new Date().toISOString(),
      type,
      message
    };
    this.logs.push(entry);
    if (this.logs.length > 100) {
      this.logs.shift(); // Manter apenas as últimas 100 entradas
    }
  }

  public getLogs(): ConnectorLog[] {
    return this.logs;
  }

  public abstract healthCheck(): Promise<ConnectorHealth>;

  public abstract execute(action: string, params: any): Promise<any>;
}
