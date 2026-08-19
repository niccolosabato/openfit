import { getData, persist, notify } from '../store.js';

export function clearHistory() {
  getData().completedWorkouts = [];
  persist();
  notify();
}
