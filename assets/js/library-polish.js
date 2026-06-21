/* Daily Genre Library Polish - performance rescue v8
   Purpose: keep the Today shortcut and Dig Add Songs entry point without
   boot-time MutationObserver/render loops. This file intentionally avoids
   page-wide observers and heavy Archive card rewrites. */
(function dailyGenreLibraryPolishPerformanceRescue() {
  'use strict';

  const VERSION = 'today-dig-performance-v8';
  let installed = false;
  let enhanceQueued = false;

  function $(selector, root = document) {
    return root.querySelector(selector);
  }

  function all(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function safeText(value) {
    return String(value == null ? '' : value);
  }

  function escapeHtml(value) {
    if (typeof window.escapeHtml === 'function') return window.escapeHtml(value);
    return safeText(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function toast(message, isError = false) {
    if (typeof window.showSaveToast === 'function') window.showSaveToast(message, isError);
    else console[isError ? 'warn' : 'info'](`[Daily Genre] ${message}`);
  }

  function genres() {
    return Array.isArray(window.genres) ? window.genres : [];
  }

  function localToday() {
    const now = new Date();
    return [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-');
  }

  function dateValueSafe(genre) {
    if (!genre) return '';
    if (typeof window.dateValue === 'function') return safeText(window.dateValue(genre)).slice(0, 10);
    return safeText(
      genre.date_normalized ||
      genre.datenormalized ||
      genre.listenedDate ||
      genre.listened_date ||
      genre.date ||
      genre.date_raw ||
      ''
    ).slice(0, 10);
  }

  function isLogged(genre) {
    const status = safeText(genre && genre.status).toLowerCase();
    return (status === 'listened' || status === 'veto' || safeText(genre && genre.rating).toLowerCase() === 'zanger') && !!dateValueSafe(genre);
  }

  function todaysLoggedGenres() {
    const today = localToday();
    return genres()
      .filter((genre) => isLogged(genre) && dateValueSafe(genre) === today)
      .sort((a, b) => safeText(a.genre).localeCompare(safeText(b.genre)));
  }

  function mostRecentLoggedGenre() {
    return genres()
      .filter(isLogged)
      .sort((a, b) => {
        const dateDiff = dateValueSafe(b).localeCompare(dateValueSafe(a));
        if (dateDiff) return dateDiff;
        return safeText(a.genre).localeCompare(safeText(b.genre));
      })[0] || null;
  }

  function openLibraryFallback() {
    if (typeof window.switchScreen === 'function') window.switchScreen('history', { force: true });
    else location.hash = '';
    toast('No listened genres yet — opened Library.');
  }

  function openGenre(genre, note) {
    if (!genre) return false;
    try {
      if (typeof window.openGenreDetail === 'function') {
        const ok = window.openGenreDetail(genre, false, { force: true }) !== false;
        if (ok) {
          if (note) setTimeout(() => toast(note), 30);
          queueEnhance(80);
          return true;
        }
      }
    } catch (error) {
      console.warn('[Daily Genre] openGenreDetail failed; falling back to hash.', error);
    }

    if (genre.id != null) {
      location.hash = `#genre=${encodeURIComponent(genre.id)}`;
      if (typeof window.switchScreen === 'function') window.switchScreen('listen', { force: true });
      if (note) setTimeout(() => toast(note), 30);
      queueEnhance(120);
      return true;
    }
    return false;
  }

  function openTodayOrRecent() {
    const ready = genres().length > 0;
    if (!ready) {
      toast('Genres are still loading. Trying Today again in a moment…');
      setTimeout(openTodayOrRecent, 600);
      return false;
    }

    const today = todaysLoggedGenres()[0];
    if (today) return openGenre(today, `Opened today: ${today.genre || 'today\'s genre'}.`);

    const recent = mostRecentLoggedGenre();
    if (recent) return openGenre(recent, `No genre logged today — opened most recent: ${recent.genre || 'recent genre'}.`);

    openLibraryFallback();
    return false;
  }

  function normalizeTopNavLabels() {
    const labelMap = [
      ['#topTodayBtn, #topTodayGenreBtn, .tab-today-btn', 'Today'],
      ['.tab-btn[data-screen="history"]', 'Library'],
      ['#topCrateDigBtn', 'Dig'],
      ['.tab-btn[data-screen="viz"]', 'Stats'],
      ['.tab-btn[data-screen="review"]', 'Studio'],
      ['.tab-btn[data-screen="ranking"]', 'Ranks'],
    ];

    labelMap.forEach(([selector, label]) => {
      all(selector).forEach((button) => {
        if (!button) return;
        if (!safeText(button.textContent).trim()) button.textContent = label;
        button.setAttribute('aria-label', label);
        button.title = label;
      });
    });

    const todayBtn = $('#topTodayBtn') || $('#topTodayGenreBtn') || $('.tab-today-btn');
    if (todayBtn) {
      todayBtn.id = 'topTodayBtn';
      todayBtn.type = 'button';
      todayBtn.classList.add('tab-today-btn', 'dc-global-today-btn');
      todayBtn.removeAttribute('data-screen');
    }
  }

  function currentGenreName() {
    try {
      if (typeof currentGenre !== 'undefined' && currentGenre && currentGenre.genre) return currentGenre.genre;
    } catch (_) {}
    const title = $('#listenDetails .genre-title, #listenDetails h2, #listenDetails h1');
    return safeText(title && title.textContent).trim();
  }

  function revealEditorPanel() {
    const panel = $('#listenEditPanel');
    if (!panel) return null;
    panel.classList.remove('hidden', 'collapsed', 'studio-section-collapsed', 'dc-editor-collapsed');
    panel.removeAttribute('hidden');
    panel.style.display = '';
    return panel;
  }

  function openSongEditor() {
    if (typeof window.switchScreen === 'function') window.switchScreen('listen', { force: true, preserveScroll: true });
    const panel = revealEditorPanel();
    const textarea = $('#songsListenedBulk');
    const target = textarea || panel;

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        if (textarea) {
          textarea.focus({ preventScroll: true });
          const len = textarea.value.length;
          try { textarea.setSelectionRange(len, len); } catch (_) {}
        }
      }, 220);
      toast('Add songs in the existing Songs listened editor, then use Save Changes.');
      return true;
    }

    toast('Could not find the existing song editor on this page.', true);
    return false;
  }

  function buttonHtml(extraClass = '') {
    return `<button type="button" class="btn btn-primary dg-add-songs-btn ${extraClass}" data-dg-open-song-editor>+ Add songs</button>`;
  }

  function enhanceDigPage() {
    enhanceQueued = false;
    normalizeTopNavLabels();

    const listenScreen = $('#screen-listen');
    const details = $('#listenDetails');
    if (!listenScreen || !details) return;

    const isDetailActive = listenScreen.classList.contains('active') || !!currentGenreName();
    if (!isDetailActive) return;

    // Add a compact hero/action button near the genre details.
    if (!details.querySelector('[data-dg-open-song-editor]')) {
      const target = details.querySelector('.detail-record-actions, .song-room-actions, .row, .genre-identity-head-actions') || details;
      const wrap = document.createElement('div');
      wrap.className = 'dg-add-songs-inline-wrap';
      wrap.innerHTML = buttonHtml('dg-hero-add-songs-btn');
      if (target === details) details.prepend(wrap);
      else target.appendChild(wrap);
    }

    // Add a visible callout above the listening/carousel area when possible.
    const songArea = details.querySelector('#dc-songs, .song-listening-room, .song-focus-shell, .song-focus-card, .song-carousel, .song-focus-queue');
    if (songArea && !details.querySelector('.dg-song-editor-callout')) {
      const callout = document.createElement('div');
      callout.className = 'dg-song-editor-callout';
      const name = currentGenreName();
      callout.innerHTML = `
        <div class="dg-song-editor-callout-copy">
          <strong>Add or edit songs</strong>
          <span>${name ? `Paste Spotify URLs for ${escapeHtml(name)} in the existing setup editor.` : 'Paste Spotify URLs in the existing setup editor.'}</span>
        </div>
        ${buttonHtml('')}
      `;
      songArea.parentNode.insertBefore(callout, songArea);
    }
  }

  function queueEnhance(delay = 0) {
    if (enhanceQueued) return;
    enhanceQueued = true;
    setTimeout(() => {
      if (typeof window.requestAnimationFrame === 'function') requestAnimationFrame(enhanceDigPage);
      else enhanceDigPage();
    }, delay);
  }

  function wrapHook(name, delay = 80) {
    const original = window[name];
    if (typeof original !== 'function' || original.__dgPerfV8Wrapped) return;
    const wrapped = function dailyGenrePerfV8Hook(...args) {
      const result = original.apply(this, args);
      queueEnhance(delay);
      return result;
    };
    wrapped.__dgPerfV8Wrapped = true;
    window[name] = wrapped;
  }

  function injectStyles() {
    if ($('#dgPerfV8Styles')) return;
    const style = document.createElement('style');
    style.id = 'dgPerfV8Styles';
    style.textContent = `
      .dg-add-songs-inline-wrap { display: flex; gap: 8px; flex-wrap: wrap; margin: 10px 0 12px; }
      .dg-add-songs-btn { white-space: nowrap; }
      .dg-song-editor-callout {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin: 12px 0;
        padding: 12px 14px;
        border-radius: 18px;
        border: 1px solid color-mix(in srgb, var(--accent, #d98d25) 42%, transparent);
        background: color-mix(in srgb, var(--accent-soft, #ffe0a1) 42%, var(--surface, #fff6df));
        box-shadow: inset 0 1px 0 rgba(255,255,255,.45);
      }
      .dg-song-editor-callout-copy { display: grid; gap: 3px; min-width: 0; }
      .dg-song-editor-callout-copy strong { color: var(--text, #22160d); font-weight: 950; }
      .dg-song-editor-callout-copy span { color: var(--muted, #735a3c); font-size: .88rem; line-height: 1.3; }
      @media (max-width: 680px) {
        .dg-song-editor-callout { align-items: stretch; flex-direction: column; }
        .dg-song-editor-callout .btn, .dg-add-songs-inline-wrap .btn { width: 100%; justify-content: center; }
      }
    `;
    document.head.appendChild(style);
  }

  function handleClick(event) {
    const today = event.target.closest('#topTodayBtn, #topTodayGenreBtn, .tab-today-btn.dc-global-today-btn');
    if (today) {
      event.preventDefault();
      event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
      openTodayOrRecent();
      return;
    }

    const addSongs = event.target.closest('[data-dg-open-song-editor]');
    if (addSongs) {
      event.preventDefault();
      event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
      openSongEditor();
    }
  }

  function install() {
    if (installed) return;
    installed = true;
    injectStyles();
    normalizeTopNavLabels();
    queueEnhance(40);

    document.addEventListener('click', handleClick, true);
    window.addEventListener('hashchange', () => queueEnhance(80));
    window.addEventListener('dailygenre:data-ready', () => queueEnhance(80));
    window.addEventListener('load', () => queueEnhance(120), { once: true });

    ['openGenreDetail', 'switchScreen', 'loadListenScreen', 'renderListenDetails'].forEach((name) => wrapHook(name, 90));

    window.DailyGenreToday = {
      ...(window.DailyGenreToday || {}),
      version: VERSION,
      open: openTodayOrRecent,
      todayGenres: todaysLoggedGenres,
      mostRecentGenre: mostRecentLoggedGenre,
      enhanceDig: enhanceDigPage,
    };
    window.DailyGenreDigHotfix = {
      version: VERSION,
      openSongEditor,
      enhance: enhanceDigPage,
    };

    console.info('[Daily Genre] Library polish performance rescue installed', VERSION);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();
