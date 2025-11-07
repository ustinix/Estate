export const formatCurrency = (amount: string) => {
  const number = parseFloat(amount);
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
  }).format(number);
};
