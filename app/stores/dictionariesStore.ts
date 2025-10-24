import { defineStore } from 'pinia';
import { useApi } from '~/composables/useApi';
import type { EstateType, Currency, TransactionType } from '~/types/dictionaries';

export const useDictionariesStore = defineStore('dictionaries', () => {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const currencies = ref<Currency[]>([]);
  const estateTypes = ref<EstateType[]>([]);
  const transactionTypes = ref<TransactionType[]>([]);
  const isLoaded = ref(false);

  const $api = useApi();

  const getEstateTypes = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      estateTypes.value = await $api.get<EstateType[]>('/estate-types');
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const getTransactionTypes = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      transactionTypes.value = await $api.get<TransactionType[]>('/transaction-types');
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const loadAllDictionaries = async (): Promise<void> => {
    try {
      isLoading.value = true;
      error.value = null;
      await Promise.all([
        getEstateTypes(),
        getTransactionTypes(),
        // getCurrencies(),
      ]);
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const initializeDictionaries = async (): Promise<void> => {
    if (isLoaded.value) {
      return;
    }

    try {
      isLoading.value = true;
      error.value = null;
      await loadAllDictionaries();
      isLoaded.value = true;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const estateTypeOptions = computed(() =>
    estateTypes.value.map(type => ({
      label: type.name,
      value: type.id,
      icon: type.icon,
    })),
  );

  const currencyOptions = computed(() =>
    currencies.value.map(currency => ({
      label: `${currency.name} (${currency.code})`,
      value: currency.id,
      symbol: currency.symbol,
    })),
  );

  const getEstateTypeById = (id: number) => {
    return estateTypes.value.find(type => type.id === id);
  };

  return {
    isLoading,
    isLoaded,
    initializeDictionaries,
    estateTypes,
    transactionTypes,
    currencies,
    getEstateTypes,
    loadAllDictionaries,
    estateTypeOptions,
    getEstateTypeById,
    getTransactionTypes,
  };
});
