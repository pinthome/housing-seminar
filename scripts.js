/* PINT HOME — seminar LP behaviors
 * - Open reserve modal on [data-modal] click
 * - Close on .reserve-close click / backdrop click / Esc (native dialog)
 */
(function () {
  'use strict';

  function openModalById(id) {
    var dlg = document.getElementById(id);
    if (dlg && typeof dlg.showModal === 'function') {
      dlg.showModal();
    }
  }

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-modal]');
    if (trigger) {
      e.preventDefault();
      openModalById(trigger.getAttribute('data-modal'));
      return;
    }
    var closeBtn = e.target.closest('.reserve-close');
    if (closeBtn) {
      var dlg = closeBtn.closest('dialog');
      if (dlg) dlg.close();
    }
  });

  // Click on backdrop closes the dialog
  document.querySelectorAll('dialog.reserve-modal').forEach(function (dlg) {
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg) dlg.close();
    });
  });

  /* ─── Counter animation for .stats numbers ─── */
  function animateCounter(el, target, duration) {
    var start = performance.now();
    function tick(now) {
      var t = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      el.textContent = Math.round(target * eased);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var counters = document.querySelectorAll('.stats-value .num[data-target]');
  if (counters.length) {
    var prefersReducedMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      counters.forEach(function (el) {
        el.textContent = el.getAttribute('data-target');
      });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var target = parseInt(el.getAttribute('data-target'), 10) || 0;
          animateCounter(el, target, 1500);
          io.unobserve(el);
        });
      }, { threshold: 0.4 });
      counters.forEach(function (el) { io.observe(el); });
    }
  }
})();
