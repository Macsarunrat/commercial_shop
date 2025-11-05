// import { create } from "zustand";
// import { persist, devtools } from "zustand/middleware";
// import { jwtDecode } from "jwt-decode"; // 👈 We need this to read the token

// // Helper function for devtools (same as in cartStore)
// const withDevtools = (fn) =>
//   typeof window !== "undefined" ? devtools(fn, { name: "auth-store" }) : fn;

// export const useAuthStore = create(
//   persist(
//     withDevtools((set, get) => ({
//       // --- STATE ---
//       token: null, // This will hold the raw JWT string
//       user: null, // This will hold the decoded user info (e.g., { sub: "customer1", exp: ... })

//       setToken: (tokenString) => {
//         try {
//           // 1. Decode the token to get user info and expiration
//           const decodedUser = jwtDecode(tokenString);

//           // 2. Save both the raw token and the decoded user
//           set({
//             token: tokenString,
//             user: decodedUser,
//           });

//           console.log("AuthStore: Token set, user is:", decodedUser);
//         } catch (error) {
//           console.error("AuthStore: Failed to decode token", error);
//           // If decoding fails, clear auth state
//           get().clearAuth();
//         }
//       },

//       /**
//        * (Called by Logout button)
//        * Clears the token and user info from state and localStorage.
//        */
//       clearAuth: () => {
//         set({
//           token: null,
//           user: null,
//         });
//         console.log("AuthStore: Auth cleared (Logged out).");
//       },

//       // --- SELECTORS (Helpers) ---
//       /**
//        * Returns the raw token string (e.g., "eyJhbGci...")
//        */
//       getToken: () => get().token,

//       /**
//        * Returns the decoded user object (e.g., { sub: "customer1", ... })
//        */
//       getUser: () => get().user,

//       /**
//        * Returns true/false if the user is currently logged in (has a token).
//        */
//       isAuthenticated: () => !!get().token,
//     })),
//     {
//       // --- PERSIST (localStorage) SETTINGS ---
//       name: "auth.state", // Key name in localStorage

//       // We only want to save the token and user info, not the functions
//       partialize: (state) => ({
//         token: state.token,
//         user: state.user,
//       }),
//     }
//   )
// );

import { create } from "zustand";
import { persist, devtools, createJSONStorage } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";

const BASE_URL = "https://great-lobster-rightly.ngrok-free.app";
const NGROK_HDR = { "ngrok-skip-browser-warning": "true" };

// ต่ออายุล่วงหน้าก่อนหมดจริงกี่วินาที
const REFRESH_SKEW_SEC = 30;

const withDevtools = (fn) =>
  typeof window !== "undefined" ? devtools(fn, { name: "auth-store" }) : fn;

export const useAuthStore = create(
  persist(
    withDevtools((set, get) => ({
      // --- STATE ---
      token: null, // raw JWT
      user: null, // decoded payload
      expiresAt: null, // unix seconds (จาก jwt exp)
      needsRefreshBanner: false, // แสดงแบนเนอร์เตือนใกล้หมดอายุ
      lastError: null,
      _expiryTimerId: null, // internal

      // --- ACTIONS ---
      setToken: (tokenString) => {
        try {
          const decoded = jwtDecode(tokenString);
          const expSec = Number(decoded?.exp || 0);
          set({
            token: tokenString,
            user: decoded,
            expiresAt: expSec || null,
            lastError: null,
          });
          get()._scheduleExpiryWatch();
          // เคลียร์แบนเนอร์เมื่อได้โทเคนใหม่
          set({ needsRefreshBanner: false });
        } catch (e) {
          console.error("AuthStore: decode token failed", e);
          get().clearAuth();
        }
      },

      clearAuth: () => {
        const t = get()._expiryTimerId;
        if (t) clearTimeout(t);
        set({
          token: null,
          user: null,
          expiresAt: null,
          needsRefreshBanner: false,
          lastError: null,
          _expiryTimerId: null,
        });
      },

      // เรียกจาก fetcher/ตัวเฝ้าเวลา เพื่อขอโทเคนใหม่
      refreshAccessToken: async () => {
        try {
          const res = await fetch(`${BASE_URL}/users/refresh`, {
            method: "POST",
            headers: { ...NGROK_HDR },
            credentials: "include", // สำคัญ: เพื่อส่ง refresh cookie
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json().catch(() => ({}));
          if (!data?.access_token) throw new Error("No access_token");
          get().setToken(data.access_token);
          return true;
        } catch (err) {
          console.warn("AuthStore: refresh failed", err);
          set({ lastError: "Session expired" });
          get().clearAuth();
          return false;
        }
      },

      // ตั้งนาฬิกา: ใกล้หมดอายุ => แสดงแบนเนอร์, ถึงเวลา => พยายามรีเฟรช
      _scheduleExpiryWatch: () => {
        const old = get()._expiryTimerId;
        if (old) clearTimeout(old);

        const exp = get().expiresAt;
        if (!exp) return;

        const now = Math.floor(Date.now() / 1000);
        const secLeft = exp - now;

        if (secLeft <= 0) {
          // หมดแล้ว → ลองรีเฟรชทันที
          get().refreshAccessToken();
          return;
        }

        // แสดงแบนเนอร์ล่วงหน้า
        const bannerAtMs = Math.max((secLeft - REFRESH_SKEW_SEC) * 1000, 0);
        const id = setTimeout(() => {
          // เตือนว่าใกล้หมด (แต่เราจะรีเฟรชให้อัตโนมัติอีกนิด)
          set({ needsRefreshBanner: true });

          // ตั้งนาฬิกาอีกลูกสำหรับเวลาหมดจริง → refresh
          const now2 = Math.floor(Date.now() / 1000);
          const secLeft2 = exp - now2;
          const doAtMs = Math.max(secLeft2 * 1000, 0);

          const id2 = setTimeout(async () => {
            const ok = await get().refreshAccessToken();
            if (!ok) {
              // เคลียร์ + ปล่อยให้ fetcher/route guard พาไป login
            }
          }, doAtMs);
          set({ _expiryTimerId: id2 });
        }, bannerAtMs);

        set({ _expiryTimerId: id });
      },

      // --- SELECTORS ---
      getToken: () => get().token,
      getUser: () => get().user,
      isAuthenticated: () => !!get().token,
      getAuthHeader: () => {
        const t = get().token;
        return t ? { Authorization: `Bearer ${t}` } : {};
      },
    })),
    {
      name: "auth.state",
      // เก็บใน sessionStorage จะปลอดภัยกว่านิดหน่อย (ปิดแท็บแล้วหาย)
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        token: s.token,
        user: s.user,
        expiresAt: s.expiresAt,
      }),
      // เมื่อ hydrate จาก storage เสร็จ → ตรวจ exp แล้วตั้งนาฬิกา
      onRehydrateStorage: () => (state) => {
        // delay ให้ state โหลดเสร็จก่อนค่อยตรวจ
        setTimeout(() => {
          const exp = state?.expiresAt;
          if (!exp) return;
          const now = Math.floor(Date.now() / 1000);
          if (exp <= now) {
            state?.clearAuth?.();
            return;
          }
          state?._scheduleExpiryWatch?.();
        }, 0);
      },
    }
  )
);
