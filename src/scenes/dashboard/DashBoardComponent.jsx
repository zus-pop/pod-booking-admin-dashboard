import {
  Box,
  Button,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Header, StatBox } from "../../components";
import {
  ContactsOutlined,

  Email,
  Inventory2Outlined,

} from "@mui/icons-material";
import { tokens } from "../../theme";

import { useState, useEffect } from "react";
import axios from "axios";
import WeekRevenueChart from "../chart/WeekRevenueChart";
import PieChart from "../chart/PieChart";

import { useNavigate } from "react-router-dom";


function Dashboard() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isXlDevices = useMediaQuery("(min-width: 1260px)");
  const isMdDevices = useMediaQuery("(min-width: 724px)");
  const API_URL = import.meta.env.VITE_API_URL;
  const [total, setTotal] = useState(0);
  const [totalProduct, setTotalProduct] = useState(0);
  const [totalPod, setTotalPod] = useState(0);
  const naviggate = useNavigate()
  const [data, setData] = useState([]);
  useEffect(() => {
    fetchData();
    fetchTotal();
    fetchTotalProduct();
    fetchTotalPod();
  }, []);

  const fetchData = async () => {
    try {
      const result = await axios.get(`${API_URL}/api/v1/payments`);

      setData(result.data.payments);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };
  const fetchTotal = async () => {
    try {

      const result = await axios.get(`${API_URL}/api/v1/stores`);
      
      setTotal(result.data.total);
 
    } catch (error) {
      console.error("Error fetching data:", error.message);
    
    } 
  };
  const fetchTotalProduct = async () => {
    try {

      const result = await axios.get(`${API_URL}/api/v1/products/total-quantity`);
      
      setTotalProduct(result.data.totalQuantitySold);
 
    } catch (error) {
      console.error("Error fetching data:", error.message);
    
    } 
  };
  const fetchTotalPod = async () => {
    try {
      const result = await axios.get(`${API_URL}/api/v1/bookings/bookings-count-by-pod`);
      const totalPodCount = result.data.reduce((acc, pod) => acc + pod.booking_count, 0);
      setTotalPod(totalPodCount);
    } catch (error) {
      console.error("Error fetching total POD count:", error.message);
    }
  };
  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
      </Box>

    
      <Box
        display="grid"
        gridTemplateColumns={
          isXlDevices
            ? "repeat(12, 1fr)"
            : isMdDevices
            ? "repeat(6, 1fr)"
            : "repeat(3, 1fr)"
        }
        gridAutoRows="140px"
        gap="20px"
      >
      
        <Box
          gridColumn="span 4"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={total}
            subtitle="Store"
            
            icon={
              <Email
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 4"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={totalProduct}
            subtitle="Product Saled"
          
            icon={
              <Inventory2Outlined
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
       
        <Box
          gridColumn="span 4"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={totalPod}
            subtitle="POD Booked"
            
            icon={
              <ContactsOutlined
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
      </Box>

     
<Box
  display="flex"
  gap="10px"
  flexDirection={isXlDevices ? "row" : "column"}
>
  <WeekRevenueChart />
  <PieChart />
</Box>

      {/* Add POD Usage Chart */}


      <Box
        mt="15px"
        gridColumn={isXlDevices ? "span 4" : "span 3"}
        gridRow="span 2"
        bgcolor={colors.primary[400]}
        overflow="auto"
      >
        <Box borderBottom={`4px solid ${colors.primary[500]}`} p="15px">
          <Typography color={colors.gray[100]} variant="h5" fontWeight="600">
            Recent Transactions
          </Typography>
        </Box>

        {data.map((transaction, index) => (
          <Box
            key={`${transaction.transaction_id}-${index}`}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            borderBottom={`4px solid ${colors.primary[500]}`}
            p="15px"
          >
            <Box>
              <Typography
                color={colors.greenAccent[500]}
                variant="h5"
                fontWeight="600"
              >
                {transaction.transaction_id}
              </Typography>
              <Typography
                color={colors.gray[100]}
                variant="subtitle2"
              >
                Booking ID: {transaction.booking_id}
              </Typography>
            </Box>
            <Typography color={colors.gray[100]}>
              {transaction.payment_date}
            </Typography>
            <Box
              bgcolor={colors.greenAccent[500]}
              p="5px 10px"
              borderRadius="4px"
            >
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(transaction.total_cost)}
            </Box>
          </Box>
        ))}
      </Box>

    </Box>
  );
}

export default Dashboard;
