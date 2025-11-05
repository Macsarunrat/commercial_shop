// src/shop/ShopAddItem.jsx
import * as React from "react";
import { Box, Stack, TextField, Button, Typography } from "@mui/material";
import { useAuthStore } from "../stores/authStore";

const API = "https://great-lobster-rightly.ngrok-free.app";
const HDRS = { "ngrok-skip-browser-warning": "true" };

function authHeaders(token, extra = {}) {
  return {
    ...HDRS,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
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

async function apiAddItem(shopId, payload, token) {
  return fjson(`${API}/shops/${shopId}/items`, {
    method: "POST",
    headers: authHeaders(token, { "Content-Type": "application/json" }),
    credentials: "include",
    body: JSON.stringify(payload),
  });
}

export default function ShopAddItem({ shopId }) {
  const token = useAuthStore((s) => s.getToken());
  const [form, setForm] = React.useState({
    Product_Name: "",
    Category_ID: "",
    Brand_ID: "",
    Price: "",
    Stock: "",
  });
  const [busy, setBusy] = React.useState(false);

  const chg = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!token) return alert("กรุณาเข้าสู่ระบบ");
    try {
      setBusy(true);
      await apiAddItem(
        Number(shopId),
        {
          Product_Name: form.Product_Name,
          Category_ID: Number(form.Category_ID || 0),
          Brand_ID: Number(form.Brand_ID || 0),
          Price: Number(form.Price || 0),
          Stock: Number(form.Stock || 0),
        },
        token
      );
      alert("เพิ่มสินค้าเรียบร้อย");
      setForm({
        Product_Name: "",
        Category_ID: "",
        Brand_ID: "",
        Price: "",
        Stock: "",
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box component="form" onSubmit={submit}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        เพิ่มสินค้า
      </Typography>
      <Stack spacing={2} maxWidth={480}>
        <TextField
          label="ชื่อสินค้า"
          name="Product_Name"
          value={form.Product_Name}
          onChange={chg}
          required
        />
        <TextField
          label="หมวดหมู่ (ID)"
          name="Category_ID"
          value={form.Category_ID}
          onChange={chg}
        />
        <TextField
          label="แบรนด์ (ID)"
          name="Brand_ID"
          value={form.Brand_ID}
          onChange={chg}
        />
        <TextField
          label="ราคา"
          name="Price"
          value={form.Price}
          onChange={chg}
        />
        <TextField
          label="สต็อก"
          name="Stock"
          value={form.Stock}
          onChange={chg}
        />
        <Button type="submit" variant="contained" disabled={busy}>
          {busy ? "กำลังเพิ่ม..." : "เพิ่มสินค้า"}
        </Button>
      </Stack>
    </Box>
  );
}
