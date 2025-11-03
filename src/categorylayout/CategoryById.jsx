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

// /** ช่วยประกอบ query string เฉพาะค่าที่ไม่ว่าง */
// function buildQS(params) {
//   const ent = Object.entries(params).filter(
//     ([, v]) => v != null && String(v).trim() !== ""
//   );
//   return ent.length ? `?${new URLSearchParams(ent).toString()}` : "";
// }

// /** แปลง item จาก API (Sell) -> โครงกลางที่ UI ใช้ง่าย */
// function normalizeSell(it) {
//   if (!it) return null;
//   const priceNum = Number(String(it.Price ?? "0").replace(/,/g, "")) || 0;
//   return {
//     sellId: it.Sell_ID ?? it.sell_id ?? null,
//     productId: it.Product_ID ?? it.product_id ?? null, // ถ้า API ไม่มี ก็จะเป็น null
//     shopId: it.Shop_ID ?? it.shop_id ?? null,
//     name: it.Product_Name ?? "Unnamed",
//     price: priceNum,
//     stock: Number(it.Stock ?? 0),
//     image:
//       it.Cover_Image ||
//       it.image ||
//       "https://via.placeholder.com/300x300?text=No+Image",
//     // ถ้าหลังบ้านมี category ให้เติม mapping ได้ เช่น categoryId: it.Category_ID
//     categoryId: it.Category_ID ?? it.category_id ?? null,
//   };
// }

// export default function CategoryById({
//   categoryId, // ถ้ามีหมวด: จะส่งไปเป็น query ?category_id=
//   brandId, // ถ้ามีแบรนด์: จะส่งไปเป็น query ?brand_id=
//   q, // ถ้ามีคำค้น: จะส่งไปเป็น query ?q=
//   sortKey, // "priceAsc" | "priceDesc"
// }) {
//   const [items, setItems] = React.useState([]);
//   const [loading, setLoading] = React.useState(true);
//   const [error, setError] = React.useState(null);

//   React.useEffect(() => {
//     const controller = new AbortController();

//     async function run() {
//       setLoading(true);
//       setError(null);
//       try {
//         // ส่งพารามิเตอร์ไปฝั่ง API เลย (ถ้าคุณมี endpoint รองรับ)
//         const qs = buildQS({
//           q,
//           category_id: categoryId,
//           brand_id: brandId,
//         });

//         const res = await fetch(`${API}/store/products${qs}`, {
//           signal: controller.signal,
//           headers: HDRS,
//         });
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);

//         const raw = await res.json();
//         const list = Array.isArray(raw) ? raw : raw?.items ?? [];

//         // normalize เป็นโครงเดียว
//         let data = list.map(normalizeSell).filter(Boolean);

//         // สำรอง: ถ้าอยากกรองฝั่งหน้าเว็บด้วยก็ได้ (ในกรณี API ยังไม่รองรับ)
//         if (categoryId != null && categoryId !== "") {
//           const cid = Number(categoryId);
//           if (Number.isFinite(cid)) {
//             data = data.filter((p) => Number(p.categoryId) === cid);
//           }
//         }
//         if (brandId != null && brandId !== "") {
//           const bid = String(brandId).toLowerCase();
//           // ถ้า API คืนชื่อแบรนด์ค่อยมาเทียบชื่อ ที่นี่สมมติว่าใช้ brand_id จาก server ดีกว่า
//         }

//         // เรียงราคา
//         if (sortKey === "priceAsc") data.sort((a, b) => a.price - b.price);
//         if (sortKey === "priceDesc") data.sort((a, b) => b.price - a.price);

//         setItems(data);
//       } catch (e) {
//         if (e.name !== "AbortError") {
//           setError(e.message || "Fetch failed");
//           setItems([]);
//         }
//       } finally {
//         setLoading(false);
//       }
//     }

//     run();
//     return () => controller.abort();
//   }, [categoryId, brandId, q, sortKey]);

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
//       {items.map((p) => (
//         <Card
//           key={`${p.sellId ?? p.productId ?? Math.random()}`}
//           variant="outlined"
//           sx={{
//             borderRadius: 0,
//             overflow: "hidden",
//             "&:hover": { transform: "scale(1.01)" },
//           }}
//         >
//           <CardActionArea
//             sx={{ position: "relative", display: "block" }}
//             component={Link}
//             // ถ้าหน้า detail ของคุณคาดหวัง categoryId ใน URL ให้ปรับตามเหมาะสม
//             to={`/mainshop/${p.categoryId ?? p.productId ?? 0}`}
//             state={{ productId: p.productId, sellId: p.sellId }}
//           >
//             <CardMedia
//               component="img"
//               src={p.image}
//               alt={p.name}
//               sx={{ height: 180, objectFit: "cover" }}
//               loading="lazy"
//               onError={(e) => {
//                 e.currentTarget.src =
//                   "https://via.placeholder.com/300x300?text=No+Image";
//               }}
//             />
//             <CardContent sx={{ py: 1.5 }}>
//               <Typography variant="subtitle2" noWrap title={p.name}>
//                 {p.name}
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 ฿{(p.price || 0).toLocaleString("th-TH")}
//               </Typography>
//               {p.stock != null && (
//                 <Typography variant="caption" color="text.secondary">
//                   สต็อก: {p.stock}
//                 </Typography>
//               )}
//             </CardContent>
//           </CardActionArea>
//         </Card>
//       ))}
//     </Box>
//   );
// }
function buildQS(params) {
  const ent = Object.entries(params).filter(([, v]) => {
    if (v === null || v === undefined) return false;
    if (typeof v === "number") return Number.isFinite(v);
    const s = String(v).trim();
    if (s === "" || s.toLowerCase() === "nan") return false;
    return true;
  });
  return ent.length ? `?${new URLSearchParams(ent).toString()}` : "";
}

/** แปลงโครงจาก API เป็นรูปแบบกลางที่เราวาด UI ง่าย */
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
    categoryId: it.Category_ID ?? it.category_id ?? null,
  };
}

/**
 * props:
 *  - categoryId?: number
 *  - brandId?: number
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
        // ทำให้เป็นค่าปลอดภัยก่อนประกอบ query
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

        // ยังไม่มีพารามิเตอร์ที่ถูกต้อง → ไม่ต้องยิง
        if (!qs) {
          setItems([]);
          setLoading(false);
          return;
        }

        const url = `${API}/store/products${qs}`;
        // console.debug("GET", url);
        const res = await fetch(url, {
          signal: controller.signal,
          headers: HDRS,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const raw = await res.json();
        const list = Array.isArray(raw) ? raw : raw?.items ?? [];
        let data = list.map(normalizeSell).filter(Boolean);

        // เรียงราคา
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

  // ----- Render -----
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
      {items.map((p) => (
        <Card
          key={`${p.sellId ?? p.productId ?? Math.random()}`}
          variant="outlined"
          sx={{
            borderRadius: 0,
            overflow: "hidden",
            "&:hover": { transform: "scale(1.01)" },
          }}
        >
          <CardActionArea
            sx={{ position: "relative", display: "block" }}
            component={Link}
            to={`/mainshop/${p.categoryId ?? p.productId ?? 0}`}
            state={{ productId: p.productId, sellId: p.sellId }}
          >
            <CardMedia
              component="img"
              src={p.image}
              alt={p.name}
              sx={{ height: 180, objectFit: "cover" }}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = "/IMG1/bagG.png";
              }}
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
      ))}
    </Box>
  );
}
