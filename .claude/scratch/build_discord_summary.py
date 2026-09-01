import json, datetime

d = json.load(open('/tmp/summary_data.json'))

aug = [g for g in d if str(g.get('date_normalized', '')).startswith('2026-08') and g.get('status') != 'veto']
aug.sort(key=lambda g: g.get('date_normalized', ''))

def stars(rating):
    if not rating or rating == 'zanger':
        return '☆☆☆☆☆ (unrated)'
    n = int(rating)
    return f"{'★' * n}{'☆' * (5 - n)} ({n}/5)"

def date_label(dn):
    dt = datetime.date.fromisoformat(dn)
    return dt.strftime('%b %-d')

def reaction_emoji(v):
    try:
        n = int(v)
    except (TypeError, ValueError):
        return '•'
    return {3: '👍', 2: '🤷', 1: '👎'}.get(n, '•')

def song_line(song, indent=''):
    artist = song.get('artist', '?')
    title = song.get('title', '?')
    score = song.get('score')
    score_str = f" ({score}/5)" if score not in (None, '', 'null') else ''
    tag = ''
    if song.get('identityType') == 'seminal':
        tag = ' `SEMINAL`'
    elif song.get('identityType') == 'media':
        tag = ' `MEDIA`'
    return f"{indent}{reaction_emoji(song.get('reaction'))} {artist} — {title}{score_str}{tag}"

def best_song_label(g):
    """genre.favorite_song if set, else the highest-scored 👍-reaction song, marked as inferred."""
    fav = g.get('favorite_song')
    if fav:
        return f"🏆 {fav}", False
    songs = [s for s in g.get('songs_listened', []) if not s.get('isPending')]
    liked = [s for s in songs if str(s.get('reaction')) == '3']
    pool = liked or songs
    if not pool:
        return None, False
    def score_of(s):
        try:
            return float(s.get('score') or 0)
        except (TypeError, ValueError):
            return 0
    best = max(pool, key=score_of)
    return f"{best.get('artist','?')} — {best.get('title','?')}", True

def chunk_blocks(blocks, limit=1900, sep='\n\n'):
    chunks, current, current_len = [], [], 0
    for block in blocks:
        add_len = len(block) + (len(sep) if current else 0)
        if current and current_len + add_len > limit:
            chunks.append(sep.join(current))
            current, current_len = [block], len(block)
        else:
            current.append(block)
            current_len += add_len
    if current:
        chunks.append(sep.join(current))
    return chunks

def write_chunks(blocks, prefix):
    chunks = chunk_blocks(blocks)
    for i, chunk in enumerate(chunks, 1):
        path = f'/tmp/{prefix}_{i}.txt'
        with open(path, 'w') as f:
            f.write(chunk)
        print(f"=== {prefix} {i}/{len(chunks)} ({len(chunk)} chars) -> {path} ===")
        print(chunk)
        print()
    return chunks

# ---- Detailed per-genre chunks (with description) ----
detail_blocks = []
for g in aug:
    lines = []
    lines.append(f"**{date_label(g['date_normalized'])} — {g['genre']}**")
    desc = g.get('vibe') or g.get('summary') or ''
    if desc:
        lines.append(f"_{desc}_")
    lines.append(stars(g.get('rating')))

    fav_label, inferred = best_song_label(g)
    if fav_label and not inferred:
        lines.append(fav_label)

    songs = [s for s in g.get('songs_listened', []) if not s.get('isPending')]
    if songs:
        for s in songs:
            lines.append(song_line(s))
            lu = s.get('levelUp')
            if lu:
                lines.append(song_line(lu, indent='    ↳ '))
    else:
        lines.append('_(no songs logged)_')

    detail_blocks.append('\n'.join(lines))

write_chunks(detail_blocks, 'discord_summary')

# ---- Compact overview: date | genre | rating | favorite | 1-sentence description ----
overview_blocks = []
for g in aug:
    fav_label, inferred = best_song_label(g)
    fav_str = fav_label.replace('🏆 ', '') if fav_label else '—'
    if inferred:
        fav_str += ' (inferred)'
    desc = g.get('vibe') or ''
    line = f"**{date_label(g['date_normalized'])} — {g['genre']}** — {stars(g.get('rating'))} — 🏆 {fav_str}\n_{desc}_"
    overview_blocks.append(line)

write_chunks(overview_blocks, 'discord_overview')

# ---- Ultra overview: date | genre | rating, one line each, single message ----
ultra_lines = [
    f"{date_label(g['date_normalized'])} — {g['genre']} — {stars(g.get('rating'))}"
    for g in aug
]
ultra = '\n'.join(ultra_lines)
with open('/tmp/discord_ultra_overview.txt', 'w') as f:
    f.write(ultra)
print(f"=== discord_ultra_overview ({len(ultra)} chars) -> /tmp/discord_ultra_overview.txt ===")
print(ultra)
