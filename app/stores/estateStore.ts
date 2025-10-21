import { defineStore } from 'pinia';
import { useApi } from '~/composables/useApi';
import type { Estate, EstateType } from '~/types/estate';

export const useEstateStore = defineStore('estate', () => {
  const estates = ref<Estate[]>([]);
  const estateTypes = ref<EstateType[]>([]);
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

  const getUserEstates = async (userId: string) => {
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

  return {
    estates,
    estateTypes,
    isLoading,
    error,
    getEstateTypes,
    getUserEstates,
  };
});
