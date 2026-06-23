
    let hasUnsavedChanges = false;

    function setUnsavedState(isDirty) {
      hasUnsavedChanges = !!isDirty;
      const saveBtn = document.getElementById('saveBtn');
      if (saveBtn) saveBtn.dataset.dirty = hasUnsavedChanges ? 'true' : 'false';
      const listenTab = document.querySelector('.tab-btn[data-screen="listen"]');
      if (listenTab) listenTab.classList.toggle('dirty', hasUnsavedChanges);
    }

    let lastSavedListenSnapshot = '';

    function buildListenSnapshot() {
      if (!currentGenre) return '';
      return JSON.stringify({
        id: currentGenre.id || '',
        rating: currentGenre.rating || '',
        favoriteSong: document.getElementById('favoriteSong')?.value?.trim() || '',
        favoriteSongUrl: document.getElementById('favoriteSongUrl')?.value?.trim() || '',
        notes: document.getElementById('notes')?.value || '',
        songsListenedBulk: document.getElementById('songsListenedBulk')?.value || '',
        albumDive: currentGenre.albumDive ? JSON.stringify(currentGenre.albumDive) : '',
        songReactions: collectSongReactionSnapshot(currentGenre.songs_listened || []),
        pendingSongs: pendingSongsForStorage(currentGenre.pending_songs || []),
        contender: !!document.getElementById('monthlyContender')?.checked,
        favorite: !!document.getElementById('monthFavorite')?.checked,
        least: !!document.getElementById('monthLeastFavorite')?.checked
      });
    }

    function refreshDirtyFromSnapshot() {
      if (!currentGenre) {
        setUnsavedState(false);
        return;
      }
      setUnsavedState(buildListenSnapshot() !== lastSavedListenSnapshot);
    }

    function resetListenDirtySnapshot() {
      lastSavedListenSnapshot = buildListenSnapshot();
      setUnsavedState(false);
    }
    window.resetListenDirtySnapshot = resetListenDirtySnapshot;

    function markDirty() {
      refreshDirtyFromSnapshot();
    }

    function screenTitle(name) {
      const labels = {
        spin: 'Spin',
        history: 'Archive',
        viz: 'Visuals',
        review: 'Review',
        ranking: 'Ranking'
      };
      return labels[name] ? `${labels[name]} | Daily Genre` : DEFAULT_PAGE_TITLE;
    }

    function switchScreen(name, options = {}) {
      const currentActive = document.querySelector('.screen.active');
      const currentName = currentActive?.id?.replace('screen-', '') || '';

      if (!options.force && hasUnsavedChanges && currentName === 'listen' && name !== 'listen') {
        const shouldLeave = window.confirm('You have unsaved changes. Leave without saving?');
        if (!shouldLeave) return false;
      }

      if (name === 'viz') {
        setTimeout(() => {
          if (typeof initVisuals === 'function') {
            initVisuals();
            renderVisuals();
          }
        }, 50);
      }

      if (name === 'review') {
        setTimeout(() => {
          if (typeof renderReview === 'function') {
            renderReview();
          }
        }, 20);
      }

      const screen = document.getElementById(`screen-${name}`);
      if (!screen) return false;

      document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

      screen.classList.add('active');

      const tab = document.querySelector(`.tab-btn[data-screen="${name}"]`);
      if (tab) tab.classList.add('active');

      if (name !== 'listen') {
        document.title = screenTitle(name);
      }

      if (!options.preserveScroll) {
        requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }));
      }

      return true;
    }

    function preserveScrollSnapshot() {
      const x = window.scrollX || window.pageXOffset || 0;
      const y = window.scrollY || window.pageYOffset || 0;
      return () => {
        requestAnimationFrame(() => window.scrollTo(x, y));
        setTimeout(() => window.scrollTo(x, y), 0);
      };
    }

    async function preserveScrollPosition(work) {
      const restore = preserveScrollSnapshot();
      try {
        return await work();
      } finally {
        restore();
      }
    }

    

    function isProgramListenedDate(genre) {
      // Daily Genre 2026 should only treat 2026 listen dates as proof that a genre
      // has been consumed. Some imported/legacy rows can carry older date_normalized
      // values that are not actual listening history for this project.
      return String(dateValue(genre) || '').startsWith('2026-');
    }

    function isGenreAlreadyListened(genre) {
      const status = normalizedGenreStatus(genre);
      return status === 'listened' || isProgramListenedDate(genre) || isGenreZanger(genre);
    }

    function isGenreRemaining(genre) {
      const status = normalizedGenreStatus(genre);
      if (isGenreAlreadyListened(genre)) return false;
      // Count legacy/imported rows with a blank status as remaining, because they have
      // not been listened to yet and should still be eligible for Spin. Older non-2026
      // dates are ignored unless the row is explicitly status=listened.
      return status === '' || status === 'unlistened';
    }

    function getUnlistened() {
      return genres.filter(isGenreRemaining);
    }

    function remainingExclusionReason(genre) {
      const status = normalizedGenreStatus(genre);
      const date = dateValue(genre);
      if (isGenreZanger(genre)) return 'zanger/veto';
      if (status === 'listened' && date && !String(date).startsWith('2026-')) return `status=listened with older date (${date})`;
      if (status === 'listened') return date ? `status=listened (${date})` : 'status=listened with no date';
      if (date && String(date).startsWith('2026-')) return `listened/date-stamped in 2026 (${date})`;
      if (status && status !== 'unlistened') return `legacy/other status=${status}`;
      return '';
    }

    function getLoadedGenreIdAudit() {
      const numericIds = genres
        .map(g => Number(g && g.id))
        .filter(n => Number.isInteger(n) && n >= 0)
        .sort((a, b) => a - b);
      const seen = new Set(numericIds);
      const minId = numericIds.length ? numericIds[0] : null;
      const maxId = numericIds.length ? numericIds[numericIds.length - 1] : null;
      const missingIds = [];
      if (minId !== null && maxId !== null) {
        for (let id = minId; id <= maxId; id += 1) {
          if (!seen.has(id)) missingIds.push(id);
        }
      }
      return {
        actualRows: genres.length,
        numericIdRows: numericIds.length,
        minId,
        maxId,
        impliedRowsIfContiguous: minId !== null && maxId !== null ? (maxId - minId + 1) : genres.length,
        missingIdCount: missingIds.length,
        missingIds,
        missingIdPreview: missingIds.slice(0, 160)
      };
    }

    function getRemainingCountDiagnostics() {
      const total = genres.length;
      const remainingRows = getUnlistened();
      const zangerRows = genres.filter(isGenreZanger);
      const listenedRows = genres.filter(g => !isGenreZanger(g) && (normalizedGenreStatus(g) === 'listened' || isProgramListenedDate(g)));
      const olderDateRows = genres.filter(g => !isGenreZanger(g) && dateValue(g) && !isProgramListenedDate(g));
      const olderDateIgnoredRows = olderDateRows.filter(g => normalizedGenreStatus(g) !== 'listened');
      const blankStatusRows = genres.filter(g => normalizedGenreStatus(g) === '');
      const legacyOtherStatusRows = genres.filter(g => {
        const status = normalizedGenreStatus(g);
        return status && !['unlistened', 'listened', 'veto', 'zanger'].includes(status);
      });
      const statusBuckets = genres.reduce((acc, g) => {
        const status = normalizedGenreStatus(g) || '(blank)';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      const listenedThisYear = listenedRows.filter(g => String(dateValue(g)).startsWith('2026-')).length;
      const listenedBeforeThisYear = listenedRows.length - listenedThisYear;
      const unavailable = Math.max(0, total - remainingRows.length);
      const excludedRows = genres.filter(g => !isGenreRemaining(g));
      const exclusionBuckets = excludedRows.reduce((acc, g) => {
        const reason = remainingExclusionReason(g) || 'unknown exclusion';
        const bucket = reason.replace(/ \(.+\)$/,'');
        acc[bucket] = (acc[bucket] || 0) + 1;
        return acc;
      }, {});
      const idAudit = getLoadedGenreIdAudit();
      window.dailyGenreIdAudit = idAudit;
      return {
        total,
        idAudit,
        remaining: remainingRows.length,
        unavailable,
        listened: listenedRows.length,
        listenedThisYear,
        listenedBeforeThisYear,
        olderDates: olderDateRows.length,
        olderDatesIgnored: olderDateIgnoredRows.length,
        zangers: zangerRows.length,
        blankStatus: blankStatusRows.length,
        legacyOtherStatus: legacyOtherStatusRows.length,
        statusBuckets,
        exclusionBuckets,
        excludedSamples: excludedRows.slice(0, 40).map(g => ({
          title: g.name || g.genre || g.title || g.id || '(untitled)',
          status: normalizedGenreStatus(g) || '(blank)',
          date: dateValue(g) || '',
          rating: g.rating || '',
          reason: remainingExclusionReason(g) || 'unknown exclusion'
        }))
      };
    }

    function remainingCountMessage(stats) {
      const lines = [
        `${stats.remaining} spin-eligible genres remaining`,
        `${stats.total} actual loaded genre rows`,
        `ID range: ${stats.idAudit?.minId ?? '?'}–${stats.idAudit?.maxId ?? '?'} (${stats.idAudit?.missingIdCount || 0} numeric ID gaps; max ID is not the same as total rows)`,
        `${stats.unavailable} loaded rows not in spinner`,
        `  • ${stats.listened} listened by Daily Genre 2026 logic`,
        `    - ${stats.listenedThisYear} dated in 2026`,
        `    - ${stats.listenedBeforeThisYear} explicitly status=listened with no/older date`,
        `  • ${stats.olderDatesIgnored} older/pre-2026 date-stamped rows ignored as listen history`,
        `  • ${stats.zangers} zangers/vetoed`,
        `  • ${stats.legacyOtherStatus} rows with other status values`,
        `  • ${stats.blankStatus} blank-status rows counted as remaining`,
        '',
        `Exclusion buckets: ${Object.entries(stats.exclusionBuckets || {}).map(([k,v]) => `${k}: ${v}`).join(' · ')}`,
        `Status buckets: ${Object.entries(stats.statusBuckets).map(([k,v]) => `${k}: ${v}`).join(' · ')}`
      ];
      return lines.join('\n');
    }

    function updateRemainingCount() {
      const stats = getRemainingCountDiagnostics();
      remainingCount.textContent = `${stats.remaining} genres remaining`;
      remainingCount.title = remainingCountMessage(stats) + '\n\nClick for excluded samples.';
      console.debug('[Daily Genre] Remaining count diagnostics', stats);
    }

    function showRemainingCountAudit() {
      const stats = getRemainingCountDiagnostics();
      const sampleLines = (stats.excludedSamples || []).map((g, idx) => {
        const bits = [g.reason, g.status ? `status=${g.status}` : '', g.date ? `date=${g.date}` : '', g.rating ? `rating=${g.rating}` : ''].filter(Boolean).join(' · ');
        return `${idx + 1}. ${g.title} — ${bits}`;
      });
      const msg = [
        remainingCountMessage(stats),
        '',
        'Why this may look low:',
        'The spinner can only include actual loaded genre rows. If the max ID is much higher than the total row count, those are ID gaps or missing JSON objects, not hidden spin candidates.',
        `Missing numeric IDs in loaded data (${stats.idAudit?.missingIdCount || 0}): ${(stats.idAudit?.missingIdPreview || []).join(', ') || '(none)'}`,
        '',
        'First excluded loaded-row samples:',
        sampleLines.join('\n') || '(none)'
      ].join('\n');
      alert(msg);
      console.debug('[Daily Genre] Remaining count audit detail', stats);
    }

    function genreEmoji(genre) {
      const c = (genre.categorypath || genre.subcategory || '').toLowerCase();
      if (c.includes('jazz')) return '🎷';
      if (c.includes('rock')) return '🎸';
      if (c.includes('classical')) return '🎹';
      if (c.includes('world')) return '🌍';
      if (c.includes('electronic')) return '🎛️';
      if (c.includes('hip hop')) return '🎤';
      if (c.includes('country')) return '🤠';
      if (c.includes('latin')) return '💃';
      if (c.includes('pop')) return '✨';
      return '🎵';
    }


    function openRandomListenedGenre() {
      const pool = genres.filter(g =>
        (g.status || '').toLowerCase() === 'listened' &&
        !!dateValue(g) &&
        String(g.rating || '').toLowerCase() !== 'zanger'
      );
      if (!pool.length) {
        showSaveToast('No listened genres available for Crate Dig yet.', true);
        return false;
      }
      const genre = pool[Math.floor(Math.random() * pool.length)];
      return openGenreDetail(genre, false, { fromCrateDig: true }) !== false;
    }

    function openCrateDig(event) {
      if (event) event.preventDefault();
      const opened = openRandomListenedGenre();
      if (opened) {
        document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
        document.getElementById('topCrateDigBtn')?.classList.add('active');
        requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }));
      }
    }

    function randomGenre() {
      const pool = getUnlistened();
      return pool[Math.floor(Math.random() * pool.length)];
    }

    function buildSpinnerPool() {
      const pool = getUnlistened().slice(0, 28);
      spinnerTrack.innerHTML = pool.map(g => `<div class="genre-chip">${escapeHtml(g.genre || 'Unknown')}</div>`).join('');
    }

    function animateSpinnerToGenre(genre) {
      const names = [];
      for (let i = 0; i < 26; i++) {
        const pick = randomGenre();
        if (pick) names.push(pick.genre || 'Genre');
      }
      names.push(genre.genre || 'Genre');
      for (let i = 0; i < 12; i++) {
        const pick = randomGenre();
        if (pick) names.push(pick.genre || 'Genre');
      }

      spinnerTrack.innerHTML = names.map(name => `<div class="genre-chip">${escapeHtml(name)}</div>`).join('');
      const chips = [...spinnerTrack.children];
      const targetIndex = 26;
      const targetChip = chips[targetIndex];
      const containerWidth = spinnerTrack.parentElement.clientWidth;
      const targetCenter = targetChip.offsetLeft + targetChip.offsetWidth / 2;
      const finalX = -(targetCenter - containerWidth / 2);

      spinnerTrack.animate(
        [
          { transform: 'translateX(0px)' },
          { transform: `translateX(${finalX}px)` }
        ],
        {
          duration: 2850,
          easing: 'cubic-bezier(0.10, 0.78, 0.16, 1)',
          fill: 'forwards'
        }
      );

      setTimeout(() => renderSpinResult(genre), 2880);
    }

    function spinWheel() {
      const genre = randomGenre();
      if (!genre) {
        alert('No unlistened genres remaining.');
        return;
      }
      currentGenre = genre;
      animateSpinnerToGenre(genre);
    }

    function renderSpinResult(genre) {
      spinResult.classList.add('show');
      spinResult.innerHTML = `
        <div class="eyebrow">Today’s pull</div>
        <h2 class="genre-title">${escapeHtml(genre.genre || 'Unknown genre')}</h2>
        <div class="subtle">${escapeHtml(categoryLine(genre))}</div>
        ${genre.vibe ? `<div class="vibe">${genreEmoji(genre)} ${escapeHtml(genre.vibe)}</div>` : ''}
        <p>${genre.summary ? escapeHtml(genre.summary) : '<span class="small">No summary added yet.</span>'}</p>
        <div class="meta-grid">
          <div class="meta-box">
            <h3>Key artists</h3>
            <p>${genre.key_artists ? escapeHtml(genre.key_artists) : 'Not added yet.'}</p>
          </div>
          <div class="meta-box">
            <h3>Suggested songs</h3>
            <p>${genre.suggested_songs ? escapeHtml(genre.suggested_songs) : 'Not added yet.'}</p>
          </div>
        </div>
        <div class="spin-actions" style="justify-content:flex-start; margin-top:20px;">
          <button class="btn btn-secondary" id="respinBtn">Respin / Skip</button>
          <button class="btn btn-danger" id="vetoBtn">Mark as Zanger Today</button>
          <button class="btn btn-primary" id="listenBtn">I’ll Listen to This</button>
        </div>
      `;

      const _respin = spinResult.querySelector('#respinBtn');
      const _veto   = spinResult.querySelector('#vetoBtn');
      const _listen = spinResult.querySelector('#listenBtn');
      if (_respin) _respin.onclick = spinWheel;
      if (_veto) _veto.onclick = () => markAsZangerToday(genre);
      if (_listen) _listen.onclick = () => {
        openGenreDetail(genre, true);
      };
    }

    function cleanPastedCitationArtifacts(value='') {
      return String(value || '')
        .replace(/:contentReference\[[^\]]*\]\{[^}]*\}/g, '')
        .replace(/contentReference\[[^\]]*\]\{[^}]*\}/g, '')
        .replace(/:oaicite\[[^\]]*\]\{[^}]*\}/g, '')
        .replace(/oaicite\[[^\]]*\]\{[^}]*\}/g, '')
        .replace(/\s+↗\s*$/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
    }

    function parseSongLinks(text) {
      const extractUrl = (value) => {
        const v = String(value || '').trim();
        const md = v.match(/^\s*\[[^\]]*\]\((https?:\/\/[^\s)]+)\)\s*$/i);
        if (md) return md[1].trim();
        const inline = v.match(/https?:\/\/[^\s)]+/i);
        return inline ? inline[0].trim() : '';
      };

      const extractMarkdownLabel = (value) => {
        const md = String(value || '').trim().match(/^\s*\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)\s*$/i);
        return md ? cleanPastedCitationArtifacts(md[1]) : '';
      };

      const stripUrlFromLabel = (value, url) => {
        let label = cleanPastedCitationArtifacts(value || '');
        if (url) label = label.replace(url, '').trim();
        label = label.replace(/^\[[^\]]*\]\(\s*\)$/i, '').trim();
        return label.replace(/^[-–—\s|]+|[-–—\s|]+$/g, '').trim();
      };

      const isPlaceholderUrl = (url) => /^https?:\/\/url\.com\/?$/i.test(String(url || '').trim());
      const isScore = (value) => /^[1-5]$/.test(String(value || '').trim());
      const lineParts = (line) => String(line || '').split('|').map(part => cleanPastedCitationArtifacts(part).trim());
      const prefixInfo = (line) => {
        let clean = String(line || '').trim();
        const flags = { isLevelUp:false, isAdd:false, isPromote:false };
        if (/^(?:🔼\s*)?LEVEL\s*UP\s*:/i.test(clean)) {
          flags.isLevelUp = true;
          clean = clean.replace(/^(?:🔼\s*)?LEVEL\s*UP\s*:\s*/i, '');
        } else if (/^(?:🔼\s*)?ADD\s*:/i.test(clean)) {
          flags.isAdd = true;
          clean = clean.replace(/^(?:🔼\s*)?ADD\s*:\s*/i, '');
        } else if (/^(?:🔼\s*)?PROMOTE\s*:/i.test(clean)) {
          flags.isPromote = true;
          clean = clean.replace(/^(?:🔼\s*)?PROMOTE\s*:\s*/i, '');
        }
        return { clean, ...flags };
      };

      const lines = String(text || '').replace(/\r/g, '').split('\n').map(s => s.trim()).filter(Boolean);
      const songs = [];

      for (const rawLine of lines) {
        const { clean: line, isLevelUp, isAdd, isPromote } = prefixInfo(rawLine);
        const parts = lineParts(line);
        if (!parts.length) continue;

        const first = parts[0] || '';
        let url = extractUrl(first);
        const markdownLabel = extractMarkdownLabel(first);
        let score = null;
        let reason = '';
        let displayLabel = markdownLabel || stripUrlFromLabel(first, url);

        if (parts.length > 1 && isScore(parts[1])) {
          score = parts[1];
          reason = parts[2] || '';
          displayLabel = parts.slice(3).filter(Boolean).join(' | ') || displayLabel;
        } else if (parts.length > 1) {
          reason = parts[1] || '';
          displayLabel = parts.slice(2).filter(Boolean).join(' | ') || displayLabel;
        }

        if (!url) {
          const anyUrlPart = parts.find(part => extractUrl(part));
          if (anyUrlPart) url = extractUrl(anyUrlPart);
        }

        if (!displayLabel && !url && first && !isScore(first)) displayLabel = first;
        if (isPlaceholderUrl(url)) url = '';

        const genreTagMatch = reason.match(/@([\w\s-]+?)(\s*\||$)/);
        const pendingGenreTag = genreTagMatch ? genreTagMatch[1].trim().toLowerCase() : '';
        const cleanReason = pendingGenreTag ? reason.replace(/@[\w\s-]+?(\s*\||$)/, '$1').trim() : reason;
        const label = normalizeSongArtistAndTitle(displayLabel || '', '');

        const song = {
          url,
          score,
          reason: cleanReason,
          title: label.title,
          artist: label.artist,
          source: songUrlSource(url),
          added: new Date().toISOString().slice(0,10)
        };

        if (pendingGenreTag) song._pendingGenreTag = pendingGenreTag;
        if (isAdd) song.isAdd = true;
        if (isPromote) song.isPromote = true;
        if (isLevelUp) song.isLevelUp = true;

        if (!song.url && !song.title && !song.reason) continue;
        if (!isLevelUp && !isAdd && !isPromote && !song.url && !song.title) continue;

        if (isLevelUp && songs.length > 0) {
          songs[songs.length - 1].levelUp = song;
        } else {
          songs.push(song);
        }
      }

      return songs;
    }

    function showSaveToast(message, isError) {
      const el = document.getElementById('saveToast');
      if (!el) return;
      el.textContent = message;
      el.style.borderColor = isError ? 'var(--danger)' : 'var(--border)';
      el.style.color = isError ? 'var(--danger)' : 'var(--accent)';
      el.classList.add('show');
      clearTimeout(window.__saveToastTimer);
      window.__saveToastTimer = setTimeout(() => el.classList.remove('show'), 2200);
    }

    function normalizeSongUrl(url) {
      let value = String(url || '')
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/^(?:🔼\s*)?LEVEL\s*UP:\s*/i, '')
        .replace(/^(?:🔼\s*)?ADD:\s*/i, '')
        .replace(/^(?:🔼\s*)?PROMOTE:\s*/i, '')
        .trim();

      if (!value) return '';

      // Let pasted Discord/Markdown/notes work in URL fields, e.g.
      // [Track](https://open.spotify.com/track/abc?si=...), <url>, or
      // "Artist — Title https://open.spotify.com/track/abc".
      const markdownHref = value.match(/\]\((https?:\/\/[^\s)]+)\)/i);
      if (markdownHref) value = markdownHref[1];
      value = value.replace(/^<|>$/g, '').trim();

      const spotifyUri = value.match(/spotify:track:([A-Za-z0-9]{22})/i);
      if (spotifyUri) return `https://open.spotify.com/track/${spotifyUri[1]}`;

      const spotifyTrack = value.match(/https?:\/\/(?:open\.)?spotify\.com\/(?:intl-[a-z]{2}\/)?track\/([A-Za-z0-9]{22})(?:[?#][^\s]*)?/i);
      if (spotifyTrack) return `https://open.spotify.com/track/${spotifyTrack[1]}`;

      const rawSpotifyId = value.match(/^([A-Za-z0-9]{22})$/);
      if (rawSpotifyId) return `https://open.spotify.com/track/${rawSpotifyId[1]}`;

      const firstUrl = value.match(/https?:\/\/[^\s<>]+/i);
      if (firstUrl) return firstUrl[0].replace(/[),.;]+$/g, '');

      return value;
    }

    function isYoutubeUrl(url) {
      return /(?:youtube\.com|youtu\.be)/i.test(normalizeSongUrl(url || ''));
    }

    function youtubeVideoId(url='') {
      const value = normalizeSongUrl(url);
      if (!value) return '';
      const short = value.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/i);
      if (short) return short[1];
      const watch = value.match(/[?&]v=([A-Za-z0-9_-]{6,})/i);
      if (watch) return watch[1];
      const embed = value.match(/youtube\.com\/(?:embed|shorts)\/([A-Za-z0-9_-]{6,})/i);
      return embed ? embed[1] : '';
    }

    function songUrlSource(url='') {
      const value = normalizeSongUrl(url);
      if (/spotify\.com\/track\//i.test(value) || /^spotify:track:/i.test(value)) return 'spotify';
      if (isYoutubeUrl(value)) return 'youtube';
      return value ? 'web' : 'manual';
    }

    function sourceBadgeHtml(source='') {
      const key = String(source || '').toLowerCase();
      if (key === 'youtube') return '<span class="song-source-badge youtube">YouTube</span>';
      if (key === 'web' || key === 'other') return '<span class="song-source-badge web">Web</span>';
      return '';
    }
    
  function normalizeSongArtistAndTitle(title='', artist='') {
    let normalizedTitle = cleanPastedCitationArtifacts(title);
    let normalizedArtist = cleanPastedCitationArtifacts(artist);
    if (!normalizedArtist) {
      const match = normalizedTitle.match(/^(.+?)\s+[—–]\s+(.+)$/);
      if (match) {
        normalizedArtist = cleanPastedCitationArtifacts(match[1]);
        normalizedTitle = cleanPastedCitationArtifacts(match[2]);
      }
    }
    return { title: normalizedTitle, artist: normalizedArtist };
  }

  function normalizeSongsListened(arr) {
    return (arr || []).map(s => {
      const rawUrl = String(s?.url || '');
      const isLevelUp = !!s?.isLevelUp || /^(?:🔼\s*)?LEVEL\s*UP:\s*/i.test(rawUrl);
      const isAdd = !!s?.isAdd || /^(?:🔼\s*)?ADD:\s*/i.test(rawUrl);
      const reaction = [1,2,3].includes(Number(s?.reaction)) ? Number(s.reaction) : null;
      const originFit = [1,2,3,4,5].includes(Number(s?.originFit)) ? Number(s.originFit) : null;
      const nominatedFit = [1,2,3,4,5].includes(Number(s?.nominatedFit)) ? Number(s.nominatedFit) : null;
      const promotedFromFit = [1,2,3,4,5].includes(Number(s?.promotedFromFit)) ? Number(s.promotedFromFit) : null;
      const parsedReleaseYear = Number(s?.releaseYear || String(s?.releaseDate || '').slice(0, 4));
      const releaseYear = Number.isInteger(parsedReleaseYear) && parsedReleaseYear > 1800 && parsedReleaseYear < 2200 ? parsedReleaseYear : null;
      const songLabel = normalizeSongArtistAndTitle(s?.title || '', s?.artist || '');
      return {
        url: rawUrl,
        score: s?.score ?? null,
        reason: cleanPastedCitationArtifacts(s?.reason || ''),
        title: songLabel.title,
        artist: songLabel.artist,
        artwork: s?.artwork || '',
        source: s?.source || songUrlSource(rawUrl || s?.spotifyUrl || ''),
        added: s?.added || '',
        spotifyId: s?.spotifyId || '',
        spotifyUrl: s?.spotifyUrl || '',
        album: s?.album || '',
        artists: Array.isArray(s?.artists) ? s.artists.filter(Boolean) : [],
        durationMs: Number(s?.durationMs || 0) || null,
        isrc: s?.isrc || '',
        spotifyMetadataFetched: Boolean(s?.spotifyMetadataFetched || s?.spotifyId),
        spotifyMetadataFetchedAt: s?.spotifyMetadataFetchedAt || '',
        eraYear: s?.eraYear || '',
        eraDecade: s?.eraDecade || '',
        releaseDate: s?.releaseDate || '',
        releaseYear,
        releasePrecision: s?.releasePrecision || '',
        releaseSource: s?.releaseSource || '',
        reaction,
        isPending: !!s?.isPending,
        pendingFrom: s?.pendingFrom || '',
        originFit,
        nominatedFit,
        promotedFrom: s?.promotedFrom || '',
        promotedFromFit,
        isLevelUp,
        isAdd,
        isPromote: !!s?.isPromote,
        _pendingGenreTag: s?._pendingGenreTag || '',
        levelUp: s?.levelUp ? normalizeSongsListened([s.levelUp])[0] : null,
      };
    });
  }

    function songUrlLooksPlaceholder(url = '') {
      const value = String(url || '').trim();
      if (!value) return false;
      return /^https?:\/\/(?:www\.)?(?:url\.com|example\.com|example\.org)(?:\/)?$/i.test(value);
    }

    function songIdentity(song) {
      const isrc = String(song?.isrc || '').trim().toLowerCase();
      if (isrc) return `isrc:${isrc}`;
      const spotifyId = String(song?.spotifyId || '').trim().toLowerCase();
      if (spotifyId) return `spotify:${spotifyId}`;
      const normalizedUrl = normalizeSongUrl(song?.url || song?.spotifyUrl || '').trim().toLowerCase();
      const spotifyTrack = normalizedUrl.match(/spotify\.com\/track\/([a-z0-9]+)/i);
      if (spotifyTrack) return `spotify:${spotifyTrack[1].toLowerCase()}`;
      if (normalizedUrl && !songUrlLooksPlaceholder(normalizedUrl)) return `url:${normalizedUrl}`;
      return `meta:${String(song?.artist || '').trim().toLowerCase()}|${String(song?.title || '').trim().toLowerCase()}`;
    }

    function songIdentityKeys(song) {
      const keys = [];
      const add = key => {
        const clean = String(key || '').trim().toLowerCase();
        if (clean && !keys.includes(clean)) keys.push(clean);
      };
      const canonicalSongTitle = value => String(value || '')
        .toLowerCase()
        .replace(/\s*[\(\[]?(?:\d{4}\s*)?(?:remaster(?:ed)?|mono|stereo|single version|single edit|radio edit|edit|version)[^\)\]]*[\)\]]?\s*$/i, '')
        .replace(/\s*-\s*(?:\d{4}\s*)?(?:remaster(?:ed)?|mono|stereo|single version|single edit|radio edit|edit|version)\s*$/i, '')
        .replace(/\s+/g, ' ')
        .trim();

      const isrc = String(song?.isrc || '').trim().toLowerCase();
      if (isrc) add(`isrc:${isrc}`);

      const spotifyId = String(song?.spotifyId || '').trim().toLowerCase();
      if (spotifyId) add(`spotify:${spotifyId}`);

      const normalizedUrl = normalizeSongUrl(song?.url || song?.spotifyUrl || '').trim().toLowerCase();
      const spotifyTrack = normalizedUrl.match(/spotify\.com\/track\/([a-z0-9]+)/i);
      if (spotifyTrack) add(`spotify:${spotifyTrack[1].toLowerCase()}`);
      const isPlaceholderUrl = songUrlLooksPlaceholder(normalizedUrl);
      if (normalizedUrl && !isPlaceholderUrl) add(`url:${normalizedUrl}`);
      
      const title = String(song?.title || '').trim().toLowerCase();
      const artist = String(song?.artist || '').trim().toLowerCase();
      if (title || artist) add(`meta:${artist}|${title}`);

      const canonicalTitle = canonicalSongTitle(song?.title || '');
      if (canonicalTitle || artist) add(`canon:${artist}|${canonicalTitle}`);

      return keys.length ? keys : [songIdentity(song)];
    }
    
    function songsIdentityMatch(a, bOrKey) {
      const aKeys = new Set(songIdentityKeys(a));
      if (typeof bOrKey === 'string') return aKeys.has(String(bOrKey || '').trim().toLowerCase());
      return songIdentityKeys(bOrKey).some(key => aKeys.has(key));
    }

    function eachSongInLog(arr, callback) {
      (arr || []).forEach(song => {
        callback(song);
        if (song.levelUp) callback(song.levelUp);
      });
    }

    function collectSongReactionSnapshot(arr) {
      const snapshot = [];
      eachSongInLog(inflateSongsFromStorage(arr || []), song => {
        if (song.reaction != null) snapshot.push([songIdentity(song), Number(song.reaction)]);
      });
      return snapshot.sort((a, b) => String(a[0]).localeCompare(String(b[0])));
    }

    function mergeSongMetadata(parsedSongs, previousSongs) {
      const stored = new Map();
      eachSongInLog(inflateSongsFromStorage(previousSongs || []), song => {
        songIdentityKeys(song).forEach(key => stored.set(key, song));
      });
      const apply = song => {
        const prior = songIdentityKeys(song).map(key => stored.get(key)).find(Boolean);
        if (prior) {
          if (prior.reaction != null) song.reaction = prior.reaction;
          if (prior.listenerNote) song.listenerNote = prior.listenerNote;
          if (prior.songNote && !song.listenerNote) song.listenerNote = prior.songNote;
          if (prior.promotedFrom) song.promotedFrom = prior.promotedFrom;
          if (prior.promotedFromFit != null) song.promotedFromFit = prior.promotedFromFit;
          if (prior.spotifyId) song.spotifyId = prior.spotifyId;
          if (prior.spotifyUrl) song.spotifyUrl = prior.spotifyUrl;
          if (prior.artwork) song.artwork = prior.artwork;
          if (prior.source) song.source = prior.source;
          if (prior.album) song.album = prior.album;
          if (Array.isArray(prior.artists) && prior.artists.length) song.artists = prior.artists;
          if (prior.durationMs != null) song.durationMs = prior.durationMs;
          if (prior.isrc) song.isrc = prior.isrc;
          if (prior.explicit != null) song.explicit = !!prior.explicit;
          if (prior.popularity != null) song.popularity = Number(prior.popularity);
          if (prior.trackNumber != null) song.trackNumber = Number(prior.trackNumber);
          if (prior.discNumber != null) song.discNumber = Number(prior.discNumber);
          if (prior.albumType) song.albumType = prior.albumType;
          if (prior.albumTotalTracks != null) song.albumTotalTracks = Number(prior.albumTotalTracks);
          if (prior.spotifyMetadataFetched) song.spotifyMetadataFetched = true;
          if (prior.spotifyMetadataFetchedAt) song.spotifyMetadataFetchedAt = prior.spotifyMetadataFetchedAt;
          if (prior.eraYear) song.eraYear = prior.eraYear;
          if (prior.eraDecade) song.eraDecade = prior.eraDecade;
          if (prior.releaseDate) song.releaseDate = prior.releaseDate;
          if (prior.releaseYear != null) song.releaseYear = prior.releaseYear;
          if (prior.releasePrecision) song.releasePrecision = prior.releasePrecision;
          if (prior.releaseSource) song.releaseSource = prior.releaseSource;
        }
        if (song.levelUp) apply(song.levelUp);
        return song;
      };
      return (parsedSongs || []).map(apply);
    }

    function setSongReaction(encodedKey, value) {
      if (!currentGenre) return;
      const key = decodeURIComponent(encodedKey || '');
      const reaction = [1,2,3].includes(Number(value)) ? Number(value) : null;
      const songs = inflateSongsFromStorage(currentGenre.songs_listened || []);
      let updated = false;
      eachSongInLog(songs, song => {
        if (songIdentity(song) === key) {
          song.reaction = song.reaction === reaction ? null : reaction;
          updated = true;
        }
      });
      if (!updated) return;
      currentGenre.songs_listened = songs;
      stagedQueueReactionKeys.add(stagedReactionKey(currentGenre.id, key));
      libraryUpdatesPending = true;
      setUnsavedState(true);
      toggleLibrarySaveButton(true);
      const restore = preserveScrollSnapshot();
      loadListenScreen(currentGenre, { preserveDirty: true, skipSpotifyHydration: true });
      applyDetailEditMode(detailEditMode);
      restore();
      showSaveToast('Reaction selected — use the floating Save button to persist it.', false);
    }

    const GENRE_RATING_LABELS = {
      '5': 'Inject This Into My Veins',
      '4': 'Hell Yeah, Run It Back',
      '3': 'Glad I Heard It',
      '2': 'Respectfully, Nah',
      '1': 'Get This Off My Turntable',
      'zanger': 'Zanger'
    };

    function genreRatingLabel(value) {
      return GENRE_RATING_LABELS[String(value || '')] || 'Unrated';
    }

    function genreRatingStarsOnly(genre) {
      if (!genre || !genre.rating) return 'Unrated';
      if (String(genre.rating) === 'zanger') return '✕ Zanger';
      const n = Number(genre.rating);
      if (!Number.isFinite(n) || n < 1 || n > 5) return 'Unrated';
      return `${'★'.repeat(n)}${'☆'.repeat(5 - n)}`;
    }

    function isSameFavoriteSong(genre, song) {
      const favUrl = normalizeSongUrl(genre?.favoritesongurl || '');
      const songUrl = normalizeSongUrl(song?.url || song?.spotifyUrl || '');
      if (favUrl || songUrl) return !!favUrl && !!songUrl && favUrl === songUrl;

      const favTitle = cleanPastedCitationArtifacts(genre?.favoritesong || '').toLowerCase();
      const favArtist = cleanPastedCitationArtifacts(genre?.favoriteartist || '').toLowerCase();
      const songTitle = cleanPastedCitationArtifacts(song?.title || '').toLowerCase();
      const songArtist = cleanPastedCitationArtifacts(song?.artist || '').toLowerCase();
      return !!favTitle && !!songTitle && favTitle === songTitle && (!favArtist || !songArtist || favArtist === songArtist);
    }

    function renderGenreRatingPanel(genre) {
      if (!genre) return '';
      const active = String(genre.rating || '');
      return `<div class="view-rating-panel">
        <div class="view-rating-head">
          <div><div class="eyebrow" style="margin:0;">Genre Rating</div><div class="small">Listening action — available outside Setup Editor.</div></div>
          ${libraryUpdatesPending ? '<span class="inline-listening-save-hint">● Unsaved</span>' : ''}
        </div>
        <div class="view-rating-stars" aria-label="Genre rating controls">
          ${[1,2,3,4,5].map(n => `<button type="button" class="view-rating-star ${active === String(n) ? 'active' : ''}" onclick="setGenreRatingFromView(${n})" title="${escapeHtml(genreRatingLabel(n))}" aria-label="${n} stars, ${escapeHtml(genreRatingLabel(n))}">★</button>`).join('')}
          <button type="button" class="view-rating-zanger ${active === 'zanger' ? 'active' : ''}" onclick="setGenreRatingFromView('zanger')" title="Zanger">✕ Zanger</button>
        </div>
      </div>`;
    }

    function renderListeningActionsPanel(genre) {
      if (!genre) return '';
      const contender = !!genre.monthlycontender;
      const favorite = !!genre.monthfavorite;
      const least = !!genre.monthleastfavorite;
      const genreId = encodeURIComponent(String(genre.id || ''));
      return `<div class="view-rating-panel listening-actions-panel">
        <div class="view-rating-head">
          <div><div class="eyebrow" style="margin:0;">Listening Actions</div><div class="small">Use these while/after listening. Setup Editor is only for curation text, song uploads, and song descriptions.</div></div>
          ${libraryUpdatesPending ? '<span class="inline-listening-save-hint">● Unsaved</span>' : ''}
        </div>
        <div class="view-rating-stars" aria-label="Listening action controls">
          <button type="button" class="view-rating-zanger ${contender ? 'active' : ''}" onclick="setMonthlyFlagFromView('contender')" title="Toggle monthly contender">📌 Monthly contender</button>
          <button type="button" class="view-rating-star ${favorite ? 'active' : ''}" onclick="setMonthlyFlagFromView('favorite')" title="Toggle month favorite" aria-label="Toggle month favorite">★</button>
          <button type="button" class="view-rating-zanger ${least ? 'active' : ''}" onclick="setMonthlyFlagFromView('least')" title="Toggle month least favorite">Least favorite</button>
          ${(contender || favorite || least) ? '<button type="button" class="btn btn-secondary btn-tiny" onclick="clearMonthlyFlagsFromView()">Clear month flags</button>' : ''}
          <button type="button" class="spotify-queue-btn" onclick="openSpotifyPlaylistModal('${genreId}')">＋ Playlist</button>
        </div>
      </div>`;
    }

    function markListeningUpdatePending() {
      libraryUpdatesPending = true;
      setUnsavedState(true);
      toggleLibrarySaveButton(true);
    }

    function setMonthlyFlagFromView(flag) {
      if (!currentGenre) return;
      if (!['contender', 'favorite', 'least'].includes(flag)) return;
      setListenDateTodayIfNeeded(currentGenre);
      if (flag === 'contender') {
        currentGenre.monthlycontender = !currentGenre.monthlycontender;
      } else if (flag === 'favorite') {
        const next = !currentGenre.monthfavorite;
        currentGenre.monthfavorite = next;
        if (next) currentGenre.monthleastfavorite = false;
      } else if (flag === 'least') {
        const next = !currentGenre.monthleastfavorite;
        currentGenre.monthleastfavorite = next;
        if (next) currentGenre.monthfavorite = false;
      }
      enforceMonthlyExclusiveFlags(currentGenre);
      markListeningUpdatePending();
      const restore = preserveScrollSnapshot();
      loadListenScreen(currentGenre, { preserveDirty: true, skipSpotifyHydration: true });
      applyDetailEditMode(detailEditMode);
      restore();
      showSaveToast('Monthly listening flag updated — use the floating Save button to persist it.', false);
    }

    function clearMonthlyFlagsFromView() {
      if (!currentGenre) return;
      currentGenre.monthlycontender = false;
      currentGenre.monthfavorite = false;
      currentGenre.monthleastfavorite = false;
      markListeningUpdatePending();
      const restore = preserveScrollSnapshot();
      loadListenScreen(currentGenre, { preserveDirty: true, skipSpotifyHydration: true });
      applyDetailEditMode(detailEditMode);
      restore();
      showSaveToast('Monthly flags cleared — use the floating Save button to persist it.', false);
    }

    function enforceMonthlyExclusiveFlags(genre) {
      if (!genre) return;
      const monthKey = (dateValue(genre) || '').slice(0, 7);
      if (!monthKey) return;
      if (genre.monthfavorite) {
        genres.forEach(g => {
          if (!g || g.id === genre.id) return;
          if ((dateValue(g) || '').slice(0, 7) === monthKey) g.monthfavorite = false;
        });
      }
      if (genre.monthleastfavorite) {
        genres.forEach(g => {
          if (!g || g.id === genre.id) return;
          if ((dateValue(g) || '').slice(0, 7) === monthKey) g.monthleastfavorite = false;
        });
      }
    }

    function setGenreRatingFromView(value) {
      if (!currentGenre) return;
      if (String(value) === 'zanger') {
        setListenDateTodayIfNeeded(currentGenre);
        currentGenre.rating = 'zanger';
        currentGenre.status = 'veto';
        currentGenre.rank_order = null;
      } else {
        const rating = Number(value);
        if (!Number.isFinite(rating) || rating < 1 || rating > 5) return;
        setListenDateTodayIfNeeded(currentGenre);
        currentGenre.rating = String(rating);
        currentGenre.status = 'listened';
        selectedRating = String(rating);
        if (currentGenre.rank_order == null) {
          currentGenre.rank_order = nextRankOrderForRating(currentGenre.rating);
        }
        ensureRankOrderForRating(currentGenre);
      }
      libraryUpdatesPending = true;
      setUnsavedState(true);
      toggleLibrarySaveButton(true);
      loadListenScreen(currentGenre, { preserveDirty: true, skipSpotifyHydration: true });
      applyDetailEditMode(detailEditMode);
      showSaveToast('Genre rating updated — use the floating Save button to persist it.', false);
    }

    function makeSongFavorite(encodedKey) {
      if (!currentGenre) return;
      const key = decodeURIComponent(encodedKey || '');
      let selected = null;
      const songs = inflateSongsFromStorage(currentGenre.songs_listened || []);
      eachSongInLog(songs, song => {
        if (!selected && songIdentity(song) === key) selected = song;
      });
      if (!selected) {
        showSaveToast('Could not find that song to mark favorite.', true);
        return;
      }

      const wasFavorite = isSameFavoriteSong(currentGenre, selected);
      if (wasFavorite) {
        currentGenre.favoritesong = '';
        currentGenre.favoriteartist = '';
        currentGenre.favoritesongurl = '';
        currentGenre.favoritesongartwork = '';
      } else {
        currentGenre.favoritesong = cleanPastedCitationArtifacts(selected.title || '');
        currentGenre.favoriteartist = cleanPastedCitationArtifacts(selected.artist || '');
        currentGenre.favoritesongurl = normalizeSongUrl(selected.url || selected.spotifyUrl || '');
        currentGenre.favoritesongartwork = selected.artwork || '';
      }

      libraryUpdatesPending = true;
      setUnsavedState(true);
      toggleLibrarySaveButton(true);
      loadListenScreen(currentGenre, { preserveDirty: true, skipSpotifyHydration: true });
      applyDetailEditMode(detailEditMode);
      showSaveToast(wasFavorite ? 'Favorite track cleared — use the floating Save button to persist it.' : 'Favorite track updated — use the floating Save button to persist it.', false);
    }

    function genreRatingHeroMarkup(genre) {
      const active = String(genre?.rating || '');
      const label = active ? genreRatingLabel(active) : 'Unrated';
      const activeNumber = /^\d+$/.test(active) ? Number(active) : 0;
      const starButtons = [1, 2, 3, 4, 5].map(n => {
        const isActive = activeNumber >= n;
        return `<button type="button" class="genre-header-star ${isActive ? 'active' : ''}" onclick="event.stopPropagation(); setGenreRatingFromView(${n})" title="${escapeHtml(genreRatingLabel(n))}" aria-label="Set genre rating to ${n} stars, ${escapeHtml(genreRatingLabel(n))}">${isActive ? '★' : '☆'}</button>`;
      }).join('');
      const zangerActive = active === 'zanger';
      return `<span class="genre-header-rating" role="group" aria-label="Genre rating: ${escapeHtml(label)}">
        <span class="genre-header-rating-label">${escapeHtml(label)}</span>
        <span class="genre-header-stars">${starButtons}</span>
        <button type="button" class="genre-header-zanger ${zangerActive ? 'active' : ''}" onclick="event.stopPropagation(); setGenreRatingFromView('zanger')" title="Zanger" aria-label="Mark genre as Zanger">✕</button>
      </span>`;
    }

    function genreRatingDisplay(genre) {
      if (!genre || !genre.rating) return 'Unrated';
      if (String(genre.rating) === 'zanger') return '✕ Zanger';
      const n = Number(genre.rating);
      return `${'★'.repeat(n)}${'☆'.repeat(5 - n)} ${genreRatingLabel(genre.rating)}`;
    }

    function reactionEmoji(value) {
      return Number(value) === 3 ? '👍' : Number(value) === 2 ? '🤷' : Number(value) === 1 ? '👎' : '—';
    }

    function reactionLabel(value) {
      return Number(value) === 3 ? 'I Fuck With This' : Number(value) === 2 ? 'Meh, It’s Fine' : Number(value) === 1 ? 'Fuck Off' : 'Unrated';
    }

    function genreReactionSongs(genre) {
      const result = [];
      inflateSongsFromStorage(genre?.songs_listened || []).filter(song => !song.isPending).forEach(song => {
        result.push(song);
        if (song.levelUp) result.push(song.levelUp);
      });
      return result;
    }

    function genreReactionCounts(genre) {
      const counts = { 3:0, 2:0, 1:0, unrated:0 };
      genreReactionSongs(genre).forEach(song => {
        const value = Number(song.reaction || 0);
        if ([1,2,3].includes(value)) counts[value] += 1;
        else counts.unrated += 1;
      });
      return counts;
    }

    function renderGenreReactionSummary(genre) {
      const counts = genreReactionCounts(genre);
      const total = counts[1] + counts[2] + counts[3] + counts.unrated;
      if (!total) return '';
      return `<div class="track-reaction-summary">
        <div class="track-reaction-summary-head">
          <div class="eyebrow" style="margin:0;">Track Reactions</div>
          ${libraryUpdatesPending ? '<span class="inline-listening-save-hint">● Unsaved</span>' : ''}
        </div>
        <div class="track-reaction-counts">
          <div class="track-reaction-counter"><span class="emoji">👍</span><strong>${counts[3]}</strong><small>I Fuck With This</small></div>
          <div class="track-reaction-counter"><span class="emoji">🤷</span><strong>${counts[2]}</strong><small>Meh, It’s Fine</small></div>
          <div class="track-reaction-counter"><span class="emoji">👎</span><strong>${counts[1]}</strong><small>Fuck Off</small></div>
          <div class="track-reaction-counter"><span class="emoji">—</span><strong>${counts.unrated}</strong><small>Unrated</small></div>
        </div>
        <div class="genre-share-actions">
          <button type="button" class="btn btn-secondary btn-tiny" onclick="copyGenreReactionRecap(false)">Copy Reaction Totals</button>
          <button type="button" class="btn btn-secondary btn-tiny" onclick="copyGenreReactionRecap(true)">Copy Reaction Track List</button>
        </div>
        <div class="small" style="margin-top:8px;">Reaction recaps are separate from the genre summary / description post.</div>
      </div>`;
    }

    function buildGenreReactionRecap(includeTracks=false) {
      if (!currentGenre) return '';
      const counts = genreReactionCounts(currentGenre);
      let text = `**${String(currentGenre.genre || 'UNKNOWN').toUpperCase()} — Track Reactions**\n\n`;
      text += `👍 I Fuck With This: ${counts[3]}\n`;
      text += `🤷 Meh, It’s Fine: ${counts[2]}\n`;
      text += `👎 Fuck Off: ${counts[1]}\n`;
      text += `— Unrated: ${counts.unrated}`;
      if (includeTracks) {
        const songs = genreReactionSongs(currentGenre);
        [3,2,1,0].forEach(value => {
          const group = songs.filter(song => value ? Number(song.reaction) === value : ![1,2,3].includes(Number(song.reaction)));
          if (!group.length) return;
          text += `\n\n${reactionEmoji(value)} ${reactionLabel(value)}\n`;
          text += group.map(song => `• ${(song.artist ? `${song.artist} — ` : '')}${song.title || 'Untitled track'}`).join('\n');
        });
      }
      return text;
    }

    async function copyGenreReactionRecap(includeTracks=false) {
      const text = buildGenreReactionRecap(includeTracks);
      if (!text) return;
      await navigator.clipboard.writeText(text);
      showSaveToast(includeTracks ? 'Reaction track list copied.' : 'Reaction totals copied.', false);
    }


    function buildSongsBulkEditorText(genre) {
      const displaySongLabel = song => {
        const title = String(song?.title || '').trim();
        const artist = String(song?.artist || '').trim();
        return artist && title ? `${artist} — ${title}` : (title || null);
      };
      return inflateSongsFromStorage(genre?.songs_listened || []).filter(song => !song.isPending).flatMap(song => {
        const prefix = song.isPromote ? '🔼 PROMOTE: ' : (song.isAdd ? '🔼 ADD: ' : '');
        const reason = song._pendingGenreTag ? `${song.reason || ''} @${song._pendingGenreTag}`.trim() : (song.reason || null);
        const lines = [
          prefix + [normalizeSongUrl(song.url), song.score != null ? song.score : null, reason, displaySongLabel(song)]
            .filter(value => value !== null && value !== '')
            .join(' | ')
        ];
        if (song.levelUp) {
          lines.push('🔼 LEVEL UP: ' + [
            normalizeSongUrl(song.levelUp.url),
            song.levelUp.score != null ? song.levelUp.score : null,
            song.levelUp.reason || null,
            displaySongLabel(song.levelUp)
          ].filter(value => value !== null && value !== '').join(' | '));
        }
        return lines;
      }).join('\n');
    }
    
    function queueModelIsAuthoritative() {
      return !!window.__dailyGenreQueueModelAuthoritativeUntil && Date.now() < Number(window.__dailyGenreQueueModelAuthoritativeUntil || 0);
    }

    function syncBulkDraftIntoSongModel(options = {}) {
      if (!currentGenre) return;
      const textarea = document.getElementById('songsListenedBulk');
      if (!textarea) return;
      const expected = buildSongsBulkEditorText(currentGenre);
      if (textarea.value === expected) return;

      // Inline queue actions (URL overwrite, Spotify refresh, remove/move) update
      // currentGenre.songs_listened directly, then repaint the hidden bulk textarea.
      // During that short authoritative window, do not let an older textarea snapshot
      // overwrite the live model on save. This was causing multi-row URL edits to
      // persist only the most recent row, or to wipe a prior corrected URL.
      if (!options.force && queueModelIsAuthoritative()) {
        textarea.value = expected;
        return;
      }

      const previous = inflateSongsFromStorage(currentGenre.songs_listened || []).filter(song => !song.isPending);
      const merged = mergeSongMetadata(parseSongLinks(textarea.value), previous);
      const seenKeys = new Set();
      currentGenre.songs_listened = merged.filter(song => {
        const k = songIdentity(song);
        if (!k || seenKeys.has(k)) return false;
        seenKeys.add(k);
        return true;
      });
    }

    function syncSongsBulkEditorFromModel() {
      const textarea = document.getElementById('songsListenedBulk');
      if (!textarea || !currentGenre) return;
      textarea.value = buildSongsBulkEditorText(currentGenre);
      window.__dailyGenreSuppressBulkSongSyncUntil = Date.now() + 60000;
      window.__dailyGenreQueueModelAuthoritativeUntil = Date.now() + 60000;
    }

    function findOfficialSongByIdentity(key) {
      const songs = inflateSongsFromStorage(currentGenre?.songs_listened || []).filter(song => !song.isPending);
      currentGenre.songs_listened = songs;
      for (let index = 0; index < songs.length; index += 1) {
        if (songsIdentityMatch(songs[index], key)) return { song: songs[index], parent: null, index, songs };
        if (songs[index].levelUp && songsIdentityMatch(songs[index].levelUp, key)) {
          return { song: songs[index].levelUp, parent: songs[index], index, songs };
        }
      }
      return null;
    }


    function encodeSongKeyForInline(song) {
      // encodeURIComponent intentionally leaves apostrophes unescaped; inline onclick strings do not.
      return encodeURIComponent(songIdentity(song)).replace(/[!'()*]/g, ch => `%${ch.charCodeAt(0).toString(16).toUpperCase()}`);
    }

    function decodeInlineSongKey(encodedKey) {
      try { return decodeURIComponent(encodedKey || ''); }
      catch (err) { return String(encodedKey || ''); }
    }

    function findOfficialSongByPath(path) {
      if (!currentGenre) return null;
      const match = String(path || '').match(/^song:(\d+)(?:\.(levelUp))?$/);
      if (!match) return null;
      const songs = inflateSongsFromStorage(currentGenre.songs_listened || []).filter(song => !song.isPending);
      currentGenre.songs_listened = songs;
      const index = Number(match[1]);
      if (!Number.isInteger(index) || index < 0 || index >= songs.length) return null;
      if (match[2] === 'levelUp') {
        if (!songs[index]?.levelUp) return null;
        return { song: songs[index].levelUp, parent: songs[index], index, songs };
      }
      return { song: songs[index], parent: null, index, songs };
    }

    function findEditableSongTarget(encodedKey, pendingIndex, path = '') {
      if (!currentGenre) return null;
      const isPendingEdit = Number.isInteger(pendingIndex) && pendingIndex >= 0;
      if (isPendingEdit) {
        currentGenre.pending_songs = normalizePendingSongs(currentGenre.pending_songs || []);
        const song = currentGenre.pending_songs[pendingIndex];
        return song ? { song, parent: null, index: pendingIndex, songs: currentGenre.pending_songs, isPending: true } : null;
      }

      const byPath = findOfficialSongByPath(path);
      if (byPath?.song) return byPath;

      const key = decodeInlineSongKey(encodedKey);
      const meaningfulKey = meaningfulSongIdentityKey(key);
      if (meaningfulKey) {
        const byIdentity = findOfficialSongByIdentity(key);
        if (byIdentity?.song) return byIdentity;
      }

      // Last-resort fallback for malformed/old curation rows: compare against common identity variants
      // without reparsing the editor again. This avoids silent failures on bad ALT TAKE / LEVEL UP rows.
      const songs = inflateSongsFromStorage(currentGenre.songs_listened || []).filter(song => !song.isPending);
      currentGenre.songs_listened = songs;
      if (meaningfulKey) {
        for (let index = 0; index < songs.length; index += 1) {
          const parent = songs[index];
          if (meaningfulSongIdentityKey(songIdentity(parent)) === meaningfulKey || songIdentityKeys(parent).map(meaningfulSongIdentityKey).includes(meaningfulKey)) {
            return { song: parent, parent: null, index, songs };
          }
          if (parent.levelUp && (meaningfulSongIdentityKey(songIdentity(parent.levelUp)) === meaningfulKey || songIdentityKeys(parent.levelUp).map(meaningfulSongIdentityKey).includes(meaningfulKey))) {
            return { song: parent.levelUp, parent, index, songs };
          }
        }
      }
      return null;
    }


    function looseSongTextKey(song) {
      const clean = value => String(value || '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      return `${clean(song?.artist || (Array.isArray(song?.artists) ? song.artists.join(' ') : ''))}|${clean(song?.title || '')}`;
    }

    function queueDuplicateTextKey(song) {
      const clean = value => String(value || '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\b(feat|ft|remix|remastered|version|explicit|clean)\b/g, ' ')
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\b(the|a|an|el|la|los|las|le|les|un|una)\b/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      return `${clean(song?.artist || (Array.isArray(song?.artists) ? song.artists.join(' ') : ''))}|${clean(song?.title || '')}`;
    }

    function meaningfulQueueTextKey(key = '') {
      const value = String(key || '').trim();
      if (!value || value === '|') return '';
      const [artist = '', title = ''] = value.split('|');
      // A blank/blank key means multiple placeholder rows would look identical.
      // Do not use it for duplicate repair or URL overwrites.
      return (artist.trim() || title.trim()) ? value : '';
    }

    function meaningfulSongIdentityKey(key = '') {
      const value = String(key || '').trim().toLowerCase();
      if (!value) return '';
      if (value === 'meta:|' || /^meta:\s*\|\s*$/.test(value)) return '';
      return value;
    }

    function canonicalQueueUrlKey(url='') {
      const value = normalizeSongUrl(url || '');
      if (!value || songUrlLooksPlaceholder(value)) return '';
      return value.toLowerCase();
    }

    function queueSongMergeWeight(song) {
      if (!song) return 0;
      let weight = 0;
      if (song.artwork || song.albumArt) weight += 16;
      if (song.spotifyMetadataFetched) weight += 8;
      if (song.spotifyId) weight += 8;
      if (song.album) weight += 4;
      if (song.releaseYear || song.releaseDate) weight += 3;
      if (song.durationMs) weight += 2;
      if (song.isrc) weight += 2;
      if (song.reaction) weight += 1;
      if (song.reason) weight += 1;
      return weight;
    }

    function mergeSongObjectsInPlace(primary, duplicate) {
      if (!primary || !duplicate || primary === duplicate) return primary;
      const fields = ['url','spotifyUrl','spotifyId','title','artist','album','artwork','albumArt','releaseDate','releasePrecision','releaseSource','isrc','source','reason','listenerNote','songNote','spotifyMetadataFetchedAt'];
      fields.forEach(key => {
        if ((primary[key] == null || primary[key] === '') && duplicate[key] != null && duplicate[key] !== '') primary[key] = duplicate[key];
      });
      if (!Array.isArray(primary.artists) || !primary.artists.length) primary.artists = Array.isArray(duplicate.artists) ? duplicate.artists.slice() : primary.artists;
      ['releaseYear','durationMs','score','reaction','popularity','trackNumber','discNumber','albumTotalTracks'].forEach(key => {
        if ((primary[key] == null || primary[key] === '') && duplicate[key] != null && duplicate[key] !== '') primary[key] = duplicate[key];
      });
      if (!primary.spotifyMetadataFetched && duplicate.spotifyMetadataFetched) primary.spotifyMetadataFetched = true;
      if (!primary.levelUp && duplicate.levelUp) primary.levelUp = duplicate.levelUp;
      if (!primary.artwork && primary.albumArt) primary.artwork = primary.albumArt;
      if (!primary.albumArt && primary.artwork) primary.albumArt = primary.artwork;
      return primary;
    }

    function clonePlainObject(value) {
      if (!value || typeof value !== 'object') return null;
      try { return JSON.parse(JSON.stringify(value)); }
      catch (_) { return { ...value }; }
    }

    function identityEditKeyFromSong(song) {
      if (!song || !song.isIdentityTrack) return '';
      const type = String(song.identityType || '').toLowerCase();
      if (!type) return '';
      const normalizedType = type === 'popular' ? 'media' : type;
      if (normalizedType !== 'seminal' && normalizedType !== 'media') return '';
      const index = normalizedType === 'seminal' ? -1 : Number(song.identityIndex ?? -1);
      return `identity:${normalizedType}:${Number.isFinite(index) ? index : -1}`;
    }

    function identityEditKeyFromAnchor(type, index) {
      const normalizedType = String(type || '').toLowerCase() === 'popular' ? 'media' : String(type || '').toLowerCase();
      if (normalizedType !== 'seminal' && normalizedType !== 'media') return '';
      const normalizedIndex = normalizedType === 'seminal' ? -1 : Number(index ?? -1);
      return `identity:${normalizedType}:${Number.isFinite(normalizedIndex) ? normalizedIndex : -1}`;
    }

    function snapshotIdentityQueueState(genre) {
      const snapshot = { songsByIdentityKey: {}, anchorsByIdentityKey: {} };
      if (!genre) return snapshot;
      try {
        inflateSongsFromStorage(genre.songs_listened || []).filter(song => song && !song.isPending).forEach(song => {
          const key = identityEditKeyFromSong(song);
          if (key) snapshot.songsByIdentityKey[key] = clonePlainObject(song);
        });
      } catch (_) {}
      try {
        const sem = (genre.identity && genre.identity.seminalTrack) || genre.seminal_song || null;
        if (sem && typeof sem === 'object') snapshot.anchorsByIdentityKey[identityEditKeyFromAnchor('seminal', -1)] = clonePlainObject(sem);
        const media = (genre.identity && Array.isArray(genre.identity.mediaTouchstones) && genre.identity.mediaTouchstones.length)
          ? genre.identity.mediaTouchstones
          : (Array.isArray(genre.media_touchstones) ? genre.media_touchstones : []);
        media.forEach((track, index) => {
          if (track && typeof track === 'object') snapshot.anchorsByIdentityKey[identityEditKeyFromAnchor('media', index)] = clonePlainObject(track);
        });
      } catch (_) {}
      return snapshot;
    }

    function identitySnapshotHasUsefulTrackData(track) {
      return !!(track && typeof track === 'object' && (
        track.spotifyId || track.spotifyUrl || track.url || track.artwork || track.albumArt ||
        track.album || track.releaseDate || track.releaseYear || track.durationMs || track.isrc ||
        track.title || track.name || track.artist
      ));
    }

    function restoreUneditedIdentityQueueState(genre, snapshot, editedSong, editedIdentityKeyOverride = '') {
      if (!genre || !snapshot) return;
      // v75: for identity placeholder backfills, the edited row may be transformed
      // from a stamped placeholder into new Spotify metadata during the overwrite.
      // Keep the pre-edit identity slot as the edited slot so restore logic does not
      // accidentally restore that same Seminal/Media anchor from the pre-edit snapshot.
      const editedKey = editedIdentityKeyOverride || identityEditKeyFromSong(editedSong);
      const restoreFields = ['url','spotifyUrl','spotifyId','title','name','artist','album','artwork','albumArt','releaseDate','releaseYear','releasePrecision','releaseSource','durationMs','isrc','source','artists','spotifyMetadataFetched','spotifyMetadataFetchedAt','mediaTitle','media','mediaType'];
      const copyFields = (target, source) => {
        if (!target || !source || !identitySnapshotHasUsefulTrackData(source)) return;
        restoreFields.forEach(key => {
          if (source[key] !== undefined) {
            target[key] = Array.isArray(source[key]) ? source[key].slice() : source[key];
          }
        });
        if (source.artwork && !target.albumArt) target.albumArt = source.artwork;
        if (source.albumArt && !target.artwork) target.artwork = source.albumArt;
      };

      try {
        const semKey = identityEditKeyFromAnchor('seminal', -1);
        if (editedKey !== semKey && snapshot.anchorsByIdentityKey?.[semKey]) {
          if (!genre.identity || typeof genre.identity !== 'object') genre.identity = {};
          if (!genre.identity.seminalTrack || typeof genre.identity.seminalTrack !== 'object') genre.identity.seminalTrack = {};
          copyFields(genre.identity.seminalTrack, snapshot.anchorsByIdentityKey[semKey]);
          if (!genre.seminal_song || typeof genre.seminal_song !== 'object') genre.seminal_song = {};
          copyFields(genre.seminal_song, snapshot.anchorsByIdentityKey[semKey]);
        }
        const mediaSnapshotKeys = Object.keys(snapshot.anchorsByIdentityKey || {}).filter(key => key.startsWith('identity:media:'));
        if (mediaSnapshotKeys.length) {
          if (!genre.identity || typeof genre.identity !== 'object') genre.identity = {};
          if (!Array.isArray(genre.identity.mediaTouchstones)) genre.identity.mediaTouchstones = [];
          if (!Array.isArray(genre.media_touchstones)) genre.media_touchstones = genre.identity.mediaTouchstones;
          mediaSnapshotKeys.forEach(key => {
            if (key === editedKey) return;
            const index = Number(key.split(':').pop());
            if (!Number.isInteger(index) || index < 0) return;
            if (!genre.identity.mediaTouchstones[index] || typeof genre.identity.mediaTouchstones[index] !== 'object') genre.identity.mediaTouchstones[index] = {};
            copyFields(genre.identity.mediaTouchstones[index], snapshot.anchorsByIdentityKey[key]);
            genre.media_touchstones = genre.identity.mediaTouchstones;
          });
        }
      } catch (err) {
        console.warn('Could not preserve unedited identity anchors after URL edit', err);
      }

      try {
        const songs = inflateSongsFromStorage(genre.songs_listened || []).filter(song => song && !song.isPending);
        let changed = false;
        songs.forEach(song => {
          const key = identityEditKeyFromSong(song);
          if (!key || key === editedKey) return;
          const saved = snapshot.songsByIdentityKey?.[key];
          if (!saved) return;
          copyFields(song, saved);
          changed = true;
        });
        if (changed) genre.songs_listened = songs;
      } catch (err) {
        console.warn('Could not preserve unedited identity queue rows after URL edit', err);
      }
    }

    function dedupeQueueSongsPreservingTarget(songs, target, match = {}) {
      const list = inflateSongsFromStorage(songs || []).filter(song => song && !song.isPending);
      if (!target) return list;
      const targetUrl = canonicalQueueUrlKey(target.url || target.spotifyUrl || match.newUrl || '');
      const oldUrl = canonicalQueueUrlKey(match.oldUrl || '');
      const targetSpotifyId = String(target.spotifyId || match.newSpotifyId || '').trim().toLowerCase();
      const oldSpotifyId = String(match.oldSpotifyId || '').trim().toLowerCase();
      const oldIdentity = meaningfulSongIdentityKey(match.oldIdentity || '');
      const targetIdentity = meaningfulSongIdentityKey(songIdentity(target) || '');
      const targetText = meaningfulQueueTextKey(queueDuplicateTextKey(target));
      const oldText = meaningfulQueueTextKey(match.oldTextKey || '');
      const newText = meaningfulQueueTextKey(match.newTextKey || '') || meaningfulQueueTextKey(targetText);
      const forceTextDedupe = !!match.forceTextDedupe;
      const maybeDuplicate = song => {
        if (!song || song === target) return false;
        const songUrl = canonicalQueueUrlKey(song.url || song.spotifyUrl || '');
        const songSpotifyId = String(song.spotifyId || '').trim().toLowerCase();
        const songIdentityValue = meaningfulSongIdentityKey(songIdentity(song) || '');
        const songText = meaningfulQueueTextKey(queueDuplicateTextKey(song));
        if (targetUrl && songUrl && songUrl === targetUrl) return true;
        if (oldUrl && songUrl && songUrl === oldUrl) return true;
        if (targetSpotifyId && songSpotifyId && songSpotifyId === targetSpotifyId) return true;
        if (oldSpotifyId && songSpotifyId && songSpotifyId === oldSpotifyId) return true;
        if (oldIdentity && songIdentityValue && songIdentityValue === oldIdentity) return true;
        if (targetIdentity && songIdentityValue && songIdentityValue === targetIdentity) return true;
        // URL replacement should collapse the pre-metadata text row (ex: “El Pistolón”)
        // into the Spotify-normalized metadata row (ex: “Pistolon”). Accents/articles
        // are normalized by queueDuplicateTextKey, so this catches the common case where
        // Spotify uses a slightly different title than the manually-entered line.
        if (forceTextDedupe && songText && (songText === targetText || songText === oldText || songText === newText)) return true;
        // Default path stays conservative: only text-dedupe if one side also has a Spotify URL/ID signal.
        if (targetText && songText && songText === targetText && (songUrl || songSpotifyId || targetUrl || targetSpotifyId)) return true;
        if (oldText && songText === oldText && (songUrl || songSpotifyId || targetUrl || targetSpotifyId)) return true;
        if (newText && songText === newText && (songUrl || songSpotifyId || targetUrl || targetSpotifyId)) return true;
        return false;
      };
      // If a duplicate already has richer metadata than the edited row, merge it into the edited row first.
      list.forEach(song => {
        if (maybeDuplicate(song) && queueSongMergeWeight(song) > queueSongMergeWeight(target)) mergeSongObjectsInPlace(target, song);
      });
      const out = [];
      let targetInserted = false;
      list.forEach(song => {
        if (song === target) {
          if (!targetInserted) { out.push(target); targetInserted = true; }
          return;
        }
        if (maybeDuplicate(song)) {
          mergeSongObjectsInPlace(target, song);
          if (!targetInserted) { out.push(target); targetInserted = true; }
          return;
        }
        out.push(song);
      });
      if (!targetInserted) out.push(target);
      return out;
    }

    function queueTextSimilarity(a = '', b = '') {
      const tokens = value => String(value || '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .split(/\s+/)
        .filter(Boolean)
        .filter(token => !['the','a','an','el','la','los','las','le','les','un','una','feat','ft'].includes(token));
      const left = tokens(a);
      const right = tokens(b);
      if (!left.length && !right.length) return 1;
      if (!left.length || !right.length) return 0;
      const rightSet = new Set(right);
      const overlap = left.filter(token => rightSet.has(token)).length;
      return overlap / Math.max(left.length, right.length);
    }

    function queueMetadataLooksClose(oldSong, newSong) {
      if (!oldSong || !newSong) return false;
      const titleScore = queueTextSimilarity(oldSong.title || '', newSong.title || '');
      const artistScore = queueTextSimilarity(oldSong.artist || (Array.isArray(oldSong.artists) ? oldSong.artists.join(' ') : ''), newSong.artist || (Array.isArray(newSong.artists) ? newSong.artists.join(' ') : ''));
      if (!String(oldSong.title || '').trim() && !String(oldSong.artist || '').trim()) return true;
      return titleScore >= 0.45 && (artistScore >= 0.35 || !String(oldSong.artist || '').trim() || !String(newSong.artist || '').trim());
    }

    function confirmQueueUrlOverwrite(oldSong, newSong) {
      const oldLabel = `${oldSong?.artist ? `${oldSong.artist} — ` : ''}${oldSong?.title || 'this queue row'}`;
      const newLabel = `${newSong?.artist ? `${newSong.artist} — ` : ''}${newSong?.title || 'the Spotify track'}`;
      const closeEnough = queueMetadataLooksClose(oldSong, newSong);
      if (closeEnough) return true;
      return window.confirm(`This Spotify result does not look like a close match.

Current queue row: ${oldLabel}
Spotify result: ${newLabel}

Overwrite the selected queue row anyway? This will replace its title, artist, artwork, and Spotify metadata without creating a new row.`);
    }

    function replaceQueueTargetAtSelectedIndex(songs, target, match = {}) {
      const list = inflateSongsFromStorage(songs || []).filter(song => song && !song.isPending);
      const targetIndex = Number.isInteger(match.index) ? match.index : list.indexOf(target);
      if (!target || !Number.isInteger(targetIndex) || targetIndex < 0) return list;
      const out = [];
      let inserted = false;
      list.forEach((song, index) => {
        if (!song) return;
        if (index === targetIndex) {
          out.push(target);
          inserted = true;
          return;
        }
        // If the edited object also appears elsewhere after a stale re-render/reinflate,
        // keep only the explicit selected slot. This is especially important for confirmed
        // Spotify mismatches, where title/artist text intentionally no longer matches the
        // original row and loose dedupe must not decide row identity.
        if (song === target) return;
        out.push(song);
      });
      if (!inserted) out.push(target);
      return out;
    }

    function forceOverwriteQueueTarget(songs, target, match = {}) {
      const list = inflateSongsFromStorage(songs || []).filter(song => song && !song.isPending);
      if (!target) return list;
      const targetIndex = Number.isInteger(match.index) ? match.index : list.indexOf(target);
      const targetUrl = canonicalQueueUrlKey(target.url || target.spotifyUrl || match.newUrl || '');
      const oldUrl = canonicalQueueUrlKey(match.oldUrl || '');
      const targetSpotifyId = String(target.spotifyId || match.newSpotifyId || '').trim().toLowerCase();
      const oldSpotifyId = String(match.oldSpotifyId || '').trim().toLowerCase();
      const oldIdentity = meaningfulSongIdentityKey(match.oldIdentity || '');
      const targetIdentity = meaningfulSongIdentityKey(songIdentity(target) || '');
      const oldText = meaningfulQueueTextKey(match.oldTextKey || '');
      const newText = meaningfulQueueTextKey(match.newTextKey || queueDuplicateTextKey(target));
      const skipLooseTextDedupe = !!match.confirmedMetadataMismatch;
      const out = [];
      let inserted = false;
      list.forEach((song, index) => {
        if (!song) return;
        const isSelected = song === target || index === targetIndex;
        if (isSelected) {
          if (!inserted) { out.push(target); inserted = true; }
          return;
        }
        const songUrl = canonicalQueueUrlKey(song.url || song.spotifyUrl || '');
        const songSpotifyId = String(song.spotifyId || '').trim().toLowerCase();
        const songIdentityValue = meaningfulSongIdentityKey(songIdentity(song) || '');
        const songText = meaningfulQueueTextKey(queueDuplicateTextKey(song));
        const duplicateByUrl = (targetUrl && songUrl === targetUrl) || (oldUrl && songUrl === oldUrl);
        const duplicateBySpotify = (targetSpotifyId && songSpotifyId === targetSpotifyId) || (oldSpotifyId && songSpotifyId === oldSpotifyId);
        const duplicateByIdentity = (targetIdentity && songIdentityValue === targetIdentity) || (oldIdentity && songIdentityValue === oldIdentity);
        const duplicateByText = !skipLooseTextDedupe && !!(songText && (songText === oldText || songText === newText) && queueMetadataLooksClose(song, target));
        if (duplicateByUrl || duplicateBySpotify || duplicateByIdentity || duplicateByText) {
          mergeSongObjectsInPlace(target, song);
          if (!inserted && index < targetIndex) { out.push(target); inserted = true; }
          return;
        }
        out.push(song);
      });
      if (!inserted) out.push(target);
      return out;
    }

    function repairQueueAfterAuthoritativeUrlOverwrite(songs, target, match = {}) {
      const list = inflateSongsFromStorage(songs || []).filter(song => song && !song.isPending);
      if (!target) return list;
      const targetUrl = canonicalQueueUrlKey(target.url || target.spotifyUrl || match.newUrl || '');
      const oldUrl = canonicalQueueUrlKey(match.oldUrl || '');
      const targetSpotifyId = String(target.spotifyId || match.newSpotifyId || '').trim().toLowerCase();
      const oldSpotifyId = String(match.oldSpotifyId || '').trim().toLowerCase();
      const oldIdentity = meaningfulSongIdentityKey(match.oldIdentity || '');
      const targetIdentity = meaningfulSongIdentityKey(songIdentity(target) || '');
      const oldText = meaningfulQueueTextKey(match.oldTextKey || '');
      const newText = meaningfulQueueTextKey(match.newTextKey || queueDuplicateTextKey(target));
      const skipLooseTextDedupe = !!match.confirmedMetadataMismatch;
      const looksLikeSameManualSong = song => {
        if (!song || song === target) return false;
        const songUrl = canonicalQueueUrlKey(song.url || song.spotifyUrl || '');
        const songSpotifyId = String(song.spotifyId || '').trim().toLowerCase();
        const songIdentityValue = meaningfulSongIdentityKey(songIdentity(song) || '');
        const songText = meaningfulQueueTextKey(queueDuplicateTextKey(song));
        if (targetUrl && songUrl && songUrl === targetUrl) return true;
        if (oldUrl && songUrl && songUrl === oldUrl) return true;
        if (targetSpotifyId && songSpotifyId && songSpotifyId === targetSpotifyId) return true;
        if (oldSpotifyId && songSpotifyId && songSpotifyId === oldSpotifyId) return true;
        if (oldIdentity && songIdentityValue && songIdentityValue === oldIdentity) return true;
        if (targetIdentity && songIdentityValue && songIdentityValue === targetIdentity) return true;
        if (!skipLooseTextDedupe && songText && (songText === oldText || songText === newText)) return true;
        return false;
      };
      const out = [];
      let inserted = false;
      list.forEach(song => {
        if (song === target) {
          if (!inserted) { out.push(target); inserted = true; }
          return;
        }
        if (looksLikeSameManualSong(song)) {
          // The explicitly edited row wins. Only backfill user-owned fields from a duplicate.
          if (target.reaction == null && song.reaction != null) target.reaction = song.reaction;
          if (!target.reason && song.reason) target.reason = song.reason;
          if (!target.listenerNote && (song.listenerNote || song.songNote)) target.listenerNote = song.listenerNote || song.songNote;
          if (!inserted) { out.push(target); inserted = true; }
          return;
        }
        out.push(song);
      });
      if (!inserted) out.push(target);
      return out;
    }

    function dedupeSongsAfterTrackUrlUpdate(songs, target, oldUrl, oldIdentity, oldSpotifyId) {
      if (!Array.isArray(songs) || !target) return songs || [];
      const canonicalOldUrl = normalizeSongUrl(oldUrl || '').toLowerCase();
      const oldKeys = new Set([
        String(oldIdentity || '').toLowerCase(),
        canonicalOldUrl ? `url:${canonicalOldUrl}` : '',
        oldSpotifyId ? `spotify:${String(oldSpotifyId).toLowerCase()}` : ''
      ].filter(Boolean));
      const targetIdentity = songIdentity(target);
      const targetKeys = new Set(songIdentityKeys(target).map(k => String(k || '').toLowerCase()));
      const targetTextKey = looseSongTextKey(target);
      let keptTarget = false;
      const deduped = [];
      songs.forEach(song => {
        if (!song || song.isPending) return;
        if (song === target) {
          if (!keptTarget) {
            deduped.push(song);
            keptTarget = true;
          }
          return;
        }
        const songId = songIdentity(song);
        const songKeys = songIdentityKeys(song).map(k => String(k || '').toLowerCase());
        const songUrl = normalizeSongUrl(song.url || song.spotifyUrl || '').toLowerCase();
        const matchesOldUrl = !!canonicalOldUrl && songUrl === canonicalOldUrl;
        const matchesOldIdentity = songKeys.some(k => oldKeys.has(k)) || (!!songId && oldKeys.has(String(songId).toLowerCase()));
        const matchesNewIdentity = !!targetIdentity && (String(songId || '').toLowerCase() === String(targetIdentity).toLowerCase() || songKeys.some(k => targetKeys.has(k)));
        const matchesSameTextAndOld = targetTextKey && targetTextKey === looseSongTextKey(song) && (matchesOldUrl || matchesOldIdentity);
        if (matchesOldUrl || matchesOldIdentity || matchesNewIdentity || matchesSameTextAndOld) {
          return;
        }
        deduped.push(song);
      });
      if (!keptTarget) deduped.push(target);
      return deduped;
    }




    function readPendingSongNotesMap() {
      try {
        const raw = localStorage.getItem(PENDING_SONG_NOTES_STORAGE_KEY) || '{}';
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
      } catch (err) {
        console.warn('Could not read pending song notes', err);
        return {};
      }
    }

    function writePendingSongNotesMap(map) {
      try { localStorage.setItem(PENDING_SONG_NOTES_STORAGE_KEY, JSON.stringify(map || {})); }
      catch (err) { console.warn('Could not save pending song notes', err); }
    }

    function pendingSongNoteId(genre, song, path = '', pendingIndex = -1) {
      const genreId = String(genre?.id || genre?.genre || 'unknown');
      const identity = songIdentity(song || {}) || normalizeSongUrl(song?.url || song?.spotifyUrl || '') || String(song?.title || 'song');
      if (Number.isInteger(pendingIndex) && pendingIndex >= 0) return `${genreId}::pending:${pendingIndex}::${identity}`;
      if (path) return `${genreId}::${path}::${identity}`;
      return `${genreId}::${identity}`;
    }

    function pendingSongNoteFor(genre, song, path = '', pendingIndex = -1) {
      const map = readPendingSongNotesMap();
      const id = pendingSongNoteId(genre, song, path, pendingIndex);
      return map[id]?.note || '';
    }

    function pendingSongNotesForGenre(genre = currentGenre) {
      if (!genre) return [];
      const prefix = `${String(genre.id || genre.genre || 'unknown')}::`;
      return Object.entries(readPendingSongNotesMap())
        .filter(([key, value]) => key.startsWith(prefix) && value?.note)
        .map(([key, value]) => ({ key, ...value }));
    }

    function renderPendingSongNotesPanel(genre = currentGenre) {
      const count = pendingSongNotesForGenre(genre).length;
      if (!count) return '';
      return `<div class="pending-song-notes-panel"><div><strong>${count} pending song note${count === 1 ? '' : 's'}</strong><div class="small">These are staged locally. The floating Save button will roll them into the song cards and persist them.</div></div><div class="row" style="justify-content:flex-end;"><button type="button" class="btn btn-secondary" onclick="rollUpPendingSongNotesForCurrentGenre()">Roll up pending notes</button></div></div>`;
    }

    function savePendingSongNoteFromCard(encodedKey, pendingIndex, path = '', button = null) {
      if (!currentGenre) return;
      const wrapper = button?.closest('.song-note-editor');
      const textarea = wrapper?.querySelector('[data-song-note-input]');
      const note = String(textarea?.value || '').trim();
      const result = findEditableSongTarget(encodedKey, pendingIndex, path);
      const song = result?.song;
      if (!song) {
        showSaveToast('That song changed. Reopen the card and try again.', true);
        return;
      }
      const id = pendingSongNoteId(currentGenre, song, path, pendingIndex);
      const map = readPendingSongNotesMap();
      if (note) {
        map[id] = {
          genreId: currentGenre.id || '',
          genre: currentGenre.genre || '',
          path: path || '',
          pendingIndex: Number.isInteger(pendingIndex) ? pendingIndex : -1,
          identity: songIdentity(song),
          title: song.title || '',
          artist: song.artist || '',
          url: normalizeSongUrl(song.url || song.spotifyUrl || ''),
          note,
          updatedAt: new Date().toISOString()
        };
        showSaveToast('Song note staged — roll up pending notes when ready.', false);
      } else {
        delete map[id];
        showSaveToast('Pending song note cleared.', false);
      }
      writePendingSongNotesMap(map);
      markListeningUpdatePending();
      const restore = preserveScrollSnapshot();
      loadListenScreen(currentGenre, { preserveDirty: true, skipSpotifyHydration: true });
      applyDetailEditMode(detailEditMode);
      restore();
    }

    function clearPendingSongNoteFromCard(encodedKey, pendingIndex, path = '', button = null) {
      if (!currentGenre) return;
      const result = findEditableSongTarget(encodedKey, pendingIndex, path);
      const song = result?.song;
      if (!song) return;
      const map = readPendingSongNotesMap();
      delete map[pendingSongNoteId(currentGenre, song, path, pendingIndex)];
      writePendingSongNotesMap(map);
      const restore = preserveScrollSnapshot();
      loadListenScreen(currentGenre, { preserveDirty: true, skipSpotifyHydration: true });
      applyDetailEditMode(detailEditMode);
      restore();
      showSaveToast('Pending song note cleared.', false);
    }

    function findSongForPendingNote(note) {
      if (!currentGenre || !note) return null;
      if (note.path) {
        const byPath = findOfficialSongByPath(note.path);
        if (byPath?.song) return byPath;
      }
      if (Number.isInteger(note.pendingIndex) && note.pendingIndex >= 0) {
        currentGenre.pending_songs = normalizePendingSongs(currentGenre.pending_songs || []);
        const song = currentGenre.pending_songs[note.pendingIndex];
        if (song) return { song, parent: null, index: note.pendingIndex, songs: currentGenre.pending_songs, isPending: true };
      }
      const key = note.identity || '';
      if (key) {
        const byIdentity = findOfficialSongByIdentity(key);
        if (byIdentity?.song) return byIdentity;
      }
      return null;
    }

    function rollUpPendingSongNotesForCurrentGenre() {
      if (!currentGenre) return;
      syncBulkDraftIntoSongModel();
      const notes = pendingSongNotesForGenre(currentGenre);
      if (!notes.length) {
        showSaveToast('No pending song notes to roll up.', false);
        return;
      }
      const map = readPendingSongNotesMap();
      let applied = 0;
      notes.forEach(note => {
        const target = findSongForPendingNote(note);
        if (!target?.song) return;
        target.song.listenerNote = String(note.note || '').trim();
        if (target.isPending) currentGenre.pending_songs = target.songs;
        else currentGenre.songs_listened = target.songs;
        delete map[note.key];
        applied += 1;
      });
      writePendingSongNotesMap(map);
      if (!applied) {
        showSaveToast('Could not match pending notes to current song rows. Reopen the genre and try again.', true);
        return;
      }
      markListeningUpdatePending();
      const restore = preserveScrollSnapshot();
      loadListenScreen(currentGenre, { preserveDirty: true, skipSpotifyHydration: true });
      applyDetailEditMode(detailEditMode);
      restore();
      showSaveToast(`${applied} song note${applied === 1 ? '' : 's'} rolled up — click use the floating Save button to persist.`, false);
    }

    function applyPendingSongNotesToCurrentGenreSilently() {
      if (!currentGenre) return 0;
      const notes = pendingSongNotesForGenre(currentGenre);
      if (!notes.length) return 0;
      const map = readPendingSongNotesMap();
      let applied = 0;
      notes.forEach(note => {
        const target = findSongForPendingNote(note);
        if (!target?.song) return;
        target.song.listenerNote = String(note.note || '').trim();
        if (target.isPending) currentGenre.pending_songs = target.songs;
        else currentGenre.songs_listened = target.songs;
        delete map[note.key];
        applied += 1;
      });
      if (applied) {
        writePendingSongNotesMap(map);
        libraryUpdatesPending = true;
        setUnsavedState(true);
        toggleLibrarySaveButton(true);
      }
      return applied;
    }

    function ensureCurrentGenreIsInLibrary() {
      if (!currentGenre || !Array.isArray(genres)) return;
      const idx = genres.findIndex(g => String(g?.id) === String(currentGenre.id));
      if (idx >= 0 && genres[idx] !== currentGenre) {
        genres[idx] = currentGenre;
      }
    }

    function finalizeListeningUpdatesBeforeSave() {
      if (currentGenre) {
        try { syncBulkDraftIntoSongModel(); } catch (error) { console.warn('Could not sync song draft before save', error); }
        applyPendingSongNotesToCurrentGenreSilently();
        ensureCurrentGenreIsInLibrary();
      }
    }

    async function applySpotifyOembedFallback(song, url, options = {}) {
      if (!song || !url || typeof fetchSpotifyOembed !== 'function') return false;
      const canonical = (typeof spotifyCanonicalTrackUrl === 'function') ? spotifyCanonicalTrackUrl(url) : normalizeSongUrl(url);
      if (!/open\.spotify\.com\/track\//i.test(canonical || '')) return false;
      const embed = await fetchSpotifyOembed(canonical, true);
      if (!embed) return false;
      let changed = false;
      const title = String(embed.title || '').trim();
      const artwork = String(embed.thumbnail_url || '').trim();
      if (artwork && (options.forceArtwork || song.artwork !== artwork || song.albumArt !== artwork)) {
        song.artwork = artwork;
        song.albumArt = artwork;
        changed = true;
      }
      if (title && (options.forceTitle || !song.title || song.title === 'Track' || song.title === 'Spotify track' || song.title === 'Linked track')) {
        song.title = title;
        changed = true;
      }
      if (canonical && song.url !== canonical) {
        song.url = canonical;
        changed = true;
      }
      if (canonical && song.spotifyUrl !== canonical) {
        song.spotifyUrl = canonical;
        changed = true;
      }
      const spotifyId = (typeof spotifyTrackId === 'function') ? spotifyTrackId(canonical) : '';
      if (spotifyId && song.spotifyId !== spotifyId) {
        song.spotifyId = spotifyId;
        changed = true;
      }
      song.source = 'spotify';
      song.spotifyMetadataFetched = false;
      song.spotifyMetadataFetchedAt = '';
      return changed || !!artwork;
    }


    async function refreshGenrePageSpotifyTrack(encodedKey, button, path = '') {
      if (!currentGenre) return;
      syncBulkDraftIntoSongModel();
      const result = findEditableSongTarget(encodedKey, -1, path);
      if (!result?.song) {
        showSaveToast('That song changed in the text editor. Reopen the card and try again.', true);
        return;
      }
      const url = normalizeSongUrl(result.song.url || result.song.spotifyUrl || '');
      if (!/spotify\.com\/track\//i.test(url) && !/^spotify:track:/i.test(url)) {
        showSaveToast('That track does not have a Spotify track URL to refresh.', true);
        return;
      }
      const oldText = button?.textContent || '';
      if (button) {
        button.disabled = true;
        button.classList.add('is-saving');
        button.textContent = 'Refreshing…';
      }
      try {
        const refreshed = await fetchSpotifyTrackResult(url, true);
        if (!refreshed.ok) {
          spotifyMetadataFailures.set(stagedReactionKey(currentGenre.id, songIdentity(result.song)), refreshed);
          if (refreshed.code === 'rate_limited') beginSpotifyPause(refreshed.retryAfterSeconds || 30);
          showSaveToast(`Spotify refresh failed: ${refreshed.error}`, true);
          return;
        }
        applyOfficialSpotifyMetadata(result.song, refreshed.track);
        currentGenre.songs_listened = result.songs;
        spotifyMetadataFailures.delete(stagedReactionKey(currentGenre.id, songIdentity(result.song)));
        const restore = preserveScrollSnapshot();
        loadListenScreen(currentGenre, { preserveDirty: true, skipSpotifyHydration: true });
        applyDetailEditMode(detailEditMode);
        restore();
        markListeningUpdatePending();
        showSaveToast('Spotify metadata refreshed — use the floating Save button to keep it.', false);
      } catch (err) {
        console.error('Spotify refresh failed', err);
        showSaveToast(`Spotify refresh failed: ${err?.message || err || 'Unknown error'}`, true);
      } finally {
        if (button && document.body.contains(button)) {
          button.disabled = false;
          button.classList.remove('is-saving');
          button.textContent = oldText || 'Refresh Spotify';
        }
      }
    }

    async function updateTrackUrlFromCard(encodedKey, pendingIndex, button, path = '') {
      if (!currentGenre) return;
      // The inline detail editor and the focused Song Queue details drawer use
      // different containers. Look upward first, then fall back to the nearest
      // URL input in the focused details region so queue edits do not read blank.
      const editor = button?.closest('.track-card-editor, .song-focus-url-card, .song-focus-details-drawer, .song-focus-details-grid');
      const activeInput = document.activeElement?.matches?.('[data-track-url-input]') ? document.activeElement : null;
      const input = editor?.querySelector('[data-track-url-input]')
        || button?.parentElement?.querySelector?.('[data-track-url-input]')
        || activeInput
        || null;
      let nextUrl = normalizeSongUrl(input?.value || '');
      if ((/spotify\.com\/track\//i.test(nextUrl) || /^spotify:track:/i.test(nextUrl)) && typeof spotifyCanonicalTrackUrl === 'function') {
        nextUrl = spotifyCanonicalTrackUrl(nextUrl);
      }
      if (input && nextUrl) input.value = nextUrl;
      if (!/^https?:\/\//i.test(nextUrl) && !/^spotify:track:/i.test(nextUrl)) {
        showSaveToast('Please provide a valid Spotify track URL or web track link.', true);
        return;
      }

      const oldButtonText = button?.textContent || '';
      if (button) {
        button.disabled = true;
        button.classList.add('is-saving');
        button.textContent = 'Updating…';
      }

      try {
        const isPendingEdit = Number.isInteger(pendingIndex) && pendingIndex >= 0;
        const isQueueDrawerEdit = !isPendingEdit && (String(path || '').startsWith('song:') || !!button?.closest?.('.song-focus-details-drawer'));
        // Queue drawer URL edits already point at a concrete song path. Do not reparse the
        // hidden bulk textarea first; if that textarea is stale, reparsing can resurrect the
        // old URL as a duplicate row before we update the selected item.
        if (!isPendingEdit && !isQueueDrawerEdit) syncBulkDraftIntoSongModel();
        const result = findEditableSongTarget(encodedKey, pendingIndex, path);
        const target = result?.song || null;

        if (!target) {
          showSaveToast('That song changed or was malformed. Reopen the card and try again.', true);
          loadListenScreen(currentGenre, { preserveDirty: true, skipSpotifyHydration: true });
          return;
        }

        const oldUrl = normalizeSongUrl(target.url || target.spotifyUrl || '');
        const oldIdentity = songIdentity(target);
        const oldSpotifyId = String(target.spotifyId || '').trim();
        const nestedLevelUp = target.levelUp || null;
        const savedReason = target.reason || '';
        const savedScore = target.score;
        const savedReaction = target.reaction;
        const savedTitle = target.title || '';
        const savedArtist = target.artist || '';
        const oldTextKey = queueDuplicateTextKey({ title: savedTitle, artist: savedArtist });
        const beforeOverwrite = { ...target, title: savedTitle, artist: savedArtist, url: oldUrl, spotifyId: oldSpotifyId };
        const identityQueueSnapshotBeforeEdit = snapshotIdentityQueueState(currentGenre);
        const editedIdentityKeyBeforeOverwrite = identityEditKeyFromSong(target);
        let proposedMetadataSong = null;
        let confirmedMetadataMismatch = false;

        const isSpotifyTrack = /spotify\.com\/track\//i.test(nextUrl) || /^spotify:track:/i.test(nextUrl);
        let metadataWarning = '';

        if (isSpotifyTrack) {
          // v73: Build the Spotify overwrite in an isolated candidate first. Previously
          // we wrote the new URL to the live row and cleared artwork before showing the
          // mismatch-confirmation dialog. If that dialog was triggered, downstream queue
          // reconciliation could see the half-mutated row and then restore/re-render the
          // old row even after the user confirmed. The live row is now untouched until
          // the confirmation is accepted.
          proposedMetadataSong = { ...target, title: savedTitle, artist: savedArtist };
          proposedMetadataSong.url = nextUrl;
          proposedMetadataSong.artwork = '';
          proposedMetadataSong.albumArt = '';
          proposedMetadataSong.releaseDate = '';
          proposedMetadataSong.releaseYear = null;
          proposedMetadataSong.releaseSource = '';
          proposedMetadataSong.source = 'spotify';
          proposedMetadataSong.spotifyUrl = /^spotify:track:/i.test(nextUrl)
            ? `https://open.spotify.com/track/${spotifyTrackId(nextUrl)}`
            : nextUrl;
          proposedMetadataSong.spotifyId = spotifyTrackId(nextUrl) || proposedMetadataSong.spotifyId || '';

          const refreshed = await fetchSpotifyTrackResult(nextUrl, true);
          if (refreshed.ok) {
            applyOfficialSpotifyMetadata(proposedMetadataSong, refreshed.track);
            if (!proposedMetadataSong.artwork) {
              const usedEmbedFallback = await applySpotifyOembedFallback(proposedMetadataSong, nextUrl, { forceArtwork: true });
              if (usedEmbedFallback) metadataWarning = 'Spotify metadata refreshed, and artwork was filled from Spotify embed.';
            }
          } else {
            const usedEmbedFallback = await applySpotifyOembedFallback(proposedMetadataSong, nextUrl, { forceArtwork: true, forceTitle: true });
            if (usedEmbedFallback) {
              metadataWarning = 'Spotify API lookup failed, but artwork was recovered from Spotify embed.';
            } else {
              metadataWarning = refreshed.error || 'Spotify metadata could not be refreshed.';
            }
            if (refreshed.code === 'rate_limited') beginSpotifyPause(refreshed.retryAfterSeconds || 30);
          }

          const closeEnough = queueMetadataLooksClose(beforeOverwrite, proposedMetadataSong);
          if (!closeEnough && !confirmQueueUrlOverwrite(beforeOverwrite, proposedMetadataSong)) {
            showSaveToast('URL update cancelled. No queue rows were changed.', false);
            return;
          }
          confirmedMetadataMismatch = !closeEnough;

          Object.assign(target, proposedMetadataSong);
          target.url = proposedMetadataSong.spotifyUrl || nextUrl;
          target.spotifyUrl = proposedMetadataSong.spotifyUrl || nextUrl;
          if (target.artwork && !target.albumArt) target.albumArt = target.artwork;
          if (target.albumArt && !target.artwork) target.artwork = target.albumArt;
          try {
            if (window.DailyGenreIdentity && typeof window.DailyGenreIdentity.updateTrackFromQueueOverwrite === 'function') {
              window.DailyGenreIdentity.updateTrackFromQueueOverwrite(currentGenre, beforeOverwrite, target);
            }
          } catch (identityError) {
            console.warn('Could not sync queue URL overwrite back to Genre DNA', identityError);
          }
        } else if (isYoutubeUrl(nextUrl)) {
          target.url = nextUrl;
          target.artwork = '';
          target.albumArt = '';
          target.releaseDate = '';
          target.releaseYear = null;
          target.releaseSource = '';
          target.source = 'youtube';
          target.spotifyId = '';
          target.spotifyUrl = '';
          target.spotifyMetadataFetched = false;
          target.spotifyMetadataFetchedAt = '';
          target.album = '';
          target.artists = [];
          target.durationMs = null;
          target.isrc = '';
          target.title = savedTitle || target.title || 'YouTube track';
          target.artist = savedArtist || target.artist || '';
        } else {
          target.url = nextUrl;
          target.artwork = '';
          target.albumArt = '';
          target.releaseDate = '';
          target.releaseYear = null;
          target.releaseSource = '';
          target.source = 'web';
          target.spotifyId = '';
          target.spotifyUrl = '';
          target.spotifyMetadataFetched = false;
          target.spotifyMetadataFetchedAt = '';
          target.album = '';
          target.artists = [];
          target.durationMs = null;
          target.isrc = '';
          target.title = savedTitle || target.title || 'Track';
          target.artist = savedArtist || target.artist || '';
        }

        target.levelUp = nestedLevelUp;
        target.reason = savedReason;
        target.score = savedScore;
        target.reaction = savedReaction;

        const currentFavUrl = normalizeSongUrl(currentGenre.favoritesongurl || '');
        if (!isPendingEdit && currentFavUrl && oldUrl && currentFavUrl === oldUrl) {
          currentGenre.favoritesongurl = nextUrl;
          currentGenre.favoritesong = target.title || currentGenre.favoritesong;
          currentGenre.favoriteartist = target.artist || currentGenre.favoriteartist;
          currentGenre.favoritesongartwork = target.artwork || currentGenre.favoritesongartwork;
        }

        if (result?.isPending) {
          currentGenre.pending_songs = result.songs;
        } else {
          // Always de-dupe against the live queue, not just the array returned by the finder.
          // The focused queue editor can outlive/re-render the hidden bulk editor, and using
          // only result.songs allowed stale rows to survive or be reintroduced.
          const isNestedLevelUpEdit = !!(result?.parent && result.parent.levelUp === target);
          if (isNestedLevelUpEdit) {
            // v72: a Level Up lives inside its parent song object, but the queue array only
            // contains the parent. The v69/v71 overwrite repair treated the child target as
            // if it were a top-level row and used the parent index, which promoted the Level
            // Up into its own row and broke the parent/child relationship. For nested edits,
            // the authoritative mutation is already result.parent.levelUp = target, so keep
            // the parent array intact and skip top-level duplicate repair.
            result.parent.levelUp = target;
            currentGenre.songs_listened = result?.songs || currentGenre.songs_listened || [];
          } else {
            if (confirmedMetadataMismatch && Number.isInteger(result?.index) && result.index >= 0) {
              // v74/v75: confirmed mismatches are intentional replacements of the selected row,
              // not normal duplicate/merge candidates. The old row text is supposed to differ
              // from the new Spotify metadata, so identity/text repair can append the updated
              // object while leaving the original row behind. Replace the concrete path/index
              // first, then only run conservative URL/Spotify/identity cleanup.
              currentGenre.songs_listened = replaceQueueTargetAtSelectedIndex(result?.songs || currentGenre.songs_listened || [], target, {
                index: result.index
              });
            } else {
              currentGenre.songs_listened = isQueueDrawerEdit
                ? forceOverwriteQueueTarget(result?.songs || currentGenre.songs_listened || [], target, {
                    index: result.index,
                    oldUrl,
                    oldIdentity,
                    oldSpotifyId,
                    newUrl: target.url || nextUrl,
                    newSpotifyId: target.spotifyId || '',
                    oldTextKey,
                    newTextKey: queueDuplicateTextKey(target),
                    confirmedMetadataMismatch
                  })
                : dedupeQueueSongsPreservingTarget(currentGenre.songs_listened || result?.songs || [], target, {
                    oldUrl,
                    oldIdentity,
                    oldSpotifyId,
                    newUrl: target.url || nextUrl,
                    newSpotifyId: target.spotifyId || '',
                    oldTextKey,
                    newTextKey: queueDuplicateTextKey(target),
                    forceTextDedupe: false
                  });
              currentGenre.songs_listened = repairQueueAfterAuthoritativeUrlOverwrite(currentGenre.songs_listened, target, {
                oldUrl,
                oldIdentity,
                oldSpotifyId,
                oldTextKey,
                newUrl: target.url || nextUrl,
                newSpotifyId: target.spotifyId || '',
                newTextKey: queueDuplicateTextKey(target),
                confirmedMetadataMismatch
              });
            }
          }
          restoreUneditedIdentityQueueState(currentGenre, identityQueueSnapshotBeforeEdit, target, editedIdentityKeyBeforeOverwrite);
          syncSongsBulkEditorFromModel();
          window.__dailyGenreSuppressBulkSongSyncUntil = Date.now() + 60000;
          window.__dailyGenreQueueModelAuthoritativeUntil = Date.now() + 60000;
        }

        removeLoggedSongsFromPending(currentGenre);
        const restore = preserveScrollSnapshot();
        loadListenScreen(currentGenre, { preserveDirty: true, skipSpotifyHydration: true });
        applyDetailEditMode(detailEditMode);
        restore();
        try {
          const nextKey = typeof songIdentity === 'function' ? songIdentity(target) : '';
          if (nextKey && typeof window.openSongEditorFromQueue === 'function') {
            setTimeout(() => window.openSongEditorFromQueue(nextKey), 0);
          } else if (typeof window.enhanceSongListeningExperience === 'function') {
            setTimeout(() => window.enhanceSongListeningExperience(), 0);
          }
        } catch (_) {}
        markListeningUpdatePending();
        if (metadataWarning) {
          console.warn('Track URL updated with metadata warning:', metadataWarning);
          const recovered = /recovered from Spotify embed/i.test(metadataWarning);
          showSaveToast(recovered
            ? 'URL saved and artwork recovered from Spotify embed — use Save to keep it.'
            : `URL saved, but Spotify metadata did not refresh: ${metadataWarning}`,
            !recovered);
        } else {
          showSaveToast('Queue row overwritten with Spotify metadata — use the floating Save button to keep it.', false);
        }
      } catch (err) {
        console.error('Track URL update failed', err);
        showSaveToast(`Track update failed: ${err?.message || err || 'Unknown error'}`, true);
      } finally {
        if (button && document.body.contains(button)) {
          button.disabled = false;
          button.classList.remove('is-saving');
          button.textContent = oldButtonText || 'Update Track';
        }
      }
    }

    function removeTrackFromCard(encodedKey, pendingIndex, path = '') {
      if (!currentGenre) return;

      const isPendingRemove = Number.isInteger(pendingIndex) && pendingIndex >= 0;
      if (isPendingRemove) {
        // Removing a pending song: just delete it (no loop-back needed)
        if (!window.confirm('Remove this pending nomination? It will be permanently deleted from this genre.')) return;
        const pending = normalizePendingSongs(currentGenre.pending_songs || []);
        pending.splice(pendingIndex, 1);
        currentGenre.pending_songs = pending;
        loadListenScreen(currentGenre, { preserveDirty: true, skipSpotifyHydration: true });
        markListeningUpdatePending();
        showSaveToast('Pending nomination removed — use the floating Save button to keep it.', false);
        return;
      }

      // Removing an official song: send it back to pending for re-review
      if (!window.confirm('Remove this track and send it back to Pending for re-review? You can suggest another genre from there.')) return;

      syncBulkDraftIntoSongModel();
      const result = findEditableSongTarget(encodedKey, -1, path);
      if (!result) {
        showSaveToast('That song changed or was malformed. Reopen the card and try again.', true);
        return;
      }

      const removedSong = result.song;

      if (result.parent) {
        result.parent.levelUp = null;
      } else {
        result.songs.splice(result.index, 1);
      }
      currentGenre.songs_listened = result.songs;

      // Queue removed song back into this genre's pending list for re-review
      currentGenre.pending_songs = normalizePendingSongs(currentGenre.pending_songs || []);
      const alreadyPending = currentGenre.pending_songs.some(p => songIdentity(p) === songIdentity(removedSong));
      if (!alreadyPending) {
        currentGenre.pending_songs.push({
          url: removedSong.url || '',
          score: removedSong.score ?? null,
          reason: removedSong.reason || '',
          title: removedSong.title || '',
          artist: removedSong.artist || '',
          artwork: removedSong.artwork || '',
          source: removedSong.source || '',
          spotifyId: removedSong.spotifyId || '',
          spotifyUrl: removedSong.spotifyUrl || '',
          album: removedSong.album || '',
          artists: Array.isArray(removedSong.artists) ? removedSong.artists.slice() : [],
          durationMs: removedSong.durationMs || null,
          isrc: removedSong.isrc || '',
          releaseDate: removedSong.releaseDate || '',
          releaseYear: removedSong.releaseYear || null,
          releasePrecision: removedSong.releasePrecision || '',
          releaseSource: removedSong.releaseSource || '',
          spotifyMetadataFetched: !!removedSong.spotifyMetadataFetched,
          spotifyMetadataFetchedAt: removedSong.spotifyMetadataFetchedAt || '',
          added: removedSong.added || new Date().toISOString().slice(0,10),
          isPending: true,
          pendingFrom: currentGenre.genre || '',
          originFit: removedSong.score != null ? Number(removedSong.score) : null,
          nominatedFit: null,
          isLevelUp: false,
          isAdd: false,
          levelUp: null
        });
      }

      loadListenScreen(currentGenre, { preserveDirty: true, skipSpotifyHydration: true });
      markListeningUpdatePending();
      showSaveToast('Track moved to Pending — assign a genre and click Save Listening Updates.', false);
    }
    
    function setPendingNominationFit(index, value) {
      if (!currentGenre) return;
      const pending = normalizePendingSongs(getPendingSongs(currentGenre));
      if (!pending[index]) return;
      pending[index].nominatedFit = Number(value);
      currentGenre.pending_songs = pending;
      loadListenScreen(currentGenre, { preserveDirty: true, skipSpotifyHydration: true });
      markListeningUpdatePending();
    }

    function inflateSongsFromStorage(arr) {
      const inflated = [];
      normalizeSongsListened(arr || []).forEach(song => {
        song.url = normalizeSongUrl(song.url);
        if (song.isLevelUp && inflated.length) {
          song.isLevelUp = true;
          song.isAdd = false;
          inflated[inflated.length - 1].levelUp = song;
          return;
        }
        if (song.isLevelUp && !inflated.length) song.isLevelUp = false;
        inflated.push(song);
      });
      return inflated;
    }

    function normalizePendingSongs(arr) {
      const unique = [];
      const seen = new Set();
      normalizeSongsListened(arr || []).forEach(song => {
        song.url = normalizeSongUrl(song.url);
        song.isPending = true;
        song.isLevelUp = false;
        song.isAdd = false;
        song.levelUp = null;

        const keys = songIdentityKeys(song);
        const duplicate = keys.some(key => seen.has(key));
        if (duplicate) return;

        keys.forEach(key => seen.add(key));
        unique.push(song);
      });
      return unique;
    }
    
    function countSongsForDisplay(arr) {
      return normalizeSongsListened(arr || []).reduce((total, song) => total + 1 + (song.levelUp ? 1 : 0), 0);
    }

    function cleanSongForSave(song, isLevelUp) {
      const out = { ...(song || {}) };
      delete out.levelUp;
      out.url = normalizeSongUrl(out.url);
      out.title = cleanPastedCitationArtifacts(out.title || '');
      out.artist = cleanPastedCitationArtifacts(out.artist || '');
      out.reason = cleanPastedCitationArtifacts(out.reason || '');
      delete out.isPending;
      delete out.pendingFrom;
      if (isLevelUp) {
        out.url = `🔼 LEVEL UP: ${out.url}`;
        out.isLevelUp = true;
        delete out.isAdd;
      } else if (out.isAdd) {
        out.url = `🔼 ADD: ${out.url}`;
        out.isAdd = true;
        delete out.isLevelUp;
      } else {
        delete out.isLevelUp;
        delete out.isAdd;
      }
      if (out.title === '') delete out.title;
      if (out.reason === '') delete out.reason;
      if (out.listenerNote === '') delete out.listenerNote;
      if (out.songNote === '') delete out.songNote;
      if (out._pendingGenreTag === '') delete out._pendingGenreTag;
      return out;
    }

    function flattenSongsForStorage(arr) {
      const flat = [];
      inflateSongsFromStorage(arr || []).filter(song => !song.isPending).forEach(song => {
        flat.push(cleanSongForSave(song, false));
        if (song.levelUp) flat.push(cleanSongForSave(song.levelUp, true));
      });
      return flat;
    }

    function pendingSongsForStorage(arr) {
      return normalizePendingSongs(arr || []).map(song => {
        const out = { ...song, isPending: true };
        out.title = cleanPastedCitationArtifacts(out.title || '');
        out.artist = cleanPastedCitationArtifacts(out.artist || '');
        out.reason = cleanPastedCitationArtifacts(out.reason || '');
        delete out.isLevelUp;
        delete out.isAdd;
        delete out._pendingGenreTag;
        delete out.levelUp;
        if (out.title === '') delete out.title;
        if (out.reason === '') delete out.reason;
        if (out.listenerNote === '') delete out.listenerNote;
        if (out.songNote === '') delete out.songNote;
        return out;
      });
    }

    function genresForSave() {
      return genres.map(g => {
        const out = { ...g };
        if (Array.isArray(out.songs_listened)) out.songs_listened = flattenSongsForStorage(out.songs_listened);
        if (Array.isArray(out.pending_songs)) out.pending_songs = pendingSongsForStorage(out.pending_songs);
        return out;
      });
    }
    
    function renderSongEntry(s, isChild, options = {}) {
      const rawUrl = normalizeSongUrl(s.url || s.spotifyUrl || '');
      const hasHref = /^https?:\/\//i.test(rawUrl);
      const source = songUrlSource(rawUrl || s.spotifyUrl || '');
      const defaultTitle = source === 'spotify' ? 'Spotify track' : (source === 'youtube' ? 'YouTube track' : (hasHref ? 'Track' : 'Linked track'));
      const titleText = escapeHtml(s.title || defaultTitle);
      const href = escapeHtml(rawUrl);
      const pendingIndex = Number.isInteger(options.pendingIndex) ? options.pendingIndex : null;
      const originFit = s.originFit != null ? Number(s.originFit) : (s.isPending && s.score != null ? Number(s.score) : null);
      const nominatedFit = s.nominatedFit != null ? Number(s.nominatedFit) : null;
      const scoreBadge = s.isPending
        ? `<span class="song-theme-badge pending-fit" title="Theme fit: source genre to this genre">${originFit != null ? originFit : '?'}/5 → ${nominatedFit != null ? nominatedFit : '?'}/5</span>`
        : (s.score != null ? `<span class="song-theme-badge ${Number(s.score) <= 2 ? 'low' : ''}" title="Theme fit for this genre">${s.score}/5</span>` : '');
      const reasonHtml = s.reason ? `<div class="song-reason">${escapeHtml(s.reason)}</div>` : '';
      const showArtwork = !!s.artwork;
      const art = showArtwork ? artworkHtml(s.artwork, 'song-artwork', s.title || 'Album art') : '';
      const sourceBadge = sourceBadgeHtml(source);
      const titleHtml = hasHref
        ? `<a href="${href}" target="_blank" rel="noopener noreferrer" class="song-title-link">${titleText}${sourceBadge}<span class="song-link-arrow">↗</span></a>${spPlayBtn(s)}`
        : `<span class="song-title-link">${titleText}${sourceBadge}</span>${spPlayBtn(s)}`;
      const addBadge = (!isChild && s.isAdd)
        ? `<div class="add-badge"><span class="add-badge-icon">\uFF0B</span><span>Add</span></div>`
        : (!isChild && s.isPromote)
        ? `<div class="promote-badge"><span class="promote-badge-icon">🔼</span><span>Promote</span></div>`
        : '';
      const pendingNote = s.isPending
        ? `<div class="pending-origin-line">⏳ Nominated from <em>${escapeHtml(s.pendingFrom || 'source unavailable')}</em></div>
           ${pendingIndex != null ? `<div class="pending-fit-tools"><span class="pending-fit-label">Fit here</span>${[1,2,3,4,5].map(n => `<button type="button" class="pending-fit-btn ${Number(nominatedFit) === n ? 'active' : ''}" onclick="setPendingNominationFit(${pendingIndex}, ${n})">${n}</button>`).join('')}<button class="btn-inline" onclick="promotePendingSong(${pendingIndex})">Promote</button><button class="btn-inline btn-inline-danger" onclick="removePendingSong(${pendingIndex})">Remove</button></div>` : ''}`
        : '';
      const promotedNote = (!s.isPending && s.promotedFrom)
        ? `<div class="promoted-origin-line">⏳ Promoted from <em>${escapeHtml(s.promotedFrom)}</em>${s.promotedFromFit != null && s.score != null ? ` · theme fit ${s.promotedFromFit}/5 → ${s.score}/5` : ''}</div>`
        : '';
      const spotifyFacts = [];
      if (s.album) spotifyFacts.push(escapeHtml(s.album));
      if (s.releaseYear) spotifyFacts.push(`Released ${escapeHtml(String(s.releaseYear))}`);
      if (s.durationMs) spotifyFacts.push(formatTrackDuration(s.durationMs));
      if (s.releaseSource) spotifyFacts.push(escapeHtml(s.releaseSource));
      const releaseNote = (!s.isPending && spotifyFacts.length)
        ? `<div class="song-metadata-line">${spotifyFacts.join(' · ')}</div>`
        : '';
      const canShowTrackTools = options.allowTrackEdit === true || (!s.isPending && options.allowTrackEdit !== false);
      const levelUpHtml = (!isChild && s.levelUp)
        ? `<div class="alt-take-wrap"><div class="alt-take-label"><span class="alt-take-icon">\u21B3</span><span>Alt Take</span></div>${renderSongEntry(s.levelUp, true, { allowTrackEdit: canShowTrackTools, songIndex: options.songIndex, childKey: 'levelUp' })}</div>`
        : '';
      const favBtn = '';
      const encodedKey = encodeSongKeyForInline(s);
      const editPendingIndex = Number.isInteger(pendingIndex) ? pendingIndex : -1;
      const songPath = Number.isInteger(options.songIndex) ? `song:${options.songIndex}${options.childKey ? `.${options.childKey}` : ''}` : '';
      const encodedPath = encodeURIComponent(songPath).replace(/[!'()*]/g, ch => `%${ch.charCodeAt(0).toString(16).toUpperCase()}`);
      const pendingSongNote = currentGenre ? pendingSongNoteFor(currentGenre, s, songPath, editPendingIndex) : '';
      const savedSongNote = s.listenerNote || s.songNote || '';
      const savedSongNoteHtml = savedSongNote ? `<div class="song-listener-note"><strong>Note:</strong> ${escapeHtml(savedSongNote)}</div>` : '';
      const pendingSongNoteHtml = pendingSongNote ? `<div class="song-pending-note-preview"><strong>Pending note:</strong> ${escapeHtml(pendingSongNote)}</div>` : '';
      const noteEditorHtml = canShowTrackTools
        ? `<details class="song-note-editor" ${pendingSongNote ? 'open' : ''}><summary>${pendingSongNote ? 'Edit pending note' : 'Add short note'}</summary><div class="song-note-body"><textarea data-song-note-input maxlength="320" placeholder="Short listening note for this song…">${escapeHtml(pendingSongNote)}</textarea><div class="song-note-actions"><button type="button" class="btn btn-secondary" onclick="savePendingSongNoteFromCard('${encodedKey}', ${editPendingIndex}, '${encodedPath}', this)">Stage Note</button>${pendingSongNote ? `<button type="button" class="btn btn-danger" onclick="clearPendingSongNoteFromCard('${encodedKey}', ${editPendingIndex}, '${encodedPath}', this)">Clear Pending Note</button>` : ''}</div><div class="track-card-edit-note">Staged locally. Save Listening Updates will roll this up and persist it.</div></div></details>`
        : '';
      const canSpotifyRefresh = !s.isPending && (/spotify\.com\/track\//i.test(rawUrl || s.spotifyUrl || '') || /^spotify:track:/i.test(rawUrl || s.spotifyUrl || ''));
      const trackEditHtml = canShowTrackTools
        ? `<details class="track-card-editor"><summary>Edit / refresh track</summary><div class="track-card-edit-body"><input type="url" data-track-url-input value="${escapeHtml(rawUrl)}" placeholder="Paste corrected Spotify, YouTube, or web track URL"><div class="track-card-edit-actions"><button type="button" class="btn btn-primary" onclick="updateTrackUrlFromCard('${encodedKey}', ${editPendingIndex}, this, '${encodedPath}')">Update Track</button>${canSpotifyRefresh ? `<button type="button" class="btn btn-secondary" onclick="refreshGenrePageSpotifyTrack('${encodedKey}', this, '${encodedPath}')">Refresh Spotify</button>` : ''}<button type="button" class="btn btn-danger" onclick="removeTrackFromCard('${encodedKey}', ${editPendingIndex}, '${encodedPath}')">Remove Track</button></div><div class="track-card-edit-note">Update accepts Spotify, YouTube, or other web track links. Refresh Spotify updates title, artist, album, artwork, release year, duration, Spotify ID, and ISRC for Spotify tracks. use the floating Save button to persist.</div></div></details>`
        : '';
      const reactionStaged = currentGenre && stagedQueueReactionKeys.has(stagedReactionKey(currentGenre.id, songIdentity(s)));
      const isFavorite = currentGenre && isSameFavoriteSong(currentGenre, s);
      const reactionHtml = !s.isPending
        ? `<div class="song-reaction"><span class="song-reaction-label">How did this track hit?</span>
            <div class="song-quick-actions">
              <button type="button" class="song-reaction-btn ${Number(s.reaction) === 3 ? 'active' : ''}" onclick="setSongReaction('${encodedKey}', 3)" title="I Fuck With This" aria-label="I Fuck With This"><span class="reaction-emoji">👍</span></button>
              <button type="button" class="song-reaction-btn ${Number(s.reaction) === 2 ? 'active' : ''}" onclick="setSongReaction('${encodedKey}', 2)" title="Meh, It’s Fine" aria-label="Meh, It’s Fine"><span class="reaction-emoji">🤷</span></button>
              <button type="button" class="song-reaction-btn ${Number(s.reaction) === 1 ? 'active' : ''}" onclick="setSongReaction('${encodedKey}', 1)" title="Fuck Off" aria-label="Fuck Off"><span class="reaction-emoji">👎</span></button>
              <button type="button" class="song-favorite-btn ${isFavorite ? 'active' : ''}" onclick="makeSongFavorite('${encodedKey}')" title="${isFavorite ? 'Remove favorite track' : 'Make favorite track'}" aria-label="${isFavorite ? 'Remove favorite track' : 'Make favorite track'}">🏆</button>
              ${reactionStaged ? '<span class="song-reaction-unsaved">Unsaved</span>' : ''}
            </div>
           </div>`
        : '';
      return `<div class="song-card ${isChild ? 'song-card-alt' : ''} ${s.isAdd ? 'song-card-add' : (s.isPromote ? 'song-card-promote' : '')} ${s.isPending ? 'song-card-pending' : ''} ${(!isChild && s.score != null && Number(s.score) <= 2) ? 'song-card-dim' : ''} ${(!isChild && !s.isPending && currentGenre && normalizeSongUrl(currentGenre.favoritesongurl||'') === rawUrl) ? 'song-card-favorite' : ''}">${addBadge}<div class="song-card-row ${showArtwork ? '' : 'no-art'}">${art}<div style="min-width:0;">${titleHtml}${songArtistLine(s)}</div><div style="display:flex;align-items:center;gap:4px;flex-shrink:0;">${scoreBadge}${favBtn}${canShowTrackTools ? `<button type="button" class="song-remove-btn" title="Remove track" onclick="removeTrackFromCard('${encodedKey}', ${editPendingIndex}, '${encodedPath}')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>` : ''}</div></div>${reasonHtml}${releaseNote}${promotedNote}${pendingNote}${savedSongNoteHtml}${pendingSongNoteHtml}${reactionHtml}${noteEditorHtml}${trackEditHtml}${levelUpHtml}</div>`;
    }
    function buildDiscordBlock() {
      if (!currentGenre) return '';
      const includeSongs = document.getElementById('includeSongsToggle').checked;
      const rawDate = dateValue(currentGenre) || new Date().toISOString().slice(0,10);
      const dateStr = new Date(rawDate + 'T00:00:00').toLocaleDateString('en-US', {month:'2-digit',day:'2-digit',year:'2-digit'});
      let text = `Today's Genre (${dateStr}) is..... **${String(currentGenre.genre || 'UNKNOWN').toUpperCase()}**\n\n`;
      if (currentGenre.vibe) text += `${genreEmoji(currentGenre)} *Vibe: ${currentGenre.vibe}*\n\n`;
      if (currentGenre.summary) text += `${currentGenre.summary}\n\n`;
      if (currentGenre.key_artists) text += `🎤 Key Artists: ${currentGenre.key_artists}`;
      if (includeSongs && currentGenre.suggested_songs) {
        const songs = currentGenre.suggested_songs.split(',').map(s => s.trim()).filter(Boolean);
        text += `\n\n🎶 Suggested Songs:\n` + songs.map(s => `• ${s}`).join('\n');
      }
      return text.trim();
    }

    function mountDiscordShareSection() {
      const share = document.getElementById('shareSection');
      const slot = document.getElementById('discordShareSlot');
      if (share && slot && share.parentElement !== slot) {
        slot.appendChild(share);
      }
    }

    function updateDiscordBlock() {
      mountDiscordShareSection();
      const block = document.getElementById('discordBlock');
      if (block) block.value = buildDiscordBlock();
    }

    function renderStars() {
      const starsEl = document.getElementById('ratingStars');
      starsEl.innerHTML = [1,2,3,4,5].map(n =>
        `<button class="star-btn ${String(n) === String(selectedRating) ? 'active' : ''}" data-rating="${n}" aria-label="${n} stars">★</button>`
      ).join('');

      [...starsEl.querySelectorAll('.star-btn')].forEach(btn => {
        btn.onclick = () => {
          if (!currentGenre) return;
          selectedRating = btn.dataset.rating;
          const newlyDated = setListenDateTodayIfNeeded(currentGenre);
          currentGenre.rating = selectedRating;
          currentGenre.status = 'listened';
          loadListenScreen(currentGenre, { preserveDirty: true, skipSpotifyHydration: true });
          applyDetailEditMode(true);
          markDirty();
          showSaveToast(newlyDated
            ? `Rated ${selectedRating}★ and marked as listened today — click Save Changes to keep it.`
            : `Rating updated to ${selectedRating}★ — click Save Changes to keep it.`, false);
        };
      });

      document.getElementById('ratingStatus').textContent =
        currentGenre?.rating === 'zanger' ? 'Marked as Zanger' :
        selectedRating ? `${selectedRating} star${selectedRating === '1' ? '' : 's'} selected` :
        'No rating selected';
    }

    function setFavoriteSong(btn) {
      if (!currentGenre) return;
      const url = btn.dataset.favUrl || '';
      const title = btn.dataset.favTitle || '';
      const artist = btn.dataset.favArtist || '';
      const artwork = btn.dataset.favArtwork || '';
      const isSame = normalizeSongUrl(currentGenre.favoritesongurl || '') === url;
      if (isSame) {
        currentGenre.favoritesongurl = '';
        currentGenre.favoritesong = '';
        currentGenre.favoriteartist = '';
        currentGenre.favoritesongartwork = '';
      } else {
        currentGenre.favoritesongurl = url;
        currentGenre.favoritesong = title;
        currentGenre.favoriteartist = artist;
        currentGenre.favoritesongartwork = artwork;
      }
      document.getElementById('favoriteSongUrl').value = currentGenre.favoritesongurl || '';
      document.getElementById('favoriteSong').value = currentGenre.favoritesong || '';
      markDirty();
      loadListenScreen(currentGenre, { preserveDirty: true });
    }


    function setListenDateTodayIfNeeded(genre) {
      if (!genre) return false;
      if (dateValue(genre)) return false;
      genre.date_normalized = new Date().toISOString().slice(0, 10);
      genre.datenormalized = '';
      return true;
    }

    function markAsZangerToday(genre = currentGenre) {
      if (!genre) return;
      const onDetailPage = currentGenre === genre && document.getElementById('screen-listen')?.classList.contains('active');
      if (!onDetailPage) openGenreDetail(genre, true);
      setListenDateTodayIfNeeded(genre);
      genre.rating = 'zanger';
      genre.status = 'veto';
      genre.rank_order = null;
      selectedRating = '';
      loadListenScreen(genre, { preserveDirty: true, skipSpotifyHydration: true });
      applyDetailEditMode(true);
      markDirty();
      showSaveToast('Zanger logged for today — click Save Changes to keep it.', false);
    }

async function prepareAndSaveCurrentGenre(options = {}) {
      if (!currentGenre) {
        alert('Choose a genre first.');
        return;
      }
      const markListened = !!options.markListened;
      const alreadyListened = !!dateValue(currentGenre);

      currentGenre.rating = currentGenre.rating === 'zanger' ? 'zanger' : (selectedRating || currentGenre.rating || '');
      currentGenre.favoritesong = document.getElementById('favoriteSong').value.trim();
      currentGenre.favoritesongurl = document.getElementById('favoriteSongUrl').value.trim();
      if (currentGenre.favoritesongurl && currentGenre.favoritesongurl.includes('spotify.com/track/')) {
        const officialFavorite = await fetchSpotifyTrackMetadata(currentGenre.favoritesongurl);
        if (officialFavorite) {
          currentGenre.favoritesong = officialFavorite.title || currentGenre.favoritesong || '';
          currentGenre.favoriteartist = officialFavorite.artist || currentGenre.favoriteartist || '';
          currentGenre.favoritesongartwork = officialFavorite.artwork || currentGenre.favoritesongartwork || '';
        } else {
          const favData = await fetchSpotifyOembed(currentGenre.favoritesongurl);
          if (favData) {
            const raw = favData.title || '';
            const clean = raw.split(/[·\u2013\u2014]/)[0].trim() || raw;
            if (!currentGenre.favoritesong && clean) currentGenre.favoritesong = clean;
            if (favData.author_name) currentGenre.favoriteartist = favData.author_name;
            if (favData.thumbnail_url) currentGenre.favoritesongartwork = favData.thumbnail_url;
          }
        }
      }
      currentGenre.monthlycontender = document.getElementById('monthlyContender').checked;
      currentGenre.monthfavorite = document.getElementById('monthFavorite').checked;
      currentGenre.monthleastfavorite = document.getElementById('monthLeastFavorite').checked;
      currentGenre.notes = document.getElementById('notes').value.trim();

      const previousOfficial = inflateSongsFromStorage(currentGenre.songs_listened || []).filter(song => !song.isPending);
      let resolvedOfficial = previousOfficial;
      if (queueModelIsAuthoritative()) {
        // A recent inline queue edit is the source of truth. Do not reparse a stale
        // bulk textarea during setup/save, or earlier URL corrections can disappear.
        syncSongsBulkEditorFromModel();
      } else {
        const parsedOfficial = mergeSongMetadata(
          normalizeSongsListened(parseSongLinks(document.getElementById('songsListenedBulk').value)),
          previousOfficial
        );
        resolvedOfficial = await resolveSpotifyTitles(parsedOfficial);
      }
      currentGenre.songs_listened = resolvedOfficial;
      currentGenre.pending_songs = normalizePendingSongs(getPendingSongs(currentGenre));
      removeLoggedSongsFromPending(currentGenre);
      processPendingNominationsForGenre(currentGenre);

      if (markListened && !dateValue(currentGenre)) {
        currentGenre.date_normalized = new Date().toISOString().slice(0,10);
      }

      const completedListen = markListened || alreadyListened || !!dateValue(currentGenre);
      if (completedListen && dateValue(currentGenre)) {
        const currentMonthKey = (dateValue(currentGenre) || '').slice(0,7);
        if (currentMonthKey && (currentGenre.monthfavorite || currentGenre.monthleastfavorite)) {
          genres.forEach(g => {
            if (!g || g.id === currentGenre.id) return;
            if ((dateValue(g) || '').slice(0,7) !== currentMonthKey) return;
            if (currentGenre.monthfavorite) g.monthfavorite = false;
            if (currentGenre.monthleastfavorite) g.monthleastfavorite = false;
          });
        }

        if (currentGenre.rating === 'zanger') {
          currentGenre.status = 'veto';
          currentGenre.rank_order = null;
        } else {
          currentGenre.status = 'listened';
          if (currentGenre.rating) {
            if (!currentGenre.rank_order) {
              const sameTierCount = genres.filter(g => String(g.rating) === String(currentGenre.rating) && g.rating !== 'zanger' && g.id !== currentGenre.id).length;
              currentGenre.rank_order = sameTierCount + 1;
            }
            ensureRankOrderForRating(currentGenre.rating);
          }
        }
      } else {
        currentGenre.status = 'unlistened';
        currentGenre.rank_order = null;
        currentGenre.monthlycontender = false;
        currentGenre.monthfavorite = false;
        currentGenre.monthleastfavorite = false;
      }

      if (!appPassword) {
        pendingSaveAction = markListened ? 'mark_listened' : 'save';
        showSaveToast('Waiting for password…', false);
        openPasswordModal(pendingSaveAction);
        return;
      }

      try {
        await doSaveWithPassword(appPassword);
        updateRemainingCount();
        populateMonthFilter();
        renderHistory();
        renderRankings();
        loadListenScreen(currentGenre, { preserveDirty: false });
        lastSavedListenSnapshot = buildListenSnapshot();
        setUnsavedState(false);
        showSaveToast(markListened ? `Saved. ${currentGenre.genre || 'Genre'} marked as listened today.` : `Saved changes to ${currentGenre.genre || 'genre'}.`, false);
      } catch (e) {
        if (e && (e.code === 'STALE_DATA' || e.code === 'NO_REVISION')) {
          showSaveToast('Newer data exists elsewhere — reload this page before saving.', true);
          return;
        }
        if (e && e.code === 'AUTH_FAILED') {
          appPassword = '';
          openPasswordModal(markListened ? 'mark_listened' : 'save');
          passwordNotice.textContent = 'That password did not work.';
          showSaveToast('Password not accepted.', true);
          return;
        }
        showSaveToast(`Save failed: ${e?.message || 'Unknown Worker error.'}`, true);
      }
    }

    function startListeningNow() {
      markCurrentGenreListened();
    }

    async function markCurrentGenreListened() {
      if (!currentGenre) return;
      await prepareAndSaveCurrentGenre({ markListened: true });
    }

    function unlistenCurrentGenre() {
      if (!currentGenre || !dateValue(currentGenre)) return;
      const okay = window.confirm('Remove the listened date and return this genre to the unlistened pool? Notes, songs, reactions, and pending nominations will be kept.');
      if (!okay) return;
      const formerRating = currentGenre.rating;
      currentGenre.date_normalized = '';
      currentGenre.datenormalized = '';
      currentGenre.status = 'unlistened';
      currentGenre.rating = '';
      currentGenre.rank_order = null;
      currentGenre.monthlycontender = false;
      currentGenre.monthfavorite = false;
      currentGenre.monthleastfavorite = false;
      selectedRating = '';
      if (formerRating && formerRating !== 'zanger') ensureRankOrderForRating(formerRating);
      loadListenScreen(currentGenre, { preserveDirty: true, skipSpotifyHydration: true });
      markDirty();
      showSaveToast('Listen removed — click Save Changes to keep this correction.', false);
    }

    function promotePendingSongLegacy(url) {
      if (!currentGenre) return;
      const key = songIdentity({ url });
      const pending = normalizePendingSongs(getPendingSongs(currentGenre));
      const index = pending.findIndex(song => songIdentity(song) === key);
      if (index !== -1) promotePendingSong(index);
    }

    function removePendingSongLegacy(url) {
      if (!currentGenre) return;
      const key = songIdentity({ url });
      const pending = normalizePendingSongs(getPendingSongs(currentGenre));
      const index = pending.findIndex(song => songIdentity(song) === key);
      if (index !== -1) removePendingSong(index);
    }

    function getPendingSongs(genre) {
      if (!genre) return [];
      genre.pending_songs = normalizePendingSongs(genre.pending_songs || []);
      return genre.pending_songs;
    }

    function saveArchiveUiState() {
      archiveUiState = {
        archiveView,
        search: document.getElementById('archiveSearchInput')?.value || '',
        month: document.getElementById('historyMonthFilter')?.value || '',
        rating: document.getElementById('historyRatingFilter')?.value || '',
        flag: document.getElementById('archiveFlagFilter')?.value || '',
        sort: document.getElementById('archiveSortFilter')?.value || '',
        scrollY: window.scrollY || 0
      };
    }

    function restoreArchiveUiState() {
      switchScreen('history');
      if (!archiveUiState) {
        renderHistory();
        return;
      }
      archiveView = archiveUiState.archiveView || archiveView;
      document.querySelectorAll('[data-archive-view]').forEach(btn => btn.classList.toggle('active', btn.dataset.archiveView === archiveView));
      if (document.getElementById('archiveSearchInput')) document.getElementById('archiveSearchInput').value = archiveUiState.search || '';
      if (document.getElementById('historyMonthFilter')) document.getElementById('historyMonthFilter').value = archiveUiState.month || '';
      if (document.getElementById('historyRatingFilter')) document.getElementById('historyRatingFilter').value = archiveUiState.rating || '';
      if (document.getElementById('archiveFlagFilter')) document.getElementById('archiveFlagFilter').value = archiveUiState.flag || '';
      if (document.getElementById('archiveSortFilter')) document.getElementById('archiveSortFilter').value = archiveUiState.sort || 'newest';
      renderHistory();
      setTimeout(() => window.scrollTo({ top: archiveUiState.scrollY || 0, behavior: 'auto' }), 0);
    }

    function buildDetailNavList() {
      const items = (archiveCurrentItems && archiveCurrentItems.length) ? archiveCurrentItems.slice() : genres.slice();
      detailNavList = items
        .slice()
        .sort((a,b) => String(dateValue(a)||'').localeCompare(String(dateValue(b)||'')) || String(a.genre||'').localeCompare(String(b.genre||'')));
      return detailNavList;
    }

    function openAdjacentGenre(direction) {
      if (!currentGenre) return;
      const items = buildDetailNavList();
      const idx = items.findIndex(g => String(g.id) === String(currentGenre.id));
      if (idx === -1) return;
      const next = items[idx + direction];
      if (next) openGenreDetail(next, detailEditMode);
    }

    function promotePendingSong(index) {
      if (!currentGenre) return;
      const pending = normalizePendingSongs(getPendingSongs(currentGenre));
      const song = pending[index];
      if (!song) return;
      if (![1,2,3,4,5].includes(Number(song.nominatedFit))) {
        alert('Choose how well this song fits this genre before promoting it.');
        return;
      }
      const official = inflateSongsFromStorage(currentGenre.songs_listened || []).filter(s => !s.isPending);
      const key = songIdentity(song);
      if (!official.some(existing => songIdentity(existing) === key)) {
        const promoted = {
          ...song,
          score: Number(song.nominatedFit),
          isPromote: true,
          promotedFrom: song.pendingFrom || '',
          promotedFromFit: song.originFit != null ? Number(song.originFit) : (song.score != null ? Number(song.score) : null)
        };
        delete promoted.isPending;
        delete promoted.pendingFrom;
        delete promoted.originFit;
        delete promoted.nominatedFit;
        official.push(promoted);
      }
      pending.splice(index, 1);
      currentGenre.songs_listened = official;
      currentGenre.pending_songs = pending;
      loadListenScreen(currentGenre, { preserveDirty: true, skipSpotifyHydration: true });
      markDirty();
    }
    
    function removePendingSong(index) {
      if (!currentGenre) return;
      const pending = normalizePendingSongs(getPendingSongs(currentGenre));
      pending.splice(index, 1);
      currentGenre.pending_songs = pending;
      loadListenScreen(currentGenre, { preserveDirty: true });
      markDirty();
    }

    function clearPendingSongs() {
      if (!currentGenre) return;
      currentGenre.pending_songs = [];
      loadListenScreen(currentGenre, { preserveDirty: true });
      markDirty();
    }

    function renderPendingSongs(genre) {
      const panel = document.getElementById('pendingSongsPanel');
      if (!panel) return;
      const pending = getPendingSongs(genre);
      if (!pending.length) {
        panel.innerHTML = '<div class="pending-song-empty">No pending songs queued.</div>';
        return;
      }
      panel.innerHTML = pending.map((song, idx) => renderSongEntry(song, false, { pendingIndex: idx, allowTrackEdit: true })).join('');
    }

    function loadListenScreen(genre, options = {}) {
      currentGenre = genre;
      document.title = `${genre.genre || 'Genre'} | Daily Genre`;
      const preserveDirty = !!options.preserveDirty;
      selectedRating = genre.rating && genre.rating !== 'zanger' ? String(genre.rating) : '';

      document.getElementById('favoriteSong').value = genre.favoritesong || '';
      document.getElementById('favoriteSongUrl').value = genre.favoritesongurl || '';
      document.getElementById('monthlyContender').checked = !!genre.monthlycontender;
      document.getElementById('monthFavorite').checked = !!genre.monthfavorite;
      document.getElementById('monthLeastFavorite').checked = !!genre.monthleastfavorite;
      document.getElementById('notes').value = genre.notes || '';
      genre.songs_listened = inflateSongsFromStorage(genre.songs_listened || []);
      genre.pending_songs = normalizePendingSongs(genre.pending_songs || []);
      document.getElementById('songsListenedBulk').value = buildSongsBulkEditorText(genre);
      document.getElementById('includeSongsToggle').checked = false;

      const listenedDate = dateValue(genre);
      const songs = inflateSongsFromStorage(genre.songs_listened || []);
      const activeSongs = songs.filter(s => !s.isPending);
      const pendingSongs = normalizePendingSongs(getPendingSongs(genre));
      const songCount = countSongsForDisplay(activeSongs);
      const art = getGenreArtwork(genre);
      const ratingHero = genreRatingHeroMarkup(genre);
      document.getElementById('listenDetails').innerHTML = `
        <div class="detail-hero">
          <div class="detail-record-card">
            ${artworkHtml(art, 'genre-art', genre.genre || 'Genre artwork')}
            <div>
              <div class="eyebrow">Genre Detail</div>
              <h2>${escapeHtml(genre.genre || 'Unknown')}</h2>
              <div class="subtle">${escapeHtml(categoryLine(genre))}</div>
              <div class="status-row">
                ${ratingHero}
                ${listenedDate ? `<span class="tag">Listened on ${escapeHtml(listenedDate)}</span>` : ''}
                ${songCount ? `<span class="tag">${songCount} song${songCount === 1 ? '' : 's'} logged</span>` : '<span class="tag">Needs song log</span>'}
                ${hasAltTake(genre) ? '<span class="tag">Alt Take</span>' : ''}
                ${hasPending(genre) ? '<span class="tag tag-pending">⏳ Pending</span>' : ''}
                ${genre.monthlycontender ? '<span class="tag">📌 Monthly contender</span>' : ''}
                ${genre.monthfavorite ? '<span class="tag">★ Month favorite</span>' : ''}
                ${genre.monthleastfavorite ? '<span class="tag tag-warn">Month least favorite</span>' : ''}
              </div>              <div class="detail-actions">
                <button type="button" class="btn btn-secondary" onclick="openAdjacentGenre(-1)">← Previous</button>
                <button type="button" class="btn btn-secondary" onclick="restoreArchiveUiState()">Back to Archive</button>
                <button type="button" class="btn btn-secondary" onclick="openAdjacentGenre(1)">Next →</button>
                <button type="button" class="btn btn-secondary edit-mode-toggle" onclick="toggleDetailEditMode()">${detailEditMode ? 'Hide Setup Editor' : 'Edit Setup / Curation'}</button>
                <button type="button" class="spotify-queue-btn" onclick="openSpotifyPlaylistModal('${encodeURIComponent(String(genre.id || ''))}')">＋ Playlist</button>
                ${!listenedDate
                  ? `<button type="button" class="btn btn-primary" onclick="markCurrentGenreListened()">✓ Mark as Listened Today</button>`
                  : `<button type="button" class="btn btn-danger btn-compact listen-correction-btn" onclick="unlistenCurrentGenre()">Undo Listen / Remove Date</button>`}
              </div>

            </div>
          </div>

          ${genre.vibe ? `<div class="vibe">${genreEmoji(genre)} ${escapeHtml(genre.vibe)}</div>` : ''}
          <p>${genre.summary ? escapeHtml(genre.summary) : '<span class="small">No summary available yet.</span>'}</p>
          <div class="meta-grid">
            <div class="meta-box">
              <h3>Key artists</h3>
              <p>${genre.key_artists ? escapeHtml(genre.key_artists) : 'Not added yet.'}</p>
            </div>
            <div class="meta-box">
              <h3>Suggested songs</h3>
              <p>${genre.suggested_songs ? escapeHtml(genre.suggested_songs) : 'Not added yet.'}</p>
            </div>
          </div>
          ${renderGenreRatingPanel(genre)}
          ${renderListeningActionsPanel(genre)}
          ${renderAlbumDivePanel(genre)}
          ${renderGenreReactionSummary(genre)}
          ${renderPendingSongNotesPanel(genre)}
          <div class="detail-log-section">
            <div class="eyebrow">Logged Songs</div>
            ${activeSongs.length ? `<div class="detail-song-list">${activeSongs.map((song, idx) => renderSongEntry(song, false, { allowTrackEdit: true, songIndex: idx })).join('')}</div>` : '<div class="small">No songs logged yet. Add songs on the right and save to update this page.</div>'}
            <div class="pending-section"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-top:18px;margin-bottom:8px;"><div><div class="eyebrow" style="margin:0;">Pending Nominations</div><div class="small">Routing cleanup now lives in Review so cross-genre fixes happen in one place.</div></div><button type="button" class="btn btn-secondary btn-tiny" onclick="switchScreen('review')">Open Review</button></div>${pendingSongs.length ? `<div class="detail-song-list">${pendingSongs.map((song, idx) => renderSongEntry(song, false, { pendingIndex: idx, allowTrackEdit: true })).join('')}</div>` : '<div class="pending-song-empty">No pending songs queued.</div>'}</div>
          </div>
        </div>
      `;

      renderPendingSongs(genre);
      renderStars();
      updateDiscordBlock();
      const markBtn = document.getElementById('markListenedBtn');
      const unlistenBtn = document.getElementById('unlistenBtn');
      if (markBtn) markBtn.classList.toggle('hidden', !!listenedDate);
      if (unlistenBtn) unlistenBtn.classList.toggle('hidden', !listenedDate);
      applyDetailEditMode(false);
      if (!preserveDirty) {
        lastSavedListenSnapshot = buildListenSnapshot();
        setUnsavedState(false);
      }

      // Existing saved artwork/metadata is displayed here. Missing metadata is enriched
      // only through the explicit Refresh Metadata action in Visuals.
    }

    function openPasswordModal(action) {
      pendingSaveAction = action;
      passwordNotice.textContent = '';
      passwordInput.value = appPassword || '';
      passwordModal.classList.add('show');
      passwordInput.focus();
    }

    function closePasswordModal() {
      passwordModal.classList.remove('show');
      pendingSaveAction = null;
      passwordNotice.textContent = '';
    }

    async function refreshServerFileSha() {
      if (serverFileSha) return serverFileSha;
      try {
        const apiRes = await fetch(DATA_API_URL, { cache: 'no-store' });
        const meta = await apiRes.json().catch(() => ({}));
        if (apiRes.ok && meta && meta.sha) {
          serverFileSha = meta.sha;
          return serverFileSha;
        }
      } catch (error) {
        console.warn('Could not refresh GitHub file SHA before save', error);
      }
      return '';
    }


  async function doSaveWithPassword(password) {
    finalizeListeningUpdatesBeforeSave();

    if (blockSaveIfDuplicateGenres()) {
      const error = new Error('Duplicate genres detected. Clean the JSON before saving.');
      error.code = 'DUPLICATE_GENRES';
      throw error;
    }

    if (!serverFileSha) await refreshServerFileSha();      
    
    if (!serverFileSha) {
        const error = new Error('No loaded data revision is available. Reload before saving.');
        error.code = 'NO_REVISION';
        throw error;
      }

      const payload = genresForSave();
      let res;
      try {
        res = await fetch(WORKER_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Password': password,
            'X-Expected-Sha': serverFileSha
          },
          body: JSON.stringify(payload)
        });
      } catch (networkError) {
        const error = new Error('Could not reach the production Worker.');
        error.code = 'NETWORK_ERROR';
        throw error;
      }

      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        const error = new Error('That password did not work.');
        error.code = 'AUTH_FAILED';
        throw error;
      }
      if (res.status === 409 || data.conflict) {
        const error = new Error('Newer saved data exists. Reload this development page before saving.');
        error.code = 'STALE_DATA';
        throw error;
      }
      if (!res.ok || !data.ok) {
        const error = new Error(data.error || `Save failed (${res.status}).`);
        error.code = data.code || 'SAVE_FAILED';
        throw error;
      }

      serverFileSha = data.sha || serverFileSha;
      return data;
    }

    function ensureRankOrderForRating(rating) {
      const tierItems = genres
        .filter(g => String(g.rating) === String(rating) && g.rating !== 'zanger')
        .sort((a,b) => (a.rank_order ?? 9999) - (b.rank_order ?? 9999) || (dateValue(a) || '').localeCompare(dateValue(b) || '') || String(a.genre).localeCompare(String(b.genre)));

      tierItems.forEach((g, idx) => {
        g.rank_order = idx + 1;
      });
    }

    async function resolveSpotifyTitles(songs) {
      if (!songs || !songs.length) return songs;

      async function resolveOne(song) {
        const next = { ...song };
        next.url = normalizeSongUrl(next.url);

        if (next.url && (next.url.includes('spotify.com/track/') || /^spotify:track:/i.test(next.url))) {
          // Setup Editor saves should hydrate newly pasted Spotify URLs immediately.
          // Use force refresh when artwork/album/official metadata is missing so a stale cache
          // from an earlier failed lookup cannot leave the card blank until inline Update Track.
          const needsFreshSpotify = !next.spotifyMetadataFetched || !next.artwork || !next.album || !next.spotifyId;
          const official = await fetchSpotifyTrackMetadata(next.url, needsFreshSpotify);
          if (official) {
            applyOfficialSpotifyMetadata(next, official);
          } else {
            const fallback = await fetchSpotifyOembed(next.url);
            if (fallback) applySpotifyMetadata(next, fallback);
          }
        } else {
          await enrichSongReleaseMetadata(next);
        }

        if (next.levelUp) {
          next.levelUp = await resolveOne({ ...next.levelUp, url: normalizeSongUrl(next.levelUp.url) });
        }
        return next;
      }

      return Promise.all(songs.map(resolveOne));
    }

    let spotifyHydrationRun = 0;


    function hasPending(genre) {
      return inflateSongsFromStorage(genre?.songs_listened || []).some(s => !!s.isPending) || !!((genre?.pending_songs || []).length);
    }

    function hasAltTake(genre) {
      return inflateSongsFromStorage(genre?.songs_listened || []).some(song => !!song.levelUp);
    }

    function songSearchText(genre) {
      return inflateSongsFromStorage(genre?.songs_listened || []).flatMap(song => {
        const parts = [song.title, song.artist, song.reason, song.url, song.source, song.album, song.isrc, song.spotifyId];
        if (song.levelUp) parts.push(song.levelUp.title, song.levelUp.artist, song.levelUp.reason, song.levelUp.url, song.levelUp.source, song.levelUp.album, song.levelUp.isrc, song.levelUp.spotifyId);
        return parts;
      }).filter(Boolean).join(' ');
    }

    function numericRating(genre) {
      const n = parseInt(genre?.rating, 10);
      return Number.isFinite(n) ? n : 0;
    }

    function allSongsFlat(genre) {
      return inflateSongsFromStorage(genre?.songs_listened || []).flatMap(song => song.levelUp ? [song, song.levelUp] : [song]);
    }

    function getGenreArtwork(genre) {
      const songs = allSongsFlat(genre).filter(Boolean);
      const favoriteUrl = normalizeSongUrl(genre?.favoritesongurl || '');
      const favoriteMatch = favoriteUrl ? songs.find(s => normalizeSongUrl(s.url || s.spotifyUrl || '') === favoriteUrl && s.artwork) : null;
      if (favoriteMatch?.artwork) return favoriteMatch.artwork;
      if (genre?.favoritesongartwork) return genre.favoritesongartwork;
      const scored = songs.filter(s => s.artwork).sort((a,b) => Number(b.score || 0) - Number(a.score || 0));
      if (scored[0]?.artwork) return scored[0].artwork;
      const five = songs.find(s => Number(s.score) === 5 && s.artwork);
      if (five?.artwork) return five.artwork;
      const first = songs.find(s => s.artwork);
      return first?.artwork || '';
    }

    function artworkHtml(src, className, alt='') {
      if (src) return `<img class="${className}" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy">`;
      return `<div class="${className}" aria-hidden="true"></div>`;
    }

    function songArtistLine(song) {
      return song.artist ? `<div class="song-artist">${escapeHtml(song.artist)}</div>` : '';
    }

    function formatTrackDuration(ms) {
      const totalSeconds = Math.round(Number(ms || 0) / 1000);
      if (!totalSeconds) return '';
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = String(totalSeconds % 60).padStart(2, '0');
      return `${minutes}:${seconds}`;
    }



    function normalizePendingTag(value) {
      return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[_-]+/g, ' ')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    
function normalizeGenreNameForDedupe(value) {
  return normalizePendingTag(value);
}

function findDuplicateGenreGroups(list = genres) {
  const map = new Map();

  (list || []).forEach(g => {
    const key = normalizeGenreNameForDedupe(g?.genre || '');
    if (!key) return;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(g);
  });

  return [...map.entries()]
    .filter(([, rows]) => rows.length > 1)
    .map(([key, rows]) => ({ key, rows }));
}

function duplicateGenreSummary(groups, limit = 8) {
  return (groups || []).slice(0, limit).map(group => {
    const label = group.rows[0]?.genre || group.key;
    const ids = group.rows.map(g => g.id ?? '?').join(', ');
    return `${label} (${ids})`;
  }).join('\n');
}

function warnDuplicateGenresOnLoad() {
  const groups = findDuplicateGenreGroups(genres);
  if (!groups.length) return;

  console.warn('[Daily Genre] Duplicate genres found', groups);
  showSaveToast(
    `${groups.length} duplicate genre name${groups.length === 1 ? '' : 's'} found. Clean JSON before routing review items.`,
    true
  );
}

function blockSaveIfDuplicateGenres() {
  const groups = findDuplicateGenreGroups(genres);
  if (!groups.length) return false;

  const names = duplicateGenreSummary(groups, 10);
  alert(`Duplicate genres detected. Save blocked until cleaned:\n\n${names}`);
  console.warn('[Daily Genre] Save blocked because duplicate genres exist', groups);
  showSaveToast(`${groups.length} duplicate genre name${groups.length === 1 ? '' : 's'} must be cleaned before saving.`, true);
  return true;
}
    
    function resolvePendingTargetGenre(tag, sourceGenreId) {
      const wanted = normalizePendingTag(tag);
      if (!wanted) return { target: null, ambiguous: false };
      const candidates = genres.filter(g => g && String(g.id) !== String(sourceGenreId) && g.genre);
      const exact = candidates.filter(g => normalizePendingTag(g.genre) === wanted);
      if (exact.length === 1) return { target: exact[0], ambiguous: false };
      if (exact.length > 1) return { target: null, ambiguous: true };

      const near = candidates.filter(g => levenshtein(normalizePendingTag(g.genre), wanted) <= 2);
      if (near.length === 1) return { target: near[0], ambiguous: false };
      return { target: null, ambiguous: near.length > 1 };
    }

    function genresMatchPendingTag(tag, genreName) {
      return normalizePendingTag(tag) === normalizePendingTag(genreName);
    }

    function queuePendingNomination(target, sourceGenreName, songData) {
      if (!target || !songData) return false;
      target.pending_songs = normalizePendingSongs(target.pending_songs || []);
      target.songs_listened = inflateSongsFromStorage(target.songs_listened || []).filter(s => !s.isPending);
      const key = songIdentity(songData);
      if (!key) return false;
      if (target.songs_listened.some(song => songIdentity(song) === key)) return false;

      const existing = target.pending_songs.find(song => songIdentity(song) === key);
      if (existing) {
        let repaired = false;
        if (!existing.pendingFrom && sourceGenreName) { existing.pendingFrom = sourceGenreName; repaired = true; }
        if (existing.originFit == null && songData.score != null) { existing.originFit = Number(songData.score); repaired = true; }
        if (!existing.title && songData.title) { existing.title = songData.title; repaired = true; }
        if (!existing.artist && songData.artist) { existing.artist = songData.artist; repaired = true; }
        if (!existing.artwork && songData.artwork) { existing.artwork = songData.artwork; repaired = true; }
        return repaired;
      }

      target.pending_songs.push({
        ...songData,
        url: normalizeSongUrl(songData.url || ''),
        isPending: true,
        pendingFrom: sourceGenreName || '',
        originFit: songData.score != null ? Number(songData.score) : null,
        nominatedFit: null,
        isLevelUp: false,
        isAdd: false,
        levelUp: null
      });
      return true;
    }

    function processPendingNominationsForGenre(sourceGenre) {
      if (!sourceGenre) return 0;
      let added = 0;
      const sourceSongs = inflateSongsFromStorage(sourceGenre.songs_listened || []).filter(song => !song.isPending);
      sourceGenre.songs_listened = sourceSongs;
      for (const song of sourceSongs) {
        if (!song._pendingGenreTag || song.score == null || Number(song.score) > 3) continue;
        const resolved = resolvePendingTargetGenre(song._pendingGenreTag, sourceGenre.id);
        const target = resolved.target;
        if (!target) continue;
        const pendingSong = {
          url: song.url || '',
          score: song.score ?? null,
          reason: song.reason || '',
          title: song.title || '',
          artist: song.artist || '',
          artwork: song.artwork || '',
          source: song.source || '',
          spotifyId: song.spotifyId || '',
          spotifyUrl: song.spotifyUrl || '',
          album: song.album || '',
          artists: Array.isArray(song.artists) ? song.artists.slice() : [],
          durationMs: song.durationMs || null,
          isrc: song.isrc || '',
          releaseDate: song.releaseDate || '',
          releaseYear: song.releaseYear || null,
          releasePrecision: song.releasePrecision || '',
          releaseSource: song.releaseSource || '',
          spotifyMetadataFetched: !!song.spotifyMetadataFetched,
          spotifyMetadataFetchedAt: song.spotifyMetadataFetchedAt || '',
          added: song.added || new Date().toISOString().slice(0,10)
        };
        if (queuePendingNomination(target, sourceGenre.genre, pendingSong)) added += 1;
      }
      return added;
    }

    function removeLoggedSongsFromPending(genre) {
      if (!genre) return;
      const loggedKeys = new Set(inflateSongsFromStorage(genre.songs_listened || []).filter(song => !song.isPending).map(songIdentity));
      genre.pending_songs = normalizePendingSongs(genre.pending_songs || []).filter(song => !loggedKeys.has(songIdentity(song)));
    }


    function repairExistingPendingSources() {
      let repaired = 0;
      genres.forEach(sourceGenre => {
        const sourceSongs = inflateSongsFromStorage(sourceGenre.songs_listened || []).filter(song => !song.isPending);
        sourceSongs.forEach(song => {
          if (!song._pendingGenreTag || song.score == null || Number(song.score) > 3) return;
          const target = resolvePendingTargetGenre(song._pendingGenreTag, sourceGenre.id).target;
          if (!target) return;
          target.pending_songs = normalizePendingSongs(target.pending_songs || []);
          const pending = target.pending_songs.find(candidate => songIdentity(candidate) === songIdentity(song));
          if (!pending) return;
          if (!pending.pendingFrom) { pending.pendingFrom = sourceGenre.genre || ''; repaired += 1; }
          if (pending.originFit == null) { pending.originFit = Number(song.score); repaired += 1; }
        });
      });
      return repaired;
    }

    function pendingReviewSongPayload(song) {
      return {
        url: song.url || '',
        score: song.score ?? null,
        reason: song.reason || '',
        title: song.title || '',
        artist: song.artist || '',
        artwork: song.artwork || '',
        source: song.source || '',
        spotifyId: song.spotifyId || '',
        spotifyUrl: song.spotifyUrl || '',
        album: song.album || '',
        artists: Array.isArray(song.artists) ? song.artists.slice() : [],
        durationMs: song.durationMs || null,
        isrc: song.isrc || '',
        releaseDate: song.releaseDate || '',
        releaseYear: song.releaseYear || null,
        releasePrecision: song.releasePrecision || '',
        releaseSource: song.releaseSource || '',
        spotifyMetadataFetched: !!song.spotifyMetadataFetched,
        spotifyMetadataFetchedAt: song.spotifyMetadataFetchedAt || '',
        eraYear: song.eraYear || '',
        eraDecade: song.eraDecade || '',
        added: song.added || new Date().toISOString().slice(0,10)
      };
    }

    function collectPendingTagReviewRows() {
      const rows = [];
      (genres || []).forEach(sourceGenre => {
        const sourceSongs = inflateSongsFromStorage(sourceGenre.songs_listened || []).filter(song => !song.isPending);
        sourceSongs.forEach(song => {
          if (!song._pendingGenreTag || song.score == null || Number(song.score) > 3) return;
          const resolution = resolvePendingTargetGenre(song._pendingGenreTag, sourceGenre.id);
          rows.push({
            sourceGenre,
            song,
            tag: song._pendingGenreTag,
            key: songIdentity(song),
            resolution,
            status: resolution.target ? 'routable' : (resolution.ambiguous ? 'ambiguous' : 'unresolved')
          });
        });
      });
      return rows;
    }

    function reexaminePendingTags(options = {}) {
      let added = 0;
      let removed = 0;
      let unresolved = 0;
      const unresolvedRows = [];

      genres.forEach(sourceGenre => {
        const sourceSongs = inflateSongsFromStorage(sourceGenre.songs_listened || []).filter(song => !song.isPending);
        sourceSongs.forEach(song => {
          if (!song._pendingGenreTag || song.score == null || Number(song.score) > 3) return;
          const resolution = resolvePendingTargetGenre(song._pendingGenreTag, sourceGenre.id);
          const target = resolution.target;
          if (!target) {
            unresolved += 1;
            unresolvedRows.push({ sourceGenre, song, tag: song._pendingGenreTag, ambiguous: !!resolution.ambiguous });
            return;
          }

          const key = songIdentity(song);
          genres.forEach(possibleTarget => {
            if (String(possibleTarget.id) === String(target.id)) return;
            const pending = normalizePendingSongs(possibleTarget.pending_songs || []);
            const kept = pending.filter(candidate => {
              const fromSameSource = normalizePendingTag(candidate.pendingFrom || '') === normalizePendingTag(sourceGenre.genre || '');
              return !(fromSameSource && songIdentity(candidate) === key);
            });
            removed += pending.length - kept.length;
            possibleTarget.pending_songs = kept;
          });

          if (queuePendingNomination(target, sourceGenre.genre, pendingReviewSongPayload(song))) added += 1;
        });
      });

      if (added || removed) {
        setUnsavedState(true);
        if (currentGenre) {
          const restore = preserveScrollSnapshot();
          loadListenScreen(currentGenre, { preserveDirty: true, skipSpotifyHydration: true });
          restore();
        }
        showSaveToast(`Pending review updated: ${added} queued, ${removed} misplaced removed.${unresolved ? ` ${unresolved} tag${unresolved === 1 ? '' : 's'} need manual review.` : ''}`);
      } else if (unresolved) {
        showSaveToast(`${unresolved} pending tag${unresolved === 1 ? '' : 's'} could not be routed automatically.`, true);
      } else if (!options.silent) {
        showSaveToast('No pending routing changes found.');
      }
      if (document.getElementById('screen-review')?.classList.contains('active')) renderReview();
      return { added, removed, unresolved, unresolvedRows };
    }

    function pendingReviewStats() {
      const rows = collectPendingTagReviewRows();
      const pendingTotal = (genres || []).reduce((sum, g) => sum + normalizePendingSongs(g.pending_songs || []).length, 0);
      return {
        rows,
        pendingTotal,
        routable: rows.filter(row => row.status === 'routable').length,
        unresolved: rows.filter(row => row.status !== 'routable').length,
        ambiguous: rows.filter(row => row.status === 'ambiguous').length
      };
    }

    function collectQueuedPendingNominationRows() {
      return (genres || []).flatMap(targetGenre => normalizePendingSongs(targetGenre.pending_songs || []).map((song, index) => {
        const sourceName = song.pendingFrom || song.source || '';
        const fit = song.originFit ?? song.nominatedFit ?? song.score ?? '';
        return {
          targetGenre,
          song,
          index,
          key: songIdentity(song),
          sourceName,
          fit,
          added: song.added || ''
        };
      })).sort((a, b) =>
        String(a.targetGenre.genre || '').localeCompare(String(b.targetGenre.genre || '')) ||
        String(a.sourceName || '').localeCompare(String(b.sourceName || '')) ||
        String(a.song.artist || '').localeCompare(String(b.song.artist || '')) ||
        String(a.song.title || '').localeCompare(String(b.song.title || ''))
      );
    }

    function reviewQueuedPendingRowHtml(row) {
      const source = row.sourceName || 'Unknown source';
      const fitLine = row.fit !== '' && row.fit != null ? `<span class="review-chip">source fit ${escapeHtml(String(row.fit))}/5</span>` : '';
      const addedLine = row.added ? `<span class="review-chip">added ${escapeHtml(String(row.added))}</span>` : '';
      const searchText = [row.song.artist, row.song.title, row.targetGenre.genre, source, row.song.url].join(' ').toLowerCase();
      return `<div class="review-row" data-review-pending-row data-review-pending-text="${escapeHtml(searchText)}">
        <div>
          <div class="review-track-title">${vizSongTitleLink(row.song)}</div>
          <div class="review-meta">
            <span class="review-chip">queued in ${escapeHtml(row.targetGenre.genre || 'Unknown genre')}</span>
            <span class="review-chip">from ${escapeHtml(source)}</span>
            ${fitLine}
            ${addedLine}
          </div>
        </div>
        <div class="review-move">
          <button type="button" class="btn btn-secondary" onclick="openGenreByIdEncoded('${visualActionArg(row.targetGenre.id)}', false)">Open Target</button>
          ${spotifyHref(row.song) ? `<button type="button" class="btn btn-secondary" onclick="window.open('${escapeHtml(spotifyHref(row.song))}', '_blank', 'noopener')">Spotify</button>` : ''}
        </div>
      </div>`;
    }

    function filterReviewPendingQueue(inputId) {
      const input = document.getElementById(inputId);
      const term = String(input?.value || '').trim().toLowerCase();
      const rows = Array.from(document.querySelectorAll('[data-review-pending-row]'));
      let visible = 0;
      rows.forEach(row => {
        const haystack = String(row.dataset.reviewPendingText || '').toLowerCase();
        const show = !term || haystack.includes(term);
        row.classList.toggle('is-hidden', !show);
        if (show) visible += 1;
      });
      const count = document.getElementById('reviewPendingVisibleCount');
      if (count) count.textContent = `${visible} shown`;
    }

    function scrollToReviewPendingQueue() {
      const target = document.getElementById('reviewPendingQueueCard');
      target?.scrollIntoView({ behavior:'smooth', block:'start' });
    }

    function scrollToReviewManualQueue() {
      const target = document.getElementById('reviewManualQueueCard');
      target?.scrollIntoView({ behavior:'smooth', block:'start' });
    }

    function reviewGenreOptions(excludeId='') {
      return (genres || [])
        .filter(g => g && g.genre && String(g.id) !== String(excludeId))
        .sort((a,b) => String(a.genre || '').localeCompare(String(b.genre || '')))
        .map(g => `<option value="${escapeHtml(String(g.id))}">${escapeHtml(g.genre || '')}</option>`)
        .join('');
    }

    function pendingReviewRowId(sourceId, key) {
      const b64 = btoa(unescape(encodeURIComponent(String(key || '')))).replace(/[^a-z0-9_-]/gi, '');
      return `pending-review-${String(sourceId || '').replace(/[^a-z0-9_-]/gi, '-')}-${b64.slice(-24)}`;
    }

      function inboxGenreOptionsHtml() {
      return (genres || [])
        .filter(g => g && g.genre)
        .sort((a, b) => String(a.genre || '').localeCompare(String(b.genre || '')))
        .map(g => `<option value="${escapeHtml(String(g.id))}">${escapeHtml(g.genre || '')}</option>`)
        .join('');
    }

    function songInboxLines(raw) {
      const text = String(raw || '').trim();
      if (!text) return [];
      const urls = text.match(/https?:\/\/open\.spotify\.com\/track\/[A-Za-z0-9]{22}(?:\?[^\s\n<)]*)?|spotify:track:[A-Za-z0-9]{22}/gi) || [];
      const urlSet = new Set(urls.map(u => normalizeSongUrl(u)).filter(Boolean));
      const lines = text.split(/\n+/).map(line => line.trim()).filter(Boolean);
      const out = [];
      if (urlSet.size > 1) {
        urlSet.forEach(url => out.push(url));
        const nonUrlLines = lines.filter(line => !/open\.spotify\.com\/track\/[A-Za-z0-9]{22}|spotify:track:[A-Za-z0-9]{22}/i.test(line));
        nonUrlLines.forEach(line => out.push(line));
      } else {
        lines.forEach(line => {
          const found = line.match(/https?:\/\/open\.spotify\.com\/track\/[A-Za-z0-9]{22}(?:\?[^\s\n<)]*)?|spotify:track:[A-Za-z0-9]{22}/gi);
          if (found && found.length > 1) found.forEach(url => out.push(url));
          else out.push(line);
        });
      }
      return [...new Set(out.map(x => String(x || '').trim()).filter(Boolean))];
    }

    async function buildInboxSongFromText(raw) {
      raw = String(raw || '').trim();
      let song = { url: '', title: '', artist: '', artwork: '', spotifyId: '', guessNote: '' };
      const spotifyMatch = raw.match(/(?:spotify\.com\/track\/|spotify:track:)([A-Za-z0-9]{22})/i);

      if (spotifyMatch) {
        const canonical = normalizeSongUrl(raw);
        const track = await fetchSpotifyTrackMetadata(canonical || raw, true);
        if (track) {
          song.url = track.spotifyUrl || canonical || raw;
          song.title = track.title || '';
          song.artist = track.artist || '';
          song.artwork = track.artwork || track.albumArt || '';
          song.albumArt = track.albumArt || track.artwork || '';
          song.spotifyId = track.spotifyId || spotifyMatch[1];
          song.spotifyUrl = track.spotifyUrl || song.url;
          song.album = track.album || '';
          song.durationMs = track.durationMs || null;
          song.releaseYear = track.releaseYear || null;
          song.isrc = track.isrc || '';
          song.source = 'spotify';
        } else {
          song.url = canonical || raw;
          song.spotifyUrl = canonical || raw;
          song.spotifyId = spotifyMatch[1];
          song.source = 'spotify';
          const oembed = await fetchSpotifyOembed(canonical || raw);
          if (oembed) {
            song.title = oembed.title || '';
            song.artist = oembed.author_name || '';
            song.artwork = oembed.thumbnail_url || '';
            song.albumArt = oembed.thumbnail_url || '';
          }
        }
      } else {
        song.source = 'manual';
        const dashMatch = raw.match(/^(.+?)\s*[—–-]\s*(.+)$/);
        const artist = dashMatch ? dashMatch[1].trim() : '';
        const title = dashMatch ? dashMatch[2].trim() : raw;
        song.title = title;
        song.artist = artist;
        try {
          const term = encodeURIComponent(artist ? `${artist} ${title}` : title);
          const resp = await fetch(`https://itunes.apple.com/search?media=music&entity=song&limit=5&term=${term}`);
          if (resp.ok) {
            const data = await resp.json();
            const best = (data.results || [])[0];
            if (best) {
              song.title = best.trackName || title;
              song.artist = best.artistName || artist;
              song.artwork = (best.artworkUrl100 || '').replace('100x100', '300x300');
              song.albumArt = song.artwork;
              song.album = best.collectionName || '';
              song.releaseYear = best.releaseDate ? Number(String(best.releaseDate).slice(0,4)) : null;
            }
          }
        } catch(e) {}
      }
      return song;
    }

    function addInboxSongToPending(target, song, sourceLabel = 'Song Inbox') {
      return queuePendingNomination(target, sourceLabel, {
        ...song,
        score: null,
        reason: '',
        isPending: true,
        pendingFrom: sourceLabel,
        originFit: null,
        nominatedFit: null,
        isLevelUp: false,
        isAdd: false,
        levelUp: null
      });
    }

    function renderSongInboxCard() {
      const unassigned = songInbox.filter(s => !s._routed);
      const unassignedHtml = unassigned.length ? `
        <div style="margin-top:14px;">
          <div class="eyebrow" style="margin-bottom:8px;">Unassigned (${unassigned.length})</div>
          <div class="inbox-unassigned-list">
            ${unassigned.map((song, idx) => {
              const selectId = `inbox-route-${idx}`;
              const label = (song.artist ? `${song.artist} — ` : '') + (song.title || song.url || 'Unknown');
              return `<div class="inbox-unassigned-row">
                <div>
                  <div class="inbox-unassigned-title">${escapeHtml(label)}</div>
                  <div class="inbox-unassigned-meta">${song.guessNote ? escapeHtml(song.guessNote) : 'Unknown genre tag'}</div>
                </div>
                <div class="inbox-move-row">
                  <select id="${selectId}" aria-label="Route to genre">
                    <option value="">Choose genre…</option>
                    ${inboxGenreOptionsHtml()}
                  </select>
                  <button type="button" class="btn btn-primary" style="white-space:nowrap;" onclick="routeInboxSong(${idx}, '${selectId}')">Route</button>
                  <button type="button" class="btn btn-danger" onclick="dismissInboxSong(${idx})">✕</button>
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>` : '';

      return `<div class="inbox-card">
        <div class="review-card-head">
          <div>
            <h3>Song Inbox</h3>
            <p class="small" style="margin:6px 0 0;">Paste one song or many. Choose a genre to route directly to that genre’s pending queue, or leave it blank for Unknown / unassigned.</p>
          </div>
        </div>
        <div class="inbox-bulk-grid">
          <label class="inbox-bulk-text"><span class="sr-only">Songs</span><textarea id="inboxSongInput" rows="5" placeholder="https://open.spotify.com/track/…&#10;Artist — Title&#10;Another Spotify URL"></textarea></label>
          <label class="inbox-target-genre"><span>Optional genre</span><select id="inboxTargetGenre"><option value="">Unknown / unassigned</option>${inboxGenreOptionsHtml()}</select></label>
          <button type="button" class="btn btn-primary" onclick="addToSongInbox()">Add to Inbox</button>
        </div>
        <div class="inbox-result" id="inboxResult"></div>
        ${unassignedHtml}
      </div>`;
    }

    async function addToSongInbox() {
      const input = document.getElementById('inboxSongInput');
      const resultEl = document.getElementById('inboxResult');
      const targetSelect = document.getElementById('inboxTargetGenre');
      if (!input || !resultEl) return;
      const raw = input.value.trim();
      const lines = songInboxLines(raw);
      if (!lines.length) return;

      const target = targetSelect?.value ? (genres || []).find(g => String(g.id) === String(targetSelect.value)) : null;
      if (targetSelect?.value && !target) {
        resultEl.className = 'inbox-result err';
        resultEl.textContent = 'Selected genre was not found.';
        return;
      }

      resultEl.className = 'inbox-result';
      resultEl.textContent = `Processing ${lines.length} song${lines.length === 1 ? '' : 's'}…`;

      const routed = [];
      const unassigned = [];
      const failed = [];
      for (const line of lines) {
        try {
          const song = await buildInboxSongFromText(line);
          if (!song.title && !song.url) {
            failed.push(line);
            continue;
          }
          if (target) {
            addInboxSongToPending(target, song, 'Song Inbox');
            routed.push(song);
          } else {
            song.guessNote = 'Unknown genre tag — route manually when ready.';
            songInbox.push(song);
            unassigned.push(song);
          }
        } catch (error) {
          console.warn('Song inbox item failed', line, error);
          failed.push(line);
        }
      }

      if (routed.length || unassigned.length) {
        setUnsavedState(true);
        libraryUpdatesPending = true;
        toggleLibrarySaveButton(true);
        input.value = '';
      }

      const parts = [];
      if (routed.length) parts.push(`✓ Routed ${routed.length} to ${target.genre} pending.`);
      if (unassigned.length) parts.push(`Added ${unassigned.length} to Unknown / unassigned inbox.`);
      if (failed.length) parts.push(`${failed.length} could not be read.`);
      const message = parts.join(' ');
      resultEl.className = failed.length && !routed.length && !unassigned.length ? 'inbox-result err' : 'inbox-result ok';
      resultEl.textContent = message;
      if (message) showSaveToast(message, failed.length && !routed.length && !unassigned.length);
      renderReview();
    }

    function guessGenreForSong(song) {
      // Strategy 1: artist name directly matches a genre name (e.g. artist "Blues" → genre "Blues")
      // Strategy 2: fuzzy artist name appears inside a genre name or vice versa
      // Strategy 3: title keywords match genre name keywords
      const candidateGenres = (genres || []).filter(g => g && g.genre);
      if (!candidateGenres.length) return { target: null, note: 'No genres in library.' };

      const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
      const artistNorm = norm(song.artist);
      const titleNorm = norm(song.title);

      // Score each genre
      const scored = candidateGenres.map(g => {
        const genreNorm = norm(g.genre);
        let score = 0;

        // Check existing songs in this genre for same artist
        const genreSongs = inflateSongsFromStorage(g.songs_listened || []).filter(s => !s.isPending);
        const artistMatch = genreSongs.some(s => norm(s.artist) === artistNorm && artistNorm.length > 2);
        if (artistMatch) score += 12; // Strong signal: artist already logged in this genre

        // Genre name words appear in artist or title
        const genreWords = genreNorm.split(' ').filter(w => w.length > 3);
        genreWords.forEach(w => {
          if (artistNorm.includes(w)) score += 3;
          if (titleNorm.includes(w)) score += 2;
        });

        // Levenshtein proximity between artist and genre name
        const lev = levenshtein(artistNorm, genreNorm);
        if (lev <= 2 && artistNorm.length > 3) score += 6;
        else if (lev <= 4 && artistNorm.length > 4) score += 2;

        return { genre: g, score };
      }).sort((a, b) => b.score - a.score);

      const best = scored[0];
      const second = scored[1];

      // Only auto-route if the top guess is confident and clearly ahead of second
      if (best.score >= 10 && (!second || best.score >= second.score + 4)) {
        return {
          target: best.genre,
          note: `Guessed "${best.genre.genre}" (score ${best.score}).`
        };
      }

      if (best.score >= 4) {
        return {
          target: null,
          note: `Top guesses: ${scored.slice(0,3).filter(s=>s.score>0).map(s=>`${s.genre.genre} (${s.score})`).join(', ')}. Needs manual routing.`
        };
      }

      return { target: null, note: 'No confident genre match found.' };
    }

    function routeInboxSong(idx, selectId) {
      const song = songInbox[idx];
      const select = document.getElementById(selectId);
      if (!song || !select?.value) { showSaveToast('Choose a target genre first.', true); return; }
      const target = (genres || []).find(g => String(g.id) === String(select.value));
      if (!target) { showSaveToast('Genre not found.', true); return; }
      queuePendingNomination(target, 'Song Inbox', {
        ...song,
        score: null,
        reason: '',
        isPending: true,
        pendingFrom: 'Song Inbox',
        originFit: null,
        nominatedFit: null,
        isLevelUp: false,
        isAdd: false,
        levelUp: null
      });
      songInbox[idx]._routed = true;
      setUnsavedState(true);
      libraryUpdatesPending = true;
      toggleLibrarySaveButton(true);
      showSaveToast(`Routed to ${target.genre}. Save Library Updates to persist.`);
      renderReview();
    }

    function dismissInboxSong(idx) {
      songInbox.splice(idx, 1);
      renderReview();
    }
    function renderReview() {
      const mount = document.getElementById('reviewContent');
      if (!mount) return;
      const stats = pendingReviewStats();
      const manualRows = stats.rows.filter(row => row.status !== 'routable');
      const queuedRows = collectQueuedPendingNominationRows();
      mount.innerHTML = renderSongInboxCard() + `
        <div class="review-stat-grid">
          <button type="button" class="review-stat" onclick="scrollToReviewPendingQueue()"><strong>${stats.pendingTotal}</strong><span>Queued pending nominations</span></button>
          <div class="review-stat"><strong>${stats.routable}</strong><span>Auto-routable @tags</span></div>
          <button type="button" class="review-stat" onclick="scrollToReviewManualQueue()"><strong>${stats.unresolved}</strong><span>Need manual review</span></button>
          <div class="review-stat"><strong>${libraryUpdatesPending || hasUnsavedChanges ? 'Yes' : 'No'}</strong><span>Unsaved cleanup</span></div>
        </div>
        <div class="review-card" id="reviewPendingQueueCard">
          <div class="review-card-head">
            <div>
              <h3>Queued pending nominations</h3>
              <p class="small" style="margin:6px 0 0;">These are the actual songs sitting in each genre’s pending queue. Click a target genre to see/listen/edit it there.</p>
            </div>
            <span class="review-chip">${queuedRows.length} total</span>
          </div>
          <div class="review-filter-row">
            <input id="reviewPendingSearch" type="search" placeholder="Search queued songs, source genre, or target genre…" oninput="filterReviewPendingQueue('reviewPendingSearch')">
            <span class="small" id="reviewPendingVisibleCount">${queuedRows.length} shown</span>
          </div>
          ${queuedRows.length ? `<div class="review-list-scroll">${queuedRows.map(reviewQueuedPendingRowHtml).join('')}</div>` : `<div class="viz-empty">No songs are currently queued as pending nominations.</div>`}
        </div>
        <div class="review-card" id="reviewManualQueueCard">
          <div class="review-card-head">
            <div>
              <h3>Pending nomination routing</h3>
              <p class="small" style="margin:6px 0 0;">This section is only for low-fit songs with unresolved @tags that have not been safely routed yet.</p>
            </div>
            ${libraryUpdatesPending ? '<button type="button" class="btn btn-primary" onclick="saveLibraryUpdates()">Save Library Updates</button>' : ''}
          </div>
          ${manualRows.length ? manualRows.map(row => {
            const selectId = pendingReviewRowId(row.sourceGenre.id, row.key);
            const title = (row.song.artist ? `${row.song.artist} — ` : '') + (row.song.title || 'Untitled track');
            const reason = row.status === 'ambiguous' ? 'multiple possible genre matches' : 'no confident genre match';
            return `<div class="review-row">
              <div>
                <div class="review-track-title">${escapeHtml(title)}</div>
                <div class="review-meta">
                  <span class="review-chip warn">tag: @${escapeHtml(row.tag || '')}</span>
                  <span class="review-chip">from ${escapeHtml(row.sourceGenre.genre || 'Unknown')}</span>
                  <span class="review-chip">fit ${escapeHtml(String(row.song.score ?? ''))}/5</span>
                  <span class="review-chip warn">${escapeHtml(reason)}</span>
                </div>
              </div>
              <div class="review-move">
                <select id="${selectId}" aria-label="Move pending nomination target"><option value="">Choose genre…</option>${reviewGenreOptions(row.sourceGenre.id)}</select>
                <button type="button" class="btn btn-secondary" onclick="movePendingReviewItem('${visualActionArg(row.sourceGenre.id)}', '${visualActionArg(row.key)}', '${selectId}')">Move</button>
              </div>
            </div>`;
          }).join('') : `<div class="viz-empty">No ambiguous pending @tags need manual routing right now.</div>`}
        </div>`;
    }

    function runPendingTagCleanupFromReview() {
      preserveScrollPosition(async () => {
        reexaminePendingTags();
        renderReview();
      });
    }

    function movePendingReviewItem(encodedSourceId, encodedKey, selectId) {
      const sourceId = decodeURIComponent(String(encodedSourceId || ''));
      const key = decodeURIComponent(String(encodedKey || ''));
      const select = document.getElementById(selectId);
      const targetId = select?.value || '';

      if (!targetId) {
        showSaveToast('Choose a target genre first.', true);
        return;
      }

      const sourceGenre = (genres || []).find(g => String(g.id) === String(sourceId));
      const target = (genres || []).find(g => String(g.id) === String(targetId));

      if (!sourceGenre || !target) {
        showSaveToast('Could not find that source or target genre.', true);
        return;
      }

      const sourceSongs = inflateSongsFromStorage(sourceGenre.songs_listened || []).filter(song => !song.isPending);
      const songIndex = sourceSongs.findIndex(candidate => songIdentity(candidate) === key);
      const song = songIndex >= 0 ? sourceSongs[songIndex] : null;

      if (!song) {
        showSaveToast('Could not find that pending source song.', true);
        return;
      }

      genres.forEach(possibleTarget => {
        const pending = normalizePendingSongs(possibleTarget.pending_songs || []);
        possibleTarget.pending_songs = pending.filter(candidate => {
          const fromSameSource = normalizePendingTag(candidate.pendingFrom || '') === normalizePendingTag(sourceGenre.genre || '');
          return !(fromSameSource && songIdentity(candidate) === key);
        });
      });

      const added = queuePendingNomination(target, sourceGenre.genre, pendingReviewSongPayload(song));

      // This manual Review move resolves the original pending tag marker.
      // Without clearing it, renderReview() immediately shows the same row again.
      sourceSongs[songIndex]._pendingGenreTag = '';
      sourceGenre.songs_listened = sourceSongs;

      setUnsavedState(true);
      libraryUpdatesPending = true;
      toggleLibrarySaveButton(true);
      renderReview();

      if (currentGenre) {
        const restore = preserveScrollSnapshot();
        loadListenScreen(currentGenre, { preserveDirty: true, skipSpotifyHydration: true });
        applyDetailEditMode(detailEditMode);
        restore();
      }

      showSaveToast(
        added
          ? `Moved pending nomination to ${target.genre}. Save Library Updates to persist.`
          : `Pending nomination already exists in ${target.genre}. Save Library Updates to persist.`,
        false
      );
    }



    function applyDetailEditMode(focusEditor = false) {
      const screen = document.getElementById('screen-listen');
      const panel = document.getElementById('listenEditPanel');
      if (!screen || !panel) return;
      screen.classList.toggle('is-view-mode', !detailEditMode);
      panel.classList.toggle('is-hidden', !detailEditMode);
      panel.classList.toggle('is-editing', detailEditMode);
      if (detailEditMode && focusEditor) {
        setTimeout(() => document.getElementById('songsListenedBulk')?.focus(), 0);
      }
    }

    function toggleDetailEditMode() {
      if (!currentGenre) return;
      detailEditMode = !detailEditMode;
      loadListenScreen(currentGenre, { preserveDirty: true, skipSpotifyHydration: true });
      applyDetailEditMode(detailEditMode);
    }

    function openGenreDetail(genre, editMode=false, options = {}) {
      if (!genre) return false;
      saveArchiveUiState();
      detailEditMode = !!editMode || !dateValue(genre);
      try {
        loadListenScreen(genre);
      } catch (error) {
        console.error('Could not open genre detail', error, genre);
        showSaveToast('Could not open that genre. Check the console for details.', true);
        return false;
      }
      const switched = switchScreen('listen', { force: !!options.force, preserveScroll: !!options.preserveScroll });
      if (!switched) return false;
      applyDetailEditMode(detailEditMode);
      if (genre.id != null) history.replaceState(null, '', '#genre=' + encodeURIComponent(String(genre.id)));
      if (!options.preserveScroll) {
        requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }));
      }
      return true;
    }

    window.openGenreDetail = openGenreDetail;


    function rankedGenresForTier(tier) {
      return genres
        .filter(g => String(g.rating) === String(tier) && g.rating !== 'zanger')
        .sort((a,b) => (a.rank_order ?? 9999) - (b.rank_order ?? 9999));
    }

    function moveRank(id, direction) {
      const item = genres.find(g => String(g.id) === String(id));
      if (!item || !item.rating || item.rating === 'zanger') return;

      const tierItems = rankedGenresForTier(item.rating);
      const index = tierItems.findIndex(g => String(g.id) === String(item.id));
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= tierItems.length) return;

      const other = tierItems[swapIndex];
      const temp = item.rank_order;
      item.rank_order = other.rank_order;
      other.rank_order = temp;

      ensureRankOrderForRating(item.rating);
      renderRankings();
    }

    function renderRankings() {
      const wrap = document.getElementById('rankingWrap');
      if (!wrap) return;
      const tiers = [
        { rating: 5, label: 'Inject This Into My Veins (5★)' },
        { rating: 4, label: 'Hell Yeah, Run It Back (4★)' },
        { rating: 3, label: 'Glad I Heard It (3★)' },
        { rating: 2, label: 'Respectfully, Nah (2★)' },
        { rating: 1, label: 'Get This Off My Turntable (1★)' }
      ];

      wrap.innerHTML = tiers.map(tier => {
        const items = rankedGenresForTier(tier.rating);
        return `
          <div class="ranking-tier">
            <h3>${tier.label}</h3>
            ${items.length ? items.map((g, idx) => `
              <div class="ranking-row">
                <div class="ranking-num">${idx + 1}</div>
                ${artworkHtml(getGenreArtwork(g), 'ranking-artwork', g.genre || 'Genre artwork')}
                <div>
                  <button type="button" class="linklike" data-rank-open-id="${g.id}" style="padding:0;border:0;background:transparent;color:inherit;text-align:left;font-weight:900;font-size:1rem;cursor:pointer;">${escapeHtml(g.genre || 'Unknown')}</button>
                  <div class="small">${escapeHtml(categoryLine(g))}${g.favoritesong ? ` · favorite: ${escapeHtml(g.favoritesong)}` : ''}</div>
                </div>
                <div class="rank-controls">
                  <button class="icon-btn" onclick="moveRank('${g.id}', 'up')" title="Move up">↑</button>
                  <button class="icon-btn" onclick="moveRank('${g.id}', 'down')" title="Move down">↓</button>
                </div>
              </div>
            `).join('') : '<div class="small">No genres in this tier yet.</div>'}
          </div>
        `;
      }).join('') + `
        <div class="ranking-tier">
          <h3>Zangers</h3>
          ${genres.filter(g => String(g.rating) === 'zanger' || (g.status || '').toLowerCase() === 'veto').map(g => `
            <div class="ranking-row">
              <div class="ranking-num">✕</div>
              ${artworkHtml(getGenreArtwork(g), 'ranking-artwork', g.genre || 'Genre artwork')}
              <div>
                <button type="button" class="linklike" data-rank-open-id="${g.id}" style="padding:0;border:0;background:transparent;color:inherit;text-align:left;font-weight:900;font-size:1rem;cursor:pointer;">${escapeHtml(g.genre || 'Unknown')}</button>
                <div class="small">${escapeHtml(categoryLine(g))}</div>
              </div>
              <div></div>
            </div>
          `).join('') || '<div class="small">No zangers yet.</div>'}
        </div>
      `;

      wrap.querySelectorAll('[data-rank-open-id]').forEach(btn => {
        btn.addEventListener('click', () => {
          const genre = genres.find(g => String(g.id) === String(btn.dataset.rankOpenId));
          if (genre) openGenreDetail(genre, false);
        });
      });
    }

    function toggleSongLog(id) {
      const el = document.getElementById(id);
      if (!el) return;
      const isOpen = el.style.display === 'grid' || el.style.display === 'block';
      el.style.display = isOpen ? 'none' : 'grid';
    }

    function renderArchiveSummary(items, label) {
      const summary = document.getElementById('archiveSummary');
      if (!summary) return;
      const altCount = items.filter(hasAltTake).length;
      const contenderCount = items.filter(g => !!g.monthlycontender).length;
      const zangerCount = items.filter(g => String(g.rating || '') === 'zanger' || (g.status || '').toLowerCase() === 'veto').length;
      const songCount = items.reduce((total, g) => total + countSongsForDisplay(g.songs_listened || []), 0);
      const rated = items.map(numericRating).filter(Boolean);
      const avg = rated.length ? (rated.reduce((a,b) => a+b, 0) / rated.length).toFixed(1) : '—';
      summary.innerHTML = `
        <span>${escapeHtml(label)} · ${items.length} entr${items.length === 1 ? 'y' : 'ies'}</span>
        <span class="archive-stat-chip">avg ${escapeHtml(avg)} ★</span>
        <span class="archive-stat-chip">${songCount} song${songCount === 1 ? '' : 's'}</span>
        <span class="archive-stat-chip">${altCount} Alt Take${altCount === 1 ? '' : 's'}</span>
        <span class="archive-stat-chip">${contenderCount} contender${contenderCount === 1 ? '' : 's'}</span>
        <span class="archive-stat-chip">${zangerCount} zanger${zangerCount === 1 ? '' : 's'}</span>
      `;
    }

    function renderHistory() {
      const monthEl = document.getElementById('historyMonthFilter');
      const ratingEl = document.getElementById('historyRatingFilter');
      const searchEl = document.getElementById('archiveSearchInput') || document.getElementById('historyCategoryFilter');
      const flagEl = document.getElementById('archiveFlagFilter');
      const sortEl = document.getElementById('archiveSortFilter');
      const list = document.getElementById('historyList');
      if (!list) return;

      const month = monthEl ? monthEl.value : '';
      const rating = ratingEl ? ratingEl.value : '';
      const query = searchEl ? searchEl.value.trim().toLowerCase() : '';
      const flag = flagEl ? flagEl.value : '';
      const sort = sortEl ? sortEl.value : 'newest';

      const listenedAll = genres
        .filter(g => ['listened', 'veto'].includes((g.status || '').toLowerCase()))
        .filter(g => dateValue(g));

      const months = [...new Set(listenedAll.map(g => dateValue(g).slice(0,7)))].sort((a,b) => b.localeCompare(a));
      const latestMonth = months[0] || '';
      const effectiveMonth = archiveView === 'monthly' && !month ? latestMonth : month;

      let items = listenedAll.slice();
      let label = 'All logs';

      if (archiveView === 'monthly') {
        label = effectiveMonth ? `Monthly view · ${effectiveMonth}` : 'Monthly view';
        if (effectiveMonth) items = items.filter(g => dateValue(g).startsWith(effectiveMonth));
      } else if (archiveView === 'contenders') {
        label = 'Monthly contenders';
        items = items.filter(g => !!g.monthlycontender);
      } else if (archiveView === 'zangers') {
        label = 'Zangers';
        items = items.filter(g => String(g.rating || '') === 'zanger' || (g.status || '').toLowerCase() === 'veto');
      } else if (archiveView === 'alttakes') {
        label = 'Genres with Alt Takes';
        items = items.filter(hasAltTake);
      } else if (archiveView === 'pending') {
        label = 'Genres with Pending Nominations';
        items = items.filter(hasPending);
      }

      if (effectiveMonth && archiveView !== 'monthly') items = items.filter(g => dateValue(g).startsWith(effectiveMonth));
      if (rating) items = items.filter(g => String(g.rating || '') === rating);

      if (flag === 'contender') items = items.filter(g => !!g.monthlycontender);
      if (flag === 'alt') items = items.filter(hasAltTake);
      if (flag === 'pending') items = items.filter(hasPending);
      if (flag === 'songs') items = items.filter(g => countSongsForDisplay(g.songs_listened || []) > 0);
      if (flag === 'favorite') items = items.filter(g => !!(g.favoritesong || g.favoritesongurl));
      if (flag === 'missing-songs') items = items.filter(g => countSongsForDisplay(g.songs_listened || []) === 0);
      if (flag === 'missing-favorite') items = items.filter(g => !(g.favoritesong || g.favoritesongurl));
      if (flag === 'notes') items = items.filter(g => !!g.notes);
      if (flag === 'zanger') items = items.filter(g => String(g.rating || '') === 'zanger' || (g.status || '').toLowerCase() === 'veto');
      if (flag === 'unranked') items = items.filter(g => countSongsForDisplay(g.songs_listened || []) > 0 && !g.rank_order && g.rating !== 'zanger');

      if (query) {
        const normalizedQuery = normalizeGenreSearchText(query);
        items = items
          .map(g => ({ g, rank: genreSearchRank(g, query), blob: normalizeGenreSearchText(genreSearchBlob(g)) }))
          .filter(row => row.rank < 9 || row.blob.includes(normalizedQuery))
          .sort((a, b) => a.rank - b.rank || String(a.g.genre || '').localeCompare(String(b.g.genre || '')))
          .map(row => row.g);
      }

      const byGenre = (a,b) => String(a.genre || '').localeCompare(String(b.genre || ''));
      // When searching, relevance must stay primary. Otherwise an exact hit like
      // "funk" can get buried under date/rating/archive sort behind "free funk".
      if (!query) {
        if (sort === 'oldest') items.sort((a,b) => (dateValue(a) || '').localeCompare(dateValue(b) || '') || byGenre(a,b));
        else if (sort === 'rating-desc') items.sort((a,b) => numericRating(b) - numericRating(a) || byGenre(a,b));
        else if (sort === 'rating-asc') items.sort((a,b) => numericRating(a) - numericRating(b) || byGenre(a,b));
        else if (sort === 'genre') items.sort(byGenre);
        else if (sort === 'rank') items.sort((a,b) => (a.rank_order ?? 9999) - (b.rank_order ?? 9999) || numericRating(b) - numericRating(a) || byGenre(a,b));
        else items.sort((a,b) => (dateValue(b) || '').localeCompare(dateValue(a) || '') || byGenre(a,b));
      }

      archiveCurrentItems = items;
      archiveCurrentLabel = label;
      renderArchiveSummary(items, label);
      archiveUpdatePlaylistButtons();

      if (!items.length) {
        list.innerHTML = `<div class="small">No matching entries yet.</div>`;
        return;
      }

      window._archiveItems = items;
      list.innerHTML = items.map(g => {
        const songs = normalizeSongsListened(g.songs_listened || []);
        const songCount = countSongsForDisplay(songs);
        const ratingLabel = escapeHtml(genreRatingStarsOnly(g));
        const art = getGenreArtwork(g);
        return `
        <div class="list-item archive-card">
          ${artworkHtml(art, 'archive-artwork', g.genre || 'Genre artwork')}
          <div class="archive-card-main">
            <div class="archive-card-body">
              <h3 class="archive-card-title">${escapeHtml(g.genre || 'Unknown')}</h3>
              <div class="small archive-card-meta">${escapeHtml(categoryLine(g))}</div>
              <div class="status-row">
                <span class="tag">${ratingLabel}</span>
                ${g.monthlycontender ? '<span class="tag">📌 Monthly contender</span>' : ''}
                ${(g.rank_order && g.rating !== 'zanger') ? `<span class="tag">Tier rank #${escapeHtml(String(g.rank_order))}</span>` : (countSongsForDisplay(songs) > 0 && !g.rank_order && g.rating !== 'zanger' ? '<span class="tag tag-warn">No rank yet</span>' : '')}
                ${hasAltTake(g) ? '<span class="tag">Alt Take</span>' : ''}
                ${hasPending(g) ? '<span class="tag tag-pending">⏳ Pending</span>' : ''}
                ${songCount ? `<span class="tag">${songCount} song${songCount===1?'':'s'}</span>` : '<span class="tag">Needs songs</span>'}
              </div>
              ${g.favoritesong ? `<div class="small" style="margin-top:8px;">Favorite song: ${
                g.favoritesongurl
                  ? `<a href="${escapeHtml(g.favoritesongurl)}" target="_blank" rel="noopener noreferrer" style="color:var(--accent);font-weight:800;text-decoration:none;">${escapeHtml(g.favoritesong)} ↗</a>`
                  : escapeHtml(g.favoritesong)
              }</div>` : ''}
            </div>
            <div class="archive-card-right">
              <span class="small archive-card-date">${escapeHtml(dateValue(g) || 'No date')}</span>
              <button class="btn btn-primary archive-primary-action" data-open-id="${g.id}">Open / Edit</button>
              ${songCount ? `<label class="archive-select-genre"><input type="checkbox" data-archive-playlist-genre="${escapeHtml(String(g.id))}" ${archivePlaylistSelectedGenreIds.has(String(g.id)) ? 'checked' : ''} onchange="archivePlaylistSelectionChanged(this)" /> Playlist</label>` : ''}
              ${songCount ? `<button type="button" class="btn btn-ghost song-log-toggle" style="padding:5px 10px;font-size:.8rem;font-weight:900;white-space:nowrap;" onclick="toggleSongLog('sl-h-${g.id}')">▶ ${songCount} song${songCount===1?'':'s'} logged</button>` : ''}
            </div>
          </div>
          ${songCount ? `<div class="song-log-wrap" id="sl-h-${g.id}"><div class="song-log-list">${songs.map(song => renderSongEntry(song, false)).join('')}</div></div>` : ''}
        </div>`;
      }).join('');

      [...list.querySelectorAll('[data-open-id]')].forEach(btn => {
        btn.addEventListener('click', () => {
          const genre = genres.find(g => String(g.id) === btn.dataset.openId);
          if (genre) openGenreDetail(genre, false);
        });
      });
    }

    function archiveVisiblePlaylistGenreIds() {
      return (archiveCurrentItems || [])
        .filter(g => spotifyPlaylistSongRows(g).length > 0)
        .map(g => String(g.id));
    }

    function archiveUpdatePlaylistButtons() {
      const selectedCount = archivePlaylistSelectedGenreIds.size;
      const selectedBtn = document.getElementById('archivePlaylistSelectedBtn');
      if (selectedBtn) selectedBtn.textContent = selectedCount ? `＋ Playlist selected (${selectedCount})` : '＋ Playlist selected';
      const toggleBtn = document.getElementById('archivePlaylistToggleVisibleBtn');
      if (toggleBtn) {
        const visibleIds = archiveVisiblePlaylistGenreIds();
        const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => archivePlaylistSelectedGenreIds.has(id));
        toggleBtn.textContent = allVisibleSelected ? 'Clear visible playlist picks' : 'Select visible for playlist';
      }
    }

    function archivePlaylistSelectionChanged(box) {
      const id = String(box?.dataset?.archivePlaylistGenre || '');
      if (!id) return;
      if (box.checked) archivePlaylistSelectedGenreIds.add(id);
      else archivePlaylistSelectedGenreIds.delete(id);
      archiveUpdatePlaylistButtons();
    }

    function archiveToggleVisiblePlaylistSelection() {
      const visibleIds = archiveVisiblePlaylistGenreIds();
      if (!visibleIds.length) {
        showSaveToast('No visible archive entries have Spotify tracks.', true);
        return;
      }
      const allVisibleSelected = visibleIds.every(id => archivePlaylistSelectedGenreIds.has(id));
      visibleIds.forEach(id => {
        if (allVisibleSelected) archivePlaylistSelectedGenreIds.delete(id);
        else archivePlaylistSelectedGenreIds.add(id);
      });
      renderHistory();
      archiveUpdatePlaylistButtons();
    }

    async function openArchivePlaylistModal() {
      const selectedIds = [...archivePlaylistSelectedGenreIds];
      if (!selectedIds.length) {
        showSaveToast('Select at least one archive genre for the playlist.', true);
        return;
      }
      if (!(await spotifyEnsurePlaylistScopes({ reopenPlaylistGenreIds: selectedIds, returnScreen: 'history' }))) return;

      const selectedGenres = selectedIds
        .map(id => (genres || []).find(g => String(g.id) === String(id)))
        .filter(Boolean);
      const rows = spotifyPlaylistSongRowsForGenres(selectedGenres);
      if (!rows.length) {
        showSaveToast('The selected archive genres do not have Spotify track URLs.', true);
        return;
      }
      const dateStamp = new Date().toISOString().slice(0,10);
      spotifyOpenPlaylistModalWithRows({
        rows,
        sourceName: `${selectedGenres.length} selected archive genre${selectedGenres.length === 1 ? '' : 's'}`,
        playlistName: `Daily Genre — Backlog ${dateStamp}`,
        contextType: 'archive',
        genreIds: selectedGenres.map(g => String(g.id))
      });
    }

    function renderMonthly() {
      archiveView = 'monthly';
      document.querySelectorAll('.archive-view-btn').forEach(b => b.classList.toggle('active', b.dataset.archiveView === archiveView));
      renderHistory();
    }

    function populateMonthFilter() {
      const months = [...new Set(
        genres.filter(g => dateValue(g)).map(g => dateValue(g).slice(0,7))
      )].sort().reverse();

      const historyMonth = document.getElementById('historyMonthFilter');
      if (historyMonth) {
        historyMonth.innerHTML =
          `<option value="">All months</option>` +
          months.map(m => `<option value="${m}">${m}</option>`).join('');
      }
    }

    function genreAliasListForSearch(genre) {
      const values = [];
      const push = (value) => {
        if (Array.isArray(value)) value.forEach(push);
        else if (value && typeof value === 'object') Object.values(value).forEach(push);
        else if (value != null) String(value).split(/[\n;,|]+/).forEach(part => {
          const clean = part.trim();
          if (clean) values.push(clean);
        });
      };
      push(genre?.aliases);
      push(genre?.synonyms);
      push(genre?.aka);
      push(genre?.alsoKnownAs);
      push(genre?.also_known_as);

      // Small curated search bridges for common alternate spellings/names that
      // are not always present in the source JSON yet. Keep these search-only so
      // they do not rewrite the visible genre identity fields.
      const canonical = normalizeGenreSearchText(genre?.genre || '');
      if (canonical === 'hokkien pop') {
        push(['tai-pop', 'tai pop', 'taipop', 'taiwanese pop', 'taiwanese hokkien pop', 'taiwanese language pop']);
      }

      return [...new Set(values)];
    }

    function normalizeGenreSearchText(value) {
      return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    function genreSearchBlob(genre) {
      return [
        genre?.genre,
        categoryLine(genre),
        genre?.notes,
        genre?.favoritesong,
        genre?.favoritesongurl,
        songSearchText(genre),
        genreAliasListForSearch(genre).join(' ')
      ].join(' ');
    }

    function genreSearchRank(genre, query) {
      const rawQ = String(query || '').trim();
      const q = normalizeGenreSearchText(rawQ);
      if (!q) return 999;
      const name = normalizeGenreSearchText(genre?.genre || '');
      const aliases = genreAliasListForSearch(genre).map(normalizeGenreSearchText).filter(Boolean);
      const path = normalizeGenreSearchText(categoryLine(genre));
      if (name === q) return 0;
      if (aliases.includes(q)) return 1;
      // For one-word searches like "funk", keep the exact genre above
      // compound names like "free funk" even when the archive has another sort selected.
      if (name.split(' ').includes(q)) return 2;
      if (aliases.some(a => a.split(' ').includes(q))) return 3;
      if (name.startsWith(q)) return 4;
      if (aliases.some(a => a.startsWith(q))) return 5;
      if (name.includes(q)) return 6;
      if (aliases.some(a => a.includes(q))) return 7;
      if (path.includes(q)) return 8;
      return 9;
    }

    function searchGenresInto(inputEl, resultsEl) {
      if (!resultsEl) return;
      const rawQ = inputEl.value.trim();
      const q = normalizeGenreSearchText(rawQ);
      if (!q) {
        resultsEl.innerHTML = '';
        return;
      }

      const matches = (genres || [])
        .map(g => ({ g, rank: genreSearchRank(g, rawQ), blob: normalizeGenreSearchText(genreSearchBlob(g)) }))
        .filter(row => row.rank < 9 || row.blob.includes(q))
        .sort((a, b) => a.rank - b.rank || String(a.g.genre || '').localeCompare(String(b.g.genre || '')))
        .slice(0, 12);

      resultsEl.innerHTML = matches.map(({ g }) => {
        const aliasHit = genreAliasListForSearch(g).find(alias => normalizeGenreSearchText(alias).includes(q));
        return `
        <div class="list-item dc-manual-result-card" data-id="${g.id}" role="button" tabindex="0">
          <strong>${escapeHtml(g.genre || 'Unknown')}</strong>
          <div class="small">${escapeHtml(categoryLine(g))}${aliasHit ? ` · ${escapeHtml(aliasHit)}` : ''}</div>
        </div>
      `;
      }).join('');

      [...resultsEl.querySelectorAll('[data-id]')].forEach(btn => {
        const openPicked = () => {
          const picked = genres.find(g => String(g.id) === btn.dataset.id);
          if (!picked) return;
          openGenreDetail(picked, true);
        };
        btn.onclick = openPicked;
        btn.onkeydown = (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openPicked();
          }
        };
      });
    }

    function levenshtein(a, b) {
      const m = Array.from({length: b.length + 1}, (_, i) => [i]);
      for (let j = 0; j <= a.length; j++) m[0][j] = j;
      for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
          m[i][j] = b.charAt(i - 1) === a.charAt(j - 1)
            ? m[i - 1][j - 1]
            : Math.min(m[i - 1][j - 1] + 1, m[i][j - 1] + 1, m[i - 1][j] + 1);
        }
      }
      return m[b.length][a.length];
    }

    function applyRankSeed() {
      const byNorm = new Map();
      genres.forEach(g => {
        const key = normalizeName(g.genre || '');
        if (!byNorm.has(key)) byNorm.set(key, []);
        byNorm.get(key).push(g);
      });

      unmatchedSeeds = [];

      Object.entries(RANK_SEED).forEach(([seedName, seedData]) => {
        const exact = byNorm.get(normalizeName(seedName));
        if (exact && exact.length) {
          const target = exact[0];
          if (!target.rating || target.rating === '' || target.rating === 'zanger') target.rating = seedData.rating;
          if (!target.rank_order) target.rank_order = seedData.rank_order;
          if ((target.status || '').toLowerCase() === 'unlistened') target.status = 'listened';
          return;
        }

        let best = null;
        let bestScore = Infinity;
        for (const g of genres) {
          const dist = levenshtein(normalizeName(seedName), normalizeName(g.genre || ''));
          if (dist < bestScore) {
            bestScore = dist;
            best = g;
          }
        }

        if (best && bestScore <= 4) {
          if (!best.rating || best.rating === '' || best.rating === 'zanger') best.rating = seedData.rating;
          if (!best.rank_order) best.rank_order = seedData.rank_order;
          if ((best.status || '').toLowerCase() === 'unlistened') best.status = 'listened';
        } else {
          unmatchedSeeds.push(seedName);
        }
      });

      [1,2,3,4,5].forEach(ensureRankOrderForRating);
    }


    function decodeBase64Utf8(value='') {
      const clean = String(value || '').replace(/\s/g, '');
      const binary = atob(clean);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
      return new TextDecoder().decode(bytes);
    }

    async function fetchProductionDataFallback() {
      try {
        const apiRes = await fetch(DATA_API_URL, { cache: 'no-store' });
        const meta = await apiRes.json().catch(() => ({}));
        if (apiRes.ok && meta && meta.content) {
          const parsed = JSON.parse(decodeBase64Utf8(meta.content));
          if (Array.isArray(parsed)) return { data: parsed, sha: meta.sha || '', source: 'github-api' };
        }
      } catch (apiError) {
        console.warn('GitHub contents fallback failed', apiError);
      }

      try {
        const rawRes = await fetch(DATA_URL, { cache: 'no-store' });
        const parsed = await rawRes.json().catch(() => null);
        if (rawRes.ok && Array.isArray(parsed)) return { data: parsed, sha: '', source: 'raw-json' };
      } catch (rawError) {
        console.warn('Raw JSON fallback failed', rawError);
      }

      return null;
    }

function spotifyRestoreReturnAfterDataLoad() {
  const state = spotifyReturnStateAfterCallback;
  if (!state) {
    // Never auto-resume a stored playlist intent during ordinary page load.
    // Stale stored intents after a canceled/failed Spotify auth can otherwise re-open the
    // playlist modal, which immediately starts auth again and creates an auth loop.
    spotifyClearReturnState();
    return;
  }
  if (!spotifySession?.access_token) {
    spotifyClearReturnState();
    spotifyReturnStateAfterCallback = null;
    return;
  }

  let restoredGenre = false;
  if (state.hash && /^#genre=/.test(state.hash)) {
    const id = decodeURIComponent(state.hash.replace(/^#genre=/, ''));
    const genre = (genres || []).find(g => String(g.id) === String(id));
    if (genre) restoredGenre = openGenreDetail(genre, false, { force: true }) !== false;
  } else if (state.screen && state.screen !== 'spin') {
    switchScreen(state.screen, { force: true });
  }

  if (Array.isArray(state.reopenPlaylistGenreIds) && state.reopenPlaylistGenreIds.length) {
    archivePlaylistSelectedGenreIds = new Set(state.reopenPlaylistGenreIds.map(String));
    if (!restoredGenre) switchScreen('history', { force: true });
    renderHistory();
    showSaveToast('Spotify connected. Click Playlist selected again when you are ready.', false);
  } else if (state.reopenPlaylistGenreId) {
    showSaveToast('Spotify connected. Click Playlist again when you are ready.', false);
  }

  spotifyClearReturnState();
  spotifyReturnStateAfterCallback = null;
}

async function loadData() {
  remainingCount.textContent = 'Loading genres...';

  let workerLoaded = null;
  let githubLoaded = null;
  let loaded = null;

  try {
    const res = await fetch(WORKER_URL, { method: 'GET', cache: 'no-store' });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok && Array.isArray(data.data)) {
      workerLoaded = { data: data.data, sha: data.sha || '', source: 'worker' };
    } else {
      console.warn('Production Worker data load did not return the expected shape; checking GitHub JSON.', data);
    }
  } catch (workerError) {
    console.warn('Production Worker data load failed; checking GitHub JSON.', workerError);
  }

  // Always check GitHub too. The Worker can return a valid-but-stale snapshot;
  // if that happens, the app would otherwise silently miss newly added genres.
  githubLoaded = await fetchProductionDataFallback();

  function uniqueGenreCount(rows) {
    return new Set((rows || []).map(g => String(g && g.id != null ? g.id : (g && g.genre) || ''))).size;
  }

  function maxGenreId(rows) {
    return (rows || []).reduce((max, g) => {
      const id = Number(g && g.id);
      return Number.isFinite(id) ? Math.max(max, id) : max;
    }, -1);
  }

  const workerCount = uniqueGenreCount(workerLoaded && workerLoaded.data);
  const githubCount = uniqueGenreCount(githubLoaded && githubLoaded.data);
  const workerMaxId = maxGenreId(workerLoaded && workerLoaded.data);
  const githubMaxId = maxGenreId(githubLoaded && githubLoaded.data);

  if (githubLoaded && githubCount > workerCount) {
    loaded = githubLoaded;
    console.warn('[Daily Genre] Worker data appears stale; using newer GitHub data instead.', {
      workerCount,
      githubCount,
      workerMaxId,
      githubMaxId,
      workerSha: workerLoaded && workerLoaded.sha,
      githubSha: githubLoaded.sha
    });
    showSaveToast(`Loaded ${githubCount} genres from GitHub; Worker only returned ${workerCount}.`, false);
  } else {
    loaded = workerLoaded || githubLoaded;
  }

  if (!loaded || !Array.isArray(loaded.data)) {
    remainingCount.textContent = 'Could not load production data.';
    showSaveToast('Could not load production data from the Worker or GitHub JSON.', true);
    return;
  }

  genres = loaded.data;
  serverFileSha = loaded.sha || '';
  window.genres = genres;
  window.dailyGenreDataSource = {
    source: loaded.source,
    loadedCount: uniqueGenreCount(loaded.data),
    loadedMaxId: maxGenreId(loaded.data),
    workerCount,
    workerMaxId,
    githubCount,
    githubMaxId,
    workerSha: workerLoaded && workerLoaded.sha,
    githubSha: githubLoaded && githubLoaded.sha
  };
  console.info('[Daily Genre] Data source selected', window.dailyGenreDataSource);

  genres.forEach(g => {
    if (!Array.isArray(g.songs_listened)) g.songs_listened = g.songs_listened ? [].concat(g.songs_listened) : [];
    if (!Array.isArray(g.pending_songs)) g.pending_songs = g.pending_songs ? [].concat(g.pending_songs) : [];
  });

  warnDuplicateGenresOnLoad();

  genres.forEach(g => {
    g.songs_listened = inflateSongsFromStorage(g.songs_listened);
    g.pending_songs = normalizePendingSongs(g.pending_songs);
    removeLoggedSongsFromPending(g);
  });

  repairExistingPendingSources();

  updateRemainingCount();
  buildSpinnerPool();
  populateMonthFilter();
  renderHistory();
  renderRankings();

  const hashMatch = location.hash.match(/^#genre=(.+)$/);
  if (hashMatch) {
    const id = decodeURIComponent(hashMatch[1]);
    const genre = genres.find(g => String(g.id) === String(id));
    if (genre) openGenreDetail(genre, false);
  }
  spotifyRestoreReturnAfterDataLoad();
}
    window.addEventListener('beforeunload', (event) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = '';
    });

    document.querySelectorAll('.tab-btn[data-screen]').forEach(btn => {
      btn.addEventListener('click', () => switchScreen(btn.dataset.screen));
    });

    spinBtn.addEventListener('click', spinWheel);
    document.getElementById('topCrateDigBtn')?.addEventListener('click', openCrateDig);
    manualToggleBtn.addEventListener('click', () => manualPanel.classList.toggle('hidden'));
    remainingCount?.addEventListener('click', showRemainingCountAudit);

    const manualSearch2 = document.getElementById('manualSearch2');
    const manualResults2 = document.getElementById('manualResults2');

    if (manualSearch2) {
      let manualSearchTimer = null;
      manualSearch2.addEventListener('input', () => {
        clearTimeout(manualSearchTimer);
        const val = manualSearch2.value.trim();
        if (val.length === 0) { searchGenresInto(manualSearch2, manualResults2); return; }
        if (val.length < 3) return;
        manualSearchTimer = setTimeout(() => searchGenresInto(manualSearch2, manualResults2), 300);
      });
      manualSearch2.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { clearTimeout(manualSearchTimer); searchGenresInto(manualSearch2, manualResults2); }
      });
    }
    document.getElementById('includeSongsToggle').addEventListener('change', updateDiscordBlock);
    document.getElementById('shareToggle')?.addEventListener('click', () => document.getElementById('shareSection')?.classList.toggle('collapsed'));
    document.getElementById('favoriteSongUrl').addEventListener('change', function() {
      const url = this.value.trim();
      const statusEl = document.getElementById('favoriteSongFetchStatus');
      if (!url) { statusEl.textContent = ''; refreshDirtyFromSnapshot(); return; }
      if (!url.includes('spotify.com/track/')) {
        statusEl.textContent = 'Paste a Spotify track URL.';
        refreshDirtyFromSnapshot();
        return;
      }
      statusEl.textContent = 'Spotify auto-fill disabled here; URL will still save.';
      refreshDirtyFromSnapshot();
    });

    document.getElementById('copyDiscordBtn').addEventListener('click', async () => {
      await navigator.clipboard.writeText(document.getElementById('discordBlock').value);
    });
    document.getElementById('saveBtn').addEventListener('click', async () => {
      if (typeof setLibrarySaveBusy === 'function') setLibrarySaveBusy(true);
      try {
        await prepareAndSaveCurrentGenre();
      } finally {
        if (typeof setLibrarySaveBusy === 'function') setLibrarySaveBusy(false);
      }
    });
    document.getElementById('markListenedBtn')?.addEventListener('click', markCurrentGenreListened);
    document.getElementById('unlistenBtn')?.addEventListener('click', unlistenCurrentGenre);
    document.getElementById('clearPendingBtn')?.addEventListener('click', clearPendingSongs);
    document.addEventListener('click', (event) => {
      const btn = event.target.closest('#reexaminePendingBtn');
      if (btn) reexaminePendingTags();
    });
    ['favoriteSong','favoriteSongUrl','songsListenedBulk','notes'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', markDirty);
    });
    ['monthlyContender','monthFavorite','monthLeastFavorite'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', markDirty);
    });


    document.getElementById('zangerBtn').addEventListener('click', () => {
      if (currentGenre) markAsZangerToday(currentGenre);
    });

    const historyMonthFilter = document.getElementById('historyMonthFilter');
    const historyRatingFilter = document.getElementById('historyRatingFilter');
    const archiveSearchInput = document.getElementById('archiveSearchInput');
    const archiveFlagFilter = document.getElementById('archiveFlagFilter');
    const archiveSortFilter = document.getElementById('archiveSortFilter');
    const archiveCopyBtn = document.getElementById('archiveCopyBtn');
    const archivePlaylistToggleVisibleBtn = document.getElementById('archivePlaylistToggleVisibleBtn');
    const archivePlaylistSelectedBtn = document.getElementById('archivePlaylistSelectedBtn');

    if (historyMonthFilter) historyMonthFilter.addEventListener('change', renderHistory);
    if (historyRatingFilter) historyRatingFilter.addEventListener('change', renderHistory);
        if (archiveSearchInput) {
      let archiveSearchTimer = null;
      archiveSearchInput.addEventListener('input', () => {
        clearTimeout(archiveSearchTimer);
        const val = archiveSearchInput.value.trim();
        if (val.length === 0) { renderHistory(); return; }
        if (val.length < 3) return;
        archiveSearchTimer = setTimeout(renderHistory, 300);
      });
      archiveSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { clearTimeout(archiveSearchTimer); renderHistory(); }
      });
    }
    if (archiveFlagFilter) archiveFlagFilter.addEventListener('change', renderHistory);
    if (archiveSortFilter) archiveSortFilter.addEventListener('change', renderHistory);
    if (archivePlaylistToggleVisibleBtn) archivePlaylistToggleVisibleBtn.addEventListener('click', archiveToggleVisiblePlaylistSelection);
    if (archivePlaylistSelectedBtn) archivePlaylistSelectedBtn.addEventListener('click', openArchivePlaylistModal);

    document.querySelectorAll('.archive-view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        archiveView = btn.dataset.archiveView || 'all';
        document.querySelectorAll('.archive-view-btn').forEach(b => b.classList.toggle('active', b === btn));
        renderHistory();
      });
    });

    if (archiveCopyBtn) {
      archiveCopyBtn.addEventListener('click', async () => {
        const items = window._archiveItems || [];
        if (!items.length) return;
        const lines = items.map(g => `${dateValue(g) || 'No date'}: ${g.genre || 'Unknown'}${g.rating ? ` (${g.rating}★)` : ''}`);
        await navigator.clipboard.writeText(lines.join('\n'));
        const old = archiveCopyBtn.textContent;
        archiveCopyBtn.textContent = 'Copied!';
        setTimeout(() => { archiveCopyBtn.textContent = old; }, 2000);
      });
    }

    passwordSubmitBtn.addEventListener('click', async () => {
      const pw = passwordInput.value.trim();
      if (!pw) {
        passwordNotice.textContent = 'Enter the password.';
        return;
      }
    const oldSubmitText = passwordSubmitBtn.textContent;
    passwordSubmitBtn.disabled = true;
    passwordSubmitBtn.classList.add('is-saving');
    passwordSubmitBtn.textContent = 'Saving…';
    passwordNotice.textContent = 'Saving to GitHub…';
      try {
        const completedAction = pendingSaveAction;
        await doSaveWithPassword(pw);
        appPassword = pw;
        closePasswordModal();
        pendingSaveAction = completedAction;
        updateRemainingCount();
        populateMonthFilter();
        renderHistory();
        renderRankings();
        if (pendingSaveAction === 'library_save') {
          libraryUpdatesPending = false;
          stagedQueueReactionKeys.clear();
          toggleLibrarySaveButton(false);
          setUnsavedState(false);
          renderVisuals();
          if (currentGenre && document.getElementById('screen-listen')?.classList.contains('active')) {
            loadListenScreen(currentGenre, { preserveDirty: false, skipSpotifyHydration: true });
            applyDetailEditMode(detailEditMode);
            resetListenDirtySnapshot();
          }
          const status = document.getElementById('vizRefreshStatus');
          if (status) status.textContent = 'Library updates saved.';
          showSaveToast('Library updates saved.', false);
        } else {
          loadListenScreen(currentGenre, { preserveDirty: false });
          lastSavedListenSnapshot = buildListenSnapshot();
          setUnsavedState(false);
          showSaveToast(pendingSaveAction === 'mark_listened' ? `Saved. ${currentGenre.genre || 'Genre'} marked as listened today.` : `Saved changes to ${currentGenre.genre || 'genre'}.`, false);
        }
        pendingSaveAction = null;
      } catch (e) {
        if (e && (e.code === 'STALE_DATA' || e.code === 'NO_REVISION')) {
          passwordNotice.textContent = 'Newer saved data exists. Reload this development page before saving so it is not overwritten.';
          showSaveToast('Newer data exists elsewhere — reload before saving.', true);
          return;
        }
        if (e && e.code === 'AUTH_FAILED') {
          passwordNotice.textContent = 'That password did not work.';
          return;
        }
        passwordNotice.textContent = `Save failed: ${e?.message || 'Unknown Worker error.'}`;
        showSaveToast(passwordNotice.textContent, true);
      }
        finally {
        passwordSubmitBtn.disabled = false;
        passwordSubmitBtn.classList.remove('is-saving');
        passwordSubmitBtn.textContent = oldSubmitText || 'Save now';
    }
    });

    passwordCancelBtn.addEventListener('click', closePasswordModal);

    passwordInput.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') passwordSubmitBtn.click();
    });

    passwordModal.addEventListener('click', (e) => {
      if (e.target === passwordModal) closePasswordModal();
    });

    // App boot is intentionally run after every helper and Spotify function is declared.
    // Running it here used to call Spotify/session helpers before they existed, which stopped data loading.

        // ── Visualization helpers ─────────────────────────────────────────
    let _vizCharts = {};
    let _vizMode = 'monthly';

    function vizDestroyAll() {
      Object.values(_vizCharts).forEach(c => { try { c.destroy(); } catch(e) {} });
      _vizCharts = {};
    }
    function vizMonths() {
      return [...new Set((genres || []).map(g => dateValue(g)).filter(Boolean).map(d => d.slice(0,7)))].sort();
    }
    function vizMode() { return _vizMode || 'monthly'; }

    function applyVizModeDisplay() {
      const mode = vizMode() === 'alltime' ? 'alltime' : 'monthly';
      const screen = document.getElementById('screen-viz');
      if (screen) {
        screen.classList.toggle('viz-mode-monthly', mode === 'monthly');
        screen.classList.toggle('viz-mode-alltime', mode === 'alltime');
      }
      document.querySelectorAll('[data-viz-mode]').forEach(btn => {
        btn.classList.toggle('active', (btn.dataset.vizMode || 'monthly') === mode);
      });
      const monthSel = document.getElementById('vizMonthSelect');
      if (monthSel) monthSel.style.display = mode === 'monthly' ? '' : 'none';
      const monthlyView = document.getElementById('vizViewMonthly');
      const alltimeView = document.getElementById('vizViewAlltime');
      if (monthlyView) monthlyView.style.setProperty('display', mode === 'monthly' ? 'grid' : 'none', 'important');
      if (alltimeView) alltimeView.style.setProperty('display', mode === 'alltime' ? 'grid' : 'none', 'important');
    }

    function setVizMode(mode) {
      _vizMode = mode === 'alltime' ? 'alltime' : 'monthly';
      clearVisualDrilldown(false);
      applyVizModeDisplay();
      renderVisuals();
    }
    function vizSelectedMonth() {
      const sel = document.getElementById('vizMonthSelect');
      const months = vizMonths();
      if (!months.length) return '';
      if (sel && sel.value) return sel.value;
      return months[months.length - 1];
    }
    function spotifyHref(song) {
      return normalizeSongUrl(song?.spotifyUrl || song?.url || '');
    }

    function songDisplayName(song) {
      return cleanPastedCitationArtifacts((song?.artist ? `${song.artist} — ` : '') + (song?.title || 'Untitled track'));
    }

    function vizSongTitleLink(song) {
      const href = spotifyHref(song);
      const label = escapeHtml(songDisplayName(song));
      return href
        ? `<a class="viz-song-link" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`
        : `<span>${label}</span>`;
    }

    function songEffectiveYear(song) {
      const eraYear = Number(String(song?.eraYear || '').match(/\d{4}/)?.[0] || 0) || null;
      if (eraYear) return { year: eraYear, source: 'Era override' };
      const eraDecade = String(song?.eraDecade || '').match(/(\d{3})0s?/);
      if (eraDecade) return { year: Number(`${eraDecade[1]}0`), source: 'Era override' };
      const releaseYear = Number(song?.releaseYear || 0) || null;
      return releaseYear ? { year: releaseYear, source: song?.releaseSource || 'Spotify' } : { year: null, source: '' };
    }

    function songDecadeLabel(song) {
      const effective = songEffectiveYear(song);
      return effective.year ? `${Math.floor(effective.year / 10) * 10}s` : 'Unknown';
    }

    function genreMatchesFocus(genre) {
      return !vizFocusedGenreId || String(genre?.id) === String(vizFocusedGenreId);
    }

    function vizFocusedGenre() {
      return (genres || []).find(g => String(g.id) === String(vizFocusedGenreId)) || null;
    }

    function vizFilteredItems(items) {
      return (items || []).filter(genreMatchesFocus);
    }

    function renderVisualFilters() {
      const mount = document.getElementById('vizFilterMount');
      if (!mount) return;
      const listened = allListenedGenresForMaintenance().slice().sort((a,b) => String(a.genre || '').localeCompare(String(b.genre || '')));
      mount.innerHTML = `<div class="viz-filter-row">
        <div class="viz-filter-control">
          <label for="vizGenreFocusSelect">Genre focus</label>
          <select id="vizGenreFocusSelect">
            <option value="">All genres</option>
            ${listened.map(g => `<option value="${escapeHtml(String(g.id))}" ${String(g.id) === String(vizFocusedGenreId) ? 'selected' : ''}>${escapeHtml(g.genre || 'Unknown')}</option>`).join('')}
          </select>
        </div>
        <button type="button" class="btn btn-secondary btn-tiny" onclick="clearVisualDrilldown()">Clear drilldown</button>
      </div>`;
      document.getElementById('vizGenreFocusSelect')?.addEventListener('change', event => {
        vizFocusedGenreId = event.target.value || '';
        vizDrilldownState = null;
        renderVisuals();
      });
    }

    function renderFocusBanner() {
      const mount = document.getElementById('vizFocusBanner');
      if (!mount) return;
      const focused = vizFocusedGenre();
      if (!focused) { mount.innerHTML = ''; return; }
      const counts = genreReactionCounts(focused);
      const songs = genreReactionSongs(focused);
      mount.innerHTML = `<div class="viz-focus-banner"><div><div class="viz-focus-title">${escapeHtml(focused.genre || 'Focused genre')}</div><div class="small">${songs.length} track${songs.length === 1 ? '' : 's'} · 👍 ${counts[3]} · 🤷 ${counts[2]} · 👎 ${counts[1]} · — ${counts.unrated}</div></div><button type="button" class="btn btn-secondary btn-tiny" onclick="openGenreDetail(vizFocusedGenre(), false)">Open Genre</button></div>`;
    }

    function showMoreVizQueue(queue) {
      vizQueueLimits[queue] = (vizQueueLimits[queue] || 8) + 8;
      renderVisuals();
    }

    function clearVisualDrilldown(rerender=true) {
      vizDrilldownState = null;
      if (rerender) renderVisuals();
    }


    function setVisualDrilldown(type, value, mode='alltime') {
      const nextMode = mode || vizMode();
      if (nextMode && nextMode !== vizMode()) {
        _vizMode = nextMode;
        document.querySelectorAll('[data-viz-mode]').forEach(b => b.classList.toggle('active', (b.dataset.vizMode || 'monthly') === _vizMode));
        const monthSel = document.getElementById('vizMonthSelect');
        if (monthSel) monthSel.style.display = _vizMode === 'monthly' ? '' : 'none';
      }
      vizDrilldownState = { type, value, mode: nextMode };
      renderVisuals();
      setTimeout(() => {
        const target = document.getElementById(visualDrilldownMountId(vizDrilldownState));
        (target?.closest('.viz-card') || target)?.scrollIntoView({ behavior:'smooth', block:'start' });
      }, 30);
    }

    function vizRowsForCurrentScope() {
      const mode = vizDrilldownState?.mode || vizMode();
      return mode === 'monthly' ? vizFilteredItems(vizBaseGenres()) : vizFilteredItems(allListenedGenresForMaintenance());
    }

    function findGenreSongByKey(genreId, key) {
      const genre = (genres || []).find(g => String(g.id) === String(genreId));
      if (!genre) return null;
      const songs = inflateSongsFromStorage(genre.songs_listened || []);
      let found = null;
      eachSongInLog(songs, song => { if (!found && songIdentity(song) === key) found = song; });
      return found ? { genre, songs, song: found } : null;
    }

    function saveEraOverride(encodedGenreId, encodedKey, inputId) {
      const genreId = decodeURIComponent(String(encodedGenreId || ''));
      const key = decodeURIComponent(String(encodedKey || ''));
      const value = cleanPastedCitationArtifacts(document.getElementById(inputId)?.value || '');
      const target = findGenreSongByKey(genreId, key);
      if (!target) { showSaveToast('Could not find that song for era override.', true); return; }
      const decade = value.match(/^(\d{3})0s?$/i);
      const year = value.match(/^(\d{4})$/);
      if (!year && !decade && value) { showSaveToast('Use a year like 1953 or a decade like 1950s.', true); return; }
      target.song.eraYear = year ? year[1] : '';
      target.song.eraDecade = decade ? `${decade[1]}0s` : '';
      target.genre.songs_listened = target.songs;
      libraryUpdatesPending = true;
      setUnsavedState(true);
      toggleLibrarySaveButton(true);
      const restore = preserveScrollSnapshot();
      renderVisuals();
      restore();
      showSaveToast('Era override updated — click Save Library Updates to persist it.', false);
    }

    function visualDrilldownMountId(state=vizDrilldownState) {
      if (!state) return 'vizDrilldownPanel';
      const suffix = state.mode === 'monthly' ? 'Monthly' : 'All';
      if (state.type === 'decade') return `vizDecadeDrilldown${suffix}`;
      if (state.type === 'reaction') return `vizReactionDrilldown${suffix}`;
      return 'vizDrilldownPanel';
    }

    function clearVisualDrilldownMounts() {
      ['vizDrilldownPanel','vizDecadeDrilldownMonthly','vizDecadeDrilldownAll','vizReactionDrilldownMonthly','vizReactionDrilldownAll'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '';
      });
      document.querySelectorAll('#screen-viz .viz-card-selected').forEach(el => el.classList.remove('viz-card-selected'));
      document.querySelectorAll('#screen-viz .viz-card-with-local-drilldown').forEach(el => el.classList.remove('viz-card-with-local-drilldown'));
    }

    function vizAllRowsForItems(items) {
      return (items || []).flatMap(genre => vizOfficialSongs(genre).map(song => ({ genre, song })));
    }

    function visualHealthStats(items) {
      const songs = vizAllOfficialSongs(items || []);
      const reactions = vizReactionCountSummary(songs);
      const rated = reactions[1] + reactions[2] + reactions[3];
      const liked = reactions[3];
      const metadataRows = collectMetadataRows(items || []);
      return {
        songs,
        reactions,
        rated,
        liked,
        likeRate: rated ? Math.round((liked / rated) * 100) : 0,
        ratedPct: songs.length ? Math.round((rated / songs.length) * 100) : 0,
        missingMetadata: metadataRows.length,
        brokenLinks: metadataRows.filter(row => row.group === 'broken').length,
        unrated: reactions.unrated
      };
    }

    function vizSourceLabel(song) {
      if (song?.isAdd) return 'ADD';
      if (song?.isLevelUp || song?.levelUpFor) return 'LEVEL UP';
      if (song?.promotedFrom) return `Promoted from ${song.promotedFrom}`;
      return 'Logged';
    }

    function vizDrilldownRowsForState(items, state) {
      let title = '';
      let rows = [];
      let explainer = '';
      if (state.type === 'decade') {
        title = `Songs in the ${state.value}`;
        rows = vizAllRowsForItems(items).filter(row => songDecadeLabel(row.song) === state.value);
        explainer = 'Uses effective era year first, then Spotify release year when no override exists.';
      } else if (state.type === 'reaction') {
        title = `${reactionEmoji(state.value)} ${reactionLabel(state.value)} songs`;
        rows = vizAllRowsForItems(items).filter(row => Number(state.value) ? Number(row.song.reaction) === Number(state.value) : ![1,2,3].includes(Number(row.song.reaction)));
        explainer = 'Shows the tracks behind the selected reaction bucket, separate from theme-fit score.';
      }
      rows.sort((a,b) => String(a.genre.genre || '').localeCompare(String(b.genre.genre || '')) || String(songDisplayName(a.song)).localeCompare(String(songDisplayName(b.song))));
      return { title, rows, explainer };
    }

    function renderVisualDrilldown() {
      clearVisualDrilldownMounts();
      if (!vizDrilldownState) return;
      const mount = document.getElementById(visualDrilldownMountId(vizDrilldownState));
      if (!mount) return;
      const activeCard = mount.closest('.viz-card');
      activeCard?.classList.add('viz-card-selected');
      activeCard?.classList.add('viz-card-with-local-drilldown');
      const items = vizRowsForCurrentScope();
      const { title, rows:allRows, explainer } = vizDrilldownRowsForState(items, vizDrilldownState);
      const totalRows = allRows.length;
      const rows = allRows.slice(0, 60);
      const modeLabel = vizDrilldownState.mode === 'monthly' ? `Monthly · ${vizMonthTitle(vizSelectedMonth())}` : 'All time';
      const focus = vizFocusedGenre();
      const focusLabel = focus ? focus.genre : 'All genres';
      const rated = rows.filter(row => [1,2,3].includes(Number(row.song.reaction))).length;
      const avgFit = rows.filter(row => Number(row.song.score)).length
        ? (rows.reduce((sum,row) => sum + (Number(row.song.score || 0) || 0), 0) / rows.filter(row => Number(row.song.score)).length).toFixed(1)
        : '—';
      mount.innerHTML = `<div class="viz-drilldown is-active"><div class="viz-drilldown-head"><div><div class="eyebrow" style="margin:0;">Selected crate · ${escapeHtml(modeLabel)}</div><strong>${escapeHtml(title)}</strong><div class="small">${totalRows} matching track${totalRows === 1 ? '' : 's'}${totalRows > rows.length ? ` · showing first ${rows.length} in a scrollable crate` : ''}</div><div class="viz-drill-context"><span>Focus: ${escapeHtml(focusLabel)}</span><span>Rated here: ${rated}/${rows.length}</span><span>Avg fit: ${escapeHtml(avgFit)}</span></div><div class="viz-drill-explain">${escapeHtml(explainer)}</div></div><button type="button" class="btn btn-secondary btn-tiny" onclick="clearVisualDrilldown()">Close</button></div>${rows.length ? `<div class="viz-drilldown-list">${rows.map((row, idx) => {
        const effective = songEffectiveYear(row.song);
        const inputId = `eraOverride_${idx}_${String(row.genre.id).replace(/[^a-zA-Z0-9]/g,'')}`;
        const savedEra = row.song.eraYear || row.song.eraDecade || '';
        const reaction = Number(row.song.reaction || 0);
        const fit = Number(row.song.score || 0) || null;
        const art = row.song.artwork ? `<img class="viz-drill-art" src="${escapeHtml(row.song.artwork)}" alt="" loading="lazy">` : '<div class="viz-drill-art"></div>';
        const eraLine = effective.year ? `${effective.source}: ${effective.year}` : 'No year';
        const spotifyLine = row.song.releaseYear && (effective.source !== 'Spotify' || savedEra) ? ` · Spotify: ${row.song.releaseYear}` : '';
        return `<div class="viz-drill-row viz-record-row">${art}<div><div class="viz-drill-title-line">${vizSongTitleLink(row.song)}</div><div class="viz-drill-meta">${escapeHtml(row.genre.genre || 'Unknown genre')} · ${reactionEmoji(reaction)} ${escapeHtml(reactionLabel(reaction))}${fit ? ` · Fit ${fit}/5` : ''} · ${escapeHtml(vizSourceLabel(row.song))}</div><div class="viz-drill-meta">${escapeHtml(eraLine)}${escapeHtml(spotifyLine)}</div></div><div class="viz-drill-actions"><button type="button" onclick="vizOpenGenreEncoded('${visualActionArg(row.genre.genre || '')}')">Open Genre</button>${spotifyHref(row.song) ? `<button type="button" onclick="window.open('${escapeHtml(spotifyHref(row.song))}', '_blank', 'noopener')">Spotify</button>` : ''}</div></div>`;
      }).join('')}</div>` : '<div class="viz-empty">No songs found for this drilldown.</div>'}</div>`;
    }

    function renderGenreDossier(items) {
      const mount = document.getElementById('vizGenreDossier');
      if (!mount) return;
      const focused = vizFocusedGenre();
      if (!focused) { mount.innerHTML = ''; return; }
      const songs = vizOfficialSongs(focused);
      const counts = vizReactionCountSummary(songs);
      const rated = counts[1] + counts[2] + counts[3];
      const likeRate = rated ? Math.round((counts[3] / rated) * 100) : 0;
      const fitSongs = songs.filter(song => Number(song.score));
      const avgFit = fitSongs.length ? (fitSongs.reduce((sum,song) => sum + Number(song.score || 0), 0) / fitSongs.length).toFixed(1) : '—';
      const strongFit = songs.filter(song => Number(song.score || 0) >= 4).length;
      const artists = [...new Set(songs.map(song => cleanPastedCitationArtifacts(song.artist || '')).filter(Boolean))];
      const decades = vizSongDecadeStats([focused]);
      const decadeLabels = Object.keys(decades.counts).sort((a,b) => decades.counts[b] - decades.counts[a]);
      const favorite = focused.favoritesong ? `${focused.favoriteartist ? `${focused.favoriteartist} — ` : ''}${focused.favoritesong}` : 'No favorite set';
      const playlistCandidates = songs.filter(song => Number(song.reaction) === 3 || Number(song.score || 0) >= 4).length;
      mount.innerHTML = `<div class="viz-dossier"><div class="viz-dossier-head"><div><div class="eyebrow" style="margin:0;">Genre dossier</div><h3 class="viz-dossier-title">${escapeHtml(focused.genre || 'Focused genre')}</h3><div class="small">A focused listening profile: taste, fit, era spread, and playlist readiness.</div></div><button type="button" class="btn btn-secondary btn-tiny" onclick="openGenreDetail(vizFocusedGenre(), false)">Open Genre</button></div><div class="viz-dossier-grid"><div class="viz-dossier-card"><div class="viz-dossier-label">Favorite track</div><div class="viz-dossier-value">${escapeHtml(favorite)}</div></div><div class="viz-dossier-card"><div class="viz-dossier-label">Reaction split</div><div class="viz-dossier-value">👍 ${counts[3]} · 🤷 ${counts[2]} · 👎 ${counts[1]}</div><div class="viz-dossier-sub">${likeRate}% like rate across rated tracks</div></div><div class="viz-dossier-card"><div class="viz-dossier-label">Theme fit</div><div class="viz-dossier-value">${escapeHtml(avgFit)} avg · ${strongFit} strong</div><div class="viz-dossier-sub">Strong = fit 4–5</div></div><div class="viz-dossier-card"><div class="viz-dossier-label">Artists</div><div class="viz-dossier-value">${artists.length}</div><div class="viz-dossier-sub">${escapeHtml(artists.slice(0,3).join(' · ') || 'No artist metadata')}</div></div><div class="viz-dossier-card"><div class="viz-dossier-label">Era spread</div><div class="viz-dossier-value">${escapeHtml(decadeLabels.slice(0,3).join(' · ') || 'Unknown')}</div><div class="viz-dossier-sub">${decades.overrides || 0} era override${decades.overrides === 1 ? '' : 's'} · ${decades.unknown || 0} unknown</div></div><div class="viz-dossier-card"><div class="viz-dossier-label">Playlist candidates</div><div class="viz-dossier-value">${playlistCandidates}</div><div class="viz-dossier-sub">👍 tracks plus strong theme fits</div></div></div></div>`;
    }

    function vizBaseGenres() {
      const all = (genres || []).filter(g => ['listened','veto'].includes((g.status || '').toLowerCase()) && dateValue(g));
      if (vizMode() === 'alltime') return all;
      const month = vizSelectedMonth();
      return all.filter(g => (dateValue(g) || '').startsWith(month));
    }
    function vizOfficialSongs(genre) { return inflateSongsFromStorage(genre?.songs_listened || []).filter(s => !s.isPending).flatMap(s => s.levelUp ? [s, s.levelUp] : [s]); }
    function vizAllOfficialSongs(items) { return items.flatMap(vizOfficialSongs); }
    function vizMonthTitle(month) {
      if (!month) return 'No month selected';
      const [y, m] = month.split('-').map(Number);
      try { return new Date(y, m - 1, 1).toLocaleString(undefined, { month:'long', year:'numeric' }); }
      catch(e) { return month; }
    }
    function vizNumericRating(g) {
      if (!g) return 0;
      if (String(g.rating || '') === 'zanger') return 0;
      return Number(g.rating || 0);
    }
    function vizCategoryRoot(g) {
      const raw = categoryLine(g) || 'Uncategorized';
      return raw.split(/[/>|]/).map(x => String(x || '').trim()).filter(Boolean)[0] || raw || 'Uncategorized';
    }
    function vizSongDecadeStats(items) {
      const counts = {};
      let known = 0;
      let unknown = 0;
      let overrides = 0;
      vizAllOfficialSongs(items).forEach(song => {
        const effective = songEffectiveYear(song);
        const year = effective.year;
        if (!Number.isInteger(year) || year < 1800 || year > 2200) {
          unknown += 1;
          return;
        }
        if (song.eraYear || song.eraDecade) overrides += 1;
        const decade = `${Math.floor(year / 10) * 10}s`;
        counts[decade] = (counts[decade] || 0) + 1;
        known += 1;
      });
      return { counts, known, unknown, overrides };
    }

    function vizArtists(items) {
      const names = new Set();
      let songsWithArtists = 0;
      items.forEach(g => {
        vizOfficialSongs(g).forEach(s => {
          const a = String(s.artist || '').trim();
          if (a) {
            songsWithArtists += 1;
            a.split(/,|&| feat\.? | featuring /i).map(x => x.trim()).filter(Boolean).forEach(n => names.add(n));
          }
        });
        const fa = String(g.favoriteartist || '').trim();
        if (fa) names.add(fa);
      });
      return { uniqueArtists: names.size, songsWithArtists };
    }
    function vizEstimatedMinutes(songs) {
      const list = Array.isArray(songs) ? songs : [];
      const totalMs = list.reduce((sum, song) => sum + (Number(song.durationMs || 0) || (3.5 * 60 * 1000)), 0);
      return Math.round(totalMs / 60000);
    }

    function vizFormatMinutes(mins) {
      const h = Math.floor(mins / 60), m = mins % 60;
      if (!h) return `${m}m`;
      return `${h}h ${m}m`;
    }
    function vizReactionRows(items) {
      return items.flatMap(g => vizOfficialSongs(g).map(song => ({ genre:g, song, reaction:Number(song.reaction || 0) })))
        .filter(row => [1,2,3].includes(row.reaction));
    }

    function vizCrossoverRows(items) {
      const bySong = new Map();
      items.forEach(genre => {
        vizOfficialSongs(genre).forEach(song => {
          if (Number(song.score || 0) <= 3) return;
          const key = songIdentity(song);
          if (!key) return;
          if (!bySong.has(key)) bySong.set(key, { song, genres:[] });
          const row = bySong.get(key);
          if (!row.genres.some(entry => String(entry.genre.id) === String(genre.id))) {
            row.genres.push({ genre, fit:Number(song.score) });
          }
        });
      });
      return [...bySong.values()]
        .filter(row => row.genres.length > 1)
        .sort((a,b) => b.genres.length - a.genres.length || String(a.song.title || '').localeCompare(String(b.song.title || '')));
    }

    function visualActionArg(value='') {
      return encodeURIComponent(String(value || '')).replace(/'/g, '%27');
    }

    function vizOpenGenreEncoded(encodedName) {
      vizOpenGenreChip(decodeURIComponent(String(encodedName || '')));
    }

    function openGenreByIdEncoded(encodedId, editMode=false) {
      const id = decodeURIComponent(String(encodedId || ''));
      const g = (genres || []).find(x => String(x.id) === String(id));
      if (g) openGenreDetail(g, !!editMode);
    }

    window.openGenreByIdEncoded = openGenreByIdEncoded;

    function vizOpenGenreChip(name) {
      const g = (genres || []).find(x => String(x.genre || '') === String(name || ''));
      if (g) openGenreDetail(g, false);
    }
    function vizPalette() { return ['#d88a22','#8c5b23','#4e8a35','#b83230','#5b6b82','#c9960e','#8c4fb8','#2c7fb8','#00a8a8','#f05a7e','#8b9b0f','#ff7f0e']; }
    function vizLegend(el, labels, values, colors) {
      if (!el) return;
      el.innerHTML = labels.map((label, i) => `<div class="viz-legend-item"><span class="viz-legend-dot" style="background:${colors[i]}"></span><span>${escapeHtml(String(label))} (${values[i]})</span></div>`).join('');
    }
    function vizRenderKPIs(el, stats) {
      if (!el) return;
      el.innerHTML = stats.map(s => `<div class="viz-kpi"><div class="viz-kpi-val">${escapeHtml(String(s.value))}</div><div class="viz-kpi-label">${escapeHtml(String(s.label))}</div></div>`).join('');
    }
    function vizRenderRatingsContent(items) {
      const map = { '5': [], '4': [], '3': [], '2': [], '1': [], 'zanger': [] };
      items.forEach(g => { const k = String(g.rating || ''); if (k === 'zanger') map.zanger.push(g); else if (map[k]) map[k].push(g); });
      const groups = [['5','Inject This Into My Veins'],['4','Hell Yeah, Run It Back'],['3','Glad I Heard It'],['2','Respectfully, Nah'],['1','Get This Off My Turntable'],['zanger','Zanger']];
      const root = document.getElementById('vizRatingsContent');
      if (!root) return;
      root.innerHTML = groups.map(([k, label]) => {
        const list = map[k].sort((a,b) => (a.rank_order ?? 9999) - (b.rank_order ?? 9999) || String(a.genre || '').localeCompare(String(b.genre || '')));
        return `<div class="viz-rating-group"><div class="viz-rating-heading"><span class="viz-star">${k === 'zanger' ? '✕' : '★'.repeat(Number(k || 0))}</span><span>${escapeHtml(label)}</span></div><div class="viz-rating-chips">${list.length ? list.map(g => `<button type="button" class="viz-chip viz-click-chip" onclick="vizOpenGenreEncoded('${visualActionArg(g.genre || '')}')">${escapeHtml(g.genre || 'Unknown')}</button>`).join('') : '<div class="viz-chip-none">None yet.</div>'}</div></div>`;
      }).join('');
    }

    function vizRenderHighlights(items) {
      const mount = document.getElementById('vizHighlightsMonthly');
      if (!mount) return;
      if (!items.length) { mount.innerHTML = '<div class="viz-empty">No genres logged for this month yet.</div>'; return; }
      const sorted = items.slice().sort((a,b) => String(dateValue(a)||'').localeCompare(String(dateValue(b)||'')) || String(a.genre||'').localeCompare(String(b.genre||'')));
      const first = sorted[0], last = sorted[sorted.length - 1];
      const explicitFav = items.find(g => !!g.monthfavorite);
      const explicitLeast = items.find(g => !!g.monthleastfavorite);
      const rated = items.filter(g => String(g.rating || '') !== 'zanger' && g.rating !== '' && g.rating != null);
      const favorite = explicitFav || rated.slice().sort((a,b) => vizNumericRating(b) - vizNumericRating(a) || ((a.rank_order ?? 9999) - (b.rank_order ?? 9999)) || String(a.genre||'').localeCompare(String(b.genre||'')))[0] || first;
      const least = explicitLeast || rated.slice().sort((a,b) => vizNumericRating(a) - vizNumericRating(b) || String(a.genre||'').localeCompare(String(b.genre||'')))[0] || last;
      const favoriteSongGenre = items.find(g => g.favoritesong && (g.monthfavorite || g.monthlycontender)) || items.find(g => g.favoritesong) || null;
      mount.innerHTML = [
        ['Favorite genre', favorite?.genre || '—', categoryLine(favorite || {})],
        ['Least favorite', least?.genre || '—', categoryLine(least || {})],
        ['Favorite song', favoriteSongGenre?.favoritesong || '—', favoriteSongGenre?.favoriteartist || favoriteSongGenre?.genre || ''],
        ['First → Last', `${first?.genre || '—'} → ${last?.genre || '—'}`, `${dateValue(first) || ''} to ${dateValue(last) || ''}`],
      ].map(([label, val, sub]) => `<div class="viz-hl-card"><div class="viz-hl-label">${escapeHtml(String(label))}</div><div class="viz-hl-val">${escapeHtml(String(val))}</div><div class="viz-hl-sub">${escapeHtml(String(sub || ''))}</div></div>`).join('');
    }
    function vizRenderArtistStats(items) {
      const mount = document.getElementById('vizArtistsMonthly');
      if (!mount) return;
      const songs = vizAllOfficialSongs(items), artists = vizArtists(items), avg = items.length ? (artists.uniqueArtists / items.length).toFixed(1) : '0';
      mount.innerHTML = [['Unique Artists', artists.uniqueArtists],['Songs Logged', songs.length],['With Artist Data', artists.songsWithArtists],['Artists / Genre', avg]].map(([label, value]) => `<div class="viz-artist-stat"><div class="viz-artist-num">${escapeHtml(String(value))}</div><div class="viz-artist-lbl">${escapeHtml(String(label))}</div></div>`).join('') + (songs.length && !artists.uniqueArtists ? '<div class="small" style="grid-column:1/-1;">Artist names could not be inferred from stored song labels. Use Edit track URL or refresh metadata for those entries.</div>' : '');
    }
    function vizReactionCountSummary(songs) {
      const counts = { 3:0, 2:0, 1:0, unrated:0 };
      songs.forEach(song => {
        const reaction = Number(song.reaction || 0);
        if ([1,2,3].includes(reaction)) counts[reaction] += 1;
        else counts.unrated += 1;
      });
      return counts;
    }

    function vizRenderSongReactions(mountId, items) {
      const mount = document.getElementById(mountId);
      if (!mount) return;
      const allSongs = vizAllOfficialSongs(items);
      if (!allSongs.length) {
        mount.innerHTML = '<div class="viz-empty">No logged songs in this view yet.</div>';
        return;
      }
      const overall = vizReactionCountSummary(allSongs);
      const rows = items.map(genre => {
        const songs = vizOfficialSongs(genre);
        return { genre, songs: songs.length, counts: vizReactionCountSummary(songs) };
      }).filter(row => row.songs > 0 && (row.counts[1] + row.counts[2] + row.counts[3]) > 0)
        .sort((a,b) => b.counts[3] - a.counts[3] || b.songs - a.songs || String(a.genre.genre || '').localeCompare(String(b.genre.genre || '')))
        .slice(0, 12);

      const chartId = `${mountId}Donut`;
      mount.innerHTML = `
        <div class="viz-reaction-compact">
          <div class="viz-reaction-overview">
            <div class="viz-reaction-ring viz-clickable-chart" title="Click a slice to drill into tracks"><canvas id="${chartId}"></canvas></div>
            <div class="viz-reaction-legend">
              <button type="button" class="viz-reaction-legend-row ${vizDrilldownState?.type === 'reaction' && Number(vizDrilldownState.value) === 3 && vizDrilldownState.mode === vizMode() ? 'active' : ''}" onclick="setVisualDrilldown('reaction', 3, vizMode())"><span><span class="emoji">👍</span>I Fuck With This</span><strong>${overall[3]}</strong></button>
              <button type="button" class="viz-reaction-legend-row ${vizDrilldownState?.type === 'reaction' && Number(vizDrilldownState.value) === 2 && vizDrilldownState.mode === vizMode() ? 'active' : ''}" onclick="setVisualDrilldown('reaction', 2, vizMode())"><span><span class="emoji">🤷</span>Meh, It’s Fine</span><strong>${overall[2]}</strong></button>
              <button type="button" class="viz-reaction-legend-row ${vizDrilldownState?.type === 'reaction' && Number(vizDrilldownState.value) === 1 && vizDrilldownState.mode === vizMode() ? 'active' : ''}" onclick="setVisualDrilldown('reaction', 1, vizMode())"><span><span class="emoji">👎</span>Fuck Off</span><strong>${overall[1]}</strong></button>
              <button type="button" class="viz-reaction-legend-row ${vizDrilldownState?.type === 'reaction' && Number(vizDrilldownState.value) === 0 && vizDrilldownState.mode === vizMode() ? 'active' : ''}" onclick="setVisualDrilldown('reaction', 0, vizMode())"><span><span class="emoji">—</span>Unrated</span><strong>${overall.unrated}</strong></button>
            </div>
          </div>
          ${rows.length ? `<div class="viz-reaction-bars">${rows.map(row => {
            const denom = row.songs || 1;
            return `<div class="viz-reaction-bar-row">
              <button type="button" class="viz-reaction-bar-genre" onclick="vizOpenGenreEncoded('${visualActionArg(row.genre.genre || '')}')">${escapeHtml(row.genre.genre || 'Unknown')}</button>
              <div class="viz-stackbar" title="${row.counts[3]} liked · ${row.counts[2]} meh · ${row.counts[1]} disliked · ${row.counts.unrated} unrated">
                <span class="viz-stack-like" style="width:${(row.counts[3] / denom) * 100}%"></span>
                <span class="viz-stack-meh" style="width:${(row.counts[2] / denom) * 100}%"></span>
                <span class="viz-stack-no" style="width:${(row.counts[1] / denom) * 100}%"></span>
                <span class="viz-stack-unrated" style="width:${(row.counts.unrated / denom) * 100}%"></span>
              </div>
              <span class="viz-stack-total">${row.songs}</span>
            </div>`;
          }).join('')}</div>` : '<div class="viz-empty">Rate songs to see per-genre reaction patterns.</div>'}
        </div>`;

      const canvas = document.getElementById(chartId);
      if (canvas) {
        _vizCharts[chartId] = new Chart(canvas.getContext('2d'), {
          type:'doughnut',
          data:{ labels:['I Fuck With This','Meh, It’s Fine','Fuck Off','Unrated'], datasets:[{ data:[overall[3], overall[2], overall[1], overall.unrated], backgroundColor:[3,2,1,0].map((value, i) => (vizDrilldownState?.type === 'reaction' && Number(vizDrilldownState.value) === value && vizDrilldownState.mode === vizMode()) ? ['#6faa43','#f0a33a','#d94842','#8a7d68'][i] : ['#4e8a35','#d88a22','#b83230','#cabca6'][i]), borderWidth:2, borderColor:'#fffdf8' }] },
          options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, cutout:'62%', onClick:(event, elements) => { if (!elements.length) return; const reactionValues = [3,2,1,0]; setVisualDrilldown('reaction', reactionValues[elements[0].index], vizMode()); }, onHover:(event, elements) => { if (event?.native?.target) event.native.target.style.cursor = elements.length ? 'pointer' : 'default'; } }
        });
      }
    }

    function vizRenderCrossovers(mountId, items, limit=10) {
      const mount = document.getElementById(mountId);
      if (!mount) return;
      const rows = vizCrossoverRows(items).slice(0, limit);
      if (!rows.length) {
        mount.innerHTML = '<div class="viz-empty">No songs yet with a 4–5 fit in multiple logged genres.</div>';
        return;
      }
      mount.innerHTML = `<div class="viz-crossover-list">${rows.map(row => `<div class="viz-crossover-item">${row.song.artwork ? `<img class="viz-crossover-art" src="${escapeHtml(row.song.artwork)}" alt="" loading="lazy">` : '<div class="viz-crossover-art"></div>'}<div><div class="viz-crossover-name">${vizSongTitleLink(row.song)}</div><div class="viz-crossover-path">${row.genres.map(entry => `<button type="button" class="viz-fit-chip viz-click-chip" onclick="vizOpenGenreEncoded('${visualActionArg(entry.genre.genre || '')}')">${escapeHtml(entry.genre.genre || 'Unknown')} ${entry.fit}/5</button>`).join('')}</div></div></div>`).join('')}</div>`;
    }

    function renderDecadeCoverageNote(note, decadeStats, mode) {
      if (!note) return;
      if (decadeStats.known) {
        note.innerHTML = `<div class="viz-chart-hint">Click a decade bar to open the local track crate below this chart.</div>${decadeStats.known} song${decadeStats.known === 1 ? '' : 's'} placed by effective year${decadeStats.overrides ? ` · ${decadeStats.overrides} era override${decadeStats.overrides === 1 ? '' : 's'}` : ''}${decadeStats.unknown ? ` · <button type="button" class="viz-meta-link" onclick="openMetadataQueue('spotify', '${mode}')">${decadeStats.unknown} still missing year metadata</button>` : ''}.`;
      } else {
        note.innerHTML = `No effective years stored yet${decadeStats.unknown ? ` for <button type="button" class="viz-meta-link" onclick="openMetadataQueue('spotify', '${mode}')">${decadeStats.unknown} logged songs</button>` : ''}. Use Refresh Spotify Metadata above or add era overrides from a decade drilldown.`;
      }
    }

    function vizMonthlyCharts(items) {
      const palette = vizPalette();
      const catCounts = {};
      items.forEach(g => { const k = vizCategoryRoot(g); catCounts[k] = (catCounts[k] || 0) + 1; });
      const catLabels = Object.keys(catCounts).sort((a,b) => catCounts[b] - catCounts[a]).slice(0, 10);
      const catVals = catLabels.map(k => catCounts[k]);
      const catColors = catLabels.map((_, i) => palette[i % palette.length]);
      const catCanvas = document.getElementById('vizCatDonut');
      if (catCanvas) _vizCharts.catMonthly = new Chart(catCanvas.getContext('2d'), { type:'doughnut', data:{ labels:catLabels, datasets:[{ data:catVals, backgroundColor:catColors, borderWidth:2, borderColor:'#fffdf8' }] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, cutout:'62%' } });
      vizLegend(document.getElementById('vizCatLegend'), catLabels, catVals, catColors);

      const decadeStats = vizSongDecadeStats(items);
      const dLabels = Object.keys(decadeStats.counts).sort();
      const dVals = dLabels.map(k => decadeStats.counts[k]);
      const decadeCanvas = document.getElementById('vizDecadesBar');
      if (decadeCanvas && dLabels.length) {
        decadeCanvas.closest('.viz-card')?.classList.add('viz-clickable-chart');
        const selected = vizDrilldownState?.type === 'decade' && vizDrilldownState?.mode === 'monthly' ? vizDrilldownState.value : '';
        const colors = dLabels.map(label => label === selected ? '#d98d25' : '#8c5b23');
        _vizCharts.decadesMonthly = new Chart(decadeCanvas.getContext('2d'), { type:'bar', data:{ labels:dLabels, datasets:[{ data:dVals, backgroundColor:colors, borderRadius:4, borderSkipped:false }] }, options:{ responsive:true, plugins:{legend:{display:false}}, onClick:(event, elements) => { if (!elements.length) return; const label = dLabels[elements[0].index]; setVisualDrilldown('decade', label, 'monthly'); }, onHover:(event, elements) => { if (event?.native?.target) event.native.target.style.cursor = elements.length ? 'pointer' : 'default'; }, scales:{ x:{ ticks:{ font:{ size:10 } } }, y:{ beginAtZero:true, precision:0 } } } });
      }
      renderDecadeCoverageNote(document.getElementById('vizDecadesNoteMonthly'), decadeStats, 'monthly');
    }

    function vizAllTimeCharts(items) {
      const palette = vizPalette();
      const ratingKeys = ['5','4','3','2','1','zanger'], ratingLabels = ['5★ Inject This Into My Veins','4★ Hell Yeah, Run It Back','3★ Glad I Heard It','2★ Respectfully, Nah','1★ Get This Off My Turntable','Zanger'], ratingColors = ['#3d7a1a','#6fa832','#d88a22','#c9540e','#b83230','#5b6b82'];
      const ratingMap = { '5':0,'4':0,'3':0,'2':0,'1':0,'zanger':0 };
      items.forEach(g => { const k = String(g.rating || ''); if (k === 'zanger') ratingMap.zanger += 1; else if (ratingMap[k] != null) ratingMap[k] += 1; });
      const rd = ratingKeys.map(k => ratingMap[k]);
      const ratingCanvas = document.getElementById('vizRatingsDonut');
      if (ratingCanvas) _vizCharts.ratingAll = new Chart(ratingCanvas.getContext('2d'), { type:'doughnut', data:{ labels:ratingLabels, datasets:[{ data:rd, backgroundColor:ratingColors, borderWidth:2, borderColor:'#fffdf8' }] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, cutout:'62%' } });
      vizLegend(document.getElementById('vizRatingsLegend'), ratingLabels, rd, ratingColors);

      const catCounts = {};
      items.forEach(g => { const k = vizCategoryRoot(g); catCounts[k] = (catCounts[k] || 0) + 1; });
      const catLabels = Object.keys(catCounts).sort((a,b) => catCounts[b] - catCounts[a]).slice(0, 10), catVals = catLabels.map(k => catCounts[k]), catColors = catLabels.map((_, i) => palette[i % palette.length]);
      const catCanvas = document.getElementById('vizCatDonutAll');
      if (catCanvas) _vizCharts.catAll = new Chart(catCanvas.getContext('2d'), { type:'doughnut', data:{ labels:catLabels, datasets:[{ data:catVals, backgroundColor:catColors, borderWidth:2, borderColor:'#fffdf8' }] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, cutout:'62%' } });
      vizLegend(document.getElementById('vizCatLegendAll'), catLabels, catVals, catColors);

      const decadeStats = vizSongDecadeStats(items);
      const dLabels = Object.keys(decadeStats.counts).sort();
      const dVals = dLabels.map(k => decadeStats.counts[k]);
      const decadeCanvas = document.getElementById('vizDecadesBarAll');
      if (decadeCanvas && dLabels.length) {
        decadeCanvas.closest('.viz-card')?.classList.add('viz-clickable-chart');
        const selected = vizDrilldownState?.type === 'decade' && vizDrilldownState?.mode === 'alltime' ? vizDrilldownState.value : '';
        const colors = dLabels.map(label => label === selected ? '#d98d25' : '#8c5b23');
        _vizCharts.decadesAll = new Chart(decadeCanvas.getContext('2d'), { type:'bar', data:{ labels:dLabels, datasets:[{ data:dVals, backgroundColor:colors, borderRadius:4, borderSkipped:false }] }, options:{ responsive:true, plugins:{legend:{display:false}}, onClick:(event, elements) => { if (!elements.length) return; const label = dLabels[elements[0].index]; setVisualDrilldown('decade', label, 'alltime'); }, onHover:(event, elements) => { if (event?.native?.target) event.native.target.style.cursor = elements.length ? 'pointer' : 'default'; }, scales:{ x:{ ticks:{ font:{ size:10 } } }, y:{ beginAtZero:true, precision:0 } } } });
      }
      renderDecadeCoverageNote(document.getElementById('vizDecadesNoteAll'), decadeStats, 'alltime');

      const topDepth = items.map(g => ({ genre: g.genre || 'Unknown', count: vizOfficialSongs(g).length })).filter(x => x.count > 0).sort((a,b) => b.count - a.count || a.genre.localeCompare(b.genre)).slice(0,15);
      const depthCanvas = document.getElementById('vizSongsDepth');
      if (depthCanvas) _vizCharts.depth = new Chart(depthCanvas.getContext('2d'), { type:'bar', data:{ labels:topDepth.map(x => x.genre), datasets:[{ data:topDepth.map(x => x.count), backgroundColor:'#5b6b82', borderRadius:4, borderSkipped:false }] }, options:{ indexAxis:'y', responsive:true, plugins:{legend:{display:false}}, scales:{ x:{ beginAtZero:true, precision:0 }, y:{ ticks:{ font:{ size:10 } } } } } });
    }



    function validSpotifyTrackUrl(url='') {
      return /open\.spotify\.com\/track\/[A-Za-z0-9]{22}/i.test(normalizeSongUrl(url));
    }

    function looksLikeSpotifyUrl(url='') {
      return /spotify/i.test(String(url || ''));
    }

    function spotifyMetadataMissingFields(song) {
      const missing = [];
      if (!String(song?.title || '').trim()) missing.push('title');
      if (!String(song?.artist || '').trim()) missing.push('artist');
      if (!String(song?.artwork || '').trim()) missing.push('album art');
      if (!song?.releaseYear) missing.push('year');
      if (!song?.durationMs) missing.push('duration');
      if (!song?.spotifyId) missing.push('Spotify ID');
      if (!song?.isrc && !song?.spotifyMetadataFetched) missing.push('ISRC');
      return missing;
    }

    function metadataRowMissingAlbumArt(row) {
      return (row?.missing || []).some(field => /art/i.test(String(field || '')));
    }

    function metadataFilterMatches(row, filter) {
      const active = ['spotify', 'art', 'broken', 'nonspotify'].includes(filter) ? filter : 'spotify';
      if (active === 'art') return metadataRowMissingAlbumArt(row);
      return row.group === active;
    }

    function spotifyTrackNeedsRefresh(song) {
      if (!validSpotifyTrackUrl(song?.url || '')) return false;
      if (!song?.spotifyMetadataFetched) return true;
      return !String(song?.artist || '').trim() || !String(song?.artwork || '').trim() || !song?.releaseYear || !song?.durationMs || !song?.spotifyId;
    }

    function collectMetadataRows(items) {
      return items.flatMap(genre => vizOfficialSongs(genre).map(song => {
        const missing = spotifyMetadataMissingFields(song);
        const url = normalizeSongUrl(song.url || '');
        const key = stagedReactionKey(genre.id, songIdentity(song));
        const failure = spotifyMetadataFailures.get(key) || null;
        const validSpotify = validSpotifyTrackUrl(url);
        const needsRefresh = validSpotify && spotifyTrackNeedsRefresh(song);
        const bulkSkipped = needsRefresh && spotifyFailureShouldSkipBulk(failure);
        let group = '';
        if (validSpotify && needsRefresh) group = bulkSkipped ? 'broken' : 'spotify';
        else if (!validSpotify && looksLikeSpotifyUrl(url)) group = 'broken';
        else if (missing.length) group = 'nonspotify';
        if (!group) return null;
        return { genre, song, missing, group, key, failure, validSpotify, bulkSkipped };
      }).filter(Boolean));
    }

    function setMetadataQueueFilter(filter, mountId) {
      metadataQueueFilter = ['spotify', 'art', 'broken', 'nonspotify'].includes(filter) ? filter : 'spotify';
      const base = mountId === 'vizMetadataQueueMonthly' ? vizBaseGenres() : allListenedGenresForMaintenance();
      renderMetadataQueue(mountId, vizFilteredItems(base));
    }

    function openMetadataQueue(filter='spotify', mode='alltime') {
      metadataQueueFilter = ['spotify', 'art', 'broken', 'nonspotify'].includes(filter) ? filter : 'spotify';
      if (mode === 'alltime' && vizMode() !== 'alltime') {
        document.querySelector('[data-viz-mode="alltime"]')?.click();
      }
      setTimeout(() => {
        const mount = document.getElementById(mode === 'monthly' ? 'vizMetadataQueueMonthly' : 'vizMetadataQueueAll');
        if (mount) {
          const base = mode === 'monthly' ? vizBaseGenres() : allListenedGenresForMaintenance();
          renderMetadataQueue(mount.id, vizFilteredItems(base));
          mount.closest('.viz-card')?.scrollIntoView({ behavior:'smooth', block:'start' });
        }
      }, 30);
    }

    function findSongForMetadataAction(genreId, key) {
      const genre = (genres || []).find(g => String(g.id) === String(genreId));
      if (!genre) return null;
      const songs = inflateSongsFromStorage(genre.songs_listened || []);
      let found = null;
      eachSongInLog(songs, song => {
        if (!found && songsIdentityMatch(song, key)) found = song;
      });
      return found ? { genre, songs, song:found } : null;
    }

    async function refreshSingleSpotifyTrack(encodedGenreId, encodedKey) {
      const genreId = decodeURIComponent(String(encodedGenreId || ''));
      const key = decodeURIComponent(String(encodedKey || ''));
      if (Date.now() < spotifyRefreshPausedUntil) {
        const wait = Math.ceil((spotifyRefreshPausedUntil - Date.now()) / 1000);
        showSaveToast(`Spotify asked us to pause. Try again in ${wait} seconds.`, true);
        return;
      }
      const target = findSongForMetadataAction(genreId, key);
      if (!target) {
        showSaveToast('Could not find that track in its genre.', true);
        return;
      }
      const result = await fetchSpotifyTrackResult(target.song.url, true);
      if (!result.ok) {
        spotifyMetadataFailures.set(stagedReactionKey(genreId, key), result);
        if (result.code === 'rate_limited') {
          beginSpotifyPause(result.retryAfterSeconds || 30);
          if (!spotifyRefreshReport) spotifyRefreshReport = { updated: 0, remaining: 0, broken: 0, failed: 0, scope: 'single track' };
          const restore = preserveScrollSnapshot();
          renderVisuals();
          restore();
          return;
        }
        if (!spotifyRefreshReport) spotifyRefreshReport = { updated: 0, remaining: 0, broken: 0, failed: 0, scope: 'single track' };
        { const restore = preserveScrollSnapshot(); renderVisuals(); restore(); }
        showSaveToast(`Spotify refresh failed: ${result.error}`, true);
        return;
      }
      applyOfficialSpotifyMetadata(target.song, result.track);
      target.genre.songs_listened = target.songs;
      spotifyMetadataFailures.delete(stagedReactionKey(genreId, key));
      libraryUpdatesPending = true;
      setUnsavedState(true);
      toggleLibrarySaveButton(true);
        if (!spotifyRefreshReport) spotifyRefreshReport = { updated: 0, remaining: 0, broken: 0, failed: 0, scope: 'single track' };
        { const restore = preserveScrollSnapshot(); renderVisuals(); restore(); }
      showSaveToast('Spotify metadata updated — save library updates to persist it.', false);
      }

  function deleteFromMetadataQueue(encodedGenreId, encodedKey, mountId) {
      if (!window.confirm('Permanently delete this track from its genre? This cannot be undone until you reload without saving.')) return;
      const genreId = decodeURIComponent(encodedGenreId || '');
      const key = decodeURIComponent(encodedKey || '');
      const genre = genres.find(g => String(g.id) === String(genreId));
      if (!genre) return;
      const songs = inflateSongsFromStorage(genre.songs_listened || []).filter(s => !s.isPending);
      const filtered = [];
      for (const song of songs) {
        if (songsIdentityMatch(song, key)) continue; // skip deleted
        if (song.levelUp && songsIdentityMatch(song.levelUp, key)) song.levelUp = null;
        filtered.push(song);
      }
      genre.songs_listened = filtered;
      libraryUpdatesPending = true;
      toggleLibrarySaveButton(true);
      setUnsavedState(true);
      showSaveToast('Track deleted — click Save Library Updates to persist.', false);
      const metaDetailsOpen = !!document.getElementById(mountId)?.querySelector('details.viz-queue-fold')?.open;
      const restore = preserveScrollSnapshot();
      renderVisuals();
      restore();
      if (metaDetailsOpen) {
        document.getElementById(mountId)?.querySelector('details.viz-queue-fold')?.setAttribute('open', '');
      }
    }

    function editMetadataTrackUrl(encodedGenreName) {
      const name = decodeURIComponent(String(encodedGenreName || ''));
      const genre = (genres || []).find(g => String(g.genre || '') === name);
      if (!genre) return;
      openGenreDetail(genre, true);
      showSaveToast('Use Edit track URL on the song card, then click Save Changes.', false);
    }

    function renderMetadataQueue(mountId, items) {
      const mount = document.getElementById(mountId);
      if (!mount) return;
      const rows = collectMetadataRows(items);
      const counts = {
        spotify: rows.filter(row => row.group === 'spotify').length,
        art: rows.filter(metadataRowMissingAlbumArt).length,
        broken: rows.filter(row => row.group === 'broken').length,
        nonspotify: rows.filter(row => row.group === 'nonspotify').length
      };
      if (!['spotify', 'art', 'broken', 'nonspotify'].includes(metadataQueueFilter)) metadataQueueFilter = 'spotify';
      const limit = vizQueueLimits.metadata || 8;
      const allVisible = rows.filter(row => metadataFilterMatches(row, metadataQueueFilter));
      const visible = allVisible.slice(0, limit);
      const report = spotifyRefreshReport
        ? `<div class="viz-metadata-report"><strong>Last refresh${spotifyRefreshReport.scope ? ` (${escapeHtml(spotifyRefreshReport.scope)})` : ''}:</strong> ${spotifyRefreshReport.updated} updated · ${spotifyRefreshReport.remaining} remaining Spotify tracks · ${spotifyRefreshReport.broken} broken/unresolved · ${spotifyRefreshReport.failed} other failures${spotifyRefreshReport.rateLimited ? ` · paused by Spotify${spotifyRefreshReport.pausedSeconds ? ` (${spotifyRefreshReport.pausedSeconds}s wait requested)` : ''}` : ''}${spotifyRefreshReport.stopped && !spotifyRefreshReport.rateLimited ? ' · stopped early' : ''}.</div>`
        : '';
      const emptyCopy = metadataQueueFilter === 'art'
        ? 'No tracks are missing album art in this scope.'
        : 'Nothing in this metadata group.';
      mount.innerHTML = `<details class="viz-queue-fold" ${spotifyRefreshReport ? 'open' : ''}>
      <summary><span>Missing Metadata Queue</span><span class="viz-queue-count">${rows.length}</span></summary>
        <div class="viz-queue-body">${report}<div class="viz-metadata-summary"><button type="button" class="viz-metadata-filter ${metadataQueueFilter === 'spotify' ? 'active' : ''}" onclick="setMetadataQueueFilter('spotify', '${mountId}')">Ready for Spotify refresh · ${counts.spotify}</button><button type="button" class="viz-metadata-filter ${metadataQueueFilter === 'art' ? 'active' : ''}" onclick="setMetadataQueueFilter('art', '${mountId}')">Missing album art · ${counts.art}</button><button type="button" class="viz-metadata-filter ${metadataQueueFilter === 'broken' ? 'active' : ''}" onclick="setMetadataQueueFilter('broken', '${mountId}')">Broken / unrecognized · ${counts.broken}</button><button type="button" class="viz-metadata-filter ${metadataQueueFilter === 'nonspotify' ? 'active' : ''}" onclick="setMetadataQueueFilter('nonspotify', '${mountId}')">Non-Spotify · ${counts.nonspotify}</button></div>${visible.length ? `<div class="viz-metadata-list">${visible.map((row, idx) => {
          const failure = row.failure ? `<span class="viz-missing-chip">${escapeHtml(row.failure.code === 'rate_limited' ? 'rate limited' : row.failure.error)}</span>` : '';
          const skipped = row.bulkSkipped ? '<span class="viz-missing-chip">skipped from bulk refresh</span>' : '';
          const canRefresh = row.validSpotify;
          const refreshText = metadataRowMissingAlbumArt(row) ? (row.bulkSkipped ? 'Retry Artwork' : 'Pull Album Art') : (row.bulkSkipped ? 'Retry Track' : 'Refresh Track');
          const eraInputId = `metadataEra_${mountId}_${idx}_${String(row.genre.id).replace(/[^a-zA-Z0-9]/g,'')}`;
          const savedEra = row.song.eraYear || row.song.eraDecade || '';
          const effective = songEffectiveYear(row.song);
          const eraNote = effective.year ? `${effective.source}: ${effective.year}${row.song.releaseYear && effective.source !== 'Spotify' ? ` · Spotify: ${row.song.releaseYear}` : ''}` : 'No era/release year yet';
          const eraForm = `<div class="viz-era-form viz-era-form-metadata"><span>${escapeHtml(eraNote)}</span><input id="${eraInputId}" type="text" placeholder="1950s or 1953" value="${escapeHtml(savedEra)}"><button type="button" onclick="saveEraOverride('${visualActionArg(row.genre.id)}','${visualActionArg(songIdentity(row.song))}','${eraInputId}')">Save Era</button></div>`;
          const trackLink = row.song.url ? `<a class="viz-meta-link" href="${escapeHtml(row.song.url)}" target="_blank" rel="noopener noreferrer">Open Track ↗</a>` : '';
          return `<div class="viz-metadata-row"><div><div class="viz-metadata-title">${vizSongTitleLink(row.song)}</div><div class="viz-metadata-context"><button type="button" class="viz-metadata-genre" onclick="vizOpenGenreEncoded('${visualActionArg(row.genre.genre || '')}')">${escapeHtml(row.genre.genre || 'Unknown')}</button>${row.missing.map(field => `<span class="viz-missing-chip">missing ${escapeHtml(field)}</span>`).join('')}${failure}${skipped}</div>${eraForm}</div><div class="viz-meta-actions">${canRefresh ? `<button type="button" class="primary" onclick="refreshSingleSpotifyTrack('${visualActionArg(row.genre.id)}', '${visualActionArg(songIdentity(row.song))}')">${refreshText}</button>` : ''}<button type="button" onclick="editMetadataTrackUrl('${visualActionArg(row.genre.genre || '')}')">Edit URL</button><button type="button" onclick="vizOpenGenreEncoded('${visualActionArg(row.genre.genre || '')}')">Open Genre</button>${trackLink}<button type="button" class="viz-meta-delete" onclick="deleteFromMetadataQueue('${visualActionArg(row.genre.id)}', '${visualActionArg(songIdentity(row.song))}', '${mountId}')" title="Remove this track from the genre entirely">Delete</button></div></div>`;
        }).join('')}</div>` : `<div class="viz-empty">${escapeHtml(emptyCopy)}</div>`}${allVisible.length > limit ? `<button type="button" class="viz-show-more" onclick="showMoreVizQueue('metadata')">Show 8 more</button>` : ''}</div>
      </details>`;
    }

    function updateSpotifyPauseDisplay() {
      const status = document.getElementById('vizRefreshStatus');
      const button = document.getElementById('vizRefreshBtn');
      const remaining = Math.max(0, Math.ceil((spotifyRefreshPausedUntil - Date.now()) / 1000));
      if (remaining > 0) {
        const availableAt = new Date(spotifyRefreshPausedUntil).toLocaleString();
        if (status) status.innerHTML = `<span class="viz-refresh-paused">Spotify cooldown active — try again after ${escapeHtml(availableAt)} (${remaining}s remaining).</span>`;
        if (button && !spotifyRefreshRunning) {
          button.disabled = true;
          button.textContent = 'Spotify Cooldown Active';
        }
      } else {
        spotifyRefreshPausedUntil = 0;
        spotifyStorageRemove(SPOTIFY_COOLDOWN_STORAGE_KEY);
        if (spotifyRefreshCountdownTimer) {
          clearInterval(spotifyRefreshCountdownTimer);
          spotifyRefreshCountdownTimer = null;
        }
        if (button && !spotifyRefreshRunning) {
          button.disabled = false;
          button.textContent = '↺ Refresh Next 5 Spotify Tracks';
        }
        if (status && spotifyRefreshReport?.rateLimited) status.textContent = 'Spotify cooldown is over. Start a small five-track metadata batch when ready.';
      }
    }

    function beginSpotifyPause(seconds=30) {
      spotifyRefreshPausedUntil = Date.now() + (Math.max(1, Number(seconds || 30)) * 1000);
      spotifyStorageSet(SPOTIFY_COOLDOWN_STORAGE_KEY, String(spotifyRefreshPausedUntil));
      if (spotifyRefreshCountdownTimer) clearInterval(spotifyRefreshCountdownTimer);
      spotifyRefreshCountdownTimer = setInterval(updateSpotifyPauseDisplay, 1000);
      updateSpotifyPauseDisplay();
    }

    function waitForSpotifyPacing(ms=2500) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    function allListenedGenresForMaintenance() {
      return (genres || []).filter(g => ['listened','veto'].includes(String(g.status || '').toLowerCase()) && dateValue(g));
    }

    function visualRefreshScopeItems() {
      // Bulk Spotify refresh should respect the active Visuals scope:
      // monthly mode refreshes only that month; all-time mode refreshes the full archive.
      const scoped = vizMode() === 'monthly' ? vizBaseGenres() : allListenedGenresForMaintenance();
      return vizFilteredItems(scoped);
    }

    function visualRefreshScopeLabel() {
      const focus = vizFocusedGenre();
      const focusText = focus ? ` · ${focus.genre}` : '';
      return vizMode() === 'monthly'
        ? `${vizMonthTitle(vizSelectedMonth())}${focusText}`
        : `All time${focusText}`;
    }

    function maintenanceStats() {
      const listened = allListenedGenresForMaintenance();
      const pendingRows = collectQueuedPendingNominationRows();
      const missingMetadataRows = collectMetadataRows(listened);
      const unratedRows = listened.flatMap(genre => vizOfficialSongs(genre)
        .filter(song => ![1,2,3].includes(Number(song.reaction)))
        .map(song => ({ type:'unrated', genre, song, key:songIdentity(song) }))
      );
      const drafts = (genres || []).filter(g => (g.status || '').toLowerCase() === 'unlistened' && ((g.notes || '').trim() || vizOfficialSongs(g).length || g.favoritesong));
      const duplicates = collectDuplicateMaintenanceRows();
      return { pendingRows, missingMetadataRows, unratedRows, drafts, duplicates };
    }

    function renderNeedsAttention(mountId) {
      const mount = document.getElementById(mountId);
      if (!mount) return;
      const stats = maintenanceStats();
      const buckets = [
        ['Pending nominations', stats.pendingRows],
        ['Missing song metadata', stats.missingMetadataRows],
        ['Unrated songs', stats.unratedRows],
        ['Prepared drafts', stats.drafts],
        ['Possible duplicates', stats.duplicates]
      ];
      mount.innerHTML = `<div class="viz-maint-grid">${buckets.map(([label, list]) => `<button type="button" class="viz-maint-card" data-maint-label="${escapeHtml(label)}" onclick="showMaintenanceGenres(${JSON.stringify(label)})"><strong>${list.length}</strong><span>${escapeHtml(label)}</span></button>`).join('')}</div><div class="viz-maint-detail" id="${mountId}Detail"><span class="small">Click a maintenance box to see the exact songs or genres behind that count.</span></div>`;
      mount.dataset.maintenance = JSON.stringify(buckets.reduce((acc, [label, list]) => { acc[label] = list.length; return acc; }, {}));
    }

    function maintenanceRowsForLabel(label) {
      const listened = allListenedGenresForMaintenance();
      if (label === 'Pending nominations') return collectQueuedPendingNominationRows().map(row => ({ ...row, type:'pending' }));
      if (label === 'Missing song metadata') return collectMetadataRows(listened).map(row => ({ ...row, type:'metadata' }));
      if (label === 'Unrated songs') return listened.flatMap(genre => vizOfficialSongs(genre)
        .filter(song => ![1,2,3].includes(Number(song.reaction)))
        .map(song => ({ type:'unrated', genre, song, key:songIdentity(song) }))
      );
      if (label === 'Prepared drafts') return (genres || [])
        .filter(g => (g.status || '').toLowerCase() === 'unlistened' && ((g.notes || '').trim() || vizOfficialSongs(g).length || g.favoritesong))
        .map(genre => ({ type:'draft', genre }));
      if (label === 'Possible duplicates') return collectDuplicateMaintenanceRows();
      return [];
    }

    function collectDuplicateMaintenanceRows() {
      const rows = [];
      allListenedGenresForMaintenance().forEach(genre => {
        const seen = [];
        vizOfficialSongs(genre).forEach(song => {
          const match = seen.find(entry => songsIdentityMatch(entry.song, song));
          if (match) rows.push({ type:'duplicate', genre, song, first:match.song, key:songIdentity(song) });
          else seen.push({ song, key:songIdentity(song) });
        });
      });
      return rows;
    }

    function maintenanceRowHtml(row, label) {
      if (row.type === 'pending') {
        const source = row.sourceName || 'Unknown source';
        const fit = row.fit !== '' && row.fit != null ? `<span class="review-chip">source fit ${escapeHtml(String(row.fit))}/5</span>` : '';
        return `<div class="viz-maint-row"><div><div class="viz-maint-title">${vizSongTitleLink(row.song)}</div><div class="viz-maint-meta"><span class="review-chip">queued in ${escapeHtml(row.targetGenre.genre || 'Unknown genre')}</span><span class="review-chip">from ${escapeHtml(source)}</span>${fit}</div></div><div class="viz-maint-actions"><button type="button" class="primary" onclick="openGenreByIdEncoded('${visualActionArg(row.targetGenre.id)}', false)">Open Target</button><button type="button" onclick="switchScreen('review'); setTimeout(scrollToReviewPendingQueue, 40);">Open Review</button></div></div>`;
      }
      if (row.type === 'metadata') {
        const groupLabel = row.group === 'spotify' ? 'ready for refresh' : row.group === 'broken' ? 'broken/unrecognized' : 'non-Spotify';
        const filter = metadataRowMissingAlbumArt(row) ? 'art' : (row.group === 'broken' ? 'broken' : row.group === 'nonspotify' ? 'nonspotify' : 'spotify');
        const refreshButton = row.validSpotify ? `<button type="button" class="primary" onclick="refreshSingleSpotifyTrack('${visualActionArg(row.genre.id)}', '${visualActionArg(songIdentity(row.song))}')">${metadataRowMissingAlbumArt(row) ? 'Pull Album Art' : 'Refresh Track'}</button>` : '';
        return `<div class="viz-maint-row"><div><div class="viz-maint-title">${vizSongTitleLink(row.song)}</div><div class="viz-maint-meta"><span class="review-chip">${escapeHtml(row.genre.genre || 'Unknown genre')}</span><span class="review-chip warn">${escapeHtml(groupLabel)}</span>${row.missing.map(field => `<span class="review-chip warn">missing ${escapeHtml(field)}</span>`).join('')}</div></div><div class="viz-maint-actions">${refreshButton}<button type="button" class="primary" onclick="openMetadataQueue('${filter}', 'alltime')">Open ${filter === 'art' ? 'Art' : 'Metadata'} Queue</button><button type="button" onclick="openGenreByIdEncoded('${visualActionArg(row.genre.id)}', true)">Open & Edit</button></div></div>`;
      }
      if (row.type === 'unrated') {
        const genreId = visualActionArg(row.genre.id);
        const songKey = visualActionArg(songIdentity(row.song));
        return `<div class="viz-maint-row"><div><div class="viz-maint-title">${vizSongTitleLink(row.song)}</div><div class="viz-maint-meta"><span class="review-chip">${escapeHtml(row.genre.genre || 'Unknown genre')}</span><span class="review-chip warn">unrated</span></div></div><div class="viz-maint-actions"><button type="button" onclick="setSongReactionFromVisuals('${genreId}', '${songKey}', 3)">👍</button><button type="button" onclick="setSongReactionFromVisuals('${genreId}', '${songKey}', 2)">🤷</button><button type="button" onclick="setSongReactionFromVisuals('${genreId}', '${songKey}', 1)">👎</button><button type="button" class="primary" onclick="openGenreByIdEncoded('${genreId}', false)">Open Genre</button></div></div>`;
      }
      if (row.type === 'draft') {
        const songCount = vizOfficialSongs(row.genre).length;
        return `<div class="viz-maint-row"><div><div class="viz-maint-title">${escapeHtml(row.genre.genre || 'Untitled genre')}</div><div class="viz-maint-meta"><span class="review-chip">unlistened draft</span>${row.genre.notes ? '<span class="review-chip">has notes</span>' : ''}${songCount ? `<span class="review-chip">${songCount} song${songCount === 1 ? '' : 's'}</span>` : ''}${row.genre.favoritesong ? '<span class="review-chip">has favorite</span>' : ''}</div></div><div class="viz-maint-actions"><button type="button" class="primary" onclick="openGenreByIdEncoded('${visualActionArg(row.genre.id)}', true)">Open & Edit</button></div></div>`;
      }
      if (row.type === 'duplicate') {
        return `<div class="viz-maint-row"><div><div class="viz-maint-title">${vizSongTitleLink(row.song)}</div><div class="viz-maint-meta"><span class="review-chip">${escapeHtml(row.genre.genre || 'Unknown genre')}</span><span class="review-chip warn">possible duplicate in same genre</span></div></div><div class="viz-maint-actions"><button type="button" class="primary" onclick="openGenreByIdEncoded('${visualActionArg(row.genre.id)}', true)">Open & Edit</button></div></div>`;
      }
      return '';
    }

    function showMaintenanceGenres(label) {
      const visibleMount = document.getElementById(vizMode() === 'monthly' ? 'vizNeedsAttentionMonthly' : 'vizNeedsAttentionAll');
      if (!visibleMount) return;
      visibleMount.querySelectorAll('.viz-maint-card').forEach(card => card.classList.toggle('active', card.dataset.maintLabel === label));
      const detail = visibleMount.querySelector('.viz-maint-detail');
      if (!detail) return;
      const rows = maintenanceRowsForLabel(label);
      const limit = vizQueueLimits.maintenance || 40;
      const visible = rows.slice(0, limit);
      const copy = label === 'Pending nominations'
        ? 'Songs already queued in another genre’s pending list.'
        : label === 'Missing song metadata'
          ? 'Tracks missing Spotify/title/art/year/duration fields or needing URL repair.'
          : label === 'Unrated songs'
            ? 'Tracks that still need a 👍 / 🤷 / 👎 reaction.'
            : label === 'Prepared drafts'
              ? 'Unlistened genres that already have notes, songs, or favorite data prepared.'
              : 'Likely duplicate songs inside the same listened genre.';
      detail.innerHTML = `<div class="viz-maint-panel"><div class="viz-maint-panel-head"><div><h4 class="viz-maint-panel-title">${escapeHtml(label)} · ${rows.length}</h4><p class="viz-maint-panel-copy">${escapeHtml(copy)}</p></div>${label === 'Pending nominations' ? `<button type="button" class="btn btn-secondary btn-tiny" onclick="switchScreen('review'); setTimeout(scrollToReviewPendingQueue, 40);">Open full Review list</button>` : ''}</div>${visible.length ? `<div class="viz-maint-list">${visible.map(row => maintenanceRowHtml(row, label)).join('')}</div>${rows.length > limit ? `<button type="button" class="viz-show-more" onclick="showMoreVizQueue('maintenance'); showMaintenanceGenres(${JSON.stringify(label)})">Show more</button>` : ''}` : '<div class="viz-empty">Nothing in this queue.</div>'}</div>`;
      detail.scrollIntoView({ behavior:'smooth', block:'start' });
    }

    function stagedReactionKey(genreId, songKey) {
      return `${String(genreId || '')}::${String(songKey || '')}`;
    }

    function setSongReactionFromVisuals(encodedGenreId, encodedKey, value) {
      const genreId = decodeURIComponent(String(encodedGenreId || ''));
      const genre = (genres || []).find(g => String(g.id) === String(genreId));
      if (!genre) {
        showSaveToast('Could not find that genre for rating.', true);
        return;
      }
      const key = decodeURIComponent(String(encodedKey || ''));
      const songs = inflateSongsFromStorage(genre.songs_listened || []);
      let updated = false;
      eachSongInLog(songs, song => {
        if (songIdentity(song) === key) {
          song.reaction = Number(value);
          updated = true;
        }
      });
      if (!updated) {
        showSaveToast('Could not find that song for rating.', true);
        return;
      }
      genre.songs_listened = songs;
      stagedQueueReactionKeys.add(stagedReactionKey(genre.id, key));
      libraryUpdatesPending = true;
      setUnsavedState(true);
      toggleLibrarySaveButton(true);
      { const restore = preserveScrollSnapshot(); renderVisuals(); restore(); }
      const status = document.getElementById('vizRefreshStatus');
      if (status) status.innerHTML = '<span class="viz-library-save-callout">Reaction selected — click Save Library Updates to persist it.</span>';
      showSaveToast('Reaction selected — save library updates to persist it.', false);
    }

    function renderUnratedSongs(mountId, items) {
      const mount = document.getElementById(mountId);
      if (!mount) return;
      const allRows = items.flatMap(genre => vizOfficialSongs(genre)
        .filter(song => {
          const key = stagedReactionKey(genre.id, songIdentity(song));
          return ![1,2,3].includes(Number(song.reaction)) || stagedQueueReactionKeys.has(key);
        })
        .map(song => ({ genre, song, staged: stagedQueueReactionKeys.has(stagedReactionKey(genre.id, songIdentity(song))) }))
      );
      const limit = vizQueueLimits.unrated || 8;
      const rows = allRows.slice(0, limit);
      if (!allRows.length) { mount.innerHTML = '<div class="viz-empty">No unrated songs in this view.</div>'; return; }
      mount.innerHTML = `<details class="viz-queue-fold" ${libraryUpdatesPending ? 'open' : ''}>
        <summary><span>Unrated Songs</span><span class="viz-queue-count">${allRows.length}</span></summary>
        <div class="viz-queue-body"><div class="viz-unrated-list">${rows.map(row => {
          const genreId = visualActionArg(row.genre.id);
          const songKey = visualActionArg(songIdentity(row.song));
          const reaction = Number(row.song.reaction || 0);
          return `<div class="viz-unrated-row ${row.staged ? 'is-staged' : ''}"><div><div class="viz-unrated-song">${vizSongTitleLink(row.song)}</div><button type="button" class="viz-unrated-genre" onclick="vizOpenGenreEncoded('${visualActionArg(row.genre.genre || '')}')">${escapeHtml(row.genre.genre || 'Unknown')}</button>${row.staged ? '<div class="viz-unsaved-reaction">Unsaved reaction</div>' : ''}</div><div class="viz-quick-rate"><button type="button" class="${reaction === 3 ? 'active' : ''}" onclick="setSongReactionFromVisuals('${genreId}', '${songKey}', 3)" title="I Fuck With This" aria-label="I Fuck With This">👍</button><button type="button" class="${reaction === 2 ? 'active' : ''}" onclick="setSongReactionFromVisuals('${genreId}', '${songKey}', 2)" title="Meh, It’s Fine" aria-label="Meh, It’s Fine">🤷</button><button type="button" class="${reaction === 1 ? 'active' : ''}" onclick="setSongReactionFromVisuals('${genreId}', '${songKey}', 1)" title="Fuck Off" aria-label="Fuck Off">👎</button></div></div>`;
        }).join('')}</div>${allRows.length > limit ? `<button type="button" class="viz-show-more" onclick="showMoreVizQueue('unrated')">Show 8 more</button>` : ''}</div>
      </details>`;
    }

    function toggleLibrarySaveButton(show) {
      const button = document.getElementById('vizSaveLibraryBtn');
      if (button) button.classList.toggle('hidden', !show);
      const floating = document.getElementById('floatingListeningSave');
      if (floating) floating.classList.toggle('hidden', !show);
      if (!show) setLibrarySaveBusy(false);
    }

    function setLibrarySaveBusy(isSaving) {
      const floating = document.getElementById('floatingListeningSave');
      if (floating) {
        floating.classList.toggle('is-saving', !!isSaving);
        floating.setAttribute('aria-busy', isSaving ? 'true' : 'false');
      }

      const buttons = Array.from(document.querySelectorAll([
        '#saveBtn',
        '#vizSaveLibraryBtn',
        '.floating-save-submit',
        'button[onclick*="saveLibraryUpdates"]'
      ].join(',')));
      buttons.forEach((button) => {
        if (!button) return;
        if (!button.dataset.saveIdleText) button.dataset.saveIdleText = button.textContent || 'Save';
        button.disabled = !!isSaving;
        button.classList.toggle('is-saving', !!isSaving);
        button.setAttribute('aria-busy', isSaving ? 'true' : 'false');

        const idleText = button.dataset.saveIdleText || 'Save';
        if (isSaving) {
          button.textContent = 'Saving…';
        } else {
          button.textContent = idleText;
          button.removeAttribute('aria-busy');
        }
      });
    }

    function downloadGenreBackup() {
      const payload = genresForSave();
      const stamp = new Date().toISOString().slice(0, 10);
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type:'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `genres_data_backup_${stamp}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showSaveToast('Backup JSON downloaded.', false);
    }

    async function saveLibraryUpdates() {
      finalizeListeningUpdatesBeforeSave();
      if (!libraryUpdatesPending) {
        setLibrarySaveBusy(false);
        showSaveToast('No listening updates to save.', false);
        return;
      }
      if (!appPassword) {
        setLibrarySaveBusy(false);
        openPasswordModal('library_save');
        return;
      }
      setLibrarySaveBusy(true);
      try {
        await doSaveWithPassword(appPassword);
        libraryUpdatesPending = false;
        stagedQueueReactionKeys.clear();
        toggleLibrarySaveButton(false);
        setUnsavedState(false);
        { const restore = preserveScrollSnapshot(); renderVisuals(); restore(); }
        if (currentGenre && document.getElementById('screen-listen')?.classList.contains('active')) {
          const restore = preserveScrollSnapshot();
          loadListenScreen(currentGenre, { preserveDirty: false, skipSpotifyHydration: true });
          applyDetailEditMode(detailEditMode);
          resetListenDirtySnapshot();
          restore();
        }
        const status = document.getElementById('vizRefreshStatus');
        if (status) status.textContent = 'Library updates saved.';
        showSaveToast('Library updates saved.', false);
      } catch(e) {
        if (e && (e.code === 'STALE_DATA' || e.code === 'NO_REVISION')) {
          showSaveToast('Newer data exists elsewhere — reload before saving.', true);
          return;
        }
        if (e && e.code === 'AUTH_FAILED') {
          appPassword = '';
          openPasswordModal('library_save');
          passwordNotice.textContent = 'That password did not work.';
          return;
        }
        showSaveToast(`Library save failed: ${e?.message || 'Unknown Worker error.'}`, true);
      } finally {
        setLibrarySaveBusy(false);
      }
    }

    async function refreshVisualMetadata() {
      const button = document.getElementById('vizRefreshBtn');
      const status = document.getElementById('vizRefreshStatus');

      if (spotifyRefreshRunning) {
        spotifyRefreshCancelRequested = true;
        if (status) status.textContent = 'Stopping Spotify refresh after the current track…';
        return;
      }

      if (Date.now() < spotifyRefreshPausedUntil) {
        updateSpotifyPauseDisplay();
        return;
      }

      const items = visualRefreshScopeItems();
      const scopeLabel = visualRefreshScopeLabel();
      const allMetadataRows = collectMetadataRows(items);
      const skippedBulkRows = allMetadataRows.filter(row => row.bulkSkipped);
      const allRows = allMetadataRows.filter(row => row.group === 'spotify' && !row.bulkSkipped);
      if (!allRows.length) {
        if (status) status.textContent = skippedBulkRows.length
          ? `No bulk-refreshable Spotify tracks remain in ${scopeLabel}. Resource-missing tracks were skipped; use Retry Track or Edit URL in the Broken queue.`
          : `No valid Spotify tracks are currently missing official metadata in ${scopeLabel}.`;
        openMetadataQueue('broken', vizMode());
        return;
      }

      const rows = allRows.slice(0, 5);
      spotifyRefreshRunning = true;
      spotifyRefreshCancelRequested = false;
      spotifyRefreshReport = { updated:0, attempted:0, remaining:allRows.length, broken:0, rateLimited:0, failed:0, stopped:false, pausedSeconds:0, scope:scopeLabel };
      if (button) button.textContent = '■ Stop Refresh';

      try {
        for (let i = 0; i < rows.length; i += 1) {
          if (spotifyRefreshCancelRequested) {
            spotifyRefreshReport.stopped = true;
            break;
          }
          const row = rows[i];
          spotifyRefreshReport.attempted += 1;
          if (status) status.innerHTML = `<div class="viz-refresh-progress"><div>Refreshing ${escapeHtml(scopeLabel)}… ${i + 1} / ${rows.length} (${allRows.length} initially pending in this scope)</div><div class="viz-refresh-bar"><span style="width:${Math.round(((i + 1) / rows.length) * 100)}%"></span></div><div class="small">Only five tracks are attempted per run to protect your Spotify API quota.</div></div>`;

          const result = await fetchSpotifyTrackResult(row.song.url, true);
          if (result.ok) {
            const target = findSongForMetadataAction(row.genre.id, songIdentity(row.song));
            if (target) {
              applyOfficialSpotifyMetadata(target.song, result.track);
              target.genre.songs_listened = target.songs;
              spotifyRefreshReport.updated += 1;
              spotifyMetadataFailures.delete(row.key);
            }
          } else if (result.code === 'rate_limited') {
            spotifyMetadataFailures.set(row.key, result);
            spotifyRefreshReport.rateLimited = 1;
            spotifyRefreshReport.pausedSeconds = result.retryAfterSeconds || 30;
            spotifyRefreshReport.stopped = true;
            beginSpotifyPause(spotifyRefreshReport.pausedSeconds);
            break;
          } else {
            spotifyMetadataFailures.set(row.key, result);
            if (result.code === 'broken') spotifyRefreshReport.broken += 1;
            else spotifyRefreshReport.failed += 1;
          }

          await waitForSpotifyPacing();
        }

        spotifyRefreshReport.remaining = collectMetadataRows(visualRefreshScopeItems()).filter(row => row.group === 'spotify' && !row.bulkSkipped).length;
        renderHistory();
        renderRankings();
        renderVisuals();

        if (spotifyRefreshReport.updated > 0) {
          libraryUpdatesPending = true;
          setUnsavedState(true);
          toggleLibrarySaveButton(true);
        }

        if (spotifyRefreshReport.rateLimited) {
          updateSpotifyPauseDisplay();
          showSaveToast('Spotify paused requests. Save any completed updates; do not retry until the countdown ends.', false);
        } else if (spotifyRefreshReport.updated > 0) {
          if (status) status.innerHTML = `<span class="viz-library-save-callout">Updated ${spotifyRefreshReport.updated} Spotify track${spotifyRefreshReport.updated === 1 ? '' : 's'} in ${escapeHtml(scopeLabel)}. Click Save Library Updates, then run another batch later.</span>`;
          showSaveToast('Spotify metadata batch complete — save library updates to persist it.', false);
        } else if (status) {
          status.textContent = 'No tracks were updated. Check the Missing Metadata Queue below.';
        }
      } finally {
        spotifyRefreshRunning = false;
        spotifyRefreshCancelRequested = false;
        if (button && Date.now() >= spotifyRefreshPausedUntil) {
          button.textContent = spotifyRefreshReport?.remaining ? '↺ Refresh Next 5 Spotify Tracks' : '↺ Refresh Next 5 Spotify Tracks';
        }
      }
    }


bootApp().catch(err => {
  console.error('App boot failed:', err);
  if (remainingCount) remainingCount.textContent = 'Could not start app. Check console.';
  showSaveToast(`App boot failed: ${err?.message || 'Unknown error'}`, true);
});
async function bootApp() {
  const params = spotifySafeTopUrl().searchParams;
  const hasSpotifyCallback = params.has('code') || params.has('error');
  // Remove stale return intents from older patched builds so they cannot trigger auth loops.
  (typeof SPOTIFY_OLD_RETURN_STORAGE_KEYS !== 'undefined' ? SPOTIFY_OLD_RETURN_STORAGE_KEYS : []).forEach(key => {
    try { sessionStorage.removeItem(key); } catch {}
    try { localStorage.removeItem(key); } catch {}
  });

  loadSpotifySession();
  if (hasSpotifyCallback) {
    await spotifyHandleCallback().catch(err => {
      console.error('Spotify callback error:', err);
      showSaveToast(`Spotify callback error: ${err?.message || 'Unknown error'}`, true);
    });
  }
  if (spotifySession?.access_token) spotifyStartPolling();
  await loadData();
}
