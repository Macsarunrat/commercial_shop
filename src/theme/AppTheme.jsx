// AppTheme.jsx
import React from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import "@fontsource-variable/inter";

// สร้างธีมที่ต้องการ
const theme = createTheme({
  palette: {
    primary: { main: "#d62828" }, // ฟ้า
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
    MuiButton: { styleOverrides: { root: { borderRadius: 0 } } },
    MuiToggleButton: { styleOverrides: { root: { borderRadius: 0 } } },
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
