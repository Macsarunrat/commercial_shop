// import * as React from "react";
// import Box from "@mui/material/Box";
// import Grid from "@mui/material/Grid";
// import Card from "@mui/material/Card";
// import CardMedia from "@mui/material/CardMedia";
// import Typography from "@mui/material/Typography";
// import Stack from "@mui/material/Stack";
// import Button from "@mui/material/Button";
// import Divider from "@mui/material/Divider";
// import IconButton from "@mui/material/IconButton";

// import AddIcon from "@mui/icons-material/Add";
// import RemoveIcon from "@mui/icons-material/Remove";
// import Skeleton from "@mui/material/Skeleton";
// import AppTheme from "../theme/AppTheme";
// import { useLocation, useParams } from "react-router-dom";
// import { useEffect } from "react";
// import { useCallback } from "react";
// import { useCartStore } from "../stores/cartStore";
// import ShopIcon from "./ShopIcon";

// export default function ShopUI() {
//   const addItem = useCartStore((s) => s.addItem);

//   const { categoryId } = useParams(); // ← รับ categoryId
//   const { state } = useLocation(); // ← รับ productId (optional)
//   const preferredProductId = state?.productId; // อาจไม่มี

//   const [qty, setQty] = React.useState(1);
//   const [items, setItems] = React.useState([]); // สินค้าทั้งหมวด
//   const [product, setProduct] = React.useState(null); // ชิ้นที่จะแสดง
//   const [loading, setLoading] = React.useState(true);
//   const [error, setError] = React.useState(null);

//   const handleAddToCart = useCallback(() => {
//     if (!product) return;
//     if ((product.stock ?? 0) <= 0) return;
//     -(-+addItem(product, qty)); // หรือ fix ให้ +1 เสมอ: addItem(product, 1)
//   }, [product, qty, addItem]);

//   useEffect(() => {
//     const controller = new AbortController();
//     (async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         // ดึงสินค้าทั้งหมวด
//         const res = await fetch(
//           `${API_BASE}/products?categoryId=${encodeURIComponent(categoryId)}`,
//           { signal: controller.signal }
//         );
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const list = await res.json();

//         setItems(Array.isArray(list) ? list : []);

//         // เลือกสินค้าที่จะแสดง
//         let picked = null;
//         if (preferredProductId != null) {
//           picked =
//             list.find((x) => String(x.id) === String(preferredProductId)) ||
//             null;
//         }
//         if (!picked) picked = list[0] || null;

//         setProduct(picked);
//         setQty(1); // reset จำนวนทุกครั้งที่เปลี่ยนสินค้า
//       } catch (e) {
//         if (e.name !== "AbortError") setError(e);
//       } finally {
//         setLoading(false);
//       }
//     })();
//     return () => controller.abort();
//   }, [categoryId, preferredProductId]);

//   const shopId = product?.shopId ?? null;

//   if (loading) {
//     return (
//       <AppTheme>
//         <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, px: 2, pb: 5 }}>
//           <Card sx={{ p: 2 }}>
//             <Skeleton variant="rectangular" height={420} />
//             <Skeleton height={40} sx={{ mt: 2 }} />
//           </Card>
//         </Box>
//       </AppTheme>
//     );
//   }

//   if (error) {
//     return (
//       <AppTheme>
//         <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, px: 2, pb: 5 }}>
//           <Typography color="error">
//             โหลดข้อมูลไม่สำเร็จ: {String(error.message || error)}
//           </Typography>
//         </Box>
//       </AppTheme>
//     );
//   }

//   if (!product) {
//     return (
//       <AppTheme>
//         <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, px: 2, pb: 5 }}>
//           <Typography>ไม่พบสินค้าในหมวด {categoryId}</Typography>
//         </Box>
//       </AppTheme>
//     );
//   }

//   const { name = "", price = 0, stock = 0 } = product;
//   const image = product.image?.startsWith("/")
//     ? product.image
//     : "/IMG1/bagG.png";
//   const formatBaht = (n) => new Intl.NumberFormat("th-TH").format(n);

//   return (
//     <AppTheme>
//       <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, px: 2, pb: 5 }}>
//         <Card sx={{ p: 2, px: 10 }}>
//           <Grid container spacing={1} alignItems="flex-start">
//             {/* ซ้าย: รูปสินค้า */}
//             <Grid item xs={12} md={5}>
//               <Card
//                 elevation={0}
//                 sx={{ borderRadius: 2, overflow: "hidden", mb: 2 }}
//               >
//                 <CardMedia
//                   component="img"
//                   image={image}
//                   alt={name || "product"}
//                   sx={{ width: "100%", height: 300, objectFit: "cover" }}
//                   onError={(e) => {
//                     e.currentTarget.src = "/IMG1/bagG.png";
//                   }}
//                 />
//               </Card>
//             </Grid>

//             {/* ขวา: รายละเอียดสินค้า */}
//             <Grid item xs={12} md={7}>
//               <Stack spacing={2}>
//                 <Typography variant="h5" fontWeight={700} lineHeight={1.4}>
//                   {name}
//                 </Typography>

//                 <Box
//                   sx={{
//                     bgcolor: "rgba(255,145,0,0.08)",
//                     p: 2,
//                     borderRadius: 2,
//                   }}
//                 >
//                   <Typography
//                     variant="h4"
//                     fontWeight={600}
//                     color="primary.main"
//                   >
//                     ฿{formatBaht(price)}
//                   </Typography>
//                 </Box>

//                 <Divider />

//                 {/* จำนวน */}
//                 <Stack direction="row" spacing={2} alignItems="center">
//                   <Typography fontWeight={700}>Quantity</Typography>
//                   <Box
//                     sx={{
//                       display: "inline-flex",
//                       alignItems: "center",
//                       border: "1px solid",
//                       borderColor: "divider",
//                       borderRadius: 1,
//                     }}
//                   >
//                     <IconButton
//                       onClick={() => setQty((q) => Math.max(1, q - 1))}
//                       disabled={stock <= 0}
//                     >
//                       <RemoveIcon />
//                     </IconButton>
//                     <Typography sx={{ width: 40, textAlign: "center" }}>
//                       {qty}
//                     </Typography>
//                     <IconButton
//                       onClick={() => setQty((q) => Math.min(q + 1, stock))}
//                       disabled={stock <= 0 || qty >= stock}
//                     >
//                       <AddIcon />
//                     </IconButton>
//                   </Box>
//                   <Typography
//                     variant="body2"
//                     color={stock > 0 ? "text.secondary" : "error.main"}
//                   >
//                     {stock > 0 ? `IN STOCK (${stock})` : "OUT OF STOCK"}
//                   </Typography>
//                 </Stack>

//                 <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
//                   <Button
//                     variant="outlined"
//                     size="large"
//                     fullWidth
//                     disabled={stock <= 0}
//                     onClick={handleAddToCart}
//                   >
//                     Add To Cart
//                   </Button>
//                   <Button
//                     variant="contained"
//                     size="large"
//                     fullWidth
//                     disabled={stock <= 0}
//                   >
//                     Buy Now
//                   </Button>
//                 </Stack>
//               </Stack>
//             </Grid>
//           </Grid>
//         </Card>

//         {/* ถ้าต้องการ: แสดงสินค้าอื่นในหมวดให้กดสลับ */}
//         {/* <ShopIcon /> หรือ list อื่น ๆ */}
//         <ShopIcon shopId={shopId} categoryId={categoryId} />
//       </Box>
//     </AppTheme>
//   );
// }

// src/shopui/MainShopUI.jsx
import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Skeleton from "@mui/material/Skeleton";
import {
  useLocation,
  useParams,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import AppTheme from "../theme/AppTheme";
import { useCartStore } from "../stores/cartStore";
import ShopIcon from "./ShopIcon";
import {
  addToCartServer,
  getCartServer,
  updateCartItemServer,
  removeCartItemServer,
} from "../cart/cartCon.jsx";

const API = "https://great-lobster-rightly.ngrok-free.app";
const HDRS = { "ngrok-skip-browser-warning": "true" };

function buildQS(params) {
  const ent = Object.entries(params).filter(([, v]) => {
    if (v == null) return false;
    if (typeof v === "number") return Number.isFinite(v);
    const s = String(v).trim();
    return s !== "" && s.toLowerCase() !== "nan";
  });
  return ent.length ? `?${new URLSearchParams(ent).toString()}` : "";
}

function normalizeSell(it) {
  const priceNum =
    Number(String(it.Price ?? it.price ?? "0").replace(/,/g, "")) || 0;
  return {
    sellId: it.Sell_ID ?? it.sell_id ?? null, // ★ สำคัญสำหรับ CRUD
    productId: it.Product_ID ?? it.product_id ?? null,
    shopId: it.Shop_ID ?? it.shop_id ?? null,
    categoryId: it.Category_ID ?? it.category_id ?? null,
    name: it.Product_Name ?? it.name ?? "Unnamed",
    price: priceNum,
    stock: Number(it.Stock ?? it.stock ?? 0),
    image: it.Cover_Image || it.image || "/IMG1/bagG.png",
  };
}

export default function MainShopUI() {
  const navigate = useNavigate();

  // local cart (เอาไว้ให้ UI ตอบสนองทันทีหลังยิง API)
  const addItemLocal = useCartStore((s) => s.addItem);

  const { sellId: sellIdFromPath } = useParams(); // /mainshop/:sellId
  const { state } = useLocation();
  const [sp] = useSearchParams();

  // sid = sell_id (ตัวหลักสำหรับ CRUD), pid = product_id (ตัวช่วยหา category)
  const sid = state?.sellId ?? sp.get("sid") ?? sellIdFromPath;
  const pid = state?.productId ?? sp.get("pid") ?? null;

  const [qty, setQty] = React.useState(1);
  const [items, setItems] = React.useState([]);
  const [product, setProduct] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [adding, setAdding] = React.useState(false);

  const formatBaht = (n) => new Intl.NumberFormat("th-TH").format(n);

  React.useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // ถ้ามี pid → หา category ของ product เพื่อลิสต์สินค้าหมวดเดียวกัน
        let categoryId = null;
        if (pid != null) {
          const masterRes = await fetch(`${API}/products/`, {
            signal: controller.signal,
            headers: HDRS,
          });
          if (!masterRes.ok) throw new Error(`HTTP ${masterRes.status}`);
          const masterRaw = await masterRes.json();
          const masterList = Array.isArray(masterRaw)
            ? masterRaw
            : masterRaw?.items ?? [];
          const hit = masterList.find(
            (x) => String(x.Product_ID ?? x.product_id) === String(pid)
          );
          categoryId = hit ? Number(hit.Category_ID ?? hit.category_id) : null;
        }

        // ดึงรายการขาย (กรองด้วย category ได้ถ้ามี)
        const qs = buildQS({
          category_id: Number.isFinite(categoryId) ? categoryId : null,
        });
        const res = await fetch(`${API}/store/products${qs}`, {
          signal: controller.signal,
          headers: HDRS,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const raw = await res.json();
        const list = (Array.isArray(raw) ? raw : raw?.items ?? [])
          .map(normalizeSell)
          .filter(Boolean);

        setItems(list);

        // เลือกสินค้าปัจจุบัน: เน้น sid (sell_id) > pid > ตัวแรก
        const picked =
          list.find((x) => sid != null && String(x.sellId) === String(sid)) ||
          list.find(
            (x) => pid != null && String(x.productId) === String(pid)
          ) ||
          list[0] ||
          null;

        setProduct(picked);
        setQty(1);
      } catch (e) {
        if (e.name !== "AbortError") setError(e);
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [sid, pid]);

  /** POST /cart/ */
  const handleAddToCart = async () => {
    if (!product || (product.stock ?? 0) <= 0) return;
    setAdding(true);
    try {
      // 1) ยิงหลังบ้าน (ใช้ cookie-session เป็นค่า default)
      await addToCartServer(
        product.sellId,
        qty /*, { token: '...', useCookie:false }*/
      );

      // 2) sync local cart เพื่อให้ UI ตอบสนองเร็ว
      addItemLocal(
        {
          productId: product.productId,
          sellId: product.sellId,
          shopId: product.shopId,
          name: product.name,
          price: product.price,
          image: product.image,
        },
        qty
      );
    } catch (e) {
      alert(`ใส่ตะกร้าไม่สำเร็จ: ${e.message}`);
    } finally {
      setAdding(false);
    }
  };

  /** “ซื้อเลย” = เพิ่มเข้าตะกร้าแล้วพาไป /cart */
  const handleBuyNow = async () => {
    if (!product || (product.stock ?? 0) <= 0) return;
    await handleAddToCart();
    navigate("/cart");
  };

  const shopId = product?.shopId ?? null;
  const categoryId = product?.categoryId ?? null;

  // ---------- Render ----------
  if (loading) {
    return (
      <AppTheme>
        <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, px: 2, pb: 5 }}>
          <Card sx={{ p: 2 }}>
            <Skeleton variant="rectangular" height={420} />
            <Skeleton height={40} sx={{ mt: 2 }} />
          </Card>
        </Box>
      </AppTheme>
    );
  }
  if (error) {
    return (
      <AppTheme>
        <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, px: 2, pb: 5 }}>
          <Typography color="error">
            โหลดข้อมูลไม่สำเร็จ: {String(error.message || error)}
          </Typography>
        </Box>
      </AppTheme>
    );
  }
  if (!product) {
    return (
      <AppTheme>
        <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, px: 2, pb: 5 }}>
          <Typography>ไม่พบสินค้า</Typography>
        </Box>
      </AppTheme>
    );
  }

  const { name = "", price = 0, stock = 0, image = "/IMG1/bagG.png" } = product;

  return (
    <AppTheme>
      <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, px: 2, pb: 5 }}>
        <Card sx={{ p: 2, px: { md: 10 } }}>
          <Grid container spacing={1} alignItems="flex-start">
            {/* รูปสินค้า */}
            <Grid item xs={12} md={5}>
              <Card
                elevation={0}
                sx={{ borderRadius: 2, overflow: "hidden", mb: 2 }}
              >
                <CardMedia
                  component="img"
                  image={image}
                  alt={name || "product"}
                  sx={{ width: "100%", height: 300, objectFit: "cover" }}
                  onError={(e) => {
                    e.currentTarget.src = "/IMG1/bagG.png";
                  }}
                />
              </Card>
            </Grid>

            {/* รายละเอียดสินค้า */}
            <Grid item xs={12} md={7}>
              <Stack spacing={2}>
                <Typography variant="h5" fontWeight={700} lineHeight={1.4}>
                  {name}
                </Typography>

                <Box
                  sx={{
                    bgcolor: "rgba(255,145,0,0.08)",
                    p: 2,
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="h4"
                    fontWeight={600}
                    color="primary.main"
                  >
                    ฿{formatBaht(price)}
                  </Typography>
                </Box>

                <Divider />

                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography fontWeight={700}>Quantity</Typography>
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <IconButton
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      disabled={stock <= 0 || adding}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Typography sx={{ width: 40, textAlign: "center" }}>
                      {qty}
                    </Typography>
                    <IconButton
                      onClick={() => setQty((q) => Math.min(q + 1, stock))}
                      disabled={stock <= 0 || qty >= stock || adding}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                  <Typography
                    variant="body2"
                    color={stock > 0 ? "text.secondary" : "error.main"}
                  >
                    {stock > 0 ? `IN STOCK (${stock})` : "OUT OF STOCK"}
                  </Typography>
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    disabled={stock <= 0 || adding}
                    onClick={handleAddToCart}
                  >
                    {adding ? "Adding..." : "Add To Cart"}
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={stock <= 0 || adding}
                    onClick={handleBuyNow}
                  >
                    Buy Now
                  </Button>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </Card>

        {/* สินค้าอื่นในหมวดเดียวกัน */}
        <ShopIcon shopId={shopId} categoryId={categoryId} />
      </Box>
    </AppTheme>
  );
}
