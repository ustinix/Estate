import { defineStore } from 'pinia';
import type {
  EstateTransaction,
  EstateTransactionForTable,
  EstateTransactionResponse,
  EstateTransactionsFilters,
} from '~/types/transactions';

export const useTransactionsStore = defineStore('transactions', () => {
  const userTransactions = ref<EstateTransaction[]>([]);
  const userEstateTransactions = ref<EstateTransactionForTable[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref({
    page: 1,
    page_size: 15,
    total_items: 0,
    total_pages: 0,
  });

  const defaultPaginationParams: EstateTransactionsFilters = {
    limit: 10,
    offset: 0,
  };

  // временно пока бэк не починит страницы (пока количество отдается на 1 меньше)
  const fixedPagination = computed(() => ({
    ...pagination.value,
    total_pages: pagination.value.total_pages + 1,
  }));

  const $api = useApi();

  const getUserTransactions = async (userId: number): Promise<void> => {
    try {
      const transactions = await $api.get<EstateTransaction[]>(`/users/${userId}/transactions`);
      userTransactions.value = [...transactions];
    } catch (error) {
      console.error('Failed to fetch user data:', error);
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
        page: 1,
        page_size: 15,
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

  const changePage = async (
    userId: number,
    estateId: number,
    page: number,
    filters: EstateTransactionsFilters = {},
  ) => {
    const offset = (page - 1) * (filters.limit || pagination.value.page_size);

    return await getUserEstateTransactions(userId, estateId, {
      ...filters,
      offset,
      limit: filters.limit || pagination.value.page_size,
    });
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
    // pagination,
    pagination: fixedPagination,
    userTransactions,
    userEstateTransactions,
    isLoading,
    error,
    getUserEstateTransactions,
    clearTransactions,
    getUserTransactions,
    addEstateTransactions,
    changePage,
  };
});
