import { Box, useTheme } from "@mui/material";
import { Header } from "../../components";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useState, useEffect } from "react";
const Booking = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const baseUrl = "http://3.27.69.109:3000/api/v1";
  const [data, setData] = useState([]);
  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array ensures the effect runs once on mount

  // Function to fetch data
  const fetchData = async () => {
    try {
      // Make a GET request using the Fetch APIttttttttttttttt
      const response = await fetch(`${baseUrl}/bookings`);

      // Check if the response is successful (status code 200-299)
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // Parse the JSON data from the response
      const result = await response.json();

      // Update the state with the fetched data
      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };
  const columns = [
    { field: "booking_id", headerName: "Booking_ID", flex: 1 },
    {
      field: "pod_id",
      headerName: "POD_ID",
      flex: 1,
      cellClassName: "name-column--cell",
    },

    {
      field: "user_id",
      headerName: "User ID",
      flex: 1,
    },
    {
      field: "booking_date",
      headerName: "Date",
      flex: 1,
    },

    {
      field: "booking_status",
      headerName: "Status",
      flex: 1,
    },

  ];
  return (
    <Box m="20px">
      <Header title="Booking" subtitle="Manage Booking Data" />
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
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-iconSeparator": {
            color: colors.primary[100],
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.gray[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={data}
          columns={columns}
          getRowId={(row) => row.booking_id}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          checkboxSelection
        />
      </Box>
    </Box>
  );
};

export default Booking;
