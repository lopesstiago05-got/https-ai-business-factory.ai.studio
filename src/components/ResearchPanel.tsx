import React, { useState, useEffect } from 'react';
import { ResearchSearch, ResearchTrend, ResearchNiche, ResearchOpportunity, ResearchReport } from '../types.ts';
import { 
  Search, 
  TrendingUp, 
  Layers, 
  Lightbulb, 
  FileText, 
  ArrowRight, 
  Award, 
  HelpCircle, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Flame,
  ThumbsUp,
  ThumbsDown,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ResearchPanelProps {
  jwtToken: string | null;
  onRefreshState: () => void;
}

export const ResearchPanel: React.FC<ResearchPanelProps> = ({ jwtToken, onRefreshState }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searches, setSearches] = useState<ResearchSearch[]>([]);
  const [trends, setTrends] = useState<ResearchTrend[]>([]);
  const [niches, setNiches] = useState<ResearchNiche[]>([]);
  const [opportunities, setOpportunities] = useState<ResearchOpportunity[]>([]);
  const [reports, setReports] = useState<ResearchReport[]>([]);
  
  // Tab interna para o painel de pesquisa
  const [subTab, setSubTab] = useState<'trends' | 'opportunities' | 'reports'>('trends');
  const [selectedReport, setSelectedReport] = useState<ResearchReport | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Carrega os dados de pesquisa ao montar o componente
  useEffect(() => {
    fetchResearchData();
  }, []);

  const fetchResearchData = async () => {
    try {
      const [resReports, resOpp, resState] = await Promise.all([
        fetch('/api/research/reports'),
        fetch('/api/research/opportunities'),
        fetch('/api/state')
      ]);

      if (resReports.ok) {
        const data = await resReports.json();
        setReports(data.reports || []);
      }
      if (resOpp.ok) {
        const data = await resOpp.json();
        setOpportunities(data.opportunities || []);
      }
      if (resState.ok) {
        const data = await resState.json();
        setSearches(data.researchSearches || []);
        setTrends(data.researchTrends || []);
        setNiches(data.researchNiches || []);
      }
    } catch (err) {
      console.error('Erro ao buscar dados do Research Agent:', err);
    }
  };

  const handleStartResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/research/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({ query: searchQuery })
      });

      if (res.ok) {
        const data = await res.json();
        setStatusMessage({
          type: 'success',
          text: `Pesquisa profunda para "${searchQuery}" concluída com sucesso! ${data.opportunities.length} oportunidades geradas.`
        });
        setSearchQuery('');
        await fetchResearchData();
        onRefreshState(); // Atualiza painel geral
        
        // Foca automaticamente nas oportunidades geradas
        setSubTab('opportunities');
      } else {
        const data = await res.json();
        setStatusMessage({
          type: 'error',
          text: data.error || 'Erro ao realizar pesquisa.'
        });
      }
    } catch (err) {
      console.error('Erro ao conectar com API de pesquisa:', err);
      setStatusMessage({
        type: 'error',
        text: 'Erro de rede ao processar pesquisa profunda.'
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleUpdateOpportunityStatus = async (oppId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/research/opportunities/${oppId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        setStatusMessage({
          type: 'success',
          text: `Oportunidade marcada como ${status === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso.`
        });
        await fetchResearchData();
        onRefreshState();
      } else {
        const data = await res.json();
        setStatusMessage({
          type: 'error',
          text: data.error || 'Erro ao atualizar oportunidade.'
        });
      }
    } catch (err) {
      console.error('Erro ao atualizar oportunidade:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header informacional */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Search size={180} />
        </div>
        <div className="max-w-3xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/15 border border-indigo-500/30 rounded-full text-xs text-indigo-300 font-bold mb-1">
            <Sparkles size={12} className="animate-pulse text-indigo-400" /> Centro de Inteligência de Mercado
          </div>
          <h2 className="text-xl font-black tracking-tight">Centro de Pesquisa (Research Center)</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Comande o **Research Agent** para escanear nichos promissores, identificar demandas reais do público e calcular a viabilidade financeira e mercadológica de novos produtos digitais de alta conversão.
          </p>
        </div>
      </div>

      {/* Formulário de Busca Profunda */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-sm tracking-tight mb-3">Iniciar Escaneamento de Mercado</h3>
        <form onSubmit={handleStartResearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Digite um tema, nicho ou palavra-chave (ex: Produtividade para Desenvolvedores, Investimentos para Jovens, IA para Copywriters)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isSearching}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="px-6 py-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 transition-all flex items-center gap-2"
          >
            {isSearching ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Analisando...
              </>
            ) : (
              <>
                Analisar Nicho <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Mensagem de Feedback de Operações */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className={`mt-4 p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-150'
                  : 'bg-rose-50 text-rose-800 border-rose-150'
              }`}
            >
              {statusMessage.type === 'success' ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
              <span>{statusMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navegação interna do Painel */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 pb-px gap-2">
        <button
          onClick={() => { setSubTab('trends'); setSelectedReport(null); }}
          className={`px-4 py-2 border-b-2 text-xs font-bold transition-all flex items-center gap-2 ${
            subTab === 'trends' && !selectedReport
              ? 'border-indigo-600 text-indigo-600 dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <TrendingUp size={14} /> Tendências & Nichos Mapeados
        </button>
        <button
          onClick={() => { setSubTab('opportunities'); setSelectedReport(null); }}
          className={`px-4 py-2 border-b-2 text-xs font-bold transition-all flex items-center gap-2 ${
            subTab === 'opportunities' && !selectedReport
              ? 'border-indigo-600 text-indigo-600 dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Lightbulb size={14} /> Oportunidades Mapeadas ({opportunities.length})
        </button>
        <button
          onClick={() => { setSubTab('reports'); }}
          className={`px-4 py-2 border-b-2 text-xs font-bold transition-all flex items-center gap-2 ${
            subTab === 'reports' || selectedReport
              ? 'border-indigo-600 text-indigo-600 dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <FileText size={14} /> Relatórios de Nicho ({reports.length})
        </button>
      </div>

      {/* Conteúdo das Abas Internas */}
      <div className="min-h-[300px]">
        {/* ABA: TENDÊNCIAS & NICHOS */}
        {subTab === 'trends' && !selectedReport && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lado Esquerdo: Principais Temas/Tendências */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-3">
                <h4 className="font-bold text-xs uppercase text-slate-400 flex items-center gap-1.5">
                  <TrendingUp size={13} className="text-indigo-500" /> Tendências Emergentes
                </h4>
                <span className="text-[10px] text-slate-400">Tempo real</span>
              </div>

              {trends.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <Flame className="mx-auto text-slate-300" size={32} />
                  <p className="text-xs text-slate-400">Nenhuma tendência mapeada ainda. Inicie um escaneamento acima!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-900 max-h-[400px] overflow-y-auto pr-1">
                  {trends.map((t) => (
                    <div key={t.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <h5 className="font-bold text-xs dark:text-white">{t.topic}</h5>
                        <p className="text-[10px] text-slate-400">Nicho: {t.niche} | Fonte: {t.source}</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
                          {t.growthRate}
                        </span>
                        <p className="text-[9px] text-slate-400">{t.volume}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lado Direito: Nichos / Sub-Nichos Detalhados */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-3">
                <h4 className="font-bold text-xs uppercase text-slate-400 flex items-center gap-1.5">
                  <Layers size={13} className="text-indigo-500" /> Segmentos de Nicho Mapeados
                </h4>
                <span className="text-[10px] text-slate-400">Qualificação heurística</span>
              </div>

              {niches.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <Layers className="mx-auto text-slate-300" size={32} />
                  <p className="text-xs text-slate-400">Nenhum segmento mapeado ainda. Inicie um escaneamento acima!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {niches.map((n) => (
                    <div key={n.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/40 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h5 className="font-bold text-xs dark:text-white">{n.name}</h5>
                          <p className="text-[10px] text-slate-500 leading-relaxed">{n.description}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          n.competitiveness === 'low' 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20' 
                            : n.competitiveness === 'medium'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20'
                        }`}>
                          Comp: {n.competitiveness === 'low' ? 'Baixa' : n.competitiveness === 'medium' ? 'Média' : 'Alta'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100/50 dark:border-slate-800/40">
                        <span>Audiência: <strong>{n.audienceSize}</strong></span>
                        <span>Monetização: <strong className="text-indigo-600 dark:text-indigo-400">{n.monetizationScore}/10</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ABA: OPORTUNIDADES MAPEADAS */}
        {subTab === 'opportunities' && !selectedReport && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase text-slate-400">Oportunidades de Infoproduto por Score de Viabilidade</h4>
              <p className="text-[11px] text-slate-400">Calculado dinamicamente com base em demanda, barreira de entrada e facilidade.</p>
            </div>

            {opportunities.length === 0 ? (
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-2">
                <Lightbulb className="mx-auto text-slate-300" size={40} />
                <h5 className="font-bold text-sm dark:text-white">Nenhuma oportunidade identificada</h5>
                <p className="text-xs text-slate-400 max-w-md mx-auto">Digite um tema ou termo de interesse na caixa de busca acima para que o Research Agent crie propostas viáveis.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {opportunities.map((o) => (
                  <div key={o.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      {/* Badge e Score */}
                      <div className="flex items-start justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400">
                          {o.niche}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400">Score de Viabilidade:</span>
                          <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-slate-900 text-white dark:bg-slate-800">
                            {o.finalScore}
                          </span>
                        </div>
                      </div>

                      {/* Título e proposta */}
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                          {o.status === 'approved' && <CheckCircle2 size={14} className="text-emerald-500" />}
                          {o.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{o.description}</p>
                      </div>

                      {/* Dor central e diferencial */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-[11px] space-y-1.5">
                        <p className="text-slate-600 dark:text-slate-300">
                          🎯 <strong className="text-slate-900 dark:text-white">Dor Central:</strong> {o.painPoint}
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                          ✨ <strong className="text-slate-900 dark:text-white">Diferenciação:</strong> {o.differentiation}
                        </p>
                      </div>

                      {/* Detalhes de pontuação */}
                      <div className="grid grid-cols-5 gap-2 text-center">
                        <div className="p-1.5 rounded bg-slate-100/50 dark:bg-slate-900/50 text-[10px]">
                          <span className="block text-slate-400">Demanda</span>
                          <strong className="font-bold dark:text-white">{o.demandScore}/10</strong>
                        </div>
                        <div className="p-1.5 rounded bg-slate-100/50 dark:bg-slate-900/50 text-[10px]">
                          <span className="block text-slate-400">Finanças</span>
                          <strong className="font-bold dark:text-white">{o.financialScore}/10</strong>
                        </div>
                        <div className="p-1.5 rounded bg-slate-100/50 dark:bg-slate-900/50 text-[10px]">
                          <span className="block text-slate-400">Fácil criar</span>
                          <strong className="font-bold dark:text-white">{o.creationEaseScore}/10</strong>
                        </div>
                        <div className="p-1.5 rounded bg-slate-100/50 dark:bg-slate-900/50 text-[10px]">
                          <span className="block text-slate-400">Rápido</span>
                          <strong className="font-bold dark:text-white">{o.launchSpeedScore}/10</strong>
                        </div>
                        <div className="p-1.5 rounded bg-slate-100/50 dark:bg-slate-900/50 text-[10px]">
                          <span className="block text-slate-400">Comp.</span>
                          <strong className="font-bold dark:text-white">{o.competitionScore}/10</strong>
                        </div>
                      </div>
                    </div>

                    {/* Ações / Status */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between gap-4 mt-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        o.status === 'approved' 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20'
                          : o.status === 'rejected'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20'
                      }`}>
                        {o.status === 'approved' ? 'Aprovado para o CEO' : o.status === 'rejected' ? 'Descartado' : 'Aguardando Decisão'}
                      </span>

                      {o.status === 'pending' && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleUpdateOpportunityStatus(o.id, 'rejected')}
                            className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-all"
                            title="Descartar"
                          >
                            <ThumbsDown size={14} />
                          </button>
                          <button
                            onClick={() => handleUpdateOpportunityStatus(o.id, 'approved')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 transition-all"
                          >
                            <ThumbsUp size={12} /> Aprovar p/ Fábrica
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA: RELATÓRIOS EM DETALHE */}
        {subTab === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Relatórios Disponíveis */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="font-bold text-xs uppercase text-slate-400">Dossiês de Nicho</h4>
              
              {reports.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-10">Nenhum dossiê emitido.</p>
              ) : (
                <div className="space-y-2">
                  {reports.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedReport(r)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs flex flex-col gap-1.5 ${
                        selectedReport?.id === r.id
                          ? 'border-indigo-600 bg-indigo-50/20 text-indigo-950 dark:text-white dark:bg-indigo-950/30'
                          : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <h5 className="font-bold truncate max-w-[150px]">{r.title}</h5>
                        <Clock size={11} className="text-slate-400" />
                      </div>
                      <p className="text-[10px] text-slate-400 truncate w-full">{r.content.substring(0, 60)}...</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Visualizador de Relatório Selecionado */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-[400px]">
              {selectedReport ? (
                <div className="space-y-6">
                  {/* Cabeçalho */}
                  <div className="border-b border-slate-100 dark:border-slate-900 pb-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-indigo-500 font-bold uppercase tracking-wider">
                      <FileText size={14} /> Relatório Oficial de Inteligência
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedReport.title}</h3>
                  </div>

                  {/* Corpo do Relatório com Markdown simples */}
                  <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-4 max-h-[500px] overflow-y-auto pr-2 whitespace-pre-line">
                    {selectedReport.content}
                  </div>

                  {/* Recomendações Estratégicas */}
                  <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 space-y-2 text-xs">
                    <h4 className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                      <Award size={14} className="text-indigo-500 animate-bounce" /> Recomendações Táticas do Research Agent
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedReport.recommendations}</p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-2">
                  <FileText size={48} className="text-slate-200 dark:text-slate-800" />
                  <h5 className="font-bold text-xs dark:text-slate-500">Selecione um Relatório</h5>
                  <p className="text-[11px] max-w-sm">Escolha um dos dossiês analíticos gerados pelo Research Agent na lista ao lado para realizar a leitura estratégica completa.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
