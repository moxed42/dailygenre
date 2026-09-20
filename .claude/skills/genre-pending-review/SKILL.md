---
name: genre-pending-review
description: Review a genre's pending_songs inbox (off-topic Discord recs previously routed here because they didn't fit the day they were posted) and promote any that genuinely fit into songs_listened as ROUTED, scored and annotated like any other track. Use when a genre becomes today's genre-of-the-day and has a non-empty pending_songs queue, or whenever the user says "check the pending inbox", "review routed songs for X", or invokes /genre-pending-review.
---

# Genre Pending Review

`discord-genre-import` files an off-topic Discord rec into the best-fitting
*unlistened* genre's `pending_songs[]` at the time it was posted (see that
skill's step 4) — `role: "ROUTED"`, `isPending: true`,
`pendingFrom: "<genre it was actually posted under>"`. It sits there,
unscored, until that genre is actually explored. This skill is the other
half of that flow: once a genre is being listened to (usually because it
just became today's genre-of-the-day), check its `pending_songs` queue and
promote anything that's a genuine fit into `songs_listened`, scored and
annotated the same as any other track.

**Standing invariant — never touch an existing rating.** This skill only
ever moves a row from `pending_songs` to `songs_listened` and adds fields
to *that* row. It never modifies `score`/`rating` on anything already in
`songs_listened`, and never rewrites a `pending_songs` row it decides not
to promote — a non-promotion is a no-op on that row, not a deletion or edit.

## 1. Load the live file and pick target genre(s)

Always re-fetch — this project's `main` is edited concurrently by the user's own app:
```bash
git fetch origin main -q
git show origin/main:genres_data.json > /tmp/gpr_work.json
python3 -c "import json; json.load(open('/tmp/gpr_work.json')); print('valid')"
```
A proper named backup tag gets created right before committing, in step 4.

- **No argument / "today"**: target whichever genre(s) have `date_normalized` equal to today AND a non-empty `pending_songs`.
- **Named genre**: target that one genre by `genre` field (case-insensitive substring, if unambiguous), regardless of its `status` — reviewing pending items doesn't require the genre to be freshly listened, just for the user to want it checked.
- **"review everything" / no scoping given**: every genre in the file with a non-empty `pending_songs`, listened or not — this is a full sweep, so say up front how many genres/items that touches before doing the work, since it can be large.

```python
import json
d = json.load(open('/tmp/gpr_work.json'))
targets = [g for g in d if g.get('pending_songs')]
for g in targets:
    print(g['id'], g['genre'], g.get('status'), len(g['pending_songs']))
```

## 2. Evaluate each pending item against its own genre

A pending row's `pendingFrom` names the genre it was *actually posted under* — that's context, not the target. The target is the genre whose `pending_songs` array it's currently sitting in; that's the candidate fit to evaluate it against.

For each row:
- Does it genuinely fit this genre, on its own musical merits (production, instrumentation, structure, scene/era)? Use the same judgment `discord-genre-import` step 4 uses for CANON vs. off-topic, just in reverse — you're now asking "does it belong here" rather than "does it belong where it was posted."
- **Fits (even poorly)**: promote it — see step 3. A poor fit is still promoted with an honest low score plus a LEVEL UP, exactly like a fresh CANON rec; pending review doesn't hold a genuine genre-relevant track back for being a weak fit.
- **Doesn't fit at all**: leave the row untouched in `pending_songs`. Don't delete it, don't re-route it to a third genre on your own initiative — if you spot an obviously better home for it while you're in here, mention it in the report and let the user decide, but this skill's job is evaluating against the genre it's already filed under.

## 3. Promote a fit

Moving a row from `pending_songs` to `songs_listened`:
- Keep `role: "ROUTED"` (don't relabel it `CANON` — the routed origin is real history worth keeping visible) and keep `pendingFrom` as-is.
- Set `isPending: false` (it's no longer pending; the array location plus this flag together record "reviewed and placed").
- Add `score` (1-5, honest) and `reason` (non-meta, on the track's own musical merits — never "this was posted for X and routed here").
- If score ≤3: add a LEVEL UP pair exactly as `discord-genre-import` step 5 describes — a second, different track that's a genuine 4-5 fit, `role: "LEVEL UP"`, url prefixed `🔼 LEVEL UP: `, `isLevelUp: true`, `levelUpParentTitle`/`levelUpParentArtist`/`levelUpParentUrl` pointing at the promoted ROUTED row (which itself stays a plain unprefixed ROUTED entry, same rule as CANON/LEVEL UP pairs — the flag goes only on the new track).
- Dedup against the destination genre's existing `songs_listened` (title+artist, case-insensitive) before promoting — if it's already there somehow, drop the pending row without adding a duplicate and say so.
- `recommendedBy` (nickname) carries over from the pending row if it was captured there; don't invent one if it wasn't.

```python
def promote(genre, idx, score, reason, level_up=None):
    row = genre['pending_songs'].pop(idx)
    existing = {(s['title'].lower(), s['artist'].lower()) for s in genre['songs_listened']}
    if (row['title'].lower(), row['artist'].lower()) in existing:
        return None  # already present some other way; drop the pending copy, don't re-add
    row['isPending'] = False
    row['score'] = str(score)
    row['reason'] = reason
    genre['songs_listened'].append(row)
    if level_up:
        genre['songs_listened'].append(level_up)  # role "LEVEL UP", see discord-genre-import for full shape
    return row
```

## 4. Apply, verify, push

Same protocol as every other skill here:
```bash
cd /home/user/dailygenre
git fetch origin main -q
git checkout -B <current-feature-branch> origin/main
git status --short   # must be empty
git tag "backup/pre-pending-review-$(date +%Y%m%d-%H%M%S)" HEAD   # named, one-command restore point for this exact pre-edit state
git push origin --tags
cp /tmp/gpr_work.json genres_data.json
python3 -c "import json; json.load(open('genres_data.json')); print('valid')"
git add genres_data.json
git status --short   # must show ONLY genres_data.json
git commit -m "$(cat <<'EOF'
Review pending inbox: <N> promoted, <M> left pending

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
git push -u origin <current-feature-branch>
git fetch origin main -q
git push origin <current-feature-branch>:main
```
If the final push is rejected as non-fast-forward, `main` moved again — re-fetch and check whether the *same* pending row or genre was touched by the live app in between (e.g. the user manually approved something from the inbox themselves); reconcile by hand rather than overwriting.

## 5. Report back

- Which genre(s) were reviewed and how many pending items each had
- Each promotion: title — artist — score — (LEVEL UP if any), and which genre it landed in
- Each item left pending, and a one-line reason it didn't fit
- Any duplicate pending rows dropped because the song was already present
- The backup tag name from step 4 — if anything looks wrong afterward, restoring is `git show <tag>:genres_data.json > genres_data.json` followed by a normal commit — and confirmation the push succeeded to both branch and `main`
