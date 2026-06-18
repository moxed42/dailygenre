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

function categoryLine(genre) {
  return genre.category_path || genre.categorypath || genre.subcategory || 'Uncategorized';
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