import React, { useState, useEffect } from 'react';
import { DigitalProduct, GeneratedContent, DesignProject } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Palette, 
  Eye, 
  RefreshCw, 
  Edit3, 
  Save, 
  Award, 
  FileText, 
  CheckCircle, 
  Plus, 
  Image as ImageIcon, 
  Layout as LayoutIcon, 
  Compass, 
  Sliders, 
  ExternalLink,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  SlidersHorizontal,
  ThumbsUp,
  PenTool,
  BookOpen
} from 'lucide-react';

interface DesignStudioPanelProps {
  jwtToken: string | null;
  onRefreshState?: () => void;
}

export const DesignStudioPanel: React.FC<DesignStudioPanelProps> = ({ jwtToken, onRefreshState }) => {
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [contents, setContents] = useState<GeneratedContent[]>([]);
  const [projects, setProjects] = useState<DesignProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatingForProductId, setGeneratingForProductId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<DesignProject | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'products' | 'projects'>('products');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit fields
  const [editTitle, setEditTitle] = useState('');
  const [editVisualIdentity, setEditVisualIdentity] = useState('');
  const [editStyleChoice, setEditStyleChoice] = useState('');
  const [editImageBriefing, setEditImageBriefing] = useState('');
  const [editCoverLayout, setEditCoverLayout] = useState('');

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

      // 2. Carrega conteúdos produzidos pelo Writer Agent
      const contentRes = await fetch('/api/writer/content');
      if (contentRes.ok) {
        const contentData = await contentRes.json();
        setContents(contentData.contents || []);
      }

      // 3. Carrega projetos de design
      const projRes = await fetch('/api/designer/projects');
      if (projRes.ok) {
        const projData = await projRes.json();
        setProjects(projData.projects || []);
      }
    } catch (err: any) {
      console.error(err);
      setError('Erro ao carregar dados do Estúdio de Design.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDesign = async (productId: string) => {
    setGeneratingForProductId(productId);
    setError(null);
    setSuccessMsg(null);

    try {
      // Procura se tem algum conteúdo literário associado
      const associatedContent = contents.find(c => c.productId === productId);

      const res = await fetch('/api/designer/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken ? `Bearer ${jwtToken}` : ''
        },
        body: JSON.stringify({ 
          productId, 
          contentId: associatedContent?.id || undefined 
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Falha ao acionar Designer Agent.');
      }

      const data = await res.json();
      setSuccessMsg(`Sucesso! Projeto de Design "${data.project.title}" foi criado com nota estética de ${data.project.qualityScore}/10.`);
      
      setSelectedProject(data.project);
      setIsEditing(false);
      setActiveSubTab('projects');

      await fetchData();
      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao acionar o Designer Agent.');
    } finally {
      setGeneratingForProductId(null);
    }
  };

  const handleSelectProject = (project: DesignProject) => {
    setSelectedProject(project);
    setIsEditing(false);
    
    // Configura campos de edição
    setEditTitle(project.title);
    setEditVisualIdentity(project.visualIdentity);
    setEditStyleChoice(project.styleChoice);
    setEditImageBriefing(project.imageBriefing);
    setEditCoverLayout(project.coverLayout);
  };

  const handleSaveProject = async () => {
    if (!selectedProject) return;
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/designer/projects/${selectedProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken ? `Bearer ${jwtToken}` : ''
        },
        body: JSON.stringify({
          title: editTitle,
          visualIdentity: editVisualIdentity,
          styleChoice: editStyleChoice,
          imageBriefing: editImageBriefing,
          coverLayout: editCoverLayout
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Falha ao salvar alterações.');
      }

      const data = await res.json();
      setSuccessMsg('Projeto visual atualizado com sucesso!');
      setSelectedProject(data.project);
      setIsEditing(false);

      await fetchData();
      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao salvar projeto visual.');
    }
  };

  const handleAestheticReview = async () => {
    if (!selectedProject) return;
    setIsReviewing(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/designer/projects/${selectedProject.id}/review`, {
        method: 'POST',
        headers: {
          'Authorization': jwtToken ? `Bearer ${jwtToken}` : ''
        }
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Falha ao rodar avaliação estética.');
      }

      const data = await res.json();
      setSuccessMsg(`Reavaliação Concluída! Nova nota de qualidade visual: ${data.project.qualityScore}/10.`);
      setSelectedProject(data.project);

      await fetchData();
      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao processar auditoria estética.');
    } finally {
      setIsReviewing(false);
    }
  };

  const handleApproveProject = async () => {
    if (!selectedProject) return;
    setIsApproving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/designer/projects/${selectedProject.id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': jwtToken ? `Bearer ${jwtToken}` : ''
        }
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Falha ao aprovar material visual.');
      }

      const data = await res.json();
      setSuccessMsg('Sucesso! Identidade visual e materiais de design foram homologados.');
      setSelectedProject(data.project);

      await fetchData();
      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao aprovar projeto.');
    } finally {
      setIsApproving(false);
    }
  };

  // Helper para extrair paleta de cores se houver códigos hexadecimais (ex: #FF5500)
  const extractHexColors = (text: string): string[] => {
    const hexRegex = /#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\b/g;
    const matches = text.match(hexRegex) || [];
    return Array.from(new Set(matches)).slice(0, 5); // limite de 5 cores distintas
  };

  return (
    <div className="space-y-6" id="design-studio-panel">
      {/* Header do Estúdio */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg animate-pulse">
              <Palette size={24} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Estúdio de Design</h2>
              <p className="text-xs text-slate-400">Transforme produtos e conteúdos textuais em identidades visuais e capas de alto impacto de vendas.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            onClick={() => { setActiveSubTab('products'); setSelectedProject(null); }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'products'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <BookOpen size={13} className="inline mr-1" /> Esteira Literária (Writer)
          </button>
          <button
            onClick={() => { setActiveSubTab('projects'); }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all relative ${
              activeSubTab === 'projects'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ImageIcon size={13} className="inline mr-1" /> Projetos Visuais
            {projects.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] h-4 w-4 rounded-full flex items-center justify-center font-bold">
                {projects.length}
              </span>
            )}
          </button>
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            title="Recarregar dados"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="p-4 bg-red-900/40 border border-red-800/80 rounded-lg flex items-center gap-3 text-red-200 text-xs">
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-900/40 border border-emerald-800/80 rounded-lg flex items-center gap-3 text-emerald-200 text-xs">
          <CheckCircle size={16} className="text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Esquerda: Lista de Seleção (Dependendo da Sub-aba ativa) */}
        <div className="lg:col-span-4 space-y-4">
          
          {activeSubTab === 'products' ? (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest">Pipeline do Writer Agent</h3>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded-full font-bold">LIVRO PRONTO</span>
              </div>
              
              <p className="text-[11px] text-slate-400">
                Selecione um infoproduto que já possui conteúdo gerado pelo **Writer Agent** para iniciar o design visual e briefing promocional do **Designer Agent**.
              </p>

              {products.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">Nenhum produto cadastrado no sistema.</div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {products.map(prod => {
                    const hasContent = contents.some(c => c.productId === prod.id);
                    const hasProject = projects.some(p => p.productId === prod.id);
                    
                    return (
                      <div 
                        key={prod.id}
                        className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-lg flex flex-col justify-between gap-3 hover:border-slate-700 transition-colors"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="text-xs font-bold text-slate-200 truncate max-w-[180px]">{prod.name}</h4>
                            <span className="text-[9px] font-medium bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                              {prod.niche}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-2">{prod.description}</p>
                          
                          {/* Indicadores de fluxo */}
                          <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-2 border-t border-slate-800/60">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1 ${
                              hasContent ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'
                            }`}>
                              <PenTool size={9} /> Content: {hasContent ? 'Gerado' : 'Pendente'}
                            </span>
                            {hasProject && (
                              <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                                <Palette size={9} /> Design: Pronto
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleCreateDesign(prod.id)}
                          disabled={generatingForProductId === prod.id}
                          className="w-full bg-indigo-600/80 hover:bg-indigo-600 text-white text-[11px] font-bold py-1.5 px-3 rounded flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                          {generatingForProductId === prod.id ? (
                            <>
                              <RefreshCw size={11} className="animate-spin" /> Direcionando Arte...
                            </>
                          ) : (
                            <>
                              <Sparkles size={11} className="text-yellow-400 animate-pulse" /> Criar Briefing Visual
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
              <h3 className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest border-b border-slate-800 pb-2">Projetos de Design</h3>
              
              {projects.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">Nenhum projeto visual criado ainda. Use a aba ao lado para gerar briefings de produtos ativos.</div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {projects.map(proj => (
                    <button
                      key={proj.id}
                      onClick={() => handleSelectProject(proj)}
                      className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex flex-col gap-1.5 ${
                        selectedProject?.id === proj.id
                          ? 'bg-indigo-600/20 border-indigo-600'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-extrabold text-slate-200 truncate max-w-[150px]">{proj.title}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                          proj.status === 'approved' 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {proj.status === 'approved' ? 'Aprovado' : 'Rascunho'}
                        </span>
                      </div>
                      
                      <div className="text-[10px] text-slate-400">
                        Produto: <span className="text-slate-300 font-medium">{proj.productName}</span>
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-1 pt-1.5 border-t border-slate-800/40 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 text-slate-300">
                          <SlidersHorizontal size={10} className="text-indigo-400" /> Nota: <strong>{proj.qualityScore || '8.4'}/10</strong>
                        </span>
                        <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                          {proj.styleChoice}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Direita: Detalhamento do Projeto Visual selecionado */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {selectedProject ? (
              <motion.div
                key={selectedProject.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl"
              >
                {/* Header do Projeto */}
                <div className="p-6 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-extrabold tracking-wider bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full mb-2 inline-block">
                      Direção de Arte / Projeto Visual
                    </span>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {selectedProject.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Vinculado ao produto: <span className="text-slate-200 font-medium">{selectedProject.productName}</span> (Versão {selectedProject.version})
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {selectedProject.status !== 'approved' && (
                      <button
                        onClick={handleApproveProject}
                        disabled={isApproving}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        {isApproving ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                        Homologar Arte
                      </button>
                    )}
                    
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      {isEditing ? <Eye size={12} /> : <Edit3 size={12} />}
                      {isEditing ? 'Visualizar' : 'Editar Briefing'}
                    </button>
                  </div>
                </div>

                {/* Painel Central */}
                <div className="p-6 space-y-6">
                  
                  {/* Visualização de Notas e Auditoria de Design */}
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                    <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-lg text-center relative overflow-hidden">
                      <div className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">A estética</div>
                      <div className="text-lg font-black text-indigo-400 mt-1">{selectedProject.aestheticScore || 8}/10</div>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500" style={{ width: `${(selectedProject.aestheticScore || 8)*10}%` }}></div>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-lg text-center relative overflow-hidden">
                      <div className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Clareza</div>
                      <div className="text-lg font-black text-indigo-400 mt-1">{selectedProject.clarityScore || 9}/10</div>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500" style={{ width: `${(selectedProject.clarityScore || 9)*10}%` }}></div>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-lg text-center relative overflow-hidden">
                      <div className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Público</div>
                      <div className="text-lg font-black text-indigo-400 mt-1">{selectedProject.audienceFitScore || 8}/10</div>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500" style={{ width: `${(selectedProject.audienceFitScore || 8)*10}%` }}></div>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-lg text-center relative overflow-hidden">
                      <div className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Comercial</div>
                      <div className="text-lg font-black text-indigo-400 mt-1">{selectedProject.commercialAppealScore || 9}/10</div>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500" style={{ width: `${(selectedProject.commercialAppealScore || 9)*10}%` }}></div>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-lg text-center relative overflow-hidden">
                      <div className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Diferença</div>
                      <div className="text-lg font-black text-indigo-400 mt-1">{selectedProject.differentiationScore || 8}/10</div>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500" style={{ width: `${(selectedProject.differentiationScore || 8)*10}%` }}></div>
                    </div>
                    <div className="bg-slate-900 border border-indigo-500/40 p-3 rounded-lg text-center relative overflow-hidden flex flex-col justify-center">
                      <div className="text-[9px] text-slate-300 uppercase font-extrabold tracking-wider">Nota Geral</div>
                      <div className="text-xl font-extrabold text-white mt-0.5">{selectedProject.qualityScore || 8.4}/10</div>
                    </div>
                  </div>

                  {/* Feedback Estético */}
                  {selectedProject.feedback && (
                    <div className="p-4 bg-slate-900 border border-indigo-500/10 rounded-lg space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-400">
                        <Award size={14} /> PARECER DO DIRETOR DE ARTE / SUPERVISOR VISUAL
                      </div>
                      <p className="text-xs text-slate-300 italic leading-relaxed">"{selectedProject.feedback}"</p>
                      
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={handleAestheticReview}
                          disabled={isReviewing}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-bold"
                        >
                          <RefreshCw size={10} className={isReviewing ? 'animate-spin' : ''} />
                          Reavaliar Esteticamente
                        </button>
                      </div>
                    </div>
                  )}

                  {isEditing ? (
                    /* ABA DE EDIÇÃO DO BRIEFING */
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">Título do Projeto Visual</label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg p-2.5 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">Estilo Estético Escolhido</label>
                          <input
                            type="text"
                            value={editStyleChoice}
                            onChange={(e) => setEditStyleChoice(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg p-2.5 focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">Identidade Visual & Cores</label>
                          <textarea
                            rows={3}
                            value={editVisualIdentity}
                            onChange={(e) => setEditVisualIdentity(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg p-2.5 focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">Briefing e Prompts de Imagem</label>
                        <textarea
                          rows={4}
                          value={editImageBriefing}
                          onChange={(e) => setEditImageBriefing(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg p-2.5 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">Diagramação e Layout da Capa</label>
                        <textarea
                          rows={4}
                          value={editCoverLayout}
                          onChange={(e) => setEditCoverLayout(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg p-2.5 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-800/60">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2 rounded-lg"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleSaveProject}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5"
                        >
                          <Save size={13} /> Salvar Projeto
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ABA DE VISUALIZAÇÃO GERAL DO CONCEITO */
                    <div className="space-y-6">
                      
                      {/* Grid de Informações de Identidade */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Identidade Visual & Vibe */}
                        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
                          <h4 className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Sliders size={14} /> Estilo & Vibe Estética
                          </h4>
                          <div>
                            <span className="bg-indigo-500/10 text-indigo-400 font-extrabold text-xs px-2.5 py-1 rounded-full border border-indigo-500/20">
                              {selectedProject.styleChoice}
                            </span>
                          </div>

                          <div className="space-y-2 pt-2">
                            <h5 className="text-[11px] font-extrabold text-slate-300 uppercase">Psicologia de Cores & Conceito:</h5>
                            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{selectedProject.visualIdentity}</p>
                          </div>

                          {/* Extrai e renderiza círculos de cores se houver */}
                          {extractHexColors(selectedProject.visualIdentity).length > 0 && (
                            <div className="pt-2 border-t border-slate-800/60">
                              <h5 className="text-[11px] font-extrabold text-slate-400 uppercase mb-2">Paleta Sugerida:</h5>
                              <div className="flex items-center gap-2">
                                {extractHexColors(selectedProject.visualIdentity).map((hex, idx) => (
                                  <div key={idx} className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                                    <span 
                                      className="h-5 w-5 rounded-md inline-block shadow-inner" 
                                      style={{ backgroundColor: hex }}
                                    ></span>
                                    <span className="text-[10px] font-mono text-slate-300 uppercase">{hex}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Briefing de Capa */}
                        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-3">
                          <h4 className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                            <LayoutIcon size={14} /> Layout de Capa & Miolo
                          </h4>
                          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{selectedProject.coverLayout}</p>
                        </div>

                      </div>

                      {/* Briefing de Prompts / Imagens */}
                      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-3">
                        <h4 className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Compass size={14} /> Prompts de Imagem (Midjourney / Imagen / DALL-E)
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950 p-4 rounded-lg border border-slate-900 font-sans">{selectedProject.imageBriefing}</p>
                      </div>

                      {/* Ativos de Marketing e Mockups */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                          <ImageIcon size={14} /> Ativos Promocionais e Conceitos de Mockup
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                          {selectedProject.generatedAssets?.map((asset: any, idx: number) => (
                            <div 
                              key={idx}
                              className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col group hover:border-indigo-600/50 transition-colors"
                            >
                              {asset.imageUrl ? (
                                <div className="h-44 bg-slate-950 relative overflow-hidden">
                                  <img 
                                    src={asset.imageUrl} 
                                    alt={asset.title}
                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-sm text-[8px] font-extrabold px-1.5 py-0.5 rounded text-indigo-400 uppercase border border-indigo-500/20">
                                    {asset.type?.replace('_', ' ') || 'creative'}
                                  </div>
                                </div>
                              ) : (
                                <div className="h-44 bg-indigo-950/20 flex flex-col items-center justify-center p-4 text-center border-b border-slate-800">
                                  <ImageIcon size={24} className="text-indigo-400 mb-1" />
                                  <span className="text-[10px] font-bold text-slate-300">{asset.title}</span>
                                </div>
                              )}

                              <div className="p-3 flex-1 flex flex-col justify-between space-y-1">
                                <h5 className="text-[11px] font-extrabold text-slate-200 line-clamp-1">{asset.title || asset.type}</h5>
                                <p className="text-[10px] text-slate-400 leading-tight line-clamp-2">{asset.description}</p>
                                
                                {asset.suggestedPrompt && (
                                  <div className="mt-2 pt-2 border-t border-slate-800/60">
                                    <div className="text-[9px] font-mono text-slate-500 bg-slate-950 p-1 rounded truncate" title={asset.suggestedPrompt}>
                                      Prompt: {asset.suggestedPrompt}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              </motion.div>
            ) : (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
                <Palette size={40} className="text-indigo-500/40 animate-bounce" />
                <div>
                  <h3 className="text-sm font-bold text-slate-300">Nenhum Projeto Selecionado</h3>
                  <p className="text-xs text-slate-500 mt-1">Escolha ou gere um novo briefing de design visual a partir do pipeline do Writer Agent ao lado.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
