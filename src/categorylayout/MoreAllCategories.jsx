// src/categorylayout/MoreAllCategories.jsx
import * as React from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import AppTheme from "../theme/AppTheme";

/* ---------------- Public images helper ----------------
   วางรูปไว้ที่ public/Gemini/*
   เรียกใช้งานด้วย path ตรง /Gemini/<filename>
------------------------------------------------------- */
const pubImg = (file) => `/Gemini/${file}`;

/* -------- แม็ป Category_ID -> รูปใน public/Gemini -------- */
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

// แปลงให้มี src พร้อมใช้งาน
const iconMap = new Map(
  objectall.map((o) => [String(o.id), { ...o, src: pubImg(o.file) }])
);

// ---------------- API config ----------------
const API = "https://ritzily-nebule-clark.ngrok-free.dev";
const HDRS = { "ngrok-skip-browser-warning": "true" };

/* -------------- Reusable Card -------------- */
function CategoryCard({ c }) {
  const id = c?.Category_ID ?? c?.id;
  const label = (c?.Category_Name ?? c?.name ?? "").trim();
  const icon = iconMap.get(String(id));

  // src รูปจาก public/Gemini ถ้ามี mapping
  const fallback = pubImg("bagG.png");
  const hasImage = Boolean(icon?.src);
  const [imgOk, setImgOk] = React.useState(hasImage);

  // ตัวอักษรแรก (รองรับไทย/อังกฤษ)
  const first = label ? label[0].toUpperCase() : "?";

  return (
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
      <CardActionArea
        component={Link}
        to={`/categoryitems/${id}`}
        state={{ name: label }}
        sx={{ height: "100%" }}
      >
        {/* วงกลมไอคอน */}
        <Box
          sx={{
            width: 120,
            height: 120,
            mt: 2,
            mx: "auto",
            borderRadius: "50%",
            bgcolor: "#f5f5f5",
            color: "black",
            display: "grid",
            placeItems: "center",
          }}
        >
          {imgOk ? (
            <CardMedia
              component="img"
              src={icon?.src ?? fallback}
              alt={label || "category"}
              sx={{ width: 100, height: 100, objectFit: "contain" }}
              onError={() => setImgOk(false)} // ถ้ารูปพัง -> สลับไปใช้ตัวอักษร
            />
          ) : (
            // ตัวอักษรแรกของชื่อหมวด (เช่น “ของเด็ก” => “ข”, “Adidas” => “A”)
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: 40,
                lineHeight: 1,
              }}
              aria-label={label}
            >
              {first}
            </Typography>
          )}
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
            title={label}
          >
            {label}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

/* -------------- Page -------------- */
export default function MoreAllCategories() {
  const [items, setItems] = React.useState([]);
  const [error, setError] = React.useState("");

  const fetchCategories = React.useCallback(async (signal) => {
    setError("");
    try {
      const res = await fetch(`${API}/category/`, {
        method: "GET",
        headers: HDRS,
        credentials: "include",
        signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      if (e.name !== "AbortError") {
        console.error(e);
        setError("โหลดหมวดหมู่ไม่สำเร็จ");
        setItems([]);
      }
    }
  }, []);

  React.useEffect(() => {
    const ac = new AbortController();
    fetchCategories(ac.signal);
    return () => ac.abort();
  }, [fetchCategories]);

  return (
    <AppTheme>
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 1.5, sm: 2, md: 3 },
          mb: 5,
          mt: 5,
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          More Categories
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              sm: "repeat(3, minmax(0, 1fr))",
              md: "repeat(5, minmax(0, 1fr))",
              lg: "repeat(6, minmax(0, 1fr))",
            },
            gap: 0,
            mt: 2,
            overflow: "hidden",
          }}
        >
          {(items.length ? items : []).map((c) => (
            <Box key={c?.Category_ID ?? c?.id ?? Math.random()}>
              <CategoryCard c={c} />
            </Box>
          ))}
        </Box>

        {!!error && (
          <Typography
            variant="body2"
            color="error"
            sx={{ mt: 2, textAlign: "center" }}
          >
            {error}
          </Typography>
        )}
      </Box>
    </AppTheme>
  );
}
