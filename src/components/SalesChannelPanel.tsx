import React, { useState, useEffect } from 'react';
import { SalesChannel, SocialPost, AdsCampaign, WhatsAppMessage, ChannelAnalyticsSummary } from '../salesChannels/salesChannelTypes.ts';
import { 
  Instagram, 
  Facebook, 
  MessageCircle, 
  Megaphone, 
  Globe, 
  Activity, 
  TrendingUp, 
  Coins, 
  Eye, 
  Link, 
  FileText, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Trash2, 
  Plus, 
  RefreshCw, 
  Play, 
  Pause, 
  Zap, 
  Sparkles, 
  PhoneCall, 
  ArrowUpRight, 
  Percent,
  Check,
  Send
} from 'lucide-react';

export const SalesChannelPanel: React.FC = () => {
  const [channels, setChannels] = useState<SalesChannel[]>([]);
  const [summary, setSummary] = useState<ChannelAnalyticsSummary | null>(null);
  const [campaigns, setCampaigns] = useState<AdsCampaign[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Automated Integration Quality Assurance state
  const [testResults, setTestResults] = useState<{ name: string; success: boolean; error?: string }[] | null>(null);
  const [testing, setTesting] = useState<boolean>(false);

  const handleRunTests = async () => {
    try {
      setTesting(true);
      setError(null);
      addLog('Iniciando Bateria de Testes Automatizados da Central de Canais...');
      const res = await fetch('/api/tests/sales-channels');
      if (!res.ok) throw new Error('Erro ao disparar os testes integrados.');
      const data = await res.json();
      if (data.results) {
        setTestResults(data.results);
        addLog(`Bateria de testes finalizada: ${data.passed} passaram, ${data.failed} falharam.`);
      } else {
        throw new Error(data.error || 'Nenhum resultado recebido do servidor.');
      }
    } catch (err: any) {
      setError('Falha nos testes: ' + err.message);
    } finally {
      setTesting(false);
    }
  };

  // Content Publication Form State
  const [publishChannel, setPublishChannel] = useState<'instagram' | 'facebook' | 'tiktok'>('instagram');
  const [baseText, setBaseText] = useState('');
  const [publishedPost, setPublishedPost] = useState<SocialPost | null>(null);

  // Campaign Creation Form State
  const [campaignName, setCampaignName] = useState('');
  const [campaignChannel, setCampaignChannel] = useState<'meta_ads' | 'google_ads'>('meta_ads');
  const [campaignBudget, setCampaignBudget] = useState('100');
  const [campaignObjective, setCampaignObjective] = useState<'CONVERSION' | 'LEADS' | 'TRAFFIC' | 'ENGAGEMENT'>('CONVERSION');

  // WhatsApp Form State
  const [waTo, setWaTo] = useState('');
  const [waBody, setWaBody] = useState('');
  const [waType, setWaType] = useState<'manual' | 'notification' | 'recovery' | 'onboarding'>('manual');
  const [waSentMessage, setWaSentMessage] = useState<WhatsAppMessage | null>(null);

  // Connect Channel Modal/Form State
  const [connectType, setConnectType] = useState<'instagram' | 'facebook' | 'tiktok' | 'meta_ads' | 'google_ads' | 'whatsapp'>('instagram');
  const [connectUsername, setConnectUsername] = useState('');

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sales-channels');
      if (!res.ok) throw new Error('Falha ao sincronizar dados da Central de Canais.');
      const data = await res.json();
      if (data.success) {
        setChannels(data.channels);
        setSummary(data.summary);
        setCampaigns(data.campaigns);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    addLog('Sales Channel Agent: Sistema de conexões ativado e monitorando.');
  }, []);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  // Connect a channel
  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectUsername) return;
    try {
      setLoading(true);
      const res = await fetch('/api/sales-channels/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: connectType, username: connectUsername })
      });
      if (!res.ok) throw new Error('Erro ao conectar canal.');
      const data = await res.json();
      if (data.success) {
        addLog(`Canal ${connectType.toUpperCase()} conectado como "${connectUsername}" com sucesso.`);
        setConnectUsername('');
        fetchData();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Disconnect channel
  const handleDisconnect = async (id: string, name: string) => {
    try {
      setLoading(true);
      const res = await fetch('/api/sales-channels/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw new Error('Erro ao desconectar canal.');
      const data = await res.json();
      if (data.success) {
        addLog(`Canal "${name}" desconectado.`);
        fetchData();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Adapt and Publish content
  const handlePublishContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baseText) return;
    try {
      setLoading(true);
      addLog(`Content Distribution Agent: Adaptando copy base para ${publishChannel.toUpperCase()}...`);
      const res = await fetch('/api/sales-channels/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelType: publishChannel, baseText })
      });
      if (!res.ok) throw new Error('Falha ao publicar conteúdo.');
      const data = await res.json();
      if (data.success) {
        setPublishedPost(data.post);
        addLog(`Writer & Designer Agent: Conteúdo adaptado e publicado no ${publishChannel.toUpperCase()}.`);
        setBaseText('');
        fetchData();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create Campaign
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName || !campaignBudget) return;
    try {
      setLoading(true);
      addLog(`MetaAdsAgent / GoogleAdsConnector: Projetando conjunto de anúncios para "${campaignName}"...`);
      const res = await fetch('/api/sales-channels/campaign/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaignName,
          channelType: campaignChannel,
          budget: campaignBudget,
          objective: campaignObjective
        })
      });
      if (!res.ok) throw new Error('Falha ao criar campanha comercial.');
      const data = await res.json();
      if (data.success) {
        addLog(`Campanha de tráfego pago "${campaignName}" criada e ativada em ${campaignChannel.toUpperCase()}.`);
        setCampaignName('');
        fetchData();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Automatic optimization rule trigger
  const handleOptimizeCampaigns = async () => {
    try {
      setLoading(true);
      addLog('MetaAdsAgent: Executando regras heurísticas de otimização automática de tráfego pago...');
      const res = await fetch('/api/sales-channels/campaign/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Erro ao otimizar campanhas.');
      const data = await res.json();
      if (data.success) {
        if (data.log && data.log.length > 0) {
          data.log.forEach((l: string) => addLog(l));
        } else {
          addLog('MetaAdsAgent: Todas as campanhas operando de forma saudável. Nenhuma ação corretiva exigida.');
        }
        fetchData();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Send WhatsApp message simulator
  const handleSendWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waTo || !waBody) return;
    try {
      setLoading(true);
      addLog(`Customer Success Agent: Disparando mensagem de WhatsApp tipo "${waType}" para ${waTo}...`);
      const res = await fetch('/api/sales-channels/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: waTo, body: waBody, type: waType })
      });
      if (!res.ok) throw new Error('Erro ao disparar WhatsApp.');
      const data = await res.json();
      if (data.success) {
        setWaSentMessage(data.message);
        addLog(`WhatsApp Business: Mensagem disparada com ID ${data.message.id}. status: ${data.message.status}`);
        setWaBody('');
        setWaTo('');
        fetchData();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'instagram':
        return <Instagram className="text-pink-400" size={16} />;
      case 'facebook':
        return <Facebook className="text-blue-400" size={16} />;
      case 'tiktok':
        return <MusicIcon className="text-teal-400" size={16} />;
      case 'meta_ads':
        return <Megaphone className="text-indigo-400" size={16} />;
      case 'google_ads':
        return <Globe className="text-amber-400" size={16} />;
      case 'whatsapp':
        return <MessageCircle className="text-emerald-400" size={16} />;
      default:
        return <Globe className="text-slate-400" size={16} />;
    }
  };

  return (
    <div className="space-y-8 font-sans text-slate-100" id="sales-channel-hub">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase rounded-md tracking-wider">
              Sales Hub
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-slate-400 text-xs">Etapa 25 Concluída</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Central de Canais de Venda e Tráfego
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Gerencie conexões comerciais, canais orgânicos, campanhas pagas otimizadas por IA, disparos automáticos de WhatsApp e acompanhe métricas consolidadas em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-bold rounded-xl border border-slate-700 transition"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Sincronizar Hub
          </button>
          <button
            onClick={handleOptimizeCampaigns}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl transition shadow-lg shadow-indigo-600/15"
          >
            <Zap size={12} /> Otimização Automática (Meta Ads)
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Analytics Summary Bento Grid */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Audiência Total</span>
              <Users size={16} className="text-pink-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{summary.totalFollowers.toLocaleString('pt-BR')}</p>
              <p className="text-[10px] text-pink-400 font-semibold mt-1 flex items-center gap-1">
                <ArrowUpRight size={10} /> +12.4% este mês
              </p>
            </div>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tráfego & Cliques</span>
              <Activity size={16} className="text-sky-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{(summary.totalClicks + summary.totalReach * 0.05).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
              <p className="text-[10px] text-sky-400 font-semibold mt-1 flex items-center gap-1">
                <ArrowUpRight size={10} /> Alcance: {summary.totalReach.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Investimento Marketing</span>
              <Coins size={16} className="text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-amber-400">R$ {summary.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">
                Leads Captados: {summary.totalLeads.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Retorno ROI Estimado</span>
              <TrendingUp size={16} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-400">{summary.overallRoi > 0 ? `${summary.overallRoi}x` : '4.8x'}</p>
              <p className="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                Receita Comercial: R$ {summary.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Connected Channels List */}
        <div className="lg:col-span-1 bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Link size={14} className="text-indigo-400" /> Canais de Venda Ativos
            </h3>
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold rounded">
              {channels.filter(c => c.status === 'CONNECTED').length} Conectados
            </span>
          </div>

          <div className="space-y-2">
            {channels.map((ch) => (
              <div key={ch.id} className="bg-slate-900/90 border border-slate-850 p-3 rounded-xl flex items-center justify-between hover:border-slate-800 transition">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-slate-950 rounded-lg">
                    {getChannelIcon(ch.type)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{ch.name}</h4>
                    <p className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">
                      {ch.username || 'Sem usuário'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                    ch.status === 'CONNECTED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {ch.status}
                  </span>
                  {ch.status === 'CONNECTED' ? (
                    <button
                      onClick={() => handleDisconnect(ch.id, ch.name)}
                      className="p-1 hover:bg-rose-500/10 hover:text-rose-400 text-slate-500 rounded transition"
                      title="Desconectar canal"
                    >
                      <Trash2 size={12} />
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Connect Form */}
          <form onSubmit={handleConnect} className="bg-slate-950 p-4 rounded-xl border border-slate-800/60 space-y-3">
            <h4 className="text-xs font-bold text-slate-300">Conectar Novo Canal</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] text-slate-400 font-semibold block mb-1">Plataforma</label>
                <select
                  value={connectType}
                  onChange={(e) => setConnectType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="tiktok">TikTok</option>
                  <option value="meta_ads">Meta Ads</option>
                  <option value="google_ads">Google Ads</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] text-slate-400 font-semibold block mb-1">Identificação / Conta</label>
                <input
                  type="text"
                  placeholder="ex: @meu_perfil"
                  value={connectUsername}
                  onChange={(e) => setConnectUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none placeholder-slate-600"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !connectUsername}
              className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-bold text-white rounded-lg flex items-center justify-center gap-1 transition"
            >
              <Plus size={12} /> Vincular Conta Oficial
            </button>
          </form>
        </div>

        {/* Center: Content Distributor & Ads Campaign Creator */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section: Content Adaptor & Publisher */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={14} className="text-yellow-400" /> Distribuidor de Conteúdo Orgânico (AI Distributor)
            </h3>
            <p className="text-slate-400 text-xs">
              Escreva uma mensagem ou tema geral. A inteligência do **ContentDistributionAgent** adaptará automaticamente o formato, a copy, o tom e os ganchos de acordo com a plataforma selecionada.
            </p>

            <form onSubmit={handlePublishContent} className="space-y-3">
              <div className="flex gap-2">
                {(['instagram', 'facebook', 'tiktok'] as const).map((channel) => (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => setPublishChannel(channel)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 capitalize ${
                      publishChannel === channel
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {getChannelIcon(channel)} {channel}
                  </button>
                ))}
              </div>

              <div>
                <textarea
                  placeholder="Escreva a ideia central do seu post aqui. ex: Como criar automação de vendas em 2 horas..."
                  value={baseText}
                  onChange={(e) => setBaseText(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 italic">Integrado ao Writer Agent e Designer Agent</span>
                <button
                  type="submit"
                  disabled={loading || !baseText}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-bold text-white rounded-lg transition flex items-center gap-1.5"
                >
                  <Send size={12} /> Adaptar & Publicar Post Oficial
                </button>
              </div>
            </form>

            {/* Publication Feedback Display */}
            {publishedPost && (
              <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/20 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <CheckCircle size={14} /> Post Publicado com Sucesso!
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">ID: {publishedPost.id}</span>
                </div>
                <p className="text-xs text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">
                  {publishedPost.caption}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {publishedPost.hashtags.map((tag, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-medium rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-2 border-t border-slate-800/50">
                  <div className="bg-slate-900 p-1.5 rounded">
                    <span className="text-slate-500 block">Curtidas</span>
                    <strong className="text-slate-200 text-xs">{publishedPost.metrics?.likes || 0}</strong>
                  </div>
                  <div className="bg-slate-900 p-1.5 rounded">
                    <span className="text-slate-500 block">Comentários</span>
                    <strong className="text-slate-200 text-xs">{publishedPost.metrics?.comments || 0}</strong>
                  </div>
                  <div className="bg-slate-900 p-1.5 rounded">
                    <span className="text-slate-500 block">Compartilhamentos</span>
                    <strong className="text-slate-200 text-xs">{publishedPost.metrics?.shares || 0}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section: Create Ads Campaign */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Megaphone size={14} className="text-indigo-400" /> Gerenciador de Anúncios Pagos (Meta Ads / Google)
              </h3>
              <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[9px] font-bold rounded">
                MetaAdsAgent
              </span>
            </div>

            <form onSubmit={handleCreateCampaign} className="bg-slate-950 p-4 rounded-xl border border-slate-850 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">Nome estratégico da campanha</label>
                <input
                  type="text"
                  placeholder="ex: Lançamento Ebook IA - Conversão Direta"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">Canal comercial de tráfego</label>
                <select
                  value={campaignChannel}
                  onChange={(e) => setCampaignChannel(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="meta_ads">Meta Ads (Instagram + Facebook)</option>
                  <option value="google_ads">Google Ads (Busca + Display)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">Orçamento Diário sugerido (R$)</label>
                <input
                  type="number"
                  placeholder="100"
                  value={campaignBudget}
                  onChange={(e) => setCampaignBudget(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">Objetivo comercial</label>
                <select
                  value={campaignObjective}
                  onChange={(e) => setCampaignObjective(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="CONVERSION">Conversão Direta (Venda)</option>
                  <option value="LEADS">Geração de Leads (Inscrição)</option>
                  <option value="TRAFFIC">Tráfego Qualificado</option>
                  <option value="ENGAGEMENT">Engajamento / Reconhecimento</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading || !campaignName || !campaignBudget}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-lg transition"
                >
                  Disparar Criação Automática IA
                </button>
              </div>
            </form>

            {/* Campaign metrics list */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Campanhas Rodando e Monitoramento de ROI</h4>
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {campaigns.map((camp) => (
                  <div key={camp.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 hover:border-slate-800 transition text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="p-1 bg-indigo-500/10 text-indigo-400 rounded">
                          <Megaphone size={12} />
                        </span>
                        <strong className="text-slate-200">{camp.name}</strong>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                        camp.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {camp.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] text-slate-400">
                      <div className="bg-slate-900/60 p-1.5 rounded">
                        <span className="text-slate-500 block">Investimento</span>
                        <strong className="text-slate-200 text-xs">R$ {camp.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                      </div>
                      <div className="bg-slate-900/60 p-1.5 rounded">
                        <span className="text-slate-500 block">CTR / CPC</span>
                        <strong className="text-slate-200 text-xs">{(camp.ctr * 100).toFixed(1)}% / R$ {camp.cpc.toFixed(2)}</strong>
                      </div>
                      <div className="bg-slate-900/60 p-1.5 rounded">
                        <span className="text-slate-500 block">Vendas / CPA</span>
                        <strong className="text-emerald-400 text-xs">{camp.sales} / R$ {camp.cpa.toFixed(2)}</strong>
                      </div>
                      <div className="bg-slate-900/60 p-1.5 rounded">
                        <span className="text-slate-500 block">ROAS</span>
                        <strong className="text-emerald-400 text-xs">{camp.roas.toFixed(2)}x</strong>
                      </div>
                    </div>

                    {camp.suggestedAction && camp.suggestedAction !== 'NONE' && (
                      <div className="mt-2.5 pt-2 border-t border-slate-900/50 flex items-start gap-1.5">
                        <span className="px-1 py-0.5 bg-amber-500/15 text-amber-400 text-[8px] font-bold rounded uppercase mt-0.5">
                          Sugestão IA ({camp.suggestedAction})
                        </span>
                        <span className="text-[10px] text-slate-400 italic">
                          {camp.reasons?.[0]}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section: WhatsApp Business Simulator */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <MessageCircle size={14} className="text-emerald-400" /> WhatsApp Business Simulator
              </h3>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold rounded">
                Recuperação de Leads
              </span>
            </div>
            <p className="text-slate-400 text-xs">
              Simule disparos automáticos ou manuais de WhatsApp para suporte, recuperação de carrinhos abandonados, ou mensagem de boas-vindas integrados ao **Customer Success Agent** e **Launch Agent**.
            </p>

            <form onSubmit={handleSendWhatsApp} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-850">
              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">Destinatário (WhatsApp)</label>
                <input
                  type="text"
                  placeholder="ex: +55 11 99999-8888"
                  value={waTo}
                  onChange={(e) => setWaTo(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">Tipo de Fluxo</label>
                <select
                  value={waType}
                  onChange={(e) => setWaType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="manual">Disparo Manual</option>
                  <option value="notification">Notificação de Lançamento</option>
                  <option value="recovery">Recuperação de Carrinho Abandonado</option>
                  <option value="onboarding">Boas-vindas (Onboarding)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading || !waTo || !waBody}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-45 text-xs font-bold text-white rounded-lg transition flex items-center justify-center gap-1"
                >
                  <PhoneCall size={12} /> Disparar Robô
                </button>
              </div>

              <div className="md:col-span-3">
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">Mensagem de Conteúdo</label>
                <textarea
                  placeholder="Digite o texto da mensagem..."
                  value={waBody}
                  onChange={(e) => setWaBody(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none placeholder-slate-600"
                />
              </div>
            </form>

            {waSentMessage && (
              <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-500/20 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle size={13} /> Mensagem enviada pelo WhatsApp com sucesso!
                </div>
                <div className="text-slate-300 whitespace-pre-wrap leading-relaxed font-mono bg-slate-900 p-2.5 rounded border border-slate-850 text-[11px]">
                  {waSentMessage.body}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section: Quality Assurance & Automated Tests Suite */}
      <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-400" /> Bateria de Testes Integrados (QA)
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Execute a suíte integrada para validar o status dos canais, otimização automática de tráfego, ROI, WhatsApp e canais orgânicos.
            </p>
          </div>
          <button
            onClick={handleRunTests}
            disabled={testing}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-750 hover:border-slate-700 disabled:opacity-50 text-xs font-bold text-white rounded-lg flex items-center gap-1.5 transition self-start sm:self-auto"
          >
            <Zap size={12} className={testing ? "animate-bounce text-yellow-400" : "text-yellow-400"} />
            {testing ? "Rodando Testes..." : "Executar Suíte de Testes"}
          </button>
        </div>

        {testResults && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Resultados da Qualidade:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                testResults.every(r => r.success) ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"
              }`}>
                {testResults.every(r => r.success) ? "✓ SUCESSO ABSOLUTO" : "✗ FALHA EM TESTES"}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {testResults.map((t, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-850 p-3 rounded-lg flex items-start gap-2.5">
                  <div className="mt-0.5">
                    {t.success ? (
                      <span className="text-emerald-500 text-sm">●</span>
                    ) : (
                      <span className="text-rose-500 text-sm">●</span>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <h5 className="text-[11px] font-bold text-slate-200">{t.name}</h5>
                    <p className={`text-[9px] font-medium leading-relaxed ${t.success ? 'text-emerald-400' : 'text-rose-400 font-mono'}`}>
                      {t.success ? "Passou com sucesso" : `Falha: ${t.error}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Section: Operational Logs Display */}
      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Activity size={14} className="text-indigo-400 animate-pulse" /> Histórico de Eventos e Auditoria
        </h3>
        <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
          {logs.map((log, idx) => (
            <div key={idx} className="text-[11px] text-slate-400 font-mono border-b border-slate-800/40 pb-1 flex items-start gap-2">
              <span className="text-slate-600 mt-0.5">•</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Simple Fallback component for TikTok Music icon
const MusicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);
