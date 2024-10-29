import {
  Box,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { Header } from "../../components";
import { Formik } from "formik";
import * as yup from "yup";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRole } from "../../RoleContext";
const API_URL = import.meta.env.VITE_API_URL;

const initialValues = {
  user_name: "",
  email: "",
  password: "",
  role_id: "",
};

const userSchema = yup.object().shape({
  user_name: yup
  .string()
  .matches(/^[a-zA-Z0-9_ ]*$/, "Username không được chứa ký tự đặc biệt")
  .required("Username is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  role_id: yup.number().required("Role is required"),
});

const UserForm = () => {
  const { userRole } = useRole();
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/roles`);
        setRoles(response.data);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchRoles();
  }, []);

  const handleFormSubmit = async (values, actions) => {
    try {

      const response = await axios.post(
        `${API_URL}/api/v1/auth/register`,
        values
      );
      if (response.status === 201) {
        toast.success("User created successfully");
        actions.resetForm();
      }
    } catch (error) {
      console.error("Error:", error.response);
      if (error.response && error.response.data) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An error occurred while creating user");
      }
    }
  };

  return (
    <Box m="20px">
      <Header title="CREATE USER" subtitle="Create a new user" />
      <ToastContainer />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={userSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box display="flex" flexDirection="column" gap="30px">
              <TextField
                fullWidth
                variant="filled"
                label="Username"
         
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.user_name}
                name="user_name"
                error={touched.user_name && Boolean(errors.user_name)}
                helperText={touched.user_name && errors.user_name}
              />
              <TextField
                fullWidth
                variant="filled"
                label="Email"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
              />
              <TextField
                fullWidth
                variant="filled"
                label="Password"
                type="password"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.password}
                name="password"
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
              />
              <FormControl fullWidth>
                <InputLabel id="role-select-label">Role</InputLabel>
                <Select
                  labelId="role-select-label"
                  id="role_id"
                  value={values.role_id}
                  label="Role"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="role_id"
                  error={touched.role_id && Boolean(errors.role_id)}
                >
                  {roles
                    .filter((role) => {
                      if (userRole === "Admin") {
                        return (
                          role.role_name === "Manager" ||
                          role.role_name === "Staff"
                        );
                      } else if (userRole === "Manager") {
                        return role.role_name === "Staff";
                      }
                      return false;
                    })
                    .map((role) => (
                      <MenuItem key={role.role_id} value={role.role_id}>
                        {role.role_name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>
            <Box display="flex" justifyContent="center" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Create New User
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default UserForm;
