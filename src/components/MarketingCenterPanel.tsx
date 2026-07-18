import React, { useState, useEffect } from 'react';
import { DigitalProduct, MarketingCampaign } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Megaphone, 
  Target, 
  Compass, 
  Users, 
  TrendingUp, 
  Coins, 
  Award, 
  FileText, 
  CheckCircle, 
  RefreshCw, 
  Edit3, 
  Save, 
  Plus, 
  Instagram, 
  Play, 
  Calendar, 
  Flame, 
  ShieldCheck, 
  ThumbsUp, 
  Check, 
  ChevronRight, 
  AlertCircle, 
  Briefcase,
  Layers,
  Activity,
  ArrowRight
} from 'lucide-react';

interface MarketingCenterPanelProps {
  jwtToken: string | null;
  onRefreshState?: () => void;
}

export const MarketingCenterPanel: React.FC<MarketingCenterPanelProps> = ({ jwtToken, onRefreshState }) => {
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatingForProductId, setGeneratingForProductId] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<MarketingCampaign | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'products' | 'campaigns'>('products');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit fields
  const [editTitle, setEditTitle] = useState('');
  const [editPersonaName, setEditPersonaName] = useState('');
  const [editPersonaPain, setEditPersonaPain] = useState('');
  const [editPersonaDesire, setEditPersonaDesire] = useState('');
  const [editPersonaUVP, setEditPersonaUVP] = useState('');
  const [editPersonaAdvantage, setEditPersonaAdvantage] = useState('');
  const [editPositioning, setEditPositioning] = useState('');
  const [editSalesPageTitle, setEditSalesPageTitle] = useState('');
  const [editSalesPageProblem, setEditSalesPageProblem] = useState('');
  const [editSalesPageSolution, setEditSalesPageSolution] = useState('');
  const [editSalesPageOffer, setEditSalesPageOffer] = useState('');

  const [isReviewing, setIsReviewing] = useState(false);
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

      // 2. Carrega campanhas de marketing
      const campRes = await fetch('/api/marketing/campaigns');
      if (campRes.ok) {
        const campData = await campRes.json();
        setCampaigns(campData.campaigns || []);
      }
    } catch (err: any) {
      console.error(err);
      setError('Erro ao carregar dados do Centro de Marketing.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateMarketing = async (productId: string) => {
    setGeneratingForProductId(productId);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/marketing/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken ? `Bearer ${jwtToken}` : ''
        },
        body: JSON.stringify({ productId })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro desconhecido na geração de marketing.');
      }

      setSuccessMsg(`Plano de Go-To-Market criado com sucesso para o produto!`);
      await fetchData();
      if (onRefreshState) onRefreshState();

      // Seleciona a campanha recém-criada
      if (data.campaign) {
        setSelectedCampaign(data.campaign);
        setActiveSubTab('campaigns');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Falha ao disparar geração do Marketing Agent.');
    } finally {
      setGeneratingForProductId(null);
    }
  };

  const handleSelectCampaign = (camp: MarketingCampaign) => {
    setSelectedCampaign(camp);
    setIsEditing(false);
    setError(null);
    setSuccessMsg(null);

    // Carrega campos para edição
    setEditTitle(camp.title || '');
    setEditPersonaName(camp.persona?.name || '');
    setEditPersonaPain(camp.persona?.painPoint || '');
    setEditPersonaDesire(camp.persona?.mainDesire || '');
    setEditPersonaUVP(camp.persona?.uvp || '');
    setEditPersonaAdvantage(camp.persona?.competitiveAdvantage || '');
    setEditPositioning(camp.positioning || '');
    setEditSalesPageTitle(camp.salesPage?.title || '');
    setEditSalesPageProblem(camp.salesPage?.problem || '');
    setEditSalesPageSolution(camp.salesPage?.solution || '');
    setEditSalesPageOffer(camp.salesPage?.offer || '');
  };

  const handleSaveCampaign = async () => {
    if (!selectedCampaign) return;
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    const payload = {
      title: editTitle,
      persona: {
        name: editPersonaName,
        painPoint: editPersonaPain,
        mainDesire: editPersonaDesire,
        uvp: editPersonaUVP,
        competitiveAdvantage: editPersonaAdvantage
      },
      positioning: editPositioning,
      salesPage: {
        ...selectedCampaign.salesPage,
        title: editSalesPageTitle,
        problem: editSalesPageProblem,
        solution: editSalesPageSolution,
        offer: editSalesPageOffer
      }
    };

    try {
      const res = await fetch(`/api/marketing/campaigns/${selectedCampaign.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken ? `Bearer ${jwtToken}` : ''
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar atualizações.');

      setSuccessMsg('Campanha de marketing editada com sucesso!');
      setSelectedCampaign(data.campaign);
      setIsEditing(false);
      await fetchData();
      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar alterações da campanha.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunReview = async () => {
    if (!selectedCampaign) return;
    setIsReviewing(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/marketing/campaigns/${selectedCampaign.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken ? `Bearer ${jwtToken}` : ''
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao realizar revisão.');

      setSuccessMsg(`Controle de Qualidade executado! Novo score de marketing: ${data.campaign.qualityScore}/10`);
      setSelectedCampaign(data.campaign);
      await fetchData();
      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      setError(err.message || 'Falha ao reavaliar campanha.');
    } finally {
      setIsReviewing(false);
    }
  };

  const handleApproveCampaign = async () => {
    if (!selectedCampaign) return;
    setIsApproving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/marketing/campaigns/${selectedCampaign.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken ? `Bearer ${jwtToken}` : ''
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao aprovar campanha.');

      setSuccessMsg('Estratégia de Marketing formalmente aprovada para o funil de aquisição!');
      setSelectedCampaign(data.campaign);
      await fetchData();
      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      setError(err.message || 'Erro ao aprovar campanha de marketing.');
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="space-y-6" id="marketing-center-panel">
      {/* Header do Painel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <Megaphone className="w-5 h-5" />
            <span className="text-xs font-mono tracking-widest uppercase font-bold">Marketing & Growth</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Centro de Marketing</h1>
          <p className="text-zinc-400 text-sm mt-0.5">
            Diretor de Crescimento: Crie personas, copies persuasivas, páginas de alta conversão e funis de anúncios pagos integrados.
          </p>
        </div>
        
        {/* Sub-abas de Navegação */}
        <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-lg self-start md:self-center">
          <button
            onClick={() => { setActiveSubTab('products'); setSelectedCampaign(null); }}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeSubTab === 'products'
                ? 'bg-emerald-500 text-black font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Produtos Prontos
          </button>
          <button
            onClick={() => { setActiveSubTab('campaigns'); }}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeSubTab === 'campaigns'
                ? 'bg-emerald-500 text-black font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Estratégias de Growth ({campaigns.length})
          </button>
        </div>
      </div>

      {/* Feedbacks Rápidos do Servidor */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-red-950/40 border border-red-800 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-sm text-red-200">{error}</div>
          </motion.div>
        )}

        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-emerald-950/40 border border-emerald-800 rounded-lg flex items-start gap-3"
          >
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-sm text-emerald-200">{successMsg}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Carregando global */}
      {isLoading && (
        <div className="flex items-center justify-center p-8 bg-zinc-900/40 border border-zinc-800 rounded-lg">
          <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin mr-3" />
          <span className="text-zinc-400 text-sm">Atualizando repositório de marketing...</span>
        </div>
      )}

      {/* ABA 1: PRODUTOS PRONTOS PARA MARKETING */}
      {activeSubTab === 'products' && !isLoading && (
        <div className="space-y-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Gargalo de Aquisição de Tráfego
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Aqui estão listados todos os produtos criados pela fábrica. Ative o <strong>Marketing Agent</strong> para criar o mapeamento de persona, copy de vendas, scripts de anúncios e calendário de mídia orgânica integrados ao visual do designer e à escrita do redator.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => {
              const hasCampaign = campaigns.some(c => c.productId === product.id);
              const productCampaign = campaigns.find(c => c.productId === product.id);

              return (
                <div 
                  key={product.id}
                  className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 flex flex-col justify-between transition-all"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-2.5 py-0.5 bg-zinc-800 text-zinc-300 text-[10px] font-mono rounded-full uppercase">
                        {product.niche || 'Nicho Geral'}
                      </span>
                      {hasCampaign ? (
                        <span className="px-2.5 py-0.5 bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> Plano Ativo
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-yellow-500/15 text-yellow-400 text-[10px] font-semibold rounded-full">
                          Sem Marketing
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-white text-base mb-1">{product.name}</h3>
                    <p className="text-zinc-400 text-xs line-clamp-3 mb-4">
                      {product.description || 'Nenhuma descrição fornecida ainda.'}
                    </p>

                    <div className="border-t border-zinc-800/80 pt-3 mt-3 space-y-2 text-xs">
                      <div className="flex justify-between text-zinc-400">
                        <span>Preço de Venda:</span>
                        <strong className="text-white">R$ {product.price || '0.00'}</strong>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Lançamento:</span>
                        <span className="text-zinc-300">Funil Perpétuo / Tráfego</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-zinc-800/80">
                    {hasCampaign && productCampaign ? (
                      <button
                        onClick={() => handleSelectCampaign(productCampaign)}
                        className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg text-xs flex items-center justify-center gap-1 transition-all"
                      >
                        Visualizar Plano Estratégico <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCreateMarketing(product.id)}
                        disabled={generatingForProductId === product.id}
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {generatingForProductId === product.id ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Estruturando Funis...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            Gerar Plano de Lançamento
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {products.length === 0 && (
              <div className="col-span-full text-center p-12 border border-dashed border-zinc-800 rounded-xl">
                <AlertCircle className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <h3 className="text-white font-medium">Nenhum produto digital cadastrado</h3>
                <p className="text-zinc-500 text-xs mt-1">Crie um produto ou execute o CEO Agent primeiro para povoar a fábrica.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 2: LISTAGEM E DETALHES DE CAMPANHAS DE GROWTH */}
      {activeSubTab === 'campaigns' && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Coluna Esquerda: Lista de Campanhas */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xs font-mono font-bold tracking-wider text-zinc-400 uppercase mb-2">Planos de Crescimento Ativos</h2>
            
            <div className="space-y-2.5">
              {campaigns.map(camp => {
                const isSelected = selectedCampaign?.id === camp.id;
                return (
                  <div
                    key={camp.id}
                    onClick={() => handleSelectCampaign(camp)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-emerald-950/20 border-emerald-500/80 shadow-md' 
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="font-bold text-sm text-white line-clamp-1">{camp.productName || 'Infoproduto'}</h3>
                      <span className={`px-2 py-0.5 text-[9px] font-mono rounded uppercase ${
                        camp.status === 'approved' 
                          ? 'bg-emerald-500/20 text-emerald-300' 
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {camp.status === 'approved' ? 'Aprovado' : 'Rascunho'}
                      </span>
                    </div>

                    <p className="text-zinc-400 text-xs line-clamp-2 mb-3">
                      UVP: {camp.persona?.uvp || 'Sem proposta única de valor cadastrada.'}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/60">
                      <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                        <Activity className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Média Conversão:</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-white">
                        {camp.qualityScore ? `${camp.qualityScore}/10` : 'N/A'}
                      </span>
                    </div>
                  </div>
                );
              })}

              {campaigns.length === 0 && (
                <div className="text-center p-8 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                  <Megaphone className="w-8 h-8 text-zinc-700 mx-auto mb-2 animate-pulse" />
                  <p className="text-zinc-500 text-xs">Nenhum plano de marketing foi gerado ainda.</p>
                </div>
              )}
            </div>
          </div>

          {/* Coluna Direita: Detalhamento da Campanha Selecionada */}
          <div className="lg:col-span-8">
            {selectedCampaign ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
                
                {/* Cabeçalho do Detalhe */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-zinc-800 pb-5">
                  <div>
                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono mb-1">
                      <span>Produto associado: {selectedCampaign.productName}</span>
                      <span>•</span>
                      <span>ID: {selectedCampaign.id.substring(0, 8)}</span>
                    </div>
                    
                    {isEditing ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="text-xl font-bold text-white bg-zinc-800 border border-zinc-700 px-3 py-1 rounded w-full max-w-md focus:outline-none focus:border-emerald-500"
                      />
                    ) : (
                      <h3 className="text-xl font-bold text-white">{selectedCampaign.title}</h3>
                    )}
                  </div>

                  {/* Ações da estratégia */}
                  <div className="flex gap-2 shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSaveCampaign}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg text-xs flex items-center gap-1 transition-all"
                        >
                          <Save className="w-3.5 h-3.5" /> Salvar
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg text-xs transition-all"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-3 py-1.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg text-xs flex items-center gap-1 transition-all border border-zinc-800"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-zinc-400" /> Customizar
                        </button>

                        <button
                          onClick={handleRunReview}
                          disabled={isReviewing}
                          className="px-3 py-1.5 bg-zinc-850 hover:bg-zinc-800 text-emerald-400 rounded-lg text-xs flex items-center gap-1 transition-all border border-zinc-800 disabled:opacity-50"
                        >
                          {isReviewing ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Activity className="w-3.5 h-3.5" />
                          )}
                          Reauditar
                        </button>

                        {selectedCampaign.status !== 'approved' && (
                          <button
                            onClick={handleApproveCampaign}
                            disabled={isApproving}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg text-xs flex items-center gap-1 transition-all"
                          >
                            {isApproving ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <ShieldCheck className="w-3.5 h-3.5" />
                            )}
                            Aprovar Direção
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Bloco 1: Auditoria de Performance do Funil (Scores) */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-mono font-bold tracking-wider text-zinc-300 uppercase">Qualidade Conversiva do Funil (Acurácia de Vendas)</h4>
                    </div>
                    <span className="text-sm font-bold font-mono text-emerald-400">{selectedCampaign.qualityScore || 'N/A'}/10</span>
                  </div>

                  {/* Barras de Score */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex justify-between text-zinc-400">
                        <span>Clareza da Oferta:</span>
                        <span className="text-white font-semibold font-mono">{selectedCampaign.offerClarityScore || 8}/10</span>
                      </div>
                      <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-emerald-400 h-1.5 rounded-full transition-all"
                          style={{ width: `${(selectedCampaign.offerClarityScore || 8) * 10}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-zinc-400">
                        <span>Poder de Conversão (Copy):</span>
                        <span className="text-white font-semibold font-mono">{selectedCampaign.conversionPowerScore || 8}/10</span>
                      </div>
                      <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-emerald-400 h-1.5 rounded-full transition-all"
                          style={{ width: `${(selectedCampaign.conversionPowerScore || 8) * 10}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-zinc-400">
                        <span>Adequação ao Público:</span>
                        <span className="text-white font-semibold font-mono">{selectedCampaign.audienceFitScore || 8}/10</span>
                      </div>
                      <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-emerald-400 h-1.5 rounded-full transition-all"
                          style={{ width: `${(selectedCampaign.audienceFitScore || 8) * 10}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-zinc-400">
                        <span>Diferencial de Nicho:</span>
                        <span className="text-white font-semibold font-mono">{selectedCampaign.differentiationScore || 8}/10</span>
                      </div>
                      <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-emerald-400 h-1.5 rounded-full transition-all"
                          style={{ width: `${(selectedCampaign.differentiationScore || 8) * 10}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1 col-span-1 sm:col-span-2">
                      <div className="flex justify-between text-zinc-400">
                        <span>Potencial de Escala de Tráfego:</span>
                        <span className="text-white font-semibold font-mono">{selectedCampaign.scalePotentialScore || 8}/10</span>
                      </div>
                      <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-emerald-400 h-1.5 rounded-full transition-all"
                          style={{ width: `${(selectedCampaign.scalePotentialScore || 8) * 10}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Feedback do Growth Hacker */}
                  <div className="border-t border-zinc-900 pt-3 text-xs text-zinc-400 italic bg-zinc-950">
                    <span className="text-zinc-300 font-medium block not-italic mb-1">Feedback de Conversão do Growth Hacker:</span>
                    "{selectedCampaign.feedback || 'Nenhum feedback adicional disponível.'}"
                  </div>
                </div>

                {/* Abas Internas de Visualização dos Ativos Estratégicos */}
                <div className="space-y-6">
                  
                  {/* Persona e Posicionamento */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-400" />
                      1. Mapeamento da Persona & Posicionamento
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-900/60 p-4 border border-zinc-800 rounded-xl">
                      <div className="space-y-3 text-xs">
                        <div>
                          <span className="text-zinc-500 font-mono text-[10px] uppercase">Avatar / Arquétipo</span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editPersonaName}
                              onChange={(e) => setEditPersonaName(e.target.value)}
                              className="text-white font-semibold bg-zinc-850 border border-zinc-700 px-2 py-1 rounded w-full mt-1"
                            />
                          ) : (
                            <p className="text-white font-semibold mt-0.5">{selectedCampaign.persona?.name || 'Não especificada'}</p>
                          )}
                        </div>

                        <div>
                          <span className="text-zinc-500 font-mono text-[10px] uppercase">Dor Principal Latente</span>
                          {isEditing ? (
                            <textarea
                              value={editPersonaPain}
                              onChange={(e) => setEditPersonaPain(e.target.value)}
                              className="text-zinc-300 bg-zinc-850 border border-zinc-700 px-2 py-1 rounded w-full mt-1 h-14 resize-none"
                            />
                          ) : (
                            <p className="text-zinc-300 mt-0.5 leading-relaxed">{selectedCampaign.persona?.painPoint || 'Não especificada'}</p>
                          )}
                        </div>

                        <div>
                          <span className="text-zinc-500 font-mono text-[10px] uppercase">Desejo de Transformação</span>
                          {isEditing ? (
                            <textarea
                              value={editPersonaDesire}
                              onChange={(e) => setEditPersonaDesire(e.target.value)}
                              className="text-zinc-300 bg-zinc-850 border border-zinc-700 px-2 py-1 rounded w-full mt-1 h-14 resize-none"
                            />
                          ) : (
                            <p className="text-zinc-300 mt-0.5 leading-relaxed">{selectedCampaign.persona?.mainDesire || 'Não especificado'}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3 text-xs border-t md:border-t-0 md:border-l border-zinc-800 md:pl-4">
                        <div>
                          <span className="text-zinc-500 font-mono text-[10px] uppercase">Proposta Única de Valor (UVP)</span>
                          {isEditing ? (
                            <textarea
                              value={editPersonaUVP}
                              onChange={(e) => setEditPersonaUVP(e.target.value)}
                              className="text-emerald-300 bg-zinc-850 border border-zinc-700 px-2 py-1 rounded w-full mt-1 h-14 resize-none"
                            />
                          ) : (
                            <p className="text-emerald-300 font-medium mt-0.5 leading-relaxed">{selectedCampaign.persona?.uvp || 'Não especificada'}</p>
                          )}
                        </div>

                        <div>
                          <span className="text-zinc-500 font-mono text-[10px] uppercase">Diferencial de Mercado</span>
                          {isEditing ? (
                            <textarea
                              value={editPersonaAdvantage}
                              onChange={(e) => setEditPersonaAdvantage(e.target.value)}
                              className="text-zinc-300 bg-zinc-850 border border-zinc-700 px-2 py-1 rounded w-full mt-1 h-14 resize-none"
                            />
                          ) : (
                            <p className="text-zinc-300 mt-0.5 leading-relaxed">{selectedCampaign.persona?.competitiveAdvantage || 'Não especificado'}</p>
                          )}
                        </div>

                        <div>
                          <span className="text-zinc-500 font-mono text-[10px] uppercase">Estratégia de Posicionamento</span>
                          {isEditing ? (
                            <textarea
                              value={editPositioning}
                              onChange={(e) => setEditPositioning(e.target.value)}
                              className="text-zinc-300 bg-zinc-850 border border-zinc-700 px-2 py-1 rounded w-full mt-1 h-14 resize-none"
                            />
                          ) : (
                            <p className="text-zinc-300 mt-0.5 leading-relaxed">{selectedCampaign.positioning || 'Não especificado'}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Copywriting Persuasivo */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      2. Copywriting e Elementos Persuasivos
                    </h4>

                    <div className="space-y-3 bg-zinc-900/40 p-4 border border-zinc-800 rounded-xl text-xs">
                      {/* Headlines */}
                      <div>
                        <span className="text-zinc-500 font-mono text-[10px] uppercase block mb-1.5">Headlines Magnéticas Geradas</span>
                        <div className="space-y-1.5">
                          {(selectedCampaign.copywriting?.headlines || []).map((hl, i) => (
                            <div key={i} className="bg-zinc-950 border border-zinc-900 px-3 py-2 rounded flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                              <span className="text-white italic">"{hl}"</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Subheadlines */}
                      <div className="pt-2">
                        <span className="text-zinc-500 font-mono text-[10px] uppercase block mb-1.5">Subheadlines de Engajamento</span>
                        <div className="space-y-1.5">
                          {(selectedCampaign.copywriting?.subheadlines || []).map((sh, i) => (
                            <div key={i} className="text-zinc-300 leading-relaxed pl-3 border-l-2 border-zinc-800 italic">
                              "{sh}"
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Quebra de Objeções */}
                      <div className="pt-2">
                        <span className="text-zinc-500 font-mono text-[10px] uppercase block mb-1.5">Argumentos Lógicos de Venda & Quebra de Objeções</span>
                        <ul className="space-y-1 text-zinc-300 list-disc pl-4 leading-relaxed">
                          {(selectedCampaign.copywriting?.sellingArguments || []).map((arg, i) => (
                            <li key={i}>{arg}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Benefícios */}
                      <div className="pt-2">
                        <span className="text-zinc-500 font-mono text-[10px] uppercase block mb-1.5">Transformações / Benefícios Mapeados</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(selectedCampaign.copywriting?.benefits || []).map((b, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-zinc-300">
                              <ThumbsUp className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                              <span>{b}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* CTAs */}
                      <div className="pt-2 border-t border-zinc-800/60 mt-3">
                        <span className="text-zinc-500 font-mono text-[10px] uppercase block mb-1.5">Chamadas para Ação de Alta Conversão</span>
                        <div className="flex flex-wrap gap-2">
                          {(selectedCampaign.copywriting?.ctas || []).map((cta, i) => (
                            <span key={i} className="bg-emerald-950/40 border border-emerald-900 px-2.5 py-1 text-emerald-300 rounded font-mono text-[11px]">
                              {cta}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Landing Page Blueprint */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      3. Estrutura de Seções da Página de Vendas (Landing Page)
                    </h4>

                    <div className="space-y-3.5 bg-zinc-900/40 p-4 border border-zinc-800 rounded-xl text-xs">
                      <div>
                        <span className="text-zinc-500 font-mono text-[10px] uppercase">Dobra Hero: Headline e Subheadline</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editSalesPageTitle}
                            onChange={(e) => setEditSalesPageTitle(e.target.value)}
                            className="text-white bg-zinc-850 border border-zinc-700 px-2 py-1 rounded w-full mt-1"
                          />
                        ) : (
                          <p className="text-white font-semibold mt-0.5">{selectedCampaign.salesPage?.title || 'Não especificada'}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <span className="text-zinc-500 font-mono text-[10px] uppercase">Seção: Agitação do Problema</span>
                          {isEditing ? (
                            <textarea
                              value={editSalesPageProblem}
                              onChange={(e) => setEditSalesPageProblem(e.target.value)}
                              className="text-zinc-300 bg-zinc-850 border border-zinc-700 px-2 py-1 rounded w-full mt-1 h-20 resize-none"
                            />
                          ) : (
                            <p className="text-zinc-300 mt-0.5 leading-relaxed line-clamp-4">{selectedCampaign.salesPage?.problem || 'Não especificada'}</p>
                          )}
                        </div>

                        <div>
                          <span className="text-zinc-500 font-mono text-[10px] uppercase">Seção: Apresentação da Solução</span>
                          {isEditing ? (
                            <textarea
                              value={editSalesPageSolution}
                              onChange={(e) => setEditSalesPageSolution(e.target.value)}
                              className="text-zinc-300 bg-zinc-850 border border-zinc-700 px-2 py-1 rounded w-full mt-1 h-20 resize-none"
                            />
                          ) : (
                            <p className="text-zinc-300 mt-0.5 leading-relaxed line-clamp-4">{selectedCampaign.salesPage?.solution || 'Não especificada'}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <span className="text-zinc-500 font-mono text-[10px] uppercase">Seção: A Oferta & Bônus</span>
                          {isEditing ? (
                            <textarea
                              value={editSalesPageOffer}
                              onChange={(e) => setEditSalesPageOffer(e.target.value)}
                              className="text-zinc-300 bg-zinc-850 border border-zinc-700 px-2 py-1 rounded w-full mt-1 h-20 resize-none"
                            />
                          ) : (
                            <p className="text-zinc-300 mt-0.5 leading-relaxed line-clamp-4">{selectedCampaign.salesPage?.offer || 'Não especificada'}</p>
                          )}
                        </div>

                        <div>
                          <span className="text-zinc-500 font-mono text-[10px] uppercase">Prova Social Recomendada</span>
                          <p className="text-zinc-300 mt-0.5 leading-relaxed line-clamp-4 italic">
                            "{selectedCampaign.salesPage?.proof || 'Simulação de prova social de nicho.'}"
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-800/60 pt-3">
                        <div>
                          <span className="text-zinc-500 font-mono text-[10px] uppercase">Garantia (Inversão de Risco)</span>
                          <p className="text-emerald-400 font-medium mt-0.5">
                            {selectedCampaign.salesPage?.guarantee || '7 dias de garantia incondicional.'}
                          </p>
                        </div>

                        <div>
                          <span className="text-zinc-500 font-mono text-[10px] uppercase">CTA Botão de Compra</span>
                          <p className="text-emerald-300 font-semibold mt-0.5">
                            {selectedCampaign.salesPage?.cta || 'Quero Garantir Minha Vaga Agora!'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Redes Sociais */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-emerald-400" />
                      4. Atração Orgânica: Redes Sociais e Vídeos
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-900/40 p-4 border border-zinc-800 rounded-xl text-xs">
                      {/* Posts Criativos */}
                      <div className="space-y-3.5">
                        <span className="text-zinc-500 font-mono text-[10px] uppercase block">Criativos & Legendas Completas</span>
                        
                        {(selectedCampaign.socialMedia?.posts || []).map((post, idx) => (
                          <div key={idx} className="bg-zinc-950 border border-zinc-900 rounded-lg p-3.5 space-y-1.5">
                            <h5 className="font-bold text-white flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] rounded font-mono">POST {idx+1}</span>
                              {post.title}
                            </h5>
                            <p className="text-zinc-400 text-xs italic">Arte sugerida: {post.ideas}</p>
                            <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap pt-1">{post.caption}</p>
                          </div>
                        ))}
                      </div>

                      {/* Calendário e Vídeos */}
                      <div className="space-y-4 border-t md:border-t-0 md:border-l border-zinc-800 md:pl-4">
                        <div>
                          <span className="text-zinc-500 font-mono text-[10px] uppercase block mb-2">Calendário Editorial de Canais</span>
                          <div className="space-y-2">
                            {(selectedCampaign.socialMedia?.calendar || []).map((cal, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-zinc-950 border border-zinc-900 px-3 py-2 rounded">
                                <div className="space-y-0.5">
                                  <span className="font-bold text-white block">{cal.topic}</span>
                                  <span className="text-[10px] text-zinc-500">{cal.channel}</span>
                                </div>
                                <span className="px-1.5 py-0.5 bg-zinc-850 text-zinc-400 text-[10px] font-mono rounded shrink-0">
                                  {cal.day}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="text-zinc-500 font-mono text-[10px] uppercase block mb-1.5">Roteiros e Ganchos de Vídeo Curto (TikTok / Reels)</span>
                          <div className="space-y-2">
                            {(selectedCampaign.socialMedia?.videoIdeas || []).map((idea, idx) => (
                              <div key={idx} className="flex items-start gap-2 bg-zinc-950/60 border border-zinc-900/60 p-2.5 rounded text-zinc-300">
                                <Play className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{idea}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tráfego Pago / Ads */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      5. Estratégia de Tráfego Pago (Meta & Google Ads)
                    </h4>

                    <div className="space-y-3.5 bg-zinc-900/40 p-4 border border-zinc-800 rounded-xl text-xs">
                      <div>
                        <span className="text-zinc-500 font-mono text-[10px] uppercase">Estratégia Geral de Funil de Anúncios</span>
                        <p className="text-zinc-300 mt-1 leading-relaxed">{selectedCampaign.campaignAds?.adStrategy}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <span className="text-zinc-500 font-mono text-[10px] uppercase">Segmentações de Públicos</span>
                          <div className="space-y-1 mt-1">
                            {(selectedCampaign.campaignAds?.targetAudiences || []).map((aud, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-zinc-300">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0" />
                                <span>{aud}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="text-zinc-500 font-mono text-[10px] uppercase">Criativos Necessários para Produção</span>
                          <div className="space-y-1 mt-1">
                            {(selectedCampaign.campaignAds?.requiredCreatives || []).map((creative, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-zinc-300">
                                <ArrowRight className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span>{creative}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-zinc-800/60 pt-3">
                        <span className="text-zinc-500 font-mono text-[10px] uppercase">Roteiro para Teste A/B de Validação</span>
                        <p className="text-zinc-300 mt-1 leading-relaxed italic">"{selectedCampaign.campaignAds?.abTests}"</p>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col justify-center items-center border border-zinc-800 bg-zinc-900/30 rounded-xl p-8 text-center">
                <Compass className="w-12 h-12 text-zinc-700 mb-3 animate-pulse" />
                <h3 className="text-white font-bold">Nenhuma estratégia de marketing selecionada</h3>
                <p className="text-zinc-500 text-xs mt-1">Selecione um plano de marketing na barra lateral ou gere um novo a partir da aba "Produtos Prontos".</p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
