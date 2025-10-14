<script setup lang="ts">
import type { Property } from '~/types/property';
import { getIconByType } from '~/utils/getIconByType';

const expanded = ref(false);

const props = defineProps<{
  property: Property;
}>();

const propertyIcon = computed(() => getIconByType(props.property.type));
const progressValue = computed(() => props.property.recoupment / 100);
</script>

<template>
  <div class="q-pa-md row items-start q-gutter-md">
    <q-card class="my-card" flat bordered>
      <q-card-section class="card-header">
        <div class="card-title">
          <q-icon :name="propertyIcon" size="lg" color="green-9" />
          <div class="text-overline text-indigo-10">{{ property.type }}</div>
        </div>
        <div class="text-h6 q-mt-sm q-mb-xs text-no-wrap ellipsis">{{ property.name }}</div>
      </q-card-section>

      <q-card-section>
        <div class="text-h6 q-mt-sm">Окупаемость:</div>
        <q-linear-progress size="25px" :value="progressValue" color="green-9">
          <div class="absolute-full flex flex-center">
            <q-badge color="white" text-color="green-9" :label="`${property.recoupment}%`" />
          </div>
        </q-linear-progress>
      </q-card-section>

      <q-card-actions class="card-actions">
        <q-btn flat color="secondary" label="Подробнее" />

        <q-space />

        <q-btn
          color="grey"
          round
          flat
          dense
          :icon="expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
          @click="expanded = !expanded"
        />
      </q-card-actions>

      <q-slide-transition>
        <div v-show="expanded">
          <q-separator />
          <q-card-section class="text-subtitle2">
            Дополнительная информация о {{ property.name }}
          </q-card-section>
        </div>
      </q-slide-transition>
    </q-card>
  </div>
</template>

<style lang="scss" scoped>
.my-card {
  width: 310px;
  min-height: 300px;
  flex-shrink: 0;
}
.card-header {
  .card-title {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}
.card-actions {
  margin-top: auto;
}
</style>
