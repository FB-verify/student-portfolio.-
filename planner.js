/* ==========================================================
   planner.js - Academic Planner
   Add tasks, mark them completed, delete them.
   Uses an array of task objects, functions, event handling,
   DOM manipulation and dynamic content updates.
   Tasks are saved in the browser (localStorage).
   ========================================================== */

(function () {
  "use strict";

  var STORAGE_KEY = "academic-planner-tasks";

  var form = document.getElementById("taskForm");
  var titleInput = document.getElementById("taskTitle");
  var dueInput = document.getElementById("taskDue");
  var priorityInput = document.getElementById("taskPriority");
  var errorEl = document.getElementById("taskError");
  var listEl = document.getElementById("taskList");
  var counterEl = document.getElementById("taskCounter");
  var progressEl = document.getElementById("progressFill");
  var progressText = document.getElementById("progressText");
  var filterBtns = document.querySelectorAll(".filter-btn[data-filter]");
  var clearBtn = document.getElementById("clearCompleted");

  if (!form || !listEl) return;

  // The main array that holds every task
  var tasks = loadTasks();
  var currentFilter = "all";

  /* ---------- Storage helpers ---------- */
  function loadTasks() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(saved)) return saved;
    } catch (e) { /* ignore and use sample tasks */ }
    return [
      { id: 1, title: "Read Chapter 1 of Introduction to Cybersecurity", due: "", priority: "medium", done: false },
      { id: 2, title: "Practice HTML and CSS for 1 hour", due: "", priority: "low", done: true }
    ];
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) { /* storage unavailable, planner still works this visit */ }
  }

  /* ---------- Core functions ---------- */
  function addTask(title, due, priority) {
    var task = {
      id: Date.now(),
      title: title,
      due: due,
      priority: priority,
      done: false
    };
    tasks.unshift(task);
    saveTasks();
    render();
  }

  function toggleTask(id) {
    tasks.forEach(function (task) {
      if (task.id === id) task.done = !task.done;
    });
    saveTasks();
    render();
  }

  function deleteTask(id, li) {
    li.classList.add("removing");
    setTimeout(function () {
      tasks = tasks.filter(function (task) { return task.id !== id; });
      saveTasks();
      render();
    }, 280);
  }

  function clearCompleted() {
    tasks = tasks.filter(function (task) { return !task.done; });
    saveTasks();
    render();
  }

  function getVisibleTasks() {
    if (currentFilter === "active") return tasks.filter(function (t) { return !t.done; });
    if (currentFilter === "completed") return tasks.filter(function (t) { return t.done; });
    return tasks;
  }

  function formatDate(value) {
    if (!value) return "No due date";
    var d = new Date(value + "T00:00:00");
    return "Due " + d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  }

  function isOverdue(task) {
    if (!task.due || task.done) return false;
    return new Date(task.due + "T23:59:59") < new Date();
  }

  /* ---------- Rendering (DOM manipulation) ---------- */
  function render() {
    listEl.innerHTML = "";
    var visible = getVisibleTasks();

    if (visible.length === 0) {
      var empty = document.createElement("li");
      empty.className = "empty-state";
      empty.textContent = tasks.length === 0
        ? "No tasks yet. Add your first task using the form."
        : "No " + currentFilter + " tasks to show.";
      listEl.appendChild(empty);
    }

    visible.forEach(function (task) {
      var li = document.createElement("li");
      li.className = "task priority-" + task.priority + (task.done ? " done" : "") + (isOverdue(task) ? " overdue" : "");

      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.done;
      checkbox.setAttribute("aria-label", "Mark \"" + task.title + "\" as completed");
      checkbox.addEventListener("change", function () { toggleTask(task.id); });

      var info = document.createElement("div");
      info.className = "task-info";

      var title = document.createElement("div");
      title.className = "task-title";
      title.textContent = task.title; // textContent keeps user input safe

      var meta = document.createElement("div");
      meta.className = "task-meta";
      meta.textContent = formatDate(task.due) + " • " + task.priority + " priority" + (isOverdue(task) ? " \u2022 OVERDUE" : "");

      info.appendChild(title);
      info.appendChild(meta);

      var del = document.createElement("button");
      del.type = "button";
      del.className = "delete-btn";
      del.innerHTML = "&#128465;";
      del.setAttribute("aria-label", "Delete task: " + task.title);
      del.addEventListener("click", function () { deleteTask(task.id, li); });

      li.appendChild(checkbox);
      li.appendChild(info);
      li.appendChild(del);
      listEl.appendChild(li);
    });

    updateStats();
  }

  function updateStats() {
    var total = tasks.length;
    var done = tasks.filter(function (t) { return t.done; }).length;
    var percent = total === 0 ? 0 : Math.round((done / total) * 100);

    counterEl.textContent = (total - done) + " active • " + done + " completed • " + total + " total";
    progressEl.style.width = percent + "%";
    progressText.textContent = percent + "% done";
    clearBtn.disabled = done === 0;
    clearBtn.style.opacity = done === 0 ? "0.5" : "1";
  }

  /* ---------- Events ---------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var title = titleInput.value.trim();

    if (title === "") {
      errorEl.textContent = "Please type a task before adding it.";
      titleInput.parentElement.classList.add("invalid");
      titleInput.focus();
      return;
    }
    if (title.length > 120) {
      errorEl.textContent = "Task is too long (maximum 120 characters).";
      return;
    }

    errorEl.textContent = "";
    titleInput.parentElement.classList.remove("invalid");
    addTask(title, dueInput.value, priorityInput.value);
    form.reset();
    titleInput.focus();
  });

  titleInput.addEventListener("input", function () {
    errorEl.textContent = "";
    titleInput.parentElement.classList.remove("invalid");
  });

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      currentFilter = btn.getAttribute("data-filter");
      filterBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      render();
    });
  });

  clearBtn.addEventListener("click", clearCompleted);

  render();
})();
