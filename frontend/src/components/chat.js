import React from 'react';
import { Typography, Paper, Box } from '@mui/material';
import { motion } from 'framer-motion';
import ProductCardDisplay from './ProductCardDisplay';

const renderTextContent = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  // Split by bold segments and newlines
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      //show bold text
      return (
        <Typography
          key={`bold-${index}`}
          component="span"
          sx={{ fontWeight: 'bold' }}
        >
          {part.slice(2, -2)}
        </Typography>
      );
    }
    
    // to handle newlines
    return part.split('\n').map((line, lineIndex) => (
      <React.Fragment key={`line-${index}-${lineIndex}`}>
        {line}
        {lineIndex < part.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  });
};

const ChatMessage = ({  message, sender, onProductAction }) => {
  const content = message?.content || message?.message || message;
  const type = message?.type || 'text';
  
  const isUser = sender === 'user';
  
  // Animation variants
  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.3 } 
    },
  };

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '12px',
        maxWidth: '85%',
      }}
    >
      <Paper
        sx={{
          padding: '12px 16px',
          borderRadius: isUser 
            ? '20px 20px 5px 20px' 
            : '20px 20px 20px 5px',
          backgroundColor: isUser 
            ? 'primary.main' 
            : 'grey.100',
          color: isUser 
            ? 'primary.contrastText' 
            : 'text.primary',
          boxShadow: 1,
          wordBreak: 'break-word',
        }}
      >
        {type === 'text' && (
          <Typography 
            variant="body2" 
            sx={{ 
              fontSize: '0.95rem',
              lineHeight: 1.4,
            }}
          >
            {renderTextContent(content)}
          </Typography>
        )}
        
        {type === 'products' && Array.isArray(content) && (
          <Box sx={{ mt: 1 }}>
            <ProductCardDisplay 
              products={content} 
              onAction={onProductAction}
            />
          </Box>
        )}
        
        {type !== 'text' && type !== 'products' && (
          <Typography variant="body2">
            {typeof content === 'string' ? content : JSON.stringify(content)}
          </Typography>
        )}
      </Paper>
    </motion.div>
  );
};

export default ChatMessage;