/* Daily Genre Studio Repair Resilience v107
   Hotfix only: makes Studio Repair Bay inline URL updates tolerate grouped rows,
   older identity keys, and songs whose metadata identity changes after repair.
*/
(function () {
  "use strict";

  const VERSION = "studio-repair-resilient-v107";

  function toast(message, isError) {
    if (typeof window.showSaveToast === "function") window.showSaveToast(message, !!isError);
  }

  function decodeMaybe(value) {
    try {
      return decodeURIComponent(String(value || ""));
    } catch (_) {
      return String(value || "");
    }
  }

  function norm(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/https?:\/\/\S+/g, " ")
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function canonicalSongTitle(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/\s*[\(\[]?(?:\d{4}\s*)?(?:remaster(?:ed)?|mono|stereo|single version|single edit|radio edit|edit|version)[^\)\]]*[\)\]]?\s*$/i, "")
      .replace(/\s*-\s*(?:\d{4}\s*)?(?:remaster(?:ed)?|mono|stereo|single version|single edit|radio edit|edit|version)\s*$/i, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeSongUrl(value) {
    if (typeof window.normalizeSongUrl === "function") {
      try {
        return window.normalizeSongUrl(value || "");
      } catch (_) {}
    }
    return String(value || "").trim();
  }

  function spotifyTrackId(value) {
    const clean = normalizeSongUrl(value || "");
    const match = clean.match(/(?:spotify:track:|spotify\.com\/track\/)([A-Za-z0-9]{22})/i);
    return match ? match[1] : "";
  }

  function getGenres() {
    return Array.isArray(window.genres) ? window.genres : [];
  }

  function inflateSongs(raw) {
    if (typeof window.inflateSongsFromStorage === "function") {
      try {
        return window.inflateSongsFromStorage(raw || []);
      } catch (_) {}
    }
    return Array.isArray(raw) ? raw : [];
  }

  function allSongsWithLevelUps(genre) {
    const out = [];
    inflateSongs(genre?.songs_listened || []).forEach((song) => {
      if (!song || song.isPending) return;
      out.push(song);
      if (song.levelUp) out.push(song.levelUp);
    });
    return out;
  }

  function appIdentity(song) {
    if (typeof window.songIdentity === "function") {
      try {
        const key = window.songIdentity(song);
        if (key) return String(key).trim().toLowerCase();
      } catch (_) {}
    }
    const isrc = String(song?.isrc || "").trim().toLowerCase();
    if (isrc) return `isrc:${isrc}`;
    const sid = String(song?.spotifyId || "").trim().toLowerCase();
    if (sid) return `spotify:${sid}`;
    const url = normalizeSongUrl(song?.url || song?.spotifyUrl || "").trim().toLowerCase();
    const spotify = url.match(/spotify\.com\/track\/([a-z0-9]+)/i);
    if (spotify) return `spotify:${spotify[1].toLowerCase()}`;
    if (url) return `url:${url}`;
    return `meta:${String(song?.artist || "").trim().toLowerCase()}|${String(song?.title || "").trim().toLowerCase()}`;
  }

  function identityKeys(song) {
    const keys = new Set();
    const add = (value) => {
      const clean = String(value || "").trim().toLowerCase();
      if (clean) keys.add(clean);
    };
    add(appIdentity(song));
    const isrc = String(song?.isrc || "").trim().toLowerCase();
    if (isrc) add(`isrc:${isrc}`);
    const sid = String(song?.spotifyId || "").trim().toLowerCase();
    if (sid) add(`spotify:${sid}`);
    const url = normalizeSongUrl(song?.url || song?.spotifyUrl || "").trim().toLowerCase();
    const tid = spotifyTrackId(url);
    if (tid) add(`spotify:${tid.toLowerCase()}`);
    if (url) add(`url:${url}`);
    const artist = String(song?.artist || (Array.isArray(song?.artists) ? song.artists.join(", ") : "")).trim().toLowerCase();
    const title = String(song?.title || song?.name || "").trim().toLowerCase();
    if (artist || title) add(`meta:${artist}|${title}`);
    const canon = canonicalSongTitle(title);
    if (artist || canon) add(`canon:${artist}|${canon}`);
    add(norm([song?.spotifyId, song?.isrc, song?.spotifyUrl || song?.url, artist, title].join(" ")));
    add(norm([artist, title].join(" ")));
    return Array.from(keys);
  }

  function songMatchesKey(song, incomingKey) {
    const rawKey = String(incomingKey || "").trim().toLowerCase();
    const keyNorm = norm(incomingKey);
    if (!rawKey && !keyNorm) return false;
    const keys = identityKeys(song);
    if (keys.includes(rawKey) || keys.includes(keyNorm)) return true;
    const artist = norm(song?.artist || (Array.isArray(song?.artists) ? song.artists.join(" ") : ""));
    const title = norm(song?.title || song?.name || "");
    const artistTitle = norm([artist, title].join(" "));
    if (artistTitle && (keyNorm === artistTitle || keyNorm.includes(artistTitle))) return true;
    if (artist && title && keyNorm.includes(artist) && keyNorm.includes(title)) return true;
    return false;
  }

  function resolveRepairTarget(target) {
    const genreId = String(target?.genreId ?? "");
    const key = String(target?.key ?? "");
    const genre = getGenres().find((g) => String(g?.id ?? "") === genreId);
    if (!genre) return { genreId, key };
    const song = allSongsWithLevelUps(genre).find((candidate) => songMatchesKey(candidate, key));
    if (!song) return { genreId, key };
    return {
      genreId,
      key: appIdentity(song) || key,
    };
  }

  function uniqueTargets(targets) {
    const out = [];
    const seen = new Set();
    (targets || []).forEach((target) => {
      const resolved = resolveRepairTarget(target);
      const genreId = String(resolved.genreId || "");
      const key = String(resolved.key || "");
      const id = `${genreId}::${key}`;
      if (!genreId || !key || seen.has(id)) return;
      seen.add(id);
      out.push({ genreId, key });
    });
    return out;
  }

  function install() {
    if (typeof window.updateMetadataTrackUrlFromQueue !== "function") return false;

    window.updateStudioRepairGroupUrlFromQueue = async function updateStudioRepairGroupUrlFromQueueV107(encodedTargetsJson, inputId, button) {
      let parsed = [];
      try {
        parsed = JSON.parse(decodeMaybe(encodedTargetsJson || "[]"));
      } catch (_) {
        parsed = [];
      }
      const targets = uniqueTargets(parsed);
      if (!targets.length) {
        toast("Could not find matching repair rows. Refresh Studio and try again.", true);
        return;
      }

      const originalText = button?.textContent || "Update";
      const rowEl = button?.closest?.(".studio-mini-row-repair");
      const setBusy = (label) => {
        if (!button) return;
        button.disabled = true;
        button.classList.add("is-saving");
        button.textContent = label;
      };
      const clearBusy = () => {
        if (!button || !document.body.contains(button)) return;
        button.disabled = false;
        button.classList.remove("is-saving");
        button.textContent = originalText;
      };

      let updated = 0;
      try {
        for (let idx = 0; idx < targets.length; idx += 1) {
          const target = targets[idx];
          setBusy(targets.length > 1 ? `Updating ${idx + 1}/${targets.length}…` : "Updating…");
          await window.updateMetadataTrackUrlFromQueue(
            encodeURIComponent(target.genreId),
            encodeURIComponent(target.key),
            inputId,
            idx === 0 ? button : null,
            "review",
          );
          updated += 1;
        }
        if (rowEl) {
          rowEl.classList.add("studio-inline-updated");
          const meta = rowEl.querySelector(".studio-mini-meta");
          const old = meta?.querySelector(".studio-inline-group-updated-chip");
          const label = `updated ${updated} ${updated === 1 ? "copy" : "copies"} · save pending`;
          if (old) old.textContent = label;
          else meta?.insertAdjacentHTML("afterbegin", `<span class="studio-inline-group-updated-chip">${label}</span>`);
        }
        if (updated > 1) toast(`Updated ${updated} matching copies — Save cleanup to persist.`, false);
      } finally {
        clearBusy();
      }
    };

    window.DailyGenreStudioRepairResilience = { version: VERSION };
    return true;
  }

  function boot(attempt = 0) {
    if (install()) return;
    if (attempt < 30) window.setTimeout(() => boot(attempt + 1), 100);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => boot());
  else boot();
})();
