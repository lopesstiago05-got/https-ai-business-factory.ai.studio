import { GoogleGenAI } from '@google/genai';
import { GeneratedIdea, ProductBlueprint } from './productTypes.ts';
import { ModelManager } from '../kernel/ModelManager.ts';

export class ProductBlueprintEngine {
  public static async generate(idea: GeneratedIdea): Promise<ProductBlueprint> {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      try {
        const ai = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        const prompt = `Aja como o ProductBlueprintEngine. Estruture de forma automatizada o blueprint (grade e esqueleto didático) de um produto digital.
Nome do Produto: ${idea.name}
Formato Recomendado: ${idea.format}
Promessa: ${idea.promise}

Adapte a estrutura de acordo com o formato:
- Se CURSO: defina módulos, aulas (subItems), exercícios e materiais extras para cada módulo.
- Se EBOOK: defina capítulos, estrutura/seções de escrita (subItems), resumos e objetivos.
- Se TEMPLATE: defina arquivos/modelos recomendados, instruções de uso e como aplicar.
- Se MENTORIA: defina cronograma das sessões, encontros recomendados, dinâmicas e entregáveis de valor.

Retorne um JSON estrito correspondente ao formato:
{
  "structureType": "${idea.format}",
  "items": [
    {
      "title": "Título do Módulo, Capítulo, Arquivo ou Encontro",
      "subItems": ["Tópico/Aula/Modelo/Sessão 1", "Tópico/Aula/Modelo/Sessão 2", "Tópico/Aula/Modelo/Sessão 3"],
      "objective": "Objetivo pedagógico, operacional ou estratégico desta seção",
      "exercises": ["Ação prática sugerida, exercício ou entregável recomendado"]
    }
  ]
}`;

        const response = await ModelManager.generateContent('product_blueprint_engine', ai, {
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });

        const data = JSON.parse(response.text || '{}');
        if (data.items && Array.isArray(data.items)) {
          return {
            structureType: idea.format,
            items: data.items
          };
        }
      } catch (err: any) {
        console.warn('[ProductBlueprintEngine] Falha ao chamar Gemini, aplicando fallback didático:', err.message);
      }
    }

    // Comprehensive Fallbacks based on product format
    if (idea.format === 'CURSO') {
      return {
        structureType: 'CURSO',
        items: [
          {
            title: 'Módulo 1: Introdução Estratégica e Alinhamento',
            subItems: ['O Despertar da oportunidade', 'Configurando seu ambiente operacional', 'Mapeamento de gargalos e diagnóstico'],
            objective: 'Introduzir o aluno à metodologia básica e garantir que todas as ferramentas iniciais estejam prontas.',
            exercises: ['Faça o download do template de diagnóstico e preencha com suas dores principais.']
          },
          {
            title: 'Módulo 2: Implementação Prática Passo a Passo',
            subItems: ['Primeira execução real', 'Configuração avançada sem código', 'Evitando as 3 falhas mais comuns de iniciantes'],
            objective: 'Levar o aluno a alcançar seu primeiro resultado prático palpável e seguro.',
            exercises: ['Publique seu primeiro fluxo operacional e compartilhe na comunidade de alunos.']
          },
          {
            title: 'Módulo 3: Escalonamento e Próximos Passos',
            subItems: ['Como mensurar seus ganhos reais', 'Integração de canais adicionais', 'Sua rotina automatizada contínua'],
            objective: 'Garantir que o aluno saiba como manter e expandir a solução criada de forma sustentável.',
            exercises: ['Crie seu plano de revisão mensal de 15 minutos para otimização contínua.']
          }
        ]
      };
    } else if (idea.format === 'MENTORIA') {
      return {
        structureType: 'MENTORIA',
        items: [
          {
            title: 'Encontro 1: Alinhamento de Expectativas e Planejamento',
            subItems: ['Análise de perfil individualizada', 'Definição de marcos de sucesso a curto prazo', 'Montagem do cronograma customizado'],
            objective: 'Mapear a situação atual do mentorado e traçar a rota exata de desenvolvimento.',
            exercises: ['Preencher o questionário de diagnóstico aprofundado antes do encontro.']
          },
          {
            title: 'Encontro 2: Acompanhamento de Implementação e Ajustes',
            subItems: ['Revisão dos primeiros marcos atingidos', 'Resolução de pontos de atrito técnico', 'Aceleração de entrega de valor'],
            objective: 'Garantir execução correta da estratégia e resolver bloqueios individuais de imediato.',
            exercises: ['Implementar o feedback recebido na sessão e documentar os resultados.']
          },
          {
            title: 'Encontro 3: Consolidação e Escala Comercial',
            subItems: ['Modelo de empacotamento premium', 'Estratégia de precificação ousada', 'Abertura para novos mercados ou canais'],
            objective: 'Capacitar o mentorado para continuar colhendo resultados de forma autônoma após a conclusão.',
            exercises: ['Apresentar a nova proposta comercial refinada e fechar o primeiro cliente premium.']
          }
        ]
      };
    } else if (idea.format === 'TEMPLATE') {
      return {
        structureType: 'TEMPLATE',
        items: [
          {
            title: 'Estrutura do Arquivo: painel_central_metodologia.xlsx',
            subItems: ['Aba de instruções rápidas de preenchimento', 'Painel de controle visual e indicadores dinâmicos', 'Banco de dados estruturado pronto para uso'],
            objective: 'Oferecer uma interface de entrada intuitiva e pronta para ser populada pelo usuário.',
            exercises: ['Insira os dados da sua última semana e observe os gráficos se atualizarem automaticamente.']
          },
          {
            title: 'Estrutura do Guia: instrucoes_de_uso_rapido.pdf',
            subItems: ['Passo a passo de importação e exportação', 'Respostas para as 5 dúvidas mais frequentes', 'Casos práticos de uso real'],
            objective: 'Eliminar qualquer fricção técnica de uso ou configuração inicial pelo comprador.',
            exercises: ['Siga o checklist de 3 passos para validar se a integração funcionou corretamente.']
          }
        ]
      };
    } else {
      // EBOOK
      return {
        structureType: 'EBOOK',
        items: [
          {
            title: 'Capítulo 1: O Desafio Oculto de Mercado',
            subItems: ['Análise profunda do cenário atual', 'Por que as soluções tradicionais falham para você', 'O método inovador desmistificado'],
            objective: 'Gerar consciência profunda sobre o problema real e preparar mentalmente o leitor para a solução.',
            exercises: ['Reflita sobre quanto dinheiro ou tempo você está perdendo hoje ao ignorar este problema.']
          },
          {
            title: 'Capítulo 2: A Construção do Seu Novo Pilar de Resultados',
            subItems: ['Os 3 passos essenciais de preparação', 'Executando o plano de ação simples', 'Ajustando as engrenagens para máxima eficiência'],
            objective: 'Fornecer o passo a passo exato e de fácil leitura para aplicar o conhecimento do ebook.',
            exercises: ['Execute o Passo 1 do capítulo hoje mesmo para sentir a primeira mudança prática.']
          },
          {
            title: 'Capítulo 3: Consolidação e Plano de Sucesso Contínuo',
            subItems: ['Como blindar seus resultados contra instabilidades', 'Estratégias de escala e automação inteligente', 'A jornada adiante do leitor de sucesso'],
            objective: 'Fidelizar o leitor mostrando como continuar evoluindo de forma sustentável e autônoma.',
            exercises: ['Crie seu plano pessoal de hábitos de 5 minutos diários baseados na metodologia.']
          }
        ]
      };
    }
  }
}
