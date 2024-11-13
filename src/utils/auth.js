import { toast } from "react-toastify";

let isHandlingSession = false;
let navigationCallback = null;

export const registerNavigationCallback = (callback) => {
  navigationCallback = callback;
};

export const handleSessionExpired = () => {
  if (isHandlingSession) {
    return;
  }

  isHandlingSession = true;
  localStorage.setItem('lastPath', window.location.pathname);
  localStorage.setItem('lastEmail', localStorage.getItem('userEmail'));
  toast.warning("Session expired! Please login again.", { autoClose: 3000 });

  setTimeout(() => {
    localStorage.removeItem("token");
    if (navigationCallback) {
      navigationCallback("/");
    } else {
      window.location.href = "/";
    }
    isHandlingSession = false;
  }, 3000);
}; 
