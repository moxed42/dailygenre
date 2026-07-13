/* Daily Genre v261 — restore genre summary above aliases on detail pages. */
(function installDailyGenreDescriptionAboveAliases() {
  'use strict';

  const BUILD = 'v261';
  let observer = null;
  let scheduled = false;

  const esc = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  function genres() {
    return Array.isArray(window.genres) ? window.genres : [];
  }

  function currentGenreValue() {
    try {
      // eslint-disable-next-line no-eval
      const value = (0, eval)('currentGenre');
      if (value && typeof value === 'object') return value;
    } catch (_) {}

    const root = document.getElementById('listenDetails');
    const title = root?.querySelector(
      '.detail-record-card h2, .detail-record-card .genre-title, .detail-hero h2, .dc-genre-hero h2, .dc-hero-title'
    )?.textContent?.trim() || '';

    if (!title) return null;
    return genres().find(genre => String(genre?.genre || '').trim() === title) || null;
  }

  function summaryForGenre(genre) {
    return String(
      genre?.summary ??
      genre?.description ??
      genre?.genre_description ??
      genre?.genreDescription ??
      ''
    ).trim();
  }

  function titleElement(root) {
    return root?.querySelector(
      '.detail-record-card h2, .detail-record-card .genre-title, .detail-hero h2, .dc-genre-hero h2, .dc-hero-title'
    ) || null;
  }

  function ensureStyles() {
    if (document.getElementById('dg-v261-description-style')) return;
    const style = document.createElement('style');
    style.id = 'dg-v261-description-style';
    style.textContent = `
      #listenDetails .genre-identity-description-line {
        margin: 8px 0 7px;
        max-width: 78ch;
        color: var(--text);
        font-size: .96rem;
        line-height: 1.55;
      }
      #listenDetails .genre-identity-description-line + .genre-identity-alias-line {
        margin-top: 0;
      }
    `;
    document.head.appendChild(style);
  }

  function restoreDescription() {
    const root = document.getElementById('listenDetails');
    if (!root) return false;

    const title = titleElement(root);
    const genre = currentGenreValue();
    if (!title || !genre) return false;

    const summary = summaryForGenre(genre);
    let description = root.querySelector('.genre-identity-description-line');
    const alias = root.querySelector('.genre-identity-alias-line');

    if (!summary) {
      description?.remove();
      return false;
    }

    if (!description) {
      description = document.createElement('div');
      description.className = 'genre-identity-description-line';
    }

    description.dataset.genreId = String(genre.id ?? genre.genre ?? '');
    description.innerHTML = esc(summary);

    // The intended order is always:
    // genre title → genre description → aliases.
    title.insertAdjacentElement('afterend', description);
    if (alias) description.insertAdjacentElement('afterend', alias);

    return true;
  }

  function scheduleRestore() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      restoreDescription();
    });
  }

  function boot() {
    ensureStyles();
    restoreDescription();

    const listenRoot = document.getElementById('screen-listen') || document.getElementById('listenDetails');
    if (listenRoot && typeof MutationObserver === 'function') {
      observer = new MutationObserver(scheduleRestore);
      observer.observe(listenRoot, { childList: true, subtree: true, characterData: true });
    }

    document.addEventListener('click', (event) => {
      if (
        event.target.closest('[data-screen="listen"], #screen-listen') ||
        event.target.closest('[onclick*="openGenre"], [data-genre-id]')
      ) {
        setTimeout(restoreDescription, 80);
        setTimeout(restoreDescription, 180);
      }
    }, true);
  }

  window.dailyGenreDescriptionDiagnostics = function diagnostics() {
    const genre = currentGenreValue();
    const description = document.querySelector('#listenDetails .genre-identity-description-line');
    const alias = document.querySelector('#listenDetails .genre-identity-alias-line');
    return {
      build: BUILD,
      installed: true,
      genre: genre?.genre || '',
      summaryPresent: Boolean(summaryForGenre(genre)),
      descriptionVisible: Boolean(description),
      descriptionImmediatelyBeforeAliases: Boolean(description && alias && description.nextElementSibling === alias),
    };
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  console.info('[Daily Genre] v261 genre description placement installed.');
})();