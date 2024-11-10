import {
  Box,
  useTheme,
  Menu,
  MenuItem,
  Select,
  Typography,
  TextField,
} from "@mui/material";
import { Header } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useState, useEffect } from "react";
import {
  IconButton,
  InputLabel,
  InputBase,
  useMediaQuery,
  Button,
  FormControl,
} from "@mui/material";
import { SearchOutlined } from "@mui/icons-material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import UpdateIcon from "@mui/icons-material/Update";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Alert } from "@mui/material";
import { useRole } from "../../RoleContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Booking = () => {
  const { userRole } = useRole();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isXsDevices = useMediaQuery("(max-width:466px)");
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const [searchById, setSearchById] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const [selectedDate, setSelectedDate] = useState(null);
  const [searchByStatus, setSearchByStatus] = useState("");
  const [filters, setFilters] = useState({
    booking_status: "",
    booking_date: "",
  });

  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);

  const [pageSize, setPageSize] = useState(4);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: pageSize,
    page: pages,
  });
  const totalPages = Math.ceil(total / pageSize);
  const STATUS_FLOW = {
    Pending: ["Pending", "Confirmed", "Canceled"],
    Confirmed: ["Confirmed", "Ongoing", "Canceled"],
    Paused: ["Paused", "Ongoing",  "Complete"],
    Ongoing: ["Ongoing","Paused", "Complete"],
    Complete: ["Complete"],
    Canceled: ["Canceled"],
  };
  const [dateError, setDateError] = useState("");

  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    fetchData();
  }, [pages, pageSize, filters]);

  const fetchData = async (id = "") => {
    try {
      setLoading(true);
      const result = await axios.get(`${API_URL}/api/v1/bookings`, {
        params: {
          booking_status: filters.booking_status,
          booking_date: filters.booking_date,
          page: pages + 1,
          limit: pageSize,
        },
      });
      const formattedData = result.data.bookings.map((booking) => ({
        booking_id: booking.booking_id,
        booking_date: booking.booking_date,
        booking_status: booking.booking_status,
        user_name: booking.user.user_name,
        email: booking.user.email,
      }));
      setData(formattedData);
      setTotal(result.data.total);
      console.log("Formatted data:", formattedData);
    } catch (error) {
      console.error("Error fetching data:", error.message);
      if (error.response && error.response.status === 404) {
        console.error("Không tìm thấy Store với tên đã cho.");
        setData([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePaginationModelChange = (newPaginationModel) => {
    setPaginationModel(newPaginationModel);
    setPages(newPaginationModel.page);
    setPageSize(newPaginationModel.pageSize);
  };

  const handleClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedBookingId(id);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSearchByIdChange = (e) => {
    const value = e.target.value;
    setSearchById(value);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    const timeoutId = setTimeout(() => {
      if (!value) {
        fetchData();
      } else {
        handleSearchById(value);
      }
    }, 500); 

    setSearchTimeout(timeoutId);
  };

  const handleSearchById = async (value) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/v1/bookings/${value}`
      );
      if (response.data) {
        const booking = response.data;
        const formattedData = [
          {
            booking_id: booking.booking_id,
            booking_date: booking.booking_date,
            booking_status: booking.booking_status,
            user_name: booking.user.user_name,
            email: booking.user.email,
          },
        ];
        setData(formattedData);
        setTotal(1);
      }
    } catch (error) {
      console.error("Error searching booking:", error);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (e) => {
    setSearchByStatus(e.target.value);
    setPages(0);
    setPaginationModel((prev) => ({
      ...prev,
      page: 0,
    }));
    setFilters((prevFilters) => ({
      ...prevFilters,
      booking_status: e.target.value,
    }));
  };

  const handleDateChange = (date) => {
    if (date) {
      const localDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      );
      const dateString = localDate.toISOString().split("T")[0];
      setSelectedDate(dateString);
      setPages(0);
      setPaginationModel((prev) => ({
        ...prev,
        page: 0,
      }));
      if (validateDate(dateString)) {
        setFilters((prevFilters) => ({
          ...prevFilters,
          booking_date: dateString,
        }));
      }
    } else {
      setSelectedDate(null);
      setFilters((prevFilters) => ({
        ...prevFilters,
        booking_date: "",
      }));
    }
  };

  const validateDate = (date) => {
    if (date) {
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      if (!regex.test(date)) {
        setDateError("Vui lòng nhập ngày theo định dạng YYYY-MM-DD");
        return false;
      }
      setDateError("");
      return true;
    }
    setDateError("");
    return true;
  };

  const columns = [
    {
      field: "booking_id",
      headerName: "Booking_ID",
      flex: 0.5,
    },
    {
      field: "user_name",
      headerName: "User Name",
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.5,
    },
    {
      field: "booking_date",
      headerName: "Date",
      flex: 1.5,
    },
    {
      field: "booking_status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => <div>{params.value}</div>,
    },
    {
      field: "detail",
      headerName: "Detail",
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/web/booking/${params.row.booking_id}`)}
          >
            View Detail
          </Button>
        </div>
      ),
      flex: 1,
    },
  ];

  return (
    <Box m="20px">
      <Header title="Booking" subtitle="Manage Booking Data" />
      <Box
        display="flex"
        alignItems="center"
        borderRadius="3px"
        sx={{ display: `${isXsDevices ? "none" : "flex"}` }}
      >
        <FormControl sx={{ minWidth: 200, mr: 2 }}>
          <InputLabel id="type-select-label">Booking Status</InputLabel>
          <Select
            labelId="type-select-label"
            id="type-select"
            value={searchByStatus}
            onChange={handleStatusChange}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Complete">Complete</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Ongoing">Ongoing</MenuItem>
            <MenuItem value="Canceled">Canceled</MenuItem>
            <MenuItem value="Confirmed">Confirmed</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200, mr: 2 }}>
          <TextField
            label="Search by ID"
            variant="filled"
            value={searchById}
            onChange={handleSearchByIdChange}
            InputProps={{
              endAdornment: (
                <IconButton disabled>
                  <SearchOutlined />
                </IconButton>
              ),
            }}
            sx={{
              "& .MuiInputBase-root": {
                height: "50px",
              },
            }}
          />
        </FormControl>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel shrink>Select Date</InputLabel>
          <ReactDatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select Date YYYY-MM-DD"
            isClearable={true}
            customInput={
              <TextField
                variant="filled"
                fullWidth
                sx={{
                  "& .MuiInputBase-root": {
                    height: "50px",
                    display: "flex",
                    alignItems: "center",
                  },
                  "& .MuiFilledInput-input": {
                    paddingTop: "8px",
                  },
                }}
                inputProps={{
                  readOnly: true,
                  style: {
                    cursor: "pointer",
                    fontSize: "12px",
                    color: "inherit",
                  },
                }}
              />
            }
          />
        </FormControl>
      </Box>
      {dateError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {dateError}
        </Alert>
      )}
      <Box
        mt="40px"
        height="75vh"
        maxWidth="100%"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            border: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
        }}
      >
        <DataGrid
          rows={data}
          columns={columns}
          getRowId={(row) => row.booking_id}
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          pageSizeOptions={[4, 6, 8]}
          rowCount={total}
          paginationMode="server"
          loading={loading}
          autoHeight
          sx={{
            "& .MuiDataGrid-cell": {
              fontSize: "15px",
            },
            "& .MuiDataGrid-columnHeaders": {
              fontSize: "15px",
            },
          }}
        />
        <Box mt="10px">
          <Typography variant="body1">
            Page {pages + 1} of {totalPages}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Booking;
