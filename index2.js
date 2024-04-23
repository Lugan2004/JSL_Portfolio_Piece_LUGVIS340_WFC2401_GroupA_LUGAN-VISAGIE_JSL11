import {
    getTasks,
    createNewTask,
    patchTask,
    putTask,
    deleteTask,
  } from "./utils/taskFunctions.js";
  import { initialData } from "./initialData.js";
  
  /*************************************************
   * FIX BUGS!!!
   * ************************************************/
  
  // Function checks if local storage already has data, if not it loads initialData to localStorage
  
  function initializeData() {
    if (!localStorage.getItem("tasks")) {
      localStorage.setItem("tasks", JSON.stringify(initialData));
      localStorage.setItem("showSideBar", "true");
    } else {
      console.log("Data already exists in localStorage");
    }
  }
  initializeData();
  
  // TASK: Get elements from the DOM
  const elements = {
    // Sidebar
    // Navigation Sidebar elements
    sideBar: document.querySelector(".side-bar"),
    logo: document.getElementById("logo"),
    boardsNavLinks: document.getElementById("boards-nav-links-div"),
    darkThemeIcon: document.getElementById("icon-dark"),
    themeSwitch: document.getElementById("switch"),
    lightThemeIcon: document.getElementById("icon-light"),
    hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
    showSideBarBtn: document.getElementById("show-side-bar-btn"),
  
    // Header
    headerBoardName: document.getElementById("header-board-name"),
    addNewTaskBtn: document.getElementById("add-new-task-btn"),
    editBoardBtn: document.getElementById("edit-board-btn"),
  
    // Task Columns
    columnDivs: document.querySelectorAll(".column-div"),
    todoColumn: document.querySelector('.column-div[data-status="todo"]'),
    doingColumn: document.querySelector('.column-div[data-status="doing"]'),
    doneColumn: document.querySelector('.column-div[data-status="done"]'),
    filterDiv: document.getElementById("filterDiv"),
  
    // New Task Modal
    titleInput: document.getElementById("title-input"),
    descInput: document.getElementById("desc-input"),
    selectStatus: document.getElementById("select-status"),
    createTaskBtn: document.getElementById("create-task-btn"),
    cancelAddTaskBtn: document.getElementById("cancel-add-task-btn"),
    newTaskModal: document.getElementById("new-task-modal-window"),
  
    // Edit Task Modal
    editTaskModal: document.querySelector(".edit-task-modal-window"),
    editTaskTitleInput: document.getElementById("edit-task-title-input"),
    editTaskDescInput: document.getElementById("edit-task-desc-input"),
    editSelectStatus: document.getElementById("edit-select-status"),
    saveTaskChangesBtn: document.getElementById("save-task-changes-btn"),
    cancelEditBtn: document.getElementById("cancel-edit-btn"),
    deleteTaskBtn: document.getElementById("delete-task-btn"),
  
    // Filter
    filterDiv: document.getElementById("filterDiv"),
  };
  
  let activeBoard = ""; // Initialize activeBoard variable
  
  // Extracts unique board names from tasks
  // TASK: FIX BUGS
  function fetchAndDisplayBoardsAndTasks() {
    const tasks = getTasks();
    const boards = [...new Set(tasks.map((task) => task.board).filter(Boolean))];
    displayBoards(boards);
    if (boards.length > 0) {
      // Retrieve the active board from local storage
      const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
      // Check if localStorageBoard is truthy, if not, default to the first board in the array
      activeBoard = localStorageBoard ? localStorageBoard : boards[0]; // Fixed the ternary operator
      // Set the text content of headerBoardName to the active board
      elements.headerBoardName.textContent = activeBoard;
      // Apply styling to the active board
      styleActiveBoard(activeBoard);
      // Refresh the tasks UI
      refreshTasksUI();
    }
  }
  
  // Creates different boards in the DOM
  // TASK: Fix Bugs
  function displayBoards(boards) {
    const boardsContainer = document.getElementById("boards-nav-links-div");
    boardsContainer.innerHTML = ""; // Clears the container
    boards.forEach((board) => {
      const boardElement = document.createElement("button");
      boardElement.textContent = board;
      boardElement.classList.add("board-btn");
      boardElement.addEventListener("click", () => {
        // Changed ".click()" to ".addEventListener('click', () => {...})"
        elements.headerBoardName.textContent = board;
        filterAndDisplayTasksByBoard(board);
        activeBoard = board; // Assigns active board
        localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
        styleActiveBoard(activeBoard);
      });
      boardsContainer.appendChild(boardElement);
    });
  }
  
  // Filters tasks corresponding to the board name and displays them on the DOM.
  // TASK: Fix Bugs
  function filterAndDisplayTasksByBoard(boardName) {
    const tasks = getTasks(); // Fetch tasks from a simulated local storage function
    const filteredTasks = tasks.filter((task) => task.board === boardName); // Changed "=" to "===" for comparison
  
    // Ensure the column titles are set outside of this function or correctly initialized before this function runs
  
    elements.columnDivs.forEach((column) => {
      const status = column.getAttribute("data-status");
      // Reset column content while preserving the column title
      column.innerHTML = `<div class="column-head-div">
                            <span class="dot" id="${status}-dot"></span>
                            <h4 class="columnHeader">${status.toUpperCase()}</h4>
                          </div>`;
  
      const tasksContainer = document.createElement("div");
      column.appendChild(tasksContainer);
  
      // Filter tasks based on status and create task elements for each filtered task
      filteredTasks
        .filter((task) => task.status === status)
        .forEach((task) => {
          // Changed "=" to "===" for comparison
          const taskElement = document.createElement("div");
          taskElement.classList.add("task-div");
          taskElement.textContent = task.title;
          taskElement.setAttribute("data-task-id", task.id);
  
          // Listen for a click event on each task and open a modal
          taskElement.addEventListener("click", () => {
            // Changed ".click()" to ".addEventListener('click', () => {...})"
            openEditTaskModal(task);
          });
  
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
    document.querySelectorAll(".board-btn").forEach((btn) => {
      if (btn.textContent === boardName) {
        btn.classList.add("active"); // Add the 'active' class
      } else {
        btn.classList.remove("active"); // Remove the 'active' class
      }
    });
  }
  
  function addTaskToUI(task) {
    const column = document.querySelector(
      .column-div[data-status="${task.status}"]
    ); // Corrected string interpolation
    if (!column) {
      console.error(Column not found for status: ${task.status});
      return;
    }
  
    let tasksContainer = column.querySelector(".tasks-container");
    if (!tasksContainer) {
      console.warn(
        Tasks container not found for status: ${task.status}, creating one.
      );
      tasksContainer = document.createElement("div");
      tasksContainer.className = "tasks-container";
      column.appendChild(tasksContainer);
    }
  
    const taskElement = document.createElement("div");
    taskElement.className = "task-div";
    taskElement.textContent = task.title; // Modify as needed
    taskElement.setAttribute("data-task-id", task.id);
  
    tasksContainer.appendChild(taskElement);
  }
  
  function setupEventListeners() {
    // Cancel editing task event listener
    const cancelEditBtn = document.getElementById("cancel-edit-btn");
    cancelEditBtn.addEventListener("click", () =>
      toggleModal(false, elements.editTaskModal)
    );
  
    // Cancel adding new task event listener
    const cancelAddTaskBtn = document.getElementById("cancel-add-task-btn");
    cancelAddTaskBtn.addEventListener("click", () => {
      toggleModal(false);
      elements.filterDiv.style.display = "none"; // Also hide the filter overlay
    });
  
    // Clicking outside the modal to close it
    elements.filterDiv.addEventListener("click", () => {
      toggleModal(false);
      elements.filterDiv.style.display = "none"; // Also hide the filter overlay
    });
  
    // Show sidebar event listener
  
    elements.hideSideBarBtn.addEventListener("click", () => toggleSidebar(false));
    elements.showSideBarBtn.addEventListener("click", () => toggleSidebar(true));
  
    // Theme switch event listener
    elements.themeSwitch.addEventListener("change", toggleTheme);
  
    // Show Add New Task Modal event listener
    elements.addNewTaskBtn.addEventListener("click", () => {
      toggleModal(true);
      elements.filterDiv.style.display = "block"; // Also show the filter overlay
    });
  
    // Add new task form submission event listener
    elements.newTaskModal.addEventListener("submit", (event) => {
      addTask(event);
    });
  }
  
  // Toggles tasks modal
  // Task8: Fix bugs
  function toggleModal(show, modal = elements.editTaskModal) {
    if (modal) {
      modal.style.display = show ? "block" : "none";
    }
  }
  
  /*************************************************
   * COMPLETE FUNCTION CODE
   * ************************************************/
  
  function addTask(event) {
    event.preventDefault();
  
    //Assign user input to the task object
    const task = {};
    const newTask = createNewTask(task);
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      elements.filterDiv.style.display = "none"; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
    }
  }
  
  function toggleSidebar(show) {
    if (show) {
      console.log("show sidebar button clicked");
      elements.sideBar.style.display = "block"; // Display the sidebar
      elements.showSideBarBtn.style.display = "none";
    } else {
      elements.sideBar.style.display = "none"; // Change "now" to "none"
      elements.showSideBarBtn.style.display = "block";
    }
  }
  toggleSidebar(true);
  
  function toggleTheme() {
    // Get a reference to the document body
    const body = document.body;
  
    // Toggle between light and dark theme classes on the body
    body.classList.toggle("light-theme");
    body.classList.toggle("dark-theme");
  
    // Check if the current theme is light or dark
    const isLightTheme = body.classList.contains("light-theme");
  
    // Store the theme preference in local storage
    localStorage.setItem("theme", isLightTheme ? "light" : "dark");
  }
  
  function openEditTaskModal(task) {
    // Set task details in modal inputs
    const titleInput = document.getElementById("edit-task-title-input");
    const descInput = document.getElementById("edit-task-desc-input");
    const selectStatus = document.getElementById("edit-select-status");
    titleInput.value = task.title;
    descInput.value = task.description;
    selectStatus.value = task.status;
  
    // Get button elements from the task modal
    const saveChangesBtn = document.getElementById("save-task-changes-btn");
    const deleteTaskBtn = document.getElementById("delete-task-btn");
  
    // Call saveTaskChanges upon click of Save Changes button
    saveChangesBtn.addEventListener("click", () => {
      saveTaskChanges(task);
      toggleModal(false, elements.editTaskModal); // Close the edit task modal
    });
  
    // Delete task using a helper function and close the task modal
    deleteTaskBtn.addEventListener("click", () => {
      deleteTask(task);
      toggleModal(false, elements.editTaskModal); // Close the edit task modal
    });
  
    toggleModal(true, elements.editTaskModal); // Show the edit task modal
  }
  
  function saveTaskChanges(taskId) {
    // Get new user inputs
    const updatedTitle = document.getElementById("edit-task-title-input").value;
    const updatedDesc = document.getElementById("edit-task-desc-input").value;
    const updatedStatus = document.getElementById("edit-select-status").value;
  
    // Create an object with the updated task details
    const updatedTask = {
      id: taskId,
      title: updatedTitle,
      description: updatedDesc,
      status: updatedStatus,
    };
  
    // Update task using a hlper functoin
    // Replace the following line with the appropriate function call to update the task
    updateTask(updatedTask);
  
    // Close the modal and refresh the UI to reflect the changes
    toggleModal(false, elements.editTaskModal);
  
    refreshTasksUI();
  }
  
  /*************************************************/
  
  document.addEventListener("DOMContentLoaded", function () {
    init(); // init is called after the DOM is fully loaded
  });
  
  function init() {
    setupEventListeners();
    const showSidebar = localStorage.getItem("showSideBar") === "true";
    toggleSidebar(showSidebar);
    const isLightTheme = localStorage.getItem("light-theme") === "enabled";
    document.body.classList.toggle("light-theme", isLightTheme);
    fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
  }