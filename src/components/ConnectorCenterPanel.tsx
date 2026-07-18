import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ExternalLink, 
  UploadCloud, 
  DollarSign, 
  ShoppingBag, 
  Layers, 
  Terminal, 
  Send,
  Zap,
  Info,
  Link,
  Lock,
  ArrowRight
} from 'lucide-react';
import { ConnectorProject } from '../connectors/connectorTypes.ts';
import { DigitalProduct, DigitalSale } from '../types.ts';

interface ConnectorCenterPanelProps {
  jwtToken?: string;
  onRefreshState?: () => void;
}

export const ConnectorCenterPanel: React.FC<ConnectorCenterPanelProps> = ({ jwtToken, onRefreshState }) => {
  const [connectors, setConnectors] = useState<ConnectorProject[]>([]);
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [sales, setSales] = useState<DigitalSale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Connection form states
  const [selectedProvider, setSelectedProvider] = useState<string>('hotmart');
  const [apiToken, setApiToken] = useState<string>('');
  const [connectLoading, setConnectLoading] = useState<boolean>(false);

  // Publishing form states
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>('');
  const [publishingLoading, setPublishingLoading] = useState<boolean>(false);
  const [publishResult, setPublishResult] = useState<{ url: string; id: string } | null>(null);

  // Webhook Simulator states
  const [simEvent, setSimEvent] = useState<'SALE_COMPLETED' | 'PAYMENT_PENDING' | 'PAYMENT_FAILED' | 'REFUND_CREATED' | 'CUSTOMER_CREATED'>('SALE_COMPLETED');
  const [simEmail, setSimEmail] = useState<string>('parceiro.sucesso@factory.com');
  const [simAmount, setSimAmount] = useState<number>(197.0);
  const [simProvider, setSimProvider] = useState<string>('hotmart');
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simLog, setSimLog] = useState<string[]>([]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch Connectors
      const resConnectors = await fetch('/api/connectors');
      if (!resConnectors.ok) throw new Error('Erro ao carregar conexões.');
      const dataConnectors = await resConnectors.json();
      setConnectors(dataConnectors);

      // Fetch Sales
      const resSales = await fetch('/api/connectors/sales');
      if (resSales.ok) {
        const dataSales = await resSales.json();
        setSales(dataSales);
      }

      // Fetch Products
      const resProducts = await fetch('/api/product-factory/projects');
      if (resProducts.ok) {
        const dataProjects = await resProducts.json();
        // Extract products from projects
        const prods = dataProjects.map((p: any) => ({
          id: p.id,
          name: p.idea?.name || 'Sem nome',
          price: p.offer?.suggestedPrice || 197.0,
          status: p.status === 'LAUNCHED' ? 'published' : 'draft',
          paymentProvider: p.provider || ''
        }));
        setProducts(prods);
        if (prods.length > 0) setSelectedProduct(prods[0].id);
      }

      // Automatically select first connected provider for publish/sim if possible
      const connectedOne = dataConnectors.find((c: any) => c.status === 'CONNECTED');
      if (connectedOne) {
        setSelectedMarketplace(connectedOne.id);
        setSimProvider(connectedOne.id);
      } else if (dataConnectors.length > 0) {
        setSelectedMarketplace(dataConnectors[0].id);
        setSimProvider(dataConnectors[0].id);
      }

    } catch (err: any) {
      setError(err.message || 'Falha ao sincronizar dados com o Hub de Conectores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiToken) {
      alert('Por favor, informe o Token de acesso API.');
      return;
    }

    try {
      setConnectLoading(true);
      const res = await fetch('/api/connectors/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: selectedProvider, token: apiToken })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro na autenticação.');
      }

      setSimLog(prev => [`[${new Date().toLocaleTimeString()}] Conexão bem-sucedida com o ${selectedProvider.toUpperCase()}`, ...prev]);
      setApiToken('');
      await fetchAllData();
      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setConnectLoading(false);
    }
  };

  const handleDisconnect = async (provider: string) => {
    if (!window.confirm(`Tem certeza que deseja desconectar a conta do ${provider.toUpperCase()}?`)) return;

    try {
      const res = await fetch('/api/connectors/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao desconectar.');

      setSimLog(prev => [`[${new Date().toLocaleTimeString()}] Desconectou o ${provider.toUpperCase()}`, ...prev]);
      await fetchAllData();
      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !selectedMarketplace) {
      alert('Por favor, selecione o Produto e o Marketplace.');
      return;
    }

    try {
      setPublishingLoading(true);
      setPublishResult(null);

      const res = await fetch('/api/connectors/product/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selectedProduct, provider: selectedMarketplace })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao publicar.');

      setPublishResult({ url: data.url, id: data.externalId });
      setSimLog(prev => [`[${new Date().toLocaleTimeString()}] Produto publicado no ${selectedMarketplace.toUpperCase()}. URL: ${data.url}`, ...prev]);
      await fetchAllData();
      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPublishingLoading(false);
    }
  };

  const handleSimulateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSimulating(true);
      const res = await fetch('/api/connectors/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: simEvent,
          provider: simProvider,
          id: `sim-wh-${Date.now()}`,
          amount: simAmount,
          commission: simAmount * 0.1,
          buyer_email: simEmail,
          product_id: selectedProduct || 'prod_default'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao simular webhook.');

      setSimLog(prev => [
        `[${new Date().toLocaleTimeString()}] WEBHOOK ${simEvent} processado pelo ${simProvider.toUpperCase()}. ID Evento: ${data.eventId}`,
        ...prev
      ]);
      await fetchAllData();
      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSimulating(false);
    }
  };

  const handleForceSync = async () => {
    try {
      setSyncing(true);
      const res = await fetch('/api/connectors/status');
      if (!res.ok) throw new Error('Falha ao sincronizar.');
      
      // Simulando sincronização
      await new Promise(resolve => setTimeout(resolve, 800));
      setSimLog(prev => [`[${new Date().toLocaleTimeString()}] Sincronização geral de vendas disparada com sucesso.`, ...prev]);
      await fetchAllData();
      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONNECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
            <CheckCircle size={12} /> Conectado
          </span>
        );
      case 'SYNCING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full animate-pulse">
            <RefreshCw size={12} className="animate-spin" /> Sincronizando
          </span>
        );
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full">
            <AlertCircle size={12} /> Erro de Token
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded-full">
            <XCircle size={12} /> Desconectado
          </span>
        );
    }
  };

  const getTokenPlaceholder = (provider: string) => {
    switch (provider) {
      case 'hotmart': return 'HOT-TEST-TOKEN-123456-SECRET';
      case 'kiwify': return 'KIW-TEST-TOKEN-987654-SECRET';
      case 'eduzz': return 'EDZ-TEST-TOKEN-456123-SECRET';
      case 'monetizze': return 'MON-TEST-TOKEN-789321-SECRET';
      case 'braip': return 'BRP-TEST-TOKEN-321789-SECRET';
      default: return 'Token da API...';
    }
  };

  const totalRevenue = sales
    .filter(s => s.status === 'approved' || s.status === 'complete')
    .reduce((sum, s) => sum + s.amount, 0);

  const totalSalesCount = sales.filter(s => s.status === 'approved' || s.status === 'complete').length;
  const connectedCount = connectors.filter(c => c.status === 'CONNECTED').length;

  return (
    <div className="space-y-8 bg-slate-950 p-6 rounded-2xl border border-slate-800 text-slate-100 font-sans" id="panel-connector-center">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Database className="text-indigo-500" /> Central de Conectores Externos
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Publique infoprodutos da AI Business Factory diretamente no Hotmart, Kiwify, Eduzz, Monetizze e Braip.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchAllData}
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all"
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Atualizar
          </button>
          <button
            onClick={handleForceSync}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/10"
            disabled={syncing}
          >
            <RefreshCw size={15} className={syncing ? "animate-spin" : ""} /> Sincronizar Tudo
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Erro de Comunicação</h4>
            <p className="text-xs mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900/50 border border-slate-800/80 rounded-xl space-y-2">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex justify-between items-center">
            Receita Integrada <DollarSign size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-white">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div className="text-xs text-emerald-400 flex items-center gap-1">
            <Zap size={10} /> 100% Sincronizado por IA
          </div>
        </div>

        <div className="p-5 bg-slate-900/50 border border-slate-800/80 rounded-xl space-y-2">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex justify-between items-center">
            Vendas Sincronizadas <ShoppingBag size={16} className="text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalSalesCount} transações</div>
          <div className="text-xs text-indigo-400">Através de Webhooks oficiais</div>
        </div>

        <div className="p-5 bg-slate-900/50 border border-slate-800/80 rounded-xl space-y-2">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex justify-between items-center">
            Plataformas Ativas <Database size={16} className="text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{connectedCount} / 5</div>
          <div className="text-xs text-slate-500">Kiwify, Hotmart, Eduzz, Braip, Monetizze</div>
        </div>

        <div className="p-5 bg-slate-900/50 border border-slate-800/80 rounded-xl space-y-2">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex justify-between items-center">
            Produtos Publicados <Layers size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            {connectors.reduce((acc, c) => acc + (c.metrics?.productsPublished || 0), 0)} publicados
          </div>
          <div className="text-xs text-amber-500">Checkouts gerados de forma dinâmica</div>
        </div>
      </div>

      {/* Platforms Connectors Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers size={18} className="text-indigo-400" /> Plataformas de Venda Disponíveis
        </h3>

        {loading ? (
          <div className="py-12 flex justify-center items-center gap-3 text-slate-400">
            <RefreshCw className="animate-spin text-indigo-500" /> Carregando status das plataformas...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {connectors.map((conn) => {
              const isConnected = conn.status === 'CONNECTED';
              return (
                <div 
                  key={conn.id} 
                  className={`p-6 bg-slate-900 rounded-xl border transition-all ${
                    isConnected ? 'border-indigo-500/30' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center font-bold text-lg text-indigo-400 border border-indigo-500/20">
                        {conn.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{conn.name}</h4>
                        <span className="text-[10px] text-slate-500">API Connector v1.0</span>
                      </div>
                    </div>
                    {getStatusBadge(conn.status)}
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                    <div>
                      <span className="text-slate-500 block">Vendas</span>
                      <span className="font-bold text-slate-200">{conn.metrics?.totalSales || 0} aprovadas</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Faturamento</span>
                      <span className="font-bold text-emerald-400">R$ {conn.metrics?.totalRevenue?.toLocaleString('pt-BR') || '0,00'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2">
                    {isConnected ? (
                      <>
                        <button
                          onClick={() => handleDisconnect(conn.id)}
                          className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-semibold transition-all"
                        >
                          Desconectar
                        </button>
                        <span className="text-[10px] text-slate-500 shrink-0">
                          Sync: {conn.lastSync ? new Date(conn.lastSync).toLocaleTimeString() : 'Nunca'}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Configure as credenciais ao lado para ativar</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Operations Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left Side: Configure & Publish */}
        <div className="space-y-8">
          {/* Form 1: Connect Platform */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock size={16} className="text-indigo-400" /> Autenticar Nova Plataforma
            </h3>
            <p className="text-xs text-slate-400">
              Forneça um token com o prefixo apropriado para simular e autorizar as requisições API seguras.
            </p>

            <form onSubmit={handleConnect} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Plataforma</label>
                  <select
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="hotmart">Hotmart</option>
                    <option value="kiwify">Kiwify</option>
                    <option value="eduzz">Eduzz</option>
                    <option value="monetizze">Monetizze</option>
                    <option value="braip">Braip</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Filtro de Prefixo</label>
                  <span className="block px-3 py-2 bg-slate-950/60 border border-slate-800 text-slate-500 rounded-lg text-sm italic">
                    Deve iniciar com: {selectedProvider === 'hotmart' ? 'HOT-' : selectedProvider === 'kiwify' ? 'KIW-' : selectedProvider === 'eduzz' ? 'EDZ-' : selectedProvider === 'monetizze' ? 'MON-' : 'BRP-'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Access Token / API Key</label>
                <input
                  type="text"
                  placeholder={getTokenPlaceholder(selectedProvider)}
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                disabled={connectLoading}
              >
                {connectLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Conectando...
                  </>
                ) : (
                  <>
                    <Lock size={14} /> Ativar Conexão Segura
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Form 2: Publish Product */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UploadCloud size={16} className="text-amber-400" /> Publicar Infoproduto (Pipeline)
            </h3>
            <p className="text-xs text-slate-400">
              Transforme um projeto da Business Factory em um produto real publicado com link de checkout integrado.
            </p>

            <form onSubmit={handlePublish} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Selecionar Produto</label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {products.length === 0 ? (
                      <option value="">Nenhum produto cadastrado</option>
                    ) : (
                      products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (R$ {p.price})</option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Marketplace Destino</label>
                  <select
                    value={selectedMarketplace}
                    onChange={(e) => setSelectedMarketplace(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {connectors.map(c => (
                      <option key={c.id} value={c.id} disabled={c.status !== 'CONNECTED'}>
                        {c.name} {c.status !== 'CONNECTED' ? '(Offline)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                disabled={publishingLoading || products.length === 0}
              >
                {publishingLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Publicando no Marketplace...
                  </>
                ) : (
                  <>
                    <UploadCloud size={14} /> Despachar & Gerar Checkout
                  </>
                )}
              </button>
            </form>

            <AnimatePresence>
              {publishResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-xs space-y-2"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>🎉 Sucesso! Produto Publicado.</span>
                    <span className="font-mono text-[10px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-300">{publishResult.id}</span>
                  </div>
                  <p className="text-slate-300">
                    O pipeline de vendas gerou as páginas de conversão e configurou a oferta. Link de checkout ativo:
                  </p>
                  <a 
                    href={publishResult.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-1.5 text-amber-400 hover:underline font-semibold font-mono"
                  >
                    {publishResult.url} <ExternalLink size={12} />
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Webhook Simulator & Logs */}
        <div className="space-y-8">
          {/* Simulator Panel */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap size={16} className="text-emerald-400" /> Simulador Webhook de Vendas (Instantâneo)
            </h3>
            <p className="text-xs text-slate-400">
              Envie payloads de teste para verificar a integração do Finance Agent, alertas de CS e campanhas do Launch Agent.
            </p>

            <form onSubmit={handleSimulateWebhook} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Evento Webhook</label>
                  <select
                    value={simEvent}
                    onChange={(e: any) => setSimEvent(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="SALE_COMPLETED">SALE_COMPLETED (Venda Concluída)</option>
                    <option value="PAYMENT_PENDING">PAYMENT_PENDING (Boleto/Pix Gerado)</option>
                    <option value="PAYMENT_FAILED">PAYMENT_FAILED (Pagamento Recusado)</option>
                    <option value="REFUND_CREATED">REFUND_CREATED (Reembolso Solicitado)</option>
                    <option value="CUSTOMER_CREATED">CUSTOMER_CREATED (Lead Criado)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Canal do Marketplace</label>
                  <select
                    value={simProvider}
                    onChange={(e) => setSimProvider(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {connectors.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.status !== 'CONNECTED' ? '(Simulado)' : '(Ativo)'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">E-mail do Comprador</label>
                  <input
                    type="email"
                    value={simEmail}
                    onChange={(e) => setSimEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="comprador@exemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Valor da Transação (R$)</label>
                  <input
                    type="number"
                    value={simAmount}
                    onChange={(e) => setSimAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                disabled={simulating}
              >
                {simulating ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Disparando Evento...
                  </>
                ) : (
                  <>
                    <Send size={14} /> Disparar Webhook no Hub
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Interactive Logs */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                <Terminal size={16} className="text-slate-400" /> Console de Transição & Eventos
              </h3>
              <button 
                onClick={() => setSimLog([])} 
                className="text-[10px] text-slate-500 hover:text-slate-300"
              >
                Limpar
              </button>
            </div>
            
            <div className="h-44 overflow-y-auto bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-[10px] text-slate-400 space-y-2">
              {simLog.length === 0 ? (
                <div className="text-slate-600 italic">Aguardando eventos comerciais...</div>
              ) : (
                simLog.map((logLine, idx) => (
                  <div key={idx} className="border-b border-slate-900 pb-1 last:border-0">
                    <span className="text-indigo-400">{'>'} </span>{logLine}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* History of sales */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ShoppingBag size={18} className="text-emerald-400" /> Histórico de Transações Recentes Sincronizadas
        </h3>

        {sales.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500 italic">
            Nenhuma venda registrada até o momento no Hub de Connectores.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/20">
                  <th className="py-3 px-4">ID Transação</th>
                  <th className="py-3 px-4">Plataforma</th>
                  <th className="py-3 px-4">Comprador</th>
                  <th className="py-3 px-4">Valor Bruto</th>
                  <th className="py-3 px-4">Comissão</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sales.slice(-8).reverse().map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-950/40">
                    <td className="py-3 px-4 font-mono text-slate-300 text-[11px]">{sale.externalId}</td>
                    <td className="py-3 px-4 font-semibold text-slate-300 uppercase">{sale.provider}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">{sale.buyerReference}</td>
                    <td className="py-3 px-4 font-bold text-slate-200">R$ {sale.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4 text-slate-400">R$ {sale.commission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        sale.status === 'approved' || sale.status === 'complete' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : sale.status === 'refunded' 
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{new Date(sale.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
