import React, { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const notify = () => toast.warning("Session Expired! Please login again");
const API_URL = import.meta.env.VITE_API_URL
const loginSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Required'),
  password: yup.string().required('Required'),
});

const Container = styled(Box)({
  display: 'flex',
  flexDirection: 'row',
  height: '100vh',
});

const LeftPanel = styled(Box)({
  flex: 1,
  background: 'linear-gradient(to right, #000, #4cceac)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#fff',
});

const RightPanel = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#fff',
});

const Login = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const handleLogin = async (values, actions) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.message);
        actions.setSubmitting(false);
        return;
      }

      const data = await response.json();
      const profileResponse = await fetch(`${API_URL}/api/v1/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${data.token}`,
          'Content-Type': 'application/json',
        },
      });
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData.role.role_name === "Admin" || profileData.role.role_name === "Staff" || profileData.role.role_name === "Manager") {
          console.log('Login successful:', data);
          localStorage.setItem("token", data.token);
          navigate('/web');
        } else {
          setErrorMessage('You need permission to log in this website');
        }
      } else if (profileResponse.status === 401) {
        console.error("Unauthorized access. Redirecting to login.");
        localStorage.removeItem("token");
        navigate("/", { replace: true });
      } else if (profileResponse.status === 403) {
        console.error("Token expired. Please login again.");
        notify();
        localStorage.removeItem("token");
        navigate("/", { replace: true });
      } else {
        console.error('Failed to fetch user profile');
        setErrorMessage('Failed to fetch user profile');
        localStorage.removeItem("token");
        return;
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      actions.setSubmitting(false);
    }
  };
  
  return (
    <Container>
        <ToastContainer
                  position="top-center"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="light"
                />
      <LeftPanel> 
        <Typography variant="h4">We Are The POD Admin Team</Typography>
        <Typography variant="h6" sx={{padding: "20px", textAlign: "justify"}}>
        This website is a management platform designed for the POD admin team. It offers a secure login system, allowing only authorized users such as Admins, Staff, or Managers to access the management features. The interface is user-friendly, providing easy navigation and access to essential information. Notifications are integrated to alert users about important events, like session expiration, ensuring a secure and efficient management experience.
        </Typography>
      </LeftPanel>
    <RightPanel>
      <Typography variant="h4" align="center" sx={{mb : 3, fontWeight: 'bold'}}> Login </Typography>
      {errorMessage && <Typography color="error">{errorMessage}</Typography>}
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={loginSchema}
        onSubmit={handleLogin}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          isSubmitting,
        }) => (
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              variant="outlined"
              label="Email"
              name="email"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.email}
              error={touched.email && Boolean(errors.email)}
              helperText={touched.email && errors.email}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              variant="outlined"
              label="Password"
              name="password"
              type="password"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.password}
              error={touched.password && Boolean(errors.password)}
              helperText={touched.password && errors.password}
              sx={{ mb: 2 }}
            />
            <Button
              fullWidth
              variant="contained"
              sx={{backgroundColor: ' #4cceac ',
                '&:hover': {
                  backgroundColor: '#3da58a', 
                },
              }}
              type="submit"
              disabled={isSubmitting}
            >
              Login
            </Button>
          </form>
        )}
      </Formik>
      </RightPanel>
       </Container>
  );
};

export default Login;