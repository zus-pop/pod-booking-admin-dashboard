import { Box, useTheme } from "@mui/material";
import { Header } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useState, useEffect } from 'react';

const ManageUsers = () => {
  const API_URL = import.meta.env.VITE_API_URL
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);
  useEffect(() => {
    fetchData();
  }, []); 

  const fetchData = async () => {
    try {
      // Make a GET request using the Fetch API
      const response = await fetch(`${API_URL}/api/v1/auth/users`);
      
      // Check if the response is successful (status code 200-299)
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Parse the JSON data from the response
      const result = await response.json();
      const formattedData = result.map(user => ({
        user_id: user.user_id,
        user_name: user.user_name,
        email: user.email,
        role: user.role.role_name, // Accessing role_name here
      }));
      // Update the state with the fetched data
      setData(formattedData);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  const columns = [
    { field: "user_id", headerName: "ID" },
    {
      field: "user_name",
      headerName: "Name",
      flex: 1,
      cellClassName: "name-column--cell",
    },

    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },  
    { 
      field: "role",
      headerName: "Role",
      flex: 1,
   
    },
   
  ];

  return (
    <Box m="20px">
      <Header title="Users" subtitle="List of Users" />
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
        }}
      >
        <DataGrid
          rows={data}
          columns={columns}
          getRowId={(row) => row.user_id} 
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

export default ManageUsers;
