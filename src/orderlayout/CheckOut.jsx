// src/ordered/Ordered.jsx
import * as React from "react";
import {
  Box,
  Card,
  CardMedia,
  Stack,
  Typography,
  Divider,
  Chip,
  Button,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  Tooltip,
  LinearProgress,
} from "@mui/material";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useLocation, useNavigate } from "react-router-dom";
import AppTheme from "../theme/AppTheme";
import { useAuthStore } from "../stores/authStore";
import useCartStore from "../stores/cartStore";

const API = "https://great-lobster-rightly.ngrok-free.app";
const HDRS = { "ngrok-skip-browser-warning": "true" };

/* ---------- helpers ---------- */
const fmt = (n) =>
  new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(
    Number(n || 0)
  );

// แปลง object ที่อยู่ให้เป็นสตริงอ่านง่าย
function formatAddress(a) {
  if (!a) return "";
  return [
    a.Address_Number,
    a.Road,
    a.Soi,
    a.Tumbon,
    a.Amphur,
    a.Province,
    a.Optional_Detail,
  ]
    .filter(Boolean)
    .join(" ");
}

// โหลดชื่อร้านทั้งหมด -> Map<shopId, shopName>
async function fetchShopNameMap(signal) {
  const res = await fetch(`${API}/store/shops`, { headers: HDRS, signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = await res.json();
  const list = Array.isArray(raw) ? raw : raw?.items ?? [];
  const map = new Map();
  for (const s of list) {
    const id = s?.Shop_ID ?? s?.shop_id ?? s?.id;
    const name = s?.Shop_Name ?? s?.name ?? "";
    if (id != null) map.set(String(id), name || `Shop #${id}`);
  }
  return map;
}

/* ---------- UI: Payment ---------- */
function PaymentSection() {
  const selected = "mobile_banking";
  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Payment Method
      </Typography>

      <RadioGroup value={selected}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <FormControlLabel
            value="mobile_banking"
            control={<Radio />}
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <SmartphoneIcon />
                <Typography>Mobile Banking</Typography>
                <Chip size="small" color="success" label="Available" />
              </Stack>
            }
          />
          <Tooltip title="จะเปิดให้ใช้งานเร็ว ๆ นี้">
            <span>
              <FormControlLabel
                value="credit_card"
                control={<Radio disabled />}
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CreditCardIcon color="disabled" />
                    <Typography color="text.disabled">
                      Credit / Debit Card
                    </Typography>
                    <Chip size="small" label="Soon" />
                  </Stack>
                }
              />
            </span>
          </Tooltip>
          <Tooltip title="จะเปิดให้ใช้งานเร็ว ๆ นี้">
            <span>
              <FormControlLabel
                value="bank_transfer"
                control={<Radio disabled />}
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AccountBalanceIcon color="disabled" />
                    <Typography color="text.disabled">Bank Transfer</Typography>
                    <Chip size="small" label="Soon" />
                  </Stack>
                }
              />
            </span>
          </Tooltip>
        </Stack>
      </RadioGroup>

      <Divider sx={{ my: 2 }} />

      <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            ชำระผ่านแอปธนาคาร
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Chip size="small" color="success" label="ค่าธรรมเนียม 0 บาท" />
            <Chip size="small" color="info" label="ตัดยอดอัตโนมัติ ~1–3 นาที" />
            <Chip size="small" label="อัปโหลดสลิปได้" />
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}

/* ---------- Page ---------- */
export default function Ordered() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const token = useAuthStore((s) => s.getToken());

  const clearCart = useCartStore((s) => s.clearCart);
  const fetchCart = useCartStore((s) => s.fetchCart);

  // ถ้าเข้าหน้านี้ตรง ๆ และไม่มี state -> กลับ cart
  React.useEffect(() => {
    if (!state?.items?.length) navigate("/cart", { replace: true });
  }, [state, navigate]);
  if (!state?.items?.length) return null;

  // ----- cart / totals -----
  const items = state.items;
  const subtotal = Number(state.subtotal || 0);
  const shipping = Number(state.shipping || 0);
  const total = subtotal + shipping;

  // ----- address ที่ส่งมาจากหน้า Cart -----
  const address = state.address || null;

  // ----- โหลดชื่อร้าน -----
  const [shopNameMap, setShopNameMap] = React.useState(new Map());
  const [shopsError, setShopsError] = React.useState(null);

  React.useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setShopsError(null);
        const map = await fetchShopNameMap(controller.signal);
        setShopNameMap(map);
      } catch (e) {
        setShopsError(e.message || String(e));
      }
    })();
    return () => controller.abort();
  }, []);

  // ----- กลุ่มสินค้าตามร้าน -----
  const groups = {};
  for (const it of items) {
    const sidRaw = it.ShopId ?? it.shopId ?? it.Shop_ID;
    const sid = sidRaw != null ? String(sidRaw) : "unknown";
    if (!groups[sid]) groups[sid] = [];
    groups[sid].push(it);
  }

  // ----- ขั้นตอนชำระ -----
  // idle | checking_out | confirming | done
  const [paymentStep, setPaymentStep] = React.useState("idle");
  const [error, setError] = React.useState(null);
  const [orderId, setOrderId] = React.useState(null);

  async function checkoutMyCart({ token, body }) {
    const res = await fetch(`${API}/orders/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...HDRS,
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      credentials: "include",
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(t || `HTTP ${res.status}`);
    }
    return res.json();
  }

  // Simulation: ยืนยันชำระ
  async function confirmPayment(order_id) {
    const res = await fetch(`${API}/orders/${order_id}/confirm_payment`, {
      method: "POST",
      headers: {
        ...HDRS,
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      credentials: "include",
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(t || `HTTP ${res.status}`);
    }
    return res.json();
  }

  const handlePlaceOrder = async () => {
    if (!token) {
      setError("กรุณาเข้าสู่ระบบก่อนทำรายการสั่งซื้อ");
      return;
    }
    if (!address) {
      setError("กรุณาเลือกที่อยู่จัดส่งก่อนทำการชำระเงิน");
      return;
    }
    setError(null);

    try {
      // STEP 1: checkout
      setPaymentStep("checking_out");
      const payload = {
        Paid_Type_ID: 1,
        Total_Weight: 0,
        Ship_Cost: shipping,
        Paid_Status: "Pending",
        Shipping_Address: address, // ส่งที่อยู่ให้ backend
      };
      const result = await checkoutMyCart({ token, body: payload });
      const oid = result?.Order_ID ?? result?.order_id;
      if (!oid) throw new Error("ไม่พบ Order_ID จากระบบ");
      setOrderId(oid);

      // STEP 2: confirm
      setPaymentStep("confirming");
      await confirmPayment(oid);

      // STEP 3: ล้างตะกร้า + sync + โชว์หน้าสำเร็จ
      clearCart();
      fetchCart().catch(() => {});
      setPaymentStep("done");
    } catch (e) {
      setError(e.message || "สั่งซื้อ/ยืนยันการชำระไม่สำเร็จ");
      setPaymentStep("idle");
    }
  };

  /* ---------- “สั่งซื้อสำเร็จ” ---------- */
  if (paymentStep === "done") {
    return (
      <AppTheme>
        <Box sx={{ maxWidth: 720, mx: "auto", mt: 10, px: 2, pb: 8 }}>
          <Card sx={{ p: 4, textAlign: "center" }}>
            <CheckCircleOutlineIcon
              sx={{ fontSize: 72, color: "success.main" }}
            />
            <Typography variant="h5" fontWeight={800} sx={{ mt: 2 }}>
              สั่งซื้อสำเร็จ!
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              ขอบคุณสำหรับการสั่งซื้อ ระบบได้บันทึกคำสั่งซื้อของคุณเรียบร้อยแล้ว
            </Typography>
            {orderId && (
              <Typography sx={{ mt: 1.5 }}>
                <strong>Order ID:</strong> {orderId}
              </Typography>
            )}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ mt: 4 }}
              justifyContent="center"
            >
              <Button
                variant="contained"
                color="primary"
                onClick={() =>
                  navigate("/", { replace: true, state: { orderId } })
                }
              >
                กลับหน้าแรกทันที
              </Button>
            </Stack>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 2 }}
            >
              ขอบคุณสำหรับคำสั่งซื้อสินค้า
            </Typography>
          </Card>
        </Box>
      </AppTheme>
    );
  }

  /* ---------- หน้าหลักก่อนชำระ ---------- */
  return (
    <AppTheme>
      <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, px: 2, pb: 8 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Products Ordered
        </Typography>

        {shopsError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            โหลดชื่อร้านไม่สำเร็จ: {shopsError}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* progress ของขั้นตอนชำระ */}
        {paymentStep !== "idle" && (
          <Card sx={{ p: 2, mb: 2 }}>
            <Typography fontWeight={700} sx={{ mb: 1 }}>
              {paymentStep === "checking_out" && "กำลังสร้างคำสั่งซื้อ..."}
              {paymentStep === "confirming" && "กำลังยืนยันการชำระเงิน..."}
            </Typography>
            <LinearProgress />
            {orderId && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Order ID: {orderId}
              </Typography>
            )}
          </Card>
        )}

        {/* NEW: Delivery Address */}
        <Card sx={{ p: 2, mb: 3 }}>
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Delivery Address
              </Typography>
              {address ? (
                <Typography sx={{ whiteSpace: "pre-wrap" }}>
                  {formatAddress(address)}
                </Typography>
              ) : (
                <Alert severity="warning" sx={{ m: 0 }}>
                  ยังไม่ได้เลือกที่อยู่จัดส่ง — กรุณากลับไปหน้า Cart
                  เพื่อเพิ่มและเลือกที่อยู่
                </Alert>
              )}
            </Box>
            <Button
              size="small"
              variant="outlined"
              onClick={() => navigate("/cart")}
            >
              เปลี่ยนที่อยู่
            </Button>
          </Stack>
        </Card>

        {/* กลุ่มตามร้าน */}
        {Object.entries(groups).map(([sid, arr]) => {
          const shopName =
            shopNameMap.get(sid) ||
            (sid === "unknown" ? "Unknown Shop" : `Shop #${sid}`);
          return (
            <Card key={sid} sx={{ p: 2, mb: 3 }}>
              <Typography sx={{ color: "text.secondary", mb: 1 }}>
                ShopName : {shopName}
              </Typography>
              {arr.map((it) => (
                <Stack
                  key={`${sid}-${it.id}`}
                  direction="row"
                  alignItems="center"
                  spacing={2}
                  sx={{ py: 1, borderTop: "1px solid", borderColor: "divider" }}
                >
                  <CardMedia
                    component="img"
                    image={it.image || "/IMG1/bagG.png"}
                    alt={it.name}
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                    onError={(e) => (e.currentTarget.src = "/IMG1/bagG.png")}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontWeight={600} noWrap title={it.name}>
                      {it.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ItemId: {it.id}
                    </Typography>
                  </Box>
                  <Box sx={{ width: 200, textAlign: "right" }}>
                    <Typography>฿{fmt(it.price)} (item price)</Typography>
                  </Box>
                  <Box sx={{ width: 120, textAlign: "right" }}>
                    <Typography>{it.qty}</Typography>
                  </Box>
                  <Box sx={{ width: 200, textAlign: "right", fontWeight: 700 }}>
                    ฿{fmt((it.price || 0) * (it.qty || 0))}
                  </Box>
                </Stack>
              ))}
            </Card>
          );
        })}

        {/* Payment + Summary */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 420px" },
            gap: 3,
          }}
        >
          <PaymentSection />

          <Card sx={{ p: 3 }}>
            <Stack spacing={1.5}>
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">
                  Merchandise Subtotal :
                </Typography>
                <Typography>฿{fmt(subtotal)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">
                  Shipping Subtotal :
                </Typography>
                <Typography>฿{fmt(shipping)}</Typography>
              </Box>
              <Divider />
              <Box display="flex" justifyContent="space-between" sx={{ mt: 1 }}>
                <Typography variant="h6" fontWeight={700} color="error.main">
                  Total Payment (cal price) :
                </Typography>
                <Typography variant="h6" fontWeight={700} color="error.main">
                  ฿{fmt(total)}
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="contained"
              color="error"
              size="large"
              fullWidth
              sx={{ mt: 3 }}
              disabled={paymentStep !== "idle" || !address} // ต้องมี address และไม่กำลังทำงาน
              onClick={handlePlaceOrder}
            >
              {paymentStep === "idle" && "PLACE ORDER"}
              {paymentStep === "checking_out" && "CREATING ORDER..."}
              {paymentStep === "confirming" && "CONFIRMING PAYMENT..."}
            </Button>
          </Card>
        </Box>
      </Box>
    </AppTheme>
  );
}
