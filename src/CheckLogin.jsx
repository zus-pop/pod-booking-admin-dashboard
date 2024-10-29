
import { Navigate } from 'react-router-dom';
import { useRole } from './RoleContext';


const CheckLogin = ({ children }) => {
  const { userRole } = useRole();

  if (userRole == null  ) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default CheckLogin;