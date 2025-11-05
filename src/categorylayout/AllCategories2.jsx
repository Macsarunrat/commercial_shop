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
import { useRef, useState, useEffect } from "react";
import { useMemo } from "react";
import { useCallback } from "react";
import axios from "axios";
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
import { Filter } from "@mui/icons-material";
// img import //
const objectall = [
  { id: 16, name: "cloths", img: cloth },
  { id: 2, name: "pants", img: pant },
  { id: 8, name: "shoes", img: shoe },
  { id: 12, name: "jewery", img: jewery },
  { id: 11, name: "sport", img: sport },
  { id: 18, name: "phone", img: phone },
  { id: 17, name: "tv", img: tv },
  { id: 13, name: "cosmetics", img: cosmetics },
  { id: 7, name: "skin care products", img: bodylotion },
  { id: 1, name: "bag", img: bag },
  { id: 6, name: "clock", img: clock },
  { id: 5, name: "computer&laptop", img: laptop },
  { id: 14, name: "electrical", img: electrical },
  { id: 15, name: "furniture", img: furniture },
  { id: 4, name: "kitchen", img: kitchen },
  { id: 3, name: "toys&games", img: toy },
  { id: 9, name: "bookBooks&stationery", img: book },
  { id: 10, name: "foods&drinks", img: food },
];

// const api = axios.create({
//   baseURL: "https://great-lobster-rightly.ngrok-free.app",
//   timeout: 15000,
//   headers: {
//     Accept: "application/json",
//     "X-Requested-With": "XMLHttpRequest",
//   },
//   // withCredentials: true, // ถ้าต้องส่งคุกกี้
// });

export default function AllCategories() {
  const ref = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    hdlFetch();
  }, []);

  const hdlFetch = async () => {
    try {
      const res = await fetch(
        "https://great-lobster-rightly.ngrok-free.app/category/",
        {
          method: "GET",
          headers: {
            "ngrok-skip-browser-warning": "true",
            credentials: "include",
          },
        }
      );
      const data = await res.json();
      console.log(data);
      setItems(data);
    } catch (error) {
      console.log(error);
      setItems([]);
    }
  };

  const updateArrows = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const hasOverflow = el.scrollWidth > el.clientWidth + 1;
    setCanLeft(hasOverflow && el.scrollLeft > 0);
    setCanRight(
      hasOverflow && el.scrollLeft + el.clientWidth < el.scrollWidth - 1
    );
  }, []);

  // เรียกครั้งแรก + ผูก scroll
  React.useEffect(() => {
    updateArrows();
    const el = ref.current;
    if (!el) return;
    const onScroll = () => updateArrows();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [updateArrows]);

  // วัดใหม่ทุกครั้งที่ items เปลี่ยน (หลังดึงข้อมูลสำเร็จ)
  React.useEffect(() => {
    // รอให้ layout เสร็จ (โดยเฉพาะรูป)
    const id = requestAnimationFrame(updateArrows);
    return () => cancelAnimationFrame(id);
  }, [items, updateArrows]);

  // วัดใหม่เมื่อหน้าจอเปลี่ยนขนาด
  React.useEffect(() => {
    const ro = new ResizeObserver(() => updateArrows());
    if (ref.current) ro.observe(ref.current);
    const onWinResize = () => updateArrows();
    window.addEventListener("resize", onWinResize);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onWinResize);
    };
  }, [updateArrows]);

  const scrollBy = (dir = 1) => {
    const el = ref.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.8) * dir;
    el.scrollBy({ left: amount, behavior: "smooth" });
    // อัปเดตสถานะปุ่มหลังเลื่อน
    // ใช้ rAF 2 เฟรมเพื่อให้ scroll ตอบสนองก่อน
    requestAnimationFrame(() => requestAnimationFrame(updateArrows));
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
            overflowX: "none", // ซ่อนและ "ปิด" การสกรอลด้วยผู้ใช้
            overflowY: "hidden",
            overscrollBehaviorX: "none", // กัน scroll-chain ไปพาเรนต์
            display: "grid",
            gridAutoFlow: "column",
            gridTemplateRows: "repeat(2, 1fr)",
            gridAutoColumns: { xs: "130px", sm: "150px", md: "194.5px" },
            justifyContent: "start",

            scrollbarWidth: "none", // ซ่อนสกรอลบาร์ (Firefox)
            "&::-webkit-scrollbar": { display: "none" }, // ซ่อน (WebKit)
          }}
        >
          {items.map((items) => (
            <CategoryCard key={items.Category_ID} items={items} />
          ))}
        </Box>
      </Box>
    </AppTheme>
  );
}

// ===== แยกการ์ด 1 ใบต่อ 1 category =====
function CategoryCard({ items }) {
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
        {objectall
          .filter((ob) => String(ob.id) === String(items.Category_ID))
          .map((ob) => (
            <Box key={ob.id}>
              <CardActionArea
                component={Link}
                to={`/categoryitems/${items.Category_ID}`} // ← ส่ง id ใน URL
                state={{ name: items.Category_ID }} // ← ส่งชื่อไปด้วย (optional
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
                    key={ob.id}
                    component="img"
                    src={ob.img}
                    alt={ob.name}
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
                    title={items.Category_Name}
                  >
                    {items.Category_Name}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Box>
          ))}
      </Card>
    </Box>
  );
}
