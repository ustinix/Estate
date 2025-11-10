<script setup lang="ts">
import { createYAxisFormatter, createTooltipFormatter } from '~/utils/formatCurrency';

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
      formatter: createYAxisFormatter(props.chartData.series),
    },
  },
  legend: { position: 'top' as const },
  tooltip: {
    y: {
      formatter: createTooltipFormatter(props.chartData.series),
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
        <h3>Аналитика доходов (пока тестовые данные)</h3>
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
@media (max-width: 1024px) {
  .financial-chart {
    min-width: 600px;
    max-width: 900px;
  }

  .chart-header h3 {
    font-size: 1.3rem;
  }

  .chart-container {
    margin: 16px 0;
  }
}

@media (max-width: 768px) {
  .financial-chart {
    min-width: 500px;
    max-width: 700px;
  }

  .chart-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
    margin-bottom: 16px;
  }

  .chart-header h3 {
    font-size: 1.2rem;
  }

  .chart-container {
    margin: 12px 0;
  }

  .chart-placeholder {
    height: 350px;
  }

  .chart-legend {
    gap: 20px;
    margin: 16px 0;
  }

  .legend-item {
    font-size: 0.85rem;
  }

  .financial-summary {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-top: 20px;
  }

  .summary-card {
    padding: 16px;
  }

  .summary-value {
    font-size: 1.2rem;
  }
}

@media (max-width: 600px) {
  .financial-chart {
    min-width: 300px;
    max-width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .chart-header {
    gap: 8px;
    margin-bottom: 12px;
    min-width: 500px;
  }

  .chart-header h3 {
    font-size: 1.1rem;
    text-align: center;
  }

  .chart-container {
    margin: 10px 0;
    min-width: 500px;
  }

  .chart-placeholder {
    height: 300px;
    min-width: 500px;
  }

  .chart-legend {
    flex-direction: column;
    gap: 12px;
    align-items: center;
    margin: 12px 0;
    min-width: 500px;
  }

  .legend-item {
    font-size: 0.8rem;
  }

  .loading-text {
    font-size: 1rem;
  }

  .no-data-text {
    font-size: 0.9rem;
    text-align: center;
  }
}
</style>
