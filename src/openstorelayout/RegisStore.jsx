import * as React from "react";
import { Box, Stack, Grid, TextField, Button, Typography } from "@mui/material";
import AppTheme from "../theme/AppTheme";
import { useNavigate } from "react-router-dom";

export default function SellerRegister({ sx, onSuccess }) {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    shopName: "",
    phone: "",
    tumbon: "",
    amphoe: "",
    province: "",
  });
  const [errors, setErrors] = React.useState({});

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const err = {};
    if (!form.shopName.trim()) err.shopName = "กรุณากรอกชื่อร้าน";
    if (!/^\d{9,10}$/.test(form.phone.trim()))
      err.phone = "กรุณากรอกเบอร์ 9–10 หลัก";
    if (!form.tumbon.trim()) err.tumbon = "กรุณากรอกตำบล";
    if (!form.amphoe.trim()) err.amphoe = "กรุณากรอกอำเภอ";
    if (!form.province.trim()) err.province = "กรุณากรอกจังหวัด";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // TODO: call API สมัครผู้ขาย
    // ตัวอย่าง payload
    const payload = {
      shopName: form.shopName.trim(),
      phone: form.phone.trim(),
      address: {
        tumbon: form.tumbon.trim(),
        amphoe: form.amphoe.trim(),
        province: form.province.trim(),
      },
    };
    console.log("submit seller:", payload);

    onSuccess?.(payload);
    // นำทาง/แจ้งเตือนตามต้องการ
    navigate("/", { replace: true });
    alert("สมัครผู้ขายสำเร็จ");
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

          <TextField
            label="ชื่อร้าน"
            name="shopName"
            value={form.shopName}
            onChange={onChange}
            required
            error={!!errors.shopName}
            helperText={errors.shopName}
            fullWidth
          />

          <TextField
            label="เบอร์โทรศัพท์"
            name="phone"
            value={form.phone}
            onChange={onChange}
            required
            error={!!errors.phone}
            helperText={errors.phone || "เช่น 0812345678"}
            fullWidth
          />

          <Grid
            container
            columns={12}
            columnSpacing={{ xs: 2, md: 4 }}
            rowSpacing={2}
          >
            {/* แถวที่ 1 */}
            <Grid item xs={12} md={6}>
              <TextField
                label="ตำบล *"
                name="tumbon"
                value={form.tumbon}
                onChange={onChange}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="อำเภอ *"
                name="amphoe"
                value={form.amphoe}
                onChange={onChange}
                fullWidth
                required
              />
            </Grid>

            {/* แถวที่ 2 */}
            <Grid item xs={12} md={6}>
              <TextField
                label="จังหวัด *"
                name="province"
                value={form.province}
                onChange={onChange}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="รหัสไปรษณีย์ *"
                name="postcode"
                value={form.postcode}
                onChange={onChange}
                fullWidth
                required
              />
            </Grid>
          </Grid>
        </Stack>
        <Button type="submit" variant="contained" size="large" sx={{ mt: 2 }}>
          เปิดร้านค้า
        </Button>
      </Box>
    </AppTheme>
  );
}
