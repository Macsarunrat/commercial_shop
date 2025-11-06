// src/categorylayout/CategoryHome.jsx
import * as React from "react";
import { Box, Typography, Button } from "@mui/material";
import AppTheme from "../theme/AppTheme";
import AllCategories2 from "../categorylayout/AllCategories2";

const API = "https://unsparingly-proextension-jacque.ngrok-free.dev";
const HDRS = { "ngrok-skip-browser-warning": "true" };

export default function CategoryHome() {
  // --- Dialog state ---
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  return (
    <AppTheme>
      <Box
        sx={{
          bgcolor: "white",
          my: 4,
          mx: { xs: 2, sm: 4, lg: 10 },
          borderRadius: 1,
          p: 2,
          position: "relative",
        }}
      >
        {/* Header + ปุ่มเพิ่มหมวดหมู่ */}
        <Box
          sx={{
            display: "flex",
            mb: 2,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="h5"
            sx={{ color: "#d62828", fontFamily: "Prompt", fontWeight: 500 }}
          >
            CATEGORIES
          </Typography>
        </Box>

        {/* โซนแสดงหมวดหมู่ (เลย์เอาต์เดิม) */}
        <Box sx={{ mx: -2, mb: -2 }}>
          <AllCategories2 />
        </Box>
      </Box>
    </AppTheme>
  );
}
