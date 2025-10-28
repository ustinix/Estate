import type { TransactionType } from '~/types/dictionaries';

export const transactionTypes = ref<TransactionType[]>([
  { id: 1, name: 'Арендный доход', direction: 1, regularity: 1 },
  { id: 2, name: 'Продажа недвижимости', direction: 1, regularity: 0 },
  { id: 3, name: 'Ипотека', direction: 0, regularity: 1 },
  { id: 4, name: 'Коммунальные платежи', direction: 0, regularity: 1 },
  { id: 5, name: 'Ремонт', direction: 0, regularity: 0 },
  { id: 6, name: 'Налоги', direction: 0, regularity: 1 },
  { id: 7, name: 'Страхование', direction: 0, regularity: 1 },
]);

export const repaymentPlans = [
  {
    id: 1,
    name: 'Аннуитетный',
  },
  {
    id: 2,
    name: 'Дифференцированный',
  },
];

export const transactionFrequencies = [
  {
    id: 5,
    name: 'Год',
  },
  {
    id: 1,
    name: 'День',
  },
  {
    id: 4,
    name: 'Квартал',
  },
  {
    id: 3,
    name: 'Месяц',
  },
  {
    id: 2,
    name: 'Неделя',
  },
];

export const transactionOptions = [
  { label: 'Доход', value: 1 },
  { label: 'Расход', value: 0 },
];
export const regularityOptions = [
  { label: 'Регулярный', value: 1 },
  { label: 'Разовый', value: 0 },
];
