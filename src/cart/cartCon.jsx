// src/cart/cartCon.jsx
const API = "https://great-lobster-rightly.ngrok-free.app";
const CART = `${API}/cart`;

const BASE_HEADERS = {
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "true",
};

// ถ้าเป็น cookie-session ให้ใช้ credentials: 'include'
// ถ้าเป็น Bearer token ให้ส่ง { token: '...' }
function buildInit({ token, useCookie = true } = {}) {
  const headers = token
    ? { ...BASE_HEADERS, Authorization: `Bearer ${token}` }
    : BASE_HEADERS;

  return {
    headers,
    credentials: useCookie ? "include" : undefined,
  };
}

async function toError(res) {
  let msg = `HTTP ${res.status}`;
  try {
    const data = await res.json();
    msg = data?.error || data?.message || msg;
  } catch {}
  return new Error(msg);
}

/** GET /cart/ */
export async function getCartServer(opts) {
  const init = buildInit(opts);
  const res = await fetch(`${CART}/`, { ...init, method: "GET" });
  if (!res.ok) throw await toError(res);
  return res.json();
}

/** POST /cart/  { Sell_ID, Quantity } */
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
  return res.json(); // ตัวอย่าง response: { Quantity, User_ID, Sell_ID }
}

/** PUT /cart/{sell_id}  { Quantity } */
export async function updateCartItemServer(sellId, quantity, opts) {
  const init = buildInit(opts);
  const res = await fetch(`${CART}/${encodeURIComponent(sellId)}`, {
    ...init,
    method: "PUT",
    body: JSON.stringify({ Quantity: Number(quantity) }),
  });
  if (!res.ok) throw await toError(res);
  return res.json();
}

/** DELETE /cart/{sell_id} */
export async function removeCartItemServer(sellId, opts) {
  const init = buildInit(opts);
  const res = await fetch(`${CART}/${encodeURIComponent(sellId)}`, {
    ...init,
    method: "DELETE",
  });
  if (!res.ok) throw await toError(res);
  // บางระบบส่ง 204; คืน {} ให้เสมอ
  try {
    return await res.json();
  } catch {
    return {};
  }
}
