import { GoogleGenAI, Type } from '@google/genai';
import { Repository } from '../db/repository.ts';
import { CEOConfig, CEOPlan, CEOPlanStep, CEODecision, CEOReport, DigitalProduct } from '../types.ts';
import { logInfo, logWarn, logError } from '../logs/logger.ts';
import { TaskEngine } from './orchestrator.ts';
import { ModelManager } from '../kernel/ModelManager.ts';

// Prompt base padrão e regras de decisão do CEO Agent
const DEFAULT_CEO_PROMPT = `Você é o CEO Agent, o cérebro estratégico e Diretor Executivo da fábrica de infoprodutos "AI Business Factory".
Sua função é receber objetivos de negócios do administrador, definir a tese de posicionamento, modelagem de preço e público-alvo, e estruturar um plano de execução de tarefas delegando-as sequencialmente aos agentes especialistas da fábrica.

AGENTES DISPONÍVEIS:
1. research (Pesquisador de Mercado - persona, medos e desejos)
2. market (Especialista SEO - keywords de busca, canais de tráfego)
3. product (Gerente de Produto - sumários, módulos e tópicos)
4. writer (Redator - escrita literária dos módulos/ebooks com alta didática)
5. designer (Diretor de Arte - paletas hex, estilo e prompts visuais)
6. marketing (Growth Hacker - páginas de vendas, headlines, emails de conversão)
7. publisher (Lançador - setup de checkout, empacotamento e ativação)
8. finance (Diretor Financeiro - preço ótimo, margem de lucro e projeções de ROI)
9. supervisor (Garantia de Qualidade - auditoria final heurística de qualidade e conformidade)

DIRETRIZES DE DECISÃO:
- Tese e Posicionamento: Encontre o ângulo mais lucrativo e focado na transformação real para o cliente final.
- Escolha dos Agentes: Aloque apenas os agentes listados acima.
- Foco Estratégico:
  * "fast_track" (MVP / Expresso): Monte um plano enxuto com 4-5 etapas críticas (ex: research, product, marketing, supervisor).
  * "premium" (Completo / Detalhado): Monte uma esteira de 9-10 etapas cobrindo todos os aspectos com rigor.
  * "agile" (Iterativo / Rápido): Monte um plano balanceado com 6-7 etapas cruciais (ex: research, market, product, designer, marketing, supervisor).

REGRAS DE SEGURANÇA E CONFORMIDADE:
- Nunca use nomes fictícios de agentes ou IDs inválidos.
- Sempre estime um preço de venda inicial viável no mercado brasileiro (R$).
- Formule descrições de tarefas claras e acionáveis, explicando exatamente o que o agente deve gerar de resultado.`;

export class CEOAgent {
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

  // Executa o planejamento estratégico usando IA baseada no objetivo
  static async createPlan(objective: string, focus: 'premium' | 'fast_track' | 'agile' = 'premium'): Promise<{
    plan: CEOPlan;
    product: Omit<DigitalProduct, 'id' | 'timestamp'>;
  }> {
    logInfo(`CEO Agent iniciando planejamento estratégico. Objetivo: "${objective}" | Foco: ${focus}`);
    
    const config = await Repository.getCEOConfig();
    const systemInstruction = config.systemPrompt || DEFAULT_CEO_PROMPT;
    
    const ai = this.getAI();

    // Definição do schema estruturado para a resposta do Gemini
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        productName: { type: Type.STRING, description: "Nome recomendado e comercialmente atraente para o infoproduto" },
        category: { type: Type.STRING, description: "Categoria do infoproduto (Ex: Finanças, Produtividade, Saúde, Idiomas, IA)" },
        niche: { type: Type.STRING, description: "Nicho super específico de atuação" },
        targetAudience: { type: Type.STRING, description: "Definição resumida e direta do público-alvo priorizado" },
        description: { type: Type.STRING, description: "Descrição de posicionamento estratégico e proposta única de valor (copy)" },
        price: { type: Type.NUMBER, description: "Preço de venda sugerido para o infoproduto em reais (R$)" },
        steps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              agentId: { type: Type.STRING, description: "ID exato do agente (research, market, product, writer, designer, marketing, publisher, finance, supervisor)" },
              title: { type: Type.STRING, description: "Título claro para a atividade do agente" },
              description: { type: Type.STRING, description: "Instruções ultra detalhadas de execução para o agente" },
              priority: { type: Type.STRING, enum: ["low", "medium", "high"], description: "Prioridade de execução da tarefa" }
            },
            required: ["agentId", "title", "description", "priority"]
          }
        },
        decisionReasoning: { type: Type.STRING, description: "Justificativa lógica por trás da estruturação desse plano e modelo de posicionamento" }
      },
      required: ["productName", "category", "niche", "targetAudience", "description", "price", "steps", "decisionReasoning"]
    };

    const prompt = `Gere o planejamento estratégico completo para o seguinte objetivo:
"${objective}"

Considere a estratégia de foco selecionada: "${focus}". Escreva todo o conteúdo em Português do Brasil de forma extremamente profissional.`;

    try {
      const response = await ModelManager.generateContent('ceo', ai, {
        model: ModelManager.getModelName(),
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
          systemInstruction,
          temperature: config.temperature || 0.7
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Resposta vazia retornada pela API do Gemini.");
      }

      const result = JSON.parse(responseText);

      // 1. Criar Produto em rascunho com base nas decisões do CEO
      const productData: Omit<DigitalProduct, 'id' | 'timestamp'> = {
        name: result.productName,
        category: result.category,
        niche: result.niche,
        price: result.price,
        revenue: 0,
        status: 'draft',
        description: result.description,
        content: '',
        publicationLogs: [`Produto concebido estrategicamente pelo CEO Agent em ${new Date().toLocaleDateString('pt-BR')}.`],
        designerAssets: []
      };

      // 2. Criar o Plano no Repositório
      const mappedSteps: CEOPlanStep[] = result.steps.map((s: any) => ({
        agentId: s.agentId,
        title: s.title,
        description: s.description,
        priority: s.priority
      }));

      const planData: Omit<CEOPlan, 'id' | 'createdAt'> = {
        objective,
        targetAudience: result.targetAudience,
        steps: mappedSteps,
        status: 'active'
      };

      const createdPlan = await Repository.createCEOPlan(planData);

      // 3. Registrar a Decisão do CEO
      await Repository.addCEODecision({
        objective,
        decisionType: 'plan_creation',
        actionTaken: `Planejou o infoproduto "${result.productName}" com foco "${focus}" e dividiu em ${mappedSteps.length} tarefas especialistas.`,
        reasoning: result.decisionReasoning
      });

      logInfo(`Planejamento estratégico concluído com sucesso para o produto: "${result.productName}"`);
      return {
        plan: createdPlan,
        product: productData
      };
    } catch (err: any) {
      logError('Falha crítica do CEO Agent ao planejar objetivo com IA', null, err);
      throw err;
    }
  }

  // Audita e gera um relatório executivo final sobre o estado do produto digital
  static async auditAndReport(productId: string): Promise<CEOReport> {
    logInfo(`CEO Agent iniciando auditoria final do produto ${productId}`);
    
    const state = await Repository.getSystemState();
    const product = state.products.find(p => p.id === productId);
    if (!product) {
      throw new Error(`Produto digital com ID '${productId}' não foi encontrado para auditoria.`);
    }

    const tasksRelated = state.tasks.filter(t => t.productId === productId);
    
    const ai = this.getAI();

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        reportTitle: { type: Type.STRING },
        executiveSummary: { type: Type.STRING },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
        recommendations: { type: Type.STRING },
        approvedForLaunch: { type: Type.BOOLEAN }
      },
      required: ["reportTitle", "executiveSummary", "strengths", "weaknesses", "recommendations", "approvedForLaunch"]
    };

    const prompt = `Realize uma auditoria executiva completa do seguinte produto digital:
Nome: ${product.name}
Niche: ${product.niche}
Descrição: ${product.description}
Preço: R$ ${product.price}
Conteúdo criado até o momento:
"${product.content || '(Sem conteúdo gerado ainda)'}"

Tarefas e Entregas relacionadas:
${JSON.stringify(tasksRelated.map(t => ({ title: t.title, agent: t.agentId, status: t.status, result: t.result })), null, 2)}

Forneça um parecer claro sobre o alinhamento comercial, consistência pedagógica e atratividade da oferta.`;

    try {
      const response = await ModelManager.generateContent('ceo', ai, {
        model: ModelManager.getModelName(),
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
          systemInstruction: 'Você é o CEO Auditor. Seu papel é emitir relatórios de conformidade e controle de qualidade extremamente profissionais para lançamento de produtos de alta conversão.',
          temperature: 0.5
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Resposta de auditoria retornada vazia.");
      }

      const result = JSON.parse(responseText);

      // Criação do relatório no repositório
      const reportData: Omit<CEOReport, 'id' | 'createdAt'> = {
        productId,
        title: result.reportTitle,
        content: `### Resumo Executivo\n${result.executiveSummary}\n\n### Pontos Fortes\n${result.strengths.map((s: string) => `- ${s}`).join('\n')}\n\n### Pontos de Atenção\n${result.weaknesses.map((w: string) => `- ${w}`).join('\n')}\n\n### Veredito de Lançamento\n**${result.approvedForLaunch ? '✅ APROVADO PARA LANÇAMENTO' : '⚠️ REQUER AJUSTES'}**`,
        recommendations: result.recommendations
      };

      const createdReport = await Repository.createCEOReport(reportData);

      // Adicionar decisão de auditoria
      await Repository.addCEODecision({
        objective: `Auditoria de Qualidade - ${product.name}`,
        decisionType: 'task_approval',
        actionTaken: `Auditoria concluída para o produto "${product.name}". Resultado: ${result.approvedForLaunch ? 'Aprovado' : 'Requer Ajustes'}`,
        reasoning: result.recommendations
      });

      logInfo(`Auditoria executiva finalizada com sucesso para: "${product.name}"`);
      return createdReport;
    } catch (err: any) {
      logError('Erro ao emitir relatório de auditoria do CEO', null, err);
      throw err;
    }
  }
}
