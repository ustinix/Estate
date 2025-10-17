export default defineEventHandler(async event => {
  const config = useRuntimeConfig(event);
  const apiSecret = config.apiSecret as string;
  const apiBaseUrl = config.apiBaseUrl as string;

  const response = await $fetch(`${apiBaseUrl}/users`, {
    headers: {
      'X-API-Key': apiSecret,
    },
  });
  return response;
});
