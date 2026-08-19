import { qs, delegate } from '../ui/dom.js';
import { showToast } from '../ui/toast.js';
import { showConfirmModal } from '../ui/modal.js';
import { applyTheme } from '../ui/theme.js';
import { getData } from '../state/store.js';
import { updateProfile, setAccentColor } from '../state/actions/profileActions.js';
import { exportBackup, importBackup, resetAll } from '../state/actions/dataActions.js';
import { registerView, switchTab } from '../router.js';

export function renderProfile() {
  const profile = getData().profile;
  qs('#edit-name').value = profile.name;
  qs('#edit-gender').value = profile.gender;
  qs('#edit-age').value = profile.age;
  qs('#edit-height').value = profile.height;
  qs('#edit-weight').value = profile.weight;
  qs('#edit-goal').value = profile.fitnessGoal;
  qs('#edit-equip').value = profile.equipment;
  qs('#edit-injuries').value = profile.injuries;
}

function handleProfileSubmit(e) {
  e.preventDefault();

  updateProfile({
    name: qs('#edit-name').value,
    gender: qs('#edit-gender').value,
    age: parseInt(qs('#edit-age').value, 10) || 25,
    height: parseInt(qs('#edit-height').value, 10) || 175,
    weight: parseFloat(qs('#edit-weight').value) || 70,
    fitnessGoal: qs('#edit-goal').value,
    equipment: qs('#edit-equip').value,
    injuries: qs('#edit-injuries').value,
  });

  showToast("Profile changes updated successfully!");
  switchTab('dashboard');
}

function handleSetAccent(accentName) {
  setAccentColor(accentName);
  applyTheme(accentName);
  showToast(`Accent theme configured to ${accentName}!`, "info");
}

function handleExportBackup() {
  const dataStr = exportBackup();
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  const exportFileDefaultName = `openfit_backup_${new Date().toISOString().slice(0, 10)}.json`;

  const link = document.createElement('a');
  link.setAttribute('href', dataUri);
  link.setAttribute('download', exportFileDefaultName);
  link.click();
  showToast("Data backup file generated.");
}

function handleImportBackup(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      importBackup(e.target.result);
      applyTheme(getData().profile.accentColor);
      renderProfile();
      showToast("Backup imported successfully!");
      switchTab('dashboard');
    } catch (err) {
      showToast(err.message === 'Incompatible file format.' ? err.message : "Failed to parse JSON file.", "error");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

async function handleResetAll() {
  const confirmed = await showConfirmModal("Factory Reset", "WARNING: This permanently wipes all user profile data, weight histories, and routines. Continue?", "alert-triangle");
  if (confirmed) resetAll();
}

export function initProfile() {
  registerView('profile', renderProfile);

  qs('#profile-edit-form').addEventListener('submit', handleProfileSubmit);

  delegate(qs('#accent-theme-picker'), 'click', 'button[data-accent]', (e, target) => {
    handleSetAccent(target.dataset.accent);
  });

  qs('#profile-export-btn').addEventListener('click', handleExportBackup);
  qs('#sidebar-backup-btn')?.addEventListener('click', handleExportBackup);
  qs('#import-backup-file').addEventListener('change', handleImportBackup);
  qs('#factory-reset-btn').addEventListener('click', handleResetAll);
}
