import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Search,
  BookOpen,
  FileText,
  DollarSign,
  Rocket,
  Plus,
  RefreshCw,
  Award,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Layers,
  Compass,
  Check,
  Send,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { ProductProject, ProductFormatType, ProjectStepType } from '../productFactory/productTypes.ts';

interface ProductFactoryPanelProps {
  jwtToken?: string;
  onRefreshState?: () => void;
}

export const ProductFactoryPanel: React.FC<ProductFactoryPanelProps> = ({ jwtToken, onRefreshState }) => {
  const [projects, setProjects] = useState<ProductProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [niche, setNiche] = useState('');
  const [audience, setAudience] = useState('');
  const [goal, setGoal] = useState('');
  const [experience, setExperience] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'projects'>('create');
  const [selectedMarketplace, setSelectedMarketplace] = useState<'kiwify' | 'hotmart' | 'eduzz' | 'monetizze' | 'braip'>('kiwify');

  // Agent interaction visual simulation logs
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  const [activeProcessingStep, setActiveProcessingStep] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/product-factory/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
        if (data.projects && data.projects.length > 0 && !selectedProjectId) {
          setSelectedProjectId(data.projects[0].id);
        }
      }
    } catch (err: any) {
      setErrorMessage('Erro ao carregar projetos.');
    } finally {
      setLoading(false);
    }
  };

  const addAgentLog = (msg: string) => {
    setAgentLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche || !audience || !goal) return;

    try {
      setLoading(true);
      setAgentLogs([]);
      setActiveProcessingStep('Coordenando Ideia');
      addAgentLog('CEO Agent: Analisando as diretrizes de nicho e público-alvo...');
      addAgentLog('ProductIdeaGeneratorAgent: Iniciando varredura criativa de mercado...');

      const res = await fetch('/api/product-factory/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, audience, goal, experience })
      });

      if (!res.ok) throw new Error('Falha ao gerar proposta de infoproduto.');

      const data = await res.json();
      addAgentLog(`Supervisor Agent: Nova ideia de produto criada com sucesso! ID: ${data.project.id}`);
      addAgentLog(`Product Creator Agent: Proposta formulada: "${data.project.idea.name}" (${data.project.idea.format})`);

      setProjects(prev => [data.project, ...prev]);
      setSelectedProjectId(data.project.id);
      setActiveTab('projects');

      // Clear Form
      setNiche('');
      setAudience('');
      setGoal('');
      setExperience('');
      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
      setActiveProcessingStep(null);
    }
  };

  // Step functions
  const handleValidateMarket = async (id: string) => {
    try {
      setLoading(true);
      setActiveProcessingStep('Validando Mercado');
      setAgentLogs([]);
      addAgentLog('Research Agent: Escaneando tendências de mercado, volume de buscas e dores...');
      addAgentLog('Market Analyst Agent: Calculando score competitivo e identificando dores do público...');

      const res = await fetch('/api/product-factory/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: id })
      });

      if (!res.ok) throw new Error('Falha ao validar mercado.');
      const data = await res.json();

      setProjects(prev => prev.map(p => p.id === id ? data.project : p));
      addAgentLog(`Market Analyst Agent: Validação concluída. Score de oportunidade: ${data.project.validation.score}/100.`);

      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
      setActiveProcessingStep(null);
    }
  };

  const handleGenerateBlueprint = async (id: string) => {
    try {
      setLoading(true);
      setActiveProcessingStep('Gerando Blueprint');
      setAgentLogs([]);
      addAgentLog('Product Creator Agent: Estruturando módulos didáticos e capítulos...');
      addAgentLog('CEO Agent: Validando alinhamento estratégico da grade de conteúdo...');

      const res = await fetch('/api/product-factory/blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: id })
      });

      if (!res.ok) throw new Error('Falha ao gerar blueprint.');
      const data = await res.json();

      setProjects(prev => prev.map(p => p.id === id ? data.project : p));
      addAgentLog(`Product Creator Agent: Blueprint didático gerado com ${data.project.blueprint.items.length} módulos.`);

      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
      setActiveProcessingStep(null);
    }
  };

  const handleGenerateContent = async (id: string) => {
    try {
      setLoading(true);
      setActiveProcessingStep('Gerando Conteúdo');
      setAgentLogs([]);
      addAgentLog('Writer Agent: Redigindo os textos, capítulos e scripts de vídeo...');
      addAgentLog('Designer Agent: Concebendo prompts estéticos para capas e materiais visuais...');
      addAgentLog('Marketing Agent: Desenvolvendo copies altamente persuasivas para anúncios...');

      const res = await fetch('/api/product-factory/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: id })
      });

      if (!res.ok) throw new Error('Falha ao gerar conteúdo.');
      const data = await res.json();

      setProjects(prev => prev.map(p => p.id === id ? data.project : p));
      addAgentLog(`Writer Agent: Redação concluída com sucesso.`);
      addAgentLog(`Designer Agent: Criativos e capas prontos.`);

      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
      setActiveProcessingStep(null);
    }
  };

  const handleCreateOffer = async (id: string) => {
    try {
      setLoading(true);
      setActiveProcessingStep('Estruturando Oferta');
      setAgentLogs([]);
      addAgentLog('Finance Agent: Calculando modelo de custos, margem de contribuição e preço sugerido...');
      addAgentLog('Marketing Agent: Elaborando bônus irresistíveis, garantias e headline de vendas...');

      const res = await fetch('/api/product-factory/create-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: id })
      });

      if (!res.ok) throw new Error('Falha ao gerar oferta.');
      const data = await res.json();

      setProjects(prev => prev.map(p => p.id === id ? data.project : p));
      addAgentLog(`Finance Agent: Preço sugerido calculado em R$ ${data.project.offer.suggestedPrice}.`);
      addAgentLog(`AI Product Score: ${data.project.score.overallScore}/100. Recomendação: ${data.project.score.recommendation}`);

      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
      setActiveProcessingStep(null);
    }
  };

  const handleLaunchProduct = async (id: string, marketplace: string = 'kiwify') => {
    try {
      setLoading(true);
      setActiveProcessingStep('Disparando Lançamento');
      setAgentLogs([]);
      addAgentLog(`Publisher Agent: Registrando produto na esteira de distribuição comercial de ${marketplace.toUpperCase()}...`);
      addAgentLog('Launch & Sales Automation Agent: Iniciando campanhas automatizadas (Meta Ads, Email, WhatsApp)...');
      addAgentLog('Marketplace IA: Cadastrando produto como template comercial vendível...');

      const res = await fetch('/api/product-factory/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: id, marketplace })
      });

      if (!res.ok) throw new Error('Falha ao lançar produto.');
      const data = await res.json();

      setProjects(prev => prev.map(p => p.id === id ? data.project : p));
      addAgentLog(`Launch Agent: Lançamento efetuado com absoluto sucesso! Campanhas ativas.`);

      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
      setActiveProcessingStep(null);
    }
  };

  const currentProject = projects.find(p => p.id === selectedProjectId);

  // Statistics calculation for Dashboard cards
  const totalCreated = projects.length;
  const inDevelopment = projects.filter(p => p.status === 'PENDING').length;
  const averageScore = projects.length > 0 
    ? Math.round(projects.reduce((acc, p) => acc + (p.score?.overallScore || p.validation?.score || 0), 0) / projects.length)
    : 0;
  const estimatedRevenuePotential = projects.length > 0
    ? projects.reduce((acc, p) => acc + ((p.offer?.suggestedPrice || 97) * 250), 0)
    : 0;

  return (
    <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl border border-slate-800 shadow-2xl" id="ai-product-factory-panel">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
              <Cpu className="w-5 h-5 animate-spin-slow" />
            </span>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              AI Product Factory
            </h1>
          </div>
          <p className="text-slate-400 text-xs">
            Motor avançado para automação completa de infoprodutos via agentes de IA.
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-all ${
              activeTab === 'create'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
            id="btn-factory-tab-create"
          >
            <Plus size={14} /> Nova Ideia
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-all ${
              activeTab === 'projects'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
            id="btn-factory-tab-projects"
          >
            <Layers size={14} /> Meus Projetos ({projects.length})
          </button>
          <button
            onClick={fetchProjects}
            className="p-2 bg-slate-800 text-slate-400 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
            title="Recarregar projetos"
            id="btn-factory-refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Produtos Criados</p>
          <p className="text-2xl font-bold text-slate-100">{totalCreated}</p>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Em Desenvolvimento</p>
          <p className="text-2xl font-bold text-amber-500">{inDevelopment}</p>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Score Médio</p>
          <p className="text-2xl font-bold text-indigo-400">{averageScore}/100</p>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Potencial de Receita</p>
          <p className="text-2xl font-bold text-emerald-400">R$ {estimatedRevenuePotential.toLocaleString('pt-BR')}</p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2" id="factory-error-msg">
          <AlertCircle size={14} />
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="ml-auto hover:text-white font-bold">×</button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {activeTab === 'create' ? (
          <div className="lg:col-span-12">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/80 max-w-3xl mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-indigo-400 w-5 h-5" />
                <h2 className="text-lg font-bold text-slate-100">Product Idea Generator</h2>
              </div>
              <p className="text-slate-400 text-xs mb-6">
                Forneça o escopo inicial para o <strong>ProductIdeaGeneratorAgent</strong>. Ele identificará oportunidades e sugerirá formatos e escopos estratégicos promissores.
              </p>

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1.5">Nicho de Mercado</label>
                  <input
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="Ex: Marketing Digital para Dentistas, IA para Pequenos Negócios, Finanças para Universitários..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    required
                    id="input-factory-niche"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1.5">Público-Alvo</label>
                  <input
                    type="text"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="Ex: Dentistas autônomos que querem atrair mais pacientes de alta renda"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    required
                    id="input-factory-audience"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-xs font-semibold mb-1.5">Objetivo Principal do Produto</label>
                    <input
                      type="text"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      placeholder="Ex: Reduzir tempo com burocracias e captar mais leads..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                      required
                      id="input-factory-goal"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-semibold mb-1.5">Sua Experiência (Opcional)</label>
                    <input
                      type="text"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="Ex: Tenho 3 anos de experiência em vendas locais..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                      id="input-factory-experience"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading || !niche || !audience || !goal}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                    id="btn-factory-submit"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="animate-spin w-4 h-4" /> Coordenando Agentes...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Gerar Ideia com Inteligência Artificial
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <>
            {/* Left Column: Projects Selection & Status Pipeline */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Lista de Projetos</h3>
                {projects.length === 0 ? (
                  <p className="text-slate-600 text-xs py-4 text-center">Nenhum projeto gerado ainda.</p>
                ) : (
                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {projects.map((proj) => (
                      <button
                        key={proj.id}
                        onClick={() => setSelectedProjectId(proj.id)}
                        className={`w-full text-left p-3 rounded-lg border transition flex flex-col gap-1 ${
                          selectedProjectId === proj.id
                            ? 'bg-indigo-950/40 border-indigo-500 text-slate-100'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
                        }`}
                        id={`btn-select-project-${proj.id}`}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="text-xs font-bold text-slate-100 truncate max-w-[140px]">
                            {proj.idea?.name || 'Carregando Proposta...'}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            proj.status === 'LAUNCHED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {proj.status === 'LAUNCHED' ? 'Lançado' : 'Pendente'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-1">{proj.input.niche}</p>
                        <div className="flex justify-between items-center w-full mt-2 border-t border-slate-800 pt-1.5">
                          <span className="text-[9px] text-indigo-400 font-semibold uppercase">{proj.currentStep}</span>
                          <span className="text-[9px] text-slate-500">{new Date(proj.createdAt).toLocaleDateString()}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Visual Pipeline Tracker (6 Steps) */}
              {currentProject && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Pipeline Visual de Produção</h3>
                  <div className="space-y-4 relative pl-3 border-l border-slate-800">
                    {([
                      { step: 'IDEIA', label: '1. Ideia Inicial', desc: 'Estruturação do Produto', done: !!currentProject.idea },
                      { step: 'VALIDACAO', label: '2. Validação de Mercado', desc: 'Análise de Oportunidades', done: !!currentProject.validation },
                      { step: 'BLUEPRINT', label: '3. Blueprint Didático', desc: 'Módulos e Tópicos de Grade', done: !!currentProject.blueprint },
                      { step: 'CONTEUDO', label: '4. Pipeline de Conteúdo', desc: 'Criação de Textos e Copies', done: !!currentProject.content },
                      { step: 'OFERTA', label: '5. Oferta e Precificação', desc: 'Score IA e Estratégia de Margem', done: !!currentProject.offer },
                      { step: 'LANCAMENTO', label: '6. Lançamento', desc: 'Disparos e Automação de Vendas', done: currentProject.status === 'LAUNCHED' }
                    ] as const).map((pStep, idx) => {
                      const isActive = currentProject.currentStep === pStep.step;
                      return (
                        <div key={idx} className="relative flex items-start gap-3">
                          {/* Indicator circle */}
                          <div className={`absolute -left-[19px] top-1 w-3 h-3 rounded-full border-2 transition ${
                            pStep.done 
                              ? 'bg-indigo-500 border-indigo-400' 
                              : isActive 
                                ? 'bg-amber-500 border-amber-400 animate-pulse' 
                                : 'bg-slate-950 border-slate-800'
                          }`} />
                          <div className="flex-1">
                            <p className={`text-xs font-bold ${isActive ? 'text-indigo-400' : pStep.done ? 'text-slate-100' : 'text-slate-600'}`}>
                              {pStep.label}
                            </p>
                            <p className="text-[10px] text-slate-500">{pStep.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Active Project Details & Actions */}
            <div className="lg:col-span-8 space-y-6">
              {currentProject ? (
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/80">
                  {/* Project Summary Banner */}
                  <div className="flex justify-between items-start border-b border-slate-800 pb-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-bold uppercase">
                          {currentProject.idea?.format || 'Infoproduto'}
                        </span>
                        <h2 className="text-lg font-bold text-slate-100">
                          {currentProject.idea?.name || 'Projeto de Conteúdo'}
                        </h2>
                      </div>
                      <p className="text-slate-400 text-xs mt-1">
                        Promessa: <span className="text-slate-300 italic">"{currentProject.idea?.promise}"</span>
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {/* Contextual Action Button based on current step */}
                      {!currentProject.validation && (
                        <button
                          onClick={() => handleValidateMarket(currentProject.id)}
                          disabled={loading}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                          id="btn-trigger-validate"
                        >
                          <Search size={14} /> Executar Validação de Mercado
                        </button>
                      )}

                      {currentProject.validation && !currentProject.blueprint && (
                        <button
                          onClick={() => handleGenerateBlueprint(currentProject.id)}
                          disabled={loading}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                          id="btn-trigger-blueprint"
                        >
                          <BookOpen size={14} /> Gerar Blueprint Didático
                        </button>
                      )}

                      {currentProject.blueprint && !currentProject.content && (
                        <button
                          onClick={() => handleGenerateContent(currentProject.id)}
                          disabled={loading}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                          id="btn-trigger-content"
                        >
                          <FileText size={14} /> Produzir Conteúdo & Criativos
                        </button>
                      )}

                      {currentProject.content && !currentProject.offer && (
                        <button
                          onClick={() => handleCreateOffer(currentProject.id)}
                          disabled={loading}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                          id="btn-trigger-offer"
                        >
                          <DollarSign size={14} /> Estruturar Oferta & IA Score
                        </button>
                      )}

                      {currentProject.offer && currentProject.status !== 'LAUNCHED' && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Plataforma:</span>
                            <select
                              value={selectedMarketplace}
                              onChange={(e) => setSelectedMarketplace(e.target.value as any)}
                              className="bg-transparent text-xs text-slate-100 font-bold focus:outline-none"
                            >
                              <option value="kiwify">Kiwify</option>
                              <option value="hotmart">Hotmart</option>
                              <option value="eduzz">Eduzz</option>
                              <option value="monetizze">Monetizze</option>
                              <option value="braip">Braip</option>
                            </select>
                          </div>
                          <button
                            onClick={() => handleLaunchProduct(currentProject.id, selectedMarketplace)}
                            disabled={loading}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                            id="btn-trigger-launch"
                          >
                            <Rocket size={14} /> Disparar Lançamento Automatizado
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dynamic step detail view blocks */}
                  <div className="space-y-6">
                    {/* Step 1: Ideia Details */}
                    {currentProject.idea && (
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="text-indigo-400 w-4.5 h-4.5" />
                          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                            1. Visão Geral da Oportunidade (ProductIdeaGeneratorAgent)
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="text-slate-500">Dor de Mercado Identificada:</p>
                            <p className="text-slate-300 font-medium mt-0.5">{currentProject.idea.painPoint}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Público Primário:</p>
                            <p className="text-slate-300 font-medium mt-0.5">{currentProject.idea.audience}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Formato Recomendado:</p>
                            <p className="text-slate-300 font-bold mt-0.5">{currentProject.idea.format}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Potencial Comercial Estimado:</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-slate-100 font-bold">{currentProject.idea.commercialPotential}/100</span>
                              <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-indigo-500 h-full" style={{ width: `${currentProject.idea.commercialPotential}%` }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Validation Details */}
                    {currentProject.validation && (
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="text-indigo-400 w-4.5 h-4.5" />
                          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                            2. Validação e Concorrência (ProductValidationAgent)
                          </h4>
                        </div>
                        <div className="space-y-3 text-xs">
                          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                            <span className="text-slate-400">Score de Oportunidade:</span>
                            <span className={`px-2 py-0.5 rounded font-bold ${
                              currentProject.validation.category === 'ALTA_OPORTUNIDADE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                            }`}>
                              {currentProject.validation.score}/100 ({currentProject.validation.category})
                            </span>
                          </div>
                          <div>
                            <p className="text-slate-500">Análise de Demanda:</p>
                            <p className="text-slate-300 mt-0.5">{currentProject.validation.demandAnalysis}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Análise de Concorrência:</p>
                            <p className="text-slate-300 mt-0.5">{currentProject.validation.competitionAnalysis}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                              <p className="text-slate-500 mb-1">Tendências Emergentes:</p>
                              <div className="flex flex-wrap gap-1">
                                {currentProject.validation.trends.map((t, idx) => (
                                  <span key={idx} className="bg-slate-950 px-2 py-0.5 rounded text-[10px] text-slate-400 border border-slate-800">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-slate-500 mb-1">Palavras-Chave de Intenção de Compra:</p>
                              <div className="flex flex-wrap gap-1">
                                {currentProject.validation.keywords.map((k, idx) => (
                                  <span key={idx} className="bg-slate-950 px-2 py-0.5 rounded text-[10px] text-indigo-300 border border-slate-800">
                                    {k}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Blueprint Details */}
                    {currentProject.blueprint && (
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="text-indigo-400 w-4.5 h-4.5" />
                          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                            3. Blueprint e Estrutura do Infoproduto (ProductBlueprintEngine)
                          </h4>
                        </div>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                          {currentProject.blueprint.items.map((item, idx) => (
                            <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                              <p className="text-xs font-bold text-indigo-400">{item.title}</p>
                              <p className="text-[10px] text-slate-400 italic mt-0.5">Objetivo: {item.objective}</p>
                              <div className="mt-2 pl-2 border-l border-slate-800 space-y-1">
                                {item.subItems.map((sub, sIdx) => (
                                  <div key={sIdx} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                                    <span className="w-1 h-1 bg-slate-500 rounded-full" />
                                    <span>{sub}</span>
                                  </div>
                                ))}
                              </div>
                              {item.exercises && item.exercises.length > 0 && (
                                <div className="mt-2 text-[10px] text-amber-500 bg-amber-500/5 px-2 py-1 rounded">
                                  <strong>Ação/Exercício:</strong> {item.exercises.join(', ')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 4: Content Assets Details */}
                    {currentProject.content && (
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="text-indigo-400 w-4.5 h-4.5" />
                          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                            4. Pipeline de Produção de Conteúdo (Writer & Designer Agent)
                          </h4>
                        </div>
                        <div className="space-y-4">
                          {/* Rich Text section */}
                          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Amostra de Texto Redigida (Writer Agent)</p>
                            {currentProject.content.texts.map((t, idx) => (
                              <div key={idx} className="text-xs text-slate-300 leading-relaxed">
                                <strong className="text-indigo-400 block mb-1">{t.title}</strong>
                                {t.body}
                              </div>
                            ))}
                          </div>

                          {/* Image Prompt / Generated visual */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
                              <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Geração de Capa / Criativos (Designer Agent)</p>
                                <p className="text-[10px] text-slate-500 italic">"Prompt de IA sugerido para imagem:"</p>
                                <p className="text-xs text-slate-300 mt-2">{currentProject.content.imagePrompt}</p>
                              </div>
                              {currentProject.content.imageUrl && (
                                <div className="mt-3 overflow-hidden rounded-lg border border-slate-800">
                                  <img src={currentProject.content.imageUrl} alt="Preview Capa" className="w-full h-32 object-cover" referrerPolicy="no-referrer" />
                                </div>
                              )}
                            </div>

                            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Campanha de Tráfego Pago (Marketing Agent)</p>
                              {currentProject.content.marketingAds.map((ad, idx) => (
                                <div key={idx} className="text-xs">
                                  <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 rounded font-bold block w-fit mb-1.5">{ad.channel}</span>
                                  <p className="text-slate-300 italic">"{ad.copy}"</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 5: Offer & Product Scoring */}
                    {currentProject.offer && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Offer */}
                        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className="text-indigo-400 w-4.5 h-4.5" />
                            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                              5. Estrutura da Oferta Irresistível
                            </h4>
                          </div>
                          <div className="space-y-3 text-xs">
                            <div>
                              <p className="text-slate-500">Headline:</p>
                              <p className="text-slate-200 font-bold">"{currentProject.offer.headline}"</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Benefícios:</p>
                              <ul className="list-disc list-inside space-y-1 text-slate-300 mt-1">
                                {currentProject.offer.benefits.map((b, idx) => (
                                  <li key={idx} className="line-clamp-1">{b}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="text-slate-500">Bônus inclusos:</p>
                              <div className="space-y-1 mt-1">
                                {currentProject.offer.bonus.map((b, idx) => (
                                  <p key={idx} className="text-amber-400 font-medium">🎁 {b}</p>
                                ))}
                              </div>
                            </div>
                            <div className="flex justify-between items-center border-t border-slate-800 pt-2 text-xs">
                              <span className="text-slate-400">Garantia:</span>
                              <span className="text-slate-200 font-bold">{currentProject.offer.guaranteeDays} dias incondicionais</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-400">Preço Sugerido:</span>
                              <span className="text-emerald-400 font-extrabold text-sm">R$ {currentProject.offer.suggestedPrice.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        {/* AI Product Score */}
                        {currentProject.score && (
                          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <Award className="text-indigo-400 w-4.5 h-4.5" />
                                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                                  AI Product Score
                                </h4>
                              </div>

                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-full border-4 border-indigo-600 flex items-center justify-center bg-indigo-950/40">
                                  <span className="text-lg font-black text-slate-100">{currentProject.score.overallScore}</span>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-400">Recomendação Final:</p>
                                  <p className="text-sm font-bold text-indigo-400 uppercase">{currentProject.score.recommendation}</p>
                                </div>
                              </div>

                              {/* Breakdown */}
                              <div className="space-y-2 text-[11px]">
                                {[
                                  { label: 'Demanda de Mercado', val: currentProject.score.demand },
                                  { label: 'Barreira Competitiva', val: currentProject.score.competition },
                                  { label: 'Margem do Produto', val: currentProject.score.margin },
                                  { label: 'Facilidade de Escrita/Criação', val: currentProject.score.easeOfCreation },
                                  { label: 'Escalabilidade', val: currentProject.score.scalability }
                                ].map((s, idx) => (
                                  <div key={idx} className="flex justify-between items-center">
                                    <span className="text-slate-400">{s.label}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-200">{s.val}</span>
                                      <div className="w-16 bg-slate-800 h-1 rounded-full overflow-hidden">
                                        <div className="bg-indigo-500 h-full" style={{ width: `${s.val}%` }} />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {currentProject.status === 'LAUNCHED' && (
                              <div className="mt-4 p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center text-xs rounded-lg font-bold">
                                🚀 PRODUTO LANÇADO COM SUCESSO!
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bento Card: Financial Projections */}
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2 mb-3">
                        <DollarSign className="text-emerald-400 w-4.5 h-4.5" />
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                          Projeções Financeiras (Finance Agent)
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/60">
                          <p className="text-slate-500 text-[10px] uppercase font-semibold">Custo de Criação</p>
                          <p className="text-sm font-bold text-slate-300 mt-1">
                            R$ {currentProject.idea?.format === 'CURSO' ? '150,00' : currentProject.idea?.format === 'MENTORIA' ? '250,00' : currentProject.idea?.format === 'TEMPLATE' ? '75,00' : '45,00'}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/60">
                          <p className="text-slate-500 text-[10px] uppercase font-semibold">Preço Sugerido</p>
                          <p className="text-sm font-bold text-indigo-400 mt-1">
                            R$ {(currentProject.offer?.suggestedPrice || (currentProject.idea?.format === 'CURSO' ? 197 : currentProject.idea?.format === 'MENTORIA' ? 997 : currentProject.idea?.format === 'TEMPLATE' ? 47 : 97)).toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/60">
                          <p className="text-slate-500 text-[10px] uppercase font-semibold">Margem Líquida</p>
                          <p className="text-sm font-bold text-emerald-400 mt-1">
                            {currentProject.idea?.format === 'CURSO' ? '91%' : currentProject.idea?.format === 'MENTORIA' ? '88%' : currentProject.idea?.format === 'TEMPLATE' ? '92%' : '95%'}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/60">
                          <p className="text-slate-500 text-[10px] uppercase font-semibold">Previsão Receita (250 v.)</p>
                          <p className="text-sm font-bold text-emerald-400 mt-1">
                            R$ {((currentProject.offer?.suggestedPrice || (currentProject.idea?.format === 'CURSO' ? 197 : currentProject.idea?.format === 'MENTORIA' ? 997 : currentProject.idea?.format === 'TEMPLATE' ? 47 : 97)) * 250).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bento Card: Generated Files & Media Assets */}
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2 mb-3">
                        <Layers className="text-indigo-400 w-4.5 h-4.5" />
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                          Arquivos de Conteúdo e Mídia Gerados ({currentProject.arquivos?.length || 0})
                        </h4>
                      </div>
                      {(!currentProject.arquivos || currentProject.arquivos.length === 0) ? (
                        <p className="text-slate-500 text-xs italic">Nenhum arquivo gerado nesta etapa. Continue progredindo no pipeline.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {currentProject.arquivos.map((file, idx) => (
                            <div key={idx} className="bg-slate-950 px-3 py-2.5 rounded-lg border border-slate-800 flex items-center justify-between hover:border-slate-700 transition">
                              <div className="flex items-center gap-2">
                                <span className="p-1 bg-indigo-500/10 text-indigo-400 rounded">
                                  <FileText size={12} />
                                </span>
                                <span className="font-mono text-[11px] text-slate-300 truncate max-w-[150px]">{file}</span>
                              </div>
                              <span className="text-[10px] text-indigo-400 font-semibold uppercase">Pronto para Venda</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bento Card: Historico & Audit Trails */}
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="text-indigo-400 w-4.5 h-4.5" />
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                          Histórico Operacional e Logs de Auditoria
                        </h4>
                      </div>
                      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                        {(currentProject.histórico || ['Projeto iniciado', 'Aguardando validação dos agentes de mercado...']).map((log, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-400 border-b border-slate-800/40 pb-1.5 last:border-0 last:pb-0">
                            <span className="text-[9px] text-slate-600 mt-0.5">•</span>
                            <span>{log}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Active Simulation logs display */}
                  {activeProcessingStep && (
                    <div className="mt-6 p-4 bg-slate-900 rounded-xl border border-slate-800/80 animate-pulse">
                      <div className="flex items-center gap-2 mb-2">
                        <RefreshCw className="animate-spin text-indigo-400 w-4 h-4" />
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                          Executando: {activeProcessingStep}
                        </span>
                      </div>
                      <div className="space-y-1 max-h-[140px] overflow-y-auto font-mono text-[10px] text-slate-400">
                        {agentLogs.map((log, idx) => (
                          <div key={idx}>{log}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800/80 text-center text-slate-500 flex flex-col items-center justify-center py-12">
                  <Cpu className="w-12 h-12 text-slate-700 mb-3" />
                  <p className="text-sm font-semibold">Nenhum projeto selecionado</p>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm">Crie uma nova ideia na aba "Nova Ideia" ou selecione um projeto existente na lista lateral.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
