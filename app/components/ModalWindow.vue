<script setup lang="ts">
import { useDictionariesStore } from '~/stores/dictionariesStore';

interface Props {
  modelValue: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'create', estateData: { estate_type_id: number; name: string }): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const dictionariesStore = useDictionariesStore();

const isLoading = ref(false);
const form = ref({
  estate_type_id: null as number | null,
  name: '',
});
const showModal = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
});

const estateTypeOptions = computed(() => dictionariesStore.estateTypeOptions);

const handleSubmit = async () => {
  if (!form.value.estate_type_id || !form.value.name) {
    return;
  }

  isLoading.value = true;
  try {
    await emit('create', { estate_type_id: form.value.estate_type_id, name: form.value.name });
    resetForm();
    closeModal();
  } catch (error) {
    console.error('Ошибка в модалке:', error);
  } finally {
    isLoading.value = false;
  }
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
};

const resetForm = () => {
  form.value = {
    estate_type_id: null,
    name: '',
  };
};

watch(showModal, newVal => {
  if (!newVal) {
    resetForm();
  }
});
</script>
<template>
  <q-dialog v-model="showModal" persistent>
    <q-card style="width: 400px; max-width: 90vw">
      <q-card-section class="row items-center">
        <h6 class="q-ma-none">Добавить недвижимость</h6>
        <q-space />
        <q-btn icon="close" flat round dense @click="closeModal" />
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <q-select
            v-model="form.estate_type_id"
            :options="estateTypeOptions"
            option-label="label"
            option-value="value"
            label="Тип недвижимости *"
            :rules="[val => !!val || 'Выберите тип']"
            emit-value
            map-options
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-icon :name="scope.opt.icon" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-input
            v-model="form.name"
            label="Название *"
            placeholder="Квартира, Гараж, Офис..."
            :rules="[val => !!val || 'Введите название']"
          />
        </q-form>
      </q-card-section>

      <q-card-actions class="actions" align="right">
        <q-btn flat label="Отмена" @click="closeModal" />
        <q-btn
          label="Создать"
          class="button"
          color="secondary"
          @click="handleSubmit"
          :loading="isLoading"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.actions {
  padding: 0 20px 20px 0;
}
</style>
