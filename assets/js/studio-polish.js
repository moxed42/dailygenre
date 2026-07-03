/* Daily Genre Studio Workbench v1
   Add-on only: wraps renderReview() after app.js renders Review/Studio content.
   Does not touch app.js, genre loading, spin, library, stats, songs, or album carousel.
*/
(function () {
  "use strict";

  const VERSION = "studio-polish-v36-inline-submit-guard";
  let isApplying = false;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function isEditableStudioTarget(target) {
    const el = target?.closest?.(
      'input, textarea, select, option, [contenteditable="true"], .inbox-card, .studio-genre-typeahead-wrap, .studio-inline-track-edit',
    );
    return Boolean(el);
  }

  let inboxPasteGuardUntil = 0;

  function armInboxPasteGuard(duration = 900) {
    inboxPasteGuardUntil = Math.max(inboxPasteGuardUntil, Date.now() + duration);
  }

  function isInboxPasteGuardActive() {
    return Date.now() < inboxPasteGuardUntil;
  }

  function isReviewActive() {
    return document.getElementById("screen-review")?.classList.contains("active");
  }

  function isStudioTextEntryActive() {
    return isReviewActive() && isEditableStudioTarget(document.activeElement);
  }

  function captureInboxDraft() {
    const input = document.getElementById("inboxSongInput");
    const select = document.getElementById("inboxGenreSelect");
    if (!input && !select) return null;
    return {
      activeId: document.activeElement?.id || "",
      value: input?.value || "",
      selectionStart:
        typeof input?.selectionStart === "number" ? input.selectionStart : null,
      selectionEnd:
        typeof input?.selectionEnd === "number" ? input.selectionEnd : null,
      genreValue: select?.value || "",
    };
  }

  function restoreInboxDraft(draft) {
    if (!draft) return;
    const input = document.getElementById("inboxSongInput");
    const select = document.getElementById("inboxGenreSelect");
    if (input && draft.value && !input.value) input.value = draft.value;
    if (select && draft.genreValue) select.value = draft.genreValue;
    if (input && draft.activeId === "inboxSongInput") {
      try {
        input.focus({ preventScroll: true });
        if (draft.selectionStart !== null && draft.selectionEnd !== null)
          input.setSelectionRange(draft.selectionStart, draft.selectionEnd);
      } catch (_) {}
    }
  }

  function esc(value) {
    if (typeof window.escapeHtml === "function")
      return window.escapeHtml(value);
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function toast(msg, isErr) {
    if (typeof window.showSaveToast === "function")
      window.showSaveToast(msg, !!isErr);
  }

  function getGenres() {
    return Array.isArray(window.genres) ? window.genres : [];
  }

  function inflateSongs(raw) {
    if (typeof window.inflateSongsFromStorage === "function")
      return window.inflateSongsFromStorage(raw || []);
    return Array.isArray(raw) ? raw : [];
  }

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/https?:\/\/\S+/g, " ")
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function songTitle(song) {
    const artist =
      song?.artist ||
      (Array.isArray(song?.artists) ? song.artists.join(", ") : "");
    const title = song?.title || song?.name || song?.url || "Untitled track";
    return artist ? `${artist} — ${title}` : title;
  }

  function songKey(song) {
    if (typeof window.songIdentity === "function")
      return window.songIdentity(song);
    return norm(
      [
        song?.spotifyId,
        song?.isrc,
        song?.spotifyUrl || song?.url,
        song?.artist,
        song?.title,
      ].join(" "),
    );
  }


  function repairDisplayKey(song) {
    const title = norm(song?.title || song?.name || "");
    const artist = norm(
      song?.artist || (Array.isArray(song?.artists) ? song.artists.join(" ") : ""),
    );
    if (title && artist) return `artist-title:${artist}::${title}`;
    const id = norm(song?.spotifyId || "");
    if (id) return `spotify:${id}`;
    const url = norm(song?.spotifyUrl || song?.url || "");
    if (url) return `url:${url}`;
    return norm(songTitle(song));
  }

  function consolidateRepairRows(rows) {
    const groups = new Map();
    rows.forEach((row) => {
      if (!row?.song || !row?.genre) return;
      const displayKey = repairDisplayKey(row.song) || songKey(row.song);
      if (!displayKey) return;
      const group = groups.get(displayKey) || {
        ...row,
        problemSet: new Set(),
        targetMap: new Map(),
        priority: row.priority || 0,
      };
      group.priority = Math.max(group.priority || 0, row.priority || 0);
      if ((row.priority || 0) >= (group.primaryPriority || -1)) {
        group.primaryPriority = row.priority || 0;
        group.genre = row.genre;
        group.song = row.song;
        group.type = row.type;
      }
      const problemLabel =
        row.type === "missingArt"
          ? "art"
          : row.type === "missingYear"
            ? "year"
            : row.type === "missingMeta"
              ? "metadata"
              : row.problem || "repair";
      group.problemSet.add(problemLabel);
      const targetKey = `${String(row.genre?.id ?? "")}::${songKey(row.song)}`;
      if (!group.targetMap.has(targetKey)) {
        group.targetMap.set(targetKey, {
          genreId: String(row.genre?.id ?? ""),
          key: songKey(row.song),
          genreName: row.genre?.genre || "Unknown genre",
          title: row.song?.title || row.song?.name || "",
          artist: row.song?.artist || (Array.isArray(row.song?.artists) ? row.song.artists.join(" ") : ""),
          url: row.song?.spotifyUrl || row.song?.url || "",
          spotifyId: row.song?.spotifyId || "",
          isrc: row.song?.isrc || "",
          displayKey: repairDisplayKey(row.song) || songKey(row.song),
        });
      }
      groups.set(displayKey, group);
    });
    return Array.from(groups.values()).map((group) => {
      const problems = Array.from(group.problemSet).sort((a, b) => {
        const order = { art: 0, year: 1, metadata: 2 };
        return (order[a] ?? 9) - (order[b] ?? 9) || String(a).localeCompare(String(b));
      });
      return {
        ...group,
        problem: problems.length ? `Missing ${problems.join(" + ")}` : group.problem,
        repairProblems: problems,
        targets: Array.from(group.targetMap.values()).filter((x) => x.genreId && x.key),
        targetCount: group.targetMap.size,
      };
    });
  }

  function topRepairRows(limit = 10) {
    return consolidateRepairRows(
      stats()
        .rows.filter((r) => ["missingArt", "missingYear", "missingMeta"].includes(r.type))
        .sort(
          (a, b) =>
            b.priority - a.priority ||
            String(songTitle(a.song)).localeCompare(songTitle(b.song)),
        ),
    ).slice(0, limit);
  }

  function spotifyUrl(song) {
    if (typeof window.spotifyHref === "function")
      return window.spotifyHref(song);
    return song?.spotifyUrl || song?.url || "";
  }

  function allNonPendingSongs(g) {
    return inflateSongs(g?.songs_listened || []).filter((s) => !s?.isPending);
  }

  function allPendingSongs(g) {
    const pending = [];
    inflateSongs(g?.pending_songs || []).forEach((song) => pending.push(song));
    inflateSongs(g?.songs_listened || [])
      .filter((song) => song?.isPending)
      .forEach((song) => pending.push(song));
    return pending;
  }

  function hasTrackMetadata(song) {
    return !!(
      song?.spotifyId ||
      song?.spotifyUrl ||
      song?.releaseYear ||
      song?.releaseDate ||
      song?.durationMs ||
      song?.isrc
    );
  }

  function missingKinds(song) {
    const missing = [];
    const url = spotifyUrl(song);
    if (!song?.artwork) missing.push("art");
    if (url && !song?.spotifyId) missing.push("id");
    if (url && !song?.releaseYear && !song?.releaseDate && !song?.eraYear)
      missing.push("year");
    if (url && !hasTrackMetadata(song)) missing.push("metadata");
    return missing;
  }

  function findSongByGenreAndKey(genreId, key) {
    const genre = getGenres().find((g) => String(g?.id ?? "") === String(genreId ?? ""));
    if (!genre) return null;
    const songs = allNonPendingSongs(genre);
    return songs.find((song) => String(songKey(song)) === String(key || "")) || null;
  }

  function repairLabel(kind) {
    const clean = String(kind || "").replace(/^missing\s+/i, "").trim();
    return clean ? `missing ${clean}` : "missing metadata";
  }

  function updateRepairMetaChips(metaEl, missing) {
    if (!metaEl) return;
    metaEl.querySelectorAll(".studio-repair-missing-chip").forEach((chip) => chip.remove());
    const anchor = metaEl.querySelector(".studio-inline-group-updated-chip, .studio-inline-updated-chip");
    const html = (missing || []).map((kind) => `<span class="studio-repair-missing-chip" data-repair-kind="${esc(kind)}">${esc(repairLabel(kind))}</span>`).join("");
    if (html) {
      if (anchor) anchor.insertAdjacentHTML("afterend", html);
      else metaEl.insertAdjacentHTML("afterbegin", html);
    }
  }

  function stats() {
    const genres = getGenres();
    const rows = [];
    let pending = 0;
    let missingArt = 0;
    let missingYear = 0;
    let missingMeta = 0;
    let unrated = 0;
    let duplicate = 0;
    let drafts = 0;
    const seen = new Map();

    genres.forEach((genre) => {
      allPendingSongs(genre).forEach((song) => {
        pending += 1;
        rows.push({
          type: "pending",
          genre,
          song,
          priority: scorePending(song),
          problem: "Pending routing",
        });
      });

      const songs = allNonPendingSongs(genre);
      if (
        String(genre.status || "").toLowerCase() === "unlistened" &&
        songs.length
      )
        drafts += 1;

      songs.forEach((song) => {
        const missing = missingKinds(song);
        if (missing.includes("art")) missingArt += 1;
        if (missing.includes("year")) missingYear += 1;
        if (missing.includes("metadata")) missingMeta += 1;
        if (!song?.reaction) unrated += 1;

        missing.forEach((kind) => {
          rows.push({
            type:
              kind === "art"
                ? "missingArt"
                : kind === "year"
                  ? "missingYear"
                  : "missingMeta",
            genre,
            song,
            priority: scoreRepair(song, kind),
            problem: `Missing ${kind}`,
          });
        });

        const key = songKey(song);
        if (key) {
          const arr = seen.get(key) || [];
          arr.push({ genre, song });
          seen.set(key, arr);
        }
      });
    });

    seen.forEach((arr) => {
      const uniqueGenres = new Set(
        arr.map((x) => String(x.genre?.id ?? x.genre?.genre ?? "")),
      );
      if (arr.length > 1 && uniqueGenres.size >= 1) {
        duplicate += arr.length;
        arr.forEach(({ genre, song }) =>
          rows.push({
            type: "duplicate",
            genre,
            song,
            priority: 70,
            problem: "Possible duplicate",
          }),
        );
      }
    });

    const libraryDirty = !!(
      window.libraryUpdatesPending || window.hasUnsavedChanges
    );
    return {
      pending,
      missingArt,
      missingYear,
      missingMeta,
      unrated,
      duplicate,
      drafts,
      libraryDirty,
      rows,
    };
  }

  function genreIdentityStats() {
    const genres = getGenres();
    let aliases = 0;
    let seminal = 0;
    let media = 0;
    let complete = 0;
    genres.forEach((genre) => {
      const aliasList = [];
      [
        genre?.aliases,
        genre?.synonyms,
        genre?.aka,
        genre?.alternateNames,
        genre?.alternate_names,
      ].forEach((field) => {
        if (Array.isArray(field)) aliasList.push(...field);
        else if (typeof field === "string")
          aliasList.push(...field.split(/[,;|\n]/g));
      });
      const cleanAliases = aliasList
        .map((x) => String(x || "").trim())
        .filter(Boolean);
      const sem = genre?.seminal_song || genre?.identity?.seminalTrack || {};
      const mediaRows = Array.isArray(genre?.media_touchstones)
        ? genre.media_touchstones
        : Array.isArray(genre?.identity?.mediaTouchstones)
          ? genre.identity.mediaTouchstones
          : [];
      const hasSem = !!(
        sem?.title ||
        sem?.artist ||
        sem?.spotifyUrl ||
        sem?.url
      );
      if (cleanAliases.length) aliases += 1;
      if (hasSem) seminal += 1;
      if (mediaRows.length) media += 1;
      if (cleanAliases.length && hasSem) complete += 1;
    });
    return {
      total: genres.length,
      aliases,
      seminal,
      media,
      complete,
      missing: Math.max(0, genres.length - complete),
    };
  }

  function scorePending(song) {
    const fit =
      Number(song?.score ?? song?.originFit ?? song?.nominatedFit ?? 0) || 0;
    if (song?.isLevelUp || /^🔼\s*LEVEL UP/i.test(String(song?.url || "")))
      return 95;
    if (song?.isAdd || /^🔼\s*ADD/i.test(String(song?.url || ""))) return 85;
    if (fit && fit <= 2) return 80;
    if (fit === 3) return 65;
    return 50;
  }

  function scoreRepair(song, kind) {
    const fit = Number(song?.score ?? 0) || 0;
    const reactionBoost =
      song?.reaction === 3 ? 20 : song?.reaction === 1 ? 8 : 0;
    const fitBoost = fit >= 4 ? 16 : fit === 3 ? 8 : 0;
    const kindBoost = kind === "art" ? 10 : kind === "year" ? 8 : 4;
    return 30 + reactionBoost + fitBoost + kindBoost;
  }

  function topRows(type, limit = 8) {
    return stats()
      .rows.filter((r) => r.type === type)
      .sort(
        (a, b) =>
          b.priority - a.priority ||
          String(songTitle(a.song)).localeCompare(songTitle(b.song)),
      )
      .slice(0, limit);
  }

  function severity(n) {
    if (n >= 100) return "high";
    if (n >= 25) return "med";
    return "low";
  }

  function laneCard(id, title, count, copy, actionLabel, sample) {
    return `<button type="button" class="studio-lane-card studio-severity-${severity(count)}" data-studio-jump="${esc(id)}">
      <span class="studio-lane-kicker">${esc(actionLabel)}</span>
      <strong>${esc(String(count))}</strong>
      <span class="studio-lane-title">${esc(title)}</span>
      <span class="studio-lane-copy">${esc(copy)}</span>
      ${sample ? `<span class="studio-lane-sample">Next: ${esc(sample)}</span>` : ""}
    </button>`;
  }

  function renderHero(s) {
    const identity = genreIdentityStats();
    const pendingSample = topRows("pending", 1)[0];
    const repairSample =
      topRows("missingArt", 1)[0] ||
      topRows("missingYear", 1)[0] ||
      topRows("missingMeta", 1)[0];
    const reviewSample = topRows("duplicate", 1)[0];
    return `<section class="studio-workbench-hero" aria-label="Studio workbench">
      <div class="studio-workbench-copy">
        <div class="eyebrow">Studio Workbench</div>
        <h2>Curation control room</h2>
        <p>Route ambiguous songs, repair Spotify metadata, and keep the library clean without turning the listening pages into admin screens.</p>
      </div>
      <div class="studio-save-state ${s.libraryDirty ? "is-dirty" : ""}">
        <span>${s.libraryDirty ? "Unsaved cleanup pending" : "No unsaved cleanup"}</span>
        ${s.libraryDirty ? '<button type="button" class="btn btn-primary btn-tiny" onclick="saveLibraryUpdates()">Save cleanup</button>' : ""}
      </div>
      <div class="studio-lane-grid">
        ${laneCard("studio-route-lane", "Needs decision", s.pending, "Pending nominations and unresolved routing choices.", "Route", pendingSample ? songTitle(pendingSample.song) : "")}
        ${laneCard("genreIdentityWorkbench", "Needs identity", identity.missing, `${identity.complete}/${identity.total} genres have aliases + seminal anchor.`, "Identity", `${identity.aliases} aliases · ${identity.seminal} seminal · ${identity.media} media`)}
        ${laneCard("studio-repair-lane", "Needs repair", s.missingArt + s.missingYear + s.missingMeta, "Album art, years, IDs, and suspicious metadata.", "Repair", repairSample ? songTitle(repairSample.song) : "")}
        ${laneCard("studio-review-lane", "Needs taste / QA", s.unrated + s.duplicate + s.drafts, "Unrated songs, possible duplicates, and draft inconsistencies.", "Review", reviewSample ? songTitle(reviewSample.song) : "")}
      </div>
    </section>`;
  }

  function renderToolbar() {
    return `<div class="studio-toolbar" aria-label="Studio controls">
      <label class="studio-search-wrap">
        <span>Search Studio</span>
        <input id="studioGlobalSearch" type="search" placeholder="Track, artist, genre, problem…" autocomplete="off">
      </label>
      <label class="studio-filter-wrap">
        <span>Priority</span>
        <select id="studioPriorityFilter">
          <option value="">All priorities</option>
          <option value="high">High impact</option>
          <option value="repair">Repair only</option>
          <option value="route">Routing only</option>
          <option value="review">Review only</option>
        </select>
      </label>
      <button type="button" class="btn btn-secondary" id="studioExpandAllBtn" aria-expanded="false">Expand all sections</button>
    </div>`;
  }

  function renderSongThumb(song) {
    const art = song?.artwork || song?.albumArt || song?.image || "";
    if (!art) return '<div class="studio-thumb studio-thumb-empty">♪</div>';
    return `<img class="studio-thumb" src="${esc(art)}" alt="" loading="lazy">`;
  }

  function renderQueueRows(rows, emptyCopy) {
    if (!rows.length)
      return `<div class="studio-empty">${esc(emptyCopy)}</div>`;
    return `<div class="studio-mini-list">${rows
      .map((row, idx) => {
        const href = spotifyUrl(row.song);
        const problem = row.problem || "Needs review";
        const genreName = row.genre?.genre || "Unknown genre";
        const fit =
          row.song?.score ||
          row.song?.originFit ||
          row.song?.nominatedFit ||
          "";
        const isRepair = ["missingArt", "missingYear", "missingMeta"].includes(row.type);
        const inputId = `studioRepairUrl_${String(row.genre?.id ?? "").replace(/[^a-zA-Z0-9_-]/g, "")}_${idx}`;
        const key = songKey(row.song);
        const currentUrl = row.song?.spotifyUrl || row.song?.url || "";
        const repairTargetForRow = (target = {}) => ({
          ...target,
          genreId: String(target.genreId ?? row.genre?.id ?? ""),
          key: String(target.key ?? key ?? ""),
          genreName: target.genreName || genreName,
          title: target.title || row.song?.title || row.song?.name || "",
          artist: target.artist || row.song?.artist || (Array.isArray(row.song?.artists) ? row.song.artists.join(" ") : ""),
          url: target.url || row.song?.spotifyUrl || row.song?.url || "",
          spotifyId: target.spotifyId || row.song?.spotifyId || "",
          isrc: target.isrc || row.song?.isrc || "",
          displayKey: target.displayKey || repairDisplayKey(row.song) || String(key || ""),
        });
        const groupTargets = isRepair && Array.isArray(row.targets) && row.targets.length
          ? row.targets.map(repairTargetForRow)
          : [repairTargetForRow()];
        const encodedTargets = encodeURIComponent(JSON.stringify(groupTargets));
        const copyChip = isRepair && row.targetCount > 1
          ? `<span class="studio-repair-copy-chip">${esc(String(row.targetCount))} copies</span>`
          : "";
        const problemChips = isRepair && Array.isArray(row.repairProblems) && row.repairProblems.length
          ? row.repairProblems.map((kind) => `<span class="studio-repair-missing-chip" data-repair-kind="${esc(kind)}">missing ${esc(kind)}</span>`).join("")
          : `<span class="studio-repair-missing-chip" data-repair-kind="${esc(problem)}">${esc(problem)}</span>`;
        const inlineRepair = isRepair
          ? `<form class="studio-inline-track-edit" onsubmit="event.preventDefault(); event.stopPropagation(); typeof updateStudioRepairGroupUrlFromQueue === 'function' ? updateStudioRepairGroupUrlFromQueue('${encodedTargets}', '${esc(inputId)}', this.querySelector('button[type=submit]')) : (typeof updateMetadataTrackUrlFromQueue === 'function' ? updateMetadataTrackUrlFromQueue('${encodeURIComponent(String(row.genre?.id ?? ""))}', '${encodeURIComponent(String(key || ""))}', '${esc(inputId)}', this.querySelector('button[type=submit]'), 'review') : null); return false;"><label for="${esc(inputId)}">Spotify URL${row.targetCount > 1 ? ` · updates ${esc(String(row.targetCount))} matching copies` : ""}</label><div><input id="${esc(inputId)}" type="url" placeholder="https://open.spotify.com/track/..." value="${esc(currentUrl)}" onclick="event.stopPropagation();"><button type="submit" class="btn btn-primary btn-tiny" onclick="event.stopPropagation();">${row.targetCount > 1 ? "Update copies" : "Update"}</button></div></form>`
          : "";
        return `<article class="studio-mini-row ${isRepair ? "studio-mini-row-repair studio-mini-row-repair-grouped" : ""}" data-studio-row data-studio-text="${esc(norm([problem, genreName, songTitle(row.song), row.song?.reason, row.song?.pendingFrom, row.targetCount > 1 ? `${row.targetCount} copies` : ""].join(" ")))}" data-studio-type="${esc(row.type)}" data-studio-priority="${row.priority >= 70 ? "high" : row.priority >= 45 ? "med" : "low"}">
          ${renderSongThumb(row.song)}
          <div class="studio-mini-main">
            <div class="studio-mini-title">${href ? `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(songTitle(row.song))}</a>` : esc(songTitle(row.song))}</div>
            <div class="studio-mini-meta">${copyChip}${problemChips}<span>${esc(genreName)}</span>${fit ? `<span>fit ${esc(fit)}/5</span>` : ""}${row.song?.pendingFrom ? `<span>from ${esc(row.song.pendingFrom)}</span>` : ""}</div>
            ${inlineRepair}
          </div>
          <div class="studio-mini-actions">
            <button type="button" class="btn btn-secondary btn-tiny" onclick="event.stopPropagation(); openGenreByIdEncoded('${encodeURIComponent(String(row.genre?.id ?? ""))}', ${row.type === "missingArt" || row.type === "missingYear" || row.type === "missingMeta" || row.type === "duplicate"})">Open genre</button>
          </div>
        </article>`;
      })
      .join("")}</div>`;
  }

  function renderRepairLane(s) {
    const rows = topRepairRows(10);
    return `<section class="studio-lane" id="studio-repair-lane" data-studio-lane="repair">
      <div class="studio-lane-head">
        <div><div class="eyebrow">Repair Bay</div><h3>Metadata and artwork cleanup</h3><p>Prioritize high-fit, liked, and visible songs first so Library, Stats, and carousels stay trustworthy.</p></div>
        <div class="studio-lane-counts"><span>${s.missingArt} art</span><span>${s.missingYear} years</span><span>${s.missingMeta} metadata</span></div>
      </div>
      <div class="studio-action-strip">
        <button type="button" class="btn btn-secondary" onclick="typeof openMetadataQueue === 'function' ? openMetadataQueue('art','alltime') : null">Open album-art queue</button>
        <button type="button" class="btn btn-secondary" onclick="typeof openMetadataQueue === 'function' ? openMetadataQueue('spotify','alltime') : null">Open metadata queue</button>
        <button type="button" class="btn btn-secondary" onclick="typeof refreshNextSpotifyTracks === 'function' ? refreshNextSpotifyTracks(5) : null">Refresh next 5</button>
      </div>
      ${renderQueueRows(rows, "No obvious metadata repair items found.")}
    </section>`;
  }

  function renderReviewLane(s) {
    const rows = [...topRows("duplicate", 8)];
    return `<section class="studio-lane" id="studio-review-lane" data-studio-lane="review">
      <div class="studio-lane-head">
        <div><div class="eyebrow">QA Lab</div><h3>Taste pass and structural checks</h3><p>Resolve duplicate-looking songs, unrated entries, and drafts that need a curator decision.</p></div>
        <div class="studio-lane-counts"><span>${s.unrated} unrated</span><span>${s.duplicate} duplicate hits</span><span>${s.drafts} drafts</span></div>
      </div>
      ${renderQueueRows(rows, "No duplicate-looking rows found in this pass.")}
    </section>`;
  }

  function decorateExistingReviewSections(mount) {
    const inbox = $(".inbox-card", mount);
    if (inbox && !inbox.closest(".studio-lane")) {
      const wrap = document.createElement("section");
      wrap.id = "studio-inbox-lane";
      wrap.className = "studio-lane studio-inbox-lane";
      wrap.dataset.studioLane = "route";
      wrap.innerHTML =
        '<div class="studio-lane-head"><div><div class="eyebrow">Inbox</div><h3>New song intake</h3><p>Drop a Spotify URL or Artist — Title and route it to the right pending queue.</p></div></div>';
      inbox.parentNode.insertBefore(wrap, inbox);
      wrap.appendChild(inbox);
    }

    const pending = $("#reviewPendingQueueCard", mount);
    const manual = $("#reviewManualQueueCard", mount);
    if (pending && !pending.closest("#studio-route-lane")) {
      const route = document.createElement("section");
      route.id = "studio-route-lane";
      route.className = "studio-lane studio-route-lane";
      route.dataset.studioLane = "route";
      route.innerHTML =
        '<div class="studio-lane-head"><div><div class="eyebrow">Routing Desk</div><h3>Pending nominations and ambiguous tags</h3><p>Decide whether a track is misplaced, a crossover, a Level Up, an Add, or simply needs dismissal.</p></div></div>';
      pending.parentNode.insertBefore(route, pending);
      route.appendChild(pending);
      if (manual) route.appendChild(manual);
    }

    $$(".review-card", mount).forEach((card) =>
      card.classList.add("studio-native-card"),
    );
    $$(".review-row", mount).forEach((row) => {
      row.dataset.studioRow = "native";
      if (!row.dataset.studioText)
        row.dataset.studioText = norm(row.textContent || "");
    });
  }

  function enhanceSelects(mount) {
    $$('select[id^="pending-review-"]', mount).forEach((select) => {
      if (select.dataset.studioEnhanced === "1") return;
      select.dataset.studioEnhanced = "1";
      const wrap = document.createElement("div");
      wrap.className = "studio-genre-typeahead-wrap";
      const input = document.createElement("input");
      input.type = "search";
      input.className = "studio-genre-typeahead";
      input.placeholder = "Type target genre…";
      input.setAttribute("aria-label", "Type target genre");
      const list = document.createElement("div");
      list.className = "studio-genre-typeahead-list hidden";
      select.parentNode.insertBefore(wrap, select);
      wrap.appendChild(input);
      wrap.appendChild(list);
      wrap.appendChild(select);
      select.classList.add("studio-original-select");

      const options = Array.from(select.options)
        .filter((o) => o.value)
        .map((o) => ({ id: o.value, label: o.textContent || "" }));
      function render(term = "") {
        const n = norm(term);
        const matches = options
          .map((o) => {
            const labelNorm = norm(o.label);
            let score = 0;
            if (!n) score = 1;
            else if (labelNorm === n) score = 100;
            else if (labelNorm.startsWith(n)) score = 80;
            else if (labelNorm.includes(n)) score = 40;
            return { ...o, score };
          })
          .filter((o) => o.score)
          .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
          .slice(0, 8);
        list.innerHTML = matches.length
          ? matches
              .map(
                (o) =>
                  `<button type="button" data-id="${esc(o.id)}">${esc(o.label)}</button>`,
              )
              .join("")
          : '<div class="studio-typeahead-empty">No genre matches.</div>';
        list.classList.toggle("hidden", !term && !matches.length);
      }
      input.addEventListener("input", () => render(input.value));
      input.addEventListener("focus", () => render(input.value));
      list.addEventListener("click", (ev) => {
        const btn = ev.target.closest("button[data-id]");
        if (!btn) return;
        select.value = btn.dataset.id || "";
        input.value = btn.textContent || "";
        list.classList.add("hidden");
      });
      document.addEventListener(
        "click",
        (ev) => {
          if (!wrap.contains(ev.target)) list.classList.add("hidden");
        },
        { capture: true },
      );
    });
  }

  function sectionTitle(section) {
    return (
      section.querySelector("h3, h2")?.textContent?.trim() ||
      section.id ||
      "Section"
    );
  }

  function ensureCollapsibleHeader(section) {
    let head = section.querySelector(
      ":scope > .studio-lane-head, :scope > .genre-identity-editor-head, :scope > .review-card-head",
    );
    if (!head) {
      const first = section.firstElementChild;
      const title = sectionTitle(section);
      head = document.createElement("div");
      head.className = "studio-lane-head studio-generated-head";
      head.innerHTML = `<div><h3>${esc(title)}</h3></div>`;
      section.insertBefore(head, first || null);
    }
    if (!head.querySelector(".studio-collapse-btn")) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "studio-collapse-btn";
      btn.setAttribute("aria-expanded", "false");
      btn.innerHTML =
        '<span aria-hidden="true">＋</span><strong>Expand</strong>';
      head.appendChild(btn);
    }
    return head;
  }

  function setSectionCollapsed(section, collapsed) {
    section.classList.toggle("studio-section-collapsed", !!collapsed);
    const btn = section.querySelector(
      ":scope > .studio-lane-head .studio-collapse-btn, :scope > .genre-identity-editor-head .studio-collapse-btn, :scope > .review-card-head .studio-collapse-btn",
    );
    if (btn) {
      btn.setAttribute("aria-expanded", collapsed ? "false" : "true");
      btn.innerHTML = collapsed
        ? '<span aria-hidden="true">＋</span><strong>Expand</strong>'
        : '<span aria-hidden="true">−</span><strong>Collapse</strong>';
    }
  }


  function captureStudioSectionState(mount) {
    if (!mount) return null;
    const openIds = [];
    $$(".studio-collapsible-section[id]", mount).forEach((section) => {
      if (!section.classList.contains("studio-section-collapsed")) {
        openIds.push(section.id);
      }
    });
    return {
      openIds,
      showAll: mount.classList.contains("studio-show-all"),
    };
  }

  function restoreStudioSectionState(mount, state) {
    if (!mount || !state) return;
    if (state.showAll) mount.classList.add("studio-show-all");
    state.openIds.forEach((id) => {
      const section = document.getElementById(id);
      if (section && section.closest("#reviewContent") === mount) {
        setSectionCollapsed(section, false);
      }
    });
    const expand = document.getElementById("studioExpandAllBtn");
    if (expand && state.showAll) {
      expand.textContent = "Collapse all sections";
      expand.setAttribute("aria-expanded", "true");
    }
  }

  function getStudioCollapsibleSections(mount) {
    return [
      ...$$(":scope > .studio-lane", mount),
      ...$$(":scope > .review-card", mount),
      ...$$(":scope > .genre-identity-editor", mount),
    ].filter(
      (section) =>
        !section.classList.contains("studio-workbench-hero") &&
        !section.classList.contains("studio-toolbar"),
    );
  }

  function makeStudioSectionsCollapsible(mount) {
    const sections = getStudioCollapsibleSections(mount);

    sections.forEach((section) => {
      if (section.dataset.studioCollapsible === "1") return;
      section.dataset.studioCollapsible = "1";
      section.classList.add("studio-collapsible-section");
      ensureCollapsibleHeader(section);
      setSectionCollapsed(section, true);
    });
  }

  function installInteractions(mount) {
    if (mount.dataset.studioInteractions === "1") return;
    mount.dataset.studioInteractions = "1";
    mount.addEventListener("click", (ev) => {
      if (ev.target?.closest?.(".studio-inline-track-edit")) {
        return;
      }
      const collapseBtn = ev.target.closest(".studio-collapse-btn");
      if (collapseBtn) {
        ev.preventDefault();
        const section = collapseBtn.closest(".studio-collapsible-section");
        if (section)
          setSectionCollapsed(
            section,
            !section.classList.contains("studio-section-collapsed"),
          );
        return;
      }
      const jump = ev.target.closest("[data-studio-jump]");
      if (jump) {
        ev.preventDefault();
        const target = document.getElementById(jump.dataset.studioJump || "");
        if (target) {
          setSectionCollapsed(target, false);
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
      const expand = ev.target.closest("#studioExpandAllBtn");
      if (expand) {
        ev.preventDefault();
        const shouldOpen = !mount.classList.contains("studio-show-all");
        mount.classList.toggle("studio-show-all", shouldOpen);
        const sections = getStudioCollapsibleSections(mount);
        sections.forEach((section) =>
          setSectionCollapsed(section, !shouldOpen),
        );
        expand.textContent = shouldOpen
          ? "Collapse all sections"
          : "Expand all sections";
        expand.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
        return;
      }
    });

    mount.addEventListener("input", (ev) => {
      if (
        ev.target?.id === "studioGlobalSearch" ||
        ev.target?.id === "studioPriorityFilter"
      ) {
        filterStudioRows(mount);
      }
    });
    mount.addEventListener("change", (ev) => {
      if (ev.target?.id === "studioPriorityFilter") filterStudioRows(mount);
    });
  }

  function filterStudioRows(mount) {
    const term = norm($("#studioGlobalSearch", mount)?.value || "");
    const mode = $("#studioPriorityFilter", mount)?.value || "";
    $$("[data-studio-row]", mount).forEach((row) => {
      const text = row.dataset.studioText || norm(row.textContent || "");
      const type = row.dataset.studioType || "";
      const pri = row.dataset.studioPriority || "";
      const lane = row.closest("[data-studio-lane]")?.dataset.studioLane || "";
      const matchesTerm = !term || text.includes(term);
      const matchesMode =
        !mode ||
        (mode === "high" ? pri === "high" : mode === lane || mode === type);
      row.classList.toggle("is-hidden", !(matchesTerm && matchesMode));
    });
  }

  function decodeMaybe(value) {
    try {
      return decodeURIComponent(String(value || ""));
    } catch (_) {
      return String(value || "");
    }
  }

  function miniPlayerButtonForSong(song) {
    const href = spotifyUrl(song);
    if (!href) return "";
    const rawUrl = encodeURIComponent(href);
    const title = encodeURIComponent(
      song?.title || songTitle(song) || "Spotify track",
    );
    const artist = encodeURIComponent(
      song?.artist ||
        (Array.isArray(song?.artists) ? song.artists.join(", ") : "") ||
        "",
    );
    const artwork = encodeURIComponent(song?.artwork || "");
    return `<button type="button" class="btn btn-secondary btn-tiny studio-mini-player-btn" title="Open in mini player" aria-label="Open in mini player" onclick="event.preventDefault(); event.stopPropagation(); if (typeof stickyPlayerOpen === 'function') stickyPlayerOpen('${rawUrl}', '${title}', '${artist}', '${artwork}'); else window.open('${esc(href)}','_blank','noopener');">▶</button>`;
  }

  function annotatePendingQueueRows(mount) {
    const card = $("#reviewPendingQueueCard", mount);
    if (!card) return;
    let queued = [];
    try {
      if (typeof window.collectQueuedPendingNominationRows === "function")
        queued = window.collectQueuedPendingNominationRows() || [];
    } catch (_) {}
    const rows = $$("[data-review-pending-row]", card);
    rows.forEach((rowEl, idx) => {
      const row = queued[idx] || null;
      const song = row?.song || null;
      const move = $(".review-move", rowEl);
      const titleLink = $(".review-track-title a", rowEl);
      const href = song ? spotifyUrl(song) : titleLink?.href || "";

      // Keep only one web/mini-player action. Older layers can leave both a Spotify
      // text button and a compact play button in the same row.
      if (move) {
        Array.from(move.querySelectorAll("button")).forEach((btn) => {
          const txt = (btn.textContent || "").trim();
          if (btn.classList.contains("studio-mini-player-btn") || /^spotify$/i.test(txt) || txt === "▶") btn.remove();
        });
        if (song && href) {
          move.insertAdjacentHTML("beforeend", miniPlayerButtonForSong(song));
        } else if (href) {
          const label = (titleLink?.textContent || "Spotify track").replace(/↗/g, "").trim();
          const rawUrl = encodeURIComponent(href);
          const title = encodeURIComponent(label);
          move.insertAdjacentHTML(
            "beforeend",
            `<button type="button" class="btn btn-secondary btn-tiny studio-mini-player-btn" title="Open in mini player" aria-label="Open in mini player" onclick="event.preventDefault(); event.stopPropagation(); if (typeof stickyPlayerOpen === 'function') stickyPlayerOpen('${rawUrl}', '${title}', '', ''); else window.open('${esc(href)}','_blank','noopener');">▶</button>`,
          );
        }
      }

      // Add the curator explanation/reason when available.
      if (
        song &&
        song.reason &&
        !rowEl.querySelector(".studio-pending-reason")
      ) {
        const main = rowEl.firstElementChild;
        if (main) {
          const reason = esc(song.reason);
          main.insertAdjacentHTML(
            "beforeend",
            `<div class="studio-pending-reason"><strong>Why queued:</strong> ${reason}</div>`,
          );
          rowEl.dataset.studioText = norm(
            [
              rowEl.dataset.studioText || "",
              song.reason,
              song.pendingFrom,
              song.artist,
              song.title,
            ].join(" "),
          );
        }
      }
    });
  }

  function clarifyNativeStudioLabels(mount) {
    const hero = document.querySelector("#screen-review .review-hero");
    if (hero && !hero.dataset.studioClarified) {
      hero.dataset.studioClarified = "1";
      const pendingBtn = Array.from(hero.querySelectorAll("button")).find(
        (btn) => /pending tag cleanup/i.test(btn.textContent || ""),
      );
      if (pendingBtn) {
        pendingBtn.textContent = "Route @tag nominations";
        pendingBtn.title =
          "Scans low-fit songs with @genre tags and queues them as pending nominations in the matching target genre.";
      }
    }
  }

  function apply() {
    if (isApplying) return;
    const mount = document.getElementById("reviewContent");
    if (!mount) return;
    isApplying = true;
    try {
      if (!mount.classList.contains("studio-workbench"))
        mount.classList.add("studio-workbench");
      const s = stats();
      clarifyNativeStudioLabels(mount);
      decorateExistingReviewSections(mount);
      annotatePendingQueueRows(mount);
      if (!$(".studio-workbench-hero", mount))
        mount.insertAdjacentHTML("afterbegin", renderHero(s) + renderToolbar());
      if (!$("#studio-repair-lane", mount))
        mount.insertAdjacentHTML("beforeend", renderRepairLane(s));
      if (!$("#studio-review-lane", mount))
        mount.insertAdjacentHTML("beforeend", renderReviewLane(s));
      enhanceSelects(mount);
      makeStudioSectionsCollapsible(mount);
      installInteractions(mount);
      filterStudioRows(mount);
      document.body.classList.add("studio-workbench-enabled");
    } finally {
      isApplying = false;
    }
  }

  function wrapRenderReview() {
    const original = window.renderReview;
    if (typeof original !== "function" || original.__studioWrapped)
      return false;
    function wrappedRenderReview() {
      // Do not rebuild Studio while the Song Inbox/editor is actively receiving keyboard paste.
      // Ctrl/Cmd+V fires before the textarea value changes; replacing the textarea in that
      // window makes the paste appear as a flash and then disappear. Context-menu paste did
      // not hit this path, which is why it worked before.
      if (isStudioTextEntryActive() || isInboxPasteGuardActive()) {
        const draft = captureInboxDraft();
        apply();
        restoreInboxDraft(draft);
        return null;
      }
      const draft = captureInboxDraft();
      const mount = document.getElementById("reviewContent");
      const sectionState = captureStudioSectionState(mount);
      if (mount) mount.classList.add("studio-rendering");
      const result = original.apply(this, arguments);
      apply();
      restoreStudioSectionState(mount, sectionState);
      restoreInboxDraft(draft);
      if (mount) {
        requestAnimationFrame(() => mount.classList.remove("studio-rendering"));
      }
      return result;
    }
    wrappedRenderReview.__studioWrapped = true;
    window.renderReview = wrappedRenderReview;
    return true;
  }

  async function updateStudioRepairGroupUrlFromQueue(encodedTargetsJson, inputId, button) {
    let targets = [];
    try {
      targets = JSON.parse(decodeURIComponent(String(encodedTargetsJson || "[]")));
    } catch (_) {
      targets = [];
    }
    const unique = [];
    const seen = new Set();
    targets.forEach((target) => {
      const genreId = String(target?.genreId ?? "");
      const key = String(target?.key ?? "");
      const displayKey = String(target?.displayKey ?? "");
      const title = String(target?.title ?? "");
      const artist = String(target?.artist ?? "");
      const id = `${genreId}::${key || displayKey || `${artist}::${title}`}`;
      if (!genreId || seen.has(id)) return;
      seen.add(id);
      unique.push({ ...target, genreId, key });
    });
    if (!unique.length) {
      toast("Could not find matching repair rows. Refresh Studio and try again.", true);
      return;
    }

    const originalText = button?.textContent || "Update";
    const setBusy = (copy) => {
      if (!button) return;
      button.disabled = true;
      button.classList.add("is-saving");
      button.textContent = copy;
    };
    const clearBusy = () => {
      if (!button || !document.body.contains(button)) return;
      button.disabled = false;
      button.classList.remove("is-saving");
      button.textContent = originalText;
    };

    let updated = 0;
    const resolved = [];
    try {
      setBusy(unique.length > 1 ? `Updating 1/${unique.length}…` : "Updating…");
      for (let idx = 0; idx < unique.length; idx += 1) {
        const target = unique[idx];
        if (idx > 0) setBusy(`Updating ${idx + 1}/${unique.length}…`);
        let result = null;
        if (typeof window.updateStudioRepairUrlTarget === "function") {
          result = await window.updateStudioRepairUrlTarget(target, inputId, idx === 0 ? button : null, "review");
        } else if (typeof window.updateMetadataTrackUrlFromQueue === "function" && target.key) {
          result = await window.updateMetadataTrackUrlFromQueue(
            encodeURIComponent(target.genreId),
            encodeURIComponent(target.key),
            inputId,
            idx === 0 ? button : null,
            "review",
          );
        }
        if (result?.ok !== false) {
          updated += 1;
          resolved.push({ ...target, key: result?.key || target.key });
        }
      }
      if (!updated) {
        toast("Could not find matching repair rows. The row may be stale; open the genre once or use the Metadata Queue delete/open tools.", true);
        return;
      }
      const rowEl = button?.closest?.(".studio-mini-row-repair");
      const metaEl = rowEl?.querySelector?.(".studio-mini-meta");
      if (metaEl) {
        const existing = metaEl.querySelector(".studio-inline-group-updated-chip");
        const label = `updated ${updated} ${updated === 1 ? "copy" : "copies"} · save pending`;
        if (existing) existing.textContent = label;
        else metaEl.insertAdjacentHTML("afterbegin", `<span class="studio-inline-group-updated-chip">${esc(label)}</span>`);
      }
      const remainingKinds = Array.from(new Set(resolved.flatMap((target) => {
        const song = findSongByGenreAndKey(target.genreId, target.key);
        return song ? missingKinds(song) : [];
      })));
      const rowElForChips = button?.closest?.(".studio-mini-row-repair");
      updateRepairMetaChips(rowElForChips?.querySelector?.(".studio-mini-meta"), remainingKinds);
      if (updated > 1) toast(`Updated ${updated} matching copies — Save cleanup to persist.`, false);
    } finally {
      clearBusy();
    }
  }

  window.updateStudioRepairGroupUrlFromQueue = updateStudioRepairGroupUrlFromQueue;

  function boot() {
    wrapRenderReview();
    if (document.getElementById("screen-review")?.classList.contains("active"))
      apply();
    document.addEventListener(
      "click",
      (ev) => {
        const reviewTab = ev.target.closest?.('[data-screen="review"]');
        if (reviewTab) {
          const mount = document.getElementById("reviewContent");
          if (mount) mount.classList.add("studio-rendering");
          setTimeout(() => {
            if (isStudioTextEntryActive() || isInboxPasteGuardActive()) return;
            apply();
            requestAnimationFrame(() => mount?.classList.remove("studio-rendering"));
          }, 0);
          return;
        }
        // Avoid re-applying Studio wrappers while a text field is being clicked/focused.
        // Replacing the Song Inbox textarea during the paste event caused the flash/lost paste bug.
        if (ev.target.closest?.("#screen-review") && isEditableStudioTarget(ev.target)) {
          armInboxPasteGuard(500);
          return;
        }
      },
      true,
    );

    document.addEventListener(
      "keydown",
      (ev) => {
        if (!ev.target?.closest?.("#screen-review")) return;
        if (!isEditableStudioTarget(ev.target)) return;
        const key = String(ev.key || "").toLowerCase();
        if ((ev.metaKey || ev.ctrlKey) && (key === "v" || key === "x" || key === "a")) {
          armInboxPasteGuard(1200);
        }
      },
      true,
    );

    document.addEventListener(
      "paste",
      (ev) => {
        if (ev.target?.closest?.("#screen-review") && isEditableStudioTarget(ev.target))
          armInboxPasteGuard(1200);
      },
      true,
    );

    document.addEventListener(
      "input",
      (ev) => {
        if (ev.target?.closest?.("#screen-review") && isEditableStudioTarget(ev.target))
          armInboxPasteGuard(350);
      },
      true,
    );
  }

  window.DailyGenreStudioWorkbench = { apply, stats, version: VERSION };
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
