<script setup lang="ts">
import { formatCurrency } from '~/utils/formatCurrency';

interface Props {
  chartData: {
    categories: string[];
    series: {
      name: string;
      data: number[];
    }[];
  };
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
});

const isMounted = ref(false);
const VueApexCharts = shallowRef();

const chartOptions = computed(() => ({
  chart: {
    type: 'line' as const,
    height: 400,
    toolbar: {
      show: true,
      tools: {
        download: true,
        selection: false,
        zoom: false,
        zoomin: false,
        zoomout: false,
        pan: false,
        reset: false,
      },
    },
  },
  colors: ['#00E396', '#FF4560', '#FEB019', '#008FFB'],
  stroke: { curve: 'smooth' as const, width: 3 },
  markers: { size: 5 },
  xaxis: {
    categories: props.chartData.categories,
  },
  yaxis: {
    labels: {
      formatter: formatCurrency,
    },
  },
  legend: { position: 'top' as const },
  tooltip: {
    y: {
      formatter: formatCurrency,
    },
  },
}));

const hasData = computed(() => props.chartData.categories.length > 0);

onMounted(async () => {
  if (import.meta.client) {
    const module = await import('vue3-apexcharts');
    VueApexCharts.value = module.default;
    isMounted.value = true;
  }
});
</script>

<template>
  <ClientOnly>
    <div class="financial-chart">
      <div class="chart-header">
        <h3>Аналитика доходов</h3>
      </div>

      <div v-if="isLoading" class="chart-placeholder">
        <div class="loading-text">Загрузка данных...</div>
      </div>

      <div v-else-if="!hasData" class="chart-placeholder">
        <div class="no-data">
          <q-icon name="bar_chart" size="48px" color="grey" />
          <div class="no-data-text">Нет данных за выбранный период</div>
        </div>
      </div>

      <div v-else-if="isMounted && VueApexCharts && hasData" class="chart-container">
        <component
          :is="VueApexCharts"
          height="400"
          :options="chartOptions"
          :series="chartData.series"
        />
      </div>

      <div v-else class="chart-placeholder">
        <div class="loading-text">Загрузка графика...</div>
      </div>
    </div>

    <template #fallback>
      <div class="financial-chart">
        <div class="chart-header">
          <h3>Аналитика доходов</h3>
        </div>
        <div class="chart-placeholder">
          <div class="loading-text">Загрузка графика...</div>
        </div>
      </div>
    </template>
  </ClientOnly>
</template>

<style scoped>
.financial-chart {
  min-width: 800px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px var(--box-shadow);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.chart-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.chart-container {
  margin: 20px 0;
}

.chart-placeholder {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 8px;
}

.loading-text {
  color: #666;
  font-size: 1.1rem;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #555;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

.legend-color.income {
  background: #00e396;
}
.legend-color.expense {
  background: #ff4560;
}
.legend-color.balance {
  background: #feb019;
}
.legend-color.cumulative {
  background: #008ffb;
}

.financial-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 30px;
}

.summary-card {
  padding: 20px;
  border-radius: 8px;
  background: #f8f9fa;
  text-align: center;
  border-left: 4px solid #ddd;
}

.summary-card:nth-child(1) {
  border-left-color: #00e396;
}
.summary-card:nth-child(2) {
  border-left-color: #ff4560;
}
.summary-card:nth-child(3) {
  border-left-color: #008ffb;
}

.summary-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 1.3rem;
  font-weight: bold;
}

.summary-value.income {
  color: #00e396;
}
.summary-value.expense {
  color: #ff4560;
}
.summary-value.balance {
  color: #008ffb;
}

@media (max-width: 768px) {
  .financial-chart {
    padding: 15px;
  }

  .chart-header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }

  .chart-legend {
    gap: 15px;
  }

  .financial-summary {
    grid-template-columns: 1fr;
  }
}
</style>
