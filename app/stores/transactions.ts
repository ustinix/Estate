import { defineStore } from 'pinia';
import type {
  EstateTransaction,
  EstateTransactionForTable,
  EstateTransactionResponse,
  EstateTransactionsFilters,
  ChartData,
} from '~/types/transactions';

export const useTransactionsStore = defineStore('transactions', () => {
  const userTransactions = ref<EstateTransaction[]>([]);
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

  const clearTransactions = () => {
    userEstateTransactions.value = [];
  };

  // const getFinancialStats = async (
  //   userId: number,
  //   estateId: number,
  //   startDate: string,
  //   endDate: string,
  // ): Promise<ChartData> => {
  //   try {
  //     isLoading.value = true;
  //     error.value = null;

  //     const response = await $api.get<ChartData>(
  //       `/users/${userId}/estates/${estateId}/financial-stats/chart`,
  //       {
  //         params: {
  //           start_date: startDate,
  //           end_date: endDate,
  //         },
  //       },
  //     );

  //     financialStats.value = response;
  //     return response;
  //   } catch (err) {
  //     error.value = 'Failed to fetch financial stats chart';
  //     console.error('Failed to fetch financial stats chart:', err);
  //     throw err;
  //   } finally {
  //     isLoading.value = false;
  //   }
  // };

  // временно моковые данные
  const getFinancialStats = async (startDate: string, endDate: string): Promise<ChartData> => {
    try {
      isLoading.value = true;
      error.value = null;

      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockData: ChartData = {
        categories: [
          'Янв 2025',
          'Фев 2025',
          'Мар 2025',
          'Апр 2025',
          'Май 2025',
          'Июн 2025',
          'Июл 2025',
          'Авг 2025',
        ],
        series: [
          { name: 'Доход', data: [70000, 75000, 80000, 120000, 150000, 130000, 140000, 90000] },
          { name: 'Расход', data: [35000, 40000, 40000, 60000, 75000, 65000, 70000, 45000] },
          {
            name: 'Месячный баланс',
            data: [35000, 35000, 40000, 60000, 75000, 65000, 70000, 45000],
          },
          {
            name: 'Накопительный баланс',
            data: [35000, 70000, 110000, 170000, 245000, 310000, 380000, 425000],
          },
        ],
      };

      const monthToDateMap: Record<string, string> = {
        'Янв 2025': '2025-01-01',
        'Фев 2025': '2025-02-01',
        'Мар 2025': '2025-03-01',
        'Апр 2025': '2025-04-01',
        'Май 2025': '2025-05-01',
        'Июн 2025': '2025-06-01',
        'Июл 2025': '2025-07-01',
        'Авг 2025': '2025-08-01',
      };

      const start = new Date(startDate);
      const end = new Date(endDate);

      const filteredIndices = mockData.categories
        .map((category, index) => ({
          category,
          index,
          date: monthToDateMap[category] ? new Date(monthToDateMap[category]) : null,
        }))
        .filter(({ date }) => date && date >= start && date <= end);

      const filteredData: ChartData = {
        categories: filteredIndices.map(item => item.category),
        series: mockData.series.map(series => ({
          ...series,
          data: filteredIndices.map(item => series.data[item.index] || 0),
        })),
      };

      financialStats.value = filteredData;
      return filteredData;
    } catch (err) {
      error.value = 'Failed to fetch financial stats';
      console.error('Failed to fetch financial stats:', err);

      return {
        categories: [],
        series: [
          { name: 'Доход', data: [] },
          { name: 'Расход', data: [] },
          { name: 'Месячный баланс', data: [] },
          { name: 'Накопительный баланс', data: [] },
        ],
      };
    } finally {
      isLoading.value = false;
    }
  };

  const clearFinancialStats = () => {
    financialStats.value = null;
  };

  return {
    pagination,
    userTransactions,
    userEstateTransactions,
    financialStats,
    isLoading,
    error,
    getUserEstateTransactions,
    clearTransactions,
    getUserTransactions,
    addEstateTransactions,
    getFinancialStats,
    clearFinancialStats,
  };
});
