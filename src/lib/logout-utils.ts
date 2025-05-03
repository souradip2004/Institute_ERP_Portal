/**
 * Utility functions for handling logout functionality
 */
import Cookies from "js-cookie";

/**
 * Clears all localStorage items and cookies related to authentication
 * This should be used whenever a user logs out to ensure clean state
 * @param message Optional error message to display on login page
 */
export const clearAuthData = (message?: string) => {
  // Clear cookies
  document.cookie =
    "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie =
    "next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  Cookies.remove("next-auth.session-token");

  // Clear localStorage items
  localStorage.removeItem("authToken");
  localStorage.removeItem("auth_token");
  localStorage.removeItem("session");
  localStorage.removeItem("user");
  localStorage.removeItem("userId");
  localStorage.removeItem("teacherId");

  // Clear auth error unless setting a new one
  if (!message) {
    localStorage.removeItem("auth_error");
  } else {
    localStorage.setItem("auth_error", message);
  }

  // Clear note related data
  const noteKeys = Object.keys(localStorage).filter((key) =>
    key.startsWith("noteVideoData_")
  );
  noteKeys.forEach((key) => localStorage.removeItem(key));
};

/**
 * Force logout a user and redirect to login page
 * @param message Optional error message to display on login page
 * @param redirectDelay Optional delay in ms before redirecting
 */
export const forceLogout = (message?: string, redirectDelay: number = 0) => {
  clearAuthData(message);

  if (redirectDelay > 0) {
    setTimeout(() => {
      window.location.href = "/login";
    }, redirectDelay);
  } else {
    window.location.href = "/login";
  }
};
