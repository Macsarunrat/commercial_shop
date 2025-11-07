import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Avatar from "@mui/material/Avatar";
import AppTheme from "../theme/AppTheme";
import { useParams } from "react-router-dom";
import Addimg from "./Addimg";

const API = "https://ritzily-nebule-clark.ngrok-free.dev";
const HDRS = { "ngrok-skip-browser-warning": "true" };

const CARD_W = 220;
const CARD_H = 320;
const IMG_H = 180;

/* ------------------- normalizers ------------------- */
function normalizeShop(it) {
  if (!it) return null;
  return {
    id: it.Shop_ID ?? it.shop_id ?? null,
    name: it.Shop_Name ?? it.name ?? "",
    phone: it.Shop_Phone ?? it.phone ?? "",
    logo: it.Cover_Img_Url ?? it.logo ?? "", // ให้ Avatar ตัดสินใจ fallback
  };
}
function normalizeSell(it) {
  if (!it) return null;
  const priceNum =
    Number(String(it.Price ?? it.price ?? "0").replace(/,/g, "")) || 0;
  return {
    sellId: it.Sell_ID ?? it.sell_id ?? null,
    productId: it.Product_ID ?? it.product_id ?? null,
    shopId: it.Shop_ID ?? it.shop_id ?? null,
    name: it.Product_Name ?? it.name ?? "Unnamed",
    price: priceNum,
    stock: Number(it.Stock ?? it.stock ?? 0),
    image: it.Cover_Image || it.image || "", // ใช้รูปจาก /image เป็นหลัก
  };
}

export default function StoreShowUI() {
  const { shopId } = useParams();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [shop, setShop] = React.useState(null);
  const [items, setItems] = React.useState([]);

  // map รูปตาม Product_ID (string) -> { url, isCover }
  const [imgMap, setImgMap] = React.useState(new Map());

  // dialog อัปโหลดเมื่อคลิกการ์ด
  const [addOpen, setAddOpen] = React.useState(false);
  const [activePid, setActivePid] = React.useState(null);

  const openUploadFor = (pid) => {
    setActivePid(pid);
    setAddOpen(true);
  };

  // ----------- ดึงร้าน + สินค้า -----------
  React.useEffect(() => {
    if (!shopId) return;
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [shopsRes, sellsRes] = await Promise.all([
          fetch(`${API}/store/shops`, {
            signal: controller.signal,
            headers: HDRS,
          }),
          fetch(`${API}/store/products`, {
            signal: controller.signal,
            headers: HDRS,
          }),
        ]);
        if (!shopsRes.ok) throw new Error(`shops HTTP ${shopsRes.status}`);
        if (!sellsRes.ok) throw new Error(`products HTTP ${sellsRes.status}`);

        const shopsRaw = await shopsRes.json();
        const sellsRaw = await sellsRes.json();

        const shopsList = (
          Array.isArray(shopsRaw) ? shopsRaw : shopsRaw?.items ?? []
        )
          .map(normalizeShop)
          .filter(Boolean);

        const sellsList = (
          Array.isArray(sellsRaw) ? sellsRaw : sellsRaw?.items ?? []
        )
          .map(normalizeSell)
          .filter(Boolean);

        const matchedShop =
          shopsList.find((s) => String(s.id) === String(shopId)) ?? null;
        const myItems = sellsList.filter(
          (p) => String(p.shopId) === String(shopId)
        );

        setShop(matchedShop);
        setItems(myItems);
      } catch (e) {
        if (e.name !== "AbortError") setError(e);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [shopId]);

  // ----------- ดึงรูปทั้งหมดจาก /image แล้ว map ตาม Product_ID -----------
  const refreshImages = React.useCallback(
    async (productIdSet) => {
      try {
        const res = await fetch(`${API}/image/`, { headers: HDRS });
        if (!res.ok) throw new Error(`image HTTP ${res.status}`);
        const list = await res.json();

        const pidSet =
          productIdSet ?? new Set(items.map((p) => String(p.productId)));

        const map = new Map(); // pid -> {url,isCover}
        (Array.isArray(list) ? list : []).forEach((im) => {
          const pid = im?.Product_ID ?? im?.product_id;
          const raw = im?.Img_Src ?? im?.img_src;
          if (!pid || !raw) return;

          const key = String(pid);
          if (!pidSet.has(key)) return; // สนใจเฉพาะสินค้าของร้านนี้

          const isCover = !!(im?.IsCover ?? im?.is_cover);
          // ถ้า Img_Src เป็น path relative ให้เติม API
          const url = String(raw).startsWith("http") ? raw : `${API}${raw}`;

          const exist = map.get(key);
          if (!exist || (isCover && !exist.isCover)) {
            map.set(key, { url, isCover });
          }
        });

        setImgMap(map);
      } catch {
        setImgMap(new Map());
      }
    },
    [items]
  );

  // โหลดรูปครั้งแรกหลังได้ items แล้ว
  React.useEffect(() => {
    if (!items.length) return;
    const ids = new Set(items.map((p) => String(p.productId)));
    refreshImages(ids);
  }, [items, refreshImages]);

  /* ---------- Loading / Error ---------- */
  if (loading) {
    return (
      <AppTheme>
        <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, px: 2, pb: 5 }}>
          <Card sx={{ p: 2, mb: 3 }}>
            <Skeleton variant="rectangular" height={84} />
          </Card>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: `repeat(auto-fill, ${CARD_W}px)`,
              gap: 16,
              justifyContent: "center",
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                width={CARD_W}
                height={CARD_H}
              />
            ))}
          </Box>
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

  if (!shop) {
    return (
      <AppTheme>
        <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, px: 2, pb: 5 }}>
          <Typography>ไม่พบข้อมูลร้าน (id: {shopId})</Typography>
        </Box>
      </AppTheme>
    );
  }

  const shopName = shop.name || `Shop ${shopId}`;

  /* ----------------------------- UI ----------------------------- */
  return (
    <AppTheme>
      <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, px: 2, pb: 5 }}>
        {/* หัวร้าน: แสดงโลโก้เป็นอักษรแรกถ้าไม่มีภาพ */}
        <Card
          sx={{ p: 2, mb: 3, display: "flex", alignItems: "center", gap: 2 }}
        >
          <Avatar
            src={shop.logo || undefined}
            alt={shopName}
            sx={{
              width: 64,
              height: 64,
              bgcolor: "#f5f5f5",
              color: "black",
              fontWeight: 700,
              fontSize: 24,
            }}
            slotProps={{ onError: (e) => (e.currentTarget.src = "") }}
          >
            {(shopName?.[0] || "S").toUpperCase()}
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" fontWeight={800} noWrap>
              {shopName}
            </Typography>
            {shop.phone && (
              <Typography variant="body2" color="text.secondary">
                Phone: {shop.phone}
              </Typography>
            )}
          </Box>
        </Card>
        <Box display="flex" gap={3} mb={2} alignItems="center">
          <Typography variant="h6">สินค้าของร้านนี้</Typography>

          {/* ปุ่มอัปโหลดรวม (กรอก Product_ID เอง) */}
          <Addimg
            hideTrigger
            open={addOpen}
            onClose={() => setAddOpen(false)}
            defaultProductId={activePid}
            onUploaded={({ productId }) => {
              setAddOpen(false);
              // อัปเดตรูปเฉพาะสินค้าที่เพิ่งอัปโหลด
              refreshImages(new Set([String(productId)]));
            }}
          />
        </Box>
        <Divider sx={{ mb: 2 }} />
        {items.length === 0 ? (
          <Typography color="text.secondary">ร้านนี้ยังไม่มีสินค้า</Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: `repeat(auto-fill, ${CARD_W}px)`,
              gap: 2,
              justifyContent: "center",
            }}
          >
            {items.map((p) => {
              const mapped = imgMap.get(String(p.productId));
              const img =
                (mapped && mapped.url) ||
                (p.image &&
                (p.image.startsWith("/") || p.image.startsWith("http"))
                  ? p.image.startsWith("/")
                    ? `${API}${p.image}`
                    : p.image
                  : "/IMG1/bagG.png");

              return (
                <Card
                  key={p.sellId ?? `pid-${p.productId}`}
                  variant="outlined"
                  sx={{
                    width: CARD_W,
                    height: CARD_H,
                    borderRadius: 2,
                    p: 1.5,
                    display: "flex",
                    flexDirection: "column",
                    cursor: "pointer",
                  }}
                  title={`Product_ID: ${p.productId}`}
                  onClick={() => openUploadFor(p.productId)} // ✅ กดการ์ดเพื่ออัปโหลดให้สินค้านี้
                >
                  <CardMedia
                    component="img"
                    src={img}
                    alt={p.name || "-"}
                    sx={{
                      height: IMG_H,
                      objectFit: "cover",
                      borderRadius: 1,
                      flexShrink: 0,
                    }}
                    onError={(e) => (e.currentTarget.src = "/IMG1/bagG.png")}
                  />

                  <Box
                    sx={{
                      mt: 1,
                      display: "flex",
                      flexDirection: "column",
                      minHeight: 0,
                      flex: 1,
                    }}
                  >
                    <Typography variant="body2" title={p.name} noWrap>
                      {p.name ?? "-"}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      Product_ID: {p.productId}
                    </Typography>

                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      sx={{ mt: 0.25 }}
                    >
                      ฿{(p.price ?? 0).toLocaleString("th-TH")}
                    </Typography>

                    <Typography
                      variant="caption"
                      color={p.stock > 0 ? "text.secondary" : "error.main"}
                      sx={{ mt: "auto" }}
                    >
                      {p.stock > 0 ? `IN STOCK (${p.stock})` : "OUT OF STOCK"}
                    </Typography>
                  </Box>
                </Card>
              );
            })}
          </Box>
        )}
      </Box>
    </AppTheme>
  );
}
