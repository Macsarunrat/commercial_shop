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
import AppTheme from "../../theme/AppTheme";
import { useAuthStore } from "../../stores/authStore.jsx";
import api from "../../api.js"; 

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

  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => !!state.token);
  const user = useAuthStore((state) => state.user); 
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
    } catch (error) {
      console.error("Logout API failed, clearing auth locally.", error);
    }
    clearAuth();
    navigate("/");
  };

  return (
    <AppTheme>
      <AppBar position="static" sx={{ bgcolor: "" }}>
        <Container maxWidth="xl">
          <Toolbar>
            <Box
              sx={{
                display: {
                  xs: "flex",
                  md: "none",
                },
              }}
            >
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
                {Navpages.map((p) => (
                  <MenuItem
                    key={p.index}
                    onClick={closeNav}
                    component={Link}
                    to={p.to}
                    sx={{ fontFamily: "Inter", fontSize: 14 }}
                  >
                    {p.label}
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            <Box
              sx={{
                flexGrow: 1,
                display: { xs: "none", md: "flex" },
                gap: 10,
                justifyContent: "start",
              }}
            >
              {Navpages.map((p) => (
                <Button
                  key={p.index}
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
            </Box>

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
                    สวัสดี, {user?.sub}
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
                    to={"register"}
                    variant="outlined"
                    sx={{ color: "white", borderColor: "white" }}
                  >
                    Register
                  </Button>
                  <Button
                    component={Link}
                    to={"login"}
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
