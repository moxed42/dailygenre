---
name: genre-gap-fill
description: Check every listened (or veto) genre in genres_data.json for at least 5 songs scored 4 or 5, and top up any that fall short with real, verified tracks. Tracks which genres have already been checked in a committed state file so repeat runs only look at genres that still need it. Use whenever the user says "fill the gaps", "top up genres", "make sure every genre has 5 good songs", or invokes /genre-gap-fill.
---

# Genre Gap Fill

Ensures every genre that's actually been listened to has enough highly-rated
songs to be usable for a taste reading (`genre-taste-reading`'s threshold is
5 *reacted* tracks — this skill makes sure 5 tracks exist to react to in the
first place, each already scored 4 or 5 so a full set of reactions would
clear that bar).

## 1. Load state and the live file

Always re-fetch — this project's `main` is edited concurrently by the user's own app:
```bash
git fetch origin main -q
git show origin/main:genres_data.json > /tmp/ggf_work.json
git show origin/main:genre_gap_fill_state.json > /tmp/ggf_state.json 2>/dev/null || echo '{"last_run_at": null, "satisfied_genre_ids": []}' > /tmp/ggf_state.json
python3 -c "import json; json.load(open('/tmp/ggf_work.json')); json.load(open('/tmp/ggf_state.json')); print('valid')"
```

`genre_gap_fill_state.json` lives at the repo root next to `genres_data.json`
and is committed like any other data file. It has two fields:
- `last_run_at`: ISO timestamp of the last completed run (informational).
- `satisfied_genre_ids`: genre `id`s this skill has already confirmed have
  ≥5 qualifying songs. **These are skipped without inspection on future
  runs** — this is the "since last checked" mechanism the user asked for,
  and it's how repeat runs avoid re-examining genres that are already done.

If the user asks for a full recheck (or passes `--recheck-all`), ignore
`satisfied_genre_ids` for this run instead of skipping.

## 2. Find genres that need checking

```python
import json
d = json.load(open('/tmp/ggf_work.json'))
state = json.load(open('/tmp/ggf_state.json'))
satisfied = set(state.get('satisfied_genre_ids', []))

candidates = [g for g in d if g.get('status') in ('listened', 'veto') and g['id'] not in satisfied]
print(len(candidates), 'genres to check')
```

`unlistened` and `excluded` genres are out of scope — there's nothing to
top up on a genre that hasn't happened yet.

## 3. Count qualifying songs per candidate genre

A song **qualifies** toward the 5-song count only if its `score` coerces to
`4` or `5` (scores are stored as either strings or ints across this file —
coerce with `int(float(s))` inside a try/except, treat anything that
doesn't parse as non-qualifying rather than crashing). This counts every
row in `songs_listened` regardless of `role`/flags (CANON, ADD, identity
mirrors, level-ups all count) — the point is "5 songs someone could react
to and the genre would clear the taste-reading bar," not where the song
came from.

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

for g in candidates:
    g['_qc'] = qualifying_count(g)

already_fine = [g for g in candidates if g['_qc'] >= 5]
short = [g for g in candidates if g['_qc'] < 5]
```

Genres in `already_fine` need no new songs — just mark them satisfied in
step 6. Genres in `short` need `5 - g['_qc']` more qualifying songs each.

## 4. Source real, verified top-up tracks — never invent one

Same rule as `genre-identity`: a plausible-sounding invented title/artist/URL
is a fabrication and has burned this project before. For each genre in
`short`:

- Start from the genre's own `suggested_songs` and `key_artists` fields —
  these were already curated as fitting the genre, so they're the first
  place to look for real, verifiable tracks.
- For each candidate, verify it's actually streamable: `WebSearch('"<artist>" "<title>" spotify track')`
  and confirm a real `open.spotify.com/track/...` URL comes back tied to
  that exact song. A suggested title that doesn't resolve to anything
  indexed (this happens — a few titles in this project's `suggested_songs`
  fields turned out not to exist on Spotify) is skipped in favor of another
  real track by the same or a closely related key artist, not forced through
  with a guessed URL.
- **No duplicates.** Before adding, check the candidate's title+artist
  (case-insensitive) doesn't already appear in that genre's `songs_listened`
  or `pending_songs`.
- **Every added song must earn a genuine 4 or 5.** This skill isn't
  recording community opinion (which gets added honestly regardless of
  fit, per `discord-genre-import`) — it's deliberately topping up with
  strong picks, so only add a track once you're confident it's a real 4-5
  fit for the genre. If a candidate turns out to be a weaker fit on
  reflection, don't add it at a lower score to hit the count — find a
  different, genuinely strong candidate instead.
- Write each `reason` assessing the track on its own musical merits against
  the genre — never meta (no mentioning this skill, "topping up," a chat
  origin, or the date).

## 5. Apply to the data

Each added song is a plain assistant pick: `isAdd: true`, `role: "ADD"`,
no `isPending`/`isLevelUp`/`isIdentityTrack`. Mirror the shape already used
elsewhere in this file (see any existing `role: "ADD"` entry for the full
field list); fields you can't verify (`durationMs`, `isrc`, `artwork`,
`album`, exact `releaseDate`) stay empty/null with `spotifyMetadataFetched: false`
rather than guessed.

```python
TODAY = "YYYY-MM-DD"  # today's date

def make_add(title, artist, artists, spotify_id, score, reason, release_year=None):
    return {
        "url": f"https://open.spotify.com/track/{spotify_id}",
        "score": str(score), "reason": reason, "title": title, "artist": artist,
        "artists": artists, "artwork": "", "source": "spotify", "added": TODAY,
        "spotifyId": spotify_id, "spotifyUrl": f"https://open.spotify.com/track/{spotify_id}",
        "album": "", "durationMs": None, "isrc": "",
        "spotifyMetadataFetched": False, "spotifyMetadataFetchedAt": "",
        "eraYear": "", "eraDecade": "", "releaseDate": "", "releaseYear": release_year,
        "releasePrecision": "", "releaseSource": "",
        "reaction": None, "originFit": None, "nominatedFit": None,
        "promotedFrom": "", "promotedFromFit": None,
        "isPromote": False, "isAdd": True, "isIdentityTrack": False, "role": "ADD",
        "__levelUpParentKey": "", "levelUpParentKey": "",
        "levelUpParentTitle": "", "levelUpParentArtist": "", "levelUpParentUrl": "",
    }

# for each genre in `short`, append (5 - qc) make_add(...) results to g['songs_listened']
```

After adding, re-run `qualifying_count` on the genre and confirm it's now
≥5 before moving on — if a sourced track's score genuinely can't clear 4,
it doesn't count, so don't assume the count rose just because you appended
rows.

## 6. Update state

Every genre now at ≥5 qualifying songs (whether it started that way or was
topped up) goes into `satisfied_genre_ids`. Genres that still fall short
even after an honest search (nothing real/verifiable enough turned up) are
**not** marked satisfied — leave them out so a future run tries again
rather than silently giving up on them forever. Say so plainly in the
report if this happens.

```python
newly_satisfied = {g['id'] for g in candidates if qualifying_count(g) >= 5}
state['satisfied_genre_ids'] = sorted(set(state.get('satisfied_genre_ids', [])) | newly_satisfied)
state['last_run_at'] = "2026-09-20T00:00:00Z"  # actual current UTC timestamp

json.dump(d, open('/tmp/ggf_work.json', 'w'), separators=(',', ':'), ensure_ascii=False)
json.dump(state, open('/tmp/ggf_state.json', 'w'), indent=2)
```

## 7. Commit and push to both branch and main

Same protocol as `genre-identity` and `discord-genre-import` — this repo's
`main` is written concurrently by the user's own app, so the local branch
must be hard-reset to `origin/main`'s tip immediately before committing,
every time, no matter how recently you fetched.

```bash
cd /home/user/dailygenre
git fetch origin main -q
git checkout -B <current-feature-branch> origin/main
git status --short   # must be empty — if not, stop and investigate
cp /tmp/ggf_work.json genres_data.json
cp /tmp/ggf_state.json genre_gap_fill_state.json
python3 -c "import json; json.load(open('genres_data.json')); json.load(open('genre_gap_fill_state.json')); print('valid')"
git add genres_data.json genre_gap_fill_state.json
git status --short   # must show ONLY these two files — stop and investigate if anything else appears
git commit -m "$(cat <<'EOF'
Top up genre gap-fill: <N> genres checked, <M> topped up

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
git push -u origin <current-feature-branch>
git fetch origin main -q
git push origin <current-feature-branch>:main
```

Because the branch was just reset to `origin/main`'s tip, the final push is
a plain fast-forward. If it's rejected as non-fast-forward, `main` moved
again — re-fetch, diff `genres_data.json` and `genre_gap_fill_state.json`
specifically against the new tip, and redo the commit rather than forcing.
If the diff shows the *same* genre you topped up was also touched by the
live app in between (e.g. a new community rating landed on it), reconcile
field-by-field instead of blindly overwriting.

## 8. Report back

- How many genres were checked this run vs. skipped as already-satisfied
  from the state file
- For each genre topped up: how many songs were added, with artist —
  title — score, and the new qualifying count (should be exactly 5 unless
  it started above)
- Any genre that still falls short after an honest search, and why (say
  plainly if a genre is niche enough that 5 genuinely-strong real
  candidates don't exist yet — don't force weak picks to hit the number)
- Confirmation the push succeeded to both branch and `main`
