import * as React from "react";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import AppTheme from "../theme/AppTheme";
import Card from "@mui/material/Card";
import Skeleton from "@mui/material/Skeleton";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import { Link } from "react-router-dom";

// src/shopui/ShopIcon.jsx

const API = "https://unsparingly-proextension-jacque.ngrok-free.dev";
const HDRS = { "ngrok-skip-browser-warning": "true" };

/* ---------- helpers ---------- */
function normalizeShop(s) {
  if (!s) return null;
  return {
    shopId: s.Shop_ID ?? s.shop_id ?? s.id ?? null,
    name: s.Shop_Name,
    phone: s.Shop_Phone,
    image: s.Cover_Image ?? s.image ?? "/IMG1/bagG.png",
  };
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
        // พยายามเรียกแบบเจาะไอดีก่อน
        const candidates = [`${API}/store/shops`];

        let found = null;
        for (const url of candidates) {
          try {
            const res = await fetch(url, {
              headers: HDRS,
              signal: controller.signal,
            });
            if (!res.ok) continue;
            const raw = await res.json();

            if (Array.isArray(raw)) {
              const hit = raw.find(
                (x) => String(x.Shop_ID ?? x.shop_id ?? x.id) === String(shopId)
              );
              if (hit) {
                found = normalizeShop(hit);
                break;
              }
            } else if (raw?.items && Array.isArray(raw.items)) {
              const hit = raw.items.find(
                (x) => String(x.Shop_ID ?? x.shop_id ?? x.id) === String(shopId)
              );
              if (hit) {
                found = normalizeShop(hit);
                break;
              }
            } else {
              // รูปแบบเป็นร้านเดียว
              const one = normalizeShop(raw);
              if (one?.shopId && String(one.shopId) === String(shopId)) {
                found = one;
                break;
              }
            }
          } catch {
            // ลองตัวถัดไป
          }
        }

        setShop(found);
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
        <CardMedia
          component="img"
          image={shop.image}
          alt={shop.name}
          sx={{
            width: { xs: 60, md: 72 },
            height: { xs: 60, md: 72 },
            objectFit: "cover",
            borderRadius: 1.5,
            border: (t) => `1px solid ${t.palette.divider}`,
          }}
          onError={(e) => (e.currentTarget.src = "/IMG1/bagG.png")}
        />

        <CardContent sx={{ p: 0, minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, alignItems: "center" }}
            noWrap
          >
            {shop.name}
          </Typography>
        </CardContent>

        {/* ขวาสุด: จัดตำแหน่งแนวนอน + เพิ่มช่องว่าง */}
        <CardContent
          sx={{ p: 3, display: { xs: "none", md: "block" }, ml: "auto" }}
        >
          <Stack
            direction="row"
            spacing={1} // ปรับค่าตรงนี้เพื่อเพิ่ม/ลดความห่าง
            alignItems="baseline" // ให้ตัวหนังสืออยู่แนวฐานเดียวกัน
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
              to={`/shop/${shop.shopId}`}
            >
              VIEW SHOP
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </AppTheme>
  );
}
