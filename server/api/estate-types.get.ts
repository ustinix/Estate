import type { EstateType } from '~/types/estate.ts';

export default defineEventHandler(async event => {
  const config = useRuntimeConfig();

  const apiSecret = config.apiSecret as string;
  const apiBaseUrl = config.apiBaseUrl as string;

  try {
    const estateTypes: EstateType[] = await $fetch(`${apiBaseUrl}/estate-types`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiSecret,
      },
    });

    return estateTypes;
  } catch (error: any) {
    console.error('Get estate types error:', error);
    throw createError('Failed to fetch estate types');
  }
});
