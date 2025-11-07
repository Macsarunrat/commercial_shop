import React from "react";
import { Box, Stack, Typography, Button } from "@mui/material";
import AppTheme from "../theme/AppTheme";

const BarHome = () => {
  return (
    <AppTheme>
      <Stack sx={{ px: { xs: 2, md: 10 }, pt: 4 }}>
        <Box
          sx={{
            bgcolor: "primary.main",
            borderRadius: 3,
            minHeight: { xs: 100, md: 120 }, // แทน 20vh
            px: { xs: 3, md: 5 },
            py: { xs: 3, md: 5 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            boxShadow: "0 8px 24px rgba(255,255,255,0.35)",
          }}
        >
          <Typography
            variant="h4"
            fontWeight={600}
            sx={{ color: "primary.contrastText" }}
          >
            Welcome to Our Shop!
          </Typography>
          <Typography
            variant="h6"
            sx={{ mt: 1, color: "primary.contrastText" }}
          >
            เลือกช้อปสินค้าหลากหลายได้ตามต้องการ ค่าส่งขั้นต่ำเพียง 50
            บาทเพิ่มขึ้นตามราคาสินค้า มากกว่า 1000 ส่งฟรี
          </Typography>
        </Box>
      </Stack>
    </AppTheme>
  );
};

export default BarHome;
