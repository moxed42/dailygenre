---
name: genre-fit-check
description: Given a list of "Artist - Song: Proposed Genre" lines, score each song's real musical fit to its proposed genre (1-5) against this project's genre list (genres_data.json) and, for anything scoring below 4, name a better-fitting genre — from the list if one exists there, or a named genre outside the list if nothing on it fits better. Use whenever the user pastes a list of songs with proposed genres and asks for a fit check, or invokes /genre-fit-check.
---

# Genre Fit Check

Read-only QA pass over a proposed artist/song → genre mapping. This is
**not** the Discord import pipeline (`discord-genre-import`) — there is no
community-rec provenance here, nothing gets written to `songs_listened` or
`pending_songs`, and this skill never edits or commits `genres_data.json`.
It only reads the file to judge fit and to search for a better match.

## 1. Load the live genre list

```bash
git fetch origin main -q
git show origin/main:genres_data.json > /tmp/gfc_genres.json
python3 -c "import json; d=json.load(open('/tmp/gfc_genres.json')); print(len(d), 'genres')"
```

Use `origin/main`'s copy, not the working tree — this repo's `main` is
edited concurrently by the user's own app, and this skill doesn't need
write access, just the freshest read.

The file is a flat list of genre objects (all `status` values included —
`unlistened`, `listened`, `veto`, `excluded` — this skill judges fit
against the *whole* taxonomy, not just what's been played). Relevant
fields per genre: `genre`, `category_path`, `subcategory`,
`subsubcategory`, `subsubsubcategory`, `summary`, `key_artists`,
`vibe`, `suggested_songs`.

## 2. Parse the input list

Each input line is `Artist - Song: Proposed Genre` (song title may itself
contain a colon or parenthetical, e.g. a remaster/soundtrack tag — split
only on the **last** `:` that's followed by a genre name, not any colon
inside the title). Keep the artist/song string intact for lookup and
output; don't normalize or clean it up.

## 3. Match the proposed genre against the list

Look up the proposed genre name against `genre` (case-insensitive, allow
minor punctuation/spacing differences — e.g. "UK Hardcore" vs "UK hardcore").
If it doesn't match any entry, still evaluate the song's fit to that named
genre on general musical knowledge, but flag in the output that the
proposed genre itself isn't on the list (this is a real category, not
an error — genres get proposed before they're added).

## 4. Score real musical fit, 1-5

For each song, judge fit **on musical substance** — genre, era, scene,
production, instrumentation, vocal style, tempo/energy — against the
proposed genre's actual character (use the matched entry's `summary`,
`vibe`, `key_artists`, `category_path` as the reference definition when
the genre is on the list; otherwise use general knowledge of that named
genre). Be honest, not generous — a 5 means it's a textbook example of the
genre, a 1 means it barely belongs. Don't let "it's a well-known/good
song" inflate the score if the genre itself is wrong.

Do not fabricate familiarity with a track you don't actually know — if a
title/artist is unfamiliar, say so rather than guessing a score with false
confidence; a `WebSearch` for `"<artist>" "<title>"` to confirm genre/era
context is fine and encouraged when unsure.

## 5. For anything scoring below 4, find a better genre

Search the full genre list (not just genres near the proposed one in
`category_path`) for the entry the song is actually a strong fit for —
using `genre`, `category_path`, `key_artists`, and `vibe` to find
candidates, then applying the same honest 1-5 fit judgment to confirm the
alternate is genuinely a 4-5, not just "less wrong" than the original.

- If a genre on the list fits well, name it exactly as it appears in the
  `genre` field.
- If nothing on the list is a strong fit, say so and name the genre you'd
  actually call it (real, recognizable genre name — not invented) with a
  short note that it isn't on the list yet, so the user can decide whether
  to add it. Never force-fit a below-4 song onto the closest existing list
  entry just to have an answer.

A song that already scores 4-5 on its proposed genre needs no alternate —
don't search for one.

## 6. Output format

One markdown bullet per input song, in input order, written directly in
the chat reply — **not** inside a code/fenced block (this is prose output
for the user to read, not something to copy-paste verbatim):

`- <Artist> - <Song>: <Proposed Genre> [<fit>/5]`

For any line scoring below 4, append the better genre on the same line:

`- <Artist> - <Song>: <Proposed Genre> [<fit>/5] --> <Better Genre>[<fit>/5]`

If the better genre isn't on the list, mark it, e.g.:

`- <Artist> - <Song>: <Proposed Genre> [<fit>/5] --> Merseybeat[5/5] (not on list)`

No extra commentary per line beyond this — reasons/notes only if the user
asks, or briefly at the end for any judgment call worth flagging (e.g. a
proposed genre that wasn't on the list at all, or a song you weren't
confident enough about to score without a web search).
