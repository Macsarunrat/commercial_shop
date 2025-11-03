// // CategoryHome.jsx
// import * as React from "react";
// import {
//   Box,
//   Typography,
//   Card,
//   CardActionArea,
//   CardMedia,
//   CardContent,
//   Grid,
// } from "@mui/material";
// import AppTheme from "../theme/AppTheme";

// const CATEGORIES = Array.from({ length: 24 }).map((_, i) => ({
//   id: i + 1,
//   name: `Category ${i + 1}`,
//   image: "/placeholder.png",
// }));

// export default function CategoryById() {
//   // เอาแค่ 2 แถว × 10 = 20 ชิ้น
//   const list = CATEGORIES.slice(0, 20);

//   return (
//     <AppTheme>
//       <Box
//         sx={{
//           borderRadius: 1,
//           display: "flex",
//         }}
//       >
//         {/* แถวละ 10: ตั้ง columns=10 และ item xs=1 */}
//         <Grid
//           container
//           spacing={2}
//           columns={{ xs: 2, md: 5 }}
//           sx={{ justifyContent: "center" }}
//         >
//           {list.map((c) => (
//             <Grid key={c.id} item xs={1}>
//               <Card
//                 variant="outlined"
//                 sx={{
//                   height: "100%",
//                   display: "flex",
//                   flexDirection: "column",
//                   borderRadius: 1,
//                   boxShadow: "none",
//                   borderColor: "divider",
//                 }}
//               >
//                 <CardActionArea onClick={() => console.log("clicked", c)}>
//                   {/* ขยายรูปให้ใหญ่ขึ้น */}
//                   <CardMedia
//                     component="img"
//                     image={c.image}
//                     alt={c.name}
//                     sx={{
//                       width: 200, // ↑ ใหญ่ขึ้น
//                       height: 200, // ↑ ใหญ่ขึ้น
//                       // ถ้าอยากเหลี่ยมใส่ 0
//                       mx: "auto",
//                       bgcolor: "grey.100",
//                     }}
//                   />
//                   <CardContent sx={{ px: 1, py: 1.25 }}>
//                     <Typography
//                       variant="body2"
//                       align="center"
//                       noWrap
//                       sx={{ fontSize: 14, height: 80 }}
//                     >
//                       {c.name}
//                     </Typography>
//                   </CardContent>
//                 </CardActionArea>
//               </Card>
//             </Grid>
//           ))}
//         </Grid>
//       </Box>
//     </AppTheme>
//   );
// }

// src/categorylayout/CategoryById.jsx
// src/categorylayout/CategoryById.jsx
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

export default function CategoryById({ categoryId, brand, sortKey }) {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("http://localhost:3000/products", {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        let data = await res.json();
        if (!Array.isArray(data)) data = [];

        // กรองตาม category / brand
        const cid = Number(categoryId);
        data = data.filter((p) => {
          const okCat = Number.isFinite(cid)
            ? Number(p.categoryId ?? p.category_id) === cid
            : true;
          const okBrand = brand
            ? String(p.brand || "").toLowerCase() === brand.toLowerCase()
            : true;
          return okCat && okBrand;
        });

        // เรียงราคา
        if (sortKey) {
          data.sort((a, b) => {
            const pa = Number(a.price ?? 0);
            const pb = Number(b.price ?? 0);
            if (sortKey === "priceAsc") return pa - pb;
            if (sortKey === "priceDesc") return pb - pa;
            return 0;
          });
        }

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
  }, [categoryId, brand, sortKey]);

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
        const imgSrc =
          p.image ||
          p.thumbnail ||
          "https://via.placeholder.com/300x300?text=No+Image";

        return (
          <Card
            key={p.id}
            variant="outlined"
            sx={{
              borderRadius: 0,
              overflow: "hidden",

              "&:hover": {
                transform: "scale(1.01)",
              },
            }}
          >
            <CardActionArea
              sx={{ position: "relative", display: "block" }}
              component={Link}
              to={`/mainshop/${p.categoryId}`} // ← ส่ง id ใน URL
              state={{ productId: p.id }}
            >
              <CardMedia
                component="img"
                src={imgSrc}
                alt={p.name}
                sx={{ height: 180, objectFit: "cover" }}
                loading="lazy"
              />

              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="subtitle2" noWrap title={p.name}>
                  {p.name}
                </Typography>
                {p.price != null && (
                  <Typography variant="body2" color="text.secondary">
                    {p.price}
                  </Typography>
                )}
              </CardContent>

              {/* เงาล่างช่วยให้อ่านตัวหนังสือชัดตอน hover */}
              <Box
                className="bottomShade"
                sx={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: 56,
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.06) 55%, rgba(0,0,0,.2) 100%)",
                  opacity: 0,
                  pointerEvents: "none",
                }}
              />
            </CardActionArea>
          </Card>
        );
      })}
    </Box>
  );
}
