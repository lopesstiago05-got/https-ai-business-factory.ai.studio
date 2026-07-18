import React, { useState, useEffect } from 'react';
import { MarketAnalysis, ResearchOpportunity } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  DollarSign, 
  Users, 
  Target, 
  Award, 
  RefreshCw,
  Clock,
  Briefcase,
  Layers,
  ArrowRight
} from 'lucide-react';

interface MarketAnalystPanelProps {
  jwtToken: string | null;
  onRefreshState?: () => void;
}

export const MarketAnalystPanel: React.FC<MarketAnalystPanelProps> = ({ jwtToken, onRefreshState }) => {
  const [opportunities, setOpportunities] = useState<ResearchOpportunity[]>([]);
  const [analyses, setAnalyses] = useState<MarketAnalysis[]>([]);
  const [isLoadingOpps, setIsLoadingOpps] = useState(false);
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(false);
  const [analyzingOppId, setAnalyzingOppId] = useState<string | null>(null);
  const [approvingAnalysisId, setApprovingAnalysisId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'opps' | 'reports'>('opps');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch opportunities and reports
  const fetchData = async () => {
    setIsLoadingOpps(true);
    setIsLoadingAnalyses(true);
    setError(null);

    try {
      // 1. Fetch research opportunities
      const oppsRes = await fetch('/api/research/opportunities');
      if (oppsRes.ok) {
        const data = await oppsRes.json();
        setOpportunities(data.opportunities || []);
      } else {
        throw new Error('Falha ao carregar oportunidades.');
      }

      // 2. Fetch market analysis reports
      const analysesRes = await fetch('/api/market-analysis/reports');
      if (analysesRes.ok) {
        const data = await analysesRes.json();
        setAnalyses(data.reports || []);
      } else {
        throw new Error('Falha ao carregar relatórios de mercado.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Erro ao carregar dados do Centro de Inteligência de Mercado.');
    } finally {
      setIsLoadingOpps(false);
      setIsLoadingAnalyses(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Run the commercial analysis
  const handleAnalyze = async (oppId: string) => {
    setAnalyzingOppId(oppId);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/market-analysis/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken ? `Bearer ${jwtToken}` : ''
        },
        body: JSON.stringify({ opportunityId: oppId })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Erro ao processar análise.');
      }

      const data = await res.json();
      setSuccessMsg(`Análise de mercado finalizada com sucesso! Nota Final: ${data.analysis.finalScore}/10 (${data.analysis.status === 'approved' ? 'Aprovado' : 'Rejeitado'}).`);
      
      // Refresh local data
      await fetchData();
      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Falha ao rodar auditoria estratégica do Market Analyst.');
    } finally {
      setAnalyzingOppId(null);
    }
  };

  // Manually approve/submit approval to CEO Agent
  const handleSendApproval = async (analysisId: string) => {
    setApprovingAnalysisId(analysisId);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/market-analysis/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken ? `Bearer ${jwtToken}` : ''
        },
        body: JSON.stringify({ analysisId })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Erro ao enviar homologação.');
      }

      setSuccessMsg('Recomendação comercial enviada e homologada na pauta estratégica do CEO Agent com sucesso!');
      await fetchData();
      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Falha ao homologar aprovação com o CEO.');
    } finally {
      setApprovingAnalysisId(null);
    }
  };

  // Helper to color code scores
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    if (score >= 6) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Header and Subtitles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-violet-600/25 border border-violet-500/30 rounded-xl">
              <TrendingUp size={20} className="text-violet-400 animate-pulse" />
            </div>
            <h2 className="text-lg font-black text-white">Centro de Inteligência de Mercado</h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Área estratégica do <strong>Market Analyst Agent</strong>. Avalia oportunidades detectadas pelo Research Agent com base em 8 critérios financeiros de 0 a 10 e emite pareceres comerciais para pauta do CEO Agent.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="self-start md:self-center flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl border border-slate-700 hover:border-slate-650 transition-all shadow-md"
        >
          <RefreshCw size={13} className={(isLoadingOpps || isLoadingAnalyses) ? "animate-spin" : ""} />
          Atualizar Dados
        </button>
      </div>

      {/* Notifications and Alerts */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-550/20 text-rose-600 dark:text-rose-400 text-xs">
          <AlertCircle size={16} />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-550/20 text-emerald-600 dark:text-emerald-400 text-xs">
          <CheckCircle2 size={16} />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Navigation Sub-tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveSubTab('opps')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeSubTab === 'opps'
              ? 'border-indigo-600 text-indigo-600 dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Sparkles size={13} />
          Oportunidades de Entrada ({opportunities.length})
        </button>
        <button
          onClick={() => setActiveSubTab('reports')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeSubTab === 'reports'
              ? 'border-indigo-600 text-indigo-600 dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Award size={13} />
          Pareceres Comerciais Emitidos ({analyses.length})
        </button>
      </div>

      {/* Sub-tab view: Oportunidades */}
      {activeSubTab === 'opps' && (
        <div className="space-y-4">
          {isLoadingOpps ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
              <Loader2 className="animate-spin text-indigo-500" size={32} />
              <p className="text-xs">Carregando oportunidades mapeadas pelo Research Agent...</p>
            </div>
          ) : opportunities.length === 0 ? (
            <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400 max-w-xl mx-auto space-y-3">
              <Sparkles className="mx-auto text-indigo-500/30" size={36} />
              <p className="text-xs font-medium">Nenhuma oportunidade mapeada no momento.</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Vá até a aba <strong>Centro de Pesquisa</strong>, pesquise um nicho de mercado e gere novas oportunidades para habilitar a auditoria comercial automática!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {opportunities.map((opp) => {
                // Check if this opportunity already has a report
                const hasReport = analyses.some(a => a.opportunityId === opp.id);
                const relatedReport = analyses.find(a => a.opportunityId === opp.id);

                return (
                  <div 
                    key={opp.id}
                    id={`opp-card-${opp.id}`}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 hover:shadow-md transition-all space-y-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
                            {opp.niche}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 ${
                            opp.status === 'approved' 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                              : opp.status === 'rejected'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}>
                            {opp.status === 'approved' && <CheckCircle2 size={10} />}
                            {opp.status === 'rejected' && <XCircle size={10} />}
                            {opp.status === 'pending' && <Clock size={10} />}
                            {opp.status === 'approved' ? 'Aprovada' : opp.status === 'rejected' ? 'Rejeitada' : 'Aguardando Análise'}
                          </span>
                          {hasReport && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                              Nota Comercial: {relatedReport?.finalScore}/10
                            </span>
                          )}
                        </div>
                        <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100">{opp.title}</h3>
                      </div>

                      <div className="flex items-center gap-2 self-start md:self-auto">
                        {analyzingOppId === opp.id ? (
                          <button disabled className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-md">
                            <Loader2 size={13} className="animate-spin" />
                            Analisando com Gemini...
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAnalyze(opp.id)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all"
                          >
                            <Sparkles size={13} />
                            {hasReport ? 'Auditar Novamente' : 'Auditar Comercial'}
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {opp.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl text-xs border border-slate-100 dark:border-slate-850">
                      <div>
                        <span className="font-semibold text-slate-400 dark:text-slate-500 block mb-1">Dor Principal (Pain Point):</span>
                        <span className="text-slate-700 dark:text-slate-300">{opp.painPoint}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400 dark:text-slate-500 block mb-1">Diferencial Proposto:</span>
                        <span className="text-slate-700 dark:text-slate-300">{opp.differentiation}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-850 pt-3">
                      <div className="flex items-center gap-4 flex-wrap">
                        <span>Demand: <strong>{opp.demandScore}/10</strong></span>
                        <span>Financial: <strong>{opp.financialScore}/10</strong></span>
                        <span>Competition: <strong>{opp.competitionScore}/10</strong></span>
                        <span>Ease: <strong>{opp.creationEaseScore}/10</strong></span>
                      </div>
                      <span className="font-mono text-[10px]">Score Estimado Pesquisador: {opp.finalScore}/10</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Sub-tab view: Pareceres */}
      {activeSubTab === 'reports' && (
        <div className="space-y-4">
          {isLoadingAnalyses ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
              <Loader2 className="animate-spin text-violet-500" size={32} />
              <p className="text-xs">Carregando pareceres comerciais...</p>
            </div>
          ) : analyses.length === 0 ? (
            <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400 max-w-xl mx-auto space-y-3">
              <Award className="mx-auto text-violet-500/30" size={36} />
              <p className="text-xs font-medium">Nenhum parecer comercial emitido.</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Clique na aba <strong>Oportunidades de Entrada</strong> e selecione "Auditar Comercial" para gerar o parecer de viabilidade detalhado.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {analyses.map((analysis) => (
                <div 
                  key={analysis.id}
                  id={`analysis-card-${analysis.id}`}
                  className="bg-white dark:bg-slate-900 border-2 border-indigo-50 dark:border-slate-800/80 rounded-2xl p-6 shadow-md space-y-6"
                >
                  {/* Top segment: Title and General decision */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-150 dark:border-slate-800 pb-5">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-900/30">
                          {analysis.niche}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 ${
                          analysis.status === 'approved' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        }`}>
                          {analysis.status === 'approved' ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                          {analysis.status === 'approved' ? 'Comercialmente Viável' : 'Inviável / Rejeitada'}
                        </span>
                      </div>
                      <h3 className="font-black text-lg text-slate-800 dark:text-slate-100">{analysis.opportunityTitle}</h3>
                      <p className="text-[11px] text-slate-400">ID da Oportunidade: <code className="bg-slate-100 dark:bg-slate-950 px-1 py-0.5 rounded">{analysis.opportunityId || 'Não vinculado'}</code></p>
                    </div>

                    {/* Final score indicator */}
                    <div className="flex items-center gap-4 self-start md:self-auto">
                      <div className="text-right space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Nota Comercial Final</span>
                        <span className={`text-2xl font-black px-3.5 py-1 rounded-xl border ${
                          analysis.finalScore >= 7.0 
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400'
                        }`}>
                          {analysis.finalScore.toFixed(1)}/10
                        </span>
                      </div>

                      {/* Manual submission to CEO */}
                      {analysis.status === 'approved' && (
                        <div className="pt-2">
                          {approvingAnalysisId === analysis.id ? (
                            <button disabled className="flex items-center gap-1 px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow">
                              <Loader2 size={12} className="animate-spin" />
                              Homologando...
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSendApproval(analysis.id)}
                              className="flex items-center gap-1 px-4 py-2 text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/10 transition-all hover:scale-[1.02]"
                            >
                              Homologar no CEO <ArrowRight size={12} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Criteria Scoregrid (8 criteria) */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Métricas de Viabilidade Comercial (Auditadas 0 a 10)</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                      {[
                        { label: 'Demanda', val: analysis.demandScore },
                        { label: 'Urgência', val: analysis.urgencyScore },
                        { label: 'Poder de Compra', val: analysis.buyingPowerScore },
                        { label: 'Competição', val: analysis.competitionScore },
                        { label: 'Diferenciação', val: analysis.differentiationScore },
                        { label: 'Facilidade', val: analysis.creationEaseScore },
                        { label: 'Escala', val: analysis.scalingPotentialScore },
                        { label: 'Margem Lucro', val: analysis.profitMarginScore }
                      ].map((metric, i) => (
                        <div 
                          key={i} 
                          className={`p-3 rounded-xl border text-center space-y-1 ${getScoreColor(metric.val)}`}
                        >
                          <span className="text-[10px] font-medium leading-none block h-5 overflow-hidden text-ellipsis">{metric.label}</span>
                          <span className="text-base font-black block">{metric.val}/10</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Core expert opinion / strategic sections */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-50/50 dark:bg-slate-950/25 p-5 border border-slate-150 dark:border-slate-850 rounded-2xl">
                    <div className="space-y-1.5 lg:col-span-2 border-r-0 lg:border-r border-slate-200 dark:border-slate-800 lg:pr-6">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        <Briefcase size={12} />
                        <span>Parecer Técnico do Especialista</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal whitespace-pre-wrap">
                        {analysis.expertOpinion}
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Public details */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          <Target size={12} />
                          <span>Público-Alvo Estimado</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {analysis.targetAudience}
                        </p>
                      </div>

                      {/* Pricing suggestion */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          <DollarSign size={12} />
                          <span>Preço Recomendado</span>
                        </div>
                        <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                          {analysis.estimatedPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Viability & Strategic Recommendations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        <Layers size={12} />
                        <span>Viabilidade Financeira & Projeções</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                        {analysis.financialViability}
                      </p>
                    </div>

                    <div className="border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        <Sparkles size={12} />
                        <span>Recomendações e Ajustes Estratégicos</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                        {analysis.recommendations}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
