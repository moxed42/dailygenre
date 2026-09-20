/* Daily Genre: Pin a genre for one-tap access.
   Add-on only. Only one genre can be pinned at a time -- pinning a new one
   silently replaces whatever was pinned before. The toggle lives on the
   genre's own detail-actions row (pin/unpin there); the shortcut back to it
   lives on the Listen screen's top action row, next to Focus Mode. */
(function () {
  "use strict";

  const STORAGE_KEY = "dailyGenrePinnedGenreId";

  function pinnedId() {
    return safeStorageGet(STORAGE_KEY, "") || "";
  }

  function setPinnedId(id) {
    if (id) safeStorageSet(STORAGE_KEY, String(id));
    else safeStorageRemove(STORAGE_KEY);
  }

  function allGenres() {
    return Array.isArray(window.genres) ? window.genres : [];
  }

  function findGenreById(id) {
    if (!id) return null;
    return allGenres().find((g) => String(g?.id) === String(id)) || null;
  }

  function pinnedGenre() {
    return findGenreById(pinnedId());
  }

  function isPinned(genre) {
    const id = pinnedId();
    return !!(id && genre && String(genre.id) === id);
  }

  function togglePin(genre) {
    if (!genre) return;
    setPinnedId(isPinned(genre) ? "" : genre.id);
    renderPinToggle(genre);
    syncShortcutButton();
  }

  function renderPinToggle(genre) {
    const actions = document.querySelector("#listenDetails .detail-actions");
    if (!actions || !genre) return;
    let btn = actions.querySelector("#dgPinToggleBtn");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.id = "dgPinToggleBtn";
      btn.className = "btn btn-secondary dg-pin-toggle-btn";
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        togglePin(typeof currentGenre !== "undefined" && currentGenre ? currentGenre : genre);
      });
      actions.appendChild(btn);
    }
    const pinned = isPinned(genre);
    btn.classList.toggle("is-pinned", pinned);
    btn.textContent = pinned ? "📌 Pinned — tap to unpin" : "📌 Pin this genre";
    btn.title = pinned
      ? "Unpin this genre"
      : "Pin this genre for one-tap access from the Listen screen";
  }

  function syncShortcutButton() {
    const btn = document.getElementById("pinnedGenreShortcutBtn");
    if (!btn) return;
    const genre = pinnedGenre();
    const hasPin = !!genre;
    btn.disabled = !hasPin;
    btn.classList.toggle("is-disabled", !hasPin);
    const title = hasPin
      ? `Jump to pinned genre: ${genre.genre || "Unknown"}`
      : "Pin a genre from its own page to use this shortcut";
    btn.title = title;
    btn.setAttribute("aria-label", title);
  }

  function ensureShortcutButton() {
    if (document.getElementById("pinnedGenreShortcutBtn")) return;
    const row = document.querySelector("#listenActionsRow .listen-actions-buttons");
    if (!row) return;
    const focusBtn = document.getElementById("focusModeToggleBtn");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "pinnedGenreShortcutBtn";
    btn.className = "tab-btn tab-action-btn dg-pinned-shortcut-btn";
    btn.textContent = "📌 Pinned";
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      const genre = pinnedGenre();
      if (!genre) return;
      if (typeof window.openGenreDetail === "function") window.openGenreDetail(genre, false);
      else if (typeof window.openGenreByIdEncoded === "function") window.openGenreByIdEncoded(encodeURIComponent(String(genre.id)));
    });
    if (focusBtn && focusBtn.parentElement === row) row.insertBefore(btn, focusBtn);
    else row.appendChild(btn);
  }

  function boot() {
    ensureShortcutButton();
    syncShortcutButton();

    window.dgRegisterPostHook?.("loadListenScreen", (genre) => {
      renderPinToggle(genre);
    });
    window.dgRegisterPostHook?.("switchScreen", () => {
      syncShortcutButton();
    });

    // genres_data loads asynchronously; refresh the shortcut's label/state
    // once it's actually in, then stop polling.
    let attempts = 0;
    const poll = setInterval(() => {
      attempts += 1;
      if (allGenres().length || attempts > 40) {
        clearInterval(poll);
        syncShortcutButton();
      }
    }, 150);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
