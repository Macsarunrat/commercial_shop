import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Skeleton from "@mui/material/Skeleton";
import AppTheme from "../theme/AppTheme";
import { useLocation, useParams } from "react-router-dom";

const API = "https://great-lobster-rightly.ngrok-free.app";
const HDRS = { "ngrok-skip-browser-warning": "true" };

/** ตัวช่วยประกอบ query string (ตัดค่า null/undefined/"") ออก */
const CARD_W = 220; // ความกว้างการ์ด “เท่ากันทุกใบ”
const CARD_H = 320; // ความสูงการ์ด “เท่ากันทุกใบ”
const IMG_H = 180; // ความสูงรูปคงที่
/* ================================== */

function normalizeShop(it) {
  if (!it) return null;
  return {
    id: it.Shop_ID ?? it.shop_id ?? null,
    name: it.Shop_Name ?? it.name ?? "",
    phone: it.Shop_Phone ?? it.phone ?? "",
    logo: it.Cover_Img_Url ?? it.logo ?? "/IMG1/bagG.png",
  };
}

function normalizeSell(it) {
  if (!it) return null;
  const priceNum =
    Number(String(it.Price ?? it.price ?? "0").replace(/,/g, "")) || 0;
  return {
    sellId: it.Sell_ID ?? it.sell_id ?? null,
    productId: it.Product_ID ?? it.product_id ?? null,
    shopId: it.Shop_ID ?? it.shop_id ?? null,
    name: it.Product_Name ?? it.name ?? "Unnamed",
    price: priceNum,
    stock: Number(it.Stock ?? it.stock ?? 0),
    image: it.Cover_Image || it.image || "/IMG1/bagG.png",
  };
}

export default function StoreShowUI() {
  const { shopId } = useParams();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [shop, setShop] = React.useState(null);
  const [items, setItems] = React.useState([]);

  React.useEffect(() => {
    if (!shopId) return;
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [shopsRes, sellsRes] = await Promise.all([
          fetch(`${API}/store/shops`, {
            signal: controller.signal,
            headers: HDRS,
          }),
          fetch(`${API}/store/products`, {
            signal: controller.signal,
            headers: HDRS,
          }),
        ]);

        if (!shopsRes.ok) throw new Error(`shops HTTP ${shopsRes.status}`);
        if (!sellsRes.ok) throw new Error(`products HTTP ${sellsRes.status}`);

        const shopsRaw = await shopsRes.json();
        const sellsRaw = await sellsRes.json();

        const shopsList = (
          Array.isArray(shopsRaw) ? shopsRaw : shopsRaw?.items ?? []
        )
          .map(normalizeShop)
          .filter(Boolean);

        const sellsList = (
          Array.isArray(sellsRaw) ? sellsRaw : sellsRaw?.items ?? []
        )
          .map(normalizeSell)
          .filter(Boolean);

        const matchedShop =
          shopsList.find((s) => String(s.id) === String(shopId)) ?? null;
        const myItems = sellsList.filter(
          (p) => String(p.shopId) === String(shopId)
        );

        setShop(matchedShop);
        setItems(myItems);
      } catch (e) {
        if (e.name !== "AbortError") setError(e);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [shopId]);

  /* ---------- Loading / Error ---------- */
  if (loading) {
    return (
      <AppTheme>
        <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, px: 2, pb: 5 }}>
          <Card sx={{ p: 2, mb: 3 }}>
            <Skeleton variant="rectangular" height={84} />
          </Card>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: `repeat(auto-fill, ${CARD_W}px)`,
              gap: 16,
              justifyContent: "center",
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                width={CARD_W}
                height={CARD_H}
              />
            ))}
          </Box>
        </Box>
      </AppTheme>
    );
  }

  if (error) {
    return (
      <AppTheme>
        <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, px: 2, pb: 5 }}>
          <Typography color="error">
            โหลดข้อมูลไม่สำเร็จ: {String(error.message || error)}
          </Typography>
        </Box>
      </AppTheme>
    );
  }

  if (!shop) {
    return (
      <AppTheme>
        <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, px: 2, pb: 5 }}>
          <Typography>ไม่พบข้อมูลร้าน (id: {shopId})</Typography>
        </Box>
      </AppTheme>
    );
  }

  const shopName = shop.name || `Shop ${shopId}`;
  const shopLogo = shop.logo || "/IMG1/bagG.png";

  /* ----------------------------- UI ----------------------------- */
  return (
    <AppTheme>
      <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, px: 2, pb: 5 }}>
        {/* หัวร้าน */}
        <Card
          sx={{ p: 2, mb: 3, display: "flex", alignItems: "center", gap: 2 }}
        >
          <CardMedia
            component="img"
            src={shopLogo}
            alt={shopName}
            sx={{ width: 64, height: 64, objectFit: "cover", borderRadius: 1 }}
            onError={(e) => (e.currentTarget.src = "/IMG1/bagG.png")}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" fontWeight={800} noWrap>
              {shopName}
            </Typography>
            {shop.phone && (
              <Typography variant="body2" color="text.secondary">
                Phone: {shop.phone}
              </Typography>
            )}
          </Box>
        </Card>

        <Typography variant="h6" sx={{ mb: 1 }}>
          สินค้าของร้านนี้
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {items.length === 0 ? (
          <Typography color="text.secondary">ร้านนี้ยังไม่มีสินค้า</Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: `repeat(auto-fill, ${CARD_W}px)`, // ★ กว้างเท่ากัน
              gap: 2,
              justifyContent: "center", // ★ จัดกึ่งกลางทั้งแถว
            }}
          >
            {items.map((p) => {
              const img =
                p.image &&
                (p.image.startsWith("/") || p.image.startsWith("http"))
                  ? p.image
                  : "/IMG1/bagG.png";

              return (
                <Card
                  key={p.sellId ?? `${p.productId}-${Math.random()}`}
                  variant="outlined"
                  sx={{
                    width: CARD_W, // ★ ล็อกกว้าง
                    height: CARD_H, // ★ ล็อกสูง
                    borderRadius: 2,
                    p: 1.5,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardMedia
                    component="img"
                    src={img}
                    alt={p.name || "-"}
                    sx={{
                      height: IMG_H, // ★ รูปคงที่
                      objectFit: "cover",
                      borderRadius: 1,
                      flexShrink: 0,
                    }}
                    onError={(e) => (e.currentTarget.src = "/IMG1/bagG.png")}
                  />

                  <Box
                    sx={{
                      mt: 1,
                      display: "flex",
                      flexDirection: "column",
                      minHeight: 0,
                      flex: 1,
                    }}
                  >
                    {/* ชื่อ: บรรทัดเดียว + ellipsis */}
                    <Typography
                      variant="body2"
                      title={p.name}
                      noWrap // ★ ตัด ... กรณีกว้างเกิน
                      sx={{ maxWidth: "100%" }}
                    >
                      {p.name ?? "-"}
                    </Typography>

                    {/* ราคา */}
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      sx={{ mt: 0.25 }}
                    >
                      ฿{(p.price ?? 0).toLocaleString("th-TH")}
                    </Typography>

                    {/* สต็อก: ชิดล่างเสมอ */}
                    <Typography
                      variant="caption"
                      color={p.stock > 0 ? "text.secondary" : "error.main"}
                      sx={{ mt: "auto" }}
                    >
                      {p.stock > 0 ? `IN STOCK (${p.stock})` : "OUT OF STOCK"}
                    </Typography>
                  </Box>
                </Card>
              );
            })}
          </Box>
        )}
      </Box>
    </AppTheme>
  );
}
