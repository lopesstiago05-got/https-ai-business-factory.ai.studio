import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Network, 
  Database, 
  Key, 
  RefreshCw, 
  Play, 
  Send, 
  UploadCloud, 
  DownloadCloud, 
  Terminal, 
  History, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  Clock, 
  Settings, 
  Search, 
  Filter, 
  Layers, 
  ShieldAlert,
  Sliders,
  Mail,
  CreditCard,
  ShoppingBag,
  MessageSquare,
  Cloud,
  FileCode,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const IntegrationPanel: React.FC = () => {
  // Dados principais vindos do backend
  const [connectors, setConnectors] = useState<any[]>([]);
  const [status, setStatus] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  
  // Mercado Pago Connector Specific States (Etapa 17A)
  const [mpStatus, setMpStatus] = useState<any>({
    connected: false,
    status: 'disconnected',
    lastSync: null,
    errors: null,
    metrics: { totalSales: 0, totalAmount: 0, eventsCount: 0 }
  });
  const [mpToken, setMpToken] = useState<string>('APP_USR-TEST-TOKEN-1234567890-SECRET');
  const [showMpTestLog, setShowMpTestLog] = useState<boolean>(false);
  const [mpTestLogText, setMpTestLogText] = useState<string>('');

  // Hotmart Connector Specific States (Etapa 17B)
  const [hotmartStatus, setHotmartStatus] = useState<any>({
    connected: false,
    status: 'disconnected',
    lastSync: null,
    errors: null,
    metrics: { totalSales: 0, totalAmount: 0, commissionEarned: 0, eventsCount: 0 }
  });
  const [hotmartToken, setHotmartToken] = useState<string>('HOT-TEST-TOKEN-123456-SECRET');
  const [showHotmartTestLog, setShowHotmartTestLog] = useState<boolean>(false);
  const [hotmartTestLogText, setHotmartTestLogText] = useState<string>('');
  
  // Estado local de UX
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedConnector, setSelectedConnector] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [operationMessage, setOperationMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'connectors' | 'jobs' | 'logs' | 'tokens' | 'webhooks'>('connectors');

  // Modal de conexão
  const [showConnectModal, setShowConnectModal] = useState<boolean>(false);
  const [connCredentials, setConnCredentials] = useState({
    authType: 'oauth2',
    accessToken: 'mock_tok_' + Math.random().toString(36).substring(7),
    clientSecret: 'mock_sec_' + Math.random().toString(36).substring(7),
    endpoint: 'https://api.external.com/v1',
    expiresIn: 3600
  });

  // Modal de simulação de webhook
  const [showWebhookModal, setShowWebhookModal] = useState<boolean>(false);
  const [webhookPayload, setWebhookPayload] = useState({
    event: 'order.payment.completed',
    customer: 'comprador@email.com',
    amount: 197.00,
    productId: 'prod_90a18',
    niche: 'Educação Financeira'
  });

  // Modal de transferência de arquivo
  const [showFileModal, setShowFileModal] = useState<boolean>(false);
  const [fileForm, setFileForm] = useState({
    action: 'upload' as 'upload' | 'download',
    filename: 'ebook_planejamento_financeiro.pdf',
    sizeBytes: 4194304,
    mimeType: 'application/pdf'
  });

  useEffect(() => {
    fetchAllData();
    fetchMPStatus();
    fetchHotmartStatus();

    const handleOAuthMessage = (event: MessageEvent) => {
      // Validar origem do AI Studio preview ou localhost
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        fetchMPStatus();
        fetchHotmartStatus();
        const providerName = event.data?.provider === 'hotmart' ? 'Hotmart' : 'Mercado Pago';
        showMsg('success', `Conectado com absoluto sucesso ao ${providerName} via OAuth real!`);
      }
    };
    window.addEventListener('message', handleOAuthMessage);

    const interval = setInterval(() => {
      fetchAllData();
      fetchMPStatus();
      fetchHotmartStatus();
    }, 3000); // Polling a cada 3s para dados de jobs e logs
    return () => {
      clearInterval(interval);
      window.removeEventListener('message', handleOAuthMessage);
    };
  }, []);

  const fetchMPStatus = async () => {
    try {
      const res = await fetch('/api/connectors/mercadopago/status');
      if (res.ok) {
        const data = await res.json();
        setMpStatus(data);
      }
    } catch (err) {
      console.error('Erro ao ler status do Mercado Pago:', err);
    }
  };

  const fetchHotmartStatus = async () => {
    try {
      const res = await fetch('/api/connectors/hotmart/status');
      if (res.ok) {
        const data = await res.json();
        setHotmartStatus(data);
      }
    } catch (err) {
      console.error('Erro ao ler status do Hotmart:', err);
    }
  };

  const fetchAllData = async () => {
    try {
      const [resConn, resStatus, resJobs, resLogs, resTokens, resWh] = await Promise.all([
        fetch('/api/integration/connectors'),
        fetch('/api/integration/status'),
        fetch('/api/integration/jobs'),
        fetch('/api/integration/logs'),
        fetch('/api/integration/tokens'),
        fetch('/api/integration/webhooks')
      ]);

      if (resConn.ok) setConnectors(await resConn.json());
      if (resStatus.ok) setStatus(await resStatus.json());
      if (resJobs.ok) setJobs(await resJobs.json());
      if (resLogs.ok) setLogs(await resLogs.json());
      if (resTokens.ok) setTokens(await resTokens.json());
      if (resWh.ok) setWebhooks(await resWh.json());
    } catch (err) {
      console.error('Erro ao ler dados do Integration Agent:', err);
    }
  };

  const showMsg = (type: 'success' | 'error', text: string) => {
    setOperationMessage({ type, text });
    setTimeout(() => setOperationMessage(null), 5000);
  };

  // Triggers de API

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConnector) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/integration/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectorId: selectedConnector.id,
          credentials: connCredentials
        })
      });

      if (res.ok) {
        showMsg('success', `Sucesso ao sincronizar credenciais com ${selectedConnector.name}. Gateway ativo.`);
        setShowConnectModal(false);
        fetchAllData();
      } else {
        const data = await res.json();
        showMsg('error', data.error || 'Erro ao conectar plataforma.');
      }
    } catch (err: any) {
      showMsg('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async (connId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/integration/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectorId: connId })
      });

      if (res.ok) {
        showMsg('success', `Plataforma ${connId} foi desconectada e as credenciais foram limpas dos segredos.`);
        fetchAllData();
      } else {
        const data = await res.json();
        showMsg('error', data.error || 'Erro ao desconectar.');
      }
    } catch (err: any) {
      showMsg('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Triggers do Mercado Pago (Etapa 17A)
  const handleMPOAuthConnect = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/connectors/mercadopago/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.success && data.url) {
        const width = 600;
        const height = 750;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        
        const authWindow = window.open(
          data.url,
          'oauth_popup',
          `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
        );

        if (!authWindow) {
          showMsg('error', 'Popup bloqueado. Por favor, libere popups no seu navegador.');
        }
      } else {
        showMsg('error', 'Falha ao obter URL de autenticação.');
      }
    } catch (err: any) {
      showMsg('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHotmartOAuthConnect = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/connectors/hotmart/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.success && data.url) {
        const width = 600;
        const height = 750;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        
        const authWindow = window.open(
          data.url,
          'oauth_popup',
          `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
        );

        if (!authWindow) {
          showMsg('error', 'Popup bloqueado. Por favor, libere popups no seu navegador.');
        }
      } else {
        showMsg('error', 'Falha ao obter URL de autenticação.');
      }
    } catch (err: any) {
      showMsg('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMPConnect = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/connectors/mercadopago/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: mpToken })
      });
      const data = await res.json();
      if (data.success) {
        showMsg('success', 'Conectado com absoluto sucesso ao Mercado Pago. Credenciais salvas no cofre.');
        fetchMPStatus();
      } else {
        showMsg('error', data.error || 'Erro na conexão com Mercado Pago.');
      }
    } catch (err: any) {
      showMsg('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMPDisconnect = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/connectors/mercadopago/disconnect', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showMsg('success', 'Mercado Pago desconectado com sucesso. Credenciais revogadas.');
        fetchMPStatus();
      } else {
        showMsg('error', data.error || 'Erro ao desconectar.');
      }
    } catch (err: any) {
      showMsg('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMPTest = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/connectors/mercadopago/test', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showMsg('success', `Teste de comunicação OK! Latência: ${data.latencyMs}ms. ${data.message}`);
        fetchMPStatus();
      } else {
        showMsg('error', data.message || 'Falha no teste de comunicação.');
      }
    } catch (err: any) {
      showMsg('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMPSync = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/connectors/mercadopago/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showMsg('success', `Histórico sincronizado com sucesso! ${data.count} vendas importadas.`);
        fetchMPStatus();
      } else {
        showMsg('error', data.error || 'Erro ao sincronizar.');
      }
    } catch (err: any) {
      showMsg('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMPWebhookSimulate = async () => {
    setIsLoading(true);
    try {
      // Simular um webhook de produção
      const res = await fetch('/api/integration/mercadopago/webhook', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-signature': 'sha256=simulationSig12345'
        },
        body: JSON.stringify({
          id: `mp-sim-${Date.now()}`,
          amount: 297.00,
          status: 'approved',
          customer_email: 'cliente.simulado@faturamento.com',
          product_id: 'prod_90a18'
        })
      });
      const data = await res.json();
      if (data.success) {
        showMsg('success', `Disparo enviado! Pagamento de R$ 297.00 aprovado e integrado ao Finance Agent.`);
        fetchMPStatus();
      } else {
        showMsg('error', data.error || 'Erro na simulação.');
      }
    } catch (err: any) {
      showMsg('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMPRunSuite = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tests/mercadopago');
      const data = await res.json();
      setMpTestLogText(data.log || 'Sem log retornado.');
      setShowMpTestLog(true);
      if (data.success) {
        showMsg('success', 'Suíte de testes de qualidade passou com 100% de sucesso!');
      } else {
        showMsg('error', 'Alguns testes da suíte falharam. Verifique o log para detalhes.');
      }
      fetchMPStatus();
    } catch (err: any) {
      showMsg('error', 'Erro ao executar testes: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Triggers do Hotmart (Etapa 17B)
  const handleHotmartConnect = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/connectors/hotmart/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: hotmartToken })
      });
      const data = await res.json();
      if (data.success) {
        showMsg('success', 'Conectado com absoluto sucesso ao Hotmart. Credenciais salvas no cofre.');
        fetchHotmartStatus();
      } else {
        showMsg('error', data.error || 'Erro na conexão com Hotmart.');
      }
    } catch (err: any) {
      showMsg('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHotmartDisconnect = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/connectors/hotmart/disconnect', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showMsg('success', 'Hotmart desconectado com sucesso. Credenciais revogadas.');
        fetchHotmartStatus();
      } else {
        showMsg('error', data.error || 'Erro ao desconectar.');
      }
    } catch (err: any) {
      showMsg('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHotmartTest = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/connectors/hotmart/test', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showMsg('success', `Teste de comunicação OK! Latência: ${data.latencyMs}ms. ${data.message}`);
        fetchHotmartStatus();
      } else {
        showMsg('error', data.message || 'Falha no teste de comunicação.');
      }
    } catch (err: any) {
      showMsg('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHotmartSync = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/connectors/hotmart/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showMsg('success', `Histórico sincronizado com sucesso! ${data.count} vendas importadas.`);
        fetchHotmartStatus();
      } else {
        showMsg('error', data.error || 'Erro ao sincronizar.');
      }
    } catch (err: any) {
      showMsg('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHotmartWebhookSimulate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/integration/hotmart/webhook', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-signature': 'sha255=simulationSigHotmart12345'
        },
        body: JSON.stringify({
          id: `hot-sim-${Date.now()}`,
          amount: 497.00,
          commission: 49.70,
          event: 'PURCHASE_APPROVED',
          buyer_email: 'afiliado.mestre@factory.com',
          product_id: 'curso-automacao-ia-escala'
        })
      });
      const data = await res.json();
      if (data.success) {
        showMsg('success', `Disparo enviado! Venda de R$ 497.00 (Comissão R$ 49.70) processada com sucesso no Finance Agent.`);
        fetchHotmartStatus();
      } else {
        showMsg('error', data.error || 'Erro na simulação.');
      }
    } catch (err: any) {
      showMsg('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHotmartRunSuite = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tests/hotmart');
      const data = await res.json();
      setHotmartTestLogText(data.log || 'Sem log retornado.');
      setShowHotmartTestLog(true);
      if (data.success) {
        showMsg('success', 'Suíte de testes de qualidade Hotmart passou com 100% de sucesso!');
      } else {
        showMsg('error', 'Alguns testes da suíte falharam. Verifique o log para detalhes.');
      }
      fetchHotmartStatus();
    } catch (err: any) {
      showMsg('error', 'Erro ao executar testes: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async (connId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/integration/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectorId: connId })
      });

      const data = await res.json();
      if (data.success) {
        showMsg('success', `Conector '${connId}' respondeu perfeitamente em ${data.latencyMs}ms.`);
        fetchAllData();
      } else {
        showMsg('error', `Falha de latência em '${connId}': ${data.message}`);
      }
    } catch (err: any) {
      showMsg('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSync = async (connId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/integration/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectorId: connId, entityName: 'leads' })
      });

      if (res.ok) {
        showMsg('success', `Job de sincronização em fila com o Gateway. Execução assíncrona iniciada.`);
        fetchAllData();
      } else {
        const data = await res.json();
        showMsg('error', data.error || 'Erro ao agendar sync.');
      }
    } catch (err: any) {
      showMsg('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebhookSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConnector) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/integration/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectorId: selectedConnector.id,
          signature: 'valid',
          payload: webhookPayload
        })
      });

      if (res.ok) {
        showMsg('success', `Webhook aceito e integrado com o Kernel de agentes.`);
        setShowWebhookModal(false);
        fetchAllData();
      } else {
        const data = await res.json();
        showMsg('error', data.error || 'Erro ao processar Webhook.');
      }
    } catch (err: any) {
      showMsg('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConnector) return;

    setIsLoading(true);
    try {
      const url = fileForm.action === 'upload' ? '/api/integration/upload' : '/api/integration/download';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectorId: selectedConnector.id,
          filename: fileForm.filename,
          sizeBytes: fileForm.sizeBytes,
          mimeType: fileForm.mimeType
        })
      });

      if (res.ok) {
        showMsg('success', `Operação de ${fileForm.action.toUpperCase()} registrada no File Manager.`);
        setShowFileModal(false);
        fetchAllData();
      } else {
        const data = await res.json();
        showMsg('error', data.error || 'Erro na operação de arquivo.');
      }
    } catch (err: any) {
      showMsg('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtros de conectores
  const filteredConnectors = connectors.filter(c => {
    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'Todos', icon: Layers },
    { id: 'cloud', label: 'Cloud Storage', icon: Cloud },
    { id: 'docs', label: 'Documentos/Planilhas', icon: FileCode },
    { id: 'productivity', label: 'Produtividade/Emails', icon: Mail },
    { id: 'messaging', label: 'Mensageria', icon: MessageSquare },
    { id: 'payments', label: 'Pagamentos', icon: CreditCard },
    { id: 'e-commerce', label: 'E-commerce', icon: Globe },
    { id: 'marketing', label: 'Marketing/Ads', icon: Play },
    { id: 'social', label: 'Redes Sociais', icon: Globe },
    { id: 'dev', label: 'Desenvolvimento/APIs', icon: Terminal }
  ];

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'connected':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">● Conectado</span>;
      case 'error':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center gap-1">● Erro</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-500 border border-slate-500/20 flex items-center gap-1">○ Inativo</span>;
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 p-1">
      {/* Mensagem de Feedback Flutuante */}
      <AnimatePresence>
        {operationMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-xl text-xs font-semibold ${
              operationMessage.type === 'success' 
                ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/90 border-rose-500/30 text-rose-300'
            }`}
          >
            {operationMessage.type === 'success' ? <CheckCircle size={14} /> : <ShieldAlert size={14} />}
            <span>{operationMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header com Contexto */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Network className="text-indigo-500 w-6 h-6 animate-pulse" />
            Central de Integrações Externas (Integration Agent)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gerenciamento completo e seguro de conexões em nuvem, pagamentos, arquivos, webhooks, campanhas e emails através do Kernel Central.
          </p>
        </div>
        
        {/* Status de Conexão Geral */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <Globe className="text-sky-500 w-4 h-4 animate-spin" />
            <span>Gateway Central: <strong className="text-emerald-500">ONLINE</strong></span>
          </div>
        </div>
      </div>

      {/* Dashboard de Métricas e KPIs */}
      {status && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Layers size={18} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Conectores Ativos</p>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {status.connectors.connected} <span className="text-xs font-normal text-slate-400">/ {status.connectors.total}</span>
              </h4>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Requisições Gateway</p>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {status.metrics.totalRequests} <span className="text-xs font-normal text-emerald-400">({status.metrics.successRate}%)</span>
              </h4>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Média Latência</p>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {status.metrics.averageLatencyMs} <span className="text-xs font-normal text-slate-400">ms</span>
              </h4>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-3">
            <div className="p-3 rounded-xl bg-sky-500/10 text-sky-500">
              <Sliders size={18} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Jobs em Execução</p>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {status.jobs.pending + status.jobs.running} <span className="text-xs font-normal text-slate-400">pendentes</span>
              </h4>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tabs de Navegação Interna */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveSubTab('connectors')}
          className={`px-4 py-2 font-bold border-b-2 flex items-center gap-1.5 transition-all ${
            activeSubTab === 'connectors' 
              ? 'border-indigo-600 text-indigo-600 dark:text-white' 
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Globe size={13} />
          Catálogo de Conectores (37)
        </button>

        <button
          onClick={() => setActiveSubTab('jobs')}
          className={`px-4 py-2 font-bold border-b-2 flex items-center gap-1.5 transition-all ${
            activeSubTab === 'jobs' 
              ? 'border-indigo-600 text-indigo-600 dark:text-white' 
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Clock size={13} />
          Fila de Execuções e Jobs ({jobs.length})
        </button>

        <button
          onClick={() => setActiveSubTab('webhooks')}
          className={`px-4 py-2 font-bold border-b-2 flex items-center gap-1.5 transition-all ${
            activeSubTab === 'webhooks' 
              ? 'border-indigo-600 text-indigo-600 dark:text-white' 
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Database size={13} />
          Inbound Webhooks ({webhooks.length})
        </button>

        <button
          onClick={() => setActiveSubTab('tokens')}
          className={`px-4 py-2 font-bold border-b-2 flex items-center gap-1.5 transition-all ${
            activeSubTab === 'tokens' 
              ? 'border-indigo-600 text-indigo-600 dark:text-white' 
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Key size={13} />
          Cofre de Segredos (Tokens)
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          className={`px-4 py-2 font-bold border-b-2 flex items-center gap-1.5 transition-all ${
            activeSubTab === 'logs' 
              ? 'border-indigo-600 text-indigo-600 dark:text-white' 
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Terminal size={13} />
          Logs de Eventos Auditoria ({logs.length})
        </button>
      </div>

      {/* RENDER VIEW: CATÁLOGO DE CONECTORES */}
      {activeSubTab === 'connectors' && (
        <div className="space-y-4">
          {/* Barra de Filtros e Busca */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between text-xs">
            {/* Quick Filters */}
            <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
              {categories.map(cat => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl border font-semibold flex items-center gap-1.5 transition-all ${
                      categoryFilter === cat.id
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Icon size={12} />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Busca */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Buscar conector..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white"
              />
              <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
            </div>
          </div>

          {/* Grid de Conectores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(categoryFilter === 'all' || categoryFilter === 'payments') && (
              <div 
                className={`bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border rounded-3xl p-5 flex flex-col justify-between transition-all hover:shadow-lg relative overflow-hidden ${
                  mpStatus.status === 'connected' 
                    ? 'border-emerald-500/30 shadow-emerald-500/5' 
                    : mpStatus.status === 'error'
                    ? 'border-rose-500/30 shadow-rose-500/5'
                    : 'border-indigo-500/20 shadow-indigo-500/5'
                }`}
              >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -z-10" />

                <div>
                  {/* Header Card */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
                        PAGAMENTOS (PRODUÇÃO)
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5 flex items-center gap-1.5">
                        <CreditCard className="text-sky-500 w-4 h-4" />
                        Mercado Pago Connector
                      </h3>
                    </div>
                    {/* Status Badge */}
                    {mpStatus.status === 'connected' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                        ● Conectado
                      </span>
                    )}
                    {mpStatus.status === 'disconnected' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-500 border border-slate-500/20 flex items-center gap-1">
                        ○ Inativo
                      </span>
                    )}
                    {mpStatus.status === 'authenticating' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1 animate-pulse">
                        ⌛ Autenticando...
                      </span>
                    )}
                    {mpStatus.status === 'error' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center gap-1">
                        ● Falha
                      </span>
                    )}
                    {mpStatus.status === 'testing' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-500 border border-sky-500/20 flex items-center gap-1 animate-pulse">
                        ⚡ Testando...
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2">
                    ID: <span className="font-mono text-indigo-400">mercado_pago</span> • Auth: <span className="font-mono text-indigo-400 uppercase">access_token</span>
                  </p>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Conector de produção para recebimento de Pix e Cartão de Crédito. Totalmente integrado ao Event Bus do Kernel e ao Finance Agent.
                  </p>

                  {/* Mercado Pago Metrics if Connected */}
                  {mpStatus.status === 'connected' && (
                    <div className="mt-4 bg-slate-100/60 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 text-[11px] font-mono space-y-1.5 shadow-inner">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Vendas Aprovadas:</span>
                        <span className="text-slate-200 font-bold">{mpStatus.metrics.totalSales}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Faturamento Acumulado:</span>
                        <span className="text-emerald-500 font-bold">R$ {mpStatus.metrics.totalAmount.toFixed(2)}</span>
                      </div>
                      {mpStatus.lastSync && (
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-400">Último Sync:</span>
                          <span className="text-slate-400 truncate max-w-[130px]" title={mpStatus.lastSync}>
                            {new Date(mpStatus.lastSync).toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Credentials Form if Inactive or Error */}
                  {(mpStatus.status === 'disconnected' || mpStatus.status === 'error' || mpStatus.status === 'authenticating') && (
                    <div className="mt-4 space-y-2">
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Mercado Pago Access Token
                      </label>
                      <input
                        type="password"
                        placeholder="Ex: APP_USR-..."
                        value={mpToken}
                        disabled={isLoading}
                        onChange={(e) => setMpToken(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                      />
                      <p className="text-[9px] text-slate-400">
                        * O token deve começar com <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded text-indigo-400">APP_USR-</code>
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions Card Footer */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2 text-[10px]">
                  <div className="flex flex-wrap gap-2">
                    {!(mpStatus.status === 'connected' || mpStatus.status === 'testing') ? (
                      <div className="flex gap-2">
                        <button
                          onClick={handleMPConnect}
                          disabled={isLoading}
                          className="px-3 py-1.5 rounded-lg bg-slate-150 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer border border-slate-300 dark:border-slate-700"
                        >
                          <Key size={11} /> Token Manual
                        </button>
                        <button
                          onClick={handleMPOAuthConnect}
                          disabled={isLoading}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                        >
                          <Play size={11} /> Conectar via OAuth2 (Real)
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={handleMPTest}
                          disabled={isLoading}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw size={11} className={isLoading ? 'animate-spin' : ''} /> Testar Ping
                        </button>
                        <button
                          onClick={handleMPSync}
                          disabled={isLoading}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                        >
                          <Play size={11} /> Forçar Sync
                        </button>
                        <button
                          onClick={handleMPWebhookSimulate}
                          disabled={isLoading}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                        >
                          <Send size={11} /> Enviar Transação Real
                        </button>
                        <button
                          onClick={handleMPDisconnect}
                          disabled={isLoading}
                          className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/20 text-rose-300 font-bold transition-all cursor-pointer"
                        >
                          Desconectar
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* Quality Assurance Suite Trigger */}
                  <button
                    onClick={handleMPRunSuite}
                    disabled={isLoading}
                    className="w-full mt-2 px-3 py-2 rounded-xl bg-slate-900/40 border border-indigo-500/25 hover:bg-slate-900/80 text-indigo-300 font-bold flex items-center justify-center gap-1.5 transition-all text-[11px] cursor-pointer"
                  >
                    <Terminal size={12} className="text-emerald-400 animate-pulse" />
                    Executar Suíte de Testes (7 Testes)
                  </button>
                </div>
              </div>
            )}

            {(categoryFilter === 'all' || categoryFilter === 'payments') && (
              <div 
                className={`bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border rounded-3xl p-5 flex flex-col justify-between transition-all hover:shadow-lg relative overflow-hidden ${
                  hotmartStatus.status === 'connected' 
                    ? 'border-emerald-500/30 shadow-emerald-500/5' 
                    : hotmartStatus.status === 'error'
                    ? 'border-rose-500/30 shadow-rose-500/5'
                    : 'border-orange-500/20 shadow-orange-500/5'
                }`}
              >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl -z-10" />

                <div>
                  {/* Header Card */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-500 dark:text-orange-400">
                        INFOPRODUTOS & PAGAMENTOS (PRODUÇÃO)
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5 flex items-center gap-1.5">
                        <ShoppingBag className="text-orange-500 w-4 h-4" />
                        Hotmart Connector
                      </h3>
                    </div>
                    {/* Status Badge */}
                    {hotmartStatus.status === 'connected' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                        ● Conectado
                      </span>
                    )}
                    {hotmartStatus.status === 'disconnected' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-500 border border-slate-500/20 flex items-center gap-1">
                        ○ Inativo
                      </span>
                    )}
                    {hotmartStatus.status === 'authenticating' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1 animate-pulse">
                        ⌛ Autenticando...
                      </span>
                    )}
                    {hotmartStatus.status === 'error' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center gap-1">
                        ● Falha
                      </span>
                    )}
                    {hotmartStatus.status === 'testing' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-500 border border-sky-500/20 flex items-center gap-1 animate-pulse">
                        ⚡ Testando...
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2">
                    ID: <span className="font-mono text-indigo-400">hotmart</span> • Auth: <span className="font-mono text-indigo-400 uppercase">oauth2_token</span>
                  </p>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Conector oficial da Hotmart para rastrear vendas de infoprodutos, comissões de afiliados, reembolsos e assinaturas, propagando dados em tempo real para o Finance Agent.
                  </p>

                  {/* Hotmart Metrics if Connected */}
                  {hotmartStatus.status === 'connected' && (
                    <div className="mt-4 bg-slate-100/60 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 text-[11px] font-mono space-y-1.5 shadow-inner">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Vendas:</span>
                        <span className="text-slate-200 font-bold">{hotmartStatus.metrics.totalSales}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Faturamento Bruto:</span>
                        <span className="text-emerald-500 font-bold">R$ {hotmartStatus.metrics.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Comissões Pagas:</span>
                        <span className="text-rose-400 font-bold">R$ {hotmartStatus.metrics.commissionEarned.toFixed(2)}</span>
                      </div>
                      {hotmartStatus.lastSync && (
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-400">Último Sync:</span>
                          <span className="text-slate-400 truncate max-w-[130px]" title={hotmartStatus.lastSync}>
                            {new Date(hotmartStatus.lastSync).toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Credentials Form if Inactive or Error */}
                  {(hotmartStatus.status === 'disconnected' || hotmartStatus.status === 'error' || hotmartStatus.status === 'authenticating') && (
                    <div className="mt-4 space-y-2">
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Hotmart Access Token
                      </label>
                      <input
                        type="password"
                        placeholder="Ex: HOT-..."
                        value={hotmartToken}
                        disabled={isLoading}
                        onChange={(e) => setHotmartToken(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                      />
                      <p className="text-[9px] text-slate-400">
                        * O token deve começar com <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded text-indigo-400">HOT-</code>
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions Card Footer */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2 text-[10px]">
                  <div className="flex flex-wrap gap-2">
                    {!(hotmartStatus.status === 'connected' || hotmartStatus.status === 'testing') ? (
                      <div className="flex gap-2">
                        <button
                          onClick={handleHotmartConnect}
                          disabled={isLoading}
                          className="px-3 py-1.5 rounded-lg bg-slate-150 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer border border-slate-300 dark:border-slate-700"
                        >
                          <Key size={11} /> Token Manual
                        </button>
                        <button
                          onClick={handleHotmartOAuthConnect}
                          disabled={isLoading}
                          className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                        >
                          <Play size={11} /> Conectar via OAuth2 (Real)
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={handleHotmartTest}
                          disabled={isLoading}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw size={11} className={isLoading ? 'animate-spin' : ''} /> Testar Ping
                        </button>
                        <button
                          onClick={handleHotmartSync}
                          disabled={isLoading}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                        >
                          <Play size={11} /> Forçar Sync
                        </button>
                        <button
                          onClick={handleHotmartWebhookSimulate}
                          disabled={isLoading}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                        >
                          <Send size={11} /> Enviar Transação Real
                        </button>
                        <button
                          onClick={handleHotmartDisconnect}
                          disabled={isLoading}
                          className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/20 text-rose-300 font-bold transition-all cursor-pointer"
                        >
                          Desconectar
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* Quality Assurance Suite Trigger */}
                  <button
                    onClick={handleHotmartRunSuite}
                    disabled={isLoading}
                    className="w-full mt-2 px-3 py-2 rounded-xl bg-slate-900/40 border border-orange-500/25 hover:bg-slate-900/80 text-orange-300 font-bold flex items-center justify-center gap-1.5 transition-all text-[11px] cursor-pointer"
                  >
                    <Terminal size={12} className="text-emerald-400 animate-pulse" />
                    Executar Suíte de Testes (7 Testes)
                  </button>
                </div>
              </div>
            )}

            {filteredConnectors.map(c => {
              const isConn = c.status === 'connected';
              const isErr = c.status === 'error';
              return (
                <div 
                  key={c.id} 
                  className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-md ${
                    isConn 
                      ? 'border-emerald-500/20 dark:border-emerald-500/10 hover:border-emerald-500/30' 
                      : isErr
                      ? 'border-rose-500/20 dark:border-rose-500/10 hover:border-rose-500/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-350'
                  }`}
                >
                  <div>
                    {/* Header Card */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-950 text-slate-500">
                          {c.category}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5 flex items-center gap-1.5">
                          {c.name}
                        </h3>
                      </div>
                      {getStatusBadge(c.status)}
                    </div>

                    <p className="text-[11px] text-slate-400 mt-2">
                      ID: <span className="font-mono">{c.id}</span> • Auth: <span className="font-mono text-indigo-400 uppercase">{c.configJson?.authType}</span>
                    </p>

                    {/* Dados de Conexão se Ativo */}
                    {isConn && (
                      <div className="mt-4 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-900 text-[11px] font-mono space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Latência:</span>
                          <span className="text-emerald-500 font-bold">{c.latencyMs} ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Ativado Em:</span>
                          <span className="text-slate-300">Hoje</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Protocolo:</span>
                          <span className="text-slate-300 uppercase">{c.configJson?.authType}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Card */}
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 text-[10px]">
                    {!isConn ? (
                      <button
                        onClick={() => {
                          setSelectedConnector(c);
                          setShowConnectModal(true);
                        }}
                        disabled={isLoading}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all flex items-center gap-1 shadow-sm"
                      >
                        <Key size={11} /> Configurar Acesso
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleTestConnection(c.id)}
                          disabled={isLoading}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-all flex items-center gap-1"
                        >
                          <RefreshCw size={11} className={isLoading ? 'animate-spin' : ''} /> Testar Ping
                        </button>
                        <button
                          onClick={() => handleManualSync(c.id)}
                          disabled={isLoading}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all flex items-center gap-1 shadow-sm"
                        >
                          <Play size={11} /> Forçar Sinc
                        </button>
                        {c.category === 'cloud' && (
                          <button
                            onClick={() => {
                              setSelectedConnector(c);
                              setFileForm(prev => ({ ...prev, action: 'upload' }));
                              setShowFileModal(true);
                            }}
                            disabled={isLoading}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-all flex items-center gap-1"
                          >
                            <UploadCloud size={11} /> Transferir
                          </button>
                        )}
                        {c.category === 'dev' && (
                          <button
                            onClick={() => {
                              setSelectedConnector(c);
                              setShowWebhookModal(true);
                            }}
                            disabled={isLoading}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-all flex items-center gap-1"
                          >
                            <Send size={11} /> Disparar Webhook
                          </button>
                        )}
                        <button
                          onClick={() => handleDisconnect(c.id)}
                          disabled={isLoading}
                          className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/20 text-rose-300 font-bold transition-all"
                        >
                          Desconectar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RENDER VIEW: FILA DE JOBS */}
      {activeSubTab === 'jobs' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden p-6">
          <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Clock className="text-indigo-500" size={16} />
                Jobs e Fila de Comunicações Assíncronas
              </h3>
              <p className="text-[11px] text-slate-400">
                Acompanhe o estado das tarefas de sincronização e transferências gerenciadas pelo Integration Gateway.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                  <th className="pb-3 font-semibold">ID do Job</th>
                  <th className="pb-3 font-semibold">Conector</th>
                  <th className="pb-3 font-semibold">Tipo</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Tentativas</th>
                  <th className="pb-3 font-semibold">Criação</th>
                  <th className="pb-3 font-semibold">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Nenhum Job registrado no histórico da fila de integrações.
                    </td>
                  </tr>
                ) : (
                  jobs.map(job => (
                    <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                      <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">{job.id}</td>
                      <td className="py-3 font-mono text-indigo-400">{job.connectorId}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-950 font-bold text-[10px] text-slate-500 uppercase">
                          {job.type}
                        </span>
                      </td>
                      <td className="py-3">
                        {job.status === 'completed' && (
                          <span className="text-emerald-500 font-bold flex items-center gap-1">● Concluído</span>
                        )}
                        {job.status === 'pending' && (
                          <span className="text-amber-500 font-bold flex items-center gap-1 animate-pulse">● Pendente</span>
                        )}
                        {job.status === 'running' && (
                          <span className="text-indigo-400 font-bold flex items-center gap-1 animate-pulse">● Executando</span>
                        )}
                        {job.status === 'failed' && (
                          <span className="text-rose-500 font-bold flex items-center gap-1">● Falhou</span>
                        )}
                      </td>
                      <td className="py-3 font-mono">{job.attempts} / {job.maxAttempts}</td>
                      <td className="py-3 text-slate-400">{new Date(job.createdAt).toLocaleTimeString()}</td>
                      <td className="py-3 text-slate-400 font-mono text-[10px] truncate max-w-xs">
                        {job.status === 'completed' ? (
                          <span className="text-emerald-300">Sucesso. Ref: {job.resultJson?.gatewayTransactionId}</span>
                        ) : job.error ? (
                          <span className="text-rose-400">{job.error}</span>
                        ) : (
                          <span className="text-slate-500">Aguardando...</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDER VIEW: WEBHOOKS */}
      {activeSubTab === 'webhooks' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden p-6">
          <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Database className="text-indigo-500" size={16} />
                Inbound Webhooks (Roteamento de Eventos Externos)
              </h3>
              <p className="text-[11px] text-slate-400">
                Endpoints e webhooks configurados para receber dados transacionais, de marketing e de mídias de plataformas externas.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                  <th className="pb-3 font-semibold">ID do Webhook</th>
                  <th className="pb-3 font-semibold">Conector</th>
                  <th className="pb-3 font-semibold">Endpoint Relativo</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Eventos Recebidos</th>
                  <th className="pb-3 font-semibold">Último Evento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {webhooks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Nenhum webhook cadastrado de forma ativa. Use o botão 'Disparar Webhook' em conectores de categoria DEV para registrar o primeiro evento.
                    </td>
                  </tr>
                ) : (
                  webhooks.map(wh => (
                    <tr key={wh.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50 font-mono">
                      <td className="py-3 font-bold text-slate-900 dark:text-white">{wh.id}</td>
                      <td className="py-3 text-indigo-400">{wh.connectorId}</td>
                      <td className="py-3 text-slate-300 select-all">{wh.url}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          {wh.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3">{wh.processedEventsCount}</td>
                      <td className="py-3 text-slate-400">
                        {wh.lastEventReceivedAt ? new Date(wh.lastEventReceivedAt).toLocaleTimeString() : 'Nenhum'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDER VIEW: TOKENS / COFRE DE SEGREDOS */}
      {activeSubTab === 'tokens' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden p-6">
          <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Key className="text-indigo-500" size={16} />
                Cofre de Segredos Criptografados (Secret Storage)
              </h3>
              <p className="text-[11px] text-slate-400">
                Todos os tokens, chaves de API e chaves privadas Oauth 2.0 são encriptados localmente e nunca são expostos em texto limpo.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                  <th className="pb-3 font-semibold">Conector</th>
                  <th className="pb-3 font-semibold">Tipo de Autenticação</th>
                  <th className="pb-3 font-semibold">Access Token</th>
                  <th className="pb-3 font-semibold">Client Secret</th>
                  <th className="pb-3 font-semibold">Expira Em</th>
                  <th className="pb-3 font-semibold">Ambiente Externo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {tokens.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Nenhum token ou segredo registrado no momento. Conecte um conector para preencher o cofre.
                    </td>
                  </tr>
                ) : (
                  tokens.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                      <td className="py-3 font-bold text-indigo-400">{t.connectorId}</td>
                      <td className="py-3 text-slate-400 uppercase font-semibold">{t.tokenType}</td>
                      <td className="py-3 text-rose-400 font-bold text-[10px] select-all">
                        {t.accessTokenEncrypted || 'NULL'}
                      </td>
                      <td className="py-3 text-rose-400 text-[10px] select-all">
                        {t.clientSecretEncrypted || 'NULL'}
                      </td>
                      <td className="py-3 text-slate-400">
                        {t.expiresAt ? new Date(t.expiresAt).toLocaleTimeString() : 'Não Expira'}
                      </td>
                      <td className="py-3 text-slate-500 text-[11px] truncate max-w-xs">{t.endpoint || 'Produtivo Oficial'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDER VIEW: LOGS DE AUDITORIA */}
      {activeSubTab === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-300 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
                <Terminal className="text-indigo-400" size={16} />
                Logs de Tráfego do Central Gateway (Outbound & Inbound)
              </h3>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Rastreamento e auditoria em tempo real de latência, códigos de resposta HTTP e tráfego de cargas de integração.
              </p>
            </div>
          </div>

          <div className="space-y-3.5 max-h-[500px] overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-slate-500 py-6 text-center font-sans">Nenhum evento registrado no gateway central.</p>
            ) : (
              logs.map(log => {
                const isErr = log.type === 'error';
                const isSucc = log.type === 'success';
                return (
                  <div key={log.id} className="p-3 rounded-xl border border-slate-800 bg-slate-950/80 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                          isSucc ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                          isErr ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' :
                          'bg-indigo-500/15 text-indigo-400'
                        }`}>
                          {log.type}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                          log.direction === 'inbound' ? 'bg-sky-500/10 text-sky-400' : 'bg-purple-500/10 text-purple-400'
                        }`}>
                          {log.direction}
                        </span>
                        <span className="text-indigo-300 font-bold">{log.connectorId}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500">
                        <span>Latency: <strong className="text-amber-500">{log.latencyMs}ms</strong></span>
                        <span>HTTP {log.statusCode}</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono break-all">
                      <span className="text-slate-500 select-none">&gt;</span>
                      <strong className="text-slate-300">{log.method}</strong>
                      <span>{log.url}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-[10px]">
                      <div>
                        <span className="text-slate-500">Payload:</span>
                        <pre className="mt-1 p-1.5 rounded bg-slate-900 border border-slate-800 overflow-x-auto text-slate-400 leading-tight">
                          {log.requestBody}
                        </pre>
                      </div>
                      <div>
                        <span className="text-slate-500">Response:</span>
                        <pre className="mt-1 p-1.5 rounded bg-slate-900 border border-slate-800 overflow-x-auto text-slate-400 leading-tight">
                          {log.responseBody}
                        </pre>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* MODAL: CONFIGURAÇÃO DE SEGREDOS E CONEXÃO */}
      {showConnectModal && selectedConnector && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
              <Key size={18} className="text-indigo-500" />
              Conectar com {selectedConnector.name}
            </h3>
            <p className="text-[11px] text-slate-400 mb-5">
              Insira as credenciais seguras para autenticação. O Secret Manager criptografará essas chaves no banco local.
            </p>

            <form onSubmit={handleConnect} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1 uppercase text-[10px]">
                  Protocolo de Autenticação
                </label>
                <select
                  value={connCredentials.authType}
                  onChange={(e) => setConnCredentials(prev => ({ ...prev, authType: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="oauth2">OAuth 2.0 (Token de Acesso)</option>
                  <option value="apikey">Chave de API / Token Portador</option>
                  <option value="basic">Acesso Básico (Usuário e Senha)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1 uppercase text-[10px]">
                  Access Token / Client ID / Token de Autenticação
                </label>
                <input
                  type="text"
                  required
                  value={connCredentials.accessToken}
                  onChange={(e) => setConnCredentials(prev => ({ ...prev, accessToken: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1 uppercase text-[10px]">
                  Client Secret / Chave Secreta
                </label>
                <input
                  type="password"
                  value={connCredentials.clientSecret}
                  onChange={(e) => setConnCredentials(prev => ({ ...prev, clientSecret: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1 uppercase text-[10px]">
                  Servidor Externo URL (API Host)
                </label>
                <input
                  type="text"
                  required
                  value={connCredentials.endpoint}
                  onChange={(e) => setConnCredentials(prev => ({ ...prev, endpoint: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  Sincronizar Credenciais
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: SIMULAR WEBHOOK */}
      {showWebhookModal && selectedConnector && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
              <Send size={18} className="text-indigo-500" />
              Processar Inbound Webhook de {selectedConnector.name}
            </h3>
            <p className="text-[11px] text-slate-400 mb-5">
              Isto processa um payload real enviado por essa plataforma parceira ao nosso sistema. O Integration Agent validará a assinatura e publicará o evento de interesse no Kernel.
            </p>

            <form onSubmit={handleWebhookSimulate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1 uppercase text-[10px]">
                  Tipo de Evento Webhook
                </label>
                <select
                  value={webhookPayload.event}
                  onChange={(e) => setWebhookPayload(prev => ({ ...prev, event: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none"
                >
                  <option value="order.payment.completed">order.payment.completed (Pagamento de Venda Concluído)</option>
                  <option value="lead.form.submitted">lead.form.submitted (Formulário de Cadastro Submetido)</option>
                  <option value="issue.bug.created">issue.bug.created (Inconsistência de Bug Aberto)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1 uppercase text-[10px]">
                  E-mail do Cliente / Originador
                </label>
                <input
                  type="email"
                  required
                  value={webhookPayload.customer}
                  onChange={(e) => setWebhookPayload(prev => ({ ...prev, customer: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1 uppercase text-[10px]">
                    Valor (BRL)
                  </label>
                  <input
                    type="number"
                    required
                    value={webhookPayload.amount}
                    onChange={(e) => setWebhookPayload(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1 uppercase text-[10px]">
                    ID do Infoproduto Relacionado
                  </label>
                  <input
                    type="text"
                    required
                    value={webhookPayload.productId}
                    onChange={(e) => setWebhookPayload(prev => ({ ...prev, productId: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowWebhookModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  Processar Disparo Inbound
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: TRANSFERÊNCIA DE ARQUIVO */}
      {showFileModal && selectedConnector && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
              <UploadCloud size={18} className="text-indigo-500" />
              Transferência Segura de Arquivos ({selectedConnector.name})
            </h3>
            <p className="text-[11px] text-slate-400 mb-5">
              Simule a transferência, upload ou download criptografado de infoprodutos (PDF, Vídeos, ZIP, Imagens) com rastreamento de integridade MD5 e verificação de bytes.
            </p>

            <form onSubmit={handleFileTransfer} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1 uppercase text-[10px]">
                  Ação do File Manager
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="fileAction"
                      checked={fileForm.action === 'upload'}
                      onChange={() => setFileForm(prev => ({ ...prev, action: 'upload' }))}
                    />
                    Upload para Nuvem
                  </label>
                  <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="fileAction"
                      checked={fileForm.action === 'download'}
                      onChange={() => setFileForm(prev => ({ ...prev, action: 'download' }))}
                    />
                    Download da Nuvem
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1 uppercase text-[10px]">
                  Nome do Arquivo (Fábrica Lógica)
                </label>
                <input
                  type="text"
                  required
                  value={fileForm.filename}
                  onChange={(e) => setFileForm(prev => ({ ...prev, filename: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1 uppercase text-[10px]">
                    Tamanho (Bytes)
                  </label>
                  <input
                    type="number"
                    required
                    value={fileForm.sizeBytes}
                    onChange={(e) => setFileForm(prev => ({ ...prev, sizeBytes: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1 uppercase text-[10px]">
                    Mime Type
                  </label>
                  <input
                    type="text"
                    required
                    value={fileForm.mimeType}
                    onChange={(e) => setFileForm(prev => ({ ...prev, mimeType: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowFileModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  Agendar Transferência
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: MERCADO PAGO AUTOMATED TEST LOG CONSOLE (ETAPA 17A) */}
      {showMpTestLog && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="text-emerald-400" size={16} />
                Console de Testes de Qualidade Integrada (7 Testes)
              </h3>
              <button
                onClick={() => setShowMpTestLog(false)}
                className="text-slate-400 hover:text-white font-bold text-xs"
              >
                [Fechar]
              </button>
            </div>
            <pre className="w-full h-96 overflow-y-auto bg-slate-900/60 p-4 rounded-xl font-mono text-[11px] text-emerald-400 border border-slate-800 leading-relaxed scrollbar-thin">
              {mpTestLogText}
            </pre>
            <div className="pt-4 flex items-center justify-between text-xs border-t border-slate-850 mt-4 text-slate-400">
              <span>Auditor Técnico: AI Business Factory Kernel</span>
              <button
                onClick={() => setShowMpTestLog(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all"
              >
                Concluir Auditoria
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL: HOTMART AUTOMATED TEST LOG CONSOLE (ETAPA 17B) */}
      {showHotmartTestLog && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="text-emerald-400" size={16} />
                Console de Testes de Qualidade Integrada Hotmart (7 Testes)
              </h3>
              <button
                onClick={() => setShowHotmartTestLog(false)}
                className="text-slate-400 hover:text-white font-bold text-xs"
              >
                [Fechar]
              </button>
            </div>
            <pre className="w-full h-96 overflow-y-auto bg-slate-900/60 p-4 rounded-xl font-mono text-[11px] text-emerald-400 border border-slate-800 leading-relaxed scrollbar-thin">
              {hotmartTestLogText}
            </pre>
            <div className="pt-4 flex items-center justify-between text-xs border-t border-slate-850 mt-4 text-slate-400">
              <span>Auditor Técnico: AI Business Factory Kernel</span>
              <button
                onClick={() => setShowHotmartTestLog(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all"
              >
                Concluir Auditoria
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
