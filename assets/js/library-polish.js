/* === Daily Genre Library Polish add-on ===
   Safe layer: does not replace app.js or change genre loading. */
(function () {
  const state = {
    observer: null,
    applying: false,
    installed: false,
    todayOnly: false,
    filtersOpen: false,
    suppressQuickReset: false,
  };

  function esc(value) {
    if (typeof window.escapeHtml === "function")
      return window.escapeHtml(value);
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getGenres() {
    return Array.isArray(window.genres) ? window.genres : [];
  }

  function genreById(id) {
    return getGenres().find((g) => String(g?.id) === String(id));
  }

  function localToday() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function genreDate(genre) {
    if (!genre) return "";
    if (typeof window.dateValue === "function")
      return window.dateValue(genre) || "";
    return String(
      genre.date_normalized ||
        genre.datenormalized ||
        genre.date ||
        genre.listened_date ||
        genre.listenedDate ||
        "",
    ).slice(0, 10);
  }

  function activeTodayGenreId() {
    try {
      const g = eval("currentGenre");
      if (g && g.id != null) return String(g.id);
    } catch (_) {}
    return "";
  }

  function todayVisibleIds() {
    const ids = new Set();
    const today = localToday();
    getGenres().forEach((g) => {
      if (genreDate(g) === today && g?.id != null) ids.add(String(g.id));
    });
    const activeId = activeTodayGenreId();
    if (activeId) ids.add(activeId);
    return ids;
  }

  function matchesTodayView(genre) {
    const ids = todayVisibleIds();
    // If there is no logged/selected genre for today yet, Today intentionally
    // behaves like All instead of showing an empty Library.
    if (!ids.size) return true;
    return ids.has(String(genre?.id ?? ""));
  }

  function albumDiveSlots(genre) {
    const dive = genre?.albumDive || genre?.album_dive || null;
    if (!dive) return [];
    if (Array.isArray(dive.slots)) return dive.slots.filter(Boolean);
    if (Array.isArray(dive.albums)) return dive.albums.filter(Boolean);
    return [];
  }

  function hasAlbumDive(genre) {
    const dive = genre?.albumDive || genre?.album_dive || null;
    if (!dive) return false;
    const slots = albumDiveSlots(genre);
    return Boolean(
      dive.enabled ||
      dive.summary ||
      dive.verdict ||
      slots.some((slot) =>
        Boolean(
          slot.album ||
          slot.artist ||
          slot.spotifyAlbumUrl ||
          slot.spotifyUrl ||
          slot.spotifyAlbumId ||
          slot.albumArt ||
          slot.manualAlbumArt ||
          slot.favoriteAlbum ||
          slot.favoriteSong?.title ||
          (Array.isArray(slot.tracks) && slot.tracks.length),
        ),
      ),
    );
  }

  function isFinishedAlbumDive(genre) {
    const dive = genre?.albumDive || genre?.album_dive || null;
    if (!dive) return false;
    const status = String(dive.status || "").toLowerCase();
    if (["finished", "completed", "complete", "done"].includes(status))
      return true;
    const slots = albumDiveSlots(genre).filter((slot) =>
      Boolean(
        slot.album ||
        slot.spotifyAlbumUrl ||
        slot.spotifyAlbumId ||
        slot.albumArt ||
        slot.manualAlbumArt,
      ),
    );
    return (
      slots.length > 0 &&
      slots.every((slot) =>
        ["finished", "completed", "complete", "done"].includes(
          String(slot.listenState || "").toLowerCase(),
        ),
      )
    );
  }

  function favoriteAlbumSlot(genre) {
    const slots = albumDiveSlots(genre);
    return (
      slots.find((slot) =>
        Boolean(
          slot.favoriteAlbum || slot.albumFavorite || slot.isFavoriteAlbum,
        ),
      ) || null
    );
  }

  function albumArt(slot) {
    return (
      slot?.albumArt ||
      slot?.manualAlbumArt ||
      slot?.favoriteSong?.albumArt ||
      ""
    );
  }

  function albumTitle(slot) {
    return (
      [slot?.artist, slot?.album].filter(Boolean).join(" — ") ||
      slot?.album ||
      ""
    );
  }

  function getSynonyms(genre) {
    const fields = [
      genre?.synonyms,
      genre?.aliases,
      genre?.aka,
      genre?.alsoKnownAs,
      genre?.alternateNames,
      genre?.alternate_names,
      genre?.altNames,
    ];
    const values = [];
    fields.forEach((field) => {
      if (Array.isArray(field)) values.push(...field);
      else if (typeof field === "string") values.push(...field.split(/[,;|]/g));
    });
    return [
      ...new Set(
        values.map((value) => String(value || "").trim()).filter(Boolean),
      ),
    ].slice(0, 8);
  }

  function albumFilterValue() {
    return document.getElementById("archiveAlbumDiveFilter")?.value || "";
  }

  function archiveSearchValue() {
    return document.getElementById("archiveSearchInput")?.value || "";
  }

  function hyphenVariant(value) {
    return String(value || "")
      .trim()
      .replace(/[‐‑‒–—―]/g, "-")
      .replace(/\s+-\s+|\s+-|-\s+/g, "-")
      .replace(/\s+/g, "-");
  }

  function scoreLibraryCard(card, rawQuery) {
    const q = String(rawQuery || "")
      .trim()
      .toLowerCase();
    if (!q) return 0;
    const normalizedQ = q
      .replace(/[‐‑‒–—―-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const title = (card.querySelector(".archive-card-title")?.textContent || "")
      .trim()
      .toLowerCase();
    const titleNorm = title
      .replace(/[‐‑‒–—―-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (title === q || titleNorm === normalizedQ) return 0;
    if (title.startsWith(q) || titleNorm.startsWith(normalizedQ)) return 1;
    if (title.includes(q) || titleNorm.includes(normalizedQ)) return 2;
    return 3;
  }

  function sortRenderedSearchResults() {
    const q = archiveSearchValue();
    if (!q.trim()) return;
    const list = document.getElementById("historyList");
    if (!list) return;
    const cards = [...list.querySelectorAll(".archive-card:not([hidden])")];
    if (cards.length < 2) return;
    cards
      .sort((a, b) => scoreLibraryCard(a, q) - scoreLibraryCard(b, q))
      .forEach((card) => list.appendChild(card));
  }

  function anyFilterActive() {
    return Boolean(
      albumFilterValue() ||
      document.getElementById("historyMonthFilter")?.value ||
      document.getElementById("historyRatingFilter")?.value ||
      document.getElementById("archiveFlagFilter")?.value ||
      state.todayOnly,
    );
  }

  function genreMatchesAlbumFilter(genre, filter) {
    if (!filter) return true;
    const hasDive = hasAlbumDive(genre);
    const hasFavAlbum = Boolean(favoriteAlbumSlot(genre));
    if (filter === "has-album-dive") return hasDive;
    if (filter === "missing-album-dive") return !hasDive;
    if (filter === "finished-album-dive") return isFinishedAlbumDive(genre);
    if (filter === "favorite-album") return hasFavAlbum;
    return true;
  }

  function ensureAlbumFilter() {
    const filters = document.querySelector(".archive-filters");
    const flag = document.getElementById("archiveFlagFilter");
    if (!filters || document.getElementById("archiveAlbumDiveFilter")) return;

    const select = document.createElement("select");
    select.id = "archiveAlbumDiveFilter";
    select.className = "archive-album-dive-filter";
    select.setAttribute("aria-label", "Album Dive filter");
    select.innerHTML = `
      <option value="">Any album dive</option>
      <option value="has-album-dive">Has Album Dive</option>
      <option value="missing-album-dive">Missing Album Dive</option>
      <option value="finished-album-dive">Finished Album Dive</option>
      <option value="favorite-album">Has favorite album</option>
    `;
    select.addEventListener("change", () => {
      state.filtersOpen = true;
      if (typeof window.renderHistory === "function") window.renderHistory();
      requestAnimationFrame(applyLibraryPolish);
    });

    if (flag?.parentElement === filters)
      flag.insertAdjacentElement("afterend", select);
    else filters.appendChild(select);
  }

  function ensureTodayButton() {
    const tabs = document.querySelector(".archive-view-tabs");
    if (!tabs || document.getElementById("archiveTodayViewBtn")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "archiveTodayViewBtn";
    btn.className = "archive-view-btn dc-today-view-btn";
    btn.textContent = "Today";
    btn.title =
      "Show today’s selected/logged genre; shows all if none exists yet";
    btn.addEventListener("click", () => {
      state.todayOnly = !state.todayOnly;
      if (state.todayOnly) {
        const allBtn = document.querySelector(
          '.archive-view-btn[data-archive-view="all"]',
        );
        if (allBtn && !allBtn.classList.contains("active")) {
          state.suppressQuickReset = true;
          allBtn.click();
          state.suppressQuickReset = false;
        }
        state.todayOnly = true;
        document
          .querySelectorAll(".archive-view-btn")
          .forEach((other) => other.classList.remove("active"));
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
        const allBtn = document.querySelector(
          '.archive-view-btn[data-archive-view="all"]',
        );
        allBtn?.click();
      }
      window.setTimeout(applyLibraryPolish, 25);
    });
    tabs.insertAdjacentElement("afterbegin", btn);
  }

  function pruneQuickViewButtons() {
    document
      .querySelectorAll(
        '.archive-view-btn[data-archive-view="contenders"], .archive-view-btn[data-archive-view="zangers"], .archive-view-btn[data-archive-view="alttakes"], .archive-view-btn[data-archive-view="pending"]',
      )
      .forEach((btn) => {
        btn.classList.add("dc-secondary-view-hidden");
        btn.hidden = true;
      });
  }

  function syncTodayQuickState() {
    const todayBtn = document.getElementById("archiveTodayViewBtn");
    if (!todayBtn) return;
    todayBtn.classList.toggle("active", state.todayOnly);
    if (state.todayOnly) {
      document
        .querySelectorAll(".archive-view-btn:not(.dc-today-view-btn)")
        .forEach((btn) => btn.classList.remove("active"));
    }
  }

  function ensureCompactActions() {
    const actions = document.querySelector(".archive-actions");
    if (!actions) return;
    const map = [
      ["archiveCopyBtn", "⧉", "Copy current Library view"],
      [
        "archivePlaylistToggleVisibleBtn",
        "☑",
        "Select visible genres for playlist",
      ],
      [
        "archivePlaylistSelectedBtn",
        "♫+",
        "Create playlist from selected genres",
      ],
    ];
    map.forEach(([id, icon, label]) => {
      const btn = document.getElementById(id);
      if (!btn || btn.dataset.dcIconified === "1") return;
      btn.dataset.dcOriginalText = btn.textContent.trim();
      btn.dataset.dcIcon = icon;
      btn.dataset.dcIconified = "1";
      btn.classList.add("dc-icon-action");
      btn.title = label;
      btn.setAttribute("aria-label", label);
      btn.innerHTML = `<span class="dc-icon-action-glyph" aria-hidden="true">${esc(icon)}</span><span class="dc-icon-action-text">${esc(btn.dataset.dcOriginalText)}</span>`;
    });
  }

  function ensureSortControl() {
    const tabs = document.querySelector(".archive-view-tabs");
    const sort = document.getElementById("archiveSortFilter");
    if (!tabs || !sort) return;
    let wrap = document.getElementById("dcArchiveSortWrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "dcArchiveSortWrap";
      wrap.className = "dc-archive-sort-wrap";
      wrap.innerHTML = '<span class="dc-sort-label">Sort</span>';
      tabs.appendChild(wrap);
    }
    if (sort.parentElement !== wrap) wrap.appendChild(sort);
    sort.classList.add("dc-archive-sort-select");
  }

  function ensureFilterTray() {
    const filters = document.querySelector(".archive-filters");
    const search = document.getElementById("archiveSearchInput");
    if (!filters || !search) return;
    filters.classList.add("dc-archive-filters-compact");
    ensureSortControl();

    let top = filters.querySelector(".dc-filter-topline");
    let tray = filters.querySelector(".dc-filter-tray");
    if (!top) {
      top = document.createElement("div");
      top.className = "dc-filter-topline";
      filters.insertBefore(top, filters.firstChild);
      top.appendChild(search);

      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "dc-filter-toggle";
      toggle.setAttribute("aria-expanded", "false");
      toggle.innerHTML =
        '<span aria-hidden="true">◭</span><span>Filters</span>';
      toggle.addEventListener("click", () => {
        state.filtersOpen = !state.filtersOpen;
        syncFilterTray();
      });
      top.appendChild(toggle);
    }

    if (!tray) {
      tray = document.createElement("div");
      tray.className = "dc-filter-tray";
      filters.appendChild(tray);
    }

    [
      "historyMonthFilter",
      "historyRatingFilter",
      "archiveFlagFilter",
      "archiveAlbumDiveFilter",
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.parentElement !== tray) tray.appendChild(el);
    });
    syncFilterTray();
  }

  function syncFilterTray() {
    const filters = document.querySelector(".archive-filters");
    if (!filters) return;
    const shouldOpen = state.filtersOpen || anyFilterActive();
    filters.classList.toggle("dc-filters-open", shouldOpen);
    filters.classList.toggle("dc-filters-active", anyFilterActive());
    const toggle = filters.querySelector(".dc-filter-toggle");
    if (toggle)
      toggle.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
  }

  function makeArtworkNode(src, genreName) {
    const img = document.createElement("img");
    img.className = "archive-artwork";
    img.src = src;
    img.alt = `${genreName || "Genre"} favorite album artwork`;
    img.loading = "lazy";
    return img;
  }

  function openCardFromTile(card, event) {
    if (
      event?.target?.closest(
        "button, a, input, select, textarea, label, summary, details",
      )
    )
      return;
    const btn = card.querySelector("[data-open-id]");
    if (btn) btn.click();
  }

  function extractRankNumber(text) {
    const match = String(text || "").match(/#?\s*(\d+)/);
    return match ? match[1] : "";
  }

  function convertRankTag(tag, rankText) {
    const rank = extractRankNumber(rankText);
    if (!rank) {
      tag.remove();
      return;
    }
    tag.classList.remove("archive-tier-rank");
    tag.classList.add("dc-inline-rank-tag");
    tag.title = `Overall rank #${rank}`;
    tag.setAttribute("aria-label", `Overall rank #${rank}`);
    tag.textContent = `#${rank}`;
  }

  function ensureAlbumDiveIcon(card, genre) {
    const row = card.querySelector(".status-row");
    if (
      !row ||
      !hasAlbumDive(genre) ||
      row.querySelector(".dc-album-dive-icon-tag")
    )
      return;
    const tag = document.createElement("span");
    tag.className = "tag dc-icon-tag dc-album-dive-icon-tag";
    tag.title = "Has Album Dive";
    tag.setAttribute("aria-label", "Has Album Dive");
    tag.textContent = "💿";
    const songTag = [...row.querySelectorAll(".tag")].find((el) =>
      /song/i.test(el.textContent || ""),
    );
    if (songTag) songTag.insertAdjacentElement("beforebegin", tag);
    else row.appendChild(tag);
  }

  function iconizeStatusTags(card) {
    card.querySelectorAll(".status-row .tag").forEach((tag) => {
      const text = (tag.textContent || "").trim();
      if (/^Tier rank/i.test(text) || /^Overall\s+#?/i.test(text)) {
        convertRankTag(tag, text);
        return;
      }
      if (/^Alt Take$/i.test(text) || /Pending/i.test(text)) {
        tag.remove();
        return;
      }
      if (/Monthly contender/i.test(text)) {
        tag.remove();
        return;
      }
      if (/No rank yet/i.test(text)) {
        tag.classList.add("dc-muted-status-tag");
        tag.textContent = "unranked";
      }
    });
  }

  function decorateCard(card) {
    const openButton = card.querySelector("[data-open-id]");
    const id = openButton?.dataset?.openId;
    const genre = genreById(id);
    if (!genre) return false;

    card.classList.add("dc-library-card");
    card.dataset.genreId = String(id);
    card.setAttribute("role", "button");
    card.tabIndex = 0;
    if (!card.dataset.dcCardClickBound) {
      card.dataset.dcCardClickBound = "1";
      card.addEventListener("click", (event) => openCardFromTile(card, event));
      card.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        openButton?.click();
      });
    }

    card.querySelector(".dc-overall-rank-corner")?.remove();
    iconizeStatusTags(card);
    ensureAlbumDiveIcon(card, genre);

    const favAlbum = favoriteAlbumSlot(genre);
    const favAlbumArt = albumArt(favAlbum);
    if (favAlbumArt) {
      const artNode = card.querySelector(".archive-artwork");
      if (artNode?.tagName === "IMG") artNode.src = favAlbumArt;
      else if (artNode)
        artNode.replaceWith(makeArtworkNode(favAlbumArt, genre.genre));
    }

    const body = card.querySelector(".archive-card-body");
    if (body) {
      card.querySelector(".dc-favorite-album-line")?.remove();
      if (favAlbum) {
        const line = document.createElement("div");
        line.className = "small dc-favorite-album-line";
        const url = favAlbum.spotifyAlbumUrl || favAlbum.spotifyUrl || "";
        const title = albumTitle(favAlbum) || "Favorite album";
        line.innerHTML = url
          ? `Favorite album: <a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(title)} ↗</a>`
          : `Favorite album: <strong>${esc(title)}</strong>`;
        const favSongLine = [...body.querySelectorAll(".small")].find((el) =>
          /Favorite song:/i.test(el.textContent || ""),
        );
        if (favSongLine) favSongLine.insertAdjacentElement("beforebegin", line);
        else body.appendChild(line);
      }

      card.querySelector(".dc-synonym-line")?.remove();
      const synonyms = getSynonyms(genre);
      if (synonyms.length) {
        const line = document.createElement("div");
        line.className = "small dc-synonym-line";
        line.textContent = `Also: ${synonyms.join(", ")}`;
        const meta = body.querySelector(".archive-card-meta");
        if (meta) meta.insertAdjacentElement("afterend", line);
        else body.appendChild(line);
      }
    }

    if (state.todayOnly && !matchesTodayView(genre)) return false;
    return genreMatchesAlbumFilter(genre, albumFilterValue());
  }

  function updateFilteredSummary(visibleCount, totalCount) {
    const filter = albumFilterValue();
    const summary = document.getElementById("archiveSummary");
    if (!summary) return;
    summary.querySelector(".dc-album-filter-summary")?.remove();
    if (!filter && !state.todayOnly) return;
    const notes = [];
    const todayIds = todayVisibleIds();
    if (state.todayOnly) {
      notes.push(
        todayIds.size
          ? "today"
          : "today has no selected/logged genre yet, showing all",
      );
    }
    if (filter) notes.push("album-dive filter");
    const note = document.createElement("div");
    note.className = "small dc-album-filter-summary";
    note.textContent = `${visibleCount} shown · ${notes.join(" + ")} · ${totalCount} in current Library view`;
    summary.appendChild(note);
  }

  function pauseObserver() {
    if (state.observer) state.observer.disconnect();
  }

  function resumeObserver() {
    if (!state.observer) return;
    const target = document.getElementById("historyList");
    if (target)
      state.observer.observe(target, { childList: true, subtree: false });
  }

  function applyLibraryPolish() {
    if (state.applying) return;
    state.applying = true;
    pauseObserver();
    try {
      ensureTodayButton();
      pruneQuickViewButtons();
      ensureAlbumFilter();
      ensureCompactActions();
      ensureSortControl();
      ensureFilterTray();
      syncTodayQuickState();
      syncFilterTray();
      const list = document.getElementById("historyList");
      if (!list) return;
      list.classList.add("dc-library-polished");
      const cards = [...list.querySelectorAll(".archive-card")];
      let visibleCount = 0;
      cards.forEach((card) => {
        const visible = decorateCard(card);
        card.hidden = !visible;
        if (visible) visibleCount += 1;
      });
      sortRenderedSearchResults();
      updateFilteredSummary(visibleCount, cards.length);
    } finally {
      state.applying = false;
      resumeObserver();
    }
  }

  function installObserver() {
    if (state.observer) return;
    const target = document.getElementById("historyList");
    if (!target) return;
    state.observer = new MutationObserver(() =>
      requestAnimationFrame(applyLibraryPolish),
    );
    state.observer.observe(target, { childList: true, subtree: false });
  }

  function install() {
    if (state.installed) return;
    state.installed = true;
    ensureTodayButton();
    pruneQuickViewButtons();
    ensureAlbumFilter();
    ensureCompactActions();
    ensureSortControl();
    ensureFilterTray();
    installObserver();

    [
      "archiveSearchInput",
      "historyMonthFilter",
      "historyRatingFilter",
      "archiveFlagFilter",
      "archiveAlbumDiveFilter",
      "archiveSortFilter",
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("change", () => {
        state.filtersOpen = anyFilterActive();
        requestAnimationFrame(applyLibraryPolish);
      });
      el.addEventListener("input", () =>
        window.setTimeout(applyLibraryPolish, 350),
      );
    });

    document
      .querySelectorAll(".archive-view-btn:not(.dc-today-view-btn)")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          if (!state.suppressQuickReset) state.todayOnly = false;
          window.setTimeout(applyLibraryPolish, 25);
        });
      });

    const original = window.renderHistory;
    if (typeof original === "function" && !original.__dcLibraryWrapped) {
      const wrapped = function (...args) {
        const searchEl = document.getElementById("archiveSearchInput");
        const rawSearch = searchEl?.value || "";
        let result = original.apply(this, args);
        const list = document.getElementById("historyList");
        const variant = hyphenVariant(rawSearch);
        if (
          rawSearch &&
          variant &&
          variant !== rawSearch.trim() &&
          list &&
          !list.querySelector(".archive-card")
        ) {
          searchEl.value = variant;
          result = original.apply(this, args);
          searchEl.value = rawSearch;
        }
        window.setTimeout(() => {
          ensureTodayButton();
          pruneQuickViewButtons();
          ensureAlbumFilter();
          ensureCompactActions();
          ensureSortControl();
          ensureFilterTray();
          installObserver();
          applyLibraryPolish();
        }, 0);
        return result;
      };
      wrapped.__dcLibraryWrapped = true;
      window.renderHistory = wrapped;
    }

    applyLibraryPolish();
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", install);
  else install();

  window.DailyGenreLibraryPolish = {
    apply: applyLibraryPolish,
    hasAlbumDive,
    isFinishedAlbumDive,
    favoriteAlbumSlot,
    today: function (value) {
      state.todayOnly = Boolean(value);
      applyLibraryPolish();
    },
  };
})();

/* === Library Polish v2.1 hardening addendum ==============================
   Re-applies the visible cleanup after the existing safe add-on runs. */
(function () {
  const ICONS = {
    archiveCopyBtn: ["⧉", "Copy current Library view"],
    archivePlaylistToggleVisibleBtn: [
      "☑",
      "Select visible genres for playlist",
    ],
    archivePlaylistSelectedBtn: ["♫+", "Create playlist from selected genres"],
  };

  function iconButton(id, glyph, label) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.classList.add("dc-icon-action", "dc-v21-icon-action");
    btn.title = label;
    btn.setAttribute("aria-label", label);
    btn.dataset.dcIconified = "v21";
    btn.textContent = glyph;
  }

  function forceHeaderIcons() {
    Object.entries(ICONS).forEach(([id, [glyph, label]]) =>
      iconButton(id, glyph, label),
    );
  }

  function rankNumber(text) {
    const m = String(text || "").match(/#?\s*(\d+)/);
    return m ? m[1] : "";
  }

  function hasAlbumDive(genre) {
    const dive = genre?.albumDive || genre?.album_dive || null;
    if (!dive) return false;
    if (dive.enabled || dive.summary || dive.verdict) return true;
    const slots = Array.isArray(dive.slots)
      ? dive.slots
      : Array.isArray(dive.albums)
        ? dive.albums
        : [];
    return slots.some(
      (slot) =>
        slot &&
        (slot.album ||
          slot.artist ||
          slot.spotifyAlbumUrl ||
          slot.spotifyUrl ||
          slot.albumArt ||
          slot.manualAlbumArt ||
          (Array.isArray(slot.tracks) && slot.tracks.length)),
    );
  }

  function genreForCard(card) {
    const id =
      card.querySelector("[data-open-id]")?.dataset?.openId ||
      card.dataset.genreId ||
      "";
    return Array.isArray(window.genres)
      ? window.genres.find((g) => String(g?.id) === String(id))
      : null;
  }

  function cleanStatusRow(card, genre) {
    const row = card.querySelector(".status-row");
    if (!row) return;

    let rank = "";
    [...row.querySelectorAll(".tag")].forEach((tag) => {
      const text = (tag.textContent || "").trim();
      if (/tier\s*rank|overall\s*#?/i.test(text)) {
        rank = rank || rankNumber(text);
        tag.remove();
        return;
      }
      if (/Alt\s*Take|Pending|Monthly\s*contender|contender/i.test(text)) {
        tag.classList.add("dc-curation-hidden");
        tag.remove();
        return;
      }
      if (/\d+\s+song/i.test(text)) tag.classList.add("dc-song-count-tag");
    });

    if (
      !rank &&
      genre?.rank_order &&
      String(genre.rating || "").toLowerCase() !== "zanger"
    )
      rank = String(genre.rank_order);
    row.querySelectorAll(".dc-inline-rank-tag").forEach((tag) => tag.remove());
    if (rank) {
      const chip = document.createElement("span");
      chip.className = "tag dc-inline-rank-tag";
      chip.title = `Overall #${rank}`;
      chip.setAttribute("aria-label", `Overall #${rank}`);
      chip.textContent = `#${rank}`;
      const firstTag = row.querySelector(".tag");
      if (firstTag?.nextSibling)
        firstTag.insertAdjacentElement("afterend", chip);
      else row.appendChild(chip);
    }

    row
      .querySelectorAll(".dc-album-dive-icon-tag")
      .forEach((tag) => tag.remove());
    if (hasAlbumDive(genre)) {
      const chip = document.createElement("span");
      chip.className = "tag dc-icon-tag dc-album-dive-icon-tag";
      chip.title = "Has Album Dive";
      chip.setAttribute("aria-label", "Has Album Dive");
      chip.textContent = "💿";
      const songTag = row.querySelector(".dc-song-count-tag");
      if (songTag) songTag.insertAdjacentElement("beforebegin", chip);
      else row.appendChild(chip);
    }
  }

  function cleanCard(card) {
    const genre = genreForCard(card);
    card.classList.add("dc-library-card");
    card
      .querySelectorAll(
        '.dc-overall-rank-corner, [class*="rank-corner"], [class*="overall-rank-corner"]',
      )
      .forEach((el) => el.remove());
    cleanStatusRow(card, genre);

    const right = card.querySelector(".archive-card-right");
    if (right) {
      right.querySelector(".archive-card-date")?.remove();
      right
        .querySelector(".archive-primary-action")
        ?.classList.add("dc-visually-removed");
      right
        .querySelector(".song-log-toggle")
        ?.classList.add("dc-visually-removed");
      const label = right.querySelector(".archive-select-genre");
      if (label) {
        label.childNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) node.textContent = "";
        });
        label.title = "Select for playlist";
        label.setAttribute("aria-label", "Select for playlist");
      }
    }
  }

  function forceQuickViews() {
    document
      .querySelectorAll(
        '.archive-view-btn[data-archive-view="contenders"], .archive-view-btn[data-archive-view="zangers"], .archive-view-btn[data-archive-view="alttakes"], .archive-view-btn[data-archive-view="pending"]',
      )
      .forEach((btn) => {
        btn.hidden = true;
        btn.classList.add("dc-secondary-view-hidden");
      });
  }

  function applyV21() {
    forceHeaderIcons();
    forceQuickViews();
    const list = document.getElementById("historyList");
    if (list) {
      list.classList.add("dc-library-polished");
      list.querySelectorAll(".archive-card").forEach(cleanCard);
    }
  }

  const previousApply = window.DailyGenreLibraryPolish?.apply;
  if (window.DailyGenreLibraryPolish) {
    window.DailyGenreLibraryPolish.apply = function applyLibraryPolishV21() {
      if (typeof previousApply === "function")
        previousApply.call(window.DailyGenreLibraryPolish);
      requestAnimationFrame(applyV21);
    };
  }

  const previousRenderHistory = window.renderHistory;
  if (
    typeof previousRenderHistory === "function" &&
    !previousRenderHistory.__dcV21Wrapped
  ) {
    window.renderHistory = function renderHistoryV21(...args) {
      const result = previousRenderHistory.apply(this, args);
      requestAnimationFrame(applyV21);
      return result;
    };
    window.renderHistory.__dcV21Wrapped = true;
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyV21();
    setTimeout(applyV21, 80);
    setTimeout(applyV21, 400);
  });
  window.addEventListener("load", () => setTimeout(applyV21, 80));
  window.DailyGenreLibraryPolishV21 = { apply: applyV21 };
})();

/* === Library Polish v2.2: copy toast + stronger archive card cleanup ========== */
(function () {
  function toast(message, isError) {
    if (typeof window.showSaveToast === "function") {
      window.showSaveToast(message, Boolean(isError));
      return;
    }
    let el = document.getElementById("saveToast");
    if (!el) {
      el = document.createElement("div");
      el.id = "saveToast";
      el.className = "save-toast";
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.style.borderColor = isError ? "var(--danger)" : "var(--border)";
    el.style.color = isError ? "var(--danger)" : "var(--accent)";
    el.classList.add("show");
    clearTimeout(window.__saveToastTimer);
    window.__saveToastTimer = setTimeout(
      () => el.classList.remove("show"),
      2200,
    );
  }

  function forceHeaderButtons() {
    const defs = [
      ["archiveCopyBtn", "⧉", "Copy current Library view"],
      [
        "archivePlaylistToggleVisibleBtn",
        "☑",
        "Select visible genres for playlist",
      ],
      [
        "archivePlaylistSelectedBtn",
        "♪+",
        "Create playlist from selected genres",
      ],
    ];
    defs.forEach(([id, glyph, label]) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.classList.add("dc-icon-action", "dc-v22-icon-action");
      btn.title = label;
      btn.setAttribute("aria-label", label);
      btn.innerHTML = `<span class="dc-icon-action-glyph" aria-hidden="true">${glyph}</span>`;
      if (id === "archiveCopyBtn" && btn.dataset.dcV22CopyToast !== "1") {
        btn.dataset.dcV22CopyToast = "1";
        btn.addEventListener("click", () =>
          setTimeout(() => toast("Library view copied"), 80),
        );
      }
    });
  }

  function extractRank(text) {
    const m = String(text || "").match(/#?\s*(\d+)/);
    return m ? m[1] : "";
  }

  function genreForCard(card) {
    const id =
      card.querySelector("[data-open-id]")?.dataset?.openId ||
      card.dataset.genreId ||
      "";
    return Array.isArray(window.genres)
      ? window.genres.find((g) => String(g?.id) === String(id))
      : null;
  }

  function hasAlbumDive(genre) {
    const dive = genre?.albumDive || genre?.album_dive || null;
    if (!dive) return false;
    if (dive.enabled || dive.summary || dive.verdict) return true;
    const slots = Array.isArray(dive.slots)
      ? dive.slots
      : Array.isArray(dive.albums)
        ? dive.albums
        : [];
    return slots.some(
      (slot) =>
        slot &&
        (slot.album ||
          slot.artist ||
          slot.spotifyAlbumUrl ||
          slot.spotifyUrl ||
          slot.albumArt ||
          slot.manualAlbumArt ||
          (Array.isArray(slot.tracks) && slot.tracks.length)),
    );
  }

  function cleanArchiveCard(card) {
    const genre = genreForCard(card);
    card.classList.add("dc-library-card", "dc-v22-card");
    card
      .querySelectorAll(
        '.dc-overall-rank-corner, [class*="rank-corner"], [class*="overall-rank-corner"]',
      )
      .forEach((el) => el.remove());

    const right = card.querySelector(".archive-card-right");
    const selectLabel = card.querySelector(".archive-select-genre");
    if (selectLabel) {
      selectLabel.classList.add("dc-v22-playlist-check");
      selectLabel.title = "Select for playlist";
      selectLabel.setAttribute("aria-label", "Select for playlist");
      selectLabel.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) node.textContent = "";
      });
    }
    if (right && selectLabel && selectLabel.parentElement !== card) {
      card.appendChild(selectLabel);
    }

    const row = card.querySelector(".status-row");
    if (!row) return;
    let rank = "";
    [...row.querySelectorAll(".tag, .dc-inline-rank-tag")].forEach((tag) => {
      const text = (tag.textContent || "").trim();
      if (/tier\s*rank|overall\s*#?|^#\d+/i.test(text)) {
        rank = rank || extractRank(text);
        tag.remove();
        return;
      }
      if (/Alt\s*Take|Pending|Monthly\s*contender|contender/i.test(text)) {
        tag.remove();
        return;
      }
      if (/\d+\s+song/i.test(text)) tag.classList.add("dc-song-count-tag");
    });
    if (
      !rank &&
      genre?.rank_order &&
      String(genre.rating || "").toLowerCase() !== "zanger"
    )
      rank = String(genre.rank_order);
    if (rank) {
      const chip = document.createElement("span");
      chip.className = "tag dc-inline-rank-tag dc-rank-chip-v22";
      chip.title = `Overall #${rank}`;
      chip.setAttribute("aria-label", `Overall #${rank}`);
      chip.textContent = `#${rank}`;
      const starTag = row.querySelector(
        ".tag:not(.dc-song-count-tag):not(.dc-album-dive-icon-tag)",
      );
      const songTag = row.querySelector(".dc-song-count-tag");
      if (starTag) starTag.insertAdjacentElement("afterend", chip);
      else if (songTag) songTag.insertAdjacentElement("beforebegin", chip);
      else row.appendChild(chip);
    }

    row
      .querySelectorAll(".dc-album-dive-icon-tag")
      .forEach((tag) => tag.remove());
    if (hasAlbumDive(genre)) {
      const chip = document.createElement("span");
      chip.className = "tag dc-icon-tag dc-album-dive-icon-tag";
      chip.title = "Has Album Dive";
      chip.setAttribute("aria-label", "Has Album Dive");
      chip.textContent = "💿";
      const songTag = row.querySelector(".dc-song-count-tag");
      if (songTag) songTag.insertAdjacentElement("beforebegin", chip);
      else row.appendChild(chip);
    }
  }

  function applyV22() {
    forceHeaderButtons();
    document
      .querySelectorAll("#historyList .archive-card")
      .forEach(cleanArchiveCard);
  }

  const previousV21 = window.DailyGenreLibraryPolishV21?.apply;
  if (window.DailyGenreLibraryPolishV21) {
    window.DailyGenreLibraryPolishV21.apply = function () {
      if (typeof previousV21 === "function") previousV21();
      requestAnimationFrame(applyV22);
    };
  }
  const previous = window.DailyGenreLibraryPolish?.apply;
  if (window.DailyGenreLibraryPolish) {
    window.DailyGenreLibraryPolish.apply = function () {
      if (typeof previous === "function")
        previous.call(window.DailyGenreLibraryPolish);
      requestAnimationFrame(applyV22);
    };
  }

  const originalRenderHistory = window.renderHistory;
  if (
    typeof originalRenderHistory === "function" &&
    !originalRenderHistory.__dcV22Wrapped
  ) {
    window.renderHistory = function renderHistoryV22(...args) {
      const result = originalRenderHistory.apply(this, args);
      requestAnimationFrame(applyV22);
      setTimeout(applyV22, 100);
      return result;
    };
    window.renderHistory.__dcV22Wrapped = true;
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyV22();
    setTimeout(applyV22, 150);
    setTimeout(applyV22, 600);
  });
  window.addEventListener("load", () => setTimeout(applyV22, 150));
  window.DailyGenreLibraryPolishV22 = { apply: applyV22 };
})();

/* === Library Polish v2.3: search priority/name-only + carousel restore hardening === */
(function () {
  const state = { nameOnly: false, applying: false };

  function norm(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[‐‑‒–—―_-]+/g, " ")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function queryTokens(value) {
    return norm(value).split(/\s+/).filter(Boolean);
  }

  function cardTitle(card) {
    return card.querySelector(".archive-card-title")?.textContent || "";
  }

  function cardMatchesTitle(card, rawQuery) {
    const q = norm(rawQuery);
    if (!q) return true;
    const title = norm(cardTitle(card));
    if (!title) return false;
    if (title.includes(q)) return true;
    const toks = queryTokens(rawQuery);
    return toks.every((tok) => title.includes(tok));
  }

  function titleScore(card, rawQuery) {
    const q = norm(rawQuery);
    if (!q) return 0;
    const title = norm(cardTitle(card));
    if (!title) return 999;
    if (title === q) return 0;
    if (title.startsWith(q + " ") || title.startsWith(q)) return 1;
    const tokens = queryTokens(rawQuery);
    if (tokens.length && tokens.every((tok, i) => title.split(" ")[i] === tok))
      return 2;
    if (title.includes(q)) return 3;
    if (tokens.length && tokens.every((tok) => title.includes(tok))) return 4;
    return 20;
  }

  function ensureNameSearchToggle() {
    const top = document.querySelector(".archive-filters .dc-filter-topline");
    const search = document.getElementById("archiveSearchInput");
    if (!top || !search || document.getElementById("archiveNameOnlyToggle"))
      return;
    const btn = document.createElement("button");
    btn.id = "archiveNameOnlyToggle";
    btn.type = "button";
    btn.className = "dc-name-only-toggle";
    btn.setAttribute("aria-pressed", "false");
    btn.title = "Only show genre-name matches";
    btn.innerHTML = '<span aria-hidden="true">Aa</span><span>Name</span>';
    btn.addEventListener("click", () => {
      state.nameOnly = !state.nameOnly;
      btn.classList.toggle("active", state.nameOnly);
      btn.setAttribute("aria-pressed", state.nameOnly ? "true" : "false");
      applyV23();
    });
    search.insertAdjacentElement("afterend", btn);
  }

  function prioritizeAndLimitSearch() {
    const search = document.getElementById("archiveSearchInput");
    const list = document.getElementById("historyList");
    if (!search || !list) return;
    const raw = search.value || "";
    const cards = [...list.querySelectorAll(".archive-card")];
    if (!raw.trim()) {
      cards.forEach((card) => {
        if (card.dataset.dcHiddenByNameOnly === "1") {
          card.hidden = false;
          delete card.dataset.dcHiddenByNameOnly;
        }
      });
      return;
    }

    cards.forEach((card) => {
      const nameMatch = cardMatchesTitle(card, raw);
      card.dataset.dcNameMatch = nameMatch ? "1" : "0";
      if (state.nameOnly && !nameMatch) {
        card.hidden = true;
        card.dataset.dcHiddenByNameOnly = "1";
      } else if (card.dataset.dcHiddenByNameOnly === "1") {
        card.hidden = false;
        delete card.dataset.dcHiddenByNameOnly;
      }
    });

    cards
      .sort((a, b) => titleScore(a, raw) - titleScore(b, raw))
      .forEach((card) => list.appendChild(card));
  }

  function removeAlbumExplosionStyles() {
    // Defensive: older v2.2 CSS tried to rescue the carousel by changing layout.
    // v2.3 restores the actual focused carousel CSS, so this class lets CSS override the bad block.
    document.body.classList.add("dc-v23-carousel-restored");
  }

  function applyV23() {
    if (state.applying) return;
    state.applying = true;
    try {
      ensureNameSearchToggle();
      prioritizeAndLimitSearch();
      removeAlbumExplosionStyles();
    } finally {
      state.applying = false;
    }
  }

  const previous =
    window.DailyGenreLibraryPolishV22?.apply ||
    window.DailyGenreLibraryPolishV21?.apply ||
    window.DailyGenreLibraryPolish?.apply;
  if (window.DailyGenreLibraryPolish) {
    const old = window.DailyGenreLibraryPolish.apply;
    window.DailyGenreLibraryPolish.apply = function () {
      if (typeof old === "function") old.call(window.DailyGenreLibraryPolish);
      requestAnimationFrame(applyV23);
    };
  }

  const originalRenderHistory = window.renderHistory;
  if (
    typeof originalRenderHistory === "function" &&
    !originalRenderHistory.__dcV23Wrapped
  ) {
    window.renderHistory = function renderHistoryV23(...args) {
      const search = document.getElementById("archiveSearchInput");
      const raw = search?.value || "";
      let result = originalRenderHistory.apply(this, args);
      const list = document.getElementById("historyList");
      const hyphen = raw.trim().replace(/\s+/g, "-");
      const spaced = raw.trim().replace(/[‐‑‒–—―_-]+/g, " ");
      if (raw && list && !list.querySelector(".archive-card") && search) {
        if (hyphen && hyphen !== raw) {
          search.value = hyphen;
          result = originalRenderHistory.apply(this, args);
        }
        if (!list.querySelector(".archive-card") && spaced && spaced !== raw) {
          search.value = spaced;
          result = originalRenderHistory.apply(this, args);
        }
        search.value = raw;
      }
      requestAnimationFrame(applyV23);
      setTimeout(applyV23, 120);
      return result;
    };
    window.renderHistory.__dcV23Wrapped = true;
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyV23();
    setTimeout(applyV23, 100);
    setTimeout(applyV23, 500);
  });
  window.addEventListener("load", () => setTimeout(applyV23, 120));

  window.DailyGenreLibraryPolishV23 = {
    apply: applyV23,
    nameOnly(value) {
      state.nameOnly = Boolean(value);
      const btn = document.getElementById("archiveNameOnlyToggle");
      if (btn) {
        btn.classList.toggle("active", state.nameOnly);
        btn.setAttribute("aria-pressed", state.nameOnly ? "true" : "false");
      }
      applyV23();
    },
  };
})();

/* === Library Polish v2.4: final action icons, Today behavior + render smoothness === */
(function () {
  const ICON_SVGS = {
    archiveCopyBtn:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H8V7h11v14Z"/></svg>',
    archivePlaylistToggleVisibleBtn:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm0 16H5V5h14v14ZM10.6 15.2 7.4 12l-1.4 1.4 4.6 4.6 7-8-1.5-1.3-5.5 6.5Z"/></svg>',
    archivePlaylistSelectedBtn:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 3v10.6A3.5 3.5 0 1 1 10 10.4V5h8v4h-6V3Zm7 10v3h3v2h-3v3h-2v-3h-3v-2h3v-3h2Z"/></svg>',
  };
  const LABELS = {
    archiveCopyBtn: "Copy current Library view",
    archivePlaylistToggleVisibleBtn: "Select visible genres for playlist",
    archivePlaylistSelectedBtn: "Create playlist from selected genres",
  };
  let pending = false;

  function normalizeUtilityButtons() {
    Object.entries(ICON_SVGS).forEach(([id, svg]) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.classList.add("dg-final-icon-btn");
      btn.title = LABELS[id] || btn.title || "";
      btn.setAttribute(
        "aria-label",
        LABELS[id] || btn.textContent.trim() || id,
      );
      if (btn.dataset.dgFinalIcon !== "1") {
        btn.dataset.dgFinalIcon = "1";
      }
      btn.innerHTML = `<span class="dg-final-icon" aria-hidden="true">${svg}</span><span class="dg-final-icon-label">${LABELS[id] || ""}</span>`;
    });
  }

  function tuneLibraryMedia() {
    document
      .querySelectorAll("#historyList img.archive-artwork, #historyList img")
      .forEach((img) => {
        img.loading = "lazy";
        img.decoding = "async";
        img.referrerPolicy = "no-referrer";
      });
    document
      .getElementById("historyList")
      ?.classList.add("dg-library-lazy-art");
  }

  function apply() {
    pending = false;
    normalizeUtilityButtons();
    tuneLibraryMedia();
    document.body.classList.remove("dg-library-switching");
  }

  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(apply);
  }

  const originalRenderHistory = window.renderHistory;
  if (
    typeof originalRenderHistory === "function" &&
    !originalRenderHistory.__dgFinalLibraryWrapped
  ) {
    window.renderHistory = function renderHistoryFinalLibrary(...args) {
      document.body.classList.add("dg-library-switching");
      const result = originalRenderHistory.apply(this, args);
      schedule();
      setTimeout(schedule, 90);
      return result;
    };
    window.renderHistory.__dgFinalLibraryWrapped = true;
  }

  document.addEventListener(
    "click",
    (event) => {
      if (
        event.target.closest(
          "#archiveTodayViewBtn, .archive-view-btn, #historyMonthFilter, #historyRatingFilter, #archiveFlagFilter",
        )
      ) {
        document.body.classList.add("dg-library-switching");
        setTimeout(schedule, 40);
      }
    },
    true,
  );

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", schedule);
  else schedule();
  window.addEventListener("load", () => setTimeout(schedule, 120));
  window.DailyGenreLibraryPolishFinal = { apply: schedule };
})();

/* === Critical UX Hotfix v3: final Library DOM guard =====================
   Keep this tiny: it does not re-render Library. It only labels the utility
   buttons, applies lazy media hints, and re-runs after Library DOM updates. */
(function () {
  const LABELS = {
    archiveCopyBtn: "Copy current Library view",
    archivePlaylistToggleVisibleBtn: "Select visible genres for playlist",
    archivePlaylistSelectedBtn: "Create playlist from selected genres",
  };
  let scheduled = false;
  let observerStarted = false;

  function markUtilityButtons() {
    Object.entries(LABELS).forEach(([id, label]) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.classList.add("dg-ux-v3-icon-button");
      btn.setAttribute("aria-label", label);
      btn.title = label;
      btn.dataset.dgUxIcon = id;
    });
  }

  function tuneLibraryImages() {
    const list = document.getElementById("historyList");
    if (list) list.classList.add("dg-library-lazy-art");
    document.querySelectorAll("#historyList img").forEach((img) => {
      img.loading = "lazy";
      img.decoding = "async";
      img.fetchPriority = "low";
      img.referrerPolicy = "no-referrer";
    });
  }

  function apply() {
    scheduled = false;
    markUtilityButtons();
    tuneLibraryImages();
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(apply);
  }

  function startObserver() {
    if (observerStarted) return;
    const historyScreen = document.getElementById("screen-history");
    if (!historyScreen || typeof MutationObserver !== "function") return;
    observerStarted = true;
    const observer = new MutationObserver(schedule);
    observer.observe(historyScreen, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      schedule();
      startObserver();
    });
  } else {
    schedule();
    startObserver();
  }
  window.addEventListener("load", () => setTimeout(schedule, 80));
  document.addEventListener(
    "click",
    (event) => {
      if (
        event.target.closest(
          "#archiveCopyBtn, #archivePlaylistToggleVisibleBtn, #archivePlaylistSelectedBtn, #screen-history .archive-view-btn",
        )
      ) {
        setTimeout(schedule, 30);
      }
    },
    true,
  );
  window.DailyGenreLibraryUxHotfixV3 = { apply: schedule };
})();

/* === Library Polish v6: verified real SVG utility buttons ================
   Critical: this draws actual inline SVG children and then protects those
   children from the older icon-only rules that hid button contents. */
(function () {
  "use strict";
  const ICONS = {
    archiveCopyBtn: {
      label: "Copy current Library view",
      svg: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H8V7h11v14Z"/></svg>',
    },
    archivePlaylistToggleVisibleBtn: {
      label: "Select visible genres for playlist",
      svg: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm0 16H5V5h14v14ZM10.6 15.2 7.4 12 6 13.4l4.6 4.6 7-8-1.5-1.3-5.5 6.5Z"/></svg>',
    },
    archivePlaylistSelectedBtn: {
      label: "Create playlist from selected genres",
      svg: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3v10.6A3.5 3.5 0 1 1 10 10.4V5h8v4h-6V3Zm7 10v3h3v2h-3v3h-2v-3h-3v-2h3v-3h2Z"/></svg>',
    },
  };

  let scheduled = false;
  let observer = null;

  function selectedCountText() {
    const raw =
      document.getElementById("archivePlaylistSelectedBtn")?.textContent || "";
    const match = raw.match(/\((\d+)\)/);
    return match
      ? `${ICONS.archivePlaylistSelectedBtn.label} (${match[1]} selected)`
      : ICONS.archivePlaylistSelectedBtn.label;
  }

  function hydrateIconButton(id, meta) {
    const btn = document.getElementById(id);
    if (!btn) return;
    const label =
      id === "archivePlaylistSelectedBtn" ? selectedCountText() : meta.label;
    btn.classList.add("dg-v6-icon-btn");
    btn.dataset.dgV6Icon = id;
    btn.setAttribute("aria-label", label);
    btn.title = label;
    const currentIcon = btn.querySelector(":scope > .dg-v6-icon-inner");
    if (!currentIcon || currentIcon.dataset.iconId !== id) {
      btn.innerHTML = `<span class="dg-v6-icon-inner" data-icon-id="${id}" aria-hidden="true">${meta.svg}</span><span class="dg-v6-icon-label">${label}</span>`;
    } else {
      const labelEl = btn.querySelector(":scope > .dg-v6-icon-label");
      if (labelEl) labelEl.textContent = label;
    }
  }

  function apply() {
    scheduled = false;
    Object.entries(ICONS).forEach(([id, meta]) => hydrateIconButton(id, meta));
    document
      .getElementById("historyList")
      ?.classList.add("dg-library-lazy-art");
    document.querySelectorAll("#historyList img").forEach((img) => {
      img.loading = "lazy";
      img.decoding = "async";
      img.fetchPriority = "low";
      img.referrerPolicy = "no-referrer";
    });
  }

  function schedule(delay = 0) {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => requestAnimationFrame(apply), delay);
  }

  function observeActions() {
    const actions = document.querySelector("#screen-history .archive-actions");
    if (!actions || observer) return;
    observer = new MutationObserver(() => schedule(0));
    observer.observe(actions, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  const originalRenderHistory = window.renderHistory;
  if (
    typeof originalRenderHistory === "function" &&
    !originalRenderHistory.__dgV6LibraryIconWrapped
  ) {
    window.renderHistory = function dgV6RenderHistoryWithIcons(...args) {
      const out = originalRenderHistory.apply(this, args);
      schedule(0);
      schedule(90);
      return out;
    };
    window.renderHistory.__dgV6LibraryIconWrapped = true;
  }

  ["DOMContentLoaded", "load"].forEach((name) => {
    window.addEventListener(name, () => {
      observeActions();
      schedule(0);
      schedule(120);
    });
  });
  if (document.readyState !== "loading") {
    observeActions();
    schedule(0);
    schedule(120);
  }
  document.addEventListener(
    "click",
    (event) => {
      if (
        event.target.closest(
          "#archiveCopyBtn, #archivePlaylistToggleVisibleBtn, #archivePlaylistSelectedBtn, #screen-history .archive-view-btn",
        )
      ) {
        schedule(0);
        schedule(80);
        schedule(2100);
      }
    },
    true,
  );

  window.DailyGenreLibraryIconV6 = {
    apply: () => {
      observeActions();
      schedule(0);
    },
  };
})();
