// AppTheme.jsx
import React from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import "@fontsource-variable/inter";

// สร้างธีมที่ต้องการ
const theme = createTheme({
  palette: {
    primary: { main: "#fe2525ff" }, // ฟ้า
    secondary: { main: "#22c55e" }, // เขียว
    background: {
      default: "#f5f5f5",
    },
  },

  typography: {
    fontFamily: ["Inter", "sans-serif"].join(","),
  },
  shape: {
    borderRadius: 12,
  },
});

export default function AppTheme({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
