<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useDictionariesStore } from '~/stores/dictionariesStore';
import EstateDetailCard from '~/components/EstateDetailCard.vue';
import TransactionForm from '~/components/TransactionForm.vue';
import EstateTransactionsTable from '~/components/EstateTransactionsTable.vue';

const $q = useQuasar();
const authStore = useAuthStore();
const estateStore = useEstateStore();
const transactionsStore = useTransactionsStore();
const dictionariesStore = useDictionariesStore();

const estateId = ref<number | null>(null);
const userId = computed(() => authStore.user?.id);
const isHydrated = ref(false);

const isEditing = ref(false);
const editForm = ref({
  name: '',
  estate_type_id: undefined as number | undefined,
  description: '',
});

const { estate, isLoading: estateLoading } = storeToRefs(estateStore);
const { isLoading: transactionsLoading } = storeToRefs(transactionsStore);
const estateTypeOptions = computed(() => dictionariesStore.estateTypeOptions);

const isLoading = computed(() => estateLoading.value || transactionsLoading.value);

onMounted(() => {
  isHydrated.value = true;
  estateId.value = estateStore.getCurrentEstateId();
  if (authStore.user?.id && estateId.value) {
    estateStore.getUserEstate(authStore.user.id, estateId.value);
    transactionsStore.getUserEstateTransactions(authStore.user.id, estateId.value);
  }
});

watchEffect(() => {
  if (estate.value) {
    editForm.value = {
      name: estate.value.name || '',
      estate_type_id: estate.value.estate_type_id,
      description: estate.value.description || '',
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
      name: estate.value.name || '',
      estate_type_id: estate.value.estate_type_id,
      description: estate.value.description || '',
    };
  }
};

const saveEditing = async () => {
  if (!estate.value || !userId) return;

  try {
    if (userId.value) {
      await estateStore.updateUserEstate(userId.value, estate.value.id, editForm.value);
    }

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

    <div v-if="!isHydrated" class="loading-container">
      <q-spinner-oval color="secondary" size="50px" />
      <div class="q-mt-md text-grey">Загрузка недвижимости...</div>
    </div>

    <template v-else>
      <div v-if="isLoading" class="loading-container">
        <q-spinner-oval color="secondary" size="50px" />
        <div class="q-mt-md text-grey">Загрузка данных...</div>
      </div>

      <div v-else-if="!estateId" class="error-container">
        <q-icon name="error_outline" size="50px" color="negative" />
        <div class="q-mt-md text-negative">Не выбрана недвижимость</div>
        <q-btn color="primary" label="Вернуться в портфель" @click="goBack" class="q-mt-md" />
      </div>

      <div v-else-if="estate" class="estate-content">
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
              class="edit-select"
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
              filled
              v-model="editForm.description"
              label="Описание недвижимости"
              type="textarea"
              autogrow
              :rules="[val => !val || val.length <= 50 || 'Максимум 50 символов']"
            >
              <template v-slot:counter> {{ editForm.description?.length || 0 }}/500 </template>
            </q-input>

            <div class="edit-actions">
              <q-btn flat label="Отмена" @click="cancelEditing" class="button" />
              <q-btn label="Сохранить" type="submit" color="secondary" class="button" />
            </div>
          </q-form>
        </div>

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
      <!-- <div class="charts">
      <MainChart />
    </div> -->
      <EstateTransactionsTable
        v-if="authStore.user?.id && estateId && estate"
        :user-id="authStore.user.id"
        :estate-id="estateId"
      />
      <TransactionForm
        v-if="authStore.user?.id && estateId && estate"
        :estate-id="estateId"
        :user-id="userId"
      />
    </template>
  </div>
</template>

<style scoped>
.transaction-item {
  display: flex;
  gap: 10px;
}
.estate-page {
  margin: 0 auto;
  max-width: 600px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
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

.edit-select {
  margin-bottom: 40px;
}

.edit-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.income {
  border-left: 3px solid #10b981;
}

.expense {
  border-left: 3px solid #ef4444;
}

.amount-income {
  color: #10b981;
  font-weight: bold;
}

.amount-expense {
  color: #ef4444;
  font-weight: bold;
}

.direction-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.direction-badge.income {
  background-color: #dcfce7;
  color: #166534;
}

.direction-badge.expense {
  background-color: #fecaca;
  color: #991b1b;
}

.regularity-badge {
  padding: 4px 8px;
  border-radius: 12px;
  background-color: #e0e7ff;
  color: #3730a3;
  font-size: 12px;
  font-weight: bold;
}

.comment {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.transactions-table {
  width: 100%;
  border-collapse: collapse;
}

.transactions-table th,
.transactions-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 10px 0;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

@media (max-width: 768px) {
  .estate-page {
    padding: 5px;
  }

  .edit-mode {
    padding: 16px;
  }
}
</style>
