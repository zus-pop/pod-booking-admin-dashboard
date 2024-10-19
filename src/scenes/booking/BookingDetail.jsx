import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import { styled } from "@mui/material/styles";

const API_URL = import.meta.env.VITE_API_URL;

const StyledCard = styled(Card)(() => ({
  backgroundColor: "#4cceac",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  borderRadius: "12px",
  margin: "0",
  height: "560px",
  width: "550px",
  textAlign: "center",
}));

const BookingDetail = () => {
  const { id } = useParams();
  const [bookingDetail, setBookingDetail] = useState(null);
  const [products, setProducts] = useState([]);
  const [slots,setSlots] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchBookingDetail = async () => {
      const response = await fetch(`${API_URL}/api/v1/bookings/${id}`);
      const data = await response.json();
      setBookingDetail(data);
    };

    const fetchProducts = async () => {
      const response = await fetch(`${API_URL}/api/v1/bookings/${id}/products`);
      const data = await response.json();
      setProducts(data);
    };
    const fetchSlots = async () => {
        const response = await fetch(`${API_URL}/api/v1/bookings/${id}/slots`);
        const data = await response.json();
        setSlots(data);
      };
    fetchBookingDetail();
    fetchProducts();
    fetchSlots();
  }, [id]);

  return (
    <Box
      mt="90px"
      height="100vh"
      display="flex"
      justifyContent="center"
      
    >
      {bookingDetail && (
        <Box textAlign="center"> {/* Thêm Box để căn giữa nội dung */}
          <Typography variant="h2" gutterBottom>
            Detail of Booking 
          </Typography>
          <StyledCard>
            <CardContent sx={{ mt: 1 }}>
              <Typography variant="h6" sx={{ fontSize: '1.5rem' }}>
                Booking ID: {bookingDetail.booking_id}
              </Typography>
              <Typography variant="h6" sx={{ fontSize: '1.5rem' }}>
                Date: {bookingDetail.booking_date}
              </Typography>
              <Typography variant="h6" sx={{ fontSize: '1.5rem' }}>
                Status: {bookingDetail.booking_status}
              </Typography>
              <Typography variant="h5" mt={2} sx={{ fontSize: '1.5rem' }}>
                Products:
              </Typography>
              {products.map((product) => (
                <Box key={product.product_id} mb={1}>
                  <Typography sx={{ fontSize: '1.5rem' }}>
                    Name: {product.product_name}
                  </Typography>
                  <Typography sx={{ fontSize: '1.5rem' }}>
                    Price: {product.price}
                  </Typography>
                  <Typography sx={{ fontSize: '1.5rem' }}>
                    Quantity: {product.quantity}
                  </Typography>
                </Box>
              ))}
               <Typography variant="h5" mt={2} sx={{ fontSize: '1.5rem' }}>
                Slots:
              </Typography>
              {slots.map((slot) => (
                <Box key={slot.slot_id} mb={1}>
                  <Typography sx={{ fontSize: '1.5rem' }}>
                    Start time: {slot.start_time}
                  </Typography>
                  <Typography sx={{ fontSize: '1.5rem' }}>
                    End time: {slot.end_time}
                  </Typography>
                  <Typography sx={{ fontSize: '1.5rem' }}>
                    Price: {slot.price}
                  </Typography>
                  <Typography sx={{ fontSize: '1.5rem' }} >
                    Available: {slot.is_available? 'Yes' : 'No'}
                  </Typography>
                </Box>
              ))}
              <Button variant="contained"
               onClick={() => navigate('/web/booking')}
               color="primary" sx={{  fontSize: '1.25rem' }}>
                Go Back
              </Button>
            </CardContent>
          </StyledCard>
        </Box>
      )}
    </Box>
  );
};

export default BookingDetail;