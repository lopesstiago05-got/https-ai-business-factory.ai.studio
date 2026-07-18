import { GoogleGenAI } from '@google/genai';
import { Repository } from '../db/repository.ts';
import { Kernel } from './index.ts';
import { logInfo, logWarn, logError } from '../logs/logger.ts';

export class ModelManager {
  private static PRIMARY_MODEL = process.env.PRIMARY_MODEL || 'gemini-3.5-flash';
  private static FALLBACK_MODELS = ['gemini-3.1-flash-lite', 'gemini-3.1-pro-preview'];

  // Track exhausted models for the current runtime session to avoid repeated quota errors
  private static exhaustedModels: Set<string> = new Set();
  private static activePrimaryModel: string | null = null;

  /**
   * Retorna o nome do modelo primário atual, promovendo dinamicamente se houver esgotamento
   */
  public static getModelName(): string {
    if (this.activePrimaryModel) {
      return this.activePrimaryModel;
    }

    // Se o modelo configurado como primário foi esgotado, procura o primeiro fallback não esgotado
    if (this.exhaustedModels.has(this.PRIMARY_MODEL)) {
      for (const fallback of this.FALLBACK_MODELS) {
        if (!this.exhaustedModels.has(fallback)) {
          logInfo(`[ModelManager] Modelo primário original ${this.PRIMARY_MODEL} esgotado. Promovendo fallback ${fallback} para modelo ativo.`);
          this.activePrimaryModel = fallback;
          return fallback;
        }
      }
    }

    return this.PRIMARY_MODEL;
  }

  /**
   * Retorna a lista de modelos de fallback configurados
   */
  public static getFallbackModels(): string[] {
    return this.FALLBACK_MODELS;
  }

  /**
   * Executa uma chamada para o Gemini API com tratamento de fallback automático e recuperação
   */
  public static async generateContent(
    agentId: string,
    ai: GoogleGenAI,
    params: any
  ): Promise<any> {
    // Garante que o modelo seja o configurado pelo ModelManager se não especificado
    if (!params.model) {
      params.model = this.getModelName();
    }

    // Se o modelo solicitado estiver marcado como esgotado, tenta o próximo ativo
    if (this.exhaustedModels.has(params.model)) {
      const activeModel = this.getModelName();
      if (activeModel !== params.model) {
        logInfo(`[ModelManager] Substituindo modelo esgotado ${params.model} por ${activeModel} antes de realizar a chamada.`);
        params.model = activeModel;
      }
    }

    try {
      logInfo(`[ModelManager] Iniciando chamada para o modelo ${params.model} (Agente: ${agentId})`);
      const response = await ai.models.generateContent(params);
      return response;
    } catch (err: any) {
      const errorMessage = err.message || JSON.stringify(err);
      logWarn(`[ModelManager] Erro detectado na chamada do modelo ${params.model} para o agente ${agentId}: ${errorMessage}`);

      // Verifica se é erro de cota excedida ou limite de requisições
      const isQuotaError = errorMessage.includes('429') ||
                           errorMessage.includes('RESOURCE_EXHAUSTED') ||
                           errorMessage.includes('Resource has been exhausted') ||
                           errorMessage.includes('quota') ||
                           errorMessage.includes('Quota') ||
                           errorMessage.includes('exceeded') ||
                           errorMessage.includes('limit');

      if (isQuotaError) {
        this.exhaustedModels.add(params.model);
        logWarn(`[ModelManager] Adicionando ${params.model} aos modelos esgotados da sessão.`);
        
        // Se o modelo esgotado era o primário ativo, invalida para que o próximo getModelName() promova um novo
        if (this.activePrimaryModel === params.model || params.model === this.PRIMARY_MODEL) {
          this.activePrimaryModel = null;
        }
      }

      // Verifica se é erro 404 (modelo indisponível/descontinuado), 503 (serviço indisponível), timeout ou quota limit
      const isModelError = errorMessage.includes('404') || 
                           errorMessage.includes('NOT_FOUND') || 
                           errorMessage.includes('no longer available') ||
                           errorMessage.includes('not found');
      
      const isTemporaryError = errorMessage.includes('503') ||
                                errorMessage.includes('UNAVAILABLE') ||
                                errorMessage.includes('timeout') ||
                                isQuotaError;

      if (isModelError || isTemporaryError) {
        // Registrar Auditoria no Kernel
        try {
          const kernel = Kernel.getInstance();
          await kernel.logAudit(
            'ModelCallFailed',
            'kernel',
            `Chamada falhou para o modelo ${params.model}. Agente: ${agentId}. Erro: ${errorMessage}. Iniciando fallback automático.`,
            `Agent-${agentId}`
          );
        } catch (auditErr) {
          console.error('[ModelManager] Falha ao registrar auditoria de erro:', auditErr);
        }

        // Tentar fallback se houver modelos alternativos
        for (const fallbackModel of this.FALLBACK_MODELS) {
          if (fallbackModel === params.model || this.exhaustedModels.has(fallbackModel)) continue;

          try {
            logInfo(`[ModelManager] Tentando fallback para o modelo alternativo: ${fallbackModel} (Agente: ${agentId})`);
            
            // Registrar auditoria da tentativa de fallback
            try {
              await Kernel.getInstance().logAudit(
                'ModelFallbackAttempt',
                'kernel',
                `Tentando modelo alternativo ${fallbackModel} para o agente ${agentId} após falha no modelo ${params.model}.`,
                `Agent-${agentId}`
              );
            } catch {}

            const updatedParams = { ...params, model: fallbackModel };
            const response = await ai.models.generateContent(updatedParams);
            
            logInfo(`[ModelManager] Fallback bem-sucedido com o modelo ${fallbackModel} para o agente ${agentId}`);
            
            // Atualizar status do agente no banco para idle ou recuperado
            await this.recoverAgentStatus(agentId);

            return response;
          } catch (fallbackErr: any) {
            const fallbackErrMsg = fallbackErr.message || JSON.stringify(fallbackErr);
            logError(`[ModelManager] Falha também no modelo de fallback ${fallbackModel}: ${fallbackErrMsg}`);
            
            // Se o fallback também esgotou cota, marca ele também
            if (fallbackErrMsg.includes('429') || fallbackErrMsg.includes('quota') || fallbackErrMsg.includes('exceeded')) {
              this.exhaustedModels.add(fallbackModel);
            }
          }
        }
      }

      // Se todos falharem ou se for outro tipo de erro, propaga o erro
      throw err;
    }
  }

  /**
   * Restaura o status do agente no banco de dados para evitar travar em 'error'
   */
  public static async recoverAgentStatus(agentId: string): Promise<void> {
    try {
      const state = await Repository.getSystemState();
      const agentsList = state.agents.map(a => {
        if (a.id === agentId && a.status === 'error') {
          return { ...a, status: 'idle' as const, currentTask: undefined };
        }
        return a;
      });
      await Repository.saveState({ agents: agentsList });
      logInfo(`[ModelManager] Agente ${agentId} recuperado com sucesso para status 'idle'`);
      
      // Registrar auditoria
      try {
        await Kernel.getInstance().logAudit(
          'AgentAutoRecovered',
          'kernel',
          `Agente ${agentId} recuperado e restaurado para status idle pelo ModelManager.`,
          'ModelManager'
        );
      } catch {}
    } catch (err) {
      console.error(`[ModelManager] Falha ao recuperar status do agente ${agentId}:`, err);
    }
  }
}
