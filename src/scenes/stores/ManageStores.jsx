import { Box, useTheme,Menu, MenuItem, Select,InputBase } from "@mui/material";
import { Header } from "../../components";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useState, useEffect } from 'react';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import UpdateIcon from "@mui/icons-material/Update";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { SearchOutlined } from "@mui/icons-material";

const Stores = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL

  const [data, setData] = useState([]);

  
  const [searchId, setSearchId] = useState("");
  const [searchType, setSearchType] = useState("id");

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedStoreId,setSelectedStoreId] =  useState(null);

  useEffect(() => {
    fetchData();
  }, []); 

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/stores`);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      
      setData(result.stores);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };
  const fetchDataById = async (id = "") => {
    try {
      const response = await fetch(`${API_URL}/api/v1/stores/${id}`);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      let formattedData;
     if (result && typeof result === "object") {
        formattedData = [
          {
            store_id: result.store_id,
            store_name: result.store_name,
            hotline: result.hotline,
            address: result.address,
          },
        ];
      } else {
        formattedData = [];
      }
      setData(formattedData);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };
  
  const handleClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedStoreId(id); 
  };
  
    const handleClose = () => {
      setAnchorEl(null);
    };

    const handleUpdate = () => {
      console.log("the id updated is",selectedStoreId);
    }

      const handleDelete = () => {
    console.log("Delete booking with ID: ",selectedBookingId);
    handleClose();
  };

  const handleSearch = () => {
    console.log(`Current searchId: ${searchId}`);
    if (searchType === "id" && searchId) {
      console.log(`Fetching store with ID: ${searchId}`);
      fetchDataById(searchId); // Gọi API để tìm kiếm theo ID
      console.log(data);
    } else if (searchType === "name" && searchId) {
      //
    } else {
      fetchData();
    }
    console.log("Data after fetch:", data);
  };

  const columns = [
    { field: "store_id", headerName: "ID", flex: 1 },
    {
      field: "store_name",
      headerName: "Name",
      flex: 1,
      cellClassName: "name-column--cell",
    },

    {
      field: "hotline",
      headerName: "Phone Number",
      flex: 1,
    },

    {
      field: "address",
      headerName: "Address",
      flex: 1,
    },
    {
      field: "detail",
      headerName: "Detail",
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/web/store/${params.row.store_id}`)}
          >
            View Detail
          </Button>
          <IconButton
            onClick={(event) => handleClick(event, params.row.store_id)}
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
            <MenuItem onClick={() => handleDelete(params.row.booking_id)}>
              Delete <DeleteIcon />
            </MenuItem>
          </Menu>
        </div>
      ),
      flex: 1,
    },
  ];
  return (
    <Box m="20px">
      <Header
        title="Stores"
        subtitle="List of Stores"
      />
       <Box
        display="flex"
        alignItems="center"
        borderRadius="3px"
        sx={{ display: "flex"} }
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
            searchType === "id" ? "Store ID" : "Name"
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
        <Button
          variant="contained"
          color="primary"
          sx={{ ml: 'auto' }} 
          onClick={() => navigate('/web/storeform')} 
        >
          Create New Store
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
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.gray[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={data}
          columns={columns}
          getRowId={(row) => row.store_id} 
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

export default Stores;
