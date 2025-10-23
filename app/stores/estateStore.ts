import { defineStore } from 'pinia';
import { useApi } from '~/composables/useApi';
import type { Estate, EstateResponse, EstateType } from '~/types/estate';

export const useEstateStore = defineStore('estate', () => {
  const estates = ref<Estate[]>([]);
  const estateTypes = ref<EstateType[]>([]);
  const estate = ref<Estate | null>(null);
  const newEstate = ref<Estate | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

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

  const getUserEstates = async (userId: number) => {
    try {
      isLoading.value = true;
      error.value = null;
      estates.value = await $api.get<Estate[]>(`/users/${userId}/estates`);
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const getUserEstate = async (userId: number, estateId: number) => {
    try {
      isLoading.value = true;
      error.value = null;
      estate.value = await $api.get<Estate>(`/users/${userId}/estates/${estateId}`);
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const createUserEstate = async (
    userId: number,
    estateData: { estate_type_id: number; name: string },
  ) => {
    try {
      isLoading.value = true;
      error.value = null;
      newEstate.value = null;

      const response: EstateResponse = await $api.post(`/users/${userId}/estates`, estateData);
      estates.value.push(response);
      newEstate.value = response;
      return response;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    estates,
    estateTypes,
    estate,
    isLoading,
    error,
    getEstateTypes,
    getUserEstates,
    getUserEstate,
    createUserEstate,
  };
});
