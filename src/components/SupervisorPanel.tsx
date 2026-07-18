import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Activity, 
  Zap, 
  Cpu, 
  Database, 
  Server, 
  Play, 
  Pause, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  ListOrdered, 
  Terminal, 
  ShieldAlert,
  Send,
  Sliders,
  Check,
  XCircle,
  HelpCircle,
  Loader2,
  Lock,
  Heart
} from 'lucide-react';

export const SupervisorPanel: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/supervisor/dashboard');
      if (!res.ok) throw new Error('Falha ao buscar dados do Supervisor.');
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados operacionais.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (action: string, agentId?: string) => {
    setSubmitting(action + (agentId || ''));
    try {
      const res = await fetch(`/api/supervisor/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, user: 'COO Administrator' })
      });
      if (res.ok) {
        await fetchDashboardData();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Falha ao executar ação.');
      }
    } catch (err: any) {
      alert('Erro de conexão ao executar ação.');
    } finally {
      setSubmitting(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Carregando painel de controle operacional do COO...</p>
      </div>
    );
  }

  const agentsHealth = data?.agentHealth || [];
  const agentsMetrics = data?.agentMetrics || [];
  const systemAlerts = data?.systemAlerts || [];
  const workflowHistory = data?.workflowHistory || [];
  const operationLogs = data?.operationLogs || [];
  const systemMetrics = data?.systemMetrics?.[data.systemMetrics.length - 1] || {
    cpuUsage: 12.4,
    memoryUsage: 350,
    postgresStatus: 'online',
    geminiApiStatus: 'online',
    serverStatus: 'online',
    restApiStatus: 'online',
    dashboardStatus: 'online'
  };
  const strategicReview = data?.strategicReview || 'Análise em andamento pelas redes neurais...';

  // Contadores de status de agentes
  const counts = {
    total: agentsHealth.length,
    active: agentsHealth.filter((a: any) => a.status === 'running').length,
    idle: agentsHealth.filter((a: any) => a.status === 'idle').length,
    paused: agentsHealth.filter((a: any) => a.status === 'paused').length,
    error: agentsHealth.filter((a: any) => a.status === 'error').length
  };

  return (
    <div className="p-6 space-y-6 text-slate-800 dark:text-slate-100">
      
      {/* Header Operacional */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md">
              <Shield size={20} className="animate-pulse" />
            </span>
            <h1 className="text-xl font-bold tracking-tight">Supervisor Agent (COO - Diretor de Operações)</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitoramento contínuo de heartbeats, balanceamento de cargas, diagnóstico de infraestrutura e orquestração de mitigação de falhas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAction('rebalance')}
            disabled={submitting !== null}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            {submitting === 'rebalance' ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Sliders size={13} />
            )}
            Rebalancear Carga de IA
          </button>
          
          <button
            onClick={() => handleAction('health')}
            disabled={submitting !== null}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 font-semibold text-xs rounded-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            {submitting === 'health' ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Activity size={13} />
            )}
            Health Check Geral
          </button>

          <button
            onClick={() => handleAction('heartbeat')}
            disabled={submitting !== null}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 font-semibold text-xs rounded-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Heart size={13} className="text-rose-500 animate-pulse" /> Force Heartbeat
          </button>
        </div>
      </div>

      {/* Cartões de Status Global */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Agentes Totais</div>
          <div className="text-2xl font-bold">{counts.total}</div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Agentes Ocupados</div>
          <div className="text-2xl font-bold text-indigo-500">{counts.active}</div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Agentes Aguardando</div>
          <div className="text-2xl font-bold text-emerald-500">{counts.idle}</div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Agentes Pausados</div>
          <div className="text-2xl font-bold text-amber-500">{counts.paused}</div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm col-span-2 md:col-span-1">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Agentes com Erro</div>
          <div className="text-2xl font-bold text-rose-500">{counts.error}</div>
        </div>
      </div>

      {/* Grid de Monitoramento em Tempo Real */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Painel Central dos Agentes (2 Colunas no Desktop) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold tracking-tight flex items-center gap-2">
                <Activity size={16} className="text-indigo-500" /> Mapa de Disponibilidade & Heartbeats dos Agentes
              </h2>
              <span className="text-[10px] font-mono px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">
                Polling ativo: 3s
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {agentsHealth.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Nenhum heartbeat recebido ainda. Inicie a fábrica para registrar sinais vitais.
                </div>
              ) : (
                agentsHealth.map((ah: any) => {
                  const metric = agentsMetrics.find((m: any) => m.agentId === ah.id) || {
                    logicalCpu: 0,
                    logicalMemory: 0,
                    tasksExecuted: 0,
                    tasksFailed: 0,
                    averageExecutionTime: 0,
                    taskQueueCount: 0
                  };

                  let statusBadgeColor = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
                  if (ah.status === 'running') statusBadgeColor = "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 animate-pulse";
                  if (ah.status === 'idle') statusBadgeColor = "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
                  if (ah.status === 'paused') statusBadgeColor = "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
                  if (ah.status === 'error') statusBadgeColor = "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-bounce";

                  const uptimePct = ah.uptime + ah.downtime > 0 
                    ? ((ah.uptime / (ah.uptime + ah.downtime)) * 100).toFixed(1) 
                    : "100";

                  return (
                    <div key={ah.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs uppercase tracking-wider">{ah.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusBadgeColor}`}>
                            {ah.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                          Último Heartbeat: {new Date(ah.lastHeartbeat).toLocaleTimeString('pt-BR')} | Uptime: {uptimePct}%
                        </p>
                        
                        {/* Métricas do Agente */}
                        <div className="grid grid-cols-4 gap-2 pt-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          <div>
                            <span className="block text-slate-400">CPU</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{metric.logicalCpu}%</span>
                          </div>
                          <div>
                            <span className="block text-slate-400">Memória</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{metric.logicalMemory}MB</span>
                          </div>
                          <div>
                            <span className="block text-slate-400">Sucessos</span>
                            <span className="font-bold text-emerald-500">{metric.tasksExecuted}</span>
                          </div>
                          <div>
                            <span className="block text-slate-400">Falhas</span>
                            <span className="font-bold text-rose-500">{metric.tasksFailed}</span>
                          </div>
                        </div>
                      </div>

                      {/* Ações Administrativas de COO */}
                      <div className="flex items-center gap-1.5 self-end md:self-center">
                        {ah.status !== 'paused' ? (
                          <button
                            onClick={() => handleAction('pause', ah.id)}
                            disabled={submitting !== null}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 hover:text-rose-500 transition-all cursor-pointer"
                            title="Pausar Agente"
                          >
                            <Pause size={12} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAction('resume', ah.id)}
                            disabled={submitting !== null}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 rounded text-emerald-600 dark:text-emerald-400 transition-all cursor-pointer"
                            title="Retomar Agente"
                          >
                            <Play size={12} />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleAction('restart', ah.id)}
                          disabled={submitting !== null}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 hover:text-indigo-500 transition-all cursor-pointer"
                          title="Reiniciar Agente"
                        >
                          <RefreshCw size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Seção do Parecer Estratégico da IA (COO Decision Advisor) */}
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-xl shadow-md p-5 border border-indigo-500/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="p-1 bg-indigo-500/25 rounded">
                <Zap size={14} className="text-indigo-300" />
              </span>
              <h3 className="text-xs font-bold tracking-wide uppercase text-indigo-300">Parecer Operacional Inteligente (COO Advisor)</h3>
            </div>
            
            <div className="text-xs leading-relaxed space-y-2 font-sans opacity-95">
              {strategicReview.split('\n').map((line: string, i: number) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Barra Lateral: Alertas Ativos & Health Check Checklist */}
        <div className="space-y-6">
          
          {/* Status da Infraestrutura */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-bold tracking-tight mb-4 flex items-center gap-2">
              <Server size={16} className="text-indigo-500" /> Auditoria de Integridade
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="flex items-center gap-1 text-slate-500">
                  <Database size={12} /> Postgres (Cloud SQL)
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  systemMetrics.postgresStatus === 'online' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}>
                  {systemMetrics.postgresStatus === 'online' ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="flex items-center gap-1 text-slate-500">
                  <Cpu size={12} /> Gemini AI Hub
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  systemMetrics.geminiApiStatus === 'online' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}>
                  {systemMetrics.geminiApiStatus === 'online' ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="flex items-center gap-1 text-slate-500">
                  <Server size={12} /> REST APIs Gateway
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  ACTIVE
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono pb-1">
                <span className="flex items-center gap-1 text-slate-500">
                  <Terminal size={12} /> CPU Operacional Lógica
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {systemMetrics.cpuUsage}%
                </span>
              </div>
            </div>
          </div>

          {/* Triagem de Alertas do Sistema */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold tracking-tight flex items-center gap-2">
                <ShieldAlert size={16} className="text-rose-500 animate-pulse" /> Alertas Operacionais Críticos
              </h2>
              <span className="text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300 px-2 py-0.5 rounded-full">
                {systemAlerts.filter((a: any) => a.repaired === 0).length}
              </span>
            </div>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {systemAlerts.filter((a: any) => a.repaired === 0).length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                  <CheckCircle size={24} className="text-emerald-500" />
                  <span>Todos os sistemas em perfeita conformidade.</span>
                </div>
              ) : (
                systemAlerts.filter((a: any) => a.repaired === 0).map((alert: any) => (
                  <div key={alert.id} className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-lg space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase">
                      <span className="text-rose-600 dark:text-rose-400">{alert.severity}</span>
                      <span className="text-slate-400">{new Date(alert.timestamp).toLocaleTimeString('pt-BR')}</span>
                    </div>
                    <p className="text-xs font-semibold">{alert.reason}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      Origem: {alert.origin}
                    </p>
                    <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold italic pt-1">
                      Ação COO: {alert.actionSuggested}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Logs Auditáveis de Operação */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-bold tracking-tight mb-4 flex items-center gap-2">
              <Terminal size={16} className="text-indigo-500" /> Audit Trail (Logs de Operação)
            </h2>

            <div className="space-y-2 max-h-[200px] overflow-y-auto font-mono text-[10px] text-slate-500 dark:text-slate-400 leading-normal pr-1">
              {operationLogs.length === 0 ? (
                <div className="py-4 text-center text-slate-400">Nenhuma ação administrativa auditada ainda.</div>
              ) : (
                [...operationLogs].reverse().map((log: any) => (
                  <div key={log.id} className="border-b border-slate-50/50 dark:border-slate-800 pb-1.5">
                    <span className="text-indigo-500 font-semibold">[{new Date(log.timestamp).toLocaleTimeString('pt-BR')}]</span>{' '}
                    <span className="text-slate-800 dark:text-slate-200 font-bold uppercase">({log.action})</span>{' '}
                    <span>{log.details}</span> <span className="text-slate-400 italic">by {log.user}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
