import { GrowthMetrics } from './growthMetrics.ts';

export interface GrowthForecast {
  month: string;
  pessimisticRevenue: number;
  realisticRevenue: number;
  optimisticRevenue: number;
  projectedCAC: number;
  projectedLTV: number;
}

export class ForecastingEngine {
  /**
   * Generates mathematical projections for the next 6 months using realistic trend lines.
   */
  public static generateForecasts(currentMetrics: GrowthMetrics): GrowthForecast[] {
    const forecasts: GrowthForecast[] = [];
    const now = new Date();
    
    let baseRevenue = currentMetrics.revenue;
    let baseCAC = currentMetrics.cac;
    let baseLTV = currentMetrics.ltv;

    for (let i = 1; i <= 6; i++) {
      const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthLabel = futureDate.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });

      // Exponential compounding factors
      const pessimisticGrowth = 1 + i * 0.05;
      const realisticGrowth = 1 + i * 0.12;
      const optimisticGrowth = 1 + i * 0.22;

      // CAC usually decreases slightly or stabilizes with optimization
      const cacFactor = 1 - (i * 0.02);
      // LTV increases through upsells and active customer retention
      const ltvFactor = 1 + (i * 0.03);

      forecasts.push({
        month: monthLabel,
        pessimisticRevenue: Math.round(baseRevenue * pessimisticGrowth),
        realisticRevenue: Math.round(baseRevenue * realisticGrowth),
        optimisticRevenue: Math.round(baseRevenue * optimisticGrowth),
        projectedCAC: Math.round(baseCAC * cacFactor),
        projectedLTV: Math.round(baseLTV * ltvFactor)
      });
    }

    return forecasts;
  }
}
