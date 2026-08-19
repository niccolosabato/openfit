import { qs, escapeHtml, delegate } from '../ui/dom.js';
import { refreshIcons } from '../ui/icons.js';
import { showToast } from '../ui/toast.js';
import { showConfirmModal } from '../ui/modal.js';
import { getData } from '../state/store.js';
import { clearHistory } from '../state/actions/historyActions.js';
import { registerView } from '../router.js';

function renderExerciseDetail(ex) {
  const setsCompletedCount = ex.setsCompleted.filter(Boolean).length;

  const subDetails = ex.setsCompleted.map((completed, setIdx) => {
    const kg = ex.weights[setIdx] || '--';
    const rep = ex.repsLogged[setIdx] || '--';
    return `
      <span class="text-xs ${completed ? 'text-slate-300' : 'text-slate-600'} bg-slate-900 px-2 py-1 rounded-md">
        ${escapeHtml(kg)}kg × ${escapeHtml(rep)}
      </span>
    `;
  }).join('');

  return `
    <div class="px-4 py-3 border-b border-slate-850 last:border-b-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div>
        <div class="flex items-center gap-2">
          <span class="font-medium text-slate-200 text-sm">${escapeHtml(ex.name)}</span>
          <span class="text-xs text-slate-500">${escapeHtml(ex.muscleGroup || 'Other')}</span>
        </div>
        <span class="text-xs text-slate-500 block mt-0.5">${setsCompletedCount}/${ex.setsCompleted.length} sets completed</span>
      </div>
      <div class="flex flex-wrap gap-1.5">${subDetails}</div>
    </div>
  `;
}

function renderWorkoutCard(workout, uniqId) {
  const exercisesListHtml = workout.exercises.map(renderExerciseDetail).join('');

  return `
    <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div data-target="${uniqId}" class="history-toggle-btn p-4 flex justify-between items-center cursor-pointer hover:bg-slate-800/40 transition-colors select-none">
        <div>
          <div class="flex items-center gap-2 text-xs text-slate-500">
            <span>${escapeHtml(workout.date)}</span>
            <span>·</span>
            <span>${workout.duration} min</span>
          </div>
          <h3 class="font-semibold text-sm text-slate-200 mt-0.5">${escapeHtml(workout.dayName)}</h3>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span class="text-xs text-slate-500">${workout.exercises.length} exercises</span>
          <i data-lucide="chevron-down" class="w-4 h-4 text-slate-500 transition-transform duration-200" id="${uniqId}-icon"></i>
        </div>
      </div>
      <div id="${uniqId}" class="hidden border-t border-slate-800 max-h-[300px] overflow-y-auto">
        ${exercisesListHtml}
      </div>
    </div>
  `;
}

export function renderHistory() {
  const container = qs('#history-container');
  if (!container) return;

  const completedWorkouts = getData().completedWorkouts || [];
  if (completedWorkouts.length === 0) {
    container.innerHTML = `
      <div class="border border-dashed border-slate-800 p-8 rounded-2xl text-center text-sm text-slate-500">
        No workouts logged yet. Finish a session to see it here.
      </div>
    `;
    return;
  }

  container.innerHTML = [...completedWorkouts].reverse()
    .map((workout, idx) => renderWorkoutCard(workout, `hist-item-${idx}`))
    .join('');

  refreshIcons();
}

function toggleCollapsible(id) {
  const target = document.getElementById(id);
  const icon = document.getElementById(`${id}-icon`);
  if (!target || !icon) return;
  const collapsed = target.classList.toggle('hidden');
  icon.style.transform = collapsed ? 'rotate(0deg)' : 'rotate(180deg)';
}

async function handleClearHistory() {
  const confirmed = await showConfirmModal("Clear all history?", "This permanently deletes every logged workout. This can't be undone.", "trash-2");
  if (!confirmed) return;
  clearHistory();
  renderHistory();
  showToast("History cleared.", "info");
}

export function initHistory() {
  registerView('history', renderHistory);

  delegate(qs('#history-container'), 'click', '.history-toggle-btn', (e, target) => {
    toggleCollapsible(target.dataset.target);
  });

  qs('#clear-history-btn').addEventListener('click', handleClearHistory);
}
