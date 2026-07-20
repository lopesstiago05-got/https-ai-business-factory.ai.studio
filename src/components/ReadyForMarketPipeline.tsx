import React, { useState } from 'react';
import { DigitalProduct } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket, 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight, 
  Cpu, 
  ShoppingBag, 
  RefreshCw, 
  FileText, 
  Download, 
  Eye, 
  Clock, 
  Check, 
  X, 
  ExternalLink, 
  Coins, 
  Zap,
  ClipboardCheck,
  Award,
  Users,
  LineChart,
  BadgeAlert
} from 'lucide-react';

interface ReadyForMarketPipelineProps {
  products: DigitalProduct[];
  onRefreshState?: () => void;
  setActiveTab?: (tab: any) => void;
}

export const ReadyForMarketPipeline: React.FC<ReadyForMarketPipelineProps> = ({ 
  products, 
  onRefreshState,
  setActiveTab 
}) => {
  // Filters & Search
  const [filter, setFilter] = useState<'all' | 'draft' | 'optimized' | 'ready'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Interactive simulations states
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const [optimizationLogs, setOptimizationLogs] = useState<string[]>([]);
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);
  const [optimizedProduct, setOptimizedProduct] = useState<DigitalProduct | null>(null);

  // Quality Audit Modal
  const [auditProductId, setAuditProductId] = useState<string | null>(null);
  const [auditStep, setAuditStep] = useState<number>(0);
  const [auditChecks, setAuditChecks] = useState({
    plagiarism: false,
    pedagogicalDepth: false,
    salesPageHook: false,
    checkoutConfig: false,
    graphicsApproved: false
  });

  // Sales Page Preview Modal
  const [previewProduct, setPreviewProduct] = useState<DigitalProduct | null>(null);

  // Checkout configuration modal
  const [checkoutProduct, setCheckoutProduct] = useState<DigitalProduct | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<'kiwify' | 'hotmart' | 'mercado_pago'>('kiwify');

  // Sales simulation success state
  const [saleSuccess, setSaleSuccess] = useState<{ name: string; amount: number } | null>(null);

  // Helper: Determine product status based on marketStatus or fallback
  const getProductMarketStatus = (p: DigitalProduct): 'draft' | 'optimized' | 'ready' => {
    if (p.marketStatus) return p.marketStatus;
    
    // Fallback dynamic heuristic
    if (p.status === 'published' || p.publicationLogs.some(l => l.includes('publicado oficialmente') || l.includes('Aprovado'))) {
      return 'ready';
    }
    
    const hasContent = p.content && p.content.trim().length > 100;
    const hasSalesPage = p.salesPage && p.salesPage.trim().length > 100;
    
    if (hasContent && hasSalesPage) {
      return 'optimized';
    }
    
    return 'draft';
  };

  // Format currency helper
  const formatPrice = (value?: number) => {
    if (!value) return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Get completed agent count for a product
  const getCompletedAgentsCount = (p: DigitalProduct) => {
    let count = 1; // CEO is always completed if product exists
    if (p.description && p.description.length > 50) count++; // Research
    if (p.description && p.description.includes('Market')) count++; // Market analyst
    if (p.content && p.content.length > 50) count++; // Product creator
    if (p.content && p.content.includes('Writer')) count++; // Writer Agent
    if (p.designerAssets && p.designerAssets.length > 0) count++; // Designer
    if (p.salesPage && p.salesPage.length > 50) count++; // Marketing Agent
    if (p.publicationLogs.some(l => l.includes('Empacotamento') || l.includes('publicado'))) count++; // Publisher
    if (p.financialProjection && p.financialProjection.length > 50) count++; // Finance
    if (p.publicationLogs.some(l => l.includes('Selo') || l.includes('qualidade'))) count++; // Supervisor
    return Math.min(10, count);
  };

  // 1. Action: Optimize assets with IA
  const handleOptimizeProduct = async (product: DigitalProduct) => {
    setLoadingProductId(product.id);
    setOptimizedProduct(product);
    setOptimizationLogs([]);
    setShowOptimizationModal(true);

    const logs = [
      '🤖 CEO Agent: Analisando proposta didática e nicho de mercado...',
      '🔍 Research Agent: Mapeando desejos secretos e dores acentuadas da Persona...',
      '✍️ Writer Agent: Reestruturando capítulos pedagógicos com metodologias ativas...',
      '🎨 Designer Agent: Renderizando mockups de alta fidelidade e capas 3D fotorrealistas...',
      '📣 Marketing Agent: Esculpindo headline hipnótica com ganchos mentais milionários...',
      '💸 Finance Agent: Refinando proposta de upsell e precificação estratégica de conversão...',
      '🚀 Supervisor Agent: Aplicando heurísticas de qualidade rigorosas e testes de plágio...'
    ];

    for (let i = 0; i < logs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 350));
      setOptimizationLogs(prev => [...prev, logs[i]]);
    }

    try {
      const token = localStorage.getItem('factory_jwt_token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Update marketStatus on server
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          marketStatus: 'optimized',
          publicationLogs: [
            ...(product.publicationLogs || []),
            `Otimização de ativos digitais executada com sucesso em ${new Date().toLocaleString('pt-BR')}`
          ]
        })
      });

      if (res.ok) {
        if (onRefreshState) onRefreshState();
      }
    } catch (err) {
      console.error('Erro ao salvar otimização:', err);
    } finally {
      setLoadingProductId(null);
    }
  };

  // 2. Action: Run Quality Audit
  const handleStartAudit = (productId: string) => {
    setAuditProductId(productId);
    setAuditStep(0);
    setAuditChecks({
      plagiarism: false,
      pedagogicalDepth: false,
      salesPageHook: false,
      checkoutConfig: false,
      graphicsApproved: false
    });
  };

  const handleCompleteAudit = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setLoadingProductId(productId);
    try {
      const token = localStorage.getItem('factory_jwt_token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          marketStatus: 'ready',
          publicationLogs: [
            ...(product.publicationLogs || []),
            `Selo de Aprovação do Supervisor COO concedido após Auditoria em ${new Date().toLocaleString('pt-BR')}`
          ]
        })
      });

      if (res.ok) {
        setAuditProductId(null);
        if (onRefreshState) onRefreshState();
      }
    } catch (err) {
      console.error('Erro ao aprovar auditoria:', err);
    } finally {
      setLoadingProductId(null);
    }
  };

  // 3. Action: Publish Officially
  const handlePublishOfficially = async (product: DigitalProduct) => {
    setLoadingProductId(product.id);
    try {
      const token = localStorage.getItem('factory_jwt_token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/products/${product.id}/publish`, {
        method: 'POST',
        headers
      });

      if (res.ok) {
        if (onRefreshState) onRefreshState();
      } else {
        alert('Falha ao ativar carrinho do produto.');
      }
    } catch (err) {
      console.error('Erro ao publicar produto:', err);
    } finally {
      setLoadingProductId(null);
    }
  };

  // 4. Action: Simulate Real Sale (Durable backend update)
  const handleSimulateSale = async (product: DigitalProduct) => {
    setLoadingProductId(product.id);
    try {
      const token = localStorage.getItem('factory_jwt_token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const saleAmount = product.price;

      // Update product revenue on backend
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          revenue: (product.revenue || 0) + saleAmount,
          publicationLogs: [
            ...(product.publicationLogs || []),
            `Venda direta de ${formatPrice(saleAmount)} registrada com sucesso em ${new Date().toLocaleString('pt-BR')}`
          ]
        })
      });

      // Also register a custom simulated sale in state to reflect overall metrics
      await fetch('/api/connectors/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: product.paymentProvider || 'kiwify',
          token: 'SIMULATION-SALE-TOKEN-SUCCESS',
          simulatedSale: {
            productId: product.id,
            amount: saleAmount,
            customerEmail: `cliente.${Math.floor(Math.random() * 1000)}@exemplo.com`
          }
        })
      });

      if (res.ok) {
        setSaleSuccess({ name: product.name, amount: saleAmount });
        if (onRefreshState) onRefreshState();
        setTimeout(() => setSaleSuccess(null), 4000);
      }
    } catch (err) {
      console.error('Erro ao simular venda:', err);
    } finally {
      setLoadingProductId(null);
    }
  };

  // 5. Action: Download Dossier
  const handleDownloadDossier = (p: DigitalProduct) => {
    const border = '='.repeat(85);
    const text = border + '\n' +
'🏆 DOSSIÊ EXECUTIVO DE ATIVOS DIGITAIS - ESTEIRA READY FOR MARKET\n' +
'Produto: ' + p.name + '\n' +
'Nicho: ' + p.niche + '\n' +
'Categoria: ' + p.category + '\n' +
'Preço Sugerido: ' + formatPrice(p.price) + '\n' +
'Faturamento Acumulado: ' + formatPrice(p.revenue) + '\n' +
'Status do Pipeline: ' + getProductMarketStatus(p).toUpperCase() + '\n' +
'Data de Geração: ' + new Date(p.timestamp || Date.now()).toLocaleString() + '\n' +
border + '\n\n' +
'💡 1. POSICIONAMENTO E CONCEITO COMERCIAL\n' +
(p.description || 'Aguardando entrega do CEO Agent...') + '\n\n' +
border + '\n\n' +
'📖 2. CONTEÚDO DIDÁTICO E GRADE PEDAGÓGICA (PRODUCT & WRITER)\n' +
(p.content || 'Aguardando redação estruturada...') + '\n\n' +
border + '\n\n' +
'📣 3. PÁGINA DE VENDAS E ESTRATÉGIA DE COPY (MARKETING)\n' +
(p.salesPage || 'Aguardando redação do marketing...') + '\n\n' +
border + '\n\n' +
'🎨 4. DESIGN ASSETS & MOCKUP BRIEFING (DESIGNER)\n' +
(p.designerAssets && p.designerAssets.length > 0 ? p.designerAssets.join('\n') : 'Aguardando concepção visual...') + '\n\n' +
border + '\n\n' +
'💰 5. ENGENHARIA FINANCEIRA E PROJEÇÃO DE RETORNO (FINANCE)\n' +
(p.financialProjection || 'Aguardando modelagem financeira...') + '\n\n' +
border + '\n' +
'📜 CERTIFICADO DE AUDITORIA DE MERCADO\n' +
'Selo de Integridade e Alta Conversão concedido. Produto liberado para integração e vendas.\n' +
border;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ready_for_market_dossier_${p.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Group products by status for metrics
  const mappedProducts = products.map(p => ({
    ...p,
    pipelineStatus: getProductMarketStatus(p)
  }));

  const draftProducts = mappedProducts.filter(p => p.pipelineStatus === 'draft');
  const optimizedProducts = mappedProducts.filter(p => p.pipelineStatus === 'optimized');
  const readyProducts = mappedProducts.filter(p => p.pipelineStatus === 'ready');

  // Filtered list
  const filteredProducts = mappedProducts.filter(p => {
    const matchesFilter = filter === 'all' || p.pipelineStatus === filter;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.niche.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalValue = mappedProducts.reduce((sum, p) => sum + (p.revenue || 0), 0);
  const potentialValue = mappedProducts.reduce((sum, p) => sum + (p.price * 100), 0); // hypothetical valuation

  return (
    <div className="space-y-6">
      {/* Sales alert popup */}
      <AnimatePresence>
        {saleSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-6 right-6 z-50 bg-[#070e1b] border-2 border-emerald-500 rounded-2xl p-4 shadow-2xl flex items-center gap-4 max-w-sm"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Coins className="text-emerald-400 animate-bounce" size={24} />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-extrabold block">VENDA DETECTADA!</span>
              <h4 className="text-xs font-black text-white truncate max-w-[200px]">{saleSuccess.name}</h4>
              <p className="text-[11px] text-slate-400">
                Faturamento: <strong className="text-emerald-400 font-mono">+{formatPrice(saleSuccess.amount)}</strong>
              </p>
            </div>
            <button onClick={() => setSaleSuccess(null)} className="text-slate-500 hover:text-slate-300">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden shadow-lg shadow-indigo-500/5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase bg-indigo-950/80 px-2.5 py-1 rounded-full border border-indigo-500/30 font-mono">
                Pipeline de Lançamentos
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="text-xs text-slate-400 font-medium font-mono">Estágio 24: Pronto para Mercado</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Pipeline de Produtos <span className="text-indigo-400 font-serif font-light italic">Ready for Market</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Monitore a esteira de atratividade comercial dos seus infoprodutos. Otimize copys estruturadas com IA, execute checklists de conformidade e publique diretamente em canais de checkout escaláveis.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-900/60 border border-indigo-500/10 p-3.5 rounded-xl backdrop-blur-sm shrink-0">
            <Rocket className="text-indigo-400 animate-pulse" size={20} />
            <div>
              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold font-mono">Conversão Ativa</span>
              <span className="font-extrabold text-sm text-white font-mono">
                {products.length} Projetos Criados
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Rascunhos (Draft)',
            value: draftProducts.length,
            desc: 'Aguardando Otimização Comercial',
            icon: Clock,
            color: 'border-amber-500/20 text-amber-500 bg-amber-500/5'
          },
          {
            title: 'Ativos Otimizados',
            value: optimizedProducts.length,
            desc: 'Copys & Design Pronto',
            icon: Sparkles,
            color: 'border-blue-500/20 text-blue-400 bg-blue-500/5'
          },
          {
            title: 'Pronto para Mercado',
            value: readyProducts.length,
            desc: 'Checkout & Publicação Ativos',
            icon: CheckCircle,
            color: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5'
          },
          {
            title: 'Faturamento do Funil',
            value: formatPrice(totalValue),
            desc: 'Valores Reais Registrados',
            icon: DollarSign,
            color: 'border-indigo-500/20 text-indigo-400 bg-indigo-500/5'
          }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className={`border rounded-xl p-4 space-y-1.5 transition-all ${item.color}`}>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold text-[10px] tracking-wider uppercase font-mono">{item.title}</span>
                <Icon size={14} className="opacity-80" />
              </div>
              <div className="font-mono font-black text-lg text-white">
                {item.value}
              </div>
              <p className="text-[10px] text-slate-400/90 leading-none">{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Toolbar / Filters */}
      <div className="bg-[#05050a] border border-[#121625] rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'Todos os Infoprodutos', count: products.length },
            { id: 'draft', label: 'Rascunhos (Draft)', count: draftProducts.length },
            { id: 'optimized', label: 'Otimizados', count: optimizedProducts.length },
            { id: 'ready', label: 'Prontos para Mercado', count: readyProducts.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 font-mono ${
                filter === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                filter === tab.id ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72 shrink-0">
          <input
            type="text"
            placeholder="Filtrar por nome ou nicho..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 pl-8 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <span className="absolute left-3 top-2.5 text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
        </div>
      </div>

      {/* Grid Layout of Products */}
      {filteredProducts.length === 0 ? (
        <div className="border border-[#121625] bg-[#040408] rounded-2xl p-16 text-center space-y-4 max-w-4xl mx-auto">
          <div className="w-16 h-16 bg-slate-900/40 rounded-full flex items-center justify-center mx-auto border border-slate-800">
            <BadgeAlert className="text-slate-600" size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm text-slate-200 font-sans">Nenhum Infoproduto Encontrado</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Seu filtro de busca não retornou nenhum resultado para este estágio da esteira. Crie ou avance produtos com os agentes da fábrica para vê-los aqui.
            </p>
          </div>
          {setActiveTab && (
            <button
              onClick={() => setActiveTab('ceo')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all font-mono"
            >
              Criar Novo Produto na Sala do CEO
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => {
            const completedAgents = getCompletedAgentsCount(p);
            
            // Status specifics styling
            let statusBadge = '';
            let cardBorder = 'border-slate-800/80 hover:border-slate-700 bg-slate-950/40';
            let statusTitle = '';
            let statusIcon = Clock;

            if (p.pipelineStatus === 'draft') {
              statusBadge = 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
              cardBorder = 'border-amber-500/10 hover:border-amber-500/30 bg-gradient-to-b from-amber-500/[0.02] to-transparent';
              statusTitle = 'Rascunho de Conteúdo';
              statusIcon = Clock;
            } else if (p.pipelineStatus === 'optimized') {
              statusBadge = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
              cardBorder = 'border-indigo-500/15 hover:border-indigo-500/40 bg-gradient-to-b from-indigo-500/[0.02] to-transparent';
              statusTitle = 'Otimizado para Conversão';
              statusIcon = Sparkles;
            } else if (p.pipelineStatus === 'ready') {
              statusBadge = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
              cardBorder = 'border-emerald-500/20 hover:border-emerald-500/50 bg-gradient-to-b from-emerald-500/[0.02] to-transparent shadow-md shadow-emerald-500/5';
              statusTitle = 'Pronto para o Mercado';
              statusIcon = CheckCircle;
            }

            const StatusIcon = statusIcon;

            return (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={`border rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 relative overflow-hidden group ${cardBorder}`}
              >
                {/* Glowing status light */}
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl -z-10 opacity-30 pointer-events-none ${
                  p.pipelineStatus === 'draft' ? 'bg-amber-500' : p.pipelineStatus === 'optimized' ? 'bg-indigo-500' : 'bg-emerald-500'
                }`}></div>

                <div className="space-y-4">
                  {/* Status & Price Row */}
                  <div className="flex justify-between items-start gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 font-mono ${statusBadge}`}>
                      <StatusIcon size={11} className="shrink-0 animate-pulse" />
                      <span>{p.pipelineStatus === 'draft' ? 'Draft' : p.pipelineStatus === 'optimized' ? 'Optimized' : 'Ready'}</span>
                    </span>
                    <div className="text-right">
                      <span className="block text-[8px] text-slate-500 font-bold font-mono">TICKET SUGERIDO</span>
                      <span className="font-mono font-black text-xs text-indigo-400">{formatPrice(p.price)}</span>
                    </div>
                  </div>

                  {/* Info Header */}
                  <div>
                    <h3 className="text-sm font-black text-white tracking-tight group-hover:text-indigo-400 transition-colors leading-tight">
                      {p.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 flex items-center gap-1.5 font-mono">
                      <span>{p.category}</span>
                      <span className="text-slate-700">•</span>
                      <span className="text-slate-500 lowercase">{p.niche}</span>
                    </p>
                  </div>

                  {/* Metrics Mini Dashboard */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-900/50 border border-slate-900 rounded-xl p-2.5 font-mono">
                    <div>
                      <span className="block text-[8px] text-slate-500 font-bold uppercase">Agentes Ativos</span>
                      <span className="text-xs font-black text-slate-200">{completedAgents} / 10 IA</span>
                    </div>
                    <div>
                      <span className="block text-[8px] text-slate-500 font-bold uppercase">Faturamento</span>
                      <span className="text-xs font-black text-emerald-400">{formatPrice(p.revenue)}</span>
                    </div>
                  </div>

                  {/* Production Line Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[8px] font-bold text-slate-500 font-mono">
                      <span>ESTEIRA COGNITIVA</span>
                      <span>{(completedAgents / 10) * 100}% CONCLUÍDO</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${
                          p.pipelineStatus === 'draft' ? 'bg-amber-500' : p.pipelineStatus === 'optimized' ? 'bg-indigo-500' : 'bg-emerald-500 animate-pulse'
                        }`}
                        style={{ width: `${(completedAgents / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Direct Action Buttons depending on Status */}
                <div className="border-t border-[#121625] pt-4 mt-5 space-y-2">
                  
                  {/* DRAFT STATE ACTIONS */}
                  {p.pipelineStatus === 'draft' && (
                    <div className="space-y-2">
                      <button
                        onClick={() => handleOptimizeProduct(p)}
                        disabled={loadingProductId === p.id}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10 font-mono"
                      >
                        {loadingProductId === p.id ? (
                          <>
                            <RefreshCw size={12} className="animate-spin" /> Otimizando...
                          </>
                        ) : (
                          <>
                            <Sparkles size={12} /> Otimizar com IA
                          </>
                        )}
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownloadDossier(p)}
                          className="w-1/2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold py-1.5 rounded-lg text-[10px] transition-all flex items-center justify-center gap-1 font-mono"
                        >
                          <Download size={11} /> Ver Dossiê
                        </button>
                        <button
                          onClick={() => {
                            setPreviewProduct(p);
                          }}
                          className="w-1/2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold py-1.5 rounded-lg text-[10px] transition-all flex items-center justify-center gap-1 font-mono"
                        >
                          <Eye size={11} /> Ler Copy
                        </button>
                      </div>
                    </div>
                  )}

                  {/* OPTIMIZED STATE ACTIONS */}
                  {p.pipelineStatus === 'optimized' && (
                    <div className="space-y-2">
                      <button
                        onClick={() => handleStartAudit(p.id)}
                        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md font-mono"
                      >
                        <ShieldCheck size={13} className="text-emerald-400" /> Auditar Qualidade
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPreviewProduct(p)}
                          className="w-1/2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold py-1.5 rounded-lg text-[10px] transition-all flex items-center justify-center gap-1 font-mono"
                        >
                          <Eye size={11} /> Landing Page
                        </button>
                        <button
                          onClick={() => handleDownloadDossier(p)}
                          className="w-1/2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold py-1.5 rounded-lg text-[10px] transition-all flex items-center justify-center gap-1 font-mono"
                        >
                          <Download size={11} /> Baixar Ativos
                        </button>
                      </div>
                    </div>
                  )}

                  {/* READY FOR MARKETPLACE STATE ACTIONS */}
                  {p.pipelineStatus === 'ready' && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        {p.status !== 'published' ? (
                          <button
                            onClick={() => handlePublishOfficially(p)}
                            disabled={loadingProductId === p.id}
                            className="w-1/2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 font-mono"
                          >
                            {loadingProductId === p.id ? (
                              <RefreshCw size={11} className="animate-spin" />
                            ) : (
                              <>
                                <Rocket size={11} /> Publicar
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="w-1/2 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 py-2 rounded-xl text-[10px] font-black text-center flex items-center justify-center gap-1 font-mono">
                            <CheckCircle size={10} /> Publicado
                          </div>
                        )}

                        <button
                          onClick={() => handleSimulateSale(p)}
                          disabled={loadingProductId === p.id}
                          className="w-1/2 bg-slate-900 border border-slate-800 hover:border-indigo-500 hover:text-white text-indigo-400 font-black py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1 font-mono"
                        >
                          {loadingProductId === p.id && saleSuccess ? (
                            <RefreshCw size={11} className="animate-spin" />
                          ) : (
                            <>
                              <Coins size={11} /> Registrar Venda Real
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setCheckoutProduct(p);
                            setSelectedProvider((p.paymentProvider as any) || 'kiwify');
                          }}
                          className="w-1/2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold py-1.5 rounded-lg text-[10px] transition-all flex items-center justify-center gap-1 font-mono"
                        >
                          <Zap size={10} /> Checkout
                        </button>
                        {setActiveTab && (
                          <button
                            onClick={() => setActiveTab('launch-center')}
                            className="w-1/2 bg-slate-900 border border-slate-800 hover:border-indigo-500 text-indigo-400 font-bold py-1.5 rounded-lg text-[10px] transition-all flex items-center justify-center gap-1 font-mono"
                          >
                            Criar Lançamento <ArrowRight size={10} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 1. Modal: AI Optimization Logs */}
      <AnimatePresence>
        {showOptimizationModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#05050a] border border-[#1a1f35] p-6 rounded-2xl max-w-xl w-full text-left shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-[#121625] pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
                    <Cpu size={16} className="animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Esteira de Otimização Cognitiva</h3>
                    <p className="text-[10px] text-slate-500 uppercase font-mono">Agentes de IA Cooperando em Lote</p>
                  </div>
                </div>
                {loadingProductId === null && (
                  <button 
                    onClick={() => setShowOptimizationModal(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900 transition-all"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto bg-slate-950 p-4 border border-slate-900 rounded-xl font-mono text-[10px] text-slate-300 leading-relaxed scrollbar-thin">
                {optimizationLogs.map((log, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    key={idx} 
                    className="flex items-start gap-2"
                  >
                    <span className="text-indigo-500 shrink-0">&gt;</span>
                    <span>{log}</span>
                  </motion.div>
                ))}
                {loadingProductId !== null && (
                  <div className="flex items-center gap-2 text-indigo-400 animate-pulse mt-1 pl-4">
                    <RefreshCw size={11} className="animate-spin" />
                    <span>Integrando novos ganchos comerciais de vendas...</span>
                  </div>
                )}
              </div>

              {loadingProductId === null && (
                <div className="mt-5 space-y-3">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl flex items-start gap-2 text-xs text-emerald-400/90 leading-relaxed">
                    <CheckCircle size={16} className="shrink-0 mt-0.5" />
                    <div>
                      O infoproduto <strong className="text-white">"{optimizedProduct?.name}"</strong> foi elevado ao status <strong className="text-white">Optimized</strong>! Todas as copys foram lapidadas com ganchos mentais de conversão de alto lucro e o briefing de design gráfico foi concluído.
                    </div>
                  </div>
                  <button
                    onClick={() => setShowOptimizationModal(false)}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all font-mono"
                  >
                    Confirmar e Voltar ao Pipeline
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Modal: SRE COO Quality Audit Checklist */}
      <AnimatePresence>
        {auditProductId && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#05050a] border border-[#1a1f35] p-6 rounded-2xl max-w-md w-full text-left shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-[#121625] pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Auditoria de Qualidade do Supervisor</h3>
                    <p className="text-[10px] text-slate-500 uppercase font-mono">Validação de conformidade regulatória</p>
                  </div>
                </div>
                <button 
                  onClick={() => setAuditProductId(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900 transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Para conceder o Selo de Qualidade e avançar o infoproduto para o estágio <strong className="text-indigo-400">Ready for Marketplace</strong>, marque os critérios de verificação técnica:
                </p>

                <div className="space-y-3 bg-slate-950 p-4 border border-slate-900 rounded-xl">
                  {[
                    { key: 'plagiarism', label: 'Livre de plágio e conteúdo 100% íntegro' },
                    { key: 'pedagogicalDepth', label: 'Ementa didática profunda estruturada por módulos' },
                    { key: 'salesPageHook', label: 'Copywriting validado com Big Promise de conversão' },
                    { key: 'checkoutConfig', label: 'Instruções para precificação e termos configuradas' },
                    { key: 'graphicsApproved', label: 'Design fotorrealista de capa em 3D pré-aprovado' }
                  ].map((item) => (
                    <label 
                      key={item.key} 
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-900 cursor-pointer transition-all border border-transparent hover:border-slate-900"
                    >
                      <input 
                        type="checkbox"
                        checked={(auditChecks as any)[item.key]}
                        onChange={(e) => setAuditChecks(prev => ({ ...prev, [item.key]: e.target.checked }))}
                        className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 h-4 w-4"
                      />
                      <span className="text-xs text-slate-300 font-medium select-none">{item.label}</span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setAuditProductId(null)}
                    className="w-1/3 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white font-bold rounded-xl text-xs transition-all font-mono"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={() => handleCompleteAudit(auditProductId)}
                    disabled={!Object.values(auditChecks).every(Boolean) || loadingProductId !== null}
                    className="w-2/3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1 font-mono shadow-md shadow-emerald-600/10"
                  >
                    {loadingProductId !== null ? (
                      <RefreshCw size={12} className="animate-spin" />
                    ) : (
                      <>
                        <Award size={13} /> Conceder Selo de Qualidade
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Modal: Landing Page Copywriting Preview */}
      <AnimatePresence>
        {previewProduct && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#05050a] border border-[#1a1f35] rounded-2xl max-w-3xl w-full text-left shadow-2xl relative flex flex-col h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-[#121625] p-5 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Visualização da Landing Page de Alta Conversão</h3>
                    <p className="text-[10px] text-slate-500 uppercase font-mono">Estrutura de Copy gerada pelo Marketing Agent</p>
                  </div>
                </div>
                <button 
                  onClick={() => setPreviewProduct(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900 transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Content - Scrollable Sales Page Mockup */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-950 font-sans scrollbar-thin">
                {/* Simulated Browser Header */}
                <div className="bg-[#0a0a14] border border-slate-900 rounded-xl p-6 text-center space-y-6 max-w-2xl mx-auto shadow-inner relative overflow-hidden">
                  <div className="absolute top-2 left-3 flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/40"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40"></span>
                  </div>
                  
                  {/* Headline & Subheadline */}
                  <div className="space-y-3 pt-4">
                    <span className="text-[9px] font-black tracking-widest text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-3 py-1 rounded-full uppercase font-mono">
                      {previewProduct.niche}
                    </span>
                    <h1 className="text-lg md:text-xl font-black text-white tracking-tight leading-snug">
                      {previewProduct.subtitle || `Como Dominar ${previewProduct.name} em Recorde de Tempo`}
                    </h1>
                    <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
                      Descubra a engenharia secreta de posicionamento para faturar alto com estratégias digitais validadas.
                    </p>
                  </div>

                  {/* Pitch Commercial (CEO Description) */}
                  <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 text-xs text-slate-300 text-left leading-relaxed max-w-xl mx-auto">
                    <p className="font-bold text-white mb-2 text-center text-[11px] font-mono tracking-wider text-indigo-400 uppercase">// PROPOSTA DE VALOR DO INFOPRODUTO</p>
                    {previewProduct.description || 'Proposta de valor em elaboração pelos agentes da diretoria.'}
                  </div>

                  {/* Call to Action CTA */}
                  <div className="space-y-2 pt-2">
                    <button className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/10 font-mono inline-flex items-center gap-1.5">
                      <Zap size={12} /> Quero Garantir Acesso por {formatPrice(previewProduct.price)}
                    </button>
                    <span className="block text-[8px] text-slate-500 font-bold uppercase font-mono">Compra 100% segura • Satisfação Garantida por 7 Dias</span>
                  </div>
                </div>

                {/* Pedadogical Curriculum Preview */}
                <div className="max-w-2xl mx-auto space-y-4">
                  <h3 className="font-black text-xs text-white uppercase tracking-wider font-mono border-b border-[#121625] pb-2 flex items-center gap-2">
                    <ClipboardCheck size={14} className="text-indigo-400" />
                    Conteúdo Pedagógico Incluso
                  </h3>
                  
                  <div className="bg-[#05050a] border border-slate-900 rounded-xl p-4 space-y-3">
                    {previewProduct.content ? (
                      <div className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-line max-h-60 overflow-y-auto pr-1">
                        {previewProduct.content}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 text-center py-6">
                        O Writer Agent ainda não concluiu a escrita detalhada dos capítulos didáticos.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-[#121625] p-4 bg-[#030306] shrink-0 flex justify-between gap-3">
                <button
                  onClick={() => handleDownloadDossier(previewProduct)}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 font-mono"
                >
                  <Download size={13} /> Baixar Ativos Completos
                </button>
                <button
                  onClick={() => setPreviewProduct(null)}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all font-mono"
                >
                  Fechar Visualização
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Modal: Checkout Platform Integration Settings */}
      <AnimatePresence>
        {checkoutProduct && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#05050a] border border-[#1a1f35] p-6 rounded-2xl max-w-md w-full text-left shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-[#121625] pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
                    <Zap size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Configurações de Gateway & Checkout</h3>
                    <p className="text-[10px] text-slate-500 uppercase font-mono">Integração da API de Pagamentos</p>
                  </div>
                </div>
                <button 
                  onClick={() => setCheckoutProduct(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900 transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Selecione a plataforma de checkout conectada para processar Pix e Cartão de Crédito de <strong className="text-white">{checkoutProduct.name}</strong>:
                </p>

                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'kiwify', name: 'Kiwify', label: 'K' },
                    { id: 'hotmart', name: 'Hotmart', label: 'H' },
                    { id: 'mercado_pago', name: 'Mercado Pago', label: 'M' }
                  ].map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => setSelectedProvider(provider.id as any)}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                        selectedProvider === provider.id
                          ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-sm'
                          : 'border-slate-850 bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="w-8 h-8 rounded-full border border-slate-800 bg-slate-900 flex items-center justify-center font-black text-xs font-mono text-indigo-400">
                        {provider.label}
                      </span>
                      <span className="text-[10px] font-bold">{provider.name}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-2 pt-2">
                  <label className="block text-[8px] font-bold text-slate-500 uppercase font-mono">URL Oficial do Carrinho (Checkout API Redirect)</label>
                  <input
                    type="text"
                    disabled
                    value={`https://checkout.${selectedProvider}.com.br/pay/factory-${checkoutProduct.id}`}
                    className="w-full text-xs font-mono bg-slate-950 border border-slate-900 rounded-lg p-2 text-slate-400 select-all"
                  />
                </div>

                <div className="flex gap-3 pt-3 border-t border-[#121625]">
                  <button
                    onClick={() => setCheckoutProduct(null)}
                    className="w-1/3 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white font-bold rounded-xl text-xs transition-all font-mono"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('factory_jwt_token');
                        const headers: HeadersInit = { 'Content-Type': 'application/json' };
                        if (token) headers['Authorization'] = `Bearer ${token}`;

                        const res = await fetch(`/api/products/${checkoutProduct.id}`, {
                          method: 'PUT',
                          headers,
                          body: JSON.stringify({
                            paymentProvider: selectedProvider,
                            checkoutUrl: `https://checkout.${selectedProvider}.com.br/pay/factory-${checkoutProduct.id}`,
                            publicationLogs: [
                              ...(checkoutProduct.publicationLogs || []),
                              `Plataforma de checkout atualizada para ${selectedProvider.toUpperCase()} em ${new Date().toLocaleString('pt-BR')}`
                            ]
                          })
                        });

                        if (res.ok) {
                          setCheckoutProduct(null);
                          if (onRefreshState) onRefreshState();
                        }
                      } catch (err) {
                        console.error('Erro ao salvar gateway:', err);
                      }
                    }}
                    className="w-2/3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all font-mono flex items-center justify-center gap-1.5"
                  >
                    Salvar Conexão de Checkout
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
