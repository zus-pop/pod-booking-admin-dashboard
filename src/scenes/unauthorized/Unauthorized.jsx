import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
    >
      <Typography variant="h3" gutterBottom>
        Không có quyền truy cập
      </Typography>
      <Typography variant="body1" gutterBottom>
        Bạn không có quyền truy cập trang này
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/web/dashboard")}
        sx={{ mt: 2 }}
      >
        Quay về trang chủ
      </Button>
    </Box>
  );
};

export default Unauthorized;