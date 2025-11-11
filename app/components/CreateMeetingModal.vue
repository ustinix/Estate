<script setup lang="ts">
import type { CreateMeetingData } from '~/types/calendar-item';

interface Props {
  modelValue: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'create', meetingData: CreateMeetingData): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const form = ref({
  title: '',
  date: '',
  time: '',
  description: '',
  priority: 'medium' as 'low' | 'medium' | 'high',
  isAllDay: false,
});

const showModal = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
});

const handleSubmit = () => {
  if (!form.value.title || !form.value.date) {
    return;
  }

  const dateTime = form.value.isAllDay
    ? new Date(form.value.date)
    : new Date(`${form.value.date}T${form.value.time}`);

  const meetingData: CreateMeetingData = {
    title: form.value.title,
    date: dateTime,
    description: form.value.description,
    priority: form.value.priority,
    isAllDay: form.value.isAllDay,
  };

  emit('create', meetingData);
  resetForm();
  closeModal();
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
};

const resetForm = () => {
  form.value = {
    title: '',
    date: '',
    time: '',
    description: '',
    priority: 'medium',
    isAllDay: false,
  };
};

const setDefaultDateTime = () => {
  const now = new Date();
  form.value.date = now.toISOString().split('T')[0]!;
  form.value.time = now.toTimeString().slice(0, 5);
};

watch(showModal, newVal => {
  if (newVal) {
    setDefaultDateTime();
  } else {
    resetForm();
  }
});
</script>

<template>
  <q-dialog v-model="showModal" persistent>
    <q-card style="width: 500px; max-width: 90vw">
      <q-card-section class="row items-center">
        <h6 class="q-ma-none">Добавить событие</h6>
        <q-space />
        <q-btn icon="close" flat round dense @click="closeModal" />
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <q-input
            v-model="form.title"
            label="Название события *"
            placeholder="Встреча, напоминание..."
            :rules="[val => !!val || 'Введите название']"
          />

          <div class="row q-gutter-md">
            <q-input
              v-model="form.date"
              label="Дата *"
              type="date"
              class="col"
              :rules="[val => !!val || 'Выберите дату']"
            />

            <q-input v-model="form.time" label="Время" type="time" class="col" />
          </div>

          <q-select
            v-model="form.priority"
            :options="[
              { label: 'Низкий', value: 'low' },
              { label: 'Средний', value: 'medium' },
              { label: 'Высокий', value: 'high' },
            ]"
            option-label="label"
            option-value="value"
            label="Приоритет"
            emit-value
            map-options
          />

          <q-input
            v-model="form.description"
            label="Описание"
            placeholder="Дополнительная информация..."
            type="textarea"
            rows="3"
          />
        </q-form>
      </q-card-section>

      <q-card-actions class="actions" align="right">
        <q-btn flat label="Отмена" @click="closeModal" />
        <q-btn label="Создать" class="button" color="secondary" @click="handleSubmit" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.actions {
  padding: 0 20px 20px 0;
}
</style>
