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
import { styled, useTheme } from "@mui/material/styles";
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
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
  },
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: "434957",
  borderRadius: "12px",
  padding: "20px",
  margin: "20px 0",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
}));
import { tokens } from "../../theme";
const BookingDetail = () => {
  const { id } = useParams();
  const [bookingDetail, setBookingDetail] = useState(null);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
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

  // Thêm state để quản lý thời gian đếm ngược
  const [countdown, setCountdown] = useState(600); // 600 seconds = 10 minutes

  // Thêm states mới
  const [paymentDetails, setPaymentDetails] = useState({});

  // Thêm state để quản lý việc hiển thị payment details
  const [expandedPaymentId, setExpandedPaymentId] = useState(null);

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Add new state for cash payment confirmation modal
  const [isCashConfirmModalOpen, setIsCashConfirmModalOpen] = useState(false);

  // Add new state for refund modal and refunding slot
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundingSlot, setRefundingSlot] = useState(null);

  const navigate = useNavigate();
  useEffect(() => {
    fetchBookingDetail();
  }, [id]);

  const fetchBookingDetail = async () => {
    const result = await axios.get(`${API_URL}/api/v1/bookings/${id}`);

    setBookingDetail(result.data);
    setSlots(result.data.slots);

    // Lấy và combine products cho từng slot
    const slotProducts = {};
    for (const slot of result.data.slots) {
      try {
        const productsResponse = await axios.get(
          `${API_URL}/api/v1/bookings/${id}/slots/${slot.slot_id}/products`
        );
        
        // Combine duplicate products
        const combinedProducts = productsResponse.data.reduce((acc, product) => {
          const existingProduct = acc.find(p => p.product_id === product.product_id);
          
          if (existingProduct) {
            // Update existing product
            existingProduct.quantity += product.quantity;
            existingProduct.subtotal = existingProduct.quantity * existingProduct.unit_price;
          } else {
            // Add new product with subtotal
            acc.push({
              ...product,
              subtotal: product.quantity * product.unit_price
            });
          }
          
          return acc;
        }, []);

        slotProducts[slot.slot_id] = combinedProducts || [];
      } catch (error) {
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
      console.log();
      const response = await axios.get(`${API_URL}/api/v1/products`, {
        params: {
          store_id: storeId,
        },
      });
      setAvailableProducts(response.data.products || []);
      setSelectedSlotId(slotId);
      setIsAddProductModalOpen(true);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("NO have products menu");
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
    const product = availableProducts.find((p) => p.product_id === productId);
    if (!product) return;

    // Giới hạn số lượng không vượt quá stock
    const quantity = Math.min(Math.max(1, parseInt(value) || 0), product.stock);

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
      console.log(productsToAdd);

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
      const message = typeof data === "string" ? data : data.message;
      toast.success(message);
      setShowQRModal(false);
      setPaymentUrl(null);
      fetchBookingDetail();
      setSelectedProducts([]);
      setQuantities({});
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
          status: "Checked In",
        }
      );

      if (response.status === 201) {
        toast.success("Check-in successful!");
        setSlots((prevSlots) =>
          prevSlots.map((slot) =>
            slot.slot_id === selectedSlotId
              ? { ...slot, status: "Checked In" }
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

  const calculateSlotProductsTotal = (slotId) => {
    const slotProducts = products[slotId] || [];
    return slotProducts.reduce((total, product) => {
      return total + product.price * product.quantity;
    }, 0);
  };

  const isSlotExpired = (endTime) => {
    const now = new Date();
    const slotEnd = new Date(endTime);
    return now > slotEnd;
  };

  // Add new function to handle absent status
  const handleAbsentStatus = async (slotId) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/v1/bookings/${id}/slots/${slotId}`,
        {
          status: "Absent",
        }
      );

      if (response.status === 201) {
        setSlots((prevSlots) =>
          prevSlots.map((slot) =>
            slot.slot_id === slotId ? { ...slot, status: "Absent" } : slot
          )
        );
      }
    } catch (error) {
      console.error("Error updating absent status:", error);
    }
  };

  // Update useEffect to check for expired slots
  useEffect(() => {
    const checkExpiredSlots = () => {
      slots.forEach((slot) => {
        if (
          isSlotExpired(slot.end_time) &&
        
          slot.status !== "Checked In"   &&
          slot.status !== "Checked Out" &&
          slot.status !== "Absent"
        ) {
          handleAbsentStatus(slot.slot_id);
        }
      });
    };

    // Check on initial load and set up interval
    checkExpiredSlots();
    const interval = setInterval(checkExpiredSlots, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [slots]);

  const isSlotCompleted = (status) => {
    return status == "Checked Out";
  };

  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case "complete":
        return {
          backgroundColor: "rgba(76, 206, 172, 0.1)",
          color: "#4cceac",
          borderColor: "#4cceac",
        };
      case "pending":
        return {
          backgroundColor: "rgba(255, 235, 59, 0.1)",
          color: "#ffeb3b",
          borderColor: "#ffeb3b",
        };
      case "ongoing":
        return {
          backgroundColor: "rgba(33, 150, 243, 0.1)",
          color: "#2196f3",
          borderColor: "#2196f3",
        };
      case "canceled":
        return {
          backgroundColor: "rgba(244, 67, 54, 0.1)",
          color: "#f44336",
          borderColor: "#f44336",
        };
      case "confirmed":
        return {
          backgroundColor: "rgba(255, 152, 0, 0.1)",
          color: "#ff9800",
          borderColor: "#ff9800",
        };
      default:
        return {
          backgroundColor: "rgba(158, 158, 158, 0.1)",
          color: "#9e9e9e",
          borderColor: "#9e9e9e",
        };
    }
  };

  // Thêm useEffect để xử lý đếm ngược
  useEffect(() => {
    let timer;
    if (showQRModal && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && showQRModal) {
      handleCloseQRModal();
      toast.error("Payment time has expired!");
    }
    return () => clearInterval(timer);
  }, [countdown, showQRModal]);

  // Thêm hàm mới để kiểm tra trạng thái
  const isSlotDisabled = (endTime, bookingStatus) => {
    return isSlotExpired(endTime) || bookingStatus === "Canceled";
  };

  // Thêm hàm để fetch payment details
  const fetchPaymentDetails = async (paymentId, paymentFor) => {
    // If clicking the same payment, close it
    if (expandedPaymentId === paymentId) {
      setExpandedPaymentId(null);
      return;
    }

    try {
      let endpoint = "";
      if (paymentFor === "Product") {
        endpoint = `${API_URL}/api/v1/bookings/${id}/payments/${paymentId}/products`;
      } else if (paymentFor === "Slot") {
        endpoint = `${API_URL}/api/v1/bookings/${id}/payments/${paymentId}/slots`;
      }

      const response = await axios.get(endpoint);
      setPaymentDetails((prev) => ({
        ...prev,
        [paymentId]: response.data,
      }));
      setExpandedPaymentId(paymentId);
    } catch (error) {
      console.error(
        `Error fetching payment details for payment ${paymentId}:`,
        error
      );
      toast.error("Failed to load payment details");
    }
  };

  const handleCheckout = (slotId) => {
    setSelectedSlotId(slotId);
    setIsCheckoutModalOpen(true);
  };

  const handleConfirmCheckout = async () => {
    try {
      const response = await axios.put(
        `${API_URL}/api/v1/bookings/${id}/slots/${selectedSlotId}`,
        {
          status: "Checked Out",
        }
      );

      if (response.status === 201) {
        toast.success("Check-out successful!");
        setSlots((prevSlots) =>
          prevSlots.map((slot) =>
            slot.slot_id === selectedSlotId
              ? { ...slot, status: "Checked Out" }
              : slot
          )
        );
      }
    } catch (error) {
      console.error("Error checking out:", error);
      toast.error("Failed to check out");
    } finally {
      setIsCheckoutModalOpen(false);
      setSelectedSlotId(null);
    }
  };

  // Add new handler for cash payment
  const handleCashPayment = () => {
    setIsCashConfirmModalOpen(true);
  };

  // Add new handler for confirmed cash payment
  const handleConfirmCashPayment = async () => {
    try {
      const productsToAdd = selectedProducts.map((productId) => ({
        booking_id: parseInt(id),
        slot_id: selectedSlotId,
        product_id: productId,
        quantity: quantities[productId],
        unit_price: availableProducts.find((p) => p.product_id === productId).price,
      }));

      const response = await axios.post(
        `${API_URL}/api/v1/bookings/${id}/cash-products`,
        productsToAdd,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 201) {
        toast.success("Cash payment processed successfully");
        setIsAddProductModalOpen(false);
        setSelectedProducts([]);
        setQuantities({});
        fetchBookingDetail();
      }
    } catch (error) {
      console.error("Error processing cash payment:", error);
      toast.error("Failed to process cash payment");
    } finally {
      setIsCashConfirmModalOpen(false);
    }
  };

  // Add new handler for refund click
  const handleRefundClick = (slot) => {
    setRefundingSlot(slot);
    setIsRefundModalOpen(true);
  };

  // Add new handler for refund confirmation
  const handleRefundSlot = async () => {
    try {
      console.log(refundingSlot)
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/v1/payments/${refundingSlot.payment_id}/refund`,
        {
          bookingSlots: [
            {
              slot_id: refundingSlot.slot_id,
              unit_price: refundingSlot.price,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
      toast.warning(`Refund Slot ${refundingSlot.slot_id} processing...`);
      setIsRefundModalOpen(false);
      setRefundingSlot(null);

      setTimeout(async () => {  
        await fetchBookingDetail();
        toast.success(`Refund Slot ${refundingSlot.slot_id} successfully`);
      }, 5000);
    }
    } catch (error) {
      console.error("Error refunding slot:", error);
      toast.error(error.response?.data?.message || "Failed to process refund");
    }
  };


  // Add new refund confirmation modal
  const RefundModal = () => (
    <Modal
      open={isRefundModalOpen}
      onClose={() => {
        setIsRefundModalOpen(false);
        setRefundingSlot(null);
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "#1F2A40",
          border: "1px solid #434957",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ color: "#fff", mb: 3 }}>
          Confirm Refund
        </Typography>

        {refundingSlot && (
          <>
            <Typography sx={{ color: "#fff", mb: 2 }}>
              Are you sure you want to refund this slot?
            </Typography>
            <Typography sx={{ color: "#fff", mb: 1 }}>
              Start Time: {new Date(refundingSlot.start_time).toLocaleString()}
            </Typography>
            <Typography sx={{ color: "#fff", mb: 1 }}>
              End Time: {new Date(refundingSlot.end_time).toLocaleString()}
            </Typography>
            <Typography sx={{ color: "#fff", mb: 2 }}>
              Amount to Refund:{" "}
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(refundingSlot.price)}
            </Typography>
          </>
        )}

        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button
            onClick={() => {
              setIsRefundModalOpen(false);
              setRefundingSlot(null);
            }}
            variant="outlined"
            sx={{
              color: "#fff",
              borderColor: "#fff",
              "&:hover": {
                borderColor: "#ccc",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRefundSlot}
            variant="contained"
            color="error"
            sx={{
              bgcolor: "red",
              "&:hover": { bgcolor: "darkred" },
            }}
          >
            Confirm Refund
          </Button>
        </Box>
      </Box>
    </Modal>
  );

  return (
    <Box m="20px" height="100vh">
      <Header
        title="Booking Detail"
        subtitle="View and manage booking details"
        showBackButton={true}
      />

      <Box mx="20px">
        {bookingDetail && (
          <>
            <Box mb={4} display="flex" justifyContent="space-between">
              {/* Left Column */}
              <Box
                flex={1}
                mr={4}
                display="flex"
                flexDirection="column"
                gap={3}
              >
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
                  <Box
                    sx={{
                      display: "inline-block",
                      px: 2,
                      py: 1,
                      borderRadius: "6px",
                      border: "1px solid",
                      ...getStatusStyles(bookingDetail.booking_status),
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                      },
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: getStatusStyles(
                            bookingDetail.booking_status
                          ).color,
                          animation:
                            bookingDetail.booking_status?.toLowerCase() ===
                            "ongoing"
                              ? "pulse 1.5s infinite"
                              : "none",
                        }}
                      />
                      {bookingDetail.booking_status}
                    </Typography>
                  </Box>
                </Box>

                {/* Store Information */}
                <Box>
                  <Typography variant="h4" sx={{ color: "#4cceac", mb: 2 }}>
                    Store Information
                  </Typography>
                  {bookingDetail.pod.store ? (
                    <>
                      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                        <Box
                          component="img"
                          src={bookingDetail.pod.store.image}
                          alt={bookingDetail.pod.store.store_name}
                          sx={{
                            width: 200,
                            height: 150,
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                        />
                        <Box>
                          <Typography
                            variant="h5"
                            sx={{ color: "#fff", mb: 1 }}
                          >
                            Store Name: {bookingDetail.pod.store.store_name}
                          </Typography>
                          <Typography
                            variant="h5"
                            sx={{ color: "#fff", mb: 1 }}
                          >
                            Address: {bookingDetail.pod.store.address}
                          </Typography>
                          <Typography
                            variant="h5"
                            sx={{ color: "#fff", mb: 1 }}
                          >
                            Phone: {bookingDetail.pod.store.hotline}
                          </Typography>
                        </Box>
                      </Box>
                    </>
                  ) : (
                    <Typography
                      variant="h5"
                      sx={{ color: "#fff", opacity: 0.7 }}
                    >
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
                <Box sx={{ maxHeight: '500px', overflow: 'auto' }}>
                  <Typography variant="h4" sx={{ color: "#4cceac", mb: 2, position: 'sticky', top: 0, backgroundColor: colors.primary[500], zIndex: 1, py: 1 }}>
                    Payment Information
                  </Typography>
                  {bookingDetail.payment && bookingDetail.payment.length > 0 ? (
                    bookingDetail.payment.map((payment) => (
                      <Box key={payment.payment_id} sx={{ mb: 4 }}>
                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="h5"
                            sx={{ color: "#fff", mb: 1 }}
                          >
                            Payment ID: {payment.payment_id}
                          </Typography>
                          <Typography
                            variant="h5"
                            sx={{ color: "#fff", mb: 1 }}
                          >
                            Transaction ID: {payment.transaction_id}
                          </Typography>
                          <Typography
                            variant="h5"
                            sx={{ color: "#fff", mb: 1 }}
                          >
                            Total Cost:{" "}
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(payment.total_cost)}
                          </Typography>
                          <Typography
                            variant="h5"
                            sx={{ color: "#fff", mb: 1 }}
                          >
                            Payment Date: {payment.payment_date}
                          </Typography>
                          <Typography
                            variant="h5"
                            sx={{ color: "#fff", mb: 1 }}
                          >
                            Status: {payment.payment_status}
                          </Typography>
                          <Typography
                            variant="h5"
                            sx={{ color: "#fff", mb: 1 }}
                          >
                            For: {payment.payment_for}
                          </Typography>

                          {/* Thêm button để load chi tiết */}
                          <Button
                            onClick={() =>
                              fetchPaymentDetails(
                                payment.payment_id,
                                payment.payment_for
                              )
                            }
                            sx={{
                              backgroundColor: "#4cceac",
                              color: "#000",
                              mt: 1,
                              "&:hover": {
                                backgroundColor: "#3da58a",
                              },
                            }}
                          >
                            View Details
                          </Button>

                          {/* Hiển thị chi tiết payment */}
                          {paymentDetails[payment.payment_id] &&
                            expandedPaymentId === payment.payment_id && (
                              <Box sx={{ mt: 2, ml: 2 }}>
                                <Typography
                                  variant="h6"
                                  sx={{ color: "#4cceac", mb: 1 }}
                                >
                                  Payment Details:
                                </Typography>

                                {payment.payment_for === "Product" && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexWrap: "wrap",
                                      gap: 2,
                                    }}
                                  >
                                    {paymentDetails[payment.payment_id].map(
                                      (product) => (
                                        <Box
                                          key={product.product_id}
                                          sx={{
                                            backgroundColor:
                                              "rgba(31, 42, 64, 0.7)",
                                            p: 2,
                                            borderRadius: 1,
                                            minWidth: 200,
                                          }}
                                        >
                                          <Typography
                                            variant="body1"
                                            sx={{ color: "#fff" }}
                                          >
                                            {product.product_name}
                                          </Typography>
                                          <Typography
                                            variant="body2"
                                            sx={{ color: "#94a3b8" }}
                                          >
                                            Quantity: {product.quantity}
                                          </Typography>
                                          <Typography
                                            variant="body2"
                                            sx={{ color: "#94a3b8" }}
                                          >
                                            Price:{" "}
                                            {new Intl.NumberFormat("vi-VN", {
                                              style: "currency",
                                              currency: "VND",
                                            }).format(product.price)}
                                          </Typography>
                                        </Box>
                                      )
                                    )}
                                  </Box>
                                )}

                                {payment.payment_for === "Slot" && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexWrap: "wrap",
                                      gap: 2,
                                    }}
                                  >
                                    {paymentDetails[payment.payment_id].map(
                                      (slot) => (
                                        <Box
                                          key={slot.slot_id}
                                          sx={{
                                            backgroundColor:
                                              "rgba(31, 42, 64, 0.7)",
                                            p: 2,
                                            borderRadius: 1,
                                            minWidth: 200,
                                          }}
                                        >
                                          <Typography
                                            variant="body1"
                                            sx={{ color: "#fff" }}
                                          >
                                            Slot ID: {slot.slot_id}
                                          </Typography>
                                          <Typography
                                            variant="body2"
                                            sx={{ color: "#94a3b8" }}
                                          >
                                            Start Time: {slot.start_time}
                                          </Typography>
                                          <Typography
                                            variant="body2"
                                            sx={{ color: "#94a3b8" }}
                                          >
                                            End Time: {slot.end_time}
                                          </Typography>
                                          <Typography
                                            variant="body2"
                                            sx={{ color: "#94a3b8" }}
                                          >
                                            Price:{" "}
                                            {new Intl.NumberFormat("vi-VN", {
                                              style: "currency",
                                              currency: "VND",
                                            }).format(slot.price)}
                                          </Typography>
                                        </Box>
                                      )
                                    )}
                                  </Box>
                                )}
                              </Box>
                            )}
                        </Box>
                        {payment !==
                          bookingDetail.payment[
                            bookingDetail.payment.length - 1
                          ] && (
                          <Box
                            sx={{
                              my: 2,
                              borderBottom:
                                "1px solid rgba(255, 255, 255, 0.12)",
                            }}
                          />
                        )}
                      </Box>
                    ))
                  ) : (
                    <Typography
                      variant="h5"
                      sx={{ color: "#fff", opacity: 0.7 }}
                    >
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
                    <Typography
                      variant="h5"
                      sx={{ color: "#fff", opacity: 0.7 }}
                    >
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
                            fontSize: "1.1rem",
                          }}
                        >
                          {slot.start_time} <br />
                          {slot.end_time}
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#94a3b8",
                              mb: 1,
                            }}
                          >
                            Slot ID
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              color: "#fff",
                              fontWeight: "500",
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
                              mb: 1,
                            }}
                          >
                            Payment ID
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              color: "#fff",
                              fontWeight: "500",
                            }}
                          >
                            {slot.payment_id}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#94a3b8",
                              mb: 1,
                            }}
                          >
                            Price
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              color: "#fff",
                              fontWeight: "500",
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
                              backgroundColor: slot.is_available
                                ? "rgba(76, 206, 172, 0.1)"
                                : "rgba(255, 0, 0, 0.1)",
                              border: `1px solid ${
                                slot.is_available ? "#4cceac" : "#ff0000"
                              }`,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                color: slot.is_available
                                  ? "#4cceac"
                                  : "#ff0000",
                                fontWeight: "500",
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
                              backgroundColor:
                                slot.status === "Checked In"
                                  ? "rgba(76, 206, 172, 0.1)"
                                  : slot.status === "Absent"
                                  ? "rgba(244, 67, 54, 0.1)"
                                  : "rgba(255, 152, 0, 0.1)",
                              border: `1px solid ${
                                slot.status === "Checked In"
                                  ? "#4cceac"
                                  : slot.status === "Absent"
                                  ? "#f44336"
                                  : "#ff9800"
                              }`,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                color:
                                  slot.status === "Checked In"
                                    ? "#4cceac"
                                    : slot.status === "Absent"
                                    ? "#f44336"
                                    : "#ff9800",
                                fontWeight: "500",
                              }}
                            >
                              {slot.status}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
                        {!isSlotCompleted(slot.status) ? (
                          <>
                            {slot.status === "Checked In" ? (
                              <Button
                                onClick={() => handleCheckout(slot.slot_id)}
                                sx={{
                                  backgroundColor: "#ff9800",
                                  color: "#fff",
                                  fontWeight: "600",
                                  "&:hover": {
                                    backgroundColor: "#f57c00",
                                  },
                                }}
                              >
                                Check Out
                              </Button>
                            ) : (
                              slot.status !== "Checked Out" && slot.status !== "Refunded" ? (
                                <Button
                                  onClick={() => handleCheckin(slot.slot_id)}
                                  disabled={isSlotDisabled(
                                    slot.end_time,
                                    bookingDetail.booking_status
                                  )}
                                  sx={{
                                    backgroundColor: isSlotDisabled(
                                      slot.end_time,
                                      bookingDetail.booking_status
                                    )
                                      ? "#ff4d4d"
                                      : "#4cceac",
                                    color: "#fff",
                                    fontWeight: "600",
                                    "&:hover": {
                                      backgroundColor: isSlotDisabled(
                                        slot.end_time,
                                        bookingDetail.booking_status
                                      )
                                        ? "#ff3333"
                                        : "#3da58a",
                                    },
                                    "&:disabled": {
                                      backgroundColor: isSlotDisabled(
                                        slot.end_time,
                                        bookingDetail.booking_status
                                      )
                                        ? "#ff4d4d"
                                        : "rgba(0, 0, 0, 0.12)",
                                      color: "#fff",
                                      opacity: 0.8,
                                      cursor: "not-allowed",
                                    },
                                  }}
                                >
                                  {isSlotDisabled(
                                    slot.end_time,
                                    bookingDetail.booking_status
                                  )
                                    ? "Expired"
                                    : "Check In"}
                                </Button>
                              ) : (
                                
                                <Button
                                  disabled
                                  sx={{
                                    backgroundColor: "#f44336",
                                    color: "#fff",
                                    fontWeight: "600",
                                    opacity: 0.7,
                                    "&:disabled": {
                                      backgroundColor: "#f44336",
                                      color: "#fff",
                                    }
                                  }}
                                >
                                  Slot is refunded
                                </Button>
                              )
                            )}
                            {slot.status === "Checked In" &&
                              !isSlotExpired(slot.end_time) && (
                                <Button
                                  variant="contained"
                                  onClick={() =>
                                    handleOpenAddProductModal(slot.slot_id)
                                  }
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
                            {/* Add Refund Button */}
                            {slot.status === "Not Yet" && 
                             !isSlotDisabled(slot.end_time, bookingDetail.booking_status) && (
                              <Button
                                onClick={() => handleRefundClick(slot)}
                                sx={{
                                  backgroundColor: "#f44336",
                                  color: "#fff",
                                  fontWeight: "600",
                                  "&:hover": {
                                    backgroundColor: "#d32f2f",
                                  },
                                }}
                              >
                                Refund
                              </Button>
                            )}
                          </>
                        ) : (
                          <Button
                            variant="body2"
                            sx={{
                              color: "#fff",
                              fontWeight: "600",
                              disabled: true,
                              opacity: 0.8,
                            }}
                          >
                            Completed
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
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}
                >
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

            <Modal
              open={isCheckoutModalOpen}
              onClose={() => setIsCheckoutModalOpen(false)}
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
                  Confirm Check-out
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Are you sure you want to check out this slot?
                </Typography>
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}
                >
                  <Button
                    onClick={() => setIsCheckoutModalOpen(false)}
                    variant="outlined"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmCheckout}
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
                      products[slot.slot_id].map((product, productIndex) => (
                        <StatBox
                          key={`product-${slot.slot_id}-${product.product_id}-${productIndex}`}
                        >
                          <Typography
                            variant="h5"
                            sx={{ color: "#4cceac", mb: 1 }}
                          >
                            {product.product_name}
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ color: "#fff", mb: 1 }}
                          >
                            Price:{" "}
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(product.price)}
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ color: "#fff", mb: 1 }}
                          >
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
                        <Typography
                          variant="h5"
                          sx={{ color: "#fff", opacity: 0.7 }}
                        >
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
                    paddingTop: 2,
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{ color: "#4cceac", fontWeight: "600" }}
                  >
                    Total:{" "}
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
                  width: 800,
                  maxHeight: "90vh",
                  bgcolor: "#1F2A40",
                  boxShadow: 24,
                  p: 4,
                  borderRadius: 2,
                  overflow: "auto",
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "rgba(255, 255, 255, 0.05)",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    background: "rgba(255, 255, 255, 0.3)",
                  },
                }}
              >
                <Typography
                  variant="h6"
                  component="h2"
                  gutterBottom
                  sx={{ color: "#fff" }}
                >
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
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        borderRadius: 1,
                        bgcolor: "background.paper",
                      }}
                    >
                      <Checkbox
                        checked={selectedProducts.includes(product.product_id)}
                        onChange={() => handleProductSelect(product.product_id)}
                      />

                      <Box
                        component="img"
                        src={product.image}
                        alt={product.product_name}
                        sx={{
                          width: 80,
                          height: 80,
                          objectFit: "cover",
                          borderRadius: 1,
                          ml: 2,
                        }}
                      />

                      <Box sx={{ flex: 1, ml: 2 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ color: "#fff", fontWeight: "500" }}
                        >
                          {product.product_name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#94a3b8" }}>
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
                              sx={{
                                width: 100,
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    borderColor: "rgba(255, 255, 255, 0.23)",
                                  },
                                  "&:hover fieldset": {
                                    borderColor: "rgba(255, 255, 255, 0.23)",
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: "#4cceac",
                                  },
                                },
                                "& .MuiInputLabel-root": {
                                  color: "rgba(255, 255, 255, 0.7)",
                                },
                                "& .MuiInputBase-input": {
                                  color: "#fff",
                                },
                              }}
                              InputProps={{
                                inputProps: {
                                  min: 1,
                                  max: product.stock,
                                },
                              }}
                              helperText={`Available: ${product.stock}`}
                            />
                            <Typography
                              variant="body1"
                              sx={{ minWidth: 150, color: "#4cceac" }}
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
                    borderTop: "1px solid rgba(255, 255, 255, 0.12)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6" sx={{ color: "#4cceac" }}>
                    Total:{" "}
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(calculateTotalPrice())}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      onClick={handleCashPayment}
                      disabled={selectedProducts.length === 0}
                      sx={{
                        backgroundColor: "#f44336",
                        color: "#fff",
                        px: 4,
                        "&:hover": {
                          backgroundColor: "#d32f2f",
                        },
                        "&:disabled": {
                          backgroundColor: "rgba(244, 67, 54, 0.5)",
                          color: "rgba(255, 255, 255, 0.7)",
                        },
                      }}
                    >
                      Pay with Cash
                    </Button>
                    <Button
                      onClick={handleAddProducts}
                      disabled={selectedProducts.length === 0}
                      sx={{
                        backgroundColor: "#4cceac",
                        color: "#000",
                        px: 4,
                        "&:hover": {
                          backgroundColor: "#3da58a",
                        },
                        "&:disabled": {
                          backgroundColor: "rgba(76, 206, 172, 0.5)",
                          color: "rgba(0, 0, 0, 0.7)",
                        },
                      }}
                    >
                      Pay with ZaloPay
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
                  marginBottom: "10px",
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
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Scan QR code to pay via ZaloPay
          </Typography>

          {/* Thêm đồng hồ đếm ngược */}
          <Typography
            variant="subtitle1"
            sx={{
              color: countdown <= 60 ? "#f44336" : "#2196f3",
              fontWeight: "bold",
              mb: 2,
            }}
          >
            Time remaining: {Math.floor(countdown / 60)}:
            {(countdown % 60).toString().padStart(2, "0")}
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

      <style>
        {`
          @keyframes pulse {
            0% {
              transform: scale(0.95);
              box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.7);
            }
            
            70% {
              transform: scale(1);
              box-shadow: 0 0 0 6px rgba(33, 150, 243, 0);
            }
            
            100% {
              transform: scale(0.95);
              box-shadow: 0 0 0 0 rgba(33, 150, 243, 0);
            }
          }
        `}
      </style>

      {/* Cash Payment Confirmation Modal */}
      <Modal open={isCashConfirmModalOpen} onClose={() => setIsCashConfirmModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Confirm Cash Payment
          </Typography>

          <Typography variant="body1" sx={{ mb: 3 }}>
            Total Amount: {" "}
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(calculateTotalPrice())}
          </Typography>

          <Typography variant="body2" sx={{ mb: 4, color: "text.secondary" }}>
            Are you sure you want to process this cash payment?
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
            <Button
              onClick={() => setIsCashConfirmModalOpen(false)}
              variant="outlined"
              sx={{
                borderColor: "#4cceac",
                color: "#4cceac",
                "&:hover": {
                  borderColor: "#3da58a",
                  backgroundColor: "rgba(76, 206, 172, 0.1)",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmCashPayment}
              variant="contained"
              sx={{
                backgroundColor: "#4cceac",
                color: "#000",
                "&:hover": {
                  backgroundColor: "#3da58a",
                },
              }}
            >
              Confirm Payment
            </Button>
          </Box>
        </Box>
      </Modal>
      <RefundModal />
    </Box>
  );
};

export default BookingDetail;
