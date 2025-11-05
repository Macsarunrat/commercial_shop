// src/shop/ShopAddItem.jsx
import * as React from "react";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Grid,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import AppTheme from "../theme/AppTheme";

/* ----------------- Config ----------------- */
const API = "https://great-lobster-rightly.ngrok-free.app";
const HDRS = { "ngrok-skip-browser-warning": "true" };

/* ----------------- Helpers ---------------- */
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

/* ----------------- API -------------------- */
async function apiGetMyShopProfile(token) {
  return fjson(`${API}/shops/me/profile`, { headers: authHeaders(token) });
}

async function apiAddItem(shopId, payload, token) {
  // payload: { Product_Name, Price, Stock, Category_ID }
  return fjson(`${API}/shops/${shopId}/items`, {
    method: "POST",
    headers: authHeaders(token, { "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
}

/* --------------- Component ---------------- */
export default function ShopAddItem({ shopId: shopIdProp }) {
  const token = useAuthStore((s) => s.getToken());
  const { shopId: shopIdParam } = useParams();

  const [shopId, setShopId] = React.useState(null);
  const [shopName, setShopName] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [pageError, setPageError] = React.useState(null);

  const [form, setForm] = React.useState({
    Product_Name: "",
    Price: "",
    Stock: "",
    Category_ID: "", // ✅ ต้องมีและต้องเป็นเลขจำนวนเต็มบวก
    Brand_ID: "",
  });
  const [errors, setErrors] = React.useState({});
  const [busy, setBusy] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState("");

  // ---------- resolve shopId ----------
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setPageError(null);
      try {
        let sid =
          shopIdProp ?? (shopIdParam != null ? Number(shopIdParam) : null);

        if (!Number.isInteger(sid) || sid <= 0) {
          if (!token) throw new Error("ไม่พบรหัสร้านและยังไม่ได้เข้าสู่ระบบ");
          const prof = await apiGetMyShopProfile(token);
          sid = Number(prof?.Shop_ID);
          if (!Number.isInteger(sid) || sid <= 0)
            throw new Error("ยังไม่มีร้านของคุณ โปรดสร้างร้านก่อน");
          if (!cancelled) setShopName(prof?.Shop_Name || "");
        }
        if (!cancelled) setShopId(sid);
      } catch (e) {
        if (!cancelled) setPageError(e.message || "โหลดข้อมูลร้านไม่สำเร็จ");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopIdProp, shopIdParam, token]);

  const chg = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((err) => ({ ...err, [name]: "" }));
    setSuccessMsg("");
  };

  function validate() {
    const err = {};

    if (!form.Product_Name.trim()) err.Product_Name = "กรุณากรอกชื่อสินค้า";

    const price = Number(form.Price);
    if (!Number.isFinite(price) || price < 0) err.Price = "กรอกราคาให้ถูกต้อง";

    const stock = Number(form.Stock);
    if (!Number.isInteger(stock) || stock < 0)
      err.Stock = "กรอกสต็อกเป็นจำนวนเต็ม ≥ 0";

    const catStr = String(form.Category_ID).trim();
    const cat = Number(catStr);
    if (!catStr) {
      err.Category_ID = "กรุณาระบุ Category_ID";
    } else if (!Number.isInteger(cat) || cat <= 0) {
      err.Category_ID = "Category_ID ต้องเป็นจำนวนเต็มบวก";
    }

    const brStr = String(form.Brand_ID).trim();
    const br = Number(brStr);
    if (!brStr) err.Brand_ID = "กรุณาระบุ Brand_ID";
    else if (!Number.isInteger(br) || br <= 0)
      err.Brand_ID = "Brand_ID ต้องเป็นจำนวนเต็มบวก";

    setErrors(err);
    return Object.keys(err).length === 0;
  }

  const submit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setPageError(null);

    if (!token) {
      setPageError("กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้า");
      return;
    }
    if (!Number.isInteger(Number(shopId)) || Number(shopId) <= 0) {
      setPageError("ไม่พบ shop_id ที่ถูกต้อง");
      return;
    }
    if (!validate()) return;

    try {
      setBusy(true);

      const payload = {
        Product_Name: form.Product_Name.trim(),
        Price: Number(form.Price || 0),
        Stock: Number(form.Stock || 0),
        // ✅ ส่งเป็น “ตัวเลขจริง” เท่านั้น ห้ามส่ง null/สตริงว่าง
        Category_ID: Number(form.Category_ID),
        Brand_ID: Number(form.Brand_ID),
      };

      await apiAddItem(Number(shopId), payload, token);

      setSuccessMsg("เพิ่มสินค้าเรียบร้อย ✅");
      setForm({
        Product_Name: "",
        Price: "",
        Stock: "",
        Category_ID: "",
        Brand_ID: "",
      });
      setErrors({});
    } catch (err) {
      const msg = String(err?.message || "");
      if (msg.includes("FOREIGN KEY") || msg.includes("1452")) {
        setPageError("เพิ่มสินค้าไม่สำเร็จ: Category_ID ไม่พบในระบบ");
      } else if (
        msg.toLowerCase().includes("duplicate") ||
        msg.includes("1062") ||
        msg.includes("unique")
      ) {
        setPageError("เพิ่มสินค้าไม่สำเร็จ: ข้อมูลซ้ำ/ผิดเงื่อนไข unique");
      } else if (msg.toLowerCase().includes("valid integer")) {
        setPageError(
          "รูปแบบข้อมูลไม่ถูกต้อง: โปรดตรวจสอบ Category_ID/ราคา/สต็อก"
        );
      } else {
        setPageError(msg || "เพิ่มสินค้าไม่สำเร็จ");
      }
    } finally {
      setBusy(false);
    }
  };

  /* ----------------- UI ------------------ */
  return (
    <AppTheme>
      <Box sx={{ maxWidth: 780, mx: "auto", px: 2, py: 4 }}>
        <Card
          variant="outlined"
          sx={{ borderRadius: 2, boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
            <Typography variant="h5" fontWeight={800} gutterBottom>
              จัดการสินค้า — เพิ่มสินค้าใหม่
            </Typography>

            {loading && (
              <Typography color="text.secondary">
                กำลังโหลดข้อมูลร้าน…
              </Typography>
            )}

            {!loading && pageError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {pageError}
              </Alert>
            )}

            {!loading && !pageError && (
              <>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  {shopName ? (
                    <>
                      ร้านของคุณ: <b>{shopName}</b> (Shop ID: {shopId})
                    </>
                  ) : (
                    <>
                      Shop ID: <b>{shopId}</b>
                    </>
                  )}
                </Typography>

                {successMsg && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    {successMsg}
                  </Alert>
                )}

                <Box component="form" onSubmit={submit}>
                  <Grid container rowSpacing={2} columnSpacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="ชื่อสินค้า *"
                        name="Product_Name"
                        value={form.Product_Name}
                        onChange={chg}
                        error={!!errors.Product_Name}
                        helperText={
                          errors.Product_Name ||
                          "เช่น กระเป๋าถือ หนังแท้ รุ่น A123"
                        }
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        label="ราคา"
                        name="Price"
                        value={form.Price}
                        onChange={chg}
                        error={!!errors.Price}
                        helperText={errors.Price || "เช่น 1990"}
                        fullWidth
                        slotProps={{
                          startAdornment: (
                            <InputAdornment position="start">฿</InputAdornment>
                          ),
                          inputMode: "decimal",
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        label="สต็อก"
                        name="Stock"
                        value={form.Stock}
                        onChange={chg}
                        error={!!errors.Stock}
                        helperText={errors.Stock || "จำนวนเต็ม เช่น 20"}
                        fullWidth
                        slotProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Category_ID *"
                        name="Category_ID"
                        value={form.Category_ID}
                        onChange={chg}
                        error={!!errors.Category_ID}
                        helperText={
                          errors.Category_ID ||
                          "ต้องเป็นเลขหมวดหมู่ที่มีอยู่จริง"
                        }
                        fullWidth
                        slotProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Brand_ID *"
                        name="Brand_ID"
                        value={form.Brand_ID}
                        onChange={chg}
                        error={!!errors.Brand_ID}
                        helperText={
                          errors.Brand_ID || "ต้องเป็นเลขแบรนด์ที่มีอยู่จริง"
                        }
                        fullWidth
                        slotProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                      />
                    </Grid>
                  </Grid>

                  <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={busy}
                    >
                      {busy ? "กำลังเพิ่ม..." : "เพิ่มสินค้า"}
                    </Button>
                  </Stack>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </AppTheme>
  );
}
