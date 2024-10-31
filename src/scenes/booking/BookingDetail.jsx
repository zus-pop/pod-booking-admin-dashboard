import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Checkbox,
  ListItemText,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { Header } from "../../components";
import { toast } from "react-toastify";
import { QRCodeSVG } from "qrcode.react";
import { initializeSocket, disconnectSocket } from "../../socket";
const API_URL = import.meta.env.VITE_API_URL;

const StatBox = styled(Box)(({ theme }) => ({
  backgroundColor: "#1F2A40",
  borderRadius: "12px",
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "space-between",
  width: "300px",
  minHeight: "280px",
  margin: "10px",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)"
  }
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: "434957",
  borderRadius: "12px",
  padding: "20px",
  margin: "20px 0",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
}));

const BookingDetail = () => {
  const { id } = useParams();
  const [bookingDetail, setBookingDetail] = useState(null);

  const [products, setProducts] = useState({});
  const [slots, setSlots] = useState([]);
 
  
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const [quantities, setQuantities] = useState({});
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState(null);


  const navigate = useNavigate();
  useEffect(() => {
    fetchBookingDetail();

  }, [id]);

  const fetchBookingDetail = async () => {
    const result = await axios.get(`${API_URL}/api/v1/bookings/${id}`);

    setBookingDetail(result.data);
    setSlots(result.data.slots)
    
    // Lấy products cho từng slot
    const slotProducts = {};
    for (const slot of result.data.slots) {
      try {
        const productsResponse = await axios.get(
          `${API_URL}/api/v1/bookings/${id}/slots/${slot.slot_id}/products`
        );
        slotProducts[slot.slot_id] = productsResponse.data || [];
      } catch (error) {
        console.error(`Error fetching products for slot ${slot.slot_id}:`, error);
        slotProducts[slot.slot_id] = [];
      }
    }
    setProducts(slotProducts);
  };


  
  const handleOpenAddProductModal = async (slotId) => {
    try {
      const storeId = bookingDetail?.pod?.store?.store_id;
      if (!storeId) {
        toast.error("Store information not found");
        return;
      }

      const response = await axios.get(`${API_URL}/api/v1/products`, {
        params: {
          store_id: storeId
        }
      });
      setAvailableProducts(response.data.products || []);
      setSelectedSlotId(slotId);
      setIsAddProductModalOpen(true);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    }
  };

  const handleProductSelect = (productId) => {

    if (selectedProducts.includes(productId)) {
      setSelectedProducts((prev) => prev.filter((id) => id !== productId));
      setQuantities((prev) => {
        const newQuantities = { ...prev };
        delete newQuantities[productId];
        return newQuantities;
      });
    } else {
      setSelectedProducts((prev) => [...prev, productId]);
      setQuantities((prev) => ({
        ...prev,
        [productId]: 1,
      }));
    }
  };

  const handleQuantityChange = (productId, value) => {
    const product = availableProducts.find(p => p.product_id === productId);
    if (!product) return;

    // Giới hạn số lượng không vượt quá stock
    const quantity = Math.min(
      Math.max(1, parseInt(value) || 0),
      product.stock
    );
    
    setQuantities((prev) => ({
      ...prev,
      [productId]: quantity,
    }));
  };

  const handleAddProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const productsToAdd = selectedProducts.map((productId) => ({
        booking_id: parseInt(id),
        slot_id: selectedSlotId,
        product_id: productId,
        quantity: quantities[productId],
        unit_price: availableProducts.find((p) => p.product_id === productId)
          .price,
      }));
      console.log(productsToAdd)
      const response = await axios.post(
        `${API_URL}/api/v1/bookings/${id}/products`,
        productsToAdd,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        toast.success("Add products processing");
        setPaymentUrl(response.data.payment_url);
        setShowQRModal(true);
        setIsAddProductModalOpen(false);
        setSelectedProducts([]);
        setQuantities({});
      }
    } catch (error) {
      console.error("Error adding products:", error);
      toast.error("Failed to add products");
    }
  };

  const handleCloseQRModal = () => {
    setShowQRModal(false);
    setPaymentUrl(null);
    fetchBookingDetail(); 
  };

  const calculateTotalPrice = () => {
    return selectedProducts.reduce((total, productId) => {
      const product = availableProducts.find((p) => p.product_id === productId);
      return total + (product?.price || 0) * (quantities[productId] || 1);
    }, 0);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const socket = initializeSocket(token);
  
    const handleNotification = (data) => {
      const message = typeof data === 'string' ? data : data.message;
      toast.success(message);
      setShowQRModal(false);
      setPaymentUrl(null);
      fetchBookingDetail();
    };
  
    socket.on("notification", handleNotification);
  
    return () => {
      socket.off("notification", handleNotification);
      disconnectSocket();
    };
  }, []);

  const handleCheckin = async (slotId) => {
    setSelectedSlotId(slotId);
    setIsCheckinModalOpen(true);
  };

  const handleConfirmCheckin = async () => {
    try {
      const response = await axios.put(
        `${API_URL}/api/v1/bookings/${id}/slots/${selectedSlotId}`,
        {
          is_checked_in: true
        }
      );
      
      if (response.status === 201) {
        toast.success("Check-in successful!");
        setSlots(prevSlots => 
          prevSlots.map(slot => 
            slot.slot_id === selectedSlotId 
              ? { ...slot, is_checked_in: true }
              : slot
          )
        );
      }
    } catch (error) {
      console.error("Error during check-in:", error);
      toast.error("Failed to check-in");
    } finally {
      setIsCheckinModalOpen(false);
    }
  };

  // Thêm hàm tính tổng giá cho một slot cụ thể
  const calculateSlotProductsTotal = (slotId) => {
    const slotProducts = products[slotId] || [];
    return slotProducts.reduce((total, product) => {
      return total + (product.price * product.quantity);
    }, 0);
  };

  // Thêm hàm kiểm tra thời gian
  const isSlotExpired = (endTime) => {
    const now = new Date();
    const slotEnd = new Date(endTime);
    return now > slotEnd;
  };

  // Sửa lại hàm kiểm tra thời gian bắt đầu
  const isSlotNotStarted = (startTime) => {
    const now = new Date();
    const slotStart = new Date(startTime);
    const fiveMinutesBefore = new Date(slotStart.getTime() - 5 * 60000); // 5 phút = 5 * 60000 milliseconds
    return now < fiveMinutesBefore;
  };

  // Thêm hàm kiểm tra xem có đang trong thời gian cho phép check-in không
  const isWithinCheckinWindow = (startTime) => {
    const now = new Date();
    const slotStart = new Date(startTime);
    const fiveMinutesBefore = new Date(slotStart.getTime() - 5 * 60000);
    return now >= fiveMinutesBefore && now <= slotStart;
  };

  return (
    <Box m="20px" height="100vh">
      <Header title="Detail of Booking" sx={{ ml: "40px" }} />

      <Box mx="20px">
        {bookingDetail && (
          <>
            <Box mb={4} display="flex" justifyContent="space-between">
              {/* Left Column */}
              <Box flex={1} mr={4} display="flex" flexDirection="column" gap={3}>
                {/* Booking Information */}
                <Box>
                  <Typography variant="h4" sx={{ color: "#4cceac", mb: 2 }}>
                    Booking Information
                  </Typography>
                  <Typography variant="h5" sx={{ color: "#fff", mb: 1 }}>
                    Booking ID: {bookingDetail.booking_id}
                  </Typography>
                  <Typography variant="h5" sx={{ color: "#fff", mb: 1 }}>
                    Date: {bookingDetail.booking_date}
                  </Typography>
                  <Typography variant="h5" sx={{ color: "#fff", mb: 1 }}>
                    Status: {bookingDetail.booking_status}
                  </Typography>
                </Box>

                {/* Store Information */}
                <Box>
                  <Typography variant="h4" sx={{ color: "#4cceac", mb: 2 }}>
                    Store Information
                  </Typography>
                  {bookingDetail.pod.store ? (
                    <>
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Box
                          component="img"
                          src={bookingDetail.pod.store.image}
                          alt={bookingDetail.pod.store.store_name}
                          sx={{
                            width: 200,
                            height: 150,
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                        <Box>
                          <Typography variant="h5" sx={{ color: "#fff", mb: 1 }}>
                            Store Name: {bookingDetail.pod.store.store_name}
                          </Typography>
                          <Typography variant="h5" sx={{ color: "#fff", mb: 1 }}>
                            Address: {bookingDetail.pod.store.address}
                          </Typography>
                          <Typography variant="h5" sx={{ color: "#fff", mb: 1 }}>
                            Phone: {bookingDetail.pod.store.hotline}
                          </Typography>
                         
                        </Box>
                      </Box>
                    </>
                  ) : (
                    <Typography variant="h5" sx={{ color: "#fff", opacity: 0.7 }}>
                      No store information available
                    </Typography>
                  )}
                </Box>

                {/* POD Information */}
                <Box>
                  <Typography variant="h4" sx={{ color: "#4cceac", mb: 2 }}>
                    POD Information
                  </Typography>
                  <Typography variant="h5" sx={{ color: "#fff", mb: 1 }}>
                    POD ID: {bookingDetail.pod?.pod_id}
                  </Typography>
                  <Typography variant="h5" sx={{ color: "#fff", mb: 1 }}>
                    POD Name: {bookingDetail.pod?.pod_name}
                  </Typography>
                  <Typography variant="h5" sx={{ color: "#fff", mb: 1 }}>
                    Type: {bookingDetail.pod?.type.type_name}
                  </Typography>
                  <Typography variant="h5" sx={{ color: "#fff", mb: 1 }}>
                    Description: {bookingDetail.pod?.description}
                  </Typography>
                </Box>

                {/* Rating & Comments (if exists) */}
                {bookingDetail.rating && (
                  <Box>
                    <Typography variant="h4" sx={{ color: "#4cceac", mb: 2 }}>
                      Rating & Comments
                    </Typography>
                    <Typography variant="h5" sx={{ color: "#fff", mb: 1 }}>
                      Rating: {bookingDetail.rating}
                    </Typography>
                    <Typography variant="h5" sx={{ color: "#fff", mb: 1 }}>
                      Comment: {bookingDetail.comment}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Right Column */}
              <Box flex={1} display="flex" flexDirection="column" gap={3}>
                {/* User Information */}
                <Box>
                  <Typography variant="h4" sx={{ color: "#4cceac", mb: 2 }}>
                    User Information
                  </Typography>
                  <Typography variant="h5" sx={{ color: "#fff", mb: 1 }}>
                    User ID: {bookingDetail.user?.user_id}
                  </Typography>
                  <Typography variant="h5" sx={{ color: "#fff", mb: 1 }}>
                    Name: {bookingDetail.user?.user_name}
                  </Typography>
                  <Typography variant="h5" sx={{ color: "#fff", mb: 1 }}>
                    Email: {bookingDetail.user?.email}
                  </Typography>
                </Box>

                {/* Payment Information */}
                <Box>
                  <Typography variant="h4" sx={{ color: "#4cceac", mb: 2 }}>
                    Payment Information
                  </Typography>
                  {bookingDetail.payment && bookingDetail.payment.length > 0 ? (
                    bookingDetail.payment.map((payment) => (
                      <Box key={payment.payment_id} sx={{ mb: 2 }}>
                        <Typography variant="h5" sx={{ color: "#fff", mb: 1 }}>
                          Payment ID: {payment.payment_id}
                        </Typography>
                        <Typography variant="h5" sx={{ color: "#fff", mb: 1 }}>
                          Transaction ID: {payment.transaction_id}
                        </Typography>
                        <Typography variant="h5" sx={{ color: "#fff", mb: 1 }}>
                          Total Cost:{" "}
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(payment.total_cost)}
                        </Typography>
                        <Typography variant="h5" sx={{ color: "#fff", mb: 1 }}>
                          Payment Date: {payment.payment_date}
                        </Typography>
                        <Typography variant="h5" sx={{ color: "#fff", mb: 1 }}>
                          Status: {payment.payment_status}
                        </Typography>
                        {payment !== bookingDetail.payment[bookingDetail.payment.length - 1] && (
                          <Box sx={{ my: 2, borderBottom: "1px solid rgba(255, 255, 255, 0.12)" }} />
                        )}
                      </Box>
                    ))
                  ) : (
                    <Typography variant="h5" sx={{ color: "#fff", opacity: 0.7 }}>
                      No payment information available
                    </Typography>
                  )}
                </Box>

                {/* POD Utilities */}
                <Box>
                  <Typography variant="h4" sx={{ color: "#4cceac", mb: 2 }}>
                    POD Utilities
                  </Typography>
                  {bookingDetail.pod?.utilities?.length > 0 ? (
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {bookingDetail.pod.utilities.map((utility) => (
                        <Box
                          key={utility.utility_id}
                          sx={{
                            backgroundColor: "#1F2A40",
                            borderRadius: "4px",
                            padding: "8px 16px",
                            margin: "4px",
                          }}
                        >
                          <Typography variant="body1" sx={{ color: "#fff" }}>
                            {utility.utility_name}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="h5" sx={{ color: "#fff", opacity: 0.7 }}>
                      No utilities available
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>

          
            <ContentWrapper>
              <Typography variant="h4" sx={{ color: "#fff", mb: 3 }}>
                Slots
              </Typography>
              <Box
                display="flex"
                flexWrap="wrap"
                gap={2}
                justifyContent="flex-start"
                minHeight="200px"
              >
                {slots.length > 0 ? (
                  slots.map((slot) => (
                    <StatBox key={slot.slot_id}>
                      <Box sx={{ width: "100%" }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: "#4cceac",
                            mb: 2,
                            fontWeight: "600",
                            fontSize: "1.1rem"
                          }}
                        >
                          {slot.start_time} <br/>
                            
                           {slot.end_time}
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: "#94a3b8",
                              mb: 1 
                            }}
                          >
                            Slot ID
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              color: "#fff",
                              fontWeight: "500"
                            }}
                          >
                            {slot.slot_id}
                          </Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: "#94a3b8",
                              mb: 1 
                            }}
                          >
                            Price
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              color: "#fff",
                              fontWeight: "500"
                            }}
                          >
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(slot.price)}
                          </Typography>
                        </Box>

                        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                          <Box 
                            sx={{ 
                              px: 2,
                              py: 0.5,
                              borderRadius: "6px",
                              backgroundColor: slot.is_available ? "rgba(76, 206, 172, 0.1)" : "rgba(255, 0, 0, 0.1)",
                              border: `1px solid ${slot.is_available ? "#4cceac" : "#ff0000"}`
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                color: slot.is_available ? "#4cceac" : "#ff0000",
                                fontWeight: "500"
                              }}
                            >
                              {slot.is_available ? "Available" : "Occupied"}
                            </Typography>
                          </Box>

                          <Box 
                            sx={{ 
                              px: 2,
                              py: 0.5,
                              borderRadius: "6px",
                              backgroundColor: slot.is_checked_in ? "rgba(76, 206, 172, 0.1)" : "rgba(255, 152, 0, 0.1)",
                              border: `1px solid ${slot.is_checked_in ? "#4cceac" : "#ff9800"}`
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                color: slot.is_checked_in ? "#4cceac" : "#ff9800",
                                fontWeight: "500"
                              }}
                            >
                              {slot.is_checked_in ? "Checked In" : "Not Checked In"}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 2, width: "100%" }}>
                        {!slot.is_checked_in && (
                          <Button
                            onClick={() => handleCheckin(slot.slot_id)}
                            disabled={isSlotExpired(slot.end_time) || isSlotNotStarted(slot.start_time)}
                            sx={{
                              backgroundColor: isSlotExpired(slot.end_time) 
                                ? "#ff4d4d" 
                                : isSlotNotStarted(slot.start_time)
                                  ? "#ffa726"
                                  : isWithinCheckinWindow(slot.start_time)
                                    ? "#4cceac"
                                    : "#4cceac",
                              color: "#fff",
                              fontWeight: "600",
                              "&:hover": {
                                backgroundColor: isSlotExpired(slot.end_time)
                                  ? "#ff3333"
                                  : isSlotNotStarted(slot.start_time)
                                    ? "#fb8c00"
                                    : "#3da58a",
                              },
                              "&:disabled": {
                                backgroundColor: isSlotExpired(slot.end_time)
                                  ? "#ff4d4d"
                                  : isSlotNotStarted(slot.start_time)
                                    ? "#ffa726"
                                    : "rgba(0, 0, 0, 0.12)",
                                color: "#fff",
                                opacity: 0.8,
                                cursor: "not-allowed"
                              }
                            }}
                          >
                            {isSlotExpired(slot.end_time) 
                              ? "Expired" 
                              : isSlotNotStarted(slot.start_time)
                                ? "Not Yet"
                                : isWithinCheckinWindow(slot.start_time)
                                  ? "Early Check-in"
                                  : "Check In"
                            }
                          </Button>
                        )}
                        {slot.is_checked_in && (
                          <Button
                            variant="contained"
                            onClick={() => handleOpenAddProductModal(slot.slot_id)}
                            sx={{
                              flex: 1,
                              backgroundColor: "#4cceac",
                              color: "#000", 
                              fontWeight: "600",
                              "&:hover": {
                                backgroundColor: "#3da58a",
                              },
                            }}
                          >
                            Add Products
                          </Button>
                        )}
                      </Box>
                    </StatBox>
                  ))
                ) : (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    width="100%"
                  >
                    <Typography
                      variant="h5"
                      sx={{ color: "#fff", opacity: 0.7 }}
                    >
                      No slots found
                    </Typography>
                  </Box>
                )}
              </Box>
            </ContentWrapper>

            <Modal
              open={isCheckinModalOpen}
              onClose={() => setIsCheckinModalOpen(false)}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 400,
                  bgcolor: "background.paper",
                  boxShadow: 24,
                  p: 4,
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" component="h2" gutterBottom>
                  Confirm Check-in
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Are you sure you want to check in this slot?
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                  <Button
                    onClick={() => setIsCheckinModalOpen(false)}
                    variant="outlined"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmCheckin}
                    variant="contained"
                    sx={{
                      backgroundColor: "#4cceac",
                      color: "#000",
                      "&:hover": {
                        backgroundColor: "#3da58a",
                      },
                    }}
                  >
                    Confirm
                  </Button>
                </Box>
              </Box>
            </Modal>
            
            {slots.map((slot) => (
              <ContentWrapper key={slot.slot_id}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={3}
                >
                  <Typography variant="h4" sx={{ color: "#fff" }}>
                    Products for Slot {slot.slot_id}
                  </Typography>
                 
                </Box>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box
                    display="flex"
                    flexWrap="wrap"
                    gap={2}
                    justifyContent="flex-start"
                    minHeight="180px"
                  >
                    {products[slot.slot_id]?.length > 0 ? (
                      products[slot.slot_id].map((product) => (
                        <StatBox key={product.product_id}>
                          <Typography variant="h5" sx={{ color: "#4cceac", mb: 1 }}>
                            {product.product_name}
                          </Typography>
                          <Typography variant="body1" sx={{ color: "#fff", mb: 1 }}>
                            Price:{" "}
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(product.price)}
                          </Typography>
                          <Typography variant="body1" sx={{ color: "#fff", mb: 1 }}>
                            Quantity: {product.quantity}
                          </Typography>
                          <Typography variant="body1" sx={{ color: "#fff" }}>
                            Subtotal:{" "}
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(product.price * product.quantity)}
                          </Typography>
                        </StatBox>
                      ))
                    ) : (
                      <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        width="100%"
                      >
                        <Typography variant="h5" sx={{ color: "#fff", opacity: 0.7 }}>
                          No products yet
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
                <Box
                  display="flex"
                  justifyContent="flex-end"
                  alignItems="center"
                  mt={2}
                  sx={{
                    borderTop: "1px solid rgba(255, 255, 255, 0.12)",
                    paddingTop: 2
                  }}
                >
                  <Typography variant="h5" sx={{ color: "#4cceac", fontWeight: "600" }}>
                    Total: {" "}
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(calculateSlotProductsTotal(slot.slot_id))}
                  </Typography>
                </Box>
              </ContentWrapper>
            ))}

            <Modal
              open={isAddProductModalOpen}
              onClose={() => setIsAddProductModalOpen(false)}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 600,
                  maxHeight: "80vh",
                  bgcolor: "background.paper",
                  boxShadow: 24,
                  p: 4,
                  borderRadius: 2,
                  overflow: "auto",
                }}
              >
                <Typography variant="h6" component="h2" gutterBottom>
                  Add Products to Booking
                </Typography>

                <Box sx={{ mt: 2 }}>
                  {availableProducts.map((product) => (
                    <Box
                      key={product.product_id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 2,
                        p: 2,
                        border: "1px solid #ccc",
                        borderRadius: 1,
                      }}
                    >
                      <Checkbox
                        checked={selectedProducts.includes(
                          product.product_id
                        )}
                        onChange={() =>
                          handleProductSelect(product.product_id)
                        }
                      />
                      <Box sx={{ flex: 1, ml: 2 }}>
                        <Typography variant="subtitle1">
                          {product.product_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Unit Price:{" "}
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(product.price)}
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        {selectedProducts.includes(product.product_id) && (
                          <>
                            <TextField
                              type="number"
                              label="Quantity"
                              value={quantities[product.product_id] || 1}
                              onChange={(e) =>
                                handleQuantityChange(
                                  product.product_id,
                                  e.target.value
                                )
                              }
                              sx={{ width: 100 }}
                              InputProps={{ 
                                inputProps: { 
                                  min: 1,
                                  max: product.stock 
                                } 
                              }}
                              helperText={`Available: ${product.stock}`}
                            />
                            <Typography
                              variant="body1"
                              sx={{ minWidth: 150 }}
                            >
                              Total:{" "}
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(
                                product.price *
                                  (quantities[product.product_id] || 1)
                              )}
                            </Typography>
                          </>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>

                <Box
                  sx={{
                    mt: 3,
                    pt: 2,
                    borderTop: "1px solid rgba(0, 0, 0, 0.12)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6">
                    Total:{" "}
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(calculateTotalPrice())}
                  </Typography>

                  <Box>
                    <Button
                      onClick={() => setIsAddProductModalOpen(false)}
                      sx={{ mr: 2 }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddProducts}
                      variant="contained"
                      disabled={selectedProducts.length === 0}
                      sx={{
                        backgroundColor: "#4cceac",
                        color: "#000",
                        "&:hover": {
                          backgroundColor: "#3da58a",
                        },
                      }}
                    >
                      Add Selected Products
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Modal>

            <Box display="flex" justifyContent="center" mt={4}>
              <Button
                variant="contained"
                onClick={() => navigate("/web/booking")}
                sx={{
                  backgroundColor: "#4cceac",
                  color: "#000",
                  fontSize: "14px",
                  fontWeight: "bold",
                  padding: "10px 20px",
                  "&:hover": {
                    backgroundColor: "#3da58a",
                  },
                }}
              >
                Back to Bookings
              </Button>
            </Box>
          </>
        )}
      </Box>

      <Modal open={showQRModal} onClose={handleCloseQRModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Scan QR code to pay via ZaloPay
          </Typography>

          <Box
            sx={{
              mt: 2,
              mb: 3,
              p: 2,
              bgcolor: "#ffffff",
              borderRadius: 1,
              display: "inline-block",
            }}
          >
            {paymentUrl && (
              <QRCodeSVG
                value={paymentUrl}
                size={256}
                level="H"
                imageSettings={{
                  src: "https://cdn.haitrieu.com/wp-content/uploads/2022/10/Icon-ZaloPay.png",
                  x: undefined,
                  y: undefined,
                  height: 48,
                  width: 48,
                  excavate: true,
                }}
              />
            )}
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Use ZaloPay app to scan QR code
          </Typography>

          <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
            Waiting for payment...
          </Typography>

          <Button
            onClick={handleCloseQRModal}
            variant="contained"
            sx={{
              backgroundColor: "#4cceac",
              color: "#000",
              "&:hover": {
                backgroundColor: "#3da58a",
              },
            }}
          >
            Close
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default BookingDetail;
