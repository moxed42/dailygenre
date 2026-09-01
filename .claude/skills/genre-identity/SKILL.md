---
name: genre-identity
description: Fill in the SEMINAL track and MEDIA touchstone for a genre in genres_data.json — either today's genre-of-the-day (no argument) or a named genre (e.g. "/genre-identity Kuduro"). Use whenever the user asks to "add seminal and media for today's genre", "fill in identity for X", or similar.
---

# Genre Identity Filler

Fills `identity.seminalTrack` and `identity.mediaTouchstones[0]` for one genre in `genres_data.json`, using real, verified tracks — never invented ones.

## 1. Find the target genre

- **No argument** ("today's genre", "yesterday's genre"): find the genre object whose `date_normalized` matches the relevant date (today = the session's current date; yesterday = one day back). There can be more than one entry for a date if one is `status: "veto"` (a zanger) — that's not an error, just confirm which one the user means if ambiguous.
- **Named argument**: match by `genre` field (case-insensitive substring is fine if unambiguous).

Always re-fetch the live file first — this project's `main` is edited concurrently by the user's own app:
```bash
git fetch origin main -q
git show origin/main:genres_data.json > /tmp/gid_work.json
python3 -c "import json; json.load(open('/tmp/gid_work.json')); print('valid')"
```
Work from `/tmp/gid_work.json`, not the possibly-stale local `genres_data.json`.

Check the current state before doing anything:
```python
import json
d = json.load(open('/tmp/gid_work.json'))
for g in d:
    if g['id'] == TARGET_ID:
        print(g['genre'], g.get('date_normalized'), g.get('status'))
        print(json.dumps(g.get('identity'), ensure_ascii=False))
```
If `seminalTrack` and `mediaTouchstones` are already populated with real (non-`http://url.com`) URLs, say so and stop — don't overwrite existing real picks unless the user asked for a fix.

## 2. Research real candidates — never invent a URL

This is the step that has burned this project before: a plausible-sounding artist/title/URL invented from training knowledge is a fabrication, and past sessions have shipped several (e.g. a nonexistent "El Nazional – Tuki Tuki" for Changa tuki) that the user later couldn't find anywhere.

- Use WebSearch to find a **seminal track**: the single song most commonly cited (by genre histories, RBMA/Mixmag/genre-specific press, Wikipedia, Discogs) as foundational or archetypal for the genre. Prefer a track by an artist the genre's own `key_artists` field names, if one fits.
- Use WebSearch to find a **media touchstone**: a song with documented mainstream exposure outside the genre's core scene — a film needle-drop, a TV theme, a viral moment, a famous cover, a chart crossover single. It must be a *different* song from the seminal pick (no duplicates across seminal/media/canon).
- Verify each candidate is **actually streamable**: search `"<artist>" "<title>" spotify track` and confirm a real `open.spotify.com/track/...` URL comes back tied to that exact song. If nothing verifiable turns up, pick a different candidate — do not fall back to a guessed URL or `http://url.com`.
- If the genre is extremely niche (a handful of prior fills — Acid breaks, Algorave — had almost nothing indexed), it's fine for the seminal/media picks to be less iconic as long as they're real and genuinely representative; say so plainly rather than forcing a stronger claim than the evidence supports.

## 3. Write non-meta reasons

Each track needs a `reason` that assesses the track **on its own musical merits against the genre** — never referencing Discord, a chat thread, "the day's genre was X", who recommended it, or any origin story. Describe what's actually happening in the track (production choices, structure, instrumentation, era, scene) and why that does or doesn't define/represent the genre. This project's established scoring convention: seminal and media picks made by the assistant (not community recs) should score 4–5, since they're presented as confident, verified choices.

## 4. Apply to the data

Both `identity.seminalTrack` / `identity.mediaTouchstones[0]` **and** a mirrored row in `songs_listened` are required — the app's Studio Repair Bay can only find/edit an identity track if it's also mirrored there with `isIdentityTrack: true`. This was a real bug (`"could not find repair rows"`) caused by identity-only entries with no mirror.

```python
import json
d = json.load(open('/tmp/gid_work.json'))

seminal = {
    "artist": "...", "title": "...",
    "url": "https://open.spotify.com/track/...",
    "spotifyUrl": "https://open.spotify.com/track/...",
    "score": 5, "reason": "...", "source": "spotify",
}
media = {
    "artist": "...", "title": "...",
    "mediaTitle": "...",  # what the touchstone is (film/show/tour/compilation)
    "mediaType": "film",  # film | tv | internet | ...
    "url": "https://open.spotify.com/track/...",
    "spotifyUrl": "https://open.spotify.com/track/...",
    "score": 4, "reason": "...", "source": "spotify",
    "media": "...",  # same as mediaTitle
}

for g in d:
    if g['id'] == TARGET_ID:
        g['identity']['seminalTrack'] = seminal
        g['identity']['mediaTouchstones'] = [media]

        seminal_mirror = dict(seminal)
        seminal_mirror.update({
            "artists": [seminal["artist"]],
            "isIdentityTrack": True, "identityType": "seminal",
            "identityIndex": -1, "identityLabel": "Seminal track",
            "added": TODAY_ISO_DATE,
        })
        media_mirror = dict(media)
        media_mirror.update({
            "artists": [media["artist"]],
            "isIdentityTrack": True, "identityType": "media",
            "identityIndex": 0, "identityLabel": "Media track",
            "added": TODAY_ISO_DATE,
        })
        g['songs_listened'].extend([seminal_mirror, media_mirror])

json.dump(d, open('/tmp/gid_work.json', 'w'), separators=(',', ':'), ensure_ascii=False)
```

If the genre already has an existing seminal or media that's a placeholder (`http://url.com`) or previously flagged as fabricated, replace that entry in place rather than appending a duplicate — check `songs_listened` for an existing `isIdentityTrack` row of the same `identityType` first and overwrite it.

## 5. Commit and push to both branch and main

This repo's convention (see git history): work happens on `claude/genre-spinner-august-backlog-6lomg9`, mirrored to `main`, because the user's own app writes to `main` concurrently. Always re-fetch immediately before merging — `origin/main` moves between steps in this workflow regularly.

```bash
cd /home/user/dailygenre
cp /tmp/gid_work.json genres_data.json
python3 -c "import json; json.load(open('genres_data.json')); print('valid')"
git add genres_data.json
git commit -m "$(cat <<'EOF'
Add seminal and media tracks for <Genre>

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
git fetch origin main -q
git merge -s ours origin/main -m "Merge origin/main into feature branch" -q
git push -u origin claude/genre-spinner-august-backlog-6lomg9
git push origin claude/genre-spinner-august-backlog-6lomg9:main
```

`-s ours` is correct here specifically because the working tree at commit time already has the fully-reconciled content (this skill only ever touches one genre's identity fields, so there's essentially never a real conflict with concurrent app edits elsewhere in the file) — it just needs the merge commit to record both parents. If `git diff` between the pre-fetch and post-fetch `genres_data.json` shows the *same* genre was also touched by the live app in between, stop and do a manual field-level reconciliation instead of blindly overwriting.

## 6. Report back

Tell the user, plainly:
- The genre and date filled in
- Both picks (artist — title) with one line each on why they fit
- Confirmation both URLs were verified as real, not guessed
- That the push succeeded to both branch and `main`
