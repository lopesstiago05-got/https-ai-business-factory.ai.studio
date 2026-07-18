import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Activity,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Terminal,
  Clock,
  Eye,
  FileText,
  Search,
  Filter,
  XCircle,
  Zap,
  UserCheck,
  TrendingUp,
  Cpu,
  Flame,
  Check,
  Award,
  Lock,
  ChevronRight,
  Database,
  Sliders,
  Sparkles,
  RefreshCcw,
  BookOpen
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

import {
  AgentHealth,
  AuditLog,
  SecurityThreatAlert,
  AIIncident,
  ComplianceScore,
  PlatformMetrics
} from '../enterprise/enterpriseTypes.ts';

interface EnterpriseOperationsCenterProps {
  jwtToken?: string;
  onRefreshState?: () => void;
}

export const EnterpriseOperationsCenter: React.FC<EnterpriseOperationsCenterProps> = ({ jwtToken, onRefreshState }) => {
  const [activeTab, setActiveTab] = useState<'monitoring' | 'audit' | 'security' | 'incidents' | 'supervisor' | 'compliance'>('monitoring');
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // States from API
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [agentsHealth, setAgentsHealth] = useState<AgentHealth[]>([]);
  const [alerts, setAlerts] = useState<SecurityThreatAlert[]>([]);
  const [incidents, setIncidents] = useState<AIIncident[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [complianceReport, setComplianceReport] = useState<any>(null);
  const [supervisorSuggestions, setSupervisorSuggestions] = useState<any[]>([]);

  // Filter States for Audit Logs
  const [filterTenant, setFilterTenant] = useState<string>('');
  const [filterEmail, setFilterEmail] = useState<string>('');
  const [filterAction, setFilterAction] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');

  // Compliance state
  const [retentionDays, setRetentionDays] = useState<number>(90);
  const [viewReportModal, setViewReportModal] = useState<boolean>(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs();
    } else if (activeTab === 'compliance') {
      fetchCompliance();
    } else if (activeTab === 'supervisor') {
      fetchSupervisorSuggestions();
    }
  }, [activeTab]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // Fetch platform metrics & alerts & incidents
      const res = await fetch('/api/enterprise/status');
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
        setAlerts(data.alerts || []);
        setIncidents(data.incidents || []);
      }

      // Fetch agents health
      const healthRes = await fetch('/api/enterprise/agents-health');
      const healthData = await healthRes.json();
      if (healthData.success) {
        setAgentsHealth(healthData.health || []);
      }
    } catch (err) {
      console.error('Erro ao carregar dados operacionais:', err);
      showToast('error', 'Erro ao carregar central de operações.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setActionLoading(true);
      let query = `?tenantId=${encodeURIComponent(filterTenant)}&userEmail=${encodeURIComponent(filterEmail)}&action=${encodeURIComponent(filterAction)}&dateFrom=${encodeURIComponent(filterDate)}`;
      const res = await fetch(`/api/enterprise/audit-logs${query}`);
      const data = await res.json();
      if (data.success) {
        setAuditLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Erro ao carregar logs:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const fetchCompliance = async () => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/enterprise/compliance');
      const data = await res.json();
      if (data.success) {
        setComplianceReport(data.report);
        if (data.report?.metrics?.dataRetentionDays) {
          setRetentionDays(data.report.metrics.dataRetentionDays);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar conformidade:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const fetchSupervisorSuggestions = async () => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/enterprise/supervisor/suggestions');
      const data = await res.json();
      if (data.success) {
        setSupervisorSuggestions(data.suggestions || []);
      }
    } catch (err) {
      console.error('Erro ao carregar sugestões:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveIncident = async (id: string) => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/enterprise/incidents/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Incidente ${id} mitigado com sucesso.`);
        await fetchInitialData();
        if (activeTab === 'supervisor') fetchSupervisorSuggestions();
      } else {
        showToast('error', 'Falha ao mitigar incidente.');
      }
    } catch (err) {
      showToast('error', 'Erro na conexão de rede.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDismissAlert = async (id: string) => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/enterprise/alerts/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Ameaça de segurança arquivada.');
        await fetchInitialData();
        if (activeTab === 'supervisor') fetchSupervisorSuggestions();
      } else {
        showToast('error', 'Falha ao dispensar ameaça.');
      }
    } catch (err) {
      showToast('error', 'Erro na conexão de rede.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulateStress = async () => {
    try {
      setActionLoading(true);
      showToast('success', 'Simulando estresse de alta concorrência na infraestrutura...');
      const res = await fetch('/api/enterprise/simulate-stress', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Pico de estresse simulado com sucesso. Alertas de segurança gerados.');
        await fetchInitialData();
        if (activeTab === 'supervisor') fetchSupervisorSuggestions();
      } else {
        showToast('error', 'Falha ao simular carga.');
      }
    } catch (err) {
      showToast('error', 'Erro ao simular estresse.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRunEnterpriseSuiteTests = async () => {
    try {
      setActionLoading(true);
      showToast('success', 'Iniciando testes unitários e de integração de governança...');
      const res = await fetch('/api/tests/enterprise');
      const data = await res.json();
      if (data.success) {
        showToast('success', '✨ Excelente! Todos os 8 testes automatizados de Governança passaram!');
        await fetchInitialData();
      } else {
        showToast('error', `Falha nos testes: ${data.errors?.[0]}`);
      }
    } catch (err) {
      showToast('error', 'Erro ao rodar suite de testes.');
    } finally {
      setActionLoading(false);
    }
  };

  // Charts helper data
  const executionsChartData = agentsHealth.map(a => ({
    name: a.name.split(' ')[0],
    Execuções: a.totalExecutions,
    Erros: a.errorCount,
    Sucesso: Math.round(a.successRate)
  }));

  const geminiCreditsChartData = agentsHealth.map(a => ({
    name: a.name.split(' ')[0],
    Créditos: a.geminiCreditsUsed
  }));

  return (
    <div className="space-y-6" id="enterprise-operations-center-panel">
      {/* SaaS Enterprise Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2.5 py-1 rounded-full font-bold border border-indigo-500/30 flex items-center gap-1.5 uppercase tracking-wider">
                <Shield size={12} /> Enterprise Ops Center
              </span>
              <span className="bg-amber-500/20 text-amber-400 text-xs px-2.5 py-1 rounded-full font-semibold border border-amber-500/30">
                Auditoria e Segurança Ativa
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Governança, Observabilidade & Compliance
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Central corporativa para monitorar integridade lógica de agentes IA, auditar acessos, tratar incidentes automaticamente e inspecionar conformidade.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleSimulateStress}
              disabled={actionLoading}
              className="px-4 py-2 text-xs font-bold bg-amber-600/20 text-amber-300 border border-amber-500/30 hover:bg-amber-600/30 rounded-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Flame size={14} className="text-amber-400 animate-pulse" /> Simular Carga Extrema
            </button>
            <button
              onClick={handleRunEnterpriseSuiteTests}
              disabled={actionLoading}
              className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle size={14} /> Rodar 8 Testes de Governança
            </button>
            <button
              onClick={fetchInitialData}
              disabled={loading || actionLoading}
              className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition-all cursor-pointer"
            >
              <RefreshCw size={16} className={`${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 mt-6 -mx-6 px-6 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('monitoring')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'monitoring'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity size={14} /> Saúde dos Agentes
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'audit'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal size={14} /> Logs de Auditoria
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'security'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock size={14} /> Centro de Segurança ({alerts.filter(a => a.status === 'ACTIVE').length})
          </button>
          <button
            onClick={() => setActiveTab('incidents')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'incidents'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle size={14} /> Incidentes de IA ({incidents.filter(i => i.status === 'OPEN').length})
          </button>
          <button
            onClick={() => setActiveTab('supervisor')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'supervisor'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders size={14} /> Supervisor Auto-Healing
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'compliance'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award size={14} /> Compliance & Relatório
          </button>
        </div>
      </div>

      {/* Toast Alert Feedback */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-xl border flex items-center gap-3 shadow-lg z-50 ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
                : 'bg-rose-950/90 border-rose-800 text-rose-200'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            <p className="text-xs font-semibold">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-900 border border-slate-800 rounded-2xl min-h-[300px]">
          <RefreshCw size={32} className="animate-spin text-indigo-500 mb-3" />
          <p className="text-sm text-slate-400">Processando observabilidade em tempo real do sistema...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">

          {/* TAB 1: SAÚDE DOS AGENTES */}
          {activeTab === 'monitoring' && metrics && (
            <div className="space-y-6">
              {/* Premium telemetry metrics overview cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status Geral</span>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`w-3 h-3 rounded-full animate-pulse ${metrics.overallHealth === 'HEALTHY' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className="text-base font-bold text-white">{metrics.overallHealth}</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Agentes Ativos</span>
                  <span className="text-xl font-bold text-white mt-1">{metrics.activeAgentsCount} <span className="text-xs text-slate-500 font-normal">Online</span></span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Execuções Hoje</span>
                  <span className="text-xl font-bold text-white mt-1">{metrics.totalExecutionsToday} <span className="text-xs text-slate-500 font-normal">Chamadas</span></span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tempo Resposta</span>
                  <span className="text-xl font-bold text-white mt-1">{metrics.averageResponseTime} <span className="text-xs text-slate-500 font-normal">ms</span></span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Taxa de Sucesso</span>
                  <span className="text-xl font-bold text-white mt-1">{metrics.successRateOverall}%</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Incidentes</span>
                  <span className="text-xl font-bold text-white mt-1">{metrics.incidentsActiveCount} <span className="text-xs text-slate-500 font-normal">Abertos</span></span>
                </div>
              </div>

              {/* Graphical performance visualization charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Desempenho Lógico e Volume de Execuções por Agente</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={executionsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                        <YAxis stroke="#64748b" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: 11 }} />
                        <Bar dataKey="Execuções" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Erros" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Consumo da API Gemini por Agente (Créditos Consumidos)</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={geminiCreditsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                        <YAxis stroke="#64748b" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: 11 }} />
                        <Area type="monotone" dataKey="Créditos" stroke="#3b82f6" fill="rgba(59, 130, 246, 0.15)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Complete agents health table list */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">Matriz Operacional e Telemetria de Agentes de IA</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                        <th className="py-3 px-4">Agente</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-center">Execuções</th>
                        <th className="py-3 px-4 text-center">Taxa Sucesso</th>
                        <th className="py-3 px-4 text-center">Média Resposta</th>
                        <th className="py-3 px-4 text-center">Créditos Consumidos</th>
                        <th className="py-3 px-4">Última Chamada</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {agentsHealth.map((agent) => (
                        <tr key={agent.id} className="hover:bg-slate-950/40 transition-all text-slate-300">
                          <td className="py-3.5 px-4 font-bold text-white">{agent.name}</td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                              agent.status === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              agent.status === 'DEGRADED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${agent.status === 'ONLINE' ? 'bg-emerald-400' : agent.status === 'DEGRADED' ? 'bg-amber-400' : 'bg-rose-400'}`} />
                              {agent.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-semibold text-white">{agent.totalExecutions}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`font-bold ${agent.successRate >= 95 ? 'text-emerald-400' : agent.successRate >= 90 ? 'text-amber-400' : 'text-rose-400'}`}>
                              {agent.successRate}%
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center text-slate-400 font-mono">{agent.avgResponseTimeMs} ms</td>
                          <td className="py-3.5 px-4 text-center font-bold text-amber-400 flex items-center justify-center gap-1">
                            <Zap size={11} /> {agent.geminiCreditsUsed}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 text-[10px]">{new Date(agent.lastExecutionAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              {/* Query Filters */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1"><Filter size={10} /> Tenant ID</label>
                  <input
                    type="text"
                    value={filterTenant}
                    onChange={(e) => setFilterTenant(e.target.value)}
                    placeholder="Filtrar por tenant_id..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1"><Filter size={10} /> Usuário Email</label>
                  <input
                    type="text"
                    value={filterEmail}
                    onChange={(e) => setFilterEmail(e.target.value)}
                    placeholder="Filtrar por email..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1"><Filter size={10} /> Tipo de Evento</label>
                  <select
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">TODOS OS EVENTOS</option>
                    <option value="LOGIN">LOGIN</option>
                    <option value="AGENT_EXECUTION">AGENT_EXECUTION</option>
                    <option value="AGENT_INSTALL">AGENT_INSTALL</option>
                    <option value="PLAN_CHANGE">PLAN_CHANGE</option>
                    <option value="USER_PERMISSION_CHANGE">USER_PERMISSION_CHANGE</option>
                    <option value="DATA_ACCESS">DATA_ACCESS</option>
                    <option value="SECURITY_EVENT">SECURITY_EVENT</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1"><Clock size={10} /> Desde Data</label>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={fetchAuditLogs}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Search size={14} /> Filtrar Logs
                  </button>
                </div>
              </div>

              {/* Logs Table */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Terminal size={16} className="text-indigo-400" /> Registro de Atividades e Trilhas de Auditoria ({auditLogs.length})
                  </h3>
                  <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Imutabilidade Lógica</span>
                </div>

                <div className="overflow-x-auto border border-slate-800/80 rounded-xl bg-slate-950">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 font-semibold bg-slate-900/30">
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-4">Tenant</th>
                        <th className="py-3 px-4">Usuário</th>
                        <th className="py-3 px-4">Ação</th>
                        <th className="py-3 px-4">Resultado</th>
                        <th className="py-3 px-4">Endereço IP</th>
                        <th className="py-3 px-4">Metadados e Carga</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/55">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-900/40 text-slate-300 transition-all">
                          <td className="py-3 px-4 font-mono text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="py-3 px-4 font-bold text-indigo-400">{log.tenantId}</td>
                          <td className="py-3 px-4">{log.userEmail}</td>
                          <td className="py-3 px-4 font-mono font-bold text-white">{log.action}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase ${
                              log.result === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' :
                              log.result === 'BLOCKED' ? 'bg-amber-950 text-amber-400 border border-amber-850/40' :
                              'bg-rose-950 text-rose-400 border border-rose-800/40'
                            }`}>
                              {log.result}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500">{log.ipAddress}</td>
                          <td className="py-3 px-4 font-mono text-[10px] text-slate-400 max-w-xs truncate" title={JSON.stringify(log.metadata)}>
                            {JSON.stringify(log.metadata)}
                          </td>
                        </tr>
                      ))}
                      {auditLogs.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                            Nenhum log de auditoria encontrado correspondendo aos filtros fornecidos.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CENTRO DE SEGURANÇA */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Lock size={16} className="text-indigo-400" /> Alertas Ativos de Ameaças e Comportamento Suspeito
                  </h3>
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20 px-2.5 py-0.5 rounded-full">Secure Guard Ativo</span>
                </div>
                
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                        alert.status === 'ACTIVE'
                          ? alert.severity === 'CRITICAL' ? 'bg-rose-950/20 border-rose-600/60' :
                            alert.severity === 'HIGH' ? 'bg-amber-950/20 border-amber-600/60' :
                            'bg-slate-950 border-slate-800'
                          : 'bg-slate-950/40 border-slate-900 opacity-60'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                            alert.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse' :
                            alert.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                            'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            {alert.severity} SEVERITY
                          </span>
                          <span className="text-slate-500 text-[10px] font-mono">{new Date(alert.timestamp).toLocaleString()}</span>
                        </div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">{alert.type}</h4>
                        <p className="text-slate-300 text-xs">{alert.description}</p>
                      </div>

                      {alert.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleDismissAlert(alert.id)}
                          disabled={actionLoading}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:text-white text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Check size={14} /> Dispensar Alerta
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[10px] font-bold uppercase flex items-center gap-1">
                          <CheckCircle size={12} className="text-emerald-500" /> Resolvido / Arquivado
                        </span>
                      )}
                    </div>
                  ))}
                  {alerts.length === 0 && (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      Nenhum alerta de segurança ou ameaça operacional detectada no momento.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: INCIDENTES DE IA */}
          {activeTab === 'incidents' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-400" /> Incident Response AI Console
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Análise inteligente automatizada de falhas lógicas e de infraestrutura dos agentes.</p>
                </div>
                <span className="text-xs font-mono text-slate-500">Incident Engine Ativo</span>
              </div>

              <div className="space-y-4">
                {incidents.map((inc) => (
                  <div
                    key={inc.id}
                    className={`p-5 border rounded-2xl space-y-4 transition-all ${
                      inc.status === 'OPEN'
                        ? 'bg-slate-950 border-amber-500/50'
                        : 'bg-slate-950/40 border-slate-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                          inc.type === 'AGENT_FAILURE' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                          inc.type === 'SECURITY_ALERT' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}>
                          {inc.type}
                        </span>
                        <span className="text-slate-500 text-[10px] font-mono">{new Date(inc.timestamp).toLocaleString()}</span>
                      </div>
                      
                      {inc.status === 'OPEN' ? (
                        <button
                          onClick={() => handleResolveIncident(inc.id)}
                          disabled={actionLoading}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle size={14} /> Mitigar & Resolver
                        </button>
                      ) : (
                        <span className="text-[10px] font-extrabold uppercase text-emerald-400 flex items-center gap-1 bg-emerald-950/40 border border-emerald-800/30 px-2.5 py-0.5 rounded-full">
                          <Check size={12} /> Mitigado {inc.resolvedAt && `em ${new Date(inc.resolvedAt).toLocaleTimeString()}`}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2 border-t border-slate-800">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Problema Identificado</span>
                        <p className="text-slate-200 font-medium">{inc.description}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block flex items-center gap-1">
                          <Sparkles size={12} className="text-amber-400" /> Causa Provável (AI Analysis)
                        </span>
                        <p className="text-slate-300 italic">{inc.probableCause}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Recomendação Resolutiva</span>
                        <p className="text-indigo-300 font-medium">{inc.recommendedAction}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {incidents.length === 0 && (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    Nenhum incidente de IA registrado na plataforma.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: SUPERVISOR AUTO-HEALING */}
          {activeTab === 'supervisor' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sliders size={16} className="text-indigo-400 animate-pulse" /> Supervisor Agent Operations System
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Geração em tempo real de recomendações e ações de cura autônoma para manter a integridade da plataforma.</p>
                </div>
                <button
                  onClick={fetchSupervisorSuggestions}
                  className="px-3.5 py-1.5 text-xs font-bold bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white rounded-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCcw size={12} /> Atualizar Parecer
                </button>
              </div>

              <div className="space-y-4">
                {supervisorSuggestions.map((sug, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex gap-4 hover:border-slate-700 transition-all"
                  >
                    <div className="shrink-0 mt-0.5">
                      {sug.severity === 'CRITICAL' ? (
                        <span className="p-2 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20 block"><AlertTriangle size={18} /></span>
                      ) : sug.severity === 'HIGH' ? (
                        <span className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20 block"><AlertTriangle size={18} /></span>
                      ) : sug.severity === 'MEDIUM' ? (
                        <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20 block"><Sliders size={18} /></span>
                      ) : (
                        <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 block"><CheckCircle size={18} /></span>
                      )}
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Anomalia Encontrada</span>
                        <span className={`text-[9px] font-bold uppercase px-1.5 rounded ${
                          sug.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-400' :
                          sug.severity === 'HIGH' ? 'bg-amber-950 text-amber-400' :
                          'bg-slate-900 text-slate-500'
                        }`}>
                          {sug.severity}
                        </span>
                      </div>
                      <p className="text-white font-semibold">{sug.issue}</p>
                      
                      <div className="pt-2">
                        <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wider block mb-0.5">Sugestão de Autorrecuperação</span>
                        <p className="text-slate-300 font-mono text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">{sug.suggestion}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: COMPLIANCE & RELATÓRIO */}
          {activeTab === 'compliance' && complianceReport && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Award size={16} className="text-indigo-400" /> Compliance Dashboard & Políticas de Governança
                  </h3>
                  <button
                    onClick={() => setViewReportModal(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <FileText size={14} /> Gerar Relatório de Governança
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">MFA Uso Administrativo</span>
                    <h4 className="text-2xl font-black text-white">{complianceReport.metrics.mfaUsageRate}%</h4>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full" style={{ width: `${complianceReport.metrics.mfaUsageRate}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Retenção de Atividades</span>
                    <h4 className="text-2xl font-black text-white">{retentionDays} dias</h4>
                    <p className="text-[10px] text-slate-400">Tempo de imutabilidade dos logs.</p>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Exportação de Relatórios</span>
                    <h4 className="text-2xl font-black text-white">{complianceReport.metrics.activeDataExports} canais</h4>
                    <p className="text-[10px] text-slate-400">Exportações ativas por API.</p>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Conformidade LGPD / GDPR</span>
                    <h4 className="text-2xl font-black text-emerald-400 flex items-center gap-1">
                      <CheckCircle size={20} /> Aprovado
                    </h4>
                    <p className="text-[10px] text-slate-400">Consentimento assinado.</p>
                  </div>
                </div>

                {/* Audit controls & policy editor */}
                <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Políticas de Retenção de Dados</h4>
                  <p className="text-slate-400 text-xs">Ajuste o prazo que os logs de auditoria e as saídas dos agentes serão mantidos de forma imutável nos servidores SaaS.</p>
                  
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={30}
                      max={365}
                      step={30}
                      value={retentionDays}
                      onChange={(e) => setRetentionDays(Number(e.target.value))}
                      className="w-full max-w-md accent-indigo-500 bg-slate-900 border border-slate-800 h-2 rounded-full cursor-pointer"
                    />
                    <span className="text-xs font-bold text-white bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg">{retentionDays} dias</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* COMPLIANCE REPORT MODAL */}
      <AnimatePresence>
        {viewReportModal && complianceReport && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-6 max-h-[85vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Award size={20} className="text-indigo-400 animate-pulse" />
                  <h3 className="text-base font-bold text-white">Relatório de Conformidade e Governança Enterprise</h3>
                </div>
                <button
                  onClick={() => setViewReportModal(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">SaaS Tenant Audit Score</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-indigo-400">{complianceReport.metrics.overallScore}</span>
                    <span className="text-slate-400 font-medium">de 100 pontos</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">Seu nível geral de proteção de dados, trilhas de auditoria e segurança de API é excelente.</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} className="text-indigo-400" /> Recomendações Automáticas de Melhoria (AI)
                  </h4>
                  <ul className="space-y-2">
                    {complianceReport.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex gap-2 items-start p-2.5 bg-slate-950/60 rounded-lg border border-slate-850">
                        <span className="text-indigo-400 font-bold shrink-0 mt-0.5">•</span>
                        <p>{rec}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Últimos Eventos Críticos de Governança</h4>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto">
                    {complianceReport.criticalEvents.map((ev: any, index: number) => (
                      <div key={index} className="p-2.5 bg-slate-950 border border-slate-850 rounded-lg flex justify-between text-[11px]">
                        <div>
                          <span className="font-bold text-white block font-mono">{ev.action}</span>
                          <span className="text-[10px] text-slate-400">{ev.email} | {JSON.stringify(ev.details)}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4 flex justify-end">
                <button
                  onClick={() => {
                    showToast('success', 'Relatório exportado para o console de conformidade.');
                    setViewReportModal(false);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all cursor-pointer"
                >
                  Confirmar e Assinar Relatório
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
