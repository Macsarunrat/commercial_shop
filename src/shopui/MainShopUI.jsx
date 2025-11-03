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
import { useEffect } from "react";
import { useCallback } from "react";
import { useCartStore } from "../stores/cartStore";
import ShopIcon from "./ShopIcon";

const API_BASE = "http://localhost:3000";

export default function ShopUI() {
  const addItem = useCartStore((s) => s.addItem);

  const { categoryId } = useParams(); // ← รับ categoryId
  const { state } = useLocation(); // ← รับ productId (optional)
  const preferredProductId = state?.productId; // อาจไม่มี

  const [qty, setQty] = React.useState(1);
  const [items, setItems] = React.useState([]); // สินค้าทั้งหมวด
  const [product, setProduct] = React.useState(null); // ชิ้นที่จะแสดง
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    if ((product.stock ?? 0) <= 0) return;
    -(-+addItem(product, qty)); // หรือ fix ให้ +1 เสมอ: addItem(product, 1)
  }, [product, qty, addItem]);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // ดึงสินค้าทั้งหมวด
        const res = await fetch(
          `${API_BASE}/products?categoryId=${encodeURIComponent(categoryId)}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const list = await res.json();

        setItems(Array.isArray(list) ? list : []);

        // เลือกสินค้าที่จะแสดง
        let picked = null;
        if (preferredProductId != null) {
          picked =
            list.find((x) => String(x.id) === String(preferredProductId)) ||
            null;
        }
        if (!picked) picked = list[0] || null;

        setProduct(picked);
        setQty(1); // reset จำนวนทุกครั้งที่เปลี่ยนสินค้า
      } catch (e) {
        if (e.name !== "AbortError") setError(e);
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [categoryId, preferredProductId]);

  const shopId = product?.shopId ?? null;

  if (loading) {
    return (
      <AppTheme>
        <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, px: 2, pb: 5 }}>
          <Card sx={{ p: 2 }}>
            <Skeleton variant="rectangular" height={420} />
            <Skeleton height={40} sx={{ mt: 2 }} />
          </Card>
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

  if (!product) {
    return (
      <AppTheme>
        <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, px: 2, pb: 5 }}>
          <Typography>ไม่พบสินค้าในหมวด {categoryId}</Typography>
        </Box>
      </AppTheme>
    );
  }

  const { name = "", price = 0, stock = 0 } = product;
  const image = product.image?.startsWith("/")
    ? product.image
    : "/IMG1/bagG.png";
  const formatBaht = (n) => new Intl.NumberFormat("th-TH").format(n);

  return (
    <AppTheme>
      <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, px: 2, pb: 5 }}>
        <Card sx={{ p: 2, px: 10 }}>
          <Grid container spacing={1} alignItems="flex-start">
            {/* ซ้าย: รูปสินค้า */}
            <Grid item xs={12} md={5}>
              <Card
                elevation={0}
                sx={{ borderRadius: 2, overflow: "hidden", mb: 2 }}
              >
                <CardMedia
                  component="img"
                  image={image}
                  alt={name || "product"}
                  sx={{ width: "100%", height: 300, objectFit: "cover" }}
                  onError={(e) => {
                    e.currentTarget.src = "/IMG1/bagG.png";
                  }}
                />
              </Card>
            </Grid>

            {/* ขวา: รายละเอียดสินค้า */}
            <Grid item xs={12} md={7}>
              <Stack spacing={2}>
                <Typography variant="h5" fontWeight={700} lineHeight={1.4}>
                  {name}
                </Typography>

                <Box
                  sx={{
                    bgcolor: "rgba(255,145,0,0.08)",
                    p: 2,
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="h4"
                    fontWeight={600}
                    color="primary.main"
                  >
                    ฿{formatBaht(price)}
                  </Typography>
                </Box>

                <Divider />

                {/* จำนวน */}
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography fontWeight={700}>Quantity</Typography>
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <IconButton
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      disabled={stock <= 0}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Typography sx={{ width: 40, textAlign: "center" }}>
                      {qty}
                    </Typography>
                    <IconButton
                      onClick={() => setQty((q) => Math.min(q + 1, stock))}
                      disabled={stock <= 0 || qty >= stock}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                  <Typography
                    variant="body2"
                    color={stock > 0 ? "text.secondary" : "error.main"}
                  >
                    {stock > 0 ? `IN STOCK (${stock})` : "OUT OF STOCK"}
                  </Typography>
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    disabled={stock <= 0}
                    onClick={handleAddToCart}
                  >
                    Add To Cart
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={stock <= 0}
                  >
                    Buy Now
                  </Button>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </Card>

        {/* ถ้าต้องการ: แสดงสินค้าอื่นในหมวดให้กดสลับ */}
        {/* <ShopIcon /> หรือ list อื่น ๆ */}
        <ShopIcon shopId={shopId} categoryId={categoryId} />
      </Box>
    </AppTheme>
  );
}
