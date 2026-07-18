import { AgentInfo, Task, TaskStatus, AgentStatus, DigitalProduct, AgentId } from '../types.ts';
import { Repository } from '../db/repository.ts';
import { logInfo, logWarn, logError } from '../logs/logger.ts';

// Interface para mensagens do canal de comunicação entre agentes
export interface AgentMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  productId?: string;
  timestamp: string;
}

// Definição de um fluxo de trabalho estruturado
export interface WorkflowStep {
  agentId: AgentId;
  title: string;
  descriptionTemplate: string;
  priority: 'low' | 'medium' | 'high';
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
}

// Repositório em memória para mensagens de comunicação e fluxos customizados
class OrchestratorStore {
  static messages: AgentMessage[] = [];
  static sharedContexts: Record<string, Record<string, any>> = {};
  
  // Fluxos de trabalho pré-definidos e customizados
  static workflows: Record<string, WorkflowDefinition> = {
    'standard_pipeline': {
      id: 'standard_pipeline',
      name: 'Fábrica Completa de Infoprodutos',
      description: 'Esteira sequencial padrão de 10 etapas, da ideação até auditoria final.',
      steps: [
        {
          agentId: 'ceo',
          title: 'Ideação & Modelagem de Negócio',
          descriptionTemplate: "Definir a tese central do produto no nicho '{niche}', estabelecer o nome ideal '{productName}', público-alvo prioritário e o diferencial de mercado.",
          priority: 'high'
        },
        {
          agentId: 'research',
          title: 'Pesquisa da Persona & Dores',
          descriptionTemplate: "Identificar as 3 maiores dores da nossa persona do produto '{productName}', os maiores medos e desejos que podemos sanar de forma imediata.",
          priority: 'high'
        },
        {
          agentId: 'market',
          title: 'Keywords SEO & Canais',
          descriptionTemplate: "Mapear 10 palavras-chave com alto volume de busca para atração orgânica para o produto '{productName}' e listar os 3 melhores canais digitais para o lançamento.",
          priority: 'medium'
        },
        {
          agentId: 'product',
          title: 'Estruturação do Produto',
          descriptionTemplate: "Estruturar o esqueleto/sumário do produto digital '{productName}', dividindo-o em 4 módulos principais com sub-tópicos.",
          priority: 'high'
        },
        {
          agentId: 'writer',
          title: 'Produção do Conteúdo Inicial',
          descriptionTemplate: "Escrever um capítulo introdutório incrível para o produto '{productName}', garantindo linguagem persuasiva e de fácil absorção.",
          priority: 'high'
        },
        {
          agentId: 'designer',
          title: 'Estilo Visual & Mockups',
          descriptionTemplate: "Definir a paleta de cores hexadecimais, tipografias e redigir prompts detalhados para criativos do produto '{productName}'.",
          priority: 'medium'
        },
        {
          agentId: 'marketing',
          title: 'Copy de Vendas & E-mails',
          descriptionTemplate: "Criar headline de alta conversão, estrutura de vendas da página e 2 sequências de e-mails de lançamento para o produto '{productName}'.",
          priority: 'high'
        },
        {
          agentId: 'publisher',
          title: 'Empacotamento do Funil',
          descriptionTemplate: "Definir fluxo ideal de carrinho e simular ativação na plataforma de vendas para '{productName}'.",
          priority: 'low'
        },
        {
          agentId: 'finance',
          title: 'Precificação & Projeção Financeira',
          descriptionTemplate: "Calcular preço ótimo para o produto '{productName}' e estimar lucratividade esperada nos 3 primeiros meses de operação.",
          priority: 'medium'
        },
        {
          agentId: 'supervisor',
          title: 'Controle de Qualidade',
          descriptionTemplate: "Auditoria geral heurística para garantir coerência pedagógica e ortográfica de toda a fábrica no produto '{productName}'.",
          priority: 'high'
        }
      ]
    },
    'fast_track': {
      id: 'fast_track',
      name: 'Esteira Expresso (Fast Track)',
      description: 'Pipeline enxuto focado em validar ideias rapidamente com 4 etapas cruciais.',
      steps: [
        {
          agentId: 'ceo',
          title: 'Validação Rápida da Ideia',
          descriptionTemplate: "Desenvolver uma tese enxuta e definir a oferta irresistível do produto '{productName}' no nicho '{niche}'.",
          priority: 'high'
        },
        {
          agentId: 'product',
          title: 'Sumário Executivo do Produto',
          descriptionTemplate: "Criar o esqueleto básico do produto digital '{productName}' em 3 módulos principais.",
          priority: 'high'
        },
        {
          agentId: 'marketing',
          title: 'Copy Ultra Persuasiva',
          descriptionTemplate: "Gerar a headline de impacto e a oferta central da página de vendas para '{productName}'.",
          priority: 'high'
        },
        {
          agentId: 'supervisor',
          title: 'Aprovação Rápida',
          descriptionTemplate: "Auditar e aprovar a estrutura mínima viável (MVP) do produto '{productName}'.",
          priority: 'high'
        }
      ]
    }
  };
}

// -------------------------------------------------------------
// 1. AGENT MANAGER
// -------------------------------------------------------------
export class AgentManager {
  // Criar ou Registrar novo agente de IA
  static async createAgent(agentData: Omit<AgentInfo, 'executionTime' | 'efficiency'>): Promise<AgentInfo> {
    const state = await Repository.getSystemState();
    
    // Verifica se já existe
    const exists = state.agents.some(a => a.id === agentData.id);
    if (exists) {
      throw new Error(`Agente com ID '${agentData.id}' já está cadastrado.`);
    }

    const newAgent: AgentInfo = {
      ...agentData,
      status: agentData.status || 'idle',
      executionTime: 0,
      efficiency: 95
    };

    state.agents.push(newAgent);
    await Repository.saveState({ agents: state.agents });
    
    logInfo(`Agente registrado com sucesso via AgentManager: ${newAgent.name} (${newAgent.role})`);
    return newAgent;
  }

  // Atualizar dados cadastrais de um agente
  static async updateAgent(agentId: string, updates: Partial<Omit<AgentInfo, 'id'>>): Promise<AgentInfo> {
    const state = await Repository.getSystemState();
    const index = state.agents.findIndex(a => a.id === agentId);
    if (index === -1) {
      throw new Error(`Agente '${agentId}' não encontrado.`);
    }

    state.agents[index] = {
      ...state.agents[index],
      ...updates
    };

    await Repository.saveState({ agents: state.agents });
    logInfo(`Agente '${agentId}' atualizado via AgentManager.`);
    return state.agents[index];
  }

  // Alterar status direto de um agente
  static async changeAgentStatus(agentId: string, status: AgentStatus): Promise<void> {
    const state = await Repository.getSystemState();
    const agent = state.agents.find(a => a.id === agentId);
    if (!agent) {
      throw new Error(`Agente '${agentId}' não encontrado.`);
    }

    agent.status = status;
    if (status === 'idle') {
      agent.currentTask = undefined;
    }

    await Repository.saveState({ agents: state.agents });
    logInfo(`Status do agente '${agentId}' alterado para '${status}'.`);
  }

  // Buscar agentes em estado disponível (idle)
  static async getAvailableAgents(): Promise<AgentInfo[]> {
    const state = await Repository.getSystemState();
    return state.agents.filter(a => a.status === 'idle');
  }

  // Encerrar / Forçar parada de um agente
  static async stopAgent(agentId: string): Promise<void> {
    const state = await Repository.getSystemState();
    const agent = state.agents.find(a => a.id === agentId);
    if (!agent) throw new Error(`Agente '${agentId}' não encontrado.`);

    agent.status = 'paused';
    agent.currentTask = undefined;
    await Repository.saveState({ agents: state.agents });
    logInfo(`Execução do agente '${agentId}' pausada/forçada interrupção.`);
  }

  // Reiniciar / Resetar agente após erro
  static async restartAgent(agentId: string): Promise<void> {
    const state = await Repository.getSystemState();
    const agent = state.agents.find(a => a.id === agentId);
    if (!agent) throw new Error(`Agente '${agentId}' não encontrado.`);

    agent.status = 'idle';
    agent.currentTask = undefined;
    await Repository.saveState({ agents: state.agents });
    logInfo(`Agente '${agentId}' reiniciado com sucesso.`);
  }
}

// -------------------------------------------------------------
// 2. TASK ENGINE
// -------------------------------------------------------------
export class TaskEngine {
  // Adiciona nova tarefa à fila com controle de prioridades
  static async addTask(taskData: {
    agentId: AgentId;
    productId?: string;
    title: string;
    description: string;
    priority?: 'low' | 'medium' | 'high';
  }): Promise<Task> {
    const state = await Repository.getSystemState();
    
    const newTask: Task = {
      id: 'task_' + Math.random().toString(36).substr(2, 9),
      agentId: taskData.agentId,
      productId: taskData.productId,
      title: taskData.title,
      description: taskData.description,
      status: 'pending',
      priority: taskData.priority || 'medium',
      executionTime: 0,
      logs: [`Tarefa criada com sucesso em ${new Date().toLocaleTimeString()} com prioridade ${taskData.priority || 'medium'}.`],
      timestamp: new Date().toLocaleTimeString()
    };

    // Insere ordenando pela prioridade na fila de execução (high -> medium -> low)
    state.tasks.push(newTask);
    
    // Ordenação estrita das tarefas pendentes por prioridade
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    state.tasks.sort((a, b) => {
      if (a.status === 'pending' && b.status === 'pending') {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      return 0; // mantém a ordem de execução original para as demais
    });

    await Repository.saveState({ tasks: state.tasks });
    logInfo(`Nova tarefa '${newTask.title}' inserida na fila. Agente: ${newTask.agentId}. Prioridade: ${newTask.priority}`);
    return newTask;
  }

  // Altera status de uma tarefa, registrando tempos e entregas
  static async updateTaskStatus(
    taskId: string, 
    status: TaskStatus, 
    result?: string, 
    logs?: string[],
    durationSeconds: number = 0
  ): Promise<void> {
    const state = await Repository.getSystemState();
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error(`Tarefa '${taskId}' não encontrada.`);
    }

    task.status = status;
    task.executionTime += durationSeconds;
    
    if (result !== undefined) {
      task.result = result;
    }
    if (logs && logs.length > 0) {
      task.logs.push(...logs);
    }

    await Repository.saveState({ tasks: state.tasks });
    logInfo(`Tarefa '${taskId}' atualizada para o status: ${status}.`);
  }

  // Cancelar uma tarefa pendente ou executando
  static async cancelTask(taskId: string): Promise<void> {
    const state = await Repository.getSystemState();
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) throw new Error(`Tarefa '${taskId}' não encontrada.`);

    task.status = 'cancelled';
    task.logs.push(`[${new Date().toLocaleTimeString()}] Tarefa cancelada manualmente.`);
    
    // Libera o agente associado
    const agent = state.agents.find(a => a.id === task.agentId);
    if (agent && agent.status === 'running') {
      agent.status = 'idle';
      agent.currentTask = undefined;
    }

    await Repository.saveState({ tasks: state.tasks, agents: state.agents });
    logInfo(`Tarefa '${taskId}' foi cancelada.`);
  }

  // Recupera a fila completa de tarefas ordenada
  static async getTaskQueue(): Promise<Task[]> {
    const state = await Repository.getSystemState();
    return state.tasks;
  }
}

// -------------------------------------------------------------
// 3. WORKFLOW ENGINE
// -------------------------------------------------------------
export class WorkflowEngine {
  // Registrar novos fluxos dinâmicos
  static defineWorkflow(workflow: WorkflowDefinition): void {
    if (OrchestratorStore.workflows[workflow.id]) {
      logWarn(`Workflow '${workflow.id}' já existe. Sobrescrevendo definição...`);
    }
    OrchestratorStore.workflows[workflow.id] = workflow;
    logInfo(`Novo fluxo de trabalho registrado com sucesso: ${workflow.name}`);
  }

  // Lista todos os fluxos de trabalho disponíveis
  static getWorkflows(): WorkflowDefinition[] {
    return Object.values(OrchestratorStore.workflows);
  }

  // Disparar uma esteira automática baseada em um fluxo
  static async triggerWorkflow(
    workflowId: string, 
    context: { niche: string; productName: string; productId: string }
  ): Promise<Task[]> {
    const workflow = OrchestratorStore.workflows[workflowId];
    if (!workflow) {
      throw new Error(`Fluxo de trabalho '${workflowId}' não cadastrado.`);
    }

    logInfo(`Disparando pipeline de produção baseado no fluxo: ${workflow.name}`);
    const state = await Repository.getSystemState();

    // Limpa tarefas pendentes anteriores para evitar sobreposição
    state.tasks = state.tasks.filter(t => t.status !== 'pending' && t.status !== 'running');

    const createdTasks: Task[] = [];

    // Cria as tarefas com base nos templates do workflow
    for (const step of workflow.steps) {
      const description = step.descriptionTemplate
        .replace(/{niche}/g, context.niche)
        .replace(/{productName}/g, context.productName);

      const task: Task = {
        id: 'task_' + Math.random().toString(36).substr(2, 9),
        agentId: step.agentId,
        productId: context.productId,
        title: step.title,
        description,
        status: 'pending',
        priority: step.priority,
        executionTime: 0,
        logs: [`Tarefa gerada via Workflow Engine [${workflow.name}] em ${new Date().toLocaleTimeString()}`],
        timestamp: new Date().toLocaleTimeString()
      };

      state.tasks.push(task);
      createdTasks.push(task);
    }

    await Repository.saveState({ tasks: state.tasks });
    logInfo(`Workflow '${workflow.name}' ativado com sucesso. ${createdTasks.length} tarefas agendadas.`);
    return createdTasks;
  }
}

// -------------------------------------------------------------
// 4. AGENT COMMUNICATION SYSTEM (Mensageria & Contexto Compartilhado)
// -------------------------------------------------------------
export class AgentCommunicationSystem {
  // Agente envia uma mensagem direta para outro agente ou canal geral
  static async sendMessage(
    senderId: string, 
    receiverId: string, 
    content: string, 
    productId?: string
  ): Promise<AgentMessage> {
    const message: AgentMessage = {
      id: 'msg_' + Math.random().toString(36).substr(2, 9),
      senderId,
      receiverId,
      content,
      productId,
      timestamp: new Date().toLocaleString('pt-BR')
    };

    OrchestratorStore.messages.push(message);
    logInfo(`[Mensagem de IA] ${senderId} -> ${receiverId}: "${content.substring(0, 40)}..."`);
    
    // Loga no banco como log do sistema se o broker ainda não existe
    try {
      const exists = await Repository.findUserByEmail('broker@factory.internal');
      if (!exists) {
        await Repository.createUser('AI Message Broker', 'broker@factory.internal', '', 'developer');
      }
    } catch (e) {
      // Silently ignore if DB is offline or check fails
    }
    return message;
  }

  // Recupera histórico de mensagens trocadas
  static getMessages(productId?: string): AgentMessage[] {
    if (productId) {
      return OrchestratorStore.messages.filter(m => m.productId === productId);
    }
    return OrchestratorStore.messages;
  }

  // Atualizar Pool de Contexto Compartilhado de um Produto
  static async updateSharedContext(productId: string, key: string, value: any): Promise<void> {
    if (!OrchestratorStore.sharedContexts[productId]) {
      OrchestratorStore.sharedContexts[productId] = {};
    }
    OrchestratorStore.sharedContexts[productId][key] = value;
    logInfo(`[Contexto Compartilhado] Produto: ${productId} atualizado com chave '${key}'`);
  }

  // Obter todas as informações compartilhadas de um produto
  static getSharedContext(productId: string): Record<string, any> {
    return OrchestratorStore.sharedContexts[productId] || {};
  }
}
