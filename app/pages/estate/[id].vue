<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useDictionariesStore } from '~/stores/dictionariesStore';
import EstateDetailCard from '~/components/EstateDetailCard.vue';
import TransactionForm from '~/components/TransactionForm.vue';

const $q = useQuasar();
const route = useRoute();
const authStore = useAuthStore();
const estateStore = useEstateStore();
const dictionariesStore = useDictionariesStore();

const isMounted = ref(false);
onMounted(async () => {
  isMounted.value = true;
  if (userId.value && estateId) {
    await estateStore.getUserEstate(userId.value, estateId);
    await authStore.getUserTransactions(userId.value);
  }
});

const estateId = Number(route.params.id);
const userId = computed(() => authStore.user?.id);

const isEditing = ref(false);
const editForm = ref({
  name: '',
  estate_type_id: undefined as number | undefined,
  description: '',
});

const { estate, isLoading: pending, error } = storeToRefs(estateStore);
const { userTransactions } = storeToRefs(authStore);
const estateTypeOptions = computed(() => dictionariesStore.estateTypeOptions);

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

    <div v-if="!isMounted" class="loading">Загрузка...</div>

    <div v-else-if="error" class="error">
      <div v-if="pending" class="loading">Загрузка данных недвижимости...</div>
      <p>Ошибка: {{ error }}</p>
      <button @click="goBack" class="btn-back">← Назад к портфелю</button>
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
    <!-- <div>
      <div v-if="userTransactions?.length === 0" class="no-transactions">Нет транзакций</div>

      <div class="transactions-list">
        <div
          v-for="transaction in userTransactions"
          :key="transaction.transaction_id"
          class="transaction-item"
        >
          <div>{{ new Date(transaction.date).toLocaleDateString() }}</div>
          <div>{{ transaction.transaction_type_name }}</div>
          <div>{{ transaction.comment }}</div>
          <div>{{ transaction.sum }}</div>
        </div>
      </div>
    </div> -->
    <TransactionForm />
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

@media (max-width: 768px) {
  .estate-page {
    padding: 16px;
  }

  .edit-mode {
    padding: 16px;
  }
}
</style>
