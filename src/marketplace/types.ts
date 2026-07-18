export type AgentCategory = 'marketing' | 'sales' | 'business' | 'finance' | 'support';
export type AgentInstallStatus = 'AVAILABLE' | 'INSTALLED' | 'ACTIVE' | 'PAUSED';
export type PlanType = 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';

export interface MarketplaceAgent {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
  difficulty: 'Fácil' | 'Médio' | 'Avançado';
  features: string[];
  requirements: string[];
  status: AgentInstallStatus;
  rating: number;
  reviewsCount: number;
  executionCount: number;
}

export interface BusinessTemplate {
  id: string;
  name: string;
  description: string;
  agentsIncluded: string[]; // IDs dos agentes inclusos (ou referências)
  executionFlow: string[]; // Passos descritivos do fluxo
  initialConfig: Record<string, any>;
  popularity: number;
}

export interface UserPlan {
  currentPlan: PlanType;
  maxAgents: number; // Limite de agentes ativos/instalados
  maxExecutions: number; // Limite de execuções mensais
  availableCredits: number; // Créditos de IA
  usedExecutions: number;
  usedCredits: number;
}

export interface UserMarketplaceState {
  installedAgentIds: string[];
  activeAgentIds: string[];
  pausedAgentIds: string[];
  installedTemplateIds: string[];
  plan: UserPlan;
  agentRatings: Record<string, { rating: number; review?: string }>;
  agentUsageHistory: { agentId: string; timestamp: string; action: string }[];
}

export interface MarketplaceAnalytics {
  totalInstalled: number;
  mostUsedAgents: { agentId: string; name: string; count: number }[];
  popularTemplates: { templateId: string; name: string; count: number }[];
  activationRate: number; // Porcentagem de agentes instalados que estão ativos
  conversionRate: number; // Razão de upgrades de plano recomendados vs efetuados (simulado)
}

export interface MarketplaceRecommendation {
  recommendedAgentIds: string[];
  recommendedTemplateIds: string[];
  nextActions: string[];
  reasoning: string;
}
