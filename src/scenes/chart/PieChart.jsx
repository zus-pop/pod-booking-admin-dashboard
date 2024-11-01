import { Box, useTheme } from "@mui/material";
import { Pie } from "react-chartjs-2";
import { tokens } from "../../theme";
import { useState, useEffect } from "react";
import axios from "axios";
import { Header } from "../../components";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const API_URL = import.meta.env.VITE_API_URL;

const PieChart = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/bookings/count-by-pod-type`);
      const data = response.data;
      
      setChartData({
        labels: data.map(item => item.type_name),
        datasets: [{
          data: data.map(item => item.booking_count),
          backgroundColor: [
            colors.greenAccent[500],
            colors.blueAccent[500],
            colors.gray[100]
          ],
          borderColor: colors.primary[400],
          borderWidth: 2
        }]
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: colors.gray[100]
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value} bookings`;
          }
        }
      }
    }
  };

  return (
    <Box
      bgcolor={colors.primary[400]}
      p={3}
      borderRadius={2}
      boxShadow={3}
      mt={2}
      height={500}
      width="60%"
      display="flex"
      flexDirection="column"
    >
      <Header
        title="Bookings by POD Type"
        subtitle="Distribution of bookings across different POD types"
      />
      <Box
        flex={1}
        position="relative"
        minHeight="350px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Pie data={chartData} options={options} />
      </Box>
    </Box>
  );
};

export default PieChart;