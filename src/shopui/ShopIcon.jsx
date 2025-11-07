// src/shopui/ShopIcon.jsx
import * as React from "react";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
  Skeleton,
  Avatar,
} from "@mui/material";
import { Link } from "react-router-dom";
import AppTheme from "../theme/AppTheme";

const API = "https://ritzily-nebule-clark.ngrok-free.dev";
const HDRS = { "ngrok-skip-browser-warning": "true" };

/* ---------- helpers ---------- */
function normalizeShop(s) {
  if (!s) return null;
  return {
    shopId: s.Shop_ID ?? s.shop_id ?? s.id ?? null,
    name: s.Shop_Name ?? s.shop_name ?? s.name ?? "Unnamed Shop",
    phone: s.Shop_Phone ?? s.phone ?? "-",
  };
}

function getFirstLetter(name) {
  const ch =
    String(name || "")
      .trim()
      .charAt(0) || "?";
  return ch.toUpperCase();
}

/** Avatar ตัวอักษรพื้นหลัง primary.main */
function LetterAvatar({ name, size = 72 }) {
  const letter = getFirstLetter(name);
  return (
    <Avatar
      alt={name}
      sx={{
        width: size,
        height: size,
        bgcolor: "#f5f5f5",
        color: "black",
        fontWeight: 800,
        fontSize: size * 0.48,
        borderRadius: 1.5,
        border: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      {letter}
    </Avatar>
  );
}

export default function ShopIcon({ shopId }) {
  const [shop, setShop] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState(null);

  React.useEffect(() => {
    if (!shopId) {
      setShop(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        // ใช้ /store/shops แล้วกรองเอา shopId ที่ต้องการ
        const res = await fetch(`${API}/store/shops`, {
          headers: HDRS,
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const raw = await res.json();
        const arr = Array.isArray(raw) ? raw : raw?.items ?? [];
        const hit = arr.find(
          (x) => String(x.Shop_ID ?? x.shop_id ?? x.id) === String(shopId)
        );
        setShop(normalizeShop(hit));
      } catch (e) {
        if (e.name !== "AbortError") setErr(e);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [shopId]);

  if (!shopId) return null;

  if (loading)
    return (
      <Box sx={{ mt: 2 }}>
        <Skeleton variant="rounded" height={120} />
      </Box>
    );

  if (err)
    return (
      <Box sx={{ mt: 2, color: "crimson" }}>
        โหลดข้อมูลร้านไม่สำเร็จ: {String(err.message || err)}
      </Box>
    );

  if (!shop)
    return <Box sx={{ mt: 2 }}>ไม่พบข้อมูลร้าน (Shop ID: {shopId})</Box>;

  return (
    <AppTheme>
      <Card
        sx={{
          mt: 2,
          px: 2,
          py: 1.5,
          borderRadius: 1,
          display: "grid",
          gridTemplateColumns: { xs: "60px 1fr", md: "80px 1fr auto" },
          alignItems: "center",
          columnGap: 2,
        }}
        variant="outlined"
      >
        {/* ไอคอนตัวอักษรตามชื่อร้าน */}
        <LetterAvatar name={shop.name} size={72} />

        <CardContent sx={{ p: 0, minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }} noWrap>
            {shop.name}
          </Typography>
        </CardContent>

        {/* ส่วนขวา */}
        <CardContent
          sx={{ p: 3, display: { xs: "none", md: "block" }, ml: "auto" }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="baseline"
            justifyContent="flex-end"
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="baseline"
              sx={{ minWidth: 220 }}
            >
              <Typography variant="body2" color="text.secondary">
                Phone
              </Typography>
              <Typography sx={{ fontWeight: 700, color: "error.main" }}>
                {shop.phone}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              alignItems="baseline"
              sx={{ minWidth: 140 }}
            >
              <Typography variant="body2" color="text.secondary">
                Shop ID
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>{shop.shopId}</Typography>
            </Stack>

            <Button
              variant="outlined"
              component={Link}
              to={`/shopuser/${shop.shopId}`}
            >
              VIEW SHOP
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </AppTheme>
  );
}
