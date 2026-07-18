import React, { useState, useEffect } from 'react';
import { DigitalProduct, GeneratedContent } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  BookOpen, 
  FileText, 
  CheckCircle, 
  RefreshCw, 
  Edit3, 
  Save, 
  Award, 
  PenTool, 
  CheckSquare, 
  History, 
  ChevronRight, 
  AlertTriangle, 
  FileCheck, 
  Gauge, 
  Send 
} from 'lucide-react';

interface ContentStudioPanelProps {
  jwtToken: string | null;
  onRefreshState?: () => void;
}

export const ContentStudioPanel: React.FC<ContentStudioPanelProps> = ({ jwtToken, onRefreshState }) => {
  const [approvedProducts, setApprovedProducts] = useState<DigitalProduct[]>([]);
  const [contents, setContents] = useState<GeneratedContent[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingContents, setIsLoadingContents] = useState(false);
  const [generatingForProductId, setGeneratingForProductId] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'approved_products' | 'contents'>('approved_products');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit fields
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editOutline, setEditOutline] = useState('');
  const [editType, setEditType] = useState('ebook');

  // Revision / Review fields
  const [revisionInstructions, setRevisionInstructions] = useState('');
  const [isImproving, setIsImproving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const fetchData = async () => {
    setIsLoadingProducts(true);
    setIsLoadingContents(true);
    setError(null);

    try {
      // 1. Produtos com conceito aprovado para produção (approved_production)
      const prodRes = await fetch('/api/products');
      if (prodRes.ok) {
        const data = await prodRes.json();
        const approved = (data.products || []).filter(
          (p: DigitalProduct) => p.productionStatus === 'approved_production'
        );
        setApprovedProducts(approved);
      }

      // 2. Conteúdos gerados pelo Writer Agent
      const contentRes = await fetch('/api/writer/content');
      if (contentRes.ok) {
        const data = await contentRes.json();
        setContents(data.contents || []);
      }
    } catch (err: any) {
      console.error(err);
      setError('Erro ao carregar dados do Estúdio de Conteúdo.');
    } finally {
      setIsLoadingProducts(false);
      setIsLoadingContents(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateContent = async (productId: string, contentType: string = 'ebook') => {
    setGeneratingForProductId(productId);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/writer/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken ? `Bearer ${jwtToken}` : ''
        },
        body: JSON.stringify({ productId, contentType })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Falha ao acionar Writer Agent para produzir conteúdo.');
      }

      const data = await res.json();
      setSuccessMsg(`Sucesso! O conteúdo "${data.content.title}" foi gerado pelo Writer Agent com nota de qualidade ${data.content.qualityScore}/10.`);
      
      setSelectedContent(data.content);
      setIsEditing(false);
      setActiveSubTab('contents');

      await fetchData();
      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao acionar o Writer Agent.');
    } finally {
      setGeneratingForProductId(null);
    }
  };

  const handleSelectContent = (content: GeneratedContent) => {
    setSelectedContent(content);
    setIsEditing(false);
    
    // Seta campos de edição
    setEditTitle(content.title);
    setEditBody(content.body);
    setEditOutline(content.outline || '');
    setEditType(content.contentType);
    setRevisionInstructions('');
  };

  const handleSaveContent = async () => {
    if (!selectedContent) return;
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/writer/content/${selectedContent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken ? `Bearer ${jwtToken}` : ''
        },
        body: JSON.stringify({
          title: editTitle,
          body: editBody,
          outline: editOutline,
          contentType: editType
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Falha ao salvar edições do conteúdo.');
      }

      const data = await res.json();
      setSuccessMsg('O conteúdo literário foi editado e atualizado com sucesso no repositório.');
      setSelectedContent(data.content);
      setIsEditing(false);

      await fetchData();
      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao salvar alterações.');
    }
  };

  const handleImproveContent = async () => {
    if (!selectedContent || !revisionInstructions.trim()) return;
    setIsImproving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/writer/content/${selectedContent.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken ? `Bearer ${jwtToken}` : ''
        },
        body: JSON.stringify({ instructions: revisionInstructions })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Falha ao aprimorar conteúdo.');
      }

      const data = await res.json();
      setSuccessMsg(`O conteúdo foi aprimorado para a versão ${data.content.version} com nova nota de qualidade: ${data.content.qualityScore}/10.`);
      setSelectedContent(data.content);
      setRevisionInstructions('');

      await fetchData();
      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao solicitar melhoria ao Writer Agent.');
    } finally {
      setIsImproving(false);
    }
  };

  const handleApproveContent = async () => {
    if (!selectedContent) return;
    setIsApproving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/writer/content/${selectedContent.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken ? `Bearer ${jwtToken}` : ''
        }
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Falha ao homologar o conteúdo.');
      }

      const data = await res.json();
      setSuccessMsg(`O conteúdo literário de "${data.content.title}" foi homologado e aprovado com sucesso!`);
      setSelectedContent(data.content);

      await fetchData();
      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao homologar o conteúdo.');
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="space-y-6" id="writer-content-studio">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight flex items-center gap-2">
            <PenTool className="h-5 w-5 text-indigo-600" />
            Estúdio de Conteúdo Literário
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Produza, revise, avalie e homologue materiais educacionais e textos de alto impacto.
          </p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveSubTab('approved_products')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeSubTab === 'approved_products'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Aprovados para Produção ({approvedProducts.length})
          </button>
          <button
            onClick={() => setActiveSubTab('contents')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeSubTab === 'contents'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Biblioteca Literária ({contents.length})
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-xs flex items-start gap-3 animate-fade-in">
          <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
          <div>{successMsg}</div>
        </div>
      )}

      {activeSubTab === 'approved_products' && (
        <div className="space-y-4">
          {isLoadingProducts ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="h-6 w-6 text-indigo-600 animate-spin" />
            </div>
          ) : approvedProducts.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
              <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium text-sm">Nenhum produto homologado para escrita.</p>
              <p className="text-gray-400 text-xs mt-1 max-w-md mx-auto">
                Aprove ou homologue um conceito de infoproduto no Laboratório de Produtos para habilitá-lo na esteira do Writer Agent.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedProducts.map((p) => {
                const hasDraft = contents.some((c) => c.productId === p.id);
                return (
                  <div key={p.id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-[10px] font-semibold border border-green-100">
                          Homologado para Produção
                        </span>
                        {hasDraft && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-semibold border border-blue-100">
                            Conteúdo Iniciado
                          </span>
                        )}
                      </div>

                      <h3 className="font-semibold text-gray-900 text-sm mt-3 line-clamp-1">{p.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{p.subtitle || 'Sem subtítulo'}</p>
                      
                      <div className="space-y-2 mt-4 pt-4 border-t border-gray-50">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-gray-400">Persona:</span>
                          <span className="text-gray-700 font-medium line-clamp-1 max-w-[150px]">{p.persona || 'Indefinida'}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-gray-400">Formato:</span>
                          <span className="text-indigo-600 font-semibold">{p.format || 'Digital'}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-gray-400">Capítulos:</span>
                          <span className="text-gray-700 font-medium">{(p.modules || p.chapters || []).length} capítulos</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-50 flex gap-2">
                      <button
                        onClick={() => handleCreateContent(p.id, 'ebook')}
                        disabled={generatingForProductId === p.id}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {generatingForProductId === p.id ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            Redigindo E-book...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5" />
                            Produzir Conteúdo
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'contents' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* List Section */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Documentos Literários</h3>
            {isLoadingContents ? (
              <div className="flex justify-center items-center py-12">
                <RefreshCw className="h-6 w-6 text-indigo-600 animate-spin" />
              </div>
            ) : contents.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-gray-500">
                <FileText className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                <p className="text-xs">Nenhum documento gerado ainda.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {contents.map((c) => {
                  const isSelected = selectedContent?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleSelectContent(c)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                          : 'border-gray-100 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          c.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : c.status === 'reviewed'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {c.status.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">v{c.version}</span>
                      </div>

                      <h4 className="font-semibold text-gray-900 text-xs mt-2 line-clamp-1">{c.title}</h4>
                      <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">Produto: {c.productName}</p>

                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                        <span className="text-[10px] text-gray-400 font-medium capitalize">{c.contentType}</span>
                        {c.qualityScore && (
                          <div className="flex items-center gap-1">
                            <Gauge className="h-3 w-3 text-indigo-600" />
                            <span className="text-xs font-bold text-indigo-700">{c.qualityScore}/10</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Details & Actions Section */}
          <div className="lg:col-span-8">
            {selectedContent ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-50 gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        ID: {selectedContent.id}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(selectedContent.timestamp).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mt-1">{selectedContent.title}</h3>
                    <p className="text-xs text-indigo-600 font-semibold mt-0.5">Pertence ao Produto: {selectedContent.productName}</p>
                  </div>

                  <div className="flex gap-2">
                    {selectedContent.status !== 'approved' && (
                      <button
                        onClick={handleApproveContent}
                        disabled={isApproving}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isApproving ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <FileCheck className="h-4 w-4" />
                        )}
                        Homologar Conteúdo
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsEditing(!isEditing);
                        setEditTitle(selectedContent.title);
                        setEditBody(selectedContent.body);
                        setEditOutline(selectedContent.outline || '');
                        setEditType(selectedContent.contentType);
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
                    >
                      {isEditing ? 'Cancelar Edição' : 'Editar Conteúdo'}
                    </button>
                  </div>
                </div>

                {/* Quality Metrics */}
                {selectedContent.qualityScore && (
                  <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-indigo-600" />
                      Avaliação Editorial Automática
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                      {[
                        { label: 'Clareza', score: selectedContent.clarityScore },
                        { label: 'Profundidade', score: selectedContent.depthScore },
                        { label: 'Estrutura', score: selectedContent.organizationScore },
                        { label: 'Valor', score: selectedContent.valueDeliveredScore },
                        { label: 'Público', score: selectedContent.audienceFitScore },
                        { label: 'Originalidade', score: selectedContent.originalityScore }
                      ].map((m, i) => (
                        <div key={i} className="bg-white border border-gray-100 rounded-lg p-2.5 text-center">
                          <p className="text-[10px] text-gray-400 font-medium truncate">{m.label}</p>
                          <p className="text-sm font-bold text-gray-800 mt-1">{m.score}/10</p>
                        </div>
                      ))}
                    </div>

                    <div className="text-[11px] text-gray-500 bg-white border border-gray-50 p-3 rounded-lg">
                      <span className="font-bold text-gray-700 block mb-1">Feedback do Revisor:</span>
                      {selectedContent.feedback}
                    </div>
                  </div>
                )}

                {/* Main Content Area */}
                <div className="space-y-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">Título do Material</label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full text-xs border border-gray-200 rounded-xl p-2 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-gray-500 block mb-1">Tipo de Conteúdo</label>
                          <select
                            value={editType}
                            onChange={(e) => setEditType(e.target.value)}
                            className="w-full text-xs border border-gray-200 rounded-xl p-2 focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="ebook">E-book</option>
                            <option value="chapter">Capítulo Avulso</option>
                            <option value="course">Curso Completo</option>
                            <option value="lesson">Aula Estruturada</option>
                            <option value="script">Script de Vídeo</option>
                            <option value="checklist">Checklist Operacional</option>
                            <option value="guide">Guia Prático</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-500 block mb-1">Outline / Sumário</label>
                          <input
                            type="text"
                            value={editOutline}
                            onChange={(e) => setEditOutline(e.target.value)}
                            className="w-full text-xs border border-gray-200 rounded-xl p-2 focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">Corpo de Texto (Markdown)</label>
                        <textarea
                          rows={15}
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value)}
                          className="w-full text-xs border border-gray-200 rounded-xl p-3 font-mono focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <button
                        onClick={handleSaveContent}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-4 rounded-xl transition-all flex items-center gap-1.5"
                      >
                        <Save className="h-4 w-4" />
                        Salvar Alterações
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedContent.outline && (
                        <div className="bg-indigo-50/20 border border-indigo-50 p-3.5 rounded-xl">
                          <span className="text-[10px] font-bold text-indigo-600 block mb-1">Sumário do Documento</span>
                          <p className="text-xs text-gray-600 font-medium leading-relaxed">{selectedContent.outline}</p>
                        </div>
                      )}

                      <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/30 max-h-[400px] overflow-y-auto">
                        <span className="text-[10px] font-bold text-gray-400 block mb-3">Conteúdo Literário Gerado (Visualização)</span>
                        <div className="prose prose-xs max-w-none text-xs text-gray-700 font-sans leading-relaxed whitespace-pre-wrap">
                          {selectedContent.body}
                        </div>
                      </div>

                      {/* Request improvements form */}
                      {selectedContent.status !== 'approved' && (
                        <div className="border-t border-gray-100 pt-5 mt-5">
                          <label className="text-xs font-bold text-gray-700 block mb-1 flex items-center gap-1">
                            <Sparkles className="h-4 w-4 text-indigo-600 animate-pulse" />
                            Refinar com Instruções de Copia / Redação
                          </label>
                          <p className="text-[10px] text-gray-400 mb-2">
                            Peça ao Writer Agent para mudar o tom, enriquecer tópicos, adicionar piadas, ou reformular seções específicas.
                          </p>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={revisionInstructions}
                              onChange={(e) => setRevisionInstructions(e.target.value)}
                              placeholder="Ex: Altere o tom para mais informal, adicione exemplos e simplifique os jargões..."
                              className="flex-1 text-xs border border-gray-200 rounded-xl p-2.5 focus:ring-1 focus:ring-indigo-500"
                            />
                            <button
                              onClick={handleImproveContent}
                              disabled={isImproving || !revisionInstructions.trim()}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
                            >
                              {isImproving ? (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                              Refinar
                            </button>
                          </div>
                        </div>
                      )}

                      {/* History / Revisions tracker */}
                      {selectedContent.revisions && selectedContent.revisions.length > 0 && (
                        <div className="border-t border-gray-100 pt-5">
                          <h4 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1">
                            <History className="h-4 w-4 text-gray-500" />
                            Histórico de Versões ({selectedContent.revisions.length})
                          </h4>

                          <div className="space-y-2.5">
                            {selectedContent.revisions.map((rev, idx) => (
                              <div key={idx} className="bg-gray-50/50 rounded-xl p-3 border border-gray-50 flex justify-between items-center text-left text-[11px]">
                                <div>
                                  <span className="font-bold text-gray-700 font-mono">v{rev.version}</span>
                                  <span className="text-gray-400 mx-2">|</span>
                                  <span className="text-gray-600 font-medium">{rev.changeLog || 'Geração Inicial'}</span>
                                </div>
                                <span className="text-gray-400 font-mono text-[10px]">
                                  {new Date(rev.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center h-full flex flex-col justify-center items-center">
                <BookOpen className="h-10 w-10 text-gray-300 mb-4" />
                <p className="text-gray-600 font-medium text-sm">Selecione um documento literário</p>
                <p className="text-gray-400 text-xs mt-1 max-w-xs">
                  Escolha um conteúdo na barra lateral esquerda para visualizar, auditar notas de qualidade, editar ou aprimorar.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
