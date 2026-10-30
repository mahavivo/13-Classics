(() => {
  'use strict';
  const key = 'thirteen-classics-reading-view';
  let view = {punct: true, pages: true};
  function read() {
    try { const saved = JSON.parse(localStorage.getItem(key) || '{}');
      for (const name of ['punct', 'pages']) if (typeof saved[name] === 'boolean') view[name] = saved[name];
    } catch (_) {}
  }
  function apply() {
    document.documentElement.classList.toggle('hide-punct', !view.punct);
    document.documentElement.classList.toggle('hide-pages', !view.pages);
    for (const name of ['punct', 'pages']) {
      const input = document.getElementById('show-' + name);
      if (input) input.checked = view[name];
    }
  }
  read(); apply();
  function ready() {
    for (const name of ['punct', 'pages']) {
      const input = document.getElementById('show-' + name);
      if (!input) continue;
      input.addEventListener('change', () => {
        view[name] = input.checked; apply();
        try { localStorage.setItem(key, JSON.stringify(view)); } catch (_) {}
      });
    }
    apply();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
  window.addEventListener('storage', event => { if (event.key === key) { read(); apply(); } });
})();
