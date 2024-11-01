import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  useTheme,
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
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_URL = import.meta.env.VITE_API_URL;

const initialValues = {
  startDate: null,
  endDate: null,
  durationMinutes: "",
};

const slotSchema = yup.object().shape({
  startDate: yup.date().nullable().required("Start date is required"),
  endDate: yup
    .date()
    .nullable()
    .when("startDate", (startDate, schema) => {
      if (!startDate || !startDate[0]) return schema;
      return schema.min(startDate[0], "End date must be later than start date");
    })
    .required("End date is required"),
  durationMinutes: yup.number().required("Duration is required"),
});

const GenerateSlot = () => {
  const { pod_id } = useParams();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [slots, setSlots] = useState([]);
  const [storePrices, setStorePrices] = useState([]);
  const [selectedStorePrice, setSelectedStorePrice] = useState(null);
  const [isConsecutive, setIsConsecutive] = useState(true);
  const [pageSize, setPageSize] = useState(5); 
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 5,  // Đảm bảo giá trị này khớp với pageSizeOptions
    page: 0
  });
  useEffect(() => {
    fetchData();
    fetchStorePrices();
  }, []);

  useEffect(() => {
    if (selectedStorePrice) {
      checkConsecutiveDays(selectedStorePrice.days_of_week);
    }
  }, [selectedStorePrice]);

  const fetchData = async () => {
    try {
      const result = await axios.get(`${API_URL}/api/v1/slots`, {
        params: {
          pod_id: +pod_id,
        },
      });
      setSlots(result.data);
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

      if (Array.isArray(result.data.storePrices)) {
        setStorePrices(
          result.data.storePrices.map((storePrice) => ({
            id: storePrice.id,
            start_hour: storePrice.start_hour,
            end_hour: storePrice.end_hour,
            price: storePrice.price,
            days_of_week: storePrice.days_of_week,
            type_name: storePrice.type?.type_name || "Unknown",
            priority: storePrice.priority,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching store prices:", error.message);
    }
  };

  const handleFormSubmit = async (values, actions) => {
    console.log({
      ...values,
      startDate: values.startDate.toISOString().split("T")[0],
      endDate: values.endDate.toISOString().split("T")[0],
      pod_id: +pod_id,
      startHour: selectedStorePrice?.start_hour,
      endHour: selectedStorePrice?.end_hour,
      price: selectedStorePrice?.price,
    });
    try {
      const response = await axios.post(`${API_URL}/api/v1/slots`, {
        ...values,
        startDate: values.startDate.toISOString().split("T")[0],
        endDate: values.endDate.toISOString().split("T")[0],
        pod_id: +pod_id,
        startHour: selectedStorePrice?.start_hour,
        endHour: selectedStorePrice?.end_hour,
        price: selectedStorePrice?.price,
      });
      if (response.status === 201) {
        toast.success(response.data.message);
        actions.resetForm();
      } } catch (error) {
        if (error.response && error.response.status === 400) {
       
          const messages = error.response.data.message.split('<br>');
          messages.forEach(message => {
            if (message.trim()) { 
              toast.error(message.trim());
            }
          });
      } else {
  
      console.error("Error:", error);}
    }
  };

  const handleRowSelect = (storePrice, setFieldValue) => {
    setSelectedStorePrice(storePrice);

    // Reset startDate and endDate when selecting a new store price
    setFieldValue("startDate", null);
    setFieldValue("endDate", null);
  };

  const checkConsecutiveDays = (daysOfWeek) => {
    const dayIndices = daysOfWeek.map((day) => {
      const daysMap = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
      };
      return daysMap[day];
    });
    dayIndices.sort((a, b) => a - b);
    let consecutive = true;
    for (let i = 1; i < dayIndices.length; i++) {
      if (dayIndices[i] !== dayIndices[i - 1] + 1) {
        consecutive = false;
        break;
      }
    }
    setIsConsecutive(consecutive);
  };

  const columns = [
    // { field: "id", headerName: "ID", flex: 0.5 },
    // { field: "type_name", headerName: "POD Type", flex: 1 },
    { field: "start_hour", headerName: "Start Hour", flex: 0.3 },
    { field: "end_hour", headerName: "End Hour", flex: 0.3 },
    {
      field: "price",
      headerName: "Price",
      flex: 0.5,
      valueFormatter: (params) => {
        return new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(params.value);
      },
    },
    {
      field: "days_of_week",
      headerName: "Days of Week",
      flex: 0.8,
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
      flex: 0.3,
    },
  ];

  const validDaysOfWeek = selectedStorePrice?.days_of_week.map((day) => {
    const daysMap = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };
    return daysMap[day];
  });

  const isDateAllowed = (date) => {
    return validDaysOfWeek?.includes(date.getDay());
  };

  return (
    <Box m="20px">
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        theme="light"
      />
      <Header title="GENERATE SLOT" subtitle="" />

      <Box mb="10px" marginBottom={5}>
        <Typography variant="h4" gutterBottom>
          Store Prices
        </Typography>
        <Formik
          initialValues={initialValues}
          validationSchema={slotSchema}
          onSubmit={handleFormSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleBlur,
            handleChange,
            handleSubmit,
            setFieldValue,
            isValid,
          }) => (
            <Box display={"flex"} justifyContent={"space-around"} gap={3}>
              <DataGrid
                rows={storePrices}
                columns={columns}
                onRowClick={(params) =>
                  handleRowSelect(params.row, setFieldValue)
                }
                pageSizeOptions={[5, 10]}
                paginationModel={paginationModel}
                onPaginationModelChange={(newModel) => setPaginationModel(newModel)}
                autoHeight
                disableSelectionOnClick
                sx={{
                  "& .MuiDataGrid-cell": { fontSize: "15px" },
                  "& .MuiDataGrid-columnHeaders": {
                    fontSize: "15px",
                  },
                }}
              />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(1, 1fr)",
                  gap: 2,
                  mt: 5,
                }}
              >
                <Box sx={{ gridColumn: "1 / 3" }}>
                  <Typography variant="h4" gutterBottom>
                    Form
                  </Typography>
                  <form onSubmit={handleSubmit}>
                    <FormControl
                      sx={{
                        marginBottom: "10px",
                        marginRight: "5px",
                      }}
                    >
                      <ReactDatePicker
                        selected={values.startDate}
                        onChange={(date) => {
                          setFieldValue("startDate", date);
                          if (!isConsecutive) {
                            setFieldValue("endDate", date);
                          }
                        }}
                        dateFormat="yyyy-MM-dd"
                        filterDate={isDateAllowed}
                        customInput={
                          <TextField
                            fullWidth
                            variant="filled"
                            label="Start Date"
                            inputProps={{
                              readOnly: true,
                            }}
                          />
                        }
                        minDate={new Date()}
                      />
                    </FormControl>
                    <FormControl sx={{ marginBottom: "10px" }}>
                      <ReactDatePicker
                        selected={values.endDate}
                        onChange={(date) => setFieldValue("endDate", date)}
                        dateFormat="yyyy-MM-dd"
                        filterDate={isDateAllowed}
                        customInput={
                          <TextField
                            fullWidth
                            variant="filled"
                            label="End Date"
                            inputProps={{
                              readOnly: true,
                            }}
                          />
                        }
                        minDate={values.startDate || new Date()}
                        disabled={!isConsecutive}
                      />
                    </FormControl>

                    {/* Display selectedStorePrice details */}
                    <Typography variant="body1" sx={{ marginBottom: "10px" }}>
                      <strong>Start Hour:</strong>{" "}
                      {selectedStorePrice?.start_hour ?? "--"}
                    </Typography>
                    <Typography variant="body1" sx={{ marginBottom: "10px" }}>
                      <strong>End Hour:</strong>{" "}
                      {selectedStorePrice?.end_hour ?? "--"}
                    </Typography>
                    <Typography variant="body1" sx={{ marginBottom: "10px" }}>
                      <strong>Price:</strong>{" "}
                      {selectedStorePrice
                        ? `${selectedStorePrice.price} VND`
                        : "--"}
                    </Typography>

                    <TextField
                      fullWidth
                      variant="filled"
                      label="Duration Minutes"
                       type="number"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.durationMinutes}
                      name="durationMinutes"
                      error={
                        touched.durationMinutes &&
                        Boolean(errors.durationMinutes)
                      }
                      helperText={
                        touched.durationMinutes && errors.durationMinutes
                      }
                      sx={{ marginBottom: "40px" }}
                    />
                    <Button
                      type="submit"
                      color="secondary"
                      variant="contained"
                      disabled={!selectedStorePrice || !isValid}
                    >
                      Generate Slot
                    </Button>
                  </form>
                </Box>
              </Box>
            </Box>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

export default GenerateSlot;
