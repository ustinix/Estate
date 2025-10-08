import type { NavLink } from '~/types/navlink';

export const navLinks: NavLink[] = [
  { to: '/portfolio', text: 'Портфель', icon: 'work' },
  { to: '/calendar', text: 'События', icon: 'pending_actions' },
  { to: '/calculations', text: 'Расчеты', icon: 'percent' },
];

export const benefits = [
  {
    icon: 'analytics',
    title: 'Вся аналитика в реальном времени',
    description: 'Графики доходности, прогресс окупаемости, прогнозы',
  },
  {
    icon: 'event',
    title: 'Ничего не забыть',
    description: 'Календарь платежей: аренда, ипотека, коммунальные услуги',
  },
  {
    icon: 'apartment',
    title: 'Все объекты под контролем',
    description: 'Единый портфель с фильтрацией и статусами',
  },
];
