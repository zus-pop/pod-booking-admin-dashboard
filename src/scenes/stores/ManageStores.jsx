import { Box, useTheme,Menu, MenuItem,InputBase, TextField } from "@mui/material";
import { Header } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useState, useEffect } from 'react';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import UpdateIcon from "@mui/icons-material/Update";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton, Button, Typography, } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { SearchOutlined } from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";

const Stores = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL

  const [data, setData] = useState([]);

  const [searchNameValue, setSearchNameValue] = useState("");

  
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);

  const [pageSize, setPageSize] = useState(4);
  const [loading, setLoading] = useState(false);
  
  const [paginationModel, setPaginationModel] = useState({
    pageSize: pageSize,
    page: pages,
  });
  const totalPages = Math.ceil(total / pageSize);
  const [filters, setFilters] = useState({
    store_name: "",
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedStoreId,setSelectedStoreId] =  useState(null);
 


  const [editingStore, setEditingStore] = useState(null);
const [editedValues, setEditedValues] = useState({});

  useEffect(() => {
    fetchData();
  }, [pages, pageSize,filters]); 

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await axios.get(`${API_URL}/api/v1/stores`, {
        params: {
          store_name: filters.store_name,      
          limit: pageSize,
          page: pages + 1,
        },
      });
      let formattedData;
      if (Array.isArray(result.data.stores)) {
        formattedData = result.data.stores.map((store) => ({
          store_id: store.store_id,
          store_name: store.store_name,
          address: store.address,
          hotline: store.hotline,
          image: store.image,
        }));
      } else if (result.data && typeof result.data === "object") {
        formattedData = [
          {
            store_id: result.data.store_id,
            store_name: result.data.store_name,
            address: result.data.address,
            hotline: result.data.hotline,
            image: result.data.image,
          },
        ];
      } else {
        formattedData = [];
      }

      setData(formattedData);
      setTotal(result.data.total);
      console.log("Formatted data:", formattedData);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.error("Không tìm thấy Store với tên đã cho.");
        setData([]);
      } else {
        console.error("Error fetching data:", error.message);
      }
    } finally {
      setLoading(false);
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
      if (selectedStoreId) {
        const storeToUpdate = data.find(
          (store) => store.store_id === selectedStoreId
        );
        if (storeToUpdate) {
          setEditingStore(storeToUpdate);
          setEditedValues({
            store_name: storeToUpdate.store_name,
            address: storeToUpdate.address,
            hotline: storeToUpdate.hotline,
          });
        } else {
          console.error("Store not found for ID:", selectedStoreId);
        }
      }
      handleClose();
    };

    

    const handleDelete = () => {
      console.log("Delete booking with ID: ",selectedBookingId);
      handleClose();
    };
  
  const handlePaginationModelChange = (newPaginationModel) => {
    setPaginationModel(newPaginationModel);
    setPages(newPaginationModel.page);
    setPageSize(newPaginationModel.pageSize);
  };

  const handleSearch = () => {
     setFilters((prevFilters) => ({
      ...prevFilters,
      store_name: searchNameValue,
    }));
    setPages(0);
    fetchData();
  };

  const columns = [
    { field: "store_id", headerName: "ID", flex: 0.2 },
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
      flex: 1.2,
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
            <MenuItem onClick={() => handleDelete(params.row.store_id)}>
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
        
        <InputBase
          placeholder=" Search By Name"
          sx={{
            ml: 2,
            flex: 0.2,
            border: 0.5,
            py: 1.5,
            px: 1.5,
            borderRadius: 2,
          }}
          value={searchNameValue}
          onChange={(e) => setSearchNameValue(e.target.value)}
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
           Page {pages + 1} of {totalPages}
         </Typography>
       </Box>
       </Box>
    
     
     </Box>
  );
};

export default Stores;
