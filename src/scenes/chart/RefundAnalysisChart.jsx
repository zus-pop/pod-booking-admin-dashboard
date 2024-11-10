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

const RefundAnalysisChart = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });
  const [totalRefundedSlots, setTotalRefundedSlots] = useState(0);
  const [totalRefundedAmount, setTotalRefundedAmount] = useState(0);
  const [chartType, setChartType] = useState('amount');

  useEffect(() => {
    fetchData();
  }, [chartType]);

  const fetchData = async () => {
    try {
      // Fetch all required data in parallel
      const [totalSlotsResponse, totalAmountResponse, dailyAmountResponse] = await Promise.all([
        axios.get(`${API_URL}/api/v1/slots/total-slot-refunded`),
        axios.get(`${API_URL}/api/v1/slots/total-refunded-amount`),
        axios.get(`${API_URL}/api/v1/slots/daily-refunded-amount`)
      ]);

      // Update state with correct data structure from API
      setTotalRefundedSlots(totalSlotsResponse.data.totalSlotsRefunded);
      setTotalRefundedAmount(totalAmountResponse.data.totalRefunded);

      const dailyData = dailyAmountResponse.data;

      // Sort data by date
      const sortedData = dailyData.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Format dates for labels
      const labels = sortedData.map(item => 
        new Date(item.date).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      );

      // Set chart data based on selected type
      setChartData({
        labels,
        datasets: [
          {
            label: chartType === 'amount' ? 'Daily Refunded Amount' : 'Daily Refunded Slots',
            data: sortedData.map(item => 
              chartType === 'amount' ? item.total_refunded : item.refunded_slots
            ),
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

  const handleChartTypeChange = (event, newType) => {
    if (newType !== null) {
      setChartType(newType);
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
            if (chartType === 'amount') {
              return `Refunded Amount: ${new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(context.raw)}`;
            }
            return `Refunded Slots: ${context.raw}`;
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
          callback: (value) => {
            if (chartType === 'amount') {
              return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(value);
            }
            return value;
          }
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

  return (
    <Box m="20px">
      <Header title="REFUND ANALYSIS" subtitle="Analysis of refunded slots and amounts" />
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
              <ToggleButton value="amount">Amount</ToggleButton>
           
            </ToggleButtonGroup>
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
                Total Refunded Slots
              </Typography>
              <Typography 
                variant="h5" 
                color={colors.greenAccent[500]}
                sx={{ fontWeight: 'bold' }}
              >
                {totalRefundedSlots}
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
                Total Refunded Amount
              </Typography>
              <Typography 
                variant="h5" 
                color={colors.greenAccent[500]}
                sx={{ fontWeight: 'bold' }}
              >
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(totalRefundedAmount)}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Box height="70vh">
          <Line 
            data={chartData} 
            options={options} 
          />
        </Box>
      </Box>
    </Box>
  );
};

export default RefundAnalysisChart; 