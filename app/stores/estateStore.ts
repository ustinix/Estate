import { defineStore } from 'pinia';
import { useApi } from '~/composables/useApi';
import type { Estate, EstateResponse } from '~/types/estate';
import type { EstateTransaction } from '~/types/transactions';

export const useEstateStore = defineStore('estate', () => {
  const estates = ref<Estate[]>([]);
  const estate = ref<Estate | null>(null);
  const newEstate = ref<Estate | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const $api = useApi();

  const getUserEstates = async (userId: number): Promise<void> => {
    try {
      isLoading.value = true;
      error.value = null;
      estates.value = await $api.get<Estate[]>(`/users/${userId}/estates`);
    } catch (err) {
      error.value = String(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const getUserEstate = async (userId: number, estateId: number): Promise<void> => {
    try {
      isLoading.value = true;
      error.value = null;
      estate.value = await $api.get<Estate>(`/users/${userId}/estates/${estateId}`);
    } catch (err) {
      error.value = String(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const createUserEstate = async (
    userId: number,
    estateData: { estate_type_id: number; name: string },
  ): Promise<Estate> => {
    try {
      isLoading.value = true;
      error.value = null;
      newEstate.value = null;

      const response: EstateResponse = await $api.post(`/users/${userId}/estates`, estateData);
      estates.value.push(response);
      newEstate.value = response;
      return response;
    } catch (err) {
      error.value = String(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateUserEstate = async (
    userId: number,
    estateId: number,
    estateData: { estate_type_id?: number; name?: string; description?: string },
  ): Promise<Estate> => {
    try {
      isLoading.value = true;
      error.value = null;

      const response: Estate = await $api.put(`/users/${userId}/estates/${estateId}`, estateData);
      const index = estates.value.findIndex(e => e.id === estateId);
      if (index !== -1) {
        estates.value[index] = { ...estates.value[index], ...response };
      }
      if (estate.value && estate.value.id === estateId) {
        estate.value = { ...estate.value, ...response };
      }
      return response;
    } catch (err) {
      error.value = String(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const addEstateTransactions = async (transactionsData: EstateTransaction): Promise<void> => {
    try {
      isLoading.value = true;
      error.value = null;
      await $api.post(`/transactions`, transactionsData);
    } catch (err) {
      error.value = String(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    estates,
    estate,
    isLoading,
    error,
    getUserEstates,
    getUserEstate,
    createUserEstate,
    updateUserEstate,
    addEstateTransactions,
  };
});
