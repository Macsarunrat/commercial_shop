import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { Stack, Button } from "@mui/material";
import Typography from "@mui/material/Typography";
import AppTheme from "../theme/AppTheme";
import Alert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const handleSignIn = () => {
    // TODO: ตรวจสอบฟอร์ม / call API ก่อนก็ได้
    navigate("/", { replace: true }); // กลับหน้า Home
    alert("Sign in success");
  };

  return (
    <>
      <AppTheme>
        <Box
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
              Sign in
            </Typography>
            <TextField
              id="email"
              label="Email"
              type="email"
              name="email"
              placeholder="Enter your email...@..."
              autoComplete="email"
              autoFocus
              required
              fullWidth
              variant="outlined"
            />

            <TextField
              id="username"
              label="Username"
              type="username"
              name="username"
              placeholder="Enter your Username"
              autoComplete=""
              autoFocus
              required
              fullWidth
              variant="outlined"
            />

            <TextField
              id="password"
              label="Password"
              type="password"
              name="Password"
              placeholder="..........."
              autoComplete="current-password"
              required
              fullWidth
              variant="outlined"
            />
            <TextField
              id="confirmpassword"
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              placeholder="..........."
              autoComplete="current-confirmpassword"
              required
              fullWidth
              variant="outlined"
            />
            <Button
              variant="contained"
              sx={{ fontSize: "1.5rem" }}
              onClick={handleSignIn}
            >
              SIGN IN
              {/* <Alert
                onClose={() => setOpen(false)}
                severity="success"
                variant="filled"
                sx={{ width: "100%" }}
              >
                This is a success Alert.
              </Alert> */}
            </Button>
          </Stack>
        </Box>
      </AppTheme>
    </>
  );
}
