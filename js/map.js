const mapFrame = document.getElementById('mapExplorerFrame');
const mapOpenLink = document.getElementById('mapExplorerOpen');
const mapList = document.getElementById('mapExplorerList');
const filterWrap = document.getElementById('mapExplorerFilters');

if (mapList) {
  mapList.innerHTML = '<p class="map-explorer-empty">Loading spots...</p>';
}

const fallbackSpots = [
  {
    name: 'antiSOCIAL Pune',
    category: 'Music Gig',
    image:
      'https://lh3.googleusercontent.com/gps-cs-s/AHVAwernvXaygzf4b02sTrTEhqYRFdfbc9XwnBkli--je77Iti0gBiIE2Qc-jeVugzomfLyiPYCBfz_AWQsfoKbCum1OINzAC5jCIrAAwOW4pLpnUDBLCutkpiwwFQm-rxyfWjuWnOP0=s1360-w1360-h1020-rw',
    subtitle: 'Underground gigs and indie showcases.'
  }
];

const normalize = (value) => value.trim().toLowerCase();

const updateMap = (spot) => {
  const query = encodeURIComponent(spot ? spot.name : 'Pune');
  const frameSrc = `https://maps.google.com/maps?q=${query}&output=embed`;
  const openSrc = `https://www.google.com/maps/search/?api=1&query=${query}`;
  if (mapFrame) {
    mapFrame.src = frameSrc;
  }
  if (mapOpenLink) {
    mapOpenLink.href = openSrc;
  }
};

const initMap = (exploreData) => {
  const mapSpots =
    Object.keys(exploreData || {}).length > 0
      ? Object.entries(exploreData).flatMap(([category, spots]) =>
          (spots || []).map((spot) => ({
            ...spot,
            category
          }))
        )
      : fallbackSpots;

  const renderList = (spots) => {
    if (!mapList) {
      return;
    }
    if (!spots.length) {
      mapList.innerHTML =
        '<p class="map-explorer-empty">No spots yet for this vibe. Try another filter.</p>';
      updateMap(null);
      return;
    }

    mapList.innerHTML = spots
      .map((spot) => {
        const subtitle = spot.subtitle || '';
        const byline = spot.submittedBy ? `by ${spot.submittedBy}` : '';
        return `
        <article class="map-explorer-card" data-spot="${spot.name}">
          <img src="${spot.image}" alt="${spot.name}" loading="lazy" />
          <div>
            <h4>${spot.name}</h4>
            <p>${subtitle}</p>
            ${byline ? `<span class="submitted-by">${byline}</span>` : ''}
          </div>
        </article>
      `;
      })
      .join('');
  };

  const applyFilter = (filter) => {
    const selected = filter === 'All' ? mapSpots : mapSpots.filter((spot) => spot.category === filter);
    renderList(mapSpots);
    if (selected.length) {
      updateMap(selected[0]);
    } else {
      updateMap(null);
    }
  };

  const renderFilters = () => {
    if (!filterWrap) {
      return;
    }
    const categories = Object.keys(exploreData || {});
    const filters = ['All', ...categories];
    filterWrap.innerHTML = filters
      .map(
        (filter, index) =>
          `<button class="map-filter ${index === 0 ? 'is-active' : ''}" type="button" data-filter="${filter}">${filter}</button>`
      )
      .join('');

    const filterButtons = Array.from(filterWrap.querySelectorAll('.map-filter'));
    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        filterButtons.forEach((btn) => btn.classList.remove('is-active'));
        button.classList.add('is-active');
        applyFilter(button.dataset.filter || 'All');
      });
    });
  };

  if (mapList) {
    mapList.addEventListener('click', (event) => {
      const card = event.target.closest('.map-explorer-card');
      if (!card) {
        return;
      }
      const name = card.dataset.spot;
      const spot = mapSpots.find((item) => normalize(item.name) === normalize(name));
      if (!spot) {
        return;
      }
      updateMap(spot);
    });
  }

  renderFilters();
  applyFilter('All');
};

const loadMapData = window.hgsData?.fetchGems
  ? window.hgsData.fetchGems()
  : Promise.resolve(window.exploreData || {});

loadMapData.then((data) => initMap(data)).catch(() => initMap(window.exploreData || {}));
