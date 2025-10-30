import type { EstateMetrics } from '~/types/estateMetrics';

export const demoEstates = [
  {
    active: 1,
    description: 'Через дорогу от метро, сдается за 25 тыс.',
    estate_type_icon: 'garage',
    estate_type_id: 3,
    estate_type_name: 'Гараж',
    id: 1,
    name: 'Гараж, ст.м. Ветеранов',
    recoupment: 38,
    user_id: 4,
  },
  {
    active: 1,
    description: null,
    estate_type_icon: 'weekend',
    estate_type_id: 1,
    estate_type_name: 'Квартира',
    id: 2,
    name: 'Квартира на Невском 50кв',
    recoupment: 18,
    user_id: 4,
  },
  {
    active: 1,
    description: '33 кв.м',
    estate_type_icon: 'weekend',
    estate_type_id: 1,
    estate_type_name: 'Квартира',
    id: 6,
    name: 'Квартира студия на Парнасе',
    recoupment: 77,
    user_id: 4,
  },
  {
    active: 1,
    description: 'Таунхаус с участком 10 соток',
    estate_type_icon: 'home',
    estate_type_id: 2,
    estate_type_name: 'Дом',
    id: 8,
    name: 'Дом на Озерках',
    recoupment: 29,
    user_id: 4,
  },
  {
    active: 1,
    description: null,
    estate_type_icon: 'yard',
    estate_type_id: 4,
    estate_type_name: 'Земельный участок',
    id: 9,
    name: 'Участок 50 соток в Пушкине',
    recoupment: 14,
    user_id: 4,
  },
  {
    active: 1,
    description: null,
    estate_type_icon: 'apartment',
    estate_type_id: 7,
    estate_type_name: 'Аппартаменты',
    id: 11,
    name: 'Апартаменты 1',
    recoupment: 92,
    user_id: 4,
  },
  {
    active: 1,
    description: null,
    estate_type_icon: 'local_convenience_store',
    estate_type_id: 8,
    estate_type_name: 'Коммерческое помещение',
    id: 12,
    name: 'Коммерческое помещение в ЖК Этажи',
    recoupment: 95,
    user_id: 4,
  },
  {
    active: 1,
    description: 'Семейное место на 2 авто',
    estate_type_icon: 'emoji_transportation',
    estate_type_id: 9,
    estate_type_name: 'Парковочное место',
    id: 13,
    name: 'Паркинг в ЖК Панорама',
    recoupment: 100,
    user_id: 4,
  },
];

// Моковые данные для графика окупаемости
export const paybackData = {
  categories: ['Год 1', 'Год 2', 'Год 3', 'Год 4', 'Год 5', 'Год 6', 'Год 7'],
  series: [
    {
      name: 'Накопленный доход',
      data: [-5000000, -3500000, -1800000, 200000, 2500000, 5000000, 7800000],
    },
    {
      name: 'Ежегодный доход',
      data: [1500000, 1700000, 2000000, 2200000, 2500000, 2800000, 3000000],
    },
  ],
};

// Моковые данные для cравнения доходности по годам
export const profitabilityData = {
  categories: ['2023', '2024', '2025*', '2026*', '2027*'],
  series: [
    {
      name: 'Доход от аренды',
      data: [1200000, 1500000, 1800000, 2100000, 2400000],
    },
    {
      name: 'Расходы',
      data: [800000, 850000, 900000, 950000, 1000000],
    },
    {
      name: 'Чистая прибыль',
      data: [400000, 650000, 900000, 1150000, 1400000],
    },
  ],
};

//для круговой диаграммы
export const expensesData = {
  categories: ['Ипотека', 'Коммуналка', 'Налоги', 'Ремонт', 'Управление'],
  series: [45000, 15000, 8000, 12000, 5000],
};

export const estateMetrics: EstateMetrics = {
  roi: {
    value: 8.5,
    target: 7,
  },
  payback: {
    value: '3.5 года',
    target: '5 лет план',
    trend: 'down',
    subtitle: 'До полной окупаемости',
    progress: 70,
  },
  profit: {
    value: 65000,
    growth: '+15%',
    period: 'в месяц',
  },
};
