<script setup lang="ts">
import type { EstateMetrics } from '~/types/estateMetrics';

defineProps<{
  metrics: EstateMetrics;
}>();

const formatPercent = (value: number): string => {
  return `${value}%`;
};

const formatCurrency = (value: number, currency: string = '₽'): string => {
  return `${value.toLocaleString('ru-RU')} ${currency}`;
};

const getTrendIcon = (trend: 'up' | 'down' | 'stable'): string => {
  const icons = {
    up: 'arrow_upward',
    down: 'arrow_downward',
    stable: 'remove',
  };
  return icons[trend];
};

const getTrendColor = (trend: 'up' | 'down' | 'stable'): string => {
  const colors = {
    up: 'positive',
    down: 'negative',
    stable: 'warning',
  };
  return colors[trend];
};
</script>
<template>
  <div class="estate-metrics">
    <div class="metrics-grid">
      <q-card class="metric-card" flat>
        <q-card-section class="q-pa-md">
          <div class="row items-center no-wrap">
            <div class="col">
              <div class="text-caption text-weight-medium metric-title">ROI (годовой)</div>
            </div>
            <div class="col-auto">
              <q-icon name="trending_up" size="20px" color="positive" />
            </div>
          </div>

          <div class="row items-end no-wrap q-mt-sm">
            <div class="col">
              <div class="text-h5 text-weight-bold metric-value">
                {{ formatPercent(metrics.roi.value) }}
              </div>
            </div>
            <div class="col-auto">
              <q-icon
                :name="metrics.roi.value >= metrics.roi.target ? 'arrow_upward' : 'arrow_downward'"
                size="16px"
                :color="metrics.roi.value >= metrics.roi.target ? 'positive' : 'negative'"
                class="q-mr-xs"
              />
              <span
                class="text-caption text-weight-medium"
                :class="metrics.roi.value >= metrics.roi.target ? 'text-positive' : 'text-negative'"
              >
                {{ formatPercent(metrics.roi.target) }} цель
              </span>
            </div>
          </div>

          <div class="text-caption metric-subtitle q-mt-xs">Доходность инвестиций</div>
        </q-card-section>
      </q-card>

      <q-card class="metric-card" flat>
        <q-card-section class="q-pa-md">
          <div class="row items-center no-wrap">
            <div class="col">
              <div class="text-caption text-weight-medium metric-title">Окупаемость</div>
            </div>
            <div class="col-auto">
              <q-icon name="schedule" size="20px" color="primary" />
            </div>
          </div>

          <div class="row items-end no-wrap q-mt-sm">
            <div class="col">
              <div class="text-h5 text-weight-bold metric-value">
                {{ metrics.payback.value }}
              </div>
            </div>
            <div v-if="metrics.payback.trend" class="col-auto">
              <q-icon
                :name="getTrendIcon(metrics.payback.trend)"
                size="16px"
                :color="getTrendColor(metrics.payback.trend)"
                class="q-mr-xs"
              />
              <span
                class="text-caption text-weight-medium"
                :class="`text-${getTrendColor(metrics.payback.trend)}`"
              >
                {{ metrics.payback.target }}
              </span>
            </div>
          </div>

          <div class="text-caption metric-subtitle q-mt-xs">
            {{ metrics.payback.subtitle }}
          </div>

          <q-linear-progress
            v-if="metrics.payback.progress !== undefined"
            :value="metrics.payback.progress / 100"
            color="primary"
            class="q-mt-sm"
            size="6px"
          />
        </q-card-section>
      </q-card>

      <q-card class="metric-card" flat>
        <q-card-section class="q-pa-md">
          <div class="row items-center no-wrap">
            <div class="col">
              <div class="text-caption text-weight-medium metric-title">Чистая прибыль</div>
            </div>
            <div class="col-auto">
              <q-icon name="account_balance" size="20px" color="green" />
            </div>
          </div>

          <div class="row items-end no-wrap q-mt-sm">
            <div class="col">
              <div class="text-h5 text-weight-bold metric-value">
                {{ formatCurrency(metrics.profit.value, metrics.profit.currency) }}
              </div>
            </div>
            <div class="col-auto">
              <q-icon name="arrow_upward" size="16px" color="positive" class="q-mr-xs" />
              <span class="text-caption text-weight-medium text-positive">
                {{ metrics.profit.growth }}
              </span>
            </div>
          </div>

          <div class="text-caption metric-subtitle q-mt-xs">
            {{ metrics.profit.period }}
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<style scoped>
.estate-metrics {
  margin: 20px 0;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(280px, 1fr));
  gap: 16px;
  align-items: stretch;
}
.metric-card {
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #ffffff;
  position: relative;
  overflow: hidden;
}
</style>
