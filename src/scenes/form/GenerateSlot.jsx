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
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_URL = import.meta.env.VITE_API_URL;

const initialValues = {
  startDate: null,
  endDate: null,
  startHour: "",
  endHour: "",
  durationMinutes: "",
  price: "",
};

const slotSchema = yup.object().shape({
  startDate: yup.date().required("Start date is required"),
  endDate: yup
    .date()
    .required("End date is required")
    .min(yup.ref("startDate"), "End date must be later than start date"),
  startHour: yup
    .number()
    .required("Start hour is required")
    .min(0, "Start hour must be between 0-23")
    .max(23, "Start hour must be between 0-23"),
  endHour: yup
    .number()
    .required("End hour is required")
    .min(0, "End hour must be between 0-23")
    .max(23, "End hour must be between 0-23")
    .test("is-greater", "End hour must be after start hour", function (value) {
      const { startHour } = this.parent;
      return !startHour || !value || value > startHour;
    }),
  durationMinutes: yup.number().required("Duration is required"),
  price: yup.number(),
});

const GenerateSlot = () => {
  const { pod_id } = useParams();
  const [slots, setSlots] = useState([]);
  const theme = useTheme();
  const [pods, setPods] = useState([]);
  const colors = tokens(theme.palette.mode);
  const [storePrices, setStorePrices] = useState([]);
  const navigate = useNavigate();
  
//   const [currentPage, setCurrentPage] = useState(1);
// const slotsPerPage = 12;

//   const indexOfLastSlot = currentPage * slotsPerPage;
//   const indexOfFirstSlot = indexOfLastSlot - slotsPerPage;
//   const currentSlots = slots.slice(indexOfFirstSlot, indexOfLastSlot);

  useEffect(() => {
    // fetchData();
    fetchStorePrices();
    fetchPods ();
  }, []);
  const fetchPods = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/pods/${pod_id}`, {
   
      });
      setPods(response.data);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };
  // const fetchData = async () => {
  //   try {
  //     const result = await axios.get(`${API_URL}/api/v1/slots`, {
  //       params: {
  //         pod_id: pod_id,
  //       },
  //     });
  //     setSlots(result.data);
  //     console.log("Data:", result.data);
  //   } catch (error) {
  //     console.error("Error fetching data:", error.message);
  //   }
  // };

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

  const getDayOfWeek = (date) => {
    const days = [
      "Sunday",
      "Monday", 
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ];
    return days[date.getDay()];
  };

  const calculatePrice = (startDate, endDate, startHour, endHour) => {
    if (!startDate || !endDate || startHour === "" || endHour === "") return 20000;

    // Tạo mảng các ngày từ startDate đến endDate
    const dates = [];
    let currentDate = new Date(startDate);
    const lastDate = new Date(endDate);
    
    while (currentDate <= lastDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Nếu chỉ có 1 ngày và có nhiều khoảng thời gian
    if (dates.length === 1) {
      const dayOfWeek = getDayOfWeek(dates[0]);
      
      // Lọc các store prices phù hợp với ngày trong tuần và khoảng thời gian
      const applicablePrices = storePrices.filter(price => 
        price.days_of_week.includes(dayOfWeek) &&
        ((startHour >= price.start_hour && startHour < price.end_hour) ||
         (endHour > price.start_hour && endHour <= price.end_hour))
      );

      if (applicablePrices.length === 0) return 20000;

      // Sắp xếp theo độ ưu tiên
      const sortedPrices = applicablePrices.sort((a, b) => a.priority - b.priority);
      return sortedPrices[0].price;
    } 
    // Nếu có nhiều ngày
    else {
      const prices = dates.map(date => {
        const dayOfWeek = getDayOfWeek(date);
        const applicablePrices = storePrices.filter(price => 
          price.days_of_week.includes(dayOfWeek) &&
          startHour >= price.start_hour &&
          endHour <= price.end_hour
        );

        if (applicablePrices.length === 0) return 20000;

        const sortedPrices = applicablePrices.sort((a, b) => a.priority - b.priority);
        return sortedPrices[0].price;
      });

      // Trả về mảng các giá theo từng ngày
      return prices;
    }
  };

  const handleFormSubmit = async (values, actions) => {
  try {
    const calculatedPrices = calculatePrice(
      values.startDate,
      values.endDate,
      parseInt(values.startHour),
      parseInt(values.endHour)
    );

    // Thêm offset để điều chỉnh múi giờ
    const offset = new Date().getTimezoneOffset();
    
    // Format dates với điều chỉnh múi giờ
    const formattedStartDate = new Date(values.startDate.getTime() - (offset * 60 * 1000))
      .toISOString()
      .split('T')[0];
      
    const formattedEndDate = new Date(values.endDate.getTime() - (offset * 60 * 1000))
      .toISOString()
      .split('T')[0];

    // Nếu chỉ có 1 ngày
    if (!Array.isArray(calculatedPrices)) {
      const payload = {
        durationMinutes: parseInt(values.durationMinutes),
        endDate: formattedEndDate,
        endHour: parseInt(values.endHour),
        pod_id: parseInt(pod_id),
        price: calculatedPrices,
        startDate: formattedStartDate,
        startHour: parseInt(values.startHour)
      };

      console.log("Submitting values:", payload);
      const response = await axios.post(`${API_URL}/api/v1/slots`, payload);

      if (response.status === 201) {
        toast.success("Slot created successfully");
        actions.resetForm();
      }
    } 
    // Nếu có nhiều ngày
    else {
      const dates = [];
      let currentDate = new Date(values.startDate);
      const lastDate = new Date(values.endDate);
      
      while (currentDate <= lastDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      for (let i = 0; i < dates.length; i++) {
        const adjustedDate = new Date(dates[i].getTime() - (offset * 60 * 1000));
        const payload = {
          durationMinutes: parseInt(values.durationMinutes),
          endDate: adjustedDate.toISOString().split('T')[0],
          endHour: parseInt(values.endHour),
          pod_id: parseInt(pod_id),
          price: calculatedPrices[i],
          startDate: adjustedDate.toISOString().split('T')[0],
          startHour: parseInt(values.startHour)
        };

        await axios.post(`${API_URL}/api/v1/slots`, payload);
      }

      toast.success("All slots created successfully");
      actions.resetForm();
    }
  } catch (error) {
    console.error("Error:", error);
    toast.error(error.response?.data?.message || "Error creating slot");
  }
};

  const updatePrice = (values, setFieldValue) => {
    const calculatedPrices = calculatePrice(
      values.startDate,
      values.endDate || values.startDate,
      parseInt(values.startHour),
      parseInt(values.endHour)
    );

    if (Array.isArray(calculatedPrices)) {
      // Nếu có nhiều ngày, hiển thị tổng giá hoặc giá của ngày đầu tiên
      setFieldValue("price", calculatedPrices[0]);
    } else {
      setFieldValue("price", calculatedPrices);
    }
  };

  // Sửa lại hàm getValidStartHours để lấy các giờ bắt đầu hợp lệ
  const getValidStartHours = (selectedDate) => {
    if (!selectedDate) return [];
    
    const dayOfWeek = getDayOfWeek(selectedDate);
    const validHours = [];
    
    // Lọc các khoảng thời gian phù hợp với ngày được chọn
    const validRanges = storePrices.filter(price => 
      price.days_of_week.includes(dayOfWeek)
    );

    // Với mỗi khoảng thời gian, thêm tất cả các giờ có thể bắt đầu
    validRanges.forEach(range => {
      for (let hour = range.start_hour; hour < range.end_hour; hour++) {
        validHours.push(hour);
      }
    });
    
    return [...new Set(validHours)].sort((a, b) => a - b);
  };

  // Sửa lại hàm getValidEndHours để lấy các giờ kết thúc hợp lệ
  const getValidEndHours = (selectedDate, startHour) => {
    if (!selectedDate || startHour === "") return [];
    
    const dayOfWeek = getDayOfWeek(selectedDate);
    const validHours = [];
    
    // Lọc các khoảng thời gian phù hợp với ngày được chọn và giờ bắt đầu
    const validRanges = storePrices.filter(price => 
      price.days_of_week.includes(dayOfWeek) &&
      startHour < price.end_hour
    );

    // Tìm khoảng thời gian phù hợp nhất (có độ ưu tiên cao nhất)
    const sortedRanges = validRanges.sort((a, b) => a.priority - b.priority);
    const validRange = sortedRanges[0];

    if (!validRange) return [];

    // Thêm các giờ kết thúc hợp lệ (phải lớn hơn giờ bắt đầu)
    for (let hour = startHour + 1; hour <= validRange.end_hour; hour++) {
      validHours.push(hour);
    }
    
    return validHours;
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "type_name", headerName: "POD Type", flex: 1 },
    { field: "start_hour", headerName: "Start Hour", flex: 1 },
    { field: "end_hour", headerName: "End Hour", flex: 1 },
    {
      field: "price",
      headerName: "Price",
      flex: 1,
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
       <Header 
      title={
        <Box component="span">
          MANAGE SLOTS OF{' '}
          <Typography
            component="span"
            sx={{
              color: colors.greenAccent[500],
              fontWeight: 'bold',
              display: 'inline',
              fontSize: "30px",
            }}
          >
            {pods?.pod_name || ''}
          </Typography>
        </Box>
      }
      subtitle={`View Store Price and Generate Slot For ${pods?.pod_name || ''}`} 
    />

      {/* Store Prices DataGrid */}
      <Box mb="10px" marginBottom={5}>
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
          mt: "5px",
          display: "grid",
          gridAutoFlow: "row",
          gridTemplateColumns: "repeat(4, 1fr)",
          gridTemplateRows: "repeat(4, 120px)",
          gap: 2,
        }}
        gap="30px"
      >
        <Box
          alignItems="center"
          justifyContent="center"
          sx={{ gridColumn: "1", gridRow: "1 / 5" }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              marginBottom: "20px",
              color: colors.greenAccent[500],
              textAlign: "center" 
            }}
          >
            Select values in form to generate slots for {pods?.pod_name || ''}
          </Typography>
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
              setFieldValue,
            }) => (
              <form onSubmit={handleSubmit}>
                <Box>
                  <FormControl fullWidth sx={{ marginBottom: "10px" }}>
                    <ReactDatePicker
                      selected={values.startDate}
                      onChange={(date) => {
                        setFieldValue("startDate", date);
                        updatePrice({ ...values, startDate: date }, setFieldValue);
                      }}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Select start date"
                      customInput={
                        <TextField
                          fullWidth
                          variant="filled"
                          label="Start Date"
                          error={touched.startDate && Boolean(errors.startDate)}
                          helperText={touched.startDate && errors.startDate}
                          inputProps={{
                            readOnly: true,
                          }}
                        />
                      }
                      minDate={new Date()}
                    />
                  </FormControl>

                  <FormControl fullWidth sx={{ marginBottom: "10px" }}>
                    <ReactDatePicker
                      selected={values.endDate}
                      onChange={(date) => setFieldValue("endDate", date)}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Select end date"
                      customInput={
                        <TextField
                          fullWidth
                          variant="filled"
                          label="End Date"
                          error={touched.endDate && Boolean(errors.endDate)}
                          helperText={touched.endDate && errors.endDate}
                          inputProps={{
                            readOnly: true,
                          }}
                        />
                      }
                      minDate={values.startDate || new Date()}
                    />
                  </FormControl>
                  <FormControl fullWidth sx={{ marginBottom: "10px" }}>
                    <InputLabel>Start Hour</InputLabel>
                    <Select
                      fullWidth
                      variant="filled"
                      label="Start Hour"
                      onBlur={handleBlur}
                      onChange={(e) => {
                        handleChange(e);
                        // Reset end hour when start hour changes
                        setFieldValue("endHour", "");
                        updatePrice({ ...values, startHour: e.target.value }, setFieldValue);
                      }}
                      value={values.startHour}
                      name="startHour"
                      error={touched.startHour && Boolean(errors.startHour)}
                    >
                      {getValidStartHours(values.startDate).map((hour) => (
                        <MenuItem key={hour} value={hour} sx={{ py: 1 }}>
                          {hour.toString().padStart(2, "0")}:00
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.startHour && errors.startHour && (
                      <Typography color="error" variant="caption">
                        {errors.startHour}
                      </Typography>
                    )}
                  </FormControl>

                  <FormControl fullWidth sx={{ marginBottom: "10px" }}>
                    <InputLabel>End Hour</InputLabel>
                    <Select
                      fullWidth
                      variant="filled"
                      label="End Hour"
                      onBlur={handleBlur}
                      onChange={(e) => {
                        handleChange(e);
                        updatePrice({ ...values, endHour: e.target.value }, setFieldValue);
                      }}
                      value={values.endHour}
                      name="endHour"
                      error={touched.endHour && Boolean(errors.endHour)}
                    >
                      {getValidEndHours(values.startDate, values.startHour).map((hour) => (
                        <MenuItem key={hour} value={hour} sx={{ py: 1 }}>
                          {hour.toString().padStart(2, "0")}:00
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.endHour && errors.endHour && (
                      <Typography color="error" variant="caption">
                        {errors.endHour}
                      </Typography>
                    )}
                  </FormControl>
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
                    value={values.price}
                    name="price"
                    disabled
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

        {/* {currentSlots.map((slot, index) => (
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
            <Typography>
              Price:{" "}
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(slot.price)}
            </Typography>
          </Box>
        ))}
        <Box
          sx={{
            gridColumn: "2 / 5",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
            mt: 2,
          }}
        >
          <Button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            variant="contained"
            color="secondary"
          >
            &lt;
          </Button>
          <Typography>
            Trang {currentPage} / {Math.ceil(slots.length / slotsPerPage)}
          </Typography>
          <Button
            onClick={handleNextPage}
            disabled={currentPage === Math.ceil(slots.length / slotsPerPage)}
            variant="contained"
            color="secondary"
          >
            &gt;
          </Button> */}
        {/* </Box> */}
      </Box>
    </Box>
  );
};

export default GenerateSlot;