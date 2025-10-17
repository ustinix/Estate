import type { Estate, EstateRequest, EstateType } from '~/types/estate';

export const useEstate = () => {
  const estates = ref<Estate[]>([]);
  const estateTypes = ref<EstateType[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const getEstateTypes = async (): Promise<EstateType[]> => {
    isLoading.value = true;
    error.value = null;

    try {
      const types: EstateType[] = await $fetch('/api/estate-types');
      estateTypes.value = types;
      return types;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch estate types';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const getUserEstates = async (userId: string | number): Promise<Estate[]> => {
    isLoading.value = true;
    error.value = null;

    try {
      const userEstates: Estate[] = await $fetch(`/api/users/${userId}/estates`);
      estates.value = userEstates;
      return userEstates;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch user estates';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const createEstate = async (estateData: EstateRequest): Promise<Estate> => {
    isLoading.value = true;
    error.value = null;

    try {
      const newEstate: Estate = await $fetch('/api/estates', {
        method: 'POST',
        body: estateData,
      });

      estates.value.push(newEstate);
      return newEstate;
    } catch (err: any) {
      error.value = err.message || 'Failed to create estate';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteEstate = async (estateId: number): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      await $fetch(`/api/estates/${estateId}`, {
        method: 'DELETE',
      });
      estates.value = estates.value.filter(estate => estate.id !== estateId);
    } catch (err: any) {
      error.value = err.message || 'Failed to delete estate';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    estates: readonly(estates),
    estateTypes: readonly(estateTypes),
    isLoading: readonly(isLoading),
    error: readonly(error),
    getEstateTypes,
    getUserEstates,
    createEstate,
    deleteEstate,
    clearError,
  };
};
