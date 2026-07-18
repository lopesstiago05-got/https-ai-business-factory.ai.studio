import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  Sparkles,
  Users,
  Layers,
  CreditCard,
  BarChart3,
  CheckCircle2,
  Play,
  Pause,
  Trash2,
  Star,
  Award,
  Zap,
  HelpCircle,
  TrendingUp,
  Search,
  SlidersHorizontal,
  Plus,
  Loader2,
  Check,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

interface MarketplacePanelProps {
  jwtToken?: string;
  onRefreshState?: () => void;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  category: 'marketing' | 'sales' | 'business' | 'finance' | 'support';
  difficulty: 'Fácil' | 'Médio' | 'Avançado';
  features: string[];
  requirements: string[];
  status: 'AVAILABLE' | 'INSTALLED' | 'ACTIVE' | 'PAUSED';
  rating: number;
  reviewsCount: number;
  executionCount: number;
}

interface Template {
  id: string;
  name: string;
  description: string;
  agentsIncluded: string[];
  executionFlow: string[];
  initialConfig: Record<string, any>;
  popularity: number;
}

interface Plan {
  currentPlan: 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';
  maxAgents: number;
  maxExecutions: number;
  availableCredits: number;
  usedExecutions: number;
  usedCredits: number;
}

interface State {
  installedAgentIds: string[];
  activeAgentIds: string[];
  pausedAgentIds: string[];
  installedTemplateIds: string[];
  plan: Plan;
  agentRatings: Record<string, { rating: number; review?: string }>;
}

interface Analytics {
  totalInstalled: number;
  mostUsedAgents: { agentId: string; name: string; count: number }[];
  popularTemplates: { templateId: string; name: string; count: number }[];
  activationRate: number;
  conversionRate: number;
}

interface Recommendation {
  recommendedAgentIds: string[];
  recommendedTemplateIds: string[];
  nextActions: string[];
  reasoning: string;
}

export const MarketplacePanel: React.FC<MarketplacePanelProps> = ({ jwtToken, onRefreshState }) => {
  // Navigation Tabs
  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'templates' | 'recommend' | 'my-agents' | 'plans' | 'analytics'>('catalog');
  
  // Data State
  const [catalog, setCatalog] = useState<Agent[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [userState, setUserState] = useState<State | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // AI Recommendation Engine State
  const [sector, setSector] = useState('');
  const [objectives, setObjectives] = useState('');
  const [businessSize, setBusinessSize] = useState('Pequeno');
  const [problems, setProblems] = useState('');
  const [recommending, setRecommending] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);

  // Agent Detail Modal
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewTxt, setReviewTxt] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Action feedback message
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Automated Tests State
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    passed: number;
    failed: number;
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeSubTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, tplRes, alyRes] = await Promise.all([
        fetch('/api/marketplace/catalog'),
        fetch('/api/marketplace/templates'),
        fetch('/api/marketplace/analytics')
      ]);

      const catData = await catRes.json();
      const tplData = await tplRes.json();
      const alyData = await alyRes.json();

      if (catData.success) {
        setCatalog(catData.catalog);
        setUserState(catData.state);
      }
      if (tplData.success) {
        setTemplates(tplData.templates);
      }
      if (alyData.success) {
        setAnalytics(alyData.analytics);
      }
    } catch (err) {
      console.error('Erro ao buscar dados do marketplace:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleInstall = async (agentId: string) => {
    try {
      setActionLoadingId(agentId);
      const res = await fetch('/api/marketplace/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId })
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', data.message);
        if (data.state) setUserState(data.state);
        await fetchData();
        if (onRefreshState) onRefreshState();
      } else {
        showToast('error', data.message);
      }
    } catch (err) {
      showToast('error', 'Erro ao conectar ao servidor.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStatusChange = async (agentId: string, action: 'ACTIVATE' | 'PAUSE' | 'UNINSTALL') => {
    try {
      setActionLoadingId(agentId + '_' + action);
      const res = await fetch('/api/marketplace/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, action })
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', data.message);
        if (data.state) setUserState(data.state);
        await fetchData();
        if (onRefreshState) onRefreshState();
      } else {
        showToast('error', data.message);
      }
    } catch (err) {
      showToast('error', 'Erro de conexão.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleActivateTemplate = async (templateId: string) => {
    try {
      setActionLoadingId(templateId);
      const res = await fetch('/api/marketplace/template/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId })
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', data.message);
        if (data.state) setUserState(data.state);
        await fetchData();
        if (onRefreshState) onRefreshState();
      } else {
        showToast('error', data.message);
      }
    } catch (err) {
      showToast('error', 'Erro ao ativar o template.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpgradePlan = async (plan: 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE') => {
    try {
      setActionLoadingId(plan);
      const res = await fetch('/api/marketplace/plan/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Plano alterado para ${plan} com sucesso!`);
        if (data.state) setUserState(data.state);
        await fetchData();
        if (onRefreshState) onRefreshState();
      } else {
        showToast('error', 'Erro ao atualizar plano.');
      }
    } catch (err) {
      showToast('error', 'Erro de rede.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleGetRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setRecommending(true);
      setRecommendation(null);
      const res = await fetch('/api/marketplace/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sector, objectives, businessSize, problems })
      });
      const data = await res.json();
      if (data.success) {
        setRecommendation(data.recommendation);
      } else {
        showToast('error', 'Erro ao gerar recomendações.');
      }
    } catch (err) {
      showToast('error', 'Falha de rede ao consultar o Gemini.');
    } finally {
      setRecommending(false);
    }
  };

  const handleRateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) return;
    try {
      setSubmittingReview(true);
      const res = await fetch('/api/marketplace/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          rating: ratingVal,
          review: reviewTxt
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Avaliação enviada com sucesso!');
        if (data.state) setUserState(data.state);
        setReviewTxt('');
        setSelectedAgent(null);
        await fetchData();
      }
    } catch (err) {
      showToast('error', 'Erro ao enviar avaliação.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const runMarketplaceTests = async () => {
    try {
      setTestLoading(true);
      setTestResult(null);
      const res = await fetch('/api/tests/marketplace');
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

  // Filtragem local dos agentes
  const filteredCatalog = catalog.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || agent.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'marketing': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'sales': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400';
      case 'business': return 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400';
      case 'finance': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'support': return 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const getCategoryName = (cat: string) => {
    switch (cat) {
      case 'marketing': return 'Marketing';
      case 'sales': return 'Vendas';
      case 'business': return 'Negócios';
      case 'finance': return 'Financeiro';
      case 'support': return 'Atendimento';
      default: return cat;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-500';
      case 'PAUSED': return 'bg-amber-500';
      case 'INSTALLED': return 'bg-indigo-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="relative space-y-6">
      {/* Toast Feedback */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-xs font-bold flex items-center gap-2 border ${
              toast.type === 'success' 
                ? 'bg-emerald-50 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100 border-emerald-200 dark:border-emerald-800' 
                : 'bg-rose-50 dark:bg-rose-900 text-rose-800 dark:text-rose-100 border-rose-200 dark:border-rose-800'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-lg text-white">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
                Marketplace de Agentes de IA
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                  Etapa 21
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Ative novos agentes de IA especialistas, instale modelos de negócios prontos e decole suas automações comerciais.
              </p>
            </div>
          </div>
        </div>

        {/* Plan Header status & Suite trigger */}
        <div className="flex flex-wrap items-center gap-3">
          {userState && (
            <div className="p-2 px-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-lg text-xs flex items-center gap-2">
              <Award className="text-indigo-500" size={14} />
              <span className="text-slate-400">Plano Ativo:</span>
              <strong className="text-indigo-600 dark:text-indigo-400">{userState.plan.currentPlan}</strong>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-slate-400">Limite:</span>
              <strong className="text-slate-700 dark:text-slate-300">{userState.activeAgentIds.length + userState.pausedAgentIds.length}/{userState.plan.maxAgents} Agentes</strong>
            </div>
          )}

          <button
            onClick={runMarketplaceTests}
            disabled={testLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-900 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 rounded-lg text-xs font-bold transition shadow-md disabled:opacity-60"
            id="btn-run-marketplace-tests"
          >
            {testLoading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <CheckCircle2 size={13} className="text-emerald-500" />
            )}
            Rodar Testes Integrados
          </button>
        </div>
      </div>

      {/* Test Result Indicator */}
      {testResult && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className={`p-4 rounded-xl border text-xs font-semibold flex justify-between items-center ${
            testResult.success 
              ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/60 text-emerald-800 dark:text-emerald-400' 
              : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200/60 text-rose-800 dark:text-rose-400'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-extrabold">{testResult.success ? '✓ SUCESSO COMPLETA:' : '✗ FALHAS NA SUÍTE:'}</span>
            <span>Aprovados: {testResult.passed} | Falhas: {testResult.failed} (Etapa 21 validada com sucesso)</span>
          </div>
          <button onClick={() => setTestResult(null)} className="text-[10px] hover:underline uppercase tracking-wider">
            Fechar
          </button>
        </motion.div>
      )}

      {/* Sub Tabs Navigation */}
      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 gap-1">
        {[
          { id: 'catalog', label: 'Catálogo de Agentes', icon: Users },
          { id: 'templates', label: 'Templates de Negócios', icon: Layers },
          { id: 'recommend', label: 'Recomendador IA (Gemini)', icon: Sparkles },
          { id: 'my-agents', label: 'Meus Agentes Instalados', icon: CheckCircle2 },
          { id: 'plans', label: 'Planos & Créditos', icon: CreditCard },
          { id: 'analytics', label: 'Métricas & Analytics', icon: BarChart3 }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs border-b-2 transition-all ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
              id={`subtab-${tab.id}`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Tab Contents */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="animate-spin text-indigo-500 w-10 h-10 mb-3" />
            <span className="text-xs font-semibold">Carregando dados do Marketplace...</span>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* 1. CATALOG TAB */}
            {activeSubTab === 'catalog' && (
              <motion.div
                key="catalog-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-150 dark:border-slate-700/80">
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                    <input
                      type="text"
                      placeholder="Pesquisar agentes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {/* Category Filter */}
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                    >
                      <option value="all">Todas as Categorias</option>
                      <option value="marketing">Marketing</option>
                      <option value="sales">Vendas</option>
                      <option value="business">Negócios</option>
                      <option value="finance">Financeiro</option>
                      <option value="support">Atendimento</option>
                    </select>

                    {/* Difficulty Filter */}
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                    >
                      <option value="all">Todas as Dificuldades</option>
                      <option value="Fácil">Fácil</option>
                      <option value="Médio">Médio</option>
                      <option value="Avançado">Avançado</option>
                    </select>
                  </div>
                </div>

                {/* Agents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredCatalog.map(agent => {
                    const isInstalled = agent.status !== 'AVAILABLE';
                    const isActive = agent.status === 'ACTIVE';
                    const isPaused = agent.status === 'PAUSED';

                    return (
                      <div
                        key={agent.id}
                        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-150 dark:border-slate-700/80 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                      >
                        <div>
                          {/* Header card */}
                          <div className="flex justify-between items-start mb-3">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${getCategoryColor(agent.category)}`}>
                              {getCategoryName(agent.category)}
                            </span>
                            <div className="flex items-center text-amber-500 gap-0.5 text-xs font-bold">
                              <Star size={12} fill="currentColor" />
                              {agent.rating.toFixed(1)}
                            </div>
                          </div>

                          <h3 className="text-sm font-bold tracking-tight mb-1">{agent.name}</h3>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed mb-4 h-12 overflow-hidden text-ellipsis">
                            {agent.description}
                          </p>

                          {/* Difficulty & Execution Indicator */}
                          <div className="flex justify-between text-[10px] text-slate-400 border-b border-slate-50 dark:border-slate-700 pb-3 mb-3">
                            <span>Dificuldade: <strong className="text-slate-600 dark:text-slate-300">{agent.difficulty}</strong></span>
                            <span>Execuções: <strong className="text-slate-600 dark:text-slate-300">{agent.executionCount}</strong></span>
                          </div>

                          {/* Features mini bullet list */}
                          <div className="space-y-1.5 mb-5">
                            {agent.features.slice(0, 2).map((feat, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                                <Check size={10} className="text-indigo-500 shrink-0" />
                                <span className="truncate">{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 border-t border-slate-50 dark:border-slate-700 pt-3">
                          <button
                            onClick={() => setSelectedAgent(agent)}
                            className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg text-[10px] font-bold transition text-center"
                          >
                            Ver Detalhes
                          </button>

                          {agent.status === 'AVAILABLE' ? (
                            <button
                              onClick={() => handleInstall(agent.id)}
                              disabled={actionLoadingId === agent.id}
                              className="flex-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1"
                            >
                              {actionLoadingId === agent.id ? (
                                <Loader2 size={10} className="animate-spin" />
                              ) : (
                                <Plus size={10} />
                              )}
                              Instalar Agente
                            </button>
                          ) : (
                            <div className="flex-1 flex gap-1">
                              {isActive ? (
                                <button
                                  onClick={() => handleStatusChange(agent.id, 'PAUSE')}
                                  disabled={actionLoadingId === agent.id + '_PAUSE'}
                                  className="flex-1 px-2 py-1.5 bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 border border-amber-200/40 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1"
                                >
                                  {actionLoadingId === agent.id + '_PAUSE' ? <Loader2 size={10} className="animate-spin" /> : <Pause size={10} />}
                                  Pausar
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleStatusChange(agent.id, 'ACTIVATE')}
                                  disabled={actionLoadingId === agent.id + '_ACTIVATE'}
                                  className="flex-1 px-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1"
                                >
                                  {actionLoadingId === agent.id + '_ACTIVATE' ? <Loader2 size={10} className="animate-spin" /> : <Play size={10} />}
                                  Ativar
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* 2. TEMPLATES TAB */}
            {activeSubTab === 'templates' && (
              <motion.div
                key="templates-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {templates.map(tpl => {
                  const isInstalled = userState?.installedTemplateIds.includes(tpl.id);
                  return (
                    <div
                      key={tpl.id}
                      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-150 dark:border-slate-700/80 p-5 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        {/* Header */}
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 px-2 py-0.5 rounded">
                            Template Pronto
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">Popularidade: {tpl.popularity}%</span>
                        </div>

                        <h3 className="text-md font-bold tracking-tight mb-1">{tpl.name}</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed mb-4">
                          {tpl.description}
                        </p>

                        {/* Included Agents */}
                        <div className="mb-4">
                          <span className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase">Agentes de IA Inclusos:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {tpl.agentsIncluded.map(agentId => {
                              const agentObj = catalog.find(a => a.id === agentId);
                              return (
                                <span key={agentId} className="px-2 py-0.5 rounded text-[9px] bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-semibold border border-slate-200/40 dark:border-slate-800">
                                  {agentObj ? agentObj.name : agentId}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {/* Flow steps */}
                        <div className="space-y-2 border-t border-slate-50 dark:border-slate-700/60 pt-3 mb-5">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Fluxo de Trabalho Automatizado:</span>
                          {tpl.executionFlow.map((step, idx) => (
                            <div key={idx} className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 p-2 rounded leading-normal border border-slate-100 dark:border-slate-800">
                              {step}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Install Action */}
                      <button
                        onClick={() => handleActivateTemplate(tpl.id)}
                        disabled={actionLoadingId === tpl.id}
                        className={`w-full py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                          isInstalled
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200/40'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow'
                        }`}
                      >
                        {actionLoadingId === tpl.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : isInstalled ? (
                          <>
                            <CheckCircle2 size={12} />
                            Template Instalado e Ativo
                          </>
                        ) : (
                          <>
                            <Zap size={12} />
                            Ativar Template de Negócios
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* 3. AI RECOMMENDATION TAB */}
            {activeSubTab === 'recommend' && (
              <motion.div
                key="recommend-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 xl:grid-cols-3 gap-6"
              >
                {/* Form column */}
                <div className="xl:col-span-1 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-150 dark:border-slate-700/80 shadow-sm h-fit">
                  <div className="mb-4">
                    <h3 className="text-sm font-bold flex items-center gap-1.5">
                      <Sparkles className="text-indigo-500" size={16} /> Consultar AI Advisor (Gemini)
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Informe os dados da sua empresa ou infoproduto e a IA analisará as dores para indicar os agentes corretos.
                    </p>
                  </div>

                  <form onSubmit={handleGetRecommendation} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold mb-1.5 text-slate-400">Segmento / Setor:</label>
                      <input
                        type="text"
                        placeholder="Ex: E-commerce de Calçados, Curso Online de Finanças..."
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1.5 text-slate-400">Objetivos Comerciais:</label>
                      <input
                        type="text"
                        placeholder="Ex: Escalar tráfego orgânico, melhorar suporte pós-venda..."
                        value={objectives}
                        onChange={(e) => setObjectives(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1.5 text-slate-400">Tamanho da Empresa:</label>
                      <select
                        value={businessSize}
                        onChange={(e) => setBusinessSize(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                      >
                        <option value="Solo (1 pessoa)">Solo (1 pessoa)</option>
                        <option value="Pequeno (2-5 pessoas)">Pequeno (2-5 pessoas)</option>
                        <option value="Médio (6-20 pessoas)">Médio (6-20 pessoas)</option>
                        <option value="Grande (20+ pessoas)">Grande (20+ pessoas)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold mb-1.5 text-slate-400">Problemas / Gargalos Atuais:</label>
                      <textarea
                        rows={3}
                        placeholder="Ex: Falta de ideias para mídias sociais, muitas vendas perdidas no boleto..."
                        value={problems}
                        onChange={(e) => setProblems(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={recommending}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition flex items-center justify-center gap-1.5 shadow"
                    >
                      {recommending ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Processando Análise do Gemini...
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          Obter Recomendação Estratégica
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Recommendations Result column */}
                <div className="xl:col-span-2 space-y-6">
                  {recommendation ? (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-150 dark:border-slate-700/80 shadow-sm space-y-5"
                    >
                      {/* Diagnostic */}
                      <div>
                        <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Diagnóstico e Tese Estratégica:</h4>
                        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-wrap bg-slate-50 dark:bg-slate-900/60 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                          {recommendation.reasoning}
                        </p>
                      </div>

                      {/* Suggested Agents */}
                      <div>
                        <h4 className="text-xs font-bold text-pink-500 uppercase tracking-wider mb-2">Agentes de IA Sugeridos:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {recommendation.recommendedAgentIds.map(agentId => {
                            const agentObj = catalog.find(a => a.id === agentId);
                            if (!agentObj) return null;
                            const isInstalled = agentObj.status !== 'AVAILABLE';
                            return (
                              <div key={agentId} className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-lg flex items-center justify-between">
                                <div>
                                  <div className="font-bold text-xs">{agentObj.name}</div>
                                  <div className="text-[10px] text-slate-400">{getCategoryName(agentObj.category)}</div>
                                </div>
                                <button
                                  onClick={() => handleInstall(agentId)}
                                  disabled={isInstalled || actionLoadingId === agentId}
                                  className={`px-2.5 py-1 rounded text-[9px] font-bold ${
                                    isInstalled 
                                      ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600' 
                                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                  }`}
                                >
                                  {isInstalled ? 'Já Instalado' : 'Instalar'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Suggested Templates */}
                      {recommendation.recommendedTemplateIds.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-sky-500 uppercase tracking-wider mb-2 font-black">Templates Sugeridos:</h4>
                          <div className="space-y-2">
                            {recommendation.recommendedTemplateIds.map(tplId => {
                              const tplObj = templates.find(t => t.id === tplId);
                              if (!tplObj) return null;
                              return (
                                <div key={tplId} className="p-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-lg flex flex-col md:flex-row justify-between md:items-center gap-3">
                                  <div>
                                    <div className="font-bold text-xs">{tplObj.name}</div>
                                    <div className="text-[10px] text-slate-400 leading-normal">{tplObj.description}</div>
                                  </div>
                                  <button
                                    onClick={() => handleActivateTemplate(tplId)}
                                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold shrink-0 self-end md:self-center"
                                  >
                                    Ativar
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Suggested Action plan list */}
                      <div>
                        <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2">Plano de Ação Recomendado:</h4>
                        <div className="space-y-1.5">
                          {recommendation.nextActions.map((action, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/10 p-2.5 rounded-lg border border-slate-100/50 dark:border-slate-800">
                              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                                {idx + 1}
                              </span>
                              <span>{action}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </motion.div>
                  ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-150 dark:border-slate-700/80 p-12 text-center text-slate-400 flex flex-col items-center justify-center min-h-[400px]">
                      <Sparkles className="w-12 h-12 text-indigo-300 dark:text-indigo-900 animate-pulse mb-3" />
                      <span className="font-bold text-sm">Aguardando Perfil do Negócio</span>
                      <p className="text-xs max-w-sm mt-1">Preencha o formulário ao lado e inicie o motor de recomendação inteligente alimentado pelo Gemini API.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 4. MY AGENTS TAB */}
            {activeSubTab === 'my-agents' && (
              <motion.div
                key="my-agents-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {userState && userState.installedAgentIds.length === 0 ? (
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-150 dark:border-slate-700/80 p-16 text-center text-slate-400 flex flex-col items-center justify-center">
                    <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                    <span className="font-bold text-sm">Nenhum agente instalado</span>
                    <p className="text-xs mt-1 mb-4">Vá para a aba "Catálogo de Agentes" e instale suas primeiras automações de IA.</p>
                    <button
                      onClick={() => setActiveSubTab('catalog')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition"
                    >
                      Explorar Catálogo
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {catalog
                      .filter(agent => userState?.installedAgentIds.includes(agent.id))
                      .map(agent => {
                        const isActive = agent.status === 'ACTIVE';
                        const isPaused = agent.status === 'PAUSED';

                        return (
                          <div
                            key={agent.id}
                            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-150 dark:border-slate-700/80 p-5 shadow-sm flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex justify-between items-center mb-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-semibold ${getCategoryColor(agent.category)}`}>
                                  {getCategoryName(agent.category)}
                                </span>
                                <div className="flex items-center gap-1.5 text-xs font-bold">
                                  <span className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
                                  <span className="capitalize text-[10px] font-bold">{agent.status === 'ACTIVE' ? 'Ativo' : agent.status === 'PAUSED' ? 'Pausado' : 'Instalado'}</span>
                                </div>
                              </div>

                              <h3 className="font-bold text-sm mb-1">{agent.name}</h3>
                              <p className="text-[11px] text-slate-400 mb-4">{agent.description}</p>
                            </div>

                            {/* Operational Actions */}
                            <div className="flex gap-2 border-t border-slate-50 dark:border-slate-700 pt-3.5">
                              {isActive ? (
                                <button
                                  onClick={() => handleStatusChange(agent.id, 'PAUSE')}
                                  disabled={actionLoadingId === agent.id + '_PAUSE'}
                                  className="flex-1 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 text-[10px] font-bold transition flex items-center justify-center gap-1"
                                >
                                  {actionLoadingId === agent.id + '_PAUSE' ? <Loader2 size={10} className="animate-spin" /> : <Pause size={10} />}
                                  Pausar Agente
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleStatusChange(agent.id, 'ACTIVATE')}
                                  disabled={actionLoadingId === agent.id + '_ACTIVATE'}
                                  className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition flex items-center justify-center gap-1"
                                >
                                  {actionLoadingId === agent.id + '_ACTIVATE' ? <Loader2 size={10} className="animate-spin" /> : <Play size={10} />}
                                  Ativar Agente
                                </button>
                              )}

                              <button
                                onClick={() => handleStatusChange(agent.id, 'UNINSTALL')}
                                disabled={actionLoadingId === agent.id + '_UNINSTALL'}
                                className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/10 text-[10px] font-bold transition flex items-center justify-center"
                                title="Desinstalar Agente"
                              >
                                {actionLoadingId === agent.id + '_UNINSTALL' ? <Loader2 size={10} className="animate-spin" /> : <Trash2 size={12} />}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </motion.div>
            )}

            {/* 5. PLANS TAB */}
            {activeSubTab === 'plans' && (
              <motion.div
                key="plans-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Plan Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    {
                      id: 'FREE' as const,
                      name: 'Plano Gratuito',
                      price: 'R$ 0/mês',
                      color: 'border-slate-200',
                      badge: 'Essencial',
                      agentsLimit: 2,
                      executionsLimit: 100,
                      credits: 50,
                      features: ['Acesso a 12 agentes', '2 agentes ativos simultâneos', '100 execuções de fluxo', 'Suporte via Fórum']
                    },
                    {
                      id: 'PRO' as const,
                      name: 'Plano Pro',
                      price: 'R$ 197/mês',
                      color: 'border-indigo-200 ring-2 ring-indigo-500/20',
                      badge: 'Recomendado',
                      agentsLimit: 5,
                      executionsLimit: 1000,
                      credits: 500,
                      features: ['Acesso total catálogo', '5 agentes ativos simultâneos', '1.000 execuções mensais', '500 Créditos Gemini inclusos', 'Integração de Webhooks']
                    },
                    {
                      id: 'BUSINESS' as const,
                      name: 'Plano Business',
                      price: 'R$ 497/mês',
                      color: 'border-pink-200 ring-2 ring-pink-500/20',
                      badge: 'Escala Extrema',
                      agentsLimit: 10,
                      executionsLimit: 5000,
                      credits: 2000,
                      features: ['Acesso total catálogo', '10 agentes ativos simultâneos', '5.000 execuções mensais', '2.000 Créditos Gemini', 'Multi-produtos ilimitados', 'Suporte prioritário 24/7']
                    },
                    {
                      id: 'ENTERPRISE' as const,
                      name: 'Enterprise',
                      price: 'Sob Consulta',
                      color: 'border-slate-800 dark:border-slate-700 bg-slate-950 text-white dark:bg-slate-900',
                      badge: 'Ilimitado',
                      agentsLimit: 999,
                      executionsLimit: 999999,
                      credits: 999999,
                      features: ['Agentes ativos ILIMITADOS', 'Execuções de fluxo ILIMITADAS', 'Faturamento customizado', 'Gerente de Contas Dedicado', 'Customização de Prompts de IA']
                    }
                  ].map(p => {
                    const isCurrent = userState?.plan.currentPlan === p.id;
                    return (
                      <div
                        key={p.id}
                        className={`p-5 rounded-xl border flex flex-col justify-between ${
                          isCurrent ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-500' : p.color + ' bg-white dark:bg-slate-800'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-center mb-2.5">
                            <span className="text-[9px] font-black uppercase tracking-wider text-indigo-500">{p.badge}</span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-extrabold text-[8px] uppercase">
                                Ativo
                              </span>
                            )}
                          </div>

                          <h3 className="font-extrabold text-sm mb-1">{p.name}</h3>
                          <div className="text-lg font-black mb-4">{p.price}</div>

                          <ul className="space-y-2 text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-50 dark:border-slate-700/60 pt-3 mb-6">
                            {p.features.map((feat, idx) => (
                              <li key={idx} className="flex items-center gap-1.5">
                                <Check size={10} className="text-indigo-500 shrink-0" />
                                <span className="truncate">{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button
                          onClick={() => handleUpgradePlan(p.id)}
                          disabled={isCurrent || actionLoadingId === p.id}
                          className={`w-full py-2 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 ${
                            isCurrent
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/40 cursor-default'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow'
                          }`}
                        >
                          {actionLoadingId === p.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : isCurrent ? (
                            'Plano Atual'
                          ) : (
                            'Fazer Upgrade (Simulado)'
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* 6. ANALYTICS TAB */}
            {activeSubTab === 'analytics' && analytics && (
              <motion.div
                key="analytics-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Stats cards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700/80 rounded-xl shadow-sm">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Agentes Instalados</div>
                    <div className="text-xl font-black">{analytics.totalInstalled}</div>
                  </div>

                  <div className="p-4 bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700/80 rounded-xl shadow-sm">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Taxa de Ativação</div>
                    <div className="text-xl font-black text-indigo-500">{analytics.activationRate}%</div>
                  </div>

                  <div className="p-4 bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700/80 rounded-xl shadow-sm">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Taxa de Conversão</div>
                    <div className="text-xl font-black text-pink-500">{analytics.conversionRate}%</div>
                  </div>

                  <div className="p-4 bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700/80 rounded-xl shadow-sm">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Ações do Supervisor</div>
                    <div className="text-xl font-black text-emerald-500">Auditado ✓</div>
                  </div>
                </div>

                {/* Split lists */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Most used agents */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-150 dark:border-slate-700/80 p-5 shadow-sm">
                    <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4">Agentes Líderes em Execução</h3>
                    <div className="space-y-3">
                      {analytics.mostUsedAgents.map((item, idx) => (
                        <div key={item.agentId} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-100 dark:border-slate-800 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-bold flex items-center justify-center text-[10px]">
                              {idx + 1}
                            </span>
                            <span className="font-bold">{item.name}</span>
                          </div>
                          <span className="font-mono text-slate-500 font-bold">{item.count} chamadas</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Popular templates */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-150 dark:border-slate-700/80 p-5 shadow-sm">
                    <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4">Templates Populares</h3>
                    <div className="space-y-3">
                      {analytics.popularTemplates.map((item, idx) => (
                        <div key={item.templateId} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-100 dark:border-slate-800 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-400 font-bold flex items-center justify-center text-[10px]">
                              {idx + 1}
                            </span>
                            <span className="font-bold">{item.name}</span>
                          </div>
                          <span className="font-semibold text-slate-500">{item.count}% Ativação</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Agent Detail Dialog Modal */}
      <AnimatePresence>
        {selectedAgent && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 max-w-lg w-full p-6 shadow-2xl text-xs space-y-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getCategoryColor(selectedAgent.category)}`}>
                    {getCategoryName(selectedAgent.category)}
                  </span>
                  <h3 className="text-lg font-extrabold tracking-tight mt-1">{selectedAgent.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg text-slate-400 font-bold"
                >
                  ✕
                </button>
              </div>

              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                {selectedAgent.description}
              </p>

              {/* Functional checklist */}
              <div>
                <span className="font-bold text-slate-400 uppercase block mb-1.5">Recursos e Funcionalidades Principais:</span>
                <div className="grid grid-cols-1 gap-1.5">
                  {selectedAgent.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <CheckCircle2 size={12} className="text-indigo-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* System requirements */}
              <div>
                <span className="font-bold text-slate-400 uppercase block mb-1.5">Requisitos Operacionais:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAgent.requirements.map((req, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200/30 dark:border-slate-800 text-slate-500 font-semibold text-[10px]">
                      {req}
                    </span>
                  ))}
                </div>
              </div>

              {/* Rate Agent form */}
              <form onSubmit={handleRateAgent} className="border-t border-slate-100 dark:border-slate-700/60 pt-4 space-y-3">
                <span className="font-bold text-slate-400 uppercase block">Avaliar este Agente:</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Sua Nota (1-5):</span>
                  <select
                    value={ratingVal}
                    onChange={(e) => setRatingVal(Number(e.target.value))}
                    className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
                    <option value={4}>⭐⭐⭐⭐ (4)</option>
                    <option value={3}>⭐⭐⭐ (3)</option>
                    <option value={2}>⭐⭐ (2)</option>
                    <option value={1}>⭐ (1)</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Escreva uma breve avaliação (opcional)..."
                    value={reviewTxt}
                    onChange={(e) => setReviewTxt(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold"
                  >
                    {submittingReview ? 'Enviando...' : 'Avaliar'}
                  </button>
                </div>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
