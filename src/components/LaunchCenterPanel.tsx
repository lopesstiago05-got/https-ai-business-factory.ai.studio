import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket, 
  BarChart2, 
  Mail, 
  MessageSquare, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Zap, 
  Sparkles, 
  Cpu, 
  Play, 
  Users, 
  Target, 
  Activity, 
  Phone, 
  Send, 
  Layers,
  ArrowRight,
  TrendingDown,
  ChevronRight,
  Sparkle
} from 'lucide-react';
import { Launch, LaunchCampaign, EmailSequence, MarketingEvent, DigitalProduct } from '../types';

interface LaunchCenterPanelProps {
  jwtToken: string | null;
  onRefreshState?: () => void;
}

export const LaunchCenterPanel: React.FC<LaunchCenterPanelProps> = ({ jwtToken, onRefreshState }) => {
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [campaigns, setCampaigns] = useState<LaunchCampaign[]>([]);
  const [emailSequences, setEmailSequences] = useState<EmailSequence[]>([]);
  const [marketingEvents, setMarketingEvents] = useState<MarketingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'launches' | 'campaigns' | 'emails' | 'whatsapp' | 'events'>('launches');
  
  // Selection
  const [selectedLaunch, setSelectedLaunch] = useState<Launch | null>(null);
  
  // Action state
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Performance results
  const [performanceData, setPerformanceData] = useState<{
    conversionRate: number;
    cac: number;
    roi: number;
    ticketAverage: number;
    totalSpent: number;
    totalRevenue: number;
    recommendations: string;
  } | null>(null);

  // Form states
  const [isNewLaunchModalOpen, setIsNewLaunchModalOpen] = useState(false);
  const [newLaunchProductId, setNewLaunchProductId] = useState('');
  const [newLaunchName, setNewLaunchName] = useState('');
  const [newLaunchBudget, setNewLaunchBudget] = useState('5000');
  const [newLaunchStrategy, setNewLaunchStrategy] = useState('Clássico');

  // WhatsApp simulation states
  const [waPhone, setWaPhone] = useState('5511999998888');
  const [waTriggerType, setWaTriggerType] = useState<'sendMessage' | 'sendOffer' | 'sendSupport'>('sendMessage');
  const [waText, setWaText] = useState('Olá! Percebemos seu interesse em nosso treinamento. Restam apenas 3 vagas com desconto de 50%! Quer garantir a sua?');

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Products
      const prodRes = await fetch('/api/products');
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData.products || []);
        if (prodData.products && prodData.products.length > 0) {
          setNewLaunchProductId(prodData.products[0].id);
        }
      }

      // Launches and dependencies
      const launchRes = await fetch('/api/launch');
      if (launchRes.ok) {
        const lData = await launchRes.json();
        setLaunches(lData.launches || []);
        setCampaigns(lData.campaigns || []);
        setEmailSequences(lData.emailSequences || []);
        setMarketingEvents(lData.marketingEvents || []);
      }
    } catch (err: any) {
      console.error(err);
      setError('Erro ao carregar dados do Launch Center.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLaunchProductId || !newLaunchName || !newLaunchBudget) {
      setError('Por favor, preencha todos os campos do lançamento.');
      return;
    }

    setActionLoading('create');
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: newLaunchProductId,
          name: newLaunchName,
          budget: parseFloat(newLaunchBudget),
          strategy: newLaunchStrategy
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Falha ao criar lançamento.');
      }

      const data = await res.json();
      setSuccess(`Lançamento "${newLaunchName}" criado com sucesso como Rascunho!`);
      setIsNewLaunchModalOpen(false);
      setNewLaunchName('');
      
      // Reload
      await fetchData();
      if (data.launch) {
        setSelectedLaunch(data.launch);
        setPerformanceData(null);
      }
      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      setError(err.message || 'Erro ao processar criação de lançamento.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleGeneratePlan = async (launchId: string) => {
    setActionLoading('plan');
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/launch/${launchId}/plan`, {
        method: 'POST'
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Falha ao gerar plano com IA.');
      }

      const data = await res.json();
      setSuccess('Plano Estratégico completo formulado e otimizado pela IA do Launch Manager Agent!');
      
      await fetchData();
      if (data.launch) {
        setSelectedLaunch(data.launch);
      }
      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar plano tático do lançamento.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAutomateMarketing = async (launchId: string) => {
    setActionLoading('automate');
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/launch/${launchId}/automate`, {
        method: 'POST'
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Falha na automação comercial.');
      }

      const data = await res.json();
      setSuccess('Automação multicanal disparada com sucesso! Coordenando Marketing, Design e Publisher Agents.');
      
      await fetchData();
      if (data.launch) {
        setSelectedLaunch(data.launch);
      }
      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      setError(err.message || 'Erro na automação de tráfego de vendas.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAnalyzePerformance = async (launchId: string) => {
    setActionLoading('performance');
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/launch/${launchId}/performance`);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Falha ao processar métricas.');
      }

      const data = await res.json();
      setPerformanceData(data.metrics);
      setSuccess('Desempenho consolidado analisado com auditoria operacional do Supervisor!');
      
      await fetchData();
      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar auditoria de ROI.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOptimizeLaunch = async (launchId: string) => {
    setActionLoading('optimize');
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/launch/${launchId}/optimize`, {
        method: 'POST'
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Falha ao aplicar otimizações.');
      }

      const data = await res.json();
      setSuccess(data.message || 'Lançamento otimizado com sucesso!');
      
      await fetchData();
      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      setError(err.message || 'Erro na redistribuição orçamentária.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleTriggerEmail = async (launchId: string, triggerEvent: string) => {
    setActionLoading(`email_${triggerEvent}`);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/launch/${launchId}/trigger-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerEvent })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Falha ao enviar e-mails.');
      }

      setSuccess(`Disparo de e-mails para o público-alvo com gatilho "${triggerEvent.toUpperCase()}" realizado com sucesso!`);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Erro no envio da sequência de e-mail.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendWhatsApp = async (launchId: string) => {
    if (!waPhone || !waText) {
      setError('Celular e texto do WhatsApp são obrigatórios.');
      return;
    }

    setActionLoading('whatsapp');
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/launch/${launchId}/trigger-whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          triggerType: waTriggerType,
          phone: waPhone,
          text: waText
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Falha ao enviar mensagem de WhatsApp.');
      }

      setSuccess(`Mensagem WhatsApp registrada na fila de automação de contato comercial para ${waPhone}!`);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar contato WhatsApp.');
    } finally {
      setActionLoading(null);
    }
  };

  // Metric helpers
  const totalLaunches = launches.length;
  const totalBudgetSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalLaunchRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const overallROI = totalBudgetSpent > 0 ? ((totalLaunchRevenue - totalBudgetSpent) / totalBudgetSpent).toFixed(2) : '0.00';

  return (
    <div className="space-y-6" id="launch-center-root">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 rounded-2xl p-6 border border-indigo-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold tracking-wider flex items-center gap-1.5 border border-indigo-400/30">
                <Rocket className="w-3.5 h-3.5 animate-bounce" /> ETAPA 19 ATIVA
              </span>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-semibold tracking-wider flex items-center gap-1 border border-amber-400/30">
                <Cpu className="w-3.5 h-3.5" /> Diretor de Lançamentos
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              Launch Center &amp; Sales Automation
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Crie planos de go-to-market inteligentes com IA, orquestre a criação de campanhas de tráfego, ative sequências automáticas de e-mails, envie alertas de WhatsApp e audite a receita com o Supervisor.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchData} 
              disabled={isLoading}
              className="p-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white rounded-xl border border-slate-700/60 transition duration-150 disabled:opacity-50"
              title="Atualizar Dados"
              id="btn-refresh-launches"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsNewLaunchModalOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition duration-150"
              id="btn-new-launch-modal"
            >
              <Plus className="w-5 h-5" /> Novo Lançamento
            </button>
          </div>
        </div>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="launch-stats-grid">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Lançamentos</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalLaunches}</div>
          <p className="text-xs text-slate-500 mt-1">Estratégias de funis no sistema</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Orçamento Investido</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">R$ {totalBudgetSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <p className="text-xs text-slate-500 mt-1">Gasto total acumulado nas ads</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Receita Gerada</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-300">R$ {totalLaunchRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <p className="text-xs text-indigo-400 mt-1 flex items-center gap-1">
            <Users className="w-3 h-3" /> {totalConversions} conversões comerciais
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">ROI Médio</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className={`text-2xl font-bold ${parseFloat(overallROI) >= 1.0 ? 'text-amber-400' : 'text-rose-400'}`}>
            {overallROI}x
          </div>
          <p className="text-xs text-slate-500 mt-1">Multiplicador sobre ad spend</p>
        </div>
      </div>

      {/* Notifications and Alerts */}
      {error && (
        <div className="p-4 bg-rose-900/20 border border-rose-800/40 rounded-xl flex items-start gap-3 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-900/20 border border-emerald-800/40 rounded-xl flex items-start gap-3 text-emerald-300 text-sm">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{success}</div>
        </div>
      )}

      {/* Primary Cockpit Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="launch-cockpit">
        
        {/* Left Side: Navigation & Lists */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Sub Navigation */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 flex flex-col space-y-1">
            <button
              onClick={() => { setActiveTab('launches'); setSelectedLaunch(null); setPerformanceData(null); }}
              className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-between transition ${activeTab === 'launches' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <div className="flex items-center gap-2">
                <Rocket className="w-4 h-4" />
                <span>Planos de Lançamento</span>
              </div>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md text-xs font-semibold">{launches.length}</span>
            </button>

            <button
              onClick={() => { setActiveTab('campaigns'); setSelectedLaunch(null); }}
              className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-between transition ${activeTab === 'campaigns' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4" />
                <span>Campanhas de Anúncios</span>
              </div>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md text-xs font-semibold">{campaigns.length}</span>
            </button>

            <button
              onClick={() => { setActiveTab('emails'); setSelectedLaunch(null); }}
              className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-between transition ${activeTab === 'emails' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>Sequências de E-mail</span>
              </div>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md text-xs font-semibold">{emailSequences.length}</span>
            </button>

            <button
              onClick={() => { setActiveTab('whatsapp'); setSelectedLaunch(null); }}
              className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-between transition ${activeTab === 'whatsapp' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>WhatsApp Automatizado</span>
              </div>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md text-xs font-semibold">Real API</span>
            </button>

            <button
              onClick={() => { setActiveTab('events'); setSelectedLaunch(null); }}
              className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-between transition ${activeTab === 'events' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>Histórico de Eventos</span>
              </div>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md text-xs font-semibold">{marketingEvents.length}</span>
            </button>
          </div>

          {/* Quick Launches List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">Selecione o Lançamento</h2>
            
            {launches.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm">
                Nenhum lançamento ativo. Toque em "Novo Lançamento" para iniciar.
              </div>
            ) : (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {launches.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => { setSelectedLaunch(l); setPerformanceData(null); }}
                    className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between ${selectedLaunch?.id === l.id ? 'bg-indigo-950/40 border-indigo-500 text-white' : 'bg-slate-850 border-slate-800 text-slate-300 hover:bg-slate-800'}`}
                  >
                    <div>
                      <div className="font-semibold text-sm line-clamp-1">{l.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <span>{l.strategy}</span>
                        <span>•</span>
                        <span>R$ {l.budget.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        l.status === 'draft' ? 'bg-slate-800 text-slate-400' :
                        l.status === 'planning' ? 'bg-blue-900/40 text-blue-300 border border-blue-800/30' :
                        l.status === 'pre_launch' ? 'bg-purple-900/40 text-purple-300 border border-purple-800/30' :
                        l.status === 'launching' ? 'bg-amber-900/40 text-amber-300 border border-amber-800/30 animate-pulse' :
                        l.status === 'scaling' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/30' :
                        'bg-rose-950 text-rose-400'
                      }`}>
                        {l.status.toUpperCase()}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Tab details */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            
            {/* Tab: Launches detail */}
            {activeTab === 'launches' && (
              <motion.div
                key="launches-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {!selectedLaunch ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
                    <Rocket className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-1">Selecione um Lançamento</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                      Selecione um lançamento comercial na barra lateral esquerda ou cadastre um novo produto na esteira para definir planos, IA copies e métricas financeiras.
                    </p>
                    <button
                      onClick={() => setIsNewLaunchModalOpen(true)}
                      className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition"
                    >
                      Criar Novo Lançamento
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-6 space-y-6">
                    
                    {/* Selected Launch details header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-5 gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-white">{selectedLaunch.name}</h2>
                        <p className="text-xs text-slate-400 mt-1">
                          Produto ID: <span className="font-mono text-slate-300">{selectedLaunch.productId}</span> • Estratégia de Funil: <span className="font-semibold text-indigo-400">{selectedLaunch.strategy}</span>
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleGeneratePlan(selectedLaunch.id)}
                          disabled={actionLoading === 'plan'}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-slate-700 transition"
                          id="btn-gen-strategic-plan"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>{actionLoading === 'plan' ? 'Gerando Plano IA...' : 'Formular Plano IA'}</span>
                        </button>

                        <button
                          onClick={() => handleAutomateMarketing(selectedLaunch.id)}
                          disabled={actionLoading === 'automate'}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-md shadow-indigo-600/15 transition"
                          id="btn-activate-launch-automation"
                        >
                          <Cpu className="w-3.5 h-3.5 text-white" />
                          <span>{actionLoading === 'automate' ? 'Ativando...' : 'Ativar Automação Multicanal'}</span>
                        </button>

                        <button
                          onClick={() => handleAnalyzePerformance(selectedLaunch.id)}
                          disabled={actionLoading === 'performance'}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-slate-700 transition"
                          id="btn-analyze-launch-perf"
                        >
                          <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{actionLoading === 'performance' ? 'Analisando...' : 'Analisar Métricas ROI'}</span>
                        </button>

                        <button
                          onClick={() => handleOptimizeLaunch(selectedLaunch.id)}
                          disabled={actionLoading === 'optimize'}
                          className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 disabled:opacity-50 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                          id="btn-optimize-launch"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span>Otimizar Verbas</span>
                        </button>
                      </div>
                    </div>

                    {/* Performance Metrics section if generated */}
                    {performanceData && (
                      <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 space-y-4" id="perf-metrics-container">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                            <Activity className="w-4 h-4 text-emerald-400" /> Auditoria de Performance Comercial (Supervisor QC)
                          </h3>
                          <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-800/40 font-semibold uppercase tracking-wider">Metas Ativas</span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div className="bg-slate-900/55 p-3 rounded-lg border border-slate-900">
                            <div className="text-xs text-slate-500">ROI Atual</div>
                            <div className={`text-xl font-bold mt-1 ${performanceData.roi >= 1.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {performanceData.roi.toFixed(2)}x
                            </div>
                          </div>
                          <div className="bg-slate-900/55 p-3 rounded-lg border border-slate-900">
                            <div className="text-xs text-slate-500">Taxa de Conversão</div>
                            <div className="text-xl font-bold text-indigo-400 mt-1">{performanceData.conversionRate.toFixed(2)}%</div>
                          </div>
                          <div className="bg-slate-900/55 p-3 rounded-lg border border-slate-900">
                            <div className="text-xs text-slate-500">CAC Real</div>
                            <div className="text-xl font-bold text-amber-400 mt-1">R$ {performanceData.cac.toFixed(2)}</div>
                          </div>
                          <div className="bg-slate-900/55 p-3 rounded-lg border border-slate-900">
                            <div className="text-xs text-slate-500">Ticket Médio</div>
                            <div className="text-xl font-bold text-white mt-1 font-mono">R$ {performanceData.ticketAverage.toFixed(2)}</div>
                          </div>
                        </div>

                        <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-900">
                          <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                            <Sparkle className="w-3.5 h-3.5 text-amber-400" /> Parecer Estratégico da IA:
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed italic">{performanceData.recommendations}</p>
                        </div>
                      </div>
                    )}

                    {/* Tab Inner Contents - Detailed strategic parameters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="strategic-plan-details">
                      
                      {/* Left: General Parameters */}
                      <div className="space-y-4">
                        <div className="border-b border-slate-800 pb-2">
                          <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Target className="w-4 h-4" /> Diretrizes de Vendas
                          </h3>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="text-xs text-slate-500">Objetivo Geral do Lançamento:</div>
                            <div className="text-sm text-slate-200 mt-0.5 bg-slate-950 p-2.5 rounded-lg border border-slate-850 leading-relaxed font-medium">
                              {selectedLaunch.goal || 'Plano Estratégico ainda não gerado. Clique no botão "Formular Plano IA" acima.'}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-slate-500">Nome Comercial da Campanha:</div>
                            <div className="text-sm text-slate-200 mt-0.5 font-semibold bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                              {selectedLaunch.campaignName || 'Aguardando formulação estratégica...'}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-slate-500">Público-Alvo Mapeado:</div>
                            <div className="text-sm text-slate-200 mt-0.5 bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                              {selectedLaunch.audience || 'Aguardando definição...'}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <div className="text-xs text-slate-500">Preço Sugerido (Fórmula):</div>
                              <div className="text-sm text-emerald-400 font-bold mt-0.5 bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                                {selectedLaunch.suggestedPrice ? `R$ ${selectedLaunch.suggestedPrice.toFixed(2)}` : 'Não definido'}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500">Orçamento Ads:</div>
                              <div className="text-sm text-white font-bold mt-0.5 bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                                R$ {selectedLaunch.budget.toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-slate-500">Mensagem de Atração Principal:</div>
                            <div className="text-sm text-slate-200 mt-0.5 italic bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                              "{selectedLaunch.mainMessage || 'Nenhum slogan ativo'}"
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Channels & Timeline */}
                      <div className="space-y-4">
                        <div className="border-b border-slate-800 pb-2">
                          <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Layers className="w-4 h-4" /> Funil Multicanal &amp; Cronograma
                          </h3>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="text-xs text-slate-500">Canais de Tráfego Recomendados:</div>
                            <div className="space-y-2 mt-1 max-h-[160px] overflow-y-auto pr-1">
                              {selectedLaunch.instagramChannel && (
                                <div className="text-[11px] bg-slate-950 p-2 rounded-lg border border-slate-850 text-slate-300">
                                  <strong className="text-white">Instagram Ads:</strong> {selectedLaunch.instagramChannel}
                                </div>
                              )}
                              {selectedLaunch.facebookChannel && (
                                <div className="text-[11px] bg-slate-950 p-2 rounded-lg border border-slate-850 text-slate-300">
                                  <strong className="text-white">Facebook Ads:</strong> {selectedLaunch.facebookChannel}
                                </div>
                              )}
                              {selectedLaunch.googleChannel && (
                                <div className="text-[11px] bg-slate-950 p-2 rounded-lg border border-slate-850 text-slate-300">
                                  <strong className="text-white">Google/YouTube:</strong> {selectedLaunch.googleChannel}
                                </div>
                              )}
                              {selectedLaunch.emailChannel && (
                                <div className="text-[11px] bg-slate-950 p-2 rounded-lg border border-slate-850 text-slate-300">
                                  <strong className="text-white">E-mail Sequence:</strong> {selectedLaunch.emailChannel}
                                </div>
                              )}
                              {selectedLaunch.whatsAppChannel && (
                                <div className="text-[11px] bg-slate-950 p-2 rounded-lg border border-slate-850 text-slate-300">
                                  <strong className="text-white">WhatsApp Outreach:</strong> {selectedLaunch.whatsAppChannel}
                                </div>
                              )}
                              {!selectedLaunch.instagramChannel && (
                                <div className="text-xs text-slate-500 italic">Disparar "Formular Plano IA" para ver canais.</div>
                              )}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-slate-500">Fases do Cronograma Comercial:</div>
                            <div className="space-y-2 mt-1 max-h-[160px] overflow-y-auto pr-1">
                              {selectedLaunch.timelinePreLaunch && (
                                <div className="text-[11px] bg-slate-950 p-2 rounded-lg border border-slate-850 text-slate-300">
                                  <strong className="text-indigo-400">1. Pré-Lançamento:</strong> {selectedLaunch.timelinePreLaunch}
                                </div>
                              )}
                              {selectedLaunch.timelineWarmup && (
                                <div className="text-[11px] bg-slate-950 p-2 rounded-lg border border-slate-850 text-slate-300">
                                  <strong className="text-indigo-400">2. Aquecimento:</strong> {selectedLaunch.timelineWarmup}
                                </div>
                              )}
                              {selectedLaunch.timelineOpen && (
                                <div className="text-[11px] bg-slate-950 p-2 rounded-lg border border-slate-850 text-slate-300">
                                  <strong className="text-indigo-400">3. Abertura do Carrinho:</strong> {selectedLaunch.timelineOpen}
                                </div>
                              )}
                              {selectedLaunch.timelineSales && (
                                <div className="text-[11px] bg-slate-950 p-2 rounded-lg border border-slate-850 text-slate-300">
                                  <strong className="text-indigo-400">4. Venda Ativa:</strong> {selectedLaunch.timelineSales}
                                </div>
                              )}
                              {selectedLaunch.timelinePostSales && (
                                <div className="text-[11px] bg-slate-950 p-2 rounded-lg border border-slate-850 text-slate-300">
                                  <strong className="text-indigo-400">5. Pós-Venda:</strong> {selectedLaunch.timelinePostSales}
                                </div>
                              )}
                              {!selectedLaunch.timelinePreLaunch && (
                                <div className="text-xs text-slate-500 italic">Cronograma em formulação estratégica...</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Suggestions Section */}
                    {selectedLaunch.recommendations && !performanceData && (
                      <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2">
                        <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
                          <Sparkles className="w-4 h-4" /> RECOMENDAÇÕES DA IA DO LANÇAMENTO:
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed italic whitespace-pre-line">
                          {selectedLaunch.recommendations}
                        </p>
                      </div>
                    )}

                  </div>
                )}
              </motion.div>
            )}

            {/* Tab: Traffic Campaigns */}
            {activeTab === 'campaigns' && (
              <motion.div
                key="campaigns-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h2 className="font-bold text-white text-lg">Campanhas de Anúncios de Tráfego</h2>
                    <span className="px-2.5 py-1 bg-slate-850 border border-slate-800 text-slate-300 text-xs rounded-full font-semibold">Integrado com Redes</span>
                  </div>

                  {campaigns.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-sm">
                      Nenhuma campanha ativa nas plataformas de ads. Ative a "Automação Comercial" dentro de um lançamento para iniciar as campanhas.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {campaigns.map(c => {
                        const ctr = c.clicks > 0 ? ((c.conversions / c.clicks) * 100).toFixed(2) : '0.00';
                        const campaignROI = c.spent > 0 ? ((c.revenue - c.spent) / c.spent).toFixed(2) : '0.00';

                        return (
                          <div key={c.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-4 shadow-inner relative overflow-hidden">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-indigo-950 border border-indigo-900 text-indigo-400 tracking-wider">
                                  {c.platform.toUpperCase()}
                                </span>
                                <h3 className="text-sm font-bold text-white mt-1 line-clamp-1">{c.name}</h3>
                                <p className="text-[10px] text-slate-500">Lançamento ID: <span className="font-mono text-slate-400">{c.launchId}</span></p>
                              </div>
                              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded-full text-[10px] font-semibold border border-emerald-900">
                                {c.status.toUpperCase()}
                              </span>
                            </div>

                            <p className="text-xs text-slate-300 line-clamp-2 bg-slate-900 p-2 rounded-lg italic">
                              "{c.adCopy || 'Aguardando geração de copy persuasiva pelo Marketing Agent...'}"
                            </p>

                            <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1">
                              <div className="bg-slate-900 p-2 rounded">
                                <div className="text-slate-500 text-[10px]">Orçamento / Gasto</div>
                                <div className="font-semibold text-white mt-0.5">R$ {c.budget.toFixed(0)} / <span className="text-amber-400">R$ {c.spent.toFixed(0)}</span></div>
                              </div>
                              <div className="bg-slate-900 p-2 rounded">
                                <div className="text-slate-500 text-[10px]">Cliques (CTR)</div>
                                <div className="font-semibold text-white mt-0.5">{c.clicks} <span className="text-indigo-400">({ctr}%)</span></div>
                              </div>
                              <div className="bg-slate-900 p-2 rounded">
                                <div className="text-slate-500 text-[10px]">Faturamento (ROI)</div>
                                <div className="font-semibold text-emerald-400 mt-0.5">R$ {c.revenue.toFixed(0)} <span className="text-white font-normal">({campaignROI}x)</span></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Tab: Email sequences and marketing triggers */}
            {activeTab === 'emails' && (
              <motion.div
                key="emails-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h2 className="font-bold text-white text-lg">Sequências de E-mail de Lançamento</h2>
                    <span className="px-2.5 py-1 bg-slate-850 border border-slate-800 text-slate-300 text-xs rounded-full font-semibold">Gmail &amp; SMTP Real integration</span>
                  </div>

                  {emailSequences.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-sm">
                      Nenhuma sequência de e-mail criada. Ative a "Automação Comercial" dentro de um lançamento para mapear as sequências.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {emailSequences.map(seq => (
                        <div key={seq.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                          <div className="space-y-1 max-w-xl">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-indigo-950 text-indigo-400 border border-indigo-900 text-[9px] font-bold rounded uppercase tracking-wider">
                                GATILHO: {seq.triggerEvent.toUpperCase()}
                              </span>
                              <span className="text-xs text-slate-500">ID: {seq.id}</span>
                            </div>
                            <h3 className="text-sm font-bold text-white">Assunto: {seq.subject}</h3>
                            <p className="text-xs text-slate-400 line-clamp-1 italic">"{seq.body}"</p>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                              <span>Enviados: <strong className="text-white">{seq.sentCount}</strong></span>
                              <span>•</span>
                              <span>Taxa de Abertura: <strong className="text-indigo-400">{seq.openRate.toFixed(1)}%</strong></span>
                              <span>•</span>
                              <span>Taxa de Clique: <strong className="text-indigo-400">{seq.clickRate.toFixed(1)}%</strong></span>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center">
                            <button
                              onClick={() => handleTriggerEmail(seq.launchId, seq.triggerEvent)}
                              disabled={actionLoading === `email_${seq.triggerEvent}`}
                              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                            >
                              <Play className="w-3.5 h-3.5" />
                              <span>{actionLoading === `email_${seq.triggerEvent}` ? 'Disparando...' : 'Disparar Teste'}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Tab: WhatsApp API simulation */}
            {activeTab === 'whatsapp' && (
              <motion.div
                key="whatsapp-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
                  <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                    <div>
                      <h2 className="font-bold text-white text-lg">WhatsApp Business API Gateway</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Dispare contatos de alta conversão para suporte de checkout e leads capturados.</p>
                    </div>
                    <span className="px-2 py-1 bg-indigo-950 text-indigo-400 text-xs font-bold rounded-full border border-indigo-900 uppercase">Production Center</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Setup Form */}
                    <div className="space-y-4 bg-slate-950 border border-slate-850 p-5 rounded-xl">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-indigo-400" /> Disparador de Notificação
                      </h3>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-slate-400 font-medium">Celular do Destinatário (WhatsApp):</label>
                          <input 
                            type="text"
                            value={waPhone}
                            onChange={(e) => setWaPhone(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg p-2.5 text-sm text-white focus:outline-none mt-1 font-mono"
                            placeholder="Ex: 5511999998888"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-slate-400 font-medium">Modelo/Tipo do Disparo Comercial:</label>
                          <select
                            value={waTriggerType}
                            onChange={(e) => setWaTriggerType(e.target.value as any)}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg p-2.5 text-sm text-white focus:outline-none mt-1"
                          >
                            <option value="sendMessage">Mensagem de Boas-Vindas (Lead Recém-Criado)</option>
                            <option value="sendOffer">Oferta Especial com Desconto (Remarketing)</option>
                            <option value="sendSupport">Suporte de Abandono de Carrinho (Venda)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs text-slate-400 font-medium">Texto Customizado da Mensagem:</label>
                          <textarea 
                            rows={4}
                            value={waText}
                            onChange={(e) => setWaText(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg p-2.5 text-sm text-white focus:outline-none mt-1 leading-relaxed"
                            placeholder="Digite o texto da copy comercial para o WhatsApp..."
                          />
                        </div>

                        <button
                          onClick={() => handleSendWhatsApp(selectedLaunch?.id || 'global')}
                          disabled={actionLoading === 'whatsapp'}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-lg text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/15"
                          id="btn-send-whatsapp-test"
                        >
                          <Send className="w-4 h-4" />
                          <span>{actionLoading === 'whatsapp' ? 'Enviando API...' : 'Disparar WhatsApp API'}</span>
                        </button>
                      </div>
                    </div>

                    {/* WhatsApp Context panel */}
                    <div className="space-y-4 border border-slate-800 p-5 rounded-xl bg-slate-950/45 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-emerald-400" /> Diretrizes de Conversão de WhatsApp
                        </div>
                        <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 leading-relaxed">
                          <li>Nosso motor utiliza a infraestrutura de webhooks reais do <strong className="text-white">Integration Center Real</strong> para garantir alta entregabilidade de comunicações instantâneas.</li>
                          <li>Gatilhos de suporte de abandono de carrinho têm conversão média comprovada de <strong className="text-emerald-400">22% no mercado de infoprodutos</strong>.</li>
                          <li>Tente enviar mensagens simples e humanizadas, fingindo ser o suporte do CEO Agent ou do Diretor Comercial para quebrar objeções técnicas.</li>
                        </ul>
                      </div>

                      <div className="border border-slate-850 bg-slate-900/60 rounded-xl p-3 text-center">
                        <Phone className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                        <div className="text-xs font-bold text-white">Status da API Integrada</div>
                        <p className="text-[10px] text-slate-500 mt-1">Status: Conectado • Latência: 45ms</p>
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab: Historical Events */}
            {activeTab === 'events' && (
              <motion.div
                key="events-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h2 className="font-bold text-white text-lg">Histórico de Eventos de Marketing</h2>
                    <span className="px-2.5 py-1 bg-slate-850 border border-slate-800 text-slate-300 text-xs rounded-full font-semibold">Histórico Geral</span>
                  </div>

                  {marketingEvents.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-sm">
                      Nenhum evento registrado. Dispare e-mails, envie WhatsApps ou realize automações comerciais para ver os logs do Diretor de Lançamento aqui.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                      {marketingEvents.map(evt => (
                        <div key={evt.id} className="bg-slate-950 border border-slate-850 p-3 rounded-lg flex items-start gap-3">
                          <span className={`p-1.5 rounded-lg shrink-0 ${
                            evt.eventType === 'email_sent' ? 'bg-blue-950 text-blue-400' :
                            evt.eventType === 'ad_created' ? 'bg-indigo-950 text-indigo-400' :
                            evt.eventType === 'whatsapp_sent' ? 'bg-emerald-950 text-emerald-400' :
                            'bg-amber-950 text-amber-400'
                          }`}>
                            {evt.eventType === 'email_sent' ? <Mail className="w-4 h-4" /> :
                             evt.eventType === 'ad_created' ? <Rocket className="w-4 h-4" /> :
                             evt.eventType === 'whatsapp_sent' ? <MessageSquare className="w-4 h-4" /> :
                             <AlertCircle className="w-4 h-4" />}
                          </span>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-white">{evt.title}</span>
                              <span className="text-[9px] text-slate-500 font-mono">{evt.createdAt.split('T')[1]?.split('.')[0] || evt.createdAt}</span>
                            </div>
                            <p className="text-xs text-slate-400">{evt.description}</p>
                            <div className="text-[10px] text-slate-500">
                              Canal: <strong className="text-slate-300 uppercase">{evt.channel || 'Geral'}</strong> • Lançamento ID: <span className="font-mono text-indigo-300">{evt.launchId}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

      {/* MODAL: New Launch Creation */}
      {isNewLaunchModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-850 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
            id="new-launch-modal-container"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Rocket className="w-5 h-5 text-indigo-500" /> Planejar Novo Lançamento
              </h3>
              <button 
                onClick={() => setIsNewLaunchModalOpen(false)}
                className="text-slate-400 hover:text-white transition text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLaunch} className="space-y-4">
              
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Selecione o Produto para Lançar:</label>
                {products.length === 0 ? (
                  <div className="text-xs text-amber-400 py-1 font-semibold">
                    Aviso: Crie primeiro um produto no laboratório de produtos!
                  </div>
                ) : (
                  <select
                    value={newLaunchProductId}
                    onChange={(e) => setNewLaunchProductId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg p-2.5 text-sm text-white focus:outline-none"
                    id="select-launch-product"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (R$ {p.price.toFixed(2)})</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Nome Comercial do Lançamento:</label>
                <input 
                  type="text"
                  required
                  value={newLaunchName}
                  onChange={(e) => setNewLaunchName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg p-2.5 text-sm text-white focus:outline-none"
                  placeholder="Ex: Lançamento Semente IA Treinamentos"
                  id="input-launch-name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Verba Ads total (R$):</label>
                  <input 
                    type="number"
                    required
                    value={newLaunchBudget}
                    onChange={(e) => setNewLaunchBudget(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg p-2.5 text-sm text-white focus:outline-none"
                    placeholder="Ex: 5000"
                    id="input-launch-budget"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Estratégia do Funil:</label>
                  <select
                    value={newLaunchStrategy}
                    onChange={(e) => setNewLaunchStrategy(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg p-2.5 text-sm text-white focus:outline-none"
                    id="select-launch-strategy"
                  >
                    <option value="Clássico">Fórmula Clássica</option>
                    <option value="Semente">Lançamento Semente</option>
                    <option value="Meteórico">Meteórico (WhatsApp)</option>
                    <option value="Perpétuo">Funil Perpétuo</option>
                    <option value="Weekly">Lançamentos Semanais</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsNewLaunchModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-sm transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'create'}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm transition shadow-lg shadow-indigo-600/15"
                  id="btn-submit-new-launch"
                >
                  {actionLoading === 'create' ? 'Processando...' : 'Iniciar Lançamento'}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};
