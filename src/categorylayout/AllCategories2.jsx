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

export default function AllCategories() {
  const ref = React.useRef(null);
  const [canLeft, setCanLeft] = React.useState(false);
  const [canRight, setCanRight] = React.useState(true);
  const [items, setItems] = React.useState([]);

  React.useEffect(() => {
    hdlFetch();
  }, []);

  const hdlFetch = async () => {
    try {
      const res = await fetch("http://localhost:3000/categories");
      const data = await res.json();
      setItems(data);
      console.log(data);
      // console.log(data);
    } catch (error) {
      console.error(error);
      setItems([]);
    }
  };

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
    <AppTheme>
      <Box sx={{ position: "relative" }}>
        {/* ปุ่มซ้าย/ขวา */}
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

        {/* แทร็ก 2 แถวแนวนอน */}
        <Box
          ref={ref}
          sx={{
            overflowX: "auto", // ให้สกรอลได้
            overflowY: "hidden",
            display: "grid",
            gridAutoFlow: "column",
            gridTemplateRows: "repeat(2, 1fr)",
            gridAutoColumns: { xs: "130px", sm: "150px", md: "194.5px" },
            justifyContent: "start",

            scrollbarWidth: "", // ซ่อนสกรอลบาร์ (Firefox,Chrome,Edge)
            "&::-webkit-scrollbar": { display: "none" }, // ซ่อน (WebKit)
          }}
        >
          {items.map((items) => (
            <CategoryCard key={items.id} items={items} />
          ))}
        </Box>
      </Box>
    </AppTheme>
  );
}

// ===== แยกการ์ด 1 ใบต่อ 1 category =====
function CategoryCard({ items }) {
  const imgSrc = items.image;

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
          to={`/categoryitems/${items.id}`} // ← ส่ง id ใน URL
          state={{ name: items.name }} // ← ส่งชื่อไปด้วย (optional
          sx={{ height: "100%" }}
        >
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
              src={imgSrc}
              alt={items.name}
              sx={{ width: 100, height: 100, objectFit: "contain" }}
            />
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
              title={items.name}
            >
              {items.name}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Box>
  );
}
