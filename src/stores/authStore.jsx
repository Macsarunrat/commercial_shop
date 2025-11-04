import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { jwtDecode } from "jwt-decode"; // 👈 We need this to read the token

// Helper function for devtools (same as in cartStore)
const withDevtools = (fn) =>
  typeof window !== "undefined" ? devtools(fn, { name: "auth-store" }) : fn;

export const useAuthStore = create(
  persist(
    withDevtools((set, get) => ({
      // --- STATE ---
      token: null, // This will hold the raw JWT string
      user: null, // This will hold the decoded user info (e.g., { sub: "customer1", exp: ... })

      // --- ACTIONS ---
      /**
       * (Called by Login page)
       * Saves the token to state and localStorage.
       * Decodes the token to save user info.
       */
      setToken: (tokenString) => {
        try {
          // 1. Decode the token to get user info and expiration
          const decodedUser = jwtDecode(tokenString);

          // 2. Save both the raw token and the decoded user
          set({
            token: tokenString,
            user: decodedUser,
          });

          console.log("AuthStore: Token set, user is:", decodedUser);
        } catch (error) {
          console.error("AuthStore: Failed to decode token", error);
          // If decoding fails, clear auth state
          get().clearAuth();
        }
      },

      /**
       * (Called by Logout button)
       * Clears the token and user info from state and localStorage.
       */
      clearAuth: () => {
        set({
          token: null,
          user: null,
        });
        console.log("AuthStore: Auth cleared (Logged out).");
      },

      // --- SELECTORS (Helpers) ---
      /**
       * Returns the raw token string (e.g., "eyJhbGci...")
       */
      getToken: () => get().token,

      /**
       * Returns the decoded user object (e.g., { sub: "customer1", ... })
       */
      getUser: () => get().user,

      /**
       * Returns true/false if the user is currently logged in (has a token).
       */
      isAuthenticated: () => !!get().token,
    })),
    {
      // --- PERSIST (localStorage) SETTINGS ---
      name: "auth.state", // Key name in localStorage

      // We only want to save the token and user info, not the functions
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);
