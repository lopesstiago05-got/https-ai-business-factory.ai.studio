import { GrowthEngine, GlobalGrowthState } from './growthEngine.ts';
import { StrategyCoordinator } from './strategyCoordinator.ts';
import { RecommendationCenter } from './recommendationCenter.ts';
import { OptimizationPlanner } from './optimizationPlanner.ts';
import { logInfo, logWarn, logError } from '../logs/logger.ts';

export class GrowthManager {
  /**
   * Retrieves full snapshot of growth telemetry
   */
  public static async getTelemetrySnapshot(): Promise<GlobalGrowthState> {
    return GrowthEngine.getGlobalState();
  }

  /**
   * Applies a recommendation from the Recommendation Center
   */
  public static async applyRecommendation(id: string): Promise<{
    success: boolean;
    message: string;
    updatedState: GlobalGrowthState;
  }> {
    logInfo(`[GrowthManager] Aplicando recomendação de crescimento: ${id}`);
    const accepted = RecommendationCenter.acceptRecommendation(id);
    
    if (accepted) {
      // Simulate real effect after a short delay
      RecommendationCenter.executeRecommendation(id);
      logInfo(`[GrowthManager] Recomendação ${id} executada com sucesso!`);
      
      return {
        success: true,
        message: 'Recomendação de crescimento ativada e aplicada com êxito.',
        updatedState: GrowthEngine.getGlobalState()
      };
    }

    return {
      success: false,
      message: 'Não foi possível localizar ou aplicar a recomendação indicada.',
      updatedState: GrowthEngine.getGlobalState()
    };
  }

  /**
   * Approves a draft Action Plan
   */
  public static async approveActionPlan(planId: string): Promise<{
    success: boolean;
    message: string;
    updatedState: GlobalGrowthState;
  }> {
    logInfo(`[GrowthManager] Aprovando plano estratégico de otimização: ${planId}`);
    const approved = OptimizationPlanner.approvePlan(planId);

    if (approved) {
      return {
        success: true,
        message: 'Plano estratégico aprovado e agendado para execução autônoma dos agentes.',
        updatedState: GrowthEngine.getGlobalState()
      };
    }

    return {
      success: false,
      message: 'Plano estratégico não localizado ou em status inelegível para aprovação.',
      updatedState: GrowthEngine.getGlobalState()
    };
  }

  /**
   * Updates an agent suggestion status (applying or rejecting it)
   */
  public static async updateAgentStrategy(
    agentId: string,
    status: 'pending' | 'applied' | 'rejected'
  ): Promise<{
    success: boolean;
    message: string;
    updatedState: GlobalGrowthState;
  }> {
    logInfo(`[GrowthManager] Atualizando status de sugestão para agente '${agentId}': ${status}`);
    const updated = StrategyCoordinator.updateSuggestionStatus(agentId, status);

    if (updated) {
      return {
        success: true,
        message: `Sugestão do agente '${agentId}' foi atualizada para '${status}'.`,
        updatedState: GrowthEngine.getGlobalState()
      };
    }

    return {
      success: false,
      message: 'Sugestão ou agente não encontrado.',
      updatedState: GrowthEngine.getGlobalState()
    };
  }
}
