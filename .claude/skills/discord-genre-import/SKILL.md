---
name: discord-genre-import
description: Given a Discord chat export (JSON file or pasted transcript), extract song recommendations, match them to the genre-of-the-day they were posted under, add them to genres_data.json as CANON with scores/reasons/level-ups, fill in missing SEMINAL/MEDIA tracks, and route anything off-topic to the best-fitting genre's pending queue. Use whenever the user shares a Discord export or chat log and asks to "pull out the songs", "process this chat", "add these recs", or similar.
---

# Discord Genre Import

Turns a raw Discord chat export into properly-annotated `genres_data.json` entries. This is the exact workflow used repeatedly in this project's session history — see it end to end below.

## 1. Load and window the chat

Accept either a JSON export (`messages` array with `timestamp`, `author`, `content`) or a pasted transcript. If it's a file:
```python
import json
chat = json.load(open(EXPORT_PATH))
msgs = chat['messages']
```
If it's pasted text, parse it into the same shape (author, timestamp if given, content) as best you can — pasted transcripts often lack precise timestamps, which is fine; ordering in the paste is enough.

Find genre-of-the-day announcements — messages matching a pattern like `Today's Genre (MM/DD/YY) is..... **GENRE NAME**`. Sort them chronologically. This defines a window per genre: from one announcement to the next (or +2 days, whichever is sooner — **cap windows at 2 days**; a wider gap almost always means the export just doesn't cover the days in between, not that the genre ran that long. Treating a multi-day gap as one genre's window will misattribute unrelated recs, as happened once already in this project).

**Only genres with an actual announcement message in the export are in scope.** If the export is a partial sample (doesn't cover the full date range the user might expect), say so plainly rather than silently guessing at missing days.

## 2. Extract every song link per window

Within each genre's window, scan every message (any author) for Spotify track links:
```python
import re
track_re = re.compile(r'open\.spotify\.com(?:/intl-\w+)?/track/([A-Za-z0-9]+)')
```
Also watch for YouTube links and bare song mentions in surrounding text — but Spotify track IDs are the reliable, unambiguous signal; treat anything else as a lower-confidence hint to help identify a nearby Spotify link's song, not a standalone source.

For each track ID found, check whether it's already present in the genre's `songs_listened` or `pending_songs` (match on `spotifyId`, or the ID embedded in `url`/`spotifyUrl`) — skip ones already captured.

## 3. Resolve unknown track IDs

A bare Spotify track ID has no title/artist attached. Resolve it:
- Try `WebSearch("open.spotify.com/track/<ID>")` — often enough surfaces the track title/artist in an indexed page title.
- If that fails, try `WebSearch('"<ID>" spotify')` or add contextual hints from the surrounding chat (an artist name mentioned, a genre keyword) to narrow it down.
- Some IDs simply won't resolve (unindexed/obscure tracks). Don't guess a title from vibes — report those as unresolved and move on. This has happened before and is a normal, acceptable outcome, not a failure to fix by inventing something.
- The user may also supply corrections directly ("that ID is X by Y") — trust those over search results.

## 4. Decide: genre-relevant CANON, or off-topic → pending

A song counts as a genre-of-the-day rec (CANON) if it was posted within that genre's window **and** is at least plausibly connected to the conversation about that genre (not a tangent about an unrelated artist/band that happens to come up in banter — e.g. an evening of Beatles nostalgia chat on a Worldbeat day is off-topic, not a Worldbeat rec, even though it falls inside that day's window).

- **CANON** (genre-relevant): goes into that genre's `songs_listened`, never `pending_songs` — per this project's standing rule, community recommendations are canon regardless of fit quality, they are not held back for review.
- **Off-topic**: find the best-fitting *unlistened* genre already in `genres_data.json` for that song (e.g. Beatles chatter → British Invasion) and add it to *that* genre's `pending_songs` instead, unscored, flagged `isPending: true`. If no good genre fit exists in the corpus, say so rather than forcing a bad match.

## 5. Score and annotate every CANON addition

For each CANON song:
- **Score 1-5** on real musical fit to the genre — be honest even when it's a poor fit; a community rec never gets rejected for scoring low.
- **Reason**: assess the track on its own musical merits against the genre (production, instrumentation, structure, scene/era) — **never meta** (no mentioning Discord, who posted it, the date, "the day's genre was X", etc.). This has been a recurring correction in this project; get it right the first time.
- **LEVEL UP required for any score ≤3**: add a second, different track that's a genuine strong fit (4-5) for the same genre, preserving whatever "DNA" (artist, tone, era, scene) made the original rec appealing, tagged `isLevelUp: true` with `levelUpParentTitle`/`levelUpParentArtist` pointing back.
- **Never mark these `isAdd: true`** — that flag means the assistant/LLM sourced the pick itself, not a community member. Getting this backwards has happened before (17 tracks needed relabeling in one pass) and undermines the whole point of tracking who actually recommended what. Plain CANON entries carry no `isAdd`/`isLevelUp`/`isPending` flag at all.
- **No duplicates**: check title+artist doesn't already exist in that genre before adding.

## 6. Fill missing SEMINAL/MEDIA

For any genre touched in this run that has an empty or placeholder (`http://url.com`) `identity.seminalTrack` or `mediaTouchstones`, follow the **`genre-identity`** skill's process to fill it in with a verified real track — same rules apply here: WebSearch to find and verify a real streamable track, never invent a URL, mirror into `songs_listened` with `isIdentityTrack: true`.

## 7. Apply, verify, push

Standard pattern for this repo (concurrent live editing from the user's own app means `origin/main` moves between steps):
```bash
git fetch origin main -q
git show origin/main:genres_data.json > /tmp/dgi_work.json
python3 -c "import json; json.load(open('/tmp/dgi_work.json')); print('valid')"
```
Make all edits against `/tmp/dgi_work.json` in one pass (all genres touched in this run), then:
```bash
cd /home/user/dailygenre
cp /tmp/dgi_work.json genres_data.json
python3 -c "import json; json.load(open('genres_data.json')); print('valid')"
git add genres_data.json
git commit -m "$(cat <<'EOF'
Import Discord recs: <date range / genres touched>

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
git fetch origin main -q
git merge -s ours origin/main -m "Merge origin/main into feature branch" -q
git push -u origin claude/genre-spinner-august-backlog-6lomg9
git push origin claude/genre-spinner-august-backlog-6lomg9:main
```
If `git diff` between the pre- and post-fetch file shows the *same* genre you're editing was also touched by the live app in between, stop and reconcile field-by-field instead of blindly overwriting (a full 3-way merge by genre `id`, keeping both sides' distinct changes).

## 8. Report back

For each genre touched, tell the user:
- How many CANON songs were added, with artist/title/score, and which got a LEVEL UP and why
- Any SEMINAL/MEDIA filled in
- What got routed to pending, and to which genre, and why
- Any track IDs that couldn't be resolved
- Confirmation the push succeeded to both branch and `main`

Keep this proportionate — a big chat export can surface dozens of tracks; a clear per-genre breakdown beats a wall of individual song-by-song narration.
