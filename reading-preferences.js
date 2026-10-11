(function () {
  const storageKey = 'dtg_reading_scale_v1';
  const scales = [100, 112, 125];
  const root = document.documentElement;
  const controls = document.querySelector('[data-reading-controls]');
  if (!controls) return;

  const decrease = controls.querySelector('[data-reading-decrease]');
  const reset = controls.querySelector('[data-reading-reset]');
  const increase = controls.querySelector('[data-reading-increase]');
  const status = controls.querySelector('[data-reading-status]');
  let scale = 100;

  try {
    const saved = Number(localStorage.getItem(storageKey));
    if (scales.includes(saved)) scale = saved;
  } catch (_) {
    // Text controls still work when browser storage is unavailable.
  }

  function label(key, lang) {
    return controls.getAttribute('data-' + key + '-' + lang) || controls.getAttribute('data-' + key + '-en');
  }

  function render() {
    const lang = root.lang === 'he' ? 'he' : 'en';
    const index = scales.indexOf(scale);
    root.style.fontSize = scale + '%';
    decrease.disabled = index === 0;
    increase.disabled = index === scales.length - 1;
    decrease.setAttribute('aria-label', label('decrease', lang));
    increase.setAttribute('aria-label', label('increase', lang));
    reset.setAttribute('aria-label', label('reset', lang));
    controls.setAttribute('aria-label', label('group', lang));
    controls.setAttribute('role', 'group');
    status.textContent = label('status', lang) + ': ' + scale + '%';
  }

  function save() {
    try {
      localStorage.setItem(storageKey, String(scale));
    } catch (_) {
      // Keep the current page preference even if it cannot be persisted.
    }
    render();
  }

  decrease.addEventListener('click', function () {
    const index = scales.indexOf(scale);
    if (index > 0) {
      scale = scales[index - 1];
      save();
    }
  });
  increase.addEventListener('click', function () {
    const index = scales.indexOf(scale);
    if (index < scales.length - 1) {
      scale = scales[index + 1];
      save();
    }
  });
  reset.addEventListener('click', function () {
    scale = 100;
    save();
  });

  new MutationObserver(render).observe(root, { attributes: true, attributeFilter: ['lang'] });
  render();
})();
