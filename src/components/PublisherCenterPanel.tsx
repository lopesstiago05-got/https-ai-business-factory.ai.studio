import React, { useState, useEffect } from 'react';
import { DigitalProduct, Publication } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  CheckCircle, 
  RefreshCw, 
  FileText, 
  Edit3, 
  Save, 
  Check, 
  ChevronRight, 
  AlertCircle, 
  Briefcase,
  Layers,
  Activity,
  ArrowRight,
  ShieldCheck,
  CheckSquare,
  ListChecks,
  Share2,
  History,
  DollarSign,
  ExternalLink,
  BookOpen,
  Sparkles,
  Server,
  Database
} from 'lucide-react';

interface PublisherCenterPanelProps {
  jwtToken: string | null;
  onRefreshState?: () => void;
}

export const PublisherCenterPanel: React.FC<PublisherCenterPanelProps> = ({ jwtToken, onRefreshState }) => {
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [preparingForProductId, setPreparingForProductId] = useState<string | null>(null);
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'ready-products' | 'publications'>('ready-products');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit fields
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState(0);
  const [editSalesPageUrl, setEditSalesPageUrl] = useState('');
  const [editTermsAndConditions, setEditTermsAndConditions] = useState('');
  const [editFiles, setEditFiles] = useState<string[]>([]);
  const [newFileField, setNewFileField] = useState('');

  const [isAuditing, setIsAuditing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Carrega produtos
      const prodRes = await fetch('/api/products');
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData.products || []);
      }

      // 2. Carrega publicações
      const pubRes = await fetch('/api/publisher/products');
      if (pubRes.ok) {
        const pubData = await pubRes.json();
        setPublications(pubData.publications || []);
      }
    } catch (err: any) {
      console.error(err);
      setError('Erro ao carregar dados do Centro de Publicação.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePreparePublication = async (productId: string) => {
    setPreparingForProductId(productId);
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await fetch('/api/publisher/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken ? `Bearer ${jwtToken}` : ''
        },
        body: JSON.stringify({ productId })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao preparar publicação.');
      }

      setSuccessMsg(`Estrutura de publicação criada com sucesso para o produto!`);
      await fetchData();
      if (onRefreshState) onRefreshState();

      // Seleciona a publicação criada e muda de aba
      if (data.publication) {
        setSelectedPublication(data.publication);
        setActiveSubTab('publications');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro de comunicação ao preparar publicação.');
    } finally {
      setPreparingForProductId(null);
    }
  };

  const handleRunChecklist = async (pubId: string) => {
    setIsAuditing(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await fetch(`/api/publisher/${pubId}/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken ? `Bearer ${jwtToken}` : ''
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao rodar auditoria de checklist.');
      }

      setSuccessMsg('Auditoria heurística de publicação concluída com sucesso!');
      setSelectedPublication(data.publication);
      await fetchData();
      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Falha ao rodar auditoria.');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleApprovePublication = async (pubId: string) => {
    setIsApproving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await fetch(`/api/publisher/${pubId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken ? `Bearer ${jwtToken}` : ''
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao aprovar publicação.');
      }

      setSuccessMsg('Sucesso! Infoproduto lançado e publicado de forma simulada nas plataformas escolhidas!');
      setSelectedPublication(data.publication);
      await fetchData();
      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Falha ao aprovar publicação.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleStartEditing = (pub: Publication) => {
    setEditDescription(pub.description);
    setEditPrice(pub.price);
    setEditSalesPageUrl(pub.salesPageUrl);
    setEditTermsAndConditions(pub.termsAndConditions);
    setEditFiles(pub.files || []);
    setIsEditing(true);
  };

  const handleAddFile = () => {
    if (newFileField.trim() && !editFiles.includes(newFileField.trim())) {
      setEditFiles([...editFiles, newFileField.trim()]);
      setNewFileField('');
    }
  };

  const handleRemoveFile = (fileName: string) => {
    setEditFiles(editFiles.filter(f => f !== fileName));
  };

  const handleSaveEdition = async (pubId: string) => {
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await fetch(`/api/publisher/${pubId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken ? `Bearer ${jwtToken}` : ''
        },
        body: JSON.stringify({
          description: editDescription,
          price: Number(editPrice),
          salesPageUrl: editSalesPageUrl,
          termsAndConditions: editTermsAndConditions,
          files: editFiles,
          version: incrementVersion(selectedPublication?.version || '1.0.0')
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar alterações.');
      }

      setSuccessMsg('Informações de publicação e nova versão salvas com sucesso!');
      setSelectedPublication(data.publication);
      setIsEditing(false);
      await fetchData();
      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao salvar alterações.');
    }
  };

  const incrementVersion = (currVer: string): string => {
    try {
      const parts = currVer.split('.');
      if (parts.length === 3) {
        const patch = parseInt(parts[2], 10) + 1;
        return `${parts[0]}.${parts[1]}.${patch}`;
      }
    } catch {}
    return '1.0.1';
  };

  const getStatusBadge = (status: Publication['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Pendente
          </span>
        );
      case 'checking':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Em Auditoria
          </span>
        );
      case 'ready':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            Pronto para Lançar
          </span>
        );
      case 'approved':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Aprovado
          </span>
        );
      case 'published':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-600 text-white flex items-center gap-1.5 w-fit">
            <Check size={12} />
            Lançado / Publicado
          </span>
        );
      case 'failed':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Falhou
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-500/10 text-slate-500 border border-slate-500/20 flex items-center gap-1.5 w-fit">
            {status}
          </span>
        );
    }
  };

  return (
    <div id="publisher-center-panel" className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 p-4 md:p-6">
      {/* Header do Módulo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="text-emerald-500 animate-pulse" size={24} />
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase font-sans">
              Centro de Publicação
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Módulo Gerenciado pelo <span className="text-emerald-500 font-semibold">Publisher Agent</span> — Empacotamento de Funil e Checklist Operacional de Lançamento
          </p>
        </div>

        <button 
          onClick={fetchData} 
          disabled={isLoading}
          className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-xs font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Atualizar Dados
        </button>
      </div>

      {/* Alertas */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs p-3 rounded-lg flex items-center gap-2.5 mb-6 font-mono"
        >
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {successMsg && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs p-3 rounded-lg flex items-center gap-2.5 mb-6 font-mono"
        >
          <CheckCircle size={16} className="shrink-0" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {/* Sub Abas de Navegação */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 gap-2">
        <button
          onClick={() => setActiveSubTab('ready-products')}
          className={`px-4 py-2 border-b-2 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'ready-products'
              ? 'border-emerald-500 text-emerald-500 dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Briefcase size={14} /> Produtos Criados ({products.length})
        </button>
        <button
          onClick={() => setActiveSubTab('publications')}
          className={`px-4 py-2 border-b-2 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'publications'
              ? 'border-emerald-500 text-emerald-500 dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Globe size={14} /> Publicações Prontas ({publications.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lado Esquerdo - Listagem dependendo da aba */}
        <div className="lg:col-span-1 space-y-4">
          {isLoading && products.length === 0 ? (
            <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs font-mono">
              Carregando dados da fábrica de infoprodutos...
            </div>
          ) : activeSubTab === 'ready-products' ? (
            <>
              <h2 className="text-sm font-black tracking-wider uppercase text-slate-400 mb-2 font-mono">
                Produtos Disponíveis na Esteira
              </h2>

              {products.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center text-slate-400 text-xs font-mono">
                  Nenhum produto digital foi estruturado pelos agentes de criação ainda.
                </div>
              ) : (
                products.map((prod) => {
                  const hasPub = publications.some(p => p.productId === prod.id);
                  const relatedPub = publications.find(p => p.productId === prod.id);

                  return (
                    <div 
                      key={prod.id}
                      onClick={() => {
                        if (hasPub && relatedPub) {
                          setSelectedPublication(relatedPub);
                          setActiveSubTab('publications');
                        }
                      }}
                      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer text-left bg-white dark:bg-slate-900 ${
                        selectedPublication && selectedPublication.productId === prod.id
                          ? 'border-emerald-500 ring-1 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            {prod.category}
                          </span>
                          <h3 className="text-sm font-bold mt-1 text-slate-900 dark:text-white line-clamp-1">
                            {prod.name}
                          </h3>
                        </div>
                        {hasPub && relatedPub ? (
                          <div className="shrink-0">{getStatusBadge(relatedPub.status)}</div>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                            Sem Lançamento
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                        {prod.description}
                      </p>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                          Preço base: R$ {prod.price}
                        </span>

                        {hasPub ? (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (relatedPub) {
                                setSelectedPublication(relatedPub);
                                setActiveSubTab('publications');
                              }
                            }}
                            className="text-xs font-bold text-emerald-500 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            Ver Lançamento <ChevronRight size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreparePublication(prod.id);
                            }}
                            disabled={preparingForProductId === prod.id}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            {preparingForProductId === prod.id ? (
                              <>
                                <RefreshCw size={10} className="animate-spin" />
                                Preparando...
                              </>
                            ) : (
                              <>
                                <Sparkles size={10} />
                                Preparar Lançamento
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </>
          ) : (
            <>
              <h2 className="text-sm font-black tracking-wider uppercase text-slate-400 mb-2 font-mono">
                Lançamentos Estruturados
              </h2>

              {publications.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center text-slate-400 text-xs font-mono">
                  Nenhum produto foi preparado para lançamento. Clique na aba de Produtos Criados para iniciar um.
                </div>
              ) : (
                publications.map((pub) => (
                  <div 
                    key={pub.id}
                    onClick={() => {
                      setSelectedPublication(pub);
                      setIsEditing(false);
                    }}
                    className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer text-left bg-white dark:bg-slate-900 ${
                      selectedPublication && selectedPublication.id === pub.id
                        ? 'border-emerald-500 ring-1 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400">
                          Versão {pub.version}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                          {pub.productName}
                        </h3>
                      </div>
                      <div className="shrink-0">{getStatusBadge(pub.status)}</div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                      {pub.description}
                    </p>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                      <span className="font-bold text-emerald-500 font-mono">
                        Checkout: R$ {pub.price}
                      </span>
                      <span className="text-slate-400 text-[10px] font-mono">
                        ID: {pub.id}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>

        {/* Lado Direito - Painel de Detalhes da Publicação Selecionada */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {!selectedPublication ? (
              <motion.div 
                key="no-selected"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px]"
              >
                <Globe size={48} className="text-slate-300 dark:text-slate-700 mb-4 stroke-1" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  Nenhuma Publicação Selecionada
                </h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Escolha um infoproduto disponível para preparar ou selecione uma publicação existente na listagem lateral para auditar, conferir arquivos, simular plataformas e autorizar o lançamento.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key={selectedPublication.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col"
              >
                {/* Header dos Detalhes */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-500 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/10">
                          ID: {selectedPublication.id}
                        </span>
                        <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-bold">
                          Versão {selectedPublication.version}
                        </span>
                      </div>
                      <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mt-1.5 font-sans">
                        {selectedPublication.productName}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(selectedPublication.status)}

                      {!isEditing && selectedPublication.status !== 'published' && (
                        <button
                          onClick={() => handleStartEditing(selectedPublication)}
                          className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-600 dark:text-slate-300 cursor-pointer"
                          title="Editar Lançamento"
                        >
                          <Edit3 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Corpo do Painel */}
                <div className="p-6 space-y-6 flex-1">
                  {isEditing ? (
                    // Formulário de Edição
                    <div className="space-y-4 text-left">
                      <div className="border border-indigo-500/20 bg-indigo-500/5 rounded-xl p-3 mb-4 text-[11px] font-mono text-indigo-400">
                        Nota: Salvar as alterações incrementará o número de versão para refletir as mudanças do empacotador.
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                          Descrição Comercial (Checkout)
                        </label>
                        <textarea
                          rows={4}
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                            Preço de Venda (R$)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={editPrice}
                            onChange={(e) => setEditPrice(Number(e.target.value))}
                            className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                            URL Checkout do Carrinho
                          </label>
                          <input
                            type="text"
                            value={editSalesPageUrl}
                            onChange={(e) => setEditSalesPageUrl(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                          Termos & Garantia de Compra
                        </label>
                        <textarea
                          rows={3}
                          value={editTermsAndConditions}
                          onChange={(e) => setEditTermsAndConditions(e.target.value)}
                          className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                          Arquivos Finais para Download
                        </label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="Adicionar arquivo (Ex: Ebook_Marketing_v1.pdf)"
                            value={newFileField}
                            onChange={(e) => setNewFileField(e.target.value)}
                            className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleAddFile}
                            className="px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Adicionar
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {editFiles.map((file) => (
                            <span 
                              key={file}
                              className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-1.5"
                            >
                              <FileText size={12} className="text-slate-400" />
                              {file}
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(file)}
                                className="text-rose-500 hover:text-rose-700 font-bold ml-1 text-xs"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <button
                          onClick={() => handleSaveEdition(selectedPublication.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Save size={14} /> Salvar Edição
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg text-xs text-slate-500 font-bold cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Visualização de Detalhes
                    <div className="space-y-6 text-left">
                      {/* Descrição e Capa se houver */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
                            Descrição de Checkout (Comercial)
                          </h3>
                          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-900 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                            {selectedPublication.description}
                          </div>
                        </div>

                        <div className="md:col-span-1">
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
                            Imagem do Checkout
                          </h3>
                          {selectedPublication.images && selectedPublication.images.length > 0 ? (
                            <img 
                              src={selectedPublication.images[0]} 
                              alt="Mockup do produto" 
                              referrerPolicy="no-referrer"
                              className="w-full h-28 object-cover rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900"
                            />
                          ) : (
                            <div className="w-full h-28 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs font-mono">
                              Sem imagens
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Informações Comerciais */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-900/60">
                          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                            Preço Final Sugerido
                          </span>
                          <span className="text-lg font-black text-emerald-500 font-mono">
                            R$ {selectedPublication.price.toFixed(2)}
                          </span>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-900/60">
                          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                            URL de Venda
                          </span>
                          <a 
                            href={selectedPublication.salesPageUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-emerald-500 hover:underline flex items-center gap-1 mt-1 font-mono break-all line-clamp-1"
                          >
                            Ir para checkout <ExternalLink size={10} />
                          </a>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-900/60">
                          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                            Categoria
                          </span>
                          <span className="text-sm font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                            {selectedPublication.category}
                          </span>
                        </div>
                      </div>

                      {/* Checklist Técnico de Publicação */}
                      <div className="p-5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200/60 dark:border-slate-900">
                        <div className="flex items-center justify-between mb-4 border-b border-slate-200/60 dark:border-slate-900 pb-3">
                          <div className="flex items-center gap-1.5">
                            <ListChecks size={16} className="text-emerald-500" />
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
                              Checklist de Verificação de Qualidade
                            </h3>
                          </div>

                          {selectedPublication.status === 'pending' && (
                            <button
                              onClick={() => handleRunChecklist(selectedPublication.id)}
                              disabled={isAuditing}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg flex items-center gap-1 cursor-pointer"
                            >
                              {isAuditing ? (
                                <>
                                  <RefreshCw size={10} className="animate-spin" />
                                  Auditando...
                                </>
                              ) : (
                                <>
                                  <ShieldCheck size={10} />
                                  Rodar Auditoria IA
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/40">
                            {selectedPublication.checklist?.filesVerified ? (
                              <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                            ) : (
                              <AlertCircle size={16} className="text-amber-500 shrink-0 animate-pulse" />
                            )}
                            <span className="text-slate-600 dark:text-slate-300 font-mono">
                              Arquivos finais catalogados e verificados
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/40">
                            {selectedPublication.checklist?.commercialOk ? (
                              <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                            ) : (
                              <AlertCircle size={16} className="text-amber-500 shrink-0 animate-pulse" />
                            )}
                            <span className="text-slate-600 dark:text-slate-300 font-mono">
                              Conferência de precificação e dados comerciais
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/40">
                            {selectedPublication.checklist?.termsAccepted ? (
                              <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                            ) : (
                              <AlertCircle size={16} className="text-amber-500 shrink-0 animate-pulse" />
                            )}
                            <span className="text-slate-600 dark:text-slate-300 font-mono">
                              Política de CDC (garantia de 7 dias) aceita
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/40">
                            {selectedPublication.checklist?.metadataComplete ? (
                              <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                            ) : (
                              <AlertCircle size={16} className="text-amber-500 shrink-0 animate-pulse" />
                            )}
                            <span className="text-slate-600 dark:text-slate-300 font-mono">
                              Metadados e tags de categorias preenchidos
                            </span>
                          </div>
                        </div>

                        {selectedPublication.checklist?.itemsChecked && selectedPublication.checklist.itemsChecked.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-900 text-[10px] font-mono text-slate-400">
                            <span className="font-bold text-slate-500">Etapas auditadas pela IA:</span>{' '}
                            {selectedPublication.checklist.itemsChecked.join(' | ')}
                          </div>
                        )}
                      </div>

                      {/* Plataformas de Vendas Selecionadas */}
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 font-mono">
                          Arquitetura de Plataformas de Destino (Integração Futura)
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                          <div className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                            selectedPublication.platforms?.hotmart 
                              ? 'border-emerald-500 bg-emerald-500/5 text-slate-800 dark:text-white' 
                              : 'border-slate-200 dark:border-slate-800 opacity-45'
                          }`}>
                            <BookOpen size={20} className="text-amber-500 mb-1" />
                            <span className="text-[10px] font-bold font-mono">Hotmart</span>
                          </div>

                          <div className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                            selectedPublication.platforms?.kiwify 
                              ? 'border-emerald-500 bg-emerald-500/5 text-slate-800 dark:text-white' 
                              : 'border-slate-200 dark:border-slate-800 opacity-45'
                          }`}>
                            <Sparkles size={20} className="text-indigo-500 mb-1" />
                            <span className="text-[10px] font-bold font-mono">Kiwify</span>
                          </div>

                          <div className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                            selectedPublication.platforms?.monetizze 
                              ? 'border-emerald-500 bg-emerald-500/5 text-slate-800 dark:text-white' 
                              : 'border-slate-200 dark:border-slate-800 opacity-45'
                          }`}>
                            <DollarSign size={20} className="text-teal-500 mb-1" />
                            <span className="text-[10px] font-bold font-mono">Monetizze</span>
                          </div>

                          <div className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                            selectedPublication.platforms?.customStore 
                              ? 'border-emerald-500 bg-emerald-500/5 text-slate-800 dark:text-white' 
                              : 'border-slate-200 dark:border-slate-800 opacity-45'
                          }`}>
                            <Server size={20} className="text-slate-400 mb-1" />
                            <span className="text-[10px] font-bold font-mono">Loja Digital</span>
                          </div>

                          <div className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                            selectedPublication.platforms?.externalApi 
                              ? 'border-emerald-500 bg-emerald-500/5 text-slate-800 dark:text-white' 
                              : 'border-slate-200 dark:border-slate-800 opacity-45'
                          }`}>
                            <Database size={20} className="text-sky-500 mb-1" />
                            <span className="text-[10px] font-bold font-mono">API Externa</span>
                          </div>
                        </div>
                      </div>

                      {/* Arquivos de Entrega e Termos Legais */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 font-mono">
                            Arquivos de Entrega Catalogados
                          </h3>
                          <div className="space-y-2 bg-slate-50 dark:bg-slate-950/30 p-4 rounded-xl border border-slate-100 dark:border-slate-900">
                            {selectedPublication.files && selectedPublication.files.length > 0 ? (
                              selectedPublication.files.map((file) => (
                                <div 
                                  key={file}
                                  className="flex items-center gap-2 p-2 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs font-mono"
                                >
                                  <FileText size={14} className="text-slate-400" />
                                  <span className="text-slate-700 dark:text-slate-300 truncate">{file}</span>
                                </div>
                              ))
                            ) : (
                              <div className="text-center text-slate-400 text-xs font-mono py-2">
                                Nenhum arquivo de entrega definido.
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 font-mono">
                            Termos de Reembolso e Política de CDC
                          </h3>
                          <div className="p-4 bg-slate-50 dark:bg-slate-950/30 rounded-xl border border-slate-100 dark:border-slate-900/60 text-[11px] leading-relaxed font-mono text-slate-500 dark:text-slate-400 max-h-32 overflow-y-auto">
                            {selectedPublication.termsAndConditions}
                          </div>
                        </div>
                      </div>

                      {/* Histórico / Logs */}
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 font-mono flex items-center gap-1">
                          <History size={14} /> Histórico de Versionamento e Lançamento
                        </h3>
                        <div className="bg-slate-50 dark:bg-slate-950/30 rounded-xl border border-slate-100 dark:border-slate-900 p-4 space-y-3 font-mono text-[11px] max-h-40 overflow-y-auto">
                          {selectedPublication.history && selectedPublication.history.length > 0 ? (
                            selectedPublication.history.map((log, i) => (
                              <div key={i} className="flex items-start gap-2 text-left border-b border-slate-100 dark:border-slate-900/60 pb-2 last:border-0 last:pb-0">
                                <span className="text-[10px] text-slate-400 shrink-0">
                                  [{new Date(log.timestamp).toLocaleTimeString()}]
                                </span>
                                <div>
                                  <span className="font-extrabold text-emerald-500 uppercase">{log.action}</span>
                                  <span className="text-slate-400"> (por {log.actor}):</span>{' '}
                                  <span className="text-slate-600 dark:text-slate-300">{log.details}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center text-slate-400 py-2">
                              Nenhum histórico registrado ainda.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Botão de Ação Principal - Publicação Final */}
                      {selectedPublication.status !== 'published' && (
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
                          <button
                            onClick={() => handleApprovePublication(selectedPublication.id)}
                            disabled={isApproving}
                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
                          >
                            {isApproving ? (
                              <>
                                <RefreshCw size={14} className="animate-spin" />
                                Lançando Produto...
                              </>
                            ) : (
                              <>
                                <Globe size={14} />
                                Aprovar e Lançar Infoproduto
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
