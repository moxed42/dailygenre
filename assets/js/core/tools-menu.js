/* Daily Genre: Tools menu -- condenses the Visuals/Review/Game Room tabs
   (the least-used screens) into a single "Tools" dropdown so the main tab
   bar stays short. Add-on only: it relocates the existing Game Room tab
   button into the dropdown and toggles the dropdown's own open state; it
   does not change how any of the three screens render or behave. */
(function () {
  "use strict";

  const TOOL_SCREEN_IDS = ["screen-viz", "screen-review", "screen-game"];

  function menu() {
    return document.getElementById("toolsMenu");
  }

  function toolsBtn() {
    return document.getElementById("tab-tools");
  }

  function isOpen() {
    const el = menu();
    return !!el && !el.classList.contains("hidden");
  }

  function closeMenu() {
    menu()?.classList.add("hidden");
    toolsBtn()?.setAttribute("aria-expanded", "false");
  }

  function openMenu() {
    menu()?.classList.remove("hidden");
    toolsBtn()?.setAttribute("aria-expanded", "true");
  }

  function toggleMenu(event) {
    event?.preventDefault();
    event?.stopPropagation();
    if (isOpen()) closeMenu();
    else openMenu();
  }

  function relocateGameRoomTab() {
    const gameTab = document.getElementById("gameRoomTab");
    const list = menu();
    if (gameTab && list && gameTab.parentElement !== list) {
      list.appendChild(gameTab);
      gameTab.classList.add("tools-menu-item");
      gameTab.setAttribute("role", "menuitem");
    }
  }

  function syncActiveState() {
    const active = document.querySelector(".screen.active");
    const isToolScreen = !!active && TOOL_SCREEN_IDS.includes(active.id);
    toolsBtn()?.classList.toggle("active", isToolScreen);
  }

  function installActiveScreenObserver() {
    const root = document.querySelector(".app") || document.body;
    if (!root) return;
    const observer = new MutationObserver((mutations) => {
      const touchedScreen = mutations.some((m) => m.target?.classList?.contains("screen"));
      if (touchedScreen) syncActiveState();
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"], subtree: true });
  }

  function boot() {
    relocateGameRoomTab();
    // Game Room's own boot() also runs on DOMContentLoaded and may create
    // its tab after this one runs; catch that load-order race.
    setTimeout(relocateGameRoomTab, 0);

    toolsBtn()?.addEventListener("click", toggleMenu);
    menu()?.addEventListener("click", (event) => {
      if (event.target.closest(".tab-btn")) closeMenu();
    });
    document.addEventListener("click", (event) => {
      if (!isOpen()) return;
      const wrap = document.getElementById("toolsWrap");
      if (wrap && !wrap.contains(event.target)) closeMenu();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isOpen()) closeMenu();
    });

    syncActiveState();
    installActiveScreenObserver();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
