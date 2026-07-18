import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Network, 
  Database, 
  Key, 
  RefreshCw, 
  Play, 
  Send, 
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
  Shield,
  Activity,
  UserCheck,
  Check,
  X,
  AlertCircle,
  FileText,
  Presentation,
  CheckSquare,
  LogOut,
  FolderOpen,
  ArrowRight,
  Plus,
  LayoutGrid,
  FileSpreadsheet,
  Calendar,
  ListTodo,
  StickyNote,
  Users,
  Paperclip,
  UserPlus,
  Github,
  GitBranch,
  GitCommit,
  GitPullRequest
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { auth } from '../auth/firebase.ts';

export const IntegrationCenterPanel: React.FC = () => {
  const [connections, setConnections] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'connectors' | 'logs' | 'tests' | 'workspace' | 'github'>('connectors');

  // Google Workspace state
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [workspaceFiles, setWorkspaceFiles] = useState<any[]>([]);
  const [workspaceLogs, setWorkspaceLogs] = useState<string[]>([]);
  const [spreadsheetLink, setSpreadsheetLink] = useState<string>('');
  const [documentLink, setDocumentLink] = useState<string>('');
  const [presentationLink, setPresentationLink] = useState<string>('');
  const [formLink, setFormLink] = useState<string>('');
  const [createdFormId, setCreatedFormId] = useState<string>('');
  const [formResponses, setFormResponses] = useState<any[]>([]);
  const [googleSubTab, setGoogleSubTab] = useState<'drive' | 'sheets' | 'docs' | 'slides' | 'forms' | 'gmail' | 'calendar' | 'tasks' | 'keep' | 'picker' | 'contacts'>('drive');
  const [workspaceLoading, setWorkspaceLoading] = useState<{[key: string]: boolean}>({});

  // GitHub Workspace states
  const [githubStatus, setGithubStatus] = useState<any>({ connected: false, status: 'disconnected', metrics: { clonedRepos: 0, commitsMade: 0, activeWorkspaceFiles: 0 } });
  const [githubTokenInput, setGithubTokenInput] = useState<string>('');
  const [githubRepoUrl, setGithubRepoUrl] = useState<string>('https://github.com/lopess-tiago/product-release');
  const [githubBranch, setGithubBranch] = useState<string>('main');
  const [githubRepoName, setGithubRepoName] = useState<string>('meu-novo-ebook-ia');
  const [githubRepoDesc, setGithubRepoDesc] = useState<string>('Livro digital e landing page de vendas estruturada autonomamente.');
  const [githubIsPrivate, setGithubIsPrivate] = useState<boolean>(false);
  const [githubFiles, setGithubFiles] = useState<any[]>([]);
  const [githubLogs, setGithubLogs] = useState<string[]>([]);
  const [githubCommitRepo, setGithubCommitRepo] = useState<string>('meu-novo-ebook-ia');
  const [githubCommitMsg, setGithubCommitMsg] = useState<string>('feat: adiciona script de conversão de leads');
  const [githubCommitFile, setGithubCommitFile] = useState<string>('src/leadConverter.js');
  const [githubCommitContent, setGithubCommitContent] = useState<string>('// Conversor de leads com inteligência artificial\nfunction trackConversion(leadId) {\n  console.log("Conversão registrada: " + leadId);\n}');
  const [githubLoadingState, setGithubLoadingState] = useState<{[key: string]: boolean}>({});

  // Google Tasks states
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('Revisar campanhas de tráfego');
  const [newTaskNotes, setNewTaskNotes] = useState<string>('Analisar ROI, CTR e custo por lead nas campanhas do Meta Ads e Google Ads.');
  const [newTaskDue, setNewTaskDue] = useState<string>('');

  // Google Keep states
  const [keepNotes, setKeepNotes] = useState<any[]>([
    { id: 'keep-1', title: '💡 Ideias de Copywriting', content: 'Utilizar dor de escassez e ancoragem no primeiro lote. Focar em bônus exclusivos para os 100 primeiros compradores.', updatedAt: new Date().toISOString() },
    { id: 'keep-2', title: '🎯 Públicos Alvo', content: 'Público morno (visitantes do site nos últimos 30 dias) + Lookalike de compradores de produtos anteriores.', updatedAt: new Date().toISOString() }
  ]);
  const [newKeepTitle, setNewKeepTitle] = useState<string>('');
  const [newKeepContent, setNewKeepContent] = useState<string>('');

  // Google Picker / Drive Explorer states
  const [pickerFiles, setPickerFiles] = useState<any[]>([]);
  const [pickerSearch, setPickerSearch] = useState<string>('');
  const [selectedPickerFile, setSelectedPickerFile] = useState<any | null>(null);

  // Google Contacts states
  const [contacts, setContacts] = useState<any[]>([]);
  const [contactsSearch, setContactsSearch] = useState<string>('');
  const [newContactName, setNewContactName] = useState<string>('Tiago Lopes');
  const [newContactEmail, setNewContactEmail] = useState<string>('lopess.tiago05@gmail.com');
  const [newContactPhone, setNewContactPhone] = useState<string>('+55 11 99999-9999');

  // Gmail states
  const [emails, setEmails] = useState<any[]>([]);
  const [emailTo, setEmailTo] = useState<string>('lopess.tiago05@gmail.com');
  const [emailSubject, setEmailSubject] = useState<string>('AI Business Factory - Confirmação de Envio');
  const [emailBody, setEmailBody] = useState<string>('Olá,\n\nEste é um e-mail enviado automaticamente através da sua conexão de Gmail integrada à nossa inteligência artificial.');
  const [emailDraftId, setEmailDraftId] = useState<string>('');

  // Calendar states
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [calendarSummary, setCalendarSummary] = useState<string>('Alinhamento Estratégico do Novo Lote');
  const [calendarDescription, setCalendarDescription] = useState<string>('Reunião de kickoff e planejamento tático das campanhas de tráfego pago para o lançamento do lote do infoproduto.');
  const [calendarLocation, setCalendarLocation] = useState<string>('Google Meet (Gerado Automaticamente)');
  const [calendarStartTime, setCalendarStartTime] = useState<string>('2026-07-20T14:00');
  const [calendarEndTime, setCalendarEndTime] = useState<string>('2026-07-20T15:00');
  const [calendarCreatedEventId, setCalendarCreatedEventId] = useState<string>('');
  const [calendarCreatedEventLink, setCalendarCreatedEventLink] = useState<string>('');

  // Docs inputs
  const [docTitle, setDocTitle] = useState<string>('Briefing Estratégico do Novo Lote');
  const [docContent, setDocContent] = useState<string>('Este é um briefing do produto digital gerado pela inteligência artificial. Contém especificações de marketing, canais de aquisição e personas de alto potencial.');

  // Modal para outros conectores sem fluxo OAuth nativo
  const [showConnectModal, setShowConnectModal] = useState<boolean>(false);
  const [selectedProvider, setSelectedProvider] = useState<any | null>(null);
  const [manualCredentials, setManualCredentials] = useState<string>('');
  const [manualAccountName, setManualAccountName] = useState<string>('');

  // Estados de teste e logs
  const [testResults, setTestResults] = useState<any>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [operationMsg, setOperationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchConnections();
    fetchLogs();
    fetchGitHubStatus();
  }, []);

  // Escuta mensages do popup OAuth (postMessage)
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      // Validar origem do AI Studio preview ou localhost
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        fetchConnections();
        fetchLogs();
        fetchGitHubStatus();
        const providerName = event.data?.provider === 'hotmart' ? 'Hotmart' : 'Mercado Pago';
        showFeedback('success', `Conectado com sucesso ao ${providerName} via OAuth real!`);
      }
    };
    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setOperationMsg({ type, text });
    setTimeout(() => setOperationMsg(null), 5000);
  };

  const getHeaders = () => {
    const token = localStorage.getItem('factory_jwt_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  const fetchConnections = async () => {
    try {
      const res = await fetch('/api/integrations/connections', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        const conns = data.connections || [];
        setConnections(conns);

        // Restaura automaticamente a sessão do Google Workspace/Gmail se houver token ativo no Postgres
        const googleConn = conns.find((c: any) => 
          (c.provider === 'gmail' || c.provider === 'google_drive') && 
          c.status === 'connected' && 
          c.accessToken
        );
        if (googleConn && !googleToken) {
          setGoogleToken(googleConn.accessToken);
          setGoogleUser({
            email: googleConn.accountName || 'lopess.tiago05@gmail.com',
            displayName: googleConn.accountName ? googleConn.accountName.split('@')[0] : 'Usuário'
          } as any);
          addWorkspaceLog(`Conexão ativa do Google Workspace restaurada: ${googleConn.accountName}`);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar conexões:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/integrations/logs', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Erro ao buscar logs:', err);
    }
  };

  // GitHub Workspace handlers
  const addGithubLog = (msg: string) => {
    setGithubLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 49)]);
  };

  const fetchGitHubStatus = async () => {
    try {
      const res = await fetch('/api/integrations/github/status', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setGithubStatus(data);
        if (data.connected) {
          fetchGitHubFiles();
        }
      }
    } catch (err: any) {
      console.error('Erro ao buscar status do GitHub:', err);
    }
  };

  const fetchGitHubFiles = async () => {
    setGithubLoadingState(prev => ({ ...prev, files: true }));
    try {
      const res = await fetch('/api/integrations/github/workspace-files', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setGithubFiles(data.files || []);
      }
    } catch (err: any) {
      console.error('Erro ao buscar arquivos do GitHub:', err);
    } finally {
      setGithubLoadingState(prev => ({ ...prev, files: false }));
    }
  };

  const handleConnectGitHub = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!githubTokenInput.trim()) {
      showFeedback('error', 'Por favor, insira um token de acesso pessoal do GitHub.');
      return;
    }
    setGithubLoadingState(prev => ({ ...prev, connect: true }));
    addGithubLog('Iniciando autenticação com o token do GitHub...');
    try {
      const res = await fetch('/api/integrations/connect/github', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          credentials: githubTokenInput.trim(),
          category: 'dev',
          accountName: 'Desenvolvedor GitHub Principal'
        })
      });
      if (res.ok) {
        showFeedback('success', 'Conta do GitHub conectada com absoluto sucesso!');
        addGithubLog('Conexão estabelecida e token armazenado com criptografia no Secret Vault.');
        setGithubTokenInput('');
        fetchConnections();
        fetchLogs();
        fetchGitHubStatus();
      } else {
        const data = await res.json();
        showFeedback('error', data.error || 'Falha ao conectar conta do GitHub.');
      }
    } catch (err: any) {
      showFeedback('error', 'Erro ao conectar GitHub: ' + err.message);
    } finally {
      setGithubLoadingState(prev => ({ ...prev, connect: false }));
    }
  };

  const handleDisconnectGitHub = async () => {
    setGithubLoadingState(prev => ({ ...prev, disconnect: true }));
    addGithubLog('Solicitando revogação de credenciais do GitHub...');
    try {
      const res = await fetch('/api/integrations/disconnect/github', {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        showFeedback('success', 'Conexão com o GitHub removida com sucesso.');
        addGithubLog('Credenciais revogadas de forma permanente e segredos apagados do cofre.');
        fetchConnections();
        fetchLogs();
        fetchGitHubStatus();
        setGithubFiles([]);
      } else {
        showFeedback('error', 'Falha ao remover conexão.');
      }
    } catch (err: any) {
      showFeedback('error', 'Erro ao desconectar: ' + err.message);
    } finally {
      setGithubLoadingState(prev => ({ ...prev, disconnect: false }));
    }
  };

  const handleCloneRepo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!githubRepoUrl.trim()) {
      showFeedback('error', 'Insira uma URL de repositório válida.');
      return;
    }
    setGithubLoadingState(prev => ({ ...prev, clone: true }));
    addGithubLog(`Iniciando clone do repositório remoto: ${githubRepoUrl} [Branch: ${githubBranch}]...`);
    try {
      const res = await fetch('/api/integrations/github/clone', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          repoUrl: githubRepoUrl.trim(),
          branch: githubBranch.trim()
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          showFeedback('success', 'Repositório clonado e integrado com sucesso!');
          addGithubLog(`Sucesso: ${data.message}`);
          fetchGitHubStatus();
          fetchGitHubFiles();
          // Atualiza repositório selecionado para commit
          const extractedRepoName = githubRepoUrl.split('/').pop()?.replace('.git', '') || 'repo';
          setGithubCommitRepo(extractedRepoName);
        } else {
          showFeedback('error', data.message || 'Falha ao clonar.');
        }
      } else {
        const data = await res.json();
        showFeedback('error', data.error || 'Falha de comunicação na clonagem.');
      }
    } catch (err: any) {
      showFeedback('error', 'Erro ao clonar: ' + err.message);
    } finally {
      setGithubLoadingState(prev => ({ ...prev, clone: false }));
    }
  };

  const handleCreateRepo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!githubRepoName.trim()) {
      showFeedback('error', 'Insira o nome do repositório.');
      return;
    }
    setGithubLoadingState(prev => ({ ...prev, create: true }));
    addGithubLog(`Solicitando criação de novo repositório: ${githubRepoName}...`);
    try {
      const res = await fetch('/api/integrations/github/create-repo', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          repoName: githubRepoName.trim(),
          description: githubRepoDesc.trim(),
          isPrivate: githubIsPrivate
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          showFeedback('success', `Repositório criado: ${data.fullName || githubRepoName}`);
          addGithubLog(`Sucesso: ${data.message}. URL: ${data.repoUrl}`);
          fetchGitHubStatus();
          // Auto clone para o workspace
          setGithubRepoUrl(data.repoUrl || `https://github.com/developer/${githubRepoName}`);
        } else {
          showFeedback('error', data.message || 'Falha ao criar repositório.');
        }
      } else {
        const data = await res.json();
        showFeedback('error', data.error || 'Falha de comunicação.');
      }
    } catch (err: any) {
      showFeedback('error', 'Erro ao criar: ' + err.message);
    } finally {
      setGithubLoadingState(prev => ({ ...prev, create: false }));
    }
  };

  const handleCommitChanges = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!githubCommitRepo.trim() || !githubCommitFile.trim() || !githubCommitContent.trim()) {
      showFeedback('error', 'Por favor, preencha todos os campos do commit.');
      return;
    }
    setGithubLoadingState(prev => ({ ...prev, commit: true }));
    addGithubLog(`Preparando commit no repositório "${githubCommitRepo}" para arquivo "${githubCommitFile}"...`);
    try {
      const res = await fetch('/api/integrations/github/commit', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          repoName: githubCommitRepo.trim(),
          message: githubCommitMsg.trim(),
          files: [
            {
              path: githubCommitFile.trim(),
              content: githubCommitContent
            }
          ]
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          showFeedback('success', 'Commit e push efetuados com absoluto sucesso!');
          addGithubLog(`Sucesso: ${data.message}. Hash: ${data.commitHash}`);
          fetchGitHubStatus();
          fetchGitHubFiles();
        } else {
          showFeedback('error', data.message || 'Falha ao commitar.');
        }
      } else {
        const data = await res.json();
        showFeedback('error', data.error || 'Falha de comunicação no commit.');
      }
    } catch (err: any) {
      showFeedback('error', 'Erro ao commitar: ' + err.message);
    } finally {
      setGithubLoadingState(prev => ({ ...prev, commit: false }));
    }
  };

  // Logging do Workspace
  const addWorkspaceLog = (msg: string) => {
    setWorkspaceLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 49)]);
  };

  // Google Sign-In with combined scopes
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    addWorkspaceLog('Iniciando autenticação com o Google Workspace...');
    try {
      const provider = new GoogleAuthProvider();
      // Adicionando escopos solicitados pelo usuário
      provider.addScope('https://www.googleapis.com/auth/drive');
      provider.addScope('https://www.googleapis.com/auth/drive.file');
      provider.addScope('https://www.googleapis.com/auth/drive.metadata.readonly');
      provider.addScope('https://www.googleapis.com/auth/forms.body');
      provider.addScope('https://www.googleapis.com/auth/presentations');
      provider.addScope('https://www.googleapis.com/auth/spreadsheets');
      provider.addScope('https://www.googleapis.com/auth/documents');
      provider.addScope('https://mail.google.com/');
      provider.addScope('https://www.googleapis.com/auth/gmail.modify');
      provider.addScope('https://www.googleapis.com/auth/gmail.compose');
      provider.addScope('https://www.googleapis.com/auth/gmail.send');
      provider.addScope('https://www.googleapis.com/auth/calendar');
      provider.addScope('https://www.googleapis.com/auth/calendar.events');
      provider.addScope('https://www.googleapis.com/auth/tasks');
      provider.addScope('https://www.googleapis.com/auth/tasks.readonly');
      provider.addScope('https://www.googleapis.com/auth/contacts');
      provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential?.accessToken) {
        throw new Error('Não foi possível obter o token de acesso do Google.');
      }

      const token = credential.accessToken;
      const user = result.user;

      setGoogleToken(token);
      setGoogleUser(user);

      // Registra no banco Postgres a conexão para todos esses 10 serviços Google
      const googleServices = [
        { id: 'google_drive', category: 'storage' },
        { id: 'google_sheets', category: 'storage' },
        { id: 'google_docs', category: 'communication' },
        { id: 'google_slides', category: 'communication' },
        { id: 'google_forms', category: 'marketing' },
        { id: 'gmail', category: 'communication' },
        { id: 'google_calendar', category: 'communication' },
        { id: 'google_tasks', category: 'communication' },
        { id: 'google_contacts', category: 'communication' },
        { id: 'google_keep', category: 'communication' }
      ];

      for (const gs of googleServices) {
        await fetch(`/api/integrations/connect/${gs.id}`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            credentials: token,
            accountName: user.email || 'Conta Google Workspace',
            category: gs.category
          })
        });
      }

      addWorkspaceLog(`Autenticado como: ${user.displayName || user.email}`);
      addWorkspaceLog('Todos os 10 conectores Google Workspace (incluindo Gmail, Calendar, Tasks e Contacts) ativados e registrados no Postgres.');
      showFeedback('success', 'Google Workspace, Gmail, Calendar, Tasks e Contacts conectados com absoluto sucesso!');
      fetchConnections();
      fetchLogs();
      setActiveSubTab('workspace'); // Redireciona para o Playground interativo
    } catch (err: any) {
      console.error(err);
      addWorkspaceLog(`Falha na autenticação: ${err.message}`);
      showFeedback('error', `Falha na conexão Google: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleDisconnect = async () => {
    if (!window.confirm('Deseja realmente remover e revogar o token do Google Workspace de todos os serviços cadastrados no Postgres?')) return;
    
    setIsLoading(true);
    addWorkspaceLog('Revogando conexões do Google Workspace...');
    try {
      const googleServices = [
        'google_drive',
        'google_sheets',
        'google_docs',
        'google_slides',
        'google_forms',
        'gmail',
        'google_calendar',
        'google_tasks',
        'google_contacts',
        'google_keep'
      ];
      for (const gs of googleServices) {
        await fetch(`/api/integrations/disconnect/${gs}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
      }

      setGoogleToken(null);
      setGoogleUser(null);
      setWorkspaceFiles([]);
      setFormResponses([]);
      setEmails([]);
      setCalendarEvents([]);
      setTasks([]);
      setContacts([]);
      setPickerFiles([]);
      setSpreadsheetLink('');
      setDocumentLink('');
      setPresentationLink('');
      setFormLink('');
      setCalendarCreatedEventId('');
      setCalendarCreatedEventLink('');
      setSelectedPickerFile(null);
      
      addWorkspaceLog('Google Workspace desconectado e limpo com segurança.');
      showFeedback('success', 'Google Workspace desconectado de todos os canais.');
      fetchConnections();
      fetchLogs();
      setActiveSubTab('connectors');
    } catch (err: any) {
      addWorkspaceLog(`Erro ao desconectar: ${err.message}`);
      showFeedback('error', `Falha ao desconectar Google: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // DRIVE ACTIONS
  const handleListDriveFiles = async () => {
    if (!googleToken) return;
    setWorkspaceLoading(prev => ({ ...prev, driveList: true }));
    addWorkspaceLog('Iniciando consulta de arquivos do Google Drive...');
    try {
      const res = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=6&fields=files(id,name,mimeType,webViewLink)', {
        headers: { Authorization: `Bearer ${googleToken}` }
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setWorkspaceFiles(data.files || []);
      addWorkspaceLog(`Sucesso: ${data.files?.length || 0} arquivos listados do Drive.`);
    } catch (err: any) {
      addWorkspaceLog(`Erro ao listar arquivos: ${err.message}`);
      showFeedback('error', 'Falha ao buscar arquivos do Google Drive.');
    } finally {
      setWorkspaceLoading(prev => ({ ...prev, driveList: false }));
    }
  };

  const handleCreateBackupFolder = async () => {
    if (!googleToken) return;
    setWorkspaceLoading(prev => ({ ...prev, driveFolder: true }));
    addWorkspaceLog('Criando pasta de backup no Google Drive...');
    try {
      const res = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'AI Business Factory - Backups',
          mimeType: 'application/vnd.google-apps.folder'
        })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      addWorkspaceLog(`Sucesso! Pasta "AI Business Factory - Backups" criada. ID: ${data.id}`);
      showFeedback('success', 'Pasta de backup criada com sucesso!');
      handleListDriveFiles();
    } catch (err: any) {
      addWorkspaceLog(`Erro ao criar pasta: ${err.message}`);
      showFeedback('error', 'Falha ao criar pasta no Drive.');
    } finally {
      setWorkspaceLoading(prev => ({ ...prev, driveFolder: false }));
    }
  };

  const handleUploadBackupFile = async () => {
    if (!googleToken) return;
    setWorkspaceLoading(prev => ({ ...prev, driveUpload: true }));
    addWorkspaceLog('Enviando arquivo JSON de métricas para o Google Drive...');
    try {
      const metadata = {
        name: `factory_metrics_${Date.now()}.json`,
        mimeType: 'application/json'
      };
      
      const fileContent = JSON.stringify({
        appName: 'AI Business Factory',
        backupTime: new Date().toISOString(),
        metrics: {
          activeAgents: 14,
          productsCreated: 12,
          totalRevenue: 'R$ 254.500,00',
          totalProfit: 'R$ 180.200,00'
        }
      }, null, 2);

      const boundary = 'foo_bar_baz_multipart';
      const body = [
        `\r\n--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`,
        `\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${fileContent}`,
        `\r\n--${boundary}--`
      ].join('');

      const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      addWorkspaceLog(`Sucesso! Arquivo de métricas carregado com ID: ${data.id}`);
      showFeedback('success', 'Arquivo JSON de backup salvo no Drive!');
      handleListDriveFiles();
    } catch (err: any) {
      addWorkspaceLog(`Erro ao enviar arquivo: ${err.message}`);
      showFeedback('error', 'Falha ao carregar backup.');
    } finally {
      setWorkspaceLoading(prev => ({ ...prev, driveUpload: false }));
    }
  };

  // SHEETS ACTIONS
  const handleCreateSpreadsheet = async () => {
    if (!googleToken) return;
    setWorkspaceLoading(prev => ({ ...prev, sheetsCreate: true }));
    addWorkspaceLog('Criando nova Planilha no Google Sheets...');
    try {
      const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            title: 'Faturamento e Leads - AI Business Factory'
          }
        })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSpreadsheetLink(data.spreadsheetUrl);
      addWorkspaceLog(`Planilha criada com sucesso! URL: ${data.spreadsheetUrl}`);
      showFeedback('success', 'Planilha criada no Google Sheets!');
    } catch (err: any) {
      addWorkspaceLog(`Erro ao criar planilha: ${err.message}`);
      showFeedback('error', 'Falha ao criar planilha.');
    } finally {
      setWorkspaceLoading(prev => ({ ...prev, sheetsCreate: false }));
    }
  };

  const handleAppendSheetsData = async () => {
    if (!googleToken || !spreadsheetLink) {
      showFeedback('error', 'Por favor, crie ou abra uma planilha primeiro.');
      return;
    }
    const match = spreadsheetLink.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      showFeedback('error', 'ID de Planilha não identificado na URL.');
      return;
    }
    const spreadsheetId = match[1];

    setWorkspaceLoading(prev => ({ ...prev, sheetsAppend: true }));
    addWorkspaceLog('Anexando novos dados de faturamento e leads à Planilha...');
    try {
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Página1!A1:append?valueInputOption=USER_ENTERED`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          range: 'Página1!A1',
          majorDimension: 'ROWS',
          values: [
            ['Data', 'Produto Digital', 'Nicho', 'Faturamento (R$)', 'Status'],
            [new Date().toLocaleDateString('pt-BR'), 'E-book IA Avançada', 'Educação', '49.900,00', 'Liquidado'],
            [new Date().toLocaleDateString('pt-BR'), 'SaaS Business Builder Pro', 'Negócios', '125.000,00', 'Ativo'],
            [new Date().toLocaleDateString('pt-BR'), 'Mentoria IA Supervisor', 'Tecnologia', '80.000,00', 'Liquidado']
          ]
        })
      });
      if (!res.ok) throw new Error(await res.text());
      addWorkspaceLog('Dados de teste inseridos com sucesso na Página1 da planilha.');
      showFeedback('success', 'Dados anexados com sucesso!');
    } catch (err: any) {
      addWorkspaceLog(`Erro ao anexar dados: ${err.message}`);
      showFeedback('error', 'Falha ao preencher planilha.');
    } finally {
      setWorkspaceLoading(prev => ({ ...prev, sheetsAppend: false }));
    }
  };

  // DOCS ACTIONS
  const handleCreateDoc = async () => {
    if (!googleToken) return;
    setWorkspaceLoading(prev => ({ ...prev, docsCreate: true }));
    addWorkspaceLog(`Iniciando criação de documento "${docTitle}" no Google Docs...`);
    try {
      const res = await fetch('https://docs.googleapis.com/v1/documents', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: docTitle })
      });
      if (!res.ok) throw new Error(await res.text());
      const doc = await res.json();
      const docId = doc.documentId;
      const url = `https://docs.google.com/document/d/${docId}/edit`;
      setDocumentLink(url);
      addWorkspaceLog(`Google Doc criado! ID: ${docId}`);

      addWorkspaceLog('Inserindo conteúdo do briefing no documento...');
      const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: `${docContent}\n\nEste documento oficial foi gerado e estruturado automaticamente pela inteligência artificial da AI Business Factory em ${new Date().toLocaleString('pt-BR')}.`
              }
            }
          ]
        })
      });
      if (!updateRes.ok) throw new Error(await updateRes.text());
      addWorkspaceLog('Sucesso! Conteúdo formatado e inserido no Google Doc.');
      showFeedback('success', 'Documento criado e preenchido!');
    } catch (err: any) {
      addWorkspaceLog(`Erro ao criar documento: ${err.message}`);
      showFeedback('error', 'Falha ao criar Google Doc.');
    } finally {
      setWorkspaceLoading(prev => ({ ...prev, docsCreate: false }));
    }
  };

  // SLIDES ACTIONS
  const handleCreatePresentation = async () => {
    if (!googleToken) return;
    setWorkspaceLoading(prev => ({ ...prev, slidesCreate: true }));
    addWorkspaceLog('Criando deck de apresentação comercial no Google Slides...');
    try {
      const res = await fetch('https://slides.googleapis.com/v1/presentations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Pitch Comercial - AI Business Factory'
        })
      });
      if (!res.ok) throw new Error(await res.text());
      const pres = await res.json();
      const presId = pres.presentationId;
      const url = `https://docs.google.com/presentation/d/${presId}/edit`;
      setPresentationLink(url);
      addWorkspaceLog(`Apresentação criada! URL: ${url}`);

      addWorkspaceLog('Inserindo slides de faturamento, canais e diferenciais estratégicos...');
      const updateRes = await fetch(`https://slides.googleapis.com/v1/presentations/${presId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            {
              createSlide: {
                insertionIndex: 1,
                slideLayoutReference: { predefinedLayout: 'TITLE_AND_BODY' },
                placeholderIdMappings: [
                  {
                    layoutPlaceholder: { type: 'TITLE', index: 0 },
                    objectId: 'slide1_title_obj'
                  },
                  {
                    layoutPlaceholder: { type: 'BODY', index: 0 },
                    objectId: 'slide1_body_obj'
                  }
                ]
              }
            }
          ]
        })
      });
      
      addWorkspaceLog('Apresentação estruturada com sucesso no Google Slides.');
      showFeedback('success', 'Apresentação comercial gerada com sucesso!');
    } catch (err: any) {
      addWorkspaceLog(`Erro ao criar slides: ${err.message}`);
      showFeedback('error', 'Falha ao criar Google Slides.');
    } finally {
      setWorkspaceLoading(prev => ({ ...prev, slidesCreate: false }));
    }
  };

  // FORMS ACTIONS
  const handleCreateForm = async () => {
    if (!googleToken) return;
    setWorkspaceLoading(prev => ({ ...prev, formsCreate: true }));
    addWorkspaceLog('Criando formulário no Google Forms...');
    try {
      const res = await fetch('https://forms.googleapis.com/v1/forms', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          info: {
            title: 'Pesquisa de Satisfação de Clientes - AI Business Factory',
            documentTitle: 'Feedback Form'
          }
        })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setCreatedFormId(data.formId);
      setFormLink(data.responderUri);
      addWorkspaceLog(`Formulário criado! ID: ${data.formId}`);
      addWorkspaceLog(`URL Pública do formulário para respostas: ${data.responderUri}`);

      addWorkspaceLog('Adicionando perguntas de feedback e qualidade ao formulário...');
      const updateRes = await fetch(`https://forms.googleapis.com/v1/forms/${data.formId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            {
              createItem: {
                item: {
                  title: 'Como você avalia a facilidade de uso do nosso produto digital?',
                  questionItem: {
                    question: {
                      required: true,
                      choiceQuestion: {
                        type: 'RADIO',
                        options: [
                          { value: 'Excelente (5)' },
                          { value: 'Bom (4)' },
                          { value: 'Regular (3)' },
                          { value: 'Insatisfeito (2 ou menos)' }
                        ]
                      }
                    }
                  }
                },
                location: { index: 0 }
              }
            }
          ]
        })
      });
      if (!updateRes.ok) throw new Error(await updateRes.text());
      addWorkspaceLog('Formulário estruturado com absoluto sucesso no Google Forms.');
      showFeedback('success', 'Formulário criado e publicado!');
    } catch (err: any) {
      addWorkspaceLog(`Erro ao criar formulário: ${err.message}`);
      showFeedback('error', 'Falha ao criar formulário.');
    } finally {
      setWorkspaceLoading(prev => ({ ...prev, formsCreate: false }));
    }
  };

  const handleReadFormResponses = async () => {
    if (!googleToken || !createdFormId) {
      showFeedback('error', 'Por favor, crie um formulário primeiro utilizando o botão acima.');
      return;
    }
    setWorkspaceLoading(prev => ({ ...prev, formsResponses: true }));
    addWorkspaceLog('Consultando respostas e submissões recebidas do Google Forms...');
    try {
      const res = await fetch(`https://forms.googleapis.com/v1/forms/${createdFormId}/responses`, {
        headers: { Authorization: `Bearer ${googleToken}` }
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setFormResponses(data.responses || []);
      addWorkspaceLog(`Sucesso: ${data.responses?.length || 0} submissões de formulário localizadas.`);
      showFeedback('success', 'Respostas do Google Forms importadas com sucesso!');
    } catch (err: any) {
      addWorkspaceLog(`Erro ao ler respostas: ${err.message}`);
      showFeedback('error', 'Falha ao buscar respostas do formulário (nota: é necessário que o formulário contenha envios).');
    } finally {
      setWorkspaceLoading(prev => ({ ...prev, formsResponses: false }));
    }
  };

  // GMAIL ACTIONS
  const handleListEmails = async () => {
    if (!googleToken) return;
    setWorkspaceLoading(prev => ({ ...prev, gmailList: true }));
    addWorkspaceLog('Iniciando busca de e-mails recentes no Gmail...');
    try {
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5', {
        headers: { Authorization: `Bearer ${googleToken}` }
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const msgs = data.messages || [];
      
      if (msgs.length === 0) {
        setEmails([]);
        addWorkspaceLog('Nenhum e-mail encontrado na caixa de entrada.');
        return;
      }

      // Buscar detalhes para cada um
      const detailedEmails = await Promise.all(msgs.map(async (msg: any) => {
        const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
          headers: { Authorization: `Bearer ${googleToken}` }
        });
        if (!detailRes.ok) return { id: msg.id, snippet: 'Sem detalhes disponíveis' };
        const detailData = await detailRes.json();
        
        const headers = detailData.payload?.headers || [];
        const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '(Sem assunto)';
        const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || 'Desconhecido';
        const date = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || '';
        
        return {
          id: msg.id,
          snippet: detailData.snippet,
          subject,
          from,
          date
        };
      }));

      setEmails(detailedEmails);
      addWorkspaceLog(`Sucesso: ${detailedEmails.length} e-mails carregados e analisados com metadados completos.`);
      showFeedback('success', 'E-mails carregados com sucesso!');
    } catch (err: any) {
      console.error(err);
      addWorkspaceLog(`Erro ao carregar e-mails: ${err.message}`);
      showFeedback('error', 'Falha ao sincronizar e-mails do Gmail.');
    } finally {
      setWorkspaceLoading(prev => ({ ...prev, gmailList: false }));
    }
  };

  const handleSendEmail = async () => {
    if (!googleToken) return;
    if (!emailTo) {
      showFeedback('error', 'Por favor, informe o destinatário.');
      return;
    }
    setWorkspaceLoading(prev => ({ ...prev, gmailSend: true }));
    addWorkspaceLog(`Compondo e-mail para ${emailTo}...`);
    try {
      const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(emailSubject)))}?=`;
      const emailContent = [
        `To: ${emailTo}`,
        'Content-Type: text/plain; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${utf8Subject}`,
        '',
        emailBody
      ].join('\r\n');

      const encodedEmail = btoa(unescape(encodeURIComponent(emailContent)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: encodedEmail })
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      addWorkspaceLog(`Sucesso! E-mail enviado. ID da Mensagem: ${data.id}`);
      showFeedback('success', 'E-mail enviado com absoluto sucesso!');
      handleListEmails();
    } catch (err: any) {
      console.error(err);
      addWorkspaceLog(`Erro ao enviar e-mail: ${err.message}`);
      showFeedback('error', 'Falha ao enviar e-mail via Gmail.');
    } finally {
      setWorkspaceLoading(prev => ({ ...prev, gmailSend: false }));
    }
  };

  const handleCreateDraft = async () => {
    if (!googleToken) return;
    setWorkspaceLoading(prev => ({ ...prev, gmailDraft: true }));
    addWorkspaceLog('Criando rascunho de e-mail no Gmail...');
    try {
      const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(emailSubject)))}?=`;
      const emailContent = [
        `To: ${emailTo}`,
        'Content-Type: text/plain; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${utf8Subject}`,
        '',
        emailBody
      ].join('\r\n');

      const encodedEmail = btoa(unescape(encodeURIComponent(emailContent)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: { raw: encodedEmail }
        })
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setEmailDraftId(data.id);
      addWorkspaceLog(`Rascunho criado com sucesso! ID do Rascunho: ${data.id}`);
      showFeedback('success', 'Rascunho criado e salvo no Gmail!');
    } catch (err: any) {
      console.error(err);
      addWorkspaceLog(`Erro ao criar rascunho: ${err.message}`);
      showFeedback('error', 'Falha ao criar rascunho no Gmail.');
    } finally {
      setWorkspaceLoading(prev => ({ ...prev, gmailDraft: false }));
    }
  };

  // GOOGLE CALENDAR ACTIONS
  const handleListCalendarEvents = async () => {
    if (!googleToken) return;
    setWorkspaceLoading(prev => ({ ...prev, calendarList: true }));
    addWorkspaceLog('Iniciando busca de compromissos no Google Agenda...');
    try {
      const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=5&orderBy=startTime&singleEvents=true', {
        headers: { Authorization: `Bearer ${googleToken}` }
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setCalendarEvents(data.items || []);
      addWorkspaceLog(`Sucesso: ${data.items?.length || 0} eventos localizados no seu calendário.`);
      showFeedback('success', 'Agenda sincronizada com sucesso!');
    } catch (err: any) {
      console.error(err);
      addWorkspaceLog(`Erro ao carregar agenda: ${err.message}`);
      showFeedback('error', 'Falha ao sincronizar compromissos do Google Agenda.');
    } finally {
      setWorkspaceLoading(prev => ({ ...prev, calendarList: false }));
    }
  };

  const handleCreateCalendarEvent = async () => {
    if (!googleToken) return;
    setWorkspaceLoading(prev => ({ ...prev, calendarCreate: true }));
    addWorkspaceLog('Criando novo evento no Google Agenda com suporte a Google Meet...');
    try {
      const startIso = new Date(calendarStartTime).toISOString();
      const endIso = new Date(calendarEndTime).toISOString();

      const eventBody = {
        summary: calendarSummary,
        description: calendarDescription,
        location: calendarLocation,
        start: {
          dateTime: startIso,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo'
        },
        end: {
          dateTime: endIso,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo'
        },
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        }
      };

      const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventBody)
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setCalendarCreatedEventId(data.id);
      
      const meetLink = data.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === 'video')?.uri;
      if (meetLink) {
        setCalendarCreatedEventLink(meetLink);
        addWorkspaceLog(`Evento criado com link do Google Meet gerado: ${meetLink}`);
      } else {
        setCalendarCreatedEventLink(data.htmlLink || '');
        addWorkspaceLog(`Evento criado com sucesso! Link: ${data.htmlLink}`);
      }

      showFeedback('success', 'Evento de alinhamento agendado com sucesso no Google Agenda!');
      handleListCalendarEvents();
    } catch (err: any) {
      console.error(err);
      addWorkspaceLog(`Erro ao criar evento: ${err.message}`);
      showFeedback('error', 'Falha ao agendar evento no Google Agenda.');
    } finally {
      setWorkspaceLoading(prev => ({ ...prev, calendarCreate: false }));
    }
  };

  // GOOGLE TASKS ACTIONS
  const handleListTasks = async () => {
    if (!googleToken) return;
    setWorkspaceLoading(prev => ({ ...prev, tasksList: true }));
    addWorkspaceLog('Buscando tarefas do Google Tasks...');
    try {
      const res = await fetch('https://tasks.googleapis.com/v1/lists/@default/tasks', {
        headers: { Authorization: `Bearer ${googleToken}` }
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setTasks(data.items || []);
      addWorkspaceLog(`Tarefas sincronizadas: ${data.items?.length || 0} pendências encontradas.`);
    } catch (err: any) {
      console.error(err);
      addWorkspaceLog(`Erro ao listar tarefas: ${err.message}`);
      showFeedback('error', 'Falha ao sincronizar o Google Tasks.');
    } finally {
      setWorkspaceLoading(prev => ({ ...prev, tasksList: false }));
    }
  };

  const handleCreateTask = async () => {
    if (!googleToken) return;
    if (!newTaskTitle.trim()) {
      showFeedback('error', 'O título da tarefa é obrigatório.');
      return;
    }
    setWorkspaceLoading(prev => ({ ...prev, tasksCreate: true }));
    addWorkspaceLog(`Criando nova tarefa: ${newTaskTitle}...`);
    try {
      const body: any = {
        title: newTaskTitle,
        notes: newTaskNotes
      };
      if (newTaskDue) {
        body.due = new Date(newTaskDue).toISOString();
      }
      const res = await fetch('https://tasks.googleapis.com/v1/lists/@default/tasks', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(await res.text());
      addWorkspaceLog(`Tarefa criada com sucesso: "${newTaskTitle}"`);
      showFeedback('success', 'Nova tarefa adicionada ao seu Google Tasks!');
      setNewTaskTitle('');
      setNewTaskNotes('');
      setNewTaskDue('');
      handleListTasks();
    } catch (err: any) {
      console.error(err);
      addWorkspaceLog(`Erro ao criar tarefa: ${err.message}`);
      showFeedback('error', 'Falha ao adicionar tarefa.');
    } finally {
      setWorkspaceLoading(prev => ({ ...prev, tasksCreate: false }));
    }
  };

  // GOOGLE KEEP ACTIONS
  const handleCreateKeepNote = () => {
    if (!newKeepTitle.trim()) {
      showFeedback('error', 'O título da nota é obrigatório.');
      return;
    }
    const newNote = {
      id: `keep-${Date.now()}`,
      title: newKeepTitle,
      content: newKeepContent,
      updatedAt: new Date().toISOString()
    };
    setKeepNotes(prev => [newNote, ...prev]);
    addWorkspaceLog(`Nota criada no Google Keep (Sincronizada localmente): "${newKeepTitle}"`);
    showFeedback('success', 'Nota de briefing criada com sucesso!');
    setNewKeepTitle('');
    setNewKeepContent('');
  };

  const handleDeleteKeepNote = (id: string) => {
    if (!window.confirm('Deseja realmente remover esta nota?')) return;
    setKeepNotes(prev => prev.filter(n => n.id !== id));
    addWorkspaceLog('Nota removida.');
    showFeedback('success', 'Nota excluída com sucesso.');
  };

  // GOOGLE PICKER ACTIONS (DRIVE SELECTOR)
  const handleSearchPickerFiles = async () => {
    if (!googleToken) return;
    setWorkspaceLoading(prev => ({ ...prev, pickerSearch: true }));
    addWorkspaceLog('Buscando arquivos no Google Drive (Google Picker)...');
    try {
      let query = "trashed = false";
      if (pickerSearch.trim()) {
        query += ` and name contains '${pickerSearch.replace(/'/g, "\\'")}'`;
      }
      const url = `https://www.googleapis.com/drive/v3/files?pageSize=12&q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,webViewLink,iconLink,modifiedTime,size)`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${googleToken}` }
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setPickerFiles(data.files || []);
      addWorkspaceLog(`Picker atualizado: ${data.files?.length || 0} arquivos carregados do Drive.`);
    } catch (err: any) {
      console.error(err);
      addWorkspaceLog(`Erro no Picker: ${err.message}`);
      showFeedback('error', 'Falha ao buscar arquivos do Google Drive.');
    } finally {
      setWorkspaceLoading(prev => ({ ...prev, pickerSearch: false }));
    }
  };

  // GOOGLE CONTACTS ACTIONS
  const handleListContacts = async () => {
    if (!googleToken) return;
    setWorkspaceLoading(prev => ({ ...prev, contactsList: true }));
    addWorkspaceLog('Buscando contatos do Google Contacts...');
    try {
      const url = 'https://people.googleapis.com/v1/people/me/connections?pageSize=50&personFields=names,emailAddresses,phoneNumbers';
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${googleToken}` }
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setContacts(data.connections || []);
      addWorkspaceLog(`Contatos sincronizados: ${data.connections?.length || 0} contatos encontrados.`);
    } catch (err: any) {
      console.error(err);
      addWorkspaceLog(`Erro ao listar contatos: ${err.message}`);
      showFeedback('error', 'Falha ao buscar contatos da sua conta Google.');
    } finally {
      setWorkspaceLoading(prev => ({ ...prev, contactsList: false }));
    }
  };

  const handleCreateContact = async () => {
    if (!googleToken) return;
    if (!newContactName.trim()) {
      showFeedback('error', 'O nome do contato é obrigatório.');
      return;
    }
    setWorkspaceLoading(prev => ({ ...prev, contactsCreate: true }));
    addWorkspaceLog(`Criando novo contato: "${newContactName}"...`);
    try {
      const contactBody = {
        names: [{ givenName: newContactName }],
        emailAddresses: newContactEmail.trim() ? [{ value: newContactEmail }] : [],
        phoneNumbers: newContactPhone.trim() ? [{ value: newContactPhone }] : []
      };
      const res = await fetch('https://people.googleapis.com/v1/people:createContact', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactBody)
      });
      if (!res.ok) throw new Error(await res.text());
      addWorkspaceLog(`Contato criado com sucesso: "${newContactName}"`);
      showFeedback('success', 'Contato cadastrado com sucesso no seu Google Contacts!');
      setNewContactName('');
      setNewContactEmail('');
      setNewContactPhone('');
      handleListContacts();
    } catch (err: any) {
      console.error(err);
      addWorkspaceLog(`Erro ao criar contato: ${err.message}`);
      showFeedback('error', 'Falha ao salvar o novo contato.');
    } finally {
      setWorkspaceLoading(prev => ({ ...prev, contactsCreate: false }));
    }
  };

  const handleConnect = async (provider: any) => {
    if (provider.id.startsWith('google_') || provider.id === 'gmail') {
      handleGoogleSignIn();
      return;
    }
    if (provider.id === 'mercado_pago' || provider.id === 'hotmart') {
      setIsLoading(true);
      try {
        // Fluxo OAuth Real do Mercado Pago ou Hotmart
        const res = await fetch(`/api/integrations/connect/${provider.id}`, {
          method: 'POST',
          headers: getHeaders()
        });
        const data = await res.json();
        if (data.success && data.url) {
          // Abre o popup do respectivo provedor diretamente
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
            showFeedback('error', 'Popup bloqueado. Por favor, libere popups no seu navegador para conectar a conta.');
          }
        } else {
          showFeedback('error', `Falha ao iniciar o fluxo OAuth para ${provider.name}.`);
        }
      } catch (err: any) {
        showFeedback('error', err.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Outras plataformas solicitam inserção de credenciais manuais de forma segura
      setSelectedProvider(provider);
      setManualCredentials('');
      setManualAccountName('');
      setShowConnectModal(true);
    }
  };

  const handleSaveManualConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCredentials.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/integrations/connect/${selectedProvider.id}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          credentials: manualCredentials,
          accountName: manualAccountName || 'Conta Integrada Real',
          category: selectedProvider.category
        })
      });

      if (res.ok) {
        showFeedback('success', `Conta conectada com sucesso ao ${selectedProvider.name}!`);
        setShowConnectModal(false);
        fetchConnections();
        fetchLogs();

      } else {
        const errData = await res.json();
        showFeedback('error', errData.error || 'Erro ao conectar plataforma.');
      }
    } catch (err: any) {
      showFeedback('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async (providerId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/integrations/test/${providerId}`, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        showFeedback('success', `Teste de comunicação OK! Latência: ${data.latencyMs}ms. ${data.message}`);
        fetchConnections();
        fetchLogs();
      } else {
        showFeedback('error', data.message || 'Falha no teste de conexão.');
      }
    } catch (err: any) {
      showFeedback('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncConnection = async (providerId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/integrations/sync/${providerId}`, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        showFeedback('success', `Sincronização realizada com sucesso! Processados ${data.count} registros.`);
        fetchConnections();
        fetchLogs();
      } else {
        showFeedback('error', data.error || 'Erro na sincronização de dados.');
      }
    } catch (err: any) {
      showFeedback('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async (providerId: string) => {
    if (!confirm(`Deseja realmente desconectar a conta do ${providerId}? Todos os segredos serão deletados do Secret Vault.`)) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/integrations/disconnect/${providerId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        showFeedback('success', `Plataforma desconectada e credenciais limpas com segurança.`);
        fetchConnections();
        fetchLogs();
      } else {
        showFeedback('error', 'Erro ao desconectar plataforma.');
      }
    } catch (err: any) {
      showFeedback('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const runCenterTests = async () => {
    setIsTesting(true);
    try {
      const res = await fetch('/api/tests/integration-center');
      const data = await res.json();
      setTestResults(data);
      fetchConnections();
      fetchLogs();
    } catch (err) {
      console.error(err);
    } finally {
      setIsTesting(false);
    }
  };

  const handleEnableAllConnectors = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/integrations/connect-all', {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showFeedback('success', `Todos os ${data.count} conectores de sistemas (incluindo GitHub e Google Workspace) foram ativados com absoluto sucesso no Postgres e Secret Vault!`);
        fetchConnections();
        fetchLogs();
      } else {
        showFeedback('error', data.error || 'Erro ao habilitar todos os conectores.');
      }
    } catch (err: any) {
      showFeedback('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Metadados estáticos para todos os cards de conectores requeridos
  const PROVIDERS = [
    // Pagamentos
    { id: 'mercado_pago', name: 'Mercado Pago', category: 'payments', categoryName: 'Pagamentos', desc: 'Gateway de pagamentos líder da América Latina. Suporta pix e cartões de crédito.' },
    { id: 'hotmart', name: 'Hotmart', category: 'payments', categoryName: 'Pagamentos', desc: 'Plataforma completa para distribuição, venda e gerenciamento de produtos digitais.' },
    { id: 'kiwify', name: 'Kiwify', category: 'payments', categoryName: 'Pagamentos', desc: 'Infraestrutura de vendas simplificada e com onboarding ultra-rápido para infoprodutos.' },
    { id: 'eduzz', name: 'Eduzz', category: 'payments', categoryName: 'Pagamentos', desc: 'Ecossistema para comercialização e aceleração de conteúdo e produtos educacionais.' },
    { id: 'monetizze', name: 'Monetizze', category: 'payments', categoryName: 'Pagamentos', desc: 'Plataforma para intermediação de vendas e comissionamento de afiliados de produtos físicos e digitais.' },
    { id: 'stripe', name: 'Stripe', category: 'payments', categoryName: 'Pagamentos', desc: 'Infraestrutura global de processamento de pagamentos para a internet.' },
    { id: 'paypal', name: 'PayPal', category: 'payments', categoryName: 'Pagamentos', desc: 'Carteira digital internacional com pagamentos em múltiplas moedas integradas.' },

    // Comunicação & Documentação
    { id: 'google_docs', name: 'Google Docs', category: 'communication', categoryName: 'Documentos', desc: 'Gere briefings, relatórios estratégicos e e-books integrados ao Google Docs.' },
    { id: 'google_slides', name: 'Google Slides', category: 'communication', categoryName: 'Apresentações', desc: 'Monte apresentações de pitches e video-sales-letters (VSL) estruturadas de forma profissional.' },
    { id: 'gmail', name: 'Gmail', category: 'communication', categoryName: 'Comunicação', desc: 'Gerenciamento profissional de e-mails para envio de notas fiscais e suporte pós-venda.' },
    { id: 'google_calendar', name: 'Google Agenda (Calendar)', category: 'communication', categoryName: 'Agenda', desc: 'Sincronize reuniões de kickoff, alinhamento de tráfego, mentorias e eventos de novos lotes.' },
    { id: 'google_tasks', name: 'Google Tasks', category: 'communication', categoryName: 'Tarefas', desc: 'Gerencie e agende tarefas operacionais e pendências de lançamentos diretamente na conta do Google.' },
    { id: 'google_contacts', name: 'Google Contacts', category: 'communication', categoryName: 'Contatos', desc: 'Sincronize contatos de clientes, leads e parceiros comerciais de forma automatizada.' },
    { id: 'google_keep', name: 'Google Keep', category: 'communication', categoryName: 'Notas', desc: 'Guarde e organize insights, briefs e referências rápidas para copywriting e tráfego pago.' },
    { id: 'outlook', name: 'Outlook / Microsoft 365', category: 'communication', categoryName: 'Comunicação', desc: 'Integração de e-mails corporativos da Microsoft para canais internos de operações.' },
    { id: 'whatsapp', name: 'WhatsApp Business', category: 'communication', categoryName: 'Comunicação', desc: 'Envio automático de códigos pix, recuperação de boletos e disparos informacionais de pós-venda.' },
    { id: 'telegram', name: 'Telegram', category: 'communication', categoryName: 'Comunicação', desc: 'Notificações de faturamento em tempo real e grupos automatizados de alunos.' },
    { id: 'discord', name: 'Discord Webhook', category: 'communication', categoryName: 'Comunicação', desc: 'Dispare notificações instantâneas e webhooks em canais internos de equipe.' },
    { id: 'slack', name: 'Slack Bot', category: 'communication', categoryName: 'Comunicação', desc: 'Automação corporativa com alertas de faturamento e relatórios automáticos de progresso.' },
    { id: 'smtp', name: 'SMTP Outbound', category: 'communication', categoryName: 'Envio', desc: 'Servidor SMTP personalizado para envios em massa de informativos e transacionais.' },
    { id: 'imap', name: 'IMAP Inbound', category: 'communication', categoryName: 'Entrada', desc: 'Leitura automática de caixas de entrada de e-mail para processar tickets de suporte.' },

    // Armazenamento & Organização
    { id: 'google_drive', name: 'Google Drive', category: 'storage', categoryName: 'Armazenamento', desc: 'Backup automático de e-books gerados, arquivos PSD e logs analíticos estruturados no Google Drive.' },
    { id: 'google_sheets', name: 'Google Sheets', category: 'storage', categoryName: 'Planilhas', desc: 'Exporte relatórios financeiros, fluxo de caixa e métricas de leads em tempo real para o Google Sheets.' },
    { id: 'dropbox', name: 'Dropbox', category: 'storage', categoryName: 'Armazenamento', desc: 'Serviço robusto de sincronização de arquivos em nuvem corporativo.' },
    { id: 'onedrive', name: 'OneDrive', category: 'storage', categoryName: 'Armazenamento', desc: 'Sincronização nativa da Microsoft para armazenamento seguro de infoprodutos.' },
    { id: 'google_cloud_storage', name: 'Google Cloud Storage', category: 'storage', categoryName: 'Armazenamento', desc: 'Armazenamento de alta performance para arquivos pesados, assets e mídias.' },

    // Marketing & Formulários
    { id: 'google_forms', name: 'Google Forms', category: 'marketing', categoryName: 'Formulários', desc: 'Crie pesquisas de público-alvo e importe respostas de feedback de clientes automaticamente.' },
    { id: 'meta_ads', name: 'Meta Ads (Facebook / Instagram)', category: 'marketing', categoryName: 'Marketing', desc: 'Leitura em tempo real de CTR, CPA e gastos para cálculo analítico do ROI no financeiro.' },
    { id: 'google_ads', name: 'Google Ads', category: 'marketing', categoryName: 'Marketing', desc: 'Coleta de métricas analíticas de campanhas de pesquisa e canais de vídeo Youtube.' },
    { id: 'tiktok_ads', name: 'TikTok Ads', category: 'marketing', categoryName: 'Marketing', desc: 'Monitoramento analítico de tráfego de criativos voltados ao público jovem.' },
    { id: 'shopify', name: 'Shopify Store', category: 'marketing', categoryName: 'E-commerce', desc: 'Sincronização de pedidos, inventário e clientes com a sua loja Shopify.' },
    { id: 'woocommerce', name: 'WooCommerce Store', category: 'marketing', categoryName: 'E-commerce', desc: 'Integre sua loja online WordPress / WooCommerce para disparar automações.' },
    { id: 'wordpress', name: 'WordPress Site', category: 'marketing', categoryName: 'CMS', desc: 'Gerenciamento de posts, páginas de vendas e blogs de autoridade.' },
    { id: 'linkedin', name: 'LinkedIn Business', category: 'marketing', categoryName: 'Social', desc: 'Integre com a sua página ou conta de anúncios corporativa no LinkedIn.' },
    { id: 'instagram_business', name: 'Instagram Business', category: 'marketing', categoryName: 'Social', desc: 'Automação de respostas diretas, comentários e análise de engajamento do perfil.' },
    { id: 'facebook_pages', name: 'Facebook Pages', category: 'marketing', categoryName: 'Social', desc: 'Gerenciamento automatizado de posts, comentários e interações na sua página.' },
    { id: 'youtube', name: 'YouTube API', category: 'marketing', categoryName: 'Social', desc: 'Sincronização de vídeos, comentários e relatórios de analytics de canal.' },

    // Desenvolvimento & APIs
    { id: 'github', name: 'GitHub OAuth', category: 'dev', categoryName: 'Desenvolvimento', desc: 'Conexão segura via OAuth real com repositórios GitHub para deploy e versionamento.' },
    { id: 'gitlab', name: 'GitLab OAuth', category: 'dev', categoryName: 'Desenvolvimento', desc: 'Automações de pipelines CI/CD e repositórios hospedados na plataforma GitLab.' },
    { id: 'webhooks', name: 'Custom Webhooks', category: 'dev', categoryName: 'Integrações', desc: 'Receba e envie webhooks personalizados para conectar qualquer sistema externo.' },
    { id: 'rest_apis', name: 'Generic REST APIs', category: 'dev', categoryName: 'Integrações', desc: 'Faça chamadas customizadas para qualquer endpoint HTTP/REST JSON externo.' },
    { id: 'graphql_apis', name: 'Generic GraphQL', category: 'dev', categoryName: 'Integrações', desc: 'Queries e Mutations customizadas integrando servidores GraphQL externos.' }
  ];

  // Filtros aplicados aos cards
  const filteredProviders = PROVIDERS.filter(p => {
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            🟢 Conectado
          </span>
        );
      case 'authenticating':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
            🟡 Autenticando
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
            🔴 Erro
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
            🟡 Expirado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-500/15 text-slate-400 border border-slate-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
            ⚪ Desconectado
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100" id="integration-center-root">
      {/* SaaS Enterprise Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-emerald-500/5 pointer-events-none" />
        <div className="relative space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-emerald-500 text-slate-950 uppercase tracking-widest">
              SaaS Enterprise
            </span>
            <span className="text-slate-400 text-xs">V1.5 - Produção Ativa</span>
          </div>
          <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
            <Globe className="text-indigo-400 w-5 h-5 animate-spin-slow" />
            Centro de Integrações (Contas Reais)
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Sincronize com segurança as suas contas reais de faturamento e canais de marketing utilizando criptografia ponta a ponta <strong>AES-256-CBC</strong> em nosso cofre <strong>Secret Vault</strong>.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 relative z-10">
          <button
            onClick={handleEnableAllConnectors}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 disabled:opacity-55 text-white shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300 animate-pulse" />
            Habilitar Todos os Sistemas (Agentes)
          </button>
          <button
            onClick={() => setActiveSubTab('tests')}
            className="px-4 py-2.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Shield className="w-4 h-4 text-emerald-400 animate-pulse" />
            Testar Homologação (7/7)
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveSubTab('connectors')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeSubTab === 'connectors'
              ? 'border-indigo-500 text-indigo-500 dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Network size={14} /> Conectores Disponíveis
        </button>
        <button
          onClick={() => setActiveSubTab('workspace')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeSubTab === 'workspace'
              ? 'border-indigo-500 text-indigo-500 dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <LayoutGrid size={14} className={googleToken ? 'text-emerald-400' : ''} />
          {googleToken ? '🔥 Google Workspace Ativo' : '💼 Google Workspace'}
        </button>
        <button
          onClick={() => setActiveSubTab('github')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeSubTab === 'github'
              ? 'border-indigo-500 text-indigo-500 dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Github size={14} className={githubStatus?.connected ? 'text-indigo-400' : ''} />
          {githubStatus?.connected ? '💻 GitHub Ativo' : '💻 GitHub Workspace'}
        </button>
        <button
          onClick={() => setActiveSubTab('logs')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeSubTab === 'logs'
              ? 'border-indigo-500 text-indigo-500 dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Activity size={14} /> Logs de Auditoria do Vault
        </button>
        <button
          onClick={() => setActiveSubTab('tests')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeSubTab === 'tests'
              ? 'border-indigo-500 text-indigo-500 dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Terminal size={14} /> Console de Qualidade
        </button>
      </div>

      {/* Feedbacks */}
      {operationMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 border ${
            operationMsg.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
          }`}
        >
          {operationMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {operationMsg.text}
        </motion.div>
      )}

      {/* SUB-TAB: CONNECTORS */}
      {activeSubTab === 'connectors' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Filtrar conector por nome ou funcionalidade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-indigo-500 focus:outline-none text-slate-800 dark:text-white"
              />
            </div>
            
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <Filter size={13} className="text-slate-400 mr-1" />
              {[
                { id: 'all', label: 'Todos' },
                { id: 'payments', label: 'Pagamentos' },
                { id: 'communication', label: 'Comunicação' },
                { id: 'storage', label: 'Armazenamento' },
                { id: 'marketing', label: 'Marketing' },
                { id: 'dev', label: 'Desenvolvimento' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    categoryFilter === cat.id
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Connectors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredProviders.map(prov => {
                const connRecord = connections.find(c => c.provider === prov.id);
                const status = connRecord ? connRecord.status : 'disconnected';
                const hasCreds = connRecord && connRecord.accessToken;

                return (
                  <motion.div
                    key={prov.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="p-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all h-[240px]"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                          {prov.categoryName}
                        </span>
                        {getStatusBadge(status)}
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {prov.name}
                          {prov.id === 'mercado_pago' && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] bg-indigo-500/10 text-indigo-400 font-extrabold border border-indigo-500/20">
                              NATIVO
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed mt-1 line-clamp-3">
                          {prov.desc}
                        </p>
                      </div>

                      {connRecord && connRecord.accountName && (
                        <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                          <UserCheck size={11} className="text-emerald-400" />
                          Conta: <strong className="font-semibold text-slate-200">{connRecord.accountName}</strong>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                      {status === 'disconnected' || status === 'error' ? (
                        <button
                          onClick={() => handleConnect(prov)}
                          disabled={isLoading}
                          className="flex-1 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-500 disabled:opacity-55 text-white shadow transition-all"
                        >
                          {prov.id === 'mercado_pago' ? '🔗 Conectar OAuth' : '🔑 Conectar'}
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleTestConnection(prov.id)}
                            disabled={isLoading}
                            className="flex-1 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all"
                          >
                            Testar
                          </button>
                          <button
                            onClick={() => handleSyncConnection(prov.id)}
                            disabled={isLoading}
                            className="flex-1 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all"
                          >
                            Sincronizar
                          </button>
                          <button
                            onClick={() => handleDisconnect(prov.id)}
                            disabled={isLoading}
                            className="p-2 rounded-xl border border-rose-500/20 hover:bg-rose-500/10 text-rose-500 transition-all"
                            title="Desconectar plataforma"
                          >
                            <X size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* SUB-TAB: LOGS */}
      {activeSubTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sliders size={16} className="text-indigo-400" />
                Histórico de Logs de Auditoria do Secret Vault
              </h3>
              <p className="text-[11px] text-slate-400">
                Acompanhe o tráfego analítico de credenciais e respostas de webhooks sanitizados automaticamente pelo cofre de segurança.
              </p>
            </div>
            <button
              onClick={fetchLogs}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
            >
              <RefreshCw size={14} className="animate-spin-slow" />
            </button>
          </div>

          <div className="overflow-x-auto text-xs">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                Nenhum log de auditoria gerado ainda. Conecte ou teste alguma conta.
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] text-slate-500 uppercase font-black">
                  <tr>
                    <th className="px-6 py-3.5">Timestamp</th>
                    <th className="px-6 py-3.5">Conexão ID</th>
                    <th className="px-6 py-3.5">Ação</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Latência</th>
                    <th className="px-6 py-3.5">Mensagem do Vault</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {logs.map(logItem => (
                    <tr key={logItem.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/25 transition-all">
                      <td className="px-6 py-3 text-slate-400 whitespace-nowrap">
                        {new Date(logItem.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-3 font-mono text-[10px] text-slate-400">
                        {logItem.connectionId}
                      </td>
                      <td className="px-6 py-3 font-semibold text-slate-800 dark:text-slate-300">
                        {logItem.action}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          logItem.status === 'success' || logItem.status === 'connected'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {logItem.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-mono text-[11px] text-slate-400">
                        {logItem.latency}ms
                      </td>
                      <td className="px-6 py-3 text-slate-400 max-w-xs truncate" title={logItem.message}>
                        {logItem.message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB: GOOGLE WORKSPACE PLAYGROUND */}
      {activeSubTab === 'workspace' && (
        <div className="space-y-6">
          {!googleToken ? (
            <div className="p-8 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl text-center max-w-2xl mx-auto space-y-6 shadow-xl">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto text-indigo-500">
                <LayoutGrid size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white">Conectar Suite Google Workspace</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                  Aproveite o poder do Google Workspace no seu ecossistema. Com apenas um clique, conecte suas contas reais para automatizar backups, faturamentos, relatórios estratégicos e pesquisas.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-7 gap-3 max-w-2xl mx-auto text-[11px] font-bold text-slate-600 dark:text-slate-400">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl flex flex-col items-center gap-1">
                  <FolderOpen className="text-blue-500 w-5 h-5" />
                  <span>Google Drive</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl flex flex-col items-center gap-1">
                  <FileSpreadsheet className="text-emerald-500 w-5 h-5" />
                  <span>Google Sheets</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl flex flex-col items-center gap-1">
                  <FileText className="text-indigo-500 w-5 h-5" />
                  <span>Google Docs</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl flex flex-col items-center gap-1">
                  <Presentation className="text-amber-500 w-5 h-5" />
                  <span>Google Slides</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl flex flex-col items-center gap-1">
                  <CheckSquare className="text-purple-500 w-5 h-5" />
                  <span>Google Forms</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl flex flex-col items-center gap-1">
                  <Mail className="text-rose-500 w-5 h-5" />
                  <span>Gmail</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl flex flex-col items-center gap-1">
                  <Calendar className="text-yellow-500 w-5 h-5" />
                  <span>Google Agenda</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="px-6 py-3 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-black tracking-wide shadow-xl flex items-center justify-center gap-2 mx-auto hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.25.61 4.45 1.625l2.437-2.437C17.312 1.696 14.933 1 12.24 1 6.58 1 2 5.58 2 11.24s4.58 10.24 10.24 10.24c5.9 0 9.8-4.15 9.8-9.98 0-.67-.06-1.18-.18-1.7l-7.62-.015z" />
                  </svg>
                  {isLoading ? 'Conectando...' : 'Fazer Login com o Google'}
                </button>
                <p className="text-[10px] text-slate-400 mt-2.5">
                  Protegido via OAuth 2.0 e isolamento de token em memória (Secret Vault).
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Panel */}
              <div className="lg:col-span-2 space-y-6">
                {/* Profile Card */}
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    {googleUser?.photoURL ? (
                      <img src={googleUser.photoURL} alt="Avatar" className="w-11 h-11 rounded-full border border-indigo-500/20" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-11 h-11 bg-indigo-100 dark:bg-indigo-950 rounded-full flex items-center justify-center text-indigo-500 font-extrabold text-sm">
                        {googleUser?.displayName?.charAt(0) || googleUser?.email?.charAt(0) || 'G'}
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">
                        {googleUser?.displayName || 'Usuário Google Workspace'}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {googleUser?.email}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Conexão Estabelecida e Segura no Postgres
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleGoogleDisconnect}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold border border-rose-500/20 hover:bg-rose-500/10 text-rose-500 flex items-center gap-1.5 transition-all self-start sm:self-auto"
                  >
                    <LogOut size={13} />
                    Desconectar Google
                  </button>
                </div>

                {/* Sub-navigation inside Playground */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1.5 border-b border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setGoogleSubTab('drive')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                      googleSubTab === 'drive'
                        ? 'bg-blue-500/10 text-blue-500 dark:text-blue-400'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FolderOpen size={14} /> Google Drive
                  </button>
                  <button
                    onClick={() => setGoogleSubTab('sheets')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                      googleSubTab === 'sheets'
                        ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FileSpreadsheet size={14} /> Google Sheets
                  </button>
                  <button
                    onClick={() => setGoogleSubTab('docs')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                      googleSubTab === 'docs'
                        ? 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FileText size={14} /> Google Docs
                  </button>
                  <button
                    onClick={() => setGoogleSubTab('slides')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                      googleSubTab === 'slides'
                        ? 'bg-amber-500/10 text-amber-500 dark:text-amber-400'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Presentation size={14} /> Google Slides
                  </button>
                  <button
                    onClick={() => setGoogleSubTab('forms')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                      googleSubTab === 'forms'
                        ? 'bg-purple-500/10 text-purple-500 dark:text-purple-400'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <CheckSquare size={14} /> Google Forms
                  </button>
                  <button
                    onClick={() => setGoogleSubTab('gmail')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                      googleSubTab === 'gmail'
                        ? 'bg-rose-500/10 text-rose-500 dark:text-rose-400'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Mail size={14} /> Gmail
                  </button>
                  <button
                    onClick={() => setGoogleSubTab('calendar')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                      googleSubTab === 'calendar'
                        ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Calendar size={14} /> Google Agenda
                  </button>
                  <button
                    onClick={() => setGoogleSubTab('tasks')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                      googleSubTab === 'tasks'
                        ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <ListTodo size={14} /> Google Tasks
                  </button>
                  <button
                    onClick={() => setGoogleSubTab('keep')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                      googleSubTab === 'keep'
                        ? 'bg-yellow-400/10 text-yellow-600 dark:text-yellow-500'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <StickyNote size={14} /> Google Keep
                  </button>
                  <button
                    onClick={() => setGoogleSubTab('picker')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                      googleSubTab === 'picker'
                        ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Paperclip size={14} /> Google Picker
                  </button>
                  <button
                    onClick={() => setGoogleSubTab('contacts')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                      googleSubTab === 'contacts'
                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Users size={14} /> Contatos
                  </button>
                </div>

                {/* Subtab Content Panels */}
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-[300px]">
                  {googleSubTab === 'drive' && (
                    <div className="space-y-6">
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <FolderOpen className="text-blue-500" size={16} />
                          Gerenciador Google Drive
                        </h4>
                        <p className="text-xs text-slate-400">
                          Consulte arquivos e crie pastas de faturamento para os produtos digitais da fábrica.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2.5">
                        <button
                          onClick={handleListDriveFiles}
                          disabled={workspaceLoading.driveList}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-500 disabled:opacity-50 transition-all flex items-center gap-1.5"
                        >
                          <RefreshCw size={12} className={workspaceLoading.driveList ? 'animate-spin' : ''} />
                          Listar Arquivos Recentes
                        </button>
                        <button
                          onClick={handleCreateBackupFolder}
                          disabled={workspaceLoading.driveFolder}
                          className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center gap-1.5"
                        >
                          <Plus size={13} />
                          Criar Pasta "AI Business Backups"
                        </button>
                        <button
                          onClick={handleUploadBackupFile}
                          disabled={workspaceLoading.driveUpload}
                          className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center gap-1.5"
                        >
                          <Cloud size={13} />
                          Fazer Upload Backup JSON
                        </button>
                      </div>

                      {/* Files list */}
                      <div className="space-y-3 pt-2">
                        <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Arquivos Recentes no Drive
                        </h5>
                        {workspaceFiles.length === 0 ? (
                          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl text-center text-xs text-slate-400">
                            Nenhum arquivo listado. Clique em "Listar Arquivos Recentes" para consultar.
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-850 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/20">
                            {workspaceFiles.map(file => (
                              <div key={file.id} className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-all text-xs">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {file.mimeType.includes('folder') ? (
                                    <FolderOpen size={16} className="text-blue-400 shrink-0" />
                                  ) : file.mimeType.includes('spreadsheet') ? (
                                    <FileSpreadsheet size={16} className="text-emerald-400 shrink-0" />
                                  ) : (
                                    <FileText size={16} className="text-indigo-400 shrink-0" />
                                  )}
                                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{file.name}</span>
                                </div>
                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-black text-indigo-500 hover:underline shrink-0 flex items-center gap-0.5"
                                >
                                  Abrir <ArrowRight size={10} />
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {googleSubTab === 'sheets' && (
                    <div className="space-y-6">
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <FileSpreadsheet className="text-emerald-500" size={16} />
                          Gerenciador Google Sheets
                        </h4>
                        <p className="text-xs text-slate-400">
                          Exporte relatórios de vendas de infoprodutos e listas de leads de lançamento automaticamente.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2.5">
                        <button
                          onClick={handleCreateSpreadsheet}
                          disabled={workspaceLoading.sheetsCreate}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-500 disabled:opacity-55 transition-all flex items-center gap-1.5"
                        >
                          <Plus size={13} />
                          Criar Planilha de Faturamento
                        </button>
                        <button
                          onClick={handleAppendSheetsData}
                          disabled={workspaceLoading.sheetsAppend || !spreadsheetLink}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-500 disabled:opacity-50 transition-all flex items-center gap-1.5"
                        >
                          <Send size={12} />
                          Exportar 3 Linhas de Vendas IA
                        </button>
                      </div>

                      {spreadsheetLink && (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2 text-xs">
                          <p className="text-emerald-400 font-bold flex items-center gap-1.5">
                            <CheckCircle2 size={14} />
                            Planilha Operacional Ativa!
                          </p>
                          <p className="text-slate-300 font-mono text-[10px] break-all truncate">
                            {spreadsheetLink}
                          </p>
                          <a
                            href={spreadsheetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-extrabold hover:bg-emerald-400 transition-all"
                          >
                            Abrir Planilha de Vendas <ArrowRight size={11} />
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {googleSubTab === 'docs' && (
                    <div className="space-y-6">
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <FileText className="text-indigo-500" size={16} />
                          Gerenciador Google Docs
                        </h4>
                        <p className="text-xs text-slate-400">
                          Exporte briefings estratégicos, copys de e-books e e-mails de lançamento diretamente como arquivos no Google Docs.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-4 max-w-xl">
                        <div className="space-y-1.5">
                          <label className="block text-slate-400 font-black uppercase text-[9px] tracking-wider">Título do Briefing</label>
                          <input
                            type="text"
                            value={docTitle}
                            onChange={(e) => setDocTitle(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-slate-400 font-black uppercase text-[9px] tracking-wider">Conteúdo Principal do Documento</label>
                          <textarea
                            rows={3}
                            value={docContent}
                            onChange={(e) => setDocContent(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:border-indigo-500 font-medium"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleCreateDoc}
                        disabled={workspaceLoading.docsCreate}
                        className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-500 disabled:opacity-50 transition-all flex items-center gap-1.5"
                      >
                        {workspaceLoading.docsCreate ? 'Processando...' : 'Exportar e Criar no Google Docs'}
                      </button>

                      {documentLink && (
                        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-2 text-xs">
                          <p className="text-indigo-400 font-bold flex items-center gap-1.5">
                            <CheckCircle2 size={14} />
                            Documento Criado com Sucesso!
                          </p>
                          <a
                            href={documentLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-500 text-white font-extrabold hover:bg-indigo-400 transition-all"
                          >
                            Visualizar Documento <ArrowRight size={11} />
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {googleSubTab === 'slides' && (
                    <div className="space-y-6">
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Presentation className="text-amber-500" size={16} />
                          Gerenciador Google Slides
                        </h4>
                        <p className="text-xs text-slate-400">
                          Monte decks de apresentação de pitch estruturados automaticamente no Google Slides para os infoprodutos.
                        </p>
                      </div>

                      <button
                        onClick={handleCreatePresentation}
                        disabled={workspaceLoading.slidesCreate}
                        className="px-4 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-black hover:bg-amber-500 disabled:opacity-50 transition-all flex items-center gap-1.5"
                      >
                        {workspaceLoading.slidesCreate ? 'Criando deck...' : 'Gerar Apresentação de Pitch'}
                      </button>

                      {presentationLink && (
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2 text-xs">
                          <p className="text-amber-400 font-bold flex items-center gap-1.5">
                            <CheckCircle2 size={14} />
                            Slide Deck Disponível!
                          </p>
                          <a
                            href={presentationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-extrabold hover:bg-amber-400 transition-all"
                          >
                            Visualizar no Google Slides <ArrowRight size={11} />
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {googleSubTab === 'forms' && (
                    <div className="space-y-6">
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <CheckSquare className="text-purple-500" size={16} />
                          Gerenciador Google Forms
                        </h4>
                        <p className="text-xs text-slate-400">
                          Crie formulários de feedback e consulte as respostas dos seus compradores de forma automatizada.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2.5">
                        <button
                          onClick={handleCreateForm}
                          disabled={workspaceLoading.formsCreate}
                          className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-black hover:bg-purple-500 disabled:opacity-50 transition-all flex items-center gap-1.5"
                        >
                          Criar Formulário de Satisfação
                        </button>
                        <button
                          onClick={handleReadFormResponses}
                          disabled={workspaceLoading.formsResponses || !createdFormId}
                          className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center gap-1.5"
                        >
                          <RefreshCw size={12} className={workspaceLoading.formsResponses ? 'animate-spin' : ''} />
                          Sincronizar Respostas
                        </button>
                      </div>

                      {formLink && (
                        <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-2 text-xs">
                          <p className="text-purple-400 font-bold flex items-center gap-1.5">
                            <CheckCircle2 size={14} />
                            Formulário Ativo e Publicado!
                          </p>
                          <a
                            href={formLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-500 text-white font-extrabold hover:bg-purple-400 transition-all"
                          >
                            Visualizar Formulário Público <ArrowRight size={11} />
                          </a>
                        </div>
                      )}

                      {/* Responses visualization */}
                      <div className="space-y-3 pt-2">
                        <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Respostas Coletadas do Google Forms
                        </h5>
                        {formResponses.length === 0 ? (
                          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl text-center text-xs text-slate-400">
                            Nenhuma submissão de teste detectada ainda.
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-850 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 text-xs">
                            {formResponses.map((response, idx) => (
                              <div key={idx} className="p-3.5 space-y-1 hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-all">
                                <div className="flex items-center justify-between text-[10px] text-slate-400">
                                  <span>ID Resposta: {response.responseId}</span>
                                  <span>{new Date(response.submittedTime).toLocaleString('pt-BR')}</span>
                                </div>
                                <p className="font-bold text-slate-700 dark:text-slate-300">
                                  E-mail: {response.respondentEmail || 'Anônimo'}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {googleSubTab === 'gmail' && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Mail className="text-rose-500" size={16} />
                          Gerenciador de E-mails Gmail
                        </h4>
                        <p className="text-xs text-slate-400">
                          Dispare e-mails automatizados de marketing ou faturamento e consulte sua caixa de entrada em tempo real.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Send Email Form */}
                        <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
                          <h5 className="text-xs font-black uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                            <Send size={12} /> Compor Nova Mensagem
                          </h5>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Destinatário</label>
                              <input
                                type="email"
                                value={emailTo}
                                onChange={(e) => setEmailTo(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:border-rose-500 font-medium"
                                placeholder="exemplo@gmail.com"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Assunto</label>
                              <input
                                type="text"
                                value={emailSubject}
                                onChange={(e) => setEmailSubject(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:border-rose-500 font-medium"
                                placeholder="Insira o assunto do e-mail"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Conteúdo da Mensagem</label>
                              <textarea
                                rows={5}
                                value={emailBody}
                                onChange={(e) => setEmailBody(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:border-rose-500 font-medium"
                                placeholder="Digite a mensagem do e-mail..."
                              />
                            </div>
                          </div>

                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={handleSendEmail}
                              disabled={workspaceLoading.gmailSend}
                              className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Send size={12} />
                              {workspaceLoading.gmailSend ? 'Enviando...' : 'Enviar Agora'}
                            </button>
                            <button
                              onClick={handleCreateDraft}
                              disabled={workspaceLoading.gmailDraft}
                              className="py-2 px-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-850 dark:hover:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold disabled:opacity-50 transition-all flex items-center justify-center gap-1 cursor-pointer"
                              title="Salvar como Rascunho no Gmail"
                            >
                              Salvar Rascunho
                            </button>
                          </div>

                          {emailDraftId && (
                            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] text-emerald-400 font-medium">
                              Rascunho criado com absoluto sucesso! ID: <span className="font-mono bg-emerald-500/20 px-1 py-0.5 rounded text-white">{emailDraftId}</span>
                            </div>
                          )}
                        </div>

                        {/* Recent Email Inbox List */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                              Caixa de Entrada Recente
                            </h5>
                            <button
                              onClick={handleListEmails}
                              disabled={workspaceLoading.gmailList}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <RefreshCw size={10} className={workspaceLoading.gmailList ? 'animate-spin' : ''} />
                              Sincronizar Inbox
                            </button>
                          </div>

                          {emails.length === 0 ? (
                            <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 text-center text-xs text-slate-400 space-y-2">
                              <p>Sua caixa de entrada do Gmail está pronta.</p>
                              <button
                                onClick={handleListEmails}
                                disabled={workspaceLoading.gmailList}
                                className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-xs font-black transition-all mx-auto inline-flex items-center gap-1 cursor-pointer"
                              >
                                {workspaceLoading.gmailList ? 'Consultando...' : 'Ver E-mails Recentes'}
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                              {emails.map((email) => (
                                <div
                                  key={email.id}
                                  className="p-3 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl transition-all space-y-1.5"
                                >
                                  <div className="flex items-center justify-between text-[9px] text-slate-400 font-medium">
                                    <span className="truncate max-w-[130px]" title={email.from}>{email.from}</span>
                                    <span>{email.date}</span>
                                  </div>
                                  <div className="space-y-0.5">
                                    <h6 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                                      {email.subject}
                                    </h6>
                                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                                      {email.snippet}
                                    </p>
                                  </div>
                                  <div className="text-[8px] font-mono text-slate-500/70">
                                    ID: {email.id}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {googleSubTab === 'calendar' && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Calendar className="text-yellow-500" size={16} />
                          Gerenciador de Compromissos Google Agenda (Calendar)
                        </h4>
                        <p className="text-xs text-slate-400">
                          Agende reuniões de kickoff, alinhamentos estratégicos com leads ou eventos de lançamento integrados à sua Agenda.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Create Event Form */}
                        <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
                          <h5 className="text-xs font-black uppercase tracking-wider text-yellow-600 dark:text-yellow-500 flex items-center gap-1.5">
                            <Plus size={12} /> Agendar Novo Compromisso
                          </h5>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Título do Evento</label>
                              <input
                                type="text"
                                value={calendarSummary}
                                onChange={(e) => setCalendarSummary(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:border-yellow-500 font-medium text-slate-900 dark:text-white"
                                placeholder="Kickoff do Lançamento"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Descrição do Evento</label>
                              <textarea
                                rows={2}
                                value={calendarDescription}
                                onChange={(e) => setCalendarDescription(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:border-yellow-500 font-medium text-slate-900 dark:text-white"
                                placeholder="Descreva os tópicos do compromisso..."
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data / Hora Início</label>
                                <input
                                  type="datetime-local"
                                  value={calendarStartTime}
                                  onChange={(e) => setCalendarStartTime(e.target.value)}
                                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:border-yellow-500 font-medium text-slate-900 dark:text-white"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data / Hora Fim</label>
                                <input
                                  type="datetime-local"
                                  value={calendarEndTime}
                                  onChange={(e) => setCalendarEndTime(e.target.value)}
                                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:border-yellow-500 font-medium text-slate-900 dark:text-white"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Localização ou Link</label>
                              <input
                                type="text"
                                value={calendarLocation}
                                onChange={(e) => setCalendarLocation(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:border-yellow-500 font-medium text-slate-900 dark:text-white"
                              />
                            </div>
                          </div>

                          <button
                            onClick={handleCreateCalendarEvent}
                            disabled={workspaceLoading.calendarCreate}
                            className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 rounded-xl text-xs font-black disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Calendar size={12} />
                            {workspaceLoading.calendarCreate ? 'Agendando...' : 'Criar Evento com Google Meet'}
                          </button>

                          {calendarCreatedEventId && (
                            <div className="space-y-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] text-emerald-400 font-medium">
                              <div>Evento agendado com sucesso!</div>
                              {calendarCreatedEventLink && (
                                <a
                                  href={calendarCreatedEventLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-400 hover:underline font-bold break-all flex items-center gap-1"
                                >
                                  🔗 {calendarCreatedEventLink.includes('meet.google.com') ? 'Entrar na sala do Google Meet' : 'Ver evento na Agenda'}
                                </a>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Calendar Events List */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                              Próximos Compromissos
                            </h5>
                            <button
                              onClick={handleListCalendarEvents}
                              disabled={workspaceLoading.calendarList}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <RefreshCw size={10} className={workspaceLoading.calendarList ? 'animate-spin' : ''} />
                              Sincronizar Agenda
                            </button>
                          </div>

                          {calendarEvents.length === 0 ? (
                            <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 text-center text-xs text-slate-400 space-y-2">
                              <p>Nenhum compromisso carregado.</p>
                              <button
                                onClick={handleListCalendarEvents}
                                disabled={workspaceLoading.calendarList}
                                className="px-3.5 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 rounded-xl text-xs font-black transition-all mx-auto inline-flex items-center gap-1 cursor-pointer"
                              >
                                {workspaceLoading.calendarList ? 'Buscando...' : 'Listar Próximos Eventos'}
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                              {calendarEvents.map((event) => {
                                const start = event.start?.dateTime || event.start?.date || '';
                                const end = event.end?.dateTime || event.end?.date || '';
                                const meetUri = event.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === 'video')?.uri;

                                return (
                                  <div
                                    key={event.id}
                                    className="p-3 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl transition-all space-y-2 text-slate-900 dark:text-white"
                                  >
                                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-semibold">
                                      <span className="flex items-center gap-1 text-yellow-500">
                                        <Clock size={10} />
                                        {new Date(start).toLocaleString()}
                                      </span>
                                      <span>Até {new Date(end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>

                                    <div className="space-y-1">
                                      <h6 className="text-xs font-extrabold text-slate-900 dark:text-white">
                                        {event.summary}
                                      </h6>
                                      {event.description && (
                                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                                          {event.description}
                                        </p>
                                      )}
                                    </div>

                                    {meetUri && (
                                      <a
                                        href={meetUri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-[9px] font-black text-indigo-400 border border-indigo-500/20 transition-all"
                                      >
                                        <Play size={10} /> Entrar no Google Meet
                                      </a>
                                    )}

                                    <div className="text-[8px] font-mono text-slate-500/50">
                                      ID: {event.id}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {googleSubTab === 'tasks' && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <ListTodo className="text-sky-500" size={16} />
                          Gerenciador de Pendências (Google Tasks)
                        </h4>
                        <p className="text-xs text-slate-400">
                          Acompanhe tarefas de lançamento, briefings de copy, aprovação de criativos e metas diárias diretamente integradas.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Create Task Form */}
                        <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
                          <h5 className="text-xs font-black uppercase tracking-wider text-sky-600 dark:text-sky-500 flex items-center gap-1.5">
                            <Plus size={12} /> Adicionar Nova Tarefa
                          </h5>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Título da Tarefa</label>
                              <input
                                type="text"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:border-sky-500 font-medium text-slate-900 dark:text-white"
                                placeholder="ex: Aprovar roteiro do VSL"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Notas / Detalhes</label>
                              <textarea
                                rows={2}
                                value={newTaskNotes}
                                onChange={(e) => setNewTaskNotes(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:border-sky-500 font-medium text-slate-900 dark:text-white"
                                placeholder="ex: Detalhar ganchos de atenção..."
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data de Vencimento (Opcional)</label>
                              <input
                                type="date"
                                value={newTaskDue}
                                onChange={(e) => setNewTaskDue(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:border-sky-500 font-medium text-slate-900 dark:text-white"
                              />
                            </div>
                          </div>

                          <button
                            onClick={handleCreateTask}
                            disabled={workspaceLoading.tasksCreate}
                            className="w-full py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-black disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <ListTodo size={12} />
                            {workspaceLoading.tasksCreate ? 'Criando...' : 'Adicionar Tarefa'}
                          </button>
                        </div>

                        {/* Tasks List */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                              Minhas Pendências
                            </h5>
                            <button
                              onClick={handleListTasks}
                              disabled={workspaceLoading.tasksList}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <RefreshCw size={10} className={workspaceLoading.tasksList ? 'animate-spin' : ''} />
                              Sincronizar Tasks
                            </button>
                          </div>

                          {tasks.length === 0 ? (
                            <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 text-center text-xs text-slate-400 space-y-2">
                              <p>Nenhuma tarefa listada neste painel.</p>
                              <button
                                onClick={handleListTasks}
                                disabled={workspaceLoading.tasksList}
                                className="px-3.5 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 rounded-xl text-xs font-black transition-all mx-auto inline-flex items-center gap-1 cursor-pointer"
                              >
                                {workspaceLoading.tasksList ? 'Buscando...' : 'Listar Tarefas'}
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                              {tasks.map((task) => (
                                <div
                                  key={task.id}
                                  className={`p-3 bg-slate-50 dark:bg-slate-950 border rounded-xl transition-all space-y-1.5 text-slate-900 dark:text-white ${
                                    task.status === 'completed' ? 'border-emerald-500/10 opacity-60' : 'border-slate-100 dark:border-slate-850'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-start gap-2">
                                      <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                                        task.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-700'
                                      }`}>
                                        {task.status === 'completed' && <Check size={10} />}
                                      </div>
                                      <div>
                                        <h6 className={`text-xs font-bold leading-tight ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                          {task.title}
                                        </h6>
                                        {task.notes && (
                                          <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">
                                            {task.notes}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {task.due && (
                                    <div className="text-[9px] text-rose-500 dark:text-rose-400 font-bold flex items-center gap-1">
                                      <span>📅 Prazo: {new Date(task.due).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {googleSubTab === 'keep' && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <StickyNote className="text-yellow-500" size={16} />
                          Gerenciador de Notas Rápidas (Google Keep)
                        </h4>
                        <p className="text-xs text-slate-400">
                          Crie, edite e fixe insights estratégicos de copywriting, anúncios, ideias criativas e lembretes para sua operação.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Create Keep Note Form */}
                        <div className="md:col-span-1 space-y-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 h-fit">
                          <h5 className="text-xs font-black uppercase tracking-wider text-yellow-600 dark:text-yellow-500 flex items-center gap-1.5">
                            <Plus size={12} /> Nova Nota de Insights
                          </h5>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Título</label>
                              <input
                                type="text"
                                value={newKeepTitle}
                                onChange={(e) => setNewKeepTitle(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:border-yellow-500 font-medium text-slate-900 dark:text-white"
                                placeholder="Headline de Lançamento"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Conteúdo da Nota</label>
                              <textarea
                                rows={4}
                                value={newKeepContent}
                                onChange={(e) => setNewKeepContent(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:border-yellow-500 font-medium text-slate-900 dark:text-white"
                                placeholder="Escreva suas ideias livremente..."
                              />
                            </div>
                          </div>

                          <button
                            onClick={handleCreateKeepNote}
                            className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <StickyNote size={12} />
                            Adicionar Nota Fixada
                          </button>
                        </div>

                        {/* Notes List */}
                        <div className="md:col-span-2 space-y-4">
                          <h5 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            Minhas Notas & Quadros
                          </h5>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[420px] overflow-y-auto pr-1">
                            {keepNotes.map((note) => (
                              <div
                                key={note.id}
                                className="p-4 bg-yellow-50/40 dark:bg-slate-950 border border-yellow-200/50 dark:border-slate-850 rounded-2xl relative group hover:shadow-md transition-all space-y-2"
                              >
                                <button
                                  onClick={() => handleDeleteKeepNote(note.id)}
                                  className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-white dark:hover:bg-slate-900 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                  title="Excluir Nota"
                                >
                                  <X size={12} />
                                </button>

                                <h6 className="text-xs font-black text-slate-900 dark:text-white pr-6">
                                  {note.title}
                                </h6>
                                <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed break-words whitespace-pre-line">
                                  {note.content}
                                </p>
                                <div className="text-[8px] text-slate-400 font-medium pt-2 border-t border-yellow-200/20">
                                  Sincronizado: {new Date(note.updatedAt).toLocaleDateString()} às {new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {googleSubTab === 'picker' && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Paperclip className="text-teal-500" size={16} />
                          Seletor Inteligente de Arquivos (Google Picker)
                        </h4>
                        <p className="text-xs text-slate-400">
                          Selecione qualquer arquivo, planilha de faturamento, briefing ou criativo do seu Google Drive para associar à sua inteligência de negócios.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Picker File Browser */}
                        <div className="md:col-span-2 space-y-4">
                          <div className="flex flex-col sm:flex-row gap-2.5">
                            <div className="relative flex-1">
                              <Search className="absolute left-3.5 top-2.5 text-slate-400" size={13} />
                              <input
                                type="text"
                                value={pickerSearch}
                                onChange={(e) => setPickerSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchPickerFiles()}
                                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:border-teal-500 font-medium text-slate-900 dark:text-white"
                                placeholder="Buscar por nome do arquivo..."
                              />
                            </div>
                            <button
                              onClick={handleSearchPickerFiles}
                              disabled={workspaceLoading.pickerSearch}
                              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-black disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Search size={12} />
                              {workspaceLoading.pickerSearch ? 'Pesquisando...' : 'Buscar'}
                            </button>
                          </div>

                          {pickerFiles.length === 0 ? (
                            <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 text-center text-xs text-slate-400 space-y-2">
                              <p>Digite um termo e busque arquivos para carregar o Google Picker.</p>
                              <button
                                onClick={handleSearchPickerFiles}
                                disabled={workspaceLoading.pickerSearch}
                                className="px-3.5 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-xl text-xs font-black transition-all mx-auto inline-flex items-center gap-1 cursor-pointer"
                              >
                                Carregar Arquivos Recentes
                              </button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
                              {pickerFiles.map((file) => (
                                <div
                                  key={file.id}
                                  onClick={() => setSelectedPickerFile(file)}
                                  className={`p-3 border rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                                    selectedPickerFile?.id === file.id
                                      ? 'bg-teal-500/5 border-teal-500 shadow-sm'
                                      : 'bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border-slate-100 dark:border-slate-850'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 overflow-hidden">
                                    {file.iconLink ? (
                                      <img src={file.iconLink} alt="Icon" className="w-4 h-4 flex-shrink-0" />
                                    ) : (
                                      <FileText size={16} className="text-teal-500 flex-shrink-0" />
                                    )}
                                    <div className="overflow-hidden">
                                      <h6 className="text-xs font-extrabold truncate text-slate-900 dark:text-white">
                                        {file.name}
                                      </h6>
                                      <p className="text-[9px] text-slate-400 font-mono truncate">
                                        Tipo: {file.mimeType?.split('.').pop()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Selected File Details */}
                        <div className="md:col-span-1 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 h-fit space-y-4">
                          <h5 className="text-xs font-black uppercase tracking-wider text-teal-600 dark:text-teal-500 flex items-center gap-1.5">
                            📄 Arquivo Selecionado
                          </h5>

                          {selectedPickerFile ? (
                            <div className="space-y-3.5">
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400">
                                  ID Identificado
                                </span>
                                <div className="text-[9px] font-mono text-slate-400 select-all break-all bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                                  {selectedPickerFile.id}
                                </div>
                              </div>

                              <div className="space-y-1 text-xs">
                                <div className="font-bold text-slate-900 dark:text-white">Nome:</div>
                                <div className="text-slate-400 font-medium truncate" title={selectedPickerFile.name}>
                                  {selectedPickerFile.name}
                                </div>
                              </div>

                              <div className="space-y-1 text-xs">
                                <div className="font-bold text-slate-900 dark:text-white">Modificado em:</div>
                                <div className="text-slate-400 font-medium">
                                  {selectedPickerFile.modifiedTime ? new Date(selectedPickerFile.modifiedTime).toLocaleString() : 'N/A'}
                                </div>
                              </div>

                              <div className="space-y-2 pt-2">
                                <a
                                  href={selectedPickerFile.webViewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-black text-center block transition-all cursor-pointer animate-pulse"
                                >
                                  Abrir no Google Drive 🔗
                                </a>
                                <button
                                  onClick={() => {
                                    addWorkspaceLog(`Arquivo associado com sucesso: "${selectedPickerFile.name}" (ID: ${selectedPickerFile.id})`);
                                    showFeedback('success', 'Arquivo selecionado e associado com sucesso!');
                                  }}
                                  className="w-full py-2 border border-teal-500/30 hover:bg-teal-500/10 text-teal-500 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                >
                                  Vincular à IA
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-xs text-slate-400 leading-relaxed">
                              Nenhum arquivo selecionado. Clique em um arquivo na lista ao lado para ver detalhes e associar.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {googleSubTab === 'contacts' && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Users className="text-indigo-500" size={16} />
                          Gerenciador de Contatos (Google Contacts)
                        </h4>
                        <p className="text-xs text-slate-400">
                          Sincronize contatos de leads qualificados, parceiros estratégicos e alunos cadastrados na sua conta Google.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Create Contact Form */}
                        <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
                          <h5 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-500 flex items-center gap-1.5">
                            <UserPlus size={12} /> Cadastrar Novo Contato
                          </h5>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nome Completo</label>
                              <input
                                type="text"
                                value={newContactName}
                                onChange={(e) => setNewContactName(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:border-indigo-500 font-medium text-slate-900 dark:text-white"
                                placeholder="Tiago Lopes"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">E-mail</label>
                              <input
                                type="email"
                                value={newContactEmail}
                                onChange={(e) => setNewContactEmail(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:border-indigo-500 font-medium text-slate-900 dark:text-white"
                                placeholder="exemplo@gmail.com"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Telefone</label>
                              <input
                                type="text"
                                value={newContactPhone}
                                onChange={(e) => setNewContactPhone(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:border-indigo-500 font-medium text-slate-900 dark:text-white"
                                placeholder="+55 11 99999-9999"
                              />
                            </div>
                          </div>

                          <button
                            onClick={handleCreateContact}
                            disabled={workspaceLoading.contactsCreate}
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <UserPlus size={12} />
                            {workspaceLoading.contactsCreate ? 'Salvando...' : 'Salvar Contato'}
                          </button>
                        </div>

                        {/* Contacts List */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                              Contatos Carregados
                            </h5>
                            <button
                              onClick={handleListContacts}
                              disabled={workspaceLoading.contactsList}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <RefreshCw size={10} className={workspaceLoading.contactsList ? 'animate-spin' : ''} />
                              Sincronizar Contatos
                            </button>
                          </div>

                          {contacts.length === 0 ? (
                            <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 text-center text-xs text-slate-400 space-y-2">
                              <p>Nenhum contato sincronizado ainda.</p>
                              <button
                                onClick={handleListContacts}
                                disabled={workspaceLoading.contactsList}
                                className="px-3.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 rounded-xl text-xs font-black transition-all mx-auto inline-flex items-center gap-1 cursor-pointer"
                              >
                                {workspaceLoading.contactsList ? 'Buscando...' : 'Listar Contatos'}
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                              {contacts.map((contact, index) => {
                                const name = contact.names?.[0]?.displayName || 'Contato Sem Nome';
                                const email = contact.emailAddresses?.[0]?.value || '';
                                const phone = contact.phoneNumbers?.[0]?.value || '';
                                return (
                                  <div
                                    key={index}
                                    className="p-3 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl transition-all text-slate-900 dark:text-white"
                                  >
                                    <h6 className="text-xs font-extrabold text-slate-900 dark:text-white">
                                      {name}
                                    </h6>
                                    {(email || phone) && (
                                      <div className="mt-1 space-y-0.5">
                                        {email && <div className="text-[10px] text-slate-400">📧 {email}</div>}
                                        {phone && <div className="text-[10px] text-slate-400">📞 {phone}</div>}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Logs Console */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-2xl h-[560px] flex flex-col justify-between">
                <div className="space-y-1.5">
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5 uppercase tracking-wider">
                    <Terminal className="text-indigo-400 animate-pulse" size={14} />
                    Console Google APIs
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Acompanhe em tempo real as requisições HTTPS e os códigos de status emitidos pelas APIs oficiais do Google Workspace.
                  </p>
                </div>

                <div className="flex-1 my-4 bg-black/50 border border-slate-900 rounded-xl p-4 font-mono text-[10px] leading-relaxed text-slate-300 overflow-y-auto space-y-2 h-[380px]">
                  {workspaceLogs.length === 0 ? (
                    <div className="text-slate-600 text-center py-12">
                      Nenhum registro no console. Execute uma das ações das abas para interagir com as APIs oficiais.
                    </div>
                  ) : (
                    workspaceLogs.map((log, index) => {
                      let textClass = 'text-slate-400';
                      if (log.includes('Sucesso') || log.includes('Autenticado')) textClass = 'text-emerald-400 font-bold';
                      if (log.includes('Erro') || log.includes('Falha')) textClass = 'text-rose-400 font-bold';
                      if (log.includes('Iniciando')) textClass = 'text-indigo-400';

                      return (
                        <div key={index} className={textClass}>
                          {log}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[9px] font-bold text-slate-500 font-mono">
                  <span>PROVEDOR: GOOGLE OAUTH 2.0</span>
                  <span>SSL ATIVO</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB: GITHUB WORKSPACE */}
      {activeSubTab === 'github' && (
        <div className="space-y-6">
          {/* Header Description */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Github size={120} />
            </div>
            <div className="relative z-10 space-y-2">
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2 text-white">
                <Github size={22} className="text-indigo-400" />
                Ambiente de Integração e Versionamento (GitHub)
              </h3>
              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                Esta área permite que os agentes inteligentes efetuem o versionamento automático, criem repositórios remotos e salvem o código-fonte dos produtos digitais gerados. As credenciais de acesso (Tokens PAT) são armazenadas de forma segura com criptografia forte e controle de acessibilidade restrito.
              </p>
            </div>
          </div>

          {/* Connection Status Card */}
          {!githubStatus?.connected ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6 max-w-2xl mx-auto">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Github size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">Conectar Conta GitHub</h4>
                  <p className="text-xs text-slate-400">Insira um Personal Access Token (PAT) para habilitar o controle de versão dos agentes.</p>
                </div>
              </div>

              <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-4 text-xs space-y-2 text-indigo-800 dark:text-indigo-300">
                <p className="font-bold flex items-center gap-1">
                  <AlertCircle size={14} /> Como gerar um token de acesso?
                </p>
                <ol className="list-decimal list-inside space-y-1 ml-1 text-slate-500 dark:text-slate-400">
                  <li>Vá em <strong>Settings &gt; Developer Settings &gt; Personal Access Tokens &gt; Tokens (classic)</strong> no GitHub.</li>
                  <li>Clique em <strong>Generate new token</strong> e selecione o escopo <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 font-mono text-[10px] rounded text-pink-600">repo</code> e <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 font-mono text-[10px] rounded text-pink-600">read:user</code>.</li>
                  <li>Copie o token gerado e insira-o no campo abaixo para habilitar clone, commit e gerenciamento de repositórios.</li>
                </ol>
              </div>

              <form onSubmit={handleConnectGitHub} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Personal Access Token (Classic ou Fine-grained)</label>
                  <input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={githubTokenInput}
                    onChange={(e) => setGithubTokenInput(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={githubLoadingState.connect}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {githubLoadingState.connect ? (
                    <>
                      <RefreshCw className="animate-spin" size={14} />
                      Conectando ao GitHub...
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      Conectar Conta GitHub
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Connected Header */}
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">GitHub Conectado e Ativo</h4>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[9px] font-black rounded-full">
                        VAULT ENCRYPTED
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Disponível para todos os agentes inteligentes da fábrica. Conta: <strong className="text-slate-700 dark:text-slate-300">{githubStatus.accountName}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={fetchGitHubStatus}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 transition-all cursor-pointer"
                    title="Recarregar dados"
                  >
                    <RefreshCw size={14} />
                  </button>
                  <button
                    onClick={handleDisconnectGitHub}
                    disabled={githubLoadingState.disconnect}
                    className="px-4 py-2.5 rounded-xl text-xs font-black bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    {githubLoadingState.disconnect ? 'Revogando...' : 'Revogar Acesso'}
                  </button>
                </div>
              </div>

              {/* Grid with features */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Actions */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Clone Repo Card */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <GitBranch className="text-indigo-500" size={16} />
                      Clonar Repositório Remoto
                    </h4>
                    <p className="text-xs text-slate-400">
                      Clona um repositório existente para a área de desenvolvimento local dos agentes.
                    </p>

                    <form onSubmit={handleCloneRepo} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-8 space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">HTTPS URL do Repositório</label>
                        <input
                          type="text"
                          value={githubRepoUrl}
                          onChange={(e) => setGithubRepoUrl(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="sm:col-span-4 space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Branch Padrão</label>
                        <input
                          type="text"
                          value={githubBranch}
                          onChange={(e) => setGithubBranch(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="sm:col-span-12 pt-2">
                        <button
                          type="submit"
                          disabled={githubLoadingState.clone}
                          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-lg shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {githubLoadingState.clone ? (
                            <>
                              <RefreshCw className="animate-spin" size={12} />
                              Clonando repositório remoto...
                            </>
                          ) : (
                            <>
                              <GitBranch size={12} />
                              Efetuar Clone para o Workspace
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Create New Repo Card */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <GitPullRequest className="text-indigo-500" size={16} />
                      Criar Repositório Automático
                    </h4>
                    <p className="text-xs text-slate-400">
                      Gera um repositório novinho na sua conta do GitHub para hospedar as aplicações criadas pelos agentes.
                    </p>

                    <form onSubmit={handleCreateRepo} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Nome do Repositório</label>
                          <input
                            type="text"
                            value={githubRepoName}
                            onChange={(e) => setGithubRepoName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none text-slate-900 dark:text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Visibilidade</label>
                          <select
                            value={githubIsPrivate ? 'private' : 'public'}
                            onChange={(e) => setGithubIsPrivate(e.target.value === 'private')}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none text-slate-900 dark:text-white"
                          >
                            <option value="public">Público</option>
                            <option value="private">Privado</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Descrição do Projeto</label>
                        <input
                          type="text"
                          value={githubRepoDesc}
                          onChange={(e) => setGithubRepoDesc(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={githubLoadingState.create}
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-lg shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {githubLoadingState.create ? (
                            <>
                              <RefreshCw className="animate-spin" size={12} />
                              Criando repositório no GitHub...
                            </>
                          ) : (
                            <>
                              <Plus size={12} />
                              Criar Repositório Novo
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Simulator: Commit & Push Changes */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <GitCommit className="text-indigo-500" size={16} />
                      Simulador de Versionamento por Agente Inteligente
                    </h4>
                    <p className="text-xs text-slate-400">
                      Escreva um script ou alteração para ser salvo no repositório local e enviado (commit & push) para o GitHub como se fosse o agente autônomo.
                    </p>

                    <form onSubmit={handleCommitChanges} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Repositório Selecionado</label>
                          <input
                            type="text"
                            value={githubCommitRepo}
                            onChange={(e) => setGithubCommitRepo(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none text-slate-900 dark:text-white font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Caminho do Arquivo</label>
                          <input
                            type="text"
                            value={githubCommitFile}
                            onChange={(e) => setGithubCommitFile(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none text-slate-900 dark:text-white font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Mensagem de Commit (Mensagem do Agente)</label>
                        <input
                          type="text"
                          value={githubCommitMsg}
                          onChange={(e) => setGithubCommitMsg(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Código-Fonte / Conteúdo</label>
                        <textarea
                          rows={6}
                          value={githubCommitContent}
                          onChange={(e) => setGithubCommitContent(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 font-mono text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={githubLoadingState.commit}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {githubLoadingState.commit ? (
                            <>
                              <RefreshCw className="animate-spin" size={12} />
                              Processando Commit &amp; Push...
                            </>
                          ) : (
                            <>
                              <Play size={12} />
                              Efetuar Commit Autônomo &amp; Push
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                </div>

                {/* Right Column: Files & Logs */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Workspace Files Explorer */}
                  <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                      <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                        <FolderOpen className="text-yellow-500" size={16} />
                        Árvore de Arquivos do Workspace Local
                      </h4>
                      <button
                        onClick={fetchGitHubFiles}
                        disabled={githubLoadingState.files}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                        title="Recarregar arquivos"
                      >
                        <RefreshCw size={10} className={githubLoadingState.files ? 'animate-spin' : ''} />
                      </button>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
                      {githubLoadingState.files ? (
                        <div className="py-8 text-center text-xs text-slate-500 font-mono">
                          Carregando arquivos do workspace...
                        </div>
                      ) : githubFiles.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-500 font-mono">
                          Nenhum repositório clonado no workspace local dos agentes.
                        </div>
                      ) : (
                        githubFiles.map((f, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60 font-mono text-[11px] transition-all"
                          >
                            <div className="flex items-center gap-2 overflow-hidden mr-2">
                              {f.isDirectory ? (
                                <FolderOpen size={12} className="text-yellow-500 shrink-0" />
                              ) : (
                                <FileCode size={12} className="text-indigo-400 shrink-0" />
                              )}
                              <span className="truncate text-slate-300" title={f.path}>{f.path || f.name}</span>
                            </div>
                            {!f.isDirectory && f.sizeBytes !== undefined && (
                              <span className="text-[9px] text-slate-500 shrink-0">
                                {(f.sizeBytes / 1024).toFixed(1)} KB
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[8px] font-bold text-slate-500 font-mono">
                      <span>CWD: /github_agent_workspace</span>
                      <span>{githubFiles.length} ARQUIVOS / DIRETÓRIOS</span>
                    </div>
                  </div>

                  {/* GitHub Logs Logger */}
                  <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                      <h4 className="text-xs font-black text-white flex items-center gap-1.5 font-mono">
                        <Terminal size={14} className="text-indigo-400" />
                        AGENT_GITHUB_CONNECTOR.log
                      </h4>
                      <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 font-mono text-[8px] font-bold rounded">
                        STABILITY: PERFECT
                      </span>
                    </div>

                    <div className="bg-slate-900 rounded-xl p-3 h-[240px] overflow-y-auto font-mono text-[10px] space-y-1.5 border border-slate-800 text-slate-300">
                      {githubLogs.length === 0 ? (
                        <div className="text-slate-500 italic py-4 text-center">
                          Nenhum evento registrado no fluxo de versionamento.
                        </div>
                      ) : (
                        githubLogs.map((log, i) => (
                          <div key={i} className="leading-relaxed whitespace-pre-wrap select-all">
                            <span className="text-indigo-400">{log}</span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[8px] font-bold text-slate-500 font-mono">
                      <span>MONITORANDO PORTA 3000</span>
                      <span>AUTO-VERSIONAMENTO ATIVADO</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB: CONSOLE / TESTS */}
      {activeSubTab === 'tests' && (
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Shield className="text-indigo-400 animate-pulse w-5 h-5" />
                  Esteira de Qualidade e Homologação
                </h3>
                <p className="text-xs text-slate-400">
                  Execute o pipeline analítico de conformidade para auditar o Secret Vault, a criptografia e o fluxo do Finance Agent.
                </p>
              </div>

              <button
                onClick={runCenterTests}
                disabled={isTesting}
                className="px-4 py-2.5 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 disabled:opacity-55 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 transition-all self-start sm:self-auto"
              >
                <RefreshCw size={13} className={isTesting ? 'animate-spin' : ''} />
                {isTesting ? 'Homologando...' : 'Iniciar Testes de Qualidade (7/7)'}
              </button>
            </div>

            {/* Test Outcomes Visualizer */}
            {testResults && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-black">Status</span>
                  <div className="text-sm font-extrabold text-emerald-400 flex items-center gap-1.5">
                    {testResults.success ? (
                      <>
                        <CheckCircle2 size={16} /> APROVADO
                      </>
                    ) : (
                      <>
                        <ShieldAlert size={16} className="text-rose-500" /> REPROVADO
                      </>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-black">Passados</span>
                  <div className="text-sm font-extrabold text-emerald-400">
                    {testResults.passed} / 7
                  </div>
                </div>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-black">Falhas</span>
                  <div className="text-sm font-extrabold text-rose-500">
                    {testResults.failed} / 7
                  </div>
                </div>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-black">Homologado por</span>
                  <div className="text-sm font-extrabold text-white">
                    Integration Agent
                  </div>
                </div>
              </div>
            )}

            {/* Terminal output */}
            <div className="bg-black/80 rounded-xl p-5 border border-slate-900 font-mono text-[11px] leading-relaxed text-slate-300 max-h-[400px] overflow-y-auto space-y-1 shadow-inner">
              {isTesting ? (
                <div className="flex items-center gap-2 text-indigo-400 animate-pulse py-4 justify-center">
                  <RefreshCw className="animate-spin w-4 h-4" />
                  <span>Executando o simulador de qualidade de credenciais reais e webhooks...</span>
                </div>
              ) : testResults?.log ? (
                testResults.log.split('\n').map((line: string, idx: number) => {
                  let colorClass = 'text-slate-300';
                  if (line.includes('✅') || line.includes('PASSOU')) colorClass = 'text-emerald-400';
                  if (line.includes('❌') || line.includes('FALHOU')) colorClass = 'text-rose-500 font-bold';
                  if (line.startsWith('▶️')) colorClass = 'text-indigo-400 font-semibold';
                  if (line.startsWith('==')) colorClass = 'text-indigo-500';

                  return (
                    <div key={idx} className={colorClass}>
                      {line}
                    </div>
                  );
                })
              ) : (
                <div className="text-slate-500 text-center py-6">
                  Nenhum resultado de teste disponível. Clique em "Iniciar Testes de Qualidade" para homologar.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: MANUAL CREDENTIAL INTEGRATION */}
      {showConnectModal && selectedProvider && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 shadow-2xl text-xs space-y-4"
          >
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Key className="text-indigo-500" size={16} />
                Conectar Plataforma: {selectedProvider.name}
              </h3>
              <p className="text-[11px] text-slate-400">
                Sua credencial será criptografada imediatamente no Secret Vault.
              </p>
            </div>

            <form onSubmit={handleSaveManualConnection} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  Apelido da Conta / Identificador
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Minha Loja Principal"
                  value={manualAccountName}
                  onChange={(e) => setManualAccountName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  Chave de Acesso / API Key / Token Secreto
                </label>
                <input
                  type="password"
                  required
                  placeholder="Cole sua credencial privada aqui"
                  value={manualCredentials}
                  onChange={(e) => setManualCredentials(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:border-indigo-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-250 dark:border-slate-750 text-slate-600 dark:text-slate-400 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-55 text-white font-bold shadow"
                >
                  Gravar no Vault &rarr;
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
