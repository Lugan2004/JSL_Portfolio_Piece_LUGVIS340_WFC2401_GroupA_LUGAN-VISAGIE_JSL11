// TASK: import helper functions from utils
import { getTasks, createNewTask, patchTask, deleteTask, putTask } from './utils/taskFunctions.js'; // Or: import { getTasks, createNewTask, patchTask, deleteTask } from './utils/taskFunctions.js';
// TASK: import initialData
import { initialData } from './initialData.js';


/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage

//localStorage.clear()
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSidebar', 'true'); 
  } else {
    console.log('Data already exists in localStorage');
  }
}

initializeData();


// TASK: Get elements from the DOM
const elements = {
  headerBoardName: document.getElementById('header-board-name'),
  columnDivs: document.querySelectorAll('.column-div'),
  editTaskModal: document.querySelector('.edit-task-modal-window'),
  filterDiv: document.getElementById('filterDiv'),
  hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
  showSideBarBtn: document.getElementById('show-side-bar-btn'),
  themeSwitch: document.getElementById('switch'),
  addNewTaskBrn: document.getElementById('add-new-task-btn'),
  modalWindow: document.getElementById('new-task-modal-window')

};

let activeBoard = "";

// Extracts unique board names from tasks
// TASK: FIX BUGS

function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    activeBoard = JSON.parse(localStorage.getItem("activeBoard")) || boards[0];
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs

function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener("click", () => { 
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; 
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    boardsContainer.appendChild(boardElement);
  });
}



//Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs

function filterAndDisplayTasksByBoard(boardName) {
  const filteredTasks = getTasks().filter(task => task.board === boardName);

  elements.columnDivs.forEach(column => {
    const status = column.dataset.status;
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => {
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.dataset.taskId = task.id;
      taskElement.addEventListener("click", () => openEditTaskModal(task));

      tasksContainer.appendChild(taskElement);
    });
  });
}
  

function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    if (btn.textContent === boardName) {
      btn.classList.add('active'); 
    } else {
      btn.classList.remove('active'); 
    }
  });
}

function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`);
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  // Create a unique tasks container for each task
  const tasksContainer = document.createElement('div');
  tasksContainer.className = 'tasks-container';
  column.appendChild(tasksContainer);

  // Check if the task already exists in the tasks container
  const existingTaskElement = tasksContainer.querySelector(`.task-div[data-task-id="${task.id}"]`);
  if (existingTaskElement) {
    console.warn(`Task with ID ${task.id} already exists in the tasks container.`);
    return;
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  taskElement.addEventListener('click', () => openEditTaskModal(task));
  
  tasksContainer.appendChild(taskElement);
}

function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click', () => toggleModal(false, elements.editTaskModal)); 
};


  // Cancel adding new task event listener*
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it*
  elements.filterDiv.addEventListener('click', (event) => {
    if (event.target === elements.filterDiv) {
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
    }
  });
  

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));


  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.addNewTaskBrn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });
  
  elements.modalWindow.addEventListener('submit', (event) => {
    addTask(event);
  });
  
  

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none'; 
}


/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault();

  const titleInput = document.getElementById("title-input");
  const descInput = document.getElementById("desc-input");
  const statusSelect = document.getElementById("select-status");
  const filterDiv = elements.filterDiv;

  const taskData = {
    title: titleInput.value,
    description: descInput.value,
    status: statusSelect.value,
    board: activeBoard
  };

  const newTask = createNewTask(taskData);

  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    updateLocalStorageTasks(newTask);
    initialData.push(newTask);
    filterDiv.style.display = "none";
    event.target.reset();
    localStorage.setItem('tasks', JSON.stringify(initialData));
    refreshTasksUI();
  }
}
function updateLocalStorageTasks(newTask) {
  let tasks = getTasks();
  tasks.push(newTask);
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function toggleSidebar(show) {
  const sidebarElement = document.getElementById('side-bar-div');
  const showSideBarBtn = elements.showSideBarBtn;

  const showSidebar = () => {
    sidebarElement.style.display = 'block';
    showSideBarBtn.style.display = 'none';
    localStorage.setItem('showSidebar', 'true');
  };

  const hideSidebar = () => {
    sidebarElement.style.display = 'none';
    showSideBarBtn.style.display = 'block';
    localStorage.setItem('showSidebar', 'false');
  };

  if (show) {
    showSidebar();
  } else {
    hideSidebar();
  }
}

// Function to toggle the theme and update the UI and localStorage
function toggleTheme() {
  const body = document.body;
  const logo = document.getElementById('logo');
  const themeSwitch = elements.themeSwitch;

  const setLightTheme = () => {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
    logo.src = './assets/logo-light.svg';
    localStorage.setItem('theme', 'light');
    themeSwitch.checked = false;
  };

  const setDarkTheme = () => {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
    logo.src = './assets/logo-dark.svg';
    localStorage.setItem('theme', 'dark');
    themeSwitch.checked = true;
  };

  if (body.classList.contains('light-theme')) {
    setDarkTheme();
  } else {
    setLightTheme();
  }
}

// Function to set the theme based on the preference stored in local storage
function setThemeOnLoad() {
  const theme = localStorage.getItem('theme');
  const body = document.body;
  const logo = document.getElementById('logo');
  const themeSwitch = elements.themeSwitch;

  const setLightTheme = () => {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
    logo.src = './assets/logo-light.svg';
    themeSwitch.checked = false;
  };

  const setDarkTheme = () => {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
    logo.src = './assets/logo-dark.svg';
    themeSwitch.checked = true;
  };

  switch (theme) {
    case 'dark':
      setDarkTheme();
      break;
    case 'light':
      setLightTheme();
      break;
    default:
      setLightTheme(); // Set light theme as default
      break;
  }
}

// Call setThemeOnLoad when the page loads
window.onload = setThemeOnLoad;

// Add an event listener to the theme switch button
elements.themeSwitch.addEventListener('change', toggleTheme);



function openEditTaskModal(task) {
  const titleInput = document.getElementById("edit-task-title-input");
  const descInput = document.getElementById("edit-task-desc-input");
  const statusSelect = document.getElementById("edit-select-status");
  const saveTaskChangesBtn = document.getElementById("save-task-changes-btn");
  const deleteTaskBtn = document.getElementById("delete-task-btn");

  // Set task details in modal inputs
  titleInput.value = task.title;
  descInput.value = task.description;
  statusSelect.value = task.status;

  // Event handlers
  saveTaskChangesBtn.addEventListener("click", handleSaveChanges);
  deleteTaskBtn.addEventListener("click", handleDeleteTask);

  // Show the edit task modal
  toggleModal(true, elements.editTaskModal);

  function handleSaveChanges() {
    saveTaskChanges(task.id);
    refreshTasksUI();
    toggleModal(false, elements.editTaskModal);
  }

  function handleDeleteTask() {
    deleteTask(task.id);
    refreshTasksUI();
    toggleModal(false, elements.editTaskModal);
  }
}

function saveTaskChanges(taskId) {
  const updatedTitle = document.getElementById("edit-task-title-input").value;
  const updatedDesc = document.getElementById("edit-task-desc-input").value;
  const updatedStatus = document.getElementById("edit-select-status").value;

  const tasks = getTasks();
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  const updatedTask = {
    id: taskId,
    title: updatedTitle,
    description: updatedDesc,
    status: updatedStatus
  };

  if (taskIndex !== -1) {
    tasks[taskIndex] = updatedTask;
    putTask(taskId, tasks[taskIndex]);
  } else {
    tasks.push(updatedTask);
    patchTask(taskId, updatedTask);
  }

  localStorage.setItem("tasks", JSON.stringify(tasks));
  refreshTasksUI();
  toggleModal(false, elements.editTaskModal);
  setThemeFromLocalStorage();
}



document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}