import { getData, persist, notify } from '../store.js';
import { TEMPLATE_WORKOUT } from '../schema.js';

export function renamePlan(name) {
  getData().workoutPlan.splitName = name;
  persist();
  notify();
}

export function renameDay(dayIdx, name) {
  getData().workoutPlan.days[dayIdx].name = name;
  persist();
  notify();
}

export function addDay() {
  const days = getData().workoutPlan.days;
  days.push({ name: `Day ${days.length + 1}: Custom Routine`, exercises: [] });
  persist();
  notify();
}

export function removeDay(dayIdx) {
  getData().workoutPlan.days.splice(dayIdx, 1);
  persist();
  notify();
}

export function addExercise(dayIdx) {
  getData().workoutPlan.days[dayIdx].exercises.push({
    name: "New Exercise",
    muscleGroup: "Chest",
    sets: 3,
    reps: "10",
    rest: 90,
    notes: "",
  });
  persist();
  notify();
}

export function removeExercise(dayIdx, exIdx) {
  getData().workoutPlan.days[dayIdx].exercises.splice(exIdx, 1);
  persist();
  notify();
}

// Field-level edits (typing in a name/notes/sets/reps/rest input): persist silently, no
// notify. Notifying here would re-render the builder mid-keystroke and drop input focus.
export function updateExerciseField(dayIdx, exIdx, field, value) {
  const ex = getData().workoutPlan.days[dayIdx].exercises[exIdx];
  ex[field] = (field === 'sets' || field === 'rest') ? (parseInt(value, 10) || 0) : value;
  persist();
}

export function loadTemplate() {
  getData().workoutPlan = JSON.parse(JSON.stringify(TEMPLATE_WORKOUT));
  persist();
  notify();
}
