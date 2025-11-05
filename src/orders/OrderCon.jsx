// src/orders/ordersCon.jsx
const API = "https://great-lobster-rightly.ngrok-free.app";
const HDRS = { "ngrok-skip-browser-warning": "true" };

function auth(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function toJSON(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  const txt = await res.text();
  try {
    return JSON.parse(txt);
  } catch {
    return { detail: txt };
  }
}
async function ensureOK(res) {
  if (!res.ok) {
    const data = await toJSON(res);
    const msg = data?.detail || data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
}

export async function checkoutMyCart({ token, body = {} } = {}) {
  const res = await fetch(`${API}/orders/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...HDRS,
      ...auth(token),
    },
    credentials: "include",
    body: JSON.stringify(body), // ex. { Paid_Type_ID, Total_Weight, Ship_Cost, Paid_Status }
  });
  await ensureOK(res);
  return toJSON(res); // { Order_ID, ... }
}

export async function getMyOrders({ token } = {}) {
  const res = await fetch(`${API}/orders/me`, {
    headers: { ...HDRS, ...auth(token) },
    credentials: "include",
  });
  await ensureOK(res);
  return toJSON(res);
}

export async function getOrderDetails(orderId, { token } = {}) {
  const res = await fetch(`${API}/orders/${encodeURIComponent(orderId)}`, {
    headers: { ...HDRS, ...auth(token) },
    credentials: "include",
  });
  await ensureOK(res);
  return toJSON(res);
}

// สำหรับ DEMO: ยืนยันจ่ายแบบจำลอง
export async function confirmPayment(orderId, { token } = {}) {
  const res = await fetch(
    `${API}/orders/${encodeURIComponent(orderId)}/confirm_payment`,
    {
      method: "POST",
      headers: { ...HDRS, ...auth(token) },
      credentials: "include",
    }
  );
  await ensureOK(res);
  return toJSON(res);
}
