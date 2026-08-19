import { getUI } from './state/store.js';
import { syncNavHighlight, updateMobileActionButton } from './views/shell.js';
import { delegate } from './ui/dom.js';

const renderers = {};

// Views register their own renderer so router.js never has to import view modules directly
// (which would create a cycle, since every view imports switchTab from here).
export function registerView(tabId, renderFn) {
  renderers[tabId] = renderFn;
}

export function switchTab(tabId) {
  getUI().activeTab = tabId;

  document.querySelectorAll('.tab-content').forEach((el) => el.classList.add('hidden'));
  document.getElementById(`tab-${tabId}`)?.classList.remove('hidden');

  syncNavHighlight(tabId);
  updateMobileActionButton();

  renderers[tabId]?.();
}

// Any static button anywhere in the app that should simply switch tabs carries
// data-tab="<id>" — this single delegated listener covers the desktop sidebar, the mobile
// bottom bar, and one-off buttons like the header profile icon or the dashboard banner's
// "Edit Split" link.
export function initRouter() {
  delegate(document.body, 'click', '[data-tab]', (event, target) => {
    switchTab(target.dataset.tab);
  });
}
