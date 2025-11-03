// src/stores/cartStore.js
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

const withDevtools = (fn) =>
  typeof window !== "undefined" ? devtools(fn, { name: "cart-store" }) : fn;

// ✅ ใช้ named export เพื่อลดสับสน (แนะนำ)
export const useCartStore = create(
  persist(
    withDevtools((set, get) => ({
      items: [], // [{id, name, price, stock, image, qty}]

      // Selectors
      cartCount: () => get().items.reduce((n, it) => n + (it.qty || 0), 0),
      cartTotal: () =>
        get().items.reduce(
          (sum, it) => sum + (it.price || 0) * (it.qty || 0),
          0
        ),

      // Actions
      addItem: (product, qty = 1) =>
        set((state) => {
          const idx = state.items.findIndex(
            (p) => String(p.id) === String(product.id)
          );
          if (idx === -1) {
            return { items: [...state.items, { ...product, qty }] };
          } else {
            const cur = state.items[idx];
            const nextQty = Math.min(
              (cur.qty || 0) + qty,
              product.stock ?? Infinity
            );
            const next = state.items.slice();
            next[idx] = { ...cur, qty: nextQty };
            return { items: next };
          }
        }),

      setItemQty: (id, qty) =>
        set((state) => {
          const i = state.items.findIndex((p) => String(p.id) === String(id));
          if (i === -1) return {};
          if (qty <= 0) {
            return { items: state.items.filter((_, idx) => idx !== i) };
          }
          const next = state.items.slice();
          next[i] = { ...next[i], qty };
          return { items: next };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((p) => String(p.id) !== String(id)),
        })),

      clearCart: () => set({ items: [] }),
    })),
    {
      name: "cart.items", // key ใน localStorage
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// (ถ้าอยากมี default export ด้วยก็ได้ แต่ไม่จำเป็น)
// export default useCartStore;
