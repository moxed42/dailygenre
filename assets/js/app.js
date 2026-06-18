const DATA_URL = 'https://raw.githubusercontent.com/moxed42/dailygenre/main/genres_data.json';
    const DATA_API_URL = 'https://api.github.com/repos/moxed42/dailygenre/contents/genres_data.json?ref=main';
    const WORKER_URL = 'https://genre-spinner.sam-moxed.workers.dev/';

    const RANK_SEED = {
      'synth pop': {"rating":"4","rank_order":1},
      'glam rock': {"rating":"4","rank_order":2},
      'dance pop': {"rating":"4","rank_order":3},
      'hyperpop': {"rating":"4","rank_order":4},
      'pop metal': {"rating":"4","rank_order":5},
      'britpop': {"rating":"4","rank_order":6},
      'power pop': {"rating":"4","rank_order":7},
      'dark cabaret': {"rating":"4","rank_order":8},
      'emo rap': {"rating":"4","rank_order":9},
      'gabber': {"rating":"4","rank_order":10},
      'gothabilly': {"rating":"4","rank_order":11},
      'synth funk': {"rating":"4","rank_order":12},
      'outlaw country': {"rating":"4","rank_order":13},
      'americana': {"rating":"4","rank_order":14},
      'country folk': {"rating":"4","rank_order":15},
      'glam metal': {"rating":"4","rank_order":16},
      'funk': {"rating":"4","rank_order":17},
      'electro disco': {"rating":"4","rank_order":18},
      'sophisti-pop': {"rating":"4","rank_order":19},
      'street punk': {"rating":"4","rank_order":20},
      'post punk': {"rating":"4","rank_order":21},
      'jazz rap': {"rating":"4","rank_order":22},
      'pop rap': {"rating":"4","rank_order":23},

      'chamber pop': {"rating":"3","rank_order":1},
      'garage rock': {"rating":"3","rank_order":2},
      'symphonic metal': {"rating":"3","rank_order":3},
      'celtic folk': {"rating":"3","rank_order":4},
      'light music': {"rating":"3","rank_order":5},
      'british hip hop': {"rating":"3","rank_order":6},
      'city pop': {"rating":"3","rank_order":7},
      'heartland rock': {"rating":"3","rank_order":8},
      'traditional bluegrass': {"rating":"3","rank_order":9},
      'nintendo core': {"rating":"3","rank_order":10},
      'symphonic death metal': {"rating":"3","rank_order":11},
      'latino punk': {"rating":"3","rank_order":12},
      'melodic house': {"rating":"3","rank_order":13},
      'dansband': {"rating":"3","rank_order":14},
      'west coast jazz': {"rating":"3","rank_order":15},
      'third stream': {"rating":"3","rank_order":16},
      'grunge': {"rating":"3","rank_order":17},
      'brostep': {"rating":"3","rank_order":18},
      'horrorcore': {"rating":"3","rank_order":19},
      'west coast hip hop': {"rating":"3","rank_order":20},
      'electro hip hop': {"rating":"3","rank_order":21},
      'trouse': {"rating":"3","rank_order":22},
      'latin pop': {"rating":"3","rank_order":23},
      'trop rock': {"rating":"3","rank_order":24},
      'surf rock': {"rating":"3","rank_order":25},
      'lubbock sound': {"rating":"3","rank_order":26},
      'shibuya kei': {"rating":"3","rank_order":27},
      'chinese rock': {"rating":"3","rank_order":28},
      'quiet storm': {"rating":"3","rank_order":29},
      'detroit blues': {"rating":"3","rank_order":30},
      'synth punk': {"rating":"3","rank_order":31},
      'punk blues': {"rating":"3","rank_order":32},
      'yacht rock': {"rating":"3","rank_order":33},
      'ambient techno': {"rating":"3","rank_order":34},
      'talking blues': {"rating":"3","rank_order":35},
      'chicago blues': {"rating":"3","rank_order":36},
      'neue deutsche welle ndw': {"rating":"3","rank_order":37},
      'bloghaus': {"rating":"3","rank_order":38},
      'trip hop': {"rating":"3","rank_order":39},
      'acid rock': {"rating":"3","rank_order":40},
      'countrypolitan': {"rating":"3","rank_order":41},
      'crossover thrash': {"rating":"3","rank_order":42},
      'dark electro': {"rating":"3","rank_order":43},
      'speedcore': {"rating":"3","rank_order":44},
      'bebop': {"rating":"3","rank_order":45},
      'cpop': {"rating":"3","rank_order":46},
      'celtic rock': {"rating":"3","rank_order":47},
      'hipster hop': {"rating":"3","rank_order":48},
      'memphis rap': {"rating":"3","rank_order":49},
      'psychedelic break beat': {"rating":"3","rank_order":50},
      'jungle': {"rating":"3","rank_order":51},
      'brazilian rock': {"rating":"3","rank_order":52},
      'electro swing': {"rating":"3","rank_order":53},
      'indian pop': {"rating":"3","rank_order":54},
      'avant garde jazz': {"rating":"3","rank_order":55},
      'samba': {"rating":"3","rank_order":56},
      'punk jazz': {"rating":"3","rank_order":57},
      'beatdown hardcore': {"rating":"3","rank_order":58},
      'post prog': {"rating":"3","rank_order":59},
      'soul blues': {"rating":"3","rank_order":60},
      'psychedelic music': {"rating":"3","rank_order":61},
      'tropical house': {"rating":"3","rank_order":62},
      'crunkcore': {"rating":"3","rank_order":63},
      'sambass': {"rating":"3","rank_order":64},
      'mexican pop': {"rating":"3","rank_order":65},
      'boogie woogie': {"rating":"3","rank_order":66},
      'cosmic disco': {"rating":"3","rank_order":67},
      'hardbag': {"rating":"3","rank_order":68},
      'new mexico music': {"rating":"3","rank_order":69},
      'uk bass': {"rating":"3","rank_order":70},
      'rap core': {"rating":"3","rank_order":71},
      'garage house': {"rating":"3","rank_order":72},
      'punk pathetique': {"rating":"3","rank_order":73},
      'future garage': {"rating":"3","rank_order":74},

      'funeral doom': {"rating":"2","rank_order":1},
      'jackin house': {"rating":"2","rank_order":2},
      'melbourne bounce': {"rating":"2","rank_order":3},
      'jungletekk': {"rating":"2","rank_order":4},
      'atmospheric black metal': {"rating":"2","rank_order":5},
      'new wave classic rock': {"rating":"2","rank_order":6},
      'latin ballad': {"rating":"2","rank_order":7},
      'afro rock': {"rating":"2","rank_order":8},
      'afro house': {"rating":"2","rank_order":9},
      'power electronic': {"rating":"2","rank_order":10},
      'neoclassical metal': {"rating":"2","rank_order":11},
      'kansas city blues': {"rating":"2","rank_order":12},
      'avant garde black metal': {"rating":"2","rank_order":13},
      'iranian pop': {"rating":"2","rank_order":14},
      'rawstyle': {"rating":"2","rank_order":15},
      'booty music': {"rating":"2","rank_order":16},
      'country rap': {"rating":"2","rank_order":17},
      'turkish rock': {"rating":"2","rank_order":18},
      'manila sound': {"rating":"2","rank_order":19},
      'rage': {"rating":"2","rank_order":20},
      'crunk': {"rating":"2","rank_order":21},
      'death n roll': {"rating":"2","rank_order":22},
      'hardstyle': {"rating":"2","rank_order":23},
      'truck driving country': {"rating":"2","rank_order":24},
      'phonk': {"rating":"2","rank_order":25},
      'sludge': {"rating":"2","rank_order":26},
      'snap music': {"rating":"2","rank_order":27},
      'jerk': {"rating":"2","rank_order":28},
      'frenchcore': {"rating":"2","rank_order":29},
      'unblack metal': {"rating":"2","rank_order":30},
      'viking rock': {"rating":"2","rank_order":31},

      'noise music': {"rating":"1","rank_order":1},
      'blackened doom metal': {"rating":"1","rank_order":2},
      'intelligent drum and bass': {"rating":"1","rank_order":3},
      'dubstyle': {"rating":"1","rank_order":4},
      'drill': {"rating":"1","rank_order":5},
      'splittercore': {"rating":"1","rank_order":6},
      'footwork': {"rating":"1","rank_order":7},
      'deathgrind': {"rating":"1","rank_order":8}
    };

    let genres = [];
    let songInbox = []; // in-memory unassigned song inbox
    let currentGenre = null;
    let selectedRating = '';
    let appPassword = '';
    let archiveUiState = null;
    let detailNavList = [];
    let pendingSaveAction = null;
    let unmatchedSeeds = [];
    let monthlySortAsc = true;
    let archiveView = 'all';
    let archiveCurrentItems = [];
    let archiveCurrentLabel = 'All';
    let detailEditMode = false;
    let serverFileSha = '';
    let libraryUpdatesPending = false;
    const stagedQueueReactionKeys = new Set();
    let metadataQueueFilter = 'spotify';
    let spotifyRefreshRunning = false;
    let spotifyRefreshCancelRequested = false;
    let spotifyRefreshReport = null;
    const PENDING_SONG_NOTES_STORAGE_KEY = 'dailyGenre.pendingSongNotes.v1';
    const SPOTIFY_COOLDOWN_STORAGE_KEY = 'dailygenre.spotifyCooldownUntil';
    let spotifyRefreshPausedUntil = Number(spotifyStorageGet(SPOTIFY_COOLDOWN_STORAGE_KEY) || 0);
    let spotifyRefreshCountdownTimer = null;
    const spotifyMetadataFailures = new Map();
    let vizFocusedGenreId = '';
    let vizOpenQueue = '';
    let vizQueueLimits = { unrated: 8, metadata: 8, maintenance: 40, reviewPending: 160 };
    let vizDrilldownState = null;
    const DEFAULT_PAGE_TITLE = 'Daily Genre';

    const spinnerTrack = document.getElementById('spinnerTrack');
    const remainingCount = document.getElementById('remainingCount');
    const spinBtn = document.getElementById('spinBtn');
    const spinResult = document.getElementById('spinResult');
    const manualPanel = document.getElementById('manualPanel');
    const manualToggleBtn = document.getElementById('manualToggleBtn');

    const passwordModal = document.getElementById('passwordModal');
    const passwordInput = document.getElementById('passwordInput');
    const passwordSubmitBtn = document.getElementById('passwordSubmitBtn');
    const passwordCancelBtn = document.getElementById('passwordCancelBtn');
    const passwordNotice = document.getElementById('passwordNotice');

    function escapeHtml(value='') {
      return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
    }

    function normalizeName(s='') {
      return String(s)
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

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
        least: !!document.getElementById('monthLeastFavorite')?.checked,
        pendingSongs: normalizePendingSongs(currentGenre.pending_songs || []).map(song => ({
          key: songIdentity(song),
          pendingFrom: song.pendingFrom || ''
        }))
      });
    }

    function refreshDirtyFromSnapshot() {
      if (!currentGenre) {
        setUnsavedState(false);
        return;
      }
      setUnsavedState(buildListenSnapshot() !== lastSavedListenSnapshot);
    }

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

    function categoryLine(genre) {
      return genre.categorypath || genre.subcategory || 'Uncategorized';
    }

    function dateValue(genre) {
      return genre.date_normalized || genre.datenormalized || '';
    }

    function normalizedGenreStatus(genre) {
      return String(genre?.status || '').trim().toLowerCase();
    }

    function isGenreZanger(genre) {
      const status = normalizedGenreStatus(genre);
      const rating = String(genre?.rating || '').trim().toLowerCase();
      return status === 'veto' || status === 'zanger' || rating === 'zanger';
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
      return String(url || '')
        .replace(/^(?:🔼\s*)?LEVEL\s*UP:\s*/i, '')
        .replace(/^(?:🔼\s*)?ADD:\s*/i, '')
        .replace(/^(?:🔼\s*)?PROMOTE:\s*/i, '')
        .trim();
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

    function songIdentity(song) {
      const isrc = String(song?.isrc || '').trim().toLowerCase();
      if (isrc) return `isrc:${isrc}`;
      const spotifyId = String(song?.spotifyId || '').trim().toLowerCase();
      if (spotifyId) return `spotify:${spotifyId}`;
      const normalizedUrl = normalizeSongUrl(song?.url || '').trim().toLowerCase();
      const spotifyTrack = normalizedUrl.match(/spotify\.com\/track\/([a-z0-9]+)/i);
      if (spotifyTrack) return `spotify:${spotifyTrack[1].toLowerCase()}`;
      if (normalizedUrl) return `url:${normalizedUrl}`;
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
      const isPlaceholderUrl = /^https?:\/\/url\.com\/?$/i.test(normalizedUrl);
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
      if (!genre || !genre.rating) return '<span class="tag">Unrated</span>';
      if (String(genre.rating) === 'zanger') return '<span class="genre-zanger-badge">✕ Zanger</span>';
      const n = Number(genre.rating);
      const stars = `${'★'.repeat(n)}${'☆'.repeat(5 - n)}`;
      return `<span class="genre-star-rating" title="${escapeHtml(genreRatingLabel(genre.rating))}" aria-label="${escapeHtml(`${stars} ${genreRatingLabel(genre.rating)}`)}">${stars}</span>`;
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
    
    function syncBulkDraftIntoSongModel() {
      if (!currentGenre) return;
      const textarea = document.getElementById('songsListenedBulk');
      if (!textarea) return;
      const expected = buildSongsBulkEditorText(currentGenre);
      if (textarea.value === expected) return;
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
      const byIdentity = findOfficialSongByIdentity(key);
      if (byIdentity?.song) return byIdentity;

      // Last-resort fallback for malformed/old curation rows: compare against common identity variants
      // without reparsing the editor again. This avoids silent failures on bad ALT TAKE / LEVEL UP rows.
      const songs = inflateSongsFromStorage(currentGenre.songs_listened || []).filter(song => !song.isPending);
      currentGenre.songs_listened = songs;
      for (let index = 0; index < songs.length; index += 1) {
        const parent = songs[index];
        if (songIdentity(parent) === key || songIdentityKeys(parent).includes(String(key || '').toLowerCase())) {
          return { song: parent, parent: null, index, songs };
        }
        if (parent.levelUp && (songIdentity(parent.levelUp) === key || songIdentityKeys(parent.levelUp).includes(String(key || '').toLowerCase()))) {
          return { song: parent.levelUp, parent, index, songs };
        }
      }
      return null;
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
      const editor = button?.closest('.track-card-editor');
      const input = editor?.querySelector('[data-track-url-input]');
      const nextUrl = normalizeSongUrl(input?.value || '');
      if (!/^https?:\/\//i.test(nextUrl) && !/^spotify:track:/i.test(nextUrl)) {
        alert('Paste a valid Spotify, YouTube, or web track URL.');
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
        if (!isPendingEdit) syncBulkDraftIntoSongModel();
        const result = findEditableSongTarget(encodedKey, pendingIndex, path);
        const target = result?.song || null;

        if (!target) {
          showSaveToast('That song changed or was malformed. Reopen the card and try again.', true);
          loadListenScreen(currentGenre, { preserveDirty: true, skipSpotifyHydration: true });
          return;
        }

        const oldUrl = normalizeSongUrl(target.url || target.spotifyUrl || '');
        const nestedLevelUp = target.levelUp || null;
        const savedReason = target.reason || '';
        const savedScore = target.score;
        const savedReaction = target.reaction;
        const savedTitle = target.title || '';
        const savedArtist = target.artist || '';

        target.url = nextUrl;
        target.artwork = '';
        target.releaseDate = '';
        target.releaseYear = null;
        target.releaseSource = '';

        const isSpotifyTrack = /spotify\.com\/track\//i.test(nextUrl) || /^spotify:track:/i.test(nextUrl);
        let metadataWarning = '';

        if (isSpotifyTrack) {
          target.source = 'spotify';
          target.spotifyUrl = /^spotify:track:/i.test(nextUrl)
            ? `https://open.spotify.com/track/${spotifyTrackId(nextUrl)}`
            : nextUrl;
          target.spotifyId = spotifyTrackId(nextUrl) || target.spotifyId || '';
          target.title = savedTitle;
          target.artist = savedArtist;

          const refreshed = await fetchSpotifyTrackResult(nextUrl, true);
          if (refreshed.ok) {
            applyOfficialSpotifyMetadata(target, refreshed.track);
          } else {
            metadataWarning = refreshed.error || 'Spotify metadata could not be refreshed.';
            if (refreshed.code === 'rate_limited') beginSpotifyPause(refreshed.retryAfterSeconds || 30);
          }
        } else if (isYoutubeUrl(nextUrl)) {
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
        } else if (result?.songs) {
          currentGenre.songs_listened = result.songs;
        }

        removeLoggedSongsFromPending(currentGenre);
        const restore = preserveScrollSnapshot();
        loadListenScreen(currentGenre, { preserveDirty: true, skipSpotifyHydration: true });
        applyDetailEditMode(detailEditMode);
        restore();
        markListeningUpdatePending();
        if (metadataWarning) {
          console.warn('Track URL updated but metadata refresh failed:', metadataWarning);
          showSaveToast(`URL saved, but Spotify metadata did not refresh: ${metadataWarning}`, true);
        } else {
          showSaveToast('Track URL updated — use the floating Save button to keep it.', false);
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



    /* === Album Dive feature === */
    const ALBUM_DIVE_SLOT_DEFS = [
      ['originator', 'Originator'],
      ['breakout', 'Breakout'],
      ['archetype', 'Archetype'],
      ['consensus', 'Consensus'],
      ['popular', 'Popular'],
      ['purist', 'Purist'],
      ['cult_hit', 'Cult Hit'],
      ['modern', 'Modern']
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
      dive.lastWorkedAt = new Date().toISOString();
      if (dive.status === 'not_started') dive.status = 'active';
      markDirty();
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
      markDirty();
      loadListenScreen(currentGenre, { preserveDirty: true, skipSpotifyHydration: true });
      showSaveToast('Album Dive started — save changes to keep it.', false);
    }

    function clearAlbumDive() {
      if (!currentGenre) return;
      if (!confirm('Remove the Album Dive from this genre?')) return;
      delete currentGenre.albumDive;
      markDirty();
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
      const parsedOfficial = mergeSongMetadata(
        normalizeSongsListened(parseSongLinks(document.getElementById('songsListenedBulk').value)),
        previousOfficial
      );
      const resolvedOfficial = await resolveSpotifyTitles(parsedOfficial);
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

    const spotifyOfficialCache = new Map();

    function classifySpotifyMetadataError(message='') {
      const text = String(message || '').toLowerCase();
      if (/rate|too many|429/.test(text)) return 'rate_limited';
      if (/not found|resource|removed|unavailable|invalid|404|provide a valid|does not exist|doesn't exist|cannot find/.test(text)) return 'broken';
      return 'failed';
    }

    function spotifyFailureShouldSkipBulk(failure) {
      if (!failure) return false;
      const code = String(failure.code || '').toLowerCase();
      const text = `${failure.error || ''} ${failure.message || ''}`.toLowerCase();
      return code === 'broken' || /not found|resource|removed|unavailable|invalid|404|does not exist|doesn't exist|cannot find|provide a valid/.test(text);
    }

    async function fetchSpotifyTrackResult(urlOrId, force=false) {
      const trackRef = String(urlOrId || '').trim();
      if (!trackRef) return { ok:false, code:'broken', error:'No Spotify track URL saved.' };
      const cacheKey = normalizeSongUrl(trackRef) || trackRef;
      if (!force && spotifyOfficialCache.has(cacheKey)) return spotifyOfficialCache.get(cacheKey);

      const request = fetch(`${WORKER_URL}spotify/track?url=${encodeURIComponent(cacheKey)}`, { cache: 'no-store' })
        .then(async response => {
          const payload = await response.json().catch(() => ({}));
          if (response.ok && payload.ok && payload.track) return { ok:true, track:payload.track };
          const error = payload.error || `Spotify lookup failed (${response.status}).`;
          if (response.status === 429 || payload.code === 'RATE_LIMITED') {
            return {
              ok:false,
              code:'rate_limited',
              error,
              retryAfterSeconds: Math.max(1, Number(payload.retryAfterSeconds || 30))
            };
          }
          return { ok:false, code:classifySpotifyMetadataError(error), error };
        })
        .catch(() => ({ ok:false, code:'failed', error:'Could not reach Spotify metadata service.' }));

      if (!force) spotifyOfficialCache.set(cacheKey, request);
      return request;
    }

    async function fetchSpotifyTrackMetadata(urlOrId, force=false) {
      const result = await fetchSpotifyTrackResult(urlOrId, force);
      return result.ok ? result.track : null;
    }

    function applyOfficialSpotifyMetadata(song, track) {
      if (!song || !track) return song;
      song.spotifyId = track.spotifyId || song.spotifyId || '';
      song.spotifyUrl = track.spotifyUrl || song.spotifyUrl || '';
      song.title = track.title || song.title || '';
      song.artist = track.artist || song.artist || '';
      song.artists = Array.isArray(track.artists) ? track.artists.filter(Boolean) : (song.artists || []);
      song.album = track.album || song.album || '';
      song.artwork = track.artwork || song.artwork || '';
      song.releaseDate = track.releaseDate || song.releaseDate || '';
      song.releaseYear = track.releaseYear || song.releaseYear || null;
      song.releasePrecision = track.releasePrecision || song.releasePrecision || '';
      song.releaseSource = 'Spotify';
      song.durationMs = Number(track.durationMs || 0) || song.durationMs || null;
      if (track.explicit != null) song.explicit = !!track.explicit;
      if (track.popularity != null) song.popularity = Number(track.popularity);
      if (track.trackNumber != null) song.trackNumber = Number(track.trackNumber);
      if (track.discNumber != null) song.discNumber = Number(track.discNumber);
      if (track.albumType) song.albumType = track.albumType;
      if (track.albumTotalTracks != null) song.albumTotalTracks = Number(track.albumTotalTracks);
      song.isrc = track.isrc || song.isrc || '';
      song.spotifyMetadataFetched = true;
      song.spotifyMetadataFetchedAt = new Date().toISOString();
      return song;
    }

    const spotifyOembedCache = new Map();

    async function fetchSpotifyOembed(url) {
      const trackUrl = normalizeSongUrl(url || '');
      if (!/https?:\/\/open\.spotify\.com\/track\//i.test(trackUrl)) return null;
      if (spotifyOembedCache.has(trackUrl)) return spotifyOembedCache.get(trackUrl);

      const request = fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(trackUrl)}`)
        .then(async response => {
          if (!response.ok) throw new Error(`Spotify oEmbed failed (${response.status})`);
          return response.json();
        })
        .catch(() => null);

      spotifyOembedCache.set(trackUrl, request);
      return request;
    }

    const releaseMetadataCache = new Map();

    function cleanCatalogText(value='') {
      return String(value || '')
        .toLowerCase()
        .replace(/\([^)]*\)/g, ' ')
        .replace(/\b(remaster(?:ed)?|version|edit|single|radio|mono|stereo)\b/g, ' ')
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    function catalogTrackQueryTitle(song) {
      const raw = String(song?.title || '').trim();
      const parts = raw.split(/\s+[—–]\s+/);
      if (parts.length > 1 && song?.artist && cleanCatalogText(parts[0]).includes(cleanCatalogText(song.artist))) {
        return parts.slice(1).join(' ');
      }
      return raw;
    }

    async function fetchSongReleaseMetadata(song) {
      if (!song || song.releaseYear || !song.artist || !song.title) return null;
      const track = catalogTrackQueryTitle(song);
      const cacheKey = `${cleanCatalogText(song.artist)}|${cleanCatalogText(track)}`;
      if (!cacheKey || cacheKey === '|') return null;
      if (releaseMetadataCache.has(cacheKey)) return releaseMetadataCache.get(cacheKey);

      const lookup = fetch(`https://itunes.apple.com/search?media=music&entity=song&limit=12&term=${encodeURIComponent(`${song.artist} ${track}`)}`)
        .then(async response => {
          if (!response.ok) throw new Error('Catalog lookup failed');
          const payload = await response.json();
          const wantedArtist = cleanCatalogText(song.artist);
          const wantedTrack = cleanCatalogText(track);
          const candidates = Array.isArray(payload.results) ? payload.results : [];
          const scored = candidates.map(item => {
            const itemArtist = cleanCatalogText(item.artistName);
            const itemTrack = cleanCatalogText(item.trackName);
            let score = 0;
            if (itemTrack === wantedTrack) score += 6;
            else if (itemTrack.includes(wantedTrack) || wantedTrack.includes(itemTrack)) score += 3;
            if (itemArtist === wantedArtist) score += 5;
            else if (itemArtist.includes(wantedArtist) || wantedArtist.includes(itemArtist)) score += 2;
            return { item, score };
          }).sort((a, b) => b.score - a.score);
          const best = scored[0];
          if (!best || best.score < 5 || !best.item.releaseDate) return null;
          const year = Number(String(best.item.releaseDate).slice(0, 4));
          if (!Number.isInteger(year)) return null;
          return { releaseDate: best.item.releaseDate, releaseYear: year, releaseSource: 'catalog match' };
        })
        .catch(() => null);

      releaseMetadataCache.set(cacheKey, lookup);
      return lookup;
    }

    async function enrichSongReleaseMetadata(song) {
      if (!song || song.releaseYear) return song;
      const data = await fetchSongReleaseMetadata(song);
      if (data) {
        song.releaseDate = data.releaseDate || song.releaseDate || '';
        song.releaseYear = data.releaseYear || song.releaseYear || null;
        song.releaseSource = data.releaseSource || song.releaseSource || '';
      }
      return song;
    }

    function applySpotifyMetadata(song, data) {
      if (!song || !data) return song;
      const raw = data.title || '';
      const clean = raw.split(/[·\u2013\u2014]/)[0].trim() || raw;
      if (clean && !song.title) song.title = clean;
      if (data.author_name && !song.artist) song.artist = data.author_name;
      if (data.thumbnail_url) song.artwork = data.thumbnail_url;
      return song;
    }

    async function hydrateGenreSpotifyArtwork(genre) {
      if (!genre) return false;
      let changed = false;

      const priorSongs = JSON.stringify(genre.songs_listened || []);
      const enrichedSongs = await resolveSpotifyTitles(inflateSongsFromStorage(genre.songs_listened || []));
      if (JSON.stringify(enrichedSongs) !== priorSongs) {
        genre.songs_listened = enrichedSongs;
        changed = true;
      }

      const priorPending = JSON.stringify(genre.pending_songs || []);
      const enrichedPending = await resolveSpotifyTitles(normalizePendingSongs(genre.pending_songs || []));
      if (JSON.stringify(enrichedPending) !== priorPending) {
        genre.pending_songs = enrichedPending;
        changed = true;
      }

      if (genre.favoritesongurl && genre.favoritesongurl.includes('spotify.com/track/')) {
        const beforeFavorite = JSON.stringify([genre.favoritesong || '', genre.favoriteartist || '', genre.favoritesongartwork || '']);
        const official = await fetchSpotifyTrackMetadata(genre.favoritesongurl);
        if (official) {
          genre.favoritesong = official.title || genre.favoritesong || '';
          genre.favoriteartist = official.artist || genre.favoriteartist || '';
          genre.favoritesongartwork = official.artwork || genre.favoritesongartwork || '';
        } else {
          const fallback = await fetchSpotifyOembed(genre.favoritesongurl);
          if (fallback) {
            if (!genre.favoritesong && fallback.title) genre.favoritesong = fallback.title.split(/[·\u2013\u2014]/)[0].trim() || fallback.title;
            if (fallback.author_name && !genre.favoriteartist) genre.favoriteartist = fallback.author_name;
            if (fallback.thumbnail_url) genre.favoritesongartwork = fallback.thumbnail_url;
          }
        }
        if (JSON.stringify([genre.favoritesong || '', genre.favoriteartist || '', genre.favoritesongartwork || '']) !== beforeFavorite) changed = true;
      }

      return changed;
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
                  <div class="inbox-unassigned-meta">${song.guessNote ? escapeHtml(song.guessNote) : 'No genre guessed'}</div>
                </div>
                <div class="inbox-move-row">
                  <select id="${selectId}" aria-label="Route to genre">
                    <option value="">Choose genre…</option>
                    ${(genres||[]).filter(g=>g&&g.genre).sort((a,b)=>String(a.genre).localeCompare(String(b.genre))).map(g=>`<option value="${escapeHtml(String(g.id))}">${escapeHtml(g.genre)}</option>`).join('')}
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
            <p class="small" style="margin:6px 0 0;">Paste a Spotify URL or type Artist — Title. We'll try to guess the right genre and route it to pending.</p>
          </div>
        </div>
        <div class="inbox-input-row">
          <input type="text" id="inboxSongInput" placeholder="https://open.spotify.com/track/… or Artist — Title" onkeydown="if(event.key==='Enter')addToSongInbox()">
          <button type="button" class="btn btn-primary" onclick="addToSongInbox()">Add to Inbox</button>
        </div>
        <div class="inbox-result" id="inboxResult"></div>
        ${unassignedHtml}
      </div>`;
    }

    async function addToSongInbox() {
      const input = document.getElementById('inboxSongInput');
      const resultEl = document.getElementById('inboxResult');
      if (!input || !resultEl) return;
      const raw = input.value.trim();
      if (!raw) return;

      resultEl.className = 'inbox-result';
      resultEl.textContent = 'Looking up track…';

      let song = { url: '', title: '', artist: '', artwork: '', spotifyId: '', guessNote: '' };
      const spotifyMatch = raw.match(/spotify\.com\/track\/([a-z0-9]+)/i);

      if (spotifyMatch) {
        // Fetch via existing worker
        const track = await fetchSpotifyTrackMetadata(raw);
        if (track) {
          song.url = track.spotifyUrl || raw;
          song.title = track.title || '';
          song.artist = track.artist || '';
          song.artwork = track.artwork || '';
          song.spotifyId = track.spotifyId || spotifyMatch[1];
          song.album = track.album || '';
          song.durationMs = track.durationMs || null;
          song.releaseYear = track.releaseYear || null;
          song.isrc = track.isrc || '';
          song.source = 'spotify';
        } else {
          song.url = raw;
          song.source = 'spotify';
          // Try oembed fallback
          const oembed = await fetchSpotifyOembed(raw);
          if (oembed) {
            song.title = oembed.title || '';
            song.artist = oembed.author_name || '';
            song.artwork = oembed.thumbnail_url || '';
          }
        }
      } else {
        // Text input: try iTunes search
        song.source = 'manual';
        const dashMatch = raw.match(/^(.+?)\s*[—–-]\s*(.+)$/);
        const artist = dashMatch ? dashMatch[1].trim() : '';
        const title = dashMatch ? dashMatch[2].trim() : raw;
        song.title = title;
        song.artist = artist;
        // Try iTunes to confirm / get artwork
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
              song.album = best.collectionName || '';
              song.releaseYear = best.releaseDate ? Number(String(best.releaseDate).slice(0,4)) : null;
            }
          }
        } catch(e) {}
      }

      if (!song.title && !song.url) {
        resultEl.className = 'inbox-result err';
        resultEl.textContent = 'Could not find that track. Try a Spotify URL.';
        return;
      }

      // Guess genre using artist name fuzzy match against genre list
      const guessResult = guessGenreForSong(song);
      song.guessNote = guessResult.note;

      if (guessResult.target) {
        // Auto-route to guessed genre's pending queue
        const added = queuePendingNomination(guessResult.target, 'Song Inbox', {
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
        setUnsavedState(true);
        libraryUpdatesPending = true;
        toggleLibrarySaveButton(true);
        input.value = '';
        resultEl.className = 'inbox-result ok';
        resultEl.textContent = `✓ Routed "${song.artist ? song.artist + ' — ' : ''}${song.title}" to pending in ${guessResult.target.genre}. ${guessResult.note}`;
      } else {
        // Can't guess — add to unassigned inbox
        songInbox.push(song);
        input.value = '';
        resultEl.className = 'inbox-result';
        resultEl.textContent = `Added "${song.artist ? song.artist + ' — ' : ''}${song.title}" to unassigned inbox. ${song.guessNote}`;
      }

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
        items = items.filter(g => [
          g.genre,
          categoryLine(g),
          g.notes,
          g.favoritesong,
          g.favoritesongurl,
          songSearchText(g)
        ].join(' ').toLowerCase().includes(query));
      }

      const byGenre = (a,b) => String(a.genre || '').localeCompare(String(b.genre || ''));
      if (sort === 'oldest') items.sort((a,b) => (dateValue(a) || '').localeCompare(dateValue(b) || '') || byGenre(a,b));
      else if (sort === 'rating-desc') items.sort((a,b) => numericRating(b) - numericRating(a) || byGenre(a,b));
      else if (sort === 'rating-asc') items.sort((a,b) => numericRating(a) - numericRating(b) || byGenre(a,b));
      else if (sort === 'genre') items.sort(byGenre);
      else if (sort === 'rank') items.sort((a,b) => (a.rank_order ?? 9999) - (b.rank_order ?? 9999) || numericRating(b) - numericRating(a) || byGenre(a,b));
      else items.sort((a,b) => (dateValue(b) || '').localeCompare(dateValue(a) || '') || byGenre(a,b));

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

    function searchGenresInto(inputEl, resultsEl) {
      const q = inputEl.value.trim().toLowerCase();
      if (!q) {
        resultsEl.innerHTML = '';
        return;
      }

      const matches = genres
        .filter(g => (g.genre || '').toLowerCase().includes(q))
        .slice(0, 12);

      resultsEl.innerHTML = matches.map(g => `
        <button class="list-item" data-id="${g.id}" style="text-align:left; cursor:pointer;">
          <strong>${escapeHtml(g.genre || 'Unknown')}</strong>
          <div class="small" style="margin-top:6px;">${escapeHtml(categoryLine(g))}</div>
        </button>
      `).join('');

      [...resultsEl.querySelectorAll('[data-id]')].forEach(btn => {
        btn.onclick = () => {
          const picked = genres.find(g => String(g.id) === btn.dataset.id);
          if (!picked) return;
          openGenreDetail(picked, true);
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
      const btn = document.getElementById('saveBtn');
      const old = btn.textContent;
      btn.disabled = true;
      btn.classList.add('is-saving');
      btn.textContent = 'Saving...';
      try {
        await prepareAndSaveCurrentGenre();
      } finally {
        btn.disabled = false;
        btn.classList.remove('is-saving');
        btn.textContent = old;
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
        showSaveToast('No listening updates to save.', false);
        return;
      }
      if (!appPassword) {
        openPasswordModal('library_save');
        return;
      }
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

    function renderVisuals() {
      if (typeof Chart === 'undefined') return;
      vizDestroyAll();
      renderVisualFilters();
      renderFocusBanner();
      const baseItems = vizBaseGenres();
      const items = vizFilteredItems(baseItems), songs = vizAllOfficialSongs(items), artists = vizArtists(items), month = vizSelectedMonth();
      const reactions = vizReactionCountSummary(songs);
      const ratedSongs = reactions[1] + reactions[2] + reactions[3];
      const health = visualHealthStats(items);
      applyVizModeDisplay();
      renderGenreDossier(items);
      if (vizMode() === 'monthly') {
        vizRenderKPIs(document.getElementById('vizKpiMonthly'), [{ label:'Month', value: vizMonthTitle(month) },{ label:'Songs', value: songs.length },{ label:'Artists', value: artists.uniqueArtists },{ label:'Rated', value: `${health.ratedPct}%` },{ label:'Like rate', value: health.rated ? `${health.likeRate}%` : '—' }]);
        vizRenderRatingsContent(items);
        vizRenderHighlights(items);
        vizRenderArtistStats(items);
        vizRenderSongReactions('vizSongReactionsMonthly', items);
        vizRenderCrossovers('vizCrossoversMonthly', items, 10);
        renderNeedsAttention('vizNeedsAttentionMonthly');
        renderUnratedSongs('vizUnratedSongsMonthly', items);
        renderMetadataQueue('vizMetadataQueueMonthly', items);
        vizMonthlyCharts(items);
        renderVisualDrilldown();
      } else {
        const contenderCount = items.filter(g => !!g.monthlycontender).length;
        vizRenderKPIs(document.getElementById('vizKpiAlltime'), [{ label:'Months', value: vizMonths().length },{ label:'Genres', value: items.length },{ label:'Songs', value: songs.length },{ label:'Artists', value: artists.uniqueArtists },{ label:'Rated', value: `${health.ratedPct}%` },{ label:'Like rate', value: health.rated ? `${health.likeRate}%` : '—' },{ label:'Unrated', value: health.unrated },{ label:'Broken links', value: health.brokenLinks }]);
        vizRenderSongReactions('vizSongReactionsAll', items);
        vizRenderCrossovers('vizCrossoversAll', items, 12);
        renderNeedsAttention('vizNeedsAttentionAll');
        renderUnratedSongs('vizUnratedSongsAll', items);
        renderMetadataQueue('vizMetadataQueueAll', items);
        vizAllTimeCharts(items);
        renderVisualDrilldown();
      }
      toggleLibrarySaveButton(libraryUpdatesPending);
      if (Date.now() < spotifyRefreshPausedUntil) updateSpotifyPauseDisplay();
    }

    function initVisuals() {
      const sel = document.getElementById('vizMonthSelect');
      if (sel) {
        const months = vizMonths();
        const existing = [...sel.options].map(o => o.value);
        if (!existing.length || existing.join('|') !== months.join('|')) {
          sel.innerHTML = months.map(m => `<option value="${escapeHtml(m)}">${escapeHtml(vizMonthTitle(m))}</option>`).join('');
          if (months.length) sel.value = months[months.length - 1];
        }
      }
      document.querySelectorAll('[data-viz-mode]').forEach(btn => {
        btn.onclick = () => setVizMode(btn.dataset.vizMode || 'monthly');
      });
      document.getElementById('vizMonthSelect')?.addEventListener('change', renderVisuals);
      applyVizModeDisplay();
      renderVisuals();
    }
// SPOTIFY INTEGRATION
const SPOTIFY_CLIENT_ID = 'aa1010957e674237abf9a3508382174b';
const SPOTIFY_REDIRECT_URI = `${window.location.origin}${window.location.pathname}`;
const SPOTIFY_SCOPES = [
  'user-read-private',
  'user-read-recently-played',
  'user-read-currently-playing',
  'user-read-playback-state',
  'user-modify-playback-state',
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-private',
  'playlist-modify-public'
].join(' ');

let spotifySession = null;
let spotifyPollingInterval = null;
let spotifyNowPlayingInterval = null;

let spotifyPkceVerifierMemory = null;
let spotifyAuthStateMemory = null;

function spotifyTempStorageKey(key) {
  if (key === 'spotify-pkce-verifier') return 'spotify_pkce_verifier';
  if (key === 'spotify-auth-state') return 'spotify_auth_state';
  return key;
}

function setSpotifyTempValue(key, value) {
  const storageKey = spotifyTempStorageKey(key);
  if (key === 'spotify-pkce-verifier') spotifyPkceVerifierMemory = value;
  if (key === 'spotify-auth-state') spotifyAuthStateMemory = value;
  try { localStorage.setItem(storageKey, value); } catch {}
  try { sessionStorage.setItem(storageKey, value); } catch {}
  try { sessionStorage.setItem(key, value); } catch {}
}

function getSpotifyTempValue(key) {
  const storageKey = spotifyTempStorageKey(key);
  try {
    const value = localStorage.getItem(storageKey);
    if (value) return value;
  } catch {}
  try {
    const value = sessionStorage.getItem(storageKey);
    if (value) return value;
  } catch {}
  try {
    const value = sessionStorage.getItem(key);
    if (value) return value;
  } catch {}
  if (key === 'spotify-pkce-verifier') return spotifyPkceVerifierMemory;
  if (key === 'spotify-auth-state') return spotifyAuthStateMemory;
  return null;
}

function clearSpotifyTempValue(key) {
  const storageKey = spotifyTempStorageKey(key);
  if (key === 'spotify-pkce-verifier') spotifyPkceVerifierMemory = null;
  if (key === 'spotify-auth-state') spotifyAuthStateMemory = null;
  try { localStorage.removeItem(storageKey); } catch {}
  try { sessionStorage.removeItem(storageKey); } catch {}
  try { sessionStorage.removeItem(key); } catch {}
}

function spotifyBase64Url(bytes) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function generateSpotifyCodeVerifier() {
  if (!window.crypto?.getRandomValues) {
    throw new Error('Spotify auth requires browser crypto support. Use the HTTPS GitHub Pages URL or localhost.');
  }
  const arr = new Uint8Array(64);
  crypto.getRandomValues(arr);
  return spotifyBase64Url(arr);
}

function generateSpotifyAuthState() {
  if (window.crypto?.randomUUID) return crypto.randomUUID();
  if (!window.crypto?.getRandomValues) return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return spotifyBase64Url(arr);
}

async function generateSpotifyCodeChallenge(v) {
  if (!window.crypto?.subtle?.digest) {
    throw new Error('Spotify auth requires a secure browser context for PKCE. Open the deployed HTTPS page or localhost, not a plain file preview.');
  }
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(v));
  return spotifyBase64Url(new Uint8Array(digest));
}


function spotifySafeTopUrl() {
  try {
    if (window.top && window.top.location && window.top.location.href) {
      return new URL(window.top.location.href);
    }
  } catch {}
  return new URL(window.location.href);
}

function spotifyActiveScreenName() {
  return document.querySelector('.screen.active')?.id?.replace('screen-', '') || 'spin';
}

function spotifyBuildReturnState(options = {}) {
  const activeScreen = spotifyActiveScreenName();
  const activeGenreId = currentGenre?.id != null ? String(currentGenre.id) : '';
  const hash = activeScreen === 'listen' && activeGenreId
    ? `#genre=${encodeURIComponent(activeGenreId)}`
    : (window.location.hash || '');
  return {
    screen: options.returnScreen || activeScreen,
    hash,
    genreId: activeGenreId,
    reopenPlaylistGenreId: options.reopenPlaylistGenreId ? String(options.reopenPlaylistGenreId) : '',
    reopenPlaylistGenreIds: Array.isArray(options.reopenPlaylistGenreIds) ? options.reopenPlaylistGenreIds.map(String) : [],
    ts: Date.now()
  };
}

function spotifyRememberReturnState(options = {}) {
  const state = spotifyBuildReturnState(options);
  const raw = JSON.stringify(state);
  try { sessionStorage.setItem(SPOTIFY_RETURN_STORAGE_KEY, raw); } catch {}
  try { localStorage.setItem(SPOTIFY_RETURN_STORAGE_KEY, raw); } catch {}
  return state;
}

function spotifyReadReturnState() {
  let raw = '';
  try { raw = sessionStorage.getItem(SPOTIFY_RETURN_STORAGE_KEY) || ''; } catch {}
  if (!raw) {
    try { raw = localStorage.getItem(SPOTIFY_RETURN_STORAGE_KEY) || ''; } catch {}
  }
  if (!raw) return null;
  try {
    const state = JSON.parse(raw);
    if (!state || Date.now() - Number(state.ts || 0) > 30 * 60 * 1000) return null;
    return state;
  } catch {
    return null;
  }
}

function spotifyClearReturnState() {
  const keys = [SPOTIFY_RETURN_STORAGE_KEY].concat(typeof SPOTIFY_OLD_RETURN_STORAGE_KEYS !== 'undefined' ? SPOTIFY_OLD_RETURN_STORAGE_KEYS : []);
  keys.forEach(key => {
    try { sessionStorage.removeItem(key); } catch {}
    try { localStorage.removeItem(key); } catch {}
  });
}

function spotifyCleanCallbackUrl(returnState = null) {
  const cleanPath = `${SPOTIFY_REDIRECT_URI}${returnState?.hash || ''}`;
  try {
    if (window.top && window.top.history && window.top.location) {
      window.top.history.replaceState({}, '', cleanPath);
      return;
    }
  } catch {}
  try { window.history.replaceState({}, '', cleanPath); } catch {}
}

function spotifyNavigateToAuth(url) {
  try {
    if (window.top && window.top !== window) {
      window.top.location.href = url;
      return;
    }
  } catch {}
  window.location.href = url;
}

async function spotifyConnect(options = {}) {
  try {
    const currentUrl = spotifySafeTopUrl();
    if (currentUrl.searchParams.has('code') || currentUrl.searchParams.has('error')) {
      showSaveToast('Spotify is finishing authorization. Try again after the page settles.', true);
      return;
    }

    const now = Date.now();
    const lastStarted = Number(spotifyStorageGet(SPOTIFY_AUTH_START_STORAGE_KEY) || 0);
    if (lastStarted && now - lastStarted < SPOTIFY_AUTH_COOLDOWN_MS) {
      showSaveToast('Spotify authorization already opened. Finish that Spotify window first.', true);
      return;
    }
    spotifyStorageSet(SPOTIFY_AUTH_START_STORAGE_KEY, String(now));

    // Do not auto-reopen playlist modals after OAuth. If a scope upgrade fails or
    // Spotify returns without usable playlist permissions, auto-reopening the modal can
    // immediately launch another auth redirect and trap the browser in a loop.
    const returnOptions = options.autoReopenPlaylist ? options : {
      ...options,
      reopenPlaylistGenreId: '',
      reopenPlaylistGenreIds: []
    };
    spotifyRememberReturnState(returnOptions);
    const verifier = generateSpotifyCodeVerifier();
    const challenge = await generateSpotifyCodeChallenge(verifier);
    const state = generateSpotifyAuthState();

    setSpotifyTempValue('spotify-pkce-verifier', verifier);
    setSpotifyTempValue('spotify-auth-state', state);

    const p = new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: SPOTIFY_REDIRECT_URI,
      code_challenge_method: 'S256',
      code_challenge: challenge,
      scope: SPOTIFY_SCOPES,
      state,
      show_dialog: options.force ? 'true' : 'false'
    });

    spotifyNavigateToAuth(`https://accounts.spotify.com/authorize?${p.toString()}`);
  } catch (err) {
    spotifyStorageRemove(SPOTIFY_AUTH_START_STORAGE_KEY);
    console.error('Spotify auth start failed', err);
    showSaveToast('Spotify auth could not start. Check browser storage/privacy settings.', true);
  }
}

async function spotifyHandleCallback() {
  const url = spotifySafeTopUrl();
  const returnState = spotifyReadReturnState();
  const error = url.searchParams.get('error');
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (error) {
    spotifyStorageRemove(SPOTIFY_AUTH_START_STORAGE_KEY);
    spotifyCleanCallbackUrl(returnState);
    clearSpotifyTempValue('spotify-pkce-verifier');
    clearSpotifyTempValue('spotify-auth-state');
    spotifyClearReturnState();
    spotifyReturnStateAfterCallback = null;
    showSaveToast(`Spotify auth failed: ${error}`, true);
    return;
  }

  if (!code) return;

  const verifier = getSpotifyTempValue('spotify-pkce-verifier');
  const expectedState = getSpotifyTempValue('spotify-auth-state');

  spotifyCleanCallbackUrl(returnState);

  if (!verifier) {
    spotifyStorageRemove(SPOTIFY_AUTH_START_STORAGE_KEY);
    clearSpotifyTempValue('spotify-auth-state');
    spotifyClearReturnState();
    spotifyReturnStateAfterCallback = null;
    showSaveToast('Spotify auth failed: missing PKCE verifier. Reconnect Spotify once from this page.', true);
    return;
  }

  if (expectedState && state !== expectedState) {
    spotifyStorageRemove(SPOTIFY_AUTH_START_STORAGE_KEY);
    clearSpotifyTempValue('spotify-pkce-verifier');
    clearSpotifyTempValue('spotify-auth-state');
    spotifyClearReturnState();
    spotifyReturnStateAfterCallback = null;
    showSaveToast('Spotify auth failed: state mismatch. Reconnect Spotify once from this page.', true);
    return;
  }

  clearSpotifyTempValue('spotify-pkce-verifier');
  clearSpotifyTempValue('spotify-auth-state');
  showSaveToast('Connecting to Spotify…', false);

  try {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        grant_type: 'authorization_code',
        code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        code_verifier: verifier
      })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.access_token) {
      throw new Error(data.error_description || data.error || `Token exchange failed (HTTP ${res.status})`);
    }

    await spotifySetSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      // Spotify auth-code responses can omit scope in some browser/client flows.
      // We just requested the full Daily Genre scope set, so store that fallback to
      // avoid treating the successful callback as still missing playlist scopes.
      scope: data.scope || SPOTIFY_SCOPES
    });
    spotifyStorageRemove(SPOTIFY_AUTH_START_STORAGE_KEY);

    spotifyReturnStateAfterCallback = returnState || null;
    showSaveToast(`Spotify connected as ${spotifySession.displayName || 'you'}!`, false);
    updateSpotifyUI();
    spotifyStartPolling();
  } catch (err) {
    spotifyStorageRemove(SPOTIFY_AUTH_START_STORAGE_KEY);
    console.error('Spotify callback failed', err);
    spotifyReturnStateAfterCallback = null;
    spotifyClearReturnState();
    clearSpotifyTempValue('spotify-pkce-verifier');
    clearSpotifyTempValue('spotify-auth-state');
    showSaveToast(`Spotify connection failed: ${err.message}. Reconnect Spotify once from this page.`, true);
  }
}

const SPOTIFY_SESSION_STORAGE_KEY = 'dailygenre.spotifySession.v1';

function spotifyStorageGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function spotifyStorageSet(key, value) {
  try { localStorage.setItem(key, value); } catch {}
}

function spotifyStorageRemove(key) {
  try { localStorage.removeItem(key); } catch {}
}

function loadSpotifySession() {
  const raw = spotifyStorageGet(SPOTIFY_SESSION_STORAGE_KEY);
  if (!raw) {
    spotifySession = null;
    updateSpotifyUI();
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.access_token) throw new Error('missing token');
    spotifySession = parsed;
  } catch (err) {
    console.warn('Stored Spotify session could not be read; clearing it.', err);
    spotifySession = null;
    spotifyStorageRemove(SPOTIFY_SESSION_STORAGE_KEY);
  }

  updateSpotifyUI();
  return spotifySession;
}

async function spotifySetSession(tokenPayload) {
  const expiresIn = Number(tokenPayload?.expires_in || 3600);
  const nextSession = {
    ...(spotifySession || {}),
    access_token: tokenPayload.access_token,
    refresh_token: tokenPayload.refresh_token || spotifySession?.refresh_token || '',
    token_type: tokenPayload.token_type || 'Bearer',
    scope: String(tokenPayload.scope || spotifySession?.scope || SPOTIFY_SCOPES).trim(),
    expires_at: Date.now() + Math.max(60, expiresIn - 60) * 1000,
    connected_at: spotifySession?.connected_at || new Date().toISOString()
  };

  spotifySession = nextSession;

  try {
    const profileRes = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${nextSession.access_token}` }
    });
    if (profileRes.ok) {
      const profile = await profileRes.json().catch(() => ({}));
      nextSession.displayName = profile.display_name || profile.id || nextSession.displayName || '';
      nextSession.userId = profile.id || nextSession.userId || '';
    }
  } catch (err) {
    console.warn('Spotify profile lookup failed after auth.', err);
  }

  spotifyStorageSet(SPOTIFY_SESSION_STORAGE_KEY, JSON.stringify(nextSession));
  updateSpotifyUI();
  return nextSession;
}

function spotifyDisconnect() {
  const activeScreen = spotifyActiveScreenName();
  const activeGenreId = currentGenre?.id != null ? String(currentGenre.id) : '';
  spotifySession = null;
  spotifyStorageRemove(SPOTIFY_SESSION_STORAGE_KEY);
  spotifyStorageRemove(SPOTIFY_AUTH_START_STORAGE_KEY);
  if (spotifyPollingInterval) clearInterval(spotifyPollingInterval);
  if (spotifyNowPlayingInterval) clearInterval(spotifyNowPlayingInterval);
  spotifyPollingInterval = null;
  spotifyNowPlayingInterval = null;
  const nowPlaying = document.getElementById('spotifyNowPlaying');
  if (nowPlaying) {
    nowPlaying.innerHTML = '';
    nowPlaying.style.display = 'none';
  }
  stickyPlayerClose();
  updateSpotifyUI();
  if (activeScreen === 'listen' && activeGenreId) {
    try { history.replaceState(null, '', '#genre=' + encodeURIComponent(activeGenreId)); } catch {}
    switchScreen('listen', { force: true, preserveScroll: true });
  }
  showSaveToast('Spotify disconnected.', false);
}

async function spotifyRefreshSession() {
  loadSpotifySession();
  if (!spotifySession?.refresh_token) return null;

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      grant_type: 'refresh_token',
      refresh_token: spotifySession.refresh_token
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    console.warn('Spotify token refresh failed.', data);
    spotifyDisconnect();
    showSaveToast('Spotify session expired. Connect Spotify again.', true);
    return null;
  }

  return spotifySetSession(data);
}

async function spotifyGetAccessToken() {
  loadSpotifySession();
  if (!spotifySession?.access_token) return null;
  if (Number(spotifySession.expires_at || 0) <= Date.now() + 60000) {
    const refreshed = await spotifyRefreshSession();
    if (!refreshed?.access_token) return null;
  }
  return spotifySession.access_token;
}

async function spotifyApiFetch(path, options={}) {
  const token = await spotifyGetAccessToken();
  if (!token) throw new Error('Spotify is not connected.');

  const url = String(path).startsWith('http') ? path : `https://api.spotify.com/v1/${String(path).replace(/^\/+/, '')}`;
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    const refreshed = await spotifyRefreshSession();
    if (refreshed?.access_token) {
      headers.set('Authorization', `Bearer ${refreshed.access_token}`);
      return fetch(url, { ...options, headers });
    }
  }
  return res;
}


function spotifyTrackId(urlOrId='') {
  const raw = String(urlOrId || '').trim();
  if (!raw) return '';
  const direct = raw.match(/^[A-Za-z0-9]{22}$/);
  if (direct) return raw;
  const match = raw.match(/(?:spotify:track:|open\.spotify\.com\/track\/)([A-Za-z0-9]{22})/i);
  return match ? match[1] : '';
}

function spotifyTrackUri(urlOrId='') {
  const id = spotifyTrackId(urlOrId);
  return id ? `spotify:track:${id}` : '';
}

function spPlayBtn(song={}) {
  const url = song.spotifyUrl || song.url || '';
  const id = spotifyTrackId(url);
  if (!spotifySession?.access_token || !id) return '';
  const title = encodeURIComponent(song.title || 'Spotify track');
  const artist = encodeURIComponent(song.artist || artistLine(song) || '');
  const artwork = encodeURIComponent(song.artwork || '');
  const rawUrl = encodeURIComponent(url);
  return `<button type="button" class="sp-play-btn" title="Open in mini player" aria-label="Open in Spotify mini player" onclick="event.preventDefault(); event.stopPropagation(); stickyPlayerOpen('${rawUrl}', '${title}', '${artist}', '${artwork}')">▶</button>`;
}

function stickyPlayerOpen(encodedUrl='', encodedTitle='', encodedArtist='', encodedArtwork='') {
  if (!spotifySession?.access_token) {
    showSaveToast('Connect Spotify first to use the mini player.', true);
    return;
  }
  const rawUrl = decodeURIComponent(encodedUrl || '');
  const trackId = spotifyTrackId(rawUrl);
  if (!trackId) {
    showSaveToast('That song does not have a valid Spotify track URL.', true);
    return;
  }
  const title = decodeURIComponent(encodedTitle || '') || 'Spotify track';
  const artist = decodeURIComponent(encodedArtist || '') || '';
  const artwork = decodeURIComponent(encodedArtwork || '') || '';

  const player = document.getElementById('spotifyStickyPlayer');
  const art = document.getElementById('spotifyStickyArt');
  const titleEl = document.getElementById('spotifyStickyTitle');
  const artistEl = document.getElementById('spotifyStickyArtist');
  const embed = document.getElementById('spotifyStickyEmbed');
  if (!player || !embed) return;

  if (art) {
    art.src = artwork || '';
    art.style.visibility = artwork ? 'visible' : 'hidden';
  }
  if (titleEl) titleEl.textContent = title;
  if (artistEl) artistEl.textContent = artist;
  embed.innerHTML = `<iframe title="Spotify Embed: ${escapeHtml(title)}" src="https://open.spotify.com/embed/track/${encodeURIComponent(trackId)}?utm_source=generator&theme=0" width="100%" height="80" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
  player.classList.add('open');
  document.body.classList.add('spotify-player-open');
}

function stickyPlayerClose() {
  const player = document.getElementById('spotifyStickyPlayer');
  const embed = document.getElementById('spotifyStickyEmbed');
  if (embed) embed.innerHTML = '';
  if (player) player.classList.remove('open');
  document.body.classList.remove('spotify-player-open');
}

let spotifyPlaylistContext = null;
let spotifyPlaylistCache = [];
let spotifyReturnStateAfterCallback = null;
let archivePlaylistSelectedGenreIds = new Set();

const SPOTIFY_RETURN_STORAGE_KEY = 'dailygenre.spotifyReturn.v4';
const SPOTIFY_OLD_RETURN_STORAGE_KEYS = ['dailygenre.spotifyReturn.v1', 'dailygenre.spotifyReturn.v2', 'dailygenre.spotifyReturn.v3'];
const SPOTIFY_AUTH_START_STORAGE_KEY = 'dailygenre.spotifyAuthStart.v1';
const SPOTIFY_AUTH_COOLDOWN_MS = 2500;

const SPOTIFY_PLAYLIST_REQUIRED_SCOPES = [
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-private',
  'playlist-modify-public'
];

function spotifySessionScopeSet() {
  return new Set(String(spotifySession?.scope || '').split(/\s+/).map(s => s.trim()).filter(Boolean));
}

function spotifyMissingScopes(required = SPOTIFY_PLAYLIST_REQUIRED_SCOPES) {
  const scopes = spotifySessionScopeSet();
  return required.filter(scope => !scopes.has(scope));
}

async function spotifyEnsurePlaylistScopes(returnOptions = {}) {
  loadSpotifySession();
  if (!spotifySession?.access_token) {
    showSaveToast('Connect Spotify first, then add songs to a playlist.', true);
    await spotifyConnect({ force: true, ...returnOptions, reopenPlaylistGenreId: '', reopenPlaylistGenreIds: [] });
    return false;
  }

  // Do not preflight playlist scopes using the stored token's `scope` string.
  // Some successful Spotify callbacks/refreshes omit or preserve stale scope text,
  // which made Daily Genre think permissions were still missing and relaunch OAuth.
  // The real source of truth is the playlist API response; if Spotify returns 403,
  // we show a recoverable message instead of starting another redirect automatically.
  return true;
}

function spotifyPlaylistIsWritable(playlist) {
  if (!playlist) return false;
  const ownerId = String(playlist.owner?.id || '');
  const userId = String(spotifySession?.userId || '');
  return !!playlist.id && (playlist.collaborative || (ownerId && userId && ownerId === userId));
}

async function spotifyEnsureProfileUserId() {
  if (spotifySession?.userId) return spotifySession.userId;
  const meRes = await spotifyApiFetch('me');
  const me = await meRes.json().catch(() => ({}));
  if (!meRes.ok || !me.id) throw new Error(spotifyPlaylistApiError(me, meRes, 'read Spotify profile'));
  spotifySession.userId = me.id;
  spotifySession.displayName = me.display_name || me.id || spotifySession.displayName || '';
  spotifyStorageSet(SPOTIFY_SESSION_STORAGE_KEY, JSON.stringify(spotifySession));
  updateSpotifyUI();
  return spotifySession.userId;
}

function spotifyPlaylistApiError(data, res, action='complete that Spotify playlist action') {
  const status = Number(res?.status || 0);
  const rawMessage = data?.error?.message || data?.error_description || data?.message || '';
  const rawReason = data?.error?.reason || data?.reason || '';
  const detail = [rawMessage, rawReason].filter(Boolean).join(' / ');
  const base = detail || `Could not ${action}${status ? ` (HTTP ${status})` : ''}.`;

  if (status === 403) {
    if (/insufficient.*scope|scope/i.test(base)) {
      return `Spotify said Forbidden: ${base}. Reconnect Spotify and approve playlist permissions: playlist-modify-public and playlist-modify-private.`;
    }
    if (/developer dashboard|development mode|not registered|user.*not.*registered|quota/i.test(base)) {
      return `Spotify said Forbidden: ${base}. This usually means the Spotify app is still in Development Mode and this Spotify account is not added under the app's Users and Access list.`;
    }
    return `Spotify said Forbidden: ${base}. Use a playlist you own/collaborate on, or check Spotify app User Management if this app is still in Development Mode.`;
  }

  return base;
}

function spotifyPlaylistSongLooksLike(song, pattern) {
  const text = [song?.url, song?.spotifyUrl, song?.title, song?.artist, song?.reason, song?.sourceLabel, song?.type, song?.kind]
    .map(value => String(value || ''))
    .join(' ');
  return pattern.test(text);
}

function spotifyPlaylistCleanTitle(song, fallback='Track') {
  return String(song?.title || fallback)
    .replace(/^(?:🔼\s*)?(?:LEVEL\s*UP|ADD|PROMOTE)\s*:\s*/i, '')
    .trim() || fallback;
}

function spotifyPlaylistSongType(song, type='direct', parent=null) {
  if (type === 'add' || song?.isAdd || spotifyPlaylistSongLooksLike(song, /(?:^|\s)(?:🔼\s*)?ADD\s*:/i)) return 'add';
  if (parent || type === 'levelUp' || song?.isLevelUp || song?.levelUpFor || spotifyPlaylistSongLooksLike(song, /(?:^|\s)(?:🔼\s*)?LEVEL\s*UP\s*:/i)) return 'levelUp';
  return 'direct';
}

function spotifyPlaylistRelatedSongGroups(song) {
  const groups = [];
  const addOne = (type, value) => {
    if (!value) return;
    if (Array.isArray(value)) value.forEach(item => addOne(type, item));
    else if (typeof value === 'object') groups.push({ type, song: value });
  };
  addOne('levelUp', song?.levelUp);
  addOne('levelUp', song?.level_up);
  addOne('levelUp', song?.levelUps);
  addOne('levelUp', song?.level_ups);
  addOne('levelUp', song?.altTake);
  addOne('levelUp', song?.altTakes);
  addOne('add', song?.add);
  addOne('add', song?.adds);
  addOne('add', song?.addSongs);
  addOne('add', song?.add_songs);
  return groups;
}

function spotifyPlaylistSongRows(genre) {
  if (!genre) return [];
  const songs = inflateSongsFromStorage(genre.songs_listened || []);
  const rows = [];
  const seenObject = new WeakSet();

  const visit = (song, type='direct', parent=null) => {
    if (!song || song.isPending || typeof song !== 'object') return;
    if (seenObject.has(song)) return;
    seenObject.add(song);
    const rowType = spotifyPlaylistSongType(song, type, parent);
    const rawUrl = song.spotifyUrl || song.url || (song.spotifyId ? `https://open.spotify.com/track/${song.spotifyId}` : '');
    const url = normalizeSongUrl(rawUrl);
    const id = spotifyTrackId(url) || spotifyTrackId(song.spotifyId || '');

    if (id) {
      rows.push({
        id,
        uri: `spotify:track:${id}`,
        url: url || `https://open.spotify.com/track/${id}`,
        title: spotifyPlaylistCleanTitle(song, 'Spotify track'),
        artist: song.artist || artistLine(song) || '',
        artwork: song.artwork || '',
        score: song.score,
        type: rowType,
        sourceLabel: rowType === 'levelUp' ? 'Level Up' : (rowType === 'add' ? 'Add' : 'Direct'),
        parentTitle: parent ? songDisplayName(parent) : '',
        parentType: parent ? spotifyPlaylistSongType(parent) : '',
        parentGenreName: genre.genre || 'Unknown genre',
        genreId: genre.id != null ? String(genre.id) : '',
        genreName: genre.genre || 'Unknown genre',
        date: dateValue(genre) || '',
        platform: 'spotify'
      });
    }

    spotifyPlaylistRelatedSongGroups(song).forEach(group => visit(group.song, group.type, song));
  };

  songs.forEach(song => visit(song, spotifyPlaylistSongType(song), null));
  return rows;
}

function spotifyPlaylistSongRowsForGenres(genreList = []) {
  const rows = [];
  genreList.filter(Boolean).forEach(genre => {
    spotifyPlaylistSongRows(genre).forEach(row => rows.push(row));
  });
  return rows;
}

function spotifyPlaylistCounts(rows = []) {
  return rows.reduce((counts, row) => {
    if (row.type === 'levelUp') counts.levelUp += 1;
    else if (row.type === 'add') counts.add += 1;
    else counts.direct += 1;
    counts.total += 1;
    return counts;
  }, { total:0, direct:0, levelUp:0, add:0 });
}

function spotifyPlaylistCountsText(rows = []) {
  const counts = spotifyPlaylistCounts(rows);
  if (!counts.total) return 'No Spotify tracks';
  return [
    `${counts.direct} direct`,
    `${counts.levelUp} Level Up${counts.levelUp === 1 ? '' : 's'}`,
    `${counts.add} Add${counts.add === 1 ? '' : 's'}`
  ].join(' · ');
}

function spotifyPlaylistTypeKey(rowOrType) {
  const type = typeof rowOrType === 'string' ? rowOrType : rowOrType?.type;
  if (type === 'levelUp') return 'levelUp';
  if (type === 'add') return 'add';
  return 'direct';
}

function spotifyPlaylistSelectedRows() {
  const rows = spotifyPlaylistContext?.rows || [];
  const selected = spotifyPlaylistContext?.selected || [];
  return rows.filter((row, idx) => selected[idx] !== false);
}

function spotifyUpdatePlaylistTypeControls() {
  if (!spotifyPlaylistContext) return;
  const rows = spotifyPlaylistContext.rows || [];
  const selected = spotifyPlaylistContext.selected || [];
  const controlMap = {
    direct: 'spotifyPlaylistIncludeDirect',
    levelUp: 'spotifyPlaylistIncludeLevelUps',
    add: 'spotifyPlaylistIncludeAdds'
  };
  Object.entries(controlMap).forEach(([type, id]) => {
    const box = document.getElementById(id);
    if (!box) return;
    const indexes = rows.map((row, idx) => spotifyPlaylistTypeKey(row) === type ? idx : -1).filter(idx => idx >= 0);
    const checkedCount = indexes.filter(idx => selected[idx] !== false).length;
    box.disabled = false;
    box.checked = indexes.length > 0 && checkedCount === indexes.length;
    box.indeterminate = indexes.length > 0 && checkedCount > 0 && checkedCount < indexes.length;
    box.title = indexes.length ? `${indexes.length} ${type} track${indexes.length === 1 ? '' : 's'} in this checklist` : `No ${type} tracks found in this checklist`;
    const label = box.closest('label');
    if (label) label.classList.toggle('spotify-playlist-type-empty', indexes.length === 0);
  });
}

function spotifyPlaylistTrackCheckboxChanged(box) {
  if (!spotifyPlaylistContext || !box) return;
  const idx = Number(box.dataset.spotifyPlaylistTrack);
  if (!Number.isFinite(idx)) return;
  spotifyPlaylistContext.selected[idx] = !!box.checked;
  box.closest('.spotify-playlist-row')?.classList.toggle('is-unselected', !box.checked);
  spotifyUpdatePlaylistTypeControls();
  spotifyUpdatePlaylistIntro();
}

function spotifySetPlaylistTypeSelection(type, checked) {
  if (!spotifyPlaylistContext) return;
  const key = spotifyPlaylistTypeKey(type);
  spotifyPlaylistContext.rows.forEach((row, idx) => {
    if (spotifyPlaylistTypeKey(row) === key) spotifyPlaylistContext.selected[idx] = !!checked;
  });
  spotifyRenderPlaylistSongs();
}

function spotifyUpdatePlaylistIntro() {
  const rows = spotifyPlaylistContext?.rows || [];
  const selectedRows = spotifyPlaylistSelectedRows();
  const sourceName = spotifyPlaylistContext?.sourceName || spotifyPlaylistContext?.genreName || 'this selection';
  const intro = document.getElementById('spotifyPlaylistIntro');
  const breakdown = document.getElementById('spotifyPlaylistBreakdown');
  if (intro) {
    intro.textContent = `Add ${selectedRows.length} selected Spotify track${selectedRows.length === 1 ? '' : 's'} from ${sourceName} to an existing or new playlist.`;
  }
  if (breakdown) {
    breakdown.textContent = `${spotifyPlaylistCountsText(rows)} found · ${selectedRows.length} currently selected. Use the bulk controls or uncheck individual songs below.`;
  }
}

function spotifyRenderPlaylistSongs() {
  const rows = spotifyPlaylistContext?.rows || [];
  const songMount = document.getElementById('spotifyPlaylistSongs');
  const status = document.getElementById('spotifyPlaylistStatus');

  spotifyUpdatePlaylistIntro();
  if (!songMount) return;

  if (!rows.length) {
    songMount.innerHTML = '<div class="small">No Spotify track URLs found for this selection.</div>';
    return;
  }

  const selected = spotifyPlaylistContext.selected || rows.map(() => true);
  songMount.innerHTML = rows.map((row, idx) => {
    const typeClass = row.type === 'levelUp' ? 'levelup' : (row.type === 'add' ? 'add' : 'direct');
    const isChecked = selected[idx] !== false;
    const parentMeta = row.parentTitle ? ` <span class="spotify-playlist-relation-meta">· Level Up from: ${escapeHtml(row.parentTitle)}</span>` : '';
    const genreMeta = row.genreName ? `<span class="spotify-playlist-genre-meta">${escapeHtml(row.genreName)}</span>${row.date ? ` · ${escapeHtml(row.date)}` : ''} · ` : '';
    return `
      <label class="spotify-playlist-row ${isChecked ? '' : 'is-unselected'}">
        <input type="checkbox" data-spotify-playlist-track="${idx}" ${isChecked ? 'checked' : ''} onchange="spotifyPlaylistTrackCheckboxChanged(this)" />
        <span>
          <span class="spotify-playlist-song-title">${escapeHtml(row.title)}<span class="spotify-playlist-type-badge ${escapeHtml(typeClass)}">${escapeHtml(row.sourceLabel)}</span></span>
          <span class="spotify-playlist-song-meta">${genreMeta}${escapeHtml(row.artist || 'Unknown artist')}${row.score != null ? ` · fit ${escapeHtml(String(row.score))}/5` : ''}${parentMeta}</span>
        </span>
      </label>
    `;
  }).join('');
  spotifyUpdatePlaylistTypeControls();
  if (status) status.textContent = '';
}

function spotifyOpenPlaylistModalWithRows({ rows = [], sourceName = 'this selection', playlistName = 'Daily Genre — Playlist', contextType = 'genre', genreId = '', genreIds = [] } = {}) {
  if (!rows.length) {
    showSaveToast('No Spotify track URLs found for this selection.', true);
    return;
  }

  spotifyPlaylistContext = {
    contextType,
    genreId,
    genreIds: Array.isArray(genreIds) ? genreIds.map(String) : [],
    genreName: sourceName,
    sourceName,
    rows,
    selected: rows.map(() => true)
  };
  const modal = document.getElementById('spotifyPlaylistModal');
  const nameInput = document.getElementById('spotifyPlaylistName');
  const status = document.getElementById('spotifyPlaylistStatus');
  if (nameInput) nameInput.value = playlistName;
  if (status) status.textContent = '';
  spotifyRenderPlaylistSongs();
  if (modal) modal.classList.add('show');
  spotifyReloadPlaylists();
}

async function openSpotifyPlaylistModal(encodedGenreId='') {
  const genreId = encodedGenreId ? decodeURIComponent(encodedGenreId) : (currentGenre?.id || '');
  if (!(await spotifyEnsurePlaylistScopes({ reopenPlaylistGenreId: genreId }))) return;

  const genre = genreId ? (genres || []).find(g => String(g.id) === String(genreId)) : currentGenre;
  if (!genre) {
    showSaveToast('Open a genre first, then add it to a Spotify playlist.', true);
    return;
  }
  const rows = spotifyPlaylistSongRows(genre);
  if (!rows.length) {
    showSaveToast('This genre has no Spotify track URLs to add.', true);
    return;
  }

  spotifyOpenPlaylistModalWithRows({
    rows,
    sourceName: genre.genre || 'this genre',
    playlistName: `Daily Genre — ${genre.genre || 'Playlist'}`,
    contextType: 'genre',
    genreId: genre.id != null ? String(genre.id) : ''
  });
}

function closeSpotifyPlaylistModal() {
  document.getElementById('spotifyPlaylistModal')?.classList.remove('show');
  spotifyPlaylistContext = null;
}

function spotifyTogglePlaylistSelections() {
  if (!spotifyPlaylistContext) return;
  const selected = spotifyPlaylistContext.selected || [];
  const shouldCheck = selected.some(value => value === false);
  spotifyPlaylistContext.selected = (spotifyPlaylistContext.rows || []).map(() => shouldCheck);
  spotifyRenderPlaylistSongs();
}

async function spotifyReloadPlaylists() {
  const select = document.getElementById('spotifyPlaylistSelect');
  if (!select || !spotifySession?.access_token) return;
  select.innerHTML = '<option value="">Loading playlists…</option>';
  try {
    await spotifyEnsureProfileUserId();
    const res = await spotifyApiFetch('me/playlists?limit=50');
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(spotifyPlaylistApiError(data, res, 'load playlists'));
    spotifyPlaylistCache = Array.isArray(data.items) ? data.items.filter(Boolean) : [];
    const writable = spotifyPlaylistCache.filter(spotifyPlaylistIsWritable);
    const skipped = spotifyPlaylistCache.length - writable.length;
    select.innerHTML = '<option value="">Create a new playlist</option>' + writable
      .map(pl => `<option value="${escapeHtml(pl.id)}">${escapeHtml(pl.name || 'Untitled playlist')}${pl.tracks?.total != null ? ` (${escapeHtml(String(pl.tracks.total))})` : ''}</option>`)
      .join('');
    const status = document.getElementById('spotifyPlaylistStatus');
    if (status && skipped > 0) {
      status.textContent = `${skipped} followed playlist${skipped === 1 ? '' : 's'} hidden because Spotify will not let this app modify them.`;
    }
  } catch (err) {
    console.error('Spotify playlist load failed', err);
    select.innerHTML = '<option value="">Create a new playlist</option>';
    const status = document.getElementById('spotifyPlaylistStatus');
    if (status) status.textContent = `Could not load playlists: ${err.message || 'Unknown error'}`;
  }
}

async function spotifyCreatePlaylist(name, isPublic=false) {
  // Spotify's current Create Playlist endpoint is POST /me/playlists.
  // The older /users/{user_id}/playlists path can behave inconsistently for PKCE browser apps.
  const res = await spotifyApiFetch('me/playlists', {
    method:'POST',
    body: JSON.stringify({
      name,
      public: !!isPublic,
      description: 'Created from Daily Genre.'
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.id) throw new Error(spotifyPlaylistApiError(data, res, 'create playlist'));
  try { await spotifyEnsureProfileUserId(); } catch {}
  return data;
}

async function spotifyAddSelectedTracksToPlaylist() {
  const status = document.getElementById('spotifyPlaylistStatus');
  const button = document.getElementById('spotifyPlaylistAddBtn');
  if (!spotifyPlaylistContext) return;
  if (!(await spotifyEnsurePlaylistScopes())) return;

  const rows = spotifyPlaylistContext.rows;
  const checked = spotifyPlaylistSelectedRows();
  if (!checked.length) {
    if (status) status.textContent = 'Select at least one track.';
    return;
  }

  let playlistId = document.getElementById('spotifyPlaylistSelect')?.value || '';
  const name = (document.getElementById('spotifyPlaylistName')?.value || '').trim();
  const isPublic = !!document.getElementById('spotifyPlaylistPublic')?.checked;

  try {
    if (button) { button.disabled = true; button.textContent = 'Adding…'; }
    if (status) status.textContent = 'Preparing Spotify playlist…';

    if (!playlistId) {
      const playlist = await spotifyCreatePlaylist(name || `Daily Genre — ${spotifyPlaylistContext.genreName}`, isPublic);
      playlistId = playlist.id;
      spotifyPlaylistCache.unshift(playlist);
    } else {
      const selectedPlaylist = spotifyPlaylistCache.find(pl => String(pl.id) === String(playlistId));
      if (selectedPlaylist && !spotifyPlaylistIsWritable(selectedPlaylist)) {
        throw new Error('Spotify will not let this app modify that playlist. Pick one you own/collaborate on, or create a new playlist.');
      }
    }

    const uris = [...new Set(checked.map(row => row.uri).filter(Boolean))];
    for (let i = 0; i < uris.length; i += 100) {
      const chunk = uris.slice(i, i + 100);
      const res = await spotifyApiFetch(`playlists/${encodeURIComponent(playlistId)}/items`, {
        method:'POST',
        body: JSON.stringify({ uris: chunk })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(spotifyPlaylistApiError(data, res, 'add items'));
    }

    const countsText = spotifyPlaylistCountsText(checked);
    const duplicateNote = checked.length !== uris.length ? ` ${checked.length - uris.length} duplicate checklist entr${checked.length - uris.length === 1 ? 'y was' : 'ies were'} only added once.` : '';
    if (status) status.textContent = `Added ${uris.length} unique track${uris.length === 1 ? '' : 's'} to Spotify (${countsText}).${duplicateNote}`;
    showSaveToast(`Added ${uris.length} unique track${uris.length === 1 ? '' : 's'} to Spotify playlist.`, false);
    setTimeout(closeSpotifyPlaylistModal, 900);
  } catch (err) {
    console.error('Spotify add-to-playlist failed', err);
    const message = err.message || 'Unknown error';
    if (status) {
      if (/Forbidden/i.test(message)) {
        status.innerHTML = `${escapeHtml(`Spotify playlist failed: ${message}`)} <button type="button" class="btn-inline" onclick="spotifyReconnectForPlaylistPermissions()">Reconnect Spotify for playlist permissions</button>`;
      } else {
        status.textContent = `Spotify playlist failed: ${message}`;
      }
    }
    showSaveToast(`Spotify playlist failed: ${message}`, true);
  } finally {
    if (button) { button.disabled = false; button.textContent = 'Add to Spotify Playlist'; }
  }
}


function spotifyReconnectForPlaylistPermissions() {
  spotifySession = null;
  spotifyStorageRemove(SPOTIFY_SESSION_STORAGE_KEY);
  spotifyStorageRemove(SPOTIFY_AUTH_START_STORAGE_KEY);
  updateSpotifyUI();
  const returnOptions = spotifyPlaylistContext?.contextType === 'archive'
    ? { returnScreen: 'history' }
    : { returnScreen: spotifyActiveScreenName() };
  spotifyConnect({ force: true, ...returnOptions, reopenPlaylistGenreId: '', reopenPlaylistGenreIds: [] });
}

function spotifyRefreshPlayableButtons() {
  try {
    if (currentGenre && document.getElementById('screen-listen')?.classList.contains('active')) {
      const snapshot = preserveScrollSnapshot();
      loadListenScreen(currentGenre, { preserveDirty: true, skipSpotifyHydration: true });
      applyDetailEditMode(detailEditMode);
      snapshot();
    }
    if (document.getElementById('screen-history')?.classList.contains('active')) renderHistory();
  } catch (err) {
    console.warn('Could not refresh Spotify inline play buttons.', err);
  }
}


function updateSpotifyUI() {
  const btn = document.getElementById('spotifyConnectBtn');
  const wasConnected = btn?.classList.contains('spotify-connected') || false;
  if (!btn) return;

  if (spotifySession?.access_token) {
    const name = spotifySession.displayName ? `: ${spotifySession.displayName}` : '';
    btn.textContent = `Spotify Connected${name}`;
    btn.classList.add('spotify-connected');
    btn.title = 'Click to disconnect Spotify';
    btn.onclick = spotifyDisconnect;
  } else {
    btn.textContent = 'Connect Spotify';
    btn.classList.remove('spotify-connected');
    btn.title = 'Connect Spotify';
    btn.onclick = spotifyConnect;
  }
  const isConnected = btn.classList.contains('spotify-connected');
  if (wasConnected !== isConnected) spotifyRefreshPlayableButtons();
}

function spotifyRenderNowPlaying(track, isPlaying=false) {
  const mount = document.getElementById('spotifyNowPlaying');
  if (!mount) return;
  if (!track) {
    mount.innerHTML = spotifySession?.access_token
      ? '<div class="spotify-now-playing-inner"><div class="spotify-now-playing-text"><span class="spotify-now-playing-label">Spotify connected</span><span class="spotify-now-playing-match">Nothing playing right now.</span></div></div>'
      : '';
    mount.style.display = spotifySession?.access_token ? 'block' : 'none';
    return;
  }
  mount.style.display = 'block';

  const artists = (track.artists || []).map(a => a.name).filter(Boolean).join(', ');
  const title = [artists, track.name].filter(Boolean).join(' — ');
  const url = track.external_urls?.spotify || '';
  mount.innerHTML = `
    <div class="spotify-now-playing-inner">
      ${track.album?.images?.[2]?.url || track.album?.images?.[0]?.url ? `<img src="${escapeHtml(track.album.images[2]?.url || track.album.images[0]?.url)}" alt="" style="width:42px;height:42px;border-radius:8px;object-fit:cover;">` : ''}
      <div class="spotify-now-playing-text">
        <span class="spotify-now-playing-label">${isPlaying ? 'Now playing' : 'Last active on Spotify'}</span>
        <span class="spotify-now-playing-track">${url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(title || 'Spotify track')}</a>` : escapeHtml(title || 'Spotify track')}</span>
        <span class="spotify-now-playing-match">Spotify is connected for discovery actions.</span>
      </div>
    </div>`;
}

async function spotifyRefreshNowPlaying() {
  if (!spotifySession?.access_token) return;
  try {
    const res = await spotifyApiFetch('me/player/currently-playing');
    if (res.status === 204 || res.status === 202) {
      spotifyRenderNowPlaying(null);
      return;
    }
    const data = await res.json().catch(() => ({}));
    spotifyRenderNowPlaying(data?.item || null, !!data?.is_playing);
  } catch (err) {
    console.warn('Spotify now-playing refresh failed.', err);
  }
}

function spotifyStartPolling() {
  loadSpotifySession();
  if (!spotifySession?.access_token) return;
  updateSpotifyUI();
  if (spotifyNowPlayingInterval) clearInterval(spotifyNowPlayingInterval);
  spotifyRefreshNowPlaying();
  spotifyNowPlayingInterval = setInterval(spotifyRefreshNowPlaying, 30000);
}


document.getElementById('spotifyPlaylistModal')?.addEventListener('click', (event) => {
  if (event.target?.id === 'spotifyPlaylistModal') closeSpotifyPlaylistModal();
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

bootApp().catch(err => {
  console.error('App boot failed:', err);
  if (remainingCount) remainingCount.textContent = 'Could not start app. Check console.';
  showSaveToast(`App boot failed: ${err?.message || 'Unknown error'}`, true);
});