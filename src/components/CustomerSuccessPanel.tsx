import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  HeartHandshake, 
  Activity, 
  ShieldAlert, 
  TrendingUp, 
  CheckCircle2, 
  Send, 
  MessageSquare, 
  Sparkles, 
  Play, 
  Loader2, 
  AlertTriangle,
  Mail,
  Smartphone,
  HelpCircle
} from 'lucide-react';

interface CustomerSuccessPanelProps {
  jwtToken?: string;
  onRefreshState?: () => void;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  purchases: number;
  totalSpent: number;
  lastPurchase: string;
  createdAt: string;
  frequency: number;
  agentsUsed: number;
  automationsCreated: number;
  resultsObtained: number;
  daysInactive: number;
  csat: number;
  conversions: number;
  healthScore: number;
  healthLevel: 'HEALTHY' | 'ATTENTION' | 'RISK' | 'CRITICAL';
  churnProbability?: number;
  riskFactors?: string[];
  recommendedActions?: string[];
  journeyStage?: string;
}

interface SuccessMetrics {
  averageScore: number;
  healthy: number;
  attention: number;
  risk: number;
  critical: number;
  total: number;
}

export const CustomerSuccessPanel: React.FC<CustomerSuccessPanelProps> = ({ jwtToken, onRefreshState }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [metrics, setMetrics] = useState<SuccessMetrics>({
    averageScore: 0,
    healthy: 0,
    attention: 0,
    risk: 0,
    critical: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [analyzingCustomerId, setAnalyzingCustomerId] = useState<string | null>(null);
  
  // SuccessManagerAI Chat State
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatAnswer, setChatAnswer] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [predefinedQuestions] = useState([
    "Quais clientes estão em risco?",
    "Quem precisa de atenção?",
    "Quais clientes podem fazer upgrade?",
    "Qual ação devo executar hoje?"
  ]);

  // Automated Tests State
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    passed: number;
    failed: number;
  } | null>(null);

  // Simulation Logs
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/customer-success/health');
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers);
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Erro ao buscar dados de CS:', err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeChurn = async (customerId: string) => {
    try {
      setAnalyzingCustomerId(customerId);
      const res = await fetch(`/api/customer-success/churn?customerId=${customerId}`);
      const data = await res.json();
      if (data.success) {
        // Atualiza o cliente local com as análises do Gemini
        setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, ...data.customer } : c));
        addLog(`Análise de Churn via IA concluída para o cliente: ${data.customer.name}. Risco: ${data.customer.churnProbability}%.`);
      }
    } catch (err) {
      console.error('Erro ao analisar churn:', err);
    } finally {
      setAnalyzingCustomerId(null);
    }
  };

  const triggerJourney = async (customerId: string, day: number) => {
    try {
      addLog(`Disparando automação da jornada (Dia ${day}) para o cliente...`);
      const res = await fetch('/api/customer-success/journey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, day })
      });
      const data = await res.json();
      if (data.success) {
        addLog(`[Sucesso] Enviado: ${data.result.messageTitle} | Canal: ${data.result.channel.toUpperCase()}`);
        if (onRefreshState) onRefreshState();
      }
    } catch (err) {
      console.error('Erro ao acionar jornada:', err);
    }
  };

  const askAI = async (prompt: string) => {
    if (!prompt.trim()) return;
    try {
      setChatLoading(true);
      setChatAnswer('');
      const res = await fetch('/api/customer-success/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (data.success) {
        setChatAnswer(data.answer);
      }
    } catch (err) {
      console.error('Erro no SuccessManagerAI:', err);
    } finally {
      setChatLoading(false);
    }
  };

  const runSuccessTests = async () => {
    try {
      setTestLoading(true);
      setTestResult(null);
      const res = await fetch('/api/tests/customer-success');
      const data = await res.json();
      setTestResult({
        success: data.success,
        passed: data.passed,
        failed: data.failed
      });
      if (onRefreshState) onRefreshState();
    } catch (err) {
      console.error('Erro ao rodar suíte de testes:', err);
    } finally {
      setTestLoading(false);
    }
  };

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setSimulationLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 19)]);
  };

  // Cores de Score de Saúde
  const getHealthBadge = (level: string) => {
    switch (level) {
      case 'HEALTHY':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Saudável</span>;
      case 'ATTENTION':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Atenção</span>;
      case 'RISK':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">Risco</span>;
      case 'CRITICAL':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400">Crítico</span>;
      default:
        return null;
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-emerald-500';
    if (score >= 70) return 'text-amber-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-rose-500';
  };

  // Cálculo heurístico de taxa de retenção baseada nos scores
  const totalCustomers = metrics.total || 1;
  const retentionRate = Math.round(((metrics.healthy + metrics.attention) / totalCustomers) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="p-6 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-xl shadow-lg border border-slate-200/60 dark:border-slate-800/80"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HeartHandshake className="text-indigo-500 w-6 h-6" />
            <h1 className="text-2xl font-extrabold tracking-tight">Central de Sucesso do Cliente</h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Acompanhe a saúde da base, automatize interações de onboarding/retenção e preveja churn com inteligência artificial.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={runSuccessTests}
            disabled={testLoading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg text-xs font-semibold transition duration-200 shadow disabled:opacity-50"
          >
            {testLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <CheckCircle2 size={14} />
            )}
            Executar Testes (Etapa 20)
          </button>

          <button
            onClick={fetchData}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition duration-200 shadow"
          >
            Sincronizar
          </button>
        </div>
      </div>

      {/* Test results banner */}
      {testResult && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className={`p-4 mb-6 rounded-lg border text-sm flex justify-between items-center ${
            testResult.success 
              ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 text-emerald-800 dark:text-emerald-400' 
              : 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 text-rose-800 dark:text-rose-400'
          }`}
        >
          <div>
            <span className="font-bold">{testResult.success ? '✓ Suíte de Testes Passou!' : '✗ Testes com Falhas!'}</span>
            <span className="ml-2 text-xs">Aprovados: {testResult.passed} | Falhas: {testResult.failed}</span>
          </div>
          <button 
            onClick={() => setTestResult(null)} 
            className="text-xs hover:underline font-semibold"
          >
            Fechar
          </button>
        </motion.div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <div className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase mb-1">Total Clientes</div>
          <div className="text-2xl font-black flex items-center gap-1.5">
            <Users className="text-slate-400 w-5 h-5" />
            {metrics.total}
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <div className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase mb-1">Health Score Médio</div>
          <div className="text-2xl font-black flex items-center gap-1.5">
            <Activity className="text-indigo-500 w-5 h-5" />
            <span className={getHealthColor(metrics.averageScore)}>{metrics.averageScore}</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <div className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase mb-1">Saudáveis</div>
          <div className="text-2xl font-black flex items-center gap-1.5 text-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
            {metrics.healthy}
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <div className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase mb-1">Em Risco</div>
          <div className="text-2xl font-black flex items-center gap-1.5 text-rose-500">
            <ShieldAlert className="w-5 h-5" />
            {metrics.risk + metrics.critical}
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <div className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase mb-1">Churn Previsto</div>
          <div className="text-2xl font-black flex items-center gap-1.5 text-orange-500">
            <AlertTriangle className="w-5 h-5" />
            {metrics.critical}
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <div className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase mb-1">Retenção</div>
          <div className="text-2xl font-black flex items-center gap-1.5 text-indigo-500">
            <TrendingUp className="w-5 h-5" />
            {retentionRate}%
          </div>
        </div>
      </div>

      {/* Main content Split */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left column: Customers List & Journey Simulator */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-sm">
            <h2 className="text-md font-bold mb-4 flex items-center gap-2">
              <Users className="text-indigo-500" size={18} /> Carteira de Clientes e Indicadores de Saúde
            </h2>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="animate-spin w-8 h-8 text-indigo-500 mb-2" />
                <span className="text-xs">Carregando dados da carteira...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 uppercase font-semibold">
                      <th className="py-3 px-2">Cliente</th>
                      <th className="py-3 px-2 text-center">Score</th>
                      <th className="py-3 px-2 text-center">Inatividade</th>
                      <th className="py-3 px-2 text-center">Conversões</th>
                      <th className="py-3 px-2">Jornada</th>
                      <th className="py-3 px-2 text-right">Ações Operacionais</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map(cust => (
                      <tr key={cust.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition duration-150">
                        <td className="py-3 px-2">
                          <div className="font-bold">{cust.name}</div>
                          <div className="text-slate-400 dark:text-slate-500 text-[10px]">{cust.email}</div>
                          <div className="text-slate-400 dark:text-slate-500 text-[10px]">{cust.phone}</div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <div className={`text-sm font-black ${getHealthColor(cust.healthScore)}`}>
                            {cust.healthScore}
                          </div>
                          <div>{getHealthBadge(cust.healthLevel)}</div>
                        </td>
                        <td className="py-3 px-2 text-center font-semibold text-slate-500">
                          {cust.daysInactive} dias
                        </td>
                        <td className="py-3 px-2 text-center font-bold text-indigo-600 dark:text-indigo-400">
                          {cust.conversions} vendas
                        </td>
                        <td className="py-3 px-2">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-700 font-semibold text-slate-600 dark:text-slate-300">
                            {cust.journeyStage || 'Onboarding'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right space-y-1.5">
                          {/* Churn Prediction */}
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => analyzeChurn(cust.id)}
                              disabled={analyzingCustomerId === cust.id}
                              className="px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 border border-indigo-200/40 font-bold text-[10px] transition disabled:opacity-50 flex items-center gap-1"
                            >
                              {analyzingCustomerId === cust.id ? (
                                <Loader2 size={10} className="animate-spin" />
                              ) : (
                                <Sparkles size={10} />
                              )}
                              Prever Churn (IA)
                            </button>

                            <button
                              onClick={() => triggerJourney(cust.id, 999)}
                              className="px-2.5 py-1 rounded bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200/40 font-bold text-[10px] transition flex items-center gap-1"
                            >
                              <ShieldAlert size={10} />
                              Recuperar (999)
                            </button>
                          </div>

                          {/* Quick Onboarding Triggers */}
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => triggerJourney(cust.id, 0)}
                              className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-[9px] font-semibold transition"
                              title="Mensagem de boas-vindas"
                            >
                              D0
                            </button>
                            <button
                              onClick={() => triggerJourney(cust.id, 3)}
                              className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-[9px] font-semibold transition"
                              title="Apresentação de recursos"
                            >
                              D3
                            </button>
                            <button
                              onClick={() => triggerJourney(cust.id, 7)}
                              className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-[9px] font-semibold transition"
                              title="Análise de progresso"
                            >
                              D7
                            </button>
                            <button
                              onClick={() => triggerJourney(cust.id, 14)}
                              className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-[9px] font-semibold transition"
                              title="Pesquisa de satisfação"
                            >
                              D14
                            </button>
                          </div>

                          {/* If Churn has been calculated show extra results */}
                          {cust.churnProbability !== undefined && (
                            <div className="mt-2 text-left p-2 rounded bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                              <div className="flex justify-between text-[10px] font-bold mb-1">
                                <span>Chances de Churn:</span>
                                <span className={cust.churnProbability > 50 ? 'text-rose-500' : 'text-emerald-500'}>
                                  {cust.churnProbability}%
                                </span>
                              </div>
                              {cust.riskFactors && cust.riskFactors.length > 0 && (
                                <div className="text-[9px] text-slate-500 mb-1">
                                  <strong>Risco:</strong> {cust.riskFactors.join(', ')}
                                </div>
                              )}
                              {cust.recommendedActions && cust.recommendedActions.length > 0 && (
                                <div className="text-[9px] text-indigo-500">
                                  <strong>Recomendação:</strong> {cust.recommendedActions[0]}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Interactive Simulation Console Logs */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-sm">
            <h2 className="text-md font-bold mb-3 flex items-center gap-2">
              <Activity className="text-indigo-400" size={18} /> Console Simulador (Disparos Recentes de WhatsApp / E-mail)
            </h2>
            <div className="p-3 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-lg h-36 overflow-y-auto space-y-1">
              {simulationLogs.length === 0 ? (
                <div className="text-slate-500 text-center py-10">
                  Nenhuma mensagem disparada recentemente. Use os botões de jornada rápidos acima para testar!
                </div>
              ) : (
                simulationLogs.map((log, idx) => (
                  <div key={idx}>{log}</div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column: SuccessManagerAI Copilot */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-sm flex flex-col h-[520px]">
            <div className="mb-4">
              <h2 className="text-md font-bold flex items-center gap-2">
                <Sparkles className="text-indigo-500 animate-pulse" size={18} /> SuccessManagerAI
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Assistente de Inteligência Artificial para análise estratégica de churn, retenção e upselling comercial.
              </p>
            </div>

            {/* Quick Questions */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {predefinedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setChatPrompt(q);
                    askAI(q);
                  }}
                  className="px-2 py-1 text-[10px] bg-slate-50 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-600 transition"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat Response Display */}
            <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800/80 overflow-y-auto mb-4 text-xs leading-relaxed">
              {chatLoading ? (
                <div className="flex items-center justify-center h-full text-slate-400 flex-col gap-2">
                  <Loader2 className="animate-spin text-indigo-500" size={24} />
                  <span>Gerando resposta baseada em dados reais da base...</span>
                </div>
              ) : chatAnswer ? (
                <div className="whitespace-pre-wrap text-slate-600 dark:text-slate-300">
                  {chatAnswer}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center px-4">
                  <MessageSquare className="w-8 h-8 text-indigo-300 dark:text-indigo-900 mb-2" />
                  <span className="font-semibold text-xs">Ainda não há conversas</span>
                  <p className="text-[10px] mt-1">Selecione uma das perguntas rápidas ou digite sua dúvida no campo abaixo.</p>
                </div>
              )}
            </div>

            {/* Message Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                askAI(chatPrompt);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={chatPrompt}
                onChange={(e) => setChatPrompt(e.target.value)}
                placeholder="Perguntar ao Copiloto de CS..."
                className="flex-1 px-3 py-2 text-xs rounded-lg bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={chatLoading}
                className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
