/* Daily Genre Studio Workbench v1
   Add-on only: wraps renderReview() after app.js renders Review/Studio content.
   Does not touch app.js, genre loading, spin, library, stats, songs, or album carousel.
*/
(function () {
  "use strict";

  const VERSION = "studio-polish-v196-url-override-save-flow";
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

  /* Daily Genre v190: Repair Bay clean helper.
     Repair Bay URL applies read manual title/artist overrides through clean(). */
  function clean(value) {
    return String(value ?? "").trim();
  }

  function studioArtworkUrl(song) {
    return String(song?.artwork || song?.albumArt || song?.image || song?.thumbnail || song?.cover || "").trim();
  }

  function updateRepairRowThumbnail(rowEl, songOrArt) {
    if (!rowEl) return false;
    const art = typeof songOrArt === "string" ? songOrArt.trim() : studioArtworkUrl(songOrArt);
    if (!art) return false;
    const thumbSlot = rowEl.querySelector(".studio-thumb, .studio-thumb-empty");
    if (!thumbSlot) return false;
    if (thumbSlot.tagName === "IMG") {
      thumbSlot.src = art;
      thumbSlot.classList.remove("studio-thumb-empty");
      return true;
    }
    const img = document.createElement("img");
    img.className = "studio-thumb studio-thumb-updated";
    img.src = art;
    img.alt = "";
    img.loading = "lazy";
    thumbSlot.replaceWith(img);
    return true;
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

  const REPAIR_SKIP_STORAGE_KEY = "dailyGenreStudioRepairSkipOrder:v1";

  function readRepairSkipMap() {
    try {
      const parsed = JSON.parse(localStorage.getItem(REPAIR_SKIP_STORAGE_KEY) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function writeRepairSkipMap(map) {
    try { localStorage.setItem(REPAIR_SKIP_STORAGE_KEY, JSON.stringify(map || {})); } catch (_) {}
  }

  const REPAIR_RESOLVED_STORAGE_KEY = "dailyGenreStudioRepairResolvedRows:v1";

  function readRepairResolvedMap() {
    try {
      const parsed = JSON.parse(localStorage.getItem(REPAIR_RESOLVED_STORAGE_KEY) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function writeRepairResolvedMap(map) {
    try { localStorage.setItem(REPAIR_RESOLVED_STORAGE_KEY, JSON.stringify(map || {})); } catch (_) {}
  }

  function markRepairResolved(key) {
    if (!key) return;
    const map = readRepairResolvedMap();
    map[String(key)] = Date.now();
    writeRepairResolvedMap(map);
  }

  function clearRepairResolved(key) {
    if (!key) return;
    const map = readRepairResolvedMap();
    if (map && Object.prototype.hasOwnProperty.call(map, String(key))) {
      delete map[String(key)];
      writeRepairResolvedMap(map);
    }
  }

  function isRepairRecentlyResolved(row) {
    const key = repairSkipKey(row);
    if (!key) return false;
    const markedAt = Number(readRepairResolvedMap()[key] || 0);
    if (!markedAt) return false;
    const missing = Array.isArray(row?.repairProblems) && row.repairProblems.length ? row.repairProblems : missingKinds(row?.song || row);
    if (!missing.length) return true;
    // Keep it hidden for this browser session after a successful inline apply. If it still truly
    // needs work after a fresh page reload, it will reappear instead of sticking at the top forever.
    return Date.now() - markedAt < 6 * 60 * 60 * 1000;
  }

  function repairSkipKey(rowOrSong) {
    const song = rowOrSong?.song || rowOrSong;
    return repairDisplayKey(song) || songKey(song) || norm(songTitle(song));
  }

  function markRepairSkipped(key) {
    if (!key) return;
    const map = readRepairSkipMap();
    map[String(key)] = Date.now();
    writeRepairSkipMap(map);
  }

  function isRepairSkipped(row) {
    const key = repairSkipKey(row);
    const map = readRepairSkipMap();
    return key && Number(map[key] || 0) > 0;
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
    )
      .filter((row) => !isRepairRecentlyResolved(row))
      .sort((a, b) => {
        const aSkipped = isRepairSkipped(a) ? 1 : 0;
        const bSkipped = isRepairSkipped(b) ? 1 : 0;
        return aSkipped - bSkipped || (b.priority || 0) - (a.priority || 0) || String(songTitle(a.song)).localeCompare(songTitle(b.song));
      })
      .slice(0, limit);
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
      song?.externalMetadataFetched ||
      song?.source === "youtube" ||
      song?.source === "apple" ||
      song?.releaseYear ||
      song?.releaseDate ||
      song?.durationMs ||
      song?.isrc
    );
  }

  function missingKinds(song) {
    const missing = [];
    const url = spotifyUrl(song);
    const isSpotify = /open\.spotify\.com\/track\//i.test(url || "") || /spotify:track:/i.test(url || "");
    if (!song?.artwork && !song?.albumArt) missing.push("art");
    if (isSpotify && !song?.spotifyId) missing.push("id");
    if (url && !song?.releaseYear && !song?.releaseDate && !song?.eraYear && song?.source !== "youtube")
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
    const art = studioArtworkUrl(song);
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
        const titleOverrideId = `${inputId}_title`;
        const artistOverrideId = `${inputId}_artist`;
        const inlineRepair = isRepair
          ? `<div class="studio-inline-track-edit" data-studio-repair-form="1" data-studio-repair-targets="${encodedTargets}" data-studio-repair-input="${esc(inputId)}" onpointerdown="event.preventDefault(); event.stopPropagation();" onmousedown="event.stopPropagation();" onclick="event.stopPropagation();"><label for="${esc(inputId)}">Spotify / YouTube / Apple Music URL${row.targetCount > 1 ? ` · updates ${esc(String(row.targetCount))} matching copies` : ""}</label><div><input id="${esc(inputId)}" type="url" placeholder="https://open.spotify.com/track/... or https://music.apple.com/... or https://youtu.be/..." value="${esc(currentUrl)}" onclick="event.stopPropagation();" onkeydown="if(event.key === 'Enter'){ event.preventDefault(); event.stopPropagation(); const wrap=this.closest('[data-studio-repair-form]'); const btn=wrap?.querySelector('[data-studio-repair-update]'); if(btn) btn.click(); }"><button type="button" class="btn btn-primary btn-tiny" data-studio-repair-update="1" onclick="event.preventDefault(); event.stopPropagation(); typeof updateStudioRepairGroupUrlFromQueue === 'function' ? updateStudioRepairGroupUrlFromQueue('${encodedTargets}', '${esc(inputId)}', this) : null; return false;">${row.targetCount > 1 ? "Apply to copies / Overrides" : "Apply URL / Overrides"}</button></div><div class="studio-repair-manual-meta"><input id="${esc(titleOverrideId)}" type="text" value="${esc(row.song?.title || row.song?.name || '')}" placeholder="Override title if YouTube/Apple title is messy" onclick="event.stopPropagation();"><input id="${esc(artistOverrideId)}" type="text" value="${esc(row.song?.artist || (Array.isArray(row.song?.artists) ? row.song.artists.join(', ') : ''))}" placeholder="Override artist/channel if needed" onclick="event.stopPropagation();"></div><div class="studio-inline-repair-status" data-studio-repair-status aria-live="polite">Edit title/artist, then Apply URL / Overrides. Use Save cleanup to persist.</div></div>`
          : "";
        const skipKey = isRepair ? encodeURIComponent(repairSkipKey(row) || "") : "";
        return `<article class="studio-mini-row ${isRepair ? "studio-mini-row-repair studio-mini-row-repair-grouped" : ""}" data-studio-row data-studio-text="${esc(norm([problem, genreName, songTitle(row.song), row.song?.reason, row.song?.pendingFrom, row.targetCount > 1 ? `${row.targetCount} copies` : ""].join(" ")))}" data-studio-type="${esc(row.type)}" data-studio-priority="${row.priority >= 70 ? "high" : row.priority >= 45 ? "med" : "low"}">
          ${renderSongThumb(row.song)}
          <div class="studio-mini-main">
            <div class="studio-mini-title">${href ? `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(songTitle(row.song))}</a>` : esc(songTitle(row.song))}</div>
            <div class="studio-mini-meta">${copyChip}${problemChips}<span>${esc(genreName)}</span>${fit ? `<span>fit ${esc(fit)}/5</span>` : ""}${row.song?.pendingFrom ? `<span>from ${esc(row.song.pendingFrom)}</span>` : ""}</div>
            ${inlineRepair}
          </div>
          <div class="studio-mini-actions">
            ${isRepair ? `<button type="button" class="btn btn-secondary btn-tiny" onclick="event.preventDefault(); event.stopPropagation(); typeof skipStudioRepairRow === 'function' ? skipStudioRepairRow('${skipKey}', this) : null; return false;">Skip for now</button><button type="button" class="btn btn-danger btn-tiny studio-hard-delete-btn" onclick="event.preventDefault(); event.stopPropagation(); typeof hardDeleteStudioRepairGroup === 'function' ? hardDeleteStudioRepairGroup('${encodedTargets}', this) : null; return false;" title="Permanently delete this track from every genre and every queue">Delete everywhere</button>` : ""}
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
      <div class="studio-action-strip studio-repair-actions-compact">
        <button type="button" class="btn btn-secondary" onclick="typeof refreshNextSpotifyTracks === 'function' ? refreshNextSpotifyTracks(5) : null">Auto-refresh next 5</button>
        <button type="button" class="btn btn-secondary" onclick="typeof refreshStudioRepairList === 'function' ? refreshStudioRepairList(this) : (typeof renderReview === 'function' ? renderReview() : null)">Refresh repair list</button>
        <div class="studio-action-helper">Paste a better Spotify, YouTube, or Apple Music URL inline, click <strong>Apply URL</strong>, confirm the thumbnail changes, then Save Library Updates. Use Skip for now when a row is not easy to repair yet.</div>
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
        pendingBtn.textContent = "Import @tags (advanced)";
        pendingBtn.title =
          "Advanced backfill only: scans pasted low-fit @genre rows and can re-create pending nominations. Manual Routing Desk decisions are the normal flow.";
        const wrap = pendingBtn.closest('.review-hero, .panel, .review-card') || hero;
        if (wrap && !wrap.querySelector('.studio-retired-tag-route-note')) {
          pendingBtn.insertAdjacentHTML('afterend', '<div class="studio-retired-tag-route-note"><strong>Heads up:</strong> @tag import is only for old pasted Studio blocks. For everyday cleanup, use the Routing Desk rows below.</div>');
        }
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


  function setStudioLibraryDirty() {
    try { libraryUpdatesPending = true; } catch (_) {}
    try { setUnsavedState(true); } catch (_) {}
    try { toggleLibrarySaveButton(true); } catch (_) {}
  }

  function canonicalSpotifyTrackUrl(url = "") {
    const raw = String(url || "").trim();
    if (typeof window.spotifyCanonicalTrackUrl === "function") return window.spotifyCanonicalTrackUrl(raw);
    const match = raw.match(/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?track\/([A-Za-z0-9]{22})/i) || raw.match(/spotify:track:([A-Za-z0-9]{22})/i) || raw.match(/^[A-Za-z0-9]{22}$/);
    const id = match ? (match[1] || match[0]) : "";
    return id ? `https://open.spotify.com/track/${id}` : raw;
  }

  function findRepairTargetSong(target) {
    const genre = getGenres().find((g) => String(g?.id ?? "") === String(target?.genreId ?? ""));
    if (!genre) return null;
    const songs = inflateSongs(genre.songs_listened || []);
    let found = null;
    const key = String(target?.key || "");
    const displayKey = String(target?.displayKey || "");
    const targetUrl = canonicalSpotifyTrackUrl(target?.url || "");
    const targetTitle = norm(target?.title || "");
    const targetArtist = norm(target?.artist || "");
    const visit = (song) => {
      if (!song || found) return;
      const keys = [songKey(song), repairDisplayKey(song)].filter(Boolean).map(String);
      const songUrl = canonicalSpotifyTrackUrl(song.spotifyUrl || song.url || "");
      const title = norm(song.title || song.name || "");
      const artist = norm(song.artist || (Array.isArray(song.artists) ? song.artists.join(" ") : ""));
      if ((key && keys.includes(key)) || (displayKey && keys.includes(displayKey)) || (targetUrl && songUrl && targetUrl === songUrl) || (targetTitle && targetArtist && title === targetTitle && artist === targetArtist)) found = song;
    };
    songs.forEach((song) => {
      visit(song);
      if (song?.levelUp) visit(song.levelUp);
    });
    return found ? { genre, songs, song: found } : null;
  }


  function classifyRepairUrl(rawUrl = "") {
    const raw = String(rawUrl || "").trim();
    if (/open\.spotify\.com\/track\//i.test(raw) || /spotify:track:/i.test(raw)) return "spotify";
    if (/music\.apple\.com\//i.test(raw) || /itunes\.apple\.com\//i.test(raw)) return "apple";
    if (/(youtube\.com\/watch|youtu\.be\/|youtube\.com\/shorts\/)/i.test(raw)) return "youtube";
    return "generic";
  }

  function extractYouTubeId(rawUrl = "") {
    const raw = String(rawUrl || "").trim();
    const match = raw.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/i) || raw.match(/[?&]v=([A-Za-z0-9_-]{6,})/i) || raw.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/i) || raw.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/i);
    return match ? match[1] : "";
  }

  function youTubePlaceholderIcon() {
    return "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" rx="18" fill="#f4e4c6"/><rect x="18" y="28" width="60" height="40" rx="10" fill="#c4302b"/><path d="M43 38v20l18-10z" fill="#fff"/></svg>`);
  }

  async function fetchYouTubeRepairMetadata(rawUrl) {
    const id = extractYouTubeId(rawUrl);
    const metadata = { source: "youtube", url: rawUrl, artwork: id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : youTubePlaceholderIcon(), albumArt: id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : youTubePlaceholderIcon() };
    try {
      const endpoint = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(rawUrl)}`;
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        if (data?.title) metadata.title = data.title;
        if (data?.author_name) metadata.artist = data.author_name;
        if (data?.thumbnail_url) {
          metadata.artwork = data.thumbnail_url;
          metadata.albumArt = data.thumbnail_url;
        }
      }
    } catch (_) {}
    return metadata;
  }

  function extractAppleMusicId(rawUrl = "") {
    const raw = String(rawUrl || "");
    const iMatch = raw.match(/[?&]i=(\d+)/);
    if (iMatch) return iMatch[1];
    const matches = Array.from(raw.matchAll(/\/(\d{6,})(?:[/?#]|$)/g)).map((m) => m[1]);
    return matches.length ? matches[matches.length - 1] : "";
  }

  async function fetchAppleMusicRepairMetadata(rawUrl) {
    const id = extractAppleMusicId(rawUrl);
    const metadata = { source: "apple", url: rawUrl };
    if (!id) return metadata;
    try {
      const response = await fetch(`https://itunes.apple.com/lookup?id=${encodeURIComponent(id)}&entity=song`);
      if (response.ok) {
        const data = await response.json();
        const item = Array.isArray(data?.results) ? (data.results.find((r) => r.wrapperType === "track") || data.results[0]) : null;
        if (item) {
          metadata.title = item.trackName || item.collectionName || "";
          metadata.artist = item.artistName || "";
          metadata.album = item.collectionName || "";
          metadata.artwork = String(item.artworkUrl100 || "").replace(/100x100bb\./, "600x600bb.");
          metadata.albumArt = metadata.artwork;
          metadata.releaseDate = item.releaseDate || "";
          metadata.releaseYear = item.releaseDate ? Number(String(item.releaseDate).slice(0, 4)) || null : null;
          metadata.durationMs = Number(item.trackTimeMillis || 0) || null;
        }
      }
    } catch (_) {}
    return metadata;
  }

  async function fetchExternalRepairMetadata(rawUrl) {
    const kind = classifyRepairUrl(rawUrl);
    if (kind === "youtube") return fetchYouTubeRepairMetadata(rawUrl);
    if (kind === "apple") return fetchAppleMusicRepairMetadata(rawUrl);
    return { source: kind, url: rawUrl };
  }

  function applyExternalRepairMetadata(song, rawUrl, metadata = {}) {
    const kind = classifyRepairUrl(rawUrl);
    song.url = rawUrl;
    if (kind !== "spotify") song.spotifyUrl = song.spotifyUrl || "";
    song.source = metadata.source || kind;
    if (metadata.title) song.title = metadata.title;
    if (metadata.artist) {
      song.artist = metadata.artist;
      song.artists = [metadata.artist].filter(Boolean);
    }
    if (metadata.album) song.album = metadata.album;
    if (metadata.artwork) {
      song.artwork = metadata.artwork;
      song.albumArt = metadata.albumArt || metadata.artwork;
    }
    if (metadata.releaseDate) song.releaseDate = metadata.releaseDate;
    if (metadata.releaseYear) song.releaseYear = metadata.releaseYear;
    if (metadata.durationMs) song.durationMs = metadata.durationMs;
    song.externalMetadataFetched = true;
    song.externalMetadataFetchedAt = new Date().toISOString();
  }

  function repairTextSimilarity(a = "", b = "") {
    const tokens = (value) => String(value || "")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .filter((token) => !["the", "a", "an", "el", "la", "los", "las", "le", "les", "un", "una", "feat", "ft", "official", "video", "audio"].includes(token));
    const left = tokens(a);
    const right = tokens(b);
    if (!left.length && !right.length) return 1;
    if (!left.length || !right.length) return 0;
    const rightSet = new Set(right);
    const overlap = left.filter((token) => rightSet.has(token)).length;
    return overlap / Math.max(left.length, right.length);
  }

  function repairArtistName(value) {
    if (Array.isArray(value?.artists)) return value.artists.filter(Boolean).join(" ");
    return String(value?.artist || value?.author || value?.artistName || "");
  }

  function repairTitleName(value) {
    return String(value?.title || value?.trackName || value?.name || "");
  }

  function repairMetadataLooksClose(oldSong, newMetadata) {
    if (!oldSong || !newMetadata) return true;
    const oldTitle = repairTitleName(oldSong);
    const oldArtist = repairArtistName(oldSong);
    const newTitle = repairTitleName(newMetadata);
    const newArtist = repairArtistName(newMetadata);
    if (!oldTitle.trim() && !oldArtist.trim()) return true;
    if (!newTitle.trim() && !newArtist.trim()) return true;
    const titleScore = repairTextSimilarity(oldTitle, newTitle);
    const artistScore = repairTextSimilarity(oldArtist, newArtist);
    return titleScore >= 0.45 && (artistScore >= 0.35 || !oldArtist.trim() || !newArtist.trim());
  }

  function repairDisplayLabel(songLike, fallback = "this repair row") {
    const title = repairTitleName(songLike).trim();
    const artist = repairArtistName(songLike).trim();
    if (artist && title) return `${artist} — ${title}`;
    return title || artist || fallback;
  }

  function repairSourceLabel(kind = "") {
    if (kind === "spotify") return "Spotify";
    if (kind === "youtube") return "YouTube";
    if (kind === "apple") return "Apple Music";
    return "linked";
  }

  function confirmStudioRepairUrlOverwrite(oldSong, newMetadata, kind = "") {
    if (repairMetadataLooksClose(oldSong, newMetadata)) return true;
    const currentLabel = repairDisplayLabel(oldSong, "this repair row");
    const resultLabel = repairDisplayLabel(newMetadata, `the ${repairSourceLabel(kind)} track`);
    return window.confirm(`This ${repairSourceLabel(kind)} result does not look like a close match.

Current repair row: ${currentLabel}
${repairSourceLabel(kind)} result: ${resultLabel}

Overwrite the selected repair row anyway? This will replace its title, artist, artwork, URL, and metadata without creating a new row.`);
  }

  async function applyRepairUrlTarget(target, inputId) {
    const input = document.getElementById(inputId);
    const rawUrl = String(input?.value || "").trim();
    const manualTitle = clean(String(document.getElementById(`${inputId}_title`)?.value || "")).trim();
    const manualArtist = clean(String(document.getElementById(`${inputId}_artist`)?.value || "")).trim();
    if (!rawUrl) return { ok: false, error: "Paste a Spotify, YouTube, or Apple Music URL first." };
    const kind = classifyRepairUrl(rawUrl);
    // v196: Repair Bay rows can become stale after the first URL apply because the
    // song identity key changes from the old missing-metadata row to the repaired
    // YouTube/Apple/Spotify row. If the user then edits title/artist overrides and
    // clicks Apply again, find by the current URL and/or typed override fields before
    // giving up. This lets Apply URL / Overrides behave like a save action.
    let located = findRepairTargetSong(target);
    if (!located) {
      located = findRepairTargetSong({
        ...target,
        url: rawUrl,
        title: manualTitle || target?.title || "",
        artist: manualArtist || target?.artist || "",
      });
    }
    if (!located) return { ok: false, error: "Could not find that track in the current library rows." };


    const canonical = kind === "spotify" ? canonicalSpotifyTrackUrl(rawUrl) : rawUrl;
    const oldSong = {
      title: located.song.title || located.song.name || target?.title || "",
      artist: located.song.artist || (Array.isArray(located.song.artists) ? located.song.artists.join(" ") : "") || target?.artist || "",
      artists: Array.isArray(located.song.artists) ? located.song.artists.slice() : [],
    };

    let refreshed = false;
    let refreshError = "";
    if (kind !== "spotify") {
      const metadata = await fetchExternalRepairMetadata(canonical);
      const proposedExternal = {
        ...metadata,
        title: manualTitle || metadata.title || "",
        artist: manualArtist || metadata.artist || "",
      };
      const hasLookupIdentity = !!(proposedExternal.title || proposedExternal.artist);
      if (!manualTitle && !manualArtist && hasLookupIdentity && !confirmStudioRepairUrlOverwrite(oldSong, metadata, kind)) {
        return { ok: false, cancelled: true, error: "Apply cancelled." };
      }
      applyExternalRepairMetadata(located.song, canonical, proposedExternal);
      refreshed = !!(metadata.artwork || metadata.title || metadata.artist || metadata.album || metadata.releaseYear || metadata.releaseDate);
      if (!metadata.artwork && kind === "youtube") {
        located.song.artwork = youTubePlaceholderIcon();
        located.song.albumArt = located.song.artwork;
        refreshed = true;
      }
    } else if (/open\.spotify\.com\/track\//i.test(canonical) && typeof fetchSpotifyTrackResult === "function") {
      const result = await fetchSpotifyTrackResult(canonical, true);
      if (result?.ok && result.track) {
        if (!confirmStudioRepairUrlOverwrite(oldSong, result.track, kind)) {
          return { ok: false, cancelled: true, error: "Apply cancelled." };
        }
        located.song.url = canonical;
        located.song.spotifyUrl = result.track.spotifyUrl || canonical;
        if (typeof applyOfficialSpotifyMetadata === "function") applyOfficialSpotifyMetadata(located.song, result.track);
        Object.assign(located.song, {
          spotifyId: result.track.spotifyId || located.song.spotifyId || "",
          spotifyUrl: result.track.spotifyUrl || canonical,
          title: result.track.title || located.song.title || "",
          artist: result.track.artist || located.song.artist || "",
          artists: Array.isArray(result.track.artists) ? result.track.artists.filter(Boolean) : (located.song.artists || []),
          album: result.track.album || located.song.album || "",
          artwork: result.track.artwork || located.song.artwork || located.song.albumArt || "",
          albumArt: result.track.artwork || located.song.albumArt || located.song.artwork || "",
          releaseDate: result.track.releaseDate || located.song.releaseDate || "",
          releaseYear: result.track.releaseYear || located.song.releaseYear || null,
          durationMs: Number(result.track.durationMs || 0) || located.song.durationMs || null,
          isrc: result.track.isrc || located.song.isrc || "",
          source: "spotify",
          spotifyMetadataFetched: true,
          spotifyMetadataFetchedAt: new Date().toISOString(),
        });
        refreshed = true;
      } else {
        located.song.url = canonical;
        located.song.spotifyUrl = /open\.spotify\.com\/track\//i.test(canonical) ? canonical : (located.song.spotifyUrl || "");
        refreshError = result?.error || "Spotify lookup did not return metadata.";
      }
    } else {
      located.song.url = canonical;
      located.song.spotifyUrl = /open\.spotify\.com\/track\//i.test(canonical) ? canonical : (located.song.spotifyUrl || "");
    }

    if (manualTitle) located.song.title = manualTitle;
    if (manualArtist) {
      located.song.artist = manualArtist;
      located.song.artists = [manualArtist];
    } else if (located.song.artist && (!Array.isArray(located.song.artists) || !located.song.artists.length)) {
      located.song.artists = [located.song.artist];
    }

    located.genre.songs_listened = located.songs;
    setStudioLibraryDirty();
    return { ok: true, key: songKey(located.song), song: located.song, genre: located.genre, refreshed, refreshError };
  }

  window.updateStudioRepairUrlTarget = async function updateStudioRepairUrlTarget(target, inputId) {
    return applyRepairUrlTarget(target, inputId);
  };

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

    const originalText = button?.textContent || "Apply URL";
    const rowForStatus = button?.closest?.(".studio-mini-row-repair");
    const statusEl = rowForStatus?.querySelector?.("[data-studio-repair-status]");
    const setStatus = (copy, isErr = false) => { if (statusEl) { statusEl.textContent = copy || ""; statusEl.classList.toggle("is-error", !!isErr); } };
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
    let cancelled = 0;
    const resolved = [];
    try {
      setStatus("Applying URL and checking artwork/metadata…");
      setBusy(unique.length > 1 ? `Applying 1/${unique.length}…` : "Applying…");
      for (let idx = 0; idx < unique.length; idx += 1) {
        const target = unique[idx];
        if (idx > 0) setBusy(`Applying ${idx + 1}/${unique.length}…`);
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
        if (result?.cancelled) {
          cancelled += 1;
          break;
        }
        if (result?.ok !== false) {
          updated += 1;
          resolved.push({ ...target, key: result?.key || target.key, song: result?.song || null, genre: result?.genre || null });
        }
      }
      if (!updated) {
        if (cancelled) {
          setStatus("Apply cancelled — no repair rows changed.", false);
          toast("Apply cancelled. The repair row was left unchanged.", false);
        } else {
          setStatus("No matching row was updated.", true);
          toast("Could not find matching repair rows. The row may be stale; open the genre once or use the Metadata Queue delete/open tools.", true);
        }
        return;
      }
      const rowEl = button?.closest?.(".studio-mini-row-repair");
      const metaEl = rowEl?.querySelector?.(".studio-mini-meta");
      if (metaEl) {
        const existing = metaEl.querySelector(".studio-inline-group-updated-chip");
        const label = `applied ${updated} ${updated === 1 ? "copy" : "copies"} · save pending`;
        if (existing) existing.textContent = label;
        else metaEl.insertAdjacentHTML("afterbegin", `<span class="studio-inline-group-updated-chip">${esc(label)}</span>`);
      }
      const primaryUpdate = resolved.find((item) => item.song) || null;
      const updatedSong = primaryUpdate?.song || null;
      const rowElVisible = button?.closest?.(".studio-mini-row-repair");
      if (updatedSong && rowElVisible) {
        const titleEl = rowElVisible.querySelector(".studio-mini-title");
        const href = spotifyUrl(updatedSong);
        const titleText = songTitle(updatedSong);
        if (titleEl) titleEl.innerHTML = href ? `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(titleText)}</a>` : esc(titleText);
        updateRepairRowThumbnail(rowElVisible, updatedSong);
        if (metaEl) {
          const info = [];
          if (updatedSong.artist) info.push(updatedSong.artist);
          if (updatedSong.year) info.push(updatedSong.year);
          if (updatedSong.album) info.push(updatedSong.album);
          if (info.length) {
            const oldInfo = metaEl.querySelector(".studio-inline-updated-info-chip");
            const text = `now: ${info.slice(0, 3).join(" · ")}`;
            if (oldInfo) oldInfo.textContent = text;
            else metaEl.insertAdjacentHTML("beforeend", `<span class="studio-inline-updated-info-chip">${esc(text)}</span>`);
          }
        }
      }
      const remainingKinds = Array.from(new Set(resolved.flatMap((target) => {
        const song = findSongByGenreAndKey(target.genreId, target.key);
        return song ? missingKinds(song) : [];
      })));
      const rowElForChips = button?.closest?.(".studio-mini-row-repair");
      updateRepairMetaChips(rowElForChips?.querySelector?.(".studio-mini-meta"), remainingKinds);
      if (rowElForChips && !remainingKinds.length) {
        rowElForChips.classList.add("studio-repair-resolved");
        const meta = rowElForChips.querySelector(".studio-mini-meta");
        if (meta && !meta.querySelector(".studio-repair-resolved-chip")) {
          meta.insertAdjacentHTML("afterbegin", '<span class="studio-repair-resolved-chip">resolved · refresh list to remove</span>');
        }
      }
      // v178: remember the original repair keys that were successfully handled so Refresh Repair List
      // does not keep a stale/sticky first row pinned at the top until the user presses Skip.
      resolved.forEach((item) => {
        markRepairResolved(item.displayKey || item.key || repairSkipKey(item.song));
      });
      const refreshedCount = resolved.filter((item) => item.song && (item.song.artwork || item.song.albumArt)).length;
      setStatus(refreshedCount ? `Applied URL / overrides · artwork found for ${refreshedCount} ${refreshedCount === 1 ? "track" : "tracks"}. Save cleanup to persist.` : "Applied URL / overrides. Save cleanup to persist.", false);
      if (updated > 1) toast(`Applied URL to ${updated} matching copies — Save cleanup to persist.`, false);
      else toast("URL / overrides applied — Save cleanup to persist.", false);
    } catch (err) {
      console.error("Repair Bay apply failed", err);
      setStatus(`Apply failed: ${err?.message || err || "Unknown error"}`, true);
      toast("Repair Bay update failed. Check the row message and try again.", true);
    } finally {
      clearBusy();
    }
  }


  function hardDeleteStudioRepairGroup(encodedTargetsJson, button = null) {
    let targets = [];
    try {
      targets = JSON.parse(decodeURIComponent(String(encodedTargetsJson || "[]")));
    } catch (_) {
      targets = [];
    }
    const unique = [];
    const seen = new Set();
    targets.forEach((target) => {
      const id = `${target?.genreId || ""}::${target?.key || target?.displayKey || target?.url || target?.title || ""}`;
      if (!id || seen.has(id)) return;
      seen.add(id);
      unique.push(target);
    });
    if (!unique.length) {
      toast("Could not identify that track for Delete everywhere.", true);
      return;
    }
    const label = unique[0]?.artist || unique[0]?.title
      ? `${unique[0]?.artist ? `${unique[0].artist} — ` : ""}${unique[0]?.title || "this track"}`
      : "this track";
    const copyCount = unique.length > 1 ? ` and ${unique.length - 1} matching ${unique.length === 2 ? "copy" : "copies"}` : "";
    if (!window.confirm(`Delete ${label}${copyCount} everywhere?

This removes it from every genre queue and pending list. It becomes permanent after Save Library Updates.`)) return;
    const previous = button?.textContent || "Delete everywhere";
    if (button) {
      button.disabled = true;
      button.textContent = "Deleting…";
    }
    try {
      if (typeof window.hardDeleteSongEverywhere !== "function") {
        toast("Delete everywhere helper is not available. Refresh and try again.", true);
        return;
      }
      const result = window.hardDeleteSongEverywhere(unique, { renderStudio: false });
      if (!result?.deleted) {
        toast("No matching songs were found to delete.", true);
        return;
      }
      unique.forEach((target) => markRepairResolved(target.displayKey || target.key || target.url || target.title || ""));
      const row = button?.closest?.(".studio-mini-row-repair");
      if (row) {
        row.classList.add("studio-repair-resolved");
        row.style.opacity = "0.55";
        const meta = row.querySelector(".studio-mini-meta");
        if (meta && !meta.querySelector(".studio-repair-resolved-chip")) {
          meta.insertAdjacentHTML("afterbegin", '<span class="studio-repair-resolved-chip">deleted everywhere · save pending</span>');
        }
      }
      toast(`Deleted ${result.deleted} ${result.deleted === 1 ? "track" : "tracks"} everywhere from ${result.genresTouched} ${result.genresTouched === 1 ? "genre" : "genres"} — Save Library Updates to persist.`, false);
      setTimeout(() => refreshStudioRepairList(null), 180);
    } catch (error) {
      console.error("Studio delete everywhere failed", error);
      toast(`Delete everywhere failed: ${error?.message || error || "Unknown error"}`, true);
    } finally {
      if (button && document.body.contains(button)) {
        button.disabled = false;
        button.textContent = previous;
      }
    }
  }

  window.hardDeleteStudioRepairGroup = hardDeleteStudioRepairGroup;

  function skipStudioRepairRow(encodedKey, button = null) {
    let key = "";
    try { key = decodeURIComponent(String(encodedKey || "")); } catch (_) { key = String(encodedKey || ""); }
    if (!key) {
      toast("Could not identify that repair row.", true);
      return;
    }
    markRepairSkipped(key);
    const row = button?.closest?.(".studio-mini-row-repair");
    if (row) {
      row.classList.add("studio-repair-skipped-now");
      row.style.opacity = "0.64";
    }
    toast("Skipped for now — it will move to the bottom of the Repair Bay list.", false);
    setTimeout(() => refreshStudioRepairList(null), 120);
  }

  window.skipStudioRepairRow = skipStudioRepairRow;

  function refreshStudioRepairList(button = null) {
    const original = button?.textContent || "Refresh repair list";
    if (button) {
      button.disabled = true;
      button.textContent = "Refreshing…";
    }
    const restore = typeof preserveScrollSnapshot === "function" ? preserveScrollSnapshot() : null;
    try {
      if (typeof renderReview === "function") renderReview();
      setTimeout(() => {
        // v178: re-check the repair list without moving the user's scroll position.
        if (restore) restore();
      }, 0);
    } finally {
      setTimeout(() => {
        if (button && document.body.contains(button)) {
          button.disabled = false;
          button.textContent = original;
        }
      }, 120);
    }
  }

  window.refreshStudioRepairList = refreshStudioRepairList;

  window.updateStudioRepairGroupUrlFromQueue = updateStudioRepairGroupUrlFromQueue;


  // v137/v161: Repair Bay rows are clickable containers, so URL/edit controls must
  // never bubble into the row-level open-genre behavior. In capture phase, button
  // clicks must also run the apply action here; otherwise stopPropagation prevents
  // the inline onclick from ever reaching the target in some browsers.
  document.addEventListener("click", (event) => {
    const button = event.target?.closest?.("[data-studio-repair-update]");
    if (button) {
      event.preventDefault();
      event.stopPropagation();
      const form = button.closest?.("[data-studio-repair-form]");
      const encodedTargets = form?.getAttribute?.("data-studio-repair-targets") || "";
      const inputId = form?.getAttribute?.("data-studio-repair-input") || "";
      updateStudioRepairGroupUrlFromQueue(encodedTargets, inputId, button);
      return;
    }
    const edit = event.target?.closest?.(".studio-inline-track-edit, [data-studio-repair-form]");
    if (!edit) return;
    event.stopPropagation();
  }, true);
  document.addEventListener("pointerdown", (event) => {
    if (event.target?.closest?.(".studio-inline-track-edit, [data-studio-repair-form], [data-studio-repair-update]")) {
      event.stopPropagation();
    }
  }, true);
  document.addEventListener("submit", (event) => {
    if (event.target?.closest?.(".studio-inline-track-edit, [data-studio-repair-form]")) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  function boot() {
    wrapRenderReview();
    if (document.getElementById("screen-review")?.classList.contains("active"))
      apply();
    ["click", "pointerdown", "mousedown"].forEach((eventName) => {
      document.addEventListener(eventName, (ev) => {
        if (ev.target.closest?.(".studio-inline-track-edit")) {
          ev.stopPropagation();
        }
      }, true);
    });
    document.addEventListener("submit", (ev) => {
      if (ev.target?.matches?.(".studio-inline-track-edit")) {
        ev.stopPropagation();
      }
    }, true);

    document.addEventListener(
      "click",
      (ev) => {
        if (ev.target.closest?.(".studio-inline-track-edit")) {
          ev.stopPropagation();
          return;
        }
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
