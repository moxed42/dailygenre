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

blocks = []
for g in aug:
    lines = []
    lines.append(f"**{date_label(g['date_normalized'])} — {g['genre']}**")
    lines.append(stars(g.get('rating')))

    fav_title = g.get('favorite_song')
    if fav_title:
        lines.append(f"🏆 {fav_title}")

    songs = [s for s in g.get('songs_listened', []) if not s.get('isPending')]
    if songs:
        for s in songs:
            lines.append(song_line(s))
            lu = s.get('levelUp')
            if lu:
                lines.append(song_line(lu, indent='    ↳ '))
    else:
        lines.append('_(no songs logged)_')

    blocks.append('\n'.join(lines))

# Chunk into <2000-char pieces, splitting only between blocks
chunks = []
current = []
current_len = 0
SEP = '\n\n'
LIMIT = 1900  # leave headroom

for block in blocks:
    add_len = len(block) + (len(SEP) if current else 0)
    if current and current_len + add_len > LIMIT:
        chunks.append(SEP.join(current))
        current = [block]
        current_len = len(block)
    else:
        current.append(block)
        current_len += add_len

if current:
    chunks.append(SEP.join(current))

for i, chunk in enumerate(chunks, 1):
    path = f'/tmp/discord_summary_{i}.txt'
    with open(path, 'w') as f:
        f.write(chunk)
    print(f"=== Chunk {i}/{len(chunks)} ({len(chunk)} chars) -> {path} ===")
    print(chunk)
    print()
