import { Box, useTheme,Typography,Button,FormControl,Select,MenuItem } from "@mui/material";
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
import { useNavigate } from "react-router-dom";
import { ToastContainer,toast } from "react-toastify";

const ManageUsers = () => {
  const API_URL = import.meta.env.VITE_API_URL
  const navigate = useNavigate();
  const theme = useTheme();
  const isXsDevices = useMediaQuery("(max-width:466px)");
  const colors = tokens(theme.palette.mode);

  const [data, setData] = useState([]);
 const  [editingUserId,setEditingUserId] = useState("");
 const [newStatus,setNewStatus] = useState("");
  const [searchValue,setSearchValue] = useState("")
  
  
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);

  const [pageSize, setPageSize] = useState(4);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: pageSize,
    page: pages,
  });
  const totalPages = Math.ceil(total / pageSize);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
  });


  useEffect(() => {
    fetchData();
  }, [pages, pageSize,filters]); 

  const fetchData = async () => {
    try {
       setLoading(true);
      const result = await axios.get(`${API_URL}/api/v1/auth/users`, {
        params: {
          search: filters.search,
          limit: pageSize,
          page: pages + 1,
        }
      })
      const formattedData = result.data.users.map(user => ({
        user_id: user.user_id,
        user_name: user.user_name,
        email: user.email,
        role: user.role.role_name,  
      })); // because can't set property of array to table  so need to format data
      setData(formattedData);
      setTotal(result.data.total);
      console.log("Formatted data:", formattedData);
    } catch (error) {
      console.error('Error fetching data:', error.message);
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


  const handleSearch = () => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      search: searchValue,
    }));
    fetchData();
  };
  const handleEditRole = (userId) => {
    console.log("Updating user with ID:", userId);
    setEditingUserId(userId);
    const userToUpdate = data.find(user => user.user_id === userId);
    if (userToUpdate) {
      setNewStatus(userToUpdate.role.role_id);
    } else {
      console.error("User not found for ID:", userId);
    }
  };
  
  const handleConfirmEdit = async (userId, newRole) => {
    try {
      const response = await axios.put(`${API_URL}/api/v1/auth/users/${userId}`, {
        role_id: newRole 
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.status === 200) {
        toast.success("Cập nhật vai trò thành công");
        fetchData(); 
        setEditingUserId(null);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật vai trò:", error);
      toast.error("Có lỗi xảy ra khi cập nhật vai trò");
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
      renderCell: (params) => (
        editingUserId === params.row.user_id ? (
          <div style={{ display: "flex", alignItems: "center" }}>
            <FormControl>
  <Select
    value={newStatus}
    onChange={(e) => setNewStatus(e.target.value)}
  >
    <MenuItem value="3">Manager</MenuItem>
    <MenuItem value="4">Staff</MenuItem>
  </Select>
</FormControl>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleConfirmEdit(params.row.user_id, newStatus)}
            >
              Xác nhận
            </Button>
          </div>
        ) : (
          <div>
            {params.value}
          </div>
        )
      ),
    },
    {
      field: "action",
      headerName: "Action",
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() =>  handleEditRole(params.row.user_id)}
            disabled={params.row.role !== "Manager" && params.row.role !== "Staff"}
          >
            Edit Role
          </Button>
        </div>
      ),
      flex: 0.5,
    },

  ];

  return (
    <Box m="20px">
      <Header title="Users" subtitle="List of Users" />
      <ToastContainer/>
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
        <Button
          variant="contained"
          color="primary"
          sx={{ ml: 'auto' }} 
          onClick={() => navigate('/web/userform')}
        >
          Create a new user
        </Button>
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

export default ManageUsers;
