import { defineStore } from 'pinia';
import { useApi } from '~/composables/useApi';
import type { Estate, EstateResponse } from '~/types/estate';

export const useEstateStore = defineStore('estate', () => {
  const estates = ref<Estate[]>([]);
  const estate = ref<Estate | null>(null);
  const newEstate = ref<Estate | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const selectedEstateId = ref<number | null>(null);

  if (import.meta.client) {
    const savedId = localStorage.getItem('selectedEstateId');
    if (savedId) {
      selectedEstateId.value = Number(savedId);
    }
  }

  const $api = useApi();

  const getCurrentEstateId = (): number | null => {
    if (import.meta.client) {
      const savedId = localStorage.getItem('selectedEstateId');
      if (savedId) {
        const id = Number(savedId);

        if (selectedEstateId.value !== id) {
          selectedEstateId.value = id;
        }
        return id;
      }
    }
    return selectedEstateId.value;
  };

  const initializeFromStorage = () => {
    if (import.meta.client) {
      const savedId = localStorage.getItem('selectedEstateId');
      if (savedId) {
        selectedEstateId.value = Number(savedId);
      }
    }
  };

  initializeFromStorage();

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

  const deleteUserEstate = async (userId: number, estateId: number): Promise<void> => {
    try {
      isLoading.value = true;
      error.value = null;

      await $api.delete(`/users/${userId}/estates/${estateId}`);
      await getUserEstates(userId);
    } catch (err) {
      error.value = String(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const setSelectedEstateId = (id: number) => {
    selectedEstateId.value = id;
    if (import.meta.client) {
      localStorage.setItem('selectedEstateId', id.toString());
    }
  };

  return {
    estates,
    estate,
    isLoading,
    error,
    selectedEstateId,
    getUserEstates,
    getUserEstate,
    createUserEstate,
    updateUserEstate,
    setSelectedEstateId,
    getCurrentEstateId,
    deleteUserEstate,
  };
});
