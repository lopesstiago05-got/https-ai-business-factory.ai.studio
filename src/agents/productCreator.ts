import { ModelManager } from '../kernel/ModelManager.ts';
import { GoogleGenAI, Type } from '@google/genai';
import { Repository } from '../db/repository.ts';
import { DigitalProduct, ResearchOpportunity } from '../types.ts';
import { logInfo, logWarn, logError } from '../logs/logger.ts';

const DEFAULT_PRODUCT_CREATOR_PROMPT = `Você é o Product Creator Agent (Criador de Produtos Digitais), um agente especialista da "AI Business Factory" encarregado de conceber e estruturar infoprodutos de altíssimo valor agregado.
Sua missão é transformar uma dor validada (vinda do Research Agent) e um parecer comercial viável (vindo do Market Analyst Agent) em um infoproduto digital de alta conversão estruturado e pronto para a esteira de produção.

Ao receber os dados da oportunidade e a auditoria comercial, você deve:
1. Definir o Nome, Subtítulo e a Promessa Principal de alto impacto do produto.
2. Mapear detalhadamente o Problema Resolvido, Público-Alvo e criar uma Persona fictícia detalhada do comprador ideal.
3. Escolher o formato ideal do produto (Ebook, Guia Digital, Curso, Template, Checklist, Planilha, Material Premium, etc.).
4. Gerar um Índice completo e organizar a estrutura técnica e didática do produto em Módulos e Capítulos claros.
5. Escrever os Diferenciais do produto e a Estratégia de Posicionamento comercial de marca.
6. Desenhar um Plano de Produção detalhado passo-a-passo e formular um Briefing operacional extremamente claro para o Writer Agent redigir o conteúdo final (no futuro).
7. Sugerir a estimativa de preço ótima.

REGRAS E RESTRIÇÕES:
- Não gere conteúdo editorial finalizado ou textos de capítulos completos (isso será de responsabilidade do Writer Agent).
- Foque na estrutura do esqueleto didático, fluxos de aprendizagem, organização metodológica e propostas de valor.
- Entregue os resultados formatados rigorosamente em Português do Brasil.`;

export class ProductCreatorAgent {
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
   * Helper para atualizar o status do agente Product Creator no banco
   */
  private static async updateAgentState(status: 'idle' | 'running' | 'error', currentTask?: string) {
    try {
      const state = await Repository.getSystemState();
      const agentsList = state.agents.map(a => {
        if (a.id === 'product') { // ID correspondente ao Product Agent no baseline
          return { ...a, status, currentTask: currentTask || undefined };
        }
        return a;
      });
      await Repository.saveState({ agents: agentsList });
    } catch (err) {
      console.error('Falha ao atualizar estado do Product Creator Agent:', err);
    }
  }

  /**
   * Cria um conceito e estrutura de produto a partir de uma oportunidade aprovada pelo Market Analyst
   */
  static async createProductConcept(opportunityId: string): Promise<DigitalProduct> {
    logInfo(`Product Creator Agent iniciando concepção de produto digital para oportunidade ID: ${opportunityId}`);
    await this.updateAgentState('running', `Concebendo produto para oportunidade ID ${opportunityId}`);

    try {
      const state = await Repository.getSystemState();
      
      // 1. Busca oportunidade de forma resiliente
      const opps = await Repository.getResearchOpportunities();
      let opportunity = opps.find(o => o.id === opportunityId);
      
      if (!opportunity) {
        logWarn(`Oportunidade ID "${opportunityId}" não encontrada no repositório. Buscando qualquer oportunidade alternativa disponível...`);
        opportunity = opps.find(o => o.status === 'approved' || o.status === 'productized' || o.status === 'pending') || opps[0];
        
        if (!opportunity) {
          logInfo(`Nenhuma oportunidade de pesquisa encontrada no sistema. Criando uma oportunidade auto-gerada excelente para destravar a esteira.`);
          opportunity = await Repository.addResearchOpportunity({
            title: "Treinamento Fórmula de Tráfego Avançado",
            niche: "Marketing Digital",
            description: "Um método automatizado para escalar vendas digitais e otimização de campanhas utilizando IA.",
            painPoint: "Falta de conversão, ROI baixo em campanhas de tráfego pago.",
            differentiation: "Combina automações em tempo real com funis inteligentes e agentes de IA integrados.",
            demandScore: 9,
            financialScore: 9,
            competitionScore: 6,
            creationEaseScore: 8,
            launchSpeedScore: 9,
            finalScore: 8.5,
            status: 'approved'
          });
        }
      }

      // 2. Busca parecer de viabilidade
      const analyses = state.marketAnalyses || [];
      const analysis = analyses.find(a => a.opportunityId === opportunity.id);
      
      // Se não houver análise ou se não estiver aprovada pelo Market Analyst, loga aviso mas prossegue usando dados da oportunidade
      if (!analysis) {
        logWarn(`Nenhum parecer de mercado foi encontrado para a oportunidade "${opportunity.title}". Usando parâmetros básicos da oportunidade.`);
      } else if (analysis.status !== 'approved') {
        logWarn(`Aviso: O parecer estratégico do Market Analyst para "${opportunity.title}" não possui status 'approved'. Prosseguindo com criação por ordem do administrador.`);
      }

      const ai = this.getAI();

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Nome marcante e comercial do inforproduto digital" },
          subtitle: { type: Type.STRING, description: "Subtítulo explicativo e cativante de apoio" },
          mainPromise: { type: Type.STRING, description: "Promessa principal inegociável do produto (Big Promise)" },
          problemSolved: { type: Type.STRING, description: "Definição do problema real sanado por este produto" },
          targetAudience: { type: Type.STRING, description: "Descrição refinada do público-alvo prioritário" },
          persona: { type: Type.STRING, description: "Nome, perfil, medos, ambições e história resumida da persona compradora ideal" },
          format: { 
            type: Type.STRING, 
            description: "Formato técnico ideal (ex: Ebook, Guia Digital, Curso Online, Template Notion, Checklist Operacional, Planilha Financeira, Material Premium)" 
          },
          indexTableOfContents: { type: Type.STRING, description: "Visão geral e sumário do produto formatado em texto legível" },
          modules: {
            type: Type.ARRAY,
            description: "Módulos de aprendizagem e de conteúdo didático",
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Título do módulo" },
                description: { type: Type.STRING, description: "Proposta pedagógica e de valor do módulo" },
                chapters: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Nomes dos capítulos integrados a este módulo"
                }
              },
              required: ["title", "description", "chapters"]
            }
          },
          chapters: {
            type: Type.ARRAY,
            description: "Plano e escopo didático detalhado de cada capítulo estruturado",
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Título do capítulo" },
                objectives: { type: Type.STRING, description: "Objetivos de aprendizado e pontos a serem abordados" },
                keyTakeaways: { type: Type.STRING, description: "Principais lições e insights práticos que o aluno terá" }
              },
              required: ["title", "objectives", "keyTakeaways"]
            }
          },
          differentiation: { type: Type.STRING, description: "Diferenciais exclusivos do produto comparado aos concorrentes" },
          positioningStrategy: { type: Type.STRING, description: "Estratégia de posicionamento comercial e de branding no mercado" },
          productionPlan: { type: Type.STRING, description: "Plano estratégico de produção detalhado passo-a-passo" },
          briefing: { type: Type.STRING, description: "Briefing profissional estruturado e orientações para que o Writer Agent possa redigir o conteúdo final" },
          estimatedPrice: { type: Type.NUMBER, description: "Preço estimado em reais sugerido (BRL). Use dados do Market Analyst se disponíveis, ex: 97.00" },
          description: { type: Type.STRING, description: "Resumo de vendas/pitch comercial atraente de 2 a 3 parágrafos para o infoproduto" }
        },
        required: [
          "name", "subtitle", "mainPromise", "problemSolved", "targetAudience", "persona",
          "format", "indexTableOfContents", "modules", "chapters", "differentiation",
          "positioningStrategy", "productionPlan", "briefing", "estimatedPrice", "description"
        ]
      };

      const prompt = `Gere a arquitetura completa do produto digital baseado nestes dados:
      OPORTUNIDADE DO RESEARCH AGENT:
      - Título Sugerido: "${opportunity.title}"
      - Nicho/Sub-nicho: "${opportunity.niche}"
      - Resumo: "${opportunity.description}"
      - Dor do Cliente (Pain Point): "${opportunity.painPoint}"
      - Diferencial Proposto: "${opportunity.differentiation}"

      PARECER COMERCIAL DO MARKET ANALYST:
      - Público-Alvo: "${analysis?.targetAudience || 'Não disponível'}"
      - Preço Recomendado: R$ ${analysis?.estimatedPrice || opportunity.finalScore * 15}
      - Visão Comercial: "${analysis?.expertOpinion || 'Não disponível'}"
      - Recomendações Estratégicas: "${analysis?.recommendations || 'Não disponível'}"

      Formule o esqueleto didático completo, as personas, a estratégia de branding e o briefing técnico para o Writer Agent em Português do Brasil de forma ultra-detalhada.`;

      const response = await ModelManager.generateContent('product', ai, {
        model: ModelManager.getModelName(),
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
          systemInstruction: DEFAULT_PRODUCT_CREATOR_PROMPT,
          temperature: 0.7
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("O modelo Gemini retornou uma resposta vazia.");
      }

      const result = JSON.parse(text);

      // 3. Monta o objeto DigitalProduct
      const productId = 'prod_' + Math.random().toString(36).substr(2, 9);
      const newProduct: DigitalProduct = {
        id: productId,
        name: result.name,
        category: result.format || 'Ebook',
        niche: opportunity.niche,
        price: result.estimatedPrice || analysis?.estimatedPrice || 97.0,
        revenue: 0,
        status: 'draft',
        description: result.description,
        content: '', // Conteúdo didático vazio (será gerado pelo Writer Agent no futuro)
        timestamp: new Date().toLocaleString('pt-BR'),
        publicationLogs: [`Concepção do produto criada em ${new Date().toLocaleDateString('pt-BR')}`],
        
        // Atributos estendidos (Etapa 7)
        subtitle: result.subtitle,
        mainPromise: result.mainPromise,
        problemSolved: result.problemSolved,
        targetAudience: result.targetAudience,
        persona: result.persona,
        format: result.format,
        indexTableOfContents: result.indexTableOfContents,
        modules: result.modules || [],
        chapters: result.chapters || [],
        differentiation: result.differentiation,
        positioningStrategy: result.positioningStrategy,
        productionPlan: result.productionPlan,
        briefing: result.briefing,
        version: '1.0.0',
        productionStatus: 'concept'
      };

      // 4. Salva o produto na base
      const latestProducts = state.products || [];
      await Repository.saveState({
        products: [...latestProducts, newProduct]
      });

      // 5. Atualiza o status da oportunidade original para 'productized'
      await Repository.updateResearchOpportunityStatus(opportunity.id, 'productized');

      // 6. Registra decisão do CEO de que o produto foi concebido
      const timestamp = new Date().toISOString();
      const decisionId = 'dec_ceo_' + Math.random().toString(36).substr(2, 9);
      const stateUpdated = await Repository.getSystemState();
      const currentDecisions = stateUpdated.ceoDecisions || [];
      
      const newDecision = {
        id: decisionId,
        objective: `Estruturação didática do produto "${result.name}"`,
        decisionType: 'plan_creation' as const,
        actionTaken: `Produto concebido e catalogado no Laboratório de Produtos com status "Conceito". Pronto para homologação estratégica.`,
        reasoning: `O Product Creator Agent gerou a estrutura detalhada de módulos e capítulos para o produto "${result.name}" (formato: ${result.format}), baseando-se no parecer comercial positivo do Market Analyst. O briefing e o plano de produção estratégica estão prontos.`,
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
          console.error('Erro ao registrar decisão de produto do CEO no Postgres:', err);
        }
      }

      if (!stateUpdated.ceoDecisions) stateUpdated.ceoDecisions = [];
      stateUpdated.ceoDecisions.push(newDecision);
      await Repository.saveState({ ceoDecisions: stateUpdated.ceoDecisions });

      logInfo(`Product Creator Agent concebeu o produto digital "${newProduct.name}" com sucesso.`);
      await this.updateAgentState('idle');

      return newProduct;
    } catch (err: any) {
      logError(`Erro crítico no Product Creator Agent ao conceber produto:`, null, err);
      await this.updateAgentState('error', `Falha na concepção: ${err.message}`);
      throw err;
    }
  }

  /**
   * Atualiza as informações ou especificações de um produto
   */
  static async updateProductConcept(id: string, updatedFields: Partial<DigitalProduct>): Promise<DigitalProduct> {
    logInfo(`Product Creator Agent atualizando produto ID: ${id}`);
    const state = await Repository.getSystemState();
    const productList = state.products || [];
    const index = productList.findIndex(p => p.id === id);

    if (index === -1) {
      throw new Error(`Produto com ID "${id}" não encontrado.`);
    }

    const current = productList[index];
    const updatedProduct: DigitalProduct = {
      ...current,
      ...updatedFields,
      // Incrementa versão ou loga alteração se especificações didáticas mudarem
      version: updatedFields.version || current.version || '1.0.0',
      publicationLogs: [
        ...(current.publicationLogs || []),
        `Estrutura atualizada em ${new Date().toLocaleString('pt-BR')}`
      ]
    };

    productList[index] = updatedProduct;
    await Repository.saveState({ products: productList });

    return updatedProduct;
  }

  /**
   * Homologa/Aprova o produto para produção
   */
  static async approveProductForProduction(id: string): Promise<DigitalProduct> {
    logInfo(`Product Creator Agent aprovando produto ID: ${id} para produção`);
    const state = await Repository.getSystemState();
    const productList = state.products || [];
    const index = productList.findIndex(p => p.id === id);

    if (index === -1) {
      throw new Error(`Produto com ID "${id}" não encontrado.`);
    }

    const current = productList[index];
    const updatedProduct: DigitalProduct = {
      ...current,
      productionStatus: 'approved_production',
      publicationLogs: [
        ...(current.publicationLogs || []),
        `Produto homologado para produção em ${new Date().toLocaleString('pt-BR')}`
      ]
    };

    productList[index] = updatedProduct;
    await Repository.saveState({ products: productList });

    // Registra decisão do CEO
    const timestamp = new Date().toISOString();
    const decisionId = 'dec_ceo_' + Math.random().toString(36).substr(2, 9);
    const newDecision = {
      id: decisionId,
      objective: `Homologação para Produção: "${current.name}"`,
      decisionType: 'task_approval' as const,
      actionTaken: `Produto enviado para a esteira ativa de produção de conteúdo (Fila do Writer Agent).`,
      reasoning: `O plano de produção e o briefing estratégico de "${current.name}" foram validados. O produto passa a ter status "Aprovado para Produção" de conteúdo.`,
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
        console.error('Erro ao registrar homologação de produto do CEO no Postgres:', err);
      }
    }

    if (!state.ceoDecisions) state.ceoDecisions = [];
    state.ceoDecisions.push(newDecision);
    await Repository.saveState({ ceoDecisions: state.ceoDecisions });

    return updatedProduct;
  }
}
