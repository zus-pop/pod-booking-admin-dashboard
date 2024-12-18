import { Box, useTheme } from "@mui/material";
import { Line } from "react-chartjs-2";
import { tokens } from "../../theme";
import { useState, useEffect } from "react";
import axios from "axios";
import { Header } from "../../components";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const API_URL = import.meta.env.VITE_API_URL;

const WeekRevenueChart = () => {
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
      const response = await axios.get(`${API_URL}/api/v1/payments/daily-revenue`);
      const data = response.data;
  
      // Sắp xếp dữ liệu theo ngày tăng dần
      const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));
  
      // Lấy 7 ngày gần nhất
      const last7Days = sortedData.slice(-7);
  
      // Format ngày thành dd/MM/yyyy
      const labels = last7Days.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      });
      const revenues = last7Days.map(item => item.daily_revenue);
  
      setChartData({
        labels,
        datasets: [
          {
            label: 'Daily Revenue',
            data: revenues,
            borderColor: colors.greenAccent[500],
            backgroundColor: `${colors.greenAccent[500]}33`,
            tension: 0.4,
            fill: true,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: colors.greenAccent[500],
            pointBorderColor: colors.primary[400],
            pointBorderWidth: 2,
          }
        ]
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: colors.gray[100]
        }
      }
    },
    scales: {
      y: {
        ticks: {
          color: colors.gray[100],
          callback: (value) => new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(value)
        },
        grid: {
          color: colors.gray[700]
        }
      },
      x: {
        ticks: {
          color: colors.gray[100]
        },
        grid: {
          color: colors.gray[700]
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
      width="50%"
    >
      <Header
        title="Last 7 Days Revenue"
        subtitle="Overview of daily revenue for the past 7 days"
      />
      <Line data={chartData} options={options} />
    </Box>
  );
};

export default WeekRevenueChart;