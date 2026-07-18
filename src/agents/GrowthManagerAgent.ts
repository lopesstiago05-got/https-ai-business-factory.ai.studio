import { GoogleGenAI } from '@google/genai';
import { Repository } from '../db/repository.ts';
import { AgentInfo } from '../types.ts';
import { logInfo, logWarn, logError } from '../logs/logger.ts';
import { GrowthEngine } from '../growth/growthEngine.ts';

export class GrowthManagerAgent {
  public static readonly ID = 'growth_manager_agent';
  public static readonly NAME = 'Growth Manager Agent';
  public static readonly ROLE = 'Estrategista de Growth & Escala';
  public static readonly DESCRIPTION = 'Responsável por monitorar de forma autônoma os funis de marketing, orçamentos de tráfego, taxas de conversão e faturamento global para desenhar e sugerir planos estratégicos de crescimento agressivos.';

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
   * Registra o Growth Manager Agent no Orchestrator se não estiver listado
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
      console.error('Falha ao atualizar estado do Growth Manager Agent:', err);
    }
  }

  /**
   * Executa uma auditoria analítica inteligente sobre o desempenho global da plataforma
   */
  public static async performGrowthAudit(): Promise<{
    auditSummary: string;
    strategicPlanProposals: string[];
    suggestedAction: string;
  }> {
    await this.registerIfNeeded();
    await this.updateAgentState('running', 'Conduzindo auditoria de tráfego, LTV, CAC e churn global...');

    const localState = GrowthEngine.getGlobalState();
    const metricsStr = JSON.stringify(localState.metrics, null, 2);
    const oppsStr = JSON.stringify(localState.opportunities, null, 2);

    let auditSummary = 'O ecossistema apresenta excelentes indicadores de crescimento orgânico e LTV saudável.';
    let strategicPlanProposals = [
      'Alocar orçamento em anúncios focados no criativo de depoimentos para "Gestão de Tempo para Solopreneurs".',
      'Pausar conjuntos de anúncios com CTR menor que 1.2% e CAC superior a R$ 60.'
    ];
    let suggestedAction = 'Escalar tráfego do infoproduto principal.';

    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Você é o Growth Manager Agent, o estrategista de escala global do negócio.
        Analise os indicadores de desempenho e as oportunidades detectadas a seguir:

        Métricas Atuais:
        ${metricsStr}

        Oportunidades de Crescimento Detectadas:
        ${oppsStr}

        Gere um relatório de auditoria resumido, focando em gargalos, sugestões de realocação de verba e planos de ação prioritários para alavancar receita.
        Retorne no formato JSON estrito:
        {
          "auditSummary": "Resumo executivo de 2-3 frases sobre a operação",
          "strategicPlanProposals": [
            "Proposta 1: detalhada",
            "Proposta 2: detalhada"
          ],
          "suggestedAction": "Ação imediata recomendada"
        }`,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      if (parsed.auditSummary) auditSummary = parsed.auditSummary;
      if (parsed.strategicPlanProposals) strategicPlanProposals = parsed.strategicPlanProposals;
      if (parsed.suggestedAction) suggestedAction = parsed.suggestedAction;

      await this.updateAgentState('idle');
    } catch (err: any) {
      logWarn(`[GrowthManagerAgent] Erro ao consultar IA para auditoria de crescimento: ${err.message}. Retornando heurística local.`);
      await this.updateAgentState('idle');
    }

    return {
      auditSummary,
      strategicPlanProposals,
      suggestedAction
    };
  }
}
