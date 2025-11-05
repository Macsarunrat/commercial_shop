// src/openstore/OpenStore.jsx
import * as React from "react";
import {
  Box,
  Stack,
  Grid,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Avatar,
  Alert,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AppTheme from "../theme/AppTheme";
import { useAuthStore } from "../stores/authStore";
import {
  getShopAddress,
  createShopAddress,
  updateShopAddress,
  deleteShopAddress,
} from "../address/AddressShop";

/* -------- base fetch helpers (โปรไฟล์ร้าน) -------- */
const API = "https://great-lobster-rightly.ngrok-free.app";
const HDRS = { "ngrok-skip-browser-warning": "true" };

const authHeaders = (token, extra = {}) => ({
  ...HDRS,
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
  ...extra,
});
async function readNiceError(res) {
  try {
    const j = await res.json();
    if (j?.detail) {
      return Array.isArray(j.detail)
        ? j.detail
            .map((d) => `${(d.loc || []).join(".")} : ${d.msg}`)
            .join("\n")
        : String(j.detail);
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

// โปรไฟล์ร้าน
const apiGetMyShopProfile = (token) =>
  fjson(`${API}/shops/me/profile`, {
    method: "GET",
    headers: authHeaders(token),
  });

const apiCreateMyShop = ({ Shop_Name, Shop_Phone }, token) =>
  fjson(`${API}/shops/`, {
    method: "POST",
    headers: authHeaders(token, { "Content-Type": "application/json" }),
    body: JSON.stringify({ Shop_Name, Shop_Phone }),
  });

export default function OpenStore() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.getToken());

  // โหมดร้าน
  const [loading, setLoading] = React.useState(true);
  const [profile, setProfile] = React.useState(null);

  // ฟอร์มสมัครร้าน
  const [busy, setBusy] = React.useState(false);
  const [form, setForm] = React.useState({ shopName: "", phone: "" });
  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // ที่อยู่: preview + form
  const [addrLoading, setAddrLoading] = React.useState(false);
  const [addrExists, setAddrExists] = React.useState(false);
  const [addrBusy, setAddrBusy] = React.useState(false);
  const [addrError, setAddrError] = React.useState(null);

  // ฟอร์มแก้ไข (เริ่มว่าง)
  const [addrForm, setAddrForm] = React.useState({
    Tumbon: "",
    Amphur: "",
    Province: "",
    Address_Number: "",
  });
  const chgAddr = (e) =>
    setAddrForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // ข้อมูล read-only ปัจจุบัน
  const [addrPreview, setAddrPreview] = React.useState(null);

  /* โหลดโปรไฟล์ */
  React.useEffect(() => {
    let gone = false;
    (async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const p = await apiGetMyShopProfile(token);
        if (!gone) {
          setProfile(p || null);
          if (p) {
            localStorage.setItem("hasShop", "1");
            await loadAddress(p?.Shop_ID ?? p?.shop_id);
          }
        }
      } catch {
        if (!gone) setProfile(null);
      } finally {
        if (!gone) setLoading(false);
      }
    })();
    return () => {
      gone = true;
    };
  }, [token]);

  /* โหลดที่อยู่ร้าน */
  async function loadAddress(shopId) {
    if (!shopId || !token) return;
    setAddrLoading(true);
    setAddrError(null);
    try {
      const res = await getShopAddress(shopId, token);
      const a =
        res?.Tumbon || res?.Amphur || res?.Province || res?.Address_Number
          ? res
          : res?.address || res?.data || null;

      setAddrExists(!!a);
      setAddrPreview(a); // โชว์เฉพาะในการ์ด
      setAddrForm({
        // ช่องแก้ไข “ว่าง”
        Tumbon: "",
        Amphur: "",
        Province: "",
        Address_Number: "",
      });
    } catch {
      setAddrExists(false);
      setAddrPreview(null);
      setAddrForm({ Tumbon: "", Amphur: "", Province: "", Address_Number: "" });
    } finally {
      setAddrLoading(false);
    }
  }

  /* สมัครร้าน */
  const submit = async (e) => {
    e.preventDefault();
    if (!token) return alert("กรุณาเข้าสู่ระบบก่อนเปิดร้าน");
    if (!form.shopName.trim() || !form.phone.trim())
      return alert("กรุณากรอกชื่อร้านและเบอร์โทรให้ครบ");
    try {
      setBusy(true);
      const shop = await apiCreateMyShop(
        { Shop_Name: form.shopName.trim(), Shop_Phone: form.phone.trim() },
        token
      );
      const shopId = shop?.Shop_ID ?? shop?.shop_id;
      if (!shopId) throw new Error("ไม่พบ Shop_ID จากระบบหลังเปิดร้าน");

      // ถ้าต้องการโพสต์ที่อยู่ตั้งแต่สมัคร ให้เรียก createShopAddress() ที่นี่

      const p = await apiGetMyShopProfile(token);
      setProfile(
        p || {
          Shop_ID: shopId,
          Shop_Name: form.shopName,
          Shop_Phone: form.phone,
        }
      );
      await loadAddress(shopId);
    } catch (err) {
      alert(err.message || "เปิดร้านไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };

  /* บันทึกที่อยู่ (Create / Update) */
  const saveAddress = async () => {
    if (!token) return alert("กรุณาเข้าสู่ระบบ");
    const sid = profile?.Shop_ID ?? profile?.shop_id;
    if (!sid) return alert("ไม่พบ Shop ID");

    const zip = (addrForm.Address_Number || "").trim();
    if (zip && !/^\d{5}$/.test(zip))
      return alert("รหัสไปรษณีย์ควรเป็นตัวเลข 5 หลัก");

    const payload = {
      Tumbon: addrForm.Tumbon.trim(),
      Amphur: addrForm.Amphur.trim(),
      Province: addrForm.Province.trim(),
      Address_Number: zip, // ✅ ใช้คีย์ให้ตรง backend
    };

    try {
      setAddrBusy(true);
      setAddrError(null);
      if (addrExists) {
        await updateShopAddress(sid, payload, token); // PUT
        alert("อัปเดตที่อยู่เรียบร้อย");
      } else {
        await createShopAddress(sid, payload, token); // POST
        setAddrExists(true);
        alert("บันทึกที่อยู่เรียบร้อย");
      }
      setAddrForm({ Tumbon: "", Amphur: "", Province: "", Address_Number: "" }); // เคลียร์ฟอร์ม
      await loadAddress(sid); // refresh การ์ด
    } catch (e) {
      setAddrError(e.message || "บันทึกที่อยู่ไม่สำเร็จ");
    } finally {
      setAddrBusy(false);
    }
  };

  const removeAddress = async () => {
    if (!token) return alert("กรุณาเข้าสู่ระบบ");
    const sid = profile?.Shop_ID ?? profile?.shop_id;
    if (!sid) return alert("ไม่พบ Shop ID");
    if (!confirm("ยืนยันลบที่อยู่ร้าน?")) return;
    try {
      setAddrBusy(true);
      setAddrError(null);
      await deleteShopAddress(sid, token);
      setAddrExists(false);
      setAddrPreview(null);
      setAddrForm({ Tumbon: "", Amphur: "", Province: "", Address_Number: "" });
      alert("ลบที่อยู่ร้านเรียบร้อย");
    } catch (e) {
      setAddrError(e.message || "ลบไม่สำเร็จ");
    } finally {
      setAddrBusy(false);
    }
  };

  /* UI */
  return (
    <AppTheme>
      <Box sx={{ p: 3, maxWidth: 900, mx: "auto", mt: 6 }}>
        {loading ? (
          <Typography>กำลังโหลดข้อมูลร้าน…</Typography>
        ) : profile ? (
          <>
            {/* โปรไฟล์ */}
            <Card variant="outlined" sx={{ p: 2, mb: 3 }}>
              <CardContent>
                <Typography variant="h5" fontWeight={800} gutterBottom>
                  รายละเอียดร้านของฉัน
                </Typography>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Avatar
                    alt={profile?.Shop_Name || "Shop"}
                    sx={{ width: 72, height: 72 }}
                  />
                  <Box>
                    <Typography variant="h6">
                      {profile?.Shop_Name || "-"}
                    </Typography>
                    <Typography color="text.secondary">
                      เบอร์โทร: {profile?.Shop_Phone || "-"}
                    </Typography>
                    <Typography color="text.secondary">
                      Shop ID: {profile?.Shop_ID ?? profile?.shop_id}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button
                    variant="contained"
                    onClick={() => navigate("/manage")}
                  >
                    จัดการสินค้า (ManageShop)
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/shop-orders")}
                  >
                    คำสั่งซื้อของร้าน (MyOrder)
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => {
                      const sid = profile?.Shop_ID ?? profile?.shop_id;
                      if (!sid) return alert("ไม่พบ Shop ID");
                      navigate(`/shop/${sid}`); // ➜ ไปหน้า StoreShowUI โดยส่ง shopId
                    }}
                  >
                    ดูสินค้าในร้านทั้งหมด
                  </Button>
                </Stack>
                <Alert severity="info" sx={{ mt: 2 }}>
                  Welcome to your store
                </Alert>
              </CardContent>
            </Card>

            <Divider sx={{ mb: 3 }} />

            {/* ที่อยู่ร้าน */}
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={800} gutterBottom>
                  ที่อยู่ร้านค้า
                </Typography>

                {/* การ์ด read-only */}
                <Card
                  variant="outlined"
                  sx={{ mb: 2, bgcolor: "#fafafa", borderStyle: "dashed" }}
                >
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      gutterBottom
                    >
                      ที่อยู่ปัจจุบัน
                    </Typography>
                    {addrLoading ? (
                      <Typography color="text.secondary">
                        กำลังโหลดที่อยู่…
                      </Typography>
                    ) : addrPreview ? (
                      <Box sx={{ lineHeight: 1.9 }}>
                        <div>ตำบล: {addrPreview.Tumbon || "-"}</div>
                        <div>อำเภอ: {addrPreview.Amphur || "-"}</div>
                        <div>จังหวัด: {addrPreview.Province || "-"}</div>
                        <div>
                          รหัสไปรษณีย์: {addrPreview.Address_Number || "-"}
                        </div>
                      </Box>
                    ) : (
                      <Alert severity="info" sx={{ m: 0 }}>
                        ยังไม่มีที่อยู่ — กรุณาบันทึกที่อยู่ด้านล่าง
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {addrError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {addrError}
                  </Alert>
                )}

                <Grid container rowSpacing={2} columnSpacing={2}>
                  <TextField
                    fullWidth
                    label="ตำบล"
                    name="Tumbon"
                    value={addrForm.Tumbon}
                    onChange={chgAddr}
                  />

                  <TextField
                    fullWidth
                    label="อำเภอ"
                    name="Amphur"
                    value={addrForm.Amphur}
                    onChange={chgAddr}
                  />

                  <TextField
                    fullWidth
                    label="จังหวัด"
                    name="Province"
                    value={addrForm.Province}
                    onChange={chgAddr}
                  />

                  <TextField
                    fullWidth
                    label="รหัสไปรษณีย์"
                    name="Address_Number"
                    value={addrForm.Address_Number}
                    onChange={chgAddr}
                  />
                </Grid>

                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={saveAddress}
                    disabled={addrBusy}
                  >
                    {addrExists ? "บันทึกการเปลี่ยนแปลง" : "บันทึกที่อยู่"}
                  </Button>
                  {addrExists && (
                    <Button
                      color="error"
                      variant="outlined"
                      onClick={removeAddress}
                      disabled={addrBusy}
                    >
                      ลบที่อยู่
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </>
        ) : (
          /* สมัครร้าน */
          <Box
            component="form"
            onSubmit={submit}
            sx={{
              p: 3,
              bgcolor: "white",
              borderRadius: 2,
              border: "1px solid #eee",
              boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
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
              <Button type="submit" variant="contained" disabled={busy}>
                {busy ? "กำลังเปิดร้าน..." : "เปิดร้านค้า"}
              </Button>
            </Stack>
          </Box>
        )}
      </Box>
    </AppTheme>
  );
}
