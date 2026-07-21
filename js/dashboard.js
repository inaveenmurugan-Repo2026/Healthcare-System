'use strict';

/* =========================================================
   Hospital Employee Management System (HEMS)
   Dashboard Script (dashboard.js)
   ========================================================= */

/* ---------------------------------------------------------
   1. Constants
   --------------------------------------------------------- */
const RECENT_EMPLOYEES_LIMIT = 5;

/* ---------------------------------------------------------
   2. Authentication guard
   --------------------------------------------------------- */

// Confirm the user is logged in; redirect to the login page if not.
// Returns true when the session is valid, false otherwise.
const checkLogin = () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn');

  if (isLoggedIn !== 'true') {
    window.location.href = 'index.html';
    return false;
  }

  return true;
};

/* ---------------------------------------------------------
   3. Data access helpers
   --------------------------------------------------------- */

// Retrieve the employee list from LocalStorage.
// Falls back to an empty array if no data exists or it is malformed.
const getEmployees = () => {
  const storedEmployees = localStorage.getItem('employees');

  if (!storedEmployees) {
    return [];
  }

  try {
    const parsedEmployees = JSON.parse(storedEmployees);
    return Array.isArray(parsedEmployees) ? parsedEmployees : [];
  } catch (error) {
    return [];
  }
};

// Capitalize the first letter of a string (used for the welcome message).
const capitalizeFirstLetter = (text) =>
  text ? text.charAt(0).toUpperCase() + text.slice(1) : text;

/* ---------------------------------------------------------
   4. Welcome message
   --------------------------------------------------------- */

// Read the logged-in user from LocalStorage and display a welcome message.
const displayWelcomeMessage = () => {
  const welcomeMessage = document.getElementById('welcomeMessage');
  const loggedInUser = localStorage.getItem('loggedInUser') || 'Admin';

  if (welcomeMessage) {
    welcomeMessage.textContent = `Welcome ${capitalizeFirstLetter(loggedInUser)}`;
  }
};

/* ---------------------------------------------------------
   5. Dashboard summary cards
   --------------------------------------------------------- */

// Update the summary cards based on the current employee data.
const updateCards = (employees) => {
  const totalEmployeesEl = document.getElementById('totalEmployees');
  const doctorCountEl = document.getElementById('doctorCount');
  const nurseCountEl = document.getElementById('nurseCount');
  const adminCountEl = document.getElementById('adminCount');

  const doctorCount = employees.filter(
    (employee) => (employee.role || '').toLowerCase() === 'doctor'
  ).length;

  const nurseCount = employees.filter(
    (employee) => (employee.role || '').toLowerCase() === 'nurse'
  ).length;

  const adminCount = employees.filter((employee) =>
    (employee.role || '').toLowerCase().includes('admin')
  ).length;

  if (totalEmployeesEl) totalEmployeesEl.textContent = employees.length;
  if (doctorCountEl) doctorCountEl.textContent = doctorCount;
  if (nurseCountEl) nurseCountEl.textContent = nurseCount;
  if (adminCountEl) adminCountEl.textContent = adminCount;
};

/* ---------------------------------------------------------
   6. Recent employees table
   --------------------------------------------------------- */

// Build a single table row for one employee record.
const createEmployeeRow = (employee) => {
  const row = document.createElement('tr');
  row.id = `employeeRow-${employee.id}`;

  const idCell = document.createElement('td');
  idCell.textContent = employee.id;

  const nameCell = document.createElement('td');
  nameCell.textContent = employee.name;

  const departmentCell = document.createElement('td');
  departmentCell.textContent = employee.department;

  const roleCell = document.createElement('td');
  roleCell.textContent = employee.role;

  const statusCell = document.createElement('td');
  statusCell.textContent = employee.status;

  const actionsCell = document.createElement('td');

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.id = `editBtn-${employee.id}`;
  editButton.textContent = 'Edit';
  editButton.addEventListener('click', () => handleEditEmployee(employee.id));

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.id = `deleteBtn-${employee.id}`;
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', () => handleDeleteEmployee(employee.id));

  actionsCell.appendChild(editButton);
  actionsCell.appendChild(deleteButton);

  row.appendChild(idCell);
  row.appendChild(nameCell);
  row.appendChild(departmentCell);
  row.appendChild(roleCell);
  row.appendChild(statusCell);
  row.appendChild(actionsCell);

  return row;
};

// Populate the recent employees table with the latest records.
const loadRecentEmployees = (employees) => {
  const tableBody = document.getElementById('employeeTableBody');

  if (!tableBody) {
    return;
  }

  // Clear any existing rows before rendering
  tableBody.innerHTML = '';

  if (employees.length === 0) {
    const emptyRow = document.createElement('tr');
    const emptyCell = document.createElement('td');
    emptyCell.colSpan = 6;
    emptyCell.textContent = 'No Employees Available';
    emptyRow.appendChild(emptyCell);
    tableBody.appendChild(emptyRow);
    return;
  }

  // Show the most recently added employees first
  const recentEmployees = employees.slice(-RECENT_EMPLOYEES_LIMIT).reverse();

  recentEmployees.forEach((employee) => {
    tableBody.appendChild(createEmployeeRow(employee));
  });
};

/* ---------------------------------------------------------
   7. Row action handlers
   --------------------------------------------------------- */

// Navigate to the employee management page to edit a specific employee.
const handleEditEmployee = (employeeId) => {
  window.location.href = `employees.html?action=edit&id=${employeeId}`;
};

// Remove an employee from LocalStorage and refresh the dashboard.
const handleDeleteEmployee = (employeeId) => {
  const employees = getEmployees();
  const updatedEmployees = employees.filter((employee) => employee.id !== employeeId);

  localStorage.setItem('employees', JSON.stringify(updatedEmployees));
  loadDashboard();
};

/* ---------------------------------------------------------
   8. Navigation helpers
   --------------------------------------------------------- */

// Navigate to the employees page (used by Add and View buttons).
const navigateToEmployees = () => {
  window.location.href = 'employees.html';
};

// Clear the session and return to the login page.
const logout = () => {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('loggedInUser');
  window.location.href = 'index.html';
};

/* ---------------------------------------------------------
   9. Dashboard initialization
   --------------------------------------------------------- */

// Load all dashboard data: welcome message, summary cards, and table.
const loadDashboard = () => {
  displayWelcomeMessage();

  const employees = getEmployees();
  updateCards(employees);
  loadRecentEmployees(employees);
};

// Wire up button click handlers.
const attachEventListeners = () => {
  const addEmployeeBtn = document.getElementById('addEmployeeBtn');
  const viewEmployeesBtn = document.getElementById('viewEmployeesBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  if (addEmployeeBtn) addEmployeeBtn.addEventListener('click', navigateToEmployees);
  if (viewEmployeesBtn) viewEmployeesBtn.addEventListener('click', navigateToEmployees);
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
};

/* ---------------------------------------------------------
   10. Entry point
   --------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  const isAuthenticated = checkLogin();

  if (!isAuthenticated) {
    return; // Redirect to index.html already triggered
  }

  loadDashboard();
  attachEventListeners();
});