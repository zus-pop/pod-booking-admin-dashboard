import { Box, useTheme,Typography, FormControl, InputLabel,Select,MenuItem,InputBase,IconButton,Button} from "@mui/material";
import { Header } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useState, useEffect } from 'react';
import axios from "axios";
import { SearchOutlined } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

const Slots = () => {
  const theme = useTheme();
  const { pod_id   } = useParams();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [data, setData] = useState([]);


  const [loading, setLoading] = useState(false);
  
  
  useEffect(() => {
    fetchData();
  }, []); 

  const fetchData = async () => {
    try {
    
      const result = await axios.get(`${API_URL}/api/v1/slots`);

      setData(result.data);

    } catch (error) {
      console.error('Error fetching data:', error.message);
    
    } 
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
            return params.value  ? "Yes" :  "No";
          },
    },
    {
        field: "detail",
        headerName: "Detail",
        renderCell: (params) => (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/web/booking/${params.row.booking_id}`)}
            >
              Edit 
            </Button>
            
         
          </div>
        ),
        flex: 0.5,
      },
  

  ];
  return (
    <Box m="20px">
      <Header
        title="Slots"
        subtitle="List of slots of POD "
      />
       <Box
        display="flex"
        alignItems="center"
        borderRadius="3px"
        sx={{ display: "flex"} }
      >
        <Button
          variant="contained"
          color="primary"
          sx={{ ml: 'auto' }} 
          onClick={() => navigate(`/web/pod/${pod_id}/slot`)} 
        >
          Generate Slot
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