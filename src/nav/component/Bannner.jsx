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
import StorefrontIcon from "@mui/icons-material/Storefront";
import HomeIcon from "@mui/icons-material/Home";
import { useAuthStore } from "../../stores/authStore";
import api from "../../api";

const selectCartItems = (state) => state.items;
const selectClearCart = (state) => state.clearCart;
const selectAuthToken = (state) => state.token;
const selectAuthUser = (state) => state.user;
const selectClearAuth = (state) => state.clearAuth;

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.05),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.black, 0.1),
  },
  marginRight: theme.spacing(1),
  flexGrow: 1,
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

export default function SearchAppBar() {
  const navigate = useNavigate();

  const items = useCartStore(selectCartItems);
  const cartCount = items.reduce((n, it) => n + (it.qty || 0), 0);
  const clearCart = useCartStore(selectClearCart);

  const [searchTerm, setSearchTerm] = React.useState("");
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const token = useAuthStore(selectAuthToken);
  const user = useAuthStore(selectAuthUser);
  const clearAuth = useAuthStore(selectClearAuth);
  const isAuthenticated = !!token;

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      clearAuth();
      clearCart();
      navigate("/login");
    }
  };

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
            {/* โลโก้ */}
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

            {/* ช่องค้นหา */}
            <Box
              component="form"
              onSubmit={handleSearch}
              sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}
            >
              <Search>
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

            {/* ตะกร้าสินค้า */}
            <IconButton
              size="large"
              color="inherit"
              component={RouterLink}
              to="/cart"
              sx={{ ml: 2 }}
            >
              <Badge badgeContent={cartCount} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>

            {/* ปุ่ม Account / Auth */}
            <Box
              sx={{
                flexGrow: 0,
                ml: 1,
                display: "flex",
                alignItems: "center",
              }}
            >
              {isAuthenticated ? (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Button
                    component={RouterLink}
                    to="/my-address"
                    color="inherit"
                    size="small"
                    startIcon={<HomeIcon />}
                    sx={{ display: { xs: "none", md: "inline-flex" }, mr: 1 }}
                  >
                    ที่อยู่
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/openstore"
                    color="inherit"
                    size="small"
                    startIcon={<StorefrontIcon />}
                    sx={{ display: { xs: "none", md: "inline-flex" }, mr: 1 }}
                  >
                    เปิดร้าน
                  </Button>
                  <Typography
                    variant="caption"
                    sx={{ mr: 1, display: { xs: "none", sm: "block" } }}
                  >
                    สวัสดี, {user?.sub || "User"}
                  </Typography>
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
                    sx={{ mr: 1 }}
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
            </Box>
          </Toolbar>
        </AppBar>
      </Box>
    </AppTheme>
  );
}
