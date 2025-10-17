import type { Estate } from '~/types/estate.ts';

export default defineEventHandler(async event => {
  const userId = getRouterParam(event, 'id');
  const config = useRuntimeConfig();

  const apiSecret = config.apiSecret as string;
  const apiBaseUrl = config.apiBaseUrl as string;

  if (!userId) {
    throw createError('User ID is required');
  }

  try {
    const estates: Estate[] = await $fetch(`${apiBaseUrl}/users/${userId}/estates`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiSecret,
      },
    });

    return estates;
  } catch (error: any) {
    console.error('Get user estates error:', error);
    throw createError('Failed to fetch user estates');
  }
});
