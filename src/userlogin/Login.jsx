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
import { useAuthStore } from "../stores/authStore";

const BASE_URL = "https://ritzily-nebule-clark.ngrok-free.dev";

export default function Login() {
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState(null); // ✅ แก้ตรงนี้
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError(null);
    if (!username || !password) {
      setError("กรุณากรอก Username และ Password");
      return;
    }

    setLoading(true);

    const body = new URLSearchParams();
    body.append("username", username);
    body.append("password", password);

    try {
      const res = await fetch(`${BASE_URL}/users/login`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          "ngrok-skip-browser-warning": "true",
        },
        body,
        credentials: "include", // ถ้าเซิร์ฟเวอร์เซ็ตคุกกี้
      });

      // พยายาม parse JSON ก่อน ถ้าไม่ได้ค่อยอ่าน text
      let data;
      try {
        data = await res.json();
      } catch {
        const txt = await res.text();
        data = { detail: txt || "Unable to parse response" };
      }

      if (!res.ok) {
        throw new Error(data?.detail || `HTTP Error ${res.status}`);
      }

      // ถ้า backend ส่ง JWT คืนมาใน body
      if (data?.access_token) {
        setToken(data.access_token);
      }

      navigate("/", { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
      setError(err?.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppTheme>
      <Box
        component="form"
        onSubmit={handleLogin}
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

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <TextField
            id="username"
            label="Username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            required
            fullWidth
            variant="outlined"
            disabled={loading}
          />
          <TextField
            id="password"
            label="Password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            fullWidth
            variant="outlined"
            disabled={loading}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ fontSize: "1.5rem", minHeight: 56 }}
          >
            {loading ? (
              <CircularProgress size={28} color="inherit" />
            ) : (
              "Log in"
            )}
          </Button>

          <Box sx={{ textAlign: "center", mt: 2 }}>
            ยังไม่มีบัญชี?
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
