import {
  Box,
  useTheme,
  Menu,
  MenuItem,
  InputBase,
  TextField,
  Modal,
} from "@mui/material";
import { Header } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useState, useEffect } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import UpdateIcon from "@mui/icons-material/Update";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { SearchOutlined } from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";
import UpdateStore from "../form/UpdateStore";
import { useRole } from "../../RoleContext";
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarHalfIcon from '@mui/icons-material/StarHalf';

const Stores = () => {
  const { userRole } = useRole();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

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
  const [selectedStoreId, setSelectedStoreId] = useState(null);

  const [editingStore, setEditingStore] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchNameValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchNameValue);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchNameValue]);

  useEffect(() => {
    setPages(0);
    setPaginationModel(prev => ({
      ...prev,
      page: 0
    }));
    setFilters((prevFilters) => ({
      ...prevFilters,
      store_name: debouncedSearchValue,
    }));
  }, [debouncedSearchValue]);

  useEffect(() => {
    fetchData();
  }, [pages, pageSize, filters]);

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
          rating: store.rating || 0,
        }));
      } else {
        formattedData = [];
      }

      setData(formattedData);
      setTotal(result.data.total);
      console.log("Formatted data:", formattedData);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.error("Store not found with the given name.");
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
        setIsUpdateModalOpen(true);
      } else {
        console.error("Store not found for ID:", selectedStoreId);
      }
    }
    handleClose();
  };

  const handleUpdateSubmit = async (values) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/v1/stores/${selectedStoreId}`,
        values
      );
      if (response.status === 200) {
        toast.success("Store updated successfully");
        setIsUpdateModalOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error("Error updating store:", error);
      toast.error("An error occurred while updating the store");
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
    handleClose();
  };

  const confirmDelete = async () => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/v1/stores/${selectedStoreId}`
      );
      if (response.status === 200) {
        toast.success("Store deleted successfully");
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting store:", error);
      toast.error("An error occurred while deleting store");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };
  
  const isActionDisabled = () => {
    switch (userRole) {
      case "Staff":
        return true;
      case "Manager":
        return false;
      case "Admin":
        return false;
      default:
        return true;
    }
  };
  const isActDisabled = () => {
    switch (userRole) {
      case "Manager":
        return true;
        case "Staff":
          return true;
      default:
        return false;
    }
  };

  const handlePaginationModelChange = (newPaginationModel) => {
    setPaginationModel(newPaginationModel);
    setPages(newPaginationModel.page);
    setPageSize(newPaginationModel.pageSize);
  };

  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 > 0;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIcon 
          key={`full-${i}`} 
          sx={{ color: colors.greenAccent[500] }} 
        />
      );
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <StarHalfIcon 
          key="half" 
          sx={{ color: colors.greenAccent[500] }} 
        />
      );
    }

    // Add empty stars
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <StarBorderIcon 
          key={`empty-${i}`} 
          sx={{ color: colors.greenAccent[500] }} 
        />
      );
    }

    return (
      <Box display="flex" alignItems="center">
        {stars}
        <Typography sx={{ ml: 1, color: colors.greenAccent[500] }}>
          ({rating.toFixed(1)})
        </Typography>
      </Box>
    );
  };

  const columns = [
    { field: "store_id", headerName: "ID", flex: 0.2 },
    {
      field: "image",
      headerName: "Image",
      flex: 1,
      renderCell: (params) => (
        <div><img
          src={params.value}
          alt={` ${params.row.pod_name}`}
          style={{ width: '200px', height: '100px', objectFit: 'cover' }}
        />
         </div>
      ),
    },
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
      flex: 2,
      renderCell: (params) => (
        <div style={{ 
          whiteSpace: 'normal',
          lineHeight: '1.2',
          padding: '8px 0'
        }}>
          {params.value}
        </div>
      )
    },
    {
      field: "rating",
      headerName: "Rating",
      flex: 1,
      renderCell: (params) => renderStarRating(params.value),
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
            onClick={(event) => handleClick(event, params.row.store_id)
            
            }
            disabled={isActionDisabled()}
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
            <MenuItem onClick={handleDelete}   disabled={isActDisabled ()}>
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
      <UpdateStore
        open={isUpdateModalOpen}
        handleClose={() => setIsUpdateModalOpen(false)}
        store={editingStore}
        onSubmit={handleUpdateSubmit}
      />
      <Modal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography id="delete-modal-title" variant="h6" component="h2">
            Confirm Delete
          </Typography>
          <Typography id="delete-modal-description" sx={{ mt: 2 }}>
            Are you sure you want to delete this store?
          </Typography>
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={() => setIsDeleteModalOpen(false)} sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button onClick={confirmDelete} variant="contained" color="error">
              Delete
            </Button>
          </Box>
        </Box>
      </Modal>
      <Header title="Stores" subtitle="List of Stores" />
      <Box
        display="flex"
        alignItems="center"
        borderRadius="3px"
        sx={{ display: "flex" }}
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
              setFilters((prevFilters) => ({
                ...prevFilters,
                store_name: searchNameValue,
              }));
            }
          }}
        />
        <IconButton 
          type="button" 
          onClick={() => {
            setFilters((prevFilters) => ({
              ...prevFilters,
              store_name: searchNameValue,
            }));
          }}
        >
          <SearchOutlined />
        </IconButton>
        <Button
          variant="outlined"
          sx={{ ml: "auto" ,  
            color: colors.gray[100],
            
            borderColor: colors.gray[100],
            '&:hover': {
              borderColor: colors.greenAccent[500],
              color: colors.greenAccent[500],
            }}}
          onClick={() => navigate("/web/storeform")}
          disabled={isActDisabled()}
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
         
          rowHeight={100}
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
