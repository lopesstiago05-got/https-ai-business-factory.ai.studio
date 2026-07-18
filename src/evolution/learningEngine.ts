import { GoogleGenAI, Type } from '@google/genai';
import { ModelManager } from '../kernel/ModelManager.ts';
import { EvolutionStore } from './evolutionStore.ts';
import { PerformanceEngine } from './performanceEngine.ts';
import { MemoryEngine } from './memoryEngine.ts';
import { logInfo, logError } from '../logs/logger.ts';

export class LearningEngine {
  private static getAI(): GoogleGenAI | null {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return null;
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
   * Ciclo de Aprendizado (Learning Engine Cycle):
   * Executar -> Avaliar -> Comparar -> Gerar Aprendizado -> Salvar -> Atualizar
   */
  public static async evaluateAndLearn(params: {
    agentId: string;
    taskId: string;
    taskTitle: string;
    taskDescription: string;
    executionOutput: string;
    success: boolean;
    durationSeconds: number;
    feedbackReceived?: string;
  }): Promise<{
    qualityScore: number;
    bestPracticeLearned?: string;
    failureReason?: string;
    suggestedStrategy?: string;
    suggestedParams?: any;
  }> {
    const { agentId, taskId, taskTitle, taskDescription, executionOutput, success, durationSeconds, feedbackReceived } = params;
    logInfo(`LearningEngine iniciando ciclo de aprendizado para o agente [${agentId}], tarefa [${taskId}]`);

    const currentMetrics = PerformanceEngine.getMetrics(agentId);
    const bestPractices = MemoryEngine.getBestPractices(agentId);
    const recentFailures = MemoryEngine.getRecentFailures(agentId);

    let evaluation = {
      qualityScore: success ? 95 : 40,
      bestPracticeLearned: success ? 'Assegurar clareza e aderência máxima às regras informadas pelo supervisor.' : undefined,
      failureReason: success ? undefined : 'Falta de dados contextuais ou limite de tokens atingido.',
      suggestedStrategy: success ? 'Manter consistência do tom adotado.' : 'Reforçar o tratamento de erros e validação de formatos.',
      suggestedParams: undefined as any
    };

    const ai = this.getAI();
    if (ai) {
      try {
        const systemInstruction = `Você é o Learning Engine da AI Business Factory. Seu objetivo é analisar a execução de uma tarefa de um agente de IA, comparar com o histórico recente, e extrair aprendizados pragmáticos e novos parâmetros táticos sem alterar o código-fonte.
Retorne SEMPRE em formato JSON correspondente ao esquema fornecido.`;

        const prompt = `Analise a seguinte execução:
Agente de IA: ${agentId}
Métricas Atuais: Score Geral ${currentMetrics.performanceScore}%, Precisão ${currentMetrics.precision}%, Eficiência ${currentMetrics.efficiency}%
Histórico de Melhores Práticas: ${JSON.stringify(bestPractices)}
Histórico de Falhas: ${JSON.stringify(recentFailures)}

Tarefa Realizada: "${taskTitle}"
Descrição: "${taskDescription}"
Resultado obtido: "${executionOutput.substring(0, 1000)}"
Status de Sucesso: ${success ? 'SUCESSO' : 'FALHA'}
Tempo de Execução: ${durationSeconds} segundos
Feedback do Usuário/Supervisor: ${feedbackReceived || 'Nenhum'}

Retorne uma análise profunda avaliando a precisão do trabalho, uma recomendação de melhor prática e possíveis ajustes em parâmetros (ex: temperatura, maxTokens) para as próximas execuções.`;

        const responseSchema = {
          type: Type.OBJECT,
          properties: {
            qualityScore: { type: Type.INTEGER, description: "Nota de qualidade e precisão de 0 a 100 para a entrega realizada" },
            bestPracticeLearned: { type: Type.STRING, description: "Lição aprendida prática e direta para este tipo de tarefa caso tenha tido sucesso" },
            failureReason: { type: Type.STRING, description: "Causa raiz do erro de forma curta caso tenha falhado" },
            suggestedStrategy: { type: Type.STRING, description: "Recomendação de ajuste estratégico ou comportamental para a tese de decisão do agente" },
            suggestedParams: {
              type: Type.OBJECT,
              properties: {
                temperature: { type: Type.NUMBER, description: "Nova sugestão de temperatura (ex: 0.2 para ultra preciso, 0.8 para criativo)" },
                maxOutputTokens: { type: Type.INTEGER, description: "Limite de tokens de resposta" }
              }
            }
          },
          required: ["qualityScore"]
        };

        const response = await ModelManager.generateContent('learning_engine', ai, {
          model: ModelManager.getModelName(),
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          evaluation.qualityScore = parsed.qualityScore;
          if (parsed.bestPracticeLearned) evaluation.bestPracticeLearned = parsed.bestPracticeLearned;
          if (parsed.failureReason) evaluation.failureReason = parsed.failureReason;
          if (parsed.suggestedStrategy) evaluation.suggestedStrategy = parsed.suggestedStrategy;
          if (parsed.suggestedParams) evaluation.suggestedParams = parsed.suggestedParams;
        }
      } catch (err: any) {
        logError(`Erro na chamada do Gemini Learning Engine: ${err.message}. Usando avaliação de fallback inteligente.`);
      }
    }

    // 1. Salvar conhecimento na memória do agente
    MemoryEngine.recordMemory({
      agentId,
      taskId,
      taskTitle,
      decisionTaken: taskDescription,
      result: success ? 'success' : 'failure',
      strategyUsed: evaluation.suggestedStrategy || 'Padrão',
      feedbackReceived,
      failureReason: evaluation.failureReason,
      bestPracticeLearned: evaluation.bestPracticeLearned
    });

    // 2. Atualizar métricas de performance
    PerformanceEngine.recordExecution(
      agentId,
      success,
      durationSeconds,
      evaluation.qualityScore,
      success ? 250 : 0 // Adiciona valor econômico para tarefas de sucesso
    );

    // 3. Atualizar estratégia ativa (parâmetros dinâmicos e prompts evoluídos)
    if (evaluation.suggestedParams) {
      const state = EvolutionStore.get();
      if (!state.activeEvolvedParams[agentId]) {
        state.activeEvolvedParams[agentId] = {};
      }
      state.activeEvolvedParams[agentId] = {
        ...state.activeEvolvedParams[agentId],
        ...evaluation.suggestedParams
      };
      EvolutionStore.save(state);
      EvolutionStore.addLog(`Parâmetros dinâmicos do agente [${agentId}] otimizados de forma adaptativa.`);
    }

    return evaluation;
  }
}
