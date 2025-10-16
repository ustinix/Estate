export default defineEventHandler(async event => {
  const config = useRuntimeConfig(event);
  const body = await readBody(event);
  const apiBaseUrl = config.apiBaseUrl as string;
  const apiKey = config.apiKey as string;

  const response = await $fetch(`${apiBaseUrl}/users/registration`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
    body: JSON.stringify(body),
  });
  return response;
});
