import React, { useEffect, useRef } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Formik, Form } from "formik";
import * as yup from "yup";
import { useState } from "react";
import { CloudUpload } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
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

const UpdateProduct = ({ open, handleClose, product, onSubmit }) => {
  const [filePreview, setFilePreview] = useState(product?.image || null);
  const [stores, setStores] = useState([]);
  const fileInputRef = useRef(null);
  const validationSchema = yup.object({
    product_name: yup
      .string()
      .matches(/^[a-zA-Z0-9_ ]*$/, "POD Name cannot contain special characters")
      .required("Product name is required"),
    description: yup.string().required("Description is required"),
    price: yup.number().required("Price is required"),
    stock: yup.number().required("Stock is required"),
    store_id: yup.number().required("Store is required"),
    category_id: yup.number().required("Category is required"),
    image: yup.mixed().nullable(),
  });
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const totalResponse = await axios.get(`${API_URL}/api/v1/stores`);
        if (totalResponse.status === 200) {
          const total = totalResponse.data.total;
          const response = await axios.get(
            `${API_URL}/api/v1/stores?limit=${total}`
          );
          setStores(response.data.stores);
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    };

    fetchStores();
  }, []);

  // Reset form khi đóng modal
  const handleModalClose = () => {
    setFilePreview(product?.image || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleModalClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          Update Product
        </Typography>
        <Formik
          initialValues={{
            product_name: product?.product_name || "",
            description: product?.description || "",
            price: product?.price || "",
            stock: product?.stock || "",
            category_id: product?.category_id || "",
            store_id: product?.store_id || "",
            image: null,
          }}
          validationSchema={validationSchema}
          onSubmit={(values, { setSubmitting }) => {
            const formData = new FormData();
            formData.append("product_name", values.product_name);
            formData.append("description", values.description);
            formData.append("price", values.price);
            formData.append("stock", values.stock);
            formData.append("store_id", values.store_id);
            formData.append("category_id", values.category_id);
            if (values.image) {
              formData.append("image", values.image);
            }
            onSubmit(formData, setSubmitting);
          }}
        >
          {({
            errors,
            touched,
            values,
            handleChange,
            handleBlur,
            setFieldValue,
          }) => (
            <Form>
              <TextField
                fullWidth
                margin="normal"
                name="product_name"
                label="Product Name"
                value={values.product_name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.product_name && Boolean(errors.product_name)}
                helperText={touched.product_name && errors.product_name}
              />
              <TextField
                fullWidth
                margin="normal"
                name="description"
                label="Description"
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.description && Boolean(errors.description)}
                helperText={touched.description && errors.description}
              />
              <TextField
                fullWidth
                margin="normal"
                name="price"
                label="Price"
                type="number"
                value={values.price}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.price && Boolean(errors.price)}
                helperText={touched.price && errors.price}
              />
              <TextField
                fullWidth
                margin="normal"
                name="stock"
                label="Stock"
                type="number"
                value={values.stock}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.stock && Boolean(errors.stock)}
                helperText={touched.stock && errors.stock}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  name="category_id"
                  value={values.category_id}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.category_id && Boolean(errors.category_id)}
                >
                  <MenuItem value={1}>Food</MenuItem>
                  <MenuItem value={2}>Drink</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Store</InputLabel>
                <Select
                  name="store_id"
                  value={values.store_id}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.store_id && Boolean(errors.store_id)}
                >
                  {stores.map((store) => (
                    <MenuItem key={store.store_id} value={store.store_id}>
                      {store.store_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box mt={2}>
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<CloudUpload />}
                >
                  Upload Image
                  <VisuallyHiddenInput
                    ref={fileInputRef}
                    type="file"
                    onChange={(event) => {
                      const file = event.target.files[0];
                      setFieldValue("image", file);
                      setFilePreview(URL.createObjectURL(file));
                    }}
                  />
                </Button>
              </Box>
              {filePreview && (
                <Box mt={2} position="relative">
                  <Box
                    sx={{
                      width: "100%",
                      height: 200,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      overflow: "hidden",
                      borderRadius: 2,
                      border: "1px solid #ccc",
                    }}
                  >
                    <img
                      src={filePreview}
                      alt="image preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => {
                      setFilePreview(null);
                      setFieldValue("image", null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                    }}
                  >
                    Remove
                  </Button>
                </Box>
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
              >
                Update
              </Button>
            </Form>
          )}
        </Formik>
      </Box>
    </Modal>
  );
};

export default UpdateProduct;
