import { getData, persist, notify } from '../store.js';

export function updateProfile(patch) {
  Object.assign(getData().profile, patch);
  persist();
  notify();
}

export function setAccentColor(accentName) {
  getData().profile.accentColor = accentName;
  persist();
  notify();
}
