export default defineNuxtPlugin(async () => {
  const dictionariesStore = useDictionariesStore();

  try {
    await dictionariesStore.initializeDictionaries();
    console.log('Dictionaries loaded successfully');
  } catch (error) {
    console.error('Failed to load dictionaries:', error);
  }
});
