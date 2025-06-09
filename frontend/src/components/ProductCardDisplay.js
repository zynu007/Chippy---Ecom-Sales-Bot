import React from 'react';
import { Box, Typography, Card, CardContent, CardMedia, Button, Link } from '@mui/material';
import { motion } from 'framer-motion';

const ProductCardDisplay = ({ products, onAction }) => {
  // Animation variants for container of product cards
  console.log('ProductCardDisplay received onAction:', onAction);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Stagger animation for children cards
      },
    },
  };

  //Animation for individual product cards
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '15px', // Space between cards
        marginTop: '10px',
        maxWidth: '100%', //Ensure it fits within chat bubble
      }}
    >
      {products.map((product, index) => (
        <motion.div key={product.product_id} variants={itemVariants}>
          <Card
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 1.5,
              borderRadius: '12px',
              backgroundColor: 'background.paper', // White card background
              boxShadow: 2, // Subtle shadow for card lift
              width: '100%', // tells tp occupy full width of container
              flexDirection: { xs: 'column', sm: 'row' }, // responsiveness, Stack on mobile, row on desktop
              textAlign: { xs: 'center', sm: 'left' },
            }}
          >
            {product.image_url && (
              <CardMedia
                component="img"
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '8px',
                  objectFit: 'cover',
                  mr: { sm: 1.5 }, // Margin right on desktop
                  mb: { xs: 1, sm: 0 }, // Margin bottom on mobile
                }}
                image={product.image_url}
                alt={product.name}
              />
            )}
            <CardContent sx={{ flexGrow: 1, p: 0, '&:last-child': { pb: 0 } }}> 
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary', fontSize: '1rem' }}>
                {product.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                {product.brand} - ₹{parseFloat(product.price).toFixed(2)}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                Stock: {product.stock_quantity > 0 ? product.stock_quantity : 'Out of Stock'}
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                <Button
                  variant="contained"
                  size="small"
                  sx={{ borderRadius: '15px', textTransform: 'none', color: 'primary.main', borderColor: 'primary.main' }}
                  onClick={() => onAction('view_details', product)}
                >
                  View Details
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  sx={{ borderRadius: '15px', textTransform: 'none' }}
                  onClick={() => onAction('add_to_cart', product)}
                  disabled={product.stock_quantity <= 0}
                >
                  Add to Cart
                </Button>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ProductCardDisplay;