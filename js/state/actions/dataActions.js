import { getData, persist, notify, replaceDataState, resetStorage } from '../store.js';
import { INITIAL_PROFILE, TEMPLATE_WORKOUT } from '../schema.js';

export function completeOnboarding({ name, age, height, weight, fitnessGoal, useTemplate }) {
  const data = getData();
  Object.assign(data.profile, { name, age, height, weight, fitnessGoal, accentColor: 'emerald' });
  data.workoutPlan = useTemplate
    ? JSON.parse(JSON.stringify(TEMPLATE_WORKOUT))
    : { splitName: "My Workout Split", days: [] };
  data.isProfileCompleted = true;
  data.weightLogs = [{ date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' }), weight }];
  persist();
  notify();
}

export function exportBackup() {
  return JSON.stringify(getData());
}

export function importBackup(jsonString) {
  const parsed = JSON.parse(jsonString);
  if (!parsed || !parsed.profile || !parsed.workoutPlan) {
    throw new Error('Incompatible file format.');
  }
  replaceDataState({
    isProfileCompleted: true,
    profile: { ...INITIAL_PROFILE, ...parsed.profile },
    workoutPlan: parsed.workoutPlan,
    weightLogs: parsed.weightLogs || [],
    completedWorkouts: parsed.completedWorkouts || [],
  });
}

export function resetAll() {
  resetStorage();
}
