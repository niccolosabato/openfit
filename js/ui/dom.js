export function qs(selector, root = document) {
  return root.querySelector(selector);
}

export function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

const ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ESCAPE_MAP[c]);
}

// Attaches a single listener on `root` and dispatches it to whichever descendant matching
// `selector` was the actual click/input/etc target. Survives re-renders of root's innerHTML
// since the listener lives on the container, not on the regenerated children.
export function delegate(root, eventType, selector, handler) {
  if (!root) return;
  root.addEventListener(eventType, (event) => {
    const target = event.target.closest(selector);
    if (target && root.contains(target)) {
      handler(event, target);
    }
  });
}
