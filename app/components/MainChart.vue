<script setup lang="ts">
import { ref, onMounted } from 'vue';

const isMounted = ref(false);
const VueApexCharts = ref();

onMounted(async () => {
  if (import.meta.client) {
    const module = await import('vue3-apexcharts');
    VueApexCharts.value = module.default;
    isMounted.value = true;
  }
});

// пока моковые для графика
const chartData = {
  categories: ['Мар 2024', 'Апр 2024', 'Май 2024', 'Июн 2024', 'Июл 2024', 'Авг 2024'],
  series: [
    { name: 'Доход', data: [80000, 120000, 150000, 130000, 140000, 90000] },
    { name: 'Расход', data: [40000, 60000, 75000, 65000, 70000, 45000] },
    { name: 'Месячный баланс', data: [40000, 60000, 75000, 65000, 70000, 45000] },
    { name: 'Накопительный баланс', data: [40000, 100000, 175000, 240000, 310000, 355000] },
  ],
};

const chartOptions = {
  chart: { type: 'line' as const, height: 400, toolbar: { show: true } },
  colors: ['#00E396', '#FF4560', '#FEB019', '#008FFB'],
  stroke: { curve: 'smooth' as const, width: 3 },
  markers: { size: 5 },
  xaxis: { categories: chartData.categories },
  yaxis: {
    labels: {
      formatter: (value: number) =>
        new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          minimumFractionDigits: 0,
        }).format(value),
    },
  },
  legend: { position: 'top' as const },
  tooltip: {
    y: {
      formatter: (value: number) =>
        new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          minimumFractionDigits: 0,
        }).format(value),
    },
  },
};
</script>
<template>
  <ClientOnly>
    <div class="financial-chart">
      <div class="chart-header">
        <h3>Аналитика доходов</h3>
        <div class="date-range">
          <span class="date-label">Период: 2024-03-15 - 2024-08-20</span>
        </div>
      </div>

      <div class="chart-container" v-if="isMounted && VueApexCharts">
        <component
          :is="VueApexCharts"
          type="line"
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

.date-range {
  color: #666;
  font-size: 0.9rem;
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
