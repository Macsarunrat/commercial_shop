import * as React from "react";
import {
  Box,
  Paper,
  Typography,
  Checkbox,
  Link,
  Chip,
  Divider,
  ButtonGroup,
  Button,
} from "@mui/material";

// กำหนดเลย์เอาต์คอลัมน์หลักของแถวสินค้าให้เหมือนภาพ
// ซ้าย (รูป+รายละเอียด) | ราคา | จำนวน | Subtotal | แอ็กชัน
const ROW_COLS = {
  xs: "1fr", // มือถือ: เรียงลง
  md: "1fr 120px 140px 120px 120px", // จอปกติ: 5 คอลัมน์
};

export default function CartLikeRow() {
  return (
    <Box sx={{ p: 2 }}>
      {/* แถวชื่อร้าน + checkbox + chat now */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
        <Checkbox size="small" />
        <Typography sx={{ fontWeight: 600 }}>zkdmy04.th(Shopname)</Typography>
        <Box
          component="span"
          sx={{
            ml: 1,
            px: 1,
            py: 0.25,
            borderRadius: 1,
            bgcolor: "success.light",
            color: "common.white",
            fontSize: 12,
          }}
        ></Box>
      </Box>

      {/* การ์ดร้าน + bundle */}
      <Paper variant="outlined" sx={{ overflow: "hidden" }}>
        {/* แบนเนอร์ Bundle */}

        {/* แถวสินค้า */}
        <Box
          sx={{
            px: 2,
            py: 2,
            display: "grid",
            gridTemplateColumns: ROW_COLS,
            alignItems: "center",
            columnGap: 2,
            rowGap: 12 / 8,
          }}
        >
          {/* ซ้าย: รูปสินค้า + รายละเอียด */}
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 2,
              minWidth: 0,
            }}
          >
            {/* img product */}
            <Box
              component="img"
              src="https://via.placeholder.com/80x80.png"
              alt="product"
              sx={{
                width: 80,
                height: 80,
                objectFit: "cover",
                borderRadius: 1,
                border: (t) => `1px solid ${t.palette.divider}`,
                flexShrink: 0,
              }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }} noWrap>
                (NameProduct)
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "text.secondary",
                }}
              >
                <Typography variant="body2">Variations:</Typography>
                <Typography variant="body2">(ProductDetail)</Typography>
              </Box>
            </Box>
          </Box>

          {/* ราคา (เดิม + ปัจจุบัน) */}
          <Box sx={{ textAlign: { md: "right" } }}>
            <Typography
              variant="body2"
              sx={{ textDecoration: "line-through", color: "text.disabled" }}
            >
              (Discount)
            </Typography>
            <Typography sx={{ fontWeight: 600 }}>(Price)</Typography>
          </Box>

          {/* จำนวน (stepper) */}
          <Box sx={{ display: "flex", justifyContent: { md: "center" } }}>
            <ButtonGroup variant="outlined" size="small">
              <Button>-</Button>
              <Button disabled>1</Button>
              <Button>+</Button>
            </ButtonGroup>
          </Box>

          {/* Subtotal */}
          <Box sx={{ textAlign: { md: "right" } }}>
            <Typography sx={{ fontWeight: 700, color: "error.main" }}>
              (RealPrice)
            </Typography>
          </Box>

          {/* Actions */}
          <Box
            sx={{
              textAlign: { xs: "left", md: "right" },
              display: "flex",
              flexDirection: { xs: "row", md: "column" },
              gap: 0.5,
              justifyContent: { xs: "flex-start", md: "flex-end" },
            }}
          >
            <Link
              underline="none"
              color="text.primary"
              sx={{ cursor: "pointer" }}
            >
              Delete
            </Link>
          </Box>
        </Box>
      </Paper>

      {/* ส่วนลด/โค้ดร้าน */}
      <Box
        sx={{
          mt: 2,
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: "text.secondary",
        }}
      ></Box>
    </Box>
  );
}
