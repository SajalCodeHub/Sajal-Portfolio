/* ═══════════════════════════════════════════════════════════════
   MAIN.JS — Core Page Behaviour
   Sajal Bhattarai Portfolio · Stealth Authority 2026

   Responsibilities:
   1. Scroll reveal   — IntersectionObserver, staggered .reveal
   2. Nav scroll state — .is-scrolled shadow on header
   3. Mobile nav      — hamburger toggle, close on link click
   4. Filter nav      — projects.html category filtering
   5. Active nav link — highlight current section in nav
═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     UTILITY: run after DOM is ready
  ───────────────────────────────────────────── */
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  /* ─────────────────────────────────────────────
     UTILITY: debounce (preserves args + context)
  ───────────────────────────────────────────── */
  function debounce(fn, ms) {
    var t;
    return function () {
      var ctx = this;
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, ms);
    };
  }

  /* ─────────────────────────────────────────────
     UTILITY: prefers reduced motion
  ───────────────────────────────────────────── */
  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ─────────────────────────────────────────────
     UTILITY: focus management for soft-filtered cards
     Prevents keyboard tabbing into "disabled" cards.
  ───────────────────────────────────────────── */
  function setFocusable(root, enabled) {
    if (!root) return;

    var selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]'
    ].join(',');

    var nodes = root.querySelectorAll(selector);

    nodes.forEach(function (node) {
      if (enabled) {
        if (node.hasAttribute('data-prev-tabindex')) {
          var prev = node.getAttribute('data-prev-tabindex');
          node.removeAttribute('data-prev-tabindex');

          if (prev === '__none__') node.removeAttribute('tabindex');
          else node.setAttribute('tabindex', prev);
        } else if (node.getAttribute('tabindex') === '-1' && node.hasAttribute('data-filtered-tab')) {
          node.removeAttribute('data-filtered-tab');
          node.removeAttribute('tabindex');
        }
      } else {
        var hasTab = node.hasAttribute('tabindex');
        node.setAttribute('data-prev-tabindex', hasTab ? node.getAttribute('tabindex') : '__none__');
        node.setAttribute('tabindex', '-1');
        node.setAttribute('data-filtered-tab', 'true');
      }
    });
  }

  /* ═════════════════════════════════════════════
     1. SCROLL REVEAL
  ═════════════════════════════════════════════ */
  function initScrollReveal() {
    if (prefersReducedMotion()) return;

    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal, .reveal-fade, .reveal-left')
        .forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var targets = document.querySelectorAll('.reveal, .reveal-fade, .reveal-left');
    if (!targets.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;

        var delay = el.dataset.revealDelay || el.style.getPropertyValue('--reveal-delay') || '0ms';
        el.style.setProperty('--reveal-delay', delay);

        el.classList.add('is-visible');
        observer.unobserve(el);
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    targets.forEach(function (el) { observer.observe(el); });
  }

  function assignRevealClasses() {
    if (prefersReducedMotion()) return;

    var staggerGroups = [
      { selector: '#systems ul[aria-label="Featured projects"] > li', delay: 80 },
      { selector: '#case-studies ul[aria-label="Case studies"] > li', delay: 80 },
      { selector: '#writing ul[aria-label="Articles"] > li', delay: 80 },
      { selector: '#playbook dl > div', delay: 60 },
      { selector: '#certifications ul > li', delay: 60 },
      { selector: '#results li', delay: 50 },
      { selector: '#readiness-checklist li', delay: 50 },
      {
        selector:
          '#constraints dl > div, #design-decisions dl > div, ' +
          '#tradeoffs dl > div, #reliability dl > div, ' +
          '#performance dl > div, #data-flow dl > div, ' +
          '#spark-optimizations dl > div, #sql-optimizations dl > div, ' +
          '#data-quality dl > div, #evaluation dl > div',
        delay: 60
      },
      { selector: '#experience ol > li', delay: 80 },
      { selector: 'main section > h2', delay: 0 }
    ];

    staggerGroups.forEach(function (group) {
      var elements = document.querySelectorAll(group.selector);
      elements.forEach(function (el, i) {
        if (el.classList.contains('reveal') || el.classList.contains('reveal-fade') || el.classList.contains('reveal-left')) return;
        el.classList.add('reveal');
        var d = (i * group.delay) + 'ms';
        el.dataset.revealDelay = d;
        el.style.setProperty('--reveal-delay', d);
      });
    });
  }

  /* ═════════════════════════════════════════════
     2. NAV SCROLL STATE
  ═════════════════════════════════════════════ */
  function initNavScroll() {
    var header = document.querySelector('header[role="banner"]');
    if (!header) return;

    var THRESHOLD = 24;

    function update() {
      if (window.scrollY > THRESHOLD) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ═════════════════════════════════════════════
     3. MOBILE NAV TOGGLE
  ═════════════════════════════════════════════ */
  function initMobileNav() {
    var nav = document.querySelector('header nav[aria-label="Primary navigation"]');
    var list = nav && nav.querySelector('ul');
    if (!nav || !list) return;

    if (nav.querySelector('.nav-mobile-toggle')) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-mobile-toggle';
    btn.setAttribute('aria-label', 'Open navigation menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'nav-list');
    btn.innerHTML = getHamburgerIcon(false);

    list.id = list.id || 'nav-list';

    var themeToggle = document.getElementById('theme-toggle');
    if (themeToggle && themeToggle.parentNode === nav) {
      nav.insertBefore(btn, themeToggle);
    } else {
      nav.appendChild(btn);
    }

    var isOpen = false;
    var bodyOriginalPaddingRight = '';
    var scrollLocked = false;

    function lockScroll() {
      if (scrollLocked) return;
      scrollLocked = true;

      var scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      bodyOriginalPaddingRight = document.body.style.paddingRight || '';

      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = scrollBarWidth + 'px';
      }
      document.body.style.overflow = 'hidden';
    }

    function unlockScroll() {
      if (!scrollLocked) return;
      scrollLocked = false;

      document.body.style.overflow = '';
      document.body.style.paddingRight = bodyOriginalPaddingRight;
    }

    function open() {
      isOpen = true;
      list.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-label', 'Close navigation menu');
      btn.innerHTML = getHamburgerIcon(true);
      lockScroll();
    }

    function close() {
      isOpen = false;
      list.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Open navigation menu');
      btn.innerHTML = getHamburgerIcon(false);
      unlockScroll();
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      isOpen ? close() : open();
    });

    list.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { if (isOpen) close(); });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) {
        close();
        btn.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (isOpen && !nav.contains(e.target)) close();
    });

    window.addEventListener('resize', debounce(function () {
      if (window.innerWidth >= 768 && isOpen) close();
    }, 150));
  }

  function getHamburgerIcon(isClose) {
    if (isClose) {
      return (
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"' +
        ' viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
        ' stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' +
        ' aria-hidden="true" focusable="false">' +
        '<line x1="18" y1="6" x2="6" y2="18"/>' +
        '<line x1="6" y1="6" x2="18" y2="18"/>' +
        '</svg>'
      );
    }
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"' +
      ' viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
      ' stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' +
      ' aria-hidden="true" focusable="false">' +
      '<line x1="3" y1="6"  x2="21" y2="6"/>' +
      '<line x1="3" y1="12" x2="21" y2="12"/>' +
      '<line x1="3" y1="18" x2="21" y2="18"/>' +
      '</svg>'
    );
  }

  /* ═════════════════════════════════════════════
     4. FILTER NAV — projects.html
     Soft-filter visually, but also remove from tab order + SR.
  ═════════════════════════════════════════════ */
  function initFilterNav() {
    var filterNav = document.querySelector('nav[aria-label="Filter case studies by category"]');
    if (!filterNav) return;

    var buttons = filterNav.querySelectorAll('button[data-filter]');
    var cards = document.querySelectorAll('#case-studies li[data-category]');
    if (!buttons.length || !cards.length) return;

    var liveRegion = document.getElementById('filter-live-region');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'filter-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'visually-hidden';
      document.body.appendChild(liveRegion);
    }

    function setFilter(activeFilter) {
      buttons.forEach(function (btn) {
        var isActive = btn.dataset.filter === activeFilter;
        btn.setAttribute('aria-pressed', String(isActive));
      });

      cards.forEach(function (card) {
        var matches = (activeFilter === 'all' || card.dataset.category === activeFilter);

        if (matches) {
          card.style.opacity = '';
          card.style.transform = '';
          card.style.pointerEvents = '';
          card.style.transition = '';
          card.removeAttribute('aria-hidden');
          setFocusable(card, true);
        } else {
          card.style.opacity = '0.25';
          card.style.transform = 'scale(0.97)';
          card.style.pointerEvents = 'none';
          card.style.transition = prefersReducedMotion()
            ? 'none'
            : 'opacity 200ms ease, transform 200ms ease';

          card.setAttribute('aria-hidden', 'true');
          setFocusable(card, false);
        }
      });

      var visibleCount = (activeFilter === 'all')
        ? cards.length
        : document.querySelectorAll('#case-studies li[data-category="' + activeFilter + '"]').length;

      liveRegion.textContent =
        'Showing ' + visibleCount +
        ' case stud' + (visibleCount === 1 ? 'y' : 'ies') +
        (activeFilter !== 'all' ? ' in ' + activeFilter : '');
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () { setFilter(btn.dataset.filter); });
    });

    filterNav.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      var btns = Array.from(buttons);
      var idx = btns.indexOf(document.activeElement);
      if (idx === -1) return;
      e.preventDefault();
      var next = (e.key === 'ArrowRight')
        ? (idx + 1) % btns.length
        : (idx - 1 + btns.length) % btns.length;
      btns[next].focus();
    });
  }

  /* ═════════════════════════════════════════════
     5. ACTIVE NAV LINK — section highlighting
     Chooses the most prominent visible section to reduce flicker.
  ═════════════════════════════════════════════ */
  function initActiveNavLink() {
    var sections = document.querySelectorAll('main section[id]');
    if (!sections.length) return;

    var navLinks = document.querySelectorAll(
      'header nav ul a[href^="index.html#"], header nav ul a[href^="#"]'
    );
    if (!navLinks.length) return;

    if (!('IntersectionObserver' in window)) return;

    var visible = new Map();

    function pickBest() {
      var bestId = null;
      var bestScore = -Infinity;

      visible.forEach(function (meta, id) {
        if (!meta || !meta.entry || !meta.entry.isIntersecting) return;

        var ratio = meta.entry.intersectionRatio || 0;
        var top = meta.entry.boundingClientRect ? meta.entry.boundingClientRect.top : 0;

        var targetY = window.innerHeight * 0.35;
        var dist = Math.abs(top - targetY);

        var score = (ratio * 1000) - dist;
        if (score > bestScore) {
          bestScore = score;
          bestId = id;
        }
      });

      if (bestId) updateActiveLink(bestId);
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible.set(entry.target.id, { entry: entry });
      });
      pickBest();
    }, {
      rootMargin: '-20% 0px -55% 0px',
      threshold: [0, 0.08, 0.16, 0.24, 0.32, 0.4]
    });

    sections.forEach(function (s) { observer.observe(s); });

    function updateActiveLink(id) {
      navLinks.forEach(function (link) {
        if (link.getAttribute('aria-current') === 'page') return;

        var href = link.getAttribute('href') || '';
        var isMatch = (href === '#' + id) || (href === 'index.html#' + id);
        link.classList.toggle('is-active-section', isMatch);
      });
    }
  }

  /* ═════════════════════════════════════════════
     INIT
  ═════════════════════════════════════════════ */
  ready(function () {
    assignRevealClasses();
    initScrollReveal();
    initNavScroll();
    initMobileNav();
    initFilterNav();
    initActiveNavLink();
  });

}());