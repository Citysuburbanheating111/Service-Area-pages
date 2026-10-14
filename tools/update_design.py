#!/usr/bin/env python3
"""One command after any design change to the service area pages:

  python tools/update_design.py

1. Rebuilds every v2 area page that already exists (services-v2/service-areas/<slug>/) from its
   content file (web/content/areas/<slug>.json).
2. Syncs the design (CSS, header/footer, images, shared content) into the Sanity / Next.js app,
   so every Sanity area page picks it up too (tools/sync_design_to_web.py).
3. Audits all v1 and v2 pages (tools/audit_v1.py) and stops if anything fails.

To add a new area page: write web/content/areas/<slug>.json, run
`python tools/build_area_page_v2.py web/content/areas/<slug>.json` once, then use this command.
In Sanity, a new area page document renders with the same template automatically.
"""
import os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import build_area_page_v2 as v2  # noqa: E402
import sync_design_to_web  # noqa: E402

pages = os.path.join(ROOT, 'services-v2', 'service-areas')
slugs = sorted(d for d in os.listdir(pages) if os.path.isfile(os.path.join(pages, d, 'index.html')))
for slug in slugs:
    content = os.path.join(ROOT, 'web', 'content', 'areas', f'{slug}.json')
    if not os.path.exists(content):
        sys.exit(f'No content file for {slug}: {content}')
    v2.build(content)

sync_design_to_web.main()
sys.exit(subprocess.call([sys.executable, os.path.join(ROOT, 'tools', 'audit_v1.py')]))
