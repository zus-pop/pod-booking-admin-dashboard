import {
    Box,
    Button,
    TextField,
} from "@mui/material";
import { Header } from "../../components";
import {  Formik } from "formik";
import * as yup from "yup";
import axios from "axios";
import { useParams } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL;

const initialValues = {
    startDate: "",
    endDate: "",
    startHour: "",
    endHour: "",
    durationMinutes: "",
    price: "",
};

const slotSchema = yup.object().shape({
    startDate: yup.string().required("Start date is required"),
    endDate: yup.string().required("End date is required"),
    startHour: yup.number().required("Start hour is required"),
    endHour: yup.number().required("End hour is required"),
    durationMinutes: yup.number().required("Duration is required"),
    price: yup.number().required("Price is required"),
});



const GenerateSlot = () => {
    const { pod_id } = useParams();
   
    const handleFormSubmit = async (values, actions) => {
        try {
            console.log("Submitting values:", { ...values, pod_id });
            console.log("Submitting values:", {values });
            const response = await axios.post(`${API_URL}/api/v1/slots`,{ ...values, pod_id });
            console.log(response.status)
            if (response.status === 201) {
                console.log("Slot created successfully");
                toast.success(response.data.message);
                actions.resetForm();
            } else {
                console.error("Failed to create slot");
                console.log(response.data)
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        
        <Box m="20px">
            <ToastContainer
                  position="top-center"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="light"
                />
            <Header title="GENERATE SLOT" subtitle="Create a New Slot" />

            <Formik
                onSubmit={handleFormSubmit}
                initialValues={initialValues}
                validationSchema={slotSchema}
            >
                {({
                    values,
                    errors,
                    touched,
                    handleBlur,
                    handleChange,
                    handleSubmit,
                }) => (
                    <form onSubmit={handleSubmit}>
                        <Box display="flex" flexDirection="column" gap="30px">
                            <TextField
                                fullWidth
                                variant="filled"
                                label="Start Date"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.startDate}
                                name="startDate"
                                error={touched.startDate && Boolean(errors.startDate)}
                                helperText={touched.startDate && errors.startDate}
                            />
                            <TextField
                                fullWidth
                                variant="filled"
                                label="End Date"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.endDate}
                                name="endDate"
                                error={touched.endDate && Boolean(errors.endDate)}
                                helperText={touched.endDate && errors.endDate}
                            />
                            <TextField
                                fullWidth
                                variant="filled"
                                label="Start Hour"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.startHour}
                                name="startHour"
                                error={touched.startHour && Boolean(errors.startHour)}
                                helperText={touched.startHour && errors.startHour}
                            />
                            <TextField
                                fullWidth
                                variant="filled"
                                label="End Hour"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.endHour}
                                name="endHour"
                                error={touched.endHour && Boolean(errors.endHour)}
                                helperText={touched.endHour && errors.endHour}
                            />
                            <TextField
                                fullWidth
                                variant="filled"
                                label="Duration Minutes"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.durationMinutes}
                                name="durationMinutes"
                                error={touched.durationMinutes && Boolean(errors.durationMinutes)}
                                helperText={touched.durationMinutes && errors.durationMinutes}
                            />
                            <TextField
                                fullWidth
                                variant="filled"
                                label="Price"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.price}
                                name="price"
                                error={touched.price && Boolean(errors.price)}
                                helperText={touched.price && errors.price}
                            />
                        </Box>

                        <Box display="flex" justifyContent="center" mt="30px">
                            <Button type="submit" color="secondary" variant="contained">
                                Generate Slot
                            </Button>
                        </Box>
                    </form>
                )}
            </Formik>
        </Box>
    );
};

export default GenerateSlot;