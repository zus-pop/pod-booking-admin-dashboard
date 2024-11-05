import { Navigate } from 'react-router-dom';
import { useRole } from './RoleContext';


const ProtectedRoute = ({ children }) => {
  const { userRole } = useRole();
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (userRole !== "Admin" && userRole !== "Manager") {
    return <Navigate to="/web/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;