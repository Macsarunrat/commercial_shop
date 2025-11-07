// // src/categorylayout/AllCategories.jsx
// import * as React from "react";
// import {
//   Box,
//   Card,
//   CardActionArea,
//   CardContent,
//   CardMedia,
//   IconButton,
//   Typography,
// } from "@mui/material";
// import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
// import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
// import AppTheme from "../theme/AppTheme";
// import { Link } from "react-router-dom";

// // -------------- Icon mapping (local) --------------
// const objectall = [
//   { id: 16, name: "cloths", img: cloth },
//   { id: 2, name: "pants", img: pant },
//   { id: 8, name: "shoes", img: shoe },
//   { id: 12, name: "jewery", img: jewery },
//   { id: 11, name: "sport", img: sport },
//   { id: 18, name: "phone", img: phone },
//   { id: 17, name: "tv", img: tv },
//   { id: 13, name: "cosmetics", img: cosmetics },
//   { id: 7, name: "skin care products", img: bodylotion },
//   { id: 1, name: "bag", img: bag },
//   { id: 6, name: "clock", img: clock },
//   { id: 5, name: "computer&laptop", img: laptop },
//   { id: 14, name: "electrical", img: electrical },
//   { id: 15, name: "furniture", img: furniture },
//   { id: 4, name: "kitchen", img: kitchen },
//   { id: 3, name: "toys&games", img: toy },
//   { id: 9, name: "bookBooks&stationery", img: book },
//   { id: 10, name: "foods&drinks", img: food },
// ];
// const iconMap = new Map(objectall.map((o) => [String(o.id), o]));

// // -------------- API config --------------
// const API = "https://unsparingly-proextension-jacque.ngrok-free.dev";
// const HDRS = { "ngrok-skip-browser-warning": "true" };

// // -------------- Page --------------
// export default function AllCategories() {
//   const ref = React.useRef(null);
//   const [canLeft, setCanLeft] = React.useState(false);
//   const [canRight, setCanRight] = React.useState(true);
//   const [items, setItems] = React.useState([]);

//   // fetch categories (ทั้งหมดจาก /category)
//   const hdlFetch = React.useCallback(async (signal) => {
//     try {
//       const res = await fetch(`${API}/category`, {
//         method: "GET",
//         headers: HDRS,
//         credentials: "include", // สำคัญ: อยู่นอก headers
//         signal,
//       });
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const data = await res.json();
//       setItems(Array.isArray(data) ? data : []);
//     } catch (error) {
//       console.log(error);
//       setItems([]);
//     }
//   }, []);

//   // โหลดครั้งแรก + ผูก event รีเฟรช + รีเฟรชตอนโฟกัสกลับมา
//   React.useEffect(() => {
//     const ac = new AbortController();
//     hdlFetch(ac.signal);

//     const onRefresh = () => hdlFetch(); // broadcast จากหน้าสร้างหมวด
//     const onFocus = () => hdlFetch();

//     window.addEventListener("categories:refresh", onRefresh);
//     window.addEventListener("focus", onFocus);
//     const onVisibility = () => {
//       if (document.visibilityState === "visible") hdlFetch();
//     };
//     document.addEventListener("visibilitychange", onVisibility);

//     return () => {
//       ac.abort();
//       window.removeEventListener("categories:refresh", onRefresh);
//       window.removeEventListener("focus", onFocus);
//       document.removeEventListener("visibilitychange", onVisibility);
//     };
//   }, [hdlFetch]);

//   // ลูกศรซ้าย/ขวา
//   const updateArrows = React.useCallback(() => {
//     const el = ref.current;
//     if (!el) return;
//     const hasOverflow = el.scrollWidth > el.clientWidth + 1;
//     setCanLeft(hasOverflow && el.scrollLeft > 0);
//     setCanRight(
//       hasOverflow && el.scrollLeft + el.clientWidth < el.scrollWidth - 1
//     );
//   }, []);

//   React.useEffect(() => {
//     updateArrows();
//     const el = ref.current;
//     if (!el) return;
//     const onScroll = () => updateArrows();
//     el.addEventListener("scroll", onScroll, { passive: true });
//     return () => el.removeEventListener("scroll", onScroll);
//   }, [updateArrows]);

//   React.useEffect(() => {
//     const id = requestAnimationFrame(updateArrows);
//     return () => cancelAnimationFrame(id);
//   }, [items, updateArrows]);

//   React.useEffect(() => {
//     const ro = new ResizeObserver(() => updateArrows());
//     if (ref.current) ro.observe(ref.current);
//     const onWinResize = () => updateArrows();
//     window.addEventListener("resize", onWinResize);
//     return () => {
//       ro.disconnect();
//       window.removeEventListener("resize", onWinResize);
//     };
//   }, [updateArrows]);

//   const scrollBy = (dir = 1) => {
//     const el = ref.current;
//     if (!el) return;
//     const amount = Math.round(el.clientWidth * 0.8) * dir;
//     el.scrollBy({ left: amount, behavior: "smooth" });
//     requestAnimationFrame(() => requestAnimationFrame(updateArrows));
//   };

//   return (
//     <AppTheme>
//       <Box sx={{ position: "relative" }}>
//         {/* ปุ่มซ้าย/ขวา */}
//         <IconButton
//           onClick={() => scrollBy(-1)}
//           disabled={!canLeft}
//           sx={{
//             position: "absolute",
//             left: -8,
//             top: "50%",
//             transform: "translateY(-50%)",
//             bgcolor: "background.paper",
//             boxShadow: 1,
//             zIndex: 1,
//             "&:disabled": { opacity: 0.35 },
//           }}
//         >
//           <ArrowBackIosNewIcon fontSize="small" />
//         </IconButton>

//         <IconButton
//           onClick={() => scrollBy(1)}
//           disabled={!canRight}
//           sx={{
//             position: "absolute",
//             right: -8,
//             top: "50%",
//             transform: "translateY(-50%)",
//             bgcolor: "background.paper",
//             boxShadow: 1,
//             zIndex: 1,
//             "&:disabled": { opacity: 0.35 },
//           }}
//         >
//           <ArrowForwardIosIcon fontSize="small" />
//         </IconButton>

//         {/* แทร็ก 2 แถวแนวนอน */}
//         <Box
//           ref={ref}
//           sx={{
//             overflowX: "hidden", // ถูกต้อง (แทน "none")
//             overflowY: "hidden",
//             overscrollBehaviorX: "none",
//             display: "grid",
//             gridAutoFlow: "column",
//             gridTemplateRows: "repeat(2, 1fr)",
//             gridAutoColumns: { xs: "130px", sm: "150px", md: "194.5px" },
//             justifyContent: "start",
//             scrollbarWidth: "none",
//             "&::-webkit-scrollbar": { display: "none" },
//           }}
//         >
//           {items.map((it) => (
//             <CategoryCard key={it.Category_ID} items={it} />
//           ))}
//         </Box>
//       </Box>
//     </AppTheme>
//   );
// }

// // ===== การ์ด 1 ใบต่อ 1 category =====
// function CategoryCard({ items }) {
//   // หาไอคอน ถ้าไม่เจอ ใช้ fallback (bag)
//   const icon = iconMap.get(String(items.Category_ID));
//   const imgSrc = icon?.img ?? bag;
//   const alt = icon?.name ?? items.Category_Name;

//   return (
//     <Box>
//       <Card
//         variant="outlined"
//         sx={{
//           width: "100%",
//           height: "100%",
//           borderRadius: 0,
//           boxShadow: "none",
//           display: "flex",
//           flexDirection: "column",
//         }}
//       >
//         <CardActionArea
//           component={Link}
//           to={`/categoryitems/${items.Category_ID}`}
//           state={{ name: items.Category_Name }} // ส่งชื่อจริงไปด้วย
//           sx={{ height: "100%" }}
//         >
//           <Box
//             sx={{
//               width: 120,
//               height: 120,
//               mx: "auto",
//               borderRadius: "50%",
//               bgcolor: "grey.100",
//               display: "grid",
//               placeItems: "center",
//               mt: 2,
//             }}
//           >
//             <CardMedia
//               component="img"
//               src={imgSrc}
//               alt={alt}
//               sx={{ width: 120, height: 120, objectFit: "contain" }}
//             />
//           </Box>
//           <CardContent>
//             <Typography
//               variant="body2"
//               align="center"
//               sx={{
//                 mt: 1,
//                 lineHeight: 1.2,
//                 minHeight: 36,
//                 maxHeight: 36,
//                 fontSize: 16,
//                 overflow: "hidden",
//               }}
//               title={items.Category_Name}
//             >
//               {items.Category_Name}
//             </Typography>
//           </CardContent>
//         </CardActionArea>
//       </Card>
//     </Box>
//   );
// }

// src/categorylayout/AllCategories.jsx
import * as React from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  IconButton,
  Typography,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import AppTheme from "../theme/AppTheme";
import { Link } from "react-router-dom";

const API = "https://ritzily-nebule-clark.ngrok-free.dev";
const HDRS = { "ngrok-skip-browser-warning": "true" };

// เผื่อแอปถูกโฮสต์ใต้ subpath ตอน deploy
const BASE = import.meta.env.BASE_URL || "/";
// helper สร้างพาธรูปจาก public/
const img = (file) => `${BASE}Gemini/${file}`;

// แม็ป category id -> ไฟล์รูปใน public/Gemini
const objectall = [
  { id: 16, name: "cloths", file: "clothG.png" },
  { id: 2, name: "pants", file: "pantG.png" },
  { id: 8, name: "shoes", file: "shoeG.png" },
  { id: 12, name: "jewery", file: "jeweryG.png" },
  { id: 11, name: "sport", file: "sportG.png" },
  { id: 18, name: "phone", file: "phoneG.png" },
  { id: 17, name: "tv", file: "tvG.png" },
  { id: 13, name: "cosmetics", file: "cosmeticsG.png" },
  { id: 7, name: "skin care products", file: "skincareG.png" },
  { id: 1, name: "bag", file: "bagG.png" },
  { id: 6, name: "clock", file: "clockG.png" },
  { id: 5, name: "computer&laptop", file: "laptopG.png" },
  { id: 14, name: "electrical", file: "electricalG.png" },
  { id: 15, name: "furniture", file: "furnitureG.png" },
  { id: 4, name: "kitchen", file: "kitchenG.png" },
  { id: 3, name: "toys&games", file: "toyG.png" },
  { id: 9, name: "bookBooks&stationery", file: "bookG.png" },
  { id: 10, name: "foods&drinks", file: "foodG.png" },
  { id: 19, name: "food supplement", file: "foodplusG.png" },
  { id: 20, name: "childrentoy", file: "childrenG.png" },
  { id: 21, name: "grocery", file: "marketG.png" },
];

const iconMap = new Map(
  objectall.map((o) => [String(o.id), { ...o, img: img(o.file) }])
);

export default function AllCategories() {
  const ref = React.useRef(null);
  const [canLeft, setCanLeft] = React.useState(false);
  const [canRight, setCanRight] = React.useState(true);
  const [items, setItems] = React.useState([]);

  const hdlFetch = React.useCallback(async (signal) => {
    try {
      const res = await fetch(`${API}/category`, {
        headers: HDRS,
        credentials: "include",
        signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    }
  }, []);

  React.useEffect(() => {
    const ac = new AbortController();
    hdlFetch(ac.signal);
    return () => ac.abort();
  }, [hdlFetch]);

  const updateArrows = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const hasOverflow = el.scrollWidth > el.clientWidth + 1;
    setCanLeft(hasOverflow && el.scrollLeft > 0);
    setCanRight(
      hasOverflow && el.scrollLeft + el.clientWidth < el.scrollWidth - 1
    );
  }, []);

  React.useEffect(() => {
    updateArrows();
    const el = ref.current;
    if (!el) return;
    const onScroll = () => updateArrows();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [updateArrows]);

  React.useEffect(() => {
    const id = requestAnimationFrame(updateArrows);
    return () => cancelAnimationFrame(id);
  }, [items, updateArrows]);

  return (
    <AppTheme>
      <Box sx={{ position: "relative" }}>
        <IconButton
          onClick={() =>
            ref.current?.scrollBy({
              left: -Math.round(ref.current.clientWidth * 0.8),
              behavior: "smooth",
            })
          }
          disabled={!canLeft}
          sx={{
            position: "absolute",
            left: -8,
            top: "50%",
            transform: "translateY(-50%)",
            bgcolor: "background.paper",
            boxShadow: 1,
            zIndex: 1,
            "&:disabled": { opacity: 0.35 },
          }}
        >
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>

        <IconButton
          onClick={() =>
            ref.current?.scrollBy({
              left: Math.round(ref.current.clientWidth * 0.8),
              behavior: "smooth",
            })
          }
          disabled={!canRight}
          sx={{
            position: "absolute",
            right: -8,
            top: "50%",
            transform: "translateY(-50%)",
            bgcolor: "background.paper",
            boxShadow: 1,
            zIndex: 1,
            "&:disabled": { opacity: 0.35 },
          }}
        >
          <ArrowForwardIosIcon fontSize="small" />
        </IconButton>

        <Box
          ref={ref}
          sx={{
            overflowX: "hidden",
            overflowY: "hidden",
            overscrollBehaviorX: "none",
            display: "grid",
            gridAutoFlow: "column",
            gridTemplateRows: "repeat(2, 1fr)",
            gridAutoColumns: { xs: "130px", sm: "150px", md: "194.5px" },
            justifyContent: "start",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {items.map((it) => (
            <CategoryCard key={it.Category_ID} items={it} />
          ))}
        </Box>
      </Box>
    </AppTheme>
  );
}

/* ===== การ์ด 1 ใบต่อ 1 category (มี fallback ตัวอักษรแรก) ===== */
function CategoryCard({ items }) {
  const label = (items?.Category_Name ?? "").trim();
  const first = label ? label[0].toUpperCase() : "?";

  const icon = iconMap.get(String(items.Category_ID));
  const srcFromMap = icon?.img ?? `${BASE}Gemini/bagG.png`; // พยายามใช้รูปก่อน
  const [imgOk, setImgOk] = React.useState(Boolean(icon?.img)); // ถ้าไม่มี mapping ให้เริ่มเป็น false

  return (
    <Box>
      <Card
        variant="outlined"
        sx={{
          width: "100%",
          height: "100%",
          borderRadius: 0,
          boxShadow: "none",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardActionArea
          component={Link}
          to={`/categoryitems/${items.Category_ID}`}
          state={{ name: label }}
          sx={{ height: "100%" }}
        >
          {/* วงกลมไอคอน */}
          <Box
            sx={{
              width: 120,
              height: 120,
              mx: "auto",
              mt: 2,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              bgcolor: "#f5f5f5",
              color: "black",
            }}
          >
            {imgOk ? (
              <CardMedia
                component="img"
                src={srcFromMap}
                alt={label || "category"}
                sx={{ width: 120, height: 120, objectFit: "contain" }}
                onError={() => setImgOk(false)} // ถ้ารูปพัง → สลับเป็นตัวอักษร
              />
            ) : (
              <Typography
                sx={{ fontWeight: 800, fontSize: 40, lineHeight: 1 }}
                aria-label={label}
              >
                {first}
              </Typography>
            )}
          </Box>

          <CardContent>
            <Typography
              variant="body2"
              align="center"
              sx={{
                mt: 1,
                lineHeight: 1.2,
                minHeight: 36,
                maxHeight: 36,
                fontSize: 16,
                overflow: "hidden",
              }}
              title={label}
            >
              {label}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Box>
  );
}
