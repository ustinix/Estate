<script setup lang="ts">
import type { Estate } from '~/types/estate';

const expanded = ref(false);

const props = defineProps<{
  estate: Estate;
}>();

const progressValue = computed(() => (props.estate.recoupment || 0) / 100);
</script>

<template>
  <div class="q-pa-md row items-start q-gutter-md">
    <q-card class="my-card" flat bordered>
      <q-card-section class="card-header">
        <div class="card-title">
          <!-- Используем иконку из estate или через функцию -->
          <q-icon :name="estate.icon" size="lg" color="green-9" />
          <div class="text-overline text-indigo-10">
            {{ estate.type_name || 'Неизвестный тип' }}
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

      <q-card-section v-if="estate.description" class="text-body2 q-pt-none">
        {{ estate.description }}
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
            <div class="q-mb-sm"><strong>ID:</strong> {{ estate.id }}</div>
            <div class="q-mb-sm"><strong>Тип ID:</strong> {{ estate.estate_type_id }}</div>
            <div v-if="estate.user_id" class="q-mb-sm">
              <strong>ID пользователя:</strong> {{ estate.user_id }}
            </div>
            Дополнительная информация о {{ estate.name }}
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
