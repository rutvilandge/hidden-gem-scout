const USER_GEMS_KEY = 'hgs_user_gems';

const readUserGems = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(USER_GEMS_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeUserGems = (gems) => {
  localStorage.setItem(USER_GEMS_KEY, JSON.stringify(gems));
};

const mergeExploreData = (baseData) => {
  const merged = { ...(baseData || {}) };
  const userGems = readUserGems();
  userGems.forEach((gem) => {
    if (!merged[gem.category]) {
      merged[gem.category] = [];
    }
    merged[gem.category].push({
      name: gem.name,
      image: gem.image,
      subtitle: gem.subtitle,
      link: gem.link,
      submittedBy: gem.submittedBy
    });
  });
  return merged;
};

window.hgsUserGems = {
  read: readUserGems,
  write: writeUserGems
};

window.mergeExploreData = mergeExploreData;
