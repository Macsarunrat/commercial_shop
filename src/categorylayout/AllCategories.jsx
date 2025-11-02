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

// Img import //
import bag from "../img/Gemini/bagG.png";
import bodylotion from "../img/Gemini/skincareG.png";
import book from "../img/Gemini/bookG.png";
import clock from "../img/Gemini/clockG.png";
import cloth from "../img/Gemini/blackG.png";
import cosmetics from "../img/Gemini/cosmeticsG.png";
import electrical from "../img/Gemini/electricalG.png";
import food from "../img/Gemini/foodG.png";
import furniture from "../img/Gemini/furnitureG.png";
import jewery from "../img/Gemini/jeweryG.png";
import kitchen from "../img/Gemini/kitchenG.png";
import laptop from "../img/Gemini/laptopG.png";
import pant from "../img/Gemini/pantG.png";
import phone from "../img/Gemini/phoneG.png";
import shoe from "../img/Gemini/shoeG.png";
import sport from "../img/Gemini/sportG.png";
import toy from "../img/Gemini/toyG.png";
import tv from "../img/Gemini/tvG.png";
// img import //
const DEMO = Array.from({ length: 24 }).map((_, i) => ({
  id: i + 1,
  name: `Category ${i + 1}`,
  image: "/placeholder.png",
}));

const objectall = [
  { id: 1, name: "cloths", img: cloth },
  { id: 2, name: "pants", img: pant },
  { id: 3, name: "shoes", img: shoe },
  { id: 4, name: "jewery", img: jewery },
  { id: 5, name: "sport", img: sport },
  { id: 6, name: "phone", img: phone },
  { id: 7, name: "tv", img: tv },
  { id: 8, name: "cosmetics", img: cosmetics },
  { id: 9, name: "skin care products", img: bodylotion },
  { id: 10, name: "bag", img: bag },
  { id: 11, name: "clock", img: clock },
  { id: 12, name: "computer&laptop", img: laptop },
  { id: 13, name: "electrical", img: electrical },
  { id: 14, name: "furniture", img: furniture },
  { id: 15, name: "kitchen", img: kitchen },
  { id: 16, name: "toys&games", img: toy },
  { id: 17, name: "bookBooks&stationery", img: book },
  { id: 18, name: "foods&drinks", img: food },
];

function CategoryCard({ c }) {
  return (
    <Card
      variant="outlined"
      sx={{
        width: "100%",
        boxSizing: "border-box",
        height: "100%",
        borderRadius: 0,
        boxShadow: "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardActionArea onClick={() => console.log("clicked:", c)}>
        <Box
          sx={{
            width: 120,
            height: 120,
            mx: "auto",
            mt: 1.5,
            borderRadius: "50%",
            bgcolor: "grey.100",
            display: "grid",
            placeItems: "center",
          }}
        >
          <CardMedia
            component="img"
            src={c.img}
            alt={c.name}
            sx={{ width: 100, height: 100, objectFit: "contain" }}
          />
        </Box>
        <CardContent>
          <Typography
            variant="body2"
            align="center"
            sx={{
              mt: 1,
              lineHeight: 1,
              minHeight: 36,
              maxHeight: 36,
              fontSize: 16,
            }}
          >
            {c.name}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default function AllCategories({ items = objectall }) {
  const ref = React.useRef(null);
  const [canLeft, setCanLeft] = React.useState(false);
  const [canRight, setCanRight] = React.useState(true);

  const updateArrows = () => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 0);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  React.useEffect(() => {
    updateArrows();
    const el = ref.current;
    if (!el) return;
    const onScroll = () => updateArrows();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const scrollBy = (dir = 1) => {
    const el = ref.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.8) * dir;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <Box sx={{ position: "relative" }}>
      {/* ปุ่มซ้าย/ขวา วางทับขอบ */}
      <IconButton
        onClick={() => scrollBy(-1)}
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
        onClick={() => scrollBy(1)}
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

      {/* แทร็ก 2 แถวแนวนอน – ไม่มีสกรอลบาร์ และไม่มี padding/margin */}
      <Box
        ref={ref}
        sx={{
          overflowX: "hidden", // ⬅️ ซ่อนและ “ปิด” การสกรอลด้วยเมาส์/ทัช
          overflowY: "hidden",
          display: "grid",
          gridAutoFlow: "column",
          gridTemplateRows: "repeat(2, 1fr)",
          gridAutoColumns: { xs: "130px", sm: "150px", md: "191px" },
          justifyContent: "start",
          gap: 0,
          alignItems: "stretch",
        }}
      >
        {items.map((c) => (
          <CategoryCard key={c.id} c={c} />
        ))}
      </Box>
    </Box>
  );
}
