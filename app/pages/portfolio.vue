<script setup lang="ts">
import type { Estate } from '~/types/estate';
import PropertyCard from '~/components/PropertyCard.vue';
import { useEstate } from '~/composables/useEstate';
import { useAuth } from '~/composables/useAuth';

const { user } = useAuth();
const { estates, estateTypes, getUserEstates, getEstateTypes, isLoading } = useEstate();

const selectedType = ref('все');

onMounted(async () => {
  if (user.value) {
    await Promise.all([getEstateTypes(), getUserEstates(user.value.id)]);
  }
});

watch(user, newUser => {
  if (newUser) {
    Promise.all([getEstateTypes(), getUserEstates(newUser.id)]);
  }
});

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
    const estateType = estateTypes.value.find(type => type.id.toString() === estate.estate_type_id);

    return {
      ...estate,
      type_name: estateType?.name || 'неизвестно',
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
  return enrichedEstates.value.filter(estate => estate.type_name === selectedType.value);
});

const calculateRecoupment = (estateId: number): number => {
  return Math.floor(Math.random() * 100) + 1;
};
</script>
<template>
  <section class="profile-section layout">
    <div class="q-pa-md" style="width: 340px">
      <div class="q-gutter-md">
        <q-select
          standout="bg-teal text-white"
          v-model="selectedType"
          :options="typeOptions.map(t => t.name)"
          label="Тип недвижимости"
          :loading="isLoading && estateTypes.length === 0"
        />
      </div>
    </div>
    <ClientOnly>
      <div v-if="isLoading && estates.length === 0" class="text-center q-pa-lg">
        <q-spinner size="50px" color="primary" />
        <div class="q-mt-md">Загрузка недвижимости...</div>
      </div>

      <div v-else-if="enrichedEstates.length === 0" class="text-center q-pa-lg">
        <q-icon name="real_estate_agent" size="50px" color="grey" />
        <div class="q-mt-md text-grey">Недвижимость не найдена</div>
        <q-btn
          color="primary"
          label="Добавить первую недвижимость"
          class="q-mt-md"
          to="/add-property"
        />
      </div>

      <div v-else class="cards-container">
        <PropertyCard v-for="estate in filteredEstates" :key="estate.id" :estate="estate" />
      </div>
    </ClientOnly>
  </section>
</template>

<style scoped>
.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}
</style>
