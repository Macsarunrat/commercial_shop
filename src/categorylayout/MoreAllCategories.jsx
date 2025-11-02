// src/categorylayout/AllCategories.jsx
import * as React from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import Banner from "../nav/component/Bannner";
import AppTheme from "../theme/AppTheme";

const DEMO = Array.from({ length: 24 }).map((_, i) => ({
  id: i + 1,
  name: `Category ${i + 1}`,
  image: "/placeholder.png",
}));

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
    <AppTheme>
      <Card
        variant="outlined"
        sx={{
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
              mt: 2,
              mx: "auto",
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
          <CardContent sx={{ px: 1, pb: 1.5 }}>
            <Typography
              variant="body2"
              align="center"
              sx={{
                mt: 1,
                lineHeight: 1.25,
                minHeight: 36,
                maxHeight: 36,

                overflow: "hidden",
                fontSize: 16,
              }}
            >
              {c.name}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </AppTheme>
  );
}

export default function AllCategories({ items = objectall }) {
  // แสดงเป็นกริด 5 คอลัมน์ ไม่มีปุ่ม/ไม่มีสกรอล
  return (
    <>
      <Banner />
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 1.5, sm: 2, md: 3 },
          mb: 5,
          mt: 5,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))", // ⬅️ แถวละ 5 การ์ด
            mt: 2,
            overflow: "hidden", // กันแถบสกรอล
          }}
        >
          {items.map((c) => (
            <Box key={c.id}>
              <CategoryCard c={c} />
            </Box>
          ))}
        </Box>
      </Box>
    </>
  );
}
