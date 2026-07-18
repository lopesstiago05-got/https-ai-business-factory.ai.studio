import fs from 'fs';
import path from 'path';

export interface AgentMetrics {
  performanceScore: number;
  precision: number;
  efficiency: number;
  speed: number;
  avgResponseTime: number;
  successRate: number;
  errorRate: number;
  taskCount: number;
  failedTaskCount: number;
  financialImpact: number;
  operationalImpact: number;
}

export interface PerformanceSnapshot {
  timestamp: string;
  metrics: AgentMetrics;
}

export interface AgentMemoryItem {
  id: string;
  timestamp: string;
  taskId: string;
  taskTitle: string;
  decisionTaken: string;
  result: 'success' | 'failure';
  strategyUsed: string;
  feedbackReceived?: string;
  failureReason?: string;
  bestPracticeLearned?: string;
}

export interface ABTest {
  id: string;
  agentId: string;
  title: string;
  variantA: { promptSuffix: string; params: any };
  variantB: { promptSuffix: string; params: any };
  variantAMetrics: { count: number; successRate: number; avgTime: number; score: number };
  variantBMetrics: { count: number; successRate: number; avgTime: number; score: number };
  status: 'running' | 'completed';
  winner?: 'A' | 'B';
  createdAt: string;
}

export interface Recommendation {
  id: string;
  agentId: string;
  type: 'prompt' | 'parameter' | 'workflow' | 'prioritization';
  title: string;
  description: string;
  impactScore: number; // 1-10
  status: 'pending' | 'applied' | 'rejected';
  actionableChange: any; // e.g., updated prompt suffix or parameter changes
  createdAt: string;
}

export interface EvolutionState {
  agentMetrics: Record<string, AgentMetrics>;
  performanceHistory: Record<string, PerformanceSnapshot[]>;
  memories: Record<string, AgentMemoryItem[]>;
  abTests: ABTest[];
  recommendations: Recommendation[];
  activeEvolvedPrompts: Record<string, string>; // agentId -> evolved prompt suffix or override
  activeEvolvedParams: Record<string, any>; // agentId -> evolved configurations (e.g. temperature, maxTokens)
  logs: string[];
}

const EVOLUTION_FILE = path.join(process.cwd(), 'evolution_db.json');

const DEFAULT_METRICS = (agentId: string): AgentMetrics => {
  // Base baseline for each agent
  const defaultEfficiency = agentId === 'ceo' ? 98 : agentId === 'supervisor' ? 99 : 95;
  return {
    performanceScore: defaultEfficiency,
    precision: defaultEfficiency - 2,
    efficiency: defaultEfficiency,
    speed: 15, // average execution speed in simulated seconds
    avgResponseTime: 4.5,
    successRate: 100,
    errorRate: 0,
    taskCount: 0,
    failedTaskCount: 0,
    financialImpact: 1500, // baseline economic value generated
    operationalImpact: 85 // operational productivity
  };
};

export class EvolutionStore {
  private static state: EvolutionState | null = null;

  public static get(): EvolutionState {
    if (this.state) return this.state;

    if (fs.existsSync(EVOLUTION_FILE)) {
      try {
        const raw = fs.readFileSync(EVOLUTION_FILE, 'utf-8');
        this.state = JSON.parse(raw);
        return this.state!;
      } catch (err) {
        console.error('Falha ao ler evolution_db.json, gerando padrão:', err);
      }
    }

    // Default state
    const agentsList = ['ceo', 'research', 'market_analyst', 'market', 'product', 'writer', 'designer', 'marketing', 'publisher', 'finance', 'supervisor', 'launch_manager', 'customer_success'];
    const agentMetrics: Record<string, AgentMetrics> = {};
    const performanceHistory: Record<string, PerformanceSnapshot[]> = {};
    const memories: Record<string, AgentMemoryItem[]> = {};

    agentsList.forEach(id => {
      agentMetrics[id] = DEFAULT_METRICS(id);
      performanceHistory[id] = [
        {
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          metrics: { ...DEFAULT_METRICS(id), performanceScore: DEFAULT_METRICS(id).performanceScore - 2 }
        },
        {
          timestamp: new Date().toISOString(),
          metrics: DEFAULT_METRICS(id)
        }
      ];
      memories[id] = [];
    });

    this.state = {
      agentMetrics,
      performanceHistory,
      memories,
      abTests: [
        {
          id: 'ab_ceo_creative',
          agentId: 'ceo',
          title: 'A/B Test: Prompt CEO Super Criativo vs Tradicional',
          variantA: { promptSuffix: 'Encoraje nichos e ideias mais criativas e fora da caixa.', params: { temperature: 0.85 } },
          variantB: { promptSuffix: 'Mantenha o foco em nichos hiper validados e pragmáticos de alta demanda comercial.', params: { temperature: 0.6 } },
          variantAMetrics: { count: 12, successRate: 100, avgTime: 4.1, score: 96 },
          variantBMetrics: { count: 15, successRate: 93, avgTime: 4.5, score: 92 },
          status: 'running',
          createdAt: new Date().toISOString()
        }
      ],
      recommendations: [
        {
          id: 'rec_001',
          agentId: 'ceo',
          type: 'prompt',
          title: 'Adicionar Regra de Posicionamento ao CEO',
          description: 'Sugerido acrescentar diretrizes explícitas sobre posicionamento de micro-nicho para otimizar o indicador de Precisão.',
          impactScore: 8,
          status: 'pending',
          actionableChange: { promptSuffix: 'Ao criar planos estratégicos, foque estritamente em um micro-nicho em vez de nichos saturados amplos.' },
          createdAt: new Date().toISOString()
        },
        {
          id: 'rec_002',
          agentId: 'research',
          type: 'parameter',
          title: 'Ajustar Temperatura do Research Agent',
          description: 'Aumentar a temperatura do modelo do Research Agent para 0.8 para melhorar a criatividade dos tópicos descobertos.',
          impactScore: 7,
          status: 'pending',
          actionableChange: { temperature: 0.8 },
          createdAt: new Date().toISOString()
        }
      ],
      activeEvolvedPrompts: {},
      activeEvolvedParams: {},
      logs: [`[${new Date().toLocaleTimeString()}] Evolution Engine iniciado com sucesso.`]
    };

    this.save(this.state);
    return this.state;
  }

  public static save(newState: EvolutionState): void {
    this.state = newState;
    try {
      fs.writeFileSync(EVOLUTION_FILE, JSON.stringify(newState, null, 2), 'utf-8');
    } catch (err) {
      console.error('Falha ao gravar evolution_db.json:', err);
    }
  }

  public static addLog(message: string): void {
    const state = this.get();
    state.logs.push(`[${new Date().toLocaleTimeString()}] ${message}`);
    if (state.logs.length > 100) {
      state.logs.shift();
    }
    this.save(state);
  }
}
