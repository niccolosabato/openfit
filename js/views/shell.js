import { getData, getSession, getUI, subscribe } from '../state/store.js';
import { refreshIcons } from '../ui/icons.js';

const NAV_ACTIVE_CLASS = "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors text-accent bg-accent/10";
const NAV_INACTIVE_CLASS = "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-slate-400 hover:bg-slate-800/60 hover:text-slate-200";
const MOB_ACTIVE_CLASS = "flex flex-col items-center gap-0.5 py-1.5 px-2.5 rounded-lg transition-colors text-accent font-semibold";
const MOB_INACTIVE_CLASS = "flex flex-col items-center gap-0.5 py-1.5 px-2.5 rounded-lg transition-colors text-slate-400";
const MOB_SESSION_ACTIVE_CLASS = "flex flex-col items-center gap-0.5 py-1.5 px-2.5 rounded-lg transition-colors text-amber-500 animate-gentle-pulse font-semibold";
const MOB_SESSION_IDLE_CLASS = "flex flex-col items-center gap-0.5 py-1.5 px-2.5 rounded-lg transition-colors text-slate-400 hover:text-accent";

export function initShell() {
  subscribe(renderShell);
  renderShell();
}

export function renderShell() {
  const data = getData();
  const session = getSession();

  const headerName = document.getElementById('header-user-name');
  if (headerName) headerName.textContent = data.profile.name || "Athlete";

  const headerWeight = document.getElementById('header-user-weight');
  if (headerWeight) headerWeight.textContent = `${data.profile.weight || 0} Kg`;

  document.getElementById('nav-active-workout')?.classList.toggle('hidden', !session.activeWorkout);

  updateMobileActionButton();
}

export function syncNavHighlight(tabId) {
  document.querySelectorAll('#nav-desktop button[data-tab]').forEach((btn) => {
    if (btn.dataset.tab === 'active-workout') return;
    btn.className = btn.dataset.tab === tabId ? NAV_ACTIVE_CLASS : NAV_INACTIVE_CLASS;
  });
  document.querySelectorAll('#nav-mobile button[data-tab]').forEach((btn) => {
    btn.className = btn.dataset.tab === tabId ? MOB_ACTIVE_CLASS : MOB_INACTIVE_CLASS;
  });
}

export function updateMobileActionButton() {
  const btn = document.getElementById('mob-action');
  const label = document.getElementById('mob-action-label');
  const icon = document.getElementById('mob-action-icon');
  if (!btn || !label || !icon) return;

  const hasSession = !!getSession().activeWorkout;

  if (getUI().activeTab === 'active-workout') {
    btn.className = MOB_ACTIVE_CLASS;
  } else if (hasSession) {
    btn.className = MOB_SESSION_ACTIVE_CLASS;
  } else {
    btn.className = MOB_SESSION_IDLE_CLASS;
  }

  label.textContent = hasSession ? "Log Split" : "Train";
  icon.classList.toggle('fill-current', hasSession);
  refreshIcons();
}
