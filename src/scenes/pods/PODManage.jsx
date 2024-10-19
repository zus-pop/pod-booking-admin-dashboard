import { Box, InputLabel, useTheme, FormControl } from "@mui/material";
import { Header } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useState, useEffect } from "react";
import { IconButton, InputBase, Button, Typography } from "@mui/material";
import { Select, MenuItem } from "@mui/material";
import { SearchOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

const PODManage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const navigate = useNavigate();

  const [data, setData] = useState([]);

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

  useEffect(() => {
    console.log(3);
    fetchData();
  }, [pages, pageSize,filters]);

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
        formattedData = result.data.pods.map((pod) => ({
          pod_id: pod.pod_id,
          pod_name: pod.pod_name,
          pod_type: pod.type.type_name,
          pod_available: pod.is_available,
        }));
      } else if (result.data && typeof result.data === "object") {
        formattedData = [
          {
            pod_id: result.data.pod_id,
            pod_name: result.data.pod_name,
            pod_type: result.data.type.type_name,
            pod_available: result.data.is_available,
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
        console.error("Không tìm thấy POD với tên đã cho.");
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

  const handleSearch = () => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      name: searchNameValue,
      type_id: searchTypeId,
    }));
    setPages(0);
    fetchData();
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
      flex: 1.5,
      align: "left",
    },
    { field: "pod_available", headerName: "Available", flex: 1 },
  ];
  return (
    <Box m="20px">
      <Header title="POD Management" subtitle="Managing the POD" />

      <Box display="flex" alignItems="center" borderRadius="3px">
        <FormControl sx={{ minWidth: 80, mr: 2 }}>
          <InputLabel id="type-select-label">Type</InputLabel>
          <Select
            labelId="type-select-label"
            id="type-select"
            value={searchTypeId}
            label="Type"
            onChange={(e) => setSearchTypeId(e.target.value)}
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
          sx={{ ml: "auto" }}
          onClick={() => navigate("/web/podform")}
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
      <Box mt="20px">
        <Typography variant="body1">
          Page {pages + 1} of {totalPages}
        </Typography>
      </Box>
    </Box>
  );
};

export default PODManage;
