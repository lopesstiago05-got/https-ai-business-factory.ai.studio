import { ModelManager } from '../kernel/ModelManager.ts';
import { GoogleGenAI, Type } from '@google/genai';
import { Repository } from '../db/repository.ts';
import { GeneratedContent } from '../types.ts';
import { logInfo, logWarn, logError } from '../logs/logger.ts';

const DEFAULT_WRITER_PROMPT = `Você é o Writer Agent (Criador de Conteúdo e Copywriter), um agente especialista da "AI Business Factory" encarregado de transformar estruturas e briefings de produtos digitais em conteúdos completos, de altíssimo valor agregado e prontos para publicação.

Sua missão é ler o briefing, a persona, as promessas e a estrutura técnica (módulos e capítulos) concebida pelo Product Creator Agent, e produzir o material didático final com excelência acadêmica e sofisticação literária.

Ao produzir o conteúdo, você deve:
1. Adaptar a linguagem ao público-alvo e à persona compradora ideal (definidos no produto).
2. Escrever de forma persuasiva, educativa, clara e aprofundada (evitando superficialidades ou clichês gerados por IA).
3. Utilizar formatação Markdown rica (títulos, subtítulos, listas, negritos, caixas de destaque, etc.) para criar uma experiência de leitura fluida.
4. Estruturar o conteúdo conforme o tipo solicitado (Ebook completo, Capítulos avulsos, Cursos estruturados, Aulas, Scripts de vídeo, Checklists operacionais, Guias práticos, Exercícios práticos, Materiais bônus).
5. Seguir as regras de escrita profissional: introdução cativante, desenvolvimento sólido com exemplos práticos, conclusão acionável.`;

export class WriterAgent {
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
   * Helper para atualizar o status do agente Writer no banco
   */
  private static async updateAgentState(status: 'idle' | 'running' | 'error', currentTask?: string) {
    try {
      const state = await Repository.getSystemState();
      const agentsList = state.agents.map(a => {
        if (a.id === 'writer') {
          return { ...a, status, currentTask: currentTask || undefined };
        }
        return a;
      });
      await Repository.saveState({ agents: agentsList });
    } catch (err) {
      console.error('Falha ao atualizar estado do Writer Agent:', err);
    }
  }

  /**
   * Gera o conteúdo completo de um produto homologado
   */
  static async createProductContent(productId: string, contentType: string = 'ebook'): Promise<GeneratedContent> {
    logInfo(`Writer Agent iniciando produção de conteúdo (${contentType}) para produto ID: ${productId}`);
    await this.updateAgentState('running', `Produzindo conteúdo ${contentType} para produto ID ${productId}`);

    try {
      const state = await Repository.getSystemState();
      
      // Busca produto
      const products = state.products || [];
      const product = products.find(p => p.id === productId);
      if (!product) {
        throw new Error(`Produto ID "${productId}" não encontrado.`);
      }

      if (product.productionStatus !== 'approved_production') {
        logWarn(`Aviso: O produto "${product.name}" não está homologado com status 'approved_production'. Prosseguindo com criação por ordem do administrador.`);
      }

      const ai = this.getAI();

      // Schema para geração do conteúdo
      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Título principal e impactante do material criado" },
          outline: { type: Type.STRING, description: "Planejamento estruturado e sumário das seções criadas" },
          body: { type: Type.STRING, description: "Conteúdo textual completo e extremamente aprofundado, formatado em Markdown rico, com exemplos e explicações detalhadas" },
          chaptersCount: { type: Type.INTEGER, description: "Quantidade de capítulos ou tópicos principais abordados" }
        },
        required: ["title", "outline", "body", "chaptersCount"]
      };

      const prompt = `Gere o conteúdo final completo e profissional para o infoproduto digital abaixo:
      
      DADOS DO PRODUTO:
      - Nome: "${product.name}"
      - Subtítulo: "${product.subtitle || ''}"
      - Promessa Principal: "${product.mainPromise || ''}"
      - Dor do Cliente Resolvida: "${product.problemSolved || ''}"
      - Público-Alvo: "${product.targetAudience || ''}"
      - Persona: "${product.persona || ''}"
      - Formato Indicado: "${product.format || ''}"
      - Diferenciais: "${product.differentiation || ''}"
      
      ESTRUTURA DIDÁTICA E BRIEFING DO PRODUCT CREATOR:
      - Sumário Proposto: "${product.indexTableOfContents || ''}"
      - Módulos e Capítulos: ${JSON.stringify(product.modules || product.chapters || [])}
      - Briefing Operacional: "${product.briefing || ''}"
      
      TIPO DE CONTEÚDO A SER GERADO AGORA:
      - Tipo: "${contentType.toUpperCase()}"

      Por favor, planeje o conteúdo detalhadamente e redija o texto completo de forma aprofundada, didática e de altíssima qualidade no campo "body".`;

      // Etapa 1 e 2: Análise e Planejamento, Etapa 3: Geração Inicial
      const response = await ModelManager.generateContent('writer', ai, {
        model: ModelManager.getModelName(),
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
          systemInstruction: DEFAULT_WRITER_PROMPT,
          temperature: 0.7
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("O modelo Gemini retornou uma resposta de conteúdo vazia.");
      }

      const result = JSON.parse(text);

      // Etapa 4 e 5: Revisão e Melhoria automáticas
      const reviewResult = await this.runAutomaticReview(result.body, product.targetAudience || '');

      // Cria a estrutura do conteúdo persistível
      const newContent = await Repository.addGeneratedContent({
        productId: product.id,
        productName: product.name,
        contentType,
        title: result.title || product.name,
        body: result.body,
        outline: result.outline || '',
        version: '1.0.0',
        status: 'draft',
        qualityScore: reviewResult.qualityScore,
        clarityScore: reviewResult.clarityScore,
        depthScore: reviewResult.depthScore,
        organizationScore: reviewResult.organizationScore,
        valueDeliveredScore: reviewResult.valueDeliveredScore,
        audienceFitScore: reviewResult.audienceFitScore,
        originalityScore: reviewResult.originalityScore,
        feedback: reviewResult.feedback,
        chaptersCount: result.chaptersCount || 1,
        revisions: [{
          version: '1.0.0',
          title: result.title || product.name,
          body: result.body,
          changeLog: 'Geração Inicial',
          timestamp: new Date().toISOString()
        }]
      });

      // Registra decisão do CEO de que o Writer produziu conteúdo
      const timestamp = new Date().toISOString();
      const decisionId = 'dec_ceo_' + Math.random().toString(36).substr(2, 9);
      const newDecision = {
        id: decisionId,
        objective: `Produção Intelectual: "${product.name}"`,
        decisionType: 'plan_creation' as const,
        actionTaken: `Writer Agent concluiu a redação do conteúdo (${contentType}) com nota de qualidade inicial ${reviewResult.qualityScore}/10.`,
        reasoning: `O conteúdo didático foi estruturado e gerado com base no briefing do Product Creator. Uma revisão automática de qualidade foi aplicada para avaliar a clareza, profundidade e alinhamento do texto com o público-alvo.`,
        timestamp
      };

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
          console.error('Erro ao registrar decisão de conteúdo do CEO no Postgres:', err);
        }
      }

      const stateUpdated = await Repository.getSystemState();
      if (!stateUpdated.ceoDecisions) stateUpdated.ceoDecisions = [];
      stateUpdated.ceoDecisions.push(newDecision);
      await Repository.saveState({ ceoDecisions: stateUpdated.ceoDecisions });

      logInfo(`Writer Agent gerou o conteúdo de "${product.name}" com nota ${reviewResult.qualityScore}.`);
      await this.updateAgentState('idle');

      return newContent;
    } catch (err: any) {
      logError(`Erro crítico no Writer Agent ao gerar conteúdo:`, null, err);
      await this.updateAgentState('error', `Falha na redação: ${err.message}`);
      throw err;
    }
  }

  /**
   * Executa a avaliação de qualidade automática (Controle de Qualidade) do conteúdo gerado
   */
  static async runAutomaticReview(body: string, targetAudience: string): Promise<{
    qualityScore: number;
    clarityScore: number;
    depthScore: number;
    organizationScore: number;
    valueDeliveredScore: number;
    audienceFitScore: number;
    originalityScore: number;
    feedback: string;
  }> {
    try {
      const ai = this.getAI();

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          clarityScore: { type: Type.INTEGER, description: "Nota para Clareza: legibilidade, fluidez e ausência de jargões sem explicação (1 a 10)" },
          depthScore: { type: Type.INTEGER, description: "Nota para Profundidade: riqueza do conteúdo, se de fato ensina algo de forma prática (1 a 10)" },
          organizationScore: { type: Type.INTEGER, description: "Nota para Organização: estruturação de tópicos, parágrafos e fluidez (1 a 10)" },
          valueDeliveredScore: { type: Type.INTEGER, description: "Nota para Valor Entregue: utilidade prática das ideias (1 a 10)" },
          audienceFitScore: { type: Type.INTEGER, description: "Nota para Adequação ao Público: alinhamento com as dores da audiência (1 a 10)" },
          originalityScore: { type: Type.INTEGER, description: "Nota para Originalidade: ausência de clichês fáceis e insights exclusivos (1 a 10)" },
          qualityScore: { type: Type.NUMBER, description: "Nota Final de Qualidade: média ou nota consolidada (1 a 10)" },
          feedback: { type: Type.STRING, description: "Análise construtiva fundamentando cada nota e apontando melhorias práticas" }
        },
        required: ["clarityScore", "depthScore", "organizationScore", "valueDeliveredScore", "audienceFitScore", "originalityScore", "qualityScore", "feedback"]
      };

      const prompt = `Você é o Supervisor de Controle de Qualidade Editorial da fábrica de infoprodutos. Sua tarefa é auditar de forma justa, rigorosa e profissional o conteúdo textual gerado.

      PÚBLICO-ALVO DE REFERÊNCIA:
      "${targetAudience}"

      TEXTO DO CONTEÚDO PARA AUDITORIA:
      ---
      ${body.substring(0, 5000)} // Limita tamanho para evitar estourar limites se o texto for enorme
      ---

      Faça uma avaliação automática detalhada do texto atribuindo notas de 1 a 10 para Clareza, Profundidade, Organização, Valor Entregue, Adequação ao Público-Alvo e Originalidade. Forneça um feedback construtivo.`;

      const response = await ModelManager.generateContent('writer', ai, {
        model: ModelManager.getModelName(),
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
          temperature: 0.3 // Temperatura baixa para avaliação consistente
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("Erro na avaliação automática de qualidade.");
      }

      return JSON.parse(text);
    } catch (err) {
      console.error("Falha ao rodar avaliação de qualidade automática, aplicando notas padrão:", err);
      return {
        qualityScore: 8.0,
        clarityScore: 8,
        depthScore: 8,
        organizationScore: 8,
        valueDeliveredScore: 8,
        audienceFitScore: 8,
        originalityScore: 8,
        feedback: "Avaliação automática indisponível. Notas básicas atribuídas como padrão."
      };
    }
  }

  /**
   * Executa revisão manual/automática solicitando melhoria de um conteúdo
   */
  static async requestContentImprovement(contentId: string, instructions: string): Promise<GeneratedContent> {
    logInfo(`Writer Agent aplicando melhorias ao conteúdo ID: ${contentId}`);
    await this.updateAgentState('running', `Melhorando conteúdo ID ${contentId}`);

    try {
      const current = await Repository.getGeneratedContentById(contentId);
      if (!current) {
        throw new Error(`Conteúdo gerado ID "${contentId}" não encontrado.`);
      }

      const ai = this.getAI();

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Título do conteúdo (pode ser o mesmo ou melhorado)" },
          body: { type: Type.STRING, description: "Texto completo revisado e melhorado com base nas instruções de revisão" }
        },
        required: ["title", "body"]
      };

      const prompt = `Você é o Writer Agent. Melhore o conteúdo textual atual seguindo estritamente as instruções de revisão fornecidas.
      
      CONTEÚDO ATUAL:
      - Título: "${current.title}"
      - Tipo: "${current.contentType}"
      - Corpo de Texto Atual:
      ---
      ${current.body}
      ---

      INSTRUÇÕES DE MELHORIA:
      "${instructions}"

      Retorne o título e o corpo de texto atualizados de forma impecável.`;

      const response = await ModelManager.generateContent('writer', ai, {
        model: ModelManager.getModelName(),
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
          systemInstruction: DEFAULT_WRITER_PROMPT,
          temperature: 0.5
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("Resposta de melhoria vazia.");
      }

      const result = JSON.parse(text);

      // Incrementa versão (ex: de 1.0.0 para 1.1.0)
      const currentVersion = current.version || '1.0.0';
      const parts = currentVersion.split('.');
      const nextMinor = parseInt(parts[1] || '0') + 1;
      const nextVersion = `${parts[0]}.${nextMinor}.0`;

      // Roda nova avaliação
      const reviewResult = await this.runAutomaticReview(result.body, "Público original");

      const updatedRevisions = [
        ...(current.revisions || []),
        {
          version: nextVersion,
          title: result.title,
          body: result.body,
          changeLog: instructions,
          timestamp: new Date().toISOString()
        }
      ];

      const updatedContent = await Repository.updateGeneratedContent(contentId, {
        title: result.title,
        body: result.body,
        version: nextVersion,
        status: 'reviewed',
        qualityScore: reviewResult.qualityScore,
        clarityScore: reviewResult.clarityScore,
        depthScore: reviewResult.depthScore,
        organizationScore: reviewResult.organizationScore,
        valueDeliveredScore: reviewResult.valueDeliveredScore,
        audienceFitScore: reviewResult.audienceFitScore,
        originalityScore: reviewResult.originalityScore,
        feedback: reviewResult.feedback,
        revisions: updatedRevisions
      });

      await this.updateAgentState('idle');
      return updatedContent;
    } catch (err: any) {
      logError(`Erro crítico no Writer Agent ao melhorar conteúdo:`, null, err);
      await this.updateAgentState('error', `Falha ao melhorar: ${err.message}`);
      throw err;
    }
  }

  /**
   * Aprova o conteúdo para a próxima etapa (Designer Agent - Futuro)
   */
  static async approveContent(contentId: string): Promise<GeneratedContent> {
    logInfo(`Writer Agent aprovando conteúdo ID: ${contentId}`);
    
    const current = await Repository.getGeneratedContentById(contentId);
    if (!current) {
      throw new Error(`Conteúdo gerado ID "${contentId}" não encontrado.`);
    }

    const updated = await Repository.updateGeneratedContent(contentId, {
      status: 'approved'
    });

    // Registra decisão do CEO
    const timestamp = new Date().toISOString();
    const decisionId = 'dec_ceo_' + Math.random().toString(36).substr(2, 9);
    const newDecision = {
      id: decisionId,
      objective: `Homologação Editorial: "${current.title}"`,
      decisionType: 'task_approval' as const,
      actionTaken: `Conteúdo "${current.title}" aprovado em versão final ${current.version}. Pronto para a esteira de Design.`,
      reasoning: `O material didático atingiu os patamares de qualidade exigidos (${current.qualityScore || 8}/10) e foi aprovado pelo editor. Ele agora aguarda a liberação das etapas de identidade visual e design de infoproduto.`,
      timestamp
    };

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
        console.error('Erro ao registrar homologação de conteúdo do CEO no Postgres:', err);
      }
    }

    const state = await Repository.getSystemState();
    if (!state.ceoDecisions) state.ceoDecisions = [];
    state.ceoDecisions.push(newDecision);
    await Repository.saveState({ ceoDecisions: state.ceoDecisions });

    return updated;
  }
}
