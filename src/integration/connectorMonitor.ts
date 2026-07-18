import { IntegrationEventBus } from './integrationEvents.ts';

export interface MonitorMetric {
  connectorId: string;
  responseTimeMs: number;
  success: boolean;
  rateLimitUsed: number;
  timestamp: string;
}

export interface ConnectorAlert {
  id: string;
  connectorId: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export class ConnectorMonitor {
  private static metrics: MonitorMetric[] = [];
  private static alerts: ConnectorAlert[] = [];

  /**
   * Grava uma métrica operacional e gera alertas automáticos em caso de anomalias
   */
  public static recordMetric(connectorId: string, responseTimeMs: number, success: boolean, rateLimitUsed = 1): void {
    const metric: MonitorMetric = {
      connectorId,
      responseTimeMs,
      success,
      rateLimitUsed,
      timestamp: new Date().toISOString()
    };
    this.metrics.push(metric);
    
    // Limitar histórico para evitar vazamento de memória em execução contínua
    if (this.metrics.length > 500) {
      this.metrics.shift();
    }

    // Alertas automáticos imediatos em caso de falha de requisição ou latência crítica
    if (!success) {
      this.triggerAlert(connectorId, 'high', `Falha crítica detectada no conector: ${connectorId}. A API remota retornou erro.`);
      IntegrationEventBus.emit('CONNECTOR_ERROR', connectorId, { responseTimeMs, error: 'API_REQUEST_FAILED' });
    } else if (responseTimeMs > 2000) {
      this.triggerAlert(connectorId, 'medium', `Lentidão incomum detectada em ${connectorId}: tempo de resposta de ${responseTimeMs}ms.`);
    }
  }

  /**
   * Dispara um alerta de monitoramento inteligente
   */
  public static triggerAlert(connectorId: string, severity: ConnectorAlert['severity'], message: string): void {
    // Evitar alertas idênticos ativos gerados repetidamente em curto período (5 minutos)
    const recentDuplicate = this.alerts.find(a => 
      a.connectorId === connectorId && 
      a.message === message && 
      !a.resolved &&
      (new Date().getTime() - new Date(a.timestamp).getTime() < 300000)
    );

    if (recentDuplicate) return;

    const alert: ConnectorAlert = {
      id: 'alt_' + Math.random().toString(36).substr(2, 9),
      connectorId,
      severity,
      message,
      timestamp: new Date().toISOString(),
      resolved: false
    };

    this.alerts.push(alert);
    console.warn(`[ConnectorMonitor] ALERTA [${alert.severity.toUpperCase()}]: ${message}`);
  }

  public static resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  public static getMetrics(connectorId?: string): MonitorMetric[] {
    if (connectorId) {
      return this.metrics.filter(m => m.connectorId === connectorId);
    }
    return this.metrics;
  }

  public static getActiveAlerts(connectorId?: string): ConnectorAlert[] {
    const active = this.alerts.filter(a => !a.resolved);
    if (connectorId) {
      return active.filter(a => a.connectorId === connectorId);
    }
    return active;
  }

  public static getConnectorUptime(connectorId: string): number {
    const connMetrics = this.metrics.filter(m => m.connectorId === connectorId);
    if (connMetrics.length === 0) return 100;
    const successful = connMetrics.filter(m => m.success).length;
    return Math.round((successful / connMetrics.length) * 100);
  }

  public static getAverageLatency(connectorId: string): number {
    const connMetrics = this.metrics.filter(m => m.connectorId === connectorId);
    if (connMetrics.length === 0) return 0;
    const sum = connMetrics.reduce((acc, m) => acc + m.responseTimeMs, 0);
    return Math.round(sum / connMetrics.length);
  }
}
