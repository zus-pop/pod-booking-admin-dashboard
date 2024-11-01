import {
  Box,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import React from "react";
import { Header } from "../../components";
import { FieldArray, Formik } from "formik";
import * as yup from "yup";
import { useState } from "react";
import { CloudUpload } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL;
const phoneRegExp = /^0\d{9,10}$/;

const notify = () => toast.success("Create a store successfully!");
const failnotify = () => toast.error("Fail to create! Please try again later");
const initialValues = {
  store_name: "",
  address: "",
  image: null,
  hotline: "",
};

const checkoutSchema = yup.object().shape({
  store_name: yup.string() .matches(/^[a-zA-Z0-9_ ]*$/, "Store Name không được chứa ký tự đặc biệt").required("Store name is required"),
  address: yup.string().required("Address is required"),
  image: yup.mixed().required("Image is required"),
  hotline: yup
    .string()
    .required()
    .matches(phoneRegExp, "Phone number is not valid"),
});
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});
const StoreForm = () => {
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = React.useRef(null);
  const clearFilePreview = () => {
    setFilePreview(null);
  };
  const handleFormSubmit = async (values, actions) => {
    const formData = new FormData();
    formData.append("store_name", values.store_name);
    formData.append("address", values.address);
    formData.append("image", values.image);
    formData.append("hotline", values.hotline);
    formData.forEach((value, key) => {
      console.log(value);
      console.log(key);
    });
    try {
      const response = await fetch(`${API_URL}/api/v1/stores`, {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        console.log("Store created successfully");
        notify();
        actions.resetForm();
        clearFilePreview();
      } else {
        failnotify();
        console.error("Failed to create new store");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  return (
    <Box m="20px">
      <Header title="CREATE STORE" subtitle="Create a New Store"   showBackButton={true} />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={checkoutSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          setFieldValue,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
          
              display="flex" flexDirection="column" gap="30px"
            >
           
              <TextField
                fullWidth
                variant="filled"
                label="Store Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.store_name}
                name="store_name"
                error={touched.store_name && Boolean(errors.store_name)}
                helperText={touched.store_name && errors.store_name}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                multiline
                variant="filled"
                label="Address Of New Store"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.address}
                name="address"
                error={touched.address && Boolean(errors.address)}
                helperText={touched.address && errors.address}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                multiline
                variant="filled"
                label="Hotline"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.hotline}
                name="hotline"
                error={touched.hotline && Boolean(errors.hotline)}
                helperText={touched.hotline && errors.hotline}
                sx={{ gridColumn: "span 2" }}
              />
              <Box display="flex" justifyContent="space-around">
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<CloudUpload />}
                  sx={{ p: 2, width: "100%" }}
                >
                  Upload Image
                  <VisuallyHiddenInput
                    type="file"
                    hidden
                    onChange={(event) => {
                      const selectedFile = event.currentTarget.files[0];
                      setFilePreview(URL.createObjectURL(selectedFile));
                      setFieldValue("image", selectedFile);
                    }}
                    onBlur={handleBlur}
                    name="image"
                    accept="image/*"
                  />
                </Button>
                {filePreview && (
                  <img width={300} height={200} alt="image" src={filePreview} />
                )}
              </Box>
              {touched.image && errors.image && <div>{errors.image}</div>}
            </Box>

            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              mt="30px"
            >
              <Button type="submit" color="secondary" variant="contained">
                Create New Store
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
              </Button>
            
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};
export default StoreForm;
