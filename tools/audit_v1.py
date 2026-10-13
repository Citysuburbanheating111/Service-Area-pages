#!/usr/bin/env python3
"""Audit the built v1 pages before publishing.

  python tools/audit_v1.py

Checks every services-v1 page for: empty headings, paragraphs, FAQ answers, list items and
options; leftover placeholders ([CONFIRM, None, undefined, {{tokens}}); local images, styles,
scripts and links that don't exist on disk; missing <title> / meta description; duplicate ids.
Exits non-zero if anything fails.
"""
import os, re, sys
from html.parser import HTMLParser
from urllib.parse import urldefrag, urlparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHECK_EMPTY = {'h1', 'h2', 'h3', 'h4', 'p', 'li', 'summary', 'option', 'blockquote', 'b', 'a', 'button', 'label', 'title'}
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'}


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack, self.problems, self.refs, self.ids = [], [], [], {}
        self.meta_desc = False
        self.details = []  # per <details>: [summary text, answer text]

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            self.ids[a['id']] = self.ids.get(a['id'], 0) + 1
        for k in ('src', 'href'):
            if a.get(k):
                self.refs.append((tag, a[k]))
        if tag == 'meta' and a.get('name') == 'description' and a.get('content', '').strip():
            self.meta_desc = True
        if tag == 'details' and any('cs-faq-list' in n['cls'].split() for n in self.stack):
            self.details.append(['', ''])
        if tag in VOID:
            if self.stack:
                self.stack[-1]['kids'] += 1  # an <img> inside a link counts as its content
            return
        # aria-label / aria-hidden / img children count as content for links and buttons
        self.stack.append({'tag': tag, 'text': '', 'labelled': bool(a.get('aria-label')) or a.get('aria-hidden') == 'true',
                           'cls': a.get('class', ''), 'kids': 0})

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if self.stack and tag not in VOID and self.stack[-1]['tag'] == tag:
            self.stack.pop()

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        while self.stack:
            node = self.stack.pop()
            if self.stack:
                self.stack[-1]['text'] += node['text']
                self.stack[-1]['kids'] += 1
            if node['tag'] == tag:
                break
        if tag in CHECK_EMPTY and not node['text'].strip() and not node['labelled'] and node['kids'] == 0:
            # separators and decorative list items are intentionally empty
            if not ('sep' in node['cls'].split()):
                self.problems.append(f'empty <{tag} class="{node["cls"]}">')

    def handle_data(self, data):
        if self.stack:
            self.stack[-1]['text'] += data
        if self.details:
            open_tags = [n['tag'] for n in self.stack]
            in_faq = any('cs-faq-list' in n['cls'].split() for n in self.stack)
            if in_faq and 'details' in open_tags:
                slot = 0 if 'summary' in open_tags else 1
                self.details[-1][slot] += data


def audit(path):
    src = open(path, encoding='utf-8').read()
    p = Page()
    p.feed(src)
    problems = list(p.problems)
    text = re.sub(r'<script.*?</script>|<style.*?</style>', '', src, flags=re.S)
    text = re.sub(r'<[^>]+>', ' ', text)
    for pat in (r'\[CONFIRM', r'(?i)to confirm', r'\bNone\b', r'\bundefined\b', r'\bnull\b', r'\{\{', r'\bNaN\b', r'TODO'):
        for m in re.finditer(pat, text):
            problems.append(f'placeholder text {pat!r}: …{" ".join(text[max(0, m.start()-40):m.end()+40].split())}…')
    if '<title>' not in src or re.search(r'<title>\s*</title>', src):
        problems.append('missing <title>')
    if not p.meta_desc:
        problems.append('missing meta description')
    for q, ans in p.details:
        if not ans.strip():
            problems.append(f'FAQ without an answer: {q.strip()!r}')
    for i, n in p.ids.items():
        if n > 1:
            problems.append(f'duplicate id "{i}" ×{n}')
    base = os.path.dirname(path)
    for tag, ref in p.refs:
        u = urlparse(ref)
        if u.scheme or ref.startswith(('#', 'mailto:', 'tel:', 'data:', '//')):
            continue
        target = urldefrag(ref)[0]
        full = os.path.normpath(os.path.join(base, target))
        if target.endswith('/') or os.path.isdir(full):
            full = os.path.join(full, 'index.html')
        if not os.path.exists(full):
            problems.append(f'broken local {tag} ref: {ref}')
    return problems, len(p.details)


def main():
    pages = []
    for dirpath, _, files in os.walk(os.path.join(ROOT, 'services-v1')):
        pages += [os.path.join(dirpath, f) for f in files if f.endswith('.html')]
    failed = False
    for path in sorted(pages):
        problems, faqs = audit(path)
        rel = os.path.relpath(path, ROOT)
        print(f'{"FAIL" if problems else " ok "}  {rel}  ({faqs} FAQs)')
        for pr in problems:
            print('      -', pr)
        failed |= bool(problems)
    sys.exit(1 if failed else 0)


if __name__ == '__main__':
    main()
