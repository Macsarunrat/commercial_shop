// src/shop/ShopOrders.jsx
import * as React from "react";
import {
  Box,
  Card,
  Stack,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableContainer,
  Chip,
  Divider,
  CircularProgress,
  Drawer,
} from "@mui/material";
import { useAuthStore } from "../stores/authStore";

const API = "https://unsparingly-proextension-jacque.ngrok-free.dev";
const HDRS = { "ngrok-skip-browser-warning": "true" };

/* ---------- helpers ---------- */
function authHeaders(token) {
  return { ...HDRS, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}
async function readNiceError(res) {
  try {
    const j = await res.json();
    if (j?.detail) {
      if (Array.isArray(j.detail)) {
        return j.detail
          .map((d) => `${(d.loc || []).join(".")} : ${d.msg}`)
          .join("\n");
      }
      return String(j.detail);
    }
  } catch {}
  try {
    return await res.text();
  } catch {}
  return `HTTP ${res.status}`;
}
async function fjson(input, init) {
  const res = await fetch(input, init);
  if (!res.ok) throw new Error(await readNiceError(res));
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/* ---------- APIs ---------- */
async function apiGetMyShopOrders(token) {
  // GET /shops/my/orders (summary list)
  return fjson(`${API}/shops/my/orders`, {
    headers: authHeaders(token),
    credentials: "include",
  });
}
async function apiGetMyShopOrderDetails(orderId, token) {
  // GET /shops/my/orders/{order_id}
  return fjson(`${API}/shops/my/orders/${orderId}`, {
    headers: authHeaders(token),
    credentials: "include",
  });
}

/* ---------- formatters ---------- */
const asNum = (v) => {
  // backend อาจคืน total เป็น string decimal ยาวมาก — แสดงเป็น string ตรง ๆ ก็ได้
  if (v == null) return "-";
  // ถ้าเป็นตัวเลขปกติลองแปลง/จัดรูปแบบ
  const n = Number(v);
  if (!Number.isNaN(n) && Number.isFinite(n)) {
    return n.toLocaleString("th-TH", { minimumFractionDigits: 0 });
  }
  // ถ้าเป็น decimal string ยาวมาก ให้ใส่คอมม่าแบบคร่าว ๆ
  const s = String(v);
  const [intPart, fracPart] = s.split(".");
  const withComma = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fracPart ? `${withComma}.${fracPart}` : withComma;
};
const asDate = (v) => {
  if (!v) return "-";
  const d = new Date(v);
  if (isNaN(d)) return String(v);
  return d.toLocaleString("th-TH");
};
const statusChip = (s) => {
  const text = String(s ?? "-");
  const ok = /paid|success|completed/gi.test(text);
  const pending = /pending|await|processing/gi.test(text);
  const color = ok ? "success" : pending ? "warning" : "default";
  return <Chip size="small" color={color} label={text} />;
};

/* ---------- main ---------- */
export default function ShopOrders() {
  const token = useAuthStore((s) => s.getToken());
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState(null);

  const [open, setOpen] = React.useState(false);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detail, setDetail] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const rows = await apiGetMyShopOrders(token);
        // รองรับทั้ง array ตรง ๆ หรือห่อใน { items: [...] }
        const list = Array.isArray(rows) ? rows : rows?.items ?? [];
        setOrders(list);
      } catch (e) {
        setErr(e.message || "โหลดรายการคำสั่งซื้อไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const openDetail = async (row) => {
    const oid = row.order_id ?? row.Order_ID;
    if (!oid) return;
    setOpen(true);
    setDetail(null);
    setDetailLoading(true);
    try {
      const d = await apiGetMyShopOrderDetails(oid, token);
      setDetail(d);
    } catch (e) {
      setDetail({ __error: e.message || "โหลดรายละเอียดไม่สำเร็จ" });
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <Box sx={{ mx: 5, mt: 5 }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 2 }}>
        คำสั่งซื้อร้านของฉัน
      </Typography>

      <Card variant="outlined">
        <TableContainer>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell width={120}>เลขคำสั่งซื้อ</TableCell>
                <TableCell width={220}>วันที่</TableCell>
                <TableCell>ชื่อลูกค้า</TableCell>
                <TableCell width={160}>สถานะชำระเงิน</TableCell>
                <TableCell align="right" width={180}>
                  ยอดรวมร้าน
                </TableCell>
                <TableCell align="center" width={120}>
                  รายละเอียด
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="center"
                      alignItems="center"
                      sx={{ py: 2 }}
                    >
                      <CircularProgress size={18} />
                      <span>กำลังโหลด...</span>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : err ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{ color: "error.main" }}
                  >
                    {err}
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    ยังไม่มีคำสั่งซื้อ
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((o) => {
                  const id = o.order_id ?? o.Order_ID;
                  const date = o.order_date ?? o.Order_Date;
                  const name = o.customer_name ?? o.Customer_Name;
                  const paid = o.paid_status ?? o.Paid_Status;
                  const total =
                    o.total_price_for_shop ?? o.Total_Price_For_Shop ?? 0;

                  return (
                    <TableRow key={id} hover>
                      <TableCell>#{id}</TableCell>
                      <TableCell>{asDate(date)}</TableCell>
                      <TableCell>{name || "-"}</TableCell>
                      <TableCell>{statusChip(paid)}</TableCell>
                      <TableCell align="right">{asNum(total)}</TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => openDetail(o)}
                        >
                          เปิดดู
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Drawer รายละเอียดคำสั่งซื้อ */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{ sx: { width: { xs: "100%", sm: 480 } } }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={800}>
            รายละเอียดคำสั่งซื้อ
          </Typography>
          <Divider sx={{ my: 1.5 }} />

          {detailLoading ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} />
              <span>กำลังโหลดรายละเอียด…</span>
            </Stack>
          ) : !detail ? (
            <Typography color="text.secondary">ไม่มีข้อมูล</Typography>
          ) : detail.__error ? (
            <Typography color="error.main">{detail.__error}</Typography>
          ) : (
            <>
              {/* ส่วนหัวรายละเอียด */}
              <Stack spacing={0.5} sx={{ mb: 2 }}>
                <Row
                  label="Order ID"
                  value={detail.order_id ?? detail.Order_ID}
                />
                <Row
                  label="วันที่"
                  value={asDate(detail.order_date ?? detail.Order_Date)}
                />
                <Row
                  label="ลูกค้า"
                  value={detail.customer_name ?? detail.Customer_Name}
                />
                <Row
                  label="สถานะชำระเงิน"
                  value={
                    <>{statusChip(detail.paid_status ?? detail.Paid_Status)}</>
                  }
                />
                <Row
                  label="ยอดรวมร้าน"
                  value={asNum(
                    detail.total_price_for_shop ?? detail.Total_Price_For_Shop
                  )}
                />
              </Stack>

              <Divider sx={{ my: 1.5 }} />
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                รายการสินค้า
              </Typography>

              {Array.isArray(detail.items ?? detail.Items) &&
              (detail.items ?? detail.Items).length > 0 ? (
                <Stack spacing={1.25}>
                  {(detail.items ?? detail.Items).map((it, idx) => (
                    <Card key={idx} variant="outlined" sx={{ p: 1.25 }}>
                      <Typography fontWeight={700}>
                        {it.itemdetails?.product_name ??
                          it.ItemDetails?.Product_Name ??
                          "-"}
                      </Typography>
                      <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                        <Small
                          label="จำนวน"
                          value={it.quantity ?? it.Quantity}
                        />
                        <Small
                          label="ราคาต่อชิ้น"
                          value={asNum(
                            it.price_at_purchase ?? it.Price_At_Purchase
                          )}
                        />
                        <Small
                          label="สินค้า ID"
                          value={
                            it.itemdetails?.sell_id ?? it.ItemDetails?.Sell_ID
                          }
                        />
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary">
                  ไม่มีรายการสินค้า
                </Typography>
              )}
            </>
          )}
        </Box>
      </Drawer>
    </Box>
  );
}

/* ---------- small display helpers ---------- */
function Row({ label, value }) {
  return (
    <Stack direction="row" spacing={1}>
      <Typography sx={{ minWidth: 120 }} color="text.secondary">
        {label}:
      </Typography>
      <Typography sx={{ flex: 1 }}>{value ?? "-"}</Typography>
    </Stack>
  );
}
function Small({ label, value }) {
  return (
    <Stack direction="row" spacing={0.75}>
      <Typography color="text.secondary">{label}:</Typography>
      <Typography>{value ?? "-"}</Typography>
    </Stack>
  );
}
