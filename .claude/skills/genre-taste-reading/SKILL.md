---
name: genre-taste-reading
description: Analyze a genre's track reactions (songs_listened[].reaction) in genres_data.json to write a "Taste Reading" — a narrative on what the user likes/dislikes within that genre, a required predicted-hit/predicted-miss test song pair, and an optional pointer to a more-specific niche genre already in the list. Use for one genre (named or today's genre-of-the-day) or as a retroactive batch across all listened genres. Also use to re-run the batch after more genres accumulate reactions, or to backfill missing predicted-hit/predicted-miss pairs on existing readings.
---

# Genre Taste Reading

Fills `taste_reading` (and related `taste_reading_*` fields, see schema below) for one or more genres in `genres_data.json`, based on the user's own `reaction` values on tracks they've listened to within that genre — never on genre-fit `score` alone, and never by inventing a pattern the reactions don't support.

## 1. Threshold — who qualifies

A genre only gets a real narrative once it has enough reacted tracks (non-null `reaction`) to distinguish a pattern from noise. This was derived empirically, not picked arbitrarily: across this project's `listened` genres, the median reacted-track count is 0 and most sit under 5, but spot-checking genres right at 5-7 reactions (e.g. Djent at 7, Deathcore at 6, Glam rock at 5) already showed clearly legible, coherent patterns — including unanimous-reaction genres, which are a valid reading, not a null result.

**Threshold: 5 reacted tracks.**

- `>= 5` reacted tracks → write a real `taste_reading` (see §2), `taste_reading_status: "ready"`.
- `< 5` → do not write a narrative. Instead write:
  ```json
  "taste_reading_status": "insufficient_data",
  "taste_reading_reacted_count": <n>,
  "taste_reading_threshold": 5
  ```
  so the app can render "not enough ranked songs yet — N reacted, need 5" rather than showing nothing.

If a genre already has `taste_reading_status: "ready"` from a prior run, re-check whether its reacted-track count has grown meaningfully since; if so, treat it like a fresh genre (regenerate), otherwise leave it alone rather than re-writing an unchanged reading.

## 2. Writing the narrative

Read that genre's `songs_listened[]` where `reaction` is non-null (1 = dislike, 2 = neutral/meh, 3 = like), alongside each track's `title`/`artist`/`reason`/`score` (the `score` is a genre-fit rating set separately from the user's personal reaction — a mismatch between a low `score` and a `reaction: 3`, or vice versa, is itself informative and worth naming).

Rules for the narrative:
- **2-4 sentences, isolated to this genre.** Never phrase it as a comparison to another genre ("same appetite as X") — each genre's reading stands on its own. Cross-genre patterns, if truly recurring, belong in a separate cross-genre notes process, not folded into an individual genre's `taste_reading`.
- Describe it as a narrative of what's actually happening musically (tempo, instrumentation, vocal style, era, production, structure) and why those specific elements land or don't — not a bare tally of like/meh/dislike counts, and don't use "like/meh/dislike" as vocabulary in the prose itself.
- **Never reference the mechanics of this process in the narrative itself** — no mention of predicted-hit/predicted-miss test songs, whether a prediction was later confirmed, tracks being "logged," or anything about how the reading was produced. That's process noise, not musical rationale. A confirmed prediction can inform your confidence in the read, but the prose should only ever describe song elements and why they land — the predictions themselves live in their own separate fields (see below), never spliced into the narrative text.
- A unanimous result (all liked, or all disliked) is a legitimate, real reading — say so plainly rather than forcing a split that isn't there.
- Don't fabricate a pattern from too little contrast — if the reacted tracks don't actually cluster around an identifiable trait, say the response has been broadly positive/negative/mixed without inventing a specific musical explanation.

**Required for every `ready` reading** — `taste_reading_predicted_hit` and `taste_reading_predicted_miss`: `{title, artist}`, a real track *not already in this genre's `songs_listened`/`pending_songs`* that the pattern predicts the user would like / dislike, respectively. Every `ready` genre needs both — a reading without them is incomplete, not a valid partial output. This was previously listed as optional and 39 of the first 43 readings shipped without it; that was a mistake, not a legitimate omission.
- Same rule as `genre-identity`: **never invent a track.** Verify every candidate via WebSearch (confirm the artist/title is real and findable) before writing it — if a candidate can't be verified, find a different one, don't lower the bar.
- If a genre's reception has been uniform (all liked, or all disliked, or all middling with no real contrast), you still owe both predictions — reason from the stated trait axis to what would exemplify the opposite pole, even if no example of that pole has been logged yet. Don't skip the pair just because the reading itself is uniform.
- These are separate UI elements from the narrative — never describe them inside `taste_reading`'s prose (see the rule above).
- Double-check each candidate against every title already logged for that genre (case-sensitive substring check is not enough — read the actual list) before finalizing; a near-duplicate under a different queue you didn't check is a real failure mode, not a hypothetical one.

Optional field:
- `taste_reading_niche_genre_id`: the numeric `id` of a *different, more specific* genre already present in `genres_data.json` that the pattern points to as a likely stronger fit than the current genre (e.g. Happy hardcore's reading pointing at Nightcore, Black metal's pointing at Symphonic black metal). Only set this when:
  1. You can name a real, specific subgenre the pattern supports (not a vague "something more mellow"), AND
  2. That subgenre already exists as an entry in `genres_data.json` — look it up by exact or close name match first.
  - If the niche subgenre is real and well-supported but does **not** already exist in the list, do not fabricate an id — instead append a new minimal genre entry (matching the shape used elsewhere in the file: sequential next `id`, `genre` name, `status: "unlistened"`, empty `songs_listened`/`pending_songs`/etc.) so it lands in the normal unlistened backlog, then set `taste_reading_niche_genre_id` to that new id.
  - If no specific, real, confident niche applies, omit the field — do not force one.

## 3. Running for one genre vs. the full retroactive batch

- **Named genre** (e.g. "/genre-taste-reading Djent") or **today's genre-of-the-day** (no argument): find it the same way `genre-identity` does — by `genre` field match, or by `date_normalized` for today/yesterday.
- **Retroactive batch**: filter to `status: "listened"`, apply §1's threshold, write `taste_reading`/`taste_reading_status` (and insufficient-data fields) for every qualifying genre that doesn't already have a current one.

## 4. Apply to the data — always via the live tip

Same concurrency hazard documented in `genre-identity`: the user's own app writes to this project's `main` branch directly, and can do so between when you start and when you push. Never work from a possibly-stale local `genres_data.json`.

```bash
git fetch origin main -q
git show origin/main:genres_data.json > /tmp/gtr_work.json
python3 -c "import json; json.load(open('/tmp/gtr_work.json')); print('valid')"
```

The live app writes `genres_data.json` as compact single-line JSON (no indentation) — match that format when writing back (`json.dump(..., separators=(",", ":"))`), not the pretty-printed 2-space style, so diffs stay minimal and consistent with the app's own writes.

Work from `/tmp/gtr_work.json`. Write the new fields onto the target genre object(s) (or append new unlistened niche-genre entries, per §2) with a small Python script, validate the JSON round-trips, then follow `genre-identity`'s §5 commit procedure exactly: re-fetch and hard-reset the active feature branch to `origin/main`'s current tip immediately before committing, `git status --short` must show only `genres_data.json` modified, commit, push to the feature branch, re-fetch `origin/main` once more, then fast-forward-push the feature branch onto `main`. If that final push is rejected as non-fast-forward, `main` moved again — re-fetch and redo the commit on the new tip rather than forcing.

**Do not `git checkout -B <branch> origin/main` if the branch currently carries commits not yet merged into `main`** (e.g. this very skill file, or other repo-level changes) — that discards them from the branch tip, and if you then force-push, from the remote too. Check `git log --oneline origin/main..<branch>` first; if it's non-empty, merge `origin/main` into the branch instead of resetting to it, or cherry-pick those commits back afterward. Losing this skill file's own commit to exactly this mistake is what prompted this warning.

## 5. Report back

Tell the user, plainly:
- Which genre(s) were processed, and how many were skipped as `insufficient_data` (with counts)
- For each processed genre: the narrative, and whether a predicted hit/miss or niche-genre pointer was included (and why, if omitted)
- Any new unlistened genre entries created as niche pointers
- That the push succeeded to both the feature branch and `main`
