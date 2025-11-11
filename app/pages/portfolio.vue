<script setup lang="ts">
import type { Estate } from '~/types/estate';
import PropertyCard from '~/components/PropertyCard.vue';
import { useEstateStore } from '~/stores/estateStore';
import { useAuthStore } from '~/stores/authStore';
import { storeToRefs } from 'pinia';
import ModalWindow from '~/components/ModalWindow.vue';
import { useDictionariesStore } from '~/stores/dictionariesStore';
import { useErrorHandler } from '~/composables/useErrorHandler';

const dictionariesStore = useDictionariesStore();
const authStore = useAuthStore();
const estateStore = useEstateStore();
const { executeAsync, clearError, isLoading: isActionLoading } = useErrorHandler();

const estateTypes = computed(() => dictionariesStore.estateTypes);
const { estates, isLoading: isEstatesLoading } = storeToRefs(estateStore);

const showAddModal = ref(false);
const selectedType = ref('все');

const isLoading = computed(() => isEstatesLoading.value || isActionLoading.value);

const loadEstates = async () => {
  const currentUserId = authStore.user?.id;
  if (!currentUserId) return;

  clearError();

  await executeAsync(
    async () => {
      await estateStore.getUserEstates(currentUserId);
    },
    {
      fallbackMessage: 'Не удалось загрузить недвижимость',
    },
  );
};

if (authStore.user) {
  loadEstates();
}

const typeOptions = computed(() => {
  const allOption = 'все';
  const apiTypes = estateTypes.value.map(type => type.name);
  return [allOption, ...apiTypes];
});

const enrichedEstates = computed<Estate[]>(() => {
  return estates.value.map((estate: Estate) => {
    const estateType = estateTypes.value.find(type => type.id === estate.estate_type_id);

    return {
      ...estate,
      estate_type_name: estateType?.name || 'неизвестно',
      icon: estateType?.icon || 'help',
      description: estate.description || 'Описание будет добавлено позже',
      recoupment: estate.recoupment,
    };
  });
});

const filteredEstates = computed(() => {
  if (selectedType.value === 'все') {
    return enrichedEstates.value;
  }
  return enrichedEstates.value.filter(estate => estate.estate_type_name === selectedType.value);
});

const createEstate = async (estateData: { estate_type_id: number; name: string }) => {
  const currentUserId = authStore.user?.id;
  if (!currentUserId) {
    showError('Пользователь не авторизован');
    return;
  }

  clearError();

  await executeAsync(
    async () => {
      await estateStore.createUserEstate(currentUserId, estateData);
      showAddModal.value = false;
    },
    {
      fallbackMessage: 'Не удалось создать недвижимость',
    },
  );
};

const handleModalClose = () => {
  showAddModal.value = false;
  clearError();
};
</script>

<template>
  <section class="profile-section layout">
    <ClientOnly>
      <div v-if="!authStore.isAuthenticated" class="layout default-block-container">
        <div class="text-center q-pa-lg default-block">
          <q-icon name="real_estate_agent" size="50px" color="grey" />
          <div class="q-mt-md text-grey">Недвижимость не найдена</div>
          <NuxtLink to="/register">
            <q-btn
              color="secondary"
              label="Зарегистрируйтесь чтобы добавить первую недвижимость"
              class="q-mt-md button"
            />
          </NuxtLink>
        </div>
      </div>
      <div v-if="isLoading && estates.length === 0" class="text-center q-pa-lg">
        <q-spinner size="50px" color="secondary" />
        <div class="q-mt-md">Загрузка недвижимости...</div>
      </div>
      <div v-else-if="authStore.isAuthenticated">
        <div class="filter-container">
          <q-select
            standout="bg-teal text-white"
            v-model="selectedType"
            :options="typeOptions"
            label="Тип недвижимости"
          />
        </div>

        <div class="cards-container">
          <div class="add-card" @click="showAddModal = true">
            <q-icon name="add" size="48px" color="grey-6" />
            <div class="add-text">Добавить недвижимость</div>
          </div>
          <PropertyCard v-for="estate in filteredEstates" :key="estate.id" :estate="estate" />
        </div>
      </div>
      <ModalWindow
        v-model="showAddModal"
        :estate-types="estateTypes"
        @create="createEstate"
        @update:model-value="handleModalClose"
      />
    </ClientOnly>
  </section>
</template>

<style scoped>
.default-block-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  width: 100%;
}

.default-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 400px;
  width: 100%;
}
.add-card {
  border: 2px dashed var(--border-color);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.add-card:hover {
  border-color: var(--text-color);
  background-color: var(--bg-color);
}

.add-text {
  margin-top: 12px;
  color: var(--label);
  font-weight: 500;
}
.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  grid-auto-rows: minmax(350px, auto);
  gap: 20px;
  margin-top: 20px;
  align-items: start;
}
.my-card,
.add-card {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  cursor: pointer;
}

.q-select {
  width: 310px;
}
</style>
