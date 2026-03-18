const submitForm = document.getElementById('submitGemForm');
const categorySelect = document.getElementById('gemCategory');
const statusLabel = document.getElementById('submitStatus');
const userNameInput = document.getElementById('gemUserName');

const initSubmitForm = async () => {
  const session = await window.hgsData.getSession();
  if (!session?.data?.session) {
    window.location.href = 'signin.html';
    return;
  }

  const fetchedData = window.hgsData?.fetchGems
    ? await window.hgsData.fetchGems()
    : {};
  const fallbackData = window.exploreData || {};
  const exploreData = Object.keys(fetchedData).length ? fetchedData : fallbackData;
  if (userNameInput) {
    const metaName = session?.data?.session?.user?.user_metadata?.full_name;
    userNameInput.value = metaName || '';
  }

  if (categorySelect) {
    const categories = Object.keys(exploreData);
    categorySelect.innerHTML = categories
      .map((category) => `<option value="${category}">${category}</option>`)
      .join('');
  }
};

initSubmitForm();

const showStatus = (message, isSuccess = false) => {
  if (!statusLabel) {
    return;
  }
  statusLabel.textContent = message;
  statusLabel.dataset.state = isSuccess ? 'success' : 'error';
};

if (submitForm) {
  submitForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('gemName')?.value.trim();
    const image = document.getElementById('gemImage')?.value.trim();
    const subtitle = document.getElementById('gemSubtitle')?.value.trim();
    const category = document.getElementById('gemCategory')?.value;
    const link = document.getElementById('gemLink')?.value.trim();
    const submittedBy = document.getElementById('gemUserName')?.value.trim();

    if (!submittedBy || !name || !image || !subtitle || !category) {
      showStatus('Please fill all required fields.');
      return;
    }

    const newGem = {
      submittedBy,
      name,
      image,
      subtitle,
      category,
      link
    };

    window.hgsData
      .submitGem(newGem)
      .then(() => {
        showStatus('Gem submitted! Redirecting to Explore...', true);
        setTimeout(() => {
          window.location.href = `explore.html?category=${encodeURIComponent(category)}`;
        }, 800);
      })
      .catch((error) => {
        showStatus(error.message || 'Failed to submit gem.');
      });
  });
}
