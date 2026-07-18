import { MarketplaceAgent, BusinessTemplate } from './types.ts';

export const INITIAL_CATALOG: MarketplaceAgent[] = [
  // MARKETING
  {
    id: 'mp_social_media',
    name: 'Social Media Agent',
    description: 'Gerencia postagens, planeja calendários editoriais e cria legendas virais para Instagram, TikTok e LinkedIn.',
    category: 'marketing',
    difficulty: 'Fácil',
    features: [
      'Calendário editorial de 30 dias',
      'Geração de hooks e legendas com alto engajamento',
      'Sugestão de hashtags e áudios em alta'
    ],
    requirements: ['Conexão com Instagram/Facebook Graph API opcional'],
    status: 'AVAILABLE',
    rating: 4.8,
    reviewsCount: 142,
    executionCount: 2450
  },
  {
    id: 'mp_ads_optimizer',
    name: 'Ads Optimizer Agent',
    description: 'Otimiza campanhas de tráfego pago (Meta Ads e Google Ads), sugerindo alterações de orçamento e novos criativos.',
    category: 'marketing',
    difficulty: 'Avançado',
    features: [
      'Análise de CTR e ROAS em tempo real',
      'Sugestão de públicos semelhantes (Lookalike)',
      'Avisos de fadiga de criativos'
    ],
    requirements: ['Integração com Meta Business Suite', 'Google Ads Developer Token'],
    status: 'AVAILABLE',
    rating: 4.7,
    reviewsCount: 98,
    executionCount: 1890
  },
  {
    id: 'mp_copywriter',
    name: 'Copywriter Agent',
    description: 'Especialista em redação persuasiva. Escreve páginas de vendas, e-mails de lançamento, scripts de vídeo e VSLs.',
    category: 'marketing',
    difficulty: 'Fácil',
    features: [
      'Fórmula AIDA, PAS e Storytelling',
      'Modelagem de VSL de alta conversão',
      'Assuntos de e-mail otimizados para taxa de abertura'
    ],
    requirements: ['Nenhum'],
    status: 'AVAILABLE',
    rating: 4.9,
    reviewsCount: 210,
    executionCount: 3200
  },

  // VENDAS
  {
    id: 'mp_sales_closer',
    name: 'Sales Closer Agent',
    description: 'Automatiza o fechamento de vendas pelo WhatsApp e Direct, guiando leads hesitantes pelo funil de conversão.',
    category: 'sales',
    difficulty: 'Médio',
    features: [
      'Contorno automático de objeções (preço, tempo, confiança)',
      'Envio de links de checkout dinâmicos',
      'Agendamento de chamadas estratégicas'
    ],
    requirements: ['WhatsApp API Oficial ou Sandbox'],
    status: 'AVAILABLE',
    rating: 4.6,
    reviewsCount: 88,
    executionCount: 1540
  },
  {
    id: 'mp_lead_qualifier',
    name: 'Lead Qualification Agent',
    description: 'Qualifica leads frios ou mornos baseando-se no perfil de cliente ideal (ICP), otimizando o tempo do time comercial.',
    category: 'sales',
    difficulty: 'Médio',
    features: [
      'Pontuação de leads (Lead Scoring) dinâmica',
      'Formulários conversacionais via chat',
      'Integração com listas de e-mails'
    ],
    requirements: ['Formulários ativos no site', 'Lista de contatos importada'],
    status: 'AVAILABLE',
    rating: 4.5,
    reviewsCount: 64,
    executionCount: 1120
  },
  {
    id: 'mp_crm',
    name: 'CRM Agent',
    description: 'Atualiza o funil de vendas, cria lembretes de acompanhamento e move negócios automaticamente com base em ações.',
    category: 'sales',
    difficulty: 'Fácil',
    features: [
      'Sincronização de contatos automática',
      'Lembretes inteligentes de follow-up',
      'Relatórios semanais de performance do funil'
    ],
    requirements: ['Conexão com banco de vendas interno'],
    status: 'AVAILABLE',
    rating: 4.4,
    reviewsCount: 52,
    executionCount: 950
  },

  // NEGÓCIOS
  {
    id: 'mp_startup_advisor',
    name: 'Startup Advisor Agent',
    description: 'Conselheiro de negócios focado em startups de tecnologia. Avalia tração, canais de aquisição e rodadas de investimento.',
    category: 'business',
    difficulty: 'Avançado',
    features: [
      'Simulação de Valuation',
      'Estruturação de pitch deck para investidores',
      'Análise de unit economics (LTV/CAC)'
    ],
    requirements: ['Dados de modelo de receita preenchidos'],
    status: 'AVAILABLE',
    rating: 4.8,
    reviewsCount: 75,
    executionCount: 1320
  },
  {
    id: 'mp_business_plan',
    name: 'Business Plan Agent',
    description: 'Estrutura planos de negócios abrangentes de acordo com metodologias de mercado internacionais (Sebrae, Canvas, Lean).',
    category: 'business',
    difficulty: 'Médio',
    features: [
      'Business Model Canvas automatizado',
      'Planejamento de recursos e cronograma',
      'Análise SWOT dinâmica'
    ],
    requirements: ['Definição básica do produto'],
    status: 'AVAILABLE',
    rating: 4.9,
    reviewsCount: 115,
    executionCount: 2210
  },
  {
    id: 'mp_competitor_analysis',
    name: 'Competitor Analysis Agent',
    description: 'Varre a web e mídias sociais para mapear concorrentes, descobrir suas fontes de tráfego, ofertas e pontos fracos.',
    category: 'business',
    difficulty: 'Avançado',
    features: [
      'Mapeamento de propostas de valor dos concorrentes',
      'Monitoramento de alterações de preços',
      'Análise de SEO orgânico da concorrência'
    ],
    requirements: ['Nenhum'],
    status: 'AVAILABLE',
    rating: 4.7,
    reviewsCount: 89,
    executionCount: 1650
  },

  // FINANCEIRO
  {
    id: 'mp_cash_flow',
    name: 'Cash Flow Agent',
    description: 'Gera projeções de fluxo de caixa diárias, semanais e mensais, alertando sobre descasques financeiros futuros.',
    category: 'finance',
    difficulty: 'Médio',
    features: [
      'Alertas de saldo mínimo ou quebra de caixa',
      'Classificação automática de contas (DRE)',
      'Previsão de inadimplência baseada em histórico'
    ],
    requirements: ['Conexão com gateway de pagamento ou banco'],
    status: 'AVAILABLE',
    rating: 4.6,
    reviewsCount: 67,
    executionCount: 1280
  },
  {
    id: 'mp_pricing_strategy',
    name: 'Pricing Strategy Agent',
    description: 'Calcula o preço ideal de produtos e serviços considerando custos, posicionamento de marca, margem desejada e concorrência.',
    category: 'finance',
    difficulty: 'Médio',
    features: [
      'Análise de elasticidade de preço',
      'Simulador de descontos e cupons',
      'Sugestão de preços para vendas cruzadas (Cross-sell)'
    ],
    requirements: ['Planilha de custos operacionais e margem mínima'],
    status: 'AVAILABLE',
    rating: 4.8,
    reviewsCount: 83,
    executionCount: 1470
  },

  // ATENDIMENTO
  {
    id: 'mp_customer_support',
    name: 'Customer Support Agent',
    description: 'Suporte humanizado omnicanal de Nível 1. Responde dúvidas frequentes, rastreia pedidos e ajuda em cancelamentos.',
    category: 'support',
    difficulty: 'Fácil',
    features: [
      'Base de conhecimento pesquisável via IA',
      'Integração com códigos de rastreio de logística',
      'Triagem e transbordo para atendente humano'
    ],
    requirements: ['FAQ cadastrada ou site institucional'],
    status: 'AVAILABLE',
    rating: 4.7,
    reviewsCount: 112,
    executionCount: 2010
  },
  {
    id: 'mp_review_manager',
    name: 'Review Manager Agent',
    description: 'Garante reputação respondendo avaliações no Google Meu Negócio, Reclame Aqui, e App Store com foco em fidelização.',
    category: 'support',
    difficulty: 'Fácil',
    features: [
      'Resposta automatizada para avaliações de 5 estrelas',
      'Fórmulas de contorno para avaliações negativas',
      'Extração de feedback estruturado para melhoria contínua'
    ],
    requirements: ['Acesso a API do Reclame Aqui ou Google Business Profile'],
    status: 'AVAILABLE',
    rating: 4.5,
    reviewsCount: 46,
    executionCount: 780
  }
];

export const INITIAL_TEMPLATES: BusinessTemplate[] = [
  {
    id: 'tpl_ecommerce',
    name: 'E-commerce Starter',
    description: 'Combo perfeito para iniciar uma operação de e-commerce e automatizar marketing, vendas, suporte e insights analíticos.',
    agentsIncluded: ['mp_social_media', 'mp_ads_optimizer', 'mp_customer_support'],
    executionFlow: [
      '1. Social Media Agent cria os primeiros 15 posts de aquisição.',
      '2. Ads Optimizer Agent cria e monitora as campanhas de vendas.',
      '3. Customer Support Agent atende clientes tirando dúvidas sobre frete e produtos.'
    ],
    initialConfig: {
      niche: 'Varejo / Moda / Eletrônicos',
      setupBudget: 1500
    },
    popularity: 92
  },
  {
    id: 'tpl_infoproduct',
    name: 'Infoproduct Creator',
    description: 'A esteira ideal para modelar seu negócio, criar a tese, redigir o conteúdo persuasivo, montar o design e lançar seu infoproduto.',
    agentsIncluded: ['ceo', 'writer', 'designer', 'mp_copywriter'],
    executionFlow: [
      '1. CEO valida a tese do infoproduto.',
      '2. Copywriter Agent cria a carta de vendas e os e-mails de lançamento.',
      '3. Designer Agent cria as peças criativas e layouts de anúncio.',
      '4. Writer Agent compila os módulos e e-book final.'
    ],
    initialConfig: {
      niche: 'Educação / Negócios / Saúde',
      productPrice: 197
    },
    popularity: 98
  },
  {
    id: 'tpl_local_business',
    name: 'Local Business Growth',
    description: 'Projetado para atração de clientes físicos e fidelização através de mídias sociais, anúncios geolocalizados e excelente gestão de reputação.',
    agentsIncluded: ['mp_social_media', 'mp_ads_optimizer', 'mp_review_manager'],
    executionFlow: [
      '1. Social Media Agent cria posts geolocalizados e promoções de bairro.',
      '2. Ads Optimizer Agent configura tráfego pago focado em raio de distância da loja.',
      '3. Review Manager responde às avaliações locais gerando credibilidade extrema.'
    ],
    initialConfig: {
      niche: 'Alimentação / Serviços / Clínicas',
      locationRadiusKm: 5
    },
    popularity: 87
  }
];
