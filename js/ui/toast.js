import { qs } from './dom.js';
import { refreshIcons } from './icons.js';

const TYPE_STYLES = {
  success: { icon: 'check-circle', colorClass: 'text-accent border-accent/20 bg-accent/5' },
  error: { icon: 'alert-triangle', colorClass: 'text-rose-400 border-rose-500/20 bg-rose-500/5' },
  info: { icon: 'info', colorClass: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5' },
};

export function showToast(message, type = 'success') {
  const container = qs('#toast-container');
  if (!container) return;

  const { icon, colorClass } = TYPE_STYLES[type] || TYPE_STYLES.success;

  const toast = document.createElement('div');
  toast.className = `p-3 rounded-2xl border text-xs font-extrabold flex items-center gap-2 shadow-2xl transition-all duration-300 transform translate-y-2 opacity-0 shrink-0 pointer-events-auto w-full bg-slate-900 ${colorClass}`;

  const iconEl = document.createElement('i');
  iconEl.setAttribute('data-lucide', icon);
  iconEl.className = 'w-4 h-4 shrink-0';

  const textEl = document.createElement('span');
  textEl.className = 'flex-1';
  textEl.textContent = message;

  toast.append(iconEl, textEl);
  container.appendChild(toast);
  refreshIcons();

  setTimeout(() => toast.classList.remove('translate-y-2', 'opacity-0'), 10);
  setTimeout(() => {
    toast.classList.add('opacity-0', '-translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
