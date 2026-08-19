import { qs } from './dom.js';
import { refreshIcons } from './icons.js';

let resolvePending = null;

export function showConfirmModal(title, description, iconName = 'help-circle') {
  const modal = qs('#custom-modal-overlay');
  qs('#modal-title').textContent = title;
  qs('#modal-description').textContent = description;
  qs('#modal-icon').setAttribute('data-lucide', iconName);

  modal.classList.remove('hidden');
  refreshIcons();

  return new Promise((resolve) => {
    resolvePending = resolve;
  });
}

function settle(result) {
  qs('#custom-modal-overlay').classList.add('hidden');
  if (resolvePending) {
    resolvePending(result);
    resolvePending = null;
  }
}

export function initModal() {
  qs('#modal-confirm-btn').addEventListener('click', () => settle(true));
  qs('#modal-cancel-btn').addEventListener('click', () => settle(false));
}
