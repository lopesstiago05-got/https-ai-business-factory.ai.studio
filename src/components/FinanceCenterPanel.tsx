import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  FileText, 
  PieChart as PieIcon, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  AlertTriangle, 
  RefreshCw, 
  Plus, 
  Check, 
  Trash2, 
  Percent, 
  Users, 
  Target,
  BarChart as BarChartIcon
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
  Cell, 
  Legend 
} from 'recharts';

interface FinanceCenterPanelProps {
  jwtToken: string | null;
  onRefreshState?: () => void;
}

export const FinanceCenterPanel: React.FC<FinanceCenterPanelProps> = ({ jwtToken, onRefreshState }) => {
  // States
  const [activeSubTab, setActiveSubTab] = useState<'kpis' | 'transactions' | 'analysis'>('kpis');
  const [isLoading, setIsLoading] = useState(false);
  const [isForecastLoading, setIsForecastLoading] = useState(false);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Data from backend
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalExpense: 0,
    netProfit: 0,
    profitMargin: 0,
    dailyRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    cac: 0,
    roi: 0,
    averageTicket: 0,
    ltv: 0
  });

  const [transactions, setTransactions] = useState<any[]>([]);
  const [cashflowData, setCashflowData] = useState<any[]>([]);
  const [productProfits, setProductProfits] = useState<any[]>([]);
  const [campaignResults, setCampaignResults] = useState<any[]>([]);
  const [latestForecast, setLatestForecast] = useState<any | null>(null);
  const [latestReport, setLatestReport] = useState<any | null>(null);

  // New Transaction Form State
  const [newTxType, setNewTxType] = useState<'revenue' | 'expense'>('revenue');
  const [newTxAmount, setNewTxAmount] = useState('');
  const [newTxDescription, setNewTxDescription] = useState('');
  const [newTxCategory, setNewTxCategory] = useState('sales');
  const [newTxDate, setNewTxDate] = useState(new Date().toISOString().split('T')[0]);

  // AI Triggers State
  const [forecastPeriod, setForecastPeriod] = useState<'next_month' | 'next_quarter' | 'next_year'>('next_month');
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  const fetchFinanceData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/finance/dashboard');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        setTransactions(data.transactions || []);
        setCashflowData(data.cashflow || []);
        setProductProfits(data.profits || []);
        setCampaignResults(data.campaigns || []);
        setLatestForecast(data.latestForecast);
        setLatestReport(data.latestReport);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Falha ao carregar dados financeiros.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Erro de rede ao conectar com o servidor financeiro.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxAmount || !newTxDescription || !newTxCategory || !newTxDate) {
      setError('Preencha todos os campos obrigatórios para registrar a movimentação.');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/finance/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken ? `Bearer ${jwtToken}` : ''
        },
        body: JSON.stringify({
          type: newTxType,
          amount: parseFloat(newTxAmount),
          description: newTxDescription,
          category: newTxCategory,
          date: newTxDate
        })
      });

      if (res.ok) {
        setSuccessMsg('Movimentação financeira registrada e auditada com sucesso!');
        setNewTxAmount('');
        setNewTxDescription('');
        await fetchFinanceData();
        if (onRefreshState) onRefreshState();
      } else {
        const errData = await res.json();
        setError(errData.error || 'Erro ao registrar movimentação.');
      }
    } catch (err) {
      console.error(err);
      setError('Falha na comunicação com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateForecast = async () => {
    setIsForecastLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/finance/forecast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken ? `Bearer ${jwtToken}` : ''
        },
        body: JSON.stringify({ period: forecastPeriod })
      });

      if (res.ok) {
        const data = await res.json();
        setLatestForecast(data.forecast);
        setSuccessMsg(`Previsão financeira de IA para ${forecastPeriod === 'next_month' ? 'o próximo mês' : 'o período selecionado'} gerada com sucesso!`);
        await fetchFinanceData();
      } else {
        const errData = await res.json();
        setError(errData.error || 'Erro ao gerar previsão de IA.');
      }
    } catch (err) {
      console.error(err);
      setError('Falha de rede ao solicitar previsão financeira.');
    } finally {
      setIsForecastLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsReportLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/finance/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken ? `Bearer ${jwtToken}` : ''
        },
        body: JSON.stringify({ period: reportPeriod })
      });

      if (res.ok) {
        const data = await res.json();
        setLatestReport(data.report);
        setSuccessMsg('Relatório executivo financeiro compilado com IA com absoluto sucesso!');
        await fetchFinanceData();
      } else {
        const errData = await res.json();
        setError(errData.error || 'Erro ao gerar relatório de IA.');
      }
    } catch (err) {
      console.error(err);
      setError('Falha ao compilar relatório executivo.');
    } finally {
      setIsReportLoading(false);
    }
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div id="finance-center-container" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Finance Agent — CFO
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-2 flex items-center gap-2">
            <DollarSign className="text-emerald-500 animate-pulse" /> Centro Financeiro e fluxo de caixa
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Controle de saúde financeira, lucros, fluxo de caixa diário, auditorias, cálculo de ROI/CAC e projeções por Inteligência Artificial.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchFinanceData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Sincronizar Dados
          </button>
        </div>
      </div>

      {/* Alertas e Mensagens */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900/50 rounded-lg flex items-start gap-3 text-xs leading-relaxed">
          <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 rounded-lg flex items-start gap-3 text-xs leading-relaxed">
          <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
          <div>{successMsg}</div>
        </div>
      )}

      {/* Navegação de Abas */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveSubTab('kpis')}
          className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
            activeSubTab === 'kpis'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Layers size={14} /> Painel Executivo & Indicadores
        </button>
        <button
          onClick={() => setActiveSubTab('transactions')}
          className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
            activeSubTab === 'transactions'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Calendar size={14} /> Caixa, Lançamento & Extrato
        </button>
        <button
          onClick={() => setActiveSubTab('analysis')}
          className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
            activeSubTab === 'analysis'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Sparkles className="text-indigo-500" size={14} /> Inteligência Financeira IA
        </button>
      </div>

      {/* Conteúdo das Abas */}
      <AnimatePresence mode="wait">
        {activeSubTab === 'kpis' && (
          <motion.div
            key="kpis"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Primeira fileira de cards principais */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl relative overflow-hidden">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Faturamento Bruto</span>
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2">{formatBRL(metrics.totalRevenue)}</div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-500 mt-2 font-semibold">
                  <ArrowUpRight size={12} /> +100% Conversão Real
                </div>
                <div className="absolute right-4 top-5 text-indigo-500/20"><DollarSign size={40} /></div>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl relative overflow-hidden">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Despesas Operacionais</span>
                <div className="text-2xl font-black text-rose-500 mt-2">{formatBRL(metrics.totalExpense)}</div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-2 font-semibold">
                  Infraestrutura & Tráfego Pago
                </div>
                <div className="absolute right-4 top-5 text-rose-500/20"><TrendingDown size={40} /></div>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl relative overflow-hidden">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Lucro Líquido Real</span>
                <div className="text-2xl font-black text-emerald-500 mt-2">{formatBRL(metrics.netProfit)}</div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-500 mt-2 font-semibold">
                  <ArrowUpRight size={12} /> Saldo de caixa positivo
                </div>
                <div className="absolute right-4 top-5 text-emerald-500/20"><TrendingUp size={40} /></div>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl relative overflow-hidden">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Margem de Lucro</span>
                <div className="text-2xl font-black text-amber-500 mt-2">{metrics.profitMargin.toFixed(1)}%</div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-500 mt-2 font-semibold">
                  Alta escalabilidade digital
                </div>
                <div className="absolute right-4 top-5 text-amber-500/20"><Percent size={40} /></div>
              </div>
            </div>

            {/* Faturamentos Periódicos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Receita Diária</span>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">{formatBRL(metrics.dailyRevenue)}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Receita Semanal</span>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">{formatBRL(metrics.weeklyRevenue)}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Receita Mensal</span>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">{formatBRL(metrics.monthlyRevenue)}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Receita Anual</span>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">{formatBRL(metrics.yearlyRevenue)}</div>
              </div>
            </div>

            {/* Segunda fileira de KPI: ROI, CAC, LTV, Ticket Médio */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center gap-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <Target size={18} />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">ROI Agregado</div>
                  <div className="text-lg font-black text-slate-800 dark:text-slate-200">{metrics.roi.toFixed(1)}%</div>
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center gap-4">
                <div className="p-3 bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-lg">
                  <Users size={18} />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">CAC Médio</div>
                  <div className="text-lg font-black text-slate-800 dark:text-slate-200">{formatBRL(metrics.cac)}</div>
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center gap-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">LTV Esperado</div>
                  <div className="text-lg font-black text-slate-800 dark:text-slate-200">{formatBRL(metrics.ltv)}</div>
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center gap-4">
                <div className="p-3 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-lg">
                  <DollarSign size={18} />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Ticket Médio</div>
                  <div className="text-lg font-black text-slate-800 dark:text-slate-200">{formatBRL(metrics.averageTicket)}</div>
                </div>
              </div>
            </div>

            {/* Gráficos Recharts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fluxo de Caixa Diário */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl">
                <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <TrendingUp size={14} className="text-indigo-500" /> Fluxo de Caixa Acumulado (Simulado)
                </h3>
                {cashflowData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={cashflowData}>
                        <defs>
                          <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            border: 'none', 
                            borderRadius: '8px', 
                            color: '#fff',
                            fontSize: '11px' 
                          }} 
                        />
                        <Area type="monotone" dataKey="balance" name="Saldo Acumulado" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                    Sem dados históricos de fluxo de caixa disponíveis.
                  </div>
                )}
              </div>

              {/* Lucratividade por Produto */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl">
                <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <BarChartIcon size={14} className="text-emerald-500" /> Lucro Líquido por Infoproduto
                </h3>
                {productProfits.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={productProfits}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                        <XAxis dataKey="productName" stroke="#94a3b8" fontSize={8} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <Tooltip
                          contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            border: 'none', 
                            borderRadius: '8px', 
                            color: '#fff',
                            fontSize: '11px' 
                          }}
                        />
                        <Bar dataKey="netProfit" name="Lucro Líquido" radius={[4, 4, 0, 0]}>
                          {productProfits.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                    Nenhuma análise de lucratividade por produto disponível.
                  </div>
                )}
              </div>
            </div>

            {/* Campanhas de Marketing Mais Lucrativas */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl">
              <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">
                Desempenho Comercial de Campanhas de Tráfego Pago
              </h3>
              {campaignResults.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                        <th className="py-3 px-4">Campanha</th>
                        <th className="py-3 px-4">Leads Gerados</th>
                        <th className="py-3 px-4">Vendas Simuladas</th>
                        <th className="py-3 px-4">Taxa Conversão</th>
                        <th className="py-3 px-4">Valor Investido</th>
                        <th className="py-3 px-4">Receita Retornada</th>
                        <th className="py-3 px-4">ROI Obtido</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                      {campaignResults.map((cr, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 text-slate-700 dark:text-slate-300">
                          <td className="py-3 px-4 font-bold">{cr.campaignName}</td>
                          <td className="py-3 px-4">{cr.leads}</td>
                          <td className="py-3 px-4">{cr.sales}</td>
                          <td className="py-3 px-4 text-indigo-500 font-semibold">{cr.conversionRate.toFixed(2)}%</td>
                          <td className="py-3 px-4 text-rose-500 font-semibold">{formatBRL(cr.spend)}</td>
                          <td className="py-3 px-4 text-emerald-500 font-bold">{formatBRL(cr.revenue)}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded font-bold">
                              {cr.roi.toFixed(1)}% ROI
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  Nenhuma campanha de tráfego pago analisada até o momento.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeSubTab === 'transactions' && (
          <motion.div
            key="transactions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Registro Manual / Simulador de Vendas */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl lg:col-span-1 h-fit">
              <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Plus size={16} className="text-indigo-500" /> Registrar Movimentação Manual
              </h3>
              <form onSubmit={handleCreateTransaction} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Tipo de Lançamento</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { setNewTxType('revenue'); setNewTxCategory('sales'); }}
                      className={`py-2 px-3 rounded-lg border font-bold flex items-center justify-center gap-1.5 transition-all ${
                        newTxType === 'revenue'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <ArrowUpRight size={14} /> Receita (Entrada)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setNewTxType('expense'); setNewTxCategory('ads'); }}
                      className={`py-2 px-3 rounded-lg border font-bold flex items-center justify-center gap-1.5 transition-all ${
                        newTxType === 'expense'
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/20 text-rose-600'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <ArrowDownRight size={14} /> Despesa (Saída)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newTxAmount}
                    onChange={(e) => setNewTxAmount(e.target.value)}
                    placeholder="Ex: 197.00"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Categoria</label>
                  <select
                    value={newTxCategory}
                    onChange={(e) => setNewTxCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg text-slate-900 dark:text-white"
                  >
                    {newTxType === 'revenue' ? (
                      <>
                        <option value="sales">Venda de Infoproduto</option>
                        <option value="recurrent">Assinatura</option>
                        <option value="other">Outros Recebimentos</option>
                      </>
                    ) : (
                      <>
                        <option value="ads">Tráfego Pago (Anúncios)</option>
                        <option value="servers">Hospedagem & APIs</option>
                        <option value="commissions">Comissões de Plataforma</option>
                        <option value="salaries">Salários & Terceiros</option>
                        <option value="other">Outras Despesas</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Descrição</label>
                  <input
                    type="text"
                    required
                    value={newTxDescription}
                    onChange={(e) => setNewTxDescription(e.target.value)}
                    placeholder="Ex: Assinatura Mensal - Hotmart"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Data Competência</label>
                  <input
                    type="date"
                    required
                    value={newTxDate}
                    onChange={(e) => setNewTxDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} /> Registrar Transação
                </button>
              </form>
            </div>

            {/* Extrato Auditado de Transações */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl lg:col-span-2">
              <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">
                Extrato Financeiro Completo (Auditoria & Logs)
              </h3>
              {transactions.length > 0 ? (
                <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10 shadow-sm border-b border-slate-100 dark:border-slate-800">
                      <tr className="text-slate-400 font-bold">
                        <th className="py-2.5 px-4">Data</th>
                        <th className="py-2.5 px-4">Descrição</th>
                        <th className="py-2.5 px-4">Categoria</th>
                        <th className="py-2.5 px-4">Tipo</th>
                        <th className="py-2.5 px-4 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                      {transactions.map((tx, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 text-slate-700 dark:text-slate-300">
                          <td className="py-2.5 px-4 font-medium">{tx.date}</td>
                          <td className="py-2.5 px-4">{tx.description}</td>
                          <td className="py-2.5 px-4">
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded capitalize text-[9px] font-semibold text-slate-500 dark:text-slate-300">
                              {tx.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            {tx.type === 'revenue' ? (
                              <span className="text-emerald-500 font-bold flex items-center gap-1"><ArrowUpRight size={10} /> Entrada</span>
                            ) : (
                              <span className="text-rose-500 font-bold flex items-center gap-1"><ArrowDownRight size={10} /> Saída</span>
                            )}
                          </td>
                          <td className={`py-2.5 px-4 text-right font-black ${tx.type === 'revenue' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {tx.type === 'revenue' ? '+' : '-'}{formatBRL(tx.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-400">
                  Nenhuma transação financeira auditada. Lance uma transação de fluxo de caixa ao lado.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeSubTab === 'analysis' && (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Relatórios Executivos */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <FileText size={16} className="text-indigo-500 animate-pulse" /> Relatório Executivo por IA
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={reportPeriod}
                      onChange={(e: any) => setReportPeriod(e.target.value)}
                      className="bg-slate-100 dark:bg-slate-950 text-[10px] p-1.5 rounded border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white"
                    >
                      <option value="daily">Diário</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensal</option>
                      <option value="yearly">Anual</option>
                    </select>
                    <button
                      onClick={handleGenerateReport}
                      disabled={isReportLoading}
                      className="px-2.5 py-1.5 bg-indigo-600 text-white rounded text-[10px] font-bold flex items-center gap-1 hover:bg-indigo-700 transition-all disabled:opacity-50"
                    >
                      <Sparkles size={10} /> Gerar
                    </button>
                  </div>
                </div>

                {isReportLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center text-xs text-indigo-500 gap-3">
                    <RefreshCw className="animate-spin" />
                    <span>Gemini analisando caixa e gerando relatório executivo...</span>
                  </div>
                ) : latestReport ? (
                  <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-lg font-bold text-indigo-700 dark:text-indigo-300">
                      {latestReport.title}
                    </div>
                    <p className="whitespace-pre-line">{latestReport.insights}</p>
                    <div className="text-[10px] text-slate-400 mt-4 flex justify-between items-center">
                      <span>Período operacional analisado: {latestReport.period}</span>
                      <span>Gerado em: {new Date(latestReport.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Nenhum relatório executivo ativo. Escolha o período e clique em gerar acima.
                  </div>
                )}
              </div>

              {/* Previsão de Faturamento */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp size={16} className="text-emerald-500" /> Projeção de Faturamento IA
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={forecastPeriod}
                      onChange={(e: any) => setForecastPeriod(e.target.value)}
                      className="bg-slate-100 dark:bg-slate-950 text-[10px] p-1.5 rounded border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white"
                    >
                      <option value="next_month">Próximo Mês</option>
                      <option value="next_quarter">Trimestre</option>
                      <option value="next_year">Anual</option>
                    </select>
                    <button
                      onClick={handleGenerateForecast}
                      disabled={isForecastLoading}
                      className="px-2.5 py-1.5 bg-emerald-600 text-white rounded text-[10px] font-bold flex items-center gap-1 hover:bg-emerald-700 transition-all disabled:opacity-50"
                    >
                      <Sparkles size={10} /> Projetar
                    </button>
                  </div>
                </div>

                {isForecastLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center text-xs text-emerald-500 gap-3">
                    <RefreshCw className="animate-spin" />
                    <span>Gemini calculando cenários e projeção de faturamento...</span>
                  </div>
                ) : latestForecast ? (
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-lg">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Previsão Faturamento</div>
                        <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">
                          {formatBRL(latestForecast.predictedRevenue)}
                        </div>
                      </div>
                      <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-lg">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Grau de Confiança</div>
                        <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-1">
                          {(latestForecast.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    <div className="text-slate-700 dark:text-slate-300 leading-relaxed space-y-3">
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white text-[11px] mb-1">Insights de Mercado</h4>
                        <p className="text-slate-600 dark:text-slate-400">{latestForecast.insights}</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white text-[11px] mb-1">Recomendações e Sugestões</h4>
                        <p className="text-slate-600 dark:text-slate-400">{latestForecast.suggestions}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Nenhuma previsão gerada. Selecione o período e clique em projetar acima.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
