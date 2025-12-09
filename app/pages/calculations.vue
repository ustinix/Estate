<script setup lang="ts">
import { useAuthStore } from '~/stores/authStore';
import { calculators } from '~/constants/calculators';
import { drafts } from '~/constants/mockDrafts';

const authStore = useAuthStore();

type CalculatorComponent = ReturnType<typeof defineAsyncComponent>;

const activeCalculator = ref('mortgage');

const calculatorComponents: Record<string, CalculatorComponent> = {
  MortgageCalc: defineAsyncComponent(() => import('~/components/calculators/MortgageCalc.vue')),
  InstalmentCalc: defineAsyncComponent(() => import('~/components/calculators/InstalmentCalc.vue')),
};

const activeComponent = computed(() => {
  const calc = calculators.value.find(c => c.id === activeCalculator.value);
  if (!calc) return null;
  return calculatorComponents[calc.component];
});

const setActiveCalculator = (calcId: string) => {
  activeCalculator.value = calcId;
};
</script>

<template>
  <client-only>
    <section class="calculators-page">
      <div class="layout">
        <div class="page-header q-mb-xl">
          <h1 class="text-h3 q-mb-sm">Калькуляторы недвижимости</h1>
          <p class="text-h6 text-grey-7">Рассчитайте все параметры вашей будущей недвижимости</p>
        </div>

        <div class="page-content">
          <div class="row q-col-gutter-xl">
            <div class="col-12 col-md-4">
              <q-card class="calculators-sidebar">
                <q-card-section>
                  <div class="text-h6 q-mb-md">Калькуляторы</div>

                  <q-list bordered class="rounded-borders">
                    <q-item
                      v-for="calc in calculators"
                      :key="calc.id"
                      clickable
                      v-ripple
                      :active="activeCalculator === calc.id"
                      active-class="active-item"
                      @click="setActiveCalculator(calc.id)"
                      class="q-mb-sm"
                    >
                      <q-item-section side v-if="calc.comingSoon">
                        <q-badge class="badge-soon" label="Скоро" />
                      </q-item-section>
                      <q-item-section v-else avatar>
                        <q-icon
                          :name="calc.icon"
                          :color="activeCalculator === calc.id ? 'white' : calc.color"
                        />
                      </q-item-section>

                      <q-item-section>
                        <q-item-label class="text-weight-medium">
                          {{ calc.title }}
                        </q-item-label>
                        <q-item-label
                          caption
                          :class="activeCalculator === calc.id ? 'text-white' : ''"
                        >
                          {{ calc.description }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>

              <q-card
                v-if="authStore.isAuthenticated && drafts.length > 0"
                class="drafts-sidebar q-mt-lg"
              >
                <q-card-section>
                  <q-badge class="badge-soon" label="Скоро" />
                  <div class="text-h6 q-mb-md">Сохраненные расчеты</div>

                  <q-list bordered class="rounded-borders">
                    <q-item
                      v-for="draft in drafts"
                      :key="draft.id"
                      clickable
                      v-ripple
                      class="q-mb-sm"
                    >
                      <q-item-section avatar>
                        <q-icon name="description" color="grey" />
                      </q-item-section>

                      <q-item-section>
                        <q-item-label class="text-weight-medium">
                          {{ draft.title }}
                        </q-item-label>
                        <q-item-label caption>
                          {{ new Date(draft.date).toLocaleDateString('ru-RU') }}
                        </q-item-label>
                      </q-item-section>

                      <q-item-section side>
                        <q-btn icon="delete" flat round dense color="grey" size="sm" />
                      </q-item-section>
                    </q-item>
                  </q-list>

                  <div class="text-center q-mt-md">
                    <q-btn label="Все черновики" flat color="indigo-10" no-caps />
                  </div>
                </q-card-section>
              </q-card>

              <q-card v-if="!authStore.isAuthenticated" class="auth-promo q-mt-lg">
                <q-card-section class="text-center">
                  <q-icon name="lock" size="40px" class="q-mb-sm" />
                  <div class="text-h6 q-mb-sm">Сохраняйте расчеты</div>
                  <p class="text-body2 q-mb-md">
                    Войдите в систему, чтобы сохранять все расчеты и возвращаться к ним позже
                  </p>
                  <div class="row q-gutter-sm justify-center">
                    <q-btn label="Войти" class="button" color="secondary" :to="'/login'" no-caps />
                    <q-btn
                      label="Регистрация"
                      class="button"
                      color="secondary"
                      :to="'/register'"
                      no-caps
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-8">
              <component :is="activeComponent" v-if="activeComponent" />
              <q-card v-else>
                <q-card-section class="text-center q-pa-xl">
                  <q-icon name="calculate" size="60px" color="grey" class="q-mb-md" />
                  <div class="text-h6">Выберите калькулятор</div>
                  <p class="text-grey">
                    Выберите один из калькуляторов в меню слева для начала работы
                  </p>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </section>
  </client-only>
</template>

<style scoped>
.calculators-page {
  padding: 40px 0;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.layout {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  text-align: center;
}

.calculators-sidebar :deep(.q-item) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.active-item {
  background: var(--primary);
  color: white;
}

.badge-soon {
  background: var(--warning);
  color: white;
}

.auth-promo {
  background: var(--primary);
  color: white;
}

@media (max-width: 768px) {
  .calculators-page {
    padding: 20px 0;
  }

  .page-header .text-h3 {
    font-size: 1.5rem;
  }
}
</style>
