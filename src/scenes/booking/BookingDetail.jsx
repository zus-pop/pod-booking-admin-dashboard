import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
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
  const navigate = useNavigate();
  useEffect(() => {
    const fetchBookingDetail = async () => {
      const result = await axios.get(`${API_URL}/api/v1/bookings/${id}`);

      setBookingDetail(result.data);
    };

    const fetchProducts = async () => {
      const result = await axios.get(
        `${API_URL}/api/v1/bookings/${id}/products`
      );

      setProducts(result.data);
    };
    const fetchSlots = async () => {
      const result = await axios.get(`${API_URL}/api/v1/bookings/${id}/slots`);

      setSlots(result.data);
    };
    fetchBookingDetail();
    fetchProducts();
    fetchSlots();
  }, [id]);
  return (
    <Box mt="20px" height="100vh">
      <Typography variant="h2" textAlign="center" gutterBottom>
        Detail of Booking
      </Typography>

      <Box mx="20px">
        {bookingDetail && (
          <>
            <Box mb={4}>
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

            <ContentWrapper>
              <Typography variant="h4" sx={{ color: "#fff", mb: 3 }}>
                Products
              </Typography>
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
                      <Typography variant="h5" sx={{ color: "#4cceac", mb: 1 }}>
                        {product.product_name}
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#fff", mb: 1 }}>
                        Price: ${product.price}
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#fff" }}>
                        Quantity: {product.quantity}
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
                      No products found
                    </Typography>
                  </Box>
                )}
              </Box>
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
    </Box>
  );
};

export default BookingDetail;
