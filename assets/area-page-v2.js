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
    // Counter, dots and arrows follow the selected step, set directly on click (scroll events can lag)
    function setActive(i) {
      current = i;
      count.textContent = String(i + 1).padStart(2, '0');
      dots.forEach(function (d, n) { if (n === i) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current'); });
      prev.disabled = i === 0;
      next.disabled = i === last;
    }
    function go(i) {
      i = Math.max(0, Math.min(last, i));
      setActive(i);
      lock = Date.now() + 700; // ignore the scroll events this programmatic scroll causes
      track.scrollTo({ left: cards[i].offsetLeft - cards[0].offsetLeft });
    }
    // Manual swipes and trackpad scrolls: pick the step nearest the left edge
    function paint() {
      if (Date.now() < lock) return;
      var left = track.scrollLeft, best = 0, max = track.scrollWidth - track.clientWidth;
      cards.forEach(function (c, n) {
        if (Math.abs(c.offsetLeft - cards[0].offsetLeft - left) < Math.abs(cards[best].offsetLeft - cards[0].offsetLeft - left)) best = n;
      });
      if (max > 0 && left >= max - 2 && best < current) best = current; // at the end, keep a later step the user chose
      setActive(best);
    }
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
