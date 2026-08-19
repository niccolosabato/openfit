// Shared Tailwind class tokens. Centralizing these avoids re-typing (and drifting) the same
// card/button/input strings across every view's render function, and keeps the visual
// language consistent app-wide.

export const CARD = "bg-slate-900 border border-slate-800 rounded-2xl";
export const SURFACE = "bg-slate-950 border border-slate-800 rounded-xl";

export const EYEBROW = "text-xs font-semibold uppercase tracking-wide text-accent";
export const LABEL = "text-xs font-medium text-slate-400 block mb-1";
export const HINT = "text-sm text-slate-500";

// No background color baked in — callers pair these with whichever surface shade (bg-slate-900
// on a slate-950 card, or vice versa) gives contrast against their container.
export const INPUT = "w-full border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-accent transition-colors";
export const INPUT_SM = "border border-slate-800 rounded-lg px-2 py-2 text-sm text-center text-slate-200 focus:outline-none focus:border-accent transition-colors";

export const BTN_PRIMARY = "bg-accent hover:bg-accent-hover text-slate-950 px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50";
export const BTN_SECONDARY = "bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border border-slate-700 active:scale-[0.98]";
export const BTN_GHOST = "text-slate-400 hover:text-slate-200 transition-colors text-sm font-medium";
export const BTN_DANGER = "text-rose-400 hover:text-rose-300 transition-colors text-sm font-medium";
export const BTN_ICON = "p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-200";
export const BTN_ICON_DANGER = "p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors";

export const BADGE = "text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300";
export const BADGE_ACCENT = "text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20";
