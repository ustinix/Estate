<script setup lang="ts">
import { propertyTypes } from '~/constants/portfolio';
import type { Property } from '~/types/property';
import PropertyCard from '~/components/PropertyCard.vue';

const selectedType = ref('все');

const types = propertyTypes.map(i => i.name);

const mockProperties: Property[] = [
  {
    id: '1',
    type: 'квартира',
    name: '1к.кв на Лесной',
    description: 'Описание от пользователя',
    recoupment: 45,
  },
  {
    id: '2',
    type: 'гараж',
    name: 'Гараж на Удельной',
    description: 'Описание от пользователя',
    recoupment: 60,
  },
  {
    id: '3',
    type: 'аппартаменты',
    name: '1к.кв на советской',
    description: 'Описание от пользователя',
    recoupment: 90,
  },
  {
    id: '4',
    type: 'участок',
    name: '50 соток на Восточном',
    description: 'Описание от пользователя',
    recoupment: 50,
  },
];

const filteredProperties = computed(() => {
  if (selectedType.value === 'все') {
    return mockProperties;
  }
  return mockProperties.filter(property => property.type === selectedType.value);
});
</script>
<template>
  <section class="profile-section layout">
    <div class="q-pa-md" style="width: 340px">
      <div class="q-gutter-md">
        <q-select
          standout="bg-teal text-white"
          v-model="selectedType"
          :options="types"
          label="Тип недвижимости"
        />
      </div>
    </div>
    <div class="cards-container">
      <property-card
        v-for="property in filteredProperties"
        :key="property.id"
        :property="property"
      />
    </div>
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
