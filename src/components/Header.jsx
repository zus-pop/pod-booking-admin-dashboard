/* eslint-disable react/prop-types */
import { Box, Typography, useTheme, Button } from "@mui/material";
import { tokens } from "../theme";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Header = ({ title, subtitle, showBackButton = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  return (
    <Box mb="30px" display="flex" justifyContent="space-between" alignItems="center">
      <Box>
        {showBackButton && (
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              mb: 2,
              color: colors.gray[100],
              borderColor: colors.gray[100],
              '&:hover': {
                borderColor: colors.greenAccent[500],
                color: colors.greenAccent[500],
              }
            }}
          >
            Back
          </Button>
        )}
        <Typography
          variant="h2"
          color={colors.gray[100]}
          fontWeight="bold"
          sx={{ mb: "5px" }}
        >
          {title}
        </Typography>
        <Typography variant="h5" color={colors.greenAccent[400]}>
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );
};

export default Header;
