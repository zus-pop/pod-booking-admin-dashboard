import { Box, useTheme, FormControl, Select, MenuItem, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
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

const ProductRevenueChart = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });
  const [chartType, setChartType] = useState('daily');
  const [monthlyData, setMonthlyData] = useState({
    labels: [],
    datasets: []
  });
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    if (chartType === 'daily') {
      fetchDailyData();
    } else {
      fetchMonthlyData();
    }
  }, [chartType, selectedMonth]);

  const fetchDailyData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/products/daily-total-revenue`);
      let data = response.data;

      data = data.filter(item => item.date !== null);

      if (selectedMonth !== 'all') {
        data = data.filter(item => {
          const date = new Date(item.date);
          const month = date.getMonth() + 1;
          const year = date.getFullYear();
          const currentYear = new Date().getFullYear();
          return month === parseInt(selectedMonth) && year === currentYear;
        });
      }

      // Tính tổng doanh thu
      const total = data.reduce((sum, item) => sum + item.daily_revenue, 0);
      setTotalRevenue(total);

      if (!data || data.length === 0) {
        setChartData({
          labels: ['No data'],
          datasets: [{
            label: 'Daily Product Revenue',
            data: [0],
            borderColor: colors.greenAccent[500],
            backgroundColor: `${colors.greenAccent[500]}33`,
            tension: 0.4,
            fill: true,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: colors.greenAccent[500],
            pointBorderColor: colors.primary[400],
            pointBorderWidth: 2,
          }]
        });
        return;
      }

      const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));

      setChartData({
        labels: sortedData.map(item => {
          const date = new Date(item.date);
          return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        }),
        datasets: [{
          label: 'Daily Product Revenue',
          data: sortedData.map(item => item.daily_revenue),
          borderColor: colors.greenAccent[500],
          backgroundColor: `${colors.greenAccent[500]}33`,
          tension: 0.4,
          fill: true,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: colors.greenAccent[500],
          pointBorderColor: colors.primary[400],
          pointBorderWidth: 2,
        }]
      });
    } catch (error) {
      console.error("Error fetching daily data:", error);
      setTotalRevenue(0);
      setChartData({
        labels: ['Error loading data'],
        datasets: [{
          label: 'Daily Product Revenue',
          data: [0],
          borderColor: colors.greenAccent[500],
          backgroundColor: `${colors.greenAccent[500]}33`,
          tension: 0.4,
          fill: true,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: colors.greenAccent[500],
          pointBorderColor: colors.primary[400],
          pointBorderWidth: 2,
        }]
      });
    }
  };

  const fetchMonthlyData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/products/monthly-revenue`);
      const data = response.data;

      // Tính tổng doanh thu
      const total = data.reduce((sum, item) => sum + item.monthly_revenue, 0);
      setTotalRevenue(total);

      if (data.length === 0) {
        setMonthlyData({
          labels: ['No data'],
          datasets: [{
            label: 'Monthly Product Revenue',
            data: [0],
            borderColor: colors.greenAccent[500],
            backgroundColor: `${colors.greenAccent[500]}33`,
            tension: 0.4,
            fill: true,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: colors.greenAccent[500],
            pointBorderColor: colors.primary[400],
            pointBorderWidth: 2,
          }]
        });
        return;
      }

      setMonthlyData({
        labels: data.map(item => `${item.month}`),
        datasets: [{
          label: 'Monthly Product Revenue',
          data: data.map(item => item.monthly_revenue),
          borderColor: colors.greenAccent[500],
          backgroundColor: `${colors.greenAccent[500]}33`,
          tension: 0.4,
          fill: true,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: colors.greenAccent[500],
          pointBorderColor: colors.primary[400],
          pointBorderWidth: 2,
        }]
      });
    } catch (error) {
      console.error("Error fetching monthly data:", error);
      setTotalRevenue(0);
      setMonthlyData({
        labels: ['Error loading data'],
        datasets: [{
          label: 'Monthly Product Revenue',
          data: [0],
          borderColor: colors.greenAccent[500],
          backgroundColor: `${colors.greenAccent[500]}33`,
          tension: 0.4,
          fill: true,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: colors.greenAccent[500],
          pointBorderColor: colors.primary[400],
          pointBorderWidth: 2,
        }]
      });
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: colors.gray[100],
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: colors.primary[400],
        titleColor: colors.gray[100],
        bodyColor: colors.gray[100],
        bodyFont: {
          size: 14
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => {
            if (context.raw === 0 && (context.chart.data.labels[0] === 'No data' || context.chart.data.labels[0] === 'Error loading data')) {
              return 'No data available';
            }
            return `Revenue: ${new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(context.raw)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: colors.gray[100],
          font: {
            size: 12
          },
          padding: 10,
          callback: (value) => new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(value)
        },
        grid: {
          color: `${colors.gray[700]}55`,
          drawBorder: false
        }
      },
      x: {
        ticks: {
          color: colors.gray[100],
          font: {
            size: 12
          },
          padding: 10
        },
        grid: {
          display: false
        }
      }
    }
  };

  const handleChartTypeChange = (event, newType) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  return (
    <Box m="20px">
      <Header title="PRODUCT REVENUE" subtitle="Product revenue over time" />
      <Box
        display="flex"
        flexDirection="column"
        bgcolor={colors.primary[400]}
        p="30px"
        borderRadius="12px"
        boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb="20px">
          <Box display="flex" gap="20px" alignItems="center">
            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={handleChartTypeChange}
              sx={{
                '& .MuiToggleButton-root': {
                  color: colors.gray[100],
                  borderColor: colors.gray[700],
                  '&.Mui-selected': {
                    color: colors.greenAccent[500],
                    backgroundColor: colors.primary[600],
                    '&:hover': {
                      backgroundColor: colors.primary[600],
                    }
                  },
                  '&:hover': {
                    backgroundColor: colors.primary[600],
                  }
                }
              }}
            >
              <ToggleButton value="daily">Daily</ToggleButton>
              <ToggleButton value="monthly">Monthly</ToggleButton>
            </ToggleButtonGroup>

            {chartType === 'daily' && (
              <FormControl sx={{ minWidth: 120 }}>
                <Select
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  sx={{
                    color: colors.gray[100],
                    '.MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.gray[700],
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.gray[700],
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.gray[700],
                    }
                  }}
                >
                  <MenuItem value="all">All Months</MenuItem>
                  <MenuItem value="1">January</MenuItem>
                  <MenuItem value="2">February</MenuItem>
                  <MenuItem value="3">March</MenuItem>
                  <MenuItem value="4">April</MenuItem>
                  <MenuItem value="5">May</MenuItem>
                  <MenuItem value="6">June</MenuItem>
                  <MenuItem value="7">July</MenuItem>
                  <MenuItem value="8">August</MenuItem>
                  <MenuItem value="9">September</MenuItem>
                  <MenuItem value="10">October</MenuItem>
                  <MenuItem value="11">November</MenuItem>
                  <MenuItem value="12">December</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>

          <Box
            bgcolor={colors.primary[600]}
            p="10px 20px"
            borderRadius="8px"
            display="flex"
            flexDirection="column"
            alignItems="center"
          >
            <Typography variant="subtitle2" color={colors.gray[100]}>
              Total Product Revenue {selectedMonth !== 'all' ? `(${new Date(2024, parseInt(selectedMonth) - 1).toLocaleString('en-US', {month: 'long'})})` : ''}
            </Typography>
            <Typography 
              variant="h5" 
              color={colors.greenAccent[500]}
              sx={{ fontWeight: 'bold' }}
            >
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(totalRevenue)}
            </Typography>
          </Box>
        </Box>
        
        <Box height="70vh">
          <Line 
            data={chartType === 'daily' ? chartData : monthlyData} 
            options={options} 
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ProductRevenueChart; 