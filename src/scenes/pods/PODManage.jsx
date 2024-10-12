import { Box, useTheme } from "@mui/material";
import { Header } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useState, useEffect } from 'react';
import {
  IconButton,
  InputBase,
  Button,
} from "@mui/material";
import {  Select, MenuItem } from "@mui/material";
import {
  SearchOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom"; 
const API_URL = import.meta.env.VITE_API_URL

const PODManage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);
  const [searchId, setSearchId] = useState("");
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState("id");
  useEffect( () => {fetchData();
  }, []);
    const fetchData = async (id = '') => {
      try {
        // Make a GET request using the Fetch API
        const response = await fetch(`${API_URL}/api/v1/pods${id ? `/${id}` : ''}`);
        
        // Check if the response is successful (status code 200-299)
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        console.log("Fetched result:", result);
        let formattedData;
        if (Array.isArray(result)) {
        formattedData = result.map(pod => ({
          pod_id: pod.pod_id,
          pod_name: pod.pod_name,
          pod_type: pod.type_id,
          pod_available: pod.is_available,
        }));
      } else if (result && typeof result === 'object') {
        formattedData = [{
          pod_id: result.pod_id,
          pod_name: result.pod_name,
          pod_type: result.type_id,
          pod_available: result.is_available,
        }];
      } else {
        formattedData = [];
      }
      setData(formattedData)
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    }; 
     // Empty dependency array ensures the effect runs once on mount

  // Function to fetch data
  
  const handleSearch = () => {
    console.log(`Current searchId: ${searchId}`);
    if (searchType === "id" && searchId) {
      console.log(`Fetching pod with ID: ${searchId}`);
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
    { field: "pod_id", headerName: "POD_ID" },
    {
      field: "pod_name",
      headerName: "Name",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "pod_type",
      headerName: "Type",
      type: "number",
      headerAlign: "left",
      align: "left",
    },
    { field: "pod_available", headerName: "Available", flex: 1 },
   
  ];
  return (
    <Box m="20px">
      <Header title="POD Management" subtitle="Managing the POD" />
      <Box display="flex" alignItems="center" borderRadius="3px" >
        <Select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          sx={{ ml: 2, flex: 0.2 }}
        >
          <MenuItem value="id">Search by ID</MenuItem>
          <MenuItem value="name">Search by Name</MenuItem>
        </Select>
        <InputBase
          placeholder={` Search by ${searchType === "id" ? "pod ID" : "Name"}`}
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
        <Button
          variant="contained"
          color="primary"
          sx={{ ml: 'auto' }} 
          onClick={() => navigate('/podform')} 
        >
          Create POD
        </Button>
      </Box>
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
