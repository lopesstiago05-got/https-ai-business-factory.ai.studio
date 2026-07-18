import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Globe, 
  Languages, 
  Coins, 
  Scale, 
  TrendingUp, 
  Play, 
  DollarSign, 
  Calculator, 
  MapPin, 
  Info, 
  AlertTriangle, 
  Award, 
  CheckCircle2, 
  Percent, 
  FileText, 
  Activity,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface GlobalProfile {
  region: {
    countryCode: string;
    countryName: string;
    defaultLanguage: string;
    defaultCurrency: string;
    timezone: string;
    complianceWarning: string;
    dateFormat: string;
  };
  language: {
    code: string;
    name: string;
    localName: string;
    flag: string;
    direction: string;
  };
  currency: {
    code: string;
    symbol: string;
    name: string;
    rateToBRL: number;
    decimalDigits: number;
  };
  complianceNotice: string;
}

interface RegionalPerformance {
  countryCode: string;
  countryName: string;
  currencyCode: string;
  salesCount: number;
  rawRevenue: number;
  convertedRevenueBRL: number;
  estimatedTaxPaidBRL: number;
  netRevenueBRL: number;
}

export const GlobalExpansionPanel: React.FC = () => {
  const [profile, setProfile] = useState<GlobalProfile | null>(null);
  const [regions, setRegions] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<RegionalPerformance[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  // Selections
  const [selectedCountryCode, setSelectedCountryCode] = useState('BR');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [expansionCountryCode, setExpansionCountryCode] = useState('US');
  
  // Transaction Simulation
  const [simCountryCode, setSimCountryCode] = useState('US');
  const [simPrice, setSimPrice] = useState('49.99');
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  // Expansion Workflow
  const [runningExpansion, setRunningExpansion] = useState(false);
  const [expansionResult, setExpansionResult] = useState<any>(null);
  const [activeStepMsg, setActiveStepMsg] = useState('');

  // Loading
  const [loading, setLoading] = useState(true);

  const fetchGlobalData = async () => {
    try {
      const [profRes, regRes, langRes, curRes, analRes, prodRes] = await Promise.all([
        fetch('/api/global/profile').then(r => r.json()),
        fetch('/api/global/regions').then(r => r.json()),
        fetch('/api/global/languages').then(r => r.json()),
        fetch('/api/global/currencies').then(r => r.json()),
        fetch('/api/global/analytics').then(r => r.json()),
        fetch('/api/products').then(r => r.json())
      ]);

      if (profRes.success) setProfile(profRes.profile);
      if (regRes.success) setRegions(regRes.regions);
      if (langRes.success) setLanguages(langRes.languages);
      if (curRes.success) setCurrencies(curRes.currencies);
      if (analRes.success) setAnalytics(analRes.analytics);
      if (prodRes) setProducts(prodRes);
      
      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar dados globais:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalData();
  }, []);

  const handleSetRegion = async (code: string) => {
    setSelectedCountryCode(code);
    try {
      const res = await fetch('/api/global/set-region', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryCode: code })
      }).then(r => r.json());
      
      if (res.success) {
        setProfile(res.profile);
      }
    } catch (err) {
      console.error('Erro ao definir região ativa:', err);
    }
  };

  const handleSimulateSale = async () => {
    if (!simPrice || isNaN(Number(simPrice))) return;
    setSimulating(true);
    setSimulationResult(null);

    try {
      const res = await fetch('/api/global/simulate-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryCode: simCountryCode, localPrice: Number(simPrice) })
      }).then(r => r.json());

      if (res.success) {
        setSimulationResult(res.result);
        // Refresh analytics
        fetch('/api/global/analytics')
          .then(r => r.json())
          .then(data => { if (data.success) setAnalytics(data.analytics); });
      }
    } catch (err) {
      console.error('Erro ao simular transação:', err);
    } finally {
      setSimulating(false);
    }
  };

  const handleExecuteExpansion = async () => {
    if (!selectedProductId) return;
    setRunningExpansion(true);
    setExpansionResult(null);
    
    // Simulate steps messages
    const msgs = [
      'Analisando características originais do infoproduto...',
      'Mapeando o ecossistema competitivo local...',
      'Identificando nuances culturais e preferências de faturamento...',
      'Traduzindo headlines, propostas e copies via Gemini-3.5...',
      'Validando precificação em moedas locais...',
      'Consultando matriz tributária e gerando alertas de conformidade...',
      'Redigindo relatório completo de inteligência comercial internacional...'
    ];

    let step = 0;
    setActiveStepMsg(msgs[0]);
    const interval = setInterval(() => {
      step++;
      if (step < msgs.length) {
        setActiveStepMsg(msgs[step]);
      }
    }, 1800);

    try {
      const res = await fetch('/api/global/expand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId: selectedProductId, 
          targetCountryCode: expansionCountryCode 
        })
      }).then(r => r.json());

      clearInterval(interval);

      if (res.success) {
        setExpansionResult(res.result);
      } else {
        alert(res.error || 'Falha ao executar expansão internacional.');
      }
    } catch (err: any) {
      clearInterval(interval);
      alert('Erro na chamada do agente: ' + err.message);
    } finally {
      setRunningExpansion(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <RefreshCw size={36} className="animate-spin mb-4 text-indigo-500" />
        <p className="text-sm">Carregando painel de internacionalização...</p>
      </div>
    );
  }

  const activeCountryData = regions.find(r => r.countryCode === selectedCountryCode) || regions[0];

  return (
    <div className="space-y-6">
      {/* HEADER INTEGRADO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-pink-500/10 text-pink-400 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
              <Globe size={11} /> Etapa 30
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
              Multi-Tenant Isolated
            </span>
          </div>
          <h2 className="text-xl font-black text-white">Global Expansion & Internationalization Engine</h2>
          <p className="text-slate-400 text-xs mt-1">
            Adapte sua fábrica de infoprodutos para operar em múltiplos países, faturar em moedas estrangeiras e traduzir funis completos com conformidade local inteligente.
          </p>
        </div>

        {/* SELECTOR DE PAÍS ATIVO DA PLATAFORMA */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-500">Região Ativa do Workspace</span>
            <span className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
              {profile?.language.flag} {profile?.region.countryName} ({profile?.currency.code})
            </span>
          </div>
          <select 
            value={selectedCountryCode}
            onChange={(e) => handleSetRegion(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white text-xs px-2 py-1 rounded-md focus:outline-none focus:border-indigo-500 font-bold"
          >
            {regions.map(r => (
              <option key={r.countryCode} value={r.countryCode}>
                {r.countryName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CARDS DE STATUS DE LOCALIZAÇÃO DO WORKSPACE */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Languages size={16} className="text-indigo-400" /> Ativos de Idioma e Formato
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Idioma Principal</span>
              <span className="text-xs font-bold text-white flex items-center gap-1">
                {profile?.language.flag} {profile?.language.name}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Moeda de Cobrança</span>
              <span className="text-xs font-bold text-white flex items-center gap-1">
                <Coins size={12} className="text-emerald-400" /> {profile?.currency.name} ({profile?.currency.symbol} {profile?.currency.code})
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Timezone Regional</span>
              <span className="text-xs font-mono text-slate-300">
                {profile?.region.timezone}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Data de Amostra Local</span>
              <span className="text-xs font-mono text-slate-300">
                {new Intl.DateTimeFormat(profile?.language.code, { dateStyle: 'full' }).format(new Date())}
              </span>
            </div>
          </div>

          {/* COMPLIANCE ALERT BOX (CRITICAL REQ) */}
          <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle size={15} /> Aviso Legal e Fiscal
            </div>
            <p className="text-[11px] text-amber-200/80 leading-relaxed">
              {profile?.complianceNotice}
            </p>
            <div className="text-[10px] text-amber-300 bg-amber-950/40 p-2 rounded border border-amber-800/20 leading-tight">
              ⚠️ A conformidade fiscal, tributária e emissão de notas fiscais locais depende estritamente das leis locais vigentes de cada país e requer validação técnica do responsável legal do negócio.
            </div>
          </div>
        </div>

        {/* WORKFLOW DE EXPANSÃO VIA AGENTE IA (GLOBAL EXPANSION AGENT) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-pink-400" /> Copiloto de Expansão e Tradução de Infoproduto
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Selecione um infoproduto ativo da sua esteira e defina o país de destino para expandir, traduzir e calibrar a proposta de vendas.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Selecione o Infoproduto</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500 font-bold"
                >
                  <option value="">-- Escolha um Infoproduto --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.niche})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">País Alvo de Destino</label>
                <select
                  value={expansionCountryCode}
                  onChange={(e) => setExpansionCountryCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500 font-bold"
                >
                  {regions.map(r => (
                    <option key={r.countryCode} value={r.countryCode}>
                      {r.countryName} ({r.defaultLanguage})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* EXPANSION EXECUTION */}
            {!expansionResult && !runningExpansion && (
              <div className="flex items-center justify-center p-8 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                Selecione um produto e clique em "Iniciar Expansão" para que o Global Expansion Agent gere a estratégia internacionalizada.
              </div>
            )}

            {/* RUNNING LOADER */}
            {runningExpansion && (
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-850 flex flex-col items-center justify-center space-y-4">
                <RefreshCw size={32} className="animate-spin text-pink-500" />
                <div className="text-center">
                  <p className="text-xs text-white font-bold">Global Expansion Agent em execução...</p>
                  <p className="text-[11px] text-pink-400 animate-pulse mt-1">{activeStepMsg}</p>
                </div>
              </div>
            )}

            {/* RESULTS FROM IA AGENT */}
            {expansionResult && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs bg-pink-500/10 text-pink-400 px-2.5 py-0.5 rounded font-black uppercase">Resultados IA</span>
                    <span className="text-xs text-slate-400 font-semibold">Expandido para {expansionResult.targetCountry}</span>
                  </div>
                  <div className="text-xs font-bold text-white">
                    Preço de Paridade Sugerido: <span className="text-emerald-400 font-mono font-black">{expansionResult.currencyCode} {expansionResult.suggestedPrice}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Market info */}
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-850 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Score de Demanda Local</span>
                      <span className="bg-indigo-500/10 text-indigo-400 text-xs px-2 py-0.5 rounded font-bold">
                        {expansionResult.marketProfile?.nicheDemandScore}/100
                      </span>
                    </div>

                    <div className="text-[11px] space-y-1 text-slate-300">
                      <p className="font-bold text-white text-[10px] uppercase tracking-wider text-slate-400">Nuances Culturais:</p>
                      {expansionResult.marketProfile?.culturalNuances?.map((n: string, idx: number) => (
                        <p key={idx} className="flex items-start gap-1">
                          <span className="text-indigo-400">•</span> {n}
                        </p>
                      ))}
                    </div>

                    <div className="text-[11px] space-y-1 text-slate-300">
                      <p className="font-bold text-white text-[10px] uppercase tracking-wider text-slate-400">Canais de Marketing Recomendados:</p>
                      <p className="text-[11px] text-slate-200">{expansionResult.marketProfile?.suggestedLocalChannels?.join(', ')}</p>
                    </div>
                  </div>

                  {/* Localized Copy assets */}
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-850 space-y-2">
                    <div className="text-[11px] space-y-1 text-slate-300">
                      <p className="font-bold text-white text-[10px] uppercase tracking-wider text-slate-400">Título Localizado:</p>
                      <p className="text-white font-bold">{expansionResult.localizedTitle}</p>
                    </div>

                    <div className="text-[11px] space-y-1 text-slate-300">
                      <p className="font-bold text-white text-[10px] uppercase tracking-wider text-slate-400">Headline Localizada:</p>
                      <p className="text-pink-400 italic font-semibold">"{expansionResult.localizedHeadline}"</p>
                    </div>

                    <div className="text-[11px] space-y-1 text-slate-300">
                      <p className="font-bold text-white text-[10px] uppercase tracking-wider text-slate-400">Pitch de Vendas (L10n):</p>
                      <p className="text-slate-300 line-clamp-3 leading-snug">{expansionResult.localizedPitch}</p>
                    </div>
                  </div>
                </div>

                {/* Report Area */}
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-850 space-y-1.5">
                  <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <FileText size={12} className="text-indigo-400" /> Parecer Estratégico do Agente de IA
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950 p-2.5 rounded border border-slate-850 font-sans">
                    {expansionResult.report}
                  </p>
                </div>

                {/* Trust and details */}
                <div className="bg-pink-950/20 border border-pink-900/30 p-3 rounded-lg flex items-start gap-2.5">
                  <ShieldCheck size={16} className="text-pink-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-pink-300">Fatores de Confiança Local Estabelecidos</p>
                    <p className="text-[11px] text-pink-100/80 leading-snug">
                      {expansionResult.marketingAssets?.localTrustFactors?.join(' | ')}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex justify-end gap-2">
            <button
              onClick={handleExecuteExpansion}
              disabled={!selectedProductId || runningExpansion}
              className="bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Play size={13} /> {runningExpansion ? 'Globalizando...' : 'Iniciar Expansão Internacional'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SIMULADOR DE TRANSAÇÕES E CÂMBIO EM TEMPO REAL */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 mb-1">
              <Calculator size={16} className="text-indigo-400" /> Simulação de Faturamento Multicamada
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Simule a conversão monetária, aplique taxas tributárias locais por país de venda e gere previsões brutas/líquidas instantâneas.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">País Adquirente</label>
                <select
                  value={simCountryCode}
                  onChange={(e) => setSimCountryCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500 font-bold"
                >
                  {regions.map(r => (
                    <option key={r.countryCode} value={r.countryCode}>
                      {r.countryName} ({r.defaultCurrency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Preço Cobrado na Moeda Local</label>
                <div className="relative">
                  <input
                    type="text"
                    value={simPrice}
                    onChange={(e) => setSimPrice(e.target.value)}
                    placeholder="ex: 49.99"
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500 font-bold"
                  />
                  <span className="absolute left-3 top-2.5 text-slate-500 font-bold text-xs">
                    {currencies.find(c => c.code === (regions.find(r => r.countryCode === simCountryCode)?.defaultCurrency))?.symbol || '$'}
                  </span>
                </div>
              </div>
            </div>

            {/* SIMULATION RESULTS */}
            {simulationResult && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-950 rounded-lg p-3 border border-slate-800 mt-4 space-y-2.5 text-xs"
              >
                <div className="flex justify-between border-b border-slate-850 pb-1.5">
                  <span className="text-slate-400">Total Pago pelo Cliente</span>
                  <span className="font-bold text-white">{simulationResult.currencyCode} {simPrice}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Conversão Direta</span>
                  <span className="font-bold text-slate-300">R$ {simulationResult.convertedRevenueBRL.toFixed(2)} BRL</span>
                </div>

                <div className="flex justify-between text-amber-400">
                  <span className="flex items-center gap-1"><Percent size={11} /> Imposto Estimado Local</span>
                  <span>- R$ {simulationResult.estimatedTaxPaidBRL.toFixed(2)} BRL</span>
                </div>

                <div className="flex justify-between border-t border-slate-850 pt-2 text-emerald-400 font-bold">
                  <span>Receita Líquida no Sandbox</span>
                  <span>R$ {simulationResult.netRevenueBRL.toFixed(2)} BRL</span>
                </div>
              </motion.div>
            )}
          </div>

          <button
            onClick={handleSimulateSale}
            disabled={simulating}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-4"
          >
            <Calculator size={13} /> {simulating ? 'Convertendo...' : 'Simular Transação & Injetar'}
          </button>
        </div>

        {/* MAPA ANALYTICS DE EXPANSÃO GLOBAL */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp size={16} className="text-pink-400" /> Histórico de Transações de Expansão por País
            </h3>
            <span className="text-[10px] bg-slate-950 border border-slate-800 px-2 py-0.5 rounded font-mono text-slate-400">
              Câmbio Real-Time Ativo
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Acompanhe o desempenho comercial isolado por país, faturamento convertido em Real (BRL) e estimativa de deduções fiscais aplicadas.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                  <th className="pb-2">País / Região</th>
                  <th className="pb-2 text-center">Vendas</th>
                  <th className="pb-2 text-right font-mono">Faturamento Local</th>
                  <th className="pb-2 text-right font-mono">Faturamento (BRL)</th>
                  <th className="pb-2 text-right text-amber-400 font-mono">Deduções Fiscais</th>
                  <th className="pb-2 text-right text-emerald-400 font-mono">Faturamento Líquido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {analytics.map((row) => (
                  <tr key={row.countryCode} className="hover:bg-slate-950/40">
                    <td className="py-2.5 font-bold text-white flex items-center gap-2">
                      <span className="text-base">{currencies.find(c => c.code === row.currencyCode)?.flag || (row.countryCode === 'BR' ? '🇧🇷' : row.countryCode === 'US' ? '🇺🇸' : row.countryCode === 'ES' ? '🇪🇸' : '🇫🇷')}</span>
                      {row.countryName}
                    </td>
                    <td className="py-2.5 text-center text-slate-300 font-semibold">{row.salesCount}</td>
                    <td className="py-2.5 text-right font-mono text-slate-300">
                      {row.currencyCode} {row.rawRevenue.toLocaleString(row.countryCode === 'BR' ? 'pt-BR' : 'en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-white">
                      R$ {row.convertedRevenueBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 text-right font-mono text-amber-500">
                      R$ {row.estimatedTaxPaidBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 text-right font-mono font-black text-emerald-400">
                      R$ {row.netRevenueBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
