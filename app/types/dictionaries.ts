export interface EstateType {
  id: number;
  name: string;
  icon: string;
}

export interface TransactionType {
  id: number;
  name: string;
}

export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
}

export interface DictionaryState {
  estateTypes: EstateType[];
  currencies: Currency[];
  isLoading: boolean;
  error: string | null;
}
