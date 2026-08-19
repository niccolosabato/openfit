import { qs, escapeHtml } from '../ui/dom.js';
import { showToast } from '../ui/toast.js';
import { getData } from '../state/store.js';
import { MUSCLE_GROUPS } from '../state/schema.js';
import { logWeight } from '../state/actions/weightActions.js';
import { registerView } from '../router.js';

function renderWeightChart() {
  const weightChart = qs('#analytics-weight-chart');
  if (!weightChart) return;

  const logs = getData().weightLogs || [];
  if (logs.length === 0) {
    weightChart.innerHTML = `<p class="text-sm text-slate-500 w-full text-center pb-8">No weight logged yet.</p>`;
    return;
  }

  const weights = logs.map((l) => l.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW;

  weightChart.innerHTML = logs.map((log) => {
    const percentage = range === 0 ? 55 : ((log.weight - minW) / range) * 55 + 25;
    return `
      <div class="flex flex-col items-center flex-1 h-full justify-end select-none">
        <span class="text-xs text-accent font-semibold mb-1">${log.weight}</span>
        <div style="height: ${percentage}%" class="w-6 sm:w-10 bg-accent rounded-t-md transition-all"></div>
        <span class="text-xs text-slate-500 mt-1.5 truncate max-w-[45px]">${escapeHtml(log.date)}</span>
      </div>
    `;
  }).join('');
}

function updateExerciseLoadDropdown() {
  const selector = qs('#analytics-exercise-selector');
  if (!selector) return;

  const prevVal = selector.value;
  const exercisesSet = new Set();
  getData().completedWorkouts.forEach((workout) => {
    workout.exercises?.forEach((ex) => { if (ex.name) exercisesSet.add(ex.name); });
  });

  const sorted = Array.from(exercisesSet).sort();
  selector.innerHTML = '<option value="">Select an exercise...</option>' +
    sorted.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join('');

  if (prevVal && exercisesSet.has(prevVal)) {
    selector.value = prevVal;
  } else {
    qs('#analytics-load-progression-container')?.classList.add('hidden');
  }
}

function renderExerciseLoadProgression() {
  const selector = qs('#analytics-exercise-selector');
  const container = qs('#analytics-load-progression-container');
  if (!selector || !container) return;

  const exName = selector.value;
  if (!exName) {
    container.classList.add('hidden');
    return;
  }
  container.classList.remove('hidden');

  const historyPoints = [];
  getData().completedWorkouts.forEach((workout) => {
    workout.exercises?.forEach((ex) => {
      if (ex.name !== exName) return;
      const validSets = ex.weights
        .map((w, idx) => ({
          weight: parseFloat(w) || 0,
          reps: parseInt(ex.repsLogged[idx], 10) || 0,
          completed: ex.setsCompleted ? ex.setsCompleted[idx] : true,
        }))
        .filter((set) => set.completed && set.weight > 0);

      if (validSets.length > 0) {
        const maxSet = validSets.reduce((max, cur) => (cur.weight > max.weight ? cur : max), validSets[0]);
        historyPoints.push({ date: workout.date, maxWeight: maxSet.weight, reps: maxSet.reps });
      }
    });
  });

  if (historyPoints.length === 0) {
    container.innerHTML = `<p class="text-sm text-slate-500 italic text-center py-2">No completed sets logged for this exercise yet.</p>`;
    return;
  }

  const maxAllTime = Math.max(...historyPoints.map((p) => p.maxWeight));

  const rows = [...historyPoints].reverse().map((pt) => {
    const isPR = pt.maxWeight === maxAllTime;
    const prBadge = isPR ? `<span class="text-xs font-semibold text-amber-400">PR</span>` : "";
    return `
      <div class="flex justify-between items-center text-sm p-2.5 rounded-lg bg-slate-900">
        <span class="text-slate-400 text-xs">${escapeHtml(pt.date)}</span>
        <div class="flex items-center gap-2">
          ${prBadge}
          <strong class="text-slate-100">${pt.maxWeight} kg</strong>
          <span class="text-slate-500 text-xs">× ${pt.reps}</span>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `<div class="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">${rows}</div>`;
}

function renderMuscleGroupVolumes() {
  const muscleContainer = qs('#muscle-groups-bars');
  if (!muscleContainer) return;

  const groupVolumes = {};
  MUSCLE_GROUPS.forEach((g) => { groupVolumes[g] = 0; });

  getData().completedWorkouts.forEach((workout) => {
    workout.exercises?.forEach((ex) => {
      const mg = ex.muscleGroup || "Other";
      if (groupVolumes[mg] === undefined) groupVolumes[mg] = 0;
      ex.weights?.forEach((w, idx) => {
        const rep = parseInt(ex.repsLogged[idx], 10) || 0;
        const kg = parseFloat(w) || 0;
        groupVolumes[mg] += rep * kg;
      });
    });
  });

  const maxVol = Math.max(...Object.values(groupVolumes), 1);

  muscleContainer.innerHTML = MUSCLE_GROUPS.map((g) => {
    const vol = groupVolumes[g] || 0;
    const percentage = (vol / maxVol) * 100;
    return `
      <div class="space-y-1">
        <div class="flex justify-between items-center text-sm">
          <span class="text-slate-300">${g}</span>
          <span class="text-slate-500">${vol} kg</span>
        </div>
        <div class="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
          <div style="width: ${percentage}%" class="bg-accent h-full rounded-full transition-all duration-500"></div>
        </div>
      </div>
    `;
  }).join('');
}

export function renderAnalytics() {
  renderWeightChart();
  updateExerciseLoadDropdown();
  renderExerciseLoadProgression();
  renderMuscleGroupVolumes();
}

export function initAnalytics() {
  registerView('analytics', renderAnalytics);

  qs('#analytics-weight-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = qs('#new-weight-val');
    const weightVal = parseFloat(input.value);
    if (Number.isNaN(weightVal)) return;

    logWeight(weightVal);
    input.value = "";
    renderAnalytics();
    showToast("Weight logged!");
  });

  qs('#analytics-exercise-selector').addEventListener('change', renderExerciseLoadProgression);
}
