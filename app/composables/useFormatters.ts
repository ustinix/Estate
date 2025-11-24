import type { ChartData } from '~/types/transactions';

export const useFormatters = () => {
  const formatNumber = (value: number | string): string => {
    const num = typeof value === 'string' ? parseFloat(value.replace(/\s/g, '')) : value;
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('ru-RU').format(Math.round(num));
  };

  const formatCurrency = (value: number | string): string => {
    const formatted = formatNumber(value);
    return formatted ? `${formatted} ₽` : '';
  };

  const formatPercent = (value: number | string): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '';
    return `${num.toFixed(1)}%`;
  };
  const formatCurrencyForChart = (amount: string, name?: string) => {
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

  const formatChartData = (data: ChartData): ChartData => {
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

  const createYAxisFormatter =
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

  const createTooltipFormatter =
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const formatPhone = (phone: string | number | null | undefined): string => {
    if (!phone) return '';

    const phoneString = phone.toString();
    const digitsOnly = phoneString.replace(/\D/g, '');

    return digitsOnly;
  };

  return {
    formatNumber,
    formatCurrency,
    formatPercent,

    formatCurrencyForChart,
    formatChartData,
    createYAxisFormatter,
    createTooltipFormatter,

    formatDate,
    formatPhone,
  };
};
