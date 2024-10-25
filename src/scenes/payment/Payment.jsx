import { Box, useTheme,Typography,FormControl,InputLabel,Select,MenuItem,InputBase,IconButton, } from "@mui/material";
import { Header } from "../../components";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useState, useEffect } from 'react';
import axios from "axios";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Alert } from "@mui/material";
import { SearchOutlined } from "@mui/icons-material";
const Payment = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const API_URL = import.meta.env.VITE_API_URL
  const [data, setData] = useState([]);

    
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);

  const [pageSize, setPageSize] = useState(4);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: pageSize,
    page: pages,
  });
  const totalPages = Math.ceil(total / pageSize);
  const [loading, setLoading] = useState(false);

  
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchByStatus, setSearchByStatus] = useState("");
  const [filters, setFilters] = useState({
    payment_status: "",
    payment_date: "",
  });

  const [dateError, setDateError] = useState("");

  useEffect(() => {
    fetchData();
  }, [pages, pageSize,filters]); 

  const fetchData = async () => {
    try {
      setLoading(true)
      const result = await axios.get(`${API_URL}/api/v1/payments`,{
        params: { limit: pageSize,
        page: pages + 1,
        payment_status: filters.payment_status,
        payment_date: filters.payment_date, 
        }
      });

      setData(result.data.payments);
      setTotal(result.data.total);
      console.log(result.data.payments)
    } catch (error) {
      console.error('Error fetching data:', error.message);
      if (error.response && error.response.status === 404) {
        console.error("Không tìm thấy Store với tên đã cho.");
        setData([]);
      }
    } finally {
      setLoading(false)
    }
  };
  const handlePaginationModelChange = (newPaginationModel) => {
    setPaginationModel(newPaginationModel);
    setPages(newPaginationModel.page);
    setPageSize(newPaginationModel.pageSize);
  };
  
  const validateDate = (date) => {
    if (date) {
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      if (!regex.test(date)) {
        setDateError("Vui lòng nhập ngày theo định dạng YYYY-MM-DD");
        return false;
      }
      setDateError("");
      return true;
    }
    setDateError("");
    return true;
  };

  const handleSearch = () => {
    if (validateDate(selectedDate)) {
      const adjustedDate = selectedDate
        ? new Date(selectedDate).toISOString().split('T')[0]
        : "";
      setFilters((prevFilters) => ({
        ...prevFilters,
        payment_status: searchByStatus, 
        payment_date: adjustedDate,
      }));
      fetchData();
    }
  };

  const columns = [
    { field: "payment_id", headerName: "Payment_ID", flex: 1, },
    {
      field: "transaction_id",
      headerName: "Transaction_ID",
      flex: 1,
      cellClassName: "name-column--cell",
    },

    {
      field: "total_cost",
      headerName: "Total Cost",
      flex: 1,
      valueFormatter: (params) => {
        return new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
         
        }).format(params.value)
      }
    },

    {
      field: "payment_date",
      headerName: "Date",
      flex: 1,
      
    },
    
    {
      field: "payment_status",
      headerName: "Status",
      flex: 1,
    },
  ];
  return (
    <Box m="20px">
      <Header
        title="Payment"
        subtitle="Manage Payment Data"
      />
      <Box
        display="flex"
        alignItems="center"
        borderRadius="3px"
        sx={{ display:"flex" }}
      >
        <FormControl sx={{ minWidth: 200, mr: 2 }}>
          <InputLabel id="type-select-label">Payment Status</InputLabel>
          <Select
            labelId="type-select-label"
            id="type-select"
            value={searchByStatus}
            onChange={(e) => setSearchByStatus(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Paid">Paid</MenuItem>
            <MenuItem value="Failed">Failed</MenuItem>
            <MenuItem value="Unpaid">Unpaid</MenuItem>

          </Select>
        </FormControl>
        <ReactDatePicker
          selected={selectedDate}
          onChange={(date) => {
            const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
            const dateString = localDate.toISOString().split('T')[0];
            setSelectedDate(dateString);
            validateDate(dateString);
          }}
          dateFormat="yyyy-MM-dd"
          placeholderText="Select Date YYYY-MM-DD"
          customInput={<InputBase />}
          onChangeRaw={(e) => {
            setSelectedDate(e.target.value);
            validateDate(e.target.value);
          }}
        />
        <IconButton type="button" onClick={handleSearch}>
          <SearchOutlined />
        </IconButton>
      </Box>
      {dateError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {dateError}
        </Alert>
      )}
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
          getRowId={(row) => row.payment_id}        
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

export default Payment;
