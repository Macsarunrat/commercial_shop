// CategoryHome.jsx
import * as React from "react";
import {
  Box,
  Typography,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Grid,
} from "@mui/material";
import AppTheme from "../theme/AppTheme";

const CATEGORIES = Array.from({ length: 24 }).map((_, i) => ({
  id: i + 1,
  name: `Category ${i + 1}`,
  image: "/placeholder.png",
}));

export default function CategoryHome() {
  // เอาแค่ 2 แถว × 10 = 20 ชิ้น
  const list = CATEGORIES.slice(0, 20);

  return (
    <AppTheme>
      <Box
        sx={{
          borderRadius: 1,
          display: "flex",
        }}
      >
        {/* แถวละ 10: ตั้ง columns=10 และ item xs=1 */}
        <Grid
          container
          spacing={2}
          columns={{ xs: 2, md: 5 }}
          sx={{ justifyContent: "center" }}
        >
          {list.map((c) => (
            <Grid key={c.id} item xs={1}>
              <Card
                variant="outlined"
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 1,
                  boxShadow: "none",
                  borderColor: "divider",
                }}
              >
                <CardActionArea onClick={() => console.log("clicked", c)}>
                  {/* ขยายรูปให้ใหญ่ขึ้น */}
                  <CardMedia
                    component="img"
                    image={c.image}
                    alt={c.name}
                    sx={{
                      width: 200, // ↑ ใหญ่ขึ้น
                      height: 200, // ↑ ใหญ่ขึ้น
                      // ถ้าอยากเหลี่ยมใส่ 0
                      mx: "auto",
                      bgcolor: "grey.100",
                    }}
                  />
                  <CardContent sx={{ px: 1, py: 1.25 }}>
                    <Typography
                      variant="body2"
                      align="center"
                      noWrap
                      sx={{ fontSize: 14, height: 80 }}
                    >
                      {c.name}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </AppTheme>
  );
}
