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
})();
