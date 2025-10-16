export default defineEventHandler(async event => {
  const config = useRuntimeConfig(event);
  const apiBaseUrl = config.apiBaseUrl as string;
  const apiKey = config.apiKey as string;

  const response = await $fetch(`${apiBaseUrl}/users`, {
    headers: {
      'X-API-Key': apiKey,
    },
  });
  return response;
});
