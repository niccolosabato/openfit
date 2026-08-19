import { getData, getSession, persist, notify } from '../store.js';

export function startSession(dayIndex) {
  const day = getData().workoutPlan.days[dayIndex];
  if (!day) return null;

  const session = {
    dayName: day.name,
    dayIndex,
    startTime: Date.now(),
    exercises: day.exercises.map((ex) => ({
      ...ex,
      setsCompleted: new Array(ex.sets).fill(false),
      weights: new Array(ex.sets).fill(""),
      repsLogged: new Array(ex.sets).fill(""),
    })),
  };

  getSession().activeWorkout = session;
  notify();
  return session;
}

// Field-level set logging: no persist/notify, mirrors the pre-refactor behavior where an
// in-progress session lives only in memory until finishSession() saves it to history.
export function logSetField(exIdx, setIdx, field, value) {
  const session = getSession().activeWorkout;
  if (!session) return;
  if (field === 'weight') {
    session.exercises[exIdx].weights[setIdx] = value;
  } else {
    session.exercises[exIdx].repsLogged[setIdx] = value;
  }
}

export function toggleSetCompleted(exIdx, setIdx) {
  const session = getSession().activeWorkout;
  if (!session) return null;
  const wasCompleted = session.exercises[exIdx].setsCompleted[setIdx];
  session.exercises[exIdx].setsCompleted[setIdx] = !wasCompleted;
  return { nowCompleted: !wasCompleted, restSeconds: session.exercises[exIdx].rest || 90 };
}

export function finishSession() {
  const session = getSession().activeWorkout;
  if (!session) return null;

  const durationMin = Math.round((Date.now() - session.startTime) / 60000);
  const finished = {
    date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
    dayName: session.dayName,
    duration: durationMin,
    exercises: session.exercises.map((ex) => ({
      name: ex.name,
      muscleGroup: ex.muscleGroup || "Other",
      setsCompleted: [...ex.setsCompleted],
      weights: [...ex.weights],
      repsLogged: [...ex.repsLogged],
    })),
  };

  getData().completedWorkouts.push(finished);
  getSession().activeWorkout = null;
  persist();
  notify();
  return finished;
}
