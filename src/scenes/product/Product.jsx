import { Box, useTheme,Typography, FormControl, InputLabel,Select,MenuItem,InputBase,IconButton} from "@mui/material";
import { Header } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useState, useEffect } from 'react';
import axios from "axios";
import { SearchOutlined } from "@mui/icons-material";
const API_URL = import.meta.env.VITE_API_URL;

const Product = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [data, setData] = useState([]);
  const [total,setTotal] = useState(0);
  const [pages,setPages] = useState(0);
  const [pageSize,setPageSize] = useState(4);
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
  const [searchCategoryId,setSearchCategoryId]=useState("");
  const [searchNameValue,setSearchNameValue]=useState("");

  useEffect(() => {
    fetchData();
  }, [pages,pageSize,filters]); 

  const fetchData = async () => {
    try {
      setLoading(true)
      const result = await axios.get(`${API_URL}/api/v1/products`, {
        params: {
          limit: pageSize,
          page: pages + 1,
          product_name: filters.product_name,
          category_id: filters.category,
        }
      });

      setData(result.data.products);
      setTotal(result.data.total)
    } catch (error) {
      console.error('Error fetching data:', error.message);
      if (error.response && error.response.status === 404) {
        console.error("Không tìm thấy POD với tên đã cho.");
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

  
  const handleSearch = () => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      category: searchCategoryId,
      product_name: searchNameValue,
    }));
    setPages(0);
    fetchData();
  };

  const columns = [
    { field: "product_id", headerName: "ID", flex: 1 },
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
        return params.value === 1 ? "Food" : params.value === 2 ? "Drink" : params.value;
      },
    },
    {
      field: "price",
      headerName: "Price",
      flex: 1,
    },

  ];
  return (
    <Box m="20px">
      <Header
        title="Products"
        subtitle="List of products"
      />
       <Box display="flex" alignItems="center" borderRadius="3px">
        <FormControl sx={{ minWidth: 100, mr: 2 }}>
          <InputLabel id="type-select-label">Category</InputLabel>
          <Select
            labelId="type-select-label"
            id="type-select"
            value={searchCategoryId}
            label="Type"
            onChange={(e) => setSearchCategoryId(e.target.value)}
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
           getRowId={(row) => row.product_id}
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
