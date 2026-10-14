#!/usr/bin/env python3
"""SEO audit of the rendered service area pages.

  python scripts/seo-audit.py http://localhost:3000 /service-areas/ /service-area/pilsen/ ...

Per page: status, <title> (<= 60), meta description (<= 160), canonical, robots, Open Graph,
JSON-LD types (and that it parses), and the heading outline: exactly one <h1>, no skipped levels
(h2 -> h4), headings not empty. Exit code 1 if any page fails.
"""
import html, json, re, sys, urllib.request
from html.parser import HTMLParser


class Heads(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out, self.cur, self.hidden, self.stack = [], None, 0, []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ('template',) or 'hidden' in a:
            self.hidden += 1
            self.stack.append(tag)
            return
        if self.hidden:
            self.stack.append(tag)
            return
        if re.fullmatch(r'h[1-6]', tag):
            self.cur = [int(tag[1]), '']

    def handle_endtag(self, tag):
        if self.hidden and self.stack:
            t = self.stack.pop()
            if t == 'template' or (not self.stack and t == tag):
                self.hidden = max(0, self.hidden - 1)
            return
        if self.cur and tag == f'h{self.cur[0]}':
            self.out.append((self.cur[0], re.sub(r'\s+', ' ', self.cur[1]).strip()))
            self.cur = None

    def handle_data(self, d):
        if self.cur:
            self.cur[1] += d


def first_render(t):
    # The streamed copy of a Suspense boundary sits in <div hidden id="S:n"> after the visible shell;
    # React moves it in place on load. Audit what visitors see: the shell, plus streamed content
    # that replaces an empty fallback.
    return t


def meta(t, name, attr='name'):
    m = re.search(rf'<meta {attr}="{re.escape(name)}" content="([^"]*)"', t)
    return html.unescape(m.group(1)) if m else None


def audit(base, path):
    req = urllib.request.Request(base + path, headers={'User-Agent': 'cs-seo-audit/1.0'})
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))  # direct, even if a proxy is set
    with opener.open(req, timeout=300) as r:
        status, t = r.status, r.read().decode('utf-8', 'ignore')
    p = []
    title = re.search(r'<title>(.*?)</title>', t, re.S)
    title = html.unescape(title.group(1)) if title else None
    desc = meta(t, 'description')
    canon = re.search(r'<link rel="canonical" href="([^"]+)"', t)
    robots = meta(t, 'robots')
    og = {k: meta(t, f'og:{k}', 'property') for k in ('title', 'description', 'url', 'image', 'type', 'site_name')}
    ld_types = []
    for block in re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', t, re.S):
        try:
            data = json.loads(html.unescape(block))
        except ValueError:
            p.append('JSON-LD does not parse')
            continue
        items = data.get('@graph', [data]) if isinstance(data, dict) else data
        ld_types += [i.get('@type') for i in items if isinstance(i, dict)]
    # Headings: parse the page as served; skip hidden streamed copies
    parser = Heads()
    parser.feed(t)
    heads = parser.out
    if status != 200:
        p.append(f'status {status}')
    if not title:
        p.append('no <title>')
    elif len(title) > 60:
        p.append(f'title {len(title)} chars (> 60)')
    if not desc:
        p.append('no meta description')
    elif len(desc) > 160:
        p.append(f'description {len(desc)} chars (> 160)')
    if not canon:
        p.append('no canonical')
    if robots and 'noindex' in robots:
        p.append(f'robots: {robots}')
    for k in ('title', 'description', 'url', 'image'):
        if not og[k]:
            p.append(f'no og:{k}')
    if not ld_types:
        p.append('no JSON-LD')
    h1 = [h for h in heads if h[0] == 1]
    if len(h1) != 1:
        p.append(f'{len(h1)} <h1>')
    prev = 0
    for lvl, text in heads:
        if not text:
            p.append(f'empty h{lvl}')
        if prev and lvl > prev + 1:
            p.append(f'heading skips h{prev} -> h{lvl} ("{text[:40]}")')
        prev = lvl
    return {'path': path, 'title': title, 'desc': desc, 'canonical': canon.group(1) if canon else None,
            'og_url': og['url'], 'ld': ld_types, 'outline': heads, 'problems': p}


def main():
    base, paths = sys.argv[1].rstrip('/'), sys.argv[2:]
    bad = 0
    titles = {}
    for path in paths:
        r = audit(base, path)
        titles.setdefault(r['title'], []).append(path)
        print(f"== {path}: {'OK' if not r['problems'] else str(len(r['problems'])) + ' problems'}")
        print(f"   title ({len(r['title'] or '')}): {r['title']}")
        print(f"   desc  ({len(r['desc'] or '')}): {r['desc']}")
        print(f"   canonical: {r['canonical']} | og:url: {r['og_url']} | JSON-LD: {r['ld']}")
        print('   outline: ' + ' > '.join(f'h{l}' for l, _ in r['outline']))
        for q in r['problems']:
            print('   -', q)
        bad += bool(r['problems'])
    for t, ps in titles.items():
        if len(ps) > 1:
            print(f'DUPLICATE title on {ps}: {t}')
            bad += 1
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
