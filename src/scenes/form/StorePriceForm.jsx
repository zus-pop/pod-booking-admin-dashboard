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
  price: Yup.number().required("Giá là bắt buộc"),
  start_hour: Yup.number().required("Giờ bắt đầu là bắt buộc").min(0).max(23),
  end_hour: Yup.number().required("Giờ kết thúc là bắt buộc").min(0).max(23),
  days_of_week: Yup.array()
    .min(1, "Chọn ít nhất một ngày")
    .required("Ngày trong tuần là bắt buộc"),

  priority: Yup.number()
    .required("Độ ưu tiên là bắt buộc")
    .min(1, "Độ ưu tiên phải là 1 -> 10 ")
    .max(10, "Độ ưu tiên phải là 1 -> 10"),
});

const StorePriceForm = () => {
  const { typeId, id } = useParams();
  const initialValues = {
    price: "",
    start_hour: "",
    end_hour: "",
    days_of_week: [],
    store_id:  "",
    type_id:  "",
    priority: "",
  };
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/v1/store-prices`,
        {
          ...values,
          store_id: id,
          type_id: typeId,
        }
      );
      console.log("Submitting values:", values);
      if (response.status === 201) {
        toast.success("Tạo giá cửa hàng thành công");
        resetForm();
      }
    }catch (error) {
      console.error("Lỗi khi tạo giá cửa hàng:", error);
      if (error.response) {
        console.error("Phản hồi lỗi:", error.response.data);
        toast.error(`Lỗi: ${error.response.data.message || 'Có lỗi xảy ra khi tạo giá cửa hàng'}`);
      } else {
        toast.error("Có lỗi xảy ra khi tạo giá cửa hàng");
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
        }) => (
          <Form>
            <Box display="flex" flexDirection="column" gap="30px">
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Giá"
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
                label="Giờ bắt đầu"
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
                label="Giờ kết thúc"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.end_hour}
                name="end_hour"
                error={touched.end_hour && Boolean(errors.end_hour)}
                helperText={touched.end_hour && errors.end_hour}
              />
              <FormGroup>
                <InputLabel>Chọn ngày trong tuần</InputLabel>
                {[
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursđay",
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
                label="Độ ưu tiên"
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
                Tạo giá cửa hàng mới
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default StorePriceForm;
