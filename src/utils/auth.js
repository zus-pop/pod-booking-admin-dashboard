import { toast } from "react-toastify";

let isHandlingSession = false;

export const handleSessionExpired = () => {
  // Nếu đang xử lý session expired rồi thì không làm gì cả
  if (isHandlingSession) {
    return;
  }

  // Đánh dấu đang xử lý
  isHandlingSession = true;

  // Lưu thông tin hiện tại
  localStorage.setItem('lastPath', window.location.pathname);
  localStorage.setItem('lastEmail', localStorage.getItem('userEmail'));

  // Hiển thị thông báo
  toast.warning("Session expired! Please login again.");

  // Xóa token và chuyển hướng sau 3 giây
  setTimeout(() => {
    localStorage.removeItem("token");
    window.location.href = "/";
    // Reset flag sau khi đã xử lý xong
    isHandlingSession = false;
  }, 3000);
}; 