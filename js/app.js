const scene = document.getElementById('scene');
const landing = document.getElementById('landing');
const layers = Array.from(document.querySelectorAll('.layer'));
const polaroidTrack = document.getElementById('polaroidTrack');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const polaroidCards = [
  { name: 'Cafe', image: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=900&q=80' },
  { name: 'Nature Spot', image: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=900&q=80' },
  { name: 'Street Food', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80' },
  { name: 'Art Space', image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=900&q=80' },
  { name: 'Thrift Shop', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80' },
  { name: 'Run Club', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=80' },
  { name: 'Restaurant', image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=80' },
  { name: 'Historic Corner', image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=900&q=80' },
  { name: 'Music Gig', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80' },
  { name: 'Standup', image: 'https://img.freepik.com/free-vector/stand-up-comedy-logo-with-microphone_1308-95780.jpg?semt=ais_user_personalization&w=740&q=80' }
];

const colorPairs = [
  ['#ffd7e6', '#d7e8ff'],
  ['#ffe1c9', '#ffeccf'],
  ['#d0f0e8', '#d5e4ff'],
  ['#ead8ff', '#ffd8ea'],
  ['#ffd9c9', '#f3ddff'],
  ['#d9f8ff', '#ffe2d5']
];

if (polaroidTrack) {
  polaroidCards.forEach((card, index) => {
    const item = document.createElement('article');
    const image = document.createElement('div');
    const imageTag = document.createElement('img');
    const label = document.createElement('p');
    const [shadeA, shadeB] = colorPairs[index % colorPairs.length];

    item.className = 'polaroid-item';
    image.className = 'polaroid-image';
    imageTag.className = 'polaroid-photo';
    label.className = 'polaroid-label';

    item.style.setProperty('--shade-a', shadeA);
    item.style.setProperty('--shade-b', shadeB);
    imageTag.src = card.image;
    imageTag.alt = card.name;
    imageTag.loading = 'lazy';
    label.textContent = card.name;

    image.appendChild(imageTag);
    item.append(image, label);
    polaroidTrack.appendChild(item);
  });

  polaroidTrack.append(...Array.from(polaroidTrack.children).map((card) => card.cloneNode(true)));
  polaroidTrack.style.setProperty('--marquee-duration', `${Math.max(30, polaroidCards.length * 2.1)}s`);
}

if (scene && layers.length && !reduceMotion) {
  scene.addEventListener('pointermove', (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 2;
    const y = (event.clientY / window.innerHeight - 0.5) * 2;

    layers.forEach((layer) => {
      const depth = Number(layer.dataset.depth || 0.1);
      const moveX = x * depth * 46;
      const moveY = y * depth * 38;
      layer.style.transform = `translate3d(${moveX}px, ${moveY}px, ${depth * 160}px)`;
    });
  });

  scene.addEventListener('pointerleave', () => {
    layers.forEach((layer) => {
      layer.style.transform = '';
    });
  });
}

const pastelBackgrounds = [
  { bg1: '#fff1f9', bg2: '#f8eefe', bg3: '#f5edff' },
  { bg1: '#fff4fb', bg2: '#f6ebff', bg3: '#f3e9ff' },
  { bg1: '#ffeef8', bg2: '#f4e7ff', bg3: '#f1e6ff' },
  { bg1: '#fff3fc', bg2: '#f8f0ff', bg3: '#f4edff' },
  { bg1: '#ffeffa', bg2: '#f5e9ff', bg3: '#f2e8ff' }
];

if (landing && !reduceMotion) {
  let backgroundIndex = 0;
  landing.style.transition = 'background 1.6s ease-in-out';

  setInterval(() => {
    backgroundIndex = (backgroundIndex + 1) % pastelBackgrounds.length;
    const next = pastelBackgrounds[backgroundIndex];
    document.documentElement.style.setProperty('--bg-1', next.bg1);
    document.documentElement.style.setProperty('--bg-2', next.bg2);
    document.documentElement.style.setProperty('--bg-3', next.bg3);
  }, 15000);
}

const aiScoutInput = document.getElementById('aiScoutInput');
const aiScoutBtn = document.getElementById('aiScoutBtn');
const aiScoutOpenButtons = Array.from(document.querySelectorAll('.ai-scout-open'));
const submitGemBtn = document.getElementById('submitGemBtn');
const submitGemSection = document.getElementById('submit-gem');

const openAiScout = (query) => {
  const trimmed = (query || '').trim();
  const url = trimmed ? `ai-scout.html?q=${encodeURIComponent(trimmed)}` : 'ai-scout.html';
  window.location.href = url;
};

if (aiScoutBtn && aiScoutInput) {
  aiScoutBtn.addEventListener('click', () => {
    openAiScout(aiScoutInput.value);
  });

  aiScoutInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') {
      return;
    }
    event.preventDefault();
    openAiScout(aiScoutInput.value);
  });
}

aiScoutOpenButtons.forEach((button) => {
  button.addEventListener('click', () => openAiScout(''));
});

const updateSubmitVisibility = async () => {
  if (!submitGemSection) {
    return;
  }
  const session = await window.hgsData?.getSession?.();
  const isSignedIn = Boolean(session?.data?.session);
  submitGemSection.hidden = !isSignedIn;
};

updateSubmitVisibility();

if (submitGemBtn) {
  submitGemBtn.addEventListener('click', async () => {
    const session = await window.hgsData?.getSession?.();
    window.location.href = session?.data?.session ? 'submit-gem.html' : 'signin.html';
  });
}


const mapModal = document.getElementById('mapExplorerModal');
const mapOpenButtons = Array.from(document.querySelectorAll('.map-explorer-open'));

if (mapModal && mapOpenButtons.length) {
  const closeTriggers = Array.from(mapModal.querySelectorAll('[data-map-close]'));
  const modalCard = mapModal.querySelector('.map-explorer-modal-card');

  const openModal = () => {
    mapModal.classList.add('is-open');
    mapModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('map-modal-open');
  };

  const closeModal = () => {
    mapModal.classList.remove('is-open');
    mapModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('map-modal-open');
  };

  mapOpenButtons.forEach((button) => {
    button.addEventListener('click', openModal);
  });

  closeTriggers.forEach((trigger) => {
    trigger.addEventListener('click', closeModal);
  });

  if (modalCard) {
    modalCard.addEventListener('click', (event) => {
      event.stopPropagation();
    });
  }

  mapModal.addEventListener('click', closeModal);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mapModal.classList.contains('is-open')) {
      closeModal();
    }
  });
}
