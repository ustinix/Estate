export default defineEventHandler(async event => {
  const body = await readBody(event);
  const config = useRuntimeConfig(event);

  const apiSecret = config.apiSecret as string;
  const apiBaseUrl = config.apiBaseUrl as string;

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
