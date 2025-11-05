import * as React from "react";
import { Alert, Collapse, Box } from "@mui/material";
import { useAuthStore } from "../stores/authStore";

export default function TokenBanner() {
  const needs = useAuthStore((s) => s.needsRefreshBanner);

  return (
    <Collapse in={!!needs}>
      <Box
        sx={{
          position: "fixed",
          top: 8,
          left: 0,
          right: 0,
          zIndex: 2000,
          px: 2,
        }}
      >
        <Alert severity="warning" sx={{ maxWidth: 900, mx: "auto" }}>
          เซสชันของคุณใกล้หมดอายุ ระบบจะต่ออายุให้อัตโนมัติ —
          ถ้าหน้าเว็บไม่รีเฟรชเอง โปรดกดรีเฟรชเบราว์เซอร์
        </Alert>
      </Box>
    </Collapse>
  );
}
