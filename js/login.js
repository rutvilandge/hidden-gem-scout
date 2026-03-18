const loginForm = document.getElementById('loginForm');
const loginName = document.getElementById('loginName');
const statusLabel = document.getElementById('loginStatus');
const modeButtons = Array.from(document.querySelectorAll('.auth-toggle-btn'));
const submitBtn = document.getElementById('authSubmitBtn');
let authMode = 'signin';

const getNextTarget = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('next') || 'explore.html';
};

const showStatus = (message, isSuccess = false) => {
  if (!statusLabel) {
    return;
  }
  statusLabel.textContent = message;
  statusLabel.dataset.state = isSuccess ? 'success' : 'error';
};

const updateModeUI = () => {
  modeButtons.forEach((button) => {
    const isActive = button.dataset.mode === authMode;
    button.classList.toggle('is-active', isActive);
  });
  if (submitBtn) {
    submitBtn.textContent = authMode === 'signup' ? 'Create Account' : 'Sign In';
  }
  if (loginName) {
    loginName.required = authMode === 'signup';
  }
};

if (modeButtons.length) {
  modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      authMode = button.dataset.mode || 'signin';
      updateModeUI();
      showStatus('');
    });
  });
  updateModeUI();
}

if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    showStatus(authMode === 'signup' ? 'Creating account...' : 'Signing in...', true);

    const name = loginName?.value.trim();
    const email = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value.trim();

    if (!email || !password) {
      showStatus('Email and password are required.');
      return;
    }
    if (authMode === 'signup' && !name) {
      showStatus('Name is required to create an account.');
      return;
    }

    try {
      if (authMode === 'signup') {
        const result = await window.hgsData.signUp({ email, password, name });
        if (result && result.user && !result.session) {
          showStatus('Account created! Please check your email to confirm.', true);
          return;
        }
      } else {
        await window.hgsData.signIn({ email, password });
      }

      showStatus('Success! Redirecting...', true);
      window.location.href = getNextTarget();
    } catch (error) {
      showStatus(error.message || 'Sign in failed. Please try again.');
    }
  });
}
