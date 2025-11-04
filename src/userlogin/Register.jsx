import * as React from "react";
import {
  Box,
  Stack,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import AppTheme from "../theme/AppTheme";
import { useNavigate } from "react-router-dom";

// 1. 🔽 (สำคัญ) ตั้งค่า URL ของ API ที่คุณใช้
const API_URL = "https://great-lobster-rightly.ngrok-free.app";

export default function Register() {
  const navigate = useNavigate();

  // 2. 🔽 สร้าง State สำหรับเก็บค่าในฟอร์มทั้งหมด
  const [formData, setFormData] = React.useState({
    Email: "",
    Username: "",
    Name: "",
    Phone: "", // 👈 (Model ของคุณมี Phone)
    Password: "",
    ConfirmPassword: "",
  });

  // 3. 🔽 สร้าง Stateสำหรับ loading และ error
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  // 4. 🔽 ฟังก์ชันเมื่อพิมพ์ในฟอร์ม
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 5. 🔽 สร้างฟังก์ชันสำหรับยิง API Register
  const handleRegister = async (e) => {
    e.preventDefault(); // กันหน้าเว็บ refresh
    setError(null);

    // 6. 🔽 ตรวจสอบฟอร์ม (ง่ายๆ)
    if (formData.Password !== formData.ConfirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);

    try {
      // 7. 🔽 สร้าง Body (JSON) ให้ตรงกับ Model 'UserCreate' ของ Backend
      const body = {
        Username: formData.Username,
        Name: formData.Name,
        Email: formData.Email,
        Phone: formData.Phone, // 👈 (เพิ่ม Phone)
        Password: formData.Password,
      };

      const res = await fetch(`${API_URL}/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true", // (Header สำหรับ ngrok)
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        // ถ้า API ตอบ Error (เช่น 400 Username ซ้ำ)
        throw new Error(data.detail || `HTTP Error ${res.status}`);
      }

      // 8. 🔽 สมัครสมาชิกสำเร็จ!
      console.log("Register success:", data);
      
      // 9. 🔽 บอก User และพาไปหน้า Login
      alert("สมัครสมาชิกสำเร็จ! กรุณา Login");
      navigate("/login", { replace: true });

    } catch (err) {
      console.error("Register failed:", err.message);
      setError(err.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppTheme>
      <Box
        component="form" // 👈 เปลี่ยนเป็น <form>
        onSubmit={handleRegister} // 👈 ใช้ onSubmit
        sx={{
          p: "2rem",
          maxWidth: 600,
          m: "auto",
          border: "1px solid #eee",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          borderRadius: 3,
          bgcolor: "white",
        }}
      >
        <Stack spacing={3} useFlexGap> {/* 👈 (แก้ spacing 4 -> 3) */}
          <Typography variant="h1" sx={{ fontSize: "2rem", fontWeight: 500 }}>
            Sign in (Register)
          </Typography>

          {/* 10. 🔽 แสดง Error (ถ้ามี) */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <TextField
            id="Name"
            label="Name (ชื่อ-นามสกุล)"
            name="Name"
            value={formData.Name}
            onChange={handleChange}
            autoFocus
            required
            fullWidth
            variant="outlined"
            disabled={loading}
          />
          <TextField
            id="Email"
            label="Email"
            type="email"
            name="Email"
            value={formData.Email}
            onChange={handleChange}
            autoComplete="email"
            required
            fullWidth
            variant="outlined"
            disabled={loading}
          />
          <TextField
            id="Phone"
            label="Phone (เบอร์โทร)"
            name="Phone"
            value={formData.Phone}
            onChange={handleChange}
            required
            fullWidth
            variant="outlined"
            disabled={loading}
          />
          <TextField
            id="username"
            label="Username (ชื่อผู้ใช้)"
            name="Username"
            value={formData.Username}
            onChange={handleChange}
            required
            fullWidth
            variant="outlined"
            disabled={loading}
          />
          <TextField
            id="password"
            label="Password"
            type="password"
            name="Password"
            value={formData.Password}
            onChange={handleChange}
            autoComplete="new-password"
            required
            fullWidth
            variant="outlined"
            disabled={loading}
          />
          <TextField
            id="confirmpassword"
            label="Confirm Password"
            type="password"
            name="ConfirmPassword"
            value={formData.ConfirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            required
            fullWidth
            variant="outlined"
            disabled={loading}
          />
          <Button
            type="submit" // 👈 เปลี่ยนเป็น type submit
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ fontSize: "1.5rem", minHeight: 56 }}
          >
            {loading ? <CircularProgress size={28} color="inherit" /> : "SIGN IN"}
          </Button>
          
          <Box sx={{ textAlign: "center", mt: 2 }}>
            มีบัญชีอยู่แล้ว?{" "}
            <Button
              variant="text"
              onClick={() => navigate("/login")}
              disabled={loading}
            >
              Log in
            </Button>
          </Box>
        </Stack>
      </Box>
    </AppTheme>
  );
}