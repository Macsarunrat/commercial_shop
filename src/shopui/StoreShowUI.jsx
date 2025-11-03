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

const SHOPS_API = "http://localhost:3000/Sell"; // ร้าน
const PRODUCTS_API = "http://localhost:3000/products"; // สินค้าทั้งหมด

export default function StoreShowUI() {
  const { shopId } = useParams(); // /shop/:shopId

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const [shop, setShop] = React.useState(null); // ร้านที่ id ตรงกับ shopId
  const [items, setItems] = React.useState([]); // สินค้าของร้านนี้เท่านั้น (กรองด้วย categoryId === shopId)

  React.useEffect(() => {
    if (!shopId) return;
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // ดึง "รายการร้าน" + "รายการสินค้า" พร้อมกัน
        const [shopsRes, productsRes] = await Promise.all([
          fetch(SHOPS_API, { signal: controller.signal }),
          fetch(PRODUCTS_API, { signal: controller.signal }),
        ]);

        if (!shopsRes.ok) throw new Error(`Sell HTTP ${shopsRes.status}`);
        if (!productsRes.ok)
          throw new Error(`Products HTTP ${productsRes.status}`);

        const shops = await shopsRes.json(); // ควรเป็น array
        const productsRaw = await productsRes.json(); // ควรเป็น array

        const allShops = Array.isArray(shops) ? shops : shops.items || [];
        const allProducts = Array.isArray(productsRaw)
          ? productsRaw
          : productsRaw.items || [];

        // หา "ร้าน" ที่ id ตรงกับพารามิเตอร์ (ลองเช็คทั้ง id, shopId, _id)
        const matchedShop =
          allShops.find(
            (s) => String(s.id ?? s.shopId ?? s._id) === String(shopId)
          ) || null;

        // ✅ กรองสินค้าให้ตรงกับ "ร้านนี้" โดยใช้ categoryId === shopId
        const productsOfShop = allProducts.filter(
          (p) => String(p.categoryId) === String(shopId)
        );

        setShop(matchedShop);
        setItems(productsOfShop);
      } catch (e) {
        if (e.name !== "AbortError") setError(e);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [shopId]);

  // ---------- Loading / Error ----------
  if (loading) {
    return (
      <AppTheme>
        <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, px: 2, pb: 5 }}>
          <Card sx={{ p: 2, mb: 2 }}>
            <Skeleton variant="rectangular" height={90} />
          </Card>
          <Grid container spacing={2}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Grid item xs={6} sm={4} md={3} key={i}>
                <Skeleton variant="rectangular" height={180} />
                <Skeleton height={22} />
                <Skeleton width="60%" height={22} />
              </Grid>
            ))}
          </Grid>
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

  const shopName = shop.name ?? shop.shopName ?? `Shop ${shopId}`;
  const shopLogo = shop.logoUrl ?? shop.logo ?? "/IMG1/bagG.png";

  return (
    <AppTheme>
      <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, px: 2, pb: 5 }}>
        {/* หัวร้าน */}
        <Card sx={{ p: 2, mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <CardMedia
              component="img"
              src={shopLogo}
              alt={shopName}
              sx={{
                width: 64,
                height: 64,
                objectFit: "cover",
                borderRadius: 1,
              }}
              onError={(e) => (e.currentTarget.src = "/IMG1/bagG.png")}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" fontWeight={800} noWrap>
                {shopName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Shop ID: {shopId}
              </Typography>
            </Box>
          </Stack>
        </Card>

        {/* รายการสินค้า (โชว์ name / price / stock) */}
        <Typography variant="h6" sx={{ mb: 1 }}>
          สินค้าของร้านนี้
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {items.length === 0 ? (
          <Typography color="text.secondary">ร้านนี้ยังไม่มีสินค้า</Typography>
        ) : (
          <Grid container spacing={2}>
            {items.map((p) => {
              const img =
                p.image &&
                (p.image.startsWith("/") || p.image.startsWith("http"))
                  ? p.image
                  : "/IMG1/bagG.png";
              return (
                <Grid item xs={6} sm={4} md={3} key={p.id}>
                  <Card variant="outlined" sx={{ p: 1 }}>
                    <CardMedia
                      component="img"
                      src={img}
                      alt={p.name || "-"}
                      sx={{
                        width: "100%",
                        height: 160,
                        objectFit: "cover",
                        borderRadius: 1,
                      }}
                      onError={(e) => (e.currentTarget.src = "/IMG1/bagG.png")}
                    />
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" noWrap>
                        {p.name ?? "-"}
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={700}>
                        ฿{(p.price ?? 0).toLocaleString("th-TH")}
                      </Typography>
                      <Typography
                        variant="caption"
                        color={p.stock > 0 ? "text.secondary" : "error.main"}
                      >
                        {p.stock > 0 ? `IN STOCK (${p.stock})` : "OUT OF STOCK"}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </AppTheme>
  );
}
