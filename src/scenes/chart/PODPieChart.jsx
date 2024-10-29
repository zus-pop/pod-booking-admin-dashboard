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
  Legend,
  Title
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Title
);

const API_URL = import.meta.env.VITE_API_URL;

const PODPieChart = () => {
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
      const response = await axios.get(`${API_URL}/api/v1/bookings/bookings-count-by-pod`);
      const labels = response.data.map(item => item.pod_name);
      const values = response.data.map(item => item.booking_count);
      
      setChartData({
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: [
              colors.greenAccent[500],
              colors.blueAccent[500],
              colors.gray[100],
              colors.greenAccent[300],
              colors.blueAccent[300],
              colors.gray[100],
              colors.greenAccent[700],
              colors.blueAccent[700],
              colors.gray[100],
            ],
            borderColor: colors.gray[100],
            borderWidth: 2,
          },
        ],
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
        position: 'bottom',
        labels: {
          color: colors.gray[100],
          padding: 20,
          font: {
            size: 14
          }
        }
      },
      title: {
        display: true,
        text: 'Bookings Distribution by POD',
        color: colors.gray[100],
        font: {
          size: 16
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
      height={800}
      width="50%"
    >
      <Header
        title="Bookings by POD"
        subtitle="Distribution of bookings across different PODs"
      />
      <Box height="700px">
        <Pie data={chartData} options={options} />
      </Box>
    </Box>
  );
};

export default PODPieChart;