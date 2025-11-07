<script setup lang="ts">
import { transactionOptions, regularityOptions } from '~/constants/transactions ';
import type { EstateTransaction } from '~/types/transactions';
import { useDictionariesStore } from '~/stores/dictionariesStore';

const props = defineProps<{
  userId: number | undefined;
  estateId: number;
}>();

const transactionStore = useTransactionsStore();
const dictionaryStore = useDictionariesStore();
const { transactionTypes, transactionFrequencies } = storeToRefs(dictionaryStore);
const $q = useQuasar();

const isMounted = ref(false);
onMounted(() => {
  isMounted.value = true;
});

const operationType = ref(true);
const regularity = ref(false);
const selectedCategory = ref<number | null>(null);

const categoryOptions = computed(() => {
  if (!isMounted.value || !transactionTypes.value.length) return [];

  return transactionTypes.value.filter(
    type =>
      Boolean(type.direction) === operationType.value &&
      Boolean(type.regularity) === regularity.value,
  );
});

const showCategories = computed(() => isMounted.value && categoryOptions.value.length > 0);

const isCreditCategory = computed(() => {
  if (!selectedCategory.value) return false;
  const category = transactionTypes.value.find(type => type.id === selectedCategory.value);
  if (!category) return false;

  const creditKeywords = ['ипотека', 'кредит', 'заем', 'займ', 'рассрочка'];
  return creditKeywords.some(keyword =>
    category.name.toLowerCase().includes(keyword.toLowerCase()),
  );
});

const isRentCategory = computed(() => {
  if (!selectedCategory.value) return false;
  const category = transactionTypes.value.find(type => type.id === selectedCategory.value);
  const rentKeywords = ['аренда', 'арендная', 'арендный'];
  return rentKeywords.some(keyword => category?.name.toLowerCase().includes(keyword.toLowerCase()));
});

const isInstallmentCategory = computed(() => {
  if (!selectedCategory.value) return false;
  const category = transactionTypes.value.find(type => type.id === selectedCategory.value);
  return category?.name.toLowerCase().includes('рассрочка');
});

const isCreditOrInstallment = computed(() => isCreditCategory.value || isInstallmentCategory.value);

const oneTimeForm = ref({
  amount: null as number | null,
  description: '',
  date: '',
});

const regularIncomeForm = ref({
  amount: null as number | null,
  description: '',
  start_date: '',
  payment_day: null as number | null,
  frequency_id: undefined as number | undefined,
  loan_term: null as number | null,
});

const regularExpenseForm = ref({
  amount: null as number | null,
  description: '',
  start_date: '',
  payment_day: null as number | null,
  frequency_id: undefined as number | undefined,
  loan_term: null as number | null,
  interest_rate: null as number | null,
});

const showRegularIncomeForm = computed(() => operationType.value && regularity.value);
const showRegularExpenseForm = computed(() => !operationType.value && regularity.value);
const showOneTimeForm = computed(() => !regularity.value);

const isFormValid = computed(() => {
  if (!selectedCategory.value) return false;

  if (!regularity.value) {
    return !!oneTimeForm.value.amount && !!oneTimeForm.value.date;
  } else if (operationType.value) {
    const form = regularIncomeForm.value;
    const hasBasicFields =
      !!form.amount && !!form.start_date && !!form.payment_day && !!form.frequency_id;

    if (isRentCategory.value) {
      return hasBasicFields && !!form.loan_term;
    }

    return hasBasicFields;
  } else {
    const form = regularExpenseForm.value;
    const hasBasicFields =
      !!form.amount && !!form.start_date && !!form.payment_day && !!form.frequency_id;

    if (isRentCategory.value || isCreditOrInstallment.value) {
      return hasBasicFields && !!form.loan_term;
    }

    return hasBasicFields;
  }
});

const onSubmit = async () => {
  if (!props.estateId || !props.userId) {
    $q.notify({
      color: 'red-5',
      textColor: 'white',
      icon: 'error',
      message: 'Не выбрана недвижимость',
    });
    return;
  }

  try {
    const selectedCategoryData = transactionTypes.value.find(
      type => type.id === selectedCategory.value,
    );
    const categoryName = selectedCategoryData?.name || '';

    const transactionData: EstateTransaction = {
      estate_id: props.estateId,
      type_id: selectedCategory.value!,
      name: categoryName,
      cost: 0,
      direction: operationType.value,
      regularity: regularity.value,
      date_start: '',
      comment: '',
      payday_on_workday: false,
    };

    if (!regularity.value) {
      transactionData.cost = Number(oneTimeForm.value.amount) || 0;
      transactionData.comment = oneTimeForm.value.description || '';
      transactionData.date_start = String(oneTimeForm.value.date);
    } else if (operationType.value) {
      const form = regularIncomeForm.value;
      transactionData.cost = Number(form.amount) || 0;
      transactionData.comment = form.description || '';
      transactionData.date_start = String(form.start_date);
      transactionData.payday = Number(form.payment_day) || undefined;
      transactionData.frequency_id = form.frequency_id;

      if (isRentCategory.value) {
        transactionData.loan_term = Number(form.loan_term) || undefined;
      }
    } else {
      const form = regularExpenseForm.value;
      transactionData.cost = Number(form.amount) || 0;
      transactionData.comment = form.description || '';
      transactionData.date_start = String(form.start_date);
      transactionData.payday = Number(form.payment_day) || undefined;
      transactionData.frequency_id = form.frequency_id;
      if (isRentCategory.value || isCreditOrInstallment.value) {
        transactionData.loan_term = Number(form.loan_term) || undefined;

        if (isCreditCategory.value && !isInstallmentCategory.value && !isRentCategory.value) {
          transactionData.interest_rate = Number(form.interest_rate) || undefined;
        }
      }
    }

    await transactionStore.addEstateTransactions(props.userId, transactionData);

    $q.notify({
      color: 'green-4',
      textColor: 'white',
      icon: 'cloud_done',
      message: 'Транзакция успешно добавлена!',
      timeout: 3000,
      position: 'center',
    });

    await new Promise(resolve => setTimeout(resolve, 3000));
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
    amount: null,
    description: '',
    date: '',
  };
  regularIncomeForm.value = {
    amount: null,
    description: '',
    start_date: '',
    payment_day: null,
    frequency_id: undefined,
    loan_term: null,
  };
  regularExpenseForm.value = {
    amount: null,
    description: '',
    start_date: '',
    payment_day: null,
    frequency_id: undefined,
    loan_term: null,
    interest_rate: null,
  };
  selectedCategory.value = null;
};

watch([operationType, regularity], () => {
  selectedCategory.value = null;
  resetForms();
});
</script>
<template>
  <div class="transaction-form-wrapper">
    <div class="q-pa-md">
      <q-form @submit="onSubmit">
        <div class="form-container">
          <div class="form-header">
            <h6 class="form-title">Добавить транзакцию</h6>
            <div class="radio-section">
              <div class="radio-group">
                <div class="radio-label">Тип операции:</div>
                <q-option-group
                  v-model="operationType"
                  :options="transactionOptions"
                  color="primary"
                  inline
                  class="radio-options"
                />
              </div>

              <div class="radio-group">
                <div class="radio-label">Регулярность:</div>
                <q-option-group
                  v-model="regularity"
                  :options="regularityOptions"
                  color="primary"
                  inline
                  class="radio-options"
                />
              </div>
            </div>

            <div v-if="showCategories" class="category-select">
              <q-select
                filled
                v-model="selectedCategory"
                :options="categoryOptions"
                label="Категория"
                option-label="name"
                option-value="id"
                emit-value
                map-options
                :rules="[val => !!val || 'Выберите категорию']"
                dense
              />
            </div>
            <div v-else class="text-caption text-grey no-categories">
              Нет доступных категорий для выбранных параметров
            </div>
          </div>

          <div class="form-details">
            <div v-if="showOneTimeForm" class="form-section">
              <h6 class="form-subtitle">Разовая операция</h6>
              <div class="inputs-group">
                <q-input
                  filled
                  v-model="oneTimeForm.amount"
                  label="Сумма"
                  type="number"
                  :rules="[val => !!val || 'Введите сумму']"
                  dense
                />
                <q-input
                  filled
                  v-model="oneTimeForm.date"
                  label="Дата"
                  type="date"
                  :rules="[val => !!val || 'Введите дату']"
                  dense
                />
                <q-input
                  filled
                  v-model="oneTimeForm.description"
                  label="Описание"
                  type="textarea"
                  rows="2"
                  class="full-width"
                  dense
                />
              </div>
            </div>
            <div v-if="showRegularIncomeForm" class="form-section">
              <h6 class="form-subtitle">
                Регулярный доход
                <span v-if="isRentCategory" class="credit-badge">
                  ({{ categoryOptions.find(c => c.id === selectedCategory)?.name }})
                </span>
              </h6>
              <div class="inputs-group">
                <q-input
                  filled
                  v-model="regularIncomeForm.amount"
                  :label="isRentCategory ? 'Сумма аренды' : 'Сумма дохода'"
                  type="number"
                  :rules="[val => !!val || 'Введите сумму']"
                  dense
                />
                <q-input
                  filled
                  v-model="regularIncomeForm.start_date"
                  label="Дата начала"
                  type="date"
                  :rules="[val => !!val || 'Введите дату начала']"
                  dense
                />
                <q-input
                  filled
                  v-model="regularIncomeForm.payment_day"
                  label="День платежа (1-31)"
                  type="number"
                  min="1"
                  max="31"
                  :rules="[val => !!val || 'Введите день платежа']"
                  dense
                />
                <q-select
                  filled
                  v-model="regularIncomeForm.frequency_id"
                  :options="transactionFrequencies"
                  label="Периодичность *"
                  option-label="name"
                  option-value="id"
                  emit-value
                  map-options
                  :rules="[val => !!val || 'Выберите периодичность']"
                  dense
                />

                <q-input
                  v-if="isRentCategory"
                  filled
                  v-model="regularIncomeForm.loan_term"
                  label="Срок договора (месяцев) *"
                  type="number"
                  :rules="[val => !!val || 'Введите срок договора']"
                  dense
                />

                <q-input
                  filled
                  v-model="regularIncomeForm.description"
                  label="Описание"
                  type="textarea"
                  rows="2"
                  class="full-width"
                  dense
                />
              </div>
            </div>

            <div v-if="showRegularExpenseForm" class="form-section">
              <h6 class="form-subtitle">
                Регулярный расход
                <span v-if="isRentCategory || isCreditOrInstallment" class="credit-badge">
                  ({{ categoryOptions.find(c => c.id === selectedCategory)?.name }})
                </span>
              </h6>
              <div class="inputs-group">
                <q-input
                  filled
                  v-model="regularExpenseForm.amount"
                  :label="
                    isRentCategory || isCreditOrInstallment ? 'Сумма договора' : 'Сумма платежа'
                  "
                  type="number"
                  :rules="[val => !!val || 'Введите сумму']"
                  dense
                />
                <q-input
                  filled
                  v-model="regularExpenseForm.start_date"
                  label="Дата начала"
                  type="date"
                  :rules="[val => !!val || 'Введите дату начала']"
                  dense
                />
                <q-input
                  filled
                  v-model="regularExpenseForm.payment_day"
                  label="День платежа (1-31)"
                  type="number"
                  min="1"
                  max="31"
                  :rules="[val => !!val || 'Введите день платежа']"
                  dense
                />
                <q-select
                  filled
                  v-model="regularExpenseForm.frequency_id"
                  :options="transactionFrequencies"
                  label="Периодичность *"
                  option-label="name"
                  option-value="id"
                  emit-value
                  map-options
                  :rules="[val => !!val || 'Выберите периодичность']"
                  dense
                />

                <template v-if="isRentCategory || isCreditOrInstallment">
                  <q-input
                    filled
                    v-model="regularExpenseForm.loan_term"
                    label="Срок договора (месяцев) *"
                    type="number"
                    :rules="[val => !!val || 'Введите срок договора']"
                    dense
                  />
                </template>
                <q-input
                  v-if="isCreditCategory && !isInstallmentCategory && !isRentCategory"
                  filled
                  v-model="regularExpenseForm.interest_rate"
                  label="Процентная ставка (%)"
                  type="number"
                  step="0.1"
                  dense
                />

                <q-input
                  filled
                  v-model="regularExpenseForm.description"
                  label="Описание"
                  type="textarea"
                  rows="2"
                  class="full-width"
                  dense
                />
              </div>
            </div>

            <div v-if="selectedCategory" class="submit-section">
              <q-btn
                label="Добавить операцию"
                type="submit"
                color="secondary"
                class="submit-btn"
                :disable="!isFormValid"
                dense
              />
            </div>
          </div>
        </div>
      </q-form>
    </div>
  </div>
</template>

<style scoped>
.transaction-form-wrapper {
  width: 100%;
  max-width: 100%;
}

.form-container {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.form-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.radio-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.radio-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.radio-label {
  font-size: 0.9rem;
  font-weight: 500;
  min-width: 120px;
}

.radio-options {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.category-select {
  width: 100%;
}

.no-categories {
  text-align: center;
  padding: 1rem;
}

.form-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
}

.form-subtitle {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--q-primary);
}

.form-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: 8px;
  background: var(--bg-color);
}

.inputs-group {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: flex-start;
}

.inputs-group .q-field {
  flex: 1;
  min-width: 150px;
}

.full-width {
  min-width: 100% !important;
  max-width: 100% !important;
  flex: none !important;
}

:deep(.q-field--textarea .q-field__control) {
  min-height: 80px;
  resize: vertical;
}

:deep(.q-field--textarea .q-field__native) {
  min-height: 60px;
  resize: vertical;
  overflow: auto;
}

:deep(.q-field--textarea) {
  resize: vertical;
  overflow: auto;
}

.settings-toggle {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}

.settings-btn {
  font-size: 0.85rem;
  padding: 0.4rem 0.8rem;
}

.advanced-settings {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  border: 1px solid var(--border-color);
}

.loan-section,
.early-repayment {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  border: 1px solid var(--border-color);
}

.submit-section {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.submit-btn {
  min-width: 200px;
  font-weight: 500;
  font-size: 0.9rem;
}
:deep(.q-field--dense .q-field__control) {
  min-height: 40px !important;
  height: auto;
}

:deep(.q-field--dense .q-field__label) {
  font-size: 0.8rem;
  top: 10px;
}

:deep(.q-field--dense .q-field__native) {
  padding-top: 8px;
  padding-bottom: 4px;
  font-size: 0.9rem;
}

:deep(.q-field--dense textarea.q-field__native) {
  min-height: 60px;
  resize: vertical;
  overflow: auto;
}

:deep(.q-field--dense .q-field__marginal) {
  height: 40px;
}

@media (max-width: 768px) {
  .transaction-form-wrapper .q-pa-md {
    padding: 0.5rem;
  }

  .form-container {
    padding: 0.75rem;
  }

  .form-header {
    padding: 0.5rem 0;
    gap: 0.75rem;
  }

  .radio-section {
    gap: 0.75rem;
  }

  .radio-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .radio-label {
    min-width: auto;
    font-size: 0.85rem;
  }

  .radio-options {
    gap: 0.75rem;
  }

  .form-title {
    font-size: 1.1rem;
  }

  .form-subtitle {
    font-size: 1rem;
  }

  .form-section {
    padding: 0.75rem;
    margin-bottom: 1rem;
  }

  .inputs-group {
    gap: 0.5rem;
  }

  .inputs-group .q-field:last-of-type {
    overflow: hidden;
  }

  .settings-btn {
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem;
  }

  .advanced-settings,
  .loan-section,
  .early-repayment {
    padding: 0.75rem;
    margin: 0.75rem 0;
  }

  .submit-section {
    margin-top: 1rem;
    padding-top: 0.75rem;
  }

  .submit-btn {
    min-width: 160px;
    font-size: 0.85rem;
  }

  :deep(.q-field--dense .q-field__control) {
    min-height: 36px !important;
    height: 36px;
  }

  :deep(.q-field--dense .q-field__label) {
    font-size: 0.75rem;
    top: 8px;
  }

  :deep(.q-field--dense .q-field__native) {
    padding-top: 6px;
    padding-bottom: 2px;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .inputs-group .q-field:last-of-type {
    margin-top: 1rem;
    overflow: hidden;
  }
  .transaction-form-wrapper .q-pa-md {
    padding: 0.25rem;
  }

  .form-container {
    padding: 0.5rem;
  }

  .inputs-group .q-field {
    min-width: 100%;
  }

  .submit-btn {
    min-width: 140px;
    font-size: 0.8rem;
    width: 100%;
    max-width: 200px;
  }
}
</style>
