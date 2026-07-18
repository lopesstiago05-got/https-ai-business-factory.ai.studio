import React, { useState, useEffect } from 'react';
import { DigitalProduct, ResearchOpportunity } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  BookOpen, 
  Award, 
  Users, 
  Layers, 
  Briefcase, 
  ListChecks, 
  Clock, 
  DollarSign, 
  Edit, 
  Save, 
  CheckCircle, 
  RefreshCw, 
  FileText, 
  Layout, 
  ArrowRight, 
  AlertTriangle,
  FileCheck,
  ChevronRight,
  Eye
} from 'lucide-react';

interface ProductLaboratoryPanelProps {
  jwtToken: string | null;
  onRefreshState?: () => void;
}

export const ProductLaboratoryPanel: React.FC<ProductLaboratoryPanelProps> = ({ jwtToken, onRefreshState }) => {
  const [approvedOpps, setApprovedOpps] = useState<ResearchOpportunity[]>([]);
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [isLoadingOpps, setIsLoadingOpps] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [creatingForOppId, setCreatingForOppId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<DigitalProduct | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [approvingProductId, setApprovingProductId] = useState<string | null>(null);

  // Edit fields
  const [editName, setEditName] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editMainPromise, setEditMainPromise] = useState('');
  const [editProblemSolved, setEditProblemSolved] = useState('');
  const [editTargetAudience, setEditTargetAudience] = useState('');
  const [editPersona, setEditPersona] = useState('');
  const [editFormat, setEditFormat] = useState('');
  const [editIndex, setEditIndex] = useState('');
  const [editDifferentiation, setEditDifferentiation] = useState('');
  const [editPositioning, setEditPositioning] = useState('');
  const [editProductionPlan, setEditProductionPlan] = useState('');
  const [editBriefing, setEditBriefing] = useState('');
  const [editPrice, setEditPrice] = useState(0);

  const [activeSubTab, setActiveSubTab] = useState<'approved_opps' | 'products'>('approved_opps');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoadingOpps(true);
    setIsLoadingProducts(true);
    setError(null);

    try {
      // 1. Oportunidades aprovadas (prontas para criação)
      const oppsRes = await fetch('/api/research/opportunities');
      if (oppsRes.ok) {
        const data = await oppsRes.json();
        const approved = (data.opportunities || []).filter(
          (o: ResearchOpportunity) => o.status === 'approved'
        );
        setApprovedOpps(approved);
      }

      // 2. Produtos existentes
      const prodRes = await fetch('/api/products');
      if (prodRes.ok) {
        const data = await prodRes.json();
        setProducts(data.products || []);
      }
    } catch (err: any) {
      console.error(err);
      setError('Erro ao carregar dados do Laboratório de Produtos.');
    } finally {
      setIsLoadingOpps(false);
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProduct = async (oppId: string) => {
    setCreatingForOppId(oppId);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/products/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken ? `Bearer ${jwtToken}` : ''
        },
        body: JSON.stringify({ opportunityId: oppId })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Falha ao conceber estrutura do produto.');
      }

      const data = await res.json();
      setSuccessMsg(`Sucesso! O infoproduto "${data.product.name}" foi estruturado pelo Product Creator Agent.`);
      
      // Abre o produto gerado
      setSelectedProduct(data.product);
      setIsEditing(false);
      setActiveSubTab('products');

      await fetchData();
      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao acionar o Product Creator Agent.');
    } finally {
      setCreatingForOppId(null);
    }
  };

  const handleSelectProduct = (product: DigitalProduct) => {
    setSelectedProduct(product);
    setIsEditing(false);
    
    // Seta estados de edição
    setEditName(product.name);
    setEditSubtitle(product.subtitle || '');
    setEditMainPromise(product.mainPromise || '');
    setEditProblemSolved(product.problemSolved || '');
    setEditTargetAudience(product.targetAudience || '');
    setEditPersona(product.persona || '');
    setEditFormat(product.format || product.category || '');
    setEditIndex(product.indexTableOfContents || '');
    setEditDifferentiation(product.differentiation || '');
    setEditPositioning(product.positioningStrategy || '');
    setEditProductionPlan(product.productionPlan || '');
    setEditBriefing(product.briefing || '');
    setEditPrice(product.price);
  };

  const handleSaveProductEdit = async () => {
    if (!selectedProduct) return;
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken ? `Bearer ${jwtToken}` : ''
        },
        body: JSON.stringify({
          name: editName,
          subtitle: editSubtitle,
          mainPromise: editMainPromise,
          problemSolved: editProblemSolved,
          targetAudience: editTargetAudience,
          persona: editPersona,
          format: editFormat,
          category: editFormat,
          indexTableOfContents: editIndex,
          differentiation: editDifferentiation,
          positioningStrategy: editPositioning,
          productionPlan: editProductionPlan,
          briefing: editBriefing,
          price: editPrice
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Falha ao salvar modificações.');
      }

      const data = await res.json();
      setSelectedProduct(data.product);
      setIsEditing(false);
      setSuccessMsg('Estrutura de produto digital atualizada e versionada com sucesso!');
      await fetchData();
      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao salvar alterações do produto.');
    }
  };

  const handleApproveProduct = async (id: string) => {
    setApprovingProductId(id);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/products/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken ? `Bearer ${jwtToken}` : ''
        }
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Falha ao aprovar produto.');
      }

      const data = await res.json();
      setSelectedProduct(data.product);
      setSuccessMsg(`Excelente! O produto "${data.product.name}" foi homologado e enviado para a esteira de produção ativa.`);
      
      await fetchData();
      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao aprovar produto para produção.');
    } finally {
      setApprovingProductId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mensagens de Sucesso e Erro */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl border border-red-500/10 bg-red-500/5 text-red-600 dark:text-red-400 text-xs flex items-center gap-2"
          >
            <AlertTriangle size={15} />
            <span className="font-semibold">{error}</span>
          </motion.div>
        )}
        
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2"
          >
            <CheckCircle size={15} />
            <span className="font-semibold">{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2">
            <Layout size={18} className="text-indigo-500" />
            Laboratório de Produtos (Concepção)
          </h3>
          <p className="text-xs text-slate-400">
            Gerencie o esqueleto didático de infoprodutos a partir de ideias aprovadas estrategicamente.
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl self-start lg:self-center">
          <button
            onClick={() => {
              setActiveSubTab('approved_opps');
              setSelectedProduct(null);
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'approved_opps' && !selectedProduct
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-white shadow'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Sparkles size={13} /> Ideias Aprovadas ({approvedOpps.length})
          </button>
          <button
            onClick={() => setActiveSubTab('products')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'products' || selectedProduct
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-white shadow'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <FileCheck size={13} /> Esteira de Produtos ({products.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lado Esquerdo: Lista conforme sub-tab ativa */}
        {!selectedProduct && (
          <div className="lg:col-span-3 space-y-4">
            {activeSubTab === 'approved_opps' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoadingOpps ? (
                  <div className="col-span-full py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                    <RefreshCw size={24} className="animate-spin text-indigo-500" />
                    Obtendo oportunidades de negócios aprovadas comercialmente...
                  </div>
                ) : approvedOpps.length === 0 ? (
                  <div className="col-span-full text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/40 text-slate-400 space-y-2">
                    <AlertTriangle size={24} className="mx-auto text-amber-500" />
                    <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">Nenhuma oportunidade aprovada</h4>
                    <p className="text-xs">Para conceber um produto, acesse a aba "Inteligência de Mercado" e aprove uma oportunidade comercialmente.</p>
                  </div>
                ) : (
                  approvedOpps.map(opp => (
                    <div 
                      key={opp.id}
                      className="p-5 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4 shadow-sm"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] uppercase tracking-wider">
                            {opp.niche}
                          </span>
                          <span className="text-[10px] text-emerald-500 font-extrabold uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            Aprovado Comercial
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{opp.title}</h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-3">{opp.description}</p>
                        
                        <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500 border-t border-slate-100 dark:border-slate-850">
                          <div>Dor: <span className="font-bold">{opp.painPoint}</span></div>
                          <div>Score: <span className="font-bold text-indigo-500">{opp.finalScore}/10</span></div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCreateProduct(opp.id)}
                        disabled={creatingForOppId !== null}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition-all disabled:opacity-50"
                      >
                        {creatingForOppId === opp.id ? (
                          <>
                            <RefreshCw size={13} className="animate-spin" /> Concedendo estrutura...
                          </>
                        ) : (
                          <>
                            <Sparkles size={13} /> Conceber Produto Digital
                          </>
                        )}
                      </button>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoadingProducts ? (
                  <div className="col-span-full py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                    <RefreshCw size={24} className="animate-spin text-indigo-500" />
                    Buscando produtos digitais na esteira de desenvolvimento...
                  </div>
                ) : products.length === 0 ? (
                  <div className="col-span-full text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/40 text-slate-400 space-y-2">
                    <BookOpen size={24} className="mx-auto text-indigo-500" />
                    <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">Nenhum produto em laboratório</h4>
                    <p className="text-xs">Clique na aba "Ideias Aprovadas" para estruturar e iniciar um conceito de infoproduto.</p>
                  </div>
                ) : (
                  products.map(prod => (
                    <div 
                      key={prod.id}
                      className="p-5 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4 shadow-sm"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-extrabold text-[10px] uppercase tracking-wider">
                            {prod.format || prod.category}
                          </span>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                            prod.productionStatus === 'approved_production'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-amber-500/10 text-amber-500 animate-pulse'
                          }`}>
                            {prod.productionStatus === 'approved_production' ? 'Pronto / Homologado' : 'Conceito / Rascunho'}
                          </span>
                        </div>
                        
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{prod.name}</h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-3">{prod.description}</p>
                        
                        {prod.subtitle && (
                          <div className="text-[10px] text-slate-500 italic font-medium leading-relaxed bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-100 dark:border-slate-850">
                            "{prod.subtitle}"
                          </div>
                        )}
                        
                        <div className="pt-2 flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-100 dark:border-slate-850">
                          <div>Nicho: <span className="font-bold text-slate-800 dark:text-slate-200">{prod.niche}</span></div>
                          <div className="font-bold text-indigo-500">R$ {prod.price}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSelectProduct(prod)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 transition-all"
                      >
                        <Eye size={13} /> Analisar & Configurar Estrutura
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Lado Direito / Detalhamento do Produto Selecionado */}
        {selectedProduct && (
          <div className="lg:col-span-3 space-y-6">
            <button
              onClick={() => setSelectedProduct(null)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-bold"
            >
              &larr; Voltar para a Lista de Produtos
            </button>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Resumo e Status no topo */}
              <div className="xl:col-span-1 space-y-6">
                <div className="p-5 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] uppercase">
                      {selectedProduct.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Versão: {selectedProduct.version || '1.0.0'}</span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-950 dark:text-white text-base leading-tight">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      ) : (
                        selectedProduct.name
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">{selectedProduct.niche}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Status de Homologação:</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${selectedProduct.productionStatus === 'approved_production' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                      <span className={`font-bold text-xs ${selectedProduct.productionStatus === 'approved_production' ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {selectedProduct.productionStatus === 'approved_production' ? 'Aprovado para Produção' : 'Conceito em Rascunho'}
                      </span>
                    </div>
                  </div>

                  {selectedProduct.productionStatus !== 'approved_production' && (
                    <button
                      onClick={() => handleApproveProduct(selectedProduct.id)}
                      disabled={approvingProductId !== null}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow transition-all disabled:opacity-50"
                    >
                      {approvingProductId ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" /> Homologando...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={14} /> Homologar e Enviar para Produção
                        </>
                      )}
                    </button>
                  )}

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-850 flex justify-between gap-4">
                    <button
                      onClick={() => {
                        if (isEditing) {
                          handleSaveProductEdit();
                        } else {
                          setIsEditing(true);
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200"
                    >
                      {isEditing ? (
                        <>
                          <Save size={13} className="text-emerald-500" /> Salvar Estrutura
                        </>
                      ) : (
                        <>
                          <Edit size={13} className="text-indigo-500" /> Editar Parâmetros
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Histórico e logs */}
                <div className="p-5 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-sm">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Log de Alterações</h4>
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {selectedProduct.publicationLogs?.map((log, lIdx) => (
                      <div key={lIdx} className="text-[10px] text-slate-500 leading-normal border-l border-slate-100 dark:border-slate-850 pl-2">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Parâmetros do Produto */}
              <div className="xl:col-span-2 p-6 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6 shadow-sm">
                
                <div className="border-b border-slate-100 dark:border-slate-850 pb-3 flex justify-between items-center">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <BookOpen size={15} className="text-indigo-500" /> Especificações de Concepção
                  </h4>
                  {isEditing && <span className="text-[10px] text-indigo-500 font-bold uppercase animate-pulse">Modo de Edição Ativo</span>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Nome e subtítulo */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Subtítulo Promocional (Subtitle)</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editSubtitle}
                        onChange={(e) => setEditSubtitle(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-xs text-slate-800 dark:text-slate-200 font-medium italic">
                        "{selectedProduct.subtitle || 'Não especificado'}"
                      </div>
                    )}
                  </div>

                  {/* Preço de Venda */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Preço Sugerido (BRL)</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <DollarSign size={13} className="text-emerald-500" /> R$ {selectedProduct.price}
                      </div>
                    )}
                  </div>

                  {/* Formato */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Formato do Produto</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editFormat}
                        onChange={(e) => setEditFormat(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-xs text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1">
                        <Layers size={13} className="text-indigo-500" /> {selectedProduct.format || selectedProduct.category}
                      </div>
                    )}
                  </div>

                  {/* Promessa Principal */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Award size={11} className="text-amber-500" /> Promessa Principal (Big Promise)
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editMainPromise}
                        onChange={(e) => setEditMainPromise(e.target.value)}
                        rows={2}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-semibold">
                        {selectedProduct.mainPromise || 'Não especificada.'}
                      </div>
                    )}
                  </div>

                  {/* Problema Resolvido */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Problema Resolvido</label>
                    {isEditing ? (
                      <textarea
                        value={editProblemSolved}
                        onChange={(e) => setEditProblemSolved(e.target.value)}
                        rows={3}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-h-[120px] overflow-y-auto">
                        {selectedProduct.problemSolved || 'Não especificado.'}
                      </div>
                    )}
                  </div>

                  {/* Público-Alvo */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Público-Alvo Refinado</label>
                    {isEditing ? (
                      <textarea
                        value={editTargetAudience}
                        onChange={(e) => setEditTargetAudience(e.target.value)}
                        rows={3}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-h-[120px] overflow-y-auto">
                        {selectedProduct.targetAudience || 'Não especificado.'}
                      </div>
                    )}
                  </div>

                  {/* Persona */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Users size={11} className="text-violet-500" /> Perfil de Persona Compradora
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editPersona}
                        onChange={(e) => setEditPersona(e.target.value)}
                        rows={3}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    ) : (
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {selectedProduct.persona || 'Não especificado.'}
                      </div>
                    )}
                  </div>

                  {/* Diferenciais */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Diferenciais Competitivos</label>
                    {isEditing ? (
                      <textarea
                        value={editDifferentiation}
                        onChange={(e) => setEditDifferentiation(e.target.value)}
                        rows={4}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-h-[150px] overflow-y-auto">
                        {selectedProduct.differentiation || 'Não especificado.'}
                      </div>
                    )}
                  </div>

                  {/* Posicionamento */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Estratégia de Posicionamento</label>
                    {isEditing ? (
                      <textarea
                        value={editPositioning}
                        onChange={(e) => setEditPositioning(e.target.value)}
                        rows={4}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-h-[150px] overflow-y-auto">
                        {selectedProduct.positioningStrategy || 'Não especificado.'}
                      </div>
                    )}
                  </div>

                  {/* Índice do Produto */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <ListChecks size={11} className="text-indigo-500" /> Estrutura do Índice & Conteúdo (Table of Contents)
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editIndex}
                        onChange={(e) => setEditIndex(e.target.value)}
                        rows={5}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono whitespace-pre-line max-h-[250px] overflow-y-auto">
                        {selectedProduct.indexTableOfContents || 'Não estruturado.'}
                      </div>
                    )}
                  </div>

                  {/* Módulos do Produto */}
                  {selectedProduct.modules && selectedProduct.modules.length > 0 && (
                    <div className="md:col-span-2 space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Visualização Didática por Módulos</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedProduct.modules.map((mod: any, mIdx: number) => (
                          <div key={mIdx} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 space-y-1.5">
                            <h5 className="font-bold text-xs text-indigo-600 dark:text-indigo-400">Mód {mIdx + 1}: {mod.title}</h5>
                            <p className="text-[10.5px] text-slate-500 leading-relaxed">{mod.description}</p>
                            <div className="flex flex-wrap gap-1 pt-1.5 border-t border-slate-100 dark:border-slate-850">
                              {mod.chapters?.map((ch: string, cIdx: number) => (
                                <span key={cIdx} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-[9px] font-medium">
                                  {ch}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Plano de Produção */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Clock size={11} className="text-amber-500" /> Plano de Produção Passo-a-Passo
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editProductionPlan}
                        onChange={(e) => setEditProductionPlan(e.target.value)}
                        rows={4}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    ) : (
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                        {selectedProduct.productionPlan || 'Não disponível.'}
                      </div>
                    )}
                  </div>

                  {/* Briefing para o Writer Agent */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Briefcase size={11} className="text-indigo-500" /> Briefing Técnico para o Redator (Writer Agent)
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editBriefing}
                        onChange={(e) => setEditBriefing(e.target.value)}
                        rows={5}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    ) : (
                      <div className="p-3.5 rounded-xl bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/20 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                        {selectedProduct.briefing || 'Não disponível.'}
                      </div>
                    )}
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
