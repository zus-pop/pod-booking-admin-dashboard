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

const PODRevenueChart = () => {
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

  const [totalSlotRevenue, setTotalSlotRevenue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (chartType === 'daily') {
          // Fetch cả hai API cùng lúc để đảm bảo data đồng bộ
          const [productResponse, slotResponse] = await Promise.all([
            axios.get(`${API_URL}/api/v1/products/daily-total-revenue`),
            axios.get(`${API_URL}/api/v1/slots/daily-revenue`)
          ]);

          let productData = productResponse.data;
          let slotData = slotResponse.data;

          // Lọc dữ liệu null
          productData = productData.filter(item => item.date !== null);
          slotData = slotData.filter(item => item.date !== null);

          // Lọc theo tháng nếu cần
          if (selectedMonth !== 'all') {
            const filterByMonth = (item) => {
              const date = new Date(item.date);
              const month = date.getMonth() + 1;
              const year = date.getFullYear();
              const currentYear = new Date().getFullYear();
              return month === parseInt(selectedMonth) && year === currentYear;
            };

            productData = productData.filter(filterByMonth);
            slotData = slotData.filter(filterByMonth);

            // Kiểm tra nếu không có dữ liệu trong tháng đã chọn
            if (productData.length === 0 && slotData.length === 0) {
              const selectedMonthName = new Date(2024, parseInt(selectedMonth) - 1).toLocaleString('en-US', {month: 'long'});
              setChartData({
                labels: ['No data'],
                datasets: [
                  {
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
                  },
                  {
                    label: 'Daily Slot Revenue',
                    data: [0],
                    borderColor: colors.blueAccent[500],
                    backgroundColor: `${colors.blueAccent[500]}33`,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: colors.blueAccent[500],
                    pointBorderColor: colors.primary[400],
                    pointBorderWidth: 2,
                  }
                ]
              });
              setTotalRevenue(0);
              setTotalSlotRevenue(0);
              return;
            }
          }

          // Tính tổng doanh thu
          const productTotal = productData.reduce((sum, item) => sum + item.daily_revenue, 0);
          const slotTotal = slotData.reduce((sum, item) => sum + item.daily_revenue, 0);
          
          setTotalRevenue(productTotal);
          setTotalSlotRevenue(slotTotal);

          // Tạo một Set các ngày duy nhất từ cả hai dataset
          const allDates = new Set([
            ...productData.map(item => new Date(item.date).toISOString().split('T')[0]),
            ...slotData.map(item => new Date(item.date).toISOString().split('T')[0])
          ]);

          // Chuyển Set thành Array và sắp xếp
          const sortedDates = Array.from(allDates).sort();

          // Tạo dữ liệu cho biểu đồ
          const chartLabels = sortedDates.map(date => {
            return new Date(date).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });
          });

          const productRevenueData = sortedDates.map(date => {
            const item = productData.find(
              item => new Date(item.date).toISOString().split('T')[0] === date
            );
            return item ? item.daily_revenue : 0;
          });

          const slotRevenueData = sortedDates.map(date => {
            const item = slotData.find(
              item => new Date(item.date).toISOString().split('T')[0] === date
            );
            return item ? item.daily_revenue : 0;
          });

          setChartData({
            labels: chartLabels,
            datasets: [
              {
                label: 'Daily Product Revenue',
                data: productRevenueData,
                borderColor: colors.greenAccent[500],
                backgroundColor: `${colors.greenAccent[500]}33`,
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: colors.greenAccent[500],
                pointBorderColor: colors.primary[400],
                pointBorderWidth: 2,
              },
              {
                label: 'Daily Slot Revenue',
                data: slotRevenueData,
                borderColor: colors.blueAccent[500],
                backgroundColor: `${colors.blueAccent[500]}33`,
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: colors.blueAccent[500],
                pointBorderColor: colors.primary[400],
                pointBorderWidth: 2,
              }
            ]
          });
        } else {
          // Xử lý monthly data
          const [productResponse, slotResponse] = await Promise.all([
            axios.get(`${API_URL}/api/v1/products/monthly-revenue`),
            axios.get(`${API_URL}/api/v1/slots/monthly-revenue`)
          ]);

          let productData = productResponse.data;
          let slotData = slotResponse.data;

          // Kiểm tra nếu không có dữ liệu
          if (productData.length === 0 && slotData.length === 0) {
            setMonthlyData({
              labels: ['No data'],
              datasets: [
                {
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
                },
                {
                  label: 'Monthly Slot Revenue',
                  data: [0],
                  borderColor: colors.blueAccent[500],
                  backgroundColor: `${colors.blueAccent[500]}33`,
                  tension: 0.4,
                  fill: true,
                  pointRadius: 6,
                  pointHoverRadius: 8,
                  pointBackgroundColor: colors.blueAccent[500],
                  pointBorderColor: colors.primary[400],
                  pointBorderWidth: 2,
                }
              ]
            });
            setTotalRevenue(0);
            setTotalSlotRevenue(0);
            return;
          }

          // Tạo một Set các tháng duy nhất từ cả hai dataset
          const allMonths = new Set([
            ...productData.map(item => item.month),
            ...slotData.map(item => item.month)
          ]);

          // Chuyển Set thành Array và sắp xếp
          const sortedMonths = Array.from(allMonths).sort((a, b) => a - b);

          // Tạo labels cho các tháng
          const monthLabels = sortedMonths.map(month => {
            return new Date(2024, month - 1).toLocaleString('en-US', { month: 'long' });
          });

          // Map dữ liệu revenue theo tháng
          const productRevenueData = sortedMonths.map(month => {
            const item = productData.find(item => item.month === month);
            return item ? item.monthly_revenue : 0;
          });

          const slotRevenueData = sortedMonths.map(month => {
            const item = slotData.find(item => item.month === month);
            return item ? item.monthly_revenue : 0;
          });

          // Tính tổng doanh thu
          const productTotal = productRevenueData.reduce((sum, revenue) => sum + revenue, 0);
          const slotTotal = slotRevenueData.reduce((sum, revenue) => sum + revenue, 0);

          setTotalRevenue(productTotal);
          setTotalSlotRevenue(slotTotal);

          setMonthlyData({
            labels: monthLabels,
            datasets: [
              {
                label: 'Monthly Product Revenue',
                data: productRevenueData,
                borderColor: colors.greenAccent[500],
                backgroundColor: `${colors.greenAccent[500]}33`,
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: colors.greenAccent[500],
                pointBorderColor: colors.primary[400],
                pointBorderWidth: 2,
              },
              {
                label: 'Monthly Slot Revenue',
                data: slotRevenueData,
                borderColor: colors.blueAccent[500],
                backgroundColor: `${colors.blueAccent[500]}33`,
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: colors.blueAccent[500],
                pointBorderColor: colors.primary[400],
                pointBorderWidth: 2,
              }
            ]
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // Xử lý lỗi...
      }
    };

    fetchData();
  }, [chartType, selectedMonth]);

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
      <Header title="POD REVENUE" subtitle="POD revenue over time by products & slots" />
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

          <Box display="flex" gap="20px">
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

            <Box
              bgcolor={colors.primary[600]}
              p="10px 20px"
              borderRadius="8px"
              display="flex"
              flexDirection="column"
              alignItems="center"
            >
              <Typography variant="subtitle2" color={colors.gray[100]}>
                Total Slot Revenue {selectedMonth !== 'all' ? `(${new Date(2024, parseInt(selectedMonth) - 1).toLocaleString('en-US', {month: 'long'})})` : ''}
              </Typography>
              <Typography 
                variant="h5" 
                color={colors.blueAccent[500]}
                sx={{ fontWeight: 'bold' }}
              >
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(totalSlotRevenue)}
              </Typography>
            </Box>
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

export default PODRevenueChart; 