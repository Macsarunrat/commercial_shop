import * as React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import {
  Stack,
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActionArea,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Navigate, Link } from "react-router-dom";

const API_URL = "https://great-lobster-rightly.ngrok-free.app/products";
const HDRS = {
  Accept: "application/json",
  "ngrok-skip-browser-warning": "true",
};

export default function NewProductHome({ limit, showSeeAllText = false }) {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(API_URL, {
          method: "GET",
          headers: HDRS,
          signal: ac.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setItems(Array.isArray(json) ? json : json?.data || []);
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

      {/* Grid: คอลัมน์กว้างอย่างน้อย 200px แล้วขยายเป็น 1fr */}
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
              const title =
                o?.Product_Name || o?.Category_Name || o?.name || "ไม่ระบุชื่อ";
              const img = o?.image || o?.ImageUrl || "/placeholder.png";
              const key = o?.id ?? idx;

              return (
                <CardActionArea key={key}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* รูปสี่เหลี่ยมจัตุรัส → การ์ดสูงเท่ากันทุกใบ */}
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
