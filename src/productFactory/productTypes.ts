export type ProductFormatType = 'CURSO' | 'EBOOK' | 'TEMPLATE' | 'MENTORIA';
export type ProjectStepType = 'IDEIA' | 'VALIDACAO' | 'BLUEPRINT' | 'CONTEUDO' | 'OFERTA' | 'LANCAMENTO';
export type ProductFactoryStatus = 
  | 'IDEA' 
  | 'RESEARCHING' 
  | 'VALIDATED' 
  | 'CREATING' 
  | 'REVIEW' 
  | 'READY_TO_PUBLISH' 
  | 'PUBLISHED'
  | 'PENDING'
  | 'SUCCESS'
  | 'LAUNCHED';

export interface ProductIdeaInput {
  niche: string;
  audience: string;
  goal: string;
  experience: string;
}

export interface GeneratedIdea {
  id: string;
  name: string;
  audience: string;
  painPoint: string;
  promise: string;
  format: ProductFormatType;
  commercialPotential: number; // 0-100
  category?: string;
  persona?: string;
  solution?: string;
}

export interface MarketValidation {
  score: number; // 0-100
  category: 'ALTA_OPORTUNIDADE' | 'MEDIA_OPORTUNIDADE' | 'BAIXA_OPORTUNIDADE';
  demandAnalysis: string;
  competitionAnalysis: string;
  trends: string[];
  keywords: string[];
}

export interface ProductBlueprint {
  structureType: ProductFormatType;
  items: {
    title: string; // e.g. "Modulo 1" or "Capitulo 1"
    subItems: string[]; // list of lessons or subtopics
    objective: string;
    exercises?: string[];
  }[];
}

export interface ContentAsset {
  texts: { title: string; body: string }[];
  scripts: string[];
  imagePrompt: string;
  imageUrl?: string;
  marketingAds: { channel: string; copy: string }[];
}

export interface ProductOffer {
  name: string;
  headline: string;
  benefits: string[];
  bonus: string[];
  guaranteeDays: number;
  suggestedPrice: number;
  salesStrategy: string;
}

export interface ProductScore {
  demand: number;
  competition: number;
  margin: number;
  easeOfCreation: number;
  scalability: number;
  overallScore: number; // 0-100
  recommendation: 'CRIAR' | 'REVISAR' | 'DESCARTAR';
}

export interface ProductProject {
  id: string;
  createdAt: string;
  tenantId: string;
  input: ProductIdeaInput;
  idea?: GeneratedIdea;
  validation?: MarketValidation;
  blueprint?: ProductBlueprint;
  content?: ContentAsset;
  offer?: ProductOffer;
  score?: ProductScore;
  currentStep: ProjectStepType;
  status: ProductFactoryStatus;

  // New Project Management fields requested in Etapa 24
  name: string;
  criador: string;
  tenant: string;
  arquivos: string[];
  histórico: string[];
}

