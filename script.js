const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

const timerDisplay = document.getElementById("timerDisplay");
const startTimer = document.getElementById("startTimer");
const pauseTimer = document.getElementById("pauseTimer");
const resetTimer = document.getElementById("resetTimer");

const notesArea = document.getElementById("notesArea");
const saveNotesBtn = document.getElementById("saveNotesBtn");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const themeToggle = document.getElementById("themeToggle");

const exportBtn = document.getElementById("exportBtn");
const importFile = document.getElementById("importFile");

let tasks = JSON.parse(localStorage.getItem("studyflow_tasks")) || [];
let savedNotes = localStorage.getItem("studyflow_notes") || "";
let darkMode = JSON.parse(localStorage.getItem("studyflow_darkmode")) || false;

notesArea.value = savedNotes;

if (darkMode) {
  document.body.classList.add("dark");
}

function saveTasks() {
  localStorage.setItem("studyflow_tasks", JSON.stringify(tasks));
}

function updateStats() {
  totalTasks.textContent = tasks.length;
  completedTasks.textContent = tasks.filter(task => task.completed).length;
}

function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = "task-item";

    li.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px;">
        <input type="checkbox" ${task.completed ? "checked" : ""} class="complete-checkbox">
        <span style="${task.completed ? "text-decoration: line-through; color: gray;" : ""}">
          ${task.text}
        </span>
      </div>
      <button>Delete</button>
    `;

    li.querySelector("button").addEventListener("click", () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });

    li.querySelector(".complete-checkbox").addEventListener("change", () => {
      tasks[index].completed = !tasks[index].completed;
      saveTasks();
      renderTasks();
    });

    taskList.appendChild(li);
  });

  updateStats();
}

function addTask() {
  const taskText = taskInput.value.trim();
  if (taskText === "") return;

  tasks.push({ text: taskText, completed: false });
  saveTasks();
  renderTasks();
  taskInput.value = "";
}

addTaskBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addTask();
});

renderTasks();

/* Timer */
let timeLeft = 25 * 60;
let timer = null;

function updateTimerDisplay() {
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");
  timerDisplay.textContent = `${minutes}:${seconds}`;
}

startTimer.addEventListener("click", () => {
  if (timer) return;

  timer = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateTimerDisplay();
    } else {
      clearInterval(timer);
      timer = null;
      alert("Pomodoro complete!");
    }
  }, 1000);
});

pauseTimer.addEventListener("click", () => {
  clearInterval(timer);
  timer = null;
});

resetTimer.addEventListener("click", () => {
  clearInterval(timer);
  timer = null;
  timeLeft = 25 * 60;
  updateTimerDisplay();
});

updateTimerDisplay();

/* Notes */
saveNotesBtn.addEventListener("click", () => {
  localStorage.setItem("studyflow_notes", notesArea.value);
  alert("Notes saved successfully!");
});

/* Dark mode */
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "studyflow_darkmode",
    JSON.stringify(document.body.classList.contains("dark"))
  );
});

/* Export */
exportBtn.addEventListener("click", () => {
  const data = {
    tasks,
    notes: notesArea.value,
    darkMode: document.body.classList.contains("dark")
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "studyflow-backup.json";
  a.click();

  URL.revokeObjectURL(url);
});

/* Import */
importFile.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(event) {
    try {
      const data = JSON.parse(event.target.result);

      tasks = data.tasks || [];
      notesArea.value = data.notes || "";
      localStorage.setItem("studyflow_notes", notesArea.value);

      if (data.darkMode) {
        document.body.classList.add("dark");
      } else {
        document.body.classList.remove("dark");
      }

      localStorage.setItem("studyflow_darkmode", JSON.stringify(data.darkMode || false));
      saveTasks();
      renderTasks();

      alert("Data imported successfully!");
    } catch (error) {
      alert("Invalid backup file.");
    }
  };

  reader.readAsText(file);
});