import React from "react";
import { Modal, Box, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { Formik, Form } from "formik";
import * as yup from "yup";

const UpdatePOD = ({ open, handleClose, pod, onSubmit }) => {
  const validationSchema = yup.object({
    pod_name: yup.string().required("Tên POD là bắt buộc"),
    description: yup.string().required("Mô tả là bắt buộc"),
    image: yup.string().url("URL hình ảnh không hợp lệ"),
    type_id: yup.number().required("Loại POD là bắt buộc"),
    store_id: yup.number().required("Cửa hàng là bắt buộc"),
    
  });

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
      }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Cập nhật POD
        </Typography>
        <Formik
          initialValues={{
            pod_name: pod?.pod_name || "",
            description: pod?.description || "",
            image: pod?.image || "",
            type_id: pod?.type_id || "",
            store_id: pod?.store_id || "",
           
          }}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ errors, touched, values, handleChange, handleBlur }) => (
            <Form>
              <TextField
                fullWidth
                margin="normal"
                name="pod_name"
                label="Tên POD"
                value={values.pod_name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.pod_name && Boolean(errors.pod_name)}
                helperText={touched.pod_name && errors.pod_name}
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
                name="image"
                label="URL Hình ảnh"
                value={values.image}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.image && Boolean(errors.image)}
                helperText={touched.image && errors.image}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel id="type-select-label">Loại POD</InputLabel>
                <Select
                  labelId="type-select-label"
                  id="type_id"
                  value={values.type_id}
                  label="Loại POD"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="type_id"
                  error={touched.type_id && Boolean(errors.type_id)}
                >
                  <MenuItem value={1}>Single POD</MenuItem>
                  <MenuItem value={2}>Double POD</MenuItem>
                  <MenuItem value={3}>Meeting Room</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                margin="normal"
                name="store_id"
                label="ID Cửa hàng"
                type="number"
                value={values.store_id}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.store_id && Boolean(errors.store_id)}
                helperText={touched.store_id && errors.store_id}
              />
              
              <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                Cập nhật
              </Button>
            </Form>
          )}
        </Formik>
      </Box>
    </Modal>
  );
};

export default UpdatePOD;