<script setup lang="ts">
const { formatNumber } = useFormatters();

const installmentData = reactive({
  price: 5000000,
  initialPayment: 500000,
  term: 24,
});

const clear = () => {
  installmentData.price = 5000000;
  installmentData.initialPayment = 500000;
  installmentData.term = 24;
};

const result = computed(() => {
  const loanAmount = installmentData.price - installmentData.initialPayment;
  const months = installmentData.term;

  if (loanAmount <= 0 || months <= 0) {
    return {
      monthlyPayment: 0,
      overpayment: 0,
      totalAmount: 0,
      loanAmount: 0,
      initialPaymentPercent: 0,
    };
  }

  const monthlyPayment = loanAmount / months;
  const totalAmount = installmentData.initialPayment + monthlyPayment * months;
  const overpayment = totalAmount - installmentData.price;
  const initialPaymentPercent = (installmentData.initialPayment / installmentData.price) * 100;

  return {
    monthlyPayment: Math.round(monthlyPayment),
    loanAmount: Math.round(loanAmount),
    totalAmount: Math.round(totalAmount),
    overpayment: Math.round(overpayment),
    initialPaymentPercent: Math.round(initialPaymentPercent),
  };
});

const formattedResult = computed(() => ({
  monthlyPayment: formatNumber(result.value.monthlyPayment),
  loanAmount: formatNumber(result.value.loanAmount),
  totalAmount: formatNumber(result.value.totalAmount),
  overpayment: formatNumber(result.value.overpayment),
  initialPaymentPercent: result.value.initialPaymentPercent,
}));

const saveDraft = () => {
  console.log('Сохранение черновика:', {
    ...installmentData,
    result: result.value,
  });
  // Добавить сохранение на бекенд
};
</script>
<template>
  <q-card>
    <q-card-section>
      <div class="text-h5 q-mb-md">Калькулятор рассрочки</div>

      <div class="q-mb-lg">
        <div class="row items-center justify-between q-mb-sm">
          <label class="text-subtitle1">Стоимость недвижимости</label>
          <div class="text-h6">{{ formatNumber(installmentData.price) }} ₽</div>
        </div>
        <q-slider
          v-model="installmentData.price"
          :min="1000000"
          :max="50000000"
          :step="100000"
          color="indigo-10"
        />
      </div>

      <div class="q-mb-lg">
        <div class="row items-center justify-between q-mb-sm">
          <label class="text-subtitle1">Первоначальный взнос</label>
          <div class="text-h6">{{ formatNumber(installmentData.initialPayment) }} ₽</div>
        </div>
        <q-slider
          v-model="installmentData.initialPayment"
          :min="0"
          :max="installmentData.price"
          :step="100000"
          color="indigo-10"
        />
      </div>

      <div class="q-mb-lg">
        <div class="row items-center justify-between q-mb-sm">
          <label class="text-subtitle1">Срок рассрочки</label>
          <q-input
            v-model.number="installmentData.term"
            dense
            outlined
            suffix="мес."
            style="width: 120px"
            :min="6"
            :max="60"
            type="number"
          />
        </div>
        <q-slider v-model="installmentData.term" :min="6" :max="60" :step="1" color="indigo-10" />
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
              <div class="text-caption text-grey">Сумма кредита</div>
              <div class="text-h6">{{ formattedResult.loanAmount }} ₽</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey">Первоначальный взнос</div>
              <div class="text-h6">{{ formattedResult.initialPaymentPercent }}%</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey">Переплата</div>
              <div class="text-h6">{{ formattedResult.overpayment }} ₽</div>
            </div>
            <div class="col-12">
              <div class="text-caption text-grey">Общая сумма</div>
              <div class="text-h5 text-indigo-10">{{ formattedResult.totalAmount }} ₽</div>
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
