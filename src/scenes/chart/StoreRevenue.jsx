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

const StoreRevenue = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState('');
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
    fetchStores();
  }, []);

  useEffect(() => {
    if (selectedStore) {
      if (chartType === 'daily') {
        fetchDailyData();
      } else {
        fetchMonthlyData();
      }
    }
  }, [chartType, selectedMonth, selectedStore]);

  const fetchStores = async () => {
    try {
      const totalResponse = await axios.get(`${API_URL}/api/v1/stores`);
      if (totalResponse.status === 200 ) {
        const total = totalResponse.data.total;
  
        const response = await axios.get(`${API_URL}/api/v1/stores?limit=${total}`);
 
          setStores( response.data.stores);
          console.log( response.data.stores)
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  const fetchDailyData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/stores/${selectedStore}/daily-revenue`);
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

      const total = data.reduce((sum, item) => sum + item.daily_revenue, 0);
      setTotalRevenue(total);

      if (!data || data.length === 0) {
        setChartData({
          labels: ['No data'],
          datasets: [{
            label: 'Daily Store Revenue',
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
        labels: sortedData.map(item => item.date),
        datasets: [{
          label: 'Daily Store Revenue',
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
    }
  };

  const fetchMonthlyData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/stores/${selectedStore}/monthly-revenue`);
      const data = response.data;

      const total = data.reduce((sum, item) => sum + item.monthly_revenue, 0);
      setTotalRevenue(total);

      if (!data || data.length === 0) {
        setMonthlyData({
          labels: ['No data'],
          datasets: [{
            label: 'Monthly Store Revenue',
            data: [0],
            borderColor: colors.greenAccent[500],
            backgroundColor: `${colors.greenAccent[500]}33`,
            tension: 0.4,
            fill: true
          }]
        });
        return;
      }

      const sortedData = data.sort((a, b) => new Date(a.month) - new Date(b.month));

      setMonthlyData({
        labels: sortedData.map(item => item.month),
        datasets: [{
          label: 'Monthly Store Revenue',
          data: sortedData.map(item => item.monthly_revenue),
          borderColor: colors.greenAccent[500],
          backgroundColor: `${colors.greenAccent[500]}33`,
          tension: 0.4,
          fill: true
        }]
      });
    } catch (error) {
      console.error("Error fetching monthly data:", error);
    }
  };

  const handleStoreChange = (event) => {
    setSelectedStore(event.target.value);
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
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
    <Box m="20px">
      <Header title="STORE REVENUE" subtitle="Store revenue over time" />
      <Box
        display="flex"
        flexDirection="column"
        bgcolor={colors.primary[400]}
        p="30px"
        borderRadius="12px"
        boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb="20px">
          <FormControl sx={{ minWidth: 200 }}>
            <Select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              sx={{
                color: colors.gray[100],
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.gray[700],
                },
                '& .MuiSelect-select': {
                  paddingY: '10px',
                },
                '& .MuiPaper-root': {
                  maxHeight: 300
                }
              }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 150,
                    '&::-webkit-scrollbar': {
                      width: '8px'
                    },
                    '&::-webkit-scrollbar-track': {
                      background: colors.primary[400]
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: colors.gray[700],
                      borderRadius: '4px'
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                      background: colors.gray[600]
                    }
                  }
                }
              }}
            >
              <MenuItem value="" disabled>
                Select Store
              </MenuItem>
              {stores.map((store) => (
                <MenuItem 
                  key={store.store_id} 
                  value={store.store_id}
                  sx={{
                    color: colors.gray[100],
                    '&:hover': {
                      backgroundColor: colors.primary[600]
                    },
                    '&.Mui-selected': {
                      backgroundColor: colors.primary[600]
                    }
                  }}
                >
                  {store.store_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box display="flex" gap={2}>
            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={(e, newType) => newType && setChartType(newType)}
              sx={{
                '& .MuiToggleButton-root': {
                  color: colors.gray[100],
                  borderColor: colors.gray[700],
                  '&.Mui-selected': {
                    color: colors.greenAccent[500],
                    backgroundColor: colors.primary[600]
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
              Total Store Revenue {selectedMonth !== 'all' ? `(${new Date(2024, parseInt(selectedMonth) - 1).toLocaleString('en-US', {month: 'long'})})` : ''}
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

export default StoreRevenue; 