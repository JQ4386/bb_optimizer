'use client';
import { createTheme, alpha } from '@mui/material/styles';
import { Quicksand } from 'next/font/google'; 

// Instantiate the new font
const quicksand = Quicksand({ 
  // Specify weights needed
  weight: ['300', '400', '500', '600', '700'], 
  subsets: ['latin'],
  display: 'swap',
});

// Define game-like colors
const mainBg = '#3a2e29';       // Darker background for the page
const panelBg = '#e4d7c6';      // Light parchment/panel background
const panelBorder = '#a1887f';  // Border for panels
const textPrimary = '#4e342e';  // Dark brown for main text
const textSecondary = '#795548';// Lighter brown for secondary text
const goldAccent = '#c79100';   // Gold color for buttons/accents
const buttonText = '#ffffff';   // White text on buttons

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: goldAccent,        // Gold for primary actions
      contrastText: textPrimary, // Dark text on gold buttons might work
    },
    secondary: {
      main: panelBorder,       // Use panel border color for secondary actions
      contrastText: textPrimary,
    },
    background: {
      default: mainBg,        // Dark outer background
      paper: panelBg,         // Light panel background
    },
    text: {
      primary: textPrimary,    
      secondary: textSecondary,   
    },
    divider: alpha(panelBorder, 0.5), // Divider color based on panel border
  },
  typography: {
    fontFamily: quicksand.style.fontFamily,
    h4: { fontWeight: 700, color: goldAccent, textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }, // Style title
    h6: { fontWeight: 600, color: textPrimary },
    body1: { color: textPrimary },
    body2: { color: textSecondary },
    button: {
      textTransform: 'none', 
      fontWeight: 700,
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: panelBg,
          border: `1px solid ${panelBorder}`,
          borderRadius: '8px', // Slightly rounded panels
          boxShadow: `2px 2px 5px ${alpha(mainBg, 0.3)}`, // Inner shadow might be hard, use outer
        },
        elevation: { // Use elevation prop conceptually
             boxShadow: `3px 3px 8px ${alpha(mainBg, 0.4)}`,
        }
      },
    },
    MuiCard: { // Style bounty slots like list items
      styleOverrides: {
        root: {
          backgroundColor: alpha(panelBg, 0.8), // Slightly transparent card bg
          border: `1px solid ${alpha(panelBorder, 0.7)}`,
          boxShadow: 'none', // Remove card shadow
          borderRadius: '4px',
          marginBottom: '8px', // Space between slots
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '16px', // Pill shape
          borderWidth: '2px', // Thicker border
          padding: '4px 16px',
          boxShadow: `1px 1px 3px ${alpha(mainBg, 0.4)}`,
          '&:hover': {
            borderWidth: '2px',
          }
        },
        containedPrimary: {
          backgroundColor: goldAccent,
          border: `2px solid ${alpha(textPrimary, 0.5)}`,
          color: textPrimary,
          '&:hover': {
            backgroundColor: alpha(goldAccent, 0.85),
          }
        },
        outlined: {
           borderColor: alpha(panelBorder, 0.8),
           color: textPrimary,
           '&:hover': {
              backgroundColor: alpha(panelBorder, 0.1),
           }
        }
        // Add other variants if needed (e.g., text button style)
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small' 
      },
      styleOverrides: {
        root: {
          '& label': {
             color: textSecondary,
          },
          '& .MuiOutlinedInput-root': {
            backgroundColor: alpha(panelBg, 0.6), // Make input bg slightly different
            borderRadius: '4px',
            '& fieldset': {
              borderColor: alpha(panelBorder, 0.6),
            },
            '&:hover fieldset': {
              borderColor: panelBorder,
            },
            '&.Mui-focused fieldset': {
              borderColor: goldAccent,
            },
            '& input': {
                color: textPrimary,
            },
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: { /* Adjust size or position if needed */ },
        switchBase: {
          color: panelBorder, // Color of the thumb
          '&.Mui-checked': {
            color: goldAccent, // Color of thumb when checked
          },
          '&.Mui-checked + .MuiSwitch-track': {
            backgroundColor: alpha(goldAccent, 0.5), // Track color when checked
          },
        },
        track: {
           backgroundColor: alpha(panelBorder, 0.3), // Track color when off
        }
      },
    },
    MuiCssBaseline: { // Apply global background
      styleOverrides: {
        body: {
          backgroundColor: mainBg,
          // Add background texture/image if available
          // backgroundImage: 'url(/path/to/texture.png)',
        },
      },
    },
  },
});

export default theme;
