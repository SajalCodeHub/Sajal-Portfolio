/* ═══════════════════════════════════════════════════════════════
   THEME.JS — Light / Dark Mode Toggle
   Sajal Bhattarai Portfolio · Stealth Authority 2026

   Responsibilities:
   - Read saved preference from localStorage on page load
   - Apply theme before first paint (no flash)
   - Toggle on button click with smooth CSS transition
   - Persist preference to localStorage
   - Update aria-pressed and icon on every state change
   - Respect prefers-color-scheme as the default when no
     saved preference exists
═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const STORAGE_KEY = 'sb-theme';
  const DARK = 'dark';
  const LIGHT = 'light';
  const TRANSITION_CLASS = 'theme-transitioning';
  const TRANSITION_DURATION = 320;

  const ICON = {
    sun: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
            viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="4"/>
            <line x1="12" y1="2"  x2="12" y2="4"/>
            <line x1="12" y1="20" x2="12" y2="22"/>
            <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="2"  y1="12" x2="4"  y2="12"/>
            <line x1="20" y1="12" x2="22" y2="12"/>
            <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36"/>
            <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>
          </svg>`,

    moon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
             viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
             aria-hidden="true" focusable="false">
             <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
           </svg>`
  };

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  }

  function safeHas(key) {
    try { return localStorage.getItem(key) != null; } catch (e) { return false; }
  }

  function getInitialTheme() {
    var saved = safeGet(STORAGE_KEY);
    if (saved === DARK || saved === LIGHT) return saved;

    var prefersDark = false;
    try {
      prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      prefersDark = false;
    }

    return prefersDark ? DARK : LIGHT;
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  function updateButton(btn, theme) {
    if (!btn) return;

    var isDark = theme === DARK;

    btn.setAttribute('aria-pressed', String(isDark));
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');

    btn.classList.add('is-switching');

    setTimeout(function () {
      btn.innerHTML = isDark ? ICON.sun : ICON.moon;
      btn.classList.remove('is-switching');
    }, 120);
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme') || DARK;
    var next = current === DARK ? LIGHT : DARK;

    document.documentElement.classList.add(TRANSITION_CLASS);

    applyTheme(next);
    safeSet(STORAGE_KEY, next);

    setTimeout(function () {
      document.documentElement.classList.remove(TRANSITION_CLASS);
    }, TRANSITION_DURATION);

    return next;
  }

  /* Step 1: Apply theme ASAP */
  var initialTheme = getInitialTheme();
  applyTheme(initialTheme);

  /* Step 2: Wire button after DOM ready */
  function init() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;

    var currentTheme = document.documentElement.getAttribute('data-theme') || DARK;

    btn.setAttribute('aria-pressed', String(currentTheme === DARK));
    btn.setAttribute('aria-label', currentTheme === DARK ? 'Switch to light mode' : 'Switch to dark mode');
    btn.innerHTML = currentTheme === DARK ? ICON.sun : ICON.moon;

    btn.addEventListener('click', function () {
      var next = toggleTheme();
      updateButton(btn, next);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Sync across tabs */
  window.addEventListener('storage', function (e) {
    if (e.key !== STORAGE_KEY) return;
    var newTheme = e.newValue;
    if (newTheme !== DARK && newTheme !== LIGHT) return;

    applyTheme(newTheme);

    var btn = document.getElementById('theme-toggle');
    updateButton(btn, newTheme);
  });

  /* Follow OS preference only when user has no saved preference */
  var mq;
  try {
    mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  } catch (e) {
    mq = null;
  }

  function onSystemChange(e) {
    if (safeHas(STORAGE_KEY)) return;
    var next = e && e.matches ? DARK : LIGHT;

    applyTheme(next);

    var btn = document.getElementById('theme-toggle');
    updateButton(btn, next);
  }

  if (mq) {
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onSystemChange);
    } else if (typeof mq.addListener === 'function') {
      mq.addListener(onSystemChange);
    }
  }

}());