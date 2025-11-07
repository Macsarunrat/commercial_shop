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
import { calculateShippingCost } from "../lib/calculate"; // นำเข้าฟังก์ชันคำนวณค่าส่ง

// ----- API base & helpers -----
const API_BASE = "https://ritzily-nebule-clark.ngrok-free.dev";
const HDRS = { "ngrok-skip-browser-warning": "true" };
const imgFallback = "";

function imageURL(path) {
  if (!path) return "";
  const u = new URL(path, API_BASE);
  u.searchParams.set("ngrok-skip-browser-warning", "true");
  return u.toString();
}

export default function CartMui({ canCheckout, selectedAddress }) {
  const navigate = useNavigate();

  // ----- Cart store -----
  const items = useCartStore((s) => s.items); // [{id,name,price,stock,image,qty}]
  const cartCount = useCartStore((s) => s.cartCount());
  const fetchCart = useCartStore((s) => s.fetchCart);
  const setItemQtyLocal = useCartStore((s) => s.setItemQty);
  const removeItemLocal = useCartStore((s) => s.removeItem);

  // ----- Auth -----
  const token = useAuthStore((s) => s.getToken());

  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState({}); // { [id]: boolean }

  // ---- รูปจาก /image/ จับคู่ด้วย Product_ID ----
  const [sellToPid, setSellToPid] = React.useState(new Map());
  const [pidToImg, setPidToImg] = React.useState(new Map());

  // โหลด cart
  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (token) {
          await fetchCart();
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [token, fetchCart]);

  // เมื่อ cart (items) พร้อม -> โหลดแผนที่ Sell_ID -> Product_ID และโหลดรูป
  React.useEffect(() => {
    if (!items || items.length === 0) {
      setSellToPid(new Map());
      setPidToImg(new Map());
      return;
    }

    const ctl = new AbortController();
    (async () => {
      try {
        // 1) โหลด products เพื่อทำ map Sell_ID -> Product_ID
        const resProducts = await fetch(`${API_BASE}/store/products`, {
          signal: ctl.signal,
          headers: HDRS,
        });
        if (!resProducts.ok) throw new Error(`HTTP ${resProducts.status}`);
        const rawProducts = await resProducts.json();
        const list = Array.isArray(rawProducts)
          ? rawProducts
          : rawProducts?.items ?? [];

        const mSellToPid = new Map();
        for (const p of list) {
          const sid = p.Sell_ID ?? p.sell_id ?? p.id;
          const pid = p.Product_ID ?? p.product_id;
          if (sid != null && pid != null) {
            mSellToPid.set(String(sid), Number(pid));
          }
        }
        setSellToPid(mSellToPid);

        // 2) โหลดรูปทั้งหมด แล้วเก็บ productId -> รูปแรก
        const resImages = await fetch(`${API_BASE}/image/`, {
          signal: ctl.signal,
          headers: HDRS,
        });
        if (!resImages.ok) throw new Error(`HTTP ${resImages.status}`);
        const rawImages = await resImages.json();

        const mPidToImg = new Map();
        if (Array.isArray(rawImages)) {
          // เลือกรูปแรกของแต่ละ Product_ID ก็พอ (ไม่สน cover ตามที่ขอ)
          for (const r of rawImages) {
            const pid = Number(r.Product_ID ?? r.product_id);
            if (!Number.isFinite(pid)) continue;
            if (!mPidToImg.has(pid)) {
              mPidToImg.set(pid, imageURL(r.Img_Src || r.img_src));
            }
          }
        }
        setPidToImg(mPidToImg);
      } catch (e) {
        console.warn("load images for cart failed:", e);
      }
    })();

    return () => ctl.abort();
  }, [items]);

  const getDisplayImage = (cartItem) => {
    const sid = cartItem?.id;
    const pid = sellToPid.get(String(sid));
    const img = pid ? pidToImg.get(Number(pid)) : null;
    return img || cartItem?.image || imgFallback;
  };

  const formatBaht = (n) => new Intl.NumberFormat("th-TH").format(n);

  const handleUpdateQuantity = async (sellId, newQty) => {
    if (newQty <= 0) return handleRemoveItem(sellId);
    setUpdating((p) => ({ ...p, [sellId]: true }));
    try {
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

    // คำนวณค่าส่ง
    const shippingCost = calculateShippingCost(totalPrice);

    // คำนวณยอดรวมทั้งหมด (รวมค่าส่ง)
    const grandTotal = totalPrice + shippingCost;

    // ส่งข้อมูลทั้งหมดไปยังหน้า ordered
    navigate("/ordered", {
      state: {
        items,
        subtotal: totalPrice,
        shipping: shippingCost, // ส่งค่าส่งไปที่หน้า ordered
        grandTotal, // ส่งยอดรวมทั้งหมด
        paymentMethod: "Mobile Banking",
        address: selectedAddress,
      },
    });
  };

  const handleRemoveItem = async (sellId) => {
    if (!confirm("ต้องการลบสินค้านี้ออกจากตะกร้าหรือไม่?")) return;
    const prevItems = useCartStore.getState().items;
    useCartStore.setState({
      items: prevItems.filter((p) => String(p.id) !== String(sellId)),
    });
    setUpdating((p) => ({ ...p, [sellId]: true }));
    try {
      await removeItemLocal(sellId);
    } catch (e) {
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
          <Stack spacing={2}>
            {items.map((it) => {
              const sellId = it.id;
              const qty = it.qty || 0;
              const displayImg = getDisplayImage(it);

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
                    <Box sx={{ justifySelf: { md: "start" } }}>
                      <CardMedia
                        component="img"
                        image={displayImg}
                        alt={it.name}
                        sx={{
                          width: 96,
                          height: 96,
                          objectFit: "cover",
                          borderRadius: 1.2,
                          border: (t) => `1px solid ${t.palette.divider}`,
                        }}
                      />
                    </Box>
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
                <Typography color="success.main">
                  ฿{formatBaht(calculateShippingCost(totalPrice))}
                </Typography>
              </Box>
              <Divider />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="h6" fontWeight={700}>
                  ยอดรวมทั้งหมด
                </Typography>
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  ฿{formatBaht(totalPrice + calculateShippingCost(totalPrice))}
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
