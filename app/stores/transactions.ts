import { defineStore } from 'pinia';
import type {
  EstateTransaction,
  EstateTransactionResponse,
  GetEstateTransactionsRequest,
} from '~/types/transactions';

export const useTransactionsStore = defineStore('transactions', () => {
  const userTransactions = ref<EstateTransactionResponse[]>([]);
  const userEstateTransactions = ref<EstateTransactionResponse[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const $api = useApi();

  const getUserTransactions = async (userId: number): Promise<void> => {
    try {
      const transactions = await $api.get<EstateTransactionResponse[]>(
        `/users/${userId}/transactions`,
      );
      userTransactions.value = [...transactions];
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const getUserEstateTransactions = async (
    userId: number,
    estateId: number,
    filters: {
      estate_type_id?: number;
      transaction_type_id?: number;
      transaction_group_id?: number;
      transaction_type_direction?: boolean;
      transaction_type_regularity?: boolean;
    } = {},
  ): Promise<EstateTransactionResponse[]> => {
    if (!userId) return [];

    try {
      isLoading.value = true;
      error.value = null;

      const requestBody: GetEstateTransactionsRequest = {
        estate_id: estateId,
        ...filters,
      };

      const response = await $api.post<EstateTransactionResponse[]>(
        `/users/${userId}/estates/${estateId}/transactions/filter`,
        requestBody,
      );

      const sortedTransactions = [...response].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      userEstateTransactions.value = sortedTransactions;
      return sortedTransactions;
    } catch (err) {
      error.value = 'Failed to fetch transactions';
      console.error('Failed to fetch transactions:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const addEstateTransactions = async (
    userId: number,
    transactionData: EstateTransaction,
  ): Promise<void> => {
    try {
      isLoading.value = true;
      error.value = null;
      await $api.post(`/transactions`, transactionData);

      await getUserEstateTransactions(userId, transactionData.estate_id);
    } catch (err) {
      error.value = String(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const clearTransactions = () => {
    userEstateTransactions.value = [];
  };

  return {
    userTransactions,
    userEstateTransactions,
    isLoading,
    error,
    getUserEstateTransactions,
    clearTransactions,
    getUserTransactions,
    addEstateTransactions,
  };
});
