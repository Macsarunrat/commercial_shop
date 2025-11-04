import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { jwtDecode } from "jwt-decode"; 

const withDevtools = (fn) =>
  typeof window !== "undefined" ? devtools(fn, { name: "auth-store" }) : fn;

export const useAuthStore = create(
  persist(
    withDevtools((set, get) => ({
      // --- STATE ---
      token: null,
      user: null,

      // --- ACTIONS ---
      setToken: (tokenString) => {
        try {
          const decodedUser = jwtDecode(tokenString);
          set({
            token: tokenString,
            user: decodedUser,
          });
          console.log("AuthStore: Token set, user is:", decodedUser);
        } catch (error) {
          console.error("AuthStore: Failed to decode token", error);
          // (แก้ไข: เรียก set() โดยตรง)
          set({ token: null, user: null });
        }
      },

      clearAuth: () => {
        set({
          token: null,
          user: null,
        });
        console.log("AuthStore: Auth cleared (Logged out).");
      },

      // --- (ลบ Selectors ออกจาก State) ---
      // getToken: () => get().token,
      // getUser: () => get().user,
      // isAuthenticated: () => !!get().token,
    })),
    {
      name: "auth.state",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);
