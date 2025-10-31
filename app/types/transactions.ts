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
}

export interface EstateTransactionResponse {
  comment: string;
  date: string;
  estate_id: number;
  estate_name: string;
  estate_type_id: number;
  estate_type_name: string;
  sum: string;
  transaction_group_id: number;
  transaction_id: number;
  transaction_type_direction: number;
  transaction_type_id: number;
  transaction_type_name: string;
  transaction_type_regularity: number;
}

export interface BaseTransaction {
  estate_id: number;
  transaction_type_id: number | null;
  amount: number | null;
  description?: string;
}

export interface OneTimeTransaction extends BaseTransaction {
  regularity: false;
  date: string;
}

export interface RegularIncome extends BaseTransaction {
  regularity: true;
  direction: true;
  start_date: string;
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
  regularity: false;
}

export interface RegularIncomeFormData {
  estate_id?: number;
  transaction_type_id: number | null;
  amount: number | null;
  description: string;
  start_date: string;
  payment_day: number | null;
  regularity: true;
  direction: true;
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
  regularity: true;
  direction: false;
  loan_amount?: number | null;
  loan_term?: number | null;
  interest_rate?: number | null;
  repayment_plan_id?: number | null;
  frequency_id?: number;
  early_repayment_date?: string;
  early_repayment_amount?: number | null;
}
