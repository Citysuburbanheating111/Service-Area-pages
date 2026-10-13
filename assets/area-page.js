/* City & Suburban area page (static): services tabs, sideways tracks, request form. */
(function () {
  // ── B2 service tabs (all panels are in the HTML; only the selected one shows) ──
  document.querySelectorAll('[data-tabs]').forEach(function (root) {
    var tabs = [].slice.call(root.querySelectorAll('[role="tab"]'));
    function select(i, focus) {
      tabs.forEach(function (t, n) {
        var on = n === i;
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i); });
      t.addEventListener('keydown', function (e) {
        var d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (e.key === 'Home') d = -i;
        if (e.key === 'End') d = tabs.length - 1 - i;
        if (d === undefined) return;
        e.preventDefault();
        select((i + d + tabs.length) % tabs.length, true);
      });
    });
  });

  // ── B4 reviews, B9 districts: sideways tracks with arrows and a progress bar ──
  document.querySelectorAll('[data-track]').forEach(function (wrap) {
    var track = wrap.querySelector('.cs-track');
    var prev = wrap.querySelector('[data-prev]');
    var next = wrap.querySelector('[data-next]');
    var thumb = wrap.querySelector('.cs-progress i');
    function step() {
      var card = track.firstElementChild;
      return card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : track.clientWidth;
    }
    function paint() {
      var max = track.scrollWidth - track.clientWidth;
      var fits = max <= 1;
      wrap.querySelector('.cs-track-ctl').hidden = fits;
      if (fits) return;
      thumb.style.width = (track.clientWidth / track.scrollWidth) * 100 + '%';
      thumb.style.marginLeft = (track.scrollLeft / track.scrollWidth) * 100 + '%';
      prev.disabled = track.scrollLeft <= 1;
      next.disabled = track.scrollLeft >= max - 1;
    }
    prev.addEventListener('click', function () { track.scrollBy({ left: -step() }); });
    next.addEventListener('click', function () { track.scrollBy({ left: step() }); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); track.scrollBy({ left: step() }); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); track.scrollBy({ left: -step() }); }
    });
    track.addEventListener('scroll', paint, { passive: true });
    window.addEventListener('resize', paint);
    if (document.fonts) document.fonts.ready.then(paint);
    paint();
  });

  // ── B1 request form: real fields and validation. Not connected to a backend yet. ──
  document.querySelectorAll('form[data-request]').forEach(function (form) {
    var msg = form.querySelector('.cs-form-msg');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var phone = form.elements.phone;
      var err = form.querySelector('#rq-phone-err');
      var digits = phone.value.replace(/\D/g, '');
      var ok = digits.length >= 10;
      phone.setAttribute('aria-invalid', !ok);
      err.hidden = ok;
      if (!ok) { phone.focus(); return; }
      msg.hidden = false;
      msg.focus();
    });
  });
})();
