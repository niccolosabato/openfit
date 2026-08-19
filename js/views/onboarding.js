import { qs } from '../ui/dom.js';
import { showToast } from '../ui/toast.js';
import { completeOnboarding } from '../state/actions/dataActions.js';
import { switchTab } from '../router.js';

export function initOnboarding() {
  qs('#onboarding-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const name = qs('#prof-name').value.trim();
    const age = parseInt(qs('#prof-age').value, 10) || 25;
    const height = parseInt(qs('#prof-height').value, 10) || 175;
    const weight = parseFloat(qs('#prof-weight').value) || 70;
    const fitnessGoal = qs('#prof-goal').value;
    const useTemplate = qs('input[name="init-workout-choice"]:checked').value === 'template';

    completeOnboarding({ name, age, height, weight, fitnessGoal, useTemplate });

    qs('#onboarding-screen').classList.add('hidden');
    qs('#main-app').classList.remove('hidden');
    switchTab('dashboard');
    showToast(`Welcome to OpenFit, ${name}!`);
  });
}
