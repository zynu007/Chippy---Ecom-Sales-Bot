import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline'; 

const customTheme = createTheme({

  palette: {
    primary: {
      main:'#000000',  //black primary actions/buttons
    },
    secondary: {
      main: '#424242',    // A darker grey
    },
    background: {
      default: '#F8F8F8',
      paper: '#FFFFFF',  // white for cards
    },
    text: {
      primary: '#1A1A1A', //dark black primary text
      secondary: '#42424', // secondary text
    },
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '20px', // curved edge for buttons
          textTransform: 'none',  //to prevent uppercase text
          '&.MuiButton-containedPrimary': {
            backgroundColor: '#1A1A1A',
            color: '#F8F8F8',
            '&:hover': {
              backgroundColor: '#424242',
            },
          },
          '&.MuiButton-outlinedPrimary': {
            borderColor: '#1A1A1A',
            color: '#1A1A1A',
            '&:hover': {
              backgroundColor: 'rgba(26, 26, 26, 0.05',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
        },
      },
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Aerial',
      'sans-serif'
    ].join('.'),
  },

});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={customTheme}>
      <CssBaseline/>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);


