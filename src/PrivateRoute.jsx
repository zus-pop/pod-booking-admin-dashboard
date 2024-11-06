import { Navigate } from 'react-router-dom';
import { useRole } from './RoleContext';


const PrivateRoute = ({ children }) => {
  const { userRole } = useRole();
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (userRole !== "Admin") {
    return <Navigate to="/web/unauthorized" replace />;
  }

  return children;
};

export default PrivateRoute;