import React from "react";
import { Modal, Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { Formik, Form } from "formik";
import * as yup from "yup";
import { useState } from "react";
import { CloudUpload } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

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
  
  const validationSchema = yup.object({
    product_name: yup.string().required("Tên sản phẩm là bắt buộc"),
    description: yup.string().required("Mô tả là bắt buộc"),
    price: yup.number().required("Giá là bắt buộc"),
    stock: yup.number().required("Số lượng là bắt buộc"),
    category_id: yup.number().required("Danh mục là bắt buộc"),
    image: yup.mixed().nullable(),
  });

  return (
    <Modal open={open} onClose={handleClose}>
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
          Cập nhật sản phẩm
        </Typography>
        <Formik
          initialValues={{
            product_name: product?.product_name || "",
            description: product?.description || "",
            price: product?.price || "",
            stock: product?.stock || "",
            category_id: product?.category_id || "",
            image: null,
          }}
          validationSchema={validationSchema}
          onSubmit={(values, { setSubmitting }) => {
            const formData = new FormData();
            formData.append("product_name", values.product_name);
            formData.append("description", values.description);
            formData.append("price", values.price);
            formData.append("stock", values.stock);
            formData.append("category_id", values.category_id);
            if (values.image) {
              formData.append("image", values.image);
            }
            onSubmit(formData, setSubmitting);
          }}
        >
          {({ errors, touched, values, handleChange, handleBlur, setFieldValue }) => (
            <Form>
              <TextField
                fullWidth
                margin="normal"
                name="product_name"
                label="Tên sản phẩm"
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
                label="Mô tả"
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
                label="Giá"
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
                label="Số lượng"
                type="number"
                value={values.stock}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.stock && Boolean(errors.stock)}
                helperText={touched.stock && errors.stock}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Danh mục</InputLabel>
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
              <Box mt={2}>
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<CloudUpload />}
                >
                  Upload Image
                  <VisuallyHiddenInput
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
                <Box mt={2}>
                  <img
                    src={filePreview}
                    alt="Preview"
                    style={{ maxWidth: "200px" }}
                  />
                </Box>
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
              >
                Cập nhật
              </Button>
            </Form>
          )}
        </Formik>
      </Box>
    </Modal>
  );
};

export default UpdateProduct;