// src/address/AddressShop.js
const API = "https://unsparingly-proextension-jacque.ngrok-free.dev";
const HDRS = { "ngrok-skip-browser-warning": "true" };

const authHeaders = (token, extra = {}) => ({
  ...HDRS,
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
  ...extra,
});

async function readNiceError(res) {
  try {
    const j = await res.json();
    if (j?.detail) {
      if (Array.isArray(j.detail)) {
        return j.detail
          .map((d) => `${(d.loc || []).join(".")} : ${d.msg}`)
          .join("\n");
      }
      return String(j.detail);
    }
  } catch {}
  try {
    return await res.text();
  } catch {}
  return `HTTP ${res.status}`;
}
async function fjson(input, init) {
  const res = await fetch(input, init);
  if (!res.ok) throw new Error(await readNiceError(res));
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/** GET /shops/{shop_id}/address */
export async function getShopAddress(shopId, token) {
  return fjson(`${API}/shops/${shopId}/address`, {
    headers: authHeaders(token),
  });
}

/** POST /shops/{shop_id}/address  (ต้องมี Shop_ID ใน body ด้วย) */
export async function createShopAddress(shopId, addr, token) {
  const payload = { Shop_ID: Number(shopId), ...addr };
  return fjson(`${API}/shops/${shopId}/address`, {
    method: "POST",
    headers: authHeaders(token, { "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
}

/** PUT /shops/{shop_id}/address  (ต้องมี Shop_ID ใน body ด้วย) */
export async function updateShopAddress(shopId, addr, token) {
  const payload = { Shop_ID: Number(shopId), ...addr };
  return fjson(`${API}/shops/${shopId}/address`, {
    method: "PUT",
    headers: authHeaders(token, { "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
}

/** DELETE /shops/{shop_id}/address */
export async function deleteShopAddress(shopId, token) {
  return fjson(`${API}/shops/${shopId}/address`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

/** สะดวก: upsert (มีอยู่แล้ว → PUT, ไม่มีก็ POST) */
export async function upsertShopAddress(shopId, addr, token) {
  try {
    await getShopAddress(shopId, token);
    return updateShopAddress(shopId, addr, token);
  } catch {
    return createShopAddress(shopId, addr, token);
  }
}
