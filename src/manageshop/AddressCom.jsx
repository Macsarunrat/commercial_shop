// src/shop/ShopAddressCard.jsx
import * as React from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Stack,
  Button,
  Alert,
} from "@mui/material";
import { useAuthStore } from "../stores/authStore";

// ✅ ปรับ path ให้ตรงกับไฟล์ API ของคุณ
import {
  getShopAddress,
  upsertShopAddress,
  deleteShopAddress,
} from "../address/AddressShop"; // <— แก้ path ให้ตรงโปรเจกต์

export default function AddressCom({ shopId }) {
  const token = useAuthStore((s) => s.getToken());

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [exists, setExists] = React.useState(false); // มี address อยู่แล้ว?
  const [busy, setBusy] = React.useState(false);

  const [form, setForm] = React.useState({
    Tumbon: "",
    Amphur: "",
    Province: "",
    Zipcode: "",
  });
  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // โหลดที่อยู่ครั้งแรก
  React.useEffect(() => {
    let gone = false;
    (async () => {
      if (!shopId || !token) {
        setLoading(false);
        return;
      }
      try {
        setError(null);
        const a = await getShopAddress(shopId, token);
        if (!gone && a) {
          setExists(true);
          setForm({
            Tumbon: a?.Tumbon ?? "",
            Amphur: a?.Amphur ?? "",
            Province: a?.Province ?? "",
            Zipcode: a?.Zipcode ?? "",
          });
        }
      } catch {
        if (!gone) setExists(false); // 404 = ยังไม่มีที่อยู่
      } finally {
        if (!gone) setLoading(false);
      }
    })();
    return () => {
      gone = true;
    };
  }, [shopId, token]);

  // บันทึก (สร้างหรืออัปเดตอัตโนมัติด้วย upsert)
  const handleSave = async () => {
    if (!token) return alert("กรุณาเข้าสู่ระบบ");
    if (!shopId) return alert("ไม่พบ Shop ID");

    // (ออปชัน) ตรวจรหัสไปรษณีย์ 5 หลัก
    const zip = (form.Zipcode || "").trim();
    if (zip && !/^\d{5}$/.test(zip)) {
      alert("รหัสไปรษณีย์ควรเป็นตัวเลข 5 หลัก");
      return;
    }

    const payload = {
      Shop_ID: Number(shopId),
      Tumbon: (form.Tumbon || "").trim(),
      Amphur: (form.Amphur || "").trim(),
      Province: (form.Province || "").trim(),
      Zipcode: zip,
    };

    try {
      setBusy(true);
      setError(null);
      await upsertShopAddress(shopId, payload, token);
      setExists(true);
      alert("บันทึกที่อยู่เรียบร้อย");
    } catch (e) {
      setError(e.message || "บันทึกที่อยู่ไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!token) return alert("กรุณาเข้าสู่ระบบ");
    if (!shopId) return alert("ไม่พบ Shop ID");
    if (!confirm("ยืนยันลบที่อยู่ร้าน?")) return;
    try {
      setBusy(true);
      setError(null);
      await deleteShopAddress(shopId, token);
      setExists(false);
      setForm({ Tumbon: "", Amphur: "", Province: "", Zipcode: "" });
      alert("ลบที่อยู่ร้านเรียบร้อย");
    } catch (e) {
      setError(e.message || "ลบไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={800} gutterBottom>
          ที่อยู่ร้านค้า
        </Typography>

        {loading ? (
          <Typography color="text.secondary">กำลังโหลด…</Typography>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="ตำบล"
                  name="Tumbon"
                  value={form.Tumbon}
                  onChange={onChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="อำเภอ"
                  name="Amphur"
                  value={form.Amphur}
                  onChange={onChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="จังหวัด"
                  name="Province"
                  value={form.Province}
                  onChange={onChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="รหัสไปรษณีย์"
                  name="Zipcode"
                  value={form.Zipcode}
                  onChange={onChange}
                />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button variant="contained" onClick={handleSave} disabled={busy}>
                {exists ? "บันทึกการเปลี่ยนแปลง" : "บันทึกที่อยู่"}
              </Button>
              {exists && (
                <Button
                  color="error"
                  variant="outlined"
                  onClick={handleDelete}
                  disabled={busy}
                >
                  ลบที่อยู่
                </Button>
              )}
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
}
