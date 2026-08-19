import { qs, escapeHtml, delegate } from '../ui/dom.js';
import { refreshIcons } from '../ui/icons.js';
import { showToast } from '../ui/toast.js';
import { showConfirmModal } from '../ui/modal.js';
import { getData } from '../state/store.js';
import { MUSCLE_GROUPS } from '../state/schema.js';
import { LABEL, INPUT, INPUT_SM, BTN_PRIMARY, BTN_SECONDARY, BTN_ICON_DANGER } from '../ui/classes.js';
import {
  renamePlan,
  renameDay,
  addDay,
  removeDay,
  addExercise,
  removeExercise,
  updateExerciseField,
  loadTemplate,
} from '../state/actions/planActions.js';
import { registerView } from '../router.js';

function renderEmptyState() {
  return `
    <div class="border border-dashed border-slate-800 p-10 rounded-2xl text-center">
      <i data-lucide="pencil-ruler" class="w-8 h-8 text-slate-600 mx-auto mb-3"></i>
      <h3 class="text-sm font-medium text-slate-300">No training days yet</h3>
      <p class="text-sm text-slate-500 max-w-xs mx-auto mt-1 mb-4 leading-relaxed">Load a ready-made split or add a day to build your own from scratch.</p>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-2">
        <button id="builder-load-template-btn" class="w-full sm:w-auto ${BTN_SECONDARY} flex items-center justify-center gap-1.5">
          <i data-lucide="sparkles" class="w-4 h-4 text-accent"></i> Load Push/Pull/Legs
        </button>
        <button id="builder-add-day-btn-empty" class="w-full sm:w-auto ${BTN_PRIMARY} flex items-center justify-center gap-1.5">
          <i data-lucide="plus" class="w-4 h-4"></i> Add a training day
        </button>
      </div>
    </div>
  `;
}

function renderExerciseRow(dayIdx, exIdx, ex) {
  const mgOptions = MUSCLE_GROUPS.map((g) => `<option value="${g}" ${ex.muscleGroup === g ? 'selected' : ''}>${g}</option>`).join('');
  const field = (name, extra = '') => `data-day-index="${dayIdx}" data-ex-index="${exIdx}" data-field="${name}"${extra}`;

  return `
    <div class="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <div class="md:col-span-4">
          <label class="${LABEL}">Exercise</label>
          <input type="text" value="${escapeHtml(ex.name)}" ${field('name')} class="builder-ex-field ${INPUT} bg-slate-900">
        </div>

        <div class="md:col-span-2">
          <label class="${LABEL}">Muscle</label>
          <select ${field('muscleGroup')} class="builder-ex-field ${INPUT} bg-slate-900">
            ${mgOptions}
          </select>
        </div>

        <div class="grid grid-cols-3 gap-2 md:col-span-3">
          <div>
            <label class="${LABEL} text-center">Sets</label>
            <input type="number" min="1" value="${ex.sets}" ${field('sets')} class="builder-ex-field w-full ${INPUT_SM} bg-slate-900">
          </div>
          <div>
            <label class="${LABEL} text-center">Reps</label>
            <input type="text" value="${escapeHtml(ex.reps)}" ${field('reps')} class="builder-ex-field w-full ${INPUT_SM} bg-slate-900">
          </div>
          <div>
            <label class="${LABEL} text-center">Rest (s)</label>
            <input type="number" step="5" value="${ex.rest}" ${field('rest')} class="builder-ex-field w-full ${INPUT_SM} bg-slate-900">
          </div>
        </div>

        <div class="md:col-span-3 flex items-end gap-2">
          <div class="flex-1">
            <label class="${LABEL}">Notes</label>
            <input type="text" value="${escapeHtml(ex.notes || '')}" placeholder="Optional" ${field('notes')} class="builder-ex-field ${INPUT} bg-slate-900">
          </div>
          <button data-day-index="${dayIdx}" data-ex-index="${exIdx}" title="Remove exercise" class="builder-remove-ex-btn shrink-0 ${BTN_ICON_DANGER}">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderDayBox(day, dayIdx) {
  const exHtml = day.exercises && day.exercises.length > 0
    ? day.exercises.map((ex, exIdx) => renderExerciseRow(dayIdx, exIdx, ex)).join('')
    : `<p class="text-center text-sm text-slate-500 italic py-3">No exercises in this day yet.</p>`;

  return `
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-800">
        <div class="flex items-center gap-2.5 w-full sm:w-auto">
          <span class="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center font-semibold text-xs text-accent shrink-0">${dayIdx + 1}</span>
          <input type="text" value="${escapeHtml(day.name)}" data-day-index="${dayIdx}" class="builder-day-name-field bg-transparent border-b border-transparent hover:border-slate-700 focus:border-accent text-sm font-semibold text-slate-100 focus:outline-none py-0.5 w-full sm:w-64">
        </div>

        <div class="flex items-center gap-1.5 w-full sm:w-auto justify-end shrink-0">
          <button data-day-index="${dayIdx}" class="builder-add-ex-btn bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Exercise
          </button>
          <button data-day-index="${dayIdx}" title="Delete day" class="builder-remove-day-btn shrink-0 ${BTN_ICON_DANGER}">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>

      <div class="space-y-2">${exHtml}</div>
    </div>
  `;
}

export function renderBuilder() {
  const container = qs('#builder-days-container');
  if (!container) return;

  const data = getData();
  const planNameInput = qs('#builder-plan-name');
  if (planNameInput) planNameInput.value = data.workoutPlan?.splitName || "";

  const days = data.workoutPlan?.days || [];
  container.innerHTML = days.length === 0
    ? renderEmptyState()
    : days.map((day, idx) => renderDayBox(day, idx)).join('');

  refreshIcons();
}

async function handleRemoveDay(dayIdx) {
  const confirmed = await showConfirmModal("Delete this day?", "This removes the training day and every exercise in it. This can't be undone.", "trash-2");
  if (!confirmed) return;
  removeDay(dayIdx);
  renderBuilder();
  showToast("Day removed.", "info");
}

async function handleLoadTemplate() {
  const confirmed = await showConfirmModal("Load template?", "This replaces your current split with the Push/Pull/Legs template. Continue?", "sparkles");
  if (!confirmed) return;
  loadTemplate();
  renderBuilder();
  showToast("Template loaded!");
}

export function initBuilder() {
  registerView('workout-builder', renderBuilder);

  const container = qs('#builder-days-container');

  qs('#builder-plan-name').addEventListener('input', (e) => renamePlan(e.target.value));

  qs('#builder-add-day-btn').addEventListener('click', () => {
    addDay();
    renderBuilder();
    showToast("Training day added.");
  });

  qs('#builder-load-template-header-btn').addEventListener('click', handleLoadTemplate);

  delegate(container, 'input', '.builder-day-name-field', (e, target) => {
    renameDay(parseInt(target.dataset.dayIndex, 10), target.value);
  });

  delegate(container, 'input', '.builder-ex-field', (e, target) => {
    updateExerciseField(parseInt(target.dataset.dayIndex, 10), parseInt(target.dataset.exIndex, 10), target.dataset.field, target.value);
  });

  delegate(container, 'click', '.builder-add-ex-btn', (e, target) => {
    addExercise(parseInt(target.dataset.dayIndex, 10));
    renderBuilder();
  });

  delegate(container, 'click', '.builder-remove-ex-btn', (e, target) => {
    removeExercise(parseInt(target.dataset.dayIndex, 10), parseInt(target.dataset.exIndex, 10));
    renderBuilder();
  });

  delegate(container, 'click', '.builder-remove-day-btn', (e, target) => {
    handleRemoveDay(parseInt(target.dataset.dayIndex, 10));
  });

  delegate(container, 'click', '#builder-load-template-btn', handleLoadTemplate);
  delegate(container, 'click', '#builder-add-day-btn-empty', () => {
    addDay();
    renderBuilder();
    showToast("Training day added.");
  });
}
