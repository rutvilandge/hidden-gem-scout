const resultsGrid = document.getElementById('aiScoutResultsGrid');
const resultsTitle = document.getElementById('aiScoutResultsTitle');
const resultsMeta = document.getElementById('aiScoutResultsMeta');
const searchInput = document.getElementById('aiScoutSearch');
const searchButton = document.getElementById('aiScoutSearchBtn');

if (resultsGrid) {
  resultsGrid.innerHTML = '<p class="ai-scout-empty">Loading matches...</p>';
}

const normalize = (value) => value.toLowerCase().trim();
const tokenise = (value) =>
  normalize(value)
    .split(/[^a-z0-9]+/g)
    .filter((token) => token.length > 1);

const scoreSpot = (spot, tokens) => {
  if (!tokens.length) {
    return 0;
  }
  let score = 0;
  const name = normalize(spot.name || '');
  const subtitle = normalize(spot.subtitle || '');
  const category = normalize(spot.category || '');
  tokens.forEach((token) => {
    if (name.includes(token)) {
      score += 3;
    }
    if (subtitle.includes(token)) {
      score += 2;
    }
    if (category.includes(token)) {
      score += 1;
    }
  });
  return score;
};

const buildUrl = (spot) => {
  const params = new URLSearchParams({
    id: spot.id || '',
    name: spot.name || '',
    image: spot.image || '',
    subtitle: spot.subtitle || '',
    category: spot.category || ''
  });
  return `gem.html?${params.toString()}`;
};

const initAiScout = (exploreData) => {
  const allSpots = Object.keys(exploreData || {}).length
    ? Object.entries(exploreData).flatMap(([category, spots]) =>
        (spots || []).map((spot) => ({
          ...spot,
          category
        }))
      )
    : [];

  const renderResults = (query) => {
    if (!resultsGrid || !resultsTitle || !resultsMeta) {
      return;
    }

    const tokens = tokenise(query);
    const ranked = allSpots
      .map((spot) => ({ spot, score: scoreSpot(spot, tokens) }))
      .filter((entry) => (tokens.length ? entry.score > 0 : true))
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((entry) => entry.spot);

    const titleBase = query ? `Matches for "${query}"` : 'Top Matches';
    resultsTitle.textContent = titleBase;

    if (!ranked.length) {
      const categoryCounts = Object.entries(exploreData || {}).map(([category, spots]) => ({
        category,
        count: (spots || []).length
      }));
      const mostPopular = categoryCounts.sort((a, b) => b.count - a.count)[0];
      const fallbackSpots = mostPopular
        ? (exploreData[mostPopular.category] || []).slice(0, 12).map((spot) => ({
            ...spot,
            category: mostPopular.category
          }))
        : [];

      resultsTitle.textContent = 'Top Picks';
      resultsMeta.textContent = mostPopular
        ? `No exact match — showing popular ${mostPopular.category} spots.`
        : 'No matches yet — try another clue or vibe.';

      if (!fallbackSpots.length) {
        resultsGrid.innerHTML = '<p class="ai-scout-empty">No matches. Try a different clue.</p>';
        return;
      }

      resultsGrid.innerHTML = fallbackSpots
        .map((spot) => {
          const subtitle = spot.subtitle || '';
          const byline = spot.submittedBy ? `by ${spot.submittedBy}` : '';
          return `
        <article class="ai-scout-card">
          <img src="${spot.image || ''}" alt="${spot.name || 'Hidden gem'}" loading="lazy" />
          <div>
            <h3>${spot.name || 'Hidden gem'}</h3>
            <p>${subtitle || 'Local favorite.'}</p>
            ${byline ? `<span class="submitted-by">${byline}</span>` : ''}
            <button class="ai-scout-open" type="button" data-url="${buildUrl(spot)}">Open Details</button>
          </div>
        </article>
      `;
        })
        .join('');
      return;
    }

    resultsMeta.textContent = `${ranked.length} places found`;

    resultsGrid.innerHTML = ranked
      .map((spot) => {
        const subtitle = spot.subtitle || '';
        const byline = spot.submittedBy ? `by ${spot.submittedBy}` : '';
        return `
        <article class="ai-scout-card">
          <img src="${spot.image || ''}" alt="${spot.name || 'Hidden gem'}" loading="lazy" />
          <div>
            <h3>${spot.name || 'Hidden gem'}</h3>
            <p>${subtitle || 'Local favorite.'}</p>
            ${byline ? `<span class="submitted-by">${byline}</span>` : ''}
            <button class="ai-scout-open" type="button" data-url="${buildUrl(spot)}">Open Details</button>
          </div>
        </article>
      `;
      })
      .join('');
  };

  const applyQuery = (query) => {
    const trimmed = (query || '').trim();
    if (searchInput) {
      searchInput.value = trimmed;
    }
    renderResults(trimmed);
  };

  if (searchButton && searchInput) {
    searchButton.addEventListener('click', () => {
      applyQuery(searchInput.value);
    });

    searchInput.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') {
        return;
      }
      event.preventDefault();
      applyQuery(searchInput.value);
    });
  }

  if (resultsGrid) {
    resultsGrid.addEventListener('click', (event) => {
      const button = event.target.closest('.ai-scout-open');
      if (!button) {
        return;
      }
      window.location.href = button.dataset.url || 'explore.html';
    });
  }

  const params = new URLSearchParams(window.location.search);
  applyQuery(params.get('q') || '');
};

const loadAiData = window.hgsData?.fetchGems
  ? window.hgsData.fetchGems()
  : Promise.resolve(window.exploreData || {});

loadAiData.then((data) => initAiScout(data)).catch(() => initAiScout(window.exploreData || {}));
