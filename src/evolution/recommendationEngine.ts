import { GoogleGenAI, Type } from '@google/genai';
import { ModelManager } from '../kernel/ModelManager.ts';
import { EvolutionStore, Recommendation } from './evolutionStore.ts';
import { PerformanceEngine } from './performanceEngine.ts';
import { MemoryEngine } from './memoryEngine.ts';
import { logInfo, logError } from '../logs/logger.ts';

export class RecommendationEngine {
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
   * Obtém todas as recomendações disponíveis
   */
  public static getRecommendations(): Recommendation[] {
    return EvolutionStore.get().recommendations;
  }

  /**
   * Gera recomendações adaptativas automáticas para um agente baseado nas métricas e memórias
   */
  public static async generateAgentRecommendations(agentId: string): Promise<Recommendation[]> {
    logInfo(`RecommendationEngine gerando recomendações para o agente [${agentId}]`);

    const metrics = PerformanceEngine.getMetrics(agentId);
    const memories = MemoryEngine.getMemories(agentId);
    const bestPractices = MemoryEngine.getBestPractices(agentId);
    const failures = MemoryEngine.getRecentFailures(agentId);

    const generatedRecs: Recommendation[] = [];

    // Fallback padrão se não houver Gemini API
    const fallbackRec: Recommendation = {
      id: 'rec_' + Math.random().toString(36).substr(2, 9),
      agentId,
      type: 'prompt',
      title: `Evolução de Robustez para [${agentId}]`,
      description: `Com base em ${memories.length} execuções catalogadas, recomenda-se acrescentar verificações automáticas de formato de saída para mitigar a latência.`,
      impactScore: 8,
      status: 'pending',
      actionableChange: { promptSuffix: 'Garanta saídas estritamente estruturadas e valide campos ausentes nas primeiras linhas.' },
      createdAt: new Date().toISOString()
    };

    const ai = this.getAI();
    if (ai) {
      try {
        const systemInstruction = `Você é o AI Evolution Recommendation Engine. Seu objetivo é analisar as métricas e o histórico de execuções de um agente de IA para formular uma RECOMENDAÇÃO TÁTICA E ESPECÍFICA (melhoria em prompts ou parâmetros) que aumentará seu Score Geral e Eficiência.
Retorne SEMPRE em formato JSON correspondente ao esquema fornecido.`;

        const prompt = `Analise o agente:
ID: ${agentId}
Métricas de Performance Atuais: ${JSON.stringify(metrics)}
Últimas Memórias (Histórico): ${JSON.stringify(memories.slice(-5))}
Melhores Práticas: ${JSON.stringify(bestPractices)}
Erros de Execução Recentes: ${JSON.stringify(failures)}

Com base nesses dados, gere de 1 a 2 recomendações estratégicas acionáveis para evoluir este agente (ex: otimização de diretrizes de prompts, ajuste de temperaturas, ou regras de prioridade de tarefas).`;

        const responseSchema = {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ["prompt", "parameter", "workflow", "prioritization"], description: "Tipo de melhoria sugerida" },
              title: { type: Type.STRING, description: "Título claro e sucinto da recomendação" },
              description: { type: Type.STRING, description: "Texto explicando a causa identificada e por que essa mudança trará benefícios de produtividade" },
              impactScore: { type: Type.INTEGER, description: "Estimativa do score de impacto de 1 a 10" },
              actionableChange: {
                type: Type.OBJECT,
                properties: {
                  promptSuffix: { type: Type.STRING, description: "Sufixo de diretriz de prompt se for do tipo 'prompt'" },
                  temperature: { type: Type.NUMBER, description: "Ajuste sugerido de temperatura de modelo se for do tipo 'parameter'" }
                }
              }
            },
            required: ["type", "title", "description", "impactScore", "actionableChange"]
          }
        };

        const response = await ModelManager.generateContent('recommendation_engine', ai, {
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
          if (Array.isArray(parsed)) {
            parsed.forEach((item: any) => {
              generatedRecs.push({
                id: 'rec_' + Math.random().toString(36).substr(2, 9),
                agentId,
                type: item.type,
                title: item.title,
                description: item.description,
                impactScore: item.impactScore,
                status: 'pending',
                actionableChange: item.actionableChange,
                createdAt: new Date().toISOString()
              });
            });
          }
        }
      } catch (err: any) {
        logError(`Erro ao gerar recomendação com Gemini: ${err.message}. Retornando recomendação estática estruturada.`);
      }
    }

    if (generatedRecs.length === 0) {
      generatedRecs.push(fallbackRec);
    }

    // Salva as novas recomendações na base geral
    const state = EvolutionStore.get();
    state.recommendations.push(...generatedRecs);
    EvolutionStore.save(state);
    EvolutionStore.addLog(`Gerada(s) ${generatedRecs.length} nova(s) recomendação(ões) para o agente [${agentId}].`);

    return generatedRecs;
  }

  /**
   * Aplica uma recomendação aprovada de forma controlada
   */
  public static applyRecommendation(recId: string): boolean {
    const state = EvolutionStore.get();
    const rec = state.recommendations.find(r => r.id === recId);
    if (!rec) return false;

    rec.status = 'applied';

    const change = rec.actionableChange;
    if (change) {
      // Se tiver sufixo de prompt, aplica
      if (change.promptSuffix) {
        state.activeEvolvedPrompts[rec.agentId] = change.promptSuffix;
      }
      // Se tiver ajuste de parâmetros
      if (change.temperature !== undefined) {
        if (!state.activeEvolvedParams[rec.agentId]) {
          state.activeEvolvedParams[rec.agentId] = {};
        }
        state.activeEvolvedParams[rec.agentId].temperature = change.temperature;
      }
    }

    EvolutionStore.save(state);
    EvolutionStore.addLog(`Recomendação [${recId}] aplicada com sucesso para [${rec.agentId}]. Alterações táticas injetadas.`);
    return true;
  }

  /**
   * Rejeita/arquiva uma recomendação
   */
  public static rejectRecommendation(recId: string): boolean {
    const state = EvolutionStore.get();
    const rec = state.recommendations.find(r => r.id === recId);
    if (!rec) return false;

    rec.status = 'rejected';
    EvolutionStore.save(state);
    EvolutionStore.addLog(`Recomendação [${recId}] de [${rec.agentId}] rejeitada pelo supervisor.`);
    return true;
  }
}
