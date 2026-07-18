import { GoogleGenAI, Type } from '@google/genai';
import { ModelManager } from '../kernel/ModelManager.ts';
import { Repository } from '../db/repository.ts';
import { AgentManager } from '../agents/orchestrator.ts';
import { AgentInfo } from '../types.ts';
import { logInfo, logWarn, logError } from '../logs/logger.ts';
import { EvolutionStore, Recommendation, ABTest } from './evolutionStore.ts';
import { PerformanceEngine } from './performanceEngine.ts';
import { RecommendationEngine } from './recommendationEngine.ts';
import { ABTestingEngine } from './abTestingEngine.ts';

export class EvolutionManagerAgent {
  private static ID = 'evolution_manager';
  private static NAME = 'Evolution Manager Agent';
  private static ROLE = 'Gerente de Evolução e Otimização';
  private static DESCRIPTION = 'Monitora o desempenho dos agentes, identifica gargalos, detecta oportunidades, conduz testes A/B e recomenda melhorias contínuas.';

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

  /**
   * Registra automaticamente o Evolution Manager Agent no Orchestrator se não estiver presente
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
          efficiency: 98,
          description: this.DESCRIPTION
        };
        state.agents.push(newAgent);
        await Repository.saveState({ agents: state.agents });
        logInfo(`${this.NAME} registrado com sucesso no sistema.`);
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
      console.error('Falha ao atualizar estado do Evolution Manager Agent:', err);
    }
  }

  /**
   * Ciclo Geral de Evolução:
   * Monitora todos os agentes, mede desempenho, identifica gargalos, detecta oportunidades e gera recomendações estratégicas.
   */
  public static async runEvolutionCycle(): Promise<{
    success: boolean;
    bottlenecks: string[];
    opportunities: string[];
    newRecommendationsCount: number;
    report: string;
  }> {
    logInfo(`[EvolutionManagerAgent] Iniciando Ciclo de Auditoria e Evolução de IA.`);
    await this.registerIfNeeded();
    await this.updateAgentState('running', 'Auditando performance dos agentes e identificando oportunidades');

    const state = await Repository.getSystemState();
    const evoState = EvolutionStore.get();
    
    const bottlenecks: string[] = [];
    const opportunities: string[] = [];
    let newRecommendationsCount = 0;

    // 1. Analisa métricas de performance de cada agente para mapear Gargalos e Oportunidades
    for (const agent of state.agents) {
      if (agent.id === this.ID) continue;

      const metrics = PerformanceEngine.getMetrics(agent.id);

      // Gargalo: Baixa Taxa de Sucesso (< 90%), Baixa Precisão (< 85%), ou tempo de resposta muito alto (> 12s)
      if (metrics.successRate < 90 || metrics.precision < 85 || metrics.avgResponseTime > 12) {
        const issue = `Agente [${agent.name}]: Baixo desempenho detectado (Precisão: ${metrics.precision}%, Tempo Médio: ${metrics.avgResponseTime}s).`;
        bottlenecks.push(issue);
        
        // Dispara geração automática de recomendações com Gemini
        try {
          const recs = await RecommendationEngine.generateAgentRecommendations(agent.id);
          newRecommendationsCount += recs.length;
        } catch (err) {
          logWarn(`Falha ao gerar recomendações de IA para o gargalo do agente ${agent.id}`);
        }
      } 
      // Oportunidade: Agentes de alto desempenho (Score > 92%) que podem receber testes A/B para maximizar velocidade/roi
      else if (metrics.performanceScore >= 92 && metrics.taskCount > 3) {
        const opportunity = `Agente [${agent.name}]: Desempenho excelente (${metrics.performanceScore}%). Oportunidade de criar testes A/B para refinar prompts.`;
        opportunities.push(opportunity);
        
        // Cria teste A/B se não houver um rodando para este agente
        const hasActiveTest = evoState.abTests.some(t => t.agentId === agent.id && t.status === 'running');
        if (!hasActiveTest) {
          try {
            ABTestingEngine.createTest({
              agentId: agent.id,
              title: `Otimização A/B de Prompt para o ${agent.name}`,
              variantA: {
                promptSuffix: 'Mantenha as respostas concisas e estruture os dados em listas numeradas limpas para processamento acelerado.',
                params: { temperature: 0.5 }
              },
              variantB: {
                promptSuffix: 'Foque em gerar respostas ricas em insights criativos, detalhando as justificativas e diferenciais competitivos.',
                params: { temperature: 0.8 }
              }
            });
            EvolutionStore.addLog(`Criado teste A/B automático para otimizar o agente de alta performance [${agent.id}].`);
          } catch (err) {
            logWarn(`Falha ao gerar teste A/B automático para o agente ${agent.id}`);
          }
        }
      }
    }

    // 2. Produzir Relatório de Evolução Consolidado usando Gemini
    let report = `### RELATÓRIO DE EVOLUÇÃO DOS AGENTES DE IA (CONTROLE CONTROLADO)
Status: Auditoria Finalizada com Sucesso.

Gargalos Identificados:
${bottlenecks.length > 0 ? bottlenecks.map(b => `- ${b}`).join('\n') : '- Nenhum gargalo crítico de desempenho detectado.'}

Oportunidades de Otimização:
${opportunities.length > 0 ? opportunities.map(o => `- ${o}`).join('\n') : '- Nenhuma oportunidade pendente encontrada.'}

Novas Recomendações Geradas: ${newRecommendationsCount} recomendações adicionadas à fila de aprovação do Supervisor.`;

    try {
      const ai = this.getAI();
      const systemInstruction = `Você é o Evolution Manager Agent. Seu objetivo é redigir um relatório executivo analítico e altamente profissional sobre o progresso e a evolução tática dos agentes de IA da plataforma.`;
      const prompt = `Gere um relatório executivo detalhado em Português sobre o status da nossa inteligência coletiva.
Dados de Gargalos: ${JSON.stringify(bottlenecks)}
Dados de Oportunidades: ${JSON.stringify(opportunities)}
Métricas Gerais da Fábrica: ${JSON.stringify(evoState.agentMetrics)}
Últimos Logs de Evolução: ${JSON.stringify(evoState.logs.slice(-10))}

Formate o relatório em seções elegantes de Markdown contendo análise crítica, ações corretivas planejadas e projeção de eficiência.`;

      const response = await ModelManager.generateContent(this.ID, ai, {
        model: ModelManager.getModelName(),
        contents: prompt,
        config: { systemInstruction }
      });

      if (response.text) {
        report = response.text;
      }
    } catch (err: any) {
      logError(`Falha ao enriquecer relatório de evolução com Gemini: ${err.message}`);
    }

    // Grava relatório no log de evolução geral
    EvolutionStore.addLog(`Ciclo de evolução finalizado. ${bottlenecks.length} gargalos e ${opportunities.length} oportunidades mapeadas.`);
    await this.updateAgentState('idle');

    return {
      success: true,
      bottlenecks,
      opportunities,
      newRecommendationsCount,
      report
    };
  }
}
