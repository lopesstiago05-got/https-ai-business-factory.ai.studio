import fs from 'fs';
import path from 'path';
import {
  ProductProject,
  ProductIdeaInput,
  GeneratedIdea,
  MarketValidation,
  ProductBlueprint,
  ContentAsset,
  ProductOffer,
  ProductScore,
  ProjectStepType,
  ProductFactoryStatus
} from './productTypes.ts';
import { ProductIdeaGenerator } from './productIdeaGenerator.ts';
import { MarketValidationEngine } from './marketValidationEngine.ts';
import { ProductBlueprintEngine } from './productBlueprintEngine.ts';
import { ContentGenerator } from './contentGenerator.ts';
import { OfferBuilder } from './offerBuilder.ts';
import { ProductScoringEngine } from './productScoringEngine.ts';
import { PublishingPreparationService } from './publishingPreparationService.ts';
import { SalesChannelService } from '../salesChannels/salesChannelService.ts';
import { AuditService } from '../enterprise/auditService.ts';
import { MonitoringService } from '../enterprise/monitoringService.ts';

const PROJECTS_FILE = path.join(process.cwd(), 'product_projects_db.json');

export class ProductFactoryService {
  private static loadProjects(): ProductProject[] {
    try {
      if (fs.existsSync(PROJECTS_FILE)) {
        const content = fs.readFileSync(PROJECTS_FILE, 'utf-8');
        return JSON.parse(content) as ProductProject[];
      }
    } catch (err: any) {
      console.error('[ProductFactoryService] Erro ao carregar projetos:', err.message);
    }
    return this.getInitialProjects();
  }

  private static saveProjects(projects: ProductProject[]): void {
    try {
      fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');
    } catch (err: any) {
      console.error('[ProductFactoryService] Erro ao salvar projetos:', err.message);
    }
  }

  private static getInitialProjects(): ProductProject[] {
    const defaultProjects: ProductProject[] = [
      {
        id: 'proj_1',
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        tenantId: 'tenant_default',
        input: {
          niche: 'Tecnologia para pequenos negócios',
          audience: 'Micro-empresários, donos de padarias e lojas locais',
          goal: 'Automatizar atendimento ao cliente e reduzir custos',
          experience: 'Tenho conhecimento básico em chatbots e IA'
        },
        idea: {
          id: 'idea_1',
          name: 'Manual de IA Prática para Lojistas',
          audience: 'Lojistas e pequenos comerciantes locais',
          painPoint: 'Falta de tempo para responder clientes no WhatsApp e Direct',
          promise: 'Aprenda a configurar um agente de IA no seu WhatsApp em 2 horas sem programar',
          format: 'EBOOK',
          commercialPotential: 89,
          category: 'Tecnologia para pequenos negócios',
          persona: 'Lojistas e pequenos comerciantes locais',
          solution: 'Configuração guiada de assistentes de inteligência artificial'
        },
        validation: {
          score: 87,
          category: 'ALTA_OPORTUNIDADE',
          demandAnalysis: 'Alta procura por automações de baixo custo após crescimento do WhatsApp Business.',
          competitionAnalysis: 'Poucos cursos focados no público de micro-comércio; a maioria foca em desenvolvedores.',
          trends: ['WhatsApp Automação', 'IA para Vendas', 'No-code Chatbots'],
          keywords: ['como automatizar whatsapp', 'ia para padaria', 'robô whatsapp grátis']
        },
        blueprint: {
          structureType: 'EBOOK',
          items: [
            { title: 'Capítulo 1: O Desafio do Atendimento no Comércio', subItems: ['A perda de vendas por atraso na resposta', 'O que é um agente inteligente de IA'], objective: 'Entender a dor e introduzir a solução.' },
            { title: 'Capítulo 2: Configurando seu Primeiro Assistente', subItems: ['Escolhendo a plataforma gratuita', 'Configurando prompts simples e amigáveis'], objective: 'Prática de criação sem código.' }
          ]
        },
        score: {
          demand: 90,
          competition: 85,
          margin: 95,
          easeOfCreation: 80,
          scalability: 90,
          overallScore: 88,
          recommendation: 'CRIAR'
        },
        currentStep: 'BLUEPRINT',
        status: 'IDEA',
        name: 'Manual de IA Prática para Lojistas',
        criador: 'Product Creator Agent',
        tenant: 'tenant_default',
        arquivos: ['blueprint_ebook.json'],
        histórico: ['Projeto iniciado', 'Ideia gerada', 'Mercado analisado']
      }
    ];
    try {
      fs.writeFileSync(PROJECTS_FILE, JSON.stringify(defaultProjects, null, 2), 'utf-8');
    } catch {}
    return defaultProjects;
  }

  public static getProjects(tenantId: string): ProductProject[] {
    return this.loadProjects().filter(p => p.tenantId === tenantId);
  }

  public static getProjectById(id: string): ProductProject | undefined {
    return this.loadProjects().find(p => p.id === id);
  }

  /**
   * Passo 1: Iniciar criação gerando uma ideia automatizada
   */
  public static async createProject(tenantId: string, input: ProductIdeaInput): Promise<ProductProject> {
    const startTime = Date.now();
    const projects = this.loadProjects();

    // Invocar agente modular de Geração de Ideias (ProductIdeaGenerator)
    const idea = await ProductIdeaGenerator.generate(input);

    const newProject: ProductProject = {
      id: `proj_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      tenantId,
      input,
      idea,
      currentStep: 'IDEIA',
      status: 'IDEA',
      name: idea.name,
      criador: 'Product Creator Agent',
      tenant: tenantId,
      arquivos: [],
      histórico: ['Projeto criado', 'Agente ProductIdeaGenerator decolou e sugeriu proposta comercial inovadora']
    };

    projects.push(newProject);
    this.saveProjects(projects);

    AuditService.register(tenantId, 'usr_default', 'creator@enterprise.com', 'AGENT_EXECUTION', 'SUCCESS', {
      projectId: newProject.id,
      productName: idea.name,
      format: idea.format
    }, 'product-lab');

    MonitoringService.updateAgentMetrics('product-lab', Date.now() - startTime, true, 10);

    return newProject;
  }

  /**
   * Passo 2: Validar produto no mercado
   */
  public static async validateMarket(projectId: string): Promise<ProductProject> {
    const startTime = Date.now();
    const projects = this.loadProjects();
    const proj = projects.find(p => p.id === projectId);
    if (!proj || !proj.idea) throw new Error('Projeto ou Ideia do produto não encontrada.');

    // Atualiza status temporário de pesquisa
    proj.status = 'RESEARCHING';
    proj.histórico.push('Iniciada pesquisa aprofundada de mercado com os agentes de pesquisa');
    this.saveProjects(projects);

    // Chamar validação baseada em IA (MarketValidationEngine)
    const validation = await MarketValidationEngine.validate(proj.idea);
    proj.validation = validation;
    proj.currentStep = 'VALIDACAO';
    proj.status = 'VALIDATED';
    proj.histórico.push(`Pesquisa concluída. Score de oportunidade: ${validation.score}/100 (${validation.category})`);

    this.saveProjects(projects);

    AuditService.register(proj.tenantId, 'usr_default', 'creator@enterprise.com', 'AGENT_EXECUTION', 'SUCCESS', {
      projectId: proj.id,
      validationScore: validation.score,
      category: validation.category
    }, 'market-analyst');

    MonitoringService.updateAgentMetrics('market-analyst', Date.now() - startTime, true, 12);
    return proj;
  }

  /**
   * Passo 3: Gerar Blueprint da Estrutura do Produto
   */
  public static async generateBlueprint(projectId: string): Promise<ProductProject> {
    const startTime = Date.now();
    const projects = this.loadProjects();
    const proj = projects.find(p => p.id === projectId);
    if (!proj || !proj.idea) throw new Error('Projeto ou Ideia do produto não encontrada.');

    const blueprint = await ProductBlueprintEngine.generate(proj.idea);
    proj.blueprint = blueprint;
    proj.currentStep = 'BLUEPRINT';
    proj.status = 'CREATING';
    
    const fileKey = `blueprint_${proj.idea.format.toLowerCase()}.json`;
    if (!proj.arquivos.includes(fileKey)) {
      proj.arquivos.push(fileKey);
    }
    proj.histórico.push(`Blueprint pedagógico gerado contendo ${blueprint.items.length} seções didáticas estruturadas`);

    this.saveProjects(projects);

    AuditService.register(proj.tenantId, 'usr_default', 'creator@enterprise.com', 'AGENT_EXECUTION', 'SUCCESS', {
      projectId: proj.id,
      moduleCount: blueprint.items.length
    }, 'product-lab');

    MonitoringService.updateAgentMetrics('product-lab', Date.now() - startTime, true, 8);
    return proj;
  }

  /**
   * Passo 4: Produzir conteúdo e criativos de marketing
   */
  public static async generateContentPipeline(projectId: string): Promise<ProductProject> {
    const startTime = Date.now();
    const projects = this.loadProjects();
    const proj = projects.find(p => p.id === projectId);
    if (!proj || !proj.idea || !proj.blueprint) {
      throw new Error('Certifique-se de que o blueprint foi gerado antes do pipeline de conteúdo.');
    }

    const content = await ContentGenerator.generate(proj.idea, proj.blueprint);
    proj.content = content;
    proj.currentStep = 'CONTEUDO';
    proj.status = 'REVIEW';

    const assets = ['copy_vsl.txt', 'campanha_anuncios.txt', 'conteudo_didatico.txt', 'prompt_capa.txt'];
    assets.forEach(asset => {
      if (!proj.arquivos.includes(asset)) {
        proj.arquivos.push(asset);
      }
    });
    proj.histórico.push('Arquivos de copy, roteiros, criativos e guias de design de capa produzidos com sucesso');

    this.saveProjects(projects);

    AuditService.register(proj.tenantId, 'usr_default', 'creator@enterprise.com', 'AGENT_EXECUTION', 'SUCCESS', {
      projectId: proj.id,
      writerFinished: true,
      designerFinished: true,
      marketingFinished: true
    }, 'writer-studio');

    MonitoringService.updateAgentMetrics('writer-studio', Date.now() - startTime, true, 15);
    MonitoringService.updateAgentMetrics('design-studio', Date.now() - startTime, true, 20);
    MonitoringService.updateAgentMetrics('marketing-center', Date.now() - startTime, true, 10);

    return proj;
  }

  /**
   * Passo 5: Criar Oferta irresistível e precificação recomendada
   */
  public static async createOffer(projectId: string): Promise<ProductProject> {
    const startTime = Date.now();
    const projects = this.loadProjects();
    const proj = projects.find(p => p.id === projectId);
    if (!proj || !proj.idea) throw new Error('Ideia do produto não encontrada.');

    const offer = await OfferBuilder.build(proj.idea);
    proj.offer = offer;

    // Calcular Score IA do Produto completo via ProductScoringEngine
    const score = await ProductScoringEngine.calculate(proj);
    proj.score = score;
    proj.currentStep = 'OFERTA';
    proj.status = 'READY_TO_PUBLISH';
    
    proj.histórico.push(`Oferta comercial criada (Preço Sugerido: R$ ${offer.suggestedPrice}). Viabilidade IA calculada: ${score.overallScore}/100 (${score.recommendation})`);

    // Notifica sistemas de publicação integrados
    await PublishingPreparationService.markReadyForPublish(proj);

    this.saveProjects(projects);

    AuditService.register(proj.tenantId, 'usr_default', 'creator@enterprise.com', 'AGENT_EXECUTION', 'SUCCESS', {
      projectId: proj.id,
      price: offer.suggestedPrice,
      overallScore: score.overallScore
    }, 'finance-center');

    MonitoringService.updateAgentMetrics('finance-center', Date.now() - startTime, true, 8);
    return proj;
  }

  /**
   * Passo 6: Lançamento automático integrado ao LaunchAgent e Marketplace
   */
  public static async launchProduct(projectId: string, targetPlatform?: string): Promise<ProductProject> {
    const startTime = Date.now();
    const projects = this.loadProjects();
    const proj = projects.find(p => p.id === projectId);
    if (!proj || !proj.idea || !proj.offer) throw new Error('Complete a etapa de oferta antes de lançar.');

    const platform = (targetPlatform || 'kiwify') as 'hotmart' | 'kiwify' | 'eduzz' | 'monetizze' | 'braip';

    // Publicar nos marketplaces usando PublishingPreparationService
    const publishRes = await PublishingPreparationService.publishToMarketplace(proj, platform);

    proj.currentStep = 'LANCAMENTO';
    proj.status = 'PUBLISHED';
    proj.histórico.push(`Produto publicado com sucesso em ${platform.toUpperCase()}. Checkout ativo: ${publishRes.url}`);

    // Integrar canal de vendas: criar anúncios, postagens e mensagens de WhatsApp automaticamente
    try {
      await SalesChannelService.handleLaunchPreparation(
        proj.id,
        proj.idea.name,
        proj.offer.suggestedPrice,
        publishRes.url
      );
      proj.histórico.push('Sales Channel Hub: Conteúdo distribuído e campanhas de anúncios Meta Ads ativadas automaticamente.');
    } catch (err: any) {
      console.warn('[ProductFactoryService] Falha ao acionar canais de lançamento no Sales Channel Hub:', err.message);
    }

    this.saveProjects(projects);

    AuditService.register(proj.tenantId, 'usr_default', 'creator@enterprise.com', 'AGENT_EXECUTION', 'SUCCESS', {
      projectId: proj.id,
      event: 'PRODUCT_READY_FOR_LAUNCH',
      campaignCreated: true,
      whatsappBroadcasting: true,
      marketplaceListed: true,
      provider: platform,
      checkoutUrl: publishRes.url
    }, 'publisher-center');

    MonitoringService.updateAgentMetrics('publisher-center', Date.now() - startTime, true, 14);
    return proj;
  }
}
