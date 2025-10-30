<script setup lang="ts">
import { transactionOptions, regularityOptions } from '~/constants/transactions ';
import type {
  EstateTransaction,
  OneTimeFormData,
  RegularIncomeFormData,
  RegularExpenseFormData,
} from '~/types/transactions';
import { useEstateStore } from '~/stores/estateStore';
import { useDictionariesStore } from '~/stores/dictionariesStore';

const estateStore = useEstateStore();
const dictionaryStore = useDictionariesStore();
const { transactionTypes, transactionFrequencies, repaymentPlans } = storeToRefs(dictionaryStore);
const $q = useQuasar();

const isMounted = ref(false);
onMounted(() => {
  isMounted.value = true;
});

const operationType = ref(true);
const regularity = ref(false);
const selectedCategory = ref<number | null>(null);
const showAdvancedSettings = ref(false);
const currentEstateId = estateStore.estate?.id;

const categoryOptions = computed(() => {
  if (!isMounted.value || !transactionTypes.value.length) return [];

  return transactionTypes.value.filter(
    type =>
      Boolean(type.direction) === operationType.value &&
      Boolean(type.regularity) === regularity.value,
  );
});

const showCategories = computed(() => isMounted.value && categoryOptions.value.length > 0);

const oneTimeForm = ref<OneTimeFormData>({
  estate_id: currentEstateId,
  transaction_type_id: null,
  amount: null,
  description: '',
  date: '',
  regularity: false,
});

const regularIncomeForm = ref<RegularIncomeFormData>({
  estate_id: currentEstateId,
  transaction_type_id: null,
  amount: null,
  description: '',
  start_date: '',
  payment_day: null,
  regularity: true,
  direction: true,
  contract_duration: 'short',
});

const regularExpenseForm = ref<RegularExpenseFormData>({
  estate_id: currentEstateId,
  transaction_type_id: null,
  amount: null,
  description: '',
  start_date: '',
  payment_day: null,
  regularity: true,
  direction: false,
});

const isCreditCategory = computed(() => {
  if (!selectedCategory.value) return false;
  const category = transactionTypes.value.find(type => type.id === selectedCategory.value);
  if (!category) return false;

  const creditKeywords = ['ипотека', 'кредит', 'рассрочка', 'заем', 'займ'];
  return creditKeywords.some(keyword =>
    category.name.toLowerCase().includes(keyword.toLowerCase()),
  );
});

const showRegularIncomeForm = computed(() => operationType.value && regularity.value);
const showRegularExpenseForm = computed(() => !operationType.value && regularity.value);
const showOneTimeForm = computed(() => !regularity.value);
const currentRegularForm = computed(() => {
  return operationType.value ? regularIncomeForm.value : regularExpenseForm.value;
});

const isFormValid = computed(() => {
  if (!selectedCategory.value) return false;

  if (!regularity.value) {
    return !!oneTimeForm.value.amount && !!oneTimeForm.value.date;
  } else {
    const form = currentRegularForm.value;
    return !!form.amount && !!form.start_date && !!form.payment_day;
  }
});

const onSubmit = async () => {
  if (!currentEstateId) {
    $q.notify({
      color: 'red-5',
      textColor: 'white',
      icon: 'error',
      message: 'Не выбрана недвижимость',
    });
    return;
  }

  try {
    const transactionData: EstateTransaction = {
      estate_id: currentEstateId,
      type_id: selectedCategory.value!,
      cost: 0,
      direction: operationType.value,
      regularity: regularity.value,
      date_start: '',
      comment: '',
    };

    if (!regularity.value) {
      transactionData.cost = Number(oneTimeForm.value.amount) || 0;
      transactionData.comment = oneTimeForm.value.description || '';
      transactionData.date_start = String(oneTimeForm.value.date);
    } else {
      const form = currentRegularForm.value;
      transactionData.cost = Number(form.amount) || 0;
      transactionData.comment = form.description || '';
      transactionData.date_start = String(form.start_date);

      // Для регулярных операций можно добавить дополнительные поля (пока бэк не принимает регулярные, потом поправить)
      if (!operationType.value && isCreditCategory.value) {
        console.log('Кредитные данные:', {
          loan_amount: regularExpenseForm.value.loan_amount,
          loan_term: regularExpenseForm.value.loan_term,
          interest_rate: regularExpenseForm.value.interest_rate,
        });
      }
    }
    await estateStore.addEstateTransactions(transactionData);

    $q.notify({
      color: 'green-4',
      textColor: 'white',
      icon: 'cloud_done',
      message: 'Транзакция успешно добавлена!',
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
    estate_id: currentEstateId,
    transaction_type_id: null,
    amount: null,
    description: '',
    date: '',
    regularity: false,
  };
  regularIncomeForm.value = {
    estate_id: currentEstateId,
    transaction_type_id: null,
    amount: null,
    description: '',
    start_date: '',
    payment_day: null,
    regularity: true,
    direction: true,
    contract_duration: 'short',
  };
  regularExpenseForm.value = {
    estate_id: currentEstateId,
    transaction_type_id: null,
    amount: null,
    description: '',
    start_date: '',
    payment_day: null,
    regularity: true,
    direction: false,
  };
  selectedCategory.value = null;
  showAdvancedSettings.value = false;
};

watch([operationType, regularity], () => {
  selectedCategory.value = null;
});
</script>
<template>
  <div>
    <div class="q-pa-md">
      <q-form @submit="onSubmit">
        <div class="form-container">
          <div class="form-header">
            <h6 class="form-title">Добавить транзакцию</h6>
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

            <div v-if="showCategories">
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
              />
            </div>
            <div v-else class="text-caption text-grey">
              Нет доступных категорий для выбранных параметров
            </div>
          </div>

          <div class="form-details">
            <div v-if="showOneTimeForm && selectedCategory">
              <h6 class="form-title">Разовая операция</h6>
              <div class="inputs-group">
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
                <q-input
                  filled
                  v-model="oneTimeForm.description"
                  label="Описание"
                  type="textarea"
                  rows="2"
                />
              </div>
            </div>

            <div v-if="showRegularIncomeForm && selectedCategory">
              <h6 class="form-title">Регулярный доход</h6>

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
                  rows="2"
                />
              </div>

              <div>
                <q-btn
                  flat
                  :label="
                    showAdvancedSettings ? 'Скрыть доп. настройки' : 'Показать доп. настройки'
                  "
                  @click="showAdvancedSettings = !showAdvancedSettings"
                  color="indigo-10"
                  no-caps
                  class="settings-btn"
                />
              </div>

              <div v-if="showAdvancedSettings" class="advanced-settings q-pl-md">
                <h6 class="form-title">Дополнительные настройки</h6>
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
              <h6 class="form-title">Регулярный расход</h6>

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
                  <h6 class="form-title">Параметры кредита</h6>
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
                      rows="2"
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
                  color="indigo-10"
                  no-caps
                  class="settings-btn"
                />
              </div>

              <div v-if="showAdvancedSettings" class="advanced-settings q-pl-md">
                <h6 class="form-title">Дополнительные настройки</h6>

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
                  <h6 class="form-title">Досрочное погашение</h6>
                  <div class="inputs-group">
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
            </div>

            <div v-if="selectedCategory">
              <q-btn
                label="Добавить операцию"
                type="submit"
                color="secondary"
                class="button form-btn"
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
.form-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
}

.form-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 12px;
  padding: 1rem;
  width: 80vw;
  max-width: 1200px;
  margin: 0 auto;
}

.form-title {
  margin-top: 0.5rem;
  margin-bottom: 0.75rem;
}

.radio-group {
  min-width: 350px;
  display: flex;
  align-items: center;
  justify-content: start;
}

.inputs-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: flex-start;
}

.inputs-group .q-field {
  flex: 1;
}

.inputs-group .q-field:has(textarea) {
  min-width: 100%;
  max-width: 100%;
}

.advanced-settings {
  border-radius: 8px;
  margin-top: 0.75rem;
  padding: 8px;
}

.loan-fields {
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.early-repayment {
  border-radius: 8px;
  padding: 12px;
}

.form-btn {
  margin: 1rem;
}

.settings-btn {
  text-transform: none;
}

@media (max-width: 850px) {
  .form-container {
    min-width: 350px;
    flex-direction: column;
    gap: 1rem;
    padding: 0.8rem;
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
