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

// 1. 🔽 Import store ที่เราเพิ่งสร้าง
import { useAuthStore } from "../stores/authStore.jsx";

// 2. 🔽 (สำคัญ) ตั้งค่า URL ของ API ที่คุณใช้ (ngrok)
const API_URL = "https://great-lobster-rightly.ngrok-free.app";

export default function Login() {
  const navigate = useNavigate();
  
  // 3. 🔽 Import "action" ที่ใช้เซ็ต Token จาก store
  const setToken = useAuthStore((state) => state.setToken);

  // 4. 🔽 สร้าง State สำหรับเก็บค่าในฟอร์ม
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  
  // 5. 🔽 สร้าง State สำหรับ loading และ error
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  // 6. 🔽 สร้างฟังก์ชันสำหรับยิง API Login
  const handleLogin = async (e) => {
    e.preventDefault(); // กันหน้าเว็บ refresh
    setError(null);

    if (!username || !password) {
      setError("กรุณากรอก Username และ Password");
      return;
    }

    setLoading(true);

    // 7. 🔽 (สำคัญมาก) แปลง Body ให้อยู่ในรูปแบบ 'x-www-form-urlencoded'
    // เพราะ API ของเราใช้ OAuth2PasswordRequestForm
    const body = new URLSearchParams();
    body.append("username", username);
    body.append("password", password);

    try {
      const res = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "ngrok-skip-browser-warning": "true", // (Header สำหรับ ngrok)
        },
        body: body,
      });

      const data = await res.json();

      if (!res.ok) {
        // ถ้า API ตอบ Error (เช่น 401 Unauthorized)
        throw new Error(data.detail || `HTTP Error ${res.status}`);
      }

      // 8. 🔽 Login สำเร็จ!
      console.log("Login success:", data.access_token);
      
      // 9. 🔽 บันทึก Token ลงใน authStore (Zustand)
      setToken(data.access_token);

      // 10. 🔽 พา User กลับหน้า Home
      navigate("/", { replace: true });
      
    } catch (err) {
      console.error("Login failed:", err.message);
      setError(err.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppTheme>
      <Box
        component="form" // 👈 เปลี่ยนเป็น <form>
        onSubmit={handleLogin} // 👈 ใช้ onSubmit
        sx={{
          p: "2rem",
          maxWidth: 600,
          m: "auto",
          mt: "15vh",
          border: "1px solid #eee",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          borderRadius: 3,
          bgcolor: "white",
        }}
      >
        <Stack spacing={4} useFlexGap>
          <Typography variant="h1" sx={{ fontSize: "2rem", fontWeight: 500 }}>
            Log in
          </Typography>

          {/* 11. 🔽 แสดง Error (ถ้ามี) */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <TextField
            id="username"
            label="Username"
            name="username"
            value={username} // 👈 เชื่อม State
            onChange={(e) => setUsername(e.target.value)} // 👈 เชื่อม State
            autoFocus
            required
            fullWidth
            variant="outlined"
            disabled={loading} // 👈 ปิดตอนโหลด
          />
          <TextField
            id="password"
            label="Password"
            type="password"
            name="Password"
            value={password} // 👈 เชื่อม State
            onChange={(e) => setPassword(e.target.value)} // 👈 เชื่อม State
            autoComplete="current-password"
            required
            fullWidth
            variant="outlined"
            disabled={loading} // 👈 ปิดตอนโหลด
          />

          <Button
            type="submit" // 👈 เปลี่ยนเป็น type submit
            variant="contained"
            size="large"
            disabled={loading} // 👈 ปิดตอนโหลด
            sx={{ fontSize: "1.5rem", minHeight: 56 }}
          >
            {/* 12. 🔽 แสดง Loading spinner */}
            {loading ? <CircularProgress size={28} color="inherit" /> : "Log in"}
          </Button>
          
          <Box sx={{ textAlign: "center", mt: 2 }}>
            ยังไม่มีบัญชี?{" "}
            <Button
              variant="text"
              onClick={() => navigate("/register")}
              disabled={loading}
            >
              สมัครสมาชิก
            </Button>
          </Box>
        </Stack>
      </Box>
    </AppTheme>
  );
}