import React, { useState, useEffect } from "react";
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
import { toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

const validationSchema = Yup.object({
  price: Yup.number().required("Price is required").min(100000, "Price > 100.000"),
  start_hour: Yup.number().required("Start hour is required").min(0).max(23),
  end_hour: Yup.number().required("End hour is required").min(1).max(24),
  days_of_week: Yup.array()
    .min(1, "Select at least one day")
    .required("Days of week are required"),
  priority: Yup.number()
    .required("Priority is required")
    .min(1, "Priority must be between 1 and 4")
    .max(4, "Priority must be between 1 and 4"),
  type_id: Yup.number().required("POD Type is required"),
});

const StorePriceForm = () => {
  const { id } = useParams();
  const [storeName, setStoreName] = useState("");
  const [podTypes] = useState([
    { type_id: 1, type_name: "Single POD" },
    { type_id: 2, type_name: "Double POD" },
    { type_id: 3, type_name: "Meeting Room" }
  ]);

  useEffect(() => {
    const fetchStoreDetails = async () => {
      try {
        const storeResponse = await axios.get(`${API_URL}/api/v1/stores/${id}`);
        setStoreName(storeResponse.data.store_name);
      } catch (error) {
        console.error("Error fetching store details:", error);
      }
    };

    fetchStoreDetails();
  }, [id]);

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
      });
      if (response.status === 201) {
        toast.success("Store price created successfully");
        resetForm();
      }
    } catch (error) {
      console.error("Error creating store price:", error);
      if (error.response) {
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

  const priorityOptions = [
    { value: 1, label: "Highest" },
    { value: 2, label: "High" },
    { value: 3, label: "Medium" },
    { value: 4, label: "Low" }
  ];

  return (
    <Box m="20px">
      <Header
        title="CREATE STORE PRICE"
        subtitle="New prices for store slots"
        showBackButton={true} 
      />
 

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
                label="Store Name"
                value={storeName}
                disabled
                sx={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
              />
              <FormControl fullWidth variant="filled" error={touched.type_id && Boolean(errors.type_id)}>
                <InputLabel>POD Type</InputLabel>
                <Select
                  value={values.type_id}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="type_id"
                >
                  {podTypes.map((type) => (
                    <MenuItem key={type.type_id} value={type.type_id}>
                      {type.type_name}
                    </MenuItem>
                  ))}
                </Select>
                {touched.type_id && errors.type_id && (
                  <div style={{ color: "red", marginTop: "8px" }}>{errors.type_id}</div>
                )}
              </FormControl>
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
              <Box sx={{ mb: 2 }}>
                <InputLabel sx={{ mb: 1 }}>Select Days of Week</InputLabel>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  padding: 2,
                  borderRadius: 1
                }}>
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
                    sx={{ 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      pb: 1,
                      mb: 1
                    }}
                  />
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: 1
                  }}>
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
                        sx={{ margin: 0 }}
                      />
                    ))}
                  </Box>
                </Box>
                {touched.days_of_week && errors.days_of_week && (
                  <div style={{ color: "red", marginTop: "8px" }}>{errors.days_of_week}</div>
                )}
              </Box>
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
              <FormControl fullWidth variant="filled" error={touched.priority && Boolean(errors.priority)}>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={values.priority}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="priority"
                >
                  {priorityOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {touched.priority && errors.priority && (
                  <div style={{ color: "red", marginTop: "8px" }}>{errors.priority}</div>
                )}
              </FormControl>
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