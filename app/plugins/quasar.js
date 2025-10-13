import { Quasar } from 'quasar';

export default defineNuxtPlugin(() => {
  return {
    provide: {
      quasar: Quasar,
    },
  };
});
