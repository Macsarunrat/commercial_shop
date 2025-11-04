import * as React from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  InputBase,
  Button,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useCartStore } from "../../stores/cartStore";
import AppTheme from "../../theme/AppTheme";

// --- เพิ่ม Import จาก Bar.jsx ---
import StorefrontIcon from "@mui/icons-material/Storefront";
import HomeIcon from "@mui/icons-material/Home";
import { useAuthStore } from "../../stores/authStore";
import api from "../../api";
// --- สิ้นสุดการเพิ่ม Import ---

// --- Selectors (Stable) ---
const selectCartItems = (state) => state.items;
const selectClearCart = (state) => state.clearCart;
const selectAuthToken = (state) => state.token;
const selectAuthUser = (state) => state.user;
const selectClearAuth = (state) => state.clearAuth;
// --- สิ้นสุด Selectors ---

// --- Styled Components (Existing) ---
const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.05),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.black, 0.1),
  },
  marginRight: theme.spacing(1),
  marginLeft: 0,
  flexGrow: 1,
  width: "auto",
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
  },
}));
// --- สิ้นสุด Styled Components ---

export default function SearchAppBar() {
  const navigate = useNavigate();

  // Logic ตะกร้า
  const items = useCartStore(selectCartItems);
  const cartCount = items.reduce((n, it) => n + (it.qty || 0), 0);
  const clearCart = useCartStore(selectClearCart);

  // Logic ค้นหา
  const [searchTerm, setSearchTerm] = React.useState("");
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // --- เพิ่ม Logic Auth จาก Bar.jsx ---
  const token = useAuthStore(selectAuthToken);
  const user = useAuthStore(selectAuthUser);
  const clearAuth = useAuthStore(selectClearAuth);
  const isAuthenticated = !!token;

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
    } catch (error) {
      console.error("Logout API failed (ignoring):", error);
    } finally {
      clearAuth();
      clearCart();
      navigate("/login");
    }
  };
  // --- สิ้นสุด Logic Auth ---

  return (
    <AppTheme>
      <Box sx={{ flexGrow: 1, mb: 2 }}>
        <AppBar
          position="static"
          sx={{
            bgcolor: "white",
            color: "black",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <Toolbar>
            {/* 1. โลโก้ "Zhoppe" */}
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                textDecoration: "none",
                color: "primary.main",
                fontWeight: 700,
                mr: 3,
                display: { xs: "none", sm: "block" },
              }}
            >
              Zhopee
            </Typography>

            {/* 2. แถบค้นหา และ ปุ่มค้นหา */}
            <Box
              component="form"
              onSubmit={handleSearch}
              sx={{ flexGrow: 1, display: "flex" }}
            >
              <Search sx={{ flexGrow: 1 }}>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="ค้นหาสินค้า..."
                  inputProps={{ "aria-label": "search" }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Search>
              <Button
                type="submit"
                variant="contained"
                onClick={handleSearch}
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  boxShadow: "none",
                  "&:hover": { bgcolor: "primary.dark" },
                  ml: 0.5,
                }}
              >
                ค้นหา
              </Button>
            </Box>

            {/* 3. ปุ่ม Login/Logout และ ตะกร้า */}
            <Box
              sx={{
                flexGrow: 0,
                ml: 2,
                display: "flex",
                alignItems: "center",
              }}
            >
              {isAuthenticated ? (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    variant="caption"
                    sx={{ mr: 1, display: { xs: "none", sm: "block" } }}
                  >
                    สวัสดี, {user?.sub || "User"}
                  </Typography>
                  <Button
                    component={RouterLink}
                    to="/openstore"
                    color="inherit"
                    size="small"
                    startIcon={<StorefrontIcon />}
                    sx={{ display: { xs: "none", md: "inline-flex" } }}
                  >
                    เปิดร้าน
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/my-address"
                    color="inherit"
                    size="small"
                    startIcon={<HomeIcon />}
                    sx={{ display: { xs: "none", md: "inline-flex" } }}
                  >
                    ที่อยู่
                  </Button>
                  <Button color="inherit" size="small" onClick={handleLogout}>
                    Logout
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Button
                    component={RouterLink}
                    to="/login"
                    color="inherit"
                  >
                    Login
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/register"
                    color="inherit"
                  >
                    Register
                  </Button>
                </Box>
              )}

              {/* 4. ตะกร้าสินค้า (ย้ายมาไว้หลังปุ่มค้นหา) */}
              <IconButton
                size="large"
                color="inherit"
                component={RouterLink}
                to="/cart"
                sx={{ ml: 1 }}
              >
                <Badge badgeContent={cartCount} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
      </Box>
    </AppTheme>
  );
}

