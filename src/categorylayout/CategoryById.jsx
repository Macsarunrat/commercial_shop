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
import { Scale } from "@mui/icons-material";
import { Link } from "react-router-dom";

const API = "https://great-lobster-rightly.ngrok-free.app";
const HDRS = { "ngrok-skip-browser-warning": "true" };

// function buildQS(params) {
//   const ent = Object.entries(params).filter(([, v]) => {
//     if (v === null || v === undefined) return false;
//     if (typeof v === "number") return Number.isFinite(v);
//     const s = String(v).trim();
//     if (s === "" || s.toLowerCase() === "nan") return false;
//     return true;
//   });
//   return ent.length ? `?${new URLSearchParams(ent).toString()}` : "";
// }

// /** ข้อมูลจาก /store/products -> โครงกลาง (camelCase) */
// function normalizeSell(it) {
//   if (!it) return null;
//   const priceNum =
//     Number(String(it.Price ?? it.price ?? "0").replace(/,/g, "")) || 0;

//   return {
//     sellId: it.Sell_ID ?? it.sell_id ?? null,
//     productId: it.Product_ID ?? it.product_id ?? null, // ถ้าไม่มี เดี๋ยว fallback เป็น sellId ตอนทำลิงก์
//     shopId: it.Shop_ID ?? it.shop_id ?? null,
//     categoryId: it.Category_ID ?? it.category_id ?? null, // อาจไม่มีใน /store/products
//     name: it.Product_Name ?? it.name ?? "Unnamed",
//     price: priceNum,
//     stock: Number(it.Stock ?? it.stock ?? 0),
//     image: it.Cover_Image || it.image || "/IMG1/bagG.png",
//   };
// }

// /** /products ใช้เพื่อเติม productId “ถ้าจำเป็น” เท่านั้น */
// function normalizeProduct(it) {
//   if (!it) return null;
//   return {
//     productId: it.Product_ID ?? it.product_id ?? null,
//     productName: it.Product_Name ?? it.name ?? "",
//   };
// }

// export default function CategoryById({ categoryId, brandId, q, sortKey }) {
//   const [items, setItems] = React.useState([]);
//   const [loading, setLoading] = React.useState(true);
//   const [error, setError] = React.useState(null);

//   React.useEffect(() => {
//     const controller = new AbortController();

//     (async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const safeCategoryId = Number.isFinite(Number(categoryId))
//           ? Number(categoryId)
//           : null;
//         const safeBrandId = Number.isFinite(Number(brandId))
//           ? Number(brandId)
//           : null;

//         // ส่งให้ backend กรองเอง
//         const qs = buildQS({
//           q,
//           category_id: safeCategoryId,
//           brand_id: safeBrandId,
//         });

//         // ดึง /store/products (ตัวแสดงหลัก) + /products (ไว้เติม productId หากขาด)
//         const [sellRes, productRes] = await Promise.all([
//           fetch(`${API}/store/products${qs}`, {
//             signal: controller.signal,
//             headers: HDRS,
//           }),
//           fetch(`${API}/products/`, {
//             signal: controller.signal,
//             headers: HDRS,
//           }),
//         ]);
//         if (!sellRes.ok)
//           throw new Error(`HTTP ${sellRes.status} (/store/products)`);
//         if (!productRes.ok)
//           throw new Error(`HTTP ${productRes.status} (/products/)`);

//         const [sellRaw, productRaw] = await Promise.all([
//           sellRes.json(),
//           productRes.json(),
//         ]);

//         let sells = (Array.isArray(sellRaw) ? sellRaw : sellRaw?.items ?? [])
//           .map(normalizeSell)
//           .filter(Boolean);

//         const products = (
//           Array.isArray(productRaw) ? productRaw : productRaw?.items ?? []
//         )
//           .map(normalizeProduct)
//           .filter(Boolean);

//         // เติม productId ถ้า /store ไม่มีให้ (match จากชื่อ)
//         const byName = new Map(
//           products
//             .filter((p) => p.productName)
//             .map((p) => [p.productName.toLowerCase(), p.productId])
//         );
//         sells = sells.map((s) => {
//           if (s.productId != null) return s;
//           const pid = s.name ? byName.get(String(s.name).toLowerCase()) : null;
//           return { ...s, productId: pid ?? s.productId };
//         });

//         // ❌ ไม่กรองด้วย category ฝั่งหน้าแล้ว (เพราะ /store/products ไม่มี categoryId)
//         // ถ้าหลังบ้านรองรับ ?category_id= ก็จะได้ผลลัพธ์กรองมาอยู่แล้ว

//         if (sortKey === "priceAsc") sells.sort((a, b) => a.price - b.price);
//         if (sortKey === "priceDesc") sells.sort((a, b) => b.price - a.price);

//         setItems(sells);
//       } catch (e) {
//         if (e.name !== "AbortError") {
//           setError(e.message || "Fetch failed");
//           setItems([]);
//         }
//       } finally {
//         setLoading(false);
//       }
//     })();

//     return () => controller.abort();
//   }, [categoryId, brandId, q, sortKey]);

//   // ---------- Render ----------
//   if (loading) {
//     return (
//       <Box sx={{ p: 2 }}>
//         <CircularProgress size={24} />
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Typography color="error" sx={{ p: 2 }}>
//         เกิดข้อผิดพลาด: {error}
//       </Typography>
//     );
//   }

//   if (items.length === 0) {
//     return <Typography sx={{ p: 2 }}>ไม่พบสินค้าตามเงื่อนไข</Typography>;
//   }

//   return (
//     <Box
//       sx={{
//         display: "grid",
//         gap: 1.4,
//         px: { xs: 0, md: 2 },
//         gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))",
//       }}
//     >
//       {items.map((p) => {
//         const pid = p.productId ?? p.sellId; // fallback ถ้า productId ไม่มี
//         const to = {
//           pathname: `/mainshop/${pid}`,
//           state: { productId: p.productId ?? null, sellId: p.sellId ?? null },
//         };

//         return (
//           <Card
//             key={`${p.sellId ?? p.productId ?? Math.random()}`}
//             variant="outlined"
//             sx={{
//               borderRadius: 0,
//               overflow: "hidden",
//               "&:hover": { transform: "scale(1.01)" },
//             }}
//           >
//             <CardActionArea component={Link} to={to}>
//               <CardMedia
//                 component="img"
//                 src={p.image || "/IMG1/bagG.png"}
//                 alt={p.name}
//                 sx={{ height: 180, objectFit: "cover" }}
//                 loading="lazy"
//                 onError={(e) => {
//                   e.currentTarget.src = "/IMG1/bagG.png";
//                 }}
//               />
//               <CardContent sx={{ py: 1.5 }}>
//                 <Typography variant="subtitle2" noWrap title={p.name}>
//                   {p.name}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   ฿{(p.price || 0).toLocaleString("th-TH")}
//                 </Typography>
//                 {p.stock != null && (
//                   <Typography variant="caption" color="text.secondary">
//                     สต็อก: {p.stock}
//                   </Typography>
//                 )}
//               </CardContent>
//             </CardActionArea>
//           </Card>
//         );
//       })}
//     </Box>
//   );
// }
function buildQS(params) {
  const ent = Object.entries(params).filter(([, v]) => {
    if (v == null) return false;
    if (typeof v === "number") return Number.isFinite(v);
    const s = String(v).trim();
    return s !== "" && s.toLowerCase() !== "nan";
  });
  return ent.length ? `?${new URLSearchParams(ent).toString()}` : "";
}

// map record จาก /store/products
function normalizeSell(it) {
  const priceNum =
    Number(String(it.Price ?? it.price ?? "0").replace(/,/g, "")) || 0;
  return {
    sellId: it.Sell_ID ?? it.sell_id ?? null, // ✅ ตัวหลัก
    productId: it.Product_ID ?? it.product_id ?? null, // อาจว่าง
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

        if (!qs) {
          setItems([]);
          setLoading(false);
          return;
        }

        const res = await fetch(`${API}/store/products${qs}`, {
          signal: controller.signal,
          headers: HDRS,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const raw = await res.json();
        let data = (Array.isArray(raw) ? raw : raw?.items ?? [])
          .map(normalizeSell)
          .filter(Boolean);

        if (sortKey === "priceAsc") data.sort((a, b) => a.price - b.price);
        if (sortKey === "priceDesc") data.sort((a, b) => b.price - a.price);

        setItems(data);
      } catch (e) {
        if (e.name !== "AbortError") {
          setError(e.message || "Fetch failed");
          setItems([]);
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [categoryId, brandId, q, sortKey]);

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
        // ✅ ลิงก์ไปหน้า detail โดยใช้ sellId เป็นหลัก และแนบทั้ง sid/pid
        const to = {
          pathname: `/mainshop/${p.sellId}`,
          search: `?sid=${encodeURIComponent(p.sellId)}${
            p.productId ? `&pid=${encodeURIComponent(p.productId)}` : ""
          }`,
          state: { sellId: p.sellId, productId: p.productId },
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
            <CardActionArea component={Link} to={to}>
              <CardMedia
                component="img"
                src={p.image}
                alt={p.name}
                sx={{ height: 180, objectFit: "cover" }}
                loading="lazy"
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
