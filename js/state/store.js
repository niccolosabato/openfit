import { INITIAL_PROFILE, createInitialDataState } from './schema.js';

const STORAGE_KEYS = {
  completed: 'openfit_v3_profile_completed',
  profile: 'openfit_v3_profile',
  plan: 'openfit_v3_workout_plan',
  weightLogs: 'openfit_v3_weight_logs',
  completedWorkouts: 'openfit_v3_completed_workouts',
};

// Persisted profile/plan/history data.
let dataState = createInitialDataState();
// Transient active-workout tracking, never written to localStorage (matches prior behavior:
// an in-progress session is lost on refresh).
let sessionState = { activeWorkout: null };
// Transient UI state, never persisted.
let uiState = { activeTab: 'dashboard' };

// Only the shell subscribes: header stats and the active-workout badge should reflect every
// data mutation. Individual tab views are NOT driven by this subscription — they re-render
// themselves explicitly after the specific actions that affect their own content, so that
// unrelated mutations (e.g. logging body weight) don't blow away a builder/session input the
// user is mid-typing in on another tab.
const listeners = new Set();

export function getData() {
  return dataState;
}

export function getSession() {
  return sessionState;
}

export function getUI() {
  return uiState;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function notify() {
  listeners.forEach((fn) => fn());
}

function safeParse(json, fallback) {
  if (!json) return fallback;
  try {
    const parsed = JSON.parse(json);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function loadFromStorage() {
  const completed = localStorage.getItem(STORAGE_KEYS.completed) === 'true';
  if (!completed) return;

  dataState.isProfileCompleted = true;
  dataState.profile = { ...INITIAL_PROFILE, ...safeParse(localStorage.getItem(STORAGE_KEYS.profile), {}) };
  dataState.workoutPlan = safeParse(localStorage.getItem(STORAGE_KEYS.plan), { splitName: "My Workout Split", days: [] });
  dataState.weightLogs = safeParse(localStorage.getItem(STORAGE_KEYS.weightLogs), []);
  dataState.completedWorkouts = safeParse(localStorage.getItem(STORAGE_KEYS.completedWorkouts), []);
}

export function persist() {
  localStorage.setItem(STORAGE_KEYS.completed, String(dataState.isProfileCompleted));
  localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(dataState.profile));
  localStorage.setItem(STORAGE_KEYS.plan, JSON.stringify(dataState.workoutPlan));
  localStorage.setItem(STORAGE_KEYS.weightLogs, JSON.stringify(dataState.weightLogs));
  localStorage.setItem(STORAGE_KEYS.completedWorkouts, JSON.stringify(dataState.completedWorkouts));
}

export function replaceDataState(newState) {
  dataState = newState;
  persist();
  notify();
}

export function resetStorage() {
  localStorage.clear();
  location.reload();
}
