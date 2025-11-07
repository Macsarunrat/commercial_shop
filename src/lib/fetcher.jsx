// src/api/authedFetch.js (หรือไฟล์ที่คุณวาง)
import { useAuthStore } from "../stores/authStore";

const BASE_URL = "https://ritzily-nebule-clark.ngrok-free.dev";
const NGROK_HDR = { "ngrok-skip-browser-warning": "true" };

// ต่อ path ให้ได้แค่ 1 slash เสมอ
function join(base, path) {
  const b = String(base).replace(/\/+$/, "");
  const p = String(path).replace(/^\/+/, "");
  return `${b}/${p}`;
}
// เช็คว่าเป็น absolute URL หรือยัง
function isAbs(u) {
  return /^https?:\/\//i.test(String(u));
}

export async function authedFetch(input, init = {}) {
  const { getAuthHeader, refreshAccessToken, clearAuth } =
    useAuthStore.getState();

  // สร้าง URL ที่ถูกต้องเสมอ
  const url = isAbs(input) ? String(input) : join(BASE_URL, input);

  // แนบ header
  const baseHeaders = {
    ...NGROK_HDR,
    ...getAuthHeader(), // => { Authorization: 'Bearer ...' } ถ้ามี
    ...(init.headers || {}),
  };

  const doFetch = (headersObj) =>
    fetch(url, {
      ...init,
      headers: headersObj,
      credentials: init.credentials ?? "include", // เผื่อ refresh ใช้คุกกี้
    });

  let res = await doFetch(baseHeaders);

  // ถ้า 401 → refresh แล้ว retry 1 ครั้ง
  if (res.status === 401) {
    const ok = await refreshAccessToken?.();
    if (!ok) {
      clearAuth?.();
      throw new Error("HTTP 401: Unauthorized");
    }
    const { getAuthHeader: getHdr2 } = useAuthStore.getState();
    const headers2 = { ...NGROK_HDR, ...getHdr2(), ...(init.headers || {}) };
    res = await doFetch(headers2);
  }

  return res;
}

export async function fjson(pathOrUrl, init) {
  const res = await authedFetch(pathOrUrl, init);
  if (!res.ok) {
    let msg;
    try {
      msg = (await res.json())?.detail;
    } catch {
      msg = await res.text();
    }
    throw new Error(`HTTP ${res.status}: ${msg || "Unknown error"}`);
  }
  try {
    return await res.json();
  } catch {
    return null;
  }
}
