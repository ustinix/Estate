import type { EstateRequest, Estate } from '~/types/estate.ts';

export default defineEventHandler(async event => {
  const body: EstateRequest = await readBody(event);
  const config = useRuntimeConfig();

  const apiSecret = config.apiSecret as string;
  const apiBaseUrl = config.apiBaseUrl as string;

  try {
    const response: Estate = await $fetch(`${apiBaseUrl}/estates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiSecret,
      },
      body: JSON.stringify(body),
    });

    return response;
  } catch (error: any) {
    console.error('Create estate error:', error);
    throw createError('Failed to create estate');
  }
});
