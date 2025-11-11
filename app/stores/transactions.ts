import { defineStore } from 'pinia';
import type {
  EstateTransaction,
  CalendarTransaction,
  EstateTransactionForTable,
  EstateTransactionResponse,
  EstateTransactionsFilters,
  ChartData,
} from '~/types/transactions';

export const useTransactionsStore = defineStore('transactions', () => {
  const userTransactions = ref<CalendarTransaction[]>([]);
  const userEstateTransactions = ref<EstateTransactionForTable[]>([]);
  const financialStats = ref<ChartData | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref({
    page: 1,
    page_size: 10,
    total_items: 0,
    total_pages: 0,
  });

  const defaultPaginationParams = {
    page: 1,
    limit: 10,
  };

  const $api = useApi();

  const getUserTransactions = async (userId: number): Promise<CalendarTransaction[]> => {
    try {
      const response = await $api.get<{
        data: CalendarTransaction[];
        total_items: number;
        page: number;
        limit: number;
        total_pages: number;
      }>(`/users/${userId}/transactions`);

      userTransactions.value = response.data || [];
      return userTransactions.value;
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      userTransactions.value = [];
      throw error;
    }
  };

  const getUserEstateTransactions = async (
    userId: number,
    estateId: number,
    filters: EstateTransactionsFilters = {},
  ): Promise<EstateTransactionResponse> => {
    if (!userId) {
      return {
        data: [],
        total_items: 0,
        page: defaultPaginationParams.page,
        page_size: defaultPaginationParams.limit,
        total_pages: 0,
      };
    }

    try {
      isLoading.value = true;
      error.value = null;

      const requestBody: EstateTransactionsFilters = {
        estate_id: estateId,
        ...defaultPaginationParams,
        ...filters,
      };

      const response = await $api.post<EstateTransactionResponse>(
        `/users/${userId}/estates/${estateId}/transactions/filter`,
        requestBody,
      );

      userEstateTransactions.value = response.data;
      pagination.value = {
        page: response.page,
        page_size: response.page_size,
        total_items: response.total_items,
        total_pages: response.total_pages,
      };

      return response;
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

  const deleteEstateTransactions = async (
    transactionId: number,
    userId: number,
    estateId: number,
  ): Promise<void> => {
    try {
      isLoading.value = true;
      error.value = null;
      await $api.delete(`/transactions/${transactionId}`);
      await getUserEstateTransactions(userId, estateId);
    } catch (err) {
      error.value = String(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const getFinancialStats = async (
    userId: number,
    estateId: number,
    startDate: string,
    endDate: string,
  ): Promise<ChartData> => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await $api.post<ChartData>(
        `/users/${userId}/estates/${estateId}/values/filter`,
        {
          date_start: startDate,
          date_end: endDate,
        },
      );

      financialStats.value = response;
      return response;
    } catch (err) {
      error.value = 'Failed to fetch financial stats chart';
      console.error('Failed to fetch financial stats chart:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    pagination,
    userTransactions,
    userEstateTransactions,
    financialStats,
    isLoading,
    error,
    getUserEstateTransactions,
    getUserTransactions,
    addEstateTransactions,
    getFinancialStats,
    deleteEstateTransactions,
  };
});
