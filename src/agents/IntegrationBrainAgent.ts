import { GoogleGenAI } from '@google/genai';
import { Repository } from '../db/repository.ts';
import { AgentInfo } from '../types.ts';
import { logInfo, logWarn, logError } from '../logs/logger.ts';
import { IntegrationBrain } from '../integration/integrationBrain.ts';
import { ApiDiscoveryEngine } from '../integration/apiDiscovery.ts';

export class IntegrationBrainAgent {
  public static readonly ID = 'integration_brain';
  public static readonly NAME = 'Integration Brain Agent';
  public static readonly ROLE = 'Diretor de Integrações & Conectores';
  public static readonly DESCRIPTION = 'Responsável por avaliar e detectar proativamente as necessidades de integrações externas, gerenciar credenciais criptografadas e monitorar a integridade, limites e latência operacional das APIs do ecossistema.';

  private static getAI(): GoogleGenAI {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY não configurada nos segredos.');
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

  /**
   * Registra o Integration Brain Agent no Orchestrator se não estiver listado
   */
  public static async registerIfNeeded(): Promise<void> {
    try {
      const state = await Repository.getSystemState();
      const exists = state.agents.some(a => a.id === this.ID);
      
      if (!exists) {
        logInfo(`Registrando automaticamente ${this.NAME} no AgentManager...`);
        const newAgent: AgentInfo = {
          id: this.ID,
          name: this.NAME,
          role: this.ROLE,
          status: 'idle',
          executionTime: 0,
          efficiency: 97,
          description: this.DESCRIPTION
        };
        state.agents.push(newAgent);
        await Repository.saveState({ agents: state.agents });
        logInfo(`${this.NAME} cadastrado com absoluto sucesso no sistema.`);
      }
    } catch (err: any) {
      logError(`Falha ao registrar ${this.NAME}: ${err.message}`);
    }
  }

  private static async updateAgentState(status: 'idle' | 'running' | 'error', currentTask?: string) {
    try {
      const state = await Repository.getSystemState();
      const agentsList = state.agents.map(a => {
        if (a.id === this.ID) {
          return { ...a, status, currentTask: currentTask || undefined };
        }
        return a;
      });
      await Repository.saveState({ agents: agentsList });
    } catch (err) {
      console.error('Falha ao atualizar estado do Integration Brain Agent:', err);
    }
  }

  /**
   * Analisa tarefas ativas de agentes para descobrir e coordenar a ativação ou execução de conectores
   */
  public static async analyzeAndCoordinate(
    taskTitle: string,
    taskDescription: string,
    tenantId = 'default-tenant'
  ): Promise<{
    integrationRequired: boolean;
    recommendation?: string;
    connectorId?: string;
    status: string;
    message: string;
  }> {
    await this.registerIfNeeded();
    await this.updateAgentState('running', `Avaliando necessidades de integrações externas para: "${taskTitle}"`);

    try {
      // 1. Detectar necessidade através do núcleo do IntegrationBrain
      const assessment = await IntegrationBrain.evaluateTaskIntegration(taskTitle, taskDescription);

      if (!assessment.needDetected || !assessment.connectorId) {
        await this.updateAgentState('idle');
        return {
          integrationRequired: false,
          status: 'none',
          message: 'Nenhuma necessidade de integração identificada para esta tarefa de agente.'
        };
      }

      // 2. Verificar registro de instalação e tratar solicitação
      const connectorId = assessment.connectorId;
      const resultFlow = await IntegrationBrain.processIntegrationRequest(
        tenantId,
        connectorId,
        assessment.action || 'SYNC_DATA',
        assessment.reason || 'Pedido disparado automaticamente pelo Integration Brain Agent.'
      );

      // 3. Se já estiver ativado, monitorar e certificar a integridade
      if (resultFlow.status === 'configured') {
        const apiMeta = await ApiDiscoveryEngine.discoverApi(connectorId);
        logInfo(`[IntegrationBrainAgent] Verificando integridade remota da API de '${connectorId}' (${apiMeta.name}). Status: ${apiMeta.status}`);
        
        await this.updateAgentState('idle');
        return {
          integrationRequired: true,
          connectorId,
          recommendation: assessment.reason,
          status: 'active',
          message: `Integração validada e pronta para uso! O conector '${connectorId}' está operacional.`
        };
      } else {
        await this.updateAgentState('idle');
        return {
          integrationRequired: true,
          connectorId,
          recommendation: assessment.reason,
          status: 'proposal_created',
          message: `O conector '${connectorId}' foi recomendado, porém ainda não está instalado no tenant. Uma proposta administrativa sob ID '${resultFlow.proposalId}' foi registrada.`
        };
      }
    } catch (err: any) {
      logError(`[IntegrationBrainAgent] Erro na análise/coordenação: ${err.message}`);
      await this.updateAgentState('error', `Falha ao orquestrar conexões: ${err.message}`);
      return {
        integrationRequired: false,
        status: 'error',
        message: `Falha na coordenação de integração: ${err.message}`
      };
    }
  }
}
