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
import { useCartStore } from "../stores/cartStore";

const ROW_COLS = {
  xs: "1fr",
  md: "1fr 120px 140px 120px 120px",
};

export default function CartMui() {
  // 1. ดึงข้อมูลและ actions จาก store
  const { items, isLoading, error, setItemQty, removeItem, cartTotal } =
    useCartStore();

  if (isLoading) {
    return <Typography sx={{ p: 4 }}>กำลังโหลดตะกร้า...</Typography>;
  }

  if (error) {
    return (
      <Typography color="error" sx={{ p: 4 }}>
        {error}
      </Typography>
    );
  }

  if (items.length === 0) {
    return <Typography sx={{ p: 4 }}>ตะกร้าของคุณว่างเปล่า</Typography>;
  }

  // 2. Map ข้อมูล (ในอนาคต: ต้องจัดกลุ่มตาม Shop ID)
  return (
    <Box sx={{ p: 2, maxWidth: 1200, mx: "auto" }}>
      {items.map((item) => (
        <CartLikeRow
          key={item.id}
          item={item}
          onUpdateQty={(newQty) => setItemQty(item.id, newQty)}
          onRemove={() => removeItem(item.id)}
        />
      ))}

      {/* (ส่วนสรุปยอดรวม) */}
      <Box sx={{ mt: 4, pr: 4, textAlign: "right" }}>
        <Typography variant="h5">
          ยอดรวม: ฿{cartTotal().toLocaleString("th-TH")}
        </Typography>
        <Button variant="contained" size="large" sx={{ mt: 2 }}>
          ไปหน้าชำระเงิน
        </Button>
      </Box>
    </Box>
  );
}

// 3. Component แถวสินค้าที่รับ props
function CartLikeRow({ item, onUpdateQty, onRemove }) {
  const subtotal = (item.price || 0) * (item.qty || 0);
  const imgUrl = item.image || "https://via.placeholder.com/80x80.png";

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
        <Checkbox size="small" />
        <Typography sx={{ fontWeight: 600 }}>Shop ID: {item.shopId}</Typography>
      </Box>

      <Paper variant="outlined" sx={{ overflow: "hidden" }}>
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
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 2,
              minWidth: 0,
            }}
          >
            <Box
              component="img"
              src={imgUrl}
              alt={item.name}
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
                {item.name}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "text.secondary",
                }}
              >
                <Typography variant="body2">Sell ID:</Typography>
                <Typography variant="body2">{item.id}</Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ textAlign: { md: "right" } }}>
            <Typography sx={{ fontWeight: 600 }}>
              ฿{item.price.toLocaleString("th-TH")}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: { md: "center" } }}>
            <ButtonGroup variant="outlined" size="small">
              <Button onClick={() => onUpdateQty(item.qty - 1)}>-</Button>
              <Button disabled>{item.qty}</Button>
              <Button
                onClick={() => onUpdateQty(item.qty + 1)}
                disabled={item.qty >= item.stock}
              >
                +
              </Button>
            </ButtonGroup>
          </Box>

          <Box sx={{ textAlign: { md: "right" } }}>
            <Typography sx={{ fontWeight: 700, color: "error.main" }}>
              ฿{subtotal.toLocaleString("th-TH")}
            </Typography>
          </Box>

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
              onClick={onRemove}
            >
              Delete
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}