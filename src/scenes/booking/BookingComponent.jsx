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
import {
  SearchOutlined,
} from "@mui/icons-material";

const Booking = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isXsDevices = useMediaQuery("(max-width:466px)");
  const API_URL = import.meta.env.VITE_API_URL;
  const [data, setData] = useState([]);
  const [searchId, setSearchId] = useState("");

  useEffect(() => {
    fetchData();
  }, []); // Fetch all bookings on mount

  const fetchData = async (id = "") => {
    try {
      const response = await fetch(`${API_URL}/api/v1/bookings${id ? `/${id}` : ''}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();

  
      const updatedData = result.map(item => ({
        booking_id: item.booking_id,
        pod_name: item.pod ? item.pod.pod_name : "N/A", 
        slot_id: item.slots ? item.slots.slot_id : "N/A", 
        booking_date: item.booking_date,
        booking_status: item.booking_status,
      }));
  
      setData(updatedData);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };
  const handleSearch = () => {
    if (searchId) {
      fetchData(searchId);
    }
  };

  const columns = [
    { field: "booking_id", headerName: "Booking_ID", flex: 1 },
    { field: "booking_date", headerName: "Date", flex: 1 },
    { field: "booking_status", headerName: "Status", flex: 1 },
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
        <InputBase
          placeholder="Search by Booking ID"
          sx={{ ml: 2, flex: 0.2 }}
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <IconButton type="button" sx={{ p: 1 }} onClick={handleSearch}>
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