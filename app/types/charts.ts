export interface ChartDataResponse {
  categories: string[];
  series: {
    income: number[];
    expense: number[];
    balance: number[];
    cumulativeBalance: number[];
  };
  totals: {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
  };
}
