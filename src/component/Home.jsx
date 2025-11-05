import React from "react";
import BarHome from "../homelayout/BarHome";
import NewProductHome from "../homelayout/NewProductHome";
import CategoryHome from "../categorylayout/CategoryHome";

import { useLocation, useNavigate } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });

  React.useEffect(() => {
    const loginMessage = location.state?.message;
    
    const logoutMessage = sessionStorage.getItem("snackbar_message");

    if (loginMessage) {
      setSnackbar({
        open: true,
        message: loginMessage,
        severity: "success",
      });
      // เคลียร์ message ออกจาก state
      navigate(location.pathname, { replace: true, state: {} });
    } else if (logoutMessage) {
      setSnackbar({
        open: true,
        message: logoutMessage,
        severity: "success",
      });
      // เคลียร์ message ออกจาก sessionStorage (กัน F5 แล้วขึ้นซ้ำ)
      sessionStorage.removeItem("snackbar_message");
    }
  }, [location.state, navigate, location.pathname]); 

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((s) => ({ ...s, open: false }));
  };

  return (
    <div className="">
      <BarHome />
      <NewProductHome limit={6} showSeeAllText={true} />
      <CategoryHome />

      {/* ... (Snackbar JSX เหมือนเดิม) */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Home;