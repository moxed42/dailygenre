/* Daily Genre Visuals / Stats polish v3.3
   Add-on-safe: no app.js or loader changes. */

function renderVisuals() {
  if (typeof Chart === "undefined") return;
  vizDestroyAll();
  renderVisualFilters();
  renderFocusBanner();
  const baseItems = vizBaseGenres();
  const items = vizFilteredItems(baseItems),
    songs = vizAllOfficialSongs(items),
    artists = vizArtists(items),
    month = vizSelectedMonth();
  const reactions = vizReactionCountSummary(songs);
  const health = visualHealthStats(items);
  applyVizModeDisplay();
  renderGenreDossier(items);
  if (vizMode() === "monthly") {
    vizRenderKPIs(document.getElementById("vizKpiMonthly"), [
      { label: "Month", value: vizMonthTitle(month) },
      { label: "Songs", value: songs.length },
      { label: "Artists", value: artists.uniqueArtists },
      { label: "Rated", value: `${health.ratedPct}%` },
      { label: "Like rate", value: health.rated ? `${health.likeRate}%` : "—" },
    ]);
    vizRenderRatingsContent(items);
    vizRenderHighlights(items);
    vizRenderArtistStats(items);
    vizRenderSongReactions("vizSongReactionsMonthly", items);
    vizRenderCrossovers("vizCrossoversMonthly", items, 10);
    renderNeedsAttention("vizNeedsAttentionMonthly");
    renderUnratedSongs("vizUnratedSongsMonthly", items);
    clearStatsMetadataQueue("vizMetadataQueueMonthly");
    vizMonthlyCharts(items);
    renderVisualDrilldown();
  } else {
    vizRenderKPIs(document.getElementById("vizKpiAlltime"), [
      { label: "Months", value: vizMonths().length },
      { label: "Genres", value: items.length },
      { label: "Songs", value: songs.length },
      { label: "Artists", value: artists.uniqueArtists },
      { label: "Rated", value: `${health.ratedPct}%` },
      { label: "Like rate", value: health.rated ? `${health.likeRate}%` : "—" },
      { label: "Unrated", value: health.unrated },
    ]);
    vizRenderSongReactions("vizSongReactionsAll", items);
    vizRenderCrossovers("vizCrossoversAll", items, 12);
    renderNeedsAttention("vizNeedsAttentionAll");
    renderUnratedSongs("vizUnratedSongsAll", items);
    clearStatsMetadataQueue("vizMetadataQueueAll");
    vizAllTimeCharts(items);
    renderVisualDrilldown();
  }
  toggleLibrarySaveButton(libraryUpdatesPending);
  if (Date.now() < spotifyRefreshPausedUntil) updateSpotifyPauseDisplay();
  statsPolishApply();
}

function initVisuals() {
  const sel = document.getElementById("vizMonthSelect");
  if (sel) {
    const months = vizMonths();
    const existing = [...sel.options].map((o) => o.value);
    if (!existing.length || existing.join("|") !== months.join("|")) {
      sel.innerHTML = months
        .map(
          (m) =>
            `<option value="${escapeHtml(m)}">${escapeHtml(vizMonthTitle(m))}</option>`,
        )
        .join("");
      if (months.length) sel.value = months[months.length - 1];
    }
  }
  document.querySelectorAll("[data-viz-mode]").forEach((btn) => {
    btn.onclick = () => setVizMode(btn.dataset.vizMode || "monthly");
  });
  document
    .getElementById("vizMonthSelect")
    ?.addEventListener("change", renderVisuals);
  document.addEventListener("click", statsMaintenanceDelegatedClick, true);
  applyVizModeDisplay();
  renderVisuals();
}

function clearStatsMetadataQueue(mountId) {
  const mount = document.getElementById(mountId);
  if (mount) mount.innerHTML = "";
}

function renderNeedsAttention(mountId) {
  const mount = document.getElementById(mountId);
  if (!mount) return;
  const stats = maintenanceStats();
  const buckets = [
    ["Pending nominations", stats.pendingRows],
    ["Unrated songs", stats.unratedRows],
    ["Prepared drafts", stats.drafts],
    ["Possible duplicates", stats.duplicates],
  ];
  mount.innerHTML = `<div class="viz-maint-grid dg-stats-maint-grid">${buckets
    .map(
      ([label, list]) =>
        `<button type="button" class="viz-maint-card" data-maint-label="${escapeHtml(label)}"><strong>${list.length}</strong><span>${escapeHtml(label)}</span></button>`,
    )
    .join(
      "",
    )}</div><div class="viz-maint-detail" id="${mountId}Detail"><span class="small">Select a box to inspect the exact songs or genres behind that count.</span></div>`;
  mount.dataset.maintenance = JSON.stringify(
    buckets.reduce((acc, [label, list]) => {
      acc[label] = list.length;
      return acc;
    }, {}),
  );
}

function statsMaintenanceDelegatedClick(event) {
  const card = event.target?.closest?.(
    "#screen-viz .viz-maint-card[data-maint-label]",
  );
  if (!card) return;
  event.preventDefault();
  event.stopPropagation();
  showMaintenanceGenres(card.dataset.maintLabel || "");
}

// Keep metadata work discoverable from old links, but route it away from Stats.
function openMetadataQueue(filter = "spotify", mode = "alltime") {
  metadataQueueFilter = ["spotify", "art", "broken", "nonspotify"].includes(
    filter,
  )
    ? filter
    : "spotify";
  if (typeof switchScreen === "function") switchScreen("review");
  const label = filter === "art" ? "missing album art" : "metadata";
  showSaveToast(
    `Metadata queues now live in Review. Open Review for ${label}.`,
    false,
  );
}

function statsPolishApply() {
  const root = document.getElementById("screen-viz");
  if (!root) return;
  root.classList.add("dg-stats-polished");

  root.querySelectorAll(".viz-card-metadata").forEach((card) => {
    card.classList.add("dg-viz-hide-card");
  });

  root
    .querySelectorAll(".viz-card-copy, .viz-chart-hint, .viz-spotlight-copy")
    .forEach((el) => {
      const text = String(el.textContent || "")
        .replace(/\s+/g, " ")
        .trim();
      if (!text) return;
      el.dataset.dgTooltipText = text;
      el.title = text;
      el.classList.add("dg-viz-tooltip-source");
      const parent = el.parentElement;
      if (parent && !parent.querySelector(":scope > .dg-viz-info")) {
        const info = document.createElement("button");
        info.type = "button";
        info.className = "dg-viz-info";
        info.title = text;
        info.setAttribute("aria-label", text);
        info.textContent = "ⓘ";
        const label = parent.querySelector(
          ":scope > .viz-card-label, :scope > .viz-spotlight-label",
        );
        label?.insertAdjacentElement("afterend", info);
      }
    });

  root.querySelectorAll(".viz-drill-actions button").forEach((btn) => {
    if (/^spotify$/i.test(String(btn.textContent || "").trim())) btn.remove();
  });
  root.querySelectorAll(".viz-drill-explain").forEach((el) => {
    const text = String(el.textContent || "")
      .replace(/\s+/g, " ")
      .trim();
    if (text) {
      el.title = text;
      el.classList.add("dg-viz-tooltip-source");
    }
  });

  root.querySelectorAll(".viz-hl-card").forEach((card) => {
    card.classList.add("dg-viz-summary-card");
  });
}

/* === Stats / Visuals polish v3.4 ===
   Analytics pass: preserve chart layout on drilldown, compress instruction copy,
   and keep maintenance/metadata work out of the Stats surface. */

function setVisualDrilldown(type, value, mode = "alltime") {
  const nextMode = mode || vizMode();
  if (nextMode && nextMode !== vizMode()) {
    _vizMode = nextMode;
    document
      .querySelectorAll("[data-viz-mode]")
      .forEach((b) =>
        b.classList.toggle(
          "active",
          (b.dataset.vizMode || "monthly") === _vizMode,
        ),
      );
    const monthSel = document.getElementById("vizMonthSelect");
    if (monthSel) monthSel.style.display = _vizMode === "monthly" ? "" : "none";
  }

  const restore =
    typeof preserveScrollSnapshot === "function"
      ? preserveScrollSnapshot()
      : null;
  vizDrilldownState = { type, value, mode: nextMode };
  renderVisuals();
  restore?.();

  const target = document.getElementById(
    visualDrilldownMountId(vizDrilldownState),
  );
  const card = target?.closest?.(".viz-card");
  card?.classList.add("dg-viz-drill-pulse");
  setTimeout(() => card?.classList.remove("dg-viz-drill-pulse"), 500);
}

function renderDecadeCoverageNote(note, decadeStats, mode) {
  if (!note) return;
  const known = Number(decadeStats?.known || 0);
  const unknown = Number(decadeStats?.unknown || 0);
  const overrides = Number(decadeStats?.overrides || 0);
  if (known) {
    note.innerHTML = `<span class="dg-viz-micro-note">${known} song${known === 1 ? "" : "s"} dated${overrides ? ` · ${overrides} override${overrides === 1 ? "" : "s"}` : ""}${unknown ? ` · <button type="button" class="viz-meta-link dg-viz-meta-link-quiet" onclick="openMetadataQueue('spotify', '${mode}')">${unknown} missing years</button>` : ""}</span>`;
  } else {
    note.innerHTML = `<span class="dg-viz-micro-note">No effective years yet${unknown ? ` · <button type="button" class="viz-meta-link dg-viz-meta-link-quiet" onclick="openMetadataQueue('spotify', '${mode}')">${unknown} songs need metadata</button>` : ""}</span>`;
  }
}

function renderVisualDrilldown() {
  clearVisualDrilldownMounts();
  if (!vizDrilldownState) return;
  const mount = document.getElementById(
    visualDrilldownMountId(vizDrilldownState),
  );
  if (!mount) return;
  const activeCard = mount.closest(".viz-card");
  activeCard?.classList.add("viz-card-selected");
  activeCard?.classList.add("viz-card-with-local-drilldown");
  activeCard?.classList.add("dg-viz-side-drill-card");

  const items = vizRowsForCurrentScope();
  const {
    title,
    rows: allRows,
    explainer,
  } = vizDrilldownRowsForState(items, vizDrilldownState);
  const totalRows = allRows.length;
  const rows = allRows.slice(0, 48);
  const modeLabel =
    vizDrilldownState.mode === "monthly"
      ? `Monthly · ${vizMonthTitle(vizSelectedMonth())}`
      : "All time";
  const focus = vizFocusedGenre();
  const focusLabel = focus ? focus.genre : "All genres";
  const rated = rows.filter((row) =>
    [1, 2, 3].includes(Number(row.song.reaction)),
  ).length;
  const fitRows = rows.filter((row) => Number(row.song.score));
  const avgFit = fitRows.length
    ? (
        fitRows.reduce(
          (sum, row) => sum + (Number(row.song.score || 0) || 0),
          0,
        ) / fitRows.length
      ).toFixed(1)
    : "—";

  mount.innerHTML = `<div class="viz-drilldown is-active dg-viz-side-drill"><div class="viz-drilldown-head"><div><div class="eyebrow" style="margin:0;">Selected crate · ${escapeHtml(modeLabel)}</div><strong>${escapeHtml(title)}</strong><div class="small">${totalRows} track${totalRows === 1 ? "" : "s"}${totalRows > rows.length ? ` · showing ${rows.length}` : ""}</div><div class="viz-drill-context"><span>${escapeHtml(focusLabel)}</span><span>${rated}/${rows.length} rated</span><span>Avg fit ${escapeHtml(avgFit)}</span></div><button type="button" class="dg-viz-info dg-viz-info-inline" title="${escapeHtml(explainer)}" aria-label="${escapeHtml(explainer)}">ⓘ</button></div><button type="button" class="btn btn-secondary btn-tiny" onclick="clearVisualDrilldown()">Close</button></div>${
    rows.length
      ? `<div class="viz-drilldown-list">${rows
          .map((row, idx) => {
            const effective = songEffectiveYear(row.song);
            const inputId = `eraOverride_${idx}_${String(row.genre.id).replace(/[^a-zA-Z0-9]/g, "")}`;
            const savedEra = row.song.eraYear || row.song.eraDecade || "";
            const reaction = Number(row.song.reaction || 0);
            const fit = Number(row.song.score || 0) || null;
            const art = row.song.artwork
              ? `<img class="viz-drill-art" src="${escapeHtml(row.song.artwork)}" alt="" loading="lazy">`
              : '<div class="viz-drill-art"></div>';
            const eraLine = effective.year
              ? `${effective.source}: ${effective.year}`
              : "No year";
            const spotifyLine =
              row.song.releaseYear &&
              (effective.source !== "Spotify" || savedEra)
                ? ` · Spotify: ${row.song.releaseYear}`
                : "";
            return `<div class="viz-drill-row viz-record-row">${art}<div><div class="viz-drill-title-line">${vizSongTitleLink(row.song)}</div><div class="viz-drill-meta">${escapeHtml(row.genre.genre || "Unknown genre")} · ${reactionEmoji(reaction)} ${escapeHtml(reactionLabel(reaction))}${fit ? ` · Fit ${fit}/5` : ""}</div><div class="viz-drill-meta">${escapeHtml(eraLine)}${escapeHtml(spotifyLine)} · ${escapeHtml(vizSourceLabel(row.song))}</div></div><div class="viz-drill-actions"><button type="button" onclick="vizOpenGenreEncoded('${visualActionArg(row.genre.genre || "")}')">Open</button></div></div>`;
          })
          .join("")}</div>`
      : '<div class="viz-empty">No songs found for this drilldown.</div>'
  }</div>`;
}

function statsPolishApply() {
  const root = document.getElementById("screen-viz");
  if (!root) return;
  root.classList.add("dg-stats-polished", "dg-stats-v34");

  root.querySelectorAll(".viz-card-metadata").forEach((card) => {
    card.classList.add("dg-viz-hide-card");
  });

  root
    .querySelectorAll(".viz-card-copy, .viz-chart-hint, .viz-spotlight-copy")
    .forEach((el) => {
      const text = String(el.textContent || "")
        .replace(/\s+/g, " ")
        .trim();
      if (!text) return;
      el.dataset.dgTooltipText = text;
      el.title = text;
      el.classList.add("dg-viz-tooltip-source");
      const parent = el.parentElement;
      if (parent && !parent.querySelector(":scope > .dg-viz-info")) {
        const info = document.createElement("button");
        info.type = "button";
        info.className = "dg-viz-info";
        info.title = text;
        info.setAttribute("aria-label", text);
        info.textContent = "ⓘ";
        const label = parent.querySelector(
          ":scope > .viz-card-label, :scope > .viz-spotlight-label",
        );
        label?.insertAdjacentElement("afterend", info);
      }
    });

  root.querySelectorAll(".viz-drill-actions button").forEach((btn) => {
    if (/^spotify$/i.test(String(btn.textContent || "").trim())) btn.remove();
  });

  root.querySelectorAll(".viz-hl-card").forEach((card) => {
    card.classList.add("dg-viz-summary-card");
  });

  // Data-viz pass: keep note content as metadata/tooltip, not a second hero card.
  root.querySelectorAll(".viz-spotlight-card").forEach((card) => {
    card.classList.add("dg-viz-compact-note");
  });
}

/* === Stats / Wrapped-style insight layer v3.5 ===
   Story-first Stats pass: stable inspector, shareable visual card, and
   analytics/admin separation. No app.js, genre-loader, song-carousel, or
   album-carousel changes. */

function dgStatsCurrentRows() {
  try {
    return typeof vizRowsForCurrentScope === "function"
      ? vizRowsForCurrentScope()
      : [];
  } catch (_) {
    try {
      const baseItems =
        typeof vizBaseGenres === "function"
          ? vizBaseGenres()
          : Array.isArray(genres)
            ? genres
            : [];
      return typeof vizFilteredItems === "function"
        ? vizFilteredItems(baseItems)
        : baseItems;
    } catch (__) {
      return [];
    }
  }
}

function dgStatsSnapshotData() {
  const items = dgStatsCurrentRows();
  const songs =
    typeof vizAllOfficialSongs === "function" ? vizAllOfficialSongs(items) : [];
  const artists =
    typeof vizArtists === "function" ? vizArtists(items) : { uniqueArtists: 0 };
  const health =
    typeof visualHealthStats === "function"
      ? visualHealthStats(items)
      : { ratedPct: 0, likeRate: 0, rated: 0, unrated: songs.length };
  const mode = typeof vizMode === "function" ? vizMode() : "monthly";
  const title =
    mode === "monthly"
      ? typeof vizMonthTitle === "function"
        ? vizMonthTitle(vizSelectedMonth())
        : "This month"
      : "All Time";

  const catCounts = new Map();
  items.forEach((g) => {
    const cat =
      String(g.subcategory || g.category_path || "Uncategorized")
        .split(">")[0]
        .trim() || "Uncategorized";
    catCounts.set(cat, (catCounts.get(cat) || 0) + 1);
  });
  const topCats = [...catCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const decadeCounts = new Map();
  songs.forEach((s) => {
    let y = null;
    try {
      y =
        typeof songEffectiveYear === "function"
          ? songEffectiveYear(s).year
          : s.releaseYear || s.eraYear;
    } catch (_) {
      y = s.releaseYear || s.eraYear;
    }
    y = Number(y);
    if (Number.isFinite(y) && y > 1800) {
      const d = `${Math.floor(y / 10) * 10}s`;
      decadeCounts.set(d, (decadeCounts.get(d) || 0) + 1);
    }
  });
  const topDecade = [...decadeCounts.entries()].sort(
    (a, b) => b[1] - a[1],
  )[0] || ["—", 0];

  const reactionCounts = { up: 0, meh: 0, down: 0, unrated: 0 };
  songs.forEach((s) => {
    const r = Number(s.reaction || 0);
    if (r === 1) reactionCounts.up += 1;
    else if (r === 2) reactionCounts.meh += 1;
    else if (r === 3) reactionCounts.down += 1;
    else reactionCounts.unrated += 1;
  });
  const ratedReactions =
    reactionCounts.up + reactionCounts.meh + reactionCounts.down;
  const likedPct = ratedReactions
    ? Math.round((reactionCounts.up / ratedReactions) * 100)
    : 0;

  const genreLikes = items
    .map((g) => {
      const list = Array.isArray(g.songs_listened) ? g.songs_listened : [];
      return {
        genre: g.genre || "Unknown genre",
        count: list.filter((s) => Number(s.reaction || 0) === 1).length,
        total: list.length,
      };
    })
    .filter((x) => x.total)
    .sort((a, b) => b.count - a.count || b.total - a.total)[0];

  const lead =
    mode === "monthly"
      ? `${title} leaned ${topCats[0]?.[0] || "wide-ranging"}${topDecade[0] !== "—" ? ` with a ${topDecade[0]} spine` : ""}.`
      : `Your archive leans ${topCats[0]?.[0] || "wide-ranging"}${topDecade[0] !== "—" ? ` with a ${topDecade[0]} center of gravity` : ""}.`;
  const sublead = ratedReactions
    ? `${likedPct}% of rated songs landed as 👍, across ${songs.length} logged song${songs.length === 1 ? "" : "s"}.`
    : `${songs.length} logged song${songs.length === 1 ? "" : "s"}; reaction coverage is still building.`;

  return {
    items,
    songs,
    artists,
    health,
    mode,
    title,
    topCats,
    topDecade,
    reactionCounts,
    ratedReactions,
    likedPct,
    genreLikes,
    lead,
    sublead,
  };
}

function dgStatsInstallStoryCard() {
  const root = document.getElementById("screen-viz");
  const shell = root?.querySelector?.(".viz-shell");
  const hero = root?.querySelector?.(".viz-hero");
  if (!root || !shell || !hero) return;
  const snap = dgStatsSnapshotData();
  let card = root.querySelector("#dgStatsStoryCard");
  if (!card) {
    card = document.createElement("section");
    card.id = "dgStatsStoryCard";
    card.className = "dg-stats-story-card";
    hero.insertAdjacentElement("afterend", card);
  }
  const topCats = snap.topCats
    .map(([name, count]) => `<span>${escapeHtml(name)} <b>${count}</b></span>`)
    .join("");
  card.innerHTML = `<div class="dg-stats-story-main"><div class="eyebrow">Listening story</div><h3>${escapeHtml(snap.lead)}</h3><p>${escapeHtml(snap.sublead)}</p></div><div class="dg-stats-story-chips"><span><b>${snap.songs.length}</b> songs</span><span><b>${snap.artists.uniqueArtists || 0}</b> artists</span><span><b>${snap.health.ratedPct || 0}%</b> rated</span><span><b>${snap.health.likeRate || 0}%</b> like rate</span>${topCats}</div>`;
}

function dgStatsInstallShareButton() {
  const root = document.getElementById("screen-viz");
  const modeBar = root?.querySelector?.(".viz-mode-bar");
  if (!root || !modeBar || root.querySelector("#dgStatsShareVisualBtn")) return;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.id = "dgStatsShareVisualBtn";
  btn.className = "btn btn-secondary dg-stats-share-btn";
  btn.innerHTML = `<span aria-hidden="true">▣</span><span>Copy visual card</span>`;
  btn.addEventListener("click", () => dgStatsCopyVisualCard());
  const status = root.querySelector("#vizRefreshStatus");
  (status || modeBar).insertAdjacentElement(
    status ? "beforebegin" : "beforeend",
    btn,
  );
}

function dgStatsDrawRoundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function dgStatsWrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 3) {
  const words = String(text || "")
    .split(/\s+/)
    .filter(Boolean);
  let line = "";
  let lines = 0;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      y += lineHeight;
      lines += 1;
      line = word;
      if (lines >= maxLines - 1) break;
    } else {
      line = test;
    }
  }
  if (line && lines < maxLines) ctx.fillText(line, x, y);
}

async function dgStatsCopyVisualCard() {
  const snap = dgStatsSnapshotData();
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 675;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, "#fff4d5");
  grad.addColorStop(0.58, "#edd19a");
  grad.addColorStop(1, "#2a170d");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(31, 19, 10, 0.92)";
  dgStatsDrawRoundRect(ctx, 58, 54, 1084, 567, 44);
  ctx.fill();

  ctx.fillStyle = "#ffdda0";
  ctx.font = "800 30px Inter, Arial, sans-serif";
  ctx.letterSpacing = "4px";
  ctx.fillText("DAILY GENRE STATS", 100, 118);

  ctx.fillStyle = "#fff3dc";
  ctx.font = "900 72px Inter, Arial, sans-serif";
  ctx.fillText(snap.title, 100, 202);

  ctx.font = "700 34px Inter, Arial, sans-serif";
  dgStatsWrapText(ctx, snap.lead, 100, 265, 760, 42, 2);
  ctx.fillStyle = "#e9cfa4";
  ctx.font = "600 28px Inter, Arial, sans-serif";
  dgStatsWrapText(ctx, snap.sublead, 100, 350, 750, 36, 2);

  const metrics = [
    [String(snap.songs.length), "songs"],
    [String(snap.artists.uniqueArtists || 0), "artists"],
    [`${snap.health.ratedPct || 0}%`, "rated"],
    [`${snap.health.likeRate || 0}%`, "like rate"],
  ];
  metrics.forEach(([value, label], idx) => {
    const x = 100 + idx * 198;
    ctx.fillStyle = "rgba(255, 244, 213, 0.08)";
    dgStatsDrawRoundRect(ctx, x, 438, 166, 106, 24);
    ctx.fill();
    ctx.fillStyle = "#ffdda0";
    ctx.font = "900 42px Inter, Arial, sans-serif";
    ctx.fillText(value, x + 22, 490);
    ctx.fillStyle = "#d2ad78";
    ctx.font = "800 18px Inter, Arial, sans-serif";
    ctx.fillText(String(label).toUpperCase(), x + 22, 520);
  });

  const cx = 965,
    cy = 335,
    r = 125;
  const total = Math.max(
    1,
    snap.ratedReactions ||
      snap.reactionCounts.up +
        snap.reactionCounts.meh +
        snap.reactionCounts.down,
  );
  const parts = [
    [snap.reactionCounts.up, "#4b8e39", "👍"],
    [snap.reactionCounts.meh, "#df8c1f", "🤷"],
    [snap.reactionCounts.down, "#bc2e33", "👎"],
  ];
  let start = -Math.PI / 2;
  parts.forEach(([count, color]) => {
    const angle = (count / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, start + angle);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    start += angle;
  });
  ctx.beginPath();
  ctx.arc(cx, cy, 72, 0, Math.PI * 2);
  ctx.fillStyle = "#301b0e";
  ctx.fill();
  ctx.fillStyle = "#fff3dc";
  ctx.font = "900 42px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${snap.likedPct}%`, cx, cy + 5);
  ctx.font = "800 17px Inter, Arial, sans-serif";
  ctx.fillStyle = "#d2ad78";
  ctx.fillText("LIKED", cx, cy + 33);
  ctx.textAlign = "left";

  ctx.fillStyle = "#fff3dc";
  ctx.font = "800 24px Inter, Arial, sans-serif";
  ctx.fillText(`Top lane: ${snap.topCats[0]?.[0] || "—"}`, 835, 520);
  ctx.fillText(`Era center: ${snap.topDecade[0] || "—"}`, 835, 555);

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/png", 0.95),
  );
  if (!blob) return;
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      if (typeof showSaveToast === "function")
        showSaveToast("Stats visual copied as image.", false);
      return;
    }
    throw new Error("Clipboard image unsupported");
  } catch (_) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dailygenre-stats-${
      String(snap.title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "snapshot"
    }.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    if (typeof showSaveToast === "function")
      showSaveToast("Stats visual downloaded as PNG.", false);
  }
}

function dgStatsMarkAdminCards() {
  const root = document.getElementById("screen-viz");
  if (!root) return;
  root.querySelectorAll(".viz-card").forEach((card) => {
    const label = String(
      card.querySelector(".viz-card-label")?.textContent || "",
    )
      .trim()
      .toLowerCase();
    if (
      [
        "needs attention",
        "unrated songs queue",
        "missing metadata queue",
      ].includes(label)
    ) {
      card.classList.add("dg-viz-admin-card");
    }
  });
}

function dgStatsInstallReviewNudge() {
  const root = document.getElementById("screen-viz");
  if (!root || root.querySelector("#dgStatsReviewNudge")) return;
  const monthly = root.querySelector("#vizViewMonthly .viz-secondary-grid");
  const alltime = root.querySelector("#vizViewAlltime .viz-deep-grid");
  [monthly, alltime].forEach((grid) => {
    if (!grid || grid.querySelector("#dgStatsReviewNudge")) return;
    const card = document.createElement("div");
    card.id = "dgStatsReviewNudge";
    card.className = "viz-card dg-stats-review-nudge";
    card.innerHTML = `<div class="viz-card-label">Review workbench</div><p>Cleanup queues, metadata, duplicate checks, and pending nominations now live in Review so Stats can stay focused on listening patterns.</p><button type="button" class="btn btn-secondary" onclick="switchScreen('review')">Open Review</button>`;
    grid.appendChild(card.cloneNode(true));
  });
}

function renderVisualDrilldown() {
  clearVisualDrilldownMounts();
  const globalMount = document.getElementById("vizDrilldownPanel");
  if (!globalMount) return;
  globalMount.innerHTML = "";
  globalMount.classList.remove("is-active", "dg-stats-inspector");
  if (!vizDrilldownState) return;

  const items = vizRowsForCurrentScope();
  const {
    title,
    rows: allRows,
    explainer,
  } = vizDrilldownRowsForState(items, vizDrilldownState);
  const totalRows = allRows.length;
  const rows = allRows.slice(0, 36);
  const modeLabel =
    vizDrilldownState.mode === "monthly"
      ? `Monthly · ${vizMonthTitle(vizSelectedMonth())}`
      : "All time";
  const rated = rows.filter((row) =>
    [1, 2, 3].includes(Number(row.song.reaction)),
  ).length;
  const fitRows = rows.filter((row) => Number(row.song.score));
  const avgFit = fitRows.length
    ? (
        fitRows.reduce(
          (sum, row) => sum + (Number(row.song.score || 0) || 0),
          0,
        ) / fitRows.length
      ).toFixed(1)
    : "—";

  globalMount.classList.add("is-active", "dg-stats-inspector");
  globalMount.innerHTML = `<div class="viz-drilldown is-active dg-viz-side-drill"><div class="viz-drilldown-head"><div><div class="eyebrow" style="margin:0;">Selected crate · ${escapeHtml(modeLabel)}</div><strong>${escapeHtml(title)}</strong><div class="small">${totalRows} track${totalRows === 1 ? "" : "s"}${totalRows > rows.length ? ` · showing ${rows.length}` : ""}</div><div class="viz-drill-context"><span>${rated}/${rows.length} rated</span><span>Avg fit ${escapeHtml(avgFit)}</span></div><button type="button" class="dg-viz-info dg-viz-info-inline" title="${escapeHtml(explainer)}" aria-label="${escapeHtml(explainer)}">ⓘ</button></div><button type="button" class="btn btn-secondary btn-tiny" onclick="clearVisualDrilldown()">Close</button></div>${
    rows.length
      ? `<div class="viz-drilldown-list">${rows
          .map((row) => {
            const effective = songEffectiveYear(row.song);
            const reaction = Number(row.song.reaction || 0);
            const fit = Number(row.song.score || 0) || null;
            const art = row.song.artwork
              ? `<img class="viz-drill-art" src="${escapeHtml(row.song.artwork)}" alt="" loading="lazy">`
              : '<div class="viz-drill-art"></div>';
            const eraLine = effective.year
              ? `${effective.source}: ${effective.year}`
              : "No year";
            return `<div class="viz-drill-row viz-record-row">${art}<div><div class="viz-drill-title-line">${vizSongTitleLink(row.song)}</div><div class="viz-drill-meta">${escapeHtml(row.genre.genre || "Unknown genre")} · ${reactionEmoji(reaction)} ${escapeHtml(reactionLabel(reaction))}${fit ? ` · Fit ${fit}/5` : ""}</div><div class="viz-drill-meta">${escapeHtml(eraLine)} · ${escapeHtml(vizSourceLabel(row.song))}</div></div><div class="viz-drill-actions"><button type="button" onclick="vizOpenGenreEncoded('${visualActionArg(row.genre.genre || "")}')">Open</button></div></div>`;
          })
          .join("")}</div>`
      : '<div class="viz-empty">No songs found for this drilldown.</div>'
  }</div>`;
}

function statsPolishApply() {
  const root = document.getElementById("screen-viz");
  if (!root) return;
  root.classList.add("dg-stats-polished", "dg-stats-v34", "dg-stats-v35");

  root
    .querySelectorAll(".viz-card-metadata")
    .forEach((card) => card.classList.add("dg-viz-hide-card"));

  root
    .querySelectorAll(".viz-card-copy, .viz-chart-hint, .viz-spotlight-copy")
    .forEach((el) => {
      const text = String(el.textContent || "")
        .replace(/\s+/g, " ")
        .trim();
      if (!text) return;
      el.dataset.dgTooltipText = text;
      el.title = text;
      el.classList.add("dg-viz-tooltip-source");
      const parent = el.parentElement;
      if (parent && !parent.querySelector(":scope > .dg-viz-info")) {
        const info = document.createElement("button");
        info.type = "button";
        info.className = "dg-viz-info";
        info.title = text;
        info.setAttribute("aria-label", text);
        info.textContent = "ⓘ";
        const label = parent.querySelector(
          ":scope > .viz-card-label, :scope > .viz-spotlight-label",
        );
        label?.insertAdjacentElement("afterend", info);
      }
    });

  root.querySelectorAll(".viz-drill-actions button").forEach((btn) => {
    if (/^spotify$/i.test(String(btn.textContent || "").trim())) btn.remove();
  });
  root
    .querySelectorAll(".viz-hl-card")
    .forEach((card) => card.classList.add("dg-viz-summary-card"));
  root
    .querySelectorAll(".viz-spotlight-card")
    .forEach((card) => card.classList.add("dg-viz-compact-note"));
  dgStatsMarkAdminCards();
  dgStatsInstallStoryCard();
  dgStatsInstallShareButton();
  dgStatsInstallReviewNudge();
}

/* === Stats polish v3.6: usable info tips, chart copy, focus-empty clarity === */
function dgStatsEscapeTip(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim();
}

function dgStatsInstallInfoTooltips(
  root = document.getElementById("screen-viz"),
) {
  if (!root) return;
  root.querySelectorAll(".dg-viz-info").forEach((info) => {
    const tip = dgStatsEscapeTip(
      info.getAttribute("aria-label") ||
        info.getAttribute("title") ||
        info.dataset.tip ||
        "",
    );
    if (!tip) return;
    info.dataset.tip = tip;
    info.setAttribute("aria-label", tip);
    info.setAttribute("title", tip);
    info.tabIndex = 0;
  });
}

async function dgStatsCopyCanvasVisual(canvas, label = "Daily Genre chart") {
  if (!canvas) return;
  const out = document.createElement("canvas");
  const scale = 2;
  const w = Math.max(700, canvas.width || canvas.clientWidth || 700);
  const h = Math.max(520, canvas.height || canvas.clientHeight || 520);
  out.width = w * scale;
  out.height = h * scale;
  const ctx = out.getContext("2d");
  if (!ctx) return;
  ctx.scale(scale, scale);
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "#fff5d7");
  grad.addColorStop(1, "#e5c48d");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#2a170d";
  ctx.font = "900 28px Inter, Arial, sans-serif";
  ctx.fillText(label, 28, 48);
  const margin = 36;
  const chartTop = 72;
  const maxW = w - margin * 2;
  const maxH = h - chartTop - margin;
  const ratio = Math.min(maxW / canvas.width, maxH / canvas.height);
  const drawW = canvas.width * ratio;
  const drawH = canvas.height * ratio;
  ctx.drawImage(
    canvas,
    margin + (maxW - drawW) / 2,
    chartTop + (maxH - drawH) / 2,
    drawW,
    drawH,
  );
  ctx.fillStyle = "rgba(42, 23, 13, 0.62)";
  ctx.font = "700 16px Inter, Arial, sans-serif";
  ctx.fillText("Daily Genre", 28, h - 22);
  const blob = await new Promise((resolve) =>
    out.toBlob(resolve, "image/png", 0.95),
  );
  if (!blob) return;
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      showSaveToast?.("Chart copied as image.", false);
      return;
    }
    throw new Error("Clipboard image unsupported");
  } catch (_) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${
      label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "dailygenre-chart"
    }.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    showSaveToast?.("Chart downloaded as PNG.", false);
  }
}

function dgStatsInstallChartCopyButtons(
  root = document.getElementById("screen-viz"),
) {
  if (!root) return;
  root.querySelectorAll(".viz-card-donut, .viz-card-spins").forEach((card) => {
    const canvas = card.querySelector("canvas");
    if (!canvas || card.querySelector(":scope > .dg-copy-chart-btn")) return;
    const label = dgStatsEscapeTip(
      card.querySelector(":scope > .viz-card-label")?.textContent ||
        "Daily Genre chart",
    );
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dg-copy-chart-btn";
    btn.title = `Copy ${label} as image`;
    btn.setAttribute("aria-label", `Copy ${label} as image`);
    btn.innerHTML = `<span aria-hidden="true">⧉</span>`;
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      dgStatsCopyCanvasVisual(canvas, label);
    });
    card.appendChild(btn);
  });
}

function dgStatsInstallFocusedMonthEmptyNote(
  root = document.getElementById("screen-viz"),
) {
  if (!root) return;
  const section = root.querySelector("#vizViewMonthly .viz-section");
  if (!section) return;
  let note = section.querySelector(".dg-stats-focus-empty-note");
  const removeNote = () => {
    root.classList.remove("dg-stats-empty-focus-month");
    note?.remove();
  };
  try {
    const isMonthly =
      typeof vizMode === "function" ? vizMode() === "monthly" : false;
    const focus =
      typeof vizFocusedGenre === "function" ? vizFocusedGenre() : null;
    const items =
      typeof vizFilteredItems === "function" &&
      typeof vizBaseGenres === "function"
        ? vizFilteredItems(vizBaseGenres())
        : [];
    if (!isMonthly || !focus || (Array.isArray(items) && items.length)) {
      removeNote();
      return;
    }
    if (!note) {
      note = document.createElement("div");
      note.className = "dg-stats-focus-empty-note";
      const header = section.querySelector(".viz-section-header");
      header?.insertAdjacentElement("afterend", note);
    }
    root.classList.add("dg-stats-empty-focus-month");
    const monthTitle =
      typeof vizMonthTitle === "function" &&
      typeof vizSelectedMonth === "function"
        ? vizMonthTitle(vizSelectedMonth())
        : "this month";
    note.innerHTML = `<strong>No ${escapeHtml(focus.genre || "focused genre")} logs in ${escapeHtml(monthTitle)}.</strong><span>The dossier above still shows the all-time genre profile. Switch to All Time for the full trend breakdown.</span>`;
  } catch (_) {
    removeNote();
  }
}

function dgStatsV36Apply() {
  const root = document.getElementById("screen-viz");
  if (!root) return;
  root.classList.add("dg-stats-v36");
  dgStatsInstallInfoTooltips(root);
  dgStatsInstallChartCopyButtons(root);
  dgStatsInstallFocusedMonthEmptyNote(root);
}

const dgStatsPreviousPolishApplyV36 =
  typeof statsPolishApply === "function" ? statsPolishApply : null;
statsPolishApply = function statsPolishApplyV36() {
  dgStatsPreviousPolishApplyV36?.();
  dgStatsV36Apply();
};

/* === Stats polish v3.7: genre focus typeahead + category-aware depth chart ===
   Data-viz pass: make focus selection faster, keep single-genre charts contextual,
   improve bar legibility, and color bars by parent category. No app.js changes. */
function dgStatsNormalizeSearch(value = "") {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_/]+/g, " ")
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function dgStatsAllFocusableGenres() {
  try {
    return (
      typeof allListenedGenresForMaintenance === "function"
        ? allListenedGenresForMaintenance()
        : Array.isArray(genres)
          ? genres.filter((g) => (g.status || "").toLowerCase() === "listened")
          : []
    )
      .slice()
      .sort((a, b) =>
        String(a.genre || "").localeCompare(String(b.genre || "")),
      );
  } catch (_) {
    return [];
  }
}

function dgStatsGenreFocusCandidates() {
  const list = dgStatsAllFocusableGenres();
  return list.map((g) => ({
    id: String(g.id ?? ""),
    name: String(g.genre || "Unknown genre"),
    search: dgStatsNormalizeSearch(g.genre || ""),
    category: dgStatsRootCategory(g),
  }));
}

function dgStatsBestGenreFocusMatch(query) {
  const q = dgStatsNormalizeSearch(query);
  if (!q) return null;
  const candidates = dgStatsGenreFocusCandidates();
  return (
    candidates.find((c) => c.search === q) ||
    candidates.find((c) => c.search.startsWith(q)) ||
    candidates.find((c) => c.search.includes(q)) ||
    null
  );
}

function dgStatsSetGenreFocus(id = "") {
  try {
    const nextId = id ? String(id) : "";
    const previousId = String(vizFocusedGenreId || "");
    vizFocusedGenreId = nextId;
    vizDrilldownState = null;
    renderVisuals();
    if (nextId && nextId !== previousId) {
      const focused =
        typeof vizFocusedGenre === "function" ? vizFocusedGenre() : null;
      const label = focused?.genre || "selected genre";
      if (typeof showSaveToast === "function") {
        showSaveToast(`Stats focused on ${label}.`, false);
      }
      setTimeout(() => {
        const hint = document.querySelector(".dg-stats-typeahead-hint");
        if (hint) {
          hint.textContent = `Focused on ${label}.`;
          hint.classList.remove("is-warning");
          hint.classList.add("is-confirmed");
        }
      }, 30);
    } else if (!nextId && previousId && typeof showSaveToast === "function") {
      showSaveToast("Stats focus cleared.", false);
    }
  } catch (err) {
    console.warn("Could not set Stats genre focus", err);
  }
}

function renderVisualFilters() {
  const mount = document.getElementById("vizFilterMount");
  if (!mount) return;
  const current =
    typeof vizFocusedGenre === "function" ? vizFocusedGenre() : null;
  const candidates = dgStatsGenreFocusCandidates();
  const currentLabel = current ? String(current.genre || "") : "";
  mount.innerHTML = `<div class="viz-filter-row dg-stats-filter-row-v37">
    <div class="viz-filter-control dg-stats-typeahead-wrap">
      <label for="vizGenreFocusTypeahead">Genre focus</label>
      <div class="dg-stats-typeahead-line">
        <input id="vizGenreFocusTypeahead" class="dg-stats-typeahead" type="search" list="vizGenreFocusList" placeholder="Type a listened genre…" value="${escapeHtml(currentLabel)}" autocomplete="off" />
        <datalist id="vizGenreFocusList">
          ${candidates.map((c) => `<option value="${escapeHtml(c.name)}" label="${escapeHtml(c.category)}"></option>`).join("")}
        </datalist>
        <button type="button" class="btn btn-secondary btn-tiny dg-stats-focus-apply">Focus</button>
        <button type="button" class="btn btn-ghost btn-tiny dg-stats-focus-clear">All</button>
      </div>
      <div class="small dg-stats-typeahead-hint">${current ? `Focused on ${escapeHtml(current.genre || "this genre")}.` : "All listened genres. Start typing to narrow."}</div>
    </div>
    <button type="button" class="btn btn-secondary btn-tiny" onclick="clearVisualDrilldown()">Clear drilldown</button>
  </div>`;

  const input = mount.querySelector("#vizGenreFocusTypeahead");
  const hint = mount.querySelector(".dg-stats-typeahead-hint");
  const apply = () => {
    const raw = String(input?.value || "").trim();
    if (!raw) {
      dgStatsSetGenreFocus("");
      return;
    }
    const match = dgStatsBestGenreFocusMatch(raw);
    if (match) {
      dgStatsSetGenreFocus(match.id);
    } else if (hint) {
      hint.textContent = "No listened genre match yet. Try a shorter name.";
      hint.classList.add("is-warning");
    }
  };
  input?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      apply();
    } else if (event.key === "Escape") {
      event.preventDefault();
      dgStatsSetGenreFocus("");
    }
  });
  input?.addEventListener("change", () => {
    const match = dgStatsBestGenreFocusMatch(input.value);
    if (
      match &&
      dgStatsNormalizeSearch(match.name) === dgStatsNormalizeSearch(input.value)
    ) {
      dgStatsSetGenreFocus(match.id);
    }
  });
  input?.addEventListener("input", () => {
    if (!hint) return;
    const q = dgStatsNormalizeSearch(input.value);
    hint.classList.remove("is-warning");
    if (!q) {
      hint.textContent = "All listened genres. Start typing to narrow.";
      return;
    }
    const matches = dgStatsGenreFocusCandidates()
      .filter((c) => c.search.includes(q))
      .slice(0, 3);
    hint.textContent = matches.length
      ? `Best matches: ${matches.map((m) => m.name).join(" · ")}`
      : "No listened genre match yet.";
    if (!matches.length) hint.classList.add("is-warning");
  });
  mount
    .querySelector(".dg-stats-focus-apply")
    ?.addEventListener("click", apply);
  mount
    .querySelector(".dg-stats-focus-clear")
    ?.addEventListener("click", () => dgStatsSetGenreFocus(""));
}

function dgStatsRootCategory(genre) {
  const raw = String(
    genre?.category_path ||
      genre?.categorypath ||
      genre?.subcategory ||
      genre?.category ||
      "Uncategorized",
  );
  return raw.split(">")[0].trim() || "Uncategorized";
}

function dgStatsCategoryColor(category, alpha = 1) {
  const palette = {
    Electronic: [196, 126, 27],
    Rock: [132, 82, 35],
    Pop: [72, 132, 55],
    Metal: [183, 50, 48],
    Country: [91, 107, 130],
    Jazz: [201, 150, 14],
    "Hip-hop": [140, 79, 184],
    "Hip hop": [140, 79, 184],
    Punk: [44, 127, 184],
    Blues: [0, 146, 146],
    Folk: [216, 92, 112],
    Classical: [130, 112, 45],
    "R&B": [185, 104, 30],
  };
  const key = Object.keys(palette).find(
    (k) => dgStatsNormalizeSearch(k) === dgStatsNormalizeSearch(category),
  );
  const [r, g, b] = palette[key] || [141, 92, 37];
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0.12, Math.min(1, alpha))})`;
}

function dgStatsDepthRowsForChart(currentItems) {
  const focus =
    typeof vizFocusedGenre === "function" ? vizFocusedGenre() : null;
  const source = focus ? dgStatsAllFocusableGenres() : currentItems;
  const focusCategory = focus ? dgStatsRootCategory(focus) : "";
  let rows = (source || [])
    .filter((g) => !focus || dgStatsRootCategory(g) === focusCategory)
    .map((g) => ({
      genre: g.genre || "Unknown",
      count:
        typeof vizOfficialSongs === "function"
          ? vizOfficialSongs(g).length
          : Array.isArray(g.songs_listened)
            ? g.songs_listened.length
            : 0,
      category: dgStatsRootCategory(g),
      selected: focus ? String(g.id) === String(focus.id) : false,
    }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count || a.genre.localeCompare(b.genre));

  if (focus) {
    const selected = rows.find((x) => x.selected);
    rows = rows.slice(0, 15);
    if (selected && !rows.some((x) => x.selected))
      rows = [selected, ...rows.slice(0, 14)];
  } else {
    rows = rows.slice(0, 15);
  }
  return rows;
}

function dgStatsRenderDepthChart(currentItems) {
  const depthCanvas = document.getElementById("vizSongsDepth");
  if (!depthCanvas || typeof Chart === "undefined") return;
  try {
    _vizCharts.depth?.destroy?.();
  } catch (_) {}
  const focus =
    typeof vizFocusedGenre === "function" ? vizFocusedGenre() : null;
  const rows = dgStatsDepthRowsForChart(currentItems || []);
  const card = depthCanvas.closest(".viz-card");
  const label = card?.querySelector(".viz-card-label");
  if (label)
    label.textContent = focus
      ? `Most Songs Logged · ${dgStatsRootCategory(focus)} peers`
      : "Most Songs Logged (Top 15)";
  card?.classList.add("dg-depth-chart-card");
  card?.classList.toggle("dg-depth-chart-focused", !!focus);

  if (!rows.length) {
    const ctx = depthCanvas.getContext("2d");
    ctx?.clearRect(0, 0, depthCanvas.width, depthCanvas.height);
    return;
  }

  const colors = rows.map((row) =>
    dgStatsCategoryColor(
      row.category,
      focus ? (row.selected ? 0.95 : 0.34) : 0.86,
    ),
  );
  const borderColors = rows.map((row) =>
    dgStatsCategoryColor(row.category, row.selected ? 1 : 0.75),
  );
  _vizCharts.depth = new Chart(depthCanvas.getContext("2d"), {
    type: "bar",
    data: {
      labels: rows.map((x) => (x.selected ? `${x.genre}  • focus` : x.genre)),
      datasets: [
        {
          data: rows.map((x) => x.count),
          backgroundColor: colors,
          borderColor: borderColors,
          borderWidth: focus ? 1.5 : 0,
          borderRadius: 7,
          borderSkipped: false,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              `${ctx.parsed.x} logged song${ctx.parsed.x === 1 ? "" : "s"}`,
            afterLabel: (ctx) => rows[ctx.dataIndex]?.category || "",
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            color: "#4b3724",
            font: { size: 12, weight: "700" },
          },
          grid: { color: "rgba(74, 52, 31, 0.12)" },
        },
        y: {
          ticks: {
            color: "#22160d",
            font: { size: 12, weight: "800" },
            autoSkip: false,
          },
          grid: { display: false },
        },
      },
    },
  });
  const noteClass = "dg-depth-context-note";
  let note = card?.querySelector(`.${noteClass}`);
  if (!note && card) {
    note = document.createElement("div");
    note.className = noteClass;
    depthCanvas.insertAdjacentElement("afterend", note);
  }
  if (note) {
    note.innerHTML = focus
      ? `Showing ${escapeHtml(dgStatsRootCategory(focus))} peers so ${escapeHtml(focus.genre || "this genre")} is not a one-bar chart. Focus bar is fully saturated; neighboring bars are muted.`
      : `Bars are colored by parent category.`;
  }
}

const dgStatsPreviousAllTimeChartsV37 =
  typeof vizAllTimeCharts === "function" ? vizAllTimeCharts : null;
vizAllTimeCharts = function vizAllTimeChartsV37(items) {
  dgStatsPreviousAllTimeChartsV37?.(items);
  dgStatsRenderDepthChart(items || []);
};

const dgStatsPreviousPolishApplyV37 =
  typeof statsPolishApply === "function" ? statsPolishApply : null;
statsPolishApply = function statsPolishApplyV37() {
  dgStatsPreviousPolishApplyV37?.();
  document.getElementById("screen-viz")?.classList.add("dg-stats-v37");
};
