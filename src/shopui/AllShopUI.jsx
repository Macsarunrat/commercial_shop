import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CardActionArea from "@mui/material/CardActionArea";

import Typography from "@mui/material/Typography";
import AppTheme from "../theme/AppTheme";
import Box from "@mui/material/Box";

import Button from "@mui/material/Button";

import Skeleton from "@mui/material/Skeleton";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

// const API_BASE = "http://localhost:3000/Sell";

// export default function ShopsGrid() {
//   const [shops, setShops] = useState([]); // ← เปลี่ยนชื่อเป็น shops
//   const navigate = useNavigate();

//   const goToShop = (shop) => {
//     const shopId = shop.id ?? shop.shopId ?? shop._id; // จากรูป db.json มี id แน่นอน
//     const featuredProductId = shop.featuredProductId; // ถ้าไม่มี ก็ไม่เป็นไร
//     navigate(`/shop/${shopId}`, { state: { productId: featuredProductId } });
//   };

//   useEffect(() => {
//     const controller = new AbortController();
//     (async () => {
//       try {
//         const res = await fetch(API_BASE, { signal: controller.signal });
//         const data = await res.json(); // [{ id, name, countproduct, stock }, ...]
//         setShops(Array.isArray(data) ? data : []);
//       } catch (e) {
//         if (e.name !== "AbortError") console.error(e);
//       }
//     })();
//     return () => controller.abort();
//   }, []);

//   return (
//     <AppTheme>
//       <Box sx={{ px: 2.5, pt: 3 }}>
//         {shops.map((s) => {
//           const name = s.name ?? s.shopName ?? "-";
//           const logo = s.logoUrl ?? s.logo ?? "/IMG1/bagG.png";
//           const products =
//             s.countproduct ?? s.productsCount ?? s.products?.length;
//           const joined = s.joined; // ในตัวอย่างไม่มี อาจเป็น undefined ได้
//           const followers = s.followers ?? s.follower;
//           const stock = s.stock;

//           return (
//             <Card
//               key={s.id}
//               variant="outlined"
//               sx={{ mb: 2, borderRadius: 2, px: 2, py: 2, mx: 10 }}
//             >
//               <CardContent sx={{ py: 0 }}>
//                 <Grid container alignItems="center" spacing={2}>
//                   {/* ซ้าย: โลโก้ + ชื่อ + ปุ่ม */}
//                   <Grid item xs={12} md={4} lg={3}>
//                     <Stack direction="row" spacing={2} alignItems="center">
//                       <Avatar
//                         src={logo}
//                         alt={name}
//                         variant="rounded"
//                         sx={{ width: 80, height: 60 }}
//                       />
//                       <Stack spacing={1} sx={{ minWidth: 0 }}>
//                         <Typography variant="subtitle1" fontWeight={800} noWrap>
//                           {name}
//                         </Typography>
//                         <Button
//                           size="small"
//                           variant="outlined"
//                           sx={{
//                             borderRadius: 1,
//                             px: 1,
//                             py: 0.2,
//                             color: "primary.main",
//                           }}
//                           onClick={() => goToShop(s)} // ← ส่ง s
//                         >
//                           VIEW SHOP
//                         </Button>
//                       </Stack>
//                     </Stack>
//                   </Grid>

//                   {/* เส้นแบ่งเฉพาะจอ md+ */}
//                   <Grid
//                     item
//                     md="auto"
//                     sx={{ display: { xs: "none", md: "block" } }}
//                   >
//                     <Divider orientation="vertical" flexItem />
//                   </Grid>

//                   {/* ขวา: metrics */}
//                   <Grid item xs={12} md>
//                     <Grid
//                       container
//                       justifyContent="space-between"
//                       columnSpacing={{ xs: 2, md: 4 }}
//                       rowSpacing={1}
//                     >
//                       {products != null && (
//                         <Metric label="Products" value={products} />
//                       )}
//                       {joined != null && (
//                         <Metric label="Joined" value={joined} />
//                       )}
//                       {followers != null && (
//                         <Metric label="Follower" value={followers} />
//                       )}
//                       {stock != null && <Metric label="Stock" value={stock} />}
//                     </Grid>
//                   </Grid>
//                 </Grid>
//               </CardContent>
//             </Card>
//           );
//         })}

//         {shops.length === 0 && (
//           <Typography color="text.secondary" sx={{ mx: 5 }}>
//             ไม่มีข้อมูลร้านค้า
//           </Typography>
//         )}
//       </Box>
//     </AppTheme>
//   );
// }

// function Metric({ label, value }) {
//   return (
//     <Grid
//       item
//       xs={6}
//       sm={4}
//       md={4}
//       lg="auto"
//       sx={{ px: { xs: 1, md: 3 }, py: 1 }}
//     >
//       <Stack alignItems={{ xs: "flex-start", lg: "center" }} spacing={0.5}>
//         <Typography
//           variant="body2"
//           color="text.secondary"
//           sx={{ mb: 0.25, letterSpacing: 0.2 }}
//         >
//           {label}
//         </Typography>
//         <Typography variant="subtitle1" fontWeight={700} color="error.main">
//           {value}
//         </Typography>
//       </Stack>
//     </Grid>
//   );
// }

const API = "https://great-lobster-rightly.ngrok-free.app";
const HDRS = { "ngrok-skip-browser-warning": "true" };

// แปลงข้อมูลร้านจาก API → โครงกลางที่ UI ใช้
function buildQS(obj) {
  const ent = Object.entries(obj).filter(([, v]) => {
    if (v == null) return false;
    const s = String(v).trim();
    return s !== "" && s.toLowerCase() !== "nan";
  });
  return ent.length ? `?${new URLSearchParams(ent).toString()}` : "";
}

function normalizeShop(s) {
  if (!s) return null;
  return {
    shopId: s.Shop_ID ?? s.shop_id ?? s.id ?? null,
    name: s.Shop_Name ?? s.shop_name ?? s.name ?? "Unnamed Shop",
    phone: s.Shop_Phone ?? s.phone ?? "-",
    image: s.Cover_Image ?? s.image ?? "/IMG1/bagG.png",
    owner: s.Owner_Name ?? s.owner_name ?? null,
  };
}

export default function AllShopUI({ shopId: propShopId }) {
  // ถ้าเปิดจาก route เช่น /shop/:shopId ก็อ่านจาก params ได้
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
        // ลอง endpoint ที่มีรายการร้าน
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
            // ลองตัวถัดไป
          }
        }

        // กรองด้วย shopId ถ้ามี
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
            variant="outlined"
          >
            {/* รูปร้าน */}
            <CardMedia
              component="img"
              image={s.image}
              alt={s.name}
              sx={{
                width: { xs: 60, md: 72 },
                height: { xs: 60, md: 72 },
                objectFit: "cover",
                borderRadius: 1.5,
                border: (t) => `1px solid ${t.palette.divider}`,
              }}
              onError={(e) => (e.currentTarget.src = "/IMG1/bagG.png")}
            />

            {/* ชื่อร้าน/เจ้าของ */}
            <CardContent sx={{ p: 0, minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }} noWrap>
                {s.name} {s.owner ? `(${s.owner})` : ""}
              </Typography>
            </CardContent>

            <Box sx={{ display: "flex", mt: 2, gap: 10 }}>
              {/* เบอร์โทร */}
              <CardContent sx={{ p: 0, display: { xs: "none", md: "block" } }}>
                <Typography variant="body2" color="text.secondary">
                  Phone
                </Typography>
                <Typography sx={{ fontWeight: 700, color: "error.main" }}>
                  {s.phone || "-"}
                </Typography>
              </CardContent>

              {/* Shop ID + ปุ่ม */}
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
                  to={`/shop/${s.shopId}`}
                  sx={{ alignItems: "center" }}
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
