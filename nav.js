/* Arshan Frame — mobile navigation
 *
 * The markup already carried a .nav-toggle button on the homepage, but no
 * script was ever wired to it, so tapping it did nothing; on the three order
 * pages the button did not exist at all. Either way .nav-links is hidden
 * below the mobile breakpoint, which left Frames / How it works / FAQ
 * unreachable on every phone.
 *
 * This adds only the open/close behaviour. It reuses the existing
 * .nav-links element as the panel rather than introducing a second copy of
 * the links, so there is nothing to keep in sync and no existing markup,
 * ID or event hook is disturbed. Self-contained: no dependencies, and it
 * exits quietly on any page that has no toggle.
 */
(function () {
  'use strict';

  var toggle = document.querySelector('.nav-toggle');
  var panel = document.querySelector('.nav-links');
  if (!toggle || !panel) return;

  // Desktop shows the links inline and hides the button, so the open state
  // must be cleared on the way up or the panel styles linger.
  var MOBILE = window.matchMedia('(max-width:860px)');

  function isOpen() {
    return toggle.getAttribute('aria-expanded') === 'true';
  }

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.classList.toggle('is-open', open);
    panel.classList.toggle('is-open', open);
  }

  function close(refocus) {
    if (!isOpen()) return;
    setOpen(false);
    if (refocus) toggle.focus();
  }

  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    setOpen(!isOpen());
  });

  // Following a link should not leave the panel hanging open behind the
  // new page or over an in-page anchor target.
  panel.addEventListener('click', function (e) {
    if (e.target.closest('a')) close(false);
  });

  document.addEventListener('click', function (e) {
    if (!isOpen()) return;
    if (!panel.contains(e.target) && !toggle.contains(e.target)) close(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === 'Esc') close(true);
  });

  function syncToViewport(mq) {
    if (!mq.matches) close(false);
  }
  if (MOBILE.addEventListener) MOBILE.addEventListener('change', syncToViewport);
  else if (MOBILE.addListener) MOBILE.addListener(syncToViewport);
})();
