export interface RoiMetric {
  value: number;
  target: number;
}

export interface PaybackMetric {
  value: string;
  target: string;
  trend?: 'up' | 'down' | 'stable';
  subtitle: string;
  progress?: number;
}

export interface ProfitMetric {
  value: number;
  growth: string;
  period: string;
  currency?: string;
}

export interface EstateMetrics {
  roi: RoiMetric;
  payback: PaybackMetric;
  profit: ProfitMetric;
}
