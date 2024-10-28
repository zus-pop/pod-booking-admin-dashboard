import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  Modal,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Header } from "../../components";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import UpdateStorePrice from "../form/UpdateStorePrice";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import UpdateIcon from "@mui/icons-material/Update";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast, ToastContainer } from "react-toastify";
import { useRole } from "../../RoleContext";
const API_URL = import.meta.env.VITE_API_URL;

const StatBox = styled(Box)(({ theme }) => ({
  backgroundColor: "#1F2A40",
  borderRadius: "8px",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  height: "200px",
  width: "250px",
  margin: "10px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
}));

const StoreDetail = () => {
  const { userRole } = useRole();
  const { id } = useParams();
  const [storeDetail, setStoreDetail] = useState(null);
  const [pods, setPods] = useState([]);
  const navigate = useNavigate();
  const [storePrices, setStorePrices] = useState([]);

  const [editingStorePrice, setEditingStorePrice] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingStorePrice, setDeletingStorePrice] = useState(null);
  const [selectedTypeId, setSelectedTypeId] = useState("");
  useEffect(() => {
    const fetchStoreDetail = async () => {
      const result = await axios.get(`${API_URL}/api/v1/stores/${id}`);

      setStoreDetail(result.data);
    };

    const fetchPods = async () => {
      const result = await axios.get(`${API_URL}/api/v1/stores/${id}/pods`);

      setPods(result.data.pods);
    };

    fetchStoreDetail();
    fetchPods();
  }, [id]);

  const fetchStorePrices = async (typeId) => {
    try {
      const result = await axios.get(
        `${API_URL}/api/v1/stores/${id}/pod-type/${typeId}/prices`
      );
      let formattedData;
      if (Array.isArray(result.data.storePrices)) {
        formattedData = result.data.storePrices.map((storePrice) => ({
          id: storePrice.id,
          start_hour: storePrice.start_hour,
          end_hour: storePrice.end_hour, //  note
          price: storePrice.price,
          days_of_week: storePrice.days_of_week,
          type_name: storePrice.type.type_name,
          type: storePrice.type.type_id,
          priority: storePrice.priority,
        }));
      }  else {
        formattedData = [];
      }
      setStorePrices(formattedData);
      console.log("Fetched store prices:", formattedData);
      
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setStorePrices([]);
        console.log("Không tìm thấy giá cửa hàng, đặt mảng rỗng");
      } else {
        console.error("Lỗi khi lấy giá cửa hàng:", error.message);
      }
    }
  };

  const handleClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setEditingStorePrice(id);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTypeIdChange = (event) => {
    const typeId = event.target.value;
    setSelectedTypeId(typeId);
    if (typeId) {
      fetchStorePrices(typeId);
    } else {
      setStorePrices([]);
    }
  };

  const handleUpdate = () => {
    const storePriceToUpdate = storePrices.find(
      (slot) => slot.id === editingStorePrice
    );
    if (storePriceToUpdate) {
      setEditingStorePrice(storePriceToUpdate);
      setIsUpdateModalOpen(true);
    }
    handleClose();
  };

  const handleUpdateSubmit = async (values) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/v1/store-prices/${editingStorePrice}`,
        values
      );
      if (response.status === 200) {
        toast.success("Cập nhật giá cửa hàng thành công");
        setIsUpdateModalOpen(false);
        fetchData(); // Refresh data after update
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật giá cửa hàng:", error);
      toast.error("Có lỗi xảy ra khi cập nhật giá cửa hàng");
    }
  };

  const handleDelete = () => {
    setDeletingStorePrice(editingStorePrice);
    setIsDeleteModalOpen(true);
    handleClose();
  };

  const confirmDelete = async () => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/v1/store-prices/${deletingStorePrice}`
      );
      if (response.status === 201) {
        toast.success("Xóa giá cửa hàng thành công");
        fetchStorePrices(selectedTypeId);
      }
    } catch (error) {
      console.error("Lỗi khi xóa giá cửa hàng:", error);
      toast.error("Có lỗi xảy ra khi xóa giá cửa hàng");
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingStorePrice(null);
    }
  };

    
  const isActionDisabled = () => {
    switch (userRole) {
      case "Staff":
        return true;
      case "Manager":
        return true;
      case "Admin":
        return false;
      default:
        return true;
    }
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },

    {
      field: "type_name",
      headerName: "POD Type",
      flex: 1,
  
    },
    { field: "start_hour", headerName: "Start Hour", flex: 1 },
    { field: "end_hour", headerName: "End Hour", flex: 1 },
    { field: "price", headerName: "Price", flex: 1 },
    {
      field: "days_of_week",
      headerName: "Days of Week",
      flex: 2,
      valueGetter: (params) => {
        const days = params.value;
        const allDays = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];

        if (days.length === 7 && allDays.every((day) => days.includes(day))) {
          return "All days";
        } else {
          return days.join(", ");
        }
      },
    },
    {
      field: "priority",
      headerName: "Priority",
      flex: 0.5,
    },
    {
      field: "action",
      headerName: "Action",
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={(event) => handleClick(event, params.row.id)} disabled={isActionDisabled()}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={() => handleUpdate()}>
              Update <UpdateIcon />
            </MenuItem>
            <MenuItem onClick={handleDelete}>
              Delete <DeleteIcon />
            </MenuItem>
          </Menu>
        </div>
      ),
      flex: 1,
    },
  ];
  return (
    <Box mt="20px" ml="20px" height="100vh">
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <UpdateStorePrice
        open={isUpdateModalOpen}
        handleClose={() => setIsUpdateModalOpen(false)}
        initialValues={{
          price: editingStorePrice ? editingStorePrice.price : "",
          start_hour: editingStorePrice ? editingStorePrice.start_hour : "",
          end_hour: editingStorePrice ? editingStorePrice.end_hour : "",
          days_of_week: editingStorePrice ? editingStorePrice.days_of_week : [],
          type_id: editingStorePrice ? editingStorePrice.type_id : "",
          store_id: editingStorePrice ? editingStorePrice.store_id : "",
          priority: editingStorePrice ? editingStorePrice.priority : "",
        }}
        onSubmit={handleUpdateSubmit}
      />
      <Header title="Detail" subtitle="Detail of store" />
      <Box mb="20px" marginBottom={5}>
        <Box
          display="flex"
          alignItems="center"
          borderRadius="3px"
          marginBottom="20px"
        >
          <Typography variant="h4" gutterBottom>
            Store Prices of {storeDetail ? storeDetail.store_name : ""}
          </Typography>
          <FormControl sx={{ minWidth: 120, ml: 2 }}>
            <InputLabel id="type-select-label">POD Type</InputLabel>
            <Select
              labelId="type-select-label"
              id="type-select"
              value={selectedTypeId}
              label="POD Type"
              onChange={handleTypeIdChange}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value={1}>Single POD</MenuItem>
              <MenuItem value={2}>Double POD</MenuItem>
              <MenuItem value={3}>Meeting Room</MenuItem>
            </Select>
          </FormControl>
          {selectedTypeId && (
            <Button
              variant="contained"
              color="primary"
              sx={{ ml: "auto", mb: "10px" }}
              onClick={() =>
                navigate(`/web/stores/${id}/pod-type/${selectedTypeId}/storeprice-form`)
              }
              disabled={isActionDisabled()}
            >
              Create new price
            </Button>
          )}
        </Box>
        {selectedTypeId && (
          <DataGrid
            rows={storePrices}
            columns={columns}
            initialState={{
              ...storePrices.initialState,
              pagination: { paginationModel: { pageSize: 5 } },
            }}
            pageSizeOptions={[5, 10, 25]}
            autoHeight
            disableSelectionOnClick
            sx={{
              "& .MuiDataGrid-cell": {
                fontSize: "15px",
              },
              "& .MuiDataGrid-columnHeaders": {
                fontSize: "15px",
              },
            }}
          />
        )}
      </Box>
      {storeDetail && (
        <Box>
          <Typography variant="h4" sx={{ mb: 3, mt: 4 }}>
            PODs Overview of {storeDetail ? storeDetail.store_name : ""}
          </Typography>
          
          <Box 
            display="flex" 
            flexWrap="wrap"
            gap={2}
            justifyContent="flex-start"
          >
            {pods.map((pod) => (
              <StatBox key={pod.pod_id}>
                <Typography variant="h5" sx={{ color: "#4cceac", mb: 1 }}>
                  {pod.pod_name}
                </Typography>
                
                <Typography variant="body1" sx={{ color: "#fff", mb: 1 }}>
                  Type: {pod.type.type_name}
                </Typography>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: pod.is_available ? "#4cceac" : "#ff0000",
                    fontWeight: "bold" 
                  }}
                >
                  Status: {pod.is_available ? "Available" : "Occupied"}
                </Typography>
              </StatBox>
            ))}
          </Box>

        </Box>
      )}
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
            Xác nhận xóa
          </Typography>
          <Typography id="delete-modal-description" sx={{ mt: 2 }}>
            Bạn có chắc chắn muốn xóa giá cửa hàng này không?
          </Typography>
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={() => setIsDeleteModalOpen(false)} sx={{ mr: 2 }}>
              Hủy
            </Button>
            <Button onClick={confirmDelete} variant="contained" color="error">
              Xóa
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default StoreDetail;
