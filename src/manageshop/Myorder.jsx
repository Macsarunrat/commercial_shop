// src/shop/ShopOrders.jsx
import * as React from "react";
import { Box, Card, Stack, Typography, Button } from "@mui/material";
import { useAuthStore } from "../stores/authStore";

const API = "https://great-lobster-rightly.ngrok-free.app";
const HDRS = { "ngrok-skip-browser-warning": "true" };

function authHeaders(token) {
  return { ...HDRS, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}
async function readNiceError(res) {
  try {
    const j = await res.json();
    if (j?.detail)
      return Array.isArray(j.detail)
        ? j.detail
            .map((d) => `${(d.loc || []).join(".")} : ${d.msg}`)
            .join("\n")
        : String(j.detail);
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

async function apiGetMyShopOrders(token) {
  return fjson(`${API}/shops/my/orders`, {
    headers: authHeaders(token),
    credentials: "include",
  });
}
async function apiGetMyShopOrderDetails(orderId, token) {
  return fjson(`${API}/shops/my/orders/${orderId}`, {
    headers: authHeaders(token),
    credentials: "include",
  });
}

export default function ShopOrders() {
  const token = useAuthStore((s) => s.getToken());
  const [orders, setOrders] = React.useState([]);
  const [detail, setDetail] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      try {
        const rows = await apiGetMyShopOrders(token);
        setOrders(Array.isArray(rows) ? rows : rows?.items ?? []);
      } catch (e) {
        alert(e.message);
      }
    })();
  }, [token]);

  const openDetail = async (oid) => {
    try {
      const d = await apiGetMyShopOrderDetails(oid, token);
      setDetail(d);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        คำสั่งซื้อร้านของฉัน
      </Typography>
      <Stack spacing={1.5}>
        {orders.map((o) => (
          <Card key={o.order_id ?? o.Order_ID} sx={{ p: 2 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography>Order #{o.order_id ?? o.Order_ID}</Typography>
              <Button onClick={() => openDetail(o.order_id ?? o.Order_ID)}>
                รายละเอียด
              </Button>
            </Stack>
          </Card>
        ))}
      </Stack>

      {detail && (
        <Card sx={{ mt: 3, p: 2 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            รายละเอียดคำสั่งซื้อ
          </Typography>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
            {JSON.stringify(detail, null, 2)}
          </pre>
        </Card>
      )}
    </Box>
  );
}
