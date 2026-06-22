/* Daily Genre - Song Listening Focus add-on
   Loaded after app.js. It upgrades the genre detail song area in Listen mode without changing song storage. */
(() => {
  const FOCUS_STORAGE_PREFIX = "dailyGenreSongFocusKey:";
  const DETAILS_STORAGE_PREFIX = "dailyGenreSongDetailsOpen:";
  const FILTER_STORAGE_PREFIX = "dailyGenreSongQueueFilter:";
  const QUEUE_OPEN_STORAGE_PREFIX = "dailyGenreSongQueueOpen:";

  function safeCall(fn, fallback = "") {
    try {
      return typeof fn === "function" ? fn() : fallback;
    } catch {
      return fallback;
    }
  }

  function html(value) {
    return typeof escapeHtml === "function"
      ? escapeHtml(value == null ? "" : String(value))
      : String(value == null ? "" : value);
  }

  function songListForFocus(genre) {
    const rawSongs = safeCall(
      () => inflateSongsFromStorage(genre?.songs_listened || []),
      genre?.songs_listened || [],
    );
    const out = [];
    (rawSongs || []).forEach((song, index) => {
      if (!song || song.isPending) return;
      out.push({
        song,
        path: `song:${index}`,
        label: song.isAdd ? "Add" : song.isPromote ? "Promote" : "Canon",
        isChild: false,
      });
      if (song.levelUp) {
        out.push({
          song: song.levelUp,
          path: `song:${index}.levelUp`,
          label: "Level Up",
          isChild: true,
          parentSong: song,
          parentKey: songKey(song),
        });
      }
    });
    return out;
  }

  function songKey(song) {
    return safeCall(
      () => songIdentity(song),
      normalizeSongUrl(song?.url || song?.spotifyUrl || "") ||
        `${song?.artist || ""}::${song?.title || ""}`,
    );
  }

  function encodedSongKey(song) {
    return safeCall(
      () => encodeSongKeyForInline(song),
      encodeURIComponent(songKey(song)),
    );
  }

  function spotifyHref(song) {
    return safeCall(
      () => normalizeSongUrl(song?.spotifyUrl || song?.url || ""),
      song?.spotifyUrl || song?.url || "",
    );
  }

  function songSubline(song) {
    const parts = [];
    const artist =
      song.artist ||
      (Array.isArray(song.artists) ? song.artists.join(", ") : "");
    if (artist) parts.push(artist);
    if (song.releaseYear) parts.push(String(song.releaseYear));
    if (song.album) parts.push(song.album);
    if (song.durationMs && typeof formatTrackDuration === "function")
      parts.push(formatTrackDuration(song.durationMs));
    return parts.join(" · ");
  }

  function songTypeBadge(entry) {
    if (entry.label === "Level Up")
      return '<span class="song-focus-badge level">Level Up</span>';
    if (entry.label === "Add")
      return '<span class="song-focus-badge add">Add</span>';
    if (entry.song?.score != null)
      return `<span class="song-focus-badge">Fit ${html(entry.song.score)}/5</span>`;
    return '<span class="song-focus-badge">Canon</span>';
  }

  function genreFocusStorageKey(genre) {
    return `${FOCUS_STORAGE_PREFIX}${genre?.id || genre?.genre || "unknown"}`;
  }

  function genreDetailsStorageKey(genre) {
    return `${DETAILS_STORAGE_PREFIX}${genre?.id || genre?.genre || "unknown"}`;
  }

  function genreFilterStorageKey(genre) {
    return `${FILTER_STORAGE_PREFIX}${genre?.id || genre?.genre || "unknown"}`;
  }

  function genreQueueOpenStorageKey(genre) {
    return `${QUEUE_OPEN_STORAGE_PREFIX}${genre?.id || genre?.genre || "unknown"}`;
  }

  function isSongQueueOpen(genre) {
    try {
      return localStorage.getItem(genreQueueOpenStorageKey(genre)) === "1";
    } catch {
      return false;
    }
  }

  function setSongQueueOpen(open) {
    try {
      if (typeof currentGenre !== "undefined" && currentGenre) {
        localStorage.setItem(
          genreQueueOpenStorageKey(currentGenre),
          open ? "1" : "0",
        );
      }
    } catch {}
    enhanceSongListeningExperience();
  }

  function getSongQueueFilter(genre) {
    try {
      return localStorage.getItem(genreFilterStorageKey(genre)) || "all";
    } catch {
      return "all";
    }
  }

  function setSongQueueFilter(filter) {
    const allowed = new Set([
      "all",
      "unrated",
      "favorites",
      "levelups",
      "adds",
      "fit5",
      "lowfit",
    ]);
    const next = allowed.has(filter) ? filter : "all";
    try {
      if (typeof currentGenre !== "undefined" && currentGenre) {
        localStorage.setItem(genreFilterStorageKey(currentGenre), next);
      }
    } catch {}
    enhanceSongListeningExperience();
  }

  function isFavoriteEntry(entry) {
    return safeCall(() => isSameFavoriteSong(currentGenre, entry.song), false);
  }

  function numericFit(song) {
    const n = Number(song?.score);
    return Number.isFinite(n) ? n : null;
  }

  function filterSongEntries(entries, filter) {
    const selected = filter || "all";
    if (selected === "unrated")
      return entries.filter((entry) => !entry.song?.reaction);
    if (selected === "favorites")
      return entries.filter((entry) => isFavoriteEntry(entry));
    if (selected === "levelups")
      return entries.filter(
        (entry) => entry.label === "Level Up" || entry.song?.isLevelUp,
      );
    if (selected === "adds")
      return entries.filter(
        (entry) => entry.label === "Add" || entry.song?.isAdd,
      );
    if (selected === "fit5")
      return entries.filter((entry) => numericFit(entry.song) === 5);
    if (selected === "lowfit")
      return entries.filter((entry) => {
        const fit = numericFit(entry.song);
        return fit != null && fit <= 3;
      });
    return entries;
  }

  function renderSongQueueFilters(entries, activeFilter) {
    const filterDefs = [
      ["all", "All", entries.length],
      [
        "unrated",
        "Unrated",
        entries.filter((entry) => !entry.song?.reaction).length,
      ],
      [
        "favorites",
        "Favorites",
        entries.filter((entry) => isFavoriteEntry(entry)).length,
      ],
      [
        "levelups",
        "Level Ups",
        entries.filter(
          (entry) => entry.label === "Level Up" || entry.song?.isLevelUp,
        ).length,
      ],
      [
        "adds",
        "Adds",
        entries.filter((entry) => entry.label === "Add" || entry.song?.isAdd)
          .length,
      ],
      [
        "fit5",
        "Fit 5",
        entries.filter((entry) => numericFit(entry.song) === 5).length,
      ],
      [
        "lowfit",
        "Fit ≤3",
        entries.filter((entry) => {
          const fit = numericFit(entry.song);
          return fit != null && fit <= 3;
        }).length,
      ],
    ];
    return `<div class="song-focus-filters" role="group" aria-label="Song queue filters">
      ${filterDefs.map(([key, label, count]) => `<button type="button" class="song-focus-filter ${activeFilter === key ? "active" : ""}" onclick="setSongQueueFilter('${key}')">${html(label)} <span>${count}</span></button>`).join("")}
    </div>`;
  }

  function getSelectedSongEntry(genre, entries) {
    if (!entries.length) return null;
    let stored = "";
    try {
      stored = localStorage.getItem(genreFocusStorageKey(genre)) || "";
    } catch {}
    const storedMatch = stored
      ? entries.find((entry) => songKey(entry.song) === stored)
      : null;
    if (storedMatch) return storedMatch;
    const unrated = entries.find((entry) => !entry.song?.reaction);
    return unrated || entries[0];
  }

  function setSelectedSongKey(key) {
    try {
      if (typeof currentGenre !== "undefined" && currentGenre) {
        localStorage.setItem(genreFocusStorageKey(currentGenre), key || "");
      }
    } catch {}
    enhanceSongListeningExperience();
  }

  function moveSongFocus(delta) {
    if (typeof currentGenre === "undefined" || !currentGenre) return;
    const entries = songListForFocus(currentGenre);
    if (!entries.length) return;
    const activeFilter = getSongQueueFilter(currentGenre);
    const visibleEntries = filterSongEntries(entries, activeFilter);
    const sequence = visibleEntries.length ? visibleEntries : entries;
    const currentKey = (() => {
      try {
        return localStorage.getItem(genreFocusStorageKey(currentGenre)) || "";
      } catch {
        return "";
      }
    })();
    const currentIndex = Math.max(
      0,
      sequence.findIndex((entry) => songKey(entry.song) === currentKey),
    );
    const nextIndex =
      (currentIndex + delta + sequence.length) % sequence.length;
    setSelectedSongKey(songKey(sequence[nextIndex].song));
  }

  function setSongDetailsOpen(open) {
    try {
      if (typeof currentGenre !== "undefined" && currentGenre) {
        localStorage.setItem(
          genreDetailsStorageKey(currentGenre),
          open ? "1" : "0",
        );
      }
    } catch {}
    enhanceSongListeningExperience();
  }

  function isSongDetailsOpen(genre) {
    try {
      return localStorage.getItem(genreDetailsStorageKey(genre)) === "1";
    } catch {
      return false;
    }
  }

  function renderReactionButtons(song, extraClass = "") {
    const encodedKey = encodedSongKey(song);
    const isFavorite = safeCall(
      () => isSameFavoriteSong(currentGenre, song),
      false,
    );
    const staged = safeCall(
      () =>
        stagedQueueReactionKeys.has(
          stagedReactionKey(currentGenre.id, songKey(song)),
        ),
      false,
    );
    return `<div class="song-focus-actions ${extraClass}">
      <button type="button" class="song-focus-reaction ${Number(song.reaction) === 3 ? "active" : ""}" onclick="event.stopPropagation(); setSongReaction('${encodedKey}', 3)" title="I Fuck With This" aria-label="I Fuck With This">👍</button>
      <button type="button" class="song-focus-reaction ${Number(song.reaction) === 2 ? "active" : ""}" onclick="event.stopPropagation(); setSongReaction('${encodedKey}', 2)" title="Meh, It’s Fine" aria-label="Meh, It’s Fine">🤷</button>
      <button type="button" class="song-focus-reaction ${Number(song.reaction) === 1 ? "active" : ""}" onclick="event.stopPropagation(); setSongReaction('${encodedKey}', 1)" title="Fuck Off" aria-label="Fuck Off">👎</button>
      <button type="button" class="song-focus-trophy ${isFavorite ? "active" : ""}" onclick="event.stopPropagation(); makeSongFavorite('${encodedKey}')" title="${isFavorite ? "Remove favorite song" : "Make favorite song"}" aria-label="${isFavorite ? "Remove favorite song" : "Make favorite song"}">🏆</button>
      ${staged ? '<span class="song-focus-unsaved">Unsaved</span>' : ""}
    </div>`;
  }

  function renderFocusedSong(
    entry,
    detailsOpen,
    entries = [],
    activeFilter = "all",
  ) {
    const song = entry.song;
    const href = spotifyHref(song);
    const hasHref = /^https?:\/\//i.test(href);
    const title = song.title || (hasHref ? "Linked track" : "Track");
    const art = song.artwork || song.albumArt || "";
    const artStyle = art
      ? ` style="--song-focus-art:url('${html(art).replace(/'/g, "%27")}')"`
      : "";
    const reason = song.reason || "";
    const subline = songSubline(song);
    const miniTitle = encodeURIComponent(title || "Spotify track");
    const miniArtist = encodeURIComponent(
      song.artist ||
        (Array.isArray(song.artists) ? song.artists.join(", ") : ""),
    );
    const miniArtwork = encodeURIComponent(art || "");
    const miniUrl = encodeURIComponent(href || "");
    const miniButton = hasHref
      ? `<button type="button" class="song-focus-mini-btn" onclick="event.preventDefault(); event.stopPropagation(); if (typeof stickyPlayerOpen === 'function') stickyPlayerOpen('${miniUrl}', '${miniTitle}', '${miniArtist}', '${miniArtwork}');" title="Open mini player" aria-label="Open Spotify mini player">▶</button>`
      : "";
    const readMore = "";
    const filterLabel =
      activeFilter && activeFilter !== "all" ? ` in current filter` : "";
    const relation =
      entry.isChild && entry.parentSong
        ? `<div class="song-focus-relation-hero">↳ Level up from ${html(entry.parentSong.title || "previous pick")}</div>`
        : "";
    const sequenceCount =
      filterSongEntries(entries, activeFilter).length || entries.length;
    return `<section class="song-focus-player"${artStyle}>
      ${sequenceCount > 1 ? `<button type="button" class="song-focus-nav song-focus-nav-prev" onclick="moveSongFocus(-1)" title="Previous song${filterLabel}" aria-label="Previous song${filterLabel}">‹</button><button type="button" class="song-focus-nav song-focus-nav-next" onclick="moveSongFocus(1)" title="Next song${filterLabel}" aria-label="Next song${filterLabel}">›</button>` : ""}
      <div class="song-focus-art-wrap">
        ${art ? `<img class="song-focus-art" src="${html(art)}" alt="${html(title)} artwork" loading="lazy">` : '<div class="song-focus-art song-focus-art-placeholder">♪</div>'}
      </div>
      <div class="song-focus-main">
        <div class="song-focus-kicker">Now Listening · ${songTypeBadge(entry)}</div>
        <h3 class="song-focus-title">${hasHref ? `<a href="${html(href)}" target="_blank" rel="noopener noreferrer">${html(title)} <span class="song-link-arrow">↗</span></a>` : html(title)}</h3>
        ${subline ? `<div class="song-focus-subline">${html(subline)}</div>` : ""}
        ${relation}
        ${reason ? `<p class="song-focus-reason">${html(reason)}</p>` : ""}
        <div class="song-focus-control-row">
          ${renderReactionButtons(song, "hero")}
          ${miniButton}
          <button type="button" class="song-focus-details-btn" onclick="setSongFocusDetailsOpen(${detailsOpen ? "false" : "true"})">${detailsOpen ? "Hide details" : "Details"}</button>
        </div>
      </div>
    </section>`;
  }

  function renderSongDetails(entry) {
    const song = entry.song;
    const encodedKey = encodedSongKey(song);
    const encodedPath = encodeURIComponent(entry.path || "").replace(
      /[!'()*]/g,
      (ch) => `%${ch.charCodeAt(0).toString(16).toUpperCase()}`,
    );
    const pendingSongNote = safeCall(
      () => pendingSongNoteFor(currentGenre, song, entry.path, -1),
      "",
    );
    const savedNote = song.listenerNote || song.songNote || "";
    const noteValue = pendingSongNote || savedNote || "";
    const trackUrl = safeCall(
      () => normalizeSongUrl(song.spotifyUrl || song.url || ""),
      song.spotifyUrl || song.url || "",
    );
    const canRefreshSpotify =
      /spotify\.com\/track\//i.test(trackUrl) ||
      /^spotify:track:/i.test(trackUrl);
    const meta = [];
    if (song.spotifyId) meta.push(`Spotify ID: ${song.spotifyId}`);
    if (song.isrc) meta.push(`ISRC: ${song.isrc}`);
    if (song.releaseDate) meta.push(`Release: ${song.releaseDate}`);
    if (song.releaseSource) meta.push(`Source: ${song.releaseSource}`);
    return `<section class="song-focus-details-drawer song-note-editor">
      <div class="song-focus-details-head">
        <div>
          <div class="eyebrow">Song details</div>
          <h3>${html(song.title || "Selected song")}</h3>
        </div>
        <button type="button" class="btn btn-secondary btn-tiny" onclick="setSongFocusDetailsOpen(false)">Close</button>
      </div>
      <div class="song-focus-details-grid">
        <div class="song-focus-detail-card song-focus-fit-card">
          <h4>Why this song fits</h4>
          <p>${song.reason ? html(song.reason) : "No fit note yet."}</p>
          <div class="song-focus-edit-helper">
            <button type="button" class="btn btn-secondary btn-tiny" onclick="if (typeof openStudioMode === 'function') openStudioMode(); else if (typeof toggleDetailEditMode === 'function') toggleDetailEditMode();">Edit in setup editor</button>
            <small>Fit reasons live in the Songs listened bulk text. Edit the line for this track, then save.</small>
          </div>
        </div>
        <div class="song-focus-detail-card song-focus-note-card">
          <h4>Listening note</h4>
          <textarea data-song-note-input maxlength="320" placeholder="Short listening note for this song…">${html(noteValue)}</textarea>
          <div class="song-note-actions">
            <button type="button" class="btn btn-primary" onclick="savePendingSongNoteFromCard('${encodedKey}', -1, '${encodedPath}', this)">Stage Note</button>
            ${pendingSongNote ? `<button type="button" class="btn btn-danger" onclick="clearPendingSongNoteFromCard('${encodedKey}', -1, '${encodedPath}', this)">Clear Pending Note</button>` : ""}
          </div>
          <div class="track-card-edit-note">Staged locally. Save Listening Updates will roll this up and persist it.</div>
        </div>
        <div class="song-focus-detail-card compact song-focus-url-card">
          <h4>Track URL <span class="song-focus-inline-label">no full edit mode needed</span></h4>
          <div class="song-focus-url-row">
            <input data-track-url-input type="url" value="${html(trackUrl)}" placeholder="Paste Spotify track URL">
            <button type="button" class="btn btn-primary" onclick="updateTrackUrlFromCard('${encodedKey}', -1, this, '${encodedPath}')">Update URL</button>
            ${canRefreshSpotify ? `<button type="button" class="btn btn-secondary" onclick="refreshGenrePageSpotifyTrack('${encodedKey}', this, '${encodedPath}')">Refresh Metadata</button>` : ""}
          </div>
          <p class="song-focus-helper">Paste a corrected Spotify track URL here without switching to Build / Edit mode. Use Refresh Metadata after updating when the new link is a Spotify track.</p>
        </div>
        <div class="song-focus-detail-card compact song-focus-meta-card">
          <h4>Metadata</h4>
          <p>${meta.length ? html(meta.join(" · ")) : "No extra metadata available."}</p>
        </div>
      </div>
    </section>`;
  }

  function renderSongQueue(
    entries,
    selectedKey,
    activeFilter = "all",
    queueOpen = false,
  ) {
    const visibleEntries = filterSongEntries(entries, activeFilter);
    const reactedCount = entries.filter((entry) => entry.song?.reaction).length;
    const favoriteCount = entries.filter((entry) =>
      isFavoriteEntry(entry),
    ).length;
    const unratedCount = entries.length - reactedCount;
    const selectedIndex = Math.max(
      0,
      entries.findIndex((entry) => songKey(entry.song) === selectedKey),
    );
    const selectedEntry = entries[selectedIndex] || entries[0];
    const nextEntries = [];
    for (let i = 1; i <= Math.min(6, Math.max(0, entries.length - 1)); i++) {
      nextEntries.push(entries[(selectedIndex + i) % entries.length]);
    }

    const collapsedPreview = `<div class="song-focus-queue-collapsed">
      <div>
        <div class="song-focus-queue-summary-title">${entries.length} songs · ${reactedCount} reacted · ${favoriteCount} favorite${favoriteCount === 1 ? "" : "s"} · ${unratedCount} unrated</div>
        ${selectedEntry ? `<div class="song-focus-queue-summary-sub">Current: ${html(selectedEntry.song?.title || "Selected song")}${selectedEntry.isChild && selectedEntry.parentSong ? ` · Level up from ${html(selectedEntry.parentSong.title || "previous pick")}` : ""}</div>` : ""}
      </div>
      <div class="song-focus-cover-strip" aria-label="Upcoming songs">
        ${nextEntries
          .map((entry) => {
            const art = entry.song?.artwork || entry.song?.albumArt || "";
            const title = entry.song?.title || "Track";
            return `<button type="button" class="song-focus-cover-peek ${entry.isChild ? "levelup" : ""}" onclick="setSongFocus('${html(songKey(entry.song)).replace(/'/g, "&#39;")}')" title="${html(title)}">
            ${art ? `<img src="${html(art)}" alt="" loading="lazy">` : "<span>♪</span>"}
          </button>`;
          })
          .join("")}
        ${entries.length > nextEntries.length + 1 ? `<span class="song-focus-cover-more">+${entries.length - nextEntries.length - 1}</span>` : ""}
      </div>
    </div>`;

    return `<section class="song-focus-queue-card ${queueOpen ? "expanded" : "collapsed"}">
      <div class="song-focus-section-head">
        <div>
          <div class="eyebrow">Song queue</div>
          <div class="small">${reactedCount}/${entries.length} reacted · ${favoriteCount} favorite${activeFilter !== "all" ? ` · ${visibleEntries.length} shown` : ""}</div>
        </div>
        <button type="button" class="song-focus-queue-toggle" onclick="setSongQueueOpen(${queueOpen ? "false" : "true"})">${queueOpen ? "Collapse queue" : "Show queue"}</button>
      </div>
      ${
        queueOpen
          ? `${renderSongQueueFilters(entries, activeFilter)}
      <div class="song-focus-queue">
        ${
          visibleEntries.length
            ? visibleEntries
                .map((entry) => {
                  const song = entry.song;
                  const key = songKey(song);
                  const selected = key === selectedKey;
                  const art = song.artwork || song.albumArt || "";
                  const title = song.title || "Track";
                  const subline = songSubline(song);
                  const href = spotifyHref(song);
                  const hasHref = /^https?:\/\//i.test(href);
                  const safeKeyAttr = html(key).replace(/'/g, "&#39;");
                  const titleMarkup = hasHref
                    ? `<a class="song-focus-row-title" href="${html(href)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">${html(title)} <span class="song-link-arrow">↗</span></a>`
                    : `<span class="song-focus-row-title">${html(title)}</span>`;
                  const childRelation =
                    entry.isChild && entry.parentSong
                      ? `<span class="song-focus-row-relation">↳ Level up from ${html(entry.parentSong.title || "previous pick")}</span>`
                      : "";
                  const childReason =
                    entry.isChild && song.reason
                      ? `<span class="song-focus-row-reason">${html(song.reason)}</span>`
                      : "";
                  const parentSelected =
                    !selected &&
                    entry.parentKey &&
                    entry.parentKey === selectedKey;
                  return `<div role="button" tabindex="0" class="song-focus-row ${selected ? "active" : ""} ${parentSelected ? "parent-active" : ""} ${entry.isChild ? "levelup-child" : ""} ${Number(song.reaction) ? "reacted" : ""}" onclick="setSongFocus('${safeKeyAttr}')" onkeydown="if(event.key === 'Enter' || event.key === ' '){ event.preventDefault(); setSongFocus('${safeKeyAttr}'); }">
            ${art ? `<img class="song-focus-row-art" src="${html(art)}" alt="${html(title)} artwork" loading="lazy">` : '<span class="song-focus-row-art placeholder">♪</span>'}
            <span class="song-focus-row-main">
              <span class="song-focus-row-title-line">${titleMarkup}${selected ? '<span class="song-focus-now-badge">Now Listening</span>' : ""}</span>
              ${subline ? `<span class="song-focus-row-sub">${html(subline)}</span>` : ""}
              ${childRelation}
              ${childReason}
            </span>
            <span class="song-focus-row-badge-wrap">${songTypeBadge(entry)}</span>
            ${renderReactionButtons(song, "queue")}
          </div>`;
                })
                .join("")
            : '<div class="song-focus-empty-filter">No songs match this filter.</div>'
        }
      </div>`
          : collapsedPreview
      }
    </section>`;
  }

  function enhanceSongListeningExperience() {
    if (typeof currentGenre === "undefined" || !currentGenre) return;
    const screen = document.getElementById("screen-listen");
    if (!screen || !screen.classList.contains("active")) return;
    const section = screen.querySelector(".detail-log-section");
    const activeList = section?.querySelector(".detail-song-list");
    if (!section || !activeList) return;

    const entries = songListForFocus(currentGenre);
    if (!entries.length) return;

    const activeFilter = getSongQueueFilter(currentGenre);
    const visibleEntries = filterSongEntries(entries, activeFilter);
    let selected = getSelectedSongEntry(currentGenre, entries);
    if (
      visibleEntries.length &&
      !visibleEntries.some(
        (entry) => songKey(entry.song) === songKey(selected.song),
      )
    ) {
      selected = visibleEntries[0];
    }
    const selectedKey = songKey(selected.song);
    try {
      localStorage.setItem(genreFocusStorageKey(currentGenre), selectedKey);
    } catch {}
    const detailsOpen = isSongDetailsOpen(currentGenre);
    const queueOpen = isSongQueueOpen(currentGenre);

    screen.classList.add("listen-experience-mode");
    section.classList.add("song-focus-section");
    const heading = Array.from(section.children).find((el) =>
      el.classList?.contains("eyebrow"),
    );
    if (heading) heading.textContent = "Song Listening";

    // The focused queue replaces the legacy logged-song list. Keep the legacy
    // DOM present for older edit/save helpers, but remove it visually so the
    // same songs are not shown twice under the queue.
    section.querySelectorAll(":scope > .detail-song-list").forEach((list) => {
      list.classList.add("song-original-list-hidden");
      list.setAttribute("aria-hidden", "true");
    });

    let mount = section.querySelector(".song-focus-experience");
    if (!mount) {
      mount = document.createElement("div");
      mount.className = "song-focus-experience";
      section.insertBefore(mount, activeList);
    }
    mount.innerHTML = `${renderFocusedSong(selected, detailsOpen, entries, activeFilter)}${detailsOpen ? renderSongDetails(selected) : ""}${renderSongQueue(entries, selectedKey, activeFilter, queueOpen)}`;
  }

  function installNoJumpReactionWrapper() {
    if (window.__dailyGenreNoJumpReactionV32) return;
    const original = window.setSongReaction;
    if (typeof original !== "function") return;
    window.__dailyGenreNoJumpReactionV32 = true;
    window.setSongReaction = function dcNoJumpSetSongReaction(...args) {
      const anchor =
        document.querySelector(".song-focus-player") ||
        document.querySelector(".song-focus-experience") ||
        document.getElementById("dc-songs");
      const beforeTop = anchor?.getBoundingClientRect?.().top;
      const beforeScroll = window.scrollY || window.pageYOffset || 0;
      try {
        document.activeElement?.blur?.();
      } catch {}
      const result = original.apply(this, args);
      const restore = () => {
        const nextAnchor =
          document.querySelector(".song-focus-player") ||
          document.querySelector(".song-focus-experience") ||
          document.getElementById("dc-songs");
        if (Number.isFinite(beforeTop) && nextAnchor?.getBoundingClientRect) {
          const nextTop = nextAnchor.getBoundingClientRect().top;
          window.scrollTo({
            top:
              (window.scrollY || window.pageYOffset || 0) + nextTop - beforeTop,
            left: window.scrollX || window.pageXOffset || 0,
            behavior: "auto",
          });
        } else {
          window.scrollTo({
            top: beforeScroll,
            left: window.scrollX || 0,
            behavior: "auto",
          });
        }
      };
      requestAnimationFrame(restore);
      setTimeout(restore, 40);
      setTimeout(restore, 140);
      return result;
    };
  }

  window.setSongFocus = setSelectedSongKey;
  window.setSongFocusDetailsOpen = setSongDetailsOpen;
  window.setSongQueueFilter = setSongQueueFilter;
  window.setSongQueueOpen = setSongQueueOpen;
  window.moveSongFocus = moveSongFocus;
  window.enhanceSongListeningExperience = enhanceSongListeningExperience;
  installNoJumpReactionWrapper();

  const originalLoadListenScreen =
    typeof loadListenScreen === "function" ? loadListenScreen : null;
  if (originalLoadListenScreen && !window.__dailyGenreSongFocusWrapped) {
    window.__dailyGenreSongFocusWrapped = true;
    loadListenScreen = function patchedLoadListenScreen(...args) {
      const result = originalLoadListenScreen.apply(this, args);
      setTimeout(enhanceSongListeningExperience, 0);
      return result;
    };
  }

  document.addEventListener("DOMContentLoaded", () =>
    setTimeout(enhanceSongListeningExperience, 0),
  );
})();
