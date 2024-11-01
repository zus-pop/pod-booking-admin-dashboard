import {
  Box,
  InputLabel,
  useTheme,
  FormControl,
  Modal,
  Menu,
  IconButton,
  InputBase,
  Button,
  Typography,
} from "@mui/material";
import { Header } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useState, useEffect } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import UpdateIcon from "@mui/icons-material/Update";
import DeleteIcon from "@mui/icons-material/Delete";
import { Select, MenuItem } from "@mui/material";
import { SearchOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UpdatePOD from "../form/UpdatePOD";
import "react-toastify/dist/ReactToastify.css";
import { useRole } from "../../RoleContext";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const PODManage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { userRole } = useRole();
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [podUtilities, setPodUtilities] = useState([]);

  const [searchNameValue, setSearchNameValue] = useState("");
  const [searchTypeId, setSearchTypeId] = useState("");

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
    name: "",
    type_id: "",
    orderBy: "pod_id",
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPodId, setSelectedPodId] = useState(null);
  const [editingPod, setEditingPod] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedPodId(id);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
    return userRole === "Manager";
  };
  useEffect(() => {
    fetchData();
  }, [pages, pageSize, filters]);

  const fetchPodUtilities = async (podId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/v1/pods/${podId}/utilities`
      );
      return response.data;
    } catch (error) {
      console.error(`Error when get POD ${podId}:`, error);
      return [];
    }
  };
  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await axios.get(`${API_URL}/api/v1/pods`, {
        params: {
          name: filters.name,
          type_id: filters.type_id,
          limit: pageSize,
          page: pages + 1,
          orderBy: filters.orderBy,
        },
      });
      let formattedData;
      if (Array.isArray(result.data.pods)) {
        formattedData = await Promise.all(
          result.data.pods.map(async (pod) => {
            const utilities = await fetchPodUtilities(pod.pod_id);
            return {
              pod_id: pod.pod_id,
              pod_name: pod.pod_name,
              pod_type: pod.type.type_name,
              pod_available: pod.is_available,
              image: pod.image,
              type_id: pod.type.type_id,
              store_id: pod.store.store_id,
              store_name: pod.store.store_name,
              description: pod.description,
              utilities: utilities,
            };
          })
        );
      } else {
        formattedData = [];
      }

      setData(formattedData);
      setTotal(result.data.total);
      console.log("Formatted data:", formattedData);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.error("POD with given name not found.");
        setData([]);
      } else {
        console.error("Error fetching data:", error.message);
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

  const handleTypeChange = (e) => {
    setSearchTypeId(e.target.value);
    setFilters((prevFilters) => ({
      ...prevFilters,
      type_id: e.target.value,
    }));
    setPages(0);
  };

  const handleNameChange = (e) => {
    setSearchNameValue(e.target.value);
    setFilters((prevFilters) => ({
      ...prevFilters,
      name: e.target.value,
    }));
    setPages(0);
  };

  const handleUpdate = () => {
    if (selectedPodId) {
      const podToUpdate = data.find((pod) => pod.pod_id === selectedPodId);
      if (podToUpdate) {
        setEditingPod(podToUpdate);
        setIsUpdateModalOpen(true);
      } else {
        console.error("POD not found for ID:", selectedPodId);
      }
    }
    handleClose();
  };

  const handleUpdateSubmit = async (values) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/v1/pods/${selectedPodId}`,
        values
      );
      if (response.status === 200) {
        toast.success("POD updated successfully");
        setIsUpdateModalOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error("Error updating POD:", error);
      toast.error("An error occurred while updating POD");
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
    handleClose();
  };

  const confirmDelete = async () => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/v1/pods/${selectedPodId}`
      );
      if (response.status === 200) {
        toast.success("POD deleted successfully");
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting POD:", error);
      toast.error("An error occurred while deleting POD");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleSearch = () => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      name: searchNameValue,
      type_id: searchTypeId,
    }));
    setPages(0);
  };

  const columns = [
    { field: "pod_id", headerName: "POD_ID" },
    {
      field: "image",
      headerName: "Image",
      flex: 1,
      renderCell: (params) => (
        <div>
          <img
            src={params.value}
            alt={` ${params.row.pod_name}`}
            style={{ width: "200px", height: "120px", objectFit: "cover" }}
          />
        </div>
      ),
    },
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
      flex: 1.5,
      align: "left",
    },
    {
      field: "utilities",
      headerName: "Utilities",
      flex: 1.5,
      renderCell: (params) => (
        <div>
          {params.value.map((utility) => (
            <div key={utility.utility_id}>{utility.utility_name}</div>
          ))}
        </div>
      ),
    },
    {
      field: "pod_available",
      headerName: "Available",
      flex: 1,
      renderCell: (params) => {
        return params.value ? "Yes" : "No ";
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/web/pod/${params.row.pod_id}`)}
          >
            View Slots
          </Button>

          <IconButton
            onClick={(event) => handleClick(event, params.row.pod_id)}
            disabled={isActionDisabled()}
          >
            <MoreVertIcon />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <IconButton
              onClick={() => handleUpdate(params.row.id)}
              sx={{
                borderRadius: "4px", 
                "&:hover": {
                 
                  borderRadius: "4px",
                },
                width: "100%", 
                justifyContent: "flex-start", 
                padding: "8px 16px", 
                
              }}
            >
              <Typography sx={{ fontSize: "16px", mr: 1 }}>Update</Typography>
              <UpdateIcon />
            </IconButton>

            <br />
            <IconButton
              onClick={() => handleDelete(params.row.id)}
              disabled={isDeleteDisabled()}
              sx={{
                borderRadius: "4px", 
                "&:hover": {
                 
                  borderRadius: "4px",
                },
                width: "100%", 
                justifyContent: "flex-start", 
                padding: "8px 16px", 
               
              }}
            >
              <Typography sx={{ fontSize: "16px", mr: 1 }}>Delete</Typography>
              <DeleteIcon />
            </IconButton>
          </Menu>
        </div>
      ),
      flex: 1,
    },
  ];
  return (
    <Box m="20px">
      <Header title="POD Management" subtitle="Managing the POD" />

      <UpdatePOD
        open={isUpdateModalOpen}
        handleClose={() => setIsUpdateModalOpen(false)}
        pod={editingPod}
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
            Are you sure you want to delete this POD?
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
      <Box display="flex" alignItems="center" borderRadius="3px">
        <FormControl sx={{ minWidth: 80, mr: 2 }}>
          <InputLabel id="type-select-label">Type</InputLabel>
          <Select
            labelId="type-select-label"
            id="type-select"
            value={searchTypeId}
            label="Type"
            onChange={handleTypeChange}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="1">Single POD</MenuItem>
            <MenuItem value="2">Double POD</MenuItem>
            <MenuItem value="3">Meeting Room</MenuItem>
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
           variant="outlined"
           sx={{ ml: "auto" ,  
             color: colors.gray[100],
             
             borderColor: colors.gray[100],
             '&:hover': {
               borderColor: colors.greenAccent[500],
               color: colors.greenAccent[500],
             }}}
          onClick={() => navigate("/web/podform")}
          disabled={isActionDisabled()}
        >
          Create POD
        </Button>
      </Box>

      <Box
        mt="40px"
        flex={1}
        sx={{
          height: "auto",
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
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          pageSizeOptions={[4, 6, 8]}
          rowCount={total}
          paginationMode="server"
          rowHeight={120}
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
      <Box mt="20px">
        <Typography variant="body1">
          Page {pages + 1} of {totalPages}
        </Typography>
      </Box>
    </Box>
  );
};

export default PODManage;
