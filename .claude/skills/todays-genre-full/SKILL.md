---
name: todays-genre-full
description: For a day with no Discord recs, fill every genre entry dated today in genres_data.json with a full starter set of 5 strong songs — the SEMINAL track, the MEDIA touchstone, plus 3 more verified ADD picks (score 4-5) — so the genre has 5 tracks to react to without waiting on the chat. Covers both entries on a zanger/veto day. Use whenever the user says "no recs today", "there won't be any recs", "do the full 5 for today's genre", "seminal, media and 3 more", or invokes /todays-genre-full.
---

# Today's Genre — Full Set (no-recs day)

On a normal day, `todays-genre` fills SEMINAL + MEDIA and the Discord chat
supplies the rest via `discord-genre-import`. On a day the user knows there
won't be any recs, this skill does it all in one pass: for **every** genre
entry whose `date_normalized` is today, bring it to **5 songs scored 4 or 5**:

1. SEMINAL track (identity + mirror row) — same process as `todays-genre`
2. MEDIA touchstone (identity + mirror row) — same process as `todays-genre`
3. As many `ADD` picks as needed to reach 5 qualifying songs — normally 3,
   built the same way `genre-gap-fill` builds its top-ups

It's deliberately scoped to today only. Unlike `genre-gap-fill`, it doesn't
check other genres, and it works on today's entry whatever its `status`
(usually `in_progress`, which `genre-gap-fill` skips).

**Standing invariant — never touch an existing rating.** Every edit here is
additive: new fields on the identity object, new rows appended to
`songs_listened`. Never overwrite `score` on a song or `rating` on a genre
that already has one.

## 1. Find every entry for today

Always re-fetch the live file first — this project's `main` is edited concurrently by the user's own app:
```bash
git fetch origin main -q
git show origin/main:genres_data.json > /tmp/tgf_work.json
python3 -c "import json; json.load(open('/tmp/tgf_work.json')); print('valid')"
```
Work from `/tmp/tgf_work.json`, not the possibly-stale local `genres_data.json`.

```python
import json
d = json.load(open('/tmp/tgf_work.json'))
today = "YYYY-MM-DD"  # session's current date; confirm it matches the file's date_normalized format
todays = [g for g in d if g.get('date_normalized') == today]
for g in todays:
    print(g['id'], g['genre'], g.get('status'), len(g.get('songs_listened', [])),
          json.dumps(g.get('identity'), ensure_ascii=False))
    print('  key_artists:', g.get('key_artists'))
    print('  suggested_songs:', g.get('suggested_songs'))
```
- **Zero entries**: today's genre hasn't been logged yet — say so and stop rather than guessing.
- **One entry**: proceed with it.
- **Two or more entries** (zanger/veto day): proceed with **all** of them, without asking which one.

## 2. Work out what each entry still needs

Per entry:
- **Identity**: does it already have a real (non-placeholder, not `http://url.com`)
  `seminalTrack` and `mediaTouchstones[0]`? Only fill what's missing, exactly
  as `todays-genre` does.
- **Qualifying count**: count `songs_listened` rows whose `score` coerces to 4
  or 5 (scores are strings or ints — `int(float(s))` in a try/except,
  unparseable = not qualifying). Include the identity mirrors you're about to
  add in the plan. The number of ADD picks needed is `5 - (existing qualifying + new identity mirrors)`,
  floored at 0. On a fresh entry that's exactly 3.

```python
def qualifying_count(genre):
    n = 0
    for s in genre.get('songs_listened', []):
        try:
            if int(float(s.get('score'))) >= 4:
                n += 1
        except (TypeError, ValueError):
            pass
    return n
```

If an entry already has ≥5 qualifying songs and a full identity, skip it and
say so.

## 3. Research real tracks — never invent one

Follow `todays-genre` step 2 exactly for SEMINAL and MEDIA (the film → TV →
game → ad → documentary → meme → niche preference order for MEDIA, a
different song from the seminal pick).

For the ADD picks, follow `genre-gap-fill` step 4:
- Start from the entry's `key_artists` and `suggested_songs`, but **don't
  trust them blindly** — they're generated summaries and have contained
  titles that don't exist, or artists that don't really fit the genre. Check
  that each one exists and actually fits before you use it.
- Verify every track is streamable: `WebSearch('"<artist>" "<title>" spotify track')`
  must return a real `open.spotify.com/track/...` URL for that exact song.
  Nothing verifiable → pick a different track. Never a guessed URL.
- **Spread, not repetition.** Aim for 3 tracks that together with the
  seminal and media give an honest picture of the genre: different artists
  where possible, and ideally spanning its eras or main strands (e.g. an
  early/classic cut, a peak-era one, a modern one). No artist should appear
  more than twice across the 5.
- **No duplicates** (title+artist, case-insensitive) against the entry's
  `songs_listened`, `pending_songs`, and the seminal/media picks.
- **Every ADD must earn a genuine 4 or 5.** If a candidate is a weaker fit
  on reflection, replace it — don't add it at a lower score to hit the count.
- If the genre is loosely defined or thinly indexed (a descriptive label
  more than a scene), say so plainly in the report rather than overstating
  how canonical the picks are.

Research each of today's entries independently — no reusing one genre's
picks for another.

## 4. Write non-meta reasons

Each track's `reason` assesses it **on its own musical merits against the
genre** — production, structure, instrumentation, era, scene, and why it
defines or represents the genre. Never mention Discord, a chat, "no recs
today", this skill, "topping up", or the date.

## 5. Apply to the data

For SEMINAL/MEDIA use `apply_identity` from `todays-genre` step 4 verbatim
(identity fields **and** `isIdentityTrack: true` mirror rows in
`songs_listened` — the app's Studio Repair Bay needs the mirrors). Replace an
existing placeholder identity mirror in place rather than appending a
duplicate.

For the ADD picks use `make_add` from `genre-gap-fill` step 5 verbatim
(`isAdd: true`, `role: "ADD"`, `url` prefixed `🔼 ADD: `, no
`recommendedBy`, unverifiable metadata left empty with
`spotifyMetadataFetched: false`).

```python
# per entry:
#   apply_identity(g['id'], seminal, media, today)   # only the parts that were missing
#   g['songs_listened'].extend([make_add(...), make_add(...), make_add(...)])
#   assert qualifying_count(g) >= 5, g['genre']

json.dump(d, open('/tmp/tgf_work.json', 'w'), separators=(',', ':'), ensure_ascii=False)
```

Re-run `qualifying_count` on each entry after applying and confirm it's ≥5.
If an honest search couldn't produce enough genuinely strong, verifiable
tracks, leave it short and say so in the report — don't pad.

Don't touch `genre_gap_fill_state.json`: today's entry isn't `listened` yet,
and when it becomes so, `genre-gap-fill` will count these 5 and mark it
satisfied on its own.

## 6. Commit and push to both branch and main

Same protocol as `todays-genre` step 5 — **reset the local branch to
`origin/main`'s current tip before committing, every time**, or stale copies
of other files get baked into the commit and revert the app's changes on
`main`.

```bash
cd /home/user/dailygenre
git fetch origin main -q
git checkout -B <current-feature-branch> origin/main
git status --short   # must be empty before proceeding
git tag "backup/pre-todays-genre-full-$(date +%Y%m%d-%H%M%S)" HEAD
git push origin --tags
cp /tmp/tgf_work.json genres_data.json
python3 -c "import json; json.load(open('genres_data.json')); print('valid')"
git add genres_data.json
git status --short   # must show ONLY genres_data.json — stop and investigate otherwise
git commit -m "$(cat <<'EOF'
<Genre>: add seminal, media and 3 starter tracks

<attribution lines required by the session>
EOF
)"
git push -u origin <current-feature-branch>
git fetch origin main -q   # main may have moved again
git push origin <current-feature-branch>:main
```

If the push to `main` is rejected as non-fast-forward, `main` moved: re-fetch,
check `git diff origin/main -- . ':!genres_data.json'` shows nothing, and redo
the commit on the new tip rather than forcing. If the live app touched one of
today's entries in between, reconcile field by field instead of overwriting.

## 7. Report back

- Single-genre day or zanger day (2+ entries)
- Per genre, all 5 songs as a list: role (SEMINAL / MEDIA / ADD), artist —
  title, score, and one line on why it fits; for MEDIA, where it appeared
- Any `key_artists` / `suggested_songs` claims that didn't check out
- Any genre left short of 5, and why
- Confirmation that URLs were verified, not guessed
- That the push succeeded to both branch and `main`
- The backup tag name — restore with `git show <tag>:genres_data.json > genres_data.json` then a normal commit
