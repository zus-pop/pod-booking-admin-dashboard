import React from "react";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";
import { Formik, Form } from "formik";
import * as yup from "yup";

const UpdateStore = ({ open, handleClose, store, onSubmit }) => {
  const validationSchema = yup.object({
    store_name: yup.string().required("Tên cửa hàng là bắt buộc"),
    address: yup.string().required("Địa chỉ là bắt buộc"),
    hotline: yup.string().required("Số điện thoại là bắt buộc"),
  });
  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          Cập nhật cửa hàng
        </Typography>
        <Formik
          initialValues={{
            store_name: store?.store_name || "",
            address: store?.address || "",
            hotline: store?.hotline || "",
          }}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ errors, touched, values, handleChange, handleBlur }) => (
            <Form>
              <TextField
                fullWidth
                margin="normal"
                name="store_name"
                label="Tên cửa hàng"
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
                label="Địa chỉ"
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
                label="Số điện thoại"
                value={values.hotline}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.hotline && Boolean(errors.hotline)}
                helperText={touched.hotline && errors.hotline}
              />
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
export default UpdateStore;
