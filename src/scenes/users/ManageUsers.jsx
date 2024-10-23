import { Box, useTheme } from "@mui/material";
import { Header } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useState, useEffect } from 'react';
import {
  IconButton,
  InputBase,
  useMediaQuery,
} from "@mui/material";
import {
  SearchOutlined,
} from "@mui/icons-material";
import axios from "axios";

const ManageUsers = () => {
  const API_URL = import.meta.env.VITE_API_URL

  const theme = useTheme();
  const isXsDevices = useMediaQuery("(max-width:466px)");
  const colors = tokens(theme.palette.mode);

  const [data, setData] = useState([]);

  const [searchValue,setSearchValue] = useState("")
  
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
  });


  useEffect(() => {
    fetchData();
  }, [filters]); 

  const fetchData = async () => {
    try {
       setLoading(true);
      const result = await axios.get(`${API_URL}/api/v1/auth/users`, {
        params: {
          search: filters.search,
        }
      })
      const formattedData = result.data.map(user => ({
        user_id: user.user_id,
        user_name: user.user_name,
        email: user.email,
        role: user.role.role_name, 
      }));
      setData(formattedData);
      console.log("Formatted data:", formattedData);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  };
  


  const handleSearch = () => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      search: searchValue,
    }));
    fetchData();
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
          display="flex"
          alignItems="center"
         
          borderRadius="3px"
          sx={{ display: `${isXsDevices ? "none" : "flex"}` }}
        >
          <InputBase
          placeholder=" Search By Name or Gmail"
          sx={{
            ml: 2,
            flex: 0.2,
            border: 0.5,
            py: 1.5,
            px: 1.5,
            borderRadius: 2,
          }}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
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
           pageSizeOptions={[4, 6, 8]}
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
       </Box>
     
     </Box>
  );
};

export default ManageUsers;
