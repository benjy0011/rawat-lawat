import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";

const theme = createTheme({
  palette: {
    primary: { main: "#003d9b" },
    secondary: { main: "#00796b" },
    background: { default: "#f6f8fc", paper: "#ffffff" },
  },
  typography: {
    fontFamily: "Inter, Public Sans, Arial, sans-serif",
    h4: { fontWeight: 700, letterSpacing: "-0.035em" },
    button: { fontWeight: 700, textTransform: "none" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: { root: { minHeight: 46, borderRadius: 10 } },
    },
    MuiTextField: { defaultProps: { size: "small", fullWidth: true } },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
