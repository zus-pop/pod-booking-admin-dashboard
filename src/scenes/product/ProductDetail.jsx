import React from 'react';
import { Box } from "@mui/material";
import Header from '../components/Header';

const ProductDetail = () => {
  return (
    <Box m="20px">
      <Header 
        title="Product Detail" 
        subtitle="View and manage product details"
        showBackButton={true} 
      />
      // ... rest of the code
    </Box>
  );
};

export default ProductDetail; 