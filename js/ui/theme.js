import { COLORS_MAP } from '../state/schema.js';

export function applyTheme(accentName) {
  const map = COLORS_MAP[accentName] || COLORS_MAP.emerald;

  let styleEl = document.getElementById('theme-style-override');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'theme-style-override';
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = `:root { --accent-color: ${map.color}; --accent-hover: ${map.hover}; --accent-glow: ${map.glow}; }`;
}
