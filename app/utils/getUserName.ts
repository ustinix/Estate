export const getUserNameFromEmail = (email: string): string => {
  if (!email) return 'Пользователь';

  const username = email.split('@')[0] || '';
  const name = username.split('.')[0] || username;

  return name ? name.charAt(0).toUpperCase() + name.slice(1) : 'Пользователь';
};
