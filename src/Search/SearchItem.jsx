import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const API_BASE = "https://great-lobster-rightly.ngrok-free.app";

function buildQS(obj) {
  const ent = Object.entries(obj).filter(
    ([, v]) => v != null && String(v).trim() !== ""
  );
  return ent.length ? `?${new URLSearchParams(ent).toString()}` : "";
}

export default function SearchResultsPage() {
  const [sp] = useSearchParams();
  const q = sp.get("q") ?? "";
  const category_id = sp.get("category_id") ?? "";
  const brand_id = sp.get("brand_id") ?? "";

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      if (!q && !category_id && !brand_id) return;
      setLoading(true);
      setErr(null);
      try {
        const qs = buildQS({ q, category_id, brand_id });
        const res = await fetch(`${API_BASE}/store/products${qs}`, {
          signal: controller.signal,
          headers: { "ngrok-skip-browser-warning": "true" }, // << เพิ่มตรงนี้
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(Array.isArray(json) ? json : json?.items ?? []);
      } catch (e) {
        if (e.name !== "AbortError") setErr(e);
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [q, category_id, brand_id]);

  if (!q && !category_id && !brand_id)
    return <div style={{ padding: 16 }}>พิมพ์คำค้นหรือเลือกตัวกรอง</div>;
  if (err)
    return (
      <div style={{ padding: 16, color: "crimson" }}>
        ค้นหาไม่สำเร็จ: {String(err.message || err)}
      </div>
    );

  return (
    <div style={{ maxWidth: 1000, margin: "24px auto", padding: 12 }}>
      {loading && <div>กำลังค้นหา…</div>}
      {data.length === 0 ? (
        <div>ไม่พบสินค้า</div>
      ) : (
        <ul
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
            gap: 16,
            listStyle: "none",
            padding: 0,
          }}
        >
          {data.map((p) => (
            <li
              key={p.id}
              style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}
            >
              <img
                src={p.image || "/IMG1/bagG.png"}
                alt={p.name}
                style={{ width: "100%", height: 140, objectFit: "cover" }}
              />
              <div style={{ fontWeight: 600, marginTop: 8 }}>{p.name}</div>
              <div>฿{Number(p.price || 0).toLocaleString("th-TH")}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
