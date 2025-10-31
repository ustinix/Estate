export interface ChartDataResponse {
  categories: string[]; // Месяцы: ['Янв 2024', 'Фев 2024', ...]
  series: {
    income: number[]; // Доходы по месяцам: [1000, 1500, 1200, ...]
    expense: number[]; // Расходы по месяцам: [500, 800, 600, ...]
    balance: number[]; // Баланс (доход - расход): [500, 700, 600, ...]
    cumulativeBalance: number[]; // Накопительный баланс: [500, 1200, 1800, ...]
  };
  totals: {
    totalIncome: number; // Общий доход за период
    totalExpense: number; // Общий расход за период
    netBalance: number; // Чистая прибыль
  };
}
