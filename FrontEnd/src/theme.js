import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#0c3c3c", contrastText: "#fff" },
    secondary: { main: "#45d27a", contrastText: "#fff" },
    background: { default: "#f5f7fa" },
    text: { primary: "#0c3c3c", secondary: "#6c6b6b" }
  },
  typography: {
    fontFamily: '"Poppins", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 16 }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          transition: "background-color 0.2s",
          '&:hover': {
            backgroundColor: "#45d27a",
            color: '#fff', 
          },
        },
      },
    }
  }
});

export default theme;
