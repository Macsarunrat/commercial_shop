import * as React from "react";
import {
  Box,
  Stack,
  Grid,
  Avatar,
  Typography,
  Button,
  Chip,
  Divider,
  Link,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import StorefrontIcon from "@mui/icons-material/Storefront";

export default function SellerInfoBar() {
  // ข้อมูลตัวอย่าง — เปลี่ยนเป็น props หรือดึงจาก API ก็ได้
  const seller = {
    logo: "/IMG1/bagG.png", // ใส่โลโก้ร้านจาก public/
    name: "POLYHOME",
    preferred: true,
    metrics: [
      { label: "Ratings", value: "58.2k" },
      { label: "Response Rate", value: "98%" },
      { label: "Products", value: "374" },
      { label: "Response Time", value: "within hours" },
      { label: "Joined", value: "7 years ago" },
      { label: "Follower", value: "32k" },
    ],
  };

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        mt: 3,
      }}
    >
      <Grid container spacing={3} alignItems="center">
        {/* ซ้าย: โลโก้ + ชื่อ + ปุ่ม */}
        <Grid item xs={12} md={5} lg={4}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={seller.logo}
              alt={seller.name}
              sx={{ width: 90, height: 70, borderRadius: 2 }}
              variant="rounded"
            />
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Stack
                direction="row"
                spacing={0}
                alignItems="center"
                sx={{ pt: 1 }}
              >
                <Typography fontWeight={700} sx={{ fontSize: 24 }} noWrap>
                  {seller.name}
                </Typography>
              </Stack>

              <Stack
                direction="row"
                spacing={1.5}
                sx={{ mt: 0.5 }}
                flexWrap="wrap"
              ></Stack>
            </Box>
          </Stack>
        </Grid>

        {/* เส้นแบ่งเฉพาะจอ md ขึ้นไป */}
        <Grid
          item
          md="auto"
          sx={{
            display: { xs: "none", md: "block" },
          }}
        >
          <Divider orientation="vertical" flexItem />
        </Grid>

        {/* ขวา: คอลัมน์ตัวเลขสถิติ */}
        <Grid item xs={12} md>
          <Grid
            container
            spacing={0}
            columns={12}
            sx={{ "& > .metric": { px: { xs: 0, md: 2 } } }}
          >
            {seller.metrics.map((m, i) => (
              <Grid
                key={m.label}
                item
                xs={12}
                sm={6}
                md={4}
                lg={2}
                className="metric"
              >
                <Stack
                  alignItems={{ xs: "flex-start", lg: "center" }}
                  sx={{ py: 0.5, px: 2 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {m.label}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    color="error.main"
                  >
                    {m.value}
                  </Typography>
                </Stack>
                {/* เส้นแบ่งแนวตั้งระหว่างคอลัมน์บนจอใหญ่ */}
                {i < seller.metrics.length - 1 && (
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{
                      display: { xs: "none", lg: "block" },
                      position: "absolute",
                      right: 0,
                      top: 12,
                      bottom: 12,
                    }}
                  />
                )}
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

// const API_URL = "/api/shops/123"; // ← เปลี่ยนเป็น endpoint ของคุณ

// export default function ShopInfoPage() {
//   const [data, setData] = React.useState(null);
//   const [loading, setLoading] = React.useState(true);
//   const [error, setError] = React.useState(null);

//   // === 2) ดึงข้อมูลจาก API ===
//   React.useEffect(() => {
//     let cancelled = false;
//     setLoading(true);
//     fetch(API_URL)
//       .then((r) => {
//         if (!r.ok) throw new Error("Bad response");
//         return r.json();
//       })
//       .then((json) => {
//         if (!cancelled) setData(json);
//       })
//       .catch((e) => !cancelled && setError(e))
//       .finally(() => !cancelled && setLoading(false));
//     return () => { cancelled = true; };
//   }, []);

//   // === 3) แปลง JSON → รูปที่ UI ต้องใช้ (รองรับหลายชื่อฟิลด์) ===
//   const view = React.useMemo(() => {
//     if (!data) return null;

//     // ชื่อร้าน / เบอร์
//     const shopName  = data.Shop_Name  ?? data.shopName  ?? data.name  ?? "-";
//     const shopPhone = data.Shop_Phone ?? data.shopPhone ?? data.phone ?? "-";

//     // รูปภาพ (ถ้ามี)
//     const image =
//       data.imageUrl || data.logoUrl || data.avatar || data.image || "";

//     // ที่อยู่ (รองรับทั้ง object เดียว / array)
//     const addrRaw =
//       data.Shop_Address ||
//       data.shopAddress ||
//       data.address ||
//       (Array.isArray(data.addresses) ? data.addresses[0] : null) ||
//       {};

//     const province = addrRaw.Province ?? addrRaw.province ?? "-";
//     const amphor   = addrRaw.Amphor   ?? addrRaw.amphor   ?? addrRaw.district ?? "-";
//     const tumbon   = addrRaw.Tumbon   ?? addrRaw.tumbon   ?? addrRaw.subdistrict ?? "-";

//     // จำนวนสินค้า (products)
//     let productCount = 0;
//     if (Array.isArray(data.products)) productCount = data.products.length;
//     else productCount =
//       data.productsCount ?? data.productCount ?? data.products?.total ?? 0;

//     // สต็อกรวม: ถ้ามีฟิลด์รวมใช้เลย, ถ้าไม่มีก็รวมจาก Sell/products
//     let stock = data.totalStock ?? data.Stock ?? data.stock ?? 0;
//     if (!stock && Array.isArray(data.Sell)) {
//       stock = data.Sell.reduce((sum, s) => sum + (s.Stock ?? s.stock ?? 0), 0);
//     }
//     if (!stock && Array.isArray(data.products)) {
//       stock = data.products.reduce((sum, p) => sum + (p.stock ?? p.qty ?? 0), 0);
//     }

//     return { shopName, shopPhone, province, amphor, tumbon, stock, image, productCount };
//   }, [data]);

//   // === 4) UI ===
//   return (
//     <Box sx={{ maxWidth: 720, mx: "auto", p: 2 }}>
//       <Card sx={{ display: "flex", p: 2 }}>
//         {/* ซ้าย: รูปภาพร้าน (ถ้ามี) */}
//         {loading ? (
//           <Skeleton variant="rectangular" width={120} height={120} sx={{ borderRadius: 1 }} />
//         ) : view?.image ? (
//           <CardMedia
//             component="img"
//             image={view.image}
//             alt={view.shopName}
//             sx={{ width: 120, height: 120, objectFit: "cover", borderRadius: 1 }}
//           />
//         ) : (
//           <Box sx={{ width: 120, height: 120, borderRadius: 1, bgcolor: "action.hover" }} />
//         )}

//         {/* ขวา: ข้อมูลร้าน */}
//         <CardContent sx={{ flex: 1 }}>
//           {/* ชื่อร้าน */}
//           {loading ? (
//             <Skeleton width={240} height={32} />
//           ) : (
//             <Typography variant="h6" fontWeight={700}>{view.shopName}</Typography>
//           )}

//           {/* เบอร์โทร */}
//           <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
//             <Typography variant="body2" color="text.secondary">Phone:</Typography>
//             {loading ? <Skeleton width={120} /> : <Typography variant="body2">{view.shopPhone}</Typography>}
//           </Stack>

//           {/* ที่อยู่ */}
//           <Stack direction="row" spacing={1}>
//             <Typography variant="body2" color="text.secondary">Address:</Typography>
//             {loading ? (
//               <Skeleton width={260} />
//             ) : (
//               <Typography variant="body2">
//                 {view.tumbon}, {view.amphor}, {view.province}
//               </Typography>
//             )}
//           </Stack>

//           <Divider sx={{ my: 1 }} />

//           {/* Products / Stock */}
//           <Stack direction="row" spacing={3}>
//             <Stack direction="row" spacing={1}>
//               <Typography variant="body2" color="text.secondary">Products:</Typography>
//               {loading ? <Skeleton width={40} /> : <Typography variant="body2" fontWeight={700}>{view.productCount ?? 0}</Typography>}
//             </Stack>
//             <Stack direction="row" spacing={1}>
//               <Typography variant="body2" color="text.secondary">Stock:</Typography>
//               {loading ? <Skeleton width={40} /> : <Typography variant="body2" fontWeight={700}>{view.stock ?? 0}</Typography>}
//             </Stack>
//           </Stack>
//         </CardContent>
//       </Card>

//       {/* แสดง error ถ้ามี */}
//       {error && (
//         <Typography color="error" sx={{ mt: 1 }}>
//           โหลดข้อมูลไม่สำเร็จ: {String(error.message || error)}
//         </Typography>
//       )}
//     </Box>
//   );
// }
