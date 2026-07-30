(function registerTherapyServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  function showUpdateNotice() {
    if (document.getElementById('dtg-update-notice')) {
      return;
    }
    const isHebrew = document.documentElement.lang === 'he';
    const notice = document.createElement('div');
    notice.id = 'dtg-update-notice';
    notice.setAttribute('role', 'status');
    notice.style.cssText = 'position:fixed;inset-inline:16px;bottom:16px;z-index:10000;display:flex;align-items:center;justify-content:center;gap:12px;max-width:560px;margin:auto;padding:12px 16px;border:1px solid rgba(150,190,225,.4);border-radius:14px;background:#101b2d;color:#f6f8fb;box-shadow:0 12px 35px rgba(0,0,0,.4);font:600 14px system-ui,sans-serif';
    const text = document.createElement('span');
    text.textContent = isHebrew ? 'גרסה חדשה מוכנה.' : 'A new version is ready.';
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = isHebrew ? 'רענון' : 'Refresh';
    button.style.cssText = 'min-height:44px;padding:8px 16px;border:0;border-radius:999px;background:#f2c14e;color:#172033;font:700 14px system-ui,sans-serif;cursor:pointer';
    button.addEventListener('click', function () {
      window.location.reload();
    });
    notice.append(text, button);
    document.body.appendChild(notice);
  }

  window.addEventListener('load', function () {
    navigator.serviceWorker.register('./sw.js').then(function (registration) {
      registration.addEventListener('updatefound', function () {
        const worker = registration.installing;
        if (!worker) {
          return;
        }
        worker.addEventListener('statechange', function () {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateNotice();
          }
        });
      });
    }).catch(function (error) {
      console.warn('Offline support could not be enabled:', error);
    });
  });
})();
