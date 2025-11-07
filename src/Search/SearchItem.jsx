// src/search/SearchResultsPage.jsx
import * as React from "react";
import { useSearchParams, Link } from "react-router-dom";

const API_BASE = "https://ritzily-nebule-clark.ngrok-free.dev";
const HDRS = { "ngrok-skip-browser-warning": "true" };

/** ประกอบ query string (ตัดค่า null/undefined/"" ออก) */
function buildQS(params) {
  const ent = Object.entries(params).filter(([, v]) => {
    if (v == null) return false;
    const s = String(v).trim();
    return s !== "" && s.toLowerCase() !== "nan";
  });
  return ent.length ? `?${new URLSearchParams(ent).toString()}` : "";
}

/** แปลง path รูปให้เป็น URL เต็ม + แนบพารามิเตอร์ข้ามหน้าเตือนของ ngrok */
function imageURL(path) {
  if (!path) return "";
  const url = new URL(path, API_BASE); // รองรับทั้ง absolute/relative
  url.searchParams.set("ngrok-skip-browser-warning", "true");
  return url.toString();
}

/** แปลง record จาก /store/products ให้เป็นโครงกลางที่ UI ใช้ง่าย */
function normalizeSell(it) {
  if (!it) return null;
  const toNum = (v) => Number(String(v ?? "0").replace(/,/g, "")) || 0;
  return {
    sellId: it.Sell_ID ?? it.sell_id ?? null,
    productId: it.Product_ID ?? it.product_id ?? null,
    shopId: it.Shop_ID ?? it.shop_id ?? null,
    categoryId: it.Category_ID ?? it.category_id ?? null,
    name: it.Product_Name ?? it.name ?? "Unnamed",
    price: toNum(it.Price ?? it.price),
    stock: toNum(it.Stock ?? it.stock),
    image: it.Img_Src || null,
  };
}

export default function SearchResultsPage() {
  const [sp] = useSearchParams();
  const q = sp.get("q") ?? "";
  const category_id = sp.get("category_id") ?? "";
  const brand_id = sp.get("brand_id") ?? "";

  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState(null);

  // ป้องกัน race: เก็บ requestId ล่าสุดไว้
  const lastReqId = React.useRef(0);

  React.useEffect(() => {
    // ไม่มีเงื่อนไขใด ๆ ไม่ต้องยิง
    if (!q && !category_id && !brand_id) {
      setData([]);
      setErr(null);
      return;
    }

    const controller = new AbortController();
    const reqId = ++lastReqId.current;

    (async () => {
      setLoading(true);
      setErr(null);

      try {
        const qs = buildQS({ q, category_id, brand_id });

        // ดึง "สินค้า" และ "รูปสินค้า" พร้อมกัน
        const [resProducts, resImages] = await Promise.all([
          fetch(`${API_BASE}/store/products${qs}`, {
            signal: controller.signal,
            headers: HDRS,
          }),
          fetch(`${API_BASE}/image/`, {
            signal: controller.signal,
            headers: HDRS,
          }),
        ]);

        if (!resProducts.ok) throw new Error(`HTTP ${resProducts.status}`);
        if (!resImages.ok) throw new Error(`HTTP ${resImages.status}`);

        // products
        const rawProducts = await resProducts.json();
        const list = (
          Array.isArray(rawProducts) ? rawProducts : rawProducts?.items ?? []
        )
          .map(normalizeSell)
          .filter(Boolean);

        // images -> ทำเป็น map: productId -> [{src,isCover,...}]
        const rawImages = await resImages.json();
        const imgMap = new Map(); // key: Product_ID (number) -> array

        if (Array.isArray(rawImages)) {
          for (const r of rawImages) {
            const pid = Number(r.Product_ID ?? r.product_id);
            if (!Number.isFinite(pid)) continue;
            const arr = imgMap.get(pid) ?? [];
            arr.push({
              src: imageURL(r.Img_Src || r.img_src),
              isCover: Boolean(r.IsCover),
              id: r.Img_ID ?? r.img_id ?? null,
            });
            imgMap.set(pid, arr);
          }
        }

        // ผูกภาพกับสินค้า: ถ้ามี cover ใช้ cover, ไม่มีก็ใช้รูปแรก
        const merged = list.map((p) => {
          const pidNum = Number(p.productId);
          const imgs = Number.isFinite(pidNum) ? imgMap.get(pidNum) ?? [] : [];
          const preferred = imgs.find((x) => x.isCover) ?? imgs[0];
          return {
            ...p,
            image: preferred?.src || p.image || "/IMG1/bagG.png",
            _imagesAll: imgs,
            _imagePreferred: preferred?.src || null,
          };
        });

        if (reqId !== lastReqId.current) return; // มีรีเควสใหม่กว่าแล้ว

        setData(merged);
      } catch (e) {
        if (e.name === "AbortError") return;
        setErr(e);
        setData([]);
      } finally {
        if (reqId === lastReqId.current) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [q, category_id, brand_id]);

  const formatBaht = (n) => new Intl.NumberFormat("th-TH").format(n);

  if (!q && !category_id && !brand_id) {
    return <div style={{ padding: 16 }}>พิมพ์คำค้นหรือเลือกตัวกรอง</div>;
  }

  return (
    <div style={{ maxWidth: 1100, margin: "24px auto", padding: 12 }}>
      {loading && <div style={{ marginBottom: 8 }}>กำลังค้นหา…</div>}
      {err && (
        <div style={{ padding: 12, color: "crimson", marginBottom: 8 }}>
          ค้นหาไม่สำเร็จ: {String(err.message || err)}
        </div>
      )}

      {data.length === 0 && !loading ? (
        <div>ไม่พบสินค้า</div>
      ) : (
        <ul
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 16,
            listStyle: "none",
            padding: 0,
            margin: 0,
          }}
        >
          {data.map((p) => {
            const key = p.sellId ?? p.productId ?? Math.random().toString(36);
            const img = p._imagePreferred || p.image || "/IMG1/bagG.png";

            return (
              <li
                key={key}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 10,
                  padding: 12,
                  display: "flex",
                  flexDirection: "column",
                  background: "#fff",
                }}
              >
                <Link
                  to={{
                    pathname: `/mainshop/${p.sellId ?? p.productId ?? ""}`,
                    search: p.productId
                      ? `?pid=${p.productId}&sid=${p.sellId ?? ""}`
                      : "",
                  }}
                  state={{
                    productId: p.productId,
                    sellId: p.sellId,
                    image: p._imagePreferred || null, // ส่งรูปหลักไปให้หน้า detail ใช้ทันที
                  }}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <img
                    src={img}
                    alt={p.name}
                    style={{
                      width: "100%",
                      height: 160,
                      objectFit: "cover",
                      borderRadius: 6,
                      background: "#f7f7f7",
                    }}
                    onError={(e) => {
                      e.currentTarget.src = "/IMG1/bagG.png";
                    }}
                  />
                  <div
                    title={p.name}
                    style={{
                      fontWeight: 600,
                      marginTop: 8,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      minHeight: 40,
                    }}
                  >
                    {p.name}
                  </div>
                  <div style={{ marginTop: 4, fontSize: 15 }}>
                    ฿{formatBaht(p.price)}
                  </div>
                  {Number.isFinite(p.stock) && (
                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 12,
                        color: p.stock > 0 ? "#666" : "#c62828",
                      }}
                    >
                      {p.stock > 0 ? `IN STOCK (${p.stock})` : "OUT OF STOCK"}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
