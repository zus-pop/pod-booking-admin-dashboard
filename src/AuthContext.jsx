import { createContext, useContext, useEffect } from 'react';
import { handleSessionExpired } from './utils/auth';
import { toast } from "react-toastify";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.exp * 1000 < Date.now()) {
            handleSessionExpired();
          }
        } catch (error) {
          console.error('Error token:', error);
          toast.error('Error Authentication Process. Please login again ');
          handleSessionExpired();
        }
      }
    };

    checkToken();
    
    const interval = setInterval(checkToken, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};