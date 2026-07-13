/* Daily Genre v262 — place genre definition inside Genre DNA above aliases. */
(function installDailyGenreDnaDefinitionPlacement() {
  'use strict';

  const BUILD = 'v262';
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

  function definitionForGenre(genre) {
    return String(
      genre?.summary ??
      genre?.description ??
      genre?.genre_description ??
      genre?.genreDescription ??
      ''
    ).trim();
  }

  function ensureStyles() {
    if (document.getElementById('dg-v262-dna-definition-style')) return;
    const style = document.createElement('style');
    style.id = 'dg-v262-dna-definition-style';
    style.textContent = `
      #listenDetails .genre-identity-dna .genre-identity-definition-card {
        margin: 0 0 12px;
        padding: 13px 15px;
        border: 1px solid var(--border);
        border-radius: 14px;
        background: color-mix(in srgb, var(--surface) 88%, transparent);
      }
      #listenDetails .genre-identity-dna .genre-identity-definition-card span {
        display: block;
        margin-bottom: 5px;
        color: var(--muted);
        font-size: .72rem;
        font-weight: 900;
        letter-spacing: .08em;
        text-transform: uppercase;
      }
      #listenDetails .genre-identity-dna .genre-identity-definition-card p {
        margin: 0;
        color: var(--text);
        font-size: .96rem;
        line-height: 1.55;
      }
    `;
    document.head.appendChild(style);
  }

  function restoreDefinition() {
    const root = document.getElementById('listenDetails');
    if (!root) return false;

    // Remove the incorrect v261 header placement if it exists.
    root.querySelectorAll('.genre-identity-description-line').forEach(element => element.remove());

    const genre = currentGenreValue();
    const dna = root.querySelector('.genre-identity-dna');
    if (!genre || !dna) return false;

    const definition = definitionForGenre(genre);
    let card = dna.querySelector('.genre-identity-definition-card');

    if (!definition) {
      card?.remove();
      return false;
    }

    if (!card) {
      card = document.createElement('div');
      card.className = 'genre-identity-definition-card';
    }

    card.dataset.genreId = String(genre.id ?? genre.genre ?? '');
    card.innerHTML = `<span>Definition</span><p>${esc(definition)}</p>`;

    const aliasCard = dna.querySelector('.genre-identity-alias-card');
    const trackGrid = dna.querySelector('.genre-identity-track-grid');
    const head = dna.querySelector('.genre-identity-dna-head');

    if (aliasCard) {
      aliasCard.insertAdjacentElement('beforebegin', card);
    } else if (trackGrid) {
      trackGrid.insertAdjacentElement('beforebegin', card);
    } else if (head) {
      head.insertAdjacentElement('afterend', card);
    } else {
      dna.insertAdjacentElement('afterbegin', card);
    }

    return true;
  }

  function scheduleRestore() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      restoreDefinition();
    });
  }

  function boot() {
    ensureStyles();
    restoreDefinition();

    const listenRoot = document.getElementById('screen-listen') || document.getElementById('listenDetails');
    if (listenRoot && typeof MutationObserver === 'function') {
      observer = new MutationObserver(scheduleRestore);
      observer.observe(listenRoot, { childList: true, subtree: true });
    }

    document.addEventListener('click', (event) => {
      if (
        event.target.closest('[data-screen="listen"], #screen-listen') ||
        event.target.closest('[onclick*="openGenre"], [data-genre-id]')
      ) {
        setTimeout(restoreDefinition, 80);
        setTimeout(restoreDefinition, 180);
      }
    }, true);
  }

  window.dailyGenreDnaDefinitionDiagnostics = function diagnostics() {
    const genre = currentGenreValue();
    const root = document.getElementById('listenDetails');
    const dna = root?.querySelector('.genre-identity-dna');
    const card = dna?.querySelector('.genre-identity-definition-card');
    const alias = dna?.querySelector('.genre-identity-alias-card');
    return {
      build: BUILD,
      installed: true,
      genre: genre?.genre || '',
      definitionPresent: Boolean(definitionForGenre(genre)),
      definitionVisibleInDna: Boolean(card),
      definitionImmediatelyBeforeAliases: Boolean(card && alias && card.nextElementSibling === alias),
      headerDefinitionRemoved: !root?.querySelector('.genre-identity-description-line'),
    };
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  console.info('[Daily Genre] v262 Genre DNA definition placement installed.');
})();