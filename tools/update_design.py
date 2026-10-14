#!/usr/bin/env python3
"""One command after any design change, or after adding an area page:

  python tools/update_design.py

1. Builds the v2 page for every area that has a v1 or v2 page and a content file
   (web/content/areas/<slug>.json), so new areas get the current design automatically.
2. Regenerates the v2 "All service areas" page from the v1 one (same cards, v2 links).
3. Syncs the design (CSS, header/footer, images, shared content) into the Sanity / Next.js app,
   so every Sanity area page picks it up too (tools/sync_design_to_web.py).
4. Audits all v1 and v2 pages (tools/audit_v1.py) and exits non-zero if anything fails.

In Sanity, a new area page document renders with the same template automatically.
"""
import os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import build_area_page_v2 as v2  # noqa: E402
import sync_design_to_web  # noqa: E402


def area_slugs(version):
    d = os.path.join(ROOT, f'services-{version}', 'service-areas')
    return {s for s in os.listdir(d) if os.path.isfile(os.path.join(d, s, 'index.html'))} if os.path.isdir(d) else set()


# 1. v2 pages for every published area
for slug in sorted(area_slugs('v1') | area_slugs('v2')):
    content = os.path.join(ROOT, 'web', 'content', 'areas', f'{slug}.json')
    if os.path.exists(content):
        v2.build(content)
    else:
        print(f'skipped {slug}: no content file')

# 2. v2 collection page = v1 collection page with v2 labels and links
src = open(os.path.join(ROOT, 'services-v1', 'service-areas', 'index.html'), encoding='utf-8').read()
for a, b in [('city-suburban/services-v1/service-areas/', 'city-suburban/services-v2/service-areas/'),
             ('<span class="t">Service areas · collection page v1</span>', '<span class="t">Service areas · collection page v2</span>'),
             ('<span class="acts"><a href="../../">Design system</a>',
              '<span class="acts"><a href="../../services-v1/service-areas/">v1 collection</a><a href="../../">Design system</a>')]:
    if a not in src:
        sys.exit(f'v1 collection page changed: expected text not found: {a[:60]}')
    src = src.replace(a, b)

# The v2 collection page is the live one: indexable, canonical, no preview bar, and cards don't
# link to area pages until those pages are published (they stay noindex drafts). Add a slug to
# LIVE_AREAS when its page goes live and its card links again.
LIVE_AREAS = {'west-loop', 'wicker-park', 'pilsen', 'rogers-park', 'bucktown'}  # published in Sanity
CANONICAL = 'https://logeshmaximus.github.io/city-suburban/services-v2/service-areas/'
src = src.replace('<meta name="robots" content="noindex, nofollow">',
                  f'<meta name="robots" content="index, follow">\n<link rel="canonical" href="{CANONICAL}">')
src = re.sub(r'<div class="pbar">.*?</div>\s*', '', src, count=1, flags=re.S)
src = re.sub(r'<a class="stretch" href="([a-z-]+)/">([^<]+)</a>',
             lambda m: m.group(0) if m.group(1) in LIVE_AREAS else m.group(2), src)
src = re.sub(r'\s*<p class="open" aria-hidden="true">Open the ([^<]+) page <span>→</span></p>',
             lambda m: m.group(0) if m.group(1).lower().replace(' ', '-') in LIVE_AREAS else '', src)
for leftover in ('noindex', 'class="pbar"', 'collection page v'):
    if leftover in src:
        sys.exit(f'live collection page still contains "{leftover}"')
open(os.path.join(ROOT, 'services-v2', 'service-areas', 'index.html'), 'w', encoding='utf-8', newline='').write(src)
print('wrote services-v2/service-areas/index.html (live)')

# 3 + 4. Sync into the Sanity app, then audit
sync_design_to_web.main()
sys.exit(subprocess.call([sys.executable, os.path.join(ROOT, 'tools', 'audit_v1.py')]))
