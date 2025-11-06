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
const API = "https://unsparingly-proextension-jacque.ngrok-free.dev";
const HDRS = { "ngrok-skip-browser-warning": "true" };

/* ----------------- Helpers ---------------- */
const authHeaders = (token, extra = {}) => ({
  ...HDRS,
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
  ...extra,
});

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

async function apiAddItemByName(shopId, payload, token) {
  // payload: { Product_Name, Price, Stock, Category_Name, Brand_Name }
  return fjson(`${API}/shops/${shopId}/items/by_name`, {
    method: "POST",
    headers: authHeaders(token, { "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
}

// สร้างหมวดหมู่ใหม่
async function apiCreateCategory(name) {
  const res = await fetch(`${API}/category/NewCategory`, {
    method: "POST",
    headers: { ...HDRS, "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ Category_Name: name }),
  });
  if (!res.ok) throw new Error(await readNiceError(res));
  return res.json().catch(() => ({}));
}

// สร้างแบรนด์ใหม่
async function apiCreateBrand(name) {
  const res = await fetch(`${API}/brand/new/product`, {
    method: "POST",
    headers: { ...HDRS, "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ Brand_Name: name }),
  });
  if (!res.ok) throw new Error(await readNiceError(res));
  return res.json().catch(() => ({}));
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
    Category_Name: "",
    Brand_Name: "",
  });
  const [errors, setErrors] = React.useState({});
  const [busy, setBusy] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState("");

  // กล่อง “เพิ่มหมวดหมู่ด่วน”
  const [catName, setCatName] = React.useState("");
  const [catSaving, setCatSaving] = React.useState(false);
  const [catError, setCatError] = React.useState("");
  const [catSuccess, setCatSuccess] = React.useState("");

  // กล่อง “เพิ่มแบรนด์ด่วน”
  const [brandName, setBrandName] = React.useState("");
  const [brandSaving, setBrandSaving] = React.useState(false);
  const [brandError, setBrandError] = React.useState("");
  const [brandSuccess, setBrandSuccess] = React.useState("");

  // ปุ่มด่วน ให้ความกว้างเท่ากัน (responsive)
  const quickBtnSx = {
    width: { xs: "100%", sm: 180 },
    height: 56,
    borderRadius: 2,
    whiteSpace: "nowrap",
  };

  // ---------- resolve shopId ----------
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setPageError(null);
      try {
        let sid =
          shopIdProp ?? (shopIdParam != null ? Number(shopIdParam) : null);

        if (Number.isInteger(sid) && sid > 0) {
          if (!cancelled) setShopId(sid);
        } else {
          if (!token) throw new Error("ไม่พบรหัสร้านและยังไม่ได้เข้าสู่ระบบ");
          const prof = await apiGetMyShopProfile(token);
          sid = Number(prof?.Shop_ID);
          if (!Number.isInteger(sid) || sid <= 0) {
            throw new Error("ยังไม่มีร้านของคุณ โปรดสร้างร้านก่อน");
          }
          if (!cancelled) {
            setShopId(sid);
            setShopName(prof?.Shop_Name || "");
          }
        }
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

    if (!form.Category_Name.trim())
      err.Category_Name = "กรุณาระบุ Category_Name (ต้องเป็นชื่อที่มีอยู่จริง)";
    if (!form.Brand_Name.trim())
      err.Brand_Name = "กรุณาระบุ Brand_Name (ต้องเป็นชื่อที่มีอยู่จริง)";

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
        Category_Name: form.Category_Name.trim(),
        Brand_Name: form.Brand_Name.trim(),
      };
      await apiAddItemByName(Number(shopId), payload, token);
      setSuccessMsg("เพิ่มสินค้าเรียบร้อย ✅");
      setForm({
        Product_Name: "",
        Price: "",
        Stock: "",
        Category_Name: "",
        Brand_Name: "",
      });
      setErrors({});
    } catch (err) {
      const msg = String(err?.message || "");
      if (
        msg.toLowerCase().includes("category") &&
        msg.toLowerCase().includes("not found")
      ) {
        setPageError("เพิ่มสินค้าไม่สำเร็จ: ไม่พบ Category_Name ในระบบ");
      } else if (
        msg.toLowerCase().includes("brand") &&
        msg.toLowerCase().includes("not found")
      ) {
        setPageError("เพิ่มสินค้าไม่สำเร็จ: ไม่พบ Brand_Name ในระบบ");
      } else if (
        msg.toLowerCase().includes("duplicate") ||
        msg.includes("1062") ||
        msg.includes("unique")
      ) {
        setPageError("เพิ่มสินค้าไม่สำเร็จ: ข้อมูลซ้ำ/ผิดเงื่อนไข unique");
      } else {
        setPageError(msg || "เพิ่มสินค้าไม่สำเร็จ");
      }
    } finally {
      setBusy(false);
    }
  };

  // เพิ่มหมวดหมู่ด่วน
  async function handleQuickCreateCategory() {
    setCatError("");
    setCatSuccess("");
    const v = catName.trim();
    if (!v) {
      setCatError("กรุณากรอกชื่อหมวดหมู่");
      return;
    }
    try {
      setCatSaving(true);
      await apiCreateCategory(v);
      setCatSuccess(`เพิ่มหมวดหมู่ “${v}” เรียบร้อย`);
      setForm((f) => ({ ...f, Category_Name: v })); // เติมเข้าฟอร์ม
      setCatName("");
      window.dispatchEvent(new Event("categories:refresh"));
    } catch (e) {
      setCatError(e.message || "เพิ่มหมวดหมู่ไม่สำเร็จ");
    } finally {
      setCatSaving(false);
    }
  }

  // เพิ่มแบรนด์ด่วน
  async function handleQuickCreateBrand() {
    setBrandError("");
    setBrandSuccess("");
    const v = brandName.trim();
    if (!v) {
      setBrandError("กรุณากรอกชื่อแบรนด์");
      return;
    }
    try {
      setBrandSaving(true);
      await apiCreateBrand(v);
      setBrandSuccess(`เพิ่มแบรนด์ “${v}” เรียบร้อย`);
      setForm((f) => ({ ...f, Brand_Name: v })); // เติมเข้าฟอร์ม
      setBrandName("");
      window.dispatchEvent(new Event("brands:refresh"));
    } catch (e) {
      setBrandError(e.message || "เพิ่มแบรนด์ไม่สำเร็จ");
    } finally {
      setBrandSaving(false);
    }
  }

  /* ----------------- UI ------------------ */
  return (
    <AppTheme>
      <Box sx={{ maxWidth: 780, mx: "auto", px: 2, py: 4 }}>
        {/* กล่อง “เพิ่มหมวดหมู่ด่วน” */}
        <Card variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Typography fontWeight={700} sx={{ mb: 1 }}>
              เพิ่มหมวดหมู่
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems="stretch"
            >
              <TextField
                label="ชื่อหมวดหมู่ใหม่"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                fullWidth
                disabled={catSaving}
                sx={{ flex: 1 }}
              />
              <Button
                onClick={handleQuickCreateCategory}
                variant="contained"
                disabled={catSaving}
                sx={quickBtnSx}
              >
                {catSaving ? "กำลังบันทึก..." : "เพิ่มหมวดหมู่"}
              </Button>
            </Stack>
            {!!catError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {catError}
              </Alert>
            )}
            {!!catSuccess && (
              <Alert severity="success" sx={{ mt: 1 }}>
                {catSuccess}
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* กล่อง “เพิ่มแบรนด์” */}
        <Card variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Typography fontWeight={700} sx={{ mb: 1 }}>
              เพิ่มแบรนด์
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems="stretch"
            >
              <TextField
                label="ชื่อแบรนด์ใหม่"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                fullWidth
                disabled={brandSaving}
                sx={{ flex: 1 }}
              />
              <Button
                onClick={handleQuickCreateBrand}
                variant="contained"
                disabled={brandSaving}
                sx={quickBtnSx}
              >
                {brandSaving ? "กำลังบันทึก..." : "เพิ่มแบรนด์"}
              </Button>
            </Stack>
            {!!brandError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {brandError}
              </Alert>
            )}
            {!!brandSuccess && (
              <Alert severity="success" sx={{ mt: 1 }}>
                {brandSuccess}
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* กล่อง “เพิ่มสินค้าใหม่” */}
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
                  <Grid container rowSpacing={2.5} columnSpacing={2.5}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        variant="outlined"
                        size="medium"
                        fullWidth
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: 56,
                            alignItems: "center",
                          },
                          "& .MuiInputBase-input": { padding: "16.5px 14px" },
                          "& .MuiFormHelperText-root": { minHeight: 22 },
                        }}
                        label="ชื่อสินค้า *"
                        name="Product_Name"
                        value={form.Product_Name}
                        onChange={chg}
                        error={!!errors.Product_Name}
                        helperText={
                          errors.Product_Name ||
                          "เช่น กระเป๋าถือ หนังแท้ รุ่น A123"
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        variant="outlined"
                        size="medium"
                        fullWidth
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: 56,
                            alignItems: "center",
                          },
                          "& .MuiInputBase-input": { padding: "16.5px 14px" },
                          "& .MuiFormHelperText-root": { minHeight: 22 },
                        }}
                        label="ราคา"
                        name="Price"
                        value={form.Price}
                        onChange={chg}
                        error={!!errors.Price}
                        helperText={errors.Price || "เช่น 1990"}
                        slotProps={{
                          startAdornment: (
                            <InputAdornment position="start">฿</InputAdornment>
                          ),
                          inputMode: "decimal",
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        variant="outlined"
                        size="medium"
                        fullWidth
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: 56,
                            alignItems: "center",
                          },
                          "& .MuiInputBase-input": { padding: "16.5px 14px" },
                          "& .MuiFormHelperText-root": { minHeight: 22 },
                        }}
                        label="สต็อก"
                        name="Stock"
                        value={form.Stock}
                        onChange={chg}
                        error={!!errors.Stock}
                        helperText={errors.Stock || "จำนวนเต็ม เช่น 20"}
                        slotProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        variant="outlined"
                        size="medium"
                        fullWidth
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: 56,
                            alignItems: "center",
                          },
                          "& .MuiInputBase-input": { padding: "16.5px 14px" },
                          "& .MuiFormHelperText-root": { minHeight: 22 },
                        }}
                        label="Category_Name *"
                        name="Category_Name"
                        value={form.Category_Name}
                        onChange={chg}
                        error={!!errors.Category_Name}
                        helperText={
                          errors.Category_Name ||
                          "ต้องเป็นชื่อหมวดหมู่ที่มีอยู่จริง"
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        variant="outlined"
                        size="medium"
                        fullWidth
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: 56,
                            alignItems: "center",
                          },
                          "& .MuiInputBase-input": { padding: "16.5px 14px" },
                          "& .MuiFormHelperText-root": { minHeight: 22 },
                        }}
                        label="Brand_Name *"
                        name="Brand_Name"
                        value={form.Brand_Name}
                        onChange={chg}
                        error={!!errors.Brand_Name}
                        helperText={
                          errors.Brand_Name || "ต้องเป็นชื่อแบรนด์ที่มีอยู่จริง"
                        }
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
