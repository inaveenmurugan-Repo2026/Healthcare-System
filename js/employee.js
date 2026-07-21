'use strict';

/* =========================================================
   Hospital Employee Management System (HEMS)
   Employee Management Script (employee.js)
   ========================================================= */

/* ---------------------------------------------------------
   1. Constants
   --------------------------------------------------------- */
const REQUIRED_FIELD_IDS = [
  'employeeId',
  'employeeName',
  'department',
  'role',
  'email',
  'phone',
  'status',
];

/* ---------------------------------------------------------
   2. State
   --------------------------------------------------------- */
// Tracks the employee currently loaded into the form via a row click.
let selectedEmployeeId = null;

/* ---------------------------------------------------------
   3. Authentication guard
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
   4. Data access helpers
   --------------------------------------------------------- */

// Read the employee list from LocalStorage.
// Initializes the key with an empty array if it does not exist yet.
const loadEmployees = () => {
  const storedEmployees = localStorage.getItem('employees');

  if (storedEmployees === null) {
    localStorage.setItem('employees', JSON.stringify([]));
    return [];
  }

  try {
    const parsedEmployees = JSON.parse(storedEmployees);
    return Array.isArray(parsedEmployees) ? parsedEmployees : [];
  } catch (error) {
    return [];
  }
};

// Persist the employee list to LocalStorage.
const saveEmployees = (employees) => {
  localStorage.setItem('employees', JSON.stringify(employees));
};

// Check whether an Employee ID is already in use.
// excludeId lets an update operation ignore the record being edited.
const isDuplicateEmployeeId = (id, excludeId = null) => {
  const employees = loadEmployees();
  return employees.some((employee) => employee.id === id && employee.id !== excludeId);
};

/* ---------------------------------------------------------
   5. Form helpers
   --------------------------------------------------------- */

// Mark the tracked fields as required so the browser's native
// validation (reportValidity) can be used instead of alert().
const setRequiredFields = () => {
  REQUIRED_FIELD_IDS.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.required = true;
    }
  });
};

// Read and trim the current values out of the employee form.
const getFormValues = () => ({
  id: document.getElementById('employeeId').value.trim(),
  name: document.getElementById('employeeName').value.trim(),
  department: document.getElementById('department').value,
  role: document.getElementById('role').value,
  email: document.getElementById('email').value.trim(),
  phone: document.getElementById('phone').value.trim(),
  status: document.getElementById('status').value,
});

// Populate the form fields with a specific employee's data.
const setFormValues = (employee) => {
  document.getElementById('employeeId').value = employee.id;
  document.getElementById('employeeName').value = employee.name;
  document.getElementById('department').value = employee.department;
  document.getElementById('role').value = employee.role;
  document.getElementById('email').value = employee.email;
  document.getElementById('phone').value = employee.phone;
  document.getElementById('status').value = employee.status;
};

// Reset the form to its empty state and clear the current selection.
const clearForm = () => {
  const employeeForm = document.getElementById('employeeForm');
  const employeeIdField = document.getElementById('employeeId');

  if (employeeForm) {
    employeeForm.reset();
  }

  if (employeeIdField) {
    employeeIdField.setCustomValidity('');
  }

  selectedEmployeeId = null;
};

// Validate the form using the browser's built-in constraint validation.
// mode is either 'add' or 'update' and controls the duplicate-ID check.
const validateEmployeeForm = (values, mode) => {
  const employeeForm = document.getElementById('employeeForm');
  const employeeIdField = document.getElementById('employeeId');

  // Clear any previously set custom validity message
  employeeIdField.setCustomValidity('');

  // Required-field validation (uses the browser's native UI, not alert())
  if (!employeeForm.reportValidity()) {
    return false;
  }

  // Prevent duplicate Employee IDs (ignore the record being updated)
  const excludeId = mode === 'update' ? selectedEmployeeId : null;

  if (isDuplicateEmployeeId(values.id, excludeId)) {
    employeeIdField.setCustomValidity('Employee ID already exists.');
    employeeIdField.reportValidity();
    return false;
  }

  return true;
};

/* ---------------------------------------------------------
   6. Table rendering
   --------------------------------------------------------- */

// Build a single table row for one employee record.
const createEmployeeRow = (employee) => {
  const row = document.createElement('tr');
  row.id = `employeeRow-${employee.id}`;

  // Clicking anywhere on the row loads that employee into the form
  row.addEventListener('click', () => handleRowClick(employee));

  const idCell = document.createElement('td');
  idCell.textContent = employee.id;

  const nameCell = document.createElement('td');
  nameCell.textContent = employee.name;

  const departmentCell = document.createElement('td');
  departmentCell.textContent = employee.department;

  const roleCell = document.createElement('td');
  roleCell.textContent = employee.role;

  const emailCell = document.createElement('td');
  emailCell.textContent = employee.email;

  const phoneCell = document.createElement('td');
  phoneCell.textContent = employee.phone;

  const statusCell = document.createElement('td');
  statusCell.textContent = employee.status;

  const actionsCell = document.createElement('td');
  actionsCell.textContent = 'Click row to edit';

  row.appendChild(idCell);
  row.appendChild(nameCell);
  row.appendChild(departmentCell);
  row.appendChild(roleCell);
  row.appendChild(emailCell);
  row.appendChild(phoneCell);
  row.appendChild(statusCell);
  row.appendChild(actionsCell);

  return row;
};

// Render the given list of employees into the table body.
const renderEmployees = (employees) => {
  const tableBody = document.getElementById('employeeTableBody');

  if (!tableBody) {
    return;
  }

  tableBody.innerHTML = '';

  if (employees.length === 0) {
    const emptyRow = document.createElement('tr');
    const emptyCell = document.createElement('td');
    emptyCell.colSpan = 8;
    emptyCell.textContent = 'No Employees Found';
    emptyRow.appendChild(emptyCell);
    tableBody.appendChild(emptyRow);
    return;
  }

  employees.forEach((employee) => {
    tableBody.appendChild(createEmployeeRow(employee));
  });
};

// Load the clicked employee's details into the form for editing.
const handleRowClick = (employee) => {
  selectedEmployeeId = employee.id;
  setFormValues(employee);
};

/* ---------------------------------------------------------
   7. CRUD operations
   --------------------------------------------------------- */

// Validate, then add a new employee record.
const addEmployee = () => {
  const values = getFormValues();

  if (!validateEmployeeForm(values, 'add')) {
    return;
  }

  const employees = loadEmployees();
  employees.push(values);
  saveEmployees(employees);

  renderEmployees(loadEmployees());
  clearForm();
};

// Validate, then update the currently selected employee record.
const updateEmployee = () => {
  if (!selectedEmployeeId) {
    return;
  }

  const values = getFormValues();

  if (!validateEmployeeForm(values, 'update')) {
    return;
  }

  const employees = loadEmployees();
  const employeeIndex = employees.findIndex((employee) => employee.id === selectedEmployeeId);

  if (employeeIndex === -1) {
    return;
  }

  employees[employeeIndex] = values;
  saveEmployees(employees);

  renderEmployees(loadEmployees());
  clearForm();
};

// Delete the currently selected employee record.
const deleteEmployee = () => {
  if (!selectedEmployeeId) {
    return;
  }

  const employees = loadEmployees();
  const updatedEmployees = employees.filter((employee) => employee.id !== selectedEmployeeId);

  saveEmployees(updatedEmployees);
  renderEmployees(updatedEmployees);
  clearForm();
};

/* ---------------------------------------------------------
   8. Search
   --------------------------------------------------------- */

// Return employees whose name matches the given search query.
const searchEmployees = (query) => {
  const employees = loadEmployees();
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return employees;
  }

  return employees.filter((employee) =>
    (employee.name || '').toLowerCase().includes(normalizedQuery)
  );
};

// Re-render the table as the user types in the search box.
const handleSearchInput = (event) => {
  renderEmployees(searchEmployees(event.target.value));
};

/* ---------------------------------------------------------
   9. Logout
   --------------------------------------------------------- */
const logout = () => {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('loggedInUser');
  window.location.href = 'index.html';
};

/* ---------------------------------------------------------
   10. Event wiring
   --------------------------------------------------------- */
const attachEventListeners = () => {
  const addEmployeeBtn = document.getElementById('addEmployeeBtn');
  const updateEmployeeBtn = document.getElementById('updateEmployeeBtn');
  const deleteEmployeeBtn = document.getElementById('deleteEmployeeBtn');
  const clearBtn = document.getElementById('clearBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const searchEmployeeInput = document.getElementById('searchEmployee');

  if (addEmployeeBtn) addEmployeeBtn.addEventListener('click', addEmployee);
  if (updateEmployeeBtn) updateEmployeeBtn.addEventListener('click', updateEmployee);
  if (deleteEmployeeBtn) deleteEmployeeBtn.addEventListener('click', deleteEmployee);
  if (clearBtn) clearBtn.addEventListener('click', clearForm);
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
  if (searchEmployeeInput) searchEmployeeInput.addEventListener('input', handleSearchInput);
};

/* ---------------------------------------------------------
   11. Entry point
   --------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  const isAuthenticated = checkLogin();

  if (!isAuthenticated) {
    return;
  }

  setRequiredFields();
  renderEmployees(loadEmployees());
  attachEventListeners();
});

// Intergrated DEV and QE Pipeline -1