import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Settings, 
  Target, 
  ListTodo, 
  Compass, 
  ClipboardCheck, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  UserCheck,
  Sliders,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  FileText
} from 'lucide-react';

interface CEOPanelProps {
  products: any[];
  onRefreshAll: () => void;
}

export const CEOPanel: React.FC<CEOPanelProps> = ({ products, onRefreshAll }) => {
  // CEO configuration state
  const [config, setConfig] = useState<any>({
    focus: 'premium',
    autoStart: false,
    temperature: 0.7,
    systemPrompt: ''
  });
  
  // CEO Logs & Data
  const [decisions, setDecisions] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  
  // Interactive UI state
  const [objective, setObjective] = useState('');
  const [focus, setFocus] = useState<'premium' | 'fast_track' | 'agile'>('premium');
  const [isPlanning, setIsPlanning] = useState(false);
  const [auditProductId, setAuditProductId] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [approvedOpps, setApprovedOpps] = useState<any[]>([]);

  useEffect(() => {
    fetchCEOData();
  }, []);

  const fetchCEOData = async () => {
    try {
      const token = localStorage.getItem('factory_jwt_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const [configRes, decisionsRes, plansRes, reportsRes, oppsRes] = await Promise.all([
        fetch('/api/ceo/config'),
        fetch('/api/ceo/decisions'),
        fetch('/api/ceo/plans'),
        fetch('/api/ceo/reports'),
        fetch('/api/research/opportunities')
      ]);

      if (configRes.ok) {
        const d = await configRes.json();
        setConfig(d.config);
        setFocus(d.config.focus);
      }
      if (decisionsRes.ok) {
        const d = await decisionsRes.json();
        setDecisions(d.decisions);
      }
      if (plansRes.ok) {
        const d = await plansRes.json();
        const pData = d.plans;
        setPlans(pData);
        if (pData.length > 0 && !activePlanId) {
          setActivePlanId(pData[0].id);
        }
      }
      if (reportsRes.ok) {
        const d = await reportsRes.json();
        setReports(d.reports);
      }
      if (oppsRes.ok) {
        const d = await oppsRes.json();
        const filtered = (d.opportunities || []).filter((o: any) => o.status === 'approved');
        setApprovedOpps(filtered);
      }
    } catch (err) {
      console.error('Erro ao buscar dados do CEO:', err);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('factory_jwt_token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/ceo/config', {
        method: 'POST',
        headers,
        body: JSON.stringify(config)
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        fetchCEOData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartPlanning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objective.trim()) return;

    setIsPlanning(true);
    try {
      const token = localStorage.getItem('factory_jwt_token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/ceo/plan', {
        method: 'POST',
        headers,
        body: JSON.stringify({ objective, focus }),
      });

      if (res.ok) {
        const data = await res.json();
        setObjective('');
        fetchCEOData();
        onRefreshAll();
        if (data.plan) {
          setActivePlanId(data.plan.id);
        }
      } else {
        const err = await res.json();
        alert(`Erro de planejamento: ${err.error}`);
      }
    } catch (err: any) {
      alert(`Falha de conexão com o CEO: ${err.message}`);
    } finally {
      setIsPlanning(false);
    }
  };

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditProductId) return;

    setIsAuditing(true);
    try {
      const token = localStorage.getItem('factory_jwt_token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/ceo/audit/${auditProductId}`, {
        method: 'POST',
        headers
      });

      if (res.ok) {
        setAuditProductId('');
        fetchCEOData();
        onRefreshAll();
        alert('Auditoria concluída com sucesso! Relatório gerado.');
      } else {
        const err = await res.json();
        alert(`Erro na auditoria: ${err.error}`);
      }
    } catch (err: any) {
      alert(`Falha ao auditar: ${err.message}`);
    } finally {
      setIsAuditing(false);
    }
  };

  const activePlan = plans.find(p => p.id === activePlanId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-sm">
      {/* Coluna Esquerda: Estratégia, Configurações e Disparador de Metas */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Bloco 1: Formulário de Planejamento de Metas (CEO Principal) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
            <Target size={140} />
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Compass size={18} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">Direcionamento Estratégico (Definir Meta)</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Informe o objetivo geral para que o CEO Agent organize a esteira de produção</p>
            </div>
          </div>

          <form onSubmit={handleStartPlanning} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Qual o produto ou meta que deseja lançar?
              </label>
              <textarea
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="Ex: Criar um infoproduto (ebook de 5 capítulos) focado em ensinar Programação em Python para Advogados com ênfase em automação de contratos e petições judiciais."
                rows={3}
                required
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Foco da Esteira de Execução
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['premium', 'fast_track', 'agile'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setFocus(mode)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all capitalize ${
                        focus === mode
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850'
                      }`}
                    >
                      {mode.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isPlanning || !objective.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-tr from-indigo-600 to-violet-500 hover:from-indigo-500 hover:to-violet-400 text-white shadow-lg shadow-indigo-500/10 transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isPlanning ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      CEO Planejando com IA...
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} />
                      Conceber e Planejar Infoproduto
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {approvedOpps.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
              <span className="block text-[10px] uppercase font-bold text-slate-400 mb-3 tracking-wider">
                💡 Oportunidades de Mercado Aprovadas pelo Research Agent:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {approvedOpps.map((opp) => (
                  <button
                    key={opp.id}
                    type="button"
                    onClick={() => setObjective(`Criar o infoproduto: "${opp.title}" focado em ${opp.niche}. Descrição de mercado do Research Agent: ${opp.description}`)}
                    className="p-3 text-left rounded-xl bg-slate-50 hover:bg-indigo-50/20 dark:bg-slate-950 dark:hover:bg-indigo-950/10 border border-slate-150 dark:border-slate-800 transition-all text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <strong className="font-bold text-indigo-600 dark:text-indigo-400 block truncate max-w-[180px]">
                        {opp.title}
                      </strong>
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 dark:bg-slate-850 text-white text-[9px] font-black">
                        Score: {opp.finalScore}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-450 line-clamp-2 leading-relaxed">
                      {opp.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bloco 2: Visualização de Planos de Produção em Detalhes */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 rounded-lg">
                <ListTodo size={18} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">Esteiras de Planejamento Ativas</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Linha do tempo das tarefas sequenciadas pelo CEO Agent</p>
              </div>
            </div>

            <button 
              onClick={fetchCEOData}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              title="Recarregar"
            >
              <RefreshCw size={13} />
            </button>
          </div>

          {plans.length === 0 ? (
            <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-400">
              <Compass size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-700 animate-pulse" />
              <p className="text-xs">Nenhum plano estratégico ativo no momento.</p>
              <p className="text-[10px] text-slate-500 mt-1">Insira um objetivo acima para acionar o CEO.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Seletor de Planos */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 border-b border-slate-100 dark:border-slate-850">
                {plans.map((p, index) => (
                  <button
                    key={p.id}
                    onClick={() => setActivePlanId(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      activePlanId === p.id
                        ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-white'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    Plano #{index + 1} - {p.targetAudience.slice(0, 20)}...
                  </button>
                ))}
              </div>

              {activePlan && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-2 border border-slate-150/30">
                    <p className="text-xs text-slate-500">
                      <strong>Meta Central:</strong> {activePlan.objective}
                    </p>
                    <p className="text-xs text-slate-500">
                      <strong>Alvo do Infoproduto:</strong> <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{activePlan.targetAudience}</span>
                    </p>
                  </div>

                  <div className="relative pl-4 border-l-2 border-indigo-500/20 space-y-4">
                    {activePlan.steps.map((step: any, index: number) => (
                      <div key={index} className="relative">
                        <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-900"></div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-950 dark:text-white">
                              Etapa {index + 1}: {step.title}
                            </span>
                            <span className="text-[9px] uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono font-bold">
                              {step.agentId}
                            </span>
                            <span className={`text-[9px] uppercase font-bold px-1.5 rounded ${
                              step.priority === 'high' 
                                ? 'bg-rose-50 text-rose-600' 
                                : step.priority === 'medium'
                                ? 'bg-amber-50 text-amber-600'
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              {step.priority}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bloco 3: Parecer e Relatórios Executivos (Auditoria do CEO) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">Conselho de Lançamento & Auditorias</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Dispare uma verificação analítica heurística sobre os infoprodutos criados</p>
            </div>
          </div>

          <form onSubmit={handleAudit} className="flex gap-4 items-end bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-150/50 mb-6">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">
                Selecione o Produto para Auditar
              </label>
              <select
                value={auditProductId}
                onChange={(e) => setAuditProductId(e.target.value)}
                required
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100"
              >
                <option value="">Selecione um produto...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.niche})</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={isAuditing || !auditProductId}
              className="px-4 py-2.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all disabled:opacity-50"
            >
              {isAuditing ? 'Auditando...' : 'Solicitar Auditoria do CEO'}
            </button>
          </form>

          {/* Listagem de relatórios */}
          {reports.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">Nenhum relatório emitido pelo conselho de administração ainda.</p>
          ) : (
            <div className="space-y-4">
              {reports.map((rep) => {
                const prod = products.find(p => p.id === rep.productId);
                return (
                  <div key={rep.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <FileText size={14} className="text-emerald-500" />
                        <h5 className="font-bold text-slate-900 dark:text-white">{rep.title}</h5>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{rep.createdAt}</span>
                    </div>
                    {prod && (
                      <p className="text-[11px] text-slate-500">
                        Produto Relacionado: <strong>{prod.name}</strong>
                      </p>
                    )}
                    <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-950/60 p-3 rounded-lg border border-slate-100 dark:border-slate-900">
                      {rep.content}
                    </div>
                    {rep.recommendations && (
                      <div className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed bg-amber-500/5 p-3 rounded-lg border border-amber-500/10">
                        <strong>Recomendações de Otimização:</strong> {rep.recommendations}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Coluna Direita: Governança do Prompt e Logs de Decisões */}
      <div className="space-y-6">
        
        {/* Bloco 4: Configuração da IA do CEO */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 rounded-lg">
              <Sliders size={18} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">Diretoria & Parâmetros de IA</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Configure a identidade cognitiva do CEO</p>
            </div>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Foco do Perfil Comercial
              </label>
              <select
                value={config.focus}
                onChange={(e) => setConfig({ ...config, focus: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-slate-100"
              >
                <option value="premium">Premium (Foco na mais alta qualidade e valor agregado)</option>
                <option value="fast_track">Fast Track (Lançamento acelerado e simplificado)</option>
                <option value="agile">Agile (Lançamento balanceado iterativo)</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-850">
              <div>
                <span className="block text-xs font-semibold text-slate-900 dark:text-slate-200">Auto-Start Automático</span>
                <span className="text-[10px] text-slate-400">Ativar execução imediata da esteira</span>
              </div>
              <input
                type="checkbox"
                checked={config.autoStart}
                onChange={(e) => setConfig({ ...config, autoStart: e.target.checked })}
                className="w-4 h-4 text-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-500">Temperatura (Criatividade)</span>
                <span className="text-indigo-600 dark:text-indigo-400">{config.temperature}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={config.temperature}
                onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Prompt de Sistema do CEO
              </label>
              <textarea
                value={config.systemPrompt}
                onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                rows={5}
                className="w-full text-[11px] p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow"
            >
              <Settings size={13} />
              Salvar Diretrizes Cognitive
            </button>

            {saveSuccess && (
              <p className="text-center text-[11px] font-bold text-emerald-500 animate-fade-in">
                Diretrizes atualizadas com sucesso!
              </p>
            )}
          </form>
        </div>

        {/* Bloco 5: Histórico de Decisões do CEO */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 rounded-lg">
              <Activity size={18} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">Registro de Decisões</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Decisões corporativas mapeadas pelo CEO</p>
            </div>
          </div>

          {decisions.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">Nenhuma decisão registrada ainda.</p>
          ) : (
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {decisions.map((dec) => (
                <div key={dec.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold px-1.5 rounded py-0.5 bg-indigo-500/10 text-indigo-500">
                      {dec.decisionType.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{dec.timestamp}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-950 dark:text-white">
                    {dec.objective}
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    <strong>Ação:</strong> {dec.actionTaken}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-relaxed italic bg-white dark:bg-slate-950 p-2 rounded border border-slate-100 dark:border-slate-900">
                    "{dec.reasoning}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
