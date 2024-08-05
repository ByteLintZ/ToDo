// Select Elements
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const tasksUl = document.getElementById("tasks");
const prioritySelect = document.getElementById("prioritySelect");
const categorySelect = document.getElementById("categorySelect");

// Filter Elements
const filterPriority = document.getElementById("filterPriority");
const filterCategory = document.getElementById("filterCategory");
const filterStatus = document.getElementById("filterStatus");

// Load Tasks on Page Load
document.addEventListener("DOMContentLoaded", loadTasks);

// Event Listener for Adding Task
addTaskBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});

// Event Listeners for Filters
filterPriority.addEventListener("change", filterTasks);
filterCategory.addEventListener("change", filterTasks);
filterStatus.addEventListener("change", filterTasks);

// Function to Add Task
function addTask() {
  const taskText = taskInput.value.trim();
  const priority = prioritySelect.value;
  const category = categorySelect.value;

  if (taskText !== "") {
    const task = {
      text: taskText,
      priority: priority,
      category: category,
      completed: false,
    };

    const tasks = getTasks();
    tasks.push(task);
    saveTasks(tasks);

    appendTask(task);

    taskInput.value = "";
  }
}

// Function to Append Task to List
function appendTask(task) {
  const li = document.createElement("li");
  li.className = `list-group-item d-flex justify-content-between align-items-center ${task.priority}-priority ${task.category}-category fade-in`;
  li.setAttribute("draggable", true);
  li.dataset.completed = task.completed;
  li.dataset.priority = task.priority;
  li.dataset.category = task.category;

  if (task.completed) {
    li.classList.add("completed");
  }

  li.innerHTML = `
        <span>${task.text}</span>
        <span>
            <button class="btn btn-sm btn-success complete-btn"><i class="fas fa-check"></i></button>
            <button class="btn btn-sm btn-danger delete-btn"><i class="fas fa-trash"></i></button>
        </span>
    `;

  tasksUl.appendChild(li);

  li.querySelector(".complete-btn").addEventListener("click", () =>
    toggleCompleteTask(li)
  );
  li.querySelector(".delete-btn").addEventListener("click", () =>
    deleteTask(li)
  );

  li.addEventListener("dragstart", dragStart);
  li.addEventListener("dragend", dragEnd);
}

// Function to Load Tasks
function loadTasks() {
  const tasks = getTasks();
  tasksUl.innerHTML = "";
  tasks.forEach((task) => appendTask(task));
}

// Function to Save Tasks to Local Storage
function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Function to Get Tasks from Local Storage
function getTasks() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

// Function to Toggle Complete Task
function toggleCompleteTask(li) {
  const tasks = getTasks();
  const taskText = li.querySelector("span").innerText;

  tasks.forEach((task) => {
    if (task.text === taskText) {
      task.completed = !task.completed;
      li.classList.toggle("completed");
    }
  });

  saveTasks(tasks);
}

// Function to Delete Task
function deleteTask(li) {
  const tasks = getTasks();
  const taskText = li.querySelector("span").innerText;

  const newTasks = tasks.filter((task) => task.text !== taskText);
  saveTasks(newTasks);
  li.remove();
}

// Function to Filter Tasks
function filterTasks() {
  const priority = filterPriority.value;
  const category = filterCategory.value;
  const status = filterStatus.value;

  const tasks = getTasks();
  tasksUl.innerHTML = "";

  tasks
    .filter((task) => {
      return (
        (priority === "all" || task.priority === priority) &&
        (category === "all" || task.category === category) &&
        (status === "all" ||
          (status === "completed" ? task.completed : !task.completed))
      );
    })
    .forEach((task) => appendTask(task));
}

// Drag & Drop Functions
let draggedItem = null;

function dragStart(e) {
  draggedItem = this;
  setTimeout(() => this.classList.add("dragging"), 0);
}

function dragEnd() {
  this.classList.remove("dragging");
  draggedItem = null;
}

tasksUl.addEventListener("dragover", (e) => {
  e.preventDefault();
  const afterElement = getDragAfterElement(tasksUl, e.clientY);
  const draggable = document.querySelector(".dragging");
  if (afterElement == null) {
    tasksUl.appendChild(draggable);
  } else {
    tasksUl.insertBefore(draggable, afterElement);
  }
});

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".list-group-item:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}
