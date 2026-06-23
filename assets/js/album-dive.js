/* === Album Dive feature === */
const ALBUM_DIVE_SLOT_DEFS = [
  ["breakout", "Breakout"],
  ["originator", "Originator"],
  ["archetype", "Archetype"],
  ["consensus", "Consensus"],
  ["popular", "Popular"],
  ["purist", "Purist"],
  ["cult_hit", "Cult Hit"],
  ["modern", "Modern"],
  ["revival", "Revival"],
  ["wave", "Wave"],
];

function albumDiveCleanPastedRefs(value = "") {
  const cleaner = typeof cleanPastedCitationArtifacts === "function" ? cleanPastedCitationArtifacts : null;
  const cleaned = cleaner ? cleaner(value) : String(value || "");
  return cleaned
    .replace(/\[(?:web|file):\s*[^\]]+\]/gi, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .trim();
}

function albumDiveJsonImportMarkup(id = "albumDiveJsonImport") {
  return `<div class="album-dive-json-import">
    <div class="album-dive-json-head">
      <div>
        <label for="${id}">Paste structured Album Dive JSON</label>
        <p class="small">Drop in the full album list; it will fill Breakout, Originator, Archetype, Consensus, etc. Manual slot editing still works below.</p>
      </div>
      <button type="button" class="btn btn-primary btn-tiny" onclick="importAlbumDiveJson('${id}')">Import JSON</button>
    </div>
    <textarea id="${id}" rows="8" placeholder='[{"type":"Breakout","album":"...","artist":"...","spotify_url":"https://open.spotify.com/album/...","year":1991,"reason":"..."}]'></textarea>
  </div>`;
}

function defaultAlbumDiveSlot(key, label) {
  return {
    key,
    label,
    album: "",
    artist: "",
    year: null,
    releaseDate: "",
    albumType: "",
    totalTracks: null,
    rationale: "",
    spotifyAlbumUrl: "",
    spotifyAlbumId: "",
    spotifyUrl: "",
    albumArt: "",
    manualAlbumArt: "",
    tracks: [],
    listenState: "not_started",
    rating: null,
    favoriteAlbum: false,
    favoriteSong: {
      title: "",
      artist: "",
      spotifyTrackUrl: "",
      spotifyTrackId: "",
      albumArt: "",
      durationMs: null,
      trackNumber: null,
      discNumber: null,
      note: "",
      promotedToSongLog: false,
    },
    standoutTracks: [],
    spawnedSongs: [],
    notes: "",
  };
}

function normalizeAlbumDiveTrack(raw = {}) {
  const artists = Array.isArray(raw.artists)
    ? raw.artists
        .map((a) => (typeof a === "string" ? a : a?.name))
        .filter(Boolean)
    : [];
  return {
    title: raw.title || raw.name || "",
    artist: raw.artist || artists.join(", ") || "",
    artists,
    spotifyTrackUrl:
      raw.spotifyTrackUrl || raw.spotifyUrl || raw.external_urls?.spotify || "",
    spotifyTrackId: raw.spotifyTrackId || raw.spotifyId || raw.id || "",
    durationMs: Number(raw.durationMs || raw.duration_ms || 0) || null,
    trackNumber: Number(raw.trackNumber || raw.track_number || 0) || null,
    discNumber: Number(raw.discNumber || raw.disc_number || 0) || null,
    reaction: [1, 2, 3].includes(Number(raw.reaction))
      ? Number(raw.reaction)
      : null,
    note: raw.note || "",
  };
}

function normalizeAlbumDiveSlot(raw, key, label) {
  const base = defaultAlbumDiveSlot(key, label);
  const slot = { ...base, ...(raw || {}) };
  slot.key = key;
  slot.label = slot.label || label;
  slot.year = slot.year ? Number(slot.year) : null;
  slot.rating = slot.rating ? Number(slot.rating) : null;
  slot.favoriteAlbum = Boolean(slot.favoriteAlbum);
  slot.totalTracks = slot.totalTracks ? Number(slot.totalTracks) : null;
  slot.favoriteSong = { ...base.favoriteSong, ...(slot.favoriteSong || {}) };
  slot.favoriteSong.durationMs = slot.favoriteSong.durationMs
    ? Number(slot.favoriteSong.durationMs)
    : null;
  slot.favoriteSong.trackNumber = slot.favoriteSong.trackNumber
    ? Number(slot.favoriteSong.trackNumber)
    : null;
  slot.favoriteSong.discNumber = slot.favoriteSong.discNumber
    ? Number(slot.favoriteSong.discNumber)
    : null;
  slot.tracks = Array.isArray(slot.tracks)
    ? slot.tracks
        .map(normalizeAlbumDiveTrack)
        .filter((t) => t.title || t.spotifyTrackId || t.spotifyTrackUrl)
    : [];
  slot.standoutTracks = Array.isArray(slot.standoutTracks)
    ? slot.standoutTracks
    : [];
  slot.spawnedSongs = Array.isArray(slot.spawnedSongs) ? slot.spawnedSongs : [];
  return slot;
}

function normalizeAlbumDive(genre, create = false) {
  if (!genre) return null;
  if (!genre.albumDive && !create) return null;
  const existing = genre.albumDive || {};
  const existingSlots = Array.isArray(existing.slots) ? existing.slots : [];
  const byKey = Object.fromEntries(
    existingSlots.map((slot) => [slot?.key, slot]),
  );
  const normalized = {
    enabled: existing.enabled !== false,
    mode: existing.mode || "canon",
    status: existing.status || "not_started",
    summary: existing.summary || "",
    verdict: existing.verdict || "",
    verdictImpact: existing.verdictImpact || "",
    slots: ALBUM_DIVE_SLOT_DEFS.map(([key, label]) =>
      normalizeAlbumDiveSlot(byKey[key], key, label),
    ),
    completedAt: existing.completedAt || "",
    lastWorkedAt: existing.lastWorkedAt || "",
  };
  genre.albumDive = normalized;
  return normalized;
}

function albumDiveEligible(genre) {
  const n = numericRating(genre);
  return n >= 3;
}

function albumDiveProgress(dive) {
  const slots = dive?.slots || [];
  const finished = slots.filter(
    (slot) =>
      slot.listenState === "finished" || slot.listenState === "completed",
  ).length;
  const sampled = slots.filter((slot) => slot.listenState === "sampled").length;
  const fetched = slots.filter(
    (slot) =>
      slot.spotifyAlbumId || slot.albumArt || (slot.tracks || []).length,
  ).length;
  return {
    finished,
    sampled,
    fetched,
    total: slots.length || ALBUM_DIVE_SLOT_DEFS.length,
  };
}

function albumDiveCtaText(genre) {
  const n = numericRating(genre);
  if (n >= 5) return "Build the Shelf";
  if (n === 4) return "Start Canon Dive";
  if (n === 3) return "Interrogate Through Albums";
  return "Start Album Dive";
}

function albumDiveArtUrl(slot) {
  return (
    slot?.albumArt || slot?.manualAlbumArt || slot?.favoriteSong?.albumArt || ""
  );
}

function albumDiveArtHtml(slot) {
  const src = albumDiveArtUrl(slot);
  return src
    ? `<img class="album-slot-art" src="${escapeHtml(src)}" alt="${escapeHtml(slot.album || "Album art")}" loading="lazy">`
    : '<div class="album-slot-art" aria-hidden="true"></div>';
}

const albumDiveAmbientColorCache = new Map();
let albumDiveEditorMode = false;

function albumDiveFallbackAccent(value = "") {
  const palette = [
    [189, 44, 38],
    [211, 129, 32],
    [43, 103, 137],
    [91, 69, 149],
    [41, 115, 82],
    [148, 70, 101],
    [86, 76, 58],
  ];
  let hash = 0;
  String(value || "album")
    .split("")
    .forEach((ch) => {
      hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0;
    });
  return palette[Math.abs(hash) % palette.length];
}

function albumDiveNormalizeAccent(rgb) {
  const [r, g, b] = rgb.map((n) =>
    Math.max(0, Math.min(255, Math.round(Number(n) || 0))),
  );
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  let l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r / 255) h = ((g / 255 - b / 255) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g / 255) h = ((b / 255 - r / 255) / d + 2) / 6;
    else h = ((r / 255 - g / 255) / d + 4) / 6;
  }
  s = Math.max(0.42, Math.min(0.78, s * 1.2));
  l = Math.max(0.34, Math.min(0.54, l));
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  let rr;
  let gg;
  let bb;
  if (s === 0) {
    rr = gg = bb = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    rr = hue2rgb(p, q, h + 1 / 3);
    gg = hue2rgb(p, q, h);
    bb = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(rr * 255), Math.round(gg * 255), Math.round(bb * 255)];
}

function albumDiveExtractAverageColor(src) {
  if (!src) return Promise.resolve(null);
  if (albumDiveAmbientColorCache.has(src))
    return Promise.resolve(albumDiveAmbientColorCache.get(src));
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const size = 28;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;
        let r = 0;
        let g = 0;
        let b = 0;
        let total = 0;
        for (let i = 0; i < data.length; i += 16) {
          const alpha = data[i + 3];
          if (alpha < 180) continue;
          const rr = data[i];
          const gg = data[i + 1];
          const bb = data[i + 2];
          const light = (rr + gg + bb) / 3;
          const chroma = Math.max(rr, gg, bb) - Math.min(rr, gg, bb);
          if (light > 246 || light < 12) continue;
          const weight = 1 + chroma / 90;
          r += rr * weight;
          g += gg * weight;
          b += bb * weight;
          total += weight;
        }
        if (!total) throw new Error("No usable pixels");
        const accent = albumDiveNormalizeAccent([
          r / total,
          g / total,
          b / total,
        ]);
        albumDiveAmbientColorCache.set(src, accent);
        resolve(accent);
      } catch (err) {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function albumDiveSetAmbientVars(rgb) {
  const panel = document.getElementById("albumDivePanel");
  if (!panel || !rgb) return;
  const [r, g, b] = rgb;
  panel.style.setProperty("--album-accent-rgb", `${r}, ${g}, ${b}`);
  panel.style.setProperty("--album-accent", `rgb(${r} ${g} ${b})`);
  panel.classList.add("has-album-accent");
}

function hydrateAlbumDiveAmbient() {
  const panel = document.getElementById("albumDivePanel");
  const dive = normalizeAlbumDive(currentGenre, false);
  if (!panel || !dive?.slots?.length || !albumDiveIsListenMode()) return;
  const selectedKey = getAlbumDiveFocusSlotKey(dive);
  const slot =
    dive.slots.find((item) => item.key === selectedKey) || dive.slots[0];
  const art = albumDiveArtUrl(slot);
  const fallback = albumDiveFallbackAccent(
    `${slot?.album || ""} ${slot?.artist || ""} ${slot?.label || ""}`,
  );
  albumDiveSetAmbientVars(fallback);
  if (!art) return;
  albumDiveExtractAverageColor(art).then((rgb) => {
    const latest = normalizeAlbumDive(currentGenre, false);
    if (!rgb || !latest || getAlbumDiveFocusSlotKey(latest) !== selectedKey)
      return;
    albumDiveSetAmbientVars(rgb);
  });
}

function albumDiveIsListenMode() {
  return (
    document
      .getElementById("screen-listen")
      ?.classList.contains("listen-experience-mode") && !albumDiveEditorMode
  );
}

function setAlbumDiveEditorMode(enabled) {
  albumDiveEditorMode = !!enabled;
  rerenderAlbumDive({ preserveScroll: true });
  setTimeout(() => {
    document
      .getElementById("albumDivePanel")
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, 50);
}

function albumDiveStorageKey() {
  const id = currentGenre?.id || currentGenre?.genre || "default";
  return `dailyGenreAlbumDiveFocusSlot:${id}`;
}

function albumDiveSlotHasContent(slot) {
  const fav = slot?.favoriteSong || {};
  return !!(
    slot?.album ||
    slot?.artist ||
    slot?.albumArt ||
    slot?.manualAlbumArt ||
    slot?.spotifyAlbumUrl ||
    slot?.spotifyUrl ||
    slot?.notes ||
    slot?.rationale ||
    fav.title ||
    (slot?.tracks || []).length
  );
}

function getAlbumDiveFocusSlotKey(dive) {
  const slots = dive?.slots || [];
  if (!slots.length) return "";
  try {
    const saved = localStorage.getItem(albumDiveStorageKey()) || "";
    if (saved && slots.some((slot) => slot.key === saved)) return saved;
  } catch {}
  return (slots.find(albumDiveSlotHasContent) || slots[0]).key;
}

function setAlbumDiveFocusSlot(slotKey) {
  try {
    localStorage.setItem(albumDiveStorageKey(), slotKey || "");
  } catch {}
  rerenderAlbumDive({ preserveScroll: true });
}

function albumDiveReactionEmoji(value) {
  return Number(value) === 3
    ? "👍"
    : Number(value) === 2
      ? "🤷"
      : Number(value) === 1
        ? "👎"
        : "—";
}

function albumDiveReactionLabel(value) {
  return Number(value) === 3
    ? "Up"
    : Number(value) === 2
      ? "Meh"
      : Number(value) === 1
        ? "Down"
        : "Unrated";
}

function albumDiveTrackReactionSummary(slot) {
  const counts = { 3: 0, 2: 0, 1: 0 };
  (slot?.tracks || []).forEach((track) => {
    if ([1, 2, 3].includes(Number(track.reaction)))
      counts[Number(track.reaction)] += 1;
  });
  const rated = counts[1] + counts[2] + counts[3];
  return rated ? ` · 👍 ${counts[3]} · 🤷 ${counts[2]} · 👎 ${counts[1]}` : "";
}

function albumDiveTrackReactionButtons(slotKey, track, compact = false) {
  const trackValue = escapeHtml(albumDiveTrackOptionValue(track));
  return `<div class="album-track-reactions ${compact ? "compact" : ""}" aria-label="Track reaction for ${escapeHtml(track.title || "album track")}">
        ${[3, 2, 1].map((value) => `<button type="button" class="album-track-reaction-btn ${Number(track.reaction) === value ? "active" : ""}" onclick="setAlbumDiveTrackReaction('${escapeHtml(slotKey)}', '${trackValue}', ${value})" title="${albumDiveReactionLabel(value)}" aria-label="${albumDiveReactionLabel(value)}">${albumDiveReactionEmoji(value)}</button>`).join("")}
      </div>`;
}

function renderAlbumDiveTrackReactionRows(slot, safeKey) {
  const tracks = Array.isArray(slot.tracks) ? slot.tracks : [];
  if (!tracks.length)
    return `<div class="album-focus-empty small">Fetch this album first to rate individual tracks.</div>`;
  return `<div class="album-track-reaction-list">
        ${tracks
          .map((track) => {
            const meta = [
              track.trackNumber ? `#${track.trackNumber}` : "",
              track.durationMs ? formatTrackDuration(track.durationMs) : "",
            ]
              .filter(Boolean)
              .join(" · ");
            const href = track.spotifyTrackUrl || "";
            return `<div class="album-track-reaction-row">
            <div class="album-track-reaction-main">
              <div class="album-track-title">${href ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener">${escapeHtml(track.title || "Untitled track")} <span class="song-link-arrow">↗</span></a>` : escapeHtml(track.title || "Untitled track")}</div>
              <div class="album-track-meta">${escapeHtml([track.artist && track.artist !== slot.artist ? track.artist : "", meta].filter(Boolean).join(" · "))}</div>
            </div>
            ${albumDiveTrackReactionButtons(safeKey, track)}
          </div>`;
          })
          .join("")}
      </div>`;
}

function albumDiveSlotIndex(dive, selectedKey) {
  const slots = dive?.slots || [];
  const index = slots.findIndex((slot) => slot.key === selectedKey);
  return index >= 0 ? index : 0;
}

function albumDiveAdjacentSlot(dive, selectedKey, direction) {
  const slots = dive?.slots || [];
  if (!slots.length) return null;
  const index = albumDiveSlotIndex(dive, selectedKey);
  const nextIndex = (index + direction + slots.length) % slots.length;
  return slots[nextIndex] || null;
}

function setAlbumDiveFocusRelative(direction) {
  const dive = normalizeAlbumDive(currentGenre, false);
  if (!dive?.slots?.length) return;
  const currentKey = getAlbumDiveFocusSlotKey(dive);
  const next = albumDiveAdjacentSlot(dive, currentKey, Number(direction) || 0);
  if (next?.key) setAlbumDiveFocusSlot(next.key);
}

function renderAlbumDiveSidePeek(slot, sideLabel) {
  if (!slot)
    return '<div class="album-focus-peek album-focus-peek-empty" aria-hidden="true"></div>';
  const art =
    slot.albumArt || slot.manualAlbumArt || slot.favoriteSong?.albumArt || "";
  const title = slot.album || slot.label;
  const meta = [slot.label, slot.artist].filter(Boolean).join(" · ");
  const state = slot.listenState || "not_started";
  const isFinished = state === "finished" || state === "completed";
  const isSampled = state === "sampled";
  return `<button type="button" class="album-focus-peek ${isFinished ? "finished" : ""} ${isSampled ? "sampled" : ""} ${slot.favoriteAlbum ? "favorite-album" : ""}" onclick="setAlbumDiveFocusSlot('${escapeHtml(slot.key)}')" title="${escapeHtml(sideLabel)}: ${escapeHtml(title)}">
        <span class="album-focus-peek-direction">${escapeHtml(sideLabel)}</span>
        ${art ? `<img src="${escapeHtml(art)}" alt="${escapeHtml(title)} cover" loading="lazy">` : '<span class="album-rail-placeholder"></span>'}
        ${slot.favoriteAlbum ? '<span class="album-favorite-marker" title="Favorite album">🏆</span>' : ""}
        <span class="album-focus-peek-title">${escapeHtml(title)}</span>
        ${meta ? `<span class="album-focus-peek-meta">${escapeHtml(meta)}</span>` : ""}
      </button>`;
}

function renderAlbumDiveFocusRail(dive, selectedKey) {
  return `<div class="album-focus-rail" role="list" aria-label="Album Dive shelf">
        ${(dive?.slots || [])
          .map((slot) => {
            const art =
              slot.albumArt ||
              slot.manualAlbumArt ||
              slot.favoriteSong?.albumArt ||
              "";
            const label = slot.album || slot.label;
            const isActive = slot.key === selectedKey;
            const isFinished =
              slot.listenState === "finished" ||
              slot.listenState === "completed";
            const isSampled = slot.listenState === "sampled";
            const hasRating = Number(slot.rating) > 0;
            return `<button type="button" role="listitem" class="album-rail-card ${isActive ? "active" : ""} ${isFinished ? "finished" : ""} ${isSampled ? "sampled" : ""} ${hasRating ? "has-rating" : ""} ${slot.favoriteAlbum ? "favorite-album" : ""}" onclick="setAlbumDiveFocusSlot('${escapeHtml(slot.key)}')" title="${escapeHtml(label)}">
            ${art ? `<img src="${escapeHtml(art)}" alt="${escapeHtml(label)} cover" loading="lazy">` : '<span class="album-rail-placeholder"></span>'}
            <span>${escapeHtml(slot.label)}</span>
            <em class="album-rail-status-dot" aria-hidden="true"></em>
            ${slot.favoriteAlbum ? '<span class="album-rail-trophy" title="Favorite album">🏆</span>' : ""}
            ${hasRating ? `<strong>${slot.rating}</strong>` : ""}
          </button>`;
          })
          .join("")}
      </div>`;
}

function renderAlbumDiveFocusPanel(dive) {
  const selectedKey = getAlbumDiveFocusSlotKey(dive);
  const slot =
    (dive.slots || []).find((item) => item.key === selectedKey) ||
    dive.slots[0];
  if (!slot) return "";
  const prevSlot = albumDiveAdjacentSlot(dive, slot.key, -1);
  const nextSlot = albumDiveAdjacentSlot(dive, slot.key, 1);
  const safeKey = escapeHtml(slot.key);
  const state = slot.listenState || "not_started";
  const fav = slot.favoriteSong || {};
  const albumUrl = String(slot.spotifyAlbumUrl || slot.spotifyUrl || "").trim();
  const displayTitle = slot.album || "Paste a Spotify album URL";
  const displaySub = [
    slot.artist,
    slot.year || (slot.releaseDate ? String(slot.releaseDate).slice(0, 4) : ""),
    slot.totalTracks ? `${slot.totalTracks} tracks` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const ratingButtons = [1, 2, 3, 4, 5]
    .map(
      (n) =>
        `<button type="button" class="album-star-btn ${Number(slot.rating) === n ? "active" : ""}" onclick="setAlbumDiveSlotRating('${safeKey}', ${n})" title="${n} star album rating">${n}</button>`,
    )
    .join("");
  const favoriteLabel = fav.title
    ? `${fav.artist ? `${fav.artist} — ` : ""}${fav.title}`
    : "";
  const listenStateSelect = `<select onchange="updateAlbumDiveSlotField('${safeKey}', 'listenState', this.value)">
        ${[
          ["not_started", "Not started"],
          ["sampled", "Sampled"],
          ["finished", "Finished"],
        ]
          .map(
            ([value, label]) =>
              `<option value="${value}" ${state === value ? "selected" : ""}>${label}</option>`,
          )
          .join("")}
      </select>`;
  const trackSummary = albumDiveTrackReactionSummary(slot);
  const manualMetadataDetails = `<details class="album-focus-edit-details">
        <summary>Manual metadata / fallback art</summary>
        <div class="album-slot-title" style="margin-top:8px;">
          <input type="text" value="${escapeHtml(slot.album || "")}" placeholder="Album title" oninput="updateAlbumDiveSlotField('${safeKey}', 'album', this.value)">
          <input type="number" value="${slot.year || ""}" placeholder="Year" oninput="updateAlbumDiveSlotField('${safeKey}', 'year', this.value)">
        </div>
        <div class="album-slot-minirow" style="margin-top:8px;">
          <input type="text" value="${escapeHtml(slot.artist || "")}" placeholder="Artist" oninput="updateAlbumDiveSlotField('${safeKey}', 'artist', this.value)">
          <input type="url" value="${escapeHtml(slot.manualAlbumArt || "")}" placeholder="Manual album art URL" onchange="updateAlbumDiveSlotField('${safeKey}', 'manualAlbumArt', this.value)">
        </div>
      </details>`;
  return `<div class="album-focus-view">
        <div class="album-focus-carousel" aria-label="Focused Album Dive carousel">
          <button type="button" class="album-focus-nav album-focus-prev" onclick="setAlbumDiveFocusRelative(-1)" aria-label="Previous Album Dive slot">‹</button>
          ${renderAlbumDiveSidePeek(prevSlot, "Previous")}
          <div class="album-focus-hero">
            <div class="album-focus-art-wrap">${albumDiveArtHtml(slot)}</div>
            <div class="album-focus-main">
              <div class="album-focus-topline">
                <span class="album-focus-label">${escapeHtml(slot.label)}</span>
                ${state === "not_started" ? "" : `<span class="album-focus-state ${escapeHtml(state)}">${escapeHtml(state.replaceAll("_", " "))}</span>`}
              </div>
              <h4 class="album-focus-title">${albumUrl ? `<a href="${escapeHtml(albumUrl)}" target="_blank" rel="noopener">${escapeHtml(displayTitle)} <span class="song-link-arrow">↗</span></a>` : escapeHtml(displayTitle)}</h4>
              ${displaySub ? `<div class="album-focus-sub">${escapeHtml(displaySub)}</div>` : ""}
              ${slot.rationale ? `<p class="album-focus-rationale">${escapeHtml(slot.rationale)}</p>` : ""}
              ${slot.rationale ? `<button type="button" class="album-focus-readmore" onclick="toggleAlbumDiveFocusDetails('${safeKey}', true)">Read full context</button>` : ""}
              <div class="album-focus-actions">
                <div class="album-focus-rating"><span>Album</span><div class="album-stars album-stars-compact">${ratingButtons}</div></div>
                <button type="button" class="album-focus-trophy ${slot.favoriteAlbum ? "active" : ""}" onclick="setAlbumDiveFavoriteAlbum('${safeKey}')" title="${slot.favoriteAlbum ? "Remove favorite album" : "Mark as favorite album"}" aria-label="${slot.favoriteAlbum ? "Remove favorite album" : "Mark as favorite album"}">🏆</button>
                ${albumUrl ? `<a class="btn btn-secondary btn-tiny" href="${escapeHtml(albumUrl)}" target="_blank" rel="noopener">Open Spotify</a>` : ""}
                <button type="button" class="btn btn-secondary btn-tiny album-focus-details-button" onclick="toggleAlbumDiveFocusDetails('${safeKey}')">Details</button>
              </div>
              ${favoriteLabel ? `<div class="album-focus-favorite"><strong>Favorite:</strong> ${escapeHtml(favoriteLabel)}</div>` : ""}
              ${slot.notes ? `<div class="album-focus-note">${escapeHtml(slot.notes)}</div>` : ""}
            </div>
          </div>
          ${renderAlbumDiveSidePeek(nextSlot, "Next")}
          <button type="button" class="album-focus-nav album-focus-next" onclick="setAlbumDiveFocusRelative(1)" aria-label="Next Album Dive slot">›</button>
        </div>
        <details class="album-focus-detail-drawer" id="album-focus-details-${safeKey}">
          <summary>Album details, notes, and favorite track</summary>
          <div class="album-focus-detail-grid">
            <section class="album-focus-detail-section album-focus-context-section">
              <h5>Why this album fits</h5>
              <p class="album-focus-full-rationale">${slot.rationale ? escapeHtml(slot.rationale) : "No album context added yet."}</p>
              <label>Update context</label>
              <textarea placeholder="Why this album fits this slot" oninput="updateAlbumDiveSlotField('${safeKey}', 'rationale', this.value)">${escapeHtml(slot.rationale || "")}</textarea>
            </section>
            <section class="album-focus-detail-section">
              <h5>Listening state</h5>
              <div class="album-slot-meta album-focus-state-editor">${listenStateSelect}<div class="album-stars">${ratingButtons}</div></div>
              <label>Album notes</label>
              <textarea placeholder="Album notes / standout tracks / alternate picks" oninput="updateAlbumDiveSlotField('${safeKey}', 'notes', this.value)">${escapeHtml(slot.notes || "")}</textarea>
            </section>
            <section class="album-focus-detail-section">
              <h5>Favorite song from this album</h5>
              <div class="album-slot-favorite album-focus-favorite-editor">
                ${renderAlbumDiveFavoritePicker(slot, safeKey)}
                <textarea placeholder="Why this song won the album" oninput="updateAlbumDiveFavoriteField('${safeKey}', 'note', this.value)">${escapeHtml(fav.note || "")}</textarea>
                <div class="album-fav-actions">
                  ${fav.spotifyTrackUrl ? `<button type="button" class="btn btn-secondary btn-tiny" onclick="fetchAlbumDiveFavoriteMetadata('${safeKey}', this)">Refresh Track Info</button>` : ""}
                  <button type="button" class="btn btn-primary btn-tiny" onclick="promoteAlbumDiveFavorite('${safeKey}')">Add Favorite to Song Log</button>
                  ${fav.promotedToSongLog ? '<span class="tag">Promoted</span>' : ""}
                </div>
              </div>
            </section>
          </div>
          ${manualMetadataDetails}
        </details>
        <div class="album-focus-tracks">
          <details open>
            <summary><span>Track reactions</span><small>from ${escapeHtml(displayTitle)}${trackSummary}</small></summary>
            ${renderAlbumDiveTrackReactionRows(slot, safeKey)}
          </details>
        </div>
        ${renderAlbumDiveFocusRail(dive, selectedKey)}
      </div>`;
}

function toggleAlbumDiveFocusDetails(slotKey, forceOpen = false) {
  const drawer = document.getElementById(`album-focus-details-${slotKey}`);
  if (!drawer) return;
  drawer.open = forceOpen ? true : !drawer.open;
  if (drawer.open) {
    requestAnimationFrame(() =>
      drawer.scrollIntoView({ behavior: "smooth", block: "nearest" }),
    );
  }
}

function renderAlbumDivePanel(genre) {
  const dive = normalizeAlbumDive(genre, false);
  const eligible = albumDiveEligible(genre);
  if (!dive) {
    return `<div class="panel album-dive-panel"><div class="album-dive-head"><div><div class="eyebrow">Album Dive</div><h3 class="album-dive-title">Deepen this genre through records</h3><p class="small">Paste structured album JSON or Spotify album URLs, fetch cover art and track lists, choose a favorite song from each album, and promote favorites back into the main song log.</p></div><div class="album-dive-actions"><button type="button" class="btn btn-primary" onclick="startAlbumDive()">${escapeHtml(albumDiveCtaText(genre))}</button></div></div>${albumDiveJsonImportMarkup('albumDiveJsonImportStart')}${eligible ? "" : '<div class="album-dive-empty small">Tip: this works best after you rate a genre 3, 4, or 5 stars, but you can start a dive any time.</div>'}</div>`;
  }
  const progress = albumDiveProgress(dive);
  const listenMode = albumDiveIsListenMode();
  if (listenMode) setTimeout(hydrateAlbumDiveAmbient, 0);
  return `<div class="panel album-dive-panel ${listenMode ? "album-dive-focus-panel" : ""}" id="albumDivePanel">
        <div class="album-dive-head">
          <div>
            <div class="eyebrow">Album Dive</div>
            <h3 class="album-dive-title">Canonical album shelf</h3>
            <div class="status-row">
              <span class="tag">${escapeHtml(dive.mode || "canon")} dive</span>
              <span class="tag">${progress.fetched}/${progress.total} fetched</span>
              <span class="tag">${progress.finished}/${progress.total} finished</span>
              ${progress.sampled ? `<span class="tag">${progress.sampled} sampled</span>` : ""}
              ${dive.status === "completed" ? '<span class="tag">Dive complete</span>' : '<span class="tag">In progress</span>'}
            </div>
          </div>
          <div class="album-dive-actions">
            <button type="button" class="btn btn-primary" onclick="saveLibraryUpdates()">${listenMode ? "Save" : "Save Album Dive"}</button>
            <button type="button" class="btn btn-secondary" onclick="markAlbumDiveComplete()">${listenMode ? "Finish Dive" : "Mark Dive Complete"}</button>
            <button type="button" class="btn btn-secondary" onclick="setAlbumDiveEditorMode(${listenMode ? "true" : "false"})">${listenMode ? "Edit Dive" : "Carousel View"}</button>
            <button type="button" class="btn btn-ghost album-dive-remove-btn" onclick="clearAlbumDive()">Remove Dive</button>
          </div>
        </div>
        <div class="album-dive-summary">
          <label for="albumDiveSummary">What this dive is testing</label>
          <textarea id="albumDiveSummary" placeholder="Example: Jazz rap fuses MC-driven boom-bap with jazz harmony, samples, and instrumentation." oninput="updateAlbumDiveRootField('summary', this.value)">${escapeHtml(dive.summary || "")}</textarea>
        </div>
        ${listenMode ? "" : albumDiveJsonImportMarkup('albumDiveJsonImport')}
        ${listenMode ? renderAlbumDiveFocusPanel(dive) : `<div class="album-dive-grid">${dive.slots.map(renderAlbumDiveSlot).join("")}</div>`}
        <div class="album-dive-verdict">
          <div class="album-dive-verdict-grid">
            <div>
              <label for="albumDiveVerdictImpact">Verdict impact</label>
              <select id="albumDiveVerdictImpact" onchange="updateAlbumDiveRootField('verdictImpact', this.value)">
                ${["", "reinforced", "complicated", "weakened"].map((value) => `<option value="${value}" ${String(dive.verdictImpact || "") === value ? "selected" : ""}>${value ? value[0].toUpperCase() + value.slice(1) : "Choose…"}</option>`).join("")}
              </select>
            </div>
            <div>
              <label for="albumDiveVerdict">Final dive verdict</label>
              <textarea id="albumDiveVerdict" placeholder="Did the album dive strengthen, complicate, or weaken your original rating?" oninput="updateAlbumDiveRootField('verdict', this.value)">${escapeHtml(dive.verdict || "")}</textarea>
            </div>
          </div>
        </div>
      </div>`;
}

function albumDiveTrackOptionValue(track) {
  return (
    track.spotifyTrackId ||
    track.spotifyTrackUrl ||
    `${track.discNumber || 1}:${track.trackNumber || ""}:${track.title}`
  );
}

function renderAlbumDiveFavoritePicker(slot, safeKey) {
  const fav = slot.favoriteSong || {};
  const tracks = Array.isArray(slot.tracks) ? slot.tracks : [];
  const selected = fav.spotifyTrackId || fav.spotifyTrackUrl || "";
  if (!tracks.length) {
    return `<div class="small">Fetch the Spotify album first to choose from its real track list.</div>
          <div class="album-slot-minirow">
            <input type="text" value="${escapeHtml(fav.title || "")}" placeholder="Favorite song title" oninput="updateAlbumDiveFavoriteField('${safeKey}', 'title', this.value)">
            <input type="text" value="${escapeHtml(fav.artist || "")}" placeholder="Artist" oninput="updateAlbumDiveFavoriteField('${safeKey}', 'artist', this.value)">
          </div>
          <input type="url" value="${escapeHtml(fav.spotifyTrackUrl || "")}" placeholder="Spotify track URL for favorite song" onchange="updateAlbumDiveFavoriteField('${safeKey}', 'spotifyTrackUrl', this.value)">`;
  }
  return `<div class="album-track-select-row">
        <select onchange="setAlbumDiveFavoriteFromTrack('${safeKey}', this.value)">
          <option value="">Choose favorite from ${tracks.length} track${tracks.length === 1 ? "" : "s"}…</option>
          ${tracks
            .map((track) => {
              const value = albumDiveTrackOptionValue(track);
              const isSelected =
                selected &&
                (selected === track.spotifyTrackId ||
                  selected === track.spotifyTrackUrl ||
                  selected === value);
              const prefix = [
                track.discNumber && track.discNumber > 1
                  ? `D${track.discNumber}`
                  : "",
                track.trackNumber ? `#${track.trackNumber}` : "",
              ]
                .filter(Boolean)
                .join(" ");
              return `<option value="${escapeHtml(value)}" ${isSelected ? "selected" : ""}>${escapeHtml(`${prefix ? `${prefix} — ` : ""}${track.title}${track.artist ? ` — ${track.artist}` : ""}`)}</option>`;
            })
            .join("")}
        </select>
        ${fav.spotifyTrackUrl ? `<a class="btn btn-secondary btn-tiny" href="${escapeHtml(fav.spotifyTrackUrl)}" target="_blank" rel="noopener">Open</a>` : ""}
      </div>
      ${fav.title ? `<div class="small"><strong>Favorite:</strong> ${escapeHtml(fav.artist ? `${fav.artist} — ${fav.title}` : fav.title)}</div>` : ""}`;
}

function renderAlbumDiveSlot(slot) {
  const albumUrl = String(slot.spotifyAlbumUrl || slot.spotifyUrl || "").trim();
  const state = slot.listenState || "not_started";
  const fav = slot.favoriteSong || {};
  const safeKey = escapeHtml(slot.key);
  const displayTitle = slot.album || "Paste a Spotify album URL";
  const displaySub = [
    slot.artist,
    slot.year || (slot.releaseDate ? String(slot.releaseDate).slice(0, 4) : ""),
    slot.totalTracks ? `${slot.totalTracks} tracks` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const hasAlbumContent = !!(
    slot.album ||
    slot.artist ||
    slot.albumArt ||
    slot.manualAlbumArt ||
    albumUrl ||
    slot.notes ||
    slot.rationale ||
    fav.title
  );
  const favoriteLabel = fav.title
    ? `${fav.artist ? `${fav.artist} — ` : ""}${fav.title}`
    : "—";
  const notePreview = slot.notes || fav.note || "";
  const ratingButtons = [1, 2, 3, 4, 5]
    .map(
      (n) =>
        `<button type="button" class="album-star-btn ${Number(slot.rating) === n ? "active" : ""}" onclick="setAlbumDiveSlotRating('${safeKey}', ${n})" title="${n} star album rating">${n}</button>`,
    )
    .join("");
  const listenStateSelect = `<select onchange="updateAlbumDiveSlotField('${safeKey}', 'listenState', this.value)">
              ${[
                ["not_started", "Not started"],
                ["sampled", "Sampled"],
                ["finished", "Finished"],
              ]
                .map(
                  ([value, label]) =>
                    `<option value="${value}" ${state === value ? "selected" : ""}>${label}</option>`,
                )
                .join("")}
            </select>`;
  const manualMetadataDetails = `<details>
            <summary>Edit manual metadata / fallback art</summary>
            <div class="album-slot-title" style="margin-top:8px;">
              <input type="text" value="${escapeHtml(slot.album || "")}" placeholder="Album title" oninput="updateAlbumDiveSlotField('${safeKey}', 'album', this.value)">
              <input type="number" value="${slot.year || ""}" placeholder="Year" oninput="updateAlbumDiveSlotField('${safeKey}', 'year', this.value)">
            </div>
            <div class="album-slot-minirow" style="margin-top:8px;">
              <input type="text" value="${escapeHtml(slot.artist || "")}" placeholder="Artist" oninput="updateAlbumDiveSlotField('${safeKey}', 'artist', this.value)">
              <input type="url" value="${escapeHtml(slot.manualAlbumArt || "")}" placeholder="Manual album art URL" onchange="updateAlbumDiveSlotField('${safeKey}', 'manualAlbumArt', this.value)">
            </div>
          </details>`;
  const favoriteBlock = `<div class="album-slot-favorite">
            <h4>Favorite song from this album</h4>
            ${renderAlbumDiveFavoritePicker(slot, safeKey)}
            <textarea placeholder="Why this song won the album" oninput="updateAlbumDiveFavoriteField('${safeKey}', 'note', this.value)">${escapeHtml(fav.note || "")}</textarea>
            <div class="album-fav-actions">
              ${fav.spotifyTrackUrl ? `<button type="button" class="btn btn-secondary btn-tiny" onclick="fetchAlbumDiveFavoriteMetadata('${safeKey}', this)">Refresh Track Info</button>` : ""}
              <button type="button" class="btn btn-primary btn-tiny" onclick="promoteAlbumDiveFavorite('${safeKey}')">Add Favorite to Song Log</button>
              ${fav.promotedToSongLog ? '<span class="tag">Promoted</span>' : ""}
            </div>
          </div>`;

  return `<div class="album-slot-card ${hasAlbumContent ? "has-album-content" : "album-slot-empty"}" data-album-slot="${safeKey}">
        ${albumDiveArtHtml(slot)}
        <div class="album-slot-main">
          <div class="album-slot-kicker"><span class="album-slot-label">${escapeHtml(slot.label)}</span><span class="tag">${escapeHtml(state.replaceAll("_", " "))}</span></div>
          <div>
            ${
              albumUrl
                ? `<a class="album-slot-display-title album-slot-link" href="${escapeHtml(albumUrl)}" target="_blank" rel="noopener">${escapeHtml(displayTitle)} <span class="song-link-arrow">↗</span></a>`
                : `<div class="album-slot-display-title">${escapeHtml(displayTitle)}</div>`
            }
            ${displaySub ? `<div class="album-slot-display-sub">${escapeHtml(displaySub)}</div>` : ""}
          </div>

          <div class="album-listen-quick">
            <div class="album-listen-minirow">
              <span class="album-listen-state">${escapeHtml(state.replaceAll("_", " "))}</span>
              <div class="album-stars album-stars-compact" aria-label="Album rating">${ratingButtons}</div>
            </div>
            <div class="album-listen-favorite"><strong>Favorite:</strong> ${escapeHtml(favoriteLabel)}</div>
            ${notePreview ? `<div class="album-listen-note-preview">${escapeHtml(notePreview)}</div>` : ""}
            <details class="album-listen-expand">
              <summary>Notes / Favorite / Edit</summary>
              <div class="album-listen-expand-body">
                <div class="album-slot-meta">
                  ${listenStateSelect}
                  <div class="album-stars" aria-label="Album rating">${ratingButtons}</div>
                </div>
                <label>Why this album fits this slot</label>
                <textarea placeholder="Why this album fits this slot" oninput="updateAlbumDiveSlotField('${safeKey}', 'rationale', this.value)">${escapeHtml(slot.rationale || "")}</textarea>
                ${favoriteBlock}
                <label>Album notes</label>
                <textarea placeholder="Album notes / standout tracks / alternate picks" oninput="updateAlbumDiveSlotField('${safeKey}', 'notes', this.value)">${escapeHtml(slot.notes || "")}</textarea>
                ${manualMetadataDetails}
              </div>
            </details>
          </div>

          <div class="album-build-controls">
            <div class="album-fetch-row">
              <input type="url" value="${escapeHtml(slot.spotifyAlbumUrl || slot.spotifyUrl || "")}" placeholder="Paste Spotify album URL" onchange="updateAlbumDiveSlotField('${safeKey}', 'spotifyAlbumUrl', this.value)">
              <button type="button" class="btn btn-primary btn-tiny" onclick="fetchAlbumDiveAlbumMetadata('${safeKey}', this)">Fetch Album + Tracks</button>
            </div>
            <div class="album-slot-meta">
              ${listenStateSelect}
              <div class="album-stars" aria-label="Album rating">${ratingButtons}</div>
            </div>
            <textarea placeholder="Why this album fits this slot" oninput="updateAlbumDiveSlotField('${safeKey}', 'rationale', this.value)">${escapeHtml(slot.rationale || "")}</textarea>
            ${favoriteBlock}
            ${manualMetadataDetails}
            <textarea placeholder="Album notes / standout tracks / alternate picks" oninput="updateAlbumDiveSlotField('${safeKey}', 'notes', this.value)">${escapeHtml(slot.notes || "")}</textarea>
          </div>
        </div>
      </div>`;
}


function albumDiveSlotKeyFromType(type = "", used = new Set()) {
  const cleaned = String(type || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  const direct = {
    breakout: "breakout",
    originator: "originator",
    proto: "originator",
    archetype: "archetype",
    consensus: "consensus",
    popular: "popular",
    mainstream: "popular",
    purist: "purist",
    cult: "cult_hit",
    cult_hit: "cult_hit",
    cult_classic: "cult_hit",
    modern: "modern",
    revival: "revival",
    newcomer: "revival",
    revival_newcomer: "revival",
    wave: "wave",
  };
  let key = direct[cleaned] || (cleaned.includes("cult") ? "cult_hit" : "");
  if (!key && cleaned.includes("revival")) key = "revival";
  if (!key && cleaned.includes("newcomer")) key = "revival";
  if (!key && cleaned.includes("popular")) key = "popular";
  if (!key && cleaned.includes("modern")) key = "modern";
  if (key && !used.has(key)) return key;
  if ((key === "revival" || cleaned.includes("revival") || cleaned.includes("newcomer")) && !used.has("wave")) return "wave";
  const open = ALBUM_DIVE_SLOT_DEFS.find(([candidate]) => !used.has(candidate));
  return open ? open[0] : key || "wave";
}

function normalizedAlbumDiveImportRows(raw) {
  const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  const rows = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.albums)
      ? parsed.albums
      : Array.isArray(parsed?.albumDive)
        ? parsed.albumDive
        : Array.isArray(parsed?.slots)
          ? parsed.slots
          : [];
  if (!rows.length) throw new Error("JSON must be an array or include an albums/slots array.");
  return rows.filter((row) => row && typeof row === "object");
}

function importAlbumDiveJson(inputId = "albumDiveJsonImport") {
  if (!currentGenre) return;
  const input = document.getElementById(inputId);
  const raw = input?.value || "";
  if (!raw.trim()) {
    showSaveToast("Paste album JSON first.", true);
    return;
  }
  let rows = [];
  try {
    rows = normalizedAlbumDiveImportRows(raw);
  } catch (err) {
    showSaveToast(`Album JSON import failed: ${err?.message || "Invalid JSON"}`, true);
    return;
  }
  const dive = normalizeAlbumDive(currentGenre, true);
  dive.enabled = true;
  dive.status = dive.status === "not_started" ? "active" : dive.status;
  const used = new Set();
  let imported = 0;
  rows.forEach((row) => {
    const key = albumDiveSlotKeyFromType(row.type || row.category || row.slot || row.label, used);
    const slot = dive.slots.find((item) => item.key === key);
    if (!slot) return;
    used.add(key);
    const spotifyUrl = String(row.spotify_url || row.spotifyAlbumUrl || row.spotifyUrl || row.url || "").trim();
    slot.album = albumDiveCleanPastedRefs(row.album || row.title || row.name || slot.album || "");
    slot.artist = albumDiveCleanPastedRefs(row.artist || row.album_artist || row.albumArtist || slot.artist || "");
    slot.year = row.year ? Number(row.year) || slot.year || null : slot.year || null;
    slot.releaseDate = albumDiveCleanPastedRefs(row.release_date || row.releaseDate || slot.releaseDate || "");
    slot.rationale = albumDiveCleanPastedRefs(row.reason || row.rationale || row.description || slot.rationale || "");
    slot.notes = albumDiveCleanPastedRefs(row.notes || slot.notes || "");
    slot.spotifyAlbumUrl = spotifyUrl || slot.spotifyAlbumUrl || slot.spotifyUrl || "";
    slot.spotifyUrl = spotifyUrl || slot.spotifyUrl || slot.spotifyAlbumUrl || "";
    slot.spotifyAlbumId = spotifyIdFromUrl(slot.spotifyAlbumUrl || slot.spotifyUrl, "album") || slot.spotifyAlbumId || "";
    slot.albumArt = row.albumArt || row.album_art || row.artwork || row.cover || slot.albumArt || "";
    slot.manualAlbumArt = row.manualAlbumArt || row.manual_album_art || slot.manualAlbumArt || "";
    if (row.favorite_song || row.favoriteSong) {
      const favRaw = row.favorite_song || row.favoriteSong || {};
      slot.favoriteSong = { ...defaultAlbumDiveSlot(slot.key, slot.label).favoriteSong, ...(slot.favoriteSong || {}) };
      if (typeof favRaw === "string") slot.favoriteSong.title = albumDiveCleanPastedRefs(favRaw);
      else {
        slot.favoriteSong.title = albumDiveCleanPastedRefs(favRaw.title || favRaw.name || slot.favoriteSong.title || "");
        slot.favoriteSong.artist = albumDiveCleanPastedRefs(favRaw.artist || slot.favoriteSong.artist || slot.artist || "");
        slot.favoriteSong.spotifyTrackUrl = String(favRaw.spotify_url || favRaw.spotifyTrackUrl || favRaw.spotifyUrl || favRaw.url || slot.favoriteSong.spotifyTrackUrl || "").trim();
        slot.favoriteSong.note = albumDiveCleanPastedRefs(favRaw.reason || favRaw.note || slot.favoriteSong.note || "");
      }
    }
    imported += 1;
  });
  touchAlbumDive();
  rerenderAlbumDive({ preserveScroll: true });
  showSaveToast(`Imported ${imported} album${imported === 1 ? "" : "s"} into Album Dive — fetch Spotify metadata next, then save.`, false);
}

function getAlbumDiveSlot(slotKey) {
  const dive = normalizeAlbumDive(currentGenre, true);
  return dive?.slots?.find((slot) => slot.key === slotKey) || null;
}

function touchAlbumDive() {
  const dive = normalizeAlbumDive(currentGenre, true);
  if (!dive) return;

  dive.lastWorkedAt = new Date().toISOString();
  if (dive.status === "not_started") dive.status = "active";

  if (typeof markListeningUpdatePending === "function") {
    markListeningUpdatePending();
  } else {
    libraryUpdatesPending = true;
    setUnsavedState(true);
    toggleLibrarySaveButton(true);
  }
}

function rerenderAlbumDive(options = {}) {
  if (!currentGenre) return;
  const shouldPreserve = !!options.preserveScroll;
  const scrollX = window.scrollX || window.pageXOffset || 0;
  const scrollY = window.scrollY || window.pageYOffset || 0;
  const restoreScroll = () => {
    if (!shouldPreserve) return;
    window.scrollTo(scrollX, scrollY);
  };
  const panel = document.getElementById("albumDivePanel");
  if (panel) {
    panel.outerHTML = renderAlbumDivePanel(currentGenre);
    requestAnimationFrame(() => {
      hydrateAlbumDiveAmbient();
      restoreScroll();
    });
    setTimeout(restoreScroll, 0);
  } else {
    loadListenScreen(currentGenre, {
      preserveDirty: true,
      skipSpotifyHydration: true,
    });
    requestAnimationFrame(restoreScroll);
  }
}

function startAlbumDive() {
  if (!currentGenre) return;
  const dive = normalizeAlbumDive(currentGenre, true);
  dive.enabled = true;
  dive.status = "active";
  dive.lastWorkedAt = new Date().toISOString();
  albumDiveEditorMode = true;
  touchAlbumDive();
  loadListenScreen(currentGenre, {
    preserveDirty: true,
    skipSpotifyHydration: true,
  });
  showSaveToast("Album Dive started — save changes to keep it.", false);
}

function clearAlbumDive() {
  if (!currentGenre) return;
  if (!confirm("Remove the Album Dive from this genre?")) return;
  delete currentGenre.albumDive;
  if (typeof markListeningUpdatePending === "function") {
    markListeningUpdatePending();
  } else {
    libraryUpdatesPending = true;
    setUnsavedState(true);
    toggleLibrarySaveButton(true);
  }
  loadListenScreen(currentGenre, {
    preserveDirty: true,
    skipSpotifyHydration: true,
  });
}

function markAlbumDiveComplete() {
  const dive = normalizeAlbumDive(currentGenre, true);
  dive.status = "completed";
  dive.completedAt = new Date().toISOString();
  touchAlbumDive();
  rerenderAlbumDive();
}

function updateAlbumDiveRootField(field, value) {
  const dive = normalizeAlbumDive(currentGenre, true);
  if (!dive) return;
  dive[field] = value;
  touchAlbumDive();
}

function updateAlbumDiveSlotField(slotKey, field, value) {
  const slot = getAlbumDiveSlot(slotKey);
  if (!slot) return;
  slot[field] = field === "year" ? (value ? Number(value) : null) : value;
  if (field === "manualAlbumArt" && value && !slot.albumArt)
    slot.albumArt = value;
  touchAlbumDive();
}

function updateAlbumDiveFavoriteField(slotKey, field, value) {
  const slot = getAlbumDiveSlot(slotKey);
  if (!slot) return;
  slot.favoriteSong =
    slot.favoriteSong ||
    defaultAlbumDiveSlot(slot.key, slot.label).favoriteSong;
  slot.favoriteSong[field] = value;
  touchAlbumDive();
}

function setAlbumDiveSlotRating(slotKey, rating) {
  const slot = getAlbumDiveSlot(slotKey);
  if (!slot) return;
  slot.rating = Number(slot.rating) === Number(rating) ? null : Number(rating);
  touchAlbumDive();
  rerenderAlbumDive();
}

function setAlbumDiveFavoriteAlbum(slotKey) {
  const dive = normalizeAlbumDive(currentGenre, true);
  if (!dive?.slots?.length) return;
  const slot = dive.slots.find((item) => item.key === slotKey);
  if (!slot) return;
  const next = !slot.favoriteAlbum;
  dive.slots.forEach((item) => {
    item.favoriteAlbum = false;
  });
  slot.favoriteAlbum = next;
  touchAlbumDive();
  rerenderAlbumDive();
}

function spotifyIdFromUrl(url = "", type = "album") {
  const value = String(url || "").trim();
  const uriMatch = value.match(
    new RegExp(`spotify:${type}:([A-Za-z0-9]+)`, "i"),
  );
  if (uriMatch) return uriMatch[1];
  const webMatch = value.match(
    new RegExp(`open\.spotify\.com/${type}/([A-Za-z0-9]+)`, "i"),
  );
  return webMatch ? webMatch[1] : "";
}

async function fetchSpotifyAlbumOembed(url) {
  const albumUrl = String(url || "").trim();
  if (!/open\.spotify\.com\/album\//i.test(albumUrl)) return null;
  return fetch(
    `https://open.spotify.com/oembed?url=${encodeURIComponent(albumUrl)}`,
  )
    .then(async (response) => (response.ok ? response.json() : null))
    .catch(() => null);
}

function spotifyAlbumTrackToDiveTrack(item, albumArtist = "") {
  const artists = (item?.artists || []).map((a) => a.name).filter(Boolean);
  return normalizeAlbumDiveTrack({
    title: item?.name || "",
    artist: artists.join(", ") || albumArtist,
    artists,
    spotifyTrackUrl: item?.external_urls?.spotify || "",
    spotifyTrackId: item?.id || "",
    durationMs: item?.duration_ms || null,
    trackNumber: item?.track_number || null,
    discNumber: item?.disc_number || null,
  });
}

async function fetchAllSpotifyAlbumTracks(
  albumId,
  firstPage,
  albumArtist = "",
) {
  const tracks = [];
  let page = firstPage || null;
  if (Array.isArray(page?.items))
    tracks.push(
      ...page.items.map((item) =>
        spotifyAlbumTrackToDiveTrack(item, albumArtist),
      ),
    );
  let nextUrl = page?.next || "";
  let guard = 0;
  while (nextUrl && guard < 12) {
    guard += 1;
    const res = await spotifyApiFetch(nextUrl);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) break;
    if (Array.isArray(data.items))
      tracks.push(
        ...data.items.map((item) =>
          spotifyAlbumTrackToDiveTrack(item, albumArtist),
        ),
      );
    nextUrl = data.next || "";
  }
  return tracks.filter(
    (track) => track.title || track.spotifyTrackId || track.spotifyTrackUrl,
  );
}

async function fetchAlbumDiveAlbumMetadata(slotKey, button) {
  const slot = getAlbumDiveSlot(slotKey);
  if (!slot) return;
  const originalText = button?.textContent || "";
  try {
    if (button) {
      button.disabled = true;
      button.textContent = "Fetching…";
    }
    const albumId = spotifyIdFromUrl(
      slot.spotifyAlbumUrl || slot.spotifyUrl,
      "album",
    );
    let updated = false;
    if (albumId && spotifySession?.access_token) {
      const response = await spotifyApiFetch(
        `albums/${encodeURIComponent(albumId)}`,
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          data?.error?.message ||
            data?.error ||
            `Spotify album lookup failed (${response.status}).`,
        );
      if (data?.id) {
        const albumArtist = (data.artists || [])
          .map((a) => a.name)
          .filter(Boolean)
          .join(", ");
        slot.spotifyAlbumId = data.id;
        slot.spotifyAlbumUrl =
          data.external_urls?.spotify ||
          slot.spotifyAlbumUrl ||
          slot.spotifyUrl;
        slot.spotifyUrl =
          data.external_urls?.spotify ||
          slot.spotifyUrl ||
          slot.spotifyAlbumUrl;
        slot.album = data.name || slot.album;
        slot.artist = albumArtist || slot.artist;
        slot.releaseDate = data.release_date || slot.releaseDate || "";
        slot.year = data.release_date
          ? Number(String(data.release_date).slice(0, 4)) || slot.year
          : slot.year;
        slot.albumArt =
          data.images?.[1]?.url || data.images?.[0]?.url || slot.albumArt;
        slot.albumType = data.album_type || slot.albumType || "";
        slot.totalTracks =
          Number(data.total_tracks || data.tracks?.total || 0) ||
          slot.totalTracks ||
          null;
        slot.tracks = await fetchAllSpotifyAlbumTracks(
          data.id,
          data.tracks,
          albumArtist,
        );
        updated = true;
      }
    }
    if (!updated && slot.spotifyAlbumUrl) {
      const oembed = await fetchSpotifyAlbumOembed(slot.spotifyAlbumUrl);
      if (oembed) {
        slot.albumArt = oembed.thumbnail_url || slot.albumArt;
        if (!slot.album && oembed.title) slot.album = oembed.title;
        if (!slot.artist && oembed.author_name)
          slot.artist = oembed.author_name;
        updated = true;
      }
    }
    if (!updated && slot.manualAlbumArt) {
      slot.albumArt = slot.manualAlbumArt;
      updated = true;
    }
    touchAlbumDive();
    rerenderAlbumDive();
    showSaveToast(
      updated
        ? `Album metadata updated${slot.tracks?.length ? ` with ${slot.tracks.length} tracks` : ""} — save changes to keep it.`
        : "No album metadata found. Connect Spotify or try a manual art URL.",
      !updated,
    );
  } catch (err) {
    console.error("Album Dive album lookup failed", err);
    showSaveToast(
      `Album lookup failed: ${err?.message || "Unknown error"}`,
      true,
    );
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = originalText || "Fetch Album + Tracks";
    }
  }
}

function setAlbumDiveTrackReaction(slotKey, trackValue, value) {
  const slot = getAlbumDiveSlot(slotKey);
  if (!slot) return;
  const cleanValue = String(trackValue || "");
  const tracks = Array.isArray(slot.tracks) ? slot.tracks : [];
  const track = tracks.find(
    (item) =>
      cleanValue &&
      (cleanValue === item.spotifyTrackId ||
        cleanValue === item.spotifyTrackUrl ||
        cleanValue === albumDiveTrackOptionValue(item)),
  );
  if (!track) return;
  const reaction = [1, 2, 3].includes(Number(value)) ? Number(value) : null;
  track.reaction = Number(track.reaction) === reaction ? null : reaction;
  touchAlbumDive();
  rerenderAlbumDive();
}

function setAlbumDiveFavoriteFromTrack(slotKey, value) {
  const slot = getAlbumDiveSlot(slotKey);
  if (!slot) return;
  const tracks = Array.isArray(slot.tracks) ? slot.tracks : [];
  const track = tracks.find(
    (t) =>
      value &&
      (value === t.spotifyTrackId ||
        value === t.spotifyTrackUrl ||
        value === albumDiveTrackOptionValue(t)),
  );
  if (!track) return;
  slot.favoriteSong =
    slot.favoriteSong ||
    defaultAlbumDiveSlot(slot.key, slot.label).favoriteSong;
  slot.favoriteSong.title = track.title || "";
  slot.favoriteSong.artist = track.artist || slot.artist || "";
  slot.favoriteSong.spotifyTrackUrl = track.spotifyTrackUrl || "";
  slot.favoriteSong.spotifyTrackId = track.spotifyTrackId || "";
  slot.favoriteSong.albumArt = slot.albumArt || slot.manualAlbumArt || "";
  slot.favoriteSong.durationMs = track.durationMs || null;
  slot.favoriteSong.trackNumber = track.trackNumber || null;
  slot.favoriteSong.discNumber = track.discNumber || null;
  slot.favoriteSong.promotedToSongLog = false;
  touchAlbumDive();
  rerenderAlbumDive();
}

async function fetchAlbumDiveFavoriteMetadata(slotKey, button) {
  const slot = getAlbumDiveSlot(slotKey);
  if (!slot) return;
  const fav = (slot.favoriteSong =
    slot.favoriteSong ||
    defaultAlbumDiveSlot(slot.key, slot.label).favoriteSong);
  const originalText = button?.textContent || "";
  try {
    if (button) {
      button.disabled = true;
      button.textContent = "Fetching…";
    }
    const track = fav.spotifyTrackUrl
      ? await fetchSpotifyTrackMetadata(fav.spotifyTrackUrl, true)
      : null;
    if (track) {
      fav.spotifyTrackId = track.spotifyId || fav.spotifyTrackId || "";
      fav.spotifyTrackUrl = track.spotifyUrl || fav.spotifyTrackUrl || "";
      fav.title = track.title || fav.title || "";
      fav.artist = track.artist || fav.artist || "";
      fav.albumArt = track.artwork || fav.albumArt || slot.albumArt || "";
      if (!slot.albumArt && track.artwork) slot.albumArt = track.artwork;
      touchAlbumDive();
      rerenderAlbumDive();
      showSaveToast(
        "Favorite song metadata updated — save changes to keep it.",
        false,
      );
      return;
    }
    const fallback = fav.spotifyTrackUrl
      ? await fetchSpotifyOembed(fav.spotifyTrackUrl)
      : null;
    if (fallback) {
      const raw = fallback.title || "";
      fav.title = fav.title || raw.split(/[·\u2013\u2014]/)[0].trim() || raw;
      fav.artist = fav.artist || fallback.author_name || "";
      fav.albumArt =
        fallback.thumbnail_url || fav.albumArt || slot.albumArt || "";
      if (!slot.albumArt && fallback.thumbnail_url)
        slot.albumArt = fallback.thumbnail_url;
      touchAlbumDive();
      rerenderAlbumDive();
      showSaveToast(
        "Favorite song metadata updated from Spotify preview — save changes to keep it.",
        false,
      );
      return;
    }
    showSaveToast(
      "No favorite track metadata found. Paste a Spotify track URL or fill the fields manually.",
      true,
    );
  } catch (err) {
    console.error("Album Dive favorite lookup failed", err);
    showSaveToast(
      `Favorite track lookup failed: ${err?.message || "Unknown error"}`,
      true,
    );
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = originalText || "Fetch Track Info";
    }
  }
}

function promoteAlbumDiveFavorite(slotKey) {
  if (!currentGenre) return;
  const slot = getAlbumDiveSlot(slotKey);
  const fav = slot?.favoriteSong || {};
  if (!slot || (!fav.title && !fav.spotifyTrackUrl)) {
    alert("Add a favorite song title or Spotify track URL first.");
    return;
  }
  const official = inflateSongsFromStorage(
    currentGenre.songs_listened || [],
  ).filter((s) => !s.isPending);
  const song = {
    url: normalizeSongUrl(fav.spotifyTrackUrl || ""),
    spotifyUrl: normalizeSongUrl(fav.spotifyTrackUrl || ""),
    spotifyId:
      fav.spotifyTrackId || spotifyTrackId(fav.spotifyTrackUrl || "") || "",
    title: fav.title || "Album Dive favorite",
    artist: fav.artist || slot.artist || "",
    score: slot.rating || numericRating(currentGenre) || null,
    reason: `Album Dive favorite from ${slot.label}: ${[slot.artist, slot.album].filter(Boolean).join(" — ")}`,
    source: "album_dive",
    album: slot.album || "",
    artwork: fav.albumArt || slot.albumArt || slot.manualAlbumArt || "",
    releaseDate: slot.releaseDate || "",
    releaseYear: slot.year || null,
    durationMs: fav.durationMs || null,
    trackNumber: fav.trackNumber || null,
    discNumber: fav.discNumber || null,
    albumDiveSlot: slot.key,
  };
  const key = songIdentity(song);
  if (!official.some((existing) => songIdentity(existing) === key))
    official.push(song);
  currentGenre.songs_listened = official;
  fav.promotedToSongLog = true;
  slot.spawnedSongs = Array.isArray(slot.spawnedSongs) ? slot.spawnedSongs : [];
  if (!slot.spawnedSongs.some((existing) => songIdentity(existing) === key))
    slot.spawnedSongs.push(song);
  touchAlbumDive();
  loadListenScreen(currentGenre, {
    preserveDirty: true,
    skipSpotifyHydration: true,
  });
  showSaveToast(
    "Favorite song added to the genre song log — save changes to keep it.",
    false,
  );
}
