const STORAGE_KEY = "lista_tarefas_scrum";

const form = document.getElementById("taskForm");
const input = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");
const taskCount = document.getElementById("taskCount");
const doneCount = document.getElementById("doneCount");

let tasks = loadTasks();

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function createTask(title) {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    title: title.trim(),
    completed: false
  };
}

function render() {
  taskList.innerHTML = "";

  tasks.forEach(task => {
    const li = document.createElement("li");
    li.className = "task" + (task.completed ? " completed" : "");
    li.dataset.id = task.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.title = "Marcar como concluída";
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      render();
    });

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;

    const editButton = document.createElement("button");
    editButton.textContent = "Editar";
    editButton.addEventListener("click", () => startEditing(task, li));

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Excluir";
    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter(item => item.id !== task.id);
      saveTasks();
      render();
    });

    li.append(checkbox, title, editButton, deleteButton);
    taskList.appendChild(li);
  });

  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;

  taskCount.textContent = `${total} ${total === 1 ? "tarefa" : "tarefas"}`;
  doneCount.textContent = `${completed} concluída${completed === 1 ? "" : "s"}`;
  emptyMessage.classList.toggle("hidden", total !== 0);
}

function startEditing(task, li) {
  const title = li.querySelector(".task-title");
  const oldTitle = task.title;

  const editInput = document.createElement("input");
  editInput.className = "edit-input";
  editInput.value = oldTitle;
  editInput.maxLength = 120;

  const saveButton = document.createElement("button");
  saveButton.textContent = "Salvar";

  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancelar";

  title.replaceWith(editInput);

  li.querySelectorAll("button").forEach(button => button.remove());
  li.append(saveButton, cancelButton);

  editInput.focus();
  editInput.select();

  function finish(save) {
    if (save) {
      const newTitle = editInput.value.trim();
      if (!newTitle) {
        alert("O título não pode ficar vazio.");
        editInput.focus();
        return;
      }
      task.title = newTitle;
      saveTasks();
    }
    render();
  }

  saveButton.addEventListener("click", () => finish(true));
  cancelButton.addEventListener("click", () => finish(false));

  editInput.addEventListener("keydown", event => {
    if (event.key === "Enter") finish(true);
    if (event.key === "Escape") finish(false);
  });
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const title = input.value.trim();
  if (!title) return;

  tasks.push(createTask(title));
  saveTasks();
  input.value = "";
  input.focus();
  render();
});

render();
