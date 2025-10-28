<script setup lang="ts">
import {
  transactionTypes,
  repaymentPlans,
  transactionFrequencies,
  transactionOptions,
  regularityOptions,
} from '~/constants/transactions ';
import type {
  OneTimeFormData,
  RegularIncomeFormData,
  RegularExpenseFormData,
} from '~/types/transactions';
import { useEstateStore } from '~/stores/estateStore';

const estateStore = useEstateStore();
const $q = useQuasar();

const operationType = ref<0 | 1>(1);
const regularity = ref<0 | 1>(0);
const selectedCategory = ref<number | null>(null);
const showAdvancedSettings = ref(false);
const currentEstateId = computed(() => estateStore.estate?.id);

const oneTimeForm = ref<OneTimeFormData>({
  estate_id: undefined,
  transaction_type_id: null,
  amount: null,
  description: '',
  date: '',
  regularity: 0,
});

const regularIncomeForm = ref<RegularIncomeFormData>({
  estate_id: undefined,
  transaction_type_id: null,
  amount: null,
  description: '',
  start_date: '',
  payment_day: null,
  regularity: 1,
  direction: 1,
  contract_duration: 'short',
});

const regularExpenseForm = ref<RegularExpenseFormData>({
  estate_id: undefined,
  transaction_type_id: null,
  amount: null,
  description: '',
  start_date: '',
  payment_day: null,
  regularity: 1,
  direction: 0,
});

watch(
  currentEstateId,
  newEstateId => {
    if (newEstateId) {
      oneTimeForm.value.estate_id = newEstateId;
      regularIncomeForm.value.estate_id = newEstateId;
      regularExpenseForm.value.estate_id = newEstateId;
    }
  },
  { immediate: true },
);

const filteredCategories = computed(() => {
  return transactionTypes.value.filter(
    type => type.direction === operationType.value && type.regularity === regularity.value,
  );
});

const isCreditCategory = computed(() => {
  if (!selectedCategory.value) return false;

  const category = transactionTypes.value.find(type => type.id === selectedCategory.value);
  if (!category) return false;

  // Ищу по названию категории пока бек не добавит отметку
  const creditKeywords = ['ипотека', 'кредит', 'рассрочка', 'заем', 'займ'];
  return creditKeywords.some(keyword =>
    category.name.toLowerCase().includes(keyword.toLowerCase()),
  );
});

const showRegularIncomeForm = computed(() => operationType.value === 1 && regularity.value === 1);
const showRegularExpenseForm = computed(() => operationType.value === 0 && regularity.value === 1);
const showOneTimeForm = computed(() => regularity.value === 0);
const currentRegularForm = computed(() => {
  return operationType.value === 1 ? regularIncomeForm.value : regularExpenseForm.value;
});

const isFormValid = computed(() => {
  if (!selectedCategory.value || !currentEstateId.value) return false;

  if (regularity.value === 0) {
    return !!oneTimeForm.value.amount && !!oneTimeForm.value.date;
  } else {
    const form = currentRegularForm.value;
    return !!form.amount && !!form.start_date && !!form.payment_day;
  }
});

const onSubmit = async () => {
  if (!currentEstateId.value) {
    $q.notify({
      color: 'red-5',
      textColor: 'white',
      icon: 'error',
      message: 'Не выбрана недвижимость',
    });
    return;
  }

  try {
    let transactionData;

    if (regularity.value === 0) {
      transactionData = {
        ...oneTimeForm.value,
        estate_id: currentEstateId.value,
        transaction_type_id: selectedCategory.value!,
        date: oneTimeForm.value.date || new Date().toISOString().split('T')[0],
      };
    } else {
      const baseData = {
        ...currentRegularForm.value,
        estate_id: currentEstateId.value,
        transaction_type_id: selectedCategory.value!,
      };

      if (operationType.value === 1) {
        transactionData = baseData as RegularIncomeFormData;
      } else {
        // Расход
        transactionData = baseData as RegularExpenseFormData;
      }
    }

    console.log('Submitting transaction:', transactionData);

    // Здесь будет вызов API
    // await transactionStore.createTransaction(transactionData);

    $q.notify({
      color: 'green-4',
      textColor: 'white',
      icon: 'cloud_done',
      message: 'Транзакция добавлена!',
    });

    resetForms();
  } catch (error) {
    console.error('Ошибка при добавлении транзакции:', error);
    $q.notify({
      color: 'red-5',
      textColor: 'white',
      icon: 'error',
      message: 'Ошибка при добавлении транзакции',
    });
  }
};

const resetForms = () => {
  oneTimeForm.value = {
    estate_id: currentEstateId.value,
    transaction_type_id: null,
    amount: null,
    description: '',
    date: '',
    regularity: 0,
  };

  regularIncomeForm.value = {
    estate_id: currentEstateId.value,
    transaction_type_id: null,
    amount: null,
    description: '',
    start_date: '',
    payment_day: null,
    regularity: 1,
    direction: 1,
    contract_duration: 'short',
  };

  regularExpenseForm.value = {
    estate_id: currentEstateId.value,
    transaction_type_id: null,
    amount: null,
    description: '',
    start_date: '',
    payment_day: null,
    regularity: 1,
    direction: 0,
  };

  selectedCategory.value = null;
  showAdvancedSettings.value = false;
};

// установка transaction_type_id при выборе категории
watch(selectedCategory, newCategoryId => {
  if (newCategoryId) {
    if (regularity.value === 0) {
      oneTimeForm.value.transaction_type_id = newCategoryId;
    } else if (operationType.value === 1) {
      regularIncomeForm.value.transaction_type_id = newCategoryId;
    } else {
      regularExpenseForm.value.transaction_type_id = newCategoryId;
    }
  }
});

watch([operationType, regularity], () => {
  selectedCategory.value = null;
  resetForms();
});
</script>
<template>
  <div>
    <div class="q-pa-md">
      <q-form @submit="onSubmit">
        <div class="form-container">
          <div class="form-header">
            <h5>Учет финансов</h5>

            <div class="radio-group">
              <div class="text-subtitle2">Тип операции:</div>
              <q-option-group
                v-model="operationType"
                :options="transactionOptions"
                color="primary"
                inline
              />
            </div>

            <div class="radio-group">
              <div class="text-subtitle2">Регулярность:</div>
              <q-option-group
                v-model="regularity"
                :options="regularityOptions"
                color="primary"
                inline
              />
            </div>

            <div v-if="filteredCategories.length > 0">
              <q-select
                filled
                v-model="selectedCategory"
                :options="filteredCategories"
                label="Категория"
                option-label="name"
                option-value="id"
                emit-value
                map-options
                :rules="[val => !!val || 'Выберите категорию']"
              />
            </div>
            <div v-else class="text-caption text-grey">
              Нет доступных категорий для выбранных параметров
            </div>
          </div>

          <div class="form-details">
            <div v-if="showOneTimeForm && selectedCategory">
              <h5>Разовая операция</h5>
              <q-input
                filled
                v-model="oneTimeForm.amount"
                label="Сумма"
                type="number"
                :rules="[val => !!val || 'Введите сумму']"
              />
              <q-input
                filled
                v-model="oneTimeForm.date"
                label="Дата"
                type="date"
                :rules="[val => !!val || 'Введите дату']"
              />
              <q-input filled v-model="oneTimeForm.description" label="Описание" type="textarea" />
            </div>

            <div v-if="showRegularIncomeForm && selectedCategory">
              <h5>Регулярный доход</h5>

              <div class="inputs-group">
                <q-input
                  filled
                  v-model="regularIncomeForm.amount"
                  label="Сумма дохода"
                  type="number"
                  :rules="[val => !!val || 'Введите сумму']"
                />

                <q-input
                  filled
                  v-model="regularIncomeForm.start_date"
                  label="Дата начала"
                  type="date"
                  :rules="[val => !!val || 'Введите дату начала']"
                />

                <q-input
                  filled
                  v-model="regularIncomeForm.payment_day"
                  label="День платежа (1-31)"
                  type="number"
                  min="1"
                  max="31"
                  :rules="[val => !!val || 'Введите день платежа']"
                />

                <q-input
                  filled
                  v-model="regularIncomeForm.description"
                  label="Описание"
                  type="textarea"
                />
              </div>

              <div>
                <q-btn
                  flat
                  :label="
                    showAdvancedSettings ? 'Скрыть доп. настройки' : 'Показать доп. настройки'
                  "
                  @click="showAdvancedSettings = !showAdvancedSettings"
                  color="secondary"
                  icon="settings"
                />
              </div>

              <div v-if="showAdvancedSettings" class="advanced-settings q-pl-md border-left">
                <h6>Дополнительные настройки</h6>
                <div class="inputs-group">
                  <q-select
                    filled
                    v-model="regularIncomeForm.frequency_id"
                    :options="transactionFrequencies"
                    label="Периодичность платежа"
                    option-label="name"
                    option-value="id"
                    emit-value
                    map-options
                  />
                  <q-input
                    filled
                    v-model="regularIncomeForm.indexation_rate"
                    label="Процент индексации"
                    type="number"
                  />
                  <q-select
                    filled
                    v-model="regularIncomeForm.indexation_frequency_id"
                    :options="transactionFrequencies"
                    label="Периодичность индексации"
                    option-label="name"
                    option-value="id"
                    emit-value
                    map-options
                  />
                </div>
              </div>
            </div>
            <div v-if="showRegularExpenseForm && selectedCategory" class="regular-expense">
              <h5>Регулярный расход</h5>

              <div class="regular-expense-container">
                <div class="inputs-group">
                  <q-input
                    filled
                    v-model="regularExpenseForm.amount"
                    label="Сумма платежа"
                    type="number"
                    :rules="[val => !!val || 'Введите сумму платежа']"
                  />

                  <q-input
                    filled
                    v-model="regularExpenseForm.start_date"
                    label="Дата начала"
                    type="date"
                    :rules="[val => !!val || 'Введите дату начала']"
                  />

                  <q-input
                    filled
                    v-model="regularExpenseForm.payment_day"
                    label="День платежа (1-31)"
                    type="number"
                    min="1"
                    max="31"
                    :rules="[val => !!val || 'Введите день платежа']"
                  />
                </div>

                <div v-if="isCreditCategory" class="loan-fields q-mb-md">
                  <h6>Параметры кредита</h6>
                  <div class="inputs-group">
                    <q-input
                      filled
                      v-model="regularExpenseForm.loan_amount"
                      label="Сумма кредита"
                      type="number"
                    />
                    <q-input
                      filled
                      v-model="regularExpenseForm.loan_term"
                      label="Срок кредита (месяцев)"
                      type="number"
                    />
                    <q-input
                      filled
                      v-model="regularExpenseForm.interest_rate"
                      label="Процентная ставка (%)"
                      type="number"
                    />
                    <q-select
                      filled
                      v-model="regularExpenseForm.repayment_plan_id"
                      :options="repaymentPlans"
                      label="План погашения"
                      option-label="name"
                      option-value="id"
                      emit-value
                      map-options
                    />
                    <q-input
                      filled
                      v-model="regularExpenseForm.description"
                      label="Описание"
                      type="textarea"
                    />
                  </div>
                </div>
              </div>

              <div>
                <q-btn
                  flat
                  :label="
                    showAdvancedSettings ? 'Скрыть доп. настройки' : 'Показать доп. настройки'
                  "
                  @click="showAdvancedSettings = !showAdvancedSettings"
                  color="primary"
                  icon="settings"
                />
              </div>

              <div v-if="showAdvancedSettings" class="advanced-settings q-pl-md border-left">
                <h6>Дополнительные настройки</h6>

                <q-select
                  filled
                  v-model="regularExpenseForm.frequency_id"
                  :options="transactionFrequencies"
                  label="Периодичность платежа"
                  option-label="name"
                  option-value="id"
                  emit-value
                  map-options
                />

                <div v-if="isCreditCategory" class="early-repayment q-mb-md">
                  <h6>Досрочное погашение</h6>
                  <q-input
                    filled
                    v-model="regularExpenseForm.early_repayment_date"
                    label="Дата досрочного погашения"
                    type="date"
                  />
                  <q-input
                    filled
                    v-model="regularExpenseForm.early_repayment_amount"
                    label="Сумма досрочного погашения"
                    type="number"
                  />
                </div>
              </div>
            </div>

            <div v-if="selectedCategory">
              <q-btn
                label="Добавить операцию"
                type="submit"
                color="secondary"
                class="button"
                :disable="!isFormValid"
              />
            </div>
          </div>
        </div>
      </q-form>
    </div>
  </div>
</template>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 12px;
  padding: 1.5rem;
}

.radio-group {
  min-width: 350px;
  display: flex;
  align-items: center;
  justify-content: start;
}

.inputs-group {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: flex-start;
}

.inputs-group .q-field {
  flex: 1;
  min-width: 200px;
  max-width: 300px;
}

.inputs-group .q-field:has(textarea) {
  min-width: 100%;
  max-width: 100%;
}

.border-left {
  border-left: 3px solid #1976d2;
  padding-left: 16px;
}

.advanced-settings {
  background: rgba(25, 118, 210, 0.05);
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.loan-fields {
  background: rgba(255, 0, 0, 0.05);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.early-repayment {
  background: rgba(255, 152, 0, 0.05);
  border-radius: 8px;
  padding: 12px;
}

.current-estate-info {
  padding: 8px;
  border-radius: 6px;
  background: rgba(25, 118, 210, 0.1);
}

@media (max-width: 850px) {
  .form-container {
    min-width: 350px;
    flex-direction: column;
    gap: 1rem;
    padding: 0.8rem;
  }

  .border-left {
    border-left: none;
    border-top: 3px solid #1976d2;
    padding-left: 0;
    padding-top: 16px;
  }
}
@media (max-width: 850px) {
  .form-container {
    min-width: 350px;
    flex-direction: column;
    gap: 1rem;
    padding: 0.8rem;
  }
}
</style>
