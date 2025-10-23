export const validateEmail = (val: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(val) || 'Пожалуйста, введите корректный email адрес';
};

export const validatePassword = (val: string) => {
  return (val && val.length >= 3) || 'Пароль должен содержать минимум 3 символа';
};

export const validateName = (val: string) => {
  return (val && val.length >= 3) || 'Имя должно содержать минимум 3 символа';
};

export const validatePhone = (val: string) => {
  return (val && val.length >= 10) || 'Телефон должен содержать 10 символов';
};
