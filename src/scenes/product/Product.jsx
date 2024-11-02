import {
  Box,
  useTheme,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu,
  IconButton,
  InputBase,
  Modal,
  Button,
} from "@mui/material";
import { Header } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useState, useEffect } from "react";
import axios from "axios";
import { SearchOutlined } from "@mui/icons-material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import UpdateIcon from "@mui/icons-material/Update";
import DeleteIcon from "@mui/icons-material/Delete";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UpdateProduct from "../form/UpdateProduct";
import { useRole } from "../../RoleContext";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const Product = () => {
  const { userRole } = useRole();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate()
  const [data, setData] = useState([]);
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
    product_name: "",
    category: "",
  });
  const [searchCategoryId, setSearchCategoryId] = useState("");
  const [searchNameValue, setSearchNameValue] = useState("");

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [stores, setStores] = useState([]);

  useEffect(() => {
    fetchStores();
    fetchData();
  }, [pages, pageSize, filters]);

  const fetchStores = async () => {
    try {
      // Lấy tổng số stores
      const totalResponse = await axios.get(`${API_URL}/api/v1/stores`);
      if (totalResponse.status === 200) {
        const total = totalResponse.data.total;
  
        const response = await axios.get(`${API_URL}/api/v1/stores?limit=${total}`);
        if (response.status === 200) {
          setStores(response.data.stores);
        }
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await axios.get(`${API_URL}/api/v1/products`, {
        params: {
          limit: pageSize,
          page: pages + 1,
          product_name: filters.product_name,
          category_id: filters.category,
        },
      });

      setData(result.data.products);
      setTotal(result.data.total);
    } catch (error) {
      console.error("Error fetching data:", error.message);
      if (error.response && error.response.status === 404) {
        console.error("POD with the given name not found.");
        setData([]);
      }
    } finally {
      setLoading(false);
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
  const isDeleteDisabled = () => {
    switch (userRole) {
      case "Manager":
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

  const handleSearch = () => {
    setPages(0);
    setPaginationModel(prev => ({
      ...prev,
      page: 0
    }));
    setFilters((prevFilters) => ({
      ...prevFilters,
      category: searchCategoryId,
      product_name: searchNameValue,
    }));
  };

  const handleClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedProductId(id);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleUpdate = () => {
    if (selectedProductId) {
      const productToUpdate = data.find(
        (product) => product.product_id === selectedProductId
      );
      if (productToUpdate) {
        setEditingProduct(productToUpdate);
        setIsUpdateModalOpen(true);
      }
    }
    handleClose();
  };

  const handleUpdateSubmit = async (values) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/v1/products/${selectedProductId}`,
        values
      );
      if (response.status === 200) {
        toast.success("Product updated successfully");
        setIsUpdateModalOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("An error occurred while updating the product");
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
    handleClose();
  };

  const confirmDelete = async () => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/v1/products/${selectedProductId}`
      );
      if (response.status === 200) {
        toast.success("Product deleted successfully");
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("An error occurred while deleting the product");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleCategoryChange = (e) => {
    setSearchCategoryId(e.target.value);
    setFilters((prevFilters) => ({
      ...prevFilters,
      category: e.target.value,
      product_name: searchNameValue,
    }));
    setPages(0);
  };

  const handleNameChange = (e) => {
    setSearchNameValue(e.target.value);
    setFilters((prevFilters) => ({
      ...prevFilters,
      category: searchCategoryId,
      product_name: e.target.value,
    }));
    setPages(0);
  };

  const columns = [
    { field: "product_id", headerName: "ID", flex: 0.2 },
    {
      field: "image",
      headerName: "Image",
      flex: 1,
      renderCell: (params) => (
        <div>
          <img
            src={params.value}
            alt={` ${params.row.product_name}`}
            style={{ width: "200px", height: "130px", objectFit: "cover" }}
          />
        </div>
      ),
    },
    {
      field: "store_id",
      headerName: "Store",
      flex: 1,
      renderCell: (params) => {
        const store = stores.find(store => store.store_id === params.value);
        return store ? store.store_name : params.value;
      },
    },
    {
      field: "product_name",
      headerName: "Name",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "category_id",
      headerName: "Category",
      flex: 1,
      renderCell: (params) => {
        return params.value === 1
          ? "Food"
          : params.value === 2
          ? "Drink"
          : params.value;
      },
    },
    { 
      field: "description", 
      headerName: "Description", 
      flex: 1,
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
      field: "price",
      headerName: "Price",
      flex: 1,
      valueFormatter: (params) => {
        return new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(params.value);
      },
    },
    { field: "stock", headerName: "Stock", flex: 1 },
    {
      field: "action",
      headerName: "Action",
      flex: 0.5,
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <IconButton
            onClick={(event) => handleClick(event, params.row.product_id)}
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
            <MenuItem onClick={handleDelete}      disabled={isDeleteDisabled()}>
              Delete <DeleteIcon />
            </MenuItem>
          </Menu>
        </div>
      ),
    },
  ];
  return (
    <Box m="20px">
      <Header title="Products" subtitle="List of products" />
      <Box display="flex" alignItems="center" borderRadius="3px">
        <FormControl sx={{ minWidth: 100, mr: 2 }}>
          <InputLabel id="type-select-label">Category</InputLabel>
          <Select
            labelId="type-select-label"
            id="type-select"
            value={searchCategoryId}
            label="Type"
            onChange={handleCategoryChange}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="1">Food</MenuItem>
            <MenuItem value="2">Drink</MenuItem>
          </Select>
        </FormControl>
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
          onChange={handleNameChange}
        />
        <IconButton type="button" onClick={handleSearch}>
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
          
          onClick={() => navigate("/web/productform")}
          // disabled={isCreateDisabled()}
        >
          Create a new product
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
        <UpdateProduct
          open={isUpdateModalOpen}
          handleClose={() => setIsUpdateModalOpen(false)}
          product={editingProduct}
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
              Confirm Action
            </Typography>
            <Typography id="delete-modal-description" sx={{ mt: 2 }}>
              Are you sure to delete this product?
            </Typography>
            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
              <Button
                onClick={() => setIsDeleteModalOpen(false)}
                sx={{ mr: 2 }}
              >
              Cancel
              </Button>
              <Button onClick={confirmDelete} variant="contained" color="error">
                Delete
              </Button>
            </Box>
          </Box>
        </Modal>
        <DataGrid
          rows={data}
          columns={columns}
          getRowId={(row) => row.product_id}
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          pageSizeOptions={[4, 6, 8]}
          rowCount={total}
          paginationMode="server"
          
          loading={loading}
          autoHeight
          rowHeight={120}
          sx={{
            "& .MuiDataGrid-cell": {
              fontSize: "15px",
            },
            "& .MuiDataGrid-columnHeaders": {
              fontSize: "15px",
            },
          }}
        />
        <Box mt="20px">
          <Typography variant="body1">
            Page {pages + 1} of {totalPages}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Product;
