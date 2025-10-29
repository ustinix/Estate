import { defineStore } from 'pinia';
import { useApi } from '~/composables/useApi';
import type {
  EstateType,
  TransactionType,
  TransactionFrequencies,
  RepaymentPlans,
} from '~/types/dictionaries';

export const useDictionariesStore = defineStore('dictionaries', () => {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const estateTypes = ref<EstateType[]>([]);
  const transactionTypes = ref<TransactionType[]>([]);
  const transactionFrequencies = ref<TransactionType[]>([]);
  const repaymentPlans = ref<TransactionType[]>([]);
  const isLoaded = ref(false);

  const $api = useApi();

  const getEstateTypes = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      estateTypes.value = await $api.get<EstateType[]>('/estate-types');
    } catch (err) {
      error.value = String(err);
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
    } catch (err) {
      error.value = String(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const getTransactionFrequencies = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      transactionFrequencies.value = await $api.get<TransactionFrequencies[]>(
        '/transaction-frequencies',
      );
    } catch (err) {
      error.value = String(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const getRepaymentPlans = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      repaymentPlans.value = await $api.get<RepaymentPlans[]>('/transaction-frequencies');
    } catch (err) {
      error.value = String(err);
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
        getTransactionFrequencies(),
        getRepaymentPlans(),
      ]);
    } catch (err) {
      error.value = String(err);
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
    } catch (err) {
      error.value = String(err);
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

  const getEstateTypeById = (id: number) => {
    return estateTypes.value.find(type => type.id === id);
  };

  return {
    isLoading,
    isLoaded,
    initializeDictionaries,
    estateTypes,
    transactionTypes,
    getEstateTypes,
    loadAllDictionaries,
    estateTypeOptions,
    getEstateTypeById,
    getTransactionTypes,
    getTransactionFrequencies,
    getRepaymentPlans,
  };
});
