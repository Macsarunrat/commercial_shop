// src/home/NewProductHome.jsx
import * as React from "react";
import {
  Box,
  Stack,
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActionArea,
  IconButton,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Link } from "react-router-dom";

/* ---------- API ---------- */
const API_BASE = "https://ritzily-nebule-clark.ngrok-free.dev";
const PRODUCTS_URL = `${API_BASE}/products`;
const IMAGES_URL = `${API_BASE}/image`;
const HDRS = {
  Accept: "application/json",
  "ngrok-skip-browser-warning": "true",
};
const DEFAULT_IMG = "/IMG1/bagG.png";

/* ---------- utils ---------- */
function toAbsUrl(p, base = API_BASE) {
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) return p;
  return p.startsWith("/") ? `${base}${p}` : `${base}/${p}`;
}

export default function NewProductHome({ limit, showSeeAllText = false }) {
  const [items, setItems] = React.useState([]);
  const [imageIndex, setImageIndex] = React.useState({}); // { [productId]: imageUrl }
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // ดึง products และ images พร้อมกัน
        const [resProducts, resImages] = await Promise.all([
          fetch(PRODUCTS_URL, { headers: HDRS, signal: ac.signal }),
          fetch(IMAGES_URL, { headers: HDRS, signal: ac.signal }),
        ]);

        if (!resProducts.ok)
          throw new Error(`Products HTTP ${resProducts.status}`);
        if (!resImages.ok) throw new Error(`Images HTTP ${resImages.status}`);

        const prodJson = await resProducts.json();
        const imgJson = await resImages.json();

        const products = Array.isArray(prodJson)
          ? prodJson
          : prodJson?.data || [];
        const imagesArr = Array.isArray(imgJson)
          ? imgJson
          : imgJson?.items || [];

        // ทำดัชนีรูปตาม Product_ID (เอา “รูปแรกที่พบ” ของแต่ละ product)
        const idx = {};
        for (const im of imagesArr) {
          const pid = String(im.Product_ID ?? im.product_id ?? "");
          const url = toAbsUrl(im.Img_Src ?? im.img_src, API_BASE);
          if (pid && url && !idx[pid]) {
            // cache-buster กันรูปเก่าค้าง
            idx[pid] = `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`;
          }
        }

        setItems(products);
        setImageIndex(idx);
      } catch (e) {
        if (e.name !== "AbortError") setError(e.message || "Fetch error");
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, []);

  const list = limit ? items.slice(0, limit) : items;

  return (
    <Box
      sx={{
        display: "flex-1",
        bgcolor: "white",
        my: 5,
        mx: { xs: 2, sm: 4, lg: 10 },
        borderRadius: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography
          variant="h4"
          sx={{
            color: "#d62828",
            fontFamily: "Prompt",
            fontWeight: 500,
            mx: 2,
            mt: 2,
          }}
        >
          ALL PRODUCT
        </Typography>
        <IconButton component={Link} to={"/allproducts"} aria-label="See all">
          <Typography
            sx={{
              color: "#d62828",
              fontSize: 18,
              mr: 0.5,
              display: showSeeAllText ? "inline" : "none",
            }}
          >
            See All
          </Typography>
          <ArrowForwardIosIcon
            sx={{
              color: "#d62828",
              fontSize: 16,
              display: showSeeAllText ? "inline" : "none",
            }}
          />
        </IconButton>
      </Box>

      {/* Grid */}
      <Stack sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            display: "grid",
            gap: { xs: 2, md: 3 },
            m: { xs: 2 },
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          }}
        >
          {loading &&
            Array.from({ length: limit || 6 }).map((_, i) => (
              <Card key={`s-${i}`} sx={{ height: 300 }} />
            ))}

          {error && (
            <Box
              sx={{
                gridColumn: "1 / -1",
                textAlign: "center",
                p: 2,
                color: "error.main",
              }}
            >
              {error}
            </Box>
          )}

          {!loading &&
            !error &&
            list.map((o, idx) => {
              const pid = o?.Product_ID ?? o?.product_id ?? o?.id ?? null; // master product id
              const title =
                o?.Product_Name || o?.name || o?.Category_Name || "ไม่ระบุชื่อ";

              // 1) ใช้ภาพจาก /image ที่แมปตาม Product_ID ก่อน
              // 2) ถ้าไม่มี ค่อย fallback รูปจากฟิลด์สินค้า
              // 3) สุดท้ายค่อย default
              const imgFromIndex = pid != null ? imageIndex[String(pid)] : null;
              const fallbackFromProduct = toAbsUrl(
                o?.Cover_Image || o?.image || o?.ImageUrl,
                API_BASE
              );
              const img = imgFromIndex || fallbackFromProduct || DEFAULT_IMG;

              const key = pid ?? idx;

              // ลิงก์ไปหน้า detail พร้อม pid (ปรับตาม routes จริงของคุณ)
              const detailHref = `/mainshop/${encodeURIComponent(
                String(pid ?? "")
              )}?pid=${encodeURIComponent(String(pid ?? ""))}`;

              return (
                <CardActionArea
                  key={key}
                  component={Link}
                  to={detailHref}
                  state={{ productId: pid }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* รูปจัตุรัส */}
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "1 / 1",
                        overflow: "hidden",
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={img}
                        alt={title}
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_IMG;
                        }}
                        sx={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </Box>

                    <CardContent
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        px: 2,
                        py: 1.5,
                        minHeight: 64,
                      }}
                    >
                      <Typography variant="h6" noWrap title={title}>
                        {title}
                      </Typography>
                    </CardContent>
                  </Card>
                </CardActionArea>
              );
            })}
        </Box>
      </Stack>
    </Box>
  );
}
