export interface EstateType {
  id: number;
  name: string;
  icon: string;
}

export interface TransactionType {
  id: number;
  name: string;
  direction?: number;
  regularity?: number;
}

export interface TransactionFrequencies {
  id: number;
  name: string;
}

export interface RepaymentPlans {
  id: number;
  name: string;
}

export interface DictionaryState {
  estateTypes: EstateType[];
  transactionTypes: TransactionType[];
  transactionFrequencies: TransactionFrequencies[];
  repaymentPlans: RepaymentPlans[];
  isLoading: boolean;
  error: string | null;
}
