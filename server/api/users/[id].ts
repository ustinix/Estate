export default defineEventHandler(async event => {
  const config = useRuntimeConfig(event);
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  const apiBaseUrl = config.apiBaseUrl as string;
  const apiKey = config.apiKey as string;

  const response = await $fetch(`${apiBaseUrl}/users/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
    body: JSON.stringify(body),
  });

  return response;
});
