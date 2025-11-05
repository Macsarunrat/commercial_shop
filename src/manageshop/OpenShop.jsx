// src/openstore/OpenStore.jsx
import * as React from "react";
import { Box, Stack, Grid, TextField, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AppTheme from "../theme/AppTheme";
import { useAuthStore } from "../stores/authStore";

const API = "https://great-lobster-rightly.ngrok-free.app";
const HDRS = { "ngrok-skip-browser-warning": "true" };

// ---------- helpers (เฉพาะไฟล์นี้) ----------
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
    if (j?.detail) {
      if (Array.isArray(j.detail))
        return j.detail
          .map((d) => `${(d.loc || []).join(".")} : ${d.msg}`)
          .join("\n");
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

// หลังสร้างร้านสำเร็จ
localStorage.setItem("hasShop", "1"); // บอกว่า user มีร้านแล้ว
localStorage.setItem("navMode", "seller"); // ตั้งโหมดเริ่มเป็น seller (ถ้าต้องการ)

// ---------- API (เฉพาะหน้านี้) ----------
async function apiCreateMyShop({ Shop_Name, Shop_Phone }, token) {
  return fjson(`${API}/shops/`, {
    method: "POST",
    headers: authHeaders(token, { "Content-Type": "application/json" }),
    credentials: "include",
    body: JSON.stringify({ Shop_Name, Shop_Phone }),
  });
}
async function apiUpsertShopAddress(
  shopId,
  { Tumbon, Amphur, Province, Zipcode },
  token
) {
  // ถ้าหลังบ้านเป็น POST ให้เปลี่ยน method เป็น "POST"
  return fjson(`${API}/shops/${shopId}/address`, {
    method: "PUT",
    headers: authHeaders(token, { "Content-Type": "application/json" }),
    credentials: "include",
    body: JSON.stringify({ Tumbon, Amphur, Province, Zipcode }),
  });
}

// ---------- UI ----------
export default function OpenStore() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.getToken());
  const [form, setForm] = React.useState({
    shopName: "",
    phone: "",
    tumbon: "",
    amphoe: "",
    province: "",
    postcode: "",
  });
  const [busy, setBusy] = React.useState(false);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!token) return alert("กรุณาเข้าสู่ระบบก่อนเปิดร้าน");

    try {
      setBusy(true);
      // 1) สร้างร้าน
      const shop = await apiCreateMyShop(
        { Shop_Name: form.shopName.trim(), Shop_Phone: form.phone.trim() },
        token
      );
      const shopId = shop?.Shop_ID ?? shop?.shop_id;
      if (!shopId) throw new Error("ไม่พบ Shop_ID จากระบบ");

      // 2) บันทึกที่อยู่ร้าน
      await apiUpsertShopAddress(
        shopId,
        {
          Tumbon: form.tumbon.trim(),
          Amphur: form.amphoe.trim(),
          Province: form.province.trim(),
          Zipcode: form.postcode.trim(),
        },
        token
      );

      alert("เปิดร้านสำเร็จ!");
      navigate(`/shop/${shopId}`, { replace: true });
    } catch (err) {
      alert(err.message || "เปิดร้านไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppTheme>
      <Box
        component="form"
        onSubmit={submit}
        sx={{
          p: 3,
          maxWidth: 780,
          mx: "auto",
          mt: 6,
          bgcolor: "white",
          borderRadius: 2,
        }}
      >
        <Stack spacing={3}>
          <Typography variant="h5" fontWeight={700}>
            สมัครเป็นผู้ขาย
          </Typography>

          <TextField
            label="ชื่อร้าน"
            name="shopName"
            value={form.shopName}
            onChange={onChange}
            required
          />
          <TextField
            label="เบอร์โทรศัพท์"
            name="phone"
            value={form.phone}
            onChange={onChange}
            required
            helperText="เช่น 0812345678"
          />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="ตำบล"
                name="tumbon"
                value={form.tumbon}
                onChange={onChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="อำเภอ"
                name="amphoe"
                value={form.amphoe}
                onChange={onChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="จังหวัด"
                name="province"
                value={form.province}
                onChange={onChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="รหัสไปรษณีย์"
                name="postcode"
                value={form.postcode}
                onChange={onChange}
                required
              />
            </Grid>
          </Grid>

          <Button type="submit" variant="contained" disabled={busy}>
            {busy ? "กำลังเปิดร้าน..." : "เปิดร้านค้า"}
          </Button>
        </Stack>
      </Box>
    </AppTheme>
  );
}
