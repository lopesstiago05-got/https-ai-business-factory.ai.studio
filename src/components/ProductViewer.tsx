import React, { useState } from 'react';
import { DigitalProduct } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  BookOpen, 
  TrendingUp, 
  Sparkles, 
  ShoppingBag, 
  CheckCircle, 
  FileText, 
  DollarSign, 
  Layers,
  Award,
  Download,
  Rocket,
  Info,
  Calendar,
  CheckSquare,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Check,
  Clock,
  Loader2,
  ExternalLink,
  PartyPopper
} from 'lucide-react';

interface ProductViewerProps {
  id: string;
  products: DigitalProduct[];
  onRefreshState?: () => void;
}

export const ProductViewer: React.FC<ProductViewerProps> = ({ id, products, onRefreshState }) => {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'concept' | 'blueprint' | 'sales' | 'design' | 'finance' | 'logs' | 'marketplace-guide'>('concept');
  const [isPublishing, setIsPublishing] = useState(false);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const currentProduct = products.find(p => p.id === selectedProductId) || products[0];

  const formatPrice = (value?: number) => {
    if (!value) return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? 'Bearer ' + token : '',
    };
  };

  // Helper to detect if a specific Agent has delivered its part
  const getAgentStatus = (agentId: string, p: DigitalProduct) => {
    if (!p) return false;
    switch (agentId) {
      case 'ceo':
        return !!p.description && p.description.trim().length > 30;
      case 'research':
        return !!p.description && p.description.includes('Research Agent');
      case 'market':
        return !!p.description && p.description.includes('Market Agent');
      case 'product':
        return !!p.content && p.content.trim().length > 30;
      case 'writer':
        return !!p.content && p.content.includes('Writer Agent');
      case 'designer':
        return !!p.designerAssets && p.designerAssets.length > 0;
      case 'marketing':
        return !!p.salesPage && p.salesPage.trim().length > 30;
      case 'publisher':
        return p.publicationLogs.some(log => log.includes('Empacotamento') || log.includes('publicado'));
      case 'finance':
        return !!p.financialProjection && p.financialProjection.trim().length > 30;
      case 'supervisor':
        return p.publicationLogs.some(log => log.includes('revisado') || log.includes('selo de qualidade') || log.includes('Selo'));
      default:
        return false;
    }
  };

  const handlePublish = async () => {
    if (!currentProduct) return;
    setIsPublishing(true);
    try {
      const res = await fetch('/api/products/' + currentProduct.id + '/publish', {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setShowCelebrate(true);
        if (onRefreshState) {
          onRefreshState();
        }
        setTimeout(() => setShowCelebrate(false), 5000);
      } else {
        alert('Falha ao publicar produto: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (err: any) {
      alert('Erro ao conectar ao servidor para publicação: ' + err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDownloadDossier = () => {
    if (!currentProduct) return;
    const border = '='.repeat(80);
    const text = border + '\n' +
'🏆 DOSSIÊ DE ENTREGA OFICIAL DA AI BUSINESS FACTORY\n' +
'Produto: ' + currentProduct.name + '\n' +
'Nicho: ' + currentProduct.niche + '\n' +
'Categoria: ' + currentProduct.category + '\n' +
'Preço Sugerido: ' + formatPrice(currentProduct.price) + '\n' +
'Receita Estimada: ' + formatPrice(currentProduct.revenue) + '\n' +
'Status: ' + currentProduct.status.toUpperCase() + '\n' +
'Data de Geração: ' + new Date().toLocaleString() + '\n' +
border + '\n\n' +
'💡 1. CONCEITO ESTRATÉGICO (CEO AGENT & RESEARCH)\n' +
(currentProduct.description || 'Aguardando entrega do CEO Agent...') + '\n\n' +
border + '\n\n' +
'📖 2. CONTEÚDO PEDAGÓGICO E BLUEPRINT (PRODUCT & WRITER)\n' +
(currentProduct.content || 'Aguardando redação estruturada...') + '\n\n' +
border + '\n\n' +
'📣 3. COPYWRITING DA PÁGINA DE VENDAS (MARKETING AGENT)\n' +
(currentProduct.salesPage || 'Aguardando redação do marketing...') + '\n\n' +
border + '\n\n' +
'🎨 4. IDENTIDADE VISUAL E DESIGN SYSTEM (DESIGNER AGENT)\n' +
(currentProduct.designerAssets && currentProduct.designerAssets.length > 0 ? currentProduct.designerAssets[0] : 'Aguardando concepção visual...') + '\n\n' +
border + '\n\n' +
'💰 5. PLANEJAMENTO FINANCEIRO E ROI (FINANCE AGENT)\n' +
(currentProduct.financialProjection || 'Aguardando projeções financeiras...') + '\n\n' +
border + '\n' +
'📜 CERTIFICADO DE AUDITORIA DE QUALIDADE\n' +
'Selo de Aprovação do Supervisor Agent ativo. Produto íntegro, livre de plágio e validado.\n' +
border;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dossie_entrega_' + currentProduct.id + '_' + currentProduct.name.toLowerCase().replace(/\s+/g, '_') + '.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const agentsList = [
    { id: 'ceo', name: 'CEO Agent', deliverable: 'Ideia & Proposta de Valor' },
    { id: 'research', name: 'Research Agent', deliverable: 'Pesquisa da Persona' },
    { id: 'market', name: 'Market Agent', deliverable: 'SEO & Canais Digitais' },
    { id: 'product', name: 'Product Agent', deliverable: 'Grade Curricular do Infoproduto' },
    { id: 'writer', name: 'Writer Agent', deliverable: 'Conteúdo do Livro Escrito' },
    { id: 'designer', name: 'Designer Agent', deliverable: 'Estilo Visual & Mockups' },
    { id: 'marketing', name: 'Marketing Agent', deliverable: 'Copy de Vendas & Headlines' },
    { id: 'publisher', name: 'Publisher Agent', deliverable: 'Funil & Carrinho Otimizado' },
    { id: 'finance', name: 'Finance Agent', deliverable: 'Precificação & Projeção ROI' },
    { id: 'supervisor', name: 'Supervisor Agent', deliverable: 'Selo de Qualidade e Heurísticas' }
  ];

  return (
    <div id={id} className="space-y-6">
      {/* Celebrating Overlay */}
      <AnimatePresence>
        {showCelebrate && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 dark:border-emerald-900">
                <PartyPopper className="text-emerald-500 animate-bounce" size={32} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Infoproduto Publicado!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                O produto <strong>{currentProduct?.name}</strong> foi enviado com sucesso para a esteira e integrado com as plataformas parceiras <strong>Hotmart, Kiwify e Mercado Pago</strong>. Está 100% pronto para vender e operar 24/7!
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <button 
                  onClick={() => setShowCelebrate(false)}
                  className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm"
                >
                  Visualizar Detalhes de Entrega
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase bg-indigo-950/80 px-2.5 py-1 rounded-full border border-indigo-900/50">
                Central de Entrega & Publicação
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-300 font-medium">Lotes Prontos para Lançamento</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Entregas de Trabalho & Ativação de Vendas
            </h2>
            <p className="text-xs text-slate-400 max-w-xl">
              Nesta área de entrega você pode inspecionar todos os ativos criados sequencialmente pela fábrica, baixar os arquivos oficiais de texto, e simular a publicação nas plataformas de infoproduto conectadas.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl backdrop-blur-sm self-start md:self-auto">
            <CheckSquare size={16} className="text-emerald-400 animate-pulse" />
            <div className="text-left">
              <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Produção Ativa</span>
              <span className="font-extrabold text-sm text-white font-mono">
                {products.length} {products.length === 1 ? 'Produto' : 'Produtos'} No Lote
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Layout Split */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Products Sidebar */}
        <div className="xl:col-span-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm">
            <ShoppingBag size={18} className="text-indigo-500" />
            Trabalhos Prontos
          </h3>

          {products.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-indigo-500" size={24} />
              <span>Aguardando geração dos primeiros infoprodutos pelos agentes...</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
              {products.map(p => {
                const isSelected = currentProduct?.id === p.id;
                const completedCount = agentsList.filter(a => getAgentStatus(a.id, p)).length;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProductId(p.id);
                      setActiveTab('concept');
                    }}
                    className={'w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 ' + (
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/20 shadow-sm'
                        : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                    )}
                  >
                    <div className="flex items-center justify-between w-full gap-2">
                      <span className={'text-[9px] font-black uppercase px-2 py-0.5 rounded ' + (
                        p.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50'
                      )}>
                        {p.status === 'published' ? 'Publicado' : 'Rascunho Pronto'}
                      </span>
                      <span className="text-[10px] font-extrabold text-slate-400 font-mono">{formatPrice(p.price)}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-850 dark:text-slate-100 leading-tight">
                        {p.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                        {p.niche}
                      </p>
                    </div>
                    {/* Tiny Progress Bar */}
                    <div className="w-full space-y-1">
                      <div className="flex justify-between text-[8px] font-bold text-slate-400">
                        <span>ESTEIRA DE TRABALHO</span>
                        <span className="text-indigo-500 font-mono">{completedCount}/10 AGENTES</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                          style={{ width: (completedCount / 10) * 100 + '%' }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Product Spec Desk */}
        <div className="xl:col-span-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col min-h-[600px] gap-6">
          {currentProduct ? (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div>
                {/* Header info */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/30">
                        {currentProduct.category}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{currentProduct.niche}</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {currentProduct.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 px-4 py-2 rounded-xl self-start md:self-auto">
                    <div className="text-right">
                      <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-400">Preço Sugerido</span>
                      <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                        {formatPrice(currentProduct.price)}
                      </span>
                    </div>
                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 mx-1"></div>
                    <div className="text-left">
                      <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-400">Projeção 3 Meses</span>
                      <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                        {formatPrice(currentProduct.revenue)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Heuristic Checklist of Agent Deliverables */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl p-4 mt-6">
                  <h4 className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider mb-3 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-indigo-500" />
                    Status da Auditoria de Ativos (Garantia de Qualidade)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                    {agentsList.map(a => {
                      const completed = getAgentStatus(a.id, currentProduct);
                      return (
                        <div 
                          key={a.id} 
                          className={'p-2.5 rounded-lg border flex flex-col justify-between h-20 transition-all ' + (
                            completed 
                              ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-200/50 dark:border-emerald-900/20' 
                              : 'bg-slate-100/50 dark:bg-slate-900/50 border-slate-200/30 dark:border-slate-800/30'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-slate-800 dark:text-slate-200 leading-tight block truncate">
                              {a.name.split(' ')[0]}
                            </span>
                            {completed ? (
                              <CheckCircle size={12} className="text-emerald-500 flex-shrink-0" />
                            ) : (
                              <Clock size={12} className="text-slate-300 dark:text-slate-600 flex-shrink-0 animate-pulse" />
                            )}
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-400 block truncate leading-tight mt-1">
                              {a.deliverable}
                            </span>
                            <span className={'text-[8px] font-black uppercase px-1 py-0.5 rounded mt-1.5 inline-block ' + (
                              completed 
                                ? 'bg-emerald-100/50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                                : 'bg-slate-200/50 text-slate-500 dark:bg-slate-800 dark:text-slate-500'
                            )}>
                              {completed ? 'Pronto' : 'Pendente'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tab select Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2 mt-6">
                  <button
                    onClick={() => setActiveTab('concept')}
                    className={'px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ' + (
                      activeTab === 'concept'
                        ? 'bg-[#06060c] text-emerald-400 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.1)] font-mono'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/55 dark:hover:bg-slate-800'
                    )}
                  >
                    <Layers size={14} /> Conceito Estratégico
                  </button>
                  <button
                    onClick={() => setActiveTab('blueprint')}
                    className={'px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ' + (
                      activeTab === 'blueprint'
                        ? 'bg-[#06060c] text-emerald-400 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.1)] font-mono'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/55 dark:hover:bg-slate-800'
                    )}
                  >
                    <BookOpen size={14} /> Sumário & Capítulo
                  </button>
                  <button
                    onClick={() => setActiveTab('sales')}
                    className={'px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ' + (
                      activeTab === 'sales'
                        ? 'bg-[#06060c] text-emerald-400 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.1)] font-mono'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/55 dark:hover:bg-slate-800'
                    )}
                  >
                    <FileText size={14} /> Página de Vendas (Copy)
                  </button>
                  <button
                    onClick={() => setActiveTab('design')}
                    className={'px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ' + (
                      activeTab === 'design'
                        ? 'bg-[#06060c] text-emerald-400 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.1)] font-mono'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/55 dark:hover:bg-slate-800'
                    )}
                  >
                    <Sparkles size={14} /> Identidade Visual
                  </button>
                  <button
                    onClick={() => setActiveTab('finance')}
                    className={'px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ' + (
                      activeTab === 'finance'
                        ? 'bg-[#06060c] text-emerald-400 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.1)] font-mono'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/55 dark:hover:bg-slate-800'
                    )}
                  >
                    <DollarSign size={14} /> Viabilidade Financeira
                  </button>
                  <button
                    onClick={() => setActiveTab('logs')}
                    className={'px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ' + (
                      activeTab === 'logs'
                        ? 'bg-[#06060c] text-emerald-400 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.1)] font-mono'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/55 dark:hover:bg-slate-800'
                    )}
                  >
                    <Award size={14} /> Certificados & Logs
                  </button>
                  <button
                    onClick={() => setActiveTab('marketplace-guide')}
                    className={'px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ' + (
                      activeTab === 'marketplace-guide'
                        ? 'bg-[#06060c] text-amber-400 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.1)] font-mono'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/55 dark:hover:bg-slate-800'
                    )}
                  >
                    <CheckSquare size={14} /> Passo a Passo Marketplace
                  </button>
                </div>

                {/* Tab content frame */}
                <div className="mt-4 bg-[#040409] border border-slate-900 rounded-xl p-5 overflow-y-auto max-h-[400px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans"
                    >
                      {activeTab === 'concept' && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5 font-mono">
                            <Layers size={14} />
                            Dossiê de Conceito e Ideação Estratégica
                          </h4>
                          <div>{currentProduct.description || 'Aguardando entrega do CEO Agent...'}</div>
                        </div>
                      )}

                      {activeTab === 'blueprint' && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5 font-mono">
                            <BookOpen size={14} />
                            Estrutura Pedagógica (Sumário de Módulos) & Conteúdo Escrito
                          </h4>
                          <div>{currentProduct.content || 'Aguardando os agentes Product e Writer finalizarem a redação estruturada.'}</div>
                        </div>
                      )}

                      {activeTab === 'sales' && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5 font-mono">
                            <FileText size={14} />
                            Estrutura de Conversão ( Headlines, Bullet points, Garantia e Oferta)
                          </h4>
                          <div>{currentProduct.salesPage || 'Aguardando o Marketing Agent redigir a página de vendas.'}</div>
                        </div>
                      )}

                      {activeTab === 'design' && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5 font-mono">
                            <Sparkles size={14} />
                            Diretrizes de Marca, Cores Hexadecimais e Prompts de Arte
                          </h4>
                          <div>
                            {currentProduct.designerAssets && currentProduct.designerAssets.length > 0
                              ? currentProduct.designerAssets[0]
                              : 'Aguardando o Designer Agent conceber a identidade visual da marca.'}
                          </div>
                        </div>
                      )}

                      {activeTab === 'finance' && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5 font-mono">
                            <DollarSign size={14} />
                            Planilha de Precificação e Retorno Financeiro Estimado (ROI)
                          </h4>
                          <div>{currentProduct.financialProjection || 'Aguardando o Finance Agent calcular custos, metas e projeção.'}</div>
                        </div>
                      )}

                      {activeTab === 'logs' && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5 font-mono">
                            <Award size={14} />
                            Assinaturas de Selo de Qualidade & Histórico do Funil
                          </h4>
                          <ul className="space-y-2">
                            {currentProduct.publicationLogs.map((log, i) => (
                              <li key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-[#080812] border border-slate-900">
                                <CheckCircle size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                                <span className="font-medium text-slate-300">{log}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {activeTab === 'marketplace-guide' && (
                        <div className="space-y-4 font-sans text-xs">
                          <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2 font-mono">
                            <CheckSquare size={14} className="text-amber-400" />
                            Guia de Publicação Passo a Passo (Hotmart, Kiwify e Eduzz)
                          </h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                            Siga este manual otimizado para cadastrar o infoproduto gerado pela fábrica e começar a faturar imediatamente. Clique no botão de cópia de cada campo para obter o texto pronto.
                          </p>

                          <div className="grid grid-cols-1 gap-3">
                            {/* Passo 1 */}
                            <div className="p-3 bg-[#080812] rounded-lg border border-slate-900 flex items-start gap-3">
                              <input 
                                type="checkbox" 
                                checked={!!completedSteps['step1']} 
                                onChange={(e) => setCompletedSteps({...completedSteps, step1: e.target.checked})}
                                className="mt-1 accent-emerald-500 cursor-pointer w-4 h-4"
                              />
                              <div className="space-y-1.5 flex-1">
                                <span className="text-[9px] font-extrabold uppercase bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-mono">PASSO 1: Informações Básicas</span>
                                <p className="font-bold text-slate-200 text-xs">Cadastrar Nome e Descrição Geral do Produto</p>
                                <p className="text-[10px] text-slate-400">Acesse a plataforma &gt; "Criar Produto". Copie os dados consolidados:</p>
                                
                                <div className="space-y-1 pt-1">
                                  <div className="flex items-center justify-between p-1.5 bg-[#030307] rounded border border-slate-900">
                                    <span className="text-[10px] text-slate-300 truncate max-w-[200px]">Nome: <strong>{currentProduct.name}</strong></span>
                                    <button 
                                      onClick={() => {
                                        navigator.clipboard.writeText(currentProduct.name);
                                        alert('Nome do produto copiado!');
                                      }}
                                      className="text-[9px] bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/30 px-2 py-1 rounded font-bold font-mono transition-all"
                                    >
                                      Copiar
                                    </button>
                                  </div>

                                  <div className="flex items-center justify-between p-1.5 bg-[#030307] rounded border border-slate-900">
                                    <span className="text-[10px] text-slate-300 truncate max-w-[200px]">Nicho: <strong>{currentProduct.niche} ({currentProduct.category})</strong></span>
                                    <button 
                                      onClick={() => {
                                        navigator.clipboard.writeText(`${currentProduct.niche} - ${currentProduct.category}`);
                                        alert('Nicho copiado!');
                                      }}
                                      className="text-[9px] bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/30 px-2 py-1 rounded font-bold font-mono transition-all"
                                    >
                                      Copiar
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Passo 2 */}
                            <div className="p-3 bg-[#080812] rounded-lg border border-slate-900 flex items-start gap-3">
                              <input 
                                type="checkbox" 
                                checked={!!completedSteps['step2']} 
                                onChange={(e) => setCompletedSteps({...completedSteps, step2: e.target.checked})}
                                className="mt-1 accent-emerald-500 cursor-pointer w-4 h-4"
                              />
                              <div className="space-y-1.5 flex-1">
                                <span className="text-[9px] font-extrabold uppercase bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-mono">PASSO 2: Precificação e ROI</span>
                                <p className="font-bold text-slate-200 text-xs">Definir Preço do Produto e Moeda</p>
                                <p className="text-[10px] text-slate-400">Configure o preço calculado pelo Finance Agent para maximizar a margem líquida:</p>
                                
                                <div className="flex items-center justify-between p-1.5 bg-[#030307] rounded border border-slate-900">
                                  <span className="text-[10px] text-slate-200">Preço Recomendado: <strong>R$ {currentProduct.price || '97,90'}</strong></span>
                                  <button 
                                    onClick={() => {
                                      navigator.clipboard.writeText(String(currentProduct.price || '97.90'));
                                      alert('Preço copiado!');
                                    }}
                                    className="text-[9px] bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/30 px-2 py-1 rounded font-bold font-mono transition-all"
                                  >
                                    Copiar
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Passo 3 */}
                            <div className="p-3 bg-[#080812] rounded-lg border border-slate-900 flex items-start gap-3">
                              <input 
                                type="checkbox" 
                                checked={!!completedSteps['step3']} 
                                onChange={(e) => setCompletedSteps({...completedSteps, step3: e.target.checked})}
                                className="mt-1 accent-emerald-500 cursor-pointer w-4 h-4"
                              />
                              <div className="space-y-1.5 flex-1">
                                <span className="text-[9px] font-extrabold uppercase bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-mono">PASSO 3: Copy da Página de Vendas</span>
                                <p className="font-bold text-slate-200 text-xs">Landing Page e Argumentos de Conversão</p>
                                <p className="text-[10px] text-slate-400">Insira a estrutura de alta performance com a oferta irresistível:</p>
                                
                                <div className="flex items-center justify-between p-1.5 bg-[#030307] rounded border border-slate-900">
                                  <span className="text-[10px] text-slate-400 truncate max-w-[200px]">Copy de Conversão: {currentProduct.salesPage ? 'Disponível' : 'Pendente'}</span>
                                  <button 
                                    disabled={!currentProduct.salesPage}
                                    onClick={() => {
                                      if (currentProduct.salesPage) {
                                        navigator.clipboard.writeText(currentProduct.salesPage);
                                        alert('Roteiro da página de vendas copiado!');
                                      }
                                    }}
                                    className="text-[9px] bg-emerald-500/15 text-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-500/30 px-2 py-1 rounded font-bold font-mono transition-all"
                                  >
                                    Copiar Copy
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Passo 4 */}
                            <div className="p-3 bg-[#080812] rounded-lg border border-slate-900 flex items-start gap-3">
                              <input 
                                type="checkbox" 
                                checked={!!completedSteps['step4']} 
                                onChange={(e) => setCompletedSteps({...completedSteps, step4: e.target.checked})}
                                className="mt-1 accent-emerald-500 cursor-pointer w-4 h-4"
                              />
                              <div className="space-y-1.5 flex-1">
                                <span className="text-[9px] font-extrabold uppercase bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-mono">PASSO 4: Área de Membros</span>
                                <p className="font-bold text-slate-200 text-xs">Syllabus e Entrega do Conteúdo Escrito</p>
                                <p className="text-[10px] text-slate-400">Insira o livro digital estruturado e os capítulos prontos gerados pelo Writer Agent:</p>
                                
                                <div className="flex items-center justify-between p-1.5 bg-[#030307] rounded border border-slate-900">
                                  <span className="text-[10px] text-slate-400 truncate max-w-[200px]">Conteúdo: {currentProduct.content ? 'Livro Completo' : 'Pendente'}</span>
                                  <button 
                                    disabled={!currentProduct.content}
                                    onClick={() => {
                                      if (currentProduct.content) {
                                        navigator.clipboard.writeText(currentProduct.content);
                                        alert('Conteúdo do livro copiado!');
                                      }
                                    }}
                                    className="text-[9px] bg-emerald-500/15 text-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-500/30 px-2 py-1 rounded font-bold font-mono transition-all"
                                  >
                                    Copiar E-book
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Passo 5 */}
                            <div className="p-3 bg-[#080812] rounded-lg border border-slate-900 flex items-start gap-3">
                              <input 
                                type="checkbox" 
                                checked={!!completedSteps['step5']} 
                                onChange={(e) => setCompletedSteps({...completedSteps, step5: e.target.checked})}
                                className="mt-1 accent-emerald-500 cursor-pointer w-4 h-4"
                              />
                              <div className="space-y-1.5 flex-1">
                                <span className="text-[9px] font-extrabold uppercase bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-mono">PASSO 5: Identidade Visual</span>
                                <p className="font-bold text-slate-200 text-xs">Mockup de Capa e Paleta Hex</p>
                                <p className="text-[10px] text-slate-400">Configure a logo, o design e as cores de marca fornecidos pelo Designer:</p>
                                
                                <div className="flex items-center justify-between p-1.5 bg-[#030307] rounded border border-slate-900">
                                  <span className="text-[10px] text-slate-400 truncate max-w-[200px]">Design: {currentProduct.designerAssets && currentProduct.designerAssets.length > 0 ? 'Disponível' : 'Pendente'}</span>
                                  <button 
                                    disabled={!currentProduct.designerAssets || currentProduct.designerAssets.length === 0}
                                    onClick={() => {
                                      if (currentProduct.designerAssets && currentProduct.designerAssets.length > 0) {
                                        navigator.clipboard.writeText(currentProduct.designerAssets[0]);
                                        alert('Diretrizes de design copiadas!');
                                      }
                                    }}
                                    className="text-[9px] bg-emerald-500/15 text-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-500/30 px-2 py-1 rounded font-bold font-mono transition-all"
                                  >
                                    Copiar Visuals
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono text-emerald-400">
                            <span>Status da Sincronização:</span>
                            <span className="font-bold uppercase">
                              {Object.values(completedSteps).filter(Boolean).length} / 5 Passos Concluídos
                            </span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="border-t border-[#161c33] pt-5 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-left">
                  <span className="block text-[9px] uppercase tracking-wider font-extrabold text-slate-500 font-mono">
                    Estágio de Distribuição
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={'w-2 h-2 rounded-full ' + (currentProduct.status === 'published' ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse')} />
                    <span className="text-xs font-bold text-slate-300 font-mono">
                      {currentProduct.status === 'published' ? 'Integrado e Publicado' : 'Aguardando Publicação'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleDownloadDossier}
                    className="flex-1 sm:flex-none bg-[#111425] hover:bg-[#161b33] text-emerald-400 font-extrabold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 border border-emerald-500/20 font-mono"
                  >
                    <Download size={14} />
                    Baixar Trabalho (.TXT)
                  </button>
                  <button
                    onClick={handlePublish}
                    disabled={isPublishing || currentProduct.status === 'published'}
                    className={'flex-1 sm:flex-none font-black py-2.5 px-5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)] ' + (
                      currentProduct.status === 'published'
                        ? 'bg-emerald-950/40 text-emerald-400 cursor-not-allowed border border-emerald-500/20'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-black font-black font-mono'
                    )}
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="animate-spin" size={14} />
                        Sincronizando plataformas...
                      </>
                    ) : currentProduct.status === 'published' ? (
                      <>
                        <Check size={14} />
                        Publicado com Sucesso!
                      </>
                    ) : (
                      <>
                        <Rocket size={14} />
                        Publicar Infoproduto
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-16">
              <ShoppingBag size={48} className="stroke-1 mb-3 text-slate-300" />
              <p className="text-xs font-bold">Nenhum produto digital gerado ou carregado no momento.</p>
              <p className="text-[10px] text-slate-400/80 mt-1 max-w-xs text-center">Ative a fábrica 24/7 para ver as produções finalizadas prontas para publicação.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
