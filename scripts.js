/* PINT HOME — seminar LP behaviors
 * - Open reserve modal on [data-modal] click
 * - Close on .reserve-close click / backdrop click / Esc (native dialog)
 * - Stats counter animation
 * - Sticky header scroll-state toggle
 */
(function () {
  'use strict';

  /* ─── Sticky header: toggle .scrolled after some scroll ─── */
  var header = document.getElementById('site-header');
  if (header) {
    var setScrolled = function () {
      if (window.scrollY > 4) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    setScrolled();
    window.addEventListener('scroll', setScrolled, { passive: true });
  }

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

  /* ─── Scroll-in animations ─── */
  var prefersReducedMotionScroll =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotionScroll && 'IntersectionObserver' in window) {
    // Single-element fade-up
    var animSelectors = [
      '.section-title',
      '.sec-label',
      '.section-lead',
      '.story p',
      '.seminar',
      '.speaker-card',
      '.bonus-box',
      '.info-card',
      '.movie-item',
      '.final-cta-grid > *',
      '.cta-date',
      'details.q'
    ];
    document.querySelectorAll(animSelectors.join(',')).forEach(function (el) {
      el.classList.add('anim');
    });

    // Stagger groups: add class to parent that has child elements to reveal
    var staggerSelectors = ['.why-grid', '.voice-list', '.cta-dates'];
    document.querySelectorAll(staggerSelectors.join(',')).forEach(function (el) {
      el.classList.add('anim-stagger');
    });

    var animIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        animIO.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });

    document.querySelectorAll('.anim, .anim-stagger').forEach(function (el) {
      animIO.observe(el);
    });
  }

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
