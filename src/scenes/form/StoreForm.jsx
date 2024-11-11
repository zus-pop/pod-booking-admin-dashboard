import {
  Box,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
} from "@mui/material";
import React from "react";
import { Header } from "../../components";
import { FieldArray, Formik } from "formik";
import * as yup from "yup";
import { useState } from "react";
import { CloudUpload } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL;
const phoneRegExp = /^0\d{9,10}$/;

const notify = () => toast.success("Create a store successfully!");
const failnotify = () => toast.error("Fail to create! Please try again later");
const initialValues = {
  store_name: "",
  address: "",
  district: "",
  image: null,
  hotline: "",
};

const districts = [
  "District 1",
  "District 2",
  "District 3",
  "District 4",
  "District 5",
  "District 6",
  "District 7",
  "District 8",
  "District 9",
  "District 10",
  "District 11",
  "District 12",
  "Binh Thanh",
  "Binh Tan",
  "Phu Nhuan",
  "Tan Binh",
  "Tan Phu",
  "Go Vap",
  "Can Gio",
  "Cu Chi",
  "Binh Chanh",
  "Hoc Mon",
  "Nha Be",
];

const checkoutSchema = yup.object().shape({
  store_name: yup.string() .matches(/^[a-zA-Z0-9_ ]*$/, "Store Name cannot contain special characters")
  .required("Store name is required"),
  address: yup.string().required("Address is required"),
  district: yup.string().required("District is required"),
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
    const fullAddress = `${values.address}, ${values.district}, Ho Chi Minh City`;
    
    formData.append("store_name", values.store_name);
    formData.append("address", fullAddress);
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
               <Typography>
                Choose address for new store in <Box component="span" sx={{ fontWeight: 'bold'  }}>Ho Chi Minh City</Box>
              </Typography>
              
              <FormControl fullWidth variant="filled" error={touched.district && Boolean(errors.district)}>
                <InputLabel>District Of New Store</InputLabel>
                <Select
                  value={values.district}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="district"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200, // Set maximum height for scrollable area
                        width: 250,
                      },
                    },
                  }}
                >
                  {districts.map((district) => (
                    <MenuItem key={district} value={district}>
                      {district}
                    </MenuItem>
                  ))}
                </Select>
                {touched.district && errors.district && (
                  <div style={{ color: "red", marginTop: "8px" }}>{errors.district}</div>
                )}
              </FormControl>
              <TextField
                fullWidth
                multiline
                variant="filled"
                label="Street Address Of New Store"
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
                  Upload Image For Store
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
              </Button>
            
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};
export default StoreForm;
