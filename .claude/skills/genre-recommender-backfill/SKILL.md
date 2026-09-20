---
name: genre-recommender-backfill
description: Retroactively populate recommendedBy (Discord nicknames) on existing CANON/ROUTED songs in genres_data.json by matching them back to who posted them, scoped to that specific genre's day. Works incrementally off a full Discord history export that may arrive in multiple date-range chunks over time, tracking which date ranges and genres have already been covered so repeat runs only process what's new. Use when the user uploads a full (or partial) Discord history export and asks to "backfill who recommended these", "add the recommender badges", or invokes /genre-recommender-backfill.
---

# Genre Recommender Backfill

Adds `recommendedBy: ["<nickname>", ...]` to existing `CANON`/`ROUTED` rows
in `songs_listened`, scoped strictly per genre — the same song recommended
by different people for different genres on different days gets a
*separate* `recommendedBy` on each genre's own row for it, never merged or
carried across genres. This is the retroactive counterpart to the
`recommendedBy` capture `discord-genre-import` now does going forward; this
skill is for everything that predates that.

**Standing invariant — never touch an existing rating.** The only field
this skill ever writes on an existing row is `recommendedBy`. Never
`score`, never `rating`, never anything else on a row that already exists.

**This is expected to run in multiple passes.** A full history export is
large and may itself arrive truncated or split by date range (this has
already happened once — an upload cut off mid-file). Never treat a partial
export as the whole story; track coverage explicitly so a later chunk is a
clean continuation, not a redo or a silent gap.

## 1. Load state, the live file, and the export

```bash
git fetch origin main -q
git show origin/main:genres_data.json > /tmp/grb_work.json
git show origin/main:genre_recommender_backfill_state.json > /tmp/grb_state.json 2>/dev/null || echo '{"covered_ranges": [], "checked_genre_ids": []}' > /tmp/grb_state.json
python3 -c "import json; json.load(open('/tmp/grb_work.json')); json.load(open('/tmp/grb_state.json')); print('valid')"
```
`genre_recommender_backfill_state.json` lives at the repo root, committed like `genres_data.json`. Two fields:
- `covered_ranges`: list of `{"after": "ISO date", "before": "ISO date"}` — date spans already scanned across all runs so far, merged/deduped.
- `checked_genre_ids`: genre `id`s already processed (whether or not every song found a match) — skipped on future runs even if their date falls inside a newly-uploaded range that overlaps already-covered ground.

**If the export file fails to parse as JSON, don't give up on the whole thing** — this has happened (a truncated upload). Find the last complete element under `messages` (each is a top-level array item — locate the last one whose closing brace is followed by either a `,` and a new object, or nothing) and repair: truncate there, close the array and object, and derive the *actual* covered date range from the min/max message timestamps you got — never trust a claimed `dateRange.before` if the file was truncated, since the true upper bound is wherever the data actually stops. Tell the user plainly what range was recovered vs. what's missing, per the standing "no silent partial work" rule in step 5.

## 2. Determine what's newly in scope

```python
import json
chat = json.load(open(EXPORT_PATH))
msgs = chat['messages']
timestamps = [m['timestamp'] for m in msgs]
actual_after, actual_before = min(timestamps), max(timestamps)
```
This export's real range is `[actual_after, actual_before]` — intersect this against `covered_ranges` in the state file to find what's actually new (if the whole thing overlaps already-covered ground, say so and stop; if it's partially new, only the new slice needs work).

Parse genre-of-the-day announcement windows the same way `discord-genre-import` does (step 1 of that skill — same regex, same 2-day window cap, same "only genres with an actual announcement in this export are in scope" rule).

Then, from `genres_data.json`:
```python
d = json.load(open('/tmp/grb_work.json'))
state = json.load(open('/tmp/grb_state.json'))
checked = set(state['checked_genre_ids'])
targets = [g for g in d if g.get('date_normalized') and g['id'] not in checked
           and any(w for w in genre_windows if w['genre'].lower() == g['genre'].lower()
                   and w['start'] <= g['date_normalized'] <= w['end'])]
```
Only genres whose announcement window actually appears in *this* export and haven't been checked before are in scope. A genre whose date falls outside every window in this export (including the still-missing part of a truncated upload) simply isn't touched this run — it stays for a future pass, not silently skipped forever.

## 3. Match each CANON/ROUTED row back to its poster

For each target genre, within its announcement window in the export, scan every message for a link matching each of the genre's existing `CANON`/`ROUTED` rows in `songs_listened` — by `spotifyId` (or the ID embedded in whatever `url`/`spotifyUrl` the row already stores), same fallback-source matching `discord-genre-import` uses (Spotify/Apple Music/SoundCloud/YouTube/Bandcamp). Only rows without an existing `recommendedBy` need this — never overwrite one already set (e.g. by `discord-genre-import` capturing it live going forward).

- **One match**: `recommendedBy = ["<their nickname>"]`.
- **Multiple people posted the same link in that window**: `recommendedBy` gets every one of their nicknames.
- **No match found**: leave `recommendedBy` unset on that row. This is a normal, expected outcome for rows that predate this whole tracking effort or came from `genre-identity`/`genre-gap-fill` seminal/media/ADD/LEVEL UP picks (which never get a `recommendedBy` — no human posted those). Don't guess.
- **LEVEL UP, SEMINAL, MEDIA, ADD rows never get `recommendedBy`** — only `CANON` and `ROUTED`, since those are the only roles that mean "a person recommended this."

Mark the genre's `id` into `checked_genre_ids` once processed, regardless of how many of its rows matched — this genre's chat window has now been fully examined against this export; a future export covering a different date range won't need to re-examine it unless the user explicitly asks for a recheck.

## 4. Apply, verify, push

Same protocol as every other skill here, with the extra state file:
```bash
cd /home/user/dailygenre
git fetch origin main -q
git checkout -B <current-feature-branch> origin/main
git status --short   # must be empty
git tag "backup/pre-recommender-backfill-$(date +%Y%m%d-%H%M%S)" HEAD
git push origin --tags
cp /tmp/grb_work.json genres_data.json
cp /tmp/grb_state.json genre_recommender_backfill_state.json
python3 -c "import json; json.load(open('genres_data.json')); json.load(open('genre_recommender_backfill_state.json')); print('valid')"
git add genres_data.json genre_recommender_backfill_state.json
git status --short   # must show ONLY these two files
git commit -m "$(cat <<'EOF'
Backfill recommendedBy for <date range>: <N> genres, <M> rows badged

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
git push -u origin <current-feature-branch>
git fetch origin main -q
git push origin <current-feature-branch>:main
```
If the final push is rejected as non-fast-forward, `main` moved again — re-fetch, diff both files against the new tip, and redo the commit rather than forcing.

## 5. Report back — never claim more coverage than was actually done

- The export's actual recovered date range (explicitly flag if it was truncated and what's missing)
- How many genres were newly processed this run vs. already `checked_genre_ids` and skipped
- Per genre: how many rows got a `recommendedBy`, and how many stayed unmatched (with a one-line reason if it's a pattern, e.g. "posted as an Apple Music link the regex didn't catch" vs. just "no post found")
- Explicitly name the date span still **not** covered by any export so far, so it's clear what a future upload needs to include
- The backup tag name, and confirmation the push succeeded to both branch and `main`
