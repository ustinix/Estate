export interface TransactionType {
  id: number;
  name: string;
  direction: boolean;
  regularity: boolean;
}

export interface EstateTransaction {
  estate_id: number;
  comment: string;
  direction: boolean;
  regularity: boolean;
  type_id: number;
  cost: number;
  date_start: string;
  name?: string;
  frequency_id?: number;
  payday?: number;
  payday_on_workday?: boolean;
  loan_term?: number;
  interest_rate?: number;
}

export interface CalendarTransaction {
  transaction_id: number;
  estate_id: number;
  estate_name: string;
  estate_type_id: number;
  estate_type_name: string;
  transaction_type_id: number;
  transaction_type_name: string;
  transaction_type_direction: boolean;
  transaction_type_regularity: boolean;
  transaction_group_id: number;
  sum: string;
  date: string;
  comment: string;
}

export interface EstateTransactionForTable {
  comment: string;
  date: string;
  estate_id: number;
  estate_name: string;
  estate_type_id: number;
  estate_type_name: string;
  sum: string;
  transaction_group_id: number;
  transaction_id: number;
  transaction_type_direction: boolean;
  transaction_type_id: number;
  transaction_type_name: string;
  transaction_type_regularity: boolean;
}

export interface EstateTransactionResponse {
  data: EstateTransactionForTable[];
  total_items: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface EstateTransactionsFilters {
  estate_id?: number;
  estate_type_id?: number;
  transaction_type_id?: number;
  transaction_group_id?: number;
  transaction_type_direction?: boolean;
  transaction_type_regularity?: boolean;
  date_start?: string;
  date_end?: string;
  page?: number;
  limit?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
}

export interface BaseTransaction {
  estate_id: number;
  transaction_type_id: number | null;
  amount: number | null;
  description?: string;
}

export interface RegularIncome extends BaseTransaction {
  regularity: true;
  direction: true;
  date_start: string;
  payment_day: number;
  contract_duration: 'short' | 'long';
  indexation_rate?: number;
  indexation_period?: number;
  frequency_id?: number;
  indexation_frequency_id?: number;
}

export interface RegularExpense extends BaseTransaction {
  regularity: true;
  direction: false;
  date_start: string;
  payment_day: number;
  loan_amount?: number;
  loan_term?: number;
  interest_rate?: number;
  early_repayment_date?: string;
  early_repayment_amount?: number;
  repayment_plan_id?: number;
  frequency_id?: number;
}

export interface FinancialStatsResponse {
  categories: string[];
  income_data: number[];
  expense_data: number[];
  monthly_balance_data: number[];
  cumulative_balance_data: number[];
}

export interface ChartData {
  categories: string[];
  series: {
    name: string;
    data: number[];
    formatType?: 'currency' | 'percent';
  }[];
}
