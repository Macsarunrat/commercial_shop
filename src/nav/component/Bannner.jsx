// src/nav/component/Bannner.jsx (หรือ SearchAppBar.jsx ตามที่คุณตั้งชื่อ)
import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  InputBase,
  Typography,
  Badge,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StoreIcon from "@mui/icons-material/Store";
import { Link, useLocation, matchPath, useNavigate } from "react-router-dom";
import AppTheme from "../../theme/AppTheme";
import useCartStore from "../../stores/cartStore";

const Search = styled("form")(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.contrastText, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.contrastText, 0.25),
  },
  marginLeft: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  width: "100%",
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
  const navigate = useNavigate();
  const location = useLocation();

  // จำนวนสินค้าในตะกร้า
  const cartCount = useCartStore((s) => s.cartCount());

  // state ช่องค้นหา
  const [q, setQ] = React.useState("");

  // ซิงก์ค่าช่องค้นหาตามพารามิเตอร์ q เมื่อเราอยู่หน้า /search
  React.useEffect(() => {
    const onSearchPage =
      matchPath({ path: "/search", end: true }, location.pathname) != null;
    if (onSearchPage) {
      const sp = new URLSearchParams(location.search);
      setQ(sp.get("q") ?? "");
    }
  }, [location.pathname, location.search]);

  // กดค้นหา (ทั้ง Enter และปุ่มไอคอน)
  const onSearch = (e) => {
    e?.preventDefault();
    const query = (q || "").trim();
    if (!query) return;

    // URLSearchParams จะเข้ารหัส (ภาษาไทย/ช่องว่าง) ให้เอง
    const qs = new URLSearchParams({ q: query }).toString();

    // ถ้าอยู่หน้า /search แล้วให้ replace เพื่อไม่ดัน history ยาวเกิน
    const onSearchPage =
      matchPath({ path: "/search", end: true }, location.pathname) != null;

    navigate(`/search?${qs}`, { replace: onSearchPage });
  };

  // ซ่อน cart icon เมื่ออยู่หน้า cart
  const hideCart =
    matchPath({ path: "/cart/*", end: false }, location.pathname) ||
    matchPath({ path: "/cart", end: true }, location.pathname);

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
                role="search"
                aria-label="product search"
                sx={{
                  width: "100%",
                  maxWidth: { xs: 400, sm: 480, md: 720, lg: 1000 },
                  position: "relative",
                }}
              >
                {/* (ถ้าต้องการแสดง icon คงที่ด้านซ้าย ให้ปลดคอมเมนต์) */}
                {/* <SearchIconWrapper>
                  <SearchIcon sx={{ fontSize: 22 }} />
                </SearchIconWrapper> */}
                <StyledInputBase
                  placeholder="ค้นหาสินค้า… / Search products…"
                  inputProps={{ "aria-label": "search" }}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  sx={{ mr: 6 }}
                />
                <SearchButton aria-label="search" type="submit">
                  <SearchIcon sx={{ fontSize: 22 }} />
                </SearchButton>
              </Search>
            </Box>

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
