'use strict';

/* =========================================================
   Hospital Employee Management System (HEMS)
   Authentication Script (auth.js)
   ========================================================= */

/* ---------------------------------------------------------
   1. Constants
   --------------------------------------------------------- */
const VALID_USERNAME = 'admin';
const VALID_PASSWORD = 'admin123';

const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 30000; // 30 seconds

/* ---------------------------------------------------------
   2. State
   --------------------------------------------------------- */
let failedAttempts = 0;
let lockoutTimerId = null;

/* ---------------------------------------------------------
   3. Bootstrap once the DOM is fully loaded
   --------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  // Cache element references
  const loginForm = document.getElementById('loginForm');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const loginBtn = document.getElementById('loginBtn');
  const errorMessage = document.getElementById('errorMessage');
  const errorMessageContainer = document.getElementById('errorMessageContainer');

  /* -------------------------------------------------------
     4. Error message helpers
     ------------------------------------------------------- */

  // Display an error message to the user
  const showError = (message) => {
    errorMessage.textContent = message;
    errorMessageContainer.hidden = false;
  };

  // Clear and hide the error message
  const hideError = () => {
    errorMessage.textContent = '';
    errorMessageContainer.hidden = true;
  };

  /* -------------------------------------------------------
     5. Credential validation
     ------------------------------------------------------- */

  // Compare the supplied credentials against the valid account.
  // Returns a status string describing the result.
  const validateCredentials = (username, password) => {
    if (username !== VALID_USERNAME) {
      return 'INVALID_USERNAME';
    }
    if (password !== VALID_PASSWORD) {
      return 'INVALID_PASSWORD';
    }
    return 'SUCCESS';
  };

  /* -------------------------------------------------------
     6. Login button state helpers
     ------------------------------------------------------- */

  // Disable the login button (used during lockout)
  const disableLogin = () => {
    loginBtn.disabled = true;
  };

  // Re-enable the login button and reset the attempt counter
  const enableLogin = () => {
    loginBtn.disabled = false;
    failedAttempts = 0;
  };

  /* -------------------------------------------------------
     7. Failed attempt / lockout handling
     ------------------------------------------------------- */

  // Temporarily lock out the login form after too many failed attempts
  const startLockout = () => {
    disableLogin();
    showError('Too many failed login attempts. Please try again in 30 seconds.');

    lockoutTimerId = setTimeout(() => {
      enableLogin();
      hideError();
      lockoutTimerId = null;
    }, LOCKOUT_DURATION_MS);
  };

  // Increment the failed attempt count and trigger lockout if the
  // maximum number of attempts has been reached
  const registerFailedAttempt = () => {
    failedAttempts += 1;

    if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
      startLockout();
    }
  };

  /* -------------------------------------------------------
     8. Form submit handler
     ------------------------------------------------------- */
  const handleLoginSubmit = (event) => {
    // Prevent the default form submission (page refresh)
    event.preventDefault();

    // Ignore submissions while the account is locked out
    if (loginBtn.disabled) {
      return;
    }

    // Trim whitespace from the username; the password is used as-is
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    // Required field validation
    if (!username || !password) {
      showError('Username and Password are required.');
      return;
    }

    // Validate against the known credentials
    const result = validateCredentials(username, password);

    if (result === 'INVALID_USERNAME') {
      showError('Invalid Username.');
      registerFailedAttempt();
      return;
    }

    if (result === 'INVALID_PASSWORD') {
      showError('Invalid Password.');
      registerFailedAttempt();
      return;
    }

    // Successful login: clear errors, persist session, and redirect
    hideError();
    failedAttempts = 0;

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('loggedInUser', VALID_USERNAME);

    window.location.href = 'dashboard.html';
  };

  /* -------------------------------------------------------
     9. Event listeners
     ------------------------------------------------------- */
  loginForm.addEventListener('submit', handleLoginSubmit);
});