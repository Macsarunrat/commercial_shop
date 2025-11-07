// src/shopui/AllShopUI.jsx
import * as React from "react";
import { useParams, Link } from "react-router-dom";
import AppTheme from "../theme/AppTheme";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";

const API = "https://ritzily-nebule-clark.ngrok-free.dev";
const HDRS = { "ngrok-skip-browser-warning": "true" };

/* ---------------- helpers ---------------- */
function normalizeShop(s) {
  if (!s) return null;
  return {
    shopId: s.Shop_ID ?? s.shop_id ?? s.id ?? null,
    name: s.Shop_Name ?? s.shop_name ?? s.name ?? "Unnamed Shop",
    phone: s.Shop_Phone ?? s.phone ?? "-",
    image: s.Cover_Image ?? s.image ?? null,
    owner: s.Owner_Name ?? s.owner_name ?? null,
  };
}

function getInitial(name) {
  const ch = (name || "").trim()[0] || "?";
  return ch.toUpperCase();
}

/** รูปร้านที่ fallback เป็น Avatar ตัวอักษรแรก (bg = theme.palette.primary.main) */
function ShopImage({ name, src, boxSize = { xs: 60, md: 72 } }) {
  const [failed, setFailed] = React.useState(false);
  const hasImg = src && !failed;

  return (
    <Box
      sx={{
        width: { xs: boxSize.xs, md: boxSize.md },
        height: { xs: boxSize.xs, md: boxSize.md },
      }}
    >
      {hasImg ? (
        <Box
          component="img"
          src={src}
          alt={name}
          onError={() => setFailed(true)}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: 1.5,
            border: (t) => `1px solid ${t.palette.divider}`,
            display: "block",
          }}
        />
      ) : (
        <Avatar
          sx={{
            width: "100%",
            height: "100%",
            borderRadius: 1.5,
            fontWeight: 700,
            fontSize: 28,
            bgcolor: "#f5f5f5", // <<-- primary.main
            color: "black", // <<-- ตัวอักษรอ่านชัด
            border: (t) => `1px solid ${t.palette.divider}`,
          }}
          aria-label={name}
        >
          {getInitial(name)}
        </Avatar>
      )}
    </Box>
  );
}

/* ---------------- component ---------------- */
export default function AllShopUI({ shopId: propShopId }) {
  const params = useParams();
  const shopId = propShopId ?? params.shopId ?? null;

  const [shops, setShops] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState(null);

  React.useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const candidates = [`${API}/store/shops`, `${API}/shops`];
        let list = [];
        for (const url of candidates) {
          try {
            const res = await fetch(url, {
              headers: HDRS,
              signal: controller.signal,
            });
            if (!res.ok) continue;
            const raw = await res.json();
            const arr = Array.isArray(raw)
              ? raw
              : raw?.items ?? raw?.data ?? [];
            list = arr.map(normalizeShop).filter(Boolean);
            break;
          } catch {
            /* try next */
          }
        }
        const filtered = shopId
          ? list.filter((s) => String(s.shopId) === String(shopId))
          : list;
        setShops(filtered);
      } catch (e) {
        if (e.name !== "AbortError") setErr(e);
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [shopId]);

  if (loading) {
    return (
      <Box sx={{ mt: 2 }}>
        <Skeleton variant="rounded" height={120} />
      </Box>
    );
  }

  if (err) {
    return (
      <Box sx={{ mt: 2, color: "crimson" }}>
        โหลดข้อมูลร้านไม่สำเร็จ: {String(err.message || err)}
      </Box>
    );
  }

  if (shops.length === 0) {
    return <Box sx={{ mt: 2 }}>ไม่พบร้าน</Box>;
  }

  return (
    <AppTheme>
      <Box sx={{ mt: 3, mx: 10 }}>
        {shops.map((s) => (
          <Card
            key={s.shopId}
            variant="outlined"
            sx={{
              px: 2,
              py: 1.5,
              mb: 2,
              borderRadius: 2,
              display: "grid",
              gridTemplateColumns: { xs: "60px 1fr", md: "80px 1fr auto auto" },
              alignItems: "center",
              columnGap: 2,
            }}
          >
            <ShopImage name={s.name} src={s.image} />

            <CardContent sx={{ p: 0, minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }} noWrap>
                {s.name} {s.owner ? `(${s.owner})` : ""}
              </Typography>
            </CardContent>

            <Box sx={{ display: "flex", mt: 2, gap: 10 }}>
              <CardContent sx={{ p: 0, display: { xs: "none", md: "block" } }}>
                <Typography variant="body2" color="text.secondary">
                  Phone
                </Typography>
                <Typography sx={{ fontWeight: 700, color: "error.main" }}>
                  {s.phone || "-"}
                </Typography>
              </CardContent>

              <CardContent
                sx={{
                  p: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  justifyContent: { xs: "flex-start", md: "flex-end" },
                }}
              >
                <Box sx={{ display: { xs: "none", md: "block" }, mr: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Shop ID
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{s.shopId}</Typography>
                </Box>

                <Button
                  variant="outlined"
                  component={Link}
                  to={`/shopuser/${s.shopId}`}
                >
                  VIEW SHOP
                </Button>
              </CardContent>
            </Box>
          </Card>
        ))}
      </Box>
    </AppTheme>
  );
}
