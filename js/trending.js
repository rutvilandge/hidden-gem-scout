const trendTiles = document.getElementById('trendTiles');
const trendCard = document.getElementById('trendCard');

const fallbackTrending = [
  {
    name: 'La Sicilia Bistro & Patisserie',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=420&q=80',
    subtitle: 'Trending spot for cafe lovers.',
    category: 'Cafe'
  },
  {
    name: 'Trooh',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=420&q=80',
    subtitle: 'A favorite dining destination.',
    category: 'Restaurants'
  },
  {
    name: 'Koregaon Park',
    image:
      'https://afar.brightspotcdn.com/dims4/default/e065dfa/2147483647/strip/true/crop/2000x1373+0+35/resize/1320x906!/format/webp/quality/90/?url=https%3A%2F%2Fk3-prod-afar-media.s3.us-west-2.amazonaws.com%2Fbrightspot%2F24%2F7a%2F25edf10f25288d43eae196696773%2Foriginal-open-uri20130920-21598-1wol0jp',
    subtitle: 'Neighborhood pick with buzzing energy.',
    category: 'Historic Corner'
  },
  {
    name: 'Barometer',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=420&q=80',
    subtitle: 'Popular cocktail and dining spot.',
    category: 'Restaurants'
  }
];

const ratings = ['4.3', '4.5', '4.6', '4.7'];

const buildTrending = (exploreData) => {
  if (!trendTiles) {
    return;
  }

  const allSpots = Object.keys(exploreData).length
    ? Object.entries(exploreData).flatMap(([category, items]) =>
        (items || []).map((item) => ({
          ...item,
          category
        }))
      )
    : fallbackTrending;

  const selected = allSpots.slice(0, 4);

  trendTiles.innerHTML = selected
    .map((spot, index) => {
      const rating = ratings[index % ratings.length];
      const safeName = spot.name || 'Hidden Gem';
      return `
        <figure class="trend-tile is-clickable" role="button" tabindex="0"
          data-id="${spot.id || ''}"
          data-name="${safeName}"
          data-image="${spot.image || ''}"
          data-subtitle="${spot.subtitle || ''}"
          data-category="${spot.category || ''}">
          <img src="${spot.image || ''}" alt="${safeName}" loading="lazy" />
          <figcaption>${safeName}</figcaption>
          <small class="trend-rating">${rating} &#9733;</small>
        </figure>
      `;
    })
    .join('');
};

const openGem = (tile) => {
  const params = new URLSearchParams({
    id: tile.dataset.id || '',
    name: tile.dataset.name || '',
    image: tile.dataset.image || '',
    subtitle: tile.dataset.subtitle || '',
    category: tile.dataset.category || ''
  });
  window.location.href = `gem.html?${params.toString()}`;
};

if (trendTiles) {
  trendTiles.addEventListener('click', (event) => {
    const tile = event.target.closest('.trend-tile');
    if (!tile) {
      return;
    }
    openGem(tile);
  });

  trendTiles.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    const tile = event.target.closest('.trend-tile');
    if (!tile) {
      return;
    }
    event.preventDefault();
    openGem(tile);
  });
}

if (trendCard) {
  trendCard.addEventListener('click', (event) => {
    if (event.target.closest('.trend-tile') || event.target.closest('a')) {
      return;
    }
    window.location.href = 'explore.html?trending=1';
  });
}

const loadTrendData = window.hgsData?.fetchGems
  ? window.hgsData.fetchGems()
  : Promise.resolve(window.exploreData || {});

loadTrendData.then((data) => buildTrending(data)).catch(() => buildTrending(window.exploreData || {}));
