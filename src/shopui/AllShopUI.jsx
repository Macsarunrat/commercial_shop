import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CardActionArea from "@mui/material/CardActionArea";
import Banner from "../nav/component/Bannner";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AppTheme from "../theme/AppTheme";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import { useState, useEffect } from "react";

const API_BASE = "http://localhost:3000/Sell"; // เปลี่ยนได้ตามแบ็กเอนด์ของคุณ

export default function ShopsGrid() {
  const [shops, setShops] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(API_BASE);
        const data = await res.json();
        setShops(data);
      } catch (e) {
        if (e.name !== "AbortError") console.error(e);
      }
    })();
    return () => controller.abort();
  }, []);

  return (
    <AppTheme>
      <Box sx={{ px: 2.5, pt: 3 }}>
        {shops.map((s, i) => {
          const name = s.name ?? s.shopName ?? "-";
          const logo = s.logoUrl ?? s.logo ?? "/IMG1/bagG.png";
          const products =
            s.countproduct ?? s.productsCount ?? s.products?.length;
          const joined = s.joined;
          const followers = s.followers ?? s.follower;
          const stock = s.stock;

          return (
            <Card
              key={i}
              variant="outlined"
              sx={{ mb: 2, borderRadius: 2, px: 2, py: 2, mx: 10 }}
            >
              <CardContent sx={{ py: 0 }}>
                <Grid container alignItems="center" spacing={2}>
                  {/* ซ้าย: โลโก้ + ชื่อ + ปุ่ม */}
                  <Grid item xs={12} md={4} lg={3}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        src={logo}
                        alt={name}
                        variant="rounded"
                        sx={{ width: 80, height: 60 }}
                      />
                      <Stack spacing={1} sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight={800} noWrap>
                          {name}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{
                            borderRadius: 1,
                            px: 1,
                            py: 0.2,
                            color: "primary.main",
                          }}
                        >
                          VIEW SHOP
                        </Button>
                      </Stack>
                    </Stack>
                  </Grid>

                  {/* เส้นแบ่งเฉพาะจอ md+ */}
                  <Grid
                    item
                    md="auto"
                    sx={{ display: { xs: "none", md: "block" } }}
                  >
                    <Divider orientation="vertical" flexItem />
                  </Grid>

                  {/* ขวา: metrics */}
                  <Grid item xs={12} md>
                    <Grid
                      container
                      justifyContent="space-between"
                      columnSpacing={{ xs: 2, md: 4 }}
                      rowSpacing={1}
                    >
                      {products != null && (
                        <Metric label="Products" value={products} />
                      )}
                      {joined != null && (
                        <Metric label="Joined" value={joined} />
                      )}
                      {followers != null && (
                        <Metric label="Follower" value={followers} />
                      )}
                      {stock != null && <Metric label="Stock" value={stock} />}
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          );
        })}

        {shops.length === 0 && (
          <Typography color="text.secondary" sx={{ mx: 5 }}>
            ไม่มีข้อมูลร้านค้า
          </Typography>
        )}
      </Box>
    </AppTheme>
  );
}

function Metric({ label, value }) {
  return (
    <Grid
      item
      xs={6}
      sm={4}
      md={4}
      lg="auto"
      sx={{ px: { xs: 1, md: 3 }, py: 1 }}
    >
      <Stack alignItems={{ xs: "flex-start", lg: "center" }} spacing={0.5}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 0.25, letterSpacing: 0.2 }}
        >
          {label}
        </Typography>
        <Typography variant="subtitle1" fontWeight={700} color="error.main">
          {value}
        </Typography>
      </Stack>
    </Grid>
  );
}
