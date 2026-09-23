/* Daily Genre: Archive "Songs" view — song / artist search across the library.
   Searches every place a track can live on a genre: logged songs (including
   Alt Takes), the pending inbox, the auto-generated suggested_songs list, and
   the Genre Identity seminal track / media touchstones. Results render as song
   rows (not genre cards) so you can see exactly which track matched and how it
   got there. The pure index/search functions are exported for node tests. */

(function dailyGenreArchiveSongSearchModule(globalScope) {
  "use strict";

  const RESULT_LIMIT = 200;
  const MIN_QUERY_LENGTH = 2;

  // Lower number = shown first when a track appears in several places.
  const SOURCE_INFO = {
    canon: { label: "Discord rec", rank: 0 },
    routed: { label: "Routed rec", rank: 1 },
    add: { label: "Added", rank: 2 },
    alt: { label: "Alt Take", rank: 3 },
    logged: { label: "Logged", rank: 4 },
    pending: { label: "Pending", rank: 5 },
    seminal: { label: "Seminal", rank: 6 },
    media: { label: "Media", rank: 7 },
    suggested: { label: "Suggested", rank: 8 },
  };

  function text(value) {
    return value == null ? "" : String(value);
  }

  function normalizeSearchText(value) {
    return text(value)
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/['’`]/g, "")
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function genreDate(genre) {
    return text(genre?.date_normalized || genre?.datenormalized).slice(0, 10);
  }

  function sourceForLoggedSong(song) {
    if (song?.isPending) return "pending";
    const role = text(song?.role).trim().toUpperCase();
    if (song?.isLevelUp || role === "LEVEL UP") return "alt";
    if (role === "CANON") return "canon";
    if (role === "ROUTED") return "routed";
    if (role === "SEMINAL") return "seminal";
    if (role === "MEDIA") return "media";
    if (role === "ADD" || song?.isAdd) return "add";
    return "logged";
  }

  // suggested_songs is a free-text "Artist — Title, Artist — Title" string.
  // Split on the dash separators first; every middle segment is then
  // "<title>, <next artist>". Titles with commas ("Take Me Home, Country
  // Roads") are far more common in the data than artists with commas, so the
  // split happens at the segment's last comma.
  function parseSuggestedSongs(value) {
    const raw = text(value).trim();
    if (!raw) return [];
    const separator = /\s+(?:—|–|--)\s*/.test(raw)
      ? /\s+(?:—|–|--)\s*/
      : /\s+-\s+/;
    const segments = raw.split(separator).map((part) => part.trim());
    if (segments.length < 2) return [];

    const pairs = [];
    let artist = segments[0];
    for (let i = 1; i < segments.length; i += 1) {
      const segment = segments[i];
      const isLast = i === segments.length - 1;
      const cut = isLast ? -1 : segment.lastIndexOf(",");
      const title = (cut >= 0 ? segment.slice(0, cut) : segment).trim();
      if (artist && title) pairs.push({ artist, title });
      if (isLast) break;
      artist = cut >= 0 ? segment.slice(cut + 1).trim() : "";
    }
    return pairs;
  }

  function songArtistText(song) {
    const artists = Array.isArray(song?.artists) ? song.artists : [];
    return text(song?.artist) || artists.filter(Boolean).join(", ");
  }

  function songUrl(song) {
    const raw = text(song?.spotifyUrl || song?.url).trim();
    const match = raw.match(/https?:\/\/\S+/);
    return match ? match[0] : "";
  }

  function recommenders(song) {
    const value = song?.recommendedBy;
    if (Array.isArray(value)) return value.map(text).filter(Boolean);
    return text(value) ? [text(value)] : [];
  }

  function buildSongSearchIndex(genres) {
    const rows = [];
    (Array.isArray(genres) ? genres : []).forEach((genre) => {
      if (!genre || typeof genre !== "object") return;
      const byKey = new Map();

      function add(song, source) {
        const title = text(song?.title).trim();
        const artist = songArtistText(song).trim();
        if (!title && !artist) return;
        const key = `${normalizeSearchText(artist)}|${normalizeSearchText(title)}`;
        let row = byKey.get(key);
        if (!row) {
          row = {
            genre,
            genreId: genre.id,
            genreName: text(genre.genre),
            genreDate: genreDate(genre),
            genreRating: text(genre.rating),
            title,
            artist,
            album: text(song?.album),
            url: "",
            score: null,
            recommendedBy: [],
            sources: [],
            search: {
              title: normalizeSearchText(title),
              artist: normalizeSearchText(artist),
              all: normalizeSearchText(
                [title, artist, ...(song?.artists || []), song?.album].join(" "),
              ),
            },
          };
          byKey.set(key, row);
          rows.push(row);
        }
        if (!row.sources.includes(source)) row.sources.push(source);
        if (!row.url) row.url = songUrl(song);
        if (!row.album && song?.album) row.album = text(song.album);
        const score = Number(song?.score);
        if (song?.score != null && song.score !== "" && Number.isFinite(score)) {
          row.score = row.score == null ? score : Math.max(row.score, score);
        }
        recommenders(song).forEach((name) => {
          if (!row.recommendedBy.includes(name)) row.recommendedBy.push(name);
        });
      }

      (genre.songs_listened || []).forEach((song) => {
        add(song, sourceForLoggedSong(song));
        if (song?.levelUp) add(song.levelUp, "alt");
      });
      (genre.pending_songs || []).forEach((song) => add(song, "pending"));

      const identity = genre.identity || {};
      if (identity.seminalTrack) add(identity.seminalTrack, "seminal");
      (identity.mediaTouchstones || []).forEach((song) => add(song, "media"));

      parseSuggestedSongs(genre.suggested_songs).forEach((song) =>
        add(song, "suggested"),
      );

      byKey.forEach((row) => {
        row.sources.sort(
          (a, b) => SOURCE_INFO[a].rank - SOURCE_INFO[b].rank,
        );
      });
    });
    return rows;
  }

  function matchRank(row, query, tokens) {
    const { title, artist, all } = row.search;
    if (!tokens.every((token) => all.includes(token))) return -1;
    if (title === query || artist === query) return 0;
    if (`${artist} ${title}` === query || `${title} ${artist}` === query) return 0;
    if (title.startsWith(query) || artist.startsWith(query)) return 1;
    if (title.includes(query) || artist.includes(query)) return 2;
    return 3;
  }

  function searchSongs(rows, rawQuery, options = {}) {
    const query = normalizeSearchText(rawQuery);
    const limit = options.limit || RESULT_LIMIT;
    const month = text(options.month);
    const rating = text(options.rating);
    if (query.length < MIN_QUERY_LENGTH) return { query, total: 0, results: [] };
    const tokens = query.split(" ").filter(Boolean);

    const matches = [];
    (rows || []).forEach((row) => {
      if (month && !row.genreDate.startsWith(month)) return;
      if (rating && row.genreRating !== rating) return;
      const rank = matchRank(row, query, tokens);
      if (rank >= 0) matches.push({ row, rank });
    });

    matches.sort(
      (a, b) =>
        a.rank - b.rank ||
        SOURCE_INFO[a.row.sources[0]].rank - SOURCE_INFO[b.row.sources[0]].rank ||
        b.row.genreDate.localeCompare(a.row.genreDate) ||
        a.row.title.localeCompare(b.row.title),
    );

    return {
      query,
      total: matches.length,
      results: matches.slice(0, limit).map((match) => match.row),
    };
  }

  function sourceLabel(source) {
    return SOURCE_INFO[source]?.label || source;
  }

  const api = {
    MIN_QUERY_LENGTH,
    RESULT_LIMIT,
    buildSongSearchIndex,
    normalizeSearchText,
    parseSuggestedSongs,
    searchSongs,
    sourceLabel,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (!globalScope || typeof globalScope.document === "undefined") return;

  // ---------------------------------------------------------------- browser

  function escapeHtml(value) {
    return text(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Rebuilt when the Songs view is (re)entered, the library array changes,
  // or "Refresh results" is clicked; typing reuses it.
  const cache = { rows: null, source: null, length: -1 };

  function indexedRows(list) {
    const source = Array.isArray(globalScope.genres) ? globalScope.genres : [];
    if (
      !cache.rows ||
      cache.source !== source ||
      cache.length !== source.length ||
      list.dataset.archiveMode !== "songs"
    ) {
      cache.rows = buildSongSearchIndex(source);
      cache.source = source;
      cache.length = source.length;
    }
    return cache.rows;
  }

  globalScope.document.addEventListener("click", (event) => {
    if (event.target.closest?.("#archiveRefreshBtn")) cache.rows = null;
  }, true);

  function renderResultRow(row) {
    const badges = row.sources
      .map(
        (source) =>
          `<span class="song-search-badge song-search-badge--${source}">${escapeHtml(sourceLabel(source))}</span>`,
      )
      .join("");
    const recs = row.recommendedBy.length
      ? `<span class="song-search-recs">rec'd by ${escapeHtml(row.recommendedBy.join(", "))}</span>`
      : "";
    const score =
      row.score != null
        ? `<span class="song-search-score" title="Song score">${escapeHtml(row.score)}★</span>`
        : "";
    const titleHtml = row.url
      ? `<a href="${escapeHtml(row.url)}" target="_blank" rel="noopener">${escapeHtml(row.title || "(untitled)")}</a>`
      : escapeHtml(row.title || "(untitled)");
    const date = row.genreDate
      ? `<span class="song-search-date">${escapeHtml(row.genreDate)}</span>`
      : `<span class="song-search-date">unlistened</span>`;
    return `
      <li class="song-search-row">
        <div class="song-search-main">
          <div class="song-search-title">${titleHtml}${score}</div>
          <div class="song-search-artist">${escapeHtml(row.artist)}${row.album ? ` · <span class="song-search-album">${escapeHtml(row.album)}</span>` : ""}</div>
        </div>
        <div class="song-search-meta">
          <button type="button" class="song-search-genre" data-song-search-genre="${escapeHtml(row.genreId)}">${escapeHtml(row.genreName)}</button>
          ${date}
          <div class="song-search-badges">${badges}${recs}</div>
        </div>
      </li>`;
  }

  function render(list, filters = {}) {
    const rows = indexedRows(list);
    const { query, total, results } = searchSongs(rows, filters.query, {
      month: filters.month,
      rating: filters.rating,
    });

    list.dataset.archiveMode = "songs";
    if (!list.dataset.songSearchBound) {
      list.dataset.songSearchBound = "true";
      list.addEventListener("click", (event) => {
        const btn = event.target.closest?.("[data-song-search-genre]");
        if (!btn || list.dataset.archiveMode !== "songs") return;
        event.preventDefault();
        event.stopPropagation();
        const id = btn.dataset.songSearchGenre;
        const genre = (globalScope.genres || []).find(
          (g) => String(g?.id) === id,
        );
        if (genre && typeof globalScope.openGenreDetail === "function") {
          globalScope.openGenreDetail(genre, false);
        }
      });
    }

    let summary;
    if (query.length < MIN_QUERY_LENGTH) {
      summary = `Song search · ${rows.length.toLocaleString()} tracks indexed`;
      list.innerHTML = `<div class="small song-search-hint">Type a song title or artist in the search box above (press Enter to search short queries). Covers logged songs, Alt Takes, pending, suggested, and seminal/media tracks.</div>`;
    } else if (!total) {
      summary = "Song search · no matches";
      list.innerHTML = `<div class="small">No songs or artists match “${escapeHtml(filters.query)}”.</div>`;
    } else {
      const shown = results.length < total ? ` (showing first ${results.length})` : "";
      summary = `Song search · ${total.toLocaleString()} match${total === 1 ? "" : "es"}${shown}`;
      list.innerHTML = `<ol class="song-search-results">${results.map(renderResultRow).join("")}</ol>`;
    }

    const summaryEl = globalScope.document.getElementById("archiveSummary");
    if (summaryEl) {
      const extra = [
        filters.month ? `month ${filters.month}` : "",
        filters.rating ? `genre rating ${filters.rating}` : "",
      ].filter(Boolean);
      summaryEl.innerHTML = `<div class="small">${escapeHtml(summary)}${extra.length ? ` · filtered by ${escapeHtml(extra.join(", "))}` : ""}</div>`;
    }

    const seen = new Set();
    return results
      .map((row) => row.genre)
      .filter((genre) => (seen.has(genre) ? false : (seen.add(genre), true)));
  }

  globalScope.DailyGenreArchiveSongSearch = Object.assign({}, api, { render });
})(typeof globalThis !== "undefined" ? globalThis : this);
