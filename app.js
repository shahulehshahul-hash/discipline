// Simple habit tracker - stores everything in localStorage

const STORAGE_KEY = "discipline_habits";

// Get today's date as YYYY-MM-DD
function today() {
  return new Date().toISOString().slice(0, 10);
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

// Render the list
function render() {
  const habits = loadHabits();
  const list = document.getElementById("habitsList");

  if (habits.length === 0) {
    list.innerHTML = `<div class="empty">No habits yet. Add one above.</div>`;
    return;
  }

  const todayStr = today();

  list.innerHTML = habits
    .map((habit) => {
      const isDone = habit.completed.includes(todayStr);
      return `
        <div class="habit-item ${isDone ? "done" : ""}" data-id="${habit.id}">
          <div class="habit-check" onclick="toggleHabit('${habit.id}')"></div>
          <div class="habit-name">${habit.name}</div>
          <button class="habit-delete" onclick="deleteHabit('${habit.id}')">×</button>
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