import type { ChartData } from '~/types/transactions';

export const formatCurrency = (amount: string, name?: string) => {
  const number = parseFloat(amount);
  if (name === 'Roi') {
    return new Intl.NumberFormat('ru-RU', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number / 100);
  }
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
  }).format(number);
};

export const formatChartData = (data: ChartData): ChartData => {
  const formattedSeries = data.series.map(series => {
    if (series.name.toLowerCase().includes('roi')) {
      return {
        ...series,
        data: series.data.map(value => value / 100),
        name: series.name,
      };
    }
    return series;
  });

  return {
    ...data,
    series: formattedSeries,
  };
};

export const createYAxisFormatter =
  (series: { name: string; data: number[] }[]) =>
  (value: number, { seriesIndex }: { seriesIndex: number }) => {
    const seriesName = series[seriesIndex]?.name.toLowerCase() || '';

    if (seriesName.includes('roi')) {
      return new Intl.NumberFormat('ru-RU', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    }

    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(value);
  };

export const createTooltipFormatter =
  (series: { name: string; data: number[] }[]) =>
  (value: number, { seriesIndex }: { seriesIndex: number }) => {
    const seriesName = series[seriesIndex]?.name.toLowerCase() || '';

    if (seriesName.includes('roi')) {
      return new Intl.NumberFormat('ru-RU', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    }

    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(value);
  };
