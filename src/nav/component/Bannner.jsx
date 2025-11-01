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
import { Link } from "react-router-dom";
import AppTheme from "../../theme/AppTheme";

const Search = styled("form")(({ theme }) => ({
  position: "relative",
  borderRadius: 9999,
  backgroundColor: alpha(theme.palette.primary.contrastText, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.contrastText, 0.25),
  },
  marginLeft: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  width: "100%", // <-- ให้กว้างเต็มพื้นที่ของ box ที่ครอบ
  maxWidth: "unset", // <-- ไม่จำกัด maxWidth ตายตัว (หรือจะใส่ 1200 ก็ได้)
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
    padding: theme.spacing(1.2, 5, 1.2, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
  },
}));

const SearchButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  right: 4,
  color: "inherit",
}));

export default function SearchAppBar() {
  const [q, setQ] = React.useState("");

  const onSearch = (e) => {
    e?.preventDefault();
    console.log("search:", q);
  };

  return (
    <AppTheme>
      <Box sx={{ flexGrow: 1, gap: 5 }}>
        <AppBar position="static" color="primary" enableColorOnDark>
          <Toolbar sx={{ ml: 5 }}>
            {/* ซ้าย: โลโก้ + ชื่อ */}
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

            {/* กลาง: ช่องค้นหาให้ยาวขึ้น (กินพื้นที่ที่เหลือทั้งหมด) */}
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                ml: 3,
              }}
            >
              <Search
                onSubmit={onSearch}
                sx={{ width: "100%", maxWidth: 1000 }}
              >
                <SearchIconWrapper>
                  <SearchIcon sx={{ fontSize: 22 }} />
                </SearchIconWrapper>

                <StyledInputBase
                  placeholder="Search products…"
                  inputProps={{ "aria-label": "search" }}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />

                <SearchButton aria-label="search" onClick={onSearch}>
                  <SearchIcon sx={{ fontSize: 22 }} />
                </SearchButton>
              </Search>
            </Box>

            {/* ขวา: ตะกร้า (เพิ่มระยะห่างมากขึ้น) */}
            <IconButton
              color="inherit"
              aria-label="cart"
              sx={{ mr: { sx: 10, lg: 18 } }} // <-- ระยะห่างมากขึ้นแบบ responsive
            >
              <ShoppingCartIcon sx={{ fontSize: 35 }} />
            </IconButton>
          </Toolbar>
        </AppBar>
      </Box>
    </AppTheme>
  );
}
