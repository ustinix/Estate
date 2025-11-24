<script setup lang="ts">
const { formatNumber } = useFormatters();

const parseNumber = (formattedValue: string): number => {
  return parseFloat(formattedValue.replace(/\s/g, '')) || 0;
};

const mortgageData = reactive({
  price: 10000000,
  initialPayment: 2000000,
  interestRate: 7.5,
  term: 20,
});

const clear = () => {
  mortgageData.price = 10000000;
  mortgageData.initialPayment = 2000000;
  mortgageData.interestRate = 7.5;
  mortgageData.term = 20;
};

const formattedPrice = computed({
  get: () => formatNumber(mortgageData.price),
  set: val => {
    mortgageData.price = parseNumber(val);
  },
});

const formattedInitialPayment = computed({
  get: () => formatNumber(mortgageData.initialPayment),
  set: val => {
    mortgageData.initialPayment = parseNumber(val);
  },
});

const result = computed(() => {
  const loanAmount = mortgageData.price - mortgageData.initialPayment;
  const monthlyRate = mortgageData.interestRate / 100 / 12;
  const months = mortgageData.term * 12;

  if (loanAmount <= 0 || monthlyRate <= 0 || months <= 0) {
    return {
      monthlyPayment: 0,
      overpayment: 0,
      totalAmount: 0,
      loanAmount: 0,
    };
  }

  const monthlyPayment =
    (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
    (Math.pow(1 + monthlyRate, months) - 1);

  const totalAmount = monthlyPayment * months;
  const overpayment = totalAmount - loanAmount;

  return {
    monthlyPayment: Math.round(monthlyPayment),
    overpayment: Math.round(overpayment),
    totalAmount: Math.round(totalAmount),
    loanAmount: Math.round(loanAmount),
  };
});

const formattedResult = computed(() => ({
  monthlyPayment: formatNumber(result.value.monthlyPayment),
  overpayment: formatNumber(result.value.overpayment),
  totalAmount: formatNumber(result.value.totalAmount),
  loanAmount: formatNumber(result.value.loanAmount),
}));

const limits = {
  price: { min: 1000000, max: 100000000, step: 100000 },
  initialPayment: { min: 0, max: 50000000, step: 100000 },
  interestRate: { min: 1, max: 20, step: 0.1 },
  term: { min: 1, max: 30, step: 1 },
};

const initialPaymentPercent = computed({
  get: () => Math.round((mortgageData.initialPayment / mortgageData.price) * 100),
  set: percent => {
    mortgageData.initialPayment = Math.round((mortgageData.price * percent) / 100);
  },
});

const saveDraft = () => {
  console.log('Сохранение черновика:', {
    ...mortgageData,
    result: result.value,
  });
  // Добавить сохранение на бекенд
};
</script>
<template>
  <q-card class="calculator-card">
    <q-card-section>
      <div class="text-h5 q-mb-md">Ипотечный калькулятор</div>

      <div class="q-mb-lg">
        <div class="row items-center justify-between q-mb-sm">
          <label class="text-subtitle1">Стоимость недвижимости</label>
          <q-input v-model="formattedPrice" dense outlined suffix="₽" class="price-input" />
        </div>
        <q-slider
          v-model="mortgageData.price"
          :min="limits.price.min"
          :max="limits.price.max"
          :step="limits.price.step"
          color="indigo-10"
        />
      </div>

      <div class="q-mb-lg">
        <div class="row items-center justify-between q-mb-sm">
          <label class="text-subtitle1">Первоначальный взнос</label>
          <div class="row items-center gap-md">
            <q-input
              v-model="formattedInitialPayment"
              dense
              outlined
              suffix="₽"
              class="payment-input"
            />
            <q-input
              v-model.number="initialPaymentPercent"
              dense
              outlined
              suffix="%"
              class="percent-input"
              style="width: 100px"
            />
          </div>
        </div>
        <q-slider
          v-model="mortgageData.initialPayment"
          :min="limits.initialPayment.min"
          :max="Math.min(limits.initialPayment.max, mortgageData.price)"
          :step="limits.initialPayment.step"
          color="indigo-10"
        />
      </div>

      <div class="q-mb-lg">
        <div class="row items-center justify-between q-mb-sm">
          <label class="text-subtitle1">Процентная ставка</label>
          <q-input
            v-model.number="mortgageData.interestRate"
            dense
            outlined
            suffix="%"
            class="rate-input"
            style="width: 120px"
          />
        </div>
        <q-slider
          v-model="mortgageData.interestRate"
          :min="limits.interestRate.min"
          :max="limits.interestRate.max"
          :step="limits.interestRate.step"
          color="indigo-10"
        />
      </div>

      <div class="q-mb-lg">
        <div class="row items-center justify-between q-mb-sm">
          <label class="text-subtitle1">Срок кредита</label>
          <q-input
            v-model.number="mortgageData.term"
            dense
            outlined
            suffix="лет"
            class="term-input"
            style="width: 100px"
          />
        </div>
        <q-slider
          v-model="mortgageData.term"
          :min="limits.term.min"
          :max="limits.term.max"
          :step="limits.term.step"
          color="indigo-10"
        />
      </div>

      <q-card flat bordered class="bg-grey-1 q-mb-md">
        <q-card-section>
          <div class="text-h6 q-mb-sm">Результаты расчета</div>
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <div class="text-caption text-grey">Ежемесячный платеж</div>
              <div class="text-h6 text-indigo-10">{{ formattedResult.monthlyPayment }} ₽</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey">Общая переплата</div>
              <div class="text-h6">{{ formattedResult.overpayment }} ₽</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey">Сумма кредита</div>
              <div class="text-h6">{{ formattedResult.loanAmount }} ₽</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey">Общая сумма</div>
              <div class="text-h6">{{ formattedResult.totalAmount }} ₽</div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card-actions>
        <q-btn
          label="Сохранить расчет"
          class="button"
          color="secondary"
          icon="save"
          @click="saveDraft"
        />
        <q-btn label="Сбросить" class="button" flat @click="clear" />
      </q-card-actions>
    </q-card-section>
  </q-card>
</template>
<style lang="scss" scoped>
.calculator-card {
  max-width: 600px;
  margin: 0 auto;
}

.price-input,
.payment-input {
  width: 200px;
}

.rate-input,
.term-input {
  width: 120px;
}

:deep(.q-slider__track) {
  height: 6px;
}

:deep(.q-slider__thumb) {
  width: 20px;
  height: 20px;
}

.text-h6 {
  font-weight: 600;
}
</style>
