export default defineNuxtPlugin(async () => {
  if (import.meta.server) {
    console.log('SSR: Skipping dictionaries initialization');
    return;
  }

  const dictionariesStore = useDictionariesStore();

  try {
    await nextTick();
    await dictionariesStore.initializeDictionaries();
    console.log('Dictionaries loaded successfully');
  } catch (error) {
    console.error('Failed to load dictionaries:', error);
    throw error;
  }
});
