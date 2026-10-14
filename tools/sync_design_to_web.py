#!/usr/bin/env python3
"""Copy the v2 area page design from the design-system site into the Next.js / Sanity app.

  python tools/sync_design_to_web.py

The static v2 pages (tools/build_area_page_v2.py) and the Sanity-driven Next.js pages
(web/src/components/area/AreaPageV2.tsx) share one design. This script is the bridge, so a
design change is made once, here in the design-system site, and then synced:

  assets/area-page.css, area-page-v2.css, live-chrome.css -> web/src/app/(site)/design/
  assets/live/header.html, footer.html                    -> web/src/components/area/liveChromeHtml.ts
  photos, icons, logos                                     -> web/public/cs-assets/
  shared content (services, steps, questions, icons, ...)  -> web/src/lib/design-data.json

Run it after changing any of the above. Then `npm run build` in web/ (or let `next dev` reload).
"""
import json, os, re, shutil, sys
from html import unescape as html_unescape

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WEB = os.path.join(ROOT, 'web')
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import build_area_page as v1  # noqa: E402
import build_area_page_v2 as v2  # noqa: E402

ASSETS_URL = '/cs-assets/'      # where web/public/cs-assets/ is served
AREAS_URL = '/service-areas/'   # area pages in the Next.js app

CSS = ['area-page.css', 'area-page-v2.css', 'live-chrome.css']
IMAGES = (['5X6SBXHGCABFYFB3GFJ2CY4MYM.webp', '6FN1CP4RYC9MBCFR4H39DJ8HAE.webp', 'live/city-suburban-transparent-logo.png',
           'live/live-footer-logo.webp', 'v2/van-street.webp', 'v2/family-owned-seal.webp', 'v2/photo-ac-service.webp',
           'v2/photo-furnace-filter.webp']
          + [f'{img}.webp' for img, _, _ in v1.STEPS]
          + [f'areas/{f}' for f in os.listdir(os.path.join(ROOT, 'assets', 'areas')) if f.endswith('.webp')])


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    old = open(path, encoding='utf-8').read() if os.path.exists(path) else None
    if old != text:
        open(path, 'w', encoding='utf-8', newline='\n').write(text)
        print('updated', os.path.relpath(path, ROOT))


def main():
    # 1. Stylesheets, unchanged apart from a header line
    for name in CSS:
        css = open(os.path.join(ROOT, 'assets', name), encoding='utf-8').read()
        head = f'/* Synced from assets/{name} by tools/sync_design_to_web.py. Edit the original, not this copy. */\n'
        write(os.path.join(WEB, 'src', 'app', '(site)', 'design', name), head + css)

    # 2. Live-site header and footer as strings
    def chrome(name):
        return (open(os.path.join(ROOT, 'assets', 'live', name + '.html'), encoding='utf-8').read()
                .replace('{{ASSETS}}', ASSETS_URL).replace('{{AREAS}}', AREAS_URL))
    ts = ('// Synced from assets/live/*.html by tools/sync_design_to_web.py. Edit the originals, not this file.\n'
          '// Static markup copied from citysuburbanheating.com, plus the Services and Service Areas dropdowns.\n'
          f'export const liveHeader = {json.dumps(chrome("header"))}\n\n'
          f'export const liveFooter = {json.dumps(chrome("footer"))}\n')
    write(os.path.join(WEB, 'src', 'components', 'area', 'liveChromeHtml.ts'), ts)

    # 3. Images
    for rel in IMAGES:
        src = os.path.join(ROOT, 'assets', rel)
        dst = os.path.join(WEB, 'public', 'cs-assets', rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if not os.path.exists(dst) or os.path.getmtime(src) > os.path.getmtime(dst) or os.path.getsize(src) != os.path.getsize(dst):
            shutil.copy2(src, dst)
            print('copied', 'web/public/cs-assets/' + rel)

    # 4. Shared content and icons
    data = {
        '_note': 'Synced from tools/build_area_page.py and tools/build_area_page_v2.py by tools/sync_design_to_web.py.',
        'phone': v1.PHONE, 'tel': v1.TEL, 'live': v1.LIVE, 'gmaps': v2.GMAPS, 'shop': v2.SHOP,
        'assets': ASSETS_URL,
        'images': {'hero': ASSETS_URL + '5X6SBXHGCABFYFB3GFJ2CY4MYM.webp', 'van': ASSETS_URL + 'v2/van-street.webp',
                   'seal': ASSETS_URL + 'v2/family-owned-seal.webp', 'acService': ASSETS_URL + 'v2/photo-ac-service.webp',
                   'furnaceFilter': ASSETS_URL + 'v2/photo-furnace-filter.webp',
                   'logo': ASSETS_URL + 'live/city-suburban-transparent-logo.png',
                   'favicon': ASSETS_URL + '6FN1CP4RYC9MBCFR4H39DJ8HAE.webp'},
        'groups': [{'key': k, 'name': n, 'title': t, 'lede': l, 'url': u,
                    'items': [{'icon': ic, 'title': it, 'text': d, 'url': iu} for ic, it, d, iu in items]}
                   for k, n, t, l, u, items in v1.GROUPS],
        'stepIcons': [ASSETS_URL + f'{img}.webp' for img, _, _ in v1.STEPS],
        'steps': [{'title': t, 'text': d} for _, t, d in v1.STEPS],
        'questions': [{'title': t, 'text': d} for t, d in v1.QUESTIONS],
        'companies': [{'title': t, 'text': d, 'us': us} for t, d, us in v1.COMPANIES],
        'names': v1.NAMES,
        'icons': v2.ICONS,
        'factorIcons': v2.FACTOR_ICONS, 'questionIcons': v2.QUESTION_ICONS, 'companyIcons': v2.COMPANY_ICONS,
        'buildings': v2.BUILDINGS, 'buildingKeys': v2.BUILDING_KEYS,
        'gLogo': v2.G_LOGO,
        'credits': {slug: {'caption': c[0], 'author': c[1], 'licence': c[2], 'url': c[3]} for slug, c in v2.CREDITS.items()},
        'cross': v2.CROSS,
        'areaPhotos': sorted(f[:-5] for f in os.listdir(os.path.join(ROOT, 'assets', 'areas')) if f.endswith('.webp')),
    }
    write(os.path.join(WEB, 'src', 'lib', 'design-data.json'), json.dumps(data, ensure_ascii=False, indent=1) + '\n')

    # 5. The live "All service areas" collection page (services-v2/service-areas/) for /service-areas.
    #    Cards are written unlinked; the Next page links the ones that exist in Sanity.
    page = open(os.path.join(ROOT, 'services-v2', 'service-areas', 'index.html'), encoding='utf-8').read()
    css = page[page.index('<style>') + 7:page.index('</style>')]
    main = page[page.index('<main>'):page.index('</main>') + 7]
    title = html_unescape(re.search(r'<title>(.*?)</title>', page).group(1))
    desc = html_unescape(re.search(r'<meta name="description" content="([^"]*)"', page).group(1))
    css = (css.replace("--font-display:'Ubuntu',sans-serif", "--font-display:var(--font-ubuntu),'Ubuntu',sans-serif")
              .replace("--font-body:'Noto Sans',sans-serif", "--font-body:var(--font-noto-sans),'Noto Sans',sans-serif"))
    css, main = (s.replace('../../assets/', ASSETS_URL) for s in (css, main))
    main = main.replace('href="./"', f'href="{AREAS_URL}"')
    main = re.sub(r'<a class="stretch" href="[a-z-]+/">([^<]+)</a>', r'\1', main)
    main = re.sub(r'\s*<p class="open" aria-hidden="true">.*?</p>', '', main)
    for img in re.findall(r'/cs-assets/([\w/.-]+\.(?:webp|png))', css + main):
        src, dst = os.path.join(ROOT, 'assets', img), os.path.join(WEB, 'public', 'cs-assets', img)
        if not os.path.exists(dst) or os.path.getsize(src) != os.path.getsize(dst):
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy2(src, dst)
            print('copied', 'web/public/cs-assets/' + img)
    ts = ('// Synced from services-v2/service-areas/index.html by tools/sync_design_to_web.py. Edit the original, not this file.\n'
          f'export const collectionTitle = {json.dumps(title, ensure_ascii=False)}\n\n'
          f'export const collectionDescription = {json.dumps(desc, ensure_ascii=False)}\n\n'
          f'export const collectionCss = {json.dumps(css, ensure_ascii=False)}\n\n'
          f'export const collectionMain = {json.dumps(main, ensure_ascii=False)}\n')
    write(os.path.join(WEB, 'src', 'components', 'area', 'collectionHtml.ts'), ts)
    print('design synced')


if __name__ == '__main__':
    main()
