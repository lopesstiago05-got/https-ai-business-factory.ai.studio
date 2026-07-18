import { pgTable, text, timestamp, integer, doublePrecision, uuid, jsonb } from 'drizzle-orm/pg-core';

// Tabela de Usuários para Autenticação e Permissões
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Suporta ID aleatório texto ou Firebase Auth UID
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'), // Opcional para logins via provedores como Firebase Auth
  role: text('role').default('user').notNull(), // 'admin', 'developer', 'user'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tabela de Agentes de IA
export const agents = pgTable('agents', {
  id: text('id').primaryKey(), // e.g. 'ceo', 'research', etc.
  name: text('name').notNull(),
  role: text('role').notNull(),
  status: text('status').default('idle').notNull(), // 'idle', 'running', 'paused', 'error'
  executionTime: integer('execution_time').default(0).notNull(), // em segundos
  efficiency: integer('efficiency').default(90).notNull(), // percentual
  currentTask: text('current_task'),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tabela de Produtos Digitais Criados
export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  niche: text('niche').notNull(),
  price: doublePrecision('price').default(0).notNull(),
  revenue: doublePrecision('revenue').default(0).notNull(),
  status: text('status').default('draft').notNull(), // 'draft', 'published'
  description: text('description').notNull(),
  content: text('content').default('').notNull(),
  salesPage: text('sales_page'),
  designerAssets: jsonb('designer_assets').default([]).notNull(), // URLs ou prompts de imagens
  financialProjection: text('financial_projection'),
  publicationLogs: jsonb('publication_logs').default([]).notNull(),
  checkoutUrl: text('checkout_url'),
  paymentProvider: text('payment_provider'),
  createdAt: timestamp('created_at').defaultNow().notNull(),

  // PRODUCT CREATOR EXTRA PERSISTENCE (ETAPA 7)
  subtitle: text('subtitle'),
  mainPromise: text('main_promise'),
  problemSolved: text('problem_solved'),
  targetAudience: text('target_audience'),
  persona: text('persona'),
  format: text('format'),
  indexTableOfContents: text('index_table_of_contents'),
  modules: jsonb('modules').default([]),
  chapters: jsonb('chapters').default([]),
  differentiation: text('differentiation'),
  positioningStrategy: text('positioning_strategy'),
  productionPlan: text('production_plan'),
  briefing: text('briefing'),
  version: text('version').default('1.0.0'),
  productionStatus: text('production_status').default('concept').notNull(), // 'concept', 'approved_production', 'completed'
});

// Tabela de Fila de Tarefas / Pipeline de Execução
export const tasks = pgTable('tasks', {
  id: text('id').primaryKey(),
  agentId: text('agent_id').notNull(),
  productId: text('product_id').references(() => products.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  status: text('status').default('pending').notNull(), // 'pending', 'running', 'completed', 'failed', 'cancelled'
  priority: text('priority').default('medium').notNull(), // 'low', 'medium', 'high'
  executionTime: integer('execution_time').default(0).notNull(), // em segundos
  result: text('result'),
  logs: jsonb('logs').default([]).notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tabela de Logs Gerais do Sistema
export const systemLogs = pgTable('system_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  level: text('level').notNull(), // 'info', 'warn', 'error'
  agentId: text('agent_id'),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tabela de Configurações do CEO Agent
export const ceoConfigs = pgTable('ceo_configs', {
  id: text('id').primaryKey(), // 'default'
  focus: text('focus').notNull(), // 'premium', 'fast_track', 'agile'
  autoStart: integer('auto_start').default(0).notNull(), // 0 = false, 1 = true
  temperature: doublePrecision('temperature').default(0.7).notNull(),
  systemPrompt: text('system_prompt').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de Histórico de Decisões do CEO
export const ceoDecisions = pgTable('ceo_decisions', {
  id: text('id').primaryKey(),
  objective: text('objective').notNull(),
  decisionType: text('decision_type').notNull(), // 'plan_creation', 'task_approval', 'revision_request'
  actionTaken: text('action_taken').notNull(),
  reasoning: text('reasoning').notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tabela de Planos de Negócios criados pelo CEO
export const ceoPlans = pgTable('ceo_plans', {
  id: text('id').primaryKey(),
  productId: text('product_id'),
  objective: text('objective').notNull(),
  targetAudience: text('target_audience').notNull(),
  steps: jsonb('steps').default([]).notNull(), // array de passos/tarefas do plano
  status: text('status').default('active').notNull(), // 'active', 'completed', 'archived'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tabela de Relatórios Executivos gerados pelo CEO
export const ceoReports = pgTable('ceo_reports', {
  id: text('id').primaryKey(),
  productId: text('product_id'),
  title: text('title').notNull(),
  content: text('content').notNull(),
  recommendations: text('recommendations'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tabela de Pesquisas do Research Agent
export const researchSearches = pgTable('research_searches', {
  id: text('id').primaryKey(),
  query: text('query').notNull(),
  resultsCount: integer('results_count').notNull(),
  results: text('results').notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tabela de Tendências do Research Agent
export const researchTrends = pgTable('research_trends', {
  id: text('id').primaryKey(),
  topic: text('topic').notNull(),
  growthRate: text('growth_rate').notNull(),
  source: text('source').notNull(),
  volume: text('volume').notNull(),
  niche: text('niche').notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tabela de Nichos do Research Agent
export const researchNiches = pgTable('research_niches', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  audienceSize: text('audience_size').notNull(),
  monetizationScore: integer('monetization_score').notNull(),
  competitiveness: text('competitiveness').notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tabela de Oportunidades do Research Agent
export const researchOpportunities = pgTable('research_opportunities', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  niche: text('niche').notNull(),
  description: text('description').notNull(),
  painPoint: text('pain_point').notNull(),
  differentiation: text('differentiation').notNull(),
  demandScore: integer('demand_score').notNull(),
  financialScore: integer('financial_score').notNull(),
  competitionScore: integer('competition_score').notNull(),
  creationEaseScore: integer('creation_ease_score').notNull(),
  launchSpeedScore: integer('launch_speed_score').notNull(),
  finalScore: doublePrecision('final_score').notNull(),
  status: text('status').default('pending').notNull(), // 'pending', 'approved', 'rejected', 'productized'
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tabela de Relatórios do Research Agent
export const researchReports = pgTable('research_reports', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  recommendations: text('recommendations').notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tabela de Análises de Mercado do Market Analyst Agent
export const marketAnalyses = pgTable('market_analyses', {
  id: text('id').primaryKey(),
  opportunityId: text('opportunity_id').references(() => researchOpportunities.id, { onDelete: 'cascade' }),
  opportunityTitle: text('opportunity_title').notNull(),
  niche: text('niche').notNull(),
  demandScore: integer('demand_score').notNull(),
  urgencyScore: integer('urgency_score').notNull(),
  buyingPowerScore: integer('buying_power_score').notNull(),
  competitionScore: integer('competition_score').notNull(),
  differentiationScore: integer('differentiation_score').notNull(),
  creationEaseScore: integer('creation_ease_score').notNull(),
  scalingPotentialScore: integer('scaling_potential_score').notNull(),
  profitMarginScore: integer('profit_margin_score').notNull(),
  finalScore: doublePrecision('final_score').notNull(),
  targetAudience: text('target_audience').notNull(),
  estimatedPrice: doublePrecision('estimated_price').notNull(),
  financialViability: text('financial_viability').notNull(),
  expertOpinion: text('expert_opinion').notNull(),
  recommendations: text('recommendations').notNull(),
  status: text('status').default('pending').notNull(), // 'pending', 'approved', 'rejected'
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tabela de Conteúdos Gerados pelo Writer Agent
export const generatedContents = pgTable('generated_contents', {
  id: text('id').primaryKey(),
  productId: text('product_id').references(() => products.id, { onDelete: 'cascade' }),
  productName: text('product_name').notNull(),
  contentType: text('content_type').notNull(), // 'ebook', 'chapter', 'course', 'lesson', 'script', 'checklist', 'guide', 'exercise', 'bonus'
  title: text('title').notNull(),
  body: text('body').notNull(),
  outline: text('outline'),
  version: text('version').default('1.0.0').notNull(),
  status: text('status').default('draft').notNull(), // 'draft', 'reviewed', 'approved'
  
  // Avaliação automática de qualidade
  qualityScore: doublePrecision('quality_score'),
  clarityScore: integer('clarity_score'),
  depthScore: integer('depth_score'),
  organizationScore: integer('organization_score'),
  valueDeliveredScore: integer('value_delivered_score'),
  audienceFitScore: integer('audience_fit_score'),
  originalityScore: integer('originality_score'),
  feedback: text('feedback'),

  // Revisões, etc.
  revisions: jsonb('revisions').default([]).notNull(),
  chaptersCount: integer('chapters_count').default(0).notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tabela de Projetos Visuais criados pelo Designer Agent (Etapa 9)
export const designProjects = pgTable('design_projects', {
  id: text('id').primaryKey(),
  productId: text('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  productName: text('product_name').notNull(),
  contentId: text('content_id'), // Opcional, se associado a um conteúdo textual
  title: text('title').notNull(),
  visualIdentity: text('visual_identity').notNull(),
  styleChoice: text('style_choice').notNull(),
  imageBriefing: text('image_briefing').notNull(),
  coverLayout: text('cover_layout').notNull(),
  marketingAssets: jsonb('marketing_assets').default([]).notNull(), // briefings/prompts de ads, banners, mockups, etc.
  version: text('version').default('1.0.0').notNull(),
  status: text('status').default('draft').notNull(), // 'draft', 'reviewed', 'approved'

  // Avaliação Estética Automática (Controle de Qualidade Visual)
  qualityScore: doublePrecision('quality_score'),
  aestheticScore: integer('aesthetic_score'),
  clarityScore: integer('clarity_score'),
  audienceFitScore: integer('audience_fit_score'),
  commercialAppealScore: integer('commercial_appeal_score'),
  differentiationScore: integer('differentiation_score'),
  feedback: text('feedback'),

  // Ativos visuais gerados/planejados
  generatedAssets: jsonb('generated_assets').default([]).notNull(),

  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tabela de Campanhas de Marketing criadas pelo Marketing Agent (Etapa 10)
export const marketingCampaigns = pgTable('marketing_campaigns', {
  id: text('id').primaryKey(),
  productId: text('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  productName: text('product_name').notNull(),
  title: text('title').notNull(),
  
  // Estratégia de Posicionamento e Persona
  persona: jsonb('persona').notNull(), // { name, painPoint, mainDesire, uvp, competitiveAdvantage }
  positioning: text('positioning').notNull(), // Oferta e posicionamento geral
  
  // Copywriting e Mensagens de Venda
  copywriting: jsonb('copywriting').notNull(), // { headlines, subheadlines, sellingArguments, benefits, ctas }
  
  // Estrutura de Página de Vendas
  salesPage: jsonb('sales_page').notNull(), // { title, problem, solution, benefits, proof, offer, guarantee, cta }
  
  // Redes Sociais e Calendário
  socialMedia: jsonb('social_media').notNull(), // { posts: [{ title, caption, ideas }], calendar: [{ day, topic, channel }], videoIdeas: [string] }
  
  // Campanhas de Anúncios Pagos (Ads)
  campaignAds: jsonb('campaign_ads').notNull(), // { adStrategy, targetAudiences, requiredCreatives, abTests }
  
  version: text('version').default('1.0.0').notNull(),
  status: text('status').default('draft').notNull(), // 'draft', 'reviewed', 'approved'

  // Sistema de Pontuação de Estratégia (Controle de Qualidade de Vendas)
  qualityScore: doublePrecision('quality_score'),
  offerClarityScore: integer('offer_clarity_score'),
  conversionPowerScore: integer('conversion_power_score'),
  audienceFitScore: integer('audience_fit_score'),
  differentiationScore: integer('differentiation_score'),
  scalePotentialScore: integer('scale_potential_score'),
  feedback: text('feedback'),

  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tabela de Publicações de Infoprodutos criadas pelo Publisher Agent (Etapa 11)
export const publications = pgTable('publications', {
  id: text('id').primaryKey(),
  productId: text('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  productName: text('product_name').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  price: doublePrecision('price').notNull(),
  images: jsonb('images').default([]).notNull(), // string[]
  files: jsonb('files').default([]).notNull(), // string[] (arquivos prontos da publicação)
  salesPageUrl: text('sales_page_url').notNull(),
  termsAndConditions: text('terms_and_conditions').notNull(),
  status: text('status').default('pending').notNull(), // 'pending', 'checking', 'ready', 'approved', 'published', 'failed'
  version: text('version').default('1.0.0').notNull(),
  platforms: jsonb('platforms').notNull(), // { hotmart: boolean, kiwify: boolean, etc. }
  checklist: jsonb('checklist').notNull(), // { filesVerified: boolean, commercialOk: boolean, ... }
  history: jsonb('history').default([]).notNull(), // { action, actor, timestamp, details }[]
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 1. Tabela de Movimentações / Transações Financeiras (Etapa 12)
export const financialTransactions = pgTable('financial_transactions', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // 'revenue' | 'expense'
  amount: doublePrecision('amount').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  date: text('date').notNull(), // 'YYYY-MM-DD'
  productId: text('product_id'),
  campaignId: text('campaign_id'),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Tabela de Receitas (Etapa 12)
export const revenues = pgTable('revenues', {
  id: text('id').primaryKey(),
  productId: text('product_id').references(() => products.id, { onDelete: 'set null' }),
  amount: doublePrecision('amount').notNull(),
  paymentMethod: text('payment_method').notNull(), // 'pix' | 'credit_card' | 'boleto'
  status: text('status').notNull(), // 'completed' | 'pending' | 'refunded'
  customerEmail: text('customer_email').notNull(),
  date: text('date').notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 3. Tabela de Despesas (Etapa 12)
export const expenses = pgTable('expenses', {
  id: text('id').primaryKey(),
  amount: doublePrecision('amount').notNull(),
  category: text('category').notNull(), // 'ads' | 'servers' | 'commissions' | 'salaries' | 'other'
  description: text('description').notNull(),
  date: text('date').notNull(),
  status: text('status').notNull(), // 'paid' | 'pending'
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Tabela de Fluxo de Caixa (Etapa 12)
export const cashflow = pgTable('cashflow', {
  id: text('id').primaryKey(),
  date: text('date').notNull(), // 'YYYY-MM-DD'
  inflow: doublePrecision('inflow').notNull(),
  outflow: doublePrecision('outflow').notNull(),
  balance: doublePrecision('balance').notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 5. Tabela de Relatórios Financeiros (Etapa 12)
export const financialReports = pgTable('financial_reports', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  period: text('period').notNull(), // 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
  totalRevenue: doublePrecision('total_revenue').notNull(),
  totalExpense: doublePrecision('total_expense').notNull(),
  netProfit: doublePrecision('net_profit').notNull(),
  margin: doublePrecision('margin').notNull(), // percentage
  insights: text('insights').notNull(), // IA generated insights
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 6. Tabela de Previsões Financeiras (Etapa 12)
export const financialForecasts = pgTable('financial_forecasts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  period: text('period').notNull(), // 'next_month' | 'next_quarter' | 'next_year'
  predictedRevenue: doublePrecision('predicted_revenue').notNull(),
  confidence: doublePrecision('confidence').notNull(), // e.g. 0.85
  insights: text('insights').notNull(),
  suggestions: text('suggestions').notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 7. Tabela de Análise de Lucro por Produto (Etapa 12)
export const profitAnalysis = pgTable('profit_analysis', {
  id: text('id').primaryKey(),
  productId: text('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  productName: text('product_name').notNull(),
  revenue: doublePrecision('revenue').notNull(),
  cost: doublePrecision('cost').notNull(),
  netProfit: doublePrecision('net_profit').notNull(),
  margin: doublePrecision('margin').notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 8. Tabela de Histórico de ROI (Etapa 12)
export const roiHistory = pgTable('roi_history', {
  id: text('id').primaryKey(),
  campaignId: text('campaign_id').notNull(),
  campaignName: text('campaign_name').notNull(),
  investment: doublePrecision('investment').notNull(),
  revenue: doublePrecision('revenue').notNull(),
  roi: doublePrecision('roi').notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 9. Tabela de Resultados de Campanhas (Etapa 12)
export const campaignResults = pgTable('campaign_results', {
  id: text('id').primaryKey(),
  campaignId: text('campaign_id').notNull(),
  campaignName: text('campaign_name').notNull(),
  leads: integer('leads').notNull(),
  sales: integer('sales').notNull(),
  conversionRate: doublePrecision('conversion_rate').notNull(),
  revenue: doublePrecision('revenue').notNull(),
  spend: doublePrecision('spend').notNull(),
  roi: doublePrecision('roi').notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 10. Tabela de Métricas de Clientes (Etapa 12)
export const customerMetrics = pgTable('customer_metrics', {
  id: text('id').primaryKey(),
  cac: doublePrecision('cac').notNull(), // Custo de Aquisição de Cliente
  ltv: doublePrecision('ltv').notNull(), // Lifetime Value
  averageTicket: doublePrecision('average_ticket').notNull(), // Ticket Médio
  conversionRate: doublePrecision('conversion_rate').notNull(),
  activeCustomers: integer('active_customers').notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// === TABELAS DO SUPERVISOR AGENT (COO) ===
// ==========================================

// 1. Tabela agent_health
export const agentHealth = pgTable('agent_health', {
  id: text('id').primaryKey(), // ID do agente (e.g. 'ceo', 'research', etc.)
  status: text('status').default('idle').notNull(), // 'idle', 'running', 'paused', 'error', 'offline'
  lastHeartbeat: text('last_heartbeat').notNull(), // ISO String
  uptime: integer('uptime').default(0).notNull(), // tempo online em segundos
  downtime: integer('downtime').default(0).notNull(), // tempo parado em segundos
  currentWorkflowId: text('current_workflow_id'),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Tabela agent_metrics
export const agentMetrics = pgTable('agent_metrics', {
  id: text('id').primaryKey(),
  agentId: text('agent_id').notNull(),
  logicalCpu: doublePrecision('logical_cpu').default(0).notNull(),
  logicalMemory: doublePrecision('logical_memory').default(0).notNull(),
  tasksExecuted: integer('tasks_executed').default(0).notNull(),
  tasksFailed: integer('tasks_failed').default(0).notNull(),
  averageExecutionTime: doublePrecision('average_execution_time').default(0).notNull(), // em segundos
  taskQueueCount: integer('task_queue_count').default(0).notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 3. Tabela agent_heartbeats
export const agentHeartbeats = pgTable('agent_heartbeats', {
  id: text('id').primaryKey(),
  agentId: text('agent_id').notNull(),
  status: text('status').notNull(),
  currentTask: text('current_task'),
  cpuUsage: doublePrecision('cpu_usage').notNull(),
  memoryUsage: doublePrecision('memory_usage').notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Tabela workflow_history
export const workflowHistory = pgTable('workflow_history', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  status: text('status').notNull(), // 'running', 'completed', 'paused', 'failed', 'rebalanced'
  currentStep: text('current_step').notNull(),
  stepsJson: jsonb('steps_json').default([]).notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 5. Tabela system_alerts
export const systemAlerts = pgTable('system_alerts', {
  id: text('id').primaryKey(),
  severity: text('severity').notNull(), // 'critical', 'high', 'medium', 'low', 'info'
  reason: text('reason').notNull(),
  origin: text('origin').notNull(), // de onde veio o alerta
  agentId: text('agent_id'), // agente originador
  timestamp: text('timestamp').notNull(),
  actionSuggested: text('action_suggested').notNull(),
  repaired: integer('repaired').default(0).notNull(), // 0 = no, 1 = yes (pelo Repair Agent)
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 6. Tabela operation_logs
export const operationLogs = pgTable('operation_logs', {
  id: text('id').primaryKey(),
  action: text('action').notNull(), // 'pause', 'resume', 'restart', 'rebalance', 'heartbeat', 'alert', 'health_check'
  agentId: text('agent_id'),
  details: text('details').notNull(),
  user: text('user').default('system').notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 7. Tabela system_metrics
export const systemMetrics = pgTable('system_metrics', {
  id: text('id').primaryKey(),
  cpuUsage: doublePrecision('cpu_usage').notNull(),
  memoryUsage: doublePrecision('memory_usage').notNull(),
  postgresStatus: text('postgres_status').notNull(), // 'online', 'offline'
  geminiApiStatus: text('gemini_api_status').notNull(), // 'online', 'offline'
  serverStatus: text('server_status').notNull(), // 'online', 'offline'
  restApiStatus: text('rest_api_status').notNull(), // 'online', 'offline'
  dashboardStatus: text('dashboard_status').notNull(), // 'online', 'offline'
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 8. Tabela performance_history
export const performanceHistory = pgTable('performance_history', {
  id: text('id').primaryKey(),
  label: text('label').notNull(), // e.g. 'hourly', 'daily'
  overallEfficiency: doublePrecision('overall_efficiency').notNull(),
  totalActiveAgents: integer('total_active_agents').notNull(),
  totalTasksPending: integer('total_tasks_pending').notNull(),
  totalTasksCompleted: integer('total_tasks_completed').notNull(),
  totalTasksFailed: integer('total_tasks_failed').notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 9. Tabela repair_issues
export const repairIssues = pgTable('repair_issues', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  severity: text('severity').notNull(), // 'info', 'low', 'medium', 'high', 'critical', 'emergency'
  status: text('status').notNull(), // 'active', 'investigating', 'testing', 'repairing', 'resolved', 'failed'
  source: text('source').notNull(), // e.g. 'SupervisorAgent', 'PostgreSQL'
  rootCause: text('root_cause'),
  recurrenceCount: integer('recurrence_count').default(1).notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 10. Tabela repair_history
export const repairHistory = pgTable('repair_history', {
  id: text('id').primaryKey(),
  issueId: text('issue_id'),
  action: text('action').notNull(),
  result: text('result').notNull(), // 'success', 'failed'
  durationMs: integer('duration_ms').default(0).notNull(),
  operator: text('operator').notNull(), // 'RepairAgent', 'Admin'
  details: text('details').notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 11. Tabela repair_reports
export const repairReports = pgTable('repair_reports', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // 'technical', 'executive', 'failures', 'performance', 'corrections', 'availability', 'stability'
  title: text('title').notNull(),
  content: text('content').notNull(),
  data: jsonb('data').default({}).notNull(),
  generatedBy: text('generated_by').notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 12. Tabela repair_tests
export const repairTests = pgTable('repair_tests', {
  id: text('id').primaryKey(),
  testType: text('test_type').notNull(), // 'unit', 'integration', 'api', 'db', 'agent', 'dashboard', 'scheduler', 'workflow', 'performance', 'communication', 'postgres', 'gemini'
  name: text('name').notNull(),
  status: text('status').notNull(), // 'passed', 'failed', 'running'
  errorDetails: text('error_details'),
  durationMs: integer('duration_ms').default(0).notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 13. Tabela repair_actions
export const repairActions = pgTable('repair_actions', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // 'clear_cache', 'restart_scheduler', 'reprocess_queue', etc.
  description: text('description').notNull(),
  isPermitted: integer('is_permitted').default(1).notNull(), // 0 = forbidden, 1 = permitted
  executedAt: text('executed_at').notNull(),
  resultStatus: text('result_status').notNull(), // 'success', 'failed'
  errorLog: text('error_log'),
});

// 14. Tabela repair_snapshots
export const repairSnapshots = pgTable('repair_snapshots', {
  id: text('id').primaryKey(),
  description: text('description').notNull(),
  stateBackup: jsonb('state_backup').default({}).notNull(),
  sizeBytes: integer('size_bytes').default(0).notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 15. Tabela repair_rollbacks
export const repairRollbacks = pgTable('repair_rollbacks', {
  id: text('id').primaryKey(),
  snapshotId: text('snapshot_id').notNull(),
  reason: text('reason').notNull(),
  executedBy: text('executed_by').notNull(),
  status: text('status').notNull(), // 'completed', 'failed'
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 16. Tabela repair_knowledge
export const repairKnowledge = pgTable('repair_knowledge', {
  id: text('id').primaryKey(),
  problem: text('problem').notNull(),
  cause: text('cause').notNull(),
  correction: text('correction').notNull(),
  result: text('result').notNull(),
  resolutionTimeMs: integer('resolution_time_ms').default(0).notNull(),
  recurrenceCount: integer('recurrence_count').default(1).notNull(),
  successRatePct: doublePrecision('success_rate_pct').default(100.0).notNull(),
  futureRecommendation: text('future_recommendation').notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 17. Tabela repair_statistics
export const repairStatistics = pgTable('repair_statistics', {
  id: text('id').primaryKey(),
  meanTimeToResolutionMs: integer('mean_time_to_resolution_ms').default(0).notNull(),
  systemAvailabilityPct: doublePrecision('system_availability_pct').default(100.0).notNull(),
  successRatePct: doublePrecision('success_rate_pct').default(100.0).notNull(),
  activeIssuesCount: integer('active_issues_count').default(0).notNull(),
  totalIssuesCount: integer('total_issues_count').default(0).notNull(),
  totalRepairsCount: integer('total_repairs_count').default(0).notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 18. Tabela repair_diagnostics
export const repairDiagnostics = pgTable('repair_diagnostics', {
  id: text('id').primaryKey(),
  targetComponent: text('target_component').notNull(),
  diagnosticType: text('diagnostic_type').notNull(),
  logAnalysisSummary: text('log_analysis_summary').notNull(),
  memoryLeakDetected: integer('memory_leak_detected').default(0).notNull(), // 0 = false, 1 = true
  loopDetected: integer('loop_detected').default(0).notNull(), // 0 = false, 1 = true
  blockedQueueDetected: integer('blocked_queue_detected').default(0).notNull(), // 0 = false, 1 = true
  slowApisDetected: integer('slow_apis_detected').default(0).notNull(), // 0 = false, 1 = true
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// === TABELAS DO KERNEL (ETAPA 15) ===
// ==========================================

// 19. Tabela kernel_registry
export const kernelRegistry = pgTable('kernel_registry', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  version: text('version').notNull(),
  status: text('status').default('idle').notNull(),
  permissions: jsonb('permissions').default([]).notNull(),
  capabilities: jsonb('capabilities').default([]).notNull(),
  dependencies: jsonb('dependencies').default([]).notNull(),
  heartbeat: text('heartbeat').notNull(),
  lastExecution: text('last_execution').notNull(),
  lastUpdate: text('last_update').notNull(),
  logicalConsumption: doublePrecision('logical_consumption').default(0).notNull(),
  averageTime: integer('average_time').default(0).notNull(),
  priority: integer('priority').default(1).notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 20. Tabela kernel_events
export const kernelEvents = pgTable('kernel_events', {
  id: text('id').primaryKey(),
  eventType: text('event_type').notNull(),
  source: text('source').notNull(),
  payload: jsonb('payload').default({}).notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 21. Tabela kernel_plugins
export const kernelPlugins = pgTable('kernel_plugins', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  version: text('version').notNull(),
  manifest: jsonb('manifest').default({}).notNull(),
  dependencies: jsonb('dependencies').default([]).notNull(),
  permissions: jsonb('permissions').default([]).notNull(),
  events: jsonb('events').default([]).notNull(),
  routes: jsonb('routes').default([]).notNull(),
  panels: jsonb('panels').default([]).notNull(),
  capabilities: jsonb('capabilities').default([]).notNull(),
  status: text('status').default('installed').notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 22. Tabela kernel_services
export const kernelServices = pgTable('kernel_services', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  status: text('status').default('running').notNull(),
  uptime: integer('uptime').default(0).notNull(),
  lastCheck: text('last_check').notNull(),
  message: text('message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 23. Tabela kernel_versions
export const kernelVersions = pgTable('kernel_versions', {
  id: text('id').primaryKey(),
  componentType: text('component_type').notNull(), // 'agent' | 'plugin' | 'integration' | 'kernel'
  componentId: text('component_id').notNull(),
  version: text('version').notNull(),
  history: jsonb('history').default([]).notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 24. Tabela kernel_configs
export const kernelConfigs = pgTable('kernel_configs', {
  id: text('id').primaryKey(),
  dataJson: jsonb('data_json').default({}).notNull(),
  version: integer('version').default(1).notNull(),
  updatedAt: text('updated_at').notNull(),
  history: jsonb('history').default([]).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 25. Tabela kernel_shared_memory
export const kernelSharedMemory = pgTable('kernel_shared_memory', {
  key: text('key').primaryKey(),
  value: jsonb('value').default({}).notNull(),
  version: integer('version').default(1).notNull(),
  expiration: text('expiration'),
  accessControl: jsonb('access_control').default([]).notNull(),
  isLocked: integer('is_locked').default(0).notNull(), // 0 = false, 1 = true
  lockedBy: text('locked_by'),
  lastUpdatedBy: text('last_updated_by').notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 26. Tabela kernel_audit
export const kernelAudit = pgTable('kernel_audit', {
  id: text('id').primaryKey(),
  action: text('action').notNull(),
  category: text('category').notNull(),
  details: text('details').notNull(),
  user: text('user').notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 27. Tabela kernel_metrics
export const kernelMetrics = pgTable('kernel_metrics', {
  id: text('id').primaryKey(),
  totalEventsProcessed: integer('total_events_processed').default(0).notNull(),
  activeAgentsCount: integer('active_agents_count').default(0).notNull(),
  activePluginsCount: integer('active_plugins_count').default(0).notNull(),
  sharedMemoryKeysCount: integer('shared_memory_keys_count').default(0).notNull(),
  systemUptimeSeconds: integer('system_uptime_seconds').default(0).notNull(),
  averageCommunicationTimeMs: doublePrecision('average_communication_time_ms').default(0).notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 28. Tabela kernel_health
export const kernelHealth = pgTable('kernel_health', {
  id: text('id').primaryKey(),
  status: text('status').default('healthy').notNull(), // 'healthy' | 'warning' | 'critical'
  databaseStatus: text('database_status').default('healthy').notNull(),
  eventBusStatus: text('event_bus_status').default('healthy').notNull(),
  schedulerStatus: text('scheduler_status').default('healthy').notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 29. Tabela integration_connectors
export const integrationConnectors = pgTable('integration_connectors', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(), // 'cloud', 'messaging', 'payments', 'e-commerce', 'marketing', 'social', 'dev'
  status: text('status').default('disconnected').notNull(), // 'connected' | 'disconnected' | 'authenticating' | 'error' | 'expired' | 'reconnecting' | 'blocked'
  configJson: jsonb('config_json'),
  lastSyncedAt: text('last_synced_at'),
  latencyMs: integer('latency_ms').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 30. Tabela integration_jobs
export const integrationJobs = pgTable('integration_jobs', {
  id: text('id').primaryKey(),
  connectorId: text('connector_id').notNull(),
  type: text('type').notNull(), // 'sync' | 'upload' | 'download' | 'publish' | 'import' | 'export'
  status: text('status').default('pending').notNull(), // 'pending' | 'running' | 'completed' | 'failed'
  payloadJson: jsonb('payload_json'),
  resultJson: jsonb('result_json'),
  error: text('error'),
  attempts: integer('attempts').default(0).notNull(),
  maxAttempts: integer('max_attempts').default(3).notNull(),
  timeoutMs: integer('timeout_ms').default(30000).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 31. Tabela integration_logs
export const integrationLogs = pgTable('integration_logs', {
  id: text('id').primaryKey(),
  connectorId: text('connector_id').notNull(),
  type: text('type').notNull(), // 'info' | 'warn' | 'error' | 'success'
  direction: text('direction').notNull(), // 'inbound' | 'outbound'
  url: text('url'),
  method: text('method'),
  statusCode: integer('status_code'),
  requestHeaders: jsonb('request_headers'),
  requestBody: text('request_body'),
  responseHeaders: jsonb('response_headers'),
  responseBody: text('response_body'),
  latencyMs: integer('latency_ms').default(0).notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 32. Tabela integration_tokens
export const integrationTokens = pgTable('integration_tokens', {
  id: text('id').primaryKey(),
  connectorId: text('connector_id').notNull(),
  tokenType: text('token_type').notNull(), // 'oauth2' | 'apikey' | 'jwt' | 'bearer' | 'basic'
  accessTokenEncrypted: text('access_token_encrypted'),
  refreshTokenEncrypted: text('refresh_token_encrypted'),
  clientSecretEncrypted: text('client_secret_encrypted'),
  expiresAt: text('expires_at'),
  endpoint: text('endpoint'),
  metadataJson: jsonb('metadata_json'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 33. Tabela integration_webhooks
export const integrationWebhooks = pgTable('integration_webhooks', {
  id: text('id').primaryKey(),
  connectorId: text('connector_id').notNull(),
  name: text('name').notNull(),
  url: text('url').notNull(),
  secretEncrypted: text('secret_encrypted'),
  status: text('status').default('inactive').notNull(), // 'active' | 'inactive'
  processedEventsCount: integer('processed_events_count').default(0).notNull(),
  lastEventReceivedAt: text('last_event_received_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 34. Tabela integration_files
export const integrationFiles = pgTable('integration_files', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  connectorId: text('connector_id').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  mimeType: text('mime_type').notNull(),
  storagePath: text('storage_path').notNull(),
  version: integer('version').default(1).notNull(),
  hash: text('hash').notNull(),
  status: text('status').default('uploaded').notNull(), // 'uploaded' | 'downloaded' | 'processing' | 'failed'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 35. Tabela integration_sync
export const integrationSync = pgTable('integration_sync', {
  id: text('id').primaryKey(),
  connectorId: text('connector_id').notNull(),
  entityName: text('entity_name').notNull(), // 'leads' | 'emails' | 'files' | 'payments' | 'orders'
  itemsSynced: integer('items_synced').default(0).notNull(),
  lastAnchor: text('last_anchor'),
  status: text('status').notNull(), // 'success' | 'failed' | 'running'
  durationMs: integer('duration_ms').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 36. Tabela integration_metrics
export const integrationMetrics = pgTable('integration_metrics', {
  id: text('id').primaryKey(),
  connectorId: text('connector_id').notNull(),
  totalRequests: integer('total_requests').default(0).notNull(),
  successfulRequests: integer('successful_requests').default(0).notNull(),
  failedRequests: integer('failed_requests').default(0).notNull(),
  averageLatencyMs: integer('average_latency_ms').default(0).notNull(),
  totalBytesTransferred: integer('total_bytes_transferred').default(0).notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 37. Tabela integration_errors
export const integrationErrors = pgTable('integration_errors', {
  id: text('id').primaryKey(),
  connectorId: text('connector_id').notNull(),
  errorCode: text('error_code').notNull(),
  errorMessage: text('error_message').notNull(),
  stackTrace: text('stack_trace'),
  resolved: integer('resolved').default(0).notNull(), // 0: unresolved, 1: resolved
  resolvedAt: text('resolved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 38. Tabela integration_history
export const integrationHistory = pgTable('integration_history', {
  id: text('id').primaryKey(),
  connectorId: text('connector_id').notNull(),
  eventType: text('event_type').notNull(), // 'connected', 'disconnected', 'sync_completed', 'sync_failed', 'webhook_received', etc.
  description: text('description').notNull(),
  author: text('author').default('System').notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 39. Tabela payment_connections
export const paymentConnections = pgTable('payment_connections', {
  id: text('id').primaryKey(),
  provider: text('provider').notNull(), // 'mercado_pago'
  status: text('status').default('disconnected').notNull(), // 'connected' | 'disconnected' | 'authenticating' | 'error' | 'testing'
  encryptedCredentials: text('encrypted_credentials'),
  lastSync: text('last_sync'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 40. Tabela payment_transactions
export const paymentTransactions = pgTable('payment_transactions', {
  id: text('id').primaryKey(),
  provider: text('provider').notNull(), // 'mercado_pago'
  externalId: text('external_id').notNull(),
  productId: text('product_id'),
  amount: doublePrecision('amount').notNull(),
  currency: text('currency').default('BRL').notNull(),
  status: text('status').notNull(), // 'approved' | 'pending' | 'rejected' | 'refunded' | 'cancelled'
  customerReference: text('customer_reference').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 41. Tabela digital_sales
export const digitalSales = pgTable('digital_sales', {
  id: text('id').primaryKey(),
  provider: text('provider').notNull(), // 'hotmart'
  externalId: text('external_id').notNull(),
  productId: text('product_id'),
  amount: doublePrecision('amount').notNull(),
  commission: doublePrecision('commission').notNull(),
  status: text('status').notNull(), // 'approved' | 'complete' | 'refunded' | 'canceled'
  buyerReference: text('buyer_reference').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 42. Tabela platform_connections
export const platformConnections = pgTable('platform_connections', {
  id: text('id').primaryKey(),
  provider: text('provider').notNull(), // 'hotmart'
  status: text('status').default('disconnected').notNull(), // 'connected' | 'disconnected' | 'authenticating' | 'error' | 'testing'
  encryptedCredentials: text('encrypted_credentials'),
  lastSync: text('last_sync'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 43. Tabela connections
export const connections = pgTable('connections', {
  id: text('id').primaryKey(),
  provider: text('provider').notNull(),
  category: text('category').notNull(),
  status: text('status').notNull(), // e.g. 'connected' | 'disconnected' | 'authenticating' | 'expired' | 'error'
  accountName: text('account_name'),
  encryptedCredentials: text('encrypted_credentials'),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('expires_at'),
  lastSync: timestamp('last_sync'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 44. Tabela connection_logs
export const connectionLogs = pgTable('connection_logs', {
  id: text('id').primaryKey(),
  connectionId: text('connection_id').notNull(),
  action: text('action').notNull(),
  status: text('status').notNull(),
  latency: integer('latency'),
  message: text('message'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// 45. Tabela sync_history
export const syncHistory = pgTable('sync_history', {
  id: text('id').primaryKey(),
  provider: text('provider').notNull(),
  type: text('type').notNull(),
  recordsProcessed: integer('records_processed').default(0).notNull(),
  status: text('status').notNull(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  finishedAt: timestamp('finished_at'),
});

// 46. Tabela customers
export const customers = pgTable('customers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').default(''),
  purchases: integer('purchases').default(0).notNull(),
  totalSpent: doublePrecision('total_spent').default(0).notNull(),
  lastPurchase: text('last_purchase'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 47. Tabela launches
export const launches = pgTable('launches', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull(),
  name: text('name').notNull(),
  strategy: text('strategy'),
  audience: text('audience'),
  startDate: text('start_date'),
  endDate: text('end_date'),
  budget: doublePrecision('budget').default(0).notNull(),
  status: text('status').default('draft').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),

  // strategic fields generated by AI
  campaignName: text('campaign_name'),
  goal: text('goal'),
  mainOffer: text('main_offer'),
  suggestedPrice: doublePrecision('suggested_price'),
  bonus: text('bonus'),
  mainMessage: text('main_message'),
  instagramChannel: text('instagram_channel'),
  facebookChannel: text('facebook_channel'),
  googleChannel: text('google_channel'),
  emailChannel: text('email_channel'),
  whatsAppChannel: text('whats_app_channel'),
  timelinePreLaunch: text('timeline_pre_launch'),
  timelineWarmup: text('timeline_warmup'),
  timelineOpen: text('timeline_open'),
  timelineSales: text('timeline_sales'),
  timelinePostSales: text('timeline_post_sales'),
  recommendations: text('recommendations'),
});

// 48. Tabela campaigns
export const campaigns = pgTable('campaigns', {
  id: text('id').primaryKey(),
  launchId: text('launch_id').notNull(),
  name: text('name').notNull(),
  platform: text('platform').notNull(), // 'instagram', 'facebook', 'google', 'email', 'whatsapp'
  status: text('status').notNull(),
  budget: doublePrecision('budget').default(0).notNull(),
  spent: doublePrecision('spent').default(0).notNull(),
  clicks: integer('clicks').default(0).notNull(),
  conversions: integer('conversions').default(0).notNull(),
  revenue: doublePrecision('revenue').default(0).notNull(),
  adCopy: text('ad_copy'),
  creativeUrl: text('creative_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 49. Tabela email_sequences
export const emailSequences = pgTable('email_sequences', {
  id: text('id').primaryKey(),
  launchId: text('launch_id').notNull(),
  name: text('name').notNull(),
  triggerEvent: text('trigger_event').notNull(),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  sentCount: integer('sent_count').default(0).notNull(),
  openRate: doublePrecision('open_rate').default(0).notNull(),
  clickRate: doublePrecision('click_rate').default(0).notNull(),
  status: text('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 50. Tabela marketing_events
export const marketingEvents = pgTable('marketing_events', {
  id: text('id').primaryKey(),
  launchId: text('launch_id').notNull(),
  eventType: text('event_type').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  channel: text('channel'),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});






