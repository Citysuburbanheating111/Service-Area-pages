/* Area pages: make the sideways card tracks (B4 reviews, B9 districts) scrollable.
   The Paper export clips them (overflow: clip), so cards past the edge can't be reached.
   This finds every clipped row that overflows, turns it into a scroller (trackpad, touch,
   keyboard, mouse drag), snaps cards into place and drives the navy progress bar under it. */
(function () {
  var frame = document.getElementById('frame');
  if (!frame) return;

  var style = document.createElement('style');
  style.textContent =
    '.cs-track{overflow-x:auto!important;scroll-snap-type:x mandatory;scrollbar-width:none;overscroll-behavior-x:contain;cursor:grab;outline:none}' +
    '.cs-track::-webkit-scrollbar{display:none}' +
    '.cs-track>*{scroll-snap-align:start}' +
    '.cs-track.dragging{cursor:grabbing;scroll-snap-type:none;user-select:none}' +
    '.cs-track:focus-visible{box-shadow:0 0 0 3px #186AA4;border-radius:24px}' +
    '@media (prefers-reduced-motion:no-preference){.cs-track{scroll-behavior:smooth}.cs-track.dragging{scroll-behavior:auto}}' +
    '.cs-bar>*{transition:width .12s linear,margin-left .12s linear}';
  document.head.appendChild(style);

  var zoom = function () { return parseFloat(frame.style.zoom) || 1; };

  [].forEach.call(frame.querySelectorAll('div'), function (el) {
    var cs = getComputedStyle(el);
    if (cs.overflowX !== 'clip' || cs.display !== 'flex' || cs.flexDirection !== 'row') return;
    if (el.scrollWidth <= el.clientWidth + 1) return;
    setUp(el);
  });

  function setUp(track) {
    track.classList.add('cs-track');
    track.tabIndex = 0;
    track.setAttribute('role', 'region');
    var head = track.parentElement.querySelector('div[style*="font-size:44px"]');
    track.setAttribute('aria-label', (head ? head.textContent.trim() + ': ' : '') + 'scroll sideways for more');

    // Progress bar: the 6px rail right after the track
    var rail = track.nextElementSibling;
    var thumb = rail && rail.offsetHeight <= 8 && rail.children.length === 1 ? rail.firstElementChild : null;
    if (thumb) rail.classList.add('cs-bar');
    function paint() {
      if (!thumb) return;
      var visible = track.clientWidth / track.scrollWidth;
      var start = track.scrollLeft / track.scrollWidth;
      thumb.style.width = (visible * 100) + '%';
      thumb.style.marginLeft = (start * 100) + '%';
    }
    track.addEventListener('scroll', paint, { passive: true });
    window.addEventListener('resize', paint);
    paint();

    // Mouse drag (touch and trackpads scroll natively)
    var down = false, startX = 0, startLeft = 0, moved = false;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = (e.clientX - startX) / zoom();
      if (!moved && Math.abs(dx) > 4) { moved = true; track.classList.add('dragging'); }
      if (moved) track.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      if (!moved) return;
      // Settle on a card ourselves (in the drag direction), then hand snapping back to the browser.
      // Re-enabling snap first would jump back to the card that was snapped before the drag.
      var max = track.scrollWidth - track.clientWidth;
      var origin = track.getBoundingClientRect().left;
      var stops = [].map.call(track.children, function (c) {
        return Math.min(max, (c.getBoundingClientRect().left - origin) / zoom() + track.scrollLeft);
      });
      var forward = track.scrollLeft > startLeft;
      var target = forward
        ? stops.filter(function (s) { return s >= track.scrollLeft - 1; })[0]
        : stops.filter(function (s) { return s <= track.scrollLeft + 1; }).pop();
      if (target === undefined) target = forward ? max : 0;
      track.scrollTo({ left: target, behavior: 'smooth' });
      setTimeout(function () { track.classList.remove('dragging'); }, 450);
    });
    // A drag shouldn't count as a click on a link inside a card
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);

    // Arrow keys move one card at a time
    track.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      var card = track.firstElementChild;
      var step = card ? card.getBoundingClientRect().width / zoom() + parseFloat(getComputedStyle(track).columnGap || 0) : track.clientWidth;
      track.scrollBy({ left: e.key === 'ArrowRight' ? step : -step });
    });
  }
})();
