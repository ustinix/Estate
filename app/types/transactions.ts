export interface TransactionType {
  id: number;
  name: string;
  direction: 0 | 1;
  regularity: 0 | 1;
}

export interface BaseTransaction {
  estate_id: number;
  transaction_type_id: number | null;
  amount: number | null;
  description?: string;
}

export interface OneTimeTransaction extends BaseTransaction {
  regularity: 0;
  date: string;
}

export interface RegularIncome extends BaseTransaction {
  regularity: 1;
  direction: 1;
  start_date: string;
  payment_day: number;
  contract_duration: 'short' | 'long';
  indexation_rate?: number;
  indexation_period?: number;
  frequency_id?: number;
  indexation_frequency_id?: number;
}

export interface RegularExpense extends BaseTransaction {
  regularity: 1;
  direction: 0;
  start_date: string;
  payment_day: number;
  loan_amount?: number;
  loan_term?: number;
  interest_rate?: number;
  early_repayment_date?: string;
  early_repayment_amount?: number;
  repayment_plan_id?: number;
  frequency_id?: number;
}

export interface RepaymentPlan {
  id: number;
  name: string;
}

export interface TransactionFrequency {
  id: number;
  name: string;
}

export interface OneTimeFormData {
  estate_id?: number;
  transaction_type_id: number | null;
  amount: number | null;
  description: string;
  date: string;
  regularity: 0;
}

export interface RegularIncomeFormData {
  estate_id?: number;
  transaction_type_id: number | null;
  amount: number | null;
  description: string;
  start_date: string;
  payment_day: number | null;
  regularity: 1;
  direction: 1;
  contract_duration: 'short' | 'long';
  frequency_id?: number;
  indexation_rate?: number;
  indexation_frequency_id?: number;
}

export interface RegularExpenseFormData {
  estate_id?: number;
  transaction_type_id: number | null;
  amount: number | null;
  description: string;
  start_date: string;
  payment_day: number | null;
  regularity: 1;
  direction: 0;
  loan_amount?: number | null;
  loan_term?: number | null;
  interest_rate?: number | null;
  repayment_plan_id?: number | null;
  frequency_id?: number;
  early_repayment_date?: string;
  early_repayment_amount?: number | null;
}
