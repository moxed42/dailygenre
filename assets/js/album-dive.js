/* === Album Dive feature === */
    const ALBUM_DIVE_SLOT_DEFS = [
  ['breakout', 'Breakout'],
  ['originator', 'Originator'],
  ['archetype', 'Archetype'],
  ['consensus', 'Consensus'],
  ['popular', 'Popular'],
  ['purist', 'Purist'],
  ['cult_hit', 'Cult Hit'],
  ['modern', 'Modern'],
  ['revival', 'Revival'],
  ['wave', 'Wave'],
];

    function defaultAlbumDiveSlot(key, label) {
      return {
        key,
        label,
        album: '',
        artist: '',
        year: null,
        releaseDate: '',
        albumType: '',
        totalTracks: null,
        rationale: '',
        spotifyAlbumUrl: '',
        spotifyAlbumId: '',
        spotifyUrl: '',
        albumArt: '',
        manualAlbumArt: '',
        tracks: [],
        listenState: 'not_started',
        rating: null,
        favoriteSong: {
          title: '',
          artist: '',
          spotifyTrackUrl: '',
          spotifyTrackId: '',
          albumArt: '',
          durationMs: null,
          trackNumber: null,
          discNumber: null,
          note: '',
          promotedToSongLog: false
        },
        standoutTracks: [],
        spawnedSongs: [],
        notes: ''
      };
    }

    function normalizeAlbumDiveTrack(raw={}) {
      const artists = Array.isArray(raw.artists) ? raw.artists.map(a => typeof a === 'string' ? a : a?.name).filter(Boolean) : [];
      return {
        title: raw.title || raw.name || '',
        artist: raw.artist || artists.join(', ') || '',
        artists,
        spotifyTrackUrl: raw.spotifyTrackUrl || raw.spotifyUrl || raw.external_urls?.spotify || '',
        spotifyTrackId: raw.spotifyTrackId || raw.spotifyId || raw.id || '',
        durationMs: Number(raw.durationMs || raw.duration_ms || 0) || null,
        trackNumber: Number(raw.trackNumber || raw.track_number || 0) || null,
        discNumber: Number(raw.discNumber || raw.disc_number || 0) || null
      };
    }

    function normalizeAlbumDiveSlot(raw, key, label) {
      const base = defaultAlbumDiveSlot(key, label);
      const slot = { ...base, ...(raw || {}) };
      slot.key = key;
      slot.label = slot.label || label;
      slot.year = slot.year ? Number(slot.year) : null;
      slot.rating = slot.rating ? Number(slot.rating) : null;
      slot.totalTracks = slot.totalTracks ? Number(slot.totalTracks) : null;
      slot.favoriteSong = { ...base.favoriteSong, ...(slot.favoriteSong || {}) };
      slot.favoriteSong.durationMs = slot.favoriteSong.durationMs ? Number(slot.favoriteSong.durationMs) : null;
      slot.favoriteSong.trackNumber = slot.favoriteSong.trackNumber ? Number(slot.favoriteSong.trackNumber) : null;
      slot.favoriteSong.discNumber = slot.favoriteSong.discNumber ? Number(slot.favoriteSong.discNumber) : null;
      slot.tracks = Array.isArray(slot.tracks) ? slot.tracks.map(normalizeAlbumDiveTrack).filter(t => t.title || t.spotifyTrackId || t.spotifyTrackUrl) : [];
      slot.standoutTracks = Array.isArray(slot.standoutTracks) ? slot.standoutTracks : [];
      slot.spawnedSongs = Array.isArray(slot.spawnedSongs) ? slot.spawnedSongs : [];
      return slot;
    }

    function normalizeAlbumDive(genre, create=false) {
      if (!genre) return null;
      if (!genre.albumDive && !create) return null;
      const existing = genre.albumDive || {};
      const existingSlots = Array.isArray(existing.slots) ? existing.slots : [];
      const byKey = Object.fromEntries(existingSlots.map(slot => [slot?.key, slot]));
      const normalized = {
        enabled: existing.enabled !== false,
        mode: existing.mode || 'canon',
        status: existing.status || 'not_started',
        summary: existing.summary || '',
        verdict: existing.verdict || '',
        verdictImpact: existing.verdictImpact || '',
        slots: ALBUM_DIVE_SLOT_DEFS.map(([key, label]) => normalizeAlbumDiveSlot(byKey[key], key, label)),
        completedAt: existing.completedAt || '',
        lastWorkedAt: existing.lastWorkedAt || ''
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
      const finished = slots.filter(slot => slot.listenState === 'finished' || slot.listenState === 'completed').length;
      const sampled = slots.filter(slot => slot.listenState === 'sampled').length;
      const fetched = slots.filter(slot => slot.spotifyAlbumId || slot.albumArt || (slot.tracks || []).length).length;
      return { finished, sampled, fetched, total: slots.length || ALBUM_DIVE_SLOT_DEFS.length };
    }

    function albumDiveCtaText(genre) {
      const n = numericRating(genre);
      if (n >= 5) return 'Build the Shelf';
      if (n === 4) return 'Start Canon Dive';
      if (n === 3) return 'Interrogate Through Albums';
      return 'Start Album Dive';
    }

    function albumDiveArtHtml(slot) {
      const src = slot.albumArt || slot.manualAlbumArt || slot.favoriteSong?.albumArt || '';
      return src ? `<img class="album-slot-art" src="${escapeHtml(src)}" alt="${escapeHtml(slot.album || 'Album art')}" loading="lazy">` : '<div class="album-slot-art" aria-hidden="true"></div>';
    }

    function renderAlbumDivePanel(genre) {
      const dive = normalizeAlbumDive(genre, false);
      const eligible = albumDiveEligible(genre);
      if (!dive) {
        return `<div class="panel album-dive-panel"><div class="album-dive-head"><div><div class="eyebrow">Album Dive</div><h3 class="album-dive-title">Deepen this genre through records</h3><p class="small">Paste Spotify album URLs, fetch cover art and track lists, choose a favorite song from each album, and promote favorites back into the main song log.</p></div><div class="album-dive-actions"><button type="button" class="btn btn-primary" onclick="startAlbumDive()">${escapeHtml(albumDiveCtaText(genre))}</button></div></div>${eligible ? '' : '<div class="album-dive-empty small">Tip: this works best after you rate a genre 3, 4, or 5 stars, but you can start a dive any time.</div>'}</div>`;
      }
      const progress = albumDiveProgress(dive);
      return `<div class="panel album-dive-panel" id="albumDivePanel">
        <div class="album-dive-head">
          <div>
            <div class="eyebrow">Album Dive</div>
            <h3 class="album-dive-title">Canonical album shelf</h3>
            <div class="status-row">
              <span class="tag">${escapeHtml(dive.mode || 'canon')} dive</span>
              <span class="tag">${progress.fetched}/${progress.total} fetched</span>
              <span class="tag">${progress.finished}/${progress.total} finished</span>
              ${progress.sampled ? `<span class="tag">${progress.sampled} sampled</span>` : ''}
              ${dive.status === 'completed' ? '<span class="tag">Dive complete</span>' : '<span class="tag">In progress</span>'}
            </div>
          </div>
        <div class="album-dive-actions">
  <button type="button" class="btn btn-primary" onclick="saveLibraryUpdates()">Save Album Dive</button>
  <button type="button" class="btn btn-secondary" onclick="markAlbumDiveComplete()">Mark Dive Complete</button>
  <button type="button" class="btn btn-ghost" onclick="clearAlbumDive()">Remove Dive</button>
</div>
        </div>
        <div class="album-dive-summary">
          <label for="albumDiveSummary">What this dive is testing</label>
          <textarea id="albumDiveSummary" placeholder="Example: Jazz rap fuses MC-driven boom-bap with jazz harmony, samples, and instrumentation." oninput="updateAlbumDiveRootField('summary', this.value)">${escapeHtml(dive.summary || '')}</textarea>
        </div>
        <div class="album-dive-grid">
          ${dive.slots.map(renderAlbumDiveSlot).join('')}
        </div>
        <div class="album-dive-verdict">
          <div class="album-dive-verdict-grid">
            <div>
              <label for="albumDiveVerdictImpact">Verdict impact</label>
              <select id="albumDiveVerdictImpact" onchange="updateAlbumDiveRootField('verdictImpact', this.value)">
                ${['', 'reinforced', 'complicated', 'weakened'].map(value => `<option value="${value}" ${String(dive.verdictImpact || '') === value ? 'selected' : ''}>${value ? value[0].toUpperCase() + value.slice(1) : 'Choose…'}</option>`).join('')}
              </select>
            </div>
            <div>
              <label for="albumDiveVerdict">Final dive verdict</label>
              <textarea id="albumDiveVerdict" placeholder="Did the album dive strengthen, complicate, or weaken your original rating?" oninput="updateAlbumDiveRootField('verdict', this.value)">${escapeHtml(dive.verdict || '')}</textarea>
            </div>
          </div>
        </div>
      </div>`;
    }

    function albumDiveTrackOptionValue(track) {
      return track.spotifyTrackId || track.spotifyTrackUrl || `${track.discNumber || 1}:${track.trackNumber || ''}:${track.title}`;
    }

    function renderAlbumDiveFavoritePicker(slot, safeKey) {
      const fav = slot.favoriteSong || {};
      const tracks = Array.isArray(slot.tracks) ? slot.tracks : [];
      const selected = fav.spotifyTrackId || fav.spotifyTrackUrl || '';
      if (!tracks.length) {
        return `<div class="small">Fetch the Spotify album first to choose from its real track list.</div>
          <div class="album-slot-minirow">
            <input type="text" value="${escapeHtml(fav.title || '')}" placeholder="Favorite song title" oninput="updateAlbumDiveFavoriteField('${safeKey}', 'title', this.value)">
            <input type="text" value="${escapeHtml(fav.artist || '')}" placeholder="Artist" oninput="updateAlbumDiveFavoriteField('${safeKey}', 'artist', this.value)">
          </div>
          <input type="url" value="${escapeHtml(fav.spotifyTrackUrl || '')}" placeholder="Spotify track URL for favorite song" onchange="updateAlbumDiveFavoriteField('${safeKey}', 'spotifyTrackUrl', this.value)">`;
      }
      return `<div class="album-track-select-row">
        <select onchange="setAlbumDiveFavoriteFromTrack('${safeKey}', this.value)">
          <option value="">Choose favorite from ${tracks.length} track${tracks.length === 1 ? '' : 's'}…</option>
          ${tracks.map(track => {
            const value = albumDiveTrackOptionValue(track);
            const isSelected = selected && (selected === track.spotifyTrackId || selected === track.spotifyTrackUrl || selected === value);
            const prefix = [track.discNumber && track.discNumber > 1 ? `D${track.discNumber}` : '', track.trackNumber ? `#${track.trackNumber}` : ''].filter(Boolean).join(' ');
            return `<option value="${escapeHtml(value)}" ${isSelected ? 'selected' : ''}>${escapeHtml(`${prefix ? `${prefix} — ` : ''}${track.title}${track.artist ? ` — ${track.artist}` : ''}`)}</option>`;
          }).join('')}
        </select>
        ${fav.spotifyTrackUrl ? `<a class="btn btn-secondary btn-tiny" href="${escapeHtml(fav.spotifyTrackUrl)}" target="_blank" rel="noopener">Open</a>` : ''}
      </div>
      ${fav.title ? `<div class="small"><strong>Favorite:</strong> ${escapeHtml(fav.artist ? `${fav.artist} — ${fav.title}` : fav.title)}</div>` : ''}`;
    }

    function renderAlbumDiveSlot(slot) {
      const state = slot.listenState || 'not_started';
      const fav = slot.favoriteSong || {};
      const safeKey = escapeHtml(slot.key);
      const displayTitle = slot.album || 'Paste a Spotify album URL';
      const displaySub = [slot.artist, slot.year || (slot.releaseDate ? String(slot.releaseDate).slice(0,4) : ''), slot.totalTracks ? `${slot.totalTracks} tracks` : ''].filter(Boolean).join(' · ');
      return `<div class="album-slot-card" data-album-slot="${safeKey}">
        ${albumDiveArtHtml(slot)}
        <div class="album-slot-main">
          <div class="album-slot-kicker"><span class="album-slot-label">${escapeHtml(slot.label)}</span><span class="tag">${escapeHtml(state.replaceAll('_', ' '))}</span></div>
          <div>
            <div class="album-slot-display-title">${escapeHtml(displayTitle)}</div>
            ${displaySub ? `<div class="album-slot-display-sub">${escapeHtml(displaySub)}</div>` : ''}
          </div>
          <div class="album-fetch-row">
            <input type="url" value="${escapeHtml(slot.spotifyAlbumUrl || slot.spotifyUrl || '')}" placeholder="Paste Spotify album URL" onchange="updateAlbumDiveSlotField('${safeKey}', 'spotifyAlbumUrl', this.value)">
            <button type="button" class="btn btn-primary btn-tiny" onclick="fetchAlbumDiveAlbumMetadata('${safeKey}', this)">Fetch Album + Tracks</button>
          </div>
          <div class="album-slot-meta">
            <select onchange="updateAlbumDiveSlotField('${safeKey}', 'listenState', this.value)">
              ${[['not_started','Not started'], ['sampled','Sampled'], ['finished','Finished']].map(([value, label]) => `<option value="${value}" ${state === value ? 'selected' : ''}>${label}</option>`).join('')}
            </select>
            <div class="album-stars" aria-label="Album rating">${[1,2,3,4,5].map(n => `<button type="button" class="album-star-btn ${Number(slot.rating) === n ? 'active' : ''}" onclick="setAlbumDiveSlotRating('${safeKey}', ${n})" title="${n} star album rating">${n}</button>`).join('')}</div>
          </div>
          <textarea placeholder="Why this album fits this slot" oninput="updateAlbumDiveSlotField('${safeKey}', 'rationale', this.value)">${escapeHtml(slot.rationale || '')}</textarea>
          <div class="album-slot-favorite">
            <h4>Favorite song from this album</h4>
            ${renderAlbumDiveFavoritePicker(slot, safeKey)}
            <textarea placeholder="Why this song won the album" oninput="updateAlbumDiveFavoriteField('${safeKey}', 'note', this.value)">${escapeHtml(fav.note || '')}</textarea>
            <div class="album-fav-actions">
              ${fav.spotifyTrackUrl ? `<button type="button" class="btn btn-secondary btn-tiny" onclick="fetchAlbumDiveFavoriteMetadata('${safeKey}', this)">Refresh Track Info</button>` : ''}
              <button type="button" class="btn btn-primary btn-tiny" onclick="promoteAlbumDiveFavorite('${safeKey}')">Add Favorite to Song Log</button>
              ${fav.promotedToSongLog ? '<span class="tag">Promoted</span>' : ''}
            </div>
          </div>
          <details>
            <summary>Edit manual metadata / fallback art</summary>
            <div class="album-slot-title" style="margin-top:8px;">
              <input type="text" value="${escapeHtml(slot.album || '')}" placeholder="Album title" oninput="updateAlbumDiveSlotField('${safeKey}', 'album', this.value)">
              <input type="number" value="${slot.year || ''}" placeholder="Year" oninput="updateAlbumDiveSlotField('${safeKey}', 'year', this.value)">
            </div>
            <div class="album-slot-minirow" style="margin-top:8px;">
              <input type="text" value="${escapeHtml(slot.artist || '')}" placeholder="Artist" oninput="updateAlbumDiveSlotField('${safeKey}', 'artist', this.value)">
              <input type="url" value="${escapeHtml(slot.manualAlbumArt || '')}" placeholder="Manual album art URL" onchange="updateAlbumDiveSlotField('${safeKey}', 'manualAlbumArt', this.value)">
            </div>
          </details>
          <textarea placeholder="Album notes / standout tracks / alternate picks" oninput="updateAlbumDiveSlotField('${safeKey}', 'notes', this.value)">${escapeHtml(slot.notes || '')}</textarea>
        </div>
      </div>`;
    }

    function getAlbumDiveSlot(slotKey) {
      const dive = normalizeAlbumDive(currentGenre, true);
      return dive?.slots?.find(slot => slot.key === slotKey) || null;
    }

    function touchAlbumDive() {
      const dive = normalizeAlbumDive(currentGenre, true);
      if (!dive) return;

      dive.lastWorkedAt = new Date().toISOString();
      if (dive.status === 'not_started') dive.status = 'active';

      if (typeof markListeningUpdatePending === 'function') {
      markListeningUpdatePending();
        } else {
          libraryUpdatesPending = true;
          setUnsavedState(true);
          toggleLibrarySaveButton(true);
          }
        }

    function rerenderAlbumDive() {
      if (!currentGenre) return;
      const panel = document.getElementById('albumDivePanel');
      if (panel) panel.outerHTML = renderAlbumDivePanel(currentGenre);
      else loadListenScreen(currentGenre, { preserveDirty: true, skipSpotifyHydration: true });
    }

    function startAlbumDive() {
      if (!currentGenre) return;
      const dive = normalizeAlbumDive(currentGenre, true);
      dive.enabled = true;
      dive.status = 'active';
      dive.lastWorkedAt = new Date().toISOString();
      touchAlbumDive();
      loadListenScreen(currentGenre, { preserveDirty: true, skipSpotifyHydration: true });
      showSaveToast('Album Dive started — save changes to keep it.', false);
    }

    function clearAlbumDive() {
      if (!currentGenre) return;
      if (!confirm('Remove the Album Dive from this genre?')) return;
      delete currentGenre.albumDive;
    if (typeof markListeningUpdatePending === 'function') {
  markListeningUpdatePending();
} else {
  libraryUpdatesPending = true;
  setUnsavedState(true);
  toggleLibrarySaveButton(true);
}
      loadListenScreen(currentGenre, { preserveDirty: true, skipSpotifyHydration: true });
    }

    function markAlbumDiveComplete() {
      const dive = normalizeAlbumDive(currentGenre, true);
      dive.status = 'completed';
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
      slot[field] = field === 'year' ? (value ? Number(value) : null) : value;
      if (field === 'manualAlbumArt' && value && !slot.albumArt) slot.albumArt = value;
      touchAlbumDive();
    }

    function updateAlbumDiveFavoriteField(slotKey, field, value) {
      const slot = getAlbumDiveSlot(slotKey);
      if (!slot) return;
      slot.favoriteSong = slot.favoriteSong || defaultAlbumDiveSlot(slot.key, slot.label).favoriteSong;
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

    function spotifyIdFromUrl(url='', type='album') {
      const value = String(url || '').trim();
      const uriMatch = value.match(new RegExp(`spotify:${type}:([A-Za-z0-9]+)`, 'i'));
      if (uriMatch) return uriMatch[1];
      const webMatch = value.match(new RegExp(`open\.spotify\.com/${type}/([A-Za-z0-9]+)`, 'i'));
      return webMatch ? webMatch[1] : '';
    }

    async function fetchSpotifyAlbumOembed(url) {
      const albumUrl = String(url || '').trim();
      if (!/open\.spotify\.com\/album\//i.test(albumUrl)) return null;
      return fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(albumUrl)}`)
        .then(async response => response.ok ? response.json() : null)
        .catch(() => null);
    }

    function spotifyAlbumTrackToDiveTrack(item, albumArtist='') {
      const artists = (item?.artists || []).map(a => a.name).filter(Boolean);
      return normalizeAlbumDiveTrack({
        title: item?.name || '',
        artist: artists.join(', ') || albumArtist,
        artists,
        spotifyTrackUrl: item?.external_urls?.spotify || '',
        spotifyTrackId: item?.id || '',
        durationMs: item?.duration_ms || null,
        trackNumber: item?.track_number || null,
        discNumber: item?.disc_number || null
      });
    }

    async function fetchAllSpotifyAlbumTracks(albumId, firstPage, albumArtist='') {
      const tracks = [];
      let page = firstPage || null;
      if (Array.isArray(page?.items)) tracks.push(...page.items.map(item => spotifyAlbumTrackToDiveTrack(item, albumArtist)));
      let nextUrl = page?.next || '';
      let guard = 0;
      while (nextUrl && guard < 12) {
        guard += 1;
        const res = await spotifyApiFetch(nextUrl);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) break;
        if (Array.isArray(data.items)) tracks.push(...data.items.map(item => spotifyAlbumTrackToDiveTrack(item, albumArtist)));
        nextUrl = data.next || '';
      }
      return tracks.filter(track => track.title || track.spotifyTrackId || track.spotifyTrackUrl);
    }

    async function fetchAlbumDiveAlbumMetadata(slotKey, button) {
      const slot = getAlbumDiveSlot(slotKey);
      if (!slot) return;
      const originalText = button?.textContent || '';
      try {
        if (button) { button.disabled = true; button.textContent = 'Fetching…'; }
        const albumId = spotifyIdFromUrl(slot.spotifyAlbumUrl || slot.spotifyUrl, 'album');
        let updated = false;
        if (albumId && spotifySession?.access_token) {
          const response = await spotifyApiFetch(`albums/${encodeURIComponent(albumId)}`);
          const data = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(data?.error?.message || data?.error || `Spotify album lookup failed (${response.status}).`);
          if (data?.id) {
            const albumArtist = (data.artists || []).map(a => a.name).filter(Boolean).join(', ');
            slot.spotifyAlbumId = data.id;
            slot.spotifyAlbumUrl = data.external_urls?.spotify || slot.spotifyAlbumUrl || slot.spotifyUrl;
            slot.spotifyUrl = data.external_urls?.spotify || slot.spotifyUrl || slot.spotifyAlbumUrl;
            slot.album = data.name || slot.album;
            slot.artist = albumArtist || slot.artist;
            slot.releaseDate = data.release_date || slot.releaseDate || '';
            slot.year = data.release_date ? Number(String(data.release_date).slice(0,4)) || slot.year : slot.year;
            slot.albumArt = data.images?.[1]?.url || data.images?.[0]?.url || slot.albumArt;
            slot.albumType = data.album_type || slot.albumType || '';
            slot.totalTracks = Number(data.total_tracks || data.tracks?.total || 0) || slot.totalTracks || null;
            slot.tracks = await fetchAllSpotifyAlbumTracks(data.id, data.tracks, albumArtist);
            updated = true;
          }
        }
        if (!updated && slot.spotifyAlbumUrl) {
          const oembed = await fetchSpotifyAlbumOembed(slot.spotifyAlbumUrl);
          if (oembed) {
            slot.albumArt = oembed.thumbnail_url || slot.albumArt;
            if (!slot.album && oembed.title) slot.album = oembed.title;
            if (!slot.artist && oembed.author_name) slot.artist = oembed.author_name;
            updated = true;
          }
        }
        if (!updated && slot.manualAlbumArt) {
          slot.albumArt = slot.manualAlbumArt;
          updated = true;
        }
        touchAlbumDive();
        rerenderAlbumDive();
        showSaveToast(updated ? `Album metadata updated${slot.tracks?.length ? ` with ${slot.tracks.length} tracks` : ''} — save changes to keep it.` : 'No album metadata found. Connect Spotify or try a manual art URL.', !updated);
      } catch (err) {
        console.error('Album Dive album lookup failed', err);
        showSaveToast(`Album lookup failed: ${err?.message || 'Unknown error'}`, true);
      } finally {
        if (button) { button.disabled = false; button.textContent = originalText || 'Fetch Album + Tracks'; }
      }
    }

    function setAlbumDiveFavoriteFromTrack(slotKey, value) {
      const slot = getAlbumDiveSlot(slotKey);
      if (!slot) return;
      const tracks = Array.isArray(slot.tracks) ? slot.tracks : [];
      const track = tracks.find(t => value && (value === t.spotifyTrackId || value === t.spotifyTrackUrl || value === albumDiveTrackOptionValue(t)));
      if (!track) return;
      slot.favoriteSong = slot.favoriteSong || defaultAlbumDiveSlot(slot.key, slot.label).favoriteSong;
      slot.favoriteSong.title = track.title || '';
      slot.favoriteSong.artist = track.artist || slot.artist || '';
      slot.favoriteSong.spotifyTrackUrl = track.spotifyTrackUrl || '';
      slot.favoriteSong.spotifyTrackId = track.spotifyTrackId || '';
      slot.favoriteSong.albumArt = slot.albumArt || slot.manualAlbumArt || '';
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
      const fav = slot.favoriteSong = slot.favoriteSong || defaultAlbumDiveSlot(slot.key, slot.label).favoriteSong;
      const originalText = button?.textContent || '';
      try {
        if (button) { button.disabled = true; button.textContent = 'Fetching…'; }
        const track = fav.spotifyTrackUrl ? await fetchSpotifyTrackMetadata(fav.spotifyTrackUrl, true) : null;
        if (track) {
          fav.spotifyTrackId = track.spotifyId || fav.spotifyTrackId || '';
          fav.spotifyTrackUrl = track.spotifyUrl || fav.spotifyTrackUrl || '';
          fav.title = track.title || fav.title || '';
          fav.artist = track.artist || fav.artist || '';
          fav.albumArt = track.artwork || fav.albumArt || slot.albumArt || '';
          if (!slot.albumArt && track.artwork) slot.albumArt = track.artwork;
          touchAlbumDive();
          rerenderAlbumDive();
          showSaveToast('Favorite song metadata updated — save changes to keep it.', false);
          return;
        }
        const fallback = fav.spotifyTrackUrl ? await fetchSpotifyOembed(fav.spotifyTrackUrl) : null;
        if (fallback) {
          const raw = fallback.title || '';
          fav.title = fav.title || raw.split(/[·\u2013\u2014]/)[0].trim() || raw;
          fav.artist = fav.artist || fallback.author_name || '';
          fav.albumArt = fallback.thumbnail_url || fav.albumArt || slot.albumArt || '';
          if (!slot.albumArt && fallback.thumbnail_url) slot.albumArt = fallback.thumbnail_url;
          touchAlbumDive();
          rerenderAlbumDive();
          showSaveToast('Favorite song metadata updated from Spotify preview — save changes to keep it.', false);
          return;
        }
        showSaveToast('No favorite track metadata found. Paste a Spotify track URL or fill the fields manually.', true);
      } catch (err) {
        console.error('Album Dive favorite lookup failed', err);
        showSaveToast(`Favorite track lookup failed: ${err?.message || 'Unknown error'}`, true);
      } finally {
        if (button) { button.disabled = false; button.textContent = originalText || 'Fetch Track Info'; }
      }
    }

    function promoteAlbumDiveFavorite(slotKey) {
      if (!currentGenre) return;
      const slot = getAlbumDiveSlot(slotKey);
      const fav = slot?.favoriteSong || {};
      if (!slot || (!fav.title && !fav.spotifyTrackUrl)) {
        alert('Add a favorite song title or Spotify track URL first.');
        return;
      }
      const official = inflateSongsFromStorage(currentGenre.songs_listened || []).filter(s => !s.isPending);
      const song = {
        url: normalizeSongUrl(fav.spotifyTrackUrl || ''),
        spotifyUrl: normalizeSongUrl(fav.spotifyTrackUrl || ''),
        spotifyId: fav.spotifyTrackId || spotifyTrackId(fav.spotifyTrackUrl || '') || '',
        title: fav.title || 'Album Dive favorite',
        artist: fav.artist || slot.artist || '',
        score: slot.rating || numericRating(currentGenre) || null,
        reason: `Album Dive favorite from ${slot.label}: ${[slot.artist, slot.album].filter(Boolean).join(' — ')}`,
        source: 'album_dive',
        album: slot.album || '',
        artwork: fav.albumArt || slot.albumArt || slot.manualAlbumArt || '',
        releaseDate: slot.releaseDate || '',
        releaseYear: slot.year || null,
        durationMs: fav.durationMs || null,
        trackNumber: fav.trackNumber || null,
        discNumber: fav.discNumber || null,
        albumDiveSlot: slot.key
      };
      const key = songIdentity(song);
      if (!official.some(existing => songIdentity(existing) === key)) official.push(song);
      currentGenre.songs_listened = official;
      fav.promotedToSongLog = true;
      slot.spawnedSongs = Array.isArray(slot.spawnedSongs) ? slot.spawnedSongs : [];
      if (!slot.spawnedSongs.some(existing => songIdentity(existing) === key)) slot.spawnedSongs.push(song);
      touchAlbumDive();
      loadListenScreen(currentGenre, { preserveDirty: true, skipSpotifyHydration: true });
      showSaveToast('Favorite song added to the genre song log — save changes to keep it.', false);
    }

