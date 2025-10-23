<script setup lang="ts">
import type { Estate } from '~/types/estate';
import PropertyCard from '~/components/PropertyCard.vue';
import { useEstateStore } from '~/stores/estateStore';
import { useAuthStore } from '~/stores/authStore';
import { storeToRefs } from 'pinia';
import ModalWindow from '~/components/ModalWindow.vue';
import { useDictionariesStore } from '~/stores/dictionariesStore';

const dictionariesStore = useDictionariesStore();
const estateTypes = computed(() => dictionariesStore.estateTypes);
const authStore = useAuthStore();
const estateStore = useEstateStore();
const { estates, isLoading } = storeToRefs(estateStore);

const showAddModal = ref(false);
const selectedType = ref('все');

onMounted(async () => {
  if (authStore.user) {
    await Promise.all([estateStore.getUserEstates(authStore.user.id)]);
  }
});

watch(
  () => authStore.user,
  newUser => {
    if (newUser) {
      estateStore.getUserEstates(newUser.id);
    }
  },
);

const typeOptions = computed(() => {
  const allOption = { name: 'все', icon: '' };
  const apiTypes = estateTypes.value.map(type => ({
    name: type.name,
    icon: type.icon,
  }));
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
      recoupment: estate.recoupment || calculateRecoupment(estate.id),
    };
  });
});

const filteredEstates = computed(() => {
  if (selectedType.value === 'все') {
    return enrichedEstates.value;
  }
  return enrichedEstates.value.filter(estate => estate.estate_type_name === selectedType.value);
});

const calculateRecoupment = (estateId: number): number => {
  return Math.floor(Math.random() * 100) + 1;
};

const createEstate = async (estateData: { estate_type_id: number; name: string }) => {
  if (!authStore.user?.id) {
    showError('Пользователь не авторизован');
    return;
  }

  try {
    await estateStore.createUserEstate(authStore.user.id, estateData);
  } catch (error) {
    console.error('Ошибка создания недвижимости:', error);
    throw error;
  }
};
</script>

<template>
  <section class="profile-section layout">
    <div class="filter-container">
      <q-select
        standout="bg-teal text-white"
        v-model="selectedType"
        :options="typeOptions.map(t => t.name)"
        label="Тип недвижимости"
        :loading="dictionariesStore.isLoading && estateTypes.length === 0"
      />
    </div>
    <ClientOnly>
      <div v-if="isLoading && estates.length === 0" class="text-center q-pa-lg">
        <q-spinner size="50px" color="secondary" />
        <div class="q-mt-md">Загрузка недвижимости...</div>
      </div>

      <div v-else-if="enrichedEstates.length === 0" class="text-center q-pa-lg">
        <q-icon name="real_estate_agent" size="50px" color="grey" />
        <div class="q-mt-md text-grey">Недвижимость не найдена</div>
        <q-btn
          @click="showAddModal = true"
          color="secondary"
          label="Добавить первую недвижимость"
          class="q-mt-md button"
        />
      </div>

      <div v-else class="cards-container">
        <div class="add-card" @click="showAddModal = true">
          <q-icon name="add" size="48px" color="grey-6" />
          <div class="add-text">Добавить недвижимость</div>
        </div>
        <PropertyCard v-for="estate in filteredEstates" :key="estate.id" :estate="estate" />
      </div>
      <ModalWindow v-model="showAddModal" :estate-types="estateTypes" @create="createEstate" />
    </ClientOnly>
  </section>
</template>

<style scoped>
.add-card {
  border: 2px dashed #ccc;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.add-card:hover {
  border-color: var(--text-color);
  background-color: #f5f5f5;
}

.add-text {
  margin-top: 12px;
  color: #666;
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
