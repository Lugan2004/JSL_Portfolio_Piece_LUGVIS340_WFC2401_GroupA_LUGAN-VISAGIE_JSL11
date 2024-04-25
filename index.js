// TASK: import helper functions from utils
import { getTasks, createNewTask, patchTask, deleteTask, putTask } from './utils/taskFunctions.js';
// TASK: import initialData
import { initialData } from './initialData.js';


/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
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
    activeBoard = localStorage.getItem("activeBoard") || boards[0];
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
      localStorage.setItem("activeBoard", activeBoard);
      styleActiveBoard(activeBoard);
    });
    boardsContainer.appendChild(boardElement);
  });
}



//Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs

function filterAndDisplayTasksByBoard(boardName) {
  const filteredTasks = getTasks().filter((task) => task.board === boardName);

  elements.columnDivs.forEach(column => {
    const status = column.dataset.status;
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    tasksContainer.classList.add('tasks-container');
    column.appendChild(tasksContainer);

    filteredTasks.filter((task) => task.status === status).forEach(task => {
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

  const tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.error(`Tasks container not found for status: ${task.status}`);
    return;
  }

  const existingTaskElement = tasksContainer.querySelector(`.task-div[data-task-id="${task.id}"]`);
  if (existingTaskElement) {
    console.warn(`Task with ID ${task.id} already exists in the tasks container.`);
    return;
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title;
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

// Function to handle the addition of a new task
function addTask(event) {
  event.preventDefault(); // Prevent form submission

  // Get input values from the form
  const titleInput = document.getElementById("title-input");
  const descInput = document.getElementById("desc-input");
  const statusSelect = document.getElementById("select-status");
  const filterDiv = elements.filterDiv;
  

  // Create task object with input values
  const taskData = {
    title: titleInput.value,
    description: descInput.value,
    status: statusSelect.value,
    board: activeBoard
  };

  // Create new task and add to UI
  const newTask = createNewTask(taskData);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    updateLocalStorageTasks(newTask);
    initialData.push(newTask);
    filterDiv.style.display = "none";
    event.target.reset(); // Reset form fields
    localStorage.setItem('tasks', JSON.stringify(initialData)); // Update local storage
    refreshTasksUI(); // Refresh UI
  }
}

// Function to update local storage with new task
function updateLocalStorageTasks(newTask) {
  let tasks = getTasks();
  tasks.push(newTask); // Add new task to tasks array
  localStorage.setItem('tasks', JSON.stringify(tasks)); // Update local storage
}

// Function to toggle the sidebar visibility
function toggleSidebar(show) {
  const sidebarElement = document.getElementById('side-bar-div');
  const showSideBarBtn = elements.showSideBarBtn;

  // Show sidebar
  const showSidebar = () => {
    sidebarElement.style.display = 'block';
    showSideBarBtn.style.display = 'none';
    localStorage.setItem('showSidebar', 'true'); // Update local storage
  };

  // Hide sidebar
  const hideSidebar = () => {
    sidebarElement.style.display = 'none';
    showSideBarBtn.style.display = 'block';
    localStorage.setItem('showSidebar', 'false'); // Update local storage
  };

  // Toggle sidebar based on show parameter
  if (show) {
    showSidebar();
  } else {
    hideSidebar();
  }
}

// Function to toggle between light and dark themes
function toggleTheme() {
  // Get elements and theme from local storage
  const body = document.body;
  const logo = document.getElementById('logo');
  const themeSwitch = elements.themeSwitch;
  const theme = localStorage.getItem('theme');

  // Set light theme
  const setLightTheme = () => {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
    logo.src = './assets/logo-light.svg';
    localStorage.setItem('theme', 'light'); // Update local storage
    themeSwitch.checked = false;
  };

  // Set dark theme
  const setDarkTheme = () => {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
    logo.src = './assets/logo-dark.svg';
    localStorage.setItem('theme', 'dark'); // Update local storage
    themeSwitch.checked = true;
  };

  // Toggle theme based on current theme
  if (theme === 'dark') {
    setLightTheme();
  } else {
    setDarkTheme();
  }
}

// Function to set the theme on page load
function setThemeOnLoad() {
  // Get elements and theme from local storage
  const theme = localStorage.getItem('theme');
  const body = document.body;
  const logo = document.getElementById('logo');
  const themeSwitch = elements.themeSwitch;

  // Set light theme
  const setLightTheme = () => {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
    logo.src = './assets/logo-light.svg';
    themeSwitch.checked = false;
  };

  // Set dark theme
  const setDarkTheme = () => {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
    logo.src = './assets/logo-dark.svg';
    themeSwitch.checked = true;
  };

  // Set theme based on stored theme
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

// Add event listener to theme switch button
elements.themeSwitch.addEventListener('change', toggleTheme);

// Function to open the edit task modal and handle saving or deleting changes
function openEditTaskModal(task) {
  // Get elements from the modal
  const titleInput = document.getElementById("edit-task-title-input");
  const descInput = document.getElementById("edit-task-desc-input");
  const statusSelect = document.getElementById("edit-select-status");
  const saveTaskChangesBtn = document.getElementById("save-task-changes-btn");
  const deleteTaskBtn = document.getElementById("delete-task-btn");

  // Set task details in modal inputs
  titleInput.value = task.title;
  descInput.value = task.description;
  statusSelect.value = task.status;

  // Event handlers for save and delete buttons
  saveTaskChangesBtn.addEventListener("click", handleSaveChanges);
  deleteTaskBtn.addEventListener("click", handleDeleteTask);

  // Show the edit task modal
  toggleModal(true, elements.editTaskModal);

  // Function to handle saving changes
  function handleSaveChanges() {
    saveTaskChanges(task.id);
    refreshTasksUI();
    toggleModal(false, elements.editTaskModal);
  }

  // Function to handle deleting task
  function handleDeleteTask() {
    deleteTask(task.id);
    refreshTasksUI();
    toggleModal(false, elements.editTaskModal);
  }
}

// Function to save changes made to a task
function saveTaskChanges(taskId) {
  // Get updated task details from modal inputs
  const updatedTitle = document.getElementById("edit-task-title-input").value;
  const updatedDesc = document.getElementById("edit-task-desc-input").value;
  const updatedStatus = document.getElementById("edit-select-status").value;

  // Get tasks from local storage
  const tasks = getTasks();

  // Find index of task with matching ID
  const taskIndex = tasks.findIndex(task => task.id === taskId);

  // Create updated task object
  const updatedTask = {
    id: taskId,
    title: updatedTitle,
    description: updatedDesc,
    board:activeBoard,
    status: updatedStatus
  };

  // Update task in tasks array
  if (taskIndex !== -1) {
    tasks[taskIndex] = updatedTask;
    putTask(taskId, tasks[taskIndex]); // Update task in database
  } else {
    tasks.push(updatedTask); // Add new task to tasks array
    patchTask(taskId, updatedTask); // Add task to database
  }

  // Update tasks in local storage
  localStorage.setItem("tasks", JSON.stringify(tasks));
  refreshTasksUI(); // Refresh UI
  toggleModal(false, elements.editTaskModal); // Close modal
  setThemeFromLocalStorage(); // Update theme from local storage
}

document.addEventListener('DOMContentLoaded', function() {
  init(); // Call init function after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSidebar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}