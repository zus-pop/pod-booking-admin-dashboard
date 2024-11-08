import React from "react";
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
  Checkbox,
  FormGroup,
  FormControlLabel,
} from "@mui/material";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

const UpdateStorePrice = ({ open, handleClose, initialValues, onSubmit }) => {
  const validationSchema = Yup.object({
    price: Yup.number().required("Price is required"),
    start_hour: Yup.number().required("Start hour is required").min(0).max(23),
    end_hour: Yup.number().required("End hour is required").min(0).max(23),
    days_of_week: Yup.array()
      .min(1, "Select at least one day")
      .required("Days of week are required"),
    priority: Yup.number()
      .required("Priority is required")
      .min(1, "Priority must be between 1 and 4")
      .max(4, "Priority must be between 1 and 4"),
  });

  const priorityOptions = [
    { value: 1, label: "Highest" },
    { value: 2, label: "High" },
    { value: 3, label: "Medium" },
    { value: 4, label: "Low" }
  ];

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
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          Update Store Price
        </Typography>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ errors, touched, values, setFieldValue, handleChange }) => (
            <Form>
              <TextField
                fullWidth
                name="price"
                label="Price"
                type="number"
                margin="normal"
                onChange={handleChange}
                value={values.price}
                error={touched.price && Boolean(errors.price)}
                helperText={touched.price && errors.price}
              />
              <TextField
                fullWidth
                name="start_hour"
                label="Start Hour"
                type="number"
                margin="normal"
                onChange={handleChange}
                value={values.start_hour}
                error={touched.start_hour && Boolean(errors.start_hour)}
                helperText={touched.start_hour && errors.start_hour}
              />
              <TextField
                fullWidth
                name="end_hour"
                label="End Hour"
                type="number"
                margin="normal"
                onChange={handleChange}
                value={values.end_hour}
                error={touched.end_hour && Boolean(errors.end_hour)}
                helperText={touched.end_hour && errors.end_hour}
              />

              <FormGroup>
                <InputLabel>Select Days of Week</InputLabel>
                {[
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ].map((day) => (
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

              <FormControl
                fullWidth
                variant="filled"
                error={touched.priority && Boolean(errors.priority)}
              >
                <InputLabel>Priority</InputLabel>
                <Select
                  value={values.priority}
                  onChange={handleChange}
                  name="priority"
                >
                  {priorityOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {touched.priority && errors.priority && (
                  <div style={{ color: "red", marginTop: "8px" }}>
                    {errors.priority}
                  </div>
                )}
              </FormControl>
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

export default UpdateStorePrice;
