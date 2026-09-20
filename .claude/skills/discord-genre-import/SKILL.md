---
name: discord-genre-import
description: Given a Discord chat export (JSON file or pasted transcript), extract song recommendations, match them to the genre-of-the-day they were posted under, add them to genres_data.json as CANON with scores/reasons/level-ups, fill in missing SEMINAL/MEDIA tracks, and route anything off-topic to the best-fitting genre's pending queue. Use whenever the user shares a Discord export or chat log and asks to "pull out the songs", "process this chat", "add these recs", or similar.
---

# Discord Genre Import

Turns a raw Discord chat export into properly-annotated `genres_data.json` entries. This is the exact workflow used repeatedly in this project's session history — see it end to end below.

**Standing invariant — never touch an existing rating.** Every edit this skill makes must be additive: new fields on a row you're creating, or a brand-new row appended to `songs_listened`/`pending_songs`. Never overwrite `score` on a song or `rating` on a genre that already has one, even incidentally (e.g. while fixing an unrelated field on that same row). If a fix seems to require changing an existing rating, stop and ask rather than doing it.

## 0. Role and field conventions (read this before writing anything)

The live data has an established shape that's stricter than it looks — get this wrong and the app's own sync/repair logic can silently drop or corrupt rows (this has happened). Every row in `songs_listened` uses one of these `role` values, and only these:

| `role` | Where it lives | `url` field | Other required flags |
|---|---|---|---|
| `CANON` | `songs_listened` | plain URL, no prefix | community rec, any score 1-5 |
| `LEVEL UP` | `songs_listened` | prefixed `🔼 LEVEL UP: <url>` | `isLevelUp: true`, `levelUpParentTitle`/`levelUpParentArtist`/`levelUpParentUrl` pointing at the low-scoring CANON row it replaces |
| `ADD` | `songs_listened` | prefixed `🔼 ADD: <url>` | `isAdd: true`, score must be 4 or 5 — this skill never creates these itself (see step 5), that's `genre-gap-fill`'s job |
| `SEMINAL` | `songs_listened` (mirror) + `identity.seminalTrack` | plain URL, no prefix | `isIdentityTrack: true`, `identityType: "seminal"`, `identityIndex: -1`, `identityLabel: "Seminal track"` |
| `MEDIA` | `songs_listened` (mirror) + `identity.mediaTouchstones[]` | plain URL, no prefix | `isIdentityTrack: true`, `identityType: "media"`, `identityIndex: 0`, `identityLabel: "Media track"` |
| `ROUTED` | `pending_songs` (moves to `songs_listened` once approved) | plain URL, no prefix | `isPending: true`, `pendingFrom: "<origin genre name>"` |

The `🔼 ` prefix (U+1F53C) is literal — it's part of the `url` string itself, not a separate flag, and only `ADD` and `LEVEL UP` rows carry it. Getting a role or its prefix wrong doesn't just look wrong — the app reads `isLevelUp: true` as "drop the row next to this one," so a misapplied flag can delete a real pick. After every batch of edits, spot-check: does every `LEVEL UP` row have `role: "LEVEL UP"` (not `"CANON"`) and the prefix? Does every identity mirror have `role: "SEMINAL"`/`"MEDIA"` (not left blank)?

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

Within each genre's window, scan every message (any author) for song links. **Spotify is the preferred source**, but a real link in any of these is a valid rec — in this fallback order when Spotify isn't available: **Spotify → Apple Music/iTunes → SoundCloud → YouTube → Bandcamp**. Use whichever is the highest-preference link actually posted; don't skip a song just because it's not on Spotify.
```python
import re
track_re = re.compile(r'open\.spotify\.com(?:/intl-\w+)?/track/([A-Za-z0-9]+)')
album_re = re.compile(r'open\.spotify\.com(?:/intl-\w+)?/album/([A-Za-z0-9]+)')
```
Bare song mentions in surrounding text (no link) are a lower-confidence hint to help identify a nearby link's song, not a standalone source — they need an actual link somewhere to become a rec.

**Album links**: someone recommending a whole album, not a single track, is common. Don't skip these. Pick up to 3 tracks from the album, in this priority order, stopping once you've picked what's available: (1) the **title track** if one exists, (2) the **first track** on the album, (3) the **most popular/most-streamed track**. Look these up (WebSearch the album for its tracklist, or search each candidate track individually) rather than guessing.

For each track found (by any of these sources, singles or album picks), check whether it's already present in the genre's `songs_listened` or `pending_songs` — dedup **globally across every source and role in that genre** (match on `spotifyId`/URL when available, else on title+artist case-insensitive) — skip ones already captured, whether the earlier copy was CANON, ADD, LEVEL UP, or a routed pending item.

**Who recommended it**: record the Discord **nickname** (the server display name — e.g. "Andy", "tomatey squirts" — not the raw username) of whoever posted the link, as `recommendedBy: ["<nickname>"]` on the row. If more than one person posted the same song independently within the same genre's window, include all of them in the array. This is scoped strictly to *this* genre's window — the same song recommended by someone else for a different genre on a different day gets its own separate `recommendedBy` on that other genre's row; never merge or carry a recommender across genres.

## 3. Resolve unknown track IDs

A bare Spotify track ID has no title/artist attached. Resolve it:
- Try `WebSearch("open.spotify.com/track/<ID>")` — often enough surfaces the track title/artist in an indexed page title.
- If that fails, try `WebSearch('"<ID>" spotify')` or add contextual hints from the surrounding chat (an artist name mentioned, a genre keyword) to narrow it down.
- Some IDs simply won't resolve (unindexed/obscure tracks). Don't guess a title from vibes — report those as unresolved and move on. This has happened before and is a normal, acceptable outcome, not a failure to fix by inventing something.
- The user may also supply corrections directly ("that ID is X by Y") — trust those over search results.

## 4. Decide: genre-relevant CANON, or off-topic → pending

A song counts as a genre-of-the-day rec (CANON) if it was posted within that genre's window **and** is at least plausibly connected to the conversation about that genre (not a tangent about an unrelated artist/band that happens to come up in banter — e.g. an evening of Beatles nostalgia chat on a Worldbeat day is off-topic, not a Worldbeat rec, even though it falls inside that day's window).

- **CANON** (genre-relevant): goes into that genre's `songs_listened`, never `pending_songs` — per this project's standing rule, community recommendations are canon regardless of fit quality, they are not held back for review.
- **Off-topic**: find the best-fitting *unlistened* genre already in `genres_data.json` for that song (e.g. Beatles chatter → British Invasion) and add it to *that* genre's `pending_songs` instead, using `role: "ROUTED"`, `isPending: true`, and `pendingFrom: "<the genre it was actually posted under>"` (not the genre it's being routed *to* — `pendingFrom` records where it came from). Leave it unscored. If no good genre fit exists in the corpus, say so rather than forcing a bad match. A `ROUTED` row sits in `pending_songs` until a human (or the future pending-review pass) approves it into `songs_listened` — this skill only ever files it, never promotes it.

## 5. Score and annotate every CANON addition

For each CANON song:
- **Score 1-5** on real musical fit to the genre — be honest even when it's a poor fit; a community rec never gets rejected for scoring low.
- **Reason**: assess the track on its own musical merits against the genre (production, instrumentation, structure, scene/era) — **never meta** (no mentioning Discord, who posted it, the date, "the day's genre was X", etc.). This has been a recurring correction in this project; get it right the first time.
- **LEVEL UP required for any score ≤3**: add a second, different track that's a genuine strong fit (4-5) for the same genre, preserving whatever "DNA" (artist, tone, era, scene) made the original rec appealing. This second track gets `role: "LEVEL UP"` (not `"CANON"`), its `url` prefixed `🔼 LEVEL UP: <url>`, `isLevelUp: true`, and `levelUpParentTitle`/`levelUpParentArtist`/`levelUpParentUrl` pointing back at the original.
  - **`role: "LEVEL UP"` and `isLevelUp: true` go ONLY on the new second track, never on the original low-scoring pick.** The original stays a plain `role: "CANON"` entry with a plain (unprefixed) URL — same as any other song, just with its honest low score and no `isLevelUp`/`isPending`/`isAdd` flag at all. Tagging both has actually happened and corrupted production data: the app's own sync/cleanup logic reads `isLevelUp: true` as "this is a replacement, not a standalone entry" and will drop a row carrying that flag, which — when wrongly applied to the original too — deleted the original pick outright and caused the level-up track's parent link to silently reattach to whatever unrelated song happened to sit next to it in the array. After adding a level-up pair, double check: exactly one of the two entries has `role: "LEVEL UP"` + `isLevelUp: true` + the `🔼` prefix, the other is plain `role: "CANON"`, and `levelUpParentTitle`/`levelUpParentArtist` on the LEVEL UP entry match the CANON entry's title/artist exactly.
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

**CRITICAL — reset the local branch to `origin/main`'s current tip immediately before committing, every time, no matter how recently you fetched.** This has caused real production incidents (twice, including a full accidental revert of an unrelated redesign the app had shipped to `main` mid-session): if the local checkout of the feature branch predates *any* change the app pushed to `main` — even one totally unrelated to `genres_data.json`, like a code redesign — then `cp /tmp/dgi_work.json genres_data.json; git commit` bakes stale versions of every other file into the new commit's tree. A later `-s ours` merge (or any merge) treats that stale tree as authoritative and pushing it to `main` silently reverts everything the app shipped since your branch last synced — while the push itself reports success. Never assume the local branch is current just because you fetched earlier in the session; reset it explicitly, right before the commit:

```bash
cd /home/user/dailygenre
git fetch origin main -q
git checkout -B claude/genre-spinner-august-backlog-6lomg9 origin/main   # hard-reset local branch to the live tip, immediately before editing/committing
git status --short   # must be empty — if not, stop and figure out why before touching anything
cp /tmp/dgi_work.json genres_data.json
python3 -c "import json; json.load(open('genres_data.json')); print('valid')"
git add genres_data.json
git status --short   # must show ONLY genres_data.json — stop and investigate if any other file appears here
git commit -m "$(cat <<'EOF'
Import Discord recs: <date range / genres touched>

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
git push -u origin claude/genre-spinner-august-backlog-6lomg9
git fetch origin main -q   # main may have moved again during the steps above
git push origin claude/genre-spinner-august-backlog-6lomg9:main
```

Because the branch was just reset to `origin/main`'s tip before editing, the final push is a plain fast-forward — no merge commit, no `-s ours`, nothing that can silently discard content from other files. If that push is rejected as non-fast-forward, `main` moved again after your reset: re-fetch, diff `genres_data.json` specifically (see below) to check for a genre-level collision, and redo the commit on the new tip rather than forcing or merging.

If `git diff` between the pre- and post-fetch `genres_data.json` shows the *same* genre you're editing was also touched by the live app in between, stop and reconcile field-by-field instead of blindly overwriting (a full 3-way merge by genre `id`, keeping both sides' distinct changes).

## 8. Report back

For each genre touched, tell the user:
- How many CANON songs were added, with artist/title/score/recommender(s), and which got a LEVEL UP and why
- Any SEMINAL/MEDIA filled in
- What got routed to pending (`ROUTED`), to which genre, and why
- Any track IDs that couldn't be resolved
- Confirmation the push succeeded to both branch and `main`

Keep this proportionate — a big chat export can surface dozens of tracks; a clear per-genre breakdown beats a wall of individual song-by-song narration.
