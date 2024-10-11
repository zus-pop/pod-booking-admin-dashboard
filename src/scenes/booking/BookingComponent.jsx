import { Box, useTheme } from "@mui/material";
import { Header } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useState, useEffect } from "react";
import {
  IconButton,
  InputBase,
  useMediaQuery,
} from "@mui/material";
import {  Select, MenuItem } from "@mui/material";
import {
  SearchOutlined,
} from "@mui/icons-material";

const Booking = ()  => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isXsDevices = useMediaQuery("(max-width:466px)");
  
  const API_URL = import.meta.env.VITE_API_URL;

  const [data, setData] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [searchType, setSearchType] = useState("id"); // New state for search type

  useEffect(() => {
    fetchData();
  }, []); 

  const fetchData = async (id = "") => {
    try {
      const response = await fetch(`${API_URL}/api/v1/bookings${id ? `/${id}` : ''}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      console.log("Fetched result:", result);
  
      let formattedData;
      if (Array.isArray(result)) {
        formattedData = result.map(booking => ({
          booking_id: booking.booking_id,
          booking_date: booking.booking_date,
          booking_status: booking.booking_status,
        }));
      } else if (result && typeof result === 'object') {
        formattedData = [{
          booking_id: result.booking_id,
          booking_date: result.booking_date,
          booking_status: result.booking_status,
        }];
      } else {
        formattedData = [];
      }
      setData(formattedData);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  const handleSearch = () => {
    console.log(`Current searchId: ${searchId}`);
    if (searchType === "id" && searchId) {
      console.log(`Fetching booking with ID: ${searchId}`);
      fetchData(searchId); // Gọi API để tìm kiếm theo ID
      console.log(data)
    } else if (searchType === "name" && searchId) {
      // Nếu bạn muốn thêm chức năng tìm kiếm theo tên, bạn có thể thêm logic ở đây
    } else {
      fetchData(); // Nếu không có ID, gọi lại để lấy tất cả dữ liệu
    }
    console.log("Data after fetch:", data);
  };

  const columns = [
    { field: "booking_id", headerName: "Booking_ID", flex: 1 },
    { field: "booking_date", headerName: "Date", flex: 1 },
    { field: "booking_status", headerName: "Status", flex: 1 },
  ];

  return (
    <Box m="20px">
      <Header title="Booking" subtitle="Manage Booking Data" />
      <Box display="flex" alignItems="center" borderRadius="3px" sx={{ display: `${isXsDevices ? "none" : "flex"}` }}>
        <Select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          sx={{ ml: 2, flex: 0.2 }}
        >
          <MenuItem value="id">Search by ID</MenuItem>
          <MenuItem value="name">Search by Name</MenuItem>
        </Select>
        <InputBase
          placeholder={` Search by ${searchType === "id" ? "Booking ID" : "Name"}`}
          sx={{ ml: 2, flex: 0.2,border: 0.5 , py: 1.5,px: 1.5, borderRadius: 2}}
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
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
          
          checkboxSelection
        />
      </Box>
    </Box>
  );
};

export default Booking;