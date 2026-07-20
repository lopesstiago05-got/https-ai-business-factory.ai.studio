import React, { useState, useEffect, useRef } from 'react';
import { SystemState, AgentInfo, Task, DigitalProduct, SystemMetrics } from '../types';
import { MetricCard } from './MetricCard';
import { AgentCard } from './AgentCard';
import { TaskQueue } from './TaskQueue';
import { ProductViewer } from './ProductViewer';
import { CEOPanel } from './CEOPanel';
import { ResearchPanel } from './ResearchPanel';
import { MarketAnalystPanel } from './MarketAnalystPanel';
import { ProductLaboratoryPanel } from './ProductLaboratoryPanel';
import { ContentStudioPanel } from './ContentStudioPanel';
import { DesignStudioPanel } from './DesignStudioPanel';
import { MarketingCenterPanel } from './MarketingCenterPanel';
import { PublisherCenterPanel } from './PublisherCenterPanel';
import { FinanceCenterPanel } from './FinanceCenterPanel';
import { SupervisorPanel } from './SupervisorPanel';
import { RepairPanel } from './RepairPanel';
import { KernelPanel } from './KernelPanel';
import { IntegrationPanel } from './IntegrationPanel';
import { IntegrationCenterPanel } from './IntegrationCenterPanel';
import { CommercialCenterPanel } from './CommercialCenterPanel';
import { LaunchCenterPanel } from './LaunchCenterPanel';
import { CustomerSuccessPanel } from './CustomerSuccessPanel';
import { MarketplacePanel } from './MarketplacePanel';
import { SaaSAreaPanel } from './SaaSAreaPanel';
import { EnterpriseOperationsCenter } from './EnterpriseOperationsCenter';
import { ProductFactoryPanel } from './ProductFactoryPanel';
import { ConnectorCenterPanel } from './ConnectorCenterPanel';
import { SalesChannelPanel } from './SalesChannelPanel';
import { EvolutionPanel } from './EvolutionPanel';
import { GrowthPanel } from './GrowthPanel';
import { GlobalExpansionPanel } from './GlobalExpansionPanel';
import { ReadyForMarketPipeline } from './ReadyForMarketPipeline';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Settings, 
  Sun, 
  Moon, 
  Users, 
  Cpu, 
  Package, 
  CheckSquare, 
  TrendingUp, 
  DollarSign, 
  Sparkles,
  Search,
  BookOpen,
  PenTool,
  Palette,
  LayoutDashboard,
  ClipboardList,
  FolderLock,
  Wrench,
  AlertCircle,
  HelpCircle,
  Database,
  Server,
  Shield,
  Activity,
  Megaphone,
  Globe,
  ShoppingBag,
  Rocket,
  Zap,
  HeartHandshake,
  Link,
  Power,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  Key,
  RefreshCw,
  ArrowRight,
  Clock
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [state, setState] = useState<SystemState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'inventory' | 'lab' | 'infra' | 'ceo' | 'research' | 'market-analyst' | 'product-lab' | 'writer-studio' | 'design-studio' | 'marketing-center' | 'publisher-center' | 'finance-center' | 'supervisor' | 'repair' | 'kernel' | 'integration' | 'integration-center' | 'connector-center' | 'commercial' | 'launch-center' | 'customer-success' | 'marketplace' | 'workspace' | 'enterprise' | 'product-factory' | 'sales-channels' | 'evolution' | 'growth' | 'global_expansion' | 'ready-for-market'>('overview');
  const [isDark, setIsDark] = useState<boolean>(true);
  const [sidebarSearch, setSidebarSearch] = useState<string>('');

  const navigationCategories = [
    {
      title: 'Diretoria & Planejamento',
      items: [
        { id: 'overview', label: 'Painel Geral', icon: LayoutDashboard },
        { id: 'ceo', label: 'Sala do CEO', icon: Sparkles, iconColor: 'text-amber-500' },
        { id: 'queue', label: 'Fila de Tarefas & Logs', icon: ClipboardList },
        { id: 'supervisor', label: 'Supervisor COO', icon: Shield, iconColor: 'text-indigo-500' },
      ]
    },
    {
      title: 'Pipeline IA Criativo',
      items: [
        { id: 'research', label: 'Centro de Pesquisa', icon: Search, iconColor: 'text-indigo-400' },
        { id: 'market-analyst', label: 'Inteligência de Mercado', icon: TrendingUp, iconColor: 'text-violet-400' },
        { id: 'product-lab', label: 'Laboratório de Produtos', icon: BookOpen, iconColor: 'text-emerald-500' },
        { id: 'writer-studio', label: 'Estúdio de Conteúdo', icon: PenTool, iconColor: 'text-indigo-500' },
        { id: 'design-studio', label: 'Estúdio de Design', icon: Palette, iconColor: 'text-indigo-500' },
        { id: 'product-factory', label: 'AI Product Factory', icon: Cpu, iconColor: 'text-indigo-400' },
        { id: 'inventory', label: 'Entrega de Trabalho', icon: CheckSquare, iconColor: 'text-emerald-500' },
        { id: 'ready-for-market', label: "Pipeline 'Ready for Market'", icon: Rocket, iconColor: 'text-indigo-400' },
      ]
    },
    {
      title: 'Marketing & Canais',
      items: [
        { id: 'marketing-center', label: 'Centro de Marketing', icon: Megaphone, iconColor: 'text-emerald-500' },
        { id: 'publisher-center', label: 'Centro de Publicação', icon: Globe, iconColor: 'text-emerald-500' },
        { id: 'commercial', label: 'Centro Comercial', icon: ShoppingBag, iconColor: 'text-rose-500' },
        { id: 'sales-channels', label: 'Canais de Vendas', icon: Zap, iconColor: 'text-indigo-500' },
        { id: 'launch-center', label: 'Diretor de Lançamentos', icon: Rocket, iconColor: 'text-indigo-400' },
        { id: 'customer-success', label: 'Sucesso do Cliente', icon: HeartHandshake, iconColor: 'text-pink-500' },
      ]
    },
    {
      title: 'Financeiro & SaaS',
      items: [
        { id: 'finance-center', label: 'Centro Financeiro', icon: DollarSign, iconColor: 'text-emerald-500' },
        { id: 'workspace', label: 'Meu Workspace & SaaS', icon: Shield, iconColor: 'text-indigo-400' },
        { id: 'marketplace', label: 'Marketplace IA', icon: ShoppingBag, iconColor: 'text-indigo-500' },
        { id: 'enterprise', label: 'Enterprise Ops Center', icon: Activity, iconColor: 'text-indigo-400' },
      ]
    },
    {
      title: 'Evolução & Crescimento',
      items: [
        { id: 'evolution', label: 'Evolução de Agentes IA', icon: Cpu, iconColor: 'text-indigo-500' },
        { id: 'growth', label: 'Crescimento Autônomo', icon: TrendingUp, iconColor: 'text-indigo-500' },
        { id: 'global_expansion', label: 'Expansão Global & L10n', icon: Globe, iconColor: 'text-pink-500' },
      ]
    },
    {
      title: 'Infraestrutura & DevOps',
      items: [
        { id: 'infra', label: 'Auditoria de Infraestrutura', icon: Server },
        { id: 'integration-center', label: 'Central Real (Vault)', icon: Shield, iconColor: 'text-emerald-400' },
        { id: 'connector-center', label: 'Central de Marketplaces', icon: Database, iconColor: 'text-indigo-400' },
        { id: 'kernel', label: 'Kernel Central', icon: Cpu, iconColor: 'text-indigo-400' },
        { id: 'lab', label: 'Laboratório de Agentes', icon: Wrench },
        { id: 'repair', label: 'Centro de Reparos (SRE)', icon: Wrench, iconColor: 'text-rose-500' },
        { id: 'integration', label: 'Central de Webhooks & APIs', icon: Globe, iconColor: 'text-sky-500' },
      ]
    }
  ];
  
  // Modals state
  const [showProductModal, setShowProductModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);

  // New product form
  const [newNiche, setNewNiche] = useState('Educação Financeira com IA');
  const [newName, setNewName] = useState('Fórmula da Riqueza 2026');

  // New agent form
  const [agentName, setAgentName] = useState('');
  const [agentRole, setAgentRole] = useState('');
  const [agentDesc, setAgentDesc] = useState('');

  // Segurança e Autenticação JWT (Etapa 2)
  const [jwtToken, setJwtToken] = useState<string | null>(localStorage.getItem('factory_jwt_token'));
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);

  // Testes de Infraestrutura e API Docs
  const [testResults, setTestResults] = useState<any>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [apiDocs, setApiDocs] = useState<any>(null);
  const [latencyData, setLatencyData] = useState<any>(null);
  const [isMeasuringLatency, setIsMeasuringLatency] = useState<boolean>(false);

  // Estados para Conexões Rápidas de Marketplaces
  const [connectors, setConnectors] = useState<any[]>([]);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [disconnectingProvider, setDisconnectingProvider] = useState<string | null>(null);
  const [customTokenProvider, setCustomTokenProvider] = useState<string | null>(null);
  const [customToken, setCustomToken] = useState<string>('');

  // Rastreamento de falhas consecutivas para resiliência durante restarts
  const consecutiveConnectorFailures = useRef(0);
  const consecutiveStateFailures = useRef(0);

  const fetchConnectors = async () => {
    try {
      const res = await fetch('/api/connectors');
      if (res.ok) {
        const data = await res.json();
        setConnectors(data);
        consecutiveConnectorFailures.current = 0;
      } else {
        throw new Error('Servidor retornou erro.');
      }
    } catch (err) {
      consecutiveConnectorFailures.current += 1;
      // Só exibe no log após várias falhas consecutivas para evitar poluição no restart
      if (consecutiveConnectorFailures.current >= 4) {
        console.error('Erro persistente ao carregar status dos conectores:', err);
      }
    }
  };

  const handleQuickConnect = async (provider: string, token: string) => {
    setConnectingProvider(provider);
    try {
      const res = await fetch('/api/connectors/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, token })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro na autenticação.');
      }
      await fetchConnectors();
      setCustomTokenProvider(null);
      setCustomToken('');
    } catch (err: any) {
      alert(err.message || 'Erro ao conectar plataforma.');
    } finally {
      setConnectingProvider(null);
    }
  };

  const handleQuickDisconnect = async (provider: string) => {
    if (!window.confirm(`Tem certeza que deseja desconectar o conector ${provider.toUpperCase()}?`)) return;
    setDisconnectingProvider(provider);
    try {
      const res = await fetch('/api/connectors/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao desconectar.');
      }
      await fetchConnectors();
    } catch (err: any) {
      alert(err.message || 'Erro ao desconectar plataforma.');
    } finally {
      setDisconnectingProvider(null);
    }
  };

  // Fetch state on mount and keep polling
  useEffect(() => {
    fetchState();
    fetchConnectors();
    ensureAuthenticated();
    fetchApiDocs();
    measureSystemLatency();
    const interval = setInterval(() => {
      fetchState();
      fetchConnectors();
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Autenticação Automática Administrativa (Etapa 2)
  const ensureAuthenticated = async () => {
    if (localStorage.getItem('factory_jwt_token')) {
      // Se já temos o token, tenta ler o usuário salvo ou decodificado
      try {
        const savedUser = localStorage.getItem('factory_user');
        if (savedUser) setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
      return;
    }

    setIsAuthLoading(true);
    try {
      // Faz login automático administrativo na inicialização
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@factory.com', password: 'admin123' })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('factory_jwt_token', data.token);
        localStorage.setItem('factory_user', JSON.stringify(data.user));
        setJwtToken(data.token);
        setCurrentUser(data.user);
        console.log('🔑 Autenticado com sucesso via JWT administrativo.');
      } else {
        // Se falhar (ex: primeiro boot), tenta registrar o usuário administrador padrão antes
        await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Administrador Principal',
            email: 'admin@factory.com',
            password: 'admin123',
            role: 'admin'
          })
        });

        // Tenta logar novamente
        const retryRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@factory.com', password: 'admin123' })
        });

        if (retryRes.ok) {
          const retryData = await retryRes.json();
          localStorage.setItem('factory_jwt_token', retryData.token);
          localStorage.setItem('factory_user', JSON.stringify(retryData.user));
          setJwtToken(retryData.token);
          setCurrentUser(retryData.user);
        }
      }
    } catch (err) {
      console.error('Falha de auto-autenticação JWT:', err);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Carrega a documentação técnica da API REST
  const fetchApiDocs = async () => {
    try {
      const res = await fetch('/api/docs');
      if (res.ok) {
        const data = await res.json();
        setApiDocs(data);
      }
    } catch (err) {
      console.error('Erro ao buscar documentação da API:', err);
    }
  };

  const measureSystemLatency = async () => {
    setIsMeasuringLatency(true);
    try {
      const res = await fetch('/api/infra/latency');
      if (res.ok) {
        const data = await res.json();
        setLatencyData(data);
      }
    } catch (err) {
      console.error('Erro ao medir latência:', err);
    } finally {
      setIsMeasuringLatency(false);
    }
  };

  // Executa os testes automatizados da infraestrutura sob demanda
  const runInfrastructureSuite = async () => {
    setIsTesting(true);
    try {
      const res = await fetch('/api/tests/run');
      const data = await res.json();
      setTestResults(data);
    } catch (err) {
      console.error('Erro executando testes de infraestrutura:', err);
    } finally {
      setIsTesting(false);
    }
  };

  // Sync dark class on html tag
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const fetchState = async () => {
    try {
      const res = await fetch('/api/state');
      if (!res.ok) throw new Error('Erro ao conectar ao servidor do backend.');
      const data = await res.json();
      setState(data);
      consecutiveStateFailures.current = 0;
      setError(null);
    } catch (err: any) {
      consecutiveStateFailures.current += 1;
      // Só define erro na UI se falhar consecutivamente por mais de 3 vezes (cerca de 5 segundos)
      if (consecutiveStateFailures.current >= 4) {
        setError(err?.message || 'Erro de rede.');
      }
    }
  };

  const handleControlFactory = async (running: boolean) => {
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('factory_jwt_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch('/api/factory/control', {
        method: 'POST',
        headers,
        body: JSON.stringify({ running })
      });
      fetchState();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetFactory = async () => {
    if (!confirm('Deseja realmente apagar todo o histórico de tarefas, produtos criados e reiniciar a fábrica?')) return;
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('factory_jwt_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch('/api/factory/reset', { 
        method: 'POST',
        headers
      });
      fetchState();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('factory_jwt_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/factory/run', {
        method: 'POST',
        headers,
        body: JSON.stringify({ niche: newNiche, productName: newName })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.error || 'Erro ao iniciar lote.');
      }
      setShowProductModal(false);
      setActiveTab('queue');
      fetchState();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/agents/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: agentName, role: agentRole, description: agentDesc })
      });
      if (!res.ok) throw new Error('Erro ao registrar novo agente.');
      
      setAgentName('');
      setAgentRole('');
      setAgentDesc('');
      setShowAgentModal(false);
      fetchState();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleConfigureAgent = async (id: string, efficiency: number) => {
    try {
      await fetch('/api/agents/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, efficiency })
      });
      // Instant updates in client state for slider smoothness
      if (state) {
        const updatedAgents = state.agents.map(a => a.id === id ? { ...a, efficiency } : a);
        setState({ ...state, agents: updatedAgents });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!state) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4 font-sans">
        <div className="relative w-16 h-16">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-30"></span>
          <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin"></div>
        </div>
        <p className="text-sm font-semibold tracking-wide text-slate-400">
          Iniciando AI Business Factory...
        </p>
      </div>
    );
  }

  const { metrics, agents, tasks, products, isFactoryRunning } = state;

  return (
    <div className="min-h-screen font-sans bg-[#020204] text-slate-200 flex relative overflow-hidden cyber-grid">
      
      {/* SIDEBAR LATERAL CATEGORIZADA */}
      <aside className="w-80 shrink-0 border-r border-[#121625] flex flex-col h-screen sticky top-0 z-30 bg-[#040408]">
        {/* Logo / Título */}
        <div className="p-6 border-b border-[#121625] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-xl text-white shadow-md shadow-indigo-500/15">
              <Cpu size={18} className="animate-spin" style={{ animationDuration: '10s' }} />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 block leading-none font-mono">
                SaaS Corporativo
              </span>
              <h1 className="text-sm font-black tracking-tight leading-none mt-1.5 text-white font-sans">
                AI Business Factory
              </h1>
            </div>
          </div>
        </div>

        {/* Campo de Filtro de Abas */}
        <div className="p-4 border-b border-[#121625]/80">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
            <input
              type="text"
              placeholder="Buscar área / agente..."
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-[#161c32] bg-[#07070e] focus:border-indigo-500 focus:outline-none text-white placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Lista Categorizada de Abas com Rolagem Suave */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 scrollbar-thin">
          {navigationCategories.map((category, catIdx) => {
            // Filtrar itens da categoria de acordo com a pesquisa do usuário
            const filteredItems = category.items.filter(item => 
              item.label.toLowerCase().includes(sidebarSearch.toLowerCase())
            );

            if (filteredItems.length === 0) return null;

            return (
              <div key={catIdx} className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 block font-mono">
                  // {category.title}
                </span>
                <div className="space-y-0.5">
                  {filteredItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all font-sans ${
                          isActive
                            ? 'bg-indigo-950/40 text-indigo-400 border-l-2 border-indigo-500 shadow-[inset_0_0_8px_rgba(99,102,241,0.08)]'
                            : 'text-slate-400 hover:bg-[#0a0a14] hover:text-slate-200'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon size={14} className={isActive ? 'text-indigo-400' : item.iconColor || 'text-slate-500'} />
                          <span>{item.label}</span>
                        </span>
                        {item.id === 'ceo' && (
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        )}
                        {item.id === 'queue' && tasks.some(t => t.status === 'running') && (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé da Sidebar: Controle da Fábrica & Resiliência */}
        <div className="p-4 border-t border-[#121625] space-y-3 bg-[#030306]">
          <div className="flex gap-1.5">
            {isFactoryRunning ? (
              <button
                onClick={() => handleControlFactory(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 flex items-center justify-center gap-1.5 transition-all cursor-pointer font-mono"
              >
                <Pause size={12} fill="currentColor" /> PAUSAR
              </button>
            ) : (
              <button
                onClick={() => handleControlFactory(true)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center gap-1.5 transition-all cursor-pointer font-mono"
              >
                <Play size={12} fill="currentColor" /> INICIAR
              </button>
            )}
            <button
              onClick={handleResetFactory}
              title="Limpar Histórico"
              className="p-2.5 rounded-xl border border-[#161c32] bg-[#07070e] text-slate-400 hover:text-white hover:border-slate-500 transition-all cursor-pointer"
            >
              <RotateCcw size={12} />
            </button>
          </div>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO PRINCIPAL (À DIREITA DA SIDEBAR) */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto transition-colors bg-[#020204]">
        
        {/* CABEÇALHO DA SEÇÃO */}
        <header className="border-b border-[#121625] sticky top-0 z-20 backdrop-blur-md bg-[#020204]/80 px-8 py-4.5 flex items-center justify-between text-white">
          <div>
            <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-400 font-mono">
              // Fábrica de Negócios Digitais
            </span>
            <h2 className="text-lg font-black tracking-tight mt-0.5 font-sans">
              {navigationCategories.flatMap(c => c.items).find(i => i.id === activeTab)?.label || 'Painel de Controle'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Indicador de Status Geral */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#161c32] bg-[#07070f] transition-all">
              <span className={`h-2 w-2 rounded-full ${isFactoryRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                {isFactoryRunning ? 'Fábrica Ativa' : 'Fábrica Pausada'}
              </span>
            </div>

            <button
              onClick={() => setShowProductModal(true)}
              className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-bold bg-indigo-600/10 border border-indigo-500/30 hover:bg-indigo-500/20 text-indigo-400 shadow-md shadow-indigo-600/5 hover:text-white active:scale-98 transition-all cursor-pointer font-mono"
            >
              <Plus size={14} /> NOVO LOTE
            </button>
          </div>
        </header>

        {/* CONTAINER DO ESTÁGIO DE CONTEÚDO */}
        <div className="flex-1 px-8 py-8 space-y-6 max-w-7xl w-full mx-auto pb-24">
        
        {/* Error warning banner */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-150 text-xs">
            <AlertCircle size={16} />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <MetricCard
            id="metric-active"
            title="Agentes Ativos"
            value={metrics.activeAgentsCount}
            icon={<Users size={16} />}
            color={isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}
          />
          <MetricCard
            id="metric-running"
            title="Agentes Rodando"
            value={metrics.runningAgentsCount}
            icon={<Cpu size={16} />}
            color={metrics.runningAgentsCount > 0 ? 'bg-emerald-500/20 text-emerald-500 animate-pulse' : (isDark ? 'bg-slate-800/80 text-slate-400' : 'bg-slate-100 text-slate-500')}
          />
          <MetricCard
            id="metric-created"
            title="Produtos Criados"
            value={metrics.productsCreatedCount}
            icon={<Package size={16} />}
            color={isDark ? 'bg-sky-500/10 text-sky-400' : 'bg-sky-50 text-sky-600'}
          />
          <MetricCard
            id="metric-published"
            title="Produtos Publicados"
            value={metrics.productsPublishedCount}
            icon={<CheckSquare size={16} />}
            color={isDark ? 'bg-teal-500/10 text-teal-400' : 'bg-teal-50 text-teal-600'}
          />
          <MetricCard
            id="metric-revenue"
            title="Receita Projetada"
            value={metrics.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            icon={<TrendingUp size={16} />}
            color={isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}
          />
          <MetricCard
            id="metric-profit"
            title="Lucro Estimado"
            value={metrics.totalProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            icon={<DollarSign size={16} />}
            color={isDark ? 'bg-violet-500/10 text-violet-400' : 'bg-violet-50 text-violet-600'}
          />
        </div>

        {/* Active execution status bar */}
        {isFactoryRunning && tasks.length > 0 && tasks.some(t => t.status === 'running') && (
          <div className="flex items-center justify-between p-4 bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-100/50 dark:border-emerald-900/30 rounded-2xl">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <p className="text-xs text-emerald-900 dark:text-emerald-200">
                Fábrica processando ativamente: <strong className="font-semibold text-slate-900 dark:text-white">
                  {tasks.find(t => t.status === 'running')?.title}
                </strong>
              </p>
            </div>
            <button 
              onClick={() => setActiveTab('queue')}
              className="text-xs text-indigo-500 hover:text-indigo-400 font-bold"
            >
              Ver Console de Logs &rarr;
            </button>
          </div>
        )}

        {/* Primary Workspace Navigation Tabs (Hidden - Replaced by Elegant Sidebar) */}
        <div className="hidden">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <LayoutDashboard size={14} /> Painel Geral
          </button>
          <button
            onClick={() => setActiveTab('ceo')}
            className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'ceo'
                ? 'border-indigo-600 text-indigo-600 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Sparkles size={14} className="text-indigo-500 animate-pulse" /> Sala do CEO (Diretoria)
          </button>
          <button
            onClick={() => setActiveTab('research')}
            className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'research'
                ? 'border-indigo-600 text-indigo-600 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Search size={14} className="text-indigo-400" /> Centro de Pesquisa
          </button>
          <button
            onClick={() => setActiveTab('market-analyst')}
            className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'market-analyst'
                ? 'border-indigo-600 text-indigo-600 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <TrendingUp size={14} className="text-violet-400" /> Inteligência de Mercado
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'queue'
                ? 'border-indigo-600 text-indigo-600 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <ClipboardList size={14} /> Fila de Tarefas & Logs
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'inventory'
                ? 'border-indigo-600 text-indigo-600 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <CheckSquare size={14} className="text-emerald-500 animate-pulse" /> Entrega de Trabalho (Prontos)
          </button>
          <button
            onClick={() => setActiveTab('product-lab')}
            className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'product-lab'
                ? 'border-indigo-600 text-indigo-600 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <BookOpen size={14} className="text-emerald-500 animate-pulse" /> Laboratório de Produtos
          </button>
          <button
            onClick={() => setActiveTab('writer-studio')}
            className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'writer-studio'
                ? 'border-indigo-600 text-indigo-600 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <PenTool size={14} className="text-indigo-500 animate-pulse" /> Estúdio de Conteúdo
          </button>
          <button
            onClick={() => setActiveTab('design-studio')}
            className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'design-studio'
                ? 'border-indigo-600 text-indigo-600 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Palette size={14} className="text-indigo-500 animate-pulse" /> Estúdio de Design
          </button>
          <button
            onClick={() => setActiveTab('marketing-center')}
            className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'marketing-center'
                ? 'border-indigo-600 text-indigo-600 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Megaphone size={14} className="text-emerald-500 animate-pulse" /> Centro de Marketing
          </button>
          <button
            onClick={() => setActiveTab('publisher-center')}
            className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'publisher-center'
                ? 'border-indigo-600 text-indigo-600 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Globe size={14} className="text-emerald-500 animate-pulse" /> Centro de Publicação
          </button>
          <button
            onClick={() => setActiveTab('finance-center')}
            className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'finance-center'
                ? 'border-indigo-600 text-indigo-600 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <DollarSign size={14} className="text-emerald-500 animate-pulse" /> Centro Financeiro
          </button>
          <button
            onClick={() => setActiveTab('lab')}
            className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'lab'
                ? 'border-indigo-600 text-indigo-600 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Wrench size={14} /> Laboratório de Agentes
          </button>
          <button
            onClick={() => setActiveTab('infra')}
            className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'infra'
                ? 'border-indigo-600 text-indigo-600 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Server size={14} /> Auditoria de Infraestrutura
          </button>
          <button
            onClick={() => setActiveTab('supervisor')}
            className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'supervisor'
                ? 'border-indigo-600 text-indigo-600 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Shield size={14} className="text-indigo-500" /> Supervisor COO
          </button>
          <button
            onClick={() => setActiveTab('repair')}
            className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'repair'
                ? 'border-indigo-600 text-indigo-600 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Wrench size={14} className="text-rose-500" /> Centro de Reparos (SRE)
          </button>
          <button
            onClick={() => setActiveTab('kernel')}
            className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'kernel'
                ? 'border-indigo-600 text-indigo-600 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Cpu size={14} className="text-indigo-400 animate-pulse" /> Kernel Central
          </button>
          <button
            onClick={() => setActiveTab('integration')}
            className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'integration'
                ? 'border-indigo-600 text-indigo-600 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Globe size={14} className="text-sky-500" /> Central de Integrações (Simulada)
          </button>
          <button
            onClick={() => setActiveTab('integration-center')}
            className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'integration-center'
                ? 'border-indigo-600 text-indigo-600 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Shield size={14} className="text-emerald-400" /> Central Real (Vault)
          </button>
          <button
            onClick={() => setActiveTab('commercial')}
            className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'commercial'
                ? 'border-indigo-600 text-indigo-600 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <ShoppingBag size={14} className="text-rose-500" /> Centro Comercial (MP)
          </button>
          <button
            onClick={() => setActiveTab('connector-center')}
            className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'connector-center'
                ? 'border-indigo-600 text-indigo-600 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
            id="btn-tab-connector-center"
          >
            <Database size={14} className="text-indigo-400" /> Central de Marketplaces (Hotmart/Kiwify)
          </button>
          <button
            onClick={() => setActiveTab('launch-center')}
            className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'launch-center'
                ? 'border-indigo-600 text-indigo-600 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
            id="btn-tab-launch-center"
          >
            <Rocket size={14} className="text-indigo-400" /> Diretor de Lançamentos
          </button>
          <button
            onClick={() => setActiveTab('customer-success')}
            className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'customer-success'
                ? 'border-indigo-600 text-indigo-600 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
            id="btn-tab-customer-success"
          >
            <HeartHandshake size={14} className="text-pink-500 animate-pulse" /> Sucesso do Cliente
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'marketplace'
                ? 'border-indigo-600 text-indigo-600 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
            id="btn-tab-marketplace"
          >
            <ShoppingBag size={14} className="text-indigo-500" /> Marketplace IA
          </button>
          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'workspace'
                ? 'border-indigo-600 text-indigo-600 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
            id="btn-tab-workspace"
          >
            <Shield size={14} className="text-indigo-400" /> Meu Workspace & SaaS
          </button>
          <button
            onClick={() => setActiveTab('enterprise')}
            className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'enterprise'
                ? 'border-indigo-600 text-indigo-600 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
            id="btn-tab-enterprise"
          >
            <Activity size={14} className="text-indigo-400" /> Enterprise Ops Center
          </button>
          <button
            onClick={() => setActiveTab('product-factory')}
            className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'product-factory'
                ? 'border-indigo-600 text-indigo-600 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
            id="btn-tab-product-factory"
          >
            <Cpu size={14} className="text-indigo-400 animate-spin-slow" /> AI Product Factory
          </button>
          <button
            onClick={() => setActiveTab('sales-channels')}
            className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'sales-channels'
                ? 'border-indigo-600 text-indigo-600 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
            id="btn-tab-sales-channels"
          >
            <Zap size={14} className="text-indigo-500 animate-pulse" /> Central de Canais (Vendas/Tráfego)
          </button>
          <button
            onClick={() => setActiveTab('evolution')}
            className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'evolution'
                ? 'border-indigo-600 text-indigo-600 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
            id="btn-tab-evolution"
          >
            <Cpu size={14} className="text-indigo-500" /> Evolução de Agentes IA
          </button>
          <button
            onClick={() => setActiveTab('growth')}
            className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'growth'
                ? 'border-indigo-600 text-indigo-600 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
            id="btn-tab-growth"
          >
            <TrendingUp size={14} className="text-indigo-500 animate-pulse" /> Crescimento Autônomo
          </button>
          <button
            onClick={() => setActiveTab('global_expansion')}
            className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'global_expansion'
                ? 'border-indigo-600 text-indigo-600 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
            id="btn-tab-global-expansion"
          >
            <Globe size={14} className="text-pink-500 animate-pulse" /> Expansão Global & L10n
          </button>
        </div>

        {/* Tab contents with smooth entry animations */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Introduction & Quick-start helper */}
                {products.length === 0 && (
                  <div className="bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-transparent border border-indigo-150 rounded-2xl p-6 relative overflow-hidden">
                    <div className="relative z-10 max-w-3xl space-y-2">
                      <h3 className="text-base font-black text-indigo-950 dark:text-indigo-200">
                        Bem-vindo ao AI Business Factory! 🚀
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Esta é uma fábrica automatizada de negócios digitais estruturada por 10 Agentes especializados independentes de IA (do CEO ao Diretor Financeiro). Cada agente opera em sua área específica utilizando o Gemini 3.5 para conceber o conceito, estruturar os módulos, redigir o e-book principal, criar copies, planejar finanças e validar a qualidade!
                      </p>
                      <button
                        onClick={() => setShowProductModal(true)}
                        className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all"
                      >
                        <Sparkles size={13} /> Criar Meu Primeiro Infoproduto
                      </button>
                    </div>
                  </div>
                )}

                {/* Central de Conectores Rápidos (Marketplaces) */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm" id="widget-quick-connectors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <Database className="text-indigo-500 animate-pulse" size={18} />
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                          Conectores de Vendas <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold px-2 py-0.5 rounded-full">Acesso Rápido</span>
                        </h3>
                        <p className="text-[11px] text-slate-400">Ative checkouts externos em tempo real e integre o Finance e CS Agents.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('connector-center')}
                      className="text-xs font-bold text-indigo-500 flex items-center gap-1 hover:underline self-start sm:self-auto"
                      id="btn-shortcut-connector-center"
                    >
                      Painel de Controle Avançado <Rocket size={12} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                      { id: 'hotmart', name: 'Hotmart', letter: 'H', color: 'from-orange-500/20 to-amber-600/10 border-orange-500/30 text-orange-500 bg-orange-500/10' },
                      { id: 'kiwify', name: 'Kiwify', letter: 'K', color: 'from-green-500/20 to-emerald-600/10 border-green-500/30 text-green-500 bg-green-500/10' },
                      { id: 'eduzz', name: 'Eduzz', letter: 'E', color: 'from-yellow-500/20 to-amber-500/10 border-yellow-500/30 text-yellow-500 bg-yellow-500/10' },
                      { id: 'monetizze', name: 'Monetizze', letter: 'M', color: 'from-blue-500/20 to-indigo-600/10 border-blue-500/30 text-blue-500 bg-blue-500/10' },
                      { id: 'braip', name: 'Braip', letter: 'B', color: 'from-purple-500/20 to-indigo-600/10 border-purple-500/30 text-purple-500 bg-purple-500/10' }
                    ].map((platform) => {
                      const connInfo = connectors.find(c => c.id === platform.id);
                      const isConnected = connInfo?.status === 'CONNECTED';
                      const isSyncing = connInfo?.status === 'SYNCING';
                      const isError = connInfo?.status === 'ERROR';
                      
                      const revenue = connInfo?.metrics?.totalRevenue || 0;
                      const salesCount = connInfo?.metrics?.totalSales || 0;

                      const testTokens: Record<string, string> = {
                        hotmart: 'HOT-TEST-TOKEN-123456-SECRET',
                        kiwify: 'KIW-TEST-TOKEN-987654-SECRET',
                        eduzz: 'EDZ-TEST-TOKEN-456123-SECRET',
                        monetizze: 'MON-TEST-TOKEN-789321-SECRET',
                        braip: 'BRP-TEST-TOKEN-321789-SECRET',
                      };

                      return (
                        <div 
                          key={platform.id}
                          className={`p-4 bg-slate-50 dark:bg-slate-950 border rounded-xl flex flex-col justify-between transition-all duration-200 ${
                            isConnected ? 'border-indigo-500/40 shadow-sm dark:shadow-indigo-500/5' : 'border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div>
                            {/* Platform Info */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm border ${platform.color}`}>
                                  {platform.letter}
                                </div>
                                <div>
                                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100">{platform.name}</h4>
                                  <span className="text-[9px] text-slate-400">Gateway</span>
                                </div>
                              </div>
                              
                              {/* Connection Status Badge */}
                              {isConnected ? (
                                <span className="flex h-2 w-2 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                              ) : isSyncing ? (
                                <RefreshCw size={10} className="animate-spin text-blue-500" />
                              ) : (
                                <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                              )}
                            </div>

                            {/* Status label */}
                            <div className="flex items-center justify-between text-[10px] mb-2 px-1">
                              <span className="text-slate-500">Status:</span>
                              <span className={`font-bold ${
                                isConnected ? 'text-emerald-500' : isError ? 'text-rose-500' : 'text-slate-400'
                              }`}>
                                {isConnected ? 'Conectado' : isError ? 'Erro Token' : 'Inativo'}
                              </span>
                            </div>

                            {/* Faturamento Mini-Stats */}
                            {isConnected && (
                              <div className="text-[10px] bg-indigo-50/50 dark:bg-slate-900/60 p-2 rounded border border-indigo-100/30 dark:border-slate-800 mb-3 space-y-0.5">
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Vendas:</span>
                                  <span className="font-bold text-slate-700 dark:text-slate-300">{salesCount}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Total:</span>
                                  <span className="font-bold text-emerald-500">R$ {revenue.toLocaleString('pt-BR')}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Quick Actions Footer */}
                          <div className="space-y-2 mt-2">
                            {isConnected ? (
                              <button
                                onClick={() => handleQuickDisconnect(platform.id)}
                                disabled={disconnectingProvider === platform.id}
                                className="w-full py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-500/20 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1"
                              >
                                {disconnectingProvider === platform.id ? (
                                  <>
                                    <RefreshCw size={10} className="animate-spin" /> Desconectando...
                                  </>
                                ) : (
                                  <>
                                    <Power size={10} /> Desconectar
                                  </>
                                )}
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleQuickConnect(platform.id, testTokens[platform.id])}
                                  disabled={connectingProvider === platform.id}
                                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-1 shadow-sm"
                                >
                                  {connectingProvider === platform.id ? (
                                    <>
                                      <RefreshCw size={10} className="animate-spin" /> Conectando...
                                    </>
                                  ) : (
                                    <>
                                      <Zap size={10} /> Conexão 1-Clique
                                    </>
                                  )}
                                </button>

                                {customTokenProvider !== platform.id ? (
                                  <button
                                    onClick={() => {
                                      setCustomTokenProvider(platform.id);
                                      setCustomToken('');
                                    }}
                                    className="w-full py-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-[9px] font-bold text-center border border-transparent hover:border-slate-200 dark:hover:border-slate-800 rounded transition-all"
                                  >
                                    Inserir Token
                                  </button>
                                ) : (
                                  <div className="pt-1.5 space-y-1 border-t border-slate-100 dark:border-slate-800">
                                    <input
                                      type="password"
                                      placeholder="Token da API..."
                                      value={customToken}
                                      onChange={(e) => setCustomToken(e.target.value)}
                                      className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded text-[9px] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                                    />
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => handleQuickConnect(platform.id, customToken)}
                                        disabled={!customToken || connectingProvider === platform.id}
                                        className="w-1/2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[9px] font-bold transition-all"
                                      >
                                        Salvar
                                      </button>
                                      <button
                                        onClick={() => setCustomTokenProvider(null)}
                                        className="w-1/2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[9px] font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Ready for Market Pipeline Summary Widget */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <Rocket className="text-indigo-500" size={16} /> Estágio Ready for Market
                      </h3>
                      <p className="text-[11px] text-slate-400">Atração comercial e progresso dos ativos digitais concebidos.</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('ready-for-market')}
                      className="px-3 py-1 bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white text-indigo-500 dark:text-indigo-400 font-bold rounded-lg text-[10px] transition-all flex items-center gap-1 font-mono"
                    >
                      Ver Pipeline Completo <ArrowRight size={10} />
                    </button>
                  </div>

                  {products.length === 0 ? (
                    <div className="text-center py-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-900/60">
                      <p className="text-[11px] text-slate-500">Nenhum produto em esteira ativa. Use a Sala do CEO para criar o primeiro lote.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { 
                          name: 'Rascunhos (Draft)', 
                          count: products.filter(p => !p.marketStatus || p.marketStatus === 'draft').length,
                          color: 'border-amber-500/10 text-amber-500 bg-amber-500/[0.02]',
                          icon: Clock
                        },
                        { 
                          name: 'Ativos Otimizados', 
                          count: products.filter(p => p.marketStatus === 'optimized').length,
                          color: 'border-indigo-500/10 text-indigo-400 bg-indigo-500/[0.02]',
                          icon: Sparkles
                        },
                        { 
                          name: 'Prontos para Venda', 
                          count: products.filter(p => p.marketStatus === 'ready').length,
                          color: 'border-emerald-500/10 text-emerald-400 bg-emerald-500/[0.02]',
                          icon: CheckCircle
                        }
                      ].map((card, idx) => {
                        const CardIcon = card.icon;
                        return (
                          <div key={idx} className={`border rounded-xl p-3 flex items-center justify-between ${card.color}`}>
                            <div className="space-y-1">
                              <span className="block text-[9px] text-slate-400 font-bold uppercase font-mono">{card.name}</span>
                              <span className="block font-mono font-black text-sm text-slate-900 dark:text-white">{card.count}</span>
                            </div>
                            <CardIcon size={16} className="opacity-70 shrink-0" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Agents Grid inside Overview */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm tracking-tight">Agentes da Fábrica</h3>
                      <p className="text-[11px] text-slate-400">Clique na aba Laboratório para configurar cada agente.</p>
                    </div>
                    <button
                      onClick={() => setShowAgentModal(true)}
                      className="text-xs font-bold text-indigo-500 flex items-center gap-1 hover:underline"
                    >
                      <Plus size={12} /> Contratar Novo Agente
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {agents.map((agent, i) => (
                      <AgentCard
                        key={agent.id}
                        id={`agent-card-${agent.id}`}
                        agent={agent}
                        onConfigure={handleConfigureAgent}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'ceo' && (
              <motion.div
                key="ceo"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <CEOPanel products={products} onRefreshAll={fetchState} />
              </motion.div>
            )}

            {activeTab === 'research' && (
              <motion.div
                key="research"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ResearchPanel jwtToken={jwtToken} onRefreshState={fetchState} />
              </motion.div>
            )}

            {activeTab === 'market-analyst' && (
              <motion.div
                key="market-analyst"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <MarketAnalystPanel jwtToken={jwtToken} onRefreshState={fetchState} />
              </motion.div>
            )}

            {activeTab === 'queue' && (
              <motion.div
                key="queue"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TaskQueue id="factory-pipeline-queue" tasks={tasks} />
              </motion.div>
            )}

            {activeTab === 'inventory' && (
              <motion.div
                key="inventory"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ProductViewer id="factory-product-viewer" products={products} onRefreshState={fetchState} />
              </motion.div>
            )}

            {activeTab === 'product-lab' && (
              <motion.div
                key="product-lab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ProductLaboratoryPanel jwtToken={jwtToken} onRefreshState={fetchState} />
              </motion.div>
            )}

            {activeTab === 'writer-studio' && (
              <motion.div
                key="writer-studio"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ContentStudioPanel jwtToken={jwtToken} onRefreshState={fetchState} />
              </motion.div>
            )}

            {activeTab === 'design-studio' && (
              <motion.div
                key="design-studio"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <DesignStudioPanel jwtToken={jwtToken} onRefreshState={fetchState} />
              </motion.div>
            )}

            {activeTab === 'marketing-center' && (
              <motion.div
                key="marketing-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <MarketingCenterPanel jwtToken={jwtToken} onRefreshState={fetchState} />
              </motion.div>
            )}

            {activeTab === 'publisher-center' && (
              <motion.div
                key="publisher-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <PublisherCenterPanel jwtToken={jwtToken} onRefreshState={fetchState} />
              </motion.div>
            )}

            {activeTab === 'finance-center' && (
              <motion.div
                key="finance-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <FinanceCenterPanel jwtToken={jwtToken} onRefreshState={fetchState} />
              </motion.div>
            )}

            {activeTab === 'lab' && (
              <motion.div
                key="lab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-950 dark:text-white">Agentes Customizados & Governança</h3>
                    <p className="text-xs text-slate-400">Instancie novas inteligências com especialidades dedicadas para integrar ao ecossistema.</p>
                  </div>
                  <button
                    onClick={() => setShowAgentModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow"
                  >
                    <Plus size={14} /> Contratar Novo Agente
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {agents.map(agent => (
                    <div 
                      key={agent.id}
                      className="p-5 rounded-xl border border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900 shadow-sm"
                    >
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{agent.name}</h4>
                      <p className="text-xs text-indigo-500 font-semibold mb-2">{agent.role}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">{agent.description}</p>
                      
                      <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-850">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Eficiência Operacional:</span>
                          <span className="font-bold text-indigo-500">{agent.efficiency}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="100"
                          value={agent.efficiency}
                          onChange={(e) => handleConfigureAgent(agent.id, parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'infra' && (
              <motion.div
                key="infra"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-base font-bold text-slate-950 dark:text-white">Auditoria Geral da Infraestrutura</h3>
                  <p className="text-xs text-slate-400">Camada de resiliência e validação técnica da Etapa 2 (PostgreSQL, Segurança JWT, APIs REST e Suíte de Testes).</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Bloco de Latência e Persistência Híbrida */}
                  <div className="p-5 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-500">
                            <Activity size={18} />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Latência & Saúde</h4>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Persistência Híbrida</span>
                          </div>
                        </div>
                        {latencyData && (
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            latencyData.status === 'excellent' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' :
                            latencyData.status === 'good' ? 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400' :
                            'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                          }`}>
                            {latencyData.status === 'excellent' ? 'Excelente' : latencyData.status === 'good' ? 'Bom' : 'Atenção'}
                          </span>
                        )}
                      </div>

                      <div className="space-y-3 text-xs">
                        {/* Latência de Rede/Express */}
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 space-y-1">
                          <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Latência do Servidor (HTTP):</span>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-base font-extrabold text-slate-850 dark:text-slate-100">
                              {isMeasuringLatency ? 'Medindo...' : latencyData ? `${latencyData.latencyMs} ms` : 'Clique em testar'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">tempo de resposta</span>
                          </div>
                        </div>

                        {/* Latência de Banco de Dados */}
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 space-y-1">
                          <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Latência da Camada de Dados:</span>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-base font-extrabold text-slate-850 dark:text-slate-100">
                              {isMeasuringLatency ? 'Medindo...' : latencyData ? `${latencyData.dbLatencyMs} ms` : 'Clique em testar'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">tempo de consulta</span>
                          </div>
                        </div>

                        {/* Driver Ativo */}
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 space-y-2">
                          <div>
                            <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Motor de Banco Ativo:</span>
                            <div className="flex items-center gap-1.5 font-bold mt-1">
                              <span className={`w-2 h-2 rounded-full ${latencyData?.database?.disablePGPermanently ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                              <span className={latencyData?.database?.disablePGPermanently ? 'text-amber-500' : 'text-emerald-500'}>
                                {latencyData?.database?.activeDriver || 'Sincronizando...'}
                              </span>
                            </div>
                          </div>
                          {latencyData?.database?.disablePGPermanently && (
                            <p className="text-[9px] text-amber-600 dark:text-amber-400/90 leading-tight">
                              PostgreSQL desativado preventivamente (Unix socket ENOENT). Fallback local ativo para latência zero.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={measureSystemLatency}
                      disabled={isMeasuringLatency}
                      className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={14} className={isMeasuringLatency ? "animate-spin" : ""} />
                      {isMeasuringLatency ? 'Medindo Latência...' : 'Testar Latência Real'}
                    </button>
                  </div>

                  {/* Bloco da Autenticação e Segurança */}
                  <div className="p-5 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-500">
                        <FolderLock size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">Identidade & Acesso JWT</h4>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Tokens Bearer Seguros</span>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs">
                      {isAuthLoading ? (
                        <div className="text-center py-4 text-slate-400 text-xs">Obtendo chaves criptografadas...</div>
                      ) : (
                        <>
                          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Sessão Autenticada:</span>
                              <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-extrabold text-[9px] uppercase tracking-wider">
                                {currentUser?.role || 'admin'}
                              </span>
                            </div>
                            <div className="font-bold text-slate-850 dark:text-slate-200">
                              {currentUser?.name || 'Administrador Principal'}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {currentUser?.email || 'admin@factory.com'}
                            </div>
                          </div>

                          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 space-y-1">
                            <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Token JWT Bearer Ativo:</span>
                            <div className="font-mono text-[9px] text-indigo-500 break-all select-all leading-relaxed p-1.5 bg-slate-100 dark:bg-slate-900/60 rounded border border-slate-200/50 dark:border-slate-800">
                              {jwtToken ? `${jwtToken.substring(0, 32)}...${jwtToken.substring(jwtToken.length - 24)}` : 'Nenhum token ativo.'}
                            </div>
                            <span className="text-[9px] text-slate-400 block pt-1">Cabeçalho automático anexado a todas as rotas administrativas protegidas do sistema.</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Bloco dos Testes de Qualidade */}
                  <div className="p-5 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2.5 mb-4">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-500">
                          <CheckSquare size={18} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Testes de Infraestrutura</h4>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Pipeline Validation Suite</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal mb-4">
                        Execute a bateria automatizada de testes integrados para testar autenticação bcrypt, expiração de JWT, criptografia, leitura híbrida e logs estruturados no banco.
                      </p>

                      {testResults && (
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-xs space-y-1.5 font-sans mb-3">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-[10px] font-bold uppercase">Resultado da Suíte:</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${testResults.success ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 text-rose-600'}`}>
                              {testResults.success ? '100% SUCESSO' : 'FALHA'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-300">
                            <span>Testes Passados:</span>
                            <span className="font-bold text-emerald-500">{testResults.metrics?.passed}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-300">
                            <span>Testes Falhados:</span>
                            <span className="font-bold text-rose-500">{testResults.metrics?.failed}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={runInfrastructureSuite}
                      disabled={isTesting}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white text-xs font-bold shadow-lg transition-all"
                    >
                      {isTesting ? 'Executando testes...' : 'Disparar Testes Automatizados'}
                    </button>
                  </div>
                </div>

                {/* API REST Docs Catalog */}
                {apiDocs && (
                  <div className="p-6 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-500">
                          <Wrench size={18} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{apiDocs.title}</h4>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Catálogo Dinâmico de Endpoints - Versão {apiDocs.version}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-500 text-[10px] font-mono border border-indigo-500/20">{apiDocs.security}</span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">{apiDocs.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {apiDocs.endpoints.map((ep: any, index: number) => (
                        <div 
                          key={index}
                          className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 space-y-2.5 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-1 rounded text-[9px] font-extrabold uppercase font-mono ${ep.method === 'POST' ? 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400' : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400'}`}>
                              {ep.method}
                            </span>
                            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">{ep.scope}</span>
                          </div>
                          
                          <div className="font-mono text-slate-900 dark:text-white font-bold select-all bg-slate-100 dark:bg-slate-900 p-1.5 rounded text-[11px] border border-slate-200/40 dark:border-slate-850">
                            {ep.path}
                          </div>

                          <p className="text-[11px] text-slate-400 leading-relaxed">{ep.description}</p>

                          {ep.body && (
                            <div className="space-y-1">
                              <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Request Payload:</span>
                              <pre className="text-[9px] text-slate-500 font-mono p-2 bg-slate-100 dark:bg-slate-900/40 rounded border border-slate-200/30 dark:border-slate-850 overflow-x-auto">
                                {JSON.stringify(ep.body, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'supervisor' && (
              <motion.div
                key="supervisor"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <SupervisorPanel />
              </motion.div>
            )}

            {activeTab === 'repair' && (
              <motion.div
                key="repair"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <RepairPanel />
              </motion.div>
            )}

            {activeTab === 'kernel' && (
              <motion.div
                key="kernel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <KernelPanel />
              </motion.div>
            )}

            {activeTab === 'integration' && (
              <motion.div
                key="integration"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <IntegrationPanel />
              </motion.div>
            )}

            {activeTab === 'integration-center' && (
              <motion.div
                key="integration-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <IntegrationCenterPanel />
              </motion.div>
            )}

            {activeTab === 'commercial' && (
              <motion.div
                key="commercial"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <CommercialCenterPanel />
              </motion.div>
            )}

            {activeTab === 'connector-center' && (
              <motion.div
                key="connector-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ConnectorCenterPanel />
              </motion.div>
            )}

            {activeTab === 'launch-center' && (
              <motion.div
                key="launch-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <LaunchCenterPanel jwtToken={jwtToken} onRefreshState={fetchState} />
              </motion.div>
            )}

            {activeTab === 'customer-success' && (
              <motion.div
                key="customer-success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <CustomerSuccessPanel jwtToken={jwtToken || undefined} onRefreshState={fetchState} />
              </motion.div>
            )}

            {activeTab === 'marketplace' && (
              <motion.div
                key="marketplace"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <MarketplacePanel jwtToken={jwtToken || undefined} onRefreshState={fetchState} />
              </motion.div>
            )}

            {activeTab === 'workspace' && (
              <motion.div
                key="workspace"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <SaaSAreaPanel jwtToken={jwtToken || undefined} onRefreshState={fetchState} />
              </motion.div>
            )}

            {activeTab === 'enterprise' && (
              <motion.div
                key="enterprise"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <EnterpriseOperationsCenter jwtToken={jwtToken || undefined} onRefreshState={fetchState} />
              </motion.div>
            )}

            {activeTab === 'product-factory' && (
              <motion.div
                key="product-factory"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ProductFactoryPanel jwtToken={jwtToken || undefined} onRefreshState={fetchState} />
              </motion.div>
            )}

            {activeTab === 'sales-channels' && (
              <motion.div
                key="sales-channels"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <SalesChannelPanel />
              </motion.div>
            )}

            {activeTab === 'evolution' && (
              <motion.div
                key="evolution"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <EvolutionPanel />
              </motion.div>
            )}

            {activeTab === 'growth' && (
              <motion.div
                key="growth"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <GrowthPanel jwtToken={jwtToken} onRefreshState={fetchState} />
              </motion.div>
            )}

            {activeTab === 'global_expansion' && (
              <motion.div
                key="global_expansion"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <GlobalExpansionPanel />
              </motion.div>
            )}

            {activeTab === 'ready-for-market' && (
              <motion.div
                key="ready-for-market"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ReadyForMarketPipeline 
                  products={products} 
                  onRefreshState={fetchState} 
                  setActiveTab={setActiveTab} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>

      {/* POPUP MODAL: NEW DIGITAL PRODUCT DEVELOPMENT */}
      {showProductModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 shadow-2xl relative"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
              <Sparkles className="text-indigo-500 w-5 h-5" />
              Desenvolver Novo Infoproduto
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Defina o tema para que a corporação de múltiplos agentes conceba uma solução digital real baseada em mercado de infoprodutos.
            </p>

            <form onSubmit={handleRunNewProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1.5 uppercase">
                  Nicho de Mercado / Ideia Central
                </label>
                <input
                  type="text"
                  required
                  value={newNiche}
                  onChange={(e) => setNewNiche(e.target.value)}
                  placeholder="Ex: Emagrecimento, Curso de Investimentos para Iniciantes"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:outline-none dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1.5 uppercase">
                  Nome Sugerido do Infoproduto
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Fórmula do Trader, Desafio Fit30"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:outline-none dark:text-white"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-750 text-slate-600 dark:text-slate-400 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow"
                >
                  Iniciar Lote &rarr;
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* POPUP MODAL: CREATE CUSTOM AGENT */}
      {showAgentModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 shadow-2xl relative"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
              <Users className="text-indigo-500 w-5 h-5" />
              Contratar Novo Agente Especialista
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Adicione um novo papel autônomo ao escopo operacional de inteligências artificiais da fábrica de negócios.
            </p>

            <form onSubmit={handleCreateAgent} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1.5 uppercase">
                  Nome do Agente
                </label>
                <input
                  type="text"
                  required
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Ex: Legal Compliance Agent, SEO Content Auditor"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:outline-none dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1.5 uppercase">
                  Função Executiva
                </label>
                <input
                  type="text"
                  required
                  value={agentRole}
                  onChange={(e) => setAgentRole(e.target.value)}
                  placeholder="Ex: Auditor Jurídico e de Termos de Uso"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:outline-none dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1.5 uppercase">
                  Descrição do Trabalho / Prompt de Contexto
                </label>
                <textarea
                  required
                  value={agentDesc}
                  onChange={(e) => setAgentDesc(e.target.value)}
                  placeholder="Descreva as responsabilidades, foco de entrega e as metas de atuação que o agente terá na esteira..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:outline-none dark:text-white resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAgentModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-750 text-slate-600 dark:text-slate-400 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow"
                >
                  Registrar Agente
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};
