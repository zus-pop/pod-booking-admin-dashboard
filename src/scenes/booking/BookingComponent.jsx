import { Box, useTheme, Menu, MenuItem, Select } from "@mui/material";
import { Header } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useState, useEffect } from "react";
import { IconButton, InputBase, useMediaQuery, Button } from "@mui/material";
import { SearchOutlined } from "@mui/icons-material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import UpdateIcon from "@mui/icons-material/Update";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";

const Booking = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isXsDevices = useMediaQuery("(max-width:466px)");
  const navigate = useNavigate();
  
  const API_URL = import.meta.env.VITE_API_URL;

  const [data, setData] = useState([]);

  const [searchId, setSearchId] = useState("");
  const [searchType, setSearchType] = useState("id");

  const [anchorEl, setAnchorEl] = useState(null);

  const [editStatusId, setEditStatusId] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState(null);


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (id = "") => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/bookings${id ? `/${id}` : ""}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      console.log("Fetched result:", result);

      let formattedData;
      if (Array.isArray(result)) {
        formattedData = result.map((booking) => ({
          booking_id: booking.booking_id,
          booking_date: booking.booking_date,
          booking_status: booking.booking_status,
        }));
      } else if (result && typeof result === "object") {
        formattedData = [
          {
            booking_id: result.booking_id,
            booking_date: result.booking_date,
            booking_status: result.booking_status,
          },
        ];
      } else {
        formattedData = [];
      }
      setData(formattedData);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
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

  const handleSearch = () => {
    console.log(`Current searchId: ${searchId}`);
    if (searchType === "id" && searchId) {
      console.log(`Fetching booking with ID: ${searchId}`);
      fetchData(searchId); // Gọi API để tìm kiếm theo ID
      console.log(data);
    } else if (searchType === "name" && searchId) {
      //
    } else {
      fetchData();
    }
    console.log("Data after fetch:", data);
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
              <MenuItem value="ongoing">Ongoing</MenuItem>
              <MenuItem value="complete">Complete</MenuItem>
              <MenuItem value="canceled">Canceled</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
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
          <span>{params.value}</span>
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
        <Select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          sx={{ ml: 2, flex: 0.2 }}
        >
          <MenuItem value="id">Search by ID</MenuItem>
          <MenuItem value="name">Search by Name</MenuItem>
        </Select>
        <InputBase
          placeholder={` Search by ${
            searchType === "id" ? "Booking ID" : "Name"
          }`}
          sx={{
            ml: 2,
            flex: 0.2,
            border: 0.5,
            py: 1.5,
            px: 1.5,
            borderRadius: 2,
          }}
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />
        <IconButton type="button" onClick={handleSearch}>
          <SearchOutlined />
        </IconButton>
     
      </Box>
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
          sx={{
            "& .MuiDataGrid-cell": {
              fontSize: "15px",
            },
          }}
          checkboxSelection
        />
      </Box>
    </Box>
  );
};

export default Booking;
