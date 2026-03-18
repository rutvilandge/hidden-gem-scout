const detailRoot = document.getElementById('gemDetail');
const params = new URLSearchParams(window.location.search);
let storageKey = 'hgs_saved_gems_guest';

const escapeHTML = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const makeSlug = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const isUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value || ''
  );

const similarPool = [
  {
    name: 'Blue Tokai Coffee Roasters',
    image:
      'https://lh3.googleusercontent.com/p/AF1QipMpRU3rPBspHfAkDoovG14SiK4HaNCgq87CCtZv=s1360-w1360-h1020-rw',
    subtitle: 'Specialty coffee and artisan brews'
  },
  {
    name: 'The Camden Lane',
    image:
      'https://lh3.googleusercontent.com/p/AF1QipORVhN-ulHZ7onq25h9sPKYfmJ5Tq1ZBEtiZx46=w325-h218-n-k-no',
    subtitle: 'European-style cafe and bakery'
  },
  {
    name: 'Le Flamington',
    image:
      'https://lh3.googleusercontent.com/p/AF1QipP4RV0V2nDiRDjCEb-624ov07lD-o4kB-cTjIwH=s1360-w1360-h1020-rw',
    subtitle: 'Dessert cafe known for signature treats'
  },
  {
    name: 'Pimlico',
    image:
      'https://lh3.googleusercontent.com/gps-cs-s/AHVAwerCFd2MP8wxLlAbmhFYsTy31E7zxbHPE7KETbFbXVwqvSoRKSmFv9KkUVyruKRqKYZEQbpqV55Zc5cg487exrSUM3gqGno5aIt1fJpNfAe2UGved9RwmAFmjDgF_eTSrePgiKg=s1360-w1360-h1020-rw',
    subtitle: 'Chic cafe with global menu vibes'
  }
];

if (detailRoot) {
  const rawName = params.get('name') || 'Hidden Gem';
  const rawImage = params.get('image') || '';
  const rawSubtitle = params.get('subtitle') || 'Discover this place on Hidden Gem Scout.';
  const rawCategory = params.get('category') || 'Unknown';
  const rawId = params.get('id') || makeSlug(rawName);

  const name = escapeHTML(rawName);
  const image = escapeHTML(rawImage);
  const subtitle = escapeHTML(rawSubtitle);
  const category = escapeHTML(rawCategory);

  const mapQuery = encodeURIComponent(rawName);
  const mapEmbedSrc = `https://maps.google.com/maps?q=${mapQuery}&output=embed`;
  const mapOpenUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  const ratingSeed = rawName.length % 7;
  const rating = (4.3 + ratingSeed * 0.08).toFixed(1);
  const budgetOptions = ['₹600-₹900 for two', '₹900-₹1400 for two', '₹1400-₹2000 for two'];
  const bestTimeOptions = ['8:00 AM - 11:00 AM', '4:00 PM - 7:00 PM', '7:30 PM - 10:00 PM'];
  const crowdOptions = ['Calm', 'Moderate', 'Buzzing'];
  const stayOptions = ['60-90 mins', '90-120 mins', '120+ mins'];
  const musicOptions = ['Acoustic', 'Lo-fi', 'Ambient'];
  const budget = budgetOptions[rawName.length % budgetOptions.length];
  const bestTime = bestTimeOptions[(rawName.length + rawCategory.length) % bestTimeOptions.length];
  const crowd = crowdOptions[rawName.length % crowdOptions.length];
  const stayDuration = stayOptions[(rawName.length + 1) % stayOptions.length];
  const music = musicOptions[(rawName.length + 2) % musicOptions.length];

  let savedIds = new Set();
  let isSaved = false;

  const loadSavedAndReviews = async () => {
    let supaSaved = new Set();
    if (window.hgsData?.getSession) {
      const session = await window.hgsData.getSession();
      const userId = session?.data?.session?.user?.id;
      if (userId) {
        storageKey = `hgs_saved_gems_${userId}`;
      }
    }
    if (window.hgsData?.fetchSavedGemIds) {
      supaSaved = await window.hgsData.fetchSavedGemIds();
    }
    let localSaved = new Set();
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || '[]');
      localSaved = new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
      localSaved = new Set();
    }
    savedIds = new Set([...supaSaved, ...localSaved]);
    isSaved = savedIds.has(rawId);

  };

  const similar = similarPool.filter((item) => item.name !== rawName).slice(0, 3);
  const vibeTags = ['Cozy', 'Aesthetic', 'Date Spot', 'Work Friendly'].slice(
    0,
    3 + (rawName.length % 2)
  );

  const render = () => {
    detailRoot.innerHTML = `
    <section class="gem-top gem-animate-up" aria-label="Gem details heading">
      <h1>Gem Details</h1>
      <p class="gem-top-subtitle">${name}</p>
    </section>

    <article class="gem-hero gem-animate-up">
      ${image ? `<img src="${image}" alt="${name}" />` : ''}
      <div class="gem-hero-overlay">
        <p class="gem-category">${category}</p>
        <h2>${name}</h2>
        <p class="gem-subtitle">${subtitle}</p>
        <div class="gem-vibes">
          ${vibeTags.map((tag) => `<span class="gem-vibe-tag">${escapeHTML(tag)}</span>`).join('')}
        </div>
        <div class="gem-meta-row">
          <span class="gem-rating-pill">${rating} &#9733;</span>
          <button class="gem-save-btn ${isSaved ? 'is-saved' : ''}" id="gemSaveBtn" type="button" aria-pressed="${isSaved ? 'true' : 'false'}">Save &#10084;</button>
          <a class="gem-back-link" href="explore.html">Back to Explore</a>
        </div>
      </div>
    </article>

    <section class="gem-quick-info-row gem-animate-up">
      <article class="gem-quick-card"><h3>Budget</h3><p>${escapeHTML(budget)}</p></article>
      <article class="gem-quick-card"><h3>Best Time</h3><p>${escapeHTML(bestTime)}</p></article>
      <article class="gem-quick-card"><h3>Crowd</h3><p>${escapeHTML(crowd)}</p></article>
      <article class="gem-quick-card"><h3>Stay</h3><p>${escapeHTML(stayDuration)}</p></article>
      <article class="gem-quick-card"><h3>Music</h3><p>${escapeHTML(music)}</p></article>
    </section>

    <section class="gem-content-grid gem-animate-up">
      <section class="gem-panel gem-reveal-panel">
        <h2>Description</h2>
        <p>${subtitle}</p>
        <p>This place is part of our curated ${category.toLowerCase()} discoveries in Pune. Expect a distinct setting, quality menu, and a vibe that makes repeat visits worth it.</p>
        <div class="gem-facts">
          <article class="gem-fact">
            <h3>Budget</h3>
            <p>${escapeHTML(budget)}</p>
          </article>
          <article class="gem-fact">
            <h3>Best Time</h3>
            <p>${escapeHTML(bestTime)}</p>
          </article>
        </div>
      </section>

      <section class="gem-panel gem-reveal-panel" id="gemMapSection">
        <h2>Map</h2>
        <div class="gem-map-wrap">
          <iframe title="Map for ${name}" loading="lazy" src="${mapEmbedSrc}"></iframe>
        </div>
        <p><a href="${mapOpenUrl}" target="_blank" rel="noopener noreferrer">Open in Google Maps</a></p>
      </section>
    </section>

    <section class="gem-panel gem-reveal-panel">
      <h2>Similar Gems</h2>
      <div class="gem-similar-grid">
        ${similar
          .map((item) => {
            const itemId = makeSlug(item.name);
            const qs = new URLSearchParams({
              id: itemId,
              name: item.name,
              image: item.image,
              subtitle: item.subtitle,
              category: rawCategory
            }).toString();
            return `
              <a class="gem-similar-card" href="gem.html?${qs}">
                <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}" loading="lazy" />
                <div>
                  <h3>${escapeHTML(item.name)}</h3>
                  <p>${escapeHTML(item.subtitle)}</p>
                </div>
              </a>
            `;
          })
          .join('')}
      </div>
    </section>

    <div class="gem-sticky-cta" id="gemStickyCta">
      <button class="gem-sticky-save ${isSaved ? 'is-saved' : ''}" id="gemStickySave" type="button">Save &#10084;</button>
      <a class="gem-sticky-map" href="${mapOpenUrl}" target="_blank" rel="noopener noreferrer">Directions</a>
    </div>
  `;
  };

  loadSavedAndReviews()
    .then(() => {
      render();
      bindActions();
    })
    .catch(() => {
      render();
      bindActions();
    });

  const bindActions = () => {
    const saveBtn = document.getElementById('gemSaveBtn');
    const stickySaveBtn = document.getElementById('gemStickySave');
    const stickyCta = document.getElementById('gemStickyCta');

    const syncSaveUI = () => {
      const nextSaved = savedIds.has(rawId);
      if (saveBtn) {
        saveBtn.classList.toggle('is-saved', nextSaved);
        saveBtn.setAttribute('aria-pressed', nextSaved ? 'true' : 'false');
      }
      if (stickySaveBtn) {
        stickySaveBtn.classList.toggle('is-saved', nextSaved);
      }
    };

    const toggleSave = () => {
      const willSave = !savedIds.has(rawId);
      if (isUuid(rawId) && window.hgsData?.saveGem) {
        const action = willSave ? window.hgsData.saveGem : window.hgsData.unsaveGem;
        action(rawId)
          .then(() => {
            if (willSave) {
              savedIds.add(rawId);
            } else {
              savedIds.delete(rawId);
            }
            syncSaveUI();
          })
          .catch((error) => {
            console.warn('Save failed:', error.message);
          });
      } else {
        if (willSave) {
          savedIds.add(rawId);
        } else {
          savedIds.delete(rawId);
        }
        const localOnly = Array.from(savedIds).filter((id) => !isUuid(id));
        localStorage.setItem(storageKey, JSON.stringify(localOnly));
        syncSaveUI();
      }
    };

    if (saveBtn) {
      saveBtn.addEventListener('click', toggleSave);
    }

    if (stickySaveBtn) {
      stickySaveBtn.addEventListener('click', toggleSave);
    }


    if (stickyCta) {
      window.addEventListener('scroll', () => {
        stickyCta.classList.toggle('is-visible', window.scrollY > 280);
      });
    }

    const revealPanels = Array.from(document.querySelectorAll('.gem-reveal-panel'));
    if (revealPanels.length) {
      const panelObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              panelObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.14 }
      );
      revealPanels.forEach((panel) => panelObserver.observe(panel));
    }
  };
}
