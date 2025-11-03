import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import { Button, Card, CardContent } from "@mui/material";
import Divider from "@mui/material/Divider";
import AppTheme from "../theme/AppTheme";

const RIGHT_COLS = "repeat(3, 1fr)"; // 3 คอลัมน์กว้างเท่ากัน
const RIGHT_GAP = 3; // ปรับช่องไฟระหว่าง Unit/Amount/Total ที่นี่

export default function CheckOut() {
  return (
    <>
      <AppTheme>
        <Box sx={{ px: 10, pt: 5, border: "1px dashed" }}>
          {/* Address */}
          <Box mb={3} sx={{ p: 3, border: "1px dashed" }}>
            <Typography variant="h4">Delivery Address</Typography>
            <Typography>Address of User(Fetch)</Typography>
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr minmax(300px, 40%)" }, // ซ้าย + ขวา(กลุ่ม 3 ช่อง)
              alignItems: "center",
              columnGap: 2,
              pb: 1,
              p: 3,
            }}
          >
            <Typography variant="subtitle1">
              Products Ordered{" "}
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                ShopName
              </Typography>
            </Typography>

            <Box
              sx={{
                display: { xs: "none", md: "grid" },
                gridTemplateColumns: RIGHT_COLS,
                columnGap: RIGHT_GAP,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, textAlign: "right" }}
              >
                Unit Price
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, textAlign: "right" }}
              >
                Amount
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, textAlign: "right" }}
              >
                Item Subtotal
              </Typography>
            </Box>
          </Box>
          <Divider />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr minmax(300px, 40%)" },
              alignItems: "center",
              columnGap: 2,
              rowGap: 2,
              py: 2,
              px: 2,
            }}
          >
            {/* ซ้าย */}
            {/* ต้องใช้ map function */}
            <Card elevation={0} sx={{ bgcolor: "transparent" }}>
              <CardContent
                sx={{
                  p: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  minWidth: 0,
                }}
              >
                <Avatar sx={{ width: 56, height: 56, flex: "0 0 auto" }}>
                  avatar
                  {/* map */}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography noWrap>Itemname</Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    ItemId
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* ขวา: 3 ช่องเว้นระยะเท่ากัน */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: RIGHT_COLS,
                columnGap: RIGHT_GAP,
              }}
            >
              {/* map เอา */}
              <Typography sx={{ textAlign: "right" }}>
                ฿268(itemprice)
              </Typography>
              <Typography sx={{ textAlign: "right" }}>1(itemamount)</Typography>
              <Typography sx={{ textAlign: "right" }}>฿268(total)</Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              px: 2,
              mb: 2,
            }}
          >
            <Typography>Payment Method</Typography>
            <Box sx={{ pr: 4 }}>
              <Stack spacing={4}>
                <Typography variant="body2">Mobile Banking</Typography>
                <Typography variant="body2">Merchandise Subtotal : </Typography>
                {/* คำนวณค่าส่ง */}
                <Typography variant="body2">Shipping Subtota : </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "primary.main", fontSize: 22 }}
                >
                  Total Payment(cal price) :{" "}
                </Typography>
                <Divider></Divider>
                <Button
                  sx={{
                    bgcolor: "primary.main",
                    color: "White",
                    borderRadius: 0,
                    height: "6vh",
                  }}
                >
                  Place Order
                </Button>
              </Stack>
            </Box>
          </Box>
        </Box>
      </AppTheme>
    </>
  );
}
