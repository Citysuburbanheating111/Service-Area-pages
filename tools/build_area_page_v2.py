#!/usr/bin/env python3
"""Build the v2 City & Suburban service area page (Highlights-style layout, C&S design system).

Usage:
  python tools/build_area_page_v2.py web/content/areas/west-loop.json

Same content file and data as v1 (tools/build_area_page.py), laid out like the Highlights Chicago
reference page: photo hero with a two-step form, a building selector, a numbered checklist beside a
tall photo, an accordion beside a photo, a navy credentials band, a Google reviews card with a map,
a step-by-step process track, a navy areas band with a map, a numbered FAQ and a "next step" band.

Design system is unchanged: assets/area-page.css (tokens, buttons, type, services tabs) plus
assets/area-page-v2.css (the new layouts only). Behaviour: assets/area-page.js + assets/area-page-v2.js.
Writes services-v2/service-areas/<slug>/index.html.
"""
import html, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import build_area_page as v1  # noqa: E402  (shared data: services, steps, questions, companies, names)

UP = '../../../'
A = UP + 'assets/'
LIVE, PHONE, TEL = v1.LIVE, v1.PHONE, v1.TEL
GMAPS = ('https://www.google.com/maps/place/City+%26+Suburban+Heating+%26+Cooling/@41.90408,-87.6634153,17z/'
         'data=!4m8!3m7!1s0x880fd302d5248501:0xb1c6abfab8cf849b!8m2!3d41.9042251!4d-87.6635221!9m1!1b1')
SHOP = '1225 N Cleaver St, Chicago, IL 60642'
e = v1.e

# Photos we can stand behind: the approved Paper hero, two photos from City & Suburban's own website
# (via the Internet Archive; stock, so labelled "Illustrative photo"), the family-owned seal from the same
# site, and each area's Wikimedia Commons photo (credited below).
HERO = A + '5X6SBXHGCABFYFB3GFJ2CY4MYM.webp'
PH_AC = A + 'v2/photo-ac-service.webp'
PH_FILTER = A + 'v2/photo-furnace-filter.webp'
SEAL = A + 'v2/family-owned-seal.webp'
VAN = A + 'v2/van.webp'  # City & Suburban's own van, supplied by the client (2026-10-14)
CREDITS = {
    'west-loop': ('Fulton Market, West Loop', 'Bex Walton', 'CC BY 2.0',
                  'https://commons.wikimedia.org/wiki/File:Fulton_Market,_West_Loop_(47090474824).jpg'),
    'west-town': ('Division Street and Milwaukee Avenue, West Town', 'Adam Jones, Ph.D.', 'CC BY-SA 3.0',
                  'https://commons.wikimedia.org/wiki/File:Intersection_of_Division_St._and_Milwaukee_Ave._-_Chicago_-_Illinois_-_USA.jpg'),
    # Ready for the next area pages (same photos and credits as the service areas collection page)
    'wicker-park': ('Flat Iron Arts Building, Wicker Park', 'David Hilowitz', 'CC BY 2.0',
                    'https://commons.wikimedia.org/wiki/File:View_of_the_Flat_Iron_Arts_Building_from_the_Coyote_Tower_(5266790849).jpg'),
    'lincoln-park': ('Lincoln Park Conservatory', 'Ben Schumin', 'CC BY-SA 2.0',
                     'https://commons.wikimedia.org/wiki/File:Lincoln_Park_Conservatory_(9719113515).jpg'),
    'pilsen': ('Pilsen Historic District', 'Andrew Jameson', 'CC BY-SA 3.0',
               'https://commons.wikimedia.org/wiki/File:Pilsen_Historic_District_Chicago_IL.jpg'),
    'rogers-park': ('Rogers Park along Lake Michigan', 'formulanone', 'CC BY-SA 2.0',
                    'https://commons.wikimedia.org/wiki/File:Rogers_Park_Aerial_Along_Lake_Michigan_3_(50561589996).jpg'),
    'bucktown': ('Welcome to Bucktown banner', 'Eric Fischer', 'CC BY 2.0',
                 'https://commons.wikimedia.org/wiki/File:Welcome_to_Bucktown_(38689679811).jpg'),
    'logan-square': ('Illinois Centennial Monument, Logan Square', 'Loganresident at en.wikipedia', 'CC BY 2.5',
                     'https://commons.wikimedia.org/wiki/File:Illinois_Centennial_Memorial_Column.jpg'),
    'humboldt-park': ('Humboldt Park field house', 'Steven Kevil', 'CC BY-SA 4.0',
                      'https://commons.wikimedia.org/wiki/File:Humboldt_Park_Field_House_and_Refectory.jpg'),
}
# Placeholder in the "street or cross streets" field: an intersection named on that area's page.
CROSS = {'west-loop': 'e.g. Randolph & Halsted', 'west-town': 'e.g. Division & Milwaukee'}

ICONS = dict(v1.ICONS)
ICONS.update({
    'check': '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    'pin': '<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    'arrow': '<path d="M5 12h14M13 6l6 6-6 6"/>',
    'user': '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
    'tool': '<path d="M14.5 6.5a4 4 0 0 0-5.2 5.2L4 17l3 3 5.3-5.3a4 4 0 0 0 5.2-5.2l-2.6 2.6-2.4-.6-.6-2.4z"/>',
    'tag': '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
    'question': '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5h.01"/>',
    'shield': '<path d="M12 3 4 6v6c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V6z"/><path d="m8.5 12 2.5 2.5 4.5-4.5"/>',
    'home': '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/>',
    'van': '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    'store': '<path d="M4 9h16l-1-5H5zM5 9v11h14V9M9 20v-6h6v6"/>',
    'franchise': '<rect x="3" y="7" width="7" height="13" rx="1"/><rect x="14" y="4" width="7" height="16" rx="1"/><path d="M6 11h1M6 14h1M17 8h1M17 11h1M17 14h1"/>',
    'dollar': '<path d="M12 3v18M16.5 7.5c-.8-1.3-2.4-2-4.5-2-2.5 0-4.5 1.3-4.5 3.3 0 4.9 9 2.5 9 7.4 0 2-2 3.3-4.5 3.3-2.3 0-4-.8-4.8-2.3"/>',
    'phone2': '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    'chev': '<path d="m6 9 6 6 6-6"/>',
    'clock': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    'camera': '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
})
FACTOR_ICONS = ['home', 'shield', 'tool', 'install', 'store', 'check']
QUESTION_ICONS = ['user', 'dollar', 'tag', 'question', 'check']
COMPANY_ICONS = ['home', 'franchise', 'van', 'store']
G_LOGO = ('<svg class="g" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.8 6C12.4 13.7 17.7 9.5 24 9.5z"/>'
          '<path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"/>'
          '<path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.8-6z"/>'
          '<path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.2-13.5-9.9l-7.8 6C6.6 42.6 14.6 48 24 48z"/></svg>')

# Building illustrations for the selector, picked by keywords in the building tag/title.
BUILDINGS = {
    'loft': '<path d="M6 56V28l11-8v8l11-8v8l11-8v8l11-8v36z"/><path d="M6 56h52M14 36h6M26 36h6M38 36h6M14 46h6M26 46h6M38 46h6"/>',
    'tower': '<rect x="20" y="6" width="24" height="50" rx="1"/><path d="M14 56h36M26 14h4M34 14h4M26 22h4M34 22h4M26 30h4M34 30h4M26 38h4M34 38h4M29 56v-8h6v8"/>',
    'mid': '<rect x="8" y="18" width="48" height="38" rx="1"/><path d="M4 56h56M8 18l6-8h36l6 8M15 27h6M29 27h6M43 27h6M15 37h6M29 37h6M43 37h6M28 56v-9h8v9"/>',
    'commercial': '<path d="M8 24h48l-3-12H11z"/><path d="M10 24v32h44V24M4 56h56M16 56V36h12v20M34 36h14v10H34z"/><path d="M14 24c0 3 2 5 4 5s4-2 4-5c0 3 2 5 4 5s4-2 4-5c0 3 2 5 4 5s4-2 4-5c0 3 2 5 4 5s4-2 4-5"/>',
    'flat': '<rect x="14" y="10" width="36" height="46" rx="1"/><path d="M10 56h44M12 10h40M20 18h8M36 18h8M20 30h8M36 30h8M20 42h8M28 56V46h8v10"/>',
    'cottage': '<path d="M8 30 32 10l24 20"/><path d="M14 26v30h36V26M4 56h56M27 56V42h10v14M18 34h6M40 34h6"/>',
}


# Keywords in the building tag/title -> illustration (also exported to the Next.js template)
BUILDING_KEYS = [
    ('loft warehouse', 'loft'), ('tower high-rise lakefront', 'tower'), ('two-flat greystone three-flat', 'flat'),
    ('cottage frame house', 'cottage'), ('commercial restaurant storefront office', 'commercial'),
    ('mid-rise condo townhome courtyard', 'mid'),
]


def building_art(tag, title):
    t = f'{tag} {title}'.lower()
    for keys, art in BUILDING_KEYS:
        if any(k in t for k in keys.split()):
            return (f'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" '
                    f'stroke-linejoin="round" aria-hidden="true">{BUILDINGS[art]}</svg>')
    return ''


def icon(name, size=20, sw=1.8):
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
            f'stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICONS[name]}</svg>')


def head(eyebrow, title, tid, lede='', cls=''):
    return (f'<div class="v2-head {cls}"><p class="cs-eyebrow">{eyebrow}</p><h2 id="{tid}" class="cs-h2">{title}</h2>'
            + (f'<p class="v2-lede">{lede}</p>' if lede else '') + '</div>')


def live_chrome(name):
    return open(os.path.join(ROOT, 'assets', 'live', name + '.html'), encoding='utf-8').read().replace('{{ASSETS}}', A).replace('{{AREAS}}', '../')


def build(path):
    data = json.load(open(path, encoding='utf-8'))
    a, x = data['area'], data['extras']
    area, slug = a['_area'], a['_slug']
    get = lambda k: a.get(k, x.get(k, ''))
    area_img = A + f'areas/{slug}.webp'
    # The area photo appears only when the photo and its credit both exist
    credit = CREDITS.get(slug) if os.path.exists(os.path.join(ROOT, 'assets', 'areas', f'{slug}.webp')) else None
    building_opts = x.get('buildingTypeOptions') or [a['form.building_default']]

    # ── B1 Hero + request form ───────────────────────────
    opts = ''.join(f'<option{" selected" if o == a["form.building_default"] else ""}>{e(o)}</option>' for o in building_opts)
    issues = ['No heat or no cooling', 'Strange noise or smell', 'Tune-up or maintenance', 'Replacement quote', 'Something else']
    chips = ''.join(f'<label class="v2-chip"><input type="radio" name="issue" value="{e(t)}"{" checked" if i == 0 else ""}><span>{icon("check", 14, 2.4)}{e(t)}</span></label>'
                    for i, t in enumerate(issues))
    strip = [
        *([(area_img, credit[0])] if credit else []),
        (PH_AC, 'A technician servicing an AC unit · Illustrative photo'),
        (PH_FILTER, 'A furnace filter change · Illustrative photo'),
    ]
    strip_html = ''.join(f'<li><img src="{src}" alt="" loading="lazy" decoding="async"><span>{e(cap)}</span></li>' for src, cap in strip)
    hero = f'''
<section class="v2-hero on-dark" style="background-image:linear-gradient(90deg,rgb(9 38 58 / 95%) 0%,rgb(9 38 58 / 86%) 50%,rgb(9 38 58 / 45%) 100%),url({HERO})" aria-labelledby="hero-title">
  <div class="v2-hero-copy">
    <nav class="cs-crumbs" aria-label="Breadcrumb"><ol><li><a href="{LIVE}/">Home</a></li><li><a href="../">Service area</a></li><li aria-current="page">{e(area)}</li></ol></nav>
    <p class="cs-eyebrow v2-dot">Chicago · {e(area)}</p>
    <h1 class="cs-h1" id="hero-title">{e(a["hero.h1"])}</h1>
    <p class="cs-lede">{e(a["hero.lede"])}</p>
    <ul class="v2-glass" aria-label="Why City &amp; Suburban">
      <li><img src="{SEAL}" alt="" width="22" height="22">Family owned since 1952</li>
      <li>{icon("check", 16, 2.2)}Price agreed before any work starts</li>
      <li class="rt"><a href="{GMAPS}" target="_blank" rel="noopener">{G_LOGO}<b>4.98</b><small>/5</small><span class="cs-stars" aria-hidden="true">★★★★★</span>204 reviews</a></li>
    </ul>
    <div class="cs-actions">
      <a class="cs-btn cs-btn-red" href="{TEL}">{icon("phone", 18, 2)}Call {PHONE}</a>
      <a class="cs-btn cs-btn-ghost" href="#request">Schedule service{icon("arrow", 16, 2)}</a>
    </div>
    <div class="v2-strip">
      <p class="v2-strip-title">On the job, around {e(area)}</p>
      <ul>{strip_html}</ul>
    </div>
  </div>
  <form class="v2-form" id="request" data-request novalidate aria-labelledby="request-title">
    <h2 id="request-title">{e(a["form.title"])}</h2>
    <p class="sub">The person who diagnoses your system is the person who quotes it.</p>
    <fieldset><legend><span class="n">1</span>Your details</legend>
      <div class="v2-row2">
        <div class="cs-field"><label for="rq-name">Name</label><input id="rq-name" name="name" autocomplete="name"></div>
        <div class="cs-field"><label for="rq-phone">Phone</label><input id="rq-phone" name="phone" type="tel" autocomplete="tel" required aria-describedby="rq-phone-err"></div>
      </div>
      <span class="err" id="rq-phone-err" hidden>Enter a phone number so Rob can call you back.</span>
      <div class="cs-field"><label for="rq-street">Street or cross streets</label><div class="v2-ic-input">{icon("pin", 18, 1.8)}<input id="rq-street" name="street" autocomplete="street-address" placeholder="{e(CROSS.get(slug, "Street & cross street"))}"></div></div>
    </fieldset>
    <fieldset><legend><span class="n">2</span>Your job</legend>
      <div class="cs-field"><label for="rq-building">Building type</label><select id="rq-building" name="building">{opts}</select></div>
      <div class="cs-field"><span class="lbl" id="rq-issue-l">What&#x27;s happening?</span><div class="v2-chips" role="radiogroup" aria-labelledby="rq-issue-l">{chips}</div></div>
    </fieldset>
    <button class="cs-btn cs-btn-red" type="submit">Request a diagnosis{icon("arrow", 16, 2)}</button>
    <p class="v2-reassure">{icon("check", 16, 2.2)}Price agreed before any work starts.</p>
    <p class="cs-form-msg" role="status" tabindex="-1" hidden>Thanks. This preview form isn&#x27;t connected yet, so nothing was sent. To book now, call <a href="{TEL}">{PHONE}</a>.</p>
  </form>
</section>'''

    # ── B10 Building selector (start here) ───────────────
    sel_cards, sel_panels = [], []
    for i in range(1, 5):
        tag, title, body = a[f'buildings.{i}.tag'], a[f'buildings.{i}.title'], a[f'buildings.{i}.body']
        on = i == 1
        sel_cards.append(
            f'<li><button class="v2-pick" type="button" role="tab" id="bt-{i}" aria-controls="btp-{i}" aria-selected="{"true" if on else "false"}" tabindex="{0 if on else -1}">'
            f'<span class="art">{building_art(tag, title)}<span class="num">{i:02d}</span><span class="tick">{icon("check", 14, 2.6)}</span></span>'
            f'<span class="body"><span class="tag">{e(tag)}</span><span class="t">{e(title)}</span>'
            f'<span class="more">What heats and cools it{icon("chev", 16, 2.2)}</span></span></button></li>')
        sel_panels.append(
            f'<div class="v2-pick-panel" role="tabpanel" id="btp-{i}" aria-labelledby="bt-{i}"{"" if on else " hidden"}>'
            f'<div class="cell"><span class="badge">{icon("home", 20, 1.8)}</span><div><p class="k">What heats and cools a {e(title.lower())}</p><p class="v">{e(body)}</p></div></div>'
            f'<div class="cell"><span class="badge red">{icon("phone2", 18, 2)}</span><div><p class="k">First step</p><p class="v">Tell us the make of the furnace or condenser and what it&#x27;s doing.</p></div></div>'
            f'<a class="v2-link" href="#price-title">What changes the price{icon("arrow", 16, 2)}</a></div>')
    selector = f'''
<section class="cs-sec v2-stack" aria-labelledby="pick-title">
  <div class="v2-head-row">{head("Start here", e(a["buildings.heading"]), "pick-title")}
    <p class="v2-hint">{icon("home", 18, 1.8)}Select your building to see what heats and cools it</p></div>
  <div data-pick>
    <ul class="v2-picks" role="tablist" aria-label="Building types">{"".join(sel_cards)}</ul>
    {"".join(sel_panels)}
  </div>
</section>'''

    # ── B2 Services (the C&S tabbed card, unchanged) ─────
    tabs, panels = [], []
    for i, (key, name, title, lede, group_url, items) in enumerate(v1.GROUPS):
        sel = 'true' if i == 0 else 'false'
        tabs.append(f'<button class="cs-tab" role="tab" type="button" id="tab-{key}" aria-controls="panel-{key}" aria-selected="{sel}" tabindex="{0 if i == 0 else -1}">'
                    f'<span class="ic">{icon(key)}</span><span class="name">{e(name)}</span><span class="count">{len(items)}</span></button>')
        tiles = ''.join(
            f'<li><a class="cs-tile" href="{u}"><span class="ic">{icon(ic, 22, 1.7)}</span><div><h4>{e(t)}</h4>'
            + (f'<p>{e(d)}</p>' if d else '<span class="more">See the service →</span>') + '</div></a></li>'
            for ic, t, d, u in items)
        lede_html = f'<p>{e(lede)}</p>' if lede else f'<p><a href="{group_url}" style="color:var(--color-blue);font-weight:600">All {e(name.lower())} services →</a></p>'
        panels.append(f'<div class="cs-panel" role="tabpanel" id="panel-{key}" aria-labelledby="tab-{key}"{"" if i == 0 else " hidden"}>'
                      f'<div><h3>{e(title)}</h3>{lede_html}</div><ul class="cs-tiles">{tiles}</ul></div>')
    services = f'''
<section class="cs-services" aria-labelledby="services-title">
  <div class="cs-services-head">
    <span class="cs-pill-light">From city to suburbs</span>
    <h2 id="services-title">{e(a["services.heading"])}</h2>
    <p>24 services in four groups, from a furnace that won&#x27;t light to a restaurant&#x27;s make-up air unit.</p>
  </div>
  <div class="cs-services-card" data-tabs>
    <div class="cs-tabs">
      <div class="cs-tablist" role="tablist" aria-orientation="vertical" aria-label="Service groups">{"".join(tabs)}</div>
      <div class="cs-urgent"><b>No heat in January?</b><span>Call <a href="{TEL}" style="font-weight:700;color:var(--color-navy)">{PHONE}</a>. Tell us the furnace or boiler make and what it&#x27;s doing.</span></div>
    </div>
    {"".join(panels)}
  </div>
</section>'''

    # ── B6 What changes the price: checklist split ────────
    items = ''.join(
        f'<li><span class="n">{i:02d}</span><span class="badge">{icon(FACTOR_ICONS[i - 1], 18, 1.8)}</span>'
        f'<div><h3>{e(a[f"scope.{i}.factor"])}</h3><p>{e(a[f"scope.{i}.why"])}</p></div></li>' for i in range(1, 7))
    price = f'''
<section class="cs-sec v2-split" aria-labelledby="price-title">
  <div class="v2-split-side">
    {head("What changes the price", e(a["scope.heading"]), "price-title", "We don&#x27;t publish a price book, and we&#x27;re not going to invent one here. What we can show you is what moves the number.")}
    <figure class="v2-tall"><img src="{PH_AC}" alt="A technician tightening a refrigerant line valve on an outdoor AC unit" loading="lazy" decoding="async">
      <span class="v2-badge"><b>6</b><span>Things that<br>move the price</span></span><figcaption>Illustrative photo</figcaption></figure>
  </div>
  <ol class="v2-checklist">{items}</ol>
  <div class="v2-callout on-dark">
    <span class="badge">{icon("dollar", 22, 1.8)}</span>
    <div><b class="big">$6,807</b><p>Median reported value of 81 central-furnace replacement permits in Chicago over 24 months. That&#x27;s the whole project&#x27;s construction value, not a quote.</p></div>
  </div>
</section>'''

    # ── B7 How to choose: accordion beside a photo ────────
    acc = ''.join(
        f'<details{" open" if i == 0 else ""}><summary><span class="badge">{icon(QUESTION_ICONS[i], 18, 1.8)}</span><span class="q">{e(t)}</span>{icon("chev", 18, 2.2)}</summary>'
        f'<div class="ans"><p class="k">Why it matters</p><p>{e(d)}</p></div></details>' for i, (t, d) in enumerate(v1.QUESTIONS))
    choose = f'''
<section class="cs-sec cs-fog v2-stack" aria-labelledby="choose-title">
  {head("How to choose", e(a["choose.heading"]), "choose-title", "Ask them of anyone you call, including us.")}
  <div class="v2-acc-split">
    <figure class="v2-tall"><img src="{PH_FILTER}" alt="Hands sliding a dirty pleated filter out of a furnace" loading="lazy" decoding="async"><figcaption>Illustrative photo</figcaption></figure>
    <div><p class="v2-label">Questions to ask</p><div class="v2-acc">{acc}</div></div>
  </div>
</section>'''

    # ── B8 Kinds of company ──────────────────────────────
    cos = ''.join(
        f'<li class="v2-co{" us" if us else ""}">{"<span class=flag>This is us</span>" if us else ""}<span class="badge">{icon(COMPANY_ICONS[i], 20, 1.8)}</span>'
        f'<h3>{e(t)}</h3><p>{e(d)}</p></li>' for i, (t, d, us) in enumerate(v1.COMPANIES))
    companies = f'''
<section class="cs-sec v2-stack" aria-labelledby="companies-title">
  {head("Kinds of HVAC company", "Who you&#x27;ll meet, and what limits each of them", "companies-title")}
  <ul class="v2-cos">{cos}</ul>
</section>'''

    # ── B3 About City & Suburban: navy band with the van (Highlights "About" layout) ─
    owner = f'''
<section class="cs-sec cs-navy v2-cred on-dark" aria-labelledby="owner-title">
  <div class="v2-head-row">{head("About City &amp; Suburban", "Who you&#x27;re actually calling?", "owner-title")}
    <div class="v2-aside"><p><b>One family. Second generation. Since 1952.</b> {e(a["who.copy"])}</p>
      <div class="v2-names"><small>Names our reviewers remember</small><ul>{"".join(f"<li>{n}</li>" for n in v1.NAMES)}</ul></div></div></div>
  <div class="v2-cred-grid">
    <figure class="v2-van">
      <img src="{VAN}" alt="A City &amp; Suburban Heating &amp; Cooling service van with the phone number (773) 238-3838 on the side" width="666" height="525" loading="lazy" decoding="async">
      <img class="seal" src="{SEAL}" alt="Chicago local, family owned, since 1952" width="96" height="96" loading="lazy">
      <a class="v2-addr" href="{GMAPS}" target="_blank" rel="noopener">{icon("pin", 16, 2)}1225 N Cleaver St</a>
    </figure>
    <div class="v2-tiles">
      <div class="v2-tile"><p class="k">{icon("user", 16, 2)}Owner</p><b>Rob</b><p>Owner-operator. He runs the calls himself, so the person who quotes is the person accountable.</p></div>
      <div class="v2-tile"><p class="k">{icon("home", 16, 2)}Founded</p><b>1952</b><p>74 years, family owned, now in its second generation.</p></div>
      <div class="v2-tile"><p class="k">{icon("shield", 16, 2)}Permit record</p><b>0</b><p>Permits on record. Chicago doesn&#x27;t permit HVAC repair, which is most of what we do.</p></div>
      <div class="v2-tile"><p class="k">{icon("clock", 16, 2)}Hours</p><b>6 AM</b><p>Monday to Friday until 6 PM, Saturday until 3:30 PM.</p></div>
      <a class="v2-tile v2-gtile" href="{GMAPS}" target="_blank" rel="noopener"><span class="gc">{G_LOGO}</span><b>4.98<small>/5</small></b>
        <span class="gr"><span class="cs-stars" aria-hidden="true">★★★★★</span>204 Google reviews, as of 31 Aug 2026</span><span class="k gk">{icon("check", 14, 2.4)}Google rating</span></a>
    </div>
  </div>
  <ul class="v2-promises">
    <li><span class="badge">{icon("user", 20, 1.8)}</span><h3>The owner on the call</h3><p>Rob still runs the calls and does the diagnosis on the jobs that need it.</p></li>
    <li><span class="badge">{icon("tool", 20, 1.8)}</span><h3>Repair first</h3><p>If the unit has years left, we say so and repair it.</p></li>
    <li><span class="badge">{icon("dollar", 20, 1.8)}</span><h3>The price before the work</h3><p>You hear the price before any work starts.</p></li>
  </ul>
</section>'''

    # ── B4 Google reviews ────────────────────────────────
    rcards = []
    for i in range(1, 5):
        quote, by, tag, url = a[f'reviews.{i}.quote'], a[f'reviews.{i}.by'], a[f'reviews.{i}.tag'], x.get(f'reviews.{i}.url')
        name, _, year = by.partition(' · ')
        link = f'<a href="{e(url)}" target="_blank" rel="noopener">View on Google{icon("arrow", 14, 2)}</a>' if url else ''
        rcards.append(
            f'<li class="v2-review"><header><span class="av" aria-hidden="true">{e(name[:1])}</span><div><b>{e(name)}</b><small>{e(year)} · {e(tag)}</small></div>{G_LOGO}</header>'
            f'<span class="cs-stars" aria-label="5 stars">★★★★★</span>'
            f'<blockquote class="clamp" id="rv-{i}">{e(quote)}</blockquote>'
            f'<button class="v2-more" type="button" aria-expanded="false" aria-controls="rv-{i}">Read more</button>'
            f'<footer><span>Posted on Google</span>{link}</footer></li>')
    map_q = SHOP.replace(' ', '+')
    reviews = f'''
<section class="cs-sec v2-stack" aria-labelledby="reviews-title">
  {head("What customers say", "Why Chicago homeowners keep calling the same family", "reviews-title")}
  <div class="v2-rev-grid">
    <aside class="v2-place">
      <div class="top">
        <p class="pt">{G_LOGO}<span><b>Google reviews</b><small>City &amp; Suburban Heating &amp; Cooling</small></span></p>
        <p class="score"><b>4.98</b><small>/5</small><span><span class="cs-stars" aria-hidden="true">★★★★★</span>204 reviews</span></p>
        <a class="v2-link" href="{GMAPS}" target="_blank" rel="noopener">Read all 204 reviews{icon("arrow", 16, 2)}</a>
      </div>
      <iframe class="v2-map" title="Map: City &amp; Suburban, {SHOP}" src="https://www.google.com/maps/embed?origin=mfe&amp;pb=!1m3!2m1!1s{map_q}!6i15" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      <div class="bot"><b>City &amp; Suburban · 1225 N Cleaver St</b><a class="v2-link" href="{GMAPS}" target="_blank" rel="noopener">Open in Google Maps{icon("arrow", 16, 2)}</a></div>
    </aside>
    <ul class="v2-reviews">{"".join(rcards)}</ul>
  </div>
  <p class="v2-note">{icon("check", 16, 2.2)}Quoted word for word from Google, never edited. Several reviewers were told their old unit still had years left.</p>
</section>'''

    # ── B5 Process: step track ───────────────────────────
    owners = ['You', 'You', 'City & Suburban', 'City & Suburban', 'City & Suburban', 'City & Suburban']
    steps = ''.join(
        f'<li class="v2-step"><header><span class="big">{n:02d}</span><img src="{A}{img}.webp" alt="" height="52"></header><h3>{e(t)}</h3><p>{e(d)}</p>'
        f'<footer><span class="who{" us" if owners[n - 1] != "You" else ""}">{icon("user" if owners[n - 1] == "You" else "tool", 14, 2)}{e(owners[n - 1])}</span></footer></li>'
        for n, (img, t, d) in enumerate(v1.STEPS, 1))
    dots = ''.join(f'<button type="button" class="dot" data-go="{i}" aria-label="Step {i + 1}">{i + 1}</button>' for i in range(len(v1.STEPS)))
    process = f'''
<section class="cs-sec cs-fog v2-stack" aria-labelledby="process-title">
  <div class="v2-head-row">{head("What happens when you call · 6 steps", "From the first call to a warm apartment, in six steps", "process-title")}
    <div class="v2-legend"><p>Who does the step</p><ul><li class="who">{icon("user", 14, 2)}You</li><li class="who us">{icon("tool", 14, 2)}City &amp; Suburban</li></ul></div></div>
  <div class="v2-steps-wrap" data-steps>
    <div class="v2-steps-bar"><p class="count"><b>01</b> / 06</p><div class="dots">{dots}</div>
      <div class="cs-arrows"><button class="cs-arrow" type="button" data-prev aria-label="Previous step">{icon("left", 20, 2.2)}</button><button class="cs-arrow" type="button" data-next aria-label="Next step">{icon("right", 20, 2.2)}</button></div></div>
    <ol class="v2-steps" tabindex="0" aria-label="Steps: use the arrows or scroll sideways">{steps}</ol>
  </div>
</section>'''

    # ── B9 Districts: navy band with a map ───────────────
    label = a['districts.label'].lower().replace(area.lower(), area)
    label = label[0].upper() + label[1:]
    dl = ''
    for i in range(1, 5):
        hv = get(f'districts.{i}.hvac')
        dl += (f'<li><h3>{icon("pin", 16, 2)}{e(a[f"districts.{i}.name"])}</h3><p>{e(a[f"districts.{i}.intro"])}</p>'
               + (f'<p class="here">{e(hv)}</p>' if hv else '') + '</li>')
    area_q = f'{area}, Chicago, IL'.replace(' ', '+')
    districts = f'''
<section class="cs-sec cs-navy v2-stack on-dark" aria-labelledby="districts-title">
  <div class="v2-head-row">{head(e(label), e(a["districts.heading"]), "districts-title")}
    <ul class="v2-dchips"><li>{e(a["districts.chip1"])}</li><li>{e(a["districts.chip2"])}</li><li>{e(a["districts.chip3"])}</li></ul></div>
  <div class="v2-area-grid">
    <div class="v2-map-card"><iframe class="v2-map" title="Map of {e(area)}, Chicago" src="https://www.google.com/maps/embed?origin=mfe&amp;pb=!1m3!2m1!1s{area_q}!6i14" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      <a class="v2-shop" href="{GMAPS}" target="_blank" rel="noopener">{icon("van", 18, 1.8)}<span><b>Our shop</b>1225 N Cleaver St</span></a></div>
    <ul class="v2-districts">{dl}</ul>
  </div>
</section>'''

    # ── B11 Permit record ────────────────────────────────
    permits = f'''
<section class="cs-sec cs-permits v2-permits on-dark" aria-labelledby="permits-title">
  <div class="v2-permits-copy">
    <p class="cs-eyebrow">The permit record, honestly</p>
    <h2 id="permits-title" class="cs-h2">Why you won&#x27;t find us in the City&#x27;s permit file</h2>
    <p>Chicago doesn&#x27;t require a permit to repair, diagnose or maintain heating and cooling, which is most of what we do. The permit file measures construction, not service. So when a company waves a permit count at you, ask how much of their work is repair.</p>
  </div>
  <ul class="v2-nums">
    <li><b>{e(a["permits.area_count"])}</b><span>{e(a["permits.area_text"])}</span></li>
    <li><b>1,539</b><span>Firms that pull HVAC permits citywide, across 4,888 permits in 24 months.</span></li>
    <li><b>0</b><span>Permits on record for City &amp; Suburban. We said we&#x27;d be honest.</span></li>
  </ul>
</section>'''

    # ── B12 FAQ ──────────────────────────────────────────
    faqs = ''.join(
        f'<details{" open" if i == 1 else ""}><summary><span class="n">{i:02d}</span><span class="q">{e(a[f"faq.{i}.q"])}</span><span class="pm" aria-hidden="true"></span></summary>'
        f'<p>{e(get(f"faq.{i}.a"))}</p></details>' for i in range(1, 6))
    faq = f'''
<section class="cs-sec v2-faq" aria-labelledby="faq-title">
  <div class="v2-faq-side">
    {head("Questions · 5", e(a["faq.heading"]), "faq-title")}
    <div class="v2-ask on-dark" style="background-image:linear-gradient(180deg,rgb(9 38 58 / 30%) 0%,rgb(9 38 58 / 92%) 70%),url({HERO})">
      <p>Didn&#x27;t find your question?</p><a class="cs-btn cs-btn-red cs-btn-sm" href="{TEL}">{icon("phone", 16, 2)}Call {PHONE}</a></div>
    <a class="v2-mini" href="{GMAPS}" target="_blank" rel="noopener">{G_LOGO}<span><b>4.98 <span class="cs-stars" aria-hidden="true">★★★★★</span></b><small>204 Google reviews</small></span></a>
    <div class="v2-mini"><img src="{SEAL}" alt="" width="40" height="40"><span><b>Family owned since 1952</b><small>Rob, the owner, still on the calls</small></span></div>
  </div>
  <div class="cs-faq-list v2-faq-list">{faqs}</div>
</section>'''

    # ── B13 Next step ────────────────────────────────────
    cta = f'''
<section class="cs-sec v2-next on-dark" aria-labelledby="cta-title" style="background-image:linear-gradient(180deg,rgb(9 38 58 / 88%) 0%,var(--color-navy) 62%),url({HERO})">
  <div class="v2-next-top">
    <span class="v2-logo-badge"><img src="{A}live/city-suburban-transparent-logo.png" alt="City &amp; Suburban Heating &amp; Cooling" width="170" height="60"></span>
    <p class="cs-eyebrow">Your next step</p>
    <h2 id="cta-title" class="cs-h2">No heat, no cooling, or just a question?</h2>
    <p class="v2-lede">{e(a["cta.body"])}</p>
    <div class="cs-actions"><a class="cs-btn cs-btn-red" href="{TEL}">{icon("phone", 18, 2)}Call {PHONE}</a><a class="cs-btn cs-btn-ghost" href="#request">Schedule service{icon("arrow", 16, 2)}</a></div>
  </div>
  <ul class="v2-proof">
    <li><a href="{GMAPS}" target="_blank" rel="noopener"><span class="gc">{G_LOGO}</span><span><b>4.98 <span class="cs-stars" aria-hidden="true">★★★★★</span></b><small>204 Google reviews</small></span></a></li>
    <li><span class="badge">{icon("home", 18, 1.8)}</span><span><b>1952</b><small>Founded, family owned</small></span></li>
    <li><span class="badge">{icon("user", 18, 1.8)}</span><span><b>Rob</b><small>The owner, on the calls</small></span></li>
    <li><span class="badge">{icon("clock", 18, 1.8)}</span><span><b>From 6 AM</b><small>Monday to Saturday</small></span></li>
  </ul>
</section>'''

    credits = f'''
<div class="cs-sec v2-credits"><details><summary>Photo credits</summary><ul>
{f'<li>{e(credit[0])}: {e(credit[1])} · {e(credit[2])} · <a href="{credit[3]}" target="_blank" rel="noopener">Wikimedia Commons</a></li>' if credit else ''}
  <li>Van photo: City &amp; Suburban. Hero, AC service and furnace filter photos: from citysuburbanheating.com, illustrative.</li>
</ul></details></div>'''

    title = x.get('seo.title') or a['hero.h1']
    desc = x.get('seo.description') or a['hero.lede']
    page = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="icon" href="{A}6FN1CP4RYC9MBCFR4H39DJ8HAE.webp">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700&family=Ubuntu:wght@500;700&display=swap" rel="stylesheet">
<link rel="preload" as="image" href="{HERO}">
<link rel="stylesheet" href="{A}live-chrome.css">
<link rel="stylesheet" href="{A}area-page.css">
<link rel="stylesheet" href="{A}area-page-v2.css">
</head>
<body>
<div class="pbar">
  <span class="t">Service area page · {e(area)} · draft v2</span>
  <span class="acts"><a href="../">&larr; All service areas</a><a href="{UP}services-v1/service-areas/{slug}/">v1 page</a><a href="{UP}playbook/">Playbook</a></span>
</div>
{live_chrome("header")}
<div class="cs v2">
<main>{hero}{selector}{services}{price}{choose}{companies}{owner}{reviews}{process}{districts}{permits}{faq}{cta}{credits}
</main>
</div>
{live_chrome("footer")}
<script src="{A}area-page.js"></script>
<script src="{A}area-page-v2.js"></script>
</body>
</html>
'''
    out = os.path.join(ROOT, 'services-v2', 'service-areas', slug, 'index.html')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, 'w', encoding='utf-8').write(page)
    print('wrote', os.path.relpath(out, ROOT), len(page))


if __name__ == '__main__':
    build(sys.argv[1])
