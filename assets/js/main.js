/* DSX Consulting - site behaviour (mobile menu, smooth scroll, legal modals) */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById('menu-toggle');
  var menu = document.getElementById('mobile-menu');
  var toggleLabel = document.getElementById('menu-toggle-label');

  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.classList.toggle('hidden', !open);
    if (toggleLabel) toggleLabel.textContent = open ? 'Close menu' : 'Open menu';
    var iconOpen = toggle.querySelector('.menu-icon-open');
    var iconClose = toggle.querySelector('.menu-icon-close');
    if (iconOpen) iconOpen.classList.toggle('hidden', open);
    if (iconClose) iconClose.classList.toggle('hidden', !open);
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 768) setMenu(false);
    });
  }

  /* ---------- Smooth scroll for in-page links ---------- */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute('href').slice(1);
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();
    setMenu(false);

    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    } else {
      target.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
    }

    // Move focus for keyboard and screen-reader users
    var focusTarget = id === 'top' ? document.getElementById('main') : target;
    if (focusTarget) {
      if (!focusTarget.hasAttribute('tabindex')) focusTarget.setAttribute('tabindex', '-1');
      focusTarget.focus({ preventScroll: true });
    }

    if (history.pushState) history.pushState(null, '', '#' + id);
  });

  /* ---------- Legal modals (<dialog>, Esc closes natively) ---------- */
  var lastOpener = null;

  function closeDialog(dialog) {
    if (dialog && dialog.open) dialog.close();
  }

  document.querySelectorAll('[data-open-modal]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var dialog = document.getElementById(btn.getAttribute('data-open-modal'));
      if (!dialog || typeof dialog.showModal !== 'function') return;
      lastOpener = btn;
      dialog.showModal();
      document.body.classList.add('modal-open');
      var body = dialog.querySelector('.legal-body');
      if (body) body.scrollTop = 0;
    });
  });

  document.querySelectorAll('dialog.legal-modal').forEach(function (dialog) {
    dialog.querySelectorAll('[data-close-modal]').forEach(function (btn) {
      btn.addEventListener('click', function () { closeDialog(dialog); });
    });

    // Click on the backdrop closes the dialog
    dialog.addEventListener('click', function (e) {
      if (e.target !== dialog) return;
      var r = dialog.getBoundingClientRect();
      var inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside) closeDialog(dialog);
    });

    dialog.addEventListener('close', function () {
      document.body.classList.remove('modal-open');
      if (lastOpener) {
        lastOpener.focus();
        lastOpener = null;
      }
    });
  });

  /* ---------- Footer year ---------- */
  var year = String(new Date().getFullYear());
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = year;
  });
})();
