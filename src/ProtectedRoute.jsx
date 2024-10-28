
import { Navigate } from 'react-router-dom';
import { useRole } from './RoleContext';


const ProtectedRoute = ({ children }) => {
  const { userRole } = useRole();

  if (userRole !== "Admin" || userRole !== "Manager"  ) {
    return <Navigate to="/web/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;