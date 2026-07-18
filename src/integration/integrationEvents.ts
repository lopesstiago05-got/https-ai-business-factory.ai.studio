export type IntegrationEventType = 
  | 'CONNECTOR_INSTALLED'
  | 'CONNECTOR_UPDATED'
  | 'CONNECTOR_DISABLED'
  | 'CONNECTOR_ERROR'
  | 'CONECTOR_CORRIGIR';

export interface IntegrationEvent {
  id: string;
  type: IntegrationEventType;
  connectorId: string;
  timestamp: string;
  payload: any;
}

export class IntegrationEventBus {
  private static listeners: Map<IntegrationEventType, ((event: IntegrationEvent) => void)[]> = new Map();

  /**
   * Inscreve-se em um evento específico
   */
  public static subscribe(type: IntegrationEventType, callback: (event: IntegrationEvent) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(callback);
    return () => {
      const list = this.listeners.get(type) || [];
      this.listeners.set(type, list.filter(cb => cb !== callback));
    };
  }

  /**
   * Dispara um evento para todos os ouvintes registrados
   */
  public static emit(type: IntegrationEventType, connectorId: string, payload: any): IntegrationEvent {
    const event: IntegrationEvent = {
      id: 'evt_' + Math.random().toString(36).substr(2, 9),
      type,
      connectorId,
      timestamp: new Date().toISOString(),
      payload
    };
    
    const list = this.listeners.get(type) || [];
    list.forEach(cb => {
      try {
        cb(event);
      } catch (err) {
        console.error(`[IntegrationEventBus] Erro no ouvinte para ${type}:`, err);
      }
    });
    
    return event;
  }
}
