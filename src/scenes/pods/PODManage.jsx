import { Box, Typography, useTheme } from "@mui/material";
import { Header } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import {
  AdminPanelSettingsOutlined,
  LockOpenOutlined,
  SecurityOutlined,
} from "@mui/icons-material";
import Fetch from "../../Fetch";
import { useState, useEffect } from 'react';
const baseUrl = 'http://3.27.69.109:3000/api/v1'

const PODManage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);
  useEffect( () => {
    const fetchData = async () => {
      try {
        // Make a GET request using the Fetch API
        const response = await fetch(`${baseUrl}/pods`);
        
        // Check if the response is successful (status code 200-299)
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
  
        // Parse the JSON data from the response
        const result = await response.json();
  
        // Update the state with the fetched data
        setData(result);
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    }; 
    fetchData();
  }, []); // Empty dependency array ensures the effect runs once on mount

  // Function to fetch data
  

  const columns = [
    { field: "pod_id", headerName: "POD_ID" },
    {
      field: "pod_name",
      headerName: "Name",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "type_id",
      headerName: "Type",
      type: "number",
      headerAlign: "left",
      align: "left",
    },
    { field: "is_available", headerName: "Available", flex: 1 },
    // {
    //   field: "access",
    //   headerName: "Access Level",
    //   flex: 1,
    //   renderCell: ({ row: { access } }) => {
    //     return (
    //       <Box
    //         width="120px"
    //         p={1}
    //         display="flex"
    //         alignItems="center"
    //         justifyContent="center"
    //         gap={1}
    //         bgcolor={
    //           access === "admin"
    //             ? colors.greenAccent[600]
    //             : colors.greenAccent[700]
    //         }
    //         borderRadius={1}
    //       >
    //         {access === "admin" && <AdminPanelSettingsOutlined />}
    //         {access === "manager" && <SecurityOutlined />}
    //         {access === "user" && <LockOpenOutlined />}
    //         <Typography textTransform="capitalize">{access}</Typography>
    //       </Box>
    //     );
    //   },
    // },
  ];
  return (
    <Box m="20px">
      <Header title="POD Management" subtitle="Managing the POD" />
      <Box
        mt="40px"
        height="75vh"
        flex={1}
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
          getRowId={(row) => row.pod_id} 
          initialState={{
            pagination: {
              paginationModel: {
                pageSize:  10,
              },
            },
          }}
          checkboxSelection
        />
      </Box>
    </Box>
  );
};

export default PODManage;
