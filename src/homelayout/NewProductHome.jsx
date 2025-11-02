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

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: "center",
}));
export default function NewProductHome() {
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
      <Box sx={{ display: "flex ", justifyContent: "space-between" }}>
        <Typography
          gutterBottom
          variant="h4"
          component="div"
          sx={{
            color: "#d62828",
            fontFamily: "Prompt",
            fontWeight: "500",
            mx: 2,
            mt: 2,
          }}
        >
          NEW PRODUCT
        </Typography>

        <IconButton>
          <Typography sx={{ color: "#d62828", fontSize: 18 }}>
            See All
          </Typography>
          <ArrowForwardIosIcon
            sx={{ color: "#d62828", fontSize: 16, mr: 0.5 }}
          />
        </IconButton>
      </Box>
      <Stack sx={{ flexGrow: 1 }}>
        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ m: { xs: 2 } }}>
          {Array.from(Array(6)).map((_, index) => (
            <Grid key={index} size={{ xs: 4, sm: 4, md: 2 }}>
              <CardActionArea>
                <Card
                  sx={{ maxWidth: 500, height: { xs: "28vh", lg: "35vh" } }}
                >
                  <CardMedia
                    component="img"
                    image="/placeholder.png" // ใส่รูปจริงทีหลัง
                    alt="product"
                    sx={{ height: { xs: "20vh", lg: "25vh" } }} // ความสูงรูป
                  />
                  <CardContent
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <Typography gutterBottom variant="h5" component="div">
                      Price
                    </Typography>
                  </CardContent>
                </Card>
              </CardActionArea>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Box>
  );
}
