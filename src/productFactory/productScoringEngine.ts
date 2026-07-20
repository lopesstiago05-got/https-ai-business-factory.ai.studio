import { GoogleGenAI } from '@google/genai';
import { ProductProject, ProductScore } from './productTypes.ts';
import { ModelManager } from '../kernel/ModelManager.ts';

export class ProductScoringEngine {
  public static async calculate(project: ProductProject): Promise<ProductScore> {
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

        const prompt = `Aja como o AI Product Score Engine. Avalie a viabilidade geral do seguinte produto digital de 0 a 100:
Nome do Produto: ${project.idea?.name}
Formato: ${project.idea?.format}
Promessa: ${project.idea?.promise}
Validação de Mercado Score: ${project.validation?.score || 80}
Preço Sugerido: ${project.offer?.suggestedPrice || 97}

Calcule notas de 0 a 100 para os seguintes critérios:
- Demanda (demand)
- Concorrência (competition) - maior nota se houver barreiras ou se for fácil se diferenciar.
- Margem (margin) - maior nota para produtos digitais de baixo custo de entrega.
- Facilidade de produção (easeOfCreation) - maior nota para ebooks/templates, menor para cursos/mentorias complexas.
- Escalabilidade (scalability) - maior para ebooks/cursos/templates, menor para mentorias 1x1.

E decida a recomendação final:
- "CRIAR" (se score final >= 78)
- "REVISAR" (se score final entre 60 e 77)
- "DESCARTAR" (se score final < 60)

Retorne um JSON estrito correspondente ao formato:
{
  "demand": número de 0 a 100,
  "competition": número de 0 a 100,
  "margin": número de 0 a 100,
  "easeOfCreation": número de 0 a 100,
  "scalability": número de 0 a 100,
  "overallScore": número de 0 a 100 representing the weighted average,
  "recommendation": "CRIAR" | "REVISAR" | "DESCARTAR"
}`;

        const response = await ModelManager.generateContent('product_scoring_engine', ai, {
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });

        return JSON.parse(response.text || '{}');
      } catch (err: any) {
        console.warn('[ProductScoringEngine] Falha ao chamar Gemini, aplicando algoritmo heurístico:', err.message);
      }
    }

    // Heuristic Algorithm fallback
    const demand = project.validation?.score || 85;
    const competition = 100 - (project.validation?.score ? project.validation.score * 0.15 : 15);
    const margin = project.idea?.format === 'EBOOK' ? 98 : project.idea?.format === 'CURSO' ? 95 : 90;
    const easeOfCreation = project.idea?.format === 'EBOOK' ? 92 : project.idea?.format === 'TEMPLATE' ? 88 : 75;
    const scalability = project.idea?.format === 'MENTORIA' ? 65 : 95;

    const overallScore = Math.round((demand * 0.3) + (competition * 0.1) + (margin * 0.2) + (easeOfCreation * 0.2) + (scalability * 0.2));
    
    let recommendation: 'CRIAR' | 'REVISAR' | 'DESCARTAR' = 'CRIAR';
    if (overallScore < 60) recommendation = 'DESCARTAR';
    else if (overallScore < 75) recommendation = 'REVISAR';

    return {
      demand,
      competition,
      margin,
      easeOfCreation,
      scalability,
      overallScore,
      recommendation
    };
  }
}
