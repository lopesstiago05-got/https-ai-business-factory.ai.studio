import { GoogleGenAI } from '@google/genai';
import { ProductIdeaInput, GeneratedIdea } from './productTypes.ts';

export class ProductIdeaGenerator {
  public static async generate(input: ProductIdeaInput): Promise<GeneratedIdea> {
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

        const prompt = `Como um experiente ProductIdeaAgent, crie uma proposta altamente lucrativa de produto digital baseado nas seguintes entradas:
Nicho: ${input.niche}
Público Alvo: ${input.audience}
Objetivo: ${input.goal}
Experiência do Criador: ${input.experience}

Retorne um JSON estrito correspondente a este formato:
{
  "name": "Nome extremamente cativante e comercial do produto",
  "category": "Categoria/Nicho refinado do produto",
  "persona": "Descrição detalhada da Persona ideal do comprador",
  "painPoint": "A dor principal identificada que este produto sana",
  "solution": "Como o produto resolve essa dor de forma brilhante",
  "promise": "Uma promessa irresistível de transformação em uma frase curta",
  "format": "CURSO" | "EBOOK" | "TEMPLATE" | "MENTORIA",
  "commercialPotential": número de 0 a 100
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });

        const data = JSON.parse(response.text || '{}');
        return {
          id: `idea_${Math.random().toString(36).substr(2, 9)}`,
          name: data.name || `Método ${input.niche}`,
          audience: data.persona || input.audience,
          painPoint: data.painPoint || 'Dificuldade de automatizar tarefas operacionais',
          promise: data.promise || 'Transforme seu processo manual em automação em menos de 2 horas',
          format: (data.format as any) || 'EBOOK',
          commercialPotential: data.commercialPotential || 85,
          category: data.category || input.niche,
          persona: data.persona || input.audience,
          solution: data.solution || 'Um guia prático focado em resolver essa dor de forma simples.'
        };
      } catch (err: any) {
        console.warn('[ProductIdeaGenerator] Falha ao chamar Gemini, aplicando fallback inteligente:', err.message);
      }
    }

    // Fallback inteligente
    const formats: ('CURSO' | 'EBOOK' | 'TEMPLATE' | 'MENTORIA')[] = ['CURSO', 'EBOOK', 'TEMPLATE', 'MENTORIA'];
    const chosenFormat = formats[Math.floor(Math.random() * formats.length)];
    return {
      id: `idea_${Math.random().toString(36).substr(2, 9)}`,
      name: `Fórmula de Sucesso para ${input.niche}`,
      audience: input.audience,
      painPoint: `Perda de tempo crônica e processos lentos e manuais na área de ${input.niche}.`,
      promise: `Domine de forma definitiva técnicas eficientes e economize até 10 horas de trabalho semanal.`,
      format: chosenFormat,
      commercialPotential: 88,
      category: input.niche,
      persona: `Profissional de ${input.niche} que busca escalar seus resultados.`,
      solution: `Método passo a passo testado no mercado para implementar soluções eficientes rapidamente.`
    };
  }
}
