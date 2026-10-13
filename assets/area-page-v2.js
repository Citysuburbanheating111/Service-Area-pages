/* City & Suburban area page, v2 layout: building selector, process track, review "Read more".
   Runs alongside assets/area-page.js (service tabs, request form). */
(function () {
  // ── Building selector: cards act as tabs; every detail panel is in the HTML ──
  document.querySelectorAll('[data-pick]').forEach(function (root) {
    var picks = [].slice.call(root.querySelectorAll('[role="tab"]'));
    function select(i, focus) {
      picks.forEach(function (p, n) {
        var on = n === i;
        p.setAttribute('aria-selected', on);
        p.tabIndex = on ? 0 : -1;
        document.getElementById(p.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) picks[i].focus();
    }
    picks.forEach(function (p, i) {
      p.addEventListener('click', function () { select(i); });
      p.addEventListener('keydown', function (e) {
        var d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (e.key === 'Home') d = -i;
        if (e.key === 'End') d = picks.length - 1 - i;
        if (d === undefined) return;
        e.preventDefault();
        select((i + d + picks.length) % picks.length, true);
      });
    });
  });

  // ── Process track: counter, step dots and arrows follow the scroll position ──
  document.querySelectorAll('[data-steps]').forEach(function (wrap) {
    var track = wrap.querySelector('.v2-steps');
    var cards = [].slice.call(track.children);
    var dots = [].slice.call(wrap.querySelectorAll('.dot'));
    var count = wrap.querySelector('.count b');
    var prev = wrap.querySelector('[data-prev]');
    var next = wrap.querySelector('[data-next]');
    var current = 0, last = cards.length - 1, lock = 0;

    // Scroll position for each step. A card that can reach the left edge gets its own position.
    // The last cards can't (the track stops when the final card meets the right edge), so the
    // remaining scroll distance is shared out between them. Scrolling to the end is always the
    // last step, and every step can be reached by scrolling, a dot or an arrow.
    function positions() {
      var max = track.scrollWidth - track.clientWidth, base = cards[0].offsetLeft;
      if (max < 1) return cards.map(function () { return 0; }); // everything fits: no scrolling
      var p = cards.map(function (c) { return c.offsetLeft - base; });
      var j = 1;
      while (j <= last && p[j] < max) j++; // first step whose card can't reach the left edge
      if (j > last) return p;
      var from = p[j - 1];
      for (var k = j; k <= last; k++) p[k] = from + (max - from) * (k - j + 1) / (last - j + 1);
      return p;
    }

    // Counter, dots, arrows and the highlighted card follow the current step
    function setActive(i) {
      current = i;
      count.textContent = String(i + 1).padStart(2, '0');
      dots.forEach(function (d, n) { if (n === i) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current'); });
      cards.forEach(function (c, n) { c.classList.toggle('is-active', n === i); });
      prev.disabled = i === 0;
      next.disabled = i === last;
    }
    function go(i) {
      i = Math.max(0, Math.min(last, i));
      setActive(i); // set straight away: scroll events can lag behind a click
      lock = Date.now() + 900;
      track.scrollTo({ left: positions()[i] });
    }
    // Swipes, trackpads and drags: the step whose position is nearest the current scroll
    function paint() {
      if (Date.now() < lock) return;
      var left = track.scrollLeft, p = positions(), best = 0;
      p.forEach(function (v, n) { if (Math.abs(v - left) < Math.abs(p[best] - left)) best = n; });
      setActive(best);
    }
    track.addEventListener('scrollend', function () { lock = 0; paint(); });
    dots.forEach(function (d) { d.addEventListener('click', function () { go(+d.dataset.go); }); });
    prev.addEventListener('click', function () { go(current - 1); });
    next.addEventListener('click', function () { go(current + 1); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1); }
    });
    track.addEventListener('scroll', paint, { passive: true });
    window.addEventListener('resize', paint);
    paint();
  });

  // ── Reviews: full text is in the HTML, clamped to 5 lines with a toggle ──
  document.querySelectorAll('.v2-more').forEach(function (btn) {
    var quote = document.getElementById(btn.getAttribute('aria-controls'));
    function check() { btn.hidden = btn.getAttribute('aria-expanded') !== 'true' && quote.scrollHeight <= quote.clientHeight + 1; }
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !open);
      quote.classList.toggle('clamp', open);
      btn.textContent = open ? 'Read more' : 'Show less';
    });
    if (document.fonts) document.fonts.ready.then(check);
    window.addEventListener('resize', check);
    check();
  });
})();
