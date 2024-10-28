import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  IconButton,
  Menu,
  Select,
  MenuItem,
  Checkbox,
  useTheme,
  FormGroup,
  FormControlLabel,
} from "@mui/material";
import { Header } from "../../components";
import { Formik } from "formik";
import * as yup from "yup";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { tokens } from "../../theme";
import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";



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
  const [slots, setSlots] = useState([]);
  const theme = useTheme();
  const [visibleSlots, setVisibleSlots] = useState(12);
  const colors = tokens(theme.palette.mode);
  const [storePrices, setStorePrices] = useState([]);
  const navigate = useNavigate();

 
  useEffect(() => {
    fetchData();
    fetchStorePrices();
  }, []);

  const fetchData = async () => {
    try {
      const result = await axios.get(`${API_URL}/api/v1/slots`);
      setSlots(result.data);
      console.log("Data:", result.data);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  const fetchStorePrices = async () => {
    try {
      const podResponse = await axios.get(`${API_URL}/api/v1/pods/${pod_id}`);
      const typeId = podResponse.data.type.type_id;
      const storeId = podResponse.data.store.store_id;
  
      const result = await axios.get(
        `${API_URL}/api/v1/stores/${storeId}/pod-type/${typeId}/prices`
      );
      
      let formattedData;
      if (Array.isArray(result.data.storePrices)) {
        formattedData = result.data.storePrices.map((storePrice) => ({
          id: storePrice.id,
          start_hour: storePrice.start_hour,
          end_hour: storePrice.end_hour,
          price: storePrice.price,
          days_of_week: storePrice.days_of_week,
          type_name: storePrice.type?.type_name || "Unknown",
          type: storePrice.type?.type_id,
          priority: storePrice.priority,
        }));
      } else {
        formattedData = [];
      }
      setStorePrices(formattedData);
    } catch (error) {
      console.error("Error fetching store prices:", error.message);
      setStorePrices([]);
    }
  };

  const handleFormSubmit = async (values, actions) => {
    try {
      console.log("Submitting values:", { ...values, pod_id });
      console.log("Submitting values:", { values });
      const response = await axios.post(`${API_URL}/api/v1/slots`, {
        ...values,
        pod_id,
      });
      console.log(response.status);
      if (response.status === 201) {
        console.log("Slot created successfully");
        toast.success(response.data.message);
        actions.resetForm();
      } else {
        console.error("Failed to create slot");
        console.log(response.data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };


  const getPodTypeName = (typeId) => {
    switch (typeId) {
      case 1:
        return "Single POD";
      case 2:
        return "Double POD";
      case 3:
        return "Meeting Room";
      default:
        return "Unknown";
    }
  };
  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "type_name", headerName: "POD Type", flex: 1 },
    { field: "start_hour", headerName: "Start Hour", flex: 1 },
    { field: "end_hour", headerName: "End Hour", flex: 1 },
    { field: "price", headerName: "Price", flex: 1 },
    {
      field: "days_of_week",
      headerName: "Days of Week",
      flex: 2,
      valueGetter: (params) => {
        const days = params.value;
        const allDays = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];

        if (days.length === 7 && allDays.every((day) => days.includes(day))) {
          return "All days";
        } else {
          return days.join(", ");
        }
      },
    },
    {
      field: "priority",
      headerName: "Priority",
      flex: 0.5,
    },
   
  ];

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
      <Header title="GENERATE SLOT" subtitle="" />

      {/* Store Prices DataGrid */}
      <Box mb="20px" marginBottom={5}>
        <Box display="flex" alignItems="center" borderRadius="3px">
          <Typography variant="h4" gutterBottom>
            Store Prices
          </Typography>
         
        </Box>
        <DataGrid
          rows={storePrices}
          columns={columns}
          initialState={{
            ...storePrices.initialState,
            pagination: { paginationModel: { pageSize: 5 } },
          }}
          pageSizeOptions={[5, 10, 25]}
          autoHeight
          disableSelectionOnClick
          sx={{
            "& .MuiDataGrid-cell": {
              fontSize: "15px",
            },
            "& .MuiDataGrid-columnHeaders": {
              fontSize: "15px",
            },
          }}
        />
      </Box>

      <Box
        sx={{
          mt: "20px",
          display: "grid",
          gridAutoFlow: "row",
          gridTemplateColumns: "repeat(4, 1fr)",
          gridTemplateRows: "repeat(7, 100px)",
          gap: 2,
        }}
        gap="30px"
      >
        <Box
          alignItems="center"
          justifyContent="center"
          sx={{ gridColumn: "1", gridRow: "1 / 8" }}
        >
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
                <Box>
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
                    sx={{ marginBottom: "10px" }}
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
                    sx={{ marginBottom: "10px" }}
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
                    sx={{ marginBottom: "10px" }}
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
                    sx={{ marginBottom: "10px" }}
                  />
                  <TextField
                    fullWidth
                    variant="filled"
                    label="Duration Minutes"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.durationMinutes}
                    name="durationMinutes"
                    error={
                      touched.durationMinutes && Boolean(errors.durationMinutes)
                    }
                    helperText={
                      touched.durationMinutes && errors.durationMinutes
                    }
                    sx={{ marginBottom: "10px" }}
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
                    sx={{ marginBottom: "40px" }}
                  />
                </Box>

                <Box justifyContent="center" mt="0px">
                  <Button type="submit" color="secondary" variant="contained">
                    Generate Slot
                  </Button>
                </Box>
              </form>
            )}
          </Formik>
        </Box>

        {slots.slice(0, visibleSlots).map((slot, index) => (
          <Box
            key={index}
            bgcolor={colors.primary[400]}
            sx={{
              borderRadius: "16px",
              padding: "20px",
            }}
            alignItems="center"
            justifyContent="center"
          >
            <Typography variant="h5">Slot {slot.slot_id}</Typography>
            <Typography>Start time: {slot.start_time}</Typography>
            <Typography>End time: {slot.end_time}</Typography>
          </Box>
        ))}
      </Box>
     

    </Box>
  );
};

export default GenerateSlot;
