import {
  Box,
  useTheme,
  Typography,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputBase,
  IconButton,
  Button,
  Menu,
  FormControlLabel,
  Switch,
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
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import { ToastContainer, toast } from "react-toastify";
import * as Yup from "yup";
import { useRole } from "../../RoleContext";
const API_URL = import.meta.env.VITE_API_URL;

const Slots = () => {
  const { userRole } = useRole();
  const theme = useTheme();
  const { pod_id } = useParams();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [data, setData] = useState([]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const updateSlotSchema = Yup.object().shape({
    price: Yup.number().required("Giá là bắt buộc"),
  });
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const result = await axios.get(`${API_URL}/api/v1/slots`);

      setData(result.data);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  const handleClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setEditingSlot(id);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const isActionDisabled = () => {
    switch (userRole) {
      case "Staff":
        return true;
      default:
        return true;
    }
  };


  const handleUpdate = () => {
    if (editingSlot) {
      const slotToUpdate = data.find((slot) => slot.slot_id === editingSlot);
      if (slotToUpdate) {
        setEditingSlot(slotToUpdate);
        setIsModalOpen(true);
      }
    }
    handleClose();
  };

  const handleSlotUpdate = async (values) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/v1/slots/${editingSlot.slot_id}`,
        {
          ...values,
        }
      );
      console.log(response.data);
      if (response.status === 200) {
        toast.success("Cập nhật slot thành công");
        fetchData();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật slot:", error);
      toast.error("Có lỗi xảy ra khi cập nhật slot");
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
    handleClose();
  };

  const confirmDelete = async () => {
    if (editingSlot) {
      try {
        const response = await axios.delete(
          `${API_URL}/api/v1/slots/${editingSlot}`
        );
        if (response.status === 201) {
          toast.success("Xóa slot thành công");
          fetchData();
        }
      } catch (error) {
        console.error("Lỗi khi xóa slot:", error);
        toast.error("Có lỗi xảy ra khi xóa slot");
      }
    }
    setIsDeleteModalOpen(false);
  };

  const columns = [
    { field: "slot_id", headerName: "ID", flex: 0.5 },
    {
      field: "start_time",
      headerName: "Start",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "end_time",
      headerName: "End",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "price",
      headerName: "Price",
      flex: 1,
    },
    {
      field: "is_available",
      headerName: "Available",
      flex: 0.5,
      renderCell: (params) => {
        return params.value ? "Yes" : "No";
      },
    },
    {
      field: "action",
      headerName: "Action",
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <IconButton
            onClick={(event) => handleClick(event, params.row.slot_id)}
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
    <Box m="20px">
      <Header title="Slots" subtitle="List of slots of POD " />
      <ToastContainer />
      <Box
        display="flex"
        alignItems="center"
        borderRadius="3px"
        sx={{ display: "flex" }}
      >
        <Button
          variant="contained"
          color="primary"
          sx={{ ml: "auto" }}
          onClick={() => navigate(`/web/pod/${pod_id}/slot`)}
          disabled={isActionDisabled()}
        >
          Generate Slot
        </Button>
      </Box>
      {isModalOpen && editingSlot && (
        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
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
            }}
          >
            <Typography variant="h6" component="h2">
              Cập nhật Slot
            </Typography>
            <Formik
              initialValues={{
                price: editingSlot.price,
              }}
              validationSchema={updateSlotSchema}
              onSubmit={handleSlotUpdate}
            >
              {({ errors, touched }) => (
                <Form>
                  <Field
                    name="price"
                    as={TextField}
                    label="Giá"
                    fullWidth
                    margin="normal"
                    error={touched.price && errors.price}
                    helperText={touched.price && errors.price}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                  >
                    Cập nhật
                  </Button>
                </Form>
              )}
            </Formik>
          </Box>
        </Modal>
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
            Bạn có chắc chắn muốn xóa slot này không?
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
          getRowId={(row) => row.slot_id}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
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

export default Slots;
