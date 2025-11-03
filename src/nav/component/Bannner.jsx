import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  InputBase,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StoreIcon from "@mui/icons-material/Store";
import { Link, useLocation, matchPath } from "react-router-dom";
import AppTheme from "../../theme/AppTheme";
import Badge from "@mui/material/Badge";
import { useCartStore } from "../../stores/cartStore";
import { useNavigate } from "react-router-dom";

const Search = styled("form")(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.contrastText, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.contrastText, 0.25),
  },
  marginLeft: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  width: "100%", // <-- ให้กว้างเต็มพื้นที่ของ box ที่ครอบ // <-- ไม่จำกัด maxWidth ตายตัว (หรือจะใส่ 1200 ก็ได้)
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
    padding: theme.spacing(1.8, 5, 1.8, 0), // top, right, bottom, left
    paddingLeft: `calc(1em + ${theme.spacing(1)})`,
    transition: theme.transitions.create("width"),
  },
}));

const SearchButton = styled(IconButton)(({ theme }) => ({
  display: "flex",
  color: "inherit",
}));

export default function SearchAppBar() {
  const [q, setQ] = React.useState("");
  const cartCount = useCartStore((s) => s.cartCount());
  const navigate = useNavigate();

  const onSearch = (e) => {
    e?.preventDefault();
    console.log("search:", q);
    const qs = new URLSearchParams({ q }).toString();
    +navigate(`/search?${qs}`);
  };

  // --- เช็ค path ปัจจุบัน ---
  const location = useLocation();
  // ซ่อนเมื่อ path คือ /cart หรืออยู่ใต้ /cart/*
  const hideCart = Boolean(
    matchPath({ path: "/cart/*", end: false }, location.pathname) ||
      matchPath({ path: "/cart", end: true }, location.pathname)
  );

  return (
    <AppTheme>
      <Box sx={{ flexGrow: 1, gap: 5 }}>
        <AppBar position="static" color="primary">
          <Toolbar sx={{ ml: 5 }}>
            <StoreIcon sx={{ fontSize: 100 }} />
            <Typography
              variant="h4"
              component={Link}
              to="/"
              color="inherit"
              sx={{
                textDecoration: "none",
                fontFamily: "Prompt, sans-serif",
                fontWeight: 600,
                mr: 1,
              }}
            >
              Zhopee
            </Typography>

            <Box
              sx={{ flexGrow: 1, display: "flex", alignItems: "center", ml: 3 }}
            >
              <Search
                onSubmit={onSearch}
                sx={{
                  width: "100%",
                  maxWidth: { xs: 400, sm: 480, md: 720, lg: 1000 },
                }}
              >
                <StyledInputBase
                  placeholder="Search products…"
                  inputProps={{ "aria-label": "search" }}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  sx={{ mr: 6 }}
                />
                <SearchButton aria-label="search" onClick={onSearch}>
                  <SearchIcon sx={{ fontSize: 22 }} />
                </SearchButton>
              </Search>
            </Box>

            {/* แสดงตะกร้าเฉพาะเมื่อไม่ใช่หน้า cart */}
            {!hideCart && (
              <IconButton
                color="inherit"
                aria-label="cart"
                component={Link}
                to="/cart"
                sx={{
                  mr: { xs: 0, md: 0, lg: 18 },
                  ml: { xs: 2, md: 5, lg: 18 },
                }}
              >
                <Badge
                  badgeContent={cartCount}
                  color="error"
                  max={99}
                  overlap="circular"
                  invisible={cartCount === 0}
                >
                  <ShoppingCartIcon sx={{ fontSize: 38 }} />
                </Badge>
              </IconButton>
            )}
          </Toolbar>
        </AppBar>
      </Box>
    </AppTheme>
  );
}
