<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { formatCurrency } from '~/utils/formatCurrency';

const isMounted = ref(false);
const VueApexCharts = ref();
const isLoading = ref(false);

const startDate = ref('2025-03-01');
const endDate = ref('2025-08-31');

// пока моковые для графика
const allChartData = {
  categories: [
    'Янв 2025',
    'Фев 2025',
    'Мар 2025',
    'Апр 2025',
    'Май 2025',
    'Июн 2025',
    'Июл 2025',
    'Авг 2025',
  ],
  series: [
    { name: 'Доход', data: [70000, 75000, 80000, 120000, 150000, 130000, 140000, 90000] },
    { name: 'Расход', data: [35000, 40000, 40000, 60000, 75000, 65000, 70000, 45000] },
    { name: 'Месячный баланс', data: [35000, 35000, 40000, 60000, 75000, 65000, 70000, 45000] },
    {
      name: 'Накопительный баланс',
      data: [35000, 70000, 110000, 170000, 245000, 310000, 380000, 425000],
    },
  ],
};

const monthToDateMap: Record<string, string> = {
  'Янв 2025': '2025-01-01',
  'Фев 2025': '2025-02-01',
  'Мар 2025': '2025-03-01',
  'Апр 2025': '2025-04-01',
  'Май 2025': '2025-05-01',
  'Июн 2025': '2025-06-01',
  'Июл 2025': '2025-07-01',
  'Авг 2025': '2025-08-01',
};

const getDateForCategory = (category: string): Date | null => {
  const dateStr = monthToDateMap[category];
  return dateStr ? new Date(dateStr) : null;
};

const filteredChartData = computed(() => {
  const start = new Date(startDate.value);
  const end = new Date(endDate.value);

  const filteredIndices = allChartData.categories
    .map((category, index) => ({ category, index, date: getDateForCategory(category) }))
    .filter(({ date }) => {
      return date && date >= start && date <= end;
    });

  if (filteredIndices.length === 0) {
    return {
      categories: [],
      series: allChartData.series.map(s => ({ ...s, data: [] })),
    };
  }

  return {
    categories: filteredIndices.map(item => item.category),
    series: allChartData.series.map(series => ({
      ...series,
      data: filteredIndices.map(item => series.data[item.index]),
    })),
  };
});

// Проверяем есть ли данные для выбранного периода
const hasData = computed(() => filteredChartData.value.categories.length > 0);

// Обработчик изменения дат (будет делать запрос к API)
const handleDateChange = async () => {
  isLoading.value = true;

  // В реальном приложении здесь будет запрос к API:
  // const response = await $fetch('/api/financial-stats', {
  //   params: {
  //     start_date: startDate.value,
  //     end_date: endDate.value
  //   }
  // });
  // allChartData = response.data;

  // Имитация загрузки
  await new Promise(resolve => setTimeout(resolve, 500));
  isLoading.value = false;
};

const chartOptions = {
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
  xaxis: { categories: filteredChartData.value.categories },
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
};

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
        <div class="date-controls">
          <div class="date-input-group">
            <label for="start-date">С:</label>
            <input
              id="start-date"
              type="date"
              v-model="startDate"
              @change="handleDateChange"
              class="date-input"
              :max="endDate"
            />
          </div>
          <div class="date-input-group">
            <label for="end-date">По:</label>
            <input
              id="end-date"
              type="date"
              v-model="endDate"
              @change="handleDateChange"
              class="date-input"
              :min="startDate"
            />
          </div>
        </div>
      </div>

      <!-- Состояние загрузки -->
      <div v-if="isLoading" class="chart-placeholder">
        <div class="loading-text">Загрузка данных...</div>
      </div>

      <!-- Нет данных -->
      <div v-else-if="!hasData" class="chart-placeholder">
        <div class="no-data">
          <q-icon name="bar_chart" size="48px" color="grey" />
          <div class="no-data-text">Нет данных за выбранный период</div>
          <div class="no-data-hint">Попробуйте выбрать другой период</div>
        </div>
      </div>

      <!-- Есть данные и график готов -->
      <div v-else-if="isMounted && VueApexCharts && hasData" class="chart-container">
        <component
          :is="VueApexCharts"
          height="400"
          :options="chartOptions"
          :series="filteredChartData.series"
        />
      </div>

      <!-- Загрузка графика -->
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
