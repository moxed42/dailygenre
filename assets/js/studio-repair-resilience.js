/* Daily Genre Studio Repair Resilience v108
   Hotfix only: makes Studio Repair Bay inline URL updates tolerate grouped rows,
   old/empty target keys, and row metadata that changed after repair.
*/
(function () {
  "use strict";

  const VERSION = "studio-repair-resilient-v108";

  function toast(message, isError) {
    if (typeof window.showSaveToast === "function") window.showSaveToast(message, !!isError);
  }

  function decodeMaybe(value) {
    const raw = String(value || "");
    try { return decodeURIComponent(raw); } catch (_) { return raw; }
  }

  function norm(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/https?:\/\/\S+/g, " ")
      .replace(/&amp;/g, " and ")
      .replace(/\band\b/g, " and ")
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
      try { return window.normalizeSongUrl(value || ""); } catch (_) {}
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
      try { return window.inflateSongsFromStorage(raw || []); } catch (_) {}
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

  function songArtist(song) {
    return String(song?.artist || (Array.isArray(song?.artists) ? song.artists.join(", ") : "") || "").trim();
  }

  function songTitleOnly(song) {
    return String(song?.title || song?.name || song?.track || "").trim();
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
    return `meta:${songArtist(song).toLowerCase()}|${songTitleOnly(song).toLowerCase()}`;
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
    const artistRaw = songArtist(song).toLowerCase();
    const titleRaw = songTitleOnly(song).toLowerCase();
    if (artistRaw || titleRaw) add(`meta:${artistRaw}|${titleRaw}`);
    const canon = canonicalSongTitle(titleRaw);
    if (artistRaw || canon) add(`canon:${artistRaw}|${canon}`);
    add(norm([song?.spotifyId, song?.isrc, song?.spotifyUrl || song?.url, artistRaw, titleRaw].join(" ")));
    add(norm([artistRaw, titleRaw].join(" ")));
    return Array.from(keys);
  }

  function songMatchesKey(song, incomingKey) {
    const rawKey = String(incomingKey || "").trim().toLowerCase();
    const keyNorm = norm(incomingKey);
    if (!rawKey && !keyNorm) return false;
    const keys = identityKeys(song);
    if (keys.includes(rawKey) || keys.includes(keyNorm)) return true;
    const artist = norm(songArtist(song));
    const title = norm(songTitleOnly(song));
    const artistTitle = norm([artist, title].join(" "));
    if (artistTitle && (keyNorm === artistTitle || keyNorm.includes(artistTitle))) return true;
    if (artist && title && keyNorm.includes(artist) && keyNorm.includes(title)) return true;
    return false;
  }

  function parseTitleLine(line) {
    const clean = String(line || "").replace(/\s+/g, " ").trim();
    if (!clean) return { artist: "", title: "" };
    const parts = clean.split(/\s+[—–-]\s+/);
    if (parts.length >= 2) {
      return { artist: parts.shift().trim(), title: parts.join(" - ").trim() };
    }
    return { artist: "", title: clean };
  }

  function rowCandidateInfo(rowEl) {
    const titleLine = rowEl?.querySelector?.(".studio-mini-title")?.textContent || "";
    const parsed = parseTitleLine(titleLine);
    const spans = Array.from(rowEl?.querySelectorAll?.(".studio-mini-meta span") || []);
    const genreNames = spans
      .filter((span) => {
        const cls = span.className || "";
        const text = norm(span.textContent || "");
        return !/studio-repair|updated|copy/.test(cls) && text && !/^missing\b/.test(text) && !/^fit\b/.test(text) && !/^from\b/.test(text) && !/^updated\b/.test(text);
      })
      .map((span) => String(span.textContent || "").trim())
      .filter(Boolean);
    return {
      artist: parsed.artist,
      title: parsed.title,
      titleLine,
      genreNames,
      rowText: rowEl?.getAttribute?.("data-studio-text") || rowEl?.textContent || "",
    };
  }

  function genreMatches(genre, hints) {
    const idHints = new Set((hints || []).map((h) => String(h?.genreId ?? "")).filter(Boolean));
    if (idHints.size && idHints.has(String(genre?.id ?? ""))) return true;
    const nameHints = new Set((hints || []).map((h) => norm(h?.genreName || "")).filter(Boolean));
    if (!nameHints.size) return !idHints.size;
    const gName = norm(genre?.genre || "");
    return nameHints.has(gName);
  }

  function songMatchesRowInfo(song, info) {
    const rowArtist = norm(info.artist || "");
    const rowTitle = norm(info.title || info.titleLine || "");
    const sArtist = norm(songArtist(song));
    const sTitle = norm(songTitleOnly(song));
    const sCanon = norm(canonicalSongTitle(songTitleOnly(song)));
    if (rowArtist && rowTitle) {
      if (sArtist === rowArtist && (sTitle === rowTitle || sCanon === rowTitle)) return true;
      if (sArtist && rowArtist && (sArtist.includes(rowArtist) || rowArtist.includes(sArtist)) && (sTitle === rowTitle || sTitle.includes(rowTitle) || rowTitle.includes(sTitle))) return true;
    }
    const rowText = norm(info.rowText || info.titleLine || "");
    if (sArtist && sTitle && rowText.includes(sArtist) && rowText.includes(sTitle)) return true;
    return false;
  }

  function findSongTargetsFromRow(rowEl, parsedTargets) {
    const info = rowCandidateInfo(rowEl);
    const out = [];
    getGenres().forEach((genre) => {
      if (!genreMatches(genre, parsedTargets) && info.genreNames.length) {
        const gName = norm(genre?.genre || "");
        if (!info.genreNames.some((name) => norm(name) === gName)) return;
      } else if (!genreMatches(genre, parsedTargets)) {
        return;
      }
      allSongsWithLevelUps(genre).forEach((song) => {
        if (songMatchesRowInfo(song, info)) {
          out.push({ genreId: String(genre?.id ?? ""), key: appIdentity(song), source: "row" });
        }
      });
    });
    return out;
  }

  function resolveRepairTarget(target) {
    const genreId = String(target?.genreId ?? "");
    const key = String(target?.key ?? "");
    const genre = getGenres().find((g) => String(g?.id ?? "") === genreId);
    if (!genre || !key) return null;
    const song = allSongsWithLevelUps(genre).find((candidate) => songMatchesKey(candidate, key));
    if (!song) return null;
    return { genreId, key: appIdentity(song) || key };
  }

  function uniqueTargets(targets, rowEl) {
    const out = [];
    const seen = new Set();
    function add(target) {
      const genreId = String(target?.genreId || "");
      const key = String(target?.key || "");
      const id = `${genreId}::${key}`;
      if (!genreId || !key || seen.has(id)) return;
      seen.add(id);
      out.push({ genreId, key });
    }

    (targets || []).forEach((target) => add(resolveRepairTarget(target)));

    // v108 fallback: some grouped repair rows were rendered with an empty/old key.
    // Infer the song from the visible row title + genre chip instead of failing.
    if (!out.length && rowEl) {
      findSongTargetsFromRow(rowEl, targets || []).forEach(add);
    }
    return out;
  }

  function install() {
    if (typeof window.updateMetadataTrackUrlFromQueue !== "function") return false;

    window.updateStudioRepairGroupUrlFromQueue = async function updateStudioRepairGroupUrlFromQueueV108(encodedTargetsJson, inputId, button) {
      let parsed = [];
      try { parsed = JSON.parse(decodeMaybe(encodedTargetsJson || "[]")); } catch (_) { parsed = []; }

      const rowEl = button?.closest?.(".studio-mini-row-repair");
      const targets = uniqueTargets(parsed, rowEl);
      if (!targets.length) {
        const title = rowEl?.querySelector?.(".studio-mini-title")?.textContent?.trim?.() || "that repair row";
        toast(`Could not find matching repair row for ${title}. Try opening the genre once, or refresh Studio and try again.`, true);
        console.warn("Daily Genre Studio repair could not resolve row", { parsed, inputId, rowText: rowEl?.textContent });
        return;
      }

      const originalText = button?.textContent || "Update";
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
