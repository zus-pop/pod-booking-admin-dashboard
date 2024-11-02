import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  useTheme,
  Card,
} from "@mui/material";
import { Header } from "../../components";
import { Formik } from "formik";
import * as yup from "yup";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { tokens } from "../../theme";
import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

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
  durationMinutes: yup
    .number()
    .min(30, "Duration must be > 30 minutes")
    .test("duration-test", "Duration exceeds available time", function(value) {
      if (!value) return true;
      const { selectedStorePrice } = this.options.context;
      if (!selectedStorePrice) return true;
      
      const startHour = selectedStorePrice.start_hour;
      const endHour = selectedStorePrice.end_hour;
      const maxMinutes = (endHour - startHour) * 60;
      
      return value <= maxMinutes;
    }),
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
    pageSize: 5, 
    page: 0
  });
  const [podName, setPodName] = useState("");

  useEffect(() => {
    fetchData();
    fetchStorePrices();
    fetchPodName();
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

  const fetchPodName = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/pods/${pod_id}`);
      setPodName(response.data.pod_name);
    } catch (error) {
      console.error("Error fetching pod name:", error.message);
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
        toast.error(error.response.data.message);
      
      console.error("Error:", error);}
    }
  };

  const handleRowSelect = (storePrice, setFieldValue) => {
    setSelectedStorePrice(storePrice);

    // Reset toàn bộ form khi chọn store price mới
    setFieldValue("startDate", null);
    setFieldValue("endDate", null);
    setFieldValue("durationMinutes", "");
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
      
      <Header 
        title="Generate Slots" 
        subtitle="Create new slots for POD"
        showBackButton={true} 
      />

      <Box
        sx={{
          backgroundColor: '#1a1c23',
          borderRadius: "16px", 
          padding: "20px",
          marginBottom: "20px",
          maxHeight: "500px",
          overflow: "auto",
          "& .fc": {
            fontFamily: "'Inter', sans-serif",
          },
          "& .fc-toolbar-title": {
            color: "ffff",
            fontSize: '1.5rem',
            fontWeight: 600,
          },
          "& .fc-button": {
            backgroundColor: colors.greenAccent[500],
            borderColor: colors.greenAccent[500],
            '&:hover': {
              backgroundColor: colors.greenAccent[600],
            },
            '&:disabled': {
              backgroundColor: colors.greenAccent[700],
            },
            textTransform: 'capitalize',
            fontWeight: 500,
            color: colors.primary[500],
          },
          "& .fc-day-today": {
            backgroundColor: "transparent !important",
          },
          "& .fc-event": {
            backgroundColor: `${colors.greenAccent[500]} !important`,
            borderColor: colors.greenAccent[500],
            opacity: "0.9 !important",
            color: "ffff",
            '&:hover': {
              backgroundColor: colors.greenAccent[600],
              cursor: 'pointer',
            },
          },
          "& .fc-timegrid-slot": {
            height: "80px !important",
            borderColor: '#3f3f46',
          },
          "& .fc-col-header-cell": {
            backgroundColor: "#27272a",
            color: colors.gray[100],
            padding: "12px",
            fontWeight: 500,
          },
          "& .fc-timegrid-axis": {
            backgroundColor: "#27272a",
            color: colors.gray[100],
          },
          "& .fc-timegrid-slot-label": {
            backgroundColor: "#27272a",
            color: colors.gray[100],
          },
          "& .fc-scrollgrid": {
            borderColor: '#3f3f46',
          },
          "& .fc-scrollgrid td, & .fc-scrollgrid th": {
            borderColor: '#3f3f46',
          },
          "& .fc-highlight": {
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
          },
          "& .fc-event-title": {
            color: colors.primary[500],
          },
          "& .fc-event-time": {
            color: colors.primary[500],
          },
          "&::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: colors.primary[400],
          },
          "&::-webkit-scrollbar-thumb": {
            background: colors.greenAccent[500],
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: colors.greenAccent[600],
          },
          "& .fc-timegrid-event": {
            margin: "4px 0",
            borderRadius: "4px",
            height: "calc(100% - 8px) !important",
          },
        }}
      >
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridWeek,timeGridDay'
          }}
          events={slots.map(slot => ({
            id: slot.slot_id.toString(),
            title: '',
            start: slot.start_time,
            end: slot.end_time,
            backgroundColor: colors.greenAccent[500],
            borderColor: colors.greenAccent[500],
            textColor: '#ffffff',
            extendedProps: {
              price: slot.price,
              pod_id: slot.pod_id,
              is_available: slot.is_available,
              start_time: new Date(slot.start_time).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
              }),
              end_time: new Date(slot.end_time).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
              }),
              customStyle: {
                margin: '4px 0',
                borderRadius: '4px',
                padding: '4px'
              }
            }
          }))}
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
          allDaySlot={false}
          slotDuration="00:30:00"
          height="600px"
          eventMinHeight={60}
          views={{
            timeGridWeek: {
              eventContent: (arg) => {
                return {
                  html: `
                    <div style="
                      padding: 4px;
                      color: #ffffff;
                      font-size: 14px;
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                      justify-content: center;
                      height: calc(100% - 8px);
                      text-align: center;
                      line-height: 1.2;
                      margin: 4px 0;
                      border-radius: 4px;
                    ">
                      <div style="font-weight: 500;">
                        ${arg.event.extendedProps.start_time} - ${arg.event.extendedProps.end_time}
                      </div>
                      <div style="font-weight: 600; margin-top: 4px;">
                        ${new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(arg.event.extendedProps.price)}
                      </div>
                    </div>
                  `
                }
              }
            },
            timeGridDay: {
              eventContent: (arg) => {
                return {
                  html: `
                    <div style="
                      padding: 4px;
                      color: #ffffff;
                      font-size: 14px;
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                      justify-content: center;
                      height: calc(100% - 8px);
                      text-align: center;
                      line-height: 1.2;
                      margin: 4px 0;
                      border-radius: 4px;
                    ">
                      <div style="font-weight: 500;">
                        ${arg.event.extendedProps.start_time} - ${arg.event.extendedProps.end_time}
                      </div>
                      <div style="font-weight: 600; margin-top: 4px;">
                        ${new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(arg.event.extendedProps.price)}
                      </div>
                    </div>
                  `
                }
              }
            }
          }}
        />
      </Box>

      <Box mb="10px" marginBottom={5}>
        <Typography variant="h4" gutterBottom>
          Store Prices for {podName}
        </Typography>
        <Formik
          initialValues={initialValues}
          validationSchema={slotSchema}
          onSubmit={handleFormSubmit}
          validationContext={{ selectedStorePrice }}
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
                  <Typography variant="h6" gutterBottom>
                  Please first select row in table then fill form to generate slot for {podName}
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
                      error={touched.durationMinutes && Boolean(errors.durationMinutes)}
                      helperText={touched.durationMinutes && errors.durationMinutes}
                      sx={{ marginBottom: "40px" }}
                      disabled={!values.startDate || !selectedStorePrice}
                      inputProps={{
                        min: 30,
                        max: selectedStorePrice ? (selectedStorePrice.end_hour - selectedStorePrice.start_hour) * 60 : 0
                      }}
                    />

                    {selectedStorePrice && values.startDate && (
                      <Typography variant="body2" sx={{ marginBottom: "10px", color: "text.secondary" }}>
                        Maximum duration: {(selectedStorePrice.end_hour - selectedStorePrice.start_hour) * 60} minutes
                      </Typography>
                    )}

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
