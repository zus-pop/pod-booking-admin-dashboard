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
  borderRadius: "8px",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  height: "200px",
  width: "250px",
  margin: "10px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
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
  const [products, setProducts] = useState([]);
  const [slots, setSlots] = useState([]);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    fetchBookingDetail();
    fetchProducts();
    fetchSlots();
  }, [id]);
  const fetchBookingDetail = async () => {
    const result = await axios.get(`${API_URL}/api/v1/bookings/${id}`);

    setBookingDetail(result.data);
    console.log("Booking detail:", bookingDetail.payment);
  };

  const fetchSlots = async () => {
    const result = await axios.get(`${API_URL}/api/v1/bookings/${id}/slots`);

    setSlots(result.data);
  };
  const fetchProducts = async () => {
    const result = await axios.get(`${API_URL}/api/v1/bookings/${id}/products`);

    setProducts(result.data);
  };
  const handleOpenAddProductModal = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/products`);
      setAvailableProducts(response.data.products || []);
      setIsAddProductModalOpen(true);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    }
  };

  const handleProductSelect = (productId) => {
    const product = availableProducts.find((p) => p.product_id === productId);

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
        product_id: productId,
        quantity: quantities[productId],
        unit_price: availableProducts.find((p) => p.product_id === productId)
          .price,
      }));

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
        toast.success("Add products processinggg");
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
    fetchProducts(); // Refresh products list
  };

  const calculateTotalPrice = () => {
    return selectedProducts.reduce((total, productId) => {
      const product = availableProducts.find((p) => p.product_id === productId);
      return total + (product?.price || 0) * (quantities[productId] || 1);
    }, 0);
  };

  const calculateBookingProductsTotal = () => {
    return products.reduce((total, product) => {
      return total + product.price * product.quantity;
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
      fetchProducts();
    };
  
    socket.on("notification", handleNotification);
  
    return () => {
      socket.off("notification", handleNotification);
      disconnectSocket();
    };
  }, []);

  return (
    <Box m="20px" height="100vh">
      <Header title="Detail of Booking" sx={{ ml: "40px" }} />

      <Box mx="20px">
        {bookingDetail && (
          <>
            <Box mb={4} display="flex" justifyContent="space-between">
              <Box flex={1} mr={4}>
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

                <Typography
                  variant="h4"
                  sx={{ color: "#4cceac", mb: 2, mt: 3 }}
                >
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

                {bookingDetail.rating && (
                  <>
                    <Typography
                      variant="h4"
                      sx={{ color: "#4cceac", mb: 2, mt: 3 }}
                    >
                      Rating & Comments
                    </Typography>
                    <Typography variant="h5" sx={{ color: "#fff", mb: 1 }}>
                      Rating: {bookingDetail.rating}
                    </Typography>
                    <Typography variant="h5" sx={{ color: "#fff", mb: 1 }}>
                      Comment: {bookingDetail.comment}
                    </Typography>
                  </>
                )}
              </Box>

              <Box flex={1}>
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

                <Typography
                  variant="h4"
                  sx={{ color: "#4cceac", mb: 2, mt: 3 }}
                >
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

                <Typography
                  variant="h4"
                  sx={{ color: "#4cceac", mb: 2, mt: 3 }}
                >
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

            <ContentWrapper>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Typography variant="h4" sx={{ color: "#fff" }}>
                  Products
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleOpenAddProductModal}
                  sx={{
                    backgroundColor: "#4cceac",
                    color: "#000",
                    "&:hover": {
                      backgroundColor: "#3da58a",
                    },
                  }}
                >
                  Add Products
                </Button>
              </Box>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box
                  display="flex"
                  flexWrap="wrap"
                  gap={2}
                  justifyContent="flex-start"
                  minHeight="180px"
                >
                  {products.length > 0 ? (
                    products.map((product) => (
                      <StatBox key={product.product_id}>
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

                {products.length > 0 && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      borderTop: "1px solid rgba(255, 255, 255, 0.12)",
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h5" sx={{ color: "#4cceac" }}>
                      Total Products Cost:{" "}
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(calculateBookingProductsTotal())}
                    </Typography>
                  </Box>
                )}
              </Box>

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
                      Tổng tiền:{" "}
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
            </ContentWrapper>
            <ContentWrapper>
              <Typography variant="h4" sx={{ color: "#fff", mb: 3 }}>
                Slots
              </Typography>
              <Box
                display="flex"
                flexWrap="wrap"
                gap={2}
                justifyContent="flex-start"
                minHeight="180px"
              >
                {slots.length > 0 ? (
                  slots.map((slot) => (
                    <StatBox key={slot.slot_id}>
                      <Typography variant="h6" sx={{ color: "#4cceac", mb: 1 }}>
                        Time: {slot.start_time} - {slot.end_time}
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#fff", mb: 1 }}>
                        Price: ${slot.price}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: slot.is_available ? "#4cceac" : "#ff0000",
                          fontWeight: "bold",
                        }}
                      >
                        {slot.is_available ? "Available" : "Occupied"}
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
                      No slots found
                    </Typography>
                  </Box>
                )}
              </Box>
            </ContentWrapper>

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
            Quét mã để thanh toán qua ZaloPay
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
            Sử dụng ứng dụng ZaloPay để quét mã QR
          </Typography>

          <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
            Đang chờ thanh toán...
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
            Đóng
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default BookingDetail;
