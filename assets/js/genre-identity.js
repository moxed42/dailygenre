/* Daily Genre Identity v1
   Adds genre aliases, seminal track, and media touchstones as genre-level curation fields.
   Add-on only: no app.js, genre loader, carousel, or save pipeline changes.
*/
(function () {
  "use strict";

  const VERSION = "genre-identity-v46-identity-source-url-sync";
  let lastListenGenre = null;
  let selectedGenreId = "";
  let lastStudioRandomCleanupId = "";
  let applying = false;
  const identityArtworkTried = new Set();
  let identityArtworkHydrationQueued = false;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

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

  function toast(msg, err = false) {
    if (typeof window.showSaveToast === "function")
      window.showSaveToast(msg, !!err);
  }

  function genres() {
    return Array.isArray(window.genres) ? window.genres : [];
  }

  function norm(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[‐‑‒–—―_/-]+/g, " ")
      .replace(/[^a-z0-9\s]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function linkUrl(value) {
    const url = String(value || "").trim();
    return /^https?:\/\//i.test(url) ? url : "";
  }

  function trackArtwork(track) {
    return linkUrl(
      track?.artwork ||
        track?.albumArt ||
        track?.album_art ||
        track?.image ||
        track?.imageUrl ||
        track?.cover ||
        track?.coverUrl ||
        "",
    );
  }

  function trackSpotifyUrl(track) {
    return linkUrl(track?.spotifyUrl || track?.url || track?.spotify_url || "");
  }

  function aliasList(genre) {
    const vals = [];
    [
      genre?.aliases,
      genre?.synonyms,
      genre?.aka,
      genre?.alternateNames,
      genre?.alternate_names,
    ].forEach((field) => {
      if (Array.isArray(field)) vals.push(...field);
      else if (typeof field === "string") vals.push(...field.split(/[,;|\n]/g));
    });
    return [
      ...new Set(vals.map((x) => String(x || "").trim()).filter(Boolean)),
    ];
  }

  function setAliases(genre, aliases) {
    const clean = [
      ...new Set(
        (aliases || []).map((x) => String(x || "").trim()).filter(Boolean),
      ),
    ];
    genre.aliases = clean;
    // Keep the existing Library add-on happy; it already knows about synonyms/aliases.
    genre.synonyms = clean;
  }

  function identity(genre) {
    if (!genre.identity || typeof genre.identity !== "object")
      genre.identity = {};
    if (
      !genre.identity.seminalTrack ||
      typeof genre.identity.seminalTrack !== "object"
    ) {
      genre.identity.seminalTrack = {};
    }
    if (!Array.isArray(genre.identity.mediaTouchstones))
      genre.identity.mediaTouchstones = [];

    if (genre.seminal_song && typeof genre.seminal_song === "object") {
      genre.identity.seminalTrack = {
        ...genre.seminal_song,
        ...genre.identity.seminalTrack,
      };
    }
    if (
      Array.isArray(genre.media_touchstones) &&
      !genre.identity.mediaTouchstones.length
    ) {
      genre.identity.mediaTouchstones = genre.media_touchstones.slice();
    }
    return genre.identity;
  }

  function getSeminal(genre) {
    const id = identity(genre);
    const flat =
      genre?.seminal_song && typeof genre.seminal_song === "object"
        ? genre.seminal_song
        : {};
    return { ...flat, ...(id.seminalTrack || {}) };
  }

  function getMedia(genre) {
    const id = identity(genre);
    const flat = Array.isArray(genre?.media_touchstones)
      ? genre.media_touchstones
      : [];
    const list = id.mediaTouchstones?.length ? id.mediaTouchstones : flat;
    return (Array.isArray(list) ? list : []).filter(
      (x) => x && typeof x === "object",
    );
  }

  function searchText(genre) {
    const sem = getSeminal(genre);
    const media = getMedia(genre);
    return norm(
      [
        genre?.genre,
        genre?.category_path,
        genre?.subcategory,
        genre?.subsubcategory,
        ...aliasList(genre),
        sem.title,
        sem.artist,
        ...media.flatMap((m) => [
          m.title,
          m.artist,
          m.mediaTitle,
          m.media,
          m.mediaType,
        ]),
      ]
        .filter(Boolean)
        .join(" "),
    );
  }

  function markDirty() {
    try {
      eval("libraryUpdatesPending = true");
    } catch (_) {}
    try {
      if (typeof toggleLibrarySaveButton === "function")
        toggleLibrarySaveButton(true);
    } catch (_) {}
    try {
      if (typeof setUnsavedState === "function") setUnsavedState(true);
    } catch (_) {}
    document.body.classList.add("genre-identity-dirty");
  }

  function findGenre(id) {
    return genres().find((g) => String(g.id) === String(id));
  }

  function currentGenre() {
    const root = $("#listenDetails");
    const title =
      root
        ?.querySelector(
          ".detail-record-card h2, .detail-hero h2, .dc-genre-hero h2, .dc-hero-title",
        )
        ?.textContent?.trim() || "";
    if (
      lastListenGenre &&
      (!title || String(lastListenGenre.genre || "").trim() === title)
    )
      return lastListenGenre;
    try {
      // Some builds expose currentGenre globally; split builds usually do not.
      const g = eval("currentGenre");
      if (g && typeof g === "object") return g;
    } catch (_) {}
    return genres().find((g) => String(g.genre || "").trim() === title) || null;
  }

  function bestGenreMatch(query) {
    const q = norm(query);
    if (!q) return null;
    const rows = genres().map((g) => ({
      g,
      name: norm(g.genre || ""),
      aliases: aliasList(g).map(norm),
      search: searchText(g),
    }));
    return (
      rows.find((r) => r.name === q)?.g ||
      rows.find((r) => r.aliases.includes(q))?.g ||
      rows.find((r) => r.name.startsWith(q))?.g ||
      rows.find((r) => r.aliases.some((a) => a.startsWith(q)))?.g ||
      rows.find((r) => r.search.includes(q))?.g ||
      null
    );
  }

  function genreOptionsHtml() {
    return genres()
      .slice()
      .sort((a, b) =>
        String(a.genre || "").localeCompare(String(b.genre || "")),
      )
      .map((g) => {
        const also = aliasList(g).slice(0, 3).join(", ");
        const label = also ? `${g.genre} · aka ${also}` : g.genre;
        return `<option value="${esc(label)}" data-id="${esc(String(g.id ?? ""))}"></option>`;
      })
      .join("");
  }

  function trackLink(track, fallbackLabel = "Track") {
    const title = String(track?.title || track?.name || "").trim();
    const artist = String(track?.artist || "").trim();
    const label =
      [artist, title].filter(Boolean).join(" — ") || title || fallbackLabel;
    const url = linkUrl(track?.spotifyUrl || track?.url || track?.spotify_url);
    return url
      ? `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)} ↗</a>`
      : esc(label);
  }

  function genreNameLabel(genre) {
    return String(genre?.genre || "genre").trim();
  }

  function identityStatus(genre) {
    const aliases = aliasList(genre);
    const sem = getSeminal(genre);
    const media = getMedia(genre);
    const hasSem = !!(sem?.title || sem?.artist || sem?.spotifyUrl || sem?.url);
    const pieces = [];
    if (aliases.length)
      pieces.push(`${aliases.length} alias${aliases.length === 1 ? "" : "es"}`);
    if (hasSem) pieces.push("seminal track");
    if (media.length)
      pieces.push(
        `${media.length} media touchstone${media.length === 1 ? "" : "s"}`,
      );
    return pieces.join(" · ") || "No identity anchors yet";
  }

  function identityTrackId(track) {
    const url = norm(trackSpotifyUrl(track));
    if (url) return `url:${url}`;
    return `name:${norm([track?.artist, track?.title || track?.name].filter(Boolean).join("::"))}`;
  }

  function identityLooseText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\b(the|a|an|el|la|los|las|le|les|un|una|feat|ft)\b/g, " ")
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function identityQueueTextKey(track) {
    const artist = track?.artist || (Array.isArray(track?.artists) ? track.artists.join(" ") : "");
    const title = track?.title || track?.name || "";
    return `${identityLooseText(artist)}|${identityLooseText(title)}`;
  }

  function identityTextLooksClose(a, b) {
    const titleA = identityLooseText(a?.title || a?.name || "");
    const titleB = identityLooseText(b?.title || b?.name || "");
    const artistA = identityLooseText(a?.artist || (Array.isArray(a?.artists) ? a.artists.join(" ") : ""));
    const artistB = identityLooseText(b?.artist || (Array.isArray(b?.artists) ? b.artists.join(" ") : ""));
    if (!titleA || !titleB) return false;
    const titleClose = titleA === titleB || titleA.includes(titleB) || titleB.includes(titleA);
    const artistClose = !artistA || !artistB || artistA === artistB || artistA.includes(artistB) || artistB.includes(artistA);
    return titleClose && artistClose;
  }

  function spotifyIdFromTrackLike(track) {
    const explicit = String(track?.spotifyId || "").trim();
    if (explicit) return explicit.toLowerCase();
    const url = trackSpotifyUrl(track);
    const match = String(url || "").match(/spotify\.com\/track\/([a-z0-9]+)/i) || String(url || "").match(/^spotify:track:([a-z0-9]+)/i);
    return match ? match[1].toLowerCase() : "";
  }

  function identityEntries(genre) {
    if (!genre) return [];
    const out = [];
    const sem = getSeminal(genre);
    if (sem?.title || sem?.artist || sem?.spotifyUrl || sem?.url) {
      out.push({ track: sem, type: "seminal", index: -1, label: "Seminal track" });
    }
    getMedia(genre).forEach((track, index) => {
      if (track?.title || track?.artist || track?.spotifyUrl || track?.url || track?.spotify_url) {
        out.push({ track, type: "popular", index, label: "Popular track" });
      }
    });
    return out;
  }

  function queueSongs(genre) {
    if (!genre) return [];
    if (!Array.isArray(genre.songs_listened)) genre.songs_listened = [];
    try {
      return typeof window.inflateSongsFromStorage === "function"
        ? window.inflateSongsFromStorage(genre.songs_listened || [])
        : genre.songs_listened;
    } catch (_) {
      return genre.songs_listened || [];
    }
  }

  function findQueuedIdentitySong(genre, entry, songs = queueSongs(genre)) {
    const target = identityTrackId(entry.track);
    const targetSpotifyId = spotifyIdFromTrackLike(entry.track);
    return (songs || []).find((song) => {
      if (!song || song.isPending) return false;
      if (song.isIdentityTrack && String(song.identityType || "") === entry.type && Number(song.identityIndex ?? -1) === Number(entry.index ?? -1)) return true;
      if (identityTrackId(song) === target) return true;
      const songSpotifyId = spotifyIdFromTrackLike(song);
      if (targetSpotifyId && songSpotifyId && targetSpotifyId === songSpotifyId) return true;
      return identityTextLooksClose(song, entry.track);
    }) || null;
  }

  function identityValueEqual(a, b) {
    if (Array.isArray(a) || Array.isArray(b) || (a && typeof a === "object") || (b && typeof b === "object")) {
      try { return JSON.stringify(a ?? null) === JSON.stringify(b ?? null); } catch (_) {}
    }
    return a === b;
  }

  function identitySongPayload(genre, entry, prior = {}) {
    const track = entry.track || {};
    const url = trackSpotifyUrl(track);
    const artist = String(track.artist || (Array.isArray(track.artists) ? track.artists.join(", ") : "")).trim();
    const title = String(track.title || track.name || "").trim();
    const reason = String(track.reason || prior.reason || "").trim();
    const payload = {
      ...prior,
      url: url || prior.url || prior.spotifyUrl || "",
      spotifyUrl: url || prior.spotifyUrl || prior.url || "",
      title: title || prior.title || entry.label,
      artist: artist || prior.artist || "",
      artwork: trackArtwork(track) || prior.artwork || prior.albumArt || "",
      album: track.album || prior.album || "",
      artists: Array.isArray(track.artists) && track.artists.length ? track.artists : (artist ? [artist] : prior.artists || []),
      spotifyId: track.spotifyId || prior.spotifyId || "",
      durationMs: track.durationMs ?? prior.durationMs ?? null,
      isrc: track.isrc || prior.isrc || "",
      releaseDate: track.releaseDate || prior.releaseDate || "",
      releaseYear: track.releaseYear ?? prior.releaseYear ?? null,
      releasePrecision: track.releasePrecision || prior.releasePrecision || "",
      releaseSource: track.releaseSource || prior.releaseSource || "",
      reason,
      source: "genre_identity",
      isIdentityTrack: true,
      identityType: entry.type,
      identityIndex: entry.index,
      identityLabel: entry.label,
      score: (prior.score != null && prior.score !== "") ? prior.score : ((track.score != null && track.score !== "") ? track.score : 5),
    };
    if (track.reaction != null && payload.reaction == null) payload.reaction = track.reaction;
    if (prior.reaction != null && track.reaction == null) track.reaction = prior.reaction;
    return payload;
  }

  function syncIdentityTracksToSongQueue(genre, mark = false) {
    if (!genre) return false;
    const entries = identityEntries(genre).filter((entry) => entry.track && (identityTrackId(entry.track) !== "name:"));
    if (!entries.length) return false;
    const songs = queueSongs(genre);
    let changed = false;
    const prepend = [];
    entries.forEach((entry) => {
      const existing = findQueuedIdentitySong(genre, entry, songs);
      if (existing) {
        const merged = identitySongPayload(genre, entry, existing);
        Object.keys(merged).forEach((key) => {
          if (!identityValueEqual(existing[key], merged[key])) {
            existing[key] = merged[key];
            changed = true;
          }
        });
      } else {
        prepend.push(identitySongPayload(genre, entry));
        changed = true;
      }
    });
    if (prepend.length) genre.songs_listened = [...prepend, ...songs];
    else genre.songs_listened = songs;
    if (changed && mark) markDirty();
    return changed;
  }

  function findIdentityEntryForQueueSong(genre, song) {
    const entries = identityEntries(genre);
    if (!song) return null;
    if (song.isIdentityTrack) {
      const flagged = entries.find((entry) => String(entry.type) === String(song.identityType || "") && Number(entry.index ?? -1) === Number(song.identityIndex ?? -1));
      if (flagged) return flagged;
    }
    const songId = identityTrackId(song);
    const songSpotifyId = spotifyIdFromTrackLike(song);
    return entries.find((entry) => {
      if (identityTrackId(entry.track) === songId) return true;
      const entrySpotifyId = spotifyIdFromTrackLike(entry.track);
      if (songSpotifyId && entrySpotifyId && songSpotifyId === entrySpotifyId) return true;
      return identityTextLooksClose(song, entry.track);
    }) || null;
  }

  function updateTrackFromQueueOverwrite(genre, beforeSong, updatedSong) {
    if (!genre || !updatedSong) return false;
    ensureIdentity(genre);
    const entry = findIdentityEntryForQueueSong(genre, beforeSong) || findIdentityEntryForQueueSong(genre, updatedSong);
    if (!entry || !entry.track) return false;
    const track = entry.track;
    const keepReason = track.reason || beforeSong?.reason || updatedSong.reason || "";
    const keepMediaTitle = track.mediaTitle || track.media || "";
    const keepMediaType = track.mediaType || "";
    Object.assign(track, {
      title: updatedSong.title || track.title || track.name || "",
      name: updatedSong.title || track.name || track.title || "",
      artist: updatedSong.artist || (Array.isArray(updatedSong.artists) ? updatedSong.artists.join(", ") : track.artist || ""),
      spotifyUrl: updatedSong.spotifyUrl || updatedSong.url || track.spotifyUrl || track.url || "",
      url: updatedSong.spotifyUrl || updatedSong.url || track.url || track.spotifyUrl || "",
      artwork: updatedSong.artwork || updatedSong.albumArt || track.artwork || track.albumArt || "",
      albumArt: updatedSong.albumArt || updatedSong.artwork || track.albumArt || track.artwork || "",
      album: updatedSong.album || track.album || "",
      artists: Array.isArray(updatedSong.artists) && updatedSong.artists.length ? updatedSong.artists.slice() : (updatedSong.artist ? [updatedSong.artist] : track.artists || []),
      spotifyId: updatedSong.spotifyId || track.spotifyId || "",
      durationMs: updatedSong.durationMs ?? track.durationMs ?? null,
      isrc: updatedSong.isrc || track.isrc || "",
      releaseDate: updatedSong.releaseDate || track.releaseDate || "",
      releaseYear: updatedSong.releaseYear ?? track.releaseYear ?? null,
      releasePrecision: updatedSong.releasePrecision || track.releasePrecision || "",
      releaseSource: updatedSong.releaseSource || track.releaseSource || "",
      score: (track.score != null && track.score !== "") ? track.score : 5,
      reason: keepReason,
    });
    if (entry.type === "popular") {
      track.mediaTitle = keepMediaTitle;
      track.media = keepMediaTitle;
      track.mediaType = keepMediaType;
    }
    if (entry.type === "seminal") {
      genre.identity.seminalTrack = track;
      genre.seminal_song = track;
    } else if (entry.index >= 0) {
      genre.identity.mediaTouchstones[entry.index] = track;
      genre.media_touchstones = genre.identity.mediaTouchstones;
    }
    try {
      updatedSong.isIdentityTrack = true;
      updatedSong.identityType = entry.type;
      updatedSong.identityIndex = entry.index;
      updatedSong.identityLabel = entry.label;
      if (updatedSong.score == null || updatedSong.score === "") updatedSong.score = 5;
    } catch (_) {}
    return true;
  }

  function reactionForIdentityTrack(genre, entry) {
    const queued = findQueuedIdentitySong(genre, entry);
    return Number(queued?.reaction ?? entry.track?.reaction ?? 0) || null;
  }

  function identityReactionControls(genre, entry) {
    const reaction = reactionForIdentityTrack(genre, entry);
    const gid = esc(String(genre?.id ?? ""));
    const type = esc(entry.type);
    const index = Number(entry.index ?? -1);
    return `<div class="genre-identity-track-actions" aria-label="Identity track rating">
      <button type="button" class="genre-identity-reaction ${reaction === 3 ? "active" : ""}" onclick="event.preventDefault(); event.stopPropagation(); DailyGenreIdentity.setTrackReaction('${gid}', '${type}', ${index}, 3)" title="I Fuck With This" aria-label="I Fuck With This">👍</button>
      <button type="button" class="genre-identity-reaction ${reaction === 2 ? "active" : ""}" onclick="event.preventDefault(); event.stopPropagation(); DailyGenreIdentity.setTrackReaction('${gid}', '${type}', ${index}, 2)" title="Meh, It’s Fine" aria-label="Meh, It’s Fine">🤷</button>
      <button type="button" class="genre-identity-reaction ${reaction === 1 ? "active" : ""}" onclick="event.preventDefault(); event.stopPropagation(); DailyGenreIdentity.setTrackReaction('${gid}', '${type}', ${index}, 1)" title="Fuck Off" aria-label="Fuck Off">👎</button>
    </div>`;
  }

  function identityMiniPlayerButton(track) {
    const url = trackSpotifyUrl(track);
    if (!url) return "";
    const title = encodeURIComponent(String(track?.title || track?.name || "Spotify track"));
    const artist = encodeURIComponent(String(track?.artist || (Array.isArray(track?.artists) ? track.artists.join(", ") : "")));
    const art = encodeURIComponent(trackArtwork(track) || "");
    return `<button type="button" class="genre-identity-mini-btn" onclick="event.preventDefault(); event.stopPropagation(); if (typeof stickyPlayerOpen === 'function') stickyPlayerOpen('${encodeURIComponent(url)}', '${title}', '${artist}', '${art}');" title="Open mini player" aria-label="Open Spotify mini player">▶</button>`;
  }

  function identityTrackCard(genre, entry) {
    const track = entry.track || {};
    const kind = entry.label || (entry.type === "seminal" ? "Seminal track" : "Popular track");
    const url = trackSpotifyUrl(track);
    const title = String(track?.title || track?.name || "").trim();
    const artist = String(track?.artist || "").trim();
    const label = [artist, title].filter(Boolean).join(" — ") || title || kind;
    const reason = String(track?.reason || "").trim();
    const mediaTitle = String(track?.mediaTitle || track?.media || "").trim();
    const mediaType = String(track?.mediaType || "").trim();
    const icon = entry.type === "seminal" ? "✦" : "▣";
    const art = trackArtwork(track);
    const copy =
      entry.type === "seminal"
        ? ["Canonical anchor", track?.album ? `from ${track.album}` : ""].filter(Boolean).join(" · ")
        : [mediaTitle ? `from ${mediaTitle}` : "Popular / media anchor", mediaType]
            .filter(Boolean)
            .join(" · ");
    return `<article class="genre-identity-track-card ${entry.type === "seminal" ? "is-seminal" : "is-media"} ${art ? "has-artwork" : ""}">
      <div class="genre-identity-track-icon" aria-hidden="true">${art ? `<img src="${esc(art)}" alt="" loading="lazy">` : esc(icon)}</div>
      <div class="genre-identity-track-main">
        <div class="genre-identity-track-kicker">${esc(kind)} · queued for listening</div>
        <strong>${url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)} ↗</a>` : esc(label)}</strong>
        ${copy ? `<small>${esc(copy)}</small>` : ""}
        ${reason ? `<em>${esc(reason)}</em>` : ""}
        <div class="genre-identity-track-control-row">${identityReactionControls(genre, entry)}${identityMiniPlayerButton(track)}</div>
      </div>
    </article>`;
  }

  function identityTracksForHydration(genre) {
    const tracks = [];
    const sem = getSeminal(genre);
    if (sem?.spotifyUrl || sem?.url || sem?.spotify_url) tracks.push(sem);
    getMedia(genre).forEach((m) => {
      if (m?.spotifyUrl || m?.url || m?.spotify_url) tracks.push(m);
    });
    return tracks;
  }

  async function hydrateIdentityArtwork(genre) {
    if (!genre || typeof window.fetchSpotifyTrackMetadata !== "function") return;
    let changed = false;
    for (const track of identityTracksForHydration(genre)) {
      if (trackArtwork(track)) continue;
      const url = trackSpotifyUrl(track);
      if (!url || identityArtworkTried.has(url)) continue;
      identityArtworkTried.add(url);
      try {
        const meta = await window.fetchSpotifyTrackMetadata(url);
        if (!meta) continue;
        if (meta.artwork && !trackArtwork(track)) {
          track.artwork = meta.artwork;
          changed = true;
        }
        if (meta.album && !track.album) {
          track.album = meta.album;
          changed = true;
        }
        if (meta.spotifyId && !track.spotifyId) {
          track.spotifyId = meta.spotifyId;
          changed = true;
        }
        if (meta.spotifyUrl && !track.spotifyUrl) {
          track.spotifyUrl = meta.spotifyUrl;
          track.url = meta.spotifyUrl;
          changed = true;
        }
        if (meta.title && !track.title) {
          track.title = meta.title;
          changed = true;
        }
        if (meta.artist && !track.artist) {
          track.artist = meta.artist;
          changed = true;
        }
      } catch (err) {
        console.warn("[Daily Genre] Identity artwork lookup failed", err);
      }
    }
    if (changed) {
      syncIdentityTracksToSongQueue(genre, false);
      markDirty();
      injectDnaCard(genre);
      refreshStudioEditor();
      toast("Fetched Spotify artwork for Genre DNA. Save Library Updates to persist.");
    }
  }

  function queueIdentityArtworkHydration(genre) {
    try { if (typeof window.enhanceSongListeningExperience === "function") setTimeout(window.enhanceSongListeningExperience, 80); } catch (_) {}
    if (!genre || identityArtworkHydrationQueued) return;
    identityArtworkHydrationQueued = true;
    setTimeout(() => {
      identityArtworkHydrationQueued = false;
      hydrateIdentityArtwork(genre);
    }, 120);
  }

  function injectHeroAliases(genre) {
    const root = $("#listenDetails");
    if (!root || !genre) return;
    $$(".genre-identity-alias-line", root).forEach((el) => el.remove());
    const aliases = aliasList(genre);
    if (!aliases.length) return;
    const titleEl = $(
      "#listenDetails .detail-record-card h2, #listenDetails .detail-record-card .genre-title, #listenDetails .detail-hero h2, #listenDetails .dc-hero-title",
    );
    if (!titleEl) return;
    const visible = aliases.slice(0, 5).join(", ");
    titleEl.insertAdjacentHTML(
      "afterend",
      `<div class="genre-identity-alias-line">also known as <em>${esc(visible)}</em>${aliases.length > 5 ? ` <span>+${aliases.length - 5}</span>` : ""}</div>`,
    );
  }

  function renderDnaCard(genre) {
    const aliases = aliasList(genre);
    const sem = getSeminal(genre);
    const media = getMedia(genre);
    const hasSem = sem?.title || sem?.artist || sem?.spotifyUrl || sem?.url;
    if (!aliases.length && !hasSem && !media.length) return "";
    return `<section class="genre-identity-dna" aria-label="Genre DNA">
      <div class="genre-identity-dna-head">
        <div><div class="eyebrow">Genre DNA</div><h3>Aliases and listening anchors</h3><p class="small">Seminal and popular anchors stay visually distinct here and are also added to Song Queue for rating/listening cleanup.</p></div>
        <button type="button" class="btn btn-secondary btn-tiny" onclick="DailyGenreIdentity.openStudio(${JSON.stringify(String(genre.id ?? ""))})">Edit identity</button>
      </div>
      ${aliases.length ? `<div class="genre-identity-alias-card"><span>Known aliases</span><strong>${esc(aliases.slice(0, 8).join(", "))}</strong></div>` : ""}
      <div class="genre-identity-track-grid">
        ${identityEntries(genre)
          .slice(0, 4)
          .map((entry) => identityTrackCard(genre, entry))
          .join("")}
      </div>
    </section>`;
  }

  function injectDnaCard(explicitGenre) {
    const g = explicitGenre || currentGenre();
    const root = $("#listenDetails");
    if (!g || !root) return;
    const queueChanged = syncIdentityTracksToSongQueue(g, true);
    injectHeroAliases(g);
    const existing = $(".genre-identity-dna", root);
    const html = renderDnaCard(g);
    if (!html) {
      existing?.remove();
      return;
    }
    if (existing) {
      existing.outerHTML = html;
      queueIdentityArtworkHydration(g);
      return;
    }

    // Discovery Console / Dig mode restructures the original detail DOM after
    // loadListenScreen. Insert DNA into that final layout first, then fall back
    // to the older detail page anchors. This is the piece that makes localhost
    // and production behave the same.
    const consoleWrap = $(".discovery-console", root);
    if (consoleWrap) {
      const consoleAnchor = $(
        ".dc-vibe-line, .dc-progress-strip, .detail-record-card",
        consoleWrap,
      );
      if (consoleAnchor) {
        consoleAnchor.insertAdjacentHTML("afterend", html);
        queueIdentityArtworkHydration(g);
        return;
      }
      consoleWrap.insertAdjacentHTML("afterbegin", html);
      queueIdentityArtworkHydration(g);
      return;
    }

    const anchor = $(
      ".song-listening-room, .dc-song-listening-section, .album-dive-panel, .detail-log-section",
      root,
    );
    if (anchor) anchor.insertAdjacentHTML("beforebegin", html);
    else $(".detail-hero", root)?.insertAdjacentHTML("beforeend", html);
    queueIdentityArtworkHydration(g);
  }

  function renderIdentityEditor() {
    const sId =
      selectedGenreId ||
      String(currentGenre()?.id ?? "") ||
      String(genres()[0]?.id ?? "");
    selectedGenreId = sId;
    const g = findGenre(sId) || genres()[0];
    if (!g)
      return '<section class="genre-identity-editor"><div class="studio-empty">Load genres first.</div></section>';
    const aliases = aliasList(g).join("\n");
    const sem = getSeminal(g);
    const media = getMedia(g);
    const label = aliasList(g).length
      ? `${g.genre} · aka ${aliasList(g).slice(0, 2).join(", ")}`
      : g.genre;
    return `<section class="genre-identity-editor studio-collapsible-section studio-section-collapsed" id="genreIdentityWorkbench" aria-label="Genre Identity Editor" data-studio-collapsible="1">
      <div class="studio-lane-head genre-identity-editor-head">
        <div><div class="eyebrow">Genre Identity</div><h3>Aliases, seminal track, and media touchstones</h3><p>These fields make search smarter and give each genre a compact cultural/canonical context.</p><div class="genre-identity-status-line">${esc(identityStatus(g))}</div></div>
        <div class="genre-identity-head-actions"><button type="button" class="btn btn-secondary btn-tiny" onclick="DailyGenreIdentity.openGenre(${JSON.stringify(String(g.id ?? ""))})">Open genre</button><button type="button" class="btn btn-secondary btn-tiny studio-random-song-cleanup-btn" data-studio-random-song-cleanup onclick="DailyGenreIdentity.openRandomStudioCleanup(event)" title="Load another random already-listened genre into this Genre Identity editor">Random cleanup</button><button type="button" class="studio-collapse-btn" aria-expanded="false"><span aria-hidden="true">＋</span><strong>Expand</strong></button></div>
      </div>
      <div class="genre-identity-picker">
        <label><span>Genre</span><input id="genreIdentityPick" type="search" list="genreIdentityDatalist" value="${esc(label || "")}" placeholder="Type a genre or alias…" autocomplete="off"></label>
        <datalist id="genreIdentityDatalist">${genreOptionsHtml()}</datalist>
        <button type="button" class="btn btn-secondary btn-tiny" id="genreIdentityFocusBtn">Load</button>
      </div>
      <details class="genre-identity-import genre-identity-full">
        <summary>Paste structured identity block</summary>
        <textarea id="genreIdentityBlockImport" rows="8" placeholder="GENRE: synth pop&#10;&#10;ALIASES:&#10;synth-pop&#10;&#10;SEMINAL_TRACK:&#10;ARTIST: Gary Numan&#10;TITLE: Cars&#10;SPOTIFY_URL: https://open.spotify.com/track/...&#10;REASON: Short reason&#10;&#10;MEDIA_TOUCHSTONE:&#10;ARTIST: a-ha&#10;TITLE: Take On Me&#10;MEDIA_TITLE: MTV music video&#10;MEDIA_TYPE: tv&#10;SPOTIFY_URL: https://open.spotify.com/track/...&#10;REASON: Short reason"></textarea>
        <div class="genre-identity-import-actions">
          <button type="button" class="btn btn-secondary btn-tiny" id="genreIdentityParseBlockBtn">Parse into form</button>
          <button type="button" class="btn btn-primary btn-tiny" id="genreIdentityApplyBlockBtn">Apply block directly</button>
        </div>
        <small>“None” values are ignored. GENRE can be a canonical name or alias.</small>
      </details>
      <div class="genre-identity-form" data-genre-id="${esc(String(g.id ?? ""))}">
        <label class="genre-identity-full"><span>Aliases / known synonyms</span><textarea id="genreIdentityAliases" rows="3" placeholder="One per line, e.g. Synth pop&#10;Synthpop&#10;Technopop">${esc(aliases)}</textarea><small>Used by Spin search, Studio typeahead, Stats focus, and future duplicate checks.</small></label>
        <div class="genre-identity-section-title">Seminal track</div>
        <label><span>Artist</span><input id="genreSeminalArtist" value="${esc(sem.artist || "")}" placeholder="Donna Summer"></label>
        <label><span>Title</span><input id="genreSeminalTitle" value="${esc(sem.title || sem.name || "")}" placeholder="I Feel Love"></label>
        <label class="genre-identity-full"><span>Spotify URL</span><input id="genreSeminalUrl" value="${esc(sem.spotifyUrl || sem.url || sem.spotify_url || "")}" placeholder="https://open.spotify.com/track/…"></label>
        <label class="genre-identity-full"><span>Why this is seminal</span><textarea id="genreSeminalReason" rows="3" placeholder="Why this track explains the genre historically or sonically.">${esc(sem.reason || "")}</textarea></label>
        <div class="genre-identity-section-title genre-identity-full">Media touchstones</div>
        <div id="genreMediaRows" class="genre-identity-media-list genre-identity-full">
          ${renderMediaRows(media)}
        </div>
        <div class="genre-identity-actions genre-identity-full">
          <button type="button" class="btn btn-secondary" id="genreAddMediaBtn">+ Add media touchstone</button>
          <button type="button" class="btn btn-primary" id="genreIdentityApplyBtn">Apply identity fields</button>
        </div>
      </div>
    </section>`;
  }

  function renderMediaRows(media) {
    const rows = media.length ? media : [{}];
    return rows
      .map(
        (m, idx) => `<fieldset class="genre-media-row" data-media-row="${idx}">
      <legend>Touchstone ${idx + 1}</legend>
      <label><span>Artist</span><input data-field="artist" value="${esc(m.artist || "")}" placeholder="Pixies"></label>
      <label><span>Song</span><input data-field="title" value="${esc(m.title || m.name || "")}" placeholder="Where Is My Mind?"></label>
      <label><span>Media title</span><input data-field="mediaTitle" value="${esc(m.mediaTitle || m.media || "")}" placeholder="Fight Club"></label>
      <label><span>Type</span><select data-field="mediaType"><option value="">Choose…</option>${["film", "tv", "game", "ad", "internet", "trailer", "anime", "other"].map((x) => `<option value="${esc(x)}" ${String(m.mediaType || "").toLowerCase() === x.toLowerCase() ? "selected" : ""}>${esc(x)}</option>`).join("")}</select></label>
      <label class="genre-identity-full"><span>Spotify URL</span><input data-field="spotifyUrl" value="${esc(m.spotifyUrl || m.url || m.spotify_url || "")}" placeholder="https://open.spotify.com/track/…"></label>
      <label class="genre-identity-full"><span>Why it matters</span><textarea data-field="reason" rows="2" placeholder="How this media placement shaped recognition.">${esc(m.reason || "")}</textarea></label>
      <button type="button" class="btn btn-ghost btn-tiny genre-remove-media">Remove</button>
    </fieldset>`,
      )
      .join("");
  }

  function cleanIdentityBlockValue(value) {
    const raw = String(value || "").trim();
    return /^none$/i.test(raw) ? "" : raw;
  }

  function normalizeIdentityKey(key) {
    return String(key || "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "_");
  }

  function parseIdentityBlock(text) {
    const parsed = {
      genre: "",
      aliases: [],
      seminal: {},
      mediaTouchstones: [],
    };
    const lines = String(text || "")
      .replace(/\r/g, "")
      .split("\n");
    let section = "";
    let currentMedia = null;
    const commitMedia = () => {
      if (!currentMedia) return;
      if (currentMedia.spotifyUrl && !currentMedia.url)
        currentMedia.url = currentMedia.spotifyUrl;
      if (
        currentMedia.title ||
        currentMedia.artist ||
        currentMedia.spotifyUrl ||
        currentMedia.mediaTitle ||
        currentMedia.mediaType ||
        currentMedia.reason
      ) {
        parsed.mediaTouchstones.push(currentMedia);
      }
      currentMedia = null;
    };
    const assignTrack = (obj, key, value) => {
      const clean = cleanIdentityBlockValue(value);
      if (key === "ARTIST") obj.artist = clean;
      else if (key === "TITLE" || key === "SONG") obj.title = clean;
      else if (key === "SPOTIFY_URL" || key === "URL") {
        obj.spotifyUrl = clean;
        obj.url = clean;
      } else if (key === "REASON") obj.reason = clean;
      else if (key === "MEDIA_TITLE" || key === "MEDIA") obj.mediaTitle = clean;
      else if (key === "MEDIA_TYPE" || key === "TYPE")
        obj.mediaType = clean.toLowerCase();
    };

    lines.forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line) return;
      const header = line.match(/^([A-Z_ ]+)\s*:\s*(.*)$/i);
      const key = header ? normalizeIdentityKey(header[1]) : "";
      const value = header ? header[2] : "";

      if (key === "GENRE") {
        parsed.genre = cleanIdentityBlockValue(value);
        section = "";
        return;
      }
      if (key === "ALIASES") {
        commitMedia();
        section = "aliases";
        return;
      }
      if (key === "SEMINAL_TRACK") {
        commitMedia();
        section = "seminal";
        return;
      }
      if (key === "MEDIA_TOUCHSTONE" || key === "MEDIA_TOUCHSTONES") {
        commitMedia();
        section = "media";
        currentMedia = {};
        return;
      }

      if (section === "aliases" && !header) {
        const alias = cleanIdentityBlockValue(line);
        if (alias) parsed.aliases.push(alias);
        return;
      }
      if (section === "seminal" && header) {
        assignTrack(parsed.seminal, key, value);
        return;
      }
      if (section === "media" && header) {
        if (!currentMedia) currentMedia = {};
        assignTrack(currentMedia, key, value);
      }
    });
    commitMedia();
    parsed.aliases = [
      ...new Set(parsed.aliases.map((a) => a.trim()).filter(Boolean)),
    ];
    return parsed;
  }

  function fillIdentityFormFromParsed(parsed, allowSwitch = true) {
    if (!parsed) return false;
    const target = parsed.genre ? bestGenreMatch(parsed.genre) : null;
    if (
      allowSwitch &&
      target &&
      String(target.id ?? "") !==
        String($(".genre-identity-form")?.dataset.genreId || "")
    ) {
      selectedGenreId = String(target.id ?? "");
      refreshStudioEditor();
      setTimeout(() => fillIdentityFormFromParsed(parsed, false), 0);
      return true;
    }
    const root = $("#genreIdentityWorkbench");
    if (!root) return false;
    const set = (sel, value) => {
      const el = $(sel, root);
      if (el) el.value = value || "";
    };
    set("#genreIdentityAliases", parsed.aliases.join("\n"));
    set("#genreSeminalArtist", parsed.seminal.artist || "");
    set("#genreSeminalTitle", parsed.seminal.title || "");
    set(
      "#genreSeminalUrl",
      parsed.seminal.spotifyUrl || parsed.seminal.url || "",
    );
    set("#genreSeminalReason", parsed.seminal.reason || "");
    const mediaRows = $("#genreMediaRows", root);
    if (mediaRows)
      mediaRows.innerHTML = renderMediaRows(
        parsed.mediaTouchstones.length ? parsed.mediaTouchstones : [{}],
      );
    return true;
  }

  function applyIdentityBlockDirect(parsed) {
    if (!parsed) return toast("Paste a structured identity block first.", true);
    const g =
      (parsed.genre && bestGenreMatch(parsed.genre)) ||
      findGenre($(".genre-identity-form")?.dataset.genreId) ||
      currentGenre();
    if (!g)
      return toast(
        "Could not match the GENRE line to an existing genre.",
        true,
      );
    setAliases(g, parsed.aliases || []);
    const id = identity(g);
    const sem = {
      artist: parsed.seminal.artist || "",
      title: parsed.seminal.title || "",
      spotifyUrl: parsed.seminal.spotifyUrl || parsed.seminal.url || "",
      reason: parsed.seminal.reason || "",
      artwork: parsed.seminal.artwork || parsed.seminal.albumArt || "",
    };
    if (sem.spotifyUrl) sem.url = sem.spotifyUrl;
    id.seminalTrack = sem;
    g.seminal_song = sem;
    id.mediaTouchstones = (parsed.mediaTouchstones || [])
      .map((m) => ({
        artist: m.artist || "",
        title: m.title || "",
        mediaTitle: m.mediaTitle || m.media || "",
        mediaType: m.mediaType || "",
        spotifyUrl: m.spotifyUrl || m.url || "",
        url: m.spotifyUrl || m.url || "",
        reason: m.reason || "",
        artwork: m.artwork || m.albumArt || "",
      }))
      .filter(
        (m) =>
          m.title ||
          m.artist ||
          m.mediaTitle ||
          m.mediaType ||
          m.spotifyUrl ||
          m.reason,
      );
    g.media_touchstones = id.mediaTouchstones;
    syncIdentityTracksToSongQueue(g, false);
    selectedGenreId = String(g.id ?? selectedGenreId);
    markDirty();
    refreshStudioEditor();
    setTimeout(() => injectDnaCard(g), 60);
    toast(
      `Imported identity block for ${g.genre || parsed.genre || "genre"}. Save Library Updates to persist.`,
      false,
    );
    return true;
  }

  function readMediaRows(root) {
    return $$(".genre-media-row", root)
      .map((row) => {
        const obj = {};
        $$("[data-field]", row).forEach((el) => {
          obj[el.dataset.field] = String(el.value || "").trim();
        });
        if (obj.spotifyUrl && !obj.url) obj.url = obj.spotifyUrl;
        return obj;
      })
      .filter(
        (m) =>
          m.title ||
          m.artist ||
          m.spotifyUrl ||
          m.mediaTitle ||
          m.mediaType ||
          m.reason,
      );
  }

  function saveEditor() {
    const form = $(".genre-identity-form");
    if (!form) return;
    const g = findGenre(form.dataset.genreId);
    if (!g) return toast("Could not find selected genre.", true);
    const aliases = String($("#genreIdentityAliases")?.value || "").split(
      /[\n,;|]/g,
    );
    setAliases(g, aliases);
    const id = identity(g);
    const previousSem = getSeminal(g);
    const previousMedia = getMedia(g);
    const sem = {
      artist: String($("#genreSeminalArtist")?.value || "").trim(),
      title: String($("#genreSeminalTitle")?.value || "").trim(),
      spotifyUrl: String($("#genreSeminalUrl")?.value || "").trim(),
      reason: String($("#genreSeminalReason")?.value || "").trim(),
      artwork: previousSem.artwork || previousSem.albumArt || "",
      album: previousSem.album || "",
      spotifyId: previousSem.spotifyId || "",
    };
    if (sem.spotifyUrl) sem.url = sem.spotifyUrl;
    id.seminalTrack = sem;
    g.seminal_song = sem;
    const priorByUrl = new Map(previousMedia.map((m) => [trackSpotifyUrl(m), m]).filter(([url]) => !!url));
    id.mediaTouchstones = readMediaRows(form).map((m) => {
      const prior = priorByUrl.get(trackSpotifyUrl(m)) || {};
      return {
        ...m,
        artwork: m.artwork || prior.artwork || prior.albumArt || "",
        album: m.album || prior.album || "",
        spotifyId: m.spotifyId || prior.spotifyId || "",
      };
    });
    g.media_touchstones = id.mediaTouchstones;
    syncIdentityTracksToSongQueue(g, false);
    markDirty();
    injectDnaCard();
    toast(
      `Updated identity for ${g.genre || "genre"}. Save Library Updates to persist.`,
      false,
    );
  }

  function installEditorEvents(root = document) {
    if (!root) return;
    if (root.dataset && root.dataset.genreIdentityEvents === "1") return;
    if (root.dataset) root.dataset.genreIdentityEvents = "1";
    const pick = $("#genreIdentityPick", root);
    $("#genreIdentityFocusBtn", root)?.addEventListener("click", () => {
      const match = bestGenreMatch(pick?.value || "");
      if (match) {
        selectedGenreId = String(match.id ?? "");
        refreshStudioEditor();
      } else toast("No genre or alias match found.", true);
    });
    pick?.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        ev.preventDefault();
        $("#genreIdentityFocusBtn", root)?.click();
      }
    });
    $("#genreIdentityApplyBtn", root)?.addEventListener("click", saveEditor);
    $("#genreIdentityParseBlockBtn", root)?.addEventListener("click", () => {
      const text = $("#genreIdentityBlockImport", root)?.value || "";
      const parsed = parseIdentityBlock(text);
      if (
        !parsed.genre &&
        !parsed.aliases.length &&
        !parsed.seminal.title &&
        !parsed.mediaTouchstones.length
      ) {
        toast("Paste a structured identity block first.", true);
        return;
      }
      fillIdentityFormFromParsed(parsed);
      toast(
        "Parsed identity block into the manual fields. Review, then apply/save.",
        false,
      );
    });
    $("#genreIdentityApplyBlockBtn", root)?.addEventListener("click", () => {
      const text = $("#genreIdentityBlockImport", root)?.value || "";
      const parsed = parseIdentityBlock(text);
      applyIdentityBlockDirect(parsed);
    });
    $("#genreAddMediaBtn", root)?.addEventListener("click", () => {
      const list = $("#genreMediaRows", root);
      if (!list) return;
      list.insertAdjacentHTML("beforeend", renderMediaRows([{}]));
    });
    root.addEventListener("click", (ev) => {
      const collapseBtn = ev.target.closest(".studio-collapse-btn");
      if (collapseBtn) {
        ev.preventDefault();
        ev.stopPropagation();
        const section = collapseBtn.closest(".studio-collapsible-section");
        if (section) {
          const collapsed = !section.classList.contains(
            "studio-section-collapsed",
          );
          section.classList.toggle("studio-section-collapsed", collapsed);
          collapseBtn.setAttribute(
            "aria-expanded",
            collapsed ? "false" : "true",
          );
          collapseBtn.innerHTML = collapsed
            ? '<span aria-hidden="true">＋</span><strong>Expand</strong>'
            : '<span aria-hidden="true">−</span><strong>Collapse</strong>';
        }
        return;
      }
      const btn = ev.target.closest(".genre-remove-media");
      if (!btn) return;
      const rows = $$(".genre-media-row", root);
      if (rows.length <= 1) {
        btn
          .closest(".genre-media-row")
          ?.querySelectorAll("input, textarea")
          .forEach((el) => {
            el.value = "";
          });
        return;
      }
      btn.closest(".genre-media-row")?.remove();
    });
  }

  function studioIdentityAnchor(mount) {
    if (!mount) return null;
    return (
      $(".studio-toolbar", mount) ||
      $("#studioExpandAllBtn", mount)?.closest(".studio-toolbar") ||
      $(".studio-workbench-hero", mount) ||
      $(".review-hero", mount)
    );
  }

  function placeStudioIdentityEditor(mount, editor) {
    if (!mount || !editor) return;
    const anchor = studioIdentityAnchor(mount);
    if (anchor && anchor.nextElementSibling !== editor)
      anchor.insertAdjacentElement("afterend", editor);
    else if (!anchor && mount.firstElementChild !== editor)
      mount.insertBefore(editor, mount.firstElementChild || null);
  }

  function refreshStudioEditor() {
    const old = $("#genreIdentityWorkbench");
    if (!old) return;
    const mount = old.closest("#reviewContent") || $("#reviewContent");
    old.outerHTML = renderIdentityEditor();
    const editor = $("#genreIdentityWorkbench", mount || document);
    if (mount && editor) placeStudioIdentityEditor(mount, editor);
    installEditorEvents(editor);
  }

  function injectStudioEditor() {
    const mount = $("#reviewContent");
    if (!mount) return;
    let editor = $("#genreIdentityWorkbench", mount);
    if (!editor) {
      const anchor = studioIdentityAnchor(mount);
      if (anchor) anchor.insertAdjacentHTML("afterend", renderIdentityEditor());
      else mount.insertAdjacentHTML("afterbegin", renderIdentityEditor());
      editor = $("#genreIdentityWorkbench", mount);
    }
    placeStudioIdentityEditor(mount, editor);
    installEditorEvents(editor);
  }

  function patchManualSpinSearch() {
    const original = window.searchGenresInto;
    if (typeof original !== "function" || original.__identityWrapped) return;
    const wrapped = function (inputEl, resultsEl) {
      const q = String(inputEl?.value || "").trim();
      if (!q) return original.apply(this, arguments);
      const nq = norm(q);
      const matches = genres()
        .map((g) => {
          const name = norm(g.genre || "");
          const aliases = aliasList(g).map(norm);
          const exactAlias = aliases.includes(nq);
          let score = 9;
          if (name === nq) score = 0;
          else if (exactAlias) score = 1;
          else if (name.startsWith(nq)) score = 2;
          else if (aliases.some((a) => a.startsWith(nq))) score = 3;
          else if (name.includes(nq)) score = 4;
          else if (aliases.some((a) => a.includes(nq))) score = 5;
          else if (searchText(g).includes(nq)) score = 6;
          return { g, score };
        })
        .filter((x) => x.score < 9)
        .sort(
          (a, b) =>
            a.score - b.score ||
            String(a.g.genre || "").localeCompare(String(b.g.genre || "")),
        )
        .slice(0, 12);
      if (!matches.length) return original.apply(this, arguments);
      resultsEl.innerHTML = matches
        .map(({ g, score }) => {
          const aliases = aliasList(g);
          const aliasHit = aliases.find((a) => norm(a).includes(nq));
          return `<button class="list-item" data-id="${esc(String(g.id ?? ""))}" style="text-align:left; cursor:pointer;"><strong>${esc(g.genre || "Unknown")}</strong><div class="small" style="margin-top:6px;">${esc(typeof categoryLine === "function" ? categoryLine(g) : g.category_path || g.subcategory || "")}${aliasHit ? ` · aka ${esc(aliasHit)}` : ""}</div></button>`;
        })
        .join("");
      $$("[data-id]", resultsEl).forEach((btn) => {
        btn.onclick = () => {
          const picked = findGenre(btn.dataset.id);
          if (!picked) return;
          if (typeof openGenreDetail === "function")
            openGenreDetail(picked, false);
        };
      });
    };
    wrapped.__identityWrapped = true;
    window.searchGenresInto = wrapped;
  }

  function patchStatsFocusAliases() {
    if (
      typeof window.dgStatsGenreFocusCandidates === "function" &&
      !window.dgStatsGenreFocusCandidates.__identityWrapped
    ) {
      const original = window.dgStatsGenreFocusCandidates;
      const wrapped = function () {
        return original.apply(this, arguments).map((c) => {
          const g = findGenre(c.id);
          const aliasText = aliasList(g).join(" ");
          return {
            ...c,
            search: norm(
              [c.name, aliasText, g?.category_path, g?.subcategory].join(" "),
            ),
          };
        });
      };
      wrapped.__identityWrapped = true;
      window.dgStatsGenreFocusCandidates = wrapped;
    }
  }

  function patchLibraryAliasFallback() {
    const original = window.renderHistory;
    if (typeof original !== "function" || original.__identityWrapped) return;
    function wrapped() {
      const search = $("#archiveSearchInput");
      const raw = search?.value || "";
      const result = original.apply(this, arguments);
      if (search && raw.trim()) {
        setTimeout(() => {
          const list = $("#historyList");
          if (!list || list.querySelector(".archive-card")) return;
          const matches = genres().filter((g) =>
            aliasList(g).some(
              (a) => norm(a).includes(norm(raw)) || norm(raw).includes(norm(a)),
            ),
          );
          if (!matches.length) return;
          const previous = search.value;
          search.value = matches[0].genre || previous;
          try {
            original.apply(this, arguments);
          } finally {
            search.value = previous;
          }
        }, 0);
      }
      return result;
    }
    wrapped.__identityWrapped = true;
    window.renderHistory = wrapped;
  }

  function patchListenLoadForDna() {
    const original =
      typeof loadListenScreen === "function" ? loadListenScreen : null;
    if (!original || original.__identityDnaWrapped) return;
    const wrapped = function identityWrappedLoadListenScreen(genre, ...rest) {
      if (genre && typeof genre === "object") lastListenGenre = genre;
      const result = original.call(this, genre, ...rest);
      setTimeout(() => injectDnaCard(genre), 40);
      setTimeout(() => injectDnaCard(genre), 180);
      return result;
    };
    wrapped.__identityDnaWrapped = true;
    loadListenScreen = wrapped;
  }

  function installNavigationHistory() {
    if (window.__dailyGenreUxHistoryInstalled) return;
    if (typeof window.history?.pushState !== "function") return;
    window.__dailyGenreUxHistoryInstalled = true;
    let suppress = false;
    const activeScreen = () =>
      document.querySelector(".screen.active")?.id?.replace(/^screen-/, "") ||
      "spin";
    const screenUrl = (name) => {
      const base = `${location.pathname}${location.search}`;
      return name === "spin"
        ? base
        : `${base}#screen=${encodeURIComponent(name)}`;
    };
    const genreUrl = (id) =>
      `${location.pathname}${location.search}#genre=${encodeURIComponent(String(id))}`;
    const stateForScreen = (name) => ({
      dgUxNav: true,
      type: "screen",
      screen: name || "spin",
    });
    const stateForGenre = (genre, editMode) => ({
      dgUxNav: true,
      type: "genre",
      genreId: String(genre?.id ?? ""),
      editMode: !!editMode,
    });

    try {
      const hashGenre = location.hash.match(/^#genre=(.+)$/);
      const hashScreen = location.hash.match(/^#screen=(.+)$/);
      if (hashGenre)
        history.replaceState(
          {
            dgUxNav: true,
            type: "genre",
            genreId: decodeURIComponent(hashGenre[1]),
          },
          "",
          location.href,
        );
      else if (hashScreen)
        history.replaceState(
          stateForScreen(decodeURIComponent(hashScreen[1])),
          "",
          location.href,
        );
      else
        history.replaceState(stateForScreen(activeScreen()), "", location.href);
    } catch (_) {}

    const originalSwitch = window.switchScreen;
    if (
      typeof originalSwitch === "function" &&
      !originalSwitch.__dgUxHistoryWrapped
    ) {
      const wrappedSwitch = function dgUxSwitchScreen(name, options = {}) {
        const result = originalSwitch.apply(this, arguments);
        if (
          result !== false &&
          !suppress &&
          name !== "listen" &&
          !options.skipHistory
        ) {
          try {
            const nextUrl = screenUrl(name);
            if (
              location.hash !==
              (name === "spin" ? "" : `#screen=${encodeURIComponent(name)}`)
            ) {
              history.pushState(stateForScreen(name), "", nextUrl);
            }
          } catch (_) {}
        }
        return result;
      };
      wrappedSwitch.__dgUxHistoryWrapped = true;
      window.switchScreen = wrappedSwitch;
    }

    const originalOpen = window.openGenreDetail;
    if (
      typeof originalOpen === "function" &&
      !originalOpen.__dgUxHistoryWrapped
    ) {
      const wrappedOpen = function dgUxOpenGenreDetail(
        genre,
        editMode = false,
        options = {},
      ) {
        if (genre && !suppress && !options.skipHistory && genre.id != null) {
          try {
            const targetHash = `#genre=${encodeURIComponent(String(genre.id))}`;
            if (location.hash !== targetHash)
              history.pushState(
                stateForGenre(genre, editMode),
                "",
                genreUrl(genre.id),
              );
          } catch (_) {}
        }
        const result = originalOpen.apply(this, arguments);
        if (result !== false && genre?.id != null) {
          try {
            history.replaceState(
              stateForGenre(genre, editMode),
              "",
              genreUrl(genre.id),
            );
          } catch (_) {}
        }
        return result;
      };
      wrappedOpen.__dgUxHistoryWrapped = true;
      window.openGenreDetail = wrappedOpen;
    }

    window.addEventListener("popstate", (event) => {
      const st = event.state || {};
      const genreMatch = location.hash.match(/^#genre=(.+)$/);
      const screenMatch = location.hash.match(/^#screen=(.+)$/);
      suppress = true;
      try {
        if (st.type === "genre" || genreMatch) {
          const id = st.genreId || decodeURIComponent(genreMatch?.[1] || "");
          const g = findGenre(id);
          if (g && typeof window.openGenreDetail === "function")
            window.openGenreDetail(g, !!st.editMode, {
              force: true,
              skipHistory: true,
            });
          else if (typeof window.switchScreen === "function")
            window.switchScreen("spin", { force: true, skipHistory: true });
        } else {
          const screen =
            st.screen ||
            (screenMatch ? decodeURIComponent(screenMatch[1]) : "spin");
          if (typeof window.switchScreen === "function")
            window.switchScreen(screen || "spin", {
              force: true,
              skipHistory: true,
            });
        }
      } finally {
        suppress = false;
      }
    });
  }

  function installFloatingSaveControls() {
    if (window.__dailyGenreFloatingSaveControls) return;
    window.__dailyGenreFloatingSaveControls = true;
    document.addEventListener(
      "click",
      (event) => {
        const move = event.target.closest("[data-floating-save-move]");
        const collapse = event.target.closest("[data-floating-save-collapse]");
        if (!move && !collapse) return;
        const bar = document.getElementById("floatingListeningSave");
        if (!bar) return;
        if (move) {
          const positions = ["", "is-left", "is-top", "is-top is-left"];
          const current = bar.dataset.positionIndex
            ? Number(bar.dataset.positionIndex)
            : 0;
          const next = (current + 1) % positions.length;
          bar.classList.remove("is-left", "is-top");
          positions[next]
            .split(/\s+/)
            .filter(Boolean)
            .forEach((c) => bar.classList.add(c));
          bar.dataset.positionIndex = String(next);
        }
        if (collapse) {
          const minimized = !bar.classList.contains("is-minimized");
          bar.classList.toggle("is-minimized", minimized);
          collapse.textContent = minimized ? "+" : "×";
          collapse.setAttribute(
            "aria-label",
            minimized ? "Expand save bar" : "Collapse save bar",
          );
          collapse.title = minimized ? "Expand save bar" : "Collapse save bar";
        }
      },
      true,
    );
  }

  function boot() {
    installNavigationHistory();
    installFloatingSaveControls();
    patchListenLoadForDna();
    patchManualSpinSearch();
    patchStatsFocusAliases();
    patchLibraryAliasFallback();
    injectDnaCard();
    if ($("#screen-review")?.classList.contains("active")) injectStudioEditor();
    document.addEventListener(
      "click",
      (ev) => {
        if (ev.target.closest('[data-screen="review"], #screen-review'))
          setTimeout(injectStudioEditor, 80);
        if (ev.target.closest('[data-screen="listen"], #screen-listen'))
          setTimeout(injectDnaCard, 80);
      },
      true,
    );
    // Do not observe the whole document body. That made Studio feel laggy because
    // every render/micro-update in the workbench retriggered identity injection.
    // The explicit render wrappers and tab-click hooks above are enough for Studio;
    // this small scoped observer only helps when the Dig details area is rebuilt
    // asynchronously after a genre opens.
    const listenRoot = $("#screen-listen");
    if (listenRoot && typeof MutationObserver === "function") {
      let listenTimer = null;
      const observer = new MutationObserver(() => {
        clearTimeout(listenTimer);
        listenTimer = setTimeout(() => injectDnaCard(), 120);
      });
      observer.observe(listenRoot, { childList: true, subtree: true });
    }
  }


  function officialSongCountForStudioCleanup(genre) {
    try {
      const raw = Array.isArray(genre?.songs_listened) ? genre.songs_listened : [];
      const inflated = typeof window.inflateSongsFromStorage === "function" ? window.inflateSongsFromStorage(raw) : raw;
      return inflated.filter((song) => song && !song.isPending).length;
    } catch (_) {
      return Array.isArray(genre?.songs_listened) ? genre.songs_listened.length : 0;
    }
  }

  function isLoggedForStudioCleanup(genre) {
    const status = String(genre?.status || "").toLowerCase();
    return status === "listened" || status === "veto" || !!genre?.date_normalized || !!genre?.date_raw;
  }

  function expandStudioIdentitySection(scroll = true) {
    const workbench = $("#genreIdentityWorkbench");
    if (!workbench) return;
    workbench.classList.remove("studio-section-collapsed");
    workbench.classList.remove("is-collapsed");
    const btn = workbench.querySelector(".studio-collapse-btn");
    if (btn) {
      btn.setAttribute("aria-expanded", "true");
      btn.innerHTML = '<span aria-hidden="true">−</span><strong>Collapse</strong>';
    }
    if (scroll) workbench.scrollIntoView?.({ behavior: "smooth", block: "start" });
  }

  function openRandomStudioCleanup(ev) {
    try {
      ev?.preventDefault?.();
      ev?.stopPropagation?.();
    } catch (_) {}

    const clickedInsideWorkbench = !!ev?.target?.closest?.("#genreIdentityWorkbench");
    const reviewScreen = $("#screen-review");
    const alreadyInStudio = !!reviewScreen?.classList?.contains("active");
    const preserveScrollY = typeof window !== "undefined" ? window.scrollY : 0;

    const all = genres();
    const currentFormId = String($("#genreIdentityWorkbench .genre-identity-form")?.dataset?.genreId || selectedGenreId || "");
    const avoid = new Set([currentFormId, lastStudioRandomCleanupId].filter(Boolean).map(String));
    let pool = all
      .filter((genre) => isLoggedForStudioCleanup(genre) && officialSongCountForStudioCleanup(genre) > 0)
      .filter((genre) => !avoid.has(String(genre.id ?? "")));
    if (!pool.length) {
      pool = all
        .filter((genre) => isLoggedForStudioCleanup(genre) && officialSongCountForStudioCleanup(genre) > 0)
        .filter((genre) => String(genre.id ?? "") !== currentFormId);
    }
    if (!pool.length) pool = all.filter((genre) => isLoggedForStudioCleanup(genre) && officialSongCountForStudioCleanup(genre) > 0);
    if (!pool.length) {
      toast("No listened genres with logged songs are available for cleanup yet.", true);
      expandStudioIdentitySection(!clickedInsideWorkbench);
      return false;
    }
    const pick = pool[Math.floor(Math.random() * pool.length)];
    selectedGenreId = String(pick.id ?? "");
    lastStudioRandomCleanupId = selectedGenreId;

    // If the button was clicked from inside Studio/Genre Identity, do not call
    // switchScreen() or scrollIntoView(); both can yank the viewport back to the
    // top of Studio. Just swap the selected cleanup target in place.
    if (!alreadyInStudio && typeof switchScreen === "function") switchScreen("review");

    setTimeout(() => {
      injectStudioEditor();
      refreshStudioEditor();
      installEditorEvents($("#genreIdentityWorkbench"));
      expandStudioIdentitySection(!clickedInsideWorkbench);
      const pickInput = $("#genreIdentityPick");
      if (pickInput && pick.genre) pickInput.value = pick.genre;
      if (clickedInsideWorkbench && typeof window !== "undefined") {
        window.requestAnimationFrame?.(() => window.scrollTo({ top: preserveScrollY, left: 0, behavior: "auto" }));
      }
      toast(`Random identity cleanup pick: ${pick.genre || "listened genre"}.`);
    }, 40);
    return true;
  }

  window.DailyGenreIdentity = {
    version: VERSION,
    aliases: aliasList,
    searchText,
    openRandomStudioCleanup: openRandomStudioCleanup,
    setTrackReaction(genreId, type, index, value) {
      const g = findGenre(genreId) || currentGenre();
      if (!g) return toast("Could not find that genre.", true);
      const entries = identityEntries(g);
      const entry = entries.find((row) => String(row.type) === String(type) && Number(row.index) === Number(index));
      if (!entry) return toast("Could not find that identity track.", true);
      syncIdentityTracksToSongQueue(g, false);
      const songs = queueSongs(g);
      const queued = findQueuedIdentitySong(g, entry, songs);
      if (!queued) return toast("Could not add that identity track to the queue.", true);
      const reaction = [1, 2, 3].includes(Number(value)) ? Number(value) : null;
      const next = queued.reaction === reaction ? null : reaction;
      queued.reaction = next;
      entry.track.reaction = next;
      g.songs_listened = songs;
      markDirty();
      try {
        if (typeof currentGenre !== "undefined" && currentGenre && String(currentGenre.id) === String(g.id) && typeof loadListenScreen === "function") {
          const y = window.scrollY || 0;
          loadListenScreen(g, { preserveDirty: true, skipSpotifyHydration: true });
          setTimeout(() => window.scrollTo({ top: y, left: window.scrollX || 0, behavior: "auto" }), 0);
        } else {
          injectDnaCard(g);
        }
      } catch (_) {
        injectDnaCard(g);
      }
      try { if (typeof window.enhanceSongListeningExperience === "function") setTimeout(window.enhanceSongListeningExperience, 80); } catch (_) {}
      toast(next ? "Identity track rated — use the floating Save button to persist it." : "Identity track rating cleared — use the floating Save button to persist it.");
    },
    syncIdentityTracksToSongQueue,
    updateTrackFromQueueOverwrite,
    openStudio(id) {
      selectedGenreId = String(id || selectedGenreId || "");
      if (typeof switchScreen === "function") switchScreen("review");
      setTimeout(() => {
        injectStudioEditor();
        refreshStudioEditor();
        const workbench = $("#genreIdentityWorkbench");
        if (workbench) {
          expandStudioIdentitySection(true);
        }
      }, 80);
    },
    openGenre(id) {
      const g = findGenre(id);
      if (!g) return toast("Could not find that genre.", true);
      try {
        if (typeof openGenreDetail === "function") {
          openGenreDetail(g, false, { force: true });
          lastListenGenre = g;
          setTimeout(() => injectDnaCard(g), 120);
          return;
        }
      } catch (_) {}
      try {
        if (typeof window.openGenreByIdEncoded === "function") {
          window.openGenreByIdEncoded(
            encodeURIComponent(String(g.id ?? "")),
            false,
          );
          return;
        }
      } catch (_) {}
      try {
        if (typeof switchScreen === "function") switchScreen("listen");
        const mount = document.getElementById("listenDetails");
        if (mount)
          mount.innerHTML = `<div class="panel"><h2>${esc(g.genre || "Genre")}</h2><p class="small">Open Genre Detail was not available. Try opening this genre from Library.</p></div>`;
      } catch (_) {}
    },
    syncIdentityTracksToSongQueue,
    updateTrackFromQueueOverwrite,
    apply: function () {
      injectStudioEditor();
      try {
        const g = currentGenre();
        if (g) {
          const changed = syncIdentityTracksToSongQueue(g, true);
          if (!changed && typeof window.resetListenDirtySnapshot === "function" && document.getElementById("screen-listen")?.classList.contains("active")) {
            window.resetListenDirtySnapshot();
          }
        }
      } catch (_) {}
      injectDnaCard();
      patchManualSpinSearch();
      patchStatsFocusAliases();
      patchLibraryAliasFallback();
    },
  };

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
