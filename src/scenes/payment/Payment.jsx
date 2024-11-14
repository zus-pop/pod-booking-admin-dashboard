import { Box, useTheme,Typography,FormControl,InputLabel,Select,MenuItem,TextField,Button } from "@mui/material";
import { Header } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useState, useEffect } from 'react';
import axios from "axios";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Modal from "@mui/material/Modal";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-toastify";
import { Formik, Form } from "formik";
import * as yup from "yup";


const Payment = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const API_URL = import.meta.env.VITE_API_URL
  const [data, setData] = useState([]);

    
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);

  const [pageSize, setPageSize] = useState(4);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: pageSize,
    page: pages,
  });
  const totalPages = Math.ceil(total / pageSize);
  const [loading, setLoading] = useState(false);

  
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchByStatus, setSearchByStatus] = useState("");
  const [filters, setFilters] = useState({
    payment_status: "",
    payment_date: "",
  });

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundingSlot, setRefundingSlot] = useState(null);

  useEffect(() => {
    fetchData();
  }, [pages, pageSize,filters]); 

  const fetchData = async () => {
    try {
      setLoading(true)
      const result = await axios.get(`${API_URL}/api/v1/payments`,{
        params: { limit: pageSize,
        page: pages + 1,
        payment_status: filters.payment_status,
        payment_date: filters.payment_date, 
        }
      });

      setData(result.data.payments);
      setTotal(result.data.total);
      console.log(result.data.payments)
    } catch (error) {
      console.error('Error fetching data:', error.message);
      if (error.response && error.response.status === 404) {
        console.error("Store not found with the given name.");
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
  
  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setSearchByStatus(newStatus);
    setPages(0);
    setPaginationModel(prev => ({
      ...prev,
      page: 0
    }));
    setFilters(prevFilters => ({
      ...prevFilters,
      payment_status: newStatus
    }));
  };

  const handleDateChange = (date) => {
    if (date) {
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      const dateString = localDate.toISOString().split('T')[0];
      setSelectedDate(dateString);
      setPages(0);
      setPaginationModel(prev => ({
        ...prev,
        page: 0
      }));
      setFilters(prevFilters => ({
        ...prevFilters,
        payment_date: dateString
      }));
    } else {
      setSelectedDate(null);
      setPages(0);
      setPaginationModel(prev => ({
        ...prev,
        page: 0
      }));
      setFilters(prevFilters => ({
        ...prevFilters,
        payment_date: ""
      }));
    }
  };

  const handleViewDetail = async (payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
    setIsLoading(true);

    try {
      let response;
      if (payment.payment_for === "Product") {
        response = await axios.get(
          `${API_URL}/api/v1/bookings/${payment.booking_id}/payments/${payment.payment_id}/products`
        );
      } else if (payment.payment_for === "Slot") {
        response = await axios.get(
          `${API_URL}/api/v1/bookings/${payment.booking_id}/payments/${payment.payment_id}/slots`
        );
      }
      setPaymentDetails(response.data);
    } catch (error) {
      
    
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPayment(null);
    setPaymentDetails([]);
  };

  const handleRefundClick = (slot, paymentId) => {
    setRefundingSlot({
      ...slot,
      paymentId
    });
    setIsRefundModalOpen(true);
  };

  const refundValidationSchema = yup.object({
    description: yup
      .string()
      .required("Description is required")
      .min(10, "Description must be at least 10 characters")
      .max(500, "Description must not exceed 500 characters"),
  });

  const handleRefundSlot = async (values, { resetForm }) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/v1/payments/${refundingSlot.paymentId}/refund`,
        {
          bookingSlots: [
            {
              slot_id: refundingSlot.slot_id,
              unit_price: refundingSlot.price,
            },
          ],
          description: values.description
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      toast.warning(`Refund Slot ${refundingSlot.slot_id} processing...`);
      setIsRefundModalOpen(false);
      setRefundingSlot(null);
      resetForm();
      handleCloseModal();

      setTimeout(async () => {  
        await fetchData();
        toast.success(`Refund Slot ${refundingSlot.slot_id} successfully`);
      }, 5000);
     
    } catch (error) {
      console.error("Error refunding slot:", error);
      toast.error(error.response?.data?.message || "Failed to process refund");
    }
  };

  const columns = [
    { 
      field: "payment_id", 
      headerName: "Payment ID", 
      flex: 0.7,
      minWidth: 100 
    },
    {
      field: "transaction_id",
      headerName: "Transaction ID",
      flex: 1.2,
      minWidth: 150,
      cellClassName: "name-column--cell",
    },
    {
      field: "booking_id",
      headerName: "Booking ID",
      flex: 0.7,
      minWidth: 100,
      cellClassName: "name-column--cell",
    },
    {
      field: "payment_date",
      headerName: "Payment Date",
      flex: 1,
      minWidth: 160,
    },
    {
      field: "total_cost",
      headerName: "Total Cost",
      flex: 0.8,
      minWidth: 120,
      valueFormatter: (params) => {
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(params.value)
      }
    },
    {
      field: "refunded_amount",
      headerName: "Refund Amount",
      flex: 0.8,
      minWidth: 120,
      valueFormatter: (params) => {
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(params.value)
      }
    },
    {
      field: "refunded_date",
      headerName: "Refund Date",
      flex: 1,
      minWidth: 160,
      renderCell: (params) => (
        <Typography>
          {params.value ? params.value : "None"}
        </Typography>
      ),
    },
    {
      field: "payment_status",
      headerName: "Status",
      flex: 0.8,
      minWidth: 100,
    },
    {
      field: "detail",
      headerName: "Detail",
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleViewDetail(params.row)}
          >
            View Detail
          </Button>
        </div>
      ),
    },
  ];

  const getPaymentStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return {
          backgroundColor: "rgba(76, 206, 172, 0.1)",
          color: "#4cceac",
          borderColor: "#4cceac",
          padding: "4px 8px",
          borderRadius: "4px",
          border: "1px solid"
        };
      case 'failed':
        return {
          backgroundColor: "rgba(244, 67, 54, 0.1)", 
          color: "#f44336",
          borderColor: "#f44336",
          padding: "4px 8px",
          borderRadius: "4px",
          border: "1px solid"
        };
      case 'unpaid':
        return {
          backgroundColor: "rgba(255, 235, 59, 0.1)",
          color: "#ffeb3b",
          borderColor: "#ffeb3b",
          padding: "4px 8px", 
          borderRadius: "4px",
          border: "1px solid"
        };
      default:
        return {
          backgroundColor: "rgba(158, 158, 158, 0.1)",
          color: "#9e9e9e",
          borderColor: "#9e9e9e",
          padding: "4px 8px",
          borderRadius: "4px", 
          border: "1px solid"
        };
    }
  };

  return (
    <Box m="20px">
      <Header
        title="Payment"
        subtitle="Manage Payment Data"
      />
      <Box
        display="flex"
        alignItems="center"
        borderRadius="3px"
        sx={{ display:"flex" }}
      >
       
        <FormControl sx={{ minWidth: 200, mr: 2 }}>
          <InputLabel id="type-select-label">Payment Status</InputLabel>
          <Select
            labelId="type-select-label"
            id="type-select"
            value={searchByStatus}
            onChange={handleStatusChange}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Paid">Paid</MenuItem>
            <MenuItem value="Failed">Failed</MenuItem>
            <MenuItem value="Unpaid">Unpaid</MenuItem>
            <MenuItem value="Refunded">Refunded</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel shrink>Select Date</InputLabel>
          <ReactDatePicker
            selected={selectedDate ? new Date(selectedDate) : null}
            onChange={handleDateChange}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select Date YYYY-MM-DD"
            isClearable={true}
            customInput={
              <TextField
                variant="filled"
                fullWidth
                sx={{
                  "& .MuiInputBase-root": {
                    height: "50px",
                    display: "flex",
                    alignItems: "center",
                  },
                  "& .MuiFilledInput-input": {
                    paddingTop: "8px",
                  },
                }}
                inputProps={{
                  readOnly: true,
                  style: {
                    cursor: "pointer",
                    fontSize: "12px",
                    color: "inherit",
                  },
                }}
              />
            }
          />
        </FormControl>
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
          getRowId={(row) => row.payment_id}        
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}  
          pageSizeOptions={[4, 6, 8]}
          rowCount={total}
          paginationMode="server"
      
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
        <Box mt="10px">
     <Typography variant="body1">
       Page {pages + 1 } of {totalPages}
     </Typography>
     </Box>
      </Box>

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="payment-detail-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            backgroundColor: "#000000",
            border: `1px solid ${colors.primary[500]}`,
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          {isLoading ? (
            <Box display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Typography 
                variant="h5" 
                component="h1" 
                sx={{ 
                  mb: 3, 
                  color: colors.gray[100],
                  fontSize: "24px"
                }}
              >
                Payment Details
              </Typography>

              {selectedPayment && (
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ color: colors.gray[100], mb: 1, fontSize: "16px" }}>
                    Payment ID: {selectedPayment.payment_id}
                  </Typography>
                  <Typography sx={{ color: colors.gray[100], mb: 1, fontSize: "16px" }}>
                    Transaction ID: {selectedPayment.transaction_id}
                  </Typography>
                  <Typography sx={{ color: colors.gray[100], mb: 1, fontSize: "16px" }}>
                    Booking ID: {selectedPayment.booking_id}
                  </Typography>
                  <Typography sx={{ color: colors.gray[100], mb: 1, fontSize: "16px" }}>
                    Date: {selectedPayment.payment_date}
                  </Typography>
                  <Typography sx={{ color: colors.gray[100], mb: 1, fontSize: "16px", display: "flex", alignItems: "center", gap: 1 }}>
                    Status: 
                    <Box component="span" sx={getPaymentStatusStyles(selectedPayment.payment_status)}>
                      {selectedPayment.payment_status}
                    </Box>
                  </Typography>
                  <Typography sx={{ color: colors.gray[100], mb: 2, fontSize: "16px" }}>
                    Total Cost:{" "}
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(selectedPayment.total_cost)}
                  </Typography>
                  <Typography sx={{ color: colors.gray[100], mb: 1, fontSize: "16px" }}>
                    Refund Date: {selectedPayment.refunded_date ? selectedPayment.refunded_date : "None"}
                  </Typography>
                </Box>
              )}

              <Typography variant="h6" sx={{ mb: 2, color: colors.gray[100], fontSize: "20px" }}>
                {selectedPayment?.payment_for} Details:
              </Typography>

              {selectedPayment?.payment_for === "Product" && (
                <Box>
                  {paymentDetails.map((product) => (
                    <Box
                      key={product.product_id}
                      sx={{
                        mb: 2,
                        p: 2,
                        bgcolor: colors.primary[500],
                        borderRadius: 1,
                      }}
                    >
                      <Typography sx={{ color: colors.gray[100], mb: 1, fontSize: "16px" }}>
                        Product Name: {product.product_name}
                      </Typography>
                      <Typography sx={{ color: colors.gray[100], mb: 1, fontSize: "16px" }}>
                        Quantity: {product.quantity}
                      </Typography>
                      <Typography sx={{ color: colors.gray[100], fontSize: "16px" }}>
                        Unit Price:{" "}
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(product.unit_price)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {selectedPayment?.payment_for === "Slot" && (
                <Box>
                  {paymentDetails.map((slot) => {
                    const isSlotExpired = new Date() > new Date(slot.end_time) || slot.status !== "Not Yet";
                    return (
                      <Box
                        key={slot.slot_id}
                        sx={{
                          mb: 2,
                          p: 2,
                          bgcolor: colors.primary[500],
                          borderRadius: 1,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <Box>
                        <Typography sx={{ color: colors.gray[100], mb: 1, fontSize: "16px" }}>
                            Slot ID: {slot.slot_id}
                          </Typography>
                          <Typography sx={{ color: colors.gray[100], mb: 1, fontSize: "16px" }}>
                            Start Time: {new Date(slot.start_time).toLocaleString()}
                          </Typography>
                          <Typography sx={{ color: colors.gray[100], mb: 1, fontSize: "16px" }}>
                            End Time: {new Date(slot.end_time).toLocaleString()}
                          </Typography>
                          <Typography sx={{ color: colors.gray[100], fontSize: "16px" }}>
                            Price:{" "}
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(slot.price)}
                          </Typography>
                        </Box>
                        
                        {(selectedPayment.payment_status === "Paid" || selectedPayment.payment_status === "Refunded") && (
                          <Button
                            variant="contained"
                            color="error"
                            disabled={slot.status === "Refunded" || isSlotExpired}
                            onClick={() => handleRefundClick(slot, selectedPayment.payment_id)}
                            sx={{
                              ml: 2,
                              bgcolor: 'red',
                              "&:hover": { bgcolor: 'red' },
                            }}
                          >
                            {slot.status === "Refunded" ? "Refunded" : isSlotExpired ? "Expired" : "Refund"}
                          </Button>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              )}

              <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  onClick={handleCloseModal}
                  sx={{
                    bgcolor: colors.blueAccent[700],
                    "&:hover": { bgcolor: colors.blueAccent[800] },
                  }}
                >
                  Close
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      <Modal
        open={isRefundModalOpen}
        onClose={() => {
          setIsRefundModalOpen(false);
          setRefundingSlot(null);
        }}
        aria-labelledby="refund-confirmation-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "#000000",
            border: `1px solid ${colors.primary[500]}`,
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h6"
            component="h2"
            sx={{ color: colors.gray[100], mb: 3 }}
          >
            Confirm Refund
          </Typography>

          {refundingSlot && (
            <Formik
              initialValues={{
                description: "",
              }}
              validationSchema={refundValidationSchema}
              onSubmit={handleRefundSlot}
            >
              {({ values, errors, touched, handleChange, handleBlur, isValid }) => (
                <Form>
                  <Typography sx={{ color: colors.gray[100], mb: 2 }}>
                    Are you sure you want to refund this slot?
                  </Typography>
                  <Typography sx={{ color: colors.gray[100], mb: 1 }}>
                    Start Time: {new Date(refundingSlot.start_time).toLocaleString()}
                  </Typography>
                  <Typography sx={{ color: colors.gray[100], mb: 1 }}>
                    End Time: {new Date(refundingSlot.end_time).toLocaleString()}
                  </Typography>
                  <Typography sx={{ color: colors.gray[100], mb: 2 }}>
                    Amount to Refund:{" "}
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(refundingSlot.price)}
                  </Typography>

                  <TextField
                    fullWidth
                    name="description"
                    label="Reason for Refund"
                    multiline
                    rows={3}
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                    required
                    sx={{
                      mb: 3,
                      "& .MuiOutlinedInput-root": {
                        color: colors.gray[100],
                        "& fieldset": {
                          borderColor: colors.primary[500],
                        },
                        "&:hover fieldset": {
                          borderColor: colors.primary[300],
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: colors.primary[300],
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: colors.gray[100],
                        "&.Mui-focused": {
                          color: colors.primary[300],
                        },
                      },
                      "& .MuiFormHelperText-root": {
                        color: "#f44336",
                      },
                    }}
                  />

                  <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button
                      onClick={() => {
                        setIsRefundModalOpen(false);
                        setRefundingSlot(null);
                      }}
                      variant="outlined"
                      sx={{
                        color: colors.gray[100],
                        borderColor: colors.gray[100],
                        "&:hover": {
                          borderColor: colors.gray[300],
                        },
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="error"
                      disabled={!isValid}
                      sx={{
                        bgcolor: "red",
                        "&:hover": { bgcolor: "darkred" },
                      }}
                    >
                      Confirm Refund
                    </Button>
                  </Box>
                </Form>
              )}
            </Formik>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default Payment;
