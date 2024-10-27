import { Box, useTheme, Menu, MenuItem, Select,Typography,} from "@mui/material";
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
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Alert } from "@mui/material";

const Booking = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isXsDevices = useMediaQuery("(max-width:466px)");
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const [editStatusId, setEditStatusId] = useState(null);
  const [newStatus, setNewStatus] = useState("");
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

  const [dateError, setDateError] = useState("");

  useEffect(() => {
    fetchData();
  }, [pages,pageSize,filters]);

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
        }));
      setData(formattedData);
      setTotal(result.data.total)
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

  const handleUpdate = () => {
    if (selectedBookingId) {
      console.log("Updating booking with ID:", selectedBookingId);
      setEditStatusId(selectedBookingId);
      const bookingToUpdate = data.find(
        (booking) => booking.booking_id === selectedBookingId
      );
      if (bookingToUpdate) {
        setNewStatus(bookingToUpdate.booking_status);
      } else {
        console.error("Booking not found for ID:", selectedBookingId);
      }
    }
  };

  const handleConfirmUpdate = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/bookings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ booking_status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update booking status");
      }

      fetchData();
      setEditStatusId(null); // Đóng dropdown sau khi cập nhật
    } catch (error) {
      console.error("Error updating booking status:", error.message);
    }
  };

  // const handleDelete = () => {
  //   console.log("Delete booking with ID: ",selectedBookingId);
  //   handleClose();
  // };

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

  const handleSearch = () => {
    if (validateDate(selectedDate)) {
      const adjustedDate = selectedDate
        ? new Date(selectedDate).toISOString().split('T')[0]
        : "";
      setFilters((prevFilters) => ({
        ...prevFilters,
        booking_status: searchByStatus, 
        booking_date: adjustedDate,
      }));
      fetchData();
    }
  };

  const columns = [
    {
      field: "booking_id",
      headerName: "Booking_ID",
      flex: 0.5,
    },
    { field: "booking_date", headerName: "Date", flex: 1.5 },
    {
      field: "booking_status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) =>
        editStatusId === params.row.booking_id ? (
          <div>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="Ongoing">Ongoing</MenuItem>
              <MenuItem value="Complete">Complete</MenuItem>
              <MenuItem value="Canceled">Canceled</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
            </Select>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleConfirmUpdate(params.row.booking_id)}
            >
              Confirm
            </Button>
          </div>
        ) : (
          <div>
            {params.value}
          </div>
        ),
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
          <IconButton
            onClick={(event) => handleClick(event, params.row.booking_id)}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleUpdate}>
              Update <UpdateIcon />
            </MenuItem>
            {/* <MenuItem onClick={() => handleDelete(params.row.booking_id)}>
              Delete <DeleteIcon />
            </MenuItem> */}
          </Menu>
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
            onChange={(e) => setSearchByStatus(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Complete">Complete</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Ongoing">Ongoing</MenuItem>
            <MenuItem value="Canceled">Canceled</MenuItem>
            <MenuItem value="Confirmed">Confirmed</MenuItem>
          </Select>
        </FormControl>
        <ReactDatePicker
          selected={selectedDate}
          onChange={(date) => {
            const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
            const dateString = localDate.toISOString().split('T')[0];
            setSelectedDate(dateString);
            validateDate(dateString);
          }}
          dateFormat="yyyy-MM-dd"
          placeholderText="Select Date YYYY-MM-DD"
          customInput={<InputBase />}
          onChangeRaw={(e) => {
            setSelectedDate(e.target.value);
            validateDate(e.target.value);
          }}
        />
        <IconButton type="button" onClick={handleSearch}>
          <SearchOutlined />
        </IconButton>
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
          checkboxSelection
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
       Page {pages + 1 } of {totalPages}
     </Typography>
     </Box>
      </Box>
    </Box>
  );
};

export default Booking;
