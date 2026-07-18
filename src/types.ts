export type AgentStatus = 'idle' | 'running' | 'paused' | 'error';

export type AgentId = string;

export interface AgentInfo {
  id: AgentId;
  name: string;
  role: string;
  status: AgentStatus;
  executionTime: number; // in seconds
  efficiency: number; // percentage
  currentTask?: string;
  description: string;
}

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface Task {
  id: string;
  agentId: AgentId;
  productId?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  executionTime: number; // in seconds
  result?: string;
  logs: string[];
  timestamp: string;
}

export interface DigitalProduct {
  id: string;
  name: string;
  category: string;
  niche: string;
  price: number;
  revenue: number;
  status: 'draft' | 'published';
  description: string;
  content: string;
  marketingPlan?: string;
  salesPage?: string;
  designerAssets?: string[];
  financialProjection?: string;
  publicationLogs: string[];
  checkoutUrl?: string;
  paymentProvider?: string;
  timestamp: string;

  // PRODUCT CREATOR PROPERTIES (ETAPA 7)
  subtitle?: string;
  mainPromise?: string;
  problemSolved?: string;
  targetAudience?: string;
  persona?: string;
  format?: string;
  indexTableOfContents?: string;
  modules?: any[];
  chapters?: any[];
  differentiation?: string;
  positioningStrategy?: string;
  productionPlan?: string;
  briefing?: string;
  version?: string;
  productionStatus?: 'concept' | 'approved_production' | 'completed';
}

export interface SystemMetrics {
  activeAgentsCount: number;
  runningAgentsCount: number;
  productsCreatedCount: number;
  productsPublishedCount: number;
  totalRevenue: number;
  totalProfit: number;
}

export interface SystemState {
  metrics: SystemMetrics;
  agents: AgentInfo[];
  tasks: Task[];
  products: DigitalProduct[];
  isFactoryRunning: boolean;
  ceoConfig?: CEOConfig;
  ceoDecisions?: CEODecision[];
  ceoPlans?: CEOPlan[];
  ceoReports?: CEOReport[];
  researchSearches?: ResearchSearch[];
  researchTrends?: ResearchTrend[];
  researchNiches?: ResearchNiche[];
  researchOpportunities?: ResearchOpportunity[];
  researchReports?: ResearchReport[];
  marketAnalyses?: MarketAnalysis[];
  generatedContents?: GeneratedContent[];
  designProjects?: DesignProject[];
  marketingCampaigns?: MarketingCampaign[];
  publications?: Publication[];
  financialTransactions?: FinancialTransaction[];
  revenues?: Revenue[];
  expenses?: Expense[];
  cashflow?: CashFlow[];
  financialReports?: FinancialReport[];
  financialForecasts?: FinancialForecast[];
  profitAnalysis?: ProfitAnalysis[];
  roiHistory?: RoiHistory[];
  campaignResults?: CampaignResult[];
  customerMetrics?: CustomerMetrics[];
  agentHealths?: AgentHealth[];
  agentMetricsList?: AgentMetrics[];
  agentHeartbeatsList?: AgentHeartbeatRecord[];
  workflowHistoryList?: WorkflowHistoryRecord[];
  systemAlertsList?: SystemAlert[];
  operationLogsList?: OperationLog[];
  systemMetricsList?: SystemHealthMetrics[];
  performanceHistoryList?: PerformanceHistoryRecord[];
  repairIssues?: RepairIssue[];
  repairHistory?: RepairHistory[];
  repairReports?: RepairReport[];
  repairTests?: RepairTest[];
  repairActions?: RepairAction[];
  repairSnapshots?: RepairSnapshot[];
  repairRollbacks?: RepairRollback[];
  repairKnowledge?: RepairKnowledge[];
  repairStatistics?: RepairStatistics[];
  repairDiagnostics?: RepairDiagnostic[];
  kernelRegistry?: KernelAgentRegistry[];
  kernelEvents?: KernelEvent[];
  kernelPlugins?: KernelPlugin[];
  kernelServices?: KernelService[];
  kernelVersions?: KernelVersionRecord[];
  kernelConfigs?: KernelConfig[];
  kernelSharedMemory?: KernelSharedMemory[];
  kernelAudit?: KernelAuditLog[];
  kernelMetrics?: KernelMetrics[];
  kernelHealth?: KernelHealth[];
  integrationConnectors?: IntegrationConnector[];
  integrationJobs?: IntegrationJob[];
  integrationLogs?: IntegrationLog[];
  integrationTokens?: IntegrationToken[];
  integrationWebhooks?: IntegrationWebhook[];
  integrationFiles?: IntegrationFile[];
  integrationSync?: IntegrationSync[];
  integrationMetrics?: IntegrationMetrics[];
  integrationErrors?: IntegrationError[];
  integrationHistory?: IntegrationHistory[];
  paymentConnections?: PaymentConnection[];
  paymentTransactions?: PaymentTransaction[];
  digitalSales?: DigitalSale[];
  platformConnections?: PlatformConnection[];
  customers?: Customer[];
  launches?: Launch[];
  campaigns?: LaunchCampaign[];
  emailSequences?: EmailSequence[];
  marketingEvents?: MarketingEvent[];
  connections?: any[];
  connectionLogs?: any[];
  syncHistory?: any[];
}

export interface Launch {
  id: string;
  productId: string;
  name: string;
  strategy: string;
  audience: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: 'draft' | 'planning' | 'pre_launch' | 'launching' | 'scaling' | 'paused' | 'finished';
  createdAt: string;
  
  // Strategic Plan details generated by IA
  campaignName?: string;
  goal?: string;
  mainOffer?: string;
  suggestedPrice?: number;
  bonus?: string;
  mainMessage?: string;
  
  // Channels
  instagramChannel?: string;
  facebookChannel?: string;
  googleChannel?: string;
  emailChannel?: string;
  whatsAppChannel?: string;
  
  // Timeline phases
  timelinePreLaunch?: string;
  timelineWarmup?: string;
  timelineOpen?: string;
  timelineSales?: string;
  timelinePostSales?: string;
  recommendations?: string;
}

export interface LaunchCampaign {
  id: string;
  launchId: string;
  name: string;
  platform: 'instagram' | 'facebook' | 'google' | 'email' | 'whatsapp';
  status: string; // 'draft', 'active', 'paused', 'completed'
  budget: number;
  spent: number;
  clicks: number;
  conversions: number;
  revenue: number;
  adCopy?: string;
  creativeUrl?: string;
  createdAt: string;
}

export interface EmailSequence {
  id: string;
  launchId: string;
  name: string;
  triggerEvent: string; // 'welcome', 'purchase', 'follow_up', 'campaign_broadcast'
  subject: string;
  body: string;
  sentCount: number;
  openRate: number;
  clickRate: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface MarketingEvent {
  id: string;
  launchId: string;
  eventType: 'email_sent' | 'ad_created' | 'sale_registered' | 'whatsapp_sent' | 'performance_alert' | 'error_logged';
  title: string;
  description: string;
  channel?: string;
  status: 'success' | 'failed' | 'warning';
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  purchases: number;
  totalSpent: number;
  lastPurchase: string;
  createdAt: string;
}

export interface MarketingCampaign {
  id: string;
  productId: string;
  productName: string;
  title: string;

  // Estratégia de Posicionamento e Persona
  persona: {
    name: string;
    painPoint: string;
    mainDesire: string;
    uvp: string;
    competitiveAdvantage: string;
  };
  positioning: string;

  // Copywriting e Mensagens de Venda
  copywriting: {
    headlines: string[];
    subheadlines: string[];
    sellingArguments: string[];
    benefits: string[];
    ctas: string[];
  };

  // Estrutura de Página de Vendas
  salesPage: {
    title: string;
    problem: string;
    soluton?: string; // fallback in case of typo, but let's make it robust
    solution: string;
    benefits: string;
    proof: string;
    offer: string;
    guarantee: string;
    cta: string;
  };

  // Redes Sociais e Calendário
  socialMedia: {
    posts: {
      title: string;
      caption: string;
      ideas: string;
    }[];
    calendar: {
      day: string;
      topic: string;
      channel: string;
    }[];
    videoIdeas: string[];
  };

  // Campanhas de Anúncios Pagos (Ads)
  campaignAds: {
    adStrategy: string;
    targetAudiences: string[];
    requiredCreatives: string[];
    abTests: string;
  };

  version: string;
  status: 'draft' | 'reviewed' | 'approved';

  // Sistema de Pontuação de Estratégia
  qualityScore?: number;
  offerClarityScore?: number;
  conversionPowerScore?: number;
  audienceFitScore?: number;
  differentiationScore?: number;
  scalePotentialScore?: number;
  feedback?: string;

  timestamp: string;
  createdAt?: string;
}

export interface DesignProject {
  id: string;
  productId: string;
  productName: string;
  contentId?: string;
  title: string;
  visualIdentity: string;
  styleChoice: string;
  imageBriefing: string;
  coverLayout: string;
  marketingAssets: any[];
  version: string;
  status: 'draft' | 'reviewed' | 'approved';

  // Avaliação Estética
  qualityScore?: number;
  aestheticScore?: number;
  clarityScore?: number;
  audienceFitScore?: number;
  commercialAppealScore?: number;
  differentiationScore?: number;
  feedback?: string;

  // Ativos visuais planejados/gerados
  generatedAssets?: {
    type: string; // 'cover', 'mockup', 'banner', 'ad', 'slide', 'thumbnail'
    title: string;
    description: string;
    imageUrl?: string;
  }[];

  timestamp: string;
  createdAt?: string;
}

export interface GeneratedContent {
  id: string;
  productId: string;
  productName: string;
  contentType: string; // 'ebook', 'chapter', 'course', 'lesson', 'script', 'checklist', 'guide', 'exercise', 'bonus'
  title: string;
  body: string;
  outline?: string; // planejamento do conteúdo
  version: string; // e.g. '1.0.0'
  status: 'draft' | 'reviewed' | 'approved';
  
  // Avaliação automática (Controle de qualidade)
  qualityScore?: number; // nota final de qualidade
  clarityScore?: number;
  depthScore?: number;
  organizationScore?: number;
  valueDeliveredScore?: number;
  audienceFitScore?: number;
  originalityScore?: number;
  feedback?: string;

  // Revisões, capítulos, etc
  revisions?: any[]; // array de histórico de revisões
  chaptersCount?: number;
  timestamp: string;
  createdAt?: string;
}

export interface MarketAnalysis {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  niche: string;
  demandScore: number;
  urgencyScore: number;
  buyingPowerScore: number;
  competitionScore: number;
  differentiationScore: number;
  creationEaseScore: number;
  scalingPotentialScore: number;
  profitMarginScore: number;
  finalScore: number;
  targetAudience: string;
  estimatedPrice: number;
  financialViability: string;
  expertOpinion: string;
  recommendations: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
}

export interface ResearchSearch {
  id: string;
  query: string;
  resultsCount: number;
  results: string;
  timestamp: string;
}

export interface ResearchTrend {
  id: string;
  topic: string;
  growthRate: string;
  source: string;
  volume: string;
  niche: string;
  timestamp: string;
}

export interface ResearchNiche {
  id: string;
  name: string;
  description: string;
  audienceSize: string;
  monetizationScore: number;
  competitiveness: 'low' | 'medium' | 'high';
  timestamp: string;
}

export interface ResearchOpportunity {
  id: string;
  title: string;
  niche: string;
  description: string;
  painPoint: string;
  differentiation: string;
  demandScore: number;
  financialScore: number;
  competitionScore: number;
  creationEaseScore: number;
  launchSpeedScore: number;
  finalScore: number;
  status: 'pending' | 'approved' | 'rejected' | 'productized';
  timestamp: string;
}

export interface ResearchReport {
  id: string;
  title: string;
  content: string;
  recommendations: string;
  timestamp: string;
}

export interface CEOConfig {
  id: string; // 'default'
  focus: 'premium' | 'fast_track' | 'agile';
  autoStart: boolean;
  temperature: number;
  systemPrompt: string;
  updatedAt: string;
}

export interface CEODecision {
  id: string;
  objective: string;
  decisionType: 'plan_creation' | 'task_approval' | 'revision_request' | 'general';
  actionTaken: string;
  reasoning: string;
  timestamp: string;
}

export interface CEOPlanStep {
  agentId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

export interface CEOPlan {
  id: string;
  productId?: string;
  objective: string;
  targetAudience: string;
  steps: CEOPlanStep[];
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
}

export interface CEOReport {
  id: string;
  productId?: string;
  title: string;
  content: string;
  recommendations?: string;
  createdAt: string;
}

export interface Publication {
  id: string;
  productId: string;
  productName: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  files: string[];
  salesPageUrl: string;
  termsAndConditions: string;
  status: 'pending' | 'checking' | 'ready' | 'approved' | 'published' | 'failed';
  version: string;
  platforms: {
    hotmart?: boolean;
    kiwify?: boolean;
    monetizze?: boolean;
    customStore?: boolean;
    externalApi?: boolean;
    [key: string]: boolean | undefined;
  };
  checklist: {
    filesVerified: boolean;
    commercialOk: boolean;
    termsAccepted: boolean;
    metadataComplete: boolean;
    marketingApproved: boolean;
    itemsChecked: string[];
  };
  history: {
    action: string;
    actor: string;
    timestamp: string;
    details?: string;
  }[];
  timestamp: string;
  createdAt?: string;
}

export interface FinancialTransaction {
  id: string;
  type: 'revenue' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  productId?: string;
  campaignId?: string;
  timestamp: string;
}

export interface Revenue {
  id: string;
  productId?: string;
  amount: number;
  paymentMethod: 'pix' | 'credit_card' | 'boleto';
  status: 'completed' | 'pending' | 'refunded';
  customerEmail: string;
  date: string;
  timestamp: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: 'ads' | 'servers' | 'commissions' | 'salaries' | 'other';
  description: string;
  date: string;
  status: 'paid' | 'pending';
  timestamp: string;
}

export interface CashFlow {
  id: string;
  date: string;
  inflow: number;
  outflow: number;
  balance: number;
  timestamp: string;
}

export interface FinancialReport {
  id: string;
  title: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  margin: number;
  insights: string;
  timestamp: string;
}

export interface FinancialForecast {
  id: string;
  title: string;
  period: 'next_month' | 'next_quarter' | 'next_year';
  predictedRevenue: number;
  confidence: number;
  insights: string;
  suggestions: string;
  timestamp: string;
}

export interface ProfitAnalysis {
  id: string;
  productId: string;
  productName: string;
  revenue: number;
  cost: number;
  netProfit: number;
  margin: number;
  timestamp: string;
}

export interface RoiHistory {
  id: string;
  campaignId: string;
  campaignName: string;
  investment: number;
  revenue: number;
  roi: number;
  timestamp: string;
}

export interface CampaignResult {
  id: string;
  campaignId: string;
  campaignName: string;
  leads: number;
  sales: number;
  conversionRate: number;
  revenue: number;
  spend: number;
  roi: number;
  timestamp: string;
}

export interface CustomerMetrics {
  id: string;
  cac: number;
  ltv: number;
  averageTicket: number;
  conversionRate: number;
  activeCustomers: number;
  timestamp: string;
}

// ==========================================
// === INTERFACES DO SUPERVISOR AGENT ===
// ==========================================

export interface AgentHealth {
  id: string;
  status: 'idle' | 'running' | 'paused' | 'error' | 'offline';
  lastHeartbeat: string;
  uptime: number;
  downtime: number;
  currentWorkflowId?: string;
  timestamp: string;
}

export interface AgentMetrics {
  id: string;
  agentId: string;
  logicalCpu: number;
  logicalMemory: number;
  tasksExecuted: number;
  tasksFailed: number;
  averageExecutionTime: number;
  taskQueueCount: number;
  timestamp: string;
}

export interface AgentHeartbeatRecord {
  id: string;
  agentId: string;
  status: string;
  currentTask?: string;
  cpuUsage: number;
  memoryUsage: number;
  timestamp: string;
}

export interface WorkflowHistoryRecord {
  id: string;
  name: string;
  status: string;
  currentStep: string;
  stepsJson: any[];
  timestamp: string;
}

export interface SystemAlert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  reason: string;
  origin: string;
  agentId?: string;
  timestamp: string;
  actionSuggested: string;
  repaired: number; // 0 = no, 1 = yes
}

export interface OperationLog {
  id: string;
  action: string;
  agentId?: string;
  details: string;
  user: string;
  timestamp: string;
}

export interface SystemHealthMetrics {
  id: string;
  cpuUsage: number;
  memoryUsage: number;
  postgresStatus: string;
  geminiApiStatus: string;
  serverStatus: string;
  restApiStatus: string;
  dashboardStatus: string;
  timestamp: string;
}

export interface PerformanceHistoryRecord {
  id: string;
  label: string;
  overallEfficiency: number;
  totalActiveAgents: number;
  totalTasksPending: number;
  totalTasksCompleted: number;
  totalTasksFailed: number;
  timestamp: string;
}

export interface RepairIssue {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  status: 'active' | 'investigating' | 'testing' | 'repairing' | 'resolved' | 'failed';
  source: string;
  rootCause?: string;
  recurrenceCount: number;
  timestamp: string;
}

export interface RepairHistory {
  id: string;
  issueId?: string;
  action: string;
  result: 'success' | 'failed';
  durationMs: number;
  operator: 'RepairAgent' | 'Admin';
  details: string;
  timestamp: string;
}

export interface RepairReport {
  id: string;
  type: 'technical' | 'executive' | 'failures' | 'performance' | 'corrections' | 'availability' | 'stability';
  title: string;
  content: string;
  data: any;
  generatedBy: string;
  timestamp: string;
}

export interface RepairTest {
  id: string;
  testType: 'unit' | 'integration' | 'api' | 'db' | 'agent' | 'dashboard' | 'scheduler' | 'workflow' | 'performance' | 'communication' | 'postgres' | 'gemini';
  name: string;
  status: 'passed' | 'failed' | 'running';
  errorDetails?: string;
  durationMs: number;
  timestamp: string;
}

export interface RepairAction {
  id: string;
  name: string;
  description: string;
  isPermitted: number; // 0 or 1
  executedAt: string;
  resultStatus: string; // 'success', 'failed'
  errorLog?: string;
}

export interface RepairSnapshot {
  id: string;
  description: string;
  stateBackup: any;
  sizeBytes: number;
  timestamp: string;
}

export interface RepairRollback {
  id: string;
  snapshotId: string;
  reason: string;
  executedBy: string;
  status: 'completed' | 'failed';
  timestamp: string;
}

export interface RepairKnowledge {
  id: string;
  problem: string;
  cause: string;
  correction: string;
  result: string;
  resolutionTimeMs: number;
  recurrenceCount: number;
  successRatePct: number;
  futureRecommendation: string;
  timestamp: string;
}

export interface RepairStatistics {
  id: string;
  meanTimeToResolutionMs: number;
  systemAvailabilityPct: number;
  successRatePct: number;
  activeIssuesCount: number;
  totalIssuesCount: number;
  totalRepairsCount: number;
  timestamp: string;
}

export interface RepairDiagnostic {
  id: string;
  targetComponent: string;
  diagnosticType: string;
  logAnalysisSummary: string;
  memoryLeakDetected: number; // 0 or 1
  loopDetected: number; // 0 or 1
  blockedQueueDetected: number; // 0 or 1
  slowApisDetected: number; // 0 or 1
  timestamp: string;
}

// ==========================================
// === INTERFACES DO KERNEL DO SISTEMA ===
// ==========================================

export interface KernelAgentRegistry {
  id: string;
  name: string;
  version: string;
  status: 'idle' | 'running' | 'paused' | 'error' | 'offline';
  permissions: string[]; // JSON array strings
  capabilities: string[]; // JSON array strings
  dependencies: string[]; // JSON array strings
  heartbeat: string;
  lastExecution: string;
  lastUpdate: string;
  logicalConsumption: number; // e.g. logical unit tokens/cpu %
  averageTime: number; // ms
  priority: number; // priority level 1-5
  timestamp: string;
}

export interface KernelEvent {
  id: string;
  eventType: 
    | 'AgentStarted' | 'AgentStopped' | 'AgentRestarted'
    | 'TaskCreated' | 'TaskCompleted' | 'TaskFailed' | 'TaskCancelled'
    | 'WorkflowStarted' | 'WorkflowCompleted' | 'WorkflowFailed'
    | 'AlertCreated' | 'RepairRequested' | 'RepairCompleted'
    | 'FinanceUpdated' | 'MarketingCompleted' | 'PublicationCompleted'
    | 'KernelStarted' | 'KernelStopped'
    | 'PluginInstalled' | 'PluginRemoved'
    | 'IntegrationConnected' | 'IntegrationDisconnected'
    | 'ProductPublished' | 'ProductAvailableForSale' | 'CustomerPurchased' | 'RevenueReceived'
    | 'PRODUCT_READY_FOR_PUBLICATION' | 'PRODUCT_LAUNCH_READY';
  source: string;
  payload: any; // JSON object or string
  timestamp: string;
}

export interface KernelSharedMemory {
  key: string;
  value: any; // JSON object or string
  version: number;
  expiration?: string; // ISO date string
  accessControl: string[]; // Allowed agent IDs
  isLocked: number; // 0 = false, 1 = true
  lockedBy?: string; // Agent ID that locked it
  lastUpdatedBy: string; // Agent ID or User
  timestamp: string;
}

export interface KernelPlugin {
  id: string;
  name: string;
  version: string;
  manifest: any; // JSON string/object
  dependencies: string[];
  permissions: string[];
  events: string[];
  routes: string[];
  panels: string[];
  capabilities: string[];
  status: 'installed' | 'active' | 'inactive';
  timestamp: string;
}

export interface KernelService {
  id: string; // 'db' | 'scheduler' | 'orchestrator' | 'supervisor' | 'repair' | 'dashboard' | 'gemini' | 'rest-apis' | 'workers' | 'queues'
  name: string;
  status: 'running' | 'stopped' | 'error';
  uptime: number; // seconds
  lastCheck: string;
  message?: string;
}

export interface KernelConfig {
  id: string;
  dataJson: any; // serialized custom configs
  version: number;
  updatedAt: string;
  history: any[]; // list of previous changes
}

export interface KernelSecretMetadata {
  id: string; // e.g. 'GEMINI_API_KEY'
  name: string;
  description: string;
  isConfigured: number; // 0 or 1
  updatedAt: string;
}

export interface KernelVersionRecord {
  id: string;
  componentType: 'agent' | 'plugin' | 'integration' | 'kernel';
  componentId: string;
  version: string;
  history: any[];
  timestamp: string;
}

export interface KernelTask {
  id: string;
  name: string;
  priority: number; // 1-5
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  dependencies: string[]; // task IDs
  retries: number;
  maxRetries: number;
  timeoutMs: number;
  escalated: number; // 0 or 1
  timestamp: string;
}

export interface KernelCommunicationLog {
  id: string;
  source: string;
  destination: string;
  eventType: string;
  durationMs: number;
  result: 'success' | 'failed';
  timestamp: string;
}

export interface KernelAuditLog {
  id: string;
  action: string;
  category: string; // 'registry' | 'event' | 'plugin' | 'shared_memory' | 'config' | 'secret' | 'version' | 'task' | 'service'
  details: string;
  user: string;
  timestamp: string;
}

export interface KernelMetrics {
  id: string;
  totalEventsProcessed: number;
  activeAgentsCount: number;
  activePluginsCount: number;
  sharedMemoryKeysCount: number;
  systemUptimeSeconds: number;
  averageCommunicationTimeMs: number;
  timestamp: string;
}

export interface KernelHealth {
  id: string;
  status: 'healthy' | 'warning' | 'critical';
  databaseStatus: 'healthy' | 'unhealthy';
  eventBusStatus: 'healthy' | 'unhealthy';
  schedulerStatus: 'healthy' | 'unhealthy';
  timestamp: string;
}

// ==========================================
// === INTERFACES DO AGENTE DE INTEGRAÇÃO ===
// ==========================================

export interface IntegrationConnector {
  id: string;
  name: string;
  category: string;
  status: 'connected' | 'disconnected' | 'authenticating' | 'error' | 'expired' | 'reconnecting' | 'blocked';
  configJson: any;
  lastSyncedAt: string | null;
  latencyMs: number;
  createdAt: string | Date;
}

export interface IntegrationJob {
  id: string;
  connectorId: string;
  type: 'sync' | 'upload' | 'download' | 'publish' | 'import' | 'export';
  status: 'pending' | 'running' | 'completed' | 'failed';
  payloadJson: any;
  resultJson: any;
  error: string | null;
  attempts: number;
  maxAttempts: number;
  timeoutMs: number;
  createdAt: string | Date;
}

export interface IntegrationLog {
  id: string;
  connectorId: string;
  type: 'info' | 'warn' | 'error' | 'success';
  direction: 'inbound' | 'outbound';
  url: string | null;
  method: string | null;
  statusCode: number | null;
  requestHeaders: any;
  requestBody: string | null;
  responseHeaders: any;
  responseBody: string | null;
  latencyMs: number;
  timestamp: string;
  createdAt: string | Date;
}

export interface IntegrationToken {
  id: string;
  connectorId: string;
  tokenType: 'oauth2' | 'apikey' | 'jwt' | 'bearer' | 'basic';
  accessTokenEncrypted: string | null;
  refreshTokenEncrypted: string | null;
  clientSecretEncrypted: string | null;
  expiresAt: string | null;
  endpoint: string | null;
  metadataJson: any;
  createdAt: string | Date;
}

export interface IntegrationWebhook {
  id: string;
  connectorId: string;
  name: string;
  url: string;
  secretEncrypted: string | null;
  status: 'active' | 'inactive';
  processedEventsCount: number;
  lastEventReceivedAt: string | null;
  createdAt: string | Date;
}

export interface IntegrationFile {
  id: string;
  name: string;
  connectorId: string;
  sizeBytes: number;
  mimeType: string;
  storagePath: string;
  version: number;
  hash: string;
  status: 'uploaded' | 'downloaded' | 'processing' | 'failed';
  createdAt: string | Date;
}

export interface IntegrationSync {
  id: string;
  connectorId: string;
  entityName: string;
  itemsSynced: number;
  lastAnchor: string | null;
  status: 'success' | 'failed' | 'running';
  durationMs: number;
  createdAt: string | Date;
}

export interface IntegrationMetrics {
  id: string;
  connectorId: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatencyMs: number;
  totalBytesTransferred: number;
  timestamp: string;
  createdAt: string | Date;
}

export interface IntegrationError {
  id: string;
  connectorId: string;
  errorCode: string;
  errorMessage: string;
  stackTrace: string | null;
  resolved: number; // 0: unresolved, 1: resolved
  resolvedAt: string | null;
  createdAt: string | Date;
}

export interface IntegrationHistory {
  id: string;
  connectorId: string;
  eventType: string;
  description: string;
  author: string;
  timestamp: string;
  createdAt: string | Date;
}

export interface PaymentConnection {
  id: string;
  provider: string; // 'mercado_pago'
  status: 'connected' | 'disconnected' | 'authenticating' | 'error' | 'testing';
  encryptedCredentials: string | null;
  lastSync: string | null;
  createdAt: string | Date;
}

export interface PaymentTransaction {
  id: string;
  provider: string; // 'mercado_pago'
  externalId: string;
  productId: string | null;
  amount: number;
  currency: string;
  status: 'approved' | 'pending' | 'rejected' | 'refunded' | 'cancelled';
  customerReference: string;
  createdAt: string | Date;
}

export interface DigitalSale {
  id: string;
  provider: string; // 'hotmart'
  externalId: string;
  productId: string | null;
  amount: number;
  commission: number;
  status: 'approved' | 'complete' | 'refunded' | 'canceled';
  buyerReference: string;
  createdAt: string | Date;
}

export interface PlatformConnection {
  id: string;
  provider: string; // 'hotmart'
  status: 'connected' | 'disconnected' | 'authenticating' | 'error' | 'testing';
  encryptedCredentials: string | null;
  lastSync: string | null;
  createdAt: string | Date;
}




