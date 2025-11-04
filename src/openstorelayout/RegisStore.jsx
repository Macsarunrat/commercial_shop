import * as React from "react";
import {
  Box,
  Stack,
  Grid,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import AppTheme from "../theme/AppTheme";
import { useNavigate } from "react-router-dom";
import api from "../api"; // Import Axios instance

export default function SellerRegister({ sx, onSuccess }) {
  const navigate = useNavigate();

  // State ของฟอร์ม
  const [form, setForm] = React.useState({
    Shop_Name: "",
    Shop_Phone: "",
    Province: "",
    Amphur: "",
    Tumbon: "",
    Address_Number: "",
    Soi: "",
    Road: "",
    Optional_Detail: "",
  });

  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState(null);

  // handle change
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // ตรวจสอบฟอร์ม
  const validate = () => {
    const err = {};
    if (!form.Shop_Name.trim()) err.Shop_Name = "กรุณากรอกชื่อร้าน";
    if (!/^\d{9,10}$/.test(form.Shop_Phone.trim()))
      err.Shop_Phone = "กรุณากรอกเบอร์ 9–10 หลัก";
    if (!form.Province.trim()) err.Province = "กรุณากรอกจังหวัด";
    if (!form.Amphur.trim()) err.Amphur = "กรุณากรอกอำเภอ";
    if (!form.Tumbon.trim()) err.Tumbon = "กรุณากรอกตำบล";
    if (!form.Address_Number.trim())
      err.Address_Number = "กรุณากรอกบ้านเลขที่";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ฟังก์ชันสมัครร้านค้า
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      // 1. สร้างร้านค้า
      const shopBody = {
        Shop_Name: form.Shop_Name,
        Shop_Phone: form.Shop_Phone,
      };
      const shopRes = await api.post("/shops/", shopBody);
      const newShopId = shopRes.data.Shop_ID;

      if (!newShopId) {
        throw new Error("ไม่ได้รับ Shop_ID หลังจากสร้างร้าน");
      }

      // 2. สร้างที่อยู่
      const addressBody = {
        Province: form.Province,
        Amphur: form.Amphur,
        Tumbon: form.Tumbon,
        Address_Number: form.Address_Number,
        Soi: form.Soi || null,
        Road: form.Road || null,
        Optional_Detail: form.Optional_Detail || null,
      };

      await api.post(`/shops/${newShopId}/address`, addressBody);

      // 3. สำเร็จ
      alert("เปิดร้านค้าสำเร็จ!");
      navigate("/");
    } catch (err) {
      console.error("Failed to register shop:", err);

      // --- จัดการ Error Message ---
      let errorMessage = "เกิดข้อผิดพลาดในการสมัครร้านค้า";
      const detail = err.response?.data?.detail;

      if (typeof detail === "string") {
        if (detail.includes("already owns a shop")) {
          errorMessage = "คุณมีร้านค้าอยู่แล้ว ไม่สามารถสร้างร้านใหม่ได้";
        } else {
          errorMessage = detail;
        }
      } else if (Array.isArray(detail)) {
        try {
          errorMessage = detail
            .map((d) => `${d.loc.slice(-1)[0]}: ${d.msg}`)
            .join(", ");
        } catch (e) {
          errorMessage = "ข้อมูลที่ส่งไม่ถูกต้อง กรุณาตรวจสอบ";
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppTheme>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 3,
          maxWidth: 780,
          m: "auto",
          mt: "5vh",
          border: "1px solid #eee",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          borderRadius: 3,
          bgcolor: "white",
        }}
      >
        <Stack spacing={3}>
          <Typography variant="h5" fontWeight={700}>
            สมัครเป็นผู้ขาย
          </Typography>

          {apiError && <Alert severity="error">{apiError}</Alert>}

          <TextField
            label="ชื่อร้าน"
            name="Shop_Name"
            value={form.Shop_Name}
            onChange={onChange}
            required
            error={!!errors.Shop_Name}
            helperText={errors.Shop_Name}
            fullWidth
            disabled={loading}
          />

          <TextField
            label="เบอร์โทรศัพท์ร้าน"
            name="Shop_Phone"
            value={form.Shop_Phone}
            onChange={onChange}
            required
            error={!!errors.Shop_Phone}
            helperText={errors.Shop_Phone || "เช่น 0812345678"}
            fullWidth
            disabled={loading}
          />

          <Divider sx={{ pt: 1 }}>
            <Typography variant="subtitle1">ที่อยู่ร้านค้า</Typography>
          </Divider>

          <Grid
            container
            columns={12}
            columnSpacing={{ xs: 2, md: 4 }}
            rowSpacing={2}
          >
            <Grid item xs={12} md={6}>
              <TextField
                label="บ้านเลขที่"
                name="Address_Number"
                value={form.Address_Number}
                onChange={onChange}
                fullWidth
                required
                error={!!errors.Address_Number}
                helperText={errors.Address_Number}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="ซอย (ถ้ามี)"
                name="Soi"
                value={form.Soi}
                onChange={onChange}
                fullWidth
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="ถนน (ถ้ามี)"
                name="Road"
                value={form.Road}
                onChange={onChange}
                fullWidth
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="ตำบล"
                name="Tumbon"
                value={form.Tumbon}
                onChange={onChange}
                fullWidth
                required
                error={!!errors.Tumbon}
                helperText={errors.Tumbon}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="อำเภอ"
                name="Amphur"
                value={form.Amphur}
                onChange={onChange}
                fullWidth
                required
                error={!!errors.Amphur}
                helperText={errors.Amphur}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="จังหวัด"
                name="Province"
                value={form.Province}
                onChange={onChange}
                fullWidth
                required
                error={!!errors.Province}
                helperText={errors.Province}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="รายละเอียดเพิ่มเติม (ถ้ามี)"
                name="Optional_Detail"
                value={form.Optional_Detail}
                onChange={onChange}
                fullWidth
                disabled={loading}
              />
            </Grid>
          </Grid>
        </Stack>

        <Button
          type="submit"
          variant="contained"
          size="large"
          sx={{ mt: 3, minWidth: 150 }}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "เปิดร้านค้า"
          )}
        </Button>
      </Box>
    </AppTheme>
  );
}
