import { Repository } from '../db/repository.ts';
import { IntegrationAgent } from '../agents/IntegrationAgent.ts';
import { 
  KernelAgentRegistry, 
  KernelEvent, 
  KernelSharedMemory, 
  KernelPlugin, 
  KernelService, 
  KernelConfig, 
  KernelSecretMetadata, 
  KernelVersionRecord, 
  KernelTask, 
  KernelCommunicationLog, 
  KernelAuditLog, 
  KernelMetrics, 
  KernelHealth 
} from '../types.ts';

export class Kernel {
  private static instance: Kernel;
  private startTime: number = Date.now();
  private eventHandlers: Map<string, Array<(event: KernelEvent) => Promise<void>>> = new Map();

  private constructor() {
    this.startTime = Date.now();
  }

  public static getInstance(): Kernel {
    if (!Kernel.instance) {
      Kernel.instance = new Kernel();
    }
    return Kernel.instance;
  }

  /**
   * Inicializa o Kernel do Sistema
   */
  public async initialize(): Promise<void> {
    await this.logAudit('KernelStarted', 'kernel', 'AI Business Factory Kernel inicializado com sucesso.', 'System');
    
    // Inicializa serviços internos padrões
    await this.initDefaultServices();
    
    // Inicializa agentes padrões no Registry
    await this.initDefaultAgents();

    // Inicializa segredos mockados (infraestrutura de Secrets)
    await this.initDefaultSecrets();

    // Inicializa versões padrões
    await this.initDefaultVersions();

    // Inicializa configurações padrões
    await this.initDefaultConfigs();

    // Registra métricas iniciais
    await this.updateMetrics();

    // Inicializa o Integration Agent (Etapa 16)
    try {
      await IntegrationAgent.getInstance().initialize();
    } catch (intErr: any) {
      console.error('Falha ao inicializar o Integration Agent:', intErr);
    }

    // Registra barramento de evento de inicialização
    await this.publishEvent('KernelStarted', 'kernel', { message: 'Kernel do sistema iniciado' });
  }

  // ==========================================
  // === AUDITORIA E LOGS ===
  // ==========================================
  public async logAudit(action: string, category: string, details: string, user: string = 'System'): Promise<KernelAuditLog> {
    const auditLog: KernelAuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action,
      category,
      details,
      user,
      timestamp: new Date().toISOString()
    };
    await Repository.saveKernelAudit(auditLog);
    return auditLog;
  }

  // ==========================================
  // === EVENT BUS (BARRAMENTO DE EVENTOS) ===
  // ==========================================
  public subscribe(eventType: string, handler: (event: KernelEvent) => Promise<void>): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  public async publishEvent(
    eventType: KernelEvent['eventType'], 
    source: string, 
    payload: any
  ): Promise<KernelEvent> {
    const event: KernelEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType,
      source,
      payload,
      timestamp: new Date().toISOString()
    };

    // Salva no banco de dados / fallback JSON
    await Repository.saveKernelEvent(event);

    // Registra na auditoria
    await this.logAudit('EventPublished', 'event', `Evento ${eventType} publicado por ${source}`, 'System');

    // Executa handlers em background
    const handlers = this.eventHandlers.get(eventType) || [];
    for (const handler of handlers) {
      try {
        handler(event).catch(err => console.error(`Erro ao processar handler de evento ${eventType}:`, err));
      } catch (e) {
        console.error(`Erro síncrono no handler de evento ${eventType}:`, e);
      }
    }

    // Registra comunicação lógica no Event Bus
    await this.logCommunication(source, 'EventBus', eventType, 1, 'success');

    // Atualiza métricas
    await this.updateMetrics();

    return event;
  }

  // ==========================================
  // === REGISTRY DE AGENTES ===
  // ==========================================
  public async registerAgent(agent: Omit<KernelAgentRegistry, 'timestamp'>): Promise<KernelAgentRegistry> {
    const fullAgent: KernelAgentRegistry = {
      ...agent,
      timestamp: new Date().toISOString()
    };
    await Repository.saveKernelAgentRegistry(fullAgent);
    await this.logAudit('AgentRegistered', 'registry', `Agente ${agent.name} registrado com sucesso.`, 'System');
    await this.publishEvent('AgentStarted', 'kernel', { agentId: agent.id, name: agent.name });
    return fullAgent;
  }

  public async unregisterAgent(agentId: string): Promise<boolean> {
    const agents = await Repository.getKernelAgentRegistries();
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return false;

    agent.status = 'offline';
    agent.lastUpdate = new Date().toISOString();
    await Repository.saveKernelAgentRegistry(agent);

    await this.logAudit('AgentUnregistered', 'registry', `Agente ${agent.name} marcado como offline.`, 'System');
    await this.publishEvent('AgentStopped', 'kernel', { agentId });
    return true;
  }

  public async updateAgentStatus(agentId: string, status: KernelAgentRegistry['status'], currentTask?: string): Promise<boolean> {
    const agents = await Repository.getKernelAgentRegistries();
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return false;

    agent.status = status;
    agent.heartbeat = new Date().toISOString();
    agent.lastUpdate = new Date().toISOString();
    if (currentTask) {
      agent.lastExecution = new Date().toISOString();
    }
    await Repository.saveKernelAgentRegistry(agent);
    return true;
  }

  // ==========================================
  // === MEMÓRIA COMPARTILHADA ===
  // ==========================================
  public async writeSharedMemory(
    key: string, 
    value: any, 
    agentId: string, 
    options?: { expirationMinutes?: number; accessControl?: string[] }
  ): Promise<KernelSharedMemory> {
    const existing = (await Repository.getKernelSharedMemories()).find(x => x.key === key);
    
    // Controle de concorrência e bloqueio
    if (existing && existing.isLocked && existing.lockedBy !== agentId) {
      throw new Error(`A chave de memória '${key}' está bloqueada pelo agente '${existing.lockedBy}'`);
    }

    const version = existing ? existing.version + 1 : 1;
    let expiration: string | undefined = undefined;
    if (options?.expirationMinutes) {
      const expDate = new Date();
      expDate.setMinutes(expDate.getMinutes() + options.expirationMinutes);
      expiration = expDate.toISOString();
    }

    const memoryRecord: KernelSharedMemory = {
      key,
      value,
      version,
      expiration,
      accessControl: options?.accessControl || [],
      isLocked: 0,
      lastUpdatedBy: agentId,
      timestamp: new Date().toISOString()
    };

    await Repository.saveKernelSharedMemory(memoryRecord);
    await this.logAudit('SharedMemoryWrite', 'shared_memory', `Escrita na chave '${key}' pelo agente '${agentId}'`, agentId);
    return memoryRecord;
  }

  public async readSharedMemory(key: string, agentId: string): Promise<any | null> {
    const records = await Repository.getKernelSharedMemories();
    const record = records.find(x => x.key === key);
    if (!record) return null;

    // Verificar expiração
    if (record.expiration && new Date(record.expiration) < new Date()) {
      await Repository.deleteKernelSharedMemory(key);
      await this.logAudit('SharedMemoryExpired', 'shared_memory', `Chave '${key}' expirou e foi removida automaticamente.`, 'System');
      return null;
    }

    // Verificar controle de acesso
    if (record.accessControl.length > 0 && !record.accessControl.includes(agentId) && agentId !== 'System') {
      await this.logAudit('SharedMemoryUnauthorizedAccess', 'shared_memory', `Tentativa de acesso não autorizada na chave '${key}' pelo agente '${agentId}'`, agentId);
      throw new Error(`Acesso não autorizado para o agente '${agentId}' na chave '${key}'`);
    }

    await this.logAudit('SharedMemoryRead', 'shared_memory', `Leitura na chave '${key}' pelo agente '${agentId}'`, agentId);
    return record.value;
  }

  public async lockSharedMemory(key: string, agentId: string): Promise<boolean> {
    const records = await Repository.getKernelSharedMemories();
    const record = records.find(x => x.key === key);
    if (!record) return false;

    if (record.isLocked && record.lockedBy !== agentId) {
      return false;
    }

    record.isLocked = 1;
    record.lockedBy = agentId;
    record.timestamp = new Date().toISOString();
    await Repository.saveKernelSharedMemory(record);
    await this.logAudit('SharedMemoryLocked', 'shared_memory', `Chave '${key}' bloqueada pelo agente '${agentId}'`, agentId);
    return true;
  }

  public async unlockSharedMemory(key: string, agentId: string): Promise<boolean> {
    const records = await Repository.getKernelSharedMemories();
    const record = records.find(x => x.key === key);
    if (!record) return false;

    if (record.isLocked && record.lockedBy !== agentId && agentId !== 'System') {
      return false;
    }

    record.isLocked = 0;
    record.lockedBy = undefined;
    record.timestamp = new Date().toISOString();
    await Repository.saveKernelSharedMemory(record);
    await this.logAudit('SharedMemoryUnlocked', 'shared_memory', `Chave '${key}' desbloqueada por '${agentId}'`, agentId);
    return true;
  }

  // ==========================================
  // === PLUGIN MANAGER ===
  // ==========================================
  public async installPlugin(plugin: Omit<KernelPlugin, 'status' | 'timestamp'>): Promise<KernelPlugin> {
    const fullPlugin: KernelPlugin = {
      ...plugin,
      status: 'installed',
      timestamp: new Date().toISOString()
    };
    await Repository.saveKernelPlugin(fullPlugin);
    await this.logAudit('PluginInstalled', 'plugin', `Plugin '${plugin.name}' (ID: ${plugin.id}) instalado.`, 'System');
    await this.publishEvent('PluginInstalled', 'kernel', { pluginId: plugin.id, name: plugin.name });
    
    // Registra versão do plugin instalado
    await this.saveComponentVersion('plugin', plugin.id, plugin.version, 'Instalação inicial');
    return fullPlugin;
  }

  public async removePlugin(pluginId: string): Promise<boolean> {
    const plugins = await Repository.getKernelPlugins();
    const plugin = plugins.find(p => p.id === pluginId);
    if (!plugin) return false;

    plugin.status = 'inactive';
    plugin.timestamp = new Date().toISOString();
    await Repository.saveKernelPlugin(plugin);

    await this.logAudit('PluginRemoved', 'plugin', `Plugin '${plugin.name}' desativado/removido.`, 'System');
    await this.publishEvent('PluginRemoved', 'kernel', { pluginId });
    return true;
  }

  // ==========================================
  // === CONFIGURATION MANAGER ===
  // ==========================================
  public async getSystemConfig(configId: string = 'global_config'): Promise<KernelConfig> {
    const configs = await Repository.getKernelConfigs();
    let config = configs.find(c => c.id === configId);
    if (!config) {
      config = {
        id: configId,
        dataJson: {
          systemName: 'AI Business Factory',
          concurrencyLimit: 5,
          defaultTimeoutMs: 300000,
          maintenanceMode: false,
          retriesLimit: 3
        },
        version: 1,
        updatedAt: new Date().toISOString(),
        history: []
      };
      await Repository.saveKernelConfig(config);
    }
    return config;
  }

  public async updateSystemConfig(configId: string, newData: any, user: string = 'Admin'): Promise<KernelConfig> {
    const config = await this.getSystemConfig(configId);
    const oldData = { ...config.dataJson };
    
    config.history.push({
      version: config.version,
      dataJson: oldData,
      updatedBy: user,
      timestamp: config.updatedAt
    });

    config.dataJson = { ...config.dataJson, ...newData };
    config.version += 1;
    config.updatedAt = new Date().toISOString();

    await Repository.saveKernelConfig(config);
    await this.logAudit('ConfigUpdated', 'config', `Configuração '${configId}' atualizada para a versão ${config.version}`, user);
    return config;
  }

  // ==========================================
  // === SECRET MANAGER ===
  // ==========================================
  public async getSecretsMetadata(): Promise<KernelSecretMetadata[]> {
    const secrets = [
      { id: 'GEMINI_API_KEY', name: 'Gemini API Key', description: 'Chave do provedor de inteligência artificial do Google', isConfigured: process.env.GEMINI_API_KEY ? 1 : 0, updatedAt: new Date().toISOString() },
      { id: 'JWT_SECRET', name: 'JWT Secret Key', description: 'Segredo de cifragem para geração de tokens web de segurança', isConfigured: 1, updatedAt: new Date().toISOString() },
      { id: 'POSTGRES_URL', name: 'PostgreSQL Database Connection URL', description: 'String de conexão JDBC/Drizzle para banco relacional hospedado na nuvem', isConfigured: process.env.SQL_HOST ? 1 : 0, updatedAt: new Date().toISOString() }
    ];
    return secrets;
  }

  // ==========================================
  // === VERSION MANAGER ===
  // ==========================================
  public async getVersions(): Promise<KernelVersionRecord[]> {
    return await Repository.getKernelVersions();
  }

  public async saveComponentVersion(
    componentType: KernelVersionRecord['componentType'], 
    componentId: string, 
    version: string, 
    changeLog: string
  ): Promise<KernelVersionRecord> {
    const id = `ver-${componentType}-${componentId}`;
    const versions = await Repository.getKernelVersions();
    let record = versions.find(v => v.id === id);

    if (!record) {
      record = {
        id,
        componentType,
        componentId,
        version,
        history: [],
        timestamp: new Date().toISOString()
      };
    }

    record.history.push({
      version: record.version,
      changeLog,
      timestamp: record.timestamp
    });

    record.version = version;
    record.timestamp = new Date().toISOString();

    await Repository.saveKernelVersion(record);
    await this.logAudit('VersionUpdated', 'version', `Versão de ${componentType} '${componentId}' alterada para v${version}`, 'System');
    return record;
  }

  // ==========================================
  // === COMMUNICATION MANAGER ===
  // ==========================================
  public async logCommunication(
    source: string, 
    destination: string, 
    eventType: string, 
    durationMs: number, 
    result: 'success' | 'failed'
  ): Promise<void> {
    // Registra auditoria estruturada
    const details = `Comunicação de '${source}' para '${destination}' via evento '${eventType}'. Duração: ${durationMs}ms. Resultado: ${result}`;
    await this.logAudit('AgentCommunication', 'communication', details, source);
  }

  // ==========================================
  // === INICIALIZADORES AUXILIARES ===
  // ==========================================
  private async initDefaultServices(): Promise<void> {
    const services: Array<Omit<KernelService, 'lastCheck'>> = [
      { id: 'db', name: 'Banco de Dados (Postgres / JSON Fallback)', status: process.env.SQL_HOST ? 'running' : 'running', uptime: Math.floor(Date.now() / 1000) % 100000 },
      { id: 'scheduler', name: 'Schedules & Crons Engine', status: 'running', uptime: 2300 },
      { id: 'orchestrator', name: 'Agent Orchestration Controller', status: 'running', uptime: 2300 },
      { id: 'supervisor', name: 'Supervisor Heartbeat Monitor', status: 'running', uptime: 2300 },
      { id: 'repair', name: 'Self-Healing & Auto-Repair Agent Service', status: 'running', uptime: 2300 },
      { id: 'dashboard', name: 'Kernel Dashboard SPA', status: 'running', uptime: 2300 },
      { id: 'gemini', name: 'Gemini AI Integration Bridge', status: 'running', uptime: 2300 },
      { id: 'rest-apis', name: 'REST Gateway Service', status: 'running', uptime: 2300 },
      { id: 'workers', name: 'Background Thread Pool Workers', status: 'running', uptime: 2300 },
      { id: 'queues', name: 'Task Queues & Memory Buffers', status: 'running', uptime: 2300 }
    ];

    for (const srv of services) {
      await Repository.saveKernelService({
        ...srv,
        lastCheck: new Date().toISOString()
      });
    }
  }

  private async initDefaultAgents(): Promise<void> {
    const defaultAgents: Array<Omit<KernelAgentRegistry, 'timestamp' | 'heartbeat' | 'lastExecution' | 'lastUpdate'>> = [
      { id: 'ceo', name: 'CEO Agent', version: '1.0.0', status: 'idle', permissions: ['all'], capabilities: ['planning', 'coordinating'], dependencies: [], logicalConsumption: 12, averageTime: 450, priority: 5 },
      { id: 'research', name: 'Research Agent', version: '1.0.0', status: 'idle', permissions: ['read', 'write'], capabilities: ['niche_search', 'trends'], dependencies: [], logicalConsumption: 8, averageTime: 850, priority: 3 },
      { id: 'market_analyst', name: 'Market Analyst Agent', version: '1.0.0', status: 'idle', permissions: ['read'], capabilities: ['sentiment_analysis'], dependencies: ['research'], logicalConsumption: 7, averageTime: 620, priority: 3 },
      { id: 'product_creator', name: 'Product Creator Agent', version: '1.0.0', status: 'idle', permissions: ['read', 'write'], capabilities: ['product_design'], dependencies: ['market_analyst'], logicalConsumption: 10, averageTime: 920, priority: 4 },
      { id: 'writer', name: 'Writer Agent', version: '1.0.0', status: 'idle', permissions: ['write'], capabilities: ['content_writing'], dependencies: ['product_creator'], logicalConsumption: 9, averageTime: 1200, priority: 2 },
      { id: 'designer', name: 'Designer Agent', version: '1.0.0', status: 'idle', permissions: ['write'], capabilities: ['visual_assets'], dependencies: ['product_creator'], logicalConsumption: 14, averageTime: 1800, priority: 2 },
      { id: 'marketing', name: 'Marketing Agent', version: '1.0.0', status: 'idle', permissions: ['write'], capabilities: ['ad_copy', 'seo'], dependencies: ['product_creator'], logicalConsumption: 8, averageTime: 550, priority: 3 },
      { id: 'publisher', name: 'Publisher Agent', version: '1.0.0', status: 'idle', permissions: ['all'], capabilities: ['deploy_sales_page'], dependencies: ['writer', 'designer'], logicalConsumption: 11, averageTime: 1400, priority: 4 },
      { id: 'finance', name: 'Finance Agent', version: '1.0.0', status: 'idle', permissions: ['all'], capabilities: ['ledger', 'forecasting'], dependencies: [], logicalConsumption: 6, averageTime: 380, priority: 5 },
      { id: 'supervisor', name: 'Supervisor Agent', version: '1.0.0', status: 'idle', permissions: ['all'], capabilities: ['heartbeat_check', 'telemetry'], dependencies: [], logicalConsumption: 5, averageTime: 200, priority: 5 },
      { id: 'repair', name: 'Repair Agent', version: '1.0.0', status: 'idle', permissions: ['all'], capabilities: ['self_healing', 'diagnostics'], dependencies: ['supervisor'], logicalConsumption: 15, averageTime: 1100, priority: 5 }
    ];

    const existingRegistries = await Repository.getKernelAgentRegistries();
    for (const agent of defaultAgents) {
      const exists = existingRegistries.some(a => a.id === agent.id);
      if (!exists) {
        await Repository.saveKernelAgentRegistry({
          ...agent,
          heartbeat: new Date().toISOString(),
          lastExecution: new Date().toISOString(),
          lastUpdate: new Date().toISOString(),
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  private async initDefaultSecrets(): Promise<void> {
    await this.getSecretsMetadata();
  }

  private async initDefaultVersions(): Promise<void> {
    const versions = await Repository.getKernelVersions();
    if (versions.length === 0) {
      await this.saveComponentVersion('kernel', 'core', '1.0.0', 'Kernel Base AI Business Factory');
    }
  }

  private async initDefaultConfigs(): Promise<void> {
    await this.getSystemConfig();
  }

  private async updateMetrics(): Promise<KernelMetrics> {
    const events = await Repository.getKernelEvents();
    const agents = await Repository.getKernelAgentRegistries();
    const plugins = await Repository.getKernelPlugins();
    const memories = await Repository.getKernelSharedMemories();

    const activeAgents = agents.filter(a => a.status !== 'offline').length;
    const activePlugins = plugins.filter(p => p.status === 'active').length;

    const metrics: KernelMetrics = {
      id: 'kernel_metrics_latest',
      totalEventsProcessed: events.length,
      activeAgentsCount: activeAgents,
      activePluginsCount: activePlugins,
      sharedMemoryKeysCount: memories.length,
      systemUptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      averageCommunicationTimeMs: 14.5, // tempo lógico médio do event bus
      timestamp: new Date().toISOString()
    };

    await Repository.saveKernelMetrics(metrics);
    
    // Atualiza também a tabela de saúde consolidada
    const health: KernelHealth = {
      id: 'kernel_health_latest',
      status: 'healthy',
      databaseStatus: 'healthy',
      eventBusStatus: 'healthy',
      schedulerStatus: 'healthy',
      timestamp: new Date().toISOString()
    };
    await Repository.saveKernelHealth(health);

    return metrics;
  }
}
