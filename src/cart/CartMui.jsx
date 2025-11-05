// src/cart/CartMui.jsx
import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Skeleton from "@mui/material/Skeleton";
import { useNavigate } from "react-router-dom";
import AppTheme from "../theme/AppTheme";

import useCartStore from "../stores/cartStore";
import { useAuthStore } from "../stores/authStore";
// ✅ ไม่ต้อง import server API ตรง ๆ แล้ว ให้ใช้ผ่าน store เท่านั้น
// import { updateCartItemServer, removeCartItemServer } from "../cart/cartCon.jsx";

export default function CartMui({ canCheckout, selectedAddress }) {
  const navigate = useNavigate();

  // ----- Cart store -----
  const items = useCartStore((s) => s.items); // [{id,name,price,stock,image,qty}]
  const cartCount = useCartStore((s) => s.cartCount()); // รวมชิ้น
  const fetchCart = useCartStore((s) => s.fetchCart); // โหลดจากเซิร์ฟเวอร์
  const setItemQtyLocal = useCartStore((s) => s.setItemQty); // อัปเดตจำนวน (store จะยิง API ให้)
  const removeItemLocal = useCartStore((s) => s.removeItem); // ลบ (store จะยิง API ให้)

  // ----- Auth -----
  const token = useAuthStore((s) => s.getToken());

  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState({}); // { [id]: boolean }

  const formatBaht = (n) => new Intl.NumberFormat("th-TH").format(n);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (token) {
          await fetchCart(); // ใช้เมธอดใน store ให้จัดการ API และ state
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [token, fetchCart]);

  // ----- Update quantity -----
  const handleUpdateQuantity = async (sellId, newQty) => {
    // ถ้ากด – แล้วเหลือ 0 => ลบทันที
    if (newQty <= 0) {
      return handleRemoveItem(sellId);
    }
    setUpdating((p) => ({ ...p, [sellId]: true }));
    try {
      // ให้ store จัดการ (ยิง API + อัปเดต state) — ไม่ต้องยิง API ซ้ำเอง
      await setItemQtyLocal(sellId, newQty);
    } catch (e) {
      alert(`อัปเดตไม่สำเร็จ: ${e.message}`);
    } finally {
      setUpdating((p) => ({ ...p, [sellId]: false }));
    }
  };

  const handleCheckout = () => {
    if (!canCheckout) {
      alert("กรุณาเพิ่มและเลือกที่อยู่จัดส่งก่อนดำเนินการชำระเงิน");
      return;
    }
    // ... logic เดิม เช่น navigate ไปหน้า Ordered
    navigate("/ordered", {
      state: {
        // ส่ง summary ที่หน้า Ordered ใช้ render ได้เลย
        items,
        subtotal: totalPrice,
        shipping: 0,
        paymentMethod: "Mobile Banking", // จะให้เปลี่ยนในหน้านี้ก็ได้
        address: selectedAddress,
      },
    });
  };

  // ----- Remove item (optimistic update) -----
  const handleRemoveItem = async (sellId) => {
    if (!confirm("ต้องการลบสินค้านี้ออกจากตะกร้าหรือไม่?")) return;

    // Optimistic: เอาออกจากหน้าจอก่อน
    const prevItems = useCartStore.getState().items;
    useCartStore.setState({
      items: prevItems.filter((p) => String(p.id) !== String(sellId)),
    });

    setUpdating((p) => ({ ...p, [sellId]: true }));
    try {
      // ให้ store ยิง API และ sync ภายใน (จะทำซ้ำกับ state ที่เราเพิ่งเอาออก แต่ไม่เป็นไร)
      await removeItemLocal(sellId);
    } catch (e) {
      // Rollback ถ้า fail
      useCartStore.setState({ items: prevItems });
      alert(`ลบไม่สำเร็จ: ${e.message}`);
    } finally {
      setUpdating((p) => ({ ...p, [sellId]: false }));
    }
  };

  const totalPrice = items.reduce(
    (sum, it) => sum + (it.price || 0) * (it.qty || 0),
    0
  );

  if (loading) {
    return (
      <AppTheme>
        <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, px: 2, pb: 5 }}>
          <Skeleton variant="rectangular" height={400} />
        </Box>
      </AppTheme>
    );
  }

  if (!token) {
    return (
      <AppTheme>
        <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, px: 2, pb: 5 }}>
          <Card sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              กรุณาเข้าสู่ระบบเพื่อดูตะกร้าสินค้า
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/login")}
              sx={{ mt: 2 }}
            >
              เข้าสู่ระบบ
            </Button>
          </Card>
        </Box>
      </AppTheme>
    );
  }

  if (items.length === 0) {
    return (
      <AppTheme>
        <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, px: 2, pb: 5 }}>
          <Card sx={{ p: 4, textAlign: "center" }}>
            <ShoppingCartIcon sx={{ fontSize: 80, color: "text.disabled" }} />
            <Typography variant="h5" sx={{ mt: 2 }}>
              ตะกร้าสินค้าว่างเปล่า
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              คุณยังไม่มีสินค้าในตะกร้า
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/")}
              sx={{ mt: 3 }}
            >
              เริ่มช้อปปิ้ง
            </Button>
          </Card>
        </Box>
      </AppTheme>
    );
  }

  return (
    <AppTheme>
      <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, px: 2, pb: 5 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          ตะกร้าสินค้า ({cartCount} รายการ)
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 360px" },
            gap: 3,
          }}
        >
          {/* รายการสินค้า */}
          <Stack spacing={2}>
            {items.map((it) => {
              const sellId = it.id;
              const qty = it.qty || 0;

              return (
                <Card key={sellId} sx={{ p: { xs: 1.5, md: 2.5 } }}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        md: "96px 1fr 180px 72px",
                      },
                      alignItems: "center",
                      columnGap: 2,
                      rowGap: 1.5,
                    }}
                  >
                    {/* รูป */}
                    <Box sx={{ justifySelf: { md: "start" } }}>
                      <CardMedia
                        component="img"
                        image={it.image || "/IMG1/bagG.png"}
                        alt={it.name}
                        sx={{
                          width: 96,
                          height: 96,
                          objectFit: "cover",
                          borderRadius: 1.2,
                          border: (t) => `1px solid ${t.palette.divider}`,
                        }}
                        onError={(e) =>
                          (e.currentTarget.src = "/IMG1/bagG.png")
                        }
                      />
                    </Box>

                    {/* ชื่อ + ราคา */}
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        noWrap
                        title={it.name}
                        sx={{ lineHeight: 1.3, minHeight: 24 }}
                      >
                        {it.name}
                      </Typography>
                      <Typography
                        variant="h6"
                        color="primary.main"
                        sx={{ mt: 0.5, fontWeight: 700 }}
                      >
                        ฿{formatBaht(it.price || 0)}
                      </Typography>
                    </Box>

                    {/* ปรับจำนวน */}
                    <Box
                      sx={{
                        justifyContent: { md: "center" },
                        display: "flex",
                        alignItems: "center",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        height: 40,
                        width: 160,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleUpdateQuantity(sellId, qty - 1)}
                        disabled={updating[sellId]}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography sx={{ width: 40, textAlign: "center" }}>
                        {qty}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleUpdateQuantity(sellId, qty + 1)}
                        disabled={
                          qty >= (it.stock || Infinity) || updating[sellId]
                        }
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* ลบ */}
                    <Box sx={{ justifySelf: { md: "end" } }}>
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveItem(sellId)}
                        disabled={updating[sellId]}
                        aria-label="delete item"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Card>
              );
            })}
          </Stack>

          {/* สรุปคำสั่งซื้อ */}
          <Card
            sx={{ p: 3, position: "sticky", top: 20, height: "fit-content" }}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom>
              สรุปคำสั่งซื้อ
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1.5}>
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">
                  ยอดรวม ({cartCount} ชิ้น)
                </Typography>
                <Typography>฿{formatBaht(totalPrice)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">ค่าจัดส่ง</Typography>
                <Typography color="success.main">ฟรี</Typography>
              </Box>
              <Divider />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="h6" fontWeight={700}>
                  ยอดรวมทั้งหมด
                </Typography>
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  ฿{formatBaht(totalPrice)}
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="contained"
              size="large"
              color="error"
              fullWidth
              sx={{ mt: 3 }}
              onClick={handleCheckout}
              disabled={!canCheckout}
            >
              ดำเนินการชำระเงิน
            </Button>
            {!canCheckout && (
              <p style={{ color: "#f44336", marginTop: 8 }}>
                กรุณาเพิ่มและเลือกที่อยู่จัดส่งก่อน
              </p>
            )}
            <Button
              variant="outlined"
              size="large"
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => navigate("/")}
            >
              เลือกซื้อสินค้าต่อ
            </Button>
          </Card>
        </Box>
      </Box>
    </AppTheme>
  );
}
