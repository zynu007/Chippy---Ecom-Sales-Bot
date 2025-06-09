import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, TextField, Button, Fab, Tooltip, Alert,
        Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AuthPage from './components/AuthPage';
import ChatMessage from './components/chat';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCardDisplay from './components/ProductCardDisplay';
import {v4 as uuidv4} from 'uuid';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const ChatWindow = ({ isOpen, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [chatSessionId, setChatSessionId] = useState(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        try {
          const response = await axios.get(`${API_BASE_URL}/auth/me/`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          setUser(response.data);
          setIsAuthenticated(true);
          setAuthError(null);
          
          const currentSession = uuidv4();
          setChatSessionId(currentSession);

          const historyResponse = await axios.get(`${API_BASE_URL}/chat/history/`, {
            headers: { Authorization: `Bearer ${accessToken}`},
          });

          //map history to message format
          const fetchedHistory = historyResponse.data.map(msg => ({
            content: msg.message,
            sender: msg.sender,
            type: 'text' // Default type for history messages
          }));

          setMessages(fetchedHistory);

          const userResponse = await axios.get(`${API_BASE_URL}/auth/me/`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (fetchedHistory.length === 0) {
            setMessages([{ 
              content: `Hello ${userResponse.data.username || 'User'}! I'm Chippy, your shopping assistant. How can I help you today?`, 
              sender: 'bot',
              type: 'text'
            }]);
          }
        
        } catch (err) {
          console.error("Token verification failed:", err.response?.data || err.message);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setIsAuthenticated(false);
          setAuthError('Session expired or invalid. Please log in again.');
          setUser(null);
          setMessages([]);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setMessages([]);
      }
    };

    if (isOpen) {
      checkAuthStatus();
    } else {
      setMessages([]);
    }
  }, [isOpen]);

  // useEffect for auto-scrolling

  useEffect(() => {
    if (messagesEndRef.current && chatContainerRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = chatContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100; 
      const isInitialMessage = messages.length === 1 && messages[0].sender === 'bot'; //For initial welcome message

      // Only auto-scroll if the user is already at the bottom, or it's the very first message
      if (isAtBottom || isInitialMessage) {
        // Use a small timeout to ensure DOM has settled after message render
        setTimeout(() => {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 50);
      }
    }
  }, [messages]);

  const handleLoginSuccess = async () => {
    setIsAuthenticated(true);
    setAuthError(null);

    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      try {
        const userResponse = await axios.get(`${API_BASE_URL}/auth/me/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setUser(userResponse.data);

        const currentSession = uuidv4();
        setChatSessionId(currentSession);

        const historyResponse = await axios.get(`${API_BASE_URL}/chat/history/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        
        //map history to new message format
        const fetchedHistory = historyResponse.data.map(msg => ({
          content: msg.message,
          sender: msg.sender,
          type: 'text'
        }));
        setMessages(fetchedHistory);

        if (fetchedHistory.length === 0) {
          setMessages([{ 
            content: `Hello ${userResponse.data.username || 'User'}! I'm Chippy, How can I help you today?`, 
            sender: 'bot',
            type: 'text'
          }]);
        }
      } catch (err) {
        console.error("Failed to fetch user profile or history after login:", err);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setIsAuthenticated(false);
        setAuthError('Failed to load user data or history after login. Please try again.');
        setUser(null);
        setMessages([]);
      }
    }
  };

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await axios.post(`${API_BASE_URL}/auth/logout/`, { refresh: refreshToken }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        console.log('Logged out successfully on backend.');
      } catch (err) {
        console.error('Logout failed on backend:', err.response?.data || err.message);
        setAuthError('Logout failed on server, but session cleared locally.');
      }
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    setUser(null);
    setAuthError(null);
    setMessages([]);
    setChatSessionId(null);
    console.log('Tokens cleared from local storage.');
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (inputMessage.trim() === '') return;

    const userMessageText = inputMessage.trim();
    //Use consistent message structure
    const newUserMessage = { 
      content: userMessageText, 
      sender: 'user', 
      type: 'text' 
    };
    
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputMessage('');

    setIsTyping(true);
    await saveMessageToFirestore(userMessageText, 'user', chatSessionId);

    const accessToken = localStorage.getItem('accessToken');
    const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

    let botResponseContent;
    let botResponseType = 'text';

    const lowerCaseMessage = userMessageText.toLowerCase();

    // Rule-Based Intent Recognition
    if (lowerCaseMessage.includes('good morning')) {
      botResponseContent = `Good morning, ${user?.username || 'User'}! Ready to find some awesome electronics today?`;
    } else if (lowerCaseMessage.includes('good afternoon')) {
      botResponseContent = `Good afternoon! Chippy at your service. What are you looking for?`;
    } else if (lowerCaseMessage.includes('good evening')) {
      botResponseContent = `Good evening! The perfect time to find your next gadget. How can I help?`;
    } else if (lowerCaseMessage.includes('hi') || lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hey')) {
      botResponseContent = `Hello ${user?.username || 'User'}! I'm Chippy, your dedicated electronics assistant. Let's find some cool tech!`;
    } else if (lowerCaseMessage.includes('bye') || lowerCaseMessage.includes('goodbye') || lowerCaseMessage.includes('see ya')) {
      botResponseContent = `Goodbye for now! Don't be a stranger, come back whenever you need electronics advice. Chippy will be here!`;
    }

    // 2. Affirmations / Negations / General Interjections
    else if (lowerCaseMessage.includes('yes') || lowerCaseMessage.includes('yeah') || lowerCaseMessage.includes('yup')) {
      botResponseContent = `Great! What's next on our electronics adventure?`;
    } else if (lowerCaseMessage.includes('no') || lowerCaseMessage.includes('nope') || lowerCaseMessage.includes('nah')) {
      botResponseContent = `Understood. Is there anything else you'd like to explore, or perhaps a different category of electronics?`;
    } else if (lowerCaseMessage.includes('cool') || lowerCaseMessage.includes('awesome')) {
      botResponseContent = `Glad you think so! I try my best. What cool electronics are you interested in today?`;
    }

    // 3. Questions about Chippy
    else if (lowerCaseMessage.includes('who are you') || lowerCaseMessage.includes('what are you')) {
      botResponseContent = "I am Chippy, your friendly AI-powered sales assistant for ElectroAssist. My purpose is to help you search, explore, and find the perfect electronic products. I'm made of code and a lot of caffeine (metaphorically speaking)!";
    } else if (lowerCaseMessage.includes('how are you')) {
      botResponseContent = "As an AI, I don't have feelings, but I'm always ready and running efficiently to help you! How are *you* doing today?";
    } else if (lowerCaseMessage.includes('are you human') || lowerCaseMessage.includes('you real')) {
      botResponseContent = "I'm a bot, and my circuits are humming with excitement to help you find the best electronics! No flesh and blood here, just awesome algorithms.";
    } else if (lowerCaseMessage.includes('tell me a joke') || lowerCaseMessage.includes('joke')) {
      botResponseContent = "Why did the smartphone need glasses? Because it lost all its contacts! 😂 Need help finding some new contacts (or a new phone)?";
    } else if (lowerCaseMessage.includes('one more') || lowerCaseMessage.includes('another one') || lowerCaseMessage.includes('another joke')) {
      botResponseContent = "Why did the capacitor break up with the resistor? Because it couldn't handle the resistance in their relationship! 😂 lets get back to shopping now.";
    }

    // 4. Shopping Process / Assistance
    else if (lowerCaseMessage.includes('help') || lowerCaseMessage.includes('assist')) {
      botResponseContent = "Of course! I'm here to assist you with all your electronics shopping needs. What specifically are you looking for or what question do you have?";
    } else if (lowerCaseMessage.includes('buy') || lowerCaseMessage.includes('purchase') || lowerCaseMessage.includes('checkout') || lowerCaseMessage.includes('add to cart')) {
      botResponseContent = "Great! To proceed with a purchase, please first tell me which product you are interested in. Once you've selected a product, I can guide you through the simulated checkout process.";
    } else if (lowerCaseMessage.includes('shipping') || lowerCaseMessage.includes('delivery')) {
      botResponseContent = "Shipping information usually depends on your location. Can you tell me which product you're considering, and I can give you a general idea? For exact details, please check our shipping policy page!";
    } else if (lowerCaseMessage.includes('payment methods') || lowerCaseMessage.includes('how to pay')) {
      botResponseContent = "We accept various payment methods, including credit/debit cards, net banking, and popular digital wallets. Which method are you planning to use?";
    } else if (lowerCaseMessage.includes('warranty') || lowerCaseMessage.includes('return policy')) {
      botResponseContent = "Warranty and return policies vary by product and manufacturer. Could you tell me which product you're asking about? I can provide general info or direct you to the specific policy.";
    }

    // 5. Product Related (More refined than just search)
    else if (lowerCaseMessage.includes('price') || lowerCaseMessage.includes('cost') || lowerCaseMessage.includes('budget')) {
      botResponseContent = "I can certainly help you with pricing. What specific product are you interested in, and do you have a budget range in mind?";
    } else if (lowerCaseMessage.includes('compare')) {
      botResponseContent = "I can help you compare products. Please tell me which electronics you'd like to compare, or suggest a category.";
    } else if (lowerCaseMessage.includes('trending') || lowerCaseMessage.includes('latest') || lowerCaseMessage.includes('new products')) {
      botResponseContent = "Absolutely! I can help you find the latest and trending electronics. Do you have a specific category in mind, such as smartphones, laptops, headphones, or cameras?";
    } else if (lowerCaseMessage.includes('recommend') || lowerCaseMessage.includes('best') || lowerCaseMessage.includes('good')) {
      botResponseContent = "I'd be happy to recommend some top electronics! To help me, could you tell me what type of product you're looking for (e.g., smartphone, laptop) and what your main usage or priorities are?";
    } else if (lowerCaseMessage.includes('stock') || lowerCaseMessage.includes('available') || lowerCaseMessage.includes('in stock')) {
        botResponseContent = "I can check stock availability for you. What product are you interested in? Once I know the product, I can tell you if it's currently available.";
    } else if (lowerCaseMessage.includes('features') || lowerCaseMessage.includes('specs') || lowerCaseMessage.includes('specifications')) {
        botResponseContent = "I can help you with product features and specifications. Which specific electronic product are you curious about?";
    } else if (lowerCaseMessage.includes('rating') || lowerCaseMessage.includes('reviews')) {
        botResponseContent = "I can help you find products with good ratings or reviews. Which product category or specific item are you looking for?";
    } else if (lowerCaseMessage.includes('accessories') || lowerCaseMessage.includes('add-ons')) {
        botResponseContent = "Looking for accessories? Great! For which electronic device or type of product are you seeking accessories?";
    } else if (lowerCaseMessage.includes('my cart') || lowerCaseMessage.includes('view cart')) {
        botResponseContent = "I'm a sales assistant, not a full cart management system yet! 😉 But I can help you add items to your simulated cart and guide you to checkout. What would you like to add?";
    } else {
      // Default to product search
      const searchQuery = userMessageText;

      try {
        const response = await axios.get(`${API_BASE_URL}/products/?search=${encodeURIComponent(searchQuery)}`, { headers });
        const products = response.data;

        if (products.length > 0) {
          botResponseContent = products.slice(0, 5);
          botResponseType = 'products';

          //Added a preceding text message for product results
          const productCountText = `I found ${products.length} product(s) matching "${searchQuery}". Here are a few:`;
          const productCountMessage = {
            content: productCountText,
            sender: 'bot',
            type: 'text'
          };
          setMessages((prevMessages) => [...prevMessages, productCountMessage]);
          await saveMessageToFirestore(productCountText, 'bot', chatSessionId);
        } else {
          botResponseContent = `I couldn't find anything related to "${searchQuery}". Please try asking by brand name, model name, or categories.`;
        }

      } catch (error) {
        console.error("Error fetching products:", error.response?.data || error.message);
        botResponseType = 'text';
        if (error.response?.status === 401) {
          botResponseContent = "Your session has expired. Please log in again to search for products.";
          handleLogout();
        } else if (error.response?.status === 404) {
          botResponseContent = "Product search service is currently unavailable.";
        } else {
          botResponseContent = "Oops! I encountered an error while searching for products.";
        }
      }
    }

    const botMessage = {
      content: botResponseContent,
      sender: 'bot',
      type: botResponseType
    };
    
    setMessages((prevMessages) => [...prevMessages, botMessage]);
    await saveMessageToFirestore(botResponseContent, 'bot', chatSessionId);

    setIsTyping(false);
  };

  const handleProductAction = (actionType, product) => {
    let botResponse = '';
    if (actionType === 'view_details') {
      botResponse = `Certainly! Here are more details about **${product.name}** (${product.brand}):\nDescription: ${product.description || 'No detailed description available.'}\nPrice: ₹${parseFloat(product.price).toFixed(2)}\nStock: ${product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}.\nWould you like to add it to your cart or continue browsing?`;
    } else if (actionType === 'add_to_cart') {
      if (product.stock_quantity > 0) {
        botResponse = `Great choice! **${product.name}** has been added to your cart. Would you like to continue shopping?`;
      } else {
        botResponse = `I apologize, **${product.name}** is currently out of stock.`;
      }
    }
    
  
    const actionResponseMessage = {
      content: botResponse,
      sender: 'bot',
      type: 'text'
    };
    
    setMessages((prevMessages) => [...prevMessages, actionResponseMessage]);
    saveMessageToFirestore(botResponse, 'bot', chatSessionId);
  };

  const saveMessageToFirestore = async (messageContent, senderType, currentChatSessionId) => {
    let contentToSave = messageContent;
    if (typeof messageContent !== 'string') {
      if (Array.isArray(messageContent) && messageContent.length > 0) {
        contentToSave = `Found ${messageContent.length} products: ${messageContent.map(p => p.name).join(', ')}.`;
      } else {
        contentToSave = JSON.stringify(messageContent);
      }
    }

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken || !user?.id || !currentChatSessionId) {
      console.warn("Cannot save message to Firestore: Missing token, user ID, or session ID.");
      return;
    }
    
    try {
      await axios.post(`${API_BASE_URL}/chat/save/`, {
        message: contentToSave,
        sender: senderType,
        timestamp: Date.now(),
        session_id: currentChatSessionId,
      }, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch (error) {
      console.error(`Error saving ${senderType} message to Firestore:`, error.response?.data || error.message);
    }
  };

  const handleClearChatClick = () => {
    setShowConfirmClear(true);
  };

  const handleConfirmClear = async () => {
    setShowConfirmClear(false);

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setAuthError('You must be logged in to clear chat history.');
      return;
    }
    
    try {
      await axios.delete(`${API_BASE_URL}/chat/clear/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setMessages([]);
      setChatSessionId(uuidv4());
      console.log('Chat history cleared successfully (frontend & backend).');
    } catch (error) {
      console.error("Error clearing chat history:", error.response?.data || error.message);
      setAuthError("Failed to clear chat history. Please try again.");
    }
  };

  const handleCancelClear = () => {
    setShowConfirmClear(false);
  };

  const chatWindowVariants = {
    hidden: {
      opacity: 0,
      //y: 300,
      //x: 300,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      //y: 300,
      //x: 300,
      scale: 0.7,
      transition: {
        duration: 0.4,
        ease: "easeIn",
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={chatWindowVariants}
      style={{
        position: 'fixed',
        zIndex: 1000,
        width: 'auto',
        height: 'auto',
        transformOrigin: 'bottom right',
      }}
    >
      <Box
        sx={{
          bottom: { xs: 0, sm: 90 },
          right: { xs: 0, sm: 20 },
          position: 'fixed',
          width: {
            xs: '100vw',
            sm: '380px',
            md: '420px',
            lg: '450px',
            xl: '480px',
          },
          height: {
            xs: '100vh',
            sm: '70vh',
            md: '550px',
            lg: '600px'
          },
          maxHeight: {
          xs: '100vh',
          sm: '80vh',
          },
          bgcolor: 'background.paper',
          borderRadius: { xs: 0, sm: '12px' },
          boxShadow: { xs: 0, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >


        {/* Chat Header */}
        <Box
          sx={{
            bgcolor: '#ffffff',
            color: '#1a1a1a',
            p: { xs: 1.5, sm: 1 },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTopLeftRadius: { xs: 0, sm: '8px' },
            borderTopRightRadius: { xs: 0, sm: '8px' },
            flexShrink: 0,
            minHeight: { xs: '64px', sm: '56px' },
          }}
        >
          <SmartToyIcon
            sx={{
                color: '#1a1a1a', 
                fontSize: { xs: '32px', sm: '28px' },
                ml: { xs: 0.5, sm: 0 },
            }}
          />
          
          <Box sx={{ display: 'flex', gap: { xs: 1, sm: 0.5 } }}>
            {isAuthenticated && (
              <>
                <Tooltip title="Clear Chat" placement="bottom">
                  <Button 
                    onClick={handleClearChatClick} 
                    sx={{ 
                      minWidth: { xs: '40px', sm: '36px' },
                      width: { xs: '40px', sm: '36px' },
                      height: { xs: '40px', sm: '36px' },
                      padding: 0,
                      color: '#ffffff !important',
                      borderRadius: '6px',
                      backgroundColor: 'transparent',
                      '&:hover': { 
                        backgroundColor: '#ffffff !important',
                        color: '#000000 !important',
                        transform: 'scale(1.05)',
                        '& .MuiSvgIcon-root': {
                          color: '#000000 !important'
                        }
                      },
                      '& .MuiSvgIcon-root': {
                        color: '#ffffff !important'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <ClearAllIcon sx={{ fontSize: { xs: '26px', sm: '24px' }, color: 'inherit' }} />
                  </Button>
                </Tooltip>
                <Tooltip title="Logout" placement="bottom">
                  <Button 
                    onClick={handleLogout} 
                    sx={{ 
                      minWidth: { xs: '40px', sm: '36px' },
                      width: { xs: '40px', sm: '36px' },
                      height: { xs: '40px', sm: '36px' },
                      padding: 0,
                      color: '#ffffff !important',
                      borderRadius: '6px',
                      backgroundColor: 'transparent',
                      '&:hover': { 
                        backgroundColor: '#ffffff !important',
                        color: '#000000 !important',
                        transform: 'scale(1.05)',
                        '& .MuiSvgIcon-root': {
                          color: '#000000 !important'
                        }
                      },
                      '& .MuiSvgIcon-root': {
                        color: '#ffffff !important'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <LogoutIcon sx={{ fontSize:{ xs: '26px', sm: '24px' }, color: 'inherit' }} />
                  </Button>
                </Tooltip>
              </>
            )}
            <Tooltip title="Close" placement="bottom">
              <Button 
                onClick={onClose} 
                sx={{ 
                  minWidth: { xs: '40px', sm: '36px' },
                  width: { xs: '40px', sm: '36px' },
                  height: { xs: '40px', sm: '36px' },
                  padding: 0,
                  color: '#ffffff !important',
                  borderRadius: '6px',
                  backgroundColor: 'transparent',
                  '&:hover': { 
                    backgroundColor: '#ffffff !important',
                    color: '#000000 !important',
                    transform: 'scale(1.05)',
                    '& .MuiSvgIcon-root': {
                      color: '#000000 !important'
                    }
                  },
                  '& .MuiSvgIcon-root': {
                    color: '#ffffff !important'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <CloseIcon sx={{ fontSize: { xs: '26px', sm: '24px' }, color: 'inherit' }} />
              </Button>
            </Tooltip>
          </Box>
        </Box>

        {authError && <Alert severity="error" sx={{ 
          m: { xs: 1, sm: 2 },
          fontSize: { xs: '0.875rem', sm: '0.875rem' }
          }}>
            {authError}
          </Alert>}
        
        <Dialog
          open={showConfirmClear}
          onClose={handleCancelClear}
          aria-labelledby="clear-chat-dialog-title"
          sx={{ '& .MuiPaper-root': { 
                borderRadius: { xs: 0, sm: '12px' },
                minWidth: { xs: '100%', sm: '350px' },
                margin: { xs: 0, sm: '32px' },

              }
            }}
        >
          <DialogTitle id="clear-chat-dialog-title" sx={{ color: 'text.primary', fontSize: {xs: '1.1rem', sm:'1,25rem'}, padding: {xs:2, sm:3}
         }}>
            Confirm Clear Chat History
          </DialogTitle>
          <DialogContent dividerssx={{
            padding: { xs: 2, sm: 3 }
            }}
          >
            <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              Are you sure you want to delete all your chat history?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: { xs: 2, sm: 2 }, gap: { xs: 1, sm: 0 } }}>
            <Button onClick={handleCancelClear} variant="contained" color="primary" sx={{ borderRadius: '20px', fontSize: { xs: '0.875rem', sm: '0.875rem' }, padding: { xs: '8px 16px', sm: '6px 16px' } }}>
              No, Keep It
            </Button>
            <Button onClick={handleConfirmClear} variant="contained" color="primary" sx={{ borderRadius: '20px', fontSize: { xs: '0.875rem', sm: '0.875rem' },
              padding: { xs: '8px 16px', sm: '6px 16px' } }} autoFocus>
              Yes, Clear Chat
            </Button>
          </DialogActions>
        </Dialog>

        {isAuthenticated ? (
          <Box sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column',
            minHeight: 0,
          }}>


            {/* Chat Messages Display Area */}
            <Box
              ref={chatContainerRef}
              sx={{
                flex: '1 1 0',
                minHeight: 0,
                p: { xs: 1, sm: 2 },
                overflowY: 'auto',
                overflowX: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                '&::-webkit-scrollbar': {
                  width: { xs: '4px', sm: '6px' },
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  borderRadius: '3px',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.5)',
                  },
                },
              }}
            >
              <AnimatePresence initial={false}>
                {messages.map((msg, index) => (
                  <ChatMessage 
                    key={index} 
                    message={msg} 
                    sender={msg.sender}
                    onProductAction={handleProductAction}
                  />
                ))}
              </AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ alignSelf: 'flex-start', marginBottom: '10px' }}
                >
                  <Paper sx={{ 
                    padding: { xs: '6px 10px', sm: '8px 12px' }, 
                    borderRadius: '20px 20px 20px 5px', 
                    backgroundColor: 'grey.200', 
                    boxShadow: 1 
                  }}>
                    <Typography variant="body2" sx={{fontSize: { xs: '0.8rem', sm: '0.9rem' }, color: 'text.secondary' }}>
                      <span className="dot-animation">.</span>
                      <span className="dot-animation delay-1">.</span>
                      <span className="dot-animation delay-2">.</span>
                    </Typography>
                  </Paper>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </Box>


            {/* Chat Input Area */}
            <Box sx={{ 
              p: { xs: 1, sm: 1.5 }, 
              borderTop: '1px solid #eee', 
              flexShrink: 0,
              backgroundColor: 'background.paper',
              paddingBottom: { xs: 'env(safe-area-inset-bottom)', sm: 1.5 },
            }}>
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: { xs: '8px', sm: '10px' }, }}>
                <TextField
                  variant="outlined"
                  fullWidth
                  size="small"
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '20px', // Curved input field
                      pr: 1,
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      minHeight: { xs: '44px', sm: '40px' }, 
                    },
                    input: { color: 'text.primary',
                      padding: { xs: '12px 14px', sm: '8.5px 14px' },
                     }
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ borderRadius: '20px', minWidth: { xs: '60px', sm: 'auto' }, 
                    px: { xs: 1.5, sm: 2 },
                    height: { xs: '44px', sm: '40px' },
                    fontSize: { xs: '0.875rem', sm: '0.875rem' } 
                  }}
                  disabled={inputMessage.trim() === ''} // Disable if input is empty
                >
                  Send
                </Button>
              </form>
            </Box>
          </Box>
        ) : (
          <AuthPage onLoginSuccess={handleLoginSuccess} />
        )}
      </Box>
    </motion.div>
  );
};


// App component (no changes)
function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const handleOpenChat = () => setIsChatOpen(true);
  const handleCloseChat = () => setIsChatOpen(false);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
        padding: { xs: 2, sm: 3 },
        pb: { xs: 8, sm: 10 },
      }}
    >
      <Box
        sx={{
          textAlign: 'center',
          mb: 5,
          mt: { xs: 3, sm: 5 },
          maxWidth: '800px',
          px: { xs: 1, sm: 0 },
        }}
      >
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold',
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
          }}
        >
          Welcome to ElectroAssist!
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'text.secondary', 
            mb: 4,
            fontSize: { xs: '1.1rem', sm: '1.25rem' }
          }}
        >
          Your Ultimate Electronics Destination.
        </Typography>
        <Typography 
          variant="body1" 
          paragraph
          sx={{
            fontSize: { xs: '0.95rem', sm: '1rem' },
            lineHeight: { xs: 1.5, sm: 1.6 }
          }}
        >
          Explore the latest in cutting-edge electronics, from powerful laptops and sleek smartphones to immersive audio devices and smart home gadgets. ElectroAssist is here to help you find the perfect tech that fits your needs and lifestyle.
        </Typography>
        <Typography 
          variant="body1" 
          paragraph
          sx={{
            fontSize: { xs: '0.95rem', sm: '1rem' },
            lineHeight: { xs: 1.5, sm: 1.6 }
          }}
        >
          Our chatbot 'Chippy' is ready to answer your questions, help you discover products, compare features, and guide you through your purchase journey. Click the chat icon at the bottom right to get started!
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ 
            mt: 3, 
            py: { xs: 1.2, sm: 1.5 },
            px: { xs: 3, sm: 4 },
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }}
        >
          Browse All Electronics
        </Button>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: { xs: 1.5, sm: 3 },
          mt: 4,
          flexWrap: 'wrap'
        }}>
          <Button 
            variant="contained" 
            color="primary"
            sx={{
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              px: { xs: 2, sm: 3 },
              py: { xs: 0.8, sm: 1 }
            }}
          >
            Smartphones
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            sx={{
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              px: { xs: 2, sm: 3 },
              py: { xs: 0.8, sm: 1 }
            }}
          >
            Laptops
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            sx={{
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              px: { xs: 2, sm: 3 },
              py: { xs: 0.8, sm: 1 }
            }}
          >
            Headphones
          </Button>
        </Box>
      </Box>

      {!isChatOpen && (
        <Tooltip title="Call Chippy!" placement="left">
          <Fab
            color="primary"
            aria-label="chat"
            onClick={handleOpenChat}
            sx={{
              position: 'fixed',
              bottom: { xs: 16, sm: 20 },
              right: { xs: 16, sm: 20 },
              zIndex: 1100,
              boxShadow: 6,
              width: { xs: 56, sm: 56 },
              height: { xs: 56, sm: 56 },
              '&:hover': {
                backgroundColor: 'secondary.main',
              },
            }}
          >
            <SmartToyIcon sx={{ 
              color: 'primary.contrastText',
              fontSize: { xs: '28px', sm: '24px' }
            }}/>
          </Fab>
        </Tooltip>
      )}

      <AnimatePresence>
        {isChatOpen && (
          <ChatWindow isOpen={isChatOpen} onClose={handleCloseChat} />
        )}
      </AnimatePresence>
    </Box>
  );
}

export default App;