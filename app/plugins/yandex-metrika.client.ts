export default defineNuxtPlugin(nuxtApp => {
  if (import.meta.client) {
    const config = useRuntimeConfig();
    const counterId = config.public.yandexSecret;

    if (!counterId) {
      console.warn('Yandex Metrika ID не указан');
      return;
    }

    // Функция загрузки Яндекс.Метрики
    (function (m: any, e: any, t: any, r: any, i: any, k: any, a: any) {
      m[i] =
        m[i] ||
        function () {
          (m[i].a = m[i].a || []).push(arguments);
        };
      m[i].l = new Date().getTime();

      const scripts = document.scripts;
      for (let j = 0; j < scripts.length; j++) {
        const script = scripts[j];
        if (script && script.src === r) {
          return;
        }
      }

      k = e.createElement(t);
      a = e.getElementsByTagName(t)[0];
      k.async = 1;
      k.src = r;
      a.parentNode.insertBefore(k, a);
    })(
      window,
      document,
      'script',
      `https://mc.yandex.ru/metrika/tag.js?id=${counterId}`,
      'ym',
      undefined,
      undefined,
    );

    (window as any).ym(counterId, 'init', {
      ssr: true,
      webvisor: true,
      clickmap: true,
      ecommerce: 'dataLayer',
      accurateTrackBounce: true,
      trackLinks: true,
    });

    const noscript = document.createElement('noscript');
    const div = document.createElement('div');
    const img = document.createElement('img');

    img.src = `https://mc.yandex.ru/watch/${counterId}`;
    img.style.position = 'absolute';
    img.style.left = '-9999px';
    img.alt = '';

    div.appendChild(img);
    noscript.appendChild(div);
    document.body.appendChild(noscript);

    let lastUrl = window.location.href;

    nuxtApp.hook('page:finish', () => {
      setTimeout(() => {
        const currentUrl = window.location.href;

        if (currentUrl !== lastUrl && (window as any).ym) {
          lastUrl = currentUrl;
          (window as any).ym(counterId, 'hit', currentUrl);
        }
      }, 100);
    });
  }
});
