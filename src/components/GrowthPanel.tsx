import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Users, 
  Percent, 
  Zap, 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  ArrowRight, 
  ShieldCheck, 
  Compass, 
  Sparkles, 
  Eye, 
  Activity, 
  Settings,
  AlertCircle
} from 'lucide-react';
import { GlobalGrowthState } from '../growth/growthEngine';
import { GrowthMetrics } from '../growth/growthMetrics';

interface GrowthPanelProps {
  jwtToken?: string | null;
  onRefreshState?: () => void;
}

export const GrowthPanel: React.FC<GrowthPanelProps> = ({ jwtToken, onRefreshState }) => {
  const [telemetry, setTelemetry] = useState<GlobalGrowthState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // AI Audit State
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<{
    auditSummary: string;
    strategicPlanProposals: string[];
    suggestedAction: string;
  } | null>(null);

  // Load telemetry data on mount
  useEffect(() => {
    fetchTelemetry();
  }, []);

  const fetchTelemetry = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/growth/telemetry');
      if (!response.ok) {
        throw new Error('Falha ao conectar ao servidor de Growth.');
      }
      const data = await response.json();
      if (data.success) {
        setTelemetry(data.telemetry);
      } else {
        throw new Error(data.error || 'Falha ao recuperar telemetria.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyRecommendation = async (id: string) => {
    try {
      const response = await fetch('/api/growth/apply-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await response.json();
      if (data.success) {
        setTelemetry(data.updatedState);
        if (onRefreshState) onRefreshState();
      }
    } catch (err) {
      console.error('Erro ao aplicar recomendação:', err);
    }
  };

  const handleApprovePlan = async (planId: string) => {
    try {
      const response = await fetch('/api/growth/approve-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      });
      const data = await response.json();
      if (data.success) {
        setTelemetry(data.updatedState);
        if (onRefreshState) onRefreshState();
      }
    } catch (err) {
      console.error('Erro ao aprovar plano de ação:', err);
    }
  };

  const handleUpdateAgentStrategyStatus = async (agentId: string, status: 'applied' | 'rejected') => {
    try {
      const response = await fetch('/api/growth/update-agent-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, status })
      });
      const data = await response.json();
      if (data.success) {
        setTelemetry(data.updatedState);
        if (onRefreshState) onRefreshState();
      }
    } catch (err) {
      console.error('Erro ao atualizar estratégia do agente:', err);
    }
  };

  const handleTriggerAIAudit = async () => {
    setIsAuditing(true);
    setAuditResult(null);
    try {
      const response = await fetch('/api/growth/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        setAuditResult(data.result);
      }
    } catch (err) {
      console.error('Erro ao realizar auditoria por IA:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  if (isLoading && !telemetry) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Carregando telemetria de escala e crescimento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
          <AlertCircle size={18} />
          <h4 className="font-bold text-sm">Falha no Growth Engine</h4>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
        <button 
          onClick={fetchTelemetry}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const {
    metrics,
    historicalMetrics,
    opportunities,
    strategySuggestions,
    forecasts,
    recommendations,
    actionPlans,
    overallGrowthScore
  } = telemetry!;

  // Render a lovely custom SVG Sparkline chart
  const renderSparkline = (points: number[], width = 180, height = 50) => {
    if (!points || points.length < 2) return null;
    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = max - min || 1;
    
    const coordinates = points.map((p, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * (height - 8) - 4;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke="url(#sparkGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coordinates}
        />
        <defs>
          <linearGradient id="sparkGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100" id="growth-center-wrapper">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold uppercase tracking-wider border border-indigo-500/20">
            Módulo Autônomo Ativo (Etapa 29)
          </span>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
            <TrendingUp className="text-indigo-500 w-6 h-6 animate-pulse" />
            Autonomous Growth Loop
          </h2>
          <p className="text-xs text-slate-400">
            Mapeamento contínuo de gargalos, projeções preditivas de faturamento e recomendações direcionadas para múltiplos agentes de IA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTelemetry}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-700"
          >
            <RefreshCw size={14} className="text-slate-500" /> Sincronizar
          </button>

          <button
            onClick={handleTriggerAIAudit}
            disabled={isAuditing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md transition-all disabled:opacity-50"
          >
            <Brain size={14} className="animate-pulse" />
            {isAuditing ? 'Analisando Operação...' : 'Auditoria por IA (Agent)'}
          </button>
        </div>
      </div>

      {/* Interactive AI Audit Terminal Output */}
      <AnimatePresence>
        {auditResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 rounded-2xl bg-slate-950 text-slate-200 border border-indigo-500/30 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
                    <Brain size={16} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-white">GROWTH MANAGER AGENT AUDIT</h4>
                    <span className="text-[9px] font-mono text-slate-400 uppercase">Estrategista de Growth & Escala</span>
                  </div>
                </div>
                <button
                  onClick={() => setAuditResult(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Fechar
                </button>
              </div>

              <div className="space-y-3.5 text-xs leading-relaxed">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Sumário de Desempenho Operacional:</span>
                  <p className="font-mono text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-900">
                    {auditResult.auditSummary}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Planos e Propostas Estratégicas:</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {auditResult.strategicPlanProposals.map((proposal, index) => (
                      <div 
                        key={index}
                        className="p-3 rounded-xl bg-slate-900/40 border border-slate-900 flex items-start gap-2.5"
                      >
                        <span className="text-xs font-bold text-indigo-400">0{index + 1}.</span>
                        <p className="font-mono text-slate-300 text-[11px] leading-relaxed">{proposal}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-indigo-950/40 border border-indigo-500/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-violet-400 w-4 h-4 animate-bounce" />
                    <span className="text-[11px] font-mono text-indigo-300">
                      <strong>Recomendação Principal:</strong> {auditResult.suggestedAction}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-[9px] font-mono font-bold uppercase">
                    Aprovado por Agente
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Level Core Growth Analytics Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Growth Score Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950 to-indigo-900 text-white space-y-3.5 border border-indigo-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Growth Score Geral</span>
            <Activity className="text-indigo-400 w-4 h-4 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black">{overallGrowthScore}</span>
            <span className="text-xs text-indigo-300 font-bold">/100</span>
          </div>
          <div className="space-y-1">
            <div className="w-full bg-indigo-900/60 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-pink-500 h-full rounded-full" 
                style={{ width: `${overallGrowthScore}%` }}
              />
            </div>
            <p className="text-[10px] text-indigo-200">
              Operação de tráfego com LTV/CAC e margens líquidas excelentes.
            </p>
          </div>
        </div>

        {/* Sales & Revenue Card */}
        <div className="p-5 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Faturamento Consolidado</span>
            <DollarSign size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-emerald-500 font-bold flex items-center gap-0.5">
              +15.4% <TrendingUp size={10} />
            </span>
            <span className="text-slate-400">Lucro: R$ {metrics.profit.toLocaleString()} ({metrics.margin}% margem)</span>
          </div>
        </div>

        {/* CAC & LTV Health Card */}
        <div className="p-5 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Saúde LTV : CAC</span>
            <Target size={16} className="text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {(metrics.ltv / metrics.cac).toFixed(1)}x
            </span>
            <span className="text-[10px] text-slate-400 font-bold">LTV/CAC</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">LTV: R$ {metrics.ltv}</span>
            <span className="text-slate-400">CAC: R$ {metrics.cac}</span>
          </div>
        </div>

        {/* Churn & Retention Card */}
        <div className="p-5 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Retenção de Clientes</span>
            <Users size={16} className="text-violet-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics.retentionRate}%
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Churn Rate: {metrics.churnRate}%</span>
            <span className="text-emerald-500 font-bold">Meta Bateu</span>
          </div>
        </div>
      </div>

      {/* Main split sections: Opportunities and Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Opportunity Scanner Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="text-indigo-500 w-4 h-4" />
                Opportunity Engine Scanner
              </h3>
              <p className="text-[11px] text-slate-400">Lista ordenada de anomalias, picos ou novos nichos prioritários para escala.</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-400 font-mono font-bold uppercase">
              {opportunities.length} Sugeridos
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opportunities.map((opp) => (
              <div 
                key={opp.id}
                className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-3 hover:border-indigo-500/20 transition-all shadow-sm"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                      opp.potentialImpact === 'high' 
                        ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      Impacto {opp.potentialImpact === 'high' ? 'Alto' : 'Médio'}
                    </span>
                    <span className="text-xs font-black text-indigo-500 font-mono">
                      {opp.opportunityScore} Pts
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-snug">
                    {opp.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal">
                    {opp.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-50 dark:border-slate-850 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Responsável: <strong className="text-slate-300">{opp.targetAgent}</strong></span>
                  <span className="text-emerald-500 font-bold font-mono">Est. Ganho: +R$ {opp.estimatedGain.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Forecasting & Historic Charts Block */}
        <div className="p-5 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <TrendingUp className="text-indigo-500 w-4 h-4" />
              Projeções de Crescimento
            </h3>
            <p className="text-[11px] text-slate-400">Projeção matemática para os próximos 6 meses baseada no LTV : CAC.</p>
          </div>

          <div className="py-2 flex items-center justify-center">
            {/* Display historical revenue sparkline */}
            <div className="space-y-2 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Tendência Histórica</span>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
                {renderSparkline(historicalMetrics.map(h => h.metrics.revenue))}
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>{historicalMetrics[0]?.timestamp || 'Início'}</span>
                <span>Faturamento Global</span>
                <span>{historicalMetrics[historicalMetrics.length - 1]?.timestamp || 'Atual'}</span>
              </div>
            </div>
          </div>

          {/* List of months projected forecasts */}
          <div className="space-y-2.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block pb-1 border-b border-slate-100 dark:border-slate-800">
              Próximos 6 Meses (Estimativas)
            </span>
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
              {forecasts.map((forecast, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between text-[11px] font-mono p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-950"
                >
                  <span className="text-slate-400">{forecast.month}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[10px]">Realista:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">R$ {Math.round(forecast.realisticRevenue / 1000)}k</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-indigo-400">Oti:</span>
                    <span className="font-bold text-emerald-500">R$ {Math.round(forecast.optimisticRevenue / 1000)}k</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Strategy Coordinator for other agents AND Growth Action Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Strategy Suggestions by Agent */}
        <div className="p-5 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Zap className="text-indigo-500 w-4 h-4" />
              Strategy Coordinator (Agentes)
            </h3>
            <p className="text-[11px] text-slate-400">Recomendações técnicas distribuídas e aguardando aprovação para os agentes de IA.</p>
          </div>

          <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1.5">
            {strategySuggestions.map((sug) => (
              <div 
                key={sug.agentId}
                className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{sug.agentName}</h4>
                    <span className="text-[10px] text-indigo-500 font-semibold">{sug.role}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                    sug.status === 'applied' 
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' 
                      : sug.status === 'rejected'
                      ? 'bg-rose-100 text-rose-600'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                  }`}>
                    {sug.status === 'applied' ? 'Aplicado' : sug.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                  </span>
                </div>

                <p className="text-slate-400 leading-normal text-[11px]">
                  <strong>Diretriz de Growth:</strong> {sug.remedy}
                </p>

                <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-400">Impacto Estimado: <strong className="text-slate-300">{sug.expectedMetricImpact}</strong></span>
                  
                  {sug.status === 'pending' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleUpdateAgentStrategyStatus(sug.agentId, 'rejected')}
                        className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold"
                      >
                        Recusar
                      </button>
                      <button
                        onClick={() => handleUpdateAgentStrategyStatus(sug.agentId, 'applied')}
                        className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                      >
                        Aplicar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Plans and Core Recommendations */}
        <div className="space-y-6">
          
          {/* Action Plans block */}
          <div className="p-5 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle className="text-indigo-500 w-4 h-4" />
                Planos de Ação Operacionais
              </h3>
              <p className="text-[11px] text-slate-400">Roteiro estratégico de tarefas com prazos e executores designados.</p>
            </div>

            <div className="space-y-4">
              {actionPlans.map((plan) => (
                <div 
                  key={plan.id}
                  className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{plan.title}</h4>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                      plan.status === 'active' 
                        ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' 
                        : plan.status === 'completed'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                    }`}>
                      {plan.status === 'active' ? 'Em Progresso' : plan.status === 'completed' ? 'Completo' : 'Rascunho'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-normal">{plan.description}</p>

                  {/* Steps tracker */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Etapas Operacionais:</span>
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {plan.steps.map((step) => (
                        <div 
                          key={step.id}
                          className="flex items-center justify-between text-[11px] bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-850"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              step.status === 'completed' ? 'bg-emerald-500' : step.status === 'running' ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'
                            }`} />
                            <span className="text-slate-400 dark:text-slate-300 font-medium">{step.title}</span>
                          </div>
                          <span className="text-[10px] text-indigo-400 font-mono font-bold">{step.assignedAgent}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {plan.status === 'draft' && (
                    <button
                      onClick={() => handleApprovePlan(plan.id)}
                      className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                    >
                      Aprovar & Iniciar Execução Autônoma
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Growth Recommendations */}
          <div className="p-5 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Compass className="text-indigo-500 w-4 h-4" />
                Centro de Recomendações Rápidas
              </h3>
              <p className="text-[11px] text-slate-400">Micro-otimizações prontas para aplicação sem custos ou complexidade.</p>
            </div>

            <div className="space-y-3.5">
              {recommendations.filter(r => r.status === 'pending').slice(0, 2).map((rec) => (
                <div 
                  key={rec.id}
                  className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-xs text-indigo-500 leading-snug">{rec.title}</h4>
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-400">
                      {rec.difficulty === 'easy' ? 'Fácil' : 'Médio'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-normal">{rec.description}</p>

                  <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Impacto Esperado: <strong className="text-indigo-400">{rec.impactScore}/10</strong></span>
                    <button
                      onClick={() => handleApplyRecommendation(rec.id)}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg"
                    >
                      Executar Automação
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
