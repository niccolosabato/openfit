import { qs, escapeHtml, delegate } from '../ui/dom.js';
import { refreshIcons } from '../ui/icons.js';
import { getData } from '../state/store.js';
import { registerView } from '../router.js';
import { startWorkoutSession, openStartWorkoutSelector } from './session.js';
import { BTN_PRIMARY } from '../ui/classes.js';

function computeTotalVolume(completedWorkouts) {
  let total = 0;
  completedWorkouts.forEach((workout) => {
    workout.exercises?.forEach((ex) => {
      ex.weights?.forEach((w, idx) => {
        const reps = parseInt(ex.repsLogged[idx], 10) || 0;
        const kg = parseFloat(w) || 0;
        total += reps * kg;
      });
    });
  });
  return Math.round(total);
}

export function renderDashboard() {
  const data = getData();

  qs('#dash-user-name').textContent = data.profile.name || "there";
  qs('#stat-weight').textContent = data.profile.weight || "--";
  qs('#stat-completed-count').textContent = data.completedWorkouts.length;
  qs('#stat-total-volume').textContent = computeTotalVolume(data.completedWorkouts);
  qs('#stat-split-name').textContent = data.workoutPlan?.splitName || "My Workout Split";

  renderWorkoutDaysGrid();
}

function renderWorkoutDaysGrid() {
  const grid = qs('#dashboard-days-grid');
  if (!grid) return;

  const days = getData().workoutPlan?.days || [];

  if (days.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full border border-dashed border-slate-800 p-6 rounded-xl text-center">
        <i data-lucide="calendar" class="w-6 h-6 text-slate-600 mx-auto mb-2"></i>
        <h4 class="text-sm font-medium text-slate-300">No training days yet</h4>
        <p class="text-sm text-slate-500 mt-0.5 mb-3">Build a split to start tracking workouts.</p>
        <button data-tab="workout-builder" class="${BTN_PRIMARY}">Build a routine</button>
      </div>
    `;
    refreshIcons();
    return;
  }

  grid.innerHTML = days.map((day, idx) => {
    const count = day.exercises ? day.exercises.length : 0;
    const preview = count > 0
      ? day.exercises.map((e) => escapeHtml(e.name)).slice(0, 3).join(', ') + (count > 3 ? '…' : '')
      : 'No exercises added yet.';

    return `
      <div class="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div>
          <div class="flex justify-between items-start gap-2">
            <h4 class="font-semibold text-sm text-slate-200 truncate max-w-[75%]">${escapeHtml(day.name)}</h4>
            <span class="text-xs text-slate-500 shrink-0">${count} ex</span>
          </div>
          <p class="text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">${preview}</p>
        </div>

        <button data-day-index="${idx}" class="dashboard-train-btn mt-3 ${BTN_PRIMARY} flex items-center justify-center gap-1.5">
          <i data-lucide="play" class="w-3.5 h-3.5 fill-current"></i>
          <span>Train</span>
        </button>
      </div>
    `;
  }).join('');

  refreshIcons();
}

export function initDashboard() {
  registerView('dashboard', renderDashboard);

  delegate(qs('#dashboard-days-grid'), 'click', '.dashboard-train-btn', (event, target) => {
    startWorkoutSession(parseInt(target.dataset.dayIndex, 10));
  });

  qs('#dashboard-start-session-btn')?.addEventListener('click', openStartWorkoutSelector);
}
