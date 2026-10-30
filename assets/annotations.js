(() => {
  'use strict';
  const text = document.getElementById('text');
  if (!text) return;
  const selector = '.collation-ref a[href^="#"]';
  const popup = document.createElement('div');
  popup.id = 'annotation-popup';
  popup.hidden = true;
  popup.setAttribute('role', 'tooltip');
  popup.setAttribute('aria-label', '校勘記');
  const content = document.createElement('div');
  content.className = 'annotation-content';
  popup.append(content);
  text.append(popup);
  let active = null, timer = null;

  function clearTimer() { clearTimeout(timer); }
  function close() {
    clearTimer();
    if (active) active.setAttribute('aria-expanded', 'false');
    active = null;
    popup.hidden = true;
  }
  function position() {
    if (!active || popup.hidden) return;
    const r = active.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) { close(); return; }
    const gap = 8, margin = 12;
    const width = popup.offsetWidth, height = popup.offsetHeight;
    const left = Math.max(margin, Math.min(r.left, window.innerWidth - width - margin));
    let top = r.bottom + gap;
    if (top + height > window.innerHeight - margin) top = r.top - height - gap;
    top = Math.max(margin, Math.min(top, window.innerHeight - height - margin));
    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;
  }
  function open(anchor) {
    const note = document.getElementById(anchor.getAttribute('href').slice(1));
    if (!note) return false;
    clearTimer();
    if (active !== anchor) {
      if (active) active.setAttribute('aria-expanded', 'false');
      const copy = note.cloneNode(true);
      copy.removeAttribute('id');
      copy.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
      copy.querySelectorAll('.navItems').forEach(n => n.remove());
      // The source separates the return marker from its note with a NBSP.
      // Trim that separator only in the popup copy, across nested elements.
      const walker = document.createTreeWalker(copy, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
      let leading;
      while ((leading = walker.nextNode())) {
        if (leading.nodeType === Node.ELEMENT_NODE && leading.matches('img,svg,math,br,hr')) break;
        if (leading.nodeType === Node.TEXT_NODE) {
          leading.textContent = leading.textContent.replace(/^[\s\u200B]+/u, '');
          if (leading.textContent) break;
        }
      }
      content.replaceChildren(...copy.childNodes);
      content.scrollTop = 0;
    }
    active = anchor;
    anchor.setAttribute('aria-controls', popup.id);
    anchor.setAttribute('aria-expanded', 'true');
    popup.hidden = false;
    position();
    return true;
  }
  function laterClose() {
    clearTimer();
    timer = setTimeout(close, 240);
  }
  function marker(target) {
    return target instanceof Element ? target.closest(selector) : null;
  }
  text.addEventListener('pointerover', e => {
    if (e.pointerType === 'touch') return;
    const anchor = marker(e.target);
    if (anchor && !anchor.contains(e.relatedTarget)) open(anchor);
  });
  text.addEventListener('pointerout', e => {
    const anchor = marker(e.target);
    if (anchor && !anchor.contains(e.relatedTarget) && !popup.contains(e.relatedTarget)) laterClose();
  });
  popup.addEventListener('pointerenter', clearTimer);
  popup.addEventListener('pointerleave', e => {
    if (!active || !active.contains(e.relatedTarget)) laterClose();
  });
  text.addEventListener('focusin', e => {
    const anchor = marker(e.target);
    if (anchor) open(anchor);
  });
  text.addEventListener('focusout', e => {
    if (popup.contains(e.relatedTarget) || active === e.relatedTarget) return;
    laterClose();
  });
  text.addEventListener('click', e => {
    const anchor = marker(e.target);
    if (!anchor) return;
    if (open(anchor)) e.preventDefault();
  });
  document.addEventListener('click', e => {
    if (!popup.contains(e.target) && !marker(e.target)) close();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && active) { e.preventDefault(); close(); }
  });
  window.addEventListener('resize', position);
  window.addEventListener('scroll', position, true);
})();
