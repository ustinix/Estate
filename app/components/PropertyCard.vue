<script setup lang="ts">
import type { Estate } from '~/types/estate';

const expanded = ref(false);
const estateStore = useEstateStore();
const authStore = useAuthStore();
const { executeAsync } = useErrorHandler();

const props = defineProps<{
  estate: Estate;
}>();

const progressValue = computed(() => (props.estate.recoupment || 0) / 100);

const handleClick = () => {
  estateStore.setSelectedEstateId(props.estate.id);
  navigateTo(`/estate/${props.estate.id}`);
};
const handleDelete = async () => {
  await executeAsync(
    async () => {
      await estateStore.deleteUserEstate(authStore.user!.id, props.estate.id);
    },
    {
      showNotification: true,
      fallbackMessage: 'Не удалось удалить недвижимость',
    },
  );
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
        <q-btn
          class="delete-btn"
          icon="close"
          flat
          round
          dense
          color="grey"
          @click.stop="handleDelete"
        >
          <q-tooltip>Удалить недвижимость</q-tooltip>
        </q-btn>
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
  position: relative;
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
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;

  .card-title {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
  }
}

.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;

  &:hover {
    color: #f44336 !important;
    background-color: rgba(244, 67, 54, 0.1);
  }
}

.card-actions {
  margin-top: auto;
  flex-shrink: 0;
}

.text-no-wrap.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}
</style>
