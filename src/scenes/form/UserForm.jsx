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

const API_URL = import.meta.env.VITE_API_URL;

const initialValues = {
  user_name: "",
  email: "",
  password: "",
  role_id: "",
};

const userSchema = yup.object().shape({
  user_name: yup.string().required("Tên người dùng là bắt buộc"),
  email: yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
  password: yup
    .string()
    .required("Mật khẩu là bắt buộc")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  role_id: yup.number().required("Vai trò là bắt buộc"),
});

const UserForm = () => {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/roles`);
        setRoles(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách vai trò:", error);
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
        toast.success("Tạo người dùng thành công");
        actions.resetForm();
      }
    } catch (error) {
      console.error("Lỗi:", error.response);
      if (error.response && error.response.data) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Có lỗi xảy ra khi tạo người dùng");
      }
    }
  };

  return (
    <Box m="20px">
      <Header title="TẠO NGƯỜI DÙNG" subtitle="Tạo một người dùng mới" />
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
                label="Tên người dùng"
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
                label="Mật khẩu"
                type="password"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.password}
                name="password"
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
              />
              <FormControl fullWidth>
                <InputLabel id="role-select-label">Vai trò</InputLabel>
                <Select
                  labelId="role-select-label"
                  id="role_id"
                  value={values.role_id}
                  label="Vai trò"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="role_id"
                  error={touched.role_id && Boolean(errors.role_id)}
                >
                  {roles
                    .filter((role) => role.role_name !== "Admin")
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
                Tạo người dùng mới
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default UserForm;
