// CategoryHome.jsx
import * as React from "react";
import {
  Box,
  Typography,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  IconButton,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import AppTheme from "../theme/AppTheme";
import AllCategories2 from "../categorylayout/AllCategories2";

export default function CategoryHome() {
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
    const amount = Math.round(el.clientWidth * 0.8) * dir; // เลื่อนที 80% ของความกว้าง
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <AppTheme>
      <Box
        sx={{
          bgcolor: "white",
          my: 4,
          mx: { xs: 2, sm: 4, lg: 10 },
          borderRadius: 1,
          p: 2,
          position: "relative",
        }}
      >
        {/* Header */}
        <Box sx={{ display: "flex", mb: 2 }}>
          <Typography
            variant="h5"
            sx={{ color: "#d62828", fontFamily: "Prompt", fontWeight: 500 }}
          >
            CATEGORIES
          </Typography>
        </Box>

        {/* แท่นเลื่อนแนวนอน: grid 2 แถว, ไหลเป็นคอลัมน์ */}
        <Box sx={{ mx: -2, mb: -2 }}>
          {/* แสดง 2 แถว, เลื่อนซ้าย/ขวาได้*/}
          <AllCategories2 />
        </Box>
      </Box>
    </AppTheme>
  );
}
