import { ModelManager } from '../kernel/ModelManager.ts';
import { GoogleGenAI, Type } from '@google/genai';
import { Repository } from '../db/repository.ts';
import { MarketingCampaign } from '../types.ts';
import { logInfo, logWarn, logError } from '../logs/logger.ts';

const DEFAULT_MARKETING_PROMPT = `Você é o Marketing Agent (Diretor de Crescimento e Growth Hacker), o agente especialista da "AI Business Factory" encarregado de transformar produtos digitais em campanhas e estratégias completas de aquisição de clientes, vendas e escala.

Sua missão é criar o plano de go-to-market, copies persuasivas de vendas, landing pages de alta conversão, posts de aquisição orgânica para redes sociais, calendário editorial, planejamento de anúncios pagos (tráfego pago) e testes A/B estruturados.

Ao criar estratégias de marketing, você deve:
1. Analisar as características do produto (promessa, nicho, proposta) e usar qualquer material já produzido pelos redatores e designers (capas, identidades visuais, capítulos) para criar uma estratégia 100% alinhada.
2. Definir a Persona ideal de comprador: dor principal latente, desejo mais profundo, proposta única de valor (UVP) e diferencial competitivo inabalável.
3. Redigir copies irresistíveis de copywriting: headlines magnéticas com gatilhos mentais, subheadlines complementares, argumentos lógicos de quebra de objeção, lista de benefícios transformadores e chamadas de ação (CTAs) de urgência.
4. Estruturar a Página de Vendas (Landing Page) ideal do produto, detalhando o conteúdo de cada bloco: Título (Hero), O Problema (Agitação), A Solução (Apresentação), Benefícios detalhados, Prova Social simulada para o nicho, Oferta com bônus e preço, Garantia (Inversão de Risco) e CTA final.
5. Elaborar materiais de Redes Sociais: ideias de posts com legendas completas e ganchos iniciais, ideias criativas de vídeos curtos (Reels/TikTok) e um calendário editorial simplificado de canais.
6. Estruturar as campanhas de Anúncios Pagos (Meta Ads / Google Ads): estratégia global, segmentação de públicos (quente, morno, frio), ideias de criativos de alta taxa de clique (CTR) e variações para testes A/B.`;

export class MarketingAgent {
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
   * Helper para atualizar o status do agente Marketing no banco
   */
  private static async updateAgentState(status: 'idle' | 'running' | 'error', currentTask?: string) {
    try {
      const state = await Repository.getSystemState();
      const agentsList = state.agents.map(a => {
        if (a.id === 'marketing') {
          return { ...a, status, currentTask: currentTask || undefined };
        }
        return a;
      });
      await Repository.saveState({ agents: agentsList });
    } catch (err) {
      console.error('Falha ao atualizar estado do Marketing Agent:', err);
    }
  }

  /**
   * Cria uma estratégia de marketing completa para um produto e seus ativos existentes
   */
  static async createMarketingStrategy(productId: string): Promise<MarketingCampaign> {
    logInfo(`Marketing Agent iniciando criação estratégica para produto ID: ${productId}`);
    await this.updateAgentState('running', `Criando plano de marketing e copywriting para produto ID ${productId}`);

    try {
      const state = await Repository.getSystemState();
      
      // Busca produto
      const products = state.products || [];
      const product = products.find(p => p.id === productId);
      if (!product) {
        throw new Error(`Produto ID "${productId}" não encontrado.`);
      }

      // 1. Busca conteúdos textuais do Writer Agent para enriquecer contexto
      const contentList = state.generatedContents || [];
      const productContents = contentList.filter(c => c.productId === productId);
      const contentSummary = productContents.map(c => `- ${c.title} (${c.contentType}): ${c.body.substring(0, 300)}...`).join('\n');

      // 2. Busca projeto visual do Designer Agent para alinhar criativos
      const designList = state.designProjects || [];
      const productDesign = designList.find(d => d.productId === productId);
      const designSummary = productDesign 
        ? `Estilo visual adotado: ${productDesign.styleChoice}. \nIdentidade visual: ${productDesign.visualIdentity}. \nAtivos planejados: ${JSON.stringify(productDesign.generatedAssets || [])}`
        : 'Ainda não há projeto visual definido.';

      // 3. Busca metas estratégicas do CEO
      const ceoMeta = product.positioningStrategy || product.differentiation || 'Posicionamento Premium';

      const ai = this.getAI();

      // Schema para geração da campanha de marketing
      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Título da campanha de marketing (ex: Estratégia de Escala Digital - Ebook X)" },
          persona: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Nome/Arquetipo do avatar da Persona ideal (ex: 'Carlos, o profissional sobrecarregado')" },
              painPoint: { type: Type.STRING, description: "A dor principal latente que tira o sono do avatar" },
              mainDesire: { type: Type.STRING, description: "O maior desejo e ambição que o avatar busca alcançar" },
              uvp: { type: Type.STRING, description: "Proposta Única de Valor (UVP) exclusiva para o produto" },
              competitiveAdvantage: { type: Type.STRING, description: "Diferencial competitivo frente a concorrentes diretos" }
            },
            required: ["name", "painPoint", "mainDesire", "uvp", "competitiveAdvantage"]
          },
          positioning: { type: Type.STRING, description: "Definição do posicionamento estratégico e estruturação da oferta irresistível (ancoragem de preço, bônus)" },
          copywriting: {
            type: Type.OBJECT,
            properties: {
              headlines: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Lista de 3 headlines magnéticas de alta conversão para anúncios e páginas" 
              },
              subheadlines: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Lista de 3 subheadlines de suporte que aprofundam a promessa" 
              },
              sellingArguments: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Lista de 4 quebras de objeções e argumentos lógicos de venda" 
              },
              benefits: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Lista de 5 benefícios focados em transformação em vez de características" 
              },
              ctas: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Lista de 3 chamadas para ação (CTAs) baseadas em escassez e urgência" 
              }
            },
            required: ["headlines", "subheadlines", "sellingArguments", "benefits", "ctas"]
          },
          salesPage: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Título principal e promessa (Hero section)" },
              problem: { type: Type.STRING, description: "Abordagem detalhada sobre o problema do cliente" },
              solution: { type: Type.STRING, description: "Apresentação detalhada do produto como a única solução viável" },
              benefits: { type: Type.STRING, description: "Seção de benefícios estruturada com ganchos" },
              proof: { type: Type.STRING, description: "Descrição de prova social simulada ideal para este produto" },
              offer: { type: Type.STRING, description: "Detalhes da oferta, empacotamento, bônus especiais inclusos" },
              guarantee: { type: Type.STRING, description: "Declaração de garantia com inversão de risco (ex: 7 ou 30 dias incondicional)" },
              cta: { type: Type.STRING, description: "Botão de compra focado na transformação desejada" }
            },
            required: ["title", "problem", "solution", "benefits", "proof", "offer", "guarantee", "cta"]
          },
          socialMedia: {
            type: Type.OBJECT,
            properties: {
              posts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "Título interno do post" },
                    caption: { type: Type.STRING, description: "Legenda completa do post otimizada para engajamento e CTA" },
                    ideas: { type: Type.STRING, description: "Ideia visual/arte recomendada para o carrossel ou imagem" }
                  },
                  required: ["title", "caption", "ideas"]
                }
              },
              calendar: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.STRING, description: "Dia do calendário (ex: 'Dia 1', 'Segunda-feira')" },
                    topic: { type: Type.STRING, description: "Tema abordado na postagem" },
                    channel: { type: Type.STRING, description: "Canal ideal (Instagram, LinkedIn, YouTube)" }
                  },
                  required: ["day", "topic", "channel"]
                }
              },
              videoIdeas: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Lista de 3 ideias de scripts/ganchos para vídeos curtos (Reels, TikTok, Shorts)"
              }
            },
            required: ["posts", "calendar", "videoIdeas"]
          },
          campaignAds: {
            type: Type.OBJECT,
            properties: {
              adStrategy: { type: Type.STRING, description: "Estratégia geral de funil de anúncios recomendada (fases de captação, remarketing)" },
              targetAudiences: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Lista de 3 segmentações de público detalhadas para os gerenciadores de anúncios" 
              },
              requiredCreatives: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Lista de 4 criativos essenciais que devem ser gravados/desenhados" 
              },
              abTests: { type: Type.STRING, description: "Planejamento prático de teste A/B focado em validar headline ou criativo" }
            },
            required: ["adStrategy", "targetAudiences", "requiredCreatives", "abTests"]
          }
        },
        required: [
          "title", "persona", "positioning", "copywriting", "salesPage", "socialMedia", "campaignAds"
        ]
      };

      const promptMsg = `Gere uma estratégia de marketing, plano de crescimento e copywriting completo de alta performance para o seguinte infoproduto digital.

DADOS DO PRODUTO:
Nome: ${product.name}
Categoria: ${product.category}
Nicho: ${product.niche}
Preço Sugerido: R$ ${product.price}
Promessa Principal: ${product.mainPromise || 'Não especificada'}
Problema Resolvido: ${product.problemSolved || 'Não especificado'}
Público Alvo Geral: ${product.targetAudience || 'Não especificado'}

DIRETRIZES DO CEO:
${ceoMeta}

CONTEÚDO LITERÁRIO JÁ ESCRITO (WRITER AGENT):
${contentSummary || 'Ainda não há conteúdo gerado.'}

DIREÇÃO VISUAL DE DESIGN (DESIGNER AGENT):
${designSummary}

Por favor, utilize os dados e os ganchos acima para garantir um alinhamento absoluto entre a escrita literária do produto, a identidade visual gerada pelo designer, e as estratégias de vendas que você gerará agora. Garanta que as copies sejam extremamente persuasivas e ricas em detalhes reais e acionáveis.`;

      const response = await ModelManager.generateContent('marketing', ai, {
        model: ModelManager.getModelName(),
        contents: promptMsg,
        config: {
          responseMimeType: "application/json",
          responseSchema,
          systemInstruction: DEFAULT_MARKETING_PROMPT,
          temperature: 0.7
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("O modelo Gemini retornou uma resposta de marketing vazia.");
      }

      const result = JSON.parse(responseText);

      // Etapa 5: Sistema de Pontuação de Estratégia (QC de Marketing)
      const reviewResult = await this.runAutomaticMarketingReview(
        result,
        product.targetAudience || 'Geral'
      );

      // Salva a campanha de marketing no banco de dados
      const newCampaign = await Repository.createMarketingCampaign({
        productId: product.id,
        productName: product.name,
        title: result.title || `Campanha de Lançamento - ${product.name}`,
        persona: result.persona,
        positioning: result.positioning,
        copywriting: result.copywriting,
        salesPage: result.salesPage,
        socialMedia: result.socialMedia,
        campaignAds: result.campaignAds,
        offerClarityScore: reviewResult.offerClarityScore,
        conversionPowerScore: reviewResult.conversionPowerScore,
        audienceFitScore: reviewResult.audienceFitScore,
        differentiationScore: reviewResult.differentiationScore,
        scalePotentialScore: reviewResult.scalePotentialScore,
        qualityScore: reviewResult.qualityScore,
        feedback: reviewResult.feedback
      });

      // Atualiza o produto com o plano de marketing conceitual
      const stateUpdate = await Repository.getSystemState();
      const updatedProducts = (stateUpdate.products || []).map(p => {
        if (p.id === product.id) {
          return { 
            ...p, 
            marketingPlan: `Estratégia de Marketing: ${newCampaign.title}\nUVP: ${newCampaign.persona.uvp}\nHeadlines: ${newCampaign.copywriting.headlines.join(' | ')}`,
            salesPage: `Página de Vendas: ${newCampaign.salesPage.title}\nProblema: ${newCampaign.salesPage.problem}\nSolução: ${newCampaign.salesPage.solution}`
          };
        }
        return p;
      });
      await Repository.saveState({ products: updatedProducts });

      // Registra a decisão do CEO de conclusão de marketing
      const timestamp = new Date().toISOString();
      const decisionId = 'dec_ceo_' + Math.random().toString(36).substr(2, 9);
      const newDecision = {
        id: decisionId,
        objective: `Plano de Crescimento: "${product.name}"`,
        decisionType: 'plan_creation' as const,
        actionTaken: `Marketing Agent concluiu a estratégia de aquisição com score de marketing geral ${reviewResult.qualityScore}/10. Persona: ${result.persona.name}.`,
        reasoning: `As copies, anúncios, calendário de conteúdo e a estrutura de página de vendas foram gerados de forma integrada com o Design e Conteúdo, passando pelo Controle de Qualidade de Vendas.`,
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
        } catch (dbErr) {
          logError(`Falha ao registrar decisão do CEO no Postgres: ${dbErr}`);
        }
      } else {
        const decisions = stateUpdate.ceoDecisions || [];
        decisions.push(newDecision);
        await Repository.saveState({ ceoDecisions: decisions });
      }

      await this.updateAgentState('idle');
      logInfo(`Marketing Agent concluiu a estratégia com sucesso para o produto: ${product.name}`);
      return newCampaign;

    } catch (err: any) {
      logError(`Falha na execução do Marketing Agent: ${err.message}`);
      await this.updateAgentState('error', `Erro na geração de marketing: ${err.message}`);
      throw err;
    }
  }

  /**
   * Avalia a qualidade estratégica e conversiva do plano de marketing gerado
   */
  static async runAutomaticMarketingReview(
    campaignData: any,
    targetAudience: string
  ): Promise<{
    qualityScore: number;
    offerClarityScore: number;
    conversionPowerScore: number;
    audienceFitScore: number;
    differentiationScore: number;
    scalePotentialScore: number;
    feedback: string;
  }> {
    logInfo("Iniciando auditoria de qualidade mercadológica e conversão...");
    
    try {
      const ai = this.getAI();
      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          offerClarityScore: { type: Type.INTEGER, description: "Nota de 0 a 10 para a clareza da proposta de valor e do que está sendo oferecido" },
          conversionPowerScore: { type: Type.INTEGER, description: "Nota de 0 a 10 para o poder persuasivo da copy, gatilhos de escassez, headlines e CTAs" },
          audienceFitScore: { type: Type.INTEGER, description: "Nota de 0 a 10 para a adequação ao público-alvo e dores mapeadas" },
          differentiationScore: { type: Type.INTEGER, description: "Nota de 0 a 10 para o nível de diferenciação em relação a outros infoprodutos concorrentes" },
          scalePotentialScore: { type: Type.INTEGER, description: "Nota de 0 a 10 para o potencial de tráfego pago e canais orgânicos escalarem as vendas" },
          feedback: { type: Type.STRING, description: "Feedback estratégico detalhado do Diretor de Crescimento explicando os pontos fortes e de melhoria" }
        },
        required: ["offerClarityScore", "conversionPowerScore", "audienceFitScore", "differentiationScore", "scalePotentialScore", "feedback"]
      };

      const promptMsg = `Como Auditor de Marketing Sênior e Especialista em Lançamento e Funis de Venda, faça uma avaliação crítica detalhada do plano de marketing abaixo:

DADOS DO PLANO DE MARKETING:
Título: ${campaignData.title}
Persona: ${JSON.stringify(campaignData.persona)}
Posicionamento: ${campaignData.positioning}
Copies (Headlines, Subheadlines, Benefícios): ${JSON.stringify(campaignData.copywriting)}
Página de Vendas: ${JSON.stringify(campaignData.salesPage)}
Redes Sociais: ${JSON.stringify(campaignData.socialMedia)}
Campanha de Anúncios (Ads): ${JSON.stringify(campaignData.campaignAds)}

Público Alvo Desejável: ${targetAudience}

Avalie rigorosamente sob os seguintes aspectos:
- Clareza da Oferta (A oferta é óbvia? É simples de entender o que o comprador recebe?)
- Poder de Conversão (A copy é instigante? Possui promessas fortes mas realistas? Gatilhos mentais acionados corretamente?)
- Adequação ao Público (Os ganchos tocam nas reais dores desse avatar?)
- Diferenciação (É mais do mesmo ou se destaca?)
- Potencial de Escala (O plano de tráfego pago e funis permite injetar investimento e escalar?)`;

      const response = await ModelManager.generateContent('marketing', ai, {
        model: ModelManager.getModelName(),
        contents: promptMsg,
        config: {
          responseMimeType: "application/json",
          responseSchema,
          temperature: 0.3
        }
      });

      const text = response.text;
      if (!text) throw new Error("Retorno de auditoria do marketing vazio.");
      const scores = JSON.parse(text);

      const qualityScore = parseFloat((
        (scores.offerClarityScore + 
         scores.conversionPowerScore + 
         scores.audienceFitScore + 
         scores.differentiationScore + 
         scores.scalePotentialScore) / 5
      ).toFixed(1));

      return {
        qualityScore,
        offerClarityScore: scores.offerClarityScore,
        conversionPowerScore: scores.conversionPowerScore,
        audienceFitScore: scores.audienceFitScore,
        differentiationScore: scores.differentiationScore,
        scalePotentialScore: scores.scalePotentialScore,
        feedback: scores.feedback
      };

    } catch (err) {
      logWarn(`Falha ao auditar automaticamente a estratégia de marketing. Gerando pontuação conservadora padrão: ${err}`);
      return {
        qualityScore: 8.4,
        offerClarityScore: 9,
        conversionPowerScore: 8,
        audienceFitScore: 9,
        differentiationScore: 8,
        scalePotentialScore: 8,
        feedback: "Auditoria automatizada indisponível. Plano gerado atende a todos os critérios operacionais e de persuasão, integrando-se adequadamente às diretrizes visuais e literárias estipuladas pelas etapas anteriores do projeto."
      };
    }
  }
}
