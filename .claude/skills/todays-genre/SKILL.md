---
name: todays-genre
description: Fill in the SEMINAL track and MEDIA touchstone for every genre entry dated today in genres_data.json — if today has more than one entry (a regular pick plus a "zanger"/veto pick), fill in both, not just one. Use whenever the user says "today's genre", "do today's genre(s)", "fill in today's picks", or invokes /todays-genre.
---

# Today's Genre

Fills `identity.seminalTrack` and `identity.mediaTouchstones[0]` for **every** genre entry whose `date_normalized` is today's date — not just one. A day can have two entries (the normal genre-of-the-day plus a `status: "veto"` "zanger" pick); when that happens, do both without asking which one was meant.

This is the same underlying fill process as the `genre-identity` skill, just scoped to "all of today" instead of one named/ambiguous genre. If both skills are present, this one wins for "today" requests since it doesn't stop to disambiguate multi-entry days.

## 1. Find every entry for today

Always re-fetch the live file first — this project's `main` is edited concurrently by the user's own app:
```bash
git fetch origin main -q
git show origin/main:genres_data.json > /tmp/tg_work.json
python3 -c "import json; json.load(open('/tmp/tg_work.json')); print('valid')"
```
Work from `/tmp/tg_work.json`, not the possibly-stale local `genres_data.json`.

Find all matches for today (session's current date, normalized to whatever format `date_normalized` uses elsewhere in the file — check a recent entry to confirm the format before matching):
```python
import json
d = json.load(open('/tmp/tg_work.json'))
today = "YYYY-MM-DD"  # match the file's actual date_normalized format
todays = [g for g in d if g.get('date_normalized') == today]
for g in todays:
    print(g['id'], g['genre'], g.get('status'), json.dumps(g.get('identity'), ensure_ascii=False))
```
- **Zero entries**: today's genre hasn't been picked/logged yet in the file — say so and stop rather than guessing at a genre.
- **One entry**: proceed with just that one.
- **Two or more entries**: this is a zanger day — proceed with **all** of them. Don't ask the user to pick; the whole point of this skill is doing both.

For each entry, check whether it already has real (non-placeholder, non-`http://url.com`) `seminalTrack`/`mediaTouchstones` — if fully populated, skip that entry and note it as already done. Only entries missing one or both need work.

## 2. Research real candidates per genre — never invent a URL

For each entry still needing work, independently:

- Use WebSearch to find a **seminal track**: the single song most commonly cited (genre histories, RBMA/Mixmag/genre-specific press, Wikipedia, Discogs) as foundational or archetypal for that genre. Prefer an artist named in the entry's own `key_artists` field if one fits.
- Use WebSearch to find a **media touchstone**: a song with documented mainstream exposure outside the genre's core scene — film needle-drop, TV theme, viral moment, famous cover, chart crossover. Must be a different song from the seminal pick.
- Verify each candidate is **actually streamable**: search `"<artist>" "<title>" spotify track` and confirm a real `open.spotify.com/track/...` URL tied to that exact song comes back. If nothing verifiable turns up, pick a different candidate — never fall back to a guessed URL or `http://url.com`.
- If a genre is extremely niche and thinly indexed, it's fine for picks to be less iconic as long as they're real and genuinely representative — say so plainly rather than overstating the evidence.

Do this research separately for each of today's entries — a zanger and the regular pick are different genres and need independent picks (no reusing one entry's seminal as another's media, etc.).

## 3. Write non-meta reasons

Each track needs a `reason` assessing it **on its own musical merits against its genre** — never referencing Discord, a chat thread, "the day's genre was X", who recommended it, or any origin story. Describe what's actually happening in the track (production, structure, instrumentation, era, scene) and why that does or doesn't define/represent the genre. Convention: assistant-picked seminal/media tracks score 4–5, since they're presented as confident, verified choices.

## 4. Apply to the data — for each entry

Both `identity.seminalTrack` / `identity.mediaTouchstones[0]` **and** a mirrored row in `songs_listened` are required — the app's Studio Repair Bay can only find/edit an identity track if it's also mirrored there with `isIdentityTrack: true`.

```python
import json
d = json.load(open('/tmp/tg_work.json'))

def apply_identity(genre_id, seminal, media, today_iso):
    for g in d:
        if g['id'] == genre_id:
            g['identity']['seminalTrack'] = seminal
            g['identity']['mediaTouchstones'] = [media]

            seminal_mirror = dict(seminal)
            seminal_mirror.update({
                "artists": [seminal["artist"]],
                "isIdentityTrack": True, "identityType": "seminal",
                "identityIndex": -1, "identityLabel": "Seminal track",
                "added": today_iso,
            })
            media_mirror = dict(media)
            media_mirror.update({
                "artists": [media["artist"]],
                "isIdentityTrack": True, "identityType": "media",
                "identityIndex": 0, "identityLabel": "Media track",
                "added": today_iso,
            })
            g['songs_listened'].extend([seminal_mirror, media_mirror])
            return
    raise ValueError(f"no genre with id {genre_id}")

# Example shape for each of seminal/media:
# seminal = {"artist": "...", "title": "...", "url": "https://open.spotify.com/track/...",
#            "spotifyUrl": "https://open.spotify.com/track/...", "score": 5,
#            "reason": "...", "source": "spotify"}
# media = {"artist": "...", "title": "...", "mediaTitle": "...", "mediaType": "film",
#          "url": "https://open.spotify.com/track/...", "spotifyUrl": "https://open.spotify.com/track/...",
#          "score": 4, "reason": "...", "source": "spotify", "media": "..."}

# Call apply_identity(...) once per entry from step 1 that needed work.

json.dump(d, open('/tmp/tg_work.json', 'w'), separators=(',', ':'), ensure_ascii=False)
```

If an entry already has an existing seminal or media that's a placeholder (`http://url.com`) or previously flagged as fabricated, replace that entry in place rather than appending a duplicate — check `songs_listened` for an existing `isIdentityTrack` row of the same `identityType` first and overwrite it.

## 5. Commit and push to both branch and main

This repo's convention (see git history): work happens on a feature branch, mirrored to `main`, because the user's own app writes to `main` concurrently. Always re-fetch immediately before merging — `origin/main` moves between steps in this workflow regularly.

**CRITICAL — reset the local branch to `origin/main`'s current tip before committing, every time.** This has caused real production incidents: if your local checkout of the feature branch predates a change the live app pushed to `main` (a redesign, a dependency bump, anything outside `genres_data.json`), then copying your work file over `genres_data.json` and committing bakes *stale* versions of every other file into the commit's tree, which then silently reverts the app's other changes when pushed to `main`.

```bash
cd /home/user/dailygenre
git fetch origin main -q
git checkout -B claude/todays-genre-skill-ma9uw9 origin/main   # hard-reset local branch to the live tip
git status --short   # must be empty before proceeding
cp /tmp/tg_work.json genres_data.json
python3 -c "import json; json.load(open('genres_data.json')); print('valid')"
git add genres_data.json
git status --short   # must show ONLY genres_data.json as modified — stop and investigate if anything else appears
git commit -m "$(cat <<'EOF'
Add seminal and media tracks for today's genre(s)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
git push -u origin claude/todays-genre-skill-ma9uw9
git fetch origin main -q   # main may have moved again during the steps above
git push origin claude/todays-genre-skill-ma9uw9:main
```

Because the branch was just reset to `origin/main`'s tip, the branch-to-main push is a plain fast-forward. If the final `git push ...:main` is rejected as non-fast-forward, `main` moved again after your reset: re-fetch, re-verify with `git diff origin/main -- . ':!genres_data.json'` that nothing but your intended file differs, and redo the commit on the new tip rather than forcing.

If `git diff` between the pre-fetch and post-fetch `genres_data.json` shows one of today's entries was also touched by the live app in between, stop and do a manual field-level reconciliation instead of blindly overwriting.

## 6. Report back

For each of today's entries, tell the user plainly:
- Whether it was a zanger day (2+ entries) or a single-genre day
- Per genre: the genre name, and both picks (artist — title) with one line each on why they fit, or "already filled, skipped" if it was already done
- Confirmation URLs were verified as real, not guessed
- That the push succeeded to both branch and `main`
