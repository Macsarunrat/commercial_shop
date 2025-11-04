import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CardActionArea from "@mui/material/CardActionArea";
import Banner from "../nav/component/Bannner";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AppTheme from "../theme/AppTheme";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";

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
function normalizeShop(it) {
  if (!it) return null;
  return {
    shopId: it.Shop_ID ?? it.shop_id ?? null,
    name: it.Shop_Name ?? it.shop_name ?? "-",
    phone: it.Shop_Phone ?? it.phone ?? null,
    cover: it.Cover_Img_Url ?? it.cover ?? null,
  };
}

export default function ShopsGrid() {
  const [shops, setShops] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const navigate = useNavigate();

  const goToShop = (shop) => {
    if (!shop?.shopId) return;
    navigate(`/shop/${shop.shopId}`);
  };

  React.useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API}/store/shops`, {
          signal: controller.signal,
          headers: HDRS,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw = await res.json();
        const list = (Array.isArray(raw) ? raw : raw?.items ?? [])
          .map(normalizeShop)
          .filter(Boolean);
        setShops(list);
      } catch (e) {
        if (e.name !== "AbortError") setError(e.message || "Fetch failed");
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  return (
    <AppTheme>
      {/* กล่องกลางจอ */}
      <Box
        sx={{ maxWidth: 920, mx: "auto", pt: 3, pb: 6, px: { xs: 2, sm: 3 } }}
      >
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        )}

        {error && (
          <Typography color="error" sx={{ my: 1, textAlign: "center" }}>
            โหลดรายชื่อร้านไม่สำเร็จ: {error}
          </Typography>
        )}

        {!loading && !error && shops.length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: "center" }}>
            ไม่มีข้อมูลร้านค้า
          </Typography>
        )}

        {shops.map((s) => {
          const logo = s.cover || "/IMG1/bagG.png";
          return (
            <Card
              key={s.shopId ?? Math.random()}
              variant="outlined"
              sx={{
                mb: 2,
                borderRadius: 3,
                px: { xs: 2, sm: 2 },
                py: 2,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <CardContent sx={{ py: 0 }}>
                <Grid
                  container
                  alignItems="center"
                  spacing={2}
                  // ทำให้เนื้อหาอยู่ตรงกลางสวย ๆ
                  justifyContent="space-between"
                >
                  {/* ซ้าย: โลโก้ + ชื่อ + ปุ่ม */}
                  <Grid item xs={12} md={6}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        src={logo}
                        alt={s.name}
                        variant="rounded"
                        sx={{ width: 80, height: 60, borderRadius: 0 }}
                        imgProps={{
                          onError: (e) => {
                            e.currentTarget.src = "/IMG1/bagG.png";
                          },
                          loading: "lazy",
                        }}
                      />
                      <Stack spacing={1} sx={{ minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight={800}
                          noWrap
                          title={s.name}
                        >
                          {s.name}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => goToShop(s)}
                          sx={{
                            borderRadius: 1,
                            px: 1.25,
                            py: 0.25,
                            alignSelf: "flex-start",
                          }}
                        >
                          VIEW SHOP
                        </Button>
                      </Stack>
                    </Stack>
                  </Grid>

                  {/* เส้นแบ่งเฉพาะจอ md+ */}
                  <Grid
                    item
                    md="auto"
                    sx={{ display: { xs: "none", md: "block" } }}
                  >
                    <Divider orientation="vertical" flexItem />
                  </Grid>

                  {/* ขวา: ข้อมูลตัวเลข */}
                  <Grid item xs={12} md={5}>
                    <Grid
                      container
                      columnSpacing={3}
                      rowSpacing={1}
                      justifyContent={{ xs: "flex-start", md: "center" }}
                    >
                      <Metric label="Phone" value={s.phone ?? "-"} />
                      <Metric label="Shop ID" value={s.shopId ?? "-"} />
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </AppTheme>
  );
}

function Metric({ label, value }) {
  return (
    <Grid item xs="auto">
      <Stack alignItems={{ xs: "flex-start", md: "center" }} spacing={0.5}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="subtitle1" fontWeight={700} color="error.main">
          {value}
        </Typography>
      </Stack>
    </Grid>
  );
}
