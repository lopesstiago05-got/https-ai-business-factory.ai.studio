import { GoogleGenAI } from '@google/genai';
import { Repository } from '../db/repository.ts';
import { AgentInfo } from '../types.ts';
import { logInfo, logWarn, logError } from '../logs/logger.ts';
import { GlobalizationEngine } from '../global/globalizationEngine.ts';
import { InternationalResearch } from '../global/internationalResearch.ts';
import { InternationalMarketing } from '../global/internationalMarketing.ts';
import { ModelManager } from '../kernel/ModelManager.ts';

export class GlobalExpansionAgent {
  public static readonly ID = 'global_expansion_agent';
  public static readonly NAME = 'Global Expansion Agent';
  public static readonly ROLE = 'Diretor de Expansão Internacional';
  public static readonly DESCRIPTION = 'Responsável por coordenar o processo de internacionalização de infoprodutos, adaptar precificações por paridade, analisar nuances culturais, fornecer avisos fiscais/legais por país e localizar materiais de marketing.';

  private static getAI(): GoogleGenAI {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY não configurada nos segredos.');
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
   * Registra o Global Expansion Agent no Orchestrator se não estiver listado
   */
  public static async registerIfNeeded(): Promise<void> {
    try {
      const state = await Repository.getSystemState();
      const exists = state.agents.some(a => a.id === this.ID);
      
      if (!exists) {
        logInfo(`Registrando automaticamente ${this.NAME} no AgentManager...`);
        const newAgent: AgentInfo = {
          id: this.ID,
          name: this.NAME,
          role: this.ROLE,
          status: 'idle',
          executionTime: 0,
          efficiency: 97,
          description: this.DESCRIPTION
        };
        state.agents.push(newAgent);
        await Repository.saveState({ agents: state.agents });
        logInfo(`${this.NAME} cadastrado com absoluto sucesso no sistema.`);
      }
    } catch (err: any) {
      logError(`Falha ao registrar ${this.NAME}: ${err.message}`);
    }
  }

  private static async updateAgentState(status: 'idle' | 'running' | 'error', currentTask?: string) {
    try {
      const state = await Repository.getSystemState();
      const agentsList = state.agents.map(a => {
        if (a.id === this.ID) {
          return { ...a, status, currentTask: currentTask || undefined };
        }
        return a;
      });
      await Repository.saveState({ agents: agentsList });
    } catch (err) {
      console.error('Falha ao atualizar estado do Global Expansion Agent:', err);
    }
  }

  /**
   * Executa a estratégia de internacionalização completa para um infoproduto
   */
  public static async expandProduct(
    productId: string,
    targetCountryCode: string
  ): Promise<{
    success: boolean;
    report: string;
    targetCountry: string;
    currencyCode: string;
    suggestedPrice: number;
    localizedTitle: string;
    localizedHeadline: string;
    localizedPitch: string;
    complianceNotice: string;
    marketProfile: any;
    marketingAssets: any;
  }> {
    await this.registerIfNeeded();
    await this.updateAgentState('running', `Expandindo infoproduto para o código de região ${targetCountryCode}...`);

    try {
      const state = await Repository.getSystemState();
      const product = state.products.find(p => p.id === productId);
      if (!product) {
        throw new Error(`Produto com ID '${productId}' não foi encontrado.`);
      }

      // 1. Unifica as configurações da região
      GlobalizationEngine.setRegion(targetCountryCode);
      const activeProfile = GlobalizationEngine.getActiveProfile();
      const countryName = activeProfile.region.countryName;
      const currencyCode = activeProfile.currency.code;
      const languageName = activeProfile.language.name;
      const complianceNotice = activeProfile.complianceNotice;

      // 2. Conduz Análise de Pesquisa de Mercado no país
      const marketProfile = await InternationalResearch.analyzeMarket(product.niche, countryName);

      // 3. Traduz e localiza os criativos e propostas de marketing
      const localizedAssets = await GlobalizationEngine.expandContentToRegion(
        product.name,
        product.description,
        targetCountryCode
      );

      // 4. Cria os canais e copies específicas daquela cultura
      const localizedMarketing = await InternationalMarketing.localizeAssets(
        product.name,
        product.description,
        countryName,
        languageName
      );

      // 5. Sugere preço local por paridade (ex: USD 49, EUR 49, BRL 197)
      const rawLocalPrice = targetCountryCode === 'BR' ? 197 : targetCountryCode === 'US' ? 47 : 49;

      // 6. Constrói o relatório integrado final da expansão
      const ai = this.getAI();
      const reportResponse = await ModelManager.generateContent('global_expansion_agent', ai, {
        model: 'gemini-3.5-flash',
        contents: `Você é o Global Expansion Agent.
        Escreva um parecer executivo profissional em português avaliando o plano de internacionalização do infoproduto "${product.name}" para o mercado do país "${countryName}".
        
        Considere os seguintes dados:
        - Pontuação de Demanda: ${marketProfile.nicheDemandScore}/100
        - Concorrentes Locais: ${marketProfile.topCompetitors.join(', ')}
        - Nuances Culturais de Consumo: ${marketProfile.culturalNuances.join(' | ')}
        - Preço Sugerido: ${localizedAssets.suggestedLocalPrice}
        - Aviso de Conformidade Fiscal: ${complianceNotice}
        
        Gere um relatório de 3-4 parágrafos com formatação Markdown limpa e visualmente impressionante, apresentando a viabilidade estratégica, canais de aquisição sugeridos e lembrando explicitamente o usuário que as conformidades fiscais e legais dependem das regras locais vigentes do país e requerem validação técnica de profissionais locais.`
      });

      const report = reportResponse.text?.trim() || 'Plano de expansão executado com absoluto sucesso.';

      await this.updateAgentState('idle');

      return {
        success: true,
        report,
        targetCountry: countryName,
        currencyCode,
        suggestedPrice: rawLocalPrice,
        localizedTitle: localizedAssets.translatedTitle,
        localizedHeadline: localizedMarketing.localizedHeadline,
        localizedPitch: localizedMarketing.salesPitch,
        complianceNotice,
        marketProfile,
        marketingAssets: localizedMarketing
      };

    } catch (err: any) {
      logError(`Erro na expansão de infoproduto: ${err.message}`);
      await this.updateAgentState('idle');
      throw err;
    }
  }
}
