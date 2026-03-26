const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

const timerDisplay = document.getElementById("timerDisplay");
const startTimer = document.getElementById("startTimer");
const pauseTimer = document.getElementById("pauseTimer");
const resetTimer = document.getElementById("resetTimer");

const notesArea = document.getElementById("notesArea");
const saveNotesBtn = document.getElementById("saveNotesBtn");

let tasks = JSON.parse(localStorage.getItem("studyflow_tasks")) || [];
let savedNotes = localStorage.getItem("studyflow_notes") || "";

notesArea.value = savedNotes;

function saveTasks() {
  localStorage.setItem("studyflow_tasks", JSON.stringify(tasks));
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

