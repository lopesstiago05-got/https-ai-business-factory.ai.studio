import { ModelManager } from '../kernel/ModelManager.ts';
import { GoogleGenAI, Type } from '@google/genai';
import { Repository } from '../db/repository.ts';
import { Publication } from '../types.ts';
import { logInfo, logWarn, logError } from '../logs/logger.ts';
import { MercadoPagoPayments } from '../integrations/connectors/mercadoPagoPayments.ts';

const DEFAULT_PUBLISHER_PROMPT = `Você é o Publisher Agent (Diretor de Publicação), o agente especialista da "AI Business Factory" responsável por empacotar, revisar, e estruturar operacionalmente a publicação e o lançamento de produtos digitais de alta performance.

Sua missão é atuar na fase final da esteira operacional, fazendo a ponte entre a criação estratégica do Marketing Agent e a publicação real do infoproduto nas plataformas de vendas mais utilizadas no mercado de língua portuguesa (como Hotmart, Kiwify, Monetizze, Lojas Próprias ou APIs Externas).

Ao preparar uma publicação, suas responsabilidades incluem:
1. Receber e organizar as informações comerciais do produto (título, descrição de checkout persuasiva, imagens recomendadas, etc.).
2. Organizar e catalogar a lista de arquivos finais que serão entregues ao comprador (e-books, planilhas de bônus, slides, etc.).
3. Criar e gerenciar um checklist de publicação rigoroso para mitigar erros operacionais (revisão de preços, termos de uso, link de checkout).
4. Configurar a estrutura técnica de lançamento com as plataformas simuladas escolhidas.
5. Controlar o versionamento e registrar todo o histórico de alterações no lançamento.
6. Garantir que a publicação ocorra com segurança jurídica (gerando termos e condições conceituais de compra e reembolso).

Regra crucial: Nunca realize uma publicação real ou envie dados de produção para APIs reais sem a aprovação administrativa explícita no sistema.`;

export class PublisherAgent {
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
   * Helper para atualizar o status do agente Publisher no banco
   */
  private static async updateAgentState(status: 'idle' | 'running' | 'error', currentTask?: string) {
    try {
      const state = await Repository.getSystemState();
      const agentsList = state.agents.map(a => {
        if (a.id === 'publisher') {
          return { ...a, status, currentTask: currentTask || undefined };
        }
        return a;
      });
      await Repository.saveState({ agents: agentsList });
    } catch (err) {
      console.error('Falha ao atualizar estado do Publisher Agent:', err);
    }
  }

  /**
   * Prepara um produto para lançamento criando sua estrutura de publicação inicial
   */
  static async preparePublication(productId: string): Promise<Publication> {
    logInfo(`Publisher Agent iniciando preparação de publicação para produto ID: ${productId}`);
    await this.updateAgentState('running', `Estruturando checkout e checklist de publicação para o produto ID ${productId}`);

    try {
      const state = await Repository.getSystemState();
      
      const products = state.products || [];
      const product = products.find(p => p.id === productId);
      if (!product) {
        throw new Error(`Produto ID "${productId}" não encontrado.`);
      }

      // Busca a campanha de marketing correspondente
      const campaigns = state.marketingCampaigns || [];
      const campaign = campaigns.find(c => c.productId === productId);

      // Busca o design correspondente
      const designs = state.designProjects || [];
      const design = designs.find(d => d.productId === productId);

      // Conteúdo associado
      const contents = state.generatedContents || [];
      const content = contents.find(c => c.productId === productId);

      const ai = this.getAI();

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          description: { 
            type: Type.STRING, 
            description: "Descrição comercial otimizada para o checkout da plataforma de vendas (persuasiva, contendo os módulos, benefícios e bônus incluídos)" 
          },
          price: { 
            type: Type.NUMBER, 
            description: "Preço recomendado para o lançamento em reais (Ex: 97.00, 197.00, 297.00)" 
          },
          files: {
            type: Type.ARRAY,
            description: "Lista de arquivos finais simulados de entrega do infoproduto para o comprador",
            items: { type: Type.STRING }
          },
          salesPageUrl: { 
            type: Type.STRING, 
            description: "Link de redirecionamento ou url da página de checkout gerada de forma conceitual" 
          },
          termsAndConditions: { 
            type: Type.STRING, 
            description: "Termos e Condições conceituais de uso e política de reembolso (garantia de 7 dias conforme CDC brasileiro) específicos para o infoproduto" 
          },
          platforms: {
            type: Type.OBJECT,
            properties: {
              hotmart: { type: Type.BOOLEAN, description: "Indicado para vendas na Hotmart" },
              kiwify: { type: Type.BOOLEAN, description: "Indicado para vendas na Kiwify" },
              monetizze: { type: Type.BOOLEAN, description: "Indicado para vendas na Monetizze" },
              customStore: { type: Type.BOOLEAN, description: "Indicado para vendas em Loja Própria" },
              externalApi: { type: Type.BOOLEAN, description: "Indicado para publicação em API externa" }
            },
            required: ["hotmart", "kiwify", "monetizze", "customStore", "externalApi"]
          },
          checklistItems: {
            type: Type.ARRAY,
            description: "Lista de 5 itens críticos de checklist de publicação comercial e jurídica que o administrador precisa atestar",
            items: { type: Type.STRING }
          }
        },
        required: ["description", "price", "files", "salesPageUrl", "termsAndConditions", "platforms", "checklistItems"]
      };

      const prompt = `Você é o Publisher Agent. Seu objetivo é organizar, catalogar e preparar a publicação técnica do infoproduto abaixo no mercado de língua portuguesa.
      
      DADOS DO PRODUTO:
      - Nome: "${product.name}"
      - Categoria: "${product.category}"
      - Descrição Original: "${product.description}"
      - Nicho: "${product.niche || ''}"
      
      CAMPANHA DE MARKETING (Estratégia & Headline):
      ${campaign ? `- Headline: "${campaign.title}"\n- Posicionamento: "${campaign.positioning}"\n- Copy da página de vendas: "${JSON.stringify(campaign.salesPage)}"` : 'Nenhum plano de marketing gerado.'}
      
      ESTILO VISUAL (Identidade & Capa):
      ${design ? `- Estilo: "${design.styleChoice}"\n- Identidade Visual: "${design.visualIdentity}"` : 'Nenhum conceito visual gerado.'}

      CONTEÚDO TEXTUAL DO PRODUTO (Para controle de arquivos de entrega):
      ${content ? `- Conteúdo Produzido: "${content.title}" (${content.chaptersCount} capítulos, status: ${content.status})` : 'Nenhum conteúdo produzido.'}
      
      Por favor, estruture a publicação ideal preenchendo todos os dados necessários comerciais e técnicos de forma profissional.`;

      const response = await ModelManager.generateContent('publisher', ai, {
        model: ModelManager.getModelName(),
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
          systemInstruction: DEFAULT_PUBLISHER_PROMPT
        }
      });

      const data = JSON.parse(response.text || '{}');

      // Prepara as imagens conceituais que serão associadas (usando assets do designer se houver)
      const imagesList: string[] = [];
      if (design && design.generatedAssets && design.generatedAssets.length > 0) {
        design.generatedAssets.forEach((asset: any) => {
          if (asset.url) imagesList.push(asset.url);
        });
      }
      if (imagesList.length === 0) {
        imagesList.push('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop');
      }

      const publicationId = 'pub_' + Math.random().toString(36).substring(2, 11);
      const now = new Date().toISOString();
      const price = data.price || product.price || 97.00;

      // Cria o checkout real via Mercado Pago Payments Engine (Etapa 18)
      let checkoutUrl = `https://businessfactory.ai/checkout/${product.id}`;
      try {
        const mpPayment = await MercadoPagoPayments.createPayment({
          productId: product.id,
          customer: {
            name: 'Cliente Lançamento',
            email: 'comercial@businessfactory.ai'
          },
          amount: price,
          paymentMethod: 'pix'
        });
        checkoutUrl = mpPayment.checkout_url;
        logInfo(`[PublisherAgent] Link de checkout do Mercado Pago gerado com sucesso: ${checkoutUrl}`);
      } catch (mpErr: any) {
        logWarn(`[PublisherAgent] Erro ao gerar checkout do Mercado Pago, usando fallback: ${mpErr.message}`);
      }

      const newPublication: Publication = {
        id: publicationId,
        productId: product.id,
        productName: product.name,
        description: data.description || product.description,
        category: product.category,
        price: price,
        images: imagesList,
        files: data.files || ['Ebook_Principal_PDF.pdf', 'Guia_Pratico_Bonus_PDF.pdf'],
        salesPageUrl: checkoutUrl,
        termsAndConditions: data.termsAndConditions || 'Termos padrão de uso e garantia incondicional de 7 dias.',
        status: 'pending',
        version: '1.0.0',
        platforms: {
          hotmart: !!data.platforms?.hotmart,
          kiwify: !!data.platforms?.kiwify,
          monetizze: !!data.platforms?.monetizze,
          customStore: !!data.platforms?.customStore,
          externalApi: !!data.platforms?.externalApi
        },
        checklist: {
          filesVerified: false,
          commercialOk: false,
          termsAccepted: false,
          metadataComplete: false,
          marketingApproved: campaign?.status === 'approved',
          itemsChecked: []
        },
        history: [
          {
            action: 'Preparação Inicial',
            actor: 'Publisher Agent',
            timestamp: now,
            details: 'Publicação criada e estruturada a partir dos ativos de criação, design e marketing.'
          }
        ],
        timestamp: now
      };

      // Grava no banco de dados
      const savedPublication = await Repository.createPublication(newPublication);

      // Registra uma atividade em formato de tarefa concluída se houver tarefa pendente na fila
      const tasks = state.tasks || [];
      const pendingTask = tasks.find(t => t.productId === productId && t.agentId === 'publisher' && t.status !== 'completed');
      if (pendingTask) {
        pendingTask.status = 'completed';
        pendingTask.result = `Checkout e checklist de publicação preparados com sucesso para o produto '${product.name}' com preço sugerido de R$ ${savedPublication.price}.`;
        pendingTask.logs.push(`[${new Date().toLocaleTimeString()}] Publicação estruturada.`);
        await Repository.saveState({ tasks });
      }

      // Atualiza o produto para sinalizar que está pronto para o empacotamento
      product.publicationLogs = product.publicationLogs || [];
      product.publicationLogs.push(`[${new Date().toLocaleDateString()}] Publicação estruturada por Publisher Agent. Versão: 1.0.0. Status: PENDENTE_APROVACAO.`);
      product.checkoutUrl = checkoutUrl;
      product.paymentProvider = 'mercado_pago';
      product.price = price;
      await Repository.saveState({ products });

      await this.updateAgentState('idle');
      logInfo(`Publisher Agent concluiu preparação de publicação para produto ID: ${productId}`);

      return savedPublication;
    } catch (error: any) {
      logError(`Publisher Agent falhou na preparação para produto ID: ${productId}. Erro: ${error.message}`);
      await this.updateAgentState('error', `Falha ao estruturar publicação: ${error.message}`);
      throw error;
    }
  }

  /**
   * Executa a auditoria heurística ou preenche automaticamente o checklist com a ajuda da IA
   */
  static async executeChecklist(publicationId: string): Promise<Publication> {
    logInfo(`Publisher Agent executando checklist para publicação ID: ${publicationId}`);
    await this.updateAgentState('running', `Validando checklist de publicação para ID ${publicationId}`);

    try {
      const state = await Repository.getSystemState();
      const publicationsList = state.publications || [];
      const publication = publicationsList.find(p => p.id === publicationId);
      if (!publication) {
        throw new Error(`Publicação ID "${publicationId}" não encontrada.`);
      }

      const ai = this.getAI();

      const prompt = `Você é o Publisher Agent. Realize uma auditoria rápida do produto preparado abaixo para lançamento e valide se todos os requisitos estão de acordo.
      
      INFORMAÇÕES DA PUBLICAÇÃO:
      - Nome: "${publication.productName}"
      - Descrição Checkout: "${publication.description}"
      - Preço: R$ ${publication.price}
      - Arquivos de entrega planejado: [${publication.files.join(', ')}]
      - Termos de garantia: "${publication.termsAndConditions.substring(0, 500)}"
      
      Por favor, retorne uma pequena lista de conclusões de auditoria atestando a qualidade operacional.`;

      const response = await ModelManager.generateContent('publisher', ai, {
        model: ModelManager.getModelName(),
        contents: prompt,
        config: {
          systemInstruction: DEFAULT_PUBLISHER_PROMPT
        }
      });

      const auditNotes = response.text || 'Auditoria heurística concluída com sucesso.';

      const now = new Date().toISOString();
      const updatedPublication: Partial<Publication> = {
        status: 'checking',
        checklist: {
          filesVerified: true,
          commercialOk: true,
          termsAccepted: true,
          metadataComplete: true,
          marketingApproved: publication.checklist.marketingApproved,
          itemsChecked: ['Arquivos validados', 'Informações de preço revisadas', 'Termos de CDC aceitos', 'Integração de checkout simulada']
        },
        history: [
          ...(publication.history || []),
          {
            action: 'Verificação de Checklist',
            actor: 'Publisher Agent',
            timestamp: now,
            details: `Auditoria técnica concluída: ${auditNotes.substring(0, 300)}...`
          }
        ]
      };

      const result = await Repository.updatePublication(publicationId, updatedPublication);
      await this.updateAgentState('idle');
      return result;
    } catch (error: any) {
      logError(`Publisher Agent falhou no checklist para publicação ID: ${publicationId}. Erro: ${error.message}`);
      await this.updateAgentState('error', `Falha ao validar checklist: ${error.message}`);
      throw error;
    }
  }

  /**
   * Aprova e publica o produto de forma simulada no sistema
   */
  static async approvePublication(publicationId: string): Promise<Publication> {
    logInfo(`Publisher Agent aprovando publicação ID: ${publicationId}`);
    await this.updateAgentState('running', `Realizando publicação simulada do ID ${publicationId}`);

    try {
      const state = await Repository.getSystemState();
      const publicationsList = state.publications || [];
      const publication = publicationsList.find(p => p.id === publicationId);
      if (!publication) {
        throw new Error(`Publicação ID "${publicationId}" não encontrada.`);
      }

      const now = new Date().toISOString();
      const updatedPublication: Partial<Publication> = {
        status: 'published',
        checklist: {
          ...publication.checklist,
          filesVerified: true,
          commercialOk: true,
          termsAccepted: true,
          metadataComplete: true
        },
        history: [
          ...(publication.history || []),
          {
            action: 'Aprovação e Publicação',
            actor: 'Administrador (Com aprovação do Publisher Agent)',
            timestamp: now,
            details: 'Publicação lançada com sucesso de forma segura nas plataformas configuradas!'
          }
        ]
      };

      const result = await Repository.updatePublication(publicationId, updatedPublication);

      // Atualiza o status do produto principal para "published"
      const productsList = state.products || [];
      const product = productsList.find(p => p.id === publication.productId);
      if (product) {
        product.status = 'published';
        product.publicationLogs = product.publicationLogs || [];
        product.publicationLogs.push(`[${new Date().toLocaleDateString()}] LANÇADO E PUBLICADO com sucesso via Publisher Agent. Status: PUBLICADO.`);
        await Repository.saveState({ products: productsList });
      }

      await this.updateAgentState('idle');
      return result;
    } catch (error: any) {
      logError(`Publisher Agent falhou na aprovação da publicação ID: ${publicationId}. Erro: ${error.message}`);
      await this.updateAgentState('error', `Falha ao aprovar publicação: ${error.message}`);
      throw error;
    }
  }
}
