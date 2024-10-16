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

const StoreDetail = () => {
  const { id } = useParams();
  const [storeDetail, setStoreDetail] = useState(null);
  const [pods,setPods] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchStoreDetail = async () => {
      const response = await fetch(`${API_URL}/api/v1/stores/${id}`);
      const data = await response.json();
      setStoreDetail(data);
    };

    const fetchPods = async () => {
        const response = await fetch(`${API_URL}/api/v1/stores/${id}/pods`);
        const data = await response.json();
        setPods(data);
      };
    fetchStoreDetail();
    fetchPods();
  }, [id]);

  return (
    <Box
      mt="90px"
      height="100vh"
      display="flex"
      justifyContent="center"
      
    >
      {storeDetail && (
        <Box textAlign="center"> {/* Thêm Box để căn giữa nội dung */}
          <Typography variant="h2" gutterBottom>
            Detail of Store
          </Typography>
          <StyledCard>
            <CardContent sx={{ mt: 1 }}>
              <Typography variant="h6" sx={{ fontSize: '1.5rem' }}>
                Booking ID: {storeDetail.store_id}
              </Typography>
              <Typography variant="h6" sx={{ fontSize: '1.5rem' }}>
                Name: {storeDetail.store_name}
              </Typography>
              <Typography variant="h6" sx={{ fontSize: '1.5rem' }}>
                Address: {storeDetail.address}
              </Typography>
              <Typography variant="h6" sx={{ fontSize: '1.5rem' }}>
                Hotline: {storeDetail.hotline}
              </Typography>
              <Typography variant="h5" mt={2} sx={{ fontSize: '1.5rem' }}>
                PODS:
              </Typography>
              {pods.map((pod) => (
                <Box key={pod.pod_id} mb={1}>
                  <Typography sx={{ fontSize: '1.5rem' }}>
                    Name: {pod.pod_name}
                  </Typography>
                  <Typography sx={{ fontSize: '1.5rem' }}>
                    Type: {pod.type_id}
                  </Typography>
                  <Typography sx={{ fontSize: '1.5rem' }}>
                    Available: {pod.is_available}
                  </Typography>
                </Box>
              ))}
              
              <Button variant="contained"
               onClick={() => navigate('/web/store')}
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

export default StoreDetail;