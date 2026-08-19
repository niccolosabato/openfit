export const INITIAL_PROFILE = {
  name: "",
  age: 25,
  weight: 70,
  height: 175,
  fitnessGoal: "Muscle Mass",
  gender: "Male",
  experience: "Beginner",
  equipment: "Commercial Gym",
  injuries: "",
  accentColor: "emerald",
};

export const COLORS_MAP = {
  emerald: { color: "#10b981", hover: "#059669", glow: "rgba(16, 185, 129, 0.15)" },
  cyan: { color: "#06b6d4", hover: "#0891b2", glow: "rgba(6, 182, 212, 0.15)" },
  violet: { color: "#8b5cf6", hover: "#7c3aed", glow: "rgba(139, 92, 246, 0.15)" },
  amber: { color: "#f59e0b", hover: "#d97706", glow: "rgba(245, 158, 11, 0.15)" },
  rose: { color: "#f43f5e", hover: "#e11d48", glow: "rgba(244, 63, 94, 0.15)" },
};

export const MUSCLE_GROUPS = ["Chest", "Back", "Legs", "Shoulders", "Biceps", "Triceps", "Core", "Other"];

export const TEMPLATE_WORKOUT = {
  splitName: "OpenFit Push-Pull-Legs Split",
  days: [
    {
      name: "Day A: Push (Chest, Shoulders & Triceps)",
      exercises: [
        { name: "Barbell Bench Press", muscleGroup: "Chest", sets: 4, reps: "8-10", rest: 90, notes: "Perform active scapular retraction on the pad." },
        { name: "Dumbbell Shoulder Press", muscleGroup: "Shoulders", sets: 3, reps: "10", rest: 90, notes: "Slightly angle elbows inward to save rotators." },
        { name: "Triceps Rope Pushdowns", muscleGroup: "Triceps", sets: 3, reps: "12", rest: 60, notes: "Spread the rope fully at absolute extension." },
      ],
    },
    {
      name: "Day B: Pull (Back, Rear Delts & Biceps)",
      exercises: [
        { name: "Wide-Grip Lat Pulldown", muscleGroup: "Back", sets: 4, reps: "10-12", rest: 90, notes: "Pull with your elbows, focusing on the lats." },
        { name: "Seated Cable Rows", muscleGroup: "Back", sets: 3, reps: "10", rest: 90, notes: "Squeeze shoulder blades fully in the peak position." },
        { name: "Incline Dumbbell Curl", muscleGroup: "Biceps", sets: 3, reps: "12", rest: 60, notes: "Keep bicep fully stretched at bottom of ROM." },
      ],
    },
    {
      name: "Day C: Legs & Core Focus",
      exercises: [
        { name: "Barbell Back Squats", muscleGroup: "Legs", sets: 4, reps: "8-10", rest: 120, notes: "Ensure hip crease drops parallel to ground." },
        { name: "Standing Calf Raises", muscleGroup: "Legs", sets: 4, reps: "15", rest: 45, notes: "Hold stretch 1s at absolute bottom range." },
        { name: "Hanging Knee Raises", muscleGroup: "Core", sets: 3, reps: "15s", rest: 60, notes: "Tuck hips forward at the peak contraction." },
      ],
    },
  ],
};

export function createInitialDataState() {
  return {
    isProfileCompleted: false,
    profile: { ...INITIAL_PROFILE },
    workoutPlan: { splitName: "My Workout Split", days: [] },
    weightLogs: [],
    completedWorkouts: [],
  };
}
