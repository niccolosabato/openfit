import { loadFromStorage, getData } from './state/store.js';
import { applyTheme } from './ui/theme.js';
import { refreshIcons } from './ui/icons.js';
import { initModal } from './ui/modal.js';
import { initRouter, switchTab } from './router.js';
import { initShell } from './views/shell.js';
import { initOnboarding } from './views/onboarding.js';
import { initDashboard } from './views/dashboard.js';
import { initBuilder } from './views/builder.js';
import { initSession } from './views/session.js';
import { initHistory } from './views/history.js';
import { initAnalytics } from './views/analytics.js';
import { initProfile } from './views/profile.js';

// A `type="module"` script is deferred by spec (runs after the document is parsed), so no
// window.onload wrapper is needed here.
function boot() {
  loadFromStorage();
  applyTheme(getData().profile.accentColor);

  initModal();
  initRouter();
  initShell();
  initOnboarding();
  initDashboard();
  initBuilder();
  initSession();
  initHistory();
  initAnalytics();
  initProfile();

  const data = getData();
  document.getElementById('onboarding-screen').classList.toggle('hidden', data.isProfileCompleted);
  document.getElementById('main-app').classList.toggle('hidden', !data.isProfileCompleted);

  if (data.isProfileCompleted) {
    switchTab('dashboard');
  }

  refreshIcons();
}

boot();
