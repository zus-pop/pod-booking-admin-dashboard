import React from "react";
import {
  Box,
  Button,
  TextField,
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
import { Header } from "../../components";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

const validationSchema = Yup.object({
  price: Yup.number().required("Price is required"),
  start_hour: Yup.number().required("Start hour is required").min(0).max(23),
  end_hour: Yup.number().required("End hour is required").min(0).max(23),
  days_of_week: Yup.array()
    .min(1, "Select at least one day")
    .required("Days of week are required"),
  priority: Yup.number()
    .required("Priority is required")
    .min(1, "Priority must be between 1 and 10")
    .max(10, "Priority must be between 1 and 10"),
});

const StorePriceForm = () => {
  const { typeId, id } = useParams();
  const initialValues = {
    price: "",
    start_hour: "",
    end_hour: "",
    days_of_week: [],
    store_id: "",
    type_id: "",
    priority: "",
  };
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const response = await axios.post(`${API_URL}/api/v1/store-prices`, {
        ...values,
        store_id: id,
        type_id: typeId,
      });
      console.log("Submitting values:", values);
      if (response.status === 201) {
        toast.success("Store price created successfully");
        resetForm();
      }
    } catch (error) {
      console.error("Error creating store price:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        toast.error(
          `Error: ${
            error.response.data.message || "An error occurred while creating store price"
          }`
        );
      } else {
        toast.error("An error occurred while creating store price");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box m="20px">
      <Header
        title="CREATE STORE PRICE"
        subtitle="New prices for store slots"
      />
      <ToastContainer />

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          isSubmitting,
          setFieldValue,
        }) => (
          <Form>
            <Box display="flex" flexDirection="column" gap="30px">
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Price"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.price}
                name="price"
                error={touched.price && Boolean(errors.price)}
                helperText={touched.price && errors.price}
              />
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Start Hour"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.start_hour}
                name="start_hour"
                error={touched.start_hour && Boolean(errors.start_hour)}
                helperText={touched.start_hour && errors.start_hour}
              />
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="End Hour"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.end_hour}
                name="end_hour"
                error={touched.end_hour && Boolean(errors.end_hour)}
                helperText={touched.end_hour && errors.end_hour}
              />
              <FormGroup>
                <InputLabel>Select Days of Week</InputLabel>
                <FormControlLabel
                  control={
                    <Field
                      as={Checkbox}
                      name="select_all_days"
                      checked={values.days_of_week.length === 7}
                      onChange={(e) => {
                        const allDays = [
                          "Sunday",
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                          "Saturday",
                        ];
                        if (e.target.checked) {
                          setFieldValue("days_of_week", allDays);
                        } else {
                          setFieldValue("days_of_week", []);
                        }
                      }}
                    />
                  }
                  label="All Days"
                />
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
              {touched.days_of_week && errors.days_of_week && (
                <div style={{ color: "red" }}>{errors.days_of_week}</div>
              )}

              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Priority"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.priority}
                name="priority"
                error={touched.priority && Boolean(errors.priority)}
                helperText={touched.priority && errors.priority}
              />
            </Box>
            <Box display="flex" justifyContent="center" mt="20px">
              <Button
                type="submit"
                color="secondary"
                variant="contained"
                disabled={isSubmitting}
              >
                Create New Store Price
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default StorePriceForm;