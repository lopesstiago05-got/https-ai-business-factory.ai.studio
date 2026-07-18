import { GrowthAnalyticsEngine, GrowthMetrics, HistoricalGrowthPoint } from './growthMetrics.ts';
import { OpportunityEngine, GrowthOpportunity } from './opportunityEngine.ts';
import { StrategyCoordinator, AgentStrategySuggestion } from './strategyCoordinator.ts';
import { ForecastingEngine, GrowthForecast } from './forecastingEngine.ts';
import { RecommendationCenter, GrowthRecommendation } from './recommendationCenter.ts';
import { OptimizationPlanner, GrowthActionPlan } from './optimizationPlanner.ts';

export interface GlobalGrowthState {
  metrics: GrowthMetrics;
  historicalMetrics: HistoricalGrowthPoint[];
  opportunities: GrowthOpportunity[];
  strategySuggestions: AgentStrategySuggestion[];
  forecasts: GrowthForecast[];
  recommendations: GrowthRecommendation[];
  actionPlans: GrowthActionPlan[];
  overallGrowthScore: number;
  lastUpdated: string;
}

export class GrowthEngine {
  private static growthScore = 84; // Out of 100

  /**
   * Generates the entire current landscape of autonomous growth.
   */
  public static getGlobalState(): GlobalGrowthState {
    const currentMetrics = GrowthAnalyticsEngine.getConsolidatedMetrics();
    const opportunities = OpportunityEngine.scanOpportunities();
    
    // Distribute opportunities dynamically to other agents
    StrategyCoordinator.distributeOpportunities(opportunities);

    // Calculate score dynamically based on LTV/CAC ratio, Churn and Conversion rates
    // Good: LTV/CAC > 3 (45 CAC vs 250 LTV is ~5.5x), Churn < 5%
    const ltvCacRatio = currentMetrics.ltv / currentMetrics.cac;
    let score = 50;
    if (ltvCacRatio > 5) score += 20;
    else if (ltvCacRatio > 3) score += 10;

    if (currentMetrics.churnRate < 5) score += 15;
    else if (currentMetrics.churnRate < 8) score += 5;

    if (currentMetrics.conversionRate > 3) score += 15;
    else if (currentMetrics.conversionRate > 1.5) score += 5;

    this.growthScore = Math.min(100, Math.round(score));

    return {
      metrics: currentMetrics,
      historicalMetrics: GrowthAnalyticsEngine.getHistoricalMetrics(),
      opportunities,
      strategySuggestions: StrategyCoordinator.getSuggestions(),
      forecasts: ForecastingEngine.generateForecasts(currentMetrics),
      recommendations: RecommendationCenter.getRecommendations(),
      actionPlans: OptimizationPlanner.getActionPlans(),
      overallGrowthScore: this.growthScore,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Refreshes and returns the growth score
   */
  public static getOverallGrowthScore(): number {
    return this.growthScore;
  }
}
