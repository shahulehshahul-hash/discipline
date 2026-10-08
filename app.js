// Simple habit tracker - stores everything in localStorage

const STORAGE_KEY = "discipline_habits";

// Get local date as YYYY-MM-DD (fixes timezone issues)
function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function today() {
  return formatDate(new Date());
}

// Get date N days ago as YYYY-MM-DD
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return formatDate(d);
}

// Load habits from browser storage
function loadHabits() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// Save habits to browser storage
function saveHabits(habits) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

// Calculate current streak for a habit
function getStreak(habit) {
  let streak = 0;
  let day = 0;

  // If not done today, start checking from yesterday
  if (!habit.completed.includes(today())) {
    day = 1;
  }

  while (true) {
    const date = daysAgo(day);
    if (habit.completed.includes(date)) {
      streak++;
      day++;
    } else {
      break;
    }
  }

  return streak;
}

// Update the progress bar
function updateProgress(habits) {
  const todayStr = today();
  const total = habits.length;
  const done = habits.filter(h => h.completed.includes(todayStr)).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  document.getElementById("progressPercent").textContent = percent + "%";
  document.getElementById("progressFill").style.width = percent + "%";
}

// Render the list
function render() {
  const habits = loadHabits();
  const list = document.getElementById("habitsList");

  updateProgress(habits);

  if (habits.length === 0) {
    list.innerHTML = `<div class="empty">No habits yet. Add one above.</div>`;
    return;
  }

  const todayStr = today();

  list.innerHTML = habits
    .map((habit) => {
      const isDone = habit.completed.includes(todayStr);
      const streak = getStreak(habit);
      const streakClass = streak > 0 ? "active" : "";

      return `
        <div class="habit-item ${isDone ? "done" : ""}" data-id="${habit.id}" onclick="toggleHabit('${habit.id}')">
          <div class="habit-check"></div>
          <div class="habit-name">${habit.name}</div>
          <div class="habit-streak ${streakClass}">${streak > 0 ? streak + "d" : ""}</div>
          <button class="habit-delete" onclick="event.stopPropagation(); deleteHabit('${habit.id}')">×</button>
        </div>
      `;
    })
    .join("");
}

// Add new habit
function addHabit() {
  const input = document.getElementById("habitInput");
  const name = input.value.trim();

  if (!name) return;

  const habits = loadHabits();
  habits.push({
    id: Date.now().toString(),
    name: name,
    completed: []
  });

  saveHabits(habits);
  input.value = "";
  render();
}

// Toggle done for today
function toggleHabit(id) {
  const habits = loadHabits();
  const habit = habits.find((h) => h.id === id);
  if (!habit) return;

  const todayStr = today();
  const index = habit.completed.indexOf(todayStr);

  if (index === -1) {
    habit.completed.push(todayStr);
  } else {
    habit.completed.splice(index, 1);
  }

  saveHabits(habits);
  render();
}

// Delete habit
function deleteHabit(id) {
  let habits = loadHabits();
  habits = habits.filter((h) => h.id !== id);
  saveHabits(habits);
  render();
}

// Event listeners
document.getElementById("addBtn").addEventListener("click", addHabit);
document.getElementById("habitInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") addHabit();
});

// Start
render();