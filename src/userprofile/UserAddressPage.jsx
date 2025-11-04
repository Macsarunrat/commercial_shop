import React, { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Grid,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import AppTheme from "../theme/AppTheme";
import api from "../api"; // Axios instance

// Component สำหรับฟอร์มเพิ่ม/แก้ไข
function AddressForm({ existingData, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    Province: existingData?.Province || "",
    Amphur: existingData?.Amphur || "",
    Tumbon: existingData?.Tumbon || "",
    Address_Number: existingData?.Address_Number || "",
    Road: existingData?.Road || "",
    Soi: existingData?.Soi || "",
    Optional_Detail: existingData?.Optional_Detail || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (existingData?.User_Address_ID) {
        // Update (PUT)
        await api.put(
          `/user-address/${existingData.User_Address_ID}`,
          formData
        );
      } else {
        // Create (POST)
        await api.post("/user-address/", formData);
      }
      onSave(); // แจ้ง Parent ให้โหลดใหม่
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to save address");
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h6">
          {existingData ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่ใหม่"}
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField name="Address_Number" label="บ้านเลขที่" value={formData.Address_Number} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField name="Soi" label="ซอย" value={formData.Soi} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField name="Road" label="ถนน" value={formData.Road} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField name="Tumbon" label="ตำบล/แขวง" value={formData.Tumbon} onChange={handleChange} required fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField name="Amphur" label="อำเภอ/เขต" value={formData.Amphur} onChange={handleChange} required fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField name="Province" label="จังหวัด" value={formData.Province} onChange={handleChange} required fullWidth />
          </Grid>
          <Grid item xs={12}>
            <TextField name="Optional_Detail" label="รายละเอียดเพิ่มเติม (เช่น รหัสไปรษณีย์)" value={formData.Optional_Detail} onChange={handleChange} fullWidth />
          </Grid>
        </Grid>
        <Stack direction="row" spacing={1}>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "บันทึก"}
          </Button>
          {onCancel && <Button variant="outlined" onClick={onCancel}>ยกเลิก</Button>}
        </Stack>
      </Stack>
    </Box>
  );
}

// Component หลัก
export default function UserAddressPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchAddresses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/user-address/me");
      setAddresses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSaveSuccess = () => {
    setShowAddForm(false);
    fetchAddresses(); // โหลดข้อมูลใหม่
  };

  const handleDelete = async (addressId) => {
    // เปลี่ยนจาก window.confirm เป็น alert ธรรมดาก่อน
    // const confirmed = window.confirm("คุณต้องการลบที่อยู่นี้ใช่หรือไม่?");
    // if (!confirmed) return;
    
    try {
      await api.delete(`/user-address/${addressId}`);
      fetchAddresses(); // โหลดใหม่
    } catch (err) {
      alert("ลบไม่สำเร็จ: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <AppTheme>
      <Box sx={{ maxWidth: 900, mx: "auto", p: 3, mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>ที่อยู่ของฉัน</Typography>
          {loading && <CircularProgress />}
          {error && <Alert severity="error">{error}</Alert>}
          
          {!loading && !error && (
            <Stack spacing={2} divider={<Divider />}>
              {addresses.map((addr) => (
                <Box key={addr.User_Address_ID} sx={{ p: 2 }}>
                  <Typography variant="subtitle1">{addr.Address_Number} {addr.Soi} {addr.Road}</Typography>
                  <Typography variant="body2">{addr.Tumbon}, {addr.Amphur}, {addr.Province}</Typography>
                  <Typography variant="caption" color="text.secondary">{addr.Optional_Detail}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button size="small" variant="outlined" onClick={() => alert("ฟังก์ชันแก้ไขยังไม่พร้อมใช้งาน")}>
                      แก้ไข
                    </Button>
                    <Button size="small" color="error" onClick={() => handleDelete(addr.User_Address_ID)}>
                      ลบ
                    </Button>
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}

          <Divider sx={{ my: 3 }} />

          {showAddForm ? (
            <AddressForm
              onSave={handleSaveSuccess}
              onCancel={() => setShowAddForm(false)}
            />
          ) : (
            <Button variant="contained" onClick={() => setShowAddForm(true)}>
              เพิ่มที่อยู่ใหม่
            </Button>
          )}
        </Paper>
      </Box>
    </AppTheme>
  );
}

