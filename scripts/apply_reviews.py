#!/usr/bin/env python3
"""Put the picked Google reviews into the area content files (skill field format).

  python scripts/apply_reviews.py

Reads  content/reviews/google-reviews-*.csv  (the newest export) and  content/reviews/picks.json,
writes reviews.N.tag / .quote / .by into content/areas/<slug>.json (and the review link into
extras reviews.N.url), and content/reviews/ledger.json ({review_id: [slugs]}).

Card text follows the city-suburban-service-area-page skill: the review's opening, verbatim,
cut to 60-70 words at a sentence end (or word 70 with an ellipsis). Fails if a pick is under 60
words, isn't 5 stars, or a review would appear on more than two pages.
"""
import csv, glob, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CONTENT = os.path.join(HERE, '..', 'content')


def clean(t):
    t = re.sub(r'[\U0001F000-\U0001FAFF☀-➿⭐⭕]+', '', t or '')  # emoji, incl. the ⭐ some reviewers type
    return re.sub(r'\s+', ' ', t).strip()


def extract(text):
    words = text.split(' ')
    if len(words) < 60:
        return None
    if len(words) <= 70:
        return text
    best = None
    for n in range(60, 71):  # prefer a sentence end inside the window
        if re.search(r'[.!?]["\')]*$', words[n - 1]):
            best = n
    cut = best or 70
    out = ' '.join(words[:cut])
    return out if best else out.rstrip(',;:') + '…'


def main():
    export = sorted(glob.glob(os.path.join(CONTENT, 'reviews', 'google-reviews-*.csv')))[-1]
    rows = {int(r['num']): r for r in csv.DictReader(open(export, encoding='utf-8-sig'))}
    picks = json.load(open(os.path.join(CONTENT, 'reviews', 'picks.json'), encoding='utf-8'))
    ledger, problems = {}, []

    for slug, chosen in picks.items():
        if slug.startswith('_'):
            continue
        path = os.path.join(CONTENT, 'areas', slug + '.json')
        data = json.load(open(path, encoding='utf-8'))
        for i, p in enumerate(chosen, 1):
            r = rows[p['num']]
            text = clean(r['text'])
            ex = extract(text)
            if float(r['rating']) < 5:
                problems.append(f"{slug}: #{p['num']} is {r['rating']} stars")
            if not ex:
                problems.append(f"{slug}: #{p['num']} is under 60 words")
                continue
            if re.search(r'[​-‏⁠﻿]', ex):
                problems.append(f"{slug}: #{p['num']} contains invisible characters")
            assert text.startswith(ex.rstrip('…')), p['num']  # a true prefix, never edited
            data['area'][f'reviews.{i}.tag'] = p['tag']
            data['area'][f'reviews.{i}.quote'] = ex
            data['area'][f'reviews.{i}.by'] = f"{r['author']} · {r['date_utc'][:4]}"
            data['extras'][f'reviews.{i}.url'] = r['review_url']
            ledger.setdefault(r['review_id'], []).append(slug)
        # the reviews are in, so their [CONFIRM] note goes
        notes = data['extras'].get('confirmNotes')
        if notes:
            data['extras']['confirmNotes'] = [n for n in notes if n.get('block') != 'B4 Reviews']
        json.dump(data, open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        print(f"{slug}: {len(chosen)} reviews")

    over = {k: v for k, v in ledger.items() if len(v) > 2}
    if over:
        problems.append(f'reviews on more than two pages: {over}')
    json.dump(ledger, open(os.path.join(CONTENT, 'reviews', 'ledger.json'), 'w', encoding='utf-8'), indent=1)
    if problems:
        sys.exit('PROBLEMS:\n- ' + '\n- '.join(problems))


if __name__ == '__main__':
    main()
