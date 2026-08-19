import { qs, escapeHtml, delegate } from '../ui/dom.js';
import { refreshIcons } from '../ui/icons.js';
import { showToast } from '../ui/toast.js';
import { INPUT_SM } from '../ui/classes.js';
import { getData, getSession } from '../state/store.js';
import { startSession, logSetField, toggleSetCompleted, finishSession } from '../state/actions/sessionActions.js';
import { registerView, switchTab } from '../router.js';
import * as timer from '../timer.js';

function syncTimerUi() {
  const running = timer.isRunning();
  const remaining = timer.getRemaining();

  const displayEl = qs('#timer-display');
  if (displayEl) {
    const secs = remaining ?? 0;
    displayEl.textContent = `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`;
  }

  // #timer-icon is an <i data-lucide> that Lucide replaces with an <svg> after the first
  // refreshIcons() call. SVGElement.className is a read-only SVGAnimatedString, so a plain
  // assignment throws in strict-mode module code — setAttribute works on both element types.
  const iconEl = qs('#timer-icon');
  if (iconEl) iconEl.setAttribute('class', running ? 'w-4 h-4 text-accent animate-spin' : 'w-4 h-4 text-slate-500');

  const btnEl = qs('#timer-control-btn');
  if (btnEl) btnEl.textContent = remaining == null ? 'Start' : (running ? 'Stop' : 'Resume');
}

function startRestTimer(seconds) {
  timer.start(seconds, { onTick: syncTimerUi, onDone: syncTimerUi });
  syncTimerUi();
}

function toggleTimer() {
  if (timer.getRemaining() == null) {
    startRestTimer(90);
    return;
  }
  if (timer.isRunning()) {
    timer.pause();
  } else {
    timer.resume({ onTick: syncTimerUi, onDone: syncTimerUi });
  }
  syncTimerUi();
}

export function startWorkoutSession(dayIndex) {
  const session = startSession(dayIndex);
  if (!session) return;

  qs('#active-session-name').textContent = session.dayName;
  timer.reset();
  syncTimerUi();
  renderSession();
  closeDaySelectorModal();
  switchTab('active-workout');
}

export function renderSession() {
  const container = qs('#active-workout-exercises');
  if (!container) return;

  const session = getSession().activeWorkout;
  if (!session) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = session.exercises.map((ex, exIdx) => {
    const setsRows = ex.setsCompleted.map((completed, setIdx) => {
      const rowClass = completed ? 'bg-accent/5 border-accent/30' : 'bg-slate-950 border-slate-800';
      const btnClass = completed ? 'bg-accent text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-slate-400';
      const icon = completed ? 'check' : 'play';
      return `
        <div class="flex items-center justify-between gap-2 p-2.5 rounded-lg border transition-colors ${rowClass}">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-slate-800 text-xs font-semibold flex items-center justify-center text-slate-400 shrink-0">
              ${setIdx + 1}
            </span>
            <span class="text-sm text-slate-400">Target <strong class="text-slate-200">${escapeHtml(ex.reps)} reps</strong></span>
          </div>

          <div class="flex items-center gap-2">
            <input
              type="text" inputmode="decimal" placeholder="kg"
              value="${escapeHtml(ex.weights[setIdx])}"
              data-ex-index="${exIdx}" data-set-index="${setIdx}" data-field="weight"
              class="session-set-input w-14 bg-slate-900 ${INPUT_SM}"
            >
            <input
              type="text" inputmode="numeric" placeholder="reps"
              value="${escapeHtml(ex.repsLogged[setIdx])}"
              data-ex-index="${exIdx}" data-set-index="${setIdx}" data-field="reps"
              class="session-set-input w-14 bg-slate-900 ${INPUT_SM}"
            >
            <button data-ex-index="${exIdx}" data-set-index="${setIdx}" class="session-toggle-set-btn p-2 rounded-lg transition-colors ${btnClass}">
              <i data-lucide="${icon}" class="w-4 h-4 ${completed ? 'stroke-[3]' : 'fill-current'}"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div class="flex items-center justify-between gap-2">
          <h3 class="font-semibold text-sm text-slate-100">${escapeHtml(ex.name)}</h3>
          <span class="text-xs text-slate-500 shrink-0">${escapeHtml(ex.muscleGroup || 'Other')}</span>
        </div>
        ${ex.notes ? `<p class="text-sm text-slate-500 italic">${escapeHtml(ex.notes)}</p>` : ''}
        <div class="space-y-2">${setsRows}</div>
      </div>
    `;
  }).join('');

  refreshIcons();
}

function handleFinishSession() {
  const finished = finishSession();
  if (!finished) return;
  timer.reset();
  switchTab('history');
  showToast("Workout saved to history!");
}

export function openStartWorkoutSelector() {
  const days = getData().workoutPlan?.days || [];
  if (days.length === 0) {
    showToast("No training days yet — build your split first.", "error");
    return;
  }

  qs('#selector-modal-days-list').innerHTML = days.map((day, idx) => `
    <button data-day-index="${idx}" class="day-selector-btn w-full text-left bg-slate-950 border border-slate-800 hover:border-accent p-3 rounded-lg transition-colors flex justify-between items-center group">
      <div>
        <span class="text-sm font-medium text-slate-200 block">${escapeHtml(day.name)}</span>
        <span class="text-xs text-slate-500 block mt-0.5">${day.exercises ? day.exercises.length : 0} exercises</span>
      </div>
      <i data-lucide="chevron-right" class="w-4 h-4 text-slate-500 group-hover:text-accent transition-colors"></i>
    </button>
  `).join('');

  qs('#day-selector-modal').classList.remove('hidden');
  refreshIcons();
}

export function closeDaySelectorModal() {
  qs('#day-selector-modal').classList.add('hidden');
}

function handleMobileWorkoutAction() {
  if (getSession().activeWorkout) {
    switchTab('active-workout');
  } else {
    openStartWorkoutSelector();
  }
}

export function initSession() {
  registerView('active-workout', renderSession);

  delegate(qs('#active-workout-exercises'), 'input', '.session-set-input', (e, target) => {
    logSetField(parseInt(target.dataset.exIndex, 10), parseInt(target.dataset.setIndex, 10), target.dataset.field, target.value);
  });

  delegate(qs('#active-workout-exercises'), 'click', '.session-toggle-set-btn', (e, target) => {
    const result = toggleSetCompleted(parseInt(target.dataset.exIndex, 10), parseInt(target.dataset.setIndex, 10));
    renderSession();
    if (result?.nowCompleted) startRestTimer(result.restSeconds);
  });

  delegate(qs('#selector-modal-days-list'), 'click', '.day-selector-btn', (e, target) => {
    startWorkoutSession(parseInt(target.dataset.dayIndex, 10));
  });

  qs('#timer-control-btn')?.addEventListener('click', toggleTimer);
  qs('#finish-session-btn')?.addEventListener('click', handleFinishSession);
  qs('#close-day-selector-btn-1')?.addEventListener('click', closeDaySelectorModal);
  qs('#close-day-selector-btn-2')?.addEventListener('click', closeDaySelectorModal);
  qs('#mob-action')?.addEventListener('click', handleMobileWorkoutAction);
}
