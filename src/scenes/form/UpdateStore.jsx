import React from "react";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";
import { Formik, Form } from "formik";
import * as yup from "yup";
import { useState, useRef } from "react";
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
const UpdateStore = ({ open, handleClose, store, onSubmit }) => {
  const [filePreview, setFilePreview] = useState(store?.image || null);
  const fileInputRef = useRef(null);
  const phoneRegExp = /^0\d{9,10}$/;
  const validationSchema = yup.object({
    store_name: yup.string().matches(/^[a-zA-Z0-9_ ]*$/, "POD Name không được chứa ký tự đặc biệt").required("Store name is required"),
    address: yup.string().required("Address is required"),
    hotline: yup.string().required().matches(phoneRegExp, "Phone number is not valid"),
    image: yup.mixed().nullable(),
  });
  const handleModalClose = () => {
    setFilePreview(store?.image || null);
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
          Update Store
        </Typography>
        <Formik
          initialValues={{
            store_name: store?.store_name || "",
            address: store?.address || "",
            hotline: store?.hotline || "",
            image: null,
          }}
          validationSchema={validationSchema}
          onSubmit={(values, { setSubmitting }) => {
            const formData = new FormData();
            formData.append("store_name", values.store_name);
            formData.append("address", values.address);
            formData.append("hotline", values.hotline);
            if (values.image) {
              formData.append("image", values.image);
            }
            onSubmit(formData, setSubmitting);
          }}
        >
          {({ errors, touched, values, handleChange, handleBlur }) => (
            <Form>
              <TextField
                fullWidth
                margin="normal"
                name="store_name"
                label="Store Name"
                value={values.store_name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.store_name && Boolean(errors.store_name)}
                helperText={touched.store_name && errors.store_name}
              />
              <TextField
                fullWidth
                margin="normal"
                name="address"
                label="Address"
                value={values.address}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.address && Boolean(errors.address)}
                helperText={touched.address && errors.address}
              />
              <TextField
                fullWidth
                margin="normal"
                name="hotline"
                label="Phone Number"
                value={values.hotline}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.hotline && Boolean(errors.hotline)}
                helperText={touched.hotline && errors.hotline}
              />
              <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<CloudUpload />}
                  sx={{ p: 2, width: "100%" }}
                >
                  Upload Image
                  <VisuallyHiddenInput
                    type="file"
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
              </Box>
              {touched.image && errors.image && <div>{errors.image}</div>}
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
export default UpdateStore;
