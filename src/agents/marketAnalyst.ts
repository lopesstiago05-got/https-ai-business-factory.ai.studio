import { ModelManager } from '../kernel/ModelManager.ts';
import { GoogleGenAI, Type } from '@google/genai';
import { Repository } from '../db/repository.ts';
import { MarketAnalysis, ResearchOpportunity } from '../types.ts';
import { logInfo, logWarn, logError } from '../logs/logger.ts';

const DEFAULT_MARKET_ANALYST_PROMPT = `Você é o Market Analyst Agent (Analista de Mercado), o agente especialista em inteligência de mercado e viabilidade comercial da "AI Business Factory".
Sua função é receber uma oportunidade de negócio recomendada pelo Research Agent, auditá-la de forma estratégica e emitir um parecer comercial completo, justificando o potencial de sucesso ou fracasso antes de iniciarmos qualquer criação de produto ou estratégia de marketing.

DIRETRIZES DE ATUAÇÃO:
1. Avalie rigorosamente a oportunidade fornecida.
2. Atribua pontuações de 0 a 10 (inteiros) para os seguintes 8 critérios específicos de viabilidade de negócio:
   - demandScore (Demanda de Mercado): Grau de interesse e volume de busca pelas dores da persona.
   - urgencyScore (Urgência do Problema): Quão latente, urgente ou cara é a dor para o cliente final.
   - buyingPowerScore (Poder de Compra do Público): Disposição e poder aquisitivo do público-alvo para pagar pela solução.
   - competitionScore (Concorrência): Ausência de alternativas diretas no mercado (nota mais alta = menos concorrentes/mais fácil competir).
   - differentiationScore (Facilidade de Diferenciação): Viabilidade de se posicionar de forma única e evitar guerras de preço.
   - creationEaseScore (Velocidade de Criação/MVP): Facilidade técnica e baixo custo para conceber o produto digital inicial.
   - scalingPotentialScore (Potencial de Escala): Escalabilidade infinita do produto digital (baixo custo marginal).
   - profitMarginScore (Margem de Lucro Estimada): Proporção de margem líquida com base na distribuição orgânica/paga estimada.

3. Escreva um parecer comercial formal (expertOpinion) que explique detalhadamente a lógica do seu posicionamento, identificando forças, fraquezas, oportunidades e riscos da ideia.
4. Identifique o público-alvo principal (targetAudience), estime o preço ideal de venda do produto em reais (BRL) e apresente uma projeção de viabilidade financeira (financialViability) contendo ROI e projeção inicial de vendas.`;

export class MarketAnalystAgent {
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
   * Helper para atualizar o status operacional do Market Analyst no banco
   */
  private static async updateAgentState(status: 'idle' | 'running' | 'error', currentTask?: string) {
    try {
      const state = await Repository.getSystemState();
      const agentsList = state.agents.map(a => {
        if (a.id === 'market_analyst') {
          return { ...a, status, currentTask: currentTask || undefined };
        }
        return a;
      });
      await Repository.saveState({ agents: agentsList });
    } catch (err) {
      console.error('Falha ao atualizar estado do Market Analyst Agent:', err);
    }
  }

  /**
   * Recebe uma oportunidade pelo ID, realiza a análise mercadológica profunda via LLM,
   * pontua de 0 a 10 os critérios, calcula a nota final e toma a decisão estratégica
   * de recomendação de aprovação ou rejeição, enviando o parecer e notificando o CEO Agent.
   */
  static async analyzeOpportunity(opportunityId: string): Promise<MarketAnalysis> {
    logInfo(`Market Analyst Agent iniciando análise estratégica para oportunidade ID: ${opportunityId}`);
    await this.updateAgentState('running', `Analisando oportunidade ID ${opportunityId}`);

    try {
      const opportunities = await Repository.getSystemState().then(s => s.researchOpportunities || []);
      const targetOpp = opportunities.find(o => o.id === opportunityId);

      if (!targetOpp) {
        throw new Error(`Oportunidade com ID "${opportunityId}" não foi encontrada no banco.`);
      }

      const ai = this.getAI();

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          demandScore: { type: Type.INTEGER, description: "Nota de 0 a 10 (inteiro) para demanda e interesse de buscas" },
          urgencyScore: { type: Type.INTEGER, description: "Nota de 0 a 10 (inteiro) para urgência ou nível de dor do cliente" },
          buyingPowerScore: { type: Type.INTEGER, description: "Nota de 0 a 10 (inteiro) para poder aquisitivo e disposição de pagamento" },
          competitionScore: { type: Type.INTEGER, description: "Nota de 0 a 10 (inteiro) para facilidade perante concorrência existente" },
          differentiationScore: { type: Type.INTEGER, description: "Nota de 0 a 10 (inteiro) para potencial de diferenciação" },
          creationEaseScore: { type: Type.INTEGER, description: "Nota de 0 a 10 (inteiro) para facilidade de criação ou produção inicial" },
          scalingPotentialScore: { type: Type.INTEGER, description: "Nota de 0 a 10 (inteiro) para potencial de escala" },
          profitMarginScore: { type: Type.INTEGER, description: "Nota de 0 a 10 (inteiro) para margem de lucro estimada" },
          targetAudience: { type: Type.STRING, description: "Definição refinada do público-alvo ideal e dores que o produto focará" },
          estimatedPrice: { type: Type.NUMBER, description: "Preço de venda estimado ideal em Reais (BRL). Exemplo: 97.00 ou 197.00" },
          financialViability: { type: Type.STRING, description: "Análise resumida sobre viabilidade de custos, ROI provável e vendas projetadas" },
          expertOpinion: { type: Type.STRING, description: "Parecer comercial e estratégico detalhado recomendando aprovar ou rejeitar a oportunidade" },
          recommendations: { type: Type.STRING, description: "Passos e recomendações recomendados para otimizar o produto antes da produção" }
        },
        required: [
          "demandScore", "urgencyScore", "buyingPowerScore", "competitionScore",
          "differentiationScore", "creationEaseScore", "scalingPotentialScore",
          "profitMarginScore", "targetAudience", "estimatedPrice", "financialViability",
          "expertOpinion", "recommendations"
        ]
      };

      const prompt = `Analise detalhadamente a seguinte oportunidade de infoproduto digital:
      - Título: "${targetOpp.title}"
      - Sub-nicho: "${targetOpp.niche}"
      - Descrição da Proposta: "${targetOpp.description}"
      - Dor Principal (Pain Point): "${targetOpp.painPoint}"
      - Abordagem de Diferenciação: "${targetOpp.differentiation}"
      - Notas originais do Pesquisador (0-10): Demanda=${targetOpp.demandScore}, Financeira=${targetOpp.financialScore}, Competição=${targetOpp.competitionScore}, Facilidade=${targetOpp.creationEaseScore}, Velocidade=${targetOpp.launchSpeedScore}.

      Atribua as notas de 0 a 10 para os critérios operacionais conforme as diretrizes e gere o parecer estratégico em Português do Brasil.`;

      const response = await ModelManager.generateContent('market_analyst', ai, {
        model: ModelManager.getModelName(),
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
          systemInstruction: DEFAULT_MARKET_ANALYST_PROMPT,
          temperature: 0.6
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("O modelo Gemini retornou uma análise de mercado vazia.");
      }

      const result = JSON.parse(text);

      // Calcula a média aritmética exata em código para as 8 pontuações (0 a 10)
      const sum = 
        (result.demandScore || 0) +
        (result.urgencyScore || 0) +
        (result.buyingPowerScore || 0) +
        (result.competitionScore || 0) +
        (result.differentiationScore || 0) +
        (result.creationEaseScore || 0) +
        (result.scalingPotentialScore || 0) +
        (result.profitMarginScore || 0);
      const finalScore = parseFloat((sum / 8).toFixed(1));

      // Decisão estratégica: Status de aprovação
      // Nota Final >= 7.0 -> Approved (Aprovado), caso contrário -> Rejected (Rejeitado)
      const decisionStatus = finalScore >= 7.0 ? 'approved' : 'rejected';

      // 1. Salvar parecer analítico na tabela de análises
      const createdAnalysis = await Repository.addMarketAnalysis({
        opportunityId: targetOpp.id,
        opportunityTitle: targetOpp.title,
        niche: targetOpp.niche,
        demandScore: result.demandScore,
        urgencyScore: result.urgencyScore,
        buyingPowerScore: result.buyingPowerScore,
        competitionScore: result.competitionScore,
        differentiationScore: result.differentiationScore,
        creationEaseScore: result.creationEaseScore,
        scalingPotentialScore: result.scalingPotentialScore,
        profitMarginScore: result.profitMarginScore,
        finalScore,
        targetAudience: result.targetAudience,
        estimatedPrice: result.estimatedPrice,
        financialViability: result.financialViability,
        expertOpinion: result.expertOpinion,
        recommendations: result.recommendations,
        status: decisionStatus
      });

      // 2. Comunicar com CEO Agent: Atualiza o status da oportunidade original
      await Repository.updateResearchOpportunityStatus(targetOpp.id, decisionStatus);

      // 3. Registrar a decisão no histórico do CEO se aprovado, simulando a recepção pelo CEO Agent
      if (decisionStatus === 'approved') {
        const timestamp = new Date().toISOString();
        const decisionId = 'dec_ceo_' + Math.random().toString(36).substr(2, 9);
        
        // Vamos buscar as decisões atuais e adicionar a nova decisão do CEO baseada no parecer do Market Analyst
        const state = await Repository.getSystemState();
        const currentDecisions = state.ceoDecisions || [];
        
        // Cria uma decisão estratégica no CEO baseada no parecer
        const newDecision = {
          id: decisionId,
          objective: `Avaliação comercial do infoproduto "${targetOpp.title}"`,
          decisionType: 'task_approval' as const,
          actionTaken: `Aprovado para desenvolvimento com base no parecer de viabilidade do Market Analyst (Nota Final: ${finalScore}/10).`,
          reasoning: `O Market Analyst Agent validou a oportunidade "${targetOpp.title}" no nicho "${targetOpp.niche}". O parecer comercial confirmou alta dor do cliente (Urgência: ${result.urgencyScore}) e precificação sugerida em R$ ${result.estimatedPrice}. Parecer: "${result.expertOpinion.substring(0, 250)}..."`,
          timestamp
        };

        // Salva a decisão no Postgres ou no fallback
        if (Repository['isPGAvailable']()) {
          try {
            const { getDB } = await import('../db/index.ts');
            const { ceoDecisions: ceoDecisionsTable } = await import('../db/schema.ts');
            const db = getDB();
            await db.insert(ceoDecisionsTable).values({
              id: newDecision.id,
              objective: newDecision.objective,
              decisionType: newDecision.decisionType,
              actionTaken: newDecision.actionTaken,
              reasoning: newDecision.reasoning,
              timestamp: newDecision.timestamp,
              createdAt: new Date()
            });
          } catch (err) {
            console.error('Erro ao registrar decisão do CEO no Postgres:', err);
          }
        }
        
        // Também atualiza o fallback local para manter integridade
        if (!state.ceoDecisions) state.ceoDecisions = [];
        state.ceoDecisions.push(newDecision);
        await Repository.saveState({ ceoDecisions: state.ceoDecisions });
      }

      logInfo(`Market Analyst Agent concluiu análise da oportunidade "${targetOpp.title}" com pontuação final ${finalScore} e decisão de status: "${decisionStatus}".`);
      await this.updateAgentState('idle');

      return createdAnalysis;
    } catch (err: any) {
      logError(`Erro crítico no Market Analyst Agent ao analisar oportunidade ID: ${opportunityId}`, null, err);
      await this.updateAgentState('error', `Falha na análise: ${err.message}`);
      throw err;
    }
  }
}
