export default defineEventHandler(async event => {
  const config = useRuntimeConfig(event);
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  const apiSecret = config.apiSecret as string;
  const apiBaseUrl = config.apiBaseUrl as string;

  const response = await $fetch(`${apiBaseUrl}/users/${id}/password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiSecret,
    },
    body: JSON.stringify(body),
  });

  return response;
});
