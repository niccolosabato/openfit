import { getData, persist, notify } from '../store.js';

export function logWeight(weightVal) {
  const today = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  const logs = getData().weightLogs;
  logs.push({ date: today, weight: weightVal });
  if (logs.length > 6) logs.shift();
  getData().profile.weight = weightVal;
  persist();
  notify();
}
