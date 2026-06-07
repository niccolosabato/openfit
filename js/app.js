const INITIAL_PROFILE = {
      name: "",
      age: 25,
      weight: 70,
      height: 175,
      fitnessGoal: "Muscle Mass",
      gender: "Male",
      experience: "Beginner",
      equipment: "Commercial Gym",
      injuries: "",
      accentColor: 'emerald'
    };

    let state = {
      isProfileCompleted: false,
      activeTab: 'dashboard',
      profile: { ...INITIAL_PROFILE },
      workoutPlan: {
        splitName: "My Training Split",
        days: []
      },
      weightLogs: [],
      completedWorkouts: [],
      // Active training session variables
      activeWorkoutSession: null,
      timerSeconds: null,
      timerActive: false,
      timerInterval: null
    };

    const COLORS_MAP = {
      emerald: { color: "#10b981", hover: "#059669", glow: "rgba(16, 185, 129, 0.15)" },
      cyan: { color: "#06b6d4", hover: "#0891b2", glow: "rgba(6, 182, 212, 0.15)" },
      violet: { color: "#8b5cf6", hover: "#7c3aed", glow: "rgba(139, 92, 246, 0.15)" },
      amber: { color: "#f59e0b", hover: "#d97706", glow: "rgba(245, 158, 11, 0.15)" },
      rose: { color: "#f43f5e", hover: "#e11d48", glow: "rgba(244, 63, 94, 0.15)" }
    };

    const MUSCLE_GROUPS = ["Chest", "Back", "Legs", "Shoulders", "Biceps", "Triceps", "Core", "Other"];

    // Standard pre-defined Workout Split (Upper / Lower / Legs)
    const TEMPLATE_WORKOUT = {
      splitName: "OpenFit Push-Pull-Legs Split",
      days: [
        {
          name: "Day A: Push (Chest, Shoulders & Triceps)",
          exercises: [
            { name: "Barbell Bench Press", muscleGroup: "Chest", sets: 4, reps: "8-10", rest: 90, notes: "Perform active scapular retraction on the pad." },
            { name: "Dumbbell Shoulder Press", muscleGroup: "Shoulders", sets: 3, reps: "10", rest: 90, notes: "Slightly angle elbows inward to save rotators." },
            { name: "Triceps Rope Pushdowns", muscleGroup: "Triceps", sets: 3, reps: "12", rest: 60, notes: "Spread the rope fully at absolute extension." }
          ]
        },
        {
          name: "Day B: Pull (Back, Rear Delts & Biceps)",
          exercises: [
            { name: "Wide-Grip Lat Pulldown", muscleGroup: "Back", sets: 4, reps: "10-12", rest: 90, notes: "Pull with your elbows, focusing on the lats." },
            { name: "Seated Cable Rows", muscleGroup: "Back", sets: 3, reps: "10", rest: 90, notes: "Squeeze shoulder blades fully in the peak position." },
            { name: "Incline Dumbbell Curl", muscleGroup: "Biceps", sets: 3, reps: "12", rest: 60, notes: "Keep bicep fully stretched at bottom of ROM." }
          ]
        },
        {
          name: "Day C: Legs & Core Focus",
          exercises: [
            { name: "Barbell Back Squats", muscleGroup: "Legs", sets: 4, reps: "8-10", rest: 120, notes: "Ensure hip crease drops parallel to ground." },
            { name: "Standing Calf Raises", muscleGroup: "Legs", sets: 4, reps: "15", rest: 45, notes: "Hold stretch 1s at absolute bottom range." },
            { name: "Hanging Knee Raises", muscleGroup: "Core", sets: 3, reps: "15s", rest: 60, notes: "Tuck hips forward at the peak contraction." }
          ]
        }
      ]
    };

    // --- NOTIFICATION SUITE ---
    function showToast(message, type = 'success') {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = `p-3 rounded-2xl border text-xs font-extrabold flex items-center gap-2 shadow-2xl transition-all duration-300 transform translate-y-2 opacity-0 shrink-0 pointer-events-auto w-full bg-slate-900`;
      
      let icon = 'check-circle';
      let colorClass = 'text-accent border-accent/20 bg-accent/5';
      if (type === 'error') {
        icon = 'alert-triangle';
        colorClass = 'text-rose-400 border-rose-500/20 bg-rose-500/5';
      } else if (type === 'info') {
        icon = 'info';
        colorClass = 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5';
      }

      toast.className += ` ${colorClass}`;
      toast.innerHTML = `
        <i data-lucide="${icon}" class="w-4 h-4 shrink-0"></i>
        <span class="flex-1">${message}</span>
      `;
      
      container.appendChild(toast);
      lucide.createIcons();

      setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
      }, 10);

      setTimeout(() => {
        toast.classList.add('opacity-0', '-translate-y-2');
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }

    let modalPromiseResolve = null;
    function showConfirmModal(title, description, iconName = 'help-circle') {
      const modal = document.getElementById('custom-modal-overlay');
      document.getElementById('modal-title').innerText = title;
      document.getElementById('modal-description').innerText = description;
      
      const icon = document.getElementById('modal-icon');
      icon.setAttribute('data-lucide', iconName);
      
      modal.classList.remove('hidden');
      lucide.createIcons();

      return new Promise((resolve) => {
        modalPromiseResolve = resolve;
      });
    }

    document.getElementById('modal-confirm-btn').onclick = function() {
      document.getElementById('custom-modal-overlay').classList.add('hidden');
      if (modalPromiseResolve) modalPromiseResolve(true);
    };

    document.getElementById('modal-cancel-btn').onclick = function() {
      document.getElementById('custom-modal-overlay').classList.add('hidden');
      if (modalPromiseResolve) modalPromiseResolve(false);
    };

    // --- APPLICATION STARTUP ENGINE ---
    window.onload = function() {
      loadStateFromLocalStorage();
      applyThemeFromState();
      
      if (!state.isProfileCompleted) {
        document.getElementById('onboarding-screen').classList.remove('hidden');
        document.getElementById('main-app').classList.add('hidden');
      } else {
        document.getElementById('onboarding-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        initMainApp();
      }
      
      lucide.createIcons();
    };

    function applyThemeFromState() {
      const accent = state.profile.accentColor || 'emerald';
      const map = COLORS_MAP[accent] || COLORS_MAP['emerald'];
      const styleOverride = document.createElement('style');
      styleOverride.id = 'theme-style-override';
      styleOverride.innerHTML = `
        :root {
          --accent-color: ${map.color};
          --accent-hover: ${map.hover};
          --accent-glow: ${map.glow};
        }
      `;
      const oldOverride = document.getElementById('theme-style-override');
      if (oldOverride) oldOverride.remove();
      document.head.appendChild(styleOverride);
    }

    function loadStateFromLocalStorage() {
      const savedProfileCompleted = localStorage.getItem('openfit_v3_profile_completed');
      if (savedProfileCompleted === 'true') {
        state.isProfileCompleted = true;
        state.profile = JSON.parse(localStorage.getItem('openfit_v3_profile')) || { ...INITIAL_PROFILE };
        state.workoutPlan = JSON.parse(localStorage.getItem('openfit_v3_workout_plan'));
        state.weightLogs = JSON.parse(localStorage.getItem('openfit_v3_weight_logs')) || [];
        state.completedWorkouts = JSON.parse(localStorage.getItem('openfit_v3_completed_workouts')) || [];
      } else {
        state.profile = { ...INITIAL_PROFILE };
        state.workoutPlan = { splitName: "My Workout Split", days: [] };
      }
    }

    function saveStateToLocalStorage() {
      localStorage.setItem('openfit_v3_profile_completed', state.isProfileCompleted);
      localStorage.setItem('openfit_v3_profile', JSON.stringify(state.profile));
      if (state.workoutPlan) {
        localStorage.setItem('openfit_v3_workout_plan', JSON.stringify(state.workoutPlan));
      }
      localStorage.setItem('openfit_v3_weight_logs', JSON.stringify(state.weightLogs));
      localStorage.setItem('openfit_v3_completed_workouts', JSON.stringify(state.completedWorkouts));
    }

    function updateHeaderAndDashboardStats() {
      if (!state.profile) return;
      
      const headerName = document.getElementById('header-user-name');
      const headerWeight = document.getElementById('header-user-weight');
      if (headerName) headerName.innerText = state.profile.name || "Athlete";
      if (headerWeight) headerWeight.innerText = `${state.profile.weight || 0} Kg`;

      const dashName = document.getElementById('dash-user-name');
      const statWeight = document.getElementById('stat-weight');
      
      if (dashName) dashName.innerText = state.profile.name || "Camp";
      if (statWeight) statWeight.innerText = state.profile.weight || "--";

      const statSplitName = document.getElementById('stat-split-name');
      if (state.workoutPlan && statSplitName) {
        statSplitName.innerText = state.workoutPlan.splitName || "My Workout Split";
      }

      renderWorkoutDaysOnDashboard();
    }

    function initMainApp() {
      updateHeaderAndDashboardStats();
      
      const statCompleted = document.getElementById('stat-completed-count');
      if (statCompleted) statCompleted.innerText = state.completedWorkouts.length;
      
      // Calculate total volume lifted
      let grandVolume = 0;
      state.completedWorkouts.forEach(workout => {
        if (workout.exercises) {
          workout.exercises.forEach(ex => {
            if (ex.weights && ex.repsLogged) {
              ex.weights.forEach((w, idx) => {
                const rep = parseInt(ex.repsLogged[idx]) || 0;
                const kg = parseFloat(w) || 0;
                grandVolume += (rep * kg);
              });
            }
          });
        }
      });
      const statVolume = document.getElementById('stat-total-volume');
      if (statVolume) statVolume.innerText = Math.round(grandVolume);
      
      if (state.workoutPlan) {
        const builderPlanName = document.getElementById('builder-plan-name');
        if (builderPlanName) builderPlanName.value = state.workoutPlan.splitName || "";
      }

      // Pre-fill profile update edit form fields
      document.getElementById('edit-name').value = state.profile.name;
      document.getElementById('edit-gender').value = state.profile.gender;
      document.getElementById('edit-age').value = state.profile.age;
      document.getElementById('edit-height').value = state.profile.height;
      document.getElementById('edit-weight').value = state.profile.weight;
      document.getElementById('edit-goal').value = state.profile.fitnessGoal;
      document.getElementById('edit-equip').value = state.profile.equipment;
      document.getElementById('edit-injuries').value = state.profile.injuries;

      renderWorkoutDaysOnDashboard();
      renderWorkoutBuilder();
      renderSessionHistory();
      renderAnalyticsCharts();
    }

    // --- ONBOARDING CHOICE SUBMIT ---
    document.getElementById('onboarding-form').onsubmit = function(e) {
      e.preventDefault();
      
      state.profile.name = document.getElementById('prof-name').value;
      state.profile.age = parseInt(document.getElementById('prof-age').value) || 25;
      state.profile.height = parseInt(document.getElementById('prof-height').value) || 175;
      state.profile.weight = parseFloat(document.getElementById('prof-weight').value) || 70;
      state.profile.fitnessGoal = document.getElementById('prof-goal').value;
      state.profile.accentColor = 'emerald';

      const choice = document.querySelector('input[name="init-workout-choice"]:checked').value;
      if (choice === 'template') {
        state.workoutPlan = JSON.parse(JSON.stringify(TEMPLATE_WORKOUT));
      } else {
        state.workoutPlan = { splitName: "My Workout Split", days: [] };
      }

      state.isProfileCompleted = true;
      state.weightLogs = [{
        date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        weight: state.profile.weight
      }];

      saveStateToLocalStorage();
      document.getElementById('onboarding-screen').classList.add('hidden');
      document.getElementById('main-app').classList.remove('hidden');
      initMainApp();
      switchTab('dashboard');
      showToast(`Welcome to OpenFit, ${state.profile.name}! 🚀`);
    };

    // --- RENDER COMPLETED TRAINING DAYS ON DASHBOARD ---
    function renderWorkoutDaysOnDashboard() {
      const grid = document.getElementById('dashboard-days-grid');
      if (!grid) return;
      grid.innerHTML = "";

      if (!state.workoutPlan || !state.workoutPlan.days || state.workoutPlan.days.length === 0) {
        grid.innerHTML = `
          <div class="col-span-full border border-dashed border-slate-800 p-6 rounded-xl text-center">
            <i data-lucide="calendar" class="w-6 h-6 text-slate-600 mx-auto mb-1.5"></i>
            <h4 class="text-xs font-bold text-slate-300">No scheduled training days found</h4>
            <p class="text-[10px] text-slate-500 mt-0.5 mb-2.5">Build your custom workout structure to start tracking.</p>
            <button onclick="switchTab('workout-builder')" class="bg-accent text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-accent-hover transition-all">Build Routine</button>
          </div>
        `;
        lucide.createIcons();
        return;
      }

      state.workoutPlan.days.forEach((day, idx) => {
        const listStr = day.exercises && day.exercises.length > 0 
          ? day.exercises.map(e => `${e.name} (${e.muscleGroup || 'Other'})`).slice(0, 3).join(', ') + '...' 
          : 'No exercises added yet.';

        const card = document.createElement('div');
        card.className = "bg-slate-950/40 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between hover:border-accent/20 transition-all group";
        card.innerHTML = `
          <div>
            <div class="flex justify-between items-start gap-2">
              <h4 class="font-extrabold text-xs text-slate-200 group-hover:text-accent transition-all truncate max-w-[80%]">${day.name}</h4>
              <span class="text-[8px] shrink-0 bg-slate-900 text-accent border border-accent/10 px-1.5 py-0.5 rounded-full font-bold">
                ${day.exercises ? day.exercises.length : 0} EX
              </span>
            </div>
            <p class="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">${listStr}</p>
          </div>
          
          <div class="mt-3.5 pt-2.5 border-t border-slate-900/40 flex justify-between items-center">
            <span class="text-[9px] text-slate-500">OpenFit Engine</span>
            <button onclick="startActiveWorkout(${idx})" class="bg-accent text-slate-950 px-2.5 py-1 rounded-lg text-[10px] font-black hover:bg-accent-hover transition-all flex items-center gap-1 active:scale-95">
              <span>Train</span>
              <i data-lucide="play" class="w-2.5 h-2.5 fill-current"></i>
            </button>
          </div>
        `;
        grid.appendChild(card);
      });
      lucide.createIcons();
    }

    // --- WORKOUT BUILDER MANAGER ---
    function renderWorkoutBuilder() {
      const container = document.getElementById('builder-days-container');
      if (!container) return;
      container.innerHTML = "";

      const builderPlanName = document.getElementById('builder-plan-name');
      if (builderPlanName) {
        builderPlanName.oninput = function() {
          state.workoutPlan.splitName = this.value;
          saveStateToLocalStorage();
          updateHeaderAndDashboardStats();
        };
      }

      if (!state.workoutPlan || !state.workoutPlan.days || state.workoutPlan.days.length === 0) {
        container.innerHTML = `
          <div class="border border-dashed border-slate-800 p-10 rounded-3xl text-center">
            <i data-lucide="pencil-ruler" class="w-8 h-8 text-slate-600 mx-auto mb-2"></i>
            <h3 class="text-xs font-bold text-slate-350">No Scheduled Days</h3>
            <p class="text-[11px] text-slate-500 max-w-xs mx-auto mt-0.5 mb-3.5 leading-relaxed">Load our suggested structured template or add a custom day to design your split from scratch.</p>
            <div class="flex flex-col sm:flex-row items-center justify-center gap-2">
              <button onclick="loadTemplateSuggested()" class="w-full sm:w-auto bg-slate-855 hover:bg-slate-800 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-slate-800 flex items-center justify-center gap-1">
                <i data-lucide="sparkles" class="w-3.5 h-3.5 text-accent"></i> Load Push-Pull-Legs
              </button>
              <button onclick="addNewDayToBuilder()" class="w-full sm:w-auto bg-accent text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-black hover:bg-accent-hover transition-all flex items-center justify-center gap-1">
                <i data-lucide="plus" class="w-4 h-4"></i> Add Training Day
              </button>
            </div>
          </div>
        `;
        lucide.createIcons();
        return;
      }

      state.workoutPlan.days.forEach((day, dayIdx) => {
        const dayBox = document.createElement('div');
        dayBox.className = "bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3";
        
        let exHtml = "";
        if (day.exercises && day.exercises.length > 0) {
          day.exercises.forEach((ex, exIdx) => {
            let mgOptions = "";
            MUSCLE_GROUPS.forEach(g => {
              const selected = ex.muscleGroup === g ? "selected" : "";
              mgOptions += `<option value="${g}" ${selected}>${g}</option>`;
            });

            exHtml += `
              <div class="p-3 bg-slate-955 border border-slate-855 rounded-xl space-y-2 relative">
                <div class="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
                  
                  <!-- Exercise Name -->
                  <div class="md:col-span-3 space-y-0.5">
                    <label class="text-[8px] text-slate-500 font-bold uppercase block">Exercise Name</label>
                    <input type="text" value="${ex.name}" oninput="updateBuilderExercise(${dayIdx}, ${exIdx}, 'name', this.value)" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-accent">
                  </div>

                  <!-- Muscle targeting -->
                  <div class="md:col-span-2 space-y-0.5">
                    <label class="text-[8px] text-slate-500 font-bold uppercase block">Muscle Target</label>
                    <select onchange="updateBuilderExercise(${dayIdx}, ${exIdx}, 'muscleGroup', this.value)" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-accent">
                      ${mgOptions}
                    </select>
                  </div>

                  <!-- Inline Sets, Reps, Rest -->
                  <div class="grid grid-cols-3 gap-2 md:col-span-4">
                    <div class="space-y-0.5">
                      <label class="text-[8px] text-slate-500 font-bold uppercase block text-center">Sets</label>
                      <input type="number" min="1" value="${ex.sets}" oninput="updateBuilderExercise(${dayIdx}, ${exIdx}, 'sets', this.value)" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-center text-slate-200 focus:outline-none focus:border-accent">
                    </div>

                    <div class="space-y-0.5">
                      <label class="text-[8px] text-slate-500 font-bold uppercase block text-center">Reps</label>
                      <input type="text" value="${ex.reps}" oninput="updateBuilderExercise(${dayIdx}, ${exIdx}, 'reps', this.value)" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-center text-slate-200 focus:outline-none focus:border-accent">
                    </div>

                    <div class="space-y-0.5">
                      <label class="text-[8px] text-slate-500 font-bold uppercase block text-center">Rest (s)</label>
                      <input type="number" step="5" value="${ex.rest}" oninput="updateBuilderExercise(${dayIdx}, ${exIdx}, 'rest', this.value)" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-center text-slate-200 focus:outline-none focus:border-accent">
                    </div>
                  </div>

                  <!-- Notes -->
                  <div class="md:col-span-3 space-y-0.5">
                    <label class="text-[8px] text-slate-500 font-bold uppercase block">Biomechanic Notes</label>
                    <input type="text" value="${ex.notes || ''}" placeholder="No instructions added..." oninput="updateBuilderExercise(${dayIdx}, ${exIdx}, 'notes', this.value)" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-accent">
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex justify-end pt-1">
                  <button onclick="removeExerciseFromBuilder(${dayIdx}, ${exIdx})" class="text-rose-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-955/20 transition-all flex items-center gap-1 text-[10px] font-bold">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Remove Exercise
                  </button>
                </div>
              </div>
            `;
          });
        } else {
          exHtml = `
            <p class="text-center text-[10px] text-slate-500 italic py-2">No exercises added to this scheduled day yet.</p>
          `;
        }

        dayBox.innerHTML = `
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-800/60">
            <div class="flex items-center gap-2 w-full sm:w-auto">
              <span class="w-5 h-5 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-[10px] text-accent">${dayIdx + 1}</span>
              <input type="text" value="${day.name}" oninput="updateBuilderDayName(${dayIdx}, this.value)" class="bg-transparent border-b border-transparent hover:border-slate-850 focus:border-accent text-xs font-black text-slate-100 focus:outline-none px-1.5 py-0.5 w-full sm:w-56">
            </div>

            <div class="flex items-center gap-1.5 w-full sm:w-auto justify-end">
              <button onclick="addExerciseToBuilder(${dayIdx})" class="bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-750 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1">
                <i data-lucide="plus" class="w-3 h-3"></i> Add Exercise
              </button>
              <button onclick="removeDayFromBuilder(${dayIdx})" class="text-rose-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-955/20 transition-all shrink-0" title="Delete Scheduled Day">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </div>

          <div class="space-y-2">
            ${exHtml}
          </div>
        `;
        container.appendChild(dayBox);
      });
      lucide.createIcons();
    }

    function updateBuilderDayName(dayIdx, name) {
      state.workoutPlan.days[dayIdx].name = name;
      saveStateToLocalStorage();
      updateHeaderAndDashboardStats();
    }

    function addNewDayToBuilder() {
      if (!state.workoutPlan.days) state.workoutPlan.days = [];
      const idx = state.workoutPlan.days.length + 1;
      state.workoutPlan.days.push({
        name: `Day ${idx}: Custom Routine`,
        exercises: []
      });
      saveStateToLocalStorage();
      renderWorkoutBuilder();
      updateHeaderAndDashboardStats();
      showToast("Training day added.");
    }

    async function removeDayFromBuilder(dayIdx) {
      const confirm = await showConfirmModal("Delete Training Day", "Are you sure you want to delete this scheduled training day and all its exercises?", "trash-2");
      if (confirm) {
        state.workoutPlan.days.splice(dayIdx, 1);
        saveStateToLocalStorage();
        renderWorkoutBuilder();
        updateHeaderAndDashboardStats();
        showToast("Day removed.", "info");
      }
    }

    function addExerciseToBuilder(dayIdx) {
      state.workoutPlan.days[dayIdx].exercises.push({
        name: "New Exercise",
        muscleGroup: "Chest",
        sets: 3,
        reps: "10",
        rest: 90,
        notes: ""
      });
      saveStateToLocalStorage();
      renderWorkoutBuilder();
    }

    function removeExerciseFromBuilder(dayIdx, exIdx) {
      state.workoutPlan.days[dayIdx].exercises.splice(exIdx, 1);
      saveStateToLocalStorage();
      renderWorkoutBuilder();
    }

    function updateBuilderExercise(dayIdx, exIdx, field, value) {
      const ex = state.workoutPlan.days[dayIdx].exercises[exIdx];
      if (field === 'sets' || field === 'rest') {
        ex[field] = parseInt(value) || 0;
      } else {
        ex[field] = value;
      }
      saveStateToLocalStorage();
    }

    async function loadTemplateSuggested() {
      const confirm = await showConfirmModal("Overwrite Workout?", "This action replaces your active workout split configuration with the recommended Push-Pull-Legs split model. Continue?", "sparkles");
      if (confirm) {
        state.workoutPlan = JSON.parse(JSON.stringify(TEMPLATE_WORKOUT));
        saveStateToLocalStorage();
        renderWorkoutBuilder();
        updateHeaderAndDashboardStats();
        showToast("PPL standard template loaded!");
      }
    }

    // --- ACTIVE TRACKER CONTROLS ---
    function startActiveWorkout(dayIndex) {
      if (!state.workoutPlan || !state.workoutPlan.days || state.workoutPlan.days.length === 0) return;
      const day = state.workoutPlan.days[dayIndex];
      
      state.activeWorkoutSession = {
        dayName: day.name,
        dayIndex: dayIndex,
        startTime: new Date(),
        exercises: day.exercises.map(ex => ({
          ...ex,
          setsCompleted: new Array(ex.sets).fill(false),
          weights: new Array(ex.sets).fill(""),
          repsLogged: new Array(ex.sets).fill("")
        }))
      };

      document.getElementById('active-session-name').innerText = day.name;
      document.getElementById('nav-active-workout').classList.remove('hidden');
      
      renderActiveWorkoutExercises();
      closeDaySelectorModal();
      switchTab('active-workout');
      updateMobileNavigationButtons();
    }

    function renderActiveWorkoutExercises() {
      const container = document.getElementById('active-workout-exercises');
      if (!container) return;
      container.innerHTML = "";

      if (!state.activeWorkoutSession) return;

      state.activeWorkoutSession.exercises.forEach((ex, exIdx) => {
        const exCard = document.createElement('div');
        exCard.className = "bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5";
        
        let setsRows = "";
        ex.setsCompleted.forEach((completed, setIdx) => {
          const bgClass = completed ? 'bg-accent/5 border-accent/20' : 'bg-slate-955 border-slate-850';
          const btnClass = completed ? 'bg-accent text-slate-950 shadow-md' : 'bg-slate-800 hover:bg-slate-700 text-slate-400';
          const icon = completed ? 'check' : 'play';

          setsRows += `
            <div class="flex items-center justify-between gap-2 p-2 rounded-xl border transition-all ${bgClass}">
              <div class="flex items-center gap-1.5">
                <span class="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-black flex items-center justify-center text-slate-400">
                  ${setIdx + 1}
                </span>
                <span class="text-[11px] text-slate-300 font-medium">Target: <strong class="text-accent">${ex.reps} reps</strong></span>
              </div>

              <div class="flex items-center gap-2">
                <div class="flex items-center gap-0.5">
                  <span class="text-[8px] text-slate-500 font-bold uppercase">Kg</span>
                  <input 
                    type="text" 
                    placeholder="0" 
                    value="${ex.weights[setIdx]}" 
                    oninput="logSetData(${exIdx}, ${setIdx}, 'weight', this.value)"
                    class="bg-slate-950 border border-slate-800 rounded-lg py-1 text-xs text-center w-12 text-slate-200 focus:outline-none focus:border-accent"
                  >
                </div>
                <div class="flex items-center gap-0.5">
                  <span class="text-[8px] text-slate-500 font-bold uppercase">Reps</span>
                  <input 
                    type="text" 
                    placeholder="0" 
                    value="${ex.repsLogged[setIdx]}" 
                    oninput="logSetData(${exIdx}, ${setIdx}, 'reps', this.value)"
                    class="bg-slate-950 border border-slate-800 rounded-lg py-1 text-xs text-center w-12 text-slate-200 focus:outline-none focus:border-accent"
                  >
                </div>
                <button onclick="toggleSet(${exIdx}, ${setIdx})" class="p-1.5 rounded-lg transition-all ${btnClass}">
                  <i data-lucide="${icon}" class="w-3.5 h-3.5 ${completed ? 'stroke-[3]' : 'fill-current'}"></i>
                </button>
              </div>
            </div>
          `;
        });

        exCard.innerHTML = `
          <div class="flex items-center justify-between gap-1.5">
            <h3 class="font-extrabold text-xs text-slate-100">${ex.name}</h3>
            <span class="text-[8px] px-2 py-0.5 rounded-full bg-slate-800 text-accent border border-accent/15 font-black uppercase tracking-wider shrink-0">
              ${ex.muscleGroup || 'Other'}
            </span>
          </div>
          <p class="text-[10px] text-slate-500 italic">Target notes: ${ex.notes || 'No notes added.'}</p>
          <div class="space-y-1.5">${setsRows}</div>
        `;
        container.appendChild(exCard);
      });
      lucide.createIcons();
    }

    function logSetData(exIdx, setIdx, field, value) {
      if (!state.activeWorkoutSession) return;
      if (field === 'weight') {
        state.activeWorkoutSession.exercises[exIdx].weights[setIdx] = value;
      } else {
        state.activeWorkoutSession.exercises[exIdx].repsLogged[setIdx] = value;
      }
    }

    function toggleSet(exIdx, setIdx) {
      if (!state.activeWorkoutSession) return;
      
      const currentStatus = state.activeWorkoutSession.exercises[exIdx].setsCompleted[setIdx];
      state.activeWorkoutSession.exercises[exIdx].setsCompleted[setIdx] = !currentStatus;
      
      renderActiveWorkoutExercises();

      if (!currentStatus) {
        const restSeconds = state.activeWorkoutSession.exercises[exIdx].rest || 90;
        startTimer(restSeconds);
      }
    }

    function finishActiveWorkout() {
      if (!state.activeWorkoutSession) return;

      const durationMs = new Date() - state.activeWorkoutSession.startTime;
      const durationMin = Math.round(durationMs / 60000);

      const finished = {
        date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        dayName: state.activeWorkoutSession.dayName,
        duration: durationMin,
        exercises: state.activeWorkoutSession.exercises.map(ex => ({
          name: ex.name,
          muscleGroup: ex.muscleGroup || "Other",
          setsCompleted: [...ex.setsCompleted],
          weights: [...ex.weights],
          repsLogged: [...ex.repsLogged]
        }))
      };

      state.completedWorkouts.push(finished);
      state.activeWorkoutSession = null;
      document.getElementById('nav-active-workout').classList.add('hidden');
      
      saveStateToLocalStorage();
      initMainApp();
      switchTab('history');
      updateMobileNavigationButtons();
      showToast("Workout finished & saved to history!");
    }

    // --- RECOVERY COUNTER ACTIONS ---
    function startTimer(seconds) {
      clearInterval(state.timerInterval);
      state.timerSeconds = seconds;
      state.timerActive = true;
      
      const timerIcon = document.getElementById('timer-icon');
      if (timerIcon) timerIcon.className = "w-4 h-4 text-accent animate-spin";
      const timerBtn = document.getElementById('timer-control-btn');
      if (timerBtn) timerBtn.innerText = "Stop";

      updateTimerDisplay();

      state.timerInterval = setInterval(() => {
        if (state.timerSeconds > 0) {
          state.timerSeconds--;
          updateTimerDisplay();
        } else {
          stopTimer(true);
        }
      }, 1000);
    }

    function toggleTimer() {
      if (state.timerSeconds === null) {
        startTimer(90);
        return;
      }

      if (state.timerActive) {
        clearInterval(state.timerInterval);
        state.timerActive = false;
        const timerBtn = document.getElementById('timer-control-btn');
        if (timerBtn) timerBtn.innerText = "Go";
        const timerIcon = document.getElementById('timer-icon');
        if (timerIcon) timerIcon.className = "w-4 h-4 text-slate-500";
      } else {
        startTimer(state.timerSeconds);
      }
    }

    function stopTimer(playSound = false) {
      clearInterval(state.timerInterval);
      state.timerActive = false;
      const timerBtn = document.getElementById('timer-control-btn');
      if (timerBtn) timerBtn.innerText = "Start";
      const timerIcon = document.getElementById('timer-icon');
      if (timerIcon) timerIcon.className = "w-4 h-4 text-slate-400";
      
      if (playSound) {
        playBeepSound();
      }
    }

    function updateTimerDisplay() {
      const minutes = Math.floor(state.timerSeconds / 60);
      const seconds = state.timerSeconds % 60;
      const timerDisplay = document.getElementById('timer-display');
      if (timerDisplay) timerDisplay.innerText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    function playBeepSound() {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
      } catch (e) {
        console.warn("Audio Context blocked by policy", e);
      }
    }

    // --- TIMELINE WORKOUT HISTORY LOADER ---
    function renderSessionHistory() {
      const container = document.getElementById('history-container');
      if (!container) return;
      container.innerHTML = "";

      if (!state.completedWorkouts || state.completedWorkouts.length === 0) {
        container.innerHTML = `
          <div class="border border-slate-800 p-6 rounded-2xl text-center text-xs text-slate-500">
            No completed workouts found in history yet. Execute split routines to record sessions here.
          </div>
        `;
        return;
      }

      const reversed = [...state.completedWorkouts].reverse();

      reversed.forEach((workout, idx) => {
        const card = document.createElement('div');
        card.className = "bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-all";
        
        let exercisesListHtml = "";
        workout.exercises.forEach(ex => {
          let setsCompletedCount = ex.setsCompleted.filter(Boolean).length;
          
          let subDetails = "";
          ex.setsCompleted.forEach((completed, setIdx) => {
            const kg = ex.weights[setIdx] || '--';
            const rep = ex.repsLogged[setIdx] || '--';
            subDetails += `
              <span class="text-[9px] bg-slate-950 px-1.5 py-0.5 border border-slate-850 rounded block shrink-0">
                S${setIdx+1}: <strong class="text-accent">${kg} Kg</strong> × <strong>${rep}</strong> ${completed ? '✓' : ''}
              </span>
            `;
          });

          exercisesListHtml += `
            <div class="p-2.5 bg-slate-900/40 border-b border-slate-855/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <div class="flex items-center gap-1.5">
                  <span class="font-bold text-slate-200 block text-[11px]">${ex.name}</span>
                  <span class="text-[8px] px-1.5 rounded bg-slate-950 text-slate-400 border border-slate-800 uppercase font-bold">${ex.muscleGroup || 'Other'}</span>
                </div>
                <span class="text-[9px] text-slate-500 block">Sets completed: ${setsCompletedCount}/${ex.setsCompleted.length}</span>
              </div>
              <div class="flex flex-wrap gap-1">
                ${subDetails}
              </div>
            </div>
          `;
        });

        const uniqId = `hist-item-${idx}`;

        card.innerHTML = `
          <div onclick="toggleCollapsible('${uniqId}')" class="p-3.5 flex justify-between items-center bg-slate-900 cursor-pointer hover:bg-slate-850/30 transition-all select-none">
            <div>
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="text-[9px] text-slate-500 font-bold uppercase">${workout.date}</span>
                <span class="text-[8px] bg-accent/10 text-accent px-1.5 py-0.5 rounded border border-accent/10">${workout.duration} min</span>
              </div>
              <h3 class="font-black text-xs text-slate-200 mt-1">${workout.dayName}</h3>
            </div>
            
            <div class="flex items-center gap-2">
              <span class="text-[9px] text-slate-400 font-bold">${workout.exercises.length} Exercises</span>
              <i data-lucide="chevron-down" class="w-4 h-4 text-slate-500 transition-transform duration-200" id="${uniqId}-icon"></i>
            </div>
          </div>

          <div id="${uniqId}" class="hidden bg-slate-950 border-t border-slate-850 max-h-[300px] overflow-y-auto">
            ${exercisesListHtml}
          </div>
        `;
        container.appendChild(card);
      });
      lucide.createIcons();
    }

    function toggleCollapsible(id) {
      const target = document.getElementById(id);
      const icon = document.getElementById(`${id}-icon`);
      if (target.classList.contains('hidden')) {
        target.classList.remove('hidden');
        icon.style.transform = 'rotate(180deg)';
      } else {
        target.classList.add('hidden');
        icon.style.transform = 'rotate(0deg)';
      }
    }

    // --- ANALYZING EXERCISE LOGS AND PR MILESTONES ---
    function updateExerciseLoadDropdown() {
      const selector = document.getElementById('analytics-exercise-selector');
      if (!selector) return;
      
      const prevVal = selector.value;
      selector.innerHTML = '<option value="">Select an exercise to track...</option>';
      
      const exercisesSet = new Set();
      state.completedWorkouts.forEach(workout => {
        if (workout.exercises) {
          workout.exercises.forEach(ex => {
            if (ex.name) exercisesSet.add(ex.name);
          });
        }
      });
      
      const sortedExercises = Array.from(exercisesSet).sort();
      sortedExercises.forEach(exName => {
        const opt = document.createElement('option');
        opt.value = exName;
        opt.innerText = exName;
        selector.appendChild(opt);
      });

      if (prevVal && exercisesSet.has(prevVal)) {
        selector.value = prevVal;
      } else {
        const container = document.getElementById('analytics-load-progression-container');
        if (container) container.classList.add('hidden');
      }
    }

    function renderExerciseLoadProgression() {
      const selector = document.getElementById('analytics-exercise-selector');
      const container = document.getElementById('analytics-load-progression-container');
      if (!selector || !container) return;
      
      const exName = selector.value;
      if (!exName) {
        container.classList.add('hidden');
        return;
      }
      
      container.innerHTML = "";
      container.classList.remove('hidden');
      
      const historyPoints = [];
      
      state.completedWorkouts.forEach(workout => {
        if (workout.exercises) {
          workout.exercises.forEach(ex => {
            if (ex.name === exName) {
              const validSets = ex.weights
                .map((w, idx) => ({
                  weight: parseFloat(w) || 0,
                  reps: parseInt(ex.repsLogged[idx]) || 0,
                  completed: ex.setsCompleted ? ex.setsCompleted[idx] : true
                }))
                .filter(set => set.completed && set.weight > 0);
                
              if (validSets.length > 0) {
                const maxSet = validSets.reduce((max, cur) => cur.weight > max.weight ? cur : max, validSets[0]);
                historyPoints.push({
                  date: workout.date,
                  maxWeight: maxSet.weight,
                  reps: maxSet.reps,
                  setsCount: ex.weights.length
                });
              }
            }
          });
        }
      });
      
      if (historyPoints.length === 0) {
        container.innerHTML = `<p class="text-[11px] text-slate-500 italic text-center py-2">No completed set loads found for this exercise. Make sure to log and complete sets with registered weights!</p>`;
        return;
      }
      
      const header = document.createElement('div');
      header.className = "flex justify-between items-center pb-2 border-b border-slate-800/80 mb-2";
      header.innerHTML = `
        <span class="text-[10px] font-bold text-slate-400">Progression Timeline</span>
        <span class="text-[9px] bg-accent/10 text-accent px-2 py-0.5 rounded border border-accent/20 font-black uppercase">Max Load PRs</span>
      `;
      container.appendChild(header);
      
      const listDiv = document.createElement('div');
      listDiv.className = "space-y-1.5 max-h-[160px] overflow-y-auto pr-1";
      
      const maxAllTime = Math.max(...historyPoints.map(p => p.maxWeight));
      
      [...historyPoints].reverse().forEach((pt) => {
        const isPR = pt.maxWeight === maxAllTime;
        const prBadge = isPR ? `<span class="text-[8px] bg-amber-500/10 text-amber-500 border border-amber-500/20 font-extrabold px-1.5 py-0.5 rounded uppercase">All-Time PR</span>` : "";
        
        const row = document.createElement('div');
        row.className = "flex justify-between items-center text-xs p-2 rounded-xl bg-slate-900 border border-slate-850 hover:border-slate-800 transition-all";
        row.innerHTML = `
          <div class="flex items-center gap-2">
            <span class="text-slate-400 text-[10px] font-semibold">${pt.date}</span>
            ${prBadge}
          </div>
          <div class="flex items-center gap-2 text-right">
            <span class="text-slate-500 text-[10px]">Peak Set:</span>
            <strong class="text-accent text-sm font-black">${pt.maxWeight} kg</strong>
            <span class="text-slate-400 text-[10px] font-bold">@ ${pt.reps} reps</span>
          </div>
        `;
        listDiv.appendChild(row);
      });
      
      container.appendChild(listDiv);
    }

    async function clearAllHistory() {
      const confirm = await showConfirmModal("Wipe Workout History?", "This permanently clears all completed workout timelines. This cannot be undone! Proceed?", "trash-2");
      if (confirm) {
        state.completedWorkouts = [];
        saveStateToLocalStorage();
        initMainApp();
        showToast("Training logs cleared successfully.", "info");
      }
    }

    // --- ANALYTICS CHARTS GENERATION ---
    document.getElementById('analytics-weight-form').onsubmit = function(e) {
      e.preventDefault();
      const weightVal = parseFloat(document.getElementById('new-weight-val').value);

      if (isNaN(weightVal)) return;

      const today = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      state.weightLogs.push({
        date: today,
        weight: weightVal
      });

      if (state.weightLogs.length > 6) {
        state.weightLogs.shift();
      }

      state.profile.weight = weightVal;
      document.getElementById('new-weight-val').value = "";

      saveStateToLocalStorage();
      initMainApp();
      showToast("Body weight registered!");
    };

    function renderAnalyticsCharts() {
      // 1. Render Weight Chart
      const weightChart = document.getElementById('analytics-weight-chart');
      if (weightChart) {
        weightChart.innerHTML = "";

        if (!state.weightLogs || state.weightLogs.length === 0) {
          weightChart.innerHTML = `<p class="text-xs text-slate-500 w-full text-center pb-8">No weight data logged yet.</p>`;
        } else {
          const weights = state.weightLogs.map(l => l.weight);
          const minW = Math.min(...weights);
          const maxW = Math.max(...weights);
          const range = maxW - minW;

          state.weightLogs.forEach(log => {
            const percentage = range === 0 ? 55 : ((log.weight - minW) / range) * 55 + 25;

            const bar = document.createElement('div');
            bar.className = "flex flex-col items-center flex-1 group h-full justify-end select-none";
            bar.innerHTML = `
              <span class="text-[9px] text-accent font-extrabold mb-1">${log.weight} kg</span>
              <div style="height: ${percentage}%" class="w-6 sm:w-10 bg-accent rounded-t-lg shadow-accent-glow transition-all hover:brightness-110"></div>
              <span class="text-[9px] text-slate-500 font-bold mt-1.5 truncate max-w-[45px]">${log.date}</span>
            `;
            weightChart.appendChild(bar);
          });
        }
      }

      // Update Exercise Load Dropdown
      updateExerciseLoadDropdown();

      // 2. Render Muscle Groups Progress / Volumes Breakdown
      const muscleContainer = document.getElementById('muscle-groups-bars');
      if (muscleContainer) {
        muscleContainer.innerHTML = "";

        const groupVolumes = {};
        MUSCLE_GROUPS.forEach(g => { groupVolumes[g] = 0; });

        state.completedWorkouts.forEach(workout => {
          if (workout.exercises) {
            workout.exercises.forEach(ex => {
              const mg = ex.muscleGroup || "Other";
              if (groupVolumes[mg] === undefined) {
                groupVolumes[mg] = 0;
              }
              if (ex.weights && ex.repsLogged) {
                ex.weights.forEach((w, idx) => {
                  const rep = parseInt(ex.repsLogged[idx]) || 0;
                  const kg = parseFloat(w) || 0;
                  groupVolumes[mg] += (rep * kg);
                });
              }
            });
          }
        });

        const volumes = Object.values(groupVolumes);
        const maxVol = Math.max(...volumes, 1);

        MUSCLE_GROUPS.forEach(g => {
          const vol = groupVolumes[g] || 0;
          const percentage = (vol / maxVol) * 100;

          const barRow = document.createElement('div');
          barRow.className = "space-y-1";
          barRow.innerHTML = `
            <div class="flex justify-between items-center text-[10px]">
              <span class="font-bold text-slate-300">${g}</span>
              <span class="text-accent font-black">${vol} kg</span>
            </div>
            <div class="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
              <div style="width: ${percentage}%" class="bg-accent h-full rounded-full transition-all duration-500"></div>
            </div>
          `;
          muscleContainer.appendChild(barRow);
        });
      }
    }

    // --- PROFILE AND SETTINGS UTILS ---
    document.getElementById('profile-edit-form').onsubmit = function(e) {
      e.preventDefault();

      state.profile.name = document.getElementById('edit-name').value;
      state.profile.gender = document.getElementById('edit-gender').value;
      state.profile.age = parseInt(document.getElementById('edit-age').value) || 25;
      state.profile.height = parseInt(document.getElementById('edit-height').value) || 175;
      state.profile.weight = parseFloat(document.getElementById('edit-weight').value) || 70;
      state.profile.fitnessGoal = document.getElementById('edit-goal').value;
      state.profile.experience = document.getElementById('edit-exp').value;
      state.profile.equipment = document.getElementById('edit-equip').value;
      state.profile.injuries = document.getElementById('edit-injuries').value;

      saveStateToLocalStorage();
      initMainApp();
      showToast("Profile changes updated successfully!");
      switchTab('dashboard');
    };

    function setThemeAccent(accentName) {
      state.profile.accentColor = accentName;
      saveStateToLocalStorage();
      applyThemeFromState();
      showToast(`Accent theme configured to ${accentName}!`, "info");
    }

    function exportBackupData() {
      const dataStr = JSON.stringify(state);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `openfit_backup_${new Date().toISOString().slice(0,10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      showToast("Data backup file generated.");
    }

    function importBackupData(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const parsed = JSON.parse(e.target.result);
          if (parsed && parsed.profile && parsed.workoutPlan) {
            state = parsed;
            saveStateToLocalStorage();
            applyThemeFromState();
            initMainApp();
            showToast("Backup imported successfully!");
            switchTab('dashboard');
          } else {
            showToast("Incompatible file format.", "error");
          }
        } catch (err) {
          showToast("Failed to parse JSON file.", "error");
        }
      };
      reader.readAsText(file);
    }

    async function resetAllDataDangerously() {
      const confirm = await showConfirmModal("Factory Reset", "WARNING: This permanently wipes all user profile data, weight histories, and routines. Continue?", "alert-triangle");
      if (confirm) {
        localStorage.clear();
        location.reload();
      }
    }

    // --- ROUTER NAVIGATION ---
    function switchTab(tabId) {
      state.activeTab = tabId;
      
      document.querySelectorAll('.tab-content').forEach(section => {
        section.classList.add('hidden');
      });

      document.getElementById(`tab-${tabId}`).classList.remove('hidden');

      // Sync Desktop Links Style
      document.querySelectorAll('nav[class*="hidden"] button').forEach(btn => {
        if (btn.id === `nav-${tabId}`) {
          btn.className = "flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all bg-accent/10 text-accent border border-accent/20";
        } else {
          if (btn.id !== 'nav-active-workout') {
            btn.className = "flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all text-slate-400 hover:bg-slate-800/50 hover:text-slate-200";
          }
        }
      });

      // Sync Mobile Bar Links Style
      document.querySelectorAll('nav.lg\\:hidden button').forEach(btn => {
        if (btn.id === `mob-${tabId}`) {
          btn.className = "flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all text-accent font-bold";
        } else {
          if (btn.id !== 'mob-action') {
            btn.className = "flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all text-slate-400";
          }
        }
      });

      if (tabId === 'workout-builder') {
        renderWorkoutBuilder();
      } else if (tabId === 'history') {
        renderSessionHistory();
      } else if (tabId === 'analytics') {
        renderAnalyticsCharts();
      }

      updateMobileNavigationButtons();
    }

    function updateMobileNavigationButtons() {
      const actionButton = document.getElementById('mob-action');
      const actionLabel = document.getElementById('mob-action-label');
      const actionIcon = document.getElementById('mob-action-icon');

      if (!actionButton || !actionLabel || !actionIcon) return;

      if (state.activeWorkoutSession) {
        actionButton.className = "flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-amber-500 animate-pulse font-bold";
        actionLabel.innerText = "Log Split";
        actionIcon.setAttribute('data-lucide', 'play');
        actionIcon.classList.add('fill-current');
      } else {
        actionButton.className = "flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-slate-400 hover:text-accent";
        actionLabel.innerText = "Train";
        actionIcon.setAttribute('data-lucide', 'play');
        actionIcon.classList.remove('fill-current');
      }

      if (state.activeTab === 'active-workout') {
        actionButton.className = "flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-accent font-bold";
      }

      lucide.createIcons();
    }

    function handleMobileWorkoutAction() {
      if (state.activeWorkoutSession) {
        switchTab('active-workout');
      } else {
        openStartWorkoutSelector();
      }
    }

    function openStartWorkoutSelector() {
      if (!state.workoutPlan || !state.workoutPlan.days || state.workoutPlan.days.length === 0) {
        showToast("No days configured! Build your custom workout split first.", "error");
        return;
      }
      
      const modal = document.getElementById('day-selector-modal');
      const listContainer = document.getElementById('selector-modal-days-list');
      listContainer.innerHTML = "";
      
      state.workoutPlan.days.forEach((day, idx) => {
        const btn = document.createElement('button');
        btn.onclick = () => startActiveWorkout(idx);
        btn.className = "w-full text-left bg-slate-950/60 border border-slate-800 hover:border-accent p-3 rounded-xl transition-all flex justify-between items-center group";
        btn.innerHTML = `
          <div>
            <span class="text-xs font-bold text-slate-200 group-hover:text-accent transition-all block">${day.name}</span>
            <span class="text-[9px] text-slate-500 block mt-0.5">${day.exercises ? day.exercises.length : 0} exercises programmed</span>
          </div>
          <i data-lucide="chevron-right" class="w-4 h-4 text-slate-500 group-hover:text-accent transition-all"></i>
        `;
        listContainer.appendChild(btn);
      });
      
      modal.classList.remove('hidden');
      lucide.createIcons();
    }

    function closeDaySelectorModal() {
      document.getElementById('day-selector-modal').classList.add('hidden');
    }