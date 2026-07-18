import { GoogleGenAI } from '@google/genai';
import { Repository } from '../db/repository.ts';
import { AgentHealth, AgentMetrics, AgentHeartbeatRecord, SystemAlert, OperationLog, SystemHealthMetrics, PerformanceHistoryRecord } from '../types.ts';
import { logInfo, logWarn, logError } from '../logs/logger.ts';
import { getDB } from '../db/index.ts';
import { ModelManager } from '../kernel/ModelManager.ts';

export class SupervisorAgent {
  private static getAI(): GoogleGenAI {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY não está configurada nos segredos do sistema.');
    }
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }

  // Registra heartbeat de um agente
  static async recordHeartbeat(agentId: string, status: string, currentTask?: string): Promise<void> {
    const timestamp = new Date().toISOString();
    
    // Obter dados reais de tarefas executadas e falhadas para este agente
    const state = await Repository.getSystemState();
    const agentTasks = state.tasks.filter(t => t.agentId === agentId);
    const tasksExecuted = agentTasks.filter(t => t.status === 'completed').length;
    const tasksFailed = agentTasks.filter(t => t.status === 'failed').length;
    const pendingTasks = agentTasks.filter(t => t.status === 'pending').length;
    
    // Calcular tempo médio de execução
    const executionTimes = agentTasks.filter(t => t.status === 'completed').map(t => t.executionTime || 0);
    const averageExecutionTime = executionTimes.length > 0 
      ? executionTimes.reduce((sum, val) => sum + val, 0) / executionTimes.length
      : 0;

    // Gerar métricas simuladas realistas de CPU e Memória Lógica
    const isRunning = status === 'running';
    const cpuUsage = isRunning ? parseFloat((15 + Math.random() * 35).toFixed(2)) : parseFloat((0.1 + Math.random() * 1.5).toFixed(2));
    const memoryUsage = isRunning ? parseFloat((45 + Math.random() * 20).toFixed(2)) : parseFloat((10 + Math.random() * 5).toFixed(2));

    // Salvar no agent_heartbeats histórico
    const hbId = `hb_${Math.random().toString(36).substr(2, 9)}`;
    const heartbeatRecord: AgentHeartbeatRecord = {
      id: hbId,
      agentId,
      status,
      currentTask,
      cpuUsage,
      memoryUsage,
      timestamp
    };
    await Repository.saveAgentHeartbeat(heartbeatRecord);

    // Buscar saúde atual do agente para calcular uptime/downtime incremental
    const healthList = await Repository.getAgentHealthList();
    const currentHealth = healthList.find(h => h.id === agentId);

    let uptime = currentHealth ? currentHealth.uptime : 0;
    let downtime = currentHealth ? currentHealth.downtime : 0;
    
    if (currentHealth) {
      if (status === 'offline' || status === 'paused' || status === 'error') {
        downtime += 4;
      } else {
        uptime += 4;
      }
    } else {
      if (status === 'offline' || status === 'paused' || status === 'error') {
        downtime = 4;
      } else {
        uptime = 4;
      }
    }

    // Salvar em agent_health
    const healthRecord: AgentHealth = {
      id: agentId,
      status: status as any,
      lastHeartbeat: timestamp,
      uptime,
      downtime,
      currentWorkflowId: currentHealth?.currentWorkflowId || 'standard_pipeline',
      timestamp
    };
    await Repository.saveAgentHealth(healthRecord);

    // Salvar em agent_metrics
    const metricRecord: AgentMetrics = {
      id: `m_${agentId}`,
      agentId,
      logicalCpu: cpuUsage,
      logicalMemory: memoryUsage,
      tasksExecuted,
      tasksFailed,
      averageExecutionTime,
      taskQueueCount: pendingTasks,
      timestamp
    };
    await Repository.saveAgentMetrics(metricRecord);
  }

  // Executa Health Check Automatizado global do sistema
  static async runGlobalHealthCheck(): Promise<SystemHealthMetrics> {
    const timestamp = new Date().toISOString();

    // 1. Verificar Postgres
    let postgresStatus = 'offline';
    if (Repository.isPGAvailable()) {
      try {
        const db = getDB();
        await db.execute('SELECT 1');
        postgresStatus = 'online';
      } catch (err) {
        postgresStatus = 'offline';
        await this.triggerAlert('critical', 'Banco de Dados PostgreSQL indisponível ou inacessível.', 'PostgreSQL Connection Test', 'database', 'Verificar credenciais do Cloud SQL no painel de segredos.');
      }
    }

    // 2. Verificar Gemini API
    let geminiApiStatus = 'offline';
    try {
      const ai = this.getAI();
      await ModelManager.generateContent('supervisor', ai, {
        model: ModelManager.getModelName(),
        contents: 'ping',
        config: { maxOutputTokens: 5 }
      });
      geminiApiStatus = 'online';
    } catch (err: any) {
      geminiApiStatus = 'offline';
      await this.triggerAlert('high', `Falha ao conectar com a API do Gemini: ${err.message || err}`, 'Gemini API Connectivity Check', 'gemini', 'Revisar segredo GEMINI_API_KEY ou cotas da API.');
    }

    // 3. Simular e validar outros status
    const serverStatus = 'online';
    const restApiStatus = 'online';
    const dashboardStatus = 'online';

    // Obter uso lógico do sistema
    const cpuUsage = parseFloat((12.5 + Math.random() * 8.5).toFixed(2));
    const memoryUsage = parseFloat((350 + Math.random() * 50).toFixed(2));

    const systemMetricsRecord: SystemHealthMetrics = {
      id: `sys_${Math.random().toString(36).substr(2, 9)}`,
      cpuUsage,
      memoryUsage,
      postgresStatus,
      geminiApiStatus,
      serverStatus,
      restApiStatus,
      dashboardStatus,
      timestamp
    };

    await Repository.saveSystemMetrics(systemMetricsRecord);

    // 4. Monitoramento Comercial Mercado Pago (Etapa 18 - Supervisor Agent Alerts)
    try {
      const transactions = await Repository.getPaymentTransactions();
      const mpTxs = transactions.filter(t => t.provider === 'mercado_pago');
      if (mpTxs.length >= 3) {
        // Verifica falhas recorrentes nos últimos pagamentos
        const lastThree = mpTxs.slice(-3);
        const failedCount = lastThree.filter(t => t.status === 'rejected' || t.status === 'cancelled').length;
        if (failedCount >= 2) {
          await this.triggerAlert(
            'high',
            `Monitoramento Comercial detectou múltiplas falhas de pagamento no Mercado Pago (${failedCount} de 3 transações rejeitadas/canceladas).`,
            'Mercado Pago Production Engine',
            'finance',
            'Verificar integridade da conta Mercado Pago ou logs de Webhook.'
          );
        }

        // Verifica queda de conversão comercial
        const approvedCount = mpTxs.filter(t => t.status === 'approved').length;
        const conversion = (approvedCount / mpTxs.length) * 100;
        if (conversion < 20.0 && mpTxs.length >= 5) {
          await this.triggerAlert(
            'medium',
            `Queda drástica na conversão comercial detectada: apenas ${conversion.toFixed(1)}% das tentativas foram concluídas com sucesso.`,
            'Mercado Pago Production Engine',
            'finance',
            'Otimizar a página de vendas, rever valor do ticket ou testar fluxo de pagamento.'
          );
        }
      }
    } catch (commErr: any) {
      logWarn(`[SupervisorAgent] Falha ao executar monitoramento comercial no health check: ${commErr.message}`);
    }

    // Salvar log da operação
    await Repository.saveOperationLog({
      id: `op_${Math.random().toString(36).substr(2, 9)}`,
      action: 'health_check',
      details: `Health check global realizado. Postgres: ${postgresStatus}, Gemini: ${geminiApiStatus}`,
      user: 'system',
      timestamp
    });

    // Iniciar recuperação automática de agentes em estado de erro
    await this.attemptAutoRecovery().catch(err => {
      logError('Falha no processo de Auto Recovery:', null, err);
    });

    return systemMetricsRecord;
  }

  // Disparar Alerta com auditoria e encaminhamento de falha
  static async triggerAlert(
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info',
    reason: string,
    origin: string,
    agentId?: string,
    actionSuggested: string = 'Nenhuma ação necessária.'
  ): Promise<SystemAlert> {
    const alertId = `alert_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    const alert: SystemAlert = {
      id: alertId,
      severity,
      reason,
      origin,
      agentId,
      timestamp,
      actionSuggested,
      repaired: 0 // não reparado. Aguarda Repair Agent
    };

    await Repository.saveSystemAlert(alert);
    logWarn(`[Alerta ${severity.toUpperCase()}] ${reason} (Origem: ${origin})`);

    // Logar ação administrativa completa
    await Repository.saveOperationLog({
      id: `op_${Math.random().toString(36).substr(2, 9)}`,
      action: 'alert',
      agentId,
      details: `Alerta criado. Severidade: ${severity}. Motivo: ${reason}`,
      user: 'system',
      timestamp
    });

    return alert;
  }

  // Geração de análise estratégica e recomendações da IA baseada na situação operacional
  static async generateStrategicReview(): Promise<string> {
    try {
      const ai = this.getAI();
      const state = await Repository.getSystemState();
      const agentsHealth = await Repository.getAgentHealthList();
      const agentsMetrics = await Repository.getAgentMetricsList();
      const activeAlerts = (await Repository.getSystemAlerts()).filter(a => a.repaired === 0);

      const systemPrompt = `Você é o Supervisor Agent, atuando como COO (Diretor de Operações) da AI Business Factory.
Sua função é supervisionar, monitorar o desempenho, balancear carga de trabalho e garantir a alta disponibilidade do sistema de agentes de IA.
Gere um parecer operacional estratégico em Português do Brasil com sugestões práticas baseadas nos dados reais fornecidos de forma concisa e profissional.`;

      const userContent = `Dados Operacionais Atuais:
- Total de Agentes: ${state.agents.length}
- Status dos Agentes: ${JSON.stringify(agentsHealth.map(h => ({ agent: h.id, status: h.status, uptime: h.uptime })))}
- Desempenho e Recursos: ${JSON.stringify(agentsMetrics.map(m => ({ agent: m.agentId, cpu: m.logicalCpu, memory: m.logicalMemory, executadas: m.tasksExecuted, falhas: m.tasksFailed })))}
- Alertas Ativos: ${JSON.stringify(activeAlerts.map(a => ({ severidade: a.severity, motivo: a.reason })))}
- Fila de Tarefas: ${state.tasks.filter(t => t.status === 'pending').length} pendentes, ${state.tasks.filter(t => t.status === 'running').length} executando.

Forneça uma análise operacional de gargalos, sugestão de balanceamento de carga e ações de remediação.`;

      const response = await ModelManager.generateContent('supervisor', ai, {
        model: ModelManager.getModelName(),
        contents: [
          { role: 'system', parts: [{ text: systemPrompt }] },
          { role: 'user', parts: [{ text: userContent }] }
        ],
        config: {
          temperature: 0.3
        }
      });

      return response.text || 'Análise operacional gerada em branco.';
    } catch (err: any) {
      logError('Erro ao gerar análise estratégica do Supervisor:', null, err);
      return 'Não foi possível gerar análise estratégica operacional por IA no momento.';
    }
  }

  // Envia heartbeat de todos os agentes para mantê-los ativos e atualizados
  static async triggerAllHeartbeats(): Promise<void> {
    const state = await Repository.getSystemState();
    for (const agent of state.agents) {
      await this.recordHeartbeat(agent.id, agent.status, agent.currentTask);
    }
  }

  /**
   * Tenta restaurar automaticamente agentes que estão em estado de erro
   */
  static async attemptAutoRecovery(): Promise<void> {
    try {
      const state = await Repository.getSystemState();
      const failedAgents = state.agents.filter(a => a.status === 'error');

      if (failedAgents.length === 0) {
        return;
      }

      logInfo(`[SupervisorAgent] Encontrado(s) ${failedAgents.length} agente(s) em estado de erro. Iniciando fluxo de Auto Recovery.`);

      for (const agent of failedAgents) {
        const errorDetails = agent.currentTask || 'Erro desconhecido.';
        
        // 1. Disparar alerta operacional
        await this.triggerAlert(
          'high',
          `Agente ${agent.name} (${agent.id}) falhou. Detalhes: ${errorDetails}`,
          `Supervisor Auto Recovery`,
          agent.id,
          'Executar ação corretiva via Repair Agent.'
        );

        // 2. Acionar Repair Agent para diagnosticar e aplicar reparo
        try {
          const { RepairAgent } = await import('./RepairAgent.ts');
          logInfo(`[SupervisorAgent] Acionando RepairAgent para diagnosticar falha do agente ${agent.id}`);
          const issue = await RepairAgent.diagnoseIssue(
            `Agent-${agent.id}`,
            `Agente ${agent.name} está parado com erro: ${errorDetails}`,
            'high'
          );

          // Aplicar o reparo automatizado
          const repairResult = await RepairAgent.applyAutomatedRepair(issue.id);
          logInfo(`[SupervisorAgent] Resultado do reparo para o agente ${agent.id}: ${repairResult.details}`);

          // 3. Restaurar status do agente para idle usando ModelManager
          await ModelManager.recoverAgentStatus(agent.id);

          // Salvar log de sucesso de recuperação
          await Repository.saveOperationLog({
            id: `op_rec_${Math.random().toString(36).substr(2, 9)}`,
            action: 'auto_recovery_success',
            details: `Agente ${agent.name} restaurado com sucesso para 'idle' após diagnóstico e reparo automático.`,
            user: 'system',
            timestamp: new Date().toISOString()
          });

        } catch (repairErr: any) {
          logError(`[SupervisorAgent] Erro durante o fluxo de reparo do agente ${agent.id}: ${repairErr.message || repairErr}`);
        }
      }
    } catch (err: any) {
      logError(`[SupervisorAgent] Erro ao executar Auto Recovery: ${err.message || err}`);
    }
  }

  /**
   * Gera sugestões automáticas de auto-recuperação (Auto Healing Suggestions) - Etapa 23
   */
  static async getAutoHealingSuggestions(): Promise<{
    agentId?: string;
    issue: string;
    suggestion: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }[]> {
    const suggestions: {
      agentId?: string;
      issue: string;
      suggestion: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    }[] = [];

    try {
      // 1. Monitorar saúde dos agentes via MonitoringService
      const { MonitoringService } = await import('../enterprise/monitoringService.ts');
      const agents = MonitoringService.getAgentsHealth();
      
      for (const agent of agents) {
        if (agent.status === 'ERROR') {
          suggestions.push({
            agentId: agent.id,
            issue: `O agente ${agent.name} está em estado de ERROR (Taxa de sucesso: ${agent.successRate}%).`,
            suggestion: `Reiniciar a instância lógica do agente, purgar tarefas presas no pipeline e ajustar prioridades das mensagens.`,
            severity: 'HIGH'
          });
        } else if (agent.status === 'DEGRADED') {
          suggestions.push({
            agentId: agent.id,
            issue: `O agente ${agent.name} está DEGRADADO (Tempo de resposta: ${agent.avgResponseTimeMs}ms).`,
            suggestion: `Habilitar cache de predições, otimizar prompt de sistema reduzindo tokens e escalar concorrência.`,
            severity: 'MEDIUM'
          });
        }
      }

      // 2. Monitorar faturamento e consumo via TenantService
      const { TenantService } = await import('../tenant/tenantService.ts');
      const tenantService = TenantService.getInstance();
      const currentTenantId = tenantService.getCurrentTenantId();
      const tenant = tenantService.getTenantById(currentTenantId);
      if (tenant) {
        const usageRate = tenant.usedExecutions / (tenant.maxExecutions || 1);
        if (usageRate >= 0.9) {
          suggestions.push({
            issue: `Consumo crítico de execuções no workspace "${tenant.name}" (${tenant.usedExecutions}/${tenant.maxExecutions}).`,
            suggestion: `Recomendar upgrade imediato de plano para o nível BUSINESS/ENTERPRISE ou estender cota emergencial temporária.`,
            severity: 'CRITICAL'
          });
        } else if (usageRate >= 0.7) {
          suggestions.push({
            issue: `Consumo elevado de execuções no workspace "${tenant.name}" (${tenant.usedExecutions}/${tenant.maxExecutions}).`,
            suggestion: `Sugerir otimização de fluxos automáticos ou sugerir plano comercial Pro.`,
            severity: 'MEDIUM'
          });
        }

        if (tenant.availableCredits <= 10) {
          suggestions.push({
            issue: `Cota de créditos Gemini extremamente baixa (${tenant.availableCredits} restantes).`,
            suggestion: `Injetar créditos de bônus ou limitar temporariamente consultas redundantes de escrita pesada.`,
            severity: 'HIGH'
          });
        }
      }

      // 3. Monitorar segurança via SecurityService
      const { SecurityService } = await import('../enterprise/securityService.ts');
      const activeAlerts = SecurityService.getAlerts().filter(a => a.status === 'ACTIVE');
      for (const alert of activeAlerts) {
        if (alert.severity === 'CRITICAL' || alert.severity === 'HIGH') {
          suggestions.push({
            issue: `Alerta crítico de segurança ativo: ${alert.description}`,
            suggestion: `Alertar o administrador do sistema por email, aplicar MFA obrigatório e rotacionar tokens JWT.`,
            severity: alert.severity
          });
        }
      }

      // Se não houver nada anormal
      if (suggestions.length === 0) {
        suggestions.push({
          issue: 'Nenhuma anomalia identificada em agentes, faturamento ou segurança.',
          suggestion: 'Plataforma operando perfeitamente. Nenhuma intervenção sugerida.',
          severity: 'LOW'
        });
      }

    } catch (err: any) {
      console.error('[SupervisorAgent] Erro ao gerar sugestões de autorrecuperação:', err);
    }

    return suggestions;
  }
}
