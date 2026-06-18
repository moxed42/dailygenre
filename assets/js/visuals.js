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
