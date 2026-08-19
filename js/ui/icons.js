// Single point of contact with the Lucide CDN global. Call after any DOM update that
// introduces new `data-lucide` elements.
export function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}
