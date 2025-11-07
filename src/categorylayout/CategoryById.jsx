import * as React from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  CircularProgress,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";

const API = "https://ritzily-nebule-clark.ngrok-free.dev";
const HDRS = { "ngrok-skip-browser-warning": "true" };

/** สร้าง query string จากออบเจกต์ โดยตัดค่าที่ว่าง/NaN/undefined ออก */
function buildQS(params) {
  const ent = Object.entries(params).filter(([, v]) => {
    if (v == null) return false;
    if (typeof v === "number") return Number.isFinite(v);
    const s = String(v).trim();
    return s !== "" && s.toLowerCase() !== "nan";
  });
  return ent.length ? `?${new URLSearchParams(ent).toString()}` : "";
}

/** รวม path รูปให้เป็น URL เต็ม + แนบพารามิเตอร์ข้ามหน้าเตือนของ ngrok */
function imageURL(path) {
  if (!path) return "";
  const url = new URL(path, API); // รองรับทั้ง absolute และ relative
  url.searchParams.set("ngrok-skip-browser-warning", "true");
  return url.toString();
}

/** map record จาก /store/products -> โครงกลาง (camelCase) */
function normalizeSell(it) {
  const priceNum =
    Number(String(it.Price ?? it.price ?? "0").replace(/,/g, "")) || 0;
  return {
    sellId: it.Sell_ID ?? it.sell_id ?? null, // ใช้เป็นคีย์หลัก
    // รองรับทั้ง Product_ID / product_ID / product_id
    productId: it.Product_ID ?? it.product_ID ?? it.product_id ?? null,
    shopId: it.Shop_ID ?? it.shop_id ?? null,
    categoryId: it.Category_ID ?? it.category_id ?? null,
    name: it.Product_Name ?? it.name ?? "Unnamed",
    price: priceNum,
    stock: Number(it.Stock ?? it.stock ?? 0),
    image: it.Cover_Image || it.image || "/IMG1/bagG.png",
  };
}

/**
 * props:
 *  - categoryId?: number|string
 *  - brandId?: number|string
 *  - q?: string
 *  - sortKey?: "priceAsc" | "priceDesc"
 */
export default function CategoryById({ categoryId, brandId, q, sortKey }) {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // เก็บรูปจาก /image/ แบบ group ต่อ productId
  // โครง: Map<number, Array<{src, imgId, isCover, productName}>>
  const [imgMap, setImgMap] = React.useState(new Map());

  React.useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const safeCategoryId = Number.isFinite(Number(categoryId))
          ? Number(categoryId)
          : null;
        const safeBrandId = Number.isFinite(Number(brandId))
          ? Number(brandId)
          : null;

        const qs = buildQS({
          q,
          category_id: safeCategoryId,
          brand_id: safeBrandId,
        });

        // ถ้าไม่มีพารามิเตอร์กรองเลย ไม่ต้องยิง API
        if (!qs) {
          setItems([]);
          setImgMap(new Map());
          setLoading(false);
          return;
        }

        // ยิงพร้อมกันทั้งสินค้าและรูปภาพ
        const [resProducts, resImages] = await Promise.all([
          fetch(`${API}/store/products${qs}`, {
            signal: controller.signal,
            headers: HDRS, // fetch JSON ใส่ header ได้
          }),
          fetch(`${API}/image/`, {
            signal: controller.signal,
            headers: HDRS,
          }),
        ]);

        if (!resProducts.ok) throw new Error(`HTTP ${resProducts.status}`);
        if (!resImages.ok) throw new Error(`HTTP ${resImages.status}`);

        const rawProducts = await resProducts.json();
        const rawImages = await resImages.json();

        // เตรียม imgMap: group ตาม Product_ID
        const nextImgMap = new Map();
        if (Array.isArray(rawImages)) {
          for (const r of rawImages) {
            const pid = Number(r.Product_ID ?? r.product_id);
            if (!Number.isFinite(pid)) continue;
            const arr = nextImgMap.get(pid) ?? [];
            arr.push({
              src: imageURL(r.Img_Src || r.img_src), // แนบ query ngrok
              imgId: r.Img_ID ?? r.img_id ?? null,
              isCover: Boolean(r.IsCover),
              productName: r.product_name ?? null,
            });
            nextImgMap.set(pid, arr);
          }
        }
        setImgMap(nextImgMap);

        // สินค้า + กรองสต็อก + ผูกภาพ cover
        let data = (
          Array.isArray(rawProducts) ? rawProducts : rawProducts?.items ?? []
        )
          .map(normalizeSell)
          .filter(Boolean)
          .filter((it) => (it.stock ?? 0) > 0)
          .map((p) => {
            const imgs = nextImgMap.get(Number(p.productId)) ?? [];
            const preferred = imgs.find((x) => x.isCover) ?? imgs[0];
            return {
              ...p,
              image: preferred?.src || p.image, // ใช้รูป cover/แรก ถ้ามี
              _imagesAll: imgs, // ส่งไปหน้า detail ได้
              _imagePreferred: preferred?.src || null,
            };
          });

        if (sortKey === "priceAsc") data.sort((a, b) => a.price - b.price);
        if (sortKey === "priceDesc") data.sort((a, b) => b.price - a.price);

        setItems(data);
      } catch (e) {
        if (e.name !== "AbortError") {
          setError(e.message || "Fetch failed");
          setItems([]);
          setImgMap(new Map());
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [categoryId, brandId, q, sortKey]);

  // ---------- Render ----------
  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ p: 2 }}>
        เกิดข้อผิดพลาด: {error}
      </Typography>
    );
  }

  if (items.length === 0) {
    return <Typography sx={{ p: 2 }}>ไม่พบสินค้าตามเงื่อนไข</Typography>;
  }

  return (
    <Box
      sx={{
        display: "grid",
        gap: 1.4,
        px: { xs: 0, md: 2 },
        gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))",
      }}
    >
      {items.map((p) => {
        // ลิงก์ไปหน้า detail โดยใช้ sellId เป็นหลัก และแนบทั้ง sid/pid ผ่าน search + state
        // แนบภาพที่เลือก + ลิสต์ภาพทั้งหมดของสินค้านั้นไปด้วย
        const toProduct = {
          pathname: `/mainshop/${p.sellId}`,
          search: `?sid=${encodeURIComponent(p.sellId)}${
            p.productId ? `&pid=${encodeURIComponent(p.productId)}` : ""
          }`,
          state: {
            sellId: p.sellId,
            productId: p.productId,
            image: p._imagePreferred, // ภาพหลัก
          },
        };

        return (
          <Card
            key={p.sellId ?? p.productId ?? Math.random()}
            variant="outlined"
            sx={{
              borderRadius: 0,
              overflow: "hidden",
              "&:hover": { transform: "scale(1.01)" },
            }}
          >
            <CardActionArea component={Link} to={toProduct}>
              <CardMedia
                component="img"
                src={p._imagePreferred}
                alt={p.name}
                sx={{ height: 180, objectFit: "cover" }}
                loading="lazy"
                // ถ้ารูปจาก ngrok ล่ม ให้ตกไปที่รูป placeholder
                onError={(e) => (e.currentTarget.src = "/IMG1/bagG.png")}
              />
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="subtitle2" noWrap title={p.name}>
                  {p.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ฿{(p.price || 0).toLocaleString("th-TH")}
                </Typography>
                {p.stock != null && (
                  <Typography variant="caption" color="text.secondary">
                    สต็อก: {p.stock}
                  </Typography>
                )}
              </CardContent>
            </CardActionArea>
          </Card>
        );
      })}
    </Box>
  );
}
