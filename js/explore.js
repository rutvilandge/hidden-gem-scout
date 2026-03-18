const tagGroup = document.querySelector('.explore-tags');
const searchForm = document.querySelector('.explore-search');
const searchInput = document.getElementById('exploreSearchInput');
const searchResults = document.getElementById('exploreSearchResults');
const resultsTitle = document.getElementById('exploreResultsTitle');
const gemGrid = document.getElementById('exploreGemGrid');
const filterChips = document.getElementById('exploreFilterChips');
const scrollSentinel = document.getElementById('exploreScrollSentinel');
const resultsSection = document.getElementById('exploreResultsSection');
const stickySaveButton = document.getElementById('exploreStickySave');
const savedCountLabel = document.getElementById('exploreSavedCount');
const exploreBanner = document.createElement('div');

const initExplore = (gemDataInput) => {
  let storageKey = 'hgs_saved_gems_guest';
  const PAGE_SIZE = 6;

  const tagButtons = Array.from(tagGroup.querySelectorAll('.explore-tag-btn'));
  const allButton = tagGroup.querySelector('.explore-tag-btn.is-all');
  const categoryButtons = tagButtons.filter((button) => !button.classList.contains('is-all'));
  const filterButtons = filterChips
    ? Array.from(filterChips.querySelectorAll('.explore-filter-chip'))
    : [];
  const urlParams = new URLSearchParams(window.location.search);
  let isTrendingMode = urlParams.get('trending') === '1';

  const normalize = (value) => value.trim().toLowerCase();
  const isUuid = (value) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value || ''
    );
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

  const gemData = gemDataInput || {};

  const allGems = Object.entries(gemData).flatMap(([category, gems]) =>
    gems.map((gem) => ({ ...gem, category, id: gem.id || makeSlug(gem.name) }))
  );

  let activeCategory = 'All';
  let activeFilter = 'all';
  let visibleCount = PAGE_SIZE;
  let activeResultIndex = -1;
  let filteredGems = [];
  let savedIds = new Set();
  let cardObserver = null;
  let sentinelObserver = null;
  let sectionObserver = null;
  let isAdmin = false;

  exploreBanner.className = 'explore-banner';
  exploreBanner.hidden = true;
  if (resultsSection && !resultsSection.querySelector('.explore-banner')) {
    resultsSection.prepend(exploreBanner);
  }

  const loadSaved = async () => {
    let supabaseIds = new Set();
    if (window.hgsData?.getSession) {
      const session = await window.hgsData.getSession();
      const userId = session?.data?.session?.user?.id;
      if (userId) {
        storageKey = `hgs_saved_gems_${userId}`;
      }
    }
    if (window.hgsData?.fetchSavedGemIds) {
      supabaseIds = await window.hgsData.fetchSavedGemIds();
    }
    let localIds = new Set();
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || '[]');
      localIds = new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
      localIds = new Set();
    }
    savedIds = new Set([...supabaseIds, ...localIds]);
  };

  const persistLocalSaved = () => {
    const localOnly = Array.from(savedIds).filter((id) => !isUuid(id));
    localStorage.setItem(storageKey, JSON.stringify(localOnly));
  };

  const updateSavedUI = () => {
    if (savedCountLabel) {
      savedCountLabel.textContent = String(savedIds.size);
    }
  };

  const scrollToResults = () => {
    if (!resultsSection) {
      return;
    }
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getFilteredGems = () => {
    const byCategory =
      activeCategory === 'All' ? [...allGems] : allGems.filter((gem) => gem.category === activeCategory);

    let next = byCategory;
    if (activeFilter === 'saved') {
      next = next.filter((gem) => savedIds.has(gem.id));
    }
    if (activeFilter === 'az') {
      next = [...next].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (activeFilter === 'trending' || isTrendingMode) {
      next = next.slice(0, 12);
    }
    return next;
  };

  const closeSearchResults = () => {
    if (!searchResults) {
      return;
    }
    activeResultIndex = -1;
    searchResults.hidden = true;
    searchResults.innerHTML = '';
  };

  const updateResultHighlight = () => {
    if (!searchResults) {
      return;
    }
    const items = Array.from(searchResults.querySelectorAll('.explore-search-result-btn'));
    items.forEach((item, index) => {
      const isActive = index === activeResultIndex;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  };

  const renderSearchResults = (query) => {
    if (!searchResults) {
      return;
    }
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) {
      closeSearchResults();
      return;
    }

    const matches = categoryButtons.filter((button) =>
      normalize(button.textContent || '').includes(normalizedQuery)
    );

    if (!matches.length) {
      searchResults.hidden = false;
      searchResults.innerHTML = '<p class="explore-search-empty">No categories found</p>';
      activeResultIndex = -1;
      return;
    }

    searchResults.hidden = false;
    searchResults.innerHTML = matches
      .map((button) => {
        const category = button.textContent.trim();
        const safeCategory = escapeHTML(category);
        return `<button class="explore-search-result-btn" type="button" data-category="${safeCategory}" aria-selected="false">${safeCategory}</button>`;
      })
      .join('');
    activeResultIndex = 0;
    updateResultHighlight();
  };

  const updateFilterUI = () => {
    filterButtons.forEach((button) => {
      const isActive = button.dataset.filter === activeFilter;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const observeCardsOnScroll = () => {
    if (!gemGrid) {
      return;
    }
    if (cardObserver) {
      cardObserver.disconnect();
    }
    cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            cardObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );

    gemGrid.querySelectorAll('.explore-gem-card').forEach((card) => {
      cardObserver.observe(card);
    });
  };

  const observeSectionsOnScroll = () => {
    const sections = Array.from(document.querySelectorAll('.fade-section'));
    if (!sections.length) {
      return;
    }

    if (sectionObserver) {
      sectionObserver.disconnect();
    }

    sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            sectionObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    sections.forEach((section) => {
      sectionObserver.observe(section);
    });
  };

  const renderGems = (reset = true) => {
    if (!gemGrid || !resultsTitle) {
      return;
    }

    filteredGems = getFilteredGems();
    if (reset) {
      visibleCount = PAGE_SIZE;
    } else {
      visibleCount += PAGE_SIZE;
    }

    const shown = filteredGems.slice(0, Math.min(visibleCount, filteredGems.length));
    const titleBase =
      activeFilter === 'trending' || isTrendingMode
        ? 'Trending Picks'
        : activeCategory === 'All'
          ? 'Top Picks'
          : `${activeCategory} Picks`;
    resultsTitle.textContent = `${titleBase} (${filteredGems.length})`;

    if (!shown.length) {
      gemGrid.innerHTML =
        '<article class="explore-gem-card is-visible"><div class="explore-gem-card-copy"><h3>Nothing here yet</h3><p>Try another filter or save a gem first.</p></div></article>';
      return;
    }

    gemGrid.innerHTML = shown
      .map((gem) => {
        const saved = savedIds.has(gem.id);
        const subtitle = gem.subtitle;
        const byline = gem.submittedBy ? `by ${gem.submittedBy}` : '';
        const needsApproval = isAdmin && gem.approved === false;
        return `
          <article class="explore-gem-card" data-gem-id="${gem.id}">
            <button class="explore-save-btn ${saved ? 'is-saved' : ''}" type="button" data-save-id="${gem.id}" aria-label="${saved ? 'Unsave' : 'Save'} ${escapeHTML(gem.name)}" aria-pressed="${saved ? 'true' : 'false'}">&#10084;</button>
            ${needsApproval ? `<button class="explore-approve-btn" type="button" data-approve-id="${gem.id}">Approve</button>` : ''}
            <button
              class="explore-gem-open"
              type="button"
              data-open-id="${gem.id}"
              data-name="${escapeHTML(gem.name)}"
              data-image="${escapeHTML(gem.image)}"
              data-subtitle="${escapeHTML(subtitle)}"
              data-byline="${escapeHTML(byline)}"
              data-category="${escapeHTML(gem.category)}"
              aria-label="Open details for ${escapeHTML(gem.name)}"
            >
              <img src="${escapeHTML(gem.image)}" alt="${escapeHTML(gem.name)}" loading="lazy" />
              <div class="explore-gem-card-copy">
                <h3>${escapeHTML(gem.name)}</h3>
                <p>${escapeHTML(subtitle)}</p>
                ${byline ? `<span class="submitted-by">${escapeHTML(byline)}</span>` : ''}
                ${needsApproval ? `<span class="approve-pill">Pending Approval</span>` : ''}
              </div>
            </button>
          </article>
        `;
      })
      .join('');

    observeCardsOnScroll();
  };

  const applyCategory = (category, shouldScroll = false) => {
    if (isTrendingMode && category !== 'All') {
      isTrendingMode = false;
      if (activeFilter === 'trending') {
        activeFilter = 'all';
        updateFilterUI();
      }
    }
    activeCategory = category;
    tagButtons.forEach((button) => {
      const isActive = button.textContent.trim() === category;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
    tagGroup.dataset.activeCategory = category;
    window.dispatchEvent(new CustomEvent('explore:categoryChange', { detail: { category } }));
    renderGems(true);
    if (shouldScroll) {
      scrollToResults();
    }
  };

  tagButtons.forEach((button, index) => {
    button.style.setProperty('--tag-delay', `${index * 36}ms`);
  });

  tagGroup.addEventListener('click', (event) => {
    const button = event.target.closest('.explore-tag-btn');
    if (!button || !tagGroup.contains(button)) {
      return;
    }
    const category = button.textContent.trim();
    applyCategory(category, true);
    if (searchInput) {
      searchInput.value = category === 'All' ? '' : category;
    }
    closeSearchResults();
  });

  if (filterChips) {
    filterChips.addEventListener('click', (event) => {
      const button = event.target.closest('.explore-filter-chip');
      if (!button) {
        return;
      }
      if (isTrendingMode) {
        isTrendingMode = false;
      }
      activeFilter = button.dataset.filter || 'all';
      updateFilterUI();
      renderGems(true);
      scrollToResults();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const value = searchInput.value;
      renderSearchResults(value);
      if (!normalize(value) && allButton) {
        applyCategory(allButton.textContent.trim(), true);
      }
    });

    searchInput.addEventListener('keydown', (event) => {
      if (!searchResults || searchResults.hidden) {
        return;
      }
      const items = Array.from(searchResults.querySelectorAll('.explore-search-result-btn'));
      if (!items.length) {
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        activeResultIndex = (activeResultIndex + 1) % items.length;
        updateResultHighlight();
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        activeResultIndex = activeResultIndex <= 0 ? items.length - 1 : activeResultIndex - 1;
        updateResultHighlight();
      }
    });
  }

  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const query = normalize(searchInput.value);
      if (!query) {
        applyCategory('All', true);
        closeSearchResults();
        return;
      }
      const exact = categoryButtons.find((button) => normalize(button.textContent || '') === query);
      const partial = categoryButtons.find((button) =>
        normalize(button.textContent || '').includes(query)
      );
      const activeItem =
        activeResultIndex > -1
          ? searchResults?.querySelectorAll('.explore-search-result-btn')[activeResultIndex]
          : null;
      const highlighted = activeItem
        ? categoryButtons.find((button) => button.textContent.trim() === activeItem.dataset.category)
        : null;
      const match = highlighted || exact || partial;
      if (match) {
        const category = match.textContent.trim();
        applyCategory(category, true);
        searchInput.value = category;
      }
      closeSearchResults();
    });
  }

  if (searchResults) {
    searchResults.addEventListener('click', (event) => {
      const item = event.target.closest('.explore-search-result-btn');
      if (!item) {
        return;
      }
      applyCategory(item.dataset.category || 'All', true);
      if (searchInput) {
        searchInput.value = item.dataset.category || '';
      }
      closeSearchResults();
    });
  }

  if (gemGrid) {
    gemGrid.addEventListener('click', (event) => {
      const saveButton = event.target.closest('.explore-save-btn');
      if (saveButton) {
        const gemId = saveButton.dataset.saveId;
        if (!gemId) {
          return;
        }
        const isSaved = savedIds.has(gemId);
        if (isUuid(gemId) && window.hgsData?.saveGem) {
          const action = isSaved ? window.hgsData.unsaveGem : window.hgsData.saveGem;
          action(gemId)
            .then(() => {
              if (isSaved) {
                savedIds.delete(gemId);
              } else {
                savedIds.add(gemId);
              }
              updateSavedUI();
              renderGems(true);
            })
            .catch((error) => {
              console.warn('Save failed:', error.message);
            });
        } else {
          if (isSaved) {
            savedIds.delete(gemId);
          } else {
            savedIds.add(gemId);
          }
          persistLocalSaved();
          updateSavedUI();
          renderGems(true);
        }
        return;
      }

      const approveButton = event.target.closest('.explore-approve-btn');
      if (approveButton) {
        const gemId = approveButton.dataset.approveId;
        if (!gemId || !window.hgsData?.approveGem) {
          return;
        }
        window.hgsData
          .approveGem(gemId)
          .then(() => {
            const target = allGems.find((gem) => gem.id === gemId);
            if (target) {
              target.approved = true;
            }
            renderGems(true);
          })
          .catch((error) => {
            exploreBanner.textContent = error.message || 'Approval failed.';
            exploreBanner.hidden = false;
          });
        return;
      }

      const openButton = event.target.closest('.explore-gem-open');
      if (!openButton) {
        return;
      }
      const params = new URLSearchParams({
        id: openButton.dataset.openId || '',
        name: openButton.dataset.name || '',
        image: openButton.dataset.image || '',
        subtitle: openButton.dataset.subtitle || '',
        category: openButton.dataset.category || ''
      });
      window.location.href = `gem.html?${params.toString()}`;
    });
  }

  if (stickySaveButton) {
    stickySaveButton.addEventListener('click', () => {
      activeFilter = 'saved';
      updateFilterUI();
      renderGems(true);
      scrollToResults();
    });

    window.addEventListener('scroll', () => {
      const show = window.scrollY > 220;
      stickySaveButton.classList.toggle('is-visible', show);
    });
  }

  if (scrollSentinel) {
    sentinelObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          if (visibleCount >= filteredGems.length) {
            return;
          }
          renderGems(false);
        });
      },
      { rootMargin: '220px 0px' }
    );
    sentinelObserver.observe(scrollSentinel);
  }

  document.addEventListener('click', (event) => {
    if (
      searchForm &&
      !searchForm.contains(event.target) &&
      searchResults &&
      !searchResults.contains(event.target)
    ) {
      closeSearchResults();
    }
  });

  const initialCategory = urlParams.get('category');
  loadSaved()
    .then(() => {
      const sessionPromise = window.hgsData?.getSession ? window.hgsData.getSession() : Promise.resolve();
      return sessionPromise.then((session) => {
        const user = session?.data?.session?.user;
        isAdmin = window.isHgsAdmin ? window.isHgsAdmin(user) : false;
      });
    })
    .then(() => {
      updateSavedUI();
      updateFilterUI();
      observeSectionsOnScroll();
      applyCategory('All');
      if (initialCategory) {
        applyCategory(initialCategory, true);
      }
      if (isTrendingMode) {
        scrollToResults();
      }
    })
    .catch((error) => {
      if (exploreBanner) {
        exploreBanner.textContent = error?.message || 'Unable to load latest data. Showing cached gems.';
        exploreBanner.hidden = false;
      }
      updateSavedUI();
      updateFilterUI();
      observeSectionsOnScroll();
      applyCategory('All');
    });
};

if (tagGroup) {
  if (gemGrid) {
    gemGrid.innerHTML = '<p class="explore-loading">Loading gems...</p>';
  }
  const load = window.hgsData?.fetchGems
    ? window.hgsData.fetchGems()
    : Promise.resolve(window.exploreData || {});
  load.then((data) => initExplore(data)).catch(() => initExplore(window.exploreData || {}));
}
