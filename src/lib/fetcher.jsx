import { useAuthStore } from "../stores/authStore";

const BASE_URL = "https://great-lobster-rightly.ngrok-free.app";
const NGROK_HDR = { "ngrok-skip-browser-warning": "true" };

/**
 * เรียก API แบบมีแนบ Bearer token อัตโนมัติ
 * ถ้าโดน 401 จะลอง refresh token + retry อีกรอบ
 */
export async function authedFetch(input, init = {}) {
  const { getAuthHeader, refreshAccessToken, clearAuth } =
    useAuthStore.getState();

  // สร้าง headers
  const headers = {
    ...(init.headers || {}),
    ...NGROK_HDR,
    ...getAuthHeader(),
  };

  const doFetch = async () =>
    fetch(typeof input === "string" ? input : `${BASE_URL}${input}`, {
      ...init,
      headers,
      credentials: init.credentials ?? "include", // คงไว้สำหรับ refresh cookie
    });

  let res = await doFetch();

  // ถ้า 401 → ลองรีเฟรช + รีไทรอีก 1 ครั้ง
  if (res.status === 401) {
    const ok = await refreshAccessToken();
    if (!ok) {
      clearAuth();
      throw new Error("HTTP 401: Unauthorized");
    }

    // ได้โทเคนใหม่ → อัปเดตเฮดเดอร์แล้ว retry
    const { getAuthHeader: getHdr2 } = useAuthStore.getState();
    const headers2 = { ...(init.headers || {}), ...NGROK_HDR, ...getHdr2() };
    res = await fetch(
      typeof input === "string" ? input : `${BASE_URL}${input}`,
      {
        ...init,
        headers: headers2,
        credentials: init.credentials ?? "include",
      }
    );
  }

  return res;
}

/** ช่วย parse JSON + โยน error ข้อความสวยๆ */
export async function fjson(path, init) {
  const res = await authedFetch(path, init);
  if (!res.ok) {
    let msg;
    try {
      const j = await res.json();
      msg = j?.detail || JSON.stringify(j);
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
