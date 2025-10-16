export default defineEventHandler(async event => {
  const body = await readBody(event);

  const { apiSecret, apiBaseUrl } = useRuntimeConfig(event);

  const response = await $fetch(`${apiBaseUrl}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiSecret,
    },
    body: JSON.stringify(body),
  });
  return response;
});
