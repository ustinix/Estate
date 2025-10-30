<script setup lang="ts">
import { computed, ref, onMounted, shallowRef } from 'vue';

// Динамический импорт ApexCharts только на клиенте
const chartComponent = shallowRef<any>(null);

onMounted(async () => {
  // Импортируем только после монтирования на клиенте
  const { default: ApexChart } = await import('vue3-apexcharts');
  chartComponent.value = ApexChart;
});

// Типы
interface ChartSeries {
  name: string;
  data: number[];
}

interface PaybackData {
  categories: string[];
  series: ChartSeries[];
}

// Пропсы
const props = defineProps<{
  data: PaybackData;
}>();

// Проверка наличия валидных данных
const hasValidData = computed(() => {
  return (
    props.data &&
    Array.isArray(props.data.series) &&
    props.data.series.length > 0 &&
    Array.isArray(props.data.series[0]?.data) &&
    props.data.series[0].data.length > 0 &&
    Array.isArray(props.data.categories) &&
    props.data.categories.length > 0
  );
});

// Серии для графика с проверками
const chartSeries = computed(() => {
  if (!hasValidData.value) return [];
  return props.data.series.map(series => ({
    name: series.name || 'Без названия',
    data: series.data.map(value => value || 0),
  }));
});

// Опции графика
const chartOptions = computed(() => ({
  chart: {
    type: 'line',
    height: 400,
    zoom: { enabled: false },
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
    animations: { enabled: true },
  },
  colors: ['#00897b', '#ff9800'],
  stroke: {
    width: [3, 2],
    curve: 'smooth',
  },
  markers: {
    size: 5,
    hover: {
      size: 7,
    },
  },
  xaxis: {
    categories: hasValidData.value ? props.data.categories : [],
    title: {
      text: 'Период',
      style: {
        fontSize: '12px',
        color: '#666',
      },
    },
  },
  yaxis: {
    labels: {
      formatter: (value: number) => {
        if (value === null || value === undefined) return '0 ₽';
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M ₽`;
        if (value >= 1000) return `${(value / 1000).toFixed(0)}K ₽`;
        return `${value.toLocaleString('ru-RU')} ₽`;
      },
    },
  },
  legend: {
    position: 'top',
    horizontalAlign: 'center',
  },
  tooltip: {
    y: {
      formatter: (value: number) => {
        if (value === null || value === undefined) return '0 ₽';
        return `${value.toLocaleString('ru-RU')} ₽`;
      },
    },
  },
  grid: {
    borderColor: '#f1f1f1',
  },
  noData: {
    text: 'Нет данных для отображения',
    align: 'center',
    verticalAlign: 'middle',
    style: {
      color: '#999',
      fontSize: '14px',
    },
  },
}));

// Безопасное определение года окупаемости
const paybackYear = computed(() => {
  if (!hasValidData.value) return '—';

  const cumulativeData = props.data.series[0]?.data;

  if (!Array.isArray(cumulativeData) || cumulativeData.length === 0) {
    return '—';
  }

  for (let i = 0; i < cumulativeData.length; i++) {
    const value = cumulativeData[i];
    if (typeof value === 'number' && !isNaN(value) && value >= 0) {
      return i + 1;
    }
  }

  return cumulativeData.length;
});
</script>
<template>
  <div class="payback-chart">
    <div class="chart-header q-mb-md">
      <h5 class="text-h5 q-mb-xs">График окупаемости инвестиций</h5>
      <p class="text-caption text-grey-7">Динамика доходов и накопленной прибыли по годам</p>
    </div>

    <ClientOnly>
      <div v-if="chartComponent">
        <component
          :is="chartComponent"
          type="line"
          height="400"
          :options="chartOptions"
          :series="chartSeries"
        />
      </div>
      <div v-else class="text-center q-pa-lg">
        <q-spinner size="40px" color="primary" />
        <div class="q-mt-md">Загрузка графика...</div>
      </div>
    </ClientOnly>

    <div v-if="hasValidData" class="chart-info q-mt-md">
      <div class="row items-center justify-center">
        <q-icon name="info" color="primary" size="16px" class="q-mr-xs" />
        <span class="text-caption text-grey-7">
          Окупаемость наступит на {{ paybackYear }} году
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.payback-chart {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e0e0e0;
  margin: 20px 0;
}

.chart-header {
  text-align: center;
}

.chart-info {
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

@media (max-width: 768px) {
  .payback-chart {
    padding: 16px;
    margin: 16px 0;
  }
}
</style>
