<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useDictionariesStore } from '~/stores/dictionariesStore';
import EstateDetailCard from '~/components/EstateDetailCard.vue';

const $q = useQuasar();
const route = useRoute();
const authStore = useAuthStore();
const estateStore = useEstateStore();
const dictionariesStore = useDictionariesStore();

const estateId = Number(route.params.id);
const userId = authStore.user?.id;

const isEditing = ref(false);
const editForm = ref({
  name: '' as string | undefined,
  estate_type_id: undefined as number | undefined,
});

if (userId && estateId) {
  await estateStore.getUserEstate(userId, estateId);
}

const { estate, isLoading: pending, error } = storeToRefs(estateStore);
const estateTypeOptions = computed(() => dictionariesStore.estateTypeOptions);

watch(estate, newEstate => {
  if (newEstate) {
    editForm.value = {
      name: newEstate.name,
      estate_type_id: newEstate.estate_type_id,
    };
  }
});

const startEditing = () => {
  isEditing.value = true;
};

const cancelEditing = () => {
  isEditing.value = false;
  if (estate.value) {
    editForm.value = {
      name: estate.value.name,
      estate_type_id: estate.value.estate_type_id,
    };
  }
};

const saveEditing = async () => {
  if (!estate.value || !userId) return;

  try {
    await estateStore.updateUserEstate(userId, estate.value.id, editForm.value);
    isEditing.value = false;

    $q.notify({
      color: 'green-4',
      textColor: 'white',
      icon: 'cloud_done',
      message: 'Данные обновлены!',
    });
  } catch (error) {
    console.error('Ошибка обновления:', error);
    $q.notify({
      color: 'red-5',
      textColor: 'white',
      icon: 'error',
      message: 'Ошибка при обновлении',
    });
  }
};

const hasRecoupment = computed(() => !!(estate.value?.recoupment && estate.value.recoupment > 0));

const hasDescription = computed(
  () => !!(estate.value?.description && estate.value.description.trim() !== ''),
);

const currentEstateType = computed(() => {
  if (!estate.value) return null;
  return dictionariesStore.getEstateTypeById(estate.value.estate_type_id);
});

const goBack = () => {
  navigateTo('/portfolio');
};
</script>
<template>
  <div class="estate-page">
    <div class="back-button-container">
      <button @click="goBack" class="btn-back">← Назад к портфелю</button>
    </div>

    <div v-if="pending" class="loading">Загрузка данных недвижимости...</div>

    <div v-else-if="error" class="error">
      <p>Ошибка: {{ error }}</p>
      <button @click="goBack" class="btn-back">← Назад к портфелю</button>
    </div>

    <div v-else-if="estate" class="estate-content">
      <!-- Режим редактирования -->
      <div v-if="isEditing" class="edit-mode">
        <q-form @submit="saveEditing" class="q-gutter-md">
          <q-input
            filled
            v-model="editForm.name"
            label="Название недвижимости"
            :rules="[val => !!val || 'Введите название']"
          />

          <q-select
            filled
            v-model="editForm.estate_type_id"
            :options="estateTypeOptions"
            option-label="label"
            option-value="value"
            label="Тип недвижимости"
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

          <div class="edit-actions">
            <q-btn flat label="Отмена" @click="cancelEditing" />
            <q-btn label="Сохранить" type="submit" color="primary" />
          </div>
        </q-form>
      </div>

      <!-- Режим просмотра -->
      <div v-else>
        <EstateDetailCard
          :estate="estate"
          :current-estate-type="currentEstateType"
          :has-recoupment="hasRecoupment"
          :has-description="hasDescription"
          :on-edit="startEditing"
        />
      </div>
    </div>
  </div>
</template>
<style scoped>
.estate-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.back-button-container {
  margin-bottom: 20px;
}

.btn-back {
  background: none;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn-back:hover {
  background: #f5f5f5;
}

.loading,
.error {
  text-align: center;
  padding: 40px;
}

.error {
  color: #d32f2f;
}

.edit-mode {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
}

.edit-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .estate-page {
    padding: 16px;
  }

  .edit-mode {
    padding: 16px;
  }
}
</style>
