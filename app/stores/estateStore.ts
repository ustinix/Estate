import { defineStore } from 'pinia';
import { useApi } from '~/composables/useApi';
import type { Estate, EstateType } from '~/types/estate';

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

  const getUserEstate = async (userId: string, estateId: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      // Удалить заглушку когда бекенд будет готов
      // if (import.meta.dev) {
      //   await new Promise(resolve => setTimeout(resolve, 300));

      //   const testEstates: { [key: string]: Estate } = {
      //     '4': {
      //       id: 4,
      //       estate_type_id: '1',
      //       name: 'Элитная квартира в центре',
      //       user_id: Number(userId),
      //       description:
      //         'Просторная 3-комнатная квартира с видом на город. Современный ремонт, вся необходимая техника.',
      //       recoupment: 12.3,
      //       icon: 'apartment',
      //       type_name: 'Аппартаменты',
      //     },
      //     '5': {
      //       id: 5,
      //       estate_type_id: '2',
      //       name: 'Загородный дом',
      //       user_id: Number(userId),
      //       description:
      //         'Уютный двухэтажный дом с садом и бассейном. Идеально для семейного проживания.',
      //       recoupment: 8.7,
      //       icon: 'house',
      //       type_name: 'Дом',
      //     },
      //   };

      //   estate.value = testEstates[estateId] || {
      //     id: Number(estateId),
      //     estate_type_id: '1',
      //     name: `Недвижимость #${estateId}`,
      //     user_id: Number(userId),
      //     description: 'Описание недвижимости',
      //     recoupment: 10.0,
      //     icon: 'house',
      //     type_name: 'Неизвестный тип',
      //   };
      //   return;
      // }

      estate.value = await $api.get<Estate>(`/users/${userId}/estates/${estateId}`);
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const createUserEstate = async (
    userId: string,
    estateData: { estate_type_id: string; name: string },
  ) => {
    try {
      isLoading.value = true;
      error.value = null;
      newEstate.value = null;

      // Удалить заглушку когда бекенд будет готов
      if (import.meta.dev) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const selectedType = estateTypes.value.find(
          type => type.id.toString() === estateData.estate_type_id,
        );

        const createdEstate: Estate = {
          id: Date.now(),
          estate_type_id: estateData.estate_type_id,
          name: estateData.name,
          user_id: Number(userId),
          description: 'Описание недвижимости',
          recoupment: 10.0,
          icon: selectedType?.icon || 'house',
          type_name: selectedType?.name || 'Неизвестный тип',
        };
        estates.value.push(createdEstate);
        newEstate.value = createdEstate;
        return createdEstate;
      }

      // newEstate.value = await $api.post(`/users/${user.id}/estates`, estateData);
      //estates.value.push(response);
      // newEstate.value = response;
      // return response;
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
