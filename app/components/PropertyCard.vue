<script setup lang="ts">
import type { Estate } from '~/types/estate';

const expanded = ref(false);
const estateStore = useEstateStore();
const props = defineProps<{
  estate: Estate;
}>();

const progressValue = computed(() => (props.estate.recoupment || 0) / 100);

const handleClick = () => {
  estateStore.setSelectedEstateId(props.estate.id);
  navigateTo(`/estate/${props.estate.id}`);
};
</script>

<template>
  <q-card class="my-card" flat bordered>
    <div @click="handleClick" class="clickable-area">
      <q-card-section class="card-header">
        <div class="card-title">
          <q-icon :name="estate.estate_type_icon" size="lg" color="green-9" />
          <div class="text-overline text-indigo-10">
            {{ estate.estate_type_name || 'Неизвестный тип' }}
          </div>
        </div>
        <div class="text-h6 q-mt-sm q-mb-xs text-no-wrap ellipsis">{{ estate.name }}</div>
      </q-card-section>

      <q-card-section>
        <div class="text-h6 q-mt-sm">Окупаемость:</div>
        <q-linear-progress size="25px" :value="progressValue" color="green-9">
          <div class="absolute-full flex flex-center">
            <q-badge color="white" text-color="green-9" :label="`${estate.recoupment || 0}%`" />
          </div>
        </q-linear-progress>
      </q-card-section>
    </div>

    <q-card-actions class="card-actions">
      <q-btn flat color="secondary" label="Подробнее" @click="handleClick" />

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
          {{ estate.description ? estate.description : 'Описание не добавлено' }}
        </q-card-section>
      </div>
    </q-slide-transition>
  </q-card>
</template>

<style lang="scss" scoped>
.my-card {
  width: 100%;
  min-height: 350px;
  flex-shrink: 0;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
}

.my-card:hover {
  border-color: var(--text-color);
  background-color: var(--bg-color);
}

.clickable-area {
  cursor: pointer;
  flex: 1;
  display: flex;
  flex-direction: column;
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
  flex-shrink: 0;
}
</style>
