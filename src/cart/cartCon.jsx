// src/cart/cartCon.jsx
const API_BASE = "https://ritzily-nebule-clark.ngrok-free.dev";
const CART = `${API_BASE}/cart`;

const NGROK_HDR = { "ngrok-skip-browser-warning": "true" };

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function buildInit({ token, useCookie = false } = {}) {
  // ใช้ Bearer token เป็นหลัก -> ไม่ต้องส่งคุ้กกี้ (omit)
  // ถ้าหลังบ้านผูกกับคุ้กกี้จริง ๆ ค่อยตั้ง useCookie=true
  return {
    headers: {
      "Content-Type": "application/json",
      ...NGROK_HDR, // เปิดไว้ได้ ปลอดภัยกว่าปิด (ไม่กระทบ CORS)
      ...authHeaders(token),
    },
    credentials: useCookie ? "include" : "omit",
  };
}

async function parseResponse(res) {
  if (res.status === 204) return {};
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    return await res.json().catch(() => ({}));
  }
  const text = await res.text().catch(() => "");
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

async function toError(res) {
  const data = await parseResponse(res);
  const msg =
    data?.detail || data?.message || data?.error || `HTTP ${res.status}`;
  return new Error(msg);
}

/** GET /cart/ */
export async function getCartServer(opts) {
  const init = buildInit(opts);
  const res = await fetch(`${CART}/`, { ...init, method: "GET" });
  if (!res.ok) throw await toError(res);
  return parseResponse(res);
}

/** POST /cart/  (รูปแบบตาม Swagger)  { Sell_ID, Quantity } */
export async function addToCartServer(sellId, quantity = 1, opts) {
  const init = buildInit(opts);
  const res = await fetch(`${CART}/`, {
    ...init,
    method: "POST",
    body: JSON.stringify({
      Sell_ID: Number(sellId),
      Quantity: Number(quantity),
    }),
  });
  if (!res.ok) throw await toError(res);
  return parseResponse(res);
}

/** PUT /cart/{sell_id}   (รูปแบบตาม Swagger)  { Quantity } */
export async function updateCartItemServer(sellId, quantity, opts) {
  const init = buildInit(opts);
  const res = await fetch(`${CART}/${encodeURIComponent(sellId)}`, {
    ...init,
    method: "PUT",
    body: JSON.stringify({ Quantity: Number(quantity) }),
  });
  if (!res.ok) throw await toError(res);
  return parseResponse(res);
}

/** DELETE /cart/{sell_id} */
export async function removeCartItemServer(sellId, opts) {
  const init = buildInit(opts);
  const res = await fetch(`${CART}/${encodeURIComponent(sellId)}`, {
    ...init,
    method: "DELETE",
  });
  if (!res.ok) throw await toError(res);
  return parseResponse(res);
}
