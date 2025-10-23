export function formatPhone(phone: string | number | null | undefined): string {
  if (!phone) return '';

  const phoneString = phone.toString();
  const digitsOnly = phoneString.replace(/\D/g, '');

  return digitsOnly;
}
