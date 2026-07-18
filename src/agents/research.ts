import { ModelManager } from '../kernel/ModelManager.ts';
import { GoogleGenAI, Type } from '@google/genai';
import { Repository } from '../db/repository.ts';
import { ResearchSearch, ResearchTrend, ResearchNiche, ResearchOpportunity, ResearchReport } from '../types.ts';
import { logInfo, logWarn, logError } from '../logs/logger.ts';

const DEFAULT_RESEARCH_PROMPT = `Você é o Research Agent (Pesquisador de Mercado), o agente especialista em inteligência de mercado da "AI Business Factory".
Sua função é identificar tendências emergentes, mapear problemas reais que pessoas e empresas enfrentam, analisar a demanda de mercado e descobrir oportunidades lucrativas de produtos digitais (como ebooks, cursos, mentorias, ferramentas SaaS simplificadas e modelos prontos).

DIRETRIZES DE ATUAÇÃO:
1. Análise de Nichos: Avalie o tamanho do público, a disposição de pagamento e as barreiras de entrada.
2. Identificação de Dores (Pain Points): Descubra o que causa frustração, perda de dinheiro ou tempo para o público-alvo.
3. Diferenciação Estratégica: Proponha abordagens únicas de valor para que novos produtos não concorram por preço baixo.
4. Critérios de Pontuação (Score):
   - Demand Score (1-10): Volume de interesse e buscas.
   - Financial Score (1-10): Disposição e capacidade financeira do público para comprar a solução.
   - Competition Score (1-10): Quão saturado está o nicho (menor competição = score mais alto).
   - Creation Ease Score (1-10): Quão simples é produzir esse produto.
   - Launch Speed Score (1-10): Velocidade de colocação no mercado.
   - Final Score: Média ponderada destes fatores.`;

export class ResearchAgent {
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
   * Simula e sintetiza uma pesquisa avançada na web sobre uma determinada palavra-chave/nicho
   * Utiliza o Gemini para estruturar resultados de busca, tendências e novos nichos derivados.
   */
  static async executeSearch(query: string): Promise<{
    search: ResearchSearch;
    trends: Omit<ResearchTrend, 'id' | 'timestamp'>[];
    niches: Omit<ResearchNiche, 'id' | 'timestamp'>[];
    opportunities: Omit<ResearchOpportunity, 'id' | 'timestamp'>[];
  }> {
    logInfo(`Research Agent iniciando pesquisa profunda sobre o tema: "${query}"`);
    const ai = this.getAI();

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        searchedQuery: { type: Type.STRING },
        synthesizedResults: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de 3 a 5 insights extraídos como se fossem resultados de buscas da web" },
        trends: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING, description: "Tema ou palavra-chave em alta" },
              growthRate: { type: Type.STRING, description: "Porcentagem ou termo descritivo de crescimento (ex: '+45% a/a', 'Crescimento Exponencial')" },
              source: { type: Type.STRING, description: "Canal/fonte recomendada (ex: Google Trends, TikTok, Reddit, Product Hunt)" },
              volume: { type: Type.STRING, description: "Volume estimado de menções/buscas" },
              niche: { type: Type.STRING, description: "Nicho a que pertence" }
            },
            required: ["topic", "growthRate", "source", "volume", "niche"]
          }
        },
        niches: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Nome elegante do sub-nicho específico" },
              description: { type: Type.STRING, description: "Descrição de foco e posicionamento do sub-nicho" },
              audienceSize: { type: Type.STRING, description: "Tamanho estimado da audiência (Ex: Alto, Médio, Micro-Nicho)" },
              monetizationScore: { type: Type.NUMBER, description: "Nota de 1 a 10 de potencial de monetização" },
              competitiveness: { type: Type.STRING, enum: ["low", "medium", "high"], description: "Grau de concorrência" }
            },
            required: ["name", "description", "audienceSize", "monetizationScore", "competitiveness"]
          }
        },
        opportunities: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Título recomendado para o infoproduto inovador" },
              niche: { type: Type.STRING, description: "Sub-nicho de foco" },
              description: { type: Type.STRING, description: "Proposta única de valor do produto sugerido" },
              painPoint: { type: Type.STRING, description: "A dor central exata que o produto resolve" },
              differentiation: { type: Type.STRING, description: "Como se diferenciar de concorrentes genéricos" },
              demandScore: { type: Type.NUMBER, description: "Grau de demanda (1 a 10)" },
              financialScore: { type: Type.NUMBER, description: "Disposição de pagamento (1 a 10)" },
              competitionScore: { type: Type.NUMBER, description: "Nota favorável de concorrência (1 a 10, maior nota = menos concorrentes)" },
              creationEaseScore: { type: Type.NUMBER, description: "Facilidade de criação (1 a 10)" },
              launchSpeedScore: { type: Type.NUMBER, description: "Velocidade de lançamento (1 a 10)" }
            },
            required: [
              "title", "niche", "description", "painPoint", "differentiation",
              "demandScore", "financialScore", "competitionScore", "creationEaseScore", "launchSpeedScore"
            ]
          }
        }
      },
      required: ["searchedQuery", "synthesizedResults", "trends", "niches", "opportunities"]
    };

    const prompt = `Faça uma pesquisa profunda e identifique tendências comerciais, sub-nichos lucrativos e ideias de infoprodutos inovadores baseando-se no termo: "${query}". 
    Responda em Português do Brasil de forma extremamente detalhada e realista.`;

    try {
      const response = await ModelManager.generateContent('research', ai, {
        model: ModelManager.getModelName(),
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
          systemInstruction: DEFAULT_RESEARCH_PROMPT,
          temperature: 0.7
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Resposta de pesquisa vazia vinda da API do Gemini.");
      }

      const result = JSON.parse(responseText);

      // 1. Salvar a Pesquisa Realizada
      const createdSearch = await Repository.addResearchSearch({
        query: result.searchedQuery,
        resultsCount: result.synthesizedResults.length,
        results: Array.isArray(result.synthesizedResults) 
          ? result.synthesizedResults.join('\n') 
          : String(result.synthesizedResults || '')
      });

      // 2. Mapear e adicionar Tendências
      const createdTrends: ResearchTrend[] = [];
      for (const t of result.trends) {
        const trend = await Repository.addResearchTrend({
          topic: t.topic,
          growthRate: t.growthRate,
          source: t.source,
          volume: t.volume,
          niche: t.niche
        });
        createdTrends.push(trend);
      }

      // 3. Mapear e adicionar Nichos
      const createdNiches: ResearchNiche[] = [];
      for (const n of result.niches) {
        const niche = await Repository.addResearchNiche({
          name: n.name,
          description: n.description,
          audienceSize: n.audienceSize,
          monetizationScore: n.monetizationScore,
          competitiveness: n.competitiveness
        });
        createdNiches.push(niche);
      }

      // 4. Mapear e adicionar Oportunidades com Cálculo do Score Final
      const createdOpportunities: ResearchOpportunity[] = [];
      for (const o of result.opportunities) {
        // Cálculo ponderado simples de viabilidade comercial
        const rawFinal = (o.demandScore * 0.25) + (o.financialScore * 0.25) + (o.competitionScore * 0.20) + (o.creationEaseScore * 0.15) + (o.launchSpeedScore * 0.15);
        const finalScore = parseFloat(rawFinal.toFixed(1));

        const opportunity = await Repository.addResearchOpportunity({
          title: o.title,
          niche: o.niche,
          description: o.description,
          painPoint: o.painPoint,
          differentiation: o.differentiation,
          demandScore: o.demandScore,
          financialScore: o.financialScore,
          competitionScore: o.competitionScore,
          creationEaseScore: o.creationEaseScore,
          launchSpeedScore: o.launchSpeedScore,
          finalScore,
          status: 'pending'
        });
        createdOpportunities.push(opportunity);
      }

      logInfo(`Research Agent concluiu pesquisa com sucesso. ${createdTrends.length} tendências, ${createdNiches.length} nichos e ${createdOpportunities.length} oportunidades registradas.`);
      return {
        search: createdSearch,
        trends: createdTrends,
        niches: createdNiches,
        opportunities: createdOpportunities
      };
    } catch (err: any) {
      logError(`Erro crítico no Research Agent ao processar busca: "${query}"`, null, err);
      throw err;
    }
  }

  /**
   * Gera um relatório analítico de alta relevância mercadológica para um nicho específico
   * para guiar os próximos passos operacionais do CEO e os demais agentes.
   */
  static async generateMarketReport(nicheName: string): Promise<ResearchReport> {
    logInfo(`Research Agent gerando relatório analítico executivo para o nicho: "${nicheName}"`);
    const ai = this.getAI();

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        reportTitle: { type: Type.STRING },
        executiveSummary: { type: Type.STRING, description: "Resumo executivo do potencial mercadológico" },
        detailedAnalysis: { type: Type.STRING, description: "Análise profunda de tendências, concorrentes e público" },
        painPointsIdentified: { type: Type.ARRAY, items: { type: Type.STRING }, description: "As dores mais latentes que o público possui" },
        differentiationGuide: { type: Type.STRING, description: "Metodologia para fugir da guerra de preços" },
        monetizationAvenues: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Sugestões de formato de monetização (Ebook, Curso, Mentoria, SaaS)" },
        strategicRecommendations: { type: Type.STRING, description: "Passo a passo estratégico recomendado" }
      },
      required: [
        "reportTitle", "executiveSummary", "detailedAnalysis", "painPointsIdentified",
        "differentiationGuide", "monetizationAvenues", "strategicRecommendations"
      ]
    };

    const prompt = `Gere um relatório analítico de inteligência de mercado estruturado de altíssimo nível para o nicho: "${nicheName}".
    Foque em trazer insights extremamente claros, pragmáticos e acionáveis sobre como atuar com maestria nesse segmento.`;

    try {
      const response = await ModelManager.generateContent('research', ai, {
        model: ModelManager.getModelName(),
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
          systemInstruction: DEFAULT_RESEARCH_PROMPT,
          temperature: 0.6
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Resposta de relatório mercadológico retornada vazia pelo Gemini.");
      }

      const result = JSON.parse(responseText);

      // Estrutura o conteúdo em markdown legível e robusto
      const markdownContent = `## Resumo Executivo
${result.executiveSummary}

## Análise de Mercado & Concorrentes
${result.detailedAnalysis}

## Principais Dores Mapeadas no Público-Alvo
${result.painPointsIdentified.map((p: string, idx: number) => `${idx + 1}. **${p}**`).join('\n')}

## Diferenciação e Proposta de Valor
${result.differentiationGuide}

## Formas de Monetização Recomendadas
${result.monetizationAvenues.map((m: string) => `- ${m}`).join('\n')}`;

      const report = await Repository.addResearchReport({
        title: result.reportTitle,
        content: markdownContent,
        recommendations: result.strategicRecommendations
      });

      logInfo(`Relatório analítico "${report.title}" criado e persistido no sistema.`);
      return report;
    } catch (err: any) {
      logError(`Erro crítico no Research Agent ao estruturar relatório de nicho: "${nicheName}"`, null, err);
      throw err;
    }
  }

  /**
   * Analisa um objetivo geral e propõe um conjunto de nichos e oportunidades viáveis para o CEO Agent.
   */
  static async analyzeObjective(objective: string): Promise<ResearchOpportunity[]> {
    logInfo(`Research Agent analisando tese operacional para objetivo de fábrica: "${objective}"`);
    const ai = this.getAI();

    const responseSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Título comercial inovador sugerido para o produto" },
          niche: { type: Type.STRING, description: "Nicho em alta" },
          description: { type: Type.STRING, description: "Resumo conceitual da proposta única do infoproduto" },
          painPoint: { type: Type.STRING, description: "A maior dor que este infoproduto resolve de imediato" },
          differentiation: { type: Type.STRING, description: "Fórmula de destaque de mercado" },
          demandScore: { type: Type.NUMBER },
          financialScore: { type: Type.NUMBER },
          competitionScore: { type: Type.NUMBER },
          creationEaseScore: { type: Type.NUMBER },
          launchSpeedScore: { type: Type.NUMBER }
        },
        required: [
          "title", "niche", "description", "painPoint", "differentiation",
          "demandScore", "financialScore", "competitionScore", "creationEaseScore", "launchSpeedScore"
        ]
      }
    };

    const prompt = `Analise o seguinte objetivo de criação de negócios digitais:
    "${objective}"
    
    Proponha 3 oportunidades únicas de infoprodutos práticos, calculando as respectivas notas de viabilidade de acordo com a nossa metodologia de pontuação.`;

    try {
      const response = await ModelManager.generateContent('research', ai, {
        model: ModelManager.getModelName(),
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
          systemInstruction: DEFAULT_RESEARCH_PROMPT,
          temperature: 0.7
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Resposta de tese retornada vazia.");
      }

      const result = JSON.parse(responseText);
      const createdOpportunities: ResearchOpportunity[] = [];

      for (const o of result) {
        const rawFinal = (o.demandScore * 0.25) + (o.financialScore * 0.25) + (o.competitionScore * 0.20) + (o.creationEaseScore * 0.15) + (o.launchSpeedScore * 0.15);
        const finalScore = parseFloat(rawFinal.toFixed(1));

        const opportunity = await Repository.addResearchOpportunity({
          title: o.title,
          niche: o.niche,
          description: o.description,
          painPoint: o.painPoint,
          differentiation: o.differentiation,
          demandScore: o.demandScore,
          financialScore: o.financialScore,
          competitionScore: o.competitionScore,
          creationEaseScore: o.creationEaseScore,
          launchSpeedScore: o.launchSpeedScore,
          finalScore,
          status: 'pending'
        });
        createdOpportunities.push(opportunity);
      }

      logInfo(`Análise de objetivo concluída. ${createdOpportunities.length} novas oportunidades geradas de forma autônoma.`);
      return createdOpportunities;
    } catch (err: any) {
      logError(`Erro crítico no Research Agent ao mapear objetivo: "${objective}"`, null, err);
      throw err;
    }
  }
}
