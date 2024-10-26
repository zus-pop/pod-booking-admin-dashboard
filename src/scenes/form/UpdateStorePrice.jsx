import React from 'react';
import { Modal, Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem, Checkbox, FormGroup, FormControlLabel } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const UpdateStorePrice = ({ open, handleClose, initialValues, onSubmit }) => {
  const validationSchema = Yup.object({
    price: Yup.number().required("Giá là bắt buộc"),
    start_hour: Yup.number().required("Giờ bắt đầu là bắt buộc").min(0).max(23),
    end_hour: Yup.number().required("Giờ kết thúc là bắt buộc").min(0).max(23),
    days_of_week: Yup.array()
      .min(1, "Chọn ít nhất một ngày")
      .required("Ngày trong tuần là bắt buộc"),
    type_id: Yup.number().required("ID loại pod là bắt buộc"),
    store_id: Yup.number().required("ID cửa hàng là bắt buộc"),
    priority: Yup.number()
      .required("Độ ưu tiên là bắt buộc")
      .min(0, "Độ ưu tiên phải là số không âm"),
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
      }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Cập nhật giá cửa hàng
        </Typography>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ errors, touched, values, setFieldValue }) => (
            <Form>
              <TextField
                fullWidth
                name="price"
                label="Giá"
                type="number"
                margin="normal"
                error={touched.price && Boolean(errors.price)}
                helperText={touched.price && errors.price}
              />
              <TextField
                fullWidth
                name="start_hour"
                label="Giờ bắt đầu"
                type="number"
                margin="normal"
                error={touched.start_hour && Boolean(errors.start_hour)}
                helperText={touched.start_hour && errors.start_hour}
              />
              <TextField
                fullWidth
                name="end_hour"
                label="Giờ kết thúc"
                type="number"
                margin="normal"
                error={touched.end_hour && Boolean(errors.end_hour)}
                helperText={touched.end_hour && errors.end_hour}
              />
              <FormGroup>
                <InputLabel>Chọn ngày trong tuần</InputLabel>
                {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                  <FormControlLabel
                    key={day}
                    control={
                      <Field
                        as={Checkbox}
                        name="days_of_week"
                        value={day}
                        checked={values.days_of_week.includes(day)}
                      />
                    }
                    label={day}
                  />
                ))}
              </FormGroup>
              <TextField
                fullWidth
                name="type_id"
                label="ID Loại Pod"
                type="number"
                margin="normal"
                error={touched.type_id && Boolean(errors.type_id)}
                helperText={touched.type_id && errors.type_id}
              />
              <TextField
                fullWidth
                name="store_id"
                label="ID Cửa hàng"
                type="number"
                margin="normal"
                error={touched.store_id && Boolean(errors.store_id)}
                helperText={touched.store_id && errors.store_id}
              />
              <TextField
                fullWidth
                name="priority"
                label="Độ ưu tiên"
                type="number"
                margin="normal"
                error={touched.priority && Boolean(errors.priority)}
                helperText={touched.priority && errors.priority}
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

export default UpdateStorePrice;