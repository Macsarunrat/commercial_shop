import * as React from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Container,
  Button,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate } from "react-router-dom"; // 👈 1. เพิ่ม useNavigate
import AppTheme from "../../theme/AppTheme";

// 2. 🔽 --- Import สิ่งที่เราต้องการ --- 🔽
import { useAuthStore } from "../../stores/authStore.jsx";
import api from "../../api.js"; // (Import 'api.js' ที่เราสร้าง)

const Navpages = [
  { label: "OpenStore", to: "/openstore", index: "1" },
  { label: "Shop", to: "/allshop", index: "2" },
  { label: "Ordered", to: "/ordered", index: "3" },
  { label: "Help", to: "/home", index: "4" },
];

export default function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const openNav = (e) => setAnchorElNav(e.currentTarget);
  const closeNav = () => setAnchorElNav(null);

  // 3. 🔽 --- ดึง State และ Action จาก authStore --- 🔽
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const user = useAuthStore((state) => state.user); // 👈 (ดึงข้อมูล user ที่ decode แล้ว)
  const clearAuth = useAuthStore((state) => state.clearAuth); // 👈 (ดึง action Logout)

  // 4. 🔽 --- สร้างฟังก์ชัน Handle Logout --- 🔽
  const handleLogout = async () => {
    try {
      // 4a. (Optional) เรียก API Logout ของ Backend (เพื่อยืนยัน)
      await api.post("/users/logout");
      
    } catch (error) {
      // (ต่อให้ API พัง เราก็ควร Logout ที่ฝั่ง Client อยู่ดี)
      console.error("Logout API failed, clearing auth locally.", error);
    }
    
    // 4b. ล้าง Token ออกจาก Zustand / localStorage
    clearAuth();
    
    // 4c. พา User กลับหน้า Home
    navigate("/");
  };
  // ------------------------------------------

  return (
    <AppTheme>
      <AppBar position="static" sx={{ bgcolor: "" }}>
        <Container maxWidth="xl">
          <Toolbar>
            {/* ... (โค้ด Hamburger Menu และ Navpages เดิมของคุณ) ... */}

            {/* 5. 🔽 --- แก้ไขส่วนปุ่ม Auth (ขวาสุด) --- 🔽 */}
            <Box
              sx={{
                ml: "auto",
                display: "flex",
                gap: 2,
                alignItems: "center", // 👈 (เพิ่ม alignItems)
                justifyContent: "center",
              }}
            >
              {isAuthenticated ? (
                // ⭐️ ถ้า Login แล้ว (มี Token) ⭐️
                <>
                  <Typography sx={{ color: "white", fontSize: 16 }}>
                    สวัสดี {user?.sub} {/* 👈 (แสดง Username จาก Token) */}
                  </Typography>
                  <Button
                    onClick={handleLogout} // 👈 (เรียกฟังก์ชัน Logout)
                    variant="outlined"
                    sx={{ color: "white", borderColor: "white" }}
                  >
                    Logout {/* 👈 (เปลี่ยนเป็นปุ่ม Logout) */}
                  </Button>
                </>
              ) : (
                // ⭐️ ถ้ายังไม่ Login (ไม่มี Token) ⭐️
                <>
                  <Button
                    component={Link}
                    to={"register"}
                    variant="outlined"
                    sx={{ color: "white", borderColor: "white" }}
                  >
                    Register
                  </Button>
                  <Button
                    component={Link}
                    to={"login"} // (l เล็ก ที่เราแก้ไปแล้ว)
                    variant="outlined"
                    sx={{ color: "white", borderColor: "white" }}
                  >
                    Login
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </AppTheme>
  );
}