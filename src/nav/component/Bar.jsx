// src/nav/Bar.jsx
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
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import AppTheme from "../../theme/AppTheme";

const API = "https://great-lobster-rightly.ngrok-free.app";
const HDRS = { "ngrok-skip-browser-warning": "true" };

/* ---------------- helpers ---------------- */
function authHeaders(token, extra = {}) {
  return {
    ...HDRS,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}
async function readNiceError(res) {
  try {
    const j = await res.json();
    if (j?.detail) {
      if (Array.isArray(j.detail))
        return j.detail
          .map((d) => `${(d.loc || []).join(".")} : ${d.msg}`)
          .join("\n");
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

/* ---------------- component ---------------- */
export default function Bar() {
  const navigate = useNavigate();

  // auth store
  const token = useAuthStore((s) => s.getToken());
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  // mobile menu
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const openNav = (e) => setAnchorElNav(e.currentTarget);
  const closeNav = () => setAnchorElNav(null);

  // nav state
  const [hasShop, setHasShop] = React.useState(
    typeof window !== "undefined"
      ? localStorage.getItem("hasShop") === "1"
      : false
  );
  const [mode, setMode] = React.useState(
    typeof window !== "undefined"
      ? localStorage.getItem("navMode") || "buyer"
      : "buyer"
  );

  // เมื่อ login แล้ว ลองเช็คว่ามีร้านหรือยัง
  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!token) {
        if (!cancelled) {
          setHasShop(false);
          setMode("buyer");
          if (typeof window !== "undefined") {
            localStorage.setItem("hasShop", "0");
            localStorage.setItem("navMode", "buyer");
          }
        }
        return;
      }
      try {
        const data = await fjson(`${API}/shops/my`, {
          headers: authHeaders(token),
          credentials: "include",
        });
        const rows = Array.isArray(data)
          ? data
          : data?.items ?? (data ? [data] : []);
        const owned = rows.length > 0;
        if (!cancelled) {
          setHasShop(owned);
          // ไม่มีร้าน = บังคับโหมด buyer
          if (!owned) {
            setMode("buyer");
          }
          if (typeof window !== "undefined") {
            localStorage.setItem("hasShop", owned ? "1" : "0");
            if (!owned) localStorage.setItem("navMode", "buyer");
          }
        }
      } catch {
        // ถ้าดึงไม่ได้ ไม่เปลี่ยนค่าเดิม
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // ฟังการเปลี่ยน localStorage (เช่นจาก OpenStore ยิง storage event)
  React.useEffect(() => {
    const onStorage = () => {
      const hs = localStorage.getItem("hasShop") === "1";
      const md = localStorage.getItem("navMode") || "buyer";
      setHasShop(hs);
      setMode(hs ? md : "buyer");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // สลับโหมด
  const toggleMode = () => {
    if (!hasShop) return;
    const next = mode === "seller" ? "buyer" : "seller";
    setMode(next);
    localStorage.setItem("navMode", next);
    // แจ้งให้แท็บ/คอมโพเนนท์อื่นทราบทันที
    window.dispatchEvent(new Event("storage"));
  };

  // logout
  const handleLogout = async () => {
    try {
      await fetch(`${API}/users/logout`, {
        method: "POST",
        headers: authHeaders(token),
        credentials: "include",
      }).catch(() => {});
    } catch {}
    clearAuth();
    localStorage.setItem("hasShop", "0");
    localStorage.setItem("navMode", "buyer");
    window.dispatchEvent(new Event("storage"));
    
    navigate("/", { 
      replace: true, 
      state: { message: "ออกจากระบบสำเร็จ!" } 
    });
  };

  // เมนู 2 โหมด
  const buyerNav = [
    { label: "OpenStore", to: "/openstore", key: "openstore" },
    { label: "Shop", to: "/allsh", key: "shop" },
    { label: "Ordered", to: "/ordered", key: "ordered" },
    { label: "Help", to: "/help", key: "help" },
  ];

  const sellerNav = [
    { label: "MyShopInfo", to: "/myshop", key: "myshop" },
    { label: "ManageShop", to: "/manage-shop", key: "manage" },
    { label: "MyOrder", to: "/shop-orders", key: "orders" },
  ];

  const pages = mode === "seller" && hasShop ? sellerNav : buyerNav;

  return (
    <AppTheme>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar>
            {/* Mobile: hamburger */}
            <Box sx={{ display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="open navigation"
                aria-controls="nav-menu"
                aria-haspopup="true"
                onClick={openNav}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="nav-menu"
                anchorEl={anchorElNav}
                open={Boolean(anchorElNav)}
                onClose={closeNav}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
              >
                {pages.map((p) => (
                  <MenuItem
                    key={p.key}
                    onClick={closeNav}
                    component={Link}
                    to={p.to}
                    sx={{ fontFamily: "Inter", fontSize: 14 }}
                  >
                    {p.label}
                  </MenuItem>
                ))}
                {hasShop && (
                  <MenuItem
                    onClick={() => {
                      closeNav();
                      toggleMode();
                    }}
                  >
                    {mode === "seller" ? "Switch to Buyer" : "Switch to Seller"}
                  </MenuItem>
                )}
              </Menu>
            </Box>

            {/* Desktop: main nav */}
            <Box
              sx={{
                flexGrow: 1,
                display: { xs: "none", md: "flex" },
                gap: 6,
                justifyContent: "start",
              }}
            >
              {pages.map((p) => (
                <Button
                  key={p.key}
                  component={Link}
                  to={p.to}
                  sx={{
                    color: "white",
                    fontFamily: "Prompt",
                    fontWeight: 300,
                    fontSize: { md: 16, lg: 18 },
                  }}
                >
                  {p.label}
                </Button>
              ))}

              {hasShop && (
                <Button
                  onClick={toggleMode}
                  sx={{
                    color: "white",
                    fontFamily: "Prompt",
                    fontWeight: 300,
                    fontSize: { md: 16, lg: 18 },
                  }}
                >
                  {mode === "seller"
                    ? "SwitchMode: Buyer"
                    : "SwitchMode: Seller"}
                </Button>
              )}
            </Box>

            {/* Right side: auth buttons */}
            <Box
              sx={{
                ml: "auto",
                display: "flex",
                gap: 2,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isAuthenticated ? (
                <>
                  <Typography sx={{ color: "white", fontSize: 16 }}>
                    สวัสดี, {user?.sub || user?.username || "User"}
                  </Typography>
                  <Button
                    onClick={handleLogout}
                    variant="outlined"
                    sx={{ color: "white", borderColor: "white" }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    component={Link}
                    to="/register"
                    variant="outlined"
                    sx={{ color: "white", borderColor: "white" }}
                  >
                    Register
                  </Button>
                  <Button
                    component={Link}
                    to="/login"
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
