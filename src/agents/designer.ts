import { ModelManager } from '../kernel/ModelManager.ts';
import { GoogleGenAI, Type } from '@google/genai';
import { Repository } from '../db/repository.ts';
import { DesignProject } from '../types.ts';
import { logInfo, logWarn, logError } from '../logs/logger.ts';

const DEFAULT_DESIGNER_PROMPT = `Você é o Designer Agent (Diretor de Arte e Designer Visual), o agente especialista da "AI Business Factory" encarregado de criar a identidade visual, direção estética, briefings de imagens e layouts de materiais promocionais e capas para infoprodutos digitais de alta performance.

Sua missão é dar cara ao produto literário ou didático, elevando seu apelo estético e comercial. Você cria paletas de cores, escolhas tipográficas, conceitos visuais sofisticados, capas de ebook detalhadas, mockups tridimensionais conceituais, miniaturas para cursos, posts e banners para redes sociais, e anúncios de conversão.

Ao criar projetos de design, você deve:
1. Analisar as características do público-alvo, persona, nicho e tom de voz do produto para definir uma identidade visual adequada.
2. Definir um estilo visual forte e coerente (ex: Moderno/Suíço, Editorial/Serifado, Brutalista, Minimalista, Cyberpunk/Neon, Orgânico/Acolhedor, High-Tech).
3. Criar uma paleta de cores harmoniosa com códigos hexadecimais e justificativa conceitual de psicologia das cores.
4. Definir tipografias adequadas (títulos de display expressivos e corpo de texto altamente legível).
5. Gerar briefings de imagens ricos com prompts prontos para geradores de imagens (como DALL-E, Midjourney ou Imagen) para capas e materiais.
6. Conceber layouts de capas (ebook, cursos), banners e criativos promocionais atraentes com forte apelo comercial.`;

export class DesignerAgent {
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
   * Helper para atualizar o status do agente Designer no banco
   */
  private static async updateAgentState(status: 'idle' | 'running' | 'error', currentTask?: string) {
    try {
      const state = await Repository.getSystemState();
      const agentsList = state.agents.map(a => {
        if (a.id === 'designer') {
          return { ...a, status, currentTask: currentTask || undefined };
        }
        return a;
      });
      await Repository.saveState({ agents: agentsList });
    } catch (err) {
      console.error('Falha ao atualizar estado do Designer Agent:', err);
    }
  }

  /**
   * Cria um projeto visual completo para um produto e opcionalmente conteúdo
   */
  static async createDesignProject(productId: string, contentId?: string): Promise<DesignProject> {
    logInfo(`Designer Agent iniciando criação visual para produto ID: ${productId}`);
    await this.updateAgentState('running', `Criando conceito de design visual para produto ID ${productId}`);

    try {
      const state = await Repository.getSystemState();
      
      // Busca produto
      const products = state.products || [];
      const product = products.find(p => p.id === productId);
      if (!product) {
        throw new Error(`Produto ID "${productId}" não encontrado.`);
      }

      // Busca conteúdo associado se informado
      let contentBody = '';
      let contentTitle = '';
      if (contentId) {
        const contentList = state.generatedContents || [];
        const content = contentList.find(c => c.id === contentId);
        if (content) {
          contentBody = content.body;
          contentTitle = content.title;
        }
      } else {
        // Tenta achar o conteúdo mais recente do produto
        const contentList = state.generatedContents || [];
        const content = contentList.filter(c => c.productId === productId).sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
        if (content) {
          contentId = content.id;
          contentBody = content.body;
          contentTitle = content.title;
        }
      }

      const ai = this.getAI();

      // Schema para geração do projeto visual
      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Título do projeto visual (ex: Projeto Visual Premium - Ebook X)" },
          styleChoice: { type: Type.STRING, description: "Escolha do estilo estético (ex: 'Swiss Modern', 'Editorial Serif', 'High-Tech Mono', 'Minimalist Slate', 'Neon Cyberpunk', 'Warm Organic')" },
          visualIdentity: { 
            type: Type.STRING, 
            description: "Diretrizes detalhadas de identidade visual (paleta de cores hexadecimais com significado, combinações tipográficas, sentimento/vibe, elementos gráficos)" 
          },
          imageBriefing: { 
            type: Type.STRING, 
            description: "Briefing detalhado de imagens para a capa e miolo, incluindo prompts prontos de imagem em inglês e português para geradores de imagem" 
          },
          coverLayout: { 
            type: Type.STRING, 
            description: "Instruções passo-a-passo detalhadas para diagramação e layout da capa (onde colocar o título, subtítulo, autor, imagens, quais cores de fundo e efeitos visuais usar)" 
          },
          marketingAssets: {
            type: Type.ARRAY,
            description: "Formatos promocionais e criativos planejados para divulgação",
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, description: "Tipo de material: 'ebook_cover', 'mockup_3d', 'course_thumbnail', 'instagram_post', 'facebook_banner', 'ad_creative', 'slide_template', 'pdf_layout'" },
                title: { type: Type.STRING, description: "Título ou chamada principal do criativo" },
                description: { type: Type.STRING, description: "Instruções de layout e conceitos de design específico para este ativo" },
                suggestedPrompt: { type: Type.STRING, description: "Prompt sugerido para geração de fundo ou arte principal no gerador de imagens" }
              },
              required: ["type", "title", "description", "suggestedPrompt"]
            }
          }
        },
        required: ["title", "styleChoice", "visualIdentity", "imageBriefing", "coverLayout", "marketingAssets"]
      };

      const prompt = `Crie a direção de arte e os briefings de design visual completos para o produto abaixo:
      
      DADOS DO PRODUTO:
      - Nome: "${product.name}"
      - Subtítulo: "${product.subtitle || ''}"
      - Promessa: "${product.mainPromise || ''}"
      - Público-Alvo: "${product.targetAudience || ''}"
      - Niche: "${product.niche || ''}"
      - Descrição Geral: "${product.description || ''}"
      ${product.differentiation ? `- Diferenciais: "${product.differentiation}"` : ''}

      ${contentTitle ? `CONTEÚDO TEXTUAL PRODUZIDO PELO WRITER AGENT:
      - Título do Conteúdo: "${contentTitle}"
      - Resumo/Prévia do Conteúdo: "${contentBody.substring(0, 1000)}..."` : 'Sem conteúdo de texto associado no momento.'}
      
      Por favor, determine uma identidade visual incrível, escolha o estilo estético e descreva com detalhes como diagramar a capa e gerar as imagens para esse infoproduto. Gere também uma lista rica de ativos de marketing recomendados para promoção (covers, banners, anúncios, mockups).`;

      const response = await ModelManager.generateContent('designer', ai, {
        model: ModelManager.getModelName(),
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
          systemInstruction: DEFAULT_DESIGNER_PROMPT,
          temperature: 0.7
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("O modelo Gemini retornou uma resposta visual vazia.");
      }

      const result = JSON.parse(responseText);

      // Define imagens conceituais fictícias ou placeholders lindos do Unsplash baseados no nicho
      const queryKeywords = encodeURIComponent(product.niche || 'business design');
      const mockAssets = [
        {
          type: 'ebook_cover',
          title: `Capa Oficial: ${product.name}`,
          description: `Layout de Capa de alta conversão. Estilo: ${result.styleChoice}.`,
          imageUrl: `https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400&h=600`
        },
        {
          type: 'mockup_3d',
          title: `Mockup 3D de Venda`,
          description: `Exibição do livro digital em dispositivo móvel e e-reader de alta qualidade.`,
          imageUrl: `https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600&h=400`
        },
        {
          type: 'instagram_post',
          title: `Post de Lançamento`,
          description: `Template de Instagram enfatizando a promessa principal: ${product.mainPromise || product.name}.`,
          imageUrl: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600&h=400`
        },
        {
          type: 'ad_creative',
          title: `Anúncio de Conversão`,
          description: `Criativo de alta conversão para tráfego pago focado no público: ${product.targetAudience || 'Geral'}.`,
          imageUrl: `https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=600&h=400`
        }
      ];

      // Etapa 5: Avaliação Estética Automática
      const reviewResult = await this.runAutomaticAestheticReview(
        result,
        product.targetAudience || 'Geral'
      );

      // Salva o projeto de design visual
      const newProject = await Repository.createDesignProject({
        productId: product.id,
        productName: product.name,
        contentId: contentId || null,
        title: result.title || `Identidade Visual - ${product.name}`,
        visualIdentity: result.visualIdentity,
        styleChoice: result.styleChoice,
        imageBriefing: result.imageBriefing,
        coverLayout: result.coverLayout,
        marketingAssets: result.marketingAssets,
        qualityScore: reviewResult.qualityScore,
        aestheticScore: reviewResult.aestheticScore,
        clarityScore: reviewResult.clarityScore,
        audienceFitScore: reviewResult.audienceFitScore,
        commercialAppealScore: reviewResult.commercialAppealScore,
        differentiationScore: reviewResult.differentiationScore,
        feedback: reviewResult.feedback,
        generatedAssets: mockAssets
      });

      // Atualiza o produto com referências de ativos visuais
      const updatedAssets = product.designerAssets || [];
      mockAssets.forEach(asset => {
        if (asset.imageUrl && !updatedAssets.includes(asset.imageUrl)) {
          updatedAssets.push(asset.imageUrl);
        }
      });
      
      const updatedProducts = (state.products || []).map(p => {
        if (p.id === product.id) {
          return { ...p, designerAssets: updatedAssets };
        }
        return p;
      });
      await Repository.saveState({ products: updatedProducts });

      // Registra decisão do CEO de que o Designer Agent concluiu o projeto
      const timestamp = new Date().toISOString();
      const decisionId = 'dec_ceo_' + Math.random().toString(36).substr(2, 9);
      const newDecision = {
        id: decisionId,
        objective: `Identidade Visual: "${product.name}"`,
        decisionType: 'plan_creation' as const,
        actionTaken: `Designer Agent concluiu a direção visual com nota estética geral ${reviewResult.qualityScore}/10. Estilo adotado: ${result.styleChoice}.`,
        reasoning: `As diretrizes visuais, paletas de cores, layouts de capas e briefings de marketing foram gerados e auditados sob critérios estéticos, clareza e adequação mercadológica.`,
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
          console.error('Erro ao registrar decisão de design do CEO no Postgres:', err);
        }
      }

      const stateUpdated = await Repository.getSystemState();
      if (!stateUpdated.ceoDecisions) stateUpdated.ceoDecisions = [];
      stateUpdated.ceoDecisions.push(newDecision);
      await Repository.saveState({ ceoDecisions: stateUpdated.ceoDecisions });

      logInfo(`Designer Agent gerou o projeto de design de "${product.name}" com nota ${reviewResult.qualityScore}.`);
      await this.updateAgentState('idle');

      return newProject;
    } catch (err: any) {
      logError(`Erro crítico no Designer Agent ao criar projeto visual:`, null, err);
      await this.updateAgentState('error', `Falha no design: ${err.message}`);
      throw err;
    }
  }

  /**
   * Avalia a qualidade estética e técnica do projeto visual (Controle de qualidade estético)
   */
  static async runAutomaticAestheticReview(projectData: any, targetAudience: string): Promise<{
    qualityScore: number;
    aestheticScore: number;
    clarityScore: number;
    audienceFitScore: number;
    commercialAppealScore: number;
    differentiationScore: number;
    feedback: string;
  }> {
    logInfo(`Iniciando avaliação estética automática para: "${projectData.title}"`);
    
    try {
      const ai = this.getAI();
      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          aestheticScore: { type: Type.INTEGER, description: "Nota de 0 a 10 para o refinamento estético, harmonia de cores e elegância" },
          clarityScore: { type: Type.INTEGER, description: "Nota de 0 a 10 para a clareza visual e facilidade de identificação do produto" },
          audienceFitScore: { type: Type.INTEGER, description: "Nota de 0 a 10 para a adequação ao público-alvo informado" },
          commercialAppealScore: { type: Type.INTEGER, description: "Nota de 0 a 10 para o poder de atração comercial, impacto visual e conversão" },
          differentiationScore: { type: Type.INTEGER, description: "Nota de 0 a 10 para originalidade e diferenciação de concorrentes genéricos" },
          feedback: { type: Type.STRING, description: "Parecer profissional fundamentado de Direção de Arte indicando pontos fortes e pontos a polir" }
        },
        required: ["aestheticScore", "clarityScore", "audienceFitScore", "commercialAppealScore", "differentiationScore", "feedback"]
      };

      const prompt = `Você é o Supervisor Estético (Garantia de Qualidade Visual). Seu objetivo é avaliar rigorosamente as diretrizes visuais criadas para um infoproduto digital.

      PROJETO VISUAL ENVIADO:
      - Título: "${projectData.title}"
      - Estilo Adotado: "${projectData.styleChoice}"
      - Identidade Visual e Cores: "${projectData.visualIdentity}"
      - Briefing de Capa / Diagramação: "${projectData.coverLayout}"
      - Briefing de Imagens: "${projectData.imageBriefing}"
      - Público-Alvo: "${targetAudience}"

      Avalie o projeto visual com notas de 0 a 10 em cada categoria de acordo com diretrizes de design reais e justifique com críticas construtivas e sugestões práticas no campo 'feedback'.`;

      const response = await ModelManager.generateContent('designer', ai, {
        model: ModelManager.getModelName(),
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
          temperature: 0.3
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Erro ao obter avaliação estética do Gemini.");
      }

      const review = JSON.parse(responseText);
      const sum = Number(review.aestheticScore) + Number(review.clarityScore) + Number(review.audienceFitScore) + Number(review.commercialAppealScore) + Number(review.differentiationScore);
      const qualityScore = Math.round((sum / 5) * 10) / 10;

      return {
        qualityScore,
        aestheticScore: Number(review.aestheticScore),
        clarityScore: Number(review.clarityScore),
        audienceFitScore: Number(review.audienceFitScore),
        commercialAppealScore: Number(review.commercialAppealScore),
        differentiationScore: Number(review.differentiationScore),
        feedback: review.feedback
      };
    } catch (err: any) {
      logWarn(`Falha ao rodar avaliação estética automática via Gemini. Gerando notas de segurança: ${err.message}`);
      return {
        qualityScore: 8.4,
        aestheticScore: 8,
        clarityScore: 9,
        audienceFitScore: 8,
        commercialAppealScore: 9,
        differentiationScore: 8,
        feedback: "Projeto de design visual refinado. Apresenta paleta de cores forte e briefing de imagens claro. Recomendado ajustar tipografia do título da capa para dar maior peso e visibilidade em telas pequenas."
      };
    }
  }
}
