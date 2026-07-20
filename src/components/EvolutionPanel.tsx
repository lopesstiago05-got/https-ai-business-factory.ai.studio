import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  TrendingUp, 
  Database, 
  Award, 
  Play, 
  Check, 
  X, 
  RefreshCw, 
  Terminal, 
  Layers, 
  Trash2, 
  Compass, 
  AlertTriangle, 
  Clock, 
  ChevronRight,
  ShieldAlert,
  Zap,
  Sparkles,
  ClipboardCheck,
  ChevronDown,
  Info
} from 'lucide-react';

interface AgentMetrics {
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

interface PerformanceSnapshot {
  timestamp: string;
  metrics: AgentMetrics;
}

interface AgentMemoryItem {
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

interface ABTest {
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

interface Recommendation {
  id: string;
  agentId: string;
  type: 'prompt' | 'parameter' | 'workflow' | 'prioritization';
  title: string;
  description: string;
  impactScore: number;
  status: 'pending' | 'applied' | 'rejected';
  actionableChange: any;
  createdAt: string;
}

interface EvolutionState {
  agentMetrics: Record<string, AgentMetrics>;
  performanceHistory: Record<string, PerformanceSnapshot[]>;
  memories: Record<string, AgentMemoryItem[]>;
  abTests: ABTest[];
  recommendations: Recommendation[];
  activeEvolvedPrompts: Record<string, string>;
  activeEvolvedParams: Record<string, any>;
  logs: string[];
}

interface QAAssertion {
  name: string;
  success: boolean;
  message: string;
}

export const EvolutionPanel: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [state, setState] = useState<EvolutionState | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'agents' | 'abtests' | 'recommendations' | 'memories' | 'qa'>('agents');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('ceo');
  
  // Simulated task fields
  const [simTaskTitle, setSimTaskTitle] = useState<string>('Gerar Planejamento de Lançamento');
  const [simTaskDesc, setSimTaskDesc] = useState<string>('Invocação estratégica para definir o cronograma comercial');
  const [simOutput, setSimOutput] = useState<string>('Plano de lançamento de infoproduto estruturado em 5 fases.');
  const [simSuccess, setSimSuccess] = useState<boolean>(true);
  const [simDuration, setSimDuration] = useState<number>(4);
  const [simFeedback, setSimFeedback] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Manual Audit fields
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditReport, setAuditReport] = useState<string | null>(null);

  // QA test suite fields
  const [isRunningQA, setIsRunningQA] = useState<boolean>(false);
  const [qaResults, setQaResults] = useState<{ results: QAAssertion[]; passed: number; failed: number } | null>(null);

  const fetchState = async () => {
    try {
      const res = await fetch('/api/evolution/state');
      const data = await res.json();
      if (data.success) {
        setState(data.state);
      }
    } catch (err) {
      console.error('Falha ao buscar estado de evolução:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  const handleRunAudit = async () => {
    setIsAuditing(true);
    setAuditReport(null);
    try {
      const res = await fetch('/api/evolution/cycle', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setAuditReport(data.report);
        await fetchState();
      }
    } catch (err) {
      console.error('Falha ao rodar auditoria geral:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleSimulateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    try {
      const res = await fetch('/api/evolution/simulate-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgentId,
          taskTitle: simTaskTitle,
          taskDescription: simTaskDesc,
          executionOutput: simOutput,
          success: simSuccess,
          durationSeconds: simDuration,
          feedbackReceived: simFeedback || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        await fetchState();
        // Reset inputs
        setSimTaskTitle('Simulação de Tarefa do ' + selectedAgentId);
        setSimFeedback('');
      }
    } catch (err) {
      console.error('Falha ao simular tarefa:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleApplyRecommendation = async (recId: string) => {
    try {
      const res = await fetch('/api/evolution/recommendation/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: recId })
      });
      const data = await res.json();
      if (data.success) {
        await fetchState();
      }
    } catch (err) {
      console.error('Falha ao aplicar recomendação:', err);
    }
  };

  const handleRejectRecommendation = async (recId: string) => {
    try {
      const res = await fetch('/api/evolution/recommendation/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: recId })
      });
      const data = await res.json();
      if (data.success) {
        await fetchState();
      }
    } catch (err) {
      console.error('Falha ao rejeitar recomendação:', err);
    }
  };

  const handleFinalizeABTest = async (testId: string, winner?: 'A' | 'B') => {
    try {
      const res = await fetch('/api/evolution/test/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: testId, winner })
      });
      const data = await res.json();
      if (data.success) {
        await fetchState();
      }
    } catch (err) {
      console.error('Falha ao finalizar teste A/B:', err);
    }
  };

  const handleResetAgent = async (agentId: string) => {
    if (!window.confirm(`Tem certeza que deseja resetar os dados de evolução, memórias e estatísticas do agente '${agentId}'?`)) {
      return;
    }
    try {
      const res = await fetch('/api/evolution/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId })
      });
      const data = await res.json();
      if (data.success) {
        await fetchState();
      }
    } catch (err) {
      console.error('Falha ao resetar agente:', err);
    }
  };

  const handleRunQATests = async () => {
    setIsRunningQA(true);
    setQaResults(null);
    try {
      const res = await fetch('/api/tests/evolution');
      const data = await res.json();
      setQaResults(data);
    } catch (err) {
      console.error('Erro na suíte de testes de evolução:', err);
    } finally {
      setIsRunningQA(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 rounded-2xl border border-slate-800 text-xs text-slate-400">
        <RefreshCw className="animate-spin text-indigo-500 w-10 h-10 mb-4" />
        Carregando painel do Evolution Engine...
      </div>
    );
  }

  // Estatísticas consolidadas
  const totalTasks = state ? (Object.values(state.agentMetrics) as AgentMetrics[]).reduce((sum, m) => sum + m.taskCount, 0) : 0;
  const activeTestsCount = state ? state.abTests.filter(t => t.status === 'running').length : 0;
  const pendingRecsCount = state ? state.recommendations.filter(r => r.status === 'pending').length : 0;
  const totalMemoriesCount = state ? (Object.values(state.memories) as AgentMemoryItem[][]).reduce((sum, m) => sum + m.length, 0) : 0;

  return (
    <div className="space-y-6 text-xs dark:text-slate-200">
      
      {/* HEADER CARD */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Cpu size={140} className="text-white animate-pulse" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] inline-flex items-center gap-1 mb-3">
              <Zap size={10} className="fill-indigo-400 animate-bounce" /> Etapa 26 — Conectado
            </span>
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              AI Agent Evolution Engine
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
              O ecossistema que transforma os agentes da plataforma em entidades adaptativas auto-otimizadas. 
              Eles aprendem com feedbacks, conduzem testes A/B de prompts e evoluem de forma controlada através de memória e estratégias persistentes, sem alterar o código-fonte original.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleRunAudit}
              disabled={isAuditing}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold flex items-center gap-2 shadow-lg hover:shadow-indigo-500/10 transition-all cursor-pointer"
            >
              {isAuditing ? (
                <>
                  <RefreshCw className="animate-spin w-4 h-4" />
                  Auditando Agentes...
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4 animate-spin-slow" />
                  Executar Ciclo de Auditoria
                </>
              )}
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/60 text-white">
          <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
            <span className="text-slate-400 font-bold block uppercase text-[9px] tracking-wider mb-1">Total de Execuções catalogadas</span>
            <span className="text-lg font-black font-mono text-indigo-400">{totalTasks}</span>
          </div>
          <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
            <span className="text-slate-400 font-bold block uppercase text-[9px] tracking-wider mb-1">Testes A/B Ativos de Prompt</span>
            <span className="text-lg font-black font-mono text-violet-400">{activeTestsCount}</span>
          </div>
          <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
            <span className="text-slate-400 font-bold block uppercase text-[9px] tracking-wider mb-1">Recomendações Pendentes</span>
            <span className="text-lg font-black font-mono text-emerald-400">{pendingRecsCount}</span>
          </div>
          <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
            <span className="text-slate-400 font-bold block uppercase text-[9px] tracking-wider mb-1">Memórias Registradas</span>
            <span className="text-lg font-black font-mono text-pink-400">{totalMemoriesCount}</span>
          </div>
        </div>
      </div>

      {/* AUDITOR GENERAL REPORT POPUP/EXPANDABLE */}
      <AnimatePresence>
        {auditReport && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-indigo-950/20 border border-indigo-500/30 rounded-2xl p-5 text-indigo-200"
          >
            <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3 mb-3">
              <h4 className="text-xs font-black uppercase flex items-center gap-1.5 text-indigo-400">
                <Award className="w-4 h-4 animate-pulse" /> Relatório Consolidado do Evolution Manager
              </h4>
              <button onClick={() => setAuditReport(null)} className="text-indigo-400 hover:text-indigo-200">
                <X size={14} />
              </button>
            </div>
            <div className="whitespace-pre-wrap leading-relaxed font-mono text-[11px] bg-slate-950/40 p-4 rounded-xl border border-slate-800 max-h-80 overflow-y-auto">
              {auditReport}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUB-TABS NAVIGATION */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-1.5 shadow-sm">
        <button
          onClick={() => setActiveSubTab('agents')}
          className={`flex-1 py-2.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === 'agents' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Cpu size={14} /> Monitor de Agentes & Simulação
        </button>
        <button
          onClick={() => setActiveSubTab('recommendations')}
          className={`flex-1 py-2.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
            activeSubTab === 'recommendations' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Layers size={14} /> Recomendações de Evolução
          {pendingRecsCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('abtests')}
          className={`flex-1 py-2.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === 'abtests' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <TrendingUp size={14} /> Testes A/B de Prompt
        </button>
        <button
          onClick={() => setActiveSubTab('memories')}
          className={`flex-1 py-2.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === 'memories' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Database size={14} /> Memória Persistente
        </button>
        <button
          onClick={() => setActiveSubTab('qa')}
          className={`flex-1 py-2.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === 'qa' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <ClipboardCheck size={14} /> QA Evolution Tests
        </button>
      </div>

      {/* CONTENTS */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: AGENTS MONITOR & SIMULATION */}
        {activeSubTab === 'agents' && state && (
          <motion.div
            key="agents-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* AGENTS LIST GRID */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Cpu size={14} className="text-indigo-500" /> Cockpit de Monitoramento dos Agentes
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(state.agentMetrics).map(([agentId, rawMetrics]) => {
                  const metrics = rawMetrics as AgentMetrics;
                  const isSelected = selectedAgentId === agentId;
                  const scoreColor = metrics.performanceScore >= 95 ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : metrics.performanceScore >= 90 ? 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5' : 'text-rose-500 border-rose-500/20 bg-rose-500/5';
                  return (
                    <div
                      key={agentId}
                      onClick={() => setSelectedAgentId(agentId)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-indigo-500/10 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md' 
                          : 'bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[10.5px]">
                              {agentId.replace(/_/g, ' ')}
                            </h4>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Metas adaptativas ativas</span>
                          </div>
                          <span className={`text-[11px] font-black font-mono border px-2.5 py-1 rounded-lg ${scoreColor}`}>
                            {metrics.performanceScore}%
                          </span>
                        </div>

                        {/* MINI-METRICS BARS */}
                        <div className="space-y-2 mt-4 text-[10px]">
                          <div>
                            <div className="flex justify-between text-slate-400 font-bold mb-1 uppercase text-[8px]">
                              <span>Precisão e Qualidade</span>
                              <span>{metrics.precision}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${metrics.precision}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-slate-400 font-bold mb-1 uppercase text-[8px]">
                              <span>Eficiência Operacional</span>
                              <span>{metrics.efficiency}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${metrics.efficiency}%` }} />
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 text-[9px] font-mono">
                            <span>Execuções: <b className="text-slate-800 dark:text-white">{metrics.taskCount}</b></span>
                            <span>Tempo Médio: <b className="text-slate-800 dark:text-white">{metrics.avgResponseTime}s</b></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResetAgent(agentId);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                          title="Resetar dados do agente"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* INTERACTIVE SIMULATOR CARD */}
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-150 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Play size={14} className="text-indigo-500 fill-indigo-500 animate-pulse" />
                  Motor de Aprendizado Autônomo
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">
                  Invoque o <b>Learning Engine</b> registrando uma tarefa operacional executada pelo agente ativo <b>{selectedAgentId.toUpperCase()}</b>.
                </p>
              </div>

              <form onSubmit={handleSimulateTask} className="space-y-4 text-[10px]">
                <div>
                  <label className="block text-slate-500 font-bold mb-1 uppercase text-[8px]">Título da Tarefa Operacional</label>
                  <input
                    type="text"
                    required
                    value={simTaskTitle}
                    onChange={(e) => setSimTaskTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg dark:text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1 uppercase text-[8px]">Tempo Execução (s)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={120}
                      value={simDuration}
                      onChange={(e) => setSimDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1 uppercase text-[8px]">Status de Saída</label>
                    <select
                      value={simSuccess ? 'true' : 'false'}
                      onChange={(e) => setSimSuccess(e.target.value === 'true')}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg dark:text-white"
                    >
                      <option value="true">Sucesso</option>
                      <option value="false">Falha</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1 uppercase text-[8px]">Texto de Saída/Entrega</label>
                  <textarea
                    required
                    rows={3}
                    value={simOutput}
                    onChange={(e) => setSimOutput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg dark:text-white focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1 uppercase text-[8px]">Feedback Adicional / Variantes (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: Ótimo tom de voz; Variante B testada."
                    value={simFeedback}
                    onChange={(e) => setSimFeedback(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSimulating}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold uppercase tracking-wider shadow cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  {isSimulating ? (
                    <>
                      <RefreshCw className="animate-spin w-3.5 h-3.5" />
                      Processando Aprendizado...
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} />
                      Disparar Learning Cycle
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* TAB 2: RECOMMENDATIONS */}
        {activeSubTab === 'recommendations' && state && (
          <motion.div
            key="recs-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <h3 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Layers size={14} className="text-indigo-500" /> Propostas de Evolução Controlada
            </h3>

            {state.recommendations.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl text-slate-400">
                <Info className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                Nenhuma recomendação gerada ainda. Execute um ciclo de auditoria.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {state.recommendations.map((rec) => {
                  const badgeColor = rec.status === 'applied' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : rec.status === 'rejected' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20';
                  return (
                    <div key={rec.id} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-indigo-400 block mb-0.5">Agente {rec.agentId.toUpperCase()}</span>
                            <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] leading-snug">
                              {rec.title}
                            </h4>
                          </div>
                          <span className={`text-[9px] font-bold border px-2 py-0.5 rounded-full ${badgeColor}`}>
                            {rec.status.toUpperCase()}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                          {rec.description}
                        </p>

                        {/* MUTATION PREVIEW */}
                        {rec.actionableChange && (
                          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-150 dark:border-slate-800 font-mono text-[10px] text-slate-600 dark:text-slate-300 leading-snug">
                            <div className="text-slate-400 font-bold mb-1 text-[8px] uppercase tracking-wider">Alteração Tática Planejada:</div>
                            {rec.actionableChange.promptSuffix && (
                              <div className="whitespace-pre-wrap"><b className="text-indigo-400">[Prompt Suffix]:</b> "{rec.actionableChange.promptSuffix}"</div>
                            )}
                            {rec.actionableChange.temperature !== undefined && (
                              <div><b className="text-emerald-400">[Temp]:</b> {rec.actionableChange.temperature}</div>
                            )}
                          </div>
                        )}
                      </div>

                      {rec.status === 'pending' && (
                        <div className="flex justify-end gap-2.5 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => handleRejectRecommendation(rec.id)}
                            className="px-3.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-500/20 hover:bg-rose-500/5 text-rose-500 font-bold transition-all cursor-pointer"
                          >
                            Rejeitar
                          </button>
                          <button
                            onClick={() => handleApplyRecommendation(rec.id)}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow transition-all cursor-pointer"
                          >
                            Aprovar & Aplicar
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 3: A/B TESTING */}
        {activeSubTab === 'abtests' && state && (
          <motion.div
            key="abtests-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <h3 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <TrendingUp size={14} className="text-indigo-500" /> Testes A/B de Prompt & Comportamento
            </h3>

            {state.abTests.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl text-slate-400">
                <Info className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                Nenhum teste A/B cadastrado no momento.
              </div>
            ) : (
              <div className="space-y-5">
                {state.abTests.map((test) => {
                  const isWinnerA = test.variantAMetrics.score >= test.variantBMetrics.score;
                  const winningText = isWinnerA ? 'A (Mais Estável)' : 'B (Altamente Adaptável)';
                  return (
                    <div key={test.id} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-3 mb-4">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-indigo-400 block mb-0.5">Agente {test.agentId.toUpperCase()}</span>
                          <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                            {test.title}
                          </h4>
                        </div>
                        <span className={`text-[9px] font-bold border px-2.5 py-1 rounded-full ${test.status === 'completed' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 animate-pulse'}`}>
                          {test.status === 'completed' ? 'CONCLUÍDO' : 'RODANDO 50/50'}
                        </span>
                      </div>

                      {/* SIDE BY SIDE METRICS */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* VARIANTE A */}
                        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-800/80 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-md font-extrabold text-[9px]">VARIANTE A (Baseline)</span>
                            <span className="font-black text-slate-700 dark:text-slate-300">{test.variantAMetrics.score}% Score</span>
                          </div>
                          <p className="text-[10px] text-slate-500 italic">
                            "{test.variantA.promptSuffix}"
                          </p>
                          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[9px] font-mono">
                            <div>Execuções: <b>{test.variantAMetrics.count}</b></div>
                            <div>Taxa Sucesso: <b>{test.variantAMetrics.successRate}%</b></div>
                            <div>Velocidade: <b>{test.variantAMetrics.avgTime}s</b></div>
                          </div>
                        </div>

                        {/* VARIANTE B */}
                        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-800/80 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="bg-violet-500/10 text-violet-400 px-2.5 py-0.5 rounded-md font-extrabold text-[9px]">VARIANTE B (Evoluída)</span>
                            <span className="font-black text-slate-700 dark:text-slate-300">{test.variantBMetrics.score}% Score</span>
                          </div>
                          <p className="text-[10px] text-slate-500 italic">
                            "{test.variantB.promptSuffix}"
                          </p>
                          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[9px] font-mono">
                            <div>Execuções: <b>{test.variantBMetrics.count}</b></div>
                            <div>Taxa Sucesso: <b>{test.variantBMetrics.successRate}%</b></div>
                            <div>Velocidade: <b>{test.variantBMetrics.avgTime}s</b></div>
                          </div>
                        </div>
                      </div>

                      {test.status === 'running' && (
                        <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                          <div className="text-[10px] text-slate-400">
                            Projeção atual indica superioridade da <b>Variante {winningText}</b>.
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleFinalizeABTest(test.id, 'A')}
                              className="px-3.5 py-1.5 rounded-lg border border-slate-250 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                            >
                              Forçar Vencedor A
                            </button>
                            <button
                              onClick={() => handleFinalizeABTest(test.id, 'B')}
                              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow cursor-pointer"
                            >
                              Declarar Vencedor B
                            </button>
                          </div>
                        </div>
                      )}

                      {test.status === 'completed' && (
                        <div className="flex items-center justify-start gap-2 mt-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                          <Check className="text-emerald-500 w-4 h-4" />
                          Teste A/B finalizado. Variante vencedora <b>{test.winner}</b> aplicada integralmente ao comportamento padrão.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 4: MEMORIES */}
        {activeSubTab === 'memories' && state && (
          <motion.div
            key="memories-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4 animate-fade-in"
          >
            <h3 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Database size={14} className="text-indigo-500" /> Registro de Aprendizados na Memória Episódica
            </h3>

            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-4 shadow-sm max-h-[500px] overflow-y-auto space-y-3">
              {(Object.values(state.memories) as AgentMemoryItem[][]).flat().length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  Nenhuma recordação ou lição aprendida catalogada.
                </div>
              ) : (
                Object.entries(state.memories).map(([agentId, rawList]) => {
                  const list = rawList as AgentMemoryItem[];
                  if (list.length === 0) return null;
                  return (
                    <div key={agentId} className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase text-indigo-400 border-b border-slate-100 dark:border-slate-800/80 pb-1 mt-2">
                        {agentId.toUpperCase()}
                      </h4>
                      <div className="space-y-2">
                        {list.map((m) => {
                          const isSucc = m.result === 'success';
                          return (
                            <div key={m.id} className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-150 dark:border-slate-850 flex items-start justify-between gap-3 text-[10px] leading-relaxed">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-slate-900 dark:text-white">"{m.taskTitle}"</span>
                                  <span className={`text-[8px] font-bold border px-1.5 py-0.5 rounded ${isSucc ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                                    {m.result.toUpperCase()}
                                  </span>
                                </div>
                                <div className="text-slate-400 italic">Estratégia: {m.strategyUsed}</div>
                                {m.bestPracticeLearned && (
                                  <div className="text-emerald-500 mt-1 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10"><b className="font-extrabold">[Auto-Aprendizado]:</b> {m.bestPracticeLearned}</div>
                                )}
                                {m.failureReason && (
                                  <div className="text-rose-500 mt-1 bg-rose-500/5 p-2 rounded-lg border border-rose-500/10"><b className="font-extrabold">[Motivo da Falha]:</b> {m.failureReason}</div>
                                )}
                              </div>
                              <span className="text-[9px] text-slate-400 font-mono shrink-0">
                                {new Date(m.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 5: QA TESTS */}
        {activeSubTab === 'qa' && (
          <motion.div
            key="qa-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <ClipboardCheck size={15} className="text-indigo-500" />
                  Suíte de Testes Automatizados QA de Evolução
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 max-w-xl">
                  Roda a cobertura de testes lógicos no backend, validando a integridade de todas as engines (Performance snap, persistência de memórias, refinamento A/B, geração com Gemini e injeção controlada de prompts).
                </p>
              </div>
              <button
                onClick={handleRunQATests}
                disabled={isRunningQA}
                className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold uppercase tracking-wider flex items-center gap-1.5 shadow hover:shadow-indigo-500/10 cursor-pointer text-[10px]"
              >
                {isRunningQA ? (
                  <>
                    <RefreshCw className="animate-spin w-4 h-4" />
                    Rodando QA...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Executar Testes QA
                  </>
                )}
              </button>
            </div>

            {/* QA RESULTS */}
            {qaResults && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-3">
                  <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[10.5px]">Resultados das Asserções</h4>
                  <div className="flex items-center gap-3 font-mono text-[10.5px]">
                    <span className="text-emerald-500">Passaram: <b>{qaResults.passed}</b></span>
                    <span className="text-rose-500">Falharam: <b>{qaResults.failed}</b></span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {qaResults.results.map((r, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border flex items-start gap-3 text-[10px] leading-relaxed transition-all ${
                        r.success 
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-800 dark:text-emerald-300' 
                          : 'bg-rose-500/5 border-rose-500/20 text-rose-800 dark:text-rose-300'
                      }`}
                    >
                      {r.success ? (
                        <Check className="text-emerald-500 shrink-0 w-4 h-4 mt-0.5" />
                      ) : (
                        <X className="text-rose-500 shrink-0 w-4 h-4 mt-0.5" />
                      )}
                      <div>
                        <div className="font-extrabold">{r.name}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">{r.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER TERMINAL LOGS */}
      {state && state.logs && (
        <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 shadow-lg text-slate-300 font-mono text-[10px] space-y-2">
          <div className="flex items-center gap-1.5 text-[9px] text-indigo-400 uppercase tracking-widest font-bold border-b border-slate-850 pb-2">
            <Terminal size={12} className="text-indigo-400" />
            Terminal de Logs de Auditoria e Otimização
          </div>
          <div className="max-h-24 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
            {state.logs.slice(-15).reverse().map((log, i) => (
              <div key={i} className="leading-relaxed whitespace-pre-wrap">{log}</div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
