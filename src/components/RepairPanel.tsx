import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wrench, 
  ShieldAlert, 
  RefreshCw, 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Activity, 
  Database, 
  Cpu, 
  History, 
  BookOpen, 
  FileText, 
  Camera, 
  RotateCcw, 
  Bug, 
  Loader2, 
  Plus, 
  Search, 
  Sparkles, 
  Clock, 
  Heart,
  ChevronRight,
  Shield,
  Layers,
  FileCheck
} from 'lucide-react';

export const RepairPanel: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Controles de estado UI
  const [activeSubTab, setActiveSubTab] = useState<'issues' | 'sandbox' | 'history' | 'snapshots' | 'knowledge' | 'reports'>('issues');
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [customErrorDesc, setCustomErrorDesc] = useState('');
  const [customErrorSource, setCustomErrorSource] = useState('WriterAgent');
  const [customErrorSeverity, setCustomErrorSeverity] = useState('high');
  
  const [selectedReportType, setSelectedReportType] = useState('technical');
  const [reportView, setReportView] = useState<any>(null);
  const [runningTests, setRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [rollbackSnapshotId, setRollbackSnapshotId] = useState('');
  const [rollbackReason, setRollbackReason] = useState('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/repair/dashboard');
      if (!res.ok) throw new Error('Falha ao obter dados do Centro de Reparos.');
      const result = await res.json();
      if (result.success) {
        setData(result);
      }
    } catch (err: any) {
      setError(err.message || 'Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Simular e diagnosticar um novo erro customizado (Playground)
  const handleInjectError = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customErrorDesc.trim()) return;

    setActionInProgress('diagnosing');
    try {
      const res = await fetch('/api/repair/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: customErrorSource,
          description: customErrorDesc,
          severity: customErrorSeverity
        })
      });
      if (res.ok) {
        setCustomErrorDesc('');
        await fetchDashboardData();
        setActiveSubTab('issues');
      } else {
        const errData = await res.json();
        alert(errData.error || 'Falha ao processar diagnóstico.');
      }
    } catch (err) {
      alert('Erro ao enviar erro para o agente de reparo.');
    } finally {
      setActionInProgress(null);
    }
  };

  // Disparar reparo autônomo
  const handleExecuteRepair = async (issueId: string) => {
    setActionInProgress(`repair_${issueId}`);
    try {
      const res = await fetch('/api/repair/repair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueId })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        alert(result.details || 'Reparo aplicado com sucesso!');
        await fetchDashboardData();
      } else {
        alert(result.details || 'Falha ao aplicar reparo de forma autônoma.');
      }
    } catch (err) {
      alert('Erro de conexão ao executar reparo.');
    } finally {
      setActionInProgress(null);
      setSelectedIssue(null);
    }
  };

  // Executar testes no Sandbox
  const handleRunSandboxTests = async (testType?: string) => {
    setRunningTests(true);
    try {
      const res = await fetch('/api/repair/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testType })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setTestResults(result.results);
      } else {
        alert('Falha ao processar testes do Sandbox.');
      }
    } catch (err) {
      alert('Erro de conexão ao rodar testes.');
    } finally {
      setRunningTests(false);
    }
  };

  // Gerar Snapshot instantâneo de segurança
  const handleCreateSnapshot = async () => {
    setActionInProgress('snapshot');
    try {
      const res = await fetch('/api/repair/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        alert('Snapshot de resiliência lógica gerado com sucesso!');
        await fetchDashboardData();
      }
    } catch (err) {
      alert('Erro ao gerar snapshot.');
    } finally {
      setActionInProgress(null);
    }
  };

  // Executar Rollback a partir de snapshot
  const handleExecuteRollback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollbackSnapshotId || !rollbackReason.trim()) {
      alert('Por favor, informe a ID do Snapshot e a justificativa técnica.');
      return;
    }

    setActionInProgress('rollback');
    try {
      const res = await fetch('/api/repair/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          snapshotId: rollbackSnapshotId,
          reason: rollbackReason
        })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        alert('Rollback executado com sucesso e logs de auditoria consolidados!');
        setRollbackSnapshotId('');
        setRollbackReason('');
        await fetchDashboardData();
      } else {
        alert('Falha ao realizar rollback.');
      }
    } catch (err) {
      alert('Erro de conexão.');
    } finally {
      setActionInProgress(null);
    }
  };

  // Gerar Relatório em Markdown
  const handleLoadReport = async (type: string) => {
    setActionInProgress('report');
    try {
      const res = await fetch('/api/repair/reports');
      if (res.ok) {
        const list = await res.json();
        const found = list.find((r: any) => r.type === type);
        setReportView(found);
        setSelectedReportType(type);
      }
    } catch (err) {
      alert('Erro ao buscar relatórios.');
    } finally {
      setActionInProgress(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Carregando Centro de Reparos & Auto-Recuperação (SRE)...</p>
      </div>
    );
  }

  const stats = data?.stats || {
    meanTimeToResolutionMs: 1200,
    systemAvailabilityPct: 99.99,
    successRatePct: 100,
    activeIssuesCount: 0,
    totalIssuesCount: 0,
    totalRepairsCount: 0
  };

  const issues = data?.issues || [];
  const history = data?.history || [];
  const snapshots = data?.snapshots || [];
  const knowledge = data?.knowledge || [];
  const diagnostics = data?.diagnostics || [];

  return (
    <div className="space-y-6">
      {/* Top SRE Performance HUD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-emerald-500/30 p-5 rounded-xl shadow-lg relative overflow-hidden flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <Heart className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Disponibilidade Lógica</span>
            <h3 className="text-2xl font-black text-emerald-400 font-mono">
              {stats.systemAvailabilityPct.toFixed(2)}%
            </h3>
            <span className="text-[10px] text-slate-400">SLA operacional ativo</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-indigo-500/30 p-5 rounded-xl shadow-lg relative overflow-hidden flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">MTTR (Tempo Resolução)</span>
            <h3 className="text-2xl font-black text-indigo-400 font-mono">
              {(stats.meanTimeToResolutionMs / 1000).toFixed(2)}s
            </h3>
            <span className="text-[10px] text-slate-400">Tempo médio de autocorreção</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-violet-500/30 p-5 rounded-xl shadow-lg relative overflow-hidden flex items-center gap-4">
          <div className="p-3 bg-violet-500/10 text-violet-400 rounded-lg">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Taxa de Sucesso SRE</span>
            <h3 className="text-2xl font-black text-violet-400 font-mono">
              {stats.successRatePct.toFixed(1)}%
            </h3>
            <span className="text-[10px] text-slate-400">Reparos validados em Sandbox</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-red-500/30 p-5 rounded-xl shadow-lg relative overflow-hidden flex items-center gap-4">
          <div className="p-3 bg-red-500/10 text-red-400 rounded-lg">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Erros Ativos / Totais</span>
            <h3 className="text-2xl font-black text-red-400 font-mono">
              {stats.activeIssuesCount} <span className="text-slate-400 text-sm">/ {stats.totalIssuesCount}</span>
            </h3>
            <span className="text-[10px] text-slate-400">Ocorrências sob auditoria</span>
          </div>
        </div>
      </div>

      {/* SRE Controller Navigation */}
      <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl flex flex-wrap gap-2">
        <button
          onClick={() => setActiveSubTab('issues')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'issues'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Centro de Incidentes
          {stats.activeIssuesCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
              {stats.activeIssuesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveSubTab('sandbox');
            if (testResults.length === 0) handleRunSandboxTests();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'sandbox'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Bug className="w-4 h-4" /> Sandbox de Testes
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'history'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <History className="w-4 h-4" /> Histórico SRE
        </button>

        <button
          onClick={() => setActiveSubTab('snapshots')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'snapshots'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Camera className="w-4 h-4" /> Snapshots & Rollback
        </button>

        <button
          onClick={() => setActiveSubTab('knowledge')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'knowledge'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Base de Conhecimento
        </button>

        <button
          onClick={() => {
            setActiveSubTab('reports');
            if (!reportView) handleLoadReport('technical');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'reports'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" /> Relatórios de Engenharia
        </button>
      </div>

      {/* Primary Panels Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {/* INCIDENT PANEL */}
            {activeSubTab === 'issues' && (
              <motion.div
                key="issues"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5"
              >
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-sm font-black text-white">Central de Incidentes do SRE</h3>
                    <p className="text-slate-400 text-xs">Exibe falhas detectadas automaticamente ou injetadas pelo administrador para autodiagnóstico.</p>
                  </div>
                  <button 
                    onClick={fetchDashboardData}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                {issues.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                    <CheckCircle className="w-12 h-12 text-emerald-400 mb-3 animate-pulse" />
                    <h4 className="text-white text-xs font-bold">Nenhum Incidente Ativo</h4>
                    <p className="text-slate-400 text-xs max-w-xs mt-1">Todos os componentes operacionais, APIs Gemini, Drizzle ORM e Banco Postgres estão operando saudáveis sem nenhuma falha detectada.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {issues.map((iss: any) => (
                      <div 
                        key={iss.id} 
                        onClick={() => setSelectedIssue(selectedIssue?.id === iss.id ? null : iss)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          selectedIssue?.id === iss.id 
                            ? 'bg-slate-800/80 border-indigo-500/50' 
                            : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${
                              iss.status === 'resolved' ? 'bg-emerald-400' :
                              iss.severity === 'critical' || iss.severity === 'emergency' ? 'bg-red-500 animate-ping' : 'bg-amber-400'
                            }`} />
                            <div>
                              <h4 className="text-xs font-bold text-white font-mono">{iss.title}</h4>
                              <p className="text-[10px] text-slate-400 mt-0.5">Componente: <span className="text-slate-300 font-bold">{iss.source}</span> • Recorrências: <span className="font-mono text-indigo-400">{iss.recurrenceCount}x</span></p>
                            </div>
                          </div>
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full font-mono ${
                            iss.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            iss.status === 'repairing' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' :
                            'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {iss.status}
                          </span>
                        </div>

                        {/* Detalhes Expansíveis */}
                        {selectedIssue?.id === iss.id && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="mt-4 pt-4 border-t border-slate-800 space-y-3 text-xs"
                          >
                            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider block mb-1">Evidências / Logs de Erro</span>
                              <pre className="text-[11px] text-slate-300 whitespace-pre-wrap font-mono">{iss.description}</pre>
                            </div>

                            {iss.rootCause && (
                              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                                <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider block mb-1">Causa Raiz Refinada (Gemini 3.5 AI)</span>
                                <p className="text-slate-300 font-mono text-[11px] leading-relaxed">{iss.rootCause}</p>
                              </div>
                            )}

                            {iss.status !== 'resolved' && (
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleExecuteRepair(iss.id);
                                  }}
                                  disabled={actionInProgress !== null}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-lg text-[10px] font-black transition-all"
                                >
                                  {actionInProgress === `repair_${iss.id}` ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Wrench className="w-3.5 h-3.5" />
                                  )}
                                  Executar Autocorreção Autônoma
                                </button>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* SANDBOX PANEL */}
            {activeSubTab === 'sandbox' && (
              <motion.div
                key="sandbox"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6"
              >
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-sm font-black text-white">Sandbox de Confiabilidade & Sanidade</h3>
                    <p className="text-slate-400 text-xs">Simula e executa baterias de testes rigorosos sem interferir em produção.</p>
                  </div>
                  <button
                    onClick={() => handleRunSandboxTests()}
                    disabled={runningTests}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-black transition-all disabled:opacity-50"
                  >
                    {runningTests ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Rodar Bateria de Sanidade
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {['unit', 'integration', 'api', 'db', 'agent', 'postgres', 'gemini'].map((type) => (
                    <button
                      key={type}
                      onClick={() => handleRunSandboxTests(type)}
                      className="p-3 bg-slate-950/60 border border-slate-800 hover:border-indigo-500/30 hover:bg-slate-950 rounded-xl text-left transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-300 font-mono uppercase">{type}</span>
                        <Play className="w-3 h-3 text-slate-500" />
                      </div>
                    </button>
                  ))}
                </div>

                {testResults.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-400" /> Resultados dos Últimos Testes (Sandbox)
                    </h4>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {testResults.map((t: any) => (
                        <div key={t.id} className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl flex items-center justify-between gap-4 font-mono text-xs">
                          <div>
                            <span className="text-slate-400 text-[10px] block font-bold uppercase">{t.testType}</span>
                            <span className="text-white font-bold">{t.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-500">{t.durationMs}ms</span>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              t.status === 'passed' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                            }`}>
                              {t.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* HISTORY PANEL */}
            {activeSubTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4"
              >
                <div>
                  <h3 className="text-sm font-black text-white">Histórico de Ações & Autocorreções</h3>
                  <p className="text-slate-400 text-xs">Registro imutável de todas as auditorias, Snapshots, rollbacks e correções do Repair Agent.</p>
                </div>

                {history.length === 0 ? (
                  <p className="text-slate-500 text-xs text-center py-8">Nenhuma ação registrada no histórico SRE.</p>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {history.map((h: any) => (
                      <div key={h.id} className="p-3 bg-slate-950 border border-slate-800/50 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-indigo-400 font-mono">{h.action}</span>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            h.result === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {h.result}
                          </span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed">{h.details}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                          <span>Operador: <strong className="text-slate-400">{h.operator}</strong></span>
                          <span>{new Date(h.timestamp).toLocaleString()} • {h.durationMs}ms</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* SNAPSHOTS PANEL */}
            {activeSubTab === 'snapshots' && (
              <motion.div
                key="snapshots"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6"
              >
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-sm font-black text-white">Snapshots & Rollbacks Rápidos</h3>
                    <p className="text-slate-400 text-xs">Crie e gerencie pontos de restauração lógica integrais da fábrica.</p>
                  </div>
                  <button
                    onClick={handleCreateSnapshot}
                    disabled={actionInProgress !== null}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-black transition-all"
                  >
                    {actionInProgress === 'snapshot' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                    Criar Novo Snapshot
                  </button>
                </div>

                {/* Formulario de Rollback Manual */}
                <form onSubmit={handleExecuteRollback} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4 text-rose-500" /> Executar Rollback de Emergência
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1.5 font-bold">Snapshot ID para restaurar</label>
                      <input 
                        type="text" 
                        value={rollbackSnapshotId}
                        onChange={(e) => setRollbackSnapshotId(e.target.value)}
                        placeholder="Ex: snap_a1b2c3d4"
                        className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg p-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1.5 font-bold">Justificativa SRE / Motivo</label>
                      <input 
                        type="text" 
                        value={rollbackReason}
                        onChange={(e) => setRollbackReason(e.target.value)}
                        placeholder="Ex: Excesso de exceções em produção"
                        className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={actionInProgress !== null}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-lg transition-all"
                    >
                      {actionInProgress === 'rollback' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Iniciar Rollback Forçado'
                      )}
                    </button>
                  </div>
                </form>

                {/* Lista de snapshots cadastrados */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-white">Snapshots Disponíveis</h4>
                  {snapshots.length === 0 ? (
                    <p className="text-slate-500 text-xs">Nenhum snapshot durável gerado até o momento.</p>
                  ) : (
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                      {snapshots.map((s: any) => (
                        <div key={s.id} className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl flex items-center justify-between gap-4 font-mono text-xs">
                          <div>
                            <span className="text-indigo-400 font-bold">{s.id}</span>
                            <p className="text-[11px] text-slate-300 mt-0.5">{s.description}</p>
                          </div>
                          <div className="text-right text-[10px] text-slate-500">
                            <span>Tamanho: {(s.sizeBytes / 1024).toFixed(2)} KB</span>
                            <span className="block mt-0.5">{new Date(s.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* KNOWLEDGE PANEL */}
            {activeSubTab === 'knowledge' && (
              <motion.div
                key="knowledge"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4"
              >
                <div>
                  <h3 className="text-sm font-black text-white">Base de Conhecimento Auto-Adquirida</h3>
                  <p className="text-slate-400 text-xs">A base de aprendizado do Repair Agent, otimizando o MTTR a cada autocorreção validada com sucesso.</p>
                </div>

                {knowledge.length === 0 ? (
                  <div className="text-center py-10">
                    <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 text-xs">A base de aprendizado SRE está vazia. Ela será alimentada de forma autônoma após a resolução do primeiro incidente.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                    {knowledge.map((k: any) => (
                      <div key={k.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                        <div className="flex items-center justify-between text-xs border-b border-slate-800/50 pb-2">
                          <span className="font-extrabold text-white">{k.problem}</span>
                          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono">
                            Sucesso: {k.successRatePct}%
                          </span>
                        </div>
                        <div className="space-y-1 text-xs">
                          <p className="text-slate-400"><strong className="text-rose-400 font-bold uppercase text-[9px] block">Causa Investigada:</strong> {k.cause}</p>
                          <p className="text-slate-400"><strong className="text-emerald-400 font-bold uppercase text-[9px] block mt-1.5">Correção Aplicada:</strong> {k.correction}</p>
                          <p className="text-indigo-300 italic"><strong className="text-indigo-400 font-bold uppercase text-[9px] block mt-1.5">Recomendação Futura:</strong> {k.futureRecommendation}</p>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                          <span>Casos: <strong className="text-slate-400">{k.recurrenceCount}x</strong></span>
                          <span>MTTR Aprendido: {k.resolutionTimeMs}ms</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* REPORTS PANEL */}
            {activeSubTab === 'reports' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-sm font-black text-white">Relatórios Analíticos SRE</h3>
                    <p className="text-slate-400 text-xs">Acesse e gere relatórios técnicos e gerenciais compilados de disponibilidade e resiliência lógicas.</p>
                  </div>
                  <div className="flex gap-2">
                    {['technical', 'executive', 'failures'].map((type) => (
                      <button
                        key={type}
                        onClick={() => handleLoadReport(type)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all uppercase ${
                          selectedReportType === type 
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {actionInProgress === 'report' ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  </div>
                ) : reportView ? (
                  <div className="space-y-4">
                    <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl max-h-[400px] overflow-y-auto pr-2">
                      <h4 className="text-xs font-mono font-black text-white border-b border-slate-800 pb-2 mb-3">
                        {reportView.title}
                      </h4>
                      <pre className="text-slate-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                        {reportView.content}
                      </pre>
                    </div>
                    <p className="text-[10px] text-slate-500 text-right font-mono">ID: {reportView.id} • {new Date(reportView.timestamp).toLocaleString()}</p>
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs text-center py-8">Nenhum relatório carregado.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* LOGS & PLAYGROUND PANEL (Sidebar) */}
        <div className="space-y-6">
          {/* Diagnostic Log Playground */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Bug className="w-4 h-4 text-red-500" /> Injetor de Logs de Emergência
            </h3>
            <p className="text-slate-400 text-xs">Simule uma falha lógica crítica em qualquer componente para testar a IA de Autodiagnóstico e Autocorreção do Repair Agent.</p>

            <form onSubmit={handleInjectError} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-bold">Componente / Agente Alvo</label>
                <select 
                  value={customErrorSource}
                  onChange={(e) => setCustomErrorSource(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg p-2 text-white font-mono"
                >
                  <option value="PostgreSQL">PostgreSQL Database</option>
                  <option value="DrizzleORM">Drizzle ORM</option>
                  <option value="GeminiAPI">Gemini LLM API</option>
                  <option value="ExpressServer">Express REST API</option>
                  <option value="Scheduler">Orchestration Scheduler</option>
                  <option value="CEOAgent">CEOAgent</option>
                  <option value="WriterAgent">WriterAgent</option>
                  <option value="DesignerAgent">DesignerAgent</option>
                  <option value="FinanceAgent">FinanceAgent</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Gravidade do Evento</label>
                <select 
                  value={customErrorSeverity}
                  onChange={(e) => setCustomErrorSeverity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg p-2 text-white font-mono"
                >
                  <option value="info">Informativo</option>
                  <option value="low">Baixo</option>
                  <option value="medium">Médio</option>
                  <option value="high">Alto</option>
                  <option value="critical">Crítico</option>
                  <option value="emergency">Emergencial</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Descrição da Falha ou Logs de Erro</label>
                <textarea
                  rows={4}
                  value={customErrorDesc}
                  onChange={(e) => setCustomErrorDesc(e.target.value)}
                  placeholder="Ex: Connection pool exhausted, WriterAgent running on a circular loop, memory stack overflow"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg p-2 text-white font-mono text-[11px]"
                />
              </div>

              <button
                type="submit"
                disabled={actionInProgress !== null || !customErrorDesc.trim()}
                className="w-full py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black rounded-lg transition-all text-center flex items-center justify-center gap-1.5"
              >
                {actionInProgress === 'diagnosing' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                Injetar Log e Diagnosticar
              </button>
            </form>
          </div>

          {/* SRE Knowledge base statistics */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" /> Relatório de Diagnósticos Realizados
            </h3>
            
            {diagnostics.length === 0 ? (
              <p className="text-slate-500 text-xs">Nenhum diagnóstico registrado.</p>
            ) : (
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1 text-xs">
                {diagnostics.slice(0, 5).map((d: any) => (
                  <div key={d.id} className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="text-slate-400 font-bold">{d.targetComponent}</span>
                      <span className="text-indigo-400">{d.diagnosticType}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] font-mono leading-relaxed">{d.logAnalysisSummary}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {d.memoryLeakDetected === 1 && <span className="bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded text-[8px] font-bold">Vazamento Memória</span>}
                      {d.loopDetected === 1 && <span className="bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded text-[8px] font-bold">Loop Infinito</span>}
                      {d.blockedQueueDetected === 1 && <span className="bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded text-[8px] font-bold">Fila Travada</span>}
                      {d.slowApisDetected === 1 && <span className="bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded text-[8px] font-bold">API Lenta</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
