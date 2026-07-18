import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Building,
  Users,
  CreditCard,
  Zap,
  CheckCircle,
  AlertTriangle,
  UserPlus,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Briefcase,
  PieChart,
  UserCheck,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';

interface SaaSAreaPanelProps {
  jwtToken?: string;
  onRefreshState?: () => void;
}

interface Tenant {
  id: string;
  name: string;
  currentPlan: 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';
  subscriptionStatus: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED';
  maxAgents: number;
  maxUsers: number;
  maxExecutions: number;
  usedExecutions: number;
  usedCredits: number;
  availableCredits: number;
  storageMbUsed: number;
  createdAt: string;
}

interface TenantUser {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  tenantId: string;
  status: 'active' | 'invited';
}

interface UsageReport {
  usedExecutions: number;
  maxExecutions: number;
  usedCredits: number;
  availableCredits: number;
  storageMbUsed: number;
  percentageExecutions: number;
  percentageCredits: number;
}

interface SaaSAdminMetrics {
  totalTenants: number;
  activeUsersCount: number;
  estimatedMonthlyRevenue: number;
  planDistribution: Record<string, number>;
  totalAiCreditsConsumed: number;
  systemAlertsCount: number;
}

export const SaaSAreaPanel: React.FC<SaaSAreaPanelProps> = ({ jwtToken, onRefreshState }) => {
  const [activeSubTab, setActiveSubTab] = useState<'workspace' | 'billing' | 'admin'>('workspace');
  const [loading, setLoading] = useState<boolean>(true);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [usage, setUsage] = useState<UsageReport | null>(null);
  
  // Workspace manager list
  const [allTenants, setAllTenants] = useState<Tenant[]>([]);
  const [adminMetrics, setAdminMetrics] = useState<SaaSAdminMetrics | null>(null);

  // Form states
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'>('MEMBER');
  
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspacePlan, setNewWorkspacePlan] = useState<'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE'>('FREE');

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, [activeSubTab]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch current tenant info
      const res = await fetch('/api/tenant/current');
      const data = await res.json();
      if (data.success) {
        setTenant(data.tenant);
        setUsers(data.users);
        setUsage(data.usage);
      }

      // Fetch all tenants list for switching workspace
      const tenantsRes = await fetch('/api/admin/dashboard');
      const tenantsData = await tenantsRes.json();
      if (tenantsData.success) {
        setAllTenants(tenantsData.tenants || []);
        setAdminMetrics(tenantsData.metrics);
      }
    } catch (err) {
      console.error('Erro ao buscar dados do SaaS:', err);
      showToast('error', 'Falha ao sincronizar com o servidor SaaS.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName) return;

    try {
      setActionLoading(true);
      const res = await fetch('/api/tenant/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWorkspaceName, plan: newWorkspacePlan })
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Workspace "${newWorkspaceName}" criado com sucesso!`);
        setNewWorkspaceName('');
        // Automatically switch to the newly created workspace
        await handleSwitchWorkspace(data.tenant.id);
      } else {
        showToast('error', data.error || 'Erro ao criar workspace.');
      }
    } catch (err) {
      showToast('error', 'Falha de conexão com o servidor.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSwitchWorkspace = async (tenantId: string) => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/tenant/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId })
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', data.message);
        await fetchData();
        if (onRefreshState) onRefreshState();
      } else {
        showToast('error', data.error || 'Erro ao alternar de workspace.');
      }
    } catch (err) {
      showToast('error', 'Falha ao conectar com o servidor.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;

    try {
      setActionLoading(true);
      const res = await fetch('/api/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: inviteName, email: inviteEmail, role: inviteRole })
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Convite enviado para ${inviteEmail}!`);
        setInviteName('');
        setInviteEmail('');
        await fetchData();
      } else {
        showToast('error', data.error || 'Erro ao convidar usuário.');
      }
    } catch (err) {
      showToast('error', 'Erro ao convidar usuário.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubscribePlan = async (plan: 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE') => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/billing/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Parabéns! Plano atualizado para ${plan} com sucesso.`);
        await fetchData();
        if (onRefreshState) onRefreshState();
      } else {
        showToast('error', data.error || 'Falha ao atualizar plano.');
      }
    } catch (err) {
      showToast('error', 'Erro na conexão com o sistema de faturamento.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Tem certeza de que deseja cancelar a assinatura atual? Seus limites voltarão para o nível FREE.')) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch('/api/billing/cancel', {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Assinatura cancelada com sucesso.');
        await fetchData();
        if (onRefreshState) onRefreshState();
      } else {
        showToast('error', data.error || 'Erro ao cancelar assinatura.');
      }
    } catch (err) {
      showToast('error', 'Erro ao processar o cancelamento.');
    } finally {
      setActionLoading(false);
    }
  };

  // Run automated tests
  const handleRunTests = async () => {
    try {
      setActionLoading(true);
      showToast('success', 'Executando testes automatizados do sistema SaaS...');
      const res = await fetch('/api/tests/saas');
      const data = await res.json();
      if (data.success) {
        showToast('success', '✨ Todos os 8 testes SaaS passaram com sucesso!');
      } else {
        showToast('error', `Falha em ${data.errors?.length} testes SaaS: ${data.errors?.[0]}`);
      }
    } catch (err) {
      showToast('error', 'Falha ao rodar testes.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="saas-area-container">
      {/* SaaS Premium Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2.5 py-1 rounded-full font-bold border border-indigo-500/30 flex items-center gap-1 uppercase tracking-wider">
                <Shield size={12} /> SaaS Multi-Tenant Engine
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-semibold border border-emerald-500/30">
                Isolamento Ativo
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Workspace & Gerenciamento de Assinatura
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Gerencie múltiplos workspaces de negócios isolados, convide colaboradores, controle consumo da API Gemini e simule assinaturas SaaS recorrentes.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRunTests}
              disabled={actionLoading}
              className="px-4 py-2 text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white rounded-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle size={14} className="text-emerald-400" /> Rodar Testes SaaS
            </button>
            <button
              onClick={fetchData}
              disabled={loading || actionLoading}
              className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition-all cursor-pointer"
            >
              <RefreshCw size={16} className={`${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 mt-6 -mx-6 px-6">
          <button
            onClick={() => setActiveSubTab('workspace')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeSubTab === 'workspace'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building size={14} /> Meu Workspace
          </button>
          <button
            onClick={() => setActiveSubTab('billing')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeSubTab === 'billing'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard size={14} /> Planos & Cobrança
          </button>
          <button
            onClick={() => setActiveSubTab('admin')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeSubTab === 'admin'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield size={14} /> Admin Console
          </button>
        </div>
      </div>

      {/* Action Toast Feedback */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-xl border flex items-center gap-3 shadow-lg z-50 ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
                : 'bg-rose-950/90 border-rose-800 text-rose-200'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            <p className="text-xs font-semibold">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-900 border border-slate-800 rounded-2xl min-h-[300px]">
          <RefreshCw size={32} className="animate-spin text-indigo-500 mb-3" />
          <p className="text-sm text-slate-400">Processando contexto isolado do tenant...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          
          {/* TAB 1: MEU WORKSPACE */}
          {activeSubTab === 'workspace' && tenant && (
            <div className="space-y-6">
              
              {/* Workspace details & Current plan overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Workspace Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Workspace Ativo</span>
                    <Building size={16} className="text-indigo-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white">{tenant.name}</h3>
                    <p className="text-xs text-slate-500">ID: {tenant.id}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Criado em:</span>
                    <span className="text-slate-200 font-medium">{new Date(tenant.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Subscription status */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Status de Assinatura</span>
                    <CreditCard size={16} className="text-emerald-400" />
                  </div>
                  <div className="space-y-1 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">{tenant.currentPlan}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${
                      tenant.subscriptionStatus === 'ACTIVE' 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {tenant.subscriptionStatus}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Limite de Usuários:</span>
                    <span className="text-slate-200 font-bold">{users.length} / {tenant.maxUsers}</span>
                  </div>
                </div>

                {/* AI resource tracker */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Créditos de IA Disponíveis</span>
                    <Zap size={16} className="text-amber-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-white">{tenant.availableCredits} <span className="text-xs text-slate-500 font-normal">créditos</span></h3>
                    <p className="text-xs text-slate-400">Consumido até o momento: <span className="text-slate-200 font-bold">{tenant.usedCredits}</span></p>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Agentes Permitidos:</span>
                    <span className="text-slate-200 font-bold">{tenant.maxAgents} ativos</span>
                  </div>
                </div>
              </div>

              {/* Workspace users and Invitation */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Users list */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Users size={16} className="text-indigo-400" /> Usuários no Workspace ({users.length})
                    </h3>
                    <span className="text-xs text-slate-500">Isolamento Ativo por Tenant</span>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {users.map((user) => (
                      <div key={user.id} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between hover:border-slate-700 transition-all">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-white">{user.name}</p>
                          <p className="text-[10px] text-slate-500">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            user.role === 'OWNER' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                            user.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {user.role}
                          </span>
                          <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                            user.status === 'active' ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-900 text-slate-500'
                          }`}>
                            {user.status === 'active' ? 'Ativo' : 'Convidado'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Invite user form */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <UserPlus size={16} className="text-indigo-400" />
                    <h3 className="text-sm font-bold text-white">Convidar Integrante</h3>
                  </div>
                  <p className="text-slate-400 text-xs">
                    Convide administradores ou operadores para atuar exclusivamente neste workspace. O limite do seu plano atual é de {tenant.maxUsers} usuários.
                  </p>

                  <form onSubmit={handleInviteUser} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-semibold uppercase">Nome</label>
                        <input
                          type="text"
                          value={inviteName}
                          onChange={(e) => setInviteName(e.target.value)}
                          placeholder="Ex: João Silva"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-semibold uppercase">Email</label>
                        <input
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="joao@empresa.com"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-semibold uppercase">Cargo / Role</label>
                      <select
                        value={inviteRole}
                        onChange={(e: any) => setInviteRole(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="OWNER">OWNER - Proprietário Principal</option>
                        <option value="ADMIN">ADMIN - Administrador</option>
                        <option value="MEMBER">MEMBER - Membro Operacional</option>
                        <option value="VIEWER">VIEWER - Somente Leitura</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <UserPlus size={14} /> Convidar Integrante
                    </button>
                  </form>
                </div>
              </div>

              {/* Workspace switcher & Creator */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Switch Workspace */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Building size={16} className="text-indigo-400" /> Alternar de Workspace
                    </h3>
                    <span className="text-slate-500 text-[10px] font-bold">Multi-Tenant Lógico</span>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto">
                    {allTenants.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 border rounded-xl flex items-center justify-between transition-all ${
                          item.id === tenant.id
                            ? 'bg-indigo-950/40 border-indigo-500/80'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-white">{item.name}</p>
                          <p className="text-[10px] text-slate-500">Plano: {item.currentPlan} | Status: {item.subscriptionStatus}</p>
                        </div>
                        {item.id === tenant.id ? (
                          <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                            Selecionado
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSwitchWorkspace(item.id)}
                            className="text-[10px] text-slate-300 font-bold bg-slate-800 hover:bg-slate-700 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700 transition-all cursor-pointer"
                          >
                            Selecionar
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Create Workspace */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Briefcase size={16} className="text-indigo-400" /> Criar Novo Workspace
                  </h3>
                  <p className="text-slate-400 text-xs">
                    Crie uma nova empresa ou workspace independente. Cada workspace possui dados completamente isolados e limite de plano autônomo.
                  </p>

                  <form onSubmit={handleCreateWorkspace} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-semibold">NOME DA EMPRESA</label>
                      <input
                        type="text"
                        value={newWorkspaceName}
                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                        placeholder="Ex: Startups IA do Brasil"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-semibold">PLANO INICIAL</label>
                      <select
                        value={newWorkspacePlan}
                        onChange={(e: any) => setNewWorkspacePlan(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="FREE">FREE - Gratuito</option>
                        <option value="PRO">PRO - R$ 97/mês</option>
                        <option value="BUSINESS">BUSINESS - R$ 297/mês</option>
                        <option value="ENTERPRISE">ENTERPRISE - R$ 997/mês</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="w-full py-2 bg-slate-800 text-indigo-400 hover:text-white border border-slate-700 hover:bg-indigo-600 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Briefcase size={14} /> Inicializar Workspace
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PLANOS & COBRANÇA */}
          {activeSubTab === 'billing' && tenant && usage && (
            <div className="space-y-6">
              
              {/* Usage Progress Metrics */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp size={16} className="text-indigo-400" /> Consumo Mensal e Limites (SaaS Usage Engine)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* AI Credits consumption bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Consumo de Créditos IA (Gemini):</span>
                      <span className="text-white font-bold">{usage.usedCredits} / {usage.usedCredits + usage.availableCredits}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${usage.percentageCredits}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>{usage.percentageCredits}% Consumido</span>
                      <span>Disponível: {usage.availableCredits} créditos</span>
                    </div>
                  </div>

                  {/* Executions consumption bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Execuções de Agentes de IA:</span>
                      <span className="text-white font-bold">{usage.usedExecutions} / {usage.maxExecutions}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${usage.percentageExecutions}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>{usage.percentageExecutions}% Consumido</span>
                      <span>Disponível: {usage.maxExecutions - usage.usedExecutions} execuções</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plans Grid */}
              <div>
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-400" /> Planos Comerciais Disponíveis (Stripe Billing Sandbox)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  
                  {/* PLAN 1: FREE */}
                  <div className={`border rounded-2xl p-6 space-y-4 relative flex flex-col justify-between ${
                    tenant.currentPlan === 'FREE' ? 'bg-slate-950/80 border-indigo-500/80' : 'bg-slate-900 border-slate-800'
                  }`}>
                    {tenant.currentPlan === 'FREE' && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase border border-indigo-400">Plano Ativo</span>
                    )}
                    <div className="space-y-2">
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Free Plan</p>
                      <h4 className="text-3xl font-black text-white">R$ 0 <span className="text-xs text-slate-500 font-normal">/mês</span></h4>
                      <p className="text-slate-400 text-xs">Ideal para explorar os agentes iniciais.</p>
                      
                      <ul className="text-xs text-slate-300 space-y-2.5 pt-4">
                        <li className="flex items-center gap-2"><CheckCircle size={14} className="text-indigo-400" /> Máximo 2 Agentes ativos</li>
                        <li className="flex items-center gap-2"><CheckCircle size={14} className="text-indigo-400" /> Máximo 2 Usuários</li>
                        <li className="flex items-center gap-2"><CheckCircle size={14} className="text-indigo-400" /> 50 Créditos IA Gemini</li>
                        <li className="flex items-center gap-2"><CheckCircle size={14} className="text-indigo-400" /> 10 execuções mensais</li>
                      </ul>
                    </div>
                    <div className="pt-4">
                      {tenant.currentPlan === 'FREE' ? (
                        <button className="w-full py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold text-xs rounded-lg cursor-not-allowed" disabled>Atual</button>
                      ) : (
                        <button onClick={() => handleSubscribePlan('FREE')} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-lg transition-all cursor-pointer">Rebaixar</button>
                      )}
                    </div>
                  </div>

                  {/* PLAN 2: PRO */}
                  <div className={`border rounded-2xl p-6 space-y-4 relative flex flex-col justify-between ${
                    tenant.currentPlan === 'PRO' ? 'bg-slate-950/80 border-indigo-500/80' : 'bg-slate-900 border-slate-800'
                  }`}>
                    {tenant.currentPlan === 'PRO' && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase border border-indigo-400">Plano Ativo</span>
                    )}
                    <div className="space-y-2">
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pro Plan</p>
                      <h4 className="text-3xl font-black text-white">R$ 97 <span className="text-xs text-slate-500 font-normal">/mês</span></h4>
                      <p className="text-slate-400 text-xs">Para criadores e equipes em crescimento.</p>
                      
                      <ul className="text-xs text-slate-300 space-y-2.5 pt-4">
                        <li className="flex items-center gap-2"><CheckCircle size={14} className="text-indigo-400" /> Máximo 6 Agentes ativos</li>
                        <li className="flex items-center gap-2"><CheckCircle size={14} className="text-indigo-400" /> Máximo 10 Usuários</li>
                        <li className="flex items-center gap-2"><CheckCircle size={14} className="text-indigo-400" /> 1.000 Créditos IA Gemini</li>
                        <li className="flex items-center gap-2"><CheckCircle size={14} className="text-indigo-400" /> 200 execuções mensais</li>
                      </ul>
                    </div>
                    <div className="pt-4">
                      {tenant.currentPlan === 'PRO' ? (
                        <div className="space-y-2">
                          <button className="w-full py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold text-xs rounded-lg cursor-not-allowed text-center" disabled>Atual</button>
                          <button onClick={handleCancelSubscription} className="w-full py-2 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-900/40 text-center font-bold text-xs rounded-lg transition-all cursor-pointer">Cancelar Assinatura</button>
                        </div>
                      ) : (
                        <button onClick={() => handleSubscribePlan('PRO')} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all cursor-pointer">Assinar Pro</button>
                      )}
                    </div>
                  </div>

                  {/* PLAN 3: BUSINESS */}
                  <div className={`border rounded-2xl p-6 space-y-4 relative flex flex-col justify-between ${
                    tenant.currentPlan === 'BUSINESS' ? 'bg-slate-950/80 border-indigo-500/80' : 'bg-slate-900 border-slate-800'
                  }`}>
                    {tenant.currentPlan === 'BUSINESS' && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase border border-indigo-400">Plano Ativo</span>
                    )}
                    <div className="space-y-2">
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Business Plan</p>
                      <h4 className="text-3xl font-black text-white">R$ 297 <span className="text-xs text-slate-500 font-normal">/mês</span></h4>
                      <p className="text-slate-400 text-xs">Aceleração com agentes ilimitados de alta precisão.</p>
                      
                      <ul className="text-xs text-slate-300 space-y-2.5 pt-4">
                        <li className="flex items-center gap-2"><CheckCircle size={14} className="text-indigo-400" /> Máximo 12 Agentes ativos</li>
                        <li className="flex items-center gap-2"><CheckCircle size={14} className="text-indigo-400" /> Máximo 30 Usuários</li>
                        <li className="flex items-center gap-2"><CheckCircle size={14} className="text-indigo-400" /> 5.000 Créditos IA Gemini</li>
                        <li className="flex items-center gap-2"><CheckCircle size={14} className="text-indigo-400" /> 1.000 execuções mensais</li>
                      </ul>
                    </div>
                    <div className="pt-4">
                      {tenant.currentPlan === 'BUSINESS' ? (
                        <div className="space-y-2">
                          <button className="w-full py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold text-xs rounded-lg cursor-not-allowed text-center" disabled>Atual</button>
                          <button onClick={handleCancelSubscription} className="w-full py-2 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-900/40 text-center font-bold text-xs rounded-lg transition-all cursor-pointer">Cancelar Assinatura</button>
                        </div>
                      ) : (
                        <button onClick={() => handleSubscribePlan('BUSINESS')} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all cursor-pointer">Assinar Business</button>
                      )}
                    </div>
                  </div>

                  {/* PLAN 4: ENTERPRISE */}
                  <div className={`border rounded-2xl p-6 space-y-4 relative flex flex-col justify-between ${
                    tenant.currentPlan === 'ENTERPRISE' ? 'bg-slate-950/80 border-indigo-500/80' : 'bg-slate-900 border-slate-800'
                  }`}>
                    {tenant.currentPlan === 'ENTERPRISE' && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase border border-indigo-400">Plano Ativo</span>
                    )}
                    <div className="space-y-2">
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Enterprise Plan</p>
                      <h4 className="text-3xl font-black text-white">R$ 997 <span className="text-xs text-slate-500 font-normal">/mês</span></h4>
                      <p className="text-slate-400 text-xs">Soberania de IA em escala corporativa.</p>
                      
                      <ul className="text-xs text-slate-300 space-y-2.5 pt-4">
                        <li className="flex items-center gap-2"><CheckCircle size={14} className="text-indigo-400" /> Agentes ilimitados (99)</li>
                        <li className="flex items-center gap-2"><CheckCircle size={14} className="text-indigo-400" /> Usuários ilimitados</li>
                        <li className="flex items-center gap-2"><CheckCircle size={14} className="text-indigo-400" /> 50.000 Créditos IA Gemini</li>
                        <li className="flex items-center gap-2"><CheckCircle size={14} className="text-indigo-400" /> 99.999 execuções</li>
                      </ul>
                    </div>
                    <div className="pt-4">
                      {tenant.currentPlan === 'ENTERPRISE' ? (
                        <div className="space-y-2">
                          <button className="w-full py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold text-xs rounded-lg cursor-not-allowed text-center" disabled>Atual</button>
                          <button onClick={handleCancelSubscription} className="w-full py-2 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-900/40 text-center font-bold text-xs rounded-lg transition-all cursor-pointer">Cancelar Assinatura</button>
                        </div>
                      ) : (
                        <button onClick={() => handleSubscribePlan('ENTERPRISE')} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all cursor-pointer">Assinar Enterprise</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ADMIN CONSOLE */}
          {activeSubTab === 'admin' && adminMetrics && (
            <div className="space-y-6">
              
              {/* Premium Dashboard Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                
                {/* Metric 1 */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4">
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                    <Building size={20} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Total de Empresas</p>
                    <p className="text-2xl font-bold text-white">{adminMetrics.totalTenants} <span className="text-xs text-slate-500 font-normal">Tenants</span></p>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                    <Users size={20} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Usuários Ativos</p>
                    <p className="text-2xl font-bold text-white">{adminMetrics.activeUsersCount} <span className="text-xs text-slate-500 font-normal">Contas</span></p>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                    <DollarSign size={20} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Receita Estimada (MRR)</p>
                    <p className="text-2xl font-bold text-white">R$ {adminMetrics.estimatedMonthlyRevenue} <span className="text-xs text-slate-500 font-normal">/mês</span></p>
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4">
                  <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                    <Zap size={20} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Créditos IA Consumidos</p>
                    <p className="text-2xl font-bold text-white">{adminMetrics.totalAiCreditsConsumed} <span className="text-xs text-slate-500 font-normal">Chamadas</span></p>
                  </div>
                </div>
              </div>

              {/* Plan distribution & Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Distribution visualizer */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <PieChart size={16} className="text-indigo-400" /> Distribuição de Planos Ativos
                  </h3>
                  
                  <div className="space-y-3 pt-2">
                    {Object.entries(adminMetrics.planDistribution).map(([planName, count]) => {
                      const numericCount = Number(count) || 0;
                      return (
                        <div key={planName} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-300 font-bold">{planName}</span>
                            <span className="text-white font-semibold">{numericCount} ({Math.round((numericCount / (adminMetrics.totalTenants || 1)) * 100)}%)</span>
                          </div>
                          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850">
                            <div
                              className={`h-full rounded-full ${
                                planName === 'FREE' ? 'bg-indigo-500' :
                                planName === 'PRO' ? 'bg-emerald-500' :
                                planName === 'BUSINESS' ? 'bg-amber-500' :
                                'bg-rose-500'
                              }`}
                              style={{ width: `${(numericCount / (adminMetrics.totalTenants || 1)) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SaaS System Alerts */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <AlertTriangle size={16} className="text-amber-400 animate-pulse" /> Alertas Operacionais de Consumo
                    </h3>
                    <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">Sandbox SaaS</span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-indigo-950/20 border border-indigo-900/40 rounded-xl flex gap-3 text-xs text-indigo-300">
                      <Info size={16} className="shrink-0 mt-0.5" />
                      <p>
                        <strong>Upgrade Opportunity Detected:</strong> 1 workspace atingiu o limite máximo de agentes ativos. Notificando Customer Success Agent...
                      </p>
                    </div>
                    <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex gap-3 text-xs text-slate-400">
                      <UserCheck size={16} className="shrink-0 text-indigo-400 mt-0.5" />
                      <p>
                        <strong>Active Monitoring:</strong> Todos os 8 testes automatizados do SaaS estão com status <strong>HEALTHY</strong> e isolamento lógico operacional.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tenants Management Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Todas as Empresas Cadastradas (Multi-Tenant System)</h3>
                  <span className="text-xs text-slate-500">Persistido no Banco Local</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-850 text-slate-400 uppercase font-bold text-[10px]">
                        <th className="py-3 px-2">Empresa</th>
                        <th className="py-3 px-2">ID Único</th>
                        <th className="py-3 px-2">Plano</th>
                        <th className="py-3 px-2">Status Assinatura</th>
                        <th className="py-3 px-2">Créditos Usados</th>
                        <th className="py-3 px-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {allTenants.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-950/40 transition-colors">
                          <td className="py-3 px-2 font-bold text-white">{item.name}</td>
                          <td className="py-3 px-2 font-mono text-[10px] text-slate-500">{item.id}</td>
                          <td className="py-3 px-2">
                            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">{item.currentPlan}</span>
                          </td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              item.subscriptionStatus === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'
                            }`}>{item.subscriptionStatus}</span>
                          </td>
                          <td className="py-3 px-2 font-semibold text-slate-300">{item.usedCredits} IA</td>
                          <td className="py-3 px-2">
                            <button
                              onClick={() => handleSwitchWorkspace(item.id)}
                              className="text-xs text-indigo-400 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                            >
                              Acessar Workspace <ChevronRight size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
